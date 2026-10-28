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
    const sc = gap * e.len;
    wallPiece(MAT.wall, e.A, dir, nrm, 0, sc - 0.6, 0, WALL_H, WALL_H, 1.2);
    wallPiece(MAT.wall, e.A, dir, nrm, sc + 0.6, e.len, 0, WALL_H, WALL_H, 1.2);
    wallPiece(MAT.wall, e.A, dir, nrm, sc - 0.6, sc + 0.6, 2.3, WALL_H, WALL_H, 1.2);
    let a = P2(0), b = P2(sc - 0.6); addSeg(a[0], a[1], b[0], b[1], 0.33); a = P2(sc + 0.6); b = P2(e.len); addSeg(a[0], a[1], b[0], b[1], 0.33);
    stripRun(0.25, sc - 0.75); stripRun(sc + 0.75, e.len - 0.25);
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
let _baseGeo = null;
const CHAIR_BASE_MAT = triSurface(new THREE.MeshStandardMaterial({ color: 0x45433f, metalness: 0.85, roughness: 0.34, envMapIntensity: 0.6 }), { set: 'steel', metres: 0.45, ns: 0.5, rv: 0.7, low: 0.3 });
function chairBase() {
  if (_baseGeo) return _baseGeo;
  const pts = [[0, 0], [0.36, 0], [0.375, 0.012], [0.36, 0.03], [0.22, 0.06], [0.11, 0.09], [0.075, 0.13], [0.065, 0.33], [0.09, 0.36], [0, 0.36]].map(([x, y]) => new THREE.Vector2(x, y));
  _baseGeo = new THREE.LatheGeometry(pts, 40); return _baseGeo;
}
function makeChair(parent, kind) {
  const g = new THREE.Group(); parent.add(g);
  const cap = kind === 'captain', side = kind === 'xo';
  const s = cap ? 1.1 : side ? 1.0 : 0.9;
  g.scale.set(s, 1, s);
  mesh(chairBase(), CHAIR_BASE_MAT, 0, 0, 0, g);
  mesh(new THREE.TorusGeometry(0.36, 0.012, 6, 40), MAT.steel, 0, 0.012, 0, g).rotation.x = Math.PI / 2;
  // seat pan + waterfall cushion
  mesh(RBOX(0.58, 0.07, 0.54, 0.03), MAT.gun, 0, 0.395, 0.0, g);
  mesh(sideGeo('seat', () => { const p = new THREE.Shape(); p.moveTo(-0.25, 0.42); p.lineTo(0.2, 0.42); p.quadraticCurveTo(0.29, 0.42, 0.29, 0.48); p.quadraticCurveTo(0.29, 0.535, 0.2, 0.54); p.lineTo(-0.22, 0.55); p.quadraticCurveTo(-0.27, 0.55, -0.27, 0.49); p.closePath(); return p; }, 0.5, 0.025), MAT.leather, 0, 0, 0, g);
  // back: tapered shell + cushion with stitch lines
  const back = new THREE.Group(); back.position.set(0, 0.47, 0.26); back.rotation.x = -0.13; g.add(back);
  const d = cap ? [0.5, 0.58, 0.42, 0.86, 0.1] : side ? [0.46, 0.52, 0.4, 0.66, 0.09] : [0.44, 0.48, 0.38, 0.56, 0.08];
  mesh(extrudeX('bshell' + kind, () => backShape(d[0] + 0.04, d[1] + 0.04, d[2] + 0.04, d[3] + 0.03, d[4] + 0.02), 0.08, 0.02), MAT.gun, 0, -0.015, 0.045, back);
  mesh(extrudeX('bcush' + kind, () => backShape(d[0], d[1], d[2], d[3], d[4]), 0.07, 0.03), MAT.leather, 0, 0, -0.02, back);
  (cap ? [0.26, 0.48, 0.7] : [0.34, 0.66]).forEach((f) => mesh(BOX(d[1] * 0.74, 0.008, 0.01), MAT.leatherDark, 0, f * d[3], -0.057, back));
  if (cap) {
    mesh(BOX(0.36, 0.014, 0.014), STRIP, 0, 0.12, 0.088, back);
    mesh(extrudeX('crest', () => { const p = new THREE.Shape(); for (let i = 0; i < 6; i++) { const a = (60 * i) * D2R; i ? p.lineTo(Math.cos(a) * 0.045, Math.sin(a) * 0.045) : p.moveTo(0.045, 0); } p.closePath(); return p; }, 0.012, 0.003), MAT.steel, 0, d[3] - 0.18, 0.09, back);
  }
  // armrests: one swept piece each, rear post into the seat shell
  const armLen = cap ? 0.3 : 0.22;
  [-1, 1].forEach((sd) => {
    mesh(sideGeo('arm' + armLen, () => { const p = new THREE.Shape(); p.moveTo(-0.25, 0.4); p.lineTo(-0.17, 0.4); p.quadraticCurveTo(-0.15, 0.6, -0.1, 0.635); p.lineTo(armLen - 0.03, 0.645); p.quadraticCurveTo(armLen + 0.02, 0.65, armLen + 0.02, 0.685); p.quadraticCurveTo(armLen + 0.02, 0.722, armLen - 0.03, 0.722); p.lineTo(-0.2, 0.722); p.quadraticCurveTo(-0.27, 0.72, -0.27, 0.65); p.closePath(); return p; }, 0.085, 0.018), MAT.gun, sd * 0.33, 0, 0, g);
    if (!cap) mesh(RBOX(0.07, 0.022, 0.32, 0.01), MAT.leather, sd * 0.33, 0.733, -0.02, g);
    else mesh(RBOX(0.07, 0.022, 0.2, 0.01), MAT.leather, sd * 0.33, 0.733, 0.12, g);
  });
  return g;
}

// a low desk in front of a dais seat; screens tilt toward the seat (+z)
function lowDesk(x, z, rot, w, kind, station, title, code) {
  const g = group(x, DAIS.h, z, rot);
  mesh(RBOX(w, 0.56, 0.42, 0.05), MAT.console, 0, 0.3, 0, g);
  mesh(RBOX(w - 0.08, 0.05, 0.36, 0.02), MAT.gunDark, 0, 0.025, 0, g);
  mesh(BOX(w - 0.12, 0.016, 0.016), SLOT, 0, 0.06, 0.21, g);
  const top = group(0, 0.6, 0, 0, g); top.rotation.x = 0.32;
  mesh(RBOX(w + 0.04, 0.05, 0.52, 0.02), MAT.cap, 0, 0, 0, top);
  mesh(BOX(w - 0.06, 0.012, 0.014), STRIP, 0, 0, 0.26, top);
  const sg = group(0, 0.03, -0.02, 0, top); sg.rotation.x = -Math.PI / 2;
  const sw = w * 0.62;
  addScreen(sg, sw, 0.34, 600, 340, kind, station, title, code).mesh.position.x = -(w - sw) / 2 + 0.06;
  const kg = group((w - (w - sw - 0.1)) / 2 - 0.02, 0, 0, 0, sg); addScreen(kg, w - sw - 0.16, 0.34, 140, 340, 'keys', station, '', '');
  addHit(BOX(w + 0.2, 1.2, 1.3), { station }, g, 0, 0.6, 0.45);
  return g;
}

// ---------- command dais: XO | Captain | Tactical ----------
mesh(new THREE.CylinderGeometry(DAIS.r, DAIS.r + 0.04, DAIS.h, 72), [MAT.gun, MAT.dais, MAT.gun], DAIS.x, DAIS.h / 2, DAIS.z);
{ const t = mesh(new THREE.TorusGeometry(DAIS.r + 0.01, 0.025, 8, 120), MAT.steel, DAIS.x, DAIS.h, DAIS.z); t.rotation.x = Math.PI / 2; }
{ const t = mesh(new THREE.TorusGeometry(DAIS.r + 0.03, 0.012, 6, 120), STRIP, DAIS.x, DAIS.h - 0.05, DAIS.z); t.rotation.x = Math.PI / 2; }
ao(DAIS.x, DAIS.z, DAIS.r * 2.6, DAIS.r * 2.6, 0.55);
const capChair = group(0, DAIS.h, 0.45); makeChair(capChair, 'captain');
[-1, 1].forEach((sd) => { const sg = group(sd * 0.363, 0.73, -0.06, 0, capChair); const sc = addScreen(sg, 0.07, 0.3, 128, 352, 'cmd', 'command', 'Command', 'CMD'); sc.mesh.rotation.x = -Math.PI / 2 + 0.06; });
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
function pod(x, z, station, kindA, titleA, codeA) {
  const g = group(x, 0, z, 0); // console faces aft (+z) toward its operator
  mesh(RBOX(1.36, 0.66, 0.56, 0.05), MAT.console, 0, 0.36, 0, g);
  mesh(RBOX(1.3, 0.06, 0.5, 0.02), MAT.gunDark, 0, 0.03, 0, g);
  mesh(BOX(1.2, 0.02, 0.02), SLOT, 0, 0.08, 0.27, g);
  [-1, 1].forEach((sd) => mesh(RBOX(0.06, 0.84, 0.66, 0.02), MAT.steel, sd * 0.7, 0.44, 0, g));
  const desk = group(0, 0.74, 0.08, 0, g); desk.rotation.x = 0.2;
  mesh(RBOX(1.4, 0.07, 0.7, 0.03), MAT.cap, 0, 0, 0, desk);
  mesh(BOX(1.3, 0.014, 0.016), STRIP, 0, 0.0, 0.36, desk);
  const kg = group(0, 0.04, 0.14, 0, desk); kg.rotation.x = -Math.PI / 2; addScreen(kg, 1.1, 0.2, 440, 80, 'keys', station, '', '');
  const sc = group(0, 0.9, -0.16, 0, g); sc.rotation.x = -0.95;
  display(sc, 1.08, 0.5, 512, 236, kindA, station, titleA, codeA);
  addHit(BOX(1.6, 1.5, 1.0), { station }, g, 0, 0.75, 0);
  const ch = makeChair(scene, 'station'); ch.position.set(x, 0, z + 0.7);
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
function consoleBody(g, L) {
  mesh(RBOX(L, 0.8, 0.62, 0.04), MAT.console, 0, 0.42, 0, g);
  mesh(RBOX(L - 0.1, 0.06, 0.56, 0.02), MAT.gunDark, 0, 0.03, 0.01, g);
  mesh(BOX(L - 0.2, 0.02, 0.02), SLOT, 0, 0.08, 0.31, g);
  const desk = group(0, 0.85, 0.04, 0, g); desk.rotation.x = 0.12;
  mesh(RBOX(L + 0.06, 0.06, 0.72, 0.025), MAT.cap, 0, 0, 0, desk);
  mesh(BOX(L - 0.1, 0.014, 0.016), STRIP, 0, 0, 0.37, desk);
  [-1, 1].forEach((sd) => mesh(RBOX(0.06, 0.92, 0.74, 0.02), MAT.steel, sd * (L / 2 + 0.03), 0.47, 0.02, g));
}
function post(parent, lx, p, wallW) {
  const st = group(lx, 0, 0, 0, parent);
  const sc = group(0, 1.06, -0.16, 0, st); sc.rotation.x = -0.6;
  display(sc, Math.min(1.3, wallW - 0.1), 0.38, 900, 264, p.kind, p.id, p.title, p.code);
  const kg = group(0, 0.89, 0.16, 0, st); kg.rotation.x = -Math.PI / 2 + 0.12; addScreen(kg, Math.min(1.2, wallW - 0.2), 0.16, 440, 60, 'keys', p.id, '', '');
  const wd = group(0, 1.98, -0.29, 0, st); display(wd, wallW, wallW * 0.6, 1024, 614, p.kind, p.id, p.title, p.code);
  addHit(BOX(Math.min(1.5, wallW + 0.1), 2.6, 1.3), { station: p.id }, st, 0, 1.3, 0.1);
  st.updateWorldMatrix(true, false);
  const cw = new THREE.Vector3(); st.localToWorld(cw.set(0, 0, 1.02));
  const ch = makeChair(scene, 'station'); ch.position.set(cw.x, 0, cw.z); ch.rotation.y = parent.rotation.y;
  ao(cw.x, cw.z, 0.9, 0.9, 0.55); extraObs.push({ x: cw.x, z: cw.z, r: 0.36 });
  const pw = new THREE.Vector3(); st.localToWorld(pw.set(0, 0, 0.55)); pool(pw.x, pw.z, 1.3, 1.6, 0xffe2c8, 0.08);
  const spill = ({ sci: 0x34e89e, intel: 0x34e89e, ew: 0x34e89e, helm: 0x34e89e, sys: 0xffd21f, env: 0xffd21f, dmg: 0xffd21f, com: 0xffd21f, wpn: 0xff3b30, tac: 0xff3b30, ops: 0x4c8dff })[p.kind] || 0x4c8dff;
  const sp = new THREE.Vector3(); st.localToWorld(sp.set(0, 0, 0.75)); pool(sp.x, sp.z, 1.6, 1.2, spill, 0.07);
  const dl = new THREE.Vector3(); st.localToWorld(dl.set(0, 0, 0.7)); DOWNLIGHTS.push([dl.x, dl.z]);
}
const DOWNLIGHTS = [[-1.4, -3.15], [1.4, -3.15], [0, 3.55]];
RUNS.forEach((run) => {
  const rot = -run.side * Math.PI / 2;
  const g = group(run.side * 5.6 - run.side * 0.34, 0, 0, rot);
  consoleBody(g, 4.7);
  mesh(RBOX(4.9, 0.36, 0.3, 0.03), MAT.gun, 0, 2.9, -0.18, g);
  mesh(BOX(4.7, 0.02, 0.02), SLOT, 0, 2.71, -0.03, g);
  run.posts.forEach((p) => post(g, run.side < 0 ? -p.z : p.z, p, 1.38));
  const aoc = new THREE.Vector3(); g.updateMatrixWorld(true); g.localToWorld(aoc.set(0, 0, 0)); ao(aoc.x, aoc.z, 1.3, 5.2, 0.6);
});
// ---------- forward-angled walls: Weapons Control and Electronic Warfare ----------
[[1, { id: 'weapons', kind: 'wpn', title: 'Weapons Control', code: 'WPN·09' }], [7, { id: 'ew', kind: 'ew', title: 'Electronic Warfare', code: 'EW·10' }]].forEach(([ei, p]) => {
  const e = EDGES[ei];
  const g = group(e.mx + e.nx * 0.34, 0, e.mz + e.nz * 0.34, e.rot);
  consoleBody(g, 2.1);
  post(g, 0, p, 1.9);
  mesh(RBOX(2.3, 0.36, 0.3, 0.03), MAT.gun, 0, 2.95, -0.18, g);
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
mesh(new THREE.PlaneGeometry(VS_W, VS_H), new THREE.MeshBasicMaterial({ map: rt.texture }), 0, VS_Y, VS_Z);
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
  const fz = FWD_Z + 0.2;
  mesh(RBOX(VS_W + 0.9, 0.36, 0.34, 0.05), MAT.gun, 0, VS_Y + VS_H / 2 + 0.18, fz);
  mesh(RBOX(VS_W + 0.9, 0.42, 0.4, 0.05), MAT.gun, 0, VS_Y - VS_H / 2 - 0.21, fz + 0.02);
  [-1, 1].forEach((sd) => {
    mesh(RBOX(0.42, VS_H + 0.8, 0.38, 0.05), MAT.gun, sd * (VS_W / 2 + 0.24), VS_Y, fz);
    const gus = mesh(RBOX(0.36, 0.36, 0.3, 0.03), MAT.steel, sd * (VS_W / 2 + 0.02), VS_Y + VS_H / 2 - 0.02, fz + 0.06); gus.rotation.z = Math.PI / 4;
    const gus2 = mesh(RBOX(0.36, 0.36, 0.3, 0.03), MAT.steel, sd * (VS_W / 2 + 0.02), VS_Y - VS_H / 2 + 0.02, fz + 0.06); gus2.rotation.z = Math.PI / 4;
    for (let k = 0; k < 7; k++) mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), MAT.steel, sd * (VS_W / 2 + 0.24), VS_Y - VS_H / 2 + 0.2 + k * 0.32, fz + 0.2).rotation.x = Math.PI / 2;
  });
  mesh(BOX(VS_W + 0.1, 0.02, 0.02), SLOT, 0, VS_Y + VS_H / 2 + 0.01, fz - 0.16);
  for (let k = 0; k < 18; k++) mesh(BOX(0.09, 0.03, 0.02), k % 5 === 2 ? new THREE.MeshBasicMaterial({ color: 0x34e89e, toneMapped: false }) : STRIP, -1.53 + k * 0.18, VS_Y - VS_H / 2 - 0.21, fz + 0.23);
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
  g.font = `500 15px ${MONO}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  const line1 = state.speed === 'warp' ? `EN ROUTE · ${sysDest().star.toUpperCase()}` : `${sysCur().star.toUpperCase()} SYSTEM · ${sysCur().planet.toUpperCase()}`;
  const line2 = `${state.view === 'target' ? 'MAGNIFIED' : 'FORWARD VIEW'} · ${SPEEDS[state.speed].screen}`;
  const x = 58, y = H - 62, w = Math.max(g.measureText(line1).width, g.measureText(line2).width) + 28;
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x - 14, y - 22, w, 52);
  g.fillStyle = P.acc; g.fillRect(x - 14, y - 22, 3, 52);
  g.fillStyle = '#e9e2d6'; g.fillText(line1, x, y); g.fillStyle = P.acc; g.fillText(line2, x, y + 20);
  if (state.view === 'target') {
    g.strokeStyle = P.acc; g.lineWidth = 1.5; g.globalAlpha = 0.55;
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
  display(g, 3.0, 1.2, 1024, 410, 'msd', 'ship', 'USS Defiance · EV-0408', 'BASTION CLASS');
  mesh(BOX(3.1, 0.02, 0.02), SLOT, 0, -0.72, 0.02, g);
  addHit(BOX(3.2, 1.4, 0.4), { station: 'ship' }, g, 0, 0, 0.2);
}
const TABLE = { x: 0, z: 3.55 };
{
  mesh(new THREE.CylinderGeometry(0.42, 0.55, 0.85, 6), MAT.gun, TABLE.x, 0.425, TABLE.z);
  mesh(new THREE.CylinderGeometry(0.92, 0.88, 0.1, 6), MAT.console, TABLE.x, 0.9, TABLE.z);
  const r = mesh(new THREE.CylinderGeometry(0.94, 0.94, 0.03, 6, 1, true), STRIP, TABLE.x, 0.94, TABLE.z);
  const emitC = cnv(256, 256); { const g = emitC.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, '#bff8ef'); gr.addColorStop(0.5, '#2a6a64'); gr.addColorStop(1, '#0b1a1a'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(210,255,248,0.3)'; g.lineWidth = 2; for (let i = 1; i < 6; i++) { g.beginPath(); g.arc(128, 128, i * 22, 0, 7); g.stroke(); } for (let a = 0; a < 6; a++) { const t = a * Math.PI / 3; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(t) * 128, 128 + Math.sin(t) * 128); g.stroke(); } }
  const em = mesh(new THREE.CircleGeometry(0.78, 6), new THREE.MeshBasicMaterial({ map: tex(emitC), toneMapped: false }), TABLE.x, 0.952, TABLE.z); em.rotation.x = -Math.PI / 2; em.rotation.z = Math.PI / 6;
  ao(TABLE.x, TABLE.z, 2.2, 2.2, 0.6);
  pool(TABLE.x, TABLE.z, 3.0, 3.0, 0x6fd6c8, 0.08);
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
addHit(new THREE.CylinderGeometry(1.0, 1.0, 2.2, 6), { station: 'carto' }, null, TABLE.x, 1.1, TABLE.z);
// doors: Lift + Ready Room (aft), Head (aft-port), Conference Room (aft-starboard)
const DOORS = [];
function door(ei, t, label, station, auto, room) {
  const e = EDGES[ei]; const [px, pz] = onEdge(ei, t, 0);
  const g = group(px, 0, pz, e.rot);
  const back = cnv(256, 400); { const c = back.getContext('2d'); const gr = c.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, '#f4f6fa'); gr.addColorStop(1, '#c9d2e0'); c.fillStyle = gr; c.fillRect(0, 0, 256, 400); }
  if (!room) mesh(new THREE.PlaneGeometry(1.2, 2.3), new THREE.MeshBasicMaterial({ map: tex(back), toneMapped: false }), 0, 1.15, 0.012, g);
  else { [-1, 1].forEach((sd) => mesh(BOX(0.04, 2.3, 0.22), MAT.gun, sd * 0.62, 1.15, -0.1, g)); mesh(BOX(1.28, 0.04, 0.22), MAT.gun, 0, 2.32, -0.1, g); mesh(BOX(1.2, 0.012, 0.24), MAT.steel, 0, 0.006, -0.1, g); }
  [-1, 1].forEach((sd) => mesh(RBOX(0.22, 2.6, 0.3, 0.03), MAT.gun, sd * 0.71, 1.3, 0.12, g));
  mesh(RBOX(1.64, 0.3, 0.3, 0.03), MAT.gun, 0, 2.45, 0.12, g);
  mesh(BOX(1.2, 0.004, 0.1), MAT.hazard, 0, 0.003, 0.16, g);
  const lp = cnv(320, 56); { const c = lp.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, 320, 56); hexNode(c, 28, 28, 16); c.fillStyle = ({ lift: '#FFD21F', head: '#FFD21F', ready: '#4C8DFF', conference: '#4C8DFF' })[station]; c.fill(); c.fillStyle = '#EAF2FF'; c.font = `700 26px ${DISP}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(label, 56, 30); }
  mesh(new THREE.PlaneGeometry(1.0, 0.175), new THREE.MeshBasicMaterial({ map: tex(lp), toneMapped: false }), 0, 2.45, 0.276, g);
  const L = mesh(RBOX(0.6, 2.3, 0.06, 0.015), MAT.panel, -0.3, 1.15, 0.06, g);
  const Rr = mesh(RBOX(0.6, 2.3, 0.06, 0.015), MAT.panel, 0.3, 1.15, 0.06, g);
  [L, Rr].forEach((d, k) => { mesh(BOX(0.02, 1.9, 0.02), SLOT, k ? -0.27 : 0.27, 0, 0.04, d); mesh(BOX(0.4, 0.05, 0.02), MAT.steel, 0, 0.1, 0.04, d); });
  addHit(BOX(1.6, 2.6, 0.8), { station }, g, 0, 1.3, 0.45);
  const dd = { L, Rr, open: 0, station, auto, room, wx: px, wz: pz };
  if (room) dd.seg = [px - e.tx * 0.6, pz - e.tz * 0.6, px + e.tx * 0.6, pz + e.tz * 0.6, 0.2];
  DOORS.push(dd);
}
door(4, 0.826, 'LIFT', 'lift', true, false);
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
  const lc = cnv(256, 96); { const c = lc.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, 256, 96); c.fillStyle = '#FF3B30'; c.font = `700 24px ${DISP}`; c.textAlign = 'center'; c.fillText('EMERGENCY', 128, 38); c.fillStyle = '#EAF2FF'; c.font = `500 16px ${MONO}`; c.fillText('FIRE · MEDICAL · EVA', 128, 70); }
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
