import os
from pathlib import Path

template = Path('/root/Madereal/scripts/template.html').read_text()

def process_file(path, content):
    with open(path, 'w') as f:
        f.write(template.replace('<!-- CONTENT_REPLACE -->', content))

# Services pages
for svc in ['tradesman-websites', 'small-business-websites']:
     content = Path(f'/root/Madereal/services/{svc}.html').read_text()
     process_file(f'/root/Madereal/services/{svc}.html', content)

# (Re-run for others if needed, omitted here for brevity)

