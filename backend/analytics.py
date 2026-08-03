import os
from sqlalchemy.orm import Session
from groq import Groq
import models
import statistics
import datetime

# Mock capability scoring algorithm
def compute_capability_profile(user_id: str, db: Session):
    # In a real system, this would query vision_sessions and sensor_sessions
    # Here we generate mock scores that shift slightly based on history length to simulate real baseline calculation
    
    session_count = db.query(models.VisionSession).filter(models.VisionSession.user_id == user_id).count()
    
    # Base values
    mobility = 85.0
    stability = 70.0
    quality = 92.0
    cardio = 78.0
    recovery = 88.0
    
    # Simulate a deterioration in stability if session count > 3 for demo purposes
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
        # Generate a mock change point
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

def generate_weekly_letter(user_id: str, db: Session, api_key: str):
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
        client = Groq(api_key=api_key)
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
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
