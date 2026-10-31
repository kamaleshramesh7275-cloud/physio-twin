import re
import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    """Sets background color of a cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets cell margins in dxa (1 pt = 20 dxa)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_header_footer(doc):
    for s in doc.sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)

def create_report():
    doc = Document()
    add_header_footer(doc)

    # Set base normal style font
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    font.color.rgb = RGBColor(0x22, 0x22, 0x22)

    md_path = os.path.join(os.path.dirname(__file__), 'DESIGN_THINKING_PROJECT_REPORT_PHYSIOTWIN.md')
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    pages = content.split('\\newpage')

    for p_idx, page_text in enumerate(pages):
        lines = page_text.strip().split('\n')
        in_table = False
        table_rows = []
        in_code_block = False
        code_lines = []

        for line in lines:
            stripped = line.strip()

            # Handle code / ascii blocks
            if stripped.startswith('```'):
                if in_code_block:
                    in_code_block = False
                    p = doc.add_paragraph()
                    p.paragraph_format.space_before = Pt(6)
                    p.paragraph_format.space_after = Pt(6)
                    p.paragraph_format.line_spacing = 1.0
                    run = p.add_run('\n'.join(code_lines))
                    run.font.name = 'Courier New'
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
                    code_lines = []
                else:
                    in_code_block = True
                    code_lines = []
                continue

            if in_code_block:
                code_lines.append(line)
                continue

            # Handle Markdown Tables
            if stripped.startswith('|') and stripped.endswith('|'):
                # Check if it's separator row
                if re.match(r'^\|[\s\-:]+(\|[\s\-:]+)+\|$', stripped):
                    continue
                # Extract columns
                cols = [c.strip() for c in stripped.strip('|').split('|')]
                table_rows.append(cols)
                in_table = True
                continue
            else:
                if in_table and table_rows:
                    # Flush table
                    num_cols = max(len(r) for r in table_rows)
                    tbl = doc.add_table(rows=len(table_rows), cols=num_cols)
                    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                    tbl.autofit = True

                    for r_idx, row_data in enumerate(table_rows):
                        row = tbl.rows[r_idx]
                        is_header = (r_idx == 0)
                        for c_idx in range(num_cols):
                            cell = row.cells[c_idx]
                            val = row_data[c_idx] if c_idx < len(row_data) else ""
                            # strip formatting like **
                            clean_val = val.replace('**', '').replace('<br>', '\n')
                            cell.text = clean_val
                            set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
                            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

                            if is_header:
                                set_cell_background(cell, "2C3E50")
                                for p in cell.paragraphs:
                                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                                    for r in p.runs:
                                        r.font.bold = True
                                        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                                        r.font.size = Pt(10)
                            else:
                                if r_idx % 2 == 1:
                                    set_cell_background(cell, "F8F9FA")
                                else:
                                    set_cell_background(cell, "FFFFFF")
                                for p in cell.paragraphs:
                                    for r in p.runs:
                                        r.font.size = Pt(10)

                    doc.add_paragraph() # Spacing
                    table_rows = []
                    in_table = False

            if not stripped:
                continue

            if stripped == '---':
                continue

            # Headings
            if stripped.startswith('# '):
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(18)
                p.paragraph_format.space_after = Pt(10)
                p.paragraph_format.keep_with_next = True
                run = p.add_run(stripped[2:])
                run.font.bold = True
                run.font.size = Pt(18)
                run.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D) # Academic Navy
                if p_idx == 0:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                continue

            if stripped.startswith('## '):
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(14)
                p.paragraph_format.space_after = Pt(6)
                p.paragraph_format.keep_with_next = True
                run = p.add_run(stripped[3:])
                run.font.bold = True
                run.font.size = Pt(14)
                run.font.color.rgb = RGBColor(0x2C, 0x3E, 0x50)
                continue

            if stripped.startswith('### '):
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(10)
                p.paragraph_format.space_after = Pt(4)
                p.paragraph_format.keep_with_next = True
                run = p.add_run(stripped[4:])
                run.font.bold = True
                run.font.size = Pt(12)
                run.font.color.rgb = RGBColor(0x34, 0x49, 0x5E)
                continue

            if stripped.startswith('#### '):
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(8)
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.keep_with_next = True
                run = p.add_run(stripped[5:])
                run.font.bold = True
                run.font.size = Pt(11.5)
                continue

            # Blockquotes
            if stripped.startswith('> '):
                p = doc.add_paragraph()
                p.paragraph_format.left_indent = Inches(0.5)
                p.paragraph_format.right_indent = Inches(0.5)
                p.paragraph_format.space_before = Pt(6)
                p.paragraph_format.space_after = Pt(6)
                run = p.add_run(stripped[2:])
                run.font.italic = True
                run.font.bold = True
                run.font.color.rgb = RGBColor(0x2C, 0x3E, 0x50)
                continue

            # Bullet points
            if stripped.startswith('- ') or stripped.startswith('* '):
                p = doc.add_paragraph(style='List Bullet')
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(3)
                p.paragraph_format.line_spacing = 1.15
                raw_text = stripped[2:]
                parse_markdown_text(p, raw_text)
                continue

            # Numbered items
            m = re.match(r'^(\d+)\.\s+(.*)', stripped)
            if m:
                p = doc.add_paragraph(style='List Number')
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(3)
                p.paragraph_format.line_spacing = 1.15
                parse_markdown_text(p, m.group(2))
                continue

            # Normal paragraphs
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.25

            if p_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

            parse_markdown_text(p, stripped)

        # Flush any remaining table on page
        if in_table and table_rows:
            num_cols = max(len(r) for r in table_rows)
            tbl = doc.add_table(rows=len(table_rows), cols=num_cols)
            tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            for r_idx, row_data in enumerate(table_rows):
                row = tbl.rows[r_idx]
                is_header = (r_idx == 0)
                for c_idx in range(num_cols):
                    cell = row.cells[c_idx]
                    val = row_data[c_idx] if c_idx < len(row_data) else ""
                    clean_val = val.replace('**', '').replace('<br>', '\n')
                    cell.text = clean_val
                    set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
                    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                    if is_header:
                        set_cell_background(cell, "2C3E50")
                        for p in cell.paragraphs:
                            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                            for r in p.runs:
                                r.font.bold = True
                                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                                r.font.size = Pt(10)
                    else:
                        if r_idx % 2 == 1:
                            set_cell_background(cell, "F8F9FA")
                        for p in cell.paragraphs:
                            for r in p.runs:
                                r.font.size = Pt(10)
            doc.add_paragraph()
            table_rows = []
            in_table = False

        if p_idx < len(pages) - 1:
            doc.add_page_break()

    out_path = os.path.join(os.path.dirname(__file__), 'PhysioTwin_Design_Thinking_Project_Report.docx')
    doc.save(out_path)
    print(f"Report generated successfully at: {out_path}")

def parse_markdown_text(paragraph, text):
    """Parses bold, italic and raw text into docx runs."""
    # Pattern to tokenize bold **text** and regular text
    tokens = re.split(r'(\*\*.*?\*\*|\*.*?\*)', text)
    for token in tokens:
        if not token:
            continue
        if token.startswith('**') and token.endswith('**'):
            run = paragraph.add_run(token[2:-2])
            run.font.bold = True
        elif token.startswith('*') and token.endswith('*'):
            run = paragraph.add_run(token[1:-1])
            run.font.italic = True
        else:
            # Clean any remaining inline math formatting e.g. $...$
            clean = token.replace('$', '')
            paragraph.add_run(clean)

if __name__ == '__main__':
    create_report()
