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
const D2_SO = { x0: 2.4, x1: 6.2 };
const D2_PAS = { z0: 15.0, z1: 17.0, ax0: -5.4, ax1: -3.2, az1: 24.5, cap: 20.5 };
const D2_LNG = { x0: -5.4, x1: 5.8, z0: 24.5, z1: 31.0, door: -4.3 };
const D2_XO = { x0: -5.4, x1: 0.2, z0: 8.6, z1: 15.0, door: 9.6 };

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
    const m = mesh(new THREE.PlaneGeometry(1.1, 0.5), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), D2_LX + 1.75, 1.6, z1 - 0.082, DECK2); m.rotation.y = Math.PI;
    mesh(RBOX(1.22, 0.62, 0.02, 0.008), MAT.gunDark, D2_LX + 1.75, 1.6, z1 - 0.07, DECK2); }
  const dg = group(x0 + 0.1, 1.45, (z0 + z1) / 2, Math.PI / 2, DECK2); display(dg, 1.3, 0.8, 640, 394, 'deck2', 'deckdir', 'Deck 2 directory', 'D2·00');
  { const b = group(x0 + 0.3, 0, (z0 + z1) / 2, Math.PI / 2, DECK2); mesh(RBOX(1.6, 0.1, 0.42, 0.03), MAT.leather, 0, 0.45, 0, b); mesh(RBOX(1.6, 0.36, 0.36, 0.02), MAT_PED, 0, 0.2, 0.02, b); }
  d2obs(x0 + 0.3, (z0 + z1) / 2 - 0.5, 0.3); d2obs(x0 + 0.3, (z0 + z1) / 2 + 0.5, 0.3);
  plantAt(DECK2, x1 - 0.45, z1 - 0.45, 0.9); d2obs(x1 - 0.45, z1 - 0.45, 0.3);
  d2down(D2_LX, (z0 + z1) / 2, H); d2down(x0 + 1.0, (z0 + z1) / 2, H); d2down(x1 - 1.1, (z0 + z1) / 2, H);
}

// ---------- corridor aft ----------
{
  const { x0, x1, z0, z1 } = D2_COR, H = D2C, cx = (x0 + x1) / 2;
  d2room('Officers’ corridor', x0, x1, z0, z1, H, d2CorrWall, MAT.floorCarpet, {
    w: [{ a: 0.8, b: 2.2, y0: 0, y1: 2.35 }, { a: 6.2, b: 7.4, y0: 0, y1: 2.3 }, { a: 12.4, b: 13.8, y0: 0, y1: 2.35 }],
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
  doorAt(x1, 7.2, -Math.PI / 2, 'SENIOR OFFICER', 'so1q', true, true, DECK2, 2);
  doorAt(x1, 12.0, -Math.PI / 2, 'SENIOR OFFICER', 'so2q', true, true, DECK2, 2);
  doorAt(D2_WARD.door, z1, Math.PI, 'WARDROOM', 'wardoor', true, true, DECK2, 2);
  d2label('AFT · WARDROOM', x1 - 0.08, 2.0, 4.6, -Math.PI / 2, 0.9);
  d2label('PORT · OBSERVATION LOUNGE', x1 - 0.08, 2.0, 15.9, -Math.PI / 2, 1.2);
  // lined reveal for the open way through to the officers' passage
  [15.2, 16.6].forEach((z) => mesh(BOX(0.16, 2.35, 0.04), MAT.gun, x0, 1.175, z, DECK2)); mesh(BOX(0.16, 0.04, 1.44), MAT.gun, x0, 2.35, 15.9, DECK2);
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
    const sg = group(0, 1.5, -0.34, 0, g); display(sg, 1.1, 0.62, 640, 360, 'log', 'qdesk', 'Personal log', 'CO·01');
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

// ---------- senior officers' cabins ----------
// One layout built twice: cabin 2 is cabin 1 mirrored about z 9.6. u runs from the cabin's far end toward its near end.
function d2cabin(n, z0, z1, doorZ, mirror, seed) {
  const { x0, x1 } = D2_SO, H = D2H, Z = (u) => mirror ? z1 - u : z0 + u, f = mirror ? -1 : 1, id = 'so' + n;
  d2room('Senior officers’ cabin ' + n, x0, x1, z0, z1, H, d2RoomWall, MAT.roomCarpet, {
    w: [{ a: doorZ - 0.6 - z0, b: doorZ + 0.6 - z0, y0: 0, y1: 2.3 }],
    e: [{ a: Math.min(Z(2.5), Z(4.7)) - z0, b: Math.max(Z(2.5), Z(4.7)) - z0, y0: 0.9, y1: 2.2 }],
  });
  const vp = group(x1 - 0.06, 0, Z(3.6), Math.PI / 2, DECK2); viewport(vp, -1.1, 1.1, 0.9, 2.2, 0);
  const rr = mulberry(seed), pick = (a) => a[(rr() * a.length) | 0];
  // bed along the starboard side, headboard to the far wall, one bedside table inboard
  d2bed(DECK2, 5.2, Z(1.15), -f * Math.PI / 2, 1.3, [f]);
  d2obs(5.2, Z(0.7), 0.62); d2obs(5.2, Z(1.6), 0.62); d2obs(4.23, Z(0.33), 0.28);
  // wardrobe in the far inboard corner
  mesh(RBOX(0.6, 2.1, 1.2, 0.03), WOOD, x0 + 0.38, 1.05, Z(0.72), DECK2); mesh(BOX(0.012, 1.8, 0.012), MAT.steel, x0 + 0.685, 1.05, Z(0.72), DECK2); d2obs(x0 + 0.38, Z(0.72), 0.55);
  // desk on the inboard wall, the officer facing it
  { const g = group(x0 + 0.46, 0, Z(2.6), Math.PI / 2, DECK2); d2desk(g, 1.3, 0.7, id + 'desk', 'cabin', 'Senior officer', 'SO·0' + n);
    d2chair(x0 + 1.2, Z(2.6), Math.PI / 2, MAT.leatherDark, 'station'); d2obs(x0 + 0.46, Z(2.25), 0.38); d2obs(x0 + 0.46, Z(2.95), 0.38); }
  // armchair by the viewport with a side table
  { d2chair(5.35, Z(3.7), -Math.PI / 2 + f * 0.5, pick([MAT.leather, FABRIC])); d2obs(5.35, Z(3.7), 0.3);
    const t = Z(4.45); mesh(CYL(0.24, 0.24, 0.04, 28), WOOD, 5.6, 0.55, t, DECK2); mesh(CYL(0.04, 0.06, 0.53, 12), MAT.steel, 5.6, 0.27, t, DECK2); d2obs(5.6, t, 0.26);
    mesh(lathe(pick([[[0, 0], [0.05, 0], [0.04, 0.16], [0.07, 0.24], [0, 0.26]], [[0, 0], [0.06, 0], [0.065, 0.09], [0, 0.09]]]), 18), pick([GLASS, CERAMIC, BRASS]), 5.6, 0.57, t, DECK2); }
  // galley counter and synthesizer on the near wall
  { const zn = Z(6.8) - f * 0.06; mesh(RBOX(1.4, 0.9, 0.52, 0.02), MAT_PED, 4.7, 0.45, zn - f * 0.28, DECK2); mesh(RBOX(1.46, 0.04, 0.56, 0.01), CERAMIC, 4.7, 0.92, zn - f * 0.28, DECK2);
    d2synth(DECK2, 4.45, 1.42, zn - f * 0.04, mirror ? 0 : Math.PI, id + 'galley', 'Galley', 'GAL·0' + (2 + n)); d2seg(4.0, zn - f * 0.56, 5.4, zn - f * 0.56, 0.3); }
  d2shelf(DECK2, x1 - 0.22, Z(5.9), -Math.PI / 2, seed + 5); d2obs(x1 - 0.22, Z(5.9), 0.4);
  d2rug(4.5, Z(3.7), 2.0, 2.4, pick(['#2c3340', '#3a2f2a', '#2a3329']), pick(['rgba(201,182,140,0.7)', 'rgba(182,147,196,0.55)', 'rgba(217,176,126,0.6)']), seed);
  plantAt(DECK2, x0 + 0.45, Z(6.3), 0.85); d2obs(x0 + 0.45, Z(6.3), 0.3);
  d2down(4.6, Z(1.1), H); d2down(4.3, Z(3.6), H); d2down(4.3, Z(5.8), H);
}
d2cabin(1, 2.8, 9.6, 7.2, false, 211);
d2cabin(2, 9.6, 16.4, 12.0, true, 457);

// ---------- first officer's quarters ----------
// The captain's quarters, smaller. It starts aft of the Lift 1 shaft (x -3.42..-1.82, z 6.2..8.47 on every deck):
// day cabin forward with the port viewport, sleeping cabin aft behind a partition.
{
  const Q = D2_XO, H = D2H, PZ = 12.6;
  d2room('First officer’s quarters', Q.x0, Q.x1, Q.z0, Q.z1, H, d2RoomWall, MAT.roomCarpet, {
    e: [{ a: Q.door - 0.6 - Q.z0, b: Q.door + 0.6 - Q.z0, y0: 0, y1: 2.3 }],
    w: [{ a: 0.8, b: 3.2, y0: 0.9, y1: 2.2 }],
  });
  const vp = group(Q.x0 + 0.06, 0, Q.z0 + 2.0, -Math.PI / 2, DECK2); viewport(vp, -1.2, 1.2, 0.9, 2.2, 0);
  d2partX(PZ, Q.x0 + 0.06, Q.x1 - 0.06, -2.7, -1.7, H);
  { // sitting area facing the viewport: sofa, low table, rug
    const sx = -3.2, sz = Q.z0 + 2.0, g = group(sx, 0, sz, Math.PI / 2, DECK2);
    mesh(RBOX(2.0, 0.4, 0.86, 0.05), FABRIC, 0, 0.22, 0, g);
    mesh(RBOX(2.0, 0.5, 0.22, 0.06), FABRIC, 0, 0.62, 0.34, g);
    [-0.98, 0.98].forEach((x) => mesh(RBOX(0.2, 0.6, 0.86, 0.05), FABRIC, x, 0.32, 0, g));
    [-0.45, 0.45].forEach((x) => mesh(RBOX(0.88, 0.12, 0.66, 0.05), FABRIC, x, 0.46, -0.06, g));
    mesh(RBOX(2.0, 0.06, 0.86, 0.02), MAT.gunDark, 0, 0.03, 0, g);
    [-0.6, 0.6].forEach((z) => d2obs(sx, sz + z, 0.48));
    const t = group(sx - 1.05, 0, sz, Math.PI / 2, DECK2); mesh(RBOX(1.1, 0.05, 0.52, 0.02), WOOD, 0, 0.42, 0, t); [-0.45, 0.45].forEach((x) => mesh(RBOX(0.06, 0.4, 0.42, 0.01), MAT.steel, x, 0.2, 0, t));
    mesh(lathe([[0, 0], [0.05, 0], [0.04, 0.16], [0.07, 0.24], [0, 0.26]], 18), GLASS, -0.25, 0.445, 0.05, t);
    d2obs(sx - 1.05, sz - 0.35, 0.33); d2obs(sx - 1.05, sz + 0.35, 0.33);
    d2rug(sx - 0.75, sz, 2.4, 2.8, '#2c3340', 'rgba(201,182,140,0.7)', 91);
    d2down(sx - 0.75, sz - 0.9, H); d2down(sx - 0.75, sz + 0.9, H);
    plantAt(DECK2, Q.x0 + 0.42, PZ - 0.35, 0.9); d2obs(Q.x0 + 0.42, PZ - 0.35, 0.3);
    // a framed print of a ringed planet on the forward wall, above the sofa's end
    const c = cnv(384, 256), x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#101826'); gr.addColorStop(1, '#2a2233'); x.fillStyle = gr; x.fillRect(0, 0, 384, 256);
    x.fillStyle = '#c9a477'; x.beginPath(); x.arc(200, 130, 62, 0, Math.PI * 2); x.fill(); x.strokeStyle = 'rgba(230,205,160,0.8)'; x.lineWidth = 5; x.beginPath(); x.ellipse(200, 132, 120, 22, -0.25, 0, Math.PI * 2); x.stroke();
    const rs = mulberry(77); for (let i = 0; i < 60; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.3 + rs() * 0.6) + ')'; x.fillRect(rs() * 384, rs() * 256, 1.5, 1.5); }
    mesh(RBOX(0.86, 0.6, 0.03, 0.01), WOOD, -3.3, 1.6, Q.z0 + 0.075, DECK2);
    mesh(new THREE.PlaneGeometry(0.76, 0.5), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.5 }), -3.3, 1.6, Q.z0 + 0.092, DECK2);
  }
  { // desk on the starboard wall aft of the door, the officer facing the wall
    const dx = Q.x1 - 0.46, dz = 11.35, g = group(dx, 0, dz, -Math.PI / 2, DECK2);
    d2desk(g, 1.5, 0.72, 'xodesk', 'xo', 'First officer', 'XO·01');
    d2chair(dx - 0.8, dz, -Math.PI / 2, MAT.leatherDark, 'station'); d2obs(dx - 0.8, dz, 0.26);
    d2obs(dx, dz - 0.45, 0.4); d2obs(dx, dz + 0.45, 0.4);
    d2down(dx - 0.5, dz, H);
  }
  { // galley counter on the forward wall, beside the door
    const gx = -1.05, gz = Q.z0 + 0.34;
    mesh(RBOX(1.3, 0.9, 0.56, 0.02), MAT_PED, gx, 0.45, gz, DECK2); mesh(RBOX(1.36, 0.04, 0.62, 0.01), CERAMIC, gx, 0.92, gz, DECK2);
    d2synth(DECK2, gx - 0.2, 1.42, Q.z0 + 0.1, 0, 'xogalley', 'Galley', 'GAL·02');
    d2seg(gx - 0.65, gz + 0.3, gx + 0.65, gz + 0.3, 0.3);
    d2down(gx, gz + 0.9, H);
  }
  { // sleeping cabin: bed to the port wall, one bedside table, wardrobe aft, shelves on the partition
    d2bed(DECK2, Q.x0 + 1.15, 13.8, 0, 1.2, [1]);
    d2obs(Q.x0 + 0.8, 13.8, 0.6); d2obs(Q.x0 + 1.6, 13.8, 0.6); d2obs(Q.x0 + 0.33, 14.72, 0.28);
    mesh(RBOX(1.2, 2.1, 0.6, 0.03), WOOD, -0.75, 1.05, Q.z1 - 0.36, DECK2); mesh(BOX(0.012, 1.8, 0.012), MAT.steel, -0.75, 1.05, Q.z1 - 0.055, DECK2); d2obs(-0.75, Q.z1 - 0.36, 0.5);
    d2shelf(DECK2, -0.85, PZ + 0.25, 0, 533); d2obs(-0.85, PZ + 0.25, 0.4);
    d2down(Q.x0 + 1.4, 13.8, H); d2down(-1.4, 13.8, H);
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
    const m = mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshStandardMaterial({ map: tex(c), metalness: 0.7, roughness: 0.35 }), cx, 1.8, W2.z1 - 0.08, DECK2); m.rotation.y = Math.PI; }
  // wall screen on the port side: the mess board
  const sg = group(W2.x0 + 0.1, 1.5, cz, Math.PI / 2, DECK2); display(sg, 1.5, 0.84, 720, 404, 'mess', 'wardroom', 'Wardroom', 'WRD·01');
  plantAt(DECK2, W2.x0 + 0.5, W2.z1 - 0.5, 1.1); plantAt(DECK2, W2.x1 - 0.5, W2.z1 - 0.5, 1.1); d2obs(W2.x0 + 0.5, W2.z1 - 0.5, 0.3); d2obs(W2.x1 - 0.5, W2.z1 - 0.5, 0.3);
}

// ---------- officers' passage and observation lounge ----------
// From the corridor's aft end a short passage turns to port, then runs aft along the wardroom's port side, past the
// sealed turret capacitor bank, to the observation lounge across the stern of the spine.
function d2frames(x0, x1, z0, z1, H) { // structural frames every 2.4 m along z, a light panel between each, handrails
  const cx = (x0 + x1) / 2;
  for (let z = z0 + 1.2; z < z1 - 0.4; z += 2.4) {
    [x0 + 0.05, x1 - 0.05].forEach((x) => mesh(RBOX(0.1, H - 0.05, 0.16, 0.02), MAT.gunDark, x, (H - 0.05) / 2, z, DECK2));
    mesh(RBOX(x1 - x0, 0.12, 0.16, 0.02), MAT.gunDark, cx, H - 0.06, z, DECK2);
    if (z + 1.2 < z1 - 0.5) d2panel(cx, z + 1.2, H, 0.9, 0.36);
  }
}
{
  const P = D2_PAS, H = D2C, op = [{ a: 0.12, b: 1.88, y0: 0, y1: 2.35 }];
  d2room('Officers’ passage', P.ax1, 0.2, P.z0, P.z1, H, d2CorrWall, MAT.floorCarpet, { e: [{ a: 0.2, b: 1.6, y0: 0, y1: 2.35 }], w: op });
  d2room('Officers’ passage', P.ax0, P.ax1, P.z0, P.az1, H, d2CorrWall, MAT.floorCarpet, {
    e: op, w: [{ a: P.cap - 0.6 - P.z0, b: P.cap + 0.6 - P.z0, y0: 0, y1: 2.3 }],
    s: [{ a: D2_LNG.door - 0.6 - P.ax0, b: D2_LNG.door + 0.6 - P.ax0, y0: 0, y1: 2.3 }],
  });
  [P.z0 + 0.12, P.z1 - 0.12].forEach((z) => mesh(BOX(0.16, 2.35, 0.04), MAT.gun, P.ax1, 1.175, z, DECK2)); mesh(BOX(0.16, 0.04, 1.8), MAT.gun, P.ax1, 2.35, (P.z0 + P.z1) / 2, DECK2);
  d2panel((P.ax1 + 0.2) / 2, (P.z0 + P.z1) / 2, H, 0.9, 0.36);
  d2frames(P.ax0, P.ax1, P.z1, P.az1, H);
  { const r = mesh(CYL(0.022, 0.022, P.az1 - P.z1 - 0.6, 10), MAT.steel, P.ax1 - 0.06, 0.95, (P.z1 + P.az1) / 2, DECK2); r.rotation.x = Math.PI / 2; }
  d2label('AFT · OBSERVATION LOUNGE', P.ax0 + 0.08, 2.0, 16.0, Math.PI / 2, 1.2);
  doorAt(P.ax0, P.cap, Math.PI / 2, 'TURRET CAPACITORS', 'capbank', false, true, DECK2, 2);
  doorAt(D2_LNG.door, P.az1, Math.PI, 'OBSERVATION LOUNGE', 'lngdoor', true, true, DECK2, 2);
}
{
  const L = D2_LNG, H = D2H, cx = (L.x0 + L.x1) / 2, WY0 = 0.75, WY1 = 2.35;
  d2room('Observation lounge', L.x0, L.x1, L.z0, L.z1, H, d2RoomWall, MAT.roomCarpet, {
    n: [{ a: L.door - 0.6 - L.x0, b: L.door + 0.6 - L.x0, y0: 0, y1: 2.3 }],
    s: [{ a: 0.6, b: 10.6, y0: WY0, y1: WY1 }],
  });
  const vp = group(cx, 0, L.z1 - 0.06, 0, DECK2); viewport(vp, -5.0, 5.0, WY0, WY1, 0);
  SHUTTERS[SHUTTERS.length - 1].hideOpen = true; // the lounge's shutters fold away completely when open, so nothing crosses the view
  // the sill ledge under the window, with swivel chairs facing out
  mesh(RBOX(9.8, 0.05, 0.42, 0.015), WOOD, cx, WY0 + 0.02, L.z1 - 0.32, DECK2);
  mesh(RBOX(9.8, WY0 - 0.05, 0.3, 0.02), MAT_PED, cx, (WY0 - 0.05) / 2, L.z1 - 0.22, DECK2);
  mesh(BOX(9.6, 0.016, 0.016), STRIP, cx, 0.06, L.z1 - 0.38, DECK2);
  d2seg(L.x0 + 0.4, L.z1 - 0.53, L.x1 - 0.4, L.z1 - 0.53, 0.3);
  [-4.0, -2.4, -0.8, 1.2, 2.8, 4.4].forEach((x) => { d2chair(x, L.z1 - 1.0, Math.PI, MAT.leather, 'station'); d2obs(x, L.z1 - 1.0, 0.26); });
  // small round tables, three chairs each
  [[-2.5, 27.5, 0.3], [1.1, 26.9, 1.1], [3.9, 27.6, 0.7]].forEach(([tx, tz, a0], i) => {
    mesh(CYL(0.42, 0.42, 0.045, 32), WOOD, tx, 0.72, tz, DECK2); mesh(CYL(0.05, 0.09, 0.68, 14), MAT.steel, tx, 0.35, tz, DECK2); mesh(CYL(0.26, 0.3, 0.03, 24), MAT.steel, tx, 0.015, tz, DECK2);
    d2obs(tx, tz, 0.46);
    [0, 1, 2].forEach((k) => { const a = a0 + k * Math.PI * 2 / 3, x = tx + Math.sin(a) * 0.78, z = tz + Math.cos(a) * 0.78; d2chair(x, z, a, [MAT.leather, FABRIC, MAT.leatherDark][i]); d2obs(x, z, 0.26); });
    mesh(lathe([[0, 0], [0.035, 0], [0.03, 0.1], [0.05, 0.17], [0, 0.19]], 16), i === 1 ? GLASS : CERAMIC, tx + 0.1, 0.745, tz - 0.05, DECK2);
    d2down(tx, tz, H);
  });
  // the bar on the starboard wall: counter, synthesizer, bottles, two swivel stools
  { const bx = L.x1 - 0.38, bz = 26.6;
    mesh(RBOX(0.6, 1.0, 2.6, 0.02), WOOD, bx, 0.5, bz, DECK2); mesh(RBOX(0.68, 0.05, 2.7, 0.015), MAT.gunDark, bx, 1.02, bz, DECK2);
    mesh(BOX(0.012, 0.012, 2.4), STRIP, bx - 0.31, 0.08, bz, DECK2);
    d2synth(DECK2, L.x1 - 0.1, 1.55, bz + 0.5, -Math.PI / 2, 'lgalley', 'Lounge bar', 'GAL·05');
    const rr = mulberry(808); for (let k = 0; k < 6; k++) mesh(lathe([[0, 0], [0.035, 0], [0.035, 0.18], [0.012, 0.24], [0.012, 0.3], [0, 0.3]], 14), k % 2 ? GLASS : BRASS, bx + (rr() - 0.5) * 0.2, 1.045, bz - 1.1 + k * 0.12, DECK2);
    d2seg(bx - 0.32, bz - 1.3, bx - 0.32, bz + 1.3, 0.3);
    [bz - 0.6, bz + 0.6].forEach((z) => { d2chair(bx - 0.85, z, -Math.PI / 2, MAT.leatherDark, 'station'); d2obs(bx - 0.85, z, 0.26); });
    d2down(bx - 0.4, bz, H); }
  // the wall screen on the forward wall, and the view it describes
  { const g = group(1.6, 1.55, L.z0 + 0.1, 0, DECK2); display(g, 1.7, 0.95, 720, 402, 'lounge', 'lounge', 'Observation lounge', 'OBS·01'); }
  plantAt(DECK2, L.x0 + 0.45, L.z1 - 1.2, 1.1); d2obs(L.x0 + 0.45, L.z1 - 1.2, 0.3);
  plantAt(DECK2, L.x0 + 0.45, L.z0 + 1.6, 1.0); d2obs(L.x0 + 0.45, L.z0 + 1.6, 0.3);
  plantAt(DECK2, -0.6, L.z0 + 0.45, 1.0); d2obs(-0.6, L.z0 + 0.45, 0.3);
  [-3.6, -1.0, 1.6, 4.2].forEach((x) => d2down(x, L.z1 - 1.0, H)); d2down(-3.9, 25.4, H); d2down(1.6, 25.3, H);
}

// ---------- outside: the set piece seen through Deck 2's windows ----------
// A simple, original stand-in for the exterior until the real model is built, following the bridge's systems display:
// a long swept hull back under the officers' spine (its top just below every window sill), the raised arch aft of the
// lounge with the dorsal turret on its crown, and slim nacelles on swept spars, low and aft. Matcap materials
// (a painted ball of light, no scene lights) and additive glows: the light bake ignores all of it (bake_export skips EXTSET).
const EXTSET = group(0, 0, 0, 0, DECK2); EXTSET.name = 'Exterior set piece';
{
  const mc = cnv(256, 256), m = mc.getContext('2d');
  { const g = m.createRadialGradient(92, 84, 8, 128, 128, 128); g.addColorStop(0, '#f2efe8'); g.addColorStop(0.45, '#b8bbbf'); g.addColorStop(0.8, '#6b717a'); g.addColorStop(1, '#3a4049'); m.fillStyle = g; m.fillRect(0, 0, 256, 256);
    const r = m.createRadialGradient(190, 200, 10, 190, 200, 90); r.addColorStop(0, 'rgba(232,160,106,0.28)'); r.addColorStop(1, 'rgba(232,160,106,0)'); m.fillStyle = r; m.fillRect(0, 0, 256, 256); }
  const plate = cnv(512, 512), q = plate.getContext('2d'), rr = mulberry(1701);
  q.fillStyle = '#d9d9d6'; q.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) { const v = 200 + ((rr() * 30) | 0); q.fillStyle = `rgb(${v},${v},${v - 4})`; q.fillRect((rr() * 8 | 0) * 64, (rr() * 8 | 0) * 64, 64 * (1 + (rr() * 3 | 0)), 64 * (1 + (rr() * 2 | 0))); }
  q.strokeStyle = 'rgba(40,44,52,0.18)'; q.lineWidth = 2; for (let k = 0; k <= 512; k += 64) { q.beginPath(); q.moveTo(k, 0); q.lineTo(k, 512); q.stroke(); }
  for (let k = 0; k <= 512; k += 128) { q.beginPath(); q.moveTo(0, k + ((k / 128) % 2) * 32); q.lineTo(512, k + ((k / 128) % 2) * 32); q.stroke(); }
  const pt = tex(plate); pt.wrapS = pt.wrapT = THREE.RepeatWrapping; pt.colorSpace = THREE.SRGBColorSpace;
  const HULL = new THREE.MeshMatcapMaterial({ matcap: tex(mc), map: pt, fog: false });
  const DARK = new THREE.MeshMatcapMaterial({ matcap: tex(mc), color: 0x6a7078, fog: false });
  const glow = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false });
  const GRILLE = glow(0x6fb6e6, 0.85), CAP = glow(0xe0704a, 0.9), IMP = glow(0xd2503c, 0.8);
  const lerpT = (T, z) => { for (let i = 1; i < T.length; i++) if (z <= T[i][0]) { const [z0, a] = T[i - 1], [z1, b] = T[i], t = (z - z0) / (z1 - z0); return a + (b - a) * t * t * (3 - 2 * t); } return T[T.length - 1][1]; };
  const W = [[-64, 0.5], [-58, 24], [-30, 40], [14, 46], [48, 40], [76, 20], [132, 14], [136, 9]]; // half-beam
  const Y = [[-64, -14], [-34, -3.5], [-4, -0.6], [86, -0.7], [118, -4], [136, -9.5]];              // top of the hull back
  // the hull back: a grid across the beam, falling away at the edges into a skirt
  { const NZ = 90, NX = 30, pos = [], uv = [], idx = [];
    for (let i = 0; i <= NZ; i++) { const z = -64 + 200 * i / NZ, w = lerpT(W, z), y0 = lerpT(Y, z);
      for (let j = 0; j <= NX; j++) { const v = j / NX * 2 - 1, a = Math.abs(v), x = v * w * (a > 0.85 ? 1 - (a - 0.85) * 0.5 : 1), y = y0 - 5 * Math.pow(Math.min(a, 0.85) / 0.85, 2.6) - (a > 0.85 ? (a - 0.85) / 0.15 * 9 : 0);
        pos.push(x, y, z); uv.push(x / 34, z / 34); } }
    for (let i = 0; i < NZ; i++) for (let j = 0; j < NX; j++) { const a = i * (NX + 1) + j, b = a + NX + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const hm = new THREE.Mesh(g, HULL); hm.material.side = THREE.DoubleSide; EXTSET.add(hm); }
  // sweep a rounded box section along a path: P = [[x, y, z]...], sec(t) = [half width, half thickness], side = lateral axis
  function sweep(P, sec, side, n) {
    const curve = new THREE.CatmullRomCurve3(P.map((p) => new THREE.Vector3(...p))), N = n || 40, R = 12, pos = [], idx = [], S = new THREE.Vector3(...side).normalize();
    for (let i = 0; i <= N; i++) { const t = i / N, c = curve.getPointAt(t), T = curve.getTangentAt(t), U = new THREE.Vector3().crossVectors(T, S).normalize(), L = new THREE.Vector3().crossVectors(U, T).normalize(), [hw, ht] = sec(t);
      for (let k = 0; k < R; k++) { const a = k / R * Math.PI * 2, cx = Math.cos(a), cy = Math.sin(a), ex = Math.sign(cx) * Math.pow(Math.abs(cx), 0.45) * hw, ey = Math.sign(cy) * Math.pow(Math.abs(cy), 0.45) * ht;
        pos.push(c.x + L.x * ex + U.x * ey, c.y + L.y * ex + U.y * ey, c.z + L.z * ex + U.z * ey); } }
    for (let i = 0; i < N; i++) for (let k = 0; k < R; k++) { const a = i * R + k, b = i * R + (k + 1) % R; idx.push(a, a + R, b, b, a + R, b + R); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  // the arch over the back: two rails rising from the hull either side of the centreline, joined at the crown by the
  // turret deck, so from the lounge it frames the view aft like a gate; in side view it is the MSD's arch
  [-1, 1].forEach((sd) => EXTSET.add(new THREE.Mesh(sweep([[sd * 7.5, -1.5, 47], [sd * 6.5, 6.5, 54], [sd * 5.2, 11, 65], [sd * 5.2, 11, 73], [sd * 6.5, 6.5, 84], [sd * 7.5, -1.5, 91]], (t) => { const e = Math.abs(t - 0.5) * 2; return [0.9 + Math.pow(e, 3) * 1.6, 0.6 + Math.pow(e, 3) * 0.9]; }, [1, 0, 0], 40), DARK)));
  mesh(RBOX(11.4, 0.9, 9.0, 0.3), DARK, 0, 11.1, 69, EXTSET);
  mesh(BOX(11.0, 0.12, 0.3), GRILLE, 0, 10.6, 64.4, EXTSET);
  { const tg = group(0, 11.55, 69, 0, EXTSET);
    mesh(lathe([[0, 0], [3.0, 0], [3.1, 0.5], [2.7, 1.5], [1.6, 2.2], [0, 2.4]], 36), DARK, 0, 0, 0, tg);
    mesh(new THREE.TorusGeometry(2.95, 0.12, 6, 40), GRILLE, 0, 0.55, 0, tg).rotation.x = Math.PI / 2;
    [-0.7, 0.7].forEach((x) => { const b = mesh(CYL(0.28, 0.36, 6.5, 12), DARK, x, 1.3, -3.6, tg); b.rotation.x = Math.PI / 2; mesh(CYL(0.2, 0.2, 0.1, 10), GRILLE, x, 1.3, -6.85, tg).rotation.x = Math.PI / 2; }); }
  // a low dorsal strake running aft down the centreline, and dark sensor strips along the shoulders
  mesh(RBOX(2.2, 0.6, 80, 0.25), DARK, 0, -0.55, 70, EXTSET);
  [-1, 1].forEach((sd) => { const st = mesh(BOX(0.6, 0.1, 50), DARK, sd * 18, -3.0, 70, EXTSET); st.rotation.z = sd * 0.35; });
  // spars and nacelles, low and aft
  [-1, 1].forEach((sd) => {
    EXTSET.add(new THREE.Mesh(sweep([[sd * 14, -3.5, 72], [sd * 26, -4.6, 84], [sd * 38, -5.8, 96], [sd * 46, -6.2, 104]], (t) => [3.2 - t * 1.4, 0.5], [0, 1, 0], 20), DARK));
    const ng = group(sd * 48, -6.3, 70, 0, EXTSET);
    const prof = [[0, 0], [1.3, 0.25], [2.1, 1.0], [2.5, 2.4], [2.6, 5], [2.6, 50], [2.3, 58], [1.4, 64], [0, 65]];
    const nm = mesh(lathe(prof, 32), HULL, 0, 0, 0, ng); nm.rotation.x = Math.PI / 2;
    const cap = mesh(lathe([[0, 0], [1.35, 0.28], [2.05, 1.0], [2.4, 2.2], [0, 2.4]], 28), CAP, 0, 0, 0, ng); cap.rotation.x = Math.PI / 2; cap.scale.setScalar(1.02);
    [-1, 1].forEach((up) => { const gr = mesh(BOX(0.18, 0.5, 40), GRILLE, -sd * 2.55, up * 0.8, 28, ng); gr.rotation.z = -sd * up * 0.3; });
    mesh(new THREE.SphereGeometry(0.35, 10, 8), glow(sd < 0 ? 0xff4a3a : 0x5aff7a, 1), sd * 2.7, 0, 60, ng);
  });
  mesh(BOX(14, 1.4, 0.4), IMP, 0, -6.5, 135.8, EXTSET);
  EXTSET.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.userData.noPick = true; } });
}
DECK2.updateMatrixWorld(true);
