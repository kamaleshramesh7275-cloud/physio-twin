import pymupdf
import os

doc = pymupdf.open(r"C:\Users\kamal\Downloads\Design Thinking and Innovation Project Report Final.pdf")
os.makedirs("report_assets", exist_ok=True)

xref_map = {
    274: "anna_univ_logo.png",
    273: "college_crest.jpeg",
    271: "college_accreditation.jpeg",
    283: "college_banner.jpeg",
    346: "fig1_1_design_thinking.jpeg",
    348: "fig3_1_field_visit.jpeg",
    349: "fig3_2_empathy_map.jpeg",
    350: "fig4_1_problem_canvas.jpeg",
    351: "fig4_2_hmw_statements.jpeg",
    352: "fig5_1_scamper_sheet.jpeg",
    353: "fig5_2_crazy8_sheet.jpeg",
    354: "fig6_1_block_diagram.jpeg",
    355: "fig6_2_workflow.jpeg",
    356: "fig6_3_login.jpeg",
    357: "fig6_4_dashboard.jpeg",
    358: "fig6_5_inventory.jpeg",
    359: "fig6_6_intelligence.jpeg",
    360: "fig8_1_bmc.jpeg",
    364: "annexure_header.jpeg",
}

for xref, name in xref_map.items():
    b = doc.extract_image(xref)
    filepath = os.path.join("report_assets", name)
    with open(filepath, "wb") as f:
        f.write(b["image"])
    print(f"Extracted {name} ({b['width']}x{b['height']})")

print("All report assets extracted successfully!")
