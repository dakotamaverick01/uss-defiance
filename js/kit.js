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
