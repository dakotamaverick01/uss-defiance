// USS Defiance · exterior.js
// The ship seen from outside, built in code from SHIPGEO (shipgeo.js) so it always matches the deck plan and the
// bridge's systems display. buildExterior(opts) returns a group in Deck 2's frame (x starboard, y up from the Deck 2
// floor, -z forward): the hull lofted from the side profile and the plan half-beam, the officers' spine and bridge pod,
// the twin-rail arch with the turret deck and turret, the nacelles slung low on swept spars, the deflector, impulse
// vents, lettering and running lights.
// Paint: one canvas atlas (plating patchwork, seams, window bands, pinstripes, lettering) and a matching glow map
// (lit windows, grilles, caps, impulse, deflector). The hull has its own light, a key "sun" plus a soft sky and
// ground fill, worked out in its own small shader, so it never touches the baked interior and reads the same in
// every view. Strictly original: name and registry only, no emblems or borrowed markings.
// Files share one global scope and load in order (see index.html).
'use strict';

// the hull's own key light (Deck 2 frame): high, from forward and to starboard
const HULL_SUN = new THREE.Vector3(0.52, 0.5, -0.69).normalize();
const HULL_PAINT = {
  base: '#C9D0D2', band: '#A3ACB0', dark: '#6A737A', slate: '#3E4A56', glass: '#283038', letter: '#3A4048',
  window: '#FFD9A0', grille: '#6FB6E6', cap: '#E0704A', impulse: '#D2503C', deflector: '#8CC8EE',
};

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
  const HT = shipFn(G.top), HB = shipFn(G.bottom), HW = shipFn(G.halfBeam), SP = shipFn(G.spine);

  // ---------- atlas layout (pixels at full size) ----------
  const AW = 4096, AH = 2560;
  const R = {
    hull: [0, 0, 4096, 2048], nac: [0, 2048, 1536, 384], spine: [1536, 2048, 768, 512], arch: [2304, 2048, 1024, 256],
    spar: [3328, 2048, 512, 256], turret: [3840, 2048, 256, 256], stern: [2304, 2304, 512, 256],
    name: [2816, 2304, 768, 128], reg: [2816, 2432, 512, 128], cells: [3584, 2304, 256, 256],
  };
  // uv in a region: (a, b) in 0..1 across the region (b = 0 at the region's top row in the canvas)
  const ruv = (r, a, b) => [(r[0] + a * r[2]) / AW, 1 - (r[1] + b * r[3]) / AH];
  const CELL = { base: 0, dark: 1, slate: 2, glass: 3, deflector: 4, impulse: 5, grille: 6, cap: 7, gun: 8, ring: 9, barrel: 10, light: 11 };
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
  // make faces point outward (away from the middle of their row of the grid), then smooth normals across seams
  function finish(g, weld) {
    const p = g.attributes.position.array, ix = g.index.array, cols = g.userData.cols || p.length / 3, rows = p.length / 3 / cols, mid = [];
    for (let i = 0; i < rows; i++) { let x = 0, y = 0, z = 0; for (let j = 0; j < cols; j++) { const v = (i * cols + j) * 3; x += p[v]; y += p[v + 1]; z += p[v + 2]; } mid.push([x / cols, y / cols, z / cols]); }
    let out = 0;
    for (let k = 0; k < ix.length; k += 3) { const a = ix[k] * 3, b = ix[k + 1] * 3, c = ix[k + 2] * 3, ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2], vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, q = mid[Math.floor(ix[k] / cols)];
      out += nx * ((p[a] + p[b] + p[c]) / 3 - q[0]) + ny * ((p[a + 1] + p[b + 1] + p[c + 1]) / 3 - q[1]) + nz * ((p[a + 2] + p[b + 2] + p[c + 2]) / 3 - q[2]); }
    if (out < 0) for (let k = 0; k < ix.length; k += 3) { const t = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = t; }
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

  // ---------- the hull: side profile x plan half-beam, rounded cross-sections ----------
  // Each section: a flat-topped upper cap down to the widest line, a short vertical band there (the window band), and a
  // lower cap that sharpens into a keel aft. Its top stays on the profile's top line (y -0.7 under Deck 2's windows).
  function hullSec(m) {
    const t = HT(m), b = Math.max(HB(m), t + 0.02), w = Math.max(HW(m), 0.002), D = b - t;
    const rim = t + Math.min(0.4 * D, 10.0), band = Math.min(1.5, 0.08 * D), keel = smooth01(104, 128, m) * (1 - smooth01(188, 199.5, m));
    return { m, t, b, w, r0: rim - band, r1: rim + band, nu: 2.7, nl: 2.25 - 0.55 * keel };
  }
  const NU = lite ? 14 : 22, NB = 2, NL = lite ? 14 : 22;
  // one side (starboard, x >= 0) from the top centreline to the bottom centreline: [x, d, arc]
  function hullSide(S) {
    const out = [];
    for (let i = 0; i <= NU; i++) { const f = (Math.PI / 2) * i / NU; out.push([S.w * Math.pow(Math.sin(f), 2 / S.nu), S.r0 - (S.r0 - S.t) * Math.pow(Math.cos(f), 2 / S.nu)]); }
    for (let i = 1; i <= NB; i++) out.push([S.w, S.r0 + (S.r1 - S.r0) * i / NB]);
    for (let i = 1; i <= NL; i++) { const f = (Math.PI / 2) * i / NL; out.push([S.w * Math.pow(Math.cos(f), 2 / S.nl), S.r1 + (S.b - S.r1) * Math.pow(Math.sin(f), 2 / S.nl)]); }
    let a = 0; out[0].push(0); for (let i = 1; i < out.length; i++) { a += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); out[i].push(a); }
    return out;
  }
  const HM = (() => { // stations along the length, close together at the bow and stern
    const s = new Set([0, 0.12, 0.3, 0.55, 0.9, 1.35, 1.9, 2.6, 3.4, 4.4, 5.6, 7, 199.5, 199.2, 198.7, 198]);
    const N = lite ? 70 : 118; for (let i = 0; i <= N; i++) { const q = i / N; s.add(+(8 + 190 * (0.72 * q + 0.28 * (0.5 - 0.5 * Math.cos(Math.PI * q)))).toFixed(3)); }
    return [...s].filter((m) => m <= 199.5).sort((a, b) => a - b);
  })();
  const HS = HM.map((m) => { const S = hullSec(m); S.side = hullSide(S); S.arc = S.side[S.side.length - 1][2]; return S; });
  const VMAX = Math.max(...HS.map((S) => S.arc)) * 1.002;
  const RING = 2 * (NU + NB + NL); // closed ring: top, starboard side to the keel, port side back up
  const ringPt = (S, j) => { const k = S.side.length - 1; return j <= k ? [S.side[j][0], S.side[j][1], S.side[j][2]] : [-S.side[2 * k - j][0], S.side[2 * k - j][1], S.side[2 * k - j][2]]; };
  {
    const g = grid(HS.length, RING, (i, j) => { const S = HS[i], [x, d] = ringPt(S, j); return [x, Y(d), Z(S.m)]; },
      (i, j) => ruv(R.hull, HS[i].m / 200, ringPt(HS[i], j)[2] / VMAX), true);
    parts.push(finish(g));
    // the stern: a flat transom closing the last section
    const S = HS[HS.length - 1], pos = [0, Y((S.t + S.b) / 2), Z(S.m)], uvs = [...ruv(R.stern, 0.5, ((S.t + S.b) / 2 - 15) / 18)], idx = [];
    for (let j = 0; j < RING; j++) { const [x, d] = ringPt(S, j); pos.push(x, Y(d), Z(S.m)); uvs.push(...ruv(R.stern, 0.5 + x / 24, (d - 15) / 18)); idx.push(0, 1 + j, 1 + (j + 1) % RING); }
    const t = new THREE.BufferGeometry(); t.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); t.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); t.setIndex(idx);
    t.computeVertexNormals(); { const n = t.attributes.normal; if (n.getZ(0) < 0) { const ix = t.index.array; for (let k = 0; k < ix.length; k += 3) { const q = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = q; } t.computeVertexNormals(); } }
    parts.push(t);
  }
  // a point on the hull: on the upper cap at lateral x, on the lower cap at lateral x, or on a side at depth d
  const hullTop = (m, x) => { const S = hullSec(m), q = Math.min(0.999, Math.abs(x) / S.w), f = Math.asin(Math.pow(q, S.nu / 2)); return [x, Y(S.r0 - (S.r0 - S.t) * Math.pow(Math.cos(f), 2 / S.nu)), Z(m)]; };
  const hullBot = (m, x) => { const S = hullSec(m), q = Math.min(0.999, Math.abs(x) / S.w), f = Math.acos(Math.pow(q, S.nl / 2)); return [x, Y(S.r1 + (S.b - S.r1) * Math.pow(Math.sin(f), 2 / S.nl)), Z(m)]; };
  const hullAtDepth = (S, d) => { // starboard x and arc length where the section reaches depth d (null if it doesn't)
    const s = S.side; if (d < s[0][1] || d > s[s.length - 1][1]) return null;
    for (let i = 1; i < s.length; i++) if (d <= s[i][1] && s[i][1] > s[i - 1][1]) { const f = (d - s[i - 1][1]) / (s[i][1] - s[i - 1][1]); return { x: s[i - 1][0] + f * (s[i][0] - s[i - 1][0]), arc: s[i - 1][2] + f * (s[i][2] - s[i - 1][2]), ny: (s[i][0] - s[i - 1][0]) / Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]) }; }
    return null;
  };
  const secFull = (m) => { const S = hullSec(m); S.side = hullSide(S); return S; };
  const hullSidePt = (m, d, sd) => { const h = hullAtDepth(secFull(m), d); return h ? [sd * h.x, Y(d), Z(m)] : null; };

  // ---------- the officers' spine (Decks 1-2) and the bridge pod ----------
  // Plan extents from SHIPGEO.spinePlan, pushed out 0.2 m so the shell clears the rooms' outer walls; seen from inside a
  // room it faces away and is not drawn, so every window looks straight out.
  const SX0 = X(G.spinePlan[3]) - 0.2, SX1 = X(G.spinePlan[2]) + 0.2;
  const SPM = (() => { const s = new Set(); const seg = (a, b, n) => { for (let i = 0; i <= n; i++) s.add(+(a + (b - a) * i / n).toFixed(3)); };
    seg(50, 62, lite ? 10 : 18); seg(62, 77, 4); seg(77, 83, lite ? 5 : 8); seg(83, 94.5, 4); seg(94.5, 98, lite ? 6 : 10); return [...s].sort((a, b) => a - b); })();
  const SPN = lite ? 6 : 9; // points on each rounded top corner
  function spineRing(m) { // starboard base, up, over the top, down to the port base: [x, d, arc]
    const dT = SP(m), dB = HT(m) + 1.0, rc = Math.max(0.05, Math.min(1.3, 0.45 * (HT(m) - dT))), out = [];
    out.push([SX1, dB]);
    for (let k = 0; k <= SPN; k++) { const a = (Math.PI / 2) * k / SPN; out.push([SX1 - rc + rc * Math.cos(a), dT + rc - rc * Math.sin(a)]); }
    for (let k = 0; k <= SPN; k++) { const a = (Math.PI / 2) * k / SPN; out.push([SX0 + rc - rc * Math.sin(a), dT + rc - rc * Math.cos(a)]); }
    out.push([SX0, dB]);
    let a = 0; out[0].push(0); for (let i = 1; i < out.length; i++) { a += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); out[i].push(a); }
    return out;
  }
  const SR = SPM.map((m) => ({ m, r: spineRing(m) })), SVMAX = Math.max(...SR.map((s) => s.r[s.r.length - 1][2])) * 1.002;
  {
    parts.push(finish(grid(SR.length, SR[0].r.length, (i, j) => { const [x, d] = SR[i].r[j]; return [x, Y(d), Z(SR[i].m)]; },
      (i, j) => ruv(R.spine, (SR[i].m - 50) / 48, SR[i].r[j][2] / SVMAX))));
    [SR[0], SR[SR.length - 1]].forEach((s, e) => { // end caps
      const cx = (SX0 + SX1) / 2, cd = s.r.reduce((q, p) => q + p[1], 0) / s.r.length, pos = [cx, Y(cd), Z(s.m)], uvs = [...cellUV(CELL.base)], idx = [];
      s.r.forEach(([x, d]) => { pos.push(x, Y(d), Z(s.m)); uvs.push(...cellUV(CELL.base)); });
      for (let j = 0; j < s.r.length; j++) { const a = 1 + j, b = 1 + (j + 1) % s.r.length; idx.push(...(e ? [0, a, b] : [0, b, a])); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
      if ((g.attributes.normal.getZ(0) > 0) !== !!e) { const ix = g.index.array; for (let k = 0; k < ix.length; k += 3) { const q = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = q; } g.computeVertexNormals(); }
      parts.push(g);
    });
  }
  // the bridge pod: SHIPGEO.pod's chamfered outline, a low raised module on the spine's crown with a dark band
  {
    const sh = new THREE.Shape(); G.pod.forEach(([m, z], i) => { const px = X(z), pz = -Z(m); i ? sh.lineTo(px, pz) : sh.moveTo(px, pz); }); sh.closePath();
    const top = Y(-0.45), bot = Y(1.4), g = new THREE.ExtrudeGeometry(sh, { depth: top - bot - 0.3, steps: 6, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 2, curveSegments: 1 });
    g.rotateX(-Math.PI / 2); g.translate(0, bot, 0);
    const pg = stock(g, CELL.base), p = pg.attributes.position;
    for (let k = 0; k < p.count; k++) if (p.getY(k) < top - 0.5 && p.getY(k) > top - 1.0) pg.attributes.uv.setXY(k, ...cellUV(CELL.dark));
    parts.push(pg);
  }

  // ---------- the twin-rail arch, the turret deck and the dorsal turret ----------
  {
    const O = shipSpline(G.archOuter, 12), I = shipSpline(G.archInner, 12), NS = O.length, RR = lite ? 14 : 20;
    const railX = (m) => { const t = Math.max(0, Math.min(1, (m - 111) / 44)); return 7.5 - 8.2 * t * (1 - t); };
    [-1, 1].forEach((sd) => {
      const g = grid(NS, RR + 1, (i, j) => {
        const e = Math.abs(i / (NS - 1) * 2 - 1), hw = 0.9 + Math.pow(e, 3) * 1.5, mc = (O[i][0] + I[i][0]) / 2, dc = (O[i][1] + I[i][1]) / 2;
        const ax = (O[i][0] - I[i][0]) / 2, ad = (O[i][1] - I[i][1]) / 2, a = (j % RR) / RR * Math.PI * 2, ex = spow(Math.cos(a), 0.5), ey = spow(Math.sin(a), 0.5);
        return [sd * (railX(mc) + hw * ex), Y(dc + ad * ey), Z(mc + ax * ey)];
      }, (i, j) => ruv(R.arch, i / (NS - 1), j / RR));
      parts.push(finish(g, true));
    });
    // turret deck joining the rails at the crown (SHIPGEO.turretDeck), the turret on it, twin barrels forward
    const [m0, m1, dTop, dBot] = G.turretDeck, cz = Z((m0 + m1) / 2), cy = (Y(dTop) + Y(dBot)) / 2;
    parts.push(stock(RBOX(13.2, Math.abs(Y(dTop) - Y(dBot)), m1 - m0, 0.3), CELL.gun, M4(0, cy, cz)));
    parts.push(stock(RBOX(10.6, 0.1, 0.4, 0.04), CELL.dark, M4(0, cy - 0.2, Z(m0) - 0.12)));
    const tp = shipSpline(G.turret, 8).filter(([m]) => m <= 133.001).map(([m, d]) => new THREE.Vector2(Math.max(0, 133 - m), Y(d))).reverse();
    tp.sort((a, b) => a.y - b.y);
    const tg = new THREE.LatheGeometry(tp, lite ? 24 : 40); tg.translate(0, 0, cz);
    parts.push(finish(stock(tg, (u, v) => ruv(R.turret, u, 1 - v)), true));
    const [b0, b1, bd0, bd1] = G.barrels, by = (Y(bd0) + Y(bd1)) / 2, br = Math.abs(Y(bd0) - Y(bd1)) / 2;
    [-0.7, 0.7].forEach((x) => { parts.push(stock(CYL(br * 0.85, br, b1 - b0, 12), CELL.barrel, M4(x, by, Z((b0 + b1) / 2), Math.PI / 2, 0, 0)));
      parts.push(stock(CYL(br * 0.6, br * 0.6, 0.12, 10), CELL.slate, M4(x, by, Z(b0) - 0.03, Math.PI / 2, 0, 0))); });
  }

  // ---------- nacelles and their spars ----------
  const N = G.nacelle, NRF = shipFn(N.prof), NCY = Y(N.d), NRR = lite ? 18 : 28;
  const NP = (() => { const s = new Set(); shipSpline(N.prof, lite ? 3 : 5).forEach(([p]) => s.add(+p.toFixed(3))); for (let p = 6; p < 50; p += lite ? 6 : 3.5) s.add(p); return [...s].sort((a, b) => a - b); })();
  const nacPt = (sd, p, v, off) => { // v: 0 bottom, 0.25 inboard, 0.5 top, 0.75 outboard
    const r = NRF(p) + (off || 0), a = v * Math.PI * 2 - Math.PI / 2, ex = spow(Math.cos(a), 2 / 2.3), ey = spow(Math.sin(a), 2 / 2.3);
    return [sd * N.z - sd * r * ex, NCY + r * ey, Z(N.m0 + p)];
  };
  [-1, 1].forEach((sd) => parts.push(finish(grid(NP.length, NRR + 1, (i, j) => nacPt(sd, NP[i], (j % NRR) / NRR), (i, j) => ruv(R.nac, NP[i] / 65, j / NRR)), true)));
  {
    const [L0, T0, T1, L1] = G.spar, [PL0, PT0, PT1, PL1] = G.sparPlan, NSP = lite ? 8 : 14, SRR = lite ? 12 : 18;
    [-1, 1].forEach((sd) => {
      const at = (A, B, PA, PB, s) => new THREE.Vector3(sd * (PA[1] + (PB[1] - PA[1]) * s), Y(A[1] + (B[1] - A[1]) * s), Z(A[0] + (B[0] - A[0]) * s));
      const g = grid(NSP + 1, SRR + 1, (i, j) => {
        const s = -0.12 + 1.21 * i / NSP, le = at(L0, L1, PL0, PL1, s), te = at(T0, T1, PT0, PT1, s), mid = le.clone().add(te).multiplyScalar(0.5);
        const ch = te.clone().sub(le), c = ch.length() / 2; ch.normalize();
        const span = at(L0, L1, PL0, PL1, 1).sub(at(L0, L1, PL0, PL1, 0)).normalize(), th = new THREE.Vector3().crossVectors(ch, span).normalize();
        const a = (j % SRR) / SRR * Math.PI * 2, t = 0.78 - 0.26 * Math.max(0, Math.min(1, s)), ex = spow(Math.cos(a), 0.85), ey = spow(Math.sin(a), 0.75);
        return mid.addScaledVector(ch, c * ex).addScaledVector(th, t * ey).toArray();
      }, (i, j) => ruv(R.spar, i / NSP, j / SRR));
      parts.push(finish(g, true));
    });
  }

  // ---------- lettering: name and registry on thin decals that follow the hull ----------
  // decal(fn, region, na, nb): fn(a, b) gives a surface point for a in 0..1 across the text (left to right as
  // read) and b in 0..1 down it (top of the letters to the bottom); the decal sits 6 cm proud of the surface.
  function decal(fn, region, na, nb) {
    const P = [], uvs = [], idx = [], e = 0.002;
    for (let i = 0; i <= nb; i++) for (let j = 0; j <= na; j++) { const a = j / na, b = i / nb, p = new THREE.Vector3(...fn(a, b));
      const pa = new THREE.Vector3(...fn(Math.min(1, a + e), b)).sub(new THREE.Vector3(...fn(Math.max(0, a - e), b)));
      const pb = new THREE.Vector3(...fn(a, Math.min(1, b + e))).sub(new THREE.Vector3(...fn(a, Math.max(0, b - e))));
      const n = new THREE.Vector3().crossVectors(pb, pa).normalize(); P.push(p.addScaledVector(n, 0.06)); uvs.push(...ruv(region, a, b)); }
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
  // both flanks of the engineering section, below the window band, read bow to stern on port and stern to bow on starboard
  [-1, 1].forEach((sd) => {
    const side = (m0, len, d0, h) => (a, b) => { const m = sd < 0 ? m0 + a * len : m0 + len - a * len; return hullSidePt(m, d0 + b * h, sd) || hullSidePt(m, d0 + b * h * 0.5, sd); };
    { const h = 2.6, nl = h * NAME_AR, rl = h * REG_AR, gap = 5.9; // name first as read: forward on port, aft on starboard
      decal(side(sd < 0 ? 150 : 150 + rl + gap, nl, 23.2, h), R.name, 20, 3); decal(side(sd < 0 ? 150 + nl + gap : 150, rl, 23.2, h), R.reg, 12, 3); }
    // the registry, small, on each nacelle's outboard side
    { const h = 0.95, len = h * REG_AR, p0 = 38; decal((a, b) => { const p = sd < 0 ? p0 + a * len : p0 + len - a * len; return nacPt(sd, p, 0.75 + (b - 0.5) * h / (2 * Math.PI * NRF(p)), 0); }, R.reg, 10, 2); }
  });

  // ---------- paint ----------
  const cw = Math.round(AW * K), chh = Math.round(AH * K), ek = K * 0.5;
  const C = cnv(cw, chh), g = C.getContext('2d'), E = cnv(Math.round(AW * ek), Math.round(AH * ek)), ge = E.getContext('2d');
  g.scale(K, K); ge.scale(ek, ek); ge.fillStyle = '#000'; ge.fillRect(0, 0, AW, AH);
  const rnd = mulberry(4080);
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const rgb = (c, k, tb, tg) => `rgb(${Math.round(Math.min(255, c[0] * k))},${Math.round(Math.min(255, c[1] * k * (1 + (tg || 0))))},${Math.round(Math.min(255, c[2] * k * (1 + (tb || 0))))})`;
  const BASE = hex(HULL_PAINT.base);
  // plating: rows of plates in close shades of the base grey, some a touch bluer or greener, fine dark seams
  function plates(r, uPx, vPx, rowM, lenM) { // region, pixels per metre across and down, plate row height and length (m)
    const [x0, y0, w, h] = r; g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
    g.fillStyle = HULL_PAINT.base; g.fillRect(x0, y0, w, h);
    const seams = [];
    for (let y = 0, row = 0; y < h; row++) {
      const rh = rowM * (0.8 + rnd() * 0.45) * vPx;
      for (let x = -rnd() * lenM * uPx; x < w; ) {
        const len = lenM * (0.55 + rnd() * 0.9) * uPx, tall = rnd() < 0.14 ? 2 : 1, k = 1 + (rnd() - 0.5) * 0.07, tint = rnd();
        g.fillStyle = rgb(BASE, k, tint < 0.25 ? 0.022 : 0, tint > 0.8 ? 0.018 : 0); g.fillRect(x0 + x, y0 + y, len, rh * tall); seams.push([x0 + x, y0 + y, len, rh * tall]); x += len;
      }
      y += rh;
    }
    g.lineWidth = 1.1 / K;
    seams.forEach(([x, y, w2, h2]) => { g.strokeStyle = 'rgba(38,48,58,0.30)'; g.strokeRect(x + 0.5, y + 0.5, w2, h2); g.strokeStyle = 'rgba(255,255,255,0.10)'; g.strokeRect(x + 1.6, y + 1.6, w2 - 2, h2 - 2); });
    g.restore();
  }
  // hull region: u = m (20.5 px/m), v = arc length from the top centreline (shared by both sides)
  const HU = R.hull[2] / 200, HV = R.hull[3] / VMAX;
  plates(R.hull, HU, HV, 4.6, 11);
  const hx = (m) => R.hull[0] + m * HU, hy = (arc) => R.hull[1] + arc * HV;
  const strip = (fn, m0, m1, w, style, ctx) => { const c = ctx || g; c.beginPath(); let on = false;
    for (let m = m0; m <= m1 + 1e-6; m += 0.5) { const a = fn(m); if (a == null) { on = false; continue; } on ? c.lineTo(hx(m), hy(a)) : c.moveTo(hx(m), hy(a)); on = true; }
    c.strokeStyle = style; c.lineWidth = w * HV; c.stroke(); };
  const secAt = (() => { const cache = new Map(); return (m) => { const k = Math.round(m * 4) / 4; if (!cache.has(k)) { const S = hullSec(k); S.side = hullSide(S); cache.set(k, S); } return cache.get(k); }; })();
  const arcAtX = (S, x, upper) => { const s = S.side; let best = null; for (let i = 1; i < s.length; i++) { const [xa, , aa] = s[i - 1], [xb, , ab] = s[i]; const lo = Math.min(xa, xb), hi = Math.max(xa, xb);
    if (x >= lo && x <= hi && hi > lo) { const a = aa + (ab - aa) * (x - xa) / (xb - xa); if (upper ? (best === null || a < best) : (best === null || a > best)) best = a; } } return best; };
  // the window band at the widest line, darker, edged above and below by the slate pinstripe
  { g.fillStyle = HULL_PAINT.band; g.beginPath();
    for (let m = 0.5; m <= 199.5; m += 0.5) { const S = secAt(m), a = hullAtDepth(S, S.r0 - 0.05); g[m === 0.5 ? 'moveTo' : 'lineTo'](hx(m), hy(a ? a.arc : 0)); }
    for (let m = 199.5; m >= 0.5; m -= 0.5) { const S = secAt(m), a = hullAtDepth(S, S.r1 + 0.05); g.lineTo(hx(m), hy(a ? a.arc : 0)); }
    g.closePath(); g.fill();
    [(S) => S.r0 - 0.45, (S) => S.r1 + 0.45].forEach((f) => strip((m) => { const S = secAt(m), a = hullAtDepth(S, f(S)); return a && a.arc; }, 1, 199.5, 0.22, HULL_PAINT.slate)); }
  // dark sensor strips on the shoulders of the upper hull, and the lower sensor array under the bow
  strip((m) => { const S = secAt(m); return m > 36 && m < 116 ? arcAtX(S, S.w * 0.62, true) : null; }, 36, 116, 0.55, HULL_PAINT.dark);
  strip((m) => { const S = secAt(m); return m > 36 && m < 116 ? arcAtX(S, S.w * 0.64, true) : null; }, 38, 114, 0.12, HULL_PAINT.slate);
  strip((m) => { const S = secAt(m), a = hullAtDepth(S, Math.min(S.b - 0.3, 21.4)); return m > 13 && m < 30 && a ? a.arc : null; }, 13, 30, 0.9, HULL_PAINT.dark);
  strip((m) => { const S = secAt(m), a = arcAtX(S, 0.8, false); return m > 102 && m < 124 ? a : null; }, 102, 124, 1.6, HULL_PAINT.dark);
  // windows: a row per deck wherever a lived-in or command compartment meets a steep enough stretch of hull side
  G.rooms.forEach((rooms, i) => {
    const n = i + 1, dc = 3.5 * (n - 1) + 1.7; if (n < 3) return;
    rooms.forEach(([a, b, , , kind]) => {
      const lit = kind === 'l' || kind === 'w' ? 0.88 : kind === 's' ? 0.3 : -1; if (lit < 0) return;
      const row = [];
      for (let m = a + 1.4; m <= b - 1.2; m += 2.6) { const S = secAt(m), h = hullAtDepth(S, dc); if (!h || Math.abs(h.ny) > 0.62 || dc < S.t + 1 || dc > S.b - 1.2) continue; row.push([m, h.arc]); }
      if (!row.length) return;
      g.strokeStyle = 'rgba(120,130,136,0.45)'; g.lineWidth = 1.5 * HV; g.beginPath(); row.forEach(([m, arc], k) => g[k ? 'lineTo' : 'moveTo'](hx(m), hy(arc))); if (row.length === 1) g.lineTo(hx(row[0][0]) + 1, hy(row[0][1])); g.stroke();
      row.forEach(([m, arc]) => { const w2 = 0.62 * HU, h2 = 0.95 * HV, x = hx(m) - w2 / 2, y = hy(arc) - h2 / 2; g.fillStyle = HULL_PAINT.glass; g.fillRect(x, y, w2, h2);
        if (rnd() < lit) { ge.fillStyle = rnd() < 0.12 ? '#C9A878' : HULL_PAINT.window; ge.fillRect(x, y, w2, h2); } });
    });
  });
  // the navigational deflector on the lower prow
  { const draw = (c, fill) => { c.beginPath(); for (let k = 0; k <= 48; k++) { const t = k / 48 * Math.PI * 2, m = 6.4 + Math.cos(t) * 3.4, x = Math.abs(Math.sin(t)) * 4.6, S = secAt(m), a = arcAtX(S, Math.max(0.01, x), false);
      if (a != null) c[k ? 'lineTo' : 'moveTo'](hx(m), hy(a)); } c.closePath(); c.fillStyle = fill; c.fill(); };
    draw(g, '#2E4A5E'); draw(ge, HULL_PAINT.deflector); }
  // a hatch row for the escape pods (Deck 6, 104-124 m)
  for (let m = 105; m < 123; m += 3.2) { const S = secAt(m), h = hullAtDepth(S, 19.2); if (h) { g.fillStyle = HULL_PAINT.dark; g.fillRect(hx(m) - 0.7 * HU, hy(h.arc) - 0.7 * HV, 1.4 * HU, 1.4 * HV); } }

  // spine region: u = m - 50, v = arc from the starboard base over the top to the port base
  const SU = R.spine[2] / 48, SV = R.spine[3] / SVMAX, sx = (m) => R.spine[0] + (m - 50) * SU, sy = (arc) => R.spine[1] + arc * SV;
  plates(R.spine, SU, SV, 3.2, 7);
  const spineArc = (m, test) => { const r = spineRing(m); for (let i = 1; i < r.length; i++) { const f = test(r[i - 1], r[i]); if (f != null) return r[i - 1][2] + f * (r[i][2] - r[i - 1][2]); } return null; };
  const sideArc = (m, d, sd) => spineArc(m, (p, q) => (sd > 0 ? p[0] > 0 && q[0] > 0 : p[0] < 0 && q[0] < 0) && Math.abs(p[0] - q[0]) < 0.01 && (d - p[1]) * (d - q[1]) <= 0 && p[1] !== q[1] ? (d - p[1]) / (q[1] - p[1]) : null);
  const topArc = (m, x) => spineArc(m, (p, q) => (x - p[0]) * (x - q[0]) <= 0 && p[0] !== q[0] ? (x - p[0]) / (q[0] - p[0]) : null);
  // pinstripes along the spine's top edges and its foot
  [0.25, 0.75].forEach((k) => { g.beginPath(); SR.forEach((s, i) => { const a = s.r[k < 0.5 ? 1 + Math.round(SPN / 2) : 2 + SPN + Math.round(SPN / 2)][2]; g[i ? 'lineTo' : 'moveTo'](sx(s.m), sy(a)); }); g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 0.2 * SV; g.stroke(); });
  [1, -1].forEach((sd) => { g.beginPath(); SR.forEach((s, i) => { const a = sideArc(s.m, HT(s.m) - 0.35, sd); if (a != null) g[i ? 'lineTo' : 'moveTo'](sx(s.m), sy(a)); }); g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 0.2 * SV; g.stroke(); });
  // the long-range sensor pallet on the spine's sloping front
  { g.fillStyle = HULL_PAINT.dark; g.fillRect(sx(51.2), R.spine[1], (55.8 - 51.2) * SU, R.spine[3]); g.fillStyle = HULL_PAINT.slate; for (let m = 51.6; m < 55.6; m += 0.9) g.fillRect(sx(m), R.spine[1], 0.12 * SU, R.spine[3]); }
  // Deck 2's real viewports, lit: first officer to port; senior officers' cabins and the wardroom to starboard; the lounge aft
  const spineWin = (m0, m1, d0, d1, sd) => { for (let m = m0; m < m1; m += 0.25) { const a = sideArc(m + 0.125, d0, sd), b = sideArc(m + 0.125, d1, sd); if (a == null || b == null) continue;
    const y = Math.min(a, b), hh = Math.abs(b - a); g.fillStyle = HULL_PAINT.glass; g.fillRect(sx(m), sy(y), 0.25 * SU + 0.5, hh * SV); ge.fillStyle = HULL_PAINT.window; ge.fillRect(sx(m), sy(y), 0.25 * SU + 0.5, hh * SV); } };
  spineWin(73.4, 75.8, 4.8, 6.1, -1); spineWin(69.3, 71.5, 4.8, 6.1, 1); spineWin(75.7, 77.9, 4.8, 6.1, 1); spineWin(82.55, 87.05, 4.75, 6.05, 1);
  for (let m = 95.6; m < 97.4; m += 0.1) { const d = SP(m); if (d < 4.65 || d > 6.25) continue; const a = topArc(m, 5.2), b = topArc(m, -4.8); if (a == null || b == null) continue;
    g.fillStyle = HULL_PAINT.glass; g.fillRect(sx(m), sy(Math.min(a, b)), 0.1 * SU + 0.5, Math.abs(b - a) * SV); ge.fillStyle = HULL_PAINT.window; ge.fillRect(sx(m), sy(Math.min(a, b)), 0.1 * SU + 0.5, Math.abs(b - a) * SV); }

  // nacelle region: u = metres from the cap (23.6 px/m), v = round the nacelle from the bottom (0.25 inboard, 0.5 top)
  { const r = R.nac, U = r[2] / 65, V = r[3], nx = (p) => r[0] + p * U, ny = (v) => r[1] + v * V;
    plates(r, U, V / 16.3, 2.4, 6);
    g.fillStyle = '#B9663F'; g.fillRect(nx(0), r[1], 3.4 * U, V); ge.fillStyle = HULL_PAINT.cap; ge.fillRect(nx(0), r[1], 3.3 * U, V);
    g.fillStyle = HULL_PAINT.dark; g.fillRect(nx(3.4), r[1], 0.6 * U, V); g.fillRect(nx(57.5), r[1], 7.5 * U, V);
    g.fillStyle = HULL_PAINT.slate; g.fillRect(nx(4.6), ny(0.497), 52 * U, 0.006 * V); g.fillRect(nx(57), r[1], 0.25 * U, V);
    // the long blue grille down the inboard face, slatted
    g.fillStyle = '#2B4152'; g.fillRect(nx(7.2), ny(0.25 - 0.085), 47 * U, 0.17 * V); ge.fillStyle = HULL_PAINT.grille; ge.fillRect(nx(7.6), ny(0.25 - 0.07), 46.2 * U, 0.14 * V);
    g.fillStyle = 'rgba(20,30,40,0.55)'; ge.fillStyle = 'rgba(0,0,0,0.45)'; for (let p = 8; p < 54; p += 0.55) { g.fillRect(nx(p), ny(0.25 - 0.07), 0.12 * U, 0.14 * V); ge.fillRect(nx(p), ny(0.25 - 0.07), 0.12 * U, 0.14 * V); }
    g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 2; g.strokeRect(nx(7.2), ny(0.25 - 0.085), 47 * U, 0.17 * V);
    g.fillStyle = HULL_PAINT.dark; g.fillRect(nx(56), ny(0.75 - 0.04), 1.2 * U, 0.08 * V); }
  // arch rails: u along the rail, v round it (0 outboard, 0.25 outer edge, 0.5 inboard face, 0.75 underside)
  { const r = R.arch; plates(r, r[2] / 70, r[3] / 14, 2.4, 6);
    g.fillStyle = HULL_PAINT.dark; g.fillRect(r[0], r[1] + 0.4 * r[3], r[2], 0.2 * r[3]); g.fillStyle = '#8E979D'; g.fillRect(r[0], r[1] + 0.6 * r[3], r[2], 0.3 * r[3]);
    g.fillStyle = HULL_PAINT.slate; g.fillRect(r[0], r[1] + 0.245 * r[3], r[2], 0.012 * r[3]); }
  { const r = R.spar; plates(r, r[2] / 40, r[3] / 10, 2, 6); g.fillStyle = HULL_PAINT.slate; g.fillRect(r[0], r[1] + 0.497 * r[3], r[2], 0.01 * r[3]); g.fillRect(r[0], r[1], r[2], 0.01 * r[3]);
    g.fillStyle = HULL_PAINT.dark; g.fillRect(r[0] + r[2] * 0.93, r[1], r[2] * 0.07, r[3]); }
  { const r = R.turret; plates(r, r[2] / 20, r[3] / 6, 1.2, 3); g.fillStyle = HULL_PAINT.dark; g.fillRect(r[0], r[1] + r[3] * 0.84, r[2], r[3] * 0.16); g.fillStyle = HULL_PAINT.slate; g.fillRect(r[0], r[1] + r[3] * 0.82, r[2], r[3] * 0.025); }
  // the stern: shuttlebay doors low, impulse vents high
  { const r = R.stern, sx2 = (x) => r[0] + (0.5 + x / 24) * r[2], sy2 = (d) => r[1] + (d - 15) / 18 * r[3];
    plates(r, r[2] / 24, r[3] / 18, 2.4, 5);
    g.fillStyle = HULL_PAINT.band; g.fillRect(sx2(-6.2), sy2(23.6), 12.4 / 24 * r[2], 7.8 / 18 * r[3]); g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 3; g.strokeRect(sx2(-6.2), sy2(23.6), 12.4 / 24 * r[2], 7.8 / 18 * r[3]);
    g.beginPath(); g.moveTo(sx2(0), sy2(23.6)); g.lineTo(sx2(0), sy2(31.4)); g.stroke();
    [-1, 1].forEach((sd) => { const x0 = sx2(sd < 0 ? -7.2 : 1.0), w2 = 6.2 / 24 * r[2], y = sy2(18.0), h2 = 1.5 / 18 * r[3];
      g.fillStyle = '#5A2C25'; g.fillRect(x0, y, w2, h2); ge.fillStyle = HULL_PAINT.impulse; ge.fillRect(x0, y, w2, h2); g.strokeStyle = HULL_PAINT.slate; g.strokeRect(x0, y, w2, h2); }); }
  // solid cells for small parts, with their glow
  { const cols = [HULL_PAINT.base, HULL_PAINT.dark, HULL_PAINT.slate, HULL_PAINT.glass, '#2E4A5E', '#5A2C25', '#2B4152', '#B9663F', '#8D969C', '#4A525A', HULL_PAINT.letter, '#FFFFFF'];
    const glow = { 4: HULL_PAINT.deflector, 5: HULL_PAINT.impulse, 6: HULL_PAINT.grille, 7: HULL_PAINT.cap, 11: '#FFFFFF' }, c = R.cells, s = c[2] / 4;
    cols.forEach((col, k) => { const x = c[0] + (k % 4) * s, y = c[1] + ((k / 4) | 0) * s; g.fillStyle = col; g.fillRect(x, y, s, s); if (glow[k]) { ge.fillStyle = glow[k]; ge.fillRect(x, y, s, s); } }); }
  // lettering: Antonio, the ship's own font, in dark grey; drawn once the font file is in (transparent elsewhere)
  const map = tex(C), emap = tex(E);
  [map, emap].forEach((t) => { t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; });
  function letter(font) {
    [[R.name, 'USS DEFIANCE'], [R.reg, 'EV-0408']].forEach(([r, txt]) => {
      g.clearRect(r[0], r[1], r[2], r[3]); g.save(); g.fillStyle = HULL_PAINT.letter; g.font = `600 100px ${font}`; g.textBaseline = 'alphabetic';
      const sp = 9, wd = g.measureText(txt).width + sp * (txt.length - 1), cap = 0.78 * r[3], k = cap / 88, sxk = Math.min(1, (r[2] * 0.94) / (wd * k));
      g.translate(r[0] + r[2] / 2, r[1] + r[3] / 2 + cap / 2); g.scale(k * sxk, k); let x = -wd / 2;
      for (const ch of txt) { g.fillText(ch, x, 0); x += g.measureText(ch).width + sp; }
      g.restore(); });
    map.needsUpdate = true;
  }
  letter(DISP);
  if (typeof FontFace !== 'undefined') new FontFace('AntonioHull', 'url(fonts/antonio-600.woff)', { weight: '600' }).load().then((f) => { document.fonts.add(f); letter('AntonioHull'); }).catch(() => {});

  // ---------- material: the hull's own light ----------
  const uniforms = { map: { value: map }, emap: { value: emap }, sunDir: { value: (opts.sun || HULL_SUN).clone() }, sunCol: { value: new THREE.Color(1.0, 0.96, 0.9).multiplyScalar(1.15) },
    sky: { value: new THREE.Color(0.3, 0.34, 0.4) }, ground: { value: new THREE.Color(0.09, 0.09, 0.11) }, glow: { value: opts.glow || 2.4 } };
  const paint = new THREE.ShaderMaterial({ uniforms, fog: false,
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vW;
void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D map; uniform sampler2D emap; uniform vec3 sunDir; uniform vec3 sunCol; uniform vec3 sky; uniform vec3 ground; uniform float glow;
varying vec2 vUv; varying vec3 vN; varying vec3 vW;
void main() {
  vec4 t = texture2D(map, vUv); if (t.a < 0.5) discard;
  vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N; vec3 V = normalize(cameraPosition - vW);
  float nl = dot(N, sunDir), dif = max(nl, 0.0) * 0.9 + max(nl + 0.25, 0.0) * 0.08;
  vec3 fill = mix(ground, sky, N.y * 0.5 + 0.5);
  float lum = dot(t.rgb, vec3(0.3, 0.55, 0.15)), sheen = clamp(1.0 + (lum - 0.6) * 6.0, 0.4, 1.8);
  vec3 H = normalize(sunDir + V); float sp = pow(max(dot(N, H), 0.0), 60.0) * 0.32 * sheen * smoothstep(0.0, 0.15, nl);
  float fr = pow(1.0 - max(dot(N, V), 0.0), 5.0); vec3 R = reflect(-V, N);
  vec3 env = mix(ground, sky * 1.8, R.y * 0.5 + 0.5) * (0.05 + 0.35 * fr) * sheen;
  vec3 col = t.rgb * (sunCol * dif + fill) + sunCol * sp + env + texture2D(emap, vUv).rgb * glow;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}` });
  const decalPaint = paint.clone(); decalPaint.uniforms = uniforms; Object.assign(decalPaint, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });

  // ---------- assemble: one mesh for the ship, one for the lettering, small glows for the running lights ----------
  function merge(list) {
    let nv = 0; const pos = [], nor = [], uvs = [], idx = [];
    list.forEach((q) => { const p = q.attributes.position, n = q.attributes.normal, u = q.attributes.uv;
      for (let k = 0; k < p.count; k++) { pos.push(p.getX(k), p.getY(k), p.getZ(k)); nor.push(n.getX(k), n.getY(k), n.getZ(k)); uvs.push(u.getX(k), u.getY(k)); }
      const ix = q.index.array; for (let k = 0; k < ix.length; k++) idx.push(ix[k] + nv); nv += p.count; q.dispose(); });
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g2.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g2.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g2.setIndex(nv > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1)); g2.computeBoundingSphere(); return g2;
  }
  const root = new THREE.Group(); root.name = 'Exterior';
  const ship = new THREE.Mesh(merge(parts), paint); ship.name = 'Exterior hull'; root.add(ship);
  const lettering = new THREE.Mesh(merge(decals), decalPaint); lettering.name = 'Exterior lettering'; lettering.renderOrder = 1; root.add(lettering);
  // running lights: red to port and green to starboard at the widest beam and on each nacelle's outboard side
  { const halo = (() => { const c = cnv(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return tex(c); })();
    const lights = new THREE.Group(); lights.name = 'Running lights'; root.add(lights); root.userData.runningLights = lights;
    const S = secAt(78);
    [[-1, 0xff4636], [1, 0x48ff74]].forEach(([sd, col]) => {
      [[sd * (S.w + 0.15), Y((S.r0 + S.r1) / 2), Z(78)], nacPt(sd, 6, 0.75, 0.12)].forEach((p) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
        s.position.set(...p); s.scale.setScalar(2.4); lights.add(s);
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshBasicMaterial({ color: col, toneMapped: false, fog: false })); b.position.set(...p); lights.add(b); });
    }); }
  root.traverse((o) => { o.userData.noPick = true; });
  root.userData.triangles = (ship.geometry.index.count + lettering.geometry.index.count) / 3;
  root.userData.paint = paint;
  return root;
}
