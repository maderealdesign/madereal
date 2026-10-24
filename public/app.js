(()=>{'use strict';
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
if(menu&&nav){const close=()=>{nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');};menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');nav.classList.toggle('is-open',open);});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){close();menu.focus();}});document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))close();});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));matchMedia('(min-width:851px)').addEventListener('change',close);}
const stage=document.querySelector('.reel-stage');
if(stage){
 const reel=stage.closest('.showreel'),originals=[...stage.querySelectorAll('[data-slide]')],data=JSON.parse(document.querySelector('#reel-data').textContent),reduced=matchMedia('(prefers-reduced-motion:reduce)'),mobile=matchMedia('(max-width:600px)');
 const noun=stage.dataset.reelNoun||'website';
 const play=reel.querySelector('[data-reel-play]'),caption=reel.querySelector('.reel-caption'),status=reel.querySelector('#reel-status'),count=originals.length;
 const wrap=(n,length=count)=>((n%length)+length)%length;
 // A short collection also needs enough off-screen copies to wrap out of sight.
 if(count>1&&count<7){for(let copy=1;copy<Math.ceil(7/count);copy++)originals.forEach(slide=>{const clone=slide.cloneNode(true);clone.dataset.reelCopy='';stage.append(clone);});}
 const slides=[...stage.querySelectorAll('[data-slide]')];
 let position=0,active=-1,frame=0,motion=null,timer=0,inView=false,hovered=false,focused=false,stopped=reduced.matches,pointer=null,suppressClick=0,warmTimer=0,warmOffset=3;
 stage.classList.add('is-interactive');
 caption.setAttribute('aria-live','off');
 const load=n=>{
  const project=wrap(n);
  slides.forEach((slide,i)=>{if(i%count!==project)return;const img=slide.querySelector('img');slide.querySelectorAll('[data-srcset]').forEach(source=>{source.srcset=source.dataset.srcset;delete source.dataset.srcset;});if(img.dataset.src){img.src=img.dataset.src;delete img.dataset.src;}img.loading='eager';});
 };
 const warm=()=>{[-2,-1,0,1,2].forEach(offset=>load(active+offset));};
 // Nearby images start immediately; remaining previews warm progressively.
 // Image decoding never blocks a drag, a flick or a change of direction.
 const warmNext=()=>{
  warmTimer=0;
  if(!inView||document.hidden||warmOffset>=count)return;
  load(warmOffset++);
  warmTimer=setTimeout(()=>{if('requestIdleCallback'in window)requestIdleCallback(warmNext,{timeout:600});else warmNext();},120);
 };
 const interpolate=(points,distance)=>{const low=Math.min(2,Math.floor(distance)),fraction=Math.min(1,distance-low);return points[low]+(points[low+1]-points[low])*fraction;};
 const render=()=>{
  const selected=wrap(Math.round(position),slides.length);
  slides.forEach((slide,i)=>{
   let offset=wrap(i-position,slides.length);if(offset>slides.length/2)offset-=slides.length;
   const distance=Math.min(3,Math.abs(offset)),side=Math.sign(offset),isActive=i===selected;
   if(distance===3&&slide.style.visibility==='hidden')return;
   slide.style.setProperty('--x',side*interpolate(mobile.matches?[0,94,148,195]:[0,87,148,195],distance)+'%');
   slide.style.setProperty('--y',interpolate(mobile.matches?[0,17,34,40]:[0,20,34,40],distance)+'px');
   slide.style.setProperty('--angle',-side*interpolate(mobile.matches?[0,32,48,55]:[0,34,48,55],distance)+'deg');
   slide.style.setProperty('--depth',interpolate(mobile.matches?[0,-75,-220,-300]:[0,-100,-220,-300],distance)+'px');
   slide.style.setProperty('--scale',interpolate([1,.84,.65,.55],distance));
   slide.style.setProperty('--shade',interpolate([0,.3,.66,.82],distance));
   slide.style.opacity=String(Math.max(0,Math.min(1,3-distance)));
   slide.style.visibility=distance>=3?'hidden':'visible';
   slide.style.zIndex=String(100-Math.round(distance*20));
   slide.style.pointerEvents=isActive?'auto':'none';
   slide.dataset.slot=String(Math.max(-3,Math.min(3,Math.round(offset))));
   if(slide.classList.contains('is-active')!==isActive){slide.classList.toggle('is-active',isActive);slide.setAttribute('aria-hidden',String(!isActive));slide.inert=!isActive;}
  });
  const next=wrap(Math.round(position));
  if(next!==active){active=next;reel.querySelector('#reel-current').textContent=String(active+1).padStart(2,'0');reel.querySelector('#reel-category').textContent=data[active].category;const link=reel.querySelector('#reel-project');link.firstChild.textContent=data[active].name+' ';link.href=data[active].href||'/work/'+data[active].slug+'/';if(inView||!stage.hasAttribute('data-reel-lazy'))warm();}
 };
 const schedule=()=>{clearTimeout(timer);if(count>1&&!stopped&&!reduced.matches&&inView&&!hovered&&!focused&&!document.hidden&&!motion&&!pointer)timer=setTimeout(()=>move(1,false),4800);};
 const updatePlay=()=>{const paused=stopped||reduced.matches;play.hidden=reduced.matches||count<2;play.setAttribute('aria-label',paused?'Play '+noun+' previews':'Pause '+noun+' previews');play.querySelector('path').setAttribute('d',paused?'m9 5 11 7-11 7Z':'M9 5v14M15 5v14');schedule();};
 const cancelMotion=()=>{cancelAnimationFrame(frame);frame=0;motion=null;};
 const announce=()=>{if(stopped)status.textContent=data[active].name+', '+noun+' '+(active+1)+' of '+count+'.';};
 const finish=()=>{cancelMotion();position=wrap(position,slides.length);render();announce();schedule();};
 function animate(now){
  frame=0;if(!motion)return;
  if(motion.type==='coast'){
   // Exact exponential integration gives the same travel at 60 Hz and 120 Hz.
   const elapsed=Math.max(0,(now-motion.last)/1000),decay=Math.exp(-1.8*elapsed);
   position+=motion.velocity*(1-decay)/1.8;motion.velocity*=decay;motion.last=now;
   render();
   if(Math.abs(motion.velocity)<.08){settle(Math.round(position),230);return;}
  }else{
   const progress=Math.min(1,(now-motion.start)/motion.duration),ease=1-Math.pow(1-progress,3);
   position=motion.from+(motion.to-motion.from)*ease;render();
   if(progress===1){position=motion.to;finish();return;}
  }
  frame=requestAnimationFrame(animate);
 }
 function settle(target,duration=360){
  cancelMotion();clearTimeout(timer);
  if(reduced.matches||Math.abs(target-position)<.001){position=target;finish();return;}
  motion={type:'settle',from:position,to:target,start:performance.now(),duration};frame=requestAnimationFrame(animate);
 }
 function move(direction,manual=true){
  if(count<2)return;
  if(manual){stopped=true;updatePlay();}
  // Repeated buttons extend the destination without queuing or locking input.
  const target=(motion?.type==='settle'?motion.to:Math.round(position))+direction;
  settle(target);
 }
 reel.querySelector('[data-reel-prev]').addEventListener('click',()=>move(-1));
 reel.querySelector('[data-reel-next]').addEventListener('click',()=>move(1));
 reel.querySelectorAll('[data-reel-prev],[data-reel-next]').forEach(button=>{button.disabled=count<2;});
 document.addEventListener('madereal:motion',event=>{stopped=Boolean(event.detail.paused);if(stopped){cancelMotion();position=Math.round(position);render();}updatePlay();});
 play.addEventListener('click',()=>{stopped=!stopped;if(stopped){cancelMotion();announce();}else settle(Math.round(position));updatePlay();});
 stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();stage.focus({preventScroll:true});move(e.key==='ArrowRight'?1:-1);}});
 stage.addEventListener('dragstart',e=>e.preventDefault());
 stage.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button!==0||pointer||count<2)return;
  const caught=!!motion;
  cancelMotion();stopped=true;suppressClick=0;status.textContent='';updatePlay();
  pointer={id:e.pointerId,x:e.clientX,y:e.clientY,position,step:originals[0].offsetWidth*(mobile.matches ? .94 : .87),dragging:false,caught,lastX:e.clientX,lastMove:e.timeStamp,samples:[{x:e.clientX,t:e.timeStamp}]};
 },{passive:true});
 const track=e=>{
  position=pointer.position-(e.clientX-pointer.x)/pointer.step;
  if(e.clientX!==pointer.lastX){pointer.lastMove=e.timeStamp;pointer.lastX=e.clientX;}
  pointer.samples.push({x:e.clientX,t:e.timeStamp});
  while(pointer.samples.length>2&&pointer.samples[1].t<e.timeStamp-100)pointer.samples.shift();
 };
 stage.addEventListener('pointermove',e=>{
  if(!pointer||e.pointerId!==pointer.id)return;
  if(!pointer.dragging){
   const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
   if(Math.max(Math.abs(dx),Math.abs(dy))<6)return;
   if(Math.abs(dy)>Math.abs(dx)){pointer=null;schedule();return;}
   pointer.dragging=true;stage.classList.add('is-dragging');stage.setPointerCapture(e.pointerId);
  }
  if(e.cancelable)e.preventDefault();
  const samples=e.getCoalescedEvents?.();
  if(samples?.length)samples.forEach(track);else track(e);
  render();
 },{passive:false});
 const release=(e,cancelled=false)=>{
  if(!pointer||e.pointerId!==pointer.id)return;
  const wasDragging=pointer.dragging,caught=pointer.caught;
  let velocity=0;
  if(wasDragging&&!cancelled){track(e);const first=pointer.samples[0],last=pointer.samples[pointer.samples.length-1],elapsed=(last.t-first.t)/1000;if(elapsed>.008&&e.timeStamp-pointer.lastMove<100)velocity=Math.max(-18,Math.min(18,-(last.x-first.x)/pointer.step/elapsed));render();}
  pointer=null;stage.classList.remove('is-dragging');
  if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);
  if(wasDragging||caught)suppressClick=Date.now()+600;
  if(wasDragging){
   if(!cancelled&&!reduced.matches&&Math.abs(velocity)>.15){motion={type:'coast',velocity,last:performance.now()};frame=requestAnimationFrame(animate);}
   else settle(Math.round(position),230);
  }else{announce();schedule();}
 };
 // Release an undecided mouse gesture too, even if it ended outside the stage.
 window.addEventListener('pointerup',e=>release(e),{passive:true});
 window.addEventListener('pointercancel',e=>release(e,true),{passive:true});
 // Touch initially captures the child link. Its bubbling loss during transfer
 // to the stage is expected; only losing the stage's own capture cancels a drag.
 stage.addEventListener('lostpointercapture',e=>{if(e.target===stage&&!stage.hasPointerCapture(e.pointerId))release(e,true);},{passive:true});
 stage.addEventListener('click',e=>{if(Date.now()<suppressClick){e.preventDefault();e.stopPropagation();}},true);
 reel.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;schedule();}});
 reel.addEventListener('pointerleave',()=>{hovered=false;schedule();});
 // A keyboard user must be able to focus a project without it moving away.
 reel.addEventListener('focusin',()=>{focused=true;cancelMotion();schedule();});
 reel.addEventListener('focusout',e=>{if(!reel.contains(e.relatedTarget)){focused=false;schedule();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelMotion();clearTimeout(warmTimer);warmTimer=0;}else if(!warmTimer)warmNext();schedule();});
 reduced.addEventListener('change',()=>{if(reduced.matches){stopped=true;cancelMotion();if(!pointer){position=Math.round(position);render();}}updatePlay();});
 mobile.addEventListener('change',render);
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(!inView)cancelMotion();else{warm();if(!warmTimer)warmNext();}schedule();},{threshold:.15}).observe(stage);else inView=true;
 render();updatePlay();if(inView)warmNext();
}
const filters=[...document.querySelectorAll('[data-filter]')];filters.forEach(button=>button.addEventListener('click',()=>{filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;document.querySelectorAll('.work-index .project-card').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.sector!==button.dataset.filter;if(!card.hidden)count++;});document.querySelector('#filter-status').textContent=count+' websites shown.';}));
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealing');observer.unobserve(entry.target);}});},{threshold:.12});document.querySelectorAll('[data-reveal]').forEach(x=>observer.observe(x));}
const form=document.querySelector('[data-lead-form]');if(form){const set=(name,value)=>{const input=form.elements.namedItem(name);if(input)input.value=value;};const params=new URLSearchParams(location.search);set('Source_Page',location.pathname);set('Landing_Page',location.pathname);try{set('Referrer',document.referrer?new URL(document.referrer).origin:'');}catch{}for(const [field,key]of[['UTM_Source','utm_source'],['UTM_Medium','utm_medium'],['UTM_Campaign','utm_campaign']])set(field,(params.get(key)||'').slice(0,180));const contact=form.elements.namedItem('Contact_Detail');const validate=()=>{const value=contact.value.trim(),email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),phone=/^[+()\d\s.-]+$/.test(value)&&value.replace(/\D/g,'').length>=10;contact.setCustomValidity(value&&!email&&(contact.type==='email'||!phone)?(contact.type==='email'?'Please enter a valid email address.':'Please enter a valid email address or mobile number.'):'');};contact.addEventListener('input',validate);form.addEventListener('submit',async e=>{e.preventDefault();validate();if(!form.reportValidity())return;const button=form.querySelector('[type=submit]'),status=form.querySelector('.form-status');button.disabled=true;status.textContent='Sending your enquiry…';try{const body=new URLSearchParams(new FormData(form));const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()});if(!response.ok)throw new Error('Submission unavailable');window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'generate_lead',form_name:'Quick Preview Lead'});location.assign('/preview-received/');}catch{status.textContent='Your enquiry has not been sent. Please try again, or WhatsApp Dom on 07396 710347.';button.disabled=false;}});}
})();
