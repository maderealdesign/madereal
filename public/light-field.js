/* One persistent particle field: orbit, give way, gather. Icon geometry: Lucide; /assets/lucide-license.txt. */
(()=>{'use strict';
const host=document.querySelector('.home-experience'),field=host?.querySelector('.light-field'),canvas=field?.querySelector('canvas');
if(!canvas)return;const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const controls=[...host.querySelectorAll('[data-motion-toggle]')];
const scenes=[...host.querySelectorAll('[data-light-scene]')].map(el=>({el,name:el.dataset.lightScene,top:0,height:0}));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);},mix=(a,b,t)=>a+(b-a)*t;
let seed=719;const random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let n=Math.imul(seed^seed>>>15,1|seed);n=n+Math.imul(n^n>>>7,61|n)^n;return((n^n>>>14)>>>0)/4294967296;};
const sprite=colour=>{const c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d'),g=x.createRadialGradient(24,24,0,24,24,24);g.addColorStop(0,'rgba(255,255,248,1)');g.addColorStop(.12,'rgba(255,255,248,.98)');g.addColorStop(.26,colour.replace('A','.68'));g.addColorStop(.56,colour.replace('A','.16'));g.addColorStop(1,colour.replace('A','0'));x.fillStyle=g;x.fillRect(0,0,48,48);return c;};
const lights=[sprite('rgba(211,246,105,A)'),sprite('rgba(218,241,250,A)'),sprite('rgba(176,215,125,A)')];
// Sample the supplied standard UI icons once, never create geometry during a frame.
const shapes={};for(const group of field.querySelectorAll('[data-particle-shape]')){const paths=[...group.children].map(el=>{const length=el.getTotalLength(),count=Math.max(32,Math.ceil(length*4));return{length,points:Array.from({length:count+1},(_,i)=>{const p=el.getPointAtLength(i/count*length);return{x:p.x,y:p.y};})};});shapes[group.dataset.particleShape]={paths,total:paths.reduce((n,p)=>n+p.length,0)};}
const particles=Array.from({length:960},()=>({t:random(),arm:Math.floor(random()*3),scatter:random()-.5,z:random(),size:random(),phase:random()*Math.PI*2,speed:.65+random()*.7,u:random(),path:random(),x:0,y:0,ready:false}));
const stars=Array.from({length:70},()=>({x:random(),y:random(),size:random()}));
let w=0,h=0,frame=0,last=0,time=0,paused=false,dirty=true,clearing=0,pointer={x:0,y:0},camera={x:0,y:0};
function measure(){w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);for(const s of scenes){const r=s.el.getBoundingClientRect();s.top=r.top+scrollY;s.height=r.height;}dirty=true;request();}
function sceneNow(){let active=null,distance=Infinity;for(const s of scenes){const top=s.top-scrollY,bottom=top+s.height;if(top>=h||bottom<=0)continue;const d=Math.abs(top+s.height/2-h/2);if(d<distance){distance=d;active={...s,top,bottom};}}return active;}
function iconPoint(shape,p,motion){let distance=p.path*shape.total,path=shape.paths[0];for(const item of shape.paths){path=item;if(distance<=item.length)break;distance-=item.length;}const u=(p.u+motion*.000018*p.speed)%1,index=u*(path.points.length-1),a=path.points[Math.floor(index)],b=path.points[Math.min(Math.floor(index)+1,path.points.length-1)];return{x:mix(a.x,b.x,index%1),y:mix(a.y,b.y,index%1)};}
function draw(s,still){const mobile=w<700,motion=reduced.matches?0:time;
const hero=s.name==='hero',shape=shapes[s.name],targetClear=hero?ease((-s.top-h*.04)/(h*.48)):0;
if(!still)clearing+=(targetClear-clearing)*.1;else if(reduced.matches)clearing=targetClear;
if(!still){camera.x+=(pointer.x-camera.x)*.06;camera.y+=(pointer.y-camera.y)*.06;}
const arrival=hero?0:ease(Math.min((h-s.top)/(h*.55),s.bottom/(h*.28))),form=reduced.matches?1:arrival;
field.dataset.motionState=hero?(clearing>.35?'clearing':'orbit'):s.name;
ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='lighter';
for(const p of stars){const size=2+p.size*5;ctx.globalAlpha=.13+p.size*.2;ctx.drawImage(lights[1],p.x*w-size/2,p.y*h-size/2,size,size);}
const count=mobile?520:960,base=Math.min(w*(mobile?.87:.47),h*.82),ox=camera.x*(mobile?0:26),oy=camera.y*18;
for(let i=0;i<count;i++){const p=particles[i],angle=p.t*10.4+p.arm*2.094+motion*.00012*(.35+(1-p.t)*1.9)*p.speed;
const radius=(.05+Math.pow(p.t,.77)*.94)*base+p.scatter*(10+p.t*38),x0=Math.cos(angle)*radius,y0=Math.sin(angle)*radius*.63;
let x=w*.5+x0*.91+y0*.42+ox,y=h*.46-x0*.42+y0*.91+oy;
const side=Math.cos(p.phase)>0?1:-1,outside=w*.5+side*w*(.465+p.z*.07),outsideY=p.u*h;
if(hero){x=mix(x,outside,clearing);y=mix(y,outsideY,clearing*.75);}
else if(shape){const q=iconPoint(shape,p,motion),size=mobile?Math.min(w*.46,200):Math.min(w*.41,590),cx=mobile?w*.5:w*.74,cy=s.top+(mobile?110:s.height*.5);
const jitter=(reduced.matches?0:Math.sin(motion*.001*p.speed+p.phase))*1.8;
const tx=cx+(q.x-12)/24*size+p.scatter*6+jitter,ty=cy+(q.y-12)/24*size+p.scatter*6;
x=mix(outside,tx,form);y=mix(outsideY,ty,form);}
if(!p.ready||reduced.matches){p.x=x;p.y=y;p.ready=true;}else if(!still){p.x+=(x-p.x)*.13;p.y+=(y-p.y)*.13;}
const size=(p.size>.98?32:p.size>.87?17:4+p.size*8)*(mobile?.82:1),shimmer=reduced.matches?1:.8+Math.sin(motion*.0011*p.speed+p.phase)*.2;
ctx.globalAlpha=(.45+p.z*.55)*shimmer*(hero?1-clearing*.5:.48+form*.52);
ctx.drawImage(lights[p.arm],p.x-size/2,p.y-size/2,size,size);
}
ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function tick(now){frame=0;if(document.hidden)return;const s=sceneNow();if(!s)return;const still=paused||reduced.matches;if(now-last>=32||dirty){if(!still)time+=Math.min(now-last||32,48);last=now;draw(s,still);dirty=false;}if(!still)frame=requestAnimationFrame(tick);}
function request(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
function controlsUpdate(){for(const b of controls){b.hidden=reduced.matches;b.querySelector('span').textContent=paused?'Play motion':'Pause motion';b.querySelector('path').setAttribute('d',paused?'M5 3l7 5-7 5Z':'M5 4v8M11 4v8');}dirty=true;request();}
controls.forEach(b=>b.addEventListener('click',()=>{paused=!paused;controlsUpdate();}));
host.addEventListener('pointermove',e=>{if(!finePointer.matches||paused||reduced.matches)return;pointer.x=e.clientX/w-.5;pointer.y=e.clientY/h-.5;},{passive:true});host.addEventListener('pointerleave',()=>{pointer.x=pointer.y=0;},{passive:true});
addEventListener('scroll',()=>{if(paused)return;if(reduced.matches)dirty=true;request();},{passive:true});
let resizeFrame=0;addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(measure);},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{last=performance.now();dirty=true;request();}});
reduced.addEventListener('change',()=>{pointer.x=pointer.y=camera.x=camera.y=0;for(const p of particles)p.ready=false;controlsUpdate();});
if('ResizeObserver'in window)new ResizeObserver(measure).observe(host);
document.fonts?.ready.then(measure);measure();controlsUpdate();
})();
