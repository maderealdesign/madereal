/* Three working examples, with a calm demonstration when each enters view. */
(() => {
  'use strict';
  const root = document.querySelector('#how-it-works');
  if (!root || root.dataset.workflowReady) return;
  root.dataset.workflowReady = 'true';
  const byId = id => root.querySelector('#' + id);
  const money = value => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const categories = {
    breakfast: { name: 'Breakfast', dish: 'Bacon butty', description: 'Crispy bacon in a soft roll.', price: 3.95 },
    lunch: { name: 'Lunch', dish: 'Falafel wrap', description: 'Falafel, crunchy salad and hummus.', price: 4.75 },
    specials: { name: 'Today’s special', dish: 'Soup of the day', description: 'Homemade soup with warm bread.', price: 5.50 }
  };
  let order = ['breakfast', 'lunch', 'specials'], wrapPrice = 4.75, baconAvailable = true, dragging = null;
  const list = byId('wf-category-list'), price = byId('wf-price'), available = byId('wf-available');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const announce = message => { byId('wf-update-status').textContent = message; };
  const currentMenu = () => order.filter(id => id !== 'breakfast' || baconAvailable).map(id => ({ ...categories[id], price: id === 'lunch' ? wrapPrice : categories[id].price }));
  function renderMenu() {
    const html = currentMenu().map(c => `<section class="wf-guest-category" data-wf-guest="${esc(c.name)}"><h5>${esc(c.name)}</h5><div class="wf-guest-dish"><span><span>${esc(c.dish)}</span><small>${esc(c.description)}</small></span><strong data-wf-guest-price="${esc(c.dish)}">${money(c.price)}</strong></div></section>`).join('');
    byId('wf-guest-menu').innerHTML = html;
    byId('wf-publish-preview').innerHTML = html;
  }
  function renderCategories(focusId, direction) {
    list.innerHTML = order.map((id, i) => `<div class="wf-category-row" data-wf-drag="${id}"><button type="button" class="wf-grip" data-wf-drag-handle="${id}" aria-label="Drag ${esc(categories[id].name)}, or use arrow keys to move" title="Drag to reorder">⠿</button><span class="wf-category-name">${esc(categories[id].name)}</span><span class="wf-order-controls"><button type="button" data-wf-move="${id}" data-direction="up" aria-label="Move ${esc(categories[id].name)} up" ${i === 0 ? 'disabled' : ''}>↑</button><button type="button" data-wf-move="${id}" data-direction="down" aria-label="Move ${esc(categories[id].name)} down" ${i === order.length - 1 ? 'disabled' : ''}>↓</button></span></div>`).join('');
    if (focusId) {
      const next = direction ? list.querySelector(`[data-wf-move="${focusId}"][data-direction="${direction}"]:not(:disabled)`) : null;
      (next || list.querySelector(`[data-wf-drag-handle="${focusId}"]`))?.focus({ preventScroll: true });
    }
  }
  function move(id, target, focus = false, direction) {
    const from = order.indexOf(id);
    target = Math.max(0, Math.min(order.length - 1, target));
    if (from < 0 || from === target) return;
    order.splice(target, 0, order.splice(from, 1)[0]);
    renderCategories(focus ? id : null, direction); renderMenu();
    announce(`${categories[id].name} moved to position ${target + 1}. Both previews are up to date.`);
  }
  list.addEventListener('click', event => {
    const b = event.target.closest('[data-wf-move]');
    if (b) move(b.dataset.wfMove, order.indexOf(b.dataset.wfMove) + (b.dataset.direction === 'up' ? -1 : 1), true, b.dataset.direction);
  });
  list.addEventListener('keydown', event => {
    const b = event.target.closest('[data-wf-drag-handle]');
    if (!b || !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const id = b.dataset.wfDragHandle;
    move(id, event.key === 'Home' ? 0 : event.key === 'End' ? order.length - 1 : order.indexOf(id) + (event.key === 'ArrowUp' ? -1 : 1), true);
  });
  list.addEventListener('pointerdown', event => {
    const handle = event.target.closest('[data-wf-drag-handle]');
    if (!handle || event.button !== 0) return;
    event.preventDefault(); handle.setPointerCapture(event.pointerId);
    dragging = { id: handle.dataset.wfDragHandle, pointer: event.pointerId, startY: event.clientY, row: handle.closest('[data-wf-drag]'), target: order.indexOf(handle.dataset.wfDragHandle), centres: [...list.children].map(row => { const r = row.getBoundingClientRect(); return r.top + r.height / 2; }) };
    dragging.row.classList.add('is-dragging');
  });
  list.addEventListener('pointermove', event => {
    if (!dragging || dragging.pointer !== event.pointerId) return;
    event.preventDefault();
    dragging.target = dragging.centres.reduce((best, y, i, points) => Math.abs(event.clientY - y) < Math.abs(event.clientY - points[best]) ? i : best, 0);
    dragging.row.style.transform = `translateY(${event.clientY - dragging.startY}px)`;
    [...list.children].forEach((row, i) => row.classList.toggle('is-drop-target', i === dragging.target && row !== dragging.row));
  });
  function finishDrag(event, cancelled = false) {
    if (!dragging || dragging.pointer !== event.pointerId) return;
    const { id, target, row } = dragging; dragging = null; row.style.transform = '';
    [...list.children].forEach(item => item.classList.remove('is-dragging', 'is-drop-target'));
    if (!cancelled) move(id, target);
  }
  list.addEventListener('pointerup', event => finishDrag(event));
  list.addEventListener('pointercancel', event => finishDrag(event, true));
  function updatePrice() {
    if (!price.checkValidity() || price.value === '') { price.setAttribute('aria-invalid', 'true'); announce('Enter a price between £0.50 and £99.99.'); return; }
    price.removeAttribute('aria-invalid'); wrapPrice = Math.round(Number(price.value) * 100) / 100; renderMenu();
    announce(`Falafel wrap is now ${money(wrapPrice)} in both previews.`);
  }
  price.addEventListener('input', updatePrice);
  available.addEventListener('change', () => {
    baconAvailable = available.checked; renderMenu();
    announce(baconAvailable ? 'Bacon butty is back on the menu.' : 'Bacon butty hidden from both menus.');
  });
  byId('wf-reset-update').addEventListener('click', () => {
    order = ['breakfast', 'lunch', 'specials']; wrapPrice = 4.75; baconAvailable = true;
    price.value = '4.75'; price.removeAttribute('aria-invalid'); available.checked = true;
    renderCategories(); renderMenu(); announce('The example menu has been reset.');
  });
  function openWorkspace(userInitiated = false) {
    byId('wf-login-fields').hidden = true; byId('wf-login-success').hidden = false;
    byId('wf-login-status').textContent = 'Sample workspace open. Try the update example next.';
    if (userInitiated) byId('wf-login-success').querySelector('a').focus({ preventScroll: true });
  }
  byId('wf-login-form').addEventListener('submit', event => {
    event.preventDefault(); openWorkspace(true);
  });
  byId('wf-logout').addEventListener('click', () => {
    byId('wf-login-success').hidden = true; byId('wf-login-fields').hidden = false;
    byId('wf-login-status').textContent = 'Logged out of the sample workspace. Try again whenever you like.';
    byId('wf-login-enter').focus({ preventScroll: true });
  });
  byId('wf-copy-link').addEventListener('click', async () => {
    const field = byId('wf-share-link');
    try { await navigator.clipboard.writeText(field.value); byId('wf-publish-status').textContent = 'Demo menu link copied. Paste it into a message or a new tab.'; }
    catch (_) { field.focus({ preventScroll: true }); field.select(); byId('wf-publish-status').textContent = 'The link is selected. Press Ctrl+C or choose Copy to copy it.'; }
  });
  byId('wf-print').addEventListener('click', () => {
    const tab = window.open('', '_blank', 'width=850,height=1000');
    if (!tab) { byId('wf-publish-status').textContent = 'Allow the print-preview pop-up for this site, then press Print A4 again.'; return; }
    const html = currentMenu().map(c => `<section><h2>${esc(c.name)}</h2><article><div><h3>${esc(c.dish)}</h3><strong>${money(c.price)}</strong></div><p>${esc(c.description)}</p></article></section>`).join('');
    tab.document.open();
    tab.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Butty Shop — A4 example menu</title><style>@page{size:A4;margin:18mm}*{box-sizing:border-box}body{font:12pt/1.5 Arial,sans-serif;color:#20321b;max-width:174mm;margin:0 auto;padding:8mm 0}header{border-bottom:2px solid #20321b;padding-bottom:12mm}h1{font-size:30pt;margin:0;letter-spacing:-1px}header p{font-size:10pt;margin:2mm 0 0}section{margin:10mm 0;break-inside:avoid}h2{font-size:12pt;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid #a5b39b;padding-bottom:3mm;break-after:avoid}article div{display:flex;justify-content:space-between;gap:8mm}h3{font-size:14pt;margin:0}article p{font-size:10pt;color:#576650;margin:2mm 0}strong{white-space:nowrap}footer{border-top:1px solid #a5b39b;padding-top:5mm;font-size:9pt;color:#576650}.controls{padding:4mm;margin-bottom:8mm;background:#eef4e5;text-align:center}.controls button{border:0;border-radius:5px;background:#233d1d;color:white;padding:12px 18px;font-size:14px;cursor:pointer}@media print{.controls{display:none}body{max-width:none;padding:0}}</style></head><body><div class="controls"><button id="wf-print-ready">Print A4 / Save as PDF</button></div><header><h1>The Butty Shop</h1><p>Breakfast, lunch and today’s special</p></header>${html}<footer>Please tell staff about allergies before ordering.<br>MadeReal demonstration · fictional venue and sample dishes</footer></body></html>`);
    tab.document.close(); tab.document.getElementById('wf-print-ready').addEventListener('click', () => tab.print());
    byId('wf-publish-status').textContent = 'Your A4 preview is open with the current prices and menu order.';
  });
  renderCategories(); renderMenu();

  // The card keeps its original height when the sample login succeeds. This
  // also prevents the star field's section positions from shifting mid-story.
  function reserveLoginHeight() {
    const stage = root.querySelector('.wf-login-stage');
    const fields = byId('wf-login-fields'), success = byId('wf-login-success');
    const fieldsHidden = fields.hidden, successHidden = success.hidden;
    stage.style.minHeight = '';
    fields.hidden = false; success.hidden = true;
    const loginHeight = stage.getBoundingClientRect().height;
    fields.hidden = true; success.hidden = false;
    const successHeight = stage.getBoundingClientRect().height;
    fields.hidden = fieldsHidden; success.hidden = successHidden;
    stage.style.minHeight = `${Math.ceil(Math.max(loginHeight, successHeight))}px`;
  }
  reserveLoginHeight();
  document.fonts?.ready.then(reserveLoginHeight);
  addEventListener('resize', reserveLoginHeight, { passive: true });

  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const motionPaused = () => reducedMotion.matches || document.hidden ||
    Boolean(window.MadeRealMotion?.state?.paused) ||
    Boolean(document.querySelector('[data-motion-toggle][aria-pressed="true"]'));
  const states = ['login', 'update', 'publish'].map(name => {
    const section = byId(`workflow-${name}`);
    return { name, section, surfaces: [...section.querySelectorAll('.wf-demo,.wf-share-mobile')], visible: new Map(), completed: false, touched: false, run: null };
  });
  const aborted = () => new DOMException('Demonstration stopped', 'AbortError');
  function wait(ms, run) {
    return new Promise((resolve, reject) => {
      if (run.cancelled) { reject(aborted()); return; }
      const timer = setTimeout(() => { run.waits.delete(timer); resolve(); }, ms);
      run.waits.set(timer, reject);
    });
  }
  async function animate(element, frames, options, run) {
    if (run.cancelled) throw aborted();
    const animation = element.animate(frames, { easing: 'cubic-bezier(.22,.75,.25,1)', ...options });
    run.animations.add(animation);
    run.cleanups.push(() => animation.cancel());
    try { await animation.finished; }
    finally { run.animations.delete(animation); }
  }
  function mark(element, className, run) {
    element.classList.add(className);
    run.cleanups.push(() => element.classList.remove(className));
  }
  function stop(state) {
    const run = state.run;
    if (!run) return;
    run.cancelled = true;
    for (const [timer, reject] of run.waits) { clearTimeout(timer); reject(aborted()); }
    run.waits.clear();
    for (const animation of run.animations) animation.cancel();
    run.animations.clear();
    run.cleanups.splice(0).forEach(cleanup => cleanup());
    state.run = null;
    state.section.classList.remove('wf-autoplay-running');
    state.section.dataset.autoplay = state.touched ? 'manual' : 'stopped';
  }
  function addPointer(parent, run) {
    const pointer = document.createElement('span');
    pointer.className = 'wf-auto-pointer'; pointer.setAttribute('aria-hidden', 'true');
    pointer.innerHTML = '<svg viewBox="0 0 30 36" fill="none"><path d="m5 3 20 17-10 1 4 10-6 2-4-10-7 7Z" fill="#071016" stroke="#d4ff58" stroke-width="2.5" stroke-linejoin="round"/></svg>';
    parent.append(pointer); run.cleanups.push(() => pointer.remove());
    return pointer;
  }
  async function playLogin(run) {
    const email = byId('wf-login-email'), password = byId('wf-login-password'), button = byId('wf-login-enter');
    byId('wf-login-fields').hidden = false; byId('wf-login-success').hidden = true;
    byId('wf-login-status').textContent = 'Watch a sample login. No details needed.';
    mark(email, 'wf-auto-highlight', run);
    await wait(600, run);
    email.classList.remove('wf-auto-highlight'); mark(password, 'wf-auto-highlight', run);
    await wait(550, run);
    password.classList.remove('wf-auto-highlight'); mark(button, 'wf-auto-highlight', run);
    const pointer = addPointer(button, run);
    await animate(pointer, [{ opacity: 0, transform: 'translate(12px,12px)' }, { opacity: 1, transform: 'translate(0,0)' }], { duration: 420, fill: 'forwards' }, run);
    await wait(500, run);
    await animate(button, [{ transform: 'scale(1)' }, { transform: 'scale(.98)', offset: .45 }, { transform: 'scale(1)' }], { duration: 260 }, run);
    pointer.remove(); openWorkspace();
    await animate(byId('wf-login-success'), [{ opacity: .5, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500 }, run);
    byId('wf-login-status').textContent = 'Logged in. Now your team can update the menu.';
  }
  async function playUpdate(run) {
    // Only untouched examples auto-run; a customer's own edits are never reset.
    order = ['breakfast', 'lunch', 'specials']; wrapPrice = 4.75; baconAvailable = true;
    price.value = '4.75'; available.checked = true;
    renderCategories(); renderMenu();
    announce('Watch Lunch move to the top.');
    await wait(850, run);
    const row = list.querySelector('[data-wf-drag="lunch"]'), first = list.firstElementChild;
    const rowBox = row.getBoundingClientRect(), firstBox = first.getBoundingClientRect(), listBox = list.getBoundingClientRect();
    const ghost = row.cloneNode(true);
    ghost.classList.add('wf-auto-drag-ghost'); ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
    Object.assign(ghost.style, { top: `${rowBox.top - listBox.top}px`, left: `${rowBox.left - listBox.left}px`, width: `${rowBox.width}px`, height: `${rowBox.height}px` });
    list.append(ghost); run.cleanups.push(() => ghost.remove());
    mark(row, 'wf-auto-drag-source', run); addPointer(ghost, run);
    await animate(ghost, [{ transform: 'translate(0,0) rotate(0)' }, { transform: 'translate(7px,-6px) rotate(-1.5deg)' }], { duration: 350, fill: 'forwards' }, run);
    await wait(300, run);
    await Promise.all([
      animate(ghost, [{ transform: 'translate(7px,-6px) rotate(-1.5deg)' }, { transform: `translate(7px,${firstBox.top - rowBox.top - 6}px) rotate(-1.5deg)` }], { duration: 950, fill: 'forwards' }, run),
      animate(first, [{ transform: 'translateY(0)' }, { transform: `translateY(${rowBox.top - firstBox.top}px)` }], { duration: 950, fill: 'forwards' }, run)
    ]);
    const oldGuestPositions = new Map([...root.querySelectorAll('[data-wf-guest]')].map(element => [element.parentElement.id + element.dataset.wfGuest, element.getBoundingClientRect().top]));
    move('lunch', 0);
    const movedRow = list.firstElementChild;
    mark(movedRow, 'wf-auto-highlight', run);
    const settled = [animate(movedRow, [{ transform: 'translate(7px,-6px) rotate(-1.5deg)' }, { transform: 'translate(0,0) rotate(0)' }], { duration: 330 }, run)];
    for (const element of root.querySelectorAll('[data-wf-guest]')) {
      const before = oldGuestPositions.get(element.parentElement.id + element.dataset.wfGuest);
      if (before !== undefined && element.getBoundingClientRect().width) settled.push(animate(element, [{ transform: `translateY(${before - element.getBoundingClientRect().top}px)` }, { transform: 'translateY(0)' }], { duration: 650 }, run));
    }
    await Promise.all(settled);
    announce('Lunch is now first on the customer’s menu.');
    await wait(1350, run);
    movedRow.classList.remove('wf-auto-highlight');
    mark(price, 'wf-auto-highlight', run);
    announce('Now the falafel wrap price changes to £5.25.');
    await wait(750, run);
    price.value = '5.25'; updatePrice();
    const prices = [...root.querySelectorAll('[data-wf-guest-price="Falafel wrap"]')];
    prices.forEach(element => mark(element, 'wf-auto-price-result', run));
    await Promise.all(prices.filter(element => element.getBoundingClientRect().width).map(element => animate(element, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)', offset: .35 }, { transform: 'scale(1)' }], { duration: 650 }, run)));
    await wait(1450, run);
    announce('New order. New price. Already on the customer’s menu.');
  }
  async function playPublish(run) {
    const mobile = root.querySelector('.wf-share-mobile');
    const rows = mobile.getBoundingClientRect().width ? [...mobile.querySelectorAll('li')] : [...byId('workflow-publish').querySelectorAll('.wf-share-grid,.wf-publish-menu,.wf-share-actions')];
    await wait(450, run);
    for (const row of rows) {
      mark(row, 'wf-auto-share-active', run);
      await animate(row, [{ opacity: .6, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 550 }, run);
      await wait(550, run);
      row.classList.remove('wf-auto-share-active');
    }
  }
  function visible(state, minimum = .5) {
    return state.surfaces.some(surface => surface.getBoundingClientRect().width && (state.visible.get(surface) || 0) >= minimum);
  }
  async function start(state) {
    if (state.run || state.completed || state.touched || motionPaused() || !visible(state)) return;
    const run = { cancelled: false, waits: new Map(), animations: new Set(), cleanups: [] };
    state.run = run; state.section.classList.add('wf-autoplay-running'); state.section.dataset.autoplay = 'playing';
    try {
      await ({ login: playLogin, update: playUpdate, publish: playPublish })[state.name](run);
      if (!run.cancelled) { state.completed = true; state.section.dataset.autoplay = 'complete'; }
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Menu example animation:', error);
    } finally {
      run.cleanups.splice(0).forEach(cleanup => cleanup());
      // Fill effects must not pin old transforms when visitors use the controls.
      for (const animation of run.animations) animation.cancel();
      run.animations.clear();
      state.section.classList.remove('wf-autoplay-running');
      if (state.run === run) state.run = null;
    }
  }
  function sync() {
    for (const state of states) {
      if (motionPaused() || !visible(state, .10)) stop(state);
      else start(state);
    }
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = states.find(candidate => candidate.surfaces.includes(entry.target));
      state.visible.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
    }
    sync();
  }, { rootMargin: '-95px 0px -8% 0px', threshold: [0, .10, .25, .5, .75, 1] });
  for (const state of states) {
    state.surfaces.forEach(surface => observer.observe(surface));
    // Capture runs before manual controls, so a real visitor always takes over.
    const takeOver = event => {
      if (!event.isTrusted) return;
      if (event.type === 'pointerdown' && !event.target.closest('button,input,a,label,[role="button"]')) return;
      state.touched = true; stop(state); state.section.dataset.autoplay = 'manual';
    };
    state.surfaces.forEach(surface => {
      surface.addEventListener('pointerdown', takeOver, { capture: true, passive: true });
      surface.addEventListener('keydown', takeOver, true);
      surface.addEventListener('focusin', takeOver, true);
    });
  }
  // Observe the actual control state: the star-field script installs its click
  // listeners later, so a microtask from our own click listener can run too soon.
  const motionControlObserver = new MutationObserver(sync);
  document.querySelectorAll('[data-motion-toggle]').forEach(button => motionControlObserver.observe(button, { attributes: true, attributeFilter: ['aria-pressed'] }));
  reducedMotion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
})();
