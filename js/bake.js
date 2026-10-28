// USS Defiance · bake.js
// Baked light. The ship's fixtures (downlights, ceiling discs, cove slots, deck strips, screens) were rendered
// ahead of time in Blender with tools/bake_lighting.py, light bouncing included:
//   - flat room surfaces (floors, walls, ceilings) carry a light map: one image laid out like a sewing pattern;
//   - everything else reads a light-probe grid: points every 30 cm that recorded the light arriving from six directions.
// Two layers are stored: W (every fixture except the deck strips) and S (the deck strips alone, in white), so light
// level and alert colour can be changed live without re-baking. Files: bake/*.png and bake/bake.json.
// Files share one global scope and load in order (see index.html).
'use strict';

const BAKE = { ok: false, receivers: [], atlas: null, failed: false };
const BKU = {
  bkW: { value: new THREE.Color(0, 0, 0) }, bkS: { value: new THREE.Color(0, 0, 0) }, bkIbl: { value: 1 },
  bkLmW: { value: null }, bkLmS: { value: null }, bkLmMax: { value: new THREE.Vector2(1, 1) },
  bkPr: { value: null }, bkPrMin: { value: new THREE.Vector3() }, bkPrInv: { value: 1 }, bkPrDim: { value: new THREE.Vector3(1, 1, 1) }, bkPrMax: { value: new THREE.Vector2(1, 1) },
};

// ---------- which surfaces get a light map: big flat opaque surfaces of the fixed rooms ----------
const PLANAR = { PlaneGeometry: 1, ShapeGeometry: 1, CircleGeometry: 1 };
function bakeLive(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }
function isReceiver(o) {
  if (!o.isMesh || o.layers.mask !== 1 || !PLANAR[o.geometry.type] || Array.isArray(o.material)) return false;
  const m = o.material; if (!m.isMeshStandardMaterial || m.transparent || !bakeLive(o)) return false;
  o.geometry.computeBoundingBox(); const s = new THREE.Vector3(); o.geometry.boundingBox.getSize(s);
  return s.x * s.y + s.y * s.z + s.x * s.z > 0.25;
}
// Lay every receiver out in one atlas. Coplanar pieces (a wall split by a door) share one rectangle.
// Deterministic: the same scene always gives the same layout, which the bake tool relies on.
function buildAtlas() {
  scene.updateMatrixWorld(true);
  const groups = new Map(), list = [], seenGeo = new Set(), PAD = 3, AW = 2048;
  scene.traverse((o) => { if (isReceiver(o)) list.push(o); });
  const nm = new THREE.Matrix3(), n = new THREE.Vector3(), p = new THREE.Vector3();
  list.forEach((o) => {
    if (seenGeo.has(o.geometry)) o.geometry = o.geometry.clone(); seenGeo.add(o.geometry);
    const pos = o.geometry.attributes.position, nrm = o.geometry.attributes.normal;
    nm.getNormalMatrix(o.matrixWorld); n.fromBufferAttribute(nrm, 0).applyMatrix3(nm).normalize();
    p.fromBufferAttribute(pos, 0).applyMatrix4(o.matrixWorld);
    const key = [n.x, n.y, n.z].map((v) => Math.round(v * 40)).join(',') + ',' + Math.round(n.dot(p) * 50);
    let g = groups.get(key);
    if (!g) {
      let u, v;
      if (Math.abs(n.y) > 0.7) { u = new THREE.Vector3(1, 0, 0); v = new THREE.Vector3(0, 0, 1); }
      else { u = new THREE.Vector3(-n.z, 0, n.x).normalize(); v = new THREE.Vector3(0, 1, 0); }
      g = { u, v, dens: n.y > 0.7 ? 40 : n.y < -0.7 ? 16 : 32, a0: 1e9, a1: -1e9, b0: 1e9, b1: -1e9, items: [] };
      groups.set(key, g);
    }
    const ab = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      const a = p.dot(g.u), b = p.dot(g.v); ab[i * 2] = a; ab[i * 2 + 1] = b;
      g.a0 = Math.min(g.a0, a); g.a1 = Math.max(g.a1, a); g.b0 = Math.min(g.b0, b); g.b1 = Math.max(g.b1, b);
    }
    g.items.push({ o, ab });
  });
  const G = [...groups.values()];
  G.forEach((g, i) => { g.i = i; g.w = Math.ceil((g.a1 - g.a0) * g.dens) + 2 * PAD; g.h = Math.ceil((g.b1 - g.b0) * g.dens) + 2 * PAD; });
  const order = G.slice().sort((a, b) => b.h - a.h || a.i - b.i);
  let x = 0, y = 0, rowH = 0;
  order.forEach((g) => { if (x + g.w > AW) { x = 0; y += rowH; rowH = 0; } g.x = x; g.y = y; x += g.w; rowH = Math.max(rowH, g.h); });
  const AH = Math.ceil((y + rowH) / 4) * 4;
  G.forEach((g) => g.items.forEach(({ o, ab }) => {
    const uv = new Float32Array(ab.length);
    for (let i = 0; i < ab.length; i += 2) {
      uv[i] = (g.x + PAD + (ab[i] - g.a0) * g.dens) / AW;
      uv[i + 1] = (g.y + PAD + (ab[i + 1] - g.b0) * g.dens) / AH;
    }
    o.geometry.setAttribute('uvLM', new THREE.BufferAttribute(uv, 2));
  }));
  BAKE.receivers = list;
  BAKE.atlas = { w: AW, h: AH, rects: G.length, sig: G.map((g) => g.w + 'x' + g.h).join(';').length + ':' + list.length };
}

// ---------- shaders: add baked light to three.js's standard material ----------
const BK_IBL_LINE = 'iblIrradiance += getIBLIrradiance( geometryNormal );';
const BK_FS = {
  lm: `uniform sampler2D bkLmW, bkLmS; uniform vec2 bkLmMax; uniform vec3 bkW, bkS; uniform float bkIbl; varying vec2 vBkLM;`,
  pr: `uniform highp sampler3D bkPr; uniform vec3 bkPrMin, bkPrDim, bkW, bkS; uniform float bkPrInv, bkIbl; uniform vec2 bkPrMax; varying vec3 vBkPW;
vec4 bkCube(vec3 q, float f) { vec4 c = texture(bkPr, vec3((q.x + f * bkPrDim.x) / (6.0 * bkPrDim.x), q.y / bkPrDim.y, q.z / bkPrDim.z)); return c * c; }`,
};
const BK_ADD = {
  lm: `{ vec3 w = texture2D(bkLmW, vBkLM).rgb; float s = texture2D(bkLmS, vBkLM).r;
  irradiance += w * w * bkLmMax.x * bkW + s * s * bkLmMax.y * bkS; }`,
  // ambient cube: one sample per axis, chosen by the sign of the normal, weighted by the normal squared
  pr: `{ vec3 nW = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
  vec3 p = (vBkPW + nW * 0.1 - bkPrMin) * bkPrInv + 0.5, q = clamp(p, vec3(0.5), bkPrDim - 0.5);
  float inside = 1.0 - smoothstep(0.5, 1.5, distance(p, q));
  vec3 n2 = nW * nW;
  vec4 e = n2.x * bkCube(q, nW.x >= 0.0 ? 0.0 : 1.0) + n2.y * bkCube(q, nW.y >= 0.0 ? 2.0 : 3.0) + n2.z * bkCube(q, nW.z >= 0.0 ? 4.0 : 5.0);
  irradiance += inside * (e.rgb * bkPrMax.x * bkW + e.a * bkPrMax.y * bkS); }`,
};
function bakePatch(m, mode) {
  if (m.userData.bk) return; m.userData.bk = mode;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, BKU);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + (mode === 'lm' ? 'attribute vec2 uvLM; varying vec2 vBkLM;' : 'varying vec3 vBkPW;'))
      .replace('#include <fog_vertex>', '#include <fog_vertex>\n' + (mode === 'lm' ? 'vBkLM = uvLM;' : 'vBkPW = (modelMatrix * vec4(transformed, 1.0)).xyz;'));
    const chunk = THREE.ShaderChunk.lights_fragment_maps.replace(BK_IBL_LINE, 'iblIrradiance += getIBLIrradiance( geometryNormal ) * bkIbl;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + BK_FS[mode])
      .replace('#include <lights_fragment_maps>', '#if defined( RE_IndirectDiffuse )\n' + BK_ADD[mode] + '\n#endif\n' + chunk);
  };
  m.customProgramCacheKey = () => 'bk-' + mode;
  m.needsUpdate = true;
}

// ---------- live controls: light level, alert colour, red-alert strip pulse ----------
const _bkT = new THREE.Color(), _bkG = new THREE.Color(ALERTS.green.light);
function bakeLevels(k, alert, stripHex, stripK) {
  if (!BAKE.ok) return;
  const sc = BAKE.meta.exposure;
  _bkT.setHex(ALERTS[alert].light); BKU.bkW.value.setRGB(_bkT.r / _bkG.r, _bkT.g / _bkG.g, _bkT.b / _bkG.b).multiplyScalar(k * sc);
  BKU.bkS.value.setHex(stripHex).multiplyScalar(stripK * sc * BAKE.meta.strip);
}

// ---------- reflections: photograph the baked room once and use it as the environment ----------
let _envRT = null;
function bakeEnv() {
  if (!BAKE.ok) return;
  const crt = new THREE.WebGLCubeRenderTarget(isMobile ? 96 : 160, { type: THREE.HalfFloatType });
  const cc = new THREE.CubeCamera(0.05, 40, crt); cc.position.set(0, 1.75, 0.6);
  const fog = scene.fog, env = scene.environment; scene.fog = null; scene.environment = null;
  BKU.bkIbl.value = 0; cc.update(renderer, scene);
  const pm = new THREE.PMREMGenerator(renderer), rt2 = pm.fromCubemap(crt.texture); pm.dispose(); crt.dispose();
  if (_envRT) _envRT.dispose(); _envRT = rt2;
  if (env && env !== rt2.texture && env.dispose) env.dispose();
  scene.environment = rt2.texture; scene.environmentIntensity = BAKE.meta.env ?? 1; scene.fog = fog;
}

// ---------- load ----------
function bakeImg(url) { return new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; }); }
function bakeTex(img) { const t = new THREE.Texture(img); t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; t.needsUpdate = true; return t; }
function bakePixels(img) { const c = cnv(img.width, img.height), g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height).data; }
buildAtlas();
BAKE.ready = (async () => {
  if (window.DEFIANCE_NO_BAKE) throw new Error('bake disabled');
  const meta = await (await fetch('bake/bake.json')).json();
  if (meta.atlas.w !== BAKE.atlas.w || meta.atlas.h !== BAKE.atlas.h || meta.atlas.sig !== BAKE.atlas.sig) throw new Error('bake does not match the scene; re-run tools/bake_lighting.py');
  const [lw, ls, pw, ps] = await Promise.all(['lm_w', 'lm_s', 'pr_w', 'pr_s'].map((n) => bakeImg('bake/' + n + '.png')));
  BAKE.meta = meta;
  BKU.bkLmW.value = bakeTex(lw); BKU.bkLmS.value = bakeTex(ls); BKU.bkLmMax.value.set(meta.lm_max[0], meta.lm_max[1]);
  // probes: the image stacks six direction blocks; rebuild them side by side in one 3D texture
  const [X, Y, Z] = meta.grid.dims, a = bakePixels(pw), b = bakePixels(ps), d = new Uint8Array(6 * X * Y * Z * 4);
  for (let f = 0; f < 6; f++) for (let y = 0; y < Y; y++) for (let z = 0; z < Z; z++) for (let x = 0; x < X; x++) {
    const s = (((f * Y + y) * Z + z) * X + x) * 4, t = ((z * Y + y) * 6 * X + f * X + x) * 4;
    d[t] = a[s]; d[t + 1] = a[s + 1]; d[t + 2] = a[s + 2]; d[t + 3] = b[s];
  }
  const pt = new THREE.Data3DTexture(d, 6 * X, Y, Z); pt.minFilter = pt.magFilter = THREE.LinearFilter; pt.unpackAlignment = 1; pt.needsUpdate = true;
  BKU.bkPr.value = pt; BKU.bkPrMin.value.fromArray(meta.grid.origin); BKU.bkPrInv.value = 1 / meta.grid.step; BKU.bkPrDim.value.set(X, Y, Z); BKU.bkPrMax.value.set(meta.pr_max[0], meta.pr_max[1]);
  // patch materials: receivers get the light map; every other lit interior material reads the probes
  const recv = new Set(BAKE.receivers), mats = new Map();
  scene.traverse((o) => {
    if (!o.isMesh || !(o.layers.mask & 1)) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      if (!m || !m.isMeshStandardMaterial) return;
      const e = mats.get(m) || { r: 0, o: 0 }; recv.has(o) ? e.r++ : e.o++; mats.set(m, e);
    });
  });
  const lmCopy = new Map();
  mats.forEach((e, m) => { if (e.o) bakePatch(m, 'pr'); else bakePatch(m, 'lm'); });
  BAKE.receivers.forEach((o) => {
    if (o.material.userData.bk === 'lm') return;
    let c = lmCopy.get(o.material); if (!c) { c = o.material.clone(); c.userData = {}; bakePatch(c, 'lm'); lmCopy.set(o.material, c); }
    o.material = c;
  });
  DECALS.forEach((m) => { m.visible = false; });
  BAKE.ok = true;
  return true;
})().catch((e) => { console.warn('Baked lighting unavailable, using fallback light:', e.message); BAKE.failed = true; return false; });
// render.js finishes the hand-over (applyLights, reflections) once every file has loaded.
