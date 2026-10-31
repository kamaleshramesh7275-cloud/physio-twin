import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import random

# Set random seed
random.seed(42)

DOWNLOADS_DIR = r"C:\Users\kamal\Downloads"
REPORT_ASSETS_DIR = r"c:\projects\physio-twin\report_assets"
ART_DIR = r"C:\Users\kamal\.gemini\antigravity-ide\brain\13225840-8a35-4e66-ae7f-3d75b1e35742"

# Canvas dimensions matching the uploaded paper
W, H = 1600, 1120

# Create realistic white paper background with subtle paper texture
paper_bg = np.ones((H, W, 3), dtype=np.uint8) * 253
noise = np.random.normal(0, 2.0, (H, W, 3))
paper = np.clip(paper_bg.astype(float) + noise, 242, 255).astype(np.uint8)

im = Image.fromarray(paper).convert("RGBA")
draw = ImageDraw.Draw(im)

# Authentic ballpoint pen colors
PEN_BLUE = (25, 60, 138, 245)      # Primary blue ballpoint
PEN_DARK = (15, 38, 95, 250)       # Dark pressure / outlines
PEN_CYAN = (30, 95, 175, 235)      # Highlights
PEN_RED = (175, 35, 35, 230)       # Red strain indicator
PEN_GREEN = (35, 135, 55, 230)     # Green safe indicator
PEN_YELLOW = (185, 135, 25, 230)   # Yellow warning
TITLE_BLACK = (20, 20, 25, 255)    # Printed title font

# Fonts
font_title = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 28)
font_hdr_team = ImageFont.truetype(r"C:\Windows\Fonts\Inkfree.ttf", 24)
font_box_title = ImageFont.truetype(r"C:\Windows\Fonts\Inkfree.ttf", 23)
font_sketch_label = ImageFont.truetype(r"C:\Windows\Fonts\Inkfree.ttf", 18)
font_annotation = ImageFont.truetype(r"C:\Windows\Fonts\Inkfree.ttf", 17)

def hand_line(x0, y0, x1, y1, color=PEN_DARK, width=2):
    dist = int(np.hypot(x1 - x0, y1 - y0))
    steps = max(2, dist // 8)
    xs = np.linspace(x0, x1, steps)
    ys = np.linspace(y0, y1, steps)
    points = []
    for x, y in zip(xs, ys):
        jx = random.uniform(-0.7, 0.7)
        jy = random.uniform(-0.7, 0.7)
        points.append((x + jx, y + jy))
    draw.line(points, fill=color, width=width)

def hand_rect(x0, y0, x1, y1, color=PEN_DARK, width=2):
    hand_line(x0, y0, x1, y0, color, width)
    hand_line(x1, y0, x1, y1, color, width)
    hand_line(x1, y1, x0, y1, color, width)
    hand_line(x0, y1, x0, y0, color, width)

def hand_circle(xc, yc, r, color=PEN_DARK, width=2):
    angles = np.linspace(0, 2*np.pi, 28)
    points = []
    for a in angles:
        dr = random.uniform(-0.8, 0.8)
        px = xc + (r + dr) * np.cos(a)
        py = yc + (r + dr) * np.sin(a)
        points.append((px, py))
    points.append(points[0])
    draw.line(points, fill=color, width=width)

def hand_arrow(x0, y0, x1, y1, color=PEN_DARK, width=2):
    hand_line(x0, y0, x1, y1, color, width)
    ang = np.arctan2(y1 - y0, x1 - x0)
    arr_len = 10
    a1 = ang + np.pi * 0.82
    a2 = ang - np.pi * 0.82
    hand_line(x1, y1, x1 + arr_len * np.cos(a1), y1 + arr_len * np.sin(a1), color, width)
    hand_line(x1, y1, x1 + arr_len * np.cos(a2), y1 + arr_len * np.sin(a2), color, width)

def write_hand(text, x, y, font=font_sketch_label, color=PEN_BLUE):
    jx = random.uniform(-0.6, 0.6)
    jy = random.uniform(-0.6, 0.6)
    draw.text((x + jx, y + jy), text, fill=color, font=font)

# 1. PRINTED TITLE AT TOP (matching original scan)
draw.text((W // 2, 45), "Crazy 8s - Design Ideation Sketching Method", fill=TITLE_BLACK, font=font_title, anchor="mm")

# 2. TEAM CREDENTIALS IN TOP RIGHT (just like fig5_2_crazy8_sheet.jpeg)
write_hand("pro caffeinators", 1250, 20, font_hdr_team, PEN_DARK)
write_hand("25AD087 - KAMALESH KUMAR .R", 1170, 48, font_hdr_team, PEN_DARK)
write_hand("Date: 27/10/2026", 1330, 76, font_sketch_label, PEN_BLUE)

# 8 Card Boxes geometry:
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

# Draw outer cards and arrows
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
write_hand("1. Browser Webcam Pose HUD", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

# Webcam browser frame
hand_rect(bx0 + 20, by0 + 42, bx1 - 20, by1 - 70, PEN_DARK, 2)
hand_line(bx0 + 20, by0 + 66, bx1 - 20, by0 + 66, PEN_DARK, 1)
hand_circle(bx0 + 35, by0 + 54, 4, PEN_DARK, 1)
hand_circle(bx0 + 50, by0 + 54, 4, PEN_DARK, 1)
hand_circle(bx0 + 65, by0 + 54, 4, PEN_DARK, 1)
write_hand("localhost:5173/scan", bx0 + 85, by0 + 46, font_annotation, PEN_BLUE)

# Human skeletal stick figure in pose
head_x, head_y = bx0 + 180, by0 + 112
hand_circle(head_x, head_y, 14, PEN_BLUE, 2)
hand_line(head_x, head_y + 14, head_x, head_y + 90, PEN_BLUE, 3) # Spine
# Arms
hand_line(head_x, head_y + 30, head_x - 45, head_y + 55, PEN_BLUE, 2)
hand_line(head_x - 45, head_y + 55, head_x - 65, head_y + 35, PEN_BLUE, 2)
hand_line(head_x, head_y + 30, head_x + 45, head_y + 55, PEN_BLUE, 2)
hand_line(head_x + 45, head_y + 55, head_x + 65, head_y + 35, PEN_BLUE, 2)
# Legs (squat posture)
hand_line(head_x, head_y + 90, head_x - 40, head_y + 140, PEN_BLUE, 2)
hand_line(head_x - 40, head_y + 140, head_x - 45, head_y + 195, PEN_BLUE, 2)
hand_line(head_x, head_y + 90, head_x + 40, head_y + 140, PEN_BLUE, 2)
hand_line(head_x + 40, head_y + 140, head_x + 45, head_y + 195, PEN_BLUE, 2)

# Joints keypoints (green circles)
for jx, jy in [(head_x, head_y + 30), (head_x - 45, head_y + 55), (head_x + 45, head_y + 55),
              (head_x - 40, head_y + 140), (head_x + 40, head_y + 140)]:
    hand_circle(jx, jy, 4, PEN_GREEN, 2)

# Angle callouts HUD
write_hand("Knee: 124 deg", head_x + 55, head_y + 130, font_annotation, PEN_DARK)
hand_line(head_x + 40, head_y + 140, head_x + 52, head_y + 138, PEN_DARK, 1)
write_hand("Spine: 88 deg", head_x - 90, head_y + 70, font_annotation, PEN_DARK)
write_hand("[OK] Good Form", bx0 + 35, by1 - 95, font_annotation, PEN_GREEN)

write_hand("Real-time skeletal tracking HUD", bx0 + 20, by1 - 58, font_annotation, PEN_DARK)
write_hand("& live ROM joint degree readout", bx0 + 20, by1 - 38, font_annotation, PEN_DARK)

# ==========================================
# BOX 2: 3D Holographic Body Heatmap
# ==========================================
bx0, by0, bx1, by1 = box_coords[2]
write_hand("2. 3D Body Heatmap Twin", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 20, by0 + 42, bx1 - 20, by1 - 70, PEN_DARK, 2)

# 3D Avatar mesh silhouette
ax, ay = (bx0 + bx1) // 2, by0 + 115
hand_circle(ax, ay, 15, PEN_BLUE, 2)
hand_line(ax, ay + 15, ax, ay + 100, PEN_BLUE, 2)
hand_line(ax - 28, ay + 35, ax + 28, ay + 35, PEN_BLUE, 2)
hand_line(ax - 22, ay + 65, ax + 22, ay + 65, PEN_BLUE, 2)
hand_line(ax - 30, ay + 100, ax + 30, ay + 100, PEN_BLUE, 2)
# Limbs
hand_line(ax - 28, ay + 35, ax - 55, ay + 105, PEN_BLUE, 2)
hand_line(ax + 28, ay + 35, ax + 55, ay + 105, PEN_BLUE, 2)
hand_line(ax - 20, ay + 100, ax - 30, ay + 160, PEN_BLUE, 2)
hand_line(ax - 30, ay + 160, ax - 35, ay + 215, PEN_BLUE, 2)
hand_line(ax + 20, ay + 100, ax + 30, ay + 160, PEN_BLUE, 2)
hand_line(ax + 30, ay + 160, ax + 35, ay + 215, PEN_BLUE, 2)

# Color-coded strain heat circles
hand_circle(ax + 30, ay + 160, 10, PEN_RED, 3)     # Knee High Strain
write_hand("RED (High)", ax + 46, ay + 150, font_annotation, PEN_RED)
hand_circle(ax, ay + 80, 8, PEN_YELLOW, 2)         # Lower Back Moderate
write_hand("YELLOW (Mod)", bx0 + 30, ay + 75, font_annotation, PEN_YELLOW)
hand_circle(ax - 28, ay + 35, 7, PEN_GREEN, 2)     # Shoulder Safe
write_hand("GREEN (Safe)", bx0 + 30, ay + 30, font_annotation, PEN_GREEN)

write_hand("360 deg Rotatable Mesh", bx0 + 35, by1 - 95, font_annotation, PEN_BLUE)
write_hand("Interactive 3D body twin mesh with", bx0 + 15, by1 - 58, font_annotation, PEN_DARK)
write_hand("color-coded risk zones (safe/warn/risk)", bx0 + 15, by1 - 38, font_annotation, PEN_DARK)

# ==========================================
# BOX 3: Conversational AI Twin Chatbot
# ==========================================
bx0, by0, bx1, by1 = box_coords[3]
write_hand("3. Conversational AI Chatbot", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

phone_w = 210
px0 = (bx0 + bx1 - phone_w) // 2
px1 = px0 + phone_w
py0 = by0 + 42
py1 = by1 - 70
hand_rect(px0, py0, px1, py1, PEN_DARK, 2)
hand_circle((px0 + px1) // 2, py0 + 10, 3, PEN_DARK, 1)

# Chat bubble 1: User
hand_rect(px0 + 35, py0 + 26, px1 - 12, py0 + 68, PEN_BLUE, 1)
write_hand("Why is my right", px0 + 42, py0 + 30, font_annotation, PEN_DARK)
write_hand("knee stiff?", px0 + 42, py0 + 48, font_annotation, PEN_DARK)

# Chat bubble 2: AI Twin
hand_rect(px0 + 12, py0 + 78, px1 - 25, py0 + 155, PEN_DARK, 1)
write_hand("Twin Bot: Knee ROM", px0 + 18, py0 + 84, font_annotation, PEN_BLUE)
write_hand("dropped 14 deg after squats.", px0 + 18, py0 + 104, font_annotation, PEN_DARK)
write_hand("Do 5m quad stretch.", px0 + 18, py0 + 124, font_annotation, PEN_DARK)

# Input bar
hand_rect(px0 + 12, py1 - 32, px1 - 12, py1 - 10, PEN_DARK, 1)
write_hand("Ask your twin... [Send]", px0 + 18, py1 - 28, font_annotation, PEN_BLUE)

write_hand("Empathetic AI therapist aware of", bx0 + 20, by1 - 58, font_annotation, PEN_DARK)
write_hand("user recovery stats answering queries", bx0 + 20, by1 - 38, font_annotation, PEN_DARK)

# ==========================================
# BOX 4: What-If Activity Simulator
# ==========================================
bx0, by0, bx1, by1 = box_coords[4]
write_hand("4. What-If Activity Simulator", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 20, by0 + 42, bx1 - 20, by1 - 70, PEN_DARK, 2)

write_hand("Activity: Running", bx0 + 35, by0 + 52, font_annotation, PEN_DARK)
hand_line(bx0 + 35, by0 + 82, bx1 - 35, by0 + 82, PEN_BLUE, 2)
hand_circle(bx0 + 180, by0 + 82, 7, PEN_DARK, 3)

write_hand("Duration: 35 mins", bx0 + 35, by0 + 102, font_annotation, PEN_DARK)
hand_line(bx0 + 35, by0 + 132, bx1 - 35, by0 + 132, PEN_BLUE, 2)
hand_circle(bx0 + 220, by0 + 132, 7, PEN_DARK, 3)

write_hand("Intensity: High (Zone 4)", bx0 + 35, by0 + 152, font_annotation, PEN_DARK)
hand_line(bx0 + 35, by0 + 182, bx1 - 35, by0 + 182, PEN_BLUE, 2)
hand_circle(bx0 + 260, by0 + 182, 7, PEN_DARK, 3)

hand_rect(bx0 + 35, by0 + 202, bx1 - 35, by1 - 85, PEN_DARK, 1)
write_hand("Projected Strain: -28%", bx0 + 48, by0 + 210, font_annotation, PEN_RED)
write_hand("Est. Recovery: 18 hrs", bx0 + 48, by0 + 232, font_annotation, PEN_DARK)

write_hand("Interactive sliders projecting physical", bx0 + 20, by1 - 58, font_annotation, PEN_DARK)
write_hand("strain & fatigue before workout starts", bx0 + 20, by1 - 38, font_annotation, PEN_DARK)

# ==========================================
# BOX 5: Zero-Video Edge Privacy
# ==========================================
bx0, by0, bx1, by1 = box_coords[5]
write_hand("5. Zero-Video Edge Privacy", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 20, by0 + 42, bx1 - 20, by1 - 70, PEN_DARK, 2)

hand_rect(bx0 + 35, by0 + 55, bx0 + 125, by0 + 115, PEN_BLUE, 2)
hand_circle(bx0 + 80, by0 + 85, 12, PEN_DARK, 2)
write_hand("Webcam", bx0 + 45, by0 + 120, font_annotation, PEN_DARK)

hand_arrow(bx0 + 130, by0 + 85, bx0 + 175, by0 + 85, PEN_DARK, 2)

hand_rect(bx0 + 180, by0 + 50, bx0 + 325, by0 + 125, PEN_DARK, 2)
write_hand("Client Browser", bx0 + 192, by0 + 60, font_annotation, PEN_BLUE)
write_hand("WASM Pose AI", bx0 + 195, by0 + 80, font_annotation, PEN_DARK)
write_hand("[Pixels Stripped]", bx0 + 190, by0 + 100, font_annotation, PEN_RED)

hand_arrow(bx0 + 250, by0 + 130, bx0 + 250, by0 + 165, PEN_DARK, 2)

hand_rect(bx0 + 45, by0 + 170, bx1 - 45, by0 + 245, PEN_DARK, 1)
write_hand('{ "joints": [x,y,z], "angle": 124 }', bx0 + 55, by0 + 185, font_annotation, PEN_BLUE)
write_hand('[Lock] Transmit numeric JSON only', bx0 + 55, by0 + 212, font_annotation, PEN_GREEN)

write_hand("Security gateway: camera pixels never leave", bx0 + 15, by1 - 58, font_annotation, PEN_DARK)
write_hand("browser; only anonymous JSON stored in cloud", bx0 + 15, by1 - 38, font_annotation, PEN_DARK)

# ==========================================
# BOX 6: AI Weekly Recovery Letter
# ==========================================
bx0, by0, bx1, by1 = box_coords[6]
write_hand("6. AI Weekly Recovery Letter", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 40, by0 + 42, bx1 - 40, by1 - 70, PEN_DARK, 2)
hand_line(bx1 - 65, by0 + 42, bx1 - 40, by0 + 67, PEN_DARK, 2)

write_hand("Weekly Recovery Digest", bx0 + 55, by0 + 54, font_box_title, PEN_BLUE)
hand_line(bx0 + 55, by0 + 82, bx1 - 65, by0 + 82, PEN_DARK, 1)

write_hand("- Mobility Score: 88 (+12% gain)", bx0 + 55, by0 + 98, font_annotation, PEN_DARK)
write_hand("- Bilateral Symmetry: 94% balanced", bx0 + 55, by0 + 126, font_annotation, PEN_GREEN)
write_hand("- Stiff Area: Left hamstring strain", bx0 + 55, by0 + 154, font_annotation, PEN_RED)
write_hand("- Doctor Advice: 3 sets quad stretch", bx0 + 55, by0 + 182, font_annotation, PEN_DARK)
write_hand("Signed: PhysioTwin LLM Coach", bx0 + 55, by0 + 215, font_annotation, PEN_BLUE)

write_hand("Automated Sunday report authored by LLM", bx0 + 20, by1 - 58, font_annotation, PEN_DARK)
write_hand("summarizing weekly gains & corrective plans", bx0 + 20, by1 - 38, font_annotation, PEN_DARK)

# ==========================================
# BOX 7: Medical Report AI Parser
# ==========================================
bx0, by0, bx1, by1 = box_coords[7]
write_hand("7. Medical Report AI Parser", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 20, by0 + 42, bx1 - 20, by1 - 70, PEN_DARK, 2)

hand_rect(bx0 + 35, by0 + 52, bx1 - 35, by0 + 115, PEN_BLUE, 2)
write_hand("[Upload] Drag & Drop MRI / X-Ray PDF", bx0 + 45, by0 + 64, font_annotation, PEN_BLUE)
write_hand("File: mri_lumbar_spine.pdf (Uploaded)", bx0 + 45, by0 + 88, font_annotation, PEN_DARK)

hand_arrow((bx0 + bx1) // 2, by0 + 120, (bx0 + bx1) // 2, by0 + 150, PEN_DARK, 2)

hand_rect(bx0 + 35, by0 + 155, bx1 - 35, by1 - 85, PEN_DARK, 1)
write_hand("LLM Diagnostic Extraction:", bx0 + 45, by0 + 162, font_annotation, PEN_DARK)
write_hand("- L4-L5 disc compression found", bx0 + 45, by0 + 184, font_annotation, PEN_RED)
write_hand("-> Twin Model Updated: Lumbar HIGH", bx0 + 45, by0 + 208, font_annotation, PEN_GREEN)

write_hand("Upload MRI/X-ray PDFs; LLM extracts", bx0 + 20, by1 - 58, font_annotation, PEN_DARK)
write_hand("diagnostic findings & updates joint risk map", bx0 + 20, by1 - 38, font_annotation, PEN_DARK)

# ==========================================
# BOX 8: Capability Leaderboard
# ==========================================
bx0, by0, bx1, by1 = box_coords[8]
write_hand("8. Capability Leaderboard", bx0 + 12, by0 + 8, font_box_title, PEN_DARK)

hand_rect(bx0 + 20, by0 + 42, bx1 - 20, by1 - 70, PEN_DARK, 2)

hand_rect(bx0 + 35, by0 + 52, bx1 - 35, by0 + 175, PEN_DARK, 1)
write_hand("Recovery Consistency Rank", bx0 + 45, by0 + 60, font_annotation, PEN_DARK)
hand_line(bx0 + 45, by0 + 82, bx1 - 45, by0 + 82, PEN_DARK, 1)

write_hand("#1 Kamalesh .R   96% Streak", bx0 + 45, by0 + 92, font_annotation, PEN_BLUE)
write_hand("#2 Mohan A        89% Adherence", bx0 + 45, by0 + 118, font_annotation, PEN_DARK)
write_hand("#3 Arun Kumar     82% Mobility", bx0 + 45, by0 + 144, font_annotation, PEN_DARK)

hand_rect(bx0 + 35, by0 + 188, bx1 - 35, by1 - 85, PEN_GREEN, 2)
write_hand("Milestone: 7-Day Rehab Streak!", bx0 + 45, by0 + 202, font_annotation, PEN_GREEN)

write_hand("Gamified community ranking celebrating", bx0 + 20, by1 - 58, font_annotation, PEN_DARK)
write_hand("mobility consistency & rehabilitation adherence", bx0 + 20, by1 - 38, font_annotation, PEN_DARK)

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
