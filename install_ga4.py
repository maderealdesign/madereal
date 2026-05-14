#!/usr/bin/env python3
"""
MadeReal.uk - Google Analytics 4 Installation Script
Adds GA4 tracking code to all HTML pages
"""

import os
import re

BASE_DIR = '/Users/dom/madereal'

# TEMPLATE for GA4 tracking code (you'll fill in your Measurement ID)
GA4_TEMPLATE = """
<!-- Google Analytics 4 - MadeReal.uk -->
<script async src="https://www.googletagmanager.com/gtag/js?id=MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'MEASUREMENT_ID');
</script>
<!-- End Google Analytics 4 -->
"""

def add_ga4_to_page(html_content, measurement_id):
    """Add GA4 tracking code to a page"""
    
    # Replace MEASUREMENT_ID placeholders
    ga4_code = GA4_TEMPLATE.replace('MEASUREMENT_ID', measurement_id)
    
    # Insert before the </head> tag (standard placement)
    return html_content.replace('</head>', ga4_code + '\n</head>')

def main():
    print("=" * 70)
    print("📊 MADEREAL.UK - GOOGLE ANALYTICS 4 INSTALLATION")
    print("=" * 70)
    
    # Get Measurement ID from user
    measurement_id = input("\n🔍 Enter your GA4 Measurement ID (format: G-XXXXXXXXXX): ").strip()
    
    if not measurement_id.startswith('G-'):
        print(f"\n⚠️  Warning: {measurement_id} doesn't look like a valid Measurement ID.")
        confirm = input("Continue anyway? (y/n): ")
        if confirm.lower() != 'y':
            return
    
    print(f"\n✅ Using Measurement ID: {measurement_id}")
    
    # Find all HTML files
    html_files = []
    for file in os.listdir(BASE_DIR):
        if file.endswith('.html'):
            html_files.append(file)
    
    # Also check services directory
    services_dir = f'{BASE_DIR}/services'
    if os.path.exists(services_dir):
        for file in os.listdir(services_dir):
            if file.endswith('.html'):
                html_files.append(f'services/{file}')
    
    print(f"\n📁 Found {len(html_files)} HTML files to update")
    
    updated = 0
    failed = 0
    
    for filename in html_files:
        filepath = f'{BASE_DIR}/{filename}' if not filename.startswith('services/') else f'{BASE_DIR}/services/{filename.split("/")[-1]}'
        
        try:
            with open(filepath, 'r') as f:
                content = f.read()
            
            original_content = content
            
            # Add GA4 code
            content = add_ga4_to_page(content, measurement_id)
            
            if content != original_content:
                with open(filepath, 'w') as f:
                    f.write(content)
                
                print(f"  ✓ Added GA4 to {filename}")
                updated += 1
            else:
                # Check if already has GA4 (avoid duplicate)
                if 'gtag' in content.lower():
                    print(f"  ℹ️  Skipping {filename} (already has tracking)")
                else:
                    print(f"  ✗ Failed to add to {filename}")
                    failed += 1
                    
        except Exception as e:
            print(f"  ✗ Error processing {filename}: {e}")
            failed += 1
    
    # Create installation report
    print("\n" + "=" * 70)
    print("📊 INSTALLATION REPORT")
    print("=" * 70)
    print(f"\nTotal files processed: {len(html_files)}")
    print(f"Successfully updated:   {updated}")
    print(f"Failed:                {failed}")
    
    if failed == 0 and updated > 0:
        print("\n✅ ALL FILES UPDATED SUCCESSFULLY!")
        print("\n📈 NEXT STEPS:")
        print("1. Wait 24 hours for data to appear in GA4")
        print("2. Verify tracking is working (use Realtime reports)")
        print("3. Set up conversion goals for form submissions and phone calls")
    elif failed > 0:
        print(f"\n⚠️  {failed} files failed - check the errors above")
    
    # Save summary to file
    summary = f"""# Google Analytics 4 Installation Report

**Date:** May 14, 2026  
**Measurement ID:** {measurement_id}  
**Domain:** madereal.uk

## Results:
- Total files processed: {len(html_files)}
- Successfully updated:   {updated}
- Failed:                {failed}

## Files Updated:
{chr(10).join([f"- {f}" for f in html_files[:20]])}...

## Next Steps:
1. ✅ Wait 24 hours for data to appear in GA4 dashboard
2. ✅ Verify tracking is working using Realtime reports
3. ✅ Set up conversion goals (form submissions, phone calls)
4. ✅ Monitor bounce rate and session duration weekly
5. ✅ Track which pages convert best

## Conversion Goals to Set Up:
- Form submission complete
- Phone number click (tel: link)
- Get Started button click (/get-started.html)
- Time on page > 2 minutes (engaged visitor)

---
*Installation completed automatically via optimization script*
"""
    
    with open(f'{BASE_DIR}/GA4_INSTALLATION_REPORT.md', 'w') as f:
        f.write(summary)
    
    print("\n📄 Full report saved to GA4_INSTALLATION_REPORT.md")

if __name__ == '__main__':
    main()
