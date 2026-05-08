import os
from pathlib import Path

template = Path('/root/Madereal/scripts/template.html').read_text()
lead_gen = Path('/root/Madereal/partials/lead-gen.html').read_text()
testimonial = Path('/root/Madereal/partials/testimonial.html').read_text()
trust = Path('/root/Madereal/partials/trust-indicators.html').read_text()

for f in os.listdir('.'):
    if f.endswith('.html') and f not in ['index.html', 'get-started.html']:
        content = Path(f).read_text()
        # Cleanly combine
        full_content = f"{content}{testimonial}{lead_gen}{trust}"
        with open(f, 'w') as p_file:
             p_file.write(template.replace('<!-- CONTENT_REPLACE -->', full_content))
