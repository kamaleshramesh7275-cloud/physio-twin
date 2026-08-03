from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any
import datetime

from database import engine, get_db, Base
import models
from mock_sensor import SyntheticSensorGenerator
from analytics import compute_capability_profile, generate_weekly_letter, generate_deep_insights

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
        
    return AnalyticsDashboardResponse(
        mobility=profile.mobility,
        stability=profile.stability,
        quality=profile.movement_quality,
        cardio=profile.cardiovascular_efficiency,
        recovery=profile.recovery,
        reserve=profile.capability_reserve,
        confidence=profile.confidence,
        change_point_alert=alert
    )

@app.post("/analytics/weekly-letter/{user_id}")
def get_weekly_letter(user_id: str, payload: dict, db: Session = Depends(get_db)):
    api_key = payload.get("api_key")
    if not api_key:
        raise HTTPException(status_code=400, detail="Missing API Key")
    letter = generate_weekly_letter(user_id, db, api_key)
    return {"letter": letter}

@app.post("/analytics/deep-insights/{user_id}")
def get_deep_insights(user_id: str, payload: dict, db: Session = Depends(get_db)):
    api_key = payload.get("api_key")
    if not api_key:
        raise HTTPException(status_code=400, detail="Missing API Key")
    insights = generate_deep_insights(user_id, db, api_key)
    return {"insights": insights}

