'use strict';
const statusEl = document.getElementById('copy-status');
for (const button of document.querySelectorAll('[data-copy]')) {
  const original = button.textContent;
  let reset;
  button.addEventListener('click', async () => {
    const field = document.getElementById(button.dataset.copy);
    if (!field) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(field.value);
      copied = true;
    } catch {
      field.focus();
      field.select();
      field.setSelectionRange(0, field.value.length);
      try { copied = document.execCommand('copy'); } catch {}
    }
    window.clearTimeout(reset);
    button.textContent = copied ? 'Copied' : original;
    statusEl.textContent = copied ? `${field.getAttribute('aria-label')} copied.` : 'Text selected. Use your device’s copy command.';
    if (copied) {
      button.focus();
      reset = window.setTimeout(() => { button.textContent = original; }, 2400);
    }
  });
}
