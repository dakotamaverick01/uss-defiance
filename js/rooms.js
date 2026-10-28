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
  } else {
    g.fillStyle = '#35302b'; g.fillRect(0, 0, Wd, Y(H - 0.26));
    const gr = g.createLinearGradient(0, Y(H - 0.26), 0, Y(1.02)); gr.addColorStop(0, '#7f7263'); gr.addColorStop(1, '#6f6253');
    g.fillStyle = gr; g.fillRect(0, Y(H - 0.26), Wd, Y(1.02) - Y(H - 0.26));
    const r = mulberry(29);
    for (let i = 0; i < 5000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,240,220,0.035)' : 'rgba(0,0,0,0.05)'; g.fillRect(r() * Wd, Y(H - 0.26) + r() * (Y(1.02) - Y(H - 0.26)), 1.2, 1.2); }
    [0, 96].forEach((x) => { g.fillStyle = 'rgba(30,22,16,0.55)'; g.fillRect(x, Y(H - 0.26), 3, Y(1.02) - Y(H - 0.26)); g.fillStyle = 'rgba(255,240,220,0.12)'; g.fillRect(x + 3, Y(H - 0.26), 1, Y(1.02) - Y(H - 0.26)); });
    g.fillStyle = '#5b3b26'; g.fillRect(0, Y(1.02), Wd, Y(0.95) - Y(1.02)); g.fillStyle = 'rgba(255,220,180,0.35)'; g.fillRect(0, Y(1.02), Wd, 2);
    g.fillStyle = '#3a332d'; g.fillRect(0, Y(0.95), Wd, Y(0.12) - Y(0.95));
    g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 2; g.strokeRect(10, Y(0.88), Wd - 20, Y(0.2) - Y(0.88));
    g.fillStyle = '#211e1b'; g.fillRect(0, Y(0.12), Wd, Hp - Y(0.12));
  }
  ge.fillStyle = '#000'; ge.fillRect(0, 0, Wd, Hp);
  ge.fillStyle = '#fff'; ge.fillRect(0, Y(H - (kind === 'tile' ? 0.18 : 0.26)) - 2, Wd, 3);
  return [c, e];
}
function roomWallMat(H, kind) {
  const [c, e] = roomWallCanvases(H, kind); const map = tex(c), em = tex(e); map.wrapS = em.wrapS = THREE.RepeatWrapping;
  const m = new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: new THREE.Color(ALERTS.green.slot), emissiveIntensity: 0.65, roughness: 0.9, metalness: 0.02, envMapIntensity: 0.3 });
  ROOM_WALL_MATS.push(m); return m;
}
const WOOD = (() => {
  const S = 512, c = cnv(S, S), g = c.getContext('2d'); g.fillStyle = '#4a2e1c'; g.fillRect(0, 0, S, S);
  const r = mulberry(61);
  for (let i = 0; i < 220; i++) { const y = r() * S, a = 0.04 + r() * 0.09; g.strokeStyle = r() < 0.5 ? `rgba(18,9,3,${a})` : `rgba(150,98,60,${a})`; g.lineWidth = 0.5 + r() * 2.2; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= S; x += 32) g.lineTo(x, y + Math.sin(x * 0.012 + i) * 5 + (r() - 0.5) * 2); g.stroke(); }
  noise(g, S, S, 4000, 0.02, 62);
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.4, metalness: 0.05, envMapIntensity: 0.55 });
})();
const CERAMIC = new THREE.MeshStandardMaterial({ color: 0xeeeae4, roughness: 0.22, metalness: 0.02, envMapIntensity: 0.8 });
const GLASS = new THREE.MeshStandardMaterial({ color: 0xbcd2dc, transparent: true, opacity: 0.16, roughness: 0.04, metalness: 0.85, envMapIntensity: 1.3, depthWrite: false });
const PANE = new THREE.MeshStandardMaterial({ color: 0x8fa8b8, transparent: true, opacity: 0.05, roughness: 0.02, metalness: 0.6, envMapIntensity: 0.35, depthWrite: false });
const POT = new THREE.MeshStandardMaterial({ color: 0x24211f, roughness: 0.45, metalness: 0.3, envMapIntensity: 0.25 });
const LEAF = new THREE.MeshStandardMaterial({ color: 0x3f6b3a, roughness: 0.7, side: THREE.DoubleSide });
const FABRIC = new THREE.MeshStandardMaterial({ color: 0x3e5658, roughness: 0.95 });
const BRASS = new THREE.MeshStandardMaterial({ color: 0xb08850, metalness: 0.85, roughness: 0.3, envMapIntensity: 1.1 });
const roomWarm = roomWallMat(2.9, 'fabric'), roomTile = roomWallMat(2.6, 'tile');

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
  const lp = cnv(256, 48); { const c2 = lp.getContext('2d'); c2.fillStyle = '#000'; c2.fillRect(0, 0, 256, 48); hexNode(c2, 24, 24, 14); c2.fillStyle = '#4C8DFF'; c2.fill(); c2.fillStyle = '#EAF2FF'; c2.font = `700 22px ${DISP}`; c2.textBaseline = 'middle'; c2.fillText('BRIDGE', 48, 26); }
  mesh(new THREE.PlaneGeometry(0.62, 0.116), new THREE.MeshBasicMaterial({ map: tex(lp), toneMapped: false }), 0, 2.38, z0 + 0.102, g);
  // collision: walls with the door gap
  lseg(g, xa, z0, -0.6, z0, 0.33); lseg(g, 0.6, z0, xb, z0, 0.33);
  lseg(g, xa, d, xb, d, 0.33); lseg(g, xa, z0, xa, d, 0.33); lseg(g, xb, z0, xb, d, 0.33);
  // light
  const L = new THREE.PointLight(0xffdcb8, 0, o.lightDist || 6, 0.53); const lp3 = new THREE.Vector3(o.light[0], o.light[1], o.light[2]).applyMatrix4(g.matrixWorld); L.position.copy(lp3); scene.add(L);
  const room = { g, xa, xb, d, label: o.label, light: L, base: o.lightI || 0.9, k: 0, door: W(g, 0, 0) };
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
function plantAt(parent, x, z, scale) {
  const g = group(x, 0, z, 0, parent); g.scale.setScalar(scale || 1);
  mesh(CYL(0.2, 0.15, 0.5, 24), POT, 0, 0.25, 0, g);
  mesh(new THREE.TorusGeometry(0.2, 0.015, 6, 24), BRASS, 0, 0.5, 0, g).rotation.x = Math.PI / 2;
  const rr = mulberry(Math.round(x * 100 + z * 37) + 99);
  for (let i = 0; i < 13; i++) {
    const a = i / 13 * Math.PI * 2 + rr() * 0.4, tilt = 0.3 + rr() * 0.6, len = 0.4 + rr() * 0.35;
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
  add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, vertexColors: true, depthWrite: false, toneMapped: false, fog: false })));
  const nb = new THREE.Sprite(new THREE.SpriteMaterial({ map: nebula.material.map, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
  nb.position.set(150, 30, 330); nb.scale.set(560, 330, 1); scene.add(nb);
}
const EXT_N = 600, extPos = new Float32Array(EXT_N * 6), extCol = new Float32Array(EXT_N * 6), extXYZ = new Float32Array(EXT_N * 3);
function seedExt(i, z) { let x, y; do { x = (Math.random() - 0.5) * 150; y = (Math.random() - 0.5) * 80; } while (Math.abs(x) < 18 && Math.abs(y) < 12); extXYZ[i * 3] = x; extXYZ[i * 3 + 1] = y; extXYZ[i * 3 + 2] = z; }
for (let i = 0; i < EXT_N; i++) { seedExt(i, -90 + Math.random() * 180); const b = 0.6 + Math.random() * 0.4; extCol.set([b, b, b, 0.1, 0.25 * b, 0.45 * b], i * 6); }
const extGeo = new THREE.BufferGeometry(); extGeo.setAttribute('position', new THREE.BufferAttribute(extPos, 3)); extGeo.setAttribute('color', new THREE.BufferAttribute(extCol, 3));
const extMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false });
const extStreaks = add(new THREE.LineSegments(extGeo, extMat)); extStreaks.frustumCulled = false; extStreaks.visible = false;

// ---------- READY ROOM (off the aft-starboard wall) ----------
let cupLiquid, cupGroup;
{
  const g = roomFrame(3, 0.38);
  const R = roomShell(g, { xa: -1.0, xb: 3.0, d: 4.6, H: 2.9, mat: roomWarm, floor: MAT.floorCarpet, window: { x0: -0.4, x1: 2.6, y0: 0.95, y1: 2.25 }, light: [1.0, 2.55, 2.6], lightI: 1.0, lightDist: 6.5, label: 'Ready Room' });
  viewport(g, -0.4, 2.6, 0.95, 2.25, 4.6);
  // rug
  { const c = cnv(512, 416), x = c.getContext('2d'); x.fillStyle = '#26303b'; x.fillRect(0, 0, 512, 416); noise(x, 512, 416, 9000, 0.05, 72);
    x.strokeStyle = 'rgba(201,182,140,0.75)'; x.lineWidth = 6; x.strokeRect(18, 18, 476, 380); x.lineWidth = 2; x.strokeRect(34, 34, 444, 348);
    x.strokeStyle = 'rgba(201,182,140,0.16)'; x.lineWidth = 1.5; for (let yy = 60; yy < 370; yy += 36) for (let xx = 60 + ((yy / 36) % 2) * 18; xx < 460; xx += 36) { hexNode(x, xx, yy, 12); x.stroke(); }
    const rug = mesh(new THREE.PlaneGeometry(3.0, 2.44), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.97, polygonOffset: true, polygonOffsetFactor: -1 }), 0.9, 0.004, 2.95, g); rug.rotation.x = -Math.PI / 2; }
  // desk: walnut top on two steel-trimmed pedestals, facing the door
  const desk = group(1.6, 0, 3.15, 0, g);
  mesh(RBOX(1.6, 0.06, 0.8, 0.025), WOOD, 0, 0.76, 0, desk);
  mesh(RBOX(1.62, 0.015, 0.82, 0.006), MAT.steel, 0, 0.725, 0, desk);
  [-1, 1].forEach((sd) => { mesh(RBOX(0.42, 0.72, 0.7, 0.03), MAT.gun, sd * 0.56, 0.36, 0.02, desk); mesh(BOX(0.36, 0.012, 0.012), SLOT, sd * 0.56, 0.55, -0.335, desk); mesh(BOX(0.3, 0.012, 0.012), SLOT, sd * 0.56, 0.3, -0.335, desk); });
  mesh(RBOX(0.72, 0.5, 0.04, 0.01), MAT.gunDark, 0, 0.45, -0.3, desk);
  // Stage 5: coffee ring on desk
  { const r = mesh(new THREE.RingGeometry(0.035, 0.05, 16), new THREE.MeshBasicMaterial({ color: 0x4a3020, transparent: true, opacity: 0.5, side: THREE.DoubleSide }), 0.35, 0.79, 0.15, desk); r.rotation.x = -Math.PI / 2; }
  // mug on desk
  { const mg = group(0.5, 0.79, 0.2, 0.2, desk); mesh(CYL(0.03, 0.026, 0.06, 10), new THREE.MeshStandardMaterial({ color: 0x2a170c, roughness: 0.4 }), 0, 0.03, 0, mg); }
  { const s = group(0, 0.79, -0.18, 0, desk); s.rotation.x = -0.45; mesh(RBOX(0.74, 0.44, 0.04, 0.012), MAT.gunDark, 0, 0.2, -0.025, s); addScreen(group(0, 0.2, 0, 0, s), 0.68, 0.38, 640, 358, 'log', 'desk', 'Personal Log', 'CO·01'); }
  [[0.45, 0.25, 0.3], [0.5, 0.18, -0.2]].forEach(([x, z, ry]) => { const p = mesh(RBOX(0.16, 0.012, 0.24, 0.004), MAT.gunDark, x, 0.796, z, desk); p.rotation.y = ry; const sc = mesh(new THREE.PlaneGeometry(0.13, 0.2), new THREE.MeshBasicMaterial({ color: 0x1b2a44, toneMapped: false }), x, 0.803, z, desk); sc.rotation.set(-Math.PI / 2, 0, ry); });
  mesh(lathe([[0, 0], [0.05, 0], [0.05, 0.012], [0.012, 0.03], [0.008, 0.33], [0, 0.33]]), MAT.steel, -0.62, 0.79, 0.2, desk);
  { const sh = mesh(lathe([[0.012, 0], [0.07, -0.06], [0.072, -0.065], [0.014, -0.004]], 24), MAT.gun, -0.62, 1.15, 0.2, desk); sh.rotation.x = 0.3; mesh(new THREE.CircleGeometry(0.06, 20), downlightMat, -0.62, 1.098, 0.215, desk).rotation.x = Math.PI / 2 + 0.3; }
  addHit(BOX(1.7, 1.2, 0.9), { station: 'desk' }, desk, 0, 0.6, 0);
  lpool(g, 1.0, 3.3, 1.2, 1.2, 0xffd2a0, 0.12);
  lrect(g, 1.6, 3.15, 1.6, 0.8, PR); lao(g, 1.6, 3.15, 2.0, 1.2, 0.55);
  // chairs: captain behind the desk, two guests in front
  { const c = group(1.6, 0, 3.85, 0, g); makeChair(c, 'captain'); lobs(g, 1.6, 3.85, 0.32); lao(g, 1.6, 3.85, 0.9, 0.9, 0.55); }
  [1.15, 2.05].forEach((x) => { const c = group(x, 0, 2.25, Math.PI, g); makeChair(c, 'station'); lobs(g, x, 2.25, 0.3); lao(g, x, 2.25, 0.8, 0.8, 0.5); });
  // settee against the aft wall, with a low table
  { const s = group(-0.6, 0, 2.9, 0, g);
    mesh(RBOX(0.72, 0.36, 1.96, 0.04), MAT.leatherDark, 0, 0.2, 0, s);
    [-0.45, 0.45].forEach((z) => mesh(RBOX(0.62, 0.14, 0.9, 0.06), MAT.leather, 0.05, 0.44, z, s));
    mesh(RBOX(0.2, 0.5, 1.96, 0.06), MAT.leather, -0.28, 0.6, 0, s);
    [-1, 1].forEach((sd) => mesh(RBOX(0.72, 0.52, 0.16, 0.05), MAT.leatherDark, 0, 0.3, sd * 1.02, s));
    const pil = mesh(RBOX(0.12, 0.34, 0.36, 0.06), FABRIC, -0.12, 0.66, -0.62, s); pil.rotation.z = -0.25; pil.rotation.y = 0.2;
    lrect(g, -0.6, 2.9, 0.74, 2.2, PR); lao(g, -0.6, 2.9, 1.2, 2.6, 0.6); }
  { const t = group(0.3, 0, 2.9, 0, g); mesh(RBOX(0.58, 0.035, 1.0, 0.012), MAT.glassTop, 0, 0.42, 0, t); mesh(RBOX(0.46, 0.38, 0.86, 0.03), MAT.gun, 0, 0.2, 0, t);
    const cr = mesh(new THREE.OctahedronGeometry(0.07, 0), new THREE.MeshStandardMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.3, emissive: 0x1a3a5a }), 0, 0.51, 0.22, t); cr.scale.set(1, 1.6, 1);
    mesh(RBOX(0.2, 0.03, 0.28, 0.006), new THREE.MeshStandardMaterial({ color: 0x6b2a22, roughness: 0.7 }), 0.02, 0.453, -0.2, t);
    lrect(g, 0.3, 2.9, 0.58, 1.0, PR); }
  // shelves above the settee: books and keepsakes
  { const s = group(-0.86, 0, 2.9, 0, g); const BOOK = ['#4a1c17', '#1a2638', '#2b3520', '#5a4b33', '#221f1c', '#3b2640', '#5e3d1d'].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 }));
    [1.55, 2.0].forEach((y, k) => {
      mesh(RBOX(0.26, 0.035, 1.7, 0.01), WOOD, 0, y, 0, s);
      const r = mulberry(300 + k); let z = -0.78;
      while (z < (k ? 0.2 : 0.05)) { const th = 0.025 + r() * 0.03, hh = 0.2 + r() * 0.08; const b = mesh(BOX(0.18, hh, th), BOOK[(r() * BOOK.length) | 0], 0, y + 0.0175 + hh / 2, z + th / 2, s); if (r() < 0.12) { b.rotation.x = 0.2; } z += th + 0.004; }
    });
    mesh(CYL(0.035, 0.05, 0.12, 16), BRASS, 0.0, 1.627, 0.45, s); mesh(new THREE.SphereGeometry(0.045, 16, 12), BRASS, 0.0, 1.72, 0.45, s);
    mesh(RBOX(0.03, 0.2, 0.26, 0.006), MAT.gunDark, 0.02, 2.12, 0.5, s);
    const ph = cnv(128, 100); { const x = ph.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 100); gr.addColorStop(0, '#5a7aa0'); gr.addColorStop(0.55, '#c9b28a'); gr.addColorStop(1, '#4a5a3a'); x.fillStyle = gr; x.fillRect(0, 0, 128, 100); x.fillStyle = 'rgba(40,40,50,0.6)'; x.beginPath(); x.moveTo(0, 62); x.lineTo(30, 44); x.lineTo(58, 56); x.lineTo(92, 36); x.lineTo(128, 52); x.lineTo(128, 100); x.lineTo(0, 100); x.fill(); }
    const pic = mesh(new THREE.PlaneGeometry(0.22, 0.17), new THREE.MeshStandardMaterial({ map: tex(ph), roughness: 0.5 }), 0.037, 2.12, 0.5, s); pic.rotation.y = Math.PI / 2; }
  // forward wall: ship status display over a credenza with the ship's model
  { const dsp = group(2.97, 1.85, 2.5, -Math.PI / 2, g); display(dsp, 1.5, 0.92, 520, 320, 'status', 'ship', 'Ship Status', 'SYS·00'); }
  { const cz = group(2.78, 0, 2.5, -Math.PI / 2, g);
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
    lrect(g, 2.78, 2.5, 0.44, 2.04, PR); lao(g, 2.75, 2.5, 0.9, 2.4, 0.55); }
  // synthesizer niche beside the door
  { const sn = group(2.1, 0, 0.2, 0, g);
    [-1, 1].forEach((sd) => mesh(RBOX(0.08, 0.82, 0.16, 0.02), MAT.gun, sd * 0.29, 1.25, 0.08, sn));
    mesh(RBOX(0.66, 0.08, 0.16, 0.02), MAT.gun, 0, 1.62, 0.08, sn); mesh(RBOX(0.66, 0.08, 0.16, 0.02), MAT.gun, 0, 0.88, 0.08, sn);
    mesh(new THREE.PlaneGeometry(0.5, 0.66), new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.4, metalness: 0.5 }), 0, 1.25, 0.012, sn);
    mesh(new THREE.PlaneGeometry(0.46, 0.035), new THREE.MeshBasicMaterial({ color: 0xffd9a8, toneMapped: false }), 0, 1.55, 0.016, sn);
    mesh(RBOX(0.5, 0.025, 0.16, 0.008), MAT.steel, 0, 0.965, 0.1, sn);
    const lb = cnv(256, 40); { const x = lb.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 256, 40); hexNode(x, 20, 20, 11); x.fillStyle = '#FFD21F'; x.fill(); x.fillStyle = '#EAF2FF'; x.font = `700 18px ${DISP}`; x.textBaseline = 'middle'; x.fillText('SYNTHESIZER', 40, 21); }
    mesh(new THREE.PlaneGeometry(0.44, 0.07), new THREE.MeshBasicMaterial({ map: tex(lb), toneMapped: false }), 0, 1.74, 0.012, sn);
    cupGroup = group(0, 0.978, 0.1, 0, sn); cupGroup.visible = false;
    mesh(lathe([[0, 0], [0.034, 0], [0.04, 0.006], [0.043, 0.095], [0.039, 0.095], [0.035, 0.008], [0, 0.008]], 24), CERAMIC, 0, 0, 0, cupGroup);
    mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 16, Math.PI), CERAMIC, 0.044, 0.05, 0, cupGroup).rotation.z = -Math.PI / 2;
    cupLiquid = new THREE.MeshStandardMaterial({ color: 0x3a2214, roughness: 0.15 });
    mesh(new THREE.CircleGeometry(0.037, 20), cupLiquid, 0, 0.08, 0, cupGroup).rotation.x = -Math.PI / 2;
    addHit(BOX(0.7, 0.9, 0.4), { station: 'synth' }, sn, 0, 1.25, 0.2); }
  plantAt(g, -0.62, 0.68, 1.0); lobs(g, -0.62, 0.68, 0.28);
  plantAt(g, 2.72, 3.95, 0.85); lobs(g, 2.72, 3.95, 0.26);
  // ceiling: a central light disc, downlights over desk and settee
  { const dc = mesh(new THREE.CircleGeometry(0.55, 40), lightDiscMat, 1.0, 2.895, 2.6, g); dc.rotation.x = Math.PI / 2; const rim = mesh(new THREE.TorusGeometry(0.56, 0.025, 8, 48), MAT.steel, 1.0, 2.89, 2.6, g); rim.rotation.x = Math.PI / 2; }
  [[1.6, 3.4], [-0.4, 2.9], [2.5, 1.2]].forEach(([x, z]) => { mesh(new THREE.CircleGeometry(0.09, 20), downlightMat, x, 2.897, z, g).rotation.x = Math.PI / 2; lpool(g, x, z, 1.4, 1.4, 0xffd2a0, 0.1); });
}

// ---------- CONFERENCE ROOM (off the aft wall, starboard of the situation table) ----------
{
  const g = roomFrame(4, 0.174);
  roomShell(g, { xa: -3.75, xb: 2.05, d: 4.4, H: 2.9, mat: roomWarm, floor: MAT.floorCarpet, window: { x0: -3.05, x1: 1.35, y0: 1.0, y1: 2.15 }, light: [-0.85, 2.55, 2.3], lightI: 1.1, lightDist: 7.5, label: 'Conference Room' });
  viewport(g, -3.05, 1.35, 1.0, 2.15, 4.4);
  // table: dark glass top with an underglow and the crest inlaid
  const T = { x: -0.85, z: 2.3, L: 3.4, W: 1.3 };
  const ts = new THREE.Shape(); { const hw = T.L / 2, hd = T.W / 2, r = 0.55; ts.moveTo(-hw + r, -hd); ts.lineTo(hw - r, -hd); ts.quadraticCurveTo(hw, -hd, hw, -hd + r); ts.lineTo(hw, hd - r); ts.quadraticCurveTo(hw, hd, hw - r, hd); ts.lineTo(-hw + r, hd); ts.quadraticCurveTo(-hw, hd, -hw, hd - r); ts.lineTo(-hw, -hd + r); ts.quadraticCurveTo(-hw, -hd, -hw + r, -hd); }
  const topG = new THREE.ExtrudeGeometry(ts, { depth: 0.03, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2, curveSegments: 16 }); topG.rotateX(-Math.PI / 2);
  mesh(topG, MAT.glassTop, T.x, 0.72, T.z, g);
  const glowS = new THREE.Shape(ts.getPoints(16).map((p) => new THREE.Vector2(p.x * 1.012, p.y * 1.03)));
  const glowG = new THREE.ExtrudeGeometry(glowS, { depth: 0.012, bevelEnabled: false }); glowG.rotateX(-Math.PI / 2);
  mesh(glowG, SLOT, T.x, 0.69, T.z, g);
  const rimG = new THREE.ExtrudeGeometry(new THREE.Shape(ts.getPoints(16).map((p) => new THREE.Vector2(p.x * 0.96, p.y * 0.9))), { depth: 0.1, bevelEnabled: false }); rimG.rotateX(-Math.PI / 2);
  mesh(rimG, MAT.gun, T.x, 0.6, T.z, g);
  [-1, 1].forEach((sd) => { mesh(RBOX(0.5, 0.6, 0.7, 0.05), MAT.gun, T.x + sd * 0.95, 0.3, T.z, g); mesh(BOX(0.4, 0.012, 0.012), SLOT, T.x + sd * 0.95, 0.08, T.z - 0.355, g); mesh(BOX(0.4, 0.012, 0.012), SLOT, T.x + sd * 0.95, 0.08, T.z + 0.355, g); });
  { const c = cnv(256, 256), x = c.getContext('2d'); drawCrest(x, 128, 128, 90, 'rgba(201,214,234,0.75)', 5); const cr = mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, toneMapped: false, depthWrite: false }), T.x, 0.772, T.z, g); cr.rotation.x = -Math.PI / 2; }
  lrect(g, T.x, T.z, T.L, T.W, PR); lao(g, T.x, T.z, T.L + 1.4, T.W + 1.4, 0.6);
  // seven seats: three a side, the captain's at the head facing the briefing display
  const seats = [];
  [-1.95, -0.85, 0.25].forEach((x) => { seats.push([x, T.z - 1.0, Math.PI]); seats.push([x, T.z + 1.0, 0]); });
  seats.push([T.x + T.L / 2 + 0.55, T.z, Math.PI / 2]);
  seats.forEach(([x, z, ry], i) => {
    const c = group(x, 0, z, ry, g); makeChair(c, i === 6 ? 'captain' : 'xo'); lobs(g, x, z, 0.3); lao(g, x, z, 0.8, 0.8, 0.5);
    const fx = x + (T.x - x) * (i === 6 ? 0.42 : 0), fz = i === 6 ? z : z + (T.z - z) * 0.55;
    const sp = group(fx, 0.774, fz, ry, g); const sc = group(0, 0, 0, 0, sp); sc.rotation.x = -Math.PI / 2; addScreen(sc, 0.34, 0.18, 200, 106, 'keys', 'brief', '', '');
  });
  // briefing display on the port end wall
  { const d = group(-3.72, 1.62, T.z, Math.PI / 2, g); display(d, 2.3, 1.3, 1024, 579, 'brief', 'brief', 'Briefing · Convoy Route', 'BRF·01');
    const ledge = group(-3.6, 0, T.z, Math.PI / 2, g); mesh(RBOX(2.4, 0.06, 0.24, 0.02), MAT.gun, 0, 0.86, 0, ledge); mesh(BOX(2.2, 0.012, 0.012), SLOT, 0, 0.84, 0.12, ledge); }
  // sideboard: water and fruit
  { const sb = group(-2.35, 0, 0.45, 0, g);
    mesh(RBOX(1.9, 0.82, 0.48, 0.03), MAT.gun, 0, 0.42, 0, sb); mesh(RBOX(1.94, 0.04, 0.52, 0.012), WOOD, 0, 0.85, 0, sb);
    [-0.47, 0.47].forEach((x) => mesh(BOX(0.85, 0.01, 0.01), SLOT, x, 0.12, 0.245, sb));
    mesh(lathe([[0, 0], [0.06, 0], [0.065, 0.02], [0.07, 0.16], [0.055, 0.22], [0.05, 0.26], [0.064, 0.27], [0, 0.27]]), GLASS, -0.55, 0.87, 0, sb);
    mesh(lathe([[0, 0], [0.05, 0], [0.058, 0.17], [0.05, 0.17], [0, 0.01]]), new THREE.MeshStandardMaterial({ color: 0x9fc4dc, transparent: true, opacity: 0.25, roughness: 0.1 }), -0.55, 0.875, 0, sb);
    [[-0.32, 0.08], [-0.22, -0.06], [-0.12, 0.09], [-0.02, -0.05]].forEach(([x, z]) => mesh(lathe([[0, 0], [0.032, 0], [0.036, 0.11], [0.033, 0.11], [0, 0.004]], 20), GLASS, x, 0.87, z, sb));
    mesh(lathe([[0, 0], [0.08, 0.005], [0.17, 0.07], [0.165, 0.075], [0, 0.012]], 32), MAT.steel, 0.45, 0.87, 0, sb);
    [['#a3241c', -0.05, 0.02], ['#6f9a2a', 0.06, -0.04], ['#d9781e', 0.02, 0.07], ['#a3241c', -0.07, -0.06], ['#d9781e', 0.08, 0.05]].forEach(([c, x, z], i) => mesh(new THREE.SphereGeometry(0.042, 14, 10), new THREE.MeshStandardMaterial({ color: c, roughness: 0.45 }), 0.45 + x, 0.92 + (i > 2 ? 0.04 : 0), z, sb));
    lrect(g, -2.35, 0.45, 1.94, 0.52, PR); }
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
    const hp = group(2.03, 1.72, T.z, -Math.PI / 2, g); mesh(RBOX(1.28, 0.76, 0.04, 0.01), MAT.gunDark, 0, 0, -0.02, hp);
    mesh(new THREE.PlaneGeometry(1.2, 0.68), new THREE.MeshStandardMaterial({ map: pt, metalness: 0.75, roughness: 0.35, envMapIntensity: 1.2 }), 0, 0, 0.002, hp);
    addHit(BOX(1.3, 0.8, 0.3), { station: 'honors' }, hp, 0, 0, 0.1); }
  plantAt(g, 1.72, 0.62, 1.0); lobs(g, 1.72, 0.62, 0.28);
  plantAt(g, -3.42, 4.05, 1.0); lobs(g, -3.42, 4.05, 0.28);
  // ceiling: a long light panel over the table
  { const lp = mesh(new THREE.PlaneGeometry(2.8, 0.5), downlightMat, T.x, 2.893, T.z, g); lp.rotation.x = Math.PI / 2; const fr = mesh(RBOX(2.96, 0.04, 0.66, 0.015), MAT.steel, T.x, 2.88, T.z, g);
    lpool(g, T.x, T.z, 4.0, 2.4, 0xffd2a0, 0.14); }
  [[-3.2, 1.0], [1.5, 3.8]].forEach(([x, z]) => mesh(new THREE.CircleGeometry(0.09, 20), downlightMat, x, 2.897, z, g).rotation.x = Math.PI / 2);
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
  { const c = cnv(128, 40), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 128, 40); hexNode(x, 18, 20, 10); x.fillStyle = '#34E89E'; x.fill(); x.fillStyle = '#EAF2FF'; x.font = `700 18px ${DISP}`; x.textBaseline = 'middle'; x.fillText('VACANT', 36, 21);
    const pl = mesh(new THREE.PlaneGeometry(0.2, 0.0625), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), 0.58, 1.55, 1.228, g); pl.rotation.y = Math.PI; }
  mesh(lathe([[0, 0], [0.13, 0], [0.16, 0.2], [0.19, 0.38], [0.17, 0.4], [0, 0.4]], 28), CERAMIC, 0.6, 0, 2.25, g);
  mesh(RBOX(0.38, 0.4, 0.18, 0.03), CERAMIC, 0.6, 0.6, 2.5, g);
  lseg(g, 0.15, 1.25, 0.15, 2.6, PR); lseg(g, 0.15, 1.25, 1.0, 1.25, PR);
  // dryer + reclamation sign on the side wall
  { const s = group(-0.98, 0, 1.0, Math.PI / 2, g);
    mesh(RBOX(0.3, 0.34, 0.14, 0.03), MAT.steel, 0, 1.15, 0.07, s); mesh(BOX(0.2, 0.01, 0.06), MAT.gunDark, 0, 0.975, 0.1, s);
    const c = cnv(512, 160), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 512, 160); hexNode(x, 40, 44, 22); x.fillStyle = '#FFD21F'; x.fill();
    x.fillStyle = '#EAF2FF'; x.font = `700 34px ${DISP}`; x.textBaseline = 'middle'; x.fillText('WATER RECLAMATION', 78, 46);
    x.fillStyle = '#34E89E'; x.font = `700 44px ${DISP}`; x.fillText('98.2%', 30, 112); x.fillStyle = '#8A97AD'; x.font = `500 20px ${MONO}`; x.fillText('EVERY DROP. WE ARE A LONG WAY FROM ANYWHERE.', 160, 114);
    mesh(new THREE.PlaneGeometry(0.62, 0.194), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), 0, 1.7, 0.012, s); }
  { const lp = mesh(new THREE.PlaneGeometry(1.0, 0.5), downlightMat, -0.3, 2.594, 1.6, g); lp.rotation.x = Math.PI / 2; lpool(g, -0.3, 1.8, 1.8, 1.8, 0xfff0e0, 0.12); }
}