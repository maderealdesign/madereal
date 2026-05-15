const fs = require('fs');
const path = require('path');

const srcDir = __dirname; 
const distDir = path.join(__dirname, 'dist'); 

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

const headerCode = fs.readFileSync(path.join(srcDir, 'header_template.html'), 'utf8');

let footerCode = '';
if (fs.existsSync(path.join(srcDir, 'footer_template.html'))) {
    footerCode = fs.readFileSync(path.join(srcDir, 'footer_template.html'), 'utf8');
}

const files = fs.readdirSync(srcDir).filter(file => file.endsWith('.html') && !file.includes('template'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
    
    // Swap the placeholders for the real code
    content = content.replace('[[[INJECT_HEADER]]]', headerCode);
    
    if (footerCode) {
        content = content.replace('[[[INJECT_FOOTER]]]', footerCode);
    }

    fs.writeFileSync(path.join(distDir, file), content);
    console.log(`Successfully built: ${file}`);
});

console.log('✅ Website build complete! Ready for Netlify.');