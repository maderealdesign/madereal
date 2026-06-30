import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const siteUrl = 'https://madereal.uk';

function parseCsvLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"' && next === '"') {
            current += '"';
            i += 1;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current);
    return values;
}

function parseCsv(source) {
    const rows = source.trim().split(/\r?\n/).filter(Boolean);
    if (!rows.length) return [];
    const headers = parseCsvLine(rows.shift());

    return rows.map(line => {
        const values = parseCsvLine(line);
        return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
    });
}

function targetToFile(targetUrl) {
    if (targetUrl === '/') return 'index.html';
    return `${targetUrl.replace(/^\//, '').replace(/\/$/, '')}.html`.replace(/\.html\.html$/, '.html');
}

function urlPathForFile(file) {
    return file === 'index.html' ? '/' : `/${file}`;
}

function formNames(content) {
    return [...content.matchAll(/<form\b[^>]*\bname=["']([^"']+)["'][^>]*>/gi)].map(match => match[1]);
}

function hasNoindex(content) {
    return /<meta\s+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(content);
}

function hasJsonLd(content) {
    return /<script type=["']application\/ld\+json["']>/i.test(content);
}

function hasCanonical(content, file) {
    const expected = `${siteUrl}${urlPathForFile(file)}`;
    const canonical = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1] || '';
    return canonical === expected;
}

function hasTitleAndDescription(content) {
    return /<title>[\s\S]*?<\/title>/i.test(content)
        && /<meta\s+name=(["'])description\1\s+content=(["'])[\s\S]{40,}?\2/i.test(content);
}

function isCommercialTarget(row) {
    return row.priority === '1' || /high commercial/i.test(row.intent || '');
}

function fail(message, details = '') {
    return details ? `${message}: ${details}` : message;
}

const keywordRows = parseCsv(fs.readFileSync(path.join(rootDir, 'seo', 'keyword-watchlist.csv'), 'utf8'));
const sitemap = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
const llms = fs.readFileSync(path.join(distDir, 'llms.txt'), 'utf8');
const errors = [];
const checkedTargets = new Map();

keywordRows
    .filter(row => row.target_url && (row.priority === '1' || /high commercial/i.test(row.intent || '')))
    .forEach(row => {
        const file = targetToFile(row.target_url);
        const filePath = path.join(distDir, file);
        const key = `${row.target_url}|${file}`;

        if (!fs.existsSync(filePath)) {
            errors.push(fail('Target page missing', `${row.keyword} -> ${row.target_url}`));
            return;
        }

        if (!checkedTargets.has(key)) {
            checkedTargets.set(key, {
                file,
                keywords: [],
                commercial: false,
            });
        }

        const target = checkedTargets.get(key);
        target.keywords.push(row.keyword);
        target.commercial = target.commercial || isCommercialTarget(row);
    });

checkedTargets.forEach(target => {
    const filePath = path.join(distDir, target.file);
    const content = fs.readFileSync(filePath, 'utf8');
    const urlPath = urlPathForFile(target.file);
    const canonicalUrl = `${siteUrl}${urlPath}`;
    const forms = formNames(content);

    if (hasNoindex(content)) {
        errors.push(fail('Priority target is noindex', `${urlPath} (${target.keywords.join(', ')})`));
    }

    if (!hasTitleAndDescription(content)) {
        errors.push(fail('Priority target missing title or strong meta description', urlPath));
    }

    if (!hasCanonical(content, target.file)) {
        errors.push(fail('Priority target missing expected canonical', urlPath));
    }

    if (!hasJsonLd(content)) {
        errors.push(fail('Priority target missing JSON-LD', urlPath));
    }

    if (!sitemap.includes(`<loc>${canonicalUrl}</loc>`)) {
        errors.push(fail('Priority target missing from sitemap', urlPath));
    }

    if (!llms.includes(canonicalUrl)) {
        errors.push(fail('Priority target missing from llms.txt', urlPath));
    }

    if (target.commercial && !forms.length) {
        errors.push(fail('Commercial target missing lead form', urlPath));
    }
});

const getStartedPath = path.join(distDir, 'get-started.html');
const getStarted = fs.existsSync(getStartedPath) ? fs.readFileSync(getStartedPath, 'utf8') : '';

if (!formNames(getStarted).includes('Website Request')) {
    errors.push('Get started page missing Website Request form');
}

if (!formNames(getStarted).includes('Preview Quick Lead')) {
    errors.push('Get started page missing Preview Quick Lead form');
}

if (!getStarted.includes('business-search') || !getStarted.includes('Google Maps JavaScript API')) {
    errors.push('Get started page missing Google Business lookup flow');
}

if (errors.length) {
    console.error('SEO funnel verification failed:');
    errors.forEach(error => console.error(`- ${error}`));
    process.exit(1);
}

console.log(`SEO funnel verification passed for ${checkedTargets.size} priority target page(s).`);
