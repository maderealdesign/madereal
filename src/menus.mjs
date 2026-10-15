import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {layout,site} from './components.mjs';

// Native, server-rendered menu showcase: no embed, proxy or client-rendered SEO body.
const body=fs.readFileSync(new URL('./menus-body.html',import.meta.url),'utf8');
const css=["styles.css","demo.css","venues.css","messages.css","v2-theme.css","venue-portfolio.css","workflow-polish.css","hero-polish.css","demo-viewport.css","demo-clarity.css","menus-integration.css","cheerful-brand.css","workflow-autoplay.css"];
const js=['demo.js','hero-menus.js','menus.js','workflow-polish.js','v2-motion.js','acquisition.js'];
const version=name=>createHash('sha256').update(fs.readFileSync(new URL('../public/menus-assets/'+name,import.meta.url))).digest('hex').slice(0,10);
export function menusPage(){
 const arrow='<svg class="brand-arrow" viewBox="0 0 28 24" aria-hidden="true"><path d="M3 12h21M17 5l7 7-7 7"/></svg>';
 const cheerfulBody=body.replace(/<span(?: aria-hidden="true")?>↗<\/span>/g,arrow)
  .replace('<h1>','<h1><svg class="brand-heading-rays" viewBox="0 0 50 61" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" aria-hidden="true"><path d="M7 40l16 4M16 13l13 14M39 3l4 17"/></svg>')
  .replace('<a class="menus-desktop-only" href="#playground">Try the demo</a>','<a class="menus-desktop-only" href="#workflow-update">Watch it update</a>')
  .replace('<a class="button menus-desktop-only" href="#playground">Try the live demo','<a class="button menus-desktop-only" href="#workflow-update">Watch it update')
  .replace('The sample details are filled in. Give it a go.','Your team logs in to update the menu.')
  .replace('Open sample workspace <svg','Log in <svg')
  .replace('Try updating the menu <span','See the menu update <span')
  .replace('<div class="mini-price-row">','<svg class="brand-price-arrow" viewBox="0 0 46 53" aria-hidden="true"><path d="M35 3C38 24 24 31 8 37m0 0 11 3M8 37l5-11"/></svg><div class="mini-price-row">');
 const extraHead='<link rel="preload" href="/menus-assets/assets/fonts/nunito-variable.ttf" as="font" type="font/ttf" crossorigin>'+css.map(name=>`<link rel="stylesheet" href="/menus-assets/${name}?v=${version(name)}">`).join('')+js.map(name=>`<script defer src="/menus-assets/${name}?v=${version(name)}"></script>`).join('');
 return layout({title:'Online Menus You Can Update Yourself · £19/month | MadeReal',description:'Online menus for cafés, butty shops and pubs. Update prices, photos and specials yourself. £19/month, with an optional £197 one-off full website add-on.',path:'/menus/',body:cheerfulBody,dark:true,sticky:false,offer:'menus',breadcrumbs:[{name:'Online menus',url:'/menus/'}],schema:[{'@type':'Service','@id':site.url+'/menus/#service',name:'MadeReal online menus',serviceType:'Online menu design and menu management',description:'Branded online menus with staff editing, dietary filters, photos, availability, specials and A4 printing for independent food businesses.',provider:{'@id':site.url+'/#organization'},url:site.url+'/menus/',areaServed:{'@type':'Country',name:'United Kingdom'},audience:{'@type':'BusinessAudience',audienceType:'Cafés, sandwich shops, pubs and restaurants'},offers:{'@type':'Offer',url:site.url+'/menus/#pricing',priceCurrency:'GBP',price:'19',priceSpecification:{'@type':'UnitPriceSpecification',price:19,priceCurrency:'GBP',unitText:'month, per venue'}}}]})
 .replace('</head>',extraHead+'</head>')
 .replace('<body class="dark-top">','<body class="dark-top mr-v2 menus-page menus-cheerful">')
 .replace('<main id="main">','<main id="main" class="home-experience">');
}
