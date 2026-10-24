(() => {
 'use strict';
 if (!document.body.classList.contains('menus-story')) return;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const pause = document.querySelector('[data-ms-pause]');
 const scenes = [...document.querySelectorAll('[data-ms-scene]')];
 let paused = false;
 const visible = new Set();
 const text = (scene, selector, value) => { const el = scene.querySelector(selector); if (el && el.textContent !== value) el.textContent = value; };
 const render = (scene, step) => {
  scene.dataset.step = String(step);
  switch (scene.dataset.msScene) {
   case 'price':
    text(scene, '[data-ms-price-edit]', step >= 1 ? '8.00' : '7.50');
    text(scene, '[data-ms-price-guest]', step >= 3 ? '8.00' : '7.50');
    text(scene, '[data-ms-price-status]', step >= 3 ? '✓ Published. Customers see £8.00.' : 'Your current online menu');
    break;
   case 'sold': text(scene, '[data-ms-sold-label]', step === 2 ? 'Sold out. Hidden from the menu.' : step === 1 ? 'Switch availability off…' : 'Available on the menu'); break;
   case 'qr': {
    const examples = [['Today’s lunch','£9.50'],['New price','£10.00'],['Friday special','£12.50'],['Sunday lunch','£15.00']];
    text(scene, '[data-ms-qr-title]', examples[step][0]); text(scene, '[data-ms-qr-price]', examples[step][1]); break;
   }
   case 'filter': text(scene, '[data-ms-filter-label]', step === 1 || step === 2 ? 'Vegetarian' : 'All dishes'); break;
   case 'collections': {
    const examples = [['A good start.','Eggs on toast · £6.50'],['A lovely lunch.','Roast vegetable bowl · £11.50'],['Something to sip.','Flat white · £3.20']];
    text(scene, '[data-ms-collection-title]', examples[step][0]); text(scene, '[data-ms-collection-dish]', examples[step][1]); break;
   }
  }
 };
 const stop = scene => { clearTimeout(scene._msTimer); scene._msTimer = 0; };
 const schedule = scene => {
  stop(scene);
  if (paused || reduced.matches || document.hidden || !visible.has(scene)) return;
  const step = Number(scene.dataset.step || 0);
  const count = Number(scene.dataset.steps || 4);
  // Hold the useful result before replaying. A single small change per beat.
  scene._msTimer = setTimeout(() => { render(scene, (step + 1) % count); schedule(scene); }, step === count - 1 ? 3900 : 1900);
 };
 const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
   if (entry.isIntersecting) { visible.add(entry.target); schedule(entry.target); }
   else { visible.delete(entry.target); stop(entry.target); }
  });
 }, { threshold: 0.3 });
 scenes.forEach(scene => { render(scene, reduced.matches ? Number(scene.dataset.steps) - 1 : 0); observer.observe(scene); });
 const sync = () => {
  document.body.classList.toggle('ms-paused', paused || reduced.matches);
  pause.hidden = reduced.matches;
  pause.setAttribute('aria-pressed', String(paused));
  pause.querySelector('[data-ms-pause-label]').textContent = paused ? 'Play animations' : 'Pause animations';
  pause.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
  scenes.forEach(scene => { if (reduced.matches) render(scene, Number(scene.dataset.steps) - 1); schedule(scene); });
 };
 pause.addEventListener('click', () => { paused = !paused; sync(); });
 reduced.addEventListener('change', sync);
 document.addEventListener('visibilitychange', () => scenes.forEach(schedule));
 sync();
})();
