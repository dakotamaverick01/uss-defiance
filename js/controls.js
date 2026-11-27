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
  const wall = raycaster.intersectObjects(OCCLUDERS, false).filter((h) => shown(h.object)), wd = wall.length ? wall[0].distance : Infinity;
  const hits = raycaster.intersectObjects(hitVolumes, false).filter((h) => h.distance < wd && shown(h.object.parent) && !(state.sitting && h.object.userData.station === 'command'));
  return hits.length ? { station: hits[0].object.userData.station, d: hits[0].distance } : null;
}
function inReach(h) { if (!h || !STATIONS[h.station]) return false; if (h.station === 'viewer' || h.station === 'ship') return h.d < 10; if (state.sitting && h.station === 'command') return true; return h.d <= REACH; }
function interactAt(cx, cy) {
  const h = pick(cx, cy);
  if (!h || !STATIONS[h.station]) return;
  if (!inReach(h)) { toast(`Walk closer to use ${STATIONS[h.station].title}.`); return; }
  openStation(h.station);
}
// ---------- free mouse look (desktop): pointer lock ----------
// Click the view once and the browser hides the cursor and hands every mouse movement to the camera: no dragging,
// which is hard on a trackpad. The dot in the middle is the aim (click or E to use what it is on); Esc gives the
// cursor back, and so does opening a station's panel. Where the page may not lock the pointer (some embeds), the
// old drag-to-look still works.
const look = { ok: !isTouch && 'requestPointerLock' in canvas, failed: false, pending: '', misses: 0, told: false, sens: 0.0026 };
const locked = () => document.pointerLockElement === canvas;
function lockLook(fromClick) {
  if (!look.ok || look.failed || locked() || state.open || !$('intro').hidden) return;
  if (!fromClick && performance.now() - (look.esc || -1e9) < 800) return; // Esc means "give me the cursor": only a click takes it back
  look.pending = fromClick ? 'click' : 'soft';
  try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (err) { look.pending = ''; }
}
function unlockLook() { if (locked()) document.exitPointerLock(); }
document.addEventListener('pointerlockchange', () => {
  const on = locked(); look.pending = ''; if (on) look.misses = 0; document.body.classList.toggle('mouselook', on);
  if (on && !look.told) { look.told = true; toast('Mouse look is on: just move the mouse. Esc frees the cursor; click the view to look again.', 'Controls'); }
});
// a lock refused twice in a row on a click means the page isn't allowed to lock here: fall back to drag-to-look
// (a single refusal can just be the browser's short cool-down after Esc)
document.addEventListener('pointerlockerror', () => {
  if (look.pending === 'click' && ++look.misses >= 2) { look.failed = true; toast('This page can’t capture the mouse here, so drag to look instead.', 'Controls'); }
  look.pending = '';
});
document.addEventListener('mousemove', (e) => {
  if (!locked()) return;
  player.yaw -= e.movementX * look.sens; player.pitch = clamp(player.pitch - e.movementY * look.sens, -1.25, 1.25);
});
canvas.addEventListener('pointerdown', (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  const p = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, mode: 'look', type: e.pointerType };
  if (e.pointerType === 'mouse') { p.wasLocked = locked(); if (!p.wasLocked && look.ok && !look.failed) { p.lockClick = true; lockLook(true); } }
  if (e.pointerType !== 'mouse' && e.clientX < window.innerWidth * 0.45 && !stick.active && !state.sitting) {
    p.mode = 'stick'; stick.active = true; stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stick.dx = stick.dy = 0;
    ui.stick.hidden = false; ui.stick.classList.remove('ghost'); ui.stick.classList.add('live');
    ui.stick.style.left = e.clientX + 'px'; ui.stick.style.top = e.clientY + 'px'; ui.knob.style.transform = '';
  }
  pointers.set(e.pointerId, p);
});
canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId); if (!p) return;
  if (p.type === 'mouse' && locked()) return; // the mousemove handler above turns the camera
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
  if (p.moved < 10 && performance.now() - p.t < 450 && e.type === 'pointerup') {
    if (p.wasLocked) interactAt(window.innerWidth / 2, window.innerHeight / 2); // locked: the click acts on the aim dot
    else if (!p.lockClick || look.failed) interactAt(e.clientX, e.clientY); // the click that grabs the mouse only grabs it
  }
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
  if (e.code === 'Escape') { look.esc = performance.now(); if (!$('intro').hidden) hideIntro(); else closePanel(); }
  if ((e.code === 'KeyE' || e.code === 'Enter') && $('intro').hidden && target) openStation(target.station);
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

const controls = isTouch
  ? [['Look', 'Drag anywhere on the right side'], ['Walk', 'Drag the stick on the left side'], ['Use', 'Tap a station when you are close']]
  : [['Look', 'Click the view, then just move the mouse. Esc frees the cursor'], ['Walk', 'W A S D or the arrow keys'], ['Use', 'Put the dot on a station and click, or press E']];
$('controls').replaceChildren(...controls.map(([k, v]) => { const li = document.createElement('li'); const b = document.createElement('b'); b.textContent = k; li.append(b, document.createTextNode(v)); return li; }));
function hideIntro() { $('intro').hidden = true; initAudio(); canvas.focus({ preventScroll: true }); lockLook(); }
$('board-btn').addEventListener('click', hideIntro);
$('help-btn').addEventListener('click', () => { unlockLook(); $('intro').hidden = false; $('board-btn').textContent = 'Back to the bridge'; $('board-btn').focus(); });

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
