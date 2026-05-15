#!/usr/bin/env python3
"""
Blog Post Refactoring Script
Converts placeholder blog posts to proper article templates with navigation
"""

import os
from pathlib import Path

PROJECT_ROOT = Path("/Users/dom/madereal")
BLOG_POSTS_DIR = PROJECT_ROOT / "blog" / "posts"

def read_file(filepath):
    """Read file content safely"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

def write_file(filepath, content):
    """Write file content safely"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error writing {filepath}: {e}")
        return False

def create_blog_post_template(title, slug, description):
    """Create a proper blog post template"""
    return f'''<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>{title} | MadeReal Design Lancashire Blog</title>
    <meta name="description" content="{description}" />
    
    <!-- Include components -->
    <script src="/components/header.html"></script>
</head>
<body class="bg-gray-50 text-slate-900">

<main class="pt-24 min-h-screen">
    <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Article Header -->
        <header class="text-center mb-8">
            <span class="inline-block bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Blog</span>
            <h1 class="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4">{title}</h1>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </header>

        <!-- Article Content Placeholder -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 class="text-xl font-bold text-slate-900 mb-4">Full article content goes here...</h2>
            <p class="text-gray-600 leading-relaxed">
                This is where you write your detailed blog post. Include valuable insights, 
                tips, and actionable advice for Lancashire business owners looking to improve 
                their online presence.
            </p>
            
            <!-- Add more content sections as needed -->
        </div>

        <!-- CTA Section -->
        <div class="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 class="text-3xl font-black text-white mb-4">Need Your Own Professional Website?</h2>
            <p class="text-teal-100 mb-6 max-w-2xl mx-auto">Get a FREE custom preview of what your website could look like. No commitment required.</p>
            <a href="/get-started.html" class="inline-block bg-white text-teal-600 px-8 py-3 rounded-full font-bold hover:shadow-xl transition-all">
                Get My FREE Preview →
            </a>
        </div>

        <!-- Related Posts -->
        <div class="mt-12 pt-8 border-t border-gray-200">
            <h3 class="text-xl font-bold text-slate-900 mb-6">Related Articles</h3>
            <div class="grid md:grid-cols-2 gap-4">
                <a href="/blog/posts/avoid-monthly-fees.html" class="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-teal-500 transition-colors">
                    <h4 class="font-bold text-slate-900 mb-2">Why You Should Avoid Monthly Website Fees</h4>
                    <p class="text-sm text-gray-600">Learn why one-off payment is better for your business...</p>
                </a>
                <a href="/blog/posts/local-seo-lancashire.html" class="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-teal-500 transition-colors">
                    <h4 class="font-bold text-slate-900 mb-2">Local SEO Tips for Lancashire Businesses</h4>
                    <p class="text-sm text-gray-600">Rank higher in local search results and attract more customers...</p>
                </a>
            </div>
        </div>

        <!-- Back to Blog -->
        <div class="mt-8 text-center">
            <a href="/blog.html" class="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
                ← Back to Blog
            </a>
        </div>
    </article>
</main>

<!-- Include footer -->
<script src="/components/footer.html"></script>

</body>
</html>'''

def update_blog_post(filepath, title, slug):
    """Update a blog post with proper template"""
    
    # Read existing content to get description/title from meta tags if possible
    content = read_file(filepath)
    
    # Extract current info or use defaults
    if content and '<title>' in content:
        import re
        title_match = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
        if title_match:
            current_title = title_match.group(1).strip()
        else:
            current_title = "Blog Post"
    else:
        current_title = slug.replace('-', ' ').title()
    
    description = f"{current_title} - Read about {slug.replace('-', ' ')} and tips for Lancashire businesses."
    
    # Create new content with proper template
    new_content = create_blog_post_template(current_title, slug, description)
    
    write_file(filepath, new_content)
    print(f"  ✓ Updated: {filepath.name}")

def main():
    """Main execution"""
    print("=" * 60)
    print("BLOG POST REFACTORING")
    print("=" * 60)
    
    if not BLOG_POSTS_DIR.exists():
        print(f"Error: Blog posts directory not found at {BLOG_POSTS_DIR}")
        return
    
    # List of existing blog posts to update
    blog_posts = [
        ("avoid-monthly-fees.html", "Avoid Monthly Website Fees"),
        ("local-seo-lancashire.html", "Local SEO for Lancashire Businesses"),
        ("mobile-first-lancashire.html", "Mobile-First Web Design in Lancashire"),
        ("speed-and-rankings.html", "Website Speed and Search Rankings"),
        ("web-design-mistakes.html", "Common Web Design Mistakes to Avoid"),
        ("why-local-seo-matters.html", "Why Local SEO Matters for Your Business"),
        ("zero-monthly-fee-explained.html", "Zero Monthly Fees Explained"),
    ]
    
    updated = 0
    
    for filename, title in blog_posts:
        filepath = BLOG_POSTS_DIR / filename
        
        if filepath.exists():
            update_blog_post(filepath, title, filename.replace('.html', ''))
            updated += 1
        else:
            print(f"  ⚠️ Not found: {filename}")
    
    print("\n" + "=" * 60)
    print(f"✅ Updated {updated} blog posts with proper templates")
    print("=" * 60)

if __name__ == "__main__":
    main()
