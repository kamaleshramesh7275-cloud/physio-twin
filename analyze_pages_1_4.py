import pymupdf

doc = pymupdf.open(r"C:\Users\kamal\Downloads\Design Thinking and Innovation Project Report Final.pdf")

for pno in range(4):
    page = doc[pno]
    print(f"\n==================== PAGE {pno+1} ====================")
    blocks = page.get_text("dict")["blocks"]
    for b in blocks:
        if "lines" in b:
            for l in b["lines"]:
                line_str = " ".join(s["text"] for s in l["spans"]).strip()
                if line_str:
                    first_span = l["spans"][0]
                    font = first_span["font"]
                    size = round(first_span["size"], 1)
                    bbox = [round(x, 1) for x in l["bbox"]]
                    print(f"[{bbox[0]}, {bbox[1]}] (size={size}, font={font}) : {line_str}")
