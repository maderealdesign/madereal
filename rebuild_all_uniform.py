import os
from pathlib import Path

template = Path('/root/Madereal/components/golden_template.html').read_text()

for f in Path('/root/Madereal').glob('*.html'):
    if f.name in ['get-started.html', 'index.html', 'golden_template.html']:
        continue
    
    # Extract existing body if possible, otherwise wrap the file content
    raw = f.read_text()
    if "<main" in raw:
         # Simplified extraction: grab everything between <main> and </main>
         content = raw.split("<main", 1)[1].split(">", 1)[1].rsplit("</main>", 1)[0]
    else:
         content = raw

    with open(f, 'w') as p_file:
        p_file.write(template.replace('CONTENT_BODY', content))
