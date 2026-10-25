(() => {
  'use strict';

  // The stylesheet owns transforms. This enhancer only supplies scroll values:
  // stage: --me-progress (0–1); product: --me-parallax (px), --me-float (-1–1).
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.me-header');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const stages = new Map();
  const records = [];
  let frame = 0;
  let previousTime = 0;
  let needsMeasure = true;

  const createRecord = element => {
    const record = {
      element, products: [], active: true, initialized: false,
      current: .5, target: .5, velocity: 0, written: null
    };
    records.push(record);
    return record;
  };
  document.querySelectorAll('[data-me-stage]').forEach(element => {
    stages.set(element, createRecord(element));
  });
  document.querySelectorAll('[data-me-parallax]').forEach(element => {
    const stage = stages.get(element.closest('[data-me-stage]')) || createRecord(element);
    const requested = parseFloat(element.dataset.meDepth || element.dataset.meParallax);
    stage.products.push({
      element,
      depth: Number.isFinite(requested) ? clamp(requested, -120, 120) : 28
    });
  });

  const stopped = () => reduced.matches || root.dataset.menuMotionPaused === 'true';
  const updateHeader = () => {
    if (header) header.toggleAttribute('data-me-scrolled', window.scrollY > 40);
  };
  const write = record => {
    const progress = clamp(record.current, 0, 1);
    const value = progress.toFixed(5);
    if (record.written === value) return;
    record.written = value;
    record.element.style.setProperty('--me-progress', value);
    const offset = (progress - .5) * 2;
    record.products.forEach(({ element, depth }) => {
      element.style.setProperty('--me-parallax', `${(-offset * depth).toFixed(2)}px`);
      element.style.setProperty('--me-float', offset.toFixed(5));
    });
  };
  const neutral = () => records.forEach(record => {
    record.current = record.target = .5;
    record.velocity = 0;
    record.initialized = false;
    write(record);
  });
  const cancel = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
  };
  const measure = () => {
    const viewport = window.innerHeight || root.clientHeight;
    records.forEach(record => {
      if (!record.active) return;
      const box = record.element.getBoundingClientRect();
      record.target = clamp((viewport - box.top) / Math.max(1, viewport + box.height), 0, 1);
      if (!record.initialized) {
        record.current = record.target;
        record.velocity = 0;
        record.initialized = true;
      }
    });
    needsMeasure = false;
  };
  const render = time => {
    frame = 0;
    if (document.hidden || stopped()) {
      previousTime = 0;
      return;
    }
    const elapsed = previousTime ? clamp((time - previousTime) / 1000, 1 / 240, 1 / 30) : 1 / 60;
    previousTime = time;
    if (needsMeasure) measure();
    let moving = false;
    records.forEach(record => {
      if (!record.active) return;
      // A lightly damped spring keeps changes soft without a perpetual loop.
      record.velocity += ((record.target - record.current) * 120 - record.velocity * 20) * elapsed;
      record.current += record.velocity * elapsed;
      if (Math.abs(record.target - record.current) < .00005 && Math.abs(record.velocity) < .0005) {
        record.current = record.target;
        record.velocity = 0;
      } else {
        moving = true;
      }
      write(record);
    });
    if (moving) frame = requestAnimationFrame(render);
    else previousTime = 0;
  };
  const request = () => {
    needsMeasure = true;
    updateHeader();
    if (!frame && !document.hidden && !stopped()) frame = requestAnimationFrame(render);
  };
  const sync = () => {
    cancel();
    if (stopped()) neutral();
    if (!document.hidden) request();
  };

  if ('IntersectionObserver' in window) {
    const lookup = new Map(records.map(record => [record.element, record]));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        const record = lookup.get(target);
        record.active = isIntersecting;
        if (!isIntersecting) record.velocity = 0;
      });
      request();
    }, { rootMargin: '25% 0px', threshold: 0 });
    records.forEach(record => observer.observe(record.element));
  }

  new MutationObserver(sync).observe(root, {
    attributes: true, attributeFilter: ['data-menu-motion-paused']
  });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  window.addEventListener('load', request, { once: true });
  window.addEventListener('pageshow', sync);
  window.addEventListener('pagehide', cancel);
  if (document.fonts?.ready) document.fonts.ready.then(request);
  neutral();
  request();
})();
