// USS Defiance · deck2.js
// Deck 2, the officers' deck, part 1: the Lift 1 lobby, the corridor aft, the captain's quarters forward and
// the officers' wardroom. It sits a real deck (3.5 m) below the bridge; the lift car travels down to it.
// Built before bake.js so its surfaces are part of the light bake; lift.js hides it until you ride down.
// Coordinates are world x / z (forward is -z), with y measured from the Deck 2 floor.
// Files share one global scope and load in order (see index.html).
'use strict';

const D2Y = -3.5, D2H = 2.75, D2C = 2.6; // floor height, room ceiling, corridor ceiling
const DECK2 = group(0, D2Y, 0, 0); DECK2.name = 'Deck 2';
const D2 = { segs: [], obs: [], rooms: [], door: null };
const d2RoomWall = roomWallMat(D2H, 'fabric'), d2CorrWall = roomWallMat(D2C, 'fabric');
const [D2_LX] = onEdge(LIFT_GAP.edge, LIFT_GAP.t, 0); // the lift door's x; the doors open forward at z = 6.2
function d2seg(ax, az, bx, bz, r) { D2.segs.push([ax, az, bx, bz, r === undefined ? 0.33 : r]); }
function d2obs(x, z, r) { D2.obs.push({ x, z, r }); }
// a straight wall from A to B facing n, with openings measured along it: { a, b, y0, y1 } (y0 > 0 means a window)
function d2wall(mat, A, B, n, H, holes) {
  const len = Math.hypot(B[0] - A[0], B[1] - A[1]), dir = [(B[0] - A[0]) / len, (B[1] - A[1]) / len], P = (s) => [A[0] + dir[0] * s, A[1] + dir[1] * s];
  let s = 0; (holes || []).slice().sort((p, q) => p.a - q.a).forEach((h) => {
    wallPiece(mat, A, dir, n, s, h.a, 0, H, H, 1.2, DECK2);
    if (h.y0 > 0.001) wallPiece(mat, A, dir, n, h.a, h.b, 0, h.y0, H, 1.2, DECK2);
    if (h.y1 < H - 0.001) wallPiece(mat, A, dir, n, h.a, h.b, h.y1, H, H, 1.2, DECK2);
    const p0 = P(s), p1 = P(h.a); d2seg(p0[0], p0[1], p1[0], p1[1]);
    if (h.y0 > 0.4) { const q0 = P(h.a), q1 = P(h.b); d2seg(q0[0], q0[1], q1[0], q1[1]); }
    s = h.b;
  });
  wallPiece(mat, A, dir, n, s, len, 0, H, H, 1.2, DECK2);
  const p0 = P(s), p1 = P(len); d2seg(p0[0], p0[1], p1[0], p1[1]);
}
// a room: floor, ceiling, four walls facing in, a cove light and a dark crown under the ceiling
function d2room(label, x0, x1, z0, z1, H, mat, floor, holes) {
  const fw = x1 - x0, fd = z1 - z0;
  const fg = new THREE.PlaneGeometry(fw, fd); { const uv = fg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * fw, uv.getY(i) * fd); }
  const f = mesh(fg, floor, (x0 + x1) / 2, 0.002, (z0 + z1) / 2, DECK2); f.rotation.x = -Math.PI / 2;
  const c = mesh(fg.clone(), MAT.ceiling, (x0 + x1) / 2, H, (z0 + z1) / 2, DECK2); c.rotation.x = Math.PI / 2;
  // walls sit 6 cm inside the room's outline, so two rooms back to back never share one plane
  // (coincident back-to-back walls shadow each other in the light bake and come out black)
  const I = 0.06, sh = (L) => (L || []).map((h) => Object.assign({}, h, { a: h.a - I, b: h.b - I }));
  holes = holes || {};
  d2wall(mat, [x0 + I, z0 + I], [x1 - I, z0 + I], [0, 1], H, sh(holes.n));
  d2wall(mat, [x0 + I, z1 - I], [x1 - I, z1 - I], [0, -1], H, sh(holes.s));
  d2wall(mat, [x0 + I, z0 + I], [x0 + I, z1 - I], [1, 0], H, sh(holes.w));
  d2wall(mat, [x1 - I, z0 + I], [x1 - I, z1 - I], [-1, 0], H, sh(holes.e));
  [[(x0 + x1) / 2, z0 + 0.13, fw - 0.3, 0], [(x0 + x1) / 2, z1 - 0.13, fw - 0.3, 0], [x0 + 0.13, (z0 + z1) / 2, fd - 0.3, Math.PI / 2], [x1 - 0.13, (z0 + z1) / 2, fd - 0.3, Math.PI / 2]].forEach(([x, z, L, ry]) => {
    const cv = mesh(BOX(L, 0.03, 0.03), SLOT, x, H - 0.28, z, DECK2); cv.rotation.y = ry;
    const sh = mesh(RBOX(L + 0.1, 0.08, 0.12, 0.015), MAT.gunDark, x, H - 0.23, z, DECK2); sh.rotation.y = ry;
    const st = mesh(BOX(L - 0.2, 0.02, 0.02), STRIP, x, 0.06, z, DECK2); st.rotation.y = ry;
  });
  D2.rooms.push({ label, x0, x1, z0, z1 });
}
function d2down(x, z, H) {
  mesh(new THREE.CircleGeometry(0.1, 20), downlightMat, x, H - 0.004, z, DECK2).rotation.x = Math.PI / 2;
  mesh(new THREE.TorusGeometry(0.115, 0.016, 6, 20), MAT.steel, x, H - 0.008, z, DECK2).rotation.x = Math.PI / 2;
}
function d2panel(x, z, H, w, d) {
  mesh(RBOX(w + 0.12, 0.04, d + 0.12, 0.015), MAT.steel, x, H - 0.02, z, DECK2);
  mesh(new THREE.PlaneGeometry(w, d), downlightMat, x, H - 0.045, z, DECK2).rotation.x = Math.PI / 2;
}
// simple furniture pieces
function d2chair(x, z, rot, mat, kind) {
  const g = group(x, 0, z, rot, DECK2); const ch = makeChair(g, kind || 'dining', mat); chairRest(ch.userData.chair, Math.sin(x * 5 + z * 11) * 0.18); return g;
}
// a quarters desk: walnut top, side panels and a drawer pedestal, with a bridge-style console pad on top whose
// whole face is a display (deskSurface), tilted a little toward the sitter at local +z
function d2desk(parent, w, d, station, sub, title, code) {
  const g = group(0, 0, 0, 0, parent);
  mesh(RBOX(w, 0.05, d, 0.02), WOOD, 0, 0.75, 0, g);
  [-1, 1].forEach((sd) => mesh(RBOX(0.08, 0.72, d - 0.07, 0.02), WOOD, sd * (w / 2 - 0.1), 0.36, 0, g));
  mesh(RBOX(0.42, 0.5, d - 0.15, 0.02), WOOD, w / 2 - 0.36, 0.47, 0, g);
  mesh(RBOX(w - 0.3, 0.4, 0.03, 0.01), MAT.gunDark, 0, 0.52, -d / 2 + 0.07, g);
  const pw = w - 0.2, pd = d - 0.2, top = group(0, 0.805, -0.02, 0, g); top.rotation.x = 0.1;
  mesh(RBOX(pw, 0.03, pd, 0.012), MAT_BEZEL, 0, 0.015, 0, top);
  mesh(pillow(pw, 0.045, 0.06, 0.02, 0.005, 'y', 0), MAT_PAD, 0, 0.012, pd / 2 + 0.02, top);
  deskSurface(top, pw, pd - 0.08, 0.031, -0.01, { id: station, title, code }, sub);
  addHit(BOX(w, 1.0, d), { station }, g, 0, 0.6, 0);
  return g;
}
function d2label(text, x, y, z, rot, w) {
  const c = cnv(512, 80), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 512, 80);
  hexTab(g, 6, 10, 40, 60, true, false); g.fillStyle = '#E8A06A'; g.fill();
  g.fillStyle = '#E8A06A'; g.font = `600 44px ${DISP}`; g.textBaseline = 'middle'; g.fillText(text, 60, 43);
  const m = mesh(new THREE.PlaneGeometry(w, w * 80 / 512), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), x, y, z, DECK2); m.rotation.y = rot; return m;
}

// a bed with its headboard to local -x: frame, mattress, cover, pillows, headboard; bedside tables at local z +-(wid/2 + 0.32)
function d2bed(parent, x, z, rot, wid, sides) {
  const g = group(x, 0, z, rot, parent), hw = wid / 2;
  mesh(RBOX(2.1, 0.32, wid + 0.1, 0.04), WOOD, 0, 0.18, 0, g);
  mesh(RBOX(2.0, 0.2, wid, 0.06), CERAMIC, 0, 0.42, 0, g);
  mesh(RBOX(1.3, 0.06, wid + 0.04, 0.03), FABRIC, 0.32, 0.54, 0, g);
  (wid > 1.2 ? [-hw / 2, hw / 2] : [0]).forEach((q) => mesh(RBOX(0.38, 0.12, Math.min(0.58, wid - 0.2), 0.05), CERAMIC, -0.78, 0.56, q, g));
  mesh(RBOX(0.1, 1.1, wid + 0.3, 0.03), MAT.leatherDark, -1.08, 0.75, 0, g);
  (sides || []).forEach((sd) => { const q = sd * (hw + 0.32); mesh(RBOX(0.45, 0.5, 0.42, 0.03), WOOD, -0.82, 0.25, q, g); mesh(lathe([[0, 0], [0.09, 0], [0.06, 0.22], [0.11, 0.3], [0, 0.3]], 20), BRASS, -0.82, 0.5, q, g); });
  return g;
}
// a partition across a room along x at z, double-faced (12 cm), from xa to xb with an opening from oa to ob
function d2partX(z, xa, xb, oa, ob, H) {
  [[xa, oa], [ob, xb]].forEach(([a, b]) => {
    wallPiece(d2RoomWall, [a, z + 0.06], [1, 0], [0, 1], 0, b - a, 0, H, H, 1.2, DECK2);
    wallPiece(d2RoomWall, [a, z - 0.06], [1, 0], [0, -1], 0, b - a, 0, H, H, 1.2, DECK2);
    d2seg(a, z, b, z, 0.2);
  });
  [oa, ob].forEach((x) => mesh(RBOX(0.14, H, 0.16, 0.02), MAT.gunDark, x, H / 2, z, DECK2));
}
// a wall shelf unit (books and keepsakes) facing local +z
function d2shelf(parent, x, z, rot, seed) {
  const sg = group(x, 0, z, rot, parent);
  mesh(RBOX(1.2, 1.9, 0.34, 0.02), WOOD, 0, 0.95, -0.02, sg);
  const rr = mulberry(seed); [0.45, 0.95, 1.45].forEach((y) => { mesh(BOX(1.1, 0.025, 0.3), MAT.gunDark, 0, y, 0.0, sg); let q = -0.5; while (q < 0.42) { const w = 0.03 + rr() * 0.05, h = 0.18 + rr() * 0.12; if (rr() < 0.1) { mesh(lathe([[0, 0], [0.05, 0], [0.04, 0.14], [0.02, 0.2], [0, 0.2]], 14), [BRASS, CERAMIC, GLASS][(rr() * 3) | 0], q + 0.06, y + 0.013, 0.0, sg); q += 0.16; continue; } mesh(BOX(w, h, 0.2), [MAT.leather, MAT.leatherDark, FABRIC, POT][(rr() * 4) | 0], q + w / 2, y + 0.013 + h / 2, 0.0, sg); q += w + 0.008; if (rr() < 0.12) q += 0.14; } });
  return sg;
}
// a rug: a dark field with a two-line border in the given colour
function d2rug(x, z, w, d, field, line, seed) {
  const c = cnv(512, Math.round(512 * d / w)), g = c.getContext('2d'), H = c.height; g.fillStyle = field; g.fillRect(0, 0, 512, H); noise(g, 512, H, 9000, 0.05, seed);
  g.strokeStyle = line; g.lineWidth = 7; g.strokeRect(18, 18, 476, H - 36); g.lineWidth = 2; g.strokeRect(36, 36, 440, H - 72);
  const m = mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.97, polygonOffset: true, polygonOffsetFactor: -1 }), x, 0.005, z, DECK2); m.rotation.x = -Math.PI / 2; return m;
}
// a synthesizer niche on a wall, facing local +z: recess, glowing back and a small screen beside it
function d2synth(parent, x, y, z, rot, station, title, code) {
  const n = group(x, y, z, rot, parent);
  mesh(RBOX(0.62, 0.72, 0.14, 0.03), MAT.gunDark, 0, 0, -0.04, n);
  mesh(new THREE.PlaneGeometry(0.5, 0.56), new THREE.MeshBasicMaterial({ color: 0x4a3c5a, toneMapped: false }), 0, 0, 0.035, n);
  display(group(0.55, 0, 0.02, 0, n), 0.36, 0.5, 220, 300, 'aux', station, title, code);
  addHit(BOX(1.4, 1.0, 0.6), { station }, n, 0.2, 0, 0.2);
  return n;
}

// ---------- plan ----------
const D2_LOBBY = { x0: -5.4, x1: 0.2, z0: 2.8, z1: 6.2 };
const D2_QTR = { x0: -7.2, x1: 1.6, z0: -5.2, z1: 2.8, door: -2.6 };
const D2_COR = { x0: 0.2, x1: 2.4, z0: 2.8, z1: 17.0 };
const D2_WARD = { x0: -3.2, x1: 5.8, z0: 17.0, z1: 24.5, door: 1.3 };
const D2_XO = { x0: -5.4, x1: 0.2, z0: 6.2, z1: 14.6, door: 9.6 };

// ---------- lift lobby ----------
{
  const { x0, x1, z0, z1 } = D2_LOBBY, H = D2H;
  d2room('Lift 1 lobby', x0, x1, z0, z1, H, d2RoomWall, MAT.floorCarpet, {
    s: [{ a: D2_LX - 0.6 - x0, b: D2_LX + 0.6 - x0, y0: 0, y1: 2.3 }],
    n: [{ a: D2_QTR.door - 0.6 - x0, b: D2_QTR.door + 0.6 - x0, y0: 0, y1: 2.3 }],
    e: [{ a: 0.8, b: 2.2, y0: 0, y1: 2.35 }],
  });
  // lined reveal for the open way through to the corridor
  [3.6, 5.0].forEach((z) => mesh(BOX(0.16, 2.35, 0.04), MAT.gun, x1, 1.175, z, DECK2)); mesh(BOX(0.16, 0.04, 1.44), MAT.gun, x1, 2.35, 4.3, DECK2);
  // the lift doors on this deck (lift.js opens them with the car's)
  const g = group(D2_LX, 0, z1, Math.PI, DECK2);
  [-1, 1].forEach((sd) => mesh(RBOX(0.22, 2.6, 0.3, 0.03), MAT.gun, sd * 0.71, 1.3, 0.12, g));
  mesh(RBOX(1.64, 0.3, 0.3, 0.03), MAT.gun, 0, 2.45, 0.12, g);
  mesh(BOX(1.2, 0.004, 0.1), MAT.hazard, 0, 0.003, 0.16, g);
  const L = mesh(RBOX(0.6, 2.3, 0.06, 0.015), MAT.panel, -0.3, 1.15, 0.06, g), Rr = mesh(RBOX(0.6, 2.3, 0.06, 0.015), MAT.panel, 0.3, 1.15, 0.06, g);
  [L, Rr].forEach((d, k) => { mesh(BOX(0.02, 1.9, 0.02), SLOT, k ? -0.27 : 0.27, 0, 0.04, d); mesh(BOX(0.4, 0.05, 0.02), MAT.steel, 0, 0.1, 0.04, d); });
  addHit(BOX(1.6, 2.6, 0.8), { station: 'lift' }, g, 0, 1.3, 0.45);
  D2.door = { L, Rr };
  d2label('LIFT 1', D2_LX, 2.45, z1 - 0.28, Math.PI, 0.7);
  // deck sign beside the lift, the directory on the port wall, a bench and a plant
  { const c = cnv(560, 256), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 560, 256);
    elbow(x, 14, 14, 70, 18, 300, 30, true, '#E8A06A'); elbow(x, 14, 242, 70, 14, 200, 24, false, '#D9B07E');
    x.fillStyle = '#F2C88F'; x.font = `700 150px ${DISP}`; x.textBaseline = 'middle'; x.fillText('2', 110, 132);
    x.fillStyle = '#E8A06A'; x.font = `600 44px ${DISP}`; x.fillText('DECK 2', 220, 92); x.fillStyle = '#B693C4'; x.font = `500 32px ${DISP}`; x.fillText("OFFICERS' DECK", 222, 142); x.fillStyle = '#D9B07E'; x.font = `500 24px ${DISP}`; x.fillText('LIFT 1 · DECKS 1 TO 6', 222, 186);
    const m = mesh(new THREE.PlaneGeometry(1.1, 0.5), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), D2_LX + 1.75, 1.6, z1 - 0.022, DECK2); m.rotation.y = Math.PI;
    mesh(RBOX(1.22, 0.62, 0.02, 0.008), MAT.gunDark, D2_LX + 1.75, 1.6, z1 - 0.006, DECK2); }
  const dg = group(x0 + 0.04, 1.45, (z0 + z1) / 2, Math.PI / 2, DECK2); display(dg, 1.3, 0.8, 640, 394, 'deck2', 'deckdir', 'Deck 2 directory', 'D2·00');
  { const b = group(x0 + 0.3, 0, (z0 + z1) / 2, Math.PI / 2, DECK2); mesh(RBOX(1.6, 0.1, 0.42, 0.03), MAT.leather, 0, 0.45, 0, b); mesh(RBOX(1.6, 0.36, 0.36, 0.02), MAT_PED, 0, 0.2, 0.02, b); }
  d2obs(x0 + 0.3, (z0 + z1) / 2 - 0.5, 0.3); d2obs(x0 + 0.3, (z0 + z1) / 2 + 0.5, 0.3);
  plantAt(DECK2, x1 - 0.45, z1 - 0.45, 0.9); d2obs(x1 - 0.45, z1 - 0.45, 0.3);
  d2down(D2_LX, (z0 + z1) / 2, H); d2down(x0 + 1.0, (z0 + z1) / 2, H); d2down(x1 - 1.1, (z0 + z1) / 2, H);
}

// ---------- corridor aft ----------
{
  const { x0, x1, z0, z1 } = D2_COR, H = D2C, cx = (x0 + x1) / 2;
  d2room('Officers’ corridor', x0, x1, z0, z1, H, d2CorrWall, MAT.floorCarpet, {
    w: [{ a: 0.8, b: 2.2, y0: 0, y1: 2.35 }, { a: 6.2, b: 7.4, y0: 0, y1: 2.3 }],
    e: [{ a: 3.8, b: 5.0, y0: 0, y1: 2.3 }, { a: 8.6, b: 9.8, y0: 0, y1: 2.3 }],
    s: [{ a: D2_WARD.door - 0.6 - x0, b: D2_WARD.door + 0.6 - x0, y0: 0, y1: 2.3 }],
  });
  // structural frames every 2.4 m, a light panel between each, handrails both sides
  d2panel(cx, z0 + 1.5, H, 0.9, 0.36);
  for (let z = z0 + 3.2; z < z1 - 0.4; z += 2.4) {
    [x0 + 0.05, x1 - 0.05].forEach((x) => mesh(RBOX(0.1, H - 0.05, 0.16, 0.02), MAT.gunDark, x, (H - 0.05) / 2, z, DECK2));
    mesh(RBOX(x1 - x0, 0.12, 0.16, 0.02), MAT.gunDark, cx, H - 0.06, z, DECK2);
    if (z + 1.2 < z1 - 0.5) d2panel(cx, z + 1.2, H, 0.9, 0.36);
  }
  [x0 + 0.06, x1 - 0.06].forEach((x) => { const r = mesh(CYL(0.022, 0.022, z1 - z0 - 0.6, 10), MAT.steel, x, 0.95, (z0 + z1) / 2, DECK2); r.rotation.x = Math.PI / 2; });
  // doors along the corridor: first officer (port), two senior officers' cabins (starboard), the wardroom aft
  doorAt(x0, D2_XO.door, Math.PI / 2, 'FIRST OFFICER', 'xoq', true, true, DECK2, 2);
  doorAt(x1, 7.2, -Math.PI / 2, 'SENIOR OFFICERS', 'd2sealed', false, true, DECK2, 2);
  doorAt(x1, 12.0, -Math.PI / 2, 'SENIOR OFFICERS', 'd2sealed', false, true, DECK2, 2);
  doorAt(D2_WARD.door, z1, Math.PI, 'WARDROOM', 'wardoor', true, true, DECK2, 2);
  d2label('AFT · WARDROOM', x1 - 0.02, 2.0, 4.6, -Math.PI / 2, 0.9);
}

// ---------- captain's quarters ----------
{
  const Q = D2_QTR, H = D2H;
  d2room('Captain’s quarters', Q.x0, Q.x1, Q.z0, Q.z1, H, d2RoomWall, MAT.roomCarpet, {
    s: [{ a: Q.door - 0.6 - Q.x0, b: Q.door + 0.6 - Q.x0, y0: 0, y1: 2.3 }],
    n: [{ a: 5.2, b: 8.4, y0: 0.9, y1: 2.2 }],
  });
  doorAt(Q.door, Q.z1, 0, 'CAPTAIN', 'capq', true, true, DECK2, 2);
  const vp = group(-0.4, 0, Q.z0 + 0.06, Math.PI, DECK2); viewport(vp, -1.6, 1.6, 0.9, 2.2, 0);
  // sleeping cabin behind a partition, forward and to port
  const PZ = -1.6, PX = -2.4;
  [[[Q.x0, PZ + 0.06], [-4.2, PZ + 0.06], [0, 1]], [[Q.x0, PZ - 0.06], [-4.2, PZ - 0.06], [0, -1]], [[PX + 0.06, Q.z0], [PX + 0.06, PZ], [1, 0]], [[PX - 0.06, Q.z0], [PX - 0.06, PZ], [-1, 0]]].forEach(([A, B, n]) => wallPiece(d2RoomWall, A, [Math.sign(B[0] - A[0]), Math.sign(B[1] - A[1])], n, 0, Math.hypot(B[0] - A[0], B[1] - A[1]), 0, H, H, 1.2, DECK2));
  d2seg(Q.x0, PZ, -4.2, PZ, 0.2); d2seg(PX, Q.z0, PX, PZ, 0.2);
  mesh(RBOX(0.14, H, 0.14, 0.02), MAT.gunDark, -4.2, H / 2, PZ, DECK2); mesh(RBOX(0.14, H, 0.14, 0.02), MAT.gunDark, PX, H / 2, PZ, DECK2);
  { // bed, headboard against the port wall
    const g = group(Q.x0 + 1.15, 0, -3.4, 0, DECK2);
    mesh(RBOX(2.1, 0.32, 1.7, 0.04), WOOD, 0, 0.18, 0, g);
    mesh(RBOX(2.0, 0.2, 1.6, 0.06), CERAMIC, 0, 0.42, 0, g);
    mesh(RBOX(1.3, 0.06, 1.64, 0.03), FABRIC, 0.32, 0.54, 0, g);
    [-0.4, 0.4].forEach((z) => mesh(RBOX(0.38, 0.12, 0.58, 0.05), CERAMIC, -0.78, 0.56, z, g));
    mesh(RBOX(0.1, 1.1, 1.9, 0.03), MAT.leatherDark, -1.08, 0.75, 0, g);
    [-1.15, 1.15].forEach((z) => { mesh(RBOX(0.45, 0.5, 0.42, 0.03), WOOD, -0.82, 0.25, z, g); const l = mesh(lathe([[0, 0], [0.09, 0], [0.06, 0.22], [0.11, 0.3], [0, 0.3]], 20), BRASS, -0.82, 0.5, z, g); });
    d2obs(Q.x0 + 1.15, -3.0, 0.75); d2obs(Q.x0 + 1.15, -3.8, 0.75); d2obs(Q.x0 + 0.4, -2.2, 0.3); d2obs(Q.x0 + 0.4, -4.6, 0.3);
    const w = mesh(RBOX(1.2, 2.1, 0.6, 0.03), WOOD, -3.3, 1.05, Q.z0 + 0.32, DECK2); d2obs(-3.3, Q.z0 + 0.3, 0.45);
    d2down(Q.x0 + 2.0, -3.4, H); d2down(-3.6, -2.6, H);
  }
  { // sitting area facing the viewport: sofa, low table, cabinet under the window, a rug
    const sx = -0.4, sz = -2.4, g = group(sx, 0, sz, 0, DECK2);
    mesh(RBOX(2.3, 0.4, 0.9, 0.05), FABRIC, 0, 0.22, 0, g);
    mesh(RBOX(2.3, 0.5, 0.22, 0.06), FABRIC, 0, 0.62, 0.36, g);
    [-1.12, 1.12].forEach((x) => mesh(RBOX(0.2, 0.6, 0.9, 0.05), FABRIC, x, 0.32, 0, g));
    [-0.65, 0, 0.65].forEach((x) => mesh(RBOX(0.68, 0.12, 0.7, 0.05), FABRIC, x, 0.46, -0.06, g));
    mesh(RBOX(2.3, 0.06, 0.9, 0.02), MAT.gunDark, 0, 0.03, 0, g);
    [-0.8, 0, 0.8].forEach((x) => d2obs(sx + x, sz, 0.5));
    const t = group(sx, 0, sz - 1.15, 0, DECK2); mesh(RBOX(1.3, 0.05, 0.62, 0.02), WOOD, 0, 0.42, 0, t); [-0.55, 0.55].forEach((x) => mesh(RBOX(0.06, 0.4, 0.5, 0.01), MAT.steel, x, 0.2, 0, t));
    mesh(lathe([[0, 0], [0.12, 0], [0.12, 0.02], [0.03, 0.05], [0, 0.05]], 20), CERAMIC, 0.3, 0.45, 0, t);
    d2obs(sx, sz - 1.15, 0.6);
    mesh(RBOX(3.4, 0.55, 0.42, 0.03), WOOD, -0.4, 0.28, Q.z0 + 0.25, DECK2); d2seg(-2.1, Q.z0 + 0.5, 1.3, Q.z0 + 0.5, 0.25);
    const c = cnv(512, 384), x = c.getContext('2d'); x.fillStyle = '#3a2f2a'; x.fillRect(0, 0, 512, 384); noise(x, 512, 384, 9000, 0.05, 88);
    x.strokeStyle = 'rgba(217,176,126,0.7)'; x.lineWidth = 7; x.strokeRect(18, 18, 476, 348); x.lineWidth = 2; x.strokeRect(36, 36, 440, 312);
    const rug = mesh(new THREE.PlaneGeometry(3.2, 2.4), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.97, polygonOffset: true, polygonOffsetFactor: -1 }), sx, 0.005, sz - 0.9, DECK2); rug.rotation.x = -Math.PI / 2;
    d2down(sx, sz - 0.9, H); d2down(sx + 1.4, sz - 0.4, H); d2down(sx - 1.4, sz - 0.4, H);
  }
  { // dining table for four, aft and to port
    const tx = -5.2, tz = 1.0;
    mesh(CYL(0.66, 0.66, 0.05, 40), WOOD, tx, 0.74, tz, DECK2); mesh(CYL(0.08, 0.12, 0.7, 16), MAT.steel, tx, 0.36, tz, DECK2); mesh(CYL(0.36, 0.4, 0.03, 30), MAT.steel, tx, 0.015, tz, DECK2);
    [0, 1, 2, 3].forEach((i) => { const a = i * Math.PI / 2 + Math.PI / 4; d2chair(tx + Math.sin(a) * 0.95, tz + Math.cos(a) * 0.95, a, MAT.leather); });
    d2obs(tx, tz, 1.05);
    mesh(lathe([[0, 0], [0.05, 0], [0.04, 0.2], [0.09, 0.3], [0.02, 0.42], [0, 0.42]], 20), BRASS, tx, 0.765, tz, DECK2);
    const pl = mesh(new THREE.CircleGeometry(0.5, 32), lightDiscMat, tx, H - 0.006, tz, DECK2); pl.rotation.x = Math.PI / 2;
    mesh(new THREE.TorusGeometry(0.51, 0.02, 8, 40), MAT.steel, tx, H - 0.01, tz, DECK2).rotation.x = Math.PI / 2;
    // shelves on the port wall: books, a ship model, a few keepsakes
    const sg = group(Q.x0 + 0.2, 0, -0.55, Math.PI / 2, DECK2);
    mesh(RBOX(1.6, 2.0, 0.36, 0.02), WOOD, 0, 1.0, -0.02, sg);
    const rr = mulberry(717); [0.45, 0.95, 1.45].forEach((y) => { mesh(BOX(1.5, 0.025, 0.32), MAT.gunDark, 0, y, 0.02, sg); let x = -0.7; while (x < 0.6) { const w = 0.03 + rr() * 0.05, h = 0.2 + rr() * 0.12; mesh(BOX(w, h, 0.22), [MAT.leather, MAT.leatherDark, FABRIC, POT][(rr() * 4) | 0], x + w / 2, y + 0.013 + h / 2, 0.02, sg); x += w + 0.008; if (rr() < 0.12) x += 0.18; } });
    mesh(BOX(0.4, 0.06, 0.12), BRASS, 0.3, 1.98, 0.02, sg);
    d2obs(Q.x0 + 0.22, -0.55, 0.45); d2obs(Q.x0 + 0.22, 0.1, 0.3); d2obs(Q.x0 + 0.22, -1.2, 0.3);
    d2down(tx - 0.2, tz + 1.2, H);
  }
  { // desk on the starboard wall, with the captain's personal screen
    const dx = Q.x1 - 0.45, dz = 0.0, g = group(dx, 0, dz, -Math.PI / 2, DECK2);
    d2desk(g, 1.6, 0.75, 'qdesk', 'log', 'Personal log', 'CO·01');
    const sg = group(0, 1.5, -0.42, 0, g); display(sg, 1.1, 0.62, 640, 360, 'log', 'qdesk', 'Personal log', 'CO·01');
    d2chair(dx - 0.85, dz, -Math.PI / 2, MAT.leatherDark, 'station');
    d2obs(dx, dz - 0.5, 0.42); d2obs(dx, dz + 0.5, 0.42);
    d2down(dx - 0.4, dz, H);
  }
  { // galley alcove beside the door: a counter and the food synthesizer
    const gx = 0.4, gz = Q.z1 - 0.32;
    mesh(RBOX(1.8, 0.9, 0.58, 0.02), MAT_PED, gx, 0.45, gz, DECK2); mesh(RBOX(1.86, 0.04, 0.64, 0.01), CERAMIC, gx, 0.92, gz, DECK2);
    const n = group(gx + 0.35, 1.42, gz + 0.22, Math.PI, DECK2);
    mesh(RBOX(0.62, 0.72, 0.14, 0.03), MAT.gunDark, 0, 0, 0.04, n);
    mesh(new THREE.PlaneGeometry(0.5, 0.56), new THREE.MeshBasicMaterial({ color: 0x4a3c5a, toneMapped: false }), 0, 0, -0.035, n);
    const sc = group(-0.55, 0, -0.02, 0, n); display(sc, 0.36, 0.5, 220, 300, 'aux', 'qgalley', 'Galley', 'GAL·01');
    addHit(BOX(1.4, 1.0, 0.6), { station: 'qgalley' }, n, -0.2, 0, -0.2);
    d2seg(gx - 0.9, gz - 0.3, gx + 0.9, gz - 0.3, 0.3);
    plantAt(DECK2, Q.x1 - 0.45, -3.8, 1.0); d2obs(Q.x1 - 0.45, -3.8, 0.3);
    d2down(gx, gz - 0.8, H); d2down(-2.6, 1.9, H);
  }
}

// ---------- first officer's quarters ----------
// The captain's quarters, smaller: day cabin forward with the port viewport, sleeping cabin aft behind a partition.
{
  const Q = D2_XO, H = D2H, PZ = 12.0;
  d2room('First officer’s quarters', Q.x0, Q.x1, Q.z0, Q.z1, H, d2RoomWall, MAT.roomCarpet, {
    e: [{ a: Q.door - 0.6 - Q.z0, b: Q.door + 0.6 - Q.z0, y0: 0, y1: 2.3 }],
    w: [{ a: 0.8, b: 4.4, y0: 0.9, y1: 2.2 }],
  });
  const vp = group(Q.x0 + 0.06, 0, 8.8, -Math.PI / 2, DECK2); viewport(vp, -1.8, 1.8, 0.9, 2.2, 0);
  d2partX(PZ, Q.x0 + 0.06, Q.x1 - 0.06, -1.6, -0.6, H);
  { // sitting area facing the viewport: sofa, low table, rug
    const sx = -3.1, sz = 8.8, g = group(sx, 0, sz, Math.PI / 2, DECK2);
    mesh(RBOX(2.2, 0.4, 0.88, 0.05), FABRIC, 0, 0.22, 0, g);
    mesh(RBOX(2.2, 0.5, 0.22, 0.06), FABRIC, 0, 0.62, 0.35, g);
    [-1.08, 1.08].forEach((x) => mesh(RBOX(0.2, 0.6, 0.88, 0.05), FABRIC, x, 0.32, 0, g));
    [-0.55, 0.55].forEach((x) => mesh(RBOX(0.98, 0.12, 0.68, 0.05), FABRIC, x, 0.46, -0.06, g));
    mesh(RBOX(2.2, 0.06, 0.88, 0.02), MAT.gunDark, 0, 0.03, 0, g);
    [-0.8, 0, 0.8].forEach((z) => d2obs(sx, sz + z, 0.48));
    const t = group(sx - 1.1, 0, sz, Math.PI / 2, DECK2); mesh(RBOX(1.2, 0.05, 0.56, 0.02), WOOD, 0, 0.42, 0, t); [-0.5, 0.5].forEach((x) => mesh(RBOX(0.06, 0.4, 0.46, 0.01), MAT.steel, x, 0.2, 0, t));
    mesh(lathe([[0, 0], [0.05, 0], [0.04, 0.16], [0.07, 0.24], [0, 0.26]], 18), GLASS, -0.25, 0.445, 0.05, t);
    d2obs(sx - 1.1, sz - 0.4, 0.35); d2obs(sx - 1.1, sz + 0.4, 0.35);
    d2rug(sx - 0.8, sz, 2.6, 3.0, '#2c3340', 'rgba(201,182,140,0.7)', 91);
    d2down(sx - 0.8, sz, H); d2down(sx - 0.8, sz - 1.5, H); d2down(sx - 0.8, sz + 1.5, H);
    plantAt(DECK2, Q.x0 + 0.45, Q.z0 + 0.45, 0.95); d2obs(Q.x0 + 0.45, Q.z0 + 0.45, 0.3);
  }
  { // desk on the forward wall, facing aft
    const dx = -1.3, dz = Q.z0 + 0.46, g = group(dx, 0, dz, 0, DECK2);
    d2desk(g, 1.5, 0.72, 'xodesk', 'xo', 'First officer', 'XO·01');
    d2chair(dx, dz + 0.78, 0, MAT.leatherDark, 'station');
    d2obs(dx - 0.45, dz, 0.4); d2obs(dx + 0.45, dz, 0.4);
    // a framed print of a ringed planet above the desk
    const c = cnv(384, 256), x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#101826'); gr.addColorStop(1, '#2a2233'); x.fillStyle = gr; x.fillRect(0, 0, 384, 256);
    x.fillStyle = '#c9a477'; x.beginPath(); x.arc(200, 130, 62, 0, Math.PI * 2); x.fill(); x.strokeStyle = 'rgba(230,205,160,0.8)'; x.lineWidth = 5; x.beginPath(); x.ellipse(200, 132, 120, 22, -0.25, 0, Math.PI * 2); x.stroke();
    for (let i = 0; i < 60; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.3 + Math.random() * 0.6) + ')'; x.fillRect(Math.random() * 384, Math.random() * 256, 1.5, 1.5); }
    mesh(RBOX(0.86, 0.6, 0.03, 0.01), WOOD, dx, 1.75, Q.z0 + 0.075, DECK2);
    mesh(new THREE.PlaneGeometry(0.76, 0.5), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.5 }), dx, 1.75, Q.z0 + 0.092, DECK2);
    d2down(dx, dz + 0.4, H);
  }
  { // galley counter on the starboard wall, forward of the door
    const gz = 7.75;
    mesh(RBOX(0.56, 0.9, 1.3, 0.02), MAT_PED, Q.x1 - 0.34, 0.45, gz, DECK2); mesh(RBOX(0.62, 0.04, 1.36, 0.01), CERAMIC, Q.x1 - 0.34, 0.92, gz, DECK2);
    d2synth(DECK2, Q.x1 - 0.1, 1.42, gz + 0.2, -Math.PI / 2, 'xogalley', 'Galley', 'GAL·02');
    d2seg(Q.x1 - 0.62, gz - 0.65, Q.x1 - 0.62, gz + 0.65, 0.3);
  }
  { // table for two, aft of the sofa
    const tx = -2.5, tz = 10.9;
    mesh(CYL(0.45, 0.45, 0.05, 36), WOOD, tx, 0.74, tz, DECK2); mesh(CYL(0.06, 0.1, 0.7, 14), MAT.steel, tx, 0.36, tz, DECK2); mesh(CYL(0.28, 0.32, 0.03, 26), MAT.steel, tx, 0.015, tz, DECK2);
    d2chair(tx - 0.72, tz, -Math.PI / 2, MAT.leather); d2chair(tx + 0.72, tz, Math.PI / 2, MAT.leather);
    d2obs(tx, tz, 0.5); d2obs(tx - 0.72, tz, 0.28); d2obs(tx + 0.72, tz, 0.28);
    mesh(lathe([[0, 0], [0.04, 0], [0.03, 0.16], [0.07, 0.24], [0.015, 0.32], [0, 0.32]], 18), BRASS, tx, 0.765, tz, DECK2);
    const pl = mesh(new THREE.CircleGeometry(0.4, 32), lightDiscMat, tx, H - 0.006, tz, DECK2); pl.rotation.x = Math.PI / 2;
    mesh(new THREE.TorusGeometry(0.41, 0.02, 8, 36), MAT.steel, tx, H - 0.01, tz, DECK2).rotation.x = Math.PI / 2;
    d2shelf(DECK2, Q.x1 - 0.22, 11.15, -Math.PI / 2, 533); d2obs(Q.x1 - 0.22, 11.15, 0.4);
    d2down(-0.6, 10.6, H);
  }
  { // sleeping cabin: bed to the port wall, wardrobe aft
    d2bed(DECK2, Q.x0 + 1.15, 13.3, 0, 1.35, [1]);
    d2obs(Q.x0 + 0.8, 13.3, 0.62); d2obs(Q.x0 + 1.6, 13.3, 0.62); d2obs(Q.x0 + 0.33, 14.3, 0.28);
    mesh(RBOX(1.2, 2.1, 0.6, 0.03), WOOD, -0.75, 1.05, Q.z1 - 0.36, DECK2); mesh(BOX(0.012, 1.8, 0.012), MAT.steel, -0.75, 1.05, Q.z1 - 0.055, DECK2); d2obs(-0.75, Q.z1 - 0.36, 0.5);
    d2down(Q.x0 + 1.4, 13.3, H); d2down(-1.1, 13.3, H);
  }
}

// ---------- officers' wardroom ----------
{
  const W2 = D2_WARD, H = D2H, cx = 1.3, cz = 20.9;
  d2room('Officers’ wardroom', W2.x0, W2.x1, W2.z0, W2.z1, H, d2RoomWall, MAT.roomCarpet, {
    n: [{ a: W2.door - 0.6 - W2.x0, b: W2.door + 0.6 - W2.x0, y0: 0, y1: 2.3 }],
    e: [{ a: 1.5, b: 6.0, y0: 0.95, y1: 2.25 }],
  });
  const vp = group(W2.x1 - 0.06, 0, 20.75, Math.PI / 2, DECK2); viewport(vp, -2.25, 2.25, 0.95, 2.25, 0);
  // the long table for ten, on two pedestals
  const t = group(cx, 0, cz, 0, DECK2);
  mesh(RBOX(5.0, 0.06, 1.4, 0.03), WOOD, 0, 0.75, 0, t);
  mesh(RBOX(4.8, 0.03, 1.2, 0.01), MAT.leatherDark, 0, 0.79, 0, t);
  [-1.6, 1.6].forEach((x) => { mesh(RBOX(0.3, 0.7, 0.8, 0.03), MAT_PED, x, 0.36, 0, t); mesh(RBOX(0.9, 0.04, 0.9, 0.02), MAT.gunDark, x, 0.02, 0, t); });
  [-1.8, -0.6, 0.6, 1.8].forEach((x) => { d2chair(cx + x, cz - 1.05, 0, MAT.leather); d2chair(cx + x, cz + 1.05, Math.PI, MAT.leather); });
  d2chair(cx - 2.9, cz, -Math.PI / 2, MAT.leather); d2chair(cx + 2.9, cz, Math.PI / 2, MAT.leather);
  [-1.9, -0.6, 0.6, 1.9].forEach((x) => d2obs(cx + x, cz, 0.95)); d2obs(cx - 2.9, cz, 0.35); d2obs(cx + 2.9, cz, 0.35);
  [-1.5, 0, 1.5].forEach((x) => { mesh(lathe([[0, 0], [0.04, 0], [0.035, 0.12], [0.06, 0.2], [0, 0.22]], 16), CERAMIC, cx + x, 0.8, cz, DECK2); });
  // light: two long panels over the table, downlights round the edge
  [-1.25, 1.25].forEach((x) => d2panel(cx + x, cz, H, 2.0, 0.5));
  [[W2.x0 + 1.0, 18.2], [W2.x0 + 1.0, 23.4], [W2.x1 - 1.0, 18.2], [W2.x1 - 1.0, 23.4], [cx, 18.0], [cx, 23.8]].forEach(([x, z]) => d2down(x, z, H));
  // sideboard and the ship's crest on the aft wall
  mesh(RBOX(3.6, 0.9, 0.5, 0.03), WOOD, cx, 0.45, W2.z1 - 0.3, DECK2); mesh(RBOX(3.66, 0.04, 0.54, 0.01), MAT.gunDark, cx, 0.92, W2.z1 - 0.3, DECK2);
  d2seg(cx - 1.8, W2.z1 - 0.55, cx + 1.8, W2.z1 - 0.55, 0.3);
  [-1.2, -0.9, 1.0].forEach((x, i) => mesh(lathe(i === 2 ? [[0, 0], [0.07, 0], [0.08, 0.12], [0.03, 0.28], [0.03, 0.34], [0, 0.34]] : [[0, 0], [0.04, 0], [0.045, 0.1], [0, 0.1]], 18), i === 2 ? GLASS : CERAMIC, cx + x, 0.94, W2.z1 - 0.3, DECK2));
  { const c = cnv(512, 512), x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#8a6a44'); gr.addColorStop(1, '#5e462c'); x.fillStyle = gr; x.fillRect(0, 0, 512, 512);
    x.strokeStyle = 'rgba(255,230,190,0.6)'; x.lineWidth = 6; x.strokeRect(18, 18, 476, 476); drawCrest(x, 256, 210, 130, '#f3dcb4', 8);
    x.fillStyle = '#f7e6c8'; x.textAlign = 'center'; x.font = `600 40px ${DISP}`; x.fillText('U.S.S. DEFIANCE', 256, 400); x.font = `500 26px ${DISP}`; x.fillText('STEADY UNDER FIRE', 256, 446);
    const m = mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshStandardMaterial({ map: tex(c), metalness: 0.7, roughness: 0.35 }), cx, 1.8, W2.z1 - 0.02, DECK2); m.rotation.y = Math.PI; }
  // wall screen on the port side: the mess board
  const sg = group(W2.x0 + 0.04, 1.5, cz, Math.PI / 2, DECK2); display(sg, 1.5, 0.84, 720, 404, 'mess', 'wardroom', 'Wardroom', 'WRD·01');
  plantAt(DECK2, W2.x0 + 0.5, W2.z1 - 0.5, 1.1); plantAt(DECK2, W2.x1 - 0.5, W2.z1 - 0.5, 1.1); d2obs(W2.x0 + 0.5, W2.z1 - 0.5, 0.3); d2obs(W2.x1 - 0.5, W2.z1 - 0.5, 0.3);
}
DECK2.updateMatrixWorld(true);
