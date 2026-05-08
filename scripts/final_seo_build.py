import os
from pathlib import Path

# Template and partials
template = Path('/root/Madereal/scripts/template.html').read_text()
case_study = Path('/root/Madereal/partials/case-study.html').read_text()

cities = ['colne', 'burnley', 'nelson', 'pendle', 'skipton', 'barnoldswick', 'blackburn', 'clitheroe']
services = ['tradesman-websites', 'hospitality-websites', 'professional-services']

for city in cities:
    city_file = f'web-design-{city}.html'
    if os.path.exists(city_file):
        # Inject one dynamic case study per city to link back to a main service
        # Simple injection: replace placeholders
        c_study = case_study.replace('[CLIENT_TYPE]', 'independent service business').replace('[LOCATION]', city.capitalize())
        content = Path(city_file).read_text()
        # Find where to insert (before main end)
        new_content = content.replace('</main>', f'{c_study}</main>')
        with open(city_file, 'w') as f:
            f.write(new_content)

