import os
from pathlib import Path

header = Path('/root/Madereal/components/header.html').read_text()
footer = Path('/root/Madereal/components/footer.html').read_text()

for f in Path('/root/Madereal').glob('*.html'):
    if f.name in ['get-started.html']: # index.html will be updated separately
         continue
    
    # Read the full file
    raw = f.read_text()
    # If the file has a main tag, extract only the inner content
    if "<main" in raw and "</main>" in raw:
        content = raw.split("<main", 1)[1].split(">", 1)[1].rsplit("</main>", 1)[0]
    else:
        content = raw
    
    # Reconstruct
    new_page = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50 text-gray-900">
{header}
<main class="pt-24 min-h-screen">
{content}
</main>
{footer}
</body>
</html>'''
    f.write_text(new_page)
