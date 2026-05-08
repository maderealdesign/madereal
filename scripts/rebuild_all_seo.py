import os
from pathlib import Path

template = Path('/root/Madereal/scripts/template.html').read_text()
lead_gen = Path('/root/Madereal/partials/lead-gen.html').read_text()
testimonial = Path('/root/Madereal/partials/testimonial.html').read_text()

locations = {
    'colne': 'Expert web design for Colne businesses. Get a professional site for £197.',
    'burnley': 'Burnley’s premier web design for small businesses. Zero monthly fees.',
    'nelson': 'High-converting websites for Nelson companies. One-off £197 cost.',
    'pendle': 'Pendle local web design. Google-ready and mobile-perfect.',
    'skipton': 'Skipton’s choice for affordable, professional web design services.',
    'barnoldswick': 'Reliable web development for Barnoldswick entrepreneurs.',
    'blackburn': 'Blackburn business websites that actually convert. Fast and secure.',
    'clitheroe': 'Modern, premium web design for Clitheroe’s local shops and trades.'
}

for town, meta in locations.items():
    page_name = f'web-design-{town}.html'
    content = f'''
    <main class="max-w-7xl mx-auto py-20 px-6">
        <h1 class="text-6xl font-black mb-6 uppercase tracking-tight text-slate-900">Web Design in {town.capitalize()}</h1>
        <p class="text-xl text-gray-700 leading-relaxed mb-8">{meta}</p>
        {testimonial}
        {lead_gen}
        <h2 class="text-3xl font-black mb-4">Lancashire’s No. 1 Web Partner</h2>
        <p class="text-lg text-gray-600">Don’t let your {town.capitalize()} business get left behind. We provide the digital foundation your company needs to capture local leads.</p>
    </main>
    '''
    # We use a simple replacement for the page head as well if we truly want to set unique meta (not yet implemented fully, but keeping structure clean)
    with open(page_name, 'w') as f:
        f.write(template.replace('<!-- CONTENT_REPLACE -->', content))
