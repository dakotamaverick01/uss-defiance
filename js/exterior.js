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
  const SP = shipFn(G.spine);
  const SAU = G.saucer, ROLL = G.rollbar, POD = G.wpod;
  const rnd = mulberry(4080);

  // ---------- atlas layout (pixels at full size) ----------
  const AW = 4096, AH = 2560;
  const R = {
    hull: [0, 0, 4096, 2048], nac: [0, 2048, 1536, 384], spine: [1536, 2048, 768, 512], arch: [2304, 2048, 1024, 256],
    spar: [3328, 2048, 512, 256], turret: [3840, 2048, 256, 256], stern: [2304, 2304, 512, 256],
    name: [2816, 2304, 768, 128], reg: [2816, 2432, 512, 128], rcs: [3328, 2432, 256, 128], defl: [3584, 2304, 256, 256],
    cells: [3840, 2304, 256, 256], launch: [0, 2432, 256, 128],
  };
  // uv in a region: (a, b) in 0..1 across the region (b = 0 at the region's top row in the canvas)
  const ruv = (r, a, b) => [(r[0] + a * r[2]) / AW, 1 - (r[1] + b * r[3]) / AH];
  const CELL = { base: 0, dark: 1, slate: 2, glass: 3, deflector: 4, impulse: 5, grille: 6, cap: 7, gun: 8, ring: 9, barrel: 10, light: 11, dome: 12, oxide: 13 };
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
  const NJ = lite ? 30 : 52;
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
    const N = lite ? 64 : 104; for (let i = 0; i <= N; i++) { const q = i / N; s.add(+(7 + 190 * (0.72 * q + 0.28 * (0.5 - 0.5 * Math.cos(Math.PI * q)))).toFixed(3)); }
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
    // the stern: a rounded transom closing the last section
    const S = HS[HS.length - 1], pos = [0, Y((S.t + S.b) / 2), Z(S.m) + 0.6], uvs = [...ruv(R.stern, 0.5, ((S.t + S.b) / 2 - 15) / 18)], idx = [];
    for (let j = 0; j < RING; j++) { const [x, d] = ringPt(S, j); pos.push(x, Y(d), Z(S.m)); uvs.push(...ruv(R.stern, 0.5 + x / 24, (d - 15) / 18)); idx.push(0, 1 + j, 1 + (j + 1) % RING); }
    const t = new THREE.BufferGeometry(); t.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); t.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); t.setIndex(idx);
    t.computeVertexNormals(); if (t.attributes.normal.getZ(0) < 0) { flip(t); t.computeVertexNormals(); }
    parts.push(t);
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

  // ---------- the officers' spine (Decks 1-2) and the bridge pod ----------
  // A faired superstructure: sides sloping in toward a rounded crown, a soft fillet into the saucer, the plan tapering at
  // both ends. It encloses every Deck 1-2 room (they span x -7.2..6.2) and faces outward only, so from inside a room it
  // is not drawn and every window looks straight out.
  const SXC = -0.5, SX0 = -12.2, SX1 = 11.2; // centre line of the rooms; outer edges of the fillet (for paint)
  const SPM = (() => { const s = new Set(); const seg = (a, b, n) => { for (let i = 0; i <= n; i++) s.add(+(a + (b - a) * i / n).toFixed(3)); };
    seg(50, 62, lite ? 10 : 18); seg(62, 77, 5); seg(77, 83, lite ? 5 : 8); seg(83, 94.5, 5); seg(94.5, 98, lite ? 6 : 10); return [...s].sort((a, b) => a - b); })();
  const SPN = lite ? 6 : 9, SPS = lite ? 6 : 9; // points on each rounded crown corner and down each side
  function spineRing(m) { // starboard foot, up the side, over the crown, down to the port foot: [x, d, arc]
    const f = smooth01(49.5, 57.5, m) * 0.45 + 0.55 - smooth01(91, 98, m) * 0.18, yt = Y(SP(m)) + 0.6, yb = Y(HT(m)) - 1.0;
    const wt = 7.8 * f, wb = 9.4 * f, rc = Math.max(0.05, Math.min(1.4, 0.3 * (yt - yb))), ys = yt - rc, out = [];
    const sideX = (y) => { const k = Math.max(0, Math.min(1, (ys - y) / Math.max(0.01, ys - yb))), fl = Math.max(0, 1 - (y - yb) / 1.8); return wt - rc + rc + (wb - wt) * Math.pow(k, 1.6) + 2.0 * fl * fl; };
    for (let k = 0; k <= SPS; k++) { const y = yb + (ys - yb) * k / SPS; out.push([SXC + sideX(y), 7 - y]); }
    for (let k = 1; k <= SPN; k++) { const a = (Math.PI / 2) * k / SPN; out.push([SXC + wt - rc + rc * Math.cos(a), 7 - (ys + rc * Math.sin(a))]); }
    for (let k = 0; k <= SPN - 1; k++) { const a = (Math.PI / 2) * (1 - k / SPN); out.push([SXC - (wt - rc + rc * Math.cos(a)), 7 - (ys + rc * Math.sin(a))]); }
    for (let k = SPS; k >= 0; k--) { const y = yb + (ys - yb) * k / SPS; out.push([SXC - sideX(y), 7 - y]); }
    let a = 0; out[0].push(0); for (let i = 1; i < out.length; i++) { a += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); out[i].push(a); }
    return out;
  }
  const SR = SPM.map((m) => ({ m, r: spineRing(m) })), SVMAX = Math.max(...SR.map((s) => s.r[s.r.length - 1][2])) * 1.002;
  {
    parts.push(finish(grid(SR.length, SR[0].r.length, (i, j) => { const [x, d] = SR[i].r[j]; return [x, Y(d), Z(SR[i].m)]; },
      (i, j) => ruv(R.spine, (SR[i].m - 50) / 48, SR[i].r[j][2] / SVMAX))));
    [SR[0], SR[SR.length - 1]].forEach((s, e) => parts.push(cap(s.r.map(([x, d]) => [x, Y(d), Z(s.m)]), cellUV(CELL.gun), [0, 0, e ? 1 : -1])));
  }
  // the bridge pod: SHIPGEO.pod's chamfered outline, a low raised module on the spine's crown with a dark band, and a dome
  {
    const sh = new THREE.Shape(); G.pod.forEach(([m, z], i) => { const px = X(z), pz = -Z(m); i ? sh.lineTo(px, pz) : sh.moveTo(px, pz); }); sh.closePath();
    const top = Y(-0.45) + 0.6, bot = Y(1.4) + 0.6, g = new THREE.ExtrudeGeometry(sh, { depth: top - bot - 0.3, steps: 6, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 2, curveSegments: 1 });
    g.rotateX(-Math.PI / 2); g.translate(0, bot, 0);
    const pg = stock(g, CELL.gun), p = pg.attributes.position;
    for (let k = 0; k < p.count; k++) if (p.getY(k) < top - 0.5 && p.getY(k) > top - 1.0) pg.attributes.uv.setXY(k, ...cellUV(CELL.slate));
    parts.push(pg);
    const pm = (G.pod[0][0] + G.pod[4][0]) / 2;
    parts.push(stock(new THREE.SphereGeometry(1.5, lite ? 12 : 20, lite ? 6 : 10, 0, Math.PI * 2, 0, Math.PI / 2), CELL.dome, M4(0, top - 0.05, Z(pm) + 1, 0, 0, 0, [1, 0.45, 1])));
  }

  // ---------- the rollbar and the weapons pod with its torpedo launchers ----------
  // A swept bar rising from the saucer's aft shoulders and arching over the engineering body (shipRoll), its crown
  // carrying a lozenge-shaped pod (shipPodAt) with two launchers firing forward and one aft.
  {
    const RS = lite ? 36 : 64, RR = lite ? 14 : 20, P3 = (s) => { const r = shipRoll(s); return new THREE.Vector3(r.out, Y(r.d), Z(r.m)); };
    [-1, 1].forEach((sd) => parts.push(finish(grid(RS + 1, RR + 1, (i, j) => {
      const s = sd * (i / RS) * 1.04, r = shipRoll(s), p = P3(s), tg = P3(s + 0.004 * sd).sub(P3(s - 0.004 * sd)).normalize();
      const fw = new THREE.Vector3(0, 0, -1).addScaledVector(tg, tg.z).normalize(), th = new THREE.Vector3().crossVectors(tg, fw).normalize(), a = (j % RR) / RR * Math.PI * 2;
      return p.addScaledVector(fw, r.chord * spow(Math.cos(a), 0.8)).addScaledVector(th, r.thick * spow(Math.sin(a), 0.7)).toArray();
    }, (i, j) => ruv(R.arch, 0.5 + 0.5 * i / RS, j / RR)), true)));
    const PN = lite ? 26 : 48, PR = lite ? 18 : 30;
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
  const N = G.nacelle, NRF = shipFn(N.prof), NL0 = N.prof[N.prof.length - 1][0], NCY = Y(N.d), NRR = lite ? 32 : 46;
  const NP = (() => { const s = new Set(); shipSpline(N.prof, lite ? 3 : 5).forEach(([p]) => s.add(+p.toFixed(3))); for (let p = 6; p < NL0 - 8; p += lite ? 5 : 2.5) s.add(p); return [...s].sort((a, b) => a - b); })();
  const nacLen = (p) => smooth01(4, 9, p) * (1 - smooth01(NL0 - 16, NL0 - 8, p));
  const nacPt = (sd, p, v, off) => { // v: 0 bottom, 0.25 inboard, 0.5 top, 0.75 outboard
    const r = NRF(p), a = v * Math.PI * 2 - Math.PI / 2, ex = spow(Math.cos(a), 2 / N.n), ey = spow(Math.sin(a), 2 / N.n), L = nacLen(p);
    const dv = (x, c, w) => { const q = (x - c) / w; return Math.exp(-q * q); };
    const k = 1 + 0.045 * L * dv(v, 0.5, 0.035) - 0.06 * L * dv(v, 0.25, 0.06) + (off || 0) / Math.max(r, 0.1);
    return [sd * N.z - sd * r * N.w * ex * k, NCY + r * ey * k, Z(N.m0 + p)];
  };
  [-1, 1].forEach((sd) => parts.push(finish(grid(NP.length, NRR + 1, (i, j) => nacPt(sd, NP[i], (j % NRR) / NRR), (i, j) => ruv(R.nac, NP[i] / NL0, j / NRR)), true)));
  {
    const NSP = lite ? 8 : 14, SRR = lite ? 14 : 22;
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
    const bot = hullBot(64, 0.01); parts.push(stock(new THREE.SphereGeometry(3.0, lite ? 14 : 24, lite ? 6 : 10, 0, Math.PI * 2, 0, Math.PI / 2), CELL.dome, M4(0, bot[1] + 0.5, bot[2], Math.PI, 0, 0, [1, 0.5, 1.3])));
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
  // panel patchwork: large zones of one tone family split into smaller plates, each a touch lighter or darker
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
      const hv = 180 + (rnd() - 0.5) * 50; h.fillStyle = css([hv, hv, hv]); h.fillRect(px, py, pw, ph);
      // a soft inner gradient gives each plate a little curvature in the light
      if (pw > 6 && ph > 6) { const gr = g.createLinearGradient(px, py, px, py + ph); gr.addColorStop(0, 'rgba(255,255,255,0.035)'); gr.addColorStop(1, 'rgba(0,0,0,0.05)'); g.fillStyle = gr; g.fillRect(px, py, pw, ph); }
      // now and then a hatch or access panel inset in the plate
      if (area > 6 && rnd() < 0.07) { const iw = Math.min(pw * 0.5, 1.6 * uPx), ih = Math.min(ph * 0.5, 1.2 * vPx), ix = px + (pw - iw) * rnd(), iy = py + (ph - ih) * rnd();
        g.strokeStyle = 'rgba(14,18,20,0.55)'; g.lineWidth = lw; g.strokeRect(ix, iy, iw, ih); h.strokeStyle = 'rgb(120,120,120)'; h.lineWidth = 1.4 * lw; h.strokeRect(ix, iy, iw, ih); }
    });
    // panel lines: dark grooves, with a faint lit lip on one side
    leaves.forEach(([x, y, w, hh]) => { const px = x0 + x * uPx, py = y0 + y * vPx, pw = w * uPx, ph = hh * vPx;
      g.strokeStyle = lite ? 'rgba(12,15,17,0.38)' : 'rgba(12,15,17,0.5)'; g.lineWidth = lw; g.strokeRect(px, py, pw, ph);
      g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = lw; g.beginPath(); g.moveTo(px + 1.5 * lw, py + ph - 1.5 * lw); g.lineTo(px + 1.5 * lw, py + 1.5 * lw); g.lineTo(px + pw - 1.5 * lw, py + 1.5 * lw); g.stroke();
      h.strokeStyle = 'rgb(70,70,70)'; h.lineWidth = 1.8 * lw; h.strokeRect(px, py, pw, ph); });
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

  panels(R.hull, HU, HV, 24, 2.8, { red: 0.004 });
  streaks(R.hull, HU, HV, lite ? 420 : 700);
  // shading by place: the underside and the lower flanks a little darker; contact shadow where the spine, arch and spars meet the hull
  for (let m = 0; m < 200; m += 1) { const S = secAt(m + 0.5), a = hullAtDepth(S, S.r1); if (!a) continue; const y0 = hy(a.arc), y1 = hy(S.side[S.side.length - 1][2]);
    const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(6,9,10,0.28)'); g.fillStyle = gr; g.fillRect(hx(m), y0, HU + 0.5, y1 - y0); }
  [SX0, SX1].forEach((sx) => { for (let m = 50; m < 98; m += 0.5) { const S = secAt(m), a = arcAtX(S, Math.abs(sx), true); if (a == null) continue; const gr = g.createLinearGradient(0, hy(a), 0, hy(a + 3.2)); gr.addColorStop(0, 'rgba(5,7,8,0.45)'); gr.addColorStop(1, 'rgba(5,7,8,0)'); g.fillStyle = gr; g.fillRect(hx(m), hy(a), 0.5 * HU + 0.5, 3.2 * HV); } });
  // the window band at the widest line: near-black, edged with slate pinstripes and a bright lip above
  { const r0 = (m) => arcAtD(m, secAt(m).r0 - 0.05), r1 = (m) => arcAtD(m, secAt(m).r1 + 0.05);
    band(g, r0, r1, 0.5, 199.5, HULL_PAINT.band); band(h, r0, r1, 0.5, 199.5, 'rgb(130,130,130)');
    line(g, (m) => arcAtD(m, secAt(m).r0 - 0.5), 1, 199.5, 0.32, HULL_PAINT.slate); line(g, (m) => arcAtD(m, secAt(m).r1 + 0.5), 1, 199.5, 0.32, HULL_PAINT.slate);
    line(g, (m) => arcAtD(m, secAt(m).r0 - 0.85), 1, 199.5, 0.14, 'rgba(210,218,220,0.35)'); }
  // dark sensor strips on the shoulders of the upper hull, the lower sensor array under the bow, the ventral array aft
  { const sh = (k) => (m) => { const S = secAt(m); return arcAtX(S, S.w * k, true); };
    line(g, sh(0.62), 36, 116, 0.7, HULL_PAINT.dark); line(h, sh(0.62), 36, 116, 0.7, 'rgb(120,120,120)'); line(g, sh(0.62), 37, 115, 0.16, 'rgba(111,182,230,0.35)'); line(ge, sh(0.62), 37, 115, 0.16, 'rgba(70,120,160,0.5)');
    line(g, (m) => arcAtD(m, Math.min(secAt(m).b - 0.3, 21.4)), 13, 30, 1.1, HULL_PAINT.dark);
    line(g, (m) => arcAtX(secAt(m), 0.8, false), 102, 124, 1.8, HULL_PAINT.dark); line(h, (m) => arcAtX(secAt(m), 0.8, false), 102, 124, 1.8, 'rgb(110,110,110)'); }
  // windows: a black band per deck wherever a lived-in or command compartment meets a steep enough stretch of hull side
  G.rooms.forEach((rooms, i) => {
    const n = i + 1, dc = 3.5 * (n - 1) + 1.7; if (n < 3) return;
    rooms.forEach(([a, b, , , kind]) => {
      const lit = kind === 'l' || kind === 'w' ? 0.82 : kind === 's' ? 0.3 : -1; if (lit < 0) return;
      const row = [];
      for (let m = a + 1.2; m <= b - 1.0; m += 2.2) { const S = secAt(m), hh = hullAtDepth(S, dc); if (!hh || Math.abs(hh.ny) > 0.62 || dc < S.t + 1 || dc > S.b - 1.2) continue; row.push([m, hh.arc]); }
      if (!row.length) return;
      const f = (m) => { let best = null, bd = 9; row.forEach(([mm, arc]) => { if (Math.abs(mm - m) < bd) { bd = Math.abs(mm - m); best = arc; } }); return best; };
      band(g, (m) => { const q = f(m); return q == null ? null : q - 0.75; }, (m) => { const q = f(m); return q == null ? null : q + 0.75; }, row[0][0] - 1, row[row.length - 1][0] + 1, 'rgba(22,26,28,0.88)');
      row.forEach(([m, arc]) => { const w2 = 0.75 * HU, h2 = 0.9 * HV, x = hx(m) - w2 / 2, y = hy(arc) - h2 / 2; g.fillStyle = HULL_PAINT.glass; g.fillRect(x, y, w2, h2);
        h.fillStyle = 'rgb(95,95,95)'; h.fillRect(x, y, w2, h2);
        if (rnd() < lit) { const c = rnd(); ge.fillStyle = c < 0.12 ? '#B89468' : c < 0.22 ? HULL_PAINT.cool : HULL_PAINT.window; ge.fillRect(x, y, w2, h2); g.fillStyle = 'rgba(255,200,140,0.3)'; g.fillRect(x, y, w2, h2); } });
    });
  });
  // escape pod hatches (Deck 6, 104-124 m) with oxide-red rims; a deflector housing around the dish
  for (let m = 105; m < 123; m += 3.0) { const a = arcAtD(m, 19.4); if (a == null) continue; const x = hx(m) - 0.8 * HU, y = hy(a) - 0.8 * HV;
    g.fillStyle = HULL_PAINT.dark; g.fillRect(x, y, 1.6 * HU, 1.6 * HV); g.strokeStyle = HULL_PAINT.oxide; g.lineWidth = 2.5 * lw; g.strokeRect(x, y, 1.6 * HU, 1.6 * HV); h.fillStyle = 'rgb(140,140,140)'; h.fillRect(x, y, 1.6 * HU, 1.6 * HV); }
  grainOver(R.hull, lite ? 0.18 : 0.25);

  // spine region: u = m - 50, v = arc from the starboard base over the top to the port base
  const SU = R.spine[2] / 48, SV = R.spine[3] / SVMAX, sx = (m) => R.spine[0] + (m - 50) * SU, sy = (arc) => R.spine[1] + arc * SV;
  panels(R.spine, SU, SV, 10, 1.8, { red: 0.012 }); streaks(R.spine, SU, SV, 80);
  const spineArc = (m, test) => { const r = spineRing(m); for (let i = 1; i < r.length; i++) { const f = test(r[i - 1], r[i]); if (f != null) return r[i - 1][2] + f * (r[i][2] - r[i - 1][2]); } return null; };
  const sideArc = (m, d, sd) => spineArc(m, (p, q) => (sd > 0 ? p[0] > 2 && q[0] > 2 : p[0] < -3 && q[0] < -3) && (d - p[1]) * (d - q[1]) <= 0 && p[1] !== q[1] ? (d - p[1]) / (q[1] - p[1]) : null);
  const topArc = (m, x) => spineArc(m, (p, q) => (x - p[0]) * (x - q[0]) <= 0 && p[0] !== q[0] ? (x - p[0]) / (q[0] - p[0]) : null);
  // pinstripes along the spine's top edges and a dark skirt at its foot
  [0.25, 0.75].forEach((k) => { g.beginPath(); SR.forEach((s, i) => { const a = s.r[k < 0.5 ? 1 + Math.round(SPN / 2) : 2 + SPN + Math.round(SPN / 2)][2]; g[i ? 'lineTo' : 'moveTo'](sx(s.m), sy(a)); }); g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 0.28 * SV; g.stroke(); });
  [1, -1].forEach((sd) => { g.beginPath(); let first = true; SR.forEach((s) => { const a = sideArc(s.m, HT(s.m) - 0.6, sd); if (a != null) { g[first ? 'moveTo' : 'lineTo'](sx(s.m), sy(a)); first = false; } }); g.strokeStyle = HULL_PAINT.band; g.lineWidth = 0.9 * SV; g.stroke(); });
  // the long-range sensor pallet on the spine's sloping front
  { g.fillStyle = HULL_PAINT.band; g.fillRect(sx(51.2), R.spine[1], (55.8 - 51.2) * SU, R.spine[3]); ge.fillStyle = 'rgba(60,110,150,0.6)'; for (let m = 51.6; m < 55.6; m += 0.9) { g.fillStyle = HULL_PAINT.slate; g.fillRect(sx(m), R.spine[1], 0.12 * SU, R.spine[3]); ge.fillRect(sx(m + 0.4), R.spine[1], 0.08 * SU, R.spine[3]); } }
  // Deck 2's real viewports, lit: first officer to port; senior officers' cabins and the wardroom to starboard; the lounge aft
  const spineWin = (m0, m1, d0, d1, sd) => { for (let m = m0; m < m1; m += 0.25) { const a = sideArc(m + 0.125, d0, sd), b = sideArc(m + 0.125, d1, sd); if (a == null || b == null) continue;
    const y = Math.min(a, b), hh = Math.abs(b - a); g.fillStyle = HULL_PAINT.glass; g.fillRect(sx(m), sy(y), 0.25 * SU + 0.5, hh * SV); ge.fillStyle = HULL_PAINT.window; ge.fillRect(sx(m), sy(y), 0.25 * SU + 0.5, hh * SV); } };
  spineWin(73.4, 75.8, 4.8, 6.1, -1); spineWin(69.3, 71.5, 4.8, 6.1, 1); spineWin(75.7, 77.9, 4.8, 6.1, 1); spineWin(82.55, 87.05, 4.75, 6.05, 1);
  for (let m = 95.6; m < 97.4; m += 0.1) { const d = SP(m); if (d < 4.65 || d > 6.25) continue; const a = topArc(m, 5.2), b = topArc(m, -4.8); if (a == null || b == null) continue;
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
    g.fillStyle = HULL_PAINT.band; g.fillRect(sx2(-6.2), sy2(23.6), 12.4 / 24 * r[2], 7.8 / 18 * r[3]); g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 3; g.strokeRect(sx2(-6.2), sy2(23.6), 12.4 / 24 * r[2], 7.8 / 18 * r[3]);
    g.fillStyle = 'rgba(255,200,140,0.25)'; for (let x = -5.6; x < 5.8; x += 1.1) g.fillRect(sx2(x), sy2(30.9), 0.4 / 24 * r[2], 0.25 / 18 * r[3]);
    g.beginPath(); g.moveTo(sx2(0), sy2(23.6)); g.lineTo(sx2(0), sy2(31.4)); g.stroke();
    [-1, 1].forEach((sd) => { const x0 = sx2(sd < 0 ? -7.4 : 0.9), w2 = 6.5 / 24 * r[2], y = sy2(17.8), h2 = 1.8 / 18 * r[3];
      g.fillStyle = '#5A2C25'; g.fillRect(x0, y, w2, h2); ge.fillStyle = HULL_PAINT.impulse; ge.fillRect(x0, y, w2, h2); ge.fillStyle = 'rgba(0,0,0,0.4)'; for (let k = 1; k < 8; k++) ge.fillRect(x0 + w2 * k / 8, y, 2, h2);
      g.strokeStyle = HULL_PAINT.slate; g.strokeRect(x0, y, w2, h2); }); }
  // thruster blocks: oxide red with dark vent slots
  { const r = R.rcs; g.fillStyle = HULL_PAINT.oxide; g.fillRect(...r); g.fillStyle = HULL_PAINT.band; for (let k = 0; k < 6; k++) g.fillRect(r[0] + r[2] * (0.15 + k * 0.12), r[1] + r[3] * 0.3, r[2] * 0.06, r[3] * 0.4);
    g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 3; g.strokeRect(r[0] + 3, r[1] + 3, r[2] - 6, r[3] - 6); }
  // solid cells for small parts, with their glow
  { const cols = ['#80878A', HULL_PAINT.dark, HULL_PAINT.slate, HULL_PAINT.glass, '#2E4A5E', '#5A2C25', '#20303C', '#A9563A', '#6E7578', '#3A4044', '#2A2F33', '#FFFFFF', '#1C2830', HULL_PAINT.oxide, '#80878A', '#80878A'];
    const glow = { 4: HULL_PAINT.deflector, 5: HULL_PAINT.impulse, 6: HULL_PAINT.grille, 7: HULL_PAINT.cap, 11: '#FFFFFF', 12: '#1E3C52' }, c = R.cells, s = c[2] / 4;
    cols.forEach((col, k) => { const x = c[0] + (k % 4) * s, y = c[1] + ((k / 4) | 0) * s; g.fillStyle = col; g.fillRect(x, y, s, s); if (glow[k]) { ge.fillStyle = glow[k]; ge.fillRect(x, y, s, s); } }); }

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
  function letter(font) {
    [[R.name, 'USS DEFIANCE'], [R.reg, 'EV-0408']].forEach(([r, txt]) => {
      g.clearRect(r[0], r[1], r[2], r[3]); g.save(); g.fillStyle = HULL_PAINT.letter; g.font = `600 100px ${font}`; g.textBaseline = 'alphabetic';
      const sp = 9, wd = g.measureText(txt).width + sp * (txt.length - 1), capH = 0.78 * r[3], k = capH / 88, sxk = Math.min(1, (r[2] * 0.94) / (wd * k));
      g.translate(r[0] + r[2] / 2, r[1] + r[3] / 2 + capH / 2); g.scale(k * sxk, k); let x = -wd / 2;
      for (const ch of txt) { g.fillText(ch, x, 0); x += g.measureText(ch).width + sp; }
      g.restore(); });
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
  };
  const paint = new THREE.ShaderMaterial({ uniforms, fog: false,
    vertexShader: `uniform mat4 shadowMtx; varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying vec3 vP; varying vec4 vS;
void main() { vUv = uv; vP = position; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
  vS = shadowMtx * vec4(position + normal * 0.22, 1.0); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D map; uniform sampler2D emap; uniform sampler2D shadowMap; uniform float shadowOn; uniform float texel; uniform float sbias;
uniform vec3 sunDir; uniform vec3 sunCol; uniform vec3 rimDir; uniform vec3 rimCol; uniform vec3 sky; uniform vec3 ground;
uniform float glow; uniform float bump; uniform float flood; uniform vec3 fPos[6]; uniform vec3 fDir[6]; uniform vec3 fCol;
varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying vec3 vP; varying vec4 vS;
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
  vec3 V = normalize(cameraPosition - vW);
  float nl = dot(N, sunDir), sh = sunShadow() * smoothstep(-0.05, 0.12, dot(N0, sunDir));
  // panels: lighter plates a touch glossier
  float lum = dot(base, vec3(0.3, 0.55, 0.15)), rough = clamp(0.55 - (lum - 0.2) * 0.9, 0.3, 0.7), a2 = rough * rough * rough * rough;
  vec3 H = normalize(sunDir + V); float nh = max(dot(N, H), 0.0), dd = nh * nh * (a2 - 1.0) + 1.0, D = a2 / (3.14159 * dd * dd);
  float fr = pow(1.0 - max(dot(N, V), 0.0), 5.0); vec3 F0 = mix(vec3(0.05), base, 0.3), F = F0 + (1.0 - F0) * fr;
  vec3 col = base * (sunCol * max(nl, 0.0) * sh + rimCol * max(dot(N, rimDir), 0.0) + mix(ground, sky, N.y * 0.5 + 0.5));
  col += sunCol * D * F * max(nl, 0.0) * sh * 0.22;
  vec3 R = reflect(-V, N); col += mix(ground, sky * 2.5, smoothstep(-0.3, 0.9, R.y)) * F * 0.6 + rimCol * F * pow(max(dot(R, rimDir), 0.0), 8.0) * 0.6;
  for (int i = 0; i < 6; i++) { vec3 L = fPos[i] - vP; float dist = length(L); L /= dist;
    float cone = smoothstep(0.7, 0.95, dot(-L, fDir[i])), att = 1.0 / (1.0 + dist * dist * 0.018);
    col += base * fCol * max(dot(N, L), 0.0) * cone * att * flood; }
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
  root.traverse((o) => { o.userData.noPick = true; });
  root.userData.triangles = (ship.geometry.index.count + lettering.geometry.index.count) / 3;
  root.userData.paint = paint; root.userData.shadow = !!shadow;
  return root;
}
