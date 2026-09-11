import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pages,posts} from '../src/pages.mjs';
if(process.env.CONTEXT==='production'&&(process.env.PREVIEW==='1'||process.env.HOSTING_TARGET==='sites'))throw new Error('Production cannot use private-preview indexing or form settings');
const output=path.resolve('dist');
if(path.basename(output)!=='dist'||fs.existsSync(output)&&fs.lstatSync(output).isSymbolicLink())throw new Error('Unsafe output directory');
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
fs.cpSync('public',output,{recursive:true,filter:source=>!['base.css','seamless-initial.jpg'].includes(path.basename(source))});
const css=fs.readFileSync('public/styles.css','utf8'),js=fs.readFileSync('public/app.js','utf8'),motion=fs.readFileSync('public/light-field.js','utf8');
const hash=createHash('sha256').update(css+js+motion).digest('hex').slice(0,12);
fs.writeFileSync(path.join(output,`styles.${hash}.css`),css);fs.writeFileSync(path.join(output,`app.${hash}.js`),js);fs.writeFileSync(path.join(output,`light-field.${hash}.js`),motion);
const indexable=[];
for(const [route,original]of Object.entries(pages)){
let html=original.replace('href="/styles.css"',`href="/styles.${hash}.css"`).replace('src="/app.js"',`src="/app.${hash}.js"`).replace('src="/light-field.js"',`src="/light-field.${hash}.js"`);
// The private design copy is static; enquiries belong to the live Netlify form.
if(process.env.HOSTING_TARGET==='sites')html=html.replace(/<form\b[^>]*data-lead-form[\s\S]*?<\/form>/,`<section class="preview-form"><p class="eyebrow">PRIVATE DESIGN PREVIEW</p><h2>Your business could be next.</h2><p>This is a private copy of the MadeReal website. Use our live enquiry form to send your details securely.</p><a class="button" href="https://madereal.uk/free-preview/">Open the live preview form <span aria-hidden="true">↗</span></a><p class="fine">No card or deposit. Your homepage preview is free.</p></section>`);
const file=path.join(output,route==='/'?'index.html':route.replace(/^\//,'')+'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html);
if(route==='/404/')fs.writeFileSync(path.join(output,'404.html'),html);
if(!['/404/','/checkout/','/payment-return/','/preview-received/'].includes(route))indexable.push(route);
}
const xmlEscape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
fs.writeFileSync(path.join(output,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+indexable.map(route=>`<url><loc>https://madereal.uk${xmlEscape(route)}</loc></url>`).join('')+'</urlset>\n');
fs.writeFileSync(path.join(output,'robots.txt'),process.env.PREVIEW==='1'?'User-agent: *\nDisallow: /\n':'User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: https://madereal.uk/sitemap.xml\n');
const map=JSON.parse(fs.readFileSync('content/redirects.json','utf8'));
for(const route of indexable.filter(x=>x!=='/'))map[route+'index.html']=route;
const rules=Object.entries(map).filter(([from,to])=>from.replace(/\/$/,'')!==to.split('#')[0].replace(/\/$/,'')).map(([from,to])=>`${from} ${to} 301!`);
for(const old of ['/printing','/printing.html','/print-and-signage','/graphic-design','/graphic-design.html','/logo-design.html','/blog/flyer-design-local-business','/blog/flyer-design-local-business.html'])rules.push(`${old} /404.html 410!`);
fs.writeFileSync(path.join(output,'_redirects'),rules.join('\n')+'\n');
fs.writeFileSync(path.join(output,'_headers'),`/styles.${hash}.css\n  Cache-Control: public, max-age=31536000, immutable\n/app.${hash}.js\n  Cache-Control: public, max-age=31536000, immutable\n/light-field.${hash}.js\n  Cache-Control: public, max-age=31536000, immutable\n/sitemap.xml\n  Content-Type: application/xml; charset=utf-8\n  Cache-Control: public, max-age=0, must-revalidate\n/robots.txt\n  Content-Type: text/plain; charset=utf-8\n  Cache-Control: public, max-age=0, must-revalidate\n`+(process.env.PREVIEW==='1'?'/*\n  X-Robots-Tag: noindex, nofollow\n':''));
fs.writeFileSync(path.join(output,'feed.xml'),'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>MadeReal Journal</title><link>https://madereal.uk/blog/</link><description>Practical website and local visibility advice.</description>'+posts.map(p=>`<item><title>${xmlEscape(p.title)}</title><link>https://madereal.uk/blog/${p.slug}/</link><guid>https://madereal.uk/blog/${p.slug}/</guid><description>${xmlEscape(p.excerpt)}</description></item>`).join('')+'</channel></rss>');
console.log(`Built ${Object.keys(pages).length} pages, ${posts.length} articles, ${indexable.length} sitemap URLs and ${rules.length} migration rules.`);
