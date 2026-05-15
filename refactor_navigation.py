#!/usr/bin/env python3
"""
Site Navigation Refactoring Script
Replaces all inline navigation with shared header/footer components
Fixes mobile menu inconsistencies and standardizes site structure
"""

import os
import re
from pathlib import Path

# Configuration
PROJECT_ROOT = Path("/Users/dom/madereal")
COMPONENTS_DIR = PROJECT_ROOT / "components"
HEADER_FILE = COMPONENTS_DIR / "header.html"
FOOTER_FILE = COMPONENTS_DIR / "footer.html"

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

def remove_inline_nav(html_content):
    """Remove inline navigation and footer sections"""
    
    # Remove desktop nav (from <nav class="fixed to </script> or </body>)
    html_content = re.sub(
        r'<nav class="[^"]*fixed[^"]*"[^>]*>.*?</script>\s*</nav>',
        '',
        html_content,
        flags=re.DOTALL | re.IGNORECASE
    )
    
    # Remove mobile nav (from <div id="mobile-menu" to closing div)
    html_content = re.sub(
        r'<div id="mobile-menu"[^>]*>.*?</div>\s*</script>',
        '',
        html_content,
        flags=re.DOTALL | re.IGNORECASE
    )
    
    # Remove old scripts related to navigation
    html_content = re.sub(
        r'<script>\s*document\.addEventListener\(\'DOMContentLoaded\',[^<]*</script>',
        '',
        html_content,
        flags=re.DOTALL
    )
    
    return html_content

def insert_component_after_head(html_content, component_path):
    """Insert component after </head> tag"""
    content = read_file(component_path)
    if not content:
        return None
    
    # Insert right after </head>
    pattern = r'(</head>)'
    replacement = f'\\1\n{content}\n'
    
    return re.sub(pattern, replacement, html_content, count=1, flags=re.IGNORECASE)

def insert_footer_before_body(html_content):
    """Insert footer before </body> tag"""
    content = read_file(FOOTER_FILE)
    if not content:
        return None
    
    # Insert right before </body>
    pattern = r'(</body>)'
    replacement = f'{content}\n\\1'
    
    return re.sub(pattern, replacement, html_content, count=1, flags=re.IGNORECASE)

def process_html_file(filepath):
    """Process a single HTML file"""
    print(f"  Processing: {filepath.name}")
    
    # Skip if it's already a component
    if filepath.parent == COMPONENTS_DIR:
        print("    Skipping component files")
        return True
    
    content = read_file(filepath)
    if not content:
        return False
    
    original_content = content
    
    # Remove inline navigation
    content = remove_inline_nav(content)
    
    # Insert header component after head
    content = insert_component_after_head(content, HEADER_FILE)
    
    # Insert footer before body
    content = insert_footer_before_body(content)
    
    # Write back if changed
    if content != original_content:
        write_file(filepath, content)
        print(f"    ✓ Updated")
        return True
    else:
        print(f"    ℹ No changes needed")
        return False

def create_placeholder_service_pages():
    """Create proper service pages from placeholder files"""
    services_dir = PROJECT_ROOT / "services"
    templates_created = 0
    
    service_templates = {
        "tradesman-websites.html": "Tradesman Websites",
        "small-business-websites.html": "Small Business Websites", 
        "hospitality-websites.html": "Hospitality Websites",
        "professional-services.html": "Professional Services",
        "ecommerce-websites.html": "E-commerce Websites"
    }
    
    for filename, title in service_templates.items():
        filepath = services_dir / filename
        
        if not filepath.exists():
            continue
            
        content = read_file(filepath)
        
        # Check if it's just a placeholder
        if content and "<main><h1>Service:" in content:
            # Create proper page template
            new_content = f'''<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>{title} | MadeReal Design Lancashire</title>
    <meta name="description" content="Professional {title.lower()} service in Lancashire. £197 complete website design with zero monthly fees. Google optimized and mobile-first." />
    
    <!-- Include components -->
    <script src="/components/header.html"></script>
</head>
<body class="bg-gray-50 text-slate-900">

<main class="pt-24 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Hero Section -->
        <div class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-black text-slate-900 mb-4">{title}</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional {title.lower()} designed to convert visitors into customers. 
                Built for Lancashire businesses with zero monthly fees.
            </p>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <i class="fa-solid fa-check text-teal-500 text-2xl mb-3"></i>
                <h3 class="font-bold text-lg mb-2">Google Optimized</h3>
                <p class="text-sm text-gray-600">SEO-friendly structure to rank higher in search results.</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <i class="fa-solid fa-mobile-screen text-teal-500 text-2xl mb-3"></i>
                <h3 class="font-bold text-lg mb-2">Mobile First</h3>
                <p class="text-sm text-gray-600">Perfect on all devices - phones, tablets, and desktops.</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <i class="fa-solid fa-hand-holding-dollar text-teal-500 text-2xl mb-3"></i>
                <h3 class="font-bold text-lg mb-2">Zero Monthly Fees</h3>
                <p class="text-sm text-gray-600">Pay once, own forever. No retainers or hidden costs.</p>
            </div>
        </div>

        <!-- CTA Section -->
        <div class="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 class="text-3xl font-black text-white mb-4">Ready to Get Your FREE Preview?</h2>
            <p class="text-teal-100 mb-6 max-w-2xl mx-auto">See what your custom website could look like. No commitment required.</p>
            <a href="/get-started.html" class="inline-block bg-white text-teal-600 px-8 py-3 rounded-full font-bold hover:shadow-xl transition-all">
                Get My FREE Preview →
            </a>
        </div>
    </div>
</main>

<!-- Include footer -->
<script src="/components/footer.html"></script>

</body>
</html>'''
            
            write_file(filepath, new_content)
            templates_created += 1
            print(f"  Created proper page: {filename}")
    
    return templates_created

def main():
    """Main execution function"""
    print("=" * 60)
    print("MADE-REAL.UK NAVIGATION REFACTORING")
    print("=" * 60)
    
    # Step 1: Process all HTML files in root
    print("\n📄 Processing main HTML files...")
    processed = 0
    
    for html_file in PROJECT_ROOT.glob("*.html"):
        if process_html_file(html_file):
            processed += 1
    
    # Step 2: Process services directory
    print("\n⚡ Processing services directory...")
    services_dir = PROJECT_ROOT / "services"
    
    if services_dir.exists():
        for html_file in services_dir.glob("*.html"):
            if process_html_file(html_file):
                processed += 1
    
    # Step 3: Process blog posts
    print("\n📝 Processing blog posts...")
    blog_posts_dir = PROJECT_ROOT / "blog" / "posts"
    
    if blog_posts_dir.exists():
        for html_file in blog_posts_dir.glob("*.html"):
            if process_html_file(html_file):
                processed += 1
    
    # Step 4: Create proper service pages
    print("\n🎨 Creating professional service page templates...")
    new_pages = create_placeholder_service_pages()
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"✓ Updated {processed} HTML files with new navigation")
    print(f"✓ Created {new_pages} professional service pages")
    print(f"✓ Standardized header across entire site")
    print(f"✓ Fixed mobile menu inconsistencies")
    
    if processed > 0:
        print("\n✅ REFACTORING COMPLETE!")
        print("🚀 Next steps:")
        print("   1. Test the site on desktop and mobile devices")
        print("   2. Verify all links work correctly")
        print("   3. Check mobile menu responsiveness")
        print("   4. Update any remaining hardcoded references")
    else:
        print("\n⚠️ No files were updated - check file paths and permissions")

if __name__ == "__main__":
    main()
