/* Two drawn letterforms open into the name they stand for. */
(() => {
  const figure = document.querySelector('.initials');
  if (!figure) return;
  const art = figure.querySelector('.initials-art');
  const axis = figure.querySelector('input[type="range"]');
  const toggle = figure.querySelector('.initials-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';

  // The aperture and crossbar are part of the A's outline, so the counter
  // stays transparent through every impression of the plate.
  const outlines = {
    a: 'M-5 216 77 0 148 0 214 216 149 216 135 167 74 167 56 216ZM88 127H124L109 66Z',
    i: 'M0 0H124L117 31H89V185H119L112 216H-5L2 185H31V31H-7Z'
  };
  const corners = [[30,30,1,1],[610,30,-1,1],[30,394,1,-1],[610,394,-1,-1]];
  art.innerHTML = `<svg viewBox="0 0 640 424" xmlns="${ns}" preserveAspectRatio="xMidYMid meet" focusable="false">
    <defs>
      <pattern id="ai-screen" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="#efe7d1" opacity=".16"/></pattern>
      <path id="ai-a" fill-rule="evenodd" d="${outlines.a}"/>
      <path id="ai-i" d="${outlines.i}"/>
      <clipPath id="ai-name-one"><rect width="0" height="210"/></clipPath>
      <clipPath id="ai-name-two"><rect y="190" width="0" height="210"/></clipPath>
    </defs>
    <rect width="640" height="424" fill="url(#ai-screen)"/>
    <g fill="none" stroke="#a2a294" stroke-width="1.1">
      ${corners.map(([x,y,sx,sy]) => `<path d="M${x+16*sx} ${y}h${-16*sx}v${16*sy}"/>`).join('')}
    </g>
    <g id="ai-baselines" fill="none" stroke="#dedaca" stroke-width="1" stroke-dasharray="2 6" opacity="0">
      <path d="M53 178H587M53 311H587"/>
    </g>
    <g id="ai-first-plate"></g><g id="ai-second-plate"></g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="104" letter-spacing="-7">
      <text x="169" y="178" fill="#f5eddc" clip-path="url(#ai-name-one)">nwarul</text>
      <text x="131" y="311" fill="#ff6a4c" clip-path="url(#ai-name-two)">slam</text>
    </g>
  </svg>`;
  const svg = art.querySelector('svg');
  const get = id => svg.querySelector('#' + id);
  const clips = ['ai-name-one','ai-name-two'].map(id => get(id).firstElementChild);
  const plates = [
    { letter: 'a', group: get('ai-first-plate'), ink: '#f5eddc', edge: '#abae9c', start: [72,62,1.29], end: [61,70,.5] },
    { letter: 'i', group: get('ai-second-plate'), ink: '#ff6a4c', edge: '#fc7155', start: [385,62,1.29], end: [69,203,.5] }
  ];
  const layers = 8;
  for (const plate of plates) {
    plate.impressions = [];
    for (let i=layers; i>=0; i--) {
      const use = document.createElementNS(ns, 'use');
      use.setAttribute('href', '#ai-' + plate.letter);
      use.setAttribute('fill', i ? '#232721' : plate.ink);
      if (i) {
        use.setAttribute('stroke', plate.edge);
        use.setAttribute('stroke-width', '.8');
      }
      plate.group.append(use);
      plate.impressions[i] = use;
    }
  }

  const clamp = value => Math.max(0, Math.min(1, value));
  const mix = (a,b,t) => a + (b-a)*t;
  const ease = t => t*t*(3-2*t);
  let observer;
  let frame = 0;
  let progress = 0;
  let gesture = null;
  let ignoreClick = false;
  function draw(value) {
    progress = clamp(value);
    const t = ease(progress);
    const fan = Math.sin(Math.PI * t);
    for (const plate of plates) {
      const isA = plate.letter === 'a';
      const travel = ease(clamp((progress - (isA ? 0 : .13)) / .70));
      const [x,y,scale] = plate.start.map((v,i) => mix(v, plate.end[i], travel));
      plate.group.setAttribute('transform', `translate(${x} ${y}) scale(${scale})`);
      for (const [i,impression] of plate.impressions.entries()) {
        const spread = i / layers;
        const offset = (1-t) * (isA ? 24 : 19);
        const dx = spread * (offset + (isA ? -27 : 36)*fan);
        const dy = spread * (offset + 25*fan);
        const angle = (isA ? -1 : 1)*fan*spread*8;
        impression.setAttribute('transform', `translate(${dx} ${dy}) rotate(${angle} 55 180)`);
      }
    }
    const firstName = ease(clamp((progress - .54) / .33));
    const surname = ease(clamp((progress - .72) / .28));
    clips[0].setAttribute('x','166');
    clips[0].setAttribute('width',String(393*firstName));
    clips[1].setAttribute('x','128');
    clips[1].setAttribute('width',String(294*surname));
    get('ai-baselines').setAttribute('opacity',String(.3*fan));
    const percent = Math.round(progress*100);
    axis.value = String(percent);
    axis.setAttribute('aria-valuetext', percent === 0 ? 'AI, initials' : percent === 100 ? 'Anwarul Islam, full name' : `${percent}% unfolded`);
    axis.style.setProperty('--ai-axis', percent + '%');
    toggle.setAttribute('aria-label', progress < .5 ? 'Reveal full name' : 'Fold back to initials');
    toggle.title = toggle.getAttribute('aria-label');
    toggle.classList.toggle('is-open', progress >= .5);
  }
  function takeControl() {
    observer?.disconnect();
    observer = undefined;
    figure.classList.remove('is-opening');
    cancelAnimationFrame(frame);
  }

  function animateTo(target, introductory = false) {
    takeControl();
    if (reducedMotion.matches) { draw(target); return; }
    const start = progress;
    if (introductory) figure.classList.add('is-opening');
    const time = performance.now() + (introductory ? 560 : 0);
    const duration = introductory ? 2220 : 540 + Math.abs(target-start)*260;
    const step = now => {
      const t = clamp((now-time)/duration);
      if (now >= time) draw(mix(start,target,introductory ? t : ease(t)));
      if (t < 1) frame = requestAnimationFrame(step);
      else figure.classList.remove('is-opening');
    };
    frame = requestAnimationFrame(step);
  }
  function activate() { animateTo(progress < .5 ? 1 : 0); }
  toggle.addEventListener('click', activate);
  axis.addEventListener('focus', takeControl);
  axis.addEventListener('pointerdown', takeControl);
  axis.addEventListener('input', () => {
    takeControl();
    draw(Number(axis.value)/100);
  });
  art.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    takeControl();
    ignoreClick = false;
    gesture = { id:event.pointerId, x:event.clientX, initial:progress };
    art.setPointerCapture(event.pointerId);
    art.classList.add('is-dragging');
  });
  art.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x;
    if (Math.abs(dx) > 4) ignoreClick = true;
    if (ignoreClick) draw(gesture.initial + dx / (art.clientWidth*.52));
  });
  art.addEventListener('lostpointercapture', () => {
    gesture = null;
    art.classList.remove('is-dragging');
  });
  art.addEventListener('click', () => { if (!ignoreClick) activate(); });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      takeControl();
      draw(1);
    }
  });
  draw(reducedMotion.matches ? 1 : 0);
  figure.classList.add('is-ready');
  if (!reducedMotion.matches) {
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (observer && entry.intersectionRatio >= .25) animateTo(1, true);
      }, {threshold: .25});
      observer.observe(art);
    } else {
      animateTo(1, true);
    }
  }
})();
