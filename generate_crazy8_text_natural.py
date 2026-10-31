import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import random

random.seed(123)

DOWNLOADS_DIR = r"C:\Users\kamal\Downloads"
REPORT_ASSETS_DIR = r"c:\projects\physio-twin\report_assets"
ART_DIR = r"C:\Users\kamal\.gemini\antigravity-ide\brain\13225840-8a35-4e66-ae7f-3d75b1e35742"

W, H = 1600, 1120

# Create realistic white paper background with subtle paper texture
paper_bg = np.ones((H, W, 3), dtype=np.uint8) * 253
noise = np.random.normal(0, 1.8, (H, W, 3))
paper = np.clip(paper_bg.astype(float) + noise, 244, 255).astype(np.uint8)

im = Image.fromarray(paper).convert("RGBA")
draw = ImageDraw.Draw(im)

# Authentic ballpoint pen colors
PEN_BLUE = (35, 68, 142, 245)      # Primary blue ballpoint
PEN_DARK = (20, 42, 100, 250)      # Slightly darker pressure / borders
TITLE_BLACK = (22, 22, 28, 255)    # Printed title font

# Handwriting fonts
font_title = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 28)
font_hdr_team = ImageFont.truetype(r"C:\Windows\Fonts\Inkfree.ttf", 23)
font_box_title = ImageFont.truetype(r"C:\Windows\Fonts\Inkfree.ttf", 22)
font_body = ImageFont.truetype(r"C:\Windows\Fonts\Inkfree.ttf", 16)
font_bold_body = ImageFont.truetype(r"C:\Windows\Fonts\Inkfree.ttf", 17)
font_bottom_note = ImageFont.truetype(r"C:\Windows\Fonts\Inkfree.ttf", 15)

def hand_line(x0, y0, x1, y1, color=PEN_DARK, width=2):
    dist = int(np.hypot(x1 - x0, y1 - y0))
    steps = max(2, dist // 10)
    xs = np.linspace(x0, x1, steps)
    ys = np.linspace(y0, y1, steps)
    points = []
    for x, y in zip(xs, ys):
        jx = random.uniform(-0.6, 0.6)
        jy = random.uniform(-0.6, 0.6)
        points.append((x + jx, y + jy))
    draw.line(points, fill=color, width=width)

def hand_rect(x0, y0, x1, y1, color=PEN_DARK, width=2):
    hand_line(x0, y0, x1, y0, color, width)
    hand_line(x1, y0, x1, y1, color, width)
    hand_line(x1, y1, x0, y1, color, width)
    hand_line(x0, y1, x0, y0, color, width)

def hand_arrow(x0, y0, x1, y1, color=PEN_DARK, width=2):
    hand_line(x0, y0, x1, y1, color, width)
    ang = np.arctan2(y1 - y0, x1 - x0)
    arr_len = 10
    a1 = ang + np.pi * 0.82
    a2 = ang - np.pi * 0.82
    hand_line(x1, y1, x1 + arr_len * np.cos(a1), y1 + arr_len * np.sin(a1), color, width)
    hand_line(x1, y1, x1 + arr_len * np.cos(a2), y1 + arr_len * np.sin(a2), color, width)

def write_natural(text, x, y, font=font_body, color=PEN_BLUE):
    jx = random.uniform(-0.5, 0.5)
    jy = random.uniform(-0.5, 0.5)
    draw.text((x + jx, y + jy), text, fill=color, font=font)

# 1. PRINTED TITLE AT TOP
draw.text((W // 2, 45), "Crazy 8s - Design Ideation Sketching Method", fill=TITLE_BLACK, font=font_title, anchor="mm")

# 2. TEAM CREDENTIALS IN TOP RIGHT
write_natural("pro caffeinators", 1250, 18, font_hdr_team, PEN_DARK)
write_natural("25AD087 - KAMALESH KUMAR .R", 1170, 44, font_hdr_team, PEN_DARK)
write_natural("Date: 27/10/2026", 1330, 70, font_bottom_note, PEN_BLUE)

# 8 Card Boxes geometry
box_coords = {
    1: (65, 115, 415, 525),
    2: (440, 110, 775, 525),
    3: (800, 100, 1140, 525),
    4: (1165, 95, 1535, 525),
    8: (65, 550, 415, 995),
    7: (440, 550, 775, 1005),
    6: (800, 550, 1140, 1015),
    5: (1165, 550, 1535, 1030)
}

# Draw outer card frames
for b_num, (x0, y0, x1, y1) in box_coords.items():
    hand_rect(x0, y0, x1, y1, PEN_DARK, width=2)

# Connecting arrows
hand_arrow(415, 320, 440, 320, PEN_DARK, width=2)   # 1 -> 2
hand_arrow(775, 320, 800, 320, PEN_DARK, width=2)   # 2 -> 3
hand_arrow(1140, 320, 1165, 320, PEN_DARK, width=2) # 3 -> 4
hand_arrow(1350, 525, 1350, 550, PEN_DARK, width=2) # 4 -> 5
hand_arrow(1165, 780, 1140, 780, PEN_DARK, width=2) # 5 -> 6
hand_arrow(800, 780, 775, 780, PEN_DARK, width=2)   # 6 -> 7
hand_arrow(440, 780, 415, 780, PEN_DARK, width=2)   # 7 -> 8

# ==========================================
# BOX 1: Browser Webcam Pose HUD
# ==========================================
bx0, by0, bx1, by1 = box_coords[1]
write_natural("1. Browser Webcam Pose HUD", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 15, by0 + 38, bx1 - 15, by1 - 65, PEN_DARK, 1)
write_natural("Webcam: Active (720p 30fps)", bx0 + 25, by0 + 46, font_bold_body, PEN_DARK)
hand_line(bx0 + 25, by0 + 70, bx1 - 25, by0 + 70, PEN_DARK, 1)

write_natural("Joint Angles Detected:", bx0 + 25, by0 + 78, font_bold_body, PEN_BLUE)
write_natural("• Knee Flexion: 124 deg", bx0 + 25, by0 + 102, font_body, PEN_DARK)
write_natural("  (Normal Range: 120-135 deg)", bx0 + 35, by0 + 124, font_body, PEN_BLUE)
write_natural("• Hip Joint Angle: 88 deg", bx0 + 25, by0 + 146, font_body, PEN_DARK)
write_natural("• Bilateral Symmetry: 94%", bx0 + 25, by0 + 168, font_body, PEN_DARK)

hand_rect(bx0 + 25, by0 + 198, bx1 - 25, by0 + 236, PEN_DARK, 1)
write_natural("Form Status: [GOOD POSTURE]", bx0 + 35, by0 + 208, font_bold_body, PEN_DARK)

write_natural("Live Audio: 'Keep back straight'", bx0 + 25, by0 + 248, font_body, PEN_BLUE)

write_natural("Real-time MediaPipe pose detection in", bx0 + 15, by1 - 54, font_bottom_note, PEN_DARK)
write_natural("browser without wearable hardware sensors", bx0 + 15, by1 - 34, font_bottom_note, PEN_DARK)

# ==========================================
# BOX 2: 3D Body Heatmap Twin
# ==========================================
bx0, by0, bx1, by1 = box_coords[2]
write_natural("2. 3D Body Heatmap Twin", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 15, by0 + 38, bx1 - 15, by1 - 65, PEN_DARK, 1)
write_natural("Digital Twin Biomechanical Status:", bx0 + 25, by0 + 46, font_bold_body, PEN_DARK)
hand_line(bx0 + 25, by0 + 70, bx1 - 25, by0 + 70, PEN_DARK, 1)

write_natural("Risk Zones by Joint:", bx0 + 25, by0 + 78, font_bold_body, PEN_BLUE)
write_natural("• Right Knee: HIGH RISK", bx0 + 25, by0 + 102, font_body, PEN_DARK)
write_natural("  (Flexion ROM restricted by 18 deg)", bx0 + 35, by0 + 124, font_body, PEN_BLUE)
write_natural("• Lumbar Spine: MODERATE STRAIN", bx0 + 25, by0 + 146, font_body, PEN_DARK)
write_natural("• Left Knee: SAFE (Full Mobility)", bx0 + 25, by0 + 168, font_body, PEN_DARK)
write_natural("• Shoulders: BALANCED (98%)", bx0 + 25, by0 + 190, font_body, PEN_DARK)

hand_rect(bx0 + 25, by0 + 218, bx1 - 25, by0 + 256, PEN_DARK, 1)
write_natural("360 deg Rotate | Zoom Joint Mesh", bx0 + 35, by0 + 228, font_bold_body, PEN_DARK)

write_natural("Interactive 3D anatomical twin highlighting", bx0 + 15, by1 - 54, font_bottom_note, PEN_DARK)
write_natural("high-risk joint zones with color alert levels", bx0 + 15, by1 - 34, font_bottom_note, PEN_DARK)

# ==========================================
# BOX 3: Conversational AI Twin Chatbot
# ==========================================
bx0, by0, bx1, by1 = box_coords[3]
write_natural("3. Conversational AI Chatbot", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 15, by0 + 38, bx1 - 15, by1 - 65, PEN_DARK, 1)
write_natural("PhysioTwin AI Chat Interface", bx0 + 25, by0 + 46, font_bold_body, PEN_DARK)
hand_line(bx0 + 25, by0 + 70, bx1 - 25, by0 + 70, PEN_DARK, 1)

write_natural("User: Why is my right knee stiff today?", bx0 + 25, by0 + 78, font_bold_body, PEN_BLUE)
hand_line(bx0 + 25, by0 + 104, bx1 - 25, by0 + 104, PEN_DARK, 1)

write_natural("Twin AI: Your knee flexion dropped 14 deg", bx0 + 25, by0 + 112, font_body, PEN_DARK)
write_natural("after yesterday's 45m squats workout.", bx0 + 25, by0 + 134, font_body, PEN_DARK)
write_natural("Fatigue Index: 78/100 (Elevated)", bx0 + 25, by0 + 156, font_body, PEN_DARK)
write_natural("Action: 5 min hamstring stretch & ice.", bx0 + 25, by0 + 178, font_bold_body, PEN_BLUE)

hand_rect(bx0 + 25, by0 + 215, bx1 - 25, by0 + 254, PEN_DARK, 1)
write_natural("Ask your twin... [Send]", bx0 + 35, by0 + 225, font_body, PEN_DARK)

write_natural("Empathetic AI physio aware of patient", bx0 + 15, by1 - 54, font_bottom_note, PEN_DARK)
write_natural("recovery metrics answering personal queries", bx0 + 15, by1 - 34, font_bottom_note, PEN_DARK)

# ==========================================
# BOX 4: What-If Activity Simulator
# ==========================================
bx0, by0, bx1, by1 = box_coords[4]
write_natural("4. What-If Activity Simulator", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 15, by0 + 38, bx1 - 15, by1 - 65, PEN_DARK, 1)
write_natural("Simulate Planned Workout:", bx0 + 25, by0 + 46, font_bold_body, PEN_DARK)
hand_line(bx0 + 25, by0 + 70, bx1 - 25, by0 + 70, PEN_DARK, 1)

write_natural("Workout Parameters:", bx0 + 25, by0 + 78, font_bold_body, PEN_BLUE)
write_natural("• Activity Type: 5km Jogging", bx0 + 25, by0 + 102, font_body, PEN_DARK)
write_natural("• Duration: 30 Mins | Intensity: Med", bx0 + 25, by0 + 124, font_body, PEN_DARK)

hand_rect(bx0 + 25, by0 + 152, bx1 - 25, by0 + 254, PEN_DARK, 1)
write_natural("Predicted Biomechanical Impact:", bx0 + 35, by0 + 160, font_bold_body, PEN_DARK)
write_natural("• Knee Joint Strain: +24%", bx0 + 35, by0 + 182, font_body, PEN_DARK)
write_natural("• Est. Recovery Needed: 16 Hours", bx0 + 35, by0 + 204, font_body, PEN_DARK)
write_natural("• Verdict: APPROVED WITH BRACE", bx0 + 35, by0 + 226, font_bold_body, PEN_BLUE)

write_natural("Forecasts joint fatigue & capability drain", bx0 + 15, by1 - 54, font_bottom_note, PEN_DARK)
write_natural("dynamically before exercise is initiated", bx0 + 15, by1 - 34, font_bottom_note, PEN_DARK)

# ==========================================
# BOX 5: Zero-Video Edge Privacy
# ==========================================
bx0, by0, bx1, by1 = box_coords[5]
write_natural("5. Zero-Video Edge Privacy", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 15, by0 + 38, bx1 - 15, by1 - 65, PEN_DARK, 1)
write_natural("Privacy Security Architecture:", bx0 + 25, by0 + 46, font_bold_body, PEN_DARK)
hand_line(bx0 + 25, by0 + 70, bx1 - 25, by0 + 70, PEN_DARK, 1)

write_natural("Data Pipeline Stages:", bx0 + 25, by0 + 78, font_bold_body, PEN_BLUE)
write_natural("1. Camera Stream kept in Browser RAM", bx0 + 25, by0 + 102, font_body, PEN_DARK)
write_natural("2. MediaPipe WASM strips all raw pixels", bx0 + 25, by0 + 124, font_body, PEN_DARK)
write_natural("3. Numeric 3D Joint Coordinates only:", bx0 + 25, by0 + 146, font_body, PEN_DARK)
write_natural("   {'knee': 124.2, 'symmetry': 0.94}", bx0 + 35, by0 + 168, font_bold_body, PEN_BLUE)
write_natural("4. Cloud Sync: Encrypted JSON Stream", bx0 + 25, by0 + 192, font_body, PEN_DARK)

hand_rect(bx0 + 25, by0 + 218, bx1 - 25, by0 + 254, PEN_DARK, 1)
write_natural("100% Biometric Privacy Preserved", bx0 + 35, by0 + 228, font_bold_body, PEN_DARK)

write_natural("Camera pixels never leave browser layer;", bx0 + 15, by1 - 54, font_bottom_note, PEN_DARK)
write_natural("only anonymous JSON arrays stored in cloud", bx0 + 15, by1 - 34, font_bottom_note, PEN_DARK)

# ==========================================
# BOX 6: AI Weekly Recovery Letter
# ==========================================
bx0, by0, bx1, by1 = box_coords[6]
write_natural("6. AI Weekly Recovery Letter", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 15, by0 + 38, bx1 - 15, by1 - 65, PEN_DARK, 1)
write_natural("Sunday Recovery Digest - PhysioTwin", bx0 + 25, by0 + 46, font_bold_body, PEN_DARK)
hand_line(bx0 + 25, by0 + 70, bx1 - 25, by0 + 70, PEN_DARK, 1)

write_natural("Weekly Summary (Oct 21 - Oct 27):", bx0 + 25, by0 + 78, font_bold_body, PEN_BLUE)
write_natural("• Overall Mobility Score: 88 (+12% gain)", bx0 + 25, by0 + 102, font_body, PEN_DARK)
write_natural("• Rehab Session Adherence: 6/7 Days", bx0 + 25, by0 + 124, font_body, PEN_DARK)
write_natural("• Pain Level: Reduced (4/10 -> 2/10)", bx0 + 25, by0 + 146, font_body, PEN_DARK)
write_natural("• Next Week Target: 3x quad rehab sets", bx0 + 25, by0 + 168, font_body, PEN_DARK)

hand_rect(bx0 + 25, by0 + 200, bx1 - 25, by0 + 254, PEN_DARK, 1)
write_natural("Doctor Note: Excellent recovery progress!", bx0 + 35, by0 + 210, font_bold_body, PEN_BLUE)
write_natural("Approved by: AI Biomechanics Engine", bx0 + 35, by0 + 230, font_body, PEN_DARK)

write_natural("Automated Sunday report authored by LLM", bx0 + 15, by1 - 54, font_bottom_note, PEN_DARK)
write_natural("summarizing mobility gains & corrective advice", bx0 + 15, by1 - 34, font_bottom_note, PEN_DARK)

# ==========================================
# BOX 7: Medical Report AI Parser
# ==========================================
bx0, by0, bx1, by1 = box_coords[7]
write_natural("7. Medical Report AI Parser", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 15, by0 + 38, bx1 - 15, by1 - 65, PEN_DARK, 1)
write_natural("Medical Document Upload Portal", bx0 + 25, by0 + 46, font_bold_body, PEN_DARK)
hand_line(bx0 + 25, by0 + 70, bx1 - 25, by0 + 70, PEN_DARK, 1)

write_natural("File: MRI_Knee_Scan_Oct2026.pdf", bx0 + 25, by0 + 78, font_bold_body, PEN_BLUE)
write_natural("Extraction Status: Completed by LLM", bx0 + 25, by0 + 102, font_body, PEN_DARK)

hand_rect(bx0 + 25, by0 + 126, bx1 - 25, by0 + 206, PEN_DARK, 1)
write_natural("Extracted Clinical Findings:", bx0 + 35, by0 + 134, font_bold_body, PEN_DARK)
write_natural("• Mild Medial Meniscus Tear (Grade 1)", bx0 + 35, by0 + 156, font_body, PEN_DARK)
write_natural("• Joint Effusion: Minimal swelling", bx0 + 35, by0 + 178, font_body, PEN_DARK)

write_natural("Auto-Action: Twin risk map updated", bx0 + 25, by0 + 216, font_bold_body, PEN_BLUE)
write_natural("Knee alert level set to HIGH RISK", bx0 + 25, by0 + 236, font_body, PEN_DARK)

write_natural("Uploads MRI/X-ray PDFs; LLM extracts", bx0 + 15, by1 - 54, font_bottom_note, PEN_DARK)
write_natural("diagnostic findings & auto-updates twin risk map", bx0 + 15, by1 - 34, font_bottom_note, PEN_DARK)

# ==========================================
# BOX 8: Capability Leaderboard
# ==========================================
bx0, by0, bx1, by1 = box_coords[8]
write_natural("8. Capability Leaderboard", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 15, by0 + 38, bx1 - 15, by1 - 65, PEN_DARK, 1)
write_natural("Community Rehab Adherence Rank", bx0 + 25, by0 + 46, font_bold_body, PEN_DARK)
hand_line(bx0 + 25, by0 + 70, bx1 - 25, by0 + 70, PEN_DARK, 1)

write_natural("Top Rankings (Current Batch):", bx0 + 25, by0 + 78, font_bold_body, PEN_BLUE)
write_natural("1. Kamalesh Kumar .R - 96% (7-Day Streak)", bx0 + 25, by0 + 102, font_body, PEN_DARK)
write_natural("2. Mohan A           - 89% Adherence", bx0 + 25, by0 + 124, font_body, PEN_DARK)
write_natural("3. Arun Kumar        - 82% Mobility", bx0 + 25, by0 + 146, font_body, PEN_DARK)

hand_rect(bx0 + 25, by0 + 174, bx1 - 25, by0 + 216, PEN_DARK, 1)
write_natural("Badge: Consistency Champion!", bx0 + 35, by0 + 185, font_bold_body, PEN_BLUE)

write_natural("Weekly Goal: 10,000 posture reps", bx0 + 25, by0 + 230, font_body, PEN_DARK)

write_natural("Gamified social ranking celebrating", bx0 + 15, by1 - 54, font_bottom_note, PEN_DARK)
write_natural("mobility consistency & rehabilitation adherence", bx0 + 15, by1 - 34, font_bottom_note, PEN_DARK)

# ==========================================
# NATURAL BALLPOINT PEN FILTER
# ==========================================
draw_np = np.array(im)
alpha = draw_np[:, :, 3].astype(float) / 255.0
alpha_smooth = cv2.GaussianBlur(alpha, (3, 3), 0.4)

final_np = paper.astype(float).copy()
for c in range(3):
    final_np[:, :, c] = (
        paper[:, :, c] * (1.0 - alpha_smooth) +
        draw_np[:, :, c] * alpha_smooth
    )

final_np = np.clip(final_np, 0, 255).astype(np.uint8)
final_img = Image.fromarray(final_np)

# Output files
out_png = os.path.join(DOWNLOADS_DIR, "Crazy8s_PhysioTwin_Natural_Handwritten.png")
final_img.save(out_png, quality=95)
print("Saved:", out_png)

# Save PDF
pdf_path = os.path.join(DOWNLOADS_DIR, "Crazy8s_PhysioTwin_Edited.pdf")
final_img.save(pdf_path, "PDF", resolution=100.0)
print("Saved PDF:", pdf_path)

# Save to artifacts
final_img.save(os.path.join(ART_DIR, "Crazy8s_PhysioTwin_Natural_Handwritten.png"), quality=95)
final_img.save(os.path.join(ART_DIR, "Crazy8s_PhysioTwin_Edited.pdf"), "PDF", resolution=100.0)

# Synchronize with project report assets
final_img.save(os.path.join(REPORT_ASSETS_DIR, "fig5_2_crazy8_sheet.png"))
final_img.save(os.path.join(REPORT_ASSETS_DIR, "fig5_2_crazy8_sheet.jpeg"), quality=95)
print("Updated report assets fig5_2 successfully!")
