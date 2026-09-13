/* One persistent point cloud: orbit, drift, and form six rotating UI icons.
   Icon geometry: Lucide family; /assets/lucide-license.txt. */
(()=>{'use strict';
const host=document.querySelector('.home-experience'),field=host?.querySelector('.light-field'),canvas=field?.querySelector('canvas');
if(!canvas)return;const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const controls=[...host.querySelectorAll('[data-motion-toggle]')];
const scenes=[...host.querySelectorAll('[data-light-scene]')].map((el,i)=>({el,name:el.dataset.lightScene,top:0,height:0,turn:0,speed:.76+i*.07}));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);},mix=(a,b,t)=>a+(b-a)*t,wrap=(v,size)=>((v%size)+size)%size;
let seed=719;const random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let n=Math.imul(seed^seed>>>15,1|seed);n=n+Math.imul(n^n>>>7,61|n)^n;return((n^n>>>14)>>>0)/4294967296;};
const sprite=colour=>{const c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d'),g=x.createRadialGradient(24,24,0,24,24,24);g.addColorStop(0,'rgba(255,255,248,1)');g.addColorStop(.12,'rgba(255,255,248,.98)');g.addColorStop(.26,colour.replace('A','.68'));g.addColorStop(.56,colour.replace('A','.16'));g.addColorStop(1,colour.replace('A','0'));x.fillStyle=g;x.fillRect(0,0,48,48);return c;};
const lights=[sprite('rgba(211,246,105,A)'),sprite('rgba(218,241,250,A)'),sprite('rgba(176,215,125,A)')];
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
 const layer=random();return{t:random(),arm:Math.floor(random()*3),scatter:random()-.5,z:random(),size:random(),phase:random()*Math.PI*2,speed:.65+random()*.7,u:random(),depth:layer<.36?-.14:layer<.72?.14:(random()-.5)*.28,x:0,y:0,ready:false};
});
const stars=Array.from({length:150},()=>({x:random(),y:random(),size:random(),phase:random()*6.28}));
let w=0,h=0,hostTop=0,hostBottom=0,frame=0,last=0,time=0,paused=false,dirty=true,clearing=0,pointer={x:0,y:0},camera={x:0,y:0};
let scrollSpeed=0,scrollTime=performance.now(),scrollPosition=scrollY;
function measure(){
 w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 const bounds=host.getBoundingClientRect();hostTop=bounds.top+scrollY;hostBottom=bounds.bottom+scrollY;
 for(const s of scenes){const r=s.el.getBoundingClientRect();s.top=r.top+scrollY;s.height=r.height;const anchor=s.el.querySelector('[data-particle-anchor]');
  if(anchor){const b=anchor.getBoundingClientRect();s.anchor={x:b.left+b.width/2,y:b.top+scrollY+b.height/2,size:Math.min(b.width,b.height)*.45};}
 }
 dirty=true;request();
}
function sceneNow(){
 let active=null,best=0;
 for(const s of scenes){
  const top=s.top-scrollY,bottom=top+s.height;
  if(top>=h||bottom<=0)continue;
  const strength=s.name==='hero'?1:ease(Math.min((h-top)/(h*.46),bottom/(h*.34)));
  // Weight the icon itself, not just a tall section's text, when two scenes meet.
  const centre=s.anchor?s.anchor.y-scrollY:top+s.height*.5;
  const score=strength*(1-clamp(Math.abs(centre-h*.45)/(h*1.1))*.6);
  if(score>best){best=score;active={source:s,name:s.name,top,bottom,strength,anchor:s.anchor};}
 }
 return active||{name:'ambient',strength:0};
}
function draw(s,still,delta){
 const mobile=w<700,motion=reduced.matches?0:time,hero=s.name==='hero',shape=shapes[s.name],icon=!!(shape&&s.anchor);
 const targetClear=hero?ease((-s.top-h*.04)/(h*.48)):1;
 clearing=still?targetClear:mix(clearing,targetClear,.12);
 if(!still){camera.x=mix(camera.x,pointer.x,.06);camera.y=mix(camera.y,pointer.y,.06);if(icon)s.source.turn+=delta;}
 const form=icon?s.strength:0,angle=reduced.matches?.28:.28+(s.source?.turn||0)*.00017*(s.source?.speed||1);
 const cos=Math.cos(angle),sin=Math.sin(angle),tilt=reduced.matches?-.08:-.08+Math.sin(motion*.00023)*.07,ct=Math.cos(tilt),st=Math.sin(tilt);
 field.dataset.motionState=hero?(clearing>.35?'clearing':'orbit'):s.name;field.dataset.iconRotation=icon?angle.toFixed(3):'';
 ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='lighter';
 for(const p of stars){
  const size=2+p.size*6,x=p.x*w,y=wrap(p.y*(h+40)-scrollY*(.055+p.size*.14)+motion*.0015*(.3+p.size),h+40)-20;
  ctx.globalAlpha=(.16+p.size*.3)*(reduced.matches?1:.85+Math.sin(motion*.0007+p.phase)*.15);ctx.drawImage(lights[1],x-size/2,y-size/2,size,size);
 }
 const trailStrength=still?0:clamp((Math.abs(scrollSpeed)-.6)/2.4);let trailCount=0;
 const count=mobile?520:960,base=Math.min(w*(mobile?.87:.47),h*.82),ox=camera.x*(mobile?0:26),oy=camera.y*18;
 for(let i=0;i<count;i++){
  const p=particles[i],side=i%2?1:-1;
  // Broad, layered outskirts continue to drift behind every white panel.
  const outside=w*.5+side*w*(.27+p.z*.30)+Math.sin(motion*.00012+p.phase)*12;
  const outsideY=wrap(p.u*(h+140)-scrollY*(.12+p.z*.32)+motion*.003*p.speed,h+140)-70;
  let x=outside,y=outsideY,depth=0;
  if(hero){
   const orbit=p.t*10.4+p.arm*2.094+motion*.00012*(.35+(1-p.t)*1.9)*p.speed;
   const radius=(.05+Math.pow(p.t,.77)*.94)*base+p.scatter*(10+p.t*38),x0=Math.cos(orbit)*radius,y0=Math.sin(orbit)*radius*.63;
   x=mix(w*.5+x0*.91+y0*.42+ox,outside,clearing);y=mix(h*.46-x0*.42+y0*.91+oy,outsideY,clearing*.85);
  }else if(icon&&i<count*.84){
   const q=shape[Math.floor(wrap(p.u+motion*.000008*p.speed,1)*shape.length)],jitter=reduced.matches?0:Math.sin(motion*.001*p.speed+p.phase)*.006;
   const px=q.x+p.scatter*.018,py=q.y+jitter,pz=p.depth;
   const rx=px*cos+pz*sin,rz=-px*sin+pz*cos,ry=py*ct-rz*st;depth=py*st+rz*ct;
   const perspective=3.8/(3.8-depth),size=s.anchor.size;
   x=mix(outside,s.anchor.x+rx*size*perspective+camera.x*8,form);
   y=mix(outsideY,s.anchor.y-scrollY+ry*size*perspective,form);
  }
  const previousX=p.x,previousY=p.y,wasReady=p.ready;
  if(!p.ready||still){p.x=x;p.y=y;p.ready=true;}else{p.x=mix(p.x,x,.16);p.y=mix(p.y,y,.16);}
  const inIcon=icon&&i<count*.84,shimmer=reduced.matches?1:.85+Math.sin(motion*.0011*p.speed+p.phase)*.15;
  const size=(inIcon?(p.size>.97?18:3.5+p.size*6):(p.size>.98?28:p.size>.87?13:3+p.size*6))*(mobile?.85:1)*(inIcon?clamp(1+depth*.2,.7,1.3):1);
  ctx.globalAlpha=clamp((inIcon?(.48+p.z*.38)*(0.65+form*.35):hero?(.4+p.z*.5)*(1-clearing*.55):.2+p.z*.33)*shimmer);
  // No persistent canvas smearing: only fast scrolling produces short luminous trails.
  if(trailStrength>0&&wasReady&&i%3===0){
   const dx=p.x-previousX,dy=p.y-previousY,distance=Math.hypot(dx,dy);
   if(distance>.6&&distance<150){
    const length=Math.min(mobile?40:70,distance*3.5)*trailStrength,tx=p.x-dx/distance*length,ty=p.y-dy/distance*length;
    const g=ctx.createLinearGradient(tx,ty,p.x,p.y);g.addColorStop(0,'rgba(210,244,165,0)');g.addColorStop(1,'rgba(223,250,196,.6)');ctx.strokeStyle=g;ctx.lineWidth=.6+p.size;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(p.x,p.y);ctx.stroke();trailCount++;
   }
  }
  ctx.drawImage(lights[p.arm],p.x-size/2,p.y-size/2,size,size);
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
