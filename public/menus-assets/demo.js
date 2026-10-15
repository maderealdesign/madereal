(function () {
  'use strict';

  const STORAGE_KEY = 'madereal-menus-willow-hearth-demo-v2';
  const TAGS = [
    { id: 'vegetarian', label: 'Vegetarian', short: 'V', description: 'Vegetarian dishes' },
    { id: 'vegan', label: 'Vegan', short: 'VG', description: 'Vegan dishes' },
    { id: 'gluten-option', label: 'Gluten-free option', short: 'GF*', description: 'Gluten-free option on request' },
    { id: 'vegan-option', label: 'Vegan option', short: 'VG*', description: 'Vegan option on request' }
  ];
  const SAMPLE = {
    venue: 'The Willow & Hearth',
    menus: [
      { id: 'main', name: 'All-day menu', categories: [
        { id: 'starters', name: 'To start', items: [
          { id: 'mushrooms', name: 'Mushrooms on sourdough', description: 'Creamy woodland mushrooms on toasted sourdough, finished with fresh herbs. Vegan option on request.', price: 9.50, available: true, special: false, tags: ['vegetarian', 'vegan-option'], photo: '', visual: 'sourdough' },
          { id: 'bowl', name: 'Roasted vegetable & grain bowl', description: 'Roasted seasonal vegetables, chickpeas and grains with lemon dressing. Gluten-free option on request.', price: 12.50, available: true, special: true, tags: ['vegan', 'gluten-option'], photo: '', visual: 'bowl' }
        ] },
        { id: 'mains', name: 'Something lovely', items: [
          { id: 'fish', name: 'Beer-battered fish & chips', description: 'Crisp golden battered fish, chunky chips, garden peas and tartare sauce.', price: 18.50, available: true, special: false, tags: [], photo: '', visual: 'fish' },
          { id: 'burger', name: 'The garden burger', description: 'A plant-based patty, crisp leaves, tomato relish and skin-on fries.', price: 15.00, available: false, special: false, tags: ['vegan'], photo: '', visual: '' }
        ] },
        { id: 'sweet', name: 'A sweet finish', items: [
          { id: 'pudding', name: 'Sticky toffee pudding', description: 'Warm date pudding, toffee sauce and vanilla ice cream. Gluten-free option on request.', price: 7.50, available: true, special: false, tags: ['vegetarian', 'gluten-option'], photo: '', visual: 'pudding' }
        ] }
      ] },
      { id: 'sunday', name: 'Sunday lunch', categories: [
        { id: 'roasts', name: 'The Sunday table', items: [
          { id: 'beef', name: 'Slow-roasted beef', description: 'Roast potatoes, Yorkshire pudding, seasonal vegetables and rich gravy.', price: 19.50, available: true, special: false, tags: [], photo: '', visual: '' },
          { id: 'nutroast', name: 'Our vegetable & nut roast', description: 'Herb-roasted potatoes, seasonal vegetables and plant-based gravy.', price: 17.00, available: true, special: false, tags: ['vegan'], photo: '', visual: '' }
        ] }
      ] }
    ]
  };

  let root, state, activeMenu = 'main', guestMenu = 'main', loggedIn = false;
  let guestFilters = new Set(), guestSearch = '', dragItem = null, timer, modalTrigger = null, storageWarningShown = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const currency = value => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(value) || 0);
  const cloneSample = () => JSON.parse(JSON.stringify(SAMPLE));
  const findMenu = id => state.menus.find(menu => menu.id === id) || state.menus[0];
  const findCategory = id => findMenu(activeMenu).categories.find(category => category.id === id);
  const findItem = id => {
    for (const menu of state.menus) for (const category of menu.categories) {
      const item = category.items.find(candidate => candidate.id === id);
      if (item) return { item, category, menu };
    }
    return null;
  };
  const icon = name => {
    const paths = {
      check: '<path d="m5 12 4 4 10-10"/>',
      arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
      up: '<path d="m6 15 6-6 6 6"/>',
      down: '<path d="m6 9 6 6 6-6"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
      photo: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8" cy="9" r="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/>',
      print: '<path d="M6 8V3h12v5M6 16H3v-8h18v8h-3M6 13h12v8H6z"/><path d="M17 11h1"/>',
      search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
      lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      leaf: '<path d="M20 3c-9 0-15 4-15 10a6 6 0 0 0 6 6c6 0 9-7 9-16Z"/><path d="m5 21 10-10"/>',
      reset: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>',
      logout: '<path d="M9 4H4v16h5m5-13 5 5-5 5m-5-5h10"/>'
    };
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || paths.check) + '</svg>';
  };

  function imageHTML(item, className) {
    if (item.photo) return `<img class="${className}" src="${esc(item.photo)}" alt="${esc(item.name)}" loading="lazy">`;
    if (['sourdough', 'bowl', 'fish', 'pudding'].includes(item.visual)) return `<div class="${className} md-sample-photo md-photo-${item.visual}" role="img" aria-label="Illustrative sample food photo for ${esc(item.name)}"></div>`;
    return `<div class="${className} md-no-photo" role="img" aria-label="No photo added for ${esc(item.name)}">${icon('photo')}</div>`;
  }

  function loadState() {
    try {
      const candidate = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const validItem = item => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.description === 'string' && Number.isFinite(item.price) && item.price >= 0 && item.price <= 9999 && typeof item.available === 'boolean' && typeof item.special === 'boolean' && Array.isArray(item.tags) && item.tags.every(tag => TAGS.some(entry => entry.id === tag)) && typeof item.photo === 'string' && (!item.photo || /^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(item.photo));
      if (candidate && typeof candidate.venue === 'string' && Array.isArray(candidate.menus) && candidate.menus.length && candidate.menus.every(menu => menu && typeof menu.id === 'string' && typeof menu.name === 'string' && Array.isArray(menu.categories) && menu.categories.every(category => category && typeof category.id === 'string' && typeof category.name === 'string' && Array.isArray(category.items) && category.items.every(validItem)))) return candidate;
    } catch (_) { /* Browser storage may be disabled. */ }
    return cloneSample();
  }

  function save(message = 'Your guest menu is up to date') {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {
      if (!storageWarningShown) { storageWarningShown = true; announce('Browser storage is unavailable. Your preview works, but changes will reset when you reload.'); }
    }
    const status = root.querySelector('.md-status');
    if (status) {
      status.innerHTML = icon('check') + '<span>' + esc(message) + '</span>';
      status.classList.add('md-status-flash');
      clearTimeout(timer);
      timer = setTimeout(() => status.classList.remove('md-status-flash'), 1400);
    }
    const categories = state.menus.flatMap(menu => menu.categories);
    const items = categories.flatMap(category => category.items);
    window.dispatchEvent(new CustomEvent('madereal-menus:demo-change', { detail: { items: items.length, categories: categories.length, available: items.filter(item => item.available).length, specials: items.filter(item => item.special).length, message } }));
  }

  function render() {
    root.className = 'md-demo';
    root.dataset.loginState = loggedIn ? 'editing' : 'login';
    root.innerHTML = `
      <div class="md-topline"><div class="md-topline-copy"><span class="md-demo-pill"><i></i> Try the menu manager</span><p>${loggedIn ? 'Your edits appear on the customer menu instantly.' : 'Press Log in to try changing the menu.'}</p></div><button type="button" class="md-reset" data-action="reset">${icon('reset')} Start again</button></div>
      <div class="md-split">
        <section class="md-staff" aria-label="Staff menu workspace">
          <div class="md-workspace-heading"><div class="md-workspace-mark">${icon(loggedIn ? 'leaf' : 'lock')}</div><div><span class="md-small-label">${loggedIn ? '1 / EDIT YOUR MENU' : '1 / LOG IN'}</span><h3>${loggedIn ? 'Edit your menu' : 'Staff login'}</h3></div><span class="md-workspace-role">Sample venue</span></div>
          <div class="md-staff-content">${loggedIn ? workspaceHTML() : loginHTML()}</div>
          <div class="md-workspace-bottom"><span class="md-status">${icon('check')}<span>${loggedIn ? 'Changes appear on the customer menu' : 'Ready to try? Press Log in.'}</span></span><span>Interactive example</span></div>
        </section>
        <section class="md-guest" aria-label="Live guest menu preview">
          <div class="md-guest-label"><span><i></i> 2 / CUSTOMER VIEW</span><span>Updates as you edit</span></div>
          <div class="md-phone"><div class="md-phone-speaker" aria-hidden="true"></div><div class="md-guest-content"></div></div>
        </section>
      </div>
      <p class="md-demo-disclosure">Fictional venue and sample dishes. This interactive preview saves changes only in this browser. No account is created, and nothing is published.</p>
      <div class="md-modal-root"></div>`;
    renderGuest();
  }

  function loginHTML() {
    return `<div class="md-login-shell">
      <div class="md-login-heading"><h4>Log in to your menu</h4><p class="md-login-description">Sample details are filled in. Just press Log in.</p></div>
      <form class="md-login-form" data-form="login" autocomplete="off" aria-describedby="md-login-help">
        <label class="md-login-field" for="md-login-email">Email address<input id="md-login-email" name="sample-email" type="email" value="team@yourvenue.co.uk" readonly autocomplete="off"></label>
        <label class="md-login-field" for="md-login-password">Password<input id="md-login-password" name="sample-password" type="password" value="menu-demo" readonly autocomplete="off"></label>
        <div class="md-login-submit-wrap"><button type="submit" class="md-primary">Log in ${icon('arrow')}</button><span class="md-login-nudge" aria-hidden="true"><span>Press here</span><svg viewBox="0 0 110 64" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M99 8c-18-6-36-3-38 9-2 11 15 15 11 25-4 11-27 12-56 3"/><path d="m27 35-13 10 14 8"/></svg></span></div>
        <p id="md-login-help" class="md-form-note">Sample login · no account needed.</p>
      </form></div>`;
  }

  function workspaceHTML() {
    const menu = findMenu(activeMenu);
    return `<div class="md-workspace-toolbar"><div class="md-menu-tabs" role="tablist" aria-label="Menus">${state.menus.map(entry => `<button role="tab" aria-selected="${entry.id === activeMenu}" class="md-tab ${entry.id === activeMenu ? 'is-active' : ''}" type="button" data-action="staff-menu" data-id="${esc(entry.id)}">${esc(entry.name)}</button>`).join('')}</div><button type="button" class="md-icon-button" data-action="logout" aria-label="Log out of the demo">${icon('logout')}<span>Log out</span></button></div>
      <div class="md-editor-guide"><strong>Try changing a price.</strong> <span>The customer menu updates straight away.</span></div>
      <div class="md-workspace-intro"><p>MENU CATEGORIES</p><button type="button" class="md-text-button" data-action="add-category">${icon('plus')} Add category</button></div>
      <div class="md-categories">${menu.categories.map((category, categoryIndex) => categoryHTML(category, categoryIndex, menu.categories.length)).join('')}</div>
      <div class="md-workspace-actions"><button class="md-primary md-add-dish" type="button" data-action="add-dish">${icon('plus')} Add a dish</button><button type="button" class="md-secondary" data-action="print">${icon('print')} Print A4 menu</button></div>
      <p class="md-keyboard-note">Move dishes and categories with the drag handles or ↑ ↓ buttons.</p>`;
  }

  function categoryHTML(category, categoryIndex, categoryCount) {
    return `<section class="md-category" data-category="${esc(category.id)}" draggable="true" aria-label="Category: ${esc(category.name)}">
      <div class="md-category-heading"><span class="md-grip md-category-grip" aria-hidden="true" title="Drag this category">${icon('grip')}</span><label class="md-category-title"><span class="md-field-label">Category</span><input aria-label="Category name" class="md-category-name" value="${esc(category.name)}" data-field="category-name" data-id="${esc(category.id)}" maxlength="60"></label><div class="md-order-buttons"><span class="md-order-label">Move</span><button type="button" data-action="category-up" data-id="${esc(category.id)}" aria-label="Move ${esc(category.name)} category up" ${categoryIndex === 0 ? 'disabled' : ''}>${icon('up')}</button><button type="button" data-action="category-down" data-id="${esc(category.id)}" aria-label="Move ${esc(category.name)} category down" ${categoryIndex === categoryCount - 1 ? 'disabled' : ''}>${icon('down')}</button></div></div>
      <div class="md-item-list">${category.items.map((item, itemIndex) => itemHTML(item, itemIndex, category.items.length)).join('') || '<p class="md-empty-category">A new home for something delicious. Add a dish below.</p>'}</div>
    </section>`;
  }

  function itemHTML(item, index, count) {
    return `<article class="md-item ${!item.available ? 'is-unavailable' : ''}" data-item="${esc(item.id)}" draggable="true">
      <div class="md-item-main"><span class="md-grip" aria-hidden="true" title="Drag this dish">${icon('grip')}</span><label class="md-photo-control">${imageHTML(item, 'md-item-photo')}<span>${icon('photo')}</span><small class="md-photo-caption">Photo</small><input type="file" accept="image/jpeg,image/png,image/webp" data-photo="${esc(item.id)}" aria-label="Add a photo of ${esc(item.name)}"></label><label class="md-item-name-wrap"><span class="md-field-label">Dish name</span><input class="md-item-name" aria-label="Dish name" data-field="item-name" data-id="${esc(item.id)}" value="${esc(item.name)}" maxlength="90"></label><label class="md-price"><span class="md-field-label" aria-hidden="true">Price</span><span class="md-sr-only">Price for ${esc(item.name)} in pounds</span><span class="md-price-value"><span aria-hidden="true">£</span><input type="number" min="0" max="9999" step="0.01" value="${Number(item.price).toFixed(2)}" data-field="price" data-id="${esc(item.id)}"></span></label></div>
      <div class="md-item-bottom"><div class="md-item-switches"><button type="button" class="md-switch ${item.available ? 'is-on' : ''}" aria-pressed="${item.available}" aria-label="${item.available ? 'Mark' : 'Put'} ${esc(item.name)} ${item.available ? 'sold out' : 'back on the menu'}" data-action="availability" data-id="${esc(item.id)}"><i></i>${item.available ? 'On menu' : 'Sold out'}</button><button type="button" class="md-special ${item.special ? 'is-active' : ''}" aria-pressed="${item.special}" data-action="special" data-id="${esc(item.id)}"><span aria-hidden="true">✦</span> Today’s special</button><button type="button" class="md-edit-button" data-action="edit-dish" data-id="${esc(item.id)}">Edit dish ${icon('arrow')}</button></div><div class="md-order-buttons"><span class="md-order-label">Move</span><button type="button" data-action="item-up" data-id="${esc(item.id)}" aria-label="Move ${esc(item.name)} up" ${index === 0 ? 'disabled' : ''}>${icon('up')}</button><button type="button" data-action="item-down" data-id="${esc(item.id)}" aria-label="Move ${esc(item.name)} down" ${index === count - 1 ? 'disabled' : ''}>${icon('down')}</button></div></div>
    </article>`;
  }

  function renderWorkspace() {
    const content = root.querySelector('.md-staff-content');
    if (content) content.innerHTML = workspaceHTML();
  }

  function renderGuest() {
    const container = root.querySelector('.md-guest-content');
    if (!container) return;
    const menu = findMenu(guestMenu);
    const categories = menu.categories.map(category => ({ ...category, items: category.items.filter(item => item.available && matches(item)) })).filter(category => category.items.length);
    container.innerHTML = `<header class="md-menu-header"><div class="md-venue-symbol">${icon('leaf')}</div><p>A GOOD PLACE TO GATHER</p><h3>${esc(state.venue)}</h3><span>Fresh food. A warm welcome.</span></header>
      <div class="md-guest-controls"><div class="md-guest-menu-tabs" role="tablist" aria-label="Guest menu">${state.menus.map(entry => `<button type="button" role="tab" aria-selected="${entry.id === guestMenu}" class="${entry.id === guestMenu ? 'is-active' : ''}" data-action="guest-menu" data-id="${esc(entry.id)}">${esc(entry.name)}</button>`).join('')}</div><label class="md-search">${icon('search')}<input type="search" placeholder="Find something delicious…" aria-label="Search guest menu" data-field="guest-search" value="${esc(guestSearch)}"></label><span class="md-filter-label">MAKE IT YOUR MENU</span><div class="md-dietary-filters">${TAGS.map(tag => `<button type="button" class="md-filter ${guestFilters.has(tag.id) ? 'is-active' : ''}" aria-pressed="${guestFilters.has(tag.id)}" title="${esc(tag.description)}" data-action="filter" data-id="${tag.id}"><span class="md-filter-check">${icon('check')}</span>${tag.label}${tag.id.includes('option') ? '*' : ''}</button>`).join('')}</div>${guestFilters.size || guestSearch ? '<button type="button" class="md-clear-filters" data-action="clear-filters">Clear filters</button>' : ''}<p class="md-dietary-note">* Options are available on request. Dietary filters are a guide. Please tell staff about allergies before ordering.</p></div>
      <div class="md-guest-dishes">${categories.length ? categories.map(category => `<section class="md-guest-category"><h4>${esc(category.name)}</h4>${category.items.map(guestItemHTML).join('')}</section>`).join('') : '<div class="md-no-results">' + icon('leaf') + '<h4>Nothing here just yet.</h4><p>Try another menu or clear a filter.</p></div>'}</div>
      <footer class="md-guest-footer"><span>Made with care. Served with a smile.</span><small>Sample menu · fictional venue</small><button type="button" data-action="print">${icon('print')} Print this menu</button></footer>`;
  }

  function matches(item) {
    const textMatches = !guestSearch || (item.name + ' ' + item.description).toLowerCase().includes(guestSearch.toLowerCase());
    const filterMatches = !guestFilters.size || [...guestFilters].every(tag => item.tags.includes(tag) || (tag === 'vegetarian' && item.tags.includes('vegan')));
    return textMatches && filterMatches;
  }

  function guestItemHTML(item) {
    return `<article class="md-guest-dish">${imageHTML(item, 'md-guest-food')}<div class="md-guest-dish-copy">${item.special ? '<span class="md-guest-special">✦ TODAY’S SPECIAL</span>' : ''}<div class="md-guest-dish-title"><h5>${esc(item.name)}</h5><span>${currency(item.price)}</span></div><p>${esc(item.description)}</p><div class="md-tag-list">${TAGS.filter(tag => item.tags.includes(tag.id)).map(tag => `<span title="${esc(tag.description)}">${tag.short}</span>`).join('')}</div></div></article>`;
  }

  function announce(message) {
    const existing = root.querySelector('.md-announcement');
    if (existing) existing.remove();
    const element = document.createElement('div');
    element.className = 'md-announcement'; element.setAttribute('role', 'status'); element.textContent = message;
    root.appendChild(element);
    setTimeout(() => element.remove(), 3400);
  }

  function renderAfterChange(message) {
    const focused = document.activeElement;
    const action = focused?.dataset.action, id = focused?.dataset.id;
    const scrollPositions = ['.md-categories', '.md-staff-content', '.md-guest-content'].map(selector => [selector, root.querySelector(selector)?.scrollTop || 0]);
    renderWorkspace(); renderGuest(); save(message);
    scrollPositions.forEach(([selector, top]) => { const pane = root.querySelector(selector); if (pane) pane.scrollTop = top; });
    if (action) {
      const candidates = [...root.querySelectorAll('[data-action]')];
      let replacement = candidates.find(element => element.dataset.action === action && element.dataset.id === id);
      if (replacement?.disabled) replacement = candidates.find(element => element.dataset.id === id && !element.disabled && element.dataset.action.startsWith(action.split('-')[0] + '-'));
      if (replacement) replacement.focus({ preventScroll: true });
    }
  }

  function reorder(list, id, delta) {
    const index = list.findIndex(entry => entry.id === id), destination = index + delta;
    if (index < 0 || destination < 0 || destination >= list.length) return;
    const moved = list.splice(index, 1)[0]; list.splice(destination, 0, moved);
    renderAfterChange('Menu order updated');
    announce(moved.name + ' moved ' + (delta < 0 ? 'up' : 'down'));
  }

  function showDishForm(itemId) {
    modalTrigger = document.activeElement;
    const found = itemId ? findItem(itemId) : null;
    const item = found?.item;
    root.querySelector('.md-modal-root').innerHTML = `<div class="md-modal-backdrop"><section class="md-dialog" role="dialog" aria-modal="true" aria-labelledby="md-dialog-title"><button type="button" class="md-dialog-close" data-action="close-modal" aria-label="Close dish form">${icon('close')}</button><span class="md-small-label">DISH DETAILS</span><h3 id="md-dialog-title">${item ? 'Edit dish' : 'Add a dish'}</h3><form data-form="dish" data-edit="${esc(itemId || '')}"><label>Dish name<input type="text" name="name" value="${esc(item?.name || '')}" maxlength="90" placeholder="e.g. Lemon & herb sea bass" required></label><div class="md-form-grid"><label>Category<select name="category">${findMenu(activeMenu).categories.map(category => `<option value="${esc(category.id)}" ${found?.category.id === category.id ? 'selected' : ''}>${esc(category.name)}</option>`).join('')}</select></label><label>Price (£)<input type="number" name="price" min="0" max="9999" step="0.01" value="${item ? Number(item.price).toFixed(2) : ''}" placeholder="16.50" required></label></div><label>Description<textarea name="description" rows="3" maxlength="400" placeholder="Ingredients, sides and anything customers should know.">${esc(item?.description || '')}</textarea></label><fieldset class="md-form-tags"><legend>Dietary information confirmed by your venue</legend>${TAGS.map(tag => `<label><input type="checkbox" name="tags" value="${tag.id}" ${item?.tags.includes(tag.id) ? 'checked' : ''}> ${tag.description}</label>`).join('')}</fieldset><p class="md-form-note">Dietary labels describe the dish or an option offered by your team. They do not confirm suitability for an allergy.</p><label class="md-form-checkbox"><input type="checkbox" name="special" ${item?.special ? 'checked' : ''}> Make this a special</label><button type="submit" class="md-primary">${item ? 'Save dish' : 'Add to the menu'} ${icon('arrow')}</button></form></section></div>`;
    document.body.classList.add('md-modal-open');
    root.querySelector('.md-dialog input[name="name"]').focus();
  }

  function closeModal() {
    root.querySelector('.md-modal-root').innerHTML = ''; document.body.classList.remove('md-modal-open');
    if (modalTrigger && document.contains(modalTrigger)) modalTrigger.focus();
    modalTrigger = null;
  }

  function printMenu() {
    const menu = findMenu(guestMenu), items = menu.categories.flatMap(category => category.items).filter(item => item.available);
    if (!items.length) { announce('Make a dish available before printing this menu.'); return; }
    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (!printWindow) { announce('Allow pop-ups for this site to open the printable A4 menu.'); return; }
    const content = menu.categories.filter(category => category.items.some(item => item.available)).map(category => `<section><h2>${esc(category.name)}</h2>${category.items.filter(item => item.available).map(item => `<article><div><h3>${esc(item.name)}${item.special ? ' <small>Special</small>' : ''}</h3><strong>${currency(item.price)}</strong></div><p>${esc(item.description)}</p><span>${TAGS.filter(tag => item.tags.includes(tag.id)).map(tag => tag.description).join(' · ')}</span></article>`).join('')}</section>`).join('');
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(state.venue)} — ${esc(menu.name)} — demonstration menu</title><style>@page{size:A4;margin:17mm}*{box-sizing:border-box}body{color:#233c32;font-family:Arial,sans-serif;font-size:10pt;line-height:1.5;max-width:180mm;margin:0 auto}header{text-align:center;border-bottom:1px solid #b7c3b5;padding:12px 0 20px;margin-bottom:22px}header p{font-size:8pt;letter-spacing:2px;margin:0}h1{font-family:Georgia,serif;font-size:28pt;font-weight:normal;margin:5px 0}header span{font-size:11pt}section{margin-bottom:20px}h2{font-family:Georgia,serif;font-size:18pt;font-weight:normal;border-bottom:1px solid #dce3da;padding-bottom:6px;break-after:avoid}article{break-inside:avoid;margin-bottom:15px}article div{display:flex;justify-content:space-between;gap:20px}h3{font-size:11pt;margin:0;font-weight:600}strong{white-space:nowrap;font-size:11pt}article p{margin:3px 0;color:#526256}article span{font-size:8pt;color:#657760}small{font-family:Arial,sans-serif;font-size:8pt;font-weight:normal;margin-left:7px}footer{border-top:1px solid #dce3da;margin-top:24px;padding-top:12px;font-size:8pt;color:#526256;text-align:center}.print-controls{padding:12px;text-align:center;background:#f0f4eb;border-radius:5px;margin:15px 0}.print-controls button{background:#315b46;color:white;border:0;border-radius:5px;padding:10px 20px;cursor:pointer;font-size:14px}@media print{.print-controls{display:none}body{max-width:none}}</style></head><body><div class="print-controls"><button id="md-print-trigger">Print A4 menu / Save as PDF</button></div><header><p>A GOOD PLACE TO GATHER</p><h1>${esc(state.venue)}</h1><span>${esc(menu.name)}</span></header>${content}<footer><p>Please tell staff about allergies before ordering. Options are available on request.</p><p>Demonstration menu · fictional venue and sample dishes</p></footer></body></html>`);
    printWindow.document.close();
    printWindow.document.getElementById('md-print-trigger').addEventListener('click', () => printWindow.print());
    printWindow.focus();
    announce('Your A4 menu is ready in a new tab.');
  }

  function handleClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button || !root.contains(button)) return;
    const action = button.dataset.action, id = button.dataset.id;
    if (action === 'reset') {
      state = cloneSample(); activeMenu = guestMenu = 'main'; guestFilters.clear(); guestSearch = ''; loggedIn = false;
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) { }
      closeModal(); render(); announce('The demo is back to its original menu.');
    } else if (action === 'logout') { loggedIn = false; render(); }
    else if (action === 'staff-menu') { activeMenu = guestMenu = id; guestFilters.clear(); guestSearch = ''; renderWorkspace(); renderGuest(); }
    else if (action === 'guest-menu') { guestMenu = id; renderGuest(); }
    else if (action === 'availability') { const found = findItem(id); if (found) { found.item.available = !found.item.available; renderAfterChange(found.item.available ? 'Dish is back on the guest menu' : 'Out-of-stock dish hidden from the guest menu'); } }
    else if (action === 'special') { const found = findItem(id); if (found) { found.item.special = !found.item.special; renderAfterChange('Your specials are up to date'); } }
    else if (action === 'category-up' || action === 'category-down') reorder(findMenu(activeMenu).categories, id, action.endsWith('up') ? -1 : 1);
    else if (action === 'item-up' || action === 'item-down') { const found = findItem(id); if (found) reorder(found.category.items, id, action.endsWith('up') ? -1 : 1); }
    else if (action === 'add-category') {
      const menu = findMenu(activeMenu), newId = 'category-' + Date.now();
      menu.categories.push({ id: newId, name: 'New category', items: [] }); renderAfterChange('New category added');
      const input = root.querySelector(`[data-field="category-name"][data-id="${newId}"]`); input.focus(); input.select();
    } else if (action === 'add-dish') showDishForm();
    else if (action === 'edit-dish') showDishForm(id);
    else if (action === 'close-modal') closeModal();
    else if (action === 'filter') { guestFilters.has(id) ? guestFilters.delete(id) : guestFilters.add(id); renderGuest(); }
    else if (action === 'clear-filters') { guestFilters.clear(); guestSearch = ''; renderGuest(); }
    else if (action === 'print') printMenu();
  }

  function handleInput(event) {
    const field = event.target.dataset.field, id = event.target.dataset.id;
    if (!field) return;
    if (field === 'guest-search') {
      const selection = event.target.selectionStart;
      guestSearch = event.target.value; renderGuest();
      const input = root.querySelector('[data-field="guest-search"]'); input.focus(); if (selection !== null) input.setSelectionRange(selection, selection);
      return;
    }
    if (!loggedIn) return;
    if (field === 'category-name') { const category = findCategory(id); if (category) category.name = event.target.value; }
    else { const found = findItem(id); if (!found) return;
      if (field === 'item-name') found.item.name = event.target.value;
      else if (field === 'price') {
        const price = Number(event.target.value);
        if (event.target.value === '' || !Number.isFinite(price) || price < 0 || price > 9999) return;
        found.item.price = Math.round(price * 100) / 100;
      }
    }
    renderGuest(); save(field === 'price' ? 'Price updated on the guest menu' : 'Your guest menu is up to date');
  }

  function handleSubmit(event) {
    const form = event.target.closest('form[data-form]');
    if (!form) return;
    event.preventDefault();
    if (form.dataset.form === 'login') { loggedIn = true; render(); announce('Welcome in. Try changing a price or hiding a dish.'); return; }
    if (form.dataset.form !== 'dish' || !loggedIn || !form.reportValidity()) return;
    const data = new FormData(form), name = String(data.get('name') || '').trim(), price = Number(data.get('price'));
    if (!name) { const input = form.querySelector('input[name="name"]'); input.setCustomValidity('Please give your dish a name.'); input.reportValidity(); input.addEventListener('input', () => input.setCustomValidity(''), { once: true }); return; }
    if (!Number.isFinite(price) || price < 0 || price > 9999) return;
    const category = findCategory(data.get('category')); if (!category) return;
    const existing = form.dataset.edit ? findItem(form.dataset.edit) : null;
    const update = { name, description: String(data.get('description') || '').trim(), price, tags: data.getAll('tags').filter(tag => TAGS.some(entry => entry.id === tag)), special: data.get('special') === 'on' };
    if (existing) {
      Object.assign(existing.item, update);
      if (existing.category.id !== category.id) { existing.category.items = existing.category.items.filter(item => item.id !== existing.item.id); category.items.push(existing.item); }
    } else category.items.push({ id: 'dish-' + Date.now(), ...update, available: true, photo: '', visual: '' });
    closeModal(); renderAfterChange(existing ? 'Dish details updated' : 'New dish added to the guest menu');
    announce(existing ? 'Your changes are on the guest menu.' : name + ' is now on the guest menu.');
  }

  async function handlePhoto(event) {
    const id = event.target.dataset.photo;
    if (!id || !loggedIn) return;
    const file = event.target.files?.[0]; if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { announce('Choose a JPEG, PNG or WebP photo.'); return; }
    if (file.size > 6 * 1024 * 1024) { announce('Please choose an image smaller than 6 MB for this demo.'); return; }
    const found = findItem(id); if (!found) return;
    try {
      const url = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
      const img = await new Promise((resolve, reject) => { const candidate = new Image(); candidate.onload = () => resolve(candidate); candidate.onerror = reject; candidate.src = url; });
      const scale = Math.min(1, 700 / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas'); canvas.width = Math.round(img.naturalWidth * scale); canvas.height = Math.round(img.naturalHeight * scale);
      const context = canvas.getContext('2d'); if (!context) throw new Error('Image preview unavailable');
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      found.item.photo = canvas.toDataURL('image/jpeg', 0.8);
      renderAfterChange('Dish photo updated on the guest menu'); announce('Your photo is on the guest menu.');
    } catch (_) { announce('This image could not be opened. Please try another photo.'); }
  }

  function handleDragStart(event) {
    if (!loggedIn || event.target.closest('input, button, label, textarea, select')) { event.preventDefault(); return; }
    const item = event.target.closest('[data-item]'), category = event.target.closest('[data-category]');
    if (item) dragItem = { type: 'item', id: item.dataset.item };
    else if (category) dragItem = { type: 'category', id: category.dataset.category };
    else return;
    event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', dragItem.id);
    (item || category).classList.add('md-dragging');
  }

  function handleDragOver(event) {
    if (!dragItem) return;
    const target = dragItem.type === 'item' ? event.target.closest('[data-item], [data-category]') : event.target.closest('[data-category]');
    if (!target) return;
    event.preventDefault(); event.dataTransfer.dropEffect = 'move';
    root.querySelectorAll('.md-drop-target').forEach(element => element.classList.remove('md-drop-target'));
    target.classList.add('md-drop-target');
  }

  function handleDrop(event) {
    if (!dragItem) return;
    event.preventDefault();
    let changed = false;
    if (dragItem.type === 'category') {
      const target = event.target.closest('[data-category]');
      if (target && target.dataset.category !== dragItem.id) {
        const list = findMenu(activeMenu).categories, from = list.findIndex(entry => entry.id === dragItem.id);
        const targetId = target.dataset.category, targetRect = target.getBoundingClientRect();
        const insertAfter = event.clientY >= targetRect.top + targetRect.height / 2;
        if (from >= 0 && list.some(entry => entry.id === targetId)) {
          const previousOrder = JSON.stringify(list.map(entry => entry.id));
          const entry = list.splice(from, 1)[0];
          const targetIndex = list.findIndex(candidate => candidate.id === targetId);
          list.splice(targetIndex + (insertAfter ? 1 : 0), 0, entry);
          changed = previousOrder !== JSON.stringify(list.map(candidate => candidate.id));
        }
      }
    } else {
      const targetItem = event.target.closest('[data-item]'), targetCategory = event.target.closest('[data-category]'), found = findItem(dragItem.id);
      if (found && targetCategory && (!targetItem || targetItem.dataset.item !== dragItem.id)) {
        const destination = findCategory(targetCategory.dataset.category);
        if (destination) {
          const previousCategoryId = found.category.id;
          const previousOrder = JSON.stringify(found.category.items.map(item => item.id));
          const targetRect = targetItem?.getBoundingClientRect();
          const insertAfter = targetRect && event.clientY >= targetRect.top + targetRect.height / 2;
          found.category.items = found.category.items.filter(item => item.id !== dragItem.id);
          const targetIndex = targetItem ? destination.items.findIndex(item => item.id === targetItem.dataset.item) : -1;
          const insertionIndex = targetIndex >= 0 ? targetIndex + (insertAfter ? 1 : 0) : destination.items.length;
          destination.items.splice(insertionIndex, 0, found.item);
          changed = previousCategoryId !== destination.id || previousOrder !== JSON.stringify(destination.items.map(item => item.id));
        }
      }
    }
    dragItem = null;
    root.querySelectorAll('.md-dragging, .md-drop-target').forEach(element => element.classList.remove('md-dragging', 'md-drop-target'));
    if (changed) { renderAfterChange('Menu order updated'); announce('Your guest menu order has updated.'); }
  }

  function handleKeydown(event) {
    if (!root.querySelector('.md-dialog')) return;
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); return; }
    if (event.key === 'Tab') {
      const focusable = [...root.querySelectorAll('.md-dialog button, .md-dialog input, .md-dialog select, .md-dialog textarea')].filter(element => !element.disabled);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }

  function init() {
    if (window.matchMedia('(max-width:700px)').matches) return;
    const mount = document.getElementById('menu-demo');
    if (!mount || mount.dataset.demoInitialized) return;
    root = mount; root.dataset.demoInitialized = 'true'; state = loadState();
    activeMenu = guestMenu = state.menus[0].id;
    root.addEventListener('click', handleClick); root.addEventListener('input', handleInput);
    root.addEventListener('submit', handleSubmit); root.addEventListener('change', handlePhoto);
    root.addEventListener('dragstart', handleDragStart); root.addEventListener('dragover', handleDragOver); root.addEventListener('drop', handleDrop);
    root.addEventListener('dragend', () => { dragItem = null; root.querySelectorAll('.md-dragging, .md-drop-target').forEach(element => element.classList.remove('md-dragging', 'md-drop-target')); });
    root.addEventListener('keydown', handleKeydown);
    render();
  }

  window.MenuDemo = { init, print: () => { init(); if (root) printMenu(); }, open: () => { init(); if (root) { loggedIn = true; render(); } } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
