// USS Defiance · lift.js
// Lift 1: a real car behind the aft bridge door. Step in, pick a deck on the back-wall panel, the doors close,
// the car rides for a few seconds, and the doors open on the new deck. Only one deck is in the scene at a time:
// while you are away from Deck 1, the whole bridge deck is hidden. Decks 2 to 6 are not fitted out yet, so they
// open onto a sealed lift lobby (a placeholder the later build stages replace, Deck 2 first).
//
// Lighting: the car and the lobbies are not part of the light bake (bake.js skips materials flagged noBake).
// Their light is painted into small light-map images instead: a light map is an image that says how much light
// falls on each part of a surface, so no live lights are needed and phones stay fast.
// Files share one global scope and load in order (see index.html).
'use strict';

// Decks Lift 1 serves (from docs/master-systems-display.html)
const LIFT_DECKS = [
  { n: 1, name: 'Main Bridge', short: 'BRIDGE', built: true },
  { n: 2, name: 'Officers’ deck', short: 'OFFICERS', built: true, rooms: ['Lift 1 lobby', 'Captain’s quarters', 'Officers’ corridor', 'Officers’ wardroom'], sealed: ['First officer’s quarters', 'Senior officers’ quarters', 'Observation lounge'] },
  { n: 3, name: 'Medical and officers', short: 'MEDICAL', rooms: ['Sickbay', 'Medical lab', 'Officers’ quarters', 'Forward shield generator'] },
  { n: 4, name: 'Crew deck', short: 'CREW', rooms: ['Mess hall and galley', 'Crew lounge and gym', 'Crew quarters', 'Auxiliary control'] },
  { n: 5, name: 'Weapons and transport', short: 'WEAPONS', rooms: ['Torpedo bays 1 and 2', 'Armory and security', 'Transporter rooms', 'Science labs'] },
  { n: 6, name: 'Deflector and cargo', short: 'CARGO', rooms: ['Navigational deflector', 'Cargo bay 1', 'Torpedo loading', 'Crew quarters'] },
];
const liftDeck = (n) => LIFT_DECKS[n - 1];

// ---------- geometry (world metres, forward is -z) ----------
const [LIFT_DX, LIFT_DZ] = onEdge(LIFT_GAP.edge, LIFT_GAP.t, 0); // the door, on the aft bridge wall line (z = 6.2)
const CAR = { x0: LIFT_DX - 0.8, x1: LIFT_DX + 0.8, z0: LIFT_DZ + 0.22, z1: LIFT_DZ + 2.22, h: 2.7 };
const LOBBY = { x0: LIFT_DX - 3.0, x1: LIFT_DX + 3.0, z0: LIFT_DZ - 4.2, z1: LIFT_DZ, h: 2.9 };
const LIFT = {
  deck: 1, from: 1, to: 1, phase: 'idle', t: 0, dur: 0, door: 0, shake: 0, inside: false,
  root: group(0, 0, 0, 0), stub: group(0, 0, 0, 0), deck1: null, envStale: false, k: -1,
  carSegs: [], stubSegs: [], doorSeg: [LIFT_DX - 0.6, LIFT_DZ, LIFT_DX + 0.6, LIFT_DZ, 0.2], mats: [], panels: [], stubDoor: null, lum: 0.8,
};
LIFT.stub.visible = false;
const inCar = (x, z) => x > CAR.x0 && x < CAR.x1 && z > CAR.z0 - 0.05 && z < CAR.z1;

// ---------- materials (outside the bake) ----------
function noBake(m, lmBase) { m.userData.noBake = true; if (m.lightMap) { m.userData.lmBase = lmBase || 1; LIFT.mats.push(m); } return m; }
// light map: brightest under the ceiling light, falling off toward the floor
function lmWall(top, mid, low) {
  const c = cnv(4, 128), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, `rgb(${top},${top},${top})`); gr.addColorStop(0.12, `rgb(${top},${top},${top})`); gr.addColorStop(0.5, `rgb(${mid},${mid},${mid})`); gr.addColorStop(1, `rgb(${low},${low},${low})`);
  g.fillStyle = gr; g.fillRect(0, 0, 4, 128); const t = tex(c, false); t.wrapS = THREE.RepeatWrapping; return t;
}
function lmFloor(w, d, spots, base) {
  const S = 64, c = cnv(Math.round(S * w / Math.max(w, d)) + 2, Math.round(S * d / Math.max(w, d)) + 2), g = c.getContext('2d');
  g.fillStyle = `rgb(${base},${base},${base})`; g.fillRect(0, 0, c.width, c.height);
  spots.forEach(([u, v, r, a]) => { const gr = g.createRadialGradient(u * c.width, (1 - v) * c.height, 0, u * c.width, (1 - v) * c.height, r * c.width); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); });
  // darker along the walls, where less of the ceiling is visible
  const e = g.createLinearGradient(0, 0, c.width, 0); e.addColorStop(0, 'rgba(0,0,0,0.35)'); e.addColorStop(0.15, 'rgba(0,0,0,0)'); e.addColorStop(0.85, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = e; g.fillRect(0, 0, c.width, c.height);
  const f = g.createLinearGradient(0, 0, 0, c.height); f.addColorStop(0, 'rgba(0,0,0,0.35)'); f.addColorStop(0.15, 'rgba(0,0,0,0)'); f.addColorStop(0.85, 'rgba(0,0,0,0)'); f.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = f; g.fillRect(0, 0, c.width, c.height);
  return tex(c, false);
}
// padded wall bays: dark kick panel, steel rail at hand height, warm upholstered upper panel, dark frieze under the ceiling
function liftWallCanvas(H, upper) {
  const Wd = 192, Hp = Math.round(H * 160), Y = (m) => Hp - m * 160, c = cnv(Wd, Hp), g = c.getContext('2d');
  g.fillStyle = '#26241f'; g.fillRect(0, 0, Wd, Hp);
  g.fillStyle = '#2f2c28'; g.fillRect(0, Y(0.9), Wd, Y(0.12) - Y(0.9));
  noise(g, Wd, Hp, 2500, 0.03, 53);
  const gr = g.createLinearGradient(0, Y(H - 0.3), 0, Y(1.0)); gr.addColorStop(0, upper[0]); gr.addColorStop(1, upper[1]);
  g.fillStyle = gr; g.fillRect(0, Y(H - 0.3), Wd, Y(1.0) - Y(H - 0.3));
  const r = mulberry(61); for (let i = 0; i < 3000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,240,220,0.04)' : 'rgba(0,0,0,0.05)'; g.fillRect(r() * Wd, Y(H - 0.3) + r() * (Y(1.0) - Y(H - 0.3)), 1.2, 1.2); }
  [0, 96].forEach((x) => { g.fillStyle = 'rgba(20,16,12,0.6)'; g.fillRect(x, Y(H - 0.3), 3, Y(0.9) - Y(H - 0.3)); g.fillStyle = 'rgba(255,240,220,0.12)'; g.fillRect(x + 3, Y(H - 0.3), 1, Y(0.9) - Y(H - 0.3)); });
  g.fillStyle = '#8f887f'; g.fillRect(0, Y(1.0), Wd, Y(0.9) - Y(1.0)); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(0, Y(1.0), Wd, 2);
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 2; g.strokeRect(12, Y(0.82), 72, Y(0.2) - Y(0.82)); g.strokeRect(108, Y(0.82), 72, Y(0.2) - Y(0.82));
  g.fillStyle = '#181614'; g.fillRect(0, Y(0.12), Wd, Hp - Y(0.12));
  return c;
}
function liftWallMat(H, upper, lm) {
  const c = liftWallCanvas(H, upper), map = tex(c), nm = normalTex(c, 2.5); map.wrapS = nm.wrapS = THREE.RepeatWrapping;
  return noBake(new THREE.MeshStandardMaterial({ map, normalMap: nm, roughness: 0.85, metalness: 0.05, envMapIntensity: 0.25, lightMap: lm, lightMapIntensity: 1 }), 1);
}
function plainMat(color, metal, rough, env, lm, lmK) { return noBake(new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, envMapIntensity: env, lightMap: lm || null, lightMapIntensity: lmK || 1 }), lmK || 1); }
const LM_CAR = lmWall(255, 215, 150), LM_LOBBY = lmWall(250, 210, 150);
const LIFT_MAT = {
  carWall: liftWallMat(CAR.h, ['#cbbfac', '#bcae9a'], LM_CAR),
  lobbyWall: liftWallMat(LOBBY.h, ['#c2b6a4', '#b2a592'], LM_LOBBY),
  steel: plainMat(0xa29c94, 0.9, 0.28, 1.1, LM_CAR, 0.6),
  gun: plainMat(0x34322f, 0.6, 0.45, 0.6, LM_CAR, 0.8),
  ceil: plainMat(0x9a948b, 0.2, 0.8, 0.2, LM_LOBBY, 0.6),
  carFloor: plainMat(0x5a5650, 0.45, 0.55, 0.5, lmFloor(1.6, 2.0, [[0.5, 0.5, 0.6, 0.9]], 120), 1),
  lobbyFloor: plainMat(0x6a6f78, 0.45, 0.6, 0.45, lmFloor(6.0, 4.2, [[0.5, 0.5, 0.42, 0.85], [0.5, 0.88, 0.22, 0.5]], 95), 1),
  panel: plainMat(0x9a9184, 0.15, 0.6, 0.45, LM_LOBBY, 0.9),
  hazard: noBake(new THREE.MeshStandardMaterial({ map: MAT.hazard.map, roughness: 0.6, lightMap: LM_LOBBY, lightMapIntensity: 0.8 }), 0.8),
};
// luminous ceiling: warm white diffuser behind a dark grid
function lumCanvas(w, d, cols, rows) {
  const c = cnv(Math.round(w * 160), Math.round(d * 160)), g = c.getContext('2d');
  const gr = g.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, Math.max(c.width, c.height) * 0.7); gr.addColorStop(0, '#fff6e8'); gr.addColorStop(1, '#e8d8c0');
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#26231f'; for (let i = 0; i <= cols; i++) g.fillRect(i * (c.width - 6) / cols, 0, 6, c.height); for (let j = 0; j <= rows; j++) g.fillRect(0, j * (c.height - 6) / rows, c.width, 6);
  return tex(c);
}
const LUM = [];
// the car's corner light slots follow the alert colour like the bridge's cove slots, at lower strength (they are within arm's reach)
const CAR_SLOT = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false });
function lumPanel(parent, x, y, z, w, d, cols, rows) {
  const m = new THREE.MeshBasicMaterial({ map: lumCanvas(w, d, cols, rows), toneMapped: false }); LUM.push(m);
  const p = mesh(new THREE.PlaneGeometry(w, d), m, x, y, z, parent); p.rotation.x = Math.PI / 2;
  const f = mesh(BOX(w + 0.1, 0.04, d + 0.1), LIFT_MAT.gun, x, y + 0.012, z, parent);
  return p;
}
function liftSlab(parent, mat, x0, x1, z0, z1, y, down) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0), m = mesh(g, mat, (x0 + x1) / 2, y, (z0 + z1) / 2, parent);
  m.rotation.x = down ? Math.PI / 2 : -Math.PI / 2; OCCLUDERS.push(m); return m;
}
function segs(list, pts, r) { for (let i = 0; i + 1 < pts.length; i++) list.push([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], r]); }

// ---------- the car ----------
{
  const R = LIFT.root, { x0, x1, z0, z1, h } = CAR, W2 = x1 - x0, D2 = z1 - z0, M = LIFT_MAT.carWall;
  liftSlab(R, LIFT_MAT.carFloor, x0, x1, LIFT_DZ - 0.02, z1, 0.002, false);
  liftSlab(R, LIFT_MAT.gun, LIFT_DX - 0.62, LIFT_DX + 0.62, LIFT_DZ, z0, 2.3, true);
  liftSlab(R, LIFT_MAT.ceil, x0, x1, z0, z1, h, true);
  // front wall (door side, faces into the car) with the 1.2 x 2.3 m opening; back wall; sides
  const ds = LIFT_DX - 0.6 - x0;
  wallPiece(M, [x0, z0], [1, 0], [0, 1], 0, ds, 0, h, h, 1.2, R);
  wallPiece(M, [x0, z0], [1, 0], [0, 1], ds + 1.2, W2, 0, h, h, 1.2, R);
  wallPiece(M, [x0, z0], [1, 0], [0, 1], ds, ds + 1.2, 2.3, h, h, 1.2, R);
  wallPiece(M, [x0, z1], [1, 0], [0, -1], 0, W2, 0, h, h, 1.2, R);
  wallPiece(M, [x0, z0], [0, 1], [1, 0], 0, D2, 0, h, h, 1.2, R);
  wallPiece(M, [x1, z0], [0, 1], [-1, 0], 0, D2, 0, h, h, 1.2, R);
  // the gap between the bridge wall and the car: a short lined tunnel
  [[LIFT_DX - 0.62, 1], [LIFT_DX + 0.62, -1]].forEach(([x, s]) => wallPiece(LIFT_MAT.gun, [x, LIFT_DZ], [0, 1], [s, 0], 0, 0.22, 0, 2.3, 2.3, 1.2, R));
  lumPanel(R, (x0 + x1) / 2, h - 0.03, (z0 + z1) / 2, W2 - 0.3, D2 - 0.3, 2, 3);
  // light slots in the four corners, deck strips, handrails
  [[x0 + 0.03, z0 + 0.03], [x1 - 0.03, z0 + 0.03], [x0 + 0.03, z1 - 0.03], [x1 - 0.03, z1 - 0.03]].forEach(([x, z]) => mesh(BOX(0.025, h - 0.5, 0.025), CAR_SLOT, x, (h - 0.5) / 2 + 0.25, z, R));
  [[x0 + 0.012, (z0 + z1) / 2, 0.02, D2 - 0.1], [x1 - 0.012, (z0 + z1) / 2, 0.02, D2 - 0.1], [(x0 + x1) / 2, z1 - 0.012, W2 - 0.1, 0.02]].forEach(([x, z, w, d]) => mesh(BOX(w, 0.025, d), STRIP, x, 0.07, z, R));
  const rail = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az), r = mesh(new THREE.CylinderGeometry(0.022, 0.022, len, 12), LIFT_MAT.steel, (ax + bx) / 2, 0.95, (az + bz) / 2, R);
    r.rotation.z = Math.PI / 2; r.rotation.y = -Math.atan2(bz - az, bx - ax);
    [0.12, 0.88].forEach((f) => { const px = ax + (bx - ax) * f, pz = az + (bz - az) * f; const b = mesh(BOX(0.025, 0.025, 0.09), LIFT_MAT.steel, px, 0.95, pz, R); b.rotation.y = -Math.atan2(bz - az, bx - ax) + Math.PI / 2; });
  };
  rail(x0 + 0.07, z0 + 0.35, x0 + 0.07, z1 - 0.25); rail(x1 - 0.07, z0 + 0.35, x1 - 0.07, z1 - 0.25); rail(x0 + 0.3, z1 - 0.07, x1 - 0.3, z1 - 0.07);
  segs(LIFT.carSegs, [[x0, LIFT_DZ], [x0, z1], [x1, z1], [x1, LIFT_DZ]], 0.3);
}

// ---------- displays: the car's deck panel, the indicator over the door, lobby signs ----------
function liftPanelDraw(p) {
  const c = p.c, g = c.getContext('2d'), P = pal(), W = c.width, H = c.height;
  g.fillStyle = COLORS.bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = COLORS.frame; g.lineWidth = 4; g.strokeRect(6, 6, W - 12, H - 12);
  const moving = LIFT.phase === 'moving', shown = liftShownDeck();
  if (p.kind === 'car') {
    g.fillStyle = P.acc; g.font = `700 30px ${DISP}`; g.textBaseline = 'middle'; g.fillText('LIFT 1', 28, 44);
    g.fillStyle = COLORS.dim; g.font = `500 18px ${MONO}`; g.textAlign = 'right'; g.fillText(moving ? (LIFT.to > LIFT.from ? 'DESCENDING' : 'ASCENDING') : 'SELECT DECK', W - 28, 44); g.textAlign = 'left';
    g.fillStyle = P.acc; g.fillRect(28, 72, W - 56, 3);
    g.fillStyle = COLORS.white; g.font = `700 150px ${DISP}`; g.textAlign = 'center'; g.fillText(String(shown), W / 2, 175);
    g.fillStyle = P.ice; g.font = `600 24px ${MONO}`; g.fillText(liftDeck(shown).name.toUpperCase(), W / 2, 270); g.textAlign = 'left';
    LIFT_DECKS.forEach((d, i) => {
      const y = 320 + i * 52, on = d.n === shown, tgt = moving && d.n === LIFT.to;
      g.fillStyle = on ? P.acc : '#0f1318'; hexNode(g, 54, y, 18); g.fill(); g.strokeStyle = tgt ? P.acc : COLORS.frame; g.lineWidth = 3; hexNode(g, 54, y, 18); g.stroke();
      g.fillStyle = on ? COLORS.bg : COLORS.white; g.font = `700 20px ${DISP}`; g.textAlign = 'center'; g.fillText(String(d.n), 54, y + 1); g.textAlign = 'left';
      g.fillStyle = on || tgt ? COLORS.white : COLORS.dim; g.font = `600 21px ${MONO}`; g.fillText(d.short, 90, y + 1);
      g.fillStyle = d.built ? P.ice : COLORS.dim; g.font = `500 16px ${MONO}`; g.textAlign = 'right'; g.fillText(d.built ? 'OPEN' : 'SEALED', W - 30, y + 1); g.textAlign = 'left';
    });
  } else if (p.kind === 'ind') {
    g.fillStyle = P.acc; g.font = `700 50px ${DISP}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const arrow = moving ? (LIFT.to > LIFT.from ? '▼' : '▲') : '';
    g.fillText(arrow + ' ' + shown + ' ' + arrow, W / 2, H / 2 + 2); g.textAlign = 'left';
  } else if (p.kind === 'sign') {
    const d = liftDeck(LIFT.deck);
    g.fillStyle = P.acc; g.font = `700 170px ${DISP}`; g.textBaseline = 'middle'; g.fillText(String(d.n), 34, 140);
    g.fillStyle = COLORS.white; g.font = `700 40px ${DISP}`; g.fillText('DECK ' + d.n, 190, 90);
    g.fillStyle = P.ice; g.font = `600 24px ${MONO}`; g.fillText(d.name.toUpperCase(), 192, 140);
    g.fillStyle = COLORS.dim; g.font = `500 20px ${MONO}`; g.fillText('LIFT 1 · DECKS 1 TO 6', 192, 186);
    g.fillStyle = P.acc; g.fillRect(34, 236, W - 68, 3);
  } else if (p.kind === 'dir') {
    const d = liftDeck(LIFT.deck);
    g.fillStyle = P.acc; g.font = `700 32px ${DISP}`; g.textBaseline = 'middle'; g.fillText('DECK ' + d.n + ' · DIRECTORY', 30, 46);
    g.fillStyle = P.acc; g.fillRect(30, 76, W - 60, 3);
    (d.rooms || []).forEach((rm, i) => {
      const y = 116 + i * 50; g.fillStyle = P.ice; hexNode(g, 44, y, 9); g.fill();
      g.fillStyle = COLORS.white; g.font = `600 24px ${MONO}`; g.fillText(rm, 66, y + 1);
      g.fillStyle = COLORS.dim; g.font = `500 18px ${MONO}`; g.textAlign = 'right'; g.fillText('SEALED', W - 30, y + 1); g.textAlign = 'left';
    });
    g.fillStyle = COLORS.warn; g.font = `600 20px ${MONO}`; g.fillText('FITTING-OUT IN PROGRESS', 30, H - 40);
  } else if (p.kind === 'seal') {
    g.fillStyle = COLORS.warn; g.font = `700 44px ${DISP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SECTION SEALED', W / 2, 56);
    g.fillStyle = COLORS.white; g.font = `600 22px ${MONO}`; g.fillText('DECK ' + LIFT.deck + ' IS BEING FITTED OUT', W / 2, 110);
    g.fillStyle = COLORS.dim; g.font = `500 18px ${MONO}`; g.fillText('AUTHORIZED CREWS ONLY', W / 2, 146); g.textAlign = 'left';
  }
  p.t.needsUpdate = true; p.key = liftPanelKey();
}
function liftPanelKey() { return LIFT.phase + ':' + liftShownDeck() + ':' + LIFT.deck + ':' + state.alert; }
function liftPanel(parent, kind, w, h, cw, ch, x, y, z, rotY, station) {
  const fr = group(x, y, z, rotY, parent);
  mesh(RBOX(w + 0.1, h + 0.1, 0.05, 0.015), LIFT_MAT.gun, 0, 0, -0.025, fr);
  const c = cnv(cw, ch), t = tex(c), p = { kind, c, t, key: '' };
  mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), 0, 0, 0.003, fr);
  if (station) addHit(BOX(w + 0.3, h + 0.3, 0.6), { station }, fr, 0, 0, 0.3);
  liftPanelDraw(p); LIFT.panels.push(p); return p;
}
function liftShownDeck() {
  if (LIFT.phase !== 'moving') return LIFT.deck;
  const a = clamp(LIFT.t / LIFT.dur, 0, 1), e = a * a * (3 - 2 * a);
  return Math.round(LIFT.from + (LIFT.to - LIFT.from) * e);
}
liftPanel(LIFT.root, 'car', 0.5, 0.78, 400, 624, (CAR.x0 + CAR.x1) / 2, 1.42, CAR.z1 - 0.004, Math.PI, 'liftcar');
liftPanel(LIFT.root, 'ind', 0.5, 0.14, 360, 100, LIFT_DX, 2.5, CAR.z0 + 0.03, 0);

// ---------- the sealed lobby used for Decks 2 to 6 ----------
{
  const S = LIFT.stub, { x0, x1, z0, z1, h } = LOBBY, W2 = x1 - x0, D2 = z1 - z0, M = LIFT_MAT.lobbyWall;
  liftSlab(S, LIFT_MAT.lobbyFloor, x0, x1, z0, z1, 0.001, false);
  liftSlab(S, LIFT_MAT.ceil, x0, x1, z0, z1, h, true);
  const ds = LIFT_DX - 0.6 - x0;
  wallPiece(M, [x0, z1], [1, 0], [0, -1], 0, ds, 0, h, h, 1.2, S);
  wallPiece(M, [x0, z1], [1, 0], [0, -1], ds + 1.2, W2, 0, h, h, 1.2, S);
  wallPiece(M, [x0, z1], [1, 0], [0, -1], ds, ds + 1.2, 2.3, h, h, 1.2, S);
  wallPiece(M, [x0, z0], [1, 0], [0, 1], 0, W2, 0, h, h, 1.2, S);
  wallPiece(M, [x0, z0], [0, 1], [1, 0], 0, D2, 0, h, h, 1.2, S);
  wallPiece(M, [x1, z0], [0, 1], [-1, 0], 0, D2, 0, h, h, 1.2, S);
  lumPanel(S, LIFT_DX, h - 0.03, (z0 + z1) / 2 - 0.1, 1.2, 2.8, 2, 5);
  // cove light where walls meet the ceiling, deck strips at the floor
  [[x0 + 0.1, (z0 + z1) / 2, 0.04, D2 - 0.3], [x1 - 0.1, (z0 + z1) / 2, 0.04, D2 - 0.3], [(x0 + x1) / 2, z0 + 0.1, W2 - 0.3, 0.04]].forEach(([x, z, w, d]) => mesh(BOX(w, 0.04, d), SLOT, x, h - 0.16, z, S));
  [[x0 + 0.012, (z0 + z1) / 2, 0.02, D2 - 0.2], [x1 - 0.012, (z0 + z1) / 2, 0.02, D2 - 0.2]].forEach(([x, z, w, d]) => mesh(BOX(w, 0.025, d), STRIP, x, 0.07, z, S));
  [[x0 + 0.2, ds - 0.75], [ds + 1.95, W2 - 0.2]].forEach(([a, b]) => mesh(BOX(b - a, 0.025, 0.02), STRIP, x0 + (a + b) / 2, 0.07, z1 - 0.012, S));
  // the lift doors on this side: same frame as the bridge's
  const g = group(LIFT_DX, 0, LIFT_DZ, Math.PI, S);
  [-1, 1].forEach((sd) => mesh(RBOX(0.22, 2.6, 0.3, 0.03), LIFT_MAT.gun, sd * 0.71, 1.3, 0.12, g));
  mesh(RBOX(1.64, 0.3, 0.3, 0.03), LIFT_MAT.gun, 0, 2.45, 0.12, g);
  mesh(BOX(1.2, 0.004, 0.1), LIFT_MAT.hazard, 0, 0.003, 0.16, g);
  const L = mesh(RBOX(0.6, 2.3, 0.06, 0.015), LIFT_MAT.panel, -0.3, 1.15, 0.06, g), Rr = mesh(RBOX(0.6, 2.3, 0.06, 0.015), LIFT_MAT.panel, 0.3, 1.15, 0.06, g);
  [L, Rr].forEach((d, k) => { mesh(BOX(0.02, 1.9, 0.02), SLOT, k ? -0.27 : 0.27, 0, 0.04, d); mesh(BOX(0.4, 0.05, 0.02), LIFT_MAT.steel, 0, 0.1, 0.04, d); });
  addHit(BOX(1.6, 2.6, 0.8), { station: 'lift' }, g, 0, 1.3, 0.45);
  LIFT.stubDoor = { L, Rr };

  // deck sign beside the doors, the directory on the port wall, the sealed bulkhead facing the lift
  liftPanel(S, 'sign', 1.1, 0.5, 560, 256, LIFT_DX + 1.75, 1.75, z1 - 0.03, Math.PI);
  liftPanel(S, 'dir', 1.3, 0.9, 520, 360, x0 + 0.03, 1.45, (z0 + z1) / 2, Math.PI / 2, 'deckdir');
  const b = group(LIFT_DX, 0, z0 + 0.12, 0, S);
  mesh(RBOX(2.3, 2.7, 0.24, 0.03), LIFT_MAT.gun, 0, 1.35, 0, b);
  mesh(RBOX(1.9, 2.35, 0.06, 0.02), LIFT_MAT.carFloor, 0, 1.2, 0.12, b);
  [0.25, 2.2].forEach((y) => mesh(BOX(1.9, 0.12, 0.02), LIFT_MAT.hazard, 0, y, 0.16, b));
  liftPanel(b, 'seal', 1.2, 0.36, 520, 160, 0, 1.55, 0.16, 0);
  addHit(BOX(2.3, 2.7, 0.8), { station: 'sealed' }, b, 0, 1.35, 0.4);
  segs(LIFT.stubSegs, [[LIFT_DX - 0.6, z1], [x0, z1], [x0, z0 + 0.24], [x1, z0 + 0.24], [x1, z1], [LIFT_DX + 0.6, z1]], 0.33);
}
// The bridge's own lift doors and door reveal face into the car, where the bake has no good light (it was baked
// before the car existed), so they take the car's materials. Seen from the bridge they still match the other doors.
{
  const d = DOORS.find((q) => q.station === 'lift'), swap = new Map([[MAT.gun, LIFT_MAT.gun], [MAT.panel, LIFT_MAT.panel], [MAT.steel, LIFT_MAT.steel]]);
  [d.L, d.Rr, ...d.reveal].forEach((o) => o.traverse((c) => { if (c.isMesh && swap.has(c.material)) c.material = swap.get(c.material); }));
}

// ---------- sound: the doors and the ride ----------
function liftDoorSound() {
  if (!AC || !soundOn || !noiseBuf) return; const t0 = AC.currentTime;
  const n = AC.createBufferSource(); n.buffer = noiseBuf; const hp = AC.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 900; hp.Q.value = 0.7;
  const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.18, t0 + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
  n.connect(hp); hp.connect(g); g.connect(master); n.start(t0, Math.random() * 2); n.stop(t0 + 0.75);
}
function liftRideSound(dur, down) {
  if (!AC || !soundOn || !noiseBuf) return; const t0 = AC.currentTime, t1 = t0 + dur;
  const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(48, t0); o.frequency.linearRampToValueAtTime(down ? 62 : 78, t0 + dur * 0.4); o.frequency.linearRampToValueAtTime(48, t1);
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
  const og = AC.createGain(); og.gain.setValueAtTime(0.0001, t0); og.gain.linearRampToValueAtTime(0.09, t0 + 0.5); og.gain.setValueAtTime(0.09, t1 - 0.6); og.gain.exponentialRampToValueAtTime(0.0001, t1);
  o.connect(lp); lp.connect(og); og.connect(master); o.start(t0); o.stop(t1 + 0.05);
  const n = AC.createBufferSource(); n.buffer = noiseBuf; n.loop = true; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(260, t0); bp.frequency.linearRampToValueAtTime(down ? 420 : 620, t0 + dur * 0.5); bp.frequency.linearRampToValueAtTime(260, t1);
  const ng = AC.createGain(); ng.gain.setValueAtTime(0.0001, t0); ng.gain.linearRampToValueAtTime(0.22, t0 + 0.6); ng.gain.setValueAtTime(0.22, t1 - 0.7); ng.gain.exponentialRampToValueAtTime(0.0001, t1);
  n.connect(bp); bp.connect(ng); ng.connect(master); n.start(t0); n.stop(t1 + 0.05);
}

// ---------- switching decks: only one deck is in the scene at a time ----------
function liftSetDeck(n) {
  if (n !== 1 && !LIFT.deck1) {
    // first time away: gather everything that makes up Deck 1 into one group so it can be hidden in one go
    LIFT.deck1 = new THREE.Group(); LIFT.deck1.name = 'Deck 1';
    scene.children.slice().forEach((o) => { if (o !== LIFT.root && o !== LIFT.stub && o !== DECK2 && !o.userData.keep && !o.isLight && !o.isCamera) LIFT.deck1.add(o); });
    scene.add(LIFT.deck1);
  }
  LIFT.deck = n;
  if (LIFT.deck1) LIFT.deck1.visible = n === 1;
  DECK2.visible = n === 2;
  LIFT.stub.visible = n > 2; LIFT.stub.position.y = deckY(n);
  if (n === 1 && LIFT.envStale) { LIFT.envStale = false; bakeEnv(); }
  LIFT.panels.forEach(liftPanelDraw);
}
// each deck is 3.5 m below the one above; the car really travels between them
const deckY = (n) => -(n - 1) * 3.5;
function liftGo(n) {
  if (LIFT.phase !== 'idle' || n === LIFT.deck) return;
  if (!inCar(player.x, player.z)) { toast('Step into the lift car first, then choose a deck on the panel.', 'Lift'); return; }
  LIFT.from = LIFT.deck; LIFT.to = n; LIFT.phase = 'closing'; LIFT.t = 0;
  closePanel(); beep([1046, 784], 0.07, 0.035);
}
function liftUpdate(dt) {
  const inside = inCar(player.x, player.z); LIFT.inside = inside;
  let want = 0; LIFT.t += dt; LIFT.shake = 0;
  if (LIFT.phase === 'idle') {
    want = !state.sitting && (inside || Math.hypot(player.x - LIFT_DX, player.z - LIFT_DZ) < 1.7) ? 1 : 0;
    if (want && LIFT.door < 0.05 && !LIFT.hiss) { LIFT.hiss = true; liftDoorSound(); } else if (!want && LIFT.door > 0.95 && LIFT.hiss) { LIFT.hiss = false; liftDoorSound(); }
  } else if (LIFT.phase === 'closing') {
    if (LIFT.hiss) { LIFT.hiss = false; liftDoorSound(); }
    if (LIFT.door < 0.02 && LIFT.t > 0.6) {
      LIFT.phase = 'moving'; LIFT.t = 0; LIFT.dur = Math.min(5, 2.2 + 0.55 * Math.abs(LIFT.to - LIFT.from));
      liftSetDeck(LIFT.to); liftRideSound(LIFT.dur, LIFT.to > LIFT.from);
    }
  } else if (LIFT.phase === 'moving') {
    const a = clamp(LIFT.t / LIFT.dur, 0, 1), dir = LIFT.to > LIFT.from ? 1 : -1;
    // a little lift when the car starts down (and a sink when it starts up), easing out as it settles
    if (!reduceMotion) LIFT.shake = 0.03 * dir * Math.sin(Math.PI * a) * (1 - a) + 0.0025 * Math.sin(LIFT.t * 43) * Math.sin(Math.PI * a);
    const e = a * a * (3 - 2 * a); LIFT.root.position.y = deckY(LIFT.from) + (deckY(LIFT.to) - deckY(LIFT.from)) * e;
    if (inside) player.y = LIFT.root.position.y + EYE;
    if (a >= 1) {
      LIFT.root.position.y = deckY(LIFT.to);
      LIFT.phase = 'opening'; LIFT.t = 0; beep([784, 1046, 1318], 0.1, 0.04); liftDoorSound(); LIFT.hiss = true;
      const d = liftDeck(LIFT.deck); toast(d.built ? `Deck ${d.n}, ${d.name}.` : `Deck ${d.n}, ${d.name}. This deck is still sealed for fitting-out.`, 'Lift');
    }
  } else if (LIFT.phase === 'opening') {
    want = 1; if (LIFT.door > 0.97) LIFT.phase = 'idle';
  }
  LIFT.door += (want - LIFT.door) * Math.min(1, dt * 4.5);
  [LIFT.stubDoor, D2.door].forEach((s) => { s.L.position.x = -0.3 - LIFT.door * 0.56; s.Rr.position.x = 0.3 + LIFT.door * 0.56; });
  // light level follows the ship's lighting setting and dims at red alert, like the baked decks
  const k = LIGHT_LEVELS[state.light] * (state.alert === 'red' ? 0.34 : 1);
  if (k !== LIFT.k) { LIFT.k = k; LIFT.mats.forEach((m) => { m.lightMapIntensity = m.userData.lmBase * k; }); LUM.forEach((m) => m.color.setHex(state.alert === 'red' ? 0xffb0a0 : 0xffffff).multiplyScalar(LIFT.lum * Math.min(1, 0.4 + 0.6 * k))); }
  CAR_SLOT.color.copy(SLOT.color).multiplyScalar(0.22);
  const key = liftPanelKey(); LIFT.panels.forEach((p) => { if (p.key !== key) liftPanelDraw(p); });
  if (state.alert === 'yellow' && (LIFT.blink = (LIFT.blink || 0) + dt) > 0.15) { LIFT.blink = 0; LIFT.panels.forEach((p) => { if (inside || LIFT.deck !== 1) liftPanelDraw(p); }); }
}
const liftLocked = () => LIFT.phase === 'closing' || LIFT.phase === 'moving';
function liftLocation(roomLabel) {
  const d = liftDeck(LIFT.deck);
  if (LIFT.inside) return `Lift 1 · Deck ${d.n}`;
  if (LIFT.deck === 2) { const r = D2.rooms.find((q) => player.x > q.x0 && player.x < q.x1 && player.z > q.z0 && player.z < q.z1); return `${r ? r.label : d.name} · Deck 2`; }
  if (LIFT.deck !== 1) return `${d.name} · Deck ${d.n}`;
  return (roomLabel || 'Main Bridge') + ' · Deck 1';
}
// is this object (and every group above it) showing? Used to ignore stations and walls on hidden decks.
function shown(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }

// ---------- stations ----------
Object.assign(STATIONS, {
  lift: { title: 'Lift 1', role: '', panel: () => {
    const d = liftDeck(LIFT.deck); STATIONS.lift.role = `Deck ${d.n} · ${d.name}`;
    return { read: [['Car', LIFT.phase === 'idle' ? `Here, at Deck ${d.n}` : 'In motion'], ['Serves', 'Decks 1 to 6, forward']],
      note: 'Step into the car and use the panel on its back wall to choose a deck.', acts: [] };
  } },
  liftcar: { title: 'Lift 1', role: 'Choose a deck', panel: () => {
    const d = liftDeck(LIFT.deck);
    return { read: [['Now at', `Deck ${d.n} · ${d.name}`], ['Fitted out', 'Decks 1 and 2']],
      note: LIFT.inside ? 'Deck 2 has the captain’s quarters and the wardroom. Decks 3 to 6 open onto a sealed lobby until they are built.' : 'Step into the car first.',
      acts: LIFT_DECKS.map((x) => ({ label: `${x.n} · ${x.short.charAt(0) + x.short.slice(1).toLowerCase()}`, on: x.n === LIFT.deck, disabled: x.n === LIFT.deck || LIFT.phase !== 'idle', fn: () => liftGo(x.n) })) };
  } },
  deckdir: { title: 'Deck directory', role: '', panel: () => {
    const d = liftDeck(LIFT.deck); STATIONS.deckdir.role = `Deck ${d.n} · ${d.name}`;
    if (d.n === 2) return { read: [['Open', d.rooms.join(', ')], ['Still sealed', d.sealed.join(', ')]], note: 'The captain’s quarters are forward through the door ahead of the lift. The corridor runs aft to the wardroom.', acts: [] };
    return { read: [['On this deck', (d.rooms || []).join(', ') || 'Main bridge, ready room, conference room'], ['Status', d.built ? 'Open' : 'Sealed for fitting-out']],
      note: 'Not built yet. Take the lift back up, or look around another deck.', acts: [] };
  } },
  sealed: { title: 'Sealed bulkhead', role: '', panel: () => {
    STATIONS.sealed.role = `Deck ${LIFT.deck} · fitting-out`;
    return { read: [['Beyond', 'The rest of the deck'], ['Access', 'Closed to the crew']], note: 'Construction crews are still fitting out this deck. Ride back up to the bridge in Lift 1.', acts: [] };
  } },
});
Object.assign(STATIONS, {
  capq: { title: 'Captain’s quarters', role: 'Deck 2 · forward', panel: () => ({ read: [['Inside', 'Day cabin, dining table, desk, galley, sleeping cabin'], ['Viewport', 'Forward, armored, shuttered at Red Alert']], note: 'Walk up to the door to go in.', acts: [] }) },
  wardoor: { title: 'Officers’ wardroom', role: 'Deck 2 · aft', panel: () => ({ read: [['Inside', 'Table for ten, sideboard, the ship’s crest'], ['Viewport', 'Starboard']], note: 'Walk up to the door to go in.', acts: [] }) },
  d2sealed: { title: 'Sealed cabin', role: 'Deck 2 · fitting-out', panel: () => ({ read: [['Status', 'Sealed'], ['Next', 'First officer’s and senior officers’ quarters, then the observation lounge']], note: 'These cabins open in the next stage of the build.', acts: [] }) },
  qdesk: { title: 'Captain’s desk', role: 'Personal log', panel: () => ({ read: [['Entry', LOG[state.logIdx].d], ['Reports', state.reports ? state.reports + ' to sign' : 'All signed']], note: LOG[state.logIdx].t,
    acts: [{ label: 'Next entry', fn: () => { state.logIdx = (state.logIdx + 1) % LOG.length; redrawStation('qdesk'); redrawStation('desk'); renderPanel(); } }, { label: 'Sign a report', disabled: !state.reports, fn: () => { state.reports = Math.max(0, state.reports - 1); toast('Report signed.', 'Yeoman'); renderPanel(); } }] }) },
  qgalley: { title: 'Galley', role: 'Captain’s quarters', panel: () => ({ read: [['Synthesizer', 'Ready'], ['Last order', state.qcup || 'None']], note: 'A small galley for the captain’s own table.',
    acts: [['Coffee, black'], ['Mint tea'], ['Hot chocolate'], ['Soup of the day']].map(([n]) => ({ label: n, on: state.qcup === n, fn: () => { state.qcup = n; beep([660, 990], 0.08, 0.04); toast(`${n}. Ready in the niche.`, 'Galley'); renderPanel(); } })) }) },
  wardroom: { title: 'Wardroom', role: 'Mess board', panel: () => ({ read: [['Next meal', 'Officers’ dinner, 1830'], ['Host', 'First officer'], ['Seats', '10, two guests tonight']], note: 'The officers eat here and meet off watch. The captain dines here on the first night of every patrol.', acts: [] }) },
});
FUNC.liftcar = FUNC.deckdir = FUNC.sealed = 'acc';
// Deck 2 is in the light bake (it had to be showing when the bake layout was made); hide it until you ride down
DECK2.visible = false;
