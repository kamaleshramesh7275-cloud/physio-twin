import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "report_assets")

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="000000", sz="4"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def set_page_border(section):
    sectPr = section._sectPr
    for child in list(sectPr):
        if child.tag.endswith('pgBorders'):
            sectPr.remove(child)
    borders_xml = parse_xml(
        f'<w:pgBorders {nsdecls("w")} w:offsetFrom="page">'
        '<w:top w:val="single" w:sz="6" w:space="24" w:color="000000"/>'
        '<w:left w:val="single" w:sz="6" w:space="24" w:color="000000"/>'
        '<w:bottom w:val="single" w:sz="6" w:space="24" w:color="000000"/>'
        '<w:right w:val="single" w:sz="6" w:space="24" w:color="000000"/>'
        '</w:pgBorders>'
    )
    sectPr.append(borders_xml)

def set_paragraph_bottom_border(paragraph):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="12" w:space="4" w:color="000000"/></w:pBdr>')
    pPr.append(pBdr)

def add_callout_box(doc, text_lines):
    """Renders formatted code or ascii box matching academic style."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F8F9FA")
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        '<w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        '<w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        '<w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        '</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.line_spacing = 1.05
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run("\n".join(text_lines))
    run.font.name = "Consolas"
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(0x22, 0x22, 0x22)
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def build_full_report():
    doc = Document()
    
    # Configure A4 / standard margins
    section = doc.sections[0]
    section.page_width = Inches(8.27)  # A4 width
    section.page_height = Inches(11.69) # A4 height
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)
    set_page_border(section)

    # Set normal style
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(13)
    font.color.rgb = RGBColor(0, 0, 0)

    # =========================================================================
    # PAGE 1: TITLE / COVER PAGE
    # =========================================================================
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(14)
    p_title.paragraph_format.line_spacing = 1.15
    run = p_title.add_run("PHYSIOTWIN: AI-POWERED DIGITAL TWIN PLATFORM FOR\nBIOMECHANICAL POSTURE ANALYSIS AND PHYSICAL REHABILITATION")
    run.font.name = "Arial"
    run.font.bold = True
    run.font.size = Pt(15.5)

    # 2-column table for middle section
    tbl_mid = doc.add_table(rows=1, cols=2)
    tbl_mid.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_mid.autofit = False
    
    # Set widths: Left col = 2.0 in, Right col = 4.4 in
    cell_l = tbl_mid.cell(0, 0)
    cell_r = tbl_mid.cell(0, 1)
    cell_l.width = Inches(2.1)
    cell_r.width = Inches(4.5)
    
    # Left Column: DESIGN THINKING PROJECT, PROJECT WORK BOX, BATCH
    pl1 = cell_l.paragraphs[0]
    pl1.paragraph_format.space_after = Pt(18)
    pl1.paragraph_format.line_spacing = 1.1
    r_dt = pl1.add_run("DESIGN\nTHINKING\nPROJECT\nNOVEMBER\n2026")
    r_dt.font.name = "Arial"
    r_dt.font.bold = True
    r_dt.font.size = Pt(15)

    # "PROJECT WORK" Box
    pl_box = cell_l.add_paragraph()
    pl_box.paragraph_format.space_before = Pt(28)
    pl_box.paragraph_format.space_after = Pt(28)
    pPr = pl_box._p.get_or_add_pPr()
    pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="18" w:space="6" w:color="000000"/></w:pBdr>')
    pPr.append(pBdr)
    r_pw = pl_box.add_run("PROJECT\nWORK")
    r_pw.font.name = "Franklin Gothic Heavy"
    r_pw.font.bold = True
    r_pw.font.size = Pt(18)

    pl_batch = cell_l.add_paragraph()
    pl_batch.paragraph_format.space_before = Pt(24)
    pl_batch.paragraph_format.line_spacing = 1.1
    r_bt = pl_batch.add_run("BATCH\n2025 - 2029")
    r_bt.font.name = "Arial"
    r_bt.font.bold = True
    r_bt.font.size = Pt(15)

    # Right Column: Submissions, Anna Univ Logo, Names, Supervisor
    pr1 = cell_r.paragraphs[0]
    pr1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    pr1.paragraph_format.line_spacing = 1.15
    pr1.paragraph_format.space_after = Pt(10)
    r_rep = pr1.add_run(
        "DESIGN THINKING AND INNOVATION PROJECT REPORT\n"
        "SUBMITTED IN PARTIAL FULFILLMENT OF REQUIREMENTS FOR\n"
        "THE AWARD OF THE\n"
        "DEGREE OF BACHELOR OF TECHNOLOGY\n"
        "IN ARTIFICIAL INTELLIGENCE AND DATA SCIENCE\n"
        "OF THE ANNA UNIVERSITY\n"
    )
    r_rep.font.name = "Arial Narrow"
    r_rep.font.size = Pt(11)

    # Anna University Logo
    pr_logo = cell_r.add_paragraph()
    pr_logo.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    pr_logo.paragraph_format.space_after = Pt(10)
    anna_logo_path = os.path.join(ASSETS_DIR, "anna_univ_logo.png")
    if os.path.exists(anna_logo_path):
        pr_logo.add_run().add_picture(anna_logo_path, width=Inches(1.0))

    # Submitted by
    pr_sub = cell_r.add_paragraph()
    pr_sub.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    pr_sub.paragraph_format.line_spacing = 1.15
    pr_sub.paragraph_format.space_after = Pt(12)
    r_sb = pr_sub.add_run("Submitted by\n")
    r_sb.font.name = "Arial"
    r_sb.font.size = Pt(11)
    
    r_names = pr_sub.add_run(
        "KAMALESH RAMESH - 722825243118\n"
        "MOHAN A - 722825243121\n"
        "BATCH MEMBER 3 - 7228252431XX\n"
    )
    r_names.font.name = "Arial"
    r_names.font.bold = True
    r_names.font.size = Pt(11)

    # Guidance
    pr_guide = cell_r.add_paragraph()
    pr_guide.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    pr_guide.paragraph_format.line_spacing = 1.15
    pr_guide.paragraph_format.space_before = Pt(8)
    r_ug = pr_guide.add_run("Under the Guidance of\n")
    r_ug.font.name = "Arial"
    r_ug.font.size = Pt(11)
    r_gd = pr_guide.add_run(
        "Mr. R. Divakar, M.E., (Ph.D).,\n"
        "Assistant Professor\n"
        "AI&DS"
    )
    r_gd.font.name = "Arial"
    r_gd.font.bold = True
    r_gd.font.size = Pt(11)

    # Bottom College Banner Section (3 columns: Crest | College Name | Accreditation)
    tbl_bot = doc.add_table(rows=1, cols=3)
    tbl_bot.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_bot.autofit = False
    cb_l = tbl_bot.cell(0, 0)
    cb_m = tbl_bot.cell(0, 1)
    cb_r = tbl_bot.cell(0, 2)
    cb_l.width = Inches(1.1)
    cb_m.width = Inches(4.3)
    cb_r.width = Inches(1.2)

    crest_path = os.path.join(ASSETS_DIR, "college_crest.png")
    if os.path.exists(crest_path):
        try:
            cb_l.paragraphs[0].add_run().add_picture(crest_path, width=Inches(0.75))
        except Exception as e:
            print(f"Warning inserting crest: {e}")

    pm = cb_m.paragraphs[0]
    pm.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pm.paragraph_format.line_spacing = 1.05
    r_cname = pm.add_run("Sri Eshwar College of Engineering\n")
    r_cname.font.name = "Arial"
    r_cname.font.bold = True
    r_cname.font.size = Pt(14)
    r_csub = pm.add_run("(An Autonomous Institution)\n")
    r_csub.font.name = "Arial"
    r_csub.font.size = Pt(9.5)
    r_cdet = pm.add_run(
        "Kinathukadavu (Tk), Coimbatore - 641 202, Tamil Nadu\n"
        "Approved by AICTE, New Delhi and Affiliated to Anna University, Chennai"
    )
    r_cdet.font.name = "Arial"
    r_cdet.font.size = Pt(7.5)

    accred_path = os.path.join(ASSETS_DIR, "college_accreditation.png")
    if os.path.exists(accred_path):
        try:
            cb_r.paragraphs[0].add_run().add_picture(accred_path, width=Inches(1.05))
        except Exception as e:
            print(f"Warning inserting accred: {e}")

    doc.add_page_break()

    # =========================================================================
    # PAGE 2: BONAFIDE CERTIFICATE
    # =========================================================================
    p_cert = doc.add_paragraph()
    p_cert.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cert.paragraph_format.space_before = Pt(16)
    p_cert.paragraph_format.space_after = Pt(28)
    r_bc = p_cert.add_run("BONAFIDE CERTIFICATE")
    r_bc.font.name = "Arial"
    r_bc.font.bold = True
    r_bc.font.size = Pt(14)

    p_cbody = doc.add_paragraph()
    p_cbody.paragraph_format.line_spacing = 1.3
    p_cbody.paragraph_format.space_after = Pt(18)
    r_cb1 = p_cbody.add_run("Certified that this Report titled ")
    r_cb1.font.size = Pt(13)
    r_cb2 = p_cbody.add_run('"PHYSIOTWIN: AI-POWERED DIGITAL TWIN PLATFORM FOR BIOMECHANICAL POSTURE ANALYSIS AND PHYSICAL REHABILITATION"')
    r_cb2.font.bold = True
    r_cb2.font.size = Pt(13)
    r_cb3 = p_cbody.add_run(" is the bonafide work of")
    r_cb3.font.size = Pt(13)

    # Table of students
    tbl_stud = doc.add_table(rows=3, cols=2)
    tbl_stud.alignment = WD_TABLE_ALIGNMENT.CENTER
    students = [
        ("KAMALESH RAMESH", "722825243118"),
        ("MOHAN A", "722825243121"),
        ("BATCH MEMBER 3", "7228252431XX")
    ]
    for idx, (name, roll) in enumerate(students):
        row = tbl_stud.rows[idx]
        c1, c2 = row.cells[0], row.cells[1]
        c1.width = Inches(2.8)
        c2.width = Inches(2.8)
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(3)
        p1.paragraph_format.space_after = Pt(3)
        r1 = p1.add_run(name)
        r1.font.bold = True
        r1.font.size = Pt(12)
        
        p2 = c2.paragraphs[0]
        p2.paragraph_format.space_before = Pt(3)
        p2.paragraph_format.space_after = Pt(3)
        r2 = p2.add_run(roll)
        r2.font.bold = True
        r2.font.size = Pt(12)

    p_super = doc.add_paragraph()
    p_super.paragraph_format.space_before = Pt(18)
    p_super.paragraph_format.space_after = Pt(36)
    r_sup = p_super.add_run("who carried out the project work under my supervision.")
    r_sup.font.size = Pt(13)

    # Signatures Table (HOD & Supervisor)
    tbl_sig = doc.add_table(rows=1, cols=2)
    tbl_sig.alignment = WD_TABLE_ALIGNMENT.CENTER
    s1, s2 = tbl_sig.cell(0, 0), tbl_sig.cell(0, 1)
    s1.width = Inches(3.2)
    s2.width = Inches(3.2)

    ps1 = s1.paragraphs[0]
    ps1.paragraph_format.line_spacing = 1.15
    ps1.add_run("-----------------------------------------\n").font.size = Pt(11)
    r_s1 = ps1.add_run("SIGNATURE\n")
    r_s1.font.bold = True
    r_s1.font.size = Pt(12)
    r_hod = ps1.add_run("Dr. G. Sathish Kumar, M.E., Ph.D.,\nHEAD OF THE DEPARTMENT\n")
    r_hod.font.bold = True
    r_hod.font.size = Pt(12)
    ps1.add_run("Artificial Intelligence and Data Science,\nSri Eshwar College of Engineering,\nCoimbatore - 641 202.").font.size = Pt(11)

    ps2 = s2.paragraphs[0]
    ps2.paragraph_format.line_spacing = 1.15
    ps2.add_run("-----------------------------------------\n").font.size = Pt(11)
    r_s2 = ps2.add_run("SIGNATURE\n")
    r_s2.font.bold = True
    r_s2.font.size = Pt(12)
    r_sv = ps2.add_run("Mr. R. Divakar, M.E., (Ph.D).,\nSUPERVISOR\nAssistant Professor,\n")
    r_sv.font.bold = True
    r_sv.font.size = Pt(12)
    ps2.add_run("Artificial Intelligence and Data Science,\nSri Eshwar College of Engineering,\nCoimbatore - 641 202.").font.size = Pt(11)

    p_viva = doc.add_paragraph()
    p_viva.paragraph_format.space_before = Pt(36)
    p_viva.paragraph_format.space_after = Pt(36)
    p_viva.paragraph_format.line_spacing = 1.2
    p_viva.add_run("Submitted for the Autonomous Semester End Examination for Design Thinking and Innovation Project Viva-Voce held on …………………………").font.size = Pt(12)

    # Examiners Table
    tbl_ex = doc.add_table(rows=1, cols=2)
    tbl_ex.alignment = WD_TABLE_ALIGNMENT.CENTER
    e1, e2 = tbl_ex.cell(0, 0), tbl_ex.cell(0, 1)
    e1.width = Inches(3.2)
    e2.width = Inches(3.2)

    pe1 = e1.paragraphs[0]
    pe1.paragraph_format.line_spacing = 1.15
    pe1.add_run("_________________________\n").font.bold = True
    pe1.add_run("INTERNAL EXAMINER").font.bold = True

    pe2 = e2.paragraphs[0]
    pe2.paragraph_format.line_spacing = 1.15
    pe2.add_run("_________________________\n").font.bold = True
    pe2.add_run("EXTERNAL EXAMINER").font.bold = True

    doc.add_page_break()

    # =========================================================================
    # PAGE 3: INSTITUTIONAL STATEMENTS
    # =========================================================================
    banner_path = os.path.join(ASSETS_DIR, "college_banner.png")
    if os.path.exists(banner_path):
        p_ban = doc.add_paragraph()
        p_ban.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_ban.paragraph_format.space_after = Pt(10)
        try:
            p_ban.add_run().add_picture(banner_path, width=Inches(5.6))
        except Exception as e:
            print(f"Warning inserting banner: {e}")

    def add_statement(heading, text=None, bullets=None):
        ph = doc.add_paragraph()
        ph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        ph.paragraph_format.space_before = Pt(10)
        ph.paragraph_format.space_after = Pt(3)
        r = ph.add_run(heading)
        r.font.name = "Times New Roman"
        r.font.bold = True
        r.font.size = Pt(11)
        
        if text:
            pt = doc.add_paragraph()
            pt.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            pt.paragraph_format.space_before = Pt(0)
            pt.paragraph_format.space_after = Pt(6)
            pt.paragraph_format.line_spacing = 1.15
            rt = pt.add_run(text)
            rt.font.name = "Times New Roman"
            rt.font.size = Pt(11)
            
        if bullets:
            for b in bullets:
                pb = doc.add_paragraph(style='List Bullet')
                pb.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                pb.paragraph_format.space_before = Pt(1)
                pb.paragraph_format.space_after = Pt(2)
                pb.paragraph_format.line_spacing = 1.15
                rb = pb.add_run(b)
                rb.font.name = "Times New Roman"
                rb.font.size = Pt(11)

    add_statement("QUALITY POLICY", "To establish a system of Quality Enhancement, which would on a continuous basis evaluate and enhance the quality of teaching - learning, research and extension activities of the institution, leading to improvements in all processes, enabling the institution to attain excellence.")
    add_statement("INSTITUTE VISION", "To be recognized as a premier institution, grooming students into globally acknowledged engineering professionals.")
    add_statement("INSTITUTE MISSION", bullets=[
        "Providing outcome and value-based engineering education",
        "Nurturing research and entrepreneurial culture",
        "Enabling students to be industry ready and fulfill their career aspirations",
        "Grooming students through behavioral and leadership training programs",
        "Making students socially responsible"
    ])
    add_statement("DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE")
    add_statement("DEPARTMENT VISION", "To build a conducive academic and research environment in the stream of Artificial Intelligence and Data Science for enabling global education, research and entrepreneurship.")
    add_statement("DEPARTMENT MISSION", bullets=[
        "Update and enrich the curriculum by integrating global trends and technological advancements to ensure the academic excellence.",
        "Promote a research-driven environment by providing access to state-of-the-art infrastructure with emerging technologies.",
        "Empower the faculty through continuous upskilling, international collaborations, and active research engagement to provide globally competent education.",
        "Encourage student-centric, industry-aligned learning that nurtures innovation and entrepreneurship activities for solving real-world and societal challenges."
    ])

    doc.add_page_break()

    # =========================================================================
    # PAGE 4 & 5: PEOs, POs, PSOs
    # =========================================================================
    add_statement("PROGRAM EDUCATIONAL OBJECTIVES")
    peos = [
        ("PEO1: ", "Build a progressive professional career in industry, or pursue higher education, or succeed as an entrepreneur."),
        ("PEO2: ", "Excel in cutting-edge technologies of Artificial Intelligence and Data Science to address real world challenges."),
        ("PEO3: ", "Exhibit professional ethics, involvement in team work in their profession and contributing to the advancement of society.")
    ]
    for tag, desc in peos:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        r1 = p.add_run(tag)
        r1.font.bold = True
        r1.font.size = Pt(11)
        r2 = p.add_run(desc)
        r2.font.size = Pt(11)

    add_statement("PROGRAM OUTCOMES")
    pos = [
        ("PO1: Engineering Knowledge: ", "Apply knowledge of mathematics, natural science, computing, engineering fundamentals and an engineering specialization to develop the solution of complex engineering problems."),
        ("PO2: Problem Analysis: ", "Identify, formulate, review research literature and analyze complex engineering problems reaching substantiated conclusions with consideration for sustainable development."),
        ("PO3: Design/Development of Solutions: ", "Design creative solutions for complex engineering problems and design/develop systems/components/processes to meet identified needs with consideration for public health and safety, whole-life cost, net zero carbon, culture, society, and environment as required."),
        ("PO4: Conduct Investigations of Complex Problems: ", "Conduct investigations of complex engineering problems using research-based knowledge including design of experiments, modelling, analysis & interpretation of data to provide valid conclusions."),
        ("PO5: Engineering Tool Usage: ", "Create, select and apply appropriate techniques, resources and modern engineering & IT tools, including prediction and modelling recognizing their limitations to solve complex engineering problems."),
        ("PO6: The Engineer and The World: ", "Analyze and evaluate societal and environmental aspects while solving complex engineering problems for its impact on sustainability with reference to economy, health, safety, legal framework, culture, and environment."),
        ("PO7: Ethics: ", "Apply ethical principles and commit to professional ethics, human values, diversity and inclusion; adhere to national & international laws."),
        ("PO8: Individual and Collaborative Teamwork: ", "Function effectively as an individual, and as a member or leader in diverse/multi-disciplinary teams."),
        ("PO9: Communication: ", "Communicate effectively and inclusively within the engineering community and society at large, such as being able to comprehend and write effective reports and design documentation, make effective presentations considering cultural, language, and learning differences."),
        ("PO10: Project Management and Finance: ", "Apply knowledge and understanding of engineering management principles and economic decision-making and apply these to one's own work, as a member and leader in a team, and to manage projects and in multidisciplinary environments."),
        ("PO11: Life-Long Learning: ", "Recognize the need for, and have the preparation and ability for i) independent and life-long learning ii) adaptability to new and emerging technologies and iii) critical thinking in the broadest context of technological change.")
    ]
    for tag, desc in pos:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        r1 = p.add_run(tag)
        r1.font.bold = True
        r1.font.size = Pt(11)
        r2 = p.add_run(desc)
        r2.font.size = Pt(11)

    doc.add_page_break()

    add_statement("PROGRAM SPECIFIC OUTCOMES")
    psos = [
        ("PSO1: ", "Apply programming, problem-solving, and hardware integration skills with AI and data science to design intelligent, secure and efficient systems."),
        ("PSO2: ", "Develop an AI-driven application by exploring optimized coding competencies using predictive modeling and data analytics technologies.")
    ]
    for tag, desc in psos:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        r1 = p.add_run(tag)
        r1.font.bold = True
        r1.font.size = Pt(11)
        r2 = p.add_run(desc)
        r2.font.size = Pt(11)

    doc.add_page_break()

    # =========================================================================
    # PARSE REMAINING DOCUMENT SECTIONS (ABSTRACT, TOC, CHAPTERS 1-9, ANNEXURES)
    # =========================================================================
    md_path = os.path.join(os.path.dirname(__file__), "DESIGN_THINKING_PROJECT_REPORT_PHYSIOTWIN.md")
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    # Split into sections after PSOs
    abstract_marker = "## ABSTRACT"
    main_body = md_text[md_text.find(abstract_marker):]

    pages = main_body.split("\\newpage")

    fig_file_map = {
        "Fig. 1.1": "fig1_1_design_thinking.png",
        "Fig 1.1": "fig1_1_design_thinking.png",
        "Fig. 3.1": "fig3_1_field_visit.png",
        "Fig 3.1": "fig3_1_field_visit.png",
        "Fig. 3.2": "fig3_2_empathy_map.png",
        "Fig 3.2": "fig3_2_empathy_map.png",
        "Fig. 4.1": "fig4_1_problem_canvas.png",
        "Fig 4.1": "fig4_1_problem_canvas.png",
        "Fig. 4.2": "fig4_2_hmw_statements.png",
        "Fig 4.2": "fig4_2_hmw_statements.png",
        "Fig. 5.1": "fig5_1_scamper_sheet.png",
        "Fig 5.1": "fig5_1_scamper_sheet.png",
        "Fig. 5.2": "fig5_2_crazy8_sheet.png",
        "Fig 5.2": "fig5_2_crazy8_sheet.png",
        "Fig. 6.1": "fig6_1_block_diagram.png",
        "Fig 6.1": "fig6_1_block_diagram.png",
        "Fig. 6.2": "fig6_2_workflow.png",
        "Fig 6.2": "fig6_2_workflow.png",
        "Fig. 6.3": "fig6_3_login.png",
        "Fig 6.3": "fig6_3_login.png",
        "Fig. 6.4": "fig6_4_dashboard.png",
        "Fig 6.4": "fig6_4_dashboard.png",
        "Fig. 6.5": "fig6_5_inventory.png",
        "Fig 6.5": "fig6_5_inventory.png",
        "Fig. 6.6": "fig6_6_intelligence.png",
        "Fig 6.6": "fig6_6_intelligence.png",
        "Fig. 8.1": "fig8_1_bmc.png",
        "Fig 8.1": "fig8_1_bmc.png",
    }

    for p_idx, page_content in enumerate(pages):
        lines = page_content.strip().split("\n")
        in_table = False
        table_rows = []
        in_code_block = False
        code_lines = []

        for line in lines:
            stripped = line.strip()

            if stripped.startswith("```"):
                if in_code_block:
                    in_code_block = False
                    add_callout_box(doc, code_lines)
                    code_lines = []
                else:
                    in_code_block = True
                    code_lines = []
                continue

            if in_code_block:
                code_lines.append(line)
                continue

            # Check markdown table
            if stripped.startswith("|") and stripped.endswith("|"):
                if re.match(r"^\|[\s\-:]+(\|[\s\-:]+)+\|$", stripped):
                    continue
                cols = [c.strip() for c in stripped.strip("|").split("|")]
                table_rows.append(cols)
                in_table = True
                continue
            else:
                if in_table and table_rows:
                    num_cols = max(len(r) for r in table_rows)
                    tbl = doc.add_table(rows=len(table_rows), cols=num_cols)
                    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                    set_table_borders(tbl, color="000000", sz="4")

                    for r_idx, row_data in enumerate(table_rows):
                        row = tbl.rows[r_idx]
                        is_header = (r_idx == 0)
                        for c_idx in range(num_cols):
                            cell = row.cells[c_idx]
                            val = row_data[c_idx] if c_idx < len(row_data) else ""
                            clean_val = val.replace("**", "").replace("<br>", "\n")
                            cell.text = clean_val
                            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
                            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

                            if is_header:
                                set_cell_background(cell, "EAECEE")
                                for p in cell.paragraphs:
                                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                                    for r in p.runs:
                                        r.font.name = "Times New Roman"
                                        r.font.bold = True
                                        r.font.color.rgb = RGBColor(0, 0, 0)
                                        r.font.size = Pt(11)
                            else:
                                for p in cell.paragraphs:
                                    for r in p.runs:
                                        r.font.name = "Times New Roman"
                                        r.font.size = Pt(10.5)

                    doc.add_paragraph().paragraph_format.space_after = Pt(4)
                    table_rows = []
                    in_table = False

            if not stripped or stripped == "---":
                continue

            # Check if this line is a figure caption and should have an image inserted above it
            inserted_img = False
            for fig_key, img_name in fig_file_map.items():
                if stripped.startswith(fig_key):
                    img_path = os.path.join(ASSETS_DIR, img_name)
                    if os.path.exists(img_path):
                        p_img = doc.add_paragraph()
                        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        p_img.paragraph_format.space_before = Pt(8)
                        try:
                            p_img.add_run().add_picture(img_path, width=Inches(5.2))
                        except Exception as e:
                            print(f"Warning inserting {img_name}: {e}")
                        inserted_img = True
                    break

            # Headings
            if stripped.startswith("# "):
                p = doc.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(16)
                p.paragraph_format.space_after = Pt(10)
                set_paragraph_bottom_border(p)
                r = p.add_run(stripped[2:])
                r.font.name = "Times New Roman"
                r.font.bold = True
                r.font.size = Pt(16)
                continue

            if stripped.startswith("## "):
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(14)
                p.paragraph_format.space_after = Pt(6)
                r = p.add_run(stripped[3:])
                r.font.name = "Times New Roman"
                r.font.bold = True
                r.font.size = Pt(14)
                continue

            if stripped.startswith("### "):
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(10)
                p.paragraph_format.space_after = Pt(4)
                r = p.add_run(stripped[4:])
                r.font.name = "Times New Roman"
                r.font.bold = True
                r.font.size = Pt(12)
                continue

            if stripped.startswith("#### "):
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(8)
                p.paragraph_format.space_after = Pt(2)
                r = p.add_run(stripped[5:])
                r.font.name = "Times New Roman"
                r.font.bold = True
                r.font.size = Pt(11.5)
                continue

            # Blockquotes
            if stripped.startswith("> "):
                p = doc.add_paragraph()
                p.paragraph_format.left_indent = Inches(0.4)
                p.paragraph_format.right_indent = Inches(0.4)
                p.paragraph_format.space_before = Pt(6)
                p.paragraph_format.space_after = Pt(6)
                r = p.add_run(stripped[2:])
                r.font.name = "Times New Roman"
                r.font.italic = True
                r.font.bold = True
                r.font.size = Pt(12)
                continue

            # Bullets
            if stripped.startswith("- ") or stripped.startswith("* "):
                p = doc.add_paragraph(style='List Bullet')
                p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                p.paragraph_format.space_before = Pt(1)
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.2
                parse_markdown_into_paragraph(p, stripped[2:])
                continue

            # Numbers
            m = re.match(r"^(\d+)\.\s+(.*)", stripped)
            if m:
                p = doc.add_paragraph(style='List Number')
                p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                p.paragraph_format.space_before = Pt(1)
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.2
                parse_markdown_into_paragraph(p, m.group(2))
                continue

            # Regular Paragraph
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.25

            # If figure caption, center it
            if stripped.startswith("Fig.") or stripped.startswith("Fig ") or stripped.startswith("Table "):
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_after = Pt(10)
                
            parse_markdown_into_paragraph(p, stripped)

        # Flush table at end of page if any
        if in_table and table_rows:
            num_cols = max(len(r) for r in table_rows)
            tbl = doc.add_table(rows=len(table_rows), cols=num_cols)
            tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            set_table_borders(tbl, color="000000", sz="4")
            for r_idx, row_data in enumerate(table_rows):
                row = tbl.rows[r_idx]
                is_header = (r_idx == 0)
                for c_idx in range(num_cols):
                    cell = row.cells[c_idx]
                    val = row_data[c_idx] if c_idx < len(row_data) else ""
                    clean_val = val.replace("**", "").replace("<br>", "\n")
                    cell.text = clean_val
                    set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
                    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                    if is_header:
                        set_cell_background(cell, "EAECEE")
                        for p in cell.paragraphs:
                            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                            for r in p.runs:
                                r.font.name = "Times New Roman"
                                r.font.bold = True
                                r.font.size = Pt(11)
                    else:
                        for p in cell.paragraphs:
                            for r in p.runs:
                                r.font.name = "Times New Roman"
                                r.font.size = Pt(10.5)
            doc.add_paragraph().paragraph_format.space_after = Pt(4)
            table_rows = []
            in_table = False

        if p_idx < len(pages) - 1:
            doc.add_page_break()

    # Save to workspace and downloads
    downloads_path = r"C:\Users\kamal\Downloads\PhysioTwin Design Thinking and Innovation Project Report Final.docx"
    downloads_docs_path = r"C:\Users\kamal\Downloads\PhysioTwin Design Thinking and Innovation Project Report Final.docs"
    local_path = os.path.join(os.path.dirname(__file__), "PhysioTwin_Design_Thinking_Project_Report.docx")

    doc.save(downloads_path)
    doc.save(downloads_docs_path)
    try:
        doc.save(local_path)
    except PermissionError:
        alt_path = os.path.join(os.path.dirname(__file__), "PhysioTwin_Design_Thinking_Project_Report_Updated.docx")
        doc.save(alt_path)
        print(f"Note: {local_path} was locked by Word, saved local copy to {alt_path}")
    print(f"Report successfully generated and saved to:\n  - {downloads_path}\n  - {downloads_docs_path}")

def parse_markdown_into_paragraph(paragraph, text):
    tokens = re.split(r'(\*\*.*?\*\*|\*.*?\*)', text)
    for token in tokens:
        if not token:
            continue
        if token.startswith("**") and token.endswith("**"):
            run = paragraph.add_run(token[2:-2])
            run.font.name = "Times New Roman"
            run.font.bold = True
            run.font.size = Pt(12.5)
        elif token.startswith("*") and token.endswith("*"):
            run = paragraph.add_run(token[1:-1])
            run.font.name = "Times New Roman"
            run.font.italic = True
            run.font.size = Pt(12.5)
        else:
            clean = token.replace("$", "")
            run = paragraph.add_run(clean)
            run.font.name = "Times New Roman"
            run.font.size = Pt(12.5)

if __name__ == "__main__":
    build_full_report()
