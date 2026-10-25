import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {layout,site,header,footer,breadcrumb} from './components.mjs';
import {menuEditorial,menuHeader,menuFooter} from './menu-editorial.mjs';
import {menuFunnelAssets} from './menu-funnel.mjs';

// Native, server-rendered menu showcase: no embed, proxy or client-rendered SEO body.
const body=menuEditorial;
const css=['menu-editorial.css'];
const js=['menu-plain.js','menu-editorial.js','acquisition.js'];
const version=name=>createHash('sha256').update(fs.readFileSync(new URL('../public/menus-assets/'+name,import.meta.url))).digest('hex').slice(0,10);
export function menusPage(){
 const extraHead=css.map(name=>`<link rel="stylesheet" href="/menus-assets/${name}?v=${version(name)}">`).join('')+js.map(name=>`<script defer src="/menus-assets/${name}?v=${version(name)}"></script>`).join('');
 return layout({title:'Online Menus for Cafés, Pubs & Restaurants | MadeReal',description:'A branded menu website customers can find on Google, open by link or scan at the table. Update it yourself and print fresh menus. £19 per venue/month.',path:'/menus/',body,dark:false,sticky:false,offer:'menus',socialImage:'/menus-assets/assets/madereal-menus-social-v2.jpg',socialImageAlt:'MadeReal online menus: your branding, staff-controlled updates and printing. £19 per venue per month.',breadcrumbs:[{name:'Online menus',url:'/menus/'}],schema:[{'@type':'Service','@id':site.url+'/menus/#service',name:'MadeReal online menu websites',serviceType:'Branded online menu website design and management',description:'Individually designed, search-indexable menu websites for cafés, pubs and restaurants, with staff editing, a shareable link, QR artwork and branded A4/PDF menus. Initial setup included.',provider:{'@id':site.url+'/#organization'},url:site.url+'/menus/',areaServed:{'@type':'Country',name:'United Kingdom'},audience:{'@type':'BusinessAudience',audienceType:'Cafés, pubs and restaurants'},offers:{'@type':'Offer',url:site.url+'/menus/#pricing',priceCurrency:'GBP',price:'19',priceSpecification:{'@type':'UnitPriceSpecification',price:19,priceCurrency:'GBP',unitText:'month, per venue'}}}]})
 .replace('</head>',extraHead+menuFunnelAssets+'</head>')
 .replace(header('menus'),menuHeader)
 .replace(footer('menus'),menuFooter)
 .replace(breadcrumb([{name:'Online menus',url:'/menus/'}]),'')
 .replace('<body class="light-top">','<body class="light-top menus-editorial-page">');
}
