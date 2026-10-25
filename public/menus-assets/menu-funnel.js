(() => {
  const funnel = document.querySelector('[data-menu-funnel]');
  const form = funnel?.querySelector('[data-menu-photo-form]');
  if (!form) return;
  const field = name => form.elements.namedItem(name);
  const set = (name, value) => { const input = field(name); if (input) input.value = value; };
  const params = new URLSearchParams(location.search);
  set('source_page', location.pathname);
  set('landing_page', location.pathname);
  try { set('referrer', document.referrer ? new URL(document.referrer).origin : ''); } catch {}
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) set(key, (params.get(key) || '').slice(0, 180));

  const upload = field('menu_file');
  const status = form.querySelector('[data-mf-status]');
  const selected = form.querySelector('[data-mf-selected]');
  const filename = form.querySelector('[data-mf-filename]');
  const preview = form.querySelector('[data-mf-preview]');
  const remove = form.querySelector('[data-mf-remove]');
  const submit = form.querySelector('[type=submit]');
  const acceptedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
  let objectUrl = '';
  let sending = false;

  const setStatus = (text, state = '') => {
    status.textContent = text;
    status.dataset.state = state;
  };
  const clearPreview = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = '';
    preview.removeAttribute('src');
    preview.hidden = true;
  };
  const validateUpload = () => {
    const file = upload.files?.[0];
    let error = '';
    if (file?.size > 6 * 1024 * 1024) error = 'Please choose a menu photo or PDF no larger than 6 MB.';
    else if (file && (!/\.(pdf|jpe?g|png|webp|heic|heif)$/i.test(file.name) || (file.type && !acceptedTypes.has(file.type)))) error = 'Please choose a PDF, JPG, PNG, WebP, HEIC or HEIF menu file.';
    upload.setCustomValidity(error);
    upload.setAttribute('aria-invalid', String(Boolean(error)));
    return error;
  };
  upload.addEventListener('change', () => {
    clearPreview();
    const file = upload.files?.[0];
    selected.hidden = !file;
    filename.textContent = file?.name || '';
    const error = validateUpload();
    setStatus(error, error ? 'error' : '');
    if (file && !error && /^image\//.test(file.type)) {
      objectUrl = URL.createObjectURL(file);
      preview.src = objectUrl;
      preview.hidden = false;
    }
  });
  preview.addEventListener('error', () => { preview.hidden = true; });
  remove.addEventListener('click', () => {
    upload.value = '';
    clearPreview();
    selected.hidden = true;
    filename.textContent = '';
    upload.setCustomValidity('');
    upload.removeAttribute('aria-invalid');
    setStatus('');
    upload.focus();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    const error = validateUpload();
    if (error) setStatus(error, 'error');
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const controls = [field('email'), upload, remove, submit];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    sending = true;
    controls.forEach(control => { control.disabled = true; });
    form.setAttribute('aria-busy', 'true');
    setStatus('Sending your menu…', 'sending');
    try {
      // The browser supplies the multipart boundary. Setting Content-Type here
      // would prevent Netlify from receiving the uploaded file correctly.
      const response = await fetch('/', {method: 'POST', body: data, signal: controller.signal});
      if (!response.ok) throw new Error('Menu enquiry unavailable');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event: 'generate_lead', form_name: 'Menu Photo Enquiry', lead_type: 'menu-enquiry'});
      clearPreview();
      form.hidden = true;
      const success = funnel.querySelector('[data-mf-success]');
      success.hidden = false;
      success.querySelector('[data-mf-success-heading]').focus({preventScroll: true});
    } catch {
      setStatus('We couldn’t confirm your menu was received. Your details are still here. Try again, or contact Dom on WhatsApp below.', 'error');
      status.focus({preventScroll: true});
      controls.forEach(control => { control.disabled = false; });
    } finally {
      clearTimeout(timeout);
      sending = false;
      form.removeAttribute('aria-busy');
    }
  });
  window.addEventListener('pagehide', clearPreview);
})();
