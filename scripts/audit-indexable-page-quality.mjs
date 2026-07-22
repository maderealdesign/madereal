import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const siteUrl = 'https://madereal.uk';

function findHtmlFiles(dir, baseDir = dir) {
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath).split(path.sep).join('/');

        if (entry.isDirectory()) return findHtmlFiles(fullPath, baseDir);
        if (entry.isFile() && entry.name.endsWith('.html')) return [relativePath];
        return [];
    });
}

function stripHtml(html = '') {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getUrlPath(file) {
    return file === 'index.html' ? '/' : `/${file}`;
}

function getMatch(content, pattern) {
    return content.match(pattern)?.[1]?.replace(/\s+/g, ' ').trim() || '';
}

function getMetaDescription(content) {
    const match = content.match(/<meta\s+name=(["'])description\1\s+content=(["'])([\s\S]*?)\2/i);
    return match ? match[3].replace(/\s+/g, ' ').trim() : '';
}

function hasNoindex(content) {
    return /<meta\s+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(content);
}

function pageType(urlPath) {
    if (urlPath === '/') return 'home';
    if (urlPath.startsWith('/blog/')) return 'blog';
    if (urlPath.startsWith('/services/')) return 'service';
    if (/^\/web-design-[a-z-]+\.html$/.test(urlPath)) return 'location';
    if (['/graphic-design.html', '/printing.html'].includes(urlPath)) return 'service';
    if (['/contact.html', '/privacy.html', '/terms.html', '/faq.html', '/about.html'].includes(urlPath)) return 'utility';
    return 'standard';
}

function minimumWords(type) {
    if (['service', 'location', 'home'].includes(type)) return 550;
    if (type === 'blog') return 450;
    if (type === 'utility') return 250;
    return 400;
}

function needsLeadForm(type, urlPath) {
    if (['home', 'blog', 'service', 'location'].includes(type)) return true;
    if (urlPath === '/contact.html') return true;
    return false;
}

function countMatches(content, pattern) {
    return [...content.matchAll(pattern)].length;
}

function internalLinks(content) {
    return [...content.matchAll(/<a\b[^>]*href=["'](\/[^"'#][^"']*)["'][^>]*>/gi)]
        .map(match => match[1])
        .filter(href => !href.startsWith('//'));
}

function formNames(content) {
    return [...content.matchAll(/<form\b[^>]*\bname=["']([^"']+)["'][^>]*>/gi)].map(match => match[1]);
}

function jsonLdCount(content) {
    return countMatches(content, /<script type=["']application\/ld\+json["']>/gi);
}

const sitemapPath = path.join(distDir, 'sitemap.xml');
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
const files = findHtmlFiles(distDir);
const errors = [];
const seenTitles = new Map();
const seenDescriptions = new Map();
const seenH1s = new Map();
const audited = [];

files.forEach(file => {
    const absolute = path.join(distDir, file);
    const content = fs.readFileSync(absolute, 'utf8');
    const urlPath = getUrlPath(file);

    if (hasNoindex(content)) return;

    const type = pageType(urlPath);
    const title = getMatch(content, /<title>([\s\S]*?)<\/title>/i);
    const description = getMetaDescription(content);
    const canonical = getMatch(content, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const expectedCanonical = `${siteUrl}${urlPath}`;
    const h1s = [...content.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(match => stripHtml(match[1]));
    const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
    const links = internalLinks(content);
    const forms = formNames(content);
    const schemaBlocks = jsonLdCount(content);
    const minWords = minimumWords(type);

    audited.push({
        urlPath,
        type,
        words,
        forms: forms.length,
        links: links.length,
        schemaBlocks,
    });

    if (title.length < 20 || title.length > 75) {
        errors.push(`${urlPath}: title should be 20-75 characters, currently ${title.length}`);
    }

    if (description.length < 70 || description.length > 170) {
        errors.push(`${urlPath}: meta description should be 70-170 characters, currently ${description.length}`);
    }

    if (canonical !== expectedCanonical) {
        errors.push(`${urlPath}: canonical mismatch, expected ${expectedCanonical}`);
    }

    if (!sitemap.includes(`<loc>${expectedCanonical}</loc>`)) {
        errors.push(`${urlPath}: missing from sitemap.xml`);
    }

    if (h1s.length !== 1) {
        errors.push(`${urlPath}: expected exactly one H1, found ${h1s.length}`);
    }

    if (words < minWords) {
        errors.push(`${urlPath}: too thin for ${type} page, ${words} words found, ${minWords}+ expected`);
    }

    if (links.length < 5) {
        errors.push(`${urlPath}: needs at least 5 internal links, found ${links.length}`);
    }

    if (schemaBlocks < 1) {
        errors.push(`${urlPath}: missing JSON-LD schema`);
    }

    if (needsLeadForm(type, urlPath) && !forms.length) {
        errors.push(`${urlPath}: missing lead form for ${type} page`);
    }

    if (title) {
        const duplicate = seenTitles.get(title);
        if (duplicate) errors.push(`${urlPath}: duplicate title also used by ${duplicate}`);
        seenTitles.set(title, urlPath);
    }

    if (description) {
        const duplicate = seenDescriptions.get(description);
        if (duplicate) errors.push(`${urlPath}: duplicate meta description also used by ${duplicate}`);
        seenDescriptions.set(description, urlPath);
    }

    if (h1s[0]) {
        const duplicate = seenH1s.get(h1s[0]);
        if (duplicate) errors.push(`${urlPath}: duplicate H1 also used by ${duplicate}`);
        seenH1s.set(h1s[0], urlPath);
    }
});

if (errors.length) {
    console.error('Indexable page quality audit failed:');
    errors.forEach(error => console.error(`- ${error}`));
    process.exit(1);
}

const byType = audited.reduce((acc, row) => {
    acc[row.type] = (acc[row.type] || 0) + 1;
    return acc;
}, {});

console.log(`Indexable page quality audit passed for ${audited.length} page(s).`);
console.log(Object.entries(byType)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, count]) => `${type}: ${count}`)
    .join(' | '));
