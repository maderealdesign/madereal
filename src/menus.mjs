import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {layout,site} from './components.mjs';

// Native, server-rendered menu showcase: no embed, proxy or client-rendered SEO body.
const body=fs.readFileSync(new URL('./menus-body.html',import.meta.url),'utf8');
const css=["styles.css","demo.css","venues.css","messages.css","v2-theme.css","venue-portfolio.css","workflow-polish.css","hero-polish.css","demo-viewport.css","demo-clarity.css","menus-integration.css"];
const js=['demo.js','hero-menus.js','menus.js','workflow-polish.js','v2-motion.js'];
const version=name=>createHash('sha256').update(fs.readFileSync(new URL('../public/menus-assets/'+name,import.meta.url))).digest('hex').slice(0,10);
export function menusPage(){
 const extraHead=css.map(name=>`<link rel="stylesheet" href="/menus-assets/${name}?v=${version(name)}">`).join('')+js.map(name=>`<script defer src="/menus-assets/${name}?v=${version(name)}"></script>`).join('');
 return layout({title:'Online Menus You Can Update Yourself | MadeReal',description:'Online menus for cafés, butty shops, pubs and restaurants. Update prices, dishes, photos and specials yourself. Try the menu manager and see real menu designs.',path:'/menus/',body,dark:true,sticky:false,breadcrumbs:[{name:'Online menus',url:'/menus/'}],schema:[{'@type':'Service','@id':site.url+'/menus/#service',name:'MadeReal online menus',serviceType:'Online menu design and menu management',description:'Branded online menus with staff editing, dietary filters, photos, availability, specials and A4 printing for independent food businesses.',provider:{'@id':site.url+'/#organization'},url:site.url+'/menus/',areaServed:{'@type':'Country',name:'United Kingdom'},audience:{'@type':'BusinessAudience',audienceType:'Cafés, sandwich shops, pubs and restaurants'}}]})
 .replace('</head>',extraHead+'</head>')
 .replace('<body class="dark-top">','<body class="dark-top mr-v2 menus-page">')
 .replace('<main id="main">','<main id="main" class="home-experience">');
}
