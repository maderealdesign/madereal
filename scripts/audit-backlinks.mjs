import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const portfolioPath = path.join(rootDir, 'seo', 'portfolio-opportunities.csv');
const outputPath = path.join(rootDir, 'seo', 'backlink-audit.csv');
const targetHost = 'madereal.uk';
const timeoutMs = 12000;

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
    const headers = parseCsvLine(rows.shift());

    return rows.map(line => {
        const values = parseCsvLine(line);
        return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
    });
}

function csvEscape(value) {
    const text = String(value ?? '');
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function normaliseWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

async function fetchHomepage(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            redirect: 'follow',
            signal: controller.signal,
            headers: {
                'user-agent': 'MadeReal SEO backlink audit (+https://madereal.uk)',
                accept: 'text/html,application/xhtml+xml',
            },
        });

        const contentType = response.headers.get('content-type') || '';
        const html = contentType.includes('text/html') ? await response.text() : '';

        return {
            ok: response.ok,
            status: response.status,
            finalUrl: response.url,
            html,
            error: '',
        };
    } catch (error) {
        return {
            ok: false,
            status: '',
            finalUrl: '',
            html: '',
            error: error.name === 'AbortError' ? 'timeout' : error.message,
        };
    } finally {
        clearTimeout(timer);
    }
}

function inspectBacklink(html) {
    const lowerHtml = html.toLowerCase();
    const hasMaderealHost = lowerHtml.includes(targetHost);
    const linkMatches = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    const links = linkMatches.map(match => ({
        href: match[1],
        text: normaliseWhitespace(match[2].replace(/<[^>]+>/g, '')),
        raw: match[0],
    }));

    const maderealLinks = links.filter(link => {
        try {
            const href = new URL(link.href, 'https://example.com');
            return href.hostname.replace(/^www\./, '') === targetHost;
        } catch {
            return link.href.includes(targetHost);
        }
    });

    const creditLink = maderealLinks.find(link => /made\s*real|madereal|website|built|design|created/i.test(`${link.text} ${link.raw}`));

    return {
        hasMaderealHost,
        linkCount: maderealLinks.length,
        creditPresent: Boolean(creditLink),
        firstLinkText: maderealLinks[0]?.text || '',
        firstLinkHref: maderealLinks[0]?.href || '',
    };
}

function actionForResult(row, result, backlink) {
    if (result.error) return `Check site manually: ${result.error}`;
    if (!result.ok) return `Check site manually: HTTP ${result.status}`;
    if (!backlink.hasMaderealHost) return 'Add approved footer credit or record why it is excluded';
    if (!backlink.creditPresent) return 'Review link context and make credit text clearer';
    return row.notes.includes('Needs source/status review') ? 'Confirm public case-study permission' : 'Candidate for case study/internal proof';
}

const portfolioRows = parseCsv(fs.readFileSync(portfolioPath, 'utf8'));
const auditRows = [];

for (const row of portfolioRows) {
    const result = await fetchHomepage(row.primary_url);
    const backlink = inspectBacklink(result.html);
    auditRows.push({
        checked_at: new Date().toISOString(),
        project: row.project,
        primary_url: row.primary_url,
        status: result.status,
        final_url: result.finalUrl,
        fetch_error: result.error,
        madereal_host_present: backlink.hasMaderealHost ? 'yes' : 'no',
        madereal_link_count: backlink.linkCount,
        credit_present: backlink.creditPresent ? 'yes' : 'no',
        first_link_text: backlink.firstLinkText,
        first_link_href: backlink.firstLinkHref,
        recommended_action: actionForResult(row, result, backlink),
    });

    console.log(`${row.project}: ${result.status || result.error} | credit ${backlink.creditPresent ? 'yes' : 'no'} | ${actionForResult(row, result, backlink)}`);
}

const headers = Object.keys(auditRows[0] || {});
const csv = [
    headers.join(','),
    ...auditRows.map(row => headers.map(header => csvEscape(row[header])).join(',')),
].join('\n');

fs.writeFileSync(outputPath, `${csv}\n`);
console.log(`\nWrote ${path.relative(rootDir, outputPath)}`);
