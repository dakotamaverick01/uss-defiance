// USS Defiance · core.js
// Constants, renderer, shared helpers and ship state. Loads first; everything else builds on it.
// Files share one global scope and load in order (see index.html).
'use strict';

const $ = (id) => document.getElementById(id);
if (typeof THREE === 'undefined') { window.DEFIANCE_FAILED = true; $('nogl').hidden = false; $('intro').hidden = true; throw new Error('three.js failed to load'); }
// Keep the r128 colour behaviour (hex colours used as-is) until Stage 1 moves the ship to a fully colour-managed pipeline.
THREE.ColorManagement.enabled = false;

const D2R = Math.PI / 180;
const WALL_H = 3.3, DAIS = { x: 0, z: 0.4, r: 2.0, h: 0.22 }, PR = 0.3, EYE = 1.62, FWD_Z = -6.0, AFT_Z = 6.2;
// Faceted room plan (x, z), forward is -z. Every wall sits 0.8 m further out than the first build, for wider walkways;
// the dais, flight and ops pods and the situation table stay where they were.
const ROOM = [[-3.55, -6.0], [3.55, -6.0], [6.4, -2.913], [6.4, 2.856], [4.012, 6.2], [-4.012, 6.2], [-6.4, 2.856], [-6.4, -2.913]];
const SIDE_X = 6.4; // the side walls, where the console runs stand
// Ceiling height in the rooms off the bridge (the bridge itself is WALL_H)
const ROOM_H = 3.1;
const isTouch = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// a tall condensed face suits block screens; falls back to narrow system faces
const DISP = "Antonio, 'Arial Narrow', 'Roboto Condensed', Oxanium, sans-serif";
const MONO = "'JetBrains Mono', Menlo, monospace";

// ---------- renderer ----------
const canvas = $('view');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) { window.DEFIANCE_FAILED = true; $('nogl').hidden = false; $('intro').hidden = true; throw e; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
// No shadow maps: shadows are baked (bake.js). The fallback light rig turns them back on.
renderer.shadowMap.enabled = false; renderer.shadowMap.type = THREE.PCFShadowMap;
const isMobile = isTouch || Math.min(window.innerWidth, window.innerHeight) < 600;
const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030305);
// a faint haze: distant parts of the room soften slightly, and the light shafts (render.js) have something to show in
const FOG = new THREE.FogExp2(0x221d18, 0.03);
scene.fog = FOG;
const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 900);
camera.rotation.order = 'YXZ';

// ---------- helpers ----------
// a small marker block: a rounded square (the interface has no outlines or hexagons)
function hexNode(g, cx, cy, rad) { const s = rad * 0.86, r = rad * 0.3; g.beginPath(); g.moveTo(cx - s + r, cy - s); g.arcTo(cx + s, cy - s, cx + s, cy + s, r); g.arcTo(cx + s, cy + s, cx - s, cy + s, r); g.arcTo(cx - s, cy + s, cx - s, cy - s, r); g.arcTo(cx - s, cy - s, cx + s, cy - s, r); g.closePath(); }
function cnv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(c, srgb) { const t = new THREE.CanvasTexture(c); if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t; }
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function smooth(a, b, v) { const x = clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
function add(o, parent) { (parent || scene).add(o); return o; }
function mesh(geo, mat, x, y, z, parent) { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return add(m, parent); }
function group(x, y, z, rotY, parent) { const g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); g.rotation.y = rotY || 0; return add(g, parent); }
const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const CYL = (a, b, h, s) => new THREE.CylinderGeometry(a, b, h, s || 20);
const _rb = new Map();
function RBOX(w, h, d, r) {
  r = Math.min(r === undefined ? 0.03 : r, w / 2 - 0.003, h / 2 - 0.003, d / 2 - 0.003);
  const key = w.toFixed(3) + ',' + h.toFixed(3) + ',' + d.toFixed(3) + ',' + r.toFixed(3);
  if (_rb.has(key)) return _rb.get(key);
  let geo;
  if (r < 0.006) geo = new THREE.BoxGeometry(w, h, d);
  else {
    const sw = w - 2 * r, sh = h - 2 * r, x0 = -sw / 2, y0 = -sh / 2, rc = Math.max(0.0005, Math.min(r, sw / 2, sh / 2) * 0.95);
    const s = new THREE.Shape();
    s.moveTo(x0 + rc, y0); s.lineTo(x0 + sw - rc, y0); s.quadraticCurveTo(x0 + sw, y0, x0 + sw, y0 + rc);
    s.lineTo(x0 + sw, y0 + sh - rc); s.quadraticCurveTo(x0 + sw, y0 + sh, x0 + sw - rc, y0 + sh);
    s.lineTo(x0 + rc, y0 + sh); s.quadraticCurveTo(x0, y0 + sh, x0, y0 + sh - rc);
    s.lineTo(x0, y0 + rc); s.quadraticCurveTo(x0, y0, x0 + rc, y0);
    geo = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 2, curveSegments: 3 });
    geo.translate(0, 0, -(d - 2 * r) / 2);
  }
  _rb.set(key, geo); return geo;
}
// ---------- block shapes for the interface (screens, signs, labels) ----------
// a block with rounded (half-height) ends on the chosen sides: the basic pill of the interface
function hexTab(g, x, y, w, h, l, r) {
  const R = Math.min(h / 2, w / 2); g.beginPath();
  g.moveTo(x + (l ? R : 0), y); g.lineTo(x + w - (r ? R : 0), y);
  if (r) g.arc(x + w - R, y + h / 2, R, -Math.PI / 2, Math.PI / 2); else g.lineTo(x + w, y + h);
  g.lineTo(x + (l ? R : 0), y + h);
  if (l) g.arc(x + R, y + h / 2, R, Math.PI / 2, Math.PI * 1.5); else g.lineTo(x, y);
  g.closePath();
}
function rrect(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
// an elbow: a vertical column block that turns into a horizontal bar, with a rounded outer corner and a scooped inner one
function elbow(g, x, y, colW, barH, len, ext, up, color) {
  const R = Math.min(colW * 0.95, ext + barH), r = Math.min(barH * 0.9, colW * 0.5);
  g.beginPath();
  if (up) {
    g.moveTo(x, y + barH + ext); g.lineTo(x, y + R); g.arcTo(x, y, x + R, y, R); g.lineTo(x + len, y); g.lineTo(x + len, y + barH);
    g.lineTo(x + colW + r, y + barH); g.arcTo(x + colW, y + barH, x + colW, y + barH + r, r); g.lineTo(x + colW, y + barH + ext);
  } else {
    g.moveTo(x, y - barH - ext); g.lineTo(x, y - R); g.arcTo(x, y, x + R, y, R); g.lineTo(x + len, y); g.lineTo(x + len, y - barH);
    g.lineTo(x + colW + r, y - barH); g.arcTo(x + colW, y - barH, x + colW, y - barH - r, r); g.lineTo(x + colW, y - barH - ext);
  }
  g.closePath(); g.fillStyle = color; g.fill();
}
function space(o) { o.layers.set(1); return o; }
function shapeXZ(pts, flip) { const s = new THREE.Shape(); pts.forEach(([x, z], i) => { const y = flip ? -z : z; i ? s.lineTo(x, y) : s.moveTo(x, y); }); s.closePath(); return s; }
function pathXZ(pts, flip) { const s = new THREE.Path(); pts.forEach(([x, z], i) => { const y = flip ? -z : z; i ? s.lineTo(x, y) : s.moveTo(x, y); }); s.closePath(); return s; }
function insetPoly(P, d) {
  const n = P.length, cx = P.reduce((a, p) => a + p[0], 0) / n, cz = P.reduce((a, p) => a + p[1], 0) / n;
  const L = P.map((A, i) => {
    const B = P[(i + 1) % n]; let dx = B[0] - A[0], dz = B[1] - A[1]; const len = Math.hypot(dx, dz); dx /= len; dz /= len;
    let nx = -dz, nz = dx; if ((cx - A[0]) * nx + (cz - A[1]) * nz < 0) { nx = -nx; nz = -nz; }
    return { px: A[0] + nx * d, pz: A[1] + nz * d, dx, dz };
  });
  return L.map((l, i) => { const m = L[(i - 1 + n) % n]; const den = m.dx * l.dz - m.dz * l.dx; const t = ((l.px - m.px) * l.dz - (l.pz - m.pz) * l.dx) / den; return [m.px + m.dx * t, m.pz + m.dz * t]; });
}
// wall edges with inward normals
const CX = 0, CZ = 0.1;
const EDGES = ROOM.map((A, i) => {
  const B = ROOM[(i + 1) % ROOM.length]; const dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz);
  let nx = -dz / len, nz = dx / len; if ((CX - A[0]) * nx + (CZ - A[1]) * nz < 0) { nx = -nx; nz = -nz; }
  return { A, B, len, nx, nz, mx: (A[0] + B[0]) / 2, mz: (A[1] + B[1]) / 2, rot: Math.atan2(nx, nz), tx: dx / len, tz: dz / len };
});
// point along edge i at t (0..1), pushed inward by d
function onEdge(i, t, d) { const e = EDGES[i]; return [e.A[0] + (e.B[0] - e.A[0]) * t + e.nx * d, e.A[1] + (e.B[1] - e.A[1]) * t + e.nz * d]; }
// walk-through doorways: edge index -> door position along the edge
const DOOR_GAPS = { 3: 0.38, 4: 0.174, 5: 0.4 };
// the Lift 1 car opens off the aft wall too (lift.js builds the car behind it)
const LIFT_GAP = { edge: 4, t: 0.826 };
const WALL_SEGS = [], extraObs = [], OCCLUDERS = [];
function addSeg(ax, az, bx, bz, r) { WALL_SEGS.push([ax, az, bx, bz, r === undefined ? PR : r]); }
function wallPiece(mat, A, dir, nrm, s0, s1, y0, y1, H, uScale, parent) {
  const w = s1 - s0, h = y1 - y0; if (w <= 0.001 || h <= 0.001) return null;
  const geo = new THREE.PlaneGeometry(w, h), pos = geo.attributes.position, uv = geo.attributes.uv;
  const rot = Math.atan2(nrm[0], nrm[1]);
  const sgn = (Math.cos(rot) * dir[0] - Math.sin(rot) * dir[1]) >= 0 ? 1 : -1;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (s0 + w / 2 + pos.getX(i) * sgn) / uScale, (y0 + h / 2 + pos.getY(i)) / H);
  const m = mesh(geo, mat, A[0] + dir[0] * (s0 + w / 2), y0 + h / 2, A[1] + dir[1] * (s0 + w / 2), parent);
  m.rotation.y = rot; OCCLUDERS.push(m); return m;
}

// ---------- state ----------
const SYSTEMS = [
  { star: 'Corvan', planet: 'Kessra IV', type: 'ocean', cls: 'Temperate ocean world', atm: 'Nitrogen-oxygen, 1.1 atm', life: 'Abundant, non-sentient', dist: '1.9 million km', heading: '031 mark 12', planets: 4, featured: 3, starColor: 0xffe2a8, halo: '120,190,255', seed: 11 },
  { star: 'Iralis', planet: 'Iralis b', type: 'gas', cls: 'Banded gas giant', atm: 'Hydrogen-helium', life: 'None detected', dist: '6.4 million km', heading: '214 mark 08', planets: 6, featured: 1, starColor: 0xfff4e0, halo: '255,200,140', seed: 23 },
  { star: 'Thessaly Drift', planet: 'Mira Vey', type: 'ice', cls: 'Ice-shelled moon', atm: 'Thin nitrogen, 0.02 atm', life: 'Microbial, under the ice', dist: '880,000 km', heading: '147 mark 30', planets: 3, featured: 2, starColor: 0xcfe0ff, halo: '190,225,255', seed: 37 },
  { star: 'Okonkwo-9', planet: 'Ashfall', type: 'lava', cls: 'Young volcanic world', atm: 'Sulfur dioxide, 4 atm', life: 'None detected', dist: '2.7 million km', heading: '302 mark 04', planets: 5, featured: 0, starColor: 0xffc890, halo: '255,140,90', seed: 41 },
];
const SPEEDS = {
  stop: { speed: 0, len: 0, name: 'All stop', screen: 'ALL STOP' },
  impulse: { speed: 12, len: 0.6, name: 'Impulse, one quarter', screen: 'IMPULSE ¼' },
  warp: { speed: 420, len: 48, name: 'Warp 6', screen: 'WARP 6' },
};
// Alerts: at Yellow the peach frames pulse toward butterscotch; at Red they turn red, the lilac dims and the room
// lights drop and redden. strip = deck edge strips, slot = cove lights, light = tint of the baked room light.
const ALERTS = {
  green: { label: 'Condition Green', short: 'GREEN', acc: '#E8A06A', rgb: '232, 160, 106', line: '#2B2229', strip: 0xffe2c4, slot: 0xfff0dc, light: 0xffe6cc },
  yellow: { label: 'Yellow Alert', short: 'YELLOW', acc: '#F2C88F', rgb: '242, 200, 143', line: '#2B2229', strip: 0xf2c88f, slot: 0xffe08a, light: 0xffe8b8 },
  red: { label: 'Red Alert', short: 'RED', acc: '#E0524A', rgb: '224, 82, 74', line: '#2B2229', strip: 0xe04848, slot: 0xff3020, light: 0xff6a58 },
};
const LIGHT_LEVELS = { dim: 0.55, standard: 1, bright: 1.35 };
const state = {
  speed: 'stop', alert: 'green', light: 'standard', cur: 0, dest: 1, holo: 0, holoOn: true, view: 'forward', logIdx: 0, reports: 4, slide: 0, shutters: 'auto', cup: null,
  scanning: false, scanned: false, scanT: 0, sitting: false, open: null, bayDoors: false,
  comms: [
    { at: 0, who: 'Meridian Station', text: 'Defiance, you are cleared to begin your survey.' },
    { at: 0, who: 'Convoy Lead', text: 'Freighters are formed up behind you. Thanks for the escort.' },
  ],
};
const cur = { speed: 0, len: 0 };
let elapsed = 0;
const sysCur = () => SYSTEMS[state.cur];
const sysDest = () => SYSTEMS[state.dest];
// Display palette (palette A): peach frames and bars, tan and butterscotch readouts, lilac as the second colour,
// rose and plum as small accents, cream for values. ok / warn / bad are status colours and mean status only.
const COLORS = { bg: '#000000', frame: '#2B2229', peach: '#E8A06A', peachHot: '#FFC48C', tan: '#D9B07E', butter: '#F2C88F', lilac: '#B693C4', lilacDim: '#6E5A78', rose: '#C67A86', plum: '#7E5C8E', cream: '#F5E6CF',
  amber: '#E8A06A', amberDim: '#9C6A48', amberHot: '#FFC48C', ice: '#B693C4', iceDim: '#6E5A78', white: '#F5E6CF', dim: '#9A8678', ok: '#8DBF84', warn: '#F0B44C', bad: '#E05A50', red: '#E0524A' };
function mixHex(a, b, t) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
const pal = () => {
  const C = COLORS, a = state.alert, red = a === 'red';
  const acc = red ? C.red : a === 'yellow' ? mixHex(C.peach, C.butter, 0.5 + 0.5 * Math.sin(elapsed * 4)) : C.peach;
  const ice = red ? C.lilacDim : C.lilac, tan = red ? '#B8665C' : C.tan, butter = red ? '#E9907A' : C.butter;
  return { acc, accDim: red ? '#7A2A2A' : C.amberDim, ice, sand: tan, tan, butter, rose: red ? '#A8443E' : C.rose, plum: red ? '#5A2C34' : C.plum, green: C.ok, yel: C.warn, red: C.bad, sec: ice, rust: C.bad, line: C.frame, bg: C.bg, dim: C.dim, txt: C.cream, key: a };
};
