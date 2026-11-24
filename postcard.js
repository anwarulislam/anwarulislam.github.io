'use strict';

(() => {
  const byId = id => document.getElementById(id);
  const video = byId('ride');
  const poster = byId('poster');
  const stage = byId('stage');
  const trim = byId('trim');
  const overlay = byId('measure');
  const ctx = overlay.getContext('2d');
  const points = [{x: .25, y: .57}, {x: .72, y: .48}];
  const buttons = [...document.querySelectorAll('[data-mode]')];
  const previews = [...document.querySelectorAll('.sync-pair canvas')];
  let mode = 'cut';
  let dragging = false;
  let playbackFrame = 0;
  let trimAnchor = 0;

  // A local blob supports frame seeking even when the CDN sends the whole clip.
  let clipReady;
  let pendingAction = 0;
  function loadClip() {
    if (!clipReady) {
      clipReady = (async () => {
        const response = await fetch(video.dataset.src);
        if (!response.ok) throw new Error('Video unavailable');
        const blob = await response.blob();
        await new Promise((resolve, reject) => {
          const loaded = () => { video.removeEventListener('error', failed); resolve(); };
          const failed = () => { video.removeEventListener('loadeddata', loaded); reject(new Error('Video unavailable')); };
          video.addEventListener('loadeddata', loaded, {once: true});
          video.addEventListener('error', failed, {once: true});
          video.preload = 'auto';
          video.src = URL.createObjectURL(blob);
        });
      })().catch(error => { clipReady = undefined; throw error; });
    }
    return clipReady;
  }

  function source() {
    return video.readyState >= 2 ? video : poster;
  }

  function cropBox(square) {
    const width = square ? 540 : 960;
    return { x: (960 - width) * Number(byId('pan').value) / 100, width };
  }

  function drawFrame(canvas, square) {
    const box = cropBox(square);
    canvas.getContext('2d').drawImage(source(), box.x, 0, box.width, 540, 0, 0, canvas.width, canvas.height);
  }

  function drawRuler() {
    const width = overlay.width;
    const coords = points.map(p => ({x: p.x * width, y: p.y * 540}));
    const [a, b] = coords;
    ctx.clearRect(0, 0, width, 540);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = '#fff7df';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = '#ba382a';
    ctx.lineWidth = 2;
    ctx.stroke();
    for (const point of coords) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 9, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff7df';
      ctx.fill();
      ctx.stroke();
    }
    const active = coords[Number(byId('endpoint').value)];
    const box = cropBox(width === 540);
    const lx = active.x > width / 2 ? 6 : width - 90;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#25251e';
    ctx.fillRect(lx, 6, 84, 84);
    ctx.drawImage(source(), box.x + active.x - 14, active.y - 14, 28, 28, lx, 6, 84, 84);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(lx, 6, 84, 84);
    ctx.fillStyle = '#bd3424';
    ctx.fillRect(lx + 41, 40, 2, 16);
    ctx.fillRect(lx + 34, 47, 16, 2);
    byId('distance').value = Math.round(Math.hypot(a.x - b.x, a.y - b.y)) + ' px';
  }

  function render() {
    const square = byId('format').value === 'square';
    stage.classList.toggle('square', square);
    const position = byId('pan').value + '% center';
    video.style.objectPosition = poster.style.objectPosition = position;
    if (source() === poster && !poster.naturalWidth) return;
    if (mode === 'ruler') {
      overlay.width = square ? 540 : 960;
      drawRuler();
    }
    if (mode === 'sync') previews.forEach(canvas => drawFrame(canvas, true));
  }

  function selectMode(next, focus) {
    pendingAction++;
    mode = next;
    video.pause();
    for (const button of buttons) {
      const active = button.dataset.mode === next;
      byId(button.dataset.mode).hidden = !active;
      button.setAttribute('aria-pressed', String(active));
      if (active && focus) button.focus({preventScroll: true});
    }
    overlay.hidden = mode !== 'ruler';
    render();
  }
  buttons.forEach(button => button.addEventListener('click', () => selectMode(button.dataset.mode)));
  document.querySelectorAll('[data-open]').forEach(link => link.addEventListener('click', () => selectMode(link.dataset.open, true)));

  function updateHead() {
    byId('playhead').style.left = (100 * video.currentTime / 7) + '%';
  }
  function tick() {
    if (video.paused) return;
    if (video.currentTime >= Number(trim.value)) video.currentTime = 0;
    updateHead();
    playbackFrame = requestAnimationFrame(tick);
  }
  video.addEventListener('play', () => {
    byId('play').textContent = 'Ⅱ Pause';
    cancelAnimationFrame(playbackFrame);
    tick();
  });
  video.addEventListener('pause', () => {
    cancelAnimationFrame(playbackFrame);
    byId('play').textContent = '▶ Play cut';
  });
  video.loop = true;
  byId('play').addEventListener('click', async () => {
    const action = ++pendingAction;
    if (!video.paused) return video.pause();
    try { await loadClip(); } catch { byId('desk-status').textContent = 'The film could not load. Try Play again.'; return; }
    if (action !== pendingAction) return;
    if (video.currentTime >= Number(trim.value) - .06) video.currentTime = 0;
    try { await video.play(); } catch { byId('desk-status').textContent = 'Playback is unavailable. You can still crop, measure, and save the photograph.'; }
  });
  trim.addEventListener('pointerdown', () => {
    trimAnchor = video.currentTime;
    video.pause();
  });
  trim.addEventListener('input', async event => {
    const action = ++pendingAction;
    let end = Number(trim.value);
    if (byId('snap').checked && event.isTrusted && trim.matches(':active')) {
      const marks = [trimAnchor, 1, 2, 3, 4, 5, 6, 7];
      const closest = marks.find(mark => mark >= .25 && Math.abs(end - mark) < .12);
      if (closest !== undefined) trim.value = end = closest;
    }
    trim.parentElement.style.setProperty('--cut-end', (end / 7 * 100) + '%');
    byId('duration').value = end.toFixed(2) + ' s';
    video.pause();
    try { await loadClip(); } catch { byId('desk-status').textContent = 'The film could not load. Try Play again.'; return; }
    if (action !== pendingAction) return;
    video.currentTime = Math.max(0, end - .045);
  });
  video.addEventListener('seeked', () => { updateHead(); render(); });
  video.addEventListener('loadeddata', render);
  poster.addEventListener('load', render);
  byId('format').addEventListener('change', () => {
    byId('flow').textContent = byId('format').value === 'square' ? 'Source → Square crop → Preview' : 'Source → Preview';
    render();
  });
  byId('pan').addEventListener('input', render);

  function pointerPosition(event) {
    const rect = overlay.getBoundingClientRect();
    const clamp = n => Math.min(1, Math.max(0, n));
    return {x: clamp((event.clientX - rect.left) / rect.width), y: clamp((event.clientY - rect.top) / rect.height)};
  }
  overlay.addEventListener('pointerdown', event => {
    const p = pointerPosition(event);
    const distances = points.map(q => Math.hypot((q.x - p.x) * overlay.width, (q.y - p.y) * 540));
    const index = distances[0] < distances[1] ? 0 : 1;
    byId('endpoint').value = String(index);
    points[index] = p;
    dragging = true;
    overlay.setPointerCapture(event.pointerId);
    render();
  });
  overlay.addEventListener('pointermove', event => {
    if (!dragging) return;
    points[Number(byId('endpoint').value)] = pointerPosition(event);
    render();
  });
  overlay.addEventListener('lostpointercapture', () => { dragging = false; });
  overlay.tabIndex = 0;
  overlay.setAttribute('aria-label', 'Frame ruler. Arrow keys move the selected point by one pixel. Hold Shift for ten.');
  byId('endpoint').addEventListener('change', () => { overlay.focus(); render(); });
  overlay.addEventListener('keydown', event => {
    const directions = {ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1]};
    const delta = directions[event.key];
    if (!delta) return;
    event.preventDefault();
    const point = points[Number(byId('endpoint').value)];
    const step = event.shiftKey ? 10 : 1;
    point.x = Math.max(0, Math.min(1, point.x + delta[0] * step / overlay.width));
    point.y = Math.max(0, Math.min(1, point.y + delta[1] * step / 540));
    render();
  });

  byId('save').addEventListener('click', () => {
    if (!poster.naturalWidth && video.readyState < 2) return;
    const square = byId('format').value === 'square';
    const frame = document.createElement('canvas');
    frame.width = square ? 540 : 960;
    frame.height = 540;
    drawFrame(frame, square);
    const card = document.createElement('canvas');
    card.width = frame.width + 40;
    card.height = 652;
    const paint = card.getContext('2d');
    paint.fillStyle = '#fff9ed';
    paint.fillRect(0, 0, card.width, card.height);
    paint.drawImage(frame, 20, 20);
    paint.fillStyle = '#242b25';
    paint.font = 'italic 30px Georgia';
    paint.fillText('Dhaka, Bangladesh', 20, 600);
    paint.font = '15px monospace';
    paint.textAlign = 'right';
    paint.fillText('anwar.bd', card.width - 20, 600);
    paint.textAlign = 'left';
    paint.font = '12px sans-serif';
    paint.fillText('Frame adapted from Lightdn’s rickshaw ride · Wikimedia Commons', 20, 622);
    paint.fillText('creativecommons.org/licenses/by-sa/4.0/', 20, 639);
    card.toBlob(blob => {
      if (!blob) return;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'postcard-from-dhaka.png';
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 30000);
    });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
  render();
})();
