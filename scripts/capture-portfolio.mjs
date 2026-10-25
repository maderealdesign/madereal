// Development utility: real public website captures, never authenticated pages.
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const sharp=require('sharp');
const projects=JSON.parse(await fs.readFile(new URL('../content/portfolio-additions.json',import.meta.url),'utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const selected=process.argv.slice(2);
 const queue=projects.filter(p=>p.asset.startsWith('portfolio-')&&(!selected.length||selected.includes(p.slug)));
 async function worker(){
  while(queue.length){
   const project=queue.shift();
   const context=await browser.newContext({reducedMotion:'reduce',colorScheme:'light',viewport:{width:1440,height:900},deviceScaleFactor:1});
   try{
    const page=await context.newPage();
    const response=await page.goto(project.url,{waitUntil:'load',timeout:45000});
    if(!response?.ok())throw new Error(`${project.url}: HTTP ${response?.status()}`);
    await page.evaluate(()=>document.fonts.ready);
    for(const [label,width,height] of [['desktop',1440,900],['mobile',390,844]]){
     await page.setViewportSize({width,height});
     await page.evaluate(()=>window.scrollTo(0,0));
     await page.locator('h1').first().waitFor({state:'visible'});
     await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     const image=await page.screenshot({fullPage:false,animations:'disabled'});
     await sharp(image).webp({quality:82,effort:5}).toFile(new URL(`../public/assets/${project.asset}-${label}.webp`,import.meta.url).pathname);
    }
    console.log(`Captured ${project.name}: desktop + mobile`);
   }finally{await context.close();}
  }
 }
 await Promise.all([worker(),worker()]);
}finally{await browser.close();}
