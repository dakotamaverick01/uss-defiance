// USS Defiance · core.js
// Constants, renderer, shared helpers and ship state. Loads first; everything else builds on it.
// Files share one global scope and load in order (see index.html).
'use strict';

const $ = (id) => document.getElementById(id);
if (typeof THREE === 'undefined') { window.DEFIANCE_FAILED = true; $('nogl').hidden = false; $('intro').hidden = true; throw new Error('three.js failed to load'); }
// Keep the r128 colour behaviour (hex colours used as-is) until Stage 1 moves the ship to a fully colour-managed pipeline.
THREE.ColorManagement.enabled = false;
// three.js now uses physical light units. These factors reproduce the old look; Stage 1 relights the ship properly.
const LX_AMB = window.LX_A ?? Math.PI, LX_PUNCT = window.LX_P ?? Math.PI * 0.75;

const D2R = Math.PI / 180;
const WALL_H = 3.3, DAIS = { x: 0, z: 0.4, r: 2.0, h: 0.22 }, PR = 0.3, EYE = 1.62, FWD_Z = -5.2, AFT_Z = 5.4;
// Faceted room plan (x, z), forward is -z.
const ROOM = [[-3.2, -5.2], [3.2, -5.2], [5.6, -2.6], [5.6, 2.6], [3.6, 5.4], [-3.6, 5.4], [-5.6, 2.6], [-5.6, -2.6]];
const isTouch = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DISP = "Oxanium, 'Arial Narrow', sans-serif";
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
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
const isMobile = isTouch || Math.min(window.innerWidth, window.innerHeight) < 600;
const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030305);
const FOG = new THREE.Fog(0x0d0a08, 9, 26);
scene.fog = FOG;
const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 900);
camera.rotation.order = 'YXZ';

// ---------- helpers ----------
function hexNode(g, cx, cy, rad) { g.beginPath(); for (let i = 0; i < 6; i++) { const a = (60 * i) * D2R; const px = cx + rad * Math.cos(a), py = cy + rad * Math.sin(a); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); }
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
const ALERTS = {
  green: { label: 'Condition Green', short: 'GREEN', acc: '#4C8DFF', rgb: '76, 141, 255', line: '#1A2230', strip: 0x3d7bff, slot: 0xffe6cc, light: 0xffe6cc },
  yellow: { label: 'Yellow Alert', short: 'YELLOW', acc: '#FFD21F', rgb: '255, 210, 31', line: '#1A2230', strip: 0xffc800, slot: 0xffe08a, light: 0xffe8b8 },
  red: { label: 'Red Alert', short: 'RED', acc: '#FF3B30', rgb: '255, 59, 48', line: '#1A2230', strip: 0xff2015, slot: 0xff3020, light: 0xff8a74 },
};
const LIGHT_LEVELS = { dim: 0.55, standard: 1, bright: 1.35 };
const state = {
  speed: 'stop', alert: 'green', light: 'standard', cur: 0, dest: 1, holo: 0, holoOn: true, view: 'forward', logIdx: 0, reports: 4, slide: 0, shutters: 'auto', cup: null,
  scanning: false, scanned: false, scanT: 0, sitting: false, liftOpen: false, open: null,
  comms: [
    { at: 0, who: 'Meridian Station', text: 'Defiance, you are cleared to begin your survey.' },
    { at: 0, who: 'Convoy Lead', text: 'Freighters are formed up behind you. Thanks for the escort.' },
  ],
};
const cur = { speed: 0, len: 0 };
let elapsed = 0;
const sysCur = () => SYSTEMS[state.cur];
const sysDest = () => SYSTEMS[state.dest];
const pal = () => { const a = ALERTS[state.alert]; return { acc: a.acc, green: '#34E89E', yel: '#FFD21F', red: '#FF3B30', ice: '#C9D6EA', sec: '#34E89E', sand: '#C9D6EA', rust: '#FF3B30', line: '#1A2230', dim: '#7D8BA3', txt: '#EAF2FF', key: state.alert }; };