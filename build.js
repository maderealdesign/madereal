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

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function findHtmlFiles(dir, baseDir = dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (entry.name === 'dist' || entry.name === '.git') {
            return [];
        }

        if (entry.isDirectory()) {
            return findHtmlFiles(fullPath, baseDir);
        }

        if (entry.isFile() && entry.name.endsWith('.html') && !entry.name.includes('template')) {
            return [relativePath];
        }

        return [];
    });
}

const files = findHtmlFiles(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
    
    // Swap the placeholders for the real code
    content = content.replace('[[[INJECT_HEADER]]]', headerCode);
    
    if (footerCode) {
        content = content.replace('[[[INJECT_FOOTER]]]', footerCode);
    }

    ensureDir(path.dirname(path.join(distDir, file)));
    fs.writeFileSync(path.join(distDir, file), content);
    console.log(`Successfully built: ${file}`);
});

console.log('✅ Website build complete! Ready for Netlify.');
