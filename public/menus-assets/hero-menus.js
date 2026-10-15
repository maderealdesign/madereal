(() => {
  'use strict';
  // Captured from each venue's public menu. Prices here change only this preview.
  const examples = {
    alma: {
      name: 'The Alma Inn', subline: 'SERVING FOOD FROM LAND & SEA', title: 'Main menu', section: '02 / Nibbles',
      logo: '/menus-assets/assets/hero-menus/alma-logo.webp', hero: '/menus-assets/assets/hero-menus/alma-hero.webp', heroAlt: 'A seafood platter served at The Alma Inn',
      url: 'https://alma.madereal.uk/#menu-content', edit: 'olives',
      dishes: [
        { id: 'bread', title: 'Artisan Bread', description: 'Salted Butter', price: 6.25, tag: 'V · VEO', tagLabel: 'Vegetarian. Vegan option available on request.', vegetarian: true, vegan: false },
        { id: 'olives', title: 'Gordal Picante Pitted Green Olives', description: '', price: 5.50, tag: 'VE · GF', tagLabel: 'Vegan. Gluten free.', vegetarian: true, vegan: true },
        { id: 'padron', title: 'Padron Peppers', description: 'Sea Salt and Olive Oil', price: 5.95, tag: 'VE · GF', tagLabel: 'Vegan. Gluten free.', vegetarian: true, vegan: true }
      ]
    },
    trawden: {
      name: 'Trawden Arms', subline: 'YOUR VILLAGE. YOUR LOCAL.', title: 'Our menus', section: '01 / Starters',
      logo: '/menus-assets/assets/hero-menus/trawden-logo.webp', hero: '/menus-assets/assets/hero-menus/trawden-hero.webp', heroAlt: 'The Trawden Arms on Church Street',
      url: 'https://trawden-arms.madereal.uk/#menu', edit: 'soup',
      dishes: [
        { id: 'soup', title: 'Chef’s homemade soup', description: 'Homemade soup with a crusty roll. Please ask about butter and vegan preparation.', price: 6.95, tag: 'GFA · VEO', tagLabel: 'Gluten-free and vegan options on request.', vegetarian: false, vegan: false },
        { id: 'ribs', title: 'Aspen spare ribs', description: 'Truffle garlic butter, Parmesan and house truffle mayonnaise.', price: 7.45, tag: '', vegetarian: false, vegan: false },
        { id: 'mussels', title: 'Nduja mussels', description: 'Nduja moules marinière, sourdough and salted butter.', price: 7.45, tag: 'GFA', tagLabel: 'Gluten-free option on request.', vegetarian: false, vegan: false },
        { id: 'pie', title: 'Homemade cheese & onion pie', description: 'With chunky chips and baked beans.', price: 17.95, tag: 'V', tagLabel: 'Vegetarian.', vegetarian: true, vegan: false },
        { id: 'vegan-sausage', title: 'Vegan sausage & chips', description: 'With chunky chips and garden peas.', price: 17.95, tag: 'VE', tagLabel: 'Vegan.', vegetarian: true, vegan: true }
      ]
    },
    italy: {
      name: 'Little Italy', subline: 'TRULY AUTHENTIC · MADE WITH CARE', title: 'À La Carte & Lunch', section: 'Starters',
      logo: '/menus-assets/assets/hero-menus/little-italy-logo.webp', hero: '/menus-assets/assets/hero-menus/little-italy-hero.webp', heroAlt: 'Italian dishes at Little Italy in Colne',
      url: 'https://littleitaly.madereal.uk/#little-italy-menu', edit: 'tomato-bread',
      dishes: [
        { id: 'soup', title: 'Tomato Soup', description: 'With Parmesan and balsamic glaze.', price: 9, tag: 'GFA · VO', tagLabel: 'Gluten-free available. Vegetarian when served without Parmesan.', vegetarian: false, vegan: false },
        { id: 'cheesy-bread', title: 'Cheesy Garlic Bread', description: '', price: 9, tag: 'VO', tagLabel: 'Vegetarian when served without Parmesan.', vegetarian: false, vegan: false },
        { id: 'tomato-bread', title: 'Tomato Garlic Bread', description: '', price: 9, tag: 'V', tagLabel: 'Vegetarian.', vegetarian: true, vegan: false },
        { id: 'vegan-ravioli', title: 'Pea & Shallot Vegan Ravioli', description: 'Pea and shallot ravioli, basil and pistachio pesto, pea shoots and lemon zest.', price: null, tag: 'VE', tagLabel: 'Vegan. Ask the venue for the current price.', vegetarian: true, vegan: true }
      ]
    }
  };
  const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
  let initialized = false;

  function init() {
    if (initialized) return;
    const host = document.querySelector('.hero-multi-preview');
    if (!host) return;
    const dishContainer = host.querySelector('#hero-dishes');
    const priceInput = host.querySelector('#hero-price');
    const priceLabel = host.querySelector('#hero-price-label');
    const status = host.querySelector('#hero-publish-status');
    const priceButton = host.querySelector('#hero-publish');
    const venueButtons = [...host.querySelectorAll('[data-hero-venue]')];
    const filterButtons = [...host.querySelectorAll('[data-hero-filter]')];
    if (!dishContainer || !priceInput || !priceLabel || !status || !priceButton) return;
    initialized = true;
    let activeVenue = 'alma';
    let activeFilter = 'all';

    function render(highlight = false) {
      const example = examples[activeVenue];
      const visible = activeFilter === 'all' ? example.dishes.slice(0, 3) : example.dishes.filter(dish => dish[activeFilter]);
      host.querySelector('#hero-menu-section').textContent = activeFilter === 'all' ? example.section : activeFilter === 'vegan' ? 'Vegan dishes' : 'Vegetarian dishes';
      // Keep the edited price visible directly below the filters whenever it matches.
      const editedIndex = visible.findIndex(dish => dish.id === example.edit);
      if (editedIndex > 0) visible.unshift(visible.splice(editedIndex, 1)[0]);
      dishContainer.replaceChildren(...visible.map(dish => {
        const card = document.createElement('article');
        card.className = 'hero-dish' + (dish.id === example.edit ? ' is-edit-target' : '') + (highlight && dish.id === example.edit ? ' is-price-updated' : '');
        card.dataset.dish = dish.id;
        const copy = document.createElement('div');
        copy.className = 'hero-dish-copy';
        const top = document.createElement('div');
        top.className = 'hero-dish-topline';
        const title = document.createElement('h3');
        title.textContent = dish.title;
        const price = document.createElement('strong');
        price.className = 'hero-dish-price';
        price.textContent = dish.price === null ? 'Please ask' : money.format(dish.price);
        top.append(title, price);
        copy.append(top);
        if (dish.description) {
          const description = document.createElement('p');
          description.textContent = dish.description;
          copy.append(description);
        }
        if (dish.tag) {
          const tag = document.createElement('span');
          tag.className = 'hero-dish-tags';
          tag.textContent = dish.tag;
          tag.title = dish.tagLabel;
          tag.setAttribute('aria-label', dish.tagLabel);
          copy.append(tag);
        }
        card.append(copy);
        return card;
      }));
      filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.heroFilter === activeFilter)));
    }

    function selectVenue(key) {
      if (!examples[key]) return;
      activeVenue = key;
      activeFilter = 'all';
      const example = examples[key];
      host.dataset.exampleVenue = key;
      host.querySelector('#hero-venue-name').textContent = example.name;
      host.querySelector('#hero-venue-subline').textContent = example.subline;
      host.querySelector('#hero-menu-title').textContent = example.title;
      host.querySelector('#hero-menu-section').textContent = example.section;
      const logo = host.querySelector('#hero-venue-logo');
      logo.src = example.logo;
      logo.alt = example.name;
      const hero = host.querySelector('#hero-venue-photo');
      hero.src = example.hero;
      hero.alt = example.heroAlt;
      const link = host.querySelector('#hero-actual-menu');
      link.href = example.url;
      link.setAttribute('aria-label', `Open ${example.name}’s actual menu in a new tab`);
      venueButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.heroVenue === key)));
      const edited = example.dishes.find(dish => dish.id === example.edit);
      priceLabel.textContent = edited.title;
      priceInput.value = edited.price.toFixed(2);
      priceInput.setAttribute('aria-label', `Preview ${edited.title.toLowerCase()} price`);
      status.textContent = 'Try a local price change.';
      dishContainer.scrollTop = 0;
      render();
    }

    venueButtons.forEach(button => button.addEventListener('click', () => selectVenue(button.dataset.heroVenue)));
    filterButtons.forEach(button => button.addEventListener('click', () => {
      activeFilter = button.dataset.heroFilter;
      dishContainer.scrollTop = 0;
      render();
    }));
    function publishPrice(format = true) {
      if (!priceInput.checkValidity()) { if (format) priceInput.reportValidity(); return; }
      const value = Number(priceInput.value);
      if (!Number.isFinite(value) || value < 1 || value > 99) return;
      const example = examples[activeVenue];
      const edited = example.dishes.find(dish => dish.id === example.edit);
      edited.price = value;
      if (format) priceInput.value = value.toFixed(2);
      // If a dietary filter excludes the edited dish, show it again with its price.
      if (activeFilter !== 'all' && !edited[activeFilter]) activeFilter = 'all';
      dishContainer.scrollTop = 0;
      render(true);
      status.textContent = `✓ ${money.format(value)} in this preview only.`;
      const editor = host.querySelector('.mini-editor');
      editor.classList.remove('is-published');
      requestAnimationFrame(() => editor.classList.add('is-published'));
    }
    priceButton.addEventListener('click', () => publishPrice());
    priceInput.addEventListener('input', () => publishPrice(false));
    priceInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); publishPrice(); }
    });
    selectVenue(activeVenue);
  }
  window.HeroMenus = { init };
})();

