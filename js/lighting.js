// USS Defiance · lighting.js
// Stage 1: fixtures do the lighting. General fills removed.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- lights ----------
// Residual low hemi for deep corners only (no general fill)
const hemi = add(new THREE.HemisphereLight(0xfff0e0, 0x1a1510, 0.12));

// Central coffer disc is the main overhead source
const lCenter = add(new THREE.SpotLight(0xffe2c4, 0.9, 12, 0.9, 0.8, 0.4));
lCenter.position.set(COFFER.x, WALL_H + 0.3, COFFER.z);
lCenter.target.position.set(0, 0, 0.2); scene.add(lCenter.target);
lCenter.castShadow = true;
lCenter.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
lCenter.shadow.bias = -0.0005; lCenter.shadow.normalBias = 0.018; lCenter.shadow.radius = 3;
lCenter.shadow.camera.near = 0.4; lCenter.shadow.camera.far = 9;

// Viewscreen spill (bounce onto consoles)
const lScreen = add(new THREE.PointLight(0x9fc0ff, 0.55, 8.5, 0.45));
lScreen.position.set(0, 1.85, FWD_Z + 0.9);

// Real lights at each overhead downlight fixture
const downLights = [];
DOWNLIGHTS.forEach(([x, z]) => {
  const pl = add(new THREE.PointLight(0xffe6cc, 0.16, 3.5, 1.6));
  pl.position.set(x, WALL_H - 0.08, z);
  pl.castShadow = false;
  downLights.push(pl);
});

// Wall cove / strip bounce approximation (a few lights along the perimeter)
const stripLights = [];
EDGES.forEach((e, i) => {
  if (e.len < 2.5) return;
  const mid = 0.5;
  const [x, z] = onEdge(i, mid, 0.15);
  const sl = add(new THREE.PointLight(0xffe6cc, 0.08, 3.0, 1.6));
  sl.position.set(x, WALL_H - 0.25, z);
  stripLights.push(sl);
});

const BASE_I = {
  hemi: 0.12,
  center: 0.9,
  screen: 0.35,
  down: 0.16,
  strip: 0.08,
};
