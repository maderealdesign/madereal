import os
from pathlib import Path

template = Path('/root/Madereal/scripts/template.html').read_text()

pages = {
    'about.html': '<main class="max-w-3xl mx-auto py-20 px-6"><h1 class="text-5xl font-black mb-8">About MadeReal</h1><p>We believe local businesses in Lancashire deserve high-converting websites without the monthly subscription trap.</p></main>',
    'blog.html': '<main class="max-w-7xl mx-auto py-20 px-6"><h1 class="text-5xl font-black mb-12">Blog</h1><div class="grid md:grid-cols-3 gap-8"></div></main>',
    'faq.html': '<main class="max-w-3xl mx-auto py-20 px-6"><h1 class="text-5xl font-black mb-8">FAQ</h1><p>Common questions about our £197 web build services.</p></main>',
    'graphic-design.html': '<main class="max-w-4xl mx-auto py-20 px-6"><h1 class="text-5xl font-black mb-8">Graphic Design</h1><p>Professional graphic design services tailored to your local business.</p></main>',
    'printing.html': '<main class="max-w-4xl mx-auto py-20 px-6"><h1 class="text-5xl font-black mb-8">Printing Services</h1><p>Quality business printing for leaflets and marketing materials.</p></main>',
    'web-design-colne.html': '<main class="max-w-7xl mx-auto py-20 px-6"><h1 class="text-5xl font-black mb-8">Web Design in Colne</h1><p>Professional web design at the heart of Pendle.</p></main>',
    'web-design-burnley.html': '<main class="max-w-7xl mx-auto py-20 px-6"><h1 class="text-5xl font-black mb-8">Web Design in Burnley</h1><p>Burnley’s top web agency for industrial growth.</p></main>'
}

for page, content in pages.items():
    if os.path.exists(page):
        new_page = template.replace('<!-- CONTENT_REPLACE -->', content)
        with open(page, 'w') as f:
            f.write(new_page)
