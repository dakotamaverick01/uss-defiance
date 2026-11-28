// USS Defiance · bake.js
// Baked light. The ship's fixtures (downlights, ceiling discs, cove slots, deck strips, screens) were rendered
// ahead of time in Blender with tools/bake_lighting.py, light bouncing included:
//   - flat room surfaces (floors, walls, ceilings) carry a light map: one image laid out like a sewing pattern;
//   - everything else reads a light-probe grid: points every 30 cm that recorded the light arriving from six directions.
// Two layers are stored: W (every fixture except the deck strips) and S (the deck strips alone, in white), so light
// level and alert colour can be changed live without re-baking. Each deck has its own bake (roadmap F4):
// bake/d<n>/lm_w.png, lm_s.png, pr_w.png, pr_s.png and bake.json, its own light-map layout and its own probe grid, so
// changing one deck never re-bakes another. Every built deck's files load at start-up; the lift switches the shared
// uniforms (BKU) to the deck you arrive on (bakeUse).
// Files share one global scope and load in order (see index.html).
'use strict';

const BAKE = { ok: false, receivers: [], atlas: null, failed: false, decks: {}, cur: 0, meta: null }; // decks[n]: { receivers, atlas, ok }
const BKD = {}; // each deck's loaded bake: { meta, lmW, lmS, pr }
const BKU = {
  bkW: { value: new THREE.Color(0, 0, 0) }, bkS: { value: new THREE.Color(0, 0, 0) }, bkIbl: { value: 1 },
  bkLmW: { value: null }, bkLmS: { value: null }, bkLmMax: { value: new THREE.Vector2(1, 1) },
  bkPr: { value: null }, bkPrMin: { value: new THREE.Vector3() }, bkPrInv: { value: 1 }, bkPrDim: { value: new THREE.Vector3(1, 1, 1) }, bkPrMax: { value: new THREE.Vector2(1, 1) },
};

// ---------- which surfaces get a light map: big flat opaque surfaces of the fixed rooms ----------
const PLANAR = { PlaneGeometry: 1, ShapeGeometry: 1, CircleGeometry: 1 };
// shown, not counting a deck's own group (a deck is laid out while it is still hidden, as the lift heads there)
function bakeLive(o) { for (let p = o; p; p = p.parent) if (!p.visible && !(p.parent === scene && Object.values(DECKS).some((d) => d.n !== 1 && d.root() === p))) return false; return true; }
function isReceiver(o) {
  if (!o.isMesh || o.layers.mask !== 1 || !PLANAR[o.geometry.type] || Array.isArray(o.material)) return false;
  const m = o.material; if (!m.isMeshStandardMaterial || m.transparent || !bakeLive(o)) return false;
  o.geometry.computeBoundingBox(); const s = new THREE.Vector3(); o.geometry.boundingBox.getSize(s);
  return s.x * s.y + s.y * s.z + s.x * s.z > 0.25;
}
// One deck's meshes: deck n's group, or for Deck 1 everything that is not another deck's group (nor the lift, whose
// materials carry their own light). fn(o) for each object.
function bakeWalk(n, fn) {
  const others = new Set(); Object.values(DECKS).forEach((d) => { if (d.n !== n) { const r = d.n === 1 ? null : d.root(); if (r) others.add(r); } });
  if (typeof LIFT !== 'undefined') [LIFT.root, LIFT.stub].forEach((g) => others.add(g));
  const top = n === 1 ? ((typeof LIFT !== 'undefined' && LIFT.deck1) || scene) : deckOf(n).root();
  (function walk(o) { if (others.has(o)) return; fn(o); o.children.forEach(walk); })(top);
}
// Lay deck n's receivers out in its own atlas. Coplanar pieces (a wall split by a door) share one rectangle.
// Deterministic: the same deck always gives the same layout, which the bake tool relies on.
function buildAtlas(dn) {
  scene.updateMatrixWorld(true);
  const groups = new Map(), list = [], seenGeo = new Set(), PAD = 3, AW = 2048;
  bakeWalk(dn, (o) => { if (isReceiver(o) && !(typeof EXTSET !== 'undefined' && EXTSET && o.parent && bakeUnder(o, EXTSET))) list.push(o); });
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
  const atlas = { w: AW, h: AH, rects: G.length, sig: G.map((g) => g.w + 'x' + g.h).join(';').length + ':' + list.length };
  BAKE.decks[dn] = { receivers: list, atlas, ok: false };
  BAKE.receivers = BAKE.receivers.concat(list); // every deck's, for batch.js
  if (dn === 1) BAKE.atlas = atlas;
}
function bakeUnder(o, g) { for (let p = o; p; p = p.parent) if (p === g) return true; return false; }

// ---------- shaders: add baked light to three.js's standard material ----------
const BK_IBL_LINE = 'iblIrradiance += getIBLIrradiance( geometryNormal );';
const BK_DECL = `uniform sampler2D bkLmW, bkLmS; uniform vec2 bkLmMax; uniform vec3 bkW, bkS; uniform float bkIbl;
uniform highp sampler3D bkPr; uniform vec3 bkPrMin, bkPrDim; uniform float bkPrInv; uniform vec2 bkPrMax;
vec4 bkCube(vec3 q, float f) { vec4 c = texture(bkPr, vec3((q.x + f * bkPrDim.x) / (6.0 * bkPrDim.x), q.y / bkPrDim.y, q.z / bkPrDim.z)); return c * c; }
// ambient cube: one sample per axis, chosen by the sign of the normal, weighted by the normal squared
vec4 bkProbe(vec3 q, vec3 n) { vec3 n2 = n * n; return n2.x * bkCube(q, n.x >= 0.0 ? 0.0 : 1.0) + n2.y * bkCube(q, n.y >= 0.0 ? 2.0 : 3.0) + n2.z * bkCube(q, n.z >= 0.0 ? 4.0 : 5.0); }
float bkLum(vec4 e) { return dot(e.rgb, vec3(0.3, 0.55, 0.15)) * bkPrMax.x + e.a * bkPrMax.y * 0.3; }
`;
const BK_ADD = {
  // light map; the probes add direction, so bump detail on floors and walls is lit from where the fixtures really are
  lm: `{ vec3 w = texture2D(bkLmW, vBkLM).rgb; float s = texture2D(bkLmS, vBkLM).r;
  vec3 base = w * w * bkLmMax.x * bkW + s * s * bkLmMax.y * bkS;
  #ifdef USE_NORMALMAP
  vec3 nP = normalize((vec4(normal, 0.0) * viewMatrix).xyz), nF = normalize((vec4(flatN, 0.0) * viewMatrix).xyz);
  vec3 q = clamp((vWP + nF * 0.15 - bkPrMin) * bkPrInv + 0.5, vec3(0.5), bkPrDim - 0.5);
  base *= clamp((bkLum(bkProbe(q, nP)) + 1e-4) / (bkLum(bkProbe(q, nF)) + 1e-4), 0.35, 2.0);
  #endif
  irradiance += base; }`,
  pr: `{ vec3 nW = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
  vec3 p = (vWP + nW * 0.1 - bkPrMin) * bkPrInv + 0.5, q = clamp(p, vec3(0.5), bkPrDim - 0.5);
  float inside = 1.0 - smoothstep(0.5, 1.5, distance(p, q));
  vec4 e = bkProbe(q, nW);
  irradiance += inside * (e.rgb * bkPrMax.x * bkW + e.a * bkPrMax.y * bkS); }`,
};
function bakePatch(m, mode) {
  if (m.userData.bk) return; m.userData.bk = mode;
  const chunk = THREE.ShaderChunk.lights_fragment_maps.replace(BK_IBL_LINE, 'iblIrradiance += getIBLIrradiance( geometryNormal ) * bkIbl;');
  patchMat(m, 'bk-' + mode, {
    world: true, uniforms: BKU, decl: BK_DECL + (mode === 'lm' ? 'varying vec2 vBkLM;' : ''),
    vdecl: mode === 'lm' ? 'attribute vec2 uvLM; varying vec2 vBkLM;\n' : '', vert: mode === 'lm' ? 'vBkLM = uvLM;\n' : '',
    replace: { lights_fragment_maps: '#if defined( RE_IndirectDiffuse )\n' + BK_ADD[mode] + '\n#endif\n' + chunk },
  });
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
// One snapshot per deck, taken from the deck registry's envAt point (decks.js) the first time you are on it, so Deck 2's
// metal and glass reflect Deck 2, not the bridge. The current deck's and the last one's are kept; older ones are freed.
const _env = new Map();
function bakeEnv() {
  if (!BAKE.ok) return;
  const n = typeof LIFT !== 'undefined' ? LIFT.deck : 1;
  if (_env.has(n)) { const rt = _env.get(n); _env.delete(n); _env.set(n, rt); scene.environment = rt.texture; return; }
  const at = (typeof deckOf === 'function' && deckOf(n).envAt) || [0, 1.75, 0.6];
  const crt = new THREE.WebGLCubeRenderTarget(isMobile ? 96 : 160, { type: THREE.HalfFloatType });
  const cc = new THREE.CubeCamera(0.05, 40, crt); cc.position.set(at[0], deckY(n) + at[1], at[2]);
  const fog = scene.fog, env = scene.environment; scene.fog = null; scene.environment = null;
  BKU.bkIbl.value = 0; cc.update(renderer, scene);
  const pm = new THREE.PMREMGenerator(renderer), rt2 = pm.fromCubemap(crt.texture); pm.dispose(); crt.dispose();
  if (env && env.dispose && ![..._env.values()].some((r) => r.texture === env)) env.dispose();
  _env.set(n, rt2); while (_env.size > 2) { const k = _env.keys().next().value; _env.get(k).dispose(); _env.delete(k); }
  scene.environment = rt2.texture; scene.environmentIntensity = BAKE.meta.env ?? 1; scene.fog = fog;
}

// ---------- load ----------
function bakeImg(url) { return new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; }); }
function bakeTex(img) { const t = new THREE.Texture(img); t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; t.needsUpdate = true; return t; }
function bakePixels(img) { const c = cnv(img.width, img.height), g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height).data; }
// fetch one deck's bake files and turn them into textures (needs nothing built)
async function bakeFetch(n) {
  const dir = 'bake/d' + n + '/', meta = await (await fetch(dir + 'bake.json')).json();
  const [lw, ls, pw, ps] = await Promise.all(['lm_w', 'lm_s', 'pr_w', 'pr_s'].map((f) => bakeImg(dir + f + '.png')));
  // probes: the image stacks six direction blocks; rebuild them side by side in one 3D texture
  const [X, Y, Z] = meta.grid.dims, a = bakePixels(pw), b = bakePixels(ps), d = new Uint8Array(6 * X * Y * Z * 4);
  for (let f = 0; f < 6; f++) for (let y = 0; y < Y; y++) for (let z = 0; z < Z; z++) for (let x = 0; x < X; x++) {
    const s = (((f * Y + y) * Z + z) * X + x) * 4, t = ((z * Y + y) * 6 * X + f * X + x) * 4;
    d[t] = a[s]; d[t + 1] = a[s + 1]; d[t + 2] = a[s + 2]; d[t + 3] = b[s];
  }
  const pt = new THREE.Data3DTexture(d, 6 * X, Y, Z); pt.minFilter = pt.magFilter = THREE.LinearFilter; pt.unpackAlignment = 1; pt.needsUpdate = true;
  BKD[n] = { meta, lmW: bakeTex(lw), lmS: bakeTex(ls), pr: pt };
  return BKD[n];
}
// A deck with no bake files yet (a new deck being built) gets an even, provisional light instead: a one-sample probe
// grid and a flat light map at about the brightness of a lit room, so it can be walked and judged before it is baked.
function bakeProvisional(n) {
  const B = BAKE.decks[n], ref = BKD[1]; if (!B || !ref || BKD[n]) return;
  const tex = (v, ch) => { const t = new THREE.DataTexture(new Uint8Array(ch === 1 ? [v, v, v, 255] : [v, v, v, 255]), 1, 1); t.needsUpdate = true; return t; };
  const d = new Uint8Array(6 * 4).fill(55); for (let f = 0; f < 6; f++) d[f * 4 + 3] = 0; // six faces, light from every side
  const pr = new THREE.Data3DTexture(d, 6, 1, 1); pr.minFilter = pr.magFilter = THREE.LinearFilter; pr.unpackAlignment = 1; pr.needsUpdate = true;
  const m = ref.meta, y = deckY(n);
  BKD[n] = { provisional: true, lmW: tex(140), lmS: tex(0), pr,
    meta: Object.assign({}, m, { deck: n, atlas: B.atlas, grid: { origin: [0, y + 1.4, 0], step: 1000, dims: [1, 1, 1] } }) };
  console.warn('Deck ' + n + ' has no light bake yet: using provisional light (bake it with tools/bake_export.py . <work> ' + n + ')');
}
// Point the shared uniforms at deck n's bake (on arrival; lift.js). False if that deck has no bake applied.
function bakeUse(n) {
  const D = BKD[n]; if (!D || !BAKE.decks[n] || !BAKE.decks[n].ok) return false;
  const m = D.meta; BAKE.meta = m; BAKE.cur = n;
  BKU.bkLmW.value = D.lmW; BKU.bkLmS.value = D.lmS; BKU.bkLmMax.value.set(m.lm_max[0], m.lm_max[1]);
  BKU.bkPr.value = D.pr; BKU.bkPrMin.value.fromArray(m.grid.origin); BKU.bkPrInv.value = 1 / m.grid.step;
  BKU.bkPrDim.value.set(...m.grid.dims); BKU.bkPrMax.value.set(m.pr_max[0], m.pr_max[1]);
  if (typeof applyLights === 'function') applyLights(); // light level and alert colour, with this deck's exposure
  return true;
}
// Give deck n's materials the baked light, once the deck is built and its files have loaded: light-map receivers get
// the light map, every other lit interior material the probes. A material used both ways is copied for the other use.
// Returns true when the deck's bake is in place (batch.js then merges its light-mapped surfaces).
function bakeApply(n) {
  if (BAKE.ok && !BKD[n]) bakeProvisional(n); // after start-up, a deck without files gets the provisional light
  const B = BAKE.decks[n], D = BKD[n]; if (!B || !D || B.ok) return false;
  const A = D.meta.atlas;
  if (A.w !== B.atlas.w || A.h !== B.atlas.h || A.sig !== B.atlas.sig) { console.warn('Deck ' + n + ': bake does not match the deck; re-run its bake (see README)'); return false; }
  const recv = new Set(B.receivers);
  bakeWalk(n, (o) => {
    if (!o.isMesh || !(o.layers.mask & (1 | (1 << 30)))) return; // (1 << 30: chairs and doors drawn merged, batch.js)
    if (Array.isArray(o.material)) { o.material.forEach((m) => { if (m && m.isMeshStandardMaterial && !m.userData.noBake) bakePatch(m, 'pr'); }); return; }
    const m = o.material; if (!m || !m.isMeshStandardMaterial || m.userData.noBake) return;
    o.material = bakeFor(m, recv.has(o) ? 'lm' : 'pr');
  });
  B.ok = true; return true;
}
// m itself if it is (or can become) patched for this use, else its copy for that use
function bakeFor(m, mode) {
  if (!m.userData.bk) { bakePatch(m, mode); return m; }
  if (m.userData.bk === mode) return m;
  const alt = m.userData.bkAlt || (m.userData.bkAlt = {});
  if (!alt[mode]) {
    // the copy keeps the material's own patches but not its bake patch (two bake patches would redefine the uniforms)
    const c = copyPatches(m, m.clone()); c._patches = c._patches.filter((q) => !q.key.startsWith('bk-')); c.userData = {}; bakePatch(c, mode); alt[mode] = c;
  }
  return alt[mode];
}
// Deck 1 is laid out now (the decks below are laid out when they are built, decks.js deckBuild)
buildAtlas(1);
BAKE.ready = (async () => {
  await SURF.ready(); // textures first, so every material is final before it is patched
  if (window.DEFIANCE_NO_BAKE) throw new Error('bake disabled');
  // every built deck's files, side by side; only Deck 1's are needed to start
  const loads = Object.values(DECKS).filter((d) => d.built).map((d) => bakeFetch(d.n).catch((e) => console.warn('Deck ' + d.n + ' bake unavailable:', e.message)));
  await Promise.all(loads);
  if (!BKD[1]) throw new Error('no bake for Deck 1');
  if (!bakeApply(1)) throw new Error('bake does not match the scene; re-run the bake (see README)');
  bakeUse(1);
  DECALS.forEach((m) => { m.visible = false; });
  BAKE.ok = true;
  // a deck built before its files arrived (a very quick lift ride) gets its light now
  Object.keys(BAKE.decks).forEach((k) => { const n = +k; if (n !== 1 && bakeApply(n) && typeof batchLightmapped === 'function') batchLightmapped(n); });
  return true;
})().catch((e) => { console.warn('Baked lighting unavailable, using fallback light:', e.message); BAKE.failed = true; return false; });
// render.js finishes the hand-over (applyLights, reflections) once every file has loaded.
