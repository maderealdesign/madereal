(() => {
  // Carry campaign attribution to the setup form without cookies or browser storage.
  const current = new URL(location.href);
  const fields = ['utm_source', 'utm_medium', 'utm_campaign'];
  for (const link of document.querySelectorAll('a[href]')) {
    const target = new URL(link.getAttribute('href'), current);
    if (target.origin !== current.origin || target.pathname !== '/menus/start/') continue;
    for (const name of fields) {
      const value = current.searchParams.get(name);
      if (value) target.searchParams.set(name, value.slice(0, 180));
    }
    link.href = target.pathname + target.search + target.hash;
  }
})();
