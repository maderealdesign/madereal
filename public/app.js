(()=>{'use strict';
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
if(menu&&nav){const close=()=>{nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');};menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');nav.classList.toggle('is-open',open);});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){close();menu.focus();}});document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))close();});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));matchMedia('(min-width:851px)').addEventListener('change',close);}
const stage=document.querySelector('.reel-stage');
if(stage){
 const reel=stage.closest('.showreel'),slides=[...stage.querySelectorAll('[data-slide]')],data=JSON.parse(document.querySelector('#reel-data').textContent),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const play=reel.querySelector('[data-reel-play]'),caption=reel.querySelector('.reel-caption');
 let active=0,busy=false,queued=0,timer=0,inView=false,hovered=false,focused=false,stopped=reduced.matches,touch=null,suppressClick=0;
 const index=n=>(n+slides.length)%slides.length;
 const load=async n=>{const slide=slides[index(n)],img=slide.querySelector('img');slide.querySelectorAll('[data-srcset]').forEach(x=>{x.srcset=x.dataset.srcset;delete x.dataset.srcset;});if(img.dataset.src){img.src=img.dataset.src;delete img.dataset.src;}img.loading='eager';try{await img.decode();}catch{return false;}return img.naturalWidth>0;};
 const warm=()=>{[-2,-1,0,1,2].forEach(n=>load(active+n));};
 const render=()=>{slides.forEach((s,i)=>{let offset=index(i-active);if(offset>slides.length/2)offset-=slides.length;s.dataset.slot=String(Math.max(-3,Math.min(3,offset)));s.classList.toggle('is-active',offset===0);s.setAttribute('aria-hidden',String(offset!==0));s.inert=offset!==0;});reel.querySelector('#reel-current').textContent=String(active+1).padStart(2,'0');reel.querySelector('#reel-category').textContent=data[active].category;const link=reel.querySelector('#reel-project');link.firstChild.textContent=data[active].name+' ';link.href='/work/'+data[active].slug+'/';};
 const schedule=()=>{clearTimeout(timer);if(!stopped&&!reduced.matches&&inView&&!hovered&&!focused&&!document.hidden&&!busy)timer=setTimeout(()=>move(1,false),4800);};
 const updatePlay=()=>{const paused=stopped||reduced.matches;play.hidden=reduced.matches;play.setAttribute('aria-label',paused?'Play website previews':'Pause website previews');play.querySelector('path').setAttribute('d',paused?'m9 5 11 7-11 7Z':'M9 5v14M15 5v14');caption.setAttribute('aria-live',paused?'polite':'off');schedule();};
 async function move(direction,manual=true){
  if(manual){stopped=true;updatePlay();}clearTimeout(timer);
  if(busy){if(manual)queued=direction;return;}busy=true;
  const target=index(active+direction);const ready=await load(target);
  if(!ready){busy=false;reel.querySelector('#reel-status').textContent='This preview could not load. Please try the next website.';return;}
  await Promise.all([load(target-1),load(target+1)]);
  // Hidden outer slides are already staged on their own side; none crosses the centre to reset.
  active=target;render();reel.querySelector('#reel-status').textContent='';
  await new Promise(resolve=>{if(reduced.matches){resolve();return;}let fallback;const done=e=>{if(e&&(e.target!==slides[active]||e.propertyName!=='transform'))return;slides[active].removeEventListener('transitionend',done);clearTimeout(fallback);resolve();};slides[active].addEventListener('transitionend',done);fallback=setTimeout(()=>done(),850);});
  busy=false;warm();if(queued){const n=queued;queued=0;move(n,true);}else schedule();
 }
 reel.querySelector('[data-reel-prev]').addEventListener('click',()=>move(-1));
 reel.querySelector('[data-reel-next]').addEventListener('click',()=>move(1));
 play.addEventListener('click',()=>{stopped=!stopped;updatePlay();});
 stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
 stage.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')touch={x:e.clientX,y:e.clientY};},{passive:true});
 stage.addEventListener('pointerup',e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.25){suppressClick=Date.now()+600;move(dx<0?1:-1);}},{passive:true});
 stage.addEventListener('pointercancel',()=>{touch=null;},{passive:true});
 stage.addEventListener('click',e=>{if(Date.now()<suppressClick){e.preventDefault();e.stopPropagation();}},true);
 reel.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;schedule();}});
 reel.addEventListener('pointerleave',()=>{hovered=false;schedule();});
 reel.addEventListener('focusin',()=>{focused=true;schedule();});
 reel.addEventListener('focusout',e=>{if(!reel.contains(e.relatedTarget)){focused=false;schedule();}});
 document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',()=>{if(reduced.matches)stopped=true;updatePlay();});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();},{threshold:.15}).observe(stage);else inView=true;
 render();warm();updatePlay();
}
const filters=[...document.querySelectorAll('[data-filter]')];filters.forEach(button=>button.addEventListener('click',()=>{filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;document.querySelectorAll('.work-index .project-card').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.sector!==button.dataset.filter;if(!card.hidden)count++;});document.querySelector('#filter-status').textContent=count+' websites shown.';}));
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealing');observer.unobserve(entry.target);}});},{threshold:.12});document.querySelectorAll('[data-reveal]').forEach(x=>observer.observe(x));}
const form=document.querySelector('[data-lead-form]');if(form){const set=(name,value)=>{const input=form.elements.namedItem(name);if(input)input.value=value;};const params=new URLSearchParams(location.search);set('Source_Page',location.pathname);set('Landing_Page',location.pathname);try{set('Referrer',document.referrer?new URL(document.referrer).origin:'');}catch{}for(const [field,key]of[['UTM_Source','utm_source'],['UTM_Medium','utm_medium'],['UTM_Campaign','utm_campaign']])set(field,(params.get(key)||'').slice(0,180));const contact=form.elements.namedItem('Contact_Detail');const validate=()=>{const value=contact.value.trim(),email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),phone=/^[+()\d\s.-]+$/.test(value)&&value.replace(/\D/g,'').length>=10;contact.setCustomValidity(value&&!email&&(contact.type==='email'||!phone)?(contact.type==='email'?'Please enter a valid email address.':'Please enter a valid email address or mobile number.'):'');};contact.addEventListener('input',validate);form.addEventListener('submit',async e=>{e.preventDefault();validate();if(!form.reportValidity())return;const button=form.querySelector('[type=submit]'),status=form.querySelector('.form-status');button.disabled=true;status.textContent='Sending your enquiry…';try{const body=new URLSearchParams(new FormData(form));const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()});if(!response.ok)throw new Error('Submission unavailable');window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'generate_lead',form_name:'Quick Preview Lead'});location.assign('/preview-received/');}catch{status.textContent='Your enquiry has not been sent. Please try again, or WhatsApp Dom on 07396 710347.';button.disabled=false;}});}
})();
