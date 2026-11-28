// USS Defiance · exterior.js
// The ship seen from outside, built in code from SHIPGEO (shipgeo.js) so it always matches the deck plan and the
// bridge's systems display. buildExterior(opts) returns a group in Deck 2's frame (x starboard, y up from the Deck 2
// floor, -z forward): the hull lofted from the side profile and the plan half-beam, the officers' spine and bridge pod,
// the rollbar carrying the weapons pod and its torpedo launchers, long round nacelles just above the saucer on swept
// pylons, the deflector dish on the engineering body's nose, thruster blocks, sensor domes, impulse vents, lettering and
// running lights. The form itself (saucer, engineering body, rollbar, pod) comes from shipHull, shipRoll and shipPodAt.
// Paint: a dark gunmetal grey-green in layered panel patchwork (large zones built from smaller plates in close
// tones, a few warmer, cooler or oxide-red), panel lines, weathering streaks, black window bands and slate pinstripes.
// One canvas atlas holds the colour, with the panels' relief (height) in its alpha channel, plus a glow map for lit
// windows, grilles, caps, impulse and deflector.
// Light: the hull's own shader (so the baked interior is untouched): a low raking key "sun" with real shadows from a
// shadow map rendered once at build time, a cool rim light, dim fill, glossier and duller panels, relief from the
// height channel, and warm floodlights on the registry, the rollbar, the pod's launchers and the flank lettering (off at red alert).
// Strictly original: name and registry only, no emblems or borrowed markings.
// Files share one global scope and load in order (see index.html).
'use strict';

// the hull's lights (Deck 2 frame): a low key from forward and to starboard, a cool rim from aft, port and below
const HULL_SUN = new THREE.Vector3(0.56, 0.42, -0.71).normalize();
const HULL_RIM = new THREE.Vector3(-0.55, -0.3, 0.78).normalize();
const HULL_PAINT = {
  // panel tones: [colour, weight]; a dark grey with a green cast, a few warmer, cooler and darker plates
  tones: [['#737B7D', 34], ['#7B8385', 18], ['#6B7375', 18], ['#838B8C', 8], ['#636B6E', 9], ['#6F7A80', 7], ['#727A72', 6], ['#7A7872', 3], ['#5A6164', 4]],
  oxide: '#6E3028', band: '#2A2F32', dark: '#4C5356', slate: '#2E3840', glass: '#15191C', letter: '#23292E',
  window: '#E8B070', cool: '#A8C0D8', grille: '#3E86C4', cap: '#C84A22', impulse: '#D2503C', deflector: '#8CC8EE', flood: [1.0, 0.86, 0.66],
};

// the baked plating patch (textures/hull_detail*.jpg: red, green = surface relief, blue = ambient occlusion), loaded once;
// until it arrives the hull shows a flat neutral patch
const HULL_DETAIL = (() => {
  const flat = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1); flat.needsUpdate = true;
  // one entry per size (small: the 1k copy for the half-size paint), so a quality switch gets the size it asks for
  const C = {}, get = (small) => {
    const k = small ? 's' : 'b'; if (C[k]) return C[k];
    const e = C[k] = { ready: false, cb: [] };
    e.t = new THREE.TextureLoader().load(small ? 'textures/hull_detail_1k.jpg' : 'textures/hull_detail.jpg', (t) => { e.ready = true; e.cb.forEach((f) => f(t)); }, undefined, () => console.warn('hull detail texture unavailable'));
    e.t.wrapS = e.t.wrapT = THREE.RepeatWrapping; e.t.colorSpace = THREE.NoColorSpace; e.t.anisotropy = 8; return e;
  };
  return { tex: (small) => { const e = get(small); return e.ready ? e.t : flat; }, isReady: (small) => get(small).ready,
    onReady: (small, f) => { const e = get(small); if (e.ready) f(e.t); else e.cb.push(f); } };
})();
// ---------- SHIPGEO curves, sampled the way shipCurve draws them ----------
function shipSpline(pts, n) {
  const P = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))], out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = P(i - 1), b = P(i), c = P(i + 1), d = P(i + 2);
    const p1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6], p2 = [c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6];
    for (let k = i ? 1 : 0; k <= n; k++) { const t = k / n, u = 1 - t, A = u * u * u, B = 3 * u * u * t, C = 3 * u * t * t, D = t * t * t;
      out.push([A * b[0] + B * p1[0] + C * p2[0] + D * c[0], A * b[1] + B * p1[1] + C * p2[1] + D * c[1]]); }
  }
  return out;
}
// a drawn curve as a function of its first coordinate (m)
function shipFn(pts) {
  const s = shipSpline(pts, 24); if (s[0][0] > s[s.length - 1][0]) s.reverse();
  return (m) => {
    if (m <= s[0][0]) return s[0][1]; if (m >= s[s.length - 1][0]) return s[s.length - 1][1];
    let lo = 0, hi = s.length - 1; while (hi - lo > 1) { const md = (lo + hi) >> 1; if (s[md][0] <= m) lo = md; else hi = md; }
    const [a, x] = s[lo], [b, y] = s[hi]; return b > a ? x + (y - x) * (m - a) / (b - a) : x;
  };
}
const smooth01 = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const spow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);

function buildExterior(opts) {
  opts = opts || {};
  const lite = !!opts.lite, K = opts.atlasScale || (lite ? 0.5 : 1), G = SHIPGEO;
  const X = (planZ) => -planZ, Y = (d) => 7 - d, Z = (m) => m - 64;
  const SP = shipFn(G.spineTop); // the spine's top along the centreline
  const SAU = G.saucer, ROLL = G.rollbar, POD = G.wpod;
  const rnd = mulberry(4080);

  // ---------- atlas layout (pixels at full size) ----------
  const AW = 4096, AH = 3072;
  const R = {
    hull: [0, 0, 4096, 2048], nac: [0, 2048, 1536, 384], spine: [1536, 2048, 768, 512], arch: [2304, 2048, 1024, 256],
    spar: [3328, 2048, 512, 256], turret: [3840, 2048, 256, 256], stern: [2304, 2304, 512, 256],
    name: [2816, 2304, 768, 128], reg: [2816, 2432, 512, 128], rcs: [3328, 2432, 256, 128], defl: [3584, 2304, 256, 256],
    cells: [3840, 2304, 256, 256], launch: [0, 2432, 256, 128],
    // stage 2b: the shuttlebay's clamshell doors, the docking hatches, the sensor pallets and a sheet of small stencils
    door: [0, 2560, 512, 512], dock: [512, 2560, 256, 256], sensor: [512, 2816, 256, 256], marks: [768, 2560, 1280, 512],
  };
  // uv in a region: (a, b) in 0..1 across the region (b = 0 at the region's top row in the canvas)
  const ruv = (r, a, b) => [(r[0] + a * r[2]) / AW, 1 - (r[1] + b * r[3]) / AH];
  const CELL = { base: 0, dark: 1, slate: 2, glass: 3, deflector: 4, impulse: 5, grille: 6, cap: 7, gun: 8, ring: 9, barrel: 10, light: 11, dome: 12, oxide: 13, tractor: 14, pale: 15 };
  const cellUV = (k) => ruv(R.cells, ((k % 4) + 0.5) / 4, (((k / 4) | 0) + 0.5) / 4);

  // ---------- geometry assembly ----------
  const parts = [], decals = [];
  // a grid of rows x cols vertices; pt(i, j) -> [x, y, z], uv(i, j) -> [u, v]; wrap closes each row back on itself
  function grid(rows, cols, pt, uv, wrap) {
    const pos = [], uvs = [], idx = [];
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { pos.push(...pt(i, j)); uvs.push(...uv(i, j)); }
    const cj = wrap ? cols : cols - 1;
    for (let i = 0; i < rows - 1; i++) for (let j = 0; j < cj; j++) {
      const a = i * cols + j, b = i * cols + (j + 1) % cols, c = a + cols, d = b + cols; idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.userData.cols = cols; return g;
  }
  const flip = (g) => { const ix = g.index.array; for (let k = 0; k < ix.length; k += 3) { const t = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = t; } };
  // make faces point outward (away from the middle of their row of the grid), then smooth normals across seams
  function finish(g, weld) {
    const p = g.attributes.position.array, ix = g.index.array, cols = g.userData.cols || p.length / 3, rows = p.length / 3 / cols, mid = [];
    for (let i = 0; i < rows; i++) { let x = 0, y = 0, z = 0; for (let j = 0; j < cols; j++) { const v = (i * cols + j) * 3; x += p[v]; y += p[v + 1]; z += p[v + 2]; } mid.push([x / cols, y / cols, z / cols]); }
    let out = 0;
    for (let k = 0; k < ix.length; k += 3) { const a = ix[k] * 3, b = ix[k + 1] * 3, c = ix[k + 2] * 3, ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2], vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, q = mid[Math.floor(ix[k] / cols)];
      out += nx * ((p[a] + p[b] + p[c]) / 3 - q[0]) + ny * ((p[a + 1] + p[b + 1] + p[c + 1]) / 3 - q[1]) + nz * ((p[a + 2] + p[b + 2] + p[c + 2]) / 3 - q[2]); }
    if (out < 0) flip(g);
    g.computeVertexNormals();
    if (weld) { const n = g.attributes.normal.array, key = new Map();
      for (let v = 0; v < p.length / 3; v++) { const k = Math.round(p[v * 3] * 200) + ',' + Math.round(p[v * 3 + 1] * 200) + ',' + Math.round(p[v * 3 + 2] * 200); (key.get(k) || key.set(k, []).get(k)).push(v); }
      key.forEach((vs) => { if (vs.length < 2) return; let x = 0, y = 0, z = 0; vs.forEach((v) => { x += n[v * 3]; y += n[v * 3 + 1]; z += n[v * 3 + 2]; });
        const l = Math.hypot(x, y, z) || 1; vs.forEach((v) => { n[v * 3] = x / l; n[v * 3 + 1] = y / l; n[v * 3 + 2] = z / l; }); }); }
    return g;
  }
  // a stock geometry recoloured from one atlas cell or squeezed into a region
  function stock(g, at, mtx) {
    g = g.clone(); if (mtx) g.applyMatrix4(mtx);
    const uv = g.attributes.uv; if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]);
    for (let k = 0; k < uv.count; k++) { const c = typeof at === 'number' ? cellUV(at) : at(uv.getX(k), uv.getY(k)); uv.setXY(k, c[0], c[1]); }
    if (!g.attributes.normal) g.computeVertexNormals(); return g;
  }
  const M4 = (x, y, z, rx, ry, rz, s) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(...(Array.isArray(s) ? s : [s || 1, s || 1, s || 1])));
  function cap(points, at, outward) { // a flat fan closing a ring of [x, y, z] points, facing along outward
    const n = points.length, c = points.reduce((q, p) => [q[0] + p[0] / n, q[1] + p[1] / n, q[2] + p[2] / n], [0, 0, 0]), pos = [...c], uvs = [...at], idx = [];
    points.forEach((p) => { pos.push(...p); uvs.push(...at); }); for (let j = 0; j < n; j++) idx.push(0, 1 + j, 1 + (j + 1) % n);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
    const nn = g.attributes.normal; if (nn.getX(0) * outward[0] + nn.getY(0) * outward[1] + nn.getZ(0) * outward[2] < 0) { flip(g); g.computeVertexNormals(); }
    return g;
  }

  // ---------- the hull: a lens-shaped saucer forward flowing into a slim engineering body aft ----------
  // Each station is the smooth union of two rounded sections about the saucer's mid-plane (depth SAU.dc): the saucer's
  // lens (thinning toward its rim and toward its fore and aft edges) and the engineering body's tall rounded section.
  // Where both are present their outlines merge with a soft fillet, so the saucer sweeps into the body with no neck.
  const NJ = lite ? 30 : 72;
  const hullSec = (m) => { const H = shipHull(m); H.r0 = H.dc - 0.8; H.r1 = H.dc + 0.8; return H; };
  // one side (starboard, x >= 0) from the top centreline to the bottom centreline: [x, d, arc]; angles packed near the rim
  function hullSide(S) {
    const out = [];
    for (let j = 0; j <= 2 * NJ; j++) { const u = j / NJ - 1, th = (Math.PI / 2) * spow(u, 1.35), rr = S.r(th); out.push([Math.max(0, rr * Math.cos(th)), S.dc + rr * Math.sin(th)]); }
    out[0][0] = 0; out[out.length - 1][0] = 0;
    let a = 0; out[0].push(0); for (let i = 1; i < out.length; i++) { a += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); out[i].push(a); }
    return out;
  }
  const secFull = (m) => { const S = hullSec(m); S.side = hullSide(S); return S; };
  const HT = (m) => hullSec(m).t; // depth of the hull's top centreline
  const HM = (() => { // stations along the length, close together at the bow, the saucer's aft edge and the stern
    const s = new Set([0, 0.1, 0.3, 0.6, 1, 1.6, 2.4, 3.4, 4.6, 6, 200, 199.8, 199.4, 198.8, 198]);
    const N = lite ? 64 : 140; for (let i = 0; i <= N; i++) { const q = i / N; s.add(+(7 + 190 * (0.72 * q + 0.28 * (0.5 - 0.5 * Math.cos(Math.PI * q)))).toFixed(3)); }
    for (let m = 104; m <= 118; m += lite ? 1.5 : 0.75) s.add(m);
    return [...s].filter((m) => m <= 200).sort((a, b) => a - b);
  })();
  const HS = HM.map(secFull);
  HS.forEach((S) => { S.arc = S.side[S.side.length - 1][2]; });
  const VMAX = Math.max(...HS.map((S) => S.arc)) * 1.002;
  const RING = 4 * NJ; // closed ring: top, starboard side to the keel, port side back up
  const ringPt = (S, j) => { const k = S.side.length - 1; return j <= k ? [S.side[j][0], S.side[j][1], S.side[j][2]] : [-S.side[2 * k - j][0], S.side[2 * k - j][1], S.side[2 * k - j][2]]; };
  {
    parts.push(finish(grid(HS.length, RING, (i, j) => { const S = HS[i], [x, d] = ringPt(S, j); return [x, Y(d), Z(S.m)]; },
      (i, j) => ruv(R.hull, HS[i].m / 200, ringPt(HS[i], j)[2] / VMAX), true)));
    // the stern's transom is built with the shuttlebay (below), round the bay's opening
  }
  // a point on the hull: on the upper surface at lateral x, on the underside at lateral x, or on a side at depth d
  const onSide = (S, x, upper) => { const s = S.side, ax = Math.abs(x);
    if (upper) { for (let i = 1; i < s.length; i++) if (s[i][0] >= ax) { const f = (ax - s[i - 1][0]) / Math.max(1e-6, s[i][0] - s[i - 1][0]); return s[i - 1][1] + f * (s[i][1] - s[i - 1][1]); } }
    else { for (let i = s.length - 2; i >= 0; i--) if (s[i][0] >= ax) { const f = (ax - s[i + 1][0]) / Math.max(1e-6, s[i][0] - s[i + 1][0]); return s[i + 1][1] + f * (s[i][1] - s[i + 1][1]); } }
    return S.side[Math.round(s.length / 2)][1]; };
  const hullTop = (m, x) => [x, Y(onSide(secFull(m), x, true)), Z(m)];
  const hullBot = (m, x) => [x, Y(onSide(secFull(m), x, false)), Z(m)];
  const hullAtDepth = (S, d) => { // starboard x and arc length where the section reaches depth d (null if it doesn't)
    const s = S.side; if (d < s[0][1] || d > s[s.length - 1][1]) return null;
    for (let i = 1; i < s.length; i++) if (d <= s[i][1] && s[i][1] > s[i - 1][1]) { const f = (d - s[i - 1][1]) / (s[i][1] - s[i - 1][1]); return { x: s[i - 1][0] + f * (s[i][0] - s[i - 1][0]), arc: s[i - 1][2] + f * (s[i][2] - s[i - 1][2]), ny: (s[i][0] - s[i - 1][0]) / Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]) }; }
    return null;
  };
  const hullSidePt = (m, d, sd) => { const h = hullAtDepth(secFull(m), d); return h ? [sd * h.x, Y(d), Z(m)] : null; };

  // ---------- the officers' spine (Decks 1-2) and the bridge module ----------
  // SHIPGEO.spine: a rounded body over Deck 2's rooms and a broad, low bridge module over Deck 1's, merged with a soft
  // fillet (shipSpineRing gives the section), flaring out at the foot into the saucer. It encloses every Deck 1-2 room
  // and faces outward only, so from inside a room it is not drawn and every window looks straight out.
  const SPM = (() => { const s = new Set(); const seg = (a, b, n) => { for (let i = 0; i <= n; i++) s.add(+(a + (b - a) * i / n).toFixed(3)); };
    seg(49.3, 60, lite ? 12 : 26); seg(60, 75, lite ? 5 : 10); seg(75, 84, lite ? 9 : 18); seg(84, 95, lite ? 4 : 8); seg(95, 102.3, lite ? 9 : 20); return [...s].sort((a, b) => a - b); })();
  const SPH = lite ? 12 : 24; // points up each half of the section
  const ringCache = new Map();
  function spineRing(m) { // starboard foot, up the side, over the crown, down to the port foot: [x, d, arc]
    const key = Math.round(m * 400) / 400; if (ringCache.has(key)) return ringCache.get(key);
    const foot = HT(m) + 1.0, half = shipSpineRing(m, foot, SPH).map(([x, d]) => { const fl = Math.max(0, 1 - (foot - d) / 1.8); return [x + 2.0 * fl * fl, d]; });
    const out = half.concat(half.slice(0, -1).reverse().map(([x, d]) => [-x, d]));
    let a = 0; out[0] = out[0].concat(0); for (let i = 1; i < out.length; i++) { a += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); out[i] = out[i].concat(a); }
    ringCache.set(key, out); return out;
  }
  const SR = SPM.map((m) => ({ m, r: spineRing(m) })), SVMAX = Math.max(...SR.map((s) => s.r[s.r.length - 1][2])) * 1.002;
  {
    parts.push(finish(grid(SR.length, SR[0].r.length, (i, j) => { const [x, d] = SR[i].r[j]; return [x, Y(d), Z(SR[i].m)]; },
      (i, j) => ruv(R.spine, (SR[i].m - 49) / 54, SR[i].r[j][2] / SVMAX))));
    [SR[0], SR[SR.length - 1]].forEach((s, e) => parts.push(cap(s.r.map(([x, d]) => [x, Y(d), Z(s.m)]), cellUV(CELL.gun), [0, 0, e ? 1 : -1])));
  }
  // the bridge module's sensor dome, on its crown over the bridge
  { const pm = 66, top = Y(SP(pm));
    parts.push(stock(new THREE.SphereGeometry(1.5, lite ? 12 : 20, lite ? 6 : 10, 0, Math.PI * 2, 0, Math.PI / 2), CELL.dome, M4(0, top - 0.05, Z(pm), 0, 0, 0, [1, 0.45, 1]))); }

  // ---------- the rollbar and the weapons pod with its torpedo launchers ----------
  // A swept bar rising from the saucer's aft shoulders and arching over the engineering body (shipRoll), its crown
  // carrying a lozenge-shaped pod (shipPodAt) with two launchers firing forward and one aft.
  {
    const RS = lite ? 36 : 96, RR = lite ? 14 : 32, P3 = (s) => { const r = shipRoll(s); return new THREE.Vector3(r.out, Y(r.d), Z(r.m)); };
    [-1, 1].forEach((sd) => parts.push(finish(grid(RS + 1, RR + 1, (i, j) => {
      const s = sd * (i / RS) * 1.04, r = shipRoll(s), p = P3(s), tg = P3(s + 0.004 * sd).sub(P3(s - 0.004 * sd)).normalize();
      const fw = new THREE.Vector3(0, 0, -1).addScaledVector(tg, tg.z).normalize(), th = new THREE.Vector3().crossVectors(tg, fw).normalize(), a = (j % RR) / RR * Math.PI * 2;
      return p.addScaledVector(fw, r.chord * spow(Math.cos(a), 0.8)).addScaledVector(th, r.thick * spow(Math.sin(a), 0.7)).toArray();
    }, (i, j) => ruv(R.arch, 0.5 + 0.5 * i / RS, j / RR)), true)));
    const PN = lite ? 26 : 64, PR = lite ? 18 : 44;
    parts.push(finish(grid(PN + 1, PR + 1, (i, j) => { const q = i / PN, [hw, hh] = shipPodAt(q), a = (j % PR) / PR * Math.PI * 2;
      return [(hw + 0.001) * spow(Math.cos(a), 2 / 2.8), Y(POD.d) + (hh + 0.001) * spow(Math.sin(a), 2 / 2.8), Z(POD.m[0] + (POD.m[1] - POD.m[0]) * q)]; }, (i, j) => ruv(R.spar, i / PN, j / PR)), true));
    // launchers: armoured housings, their muzzles (the face toward the firing direction) mapped to the launcher art
    G.launchers.forEach(([a, b, o, d, hw, hh]) => {
      const aft = (a + b) / 2 > (POD.m[0] + POD.m[1]) / 2, bx = new THREE.BoxGeometry(2 * hw, 2 * hh, b - a, 1, 1, 1), n = bx.attributes.normal, uv = bx.attributes.uv;
      for (let k = 0; k < uv.count; k++) { const muzzle = aft ? n.getZ(k) > 0.9 : n.getZ(k) < -0.9; const c = muzzle ? ruv(R.launch, aft ? 1 - uv.getX(k) : uv.getX(k), 1 - uv.getY(k)) : cellUV(CELL.gun); uv.setXY(k, c[0], c[1]); }
      bx.applyMatrix4(M4(o, Y(d), Z((a + b) / 2))); parts.push(bx);
      parts.push(stock(new THREE.BoxGeometry(2 * hw + 0.5, 2 * hh + 0.4, 1.0), CELL.dark, M4(o, Y(d), Z(aft ? a + 1.4 : b - 1.4)))); // the housing's collar where it enters the pod
    });
  }

  // ---------- nacelles and their spars ----------
  // Big rounded-box nacelles from SHIPGEO.nacelle (profile = half-height, nacelle.w = width over height), with a raised
  // ridge along the top and a recessed channel down the inboard face that carries the grille.
  const N = G.nacelle, NRF = shipFn(N.prof), NL0 = N.prof[N.prof.length - 1][0], NCY = Y(N.d), NRR = lite ? 32 : 64;
  const NP = (() => { const s = new Set(); shipSpline(N.prof, lite ? 3 : 5).forEach(([p]) => s.add(+p.toFixed(3))); for (let p = 6; p < NL0 - 8; p += lite ? 5 : 2) s.add(p); return [...s].sort((a, b) => a - b); })();
  const nacLen = (p) => smooth01(4, 9, p) * (1 - smooth01(NL0 - 16, NL0 - 8, p));
  const nacPt = (sd, p, v, off) => { // v: 0 bottom, 0.25 inboard, 0.5 top, 0.75 outboard
    const r = NRF(p), a = v * Math.PI * 2 - Math.PI / 2, ex = spow(Math.cos(a), 2 / N.n), ey = spow(Math.sin(a), 2 / N.n), L = nacLen(p);
    const dv = (x, c, w) => { const q = (x - c) / w; return Math.exp(-q * q); };
    const k = 1 + 0.045 * L * dv(v, 0.5, 0.035) - 0.06 * L * dv(v, 0.25, 0.06) + (off || 0) / Math.max(r, 0.1);
    return [sd * N.z - sd * r * N.w * ex * k, NCY + r * ey * k, Z(N.m0 + p)];
  };
  [-1, 1].forEach((sd) => parts.push(finish(grid(NP.length, NRR + 1, (i, j) => nacPt(sd, NP[i], (j % NRR) / NRR), (i, j) => ruv(R.nac, NP[i] / NL0, j / NRR)), true)));
  {
    const NSP = lite ? 8 : 20, SRR = lite ? 14 : 32;
    [-1, 1].forEach((sd) => { // swept, nearly level pylons from the engineering body out to the nacelles
      const at = (A, B, PA, PB, s) => new THREE.Vector3(sd * (A[1] + (B[1] - A[1]) * s), Y(A[2] + (B[2] - A[2]) * s), Z(A[0] + (B[0] - A[0]) * s));
      const sp = G.spar, pl = G.sparPlan, L0 = [sp[0][0], pl[0][1], sp[0][1]], T0 = [sp[1][0], pl[1][1], sp[1][1]], T1 = [sp[2][0], pl[2][1], sp[2][1]], L1 = [sp[3][0], pl[3][1], sp[3][1]], PL0 = 0, PL1 = 0, PT0 = 0, PT1 = 0;
      parts.push(finish(grid(NSP + 1, SRR + 1, (i, j) => {
        const s = -0.12 + 1.19 * i / NSP, le = at(L0, L1, PL0, PL1, s), te = at(T0, T1, PT0, PT1, s), mid = le.clone().add(te).multiplyScalar(0.5);
        const ch = te.clone().sub(le), c = ch.length() / 2; ch.normalize();
        const span = at(L0, L1, PL0, PL1, 1).sub(at(L0, L1, PL0, PL1, 0)).normalize(), th = new THREE.Vector3().crossVectors(ch, span).normalize();
        const a = (j % SRR) / SRR * Math.PI * 2, t = 1.0 - 0.35 * Math.max(0, Math.min(1, s)), ex = spow(Math.cos(a), 0.8), ey = spow(Math.sin(a), 0.6);
        return mid.addScaledVector(ch, c * ex).addScaledVector(th, t * ey).toArray();
      }, (i, j) => ruv(R.turret, i / NSP, j / SRR)), true));
    });
  }

  // ---------- small parts: thruster blocks, sensor domes ----------
  {
    const rcs = (x, y, z, ry, s) => parts.push(stock(new THREE.BoxGeometry(2.6, 1.5, 0.9).translate(0, 0, 0.45), (u, v) => ruv(R.rcs, 0.04 + u * 0.92, 0.08 + (1 - v) * 0.84), M4(x, y, z, 0, ry, 0, s || 1)));
    [22, 98, 184].forEach((m) => { const S = secFull(m), dw = (hullSec(m + 0.5).w - hullSec(m - 0.5).w), yaw = Math.atan(dw); [-1, 1].forEach((sd) => rcs(sd * (hullAtDepth(S, SAU.dc).x - 0.25), Y(SAU.dc), Z(m), sd * (Math.PI / 2 + yaw), 1)); });
    [-1, 1].forEach((sd) => { const p = NL0 - 14, q = nacPt(sd, p, 0.75); rcs(q[0] - sd * 0.25, q[1], q[2], sd * Math.PI / 2, 0.8); });
    const bot = hullBot(80, 0.01); parts.push(stock(new THREE.SphereGeometry(3.0, lite ? 14 : 24, lite ? 6 : 10, 0, Math.PI * 2, 0, Math.PI / 2), CELL.dome, M4(0, bot[1] + 0.5, bot[2], Math.PI, 0, 0, [1, 0.5, 1.3])));
    const bot2 = hullBot(150, 0.01); parts.push(stock(new THREE.SphereGeometry(1.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), CELL.dome, M4(0, bot2[1] + 0.3, bot2[2], Math.PI, 0, 0, [1, 0.6, 1])));
  }

  // ---------- lettering and the deflector dish: thin decals that follow the hull ----------
  // decal(fn, region, na, nb): fn(a, b) gives a surface point for a in 0..1 across the text (left to right as read) and
  // b in 0..1 down it (top of the letters to the bottom); the decal sits 6 cm proud of the surface.
  function decal(fn, region, na, nb, lift) {
    const P = [], uvs = [], idx = [], e = 0.002;
    for (let i = 0; i <= nb; i++) for (let j = 0; j <= na; j++) { const a = j / na, b = i / nb, p = new THREE.Vector3(...fn(a, b));
      const pa = new THREE.Vector3(...fn(Math.min(1, a + e), b)).sub(new THREE.Vector3(...fn(Math.max(0, a - e), b)));
      const pb = new THREE.Vector3(...fn(a, Math.min(1, b + e))).sub(new THREE.Vector3(...fn(a, Math.max(0, b - e))));
      const n = new THREE.Vector3().crossVectors(pb, pa).normalize(); P.push(p.addScaledVector(n, lift || 0.06)); uvs.push(...ruv(region, a, b)); }
    const pos = []; P.forEach((p) => pos.push(p.x, p.y, p.z));
    for (let i = 0; i < nb; i++) for (let j = 0; j < na; j++) { const a = i * (na + 1) + j, b = a + 1, c = a + na + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
    decals.push(g); return g;
  }
  const NAME_AR = R.name[2] / R.name[3], REG_AR = R.reg[2] / R.reg[3]; // decal width over height = its atlas box
  // on top of the forward hull, read from aft with the letters' tops toward the bow: name, then the registry aft of it
  { const h = 4.4, w = h * NAME_AR, mc = 33; decal((a, b) => hullTop(mc - h / 2 + b * h, (a - 0.5) * w), R.name, 24, 4); }
  { const h = 6.2, w = h * REG_AR, mc = 41.5; decal((a, b) => hullTop(mc - h / 2 + b * h, (a - 0.5) * w), R.reg, 16, 4); }
  // under the forward hull, read from below (left to right runs starboard to port)
  { const h = 4.4, w = h * NAME_AR, mc = 44; decal((a, b) => hullBot(mc - h / 2 + b * h, (0.5 - a) * w), R.name, 24, 4); }
  { const h = 6.2, w = h * REG_AR, mc = 52.5; decal((a, b) => hullBot(mc - h / 2 + b * h, (0.5 - a) * w), R.reg, 16, 4); }
  [-1, 1].forEach((sd) => {
    // both flanks of the engineering section, below the window band; name first as read (forward on port, aft on starboard)
    const side = (m0, len, d0, h) => (a, b) => { const m = sd < 0 ? m0 + a * len : m0 + len - a * len; return hullSidePt(m, d0 + b * h, sd) || hullSidePt(m, d0 + b * h * 0.5, sd); };
    { const h = 2.6, nl = h * NAME_AR, rl = h * REG_AR, gap = 5.9;
      decal(side(sd < 0 ? 150 : 150 + rl + gap, nl, 23.2, h), R.name, 20, 3); decal(side(sd < 0 ? 150 + nl + gap : 150, rl, 23.2, h), R.reg, 12, 3); }
    // the registry on each nacelle's outboard side, aft of the spar
    { const h = 1.7, len = h * REG_AR, p0 = 66, per = 2 * Math.PI * NRF(p0) * (1 + N.w) / 2;
      decal((a, b) => { const p = sd < 0 ? p0 + a * len : p0 + len - a * len; return nacPt(sd, p, 0.75 + (b - 0.5) * h / per); }, R.reg, 12, 2); }
  });
  // the navigational deflector: a glowing oval dish on the engineering body's nose, under the saucer
  { const front = (d) => { let m = 92; while (m < 125 && shipHull(m).b < d) m += 0.1; return m; }, dd = 24.2, m0 = front(dd), tilt = Math.atan2(front(dd + 1.5) - front(dd - 1.5), 3);
    const out = 0.9, py = Y(dd) - Math.sin(tilt) * out, pz = Z(m0) - Math.cos(tilt) * out; // stand the dish proud of the curved nose, along its normal
    const dish = new THREE.CircleGeometry(1, lite ? 24 : 40), du = dish.attributes.uv; for (let k = 0; k < du.count; k++) du.setXY(k, ...ruv(R.defl, du.getX(k), 1 - du.getY(k))); dish.applyMatrix4(M4(0, py, pz, -tilt, Math.PI, 0, [3.2, 2.3, 1])); decals.push(dish);
    parts.push(stock(new THREE.TorusGeometry(1, 0.12, 8, lite ? 24 : 40), CELL.dark, M4(0, py + Math.sin(tilt) * 0.05, pz + Math.cos(tilt) * 0.05, -tilt, Math.PI, 0, [3.3, 2.4, 3])));
    parts.push(stock(new THREE.CylinderGeometry(1, 1.15, out + 0.6, lite ? 16 : 28, 1, true), CELL.dark, M4(0, (py + Y(dd)) / 2 + Math.sin(tilt) * 0.3, (pz + Z(m0)) / 2 + Math.cos(tilt) * 0.3, Math.PI / 2 - tilt, 0, 0, [3.3, 1, 2.4]))); }

  // ---------- stage 2b: the busy outside ----------
  // Hardware with real depth is geometry in the hull's paint (docking ports and the ventral collar, tractor emitters,
  // dishes, antennas, sensor pallets, the shuttlebay's opening and its clamshell doors); small lights are points
  // (LT) that blink in their own shader; the impulse plumes and thruster puffs are soft sprites (built after the paint).
  const V3 = (a) => new THREE.Vector3(...a), SEG = lite ? 18 : 36;
  // a local frame: y along n (out of the hull), z along t (usually aft), x = y cross z
  const mount = (p, n, t, s) => { const y = n.clone().normalize(), z = t.clone().addScaledVector(y, -t.dot(y)).normalize(), x = new THREE.Vector3().crossVectors(y, z);
    const mt = new THREE.Matrix4().makeBasis(x, y, z); if (s) mt.scale(new THREE.Vector3(...(Array.isArray(s) ? s : [s, s, s]))); return mt.setPosition(p); };
  // the hull's frame at a point on a side (m, depth d) or on the top or bottom (m, lateral x)
  const sideFrame = (m, d, sd) => { const P = (mm, dd) => V3(hullSidePt(mm, dd, sd)), t = P(m + 0.25, d).sub(P(m - 0.25, d)).normalize(), dn = P(m, d + 0.25).sub(P(m, d - 0.25)).normalize();
    const n = new THREE.Vector3().crossVectors(t, dn).normalize(); if (n.x * sd < 0) n.negate(); return { p: P(m, d), n, t }; };
  const surfFrame = (m, x, upper) => { const P = (mm, xx) => V3(upper ? hullTop(mm, xx) : hullBot(mm, xx)), t = P(m + 0.25, x).sub(P(m - 0.25, x)).normalize(), s = P(m, x + 0.25).sub(P(m, x - 0.25)).normalize();
    const n = new THREE.Vector3().crossVectors(t, s).normalize(); if ((n.y > 0) !== upper) n.negate(); return { p: P(m, x), n, t }; };
  // turn every triangle to face want(centre) (for shapes whose winding isn't known in advance), then smooth normals
  const orient = (g, want) => { const p = g.attributes.position, ix = g.index.array, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    for (let k = 0; k < ix.length; k += 3) { a.fromBufferAttribute(p, ix[k]); b.fromBufferAttribute(p, ix[k + 1]); c.fromBufferAttribute(p, ix[k + 2]);
      const nn = b.clone().sub(a).cross(c.clone().sub(a)), ctr = a.clone().add(b).add(c).multiplyScalar(1 / 3); if (nn.dot(want(ctr)) < 0) { const q = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = q; } }
    if (g.attributes.normal) g.deleteAttribute('normal'); g.computeVertexNormals(); return g; };
  const LT = [], LK = { steady: 0, strobe: 1, beacon: 2, chase: 3, blink: 4 }; // lights: position, colour, size (m), kind, phase
  const light = (p, col, size, kind, ph) => LT.push({ p: Array.isArray(p) ? p : p.toArray(), col: new THREE.Color(col), size, kind: LK[kind], ph: ph || 0 });
  const AMBER = 0xffa640, WHITE = 0xf4f8ff, RED = 0xff3a2a;
  const local = (fr, x, y, z) => { const mt = mount(fr.p, fr.n, fr.t); return new THREE.Vector3(x, y, z).applyMatrix4(mt); };
  // docking ports: an armoured collar standing out of the hull, a striped face ring, a recessed hatch, a ring of guide lights
  const DOCKS = [];
  function dockPort(name, fr, r, lip, nl) {
    const { p, n, t } = fr, at = (h) => p.clone().addScaledVector(n, h);
    parts.push(stock(new THREE.CylinderGeometry(r, r + 0.35, lip + 0.9, SEG, 1, true), CELL.dark, mount(at((lip - 0.9) / 2), n, t)));
    parts.push(stock(new THREE.RingGeometry(r * 0.64, r + 0.02, SEG, 1).rotateX(-Math.PI / 2), (u, v) => ruv(R.dock, u, 1 - v), mount(at(lip), n, t)));
    const well = new THREE.CylinderGeometry(r * 0.64, r * 0.64, 0.32, SEG, 1, true); flip(well); well.computeVertexNormals();
    parts.push(stock(well, CELL.slate, mount(at(lip - 0.16), n, t)));
    parts.push(stock(new THREE.CircleGeometry(r * 0.64, SEG).rotateX(-Math.PI / 2), (u, v) => ruv(R.dock, 0.5 + (u - 0.5) * 0.64, 0.5 - (v - 0.5) * 0.64), mount(at(lip - 0.3), n, t)));
    for (let k = 0; k < nl; k++) { const a = k / nl * Math.PI * 2; light(local(fr, Math.cos(a) * (r + 0.22), lip + 0.06, Math.sin(a) * (r + 0.22)), AMBER, 0.55, 'chase', k / nl); }
    const m = p.z + 64, d = 7 - p.y; DOCKS.push({ name, m, d, r, lip }); return fr;
  }
  // Deck 4's rim docking ports (port and starboard twins), and the ventral collar under the keel on Deck 10
  const DOCK_RIM = { m: 89, d: 12.3 }, DOCK_KEEL = { m: 121 };
  [-1, 1].forEach((sd) => dockPort(sd < 0 ? 'Docking port, port' : 'Docking port, starboard', sideFrame(DOCK_RIM.m, DOCK_RIM.d, sd), 1.9, 0.55, 10));
  { const fr = { p: V3(hullBot(DOCK_KEEL.m, 0)), n: new THREE.Vector3(0, -1, 0), t: new THREE.Vector3(0, 0, 1) };
    dockPort('Docking collar and fuel transfer', fr, 2.5, 1.5, 14);
    parts.push(stock(new THREE.TorusGeometry(3.05, 0.26, 8, SEG).rotateX(-Math.PI / 2), CELL.gun, mount(fr.p.clone().addScaledVector(fr.n, 0.25), fr.n, fr.t)));
    [-1, 1].forEach((s) => parts.push(stock(new THREE.BoxGeometry(0.7, 0.9, 7.6), CELL.dark, M4(s * 3.3, fr.p.y - 0.3, fr.p.z)))); } // the collar's side rails
  // tractor beam emitters: an armoured ring round a shallow glowing lens (keel, Deck 10; and aft by the shuttlebay)
  const emitter = (fr, r) => { const at = (h) => fr.p.clone().addScaledVector(fr.n, h);
    parts.push(stock(new THREE.CylinderGeometry(r * 1.15, r * 1.35, 1.0, SEG, 1, true), CELL.dark, mount(at(0.05), fr.n, fr.t)));
    parts.push(stock(new THREE.TorusGeometry(r * 1.15, 0.12, 6, SEG).rotateX(-Math.PI / 2), CELL.slate, mount(at(0.55), fr.n, fr.t)));
    parts.push(stock(new THREE.SphereGeometry(r, SEG, lite ? 4 : 8, 0, Math.PI * 2, 0, Math.PI / 2), CELL.tractor, mount(at(0.42), fr.n, fr.t, [1, 0.3, 1]))); };
  const TRACTORS = [134, 192]; TRACTORS.forEach((m) => emitter({ p: V3(hullBot(m, 0)), n: new THREE.Vector3(0, -1, 0), t: new THREE.Vector3(0, 0, 1) }, m < 150 ? 1.5 : 1.1));
  // small dishes on short masts and whip antennas with a red tip light
  const dishGeo = (R0, f) => { const pts = [], N = lite ? 4 : 6; for (let i = 0; i <= N; i++) { const r = R0 * i / N; pts.push(new THREE.Vector2(Math.max(r, 0.002), r * r / (4 * f))); }
    for (let i = N; i >= 0; i--) { const r = R0 * i / N * 0.96; pts.push(new THREE.Vector2(Math.max(r, 0.002), r * r / (4 * f) - 0.09 - 0.05 * (1 - i / N))); }
    return orient(new THREE.LatheGeometry(pts, lite ? 10 : 18), (c) => new THREE.Vector3(0, c.y > Math.hypot(c.x, c.z) ** 2 / (4 * f) - 0.05 ? 1 : -1, 0)); };
  const dish = (fr, R0, mast, aim) => { const top = fr.p.clone().addScaledVector(fr.n, mast), dir = aim.clone().normalize();
    parts.push(stock(new THREE.CylinderGeometry(0.12, 0.2, mast + 0.3, 8), CELL.dark, mount(fr.p.clone().addScaledVector(fr.n, mast / 2 - 0.15), fr.n, fr.t)));
    parts.push(stock(dishGeo(R0, R0 * 0.55), CELL.pale, mount(top, dir, fr.t)));
    parts.push(stock(new THREE.CylinderGeometry(0.035, 0.05, R0 * 0.55, 5), CELL.dark, mount(top.clone().addScaledVector(dir, R0 * 0.27), dir, fr.t)));
    parts.push(stock(new THREE.SphereGeometry(0.09, 8, 6), CELL.slate, mount(top.clone().addScaledVector(dir, R0 * 0.55), dir, fr.t))); };
  const whip = (fr, L) => { parts.push(stock(new THREE.CylinderGeometry(0.05, 0.1, L, 6), CELL.dark, mount(fr.p.clone().addScaledVector(fr.n, L / 2 - 0.1), fr.n, fr.t)));
    parts.push(stock(new THREE.SphereGeometry(0.13, 8, 6), CELL.slate, mount(fr.p.clone().addScaledVector(fr.n, L), fr.n, fr.t))); light(fr.p.clone().addScaledVector(fr.n, L + 0.15), RED, 0.5, 'blink', rnd()); };
  // comms dishes on the engineering back aft of the rollbar, a pair under the saucer's aft quarter, whips on the bridge module and the stern
  [-1, 1].forEach((sd) => { dish(surfFrame(170, sd * 3.4, true), 1.2, 1.1, new THREE.Vector3(sd * 0.5, 1, 0.45)); dish(surfFrame(98, sd * 20, false), 0.95, 0.8, new THREE.Vector3(sd * 0.6, -1, -0.2)); });
  { const fr = surfFrame(176.5, 0, true); dish(fr, 0.75, 2.2, new THREE.Vector3(0, 0.6, 1)); }
  [-1, 1].forEach((sd) => { whip({ p: V3([sd * 5.2, Y(SP(75)) - 0.15, Z(75)]), n: new THREE.Vector3(sd * 0.08, 1, 0), t: new THREE.Vector3(0, 0, 1) }, 2.6); whip(surfFrame(188, sd * 2.2, true), 3.4); });
  // raised sensor pallets: two on the saucer's forward top, two on the engineering back; a third dome low on the stern's back
  const pallet = (fr, w, l, hgt) => { const bx = new THREE.BoxGeometry(w, hgt, l), nn = bx.attributes.normal, uv = bx.attributes.uv;
    for (let k = 0; k < uv.count; k++) { const c = nn.getY(k) > 0.9 ? ruv(R.sensor, uv.getX(k), 1 - uv.getY(k)) : cellUV(CELL.dark); uv.setXY(k, c[0], c[1]); }
    bx.applyMatrix4(mount(fr.p.clone().addScaledVector(fr.n, hgt / 2 - 0.12), fr.n, fr.t)); parts.push(bx); };
  [-1, 1].forEach((sd) => { pallet(surfFrame(21, sd * 11.5, true), 5.2, 3.4, 0.42); pallet(surfFrame(158, sd * 5.0, true), 2.6, 5.0, 0.34); });
  { const fr = surfFrame(194, 0, true); parts.push(stock(new THREE.SphereGeometry(1.0, lite ? 10 : 18, lite ? 4 : 8, 0, Math.PI * 2, 0, Math.PI / 2), CELL.dome, mount(fr.p.clone().addScaledVector(fr.n, -0.05), fr.n, fr.t, [1, 0.5, 1.3]))); }

  // ---------- the shuttlebay: a two-deck bay (Decks 7 and 8) opening through the stern behind clamshell doors ----------
  // The opening follows the transom's outline 1 m in from the hull; the transom is rebuilt round it (scanlines through
  // the hull's own section points, so its edge meets the hull exactly). Behind it the bay runs forward to m BAY.m0.
  const SB = HS[HS.length - 1], ZS = Z(SB.m);
  const BAY = { m0: 168, dA: 21.3, dB: 28.0, inset: 1.0, lip: 0.36, frame: 0.5 };
  BAY.dM = (BAY.dA + BAY.dB) / 2;
  const hwAt = (d) => { const q = hullAtDepth(SB, d); return q ? q.x : 0; }, owAt = (d) => Math.max(0.6, hwAt(d) - BAY.inset);
  const sternUV = (x, d) => ruv(R.stern, 0.5 + x / 24, (d - 15) / 18);
  const BAYD = (() => { const s = []; for (let i = 0; i <= 10; i++) s.push(BAY.dA + (BAY.dB - BAY.dA) * i / 10); return s; })();
  // the opening's outline, going round from the top left: ceiling, starboard wall, floor, port wall; v (0..1) for the bay's art
  // each point: [x, depth, v, which edge: t top, r starboard, b bottom, l port; a corner is the first point of an edge]
  const OPEN = (() => { const o = [], nT = 6, nS = BAYD.length - 1;
    for (let i = 0; i < nT; i++) o.push([-owAt(BAY.dA) + 2 * owAt(BAY.dA) * i / nT, BAY.dA, 0.25 * i / nT, 't', i === 0]);
    for (let i = 0; i < nS; i++) o.push([owAt(BAYD[i]), BAYD[i], 0.25 + 0.25 * i / nS, 'r', i === 0]);
    for (let i = 0; i < nT; i++) o.push([owAt(BAY.dB) - 2 * owAt(BAY.dB) * i / nT, BAY.dB, 0.5 + 0.25 * i / nT, 'b', i === 0]);
    for (let i = 0; i < nS; i++) o.push([-owAt(BAYD[nS - i]), BAYD[nS - i], 0.75 + 0.25 * i / nS, 'l', i === 0]);
    return o; })();
  // the outline pushed out by F: corners diagonally, the top and bottom edges up and down, the side walls sideways
  const openOut = (F) => OPEN.map(([x, d, , e, corner]) => {
    if (corner) return [Math.sign(x) * (Math.abs(x) + F), d + (d < BAY.dM ? -F : F)];
    if (e === 't' || e === 'b') return [x * (owAt(d) + F) / owAt(d), d + (e === 't' ? -F : F)];
    return [Math.sign(x) * (Math.abs(x) + F), d]; });
  { // the transom: a top and a bottom piece across the full width, and a piece either side of the opening
    const side = SB.side.map(([x, d]) => [x, d]), aft = () => new THREE.Vector3(0, 0, 1);
    const piece = (rows, nc, xf) => orient(grid(rows.length, nc, (i, j) => [xf(rows[i], j), Y(rows[i]), ZS], (i, j) => sternUV(xf(rows[i], j), rows[i])), aft);
    const wAt = (d) => { for (const [x, dd] of side) if (Math.abs(dd - d) < 1e-6) return x; return hwAt(d); };
    const rA = owAt(BAY.dA) / hwAt(BAY.dA), rB = owAt(BAY.dB) / hwAt(BAY.dB), fA = [-1, -(1 + rA) / 2, -rA, -rA / 2, 0, rA / 2, rA, (1 + rA) / 2, 1], fB = [-1, -(1 + rB) / 2, -rB, -rB / 2, 0, rB / 2, rB, (1 + rB) / 2, 1];
    parts.push(piece([...side.filter(([, d]) => d < BAY.dA - 0.01).map(([, d]) => d), BAY.dA], 9, (d, j) => fA[j] * wAt(d)));
    parts.push(piece([BAY.dB, ...side.filter(([, d]) => d > BAY.dB + 0.01).map(([, d]) => d)], 9, (d, j) => fB[j] * wAt(d)));
    const mids = [...new Set([...BAYD, ...side.filter(([, d]) => d > BAY.dA && d < BAY.dB).map(([, d]) => d)])].sort((a, b) => a - b);
    [-1, 1].forEach((s) => parts.push(piece(mids, 3, (d, j) => s * (owAt(d) + (wAt(d) - owAt(d)) * j / 2)))); }
  { // the door frame: an armoured lip standing out round the opening (inner wall, face, outer wall)
    const n = OPEN.length, out = openOut(BAY.frame);
    const ring = (a, za, b, zb, want) => parts.push(orient(grid(2, n, (i, j) => { const [x, d] = (i ? b : a)[j]; return [x, Y(d), i ? zb : za]; }, () => cellUV(CELL.dark), true), want));
    const ctr = new THREE.Vector3(0, Y(BAY.dM), 0);
    ring(OPEN, ZS - 0.4, OPEN, ZS + BAY.lip, (c) => ctr.clone().setZ(c.z).sub(c));
    ring(OPEN, ZS + BAY.lip, out, ZS + BAY.lip, () => new THREE.Vector3(0, 0, 1));
    ring(out, ZS + BAY.lip, out, ZS - 0.05, (c) => c.clone().sub(ctr.clone().setZ(c.z)));
    // hinge rods along the top and bottom of the opening
    [BAY.dA - 0.2, BAY.dB + 0.2].forEach((d) => parts.push(stock(new THREE.CylinderGeometry(0.2, 0.2, 2 * owAt(d) + 0.6, 10).rotateZ(Math.PI / 2), CELL.gun, M4(0, Y(d), ZS + BAY.lip + 0.1)))); }
  // the impulse vents sit above the bay on the transom: [x from, x to, depth from, depth to] (the stern art paints them)
  const VENTS = [[-7.4, -0.9, 17.8, 19.6], [0.9, 7.4, 17.8, 19.6]];
  // thruster blocks (the lateral ones at the rim and on the nacelles) as puff sources: [position, outward direction]
  const RCS = [];
  [22, 98, 184].forEach((m) => { const S = secFull(m), dw = (hullSec(m + 0.5).w - hullSec(m - 0.5).w), yaw = Math.atan(dw);
    [-1, 1].forEach((sd) => { const dir = [sd * Math.cos(yaw), 0, -Math.sin(yaw)], x0 = sd * (hullAtDepth(S, SAU.dc).x - 0.25); RCS.push([[x0 + dir[0] * 1.0, Y(SAU.dc), Z(m) + dir[2] * 1.0], dir]); }); });
  [-1, 1].forEach((sd) => { const q = nacPt(sd, NL0 - 14, 0.75); RCS.push([[q[0] + sd * 0.55, q[1], q[2]], [sd, 0, 0]]); });
  // navigation strobes (white double flash) at the bow, the nacelle tails and the stern; red beacons on the pod and the keel
  light([0, Y(SAU.dc), Z(0) - 0.35], WHITE, 1.6, 'strobe', 0);
  [-1, 1].forEach((sd) => light(nacPt(sd, NL0 - 0.8, 0.5, 0.25), WHITE, 1.4, 'strobe', 0.03));
  light([0, Y(HT(199.4)) + 0.3, Z(199.4)], WHITE, 1.3, 'strobe', 0.5);
  light([0, Y(POD.d) + POD.h + 0.3, Z((POD.m[0] + POD.m[1]) / 2)], RED, 1.3, 'beacon', 0);
  light([0, V3(hullBot(165, 0)).y - 0.3, Z(165)], RED, 1.3, 'beacon', 0.5);
  // docking guide lights either side of the bay's mouth, chasing toward it, and the fighter hangar's launch doors (Deck 6)
  [-1, 1].forEach((s) => { for (let k = 0; k < 5; k++) light([s * (owAt(BAY.dM) + BAY.frame + 0.35), Y(BAY.dA + (BAY.dB - BAY.dA) * (k + 0.5) / 5), ZS + BAY.lip + 0.05], AMBER, 0.5, 'chase', k / 5); });
  const HANGAR = [[57.5, 63.2], [64.0, 69.7]], HX = [2.2, 8.6];
  HANGAR.forEach(([a, b]) => [-1, 1].forEach((s) => [a, b].forEach((m) => [HX[0], HX[1]].forEach((x) => light(V3(hullBot(m, s * x)).add(new THREE.Vector3(0, -0.12, 0)), AMBER, 0.4, 'blink', m > a ? 0.5 : 0)))));

  // ---------- service stencils and registry repeats: thin decals, their text drawn by letter() ----------
  // Each stencil gets one 32 px row of R.marks, its width fitted to the text (pale grey, condensed caps).
  const MK = (() => { const c = cnv(8, 8).getContext('2d'); c.font = `600 100px ${DISP}`; const list = {}; let row = 0;
    const add = (key, txt) => { const wd = c.measureText(txt).width + 6 * (txt.length - 1), w = Math.min(R.marks[2], Math.ceil(wd * 0.284 / 0.94) + 6); list[key] = { txt, r: [R.marks[0], R.marks[1] + 32 * row++, w, 32] }; };
    [['dockP', 'DOCKING PORT 4-P'], ['dockS', 'DOCKING PORT 4-S'], ['collar', 'DOCKING COLLAR 10'], ['tr1', 'TRACTOR EMITTER 1'], ['tr2', 'TRACTOR EMITTER 2'],
      ['bay', 'SHUTTLEBAY'], ['h1', 'LAUNCH DOOR 6-1'], ['h2', 'LAUNCH DOOR 6-2'], ['h3', 'LAUNCH DOOR 6-3'], ['h4', 'LAUNCH DOOR 6-4'], ['rcs', 'RCS · KEEP CLEAR'],
      ['ep3', 'ESCAPE PODS · DECK 3'], ['ep4', 'ESCAPE PODS · DECK 4'], ['ep5', 'ESCAPE PODS · DECK 5'], ['ep6', 'ESCAPE PODS · DECK 6']].forEach(([k, t]) => add(k, t));
    return list; })();
  // on a side, centred at (m, depth d), hs metres tall on the surface, read from outside (forward to the left on port)
  const markSide = (reg, mc, dc, hs, sd) => { const len = hs * reg[2] / reg[3], P = (m, d) => V3(hullSidePt(m, d, sd)), dh = hs / (P(mc, dc + 0.1).distanceTo(P(mc, dc - 0.1)) / 0.2);
    decal((a, b) => { const m = sd < 0 ? mc - len / 2 + a * len : mc + len / 2 - a * len; return hullSidePt(m, dc - dh / 2 + b * dh, sd); }, reg, Math.max(4, Math.round(len / 1.2)), 2); };
  // under the hull, read from below with the tops of the letters toward the bow
  const markBot = (reg, mc, xc, hs) => { const w = hs * reg[2] / reg[3]; decal((a, b) => hullBot(mc - hs / 2 + b * hs, xc + (0.5 - a) * w), reg, Math.max(3, Math.round(w / 1.2)), 2); };
  // the depth reached by walking dist metres over the hull's surface from (m, d0), toward the rim (dir -1) or away (+1)
  const walk = (m, d0, dist, sd, dir) => { let d = d0, s = 0, p = V3(hullSidePt(m, d0, sd)); while (s < dist) { const q = hullSidePt(m, d + dir * 0.01, sd); if (!q) break; d += dir * 0.01; s += p.distanceTo(V3(q)); p = V3(q); } return d; };
  [-1, 1].forEach((sd) => {
    // above each rim docking port: its stencil, and the registry above that
    const dl = walk(DOCK_RIM.m, DOCK_RIM.d, 2.9, sd, -1), dr = walk(DOCK_RIM.m, DOCK_RIM.d, 3.7, sd, -1);
    markSide(MK[sd < 0 ? 'dockP' : 'dockS'].r, DOCK_RIM.m, dl, 0.5, sd); markSide(R.reg, DOCK_RIM.m, dr, 0.62, sd);
    // over each lateral thruster block on the rim and the engineering flanks
    [22, 98, 184].forEach((m) => markSide(MK.rcs.r, m, walk(m, SAU.dc, 1.55, sd, -1), 0.4, sd));
    // escape pod rows, labelled along their middle, 1.4 m off the row (above it on the upper hull, below it underneath)
    [[30, 46, 10.0, 'ep3'], [84, 100, 10.0, 'ep3'], [140, 150, 12.8, 'ep3'], [34, 52, 11.0, 'ep4'], [72.5, 96, 17.0, 'ep5'], [72.5, 90, 20.5, 'ep6']].forEach(([a, b, d, k]) => {
      const mc = (a + b) / 2; markSide(MK[k].r, mc, walk(mc, d, 1.45, sd, d < SAU.dc ? -1 : 1), 0.42, sd); });
  });
  markBot(MK.collar.r, DOCK_KEEL.m + 4.6, 0, 0.6); markBot(MK.tr1.r, TRACTORS[0] - 3.1, 0, 0.55); markBot(MK.tr2.r, TRACTORS[1] - 2.6, 0, 0.5);
  HANGAR.forEach(([a, b], i) => [-1, 1].forEach((s) => markBot(MK['h' + (1 + 2 * i + (s > 0 ? 1 : 0))].r, i ? b + 0.75 : a - 0.75, s * (HX[0] + HX[1]) / 2, 0.55)));
  { const reg = MK.bay.r, hs = 0.36, w = hs * reg[2] / reg[3]; decal((a, b) => [-w / 2 + a * w, Y(19.76 + b * hs), ZS], reg, 2, 1); }

  // ---------- paint ----------
  const cw = Math.round(AW * K), chh = Math.round(AH * K), ek = K * 0.5;
  const C = cnv(cw, chh), g = C.getContext('2d'), Hc = cnv(cw, chh), h = Hc.getContext('2d'), E = cnv(Math.round(AW * ek), Math.round(AH * ek)), ge = E.getContext('2d');
  g.scale(K, K); h.scale(K, K); ge.scale(ek, ek);
  g.fillStyle = HULL_PAINT.tones[0][0]; g.fillRect(0, 0, AW, AH); h.fillStyle = 'rgb(200,200,200)'; h.fillRect(0, 0, AW, AH); ge.fillStyle = '#000'; ge.fillRect(0, 0, AW, AH);
  const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const css = (c) => `rgb(${Math.round(Math.max(0, Math.min(255, c[0])))},${Math.round(Math.max(0, Math.min(255, c[1])))},${Math.round(Math.max(0, Math.min(255, c[2])))})`;
  const TONES = HULL_PAINT.tones.map(([c, w]) => [hex(c), w]), TW = TONES.reduce((q, t) => q + t[1], 0);
  const pickTone = () => { let r = rnd() * TW; for (const [c, w] of TONES) { if ((r -= w) <= 0) return c; } return TONES[0][0]; };
  const jit = (c, k) => { const f = 1 + (rnd() - 0.5) * k; return [c[0] * f, c[1] * f, c[2] * f]; };
  const lw = 1 / K; // one device pixel
  let podCount = 0; // escape pods painted (a side)
  // tonal patchwork: large zones of one tone family split into smaller plates, each a touch lighter or darker (colour
  // only: the seams, hatches and relief come from the baked plating patch the shader lays over everything)
  function panels(r, uPx, vPx, big, min, o) {
    o = o || {}; const [x0, y0, W, H] = r, Wm = W / uPx, Hm = H / vPx, leaves = [];
    const split = (x, y, w, hh, tone, depth) => {
      const small = w < min * 1.7 && hh < min * 1.7;
      if (small || (depth >= 2 && rnd() < 0.22) || depth > 6) { leaves.push([x, y, w, hh, tone]); return; }
      const alongU = w / hh > 1.5 ? true : hh / w > 1.5 ? false : rnd() < 0.5, f = 0.28 + rnd() * 0.44;
      const t2 = () => rnd() < 0.12 ? pickTone() : jit(tone, 0.035);
      if (alongU) { const a = w * f; split(x, y, a, hh, t2(), depth + 1); split(x + a, y, w - a, hh, t2(), depth + 1); }
      else { const a = hh * f; split(x, y, w, a, t2(), depth + 1); split(x, y + a, w, hh - a, t2(), depth + 1); }
    };
    for (let y = 0; y < Hm; ) { const bh = big * (0.55 + rnd() * 0.6); for (let x = -rnd() * big; x < Wm; ) { const bw = big * (0.9 + rnd() * 1.4); split(x, y, bw, bh, pickTone(), 0); x += bw; } y += bh; }
    g.save(); g.beginPath(); g.rect(x0, y0, W, H); g.clip(); h.save(); h.beginPath(); h.rect(x0, y0, W, H); h.clip();
    leaves.forEach(([x, y, w, hh, tone]) => {
      const px = x0 + x * uPx, py = y0 + y * vPx, pw = w * uPx, ph = hh * vPx, area = w * hh;
      const red = o.red && area < 10 && area > 2 && rnd() < o.red;
      g.fillStyle = css(red ? jit(hex(HULL_PAINT.oxide), 0.1) : tone); g.fillRect(px, py, pw, ph);
      h.fillStyle = 'rgb(180,180,180)'; h.fillRect(px, py, pw, ph); // flat: relief comes from the baked plating
      // a soft inner gradient gives each plate a little curvature in the light
      if (pw > 6 && ph > 6) { const gr = g.createLinearGradient(px, py, px, py + ph); gr.addColorStop(0, 'rgba(255,255,255,0.035)'); gr.addColorStop(1, 'rgba(0,0,0,0.05)'); g.fillStyle = gr; g.fillRect(px, py, pw, ph); }
    });
    g.restore(); h.restore();
  }
  // weathering: long faint streaks trailing aft (along u), a few darker, a few lighter
  function streaks(r, uPx, vPx, n) {
    const [x0, y0, W, H] = r; g.save(); g.beginPath(); g.rect(x0, y0, W, H); g.clip();
    for (let i = 0; i < n; i++) { const x = x0 + rnd() * W, y = y0 + rnd() * H, len = (3 + rnd() * 18) * uPx, th = (0.15 + rnd() * 0.7) * vPx, dark = rnd() < 0.75;
      const gr = g.createLinearGradient(x, 0, x + len, 0); gr.addColorStop(0, dark ? 'rgba(10,12,12,0.16)' : 'rgba(235,240,240,0.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x, y, len, th); }
    g.restore();
  }
  // fine grain over a region (a small noise tile laid over with overlay blending)
  const grain = (() => { const c = cnv(128, 128), x = c.getContext('2d'), im = x.createImageData(128, 128); for (let i = 0; i < im.data.length; i += 4) { const v = 100 + rnd() * 56; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); return g.createPattern(c, 'repeat'); })();
  const grainOver = (r, a) => { g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = a; g.fillStyle = grain; g.fillRect(...r); g.restore(); };

  // hull region: u = m (20.5 px/m), v = arc length from the top centreline (shared by both sides)
  const HU = R.hull[2] / 200, HV = R.hull[3] / VMAX;
  const hx = (m) => R.hull[0] + m * HU, hy = (arc) => R.hull[1] + arc * HV;
  const secAt = (() => { const cache = new Map(); return (m) => { const k = Math.round(m * 4) / 4; if (!cache.has(k)) cache.set(k, secFull(k)); return cache.get(k); }; })();
  const arcAtX = (S, x, upper) => { const s = S.side; let best = null; for (let i = 1; i < s.length; i++) { const [xa, , aa] = s[i - 1], [xb, , ab] = s[i]; const lo = Math.min(xa, xb), hi = Math.max(xa, xb);
    if (x >= lo && x <= hi && hi > lo) { const a = aa + (ab - aa) * (x - xa) / (xb - xa); if (upper ? (best === null || a < best) : (best === null || a > best)) best = a; } } return best; };
  const arcAtD = (m, d) => { const a = hullAtDepth(secAt(m), d); return a && a.arc; };
  // a band following the hull between two arc functions, filled in colour (and optionally height)
  const band = (ctx, f0, f1, m0, m1, style) => { ctx.beginPath(); let first = true; const pts = [];
    for (let m = m0; m <= m1 + 1e-6; m += 0.5) { const a = f0(m), b = f1(m); if (a == null || b == null) continue; pts.push([m, a, b]); }
    if (!pts.length) return; pts.forEach(([m, a]) => { ctx[first ? 'moveTo' : 'lineTo'](hx(m), hy(a)); first = false; }); pts.slice().reverse().forEach(([m, , b]) => ctx.lineTo(hx(m), hy(b)));
    ctx.closePath(); ctx.fillStyle = style; ctx.fill(); };
  const line = (ctx, f, m0, m1, w, style) => band(ctx, (m) => { const a = f(m); return a == null ? null : a - w / 2; }, (m) => { const a = f(m); return a == null ? null : a + w / 2; }, m0, m1, style);

  panels(R.hull, HU, HV, 18, 1.6, { red: 0 }); // no oxide plates on the hull: the phaser arcs and pod rims carry the accents
  streaks(R.hull, HU, HV, lite ? 420 : 700);
  // shading by place: the underside and the lower flanks a little darker; contact shadow where the spine, arch and spars meet the hull
  for (let m = 0; m < 200; m += 1) { const S = secAt(m + 0.5), a = hullAtDepth(S, S.r1); if (!a) continue; const y0 = hy(a.arc), y1 = hy(S.side[S.side.length - 1][2]);
    const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(6,9,10,0.28)'); g.fillStyle = gr; g.fillRect(hx(m), y0, HU + 0.5, y1 - y0); }
  [1, -1].forEach(() => { for (let m = 49.5; m < 102; m += 0.5) { const S = secAt(m), a = arcAtX(S, spineRing(m)[0][0] - 0.3, true); if (a == null) continue; const gr = g.createLinearGradient(0, hy(a), 0, hy(a + 3.2)); gr.addColorStop(0, 'rgba(5,7,8,0.45)'); gr.addColorStop(1, 'rgba(5,7,8,0)'); g.fillStyle = gr; g.fillRect(hx(m), hy(a), 0.5 * HU + 0.5, 3.2 * HV); } });
  // the window band at the widest line: near-black, edged with slate pinstripes and a bright lip above
  { const r0 = (m) => arcAtD(m, secAt(m).r0 - 0.05), r1 = (m) => arcAtD(m, secAt(m).r1 + 0.05);
    band(g, r0, r1, 0.5, 199.5, HULL_PAINT.band); band(h, r0, r1, 0.5, 199.5, 'rgb(130,130,130)');
    line(g, (m) => arcAtD(m, secAt(m).r0 - 0.5), 1, 199.5, 0.32, HULL_PAINT.slate); line(g, (m) => arcAtD(m, secAt(m).r1 + 0.5), 1, 199.5, 0.32, HULL_PAINT.slate);
    line(g, (m) => arcAtD(m, secAt(m).r0 - 0.85), 1, 199.5, 0.14, 'rgba(210,218,220,0.35)'); }
  // dark sensor strips on the shoulders of the upper hull, the lower sensor array under the bow, the ventral array aft
  { const sh = (k) => (m) => { const S = secAt(m); return arcAtX(S, S.w * k, true); };
    line(g, sh(0.62), 36, 116, 0.7, HULL_PAINT.dark); line(h, sh(0.62), 36, 116, 0.7, 'rgb(120,120,120)'); line(g, sh(0.62), 37, 115, 0.16, 'rgba(111,182,230,0.35)'); line(ge, sh(0.62), 37, 115, 0.16, 'rgba(70,120,160,0.5)');
    line(g, (m) => arcAtD(m, Math.min(secAt(m).b - 0.3, 21.4)), 13, 30, 1.1, HULL_PAINT.dark);
    line(g, (m) => arcAtX(secAt(m), 0.8, false), 102, 116.5, 1.8, HULL_PAINT.dark); line(h, (m) => arcAtX(secAt(m), 0.8, false), 102, 116.5, 1.8, 'rgb(110,110,110)'); }
  // windows: a black band per deck wherever a lived-in or command compartment meets a steep enough stretch of hull side.
  // A deck with a floor plan (SHIPGEO.plans) is skipped: its rooms say where they meet the hull (Deck 3's stop short of
  // the rim, which is service space), so its windows come from the plan in exterior stage 3.
  G.rooms.forEach((rooms, i) => {
    const n = i + 1, dc = 3.5 * (n - 1) + 1.7; if (n < 3 || (G.plans && G.plans[n])) return;
    rooms.forEach(([a, b, name, , kind]) => {
      if (/^Docking/.test(name)) return; // the docking ports' hardware stands there
      const lit = kind === 'l' || kind === 'w' ? 0.82 : kind === 's' ? 0.3 : -1; if (lit < 0) return;
      const row = [];
      for (let m = a + 1.2; m <= b - 1.0; m += 2.2) { const S = secAt(m), hh = hullAtDepth(S, dc); if (!hh || Math.abs(hh.ny) > 0.62 || dc < S.t + 1 || dc > S.b - 1.2) continue;
        // skip where the hull side runs steeply across the ship (the saucer's forward rim): the atlas's squares shear into diamonds there
        const h0 = hullAtDepth(secAt(m - 1), dc), h1 = hullAtDepth(secAt(m + 1), dc); if (!h0 || !h1 || Math.abs(h1.x - h0.x) / 2 > 0.35) continue;
        row.push([m, hh.arc]); }
      if (!row.length) return;
      const f = (m) => { let best = null, bd = 9; row.forEach(([mm, arc]) => { if (Math.abs(mm - m) < bd) { bd = Math.abs(mm - m); best = arc; } }); return best; };
      band(g, (m) => { const q = f(m); return q == null ? null : q - 0.75; }, (m) => { const q = f(m); return q == null ? null : q + 0.75; }, row[0][0] - 1, row[row.length - 1][0] + 1, 'rgba(22,26,28,0.88)');
      row.forEach(([m, arc]) => { const w2 = 0.75 * HU, h2 = 0.9 * HV, x = hx(m) - w2 / 2, y = hy(arc) - h2 / 2; g.fillStyle = HULL_PAINT.glass; g.fillRect(x, y, w2, h2);
        h.fillStyle = 'rgb(95,95,95)'; h.fillRect(x, y, w2, h2);
        if (rnd() < lit) { const c = rnd(); ge.fillStyle = c < 0.12 ? '#B89468' : c < 0.22 ? HULL_PAINT.cool : HULL_PAINT.window; ge.fillRect(x, y, w2, h2); g.fillStyle = 'rgba(255,200,140,0.3)'; g.fillRect(x, y, w2, h2); } });
    });
  });
  // phaser arcs: long continuous strips sweeping round the saucer's top and bottom (bow to aft shoulder, meeting across
  // the bow), and a strip along each upper flank of the engineering body. Dark mount, copper emitter, segment ticks.
  { const phaser = (f, m0, m1) => { line(g, f, m0, m1, 1.15, '#353C3F'); line(h, f, m0, m1, 1.15, 'rgb(205,205,205)');
      line(g, f, m0, m1, 0.5, '#6A4232'); line(g, f, m0 + 0.2, m1, 0.12, 'rgba(255,190,140,0.28)');
      for (let m = m0 + 0.75; m < m1; m += 1.5) { const a = f(m); if (a == null) continue; g.fillStyle = 'rgba(16,18,19,0.75)'; g.fillRect(hx(m), hy(a) - 0.3 * HV, 1.1 * lw + 0.08 * HU, 0.6 * HV); } };
    const sauc = (k, upper) => (m) => { const S = secAt(m); return arcAtX(S, Math.min(S.w, SAU.W) * k, upper); };
    phaser(sauc(0.7, true), 3, 104); phaser(sauc(0.7, false), 3, 104);
    phaser((m) => { const S = secAt(m); return arcAtX(S, S.w * 0.72, true); }, 132, 184); }
  // escape pods: 40 (140 crew, 3 to 4 a pod), 20 a side, in rows by deck beside the crew and officers' quarters:
  // [deck's room from m, to m, depth of the row on the hull, pods a side]. Square hatches, dark frame, oxide-red rim.
  { const PODS = [[30, 46, 10.0, 3], [84, 100, 10.0, 5], [140, 150, 12.8, 2], [34, 52, 11.0, 3], [72.5, 96, 17.0, 4], [72.5, 90, 20.5, 3]];
    let n = 0; const sz = 1.5;
    PODS.forEach(([a, b, d, k]) => { for (let i = 0; i < k; i++) { const m = a + 1.5 + (b - a - 3) * (k === 1 ? 0.5 : i / (k - 1)), arc = arcAtD(m, d); if (arc == null) continue; n++;
      const x = hx(m) - sz / 2 * HU, y = hy(arc) - sz / 2 * HV, w = sz * HU, hh = sz * HV;
      g.fillStyle = '#23292C'; g.fillRect(x - 0.12 * HU, y - 0.12 * HV, w + 0.24 * HU, hh + 0.24 * HV);
      g.fillStyle = '#5A2C26'; g.fillRect(x, y, w, hh); g.fillStyle = '#868D90'; g.fillRect(x + 0.1 * HU, y + 0.1 * HV, w - 0.2 * HU, hh - 0.2 * HV);
      g.fillStyle = '#2A3033'; g.fillRect(x + 0.45 * HU, y + 0.62 * HV, w - 0.9 * HU, 0.26 * HV);
      h.fillStyle = 'rgb(205,205,205)'; h.fillRect(x, y, w, hh); h.fillStyle = 'rgb(150,150,150)'; h.fillRect(x - 0.12 * HU, y - 0.12 * HV, w + 0.24 * HU, 0.12 * HV); } });
    podCount = n; }
  // lateral sensor strips low on the engineering body's flanks (Deck 8), dark with blue glints
  { const f = (m) => arcAtD(m, 27.2); line(g, f, 104, 128, 0.8, HULL_PAINT.dark); line(h, f, 104, 128, 0.8, 'rgb(120,120,120)');
    for (let m = 104.6; m < 127.6; m += 0.9) { const a = f(m); if (a == null) continue; g.fillStyle = 'rgba(111,182,230,0.35)'; g.fillRect(hx(m), hy(a) - 0.12 * HV, 0.35 * HU, 0.24 * HV); ge.fillStyle = 'rgba(70,130,180,0.7)'; ge.fillRect(hx(m), hy(a) - 0.12 * HV, 0.35 * HU, 0.24 * HV); } }
  // the fighter hangar's launch doors in the saucer's belly (Deck 6): two a side, each split down the middle, with a
  // dark recessed frame and oxide caution bars at both ends
  HANGAR.forEach(([a, b]) => { for (let m = a; m < b; m += 0.25) { const S = secAt(m + 0.125), y0 = arcAtX(S, HX[1], false), y1 = arcAtX(S, HX[0], false); if (y0 == null || y1 == null) continue;
    const yi0 = arcAtX(S, HX[1] - 0.3, false), yi1 = arcAtX(S, HX[0] + 0.3, false), ym = arcAtX(S, (HX[0] + HX[1]) / 2, false), inner = m > a + 0.3 && m < b - 0.55, x = hx(m), w = 0.25 * HU + 0.5;
    g.fillStyle = HULL_PAINT.band; g.fillRect(x, hy(y0), w, hy(y1) - hy(y0)); h.fillStyle = 'rgb(120,120,120)'; h.fillRect(x, hy(y0), w, hy(y1) - hy(y0));
    if (!inner) continue;
    const ends = m < a + 1.0 || m > b - 1.25;
    g.fillStyle = ends ? HULL_PAINT.oxide : '#5E6668'; g.fillRect(x, hy(yi0), w, hy(yi1) - hy(yi0)); h.fillStyle = 'rgb(170,170,170)'; h.fillRect(x, hy(yi0), w, hy(yi1) - hy(yi0));
    if (ends) { g.fillStyle = '#8E9496'; for (let k = 0; k < 7; k++) { const q0 = yi0 + (yi1 - yi0) * (k / 7 + ((m * 2) % 1) * 0.07); g.fillRect(x, hy(q0), w, (hy(yi1) - hy(yi0)) / 14); } }
    g.fillStyle = HULL_PAINT.band; g.fillRect(x, hy(ym) - 0.06 * HV, w, 0.12 * HV); h.fillStyle = 'rgb(110,110,110)'; h.fillRect(x, hy(ym) - 0.06 * HV, w, 0.12 * HV); } });
  grainOver(R.hull, lite ? 0.18 : 0.25);

  // spine region: u = m - 50, v = arc from the starboard base over the top to the port base
  const SU = R.spine[2] / 54, SV = R.spine[3] / SVMAX, sx = (m) => R.spine[0] + (m - 49) * SU, sy = (arc) => R.spine[1] + arc * SV;
  panels(R.spine, SU, SV, 9, 1.4, { red: 0.008 }); streaks(R.spine, SU, SV, 80);
  const spineArc = (m, test) => { const r = spineRing(m); for (let i = 1; i < r.length; i++) { const f = test(r[i - 1], r[i]); if (f != null) return r[i - 1][2] + f * (r[i][2] - r[i - 1][2]); } return null; };
  const sideArc = (m, d, sd) => spineArc(m, (p, q) => (sd > 0 ? p[0] > 1.5 && q[0] > 1.5 && p[0] < 12 : p[0] < -1.5 && q[0] < -1.5 && p[0] > -12) && (d - p[1]) * (d - q[1]) <= 0 && p[1] !== q[1] ? (d - p[1]) / (q[1] - p[1]) : null);
  const topArc = (m, x) => spineArc(m, (p, q) => (x - p[0]) * (x - q[0]) <= 0 && p[0] !== q[0] ? (x - p[0]) / (q[0] - p[0]) : null);
  // pinstripes along the spine's top edges and a dark skirt at its foot
  [0.3, 0.7].forEach((k) => { g.beginPath(); SR.forEach((s, i) => { const a = s.r[Math.round((s.r.length - 1) * k)][2]; g[i ? 'lineTo' : 'moveTo'](sx(s.m), sy(a)); }); g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 0.28 * SV; g.stroke(); });
  [1, -1].forEach((sd) => { g.beginPath(); let first = true; SR.forEach((s) => { const a = sideArc(s.m, HT(s.m) - 0.6, sd); if (a != null) { g[first ? 'moveTo' : 'lineTo'](sx(s.m), sy(a)); first = false; } }); g.strokeStyle = HULL_PAINT.band; g.lineWidth = 0.9 * SV; g.stroke(); });
  // the long-range sensor pallet on the spine's sloping front
  { g.fillStyle = HULL_PAINT.band; g.fillRect(sx(50.6), R.spine[1], (54.4 - 50.6) * SU, R.spine[3]); ge.fillStyle = 'rgba(60,110,150,0.6)'; for (let m = 51.0; m < 54.2; m += 0.9) { g.fillStyle = HULL_PAINT.slate; g.fillRect(sx(m), R.spine[1], 0.12 * SU, R.spine[3]); ge.fillRect(sx(m + 0.4), R.spine[1], 0.08 * SU, R.spine[3]); } }
  // Deck 2's real viewports, lit: first officer to port; senior officers' cabins and the wardroom to starboard; the lounge aft
  const spineWin = (m0, m1, d0, d1, sd) => { for (let m = m0; m < m1; m += 0.25) { const a = sideArc(m + 0.125, d0, sd), b = sideArc(m + 0.125, d1, sd); if (a == null || b == null) continue;
    const y = Math.min(a, b), hh = Math.abs(b - a); g.fillStyle = HULL_PAINT.glass; g.fillRect(sx(m), sy(y), 0.25 * SU + 0.5, hh * SV); ge.fillStyle = HULL_PAINT.window; ge.fillRect(sx(m), sy(y), 0.25 * SU + 0.5, hh * SV); } };
  spineWin(73.4, 75.8, 4.8, 6.1, -1); spineWin(69.3, 71.5, 4.8, 6.1, 1); spineWin(75.7, 77.9, 4.8, 6.1, 1); spineWin(82.55, 87.05, 4.75, 6.05, 1);
  for (let m = 96; m < 102; m += 0.1) { const d = SP(m); if (d < 4.65 || d > 6.25) continue; const a = topArc(m, 5.0), b = topArc(m, -5.0); if (a == null || b == null) continue;
    g.fillStyle = HULL_PAINT.glass; g.fillRect(sx(m), sy(Math.min(a, b)), 0.1 * SU + 0.5, Math.abs(b - a) * SV); ge.fillStyle = HULL_PAINT.window; ge.fillRect(sx(m), sy(Math.min(a, b)), 0.1 * SU + 0.5, Math.abs(b - a) * SV); }
  grainOver(R.spine, 0.25);

  // nacelle region: u = metres from the cap, v = round the nacelle from the bottom (0.25 inboard, 0.5 top, 0.75 outboard)
  { const r = R.nac, U = r[2] / NL0, V = r[3], per = 2 * Math.PI * 3.6 * (1 + N.w) / 2, nx = (p) => r[0] + p * U, ny = (v) => r[1] + v * V;
    panels(r, U, V / per, 12, 2.0, { red: 0.006 }); streaks(r, U, V / per, 120);
    // the cap: a ribbed red-orange collector behind a dark collar
    g.fillStyle = '#6A2A1A'; g.fillRect(nx(0), r[1], 5.2 * U, V); { const gr = ge.createLinearGradient(nx(0), 0, nx(5), 0); gr.addColorStop(0, '#E8743A'); gr.addColorStop(0.6, '#B83C18'); gr.addColorStop(1, '#5A1808'); ge.fillStyle = gr; ge.fillRect(nx(0), r[1], 5 * U, V); } 
    g.fillStyle = 'rgba(60,20,12,0.6)'; ge.fillStyle = 'rgba(0,0,0,0.35)'; for (let v = 0; v < 1; v += 1 / 24) { g.fillRect(nx(0), ny(v), 5 * U, 0.008 * V); ge.fillRect(nx(0), ny(v), 5 * U, 0.008 * V); }
    g.fillStyle = HULL_PAINT.band; g.fillRect(nx(5.2), r[1], 1.2 * U, V); h.fillStyle = 'rgb(110,110,110)'; h.fillRect(nx(5.2), r[1], 1.2 * U, V);
    g.fillStyle = HULL_PAINT.dark; g.fillRect(nx(NL0 - 11), r[1], 11 * U, V); g.fillStyle = HULL_PAINT.band; for (let p = NL0 - 9; p < NL0 - 1; p += 1.6) g.fillRect(nx(p), r[1], 0.5 * U, V);
    // the ridge along the top: a dark spine with a slate edge
    g.fillStyle = HULL_PAINT.dark; g.fillRect(nx(6.4), ny(0.5 - 0.02), (NL0 - 18) * U, 0.04 * V); g.fillStyle = HULL_PAINT.slate; g.fillRect(nx(6.4), ny(0.5 - 0.003), (NL0 - 18) * U, 0.006 * V);
    // the long blue grille down the inboard channel, slatted, framed in slate
    const g0 = 0.25 - 0.075, gh = 0.15, p0 = 9, p1 = NL0 - 16;
    g.fillStyle = '#20303C'; g.fillRect(nx(p0 - 0.6), ny(g0 - 0.012), (p1 - p0 + 1.2) * U, (gh + 0.024) * V); ge.fillStyle = HULL_PAINT.grille; ge.fillRect(nx(p0), ny(g0), (p1 - p0) * U, gh * V);
    g.fillStyle = 'rgba(60,120,180,0.35)'; g.fillRect(nx(p0), ny(g0), (p1 - p0) * U, gh * V);
    g.fillStyle = 'rgba(14,22,30,0.6)'; ge.fillStyle = 'rgba(0,0,0,0.5)'; for (let p = p0; p < p1; p += 0.7) { g.fillRect(nx(p), ny(g0), 0.16 * U, gh * V); ge.fillRect(nx(p), ny(g0), 0.16 * U, gh * V); }
    for (let k = 1; k < 4; k++) { ge.fillRect(nx(p0), ny(g0 + gh * k / 4), (p1 - p0) * U, 0.005 * V); }
    g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 3 * lw; g.strokeRect(nx(p0 - 0.6), ny(g0 - 0.012), (p1 - p0 + 1.2) * U, (gh + 0.024) * V);
    h.fillStyle = 'rgb(90,90,90)'; h.fillRect(nx(p0 - 0.6), ny(g0 - 0.012), (p1 - p0 + 1.2) * U, (gh + 0.024) * V);
    // a dark panel run down the outboard face, and a thin glowing line along the lower inboard edge
    g.fillStyle = HULL_PAINT.dark; g.fillRect(nx(14), ny(0.6), (NL0 - 34) * U, 0.05 * V); g.fillStyle = HULL_PAINT.slate; g.fillRect(nx(14), ny(0.65), (NL0 - 34) * U, 0.006 * V);
    ge.fillStyle = 'rgba(90,150,200,0.7)'; ge.fillRect(nx(p0), ny(0.12), (p1 - p0) * U, 0.006 * V);
    grainOver(r, 0.25); }
  // arch rails: u along the rail, v round it (0 outboard, 0.25 outer edge, 0.5 inboard face, 0.75 underside)
  { const r = R.arch; panels(r, r[2] / 70, r[3] / 12, 8, 1.6);
    g.fillStyle = HULL_PAINT.dark; g.fillRect(r[0], r[1] + 0.38 * r[3], r[2], 0.24 * r[3]); g.fillStyle = HULL_PAINT.band; g.fillRect(r[0], r[1] + 0.62 * r[3], r[2], 0.26 * r[3]);
    ge.fillStyle = 'rgba(70,120,160,0.55)'; ge.fillRect(r[0] + r[2] * 0.1, r[1] + 0.497 * r[3], r[2] * 0.8, 0.008 * r[3]);
    g.fillStyle = HULL_PAINT.slate; g.fillRect(r[0], r[1] + 0.24 * r[3], r[2], 0.02 * r[3]); g.fillStyle = HULL_PAINT.oxide; g.fillRect(r[0] + r[2] * 0.47, r[1] + 0.2 * r[3], r[2] * 0.06, 0.1 * r[3]);
    grainOver(r, 0.25); }
  // the weapons pod: u nose to tail, v round it (0 starboard, 0.25 top, 0.5 port, 0.75 underside): a dark dorsal strip,
  // glowing targeting strips along both flanks, magazine hatches on top, darker underside
  { const r = R.spar, px = (q) => r[0] + q * r[2], py = (v) => r[1] + v * r[3];
    panels(r, r[2] / 38, r[3] / 30, 6, 1.3, { red: 0.02 }); streaks(r, r[2] / 38, r[3] / 30, 50);
    g.fillStyle = HULL_PAINT.dark; g.fillRect(px(0.08), py(0.23), r[2] * 0.84, 0.04 * r[3]); g.fillStyle = HULL_PAINT.slate; g.fillRect(px(0.08), py(0.249), r[2] * 0.84, 0.004 * r[3]);
    g.fillStyle = HULL_PAINT.band; g.fillRect(px(0), py(0.62), r[2], 0.26 * r[3]);
    [0, 0.5].forEach((v) => { g.fillStyle = HULL_PAINT.band; g.fillRect(px(0.14), py(v ? v - 0.012 : 0.988), r[2] * 0.72, 0.024 * r[3]); g.fillRect(px(0.14), py(v), r[2] * 0.72, 0.012 * r[3]);
      ge.fillStyle = 'rgba(90,160,220,0.85)'; ge.fillRect(px(0.15), py(v ? v - 0.005 : 0.995), r[2] * 0.7, 0.01 * r[3]); ge.fillRect(px(0.15), py(v), r[2] * 0.7, 0.005 * r[3]); });
    // phaser strips along both upper shoulders, in the saucer arcs' colours (1.15 m mount, copper emitter, segment ticks)
    [0.15, 0.35].forEach((v) => { const mw = 1.15 / 30, ew = 0.5 / 30;
      g.fillStyle = '#353C3F'; g.fillRect(px(0.1), py(v - mw / 2), r[2] * 0.8, mw * r[3]); h.fillStyle = 'rgb(205,205,205)'; h.fillRect(px(0.1), py(v - mw / 2), r[2] * 0.8, mw * r[3]);
      g.fillStyle = '#6A4232'; g.fillRect(px(0.1), py(v - ew / 2), r[2] * 0.8, ew * r[3]); g.fillStyle = 'rgba(255,190,140,0.28)'; g.fillRect(px(0.105), py(v - 0.002), r[2] * 0.79, 0.004 * r[3]);
      g.fillStyle = 'rgba(16,18,19,0.75)'; for (let q = 0.12; q < 0.9; q += 1.5 / 38) g.fillRect(px(q), py(v - 0.3 / 30), Math.max(1.5, 0.08 / 38 * r[2]), 0.6 / 30 * r[3]); });
    for (let k = 0; k < 6; k++) { const x = px(0.22 + k * 0.1), y = py(0.235); g.fillStyle = HULL_PAINT.slate; g.fillRect(x, y - 0.03 * r[3], 0.06 * r[2], 0.03 * r[3]); g.fillStyle = HULL_PAINT.oxide; g.fillRect(x, y - 0.034 * r[3], 0.06 * r[2], 0.004 * r[3]); h.fillStyle = 'rgb(130,130,130)'; h.fillRect(x, y - 0.03 * r[3], 0.06 * r[2], 0.03 * r[3]); }
    grainOver(r, 0.25); }
  // the nacelle pylons: u root to tip, v round them
  { const r = R.turret; panels(r, r[2] / 30, r[3] / 8, 6, 1.4); g.fillStyle = HULL_PAINT.slate; g.fillRect(r[0], r[1] + 0.495 * r[3], r[2], 0.012 * r[3]); g.fillRect(r[0], r[1], r[2], 0.012 * r[3]);
    g.fillStyle = HULL_PAINT.dark; g.fillRect(r[0] + r[2] * 0.88, r[1], r[2] * 0.12, r[3]); g.fillStyle = HULL_PAINT.band; g.fillRect(r[0], r[1] + 0.72 * r[3], r[2] * 0.88, 0.05 * r[3]); grainOver(r, 0.25); }
  // launcher muzzles: an armoured frame round a recessed tube glowing red-orange
  { const r = R.launch, cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2;
    g.fillStyle = HULL_PAINT.dark; g.fillRect(...r); g.fillStyle = HULL_PAINT.band; g.fillRect(r[0] + r[2] * 0.1, r[1] + r[3] * 0.14, r[2] * 0.8, r[3] * 0.72);
    g.fillStyle = '#4A1A10'; g.fillRect(r[0] + r[2] * 0.2, r[1] + r[3] * 0.3, r[2] * 0.6, r[3] * 0.4); g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 3; g.strokeRect(r[0] + r[2] * 0.1, r[1] + r[3] * 0.14, r[2] * 0.8, r[3] * 0.72);
    const gr = ge.createRadialGradient(cx, cy, 0, cx, cy, r[2] * 0.34); gr.addColorStop(0, '#FFD0A0'); gr.addColorStop(0.35, '#F06A2C'); gr.addColorStop(1, '#5A1206');
    ge.fillStyle = gr; ge.fillRect(r[0] + r[2] * 0.2, r[1] + r[3] * 0.3, r[2] * 0.6, r[3] * 0.4);
    h.fillStyle = 'rgb(60,60,60)'; h.fillRect(r[0] + r[2] * 0.2, r[1] + r[3] * 0.3, r[2] * 0.6, r[3] * 0.4); }
  // the stern: shuttlebay doors low, impulse vents high
  { const r = R.stern, sx2 = (x) => r[0] + (0.5 + x / 24) * r[2], sy2 = (d) => r[1] + (d - 15) / 18 * r[3];
    panels(r, r[2] / 24, r[3] / 18, 5, 1.4);
    // a dark skirt round the bay's frame (the opening and its clamshell doors are geometry)
    g.fillStyle = HULL_PAINT.band; { const o = BAY.frame + 0.35; g.beginPath(); openOut(o).forEach(([x, d], i) => g[i ? 'lineTo' : 'moveTo'](sx2(x), sy2(d))); g.closePath(); g.fill(); }
    g.lineWidth = 3; g.strokeStyle = HULL_PAINT.slate;
    [-1, 1].forEach((sd) => { const x0 = sx2(sd < 0 ? -7.4 : 0.9), w2 = 6.5 / 24 * r[2], y = sy2(17.8), h2 = 1.8 / 18 * r[3];
      g.fillStyle = '#5A2C25'; g.fillRect(x0, y, w2, h2); ge.fillStyle = HULL_PAINT.impulse; ge.fillRect(x0, y, w2, h2); ge.fillStyle = 'rgba(0,0,0,0.4)'; for (let k = 1; k < 8; k++) ge.fillRect(x0 + w2 * k / 8, y, 2, h2);
      g.strokeStyle = HULL_PAINT.slate; g.strokeRect(x0, y, w2, h2); }); }
  // thruster blocks: oxide red with dark vent slots
  { const r = R.rcs; g.fillStyle = HULL_PAINT.oxide; g.fillRect(...r); g.fillStyle = HULL_PAINT.band; for (let k = 0; k < 6; k++) g.fillRect(r[0] + r[2] * (0.15 + k * 0.12), r[1] + r[3] * 0.3, r[2] * 0.06, r[3] * 0.4);
    g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 3; g.strokeRect(r[0] + 3, r[1] + 3, r[2] - 6, r[3] - 6); }
  // solid cells for small parts, with their glow
  { const cols = ['#80878A', HULL_PAINT.dark, HULL_PAINT.slate, HULL_PAINT.glass, '#2E4A5E', '#5A2C25', '#20303C', '#A9563A', '#6E7578', '#3A4044', '#2A2F33', '#FFFFFF', '#1C2830', HULL_PAINT.oxide, '#34505E', '#9AA2A4'];
    const glow = { 4: HULL_PAINT.deflector, 5: HULL_PAINT.impulse, 6: HULL_PAINT.grille, 7: HULL_PAINT.cap, 11: '#FFFFFF', 12: '#1E3C52', 14: '#3E7096' }, c = R.cells, s = c[2] / 4;
    cols.forEach((col, k) => { const x = c[0] + (k % 4) * s, y = c[1] + ((k / 4) | 0) * s; g.fillStyle = col; g.fillRect(x, y, s, s); if (glow[k]) { ge.fillStyle = glow[k]; ge.fillRect(x, y, s, s); } }); }

  // the clamshell doors (u across the beam, x -8..8 m; v down the stern, the opening plus 0.4 m): plates, ribs, a dark
  // rim, oxide-and-pale caution bars along the meeting edge with the bay's light leaking through the seam
  const DOOR_D0 = BAY.dA - 0.4, DOOR_DH = BAY.dB - BAY.dA + 0.8, doorUV = (x, d) => ruv(R.door, 0.5 + x / 16, (d - DOOR_D0) / DOOR_DH);
  { const r = R.door, ux = (x) => r[0] + (0.5 + x / 16) * r[2], vy = (d) => r[1] + (d - DOOR_D0) / DOOR_DH * r[3];
    panels(r, r[2] / 16, r[3] / DOOR_DH, 3.2, 0.9, { red: 0 }); streaks(r, r[2] / 16, r[3] / DOOR_DH, 30);
    g.fillStyle = HULL_PAINT.slate; h.fillStyle = 'rgb(140,140,140)';
    for (let d = BAY.dA + 0.5; d < BAY.dB - 0.3; d += 0.85) { if (Math.abs(d - BAY.dM) < 0.6) continue; g.fillRect(r[0], vy(d) - 2, r[2], 4); h.fillRect(r[0], vy(d) - 3, r[2], 6); }
    for (let x = -8, k = 0; x < 8; x += 0.7, k++) { g.fillStyle = k % 2 ? HULL_PAINT.oxide : '#8E9496'; g.fillRect(ux(x), vy(BAY.dM - 0.42), 0.7 / 16 * r[2] + 1, vy(BAY.dM + 0.42) - vy(BAY.dM - 0.42)); }
    g.fillStyle = HULL_PAINT.band; g.fillRect(r[0], vy(BAY.dM) - 4, r[2], 8); h.fillStyle = 'rgb(90,90,90)'; h.fillRect(r[0], vy(BAY.dM) - 4, r[2], 8);
    ge.fillStyle = 'rgba(255,214,160,0.6)'; ge.fillRect(r[0], vy(BAY.dM) - 1.5, r[2], 3);
    // each leaf's rim follows the opening's outline 0.28 m out
    g.strokeStyle = HULL_PAINT.band; g.lineWidth = 0.3 / 16 * r[2]; [[DOOR_D0 + 0.15, BAY.dM - 0.02], [BAY.dM + 0.02, BAY.dB + 0.25]].forEach(([a, b]) => {
      g.beginPath(); for (let d = a; d <= b + 1e-6; d += 0.25) { const dd = Math.min(Math.max(d, BAY.dA), BAY.dB); g[d === a ? 'moveTo' : 'lineTo'](ux(owAt(dd) + 0.12), vy(d)); }
      for (let d = b; d >= a - 1e-6; d -= 0.25) { const dd = Math.min(Math.max(d, BAY.dA), BAY.dB); g.lineTo(ux(-owAt(dd) - 0.12), vy(d)); } g.closePath(); g.stroke(); });
    grainOver(r, 0.25); }
  // docking hatches: a striped outer ring round a hatch with an iris of six leaves and a faint amber ring light
  { const r = R.dock, cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2, R0 = r[2] / 2, P2 = Math.PI * 2;
    g.fillStyle = HULL_PAINT.dark; g.fillRect(...r); h.fillStyle = 'rgb(200,200,200)'; h.fillRect(...r);
    for (let k = 0; k < 16; k++) { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R0, k / 16 * P2, (k + 1) / 16 * P2); g.closePath(); g.fillStyle = k % 2 ? HULL_PAINT.oxide : '#8E9496'; g.fill(); }
    g.beginPath(); g.arc(cx, cy, R0 * 0.86, 0, P2); g.fillStyle = HULL_PAINT.dark; g.fill();
    g.beginPath(); g.arc(cx, cy, R0 * 0.64, 0, P2); g.fillStyle = '#596164'; g.fill(); h.beginPath(); h.arc(cx, cy, R0 * 0.64, 0, P2); h.fillStyle = 'rgb(150,150,150)'; h.fill();
    g.strokeStyle = HULL_PAINT.band; g.lineWidth = 3; for (let k = 0; k < 6; k++) { const a = k / 6 * P2; g.beginPath(); g.moveTo(cx + Math.cos(a) * R0 * 0.1, cy + Math.sin(a) * R0 * 0.1);
      g.quadraticCurveTo(cx + Math.cos(a + 0.6) * R0 * 0.42, cy + Math.sin(a + 0.6) * R0 * 0.42, cx + Math.cos(a + 1.1) * R0 * 0.62, cy + Math.sin(a + 1.1) * R0 * 0.62); g.stroke(); }
    g.beginPath(); g.arc(cx, cy, R0 * 0.1, 0, P2); g.fillStyle = HULL_PAINT.slate; g.fill();
    ge.strokeStyle = 'rgba(255,170,90,0.55)'; ge.lineWidth = 3; ge.beginPath(); ge.arc(cx, cy, R0 * 0.6, 0, P2); ge.stroke(); }
  // sensor pallets: a dark plate in a slate frame with rows of faintly lit slots
  { const r = R.sensor; g.fillStyle = '#2A3034'; g.fillRect(...r); h.fillStyle = 'rgb(160,160,160)'; h.fillRect(...r); g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 6; g.strokeRect(r[0] + 4, r[1] + 4, r[2] - 8, r[3] - 8);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const x = r[0] + r[2] * (0.1 + i * 0.135), y = r[1] + r[3] * (0.14 + j * 0.2);
      g.fillStyle = '#1A2228'; g.fillRect(x, y, r[2] * 0.1, r[3] * 0.12); h.fillStyle = 'rgb(110,110,110)'; h.fillRect(x, y, r[2] * 0.1, r[3] * 0.12);
      ge.fillStyle = 'rgba(80,150,200,0.55)'; ge.fillRect(x + 2, y + r[3] * 0.04, r[2] * 0.1 - 4, r[3] * 0.04); } }

  // relief: the height canvas goes into the colour atlas's alpha (0.55..1, so nothing on the ship is cut away)
  { const ci = g.getImageData(0, 0, cw, chh), hi = h.getImageData(0, 0, cw, chh), c = ci.data, hd = hi.data;
    for (let i = 3; i < c.length; i += 4) c[i] = 140 + (hd[i - 1] * 115 / 255 | 0);
    g.putImageData(ci, 0, 0); }
  // cut-outs drawn after the relief: the deflector dish (glowing rings, transparent round it) and the lettering
  { const r = R.defl, cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2, rr = r[2] / 2 - 4;
    g.clearRect(...r); g.save(); g.translate(cx, cy); g.beginPath(); g.arc(0, 0, rr, 0, Math.PI * 2); g.fillStyle = '#22313B'; g.fill();
    for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(0, 0, rr * (0.92 - k * 0.17), 0, Math.PI * 2); g.strokeStyle = k % 2 ? '#3A5566' : '#5A7C90'; g.lineWidth = rr * 0.05; g.stroke(); } g.restore();
    ge.save(); ge.translate(cx, cy); const gr = ge.createRadialGradient(0, 0, 0, 0, 0, rr); gr.addColorStop(0, '#D8F0FF'); gr.addColorStop(0.35, HULL_PAINT.deflector); gr.addColorStop(0.8, '#244860'); gr.addColorStop(1, '#0A1620');
    ge.fillStyle = gr; ge.beginPath(); ge.arc(0, 0, rr, 0, Math.PI * 2); ge.fill(); ge.restore(); }
  const map = tex(C), emap = tex(E);
  [map, emap].forEach((t) => { t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; });
  // the upper door leaf's registry box, kept clean so a second font can be drawn over it
  const DREG = (() => { const r = R.door, ux = (x) => r[0] + (0.5 + x / 16) * r[2], vy = (d) => r[1] + (d - DOOR_D0) / DOOR_DH * r[3];
    return [ux(-3.4), vy(BAY.dA + 0.55), ux(3.4) - ux(-3.4), vy(BAY.dM - 0.75) - vy(BAY.dA + 0.55)]; })();
  const dregClean = g.getImageData(...DREG.map((v) => Math.round(v * K)));
  function letter(font) {
    const write = (r, txt, col, sp, clear) => {
      if (clear) g.clearRect(r[0], r[1], r[2], r[3]); g.save(); g.fillStyle = col; g.font = `600 100px ${font}`; g.textBaseline = 'alphabetic';
      const wd = g.measureText(txt).width + sp * (txt.length - 1), capH = 0.78 * r[3], k = capH / 88, sxk = Math.min(1, (r[2] * 0.94) / (wd * k));
      g.translate(r[0] + r[2] / 2, r[1] + r[3] / 2 + capH / 2); g.scale(k * sxk, k); let x = -wd / 2;
      for (const ch of txt) { g.fillText(ch, x, 0); x += g.measureText(ch).width + sp; }
      g.restore(); };
    [[R.name, 'USS DEFIANCE'], [R.reg, 'EV-0408']].forEach(([r, txt]) => write(r, txt, HULL_PAINT.letter, 9, true));
    Object.values(MK).forEach(({ r, txt }) => write(r, txt, '#BCC4C6', 6, true));
    g.putImageData(dregClean, Math.round(DREG[0] * K), Math.round(DREG[1] * K)); write(DREG, 'EV-0408', HULL_PAINT.letter, 9, false);
    map.needsUpdate = true;
  }
  letter(DISP);
  if (typeof FontFace !== 'undefined') new FontFace('AntonioHull', 'url(fonts/antonio-600.woff)', { weight: '600' }).load().then((f) => { document.fonts.add(f); letter('AntonioHull'); }).catch(() => {});

  // ---------- assemble ----------
  function merge(list) {
    let nv = 0; const pos = [], nor = [], uvs = [], idx = [];
    list.forEach((q) => { const p = q.attributes.position, n = q.attributes.normal, u = q.attributes.uv;
      for (let k = 0; k < p.count; k++) { pos.push(p.getX(k), p.getY(k), p.getZ(k)); nor.push(n.getX(k), n.getY(k), n.getZ(k)); uvs.push(u.getX(k), u.getY(k)); }
      const ix = q.index.array; for (let k = 0; k < ix.length; k++) idx.push(ix[k] + nv); nv += p.count; q.dispose(); });
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g2.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g2.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g2.setIndex(nv > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1)); g2.computeBoundingSphere(); return g2;
  }
  const shipGeo = merge(parts), letterGeo = merge(decals), sun = (opts.sun || HULL_SUN).clone().normalize();

  // the sun's shadow: the ship's depth seen from the sun, rendered once (the ship and the sun never move relative to each other)
  const shadow = (() => {
    if (typeof renderer === 'undefined' || !renderer || opts.noShadow) return null;
    const size = lite ? 1024 : 2048, bs = shipGeo.boundingSphere, Rr = bs.radius * 1.01;
    const rt = new THREE.WebGLRenderTarget(size, size); rt.depthTexture = new THREE.DepthTexture(size, size); rt.depthTexture.type = THREE.UnsignedIntType;
    const cam = new THREE.OrthographicCamera(-Rr, Rr, Rr, -Rr, 1, Rr * 4); cam.position.copy(bs.center).addScaledVector(sun, Rr * 2); cam.lookAt(bs.center); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const sc = new THREE.Scene(); sc.add(new THREE.Mesh(shipGeo, new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide })));
    const prev = renderer.getRenderTarget(); renderer.setRenderTarget(rt); renderer.clear(); renderer.render(sc, cam); renderer.setRenderTarget(prev);
    const mtx = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(cam.projectionMatrix).multiply(cam.matrixWorldInverse);
    return { tex: rt.depthTexture, mtx, texel: 1 / size, range: Rr * 3 };
  })();

  // warm floodlights on the hull (Deck 2 frame): position, aim point
  const FL = [
    [[0, Y(HT(50)) + 1.2, Z(51)], [0, Y(HT(37)), Z(37)]],                      // the registry on the forward hull, from the spine's front
    [[-10, Y(HT(100)) + 0.6, Z(100)], [-9, 6.5, Z(123)]], [[10, Y(HT(100)) + 0.6, Z(100)], [9, 6.5, Z(123)]], // the rollbar, from the saucer's back
    [[0, Y(HT(108)) + 0.8, Z(108)], [0, Y(POD.d), Z(116)]],                    // the pod's launchers, from the saucer's back
    [[-26, Y(19), Z(138)], [-15, Y(24.5), Z(164)]], [[26, Y(19), Z(138)], [15, Y(24.5), Z(164)]], // the flank lettering, from the rim
  ];
  const uniforms = {
    map: { value: map }, emap: { value: emap }, shadowMap: { value: shadow ? shadow.tex : null }, shadowMtx: { value: shadow ? shadow.mtx : new THREE.Matrix4() },
    shadowOn: { value: shadow ? 1 : 0 }, texel: { value: shadow ? shadow.texel : 0 }, sbias: { value: shadow ? 0.35 / shadow.range : 0 },
    sunDir: { value: sun }, sunCol: { value: new THREE.Color(1.0, 0.95, 0.88).multiplyScalar(opts.sunPower || 1.3) },
    rimDir: { value: HULL_RIM.clone() }, rimCol: { value: new THREE.Color(0.2, 0.27, 0.38) },
    sky: { value: new THREE.Color(0.08, 0.09, 0.11) }, ground: { value: new THREE.Color(0.035, 0.04, 0.048) },
    glow: { value: opts.glow || 2.6 }, bump: { value: lite ? 2.0 : 3.0 }, flood: { value: 1 },
    fPos: { value: FL.map(([p]) => new THREE.Vector3(...p)) }, fDir: { value: FL.map(([p, q]) => new THREE.Vector3(...q).sub(new THREE.Vector3(...p)).normalize()) },
    fCol: { value: new THREE.Color(...HULL_PAINT.flood).multiplyScalar(7) },
    // the fine plating: an 8 m patch modelled and baked in Blender (tools/detail_tile_blender.py), repeated over the hull
    detail: { value: HULL_DETAIL.tex(lite && K < 1) }, detailOn: { value: HULL_DETAIL.isReady(lite && K < 1) ? 1 : 0 }, detailScale: { value: 1 / 8 }, detailStr: { value: 1.0 },
  };
  HULL_DETAIL.onReady(lite && K < 1, (t) => { uniforms.detail.value = t; uniforms.detailOn.value = 1; });
  const paint = new THREE.ShaderMaterial({ uniforms, fog: false,
    vertexShader: `uniform mat4 shadowMtx; varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying vec3 vP; varying vec4 vS; varying vec3 vNo;
void main() { vUv = uv; vP = position; vNo = normal; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
  vS = shadowMtx * vec4(position + normal * 0.22, 1.0); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D map; uniform sampler2D emap; uniform sampler2D shadowMap; uniform float shadowOn; uniform float texel; uniform float sbias;
uniform vec3 sunDir; uniform vec3 sunCol; uniform vec3 rimDir; uniform vec3 rimCol; uniform vec3 sky; uniform vec3 ground;
uniform float glow; uniform float bump; uniform float flood; uniform vec3 fPos[6]; uniform vec3 fDir[6]; uniform vec3 fCol;
uniform sampler2D detail; uniform float detailOn; uniform float detailScale; uniform float detailStr;
varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying vec3 vP; varying vec4 vS; varying vec3 vNo;
// the baked plating patch, projected along the ship's three axes and blended by which way the surface faces
// (a "triplanar" projection: no texture layout needed, the same scale everywhere); returns the bent normal, ao in w
vec4 plating(vec3 N) {
  vec3 w = pow(abs(normalize(vNo)), vec3(6.0)); w /= (w.x + w.y + w.z);
  vec3 p = vP * detailScale, sg = sign(normalize(vNo));
  vec3 tx = texture2D(detail, vec2(p.z * sg.x, p.y)).rgb, ty = texture2D(detail, vec2(p.x, p.z * sg.y)).rgb, tz = texture2D(detail, vec2(-p.x * sg.z, p.y)).rgb;
  vec2 nx = (tx.rg * 2.0 - 1.0) * detailStr, ny = (ty.rg * 2.0 - 1.0) * detailStr, nz = (tz.rg * 2.0 - 1.0) * detailStr;
  // each patch's across (u) and up (v) directions on the ship, so its relief tilts the right way (a whiteout blend)
  vec3 bx = vec3(N.x, N.y + nx.y, N.z + nx.x * sg.x), by = vec3(N.x + ny.x, N.y, N.z + ny.y * sg.y), bz = vec3(N.x - nz.x * sg.z, N.y + nz.y, N.z);
  vec3 Nd = normalize(bx * w.x + by * w.y + bz * w.z);
  float ao = tx.b * w.x + ty.b * w.y + tz.b * w.z;
  return vec4(mix(N, Nd, detailOn), mix(1.0, ao, detailOn));
}
float sunShadow() {
  vec3 c = vS.xyz / vS.w; if (shadowOn < 0.5 || c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0 || c.z > 1.0) return 1.0;
  float s = 0.0; for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) s += (c.z - sbias <= texture2D(shadowMap, c.xy + vec2(float(i), float(j)) * texel * 1.25).r) ? 1.0 : 0.0;
  return s / 9.0;
}
void main() {
  vec4 t = texture2D(map, vUv); if (t.a < 0.5) discard;
  vec3 base = t.rgb, N0 = normalize(vN); if (!gl_FrontFacing) N0 = -N0;
  // relief from the height in the atlas alpha
  vec2 dx = dFdx(vUv), dy = dFdy(vUv); vec2 dH = vec2(texture2D(map, vUv + dx).a - t.a, texture2D(map, vUv + dy).a - t.a) * bump;
  vec3 sx = dFdx(vW), sy = dFdy(vW), r1 = cross(sy, N0), r2 = cross(N0, sx); float det = dot(sx, r1);
  vec3 N = normalize(abs(det) * N0 - sign(det) * (dH.x * r1 + dH.y * r2)); if (dot(N, N0) < 0.2) N = N0;
  // the plating patch, eased off with distance so far-off seams don't crowd into dark lines
  float far = mix(0.4, 1.0, smoothstep(320.0, 90.0, length(cameraPosition - vW)));
  vec4 pl = plating(N); N = normalize(mix(N, pl.xyz, far)); if (dot(N, N0) < 0.2) N = N0;
  float ao = mix(1.0, pl.w, far), seam = smoothstep(0.35, 0.85, ao); base *= mix(0.7, 1.0, seam);
  vec3 V = normalize(cameraPosition - vW);
  float nl = dot(N, sunDir), sh = sunShadow() * smoothstep(-0.05, 0.12, dot(N0, sunDir));
  // panels: lighter plates a touch glossier
  float lum = dot(base, vec3(0.3, 0.55, 0.15)), rough = clamp(0.55 - (lum - 0.2) * 0.9, 0.3, 0.7), a2 = rough * rough * rough * rough;
  vec3 H = normalize(sunDir + V); float nh = max(dot(N, H), 0.0), dd = nh * nh * (a2 - 1.0) + 1.0, D = a2 / (3.14159 * dd * dd);
  float fr = pow(1.0 - max(dot(N, V), 0.0), 5.0); vec3 F0 = mix(vec3(0.05), base, 0.3), F = F0 + (1.0 - F0) * fr;
  vec3 col = base * (sunCol * max(nl, 0.0) * sh + (rimCol * max(dot(N, rimDir), 0.0) + mix(ground, sky, N.y * 0.5 + 0.5)) * ao);
  col += sunCol * D * F * max(nl, 0.0) * sh * 0.22 * seam;
  vec3 R = reflect(-V, N); col += (mix(ground, sky * 2.5, smoothstep(-0.3, 0.9, R.y)) * F * 0.6 + rimCol * F * pow(max(dot(R, rimDir), 0.0), 8.0) * 0.6) * ao;
  for (int i = 0; i < 6; i++) { vec3 L = fPos[i] - vP; float dist = length(L); L /= dist;
    float cone = smoothstep(0.7, 0.95, dot(-L, fDir[i])), att = 1.0 / (1.0 + dist * dist * 0.018);
    col += base * fCol * max(dot(N, L), 0.0) * cone * att * flood * ao; }
  col += texture2D(emap, vUv).rgb * glow;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}` });
  const decalPaint = paint.clone(); decalPaint.uniforms = uniforms; Object.assign(decalPaint, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });

  const root = new THREE.Group(); root.name = 'Exterior';
  const ship = new THREE.Mesh(shipGeo, paint); ship.name = 'Exterior hull'; root.add(ship);
  const lettering = new THREE.Mesh(letterGeo, decalPaint); lettering.name = 'Exterior lettering'; lettering.renderOrder = 1; root.add(lettering);
  // floods go dark at red alert (the lounge board says so)
  ship.onBeforeRender = () => { uniforms.flood.value = typeof state !== 'undefined' && state.alert === 'red' ? 0 : 1; };
  // running lights: red to port and green to starboard at the widest beam and on each nacelle's outboard side
  { const halo = (() => { const c = cnv(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return tex(c); })();
    const lights = new THREE.Group(); lights.name = 'Running lights'; root.add(lights); root.userData.runningLights = lights;
    const S = secAt(58);
    [[-1, 0xff4636], [1, 0x48ff74]].forEach(([sd, col]) => {
      [[sd * (S.w + 0.15), Y(SAU.dc), Z(58)], nacPt(sd, 10, 0.75, 0.15)].forEach((p) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
        s.position.set(...p); s.scale.setScalar(2.6); lights.add(s);
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshBasicMaterial({ color: col, toneMapped: false, fog: false })); b.position.set(...p); lights.add(b); });
    }); }
  // ---------- stage 2b: the moving parts ----------
  const soft = (inner, outer) => { const c = cnv(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, inner); gr.addColorStop(0.3, outer); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return tex(c); };
  const glowTex = soft('rgba(255,255,255,1)', 'rgba(255,255,255,0.4)'), puffTex = soft('rgba(255,255,255,0.6)', 'rgba(255,255,255,0.22)'), plumeTex = soft('rgba(255,255,255,1)', 'rgba(255,255,255,0.32)');
  const addSprite = (map, col, blend) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: col, transparent: true, opacity: 0, blending: blend || THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false })); sp.visible = false; root.add(sp); return sp; };
  // the clamshell doors: an upper leaf hinged along the top of the opening and a lower one along its foot, both bowed
  // outward; opening, they swing aft to lie level (the upper as an awning, the lower as an apron). Their vertices are
  // turned on the CPU so the paint shader (which works in the ship's own frame) still lines up shadows and floods.
  const doorMat = paint.clone(); doorMat.uniforms = uniforms; doorMat.side = THREE.DoubleSide;
  const ZH = ZS + BAY.lip + 0.12;
  const leaf = (d0, d1, hingeD, sign) => { const rows = lite ? 6 : 9, cols = lite ? 9 : 15;
    const pt = (i, j) => { const d = d0 + (d1 - d0) * i / (rows - 1), W = owAt(Math.min(Math.max(d, BAY.dA), BAY.dB)) + 0.28, x = -W + 2 * W * j / (cols - 1), q = x / W; return [x, d, ZH + 0.38 * (1 - q * q)]; };
    const geo = orient(grid(rows, cols, (i, j) => { const [x, d, z] = pt(i, j); return [x, Y(d), z]; }, (i, j) => { const [x, d] = pt(i, j); return doorUV(x, d); }), () => new THREE.Vector3(0, 0, 1));
    const m = new THREE.Mesh(geo, doorMat); m.frustumCulled = false; m.name = 'Shuttlebay door leaf'; root.add(m);
    return { m, base: geo.attributes.position.array.slice(), nb: geo.attributes.normal.array.slice(), yh: Y(hingeD), sign }; };
  const LEAVES = [leaf(BAY.dA - 0.25, BAY.dM - 0.02, BAY.dA - 0.25, -1), leaf(BAY.dM + 0.02, BAY.dB + 0.25, BAY.dB + 0.25, 1)];
  const setLeaves = (k) => LEAVES.forEach((L) => { const a = L.sign * k * Math.PI * 0.49, c = Math.cos(a), s2 = Math.sin(a), P = L.m.geometry.attributes.position, Nn = L.m.geometry.attributes.normal;
    for (let v = 0; v < P.count; v++) { const dy = L.base[v * 3 + 1] - L.yh, dz = L.base[v * 3 + 2] - ZH, ny = L.nb[v * 3 + 1], nz = L.nb[v * 3 + 2];
      P.array[v * 3 + 1] = L.yh + dy * c - dz * s2; P.array[v * 3 + 2] = ZH + dy * s2 + dz * c; Nn.array[v * 3 + 1] = ny * c - nz * s2; Nn.array[v * 3 + 2] = ny * s2 + nz * c; }
    P.needsUpdate = true; Nn.needsUpdate = true; });
  // the bay behind them: the opening's outline carried forward to m BAY.m0, lit; a back wall with the flight control
  // booth's window on the gallery level; a runabout and two utility shuttles on the Deck 8 floor, noses to the doors
  const bay = new THREE.Group(); bay.name = 'Shuttlebay'; bay.visible = false; root.add(bay);
  { const W = lite ? 512 : 1024, H = lite ? 256 : 512, c = cnv(W, H), x = c.getContext('2d'), L = 200 - BAY.m0, ux = (m) => (m - BAY.m0) / L * W, vy = (v) => v * H;
    x.fillStyle = '#5F676A'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#4E575A'; x.fillRect(0, 0, W, vy(0.25)); // ceiling, with rows of light panels
    for (let m = BAY.m0 + 2; m < 199; m += 4) { x.fillStyle = '#F2DEC0'; x.fillRect(ux(m), vy(0.06), ux(m + 2.2) - ux(m), vy(0.05)); x.fillRect(ux(m), vy(0.14), ux(m + 2.2) - ux(m), vy(0.05)); }
    x.fillStyle = '#6C7375'; x.fillRect(0, vy(0.5), W, vy(0.25)); // the floor: a pale deck, an amber centre line, landing squares, lit edges
    x.fillStyle = '#E0A050'; for (let m = BAY.m0 + 1; m < 199; m += 2) x.fillRect(ux(m), vy(0.622), ux(m + 1.1) - ux(m), vy(0.006));
    x.strokeStyle = '#E8E2D2'; x.lineWidth = 3; [176, 186].forEach((m) => x.strokeRect(ux(m - 3.5), vy(0.545), ux(m + 3.5) - ux(m - 3.5), vy(0.16)));
    x.fillStyle = '#FFE2B0'; x.fillRect(0, vy(0.503), W, vy(0.008)); x.fillRect(0, vy(0.739), W, vy(0.008));
    [0.25, 0.75].forEach((v0) => { // the walls: frames, the gallery catwalk at the Deck 7/8 line with warm lit windows above it, a light strip below
      x.fillStyle = '#4A5255'; for (let m = BAY.m0 + 3; m < 199; m += 3) x.fillRect(ux(m), vy(v0), 3, vy(0.25));
      const up = v0 < 0.5, cat = v0 + 0.25 * (up ? 24.5 - BAY.dA : BAY.dB - 24.5) / (BAY.dB - BAY.dA); // the starboard wall runs down from the ceiling, the port wall up from the floor
      x.fillStyle = '#3C4448'; x.fillRect(0, vy(cat) - 4, W, 8); x.fillStyle = '#FFD9A0'; x.fillRect(0, vy(cat) + (up ? 6 : -9), W, 3);
      x.fillStyle = '#F3D6A8'; for (let m = BAY.m0 + 1.5; m < 197; m += 3) x.fillRect(ux(m), vy(up ? v0 + 0.03 : cat + 0.02), ux(m + 1.6) - ux(m), vy(0.05));
      x.fillStyle = '#FFF4E2'; x.fillRect(0, vy(up ? 0.47 : 0.78), W, vy(0.008)); });
    const bmat = new THREE.MeshBasicMaterial({ map: tex(c), fog: false }), n = OPEN.length, ctr = new THREE.Vector3(0, Y(BAY.dM), 0);
    const tg = orient(grid(4, n + 1, (i, j) => { const [ox, d] = OPEN[j % n], m = 200 - (200 - BAY.m0) * i / 3; return [ox, Y(d), Z(m)]; },
      (i, j) => [1 - i / 3, 1 - (j < n ? OPEN[j][2] : 1)]), (q) => ctr.clone().setZ(q.z).sub(q));
    bay.add(new THREE.Mesh(tg, bmat));
    const bw = cnv(256, 128), bx = bw.getContext('2d'); bx.fillStyle = '#5A6265'; bx.fillRect(0, 0, 256, 128); bx.fillStyle = '#3C4448'; bx.fillRect(0, 50, 256, 6);
    bx.fillStyle = '#FFE0B0'; bx.fillRect(70, 14, 116, 26); bx.fillStyle = '#C89060'; for (let k = 1; k < 4; k++) bx.fillRect(70 + k * 29, 14, 2, 26);
    bx.fillStyle = '#454D50'; bx.fillRect(90, 70, 76, 58); bx.fillStyle = '#E0A050'; bx.fillRect(90, 66, 76, 4);
    const pos = [0, Y(BAY.dM), Z(BAY.m0)], uv = [0.5, 0.5], idx = []; OPEN.forEach(([ox, d], j) => { pos.push(ox, Y(d), Z(BAY.m0)); uv.push(0.5 + ox / 16, 1 - (d - BAY.dA) / (BAY.dB - BAY.dA)); idx.push(0, 1 + j, 1 + (j + 1) % n); });
    const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); wg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); wg.setIndex(idx);
    orient(wg, () => new THREE.Vector3(0, 0, 1)); bay.add(new THREE.Mesh(wg, new THREE.MeshBasicMaterial({ map: tex(bw), fog: false })));
    // shuttles: tapered hulls in the bay's light (vertex colours lit from above), with a dark canopy band and side pods
    const craft = (len, wid, hgt, m, xo) => { const gb = new THREE.BoxGeometry(wid, hgt, len, 1, 1, 1).toNonIndexed(), P = gb.attributes.position;
      for (let v = 0; v < P.count; v++) { if (P.getZ(v) > 0) { P.setX(v, P.getX(v) * 0.55); if (P.getY(v) > 0) P.setY(v, P.getY(v) - hgt * 0.45); } }
      gb.computeVertexNormals(); const Nn = gb.attributes.normal, col = [];
      for (let v = 0; v < P.count; v++) { const l = 0.3 + 0.42 * Math.max(0, Nn.getY(v)) + 0.1 * Math.abs(Nn.getX(v)) + 0.08 * Math.max(0, Nn.getZ(v)); col.push(0.62 * l, 0.65 * l, 0.66 * l); }
      gb.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      const g2 = new THREE.Group(); g2.position.set(xo, Y(BAY.dB) + hgt / 2 + 0.25, Z(m)); bay.add(g2);
      g2.add(new THREE.Mesh(gb, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })));
      const dk = new THREE.MeshBasicMaterial({ color: 0x23292c, fog: false });
      const cb = new THREE.Mesh(new THREE.BoxGeometry(wid * 0.62, hgt * 0.16, len * 0.08), dk); cb.position.set(0, hgt * 0.18, len * 0.28); g2.add(cb);
      [-1, 1].forEach((s) => { const pd = new THREE.Mesh(new THREE.BoxGeometry(wid * 0.16, hgt * 0.3, len * 0.66), new THREE.MeshBasicMaterial({ color: 0x5a6265, fog: false })); pd.position.set(s * wid * 0.56, -hgt * 0.1, -len * 0.08); g2.add(pd); }); };
    craft(10, 3.9, 2.6, 187, 0); [-1, 1].forEach((s) => craft(5.4, 2.6, 2.1, 175.5, s * 2.15)); }
  const bayGlow = addSprite(glowTex, 0xffe2b8); bayGlow.position.set(0, Y(BAY.dM), ZS + 2.0); bayGlow.scale.set(13, 8, 1);
  // impulse: each vent's glow brightens with speed, and a soft red-orange plume trails aft, longer the faster she goes
  const ventTex = (() => { const c = cnv(64, 32), x = c.getContext('2d'), gr = x.createRadialGradient(32, 16, 0, 32, 16, 32); gr.addColorStop(0, 'rgba(255,230,200,1)'); gr.addColorStop(0.5, 'rgba(255,140,90,0.7)'); gr.addColorStop(1, 'rgba(255,80,40,0.15)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 32); return tex(c); })();
  const PLN = lite ? 6 : 12, IMP = VENTS.map(([x0, x1, d0, d1]) => {
    const vm = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, d1 - d0), new THREE.MeshBasicMaterial({ map: ventTex, color: 0xff7a4a, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
    vm.position.set((x0 + x1) / 2, Y((d0 + d1) / 2), ZS + 0.07); root.add(vm);
    const plume = []; for (let i = 0; i < PLN; i++) plume.push(addSprite(plumeTex, i < 2 ? 0xff9a64 : i < 5 ? 0xff6a38 : 0xe8462a));
    return { vm, plume, c: [(x0 + x1) / 2, Y((d0 + d1) / 2)], w: x1 - x0, h: d1 - d0 }; });
  // thruster puffs: short-lived soft white jets from the thruster blocks
  const PUFFS = []; for (let i = 0; i < 12; i++) PUFFS.push(addSprite(puffTex, 0xdfe8f0, THREE.NormalBlending));
  const puff = (i, age) => { const src = RCS[i]; if (!src) return; const sp = PUFFS.find((q) => !q.visible); if (!sp) return;
    const dir = new THREE.Vector3(...src[1]).normalize(); sp.position.set(...src[0]); sp.userData = { v: dir.multiplyScalar(4.5 + Math.random()), age: 0, life: 0.8 + Math.random() * 0.3 }; sp.visible = true;
    if (age) { sp.position.addScaledVector(sp.userData.v, age); sp.userData.age = age; } };
  // small lights: one draw call for every strobe, beacon, guide light and tip light, blinking in the vertex shader
  const LPTS = (() => { const n = LT.length, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), inf = new Float32Array(n * 3);
    LT.forEach((l, i) => { pos.set(l.p, i * 3); col.set([l.col.r, l.col.g, l.col.b], i * 3); inf.set([l.size, l.kind, l.ph], i * 3); });
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); gg.setAttribute('col', new THREE.BufferAttribute(col, 3)); gg.setAttribute('info', new THREE.BufferAttribute(inf, 3));
    const mat = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 }, px: { value: 600 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec3 col; attribute vec3 info; uniform float time; uniform float px; varying vec3 vC; varying float vA;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); float k = info.y, ph = info.z, a = 1.0;
  if (k > 0.5 && k < 1.5) { float c = fract(time / 1.7 + ph); a = step(c, 0.035) + step(0.13, c) * step(c, 0.165); }          // strobe: a double flash
  else if (k > 1.5 && k < 2.5) { a = 0.08 + 0.92 * pow(max(0.0, sin(6.2832 * (time / 1.4 + ph))), 4.0); }                   // beacon: a slow pulse
  else if (k > 2.5 && k < 3.5) { float c = fract(time * 0.7 - ph); a = 0.15 + 0.85 * exp(-c * 9.0); }                       // guide lights: a chase
  else if (k > 3.5) { a = 0.2 + 0.8 * step(0.55, fract(time / 2.2 + ph)); }                                                    // tip lights: a slow blink
  vA = a; vC = col; gl_PointSize = clamp(info.x * 2.4 * px / -mv.z, 2.0, 96.0); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec3 vC; varying float vA;
void main() { vec2 q = gl_PointCoord * 2.0 - 1.0; float r = dot(q, q); if (r > 1.0) discard; float core = smoothstep(0.1, 0.0, r), halo = pow(1.0 - r, 3.0) * 0.55;
  gl_FragColor = vec4(vC * (core * 1.6 + halo) * vA, 1.0); }` });
    const pts = new THREE.Points(gg, mat); pts.name = 'Hull lights'; pts.frustumCulled = false; const v2 = new THREE.Vector2();
    pts.onBeforeRender = (r, sc, cam) => { r.getDrawingBufferSize(v2); mat.uniforms.px.value = cam.projectionMatrix.elements[5] * v2.y / 2; }; root.add(pts); return pts; })();
  // per frame: doors toward state.bayDoors (3 s), plume toward the speed, idle puffs every few seconds and a burst when the speed order changes
  const DY = { door: 0, shown: -1, plume: 0, puffT: 2.5, lastSpeed: null };
  const ease = (k) => k * k * (3 - 2 * k), sm = (a, b, v) => { const q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q); };
  const PAIRS = [[1, 4], [0, 5], [2, 5], [3, 4], [6, 7]];
  root.userData.update = (dt, t) => {
    const st = typeof state !== 'undefined' ? state : {}, sp = typeof cur !== 'undefined' ? cur.speed : 0;
    DY.door += Math.max(-dt / 3, Math.min(dt / 3, (st.bayDoors ? 1 : 0) - DY.door));
    if (DY.door !== DY.shown) { DY.shown = DY.door; setLeaves(ease(DY.door)); bay.visible = DY.door > 0.002; bayGlow.visible = bay.visible; bayGlow.material.opacity = 0.14 * ease(DY.door); }
    DY.plume += (sm(0.2, 12, sp) * (1 - sm(80, 300, sp)) - DY.plume) * Math.min(1, dt * 1.5);
    const k = DY.plume, fl = 1 + 0.06 * Math.sin(t * 31) + 0.04 * Math.sin(t * 57);
    IMP.forEach((I) => { I.vm.material.opacity = (0.22 + 0.78 * k) * fl; const L = 1.5 + 13 * k;
      I.plume.forEach((s, i) => { const f = (i + 0.5) / I.plume.length; s.visible = k > 0.01; s.position.set(I.c[0], I.c[1], ZS + 0.4 + L * f);
        const sz = I.w * (0.42 + 0.4 * Math.sin(Math.PI * Math.min(1, f * 1.6))) * (1 - 0.4 * f) * (0.75 + 0.25 * k); s.scale.set(sz, sz * 0.6, 1); s.material.opacity = Math.min(1, k * 0.95 * Math.pow(1 - f, 1.1) * fl); }); });
    DY.puffT -= dt; if (DY.puffT <= 0) { PAIRS[(Math.random() * PAIRS.length) | 0].forEach((i) => puff(i)); DY.puffT = 3 + Math.random() * 6; }
    if (st.speed !== DY.lastSpeed) { if (DY.lastSpeed != null) [0, 1, 2, 3, 4, 5].forEach((i) => puff(i)); DY.lastSpeed = st.speed; }
    const dp = Math.min(dt, 0.05); PUFFS.forEach((s) => { if (!s.visible) return; const u = s.userData; u.age += dp; s.position.addScaledVector(u.v, dp);
      if (u.age >= u.life) { s.visible = false; return; } const q = u.age / u.life; s.scale.setScalar(0.5 + u.age * 3.2); s.material.opacity = 0.24 * Math.pow(1 - q, 1.6); });
    LPTS.material.uniforms.time.value = t;
  };
  root.userData.puff = puff; root.userData.lights = LT.length; root.userData.lite = lite; root.userData.atlasScale = K;
  root.userData.docks = DOCKS; root.userData.bay = { m0: BAY.m0, dA: BAY.dA, dB: BAY.dB, door: () => DY.door, leaves: LEAVES.map((L) => L.m) };
  root.userData.plumeLength = () => IMP[0].plume[IMP[0].plume.length - 1].position.z - ZS;
  root.userData.update(0, 0);
  root.traverse((o) => { o.userData.noPick = true; });
  { let n = 0; root.traverse((o) => { if (o.isMesh) n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; }); root.userData.triangles = n; }
  root.userData.paint = paint; root.userData.shadow = !!shadow; root.userData.escapePods = podCount * 2;
  return root;
}
