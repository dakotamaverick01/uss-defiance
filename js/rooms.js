// USS Defiance · rooms.js
// Deck 1 rooms off the bridge: ready room, conference room, head, and the view through their windows.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- Deck 1 rooms: ready room, conference room, head ----------
// =====================================================================
// Each room is built in its own frame: origin at the door on the bridge wall line,
// +x along the wall, +z outward (away from the bridge). Interior starts at z = 0.2.
const ROOMS = [], SHUTTERS = [], ROOM_WALL_MATS = [];
function roomFrame(ei, t) { const e = EDGES[ei]; const [px, pz] = onEdge(ei, t, 0); const g = group(px, 0, pz, e.rot + Math.PI); g.updateMatrixWorld(true); return g; }
function W(g, x, z) { const v = new THREE.Vector3(x, 0, z).applyMatrix4(g.matrixWorld); return [v.x, v.z]; }
function lseg(g, ax, az, bx, bz, r) { const a = W(g, ax, az), b = W(g, bx, bz); addSeg(a[0], a[1], b[0], b[1], r); }
function lrect(g, cx, cz, w, d, r) { const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2; lseg(g, x0, z0, x1, z0, r); lseg(g, x1, z0, x1, z1, r); lseg(g, x1, z1, x0, z1, r); lseg(g, x0, z1, x0, z0, r); }
function lobs(g, x, z, r) { const p = W(g, x, z); extraObs.push({ x: p[0], z: p[1], r }); }
function lao(g, x, z, w, d, op) { const p = W(g, x, z); ao(p[0], p[1], w, d, op); }
function lpool(g, x, z, w, d, color, op) { const p = W(g, x, z); pool(p[0], p[1], w, d, color, op); }

// materials
function roomWallCanvases(H, kind) {
  const Wd = 192, Hp = Math.round(H * 160), Y = (m) => Hp - m * 160;
  const c = cnv(Wd, Hp), g = c.getContext('2d'), e = cnv(Wd, Hp), ge = e.getContext('2d');
  if (kind === 'tile') {
    g.fillStyle = '#c8c5bf'; g.fillRect(0, 0, Wd, Hp);
    const r = mulberry(17);
    for (let y = 0; y < Hp; y += 32) for (let x = 0; x < Wd; x += 32) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${0.02 + r() * 0.03})`; g.fillRect(x, y, 32, 32); }
    g.fillStyle = 'rgba(70,64,58,0.45)'; for (let x = 0; x < Wd; x += 32) g.fillRect(x, 0, 2, Hp); for (let y = 0; y < Hp; y += 32) g.fillRect(0, y, Wd, 2);
    g.fillStyle = '#4a4540'; g.fillRect(0, Y(0.12), Wd, Hp - Y(0.12));
    g.fillStyle = '#3a3530'; g.fillRect(0, 0, Wd, Y(H - 0.18));
  } else if (kind === 'bulk') { // working spaces: grey bulkhead panels, a darker kick band, a stencil stripe
    g.fillStyle = '#8d8f8f'; g.fillRect(0, 0, Wd, Hp);
    const r = mulberry(41);
    for (let i = 0; i < 4000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'; g.fillRect(r() * Wd, r() * Hp, 1.4, 1.4); }
    g.fillStyle = 'rgba(20,22,24,0.55)'; [0, 96].forEach((x) => g.fillRect(x, 0, 2, Hp)); [Y(0.9), Y(1.9)].forEach((y) => g.fillRect(0, y, Wd, 2));
    g.fillStyle = 'rgba(255,255,255,0.18)'; [0, 96].forEach((x) => g.fillRect(x + 2, 0, 1, Hp));
    g.fillStyle = '#5d6062'; g.fillRect(0, Y(0.9), Wd, Y(0.12) - Y(0.9)); g.fillStyle = '#3c3f41'; g.fillRect(0, 0, Wd, Y(H - 0.22));
    g.fillStyle = '#b8873a'; g.fillRect(0, Y(1.35), Wd, 6); g.fillStyle = '#222'; g.fillRect(0, Y(0.12), Wd, Hp - Y(0.12));
  } else if (kind === 'med') { // sickbay: white wall panels, a teal band at hand height, a teal kick band
    g.fillStyle = '#e2e6e5'; g.fillRect(0, 0, Wd, Hp);
    const r = mulberry(53);
    for (let i = 0; i < 3000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'; g.fillRect(r() * Wd, r() * Hp, 1.2, 1.2); }
    g.fillStyle = 'rgba(60,80,82,0.28)'; [0, 96].forEach((x) => g.fillRect(x, 0, 2, Hp)); g.fillRect(0, Y(2.2), Wd, 2);
    g.fillStyle = 'rgba(255,255,255,0.5)'; [0, 96].forEach((x) => g.fillRect(x + 2, 0, 1, Hp));
    g.fillStyle = '#2a9d97'; g.fillRect(0, Y(1.12), Wd, Y(1.02) - Y(1.12)); g.fillRect(0, Y(1.2), Wd, 3);
    g.fillStyle = '#9fb3b1'; g.fillRect(0, 0, Wd, Y(H - 0.22));
    g.fillStyle = '#2f5e5b'; g.fillRect(0, Y(0.12), Wd, Hp - Y(0.12));
  } else {
    g.fillStyle = '#58514a'; g.fillRect(0, 0, Wd, Y(H - 0.26));
    const gr = g.createLinearGradient(0, Y(H - 0.26), 0, Y(1.02)); gr.addColorStop(0, '#c2b39c'); gr.addColorStop(1, '#b3a48d');
    g.fillStyle = gr; g.fillRect(0, Y(H - 0.26), Wd, Y(1.02) - Y(H - 0.26));
    const r = mulberry(29);
    for (let i = 0; i < 5000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,240,220,0.035)' : 'rgba(0,0,0,0.05)'; g.fillRect(r() * Wd, Y(H - 0.26) + r() * (Y(1.02) - Y(H - 0.26)), 1.2, 1.2); }
    [0, 96].forEach((x) => { g.fillStyle = 'rgba(30,22,16,0.55)'; g.fillRect(x, Y(H - 0.26), 3, Y(1.02) - Y(H - 0.26)); g.fillStyle = 'rgba(255,240,220,0.12)'; g.fillRect(x + 3, Y(H - 0.26), 1, Y(1.02) - Y(H - 0.26)); });
    g.fillStyle = '#5b3b26'; g.fillRect(0, Y(1.02), Wd, Y(0.95) - Y(1.02)); g.fillStyle = 'rgba(255,220,180,0.35)'; g.fillRect(0, Y(1.02), Wd, 2);
    g.fillStyle = '#5c524a'; g.fillRect(0, Y(0.95), Wd, Y(0.12) - Y(0.95));
    g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 2; g.strokeRect(10, Y(0.88), Wd - 20, Y(0.2) - Y(0.88));
    g.fillStyle = '#211e1b'; g.fillRect(0, Y(0.12), Wd, Hp - Y(0.12));
  }
  ge.fillStyle = '#000'; ge.fillRect(0, 0, Wd, Hp);
  ge.fillStyle = '#fff'; ge.fillRect(0, Y(H - (kind === 'tile' ? 0.18 : kind === 'bulk' || kind === 'med' ? 0.22 : 0.26)) - 2, Wd, 3);
  return [c, e];
}
function roomWallMat(H, kind) {
  const [c, e] = roomWallCanvases(H, kind); const map = tex(c), em = tex(e); map.wrapS = em.wrapS = THREE.RepeatWrapping;
  const nm = normalTex(c, kind === 'tile' ? 4 : kind === 'bulk' ? 3 : 2.5); nm.wrapS = THREE.RepeatWrapping;
  const m = new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: new THREE.Color(ALERTS.green.slot), emissiveIntensity: 0.65, normalMap: nm, roughness: 0.9, metalness: 0.02, envMapIntensity: 0.3 });
  ROOM_WALL_MATS.push(m); return m;
}
// dark hardwood (ambientCG Wood018, recoloured), world-mapped so the grain runs evenly over every piece of furniture
const WOOD = triSurface(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0.05, envMapIntensity: 0.55 }),
  { set: 'wood', metres: 1.1, ns: 0.8, color: true, absRough: true, low: 0, albedo: [0.07, 0.028, 0.014] });
const CERAMIC = new THREE.MeshStandardMaterial({ color: 0xeeeae4, roughness: 0.22, metalness: 0.02, envMapIntensity: 0.8 });
const GLASS = new THREE.MeshStandardMaterial({ color: 0xbcd2dc, transparent: true, opacity: 0.16, roughness: 0.04, metalness: 0.85, envMapIntensity: 1.3, depthWrite: false });
const PANE = new THREE.MeshStandardMaterial({ color: 0x8fa8b8, transparent: true, opacity: 0.05, roughness: 0.02, metalness: 0.6, envMapIntensity: 0.35, depthWrite: false });
const POT = new THREE.MeshStandardMaterial({ color: 0x24211f, roughness: 0.45, metalness: 0.3, envMapIntensity: 0.25 });
const LEAF = new THREE.MeshStandardMaterial({ color: 0x3f6b3a, roughness: 0.7, side: THREE.DoubleSide });
const FABRIC = new THREE.MeshStandardMaterial({ color: 0x3e5658, roughness: 0.95 });
const BRASS = new THREE.MeshStandardMaterial({ color: 0xb08850, metalness: 0.85, roughness: 0.3, envMapIntensity: 1.1 });
const roomWarm = roomWallMat(ROOM_H, 'fabric'), roomTile = roomWallMat(2.6, 'tile');

// wall with an optional rectangular opening, in a room frame
function wallH(g, mat, A, dir, nrm, len, H, hole) {
  if (!hole) { wallPiece(mat, A, dir, nrm, 0, len, 0, H, H, 1.2, g); return; }
  const { s0, s1, y0, y1 } = hole;
  if (s0 > 0.001) wallPiece(mat, A, dir, nrm, 0, s0, 0, H, H, 1.2, g);
  if (s1 < len - 0.001) wallPiece(mat, A, dir, nrm, s1, len, 0, H, H, 1.2, g);
  if (y0 > 0.001) wallPiece(mat, A, dir, nrm, s0, s1, 0, y0, H, 1.2, g);
  if (y1 < H - 0.001) wallPiece(mat, A, dir, nrm, s0, s1, y1, H, H, 1.2, g);
}
function roomShell(g, o) {
  const { xa, xb, d, H, mat, floor } = o, z0 = 0.2;
  const fw = xb - xa, fl = new THREE.PlaneGeometry(fw, d); { const uv = fl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * fw, uv.getY(i) * d); }
  const f = mesh(fl, floor, (xa + xb) / 2, 0.001, d / 2, g); f.rotation.x = -Math.PI / 2;
  const cl = new THREE.PlaneGeometry(fw, d - z0); { const uv = cl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * fw, uv.getY(i) * (d - z0)); }
  const c = mesh(cl, MAT.ceiling, (xa + xb) / 2, H, (d + z0) / 2, g); c.rotation.x = Math.PI / 2;
  // door wall (opening 1.2 x 2.3 at x = 0), back wall, sides
  wallH(g, mat, [xa, z0], [1, 0], [0, 1], fw, H, { s0: -0.6 - xa, s1: 0.6 - xa, y0: 0, y1: 2.3 });
  const bh = o.window ? { s0: xb - o.window.x1, s1: xb - o.window.x0, y0: o.window.y0, y1: o.window.y1 } : null;
  wallH(g, mat, [xb, d], [-1, 0], [0, -1], fw, H, bh);
  wallH(g, mat, [xa, d], [0, -1], [1, 0], d - z0, H);
  wallH(g, mat, [xb, z0], [0, 1], [-1, 0], d - z0, H);
  // cove light + crown shadow line on every wall
  [[(xa + xb) / 2, z0 + 0.07, fw - 0.2, 0], [(xa + xb) / 2, d - 0.07, fw - 0.2, 0], [xa + 0.07, (d + z0) / 2, d - z0 - 0.2, Math.PI / 2], [xb - 0.07, (d + z0) / 2, d - z0 - 0.2, Math.PI / 2]].forEach(([x, z, L, ry]) => {
    const cv = mesh(BOX(L, 0.03, 0.03), SLOT, x, H - 0.3, z, g); cv.rotation.y = ry;
    const sh = mesh(RBOX(L + 0.1, 0.08, 0.12, 0.015), MAT.gunDark, x, H - 0.25, z, g); sh.rotation.y = ry;
  });
  // room-side door frame and label
  [-1, 1].forEach((sd) => mesh(RBOX(0.16, 2.45, 0.1, 0.02), MAT.gun, sd * 0.68, 1.225, z0 + 0.05, g));
  mesh(RBOX(1.52, 0.16, 0.1, 0.02), MAT.gun, 0, 2.38, z0 + 0.05, g);
  const lp = cnv(256, 48); { const c2 = lp.getContext('2d'); c2.fillStyle = '#000'; c2.fillRect(0, 0, 256, 48); hexNode(c2, 24, 24, 14); c2.fillStyle = '#E8A06A'; c2.fill(); c2.fillStyle = '#F5E6CF'; c2.font = `700 22px ${DISP}`; c2.textBaseline = 'middle'; c2.fillText('BRIDGE', 48, 26); }
  mesh(new THREE.PlaneGeometry(0.62, 0.116), new THREE.MeshBasicMaterial({ map: tex(lp), toneMapped: false }), 0, 2.38, z0 + 0.102, g);
  // collision: walls with the door gap
  lseg(g, xa, z0, -0.6, z0, 0.33); lseg(g, 0.6, z0, xb, z0, 0.33);
  lseg(g, xa, d, xb, d, 0.33); lseg(g, xa, z0, xa, d, 0.33); lseg(g, xb, z0, xb, d, 0.33);
  // light
  // the room's ceiling fixtures light it through the bake; this position is only used by the fallback light rig
  const lightPos = new THREE.Vector3(o.light[0], o.light[1], o.light[2]).applyMatrix4(g.matrixWorld);
  const room = { g, xa, xb, d, label: o.label, lightPos, base: o.lightI || 0.9, k: 0, door: W(g, 0, 0) };
  ROOMS.push(room); return room;
}
// armored viewport with blast shutters, set in a room's back wall
function viewport(g, x0, x1, y0, y1, z) {
  const w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  mesh(RBOX(w + 0.36, 0.18, 0.4, 0.03), MAT.gun, cx, y1 + 0.09, z - 0.04, g);
  mesh(RBOX(w + 0.36, 0.16, 0.46, 0.03), MAT.gun, cx, y0 - 0.08, z - 0.06, g);
  mesh(RBOX(w + 0.1, 0.03, 0.2, 0.01), MAT.steel, cx, y0 + 0.005, z - 0.2, g);
  [-1, 1].forEach((sd) => {
    mesh(RBOX(0.18, h + 0.36, 0.4, 0.03), MAT.gun, cx + sd * (w / 2 + 0.09), cy, z - 0.04, g);
    for (let k = 0; k < Math.max(3, Math.round(h / 0.3)); k++) mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8), MAT.steel, cx + sd * (w / 2 + 0.09), y0 + 0.1 + k * (h - 0.2) / Math.max(2, Math.round(h / 0.3) - 1), z - 0.245, g).rotation.x = Math.PI / 2;
  });
  for (let k = 1; k < Math.round(w / 1.2); k++) mesh(RBOX(0.07, h, 0.08, 0.015), MAT.gun, x0 + k * w / Math.round(w / 1.2), cy, z, g);
  const gl = mesh(new THREE.PlaneGeometry(w, h), PANE, cx, cy, z + 0.02, g); gl.rotation.y = Math.PI;
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), SHEEN_MAT); sh.position.set(cx, cy, z + 0.015); sh.rotation.y = Math.PI; g.add(sh);
  const n = Math.max(6, Math.round(h / 0.15)), slats = [];
  for (let i = 0; i < n; i++) { const s = mesh(BOX(w, 0.022, 0.17), MAT.gun, cx, y0 + (i + 0.5) * h / n, z + 0.14, g); slats.push(s); }
  SHUTTERS.push({ slats, cur: 0 });
  addHit(BOX(w, h, 0.4), { station: 'shutters' }, g, cx, cy, z - 0.2);
}
// box = [x0, x1, z0, z1]: optional wall faces around the plant (parent coordinates). Leaves that would reach through
// a wall are stood more upright so the whole plant stays in its room.
function plantAt(parent, x, z, scale, box) {
  const g = group(x, 0, z, 0, parent); g.scale.setScalar(scale || 1);
  const room = (a) => { // how far the room lets a leaf reach from the pot in direction a (world-scaled metres)
    if (!box) return Infinity; const dx = Math.sin(a), dz = Math.cos(a); let t = Infinity;
    if (dx > 1e-4) t = Math.min(t, (box[1] - x) / dx); if (dx < -1e-4) t = Math.min(t, (box[0] - x) / dx);
    if (dz > 1e-4) t = Math.min(t, (box[3] - z) / dz); if (dz < -1e-4) t = Math.min(t, (box[2] - z) / dz);
    return t - 0.07;
  };
  mesh(CYL(0.2, 0.15, 0.5, 24), POT, 0, 0.25, 0, g);
  mesh(new THREE.TorusGeometry(0.2, 0.015, 6, 24), BRASS, 0, 0.5, 0, g).rotation.x = Math.PI / 2;
  const rr = mulberry(Math.round(x * 100 + z * 37) + 99);
  for (let i = 0; i < 13; i++) {
    const a = i / 13 * Math.PI * 2 + rr() * 0.4, len = 0.4 + rr() * 0.35; let tilt = 0.3 + rr() * 0.6;
    // a leaf reaches about 1.9 x len x sin(tilt) out from the pot; keep that inside the walls
    const k = room(a) / (1.9 * len * (scale || 1)); if (k < Math.sin(tilt)) tilt = Math.asin(Math.max(0.05, Math.min(1, k)));
    const piv = group(0, 0.5, 0, a, g);
    const l = mesh(new THREE.SphereGeometry(1, 10, 6), LEAF, 0, 0, 0, piv); l.scale.set(0.065, len, 0.022);
    l.position.set(0, Math.cos(tilt) * len * 0.9, Math.sin(tilt) * len * 0.9); l.rotation.x = tilt;
  }
  return g;
}
function lathe(pts, segs) { return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), segs || 32); }
function plaqueTex(lines, w, h) {
  const c = cnv(w, h), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8a6a44'); gr.addColorStop(1, '#5a4229'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,230,190,0.6)'; g.lineWidth = 4; g.strokeRect(12, 12, w - 24, h - 24);
  lines(g); return tex(c);
}

// ---------- the exterior, seen only through viewports ----------
{
  const n = 1800, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), r = mulberry(404);
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); pos.set([Math.cos(th) * s * 260, u * 260, Math.sin(th) * s * 260], i * 3); const b = 0.5 + r() * 0.5, t = r(); col.set([b * (t < 0.3 ? 0.82 : 1), b * 0.93, b * (t > 0.75 ? 0.82 : 1)], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  // the view outside is shared by every deck's windows, so it stays in the scene when decks are swapped (lift.js)
  add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, vertexColors: true, depthWrite: false, toneMapped: false, fog: false }))).userData.keep = true;
  const nb = new THREE.Sprite(new THREE.SpriteMaterial({ map: nebula.material.map, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
  nb.position.set(150, 30, 330); nb.scale.set(560, 330, 1); nb.userData.keep = true; scene.add(nb);
}
const EXT_N = 600, extPos = new Float32Array(EXT_N * 6), extCol = new Float32Array(EXT_N * 6), extXYZ = new Float32Array(EXT_N * 3);
function seedExt(i, z) { let x, y; do { x = (Math.random() - 0.5) * 150; y = (Math.random() - 0.5) * 80; } while (Math.abs(x) < 18 && Math.abs(y) < 12); extXYZ[i * 3] = x; extXYZ[i * 3 + 1] = y; extXYZ[i * 3 + 2] = z; }
for (let i = 0; i < EXT_N; i++) { seedExt(i, -90 + Math.random() * 180); const b = 0.6 + Math.random() * 0.4; extCol.set([b, b, b, 0.1, 0.25 * b, 0.45 * b], i * 6); }
const extGeo = new THREE.BufferGeometry(); extGeo.setAttribute('position', new THREE.BufferAttribute(extPos, 3)); extGeo.setAttribute('color', new THREE.BufferAttribute(extCol, 3));
const extMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false });
const extStreaks = add(new THREE.LineSegments(extGeo, extMat)); extStreaks.frustumCulled = false; extStreaks.visible = false; extStreaks.userData.keep = true;

// ---------- READY ROOM (off the aft-starboard wall) ----------
// About 6 x 6.5 m inside. The room runs forward from its door along the outside of the starboard bridge wall,
// which keeps it clear of the conference room aft.
let cupLiquid, cupGroup;
{
  const g = roomFrame(3, DOOR_GAPS[3]);
  const XA = -0.85, XB = 5.15, D = 6.7, H = ROOM_H, MX = (XA + XB) / 2, MZ = (0.2 + D) / 2;
  const PBOX = [XA + 0.04, XB - 0.04, 0.24, D - 0.04]; // wall faces (roomShell), for plants' leaves
  roomShell(g, { xa: XA, xb: XB, d: D, H, mat: roomWarm, floor: MAT.roomCarpet, window: { x0: 0.15, x1: 4.15, y0: 0.95, y1: 2.35 }, light: [MX, H - 0.35, MZ], lightI: 1.0, label: 'Ready Room' });
  viewport(g, 0.15, 4.15, 0.95, 2.35, D);
  // rug under the sitting area and the front of the desk
  { const c = cnv(512, 416), x = c.getContext('2d'); x.fillStyle = '#26303b'; x.fillRect(0, 0, 512, 416); noise(x, 512, 416, 9000, 0.05, 72);
    x.strokeStyle = 'rgba(201,182,140,0.75)'; x.lineWidth = 6; x.strokeRect(18, 18, 476, 380); x.lineWidth = 2; x.strokeRect(34, 34, 444, 348);
    x.strokeStyle = 'rgba(201,182,140,0.16)'; x.lineWidth = 1.5; for (let yy = 60; yy < 370; yy += 36) for (let xx = 60 + ((yy / 36) % 2) * 18; xx < 460; xx += 36) { hexNode(x, xx, yy, 12); x.stroke(); }
    const rug = mesh(new THREE.PlaneGeometry(3.6, 2.92), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.97, polygonOffset: true, polygonOffsetFactor: -1 }), 1.3, 0.004, 3.75, g); rug.rotation.x = -Math.PI / 2; }
  // desk: walnut top on two steel-trimmed pedestals, facing the door, the captain's back to the viewport
  const DK = { x: 2.8, z: 4.6 };
  const desk = group(DK.x, 0, DK.z, 0, g);
  mesh(RBOX(1.6, 0.06, 0.8, 0.025), WOOD, 0, 0.76, 0, desk);
  mesh(RBOX(1.62, 0.015, 0.82, 0.006), MAT.steel, 0, 0.725, 0, desk);
  [-1, 1].forEach((sd) => { mesh(RBOX(0.42, 0.72, 0.7, 0.03), MAT.gun, sd * 0.56, 0.36, 0.02, desk); mesh(BOX(0.36, 0.012, 0.012), SLOT, sd * 0.56, 0.55, -0.335, desk); mesh(BOX(0.3, 0.012, 0.012), SLOT, sd * 0.56, 0.3, -0.335, desk); });
  mesh(RBOX(0.72, 0.5, 0.04, 0.01), MAT.gunDark, 0, 0.45, -0.3, desk);
  { const s = group(0, 0.79, -0.18, 0, desk); s.rotation.x = -0.45; mesh(RBOX(0.74, 0.44, 0.04, 0.012), MAT.gunDark, 0, 0.2, -0.025, s); addScreen(group(0, 0.2, 0, 0, s), 0.68, 0.38, 640, 358, 'log', 'desk', 'Personal Log', 'CO·01'); }
  [[0.45, 0.25, 0.3], [0.5, 0.18, -0.2]].forEach(([x, z, ry]) => { const p = mesh(RBOX(0.16, 0.012, 0.24, 0.004), MAT.gunDark, x, 0.796, z, desk); p.rotation.y = ry; const sc = mesh(new THREE.PlaneGeometry(0.13, 0.2), new THREE.MeshBasicMaterial({ color: 0x1b2a44, toneMapped: false }), x, 0.803, z, desk); sc.rotation.set(-Math.PI / 2, 0, ry); });
  mesh(lathe([[0, 0], [0.05, 0], [0.05, 0.012], [0.012, 0.03], [0.008, 0.33], [0, 0.33]]), MAT.steel, -0.62, 0.79, 0.2, desk);
  { const sh = mesh(lathe([[0.012, 0], [0.07, -0.06], [0.072, -0.065], [0.014, -0.004]], 24), MAT.gun, -0.62, 1.15, 0.2, desk); sh.rotation.x = 0.3; mesh(new THREE.CircleGeometry(0.06, 20), downlightMat, -0.62, 1.098, 0.215, desk).rotation.x = Math.PI / 2 + 0.3; }
  addHit(BOX(1.7, 1.2, 0.9), { station: 'desk' }, desk, 0, 0.6, 0);
  lpool(g, DK.x - 0.6, DK.z + 0.15, 1.2, 1.2, 0xffd2a0, 0.12);
  lrect(g, DK.x, DK.z, 1.6, 0.8, PR); lao(g, DK.x, DK.z, 2.0, 1.2, 0.55);
  // chairs: captain behind the desk, two guests in front
  { const c = group(DK.x, 0, DK.z + 0.7, 0, g); makeChair(c, 'captain'); lobs(g, DK.x, DK.z + 0.7, 0.32); lao(g, DK.x, DK.z + 0.7, 0.9, 0.9, 0.55); }
  [DK.x - 0.45, DK.x + 0.45].forEach((x) => { const c = group(x, 0, DK.z - 0.9, Math.PI, g); makeChair(c, 'station'); lobs(g, x, DK.z - 0.9, 0.3); lao(g, x, DK.z - 0.9, 0.8, 0.8, 0.5); });
  // settee against the aft side wall, with a low table
  const ST = { x: XA + 0.4, z: 3.75 };
  { const s = group(ST.x, 0, ST.z, 0, g);
    mesh(RBOX(0.72, 0.36, 1.96, 0.04), MAT.leatherDark, 0, 0.2, 0, s);
    [-0.45, 0.45].forEach((z) => mesh(RBOX(0.62, 0.14, 0.9, 0.06), MAT.leather, 0.05, 0.44, z, s));
    mesh(RBOX(0.2, 0.5, 1.96, 0.06), MAT.leather, -0.28, 0.6, 0, s);
    [-1, 1].forEach((sd) => mesh(RBOX(0.72, 0.52, 0.16, 0.05), MAT.leatherDark, 0, 0.3, sd * 1.02, s));
    const pil = mesh(RBOX(0.12, 0.34, 0.36, 0.06), FABRIC, -0.12, 0.66, -0.62, s); pil.rotation.z = -0.25; pil.rotation.y = 0.2;
    lrect(g, ST.x, ST.z, 0.74, 2.2, PR); lao(g, ST.x, ST.z, 1.2, 2.6, 0.6); }
  { const t = group(ST.x + 0.9, 0, ST.z, 0, g); mesh(RBOX(0.58, 0.035, 1.0, 0.012), MAT.glassTop, 0, 0.42, 0, t); mesh(RBOX(0.46, 0.38, 0.86, 0.03), MAT.gun, 0, 0.2, 0, t);
    const cr = mesh(new THREE.OctahedronGeometry(0.07, 0), new THREE.MeshStandardMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.3, emissive: 0x1a3a5a }), 0, 0.51, 0.22, t); cr.scale.set(1, 1.6, 1);
    mesh(RBOX(0.2, 0.03, 0.28, 0.006), new THREE.MeshStandardMaterial({ color: 0x6b2a22, roughness: 0.7 }), 0.02, 0.453, -0.2, t);
    lrect(g, ST.x + 0.9, ST.z, 0.58, 1.0, PR); }
  // shelves above the settee: books and keepsakes
  { const s = group(XA + 0.14, 0, ST.z, 0, g); const BOOK = ['#4a1c17', '#1a2638', '#2b3520', '#5a4b33', '#221f1c', '#3b2640', '#5e3d1d'].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 }));
    [1.6, 2.08].forEach((y, k) => {
      mesh(RBOX(0.26, 0.035, 1.7, 0.01), WOOD, 0, y, 0, s);
      const r = mulberry(300 + k); let z = -0.78;
      while (z < (k ? 0.2 : 0.05)) { const th = 0.025 + r() * 0.03, hh = 0.2 + r() * 0.08; const b = mesh(BOX(0.18, hh, th), BOOK[(r() * BOOK.length) | 0], 0, y + 0.0175 + hh / 2, z + th / 2, s); if (r() < 0.12) { b.rotation.x = 0.2; } z += th + 0.004; }
    });
    mesh(CYL(0.035, 0.05, 0.12, 16), BRASS, 0.0, 1.677, 0.45, s); mesh(new THREE.SphereGeometry(0.045, 16, 12), BRASS, 0.0, 1.77, 0.45, s);
    mesh(RBOX(0.03, 0.2, 0.26, 0.006), MAT.gunDark, 0.02, 2.2, 0.5, s);
    const ph = cnv(128, 100); { const x = ph.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 100); gr.addColorStop(0, '#5a7aa0'); gr.addColorStop(0.55, '#c9b28a'); gr.addColorStop(1, '#4a5a3a'); x.fillStyle = gr; x.fillRect(0, 0, 128, 100); x.fillStyle = 'rgba(40,40,50,0.6)'; x.beginPath(); x.moveTo(0, 62); x.lineTo(30, 44); x.lineTo(58, 56); x.lineTo(92, 36); x.lineTo(128, 52); x.lineTo(128, 100); x.lineTo(0, 100); x.fill(); }
    const pic = mesh(new THREE.PlaneGeometry(0.22, 0.17), new THREE.MeshStandardMaterial({ map: tex(ph), roughness: 0.5 }), 0.037, 2.2, 0.5, s); pic.rotation.y = Math.PI / 2; }
  // forward wall: ship status display over a credenza with the ship's model
  const CZ = 3.95;
  { const dsp = group(XB - 0.03, 1.9, CZ, -Math.PI / 2, g); display(dsp, 1.5, 0.92, 520, 320, 'status', 'ship', 'Ship Status', 'SYS·00'); }
  { const cz = group(XB - 0.22, 0, CZ, -Math.PI / 2, g);
    mesh(RBOX(2.0, 0.66, 0.42, 0.03), MAT.gun, 0, 0.35, 0, cz); mesh(RBOX(2.04, 0.04, 0.46, 0.012), WOOD, 0, 0.7, 0, cz);
    [-0.5, 0.5].forEach((x) => mesh(BOX(0.9, 0.01, 0.01), SLOT, x, 0.12, 0.215, cz));
    // display case with the Defiance model
    const cs = group(-0.45, 0.72, 0, 0, cz);
    mesh(RBOX(0.78, 0.05, 0.36, 0.012), MAT.gunDark, 0, 0.025, 0, cs); mesh(BOX(0.72, 0.008, 0.008), SLOT, 0, 0.03, 0.182, cs);
    mesh(new THREE.BoxGeometry(0.74, 0.34, 0.32), GLASS, 0, 0.22, 0, cs);
    mesh(CYL(0.008, 0.008, 0.1, 8), MAT.steel, 0, 0.1, 0, cs);
    const m = group(0, 0.19, 0, Math.PI / 2, cs); m.scale.setScalar(0.24);
    const HULL = new THREE.MeshStandardMaterial({ color: 0xa9aeb5, metalness: 0.55, roughness: 0.42, envMapIntensity: 0.9 });
    const hs = new THREE.Shape(); [[0, 1], [0.34, 0.5], [0.4, -0.2], [0.62, -0.45], [0.62, -0.95], [0.18, -0.8], [0, -0.92], [-0.18, -0.8], [-0.62, -0.95], [-0.62, -0.45], [-0.4, -0.2], [-0.34, 0.5]].forEach(([x, y], i) => (i ? hs.lineTo(x, y) : hs.moveTo(x, y))); hs.closePath();
    const hg = new THREE.ExtrudeGeometry(hs, { depth: 0.1, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 }); hg.rotateX(-Math.PI / 2); hg.translate(0, -0.05, 0);
    mesh(hg, HULL, 0, 0, 0, m);
    mesh(RBOX(0.16, 0.08, 0.22, 0.03), HULL, 0, 0.09, -0.1, m);
    mesh(RBOX(0.3, 0.05, 0.5, 0.03), HULL, 0, 0.06, 0.35, m);
    const blue = new THREE.MeshBasicMaterial({ color: 0x6aa8ff, toneMapped: false });
    [-1, 1].forEach((sd) => { const n = mesh(CYL(0.07, 0.06, 0.72, 14), HULL, sd * 0.55, -0.1, 0.55, m); n.rotation.x = Math.PI / 2; mesh(BOX(0.02, 0.02, 0.5), blue, sd * 0.55 + sd * 0.07, -0.1, 0.55, m); mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff5040, toneMapped: false }), sd * 0.08, 0.0, -1.0, m); });
    addHit(BOX(0.8, 0.5, 0.4), { station: 'ship' }, cs, 0, 0.2, 0);
    lrect(g, XB - 0.22, CZ, 0.44, 2.04, PR); lao(g, XB - 0.25, CZ, 0.9, 2.4, 0.55); }
  // synthesizer niche beside the door, with a small round table and two chairs for a meal
  { const sn = group(2.1, 0, 0.2, 0, g);
    [-1, 1].forEach((sd) => mesh(RBOX(0.08, 0.82, 0.16, 0.02), MAT.gun, sd * 0.29, 1.25, 0.08, sn));
    mesh(RBOX(0.66, 0.08, 0.16, 0.02), MAT.gun, 0, 1.62, 0.08, sn); mesh(RBOX(0.66, 0.08, 0.16, 0.02), MAT.gun, 0, 0.88, 0.08, sn);
    mesh(new THREE.PlaneGeometry(0.5, 0.66), new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.4, metalness: 0.5 }), 0, 1.25, 0.012, sn);
    mesh(new THREE.PlaneGeometry(0.46, 0.035), new THREE.MeshBasicMaterial({ color: 0xffd9a8, toneMapped: false }), 0, 1.55, 0.016, sn);
    mesh(RBOX(0.5, 0.025, 0.16, 0.008), MAT.steel, 0, 0.965, 0.1, sn);
    const lb = cnv(256, 40); { const x = lb.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 256, 40); hexNode(x, 20, 20, 11); x.fillStyle = '#E8A06A'; x.fill(); x.fillStyle = '#F5E6CF'; x.font = `700 18px ${DISP}`; x.textBaseline = 'middle'; x.fillText('SYNTHESIZER', 40, 21); }
    mesh(new THREE.PlaneGeometry(0.44, 0.07), new THREE.MeshBasicMaterial({ map: tex(lb), toneMapped: false }), 0, 1.74, 0.012, sn);
    cupGroup = group(0, 0.978, 0.1, 0, sn); cupGroup.visible = false;
    mesh(lathe([[0, 0], [0.034, 0], [0.04, 0.006], [0.043, 0.095], [0.039, 0.095], [0.035, 0.008], [0, 0.008]], 24), CERAMIC, 0, 0, 0, cupGroup);
    mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 16, Math.PI), CERAMIC, 0.044, 0.05, 0, cupGroup).rotation.z = -Math.PI / 2;
    cupLiquid = new THREE.MeshStandardMaterial({ color: 0x3a2214, roughness: 0.15 });
    mesh(new THREE.CircleGeometry(0.037, 20), cupLiquid, 0, 0.08, 0, cupGroup).rotation.x = -Math.PI / 2;
    addHit(BOX(0.7, 0.9, 0.4), { station: 'synth' }, sn, 0, 1.25, 0.2); }
  { const RT = { x: 3.95, z: 1.75 }, t = group(RT.x, 0, RT.z, 0, g);
    mesh(CYL(0.46, 0.46, 0.04, 40), WOOD, 0, 0.74, 0, t); mesh(new THREE.TorusGeometry(0.46, 0.008, 6, 48), MAT.steel, 0, 0.72, 0, t).rotation.x = Math.PI / 2;
    mesh(CYL(0.05, 0.06, 0.7, 16), MAT.gun, 0, 0.37, 0, t); mesh(CYL(0.3, 0.32, 0.03, 32), MAT.gun, 0, 0.015, 0, t);
    lobs(g, RT.x, RT.z, 0.48); lao(g, RT.x, RT.z, 1.2, 1.2, 0.55);
    [[-1, -Math.PI / 2], [1, Math.PI / 2]].forEach(([sd, ry]) => { const x = RT.x + sd * 0.72; const c = group(x, 0, RT.z, ry, g); makeChair(c, 'station'); lobs(g, x, RT.z, 0.3); lao(g, x, RT.z, 0.8, 0.8, 0.5); }); }
  plantAt(g, XA + 0.38, 0.68, 1.0, PBOX); lobs(g, XA + 0.38, 0.68, 0.28);
  plantAt(g, XA + 0.4, D - 0.4, 0.9, PBOX); lobs(g, XA + 0.4, D - 0.4, 0.26);
  plantAt(g, XB - 0.4, D - 0.4, 0.85, PBOX); lobs(g, XB - 0.4, D - 0.4, 0.26);
  // ceiling: a central light disc, downlights over the desk, the settee and the meal table
  { const dc = mesh(new THREE.CircleGeometry(0.7, 40), lightDiscMat, MX, H - 0.005, MZ, g); dc.rotation.x = Math.PI / 2; const rim = mesh(new THREE.TorusGeometry(0.71, 0.025, 8, 48), MAT.steel, MX, H - 0.01, MZ, g); rim.rotation.x = Math.PI / 2; }
  [[DK.x, DK.z + 0.25], [ST.x + 0.2, ST.z], [3.95, 1.75], [0.9, 6.0], [XB - 0.8, CZ], [0.3, 1.3], [ST.x + 0.2, 5.6], [4.2, 6.0]].forEach(([x, z]) => { mesh(new THREE.CircleGeometry(0.09, 20), downlightMat, x, H - 0.003, z, g).rotation.x = Math.PI / 2; lpool(g, x, z, 1.4, 1.4, 0xffd2a0, 0.1); });
}

// ---------- CONFERENCE ROOM (straight aft of the bridge, door on the starboard side of the aft wall) ----------
// About 8 x 6.5 m inside, with room to walk all the way around the table.
{
  const g = roomFrame(4, DOOR_GAPS[4]);
  const XA = -4.0, XB = 4.0, D = 6.7, H = ROOM_H;
  const PBOX = [XA + 0.04, XB - 0.04, 0.24, D - 0.04]; // wall faces (roomShell), for plants' leaves
  roomShell(g, { xa: XA, xb: XB, d: D, H, mat: roomWarm, floor: MAT.roomCarpet, window: { x0: -3.0, x1: 3.0, y0: 1.0, y1: 2.3 }, light: [0, H - 0.35, 3.5], lightI: 1.1, label: 'Conference Room' });
  viewport(g, -3.0, 3.0, 1.0, 2.3, D);
  // table: dark glass top with an underglow and the crest inlaid
  const T = { x: 0, z: 3.5, L: 4.4, W: 1.4 };
  const ts = new THREE.Shape(); { const hw = T.L / 2, hd = T.W / 2, r = 0.6; ts.moveTo(-hw + r, -hd); ts.lineTo(hw - r, -hd); ts.quadraticCurveTo(hw, -hd, hw, -hd + r); ts.lineTo(hw, hd - r); ts.quadraticCurveTo(hw, hd, hw - r, hd); ts.lineTo(-hw + r, hd); ts.quadraticCurveTo(-hw, hd, -hw, hd - r); ts.lineTo(-hw, -hd + r); ts.quadraticCurveTo(-hw, -hd, -hw + r, -hd); }
  const topG = new THREE.ExtrudeGeometry(ts, { depth: 0.03, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2, curveSegments: 16 }); topG.rotateX(-Math.PI / 2);
  mesh(topG, MAT.glassTop, T.x, 0.72, T.z, g);
  const glowS = new THREE.Shape(ts.getPoints(16).map((p) => new THREE.Vector2(p.x * 1.01, p.y * 1.03)));
  const glowG = new THREE.ExtrudeGeometry(glowS, { depth: 0.012, bevelEnabled: false }); glowG.rotateX(-Math.PI / 2);
  mesh(glowG, SLOT, T.x, 0.69, T.z, g);
  const rimG = new THREE.ExtrudeGeometry(new THREE.Shape(ts.getPoints(16).map((p) => new THREE.Vector2(p.x * 0.96, p.y * 0.9))), { depth: 0.1, bevelEnabled: false }); rimG.rotateX(-Math.PI / 2);
  mesh(rimG, MAT.gun, T.x, 0.6, T.z, g);
  [-1, 1].forEach((sd) => { mesh(RBOX(0.5, 0.6, 0.7, 0.05), MAT.gun, T.x + sd * 1.25, 0.3, T.z, g); mesh(BOX(0.4, 0.012, 0.012), SLOT, T.x + sd * 1.25, 0.08, T.z - 0.355, g); mesh(BOX(0.4, 0.012, 0.012), SLOT, T.x + sd * 1.25, 0.08, T.z + 0.355, g); });
  { const c = cnv(256, 256), x = c.getContext('2d'); drawCrest(x, 128, 128, 90, 'rgba(201,214,234,0.75)', 5); const cr = mesh(new THREE.PlaneGeometry(0.56, 0.56), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, toneMapped: false, depthWrite: false }), T.x, 0.772, T.z, g); cr.rotation.x = -Math.PI / 2; }
  lrect(g, T.x, T.z, T.L, T.W, PR); lao(g, T.x, T.z, T.L + 1.4, T.W + 1.4, 0.6);
  // seven seats: three a side, the captain's at the head facing the briefing display
  const seats = [];
  [-1.5, 0, 1.5].forEach((x) => { seats.push([x, T.z - 1.05, Math.PI]); seats.push([x, T.z + 1.05, 0]); });
  seats.push([T.x + T.L / 2 + 0.6, T.z, Math.PI / 2]);
  seats.forEach(([x, z, ry], i) => {
    const c = group(x, 0, z, ry, g); makeChair(c, i === 6 ? 'captain' : 'xo'); lobs(g, x, z, 0.3); lao(g, x, z, 0.8, 0.8, 0.5);
    const fx = x + (T.x - x) * (i === 6 ? 0.36 : 0), fz = i === 6 ? z : z + (T.z - z) * 0.55;
    const sp = group(fx, 0.774, fz, ry, g); const sc = group(0, 0, 0, 0, sp); sc.rotation.x = -Math.PI / 2; addScreen(sc, 0.34, 0.18, 200, 106, 'keys', 'brief', '', '');
  });
  // briefing display on the port end wall
  { const d = group(XA + 0.03, 1.68, T.z, Math.PI / 2, g); display(d, 2.8, 1.58, 1024, 579, 'brief', 'brief', 'Briefing · Convoy Route', 'BRF·01');
    const ledge = group(XA + 0.15, 0, T.z, Math.PI / 2, g); mesh(RBOX(2.9, 0.06, 0.24, 0.02), MAT.gun, 0, 0.8, 0, ledge); mesh(BOX(2.7, 0.012, 0.012), SLOT, 0, 0.78, 0.12, ledge); }
  // sideboard: water and fruit
  { const sb = group(-2.45, 0, 0.45, 0, g);
    mesh(RBOX(1.9, 0.82, 0.48, 0.03), MAT.gun, 0, 0.42, 0, sb); mesh(RBOX(1.94, 0.04, 0.52, 0.012), WOOD, 0, 0.85, 0, sb);
    [-0.47, 0.47].forEach((x) => mesh(BOX(0.85, 0.01, 0.01), SLOT, x, 0.12, 0.245, sb));
    mesh(lathe([[0, 0], [0.06, 0], [0.065, 0.02], [0.07, 0.16], [0.055, 0.22], [0.05, 0.26], [0.064, 0.27], [0, 0.27]]), GLASS, -0.55, 0.87, 0, sb);
    mesh(lathe([[0, 0], [0.05, 0], [0.058, 0.17], [0.05, 0.17], [0, 0.01]]), new THREE.MeshStandardMaterial({ color: 0x9fc4dc, transparent: true, opacity: 0.25, roughness: 0.1 }), -0.55, 0.875, 0, sb);
    [[-0.32, 0.08], [-0.22, -0.06], [-0.12, 0.09], [-0.02, -0.05]].forEach(([x, z]) => mesh(lathe([[0, 0], [0.032, 0], [0.036, 0.11], [0.033, 0.11], [0, 0.004]], 20), GLASS, x, 0.87, z, sb));
    mesh(lathe([[0, 0], [0.08, 0.005], [0.17, 0.07], [0.165, 0.075], [0, 0.012]], 32), MAT.steel, 0.45, 0.87, 0, sb);
    [['#a3241c', -0.05, 0.02], ['#6f9a2a', 0.06, -0.04], ['#d9781e', 0.02, 0.07], ['#a3241c', -0.07, -0.06], ['#d9781e', 0.08, 0.05]].forEach(([c, x, z], i) => mesh(new THREE.SphereGeometry(0.042, 14, 10), new THREE.MeshStandardMaterial({ color: c, roughness: 0.45 }), 0.45 + x, 0.92 + (i > 2 ? 0.04 : 0), z, sb));
    lrect(g, -2.45, 0.45, 1.94, 0.52, PR); }
  // battle honors on the starboard end wall
  { const pt = plaqueTex((x) => {
      drawCrest(x, 110, 120, 70, '#f3dcb4', 5);
      x.fillStyle = '#f7e6c8'; x.textBaseline = 'middle'; x.font = `700 54px ${DISP}`; x.fillText('BATTLE HONORS', 220, 92);
      x.font = `500 24px ${MONO}`; x.fillText('USS DEFIANCE · EV-0408', 222, 146);
      [['KESSRA APPROACH', 'YEAR 2'], ['IRALIS PICKET LINE', 'YEAR 2'], ['THE THESSALY RUN', 'YEAR 3'], ['OKONKWO BREAKOUT', 'YEAR 3']].forEach(([a, b], i) => {
        const y = 250 + i * 66; x.fillStyle = 'rgba(255,230,190,0.25)'; x.fillRect(60, y - 30, 904, 1); x.fillStyle = '#f7e6c8'; x.font = `600 34px ${DISP}`; x.textAlign = 'left'; x.fillText(a, 70, y); x.textAlign = 'right'; x.font = `500 26px ${MONO}`; x.fillText(b, 954, y); x.textAlign = 'left';
      });
      x.font = `italic 500 24px ${MONO}`; x.fillStyle = 'rgba(247,230,200,0.85)'; x.fillText('“STEADY UNDER FIRE.”', 70, 538);
    }, 1024, 580);
    const hp = group(XB - 0.02, 1.72, T.z, -Math.PI / 2, g); mesh(RBOX(1.28, 0.76, 0.04, 0.01), MAT.gunDark, 0, 0, -0.02, hp);
    mesh(new THREE.PlaneGeometry(1.2, 0.68), new THREE.MeshStandardMaterial({ map: pt, metalness: 0.75, roughness: 0.35, envMapIntensity: 1.2 }), 0, 0, 0.002, hp);
    addHit(BOX(1.3, 0.8, 0.3), { station: 'honors' }, hp, 0, 0, 0.1); }
  plantAt(g, XB - 0.4, 0.62, 1.0, PBOX); lobs(g, XB - 0.4, 0.62, 0.28);
  plantAt(g, XA + 0.4, D - 0.4, 1.0, PBOX); lobs(g, XA + 0.4, D - 0.4, 0.28);
  plantAt(g, XB - 0.4, D - 0.4, 0.9); lobs(g, XB - 0.4, D - 0.4, 0.26);
  // ceiling: a long light panel over the table, rows of downlights over the walkways on both sides
  { const lp = mesh(new THREE.PlaneGeometry(4.0, 0.6), downlightMat, T.x, H - 0.045, T.z, g); lp.rotation.x = Math.PI / 2; mesh(RBOX(4.16, 0.04, 0.76, 0.015), MAT.steel, T.x, H - 0.02, T.z, g);
    lpool(g, T.x, T.z, 5.2, 2.6, 0xffd2a0, 0.14); }
  [-2.6, 0, 2.6].forEach((x) => [1.25, D - 1.0].forEach((z) => { mesh(new THREE.CircleGeometry(0.09, 20), downlightMat, x, H - 0.003, z, g).rotation.x = Math.PI / 2; lpool(g, x, z, 1.4, 1.4, 0xffd2a0, 0.08); }));
  [[XA + 0.7, T.z], [XB - 0.7, T.z]].forEach(([x, z]) => { mesh(new THREE.CircleGeometry(0.09, 20), downlightMat, x, H - 0.003, z, g).rotation.x = Math.PI / 2; });
}

// ---------- HEAD (off the aft-port wall) ----------
{
  const g = roomFrame(5, 0.4);
  roomShell(g, { xa: -1.0, xb: 1.0, d: 2.6, H: 2.6, mat: roomTile, floor: MAT.floorPlate, light: [0, 2.3, 1.4], lightI: 0.8, lightDist: 4.5, label: 'Head' });
  // vanity: counter, basin, mirror
  { const v = group(-0.45, 0, 2.35, 0, g);
    mesh(RBOX(1.0, 0.8, 0.48, 0.03), MAT.gun, 0, 0.4, 0, v); mesh(RBOX(1.04, 0.05, 0.52, 0.012), MAT.cap, 0, 0.83, 0, v);
    mesh(lathe([[0, -0.1], [0.12, -0.1], [0.18, -0.03], [0.2, 0.0], [0.205, 0.012], [0.19, 0.012], [0.17, -0.02], [0.11, -0.085], [0, -0.085]], 32), CERAMIC, 0, 0.85, -0.02, v);
    mesh(CYL(0.012, 0.014, 0.16, 10), MAT.steel, 0, 0.93, 0.2, v); const sp = mesh(CYL(0.01, 0.01, 0.12, 10), MAT.steel, 0, 1.0, 0.15, v); sp.rotation.x = Math.PI / 2;
    const mir = mesh(new THREE.PlaneGeometry(0.9, 0.78), new THREE.MeshStandardMaterial({ color: 0xd4dadf, metalness: 1, roughness: 0.04, envMapIntensity: 1.4 }), 0, 1.55, 0.228, v); mir.rotation.y = Math.PI;
    mesh(RBOX(0.96, 0.84, 0.02, 0.01), MAT.steel, 0, 1.55, 0.246, v);
    mesh(BOX(0.86, 0.018, 0.02), SLOT, 0, 2.0, 0.22, v);
    addHit(BOX(1.1, 1.6, 0.6), { station: 'head' }, v, 0, 1.0, 0);
    lrect(g, -0.45, 2.35, 1.04, 0.52, PR); }
  // stall
  mesh(RBOX(0.04, 1.84, 1.36, 0.01), MAT.panel, 0.15, 1.04, 1.93, g);
  mesh(RBOX(0.84, 1.84, 0.04, 0.01), MAT.panel, 0.58, 1.04, 1.25, g);
  mesh(BOX(0.04, 0.16, 0.03), MAT.steel, 0.25, 1.05, 1.22, g);
  { const c = cnv(128, 40), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 128, 40); hexNode(x, 18, 20, 10); x.fillStyle = '#5FA97A'; x.fill(); x.fillStyle = '#F5E6CF'; x.font = `700 18px ${DISP}`; x.textBaseline = 'middle'; x.fillText('VACANT', 36, 21);
    const pl = mesh(new THREE.PlaneGeometry(0.2, 0.0625), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), 0.58, 1.55, 1.228, g); pl.rotation.y = Math.PI; }
  mesh(lathe([[0, 0], [0.13, 0], [0.16, 0.2], [0.19, 0.38], [0.17, 0.4], [0, 0.4]], 28), CERAMIC, 0.6, 0, 2.25, g);
  mesh(RBOX(0.38, 0.4, 0.18, 0.03), CERAMIC, 0.6, 0.6, 2.5, g);
  lseg(g, 0.15, 1.25, 0.15, 2.6, PR); lseg(g, 0.15, 1.25, 1.0, 1.25, PR);
  // dryer + reclamation sign on the side wall
  { const s = group(-0.98, 0, 1.0, Math.PI / 2, g);
    mesh(RBOX(0.3, 0.34, 0.14, 0.03), MAT.steel, 0, 1.15, 0.07, s); mesh(BOX(0.2, 0.01, 0.06), MAT.gunDark, 0, 0.975, 0.1, s);
    const c = cnv(512, 160), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 512, 160); hexNode(x, 40, 44, 22); x.fillStyle = '#E8A06A'; x.fill();
    x.fillStyle = '#F5E6CF'; x.font = `700 34px ${DISP}`; x.textBaseline = 'middle'; x.fillText('WATER RECLAMATION', 78, 46);
    x.fillStyle = '#E8A06A'; x.font = `700 44px ${DISP}`; x.fillText('98.2%', 30, 112); x.fillStyle = '#9A8678'; x.font = `500 20px ${MONO}`; x.fillText('EVERY DROP. WE ARE A LONG WAY FROM ANYWHERE.', 160, 114);
    mesh(new THREE.PlaneGeometry(0.62, 0.194), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), 0, 1.7, 0.012, s); }
  { const lp = mesh(new THREE.PlaneGeometry(1.0, 0.5), downlightMat, -0.3, 2.594, 1.6, g); lp.rotation.x = Math.PI / 2; lpool(g, -0.3, 1.8, 1.8, 1.8, 0xfff0e0, 0.12); }
}
