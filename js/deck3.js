// USS Defiance · deck3.js
// Deck 3, medical and officers (roadmap B2): the corridors laid out from the deck's floor plan (SHIPGEO.plans[3],
// shipFloorPlan) with the corridor kit (kit.js): a ring round the saucer's centre, four spokes, the aft spoke running on
// as the fore-aft corridor; the Lift 1 lobby between sickbay and the medical lab. Every room is behind a closed,
// labelled door until its fit-out (sickbay is step D; cabins and offices come with the standard room kit, step C).
// Built when the lift first heads here (decks.js deckBuild). Until bake/d3 exists the deck gets the provisional light.
// Coordinates: world x = the plan's x (starboard +), world z = m - 64, y from the Deck 3 floor.
// Files share one global scope and load in order (see index.html).
'use strict';

const D3Y = deckY(3), D3C = STD.corridor.h;
const DECK3 = group(0, D3Y, 0, 0); DECK3.name = 'Deck 3';
const D3 = { root: DECK3, segs: [], obs: [], rooms: [], door: null, labels: [], rails: [], mods: [], doors: [] };
const d3xz = (m, x) => [x, m - 64]; // plan [m, x] to world [x, z]
// section colours (palette A): the ring tan, each spoke its own; the band along the walls and the signs carry them
const D3_BAND = { ring: '#D9B07E', 0: '#E8A06A', 90: '#F2C88F', 180: '#B693C4', 270: '#C67A86' };
const D3_LETTER = { 0: 'A', 90: 'S', 180: 'F', 270: 'P' };

// The corridor layout, worked out from the plan (no 3D objects, so checks can call it): modules (see kitCorridorBuild),
// room doors snapped to the centre of a module, wall lines for collision, end caps, lobby openings.
function d3Layout() {
  const F = shipFloorPlan(3), P = F.P, [cm, cx] = P.c, W = STD.corridor.w / 2, rad = Math.PI / 180, LEN = STD.frame;
  const mods = [], caps = [], N = 48, half = 180 / N, [Rr] = P.ring;
  const dc = Rr * Math.cos(half * rad), rlin = 2 * (dc - W) * Math.tan(half * rad), rlout = 2 * (dc + W) * Math.tan(half * rad);
  const spokeA = P.spokes.map(([a]) => a), near0 = (a, s) => Math.abs(((a - s + 540) % 360) - 180) < 1e-6;
  // the ring: N identical tapered pieces, a crossing wherever a spoke meets it
  for (let k = 0; k < N; k++) { const a = k * 360 / N, cross = spokeA.some((s) => near0(a, s)), [x, z] = d3xz(cm + dc * Math.cos(a * rad), cx + dc * Math.sin(a * rad));
    mods.push({ L: cross ? 'o' : 'w', R: cross ? 'o' : 'w', lin: rlin, lout: rlout, x, z, ry: (a - 90) * rad, ring: true, cross, full: !cross, a, k,
      band: D3_BAND.ring, leg: cross ? null : 'r' + Math.floor(a / 90), frame: 'R' + String(k).padStart(2, '0') }); }
  // the spokes, from the centre crossing out: one run inside the ring, one outside; openings onto corridor-like spaces
  // (the lobby) split a run; each piece is whole 2.4 m modules from its start, then a stretched filler
  // the crossing at the centre, where the four spokes meet
  { const [x, z] = d3xz(cm, cx); mods.push({ L: 'o', R: 'o', lin: 2 * W, lout: 2 * W, x, z, ry: 0, cross: true, full: false, centre: true }); }
  const lobbies = F.spaces.filter((s) => s.t === 'c');
  P.spokes.forEach(([a, end]) => {
    const u = [Math.sin(a * rad), Math.cos(a * rad)], ry = Math.atan2(u[0], u[1]), side = [u[1], -u[0]], [ox, oz] = d3xz(cm, cx);
    const at = (t, l) => [ox + u[0] * t + side[0] * l, oz + u[1] * t + side[1] * l];
    const local = (wx, wz) => { const dx = wx - ox, dz = wz - oz; return [dx * u[0] + dz * u[1], dx * side[0] + dz * side[1]]; };
    let fn = 0; const fr = () => D3_LETTER[a] + String(++fn).padStart(2, '0'), band = D3_BAND[a];
    [[W, dc - W], [dc + W, end]].forEach(([t0, t1], ri) => {
      const leg = (ri ? 'o' : 'i') + a;
      const cuts = [t0, t1], open = [];
      lobbies.forEach((s) => { const pts = s.poly.map(([m, x]) => local(...d3xz(m, x))); [-1, 1].forEach((sd) => {
        const on = pts.filter(([, l]) => Math.abs(l - sd * W) < 0.15); if (on.length < 2) return;
        const lo = Math.max(t0, Math.min(...on.map(([t]) => t))), hi = Math.min(t1, Math.max(...on.map(([t]) => t))); if (hi - lo > 0.5) { open.push([lo, hi, sd]); cuts.push(lo, hi); } }); });
      const cs = [...new Set(cuts.map((v) => +v.toFixed(4)))].sort((p, q) => p - q);
      for (let i = 0; i < cs.length - 1; i++) {
        const p0 = cs[i], p1 = cs[i + 1], o = open.find(([lo, hi]) => p0 >= lo - 1e-3 && p1 <= hi + 1e-3), L = o && o[2] < 0 ? 'o' : 'w', R = o && o[2] > 0 ? 'o' : 'w';
        const n = Math.floor((p1 - p0) / LEN + 1e-6), f = p1 - p0 - n * LEN;
        for (let j = 0; j < n; j++) { const t = p0 + LEN * (j + 0.5), [x, z] = at(t, 0); mods.push({ L, R, lin: LEN, lout: LEN, x, z, ry, sz: 1, full: true, spoke: a, t, band, leg, frame: fr() }); }
        if (f > 0.02) { const t = p1 - f / 2, [x, z] = at(t, 0); mods.push({ L, R, lin: LEN, lout: LEN, x, z, ry, sz: f / LEN, full: false, spoke: a, t, band, leg, frame: fr() }); }
      }
      if (ri === 1) { const [x0, z0] = at(end, -W), [x1, z1] = at(end, W); caps.push({ A: [x0, z0], B: [x1, z1], n: [-u[0], -u[1]], spoke: a }); }
    });
  });
  // module geometry in world terms: its axes, half-lengths of each edge
  mods.forEach((d) => { d.ax = [Math.cos(d.ry), -Math.sin(d.ry)]; d.az = [Math.sin(d.ry), Math.cos(d.ry)]; d.sz = d.sz || 1; });
  const toLocal = (d, wx, wz) => { const dx = wx - d.x, dz = wz - d.z; return [dx * d.ax[0] + dz * d.ax[1], dx * d.az[0] + dz * d.az[1]]; };
  const halfLen = (d, s) => (s < 0 ? d.lin : d.lout) * d.sz / 2;
  // room doors onto the corridor: each to the nearest whole module with a wall on that side, at its centre
  const doors = [];
  F.spaces.forEach((s) => {
    if (!s.door || s.t === 'c' || s.t === 'v' || s.n === 'Lift 1') return;
    const [wx, wz] = d3xz(...s.door); let best = null;
    mods.forEach((d) => { if (!d.full) return; const [lx, lz] = toLocal(d, wx, wz), sd = Math.sign(lx), k = sd < 0 ? d.L : d.R;
      if (Math.abs(Math.abs(lx) - W) > 0.4 || k !== 'w' || Math.abs(lz) > 3.6) return;
      if (!best || Math.abs(lz) < best.dz) best = { d, sd, dz: Math.abs(lz) }; });
    if (!best) { if (s.n !== 'Sickbay') console.warn('Deck 3: no corridor module for the door of', s.id || s.n); return; }
    const d = best.d; if (best.sd < 0) d.L = 'd'; else d.R = 'd';
    const px = d.x + d.ax[0] * best.sd * W, pz = d.z + d.ax[1] * best.sd * W, nrm = [-d.ax[0] * best.sd, -d.ax[1] * best.sd];
    doors.push({ s, x: px, z: pz, rot: Math.atan2(nrm[0], nrm[1]), moved: Math.hypot(px - wx, pz - wz), mod: d });
  });
  // collision: each walled side as a line (broken at a door), each end cap
  const segs = [];
  mods.forEach((d) => [[-1, d.L], [1, d.R]].forEach(([sd, k]) => {
    if (k === 'o') return; const h = halfLen(d, sd), P0 = (lz) => [d.x + d.ax[0] * sd * W + d.az[0] * lz, d.z + d.ax[1] * sd * W + d.az[1] * lz];
    (k === 'd' ? [[-h, -0.6], [0.6, h]] : [[-h, h]]).forEach(([a, b]) => segs.push([...P0(a), ...P0(b)])); }));
  caps.forEach((c) => segs.push([...c.A, ...c.B]));
  return { F, mods, doors, caps, segs, W, dc };
}

// the short name on a room's door
function d3DoorLabel(s) {
  const id = s.id ? s.id.slice(2) : '';
  return ({ 'Officers’ quarters': 'OFFICER · ' + id, 'Crew quarters': 'CREW · ' + id, 'Sickbay': 'SICKBAY', 'Medical lab and morgue': 'MEDICAL LAB',
    'Forward shield generator': 'SHIELD GEN', 'Computer core, upper': 'COMPUTER CORE', 'Damage control station': 'DAMAGE CONTROL',
    'Pod feeds and torpedo magazine': 'MAGAZINE', 'Lift 2': 'LIFT 2' })[s.n] || s.n.toUpperCase();
}

function buildDeck3() {
  const Lt = d3Layout(), corrWall = roomWallMat(D3C, 'fabric');
  D3.layout = Lt; D3.mods = kitCorridorBuild(D3, Lt.mods, corrWall);
  Lt.segs.forEach(([ax, az, bx, bz]) => kitSeg(D3, ax, az, bx, bz));
  // end caps
  Lt.caps.forEach((c) => { const len = Math.hypot(c.B[0] - c.A[0], c.B[1] - c.A[1]), dir = [(c.B[0] - c.A[0]) / len, (c.B[1] - c.A[1]) / len];
    wallPiece(corrWall, c.A, dir, c.n, 0, len, 0, D3C, D3C, 1.2, DECK3); });

  // ---------- the Lift 1 lobby, open onto the aft spoke ----------
  const lob = Lt.F.spaces.find((s) => s.n === 'Lift 1 lobby'), xs = lob.poly.map(([, x]) => x), ms = lob.poly.map(([m]) => m);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...ms) - 64, z1 = Math.max(...ms) - 64, H = D3C, I = STD.inset;
  {
    const fw = x1 - x0, fd = z1 - z0, fg = new THREE.PlaneGeometry(fw, fd); { const uv = fg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * fw, uv.getY(i) * fd); }
    mesh(fg, MAT.floorCarpet, (x0 + x1) / 2, 0.002, (z0 + z1) / 2, DECK3).rotation.x = -Math.PI / 2;
    mesh(fg.clone(), MAT.ceiling, (x0 + x1) / 2, H, (z0 + z1) / 2, DECK3).rotation.x = Math.PI / 2;
    const sb = Lt.F.spaces.find((s) => s.n === 'Sickbay'), sbx = sb.door[1];
    kitWall(D3, corrWall, [x0 + I, z0 + I], [x1, z0 + I], [0, 1], H, [{ a: sbx - 0.6 - x0 - I, b: sbx + 0.6 - x0 - I, y0: 0, y1: 2.3 }]);
    kitWall(D3, corrWall, [x0 + I, z1 - I], [x1, z1 - I], [0, -1], H, [{ a: LIFT_DX - 0.6 - x0 - I, b: LIFT_DX + 0.6 - x0 - I, y0: 0, y1: 2.3 }]);
    kitWall(D3, corrWall, [x0 + I, z0 + I], [x0 + I, z1 - I], [1, 0], H);
    [[(x0 + x1) / 2, z0 + 0.13, fw - 0.2, 0], [(x0 + x1) / 2, z1 - 0.13, fw - 0.2, 0], [x0 + 0.13, (z0 + z1) / 2, fd - 0.3, Math.PI / 2]].forEach(([x, z, L, ry]) => {
      mesh(BOX(L, 0.03, 0.03), SLOT, x, H - 0.28, z, DECK3).rotation.y = ry; mesh(RBOX(L + 0.1, 0.08, 0.12, 0.015), MAT.gunDark, x, H - 0.23, z, DECK3).rotation.y = ry;
      mesh(BOX(L - 0.2, 0.02, 0.02), STRIP, x, 0.06, z, DECK3).rotation.y = ry; });
    D3.rooms.push({ label: 'Lift 1 lobby', x0, x1: x1 + STD.corridor.w, z0, z1 });
    // the lift doors on this deck (lift.js opens them with the car's), as on Deck 2
    const g = group(LIFT_DX, 0, z1, Math.PI, DECK3);
    [-1, 1].forEach((sd) => mesh(RBOX(0.22, 2.6, 0.3, 0.03), MAT.gun, sd * 0.71, 1.3, 0.12, g));
    mesh(RBOX(1.64, 0.3, 0.3, 0.03), MAT.gun, 0, 2.45, 0.12, g); mesh(BOX(1.2, 0.004, 0.1), MAT.hazard, 0, 0.003, 0.16, g);
    const L = mesh(RBOX(0.6, 2.3, 0.06, 0.015), MAT.panel, -0.3, 1.15, 0.06, g), Rr = mesh(RBOX(0.6, 2.3, 0.06, 0.015), MAT.panel, 0.3, 1.15, 0.06, g);
    [L, Rr].forEach((d, k) => { mesh(BOX(0.02, 1.9, 0.02), SLOT, k ? -0.27 : 0.27, 0, 0.04, d); mesh(BOX(0.4, 0.05, 0.02), MAT.steel, 0, 0.1, 0.04, d); });
    addHit(BOX(1.6, 2.6, 0.8), { station: 'lift' }, g, 0, 1.3, 0.45);
    D3.door = { L, Rr };
    kitLabel(D3, 'LIFT 1', LIFT_DX, 2.42, z1 - 0.28, Math.PI, 0.7);
    // deck sign on the lobby's port wall
    { const c = cnv(560, 256), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 560, 256);
      elbow(x, 14, 14, 70, 18, 300, 30, true, '#E8A06A'); elbow(x, 14, 242, 70, 14, 200, 24, false, '#D9B07E');
      x.fillStyle = '#F2C88F'; x.font = `700 150px ${DISP}`; x.textBaseline = 'middle'; x.fillText('3', 110, 132);
      x.fillStyle = '#E8A06A'; x.font = `600 44px ${DISP}`; x.fillText('DECK 3', 220, 92); x.fillStyle = '#B693C4'; x.font = `500 32px ${DISP}`; x.fillText('MEDICAL AND OFFICERS', 222, 142);
      x.fillStyle = '#D9B07E'; x.font = `500 24px ${DISP}`; x.fillText('LIFT 1 · SICKBAY FORWARD · LAB TO STARBOARD', 222, 186);
      const m = mesh(new THREE.PlaneGeometry(1.1, 0.5), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), x0 + 0.082, 1.6, (z0 + z1) / 2, DECK3); m.rotation.y = Math.PI / 2;
      mesh(RBOX(0.02, 0.62, 1.22, 0.008), MAT.gunDark, x0 + 0.07, 1.6, (z0 + z1) / 2, DECK3); }
    kitDown(D3, (x0 + x1) / 2, (z0 + z1) / 2, H); kitDown(D3, LIFT_DX, z1 - 1.0, H);
  }

  // ---------- room doors: closed and labelled until each room is fitted out ----------
  const sickbay = Lt.F.spaces.find((s) => s.n === 'Sickbay');
  const all = Lt.doors.concat([{ s: sickbay, x: sickbay.door[1], z: z0, rot: 0 }]);
  all.forEach(({ s, x, z, rot }) => {
    const st = 'd3:' + (s.id || s.n), lift2 = s.n === 'Lift 2';
    doorAt(x, z, rot, d3DoorLabel(s), st, false, true, DECK3, 3);
    STATIONS[st] = { title: lift2 ? 'Lift 2' : s.n + (s.id ? ' ' + s.id : ''), role: 'Deck 3',
      panel: () => ({ read: [['Room', s.n + (s.b ? (s.b > 1 ? ' · two berths' : ' · one berth') : '')], ['Status', lift2 ? 'Lift 2 is not running yet' : 'Sealed for fitting-out']],
        note: lift2 ? 'Lift 2 will serve Decks 3 to 10 once main engineering is built.' : 'This room is not built yet. The corridors of Deck 3 are open; rooms follow with the standard room kit, sickbay first.', acts: [] }) };
  });
  D3.doors = all;

  d3Dress(Lt);

  // ---------- where you are: the corridor runs (rectangles) and the ring ----------
  const [ocx, ocz] = d3xz(...Lt.F.P.c), W = Lt.W;
  Lt.F.P.spokes.forEach(([a, end]) => { const r = a * Math.PI / 180, ux = Math.sin(r), uz = Math.cos(r), ex = ocx + ux * end, ez = ocz + uz * end;
    const label = { 0: 'Aft corridor', 90: 'Starboard spoke', 180: 'Forward spoke', 270: 'Port spoke' }[a] || 'Corridor';
    D3.rooms.push({ label, x0: Math.min(ocx, ex) - (uz ? W : 0), x1: Math.max(ocx, ex) + (uz ? W : 0), z0: Math.min(ocz, ez) - (ux ? W : 0), z1: Math.max(ocz, ez) + (ux ? W : 0) }); });
  D3.rooms.unshift({ label: 'Ring corridor', test: (x, z) => { const r = Math.hypot(x - ocx, z - ocz); return r > Lt.dc - W - 0.2 && r < Lt.dc + W + 0.2; } });
  DECK3.updateMatrixWorld(true);
}

// a point in a corridor module's own frame (x across, y up, z along; lz = -1..1 of its half-length at that x) in world terms
function d3ModPt(d, lx, y, lz) {
  const W = STD.corridor.w / 2, h = (d.lin + (d.lout - d.lin) * (lx + W) / (2 * W)) * d.sz / 2 * lz;
  return [d.x + d.ax[0] * lx + d.az[0] * h, y, d.z + d.ax[1] * lx + d.az[1] * h];
}
// sign text for the rooms whose doors are on a stretch of corridor: lifts and named rooms first, cabins as number ranges
function d3Contents(doors) {
  const nums = (k) => { const v = doors.filter((d) => d.s.n === k).map((d) => +d.s.id.slice(2)).sort((p, q) => p - q), r = [];
    v.forEach((x) => { const l = r[r.length - 1]; if (l && x === l[1] + 1) l[1] = x; else r.push([x, x]); });
    return r.map(([p, q]) => p === q ? String(p).padStart(2, '0') : String(p).padStart(2, '0') + '-' + String(q).padStart(2, '0')).join(', '); };
  const named = { 'Lift 2': 'LIFT 2', 'Sickbay': 'SICKBAY', 'Medical lab and morgue': 'MEDICAL LAB', 'Forward shield generator': 'SHIELD GENERATOR',
    'Computer core, upper': 'COMPUTER CORE', 'Damage control station': 'DAMAGE CONTROL', 'Pod feeds and torpedo magazine': 'MAGAZINE' };
  const out = [...new Set(doors.map((d) => named[d.s.n]).filter(Boolean))];
  if (doors.some((d) => d.s.n === 'Officers’ quarters')) out.push('OFFICERS ' + nums('Officers’ quarters'));
  if (doors.some((d) => d.s.n === 'Crew quarters')) out.push('CREW ' + nums('Crew quarters'));
  return out;
}
// Deck 3's signs, frame numbers, wall screens, benches, plants and the posts closing the ring crossings' outer corners
function d3Dress(Lt) {
  const W = Lt.W, H = D3C, mods = Lt.mods, cells = [];
  // frame numbers: a small plate on each frame's left post, facing along the corridor's width
  mods.forEach((d) => { if (!d.frame || d.L === 'o') return;
    const c = d3ModPt(d, -W + 0.102, 1.95, -1), lab = '3-' + d.frame;
    cells.push({ w: 128, h: 56, quads: [{ c, n: [d.ax[0], 0, d.ax[1]], w: 0.13, h: 0.057 }],
      draw: (g, x, y, w, h) => { g.fillStyle = '#0b0a0c'; g.fillRect(x, y, w, h); g.fillStyle = d.band; g.fillRect(x + 4, y + 6, 8, h - 12);
        g.fillStyle = '#F5E6CF'; g.font = `600 32px ${DISP}`; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(lab, x + w / 2 + 6, y + h / 2 + 1); } }); });
  // overhead signs where each stretch of corridor leaves a crossing: its name and what is along it; "LIFT 1" on the way there
  const legs = new Map(); mods.forEach((d) => { if (d.leg) { if (!legs.has(d.leg)) legs.set(d.leg, []); legs.get(d.leg).push(d); } });
  const legName = (k) => k[0] === 'r' ? ['RING · AFT STARBOARD', 'RING · FORWARD STARBOARD', 'RING · FORWARD PORT', 'RING · AFT PORT'][+k[1]]
    : ({ 0: k[0] === 'i' ? 'AFT SPOKE' : 'AFT CORRIDOR', 90: 'STARBOARD SPOKE', 180: 'FORWARD SPOKE', 270: 'PORT SPOKE' })[+k.slice(1)];
  const signs = [];
  legs.forEach((list, k) => {
    const ring = k[0] === 'r', sorted = list.slice().sort((p, q) => ring ? p.a - q.a : p.t - q.t), on = new Set(list);
    const doors = D3.doors.filter((d) => on.has(d.mod)), items = d3Contents(doors), a = ring ? null : +k.slice(1);
    if (k === 'i0') items.unshift('LIFT 1');
    const band = ring ? D3_BAND.ring : D3_BAND[a];
    // ends at a crossing: [module, facing sign (+1 along the module's z, -1 against), lift badge]
    const ends = ring ? [[sorted[0], 1, false], [sorted[sorted.length - 1], -1, false]]
      : k[0] === 'i' ? [[sorted[0], -1, k === 'i0'], [sorted[sorted.length - 1], 1, true]] : [[sorted[0], -1, false]];
    ends.forEach(([d, f, lift]) => signs.push({ d, f, lift, name: legName(k), items, band }));
  });
  signs.forEach((S) => {
    const d = S.d, c = d3ModPt(d, 0, 2.36, 0), n = [d.az[0] * S.f, 0, d.az[1] * S.f];
    // the sign's body and two hanger rods
    const body = mesh(RBOX(1.56, 0.32, 0.04, 0.012), MAT.gunDark, c[0] - n[0] * 0.02, c[1], c[2] - n[2] * 0.02, DECK3); body.rotation.y = Math.atan2(n[0], n[2]);
    [-0.6, 0.6].forEach((o) => mesh(CYL(0.008, 0.008, H - 2.52, 6), MAT.steel, c[0] - n[2] * o, (H + 2.52) / 2, c[2] + n[0] * o, DECK3));
    cells.push({ w: 1024, h: 208, quads: [{ c: [c[0] + n[0] * 0.002, c[1], c[2] + n[2] * 0.002], n, w: 1.5, h: 0.305 }], draw: (g, x, y, w, h) => {
      g.fillStyle = '#000'; g.fillRect(x, y, w, h); g.fillStyle = S.band; g.fillRect(x + 14, y + 16, 22, h - 32); hexTab(g, x + 48, y + 18, 26, 58, true, false); g.fill();
      const right = S.lift ? 214 : 20; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
      g.fillStyle = S.band; g.font = `600 58px ${DISP}`; g.fillText(S.name, x + 88, y + 70, w - 88 - right);
      g.fillStyle = '#D9B07E'; g.font = `500 36px ${DISP}`; const lines = [''];
      S.items.forEach((it) => { const t = lines[lines.length - 1] ? lines[lines.length - 1] + ' · ' + it : it; if (g.measureText(t).width < w - 92 - right || !lines[lines.length - 1]) lines[lines.length - 1] = t; else lines.push(it); });
      if (!S.items.length) lines[0] = S.name.startsWith('RING') ? 'CABINS' : 'TO THE CENTRE';
      lines.slice(0, 2).forEach((t, i) => g.fillText(t, x + 92, y + 124 + i * 44, w - 92 - right));
      if (S.lift) { const bx = x + w - 196, by = y + 54; g.fillStyle = '#E8A06A'; g.beginPath(); g.roundRect(bx, by, 176, 100, 50); g.fill();
        g.fillStyle = '#000'; g.font = `600 44px ${DISP}`; g.fillText('LIFT 1', bx + 24, by + 66); g.beginPath(); g.moveTo(bx + 140, by + 30); g.lineTo(bx + 162, by + 50); g.lineTo(bx + 140, by + 70); g.fill(); }
    } });
  });
  D3.signs = signs;
  D3.atlas = kitAtlas(D3, cells, 'Deck 3 signs');
  // wall screens and benches on the ring's inner wall (no doors there), a screen now and then on the long aft corridor
  const screen = [], bench = [];
  const place = (d, sd) => { const p = d3ModPt(d, sd * W, 0, 0), dir = [-d.ax[0] * sd, -d.ax[1] * sd]; return { x: p[0], z: p[2], ry: Math.atan2(dir[0], dir[1]), d, sd }; };
  mods.forEach((d) => { if (d.ring && !d.cross) { if (d.k % 12 === 3 || d.k % 12 === 9) screen.push(place(d, -1)); else if (d.k % 12 === 6) bench.push(place(d, -1)); }
    else if (d.leg === 'o0' && d.full && d.L === 'w' && d.R === 'w' && Math.round(d.t / 2.4) % 6 === 0) screen.push(place(d, (Math.round(d.t / 2.4) % 12) ? 1 : -1)); });
  { const c = cnv(512, 296), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 512, 296);
    elbow(g, 12, 12, 56, 16, 260, 26, true, '#E8A06A'); g.fillStyle = '#E8A06A'; g.font = `600 34px ${DISP}`; g.fillText('DECK 3', 300, 40);
    g.fillStyle = '#B693C4'; g.font = `500 26px ${DISP}`; g.fillText('MEDICAL AND OFFICERS', 84, 84);
    [['ENVIRONMENT', 'NOMINAL', '#8DBF84'], ['SICKBAY', 'READY', '#8DBF84'], ['LIFT 1', 'IN SERVICE', '#8DBF84'], ['LIFT 2', 'OFFLINE', '#F0B44C'], ['ALERT', 'CONDITION GREEN', '#8DBF84']].forEach(([a, b, col], i) => {
      g.fillStyle = '#D9B07E'; g.font = `500 24px ${DISP}`; g.fillText(a, 84, 126 + i * 34); g.fillStyle = col; g.fillText(b, 300, 126 + i * 34); });
    g.fillStyle = '#7E5C8E'; g.fillRect(12, 270, 488, 12);
    D3.screenMat = new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }); }
  kitProps(D3, [{ geo: RBOX(0.9, 0.56, 0.04, 0.015), mat: MAT.gunDark }, { geo: (() => { const g = new THREE.PlaneGeometry(0.82, 0.474); g.translate(0, 0, 0.0415); return g; })(), mat: D3.screenMat }]
    .map((p) => { p.geo = p.geo.clone(); p.geo.translate(0, 1.45, 0.02); return p; }), screen, 'Deck 3 wall screens');
  kitProps(D3, [{ geo: RBOX(1.4, 0.08, 0.42, 0.02), mat: MAT.leather }, { geo: RBOX(1.3, 0.4, 0.34, 0.02), mat: MAT.gunDark }]
    .map((p, i) => { p.geo = p.geo.clone(); p.geo.translate(0, i ? 0.2 : 0.44, i ? 0.2 : 0.23); return p; }), bench, 'Deck 3 benches');
  bench.forEach((b) => { const d = b.d; [-0.45, 0.45].forEach((o) => { const p = d3ModPt(d, b.sd * (W - 0.28), 0, o / (d.lin * d.sz / 2)); kitObs(D3, p[0], p[2], 0.28); }); });
  D3.screens = screen; D3.benches = bench;
  // plants at the far ends of the forward and lateral spokes
  Lt.caps.forEach((c) => { if (c.spoke === 0) return; const mx = (c.A[0] + c.B[0]) / 2, mz = (c.A[1] + c.B[1]) / 2, ax = (c.B[0] - c.A[0]) / 2.2, az = (c.B[1] - c.A[1]) / 2.2;
    kitPlant(D3, mx + c.n[0] * 0.45 + ax * 0.6, mz + c.n[1] * 0.45 + az * 0.6, 0.85); });
  // posts closing the ring crossings' outer corners (the ring's outer edge is a little wider than the spoke)
  Lt.F.P.spokes.forEach(([a]) => { const r = a * Math.PI / 180, u = [Math.sin(r), Math.cos(r)], v = [u[1], -u[0]], [ox, oz] = d3xz(...Lt.F.P.c), t = Lt.dc + W + 0.1;
    [-1, 1].forEach((sd) => { const p = mesh(RBOX(0.3, H, 0.3, 0.03), MAT.gunDark, ox + u[0] * t + v[0] * sd * (W + 0.08), H / 2, oz + u[1] * t + v[1] * sd * (W + 0.08), DECK3); p.rotation.y = Math.atan2(u[0], u[1]); }); });
}
