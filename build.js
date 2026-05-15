const fs = require('fs');
const path = require('path');

// 1. Define folders (Source is where your raw files are, Dist is where the finished site goes)
const srcDir = __dirname; 
const distDir = path.join(__dirname, 'dist'); 

// 2. Create the "dist" folder if it doesn't exist
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// 3. Load your master templates
const headerCode = fs.readFileSync(path.join(srcDir, 'header_template.html'), 'utf8');

// Optional: If you create a footer_template.html, the script will load it. 
let footerCode = '';
if (fs.existsSync(path.join(srcDir, 'footer_template.html'))) {
    footerCode = fs.readFileSync(path.join(srcDir, 'footer_template.html'), 'utf8');
}

// 4. Find all standard HTML pages in the folder (ignore the templates themselves)
const files = fs.readdirSync(srcDir).filter(file => file.endsWith('.html') && !file.includes('template'));

// 5. Loop through each page, inject the templates, and save the finished page into the "dist" folder
files.forEach(file => {
    let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
    
    // Swap the placeholders for the real code
    content = content.replace('', headerCode);
    
    if (footerCode) {
        content = content.replace('', footerCode);
    }

    // Save the finalized file
    fs.writeFileSync(path.join(distDir, file), content);
    console.log(`Successfully built: ${file}`);
});

console.log('✅ Website build complete! Ready for Netlify.');