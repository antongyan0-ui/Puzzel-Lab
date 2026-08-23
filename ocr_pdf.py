import pymupdf  # PyMuPDF
import pytesseract
from PIL import Image
import io
import json

pdf_path = '/workspace/.uploads/3f5995f0-11df-457f-bb99-b1f803b09998_德福考前必备 口语 (徐立华编著) (Z-Library).pdf'
doc = pymupdf.open(pdf_path)

# First, let's OCR a few key pages to understand the book structure
# Let's try pages: 1 (cover), 5-10 (likely table of contents), and a few content pages
pages_to_ocr = list(range(0, 15)) + [20, 30, 50, 100, 150]

results = {}
for page_num in pages_to_ocr:
    if page_num >= len(doc):
        continue
    page = doc[page_num]
    # Render at 2x resolution for better OCR
    pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2))
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    
    # OCR with both German and Chinese
    text_deu = pytesseract.image_to_string(img, lang='deu')
    text_chi = pytesseract.image_to_string(img, lang='chi_sim')
    
    results[page_num + 1] = {
        'deu': text_deu[:2000],
        'chi': text_chi[:2000]
    }
    
    print(f'=== PAGE {page_num + 1} ===')
    print(f'[DEU]: {text_deu[:500]}')
    print(f'[CHI]: {text_chi[:500]}')
    print()

# Save all results
with open('/workspace/pdf_ocr_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f'\nDone. Processed {len(results)} pages.')
