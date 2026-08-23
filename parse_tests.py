import json
import re

with open('/workspace/pdf_all_pages.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

# Parse mock tests from OCR results
mock_tests = {}
current_test = None

for page_num in sorted(pages.keys(), key=int):
    text = pages[page_num]
    
    # Find Modelltest headers
    modelltest_matches = re.findall(r'Modelltest\s*(\d+)', text)
    for m in modelltest_matches:
        if m not in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']:
            continue
        test_num = int(m)
        if test_num not in mock_tests:
            mock_tests[test_num] = {
                'num': test_num,
                'title': f'Modelltest {test_num}',
                'pages': [],
                'tasks': {},
                'solutions': {}
            }
        current_test = test_num
    
    if current_test and int(page_num) >= 68:
        mock_tests[current_test]['pages'].append(int(page_num))
    
    # Find Aufgabe headers and extract content
    aufgabe_matches = re.finditer(r'Aufgabe\s*(\d+)', text)
    for match in aufgabe_matches:
        task_num = int(match.group(1))
        if task_num < 1 or task_num > 7:
            continue
        
        # Extract content after the Aufgabe header
        start = match.end()
        content = text[start:start+2000].strip()
        
        if current_test:
            if task_num not in mock_tests[current_test]['tasks']:
                mock_tests[current_test]['tasks'][task_num] = []
            mock_tests[current_test]['tasks'][task_num].append({
                'page': page_num,
                'content': content[:500]
            })

# Print summary
for num in sorted(mock_tests.keys()):
    test = mock_tests[num]
    print(f'\n=== {test["title"]} ===')
    print(f'  Pages: {test["pages"]}')
    for task_num in sorted(test['tasks'].keys()):
        task = test['tasks'][task_num]
        print(f'  Aufgabe {task_num}: {len(task)} entries')
        if task:
            print(f'    First: {task[0]["content"][:150]}')

# Save structured data
with open('/workspace/testdaf_structure.json', 'w', encoding='utf-8') as f:
    json.dump(mock_tests, f, ensure_ascii=False, indent=2)

print(f'\n\nTotal mock tests found: {len(mock_tests)}')
