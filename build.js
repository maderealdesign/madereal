const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const matter = require('gray-matter');

const srcDir = __dirname;
const distDir = path.join(__dirname, 'dist');
const postsDir = path.join(srcDir, 'content', 'posts');
const blogOutputDir = path.join(distDir, 'blog');
const siteUrl = 'https://madereal.uk';

const businessDetails = {
    name: 'MadeReal Design Ltd',
    url: siteUrl,
    logo: `${siteUrl}/assets/brand/madereal-logo.svg`,
    image: `${siteUrl}/assets/work/madereal-responsive-preview.jpg`,
    telephone: '+447396710347',
    email: 'info@madereal.uk',
    priceRange: '£35-£199/month',
    address: {
        '@type': 'PostalAddress',
        streetAddress: '9 Market St',
        addressLocality: 'Colne',
        addressRegion: 'Lancashire',
        postalCode: 'BB8 0HY',
        addressCountry: 'GB',
    },
    areaServed: [
        'Colne',
        'Burnley',
        'Nelson',
        'Pendle',
        'Skipton',
        'Barnoldswick',
        'Blackburn',
        'Clitheroe',
        'Lancashire',
    ],
};

const trackedServicePages = [
    { name: 'Pay Monthly Websites', path: '/pay-monthly-websites.html', description: 'Free website build for local businesses with hosting, SSL, management and light support from 35 GBP per month.' },
    { name: 'Free Website Build', path: '/free-website-build.html', description: 'Explains MadeReal\'s no-upfront website build model and the 35 GBP per month managed website plan.' },
    { name: 'Google Business Profile Management', path: '/google-business-profile-management.html', description: 'Website care plus Google Business Profile tidy-up, monthly activity and review reply support for 55 GBP per month.' },
    { name: 'Local SEO Packages', path: '/local-seo-packages.html', description: 'Local SEO Growth package with 4 useful content pieces per month, Search Console checks, on-page improvements and reporting for 199 GBP per month.' },
    { name: 'Small Business Websites', path: '/services/small-business-websites.html', description: 'Affordable small business websites for local UK businesses.' },
    { name: 'Tradesman Websites', path: '/services/tradesman-websites.html', description: 'Websites for plumbers, joiners, builders, decorators and local trades.' },
    { name: 'Tradesman Websites Burnley', path: '/services/tradesman-websites-burnley.html', description: 'Trade websites for Burnley builders, joiners, plumbers, plasterers, roofers and local service businesses.' },
    { name: 'Tradesman Websites Colne', path: '/services/tradesman-websites-colne.html', description: 'Trade websites for Colne builders, joiners, plumbers, plasterers, roofers, electricians and property maintenance businesses.' },
    { name: 'Roofing Websites', path: '/services/tradesman-roofing.html', description: 'Websites for roofers, guttering teams and repair specialists.' },
    { name: 'Roofer Websites Burnley', path: '/services/roofer-websites-burnley.html', description: 'Roofing websites for Burnley roofers, guttering teams, flat roof specialists and repair businesses.' },
    { name: 'Electrician Websites', path: '/services/tradesman-electricians.html', description: 'Websites for electricians and electrical contractors.' },
    { name: 'Electrician Websites Burnley', path: '/services/electrician-websites-burnley.html', description: 'Electrician websites for Burnley electricians, electrical contractors, EICR, rewiring and emergency callout businesses.' },
    { name: 'Hospitality Websites', path: '/services/hospitality-websites.html', description: 'Websites for cafes, restaurants, pubs, bars and takeaways.' },
    { name: 'Cafe Websites Colne', path: '/services/cafe-websites-colne.html', description: 'Cafe websites for Colne cafes, coffee shops, brunch spots, takeaway counters and local hospitality businesses.' },
    { name: 'Restaurant Websites Skipton', path: '/services/restaurant-websites-skipton.html', description: 'Restaurant websites for Skipton and Craven venues, including menus, bookings, events, local SEO and Google Business Profile traffic.' },
    { name: 'Professional Services Websites', path: '/services/professional-services.html', description: 'Websites for consultants, accountants, clinics, advisors and local firms.' },
    { name: 'Accountant Websites Lancashire', path: '/services/accountant-websites-lancashire.html', description: 'Websites for Lancashire accountants, bookkeepers, payroll providers and tax advisors, with trust-led copy, local SEO foundations and simple enquiry forms.' },
    { name: 'E-commerce Websites', path: '/services/ecommerce-websites.html', description: 'Product-led websites and shopfront guidance for small online sellers.' },
    { name: 'Graphic Design', path: '/graphic-design.html', description: 'Graphic design for Lancashire businesses, including logos, flyers and launch graphics.' },
    { name: 'Printing', path: '/printing.html', description: 'Printing support for flyers, menus, business cards, posters and promotional print.' },
];

const trackedLocationPages = [
    {
        town: 'Colne', path: '/web-design-colne.html', nearby: ['Trawden', 'Foulridge', 'Barrowford'],
        marketHeading: 'Built nearby, for the way Colne customers search.',
        marketIntro: 'MadeReal is based in Colne, so this is our home market rather than a town name added to a national template. We can shape a site around the jobs, bookings or enquiries a local business actually wants, then connect those pages to a clear Google Business Profile.',
        priorities: [
            ['Show the real business', 'Use your own work, service area and proof so people comparing Colne businesses can make a confident choice.'],
            ['Cover nearby demand', 'Build useful service-area routes for Trawden, Foulridge and Barrowford when the business genuinely serves them.'],
            ['Make contact simple', 'Put calls, quote requests or bookings within easy reach on mobile, where most urgent local searches happen.'],
        ],
    },
    {
        town: 'Burnley', path: '/web-design-burnley.html', nearby: ['Padiham', 'Brierfield', 'Hapton'],
        marketHeading: 'A Burnley website should turn service searches into enquiries.',
        marketIntro: 'Burnley businesses often compete across the whole borough, not only the town centre. The useful approach is to organise the website around the services people search for, support them with real photos and reviews, and make the next step obvious before a visitor returns to Google.',
        priorities: [
            ['Lead with services', 'Give each important trade, treatment or professional service enough detail to answer the first buying questions.'],
            ['Prove coverage', 'Explain where you work across Burnley, Padiham, Brierfield and Hapton without publishing thin pages for every postcode.'],
            ['Earn the call', 'Pair clear pricing guidance or process information with genuine reviews, accreditations and recent work.'],
        ],
    },
    {
        town: 'Nelson', path: '/web-design-nelson.html', nearby: ['Brierfield', 'Barrowford', 'Pendle'],
        marketHeading: 'Help Nelson customers understand the offer quickly.',
        marketIntro: 'A local customer may be comparing businesses in Nelson, Brierfield and Barrowford on the same search. A strong site makes the difference clear: what you provide, who it is for, where you travel and how somebody can get a useful answer without filling in a long form.',
        priorities: [
            ['Clarify the offer', 'Separate core services so Google and prospective customers do not have to interpret one crowded page.'],
            ['Join up local signals', 'Keep the website, Google Business Profile, opening details and contact information consistent across the web.'],
            ['Answer real objections', 'Use concise FAQs for turnaround, coverage, availability and the details people normally ask before enquiring.'],
        ],
    },
    {
        town: 'Pendle', path: '/web-design-pendle.html', nearby: ['Barrowford', 'Earby', 'Trawden', 'Foulridge'],
        marketHeading: 'One clear website for a business serving across Pendle.',
        marketIntro: 'Pendle searches are spread across connected towns and villages. Instead of repeating the same paragraph for every place, we create a useful central service structure and add location detail only where the customer experience, examples or coverage genuinely differ.',
        priorities: [
            ['Organise the service area', 'Explain coverage across Barrowford, Earby, Trawden and Foulridge in a way that is useful rather than repetitive.'],
            ['Keep one strong message', 'Make the main offer consistent while giving each important service its own evidence and call to action.'],
            ['Build local authority', 'Publish helpful answers and completed-work stories that demonstrate knowledge of the work, not just the place names.'],
        ],
    },
    {
        town: 'Skipton', path: '/web-design-skipton.html', nearby: ['Craven', 'Embsay', 'Carleton'],
        marketHeading: 'Make it easy for residents and visitors to choose you.',
        marketIntro: 'Skipton businesses can serve a mixture of local residents, surrounding villages and visitors. The website needs to match that reality, whether the conversion is a table booking, an accommodation enquiry, a professional appointment or a quote for work across Craven.',
        priorities: [
            ['Design around the booking', 'Menus, availability, opening details and booking routes should be effortless to use from a phone.'],
            ['Reach beyond the town', 'Describe genuine coverage of Embsay, Carleton and wider Craven without turning every village into copied content.'],
            ['Stay current', 'Make seasonal details, services and key customer information easy to update as the business changes.'],
        ],
    },
    {
        town: 'Barnoldswick', path: '/web-design-barnoldswick.html', nearby: ['West Craven', 'Earby', 'Salterforth'],
        marketHeading: 'Give West Craven customers a reason to choose local.',
        marketIntro: 'A Barnoldswick business website should do more than mention BB18. It should show the work, explain the service area and remove uncertainty for customers comparing options in Barnoldswick, Earby, Salterforth and further across West Craven.',
        priorities: [
            ['Use specific proof', 'Feature genuine projects, products or customer feedback instead of broad claims that could belong to any company.'],
            ['Explain travel and access', 'Set clear expectations about call-out areas, collection, delivery, appointments or visiting the premises.'],
            ['Support repeat enquiries', 'Keep contact details, hours and the most requested services prominent for returning local customers.'],
        ],
    },
    {
        town: 'Blackburn', path: '/web-design-blackburn.html', nearby: ['Darwen', 'Rishton', 'Accrington'],
        marketHeading: 'Compete on relevance, not empty marketing language.',
        marketIntro: 'Blackburn has a wider and more competitive search market than a small town. The site therefore needs focused service pages, credible proof and a clear geographic offer so customers can quickly see whether the business is right for their job, appointment or organisation.',
        priorities: [
            ['Target valuable work', 'Structure pages around the enquiries the business most wants rather than trying to rank one homepage for everything.'],
            ['Demonstrate credibility', 'Use case studies, qualifications, team information and specific outcomes wherever they are available.'],
            ['Connect the wider area', 'Explain genuine coverage of Darwen, Rishton and Accrington while keeping Blackburn as the primary page focus.'],
        ],
    },
    {
        town: 'Clitheroe', path: '/web-design-clitheroe.html', nearby: ['Ribble Valley', 'Whalley', 'Chatburn'],
        marketHeading: 'A considered website for Ribble Valley customers.',
        marketIntro: 'Clitheroe and Ribble Valley businesses often depend on trust, presentation and reputation. The website should feel polished without hiding the practical details: what is offered, where it is available, what makes the business credible and how somebody can enquire.',
        priorities: [
            ['Balance image and detail', 'Use strong photography alongside useful service, booking or product information rather than relying on atmosphere alone.'],
            ['Build around reputation', 'Bring genuine reviews, experience and recognisable work into the buying journey at the point they matter.'],
            ['Serve the valley clearly', 'Describe relevant coverage of Whalley, Chatburn and the wider Ribble Valley without duplicate doorway pages.'],
        ],
    },
];

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

function stripHtml(value = '') {
    return String(value)
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
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
    return markdown.replace(/^\s*#\s+.+(?:\r?\n)+/, '');
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

        if (['dist', '.git', 'node_modules', 'content', 'local-preview'].includes(entry.name) || entry.name.startsWith('dist.')) {
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

function getPageTitle(content) {
    const match = content.match(/<title>([\s\S]*?)<\/title>/i);
    return match ? stripHtml(match[1]) : 'MadeReal';
}

function getMetaDescription(content) {
    const match = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    return match ? match[1].trim() : '';
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

function removeRuntimeTailwind(content) {
    return content
        .replace(/\s*<script\s+src=["']https:\/\/cdn\.tailwindcss\.com["']><\/script>\s*/gi, '\n')
        .replace(/\s*<script>\s*tailwind\.config\s*=\s*[\s\S]*?<\/script>\s*/gi, '\n')
        .replace(/\s*<link\s+href=["']https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^"']*["']\s+rel=["']stylesheet["']>\s*/gi, '\n');
}

function injectSiteIcons(content) {
    if (/<link\s+rel=["']icon["']/i.test(content)) {
        return content;
    }

    const icons = `    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">\n    <link rel="apple-touch-icon" href="/assets/logo.svg">\n`;
    return content.replace('</head>', `${icons}</head>`);
}

function injectSocialMetadata(content, file) {
    if (hasNoindex(content) || /<meta\s+property=["']og:title["']/i.test(content)) {
        return content;
    }

    const title = getPageTitle(content);
    const description = getMetaDescription(content);
    const canonical = getCanonicalUrl(file);
    const metadata = `
    <meta property="og:type" content="website">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${siteUrl}/assets/social/madereal-og.png">
    <meta property="og:site_name" content="MadeReal">
    <meta property="og:locale" content="en_GB">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${siteUrl}/assets/social/madereal-og.png">
    <meta name="theme-color" content="#14b8a6">
`;

    return content.replace('</head>', `${metadata}</head>`);
}

function getBusinessEntityGraph() {
    const coreOffer = {
        '@type': 'Offer',
        '@id': `${siteUrl}/get-started.html#free-preview-offer`,
        url: `${siteUrl}/get-started.html`,
        name: 'Free website preview and managed local business website',
        price: '35.00',
        priceCurrency: 'GBP',
        priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '35.00',
            priceCurrency: 'GBP',
            unitText: 'MONTH',
        },
        availability: 'https://schema.org/InStock',
        itemOffered: {
            '@type': 'Service',
            name: 'Managed local business website',
            serviceType: 'Web design',
            description: 'A proper local business website with hosting, SSL, service pages, enquiry forms, Google Business-friendly structure, support and local SEO foundations.',
            areaServed: businessDetails.areaServed,
            provider: {
                '@id': `${siteUrl}/#business`,
            },
        },
    };

    return [
        {
            '@type': ['LocalBusiness', 'ProfessionalService'],
            '@id': `${siteUrl}/#business`,
            name: businessDetails.name,
            url: businessDetails.url,
            logo: businessDetails.logo,
            image: businessDetails.image,
            description: 'MadeReal Design Ltd builds mobile-first local business websites with a free preview first, then managed website plans from 35 GBP/month.',
            telephone: businessDetails.telephone,
            email: businessDetails.email,
            address: businessDetails.address,
            areaServed: businessDetails.areaServed.map(area => ({
                '@type': 'Place',
                name: area,
            })),
            priceRange: businessDetails.priceRange,
            knowsAbout: [
                'web design',
                'local SEO',
                'small business websites',
                'tradesman websites',
                'Google Business Profile setup',
                'website lead generation',
            ],
            makesOffer: coreOffer,
        },
        {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            url: `${siteUrl}/`,
            name: 'MadeReal',
            publisher: {
                '@id': `${siteUrl}/#business`,
            },
            inLanguage: 'en-GB',
            potentialAction: {
                '@type': 'SearchAction',
                target: `${siteUrl}/blog.html?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
            },
        },
        {
            '@type': 'OfferCatalog',
            '@id': `${siteUrl}/#service-catalog`,
            name: 'MadeReal web design and local business services',
            itemListElement: trackedServicePages.map(service => ({
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: service.name,
                    description: service.description,
                    url: `${siteUrl}${service.path}`,
                    provider: {
                        '@id': `${siteUrl}/#business`,
                    },
                    areaServed: businessDetails.areaServed,
                },
            })),
        },
    ];
}

function injectBusinessEntitySchema(content) {
    const hasBusinessEntity = content.includes(`"@id": "${siteUrl}/#business"`)
        && /"@type"\s*:\s*(?:"ProfessionalService"|"LocalBusiness"|\[[\s\S]*?"ProfessionalService"[\s\S]*?\])/i.test(content);

    if (hasNoindex(content) || hasBusinessEntity) {
        return content;
    }

    const schema = `    <script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': getBusinessEntityGraph() }, null, 2)}\n    </script>\n`;
    return content.replace('</head>', `${schema}</head>`);
}

function getLocationPageSchema(file) {
    const pagePath = getUrlPath(file);
    const location = trackedLocationPages.find(item => item.path === pagePath);
    if (!location) return null;

    return {
        '@type': 'Service',
        '@id': `${siteUrl}${location.path}#service`,
        name: `Web design in ${location.town}`,
        serviceType: 'Web design',
        description: `Managed local business website design for ${location.town} businesses, including a free preview, hosting, support, local SEO structure and contact forms.`,
        url: `${siteUrl}${location.path}`,
        provider: {
            '@id': `${siteUrl}/#business`,
        },
        areaServed: [
            location.town,
            ...location.nearby,
        ].map(area => ({
            '@type': 'Place',
            name: area,
        })),
        offers: {
            '@id': `${siteUrl}/get-started.html#free-preview-offer`,
        },
    };
}

function getServicePageSchema(file, content) {
    const pagePath = getUrlPath(file);
    const service = trackedServicePages.find(item => item.path === pagePath);
    if (!service) return null;

    return {
        '@type': 'Service',
        '@id': `${siteUrl}${service.path}#service`,
        name: service.name,
        serviceType: stripHtml(getPageTitle(content).replace(/\s*\|\s*MadeReal.*$/i, '')),
        description: service.description,
        url: `${siteUrl}${service.path}`,
        provider: {
            '@id': `${siteUrl}/#business`,
        },
        areaServed: businessDetails.areaServed.map(area => ({
            '@type': 'Place',
            name: area,
        })),
        offers: {
            '@id': `${siteUrl}/get-started.html#free-preview-offer`,
        },
    };
}

function injectPageServiceSchema(content, file) {
    if (hasNoindex(content) || content.includes(`${getCanonicalUrl(file)}#service`)) {
        return content;
    }

    const serviceSchema = getLocationPageSchema(file) || getServicePageSchema(file, content);
    if (!serviceSchema) return content;

    const schema = `    <script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', ...serviceSchema }, null, 2)}\n    </script>\n`;
    return content.replace('</head>', `${schema}</head>`);
}

function getBreadcrumbItems(file, content) {
    const urlPath = getUrlPath(file);
    const title = getPageTitle(content).replace(/\s*\|\s*MadeReal.*$/i, '').trim() || 'MadeReal';
    const items = [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${siteUrl}/`,
        },
    ];

    if (urlPath === '/') return items;

    if (urlPath.startsWith('/services/')) {
        items.push({
            '@type': 'ListItem',
            position: items.length + 1,
            name: 'Services',
            item: `${siteUrl}/services/small-business-websites.html`,
        });
    }

    if (urlPath.startsWith('/blog/')) {
        items.push({
            '@type': 'ListItem',
            position: items.length + 1,
            name: 'Blog',
            item: `${siteUrl}/blog.html`,
        });
    }

    items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: title,
        item: getCanonicalUrl(file),
    });

    return items;
}

function injectStructuredData(content, file) {
    if (hasNoindex(content) || content.includes(`${getCanonicalUrl(file)}#webpage`)) {
        return content;
    }

    const title = getPageTitle(content);
    const description = getMetaDescription(content);
    const canonical = getCanonicalUrl(file);
    const graph = [
        {
            '@type': 'WebPage',
            '@id': `${canonical}#webpage`,
            url: canonical,
            name: title,
            description,
            isPartOf: {
                '@id': `${siteUrl}/#website`,
            },
            about: {
                '@id': `${siteUrl}/#business`,
            },
            inLanguage: 'en-GB',
        },
        {
            '@type': 'BreadcrumbList',
            '@id': `${canonical}#breadcrumb`,
            itemListElement: getBreadcrumbItems(file, content),
        },
    ];

    const schema = `    <script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)}\n    </script>\n`;
    return content.replace('</head>', `${schema}</head>`);
}

function injectFaqSchema(content) {
    if (/["']@type["']\s*:\s*["']FAQPage["']/i.test(content)) {
        return content;
    }

    const questions = [...content.matchAll(/<details[\s\S]*?>[\s\S]*?<summary[\s\S]*?>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi)]
        .map(match => ({
            '@type': 'Question',
            name: stripHtml(match[1]),
            acceptedAnswer: {
                '@type': 'Answer',
                text: stripHtml(match[2]),
            },
        }))
        .filter(item => item.name && item.acceptedAnswer.text)
        .slice(0, 8);

    if (!questions.length) return content;

    const schema = `    <script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: questions }, null, 2)}\n    </script>\n`;
    return content.replace('</head>', `${schema}</head>`);
}

const attributionFieldNames = [
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

function renderAttributionFields() {
    return attributionFieldNames
        .map(name => `                            <input type="hidden" name="${name}" value="">`)
        .join('\n');
}

function injectAttributionFields(content) {
    return content.replace(/(<form\b[^>]*\bdata-netlify=["']true["'][^>]*>)/gi, (openTag, _match, offset) => {
        const formEnd = content.indexOf('</form>', offset);
        const formContent = formEnd === -1 ? '' : content.slice(offset, formEnd);

        if (formContent.includes('name="Landing_Page"') || formContent.includes("name='Landing_Page'")) {
            return openTag;
        }

        return `${openTag}\n${renderAttributionFields()}`;
    });
}

function injectTrackingScript(content) {
    if (content.includes('maderealEventTracking')) return content;

    const script = `    <script>
      window.maderealEventTracking = true;

      function maderealReadStoredAttribution(key) {
        try {
          return window.sessionStorage.getItem('madereal_' + key) || '';
        } catch (error) {
          return '';
        }
      }

      function maderealStoreAttribution(key, value, overwrite) {
        if (!value) return;
        try {
          if (overwrite || !window.sessionStorage.getItem('madereal_' + key)) {
            window.sessionStorage.setItem('madereal_' + key, value);
          }
        } catch (error) {}
      }

      function maderealAttributionData() {
        var params = new URLSearchParams(window.location.search);
        var mapping = {
          UTM_Source: 'utm_source',
          UTM_Medium: 'utm_medium',
          UTM_Campaign: 'utm_campaign',
          UTM_Term: 'utm_term',
          UTM_Content: 'utm_content',
          GCLID: 'gclid',
          FBCLID: 'fbclid'
        };

        maderealStoreAttribution('landing_page', window.location.pathname + window.location.search, false);
        maderealStoreAttribution('referrer', document.referrer, false);

        Object.keys(mapping).forEach(function(fieldName) {
          var paramName = mapping[fieldName];
          maderealStoreAttribution(paramName, params.get(paramName) || '', true);
        });

        return {
          Landing_Page: maderealReadStoredAttribution('landing_page') || window.location.pathname,
          Referrer: maderealReadStoredAttribution('referrer') || document.referrer || '',
          UTM_Source: maderealReadStoredAttribution('utm_source') || params.get('utm_source') || '',
          UTM_Medium: maderealReadStoredAttribution('utm_medium') || params.get('utm_medium') || '',
          UTM_Campaign: maderealReadStoredAttribution('utm_campaign') || params.get('utm_campaign') || '',
          UTM_Term: maderealReadStoredAttribution('utm_term') || params.get('utm_term') || '',
          UTM_Content: maderealReadStoredAttribution('utm_content') || params.get('utm_content') || '',
          GCLID: maderealReadStoredAttribution('gclid') || params.get('gclid') || '',
          FBCLID: maderealReadStoredAttribution('fbclid') || params.get('fbclid') || ''
        };
      }

      function maderealPopulateAttributionFields(form) {
        if (!form) return;
        var data = maderealAttributionData();
        Object.keys(data).forEach(function(fieldName) {
          var field = form.querySelector('[name="' + fieldName + '"]');
          if (field) field.value = data[fieldName];
        });
      }

      function maderealPopulateAllAttributionFields() {
        document.querySelectorAll('form[data-netlify="true"]').forEach(maderealPopulateAttributionFields);
      }

      function maderealTrack(eventName, params) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', eventName, Object.assign({
          page_location: window.location.href,
          page_path: window.location.pathname
        }, params || {}));
      }

      document.addEventListener('click', function(event) {
        var tracked = event.target.closest('[data-track], a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"], a[href="/get-started.html"]');
        if (!tracked) return;

        var href = tracked.href || '';
        var eventName = tracked.getAttribute('data-track');
        if (!eventName && href.indexOf('tel:') === 0) eventName = 'phone_call_click';
        if (!eventName && href.indexOf('mailto:') === 0) eventName = 'email_click';
        if (!eventName && href.indexOf('wa.me') !== -1) eventName = 'whatsapp_click';
        if (!eventName && tracked.getAttribute('href') === '/get-started.html') eventName = 'preview_cta_click';
        eventName = eventName || 'tracked_click';

        maderealTrack(eventName, {
          link_url: tracked.href || '',
          link_text: (tracked.textContent || '').trim().slice(0, 80)
        });
      });

      document.addEventListener('submit', function(event) {
        var form = event.target;
        if (!form || form.tagName !== 'FORM') return;
        maderealPopulateAttributionFields(form);

        var formName = form.getAttribute('name') || form.id || 'website_form';
        var utmSourceField = form.querySelector('[name="UTM_Source"]');
        var utmMediumField = form.querySelector('[name="UTM_Medium"]');
        var utmCampaignField = form.querySelector('[name="UTM_Campaign"]');
        maderealTrack('generate_lead', {
          form_name: formName,
          lead_source_page: window.location.pathname,
          utm_source: utmSourceField ? utmSourceField.value : '',
          utm_medium: utmMediumField ? utmMediumField.value : '',
          utm_campaign: utmCampaignField ? utmCampaignField.value : ''
        });
        maderealTrack('form_submit_' + formName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''), {
          form_name: formName
        });
      }, true);

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', maderealPopulateAllAttributionFields);
      } else {
        maderealPopulateAllAttributionFields();
      }
    </script>
`;

    return content.replace('</body>', `${script}</body>`);
}

function getTrackedLocationByFile(file) {
    const urlPath = getUrlPath(file);
    return trackedLocationPages.find(location => location.path === urlPath);
}

function renderLocationMarketSection(location) {
    const priorities = location.priorities.map(([heading, copy]) => `
                    <article class="border-t-2 border-slate-900 pt-6">
                        <h3 class="text-xl font-black text-slate-950 mb-3">${escapeHtml(heading)}</h3>
                        <p class="text-gray-600 font-medium leading-relaxed">${escapeHtml(copy)}</p>
                    </article>`).join('');

    return `
        <section class="py-20 md:py-28 px-6 bg-white border-b-4 border-slate-900" aria-labelledby="local-market-${slugify(location.town)}">
            <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20">
                <div class="lg:col-span-5">
                    <p class="text-xs font-black uppercase tracking-widest text-brand-teal mb-5">Web design for ${escapeHtml(location.town)}</p>
                    <h2 id="local-market-${slugify(location.town)}" class="text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-950 mb-6">${escapeHtml(location.marketHeading)}</h2>
                    <p class="text-lg text-gray-600 font-medium leading-relaxed">${escapeHtml(location.marketIntro)}</p>
                </div>
                <div class="lg:col-span-7 grid sm:grid-cols-3 gap-8">
                    ${priorities}
                </div>
            </div>
        </section>
`;
}

function injectLocationMarketSection(content, file) {
    const location = getTrackedLocationByFile(file);
    if (!location || content.includes(`id="local-market-${slugify(location.town)}"`)) return content;

    return content.replace(
        '<section id="problem"',
        `${renderLocationMarketSection(location)}\n        <section id="problem"`,
    );
}

function renderLocationQuickLead(location) {
    const town = escapeHtml(location.town);
    const nearby = location.nearby.slice(0, 2).join(' and ');

    return `<div class="lg:col-span-5">
                        <form id="quick-lead-form" name="${town} Quick Lead" method="POST" data-netlify="true" class="w-full">
                            <input type="hidden" name="form-name" value="${town} Quick Lead">
                            <input type="hidden" name="Source_Page" value="${town} Location Page">
                            <input type="hidden" name="Plan" value="Website Care 35 GBP per month">
                            <div class="rounded-2xl bg-white border-2 border-slate-900 p-2 shadow-hard">
                                <label class="sr-only" for="quick-lead-contact">Mobile number or email address</label>
                                <div class="flex flex-col gap-2">
                                    <input id="quick-lead-contact" name="Contact_Detail" type="text" required inputmode="text" autocomplete="email" class="min-h-[52px] w-full rounded-xl bg-brand-gray px-5 text-base font-bold text-slate-950 placeholder:text-gray-500 focus:outline-none border-2 border-transparent focus:border-brand-teal transition-all" placeholder="Mobile or email">
                                    <button id="quick-lead-submit" type="submit" data-track="location_quick_lead_submit" class="min-h-[52px] rounded-xl bg-brand-teal px-6 text-slate-900 font-black uppercase tracking-wide hover:bg-slate-900 hover:text-white border-2 border-slate-900 transition-all active:scale-[0.98]">
                                        Get free preview
                                    </button>
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 font-bold mt-3 uppercase tracking-wider text-center lg:text-left">
                                No live call needed. We can text or email your ${town} preview.
                            </p>
                        </form>
                        <div class="mt-4 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                            <a href="/case-studies.html" class="bg-white text-slate-900 px-6 py-4 rounded-xl font-bold text-base hover:bg-gray-50 transition-colors text-center uppercase tracking-wide border-2 border-slate-900 flex items-center justify-center">
                                Our Work
                            </a>
                            <a href="/get-started.html" data-track="location_manual_preview_cta" class="bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-base hover:bg-white hover:text-slate-900 transition-colors text-center uppercase tracking-wide border-2 border-slate-900 flex items-center justify-center">
                                Full Brief
                            </a>
                        </div>
                    </div>`;
}

function injectLocationLeadCapture(content, file) {
    const location = getTrackedLocationByFile(file);

    if (!location || content.includes('id="quick-lead-form"')) {
        return content;
    }

    const ctaBlockPattern = /<div class="lg:col-span-5 flex flex-col sm:flex-row gap-4 justify-center">[\s\S]*?<a href="\/#work"[\s\S]*?<\/a>\s*<\/div>/;
    if (!ctaBlockPattern.test(content)) {
        return content;
    }

    const script = `        <script>
        // Location lead form handler
        const quickLeadForm = document.getElementById('quick-lead-form');
        if (quickLeadForm) {
            quickLeadForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const input = document.getElementById('quick-lead-contact');
                const submit = document.getElementById('quick-lead-submit');
                const lead = input.value.trim();

                if (!lead) return;

                submit.disabled = true;
                submit.textContent = 'Sending...';

                const formData = new FormData(quickLeadForm);
                fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                })
                .then(() => {
                    window.location.href = '/get-started.html#lead=' + encodeURIComponent(lead);
                })
                .catch(() => {
                    window.location.href = '/get-started.html#lead=' + encodeURIComponent(lead);
                });
            });
        }
    </script>
`;

    content = content.replace(ctaBlockPattern, renderLocationQuickLead(location));
    return content.replace('</body>', `${script}</body>`);
}

function getTrackedServiceByFile(file) {
    const urlPath = getUrlPath(file);
    return trackedServicePages.find(service => service.path === urlPath);
}

function getLeadPlanForService(service) {
    if (service.path === '/google-business-profile-management.html') return 'Local Presence 55 GBP per month';
    if (service.path === '/local-seo-packages.html') return 'Local SEO Growth 199 GBP per month';
    if (['/graphic-design.html', '/printing.html'].includes(service.path)) return 'General enquiry';

    return 'Website Care 35 GBP per month';
}

function renderServiceQuickLead(service) {
    const serviceName = escapeHtml(service.name);
    const plan = escapeHtml(getLeadPlanForService(service));
    const formName = `${serviceName} Quick Lead`;

    return `
<section class="px-6 py-8 bg-white border-b-4 border-slate-900">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-[1fr_auto] gap-5 items-center">
        <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-brand-teal mb-2">Free preview first</p>
            <h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-950">Want to see what this could look like for your business?</h2>
            <p class="text-sm md:text-base text-gray-600 font-bold mt-2 max-w-2xl">Drop a mobile or email. We can text or email a preview link, so missed calls do not lose the enquiry.</p>
        </div>
        <form id="quick-lead-form" name="${formName}" method="POST" data-netlify="true" class="w-full lg:w-[420px]">
            <input type="hidden" name="form-name" value="${formName}">
            <input type="hidden" name="Source_Page" value="${serviceName} Service Page">
            <input type="hidden" name="Plan" value="${plan}">
            <div class="rounded-2xl bg-brand-gray border-2 border-slate-900 p-2 shadow-hard">
                <label class="sr-only" for="quick-lead-contact">Mobile number or email address</label>
                <div class="flex flex-col sm:flex-row lg:flex-col gap-2">
                    <input id="quick-lead-contact" name="Contact_Detail" type="text" required inputmode="text" autocomplete="email" class="min-h-[52px] flex-1 rounded-xl bg-white px-5 text-base font-bold text-slate-950 placeholder:text-gray-500 focus:outline-none border-2 border-transparent focus:border-brand-teal transition-all" placeholder="Mobile or email">
                    <button id="quick-lead-submit" type="submit" data-track="service_quick_lead_submit" class="min-h-[52px] rounded-xl bg-brand-teal px-6 text-slate-900 font-black uppercase tracking-wide hover:bg-slate-900 hover:text-white border-2 border-slate-900 transition-all active:scale-[0.98]">
                        Get free preview
                    </button>
                </div>
            </div>
        </form>
    </div>
</section>
`;
}

function renderServiceHeroQuickLead(service) {
    const serviceName = escapeHtml(service.name);
    const plan = escapeHtml(getLeadPlanForService(service));
    const formName = `${serviceName} Quick Lead`;

    return `<div class="mt-10 max-w-xl">
                <form id="quick-lead-form" name="${formName}" method="POST" data-netlify="true" class="w-full">
                    <input type="hidden" name="form-name" value="${formName}">
                    <input type="hidden" name="Source_Page" value="${serviceName} Service Page">
                    <input type="hidden" name="Plan" value="${plan}">
                    <div class="rounded-2xl bg-white border-2 border-slate-900 p-2 shadow-hard">
                        <label class="sr-only" for="quick-lead-contact">Mobile number or email address</label>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <input id="quick-lead-contact" name="Contact_Detail" type="text" required inputmode="text" autocomplete="email" class="min-h-[52px] flex-1 rounded-xl bg-brand-gray px-5 text-base font-bold text-slate-950 placeholder:text-gray-500 focus:outline-none border-2 border-transparent focus:border-brand-teal transition-all" placeholder="Mobile or email">
                            <button id="quick-lead-submit" type="submit" data-track="service_quick_lead_submit" class="min-h-[52px] rounded-xl bg-brand-teal px-6 text-slate-900 font-black uppercase tracking-wide hover:bg-slate-900 hover:text-white border-2 border-slate-900 transition-all active:scale-[0.98]">
                                Get free preview
                            </button>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 font-bold mt-3 uppercase tracking-wider">
                        No live call needed. We can text or email your preview.
                    </p>
                </form>
                <div class="mt-4 flex flex-col sm:flex-row gap-3">
                    <a href="/case-studies.html" class="bg-white text-slate-900 px-6 py-4 rounded-xl font-bold text-base hover:bg-gray-50 transition-colors text-center uppercase tracking-wide border-2 border-slate-900 flex items-center justify-center">
                        Our Work
                    </a>
                    <a href="/get-started.html" data-track="service_manual_preview_cta" class="bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-base hover:bg-white hover:text-slate-900 transition-colors text-center uppercase tracking-wide border-2 border-slate-900 flex items-center justify-center">
                        Full Brief
                    </a>
                </div>
            </div>`;
}

function injectServiceLeadCapture(content, file) {
    const service = getTrackedServiceByFile(file);

    if (!service || content.includes('id="quick-lead-form"')) {
        return content;
    }

    const script = `        <script>
        // Service lead form handler
        const quickLeadForm = document.getElementById('quick-lead-form');
        if (quickLeadForm) {
            quickLeadForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const input = document.getElementById('quick-lead-contact');
                const submit = document.getElementById('quick-lead-submit');
                const lead = input.value.trim();

                if (!lead) return;

                submit.disabled = true;
                submit.textContent = 'Sending...';

                const formData = new FormData(quickLeadForm);
                fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                })
                .then(() => {
                    window.location.href = '/get-started.html#lead=' + encodeURIComponent(lead);
                })
                .catch(() => {
                    window.location.href = '/get-started.html#lead=' + encodeURIComponent(lead);
                });
            });
        }
    </script>
`;

    const ctaBlockPattern = /<div class="flex flex-col sm:flex-row gap-4 mt-10">[\s\S]*?<\/div>/;
    if (ctaBlockPattern.test(content)) {
        content = content.replace(ctaBlockPattern, renderServiceHeroQuickLead(service));
    } else {
        const firstSectionEnd = content.indexOf('</section>');
        if (firstSectionEnd === -1) {
            return content;
        }
        content = `${content.slice(0, firstSectionEnd + '</section>'.length)}${renderServiceQuickLead(service)}${content.slice(firstSectionEnd + '</section>'.length)}`;
    }

    return content.replace('</body>', `${script}</body>`);
}

function injectHomeAlignmentStyles(content, file) {
    if (file === 'index.html') return content;

    const styleLinks = [
        '    <link rel="stylesheet" href="/assets/css/home.css">',
        '    <link rel="stylesheet" href="/assets/css/home-alignment.css">'
    ].join('\n');

    if (!content.includes('/assets/css/home-alignment.css')) {
        content = content.replace('</head>', `${styleLinks}\n</head>`);
    }

    if (/<body[^>]*class="/i.test(content)) {
        content = content.replace(/<body([^>]*?)class="([^"]*)"/i, (match, prefix, classes) => {
            if (classes.includes('home-aligned')) return match;
            return `<body${prefix}class="${classes} home-aligned"`;
        });
    } else {
        content = content.replace(/<body([^>]*)>/i, '<body$1 class="home-aligned">');
    }

    return content;
}

const fileDateCache = new Map();

function getSourceDate(relativeFile) {
    if (fileDateCache.has(relativeFile)) return fileDateCache.get(relativeFile);

    let date = '';
    try {
        const dirty = execFileSync('git', ['status', '--porcelain', '--', relativeFile], {
            cwd: srcDir,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();

        if (dirty) {
            date = new Date().toISOString().slice(0, 10);
        } else {
            date = execFileSync('git', ['log', '-1', '--format=%cs', '--', relativeFile], {
                cwd: srcDir,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore'],
            }).trim();
        }
    } catch (error) {
        // Netlify normally builds from Git. Filesystem time is a fallback for
        // local archives or environments without repository history.
    }

    if (!date) {
        const absolute = path.join(srcDir, relativeFile);
        if (fs.existsSync(absolute)) {
            date = fs.statSync(absolute).mtime.toISOString().slice(0, 10);
        }
    }

    fileDateCache.set(relativeFile, date);
    return date;
}

function latestDate(dates) {
    return dates.filter(Boolean).sort().at(-1) || new Date().toISOString().slice(0, 10);
}

function getPageLastModified(file, postMap) {
    const normalised = file.split(path.sep).join('/');
    const sharedSources = ['header_template.html', 'footer_template.html'];
    const post = postMap.get(normalised);

    if (post) {
        return latestDate([
            post.dateIso,
            getSourceDate(`content/posts/${post.sourceFile}`),
            getSourceDate('blog_post_template.html'),
            ...sharedSources.map(getSourceDate),
        ]);
    }

    const sources = [normalised, ...sharedSources];
    if (/^web-design-[a-z-]+\.html$/.test(normalised)) sources.push('build.js');
    return latestDate(sources.map(getSourceDate));
}

function buildSitemap(posts) {
    const postMap = new Map(posts.map(post => [`blog/${post.slug}.html`, post]));
    const urls = findBuiltHtmlFiles(distDir)
        .filter(file => {
            const content = fs.readFileSync(path.join(distDir, file), 'utf8');
            return !hasNoindex(content);
        })
        .sort()
        .map(file => {
            const loc = getCanonicalUrl(file);
            const lastmod = getPageLastModified(file, postMap);
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

function buildRedirects() {
    const source = path.join(srcDir, '_redirects');
    const baseRedirects = fs.existsSync(source) ? fs.readFileSync(source, 'utf8').trim() : '';
    const canonicalRedirects = findBuiltHtmlFiles(distDir)
        .filter(file => {
            if (file === 'index.html') return false;

            const content = fs.readFileSync(path.join(distDir, file), 'utf8');
            return !hasNoindex(content);
        })
        .sort()
        .map(file => {
            const urlPath = getUrlPath(file);
            return `${urlPath.replace(/\.html$/, '')} ${urlPath} 301!`;
        });

    const redirects = [
        baseRedirects,
        '',
        '# Generated canonical redirects for Netlify pretty URLs.',
        ...canonicalRedirects,
        '',
    ].filter(Boolean).join('\n');

    fs.writeFileSync(path.join(distDir, '_redirects'), redirects);
    console.log('Successfully built: _redirects');
}

function buildHeaders() {
    fs.writeFileSync(path.join(distDir, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/sitemap.xml
  Cache-Control: public, max-age=3600

/robots.txt
  Cache-Control: public, max-age=3600

/llms.txt
  Cache-Control: public, max-age=3600
`);
    console.log('Successfully built: _headers');
}

function buildLlmsTxt(posts) {
    const latestPosts = posts.slice(0, 12).map(post => `- [${post.title}](${siteUrl}/blog/${post.slug}.html): ${post.excerpt}`).join('\n');
    const services = trackedServicePages.map(service => `- [${service.name}](${siteUrl}${service.path}): ${service.description}`).join('\n');
    const locations = trackedLocationPages.map(location => `- [Web design ${location.town}](${siteUrl}${location.path}): Local web design for ${location.town} and nearby areas including ${location.nearby.join(', ')}.`).join('\n');
    const llms = `# MadeReal

MadeReal Design Ltd is a Colne, Lancashire web design business. MadeReal builds and manages simple, mobile-first websites for UK local businesses. The primary offer is a free website build with Website Care at 35 GBP per month once live.

## Core Offer

- Free website build for local businesses
- 35 GBP/month Website Care: hosting, SSL, management and light support
- 55 GBP/month Local Presence: Website Care plus Google Business Profile support and review reply help
- 199 GBP/month Local SEO Growth: 4 useful content pieces per month, Google Business activity, Search Console checks, on-page improvements and reporting
- Service pages for what the business sells
- Local area pages for towns and service coverage
- Contact form, quote form or booking route
- Google Business Profile setup support
- Local SEO foundations
- Optional secondary buy-out route may be available for businesses that want to own and move the finished site later

## Key Pages

- [Home](${siteUrl}/)
- [Pay monthly websites](${siteUrl}/pay-monthly-websites.html)
- [Free website build](${siteUrl}/free-website-build.html)
- [Google Business Profile management](${siteUrl}/google-business-profile-management.html)
- [Local SEO packages](${siteUrl}/local-seo-packages.html)
- [Get a free preview](${siteUrl}/get-started.html)
- [Website examples and case studies](${siteUrl}/case-studies.html)
- [Contact](${siteUrl}/contact.html)

## Service Pages

${services}

## Local Web Design Pages

${locations}

## Recent Guides

${latestPosts}
`;

    fs.writeFileSync(path.join(distDir, 'llms.txt'), llms);
    console.log('Successfully built: llms.txt');
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

        const file = `blog/${post.slug}.html`;
        let alignedRendered = injectHomeAlignmentStyles(rendered, file);
        alignedRendered = removeRuntimeTailwind(alignedRendered);
        alignedRendered = injectSiteIcons(alignedRendered);
        alignedRendered = injectSocialMetadata(alignedRendered, file);
        alignedRendered = injectBusinessEntitySchema(alignedRendered);
        alignedRendered = injectStructuredData(alignedRendered, file);
        alignedRendered = injectAttributionFields(alignedRendered);
        alignedRendered = injectTrackingScript(alignedRendered);

        fs.writeFileSync(path.join(blogOutputDir, `${post.slug}.html`), alignedRendered);
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
        content = injectLocationLeadCapture(content, file);
        content = injectLocationMarketSection(content, file);
        content = injectServiceLeadCapture(content, file);
        content = injectCanonical(content, file);
        content = injectHomeAlignmentStyles(content, file);
        content = removeRuntimeTailwind(content);
        content = injectSiteIcons(content);
        content = injectSocialMetadata(content, file);
        content = injectBusinessEntitySchema(content);
        content = injectPageServiceSchema(content, file);
        content = injectFaqSchema(content);
        content = injectStructuredData(content, file);
        content = injectAttributionFields(content);
        content = injectTrackingScript(content);

        ensureDir(path.dirname(path.join(distDir, file)));
        fs.writeFileSync(path.join(distDir, file), content);
        console.log(`Successfully built: ${file}`);
    });

    copyStaticAssets();
    buildSitemap(posts);
    buildRedirects();
    buildHeaders();
    buildLlmsTxt(posts);

    console.log(`✅ Website build complete! ${posts.length} blog post(s) generated. Ready for Netlify.`);
}

main().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
});
