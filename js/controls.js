// USS Defiance · controls.js
// Player movement, touch and mouse input, aiming and highlights.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- player + input ----------
const player = { x: 3.1, z: 3.9, y: EYE, yaw: 0.38, pitch: -0.08 };
let sitBlend = 0;
const SEAT = new THREE.Vector3(0, DAIS.h + 1.16, 0.48);
const keys = {};
const stick = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
const pointers = new Map();
const raycaster = new THREE.Raycaster(); const ndc = new THREE.Vector2();
if (isTouch) ui.stick.hidden = false;
const REACH = 4.2;

function pick(cx, cy) {
  ndc.set(cx / window.innerWidth * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const wall = raycaster.intersectObjects(OCCLUDERS, false), wd = wall.length ? wall[0].distance : Infinity;
  const hits = raycaster.intersectObjects(hitVolumes, false).filter((h) => h.distance < wd && !(state.sitting && h.object.userData.station === 'command'));
  return hits.length ? { station: hits[0].object.userData.station, d: hits[0].distance } : null;
}
function inReach(h) { if (!h || !STATIONS[h.station]) return false; if (h.station === 'viewer' || h.station === 'ship') return h.d < 10; if (state.sitting && h.station === 'command') return true; return h.d <= REACH; }
function interactAt(cx, cy) {
  const h = pick(cx, cy);
  if (!h || !STATIONS[h.station]) return;
  if (!inReach(h)) { toast(`Walk closer to use ${STATIONS[h.station].title}.`); return; }
  openStation(h.station);
}
canvas.addEventListener('pointerdown', (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  const p = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, mode: 'look', type: e.pointerType };
  if (e.pointerType !== 'mouse' && e.clientX < window.innerWidth * 0.45 && !stick.active && !state.sitting) {
    p.mode = 'stick'; stick.active = true; stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stick.dx = stick.dy = 0;
    ui.stick.hidden = false; ui.stick.classList.remove('ghost'); ui.stick.classList.add('live');
    ui.stick.style.left = e.clientX + 'px'; ui.stick.style.top = e.clientY + 'px'; ui.knob.style.transform = '';
  }
  pointers.set(e.pointerId, p);
});
canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId); if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; p.moved += Math.abs(dx) + Math.abs(dy);
  if (p.mode === 'stick') {
    let sx = e.clientX - stick.ox, sy = e.clientY - stick.oy; const d = Math.hypot(sx, sy), max = 46;
    if (d > max) { sx *= max / d; sy *= max / d; }
    stick.dx = sx / max; stick.dy = sy / max; ui.knob.style.transform = `translate(${sx}px, ${sy}px)`;
  } else {
    const sens = p.type === 'mouse' ? 0.0036 : 0.0058;
    player.yaw -= dx * sens; player.pitch = clamp(player.pitch - dy * sens, -1.25, 1.25);
  }
});
function endPointer(e) {
  const p = pointers.get(e.pointerId); if (!p) return; pointers.delete(e.pointerId);
  if (p.moved < 10 && performance.now() - p.t < 450 && e.type === 'pointerup') interactAt(e.clientX, e.clientY);
  if (p.mode === 'stick') {
    stick.active = false; stick.dx = stick.dy = 0; ui.stick.classList.remove('live'); ui.stick.classList.add('ghost');
    ui.stick.style.left = ''; ui.stick.style.top = ''; ui.knob.style.transform = '';
  }
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('keydown', (e) => {
  if (e.target && e.target.tagName === 'BUTTON' && (e.code === 'Enter' || e.code === 'Space')) return;
  keys[e.code] = true;
  if (e.code === 'Escape') { if (!$('intro').hidden) hideIntro(); else closePanel(); }
  if ((e.code === 'KeyE' || e.code === 'Enter') && $('intro').hidden && target) openStation(target.station);
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; stick.active = false; stick.dx = stick.dy = 0; });
window.addEventListener('pointerup', (e) => { if (stick.id === e.pointerId) { stick.active = false; stick.dx = stick.dy = 0; } });
window.addEventListener('pointercancel', (e) => { if (stick.id === e.pointerId) { stick.active = false; stick.dx = stick.dy = 0; } });

const controls = isTouch
  ? [['Look', 'Drag anywhere on the right side'], ['Walk', 'Drag the stick on the left side'], ['Use', 'Tap a station when you are close']]
  : [['Look', 'Drag with the mouse'], ['Walk', 'W A S D or the arrow keys'], ['Use', 'Click a station, or press E when it is centered']];
$('controls').replaceChildren(...controls.map(([k, v]) => { const li = document.createElement('li'); const b = document.createElement('b'); b.textContent = k; li.append(b, document.createTextNode(v)); return li; }));
function hideIntro() { $('intro').hidden = true; initAudio(); canvas.focus({ preventScroll: true }); }
$('board-btn').addEventListener('click', hideIntro);
$('help-btn').addEventListener('click', () => { $('intro').hidden = false; $('board-btn').textContent = 'Back to the bridge'; $('board-btn').focus(); });

// ---------- aim + highlight ----------
let target = null, targetKey = '', aimTimer = 0;
function updateHighlights() {
  const st = target && target.station;
  screens.forEach((s) => { const on = s.station === st || s.station === state.open; s.mat.color.setScalar(on ? 1.22 : 1); });
}
function aim() {
  const h = pick(window.innerWidth / 2, window.innerHeight / 2);
  const next = h && inReach(h) ? h : null;
  const key = next ? next.station : '';
  if (key !== targetKey) { target = next; targetKey = key; updateHighlights(); }
  ui.reticle.classList.toggle('live', !!target);
  const show = target && state.open !== target.station && $('intro').hidden;
  ui.hint.hidden = !show;
  if (show) ui.hint.textContent = `${isTouch ? 'Tap' : 'Click or press E'} · ${STATIONS[target.station].title}`;
}