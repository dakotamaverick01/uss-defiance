// USS Defiance · materials.js
// Emblem, procedural surface textures, reflection environment and the material library.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- emblem (original: hexagon + compass star) ----------
function drawCrest(g, cx, cy, s, color, lw) {
  g.save(); g.translate(cx, cy); g.strokeStyle = color; g.fillStyle = color; g.lineWidth = lw;
  g.beginPath();
  for (let i = 0; i < 6; i++) { const a = (60 * i - 90) * D2R; const px = s * Math.cos(a), py = s * Math.sin(a); i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.closePath(); g.stroke();
  const star = (L, W, rot) => {
    g.save(); g.rotate(rot); g.beginPath();
    g.moveTo(0, -L); g.lineTo(W, -W); g.lineTo(L * 0.62, 0); g.lineTo(W, W); g.lineTo(0, L); g.lineTo(-W, W); g.lineTo(-L * 0.62, 0); g.lineTo(-W, -W);
    g.closePath(); g.fill(); g.restore();
  };
  star(s * 0.78, s * 0.11, 0);
  g.globalAlpha *= 0.55; star(s * 0.42, s * 0.07, Math.PI / 4);
  g.restore();
}

// ---------- surface textures ----------
function noise(g, W, H, n, a, seed) { const r = mulberry(seed); for (let i = 0; i < n; i++) { g.fillStyle = r() < 0.5 ? `rgba(255,240,220,${a})` : `rgba(0,0,0,${a * 1.4})`; g.fillRect(r() * W, r() * H, 1.4, 1.4); } }
function fastener(g, x, y, r) { g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.arc(x + 1, y + 1, r, 0, 7); g.fill(); g.fillStyle = '#8f8880'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.4, 0, 7); g.fill(); }
// Wall: one 1.2 m bay x 3.3 m at 160 px/m. Canvas top = ceiling.
function wallCanvases() {
  const W = 192, H = 528, Y = (m) => H - m * 160;
  const c = cnv(W, H), g = c.getContext('2d'), e = cnv(W, H), ge = e.getContext('2d');
  // upper service band
  g.fillStyle = '#3e3934'; g.fillRect(0, 0, W, Y(2.72));
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(24, 18 + i * 11, W - 48, 4); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(24, 22 + i * 11, W - 48, 1); }
  // main panel
  const gr = g.createLinearGradient(0, Y(2.72), 0, Y(1.02)); gr.addColorStop(0, '#a59c90'); gr.addColorStop(1, '#8c8478');
  g.fillStyle = gr; g.fillRect(0, Y(2.72), W, Y(1.02) - Y(2.72));
  [[2.62, 1.92], [1.86, 1.1]].forEach(([top, bot]) => {
    const x0 = 14, x1 = W - 14, y0 = Y(top), y1 = Y(bot);
    g.fillStyle = 'rgba(60,45,30,0.08)'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = 'rgba(255,250,240,0.5)'; g.fillRect(x0, y1 - 2, x1 - x0, 2); g.fillRect(x1 - 2, y0, 2, y1 - y0);
    g.fillStyle = 'rgba(40,28,18,0.4)'; g.fillRect(x0, y0, x1 - x0, 2); g.fillRect(x0, y0, 2, y1 - y0);
    [[x0 + 8, y0 + 8], [x1 - 8, y0 + 8], [x0 + 8, y1 - 8], [x1 - 8, y1 - 8]].forEach(([fx, fy]) => fastener(g, fx, fy, 2.2));
  });
  // steel rail
  g.fillStyle = '#7d7871'; g.fillRect(0, Y(1.02), W, Y(0.95) - Y(1.02));
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(0, Y(1.02), W, 2);
  // armored dado
  g.fillStyle = '#3a3633'; g.fillRect(0, Y(0.95), W, Y(0.12) - Y(0.95));
  g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 2; g.strokeRect(10, Y(0.9), W - 20, Y(0.17) - Y(0.9));
  g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 1; g.strokeRect(12, Y(0.88), W - 24, Y(0.19) - Y(0.88));
  [[20, Y(0.84)], [W - 20, Y(0.84)], [20, Y(0.24)], [W - 20, Y(0.24)], [W / 2, Y(0.84)], [W / 2, Y(0.24)]].forEach(([x, y]) => fastener(g, x, y, 2.6));
  // kick plate
  g.fillStyle = '#262422'; g.fillRect(0, Y(0.12), W, H - Y(0.12));
  noise(g, W, H, 2600, 0.035, 5);
  // light seams
  g.fillStyle = '#1e1a16'; g.fillRect(0, Y(2.62), 3, Y(1.1) - Y(2.62)); g.fillRect(W - 3, Y(2.62), 3, Y(1.1) - Y(2.62)); g.fillRect(0, Y(2.72) - 3, W, 5);
  ge.fillStyle = '#000'; ge.fillRect(0, 0, W, H);
  ge.fillStyle = 'rgba(255,255,255,0.75)'; ge.fillRect(0, Y(2.62), 2, Y(1.1) - Y(2.62)); ge.fillRect(W - 2, Y(2.62), 2, Y(1.1) - Y(2.62));
  ge.fillStyle = '#fff'; ge.fillRect(0, Y(2.72) - 2, W, 3);
  return [c, e];
}
function carpetTile() {
  const S = 256, c = cnv(S, S), g = c.getContext('2d');
  g.fillStyle = '#342f2b'; g.fillRect(0, 0, S, S);
  const r = mulberry(9);
  for (let i = 0; i < 4200; i++) { g.fillStyle = r() < 0.5 ? 'rgba(180,140,110,0.08)' : 'rgba(0,0,0,0.12)'; g.fillRect(r() * S, r() * S, 1.3, 1.3); }
  g.strokeStyle = 'rgba(0,0,0,0.06)'; for (let x = 0; x < S; x += 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2; g.strokeRect(0, 0, S, S);
  return c;
}
function plateTile() {
  const S = 256, c = cnv(S, S), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, S, S); gr.addColorStop(0, '#5a5550'); gr.addColorStop(1, '#4b4742'); g.fillStyle = gr; g.fillRect(0, 0, S, S);
  g.fillStyle = 'rgba(255,255,255,0.07)';
  for (let y = 8; y < S; y += 16) for (let x = (y / 16) % 2 ? 16 : 8; x < S; x += 16) { g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillRect(-5, -1.5, 10, 3); g.restore(); }
  noise(g, S, S, 2200, 0.04, 33);
  g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 3; g.strokeRect(1, 1, S - 2, S - 2);
  [[12, 12], [S - 12, 12], [12, S - 12], [S - 12, S - 12]].forEach(([x, y]) => fastener(g, x, y, 3));
  return c;
}
function ceilingTile() {
  const S = 256, c = cnv(S, S), g = c.getContext('2d');
  g.fillStyle = '#5e5851'; g.fillRect(0, 0, S, S);
  noise(g, S, S, 1600, 0.04, 44);
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 3; g.strokeRect(1, 1, S - 2, S - 2);
  g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 1; g.strokeRect(5, 5, S - 10, S - 10);
  for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(70, 98 + i * 14, 116, 5); }
  return c;
}
function daisTexture() {
  const S = 512, m = S / 2, c = cnv(S, S), g = c.getContext('2d');
  g.fillStyle = '#2e2926'; g.fillRect(0, 0, S, S);
  noise(g, S, S, 9000, 0.06, 71);
  g.strokeStyle = 'rgba(150,175,215,0.55)'; g.lineWidth = 3;
  [0.95, 0.9].forEach((f) => { g.beginPath(); g.arc(m, m, f * m, 0, 7); g.stroke(); });
  g.strokeStyle = 'rgba(150,175,215,0.25)'; g.lineWidth = 2;
  for (let a = 0; a < 360; a += 15) { const t = a * D2R; g.beginPath(); g.moveTo(m + Math.cos(t) * 0.9 * m, m + Math.sin(t) * 0.9 * m); g.lineTo(m + Math.cos(t) * 0.82 * m, m + Math.sin(t) * 0.82 * m); g.stroke(); }
  drawCrest(g, m, m + 0.56 * m, 36, 'rgba(150,175,215,0.45)', 3);
  return c;
}
function lightDiscTexture() {
  const S = 512, m = S / 2, c = cnv(S, S), g = c.getContext('2d');
  const gr = g.createRadialGradient(m, m, 0, m, m, m); gr.addColorStop(0, '#fff4e2'); gr.addColorStop(0.7, '#f5d9b4'); gr.addColorStop(1, '#c49a70');
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  g.strokeStyle = 'rgba(70,50,30,0.4)'; g.lineWidth = 6;
  for (let i = 1; i < 6; i++) { g.beginPath(); g.arc(m, m, i * 44, 0, 7); g.stroke(); }
  g.lineWidth = 10; g.strokeStyle = 'rgba(50,38,26,0.6)';
  for (let a = 0; a < 360; a += 45) { const t = a * D2R; g.beginPath(); g.moveTo(m + Math.cos(t) * 46, m + Math.sin(t) * 46); g.lineTo(m + Math.cos(t) * m, m + Math.sin(t) * m); g.stroke(); }
  g.fillStyle = '#3a2e24'; g.beginPath(); g.arc(m, m, 46, 0, 7); g.fill();
  drawCrest(g, m, m, 28, 'rgba(255,190,120,0.8)', 3);
  return c;
}
function radialTex(inner, outer) { const S = 128, c = cnv(S, S), g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, S, S); return tex(c); }
function linearTex(top, bottom) { const c = cnv(4, 64), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, 4, 64); return tex(c); }

// ---------- environment (reflections) ----------
{
  const env = new THREE.Scene(); env.background = new THREE.Color(0x15110d);
  const eb = (col, k, w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); env.add(m); };
  eb(0x2a241e, 1, 14, 0.2, 14, 0, -1, 0);
  eb(0x4a4038, 1, 14, 0.2, 14, 0, 3.4, 0);
  eb(0xffd6a8, 3, 3.4, 0.1, 3.4, 0, 3.3, 0);
  eb(0x86a8e0, 2.2, 5, 2.2, 0.1, 0, 1.8, -5);
  eb(0xffe2c8, 3, 12, 0.08, 0.3, 0, 3.1, 5.2);
  eb(0xffe2c8, 3, 0.3, 0.08, 10, 5.4, 3.1, 0);
  eb(0xffe2c8, 3, 0.3, 0.08, 10, -5.4, 3.1, 0);
  eb(0x6a5e52, 1, 0.2, 3, 12, 5.8, 1.5, 0);
  eb(0x6a5e52, 1, 0.2, 3, 12, -5.8, 1.5, 0);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(env, 0.04).texture;
  scene.environmentIntensity = window.ENV_I ?? 0.65; // the newer reflection prefilter comes out brighter than r128's
  pm.dispose();
}

// ---------- materials ----------
const [wallC, wallE] = wallCanvases();
const wallMap = tex(wallC), wallEm = tex(wallE); wallMap.wrapS = wallEm.wrapS = THREE.RepeatWrapping;
function tile(c, m) { const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / m, 1 / m); return t; }
const MAT = {
  wall: new THREE.MeshStandardMaterial({ map: wallMap, emissiveMap: wallEm, emissive: new THREE.Color(ALERTS.green.slot), emissiveIntensity: 0.7, roughness: 0.78, metalness: 0.08, envMapIntensity: 0.32 }),
  gun: new THREE.MeshStandardMaterial({ color: 0x33322f, metalness: 0.78, roughness: 0.38, envMapIntensity: 0.55 }),
  gunDark: new THREE.MeshStandardMaterial({ color: 0x242322, metalness: 0.6, roughness: 0.5, envMapIntensity: 0.7 }),
  steel: new THREE.MeshStandardMaterial({ color: 0x9a948c, metalness: 0.9, roughness: 0.26, envMapIntensity: 1.1 }),
  panel: new THREE.MeshStandardMaterial({ color: 0x9a9184, roughness: 0.6, metalness: 0.15, envMapIntensity: 0.45 }),
  console: new THREE.MeshStandardMaterial({ map: (() => {
    const S = 512, c = cnv(S, S), g = c.getContext('2d');
    g.fillStyle = '#2e2b28'; g.fillRect(0, 0, S, S); noise(g, S, S, 6000, 0.03, 91);
    g.fillStyle = 'rgba(0,0,0,0.55)'; [0, 256].forEach((x) => g.fillRect(x, 0, 3, S)); [0, 300].forEach((y) => g.fillRect(0, y, S, 3));
    g.fillStyle = 'rgba(255,255,255,0.06)'; [3, 259].forEach((x) => g.fillRect(x, 0, 1, S)); [3, 303].forEach((y) => g.fillRect(0, y, S, 1));
    for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(40, 340 + i * 14, 150, 6); g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(40, 346 + i * 14, 150, 1); }
    for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(296, 340 + i * 14, 150, 6); g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(296, 346 + i * 14, 150, 1); }
    [[14, 14], [242, 14], [14, 286], [242, 286], [270, 14], [498, 14], [270, 286], [498, 286], [14, 316], [242, 316], [270, 316], [498, 316]].forEach(([x, y]) => fastener(g, x, y, 3));
    g.fillStyle = '#1b1917'; g.fillRect(40, 60, 110, 26); g.fillRect(296, 60, 110, 26);
    g.fillStyle = 'rgba(201,214,234,0.55)'; g.font = `600 13px ${MONO}`; g.textBaseline = 'middle'; g.fillText('SVC 14-A', 50, 74); g.fillText('SVC 14-B', 306, 74);
    const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })(), roughness: 0.48, metalness: 0.4, envMapIntensity: 0.75 }),
  cap: new THREE.MeshStandardMaterial({ color: 0x5e5852, roughness: 0.4, metalness: 0.55, envMapIntensity: 0.7 }),
  glassTop: new THREE.MeshStandardMaterial({ color: 0x0c0d0e, roughness: 0.15, metalness: 0.5, envMapIntensity: 1.2 }),
  leather: new THREE.MeshStandardMaterial({ color: 0x4a2416, roughness: 0.5, metalness: 0.05, envMapIntensity: 0.3 }),
  leatherDark: new THREE.MeshStandardMaterial({ color: 0x2a140a, roughness: 0.55, envMapIntensity: 0.2 }),
  floorCarpet: new THREE.MeshStandardMaterial({ map: tile(carpetTile(), 0.6), roughness: 0.96, metalness: 0, envMapIntensity: 0.25 }),
  floorPlate: new THREE.MeshStandardMaterial({ map: tile(plateTile(), 1.2), roughness: 0.5, metalness: 0.6, envMapIntensity: 0.8 }),
  ceiling: new THREE.MeshStandardMaterial({ map: tile(ceilingTile(), 1.2), roughness: 0.85, metalness: 0.2, side: THREE.DoubleSide, envMapIntensity: 0.25 }),
  dais: new THREE.MeshStandardMaterial({ map: tex(daisTexture()), roughness: 0.9, envMapIntensity: 0.3 }),
  hazard: null,
  hit: new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
};
{ const c = cnv(128, 16), g = c.getContext('2d'); g.fillStyle = '#d9a12a'; g.fillRect(0, 0, 128, 16); g.fillStyle = '#1a1714'; for (let x = -16; x < 128; x += 16) { g.beginPath(); g.moveTo(x, 16); g.lineTo(x + 8, 0); g.lineTo(x + 16, 0); g.lineTo(x + 8, 16); g.fill(); } const t = tex(c); t.wrapS = THREE.RepeatWrapping; MAT.hazard = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }); }
const stripMats = [], slotMats = [];
function stripMat() { const m = new THREE.MeshBasicMaterial({ color: ALERTS.green.strip, toneMapped: false }); stripMats.push(m); return m; }
function slotMat() { const m = new THREE.MeshBasicMaterial({ color: ALERTS.green.slot, toneMapped: false }); slotMats.push(m); return m; }
const STRIP = stripMat(), SLOT = slotMat();
const lightDiscMat = new THREE.MeshBasicMaterial({ map: tex(lightDiscTexture()), toneMapped: false });
const downlightMat = new THREE.MeshBasicMaterial({ color: 0xfff0dc, toneMapped: false });
const aoTex = radialTex('rgba(0,0,0,0.75)', 'rgba(0,0,0,0)');
const poolTex = radialTex('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
const wallAoTex = linearTex('rgba(0,0,0,0.55)', 'rgba(0,0,0,0)');
function decal(x, y, z, w, d, map, color, op, additive, rot) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map, color: color || 0xffffff, transparent: true, opacity: op, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = rot || 0; m.position.set(x, y, z); scene.add(m); return m;
}
const ao = (x, z, w, d, op, y) => decal(x, (y || 0) + 0.004, z, w, d, aoTex, 0xffffff, op === undefined ? 0.7 : op, false);
const poolMats = [];
const pool = (x, z, w, d, color, op, y) => { const m = decal(x, (y || 0) + 0.006, z, w, d, poolTex, color, op, true); poolMats.push({ m, op }); return m; };
