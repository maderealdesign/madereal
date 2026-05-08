import os
from pathlib import Path

template = Path('/root/Madereal/scripts/template.html').read_text()
lead_gen = Path('/root/Madereal/partials/lead-gen.html').read_text()
testimonial = Path('/root/Madereal/partials/testimonial.html').read_text()

# We need to preserve original content per town
# For now, let's keep it clean
for town in ['colne', 'burnley', 'nelson', 'pendle', 'skipton', 'barnoldswick', 'blackburn', 'clitheroe']:
    page_name = f'web-design-{town}.html'
    content = f'''
    <main class="max-w-7xl mx-auto py-20 px-6">
        <h1 class="text-6xl font-black mb-8 uppercase tracking-tight">Web Design in {town.capitalize()}</h1>
        <p class="text-xl text-gray-700 leading-relaxed">High-converting, mobile-first websites tailored for {town.capitalize()} businesses.</p>
        
        {testimonial}
        {lead_gen}
        
        <h3 class="text-3xl font-black mt-16 mb-6">Why choose local design in {town.capitalize()}?</h3>
        <p class="text-lg text-gray-600">We understand the local {town.capitalize()} market better than any national agency. Contact us today to see how we help businesses in {town.capitalize()} dominate their local search results.</p>
    </main>
    '''
    with open(page_name, 'w') as f:
        f.write(template.replace('<!-- CONTENT_REPLACE -->', content))
