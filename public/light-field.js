/* MadeReal light current: decorative geometry, never a scrolling layer. */
(()=>{'use strict';
const sections=[...document.querySelectorAll('[data-light-scene]')];
if(!sections.length)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const controls=[...document.querySelectorAll('[data-motion-toggle]')];
let paused=false,frame=0,last=0,time=0,dirty=true;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const random=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let n=Math.imul(seed^seed>>>15,1|seed);n=n+Math.imul(n^n>>>7,61|n)^n;return((n^n>>>14)>>>0)/4294967296;};
const sprite=(colour)=>{const c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d');const g=x.createRadialGradient(24,24,0,24,24,24);g.addColorStop(0,'rgba(255,255,242,1)');g.addColorStop(.12,'rgba(255,255,242,.98)');g.addColorStop(.26,colour.replace('ALPHA','.65'));g.addColorStop(.56,colour.replace('ALPHA','.14'));g.addColorStop(1,colour.replace('ALPHA','0'));x.fillStyle=g;x.fillRect(0,0,48,48);return c;};
const lights=[sprite('rgba(211,246,105,ALPHA)'),sprite('rgba(220,243,243,ALPHA)'),sprite('rgba(184,218,130,ALPHA)')];
const scenes=sections.map((element,index)=>{const canvas=element.querySelector('canvas'),ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return null;const r=random(97+index*1337);return{element,canvas,ctx,index,visible:false,w:0,h:0,dpr:1,progress:0,pointer:{x:0,y:0},camera:{x:0,y:0},particles:Array.from({length:1000},()=>({t:r(),arm:Math.floor(r()*3),scatter:(r()-.5)*2,z:r(),size:r(),phase:r()*Math.PI*2})),stars:Array.from({length:65},()=>({x:r(),y:r(),size:r(),phase:r()*6.28}))};}).filter(Boolean);
if(!scenes.length)return;
function measure(){for(const s of scenes){const box=s.element.getBoundingClientRect();s.w=Math.round(box.width);s.h=Math.round(box.height);s.dpr=Math.min(devicePixelRatio||1,1.5);s.canvas.width=Math.round(s.w*s.dpr);s.canvas.height=Math.round(s.h*s.dpr);s.ctx.setTransform(s.dpr,0,0,s.dpr,0,0);}dirty=true;request();}
function draw(s,still){const {ctx,w,h}=s;if(!w||!h)return;ctx.clearRect(0,0,w,h);const mobile=w<650;
const box=s.element.getBoundingClientRect();const target=still?s.progress:clamp((innerHeight*.55-box.top)/(innerHeight+h)-.3,-.65,.65);
if(!still){s.progress+= (target-s.progress)*.09;s.camera.x+=(s.pointer.x-s.camera.x)*.045;s.camera.y+=(s.pointer.y-s.camera.y)*.045;}
const motion=reduced.matches?0:time,phase=s.index*.75+s.progress*.95+motion*.000024;
const ox=s.camera.x*(mobile?0:20),oy=s.camera.y*14;
ctx.globalCompositeOperation='lighter';
for(const p of s.stars){const size=2+p.size*5;ctx.globalAlpha=.15+p.size*.28;ctx.drawImage(lights[p.size>.8?0:1],p.x*w+ox*.3-size/2,p.y*h+oy*.3-size/2,size,size);}
const count=mobile?480:900;
for(let i=0;i<count;i++){const p=s.particles[i];const angle=p.t*5.8+p.arm*.23+phase;
const radius=(.18+Math.pow(p.t,.72)*.72)*(mobile?w*.92:w*.58);
const spread=p.scatter*(7+p.t*(mobile?16:30));
const x0=Math.cos(angle)*(radius+spread),y0=Math.sin(angle)*(radius+spread)*.47;
const tilt=s.index===1?-.34:-.48,cos=Math.cos(tilt),sin=Math.sin(tilt);
const cx=w*(s.index===2?.62:.51),cy=h*(s.index===0?.39:.52);
const x=cx+x0*cos-y0*sin+ox+(p.z-.5)*s.progress*38;
const y=cy+x0*sin+y0*cos+oy+(p.z-.5)*s.progress*22;
if(x< -28||x>w+28||y< -28||y>h+28)continue;
const shimmer=reduced.matches?1:.88+Math.sin(motion*.0007+p.phase)*.12;
const size=(p.size>.976?36:p.size>.87?18:5+p.size*9)*(mobile?.85:1);
ctx.globalAlpha=(.45+p.z*.55)*shimmer;
ctx.drawImage(lights[p.arm===0?0:p.arm===1?1:2],x-size/2,y-size/2,size,size);
}
ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function tick(now){frame=0;if(document.hidden)return;const still=paused||reduced.matches;const visible=scenes.filter(s=>s.visible);if(!visible.length)return;
if(now-last>=32||dirty){if(!still)time+=Math.min(now-last||32,48);last=now;for(const s of visible)draw(s,still);dirty=false;}
if(!still)frame=requestAnimationFrame(tick);
}
function request(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
function updateControls(){for(const b of controls){b.hidden=reduced.matches;b.querySelector('span').textContent=paused?'Play motion':'Pause motion';b.querySelector('path').setAttribute('d',paused?'M5 3l7 5-7 5Z':'M5 4v8M11 4v8');}dirty=true;request();}
controls.forEach(b=>b.addEventListener('click',()=>{paused=!paused;updateControls();}));
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){const s=scenes.find(s=>s.element===entry.target);s.visible=entry.isIntersecting;}dirty=true;request();},{threshold:0});scenes.forEach(s=>observer.observe(s.element));}else scenes.forEach(s=>s.visible=true);
for(const s of scenes){s.element.addEventListener('pointermove',e=>{if(!finePointer.matches||paused||reduced.matches)return;const b=s.element.getBoundingClientRect();s.pointer.x=(e.clientX-b.left)/b.width-.5;s.pointer.y=(e.clientY-b.top)/b.height-.5;},{passive:true});s.element.addEventListener('pointerleave',()=>{s.pointer.x=s.pointer.y=0;},{passive:true});}
let resizeFrame=0;addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(measure);},{passive:true});
addEventListener('scroll',()=>{if(!reduced.matches&&!paused)request();},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{last=performance.now();dirty=true;request();}});
reduced.addEventListener('change',()=>{for(const s of scenes){s.progress=0;s.pointer.x=s.pointer.y=s.camera.x=s.camera.y=0;}updateControls();});
measure();updateControls();
})();
