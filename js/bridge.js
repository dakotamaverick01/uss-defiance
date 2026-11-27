// USS Defiance · bridge.js
// Main bridge geometry: room shell, consoles, seating, command dais, viewscreen, aft wall, downlights.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- room shell ----------
// floor: metal deck plating perimeter, carpet inside
const inner = insetPoly(ROOM, 0.62);
{ const s = shapeXZ(ROOM, true); s.holes.push(pathXZ(inner, true)); const f = mesh(new THREE.ShapeGeometry(s), MAT.floorPlate); f.rotation.x = -Math.PI / 2; }
{ const f = mesh(new THREE.ShapeGeometry(shapeXZ(inner, true)), MAT.floorCarpet, 0, 0.002, 0); f.rotation.x = -Math.PI / 2; }
inner.forEach((p, i) => { const q = inner[(i + 1) % inner.length], len = Math.hypot(q[0] - p[0], q[1] - p[1]); const m = mesh(BOX(len, 0.012, 0.05), MAT.steel, (p[0] + q[0]) / 2, 0.006, (p[1] + q[1]) / 2); m.rotation.y = -Math.atan2(q[1] - p[1], q[0] - p[0]); });
// ceiling with a central coffer
const COFFER = { x: 0, z: 0.4, r: 1.45 };
{
  const s = shapeXZ(ROOM, false); const hole = new THREE.Path(); hole.absarc(COFFER.x, COFFER.z, COFFER.r, 0, Math.PI * 2, true); s.holes.push(hole);
  const c = mesh(new THREE.ShapeGeometry(s, 48), MAT.ceiling, 0, WALL_H, 0); c.rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(COFFER.r, COFFER.r, 0.5, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0x8a8177, roughness: 0.7, side: THREE.BackSide }), COFFER.x, WALL_H + 0.25, COFFER.z);
  const d = mesh(new THREE.CircleGeometry(COFFER.r, 64), lightDiscMat, COFFER.x, WALL_H + 0.5, COFFER.z); d.rotation.x = Math.PI / 2;
  const t = mesh(new THREE.TorusGeometry(COFFER.r, 0.07, 8, 96), MAT.steel, COFFER.x, WALL_H - 0.02, COFFER.z); t.rotation.x = Math.PI / 2;
  const t2 = mesh(new THREE.TorusGeometry(COFFER.r - 0.12, 0.025, 6, 96), SLOT, COFFER.x, WALL_H + 0.46, COFFER.z); t2.rotation.x = Math.PI / 2;
}
// walls
EDGES.forEach((e, ei) => {
  const gap = DOOR_GAPS[ei], dir = [e.tx, e.tz], nrm = [e.nx, e.nz], P2 = (s2) => [e.A[0] + e.tx * s2, e.A[1] + e.tz * s2];
  const stripRun = (s0, s1) => { if (s1 - s0 < 0.05) return; const m2 = (s0 + s1) / 2, q = P2(m2); const es = mesh(BOX(s1 - s0, 0.025, 0.02), STRIP, q[0] + e.nx * 0.012, 0.07, q[1] + e.nz * 0.012); es.rotation.y = e.rot; };
  if (gap === undefined) {
    wallPiece(MAT.wall, e.A, dir, nrm, 0, e.len, 0, WALL_H, WALL_H, 1.2);
    addSeg(e.A[0], e.A[1], e.B[0], e.B[1], 0.33); stripRun(0.25, e.len - 0.25);
  } else {
    // one or more 1.2 m openings; the aft wall has two (conference room and the Lift 1 car)
    const cs = [gap].concat(ei === LIFT_GAP.edge ? [LIFT_GAP.t] : []).sort((p, q) => p - q).map((g2) => g2 * e.len);
    let s = 0;
    cs.forEach((sc) => { wallPiece(MAT.wall, e.A, dir, nrm, s, sc - 0.6, 0, WALL_H, WALL_H, 1.2); s = sc + 0.6; });
    wallPiece(MAT.wall, e.A, dir, nrm, s, e.len, 0, WALL_H, WALL_H, 1.2);
    cs.forEach((sc) => wallPiece(MAT.wall, e.A, dir, nrm, sc - 0.6, sc + 0.6, 2.3, WALL_H, WALL_H, 1.2));
    s = 0;
    cs.forEach((sc) => { const a = P2(s), b = P2(sc - 0.6); addSeg(a[0], a[1], b[0], b[1], 0.33); stripRun(s ? s + 0.15 : 0.25, sc - 0.75); s = sc + 0.6; });
    { const a = P2(s), b = P2(e.len); addSeg(a[0], a[1], b[0], b[1], 0.33); stripRun(s + 0.15, e.len - 0.25); }
  }
  // cove light under the ceiling, emergency strip at the deck
  const cv = mesh(BOX(e.len - 0.5, 0.04, 0.04), SLOT, e.mx + e.nx * 0.12, WALL_H - 0.16, e.mz + e.nz * 0.12); cv.rotation.y = e.rot;
  const sh = mesh(RBOX(e.len - 0.4, 0.1, 0.18, 0.02), MAT.gunDark, e.mx + e.nx * 0.09, WALL_H - 0.1, e.mz + e.nz * 0.09); sh.rotation.y = e.rot;
  // conduit runs
  [[0.32, 3.06, 0.05], [0.44, 3.14, 0.035]].forEach(([off, y, r]) => {
    const p = mesh(new THREE.CylinderGeometry(r, r, e.len - 0.7, 10), MAT.steel, e.mx + e.nx * off, y, e.mz + e.nz * off);
    p.rotation.z = Math.PI / 2; p.rotation.y = e.rot - Math.PI / 2 + Math.PI / 2; const gq = new THREE.Group(); scene.remove(p); gq.position.set(e.mx + e.nx * off, y, e.mz + e.nz * off); gq.rotation.y = e.rot; p.position.set(0, 0, 0); p.rotation.set(0, 0, Math.PI / 2); gq.add(p); scene.add(gq);
  });
  const nb = Math.max(1, Math.floor(e.len / 1.3));
  for (let k = 1; k <= nb; k++) { const t = k / (nb + 1); const b = mesh(BOX(0.06, 0.18, 0.5), MAT.gunDark, e.A[0] + (e.B[0] - e.A[0]) * t + e.nx * 0.27, 3.12, e.A[1] + (e.B[1] - e.A[1]) * t + e.nz * 0.27); b.rotation.y = e.rot; }
  // wall-base contact shadow
  const g = group(e.mx, 0.005, e.mz, e.rot); const pl = mesh(new THREE.PlaneGeometry(e.len, 0.7), new THREE.MeshBasicMaterial({ map: wallAoTex, transparent: true, opacity: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), 0, 0, 0.35, g); pl.rotation.x = -Math.PI / 2; DECALS.push(pl);
});
// structural ribs at every corner, carried overhead as beams to the coffer
ROOM.forEach(([x, z]) => {
  const dx = CX - x, dz = CZ - z, dl = Math.hypot(dx, dz), ux = dx / dl, uz = dz / dl, rot = Math.atan2(ux, uz);
  const px = x + ux * 0.2, pz = z + uz * 0.2; extraObs.push({ x: px, z: pz, r: 0.26 });
  const g = group(px, 0, pz, rot);
  mesh(RBOX(0.42, WALL_H, 0.3, 0.025), MAT.gun, 0, WALL_H / 2, 0, g);
  mesh(RBOX(0.5, 0.16, 0.36, 0.02), MAT.steel, 0, 0.08, 0, g);
  mesh(RBOX(0.5, 0.12, 0.36, 0.02), MAT.steel, 0, 1.0, 0, g);
  mesh(BOX(0.05, 1.3, 0.02), SLOT, 0, 1.85, 0.16, g);
  [-0.15, 0.15].forEach((sx) => { for (let k = 0; k < 6; k++) mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 8), MAT.steel, sx, 1.2 + k * 0.32, 0.155, g).rotation.x = Math.PI / 2; });
  // beam
  const qx = COFFER.x - ux * -0, qz = COFFER.z; const vx = px - qx, vz = pz - qz, vl = Math.hypot(vx, vz);
  const ex = qx + vx / vl * (COFFER.r + 0.05), ez = qz + vz / vl * (COFFER.r + 0.05);
  const bl = Math.hypot(px - ex, pz - ez);
  const beam = group((px + ex) / 2, WALL_H - 0.12, (pz + ez) / 2, Math.atan2(px - ex, pz - ez));
  mesh(RBOX(0.3, 0.24, bl, 0.025), MAT.gun, 0, 0, 0, beam);
  mesh(BOX(0.04, 0.02, bl - 0.4), SLOT, 0, -0.125, 0, beam);
});

// ---------- screens ----------
const screens = [];
const byStation = {};
const SHEEN_MAT = (() => { const c = cnv(256, 256), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, 'rgba(255,255,255,0.0)'); gr.addColorStop(0.18, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.32, 'rgba(255,255,255,0.08)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.0)'); gr.addColorStop(0.86, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0.0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }); })();
function addScreen(parent, w, h, cw, ch, kind, station, title, code) {
  const c = cnv(cw, ch), g = c.getContext('2d'), t = tex(c);
  const mat = patchScreen(new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); parent.add(m);
  screenGlass(m, w, h); // smudged glass over every display and touch panel
  const s = { c, g, tex: t, mat, w: cw, h: ch, kind, station, title, code, mesh: m, seed: screens.length * 7 + 3 };
  screens.push(s); (byStation[station] = byStation[station] || []).push(s);
  return s;
}
const hitVolumes = [];
function addHit(geo, data, parent, x, y, z) {
  const m = new THREE.Mesh(geo, MAT.hit); m.position.set(x, y, z); m.visible = false;
  Object.assign(m.userData, data); (parent || scene).add(m); hitVolumes.push(m); return m;
}
// a framed, slightly recessed display
function display(parent, w, h, cw, ch, kind, station, title, code) {
  mesh(RBOX(w + 0.14, h + 0.14, 0.07, 0.02), MAT.gunDark, 0, 0, -0.035, parent);
  mesh(BOX(w + 0.02, h + 0.02, 0.01), new THREE.MeshBasicMaterial({ color: 0x000000 }), 0, 0, -0.005, parent);
  const s = addScreen(parent, w, h, cw, ch, kind, station, title, code); s.mesh.position.z = 0.006; return s;
}

// ---------- seating (sculpted) ----------
const _xg = new Map();
function extrudeX(key, build, depth, bevel) {
  if (_xg.has(key)) return _xg.get(key);
  const geo = new THREE.ExtrudeGeometry(build(), { depth: Math.max(0.002, depth - 2 * bevel), bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 10 });
  geo.translate(0, 0, -(depth - 2 * bevel) / 2); _xg.set(key, geo); return geo;
}
// side-profile shapes are drawn with x = forward, y = up, then turned so x points to -z
function sideGeo(key, build, width, bevel) { const k = 'side:' + key; if (_xg.has(k)) return _xg.get(k); const g = extrudeX(k + ':raw', build, width, bevel).clone(); g.rotateY(Math.PI / 2); _xg.set(k, g); return g; }
function backShape(wb, ws, wt, h, r) {
  const s = new THREE.Shape();
  s.moveTo(-wb / 2, 0); s.lineTo(wb / 2, 0);
  s.quadraticCurveTo(ws / 2 + 0.03, h * 0.32, ws / 2, h * 0.66);
  s.lineTo(wt / 2, h - r); s.quadraticCurveTo(wt / 2, h, wt / 2 - r, h);
  s.lineTo(-wt / 2 + r, h); s.quadraticCurveTo(-wt / 2, h, -wt / 2, h - r);
  s.lineTo(-ws / 2, h * 0.66); s.quadraticCurveTo(-ws / 2 - 0.03, h * 0.32, -wb / 2, 0);
  return s;
}
// ---------- chairs (rebuilt): upholstered, on a swivel, and they move when you brush past ----------
// Cushions are "pillows": a finely divided box with rounded edges, puffed on its face and bent to wrap the sitter.
// Every chair sits on a pedestal; the seat, back and arms ride a swivel that spins and rocks when the player
// brushes past (chairsUpdate, called from the frame loop), then slowly settles back.
const _pillows = new Map();
function pillow(w, h, d, r, puff, axis, bend, key, taper) {
  const k = key || [w, h, d, r, puff, axis, bend, taper || 0].join(','); if (_pillows.has(k)) return _pillows.get(k);
  const g = new THREE.BoxGeometry(w, h, d, 10, Math.max(2, Math.round(h / 0.04)), 10), p = g.attributes.position, v = new THREE.Vector3(), q = new THREE.Vector3();
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); q.set(clamp(v.x, -hx, hx), clamp(v.y, -hy, hy), clamp(v.z, -hz, hz));
    const n = v.clone().sub(q); if (n.lengthSq() > 1e-10) v.copy(q.add(n.normalize().multiplyScalar(r)));
    const fx = 1 - (v.x / (w / 2)) ** 2, fy = 1 - (v.y / (h / 2)) ** 2, fz = 1 - (v.z / (d / 2)) ** 2;
    if (axis === 'y' && v.y > 0) v.y += puff * Math.max(0, fx) * Math.max(0, fz);
    if (axis === '-z' && v.z < 0) v.z -= puff * Math.max(0, fx) * Math.max(0, fy);
    if (axis === '+z' && v.z > 0) v.z += puff * Math.max(0, fx) * Math.max(0, fy);
    if (taper) v.x *= 1 - taper * (v.y / h + 0.5); // narrower toward the top, like a moulded shell
    if (bend) v.z += bend * v.x * v.x; // wrap round the sitter
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); _pillows.set(k, g); return g;
}
let _baseGeo = null;
const CHAIR_BASE_MAT = triSurface(new THREE.MeshStandardMaterial({ color: 0x45433f, metalness: 0.85, roughness: 0.34, envMapIntensity: 0.6 }), { set: 'steel', metres: 0.45, ns: 0.5, rv: 0.7, low: 0.3 });
function chairBase() {
  if (_baseGeo) return _baseGeo;
  const pts = [[0, 0], [0.3, 0], [0.315, 0.012], [0.3, 0.028], [0.18, 0.05], [0.085, 0.08], [0.06, 0.12], [0.05, 0.3], [0.07, 0.33], [0.075, 0.36], [0, 0.36]].map(([x, y]) => new THREE.Vector2(x, y));
  _baseGeo = new THREE.LatheGeometry(pts, 40); return _baseGeo;
}
// moulded shell: smooth satin composite, warm dark grey (no cast-metal grain, which read as stone)
const MAT_SHELL = new THREE.MeshStandardMaterial({ color: 0x2e2a27, metalness: 0.1, roughness: 0.5, envMapIntensity: 0.4 });
const CHAIRS = [];
// Chairs (pass 3): one sculpted shell rather than stacked boxes. A single side profile (seat flowing round a soft
// corner into a reclined back) is extruded across the chair; one continuous cushion follows it from a waterfall front
// edge up the back; side wings sweep from the seat up the back edge. Lower, wider and more reclined than before.
// kinds: captain (widest, tallest back, padded arms), xo (tall back, padded arms), station (mid back), dining (low).
const CHAIR_DIM = { captain: { H: 0.7, arm: true }, xo: { H: 0.66, arm: true }, station: { H: 0.56, arm: false }, dining: { H: 0.48, arm: false } };
const RECLINE = 0.3; // back leans about 17 degrees
// profile helpers: x = forward, y = up (sideGeo turns x to face -z, the way the sitter faces)
function chairLines(H) {
  const B0 = new THREE.Vector2(-0.17, 0.16), B1 = new THREE.Vector2(-0.17 - (H - 0.16) * RECLINE, H);
  const d = B1.clone().sub(B0).normalize(), nf = new THREE.Vector2(d.y, -d.x); // nf: out of the back toward the sitter
  return { B0, B1, nf, at: (P, k) => P.clone().add(nf.clone().multiplyScalar(k)) };
}
function shellShape(H) {
  const { B0, B1, at } = chairLines(H), o = -0.045, s = new THREE.Shape();
  const B0o = at(B0, o), B1o = at(B1, o);
  s.moveTo(0.27, 0.07); s.lineTo(-0.08, 0.07); s.quadraticCurveTo(-0.17, 0.07, B0.x, B0.y); s.lineTo(B1.x, B1.y);
  s.quadraticCurveTo(B1.x - 0.005, B1.y + 0.03, (B1.x + B1o.x) / 2, B1.y + 0.03); s.quadraticCurveTo(B1o.x, B1o.y + 0.025, B1o.x, B1o.y);
  s.lineTo(B0o.x, B0o.y - 0.02); s.quadraticCurveTo(-0.2, 0.025, -0.1, 0.02); s.lineTo(0.22, 0.02); s.quadraticCurveTo(0.28, 0.02, 0.28, 0.05); s.closePath();
  return s;
}
function cushionShape(H) {
  const { B0, B1, at } = chairLines(H), t = 0.07, s = new THREE.Shape();
  const B0c = at(B0, t), top = at(B1, t).add(new THREE.Vector2(0.008, -0.04));
  s.moveTo(0.25, 0.07); s.quadraticCurveTo(0.295, 0.07, 0.295, 0.11); s.quadraticCurveTo(0.295, 0.148, 0.24, 0.148);
  s.lineTo(-0.01, 0.142); s.quadraticCurveTo(B0c.x + 0.02, 0.142, B0c.x, B0c.y + 0.02); s.lineTo(top.x, top.y);
  s.quadraticCurveTo(top.x - 0.01, B1.y + 0.012, B1.x + 0.005, B1.y - 0.004); s.lineTo(B0.x, B0.y); s.quadraticCurveTo(-0.17, 0.07, -0.08, 0.07); s.closePath();
  return s;
}
// side wing: covers the seat side, rises to an arm line, then follows the back's rear edge up to the shoulder
function wingShape(H, arm) {
  const { B0, B1, at } = chairLines(H), o = -0.045, s = new THREE.Shape(), ay = arm ? 0.27 : 0.19;
  const B1o = at(B1, o), sh = at(B0.clone().lerp(B1, 0.82), 0.02);
  s.moveTo(0.25, 0.02); s.quadraticCurveTo(0.27, ay, 0.16, ay); s.lineTo(-0.02, ay);
  s.quadraticCurveTo(-0.13, ay, sh.x, sh.y); s.quadraticCurveTo(B1.x + 0.01, B1.y - 0.02, B1o.x, B1o.y - 0.04);
  s.lineTo(at(B0, o).x, at(B0, o).y - 0.02); s.quadraticCurveTo(-0.2, 0.025, -0.1, 0.02); s.closePath();
  return s;
}
function makeChair(parent, kind, leather) {
  const g = new THREE.Group(); parent.add(g);
  const cap = kind === 'captain', dine = kind === 'dining', L = leather || MAT.leather, D = CHAIR_DIM[kind] || CHAIR_DIM.station;
  const sx = cap ? 1.1 : dine ? 0.92 : 1.0, H = D.H;
  mesh(chairBase(), CHAIR_BASE_MAT, 0, 0, 0, g);
  const sw = group(0, 0.36, 0, 0, g); sw.scale.set(sx, 1, sx); // the swivel: everything above the pedestal
  const rock = group(0, 0, 0, 0, sw);                            // and a little rock on top of it
  // the shell, the continuous cushion, and the two side wings
  mesh(sideGeo('shell' + H, () => shellShape(H), 0.58, 0.02), MAT_SHELL, 0, 0, 0.04, rock);
  mesh(sideGeo('cush' + H, () => cushionShape(H), 0.5, 0.028), L, 0, 0, 0.04, rock);
  [-1, 1].forEach((sd) => mesh(sideGeo('wing' + H + D.arm, () => wingShape(H, D.arm), 0.04, 0.014), MAT_SHELL, sd * 0.3, 0, 0.04, rock));
  // seams: across the seat, and two across the back, following its lean
  mesh(BOX(0.42, 0.006, 0.008), MAT.leatherDark, 0, 0.146, -0.12, rock);
  const { B0, B1, nf } = chairLines(H);
  [0.3, 0.62].forEach((f) => { const q = B0.clone().lerp(B1, f).add(nf.clone().multiplyScalar(0.071)); const m = mesh(BOX(0.42, 0.008, 0.006), MAT.leatherDark, 0, q.y, 0.04 - q.x, rock); m.rotation.x = -RECLINE; });
  if (D.arm) [-1, 1].forEach((sd) => mesh(pillow(0.08, 0.045, cap ? 0.4 : 0.34, 0.02, 0.008, 'y', 0), L, sd * 0.3, 0.29, -0.04, rock));
  if (cap) { const q = B1.clone(); const m = mesh(BOX(0.3, 0.014, 0.014), STRIP, 0, q.y - 0.12, 0.04 - q.x + 0.07, rock); m.rotation.x = -RECLINE; }
  const c = { g, sw, rock, home: 0, yaw: 0, vel: 0, tilt: 0, tiltV: 0, cap, p: null };
  g.userData.swivel = sw; g.userData.chair = c; CHAIRS.push(c);
  return g;
}
// a chair at rest is rarely square: give each a slight, fixed set-off
function chairRest(c, yaw) { c.home = c.yaw = yaw; c.sw.rotation.y = yaw; }
let _cpx = null, _cpz = null;
function chairsUpdate(dt) {
  if (dt <= 0) return;
  const vx = _cpx === null ? 0 : (player.x - _cpx) / dt, vz = _cpz === null ? 0 : (player.z - _cpz) / dt; _cpx = player.x; _cpz = player.z;
  const sp = Math.hypot(vx, vz), wp = new THREE.Vector3();
  for (const c of CHAIRS) {
    if (!c.p) { c.g.updateWorldMatrix(true, false); c.p = c.g.getWorldPosition(wp).clone(); }
    if (Math.abs(c.p.y - deckY(LIFT.deck)) > 1.5 && !(c.p.y > -0.5 && LIFT.deck === 1)) continue;
    const dx = player.x - c.p.x, dz = player.z - c.p.z, d = Math.hypot(dx, dz);
    if (d < 0.78 && sp > 0.05 && !state.sitting) {
      const touch = 1 - d / 0.78, cross = dx * vz - dz * vx; // which way the brush turns the chair
      c.vel += -cross * 6 * touch * dt; c.tiltV += sp * 1.2 * touch * dt;
    }
    if (c.cap && state.sitting) c.vel += (0 - c.yaw) * 8 * dt - c.vel * 6 * dt;
    else c.vel += (c.home - c.yaw) * 0.35 * dt; // a self-centring swivel brings it back, slowly
    c.vel *= Math.exp(-dt * 2.2); c.vel = clamp(c.vel, -4, 4); c.yaw += c.vel * dt;
    c.tiltV += (-c.tilt * 60 - c.tiltV * 7) * dt; c.tilt += c.tiltV * dt;
    if (Math.abs(c.vel) > 1e-4 || Math.abs(c.tilt) > 1e-4 || Math.abs(c.yaw - c.sw.rotation.y) > 1e-4) { c.sw.rotation.y = c.yaw; c.rock.rotation.x = clamp(c.tilt, -0.08, 0.08); }
  }
}

// ---------- station furniture (shared) ----------
// Stations are built in layers, like working consoles: a sculpted tan pedestal on a dark plinth with an
// alert-coloured underglow, a sloped glass desk with a touch panel and key strip, an upright screen bank,
// and physical details: speaker grilles, ID plates, access panels and lit push-buttons.
const MAT_PED = triSurface(new THREE.MeshStandardMaterial({ color: 0xc9b89d, roughness: 0.55, metalness: 0.05, envMapIntensity: 0.35 }), { set: 'paint', metres: 0.7, ns: 0.6, rv: 0.6, edge: 0.35 });
const MAT_TRIM = triSurface(new THREE.MeshStandardMaterial({ color: 0x3a3632, roughness: 0.42, metalness: 0.5, envMapIntensity: 0.6 }), { set: 'paint', metres: 0.7, ns: 0.8, rv: 0.7, edge: 0.5 });
const GRILLE = (() => {
  const c = cnv(128, 64), g = c.getContext('2d'); g.fillStyle = '#26231f'; g.fillRect(0, 0, 128, 64);
  for (let y = 4; y < 64; y += 6) for (let x = 4 + (y % 12 ? 3 : 0); x < 128; x += 6) { g.fillStyle = '#0b0a09'; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0.4, envMapIntensity: 0.3 });
})();
const BTN_MATS = ['#E8A06A', '#D9B07E', '#B693C4', '#F2C88F', '#C67A86'].map((h) => new THREE.MeshBasicMaterial({ color: new THREE.Color(h).multiplyScalar(0.85), toneMapped: false }));
// Crisp text in 3D space (troika-three-text: glyphs drawn from the font's outlines as signed-distance fields, so the
// edges stay sharp at any distance). Returns null when the library didn't load, so callers fall back to canvas text.
const FONT3D = 'fonts/antonio-600.woff'; // woff, not woff2: troika's parser doesn't read woff2
function text3d(parent, txt, size, color, x, y, z, anchorX) {
  if (!THREE.TroikaText) return null;
  const t = new THREE.TroikaText();
  Object.assign(t, { text: txt, font: FONT3D, fontSize: size, anchorX: anchorX || 'left', anchorY: 'middle', letterSpacing: 0.02, sdfGlyphSize: 64 });
  t.material = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  t.position.set(x, y, z); parent.add(t); t.sync(); return t;
}
function idPlate(parent, code, x, y, z, w) {
  const crisp = !!THREE.TroikaText, c = cnv(256, 64), g = c.getContext('2d'); g.fillStyle = '#b9a789'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#2b2229'; g.fillRect(6, 6, 244, 52);
  g.fillStyle = '#E8A06A'; g.fillRect(6, 6, 36, 52);
  if (!crisp) { g.fillStyle = '#F5E6CF'; g.font = `600 30px ${DISP}`; g.textBaseline = 'middle'; g.fillText(code, 54, 33); }
  const m = mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.4, metalness: 0.6 }), x, y, z, parent);
  if (crisp) text3d(m, code, w * 0.13, 0xF5E6CF, -w / 2 + w * 54 / 256, 0, 0.0015);
  return m;
}
function grille(parent, x, y, z, w, h) { const m = mesh(new THREE.PlaneGeometry(w, h), GRILLE.clone(), x, y, z, parent); m.material.map = GRILLE.map.clone(); m.material.map.repeat.set(w / 0.3, h / 0.15); m.material.map.needsUpdate = true; return m; }
function buttons(parent, n, x0, x1, y, z, seed) {
  const r = mulberry(seed);
  for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * (n === 1 ? 0.5 : i / (n - 1)); mesh(RBOX(0.045, 0.022, 0.03, 0.008), BTN_MATS[(r() * BTN_MATS.length) | 0], x, y, z, parent); }
}


const MAT_PAD = triSurface(new THREE.MeshStandardMaterial({ color: 0x080b12, roughness: 0.62, metalness: 0.04, envMapIntensity: 0.25 }), { set: 'leather', metres: 0.3, ns: 1.6, rv: 0.8, low: 0 });
const MAT_FRAME = triSurface(new THREE.MeshStandardMaterial({ color: 0x423d37, roughness: 0.5, metalness: 0.06, envMapIntensity: 0.35 }), { set: 'paint', metres: 0.7, ns: 0.5, rv: 0.5, edge: 0.3 });
const MAT_BEZEL = triSurface(new THREE.MeshStandardMaterial({ color: 0x332e29, roughness: 0.5, metalness: 0.05, envMapIntensity: 0.35 }), { set: 'paint', metres: 0.7, ns: 0.6, rv: 0.6, edge: 0.35 });
const MAT_SLAT = new THREE.MeshStandardMaterial({ color: 0x1e1c1a, roughness: 0.38, metalness: 0.55, envMapIntensity: 0.6 });
const MAT_VOID = new THREE.MeshBasicMaterial({ color: 0x000000 });
const TAG_MAT = new THREE.MeshStandardMaterial({ color: 0x5a1a1e, roughness: 0.45, metalness: 0.2, envMapIntensity: 0.4 });
const TAG_INK = new THREE.MeshBasicMaterial({ color: 0xE8D8C0, toneMapped: false });
// many small boxes merged into one mesh (the grille slats), so the run stays a handful of draw calls
const _merged = new Map();
function mergedBoxes(key, list) {
  if (_merged.has(key)) return _merged.get(key);
  const parts = list.map(([w, h, d, x, y, z]) => new THREE.BoxGeometry(w, h, d).translate(x, y, z).toNonIndexed());
  const n = parts.reduce((a, q) => a + q.attributes.position.count, 0), out = new THREE.BufferGeometry();
  ['position', 'normal', 'uv'].forEach((k) => { const sz = parts[0].attributes[k].itemSize, arr = new Float32Array(n * sz); let o = 0; parts.forEach((q) => { arr.set(q.attributes[k].array, o); o += q.attributes[k].array.length; }); out.setAttribute(k, new THREE.BufferAttribute(arr, sz)); });
  _merged.set(key, out); return out;
}
// a soft glow that a display throws onto the bezel around it: a frame-shaped additive card, clear in the middle
const _spill = new Map();
function spillTex(ax, ay) {
  const k = ax.toFixed(2) + 'x' + ay.toFixed(2); if (_spill.has(k)) return _spill.get(k);
  const W = 256, H = Math.max(32, Math.round(256 * ay)), c = cnv(W, H), g = c.getContext('2d'), mx = W * 0.16, my = H * 0.16 / ay;
  g.shadowColor = 'rgba(255,214,170,1)'; g.shadowBlur = Math.min(mx, my) * 0.9; g.fillStyle = 'rgba(255,214,170,1)'; g.fillRect(mx, my, W - 2 * mx, H - 2 * my);
  g.shadowBlur = 0; g.globalCompositeOperation = 'destination-out'; g.fillRect(mx + 1, my + 1, W - 2 * mx - 2, H - 2 * my - 2);
  const t = tex(c); _spill.set(k, t); return t;
}
function spill(parent, w, h, strength) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.47, h + w * 0.47), new THREE.MeshBasicMaterial({ map: spillTex(1, (h + w * 0.47) / (w * 1.47)), transparent: true, opacity: strength, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  parent.add(m); return m;
}
// a desktop that is one display: a black bed, the desk screen (kind 'desk', drawing the station's own readouts in
// its middle panel), its glow on the bezel, and optionally a small hooded viewer standing up behind it.
// d: a group whose +y is up out of the desk and +z toward the sitter; yTop: the bezel's top surface.
// Desk displays lie nearly flat and look straight up at the ceiling lights, so their smudged glass reflects at a
// fraction of the strength of the upright screens' glass (otherwise the whole desktop washes out white).
const DESK_GLASS = copyPatches(GLASS_MAT, GLASS_MAT.clone()); DESK_GLASS.opacity = 0.22;
SURF.ready().then(() => { DESK_GLASS.roughnessMap = GLASS_MAT.roughnessMap; DESK_GLASS.needsUpdate = true; });
function deskSurface(d, W, dd, yTop, zc, p, sub, hoodX) {
  const dw = W - 0.16;
  mesh(BOX(dw + 0.02, 0.004, dd + 0.02), MAT_VOID, 0, yTop - 0.001, zc, d);
  const ds = group(0, yTop + 0.0015, zc, 0, d); ds.rotation.x = -Math.PI / 2;
  const sc = addScreen(ds, dw, dd, 1024, Math.round(1024 * dd / dw), 'desk', p.id, p.title, p.code); sc.sub = sub;
  sc.mesh.children.forEach((c) => { if (c.material === GLASS_MAT) c.material = DESK_GLASS; });
  const dsp = spill(ds, dw, dd, 0.12); dsp.position.z = 0.002;
  if (hoodX === undefined) return;
  const hv = group(hoodX, yTop - 0.0025, zc - dd / 2 - 0.07, 0, d);
  mesh(RBOX(0.36, 0.1, 0.15, 0.025), MAT_BEZEL, 0, 0.05, 0, hv);
  mesh(RBOX(0.38, 0.022, 0.19, 0.01), MAT_BEZEL, 0, 0.105, 0.02, hv);
  mesh(BOX(0.3, 0.058, 0.01), MAT_VOID, 0, 0.052, 0.074, hv);
  const vs = group(0, 0.052, 0.08, 0, hv); vs.rotation.x = -0.12; addScreen(vs, 0.28, 0.05, 336, 60, 'scope', p.id, p.title, p.code);
}
// a low desk in front of a dais seat; screens tilt toward the seat (+z)
function lowDesk(x, z, rot, w, kind, station, title, code) {
  const g = group(x, DAIS.h, z, rot);
  mesh(RBOX(w, 0.56, 0.42, 0.05), MAT_PED, 0, 0.32, 0, g);
  [-1, 1].forEach((sd) => mesh(RBOX(0.04, 0.58, 0.44, 0.015), MAT_TRIM, sd * (w / 2 + 0.01), 0.32, 0, g));
  mesh(RBOX(w - 0.08, 0.06, 0.32, 0.02), MAT.gunDark, 0, 0.03, 0, g);
  mesh(BOX(w - 0.12, 0.016, 0.016), STRIP, 0, 0.05, 0.17, g);
  grille(g, 0, 0.3, 0.212, w * 0.5, 0.12);
  const top = group(0, 0.62, 0, 0, g); top.rotation.x = 0.32;
  mesh(RBOX(w + 0.04, 0.05, 0.52, 0.02), MAT_BEZEL, 0, 0, 0, top);
  mesh(pillow(w + 0.04, 0.06, 0.08, 0.025, 0.006, 'y', 0), MAT_PAD, 0, 0.004, 0.29, top);
  deskSurface(top, w + 0.04, 0.4, 0.025, 0.0, { id: station, title, code }, kind);
  addHit(BOX(w + 0.2, 1.2, 1.3), { station }, g, 0, 0.6, 0.45);
  return g;
}

// ---------- command dais: XO | Captain | Tactical ----------
mesh(new THREE.CylinderGeometry(DAIS.r, DAIS.r + 0.04, DAIS.h, 72), [MAT.gun, MAT.dais, MAT.gun], DAIS.x, DAIS.h / 2, DAIS.z);
{ const t = mesh(new THREE.TorusGeometry(DAIS.r + 0.01, 0.025, 8, 120), MAT.steel, DAIS.x, DAIS.h, DAIS.z); t.rotation.x = Math.PI / 2; }
{ const t = mesh(new THREE.TorusGeometry(DAIS.r + 0.03, 0.012, 6, 120), STRIP, DAIS.x, DAIS.h - 0.05, DAIS.z); t.rotation.x = Math.PI / 2; }
ao(DAIS.x, DAIS.z, DAIS.r * 2.6, DAIS.r * 2.6, 0.55);
const capChair = group(0, DAIS.h, 0.45); const capSw = makeChair(capChair, 'captain').userData.swivel;
[-1, 1].forEach((sd) => { const sg = group(sd * 0.29, 0.33, -0.12, 0, capSw); const sc = addScreen(sg, 0.06, 0.26, 128, 352, 'cmd', 'command', 'Command', 'CMD'); sc.mesh.rotation.x = -Math.PI / 2 + 0.06; });
ao(0, 0.45, 1.2, 1.2, 0.6, DAIS.h);
addHit(BOX(1.0, 1.8, 1.0), { station: 'command' }, null, 0, DAIS.h + 0.9, 0.45);
const SEAT_XO = { x: -1.3, z: 0.65 }, SEAT_TAC = { x: 1.3, z: 0.65 };
const xoSeat = group(SEAT_XO.x, DAIS.h, SEAT_XO.z, -0.1); makeChair(xoSeat, 'xo');
const tacSeat = group(SEAT_TAC.x, DAIS.h, SEAT_TAC.z, 0.1); makeChair(tacSeat, 'xo');
lowDesk(SEAT_XO.x - 0.07, SEAT_XO.z - 0.72, -0.1, 0.95, 'ops', 'ops', 'First Officer', 'XO·00');
lowDesk(SEAT_TAC.x + 0.07, SEAT_TAC.z - 0.72, 0.1, 1.05, 'tac', 'defense', 'Tactical', 'TAC·01');
[SEAT_XO, SEAT_TAC].forEach((p) => { ao(p.x, p.z - 0.3, 1.2, 1.6, 0.6, DAIS.h); });
const TAC = { x: SEAT_TAC.x, z: SEAT_TAC.z };

// ---------- flight and operations pods ----------
// Seen from the side: a wedge that leans toward the viewscreen, with a recess for the operator's knees.
// The operator sits aft (+z); the sloped glass top faces them; the front face carries a second screen and a grille.
function podShape() { const s = new THREE.Shape(); s.moveTo(-0.08, 0); s.lineTo(0.34, 0); s.lineTo(0.44, 0.9); s.quadraticCurveTo(0.45, 0.95, 0.4, 0.95); s.lineTo(-0.36, 0.76); s.lineTo(-0.36, 0.69); s.quadraticCurveTo(-0.14, 0.62, -0.1, 0.42); s.closePath(); return s; }
function pod(x, z, station, kindA, titleA, codeA) {
  const g = group(x, 0, z, 0);
  mesh(sideGeo('pod-body', podShape, 1.24, 0.03), MAT_PED, 0, 0.07, 0, g);
  [-1, 1].forEach((sd) => mesh(sideGeo('pod-cheek', podShape, 0.05, 0.015), MAT_TRIM, sd * 0.64, 0.07, 0, g));
  mesh(RBOX(1.18, 0.08, 0.36, 0.02), MAT.gunDark, 0, 0.04, 0.12, g);
  mesh(BOX(1.1, 0.018, 0.018), STRIP, 0, 0.05, -0.08, g);
  [-1, 1].forEach((sd) => mesh(BOX(0.018, 0.018, 0.3), STRIP, sd * 0.56, 0.05, 0.12, g));
  // sloped top: one desk display under a thick bezel, a padded lip toward the operator, a hooded viewer behind
  const top = group(0, 0.07 + 0.86, 0.02, 0, g); top.rotation.x = 0.235;
  mesh(RBOX(1.3, 0.07, 0.84, 0.024), MAT_BEZEL, 0, 0.0, 0, top);
  mesh(pillow(1.3, 0.07, 0.08, 0.028, 0.006, 'y', 0), MAT_PAD, 0, 0.004, 0.45, top);
  deskSurface(top, 1.3, 0.46, 0.035, 0.06, { id: station, title: titleA, code: codeA }, kindA, -0.3);
  // front face toward the viewscreen: a second screen, the grille and the station plate
  const f = group(0, 0.07, -0.455, Math.PI, g); f.rotation.x = 0.11;
  const fs = group(0, 0.7, 0.012, 0, f); display(fs, 0.66, 0.24, 420, 152, kindA, station, titleA, codeA);
  grille(f, 0, 0.36, 0.02, 0.66, 0.2);
  idPlate(f, codeA, 0, 0.2, 0.022, 0.26);
  addHit(BOX(1.6, 1.5, 1.0), { station }, g, 0, 0.75, 0);
  const ch = makeChair(scene, 'station'); ch.position.set(x, 0, z + 0.7); chairRest(ch.userData.chair, (x > 0 ? -1 : 1) * 0.12);
  ao(x, z, 1.8, 1.2, 0.65); ao(x, z + 0.7, 0.9, 0.9, 0.55);
  pool(x, z + 0.45, 1.6, 1.0, 0xffe2c8, 0.12);
  return g;
}
pod(-1.4, -3.15, 'helm', 'helm', 'Flight', 'FLT·01');
pod(1.4, -3.15, 'ops', 'ops', 'Operations', 'OPS·02');

// ---------- side console runs (three positions each) ----------
const RUNS = [
  { side: -1, posts: [{ id: 'science', kind: 'sci', title: 'Science', code: 'SCI·03', z: -1.55 }, { id: 'intel', kind: 'intel', title: 'Intelligence', code: 'INT·04', z: 0 }, { id: 'comms', kind: 'com', title: 'Communications', code: 'COM·05', z: 1.55 }] },
  { side: 1, posts: [{ id: 'engineering', kind: 'sys', title: 'Engineering', code: 'ENG·06', z: -1.55 }, { id: 'env', kind: 'env', title: 'Environment', code: 'ENV·07', z: 0 }, { id: 'damage', kind: 'dmg', title: 'Damage Control', code: 'DMG·08', z: 1.55 }] },
];
const DOWNLIGHTS = [[-1.4, -3.15], [1.4, -3.15], [0, 3.55]];
// Workstation furniture (screens pass 3). The screens are the furniture: each position is a deep sloped desk whose
// whole top is one display under a thick bezel with a padded dark lip, a small hooded viewer standing up at the back,
// a ribbed grille band on the wall behind, and the upper displays let into a thick wall frame with deep cut-outs and
// a lit ledge. Below the desk, a recessed apron of padded panels. Local axes: x along the run, +z toward the room,
// the wall face at z = -0.34.
// the frame that holds the upper displays: one thick extruded panel with rounded cut-outs
function cutFrame(key, W, H, holes) {
  const k = 'cut:' + key; if (_xg.has(k)) return _xg.get(k);
  const s = new THREE.Shape(); s.moveTo(-W / 2, -H / 2); s.lineTo(W / 2, -H / 2); s.lineTo(W / 2, H / 2); s.lineTo(-W / 2, H / 2); s.closePath();
  holes.forEach(([cx, cy, hw, hh, r]) => { const p = new THREE.Path(), x0 = cx - hw / 2, y0 = cy - hh / 2; p.moveTo(x0 + r, y0); p.lineTo(x0 + hw - r, y0); p.quadraticCurveTo(x0 + hw, y0, x0 + hw, y0 + r); p.lineTo(x0 + hw, y0 + hh - r); p.quadraticCurveTo(x0 + hw, y0 + hh, x0 + hw - r, y0 + hh); p.lineTo(x0 + r, y0 + hh); p.quadraticCurveTo(x0, y0 + hh, x0, y0 + hh - r); p.lineTo(x0, y0 + r); p.quadraticCurveTo(x0, y0, x0 + r, y0); s.holes.push(p); });
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.13, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 6 });
  _xg.set(k, geo); return geo;
}
const DESK = { y: 0.8, z: 0.02, tilt: 0.14, depth: 0.76 };
// one bay of the console run, wallW wide, centred on lx; with a post (p) it carries that station's displays
const FH = 0.84, FY = 1.33 + FH / 2;
function bay(parent, lx, wallW, p, holes) {
  const b = group(lx, 0, 0, 0, parent), W = wallW - 0.012;
  // kick plinth with its underglow, the recessed apron and its padded panels
  mesh(RBOX(W, 0.1, 0.34, 0.02), MAT.gunDark, 0, 0.05, -0.14, b);
  mesh(BOX(W - 0.06, 0.016, 0.016), STRIP, 0, 0.06, 0.04, b);
  mesh(RBOX(W, 0.62, 0.36, 0.02), MAT_TRIM, 0, 0.41, -0.15, b);
  const np = Math.max(1, Math.round(W / 0.4)), pw = W / np;
  for (let i = 0; i < np; i++) mesh(pillow(pw - 0.026, 0.56, 0.05, 0.02, 0.012, '+z', 0), MAT_PAD, -W / 2 + pw * (i + 0.5), 0.41, 0.05, b);
  // the desk: a thick bezel sloping toward the sitter, a padded lip along the front edge
  const d = group(0, DESK.y, DESK.z, 0, b); d.rotation.x = DESK.tilt;
  mesh(RBOX(W, 0.065, DESK.depth, 0.028), MAT_BEZEL, 0, 0, 0, d);
  mesh(pillow(W, 0.07, 0.1, 0.03, 0.008, 'y', 0), MAT_PAD, 0, 0.006, DESK.depth / 2 + 0.035, d);
  // the wall behind: a ribbed grille band, then the frame for the upper displays on a lit ledge, then the status shelf
  mesh(BOX(W, 0.44, 0.02), MAT.gunDark, 0, 1.1, -0.33, b);
  const slats = []; for (let k = 0; k < 15; k++) slats.push([W - 0.03, 0.011, 0.028, 0, 0.905 + k * 0.0275, 0]);
  mesh(mergedBoxes('slats' + W.toFixed(3), slats), MAT_SLAT, 0, 0, -0.31, b);
  mesh(RBOX(W, 0.035, 0.2, 0.012), MAT_FRAME, 0, 1.315, -0.24, b);
  mesh(BOX(W - 0.04, 0.012, 0.012), STRIP, 0, 1.295, -0.145, b);
  mesh(RBOX(W, 0.24, 0.3, 0.03), MAT_TRIM, 0, 2.3, -0.2, b);
  if (!p) return { b, d };
  const w = W - 0.14, mw = w * 0.72, aw = w - mw - 0.08, sh = 0.56, mx = -w / 2 + mw / 2, ax = w / 2 - aw / 2;
  if (holes) holes.push([lx + mx, 0.01, mw + 0.07, sh + 0.08, 0.05], [lx + ax, 0.01, aw + 0.07, sh + 0.08, 0.05]);
  // displays sit at the back of the cut-outs, inside a dark inner bezel
  [[mx, mw, p.kind], [ax, aw, 'aux']].forEach(([x, sw, kind]) => {
    const sg = group(x, FY + 0.01, -0.285, 0, b);
    mesh(RBOX(sw + 0.05, sh + 0.05, 0.03, 0.012), MAT.gunDark, 0, 0, -0.016, sg);
    const s = addScreen(sg, sw, sh, Math.round(700 * sw / sh), 700, kind, p.id, p.title, p.code); s.mesh.position.z = 0.002;
    const sp = spill(sg, sw, sh, 0.1); sp.position.z = 0.004;
  });
  const sg = group(0, 2.3, -0.048, 0, b); sg.rotation.x = 0.35; addScreen(sg, w, 0.13, 760, 80, 'strip', p.id, p.title, p.code);
  // small dark-red tags in the frame's top margin over each display, like stencilled panel labels
  [[mx - mw / 2 + 0.09, 'A'], [ax - aw / 2 + 0.07, 'B']].forEach(([tx, sfx], i) => {
    const tg = mesh(BOX(0.13, 0.03, 0.004), TAG_MAT, tx, FY + FH / 2 - 0.045, -0.184, b);
    mesh(BOX(0.022, 0.018, 0.002), TAG_INK, -0.045, 0, 0.003, tg);
    if (!text3d(tg, String(p.code).replace('·', ' ') + sfx, 0.016, 0xE8D8C0, -0.028, 0, 0.0025)) mesh(BOX(0.07, 0.004, 0.002), TAG_INK, 0.015, 0, 0.003, tg);
  });
  idPlate(b, p.code, -W / 2 + 0.2, 1.315, -0.138, 0.2);
  // the desk display fills the desk; a hooded viewer stands up at the back on the left
  deskSurface(d, W, 0.46, 0.0325, 0.03, p, p.kind, -W * 0.26);
  return { b, d };
}
// the run-wide body: end fins with a lit pillar in each, and plain bays filling from the last post out to the fins
function consoleBody(g, L, used, holes) {
  mesh(cutFrame('run' + L + ':' + holes.map((h) => h[0].toFixed(3)).join(','), L, FH, holes), MAT_FRAME, 0, FY, -0.34 + 0.012, g);
  [-1, 1].forEach((sd) => {
    mesh(RBOX(0.08, 2.36, 0.74, 0.025), MAT_FRAME, sd * (L / 2 + 0.04), 1.18, -0.02, g);
    mesh(BOX(0.02, 2.2, 0.02), MAT_TRIM, sd * (L / 2 + 0.04), 1.18, 0.35, g);
    mesh(RBOX(0.05, 1.5, 0.03, 0.012), SLOT, sd * (L / 2 + 0.04), 1.3, 0.36, g);
    const fw = (L - used) / 2; if (fw > 0.05) bay(g, sd * (used / 2 + fw / 2), fw, null);
  });
}
function post(parent, lx, p, wallW, holes) {
  const st = group(lx, 0, 0, 0, parent);
  bay(parent, lx, wallW, p, holes);
  addHit(BOX(Math.min(1.5, wallW + 0.1), 2.6, 1.3), { station: p.id }, st, 0, 1.3, 0.1);
  st.updateWorldMatrix(true, false);
  const cw = new THREE.Vector3(); st.localToWorld(cw.set(0, 0, 1.02));
  const ch = makeChair(scene, 'station'); ch.position.set(cw.x, 0, cw.z); ch.rotation.y = parent.rotation.y; chairRest(ch.userData.chair, Math.sin(cw.x * 7 + cw.z * 3) * 0.22);
  ao(cw.x, cw.z, 0.9, 0.9, 0.55); extraObs.push({ x: cw.x, z: cw.z, r: 0.36 });
  const pw = new THREE.Vector3(); st.localToWorld(pw.set(0, 0, 0.55)); pool(pw.x, pw.z, 1.3, 1.6, 0xffe2c8, 0.08);
  const dl = new THREE.Vector3(); st.localToWorld(dl.set(0, 0, 0.7)); DOWNLIGHTS.push([dl.x, dl.z]);
}
RUNS.forEach((run) => {
  const rot = -run.side * Math.PI / 2;
  const g = group(run.side * SIDE_X - run.side * 0.34, 0, 0, rot);
  const holes = [];
  run.posts.forEach((p) => post(g, run.side < 0 ? -p.z : p.z, p, 1.55, holes));
  consoleBody(g, 4.7, 1.55 * 3, holes);
  mesh(BOX(4.7, 0.02, 0.02), SLOT, 0, 2.71, -0.03, g);
  const aoc = new THREE.Vector3(); g.updateMatrixWorld(true); g.localToWorld(aoc.set(0, 0, 0)); ao(aoc.x, aoc.z, 1.3, 5.2, 0.6);
});
// ---------- forward-angled walls: Weapons Control and Electronic Warfare ----------
[[1, { id: 'weapons', kind: 'wpn', title: 'Weapons Control', code: 'WPN·09' }], [7, { id: 'ew', kind: 'ew', title: 'Electronic Warfare', code: 'EW·10' }]].forEach(([ei, p]) => {
  const e = EDGES[ei];
  const g = group(e.mx + e.nx * 0.34, 0, e.mz + e.nz * 0.34, e.rot);
  const holes = [];
  post(g, 0, p, 1.9, holes);
  consoleBody(g, 2.1, 1.9, holes);
  g.updateMatrixWorld(true);
  const c1 = new THREE.Vector3(); [-0.7, 0, 0.7].forEach((lx) => { g.localToWorld(c1.set(lx, 0, 0)); extraObs.push({ x: c1.x, z: c1.z, r: 0.4 }); });
  const aoc = new THREE.Vector3(); g.localToWorld(aoc.set(0, 0, 0)); ao(aoc.x, aoc.z, 2.4, 1.4, 0.6);
});
scene.updateMatrixWorld(true);

// ---------- main viewscreen (armored frame) ----------
const VS_W = 5.0, VS_H = 2.25, VS_Y = 1.86, VS_Z = FWD_Z + 0.1;
const rt = new THREE.WebGLRenderTarget(isMobile ? 1024 : 1600, isMobile ? 460 : 720, { type: THREE.HalfFloatType, generateMipmaps: false, samples: 4 });
const vcam = new THREE.PerspectiveCamera(36, VS_W / VS_H, 0.5, 900); vcam.position.set(0, 2, FWD_Z); vcam.layers.set(1);
const vLook = new THREE.Vector3(0, 2, -300), vFwd = new THREE.Vector3(0, 2, -300);
mesh(new THREE.PlaneGeometry(VS_W, VS_H), new THREE.MeshBasicMaterial({ map: rt.texture, color: new THREE.Color(1.24, 1.24, 1.24) }), 0, VS_Y, VS_Z); // a touch brighter than the raw render
const ovC = cnv(1024, 460), ovG = ovC.getContext('2d'), ovTex = tex(ovC);
const ovMat = new THREE.MeshBasicMaterial({ map: ovTex, transparent: true, toneMapped: false, depthWrite: false, opacity: 0 });
mesh(new THREE.PlaneGeometry(VS_W, VS_H), ovMat, 0, VS_Y, VS_Z + 0.01);
// rounded picture edge with a soft inner falloff, so the image sits inside the bezel like a window rather than a decal
{
  const c = cnv(1024, 460), g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 1024, 460);
  g.globalCompositeOperation = 'destination-out';
  // draw the hole far off-canvas and let only its blurred shadow land in place: a soft inner edge, no bleed past the corners
  g.shadowColor = '#000'; g.shadowBlur = 18; g.shadowOffsetX = 4000; g.beginPath(); g.roundRect(44 - 4000, 40, 936, 380, 40); g.fill(); g.shadowOffsetX = 0;
  g.globalCompositeOperation = 'source-over'; g.shadowBlur = 0;
  const top = g.createLinearGradient(0, 24, 0, 90); top.addColorStop(0, 'rgba(0,0,0,0.45)'); top.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = top; g.fillRect(0, 0, 1024, 90);
  mesh(new THREE.PlaneGeometry(VS_W, VS_H), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, toneMapped: false, depthWrite: false }), 0, VS_Y, VS_Z + 0.02);
  // the glass: only its reflections show (black albedo, additive), catching the bridge lights as you move
  mesh(new THREE.PlaneGeometry(VS_W, VS_H), new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.06, metalness: 0, envMapIntensity: 0.9, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false }), 0, VS_Y, VS_Z + 0.03);
}
{
  const fz = FWD_Z + 0.2, OP = 0.11; // OP: the armoured frame stands this far out from the picture, round a chamfered reveal
  mesh(RBOX(VS_W + 0.9 + OP * 2, 0.36, 0.34, 0.05), MAT.gun, 0, VS_Y + VS_H / 2 + 0.18 + OP, fz);
  mesh(RBOX(VS_W + 0.9 + OP * 2, 0.42, 0.4, 0.05), MAT.gun, 0, VS_Y - VS_H / 2 - 0.21 - OP, fz + 0.02);
  // the reveal: four dark panels angled from the picture's edge out to the frame's face, so the picture sits back
  // inside the hull like a window, and the edges catch a little of its light
  { const dz = 0.25, z0 = VS_Z + 0.005, ang = Math.atan2(OP, dz), len = Math.hypot(OP, dz);
    [[0, 1, VS_W], [0, -1, VS_W], [1, 0, VS_H], [-1, 0, VS_H]].forEach(([sx, sy, run]) => {
      const pg = group(sx * (VS_W / 2 + OP / 2), VS_Y + sy * (VS_H / 2 + OP / 2), z0 + dz / 2, 0);
      if (sy) { mesh(BOX(run + OP * 2, 0.018, len), MAT.gunDark, 0, 0, 0, pg).rotation.x = -sy * ang; }
      else { mesh(BOX(0.018, run + OP * 2, len), MAT.gunDark, 0, 0, 0, pg).rotation.y = sx * ang; }
    });
  }
  [-1, 1].forEach((sd) => {
    mesh(RBOX(0.42, VS_H + 0.8 + OP * 2, 0.38, 0.05), MAT.gun, sd * (VS_W / 2 + 0.24 + OP), VS_Y, fz);
    const gus = mesh(RBOX(0.36, 0.36, 0.3, 0.03), MAT.steel, sd * (VS_W / 2 + 0.02 + OP), VS_Y + VS_H / 2 - 0.02 + OP, fz + 0.06); gus.rotation.z = Math.PI / 4;
    const gus2 = mesh(RBOX(0.36, 0.36, 0.3, 0.03), MAT.steel, sd * (VS_W / 2 + 0.02 + OP), VS_Y - VS_H / 2 + 0.02 - OP, fz + 0.06); gus2.rotation.z = Math.PI / 4;
    for (let k = 0; k < 7; k++) mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), MAT.steel, sd * (VS_W / 2 + 0.24 + OP), VS_Y - VS_H / 2 + 0.2 + k * 0.32, fz + 0.2).rotation.x = Math.PI / 2;
  });
  mesh(BOX(VS_W + 0.1 + OP * 2, 0.02, 0.02), SLOT, 0, VS_Y + VS_H / 2 + 0.01 + OP, fz - 0.16);
  for (let k = 0; k < 18; k++) mesh(BOX(0.09, 0.03, 0.02), k % 5 === 2 ? new THREE.MeshBasicMaterial({ color: 0x34e89e, toneMapped: false }) : STRIP, -1.53 + k * 0.18, VS_Y - VS_H / 2 - 0.21 - OP + 0.15, fz + 0.23); // above the floor plinth
  mesh(RBOX(VS_W + 1.2, 0.5, 0.5, 0.05), MAT.gunDark, 0, 0.25, FWD_Z + 0.25);
  mesh(MAT.hazard ? BOX(VS_W + 1.1, 0.04, 0.01) : BOX(1, 1, 1), MAT.hazard, 0, 0.52, FWD_Z + 0.5);
  ao(0, FWD_Z + 0.5, VS_W + 2, 1.4, 0.55);
  pool(0, FWD_Z + 1.4, VS_W + 1.2, 2.4, 0x8fb0ff, 0.12);
}
addHit(BOX(VS_W + 1, 3.0, 0.6), { station: 'viewer' }, null, 0, VS_Y, FWD_Z + 0.45);
// Viewscreen readouts stay out of the picture: a small caption fades in when something changes
// (view, speed, system) and fades out again; the magnify reticle stays while magnified.
let ovSig = '', ovUntil = 7;
function drawOverlay() {
  const g = ovG, W = 1024, H = 460, P = pal();
  const sig = `${state.view}|${state.speed}|${state.cur}|${state.alert}`;
  if (sig !== ovSig) { ovSig = sig; ovUntil = elapsed + 5; }
  g.clearRect(0, 0, W, H);
  g.font = `500 20px ${DISP}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  const line1 = state.speed === 'warp' ? `EN ROUTE · ${sysDest().star.toUpperCase()}` : `${sysCur().star.toUpperCase()} SYSTEM · ${sysCur().planet.toUpperCase()}`;
  const line2 = `${state.view === 'target' ? 'MAGNIFIED' : 'FORWARD VIEW'} · ${SPEEDS[state.speed].screen}`;
  const x = 76, y = H - 64, w = Math.max(g.measureText(line1).width, g.measureText(line2).width) + 30;
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x - 10, y - 26, w, 58);
  hexTab(g, x - 52, y - 26, 36, 58, true, false); g.fillStyle = P.acc; g.fill();
  g.fillStyle = P.ice; g.fillRect(x - 10, y + 36, w * 0.6, 6); g.fillStyle = P.tan; g.fillRect(x - 10 + w * 0.6 + 4, y + 36, w * 0.4 - 4, 6);
  g.fillStyle = '#F5E6CF'; g.fillText(line1, x, y); g.fillStyle = P.acc; g.fillText(line2, x, y + 24);
  if (state.view === 'target') {
    g.strokeStyle = P.acc; g.lineWidth = 6; g.globalAlpha = 0.7;
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * 70, H / 2 + Math.sin(a) * 70); g.lineTo(W / 2 + Math.cos(a) * 96, H / 2 + Math.sin(a) * 96); g.stroke(); }
    g.globalAlpha = 1;
  }
  ovTex.needsUpdate = true;
}
function updateViewscreen(dt) {
  const want = (elapsed < ovUntil || state.view === 'target' || state.open === 'viewer') ? 0.95 : 0;
  ovMat.opacity += (want - ovMat.opacity) * Math.min(1, dt * 2.5);
}
function rail(ei, t0, t1, y) {
  const e = EDGES[ei], len = e.len * (t1 - t0), tm = (t0 + t1) / 2;
  const [x, z] = onEdge(ei, tm, 0.1);
  const g = group(x, y, z, e.rot);
  const r = mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 12), MAT.steel, 0, 0, 0, g); r.rotation.z = Math.PI / 2;
  [-0.45, 0, 0.45].forEach((f) => mesh(BOX(0.04, 0.04, 0.12), MAT.steel, f * len, 0, -0.05, g));
}

// ---------- aft wall: ship profile, situation table, lift and ready room ----------
{
  const g = group(0, 2.12, AFT_Z - 0.06, Math.PI);
  display(g, 3.0, 1.2, 2048, 820, 'msd', 'ship', 'USS Defiance · EV-0408', 'BASTION CLASS');
  mesh(BOX(3.1, 0.02, 0.02), SLOT, 0, -0.72, 0.02, g);
  addHit(BOX(3.2, 1.4, 0.4), { station: 'ship' }, g, 0, 0, 0.2);
}
// ---------- systems table aft of the command dais ----------
// A waist-high display table in the tradition of an engineering master situation table: a sculpted base, a heavy
// trim slab and one large glass display (DRAW via drawTable in screens.js) read from the forward side.
const TABLE = { x: 0, z: 3.75, w: 2.5, d: 1.25 };
{
  const g = group(TABLE.x, 0, TABLE.z, 0); // reads right way up from the aft side, where you walk in from the lift and the MSD
  mesh(RBOX(2.1, 0.08, 0.84, 0.03), MAT.gunDark, 0, 0.04, 0, g);
  [-1, 1].forEach((sd) => { mesh(BOX(0.018, 0.018, 0.7), STRIP, sd * 1.02, 0.05, 0, g); mesh(BOX(1.9, 0.018, 0.018), STRIP, 0, 0.05, sd * 0.41, g); });
  [-0.78, 0.78].forEach((x) => { mesh(RBOX(0.46, 0.76, 0.74, 0.05), MAT_PED, x, 0.46, 0, g); mesh(RBOX(0.05, 0.62, 0.76, 0.015), MAT_TRIM, x + (x > 0 ? -0.24 : 0.24), 0.46, 0, g); grille(g, x, 0.46, 0.372, 0.3, 0.3); });
  mesh(RBOX(1.12, 0.2, 0.34, 0.03), MAT_TRIM, 0, 0.62, 0, g); idPlate(g, 'SYS·TBL', 0, 0.62, 0.172, 0.28);
  mesh(RBOX(TABLE.w, 0.09, TABLE.d, 0.035), MAT_TRIM, 0, 0.905, 0, g);
  mesh(RBOX(TABLE.w + 0.04, 0.03, TABLE.d + 0.04, 0.015), MAT.leatherDark, 0, 0.935, 0, g);
  mesh(RBOX(TABLE.w - 0.12, 0.012, TABLE.d - 0.12, 0.006), MAT.glassTop, 0, 0.952, 0, g);
  mesh(BOX(TABLE.w - 0.1, 0.012, 0.012), STRIP, 0, 0.86, TABLE.d / 2 - 0.02, g); mesh(BOX(TABLE.w - 0.1, 0.012, 0.012), STRIP, 0, 0.86, -TABLE.d / 2 + 0.02, g);
  buttons(g, 9, -1.0, 1.0, 0.958, TABLE.d / 2 - 0.035, 41); buttons(g, 9, -1.0, 1.0, 0.958, -TABLE.d / 2 + 0.035, 43);
  const sg = group(0, 0.962, 0, 0, g); sg.rotation.x = -Math.PI / 2; addScreen(sg, TABLE.w - 0.2, TABLE.d - 0.2, 2048, 896, 'table', 'carto', 'Situation table', 'SIT·01');
  ao(TABLE.x, TABLE.z, 3.0, 1.8, 0.6);
  pool(TABLE.x, TABLE.z, 3.0, 2.0, 0xffd9b0, 0.06);
  [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]].reduce((a, b2) => { addSeg(TABLE.x + a[0] * TABLE.w / 2, TABLE.z + a[1] * TABLE.d / 2, TABLE.x + b2[0] * TABLE.w / 2, TABLE.z + b2[1] * TABLE.d / 2, 0.34); return b2; });
}
const holoBeam = mesh(new THREE.CylinderGeometry(0.75, 0.6, 0.7, 6, 1, true), new THREE.MeshBasicMaterial({ color: 0x6fd6c8, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }), TABLE.x, 1.31, TABLE.z);
const holo = group(TABLE.x, 1.55, TABLE.z);
let holoPlanets = [];
function buildHolo(i) {
  while (holo.children.length) { const c = holo.children.pop(); c.geometry && c.geometry.dispose(); }
  const sys = SYSTEMS[i]; holoPlanets = [];
  const add2 = (o) => { holo.add(o); return o; };
  const glow = (color, op) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  add2(new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 14), glow(sys.starColor, 1)));
  add2(new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), glow(sys.starColor, 0.25)));
  for (let k = 0; k < sys.planets; k++) {
    const rad = 0.17 + k * 0.085, pts = [];
    for (let a = 0; a <= 64; a++) { const t = a / 64 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * rad, 0, Math.sin(t) * rad)); }
    const featured = k === sys.featured;
    add2(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: featured ? 0x4c8dff : 0x34e89e, transparent: true, opacity: featured ? 0.9 : 0.45, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })));
    const pm = add2(new THREE.Mesh(new THREE.SphereGeometry(featured ? 0.034 : 0.022, 12, 8), glow(featured ? 0x8fb6ff : 0x9cf5cf, 1)));
    holoPlanets.push({ m: pm, r: rad, a: k * 1.9 + i, w: 0.9 / Math.pow(rad * 6, 1.4) });
  }
  holo.rotation.x = 0.35;
}
buildHolo(0);
addHit(BOX(TABLE.w + 0.2, 1.3, TABLE.d + 0.2), { station: 'carto' }, null, TABLE.x, 0.65, TABLE.z);
holo.visible = holoBeam.visible = false; // the old hologram is retired; the table display shows the sector chart
// doors: Lift + Ready Room (aft), Head (aft-port), Conference Room (aft-starboard)
const DOORS = [];
function door(ei, t, label, station, auto, room) { const e = EDGES[ei]; const [px, pz] = onEdge(ei, t, 0); return doorAt(px, pz, e.rot, label, station, auto, room); }
// a sliding double door at (px, pz), frame on the local +z side; parent and deck default to the bridge (Deck 1);
// w is the clear opening (1.2 m standard), each leaf half of it
function doorAt(px, pz, rot, label, station, auto, room, parent, deck, w) {
  w = w || 1.2; const hw = w / 2, k = w / 1.2;
  const g = group(px, 0, pz, rot, parent), tx = Math.cos(rot), tz = -Math.sin(rot);
  const back = cnv(256, 400); { const c = back.getContext('2d'); const gr = c.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, '#f4f6fa'); gr.addColorStop(1, '#c9d2e0'); c.fillStyle = gr; c.fillRect(0, 0, 256, 400); }
  if (!room) mesh(new THREE.PlaneGeometry(w, 2.3), new THREE.MeshBasicMaterial({ map: tex(back), toneMapped: false }), 0, 1.15, 0.012, g);
  const reveal = [];
  if (room) { [-1, 1].forEach((sd) => reveal.push(mesh(BOX(0.04, 2.3, 0.22), MAT.gun, sd * (hw + 0.02), 1.15, -0.1, g))); reveal.push(mesh(BOX(w + 0.08, 0.04, 0.22), MAT.gun, 0, 2.32, -0.1, g), mesh(BOX(w, 0.012, 0.24), MAT.steel, 0, 0.006, -0.1, g)); }
  [-1, 1].forEach((sd) => mesh(RBOX(0.22, 2.6, 0.3, 0.03), MAT.gun, sd * (hw + 0.11), 1.3, 0.12, g));
  mesh(RBOX(w + 0.44, 0.3, 0.3, 0.03), MAT.gun, 0, 2.45, 0.12, g);
  mesh(BOX(w, 0.004, 0.1), MAT.hazard, 0, 0.003, 0.16, g);
  const lp = cnv(320, 56); { const c = lp.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, 320, 56); hexNode(c, 28, 28, 16); c.fillStyle = station === 'capbank' ? '#E05A50' : '#E8A06A'; c.fill(); if (!THREE.TroikaText) { c.fillStyle = '#F5E6CF'; c.font = `700 26px ${DISP}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(label, 56, 30); } }
  const lpm = mesh(new THREE.PlaneGeometry(1.0, 0.175), new THREE.MeshBasicMaterial({ map: tex(lp), toneMapped: false }), 0, 2.45, 0.276, g);
  text3d(lpm, label, 0.085, 0xF5E6CF, -0.325, 0.004, 0.002);
  const L = mesh(RBOX(hw, 2.3, 0.06, 0.015), MAT.panel, -hw / 2, 1.15, 0.06, g);
  const Rr = mesh(RBOX(hw, 2.3, 0.06, 0.015), MAT.panel, hw / 2, 1.15, 0.06, g);
  [L, Rr].forEach((d, j) => { mesh(BOX(0.02, 1.9, 0.02), SLOT, (j ? -1 : 1) * (hw / 2 - 0.03), 0, 0.04, d); mesh(BOX(0.4 * k, 0.05, 0.02), MAT.steel, 0, 0.1, 0.04, d); });
  addHit(BOX(w + 0.4, 2.6, 0.8), { station }, g, 0, 1.3, 0.45);
  // each leaf sits hw/2 off centre when shut and slides hw - 0.04 into the wall when open (render.js)
  const dd = { L, Rr, open: 0, station, auto, room, wx: px, wz: pz, reveal, deck: deck || 1, q: hw / 2, slide: hw - 0.04, reach: w > 1.5 ? 2.0 : 1.7 };
  if (room) dd.seg = [px - tx * hw, pz - tz * hw, px + tx * hw, pz + tz * hw, 0.2];
  DOORS.push(dd); return dd;
}
door(4, LIFT_GAP.t, 'LIFT', 'lift', true, true);
door(4, DOOR_GAPS[4], 'CONFERENCE', 'conference', true, true);
door(3, DOOR_GAPS[3], 'READY ROOM', 'ready', true, true);
door(5, DOOR_GAPS[5], 'HEAD', 'head', true, true);
// aft-port wall: dedication plaque + battle stations board; aft-starboard wall: emergency locker
{
  const pc = cnv(1024, 300); {
    const g = pc.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, '#8a6a44'); gr.addColorStop(1, '#5e462c'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 300);
    g.strokeStyle = 'rgba(255,230,190,0.6)'; g.lineWidth = 4; g.strokeRect(14, 14, 996, 272);
    drawCrest(g, 120, 150, 70, '#f3dcb4', 5);
    g.fillStyle = '#f7e6c8'; g.textBaseline = 'middle';
    g.font = `700 62px ${DISP}`; g.fillText('U.S.S. DEFIANCE', 230, 82);
    g.font = `500 28px ${MONO}`; g.fillText('EV-0408 · BASTION-CLASS HEAVY ESCORT', 232, 140);
    g.fillText('COMMISSIONED IN THE SECOND YEAR OF THE HOLLOW WAR', 232, 182);
    g.font = `italic 500 30px ${MONO}`; g.fillText('“STEADY UNDER FIRE.”', 232, 236);
  }
  const e = EDGES[5]; const [px, pz] = onEdge(5, 0.84, 0.04);
  const g = group(px, 1.62, pz, e.rot);
  mesh(new THREE.PlaneGeometry(1.1, 0.32), new THREE.MeshStandardMaterial({ map: tex(pc), metalness: 0.75, roughness: 0.35, envMapIntensity: 1.2 }), 0, 0, 0.01, g);
  addHit(BOX(1.2, 0.5, 0.3), { station: 'ship' }, g, 0, 0, 0.1);
  const b = group(px + e.nx * 0.02, 2.3, pz + e.nz * 0.02, e.rot); display(b, 1.1, 0.4, 512, 186, 'band', 'band', 'BATTLE STATIONS', 'ALL DECKS');
}
{
  const e = EDGES[3]; const [px, pz] = onEdge(3, 0.8, 0.2);
  const g = group(px, 0, pz, e.rot);
  mesh(RBOX(0.8, 2.0, 0.36, 0.03), MAT.gun, 0, 1.0, 0, g);
  mesh(RBOX(0.7, 1.86, 0.02, 0.01), MAT.panel, 0, 1.02, 0.18, g);
  mesh(BOX(0.7, 0.06, 0.01), MAT.hazard, 0, 1.9, 0.195, g);
  mesh(BOX(0.04, 0.4, 0.04), MAT.steel, 0.26, 1.1, 0.2, g);
  const lc = cnv(256, 96); { const c = lc.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, 256, 96); c.fillStyle = '#E04848'; c.font = `700 24px ${DISP}`; c.textAlign = 'center'; c.fillText('EMERGENCY', 128, 38); c.fillStyle = '#F5E6CF'; c.font = `500 16px ${MONO}`; c.fillText('FIRE · MEDICAL · EVA', 128, 70); }
  mesh(new THREE.PlaneGeometry(0.56, 0.21), new THREE.MeshBasicMaterial({ map: tex(lc), toneMapped: false }), 0, 1.55, 0.2, g);
  extraObs.push({ x: px, z: pz, r: 0.42 });
}

// ---------- overhead downlights + light pools ----------
DOWNLIGHTS.forEach(([x, z]) => {
  const d = mesh(new THREE.CircleGeometry(0.13, 24), downlightMat, x, WALL_H - 0.004, z); d.rotation.x = Math.PI / 2;
  const rim = mesh(new THREE.TorusGeometry(0.15, 0.02, 6, 24), MAT.steel, x, WALL_H - 0.01, z); rim.rotation.x = Math.PI / 2;
  pool(x, z, 2.0, 2.0, 0xffd2a0, 0.14);
});
pool(DAIS.x, DAIS.z, 5.2, 5.2, 0xffcf9a, 0.16, DAIS.h);
