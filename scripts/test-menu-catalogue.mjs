import assert from 'node:assert/strict';
import test from 'node:test';
import {catalogueMenus,catalogueContent,catalogueSchema,refreshCatalogueHtml,searchText} from '../src/menu-catalogue-render.mjs';
import {catalogueResponse} from '../netlify/functions/menu-catalogue.mjs';
const cafe={venueId:'example-cafe',name:'Example Café',url:'https://example.madereal.uk/',logo:'https://example.madereal.uk/venues/example/logo.webp',address:'12 Example Road, Colne',locality:'Colne'};
const data=(menus=[cafe])=>({version:1,menus});
const template=`<meta name="robots" content="index, follow"><link rel="canonical" href="https://madereal.uk/menus/browse/"><script type="application/ld+json">${JSON.stringify({'@graph':[catalogueSchema([])]})}</script><!-- menu-catalogue-start -->old<!-- menu-catalogue-end --><script src="/app.abc.js"></script>`;
test('common name spellings and postal localities remain searchable with useful town groups',()=>{
 assert.equal(searchText('Hare & Hounds Café'),searchText('Hare and Hounds Cafe'));
 const html=catalogueContent([{...cafe,locality:'Foulridge, Colne'}]);assert(html.includes('value="Colne"'));assert(html.includes('data-menu-locality="Colne"'));assert(html.includes('Foulridge, Colne'));
});
test('the public projection preserves useful location/name data while dropping every extra field',()=>{
 const clean=catalogueMenus(data([{...cafe,password:'secret',username:'staff',welcome:'https://manage.madereal.uk/welcome/private#token',billing:{},email:'private@example.com'}]));assert.deepEqual(clean,[cafe]);assert(!JSON.stringify(clean).includes('secret'));assert.match(catalogueContent(clean),/href="https:\/\/example.madereal.uk\/"/);assert.match(catalogueContent(clean),/colne/);
});
test('private, malformed, duplicated and incomplete destinations cannot become catalogue links',()=>{
 for(const url of ['https://manage.madereal.uk/','https://example.madereal.uk/admin','https://example.madereal.uk/#private','https://example.madereal.uk/?password=x','http://example.madereal.uk/','https://example.com/','https://user:pass@example.madereal.uk/'])assert.throws(()=>catalogueMenus(data([{...cafe,url}])));
 assert.throws(()=>catalogueMenus(data([cafe,cafe])));assert.throws(()=>catalogueMenus({...data(),hasMore:true}));assert.throws(()=>catalogueMenus(data([{...cafe,venueId:'demo-grill'}])));assert.throws(()=>catalogueMenus(data([{...cafe,logo:'https://other.madereal.uk/venues/example/logo.webp'}])));
});
test('refresh is server-rendered, safely escaped and keeps the built canonical, scripts and preview robots',()=>{
 const menu={...cafe,name:'Café $& </script><script>bad</script>'};const html=refreshCatalogueHtml(template,data([menu]));assert.match(html,/href="https:\/\/example.madereal.uk\/"/);assert(html.includes('Café $&amp; &lt;/script&gt;'));assert(!html.includes('<script>bad</script>'));assert(html.includes('/app.abc.js'));assert(html.includes('index, follow'));assert(html.includes('https://madereal.uk/menus/browse/'));const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.equal(graph['@graph'][0].numberOfItems,1);assert.equal(graph['@graph'][0].itemListElement[0].name,menu.name);
});
test('a new public record appears in response HTML without rebuilding the marketing template',async()=>{
 const next={...cafe,venueId:'new-cafe',name:'New Café',url:'https://new.madereal.uk/',logo:'',locality:'Burnley'};const response=await catalogueResponse(new Request('https://madereal.uk/menus/browse/'),{template:async()=>template,fetchCatalogue:async()=>Response.json(data([cafe,next]))});const html=await response.text();assert.equal(response.status,200);assert(html.includes('href="https://new.madereal.uk/"'));assert(html.includes('2 menus to explore'));assert.match(response.headers.get('netlify-cdn-cache-control'),/s-maxage=300/);
});
test('data outages retain verified build links; invalid source payloads never reach the document',async()=>{
 for(const fetchCatalogue of [async()=>{throw Error('offline')},async()=>Response.json(data([{...cafe,url:'https://manage.madereal.uk/welcome/staff#secret'}]))]){const response=await catalogueResponse(new Request('https://madereal.uk/menus/browse/'),{template:async()=>template,fetchCatalogue});assert.equal(await response.text(),template);assert.equal(response.headers.get('x-menu-catalogue'),'verified-build-fallback');}
 const post=await catalogueResponse(new Request('https://madereal.uk/menus/browse/',{method:'POST'}));assert.equal(post.status,405);
});
