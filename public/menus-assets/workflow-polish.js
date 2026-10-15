/* Three working examples; no scroll-driven selection or hidden preview tabs. */
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
  const announce = message => { byId('wf-update-status').textContent = message; };
  const currentMenu = () => order.filter(id => id !== 'breakfast' || baconAvailable).map(id => ({ ...categories[id], price: id === 'lunch' ? wrapPrice : categories[id].price }));
  function renderMenu() {
    const html = currentMenu().map(c => `<section class="wf-guest-category"><h5>${esc(c.name)}</h5><div class="wf-guest-dish"><span><span>${esc(c.dish)}</span><small>${esc(c.description)}</small></span><strong>${money(c.price)}</strong></div></section>`).join('');
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
  price.addEventListener('input', () => {
    if (!price.checkValidity() || price.value === '') { price.setAttribute('aria-invalid', 'true'); announce('Enter a price between £0.50 and £99.99.'); return; }
    price.removeAttribute('aria-invalid'); wrapPrice = Math.round(Number(price.value) * 100) / 100; renderMenu();
    announce(`Falafel wrap is now ${money(wrapPrice)} in both previews.`);
  });
  available.addEventListener('change', () => {
    baconAvailable = available.checked; renderMenu();
    announce(baconAvailable ? 'Bacon butty is back on the menu.' : 'Bacon butty hidden from both menus.');
  });
  byId('wf-reset-update').addEventListener('click', () => {
    order = ['breakfast', 'lunch', 'specials']; wrapPrice = 4.75; baconAvailable = true;
    price.value = '4.75'; price.removeAttribute('aria-invalid'); available.checked = true;
    renderCategories(); renderMenu(); announce('The example menu has been reset.');
  });
  byId('wf-login-form').addEventListener('submit', event => {
    event.preventDefault(); byId('wf-login-fields').hidden = true; byId('wf-login-success').hidden = false;
    byId('wf-login-status').textContent = 'Sample workspace open. Try the update example next.';
    byId('wf-login-success').querySelector('a').focus({ preventScroll: true });
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
})();
