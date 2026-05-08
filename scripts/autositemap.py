import os

# Configuration: Pages to ignore in nav/footer
IGNORE_NAV = ['index.html', 'get-started.html', 'privacy.html', 'faq.html', 'graphic-design.html', 'printing.html']

def get_pages():
    pages = []
    for f in os.listdir('.'):
        if f.endswith('.html') and f not in IGNORE_NAV:
            pages.append(f)
    return sorted(pages)

def generate_sitemap(pages):
    with open('sitemap.xml', 'w') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for p in pages:
            f.write(f'  <url><loc>https://madereal.uk/{p}</loc></url>\n')
        f.write('</urlset>')

print("Sitemap generated.")
