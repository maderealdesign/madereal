import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read=route=>fs.readFileSync(new URL(`../dist${route}index.html`,import.meta.url),'utf8');
const copy=html=>html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');

for(const route of ['/menus/','/menus/start/','/menus/pubs/','/menus/cafes/','/menus/sandwich-shops/']){
 test(`${route} gives the whole free-first-month offer before a request`,()=>{
  const html=read(route),text=copy(html);
  assert.match(text,/100% completely FREE for the first month Then £19\/month per venue\./);
  assert.match(text,/No card upfront\. No automatic charge\./);
  assert.match(text,/(?:month starts.*day.*menu is created|month from menu creation|month starts when.*menu is created)/i);
  assert.match(text,/public menu stays online/i);
  assert.match(html,/href="\/menu-offer\.css"/);
 });
}

test('discovery metadata describes a free month and an optional paid continuation',()=>{
 const html=read('/menus/');
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 const offers=graph.find(node=>node['@type']==='Service').offers;
 assert.equal(offers[0].price,'0');
 assert.equal(offers[1].price,'19');
 assert.match(offers[0].description,/day your menu is created/);
 assert.match(offers[1].description,/Optional subscription/);
 assert.match(html,/madereal-menus-free-month\.jpg/);
});

test('photo and detailed intake remain requests, and confirmation states the creation-date rule',()=>{
 assert.match(read('/menus/'),/name="Menu Photo Enquiry"[^>]*data-netlify="true"/);
 assert.match(read('/menus/start/'),/name="Menu Setup Request"[^>]*data-netlify="true"/);
 assert.match(copy(read('/menus/start/')),/not a payment or a staff account/);
 const text=copy(read('/menus/request-received/'));
 assert.match(text,/free month starts on the day your menu is created/);
 assert.match(text,/No card upfront and no automatic charge/);
 assert.match(text,/hasn’t taken a payment or created a staff account/);
});

test('changing intake package preserves the free-month and optional website distinction',()=>{
 const title={textContent:''},note={textContent:''};
 let update;
 const packageFields=[{value:'menu-only',checked:true,addEventListener(event,callback){if(event==='change')update=callback}}];
 const fields=new Map();
 const field=name=>{
  if(name==='package')return {get value(){return packageFields[0].checked?'menu-only':'menu-and-website'}};
  if(!fields.has(name))fields.set(name,{value:'',addEventListener(){},setCustomValidity(){}});
  return fields.get(name);
 };
 const select=selector=>selector==='[data-mi-package-title]'?title:selector==='[data-mi-package-note]'?note:{};
 const form={elements:{namedItem:field},querySelector:select,querySelectorAll:()=>packageFields,addEventListener(){}};
 const document={querySelector:selector=>selector==='[data-menu-intake]'?form:selector==='[data-mi-package-title]'?title:selector==='[data-mi-package-note]'?note:{},referrer:''};
 vm.runInNewContext(fs.readFileSync(new URL('../public/menu-intake.js',import.meta.url),'utf8'),{document,location:{search:'',pathname:'/menus/start/',href:'https://madereal.uk/menus/start/'},URLSearchParams});
 assert.match(title.textContent,/free first month, then £19\/month per venue/);
 assert.match(note.textContent,/No card upfront or automatic charge/);
 packageFields[0].checked=false;
 update();
 assert.match(title.textContent,/free first month, then £19\/month per venue\. Website: £197 once/);
 assert.match(note.textContent,/Website hosting is included/);
});

test('website products keep their separate prices and terms',()=>{
 assert.match(copy(read('/pricing/')),/£35\/month/);
 assert.match(copy(read('/one-off-websites/')),/£197, one-off/);
 assert.doesNotMatch(copy(read('/pricing/')),/100% completely FREE for the first month/);
 assert.match(copy(read('/terms/')),/The separate online-menu offer/);
});
