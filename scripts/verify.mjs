import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('dist'),errors=[],titles=new Map(),descriptions=new Map();const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(d,x.name)):[path.join(d,x.name)]);const htmlFiles=walk(root).filter(f=>f.endsWith('.html')&&!f.endsWith('/admin.html')&&!f.endsWith('/404.html'));
const routes=new Set(htmlFiles.map(f=>'/'+path.relative(root,f).replace(/index\.html$/,'')));routes.add('/');
for(const f of htmlFiles){const html=fs.readFileSync(f,'utf8'),route='/'+path.relative(root,f).replace(/index\.html$/,'');const title=html.match(/<title>(.*?)<\/title>/)?.[1],description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];if(!title)errors.push(route+' missing title');if(!description)errors.push(route+' missing description');if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(route+' H1 count');if(titles.has(title))errors.push(route+' duplicate title '+titles.get(title));titles.set(title,route);if(descriptions.has(description))errors.push(route+' duplicate description '+descriptions.get(description));descriptions.set(description,route);if(!html.includes('lang="en-GB"'))errors.push(route+' missing language');if(!html.includes(`rel="canonical" href="https://madereal.uk${route}"`))errors.push(route+' wrong canonical');for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{const json=JSON.parse(m[1]);if(!json['@graph'])errors.push(route+' missing schema graph');}catch{errors.push(route+' invalid schema')}}for(const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)){const url=m[1];if(url.startsWith('//'))continue;const dest=path.join(root,url);if(!fs.existsSync(dest))errors.push(route+' broken local reference '+url);}if(/Chameleon|£24|£19\.99/.test(html))errors.push(route+' retired offer or excluded project');}
for(const [from,to]of Object.entries(JSON.parse(fs.readFileSync('content/redirects.json','utf8')))){if(!routes.has(to.split('#')[0]))errors.push('Redirect '+from+' has missing target '+to);}
// Release gate: canonical sitemap entries, crawler access and real lead capture must agree.
const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8'),headers=fs.readFileSync(path.join(root,'_headers'),'utf8');
const preview=/^Disallow:\s*\/\s*$/m.test(robots),production=process.argv.includes('--production');
const utility=new Set(['/404/','/checkout/','/payment-return/','/preview-received/']);
const xml=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
if(!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')||!xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'))errors.push('Invalid sitemap XML declaration or namespace');
const sitemapUrls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]),sitemapRoutes=new Set();
if(new Set(sitemapUrls).size!==sitemapUrls.length)errors.push('Duplicate sitemap URLs');
for(const url of sitemapUrls){
 try{const u=new URL(url);if(u.origin!=='https://madereal.uk'||u.search||u.hash||!u.pathname.endsWith('/'))errors.push('Noncanonical sitemap URL '+url);if(!routes.has(u.pathname)||utility.has(u.pathname))errors.push('Invalid sitemap target '+url);sitemapRoutes.add(u.pathname);}catch{errors.push('Invalid sitemap URL '+url);}
}
for(const f of htmlFiles){
 const route='/'+path.relative(root,f).replace(/index\.html$/,''),html=fs.readFileSync(f,'utf8'),noindex=/<meta name="robots" content="[^"]*noindex/i.test(html);
 if(noindex!==(preview||utility.has(route)))errors.push(route+' robots meta disagrees with build mode');
 if(!utility.has(route)&&!sitemapRoutes.has(route))errors.push(route+' missing from sitemap');
 for(const m of html.matchAll(/<source[^>]*(?:srcset|data-srcset)="(\/[^"]+)"/g))if(!fs.existsSync(path.join(root,m[1])))errors.push(route+' missing responsive image '+m[1]);
}
if(!preview&&!robots.includes('Sitemap: https://madereal.uk/sitemap.xml'))errors.push('Production robots missing sitemap declaration');
if(production){
 if(preview)errors.push('Production release blocked: robots disallows crawling');
 if(/\/\*\s*\n\s+X-Robots-Tag:\s*noindex/i.test(headers))errors.push('Production release blocked: global noindex header');
 const lead=fs.readFileSync(path.join(root,'free-preview/index.html'),'utf8');
 const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
 if(!home.includes('id="start-preview"')||!/<form[^>]*name="Quick Preview Lead"[^>]*data-lead-form/.test(home))errors.push('Homepage preview form is missing');
 for(const name of ['Business_Name','Contact_Detail','Phone_Number'])if(!home.includes(`name="${name}"`)||!lead.includes(`name="${name}"`))errors.push('Lead forms disagree on field '+name);
 if(!/<form[^>]*name="Quick Preview Lead"[^>]*method="POST"[^>]*data-netlify="true"[^>]*data-lead-form/.test(lead)||!lead.includes('name="form-name" value="Quick Preview Lead"')||!lead.includes('name="Contact_Detail"'))errors.push('Production lead form is missing or not registered');
 for(const f of htmlFiles)if(/PRIVATE DESIGN PREVIEW|This is a private copy|domalog\.chatgpt\.site|127\.0\.0\.1/.test(fs.readFileSync(f,'utf8')))errors.push(path.relative(root,f)+' leaks private-preview content');
}
console.log(`Checked ${htmlFiles.length} pages and ${sitemapUrls.length} sitemap URLs: ${errors.length} errors${production?' (production release gate)':''}.`);if(errors.length){console.error([...new Set(errors)].join('\n'));process.exitCode=1;}
