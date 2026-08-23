import fitz
import json
import re

pdf_path = '/workspace/.uploads/3f5995f0-11df-457f-bb99-b1f803b09998_德福考前必备 口语 (徐立华编著) (Z-Library).pdf'
doc = fitz.open(pdf_path)

print(f'Total pages: {len(doc)}')
print(f'Metadata: {doc.metadata}')
print('---')

# Extract text from all pages
all_text = []
for i, page in enumerate(doc):
    text = page.get_text()
    all_text.append(f'=== PAGE {i+1} ===\n{text}')

full_text = '\n'.join(all_text)
# Save to file for analysis
with open('/workspace/pdf_extracted.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)

# Print first 8000 chars to understand structure
print(full_text[:8000])
print('...')
print(f'\nTotal text length: {len(full_text)} chars')
