import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Define paths
DOWNLOADS_DIR = r"C:\Users\kamal\Downloads"
BASE_SCAN_PATH = os.path.join(DOWNLOADS_DIR, "scamper_page_1.png")
CLEAN_TEMPLATE_PATH = os.path.join(DOWNLOADS_DIR, "scamper_cleaned_template.png")

# Content definition for Physio Twin project
HEADER_INFO = {
    "team_name": "pro caffeinators",
    "team_lead": "25AD087 - KAMALESH KUMAR .R",
    "date": "27/10/2026"
}

SCAMPER_DATA = [
    {
        "letter": "S",
        "title": "Substitute",
        "y_start": 280,
        "y_end": 500,
        "points": [
            "Substitute bulky, expensive wearable IMU sensors & mocap suits with lightweight browser-based computer vision (MediaPipe Pose WASM).",
            "Substitute cloud-based video transmission with client-side edge computing to ensure 100% patient biometric privacy."
        ]
    },
    {
        "letter": "C",
        "title": "Combine",
        "y_start": 515,
        "y_end": 740,
        "points": [
            "Combine kinematic joint angle metrics (ROM, bilateral symmetry) with physiological sensor telemetry (heart rate, SpO2) and workout history.",
            "Merge physical therapy rehabilitation exercises with real-time audio-visual biofeedback into a unified holistic Capability Profile."
        ]
    },
    {
        "letter": "A",
        "title": "Adapt",
        "y_start": 755,
        "y_end": 985,
        "points": [
            "Adapt industrial 'Digital Twin' engineering concepts (used in aerospace/manufacturing) to dynamic human musculoskeletal biomechanics.",
            "Adapt clinical physical therapy goniometric assessment protocols into automated, accessible home-based rehabilitation tracking."
        ]
    },
    {
        "letter": "M",
        "title": "Modify",
        "y_start": 1000,
        "y_end": 1240,
        "points": [
            "Modify static 2D rehabilitation angle charts into an interactive 3D holographic anatomical body heatmap with color-coded risk zones.",
            "Magnify subtle postural compensations, joint misalignments, and kinematic imbalances before they worsen into structural injury."
        ]
    },
    {
        "letter": "P",
        "title": "Put to other use",
        "y_start": 1255,
        "y_end": 1525,
        "points": [
            "Repurpose real-time kinematic pose streams to drive an activity 'What-If Simulator' forecasting physical strain before exercises begin.",
            "Extend clinical rehabilitation capabilities to desk ergonomics, athletic performance conditioning, and elderly fall prevention."
        ]
    },
    {
        "letter": "E",
        "title": "Eliminate",
        "y_start": 1540,
        "y_end": 1790,
        "points": [
            "Eliminate manual paper exercise logs, analog goniometers, and dependence on constant in-person clinic visits.",
            "Eliminate specialized hardware dongles, invasive wearable harnesses, and latency via zero-install web browser processing."
        ]
    },
    {
        "letter": "R",
        "title": "Reverse",
        "y_start": 1805,
        "y_end": 2075,
        "points": [
            "Reverse the reactive healthcare paradigm (treating injuries after damage occurs) into proactive predictive biomechanical screening.",
            "Flip traditional passive patient compliance into an interactive, self-correcting visual feedback loop."
        ]
    }
]

def wrap_text(text, font, max_width, draw):
    words = text.split(" ")
    lines = []
    current_line = []
    for word in words:
        test_line = " ".join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        w = bbox[2] - bbox[0]
        if w <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
                current_line = [word]
            else:
                lines.append(word)
                current_line = []
    if current_line:
        lines.append(" ".join(current_line))
    return lines

def clean_scanned_template():
    img = cv2.imread(BASE_SCAN_PATH)
    # Header fields cleaning
    img[185:265, 155:380] = [255, 255, 255]
    img[185:265, 720:1115] = [255, 255, 255]
    img[185:265, 1190:1430] = [255, 255, 255]
    # Right response box cleaning
    img[265:2150, 480:1450] = [255, 255, 255]
    cv2.imwrite(CLEAN_TEMPLATE_PATH, img)
    return img

def generate_typed_scan():
    clean_scanned_template()
    im = Image.open(CLEAN_TEMPLATE_PATH).convert("RGB")
    draw = ImageDraw.Draw(im)

    font_hdr = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 23)
    font_bullet = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 20)
    font_body = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 19)

    # Header
    draw.text((165, 218), HEADER_INFO["team_name"], fill=(20, 30, 50), font=font_hdr)
    draw.text((720, 218), HEADER_INFO["team_lead"], fill=(20, 30, 50), font=font_hdr)
    draw.text((1205, 218), HEADER_INFO["date"], fill=(20, 30, 50), font=font_hdr)

    max_w = 900
    for section in SCAMPER_DATA:
        y_curr = section["y_start"] + 12
        for pt in section["points"]:
            lines = wrap_text(pt, font_body, max_w - 30, draw)
            for i, line in enumerate(lines):
                if i == 0:
                    draw.text((505, y_curr), "•", fill=(20, 30, 50), font=font_bullet)
                    draw.text((530, y_curr), line, fill=(20, 30, 50), font=font_body)
                else:
                    draw.text((530, y_curr), line, fill=(20, 30, 50), font=font_body)
                bbox = draw.textbbox((0, 0), line, font=font_body)
                line_h = bbox[3] - bbox[1]
                y_curr += line_h + 10
            y_curr += 6

    out_path = os.path.join(DOWNLOADS_DIR, "SCAMPER_PhysioTwin_Edited_Typed.png")
    im.save(out_path, quality=95)
    print("Generated:", out_path)
    return out_path, im

def generate_handwritten_scan():
    clean_scanned_template()
    im = Image.open(CLEAN_TEMPLATE_PATH).convert("RGB")
    draw = ImageDraw.Draw(im)

    font_hdr = ImageFont.truetype(r"C:\Windows\Fonts\segoeprb.ttf", 22)
    font_bullet = ImageFont.truetype(r"C:\Windows\Fonts\segoeprb.ttf", 20)
    font_body = ImageFont.truetype(r"C:\Windows\Fonts\segoepr.ttf", 18)
    blue_ink = (16, 52, 138)  # Natural blue ballpoint/gel pen ink

    # Header
    draw.text((165, 215), HEADER_INFO["team_name"], fill=blue_ink, font=font_hdr)
    draw.text((720, 215), HEADER_INFO["team_lead"], fill=blue_ink, font=font_hdr)
    draw.text((1205, 215), HEADER_INFO["date"], fill=blue_ink, font=font_hdr)

    max_w = 900
    for section in SCAMPER_DATA:
        y_curr = section["y_start"] + 10
        for pt in section["points"]:
            lines = wrap_text(pt, font_body, max_w - 30, draw)
            for i, line in enumerate(lines):
                if i == 0:
                    draw.text((505, y_curr), "•", fill=blue_ink, font=font_bullet)
                    draw.text((530, y_curr), line, fill=blue_ink, font=font_body)
                else:
                    draw.text((530, y_curr), line, fill=blue_ink, font=font_body)
                bbox = draw.textbbox((0, 0), line, font=font_body)
                line_h = bbox[3] - bbox[1]
                y_curr += line_h + 9
            y_curr += 5

    out_path = os.path.join(DOWNLOADS_DIR, "SCAMPER_PhysioTwin_Edited_Handwritten.png")
    im.save(out_path, quality=95)
    print("Generated:", out_path)
    return out_path, im

def generate_pristine_digital_sheet():
    # High resolution 2480 x 3508 (A4 at 300 DPI)
    W, H = 2480, 3508
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)

    # Fonts
    font_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 52)
    font_subtitle = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 32)
    font_hdr_label = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 28)
    font_hdr_val = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 28)
    font_letter = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 56)
    font_sec_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 32)
    font_sec_desc = ImageFont.truetype(r"C:\Windows\Fonts\segoeuii.ttf", 24)
    font_body = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 26)
    font_bullet = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 28)

    # Header Card Background
    draw.rectangle([100, 80, W - 100, 220], fill=(248, 250, 254), outline=(220, 228, 240), width=2)
    draw.text((W//2, 125), "SCAMPER", fill=(20, 35, 65), font=font_title, anchor="mm")
    draw.text((W//2, 175), "Design Thinking & Innovation — Ideation Framework", fill=(70, 90, 120), font=font_subtitle, anchor="mm")

    # Metadata Strip
    draw.rectangle([100, 240, W - 100, 330], fill=(255, 255, 255), outline=(200, 212, 230), width=2)
    
    # Team Name
    draw.text((130, 285), "Team Name:", fill=(25, 40, 70), font=font_hdr_label, anchor="lm")
    draw.text((310, 285), HEADER_INFO["team_name"], fill=(15, 80, 180), font=font_hdr_label, anchor="lm")

    # Team Lead
    draw.text((950, 285), "Team Lead Roll no. & Name:", fill=(25, 40, 70), font=font_hdr_label, anchor="lm")
    draw.text((1360, 285), HEADER_INFO["team_lead"], fill=(15, 80, 180), font=font_hdr_label, anchor="lm")

    # Date
    draw.text((2050, 285), "Date:", fill=(25, 40, 70), font=font_hdr_label, anchor="lm")
    draw.text((2140, 285), HEADER_INFO["date"], fill=(15, 80, 180), font=font_hdr_label, anchor="lm")

    # Project Banner
    draw.rounded_rectangle([100, 350, W - 100, 420], radius=10, fill=(235, 243, 255), outline=(180, 210, 250), width=2)
    draw.text((W//2, 385), "PROJECT: PHYSIOTWIN — AI-Powered Digital Twin for Biomechanical Posture & Rehabilitation", fill=(10, 60, 150), font=font_sec_title, anchor="mm")

    # Prompts for each letter
    prompts_desc = {
        "S": "What can you swap out? (material, step, person, rule)",
        "C": "What can you merge or bundle together?",
        "A": "What can you borrow from something else?",
        "M": "What can you magnify, shrink, or exaggerate?",
        "P": "Who else could use it? What else could it do?",
        "E": "What can you remove or simplify?",
        "R": "What if you flipped the order or reversed it?"
    }

    colors = [
        (41, 128, 185),   # S Blue
        (39, 174, 96),    # C Green
        (211, 84, 0),     # A Orange
        (142, 68, 173),   # M Purple
        (22, 160, 133),   # P Teal
        (192, 57, 43),    # E Red
        (44, 62, 80)      # R Dark Slate
    ]

    # Render 7 Rows
    y_start = 445
    row_h = (H - y_start - 100) // 7

    for idx, section in enumerate(SCAMPER_DATA):
        y0 = y_start + idx * row_h
        y1 = y0 + row_h - 15
        color = colors[idx]

        # Row Card Container
        draw.rounded_rectangle([100, y0, W - 100, y1], radius=12, fill=(255, 255, 255), outline=(215, 225, 238), width=2)

        # Left Letter Badge
        draw.rounded_rectangle([120, y0 + 20, 230, y1 - 20], radius=10, fill=color)
        draw.text((175, (y0 + y1)//2), section["letter"], fill=(255, 255, 255), font=font_letter, anchor="mm")

        # Prompt & Question Column
        draw.text((255, y0 + 35), section["title"], fill=color, font=font_sec_title)
        draw.text((255, y0 + 80), prompts_desc[section["letter"]], fill=(95, 110, 130), font=font_sec_desc)

        # Vertical Divider
        draw.line([(850, y0 + 15), (850, y1 - 15)], fill=(225, 233, 245), width=2)

        # Responses on Right Column
        y_text = y0 + 35
        for pt in section["points"]:
            lines = wrap_text(pt, font_body, W - 100 - 890, draw)
            for l_idx, line in enumerate(lines):
                if l_idx == 0:
                    draw.text((880, y_text), "•", fill=color, font=font_bullet)
                    draw.text((915, y_text), line, fill=(30, 41, 59), font=font_body)
                else:
                    draw.text((915, y_text), line, fill=(30, 41, 59), font=font_body)
                bbox = draw.textbbox((0, 0), line, font=font_body)
                y_text += (bbox[3] - bbox[1]) + 14
            y_text += 8

    # Footer
    draw.text((W//2, H - 50), "Department of Artificial Intelligence & Data Science | Sri Eshwar College of Engineering", fill=(120, 140, 165), font=font_sec_desc, anchor="mm")

    out_path = os.path.join(DOWNLOADS_DIR, "SCAMPER_PhysioTwin_Digital_HD.png")
    im.save(out_path, quality=95)
    print("Generated:", out_path)
    return out_path, im

if __name__ == "__main__":
    p_typed, im_typed = generate_typed_scan()
    p_hand, im_hand = generate_handwritten_scan()
    p_dig, im_dig = generate_pristine_digital_sheet()

    # Save PDF version
    pdf_path = os.path.join(DOWNLOADS_DIR, "SCAMPER_PhysioTwin_Edited.pdf")
    im_typed.save(pdf_path, "PDF", resolution=100.0)
    print("Generated PDF:", pdf_path)

    # Also update report_assets for project documentation
    report_assets_dir = r"c:\projects\physio-twin\report_assets"
    if os.path.exists(report_assets_dir):
        im_typed.save(os.path.join(report_assets_dir, "fig5_1_scamper_sheet.png"))
        im_typed.save(os.path.join(report_assets_dir, "fig5_1_scamper_sheet.jpeg"), quality=95)
        print("Updated report_assets/fig5_1_scamper_sheet images!")
