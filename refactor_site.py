import os
import json

def run_refactor():
    registry_path = 'site_registry.json'
    header_path = 'components/header.html'
    footer_path = 'components/footer.html'

    if not os.path.exists(registry_path):
        print(f"Error: {registry_path} not found.")
        return

    with open(registry_path, 'r') as f:
        registry = json.load(f)

    # 1. Build the HTML string for dynamic Locations links
    loc_links_html = ''
    for loc in registry['locations']:
        loc_links_html += f'<a href="/{loc["slug"]}">{loc["title"]}</a>'

    # 2. Build the HTML string for dynamic Blog posts (as a new section)
    blog_links_html = ''
    for post in registry['posts']:
        # Clean slug for link: blog/posts/file.html -> file.html
        clean_slug = post['slug'].replace('blog/posts/', '')
        blog_links_html += f'<a href="/{clean_slug}">{post["title"]}</a>'

    # 3. Define the NEW Header Content (The Source of Truth)
    # We are replacing the hardcoded header with a version that injects the registry
    new_header_content = f'''<nav class="fixed w-full z-[999] top-0 bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" class="text-2xl font-black text-slate-900">made<span class="text-teal-500">real</span></a>
        <div class="flex items-center gap-4">
            <a href="/get-started.html" class="bg-black text-white px-5 py-2 rounded-full text-xs font-bold uppercase">Get Preview</a>
            <button id="menu-btn" class="text-xs font-black uppercase text-teal-500 bg-teal-50 px-4 py-2 rounded-full border border-teal-200">MENU</button>
        </div>
    </div>
    <div id="mobile-menu" class="hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl p-6 grid grid-cols-1 gap-3 font-bold text-sm uppercase">
        <a href="/">Home</a>
        <a href="/about.html">About</a>
        <a href="/blog.html">Blog</a>
        
        <div class="border-t pt-3 mt-2"><div class="text-[10px] text-gray-500 mb-2">Services</div>
            <a href="/graphic-design.html">Graphic Design</a>
            <a href="/printing.html">Printing</a>
            <a href="/services/tradesman-websites.html">Tradesman Websites</a>
            <a href="/services/small-business-websites.html">Small Business</a>
            <a href="/services/hospitality-websites.html">Hospitality</a>
            <a href="/services/professional-services.html">Professional Services</a>
            <a href="/services/ecommerce-websites.html">E-commerce</a>
            <a href="/services/tradesman-roofing.html">Roofing</a>
            <a href="/services/tradesman-electricians.html">Electricians</a>
        </div>

        <div class="border-t pt-3 mt-2"><div class="text-[10px] text-gray-500 mb-2">Locations</div>
            <div class="grid grid-cols-2 gap-2 text-[10px]">
                {loc_links_html}
            </div>
        </div>

        <div class="border-t pt-3 mt-2"><div class="text-[10px] text-gray-500 mb-2">Recent Posts</div>
            <div class="flex flex-col gap-1">
                {blog_links_html}
            </div>
        </div>
    </div>
</nav>
<script>
    document.getElementById('menu-html-btn')?.addEventListener('click', () => {{
        document.getElementById('mobile-menu').classList.toggle('hidden');
    }});
    // Fallback for the actual ID in the HTML
    const btn = document.getElementById('menu-btn');
    if(btn) {{
        btn.addEventListener('click', () => {{
            document.getElementById('mobile-menu').classList.toggle('hidden');
        }});
    }}
</script>'''

    # 4. Write the new Header
    with open(header_path, 'w') as f:
        f.write(new_header_content)
    print("Successfully refactored components/header.html with dynamic links.")

    # 5. Update Footer (just to ensure it's clean)
    footer_template = '''<footer class="py-16 bg-white border-t border-gray-200 text-center">
    <p class="font-black text-xl text-scale-900">made<span class="text-teal-500">real</span></p>
    <p class="text-xs text-gray-400 mt-2">© 2026 MadeReal Design Ltd. Lancashire</p>
</footer>'''
    with open(footer_path, 'w') as f:
        f.write(footer_template)
    print("Successfully refreshed components/footer.html.")

if __name__ == "__main__":
    run_refactor()
