// USS Defiance · render.js
// Atmosphere (shadows, light shafts), post-processing, hero shots and the frame loop.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- atmosphere: shadow flags, light shafts ----------
scene.traverse((o) => {
  if (!o.isMesh || o.layers.mask !== 1 || o.visible === false) return;
  const m = o.material, basic = Array.isArray(m) ? false : (m.isMeshBasicMaterial || m.transparent);
  if (basic) return;
  const pl = o.geometry && o.geometry.type === 'PlaneGeometry', sh = o.geometry && (o.geometry.type === 'ShapeGeometry');
  o.receiveShadow = true;
  o.castShadow = !pl && !sh && o.position.y < 3.0;
});
// Light shafts in the haze under each downlight and the coffer. They fade toward their silhouettes and toward the floor,
// so they read as lit air rather than solid cones.
const shaftMat = new THREE.ShaderMaterial({
  uniforms: { col: { value: new THREE.Color(1.0, 0.88, 0.74) }, k: { value: 0.06 } },
  vertexShader: `varying vec3 vN, vV; varying float vH;
    void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = cameraPosition - wp.xyz;
      vH = clamp(wp.y / ${WALL_H.toFixed(2)}, 0.0, 1.0); gl_Position = projectionMatrix * viewMatrix * wp; }`,
  fragmentShader: `uniform vec3 col; uniform float k; varying vec3 vN, vV; varying float vH;
    void main() { float f = abs(dot(normalize(vN), normalize(vV)));
      float a = f * f * f * f * smoothstep(0.05, 0.8, vH) * vH;
      gl_FragColor = vec4(col * a * k, 1.0); }`,
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false,
});
const shafts = [];
(isMobile ? DOWNLIGHTS.slice(0, 3) : DOWNLIGHTS).forEach(([x, z]) => {
  shafts.push(mesh(new THREE.CylinderGeometry(0.11, 0.95, WALL_H - 0.02, 28, 1, true), shaftMat, x, (WALL_H - 0.02) / 2, z));
});
shafts.push(mesh(new THREE.CylinderGeometry(1.35, 1.9, WALL_H - 0.02, 40, 1, true), shaftMat.clone(), COFFER.x, (WALL_H - 0.02) / 2, COFFER.z));
shafts[shafts.length - 1].material.uniforms.k.value = 0.035;
// (no floating dust motes: they read as glowing specks; the light shafts stay)

// ---------- post effects ----------
// Materials tone-map themselves (so screens marked toneMapped:false keep their exact colours); three.js only does that
// when drawing to the screen or an XR target, so the effect buffers are flagged as XR targets.
// Preferred: pmndrs "postprocessing" with N8AO (soft ambient occlusion: the contact shadows where things meet) and a
// mip-mapped bloom for screen glow. AO runs on desktop only (phones keep their frame rate). If those libraries didn't
// load, three.js's own bloom is used as before; if that fails too, a plain render.
let composer = null, bloom = null, aoPass = null;
const POST = { kind: 'none' };
// knobs perf.js can turn: display redraws per frame, whether the bridge viewscreen renders, and the measured
// time this code spends preparing each frame on the processor (cpu, ms)
const PERF_OPT = { screens: isMobile ? 2 : 4, viewscreen: true, cpu: 0 };
function flagXR(t) { if (t) { t.isXRRenderTarget = true; t.texture.colorSpace = THREE.LinearSRGBColorSpace; } }
try {
  if (THREE.PP) {
    const PP = THREE.PP;
    composer = new PP.EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: isMobile ? 0 : 4 });
    flagXR(composer.inputBuffer); flagXR(composer.outputBuffer);
    composer.addPass(new PP.RenderPass(scene, camera));
    if (THREE.N8AOPostPass && !isMobile) {
      aoPass = new THREE.N8AOPostPass(scene, camera, window.innerWidth, window.innerHeight);
      Object.assign(aoPass.configuration, { aoRadius: 0.45, distanceFalloff: 0.45, intensity: 1.7, aoSamples: 12, denoiseSamples: 6, denoiseRadius: 6, halfRes: false, gammaCorrection: false, color: new THREE.Color(0x000000) });
      aoPass.setQualityMode && aoPass.setQualityMode('Medium'); aoPass.configuration.halfRes = false; aoPass.configuration.gammaCorrection = false;
      composer.addPass(aoPass);
    }
    bloom = new PP.BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.8, luminanceSmoothing: 0.12, intensity: 0.75, radius: 0.62, levels: isMobile ? 5 : 7 });
    composer.addPass(new PP.EffectPass(camera, bloom));
    POST.kind = aoPass ? 'pmndrs+ao' : 'pmndrs';
  } else if (THREE.EffectComposer && THREE.UnrealBloomPass && THREE.GammaCorrectionShader) {
    const pr = renderer.getPixelRatio();
    const target = new THREE.WebGLRenderTarget(window.innerWidth * pr, window.innerHeight * pr, { type: THREE.UnsignedByteType, samples: 4 });
    composer = new THREE.EffectComposer(renderer, target);
    [composer.renderTarget1, composer.renderTarget2].forEach(flagXR);
    composer.addPass(new THREE.RenderPass(scene, camera));
    bloom = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 0.62 / 3, 0.55, 0.84); // newer bloom triples strength internally
    [bloom.renderTargetBright, ...bloom.renderTargetsHorizontal, ...bloom.renderTargetsVertical].forEach((t) => { t.texture.type = THREE.UnsignedByteType; });
    composer.addPass(bloom);
    composer.addPass(new THREE.ShaderPass(THREE.GammaCorrectionShader));
    POST.kind = 'three';
  }
} catch (e) { console.warn('Post-processing unavailable', e); composer = null; POST.kind = 'none'; }
window.DEFIANCE_POST = POST;

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
  { name: 'Ready room', room: 'Ready Room', p: [4.75, 1.62, 0.6], t: [0.2, 1.0, 4.4] },
  { name: 'Conference room', room: 'Conference Room', p: [-3.6, 1.65, 0.6], t: [1.4, 0.9, 4.2] },
  { name: 'Red alert', alert: 'red', p: [4.3, 1.7, -1.9], t: [-2.2, 1.0, 3.2] },
  { name: 'Console close-up', p: [-4.85, 1.42, -1.05], t: [-5.95, 0.92, -1.62] },
  { name: 'Chair close-up', p: [-0.85, 1.2, -0.55], t: [0, 0.68, 0.42] },
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

// ---------- the viewscreen as a window ----------
// An off-axis projection: the space camera's view is skewed so its edges pass through the screen's edges as seen from
// the player's eye. Step left and more of the right-hand scene comes into view; step closer and the view widens,
// as through a real window. Damped (VIEW_PARALLAX) so the composition holds.
const VIEW_PARALLAX = { side: 0.55, depth: 0.3 };
function viewWindow() {
  const tH = Math.tan(vcam.fov * D2R / 2), tW = tH * vcam.aspect, d0 = (VS_H / 2) / tH, n = vcam.near;
  const e = camera.position, ex = (e.x - 0) * VIEW_PARALLAX.side, ey = (e.y - VS_Y) * VIEW_PARALLAX.side;
  const d = Math.max(1.2, d0 + (Math.max(0.8, e.z - VS_Z) - d0) * VIEW_PARALLAX.depth), k = d0 / d;
  vcam.projectionMatrix.makePerspective(n * (-tW * k - ex / d), n * (tW * k - ex / d), n * (tH * k - ey / d), n * (-tH * k - ey / d), n, vcam.far);
  vcam.projectionMatrixInverse.copy(vcam.projectionMatrix).invert();
}

// ---------- loop ----------
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.fov = w < h ? 80 : 66; camera.updateProjectionMatrix();
  if (composer) { if (POST.kind === 'three') composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); flagXR(composer.inputBuffer); flagXR(composer.outputBuffer); }
}
window.addEventListener('resize', resize); resize();

const clock = { last: performance.now(), getDelta() { const n = performance.now(), d = (n - this.last) / 1000; this.last = n; return d; } };
const _scrPM = new THREE.Matrix4(), _scrFr = new THREE.Frustum();
let wasWarp = false, rr = 0, rrTimer = 0, panelTimer = 0, ovTimer = 0, bobT = 0, bobAmp = 0;
const standV = new THREE.Vector3();
function wrapA(a) { return ((a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; }

let simLast = performance.now(), livePanelT = 0;
function frame() {
  const _t0 = performance.now();
  const dt = Math.min(clock.getDelta(), 0.05); elapsed += dt;
  // the ship model runs on real time (not the capped frame time) so it keeps pace on slow phones
  { const now = performance.now(); simUpdate(Math.min(1, (now - simLast) / 1000)); simLast = now; drainSimEvents(dt); }
  if (state.open) { livePanelT += dt; if (livePanelT > 0.25) { livePanelT = 0; renderPanel(); } }

  liftUpdate(dt);
  chairsUpdate(dt);
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
    camera.position.copy(standV).lerp(SEAT, eb); camera.position.y += LIFT.shake;
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
  viewWindow();
  updateSpace(dt, fade); updateViewscreen(dt);
  const warpGlow = smooth(20, 300, cur.speed);
  // the screen's steady glow is baked; this live light adds only the warp flare
  lScreen.intensity = ((BAKE.ok ? 0 : 0.35) + 0.8 * warpGlow + 0.06 * Math.sin(elapsed * 9) * warpGlow) * LIGHT_LEVELS[state.light] * Math.PI * 0.75;

  if (state.scanning) {
    state.scanT += dt;
    scanRing.material.opacity = 0.75 * Math.sin(Math.min(1, state.scanT / 2.6) * Math.PI);
    scanRing.rotation.set(Math.PI / 2 + Math.sin(state.scanT * 2.4) * 1.2, state.scanT * 0.8, 0);
    planetMat.uniforms.scan.value = scanRing.material.opacity;
    if (state.scanT > 2.6) { state.scanning = false; state.scanned = true; scanRing.material.opacity = 0; planetMat.uniforms.scan.value = 0; toast(`Scan complete on ${sysCur().planet}.`, 'Science'); beep([2093, 1568], 0.08, 0.035); renderPanel(); redrawAll(); }
  }

  if (false) { // the hologram over the old situation table is retired
    holo.rotation.y += dt * (reduceMotion ? 0.05 : 0.22);
    holoPlanets.forEach((p) => { p.a += dt * p.w; p.m.position.set(Math.cos(p.a) * p.r, 0, Math.sin(p.a) * p.r); });
    holoBeam.material.opacity = 0.05 + Math.sin(elapsed * 2) * 0.015;
  }

  DOORS.forEach((d) => {
    const near = d.auto && d.deck === LIFT.deck && !state.sitting && Math.hypot(camera.position.x - d.wx, camera.position.z - d.wz) < (d.room ? d.reach : 1.5);
    if (d.station === 'lift') d.open = LIFT.door; // lift.js runs the lift doors
    else d.open += ((near ? 1 : 0) - d.open) * Math.min(1, dt * 5);
    d.L.position.x = -d.q - d.open * d.slide; d.Rr.position.x = d.q + d.open * d.slide;
  });
  batchSleep(); // chairs and doors at rest are drawn merged; wake the ones that are about to move (batch.js)
  // rooms: light the one you are in or approaching, name it in the HUD
  { let here = null;
    ROOMS.forEach((r) => {
      _lc.copy(camera.position); r.g.worldToLocal(_lc);
      const inside = _lc.x > r.xa && _lc.x < r.xb && _lc.z > 0 && _lc.z < r.d; if (inside) here = r;
      const near = Math.hypot(camera.position.x - r.door[0], camera.position.z - r.door[1]) < 3.2;
      r.k += ((inside ? 1 : near ? 0.75 : 0) - r.k) * Math.min(1, dt * 3);
    });
    const ll = liftLocation(here && here.label); if (ll !== lastLoc) { lastLoc = ll; locNode.nodeValue = ll; } }
  { const closed = state.shutters === 'closed' || (state.shutters === 'auto' && state.alert === 'red');
    SHUTTERS.forEach((sh) => { sh.cur += ((closed ? 1 : 0) - sh.cur) * Math.min(1, dt * 2.2); const a = sh.cur * (Math.PI / 2 - 0.05); sh.slats.forEach((sl) => { sl.rotation.x = a; if (sh.hideOpen) sl.visible = sh.cur > 0.02; }); }); }
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
  // the exterior's moving parts: shuttlebay doors, impulse plumes, thruster puffs, blinking hull lights
  if (EXTSET && EXTSET.userData.update) EXTSET.userData.update(dt, elapsed); // (built with Deck 2)

  if (state.alert === 'red') {
    const k = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(elapsed * 4));
    stripMats.forEach((m) => m.color.setHex(ALERTS.red.strip).multiplyScalar(1.9 * k));
    slotMats.forEach((m) => m.color.setHex(ALERTS.red.slot).multiplyScalar(1.35 * (0.35 + 0.65 * k)));
    MAT.wall.emissiveIntensity = 0.3 + 0.7 * k;
    bakeLevels(LIGHT_LEVELS[state.light] * 0.28, 'red', ALERTS.red.strip, k);
  } else MAT.wall.emissiveIntensity = 0.7;

  if (AC && soundOn && elapsed > nextChirp) { nextChirp = elapsed + 3 + Math.random() * 6; const b = 1200 + Math.random() * 1200; beep(Math.random() < 0.5 ? [b, b * 1.25] : [b], 0.045, 0.012); }

  // screens: every frame, redraw a few of the visible ones, the nearest and longest-waiting first, so they all keep moving
  { _scrPM.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); _scrFr.setFromProjectionMatrix(_scrPM);
    const budget = PERF_OPT.screens, pick = [];
    if (budget > 0) for (const sc of screens) {
      if (!sc.wp) { sc.wp = new THREE.Vector3(); sc.mesh.getWorldPosition(sc.wp); }
      const d2 = sc.wp.distanceToSquared(camera.position); if (d2 > 110) continue;
      const big = sc.w * sc.h > 900000, age = elapsed - (sc.last || -9); if (age < (big ? 1 / 12 : 1 / 30)) continue;
      if (!shown(sc.mesh)) continue;
      const score = age * (_scrFr.containsPoint(sc.wp) ? 4 : 0.25) / (0.6 + Math.sqrt(d2)) * (big ? 0.7 : 1);
      if (pick.length < budget) pick.push([score, sc]); else { let lo = 0; for (let k = 1; k < pick.length; k++) if (pick[k][0] < pick[lo][0]) lo = k; if (score > pick[lo][0]) pick[lo] = [score, sc]; }
    }
    pick.forEach(([, sc]) => { drawScreen(sc); sc.last = elapsed; }); }
  if (state.open && byStation[state.open]) { panelTimer += dt; if (panelTimer > 0.15) { panelTimer = 0; byStation[state.open].forEach((s) => { if (s.kind !== 'keys') drawScreen(s); }); } }
  ovTimer += dt; if (ovTimer > 1) { ovTimer = 0; drawOverlay(); }

  aimTimer += dt; if (aimTimer > 0.12) { aimTimer = 0; aim(); }

  scene.fog = null; renderer.setRenderTarget(rt); if (LIFT.deck === 1 && PERF_OPT.viewscreen) renderer.render(scene, vcam);
  { const sk = LIGHT_LEVELS[state.light] * (state.alert === 'red' ? 0.5 : 1) * (1 + Math.sin(elapsed * 0.7) * 0.15); shaftMat.uniforms.k.value = 0.06 * sk; shafts[shafts.length - 1].material.uniforms.k.value = 0.035 * sk; }
  scene.fog = FOG; renderer.setRenderTarget(null);
  if (composer) composer.render(); else renderer.render(scene, camera);
  PERF_OPT.cpu = performance.now() - _t0;
  requestAnimationFrame(frame);
}
setAlert('green');
requestAnimationFrame(frame);
// hand-over to the baked light once its files arrive (or to the fallback rig if they can't)
BAKE.ready.then((ok) => {
  if (ok) { renderer.shadowMap.enabled = false; applyLights(); } else { fallbackLights(); DECALS.forEach((m) => { m.visible = true; }); applyLights(); }
  // checks that look at every deck at once ask for them all to be built now (normally each is built on its first visit)
  if (window.DEFIANCE_BUILD_ALL) Object.values(DECKS).forEach((d) => deckBuild(d.n));
  window.DEFIANCE_BAKED = ok ? 'baked' : 'fallback';
});
