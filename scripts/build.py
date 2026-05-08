import os

# Definitions for nav and footer
NAV = """    <nav class="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/" class="flex items-center gap-1">
                <span class="text-2xl font-black tracking-tight">made<span class="text-teal-500">real</span></span>
            </a>
            <div class="md:hidden">
                <button id="menu-btn" class="text-teal-500 text-2xl"><i class="fas fa-bars"></i></button>
            </div>
            <div class="hidden md:flex items-center gap-8 font-semibold text-sm text-gray-600">
                <a href="/blog.html" class="hover:text-teal-500">Blog</a>
                <a href="/index.html#work" class="hover:text-teal-500">Work</a>
                <a href="/get-started.html" class="bg-black text-white px-5 py-2.5 rounded-full">Get Preview</a>
            </div>
        </div>
        <div id="mobile-menu" class="hidden md:hidden bg-white p-6 border-t border-gray-100 flex flex-col gap-4">
            <a href="/" class="font-bold">Home</a>
            <a href="/blog.html" class="font-bold">Blog</a>
            <a href="/about.html" class="font-bold">About</a>
        </div>
    </nav>
    <script>document.getElementById('menu-btn').onclick = () => document.getElementById('mobile-menu').classList.toggle('hidden');</script>
"""

FOOTER = """
    <footer class="py-16 bg-white border-t-4 border-slate-900 border-x-2 border-slate-900">
        <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
            <div><h4 class="font-black mb-4">SERVICES</h4><ul class="text-sm space-y-2">
                <li><a href="/web-design-colne.html">Colne</a></li>
                <li><a href="/web-design-burnley.html">Burnley</a></li>
                <li><a href="/web-design-nelson.html">Nelson</a></li>
            </ul></div>
            <div><h4 class="font-black mb-4">COMPANY</h4><ul class="text-sm space-y-2">
                <li><a href="/about.html">About</a></li>
                <li><a href="/blog.html">Blog</a></li>
                <li><a href="/graphic-design.html">Graphic Design</a></li>
                <li><a href="/printing.html">Printing</a></li>
            </ul></div>
        </div>
    </footer>
"""

def process_file(path):
    with open(path, 'r') as f:
        content = f.read()
    
    # Strip old broken nav/footer if present
    # This is a basic approach; more robust would be regex.
    # For now, let's just replace placeholders
    
    # Simple templates for pages
    new_content = f"<!DOCTYPE html><html lang='en'><head><script src='https://cdn.tailwindcss.com'></script></head><body class='bg-gray-50 text-gray-900'>{NAV}{content}{FOOTER}</body></html>"
    
    with open(path, 'w') as f:
        f.write(new_content)

# Process pages (excluding index and get-started as requested)
for f in os.listdir('.'):
    if f.endswith('.html') and f not in ['index.html', 'get-started.html']:
        process_file(f)
