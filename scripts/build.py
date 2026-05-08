import os

NAV = """    <nav class="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/" class="flex items-center gap-1">
                <span class="text-2xl font-black tracking-tight">made<span class="text-brand-teal">real</span></span>
            </a>
            <div class="hidden md:flex items-center gap-8 font-semibold text-sm text-gray-600">
                <a href="/blog.html" class="hover:text-brand-teal transition-colors">Blog</a>
                <a href="/index.html#problem" class="hover:text-brand-teal transition-colors">The Problem</a>
                <a href="/index.html#process" class="hover:text-brand-teal transition-colors">How it Works</a>
                <a href="/index.html#work" class="hover:text-brand-teal transition-colors">Our Work</a>
                <a href="/index.html#towns" class="hover:text-brand-teal transition-colors">Locations</a>
            </div>
            <a href="/get-started.html" class="bg-brand-black text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors shadow-sm">
                Get Your Preview
            </a>
        </div>
    </nav>
"""

FOOTER = """
    <footer class="py-16 text-center bg-white border-t-4 border-slate-900">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-left">
                <div>
                    <h4 class="font-black mb-4 uppercase">Services</h4>
                    <ul class="space-y-2 text-gray-600 font-medium text-sm">
                        <li><a href="/web-design-colne.html">Web Design Colne</a></li>
                        <li><a href="/web-design-burnley.html">Web Design Burnley</a></li>
                        <li><a href="/web-design-nelson.html">Web Design Nelson</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-black mb-4 uppercase">Company</h4>
                    <ul class="space-y-2 text-gray-600 font-medium text-sm">
                        <li><a href="/about.html">About Us</a></li>
                        <li><a href="/blog.html">Blog</a></li>
                    </ul>
                </div>
            </div>
            <a href="/" class="text-3xl font-black tracking-tight inline-block mb-6">made<span class="text-teal-500">real</span></a>
            <address class="not-italic text-slate-900 font-bold mb-2">9 Market St, Colne, BB8 0HY | Lancashire</address>
            <p class="text-gray-500 font-medium mb-8"><a href="tel:07396710347" class="hover:text-teal-500">07396 710 347</a> | <a href="mailto:info@made-real.co.uk" class="hover:text-teal-500 hover:underline transition-all">info@made-real.co.uk</a></p>
        </div>
    </footer>
"""

def inject_partials(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Simple replacement logic (assuming body tags exist)
    # This might need refinement for more complex layouts, but works for the current files
    new_content = content
    if '<body>' in content:
        new_content = content.replace('<body>', f'<body>\n{NAV}\n')
    if '</body>' in content:
        new_content = new_content.replace('</body>', f'\n{FOOTER}\n</body>')
    
    with open(filename, 'w') as f:
        f.write(new_content)

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.html') and file != 'index.html':
            inject_partials(os.path.join(root, file))
