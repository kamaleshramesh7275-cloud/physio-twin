import pymupdf

doc = pymupdf.open(r"C:\Users\kamal\Downloads\Design Thinking and Innovation Project Report Final.pdf")

pages_to_check = [0, 1, 2, 5, 6, 8, 11]

for pno in pages_to_check:
    page = doc[pno]
    print(f"\n==================== PAGE {pno+1} (Rect: {page.rect}) ====================")
    blocks = page.get_text("dict")["blocks"]
    for b in blocks:
        if "lines" in b:
            for l in b["lines"]:
                line_str = " ".join(s["text"] for s in l["spans"]).strip()
                if line_str:
                    first_span = l["spans"][0]
                    font = first_span["font"]
                    size = round(first_span["size"], 1)
                    flags = first_span["flags"]
                    bbox = [round(x, 1) for x in l["bbox"]]
                    print(f"[{bbox[0]}, {bbox[1]}] (size={size}, font={font}, flags={flags}) : {line_str}")
