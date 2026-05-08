import re

HEADER = """
<nav class="fixed w-full z-[100] top-0 bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" class="text-2xl font-black text-slate-900">made<span class="text-teal-500">real</span></a>
        <div class="flex items-center gap-4">
            <a href="/get-started.html" class="bg-black text-white px-5 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap">Get Preview</a>
            <button id="menu-btn" class="text-xs font-black uppercase text-teal-500 bg-teal-50 px-4 py-2 rounded-full border border-teal-200">MENU</button>
        </div>
    </div>
    <div id="mobile-menu" class="hidden absolute w-full bg-white border-b border-gray-200 shadow-xl p-6 font-bold text-sm uppercase grid grid-cols-1 gap-4 z-[99]">
        <a href="/">Home</a>
        <a href="/about.html">About</a>
        <a href="/blog.html">Blog</a>
        <div class="border-t pt-4 grid grid-cols-2 gap-2 text-[10px] text-gray-500">
            <a href="/web-design-colne.html">Colne</a>
            <a href="/web-design-burnley.html">Burnley</a>
            <a href="/web-design-nelson.html">Nelson</a>
            <a href="/web-design-pendle.html">Pendle</a>
            <a href="/web-design-skipton.html">Skipton</a>
            <a href="/web-design-blackburn.html">Blackburn</a>
            <a href="/web-design-clitheroe.html">Clitheroe</a>
            <a href="/web-design-barnoldswick.html">Barnoldswick</a>
        </div>
    </div>
</nav>
<script>
    document.getElementById("menu-btn").onclick = function() {
        document.getElementById("mobile-menu").classList.toggle("hidden");
    };
</script>
"""

with open('/root/Madereal/index.html', 'r+') as f:
    text = f.read()
    # Remove old nav just in case
    text = re.sub(r'<nav.*?</nav>\s*<script.*?</script>', '', text, flags=re.DOTALL)
    # Inject new one after the body
    text = text.replace('<body class="bg-brand-gray text-brand-black">', f'<body class="bg-brand-gray text-brand-black">{HEADER}')
    f.seek(0)
    f.write(text)
    f.truncate()
