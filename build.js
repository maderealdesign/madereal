const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const srcDir = __dirname;
const distDir = path.join(__dirname, 'dist');
const postsDir = path.join(srcDir, 'content', 'posts');
const blogOutputDir = path.join(distDir, 'blog');
const siteUrl = 'https://madereal.uk';

const headerCode = fs.readFileSync(path.join(srcDir, 'header_template.html'), 'utf8');
const footerPath = path.join(srcDir, 'footer_template.html');
const footerCode = fs.existsSync(footerPath) ? fs.readFileSync(footerPath, 'utf8') : '';

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function replaceGlobalPartials(content) {
    return content
        .replace('[[[INJECT_HEADER]]]', headerCode)
        .replace('[[[INJECT_FOOTER]]]', footerCode);
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function slugify(value = '') {
    return String(value)
        .toLowerCase()
        .trim()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function getDateIso(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
}

function stripLeadingMarkdownH1(markdown) {
    return markdown.replace(/^#\s+.+(?:\r?\n)+/, '');
}

function getExcerpt(data, content) {
    if (data.excerpt) return String(data.excerpt);
    if (data.meta_description) return String(data.meta_description);

    const firstParagraph = content
        .split(/\n{2,}/)
        .find(block => block.trim() && !block.trim().startsWith('#'));

    return firstParagraph ? firstParagraph.replace(/[*_`>#-]/g, '').trim().slice(0, 180) : '';
}

function getKeywords(data) {
    if (Array.isArray(data.keywords)) return data.keywords.join(', ');
    return data.keywords ? String(data.keywords) : '';
}

function findHtmlFiles(dir, baseDir = dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (['dist', '.git', 'node_modules', 'content'].includes(entry.name)) {
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

function findBuiltHtmlFiles(dir, baseDir = dir) {
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (entry.isDirectory()) {
            return findBuiltHtmlFiles(fullPath, baseDir);
        }

        if (entry.isFile() && entry.name.endsWith('.html')) {
            return [relativePath];
        }

        return [];
    });
}

function copyStaticAssets() {
    ['assets'].forEach(directory => {
        const source = path.join(srcDir, directory);
        const destination = path.join(distDir, directory);

        if (!fs.existsSync(source)) return;

        fs.cpSync(source, destination, { recursive: true });
        console.log(`Successfully copied: ${directory}/`);
    });
}

function readPosts() {
    if (!fs.existsSync(postsDir)) return [];

    return fs.readdirSync(postsDir)
        .filter(file => file.endsWith('.md') && file.toLowerCase() !== 'readme.md')
        .map(file => {
            const source = fs.readFileSync(path.join(postsDir, file), 'utf8');
            const parsed = matter(source);
            const data = parsed.data;
            const title = data.title || path.basename(file, '.md');
            const slug = data.slug ? slugify(data.slug) : slugify(title);
            const date = data.date || new Date().toISOString();

            return {
                sourceFile: file,
                title: String(title),
                heading: String(data.h1 || title),
                metaDescription: String(data.meta_description || getExcerpt(data, parsed.content)),
                date,
                dateIso: getDateIso(date),
                dateDisplay: formatDate(date),
                slug,
                author: String(data.author || 'MadeReal'),
                keywords: getKeywords(data),
                excerpt: getExcerpt(data, parsed.content),
                content: parsed.content,
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderBlogCard(post) {
    return `
                    <article class="group bg-white rounded-[32px] p-6 md:p-8 border-2 border-gray-200 hover:border-slate-900 hover:shadow-hard transition-all duration-300">
                        <div class="flex items-center justify-between gap-4 mb-8">
                            <time datetime="${escapeHtml(post.dateIso)}" class="text-xs font-black uppercase tracking-widest text-gray-400">${escapeHtml(post.dateDisplay)}</time>
                            <span class="w-12 h-12 rounded-2xl bg-brand-gray border-2 border-gray-200 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-slate-900 group-hover:border-slate-900 transition-colors">
                                <i class="fas fa-arrow-right"></i>
                            </span>
                        </div>
                        <h3 class="text-2xl md:text-3xl font-black tracking-tight leading-tight text-slate-900 uppercase mb-4">
                            <a href="/blog/${escapeHtml(post.slug)}.html">${escapeHtml(post.title)}</a>
                        </h3>
                        <p class="text-gray-600 font-medium leading-relaxed mb-8">${escapeHtml(post.excerpt)}</p>
                        <div class="flex flex-wrap gap-2">
                            ${post.keywords.split(',').map(keyword => keyword.trim()).filter(Boolean).slice(0, 3).map(keyword => `<span class="bg-brand-gray text-slate-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">${escapeHtml(keyword)}</span>`).join('')}
                        </div>
                    </article>`;
}

function getUrlPath(file) {
    const normalised = file.split(path.sep).join('/');
    if (normalised === 'index.html') return '/';
    return `/${normalised}`;
}

function getCanonicalUrl(file) {
    return `${siteUrl}${getUrlPath(file)}`;
}

function hasNoindex(content) {
    return /<meta\s+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(content);
}

function injectCanonical(content, file) {
    if (hasNoindex(content) || /<link\s+rel=["']canonical["']/i.test(content)) {
        return content;
    }

    const canonical = `    <link rel="canonical" href="${escapeHtml(getCanonicalUrl(file))}">\n`;
    return content.replace(/(<meta name="description" content="[^"]*">\s*)/i, `$1\n${canonical}`);
}

function buildSitemap(posts) {
    const postDateMap = new Map(posts.map(post => [`blog/${post.slug}.html`, post.dateIso]));
    const today = new Date().toISOString().slice(0, 10);
    const urls = findBuiltHtmlFiles(distDir)
        .filter(file => {
            const content = fs.readFileSync(path.join(distDir, file), 'utf8');
            return !hasNoindex(content);
        })
        .sort()
        .map(file => {
            const loc = getCanonicalUrl(file);
            const lastmod = postDateMap.get(file.split(path.sep).join('/')) || today;
            const priority = file === 'index.html' ? '1.0' : file.startsWith(`blog${path.sep}`) ? '0.7' : '0.8';

            return `  <url>
    <loc>${escapeHtml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
        })
        .join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
    fs.writeFileSync(path.join(distDir, 'robots.txt'), `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`);
    console.log('Successfully built: sitemap.xml');
    console.log('Successfully built: robots.txt');
}

async function buildBlog() {
    const { marked } = await import('marked');
    const posts = readPosts();
    const template = fs.readFileSync(path.join(srcDir, 'blog_post_template.html'), 'utf8');

    ensureDir(blogOutputDir);

    marked.setOptions({
        gfm: true,
        breaks: false,
    });

    posts.forEach(post => {
        const html = marked.parse(stripLeadingMarkdownH1(post.content));
        const rendered = replaceGlobalPartials(template)
            .replaceAll('[[[POST_TITLE]]]', escapeHtml(post.title))
            .replaceAll('[[[POST_META_DESCRIPTION]]]', escapeHtml(post.metaDescription))
            .replaceAll('[[[POST_KEYWORDS]]]', escapeHtml(post.keywords))
            .replaceAll('[[[POST_AUTHOR]]]', escapeHtml(post.author))
            .replaceAll('[[[POST_SLUG]]]', escapeHtml(post.slug))
            .replaceAll('[[[POST_DATE_ISO]]]', escapeHtml(post.dateIso))
            .replaceAll('[[[POST_DATE_DISPLAY]]]', escapeHtml(post.dateDisplay))
            .replaceAll('[[[POST_HEADING]]]', escapeHtml(post.heading))
            .replaceAll('[[[POST_EXCERPT]]]', escapeHtml(post.excerpt))
            .replace('[[[POST_CONTENT]]]', html);

        fs.writeFileSync(path.join(blogOutputDir, `${post.slug}.html`), rendered);
        console.log(`Successfully built blog post: blog/${post.slug}.html`);
    });

    return posts;
}

async function main() {
    fs.rmSync(distDir, { recursive: true, force: true });
    ensureDir(distDir);

    const posts = await buildBlog();
    const files = findHtmlFiles(srcDir);

    files.forEach(file => {
        let content = fs.readFileSync(path.join(srcDir, file), 'utf8');

        if (file === 'blog.html') {
            const blogCards = posts.length
                ? posts.map(renderBlogCard).join('\n')
                : '<p class="md:col-span-2 lg:col-span-3 text-xl font-bold text-gray-500">No blog posts have been published yet.</p>';
            content = content.replace('[[[BLOG_POSTS]]]', blogCards);
        }

        content = replaceGlobalPartials(content);
        content = injectCanonical(content, file);

        ensureDir(path.dirname(path.join(distDir, file)));
        fs.writeFileSync(path.join(distDir, file), content);
        console.log(`Successfully built: ${file}`);
    });

    copyStaticAssets();
    buildSitemap(posts);

    console.log(`✅ Website build complete! ${posts.length} blog post(s) generated. Ready for Netlify.`);
}

main().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
});
