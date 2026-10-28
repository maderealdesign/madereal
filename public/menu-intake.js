(() => {
  const form = document.querySelector('[data-menu-intake]');
  if (!form) return;
  const field = name => form.elements.namedItem(name);
  const set = (name, value) => { const input = field(name); if (input) input.value = value; };
  const params = new URLSearchParams(location.search);
  set('source_page', location.pathname);
  set('landing_page', location.pathname);
  try { set('referrer', document.referrer ? new URL(document.referrer).origin : ''); } catch {}
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) set(key, (params.get(key) || '').slice(0, 180));

  if (params.get('package') === 'menu-and-website') field('package').value = 'menu-and-website';
  const summaryTitle = form.querySelector('[data-mi-package-title]');
  const summaryNote = form.querySelector('[data-mi-package-note]');
  const updatePackage = () => {
    const website = field('package').value === 'menu-and-website';
    summaryTitle.textContent = website ? 'Menu: free first month, then £19/month per venue. Website: £197 once.' : 'Online menu: free first month, then £19/month per venue.';
    summaryNote.textContent = website ? 'Website hosting is included while your £19 menu plan stays active. Domains and business email are separate.' : 'Your month starts when your menu is created. No card upfront or automatic charge. The £197 website is optional.';
  };
  form.querySelectorAll('[name="package"]').forEach(input => input.addEventListener('change', updatePackage));
  updatePackage();

  const upload = field('menu_file');
  const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']);
  const validateUpload = () => {
    const file = upload.files?.[0];
    let error = '';
    if (file && file.size > 6 * 1024 * 1024) error = 'Please choose a menu file smaller than 6 MB, or share a menu link instead.';
    else if (file && (!/\.(pdf|jpe?g|png|webp|gif)$/i.test(file.name) || (file.type && !allowedTypes.has(file.type)))) error = 'Please choose a PDF, JPG, PNG, WebP or GIF menu file.';
    upload.setCustomValidity(error);
    return !error;
  };
  upload.addEventListener('change', validateUpload);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    validateUpload();
    if (!form.reportValidity()) return;
    const button = form.querySelector('[type="submit"]');
    const status = form.querySelector('[data-menu-status]');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.dataset.state = 'sending';
    status.textContent = upload.files?.length ? 'Sending your menu and details…' : 'Sending your menu details…';
    try {
      const response = await fetch('/', {method:'POST', body:new FormData(form), signal:controller.signal});
      if (!response.ok) throw new Error('Menu request unavailable');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event:'generate_lead', form_name:'Menu Setup Request', menu_package:field('package').value});
      location.assign('/menus/request-received/');
    } catch {
      status.dataset.state = 'error';
      status.textContent = 'We couldn’t confirm your request was received. Your details are still here. Please try again, or email maderealdesign@gmail.com.';
      status.focus({preventScroll:true});
      button.disabled = false;
      form.removeAttribute('aria-busy');
    } finally {
      clearTimeout(timeout);
    }
  });
})();
