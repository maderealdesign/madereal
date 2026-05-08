import os
from pathlib import Path

# Load shared components using absolute paths
header = Path('/root/Madereal/components/header.html').read_text()
footer = Path('/root/Madereal/components/footer.html').read_text()

# Rebuild every file in the root
for f in Path('/root/Madereal').glob('*.html'):
    if f.name in ['index.html', 'get-started.html']:
        continue
    
    # Extract only the body content
    raw = f.read_text()
    if '<main' in raw and '</main>' in raw:
        content = raw.split('<main')[1].split('</main>')[0]
        # remove tag name from the start split
        content = ">" + content.split(">", 1)[1] if ">" in content.split(">", 1) else content
    else:
        content = raw

    full_page = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <title>MadeReal Design | Lancashire</title>
</head>
<body class="bg-gray-50 text-gray-900">
{header}
<main class="pt-24 min-h-screen">
{content}
</main>
{footer}
</body>
</html>'''

    f.write_text(full_page)

# Update sitemap
pages = [f.name for f in Path('/root/Madereal').glob('*.html')]
with open('/root/Madereal/sitemap.xml', 'w') as s:
    s.write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for p in pages:
        s.write(f'<url><loc>https://madereal.uk/{p}</loc></url>')
    s.write('</urlset>')
