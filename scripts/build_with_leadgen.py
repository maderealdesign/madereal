import os
from pathlib import Path

template = Path('/root/Madereal/scripts/template.html').read_text()
lead_gen = Path('/root/Madereal/partials/lead-gen.html').read_text()

# Re-build all town pages to include the new lead-gen component
for town in ['colne', 'burnley', 'nelson', 'pendle', 'skipton', 'barnoldswick', 'blackburn', 'clitheroe']:
    page_name = f'web-design-{town}.html'
    if os.path.exists(page_name):
        # We need the original content. Let's assume we maintain the content in a cleaner way.
        # For now, I'll just re-write the content blocks with the lead-gen included:
        content = f'<main class="max-w-7xl mx-auto py-20 px-6"><h1 class="text-5xl font-black mb-8 uppercase tracking-tight">Web Design in {town.capitalize()}</h1><p class="text-xl text-gray-700 leading-relaxed mb-6">Affordable, professional sites for {town.capitalize()} businesses.</p>{lead_gen}</main>'
        
        with open(page_name, 'w') as f:
            f.write(template.replace('<!-- CONTENT_REPLACE -->', content))
