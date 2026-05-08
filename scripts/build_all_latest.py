import os
from pathlib import Path

template = Path('/root/Madereal/scripts/template.html').read_text()
lead_gen = Path('/root/Madereal/partials/lead-gen.html').read_text()
testimonial = Path('/root/Madereal/partials/testimonial.html').read_text()
trust = Path('/root/Madereal/partials/trust-indicators.html').read_text()

def apply_template(path, content):
    full_content = f"{content}{testimonial}{lead_gen}{trust}"
    with open(path, 'w') as f:
        f.write(template.replace('<!-- CONTENT_REPLACE -->', full_content))

# Process service pages
for svc in ['tradesman-websites', 'small-business-websites', 'hospitality-websites', 'professional-services', 'ecommerce-websites']:
    path = f'/root/Madereal/services/{svc}.html'
    if os.path.exists(path):
        content = Path(path).read_text()
        apply_template(path, content)
