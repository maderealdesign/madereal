import os
from pathlib import Path

template = Path('/root/Madereal/scripts/template.html').read_text()
trust = Path('/root/Madereal/partials/trust-indicators.html').read_text()

for town in ['colne', 'burnley', 'nelson', 'pendle', 'skipton', 'barnoldswick', 'blackburn', 'clitheroe']:
    path = f'web-design-{town}.html'
    if os.path.exists(path):
        content = Path(path).read_text()
        if trust not in content:
            new_content = content.replace('</main>', f'{trust}</main>')
            with open(path, 'w') as f:
                f.write(new_content)
