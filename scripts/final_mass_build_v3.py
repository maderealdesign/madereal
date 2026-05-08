import os
from pathlib import Path

template = Path('/root/Madereal/scripts/template.html').read_text()
lead_gen = Path('/root/Madereal/partials/lead-gen.html').read_text()
testimonial = Path('/root/Madereal/partials/testimonial.html').read_text()
trust = Path('/root/Madereal/partials/trust-indicators.html').read_text()
fast_action = Path('/root/Madereal/partials/fast-action.html').read_text()

# Apply to all pages in root and services
for root, _, files in os.walk('/root/Madereal'):
    for f in files:
        if f.endswith('.html') and f not in ['index.html', 'get-started.html']:
            path = os.path.join(root, f)
            content = Path(path).read_text()
            
            # Add Fast Action only to main pages if missing
            if fast_action not in content:
                content = content.replace('</body>', f'{fast_action}</body>')
            
            # Re-apply full template stack
            if 'CONTENT_REPLACE' in template:
                # Basic injection logic
                full_content = f"{content}{testimonial}{lead_gen}{trust}"
                new_full = template.replace('<!-- CONTENT_REPLACE -->', full_content)
                with open(path, 'w') as p_file:
                     p_file.write(new_full)
