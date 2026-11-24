(() => {
  'use strict';

  const triggers = [...document.querySelectorAll('[data-finder]')];
  if (!triggers.length || typeof HTMLDialogElement === 'undefined') return;

  const dialog = document.createElement('dialog');
  dialog.id = 'work-finder';
  dialog.className = 'work-finder';
  dialog.setAttribute('aria-labelledby', 'finder-title');
  dialog.innerHTML = `
    <header class="finder-head">
      <h2 id="finder-title">Work index</h2>
      <button type="button" class="finder-close" aria-label="Close work index">×</button>
    </header>
    <div class="finder-search">
      <span aria-hidden="true">⌕</span>
      <input type="text" role="combobox" placeholder="Search projects, tools, or roles…"
        aria-label="Search the work index" aria-autocomplete="list" aria-expanded="true"
        aria-controls="finder-results" spellcheck="false" autocomplete="off">
    </div>
    <ul class="finder-results" id="finder-results" role="listbox" aria-label="Matching work"></ul>
    <p class="finder-empty" hidden>No matches. Try a project or a technology.</p>
    <footer class="finder-foot"><span role="status" aria-live="polite"></span><span aria-hidden="true">↑ ↓ to choose · ↵ to open</span></footer>`;
  document.body.append(dialog);
  const field = dialog.querySelector('input');
  const results = dialog.querySelector('ul');
  const status = dialog.querySelector('[role="status"]');
  const empty = dialog.querySelector('.finder-empty');
  const records = [];
  const add = (title, detail, href, keywords = '') => {
    records.push({title, detail, href, searchable: normalize([title, detail, keywords].join(' '))});
  };
  function normalize(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  for (const [id, title, detail, keywords] of [
    ['school', '10 Minute School', 'Software Engineer & Frontend Engineering Consultant', 'education Angular WordPress SmartBooks live class certificates PWA SSR Puppeteer'],
    ['hoppscotch', 'Hoppscotch', 'Product Engineer', 'API web desktop Vue TypeScript sync GraphQL WebSocket SSE MQTT'],
    ['imagineart', 'ImagineArt Workflows', 'Senior Frontend Engineer', 'React Next.js React Flow canvas nodes editing keyboard command palette'],
    ['opencut', 'OpenCut', 'Browser video editor', 'React TypeScript timeline snapping ripple editing'],
    ['raycast', 'Raycast', 'Extension creator & contributor', 'macOS Swift AppKit Ruler image Color Picker ScreenOCR Gemini'],
    ['flameshot', 'Flameshot', 'Cross-platform screenshot tool', 'C++ Qt settings UI contributor']
  ]) {
    const section = document.getElementById(id);
    if (!section) continue;
    add(title, detail, '#' + id, keywords);
  }
  add('Résumé', 'Experience, skills & downloadable PDF', '#resume');
  const markdown = document.querySelector('#resume-text')?.value || '';
  for (const match of markdown.matchAll(/^### \[(Codementor|Banglalink)\]\((https:[^)]+)\) \| ([^|\n]+)/gm)) {
    add(match[1], match[3].trim() + ' · company website', match[2], 'earlier experience');
  }
  for (const id of ['school', 'hoppscotch', 'imagineart', 'opencut', 'raycast', 'flameshot']) {
    const project = records.find(entry => entry.href === '#' + id);
    if (!project) continue;
    const links = document.getElementById(id).querySelectorAll('a[href^="https://"]');
    for (const link of links) {
      const title = link.textContent.replace(/[↗→]/g, '').trim();
      if (title && !records.some(entry => entry.href === link.href)) add(title, project.title, link.href);
    }
  }

  let matches = [];
  let active = 0;
  let previousFocus = null;
  let lastA = -Infinity;

  function select(index, scroll) {
    if (!matches.length) return;
    active = (index + matches.length) % matches.length;
    const options = results.children;
    for (const option of options) option.setAttribute('aria-selected', String(Number(option.dataset.index) === active));
    field.setAttribute('aria-activedescendant', options[active].id);
    if (scroll) options[active].scrollIntoView({block: 'nearest'});
  }

  function filter() {
    const words = normalize(field.value.trim()).split(/\s+/).filter(Boolean);
    matches = records.filter(entry => words.every(word => entry.searchable.includes(word)));
    results.replaceChildren(...matches.map((entry, index) => {
      const option = document.createElement('li');
      option.setAttribute('role', 'option');
      option.id = 'finder-option-' + index;
      option.dataset.index = String(index);
      const title = document.createElement('strong');
      title.textContent = entry.title;
      const detail = document.createElement('small');
      detail.textContent = entry.detail;
      const arrow = document.createElement('span');
      arrow.className = 'finder-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = entry.href.startsWith('#') ? '↳' : '↗';
      option.append(title, detail, arrow);
      return option;
    }));
    field.removeAttribute('aria-activedescendant');
    empty.hidden = !!matches.length;
    status.textContent = matches.length + (matches.length === 1 ? ' match' : ' matches');
    results.scrollTop = 0;
    select(0, false);
  }

  function open() {
    if (dialog.open) return;
    previousFocus = document.activeElement;
    field.value = '';
    filter();
    dialog.showModal();
    field.focus({preventScroll:true});
  }
  function visit(index) {
    const entry = matches[index];
    if (!entry) return;
    dialog.close();
    if (entry.href.startsWith('#')) {
      const target = document.getElementById(entry.href.slice(1));
      if (target) {
        previousFocus = null;
        if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
        target.focus({preventScroll:true});
        target.scrollIntoView({block:'start'});
      }
    }
    window.location.assign(entry.href);
  }
  triggers.forEach(trigger => {
    trigger.hidden = false;
    trigger.setAttribute('aria-controls', dialog.id);
    trigger.addEventListener('click', open);
  });
  dialog.querySelector('.finder-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true});
    previousFocus = null;
  });
  field.addEventListener('input', filter);
  field.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      select(active + (event.key === 'ArrowDown' ? 1 : -1), true);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      visit(active);
    }
  });
  results.addEventListener('click', event => {
    const option = event.target.closest('[role="option"]');
    if (option) visit(Number(option.dataset.index));
  });
  document.addEventListener('keydown', event => {
    if (dialog.open || event.defaultPrevented || event.isComposing || event.repeat || event.metaKey || event.ctrlKey || event.altKey ||
        event.target.isContentEditable || event.target.closest?.('input, textarea, select, dialog[open]')) {
      lastA = -Infinity;
      return;
    }
    const key = event.key.toLowerCase();
    if (key === 'i' && performance.now() - lastA < 1000) {
      event.preventDefault();
      open();
    }
    lastA = key === 'a' ? performance.now() : -Infinity;
  });
})();
