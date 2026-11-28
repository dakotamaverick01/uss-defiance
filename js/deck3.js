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
  // corridor pieces beside the magazines: their band turns hard red at red alert (d3Alert)
  { const F = shipFloorPlan(3), mags = F.spaces.filter((s) => s.n === 'Pod feeds and torpedo magazine').map((s) => s.poly.map((p) => p[0]));
    Lt.mods.forEach((d) => { const m = d.z + 64; d.mag = d.spoke === 0 && mags.some((ms) => m > Math.min(...ms) - 0.6 && m < Math.max(...ms) + 0.6); }); }
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
  d3Cabins(Lt);
  // the whole deck is lit by its computed probes (d3Light), none of it by a light map
  DECK3.traverse((o) => { if (o.isMesh) o.userData.probeLit = true; });

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

// Deck 3's light, worked out here instead of baked (John, Nov 27: corridors only need a simple pass): a probe grid over
// the deck, lit by every corridor module's ceiling panel and the lobby's downlights (the white layer) and by the cove
// lights along the walls (the alert-tinted layer), with a soft share of bounced light. Each probe stores, for six
// directions, the light falling on a surface facing that way (the format bake.js reads). Walls don't block light here:
// the corridors are narrow and far apart, so light reaching a room's side of a wall doesn't show.
function d3Light() {
  const Lt = D3.layout, H = D3C, W = Lt.W, step = 0.5, y0 = D3Y + 0.15, lights = [], coves = [];
  Lt.mods.forEach((d) => { lights.push([d.x, D3Y + H - 0.05, d.z, d.sz < 0.5 ? 0.5 : 1, 0]);
    [[-1, d.L], [1, d.R]].forEach(([sd, k]) => { if (k === 'o') return; for (let u = -0.75; u <= 0.75; u += 0.5) { const p = d3ModPt(d, sd * (W - 0.15), 0, u); coves.push([p[0], D3Y + H - 0.28, p[2]]); } }); });
  D3.rooms.filter((r) => r.label === 'Lift 1 lobby').forEach((r) => { lights.push([(r.x0 + r.x1 - STD.corridor.w) / 2, D3Y + H - 0.01, (r.z0 + r.z1) / 2, 1.3, 0], [LIFT_DX, D3Y + H - 0.01, r.z1 - 1.0, 1.1, 0]); });
  // fitted rooms: their own lights, which light only their own room (space k: a room's light doesn't reach the
  // corridor or the next room, and the corridor's doesn't reach in)
  const rooms = (D3.fitted || D3.cabins || []); rooms.forEach((c, i) => c.lights.forEach(([x, y, z, k]) => lights.push([x, D3Y + y, z, k, i + 1])));
  // light from each fitted room's open doorway falls on the corridor floor outside it (corridor space 0)
  rooms.forEach((c) => { const d = D3.doors.find((q) => q.s === c.s); if (!d) return; const n = [Math.sin(d.rot), Math.cos(d.rot)]; lights.push([d.x + n[0] * 0.45, D3Y + 2.2, d.z + n[1] * 0.45, 0.35, 0]); });
  const inP = (P, x, z) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [ax, az] = P[i], [bx, bz] = P[j]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) c = !c; } return c; };
  const spaceAt = (x, z) => { for (let i = 0; i < rooms.length; i++) { const b = rooms[i].bb; if (x > b[0] && x < b[1] && z > b[2] && z < b[3] && inP(rooms[i].wpoly, x, z)) return i + 1; } return 0; };
  const xs = Lt.mods.map((d) => d.x), zs = Lt.mods.map((d) => d.z), x0 = Math.min(...xs) - 3, z0 = Math.min(...zs) - 3;
  const X = Math.ceil((Math.max(...xs) + 3 - x0) / step) + 1, Z = Math.ceil((Math.max(...zs) + 3 - z0) / step) + 1, Y = Math.floor((H - 0.4) / step) + 1; // layers stay below the ceiling (it samples the top one)
  // spatial hash, 4 m cells
  const cell = (x, z) => Math.floor(x / 4) + ',' + Math.floor(z / 4), hash = (list) => { const m = new Map(); list.forEach((l) => { const k = cell(l[0], l[2]); if (!m.has(k)) m.set(k, []); m.get(k).push(l); }); return m; };
  const HL = hash(lights), HC = hash(coves), near = (M, x, z) => { const out = [], cx = Math.floor(x / 4), cz = Math.floor(z / 4); for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const l = M.get((cx + i) + ',' + (cz + j)); if (l) out.push(...l); } return out; };
  const PW = 2.4, PS = 0.3, IP = 2.3, IC = 0.035, COL = [1.0, 0.93, 0.84], N = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const data = new Uint8Array(6 * X * Y * Z * 4), E = new Float32Array(6), S = new Float32Array(6);
  for (let iz = 0; iz < Z; iz++) for (let ix = 0; ix < X; ix++) {
    const px = x0 + ix * step, pz = z0 + iz * step, sp = spaceAt(px, pz), LL = near(HL, px, pz).filter((l) => l[4] === sp), CC = sp ? [] : near(HC, px, pz);
    const direct = (py) => { E.fill(0); LL.forEach(([lx, ly, lz, k]) => { const dx = lx - px, dy = ly - py, dz = lz - pz, r2 = dx * dx + dy * dy + dz * dz; if (r2 > 49) return;
      const r = Math.sqrt(r2), cl = Math.max(0, dy / r), a = IP * k * Math.pow(cl, 1.5) / (r2 + 0.35);
      N.forEach((n, f) => { const c = (n[0] * dx + n[1] * dy + n[2] * dz) / r; if (c > 0) E[f] += a * c; }); }); };
    direct(D3Y + 0.02); const floorLit = E[2]; // the light on the floor below: it bounces back up onto the ceiling
    for (let iy = 0; iy < Y; iy++) {
      const py = y0 + iy * step; S.fill(0); direct(py);
      CC.forEach(([lx, ly, lz]) => { const dx = lx - px, dy = ly - py, dz = lz - pz, r2 = dx * dx + dy * dy + dz * dz; if (r2 > 16) return;
        const r = Math.sqrt(r2), a = IC / (r2 + 0.25); N.forEach((n, f) => { const c = (n[0] * dx + n[1] * dy + n[2] * dz) / r; if (c > 0) S[f] += a * c; }); });
      // bounce: a share of the light on the walls to every side, and the lit floor back up onto the ceiling
      const avg = (E[0] + E[1] + E[4] + E[5]) / 4; for (let f = 0; f < 6; f++) E[f] += 0.3 * avg; E[3] += 0.4 * floorLit;
      for (let f = 0; f < 6; f++) {
        const t = ((iz * Y + iy) * 6 * X + f * X + ix) * 4, w = Math.min(1, E[f] / PW);
        data[t] = Math.round(255 * Math.sqrt(w * COL[0])); data[t + 1] = Math.round(255 * Math.sqrt(w * COL[1])); data[t + 2] = Math.round(255 * Math.sqrt(w * COL[2]));
        data[t + 3] = Math.round(255 * Math.sqrt(Math.min(1, S[f] / PS)));
      }
    }
  }
  return { origin: [x0, y0, z0], step, dims: [X, Y, Z], data, pr_max: [PW, PS], lm: 140 };
}

// ---------- standard rooms (roadmap C): the cabins ----------
// Every cabin from its shared layout (shipRoomLayout): its shell (floor, ceiling, walls with the door's opening), a head
// (tiled partition with an open sliding door; shower, toilet, basin and mirror), bed or beds, desk and chair, wardrobe,
// a ceiling light. Shells are merged deck-wide per material; furniture and fittings are instanced (kitProps), so all
// 38 cabins cost a few dozen draws. Their doors open as you walk up.
function d3Cabins(Lt) {
  const RH = STD.room.h, I = STD.inset, W2 = (p) => [p[1], p[0] - 64], wallMat = roomWallMat(RH, 'fabric'), tileMat = CKIT.bathWall || (CKIT.bathWall = roomWallMat(RH, 'bath'));
  const geo = new Map(), put = (mat, g) => { if (!geo.has(mat)) geo.set(mat, []); geo.get(mat).push([g, null]); };
  const props = {}, place = (k, x, z, dir, y) => (props[k] = props[k] || []).push({ x, z, y: y || 0, ry: Math.atan2(dir[0], dir[1]) });
  const wq = (mat, A, B, y0, y1, n, uo) => { const L = Math.hypot(B[0] - A[0], B[1] - A[1]); put(mat, kitQuad([[A[0], y0, A[1]], [B[0], y0, B[1]], [B[0], y1, B[1]], [A[0], y1, A[1]]],
    [[uo / 1.2, y0 / RH], [(uo + L) / 1.2, y0 / RH], [(uo + L) / 1.2, y1 / RH], [uo / 1.2, y1 / RH]], [n[0], 0, n[1]])); };
  // a wall from A to B facing n, with openings [{ a, b, y1 }] along it (metres from A), and its collision line
  const wall = (mat, A, B, n, holes) => { const L = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], P = (t) => [A[0] + u[0] * t, A[1] + u[1] * t]; let t = 0;
    (holes || []).slice().sort((p, q) => p.a - q.a).forEach((h) => { if (h.a > t) { wq(mat, P(t), P(h.a), 0, RH, n, t); kitSeg(D3, ...P(t), ...P(h.a), 0.2); }
      wq(mat, P(h.a), P(h.b), h.y1, RH, n, h.a); t = h.b; });
    if (L > t) { wq(mat, P(t), P(L), 0, RH, n, t); kitSeg(D3, ...P(t), ...P(L), 0.2); } };
  // a room's shell from its plan space: floor and ceiling (triangulated), walls on the inset outline with the door's
  // opening where the snapped door is, collision lines. Returns the inset outline and its centre.
  const shell = (s, floorMat, wMat) => {
    const dd = D3.doors.find((q) => q.s === s), wp = insetPoly(s.poly.map(W2), I), n = wp.length;
    const cx = wp.reduce((a, p) => a + p[0] / n, 0), cz = wp.reduce((a, p) => a + p[1] / n, 0);
    // floor and ceiling
    const tri = THREE.ShapeUtils.triangulateShape(wp.map(([x, z]) => new THREE.Vector2(x, z)), []);
    [[floorMat, 0.003, 1], [MAT.ceiling, RH, -1]].forEach(([mat, y, up]) => { const pos = [], nor = [], uv = [];
      tri.forEach(([a, b, c]) => { let t = [a, b, c]; const A = wp[a], B = wp[b], C = wp[c], cr = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]); if ((cr < 0) !== (up > 0)) t = [a, c, b];
        t.forEach((k) => { pos.push(wp[k][0], y, wp[k][1]); nor.push(0, up, 0); uv.push(wp[k][0] / (up > 0 ? 1 : 1.2), wp[k][1] / (up > 0 ? 1 : 1.2)); }); });
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); put(mat, g); });
    // walls, the door's opening on the wall nearest the door
    let de = -1, dt = 0, bd = 1e9; wp.forEach((A, i) => { const B = wp[(i + 1) % n], L = Math.hypot(B[0] - A[0], B[1] - A[1]), t = ((dd.x - A[0]) * (B[0] - A[0]) + (dd.z - A[1]) * (B[1] - A[1])) / (L * L), tc = Math.max(0, Math.min(1, t));
      const d = Math.hypot(A[0] + tc * (B[0] - A[0]) - dd.x, A[1] + tc * (B[1] - A[1]) - dd.z); if (d < bd) { bd = d; de = i; dt = t * L; } });
    wp.forEach((A, i) => { const B = wp[(i + 1) % n], L = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L]; let nn = [-u[1], u[0]];
      if ((cx - A[0]) * nn[0] + (cz - A[1]) * nn[1] < 0) nn = [-nn[0], -nn[1]];
      wall(wMat, A, B, nn, i === de ? [{ a: dt - 0.6, b: dt + 0.6, y1: 2.3 }] : null); });
    return { dd, wp, n, cx, cz };
  };
  D3.cabins = [];
  Lt.F.spaces.forEach((s) => {
    const Lay = shipRoomLayout(s); if (!Lay) return;
    const { dd, wp, n } = shell(s, MAT.roomCarpet, wallMat);
    // the room's frame in world terms
    const at = (u, v) => W2(Lay.at(u, v)), ux = [Lay.ux[1], Lay.ux[0]], uy = [Lay.uy[1], Lay.uy[0]], mid = (i) => at((i.u0 + i.u1) / 2, (i.v0 + i.v1) / 2), neg = (v) => [-v[0], -v[1]];
    Lay.items.forEach((it) => {
      const c = mid(it);
      if (it.k === 'bed' || it.k === 'bunk') { place(it.k, c[0], c[1], neg(uy)); [-0.5, 0.5].forEach((o) => kitObs(D3, c[0] + uy[0] * o, c[1] + uy[1] * o, 0.5)); }
      if (it.k === 'desk') { place('desk', c[0], c[1], ux); kitObs(D3, c[0], c[1], 0.4); }
      if (it.k === 'chair') place('chair', c[0], c[1], neg(ux));
      if (it.k === 'wardrobe') { place('wardrobe', c[0], c[1], neg(ux)); kitObs(D3, c[0], c[1], 0.4); }
      if (it.k === 'head') {
        // partition: the front wall (door opening near its left end) and the left wall, tiled on both faces
        // (the front wall runs on to the room's real right-hand wall, which can lie beyond the clear rectangle)
        const ur = Math.max(it.u1, Lay.span(it.v0)[1] - I), A = at(it.u0, it.v0), B = at(ur, it.v0), C = at(it.u0, it.v1), t = 0.04, off = (P, v, k) => [P[0] + v[0] * k, P[1] + v[1] * k];
        wall(tileMat, off(A, uy, -t), off(B, uy, -t), neg(uy), [{ a: 0.15, b: 0.85, y1: 2.1 }]); wall(tileMat, off(B, uy, t), off(A, uy, t), uy, [{ a: ur - it.u0 - 0.85, b: ur - it.u0 - 0.15, y1: 2.1 }]);
        wall(tileMat, off(A, ux, -t), off(C, ux, -t), neg(ux)); wall(tileMat, off(C, ux, t), off(A, ux, t), ux);
        const hp = (u, v) => at(it.u0 + u, it.v0 + v), hw = it.u1 - it.u0;
        { const p = hp(0.5 + 0.3, -0.07); place('sliding', p[0], p[1], neg(uy)); } // the sliding door, half open over the wall
        { const p = hp(hw / 2, 1.0); place('headfloor', p[0], p[1], uy); }
        { const p = hp(hw - 0.33, 0.95); place('toilet', p[0], p[1], neg(ux)); kitObs(D3, p[0], p[1], 0.3); }
        { const p = hp(hw - 0.25, 0.3); place('basin', p[0], p[1], neg(ux)); }
        { const p = hp(hw / 2, 2.0 - 0.45); place('shower', p[0], p[1], neg(uy)); const g0 = hp(0.05, 2.0 - 0.92), g1 = hp(hw - 0.62, 2.0 - 0.92); kitSeg(D3, g0[0], g0[1], g1[0], g1[1], 0.2); }
        { const p = hp(hw / 2, 1.0); D3.headLights = (D3.headLights || []).concat([[p[0], RH - 0.01, p[1]]]); }
      }
    });
    // ceiling light over the room's open floor, and where the light sits for d3Light
    const lp = at(Lay.w * 0.4, Math.max(1.2, Lay.d - 3.0)); place('cabinlight', lp[0], lp[1], uy, RH);
    const hd = Lay.items.find((i) => i.k === 'head'), hl = at((hd.u0 + hd.u1) / 2, (hd.v0 + hd.v1) / 2);
    const xs = wp.map((p) => p[0]), zs = wp.map((p) => p[1]);
    D3.cabins.push({ s, wpoly: wp, bb: [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)], lights: [[lp[0], RH - 0.05, lp[1], 1.5], [hl[0], RH - 0.05, hl[1], 0.7]] });
    // its door opens now, and its panel says what's inside
    const door = DOORS.find((q) => q.station === 'd3:' + s.id); if (door) door.auto = true;
    const beds = Lay.items.filter((i) => i.k === 'bed').length;
    STATIONS['d3:' + s.id] = { title: (s.n === 'Crew quarters' ? 'Crew cabin ' : 'Officer’s cabin ') + s.id, role: 'Deck 3',
      panel: () => ({ read: [['Berths', s.b > 1 ? 'Two' : 'One'], ['Inside', (Lay.items.some((i) => i.k === 'bunk') ? 'Bunk' : beds > 1 ? 'Two beds' : 'Bed') + ', desk, wardrobe, own head (shower, toilet, basin)']],
        note: 'Walk up to the door to go in.', acts: [] }) };
    D3.rooms.unshift({ label: (s.n === 'Crew quarters' ? 'Crew cabin ' : 'Cabin ') + s.id, test: (x, z) => { let c = false; for (let i = 0, j = n - 1; i < n; j = i++) { const [ax, az] = wp[i], [bx, bz] = wp[j]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) c = !c; } return c; } });
  });
  const extra = d3Rooms(Lt, { shell, put, wall, place, W2, RH, I });
  Object.assign(extra, d3Sickbay(Lt, { shell, put, place, RH }));
  geo.forEach((list, mat) => { const m = mesh(kitGeo(list), mat, 0, 0, 0, DECK3); m.name = 'Deck 3 rooms'; });
  // the fittings, each drawn as instances; local frames: +z faces into the room (beds: +z toward the foot)
  const P = (g, mat, x, y, z) => { const q = g.clone(); q.translate(x, y, z); return { geo: q, mat }; }, MIR = CKIT.mirror || (CKIT.mirror = new THREE.MeshStandardMaterial({ color: 0xdfe6ea, metalness: 1, roughness: 0.06, envMapIntensity: 1.4 }));
  const bedParts = (y) => [P(RBOX(0.95, 0.3, 2.05, 0.03), WOOD, 0, y + 0.15, 0), P(RBOX(0.88, 0.18, 1.95, 0.05), CERAMIC, 0, y + 0.39, 0), P(RBOX(0.92, 0.05, 1.3, 0.02), FABRIC, 0, y + 0.5, 0.32), P(RBOX(0.6, 0.1, 0.34, 0.04), CERAMIC, 0, y + 0.53, -0.76)];
  const KIT = {
    bed: bedParts(0).concat([P(RBOX(0.95, 1.0, 0.08, 0.02), MAT.leatherDark, 0, 0.62, -1.03), P(BOX(0.86, 0.018, 0.03), downlightMat, 0, 1.125, -1.0)]),
    bunk: bedParts(0).concat(bedParts(1.15), [-1, 1].flatMap((sx) => [-1, 1].map((sz) => P(CYL(0.025, 0.025, 1.85, 8), MAT.steel, sx * 0.45, 0.92, sz * 1.0)))),
    desk: [P(RBOX(0.9, 0.04, 0.6, 0.012), WOOD, 0, 0.74, 0), P(RBOX(0.04, 0.72, 0.56, 0.01), WOOD, -0.42, 0.36, 0), P(RBOX(0.04, 0.72, 0.56, 0.01), WOOD, 0.42, 0.36, 0),
      P(RBOX(0.5, 0.32, 0.03, 0.01), MAT.gunDark, 0, 1.0, -0.22), P(new THREE.PlaneGeometry(0.46, 0.28), D3.screenMat, 0, 1.0, -0.204)],
    chair: [P(RBOX(0.46, 0.06, 0.46, 0.02), MAT.leather, 0, 0.46, 0), P(RBOX(0.46, 0.5, 0.06, 0.02), MAT.leather, 0, 0.75, -0.22), P(CYL(0.03, 0.03, 0.42, 8), MAT.steel, 0, 0.22, 0), P(CYL(0.24, 0.24, 0.03, 16), MAT.steel, 0, 0.02, 0)],
    wardrobe: [P(RBOX(0.8, 2.05, 0.58, 0.02), WOOD, 0, 1.025, 0), P(BOX(0.012, 1.7, 0.012), MAT.steel, 0, 1.025, 0.295)],
    sliding: [P(RBOX(0.72, 2.1, 0.03, 0.01), CERAMIC, 0, 1.05, 0)],
    headfloor: [P((() => { const g = new THREE.PlaneGeometry(1.2, 1.9); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1.2, uv.getY(i) * 1.9); return g; })(),
      CKIT.bathFloor || (CKIT.bathFloor = (() => { const c = cnv(128, 128), g = c.getContext('2d'), r = mulberry(71); g.fillStyle = '#b9bcb8'; g.fillRect(0, 0, 128, 128);
        for (let y = 0; y < 128; y += 32) for (let x = 0; x < 128; x += 32) { const v = 178 + Math.round(r() * 14); g.fillStyle = `rgb(${v},${v + 2},${v})`; g.fillRect(x + 1, y + 1, 30, 30); }
        const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, envMapIntensity: 0.6 }); })()), 0, 0.006, 0)],
    toilet: [P(RBOX(0.38, 0.4, 0.5, 0.08), CERAMIC, 0, 0.2, 0.05), P(RBOX(0.38, 0.36, 0.17, 0.03), CERAMIC, 0, 0.58, -0.22), P(RBOX(0.4, 0.03, 0.46, 0.03), CERAMIC, 0, 0.42, 0.06), P(BOX(0.16, 0.01, 0.09), MAT.steel, 0, 0.765, -0.22)],
    basin: [P(RBOX(0.46, 0.06, 0.42, 0.02), WOOD, 0, 0.82, 0), P(RBOX(0.36, 0.1, 0.3, 0.04), CERAMIC, 0, 0.88, 0.02), P(new THREE.PlaneGeometry(0.46, 0.6), MIR, 0, 1.45, -0.205), P(CYL(0.012, 0.012, 0.16, 8), MAT.steel, 0, 0.98, -0.14), P(BOX(0.44, 0.015, 0.1), MAT.steel, 0, 1.11, -0.15), P(CYL(0.025, 0.025, 0.12, 10), FABRIC, 0.14, 1.18, -0.15)],
    shower: [P(RBOX(1.2, 0.06, 0.86, 0.02), CERAMIC, 0, 0.03, 0), P(RBOX(0.62, 1.9, 0.012, 0.004), GLASS, -0.27, 1.0, 0.45), P(CYL(0.07, 0.07, 0.02, 16), MAT.steel, 0, 2.1, -0.35), P(CYL(0.012, 0.012, 0.9, 8), MAT.steel, 0.38, 1.35, -0.39), P(RBOX(0.05, 0.2, 0.05, 0.02), MAT.steel, 0.38, 1.55, -0.36), P(CYL(0.05, 0.05, 0.005, 12), MAT.steel, 0, 0.063, 0)],
    cabinlight: [P(RBOX(0.9, 0.04, 0.5, 0.015), MAT.steel, 0, -0.02, 0), P((() => { const g = new THREE.PlaneGeometry(0.78, 0.38); g.rotateX(Math.PI / 2); return g; })(), downlightMat, 0, -0.045, 0)],
  };
  Object.assign(KIT, extra);
  D3.cabinProps = {}; Object.entries(props).forEach(([k, list]) => { if (!KIT[k]) { console.warn('Deck 3: no kit for', k); return; } D3.cabinProps[k] = kitProps(D3, KIT[k], list, 'Deck 3 ' + k); });
  // a little variety from cabin to cabin: each bed's blanket in one of a few colours
  { const pal = [[1, 1, 1], [1.5, 0.75, 0.6], [0.7, 0.8, 1.35], [1.25, 1.1, 0.7], [0.85, 1.25, 0.9], [1.3, 0.8, 1.2]], c = new THREE.Color(), r = mulberry(83);
    ['bed', 'bunk'].forEach((k) => (D3.cabinProps[k] || []).filter((m) => m.material === FABRIC).forEach((m) => { for (let i = 0; i < m.count; i++) { c.setRGB(...pal[(r() * pal.length) | 0]); m.setColorAt(i, c); } m.instanceColor.needsUpdate = true; })); }
}

// ---------- standard rooms (roadmap C2): the deck's other ordinary rooms ----------
// Medical lab and morgue, the forward shield generator bays, the upper computer core, the pod feeds and torpedo
// magazine, the damage control station. Each gets the shared shell (d3Cabins' shell: bulkhead walls and deck plate in
// the working spaces), fittings laid out in its own frame (u along the door's wall, v into the room), a grid of
// ceiling lights (its own light space in d3Light), an opening door. Returns the fittings' kits (instanced by d3Cabins).
// Small props (mugs, data pads, tool cases) go on desks, benches and consoles in cabins and rooms alike.
function d3Rooms(Lt, C) {
  const { shell, put, wall, place, W2, RH } = C, bulk = roomWallMat(RH, 'bulk'), labWall = CKIT.bathWall || (CKIT.bathWall = roomWallMat(RH, 'bath')), neg = (v) => [-v[0], -v[1]];
  const inP = (P, x, z) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [ax, az] = P[i], [bx, bz] = P[j]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) c = !c; } return c; };
  const KINDS = { 'Medical lab and morgue': 'lab', 'Forward shield generator': 'shield', 'Computer core, upper': 'core', 'Pod feeds and torpedo magazine': 'magazine', 'Damage control station': 'dc' };
  D3.fitted = (D3.cabins || []).slice(); D3.roomsFitted = [];
  // small props on top of a fitting: off = [along its width, out from its back, height]
  const small = (k, p, off) => { const r = p.ry, ax = [Math.cos(r), -Math.sin(r)], az = [Math.sin(r), Math.cos(r)]; place(k, p.x + ax[0] * off[0] + az[0] * off[1], p.z + ax[1] * off[0] + az[1] * off[1], az, off[2]); };
  const placed = (k, x, z, dir, y) => { place(k, x, z, dir, y); return { x, z, ry: Math.atan2(dir[0], dir[1]) }; };
  // cabins' desks get a mug and a data pad
  (D3.cabins || []).forEach((c) => { const L = shipRoomLayout(c.s), d = L.items.find((i) => i.k === 'desk'); if (!d) return;
    const m = W2(L.at((d.u0 + d.u1) / 2, (d.v0 + d.v1) / 2)), ux = [L.ux[1], L.ux[0]], p = { x: m[0], z: m[1], ry: Math.atan2(ux[0], ux[1]) };
    small('mug', p, [0.3, 0.05, 0.76]); small('pad', p, [-0.15, 0.08, 0.76]); });
  Lt.F.spaces.forEach((s) => {
    const kind = KINDS[s.n]; if (!kind) return;
    const work = kind !== 'lab', { dd, wp, cx, cz } = shell(s, work ? MAT.floorPlate : MAT.roomCarpet, work ? bulk : labWall);
    // the frame: u along the door's wall, v into the room
    const nD = [-Math.sin(dd.rot), -Math.cos(dd.rot)], uy = nD, ux = [uy[1], -uy[0]], o = [dd.x, dd.z];
    const L = (u, v) => [o[0] + ux[0] * u + uy[0] * v, o[1] + ux[1] * u + uy[1] * v], inside = (u, v, m) => { const q = L(u, v); return inP(insetPoly(wp, m || 0), q[0], q[1]); };
    const loc = wp.map(([x, z]) => [(x - o[0]) * ux[0] + (z - o[1]) * ux[1], (x - o[0]) * uy[0] + (z - o[1]) * uy[1]]);
    const span = (v) => { const xs = []; loc.forEach((a, i) => { const b = loc[(i + 1) % loc.length]; if ((a[1] - v) * (b[1] - v) <= 0 && a[1] !== b[1]) xs.push(a[0] + (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1])); }); return xs.length > 1 ? [Math.min(...xs), Math.max(...xs)] : null; };
    const vmax = Math.max(...loc.map((p) => p[1])), lights = [];
    // a run of units w wide along depth v, between u0 and u1, facing dir; skip(u) leaves gaps
    const run = (k, v, u0, u1, w, dir, skip, obsR) => { const out = []; const n = Math.floor((u1 - u0) / w); const st = u0 + (u1 - u0 - n * w) / 2;
      for (let i = 0; i < n; i++) { const u = st + w * (i + 0.5); if (skip && skip(u)) continue; if (!inside(u - w / 2, v, 0.05) || !inside(u + w / 2, v, 0.05)) continue; const p = L(u, v); out.push(placed(k, p[0], p[1], dir)); if (obsR) kitObs(D3, p[0], p[1], obsR); }
      return out; };
    const near = (v) => { const q = span(v); return q ? [q[0] + 0.1, q[1] - 0.1] : [0, 0]; };
    if (kind === 'shield') {
      // the generator in the middle of the bay, conduits from its crown out to three walls, a console by the door
      const g = [cx, cz]; place('shgen', g[0], g[1], uy); kitObs(D3, g[0], g[1], 2.75);
      // a guard rail round it, open toward the door
      { const r = 2.7, a0 = Math.atan2(-uy[0], -uy[1]); [0.55, 1.0].forEach((y) => { const t = new THREE.TorusGeometry(r, 0.025, 6, 64, Math.PI * 2 - 0.9); t.rotateX(Math.PI / 2); t.rotateY(-(a0 + 0.45) + Math.PI / 2); t.translate(g[0], y, g[1]); put(MAT.steel, t); });
        for (let i = 0; i <= 12; i++) { const a = a0 + 0.45 + (Math.PI * 2 - 0.9) * i / 12, pst = CYL(0.03, 0.03, 1.0, 8); pst.translate(g[0] + Math.sin(a) * r, 0.5, g[1] + Math.cos(a) * r); put(MAT.steel, pst); } }
      [[1, 0], [0, 1], [Math.SQRT1_2, Math.SQRT1_2], [-1, 0], [0, -1]].forEach(([a, b]) => { const d = [ux[0] * a + uy[0] * b, ux[1] * a + uy[1] * b]; let t = 1.3; while (t < 20 && inP(wp, g[0] + d[0] * (t + 0.3), g[1] + d[1] * (t + 0.3))) t += 0.25;
        if (t < 2.5) return; const len = t - 1.3, cyl = CYL(0.11, 0.11, len, 10); cyl.rotateX(Math.PI / 2); cyl.rotateY(Math.atan2(d[0], d[1])); cyl.translate(g[0] + d[0] * (1.3 + len / 2), RH - 0.28, g[1] + d[1] * (1.3 + len / 2)); put(MAT.steel, cyl);
        const cl = BOX(0.32, 0.32, 0.12); cl.rotateY(Math.atan2(d[0], d[1])); cl.translate(g[0] + d[0] * (t - 0.06), RH - 0.28, g[1] + d[1] * (t - 0.06)); put(MAT.gunDark, cl); });
      const cu = inside(1.8, 1.6, 0.4) ? 1.8 : -1.8, cp = L(cu, 1.6), toG = [g[0] - cp[0], g[1] - cp[1]], lg = Math.hypot(...toG);
      const con = placed('console', cp[0], cp[1], neg([toG[0] / lg, toG[1] / lg])); kitObs(D3, cp[0], cp[1], 0.55); small('case', con, [0.75, 0.0, 0]);
    }
    if (kind === 'core') {
      const [a0, a1] = near(vmax - 0.5); run('rack', vmax - 0.45, a0, a1, 1.25, neg(uy), null, 0.5);
      const [b0, b1] = near(1.55); run('rack', 1.55, b0, b1, 1.25, uy, (u) => Math.abs(u) < 1.4, 0.5);
      const cp = L(a0 + 0.75, (1.9 + vmax - 0.8) / 2); const con = placed('console', cp[0], cp[1], ux); // at the end of the aisle, clear of the door kitObs(D3, cp[0], cp[1], 0.5); small('mug', con, [0.42, 0.15, 0.95]);
    }
    if (kind === 'magazine') {
      const [a0, a1] = near(vmax - 0.5); const racks = run('torprack', vmax - 0.45, a0, a1, 2.6, neg(uy), null);
      racks.forEach((r) => { const ax = [Math.cos(r.ry), -Math.sin(r.ry)]; [-1, 1].forEach((k) => kitObs(D3, r.x + ax[0] * k * 0.8, r.z + ax[1] * k * 0.8, 0.45)); });
      // the loading rail along the racks with its hoist, hazard lines on the deck in front, the feed trunk up to the pod
      const rv = vmax - 1.45, [r0, r1] = near(rv), A = L(r0 + 0.2, rv), B = L(r1 - 0.2, rv), rl = Math.hypot(B[0] - A[0], B[1] - A[1]);
      { const beam = BOX(rl, 0.16, 0.12); beam.rotateY(-Math.atan2(B[1] - A[1], B[0] - A[0])); beam.translate((A[0] + B[0]) / 2, RH - 0.1, (A[1] + B[1]) / 2); put(MAT.gun, beam);
        const st = BOX(rl, 0.02, 0.1); st.rotateY(-Math.atan2(B[1] - A[1], B[0] - A[0])); st.translate((A[0] + B[0]) / 2, 0.004, (A[1] + B[1]) / 2); put(MAT.hazard, st);
        const h = L((r0 + r1) / 2 - 1.0, rv); place('hoist', h[0], h[1], uy); }
      const fu = inside(a1 - 0.4, 1.7, 0.7) ? a1 - 0.4 : a0 + 0.4, fp = L(fu, 1.7); place('feed', fp[0], fp[1], uy); kitObs(D3, fp[0], fp[1], 0.75);
      const cp = L(fu > 0 ? fu - 1.9 : fu + 1.9, 1.3); const lk = placed('locker', cp[0], cp[1], fu > 0 ? ux : neg(ux)); kitObs(D3, cp[0], cp[1], 0.35);
    }
    if (kind === 'dc') {
      const [a0, a1] = near(vmax - 0.35); run('locker', vmax - 0.3, a0, a1, 0.64, neg(uy), null, 0.32);
      const sp1 = span(2.1), bp = L(sp1[0] + 0.08, 2.1); place('dcboard', bp[0], bp[1], ux);
      [1.3, 2.0].forEach((v) => { const t = L(span(v)[1] - 0.25, v); place('tank', t[0], t[1], neg(ux)); kitObs(D3, t[0], t[1], 0.22); });
      const bc = L(0, 2.45), bench = placed('worktable', bc[0], bc[1], uy); kitObs(D3, bc[0], bc[1], 0.75); small('case', bench, [-0.35, 0, 0.92]); small('pad', bench, [0.35, 0.1, 0.92]);
    }
    if (kind === 'lab') {
      // benches along the far straight wall, cabinets along the door's wall beside the door, the morgue's drawer bank
      // on the door's wall toward the ring with an examination table before it, an island in the middle
      let far = null; wp.forEach((A, i) => { const B = wp[(i + 1) % wp.length], len = Math.hypot(B[0] - A[0], B[1] - A[1]); if (len < 4) return; const e = [(B[0] - A[0]) / len, (B[1] - A[1]) / len];
        if (Math.abs(e[0] * ux[0] + e[1] * ux[1]) < 0.3 && (!far || len > far.len)) far = { A, B, len, e }; });
      if (far) { let nn = [-far.e[1], far.e[0]]; if ((cx - far.A[0]) * nn[0] + (cz - far.A[1]) * nn[1] < 0) nn = neg(nn);
        for (let t = 1.4; t + 0.9 < far.len - 1.0; t += 1.9) { const p = [far.A[0] + far.e[0] * (t + 0.9) + nn[0] * 0.36, far.A[1] + far.e[1] * (t + 0.9) + nn[1] * 0.36];
          if (!inP(wp, p[0], p[1])) continue; const b = placed('labbench', p[0], p[1], nn); kitSeg(D3, p[0] - far.e[0] * 0.92 + nn[0] * 0.36, p[1] - far.e[1] * 0.92 + nn[1] * 0.36, p[0] + far.e[0] * 0.92 + nn[0] * 0.36, p[1] + far.e[1] * 0.92 + nn[1] * 0.36, 0.2);
          small(t % 3.8 < 1.9 ? 'pad' : 'case', b, [0.55, 0.1, 0.92]); } }
      const side = inside(3.4, 0.5, 0.2) ? 1 : -1;
      run('cabinet', 0.32, side > 0 ? -7 : 1.4, side > 0 ? -1.4 : 7, 0.95, uy, null, 0.3);
      const mp = L(side * 3.4, 0.45); place('morgue', mp[0], mp[1], uy); kitSeg(D3, ...L(side * 3.4 - 1.25, 0.9), ...L(side * 3.4 + 1.25, 0.9), 0.2);
      const sp = L(side * 3.4, 2.4); place('slab', sp[0], sp[1], ux); kitObs(D3, sp[0], sp[1], 0.55);
      // three island benches across the middle of the lab, stools at them
      [-3.4, 0, 3.4].forEach((du, i) => { const ip = [cx + ux[0] * du, cz + ux[1] * du]; if (!inP(insetPoly(wp, 1.4), ip[0], ip[1])) return;
        const isl = placed('labisland', ip[0], ip[1], ux); [-0.6, 0.6].forEach((k) => kitObs(D3, ip[0] + uy[0] * k, ip[1] + uy[1] * k, 0.75));
        small(i === 1 ? 'mug' : 'pad', isl, [0.5, 0.2, 0.94]); if (i !== 1) small('case', isl, [-0.6, -0.1, 0.94]);
        [-0.5, 0.5].forEach((k) => { const sp = [ip[0] + uy[0] * k + ux[0] * 0.95, ip[1] + uy[1] * k + ux[1] * 0.95]; place('stool', sp[0], sp[1], neg(ux)); }); });
    }
    // ceiling lights on a 3 m grid over the floor (not over the generator), each also a light for d3Light
    const pts = [];
    for (let v = 1.4; v < vmax - 0.6; v += 3.0) { const q = span(v); if (!q) continue; const n = Math.max(1, Math.round((q[1] - q[0] - 1.2) / 3.0)); for (let i = 0; i < n; i++) { const u = q[0] + 0.6 + (q[1] - q[0] - 1.2) * (i + 0.5) / n; if (inside(u, v, 0.5)) pts.push(L(u, v)); } }
    pts.filter((p) => kind !== 'shield' || Math.hypot(p[0] - cx, p[1] - cz) > 2.4).forEach((p) => { place('roomlight', p[0], p[1], uy, RH); lights.push([p[0], RH - 0.05, p[1], 1.4]); });
    const xs = wp.map((p) => p[0]), zs = wp.map((p) => p[1]), entry = { s, kind, wpoly: wp, bb: [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)], lights };
    D3.fitted.push(entry); D3.roomsFitted.push(entry);
    const door = DOORS.find((q) => q.station === 'd3:' + (s.id || s.n)); if (door) door.auto = true;
    const what = { lab: 'Lab benches, an island bench, cabinets, the morgue’s drawer bank and an examination table', shield: 'The generator housing, its conduits and a control console',
      core: 'Two rows of core banks and a console', magazine: 'Torpedo racks, the loading rail and hoist, the feed trunk up to the weapons pod', dc: 'Repair lockers, the deck’s damage board, suppression tanks and a work table' }[kind];
    STATIONS['d3:' + (s.id || s.n)] = { title: s.n + (s.id ? ' ' + s.id : ''), role: 'Deck 3', panel: () => ({ read: [['Inside', what]], note: 'Walk up to the door to go in.', acts: [] }) };
    D3.rooms.unshift({ label: s.n, test: (x, z) => inP(wp, x, z) });
  });
  // the kits: +z faces out from the wall into the room
  const P = (g, mat, x, y, z) => { const q = g.clone(); q.translate(x, y, z); return { geo: q, mat }; }, R = (g, rx, ry, rz) => { const q = g.clone(); if (rx) q.rotateX(rx); if (ry) q.rotateY(ry); if (rz) q.rotateZ(rz); return q; };
  const glow = CKIT.shieldGlow || (CKIT.shieldGlow = new THREE.MeshStandardMaterial({ color: 0x241a30, emissive: new THREE.Color(0x8a5fb0), emissiveIntensity: 0.75, roughness: 0.4 }));
  const casing = CKIT.casing || (CKIT.casing = new THREE.MeshStandardMaterial({ color: 0x3b3f43, metalness: 0.7, roughness: 0.35, envMapIntensity: 0.8 }));
  const red = CKIT.red || (CKIT.red = new THREE.MeshStandardMaterial({ color: 0xa8322c, metalness: 0.3, roughness: 0.4 }));
  const caseMat = CKIT.caseMat || (CKIT.caseMat = new THREE.MeshStandardMaterial({ color: 0xb88a3a, metalness: 0.2, roughness: 0.5 }));
  const face = (w, h, draw) => { const c = cnv(w, h), g = c.getContext('2d'); draw(g, w, h); return new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }); };
  const rackFace = CKIT.rackFace2 || (CKIT.rackFace2 = face(128, 320, (g, w, h) => { g.fillStyle = '#05070b'; g.fillRect(0, 0, w, h); const r = mulberry(5);
    for (let y = 8; y < h - 8; y += 26) { g.fillStyle = '#121822'; g.fillRect(6, y, w - 12, 22); g.fillStyle = '#1b2433'; g.fillRect(8, y + 2, 60, 18);
      for (let x = 10; x < 64; x += 7) { g.fillStyle = ['#7FB6E8', '#B693C4', '#8DBF84', '#F2C88F', '#2a3a55'][(r() * 5) | 0]; g.fillRect(x, y + 5, 4, 12); }
      g.fillStyle = r() < 0.8 ? '#7FB6E8' : '#F0B44C'; g.fillRect(76, y + 8, 6, 6); g.fillStyle = '#2b3a52'; g.fillRect(88, y + 9, 26, 4); }
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8fb8ff'); gr.addColorStop(1, '#b693c4'); g.fillStyle = gr; g.fillRect(w - 6, 6, 3, h - 12); }));
  const morgueFace = CKIT.morgue || (CKIT.morgue = face(256, 64, (g, w, h) => { g.fillStyle = '#d8d6d0'; g.fillRect(0, 0, w, h); g.fillStyle = '#7E5C8E'; g.fillRect(8, 8, 60, 10); g.fillStyle = '#222'; g.font = `600 22px ${DISP}`; g.fillText('MORGUE', 80, 40); }));
  const dcFace = CKIT.dcBoard || (CKIT.dcBoard = face(512, 288, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); elbow(g, 10, 10, 50, 14, 220, 22, true, '#E05A50');
    g.fillStyle = '#E05A50'; g.font = `600 30px ${DISP}`; g.fillText('DAMAGE CONTROL · DECK 3', 72, 36);
    g.strokeStyle = '#D9B07E'; g.lineWidth = 6; g.beginPath(); g.arc(180, 160, 80, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(80, 160); g.lineTo(470, 160); g.moveTo(180, 60); g.lineTo(180, 260); g.stroke();
    [['FWD SHIELDS', 'NOMINAL', '#8DBF84'], ['HULL', 'NOMINAL', '#8DBF84'], ['LIFT 2', 'OFFLINE', '#F0B44C']].forEach(([a, b, c], i) => { g.fillStyle = '#D9B07E'; g.font = `500 22px ${DISP}`; g.fillText(a, 300, 214 + i * 26); g.fillStyle = c; g.fillText(b, 420, 214 + i * 26); }); }));
  const padFace = CKIT.pad || (CKIT.pad = face(64, 96, (g, w, h) => { g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h); g.fillStyle = '#E8A06A'; g.fillRect(6, 6, 30, 8); g.fillStyle = '#B693C4'; for (let y = 22; y < 86; y += 10) g.fillRect(8, y, 20 + ((y * 7) % 26), 4); }));
  // a photon torpedo: a turned casing (lathe) lying along x, nose to +x, a lit warhead band, four tail fins, a hazard ring
  const torpGeo = CKIT.torpGeo || (CKIT.torpGeo = (() => { const pts = [[0.0, -1.0], [0.1, -0.99], [0.15, -0.9], [0.19, -0.86], [0.23, -0.7], [0.25, -0.5], [0.25, 0.45], [0.235, 0.62], [0.19, 0.8], [0.11, 0.94], [0.0, 1.0]].map(([r, y]) => new THREE.Vector2(r, y));
    const g = new THREE.LatheGeometry(pts, 20); g.rotateZ(-Math.PI / 2); return g; })());
  const torpCase = CKIT.torpCase || (CKIT.torpCase = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.025, 0.03, 0.036), metalness: 0.5, roughness: 0.45, envMapIntensity: 0.6 }));
  const torpGlow = CKIT.torpGlow || (CKIT.torpGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1.0, 0.42, 0.22), toneMapped: false }));
  const torp = (y) => [P(torpGeo, torpCase, 0, y, 0), P(R(CYL(0.255, 0.255, 0.05, 28), 0, 0, Math.PI / 2), torpGlow, 0.52, y, 0), P(R(CYL(0.255, 0.255, 0.03, 28), 0, 0, Math.PI / 2), torpGlow, 0.62, y, 0),
    P(R(CYL(0.252, 0.252, 0.08, 28), 0, 0, Math.PI / 2), MAT.hazard, -0.55, y, 0), P(R(CYL(0.2, 0.2, 0.06, 20), 0, 0, Math.PI / 2), MAT.gunDark, -0.97, y, 0)]
    .concat([0, 1, 2, 3].map((k) => P(R(BOX(0.34, 0.02, 0.2), k * Math.PI / 2 + Math.PI / 4, 0, 0).translate(0, Math.cos(k * Math.PI / 2 + Math.PI / 4) * 0.2, Math.sin(k * Math.PI / 2 + Math.PI / 4) * 0.2), MAT.gun, -0.8, y, 0)));
  return {
    shgen: [P(CYL(2.0, 2.1, 0.2, 40), MAT.gunDark, 0, 0.1, 0), P(CYL(1.5, 1.5, 1.85, 40), casing, 0, 1.12, 0), P(CYL(1.53, 1.53, 0.32, 40), glow, 0, 1.3, 0), P(CYL(1.15, 1.5, 0.3, 40), MAT.gunDark, 0, 2.2, 0), P(R(new THREE.TorusGeometry(2.4, 0.04, 4, 64), Math.PI / 2), MAT.hazard, 0, 0.01, 0), P(R(new THREE.TorusGeometry(1.25, 0.03, 6, 40), Math.PI / 2), glow, 0, 2.36, 0)]
      .concat([0, 1, 2, 3, 4, 5].map((i) => { const a = i * Math.PI / 3; return P(BOX(0.14, 1.85, 0.22), MAT.gunDark, Math.sin(a) * 1.55, 1.12, Math.cos(a) * 1.55); })),
    console: [P(BOX(1.2, 0.85, 0.6), MAT.gunDark, 0, 0.425, 0), P(R(BOX(1.2, 0.05, 0.55), -0.45), MAT.gun, 0, 0.96, 0.02), P(R(new THREE.PlaneGeometry(1.0, 0.42), -Math.PI / 2 - 0.45), D3.screenMat, 0, 0.99, 0.03)],
    rack: [P(BOX(1.2, 2.45, 0.6), MAT.gunDark, 0, 1.225, -0.06), P(new THREE.PlaneGeometry(1.0, 2.1), rackFace, 0, 1.2, 0.245),
      P(BOX(1.2, 0.05, 0.05), CKIT.rackGlow || (CKIT.rackGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.55, 0.45, 1.0), toneMapped: false })), 0, 2.38, 0.36),
      P(BOX(1.2, 0.04, 0.05), CKIT.rackGlow, 0, 0.08, 0.36), P(BOX(1.24, 0.08, 0.76), MAT.gun, 0, 2.49, 0), P(BOX(0.05, 2.3, 0.05), MAT.gun, -0.58, 1.2, 0.36), P(BOX(0.05, 2.3, 0.05), MAT.gun, 0.58, 1.2, 0.36),
      P(BOX(1.1, 0.008, 0.06), CKIT.rackGlow, 0, 0.004, 0.62)],
    torprack: [P(BOX(0.12, 2.0, 0.66), MAT.gunDark, -1.28, 1.0, 0), P(BOX(0.12, 2.0, 0.66), MAT.gunDark, 1.28, 1.0, 0), P(BOX(2.6, 0.1, 0.66), MAT.gunDark, 0, 2.0, 0), P(BOX(2.5, 0.04, 0.5), MAT.gun, 0, 0.05, 0.02),
      P(BOX(0.02, 1.7, 0.02), torpGlow, -1.22, 1.0, 0.33), P(BOX(0.02, 1.7, 0.02), torpGlow, 1.22, 1.0, 0.33), P(BOX(2.3, 0.02, 0.02), CKIT.rackGlow || (CKIT.rackGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.55, 0.45, 1.0), toneMapped: false })), 0, 1.94, 0.33)]
      .concat([0.48, 1.18].flatMap((y) => [-0.6, 0.6].flatMap((x) => [P(BOX(0.16, 0.2, 0.56), MAT.gun, x, y, 0), P(R(new THREE.TorusGeometry(0.27, 0.025, 6, 20, Math.PI), 0, Math.PI / 2, Math.PI), MAT.steel, x, y + 0.34, 0)])),
        [0.48, 1.18].map((y) => P(BOX(2.44, 0.05, 0.12), MAT.gunDark, 0, y - 0.1, -0.24)), torp(0.82), torp(1.52)),
    hoist: [P(BOX(0.4, 0.28, 0.5), MAT.gunDark, 0, RH - 0.32, 0), P(CYL(0.01, 0.01, 0.6, 6), MAT.steel, 0, RH - 0.76, 0), P(BOX(0.3, 0.06, 0.06), MAT.hazard, 0, RH - 1.08, 0)],
    feed: [P(CYL(0.6, 0.6, RH, 24), MAT.gun, 0, RH / 2, 0), P(CYL(0.72, 0.72, 0.14, 24), MAT.hazard, 0, 0.07, 0), P(BOX(0.5, 0.7, 0.04), MAT.gunDark, 0, 1.3, 0.6)],
    locker: [P(BOX(0.6, 2.0, 0.5), MAT.panel, 0, 1.0, 0), P(BOX(0.01, 1.8, 0.01), MAT.gunDark, 0, 1.0, 0.252), ...[1.6, 1.68, 1.76].map((y) => P(BOX(0.36, 0.015, 0.01), MAT.gunDark, 0, y, 0.252)), P(BOX(0.04, 0.12, 0.03), MAT.steel, 0.2, 1.05, 0.26)],
    dcboard: [P(BOX(1.8, 1.0, 0.05), MAT.gunDark, 0, 1.5, 0.025), P(new THREE.PlaneGeometry(1.7, 0.9), dcFace, 0, 1.5, 0.052)],
    tank: [P(CYL(0.18, 0.18, 1.1, 16), red, 0, 0.55, 0), P(CYL(0.05, 0.05, 0.14, 8), MAT.steel, 0, 1.17, 0), P(BOX(0.42, 0.05, 0.08), MAT.gunDark, 0, 0.9, -0.16)],
    worktable: [P(BOX(1.6, 0.05, 0.8), MAT.steel, 0, 0.9, 0), P(BOX(1.5, 0.85, 0.7), MAT.panel, 0, 0.43, 0)],
    labbench: [P(BOX(1.82, 0.86, 0.64), MAT.panel, 0, 0.43, 0), P(BOX(1.86, 0.04, 0.7), CERAMIC, 0, 0.88, 0), P(BOX(1.86, 0.5, 0.03), CERAMIC, 0, 1.15, -0.34),
      P(BOX(0.3, 0.36, 0.32), MAT.panel, -0.5, 1.08, -0.1), P(CYL(0.05, 0.05, 0.22, 10), MAT.gunDark, -0.5, 1.33, -0.05), P(BOX(0.5, 0.32, 0.03), MAT.gunDark, 0.25, 1.12, -0.25), P(new THREE.PlaneGeometry(0.46, 0.28), D3.screenMat, 0.25, 1.12, -0.234)],
    labisland: [P(BOX(2.4, 0.86, 1.1), MAT.panel, 0, 0.43, 0), P(BOX(2.5, 0.04, 1.2), CERAMIC, 0, 0.88, 0), P(BOX(0.4, 0.05, 0.3), MAT.steel, 0.6, 0.9, 0)],
    cabinet: [P(BOX(0.9, 2.0, 0.5), MAT.panel, 0, 1.0, 0), P(new THREE.PlaneGeometry(0.8, 1.0), GLASS, 0, 1.45, 0.252), P(BOX(0.8, 0.02, 0.4), CERAMIC, 0, 1.2, 0.03), P(BOX(0.8, 0.02, 0.4), CERAMIC, 0, 1.6, 0.03)],
    morgue: [P(BOX(2.5, 2.1, 0.8), MAT.steel, 0, 1.05, 0)].concat([0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => P(BOX(0.76, 0.6, 0.02), MAT.panel, (c - 1) * 0.8, 0.45 + r * 0.66, 0.41))),
      [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => P(BOX(0.3, 0.03, 0.04), MAT.gunDark, (c - 1) * 0.8, 0.62 + r * 0.66, 0.43))), [P(new THREE.PlaneGeometry(0.8, 0.2), morgueFace, 0, 2.2, 0.401)]),
    stool: [P(CYL(0.19, 0.19, 0.05, 14), MAT.leather, 0, 0.68, 0), P(CYL(0.025, 0.025, 0.66, 8), MAT.steel, 0, 0.34, 0), P(CYL(0.2, 0.2, 0.02, 14), MAT.steel, 0, 0.01, 0)],
    slab: [P(BOX(0.8, 0.06, 2.0), MAT.steel, 0, 0.88, 0), P(CYL(0.08, 0.08, 0.82, 10), MAT.steel, 0, 0.42, 0), P(BOX(0.6, 0.04, 0.9), MAT.gunDark, 0, 0.02, 0)],
    roomlight: [P(BOX(1.2, 0.04, 0.5), MAT.steel, 0, -0.02, 0), P(R(new THREE.PlaneGeometry(1.08, 0.38), Math.PI / 2), downlightMat, 0, -0.045, 0)],
    mug: [P(CYL(0.04, 0.035, 0.09, 12), CERAMIC, 0, 0.045, 0), P(R(new THREE.TorusGeometry(0.025, 0.007, 6, 10), 0, Math.PI / 2), CERAMIC, 0.045, 0.05, 0)],
    pad: [P(BOX(0.16, 0.012, 0.22), MAT.gunDark, 0, 0.006, 0), P(R(new THREE.PlaneGeometry(0.14, 0.2), -Math.PI / 2), padFace, 0, 0.013, 0)],
    case: [P(BOX(0.45, 0.12, 0.32), caseMat, 0, 0.06, 0), P(BOX(0.16, 0.03, 0.03), MAT.gunDark, 0, 0.135, 0)],
  };
}

// ---------- sickbay (roadmap D2): the deck's hero room ----------
// Built from the shared layout (shipSickbayLayout, the same one the floor plan and its check use): white panel walls
// with a teal band, a pale polished floor; eight biobeds round the curved wall, each with its wall panel (a live-looking
// readout) and a bedside cabinet; the glass-walled surgery in the middle (operating table under a lamp ring, two
// consoles), the isolation room and the CMO's office in glass; staff station, stores, replicator; ceiling lights (one
// light space in d3Light). Glass walls, frames and trim are merged into the deck's room meshes; fittings are instanced.
// Returns the fittings' kits (d3Cabins instances them with the rest).
function d3Sickbay(Lt, C) {
  const { shell, put, place, RH } = C, s = Lt.F.spaces.find((q) => q.n === 'Sickbay'), Lay = s && shipSickbayLayout(s); if (!Lay) return {};
  const W = (p) => [p[1], p[0] - 64], Wd = (f) => [f[1], f[0]], neg = (v) => [-v[0], -v[1]];
  // materials (kept on CKIT so a rebuild reuses them)
  const white = CKIT.medWhite || (CKIT.medWhite = new THREE.MeshStandardMaterial({ color: 0xdfe4e4, roughness: 0.38, metalness: 0.04, envMapIntensity: 0.7 }));
  const teal = CKIT.medTeal || (CKIT.medTeal = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.03, 0.3, 0.28), roughness: 0.45, metalness: 0.05, envMapIntensity: 0.5 }));
  const tealCloth = CKIT.medCloth || (CKIT.medCloth = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.05, 0.26, 0.25), roughness: 0.95 }));
  const glow = CKIT.medGlow || (CKIT.medGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.35, 0.95, 0.9), toneMapped: false }));
  const glass = CKIT.medGlass || (CKIT.medGlass = Object.assign(GLASS.clone(), { side: THREE.DoubleSide, opacity: 0.13 }));
  const floor = CKIT.medFloor || (CKIT.medFloor = (() => { const c = cnv(256, 256), g = c.getContext('2d'); g.fillStyle = '#d4d9d8'; g.fillRect(0, 0, 256, 256);
    const r = mulberry(61); for (let i = 0; i < 2500; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.035)'; g.fillRect(r() * 256, r() * 256, 1.5, 1.5); }
    g.fillStyle = 'rgba(70,90,92,0.35)'; g.fillRect(0, 0, 256, 2); g.fillRect(0, 0, 2, 256); g.fillStyle = 'rgba(70,90,92,0.15)'; g.fillRect(0, 127, 256, 1); g.fillRect(127, 0, 1, 256);
    const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return new THREE.MeshStandardMaterial({ map: t, roughness: 0.3, metalness: 0.02, envMapIntensity: 0.55 }); })());
  const wallMat = CKIT.medWall || (CKIT.medWall = roomWallMat(RH, 'med'));
  const face = (w, h, draw) => { const c = cnv(w, h), g = c.getContext('2d'); draw(g, w, h); return new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }); };
  const bioFace = CKIT.bioFace || (CKIT.bioFace = face(256, 144, (g, w, h) => { g.fillStyle = '#020708'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a9d97'; g.fillRect(8, 8, 70, 14); g.fillStyle = '#9fe3dc'; g.font = `600 15px ${DISP}`; g.fillText('BIOBED', 86, 21);
    [['#7fe0d6', 44], ['#E8A06A', 76], ['#B693C4', 108]].forEach(([c, y], k) => { g.strokeStyle = c; g.lineWidth = 2; g.beginPath();
      for (let x = 10; x < 180; x += 2) { const t = (x + k * 17) % 46; const v = k === 0 ? (t < 3 ? -16 : t < 5 ? 10 : 0) : Math.sin(x * (0.11 + k * 0.05)) * 7; g.lineTo(x, y + v); } g.stroke(); });
    [['72', '#7fe0d6'], ['98', '#E8A06A'], ['36.8', '#B693C4']].forEach(([t, c], k) => { g.fillStyle = c; g.font = `600 22px ${DISP}`; g.fillText(t, 192, 52 + k * 32); }); }));
  const conFace = CKIT.surgFace || (CKIT.surgFace = face(256, 128, (g, w, h) => { g.fillStyle = '#020708'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a9d97'; g.fillRect(6, 6, 60, 12); g.fillStyle = '#9fe3dc'; g.font = `600 13px ${DISP}`; g.fillText('SURGICAL FIELD', 72, 17);
    g.strokeStyle = '#7fe0d6'; g.lineWidth = 2; g.strokeRect(14, 30, 110, 88); g.beginPath(); g.ellipse(69, 74, 22, 36, 0, 0, Math.PI * 2); g.stroke();
    [0, 1, 2, 3].forEach((i) => { g.fillStyle = ['#E8A06A', '#B693C4', '#7fe0d6', '#F2C88F'][i]; g.fillRect(140, 34 + i * 21, 30 + i * 18, 12); }); }));
  const { dd, wp } = shell(s, floor, wallMat);
  const lights = [], seg = (A, B) => kitSeg(D3, A[0], A[1], B[0], B[1], 0.2);
  // a box of length L along direction u (world [x, z]) centred at p, height h from y0, depth d
  const bar = (mat, p, u, L, y0, h, d) => { const g = BOX(L, h, d); g.rotateY(-Math.atan2(u[1], u[0])); g.translate(p[0], y0 + h / 2, p[1]); put(mat, g); };
  const quad = (mat, A, B, y0, y1) => { const u = [B[0] - A[0], B[1] - A[1]], L = Math.hypot(...u); put(mat, kitQuad([[A[0], y0, A[1]], [B[0], y0, B[1]], [B[0], y1, B[1]], [A[0], y1, A[1]]], [[0, 0], [L, 0], [L, y1 - y0], [0, y1 - y0]], [-u[1] / L, 0, u[0] / L])); };
  // ---------- glass rooms: a white frame (kick, header, posts), full-height glass, a teal line at hand height, a
  // doorway with its glass door slid open beside it; edges along the room's own walls get no glass
  const nearWall = (p) => wp.some((A, i) => { const B = wp[(i + 1) % wp.length], L2 = (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2, t = Math.max(0, Math.min(1, ((p[0] - A[0]) * (B[0] - A[0]) + (p[1] - A[1]) * (B[1] - A[1])) / L2));
    return Math.hypot(A[0] + t * (B[0] - A[0]) - p[0], A[1] + t * (B[1] - A[1]) - p[1]) < 0.3; });
  const glassRooms = [];
  Lay.items.filter((q) => q.glass).forEach((q) => {
    const P = q.poly.map(W), inn = W(q.c), edges = [];
    for (let i = 0; i < 4; i++) { const A = P[i], B = P[(i + 1) % 4], M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; if (nearWall(M)) continue;
      const L = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], hole = i === 0 ? q.w / 2 - q.door : null; // edge 0 is the front, corner 0 at +w/2
      let nn = [-u[1], u[0]]; if ((inn[0] - A[0]) * nn[0] + (inn[1] - A[1]) * nn[1] < 0) nn = neg(nn); // nn: into the glass room
      const at = (t) => [A[0] + u[0] * t, A[1] + u[1] * t], runs = hole === null ? [[0, L]] : [[0, hole - 0.6], [hole + 0.6, L]];
      runs.forEach(([a, b]) => { if (b - a < 0.05) return; quad(glass, at(a), at(b), 0.1, RH - 0.12); bar(white, at((a + b) / 2), u, b - a, 0, 0.1, 0.09); seg(at(a), at(b));
        [-1, 1].forEach((k) => bar(glow, [at((a + b) / 2)[0] + nn[0] * k * 0.006, at((a + b) / 2)[1] + nn[1] * k * 0.006], u, b - a - 0.04, 1.07, 0.035, 0.002)); });
      bar(white, at(L / 2), u, L + 0.08, RH - 0.12, 0.12, 0.1);
      const posts = [0, L]; if (hole !== null) posts.push(hole - 0.6, hole + 0.6); for (const [a, b] of runs) { const n = Math.floor((b - a) / 1.6); for (let k = 1; k <= n; k++) posts.push(a + (b - a) * k / (n + 1)); }
      posts.forEach((t) => bar(white, at(t), u, 0.06, 0, RH, 0.09));
      if (hole !== null) { quad(glass, at(hole - 0.6), at(hole + 0.6), 2.3, RH - 0.12); bar(white, at(hole), u, 1.2, 2.24, 0.06, 0.09);
        // the door, slid open inside the room over the glass beside the doorway
        const side = hole + 1.2 <= L - 0.05 ? 1 : -1, d0 = at(hole + side * 0.6), d1 = at(hole + side * 1.8), o = (p) => [p[0] + nn[0] * 0.07, p[1] + nn[1] * 0.07];
        quad(glass, o(d0), o(d1), 0.04, 2.26); bar(white, o(at(hole + side * 1.2)), u, 1.2, 2.24, 0.04, 0.03); bar(white, o(at(hole + side * 0.62)), u, 0.04, 0.04, 2.22, 0.03); bar(white, o(at(hole + side * 1.78)), u, 0.04, 0.04, 2.22, 0.03);
        edges.push({ door: at(hole), out: neg(nn) }); }
    }
    glassRooms.push({ q, door: edges[0] });
  });
  // ---------- fittings
  const KK = { bed: 'biobed', bedhead: 'bedhead', bedside: 'bedside', optable: 'optable', lamp: 'oplamp', surgcon: 'surgcon', station: 'medstation', desk: 'cmodesk', chair: 'chair', medcab: 'medcab', replicator: 'replicator' };
  const box4 = (q) => { const P = q.poly.map(W); for (let i = 0; i < 4; i++) seg(P[i], P[(i + 1) % 4]); };
  Lay.items.forEach((q) => { const k = KK[q.k]; if (!k) return; const c = W(q.c), f = Wd(q.f);
    place(k, c[0], c[1], f, q.k === 'lamp' ? RH : 0);
    if (q.k === 'bed') [-0.5, 0.5].forEach((o) => kitObs(D3, c[0] + f[0] * o, c[1] + f[1] * o, 0.5));
    else if (/optable|surgcon|station|desk|replicator/.test(q.k)) box4(q);
    else if (q.k === 'medcab' || q.k === 'bedside') kitObs(D3, c[0], c[1], q.k === 'medcab' ? 0.36 : 0.28); });
  // signs over the glass doors, on the ward side
  glassRooms.forEach(({ q, door }) => { if (!door) return; const t = { surgery: 'SURGERY', isolation: 'ISOLATION', office: 'CMO' }[q.k];
    kitLabel(D3, t, door.door[0] + door.out[0] * 0.07, RH - 0.3, door.door[1] + door.out[1] * 0.07, Math.atan2(door.out[0], door.out[1]), t.length > 4 ? 0.62 : 0.4); });
  // ---------- ceiling lights: round the ward between the surgery and the beds, the alcove, each glass room
  const L = (p, k) => { place('roomlight', p[0], p[1], [0, 1], RH); lights.push([p[0], RH - 0.05, p[1], k]); };
  [24, 38, 52, 66, 80].forEach((t) => L(W(Lay.at(13.0, t)), 1.3));
  [W(Lay.at(6.5, 80)), W([64.4, -3.0])].forEach((p) => L(p, 1.2));
  glassRooms.forEach(({ q }) => { if (q.k !== 'surgery') L(W(q.c), q.k === 'office' ? 1.1 : 1.2); });
  { const c = W(Lay.items.find((q) => q.k === 'surgery').c); lights.push([c[0], RH - 0.5, c[1], 3.2]); }
  // a light band hung round the ward, following the curved wall over the foot of the beds
  { const r = 14.2, t0 = 18, t1 = 84, n = 22; for (let i = 0; i < n; i++) { const A = W(Lay.at(r, t0 + (t1 - t0) * i / n)), B = W(Lay.at(r, t0 + (t1 - t0) * (i + 1) / n)), M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], u = [B[0] - A[0], B[1] - A[1]], l = Math.hypot(...u);
    bar(white, M, u, l + 0.01, RH - 0.06, 0.06, 0.26); bar(downlightMat, M, u, l + 0.01, RH - 0.075, 0.015, 0.18); bar(glow, M, u, l + 0.01, RH - 0.1, 0.012, 0.03);
    if (i % 2) lights.push([M[0], RH - 0.1, M[1], 0.45]); } } // the band lights the bed feet
  // ---------- the room in the deck's lists: a light space, the readout, its door open, its panel
  const xs = wp.map((p) => p[0]), zs = wp.map((p) => p[1]), entry = { s, kind: 'sickbay', wpoly: wp, bb: [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)], lights, glassRooms };
  D3.fitted.push(entry); D3.sickbay = entry;
  const inP = (P, x, z) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [ax, az] = P[i], [bx, bz] = P[j]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) c = !c; } return c; };
  const sub = { surgery: 'Sickbay · surgery', isolation: 'Sickbay · isolation', office: 'Sickbay · CMO’s office' };
  D3.rooms.unshift({ label: 'Sickbay', test: (x, z) => inP(wp, x, z) });
  glassRooms.forEach(({ q }) => { const P = q.poly.map(W); D3.rooms.unshift({ label: sub[q.k], test: (x, z) => inP(P, x, z) }); });
  const door = DOORS.find((q) => q.station === 'd3:' + s.id); if (door) door.auto = true;
  STATIONS['d3:' + s.id] = { title: 'Sickbay ' + s.id, role: 'Deck 3', panel: () => ({ read: [['Ward', 'Eight biobeds'], ['Also', 'Surgery, isolation room, the CMO’s office, staff station, stores']],
    note: 'Walk up to the door to go in.', acts: [] }) };
  // ---------- the kits: +z faces out from the wall into the room (beds: +z toward the foot)
  const Pp = (g, mat, x, y, z) => { const q = g.clone(); q.translate(x, y, z); return { geo: q, mat }; }, R = (g, rx, ry) => { const q = g.clone(); if (rx) q.rotateX(rx); if (ry) q.rotateY(ry); return q; };
  const flat = (w, h) => new THREE.PlaneGeometry(w, h);
  return {
    biobed: [Pp(RBOX(0.62, 0.42, 1.5, 0.05), white, 0, 0.21, 0), Pp(BOX(0.64, 0.04, 1.52), teal, 0, 0.4, 0), Pp(RBOX(0.96, 0.08, 2.06, 0.03), white, 0, 0.46, 0),
      Pp(RBOX(0.88, 0.12, 1.96, 0.05), CERAMIC, 0, 0.56, 0), Pp(RBOX(0.92, 0.04, 0.95, 0.02), tealCloth, 0, 0.63, 0.48), Pp(RBOX(0.56, 0.09, 0.32, 0.04), CERAMIC, 0, 0.66, -0.78),
      Pp(BOX(0.025, 0.035, 0.9), MAT.steel, 0.47, 0.76, 0.05), Pp(BOX(0.025, 0.035, 0.9), MAT.steel, -0.47, 0.76, 0.05),
      ...[-0.35, 0.45].flatMap((z) => [0.47, -0.47].map((x) => Pp(CYL(0.012, 0.012, 0.22, 6), MAT.steel, x, 0.64, z)))],
    bedhead: [Pp(RBOX(1.3, 0.95, 0.06, 0.02), white, 0, 1.45, 0), Pp(flat(0.86, 0.48), bioFace, 0, 1.5, 0.032), Pp(BOX(1.2, 0.03, 0.02), glow, 0, 0.99, 0.03), Pp(BOX(1.3, 0.05, 0.08), teal, 0, 1.95, 0.01)],
    bedside: [Pp(RBOX(0.48, 0.72, 0.42, 0.02), white, 0, 0.36, 0), Pp(BOX(0.5, 0.03, 0.44), teal, 0, 0.735, 0), Pp(BOX(0.3, 0.015, 0.01), MAT.steel, 0, 0.55, 0.212)],
    optable: [Pp(RBOX(0.7, 0.05, 0.9, 0.02), white, 0, 0.025, 0), Pp(CYL(0.16, 0.22, 0.72, 20), white, 0, 0.41, 0), Pp(RBOX(0.64, 0.08, 2.0, 0.03), white, 0, 0.81, 0), Pp(RBOX(0.58, 0.06, 1.9, 0.03), tealCloth, 0, 0.88, 0)],
    oplamp: [Pp(CYL(0.03, 0.03, 0.42, 8), MAT.steel, 0, -0.21, 0), Pp(R(new THREE.TorusGeometry(0.55, 0.06, 10, 40), Math.PI / 2), white, 0, -0.45, 0), Pp(R(new THREE.CircleGeometry(0.5, 32), Math.PI / 2), downlightMat, 0, -0.47, 0),
      Pp(R(new THREE.TorusGeometry(0.56, 0.012, 6, 40), Math.PI / 2), glow, 0, -0.51, 0)],
    surgcon: [Pp(RBOX(1.0, 0.85, 0.5, 0.02), white, 0, 0.425, 0), Pp(BOX(1.0, 0.06, 0.46), teal, 0, 0.03, 0.02), Pp(R(RBOX(1.0, 0.05, 0.5, 0.015), -0.45), white, 0, 0.96, 0.02), Pp(R(flat(0.86, 0.38), -Math.PI / 2 - 0.45), conFace, 0, 0.99, 0.03)],
    medstation: [Pp(RBOX(2.2, 0.95, 0.62, 0.02), white, 0, 0.475, -0.02), Pp(BOX(2.18, 0.1, 0.58), teal, 0, 0.05, 0), Pp(RBOX(2.24, 0.04, 0.7, 0.015), CERAMIC, 0, 0.97, 0), Pp(BOX(2.1, 0.025, 0.02), glow, 0, 0.8, 0.31),
      ...[-0.55, 0.55].flatMap((x) => [Pp(RBOX(0.62, 0.42, 0.04, 0.01), MAT.gunDark, x, 1.25, -0.24), Pp(flat(0.56, 0.36), x < 0 ? bioFace : D3.screenMat, x, 1.25, -0.218)])],
    cmodesk: [Pp(RBOX(1.5, 0.04, 0.65, 0.015), white, 0, 0.74, 0), Pp(RBOX(0.42, 0.72, 0.6, 0.015), white, 0.5, 0.36, 0), Pp(RBOX(0.04, 0.72, 0.6, 0.01), white, -0.72, 0.36, 0), Pp(BOX(1.4, 0.04, 0.02), teal, 0, 0.7, 0.32),
      Pp(RBOX(0.55, 0.34, 0.03, 0.01), MAT.gunDark, -0.15, 1.0, -0.2), Pp(flat(0.5, 0.3), D3.screenMat, -0.15, 1.0, -0.184)],
    medcab: [Pp(RBOX(0.88, 2.0, 0.48, 0.015), white, 0, 1.0, 0), Pp(flat(0.78, 1.05), glass, 0, 1.4, 0.245), Pp(BOX(0.78, 0.02, 0.4), CERAMIC, 0, 1.15, 0.02), Pp(BOX(0.78, 0.02, 0.4), CERAMIC, 0, 1.55, 0.02),
      ...[1.17, 1.57].flatMap((y) => [-0.22, 0, 0.22].map((x) => Pp(RBOX(0.14, 0.12, 0.12, 0.02), x ? CERAMIC : tealCloth, x, y + 0.07, 0.02))), Pp(BOX(0.86, 0.06, 0.02), teal, 0, 0.84, 0.245), Pp(BOX(0.012, 0.6, 0.012), MAT.steel, 0.36, 0.5, 0.25)],
    replicator: [Pp(RBOX(1.0, 2.1, 0.58, 0.02), white, 0, 1.05, -0.01), Pp(BOX(0.72, 0.56, 0.04), MAT.gunDark, 0, 1.2, 0.27), Pp(flat(0.66, 0.5), glow, 0, 1.2, 0.292), Pp(BOX(0.98, 0.08, 0.02), teal, 0, 0.6, 0.285)],
  };
}

// From inside a fitted room you see the corridor only through the room's own door, so the far doors' own parts
// (leaves, frames, labels and their text: what batch.js can't merge, about eight draws a door) are hidden while you are
// in a room. render.js calls this every frame on Deck 3; it only changes anything when you move into or out of a room.
function d3Cull(p) {
  if (!D3.fitted) return; const x = p.x, z = p.z; let room = null;
  for (const f of D3.fitted) { const b = f.bb; if (x > b[0] && x < b[1] && z > b[2] && z < b[3]) { const P = f.wpoly; let c = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [ax, az] = P[i], [bx, bz] = P[j]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) c = !c; } if (c) { room = f; break; } } }
  if (room === D3.cullRoom) return; D3.cullRoom = room;
  D3.doorObjs = D3.doorObjs || DOORS.filter((d) => d.deck === 3 && d.station !== 'lift').map((d) => ({ g: d.L.parent, x: d.wx, z: d.wz }));
  const dd = room && D3.doors.find((q) => q.s === room.s);
  D3.doorObjs.forEach((o) => { o.g.visible = !dd || Math.hypot(o.x - dd.x, o.z - dd.z) < 7; });
}

// Red alert (roadmap polish): every corridor band glows red in time with the bridge's strip pulse (one material, so one
// update a frame), and the bands beside the magazines turn hard red (their copies recoloured once, when the alert
// changes). render.js calls this every frame; k is the pulse (0..1).
const _d3c = new THREE.Color();
function d3Alert(red, k) {
  const B = CKIT.band; if (!B || !D3.mods) return;
  if (red) { B.emissive.setRGB(1, 0.05, 0.03); B.emissiveIntensity = 0.12 + 0.88 * k; } else if (B.emissiveIntensity) B.emissiveIntensity = 0;
  if (D3.redBands === red) return; D3.redBands = red;
  D3.mods.forEach((im) => { const L = im.userData.bandMods; if (!L) return; let ch = false;
    L.forEach((d, i) => { if (!d.mag) return; im.setColorAt(i, _d3c.set(red ? 0xff1a10 : (d.band || 0xD9B07E)).convertSRGBToLinear()); ch = true; });
    if (ch) im.instanceColor.needsUpdate = true; });
}
