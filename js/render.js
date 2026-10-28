// USS Defiance · render.js
// Atmosphere (shadows, light shafts, dust), post-processing, hero shots and the frame loop.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- atmosphere: shadow flags, light shafts, dust ----------
scene.traverse((o) => {
  if (!o.isMesh || o.layers.mask !== 1 || o.visible === false) return;
  const m = o.material, basic = Array.isArray(m) ? false : (m.isMeshBasicMaterial || m.transparent);
  if (basic) return;
  const pl = o.geometry && o.geometry.type === 'PlaneGeometry', sh = o.geometry && (o.geometry.type === 'ShapeGeometry');
  o.receiveShadow = true;
  o.castShadow = !pl && !sh && o.position.y < 3.0;
});
const shaftTex = linearTex('rgba(255,232,206,1)', 'rgba(255,232,206,0)');
const shafts = [];
DOWNLIGHTS.slice(0, 3).forEach(([x, z], i) => {
  const m = mesh(new THREE.CylinderGeometry(0.1, 1.0, WALL_H - 0.05, 28, 1, true), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.03, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false }), x, (WALL_H - 0.05) / 2, z);
  shafts.push({ m, ph: i * 1.3 });
});
const N_DUST = isMobile ? 220 : 420;
const dustPos = new Float32Array(N_DUST * 3), dustSeed = new Float32Array(N_DUST * 4);
{
  const r = mulberry(77);
  for (let i = 0; i < N_DUST; i++) { dustSeed.set([(r() - 0.5) * 9, 0.3 + r() * 2.8, (r() - 0.5) * 9, r() * 6.28], i * 4); }
  const dc = cnv(32, 32), dg = dc.getContext('2d'), gr = dg.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,240,220,1)'); gr.addColorStop(1, 'rgba(255,240,220,0)'); dg.fillStyle = gr; dg.fillRect(0, 0, 32, 32);
  var dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  var dust = add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.014, map: tex(dc), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })));
  dust.frustumCulled = false;
}
function updateDust(t) {
  for (let i = 0; i < N_DUST; i++) {
    const o = i * 4, ph = dustSeed[o + 3];
    dustPos[i * 3] = dustSeed[o] + Math.sin(t * 0.05 + ph) * 0.4;
    dustPos[i * 3 + 1] = 0.3 + ((dustSeed[o + 1] + t * 0.03 + Math.sin(t * 0.2 + ph) * 0.05) % 2.9);
    dustPos[i * 3 + 2] = dustSeed[o + 2] + Math.cos(t * 0.04 + ph) * 0.4;
  }
  dustGeo.attributes.position.needsUpdate = true;
}

// ---------- bloom (falls back to a plain render if the effect scripts are missing) ----------
let composer = null, bloom = null;
try {
  if (THREE.EffectComposer && THREE.UnrealBloomPass && THREE.GammaCorrectionShader) {
    const pr = renderer.getPixelRatio();
    const target = new THREE.WebGLRenderTarget(window.innerWidth * pr, window.innerHeight * pr, { type: THREE.UnsignedByteType, samples: 4 });
    composer = new THREE.EffectComposer(renderer, target);
    // 8-bit buffer as in r128: over-bright strips clip at white before bloom. Stage 2 moves this to a full HDR pipeline.
    // Tone map inside each material (as r128 did) so screens marked toneMapped:false keep their exact colours.
    // three.js only does that for screen or XR targets, so the composer's buffers are flagged as XR targets.
    [composer.renderTarget1, composer.renderTarget2].forEach((t) => { t.isXRRenderTarget = true; t.texture.colorSpace = THREE.LinearSRGBColorSpace; });
    composer.addPass(new THREE.RenderPass(scene, camera));
    bloom = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 0.62 / 3, 0.55, 0.84); // newer bloom triples strength internally
    // r128's bloom used 8-bit buffers, which capped the glow; keep that until Stage 2 retunes bloom in HDR.
    [bloom.renderTargetBright, ...bloom.renderTargetsHorizontal, ...bloom.renderTargetsVertical].forEach((t) => { t.texture.type = THREE.UnsignedByteType; });
    composer.addPass(bloom);
    composer.addPass(new THREE.ShaderPass(THREE.GammaCorrectionShader));
  }
} catch (e) { console.warn('Post-processing unavailable', e); composer = null; }

// attract mode: a slow glide around the bridge while the title card is up
let attract = true, attractT = 0;
const _lc = new THREE.Vector3();
const ATTRACT_LOOK = new THREE.Vector3();

// ---------- hero shots: fixed cameras for judging each visual stage side by side ----------
// Call DEFIANCE_HERO(1..6) from the console (or a test); DEFIANCE_HERO(0) returns to normal play.
const HERO_SHOTS = [
  { name: 'Bridge wide', p: [-2.9, 1.8, 4.3], t: [1.0, 1.15, -4.6] },
  { name: "Captain's view", p: [0, DAIS.h + 1.16, 0.48], t: [0, 1.62, -5.2] },
  { name: 'Port stations', p: [1.7, 1.62, -0.5], t: [-5.2, 1.05, 0.4] },
  { name: 'Ready room', room: 'Ready Room', p: [2.6, 1.62, 0.45], t: [0.4, 1.05, 4.3] },
  { name: 'Conference room', room: 'Conference Room', p: [-3.35, 1.65, 0.55], t: [0.9, 0.9, 3.3] },
  { name: 'Red alert', alert: 'red', p: [4.3, 1.7, -1.9], t: [-2.2, 1.0, 3.2] },
];
let heroCam = null;
const _heroHidden = [];
window.DEFIANCE_HERO = function (n) {
  _heroHidden.splice(0).forEach(([el, v]) => { el.style.visibility = v; });
  const S = HERO_SHOTS[n - 1];
  if (!S) { heroCam = null; setAlert('green'); return null; }
  $('intro').hidden = true; attract = false; closePanel();
  setAlert(S.alert || 'green');
  const p = new THREE.Vector3().fromArray(S.p), t = new THREE.Vector3().fromArray(S.t);
  if (S.room) { const r = ROOMS.find((q) => q.label === S.room); r.g.updateMatrixWorld(true); r.g.localToWorld(p); r.g.localToWorld(t); }
  heroCam = { p, t };
  document.body.querySelectorAll('*').forEach((el) => { if (el !== canvas && !el.contains(canvas)) { _heroHidden.push([el, el.style.visibility]); el.style.visibility = 'hidden'; } });
  return S.name;
};

// ---------- loop ----------
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.fov = w < h ? 80 : 66; camera.updateProjectionMatrix();
  if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
}
window.addEventListener('resize', resize); resize();

const clock = { last: performance.now(), getDelta() { const n = performance.now(), d = (n - this.last) / 1000; this.last = n; return d; } };
let wasWarp = false, rr = 0, rrTimer = 0, panelTimer = 0, ovTimer = 0, bobT = 0, bobAmp = 0;
const standV = new THREE.Vector3();
function wrapA(a) { return ((a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; }

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05); elapsed += dt;

  if (!state.sitting) {
    let f = 0, s = 0;
    if (keys.KeyW || keys.ArrowUp) f += 1; if (keys.KeyS || keys.ArrowDown) f -= 1;
    if (keys.KeyD) s += 1; if (keys.KeyA) s -= 1;
    if (keys.ArrowLeft) player.yaw += 1.9 * dt; if (keys.ArrowRight) player.yaw -= 1.9 * dt;
    if (stick.active) { f += -stick.dy; s += stick.dx; }
    const len = Math.hypot(f, s); if (len > 1) { f /= len; s /= len; }
    if (len > 0.02) {
      const sy = Math.sin(player.yaw), cy = Math.cos(player.yaw), sp = 2.2;
      [player.x, player.z] = collide(player.x + (-sy * f + cy * s) * sp * dt, player.z + (-cy * f - sy * s) * sp * dt);
    }
    player.y += (floorH(player.x, player.z) + EYE - player.y) * Math.min(1, dt * 10);
  } else if (sitBlend < 0.995) {
    const k = 1 - Math.exp(-dt * 5); player.yaw += wrapA(0 - player.yaw) * k; player.pitch += (-0.04 - player.pitch) * k;
  }
  sitBlend = clamp(sitBlend + (state.sitting ? dt : -dt) * 1.6, 0, 1);
  const eb = sitBlend * sitBlend * (3 - 2 * sitBlend);
  standV.set(player.x, player.y, player.z);
  const moving = !state.sitting && (stick.active || keys.KeyW || keys.KeyS || keys.KeyA || keys.KeyD || keys.ArrowUp || keys.ArrowDown);
  bobAmp += ((moving && !reduceMotion ? 1 : 0) - bobAmp) * Math.min(1, dt * 6); bobT += dt * 8.5 * bobAmp;
  standV.y += Math.sin(bobT) * 0.018 * bobAmp;
  if (heroCam) {
    camera.position.copy(heroCam.p); camera.lookAt(heroCam.t);
  } else if (attract && !$('intro').hidden) {
    attractT += dt * (reduceMotion ? 0.02 : 0.06);
    const a = attractT + 2.2, rad = 3.3 + Math.sin(attractT * 0.7) * 0.5;
    camera.position.set(Math.sin(a) * rad, 1.95 + Math.sin(attractT * 0.9) * 0.15, 0.6 + Math.cos(a) * rad * 0.95);
    ATTRACT_LOOK.set(Math.sin(a + 2.6) * 1.2, 1.15, -1.2 + Math.cos(a + 2.6) * 1.2);
    camera.lookAt(ATTRACT_LOOK);
  } else {
    if (attract) { attract = false; }
    camera.position.copy(standV).lerp(SEAT, eb);
    camera.rotation.set(player.pitch, player.yaw, Math.sin(bobT * 0.5) * 0.004 * bobAmp, 'YXZ');
  }
  camera.updateMatrixWorld();

  const T = SPEEDS[state.speed], rate = 1 - Math.exp(-dt * 1.4);
  cur.speed += (T.speed - cur.speed) * rate; cur.len += (T.len - cur.len) * rate;
  if (cur.speed > 300) wasWarp = true;
  if (wasWarp && cur.speed < 200) { wasWarp = false; arrive(); }
  if (cur.speed > 0.3) {
    streaks.visible = true; streakMat.opacity = Math.min(1, cur.speed / 10) * 0.9;
    const L = cur.len + 0.15;
    for (let i = 0; i < N_STREAK; i++) {
      let z = streakXYZ[i * 3 + 2] + cur.speed * dt;
      if (z > FWD_Z - 1) { seedStreak(i, z - 360); z = streakXYZ[i * 3 + 2]; } else streakXYZ[i * 3 + 2] = z;
      const x = streakXYZ[i * 3], y = streakXYZ[i * 3 + 1], o = i * 6;
      streakPos[o] = x; streakPos[o + 1] = y; streakPos[o + 2] = z; streakPos[o + 3] = x; streakPos[o + 4] = y; streakPos[o + 5] = z - L;
    }
    streakGeo.attributes.position.needsUpdate = true;
  } else streaks.visible = false;

  const fade = 1 - smooth(30, 200, cur.speed);
  const wantTarget = state.view === 'target' && state.speed !== 'warp';
  const k2 = 1 - Math.exp(-dt * 2.5);
  vLook.lerp(wantTarget ? TARGET_LOOK : vFwd, k2);
  const wantFov = wantTarget ? TARGET_FOV : 36; if (Math.abs(vcam.fov - wantFov) > 0.01) { vcam.fov += (wantFov - vcam.fov) * k2; vcam.updateProjectionMatrix(); }
  vcam.lookAt(vLook); vcam.updateMatrixWorld();
  updateSpace(dt, fade); updateViewscreen(dt);
  const warpGlow = smooth(20, 300, cur.speed);
  lScreen.intensity = (0.35 + 0.8 * warpGlow + 0.06 * Math.sin(elapsed * 9) * warpGlow) * LIGHT_LEVELS[state.light] * LX_PUNCT;

  if (state.scanning) {
    state.scanT += dt;
    scanRing.material.opacity = 0.75 * Math.sin(Math.min(1, state.scanT / 2.6) * Math.PI);
    scanRing.rotation.set(Math.PI / 2 + Math.sin(state.scanT * 2.4) * 1.2, state.scanT * 0.8, 0);
    planetMat.uniforms.scan.value = scanRing.material.opacity;
    if (state.scanT > 2.6) { state.scanning = false; state.scanned = true; scanRing.material.opacity = 0; planetMat.uniforms.scan.value = 0; toast(`Scan complete on ${sysCur().planet}.`, 'Science'); beep([2093, 1568], 0.08, 0.035); renderPanel(); redrawAll(); }
  }

  holo.visible = state.holoOn; holoBeam.visible = state.holoOn;
  if (state.holoOn) {
    holo.rotation.y += dt * (reduceMotion ? 0.05 : 0.22);
    holoPlanets.forEach((p) => { p.a += dt * p.w; p.m.position.set(Math.cos(p.a) * p.r, 0, Math.sin(p.a) * p.r); });
    holoBeam.material.opacity = 0.05 + Math.sin(elapsed * 2) * 0.015;
  }

  DOORS.forEach((d) => {
    const near = d.auto && !state.sitting && Math.hypot(camera.position.x - d.wx, camera.position.z - d.wz) < (d.room ? 1.7 : 1.5);
    const want = (d.station === 'lift' && state.liftOpen) || near ? 1 : 0;
    d.open += (want - d.open) * Math.min(1, dt * 5);
    d.L.position.x = -0.3 - d.open * 0.56; d.Rr.position.x = 0.3 + d.open * 0.56;
  });
  // rooms: light the one you are in or approaching, name it in the HUD
  { let here = null;
    ROOMS.forEach((r) => {
      _lc.copy(camera.position); r.g.worldToLocal(_lc);
      const inside = _lc.x > r.xa && _lc.x < r.xb && _lc.z > 0 && _lc.z < r.d; if (inside) here = r;
      const near = Math.hypot(camera.position.x - r.door[0], camera.position.z - r.door[1]) < 3.2;
      r.k += ((inside ? 1 : near ? 0.75 : 0) - r.k) * Math.min(1, dt * 3);
      r.light.intensity = r.base * r.k * LIGHT_LEVELS[state.light] * (state.alert === 'red' ? 0.6 : 1) * LX_PUNCT * 1.25;
      r.light.color.setHex(state.alert === 'red' ? 0xff9a88 : 0xffdcb8);
    });
    const ll = here ? here.label : 'Main Bridge'; if (ll !== lastLoc) { lastLoc = ll; locNode.nodeValue = ll + ' · Deck 1'; } }
  { const closed = state.shutters === 'closed' || (state.shutters === 'auto' && state.alert === 'red');
    SHUTTERS.forEach((sh) => { sh.cur += ((closed ? 1 : 0) - sh.cur) * Math.min(1, dt * 2.2); const a = sh.cur * (Math.PI / 2 - 0.05); sh.slats.forEach((sl) => { sl.rotation.x = a; }); }); }
  if (cur.speed > 0.3) {
    extStreaks.visible = true; extMat.opacity = Math.min(1, cur.speed / 10) * 0.85; const L2 = 0.3 + cur.len * 0.45;
    for (let i = 0; i < EXT_N; i++) {
      let z = extXYZ[i * 3 + 2] + cur.speed * dt * 0.5;
      if (z > 90) { seedExt(i, z - 180); z = extXYZ[i * 3 + 2]; } else extXYZ[i * 3 + 2] = z;
      const x = extXYZ[i * 3], y = extXYZ[i * 3 + 1], o = i * 6;
      extPos[o] = x; extPos[o + 1] = y; extPos[o + 2] = z; extPos[o + 3] = x; extPos[o + 4] = y; extPos[o + 5] = z - L2;
    }
    extGeo.attributes.position.needsUpdate = true;
  } else extStreaks.visible = false;

  if (state.alert === 'red') {
    const k = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(elapsed * 4));
    stripMats.forEach((m) => m.color.setHex(ALERTS.red.strip).multiplyScalar(1.9 * k));
    slotMats.forEach((m) => m.color.setHex(ALERTS.red.slot).multiplyScalar(1.35 * (0.35 + 0.65 * k)));
    MAT.wall.emissiveIntensity = 0.3 + 0.7 * k;
  } else MAT.wall.emissiveIntensity = 0.7;

  if (AC && soundOn && elapsed > nextChirp) { nextChirp = elapsed + 3 + Math.random() * 6; const b = 1200 + Math.random() * 1200; beep(Math.random() < 0.5 ? [b, b * 1.25] : [b], 0.045, 0.012); }

  rrTimer += dt;
  if (rrTimer > 0.04) { rrTimer = 0; for (let k = 0; k < screens.length; k++) { const sc = screens[rr++ % screens.length]; if (!sc.wp) { sc.wp = new THREE.Vector3(); sc.mesh.getWorldPosition(sc.wp); } if (sc.wp.distanceToSquared(camera.position) < 72) { drawScreen(sc); break; } } }
  if (state.open && byStation[state.open]) { panelTimer += dt; if (panelTimer > 0.15) { panelTimer = 0; byStation[state.open].forEach((s) => { if (s.kind !== 'keys') drawScreen(s); }); } }
  ovTimer += dt; if (ovTimer > 1) { ovTimer = 0; drawOverlay(); }

  aimTimer += dt; if (aimTimer > 0.12) { aimTimer = 0; aim(); }

  scene.fog = null; renderer.setRenderTarget(rt); renderer.render(scene, vcam);
  updateDust(elapsed);
  shafts.forEach((s2) => { s2.m.material.opacity = (0.028 + Math.sin(elapsed * 0.7 + s2.ph) * 0.006) * LIGHT_LEVELS[state.light] * (state.alert === 'red' ? 0.5 : 1); });
  scene.fog = FOG; renderer.setRenderTarget(null);
  if (composer) composer.render(); else renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
setAlert('green');
requestAnimationFrame(frame);
