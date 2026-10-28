// USS Defiance · lighting.js
// Stage 1: the ship is lit by its own fixtures through the bake (bake.js). There are no fill lights.
// The one live light is the viewscreen glow, which only brightens the bridge during warp.
// If the bake files cannot load, fallbackLights() restores the old Stage 0 rig so the ship is never dark.
// Files share one global scope and load in order (see index.html).
'use strict';

const lScreen = add(new THREE.PointLight(0x9fc0ff, 0, 7, 0.53)); lScreen.position.set(0, 1.9, FWD_Z + 1.0);
const FALLBACK = { lights: [], base: [] };
function fallbackLights() {
  if (FALLBACK.lights.length) return;
  // Stage 0 values; three.js now uses physical light units, so they carry the old conversion factors.
  const A = Math.PI, P = Math.PI * 0.75;
  const hemi = add(new THREE.HemisphereLight(0xfff0e0, 0x2a2018, 0.1 * A));
  const c = add(new THREE.SpotLight(0xffe2c4, 1.3 * P, 12, 0.95, 0.85, 0.4)); c.position.set(0, 3.25, 0.4);
  c.target.position.set(0, 0, 0.2); scene.add(c.target);
  c.castShadow = true; c.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048); c.shadow.bias = -0.0006; c.shadow.normalBias = 0.02; c.shadow.radius = 4; c.shadow.camera.near = 0.3; c.shadow.camera.far = 8;
  const f = add(new THREE.PointLight(0xffdcb4, 0.34 * P, 6.5, 0.5)); f.position.set(0, 2.9, -3.0);
  const a = add(new THREE.PointLight(0xffdcb4, 0.34 * P, 6.5, 0.5)); a.position.set(0, 2.9, 3.5);
  ROOMS.forEach((r) => { const L = add(new THREE.PointLight(0xffdcb8, r.base * 1.25 * P, 6.5, 0.53)); L.position.copy(r.lightPos); FALLBACK.lights.push(L); FALLBACK.base.push(r.base * 1.25 * P); });
  [hemi, c, f, a].forEach((l) => { FALLBACK.lights.push(l); FALLBACK.base.push(l.intensity); });
  renderer.shadowMap.enabled = true;
}
function fallbackApply(k, A) { FALLBACK.lights.forEach((l, i) => { l.intensity = FALLBACK.base[i] * k; if (!l.isHemisphereLight) l.color.setHex(A.light); }); }
