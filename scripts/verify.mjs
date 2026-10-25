import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('dist'),errors=[],titles=new Map(),descriptions=new Map();
const relative=f=>path.relative(root,f).split(path.sep).join('/');
const routeFor=f=>'/'+relative(f).replace(/index\.html$/,'');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(d,x.name)):[path.join(d,x.name)]);
const htmlFiles=walk(root).filter(f=>f.endsWith('.html')&&!['admin.html','404.html'].includes(relative(f)));
const routes=new Set(htmlFiles.map(routeFor));routes.add('/');
for(const f of htmlFiles){const html=fs.readFileSync(f,'utf8'),route=routeFor(f);const title=html.match(/<title>(.*?)<\/title>/)?.[1],description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];if(!title)errors.push(route+' missing title');if(!description)errors.push(route+' missing description');if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(route+' H1 count');if(titles.has(title))errors.push(route+' duplicate title '+titles.get(title));titles.set(title,route);if(descriptions.has(description))errors.push(route+' duplicate description '+descriptions.get(description));descriptions.set(description,route);if(!html.includes('lang="en-GB"'))errors.push(route+' missing language');if(!html.includes(`rel="canonical" href="https://madereal.uk${route}"`))errors.push(route+' wrong canonical');for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{const json=JSON.parse(m[1]);if(!json['@graph'])errors.push(route+' missing schema graph');}catch{errors.push(route+' invalid schema')}}for(const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)){const url=m[1];if(url.startsWith('//'))continue;const dest=path.join(root,url);if(!fs.existsSync(dest))errors.push(route+' broken local reference '+url);}if(/Chameleon|£24|£19\.99/.test(html))errors.push(route+' retired offer or excluded project');}
for(const [from,to]of Object.entries(JSON.parse(fs.readFileSync('content/redirects.json','utf8')))){if(!routes.has(to.split('#')[0]))errors.push('Redirect '+from+' has missing target '+to);}
// Release gate: canonical sitemap entries, crawler access and real lead capture must agree.
const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8'),headers=fs.readFileSync(path.join(root,'_headers'),'utf8');
const preview=/^Disallow:\s*\/\s*$/m.test(robots),production=process.argv.includes('--production');
const utility=new Set(['/404/','/checkout/','/payment-return/','/preview-received/','/menus/request-received/']),hidden=new Set(['/197/']);
const xml=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
if(!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')||!xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'))errors.push('Invalid sitemap XML declaration or namespace');
const sitemapUrls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]),sitemapRoutes=new Set();
if(new Set(sitemapUrls).size!==sitemapUrls.length)errors.push('Duplicate sitemap URLs');
for(const url of sitemapUrls){
 try{const u=new URL(url);if(u.origin!=='https://madereal.uk'||u.search||u.hash||!u.pathname.endsWith('/'))errors.push('Noncanonical sitemap URL '+url);if(!routes.has(u.pathname)||utility.has(u.pathname))errors.push('Invalid sitemap target '+url);sitemapRoutes.add(u.pathname);}catch{errors.push('Invalid sitemap URL '+url);}
}
for(const f of htmlFiles){
 const route=routeFor(f),html=fs.readFileSync(f,'utf8'),noindex=/<meta name="robots" content="[^"]*noindex/i.test(html);
 if(noindex!==(preview||utility.has(route)||hidden.has(route)))errors.push(route+' robots meta disagrees with build mode');
 if(!utility.has(route)&&!hidden.has(route)&&!sitemapRoutes.has(route))errors.push(route+' missing from sitemap');
 if(hidden.has(route)&&sitemapRoutes.has(route))errors.push(route+' hidden route appears in sitemap');
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
 for(const f of htmlFiles)if(/PRIVATE DESIGN PREVIEW|This is a private copy|domalog\.chatgpt\.site|127\.0\.0\.1/.test(fs.readFileSync(f,'utf8')))errors.push(relative(f)+' leaks private-preview content');
 const menuFile=path.join(root,'menus/index.html');
 if(!fs.existsSync(menuFile))errors.push('Production online-menu page is missing at /menus/');
 else{
  const menu=fs.readFileSync(menuFile,'utf8'),menuUrl='https://madereal.uk/menus/';
  if(!menu.includes(`rel="canonical" href="${menuUrl}"`)||!/<meta name="robots" content="index,\s*follow(?:,|")/i.test(menu))errors.push('/menus/ must be indexable and canonical on madereal.uk');
  const menuHeading=menu.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  if(!menuHeading||!/(?:online|digital|QR|website).{0,60}menu|menu.{0,60}(?:online|digital|QR|website)/i.test(menuHeading))errors.push('/menus/ needs a clear online-menu H1');
  if(!sitemapRoutes.has('/menus/'))errors.push('/menus/ missing from the production sitemap');
  const menuGraph=[...menu.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{try{return JSON.parse(m[1])['@graph']||[];}catch{return [];}});
  if(!menuGraph.some(x=>x['@type']==='Service'&&x.provider?.['@id']==='https://madereal.uk/#organization'))errors.push('/menus/ missing a MadeReal Service schema');
  if(!menuGraph.some(x=>x['@type']==='BreadcrumbList'&&x.itemListElement?.some(item=>item.item===menuUrl)))errors.push('/menus/ missing its breadcrumb schema');
  const menuCopy=menu.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
  if(/menukind/i.test(menuCopy)||/https?:\/\/menukind(?:-v2)?\.netlify\.app/i.test(menu))errors.push('/menus/ retains the old MenuKind branding or deployment URL');
 }
 const homeHeader=home.match(/<header\b[^>]*>[\s\S]*?<\/header>/i)?.[0]||'',homeFooter=home.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i)?.[0]||'';
 if(!/href="\/menus\/"/.test(homeHeader)||!/href="\/menus\/"/.test(homeFooter))errors.push('Homepage navigation and footer must link to /menus/');
 const hospitalityFile=path.join(root,'websites/hospitality/index.html');
 const hospitality=fs.existsSync(hospitalityFile)?fs.readFileSync(hospitalityFile,'utf8'):'';
 if(!/href="\/menus\/"/.test(hospitality.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0]||''))errors.push('Hospitality content must link to the standalone online menus');
 const previewFunction=fs.readFileSync('netlify/functions/preview.mts','utf8');
 if(!/const RESERVED_SLUGS = new Set\(\[[\s\S]*?"menus"[\s\S]*?\]\)/.test(previewFunction)||!/excludedPath:\s*\[[\s\S]*?"\/menus"[\s\S]*?\]/.test(previewFunction))errors.push('/menus must be excluded from dynamic client previews');
}
console.log(`Checked ${htmlFiles.length} pages and ${sitemapUrls.length} sitemap URLs: ${errors.length} errors${production?' (production release gate)':''}.`);if(errors.length){console.error([...new Set(errors)].join('\n'));process.exitCode=1;}
