// USS Defiance · orbit.js
// The outside view (roadmap 4, exterior stage 4): a button (or the O key) takes you out of the ship to a camera that
// circles her. Drag to turn round her, pinch or scroll to come closer or stand off, and she turns slowly by herself
// while you leave her be (not with reduced motion). Close (or Esc, or O again) puts you back exactly where you were:
// nothing inside moves while you are out. The view has its own copy of the ship (exterior.js buildExterior; the full
// model, or the lighter one on the Phone tier) in a scene of its own, with stars behind.
// Files share one global scope and load in order (see index.html).
'use strict';

const ORBIT = { on: false, sc: null, cam: null, model: null, tier: null, yaw: 2.35, pitch: 0.32, dist: 0, fit: 300, vyaw: 0, idle: 0, t: 0, pts: new Map(), pinch: 0 };

// the overlay: it takes every touch and click while you are outside, so walking and looking inside never see them
const orbitUI = (() => {
  const st = document.createElement('style');
  st.textContent = `#orbit{position:fixed;inset:0;z-index:30;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}
#orbit.drag{cursor:grabbing}#orbit[hidden]{display:none}
#orbit .o-top{position:absolute;left:max(16px,env(safe-area-inset-left));right:max(16px,env(safe-area-inset-right));top:max(14px,env(safe-area-inset-top));display:flex;justify-content:space-between;align-items:flex-start;gap:12px;pointer-events:none}
#orbit .o-name{font:600 18px/1.1 Antonio,'Arial Narrow',sans-serif;letter-spacing:.08em;color:#E8A06A;text-transform:uppercase}
#orbit .o-sub{font:500 13px/1.3 Antonio,'Arial Narrow',sans-serif;letter-spacing:.06em;color:#D9B07E;text-transform:uppercase;margin-top:3px}
#orbit button{pointer-events:auto;min-width:44px;height:44px;padding:0 16px;border-radius:22px;border:0;background:#E8A06A;color:#120c08;font:600 15px Antonio,'Arial Narrow',sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
#orbit button:focus-visible{outline:2px solid #F5E6CF;outline-offset:3px}
#orbit .o-hint{position:absolute;left:0;right:0;bottom:max(18px,env(safe-area-inset-bottom));text-align:center;font:500 14px Antonio,'Arial Narrow',sans-serif;letter-spacing:.06em;color:#D9B07E;text-transform:uppercase;pointer-events:none;transition:opacity 1s}
#orbit .o-wait{position:absolute;inset:0;display:grid;place-items:center;font:600 16px Antonio,'Arial Narrow',sans-serif;letter-spacing:.1em;color:#E8A06A;text-transform:uppercase;pointer-events:none}
.orbiting .hud-top,.orbiting #stick,.orbiting #reticle,.orbiting #hint{visibility:hidden}`;
  document.head.appendChild(st);
  const el = document.createElement('div'); el.id = 'orbit'; el.hidden = true;
  el.innerHTML = `<div class="o-top"><div><div class="o-name">USS Defiance</div><div class="o-sub">Outside view · EV-0408</div></div><button type="button" id="orbit-close">Back inside</button></div>
<div class="o-hint" id="orbit-hint"></div><div class="o-wait" id="orbit-wait" hidden>Stepping outside…</div>`;
  document.body.appendChild(el);
  // the button that opens it, beside the help button in the top bar
  const b = document.createElement('button'); b.className = 'icon-btn'; b.id = 'orbit-btn'; b.type = 'button'; b.setAttribute('aria-label', 'Outside view');
  b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(-18 12 12)"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/></svg>';
  const help = document.getElementById('help-btn'); if (help) help.parentNode.insertBefore(b, help);
  return { el, btn: b, hint: el.querySelector('#orbit-hint'), wait: el.querySelector('#orbit-wait') };
})();

function orbitScene() {
  const tier = QUALITY.tier, lite = tier === 'phone';
  if (ORBIT.sc && ORBIT.tier === tier) return;
  if (ORBIT.model) { ORBIT.sc.remove(ORBIT.model); ORBIT.model.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
  if (!ORBIT.sc) {
    const sc = new THREE.Scene(); sc.background = new THREE.Color(0x000000);
    const n = 3200, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), r = mulberry(909);
    for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u), b = 0.45 + r() * 0.55, w = r();
      pos.set([Math.cos(a) * s * 3000, u * 3000, Math.sin(a) * s * 3000], i * 3); col.set([b * (w < 0.2 ? 0.85 : 1), b * 0.95, b * (w > 0.8 ? 1.1 : 0.95)], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    sc.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, vertexColors: true, depthWrite: false, toneMapped: false, fog: false })));
    ORBIT.sc = sc; ORBIT.cam = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 9000);
  }
  ORBIT.model = buildExterior(lite ? { lite: true } : { lite: false }); ORBIT.model.name = 'Exterior (outside view)'; ORBIT.tier = tier;
  ORBIT.sc.add(ORBIT.model); ORBIT.model.updateMatrixWorld(true);
  const bs = new THREE.Box3().setFromObject(ORBIT.model).getBoundingSphere(new THREE.Sphere()); ORBIT.centre = bs.center; ORBIT.radius = bs.radius;
}

function orbitOpen() {
  if (ORBIT.on || state.open) return;
  if (typeof unlockLook === 'function') unlockLook(); for (const k in keys) keys[k] = false;
  ORBIT.on = true; ORBIT.idle = 0; ORBIT.vyaw = 0; orbitUI.el.hidden = false; document.body.classList.add('orbiting');
  orbitUI.hint.textContent = isTouch ? 'Drag to turn · pinch to zoom' : 'Drag to turn · scroll to zoom · Esc to go back inside'; orbitUI.hint.style.opacity = 1;
  setTimeout(() => { orbitUI.hint.style.opacity = 0.35; }, 4000);
  if (!ORBIT.sc || ORBIT.tier !== QUALITY.tier) { orbitUI.wait.hidden = false; setTimeout(() => { orbitScene(); orbitUI.wait.hidden = true; }, 30); } // let "Stepping outside" show while the model builds
  document.getElementById('orbit-close').focus({ preventScroll: true });
}
function orbitClose() {
  if (!ORBIT.on) return; ORBIT.on = false; orbitUI.el.hidden = true; document.body.classList.remove('orbiting'); ORBIT.pts.clear();
  orbitUI.btn.focus({ preventScroll: true });
}

// drag to turn, pinch or scroll to zoom
{ const el = orbitUI.el, zoom = (f) => { ORBIT.dist = clamp(ORBIT.dist * f, ORBIT.fit * 0.22, ORBIT.fit * 1.6); ORBIT.idle = 0; };
  el.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } ORBIT.pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); el.classList.add('drag'); ORBIT.idle = 0; ORBIT.vyaw = 0; });
  el.addEventListener('pointermove', (e) => { const p = ORBIT.pts.get(e.pointerId); if (!p) return;
    if (ORBIT.pts.size === 1) { const dx = e.clientX - p.x, dy = e.clientY - p.y, s = 0.0055;
      ORBIT.yaw -= dx * s; ORBIT.pitch = clamp(ORBIT.pitch + dy * s, -1.35, 1.35); ORBIT.vyaw = -dx * s * 30; }
    p.x = e.clientX; p.y = e.clientY;
    if (ORBIT.pts.size === 2) { const [a, b] = [...ORBIT.pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (ORBIT.pinch) zoom(ORBIT.pinch / d); ORBIT.pinch = d; }
    ORBIT.idle = 0; });
  const up = (e) => { ORBIT.pts.delete(e.pointerId); ORBIT.pinch = 0; if (!ORBIT.pts.size) el.classList.remove('drag'); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', (e) => { e.preventDefault(); zoom(Math.exp(clamp(e.deltaY, -120, 120) * 0.0015)); }, { passive: false });
  document.getElementById('orbit-close').addEventListener('click', orbitClose);
  orbitUI.btn.addEventListener('click', orbitOpen);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyO' && $('intro').hidden && !state.open && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) { ORBIT.on ? orbitClose() : orbitOpen(); }
    else if (e.code === 'Escape' && ORBIT.on) orbitClose();
    else if (ORBIT.on && /Arrow/.test(e.code)) { ORBIT.yaw += e.code === 'ArrowLeft' ? 0.08 : e.code === 'ArrowRight' ? -0.08 : 0; if (e.code === 'ArrowUp') zoom(0.92); if (e.code === 'ArrowDown') zoom(1.08); }
  }); }

// one frame of the outside view (render.js calls this instead of drawing the inside while you are out)
function orbitFrame(dt) {
  if (!ORBIT.model) return; ORBIT.t += dt; ORBIT.idle += dt;
  // a little drift after you let go, then a slow turn of her own once you have left her alone for a few seconds
  ORBIT.yaw += ORBIT.vyaw * dt; ORBIT.vyaw *= Math.exp(-dt * 3);
  if (!reduceMotion && ORBIT.idle > 4 && !ORBIT.pts.size) ORBIT.yaw += dt * 0.05 * Math.min(1, (ORBIT.idle - 4) / 3);
  const c = ORBIT.centre, cam = ORBIT.cam, cp = Math.cos(ORBIT.pitch), w = window.innerWidth, h = window.innerHeight;
  cam.aspect = w / h; cam.fov = w < h ? 52 : 36; cam.updateProjectionMatrix();
  // the distance at which her bounds (glows and plumes included) fit this screen; you start a little closer than that
  { const vf = cam.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect); ORBIT.fit = ORBIT.radius * 1.05 / Math.sin(Math.min(vf, hf) / 2);
    if (!ORBIT.dist) ORBIT.dist = ORBIT.fit * (w < h ? 0.78 : 0.6); ORBIT.dist = clamp(ORBIT.dist, ORBIT.fit * 0.22, ORBIT.fit * 1.6); }
  cam.position.set(c.x + Math.sin(ORBIT.yaw) * cp * ORBIT.dist, c.y + Math.sin(ORBIT.pitch) * ORBIT.dist, c.z + Math.cos(ORBIT.yaw) * cp * ORBIT.dist);
  cam.lookAt(c); cam.updateMatrixWorld();
  if (ORBIT.model.userData.update) ORBIT.model.userData.update(dt, ORBIT.t);
  renderer.setRenderTarget(null); renderer.render(ORBIT.sc, cam);
}
