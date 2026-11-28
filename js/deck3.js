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

// The corridor layout, worked out from the plan (no 3D objects, so checks can call it): modules (see kitCorridorBuild),
// room doors snapped to the centre of a module, wall lines for collision, end caps, lobby openings.
function d3Layout() {
  const F = shipFloorPlan(3), P = F.P, [cm, cx] = P.c, W = STD.corridor.w / 2, rad = Math.PI / 180, LEN = STD.frame;
  const mods = [], caps = [], N = 48, half = 180 / N, [Rr] = P.ring;
  const dc = Rr * Math.cos(half * rad), rlin = 2 * (dc - W) * Math.tan(half * rad), rlout = 2 * (dc + W) * Math.tan(half * rad);
  const spokeA = P.spokes.map(([a]) => a), near0 = (a, s) => Math.abs(((a - s + 540) % 360) - 180) < 1e-6;
  // the ring: N identical tapered pieces, a crossing wherever a spoke meets it
  for (let k = 0; k < N; k++) { const a = k * 360 / N, cross = spokeA.some((s) => near0(a, s)), [x, z] = d3xz(cm + dc * Math.cos(a * rad), cx + dc * Math.sin(a * rad));
    mods.push({ L: cross ? 'o' : 'w', R: cross ? 'o' : 'w', lin: rlin, lout: rlout, x, z, ry: (a - 90) * rad, ring: true, cross, full: !cross, a }); }
  // the spokes, from the centre crossing out: one run inside the ring, one outside; openings onto corridor-like spaces
  // (the lobby) split a run; each piece is whole 2.4 m modules from its start, then a stretched filler
  // the crossing at the centre, where the four spokes meet
  { const [x, z] = d3xz(cm, cx); mods.push({ L: 'o', R: 'o', lin: 2 * W, lout: 2 * W, x, z, ry: 0, cross: true, full: false, centre: true }); }
  const lobbies = F.spaces.filter((s) => s.t === 'c');
  P.spokes.forEach(([a, end]) => {
    const u = [Math.sin(a * rad), Math.cos(a * rad)], ry = Math.atan2(u[0], u[1]), side = [u[1], -u[0]], [ox, oz] = d3xz(cm, cx);
    const at = (t, l) => [ox + u[0] * t + side[0] * l, oz + u[1] * t + side[1] * l];
    const local = (wx, wz) => { const dx = wx - ox, dz = wz - oz; return [dx * u[0] + dz * u[1], dx * side[0] + dz * side[1]]; };
    [[W, dc - W], [dc + W, end]].forEach(([t0, t1], ri) => {
      const cuts = [t0, t1], open = [];
      lobbies.forEach((s) => { const pts = s.poly.map(([m, x]) => local(...d3xz(m, x))); [-1, 1].forEach((sd) => {
        const on = pts.filter(([, l]) => Math.abs(l - sd * W) < 0.15); if (on.length < 2) return;
        const lo = Math.max(t0, Math.min(...on.map(([t]) => t))), hi = Math.min(t1, Math.max(...on.map(([t]) => t))); if (hi - lo > 0.5) { open.push([lo, hi, sd]); cuts.push(lo, hi); } }); });
      const cs = [...new Set(cuts.map((v) => +v.toFixed(4)))].sort((p, q) => p - q);
      for (let i = 0; i < cs.length - 1; i++) {
        const p0 = cs[i], p1 = cs[i + 1], o = open.find(([lo, hi]) => p0 >= lo - 1e-3 && p1 <= hi + 1e-3), L = o && o[2] < 0 ? 'o' : 'w', R = o && o[2] > 0 ? 'o' : 'w';
        const n = Math.floor((p1 - p0) / LEN + 1e-6), f = p1 - p0 - n * LEN;
        for (let j = 0; j < n; j++) { const t = p0 + LEN * (j + 0.5), [x, z] = at(t, 0); mods.push({ L, R, lin: LEN, lout: LEN, x, z, ry, sz: 1, full: true, spoke: a, t }); }
        if (f > 0.02) { const t = p1 - f / 2, [x, z] = at(t, 0); mods.push({ L, R, lin: LEN, lout: LEN, x, z, ry, sz: f / LEN, full: false, spoke: a, t }); }
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
    doors.push({ s, x: px, z: pz, rot: Math.atan2(nrm[0], nrm[1]), moved: Math.hypot(px - wx, pz - wz) });
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

  // ---------- where you are: the corridor runs (rectangles) and the ring ----------
  const [ocx, ocz] = d3xz(...Lt.F.P.c), W = Lt.W;
  Lt.F.P.spokes.forEach(([a, end]) => { const r = a * Math.PI / 180, ux = Math.sin(r), uz = Math.cos(r), ex = ocx + ux * end, ez = ocz + uz * end;
    const label = { 0: 'Aft corridor', 90: 'Starboard spoke', 180: 'Forward spoke', 270: 'Port spoke' }[a] || 'Corridor';
    D3.rooms.push({ label, x0: Math.min(ocx, ex) - (uz ? W : 0), x1: Math.max(ocx, ex) + (uz ? W : 0), z0: Math.min(ocz, ez) - (ux ? W : 0), z1: Math.max(ocz, ez) + (ux ? W : 0) }); });
  D3.rooms.unshift({ label: 'Ring corridor', test: (x, z) => { const r = Math.hypot(x - ocx, z - ocz); return r > Lt.dc - W - 0.2 && r < Lt.dc + W + 0.2; } });
  DECK3.updateMatrixWorld(true);
}
