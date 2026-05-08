import os
from pathlib import Path

header = Path('src/components/header.html').read_text()
footer = Path('src/components/footer.html').read_text()

for f in Path('src/pages').glob('*.html'):
    # Pure clean rebuild: ignore junk, just template the core
    content = f.read_text()
    # Strip any potential junk markers if any
    final = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    Path(f'dist/{f.name}').write_text(final)
