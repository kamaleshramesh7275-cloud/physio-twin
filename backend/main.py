from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any
import datetime

from database import engine, get_db, Base
import models
from mock_sensor import SyntheticSensorGenerator
from analytics import compute_capability_profile, generate_weekly_letter, generate_deep_insights, chat_with_twin, simulate_activity

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PhysioTwin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class UserCreate(BaseModel):
    user_id: str
    email: str
    age: Optional[int] = None
    sex: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    mode: str = "General Human"
    goals: Optional[str] = None
    consent: bool = False

class SensorDataResponse(BaseModel):
    timestamp: int
    heart_rate: float
    spo2: float
    temperature: float
    accel_x: float
    accel_y: float
    accel_z: float
    source: str
class VisionSessionCreate(BaseModel):
    user_id: str
    task_type: str
    pose_landmarks_json: str
    joint_angles_json: str
    rom: float
    movement_speed: float
    symmetry: float
    stability: float
    camera_quality: str

class AnalyticsDashboardResponse(BaseModel):
    mobility: float
    stability: float
    quality: float
    cardio: float
    recovery: float
    reserve: float
    confidence: str
    change_point_alert: Optional[str] = None
    zone_risks: Optional[Any] = None
    trend_data: Optional[Any] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class SimulationRequest(BaseModel):
    activity_type: str
    duration_mins: int
    intensity: str

generator = SyntheticSensorGenerator()

@app.get("/")
def read_root():
    return {"message": "PhysioTwin API is running"}

@app.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.user_id == user.user_id).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    new_user = models.User(
        user_id=user.user_id,
        email=user.email,
        age=user.age,
        sex=user.sex,
        height=user.height,
        weight=user.weight,
        mode=user.mode,
        goals=user.goals,
        consent=user.consent
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/sensors/synthetic", response_model=SensorDataResponse)
def get_synthetic_sensor_data(exertion: float = 0.0):
    """
    Fetch a single frame of simulated sensor data based on exertion level (0.0 to 1.0)
    """
    data = generator.generate(exertion)
    return data

class SyncFitRequest(BaseModel):
    fit_data: dict
    base_risk: dict

@app.post("/analytics/dynamic-risk")
def calculate_dynamic_risk(req: SyncFitRequest):
    updated_risk = req.base_risk.copy()
    fit_data = req.fit_data
    
    workouts = fit_data.get("workouts", [])
    nutrition = fit_data.get("nutrition", {})
    
    has_heavy_legs = any(
        "Leg Day" in w.get("name", "") and w.get("load") == "High" 
        for w in workouts
    )
    has_low_protein = "Low" in nutrition.get("protein", "")
    
    if has_heavy_legs and has_low_protein:
        updated_risk["lumbar"] = min(100, updated_risk.get("lumbar", 0) + 35)
        updated_risk["left_knee"] = min(100, updated_risk.get("left_knee", 0) + 25)
        updated_risk["right_knee"] = min(100, updated_risk.get("right_knee", 0) + 30)
        updated_risk["left_thigh"] = min(100, updated_risk.get("left_thigh", 0) + 15)
        
    return updated_risk

class SyncExternalAppsRequest(BaseModel):
    workouts: list
    nutrition: dict

@app.post("/analytics/external-apps/{user_id}")
def sync_external_apps(user_id: str, req: SyncExternalAppsRequest, db: Session = Depends(get_db)):
    import json
    # Clear old entries for demo purposes to avoid infinite DB growth
    db.query(models.ExternalAppSession).filter(models.ExternalAppSession.user_id == user_id).delete()
    
    entries = []
    if req.workouts:
        entries.append(
            models.ExternalAppSession(
                user_id=user_id,
                app_name="Hevy",
                session_data=json.dumps({"workouts": req.workouts})
            )
        )
    if req.nutrition:
        entries.append(
            models.ExternalAppSession(
                user_id=user_id,
                app_name="HealthifyMe",
                session_data=json.dumps({"nutrition": req.nutrition})
            )
        )
    if entries:
        db.bulk_save_objects(entries)
        db.commit()
    return {"status": "synced", "count": len(entries)}

@app.post("/sessions/vision")
def ingest_vision_session(session: VisionSessionCreate, db: Session = Depends(get_db)):
    new_session = models.VisionSession(
        user_id=session.user_id,
        task_type=session.task_type,
        pose_landmarks_json=session.pose_landmarks_json,
        joint_angles_json=session.joint_angles_json,
        rom=session.rom,
        movement_speed=session.movement_speed,
        symmetry=session.symmetry,
        stability=session.stability,
        camera_quality=session.camera_quality
    )
    db.add(new_session)
    db.commit()
    
    # Compute profile right after a session is added
    compute_capability_profile(session.user_id, db)
    
    return {"message": "Vision session logged and profile updated"}

@app.get("/sessions/history/{user_id}")
def get_session_history(user_id: str, db: Session = Depends(get_db)):
    sessions = db.query(models.VisionSession).filter(models.VisionSession.user_id == user_id).order_by(models.VisionSession.timestamp.desc()).all()
    return [{
        "id": s.id,
        "timestamp": s.timestamp.isoformat(),
        "task_type": s.task_type,
        "rom": s.rom,
        "movement_speed": s.movement_speed,
        "symmetry": s.symmetry,
        "stability": s.stability
    } for s in sessions]

@app.get("/analytics/dashboard/{user_id}", response_model=AnalyticsDashboardResponse)
def get_dashboard(user_id: str, db: Session = Depends(get_db)):
    profile = db.query(models.CapabilityProfile).filter(models.CapabilityProfile.user_id == user_id).order_by(models.CapabilityProfile.timestamp.desc()).first()
    if not profile:
        return AnalyticsDashboardResponse(
            mobility=50, stability=50, quality=50, cardio=50, recovery=50, reserve=50, confidence="Low"
        )
    
    cp = db.query(models.ChangePoint).filter(models.ChangePoint.user_id == user_id).order_by(models.ChangePoint.detected_at.desc()).first()
    alert = None
    if cp:
        alert = f"Deterioration detected in {cp.metric_name} over last 3 sessions."
        
    import json
    
    # Provide default fallback for zone risks and trend data if the profile lacks them
    default_zone_risks = {
        "left_knee": 72,
        "right_knee": 25,
        "lumbar": 48,
        "cervical": 65,
        "left_shoulder": 20,
        "right_shoulder": 15,
        "left_ankle": 55,
        "right_ankle": 30,
        "left_hip": 18,
        "right_hip": 22
    }
    
    default_trend_data = [
        {"name": "W1", "mobility": 74, "stability": 72, "quality": 85, "cardio": 70},
        {"name": "W2", "mobility": 76, "stability": 70, "quality": 86, "cardio": 72},
        {"name": "W3", "mobility": 78, "stability": 68, "quality": 88, "cardio": 74},
        {"name": "W4", "mobility": 80, "stability": 66, "quality": 90, "cardio": 76},
        {"name": "W5", "mobility": 82, "stability": 65, "quality": 91, "cardio": 77},
        {"name": "W6", "mobility": 84, "stability": 63, "quality": 92, "cardio": 78},
        {"name": "W7", "mobility": 86, "stability": 62, "quality": 93, "cardio": 79},
        {"name": "W8", "mobility": 88, "stability": 64, "quality": 93, "cardio": 79}
    ]

    return AnalyticsDashboardResponse(
        mobility=profile.mobility,
        stability=profile.stability,
        quality=profile.movement_quality,
        cardio=profile.cardiovascular_efficiency,
        recovery=profile.recovery,
        reserve=profile.capability_reserve,
        confidence=profile.confidence,
        change_point_alert=alert,
        zone_risks=json.loads(profile.zone_risks) if profile.zone_risks else default_zone_risks,
        trend_data=json.loads(profile.trend_data) if profile.trend_data else default_trend_data
    )

@app.post("/analytics/weekly-letter/{user_id}")
def get_weekly_letter(user_id: str, db: Session = Depends(get_db)):
    letter = generate_weekly_letter(user_id, db)
    return {"letter": letter}

@app.post("/analytics/deep-insights/{user_id}")
def get_deep_insights(user_id: str, db: Session = Depends(get_db)):
    insights = generate_deep_insights(user_id, db)
    return {"insights": insights}

@app.post("/analytics/chat/{user_id}")
def api_chat_with_twin(user_id: str, req: ChatRequest, db: Session = Depends(get_db)):
    messages_dict = [{"role": msg.role, "content": msg.content} for msg in req.messages]
    response = chat_with_twin(user_id, messages_dict, db)
    return {"response": response}

@app.post("/analytics/simulate/{user_id}")
def api_simulate_activity(user_id: str, req: SimulationRequest, db: Session = Depends(get_db)):
    result = simulate_activity(user_id, req.activity_type, req.duration_mins, req.intensity, db)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/analytics/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    # If leaderboard is empty, seed it with some realistic default data
    entries = db.query(models.LeaderboardEntry).order_by(models.LeaderboardEntry.score.desc()).all()
    if not entries:
        seed_data = [
            models.LeaderboardEntry(username="AlexChen", score=940, rank_change=1),
            models.LeaderboardEntry(username="SarahJ", score=890, rank_change=0),
            models.LeaderboardEntry(username="MikeT", score=865, rank_change=-1),
            models.LeaderboardEntry(username="EmmaW", score=840, rank_change=2),
            models.LeaderboardEntry(username="ChrisP", score=810, rank_change=0)
        ]
        db.bulk_save_objects(seed_data)
        db.commit()
        entries = db.query(models.LeaderboardEntry).order_by(models.LeaderboardEntry.score.desc()).all()
        
    return [{"username": e.username, "score": e.score, "rank_change": e.rank_change} for e in entries]

@app.get("/analytics/external-apps/{user_id}")
def get_external_apps(user_id: str, db: Session = Depends(get_db)):
    import json
    entries = db.query(models.ExternalAppSession).filter(models.ExternalAppSession.user_id == user_id).order_by(models.ExternalAppSession.timestamp.desc()).all()
    if not entries:
        # Seed realistic external app data to simulate the webhook
        seed_data = [
            models.ExternalAppSession(user_id=user_id, app_name="Hevy", session_data=json.dumps({
                "workouts": [{"app": "Hevy", "name": "Leg Day (Heavy)", "load": "High", "affectedZones": ["left_knee", "right_knee", "lumbar"]}]
            })),
            models.ExternalAppSession(user_id=user_id, app_name="HealthifyMe", session_data=json.dumps({
                "nutrition": {"app": "HealthifyMe", "status": "Caloric Deficit", "protein": "Low (70g/150g)", "hydration": "Optimal"}
            }))
        ]
        db.bulk_save_objects(seed_data)
        db.commit()
        entries = db.query(models.ExternalAppSession).filter(models.ExternalAppSession.user_id == user_id).order_by(models.ExternalAppSession.timestamp.desc()).all()
        
    return [
        {"app_name": e.app_name, "session_data": json.loads(e.session_data), "timestamp": e.timestamp.isoformat()} 
        for e in entries
    ]
