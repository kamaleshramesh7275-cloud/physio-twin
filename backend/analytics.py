import os
from sqlalchemy.orm import Session
from groq import Groq
import models
import statistics
import datetime

# Hardcoded API key as requested, secured on backend environment
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")

# Mock capability scoring algorithm
def compute_capability_profile(user_id: str, db: Session):
    session_count = db.query(models.VisionSession).filter(models.VisionSession.user_id == user_id).count()
    
    # Base values
    mobility = 85.0
    stability = 70.0
    quality = 92.0
    cardio = 78.0
    recovery = 88.0
    
    if session_count >= 3:
        stability -= 15.0  
        
    profile = models.CapabilityProfile(
        user_id=user_id,
        mobility=mobility,
        stability=stability,
        movement_quality=quality,
        cardiovascular_efficiency=cardio,
        recovery=recovery,
        capability_reserve=55.0,
        confidence="High" if session_count >= 3 else "Low"
    )
    db.add(profile)
    
    if session_count >= 3:
        cp = models.ChangePoint(
            user_id=user_id,
            metric_name="stability",
            session_id="latest",
            classification="persistent",
            magnitude=-15.0
        )
        db.add(cp)
        
    db.commit()
    db.refresh(profile)
    return profile

def generate_weekly_letter(user_id: str, db: Session):
    profile = db.query(models.CapabilityProfile).filter(models.CapabilityProfile.user_id == user_id).order_by(models.CapabilityProfile.timestamp.desc()).first()
    
    if not profile:
        return "Not enough data to generate a weekly letter. Keep logging sessions!"

    prompt = f"""
    You are PhysioTwin, a friendly, concise, and highly analytical digital twin of the user's physical capability. 
    Write a short weekly summary (2-3 paragraphs max) based on the user's latest data.
    Do NOT give medical advice or diagnose anything. Use a clinical-precision but supportive tone.
    
    Latest Stats:
    Mobility: {profile.mobility}
    Stability: {profile.stability}
    Movement Quality: {profile.movement_quality}
    Cardio Efficiency: {profile.cardiovascular_efficiency}
    Recovery: {profile.recovery}
    
    If stability is below 60, mention that we've noticed a persistent deterioration in stability over the last few sessions, likely driven by postural sway, and suggest focusing on ankle mobility.
    """

    try:
        client = Groq(api_key=GROQ_API_KEY)
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=300
        )
        content = chat_completion.choices[0].message.content
        
        note = models.TwinNote(
            user_id=user_id,
            type="weekly_letter",
            content=content
        )
        db.add(note)
        db.commit()
        return content
    except Exception as e:
        print(f"LLM Error: {e}")
        return "Your digital twin is currently analyzing your data. Check back later for your weekly summary."

def generate_deep_insights(user_id: str, db: Session):
    sessions = db.query(models.VisionSession).filter(models.VisionSession.user_id == user_id).order_by(models.VisionSession.timestamp.desc()).limit(10).all()
    
    if not sessions:
        return "No session history found. Please record a Capture session first to get deep insights."

    history_text = "\n".join([f"Date: {s.timestamp.strftime('%Y-%m-%d')}, ROM: {s.rom} degrees, Symmetry: {s.symmetry}, Speed: {s.movement_speed} reps/min" for s in sessions])

    prompt = f"""
    You are PhysioTwin, an expert biomechanics AI. Analyze the user's recent Sit-to-Stand movement history and provide a "Deep Insight" report.
    Do NOT give medical advice. Speak directly to the user as their Digital Twin. Use markdown formatting with bolding and bullet points.

    Here is the data from their last 10 sessions:
    {history_text}

    Structure your response into:
    1. **Kinematic Trend Analysis** (What is happening to their ROM and symmetry over time?)
    2. **Biomechanical Breakdown** (What do these numbers mean for their real-world movement?)
    3. **Actionable Focus Areas** (Suggest 2 specific things to focus on during their next session based on the data).
    """

    try:
        client = Groq(api_key=GROQ_API_KEY)
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.4,
            max_tokens=600
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"LLM Error: {e}")
        return f"Error connecting to AI: {str(e)}"

class MessageInput:
    role: str
    content: str

def chat_with_twin(user_id: str, messages_history: list[dict], db: Session):
    profile = db.query(models.CapabilityProfile).filter(models.CapabilityProfile.user_id == user_id).order_by(models.CapabilityProfile.timestamp.desc()).first()
    
    stats = "No data yet."
    if profile:
        stats = f"Mobility: {profile.mobility}, Stability: {profile.stability}, Quality: {profile.movement_quality}, Cardio: {profile.cardiovascular_efficiency}, Recovery: {profile.recovery}, Reserve: {profile.capability_reserve}"
        
    system_prompt = f"""
    You are PhysioTwin, a friendly, concise, and highly analytical digital twin of the user's physical capability.
    The user is chatting with you. You should answer their questions based on their latest data.
    Do NOT give medical advice. Speak directly to the user.
    
    User's Latest Stats:
    {stats}
    """
    
    # Prepend system prompt to the messages
    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages_history:
        api_messages.append({"role": msg["role"], "content": msg["content"]})
        
    try:
        client = Groq(api_key=GROQ_API_KEY)
        chat_completion = client.chat.completions.create(
            messages=api_messages,
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=300
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"LLM Error: {e}")
        return f"Twin is offline. Error: {str(e)}"

def simulate_activity(user_id: str, activity_type: str, duration_mins: int, intensity: str, db: Session):
    # Fetch current profile
    profile = db.query(models.CapabilityProfile).filter(models.CapabilityProfile.user_id == user_id).order_by(models.CapabilityProfile.timestamp.desc()).first()
    
    if not profile:
        return {"error": "No baseline profile available for simulation."}
        
    # Heuristics based on activity
    cost = 0
    if activity_type.lower() == "running":
        cost = duration_mins * (0.5 if intensity == "Light" else 1.2 if intensity == "Hard" else 0.8)
    elif activity_type.lower() == "weightlifting":
        cost = duration_mins * (0.4 if intensity == "Light" else 1.0 if intensity == "Hard" else 0.7)
    elif activity_type.lower() == "yoga":
        cost = duration_mins * 0.2
    else:
        cost = duration_mins * 0.5
        
    new_reserve = max(0.0, profile.capability_reserve - cost)
    new_recovery = max(0.0, profile.recovery - (cost * 0.5))
    
    # We don't save to DB because it's a "What-If" simulation
    return {
        "original": {
            "reserve": profile.capability_reserve,
            "recovery": profile.recovery
        },
        "simulated": {
            "reserve": round(new_reserve, 1),
            "recovery": round(new_recovery, 1)
        },
        "cost": round(cost, 1)
    }

