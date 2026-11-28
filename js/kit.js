// USS Defiance · kit.js
// The shared building kit for decks below the bridge: rooms, walls with door and window openings, collision lines,
// downlights and light panels, structural frames, handrails, corridor signs and potted plants. Every helper takes a
// deck context K = { root (the deck's group), segs, obs, rooms, rails, labels } as its first argument, so each deck
// builds with the same parts and the same standard sizes (STD, core.js). Deck 2 calls these through its d2* wrappers.
// Coordinates are the deck's own: x starboard, -z forward, y up from the deck floor.
// Files share one global scope and load in order (see index.html).
'use strict';

function kitSeg(K, ax, az, bx, bz, r) { K.segs.push([ax, az, bx, bz, r === undefined ? 0.33 : r]); }

function kitObs(K, x, z, r) { K.obs.push({ x, z, r }); }

// a straight wall from A to B facing n, with openings measured along it: { a, b, y0, y1 } (y0 > 0 means a window)
function kitWall(K, mat, A, B, n, H, holes) {
  const len = Math.hypot(B[0] - A[0], B[1] - A[1]), dir = [(B[0] - A[0]) / len, (B[1] - A[1]) / len], P = (s) => [A[0] + dir[0] * s, A[1] + dir[1] * s];
  let s = 0; (holes || []).slice().sort((p, q) => p.a - q.a).forEach((h) => {
    wallPiece(mat, A, dir, n, s, h.a, 0, H, H, 1.2, K.root);
    if (h.y0 > 0.001) wallPiece(mat, A, dir, n, h.a, h.b, 0, h.y0, H, 1.2, K.root);
    if (h.y1 < H - 0.001) wallPiece(mat, A, dir, n, h.a, h.b, h.y1, H, H, 1.2, K.root);
    const p0 = P(s), p1 = P(h.a); kitSeg(K, p0[0], p0[1], p1[0], p1[1]);
    if (h.y0 > 0.4) { const q0 = P(h.a), q1 = P(h.b); kitSeg(K, q0[0], q0[1], q1[0], q1[1]); }
    s = h.b;
  });
  wallPiece(mat, A, dir, n, s, len, 0, H, H, 1.2, K.root);
  const p0 = P(s), p1 = P(len); kitSeg(K, p0[0], p0[1], p1[0], p1[1]);
}

// a room: floor, ceiling, four walls facing in, a cove light and a dark crown under the ceiling
function kitRoom(K, label, x0, x1, z0, z1, H, mat, floor, holes) {
  const fw = x1 - x0, fd = z1 - z0;
  const fg = new THREE.PlaneGeometry(fw, fd); { const uv = fg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * fw, uv.getY(i) * fd); }
  const f = mesh(fg, floor, (x0 + x1) / 2, 0.002, (z0 + z1) / 2, K.root); f.rotation.x = -Math.PI / 2;
  const c = mesh(fg.clone(), MAT.ceiling, (x0 + x1) / 2, H, (z0 + z1) / 2, K.root); c.rotation.x = Math.PI / 2;
  // walls sit 6 cm inside the room's outline, so two rooms back to back never share one plane
  // (coincident back-to-back walls shadow each other in the light bake and come out black)
  const I = STD.inset, sh = (L) => (L || []).map((h) => Object.assign({}, h, { a: h.a - I, b: h.b - I }));
  holes = holes || {};
  kitWall(K, mat, [x0 + I, z0 + I], [x1 - I, z0 + I], [0, 1], H, sh(holes.n));
  kitWall(K, mat, [x0 + I, z1 - I], [x1 - I, z1 - I], [0, -1], H, sh(holes.s));
  kitWall(K, mat, [x0 + I, z0 + I], [x0 + I, z1 - I], [1, 0], H, sh(holes.w));
  kitWall(K, mat, [x1 - I, z0 + I], [x1 - I, z1 - I], [-1, 0], H, sh(holes.e));
  [[(x0 + x1) / 2, z0 + 0.13, fw - 0.3, 0], [(x0 + x1) / 2, z1 - 0.13, fw - 0.3, 0], [x0 + 0.13, (z0 + z1) / 2, fd - 0.3, Math.PI / 2], [x1 - 0.13, (z0 + z1) / 2, fd - 0.3, Math.PI / 2]].forEach(([x, z, L, ry]) => {
    const cv = mesh(BOX(L, 0.03, 0.03), SLOT, x, H - 0.28, z, K.root); cv.rotation.y = ry;
    const sh = mesh(RBOX(L + 0.1, 0.08, 0.12, 0.015), MAT.gunDark, x, H - 0.23, z, K.root); sh.rotation.y = ry;
    const st = mesh(BOX(L - 0.2, 0.02, 0.02), STRIP, x, 0.06, z, K.root); st.rotation.y = ry;
  });
  K.rooms.push({ label, x0, x1, z0, z1 });
}

function kitDown(K, x, z, H) {
  mesh(new THREE.CircleGeometry(0.1, 20), downlightMat, x, H - 0.004, z, K.root).rotation.x = Math.PI / 2;
  mesh(new THREE.TorusGeometry(0.115, 0.016, 6, 20), MAT.steel, x, H - 0.008, z, K.root).rotation.x = Math.PI / 2;
}

function kitPanel(K, x, z, H, w, d) {
  mesh(RBOX(w + 0.12, 0.04, d + 0.12, 0.015), MAT.steel, x, H - 0.02, z, K.root);
  mesh(new THREE.PlaneGeometry(w, d), downlightMat, x, H - 0.045, z, K.root).rotation.x = Math.PI / 2;
}

// a potted plant kept inside the walls of the room it stands in (walls are inset 6 cm from each room's outline)
function kitPlant(K, x, z, scale) {
  const r = K.rooms.find((q) => x > q.x0 && x < q.x1 && z > q.z0 && z < q.z1), I = STD.inset;
  plantAt(K.root, x, z, scale, r && [r.x0 + I, r.x1 - I, r.z0 + I, r.z1 - I]); kitObs(K, x, z, 0.3);
}

// a handrail along a wall at x from z0 to z1, broken at each gap [za, zb] (doorways and openings), with end brackets
function kitRail(K, x, z0, z1, gaps, side) {
  let runs = [[z0, z1]];
  (gaps || []).forEach(([a, b]) => { runs = runs.flatMap(([p, q]) => (b <= p || a >= q) ? [[p, q]] : [[p, a], [b, q]].filter(([u, v]) => v - u > 0.25)); });
  runs.forEach(([p, q]) => {
    const r = mesh(CYL(0.022, 0.022, q - p, 10), MAT.steel, x, 0.95, (p + q) / 2, K.root); r.rotation.x = Math.PI / 2; K.rails.push([x, p, q]);
    [p + 0.06, q - 0.06].forEach((z) => mesh(BOX(0.07, 0.025, 0.025), MAT.steel, x - side * 0.035, 0.95, z, K.root));
  });
}

function kitLabel(K, text, x, y, z, rot, w) {
  const c = cnv(512, 80), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 512, 80);
  hexTab(g, 6, 10, 40, 60, true, false); g.fillStyle = '#E8A06A'; g.fill();
  g.fillStyle = '#E8A06A'; g.font = `600 44px ${DISP}`; g.textBaseline = 'middle'; g.fillText(text, 60, 43);
  const m = mesh(new THREE.PlaneGeometry(w, w * 80 / 512), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), x, y, z, K.root); m.rotation.y = rot; K.labels.push(m); return m;
}

// ---------- officers' passage and observation lounge ----------
// From the corridor's aft end a short passage turns to port, then runs aft along the wardroom's port side, past the
// sealed pod capacitor bank, to the observation lounge across the stern of the spine.
function kitFrames(K, x0, x1, z0, z1, H) { // structural frames every 2.4 m along z, a light panel between each, handrails
  const cx = (x0 + x1) / 2;
  for (let z = z0 + 1.2; z < z1 - 0.4; z += 2.4) {
    [x0 + 0.05, x1 - 0.05].forEach((x) => mesh(RBOX(0.1, H - 0.05, 0.16, 0.02), MAT.gunDark, x, (H - 0.05) / 2, z, K.root));
    mesh(RBOX(x1 - x0, 0.12, 0.16, 0.02), MAT.gunDark, cx, H - 0.06, z, K.root);
    if (z + 1.2 < z1 - 0.5) kitPanel(K, cx, z + 1.2, H, 0.9, 0.36);
  }
}

// ---------- the corridor kit (roadmap B2) ----------
// Corridors are built from modules: a 2.2 m wide, 2.6 m high (STD.corridor) piece of corridor with its floor, ceiling,
// walls, a structural frame at its start (frames hide every joint), a ceiling light panel, cove light and shelf, base
// strip and handrails. Each side of a module is a wall, a door opening (1.2 m, at the module's centre) or open. A
// module may taper (ring corridors: the inner wall shorter than the outer), so a ring is a polygon of identical straight
// pieces bending at every frame. Every variant is built once and all its copies are drawn as instances (one draw per
// variant and material), placed by kitCorridorBuild from a deck's floor plan (deck3.js).
// Module frame: x across (-1.1 left to +1.1 right), y up from the floor, z along (start edge at -len/2).
const CKIT = { variants: new Map() };
// the section colour band along the walls: white paint, tinted per copy (InstancedMesh instance colours)
CKIT.band = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.05, envMapIntensity: 0.3 });
// merge [geometry, Matrix4] pairs into one geometry (position, normal, uv), so a variant's parts per material are one mesh
function kitGeo(list) {
  const pos = [], nor = [], uv = [];
  list.forEach(([g0, m]) => {
    const g = g0.index ? g0.toNonIndexed() : g0.clone(); if (m) g.applyMatrix4(m); if (!g.attributes.normal) g.computeVertexNormals();
    const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
    for (let i = 0; i < P.count; i++) { pos.push(P.getX(i), P.getY(i), P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i)); uv.push(U ? U.getX(i) : 0, U ? U.getY(i) : 0); }
  });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeBoundingSphere(); return g;
}
// a flat quad through four points (any order round its edge) facing along n, with uvs
function kitQuad(P, UV, n) {
  const a = new THREE.Vector3(...P[0]), b = new THREE.Vector3(...P[1]), c = new THREE.Vector3(...P[2]);
  const f = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).dot(new THREE.Vector3(...n)) < 0;
  const o = f ? [0, 3, 2, 1] : [0, 1, 2, 3], idx = [o[0], o[1], o[2], o[0], o[2], o[3]];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(idx.flatMap((i) => P[i]), 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(idx.flatMap(() => n), 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(idx.flatMap((i) => UV[i]), 2));
  return g;
}
const kitM4 = (x, y, z, ry, rx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, 0)), new THREE.Vector3(1, 1, 1));
// one module variant: sides [left, right], each 'w' wall, 'd' door, 'o' open; lin and lout the lengths of the left and
// right edges (equal for a straight piece); x: a crossing (open both sides, posts at the corners). Returns [{ geo, mat }].
function kitModule(L, R, lin, lout, wallMat) {
  const H = STD.corridor.h, W = STD.corridor.w / 2, zA = (x, s) => s * (lin + (lout - lin) * (x + W) / (2 * W)) / 2;
  const by = new Map(), put = (mat, g, m) => { if (!by.has(mat)) by.set(mat, []); by.get(mat).push([g, m]); };
  const f = [[-W, 0, zA(-W, -1)], [-W, 0, zA(-W, 1)], [W, 0, zA(W, 1)], [W, 0, zA(W, -1)]];
  put(MAT.floorCarpet, kitQuad(f.map(([x, , z]) => [x, 0.002, z]), f.map(([x, , z]) => [x, z]), [0, 1, 0]));
  put(MAT.ceiling, kitQuad(f.map(([x, , z]) => [x, H, z]), f.map(([x, , z]) => [x / 1.2, z / 1.2]), [0, -1, 0]));
  // light panel in the middle of the ceiling
  put(MAT.steel, RBOX(1.02, 0.04, 0.48, 0.015), kitM4(0, H - 0.02, 0, 0));
  put(downlightMat, new THREE.PlaneGeometry(0.9, 0.36), kitM4(0, H - 0.045, 0, 0, Math.PI / 2));
  [[-1, L], [1, R]].forEach(([s, k]) => {
    const x = s * W, z0 = zA(x, -1), z1 = zA(x, 1), len = z1 - z0, n = [-s, 0, 0], yaw = Math.atan2(0, 1);
    const wq = (a, b, y0, y1) => put(wallMat, kitQuad([[x, y0, a], [x, y0, b], [x, y1, b], [x, y1, a]], [[a / 1.2, y0 / H], [b / 1.2, y0 / H], [b / 1.2, y1 / H], [a / 1.2, y1 / H]], n));
    if (k === 'w') wq(z0, z1, 0, H);
    if (k === 'd') { wq(z0, -0.6, 0, H); wq(0.6, z1, 0, H); wq(-0.6, 0.6, 2.3, H); }
    if (k === 'o') return;
    // cove light and its shelf under the ceiling, base strip, handrail (broken at a door)
    const xi = x - s * 0.13;
    put(SLOT, BOX(0.03, 0.03, len - 0.1), kitM4(xi, H - 0.28, 0, yaw)); put(MAT.gunDark, RBOX(0.12, 0.08, len, 0.015), kitM4(x - s * 0.06, H - 0.23, 0, yaw));
    put(STRIP, BOX(0.02, 0.02, len - 0.2), kitM4(x - s * 0.02, 0.06, 0, yaw));
    // the section colour band at shoulder height, broken at a door's frame
    (k === 'd' ? [[z0, -0.84], [0.84, z1]] : [[z0, z1]]).forEach(([a, b]) => put(CKIT.band, BOX(0.012, 0.09, b - a), kitM4(x - s * 0.007, 1.62, (a + b) / 2, 0)));
    const rx = x - s * 0.06, runs = k === 'd' ? [[z0 + 0.15, -0.85], [0.85, z1 - 0.15]] : [[z0 + 0.15, z1 - 0.15]];
    runs.forEach(([a, b]) => { if (b - a < 0.25) return; put(MAT.steel, CYL(0.022, 0.022, b - a, 10), kitM4(rx, 0.95, (a + b) / 2, 0, Math.PI / 2));
      [a + 0.06, b - 0.06].forEach((zz) => put(MAT.steel, BOX(0.07, 0.025, 0.025), kitM4(x - s * 0.025, 0.95, zz, 0))); });
    // frame post at the start edge
    put(MAT.gunDark, RBOX(0.1, H - 0.05, 0.16, 0.02), kitM4(x - s * 0.05, (H - 0.05) / 2, zA(x - s * 0.05, -1), 0));
  });
  // frame beam across the start edge (turned to follow a tapered edge), or corner posts for a crossing
  if (L !== 'o' || R !== 'o') { const za = zA(-W, -1), zb = zA(W, -1); put(MAT.gunDark, RBOX(2 * W, 0.12, 0.16, 0.02), kitM4(0, H - 0.06, (za + zb) / 2, -Math.atan2(zb - za, 2 * W))); }
  else [[-W, -1], [W, -1], [-W, 1], [W, 1]].forEach(([x, s]) => put(MAT.gunDark, RBOX(0.2, H, 0.2, 0.03), kitM4(x, H / 2, zA(x, s), 0)));
  return [...by.entries()].map(([mat, list]) => ({ mat, geo: kitGeo(list) }));
}
// Place a deck's corridor: mods = [{ L, R, lin, lout, x, z, ry, sz }] (world x, z of the module's centre, turn about y,
// stretch along its length). One InstancedMesh per variant and material, added to K.root.
function kitCorridorBuild(K, mods, wallMat) {
  const groups = new Map();
  mods.forEach((d) => { const key = [d.L, d.R, d.lin.toFixed(3), d.lout.toFixed(3)].join('|'); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(d); });
  const out = [];
  groups.forEach((list, key) => {
    const [L, R, lin, lout] = key.split('|'), vk = key + '|' + wallMat.uuid;
    if (!CKIT.variants.has(vk)) CKIT.variants.set(vk, kitModule(L, R, +lin, +lout, wallMat));
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    CKIT.variants.get(vk).forEach(({ geo, mat }) => {
      const im = new THREE.InstancedMesh(geo, mat, list.length); im.name = 'corridor ' + key;
      list.forEach((d, i) => { q.setFromAxisAngle(up, d.ry); m4.compose(new THREE.Vector3(d.x, 0, d.z), q, new THREE.Vector3(1, 1, d.sz || 1)); im.setMatrixAt(i, m4);
        if (mat === CKIT.band) im.setColorAt(i, new THREE.Color(d.band || 0xD9B07E).convertSRGBToLinear()); }); // palette hex as painted, like the canvas signs
      im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); K.root.add(im); out.push(im);
    });
  });
  return out;
}

// Signs and plates drawn into one canvas and one mesh (one draw for all of a deck's): cells = [{ w, h (pixels),
// draw(g, x, y, w, h), quads: [{ c: [x, y, z] centre, n: [x, y, z] facing, w, h (metres) }] }], laid out in rows.
function kitAtlas(K, cells, name) {
  const AW = 2048; let x = 0, y = 0, rowH = 0;
  cells.forEach((c) => { if (x + c.w > AW) { x = 0; y += rowH; rowH = 0; } c.px = x; c.py = y; x += c.w; rowH = Math.max(rowH, c.h); });
  const AH = Math.pow(2, Math.ceil(Math.log2(Math.max(64, y + rowH)))), cv = cnv(AW, AH), g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, AW, AH);
  const list = [], up = new THREE.Vector3(0, 1, 0);
  cells.forEach((c) => { g.save(); g.beginPath(); g.rect(c.px, c.py, c.w, c.h); g.clip(); c.draw(g, c.px, c.py, c.w, c.h); g.restore();
    const u0 = c.px / AW, u1 = (c.px + c.w) / AW, v1 = 1 - c.py / AH, v0 = 1 - (c.py + c.h) / AH;
    c.quads.forEach((q) => { const n = new THREE.Vector3(...q.n).normalize(), r = new THREE.Vector3().crossVectors(up, n).multiplyScalar(q.w / 2), h = up.clone().multiplyScalar(q.h / 2), C = new THREE.Vector3(...q.c);
      const P = [C.clone().sub(r).sub(h), C.clone().add(r).sub(h), C.clone().add(r).add(h), C.clone().sub(r).add(h)].map((v) => v.toArray());
      list.push([kitQuad(P, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], n.toArray()), null]); }); });
  const m = mesh(kitGeo(list), new THREE.MeshBasicMaterial({ map: tex(cv), toneMapped: false }), 0, 0, 0, K.root); m.name = name || 'atlas'; return m;
}
// A small prop (parts = [{ geo, mat }] in its own frame, +z facing out of the wall) drawn as instances at
// places = [{ x, z, ry }] on the deck floor.
function kitProps(K, parts, places, name) {
  const q = new THREE.Quaternion(), m4 = new THREE.Matrix4(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
  return parts.map(({ geo, mat }) => { const im = new THREE.InstancedMesh(geo, mat, places.length); im.name = name || 'props';
    places.forEach((p, i) => { q.setFromAxisAngle(up, p.ry); m4.compose(new THREE.Vector3(p.x, p.y || 0, p.z), q, one); im.setMatrixAt(i, m4); });
    im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); K.root.add(im); return im; });
}
