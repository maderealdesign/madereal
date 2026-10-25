(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = document.querySelector('[data-menu-pause]');
  const scenes = [...document.querySelectorAll('[data-menu-demo]')].filter(scene =>
    ['price', 'publish', 'live', 'status'].every(name => scene.querySelector(`[data-demo-${name}]`)));
  const states = ['idle', 'edit', 'changed', 'publish', 'updated'];
  const delays = [1600, 1300, 1800, 1100, 3200];
  let paused = false;

  const position = scene => {
    const box = scene.getBoundingClientRect();
    const step = scene.dataset.step;
    const control = scene.querySelector(step === 'publish' || step === 'updated' ? '[data-demo-publish]' : '[data-demo-price]');
    const target = control?.getBoundingClientRect();
    scene.style.setProperty('--demo-x', `${step === 'idle' || !target ? box.width * .88 : target.left - box.left + target.width * .65}px`);
    scene.style.setProperty('--demo-y', `${step === 'idle' || !target ? box.height * .82 : target.top - box.top + target.height * .62}px`);
  };
  const stop = scene => { clearTimeout(scene._menuTimer); scene._menuTimer = null; };
  const render = (scene, index) => {
    scene._menuIndex = index;
    scene.dataset.step = states[index];
    scene.querySelector('[data-demo-price]').value = index >= 2 ? '9.00' : '8.50';
    scene.querySelector('[data-demo-live]').textContent = index === 4 ? '9.00' : '8.50';
    scene.querySelector('[data-demo-status]').textContent = [
      'Change the price, then press Publish.', 'Change the price.', 'Ready to publish.',
      'Publishing…', 'Published. The customer menu now shows £9.00.'
    ][index];
    position(scene);
  };
  const schedule = scene => {
    stop(scene);
    if (paused || reduced.matches || document.hidden || !scene._menuVisible || scene._menuManual) return;
    scene._menuTimer = setTimeout(() => {
      render(scene, (scene._menuIndex + 1) % states.length);
      schedule(scene);
    }, delays[scene._menuIndex]);
  };
  const sync = () => {
    document.documentElement.dataset.menuMotionPaused = String(paused || reduced.matches);
    scenes.forEach(scene => {
      const cursor = scene.querySelector('[data-demo-cursor]');
      if (cursor) cursor.hidden = reduced.matches || Boolean(scene._menuManual);
      schedule(scene);
    });
    if (pause) {
      pause.setAttribute('aria-pressed', String(paused));
      pause.textContent = paused ? 'Play motion' : 'Pause motion';
    }
  };
  scenes.forEach(scene => {
    const input = scene.querySelector('[data-demo-price]');
    const publish = scene.querySelector('[data-demo-publish]');
    const status = scene.querySelector('[data-demo-status]');
    if (!input || !publish || !status || !scene.querySelector('[data-demo-live]')) return;
    status.setAttribute('aria-live', 'off');
    const manual = () => {
      scene._menuManual = true;
      scene.dataset.manual = 'true';
      stop(scene);
      const cursor = scene.querySelector('[data-demo-cursor]');
      if (cursor) cursor.hidden = true;
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
    };
    input.addEventListener('focus', manual);
    scene.addEventListener('click', manual);
    input.addEventListener('input', () => {
      manual();
      scene.dataset.step = 'changed';
      input.removeAttribute('aria-invalid');
      const message = 'Price changed. Press Publish to update the customer menu.';
      if (status.textContent !== message) status.textContent = message;
    });
    publish.addEventListener('click', () => {
      manual();
      const value = input.valueAsNumber;
      if (input.value.trim() === '' || !Number.isFinite(value) || value < 0 || !input.checkValidity()) {
        input.setAttribute('aria-invalid', 'true');
        status.textContent = 'Enter a valid price of £0 or more, using up to two decimal places.';
        return;
      }
      input.removeAttribute('aria-invalid');
      const price = value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false });
      input.value = price;
      scene.querySelector('[data-demo-live]').textContent = price;
      scene.dataset.step = 'updated';
      status.textContent = `Published. The customer menu now shows £${price}.`;
    });
    render(scene, 0);
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
      target._menuVisible = isIntersecting && intersectionRatio >= .25;
      schedule(target);
    }), { threshold: [0, .25] });
    scenes.forEach(scene => observer.observe(scene));
  }
  if (pause) { pause.hidden = false; pause.addEventListener('click', () => { paused = !paused; sync(); }); }
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  window.addEventListener('resize', () => scenes.forEach(position), { passive: true });
  sync();

  document.querySelectorAll('[data-menu-gallery]').forEach(gallery => {
    const track = gallery.querySelector('[data-menu-track]');
    const projects = [...gallery.querySelectorAll('[data-menu-project]')];
    const prev = gallery.querySelector('[data-menu-prev]');
    const next = gallery.querySelector('[data-menu-next]');
    if (!track || !projects.length || !prev || !next) return;
    const update = () => {
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    };
    const move = direction => {
      const distance = projects[1] ? projects[1].getBoundingClientRect().left - projects[0].getBoundingClientRect().left : track.clientWidth;
      track.scrollBy({ left: direction * distance, behavior: reduced.matches ? 'instant' : 'smooth' });
    };
    prev.hidden = next.hidden = false;
    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    update();
  });
})();
