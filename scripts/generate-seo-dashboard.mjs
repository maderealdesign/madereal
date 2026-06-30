import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seoDir = path.join(rootDir, 'seo');
const distDir = path.join(rootDir, 'dist');
const dashboardPath = path.join(seoDir, 'dashboard.md');
const exportsDir = process.env.MADEREAL_SEO_EXPORTS_DIR || path.join(seoDir, 'exports');
const siteUrl = 'https://madereal.uk';

function parseCsvLine(line, delimiter = ',') {
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
        } else if (char === delimiter && !inQuotes) {
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
    const headerLine = rows.shift();
    const delimiter = headerLine.includes('\t') && !headerLine.includes(',') ? '\t' : ',';
    const headers = parseCsvLine(headerLine, delimiter);

    return rows.map((line, rowIndex) => {
        const values = parseCsvLine(line, delimiter);
        if (values.length !== headers.length) {
            console.warn(`CSV row ${rowIndex + 2} has ${values.length} values but expected ${headers.length}. Extra or missing columns may shift dashboard data.`);
        }
        return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
    });
}

function readCsv(relativePath) {
    const filePath = path.join(rootDir, relativePath);
    if (!fs.existsSync(filePath)) return [];
    return parseCsv(fs.readFileSync(filePath, 'utf8'));
}

function findBuiltHtmlFiles(dir, baseDir = dir) {
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (entry.isDirectory()) return findBuiltHtmlFiles(fullPath, baseDir);
        if (entry.isFile() && entry.name.endsWith('.html')) return [relativePath.split(path.sep).join('/')];
        return [];
    });
}

function hasNoindex(content) {
    return /<meta\s+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(content)
        || /x-robots-tag["']?\s*:\s*["']?noindex/i.test(content);
}

function pageTitle(content) {
    return content.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() || '';
}

function metaDescription(content) {
    return content.match(/<meta\s+name=(["'])description\1\s+content=(["'])([\s\S]*?)\2/i)?.[3]?.trim() || '';
}

function formNames(content) {
    return [...content.matchAll(/<form\b[^>]*\bname=["']([^"']+)["'][^>]*>/gi)].map(match => match[1]);
}

const requiredAttributionFields = [
    'Landing_Page',
    'Referrer',
    'UTM_Source',
    'UTM_Medium',
    'UTM_Campaign',
    'UTM_Term',
    'UTM_Content',
    'GCLID',
    'FBCLID',
];

function formFacts(content) {
    return [...content.matchAll(/<form\b[^>]*\bname=["']([^"']+)["'][^>]*>[\s\S]*?<\/form>/gi)].map(match => {
        const formHtml = match[0];
        const missingAttribution = requiredAttributionFields.filter(field => {
            const pattern = new RegExp(`name=["']${field}["']`, 'i');
            return !pattern.test(formHtml);
        });

        return {
            name: match[1],
            hasAttribution: missingAttribution.length === 0,
            missingAttribution,
        };
    });
}

function canonical(content) {
    return content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1] || '';
}

function getBuiltPageFacts() {
    return findBuiltHtmlFiles(distDir).map(file => {
        const absolute = path.join(distDir, file);
        const content = fs.readFileSync(absolute, 'utf8');
        return {
            file,
            urlPath: file === 'index.html' ? '/' : `/${file}`,
            title: pageTitle(content),
            metaDescription: metaDescription(content),
            canonical: canonical(content),
            noindex: hasNoindex(content),
            forms: formNames(content),
            formFacts: formFacts(content),
            jsonLdBlocks: [...content.matchAll(/<script type=["']application\/ld\+json["']>/gi)].length,
        };
    }).sort((a, b) => a.urlPath.localeCompare(b.urlPath));
}

function getLatestMonthlyRow(rows) {
    return rows.slice().sort((a, b) => String(b.month).localeCompare(String(a.month)))[0] || {};
}

function getSearchConsoleExports() {
    if (!fs.existsSync(exportsDir)) return [];
    return fs.readdirSync(exportsDir)
        .filter(file => /\.(csv|tsv)$/i.test(file))
        .sort()
        .filter(file => /quer|page|search-console|gsc/i.test(file))
        .map(file => {
            const filePath = path.join(exportsDir, file);
            const stat = fs.statSync(filePath);
            return {
                file,
                modified: stat.mtime.toISOString().slice(0, 10),
                rows: fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/).filter(Boolean).length - 1,
            };
        });
}

function getAllMonitoringExports() {
    if (!fs.existsSync(exportsDir)) return [];

    return fs.readdirSync(exportsDir)
        .filter(file => /\.(csv|tsv)$/i.test(file))
        .sort()
        .map(file => {
            const filePath = path.join(exportsDir, file);
            const rows = parseCsv(fs.readFileSync(filePath, 'utf8'));
            const stat = fs.statSync(filePath);

            return {
                file,
                type: classifyMonitoringExport(file, rows),
                modified: stat.mtime.toISOString().slice(0, 10),
                rows: rows.length,
            };
        });
}

function normaliseHeader(value = '') {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function getValue(row, candidates) {
    const entries = Object.entries(row);
    const candidateSet = new Set(candidates.map(normaliseHeader));
    const found = entries.find(([key]) => candidateSet.has(normaliseHeader(key)));
    return found ? found[1] : '';
}

function numberValue(value) {
    const parsed = Number(String(value || '').replace(/[% ,]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
}

function pctValue(value) {
    return numberValue(value);
}

function classifySearchConsoleExport(file, rows) {
    const headers = Object.keys(rows[0] || {}).map(normaliseHeader);
    const hasQuery = headers.some(header => ['query', 'topqueries', 'queries'].includes(header));
    const hasPage = headers.some(header => ['page', 'pages', 'url', 'landingpage'].includes(header));

    if (/quer/i.test(file) || (hasQuery && !hasPage)) return 'query';
    if (/page/i.test(file) || hasPage) return 'page';
    return 'unknown';
}

function classifyMonitoringExport(file, rows) {
    const headers = Object.keys(rows[0] || {}).map(normaliseHeader);
    const hasNetlifyFormName = headers.some(header => ['form', 'formname', 'name'].includes(header));
    const hasSubmissionCount = headers.some(header => ['submissioncount', 'submissions', 'entries', 'leads'].includes(header));
    const hasEventName = headers.some(header => ['eventname', 'event'].includes(header));
    const hasMetric = headers.some(header => ['metric', 'action', 'interaction'].includes(header));
    const hasBusinessMetric = headers.some(header => [
        'businessprofileinteractions',
        'websiteclicks',
        'calls',
        'messages',
        'directionrequests',
        'profileviews',
        'searchviews',
        'mapsviews',
    ].includes(header));

    if (/netlify.*forms|forms.*netlify|form-submissions/i.test(file) || (hasNetlifyFormName && hasSubmissionCount)) return 'netlify';
    if (/ga4|analytics|events/i.test(file) || hasEventName) return 'ga4';
    if (/gbp|google-business|business-profile|profile-performance/i.test(file) || hasMetric || hasBusinessMetric) return 'gbp';
    return classifySearchConsoleExport(file, rows);
}

function toPathFromSearchConsoleUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';

    try {
        const url = raw.startsWith('http') ? new URL(raw) : new URL(raw, siteUrl);
        return url.pathname === '/index.html' ? '/' : url.pathname;
    } catch {
        return raw.replace(siteUrl, '').replace(/\/index\.html$/, '/') || raw;
    }
}

function readSearchConsoleRows() {
    if (!fs.existsSync(exportsDir)) return { queryRows: [], pageRows: [] };

    const files = fs.readdirSync(exportsDir)
        .filter(file => /\.(csv|tsv)$/i.test(file))
        .sort();

    const queryRows = [];
    const pageRows = [];

    files.forEach(file => {
        const rows = parseCsv(fs.readFileSync(path.join(exportsDir, file), 'utf8'));
        const type = classifyMonitoringExport(file, rows);

        rows.forEach(row => {
            const normalised = {
                source_file: file,
                dimension: type === 'query'
                    ? getValue(row, ['query', 'top queries', 'queries'])
                    : getValue(row, ['page', 'pages', 'url', 'landing page']),
                clicks: numberValue(getValue(row, ['clicks'])),
                impressions: numberValue(getValue(row, ['impressions'])),
                ctr: pctValue(getValue(row, ['ctr'])),
                position: numberValue(getValue(row, ['position', 'avg position', 'average position'])),
            };

            if (!normalised.dimension) return;
            if (type === 'query') queryRows.push(normalised);
            if (type === 'page') pageRows.push({
                ...normalised,
                page_path: toPathFromSearchConsoleUrl(normalised.dimension),
            });
        });
    });

    return { queryRows, pageRows };
}

function readGa4EventRows() {
    if (!fs.existsSync(exportsDir)) return [];

    const eventRows = [];
    const files = fs.readdirSync(exportsDir)
        .filter(file => /\.(csv|tsv)$/i.test(file))
        .sort();

    files.forEach(file => {
        const rows = parseCsv(fs.readFileSync(path.join(exportsDir, file), 'utf8'));
        if (classifyMonitoringExport(file, rows) !== 'ga4') return;

        rows.forEach(row => {
            const eventName = getValue(row, ['event name', 'event_name', 'eventName', 'event']);
            if (!eventName) return;

            eventRows.push({
                source_file: file,
                event_name: eventName,
                event_count: numberValue(getValue(row, ['event count', 'event_count', 'eventCount', 'count', 'events'])),
                users: numberValue(getValue(row, ['total users', 'users', 'active users'])),
                key_events: numberValue(getValue(row, ['key events', 'conversions', 'conversion count'])),
            });
        });
    });

    return eventRows;
}

function ga4LeadSummary(rows) {
    const leadEventPattern = /^(generate_lead|phone_call_click|whatsapp_click|email_click|preview_cta_click|form_submit_)/;
    const totals = new Map();

    rows
        .filter(row => leadEventPattern.test(row.event_name))
        .forEach(row => {
            const current = totals.get(row.event_name) || {
                event_name: row.event_name,
                event_count: 0,
                users: 0,
                key_events: 0,
                sources: new Set(),
            };

            current.event_count += row.event_count;
            current.users += row.users;
            current.key_events += row.key_events;
            current.sources.add(row.source_file);
            totals.set(row.event_name, current);
        });

    return [...totals.values()]
        .sort((a, b) => b.event_count - a.event_count)
        .map(row => ({
            event_name: row.event_name,
            event_count: row.event_count,
            users: row.users,
            key_events: row.key_events,
            sources: [...row.sources].join(', '),
        }));
}

function readGbpRows() {
    if (!fs.existsSync(exportsDir)) return [];

    const rowsOut = [];
    const files = fs.readdirSync(exportsDir)
        .filter(file => /\.(csv|tsv)$/i.test(file))
        .sort();

    files.forEach(file => {
        const rows = parseCsv(fs.readFileSync(path.join(exportsDir, file), 'utf8'));
        if (classifyMonitoringExport(file, rows) !== 'gbp') return;

        rows.forEach(row => {
            const metric = getValue(row, ['metric', 'action', 'interaction', 'event', 'name'])
                || Object.keys(row).find(key => numberValue(row[key]) > 0)
                || '';
            const value = numberValue(getValue(row, ['value', 'count', 'total', 'interactions', 'clicks', 'calls'])
                || row[metric]);

            if (!metric || !value) return;

            rowsOut.push({
                source_file: file,
                metric,
                value,
            });
        });
    });

    return rowsOut;
}

function gbpSummary(rows) {
    const totals = new Map();

    rows.forEach(row => {
        const key = row.metric;
        const current = totals.get(key) || {
            metric: key,
            value: 0,
            sources: new Set(),
        };

        current.value += row.value;
        current.sources.add(row.source_file);
        totals.set(key, current);
    });

    return [...totals.values()]
        .sort((a, b) => b.value - a.value)
        .map(row => ({
            metric: row.metric,
            value: row.value,
            sources: [...row.sources].join(', '),
        }));
}

function readNetlifyFormRows() {
    if (!fs.existsSync(exportsDir)) return [];

    const formRows = [];
    const files = fs.readdirSync(exportsDir)
        .filter(file => /\.(csv|tsv)$/i.test(file))
        .sort();

    files.forEach(file => {
        const rows = parseCsv(fs.readFileSync(path.join(exportsDir, file), 'utf8'));
        if (classifyMonitoringExport(file, rows) !== 'netlify') return;

        rows.forEach(row => {
            const formName = getValue(row, ['form', 'form name', 'form_name', 'name']);
            if (!formName) return;

            formRows.push({
                source_file: file,
                form_name: formName,
                submission_count: numberValue(getValue(row, ['submission count', 'submission_count', 'submissions', 'entries', 'leads'])),
                last_submission_at: getValue(row, ['last submission at', 'last_submission_at', 'last submission', 'last_submission']),
                fields: getValue(row, ['fields', 'field names', 'field_names']),
            });
        });
    });

    return formRows;
}

function netlifyFormSummary(rows) {
    return rows
        .slice()
        .sort((a, b) => b.submission_count - a.submission_count || a.form_name.localeCompare(b.form_name))
        .map(row => ({
            form_name: row.form_name,
            submission_count: row.submission_count,
            last_submission_at: row.last_submission_at || 'none recorded',
            fields: row.fields,
            source: row.source_file,
        }));
}

function summariseBacklog(rows) {
    const totals = new Map();

    rows.forEach(row => {
        const status = row.status || 'unknown';
        const priority = row.priority || 'unknown';
        const key = `${status}|${priority}`;
        const current = totals.get(key) || {
            status,
            priority,
            count: 0,
        };

        current.count += 1;
        totals.set(key, current);
    });

    return [...totals.values()].sort((a, b) => {
        if (a.status !== b.status) return a.status.localeCompare(b.status);
        return String(a.priority).localeCompare(String(b.priority));
    });
}

function latestDate(values) {
    return values
        .filter(Boolean)
        .sort((a, b) => String(b).localeCompare(String(a)))[0] || '';
}

function searchConsoleOpportunities(queryRows, pageRows, builtPages) {
    const builtPageByPath = new Map(builtPages.map(page => [page.urlPath, page]));

    const lowCtrQueries = queryRows
        .filter(row => row.impressions >= 20 && row.ctr > 0 && row.ctr < 2.5)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 10);

    const strikingDistanceQueries = queryRows
        .filter(row => row.impressions >= 10 && row.position >= 8 && row.position <= 30)
        .sort((a, b) => a.position - b.position || b.impressions - a.impressions)
        .slice(0, 10);

    const pageOpportunities = pageRows
        .filter(row => row.impressions >= 10)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 12)
        .map(row => {
            const page = builtPageByPath.get(row.page_path);
            return {
                page: row.page_path || row.dimension,
                clicks: row.clicks,
                impressions: row.impressions,
                ctr: `${row.ctr}%`,
                position: row.position,
                forms: page?.forms?.length ? page.forms.join(', ') : 'none detected',
                action: page?.forms?.length ? 'Improve title/meta/internal links' : 'Add or verify lead capture',
            };
        });

    return { lowCtrQueries, strikingDistanceQueries, pageOpportunities };
}

function table(rows, headers) {
    if (!rows.length) return '_No rows yet._';
    const headerLine = `| ${headers.join(' | ')} |`;
    const divider = `| ${headers.map(() => '---').join(' |')} |`;
    const body = rows.map(row => `| ${headers.map(header => String(row[header] ?? '').replace(/\|/g, '\\|')).join(' |')} |`);
    return [headerLine, divider, ...body].join('\n');
}

function exportStatusRows({ allExports, searchConsoleRows, ga4Rows, gbpRows, netlifyFormRows }) {
    const filesForType = type => allExports
        .filter(file => file.type === type)
        .map(file => file.file)
        .join(', ') || 'none';

    return [
        {
            source: 'Search Console queries',
            status: searchConsoleRows.queryRows.length ? 'ready' : 'missing',
            files: searchConsoleRows.queryRows.length ? filesForType('query') : 'none',
            needed: 'Export Performance > Queries, last 28 days, Web',
            columns: 'Query, Clicks, Impressions, CTR, Position',
        },
        {
            source: 'Search Console pages',
            status: searchConsoleRows.pageRows.length ? 'ready' : 'missing',
            files: searchConsoleRows.pageRows.length ? filesForType('page') : 'none',
            needed: 'Export Performance > Pages, last 28 days, Web',
            columns: 'Page, Clicks, Impressions, CTR, Position',
        },
        {
            source: 'GA4 lead events',
            status: ga4Rows.length ? 'ready' : 'missing',
            files: ga4Rows.length ? filesForType('ga4') : 'none',
            needed: 'Export Events report filtered to lead/click events',
            columns: 'Event name, Event count, Total users, Key events',
        },
        {
            source: 'Google Business Profile',
            status: gbpRows.length ? 'ready' : 'missing',
            files: gbpRows.length ? filesForType('gbp') : 'none',
            needed: 'Export or record profile performance rows',
            columns: 'Metric, Value',
        },
        {
            source: 'Netlify forms',
            status: netlifyFormRows.length ? 'ready' : 'missing',
            files: netlifyFormRows.length ? filesForType('netlify') : 'none',
            needed: 'Run npm run seo:netlify-forms or add a forms CSV',
            columns: 'Form, Submission Count, Last Submission At, Fields',
        },
    ];
}

const builtPages = getBuiltPageFacts();
const indexablePages = builtPages.filter(page => !page.noindex);
const pagesMissingMeta = indexablePages.filter(page => !page.title || !page.metaDescription || !page.canonical);
const pagesWithoutSchema = indexablePages.filter(page => page.jsonLdBlocks === 0);
const pagesWithForms = builtPages.filter(page => page.forms.length);
const formsTotal = builtPages.reduce((total, page) => total + page.formFacts.length, 0);
const formsWithAttribution = builtPages.reduce(
    (total, page) => total + page.formFacts.filter(form => form.hasAttribution).length,
    0,
);
const formsMissingAttribution = builtPages.flatMap(page => page.formFacts
    .filter(form => !form.hasAttribution)
    .map(form => ({
        page: page.urlPath,
        form: form.name,
        missing_fields: form.missingAttribution.join(', '),
    })));
const monthlyRows = readCsv('seo/monthly-monitoring-template.csv');
const latestMonthly = getLatestMonthlyRow(monthlyRows);
const keywords = readCsv('seo/keyword-watchlist.csv');
const priorityKeywords = keywords.filter(row => row.priority === '1');
const pageBacklog = readCsv('seo/page-growth-backlog.csv');
const pageBacklogSummary = summariseBacklog(pageBacklog);
const backlinkRows = readCsv('seo/backlink-audit.csv');
const verifiedCredits = backlinkRows.filter(row => row.credit_present === 'yes');
const missingCredits = backlinkRows.filter(row => row.credit_present !== 'yes');
const exports = getSearchConsoleExports();
const allMonitoringExports = getAllMonitoringExports();
const searchConsoleRows = readSearchConsoleRows();
const opportunities = searchConsoleOpportunities(searchConsoleRows.queryRows, searchConsoleRows.pageRows, builtPages);
const ga4Rows = readGa4EventRows();
const ga4Leads = ga4LeadSummary(ga4Rows);
const gbpRows = readGbpRows();
const gbpTotals = gbpSummary(gbpRows);
const netlifyFormRows = readNetlifyFormRows();
const netlifyForms = netlifyFormSummary(netlifyFormRows);
const netlifyTotalSubmissions = netlifyFormRows.reduce((total, row) => total + row.submission_count, 0);
const netlifyLatestSubmission = latestDate(netlifyFormRows
    .filter(row => row.submission_count > 0)
    .map(row => row.last_submission_at));
const statusRows = exportStatusRows({
    allExports: allMonitoringExports,
    searchConsoleRows,
    ga4Rows,
    gbpRows,
    netlifyFormRows,
});
const missingExportRows = statusRows.filter(row => row.status !== 'ready');

const dashboard = `# MadeReal SEO Dashboard

Generated: ${new Date().toISOString()}

## Snapshot

- Indexable built pages: ${indexablePages.length}
- Built pages with forms: ${pagesWithForms.length}
- Lead forms with attribution fields: ${formsWithAttribution}/${formsTotal}
- Priority keyword targets: ${priorityKeywords.length}
- Page growth backlog rows: ${pageBacklog.length}
- Verified portfolio credits: ${verifiedCredits.length}
- Missing or unclear portfolio credits: ${missingCredits.length}
- Search Console export files found: ${exports.length}
- GA4 event rows parsed: ${ga4Rows.length}
- Google Business Profile rows parsed: ${gbpRows.length}
- Netlify form rows parsed: ${netlifyFormRows.length}
- Netlify form submissions recorded: ${netlifyTotalSubmissions}${netlifyLatestSubmission ? ` (latest: ${netlifyLatestSubmission})` : ''}

## Data Export Status

${table(statusRows, ['source', 'status', 'files', 'needed', 'columns'])}

## Latest Manual Metrics

${Object.keys(latestMonthly).length ? table([latestMonthly], Object.keys(latestMonthly)) : '_No monthly metrics yet._'}

## Funnel Forms

${table(pagesWithForms.map(page => ({
    page: page.urlPath,
    forms: page.forms.join(', '),
})), ['page', 'forms'])}

## Lead Attribution Audit

${formsMissingAttribution.length ? table(formsMissingAttribution, ['page', 'form', 'missing_fields']) : 'All detected Netlify lead forms include landing page, referrer, UTM, GCLID and FBCLID fields.'}

## Page Growth Backlog

${pageBacklogSummary.length ? table(pageBacklogSummary, ['status', 'priority', 'count']) : '_No page growth backlog found yet._'}

## Netlify Form Enquiries

${netlifyForms.length ? table(netlifyForms, ['form_name', 'submission_count', 'last_submission_at', 'fields', 'source']) : '_No Netlify form snapshot found yet. Add a `netlify-forms-YYYY-MM-DD.csv` export to `seo/exports/`._'}

## Priority Keyword Map

${table(priorityKeywords.map(row => ({
    cluster: row.cluster,
    keyword: row.keyword,
    target_url: row.target_url,
    notes: row.notes,
})), ['cluster', 'keyword', 'target_url', 'notes'])}

## Missing Or Unclear Portfolio Credits

${table(missingCredits.map(row => ({
    project: row.project,
    url: row.primary_url,
    action: row.recommended_action,
})), ['project', 'url', 'action'])}

## Search Console Exports

${exports.length ? table(exports, ['file', 'modified', 'rows']) : '_No exports found. Add Search Console CSV exports to `seo/exports/` before running this command if you want query/page evidence in the dashboard._'}

## All Monitoring Exports

${allMonitoringExports.length ? table(allMonitoringExports, ['file', 'type', 'modified', 'rows']) : '_No monitoring CSV exports found in `seo/exports/`._'}

## Search Console Opportunities

Query rows parsed: ${searchConsoleRows.queryRows.length}
Page rows parsed: ${searchConsoleRows.pageRows.length}

### Low CTR Query Opportunities

${opportunities.lowCtrQueries.length ? table(opportunities.lowCtrQueries.map(row => ({
    query: row.dimension,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: `${row.ctr}%`,
    position: row.position,
    source: row.source_file,
})), ['query', 'clicks', 'impressions', 'ctr', 'position', 'source']) : '_No low-CTR query opportunities found yet. Add or refresh Search Console query exports._'}

### Striking Distance Queries

${opportunities.strikingDistanceQueries.length ? table(opportunities.strikingDistanceQueries.map(row => ({
    query: row.dimension,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: `${row.ctr}%`,
    position: row.position,
    source: row.source_file,
})), ['query', 'clicks', 'impressions', 'ctr', 'position', 'source']) : '_No position 8-30 query opportunities found yet. Add or refresh Search Console query exports._'}

### Page Opportunities

${opportunities.pageOpportunities.length ? table(opportunities.pageOpportunities, ['page', 'clicks', 'impressions', 'ctr', 'position', 'forms', 'action']) : '_No page opportunity rows found yet. Add or refresh Search Console page exports._'}

## GA4 Lead Events

${ga4Leads.length ? table(ga4Leads, ['event_name', 'event_count', 'users', 'key_events', 'sources']) : '_No GA4 lead event rows found yet. Add a GA4 event export to `seo/exports/`._'}

## Google Business Profile Actions

${gbpTotals.length ? table(gbpTotals, ['metric', 'value', 'sources']) : '_No Google Business Profile action rows found yet. Add a GBP performance export to `seo/exports/`._'}

## Technical Checks

- Pages missing title, meta description or canonical: ${pagesMissingMeta.length}
- Indexable pages without JSON-LD: ${pagesWithoutSchema.length}

${pagesMissingMeta.length ? `### Metadata Gaps\n\n${table(pagesMissingMeta.map(page => ({ page: page.urlPath, title: page.title ? 'yes' : 'no', meta: page.metaDescription ? 'yes' : 'no', canonical: page.canonical ? 'yes' : 'no' })), ['page', 'title', 'meta', 'canonical'])}\n` : ''}
${pagesWithoutSchema.length ? `### Schema Gaps\n\n${table(pagesWithoutSchema.map(page => ({ page: page.urlPath })), ['page'])}\n` : ''}
## Next Actions

${missingExportRows.length ? missingExportRows.map((row, index) => `${index + 1}. ${row.needed} into \`seo/exports/\` with columns: ${row.columns}.`).join('\n') : '1. All core monitoring exports are present. Review Search Console opportunities and choose the next page improvements.'}
${missingExportRows.length ? `${missingExportRows.length + 1}. Improve any priority keyword target with impressions but CTR below 2% once Search Console data is present.
${missingExportRows.length + 2}. Review missing portfolio credits and either add approved footer credits or record exclusions.` : '2. Review missing portfolio credits and either add approved footer credits or record exclusions.'}
`;

fs.mkdirSync(seoDir, { recursive: true });
fs.writeFileSync(dashboardPath, dashboard);
console.log(`Wrote ${path.relative(rootDir, dashboardPath)}`);
