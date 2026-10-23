(() => {
  'use strict';
  if (!document.body.classList.contains('menus-page')) return;
  window.HeroMenus?.init();
  window.MenuDemo?.init();
  const phone = window.matchMedia('(max-width:700px)');
  // Old campaign links still have #playground; send phones to the real menu examples.
  const routePhoneDemo = () => {
    if (!phone.matches || location.hash !== '#playground') return;
    history.replaceState(null, '', location.pathname + location.search + '#real-menus');
    document.getElementById('real-menus')?.scrollIntoView({ block: 'start' });
  };
  window.addEventListener('hashchange', routePhoneDemo);
  if (document.readyState === 'complete') routePhoneDemo();
  else window.addEventListener('load', routePhoneDemo, { once: true });
  phone.addEventListener?.('change', () => { if (phone.matches) routePhoneDemo(); else window.MenuDemo?.init(); });
  document.querySelector('#print-demo-menu')?.addEventListener('click', () => window.MenuDemo?.print());
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reveals = document.querySelectorAll('.home-experience .reveal');
  if ('IntersectionObserver' in window && !reduced.matches) {
    document.documentElement.classList.add('has-motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('is-visible'));
  reduced.addEventListener?.('change', event => {
    if (event.matches) {
      document.documentElement.classList.remove('has-motion');
      reveals.forEach(el => el.classList.add('is-visible'));
    }
  });
})();
