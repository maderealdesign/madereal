(() => {
  const finder = document.querySelector('[data-menu-finder]');
  if (!finder) return;
  const search = finder.querySelector('[data-menu-search]'), town = finder.querySelector('[data-menu-town]'), count = finder.querySelector('[data-menu-count]'), reset = finder.querySelector('[data-menu-reset]'), empty = finder.querySelector('[data-menu-empty]');
  const entries = [...finder.querySelectorAll('[data-menu-entry]')];
  const normalise = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replaceAll('&', ' and ').toLowerCase().replace(/\s+/g, ' ').trim();
  const filter = () => {
    const words = normalise(search.value).split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const entry of entries) {
      const match = words.every(word => entry.dataset.menuSearchText.includes(word)) && (!town.value || entry.dataset.menuLocality === town.value);
      entry.hidden = !match; if (match) visible++;
    }
    count.textContent = `${visible} ${visible === 1 ? 'menu' : 'menus'} ${words.length || town.value ? 'found' : 'to explore'}`;
    empty.hidden = visible !== 0; reset.hidden = !search.value && !town.value;
  };
  search.addEventListener('input', filter); town.addEventListener('change', filter);
  reset.addEventListener('click', () => { search.value = ''; town.value = ''; filter(); search.focus(); });
  filter();
})();
