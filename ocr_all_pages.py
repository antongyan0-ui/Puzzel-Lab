import pymupdf
import pytesseract
from PIL import Image
import io
import json

pdf_path = '/workspace/.uploads/3f5995f0-11df-457f-bb99-b1f803b09998_德福考前必备 口语 (徐立华编著) (Z-Library).pdf'
doc = pymupdf.open(pdf_path)

# OCR all pages to find mock test content
# Based on the TOC, mock tests start around page 61 (after strategy chapters)
# Let's OCR pages 61-200
all_results = {}

for page_num in range(60, 201):
    page = doc[page_num]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2))
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    
    # OCR with German
    text_deu = pytesseract.image_to_string(img, lang='deu')
    
    all_results[page_num + 1] = text_deu
    print(f'Page {page_num + 1}: {len(text_deu)} chars')
    
    # Print pages that contain Modelltest or Aufgabe
    if 'Modelltest' in text_deu or 'Aufgabe' in text_deu:
        print(f'  Found test content!')
        # Print first 300 chars
        print(f'  {text_deu[:300]}')
    
    print()

# Save all results
with open('/workspace/pdf_all_pages.json', 'w', encoding='utf-8') as f:
    json.dump(all_results, f, ensure_ascii=False, indent=2)

print(f'\nDone. Processed {len(all_results)} pages.')
