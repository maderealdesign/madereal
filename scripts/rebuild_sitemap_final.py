import os
from pathlib import Path

# Add all .html files (excluding index/get-started) to sitemap
pages = [f for f in os.listdir('.') if f.endswith('.html') and f not in ['index.html', 'get-started.html']]
for root, dirs, files in os.walk('./services'):
    for f in files:
        if f.endswith('.html'): pages.append(f'services/{f}')

with open('sitemap.xml', 'w') as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for p in pages:
        f.write(f'<url><loc>https://madereal.uk/{p}</loc></url>')
    f.write('</urlset>')
