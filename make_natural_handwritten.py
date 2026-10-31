import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
import random

# Seed for reproducible natural jitter
random.seed(42)

DOWNLOADS_DIR = r"C:\Users\kamal\Downloads"
BASE_SCAN_PATH = os.path.join(DOWNLOADS_DIR, "scamper_page_1.png")

# Load original scan
img_cv = cv2.imread(BASE_SCAN_PATH)
h, w, _ = img_cv.shape

# Clean ONLY the edited parts (erase old blue handwriting, preserve paper grain)
# In the header:
# Sample local clean background color (around 253, 253, 253)
bg_color = [254, 254, 254]
img_cv[185:265, 155:380] = bg_color   # Team Name
img_cv[185:265, 720:1115] = bg_color  # Team Lead
img_cv[185:265, 1190:1430] = bg_color # Date
# Right response box area
img_cv[265:2150, 480:1450] = bg_color

# Convert to PIL for rendering natural handwriting
im_pil = Image.open(BASE_SCAN_PATH).convert("RGBA")
# Paste the cleaned base
im_base = Image.fromarray(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)).convert("RGBA")

# Create a transparent ink overlay
ink_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
draw = ImageDraw.Draw(ink_layer)

# Natural ballpoint pen ink colors (deep ballpoint blue with slight variation)
BASE_INK = (20, 58, 145)    # Royal ballpoint blue
DARK_INK = (12, 42, 115)    # Slightly higher pressure

font_main = ImageFont.truetype(r"C:\Windows\Fonts\segoepr.ttf", 20)
font_hdr = ImageFont.truetype(r"C:\Windows\Fonts\segoeprb.ttf", 22)
font_dash = ImageFont.truetype(r"C:\Windows\Fonts\segoeprb.ttf", 22)

def draw_natural_word(draw_obj, text, x, y, font, color):
    # Slight jitter for realistic hand movement
    jx = random.uniform(-0.8, 0.8)
    jy = random.uniform(-0.9, 0.9)
    # Slight color modulation (pen pressure variation)
    c_jitter = random.randint(-8, 8)
    ink = (
        max(10, min(35, color[0] + c_jitter)),
        max(35, min(75, color[1] + c_jitter)),
        max(110, min(165, color[2] + c_jitter)),
        random.randint(225, 250)  # Natural pen opacity
    )
    draw_obj.text((x + jx, y + jy), text, fill=ink, font=font)
    bbox = draw_obj.textbbox((0, 0), text, font=font)
    return (bbox[2] - bbox[0])

def draw_natural_paragraph(draw_obj, bullets, x_start, y_start, max_w, font, font_bullet, base_color):
    y_curr = y_start
    for bullet_text in bullets:
        words = bullet_text.split(" ")
        lines = []
        cur_line = []
        for word in words:
            test_line = " ".join(cur_line + [word])
            bbox = draw_obj.textbbox((0, 0), test_line, font=font)
            if (bbox[2] - bbox[0]) <= (max_w - 35):
                cur_line.append(word)
            else:
                if cur_line:
                    lines.append(cur_line)
                    cur_line = [word]
                else:
                    lines.append([word])
                    cur_line = []
        if cur_line:
            lines.append(cur_line)

        # Baseline gentle wave per line (humans write with slight natural wave)
        line_slant = random.uniform(-0.008, 0.008)

        for l_idx, line_words in enumerate(lines):
            cur_x = x_start
            if l_idx == 0:
                # Draw dash or bullet naturally
                draw_natural_word(draw_obj, "-", cur_x, y_curr, font_bullet, DARK_INK)
                cur_x += 24

            for w_idx, w_str in enumerate(line_words):
                # Apply slight natural line drift
                drift = (cur_x - x_start) * line_slant + random.uniform(-0.6, 0.6)
                word_w = draw_natural_word(draw_obj, w_str, cur_x, y_curr + drift, font, base_color)
                # Natural spacing between words (not robotic constant width)
                space_w = random.uniform(8, 12)
                cur_x += word_w + space_w

            bbox_sample = draw_obj.textbbox((0, 0), "Sample", font=font)
            line_h = bbox_sample[3] - bbox_sample[1]
            y_curr += line_h + random.uniform(9, 13)

        y_curr += random.uniform(6, 10)

# 1. Header: Write in natural handwriting
draw_natural_word(draw, "pro caffeinators", 168, 216, font_hdr, BASE_INK)
draw_natural_word(draw, "25AD087 - KAMALESH KUMAR .R", 725, 216, font_hdr, BASE_INK)
draw_natural_word(draw, "27/10/2026", 1208, 216, font_hdr, BASE_INK)

# 2. SCAMPER Rows
CONTENT = [
    {
        "y": 282,
        "bullets": [
            "Replace costly wearable IMUs & mocap suits with lightweight MediaPipe Pose WASM computer vision via webcam.",
            "Replace cloud video streaming with on-device edge AI to keep biometric posture data 100% private."
        ]
    },
    {
        "y": 515,
        "bullets": [
            "Combine real-time joint angle metrics (ROM, bilateral symmetry) with heart rate telemetry & workout logs.",
            "Merge physical therapy rehab exercises with live audio-visual biofeedback into a unified Capability Profile."
        ]
    },
    {
        "y": 752,
        "bullets": [
            "Adapt industrial 'Digital Twin' engineering technology (aerospace/mfg) to human musculoskeletal biomechanics.",
            "Adapt clinical physical therapy goniometer tests into automated at-home recovery & posture tracking."
        ]
    },
    {
        "y": 995,
        "bullets": [
            "Modify dry 2D rehabilitation angle tables into an interactive 3D holographic body heatmap with risk zones.",
            "Magnify subtle kinematic compensations & posture imbalances before they worsen into structural injuries."
        ]
    },
    {
        "y": 1250,
        "bullets": [
            "Repurpose real-time skeletal tracking for an activity 'What-If Simulator' to forecast joint fatigue before workouts.",
            "Extend clinical rehab platform to desk ergonomics, athletic training, and elderly fall prevention."
        ]
    },
    {
        "y": 1535,
        "bullets": [
            "Eliminate manual paper logs, analog goniometers, and dependence on frequent in-person clinic visits.",
            "Eliminate bulky wearable hardware, sensors, dongles, and latency via zero-install browser processing."
        ]
    },
    {
        "y": 1800,
        "bullets": [
            "Reverse the reactive healthcare model (treating injuries after damage) into proactive predictive injury prevention.",
            "Flip passive patient compliance into an interactive, self-correcting visual feedback loop."
        ]
    }
]

for section in CONTENT:
    draw_natural_paragraph(draw, section["bullets"], 500, section["y"], 895, font_main, font_dash, BASE_INK)

# 3. Apply subtle ink bleed / paper absorption filter for 100% realistic pen look
# Convert ink overlay to numpy
ink_np = np.array(ink_layer)
alpha = ink_np[:, :, 3].astype(float) / 255.0

# Slightly soften the ink edges (ballpoint pen ink bleed on paper)
alpha_blurred = cv2.GaussianBlur(alpha, (3, 3), 0.5)

# Composite ink onto base image naturally
base_np = np.array(im_base)[:, :, :3]
final_np = base_np.copy()

for c in range(3):
    final_np[:, :, c] = np.clip(
        base_np[:, :, c] * (1.0 - alpha_blurred) + ink_np[:, :, c] * alpha_blurred,
        0, 255
    ).astype(np.uint8)

final_img = Image.fromarray(final_np)

# Save high-res natural handwritten output
out_natural = os.path.join(DOWNLOADS_DIR, "SCAMPER_PhysioTwin_Natural_Handwritten.png")
final_img.save(out_natural, quality=95)
print("Saved:", out_natural)

# Also overwrite SCAMPER_PhysioTwin_Edited_Handwritten.png and PDF
final_img.save(os.path.join(DOWNLOADS_DIR, "SCAMPER_PhysioTwin_Edited_Handwritten.png"), quality=95)
final_img.save(os.path.join(DOWNLOADS_DIR, "SCAMPER_PhysioTwin_Edited.pdf"), "PDF", resolution=100.0)

# Copy to artifacts
art_dir = r"C:\Users\kamal\.gemini\antigravity-ide\brain\13225840-8a35-4e66-ae7f-3d75b1e35742"
final_img.save(os.path.join(art_dir, "SCAMPER_PhysioTwin_Natural_Handwritten.png"), quality=95)
final_img.save(os.path.join(art_dir, "SCAMPER_PhysioTwin_Edited_Handwritten.png"), quality=95)
final_img.save(os.path.join(art_dir, "SCAMPER_PhysioTwin_Edited.pdf"), "PDF", resolution=100.0)

# Synchronize into report assets
report_assets_dir = r"c:\projects\physio-twin\report_assets"
final_img.save(os.path.join(report_assets_dir, "fig5_1_scamper_sheet.png"))
final_img.save(os.path.join(report_assets_dir, "fig5_1_scamper_sheet.jpeg"), quality=95)

print("All natural handwritten files successfully generated and updated!")
