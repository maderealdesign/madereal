import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seoDir = path.join(rootDir, 'seo');
const reviewsDir = path.join(seoDir, 'reviews');
const dashboardPath = path.join(seoDir, 'dashboard.md');

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

function args() {
    return process.argv.slice(2);
}

function hasFlag(flag) {
    return args().includes(flag);
}

function argDate() {
    return args().find(arg => !arg.startsWith('--')) || todayIso();
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function section(markdown, heading) {
    const pattern = new RegExp(`## ${escapeRegExp(heading)}\\n\\n([\\s\\S]*?)(?=\\n## |$)`);
    return markdown.match(pattern)?.[1]?.trim() || '';
}

function firstTableRows(markdownSection, maxRows = 8) {
    return markdownSection
        .split(/\r?\n/)
        .filter(line => line.startsWith('|'))
        .slice(0, maxRows + 2)
        .join('\n');
}

if (!fs.existsSync(dashboardPath)) {
    console.error('Missing seo/dashboard.md. Run npm run seo:monitor first.');
    process.exit(1);
}

const dashboard = fs.readFileSync(dashboardPath, 'utf8');
const date = argDate();
const reviewPath = path.join(reviewsDir, `${date}.md`);
const shouldRefresh = hasFlag('--refresh') || hasFlag('--force');
const existingReview = fs.existsSync(reviewPath) ? fs.readFileSync(reviewPath, 'utf8') : '';

if (existingReview && !shouldRefresh) {
    console.log(`Weekly review already exists: ${path.relative(rootDir, reviewPath)}`);
    process.exit(0);
}

const snapshot = section(dashboard, 'Snapshot');
const dataExportStatus = section(dashboard, 'Data Export Status');
const nextActions = section(dashboard, 'Next Actions');
const searchConsoleOpportunities = section(dashboard, 'Search Console Opportunities');
const netlifyFormEnquiries = section(dashboard, 'Netlify Form Enquiries');
const ga4LeadEvents = section(dashboard, 'GA4 Lead Events');
const gbpActions = section(dashboard, 'Google Business Profile Actions');
const missingCredits = section(dashboard, 'Missing Or Unclear Portfolio Credits');
const technicalChecks = section(dashboard, 'Technical Checks');
const diagnosis = section(existingReview, "This Week's Diagnosis") || `- Organic visibility:
- Enquiry volume:
- Best page or query:
- Weakest page or query:
- Biggest missed-call risk:`;
const actionsChosen = section(existingReview, 'Actions Chosen') || `Pick no more than three. The point is enquiries, not looking busy.

1. 
2. 
3. `;
const followUpNotes = section(existingReview, 'Follow-Up Notes') || '- ';

const review = `# MadeReal Weekly Organic Review - ${date}

## Export Checklist

- [ ] Search Console Queries export added to \`seo/exports/\`
- [ ] Search Console Pages export added to \`seo/exports/\`
- [ ] GA4 Events export added to \`seo/exports/\`
- [ ] Google Business Profile performance rows added to \`seo/exports/\`
- [ ] Netlify forms snapshot refreshed with \`npm run seo:netlify-forms\` or updated manually
- [ ] Ran \`npm run seo:monitor\`

## Current Snapshot

${snapshot || '_Run the dashboard to populate this section._'}

## Data Export Status

${dataExportStatus || '_No export status found yet._'}

## This Week's Diagnosis

${diagnosis}

## Dashboard Next Actions

${nextActions || '_No dashboard actions found yet._'}

## Search Console Priorities

Use this section to pick pages with impressions, low CTR, or rankings around positions 8-30.

${searchConsoleOpportunities || '_No Search Console opportunity data yet._'}

## Lead And Profile Actions

### Netlify Form Enquiries

${netlifyFormEnquiries || '_No Netlify form snapshot found yet._'}

### GA4 Lead Events

${ga4LeadEvents || '_No GA4 lead event data yet._'}

### Google Business Profile Actions

${gbpActions || '_No Google Business Profile data yet._'}

## Backlink And Proof Work

Review one or two missing credits, then either add an approved footer credit or record why the site is excluded.

${firstTableRows(missingCredits, 6) || '_No backlink rows found._'}

## Technical Guardrails

${technicalChecks || '_No technical check data found._'}

## Actions Chosen

${actionsChosen}

## Follow-Up Notes

${followUpNotes}
`;

fs.mkdirSync(reviewsDir, { recursive: true });
fs.writeFileSync(reviewPath, review);
console.log(`${existingReview ? 'Refreshed' : 'Wrote'} ${path.relative(rootDir, reviewPath)}`);
