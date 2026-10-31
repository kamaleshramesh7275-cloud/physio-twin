import pymupdf

doc = pymupdf.open(r"C:\Users\kamal\Downloads\Design Thinking and Innovation Project Report Final.pdf")
page1 = doc[0]
for idx, img_info in enumerate(page1.get_images()):
    xref = img_info[0]
    b = doc.extract_image(xref)
    print(f"p1 img{idx+1}: xref={xref}, ext={b['ext']}, dims={b['width']}x{b['height']}, len={len(b['image'])}")

page3 = doc[2]
for idx, img_info in enumerate(page3.get_images()):
    xref = img_info[0]
    b = doc.extract_image(xref)
    print(f"p3 img{idx+1}: xref={xref}, ext={b['ext']}, dims={b['width']}x{b['height']}, len={len(b['image'])}")
