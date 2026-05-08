import os
from pathlib import Path

# Load components
header = Path('src/components/header.html').read_text()
footer = Path('src/components/footer.html').read_text()

# Create 'dist' folder
os.makedirs('dist', exist_ok=True)

# Build pages (using /src/pages as source)
for f in Path('src/pages').glob('*.html'):
    content = f.read_text()
    final = f'''<!DOCTYPE html>
<html>
<head><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></head>
<body class="bg-gray-50">{header}<main class="pt-24 min-h-screen">{content}</main>{footer}</body>
</html>'''
    Path(f'dist/{f.name}').write_text(final)
