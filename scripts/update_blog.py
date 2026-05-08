import os
from pathlib import Path

template = Path('/root/Madereal/scripts/template.html').read_text()
posts_dir = Path('/root/Madereal/blog/posts')

blog_links = ""
for post_file in sorted(posts_dir.glob('*.html')):
    title = post_file.name.replace('-', ' ').replace('.html', '').capitalize()
    blog_links += f'<li class="mb-4"><a href="/blog/posts/{post_file.name}" class="text-xl font-bold hover:text-teal-500">{title}</a></li>'

blog_content = f'<main class="max-w-4xl mx-auto py-20 px-6"><h1 class="text-5xl font-black mb-12">Blog</h1><ul class="list-none">{blog_links}</ul></main>'

with open('/root/Madereal/blog.html', 'w') as f:
    f.write(template.replace('<!-- CONTENT_REPLACE -->', blog_content))
