import os
import glob

html_files = glob.glob('**/*.html', recursive=True)

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Check if the file has the double <!DOCTYPE html>
    if content.count('<!DOCTYPE html>') > 1 and '<main class="pt-24 min-h-screen">' in content:
        # Extract the inner content
        parts = content.split('<main class="pt-24 min-h-screen">')
        if len(parts) > 1:
            inner_with_tail = parts[-1] # take the last one in case there are multiple
            if '</main>' in inner_with_tail:
                # We need to split by the *last* </main> just in case the inner content has </main> tags
                inner = inner_with_tail.rsplit('</main>', 1)[0]
                inner = inner.strip()
                # If inner doesn't start with doctype, maybe it has some newlines
                if '<!DOCTYPE html>' in inner:
                    # just extract from <!DOCTYPE html> to </html>
                    start_idx = inner.find('<!DOCTYPE html>')
                    end_idx = inner.rfind('</html>') + 7
                    if start_idx != -1 and end_idx > start_idx:
                        inner = inner[start_idx:end_idx]
                        with open(file, 'w') as f:
                            f.write(inner + '\n')
                        print(f"Fixed {file}")

