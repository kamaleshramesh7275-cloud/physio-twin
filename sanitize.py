def sanitize_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace('–', '-').replace('—', ' - ').replace('’', "'").replace('“', '"').replace('”', '"')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Sanitized', filepath)

sanitize_file('generate_perfect_report.py')
sanitize_file('DESIGN_THINKING_PROJECT_REPORT_PHYSIOTWIN.md')
