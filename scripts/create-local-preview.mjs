import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(rootDir, 'index.html');
const cssPath = path.join(rootDir, 'assets', 'css', 'home.css');
const outputPath = path.join(rootDir, 'local-preview', 'index.html');

const html = fs.readFileSync(indexPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

const localHtml = html
    .replace(/\s*<link rel="preload" href="assets\/css\/home\.css" as="style">\n/, '\n')
    .replace(
        /\s*<link rel="stylesheet" href="assets\/css\/home\.css">\n/,
        `\n    <style id="local-preview-css">\n${css}\n    </style>\n`,
    )
    .replace(
        '<title>',
        '<!-- Local preview generated from index.html. Edit index.html, then rerun: node scripts/create-local-preview.mjs -->\n    <title>',
    );

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, localHtml);
console.log(`Wrote ${path.relative(rootDir, outputPath)}`);
