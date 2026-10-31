import pymupdf
import os

pdf_path = r"C:\Users\kamal\Downloads\Design Thinking and Innovation Project Report Final.pdf"
doc = pymupdf.open(pdf_path)
os.makedirs("extracted_assets", exist_ok=True)

print("Total pages:", len(doc))
for pno in range(len(doc)):
    page = doc[pno]
    images = page.get_images(full=True)
    if images:
        for idx, img in enumerate(images):
            xref = img[0]
            base_img = doc.extract_image(xref)
            ext = base_img["ext"]
            filename = f"extracted_assets/p{pno+1}_img{idx+1}.{ext}"
            with open(filename, "wb") as f:
                f.write(base_img["image"])
            print(f"Page {pno+1}: Saved {filename} ({base_img['width']}x{base_img['height']})")
