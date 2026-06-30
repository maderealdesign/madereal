import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exportsDir = path.join(rootDir, 'seo', 'exports');
const defaultSiteId = '406c26ef-c9cf-473c-a530-74b346695cd4';

function argValue(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : '';
}

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

function csvValue(value) {
    const text = String(value ?? '');
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function parseFormsJson(source) {
    const parsed = JSON.parse(source);

    if (Array.isArray(parsed)) {
        if (parsed.every(item => item && typeof item === 'object' && 'name' in item)) {
            return parsed;
        }

        const textPayload = parsed.find(item => item && typeof item === 'object' && typeof item.text === 'string');
        if (textPayload) {
            return parseFormsJson(textPayload.text);
        }
    }

    if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.forms)) return parsed.forms;
        if (Array.isArray(parsed.data)) return parsed.data;
        if (typeof parsed.text === 'string') return parseFormsJson(parsed.text);
    }

    throw new Error('Could not find a Netlify forms array in the provided JSON.');
}

async function fetchFormsFromNetlify(siteId, token) {
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'madereal-seo-monitor',
        },
    });

    if (!response.ok) {
        throw new Error(`Netlify API returned ${response.status}: ${await response.text()}`);
    }

    return response.json();
}

function normaliseForm(form) {
    const fieldNames = Array.isArray(form.fields)
        ? form.fields.map(field => field?.name).filter(Boolean).join('; ')
        : '';

    return {
        form: form.name || form.form_name || '',
        submissions: form.submission_count ?? form.submissions ?? form.entries ?? 0,
        lastSubmissionAt: form.last_submission_at || form.lastSubmissionAt || '',
        fields: fieldNames || form.fields || '',
        source: 'Netlify API',
    };
}

async function main() {
    const date = argValue('--date') || todayIso();
    const output = argValue('--output') || path.join(exportsDir, `netlify-forms-${date}.csv`);
    const input = argValue('--input');
    const siteId = argValue('--site-id') || process.env.NETLIFY_SITE_ID || defaultSiteId;
    const token = process.env.NETLIFY_AUTH_TOKEN;

    let forms;

    if (input) {
        forms = parseFormsJson(fs.readFileSync(path.resolve(input), 'utf8'));
    } else if (process.env.NETLIFY_FORMS_JSON) {
        forms = parseFormsJson(process.env.NETLIFY_FORMS_JSON);
    } else if (token) {
        forms = await fetchFormsFromNetlify(siteId, token);
    } else {
        console.error('Missing Netlify source. Set NETLIFY_AUTH_TOKEN, NETLIFY_FORMS_JSON, or pass --input path/to/forms.json.');
        console.error('Example: NETLIFY_AUTH_TOKEN=... npm run seo:netlify-forms');
        process.exit(1);
    }

    const rows = forms.map(normaliseForm).filter(row => row.form);
    const csv = [
        ['Form', 'Submission Count', 'Last Submission At', 'Fields', 'Source'],
        ...rows.map(row => [row.form, row.submissions, row.lastSubmissionAt, row.fields, row.source]),
    ].map(row => row.map(csvValue).join(',')).join('\n');

    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${csv}\n`);

    const total = rows.reduce((sum, row) => sum + Number(row.submissions || 0), 0);
    console.log(`Wrote ${path.relative(rootDir, output)} (${rows.length} form rows, ${total} submissions)`);
}

main().catch(error => {
    console.error(error.message);
    process.exit(1);
});
