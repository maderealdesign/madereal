import fs from 'node:fs';

// Run after the production deploy is live. IndexNow acknowledges discovery only.
const key='23e04222a7b14acbb54bca9c872de693';
const origin='https://madereal.uk';
const routes=['/menus/','/menus/pubs/','/menus/cafes/','/menus/sandwich-shops/','/menus/start/'];
const keyFile=new URL(`../public/${key}.txt`,import.meta.url);
if(fs.readFileSync(keyFile,'utf8').trim()!==key)throw new Error('IndexNow ownership file mismatch');
if(!process.argv.includes('--submit')){
 console.log(JSON.stringify({mode:'dry-run',endpoint:'https://api.indexnow.org/indexnow',urls:routes.map(route=>origin+route)},null,2));
}else{
 const keyResponse=await fetch(`${origin}/${key}.txt`,{signal:AbortSignal.timeout(15000)});
 if(!keyResponse.ok||(await keyResponse.text()).trim()!==key)throw new Error('Publish the ownership key before submitting production URLs');
 for(const route of routes){
  const response=await fetch(origin+route,{signal:AbortSignal.timeout(15000)});
  const html=await response.text();
  if(!response.ok||response.url!==origin+route||/name="robots" content="[^"]*noindex/i.test(html))throw new Error(`Not a live indexable canonical page: ${route}`);
 }
 const response=await fetch('https://api.indexnow.org/indexnow',{
  method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},
  body:JSON.stringify({host:'madereal.uk',key,keyLocation:`${origin}/${key}.txt`,urlList:routes.map(route=>origin+route)}),
  signal:AbortSignal.timeout(20000)
 });
 console.log(JSON.stringify({httpStatus:response.status,accepted:[200,202].includes(response.status),urlCount:routes.length,message:response.status===202?'Received; ownership validation pending. This is not confirmation of indexing.':response.status===200?'Received. This is not confirmation of indexing.':'Submission failed.'}));
 if(![200,202].includes(response.status))process.exitCode=1;
}
