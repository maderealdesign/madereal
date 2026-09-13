/* One persistent point cloud: expand, drift, and flow around six flat UI icons.
   Icon geometry: Lucide family; /assets/lucide-license.txt. */
(()=>{'use strict';
const host=document.querySelector('.home-experience'),field=host?.querySelector('.light-field'),canvas=field?.querySelector('canvas');
if(!canvas)return;const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const controls=[...host.querySelectorAll('[data-motion-toggle]')];
const scenes=[...host.querySelectorAll('[data-light-scene]')].map(el=>({el,name:el.dataset.lightScene,top:0,height:0}));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);},mix=(a,b,t)=>a+(b-a)*t,wrap=(v,size)=>((v%size)+size)%size;
let seed=719;const random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let n=Math.imul(seed^seed>>>15,1|seed);n=n+Math.imul(n^n>>>7,61|n)^n;return((n^n>>>14)>>>0)/4294967296;};
const sprite=colour=>{const c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d'),g=x.createRadialGradient(24,24,0,24,24,24);g.addColorStop(0,'rgba(255,255,248,1)');g.addColorStop(.12,'rgba(255,255,248,.98)');g.addColorStop(.26,colour.replace('A','.68'));g.addColorStop(.56,colour.replace('A','.16'));g.addColorStop(1,colour.replace('A','0'));x.fillStyle=g;x.fillRect(0,0,48,48);return c;};
const colours=['rgba(224,241,255,A)','rgba(112,183,255,A)','rgba(255,171,110,A)'];
const lights=colours.map(sprite);
// Sample the exact same outlines in small idle-time batches. Do not make the
// homepage wait for thousands of SVG geometry calls before its first paint.
const shapes={},shapeJobs=[...field.querySelectorAll('[data-particle-shape]')].map(group=>{
 const paths=[...group.children].map(el=>({el,length:el.getTotalLength()}));
 return{name:group.dataset.particleShape,paths,total:paths.reduce((n,p)=>n+p.length,0),points:[]};
});
function scheduleShapes(){
 if('requestIdleCallback'in window)requestIdleCallback(prepareShapes,{timeout:600});
 else setTimeout(prepareShapes,16);
}
function prepareShapes(){
 if(!shapeJobs.length)return;
 const active=sceneNow().name,priority=shapeJobs.findIndex(job=>job.name===active);
 if(priority>0)shapeJobs.unshift(shapeJobs.splice(priority,1)[0]);
 const job=shapeJobs[0],started=performance.now();let batch=0;
 while(job.points.length<1000&&batch<128&&performance.now()-started<4){
  let distance=job.points.length/1000*job.total,path=job.paths[0];
  for(const candidate of job.paths){path=candidate;if(distance<=path.length)break;distance-=path.length;}
  const q=path.el.getPointAtLength(distance);job.points.push({x:(q.x-12)/12,y:(q.y-12)/12});batch++;
 }
 if(job.points.length===1000){shapes[job.name]=job.points;shapeJobs.shift();field.dataset.shapesReady=String(Object.keys(shapes).length);dirty=true;request();}
 if(shapeJobs.length)scheduleShapes();
}
const particles=Array.from({length:960},()=>{
 const tint=random();return{t:random(),arm:Math.floor(random()*3),colour:tint<.68?0:tint<.92?1:2,scatter:random()-.5,z:random(),size:random(),phase:random()*Math.PI*2,speed:.65+random()*.7,u:random(),x:0,y:0,ready:false};
});
const stars=Array.from({length:150},()=>({x:random(),y:random(),size:random(),phase:random()*6.28}));
let w=0,h=0,hostTop=0,hostBottom=0,frame=0,last=0,time=0,paused=false,dirty=true,clearing=0,textAreas=[],pointer={x:0,y:0},camera={x:0,y:0};
let scrollSpeed=0,scrollTime=performance.now(),scrollPosition=scrollY;
function measure(){
 w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 const bounds=host.getBoundingClientRect();hostTop=bounds.top+scrollY;hostBottom=bounds.bottom+scrollY;
 for(const s of scenes){const r=s.el.getBoundingClientRect();s.top=r.top+scrollY;s.height=r.height;const anchor=s.el.querySelector('[data-particle-anchor]');
  if(anchor){const b=anchor.getBoundingClientRect();s.anchor={x:b.left+b.width/2,y:b.top+scrollY+b.height/2,size:Math.min(b.width,b.height)*.45};}
 }
 // Cache the actual lines, not a shaded rectangle around the whole copy block.
 textAreas=[...host.querySelectorAll('.particle-benefit-copy>p,.particle-benefit-copy>h2')].flatMap(el=>{
  const range=document.createRange();range.selectNodeContents(el);
  return[...range.getClientRects()].filter(r=>r.width&&r.height).map(r=>({left:r.left-6,right:r.right+6,top:r.top+scrollY-5,bottom:r.bottom+scrollY+5}));
 });
 dirty=true;request();
}
function sceneNow(){
 let active=null,best=0;
 for(const s of scenes){
  const top=s.top-scrollY,bottom=top+s.height;
  if(top>=h||bottom<=0)continue;
  const centre=s.anchor?s.anchor.y-scrollY:top+s.height*.5;
  // A full scatter interval between adjacent icons, instead of a direct morph.
  const distance=Math.abs(centre-h*.44),span=Math.min(h*.48,s.height*.46);
  const strength=s.name==='hero'?1:1-ease((distance-span*.32)/(span*.68));
  const score=s.name==='hero'?1:1/(1+distance);
  if(score>best){best=score;active={source:s,name:s.name,top,bottom,strength,anchor:s.anchor};}
 }
 return active||{name:'ambient',strength:0};
}
function draw(s,still,delta){
 const mobile=w<700,motion=reduced.matches?0:time,hero=s.name==='hero',shape=shapes[s.name],icon=!!(shape&&s.anchor);
 const targetClear=hero?ease((-s.top-h*.04)/(h*.48)):1;
 clearing=still?targetClear:mix(clearing,targetClear,.12);
 if(!still){camera.x=mix(camera.x,pointer.x,.06);camera.y=mix(camera.y,pointer.y,.06);}
 const form=icon?s.strength:0;
 field.dataset.motionState=hero?(clearing>.35?'clearing':'orbit'):s.name;field.dataset.iconRotation=icon?'0':'';field.dataset.iconFormation=form.toFixed(3);
 const clearAreas=textAreas.filter(r=>r.bottom>scrollY-48&&r.top<scrollY+h+48).map(r=>({...r,top:r.top-scrollY,bottom:r.bottom-scrollY}));
 const textVisibility=(x,y)=>{let visibility=1;for(const r of clearAreas){
  const dx=Math.max(r.left-x,0,x-r.right),dy=Math.max(r.top-y,0,y-r.bottom);
  if(dx>40||dy>40)continue;
  visibility=Math.min(visibility,.035+.965*ease(Math.hypot(dx,dy)/40));
 }return visibility;};
 ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='lighter';
 for(const p of stars){
  const size=2+p.size*6,x=p.x*w,y=wrap(p.y*(h+40)-scrollY*(.055+p.size*.14)+motion*.0015*(.3+p.size),h+40)-20;
  ctx.globalAlpha=(.2+p.size*.4)*(reduced.matches?1:.85+Math.sin(motion*.0007+p.phase)*.15)*textVisibility(x,y);ctx.drawImage(lights[p.size>.94?2:p.size>.7?1:0],x-size/2,y-size/2,size,size);
 }
 const trailStrength=still?0:clamp((Math.abs(scrollSpeed)-.35)/1.8);let trailCount=0;
 const count=mobile?520:960,base=Math.min(w*(mobile?.87:.47),h*.82),ox=camera.x*(mobile?0:26),oy=camera.y*18;
 for(let i=0;i<count;i++){
  const p=particles[i],side=i%2?1:-1;
  // Broad, layered outskirts continue to drift behind every white panel.
  const outside=w*.5+side*w*(.23+p.z*.34)+Math.sin(motion*.00012+p.phase)*18;
  const outsideY=wrap(p.u*(h+140)-scrollY*(.12+p.z*.32)+motion*.003*p.speed,h+140)-70;
  let x=outside,y=outsideY;
  if(hero){
   const orbit=p.t*10.4+p.arm*2.094+motion*.00012*(.35+(1-p.t)*1.9)*p.speed;
   const radius=(.05+Math.pow(p.t,.77)*.94)*base+p.scatter*(10+p.t*38),x0=Math.cos(orbit)*radius,y0=Math.sin(orbit)*radius*.63;
   x=mix(w*.5+x0*.91+y0*.42+ox,outside,clearing);y=mix(h*.46-x0*.42+y0*.91+oy,outsideY,clearing*.85);
  }else if(icon&&i<count*.84){
   const q=shape[Math.floor(wrap(p.u+motion*.000012*p.speed,1)*shape.length)],jitter=reduced.matches?0:Math.sin(motion*.001*p.speed+p.phase)*.008;
   // The silhouette stays face-on; individual stars travel along its outline.
   const size=s.anchor.size,spread=p.phase+motion*.000018*p.speed;
   const scatterX=w*.5+Math.cos(spread)*w*(.18+p.z*.49);
   const scatterY=h*.44+Math.sin(spread)*h*(.2+p.t*.52);
   x=mix(scatterX,s.anchor.x+(q.x+p.scatter*.027)*size,form);
   y=mix(scatterY,s.anchor.y-scrollY+(q.y+jitter)*size,form);
  }
  const previousX=p.x,previousY=p.y,wasReady=p.ready;
  if(!p.ready||still){p.x=x;p.y=y;p.ready=true;}else{p.x=mix(p.x,x,.16);p.y=mix(p.y,y,.16);}
  const inIcon=icon&&i<count*.84,shimmer=reduced.matches?1:.85+Math.sin(motion*.0011*p.speed+p.phase)*.15;
  const size=(inIcon?(p.size>.965?26:p.size>.86?12:3+p.size*6):(p.size>.98?34:p.size>.87?16:3+p.size*7))*(mobile?.85:1);
  ctx.globalAlpha=clamp((inIcon?(.62+p.z*.38)*(0.65+form*.35):hero?(.5+p.z*.5)*(1-clearing*.4):.27+p.z*.38)*shimmer)*textVisibility(p.x,p.y);
  // Layered luminous tails on fast scroll, with no persistent canvas smearing.
  if(trailStrength>0&&wasReady&&i%2===0){
   const dx=p.x-previousX,dy=p.y-previousY,distance=Math.hypot(dx,dy);
   if(distance>.4&&distance<260){
    const length=Math.min(mobile?76:136,distance*7)*trailStrength,tx=p.x-dx/distance*length,ty=p.y-dy/distance*length;
    const crossesText=clearAreas.some(r=>Math.min(tx,p.x)<r.right+8&&Math.max(tx,p.x)>r.left-8&&Math.min(ty,p.y)<r.bottom+8&&Math.max(ty,p.y)>r.top-8);
    const trailAlpha=ctx.globalAlpha;if(crossesText)ctx.globalAlpha*=.035;
    const g=ctx.createLinearGradient(tx,ty,p.x,p.y);g.addColorStop(0,colours[p.colour].replace('A','0'));g.addColorStop(.55,colours[p.colour].replace('A','.32'));g.addColorStop(1,'rgba(240,248,255,.94)');ctx.strokeStyle=g;ctx.lineWidth=1+p.size*1.7;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(p.x,p.y);ctx.stroke();const alpha=ctx.globalAlpha;ctx.globalAlpha=alpha*.16;ctx.lineWidth=5+p.size*5;ctx.stroke();ctx.globalAlpha=alpha;trailCount++;
    ctx.globalAlpha=trailAlpha;
   }
  }
  ctx.drawImage(lights[p.colour],p.x-size/2,p.y-size/2,size,size);
 }
 field.dataset.trails=String(trailCount);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function tick(now){
 frame=0;if(document.hidden)return;
 const visible=hostBottom>scrollY&&hostTop<scrollY+h;field.style.visibility=visible?'visible':'hidden';if(!visible)return;
 const still=paused||reduced.matches;
 if(now-last>=32||dirty){const delta=Math.min(now-last||32,48);if(!still)time+=delta;if(now-scrollTime>80)scrollSpeed*=.65;last=now;draw(sceneNow(),still,delta);dirty=false;}
 if(!still)frame=requestAnimationFrame(tick);
}
function request(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
function controlsUpdate(){for(const b of controls){b.hidden=reduced.matches;b.setAttribute('aria-pressed',String(paused));b.querySelector('span').textContent=paused?'Play motion':'Pause motion';b.querySelector('path').setAttribute('d',paused?'M5 3l7 5-7 5Z':'M5 4v8M11 4v8');}dirty=true;request();}
controls.forEach(b=>b.addEventListener('click',()=>{paused=!paused;controlsUpdate();}));
host.addEventListener('pointermove',e=>{if(!finePointer.matches||paused||reduced.matches)return;pointer.x=e.clientX/w-.5;pointer.y=e.clientY/h-.5;},{passive:true});
host.addEventListener('pointerleave',()=>{pointer.x=pointer.y=0;},{passive:true});
addEventListener('scroll',()=>{const now=performance.now(),elapsed=Math.max(16,now-scrollTime);scrollSpeed=(scrollY-scrollPosition)/elapsed;scrollPosition=scrollY;scrollTime=now;dirty=true;request();},{passive:true});
let resizeFrame=0;addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(measure);},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{last=performance.now();dirty=true;request();}});
reduced.addEventListener('change',()=>{pointer.x=pointer.y=camera.x=camera.y=0;for(const p of particles)p.ready=false;controlsUpdate();});
if('ResizeObserver'in window)new ResizeObserver(measure).observe(host);
document.fonts?.ready.then(measure);measure();controlsUpdate();scheduleShapes();
})();
