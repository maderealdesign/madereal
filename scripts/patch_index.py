index_path = '/root/Madereal/index.html'

with open(index_path, 'r') as f:
    content = f.read()

# 1. Update the NAV component with the button
# We need to find the <a href="/" class="flex items-center gap-1">...</a> block 
# and insert the button right after the link or inside the flex container.

menu_btn = '<button id="menu-btn" class="md:hidden text-2xl text-teal-500" aria-label="Menu"><i class="fas fa-bars"></i></button>'
mobile_menu = '<div id="mobile-menu" class="hidden md:hidden bg-white p-6 border-t border-gray-100 flex flex-col gap-4"><a href="/" class="font-bold">Home</a><a href="/blog.html" class="font-bold">Blog</a><a href="/about.html" class="font-bold">About</a></div>'

# Ensure the script for burger menu is there
menu_script = "<script>document.getElementById('menu-btn').onclick = () => document.getElementById('mobile-menu').classList.toggle('hidden');</script>"

# Apply changes to the nav
if menu_btn not in content:
    # After the </a> of the logo
    content = content.replace('</a>', f'</a>{menu_btn}', 1)
    # Add mobile menu after the nav closing tag? Or just inside the nav block.
    # The template uses a nav-wrapper block.
    content = content.replace('</nav>', f'{mobile_menu}</nav>')
    content = content.replace('</body>', f'{menu_script}</body>')

with open(index_path, 'w') as f:
    f.write(content)
