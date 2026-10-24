import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {layout,site} from './components.mjs';
import {menuStories,menuQuestions} from './menu-stories.mjs';

// Native, server-rendered menu showcase: no embed, proxy or client-rendered SEO body.
const body=menuStories;
const css=['menu-stories.css'];
const js=['menu-stories.js','acquisition.js'];
const version=name=>createHash('sha256').update(fs.readFileSync(new URL('../public/menus-assets/'+name,import.meta.url))).digest('hex').slice(0,10);
export function menusPage(){
 const extraHead='<link rel="preload" href="/menus-assets/assets/fonts/nunito-latin-variable.woff2" as="font" type="font/woff2" crossorigin>'+css.map(name=>`<link rel="stylesheet" href="/menus-assets/${name}?v=${version(name)}">`).join('')+ '<script defer src="/light-field.js"></script>'+js.map(name=>`<script defer src="/menus-assets/${name}?v=${version(name)}"></script>`).join('');
 return layout({title:'Online Menu Software for Cafés & Restaurants | MadeReal',description:'Branded online menus for cafés, pubs and restaurants. Update prices, hide sold-out dishes and print A4 menus from one place. £19 per venue/month.',path:'/menus/',body,dark:true,sticky:false,offer:'menus',socialImage:'/menus-assets/assets/madereal-menus-social-v2.jpg',socialImageAlt:'MadeReal: your online menu, your branding, your team in control. Edit it yourself and print it anytime. £19 per venue per month. Real Little Italy and Alma Inn menu designs.',breadcrumbs:[{name:'Online menus',url:'/menus/'}],schema:[{'@type':'Service','@id':site.url+'/menus/#service',name:'MadeReal online menu software',serviceType:'Branded digital menus and restaurant menu management',description:'Branded online menus with phone-friendly staff editing, dietary filters, photos, availability, specials, QR codes and A4/PDF printing for cafés, pubs and restaurants.',provider:{'@id':site.url+'/#organization'},url:site.url+'/menus/',areaServed:{'@type':'Country',name:'United Kingdom'},audience:{'@type':'BusinessAudience',audienceType:'Cafés, sandwich shops, pubs and restaurants'},offers:{'@type':'Offer',url:site.url+'/menus/#pricing',priceCurrency:'GBP',price:'19',priceSpecification:{'@type':'UnitPriceSpecification',price:19,priceCurrency:'GBP',unitText:'month, per venue'}}},{'@type':'FAQPage','@id':site.url+'/menus/#faq',mainEntity:menuQuestions.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))}]})
 .replace('</head>',extraHead+'</head>')
 .replace(/<link rel="preload" href="\/assets\/fonts\/(?:space-grotesk|dm-sans)-latin-400-700\.woff2"[^>]*>/g,'')
 .replace('<body class="dark-top">','<body class="dark-top menus-story">');
}
