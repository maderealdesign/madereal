import os
from pathlib import Path

template = Path('/root/Madereal/scripts/template.html').read_text()

locations = {
    'nelson': 'A professional online hub for Nelson businesses.',
    'pendle': 'Driving growth for Pendle enterprises.',
    'skipton': 'Connecting Skipton businesses to the digital world.',
    'barnoldswick': 'Tailored web solutions for Barnoldswick entrepreneurs.',
    'blackburn': 'Scaling Blackburn’s economy one site at a time.',
    'clitheroe': 'Modern websites for Clitheroe’s finest businesses.'
}

for town, description in locations.items():
    page_name = f'web-design-{town}.html'
    content = f'<main class="max-w-7xl mx-auto py-20 px-6"><h1 class="text-5xl font-black mb-8 uppercase tracking-tight">Web Design in {town.capitalize()}</h1><p class="text-xl text-gray-700 leading-relaxed mb-6">{description}</p><a href="/get-started.html" class="inline-block bg-teal-500 text-black font-black px-8 py-4 rounded-xl">Get Your Preview</a></main>'
    
    new_page = template.replace('<!-- CONTENT_REPLACE -->', content)
    with open(page_name, 'w') as f:
        f.write(new_page)

