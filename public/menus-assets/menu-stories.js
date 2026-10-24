(() => {
 'use strict';
 if (!document.body.classList.contains('menus-story')) return;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const pause = document.querySelector('[data-ms-pause]');
 const scenes = [...document.querySelectorAll('[data-ms-scene]')];
 const visible = new Set();
 let paused = false;
 const text = (scene, selector, value) => {
  const el = scene.querySelector(selector);
  if (el && el.textContent !== value) el.textContent = value;
 };
 const flag = (scene, name, value) => { scene.dataset[name] = String(Boolean(value)); };
 // Each duration is a visible action or a hold. Pointer moves finish before a click.
 const durations = {
  price: [1700,1000,650,350,900,1000,650,650,3800],
  print: [1700,1600,1000,850,3800],
  sold: [1800,1000,750,2200,1000,700,2800],
  special: [1700,800,1000,650,1100,3400],
  qr: [1600,1000,1700,2200,1700,3200],
  setup: [2200,2400,3300],
  photo: [1600,1000,700,1400,3300],
  collections: [2000,1000,2300,1000,2800],
  filter: [1700,1000,700,1700,1000,650,3200],
  team: [1700,1000,700,1500,1000,900,1000,650,3400],
  pack: [1600,1000,1400,1000,1500,1000,3400],
  analytics: [1600,1000,700,3600]
 };
 const pointers = {
  price: [null,'.ms-price-value','.ms-price-value','.ms-price-value','.ms-price-value','.ms-publish','.ms-publish','.ms-publish',null],
  print: [null,'.ms-print-online .ms-dish','.ms-print-button','.ms-print-button',null],
  sold: [null,'.ms-toggle','.ms-toggle',null,'.ms-toggle','.ms-toggle',null],
  special: [null,'.ms-add-special','.ms-order-special','.ms-order-special','.ms-order-special',null],
  qr: [null,'.ms-social-link','.ms-social-link',null,null,null],
  photo: [null,'.ms-photo-upload','.ms-photo-upload',null,null],
  collections: [null,'.ms-example-tabs span:nth-child(2)','.ms-example-tabs span:nth-child(2)','.ms-example-tabs span:nth-child(3)','.ms-example-tabs span:nth-child(3)'],
  filter: [null,'.ms-filter-pill','.ms-filter-pill',null,'.ms-search-box','.ms-search-box','.ms-search-box'],
  team: [null,'.ms-login-button','.ms-login-button',null,'.ms-team-item .ms-toggle','.ms-team-item .ms-toggle','.ms-team-publish','.ms-team-publish',null],
  pack: [null,'.ms-download-list>div:nth-child(1)','.ms-download-list>div:nth-child(1)','.ms-download-list>div:nth-child(2)','.ms-download-list>div:nth-child(2)','.ms-download-list>div:nth-child(3)','.ms-download-list>div:nth-child(3)'],
  analytics: [null,'.ms-date-select','.ms-date-select',null]
 };
 const clicks = {
  price:[2,6],print:[3],sold:[2,5],special:[1,3],qr:[2],photo:[2],
  collections:[2,4],filter:[2,5],team:[2,5,7],pack:[2,4,6],analytics:[2]
 };
 const positionPointer = scene => {
  const kind = scene.dataset.msScene, step = Number(scene.dataset.step || 0);
  const selector = pointers[kind]?.[step];
  const target = selector && scene.querySelector(selector);
  flag(scene,'pointer',Boolean(target) && !reduced.matches);
  if (!target) return;
  const box = scene.getBoundingClientRect(), item = target.getBoundingClientRect();
  // Aim at the real control, so the cursor also works when the layout changes size.
  scene.style.setProperty('--mx',(item.left - box.left + item.width * .65 - 3)+'px');
  scene.style.setProperty('--my',(item.top - box.top + item.height * .58 - 2)+'px');
 };
 const render = (scene, step) => {
  const kind = scene.dataset.msScene;
  scene.dataset.step = String(step);
  flag(scene,'click',clicks[kind]?.includes(step));
  flag(scene,'updated',(kind === 'price' && step === 8) || (kind === 'print' && step === 4) || (kind === 'qr' && step === 5));
  switch (kind) {
   case 'price':
    text(scene,'[data-ms-price-edit]',step >= 4 ? '9.00' : step === 3 ? '9' : '8.50');
    text(scene,'[data-ms-price-guest]',step >= 8 ? '9.00' : '8.50');
    text(scene,'[data-ms-publish-label]',step === 7 ? 'Publishing…' : step === 8 ? 'Published ✓' : 'Publish');
    text(scene,'[data-ms-price-status]',step === 8 ? '✓ Menu updated' : 'Live price');
    text(scene,'[data-ms-price-stage]',step >= 8 ? 'Customer menu updated' : step >= 5 ? 'Press Publish' : 'Edit the price');
    scene.dataset.pricePhase = step >= 8 ? 'result' : step >= 5 ? 'publish' : 'edit';
    flag(scene,'editing',step >= 2 && step <= 4);
    flag(scene,'publishing',step === 6 || step === 7);
    break;
   case 'print':
    text(scene,'[data-ms-print-online]',step >= 1 ? '9.00' : '8.50');
    text(scene,'[data-ms-print-paper]',step >= 4 ? '9.00' : '8.50');
    text(scene,'[data-ms-print-stage]',step >= 4 ? '✓ A4 menu generated' : step >= 1 ? '✓ Change published online' : 'Edit once');
    break;
   case 'sold':
    flag(scene,'unavailable',step >= 2 && step <= 4);
    flag(scene,'hiddenDish',step >= 3 && step <= 4);
    text(scene,'[data-ms-sold-label]',step >= 3 && step <= 4 ? 'Sold out. Hidden from the customer menu.' : step === 2 ? 'Switching availability off…' : step === 6 ? 'Available again. Restored to the menu.' : 'Available on the menu');
    break;
   case 'special':
    flag(scene,'hasSpecial',step >= 2);
    flag(scene,'reordered',step >= 4);
    text(scene,'[data-ms-order-status]',step >= 5 ? 'Customer menu: Today’s special · Breakfast · Lunch' : 'Customer menu: Breakfast · Lunch');
    break;
   case 'qr':
    text(scene,'[data-ms-qr-price]',step >= 3 ? '9.00' : '8.50');
    text(scene,'[data-ms-qr-status]',step === 2 ? 'Opened from Facebook' : step === 3 ? 'New price. Same menu address.' : step === 4 ? 'Scan the existing QR again…' : step === 5 ? '✓ Same QR. Updated menu.' : 'Opens from either link');
    flag(scene,'scanning',step === 4);
    break;
   case 'photo':
    flag(scene,'uploaded',step >= 3);
    flag(scene,'photoVisible',step >= 4);
    break;
   case 'collections': {
    const index = step >= 4 ? 2 : step >= 2 ? 1 : 0;
    const choices = [['Breakfast','Eggs on toast','£6.50'],['Main menu','Fish and chips','£17.50'],['Drinks','Flat white','£3.20']];
    scene.dataset.collection = String(index);
    text(scene,'[data-ms-collection-title]',choices[index][0]);
    text(scene,'[data-ms-collection-dish]',choices[index][1]);
    text(scene,'[data-ms-collection-price]',choices[index][2]);
    break;
   }
   case 'filter':
    flag(scene,'filtered',step >= 3);
    flag(scene,'searching',step >= 5);
    flag(scene,'searched',step >= 6);
    text(scene,'[data-ms-search-text]',step >= 6 ? 'mushroom' : 'Search dishes');
    break;
   case 'team':
    flag(scene,'workspace',step >= 3);
    flag(scene,'unavailable',step >= 5);
    text(scene,'[data-ms-team-status]',step >= 8 ? '✓ Published. Sold-out cake is hidden.' : step >= 5 ? 'Draft: cake unavailable. Ready to publish.' : 'Make a change, then publish');
    break;
   case 'pack':
    flag(scene,'guide',step >= 6);
    text(scene,'[data-ms-download-status]',step >= 6 ? 'Editing guide opened' : step >= 4 ? '✓ Social image downloaded' : step >= 2 ? '✓ Table QR sign downloaded' : 'Everything in one private link');
    break;
   case 'analytics':
    flag(scene,'report',step >= 3);
    text(scene,'[data-ms-opens]',step >= 3 ? '186' : '—');
    break;
  }
  // The row being dragged also moves; retarget after its transition completes.
  positionPointer(scene);
  if (kind === 'special' && step === 4) {
   const box = scene.getBoundingClientRect(), row = scene.querySelector('.ms-order-list').getBoundingClientRect();
   scene.style.setProperty('--mx',(row.left - box.left + 30)+'px');
   scene.style.setProperty('--my',(row.top - box.top + 20)+'px');
  }
 };
 const stop = scene => { clearTimeout(scene._msTimer); scene._msTimer = 0; };
 const schedule = scene => {
  stop(scene);
  if (paused || reduced.matches || document.hidden || !visible.has(scene)) return;
  const sequence = durations[scene.dataset.msScene];
  const step = Number(scene.dataset.step || 0);
  scene._msTimer = setTimeout(() => { render(scene,(step + 1) % sequence.length); schedule(scene); },sequence[step]);
 };
 const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
   if (entry.isIntersecting) { visible.add(entry.target); positionPointer(entry.target); schedule(entry.target); }
   else { visible.delete(entry.target); stop(entry.target); }
  });
 },{threshold:.25});
 scenes.forEach(scene => { render(scene,reduced.matches ? durations[scene.dataset.msScene].length - 1 : 0); observer.observe(scene); });
 const sync = () => {
  document.body.classList.toggle('ms-paused',paused || reduced.matches);
  pause.hidden = reduced.matches;
  pause.setAttribute('aria-pressed',String(paused));
  pause.querySelector('[data-ms-pause-label]').textContent = paused ? 'Play animations' : 'Pause animations';
  pause.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
  scenes.forEach(scene => {
   if (reduced.matches) render(scene,durations[scene.dataset.msScene].length - 1);
   schedule(scene);
  });
  document.dispatchEvent(new CustomEvent('madereal:motion',{detail:{paused}}));
 };
 pause.addEventListener('click',() => { paused = !paused; sync(); });
 reduced.addEventListener('change',sync);
 document.addEventListener('visibilitychange',() => { scenes.forEach(schedule); carouselSync(); });
 new ResizeObserver(() => visible.forEach(positionPointer)).observe(document.body);
 sync();
})();
