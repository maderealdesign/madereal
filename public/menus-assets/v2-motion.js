/* MadeReal V2: MadeReal's persistent star cloud, adapted for the live menu story.
   Outline geometry uses the same 24-unit convention as the MadeReal source. */
(() => {
  'use strict';
  const host = document.querySelector('.home-experience');
  const field = host?.querySelector('.mr-light-field');
  const canvas = field?.querySelector('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const siteHeader = document.querySelector('.site-header');
  const controls = [...host.querySelectorAll('[data-motion-toggle]')];
  const scenes = [...host.querySelectorAll('[data-light-scene]')].map(el => ({ el, name: el.dataset.lightScene, top: 0, height: 0 }));
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const ease = value => { const n = clamp(value); return n * n * (3 - 2 * n); };
  const mix = (start, end, fraction) => start + (end - start) * fraction;
  const wrap = (value, size) => ((value % size) + size) % size;

  let seed = 719;
  function random() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let n = Math.imul(seed ^ seed >>> 15, 1 | seed);
    n = n + Math.imul(n ^ n >>> 7, 61 | n) ^ n;
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  }
  const colours = ['rgba(224,241,255,A)', 'rgba(112,183,255,A)', 'rgba(255,171,110,A)'];
  function sprite(colour) {
    const image = document.createElement('canvas');
    image.width = image.height = 48;
    const paint = image.getContext('2d');
    const glow = paint.createRadialGradient(24, 24, 0, 24, 24, 24);
    glow.addColorStop(0, 'rgba(255,255,248,1)');
    glow.addColorStop(.12, 'rgba(255,255,248,.98)');
    glow.addColorStop(.26, colour.replace('A', '.68'));
    glow.addColorStop(.56, colour.replace('A', '.16'));
    glow.addColorStop(1, colour.replace('A', '0'));
    paint.fillStyle = glow;
    paint.fillRect(0, 0, 48, 48);
    return image;
  }
  const lights = colours.map(sprite);
  const shapes = {};
  const shapeJobs = [...field.querySelectorAll('[data-particle-shape]')].map(group => {
    const paths = [...group.children].filter(el => typeof el.getTotalLength === 'function').map(el => ({ el, length: el.getTotalLength() }));
    return { name: group.dataset.particleShape, paths, total: paths.reduce((sum, path) => sum + path.length, 0), points: [] };
  }).filter(job => job.total > 0);

  const particles = Array.from({ length: 960 }, () => {
    const tint = random();
    return { t: random(), arm: Math.floor(random() * 3), colour: tint < .68 ? 0 : tint < .92 ? 1 : 2, scatter: random() - .5, z: random(), size: random(), phase: random() * Math.PI * 2, speed: .65 + random() * .7, u: random(), x: 0, y: 0, ready: false };
  });
  const stars = Array.from({ length: 150 }, () => ({ x: random(), y: random(), size: random(), phase: random() * Math.PI * 2 }));
  let width = 0, height = 0, hostTop = 0, hostBottom = 0;
  let frame = 0, last = 0, time = 0, paused = false, dirty = true, clearing = 0;
  let textAreas = [], pointer = { x: 0, y: 0 }, camera = { x: 0, y: 0 };
  let scrollSpeed = 0, scrollTime = performance.now(), scrollPosition = scrollY;
  let layoutFrame = 0, viewportDirty = true, textDirty = true, viewportDpr = 0;
  let canvasResizes = 0, layoutMeasurements = 0, textMeasurements = 0;
  let shownScene = '', shownAnchor = null, formation = 0;
  const textSelector = 'h1,h2,h3,p,.eyebrow,.text-link,.audience-line,.promise-strip,.plain-benefits,.print-points,.faq-list summary,.footer-links,.footer-bottom';
  const opaqueSurfaceSelector = '.mr-surface,.hero-visual,.workflow-preview,.wf-demo,#menu-demo,.im-section,.faq-section,.paper-stack,.lead-form,.price-card,.venue-layout,.venue-gallery,.venue-card-art';

  function request() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function scheduleShapes() {
    if ('requestIdleCallback' in window) requestIdleCallback(prepareShapes, { timeout: 600 });
    else setTimeout(prepareShapes, 16);
  }
  function prepareShapes() {
    if (!shapeJobs.length) return;
    const active = sceneNow().name;
    const priority = shapeJobs.findIndex(job => job.name === active);
    if (priority > 0) shapeJobs.unshift(shapeJobs.splice(priority, 1)[0]);
    const job = shapeJobs[0], started = performance.now();
    let batch = 0;
    while (job.points.length < 1000 && batch < 128 && performance.now() - started < 4) {
      let distance = job.points.length / 1000 * job.total;
      let path = job.paths[0];
      for (const candidate of job.paths) {
        path = candidate;
        if (distance <= path.length) break;
        distance -= path.length;
      }
      const point = path.el.getPointAtLength(distance);
      job.points.push({ x: (point.x - 12) / 12, y: (point.y - 12) / 12 });
      batch++;
    }
    if (job.points.length === 1000) {
      shapes[job.name] = job.points;
      shapeJobs.shift();
      field.dataset.shapesReady = String(Object.keys(shapes).length);
      dirty = true;
      request();
    }
    if (shapeJobs.length) scheduleShapes();
  }
  function measureText() {
    // Protect the actual letters rather than putting opaque panels behind copy.
    // Opaque product frames cover the canvas themselves. Their changing text
    // must not make the surrounding stars blink when a venue or dish changes.
    const elements = [...host.querySelectorAll(textSelector)].filter(el => !el.closest(opaqueSurfaceSelector));
    if (siteHeader) elements.push(siteHeader);
    textMeasurements++;
    textAreas = elements.flatMap(el => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const fixed = el === siteHeader;
      const offset = fixed ? 0 : scrollY;
      return [...range.getClientRects()].filter(box => box.width && box.height).map(box => ({ left: box.left - 7, right: box.right + 7, top: box.top + offset - 6, bottom: box.bottom + offset + 6, fixed }));
    });
  }
  function measure() {
    layoutFrame = 0;
    layoutMeasurements++;
    let layoutChanged = false, bitmapChanged = false;
    if (viewportDirty) {
      viewportDirty = false;
      const nextWidth = innerWidth, nextHeight = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const scaleChanged = dpr !== viewportDpr;
      layoutChanged = nextWidth !== width || nextHeight !== height || dpr !== viewportDpr;
      width = nextWidth; height = nextHeight; viewportDpr = dpr;
      const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
      let resized = false;
      // Assigning the same dimensions also erases the bitmap and context.
      // A venue iframe loading is not a canvas resize.
      if (canvas.width !== pixelWidth) { canvas.width = pixelWidth; resized = true; }
      if (canvas.height !== pixelHeight) { canvas.height = pixelHeight; resized = true; }
      if (resized || scaleChanged) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (resized) { bitmapChanged = true; canvasResizes++; }
    }
    const bounds = host.getBoundingClientRect();
    const nextTop = bounds.top + scrollY, nextBottom = bounds.bottom + scrollY;
    layoutChanged ||= Math.abs(nextTop - hostTop) > .25 || Math.abs(nextBottom - hostBottom) > .25;
    hostTop = nextTop; hostBottom = nextBottom;
    for (const scene of scenes) {
      const rect = scene.el.getBoundingClientRect();
      const top = rect.top + scrollY;
      layoutChanged ||= Math.abs(top - scene.top) > .25 || Math.abs(rect.height - scene.height) > .25;
      scene.top = top; scene.height = rect.height;
      const anchor = scene.el.querySelector('[data-particle-anchor]');
      if (anchor) {
        const box = anchor.getBoundingClientRect();
        const next = { x: box.left + box.width / 2, y: box.top + scrollY + box.height / 2, size: Math.min(box.width, box.height) * .45 };
        const changed = !scene.anchor || Math.abs(next.x - scene.anchor.x) > .25 || Math.abs(next.y - scene.anchor.y) > .25 || Math.abs(next.size - scene.anchor.size) > .25;
        if (changed) { scene.anchor = next; layoutChanged = true; }
      } else if (scene.anchor) { scene.anchor = null; layoutChanged = true; }
    }
    if (layoutChanged || textDirty) {
      measureText();
      textDirty = false;
      dirty = true;
      request();
    }
    // A genuine viewport resize must also paint in this frame, before the
    // cleared backing store can reach the screen. Particle history stays put.
    if (bitmapChanged) draw(sceneNow(), paused || reduced.matches);
    field.dataset.canvasResizes = String(canvasResizes);
  }
  function queueMeasure({ text = false, viewport = false } = {}) {
    textDirty ||= text;
    viewportDirty ||= viewport;
    if (!layoutFrame) layoutFrame = requestAnimationFrame(measure);
  }
  function sceneNow() {
    let active = null, best = 0, heroFallback = null;
    const viewportTop = Math.max(0, siteHeader?.getBoundingClientRect().bottom || 0);
    for (const scene of scenes) {
      const top = scene.top - scrollY, bottom = top + scene.height;
      // A final sliver of hero hidden behind the sticky navigation must not
      // override an icon already arriving in the unobstructed viewport.
      if (top >= height || bottom <= viewportTop) continue;
      const centre = scene.anchor ? scene.anchor.y - scrollY : top + scene.height * .5;
      const distance = Math.abs(centre - height * .44);
      const span = Math.min(height * .48, scene.height * .46);
      const strength = scene.name === 'hero' ? 1 : 1 - ease((distance - span * .32) / Math.max(1, span * .68));
      const candidate = { source: scene, name: scene.name, top, bottom, strength, anchor: scene.anchor };
      if (scene.name === 'hero') { heroFallback = candidate; continue; }
      // Forming outlines take priority over hero and over adjacent sections.
      // When neither outline is forming, distance retains the scatter interval.
      const score = strength > .015 ? 1 + strength : 1 / (1 + distance);
      if (score > best) {
        best = score;
        active = candidate;
      }
    }
    if (active?.strength > .015) return active;
    return heroFallback || active || { name: 'ambient', strength: 0 };
  }
  function draw(scene, still) {
    const mobile = width < 700, motion = reduced.matches ? 0 : time;
    const hero = scene.name === 'hero', shape = shapes[scene.name], icon = !!(shape && scene.anchor);
    const targetClear = hero ? ease((-scene.top - height * .04) / (height * .48)) : 1;
    clearing = still ? targetClear : mix(clearing, targetClear, .12);
    if (!still) {
      camera.x = mix(camera.x, pointer.x, .06);
      camera.y = mix(camera.y, pointer.y, .06);
    }
    if (shownScene !== scene.name) {
      shownScene = scene.name;
      shownAnchor = scene.anchor ? { ...scene.anchor } : null;
      formation = 0;
    }
    if (icon && shownAnchor) {
      for (const axis of ['x', 'y', 'size']) shownAnchor[axis] = still ? scene.anchor[axis] : mix(shownAnchor[axis], scene.anchor[axis], .18);
    }
    formation = still ? (icon ? scene.strength : 0) : mix(formation, icon ? scene.strength : 0, .2);
    const form = formation, anchor = shownAnchor || scene.anchor;
    field.dataset.motionState = hero ? (clearing > .35 ? 'clearing' : 'orbit') : scene.name;
    field.dataset.iconRotation = icon ? '0' : '';
    field.dataset.iconFormation = form.toFixed(3);
    field.dataset.paused = String(paused);
    field.dataset.reducedMotion = String(reduced.matches);

    const clearAreas = textAreas.filter(box => box.fixed || (box.bottom > scrollY - 48 && box.top < scrollY + height + 48)).map(box => ({ ...box, top: box.top - (box.fixed ? 0 : scrollY), bottom: box.bottom - (box.fixed ? 0 : scrollY) }));
    // Spatial bins keep a long page's text exclusion cheap for every particle.
    const bins = new Map(), cellSize = 64;
    for (const area of clearAreas) {
      const firstX = Math.max(-1, Math.floor((area.left - 40) / cellSize));
      const lastX = Math.min(Math.ceil(width / cellSize), Math.floor((area.right + 40) / cellSize));
      const firstY = Math.max(-1, Math.floor((area.top - 40) / cellSize));
      const lastY = Math.min(Math.ceil(height / cellSize), Math.floor((area.bottom + 40) / cellSize));
      for (let x = firstX; x <= lastX; x++) for (let y = firstY; y <= lastY; y++) {
        const key = `${x},${y}`;
        if (!bins.has(key)) bins.set(key, []);
        bins.get(key).push(area);
      }
    }
    function textVisibility(x, y) {
      let visibility = 1;
      const nearby = bins.get(`${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`) || [];
      for (const area of nearby) {
        const dx = Math.max(area.left - x, 0, x - area.right);
        const dy = Math.max(area.top - y, 0, y - area.bottom);
        if (dx > 40 || dy > 40) continue;
        visibility = Math.min(visibility, .025 + .975 * ease(Math.hypot(dx, dy) / 40));
      }
      return visibility;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    for (const star of stars) {
      const size = 2 + star.size * 6;
      const x = star.x * width;
      const y = wrap(star.y * (height + 40) - scrollY * (.055 + star.size * .14) + motion * .0015 * (.3 + star.size), height + 40) - 20;
      ctx.globalAlpha = (.2 + star.size * .4) * (reduced.matches ? 1 : .85 + Math.sin(motion * .0007 + star.phase) * .15) * textVisibility(x, y);
      ctx.drawImage(lights[star.size > .94 ? 2 : star.size > .7 ? 1 : 0], x - size / 2, y - size / 2, size, size);
    }
    const trailStrength = still ? 0 : clamp((Math.abs(scrollSpeed) - .35) / 1.8);
    let trailCount = 0;
    const count = mobile ? 520 : 960;
    const base = Math.min(width * (mobile ? .87 : .47), height * .82);
    const ox = camera.x * (mobile ? 0 : 26), oy = camera.y * 18;
    for (let index = 0; index < count; index++) {
      const particle = particles[index], side = index % 2 ? 1 : -1;
      const outside = width * .5 + side * width * (.23 + particle.z * .34) + Math.sin(motion * .00012 + particle.phase) * 18;
      const outsideY = wrap(particle.u * (height + 140) - scrollY * (.12 + particle.z * .32) + motion * .003 * particle.speed, height + 140) - 70;
      let x = outside, y = outsideY;
      if (hero) {
        const orbit = particle.t * 10.4 + particle.arm * 2.094 + motion * .00012 * (.35 + (1 - particle.t) * 1.9) * particle.speed;
        const radius = (.05 + Math.pow(particle.t, .77) * .94) * base + particle.scatter * (10 + particle.t * 38);
        const x0 = Math.cos(orbit) * radius, y0 = Math.sin(orbit) * radius * .63;
        x = mix(width * .5 + x0 * .91 + y0 * .42 + ox, outside, clearing);
        y = mix(height * .46 - x0 * .42 + y0 * .91 + oy, outsideY, clearing * .85);
      } else if (icon && index < count * .84) {
        const point = shape[Math.floor(wrap(particle.u + motion * .000012 * particle.speed, 1) * shape.length)];
        const jitter = reduced.matches ? 0 : Math.sin(motion * .001 * particle.speed + particle.phase) * .008;
        const spread = particle.phase + motion * .000018 * particle.speed;
        const scatterX = width * .5 + Math.cos(spread) * width * (.18 + particle.z * .49);
        const scatterY = height * .44 + Math.sin(spread) * height * (.2 + particle.t * .52);
        x = mix(scatterX, anchor.x + (point.x + particle.scatter * .027) * anchor.size, form);
        y = mix(scatterY, anchor.y - scrollY + (point.y + jitter) * anchor.size, form);
      }
      const previousX = particle.x, previousY = particle.y, wasReady = particle.ready;
      if (!particle.ready || still) {
        particle.x = x; particle.y = y; particle.ready = true;
      } else {
        particle.x = mix(particle.x, x, .16); particle.y = mix(particle.y, y, .16);
      }
      const inIcon = icon && index < count * .84;
      const shimmer = reduced.matches ? 1 : .85 + Math.sin(motion * .0011 * particle.speed + particle.phase) * .15;
      const size = (inIcon ? (particle.size > .965 ? 26 : particle.size > .86 ? 12 : 3 + particle.size * 6) : (particle.size > .98 ? 34 : particle.size > .87 ? 16 : 3 + particle.size * 7)) * (mobile ? .85 : 1);
      ctx.globalAlpha = clamp((inIcon ? (.62 + particle.z * .38) * (.65 + form * .35) : hero ? (.5 + particle.z * .5) * (1 - clearing * .4) : .27 + particle.z * .38) * shimmer) * textVisibility(particle.x, particle.y);
      if (trailStrength > 0 && wasReady && index % 2 === 0) {
        const dx = particle.x - previousX, dy = particle.y - previousY, distance = Math.hypot(dx, dy);
        if (distance > .4 && distance < 260) {
          const length = Math.min(mobile ? 76 : 136, distance * 7) * trailStrength;
          const tx = particle.x - dx / distance * length, ty = particle.y - dy / distance * length;
          const crossesText = clearAreas.some(area => Math.min(tx, particle.x) < area.right + 8 && Math.max(tx, particle.x) > area.left - 8 && Math.min(ty, particle.y) < area.bottom + 8 && Math.max(ty, particle.y) > area.top - 8);
          const alpha = ctx.globalAlpha;
          if (crossesText) ctx.globalAlpha *= .025;
          const glow = ctx.createLinearGradient(tx, ty, particle.x, particle.y);
          glow.addColorStop(0, colours[particle.colour].replace('A', '0'));
          glow.addColorStop(.55, colours[particle.colour].replace('A', '.32'));
          glow.addColorStop(1, 'rgba(240,248,255,.94)');
          ctx.strokeStyle = glow; ctx.lineWidth = 1 + particle.size * 1.7;
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(particle.x, particle.y); ctx.stroke();
          ctx.globalAlpha *= .16; ctx.lineWidth = 5 + particle.size * 5; ctx.stroke();
          ctx.globalAlpha = alpha; trailCount++;
        }
      }
      ctx.drawImage(lights[particle.colour], particle.x - size / 2, particle.y - size / 2, size, size);
    }
    field.dataset.trails = String(trailCount);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  function tick(now) {
    frame = 0;
    if (document.hidden) return;
    const visible = hostBottom > scrollY && hostTop < scrollY + height;
    field.style.visibility = visible ? 'visible' : 'hidden';
    if (!visible) return;
    const still = paused || reduced.matches;
    if (now - last >= 33.334 || (dirty && still) || !last) {
      const delta = Math.min(now - last || 34, 48);
      if (!still) time += delta;
      if (now - scrollTime > 80) scrollSpeed *= .65;
      last = now; draw(sceneNow(), still); dirty = false;
    }
    if (!still || dirty) frame = requestAnimationFrame(tick);
  }
  function controlsUpdate() {
    for (const button of controls) {
      button.hidden = reduced.matches;
      button.setAttribute('aria-pressed', String(paused));
      const label = button.querySelector('span'), path = button.querySelector('path');
      if (label) label.textContent = paused ? 'Play motion' : 'Pause motion';
      if (path) path.setAttribute('d', paused ? 'M5 3l7 5-7 5Z' : 'M5 4v8M11 4v8');
    }
    dirty = true;
    request();
  }
  controls.forEach(button => button.addEventListener('click', () => { paused = !paused; controlsUpdate(); }));
  host.addEventListener('pointermove', event => {
    if (!finePointer.matches || paused || reduced.matches) return;
    pointer.x = event.clientX / width - .5; pointer.y = event.clientY / height - .5;
  }, { passive: true });
  host.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; }, { passive: true });
  addEventListener('scroll', () => {
    const now = performance.now(), elapsed = Math.max(16, now - scrollTime);
    scrollSpeed = (scrollY - scrollPosition) / elapsed;
    scrollPosition = scrollY; scrollTime = now; dirty = true; request();
  }, { passive: true });
  addEventListener('resize', () => queueMeasure({ viewport: true, text: true }), { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else { last = performance.now(); dirty = true; request(); }
  });
  reduced.addEventListener('change', () => {
    pointer.x = pointer.y = camera.x = camera.y = 0;
    for (const particle of particles) particle.ready = false;
    controlsUpdate();
  });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => queueMeasure());
    observer.observe(host);
    for (const scene of scenes) {
      observer.observe(scene.el);
      const anchor = scene.el.querySelector('[data-particle-anchor]');
      if (anchor) observer.observe(anchor);
    }
  }
  if ('MutationObserver' in window) new MutationObserver(records => {
    const text = records.some(record => {
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      if (!target || target.closest(opaqueSurfaceSelector)) return false;
      if (target.closest(textSelector)) return true;
      return [...record.addedNodes, ...record.removedNodes].some(node => node.nodeType === 1 && (node.matches(textSelector) || node.querySelector(textSelector)));
    });
    queueMeasure({ text });
  }).observe(host, { childList: true, subtree: true, characterData: true });
  host.addEventListener('load', () => queueMeasure(), true);
  document.fonts?.addEventListener('loadingdone', () => queueMeasure({ text: true }));
  document.fonts?.ready.then(() => queueMeasure({ text: true }));
  Object.defineProperty(window, 'MadeRealMotion', {
    configurable: true,
    value: Object.freeze({
      get state() { return Object.freeze({ scene: field.dataset.motionState || 'loading', formation: Number(field.dataset.iconFormation || 0), shapesReady: Number(field.dataset.shapesReady || 0), trails: Number(field.dataset.trails || 0), particleCount: width < 700 ? 520 : 960, paused, reducedMotion: reduced.matches, active: Boolean(frame) && !document.hidden, canvasResizes, layoutMeasurements, textMeasurements }); }
    })
  });
  field.dataset.shapesReady = '0';
  measure(); controlsUpdate(); scheduleShapes();
})();
