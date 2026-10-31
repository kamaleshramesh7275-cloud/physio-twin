import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
import random

# Fix random seed for consistent natural aesthetics
random.seed(101)

DOWNLOADS_DIR = r"C:\Users\kamal\Downloads"
BASE_SCAN_PATH = os.path.join(DOWNLOADS_DIR, "scamper_page_1.png")

# Load original scan
img_cv = cv2.imread(BASE_SCAN_PATH)
h, w, _ = img_cv.shape

# Clean ONLY the edited parts:
# In the header:
img_cv[185:265, 155:380] = [255, 255, 255]   # Team Name
img_cv[185:265, 720:1115] = [255, 255, 255]  # Team Lead
img_cv[185:265, 1190:1430] = [255, 255, 255] # Date
# Right response box area
img_cv[265:2150, 480:1450] = [255, 255, 255]

# Convert to PIL
im_base = Image.fromarray(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))

# We will create an RGBA ink layer
ink_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
draw = ImageDraw.Draw(ink_layer)

# Handwriting fonts: Inkfree for body & header
font_body = ImageFont.truetype(r"C:\Windows\Fonts\Inkfree.ttf", 29)
font_hdr = ImageFont.truetype(r"C:\Windows\Fonts\Inkfree.ttf", 31)

# Natural ballpoint pen ink colors sampled from original scan
# Core ink: (52, 76, 138)
# Halo ink: (110, 130, 172)
BASE_INK = (55, 80, 142)

def render_handwritten_line(draw_obj, text, x_start, y_start, font, base_ink, max_w=910):
    words = text.split(" ")
    cur_x = x_start + random.uniform(-2, 3)
    cur_y = y_start + random.uniform(-1.5, 1.5)
    
    # Slight natural line slant (people naturally slant slightly as they write across paper)
    line_slant = random.uniform(-0.007, 0.006)
    
    for w_idx, word in enumerate(words):
        # Pressure / ink variation per word
        ink_var = random.randint(-8, 8)
        word_ink = (
            max(35, min(75, base_ink[0] + ink_var)),
            max(60, min(100, base_ink[1] + ink_var)),
            max(120, min(165, base_ink[2] + ink_var)),
            random.randint(235, 255)
        )
        
        # Word position with natural micro-drift
        drift_y = (cur_x - x_start) * line_slant + random.uniform(-0.7, 0.7)
        draw_obj.text((cur_x, cur_y + drift_y), word, fill=word_ink, font=font)
        
        bbox = draw_obj.textbbox((0, 0), word, font=font)
        word_w = bbox[2] - bbox[0]
        cur_x += word_w + random.uniform(9, 13)

# 1. Header (natural handwriting)
render_handwritten_line(draw, "pro caffeinators", 165, 212, font_hdr, BASE_INK)
render_handwritten_line(draw, "25AD087 - KAMALESH KUMAR .R", 724, 212, font_hdr, BASE_INK)
render_handwritten_line(draw, "27/10/2026", 1205, 212, font_hdr, BASE_INK)

# 2. SCAMPER Section Responses (2 concise, natural lines per box, matching the original format)
ENTRIES = [
    {
        "y": 320,
        "line1": "Replace costly IMU sensors & mocap suits with webcam AI (MediaPipe)",
        "line2": "Replace cloud video streaming with on-device edge computing for privacy"
    },
    {
        "y": 555,
        "line1": "Combine kinematic joint angles (ROM, symmetry) with heart rate telemetry",
        "line2": "Combine physio rehab exercises with live biofeedback & progress tracking"
    },
    {
        "y": 800,
        "line1": "Adapt industrial Digital Twin concept to human musculoskeletal body",
        "line2": "Adapt physical therapy goniometer tests into automated home tracking"
    },
    {
        "y": 1045,
        "line1": "Modify dry 2D angle charts into an interactive 3D holographic body heatmap",
        "line2": "Magnify subtle joint compensations & posture imbalances to prevent injury"
    },
    {
        "y": 1300,
        "line1": "Repurpose real-time pose tracking for an activity 'What-If Simulator'",
        "line2": "Extend from clinical rehab to desk ergonomics & athletic conditioning"
    },
    {
        "y": 1580,
        "line1": "Eliminate manual paper logs, analog goniometers & clinic visit frequency",
        "line2": "Eliminate bulky wearable sensors, dongles & setup latency"
    },
    {
        "y": 1845,
        "line1": "Reverse reactive post-injury treatment to proactive predictive prevention",
        "line2": "Flip passive patient compliance into an interactive self-correcting loop"
    }
]

for item in ENTRIES:
    # Line 1
    render_handwritten_line(draw, item["line1"], 500, item["y"], font_body, BASE_INK)
    # Line 2 (spaced by ~45-50 pixels)
    render_handwritten_line(draw, item["line2"], 500, item["y"] + 48, font_body, BASE_INK)

# 3. Realistic Ballpoint Pen Filter
# Extract RGBA channels
ink_np = np.array(ink_layer)
alpha = ink_np[:, :, 3].astype(float) / 255.0

# Ballpoint pen ink spread: slight Gaussian softening (sigma=0.45)
alpha_smooth = cv2.GaussianBlur(alpha, (3, 3), 0.45)

# Slight ink edge feathering / halo (matches scanner sensor MTF)
halo_color = np.array([120, 138, 178], dtype=float)
core_color = ink_np[:, :, :3].astype(float)

base_np = np.array(im_base).astype(float)
final_np = base_np.copy()

for c in range(3):
    # Blend ink with slight feathering into the paper
    final_np[:, :, c] = (
        base_np[:, :, c] * (1.0 - alpha_smooth) +
        core_color[:, :, c] * alpha_smooth
    )

final_np = np.clip(final_np, 0, 255).astype(np.uint8)
final_img = Image.fromarray(final_np)

# Output paths
out_png = os.path.join(DOWNLOADS_DIR, "SCAMPER_PhysioTwin_Natural_Handwritten.png")
final_img.save(out_png, quality=95)
print("Saved:", out_png)

# Overwrite previous files
final_img.save(os.path.join(DOWNLOADS_DIR, "SCAMPER_PhysioTwin_Edited_Handwritten.png"), quality=95)
final_img.save(os.path.join(DOWNLOADS_DIR, "SCAMPER_PhysioTwin_Edited.pdf"), "PDF", resolution=100.0)

# Update artifacts
art_dir = r"C:\Users\kamal\.gemini\antigravity-ide\brain\13225840-8a35-4e66-ae7f-3d75b1e35742"
final_img.save(os.path.join(art_dir, "SCAMPER_PhysioTwin_Natural_Handwritten.png"), quality=95)
final_img.save(os.path.join(art_dir, "SCAMPER_PhysioTwin_Edited_Handwritten.png"), quality=95)
final_img.save(os.path.join(art_dir, "SCAMPER_PhysioTwin_Edited.pdf"), "PDF", resolution=100.0)

# Update project report assets
report_assets_dir = r"c:\projects\physio-twin\report_assets"
final_img.save(os.path.join(report_assets_dir, "fig5_1_scamper_sheet.png"))
final_img.save(os.path.join(report_assets_dir, "fig5_1_scamper_sheet.jpeg"), quality=95)

print("Natural handwriting sheet generated successfully!")
