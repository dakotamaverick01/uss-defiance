// USS Defiance · screens.js
// Console screen drawing: the instrument widget kit and every station display.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- screen drawing ----------
const bgCache = new Map();
function chamfer(g, x, y, w, h, c) { g.beginPath(); g.moveTo(x + c, y); g.lineTo(x + w, y); g.lineTo(x + w, y + h - c); g.lineTo(x + w - c, y + h); g.lineTo(x, y + h); g.lineTo(x, y + c); g.closePath(); }
function screenBg(W, H, P) {
  const key = W + 'x' + H + P.key; if (bgCache.has(key)) return bgCache.get(key);
  const c = cnv(W, H), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0B0E12'); gr.addColorStop(1, '#07090C'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const s = Math.max(10, Math.min(W, H) / 14);
  g.fillStyle = P.line;
  for (let y = s / 2; y < H; y += s) for (let x = s / 2; x < W; x += s) g.fillRect(x, y, 2, 2);
  g.strokeStyle = P.line; g.globalAlpha = 0.5; g.lineWidth = 1;
  for (let y = s * 3; y < H; y += s * 3) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  g.globalAlpha = 1; bgCache.set(key, c); return c;
}
const FUNC = { command: 'acc', ship: 'acc', viewer: 'acc', ops: 'acc', ready: 'acc', conference: 'acc', helm: 'green', carto: 'green', science: 'green', ew: 'green', intel: 'green', engineering: 'yel', damage: 'yel', env: 'yel', comms: 'yel', lift: 'yel', head: 'yel', band: 'yel', defense: 'red', weapons: 'red', desk: 'acc', brief: 'acc', honors: 'acc', synth: 'yel', shutters: 'yel' };
// Stations are told apart by icon, label and shape, not hue: every station uses the one accent.
const FUNC_CSS = { acc: 'var(--signal)', green: 'var(--signal)', yel: 'var(--signal)', red: 'var(--signal)' };
function fnColor(P) { return P.acc; }
function hexTab(g, x, y, w, h, l, r) { const c = Math.min(h * 0.32, w / 3); g.beginPath(); g.moveTo(x + (l ? c : 0), y); g.lineTo(x + w - (r ? c : 0), y); if (r) g.lineTo(x + w, y + h / 2); g.lineTo(x + w - (r ? c : 0), y + h); g.lineTo(x + (l ? c : 0), y + h); if (l) g.lineTo(x, y + h / 2); g.closePath(); }
function rrect(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function fitFont(g, text, weight, size, family, maxW) { let s = size; g.font = `${weight} ${s | 0}px ${family}`; while (s > 8 && g.measureText(text).width > maxW) { s -= 1; g.font = `${weight} ${s | 0}px ${family}`; } }
function throttle() { return cur.speed <= 12 ? cur.speed / 12 * 0.25 : 0.25 + (cur.speed - 12) / 408 * 0.75; }
// ---------- dense instrument widgets ----------
function jit(b, a, f, i) { return b + Math.sin(elapsed * f + (i || 0) * 1.7) * a; }
function split(r, fr, vertical, gap) {
  const tot = fr.reduce((a, b) => a + b, 0), out = []; let o = 0; const L = (vertical ? r.h : r.w) - gap * (fr.length - 1);
  fr.forEach((f) => { const sz = L * f / tot; out.push(vertical ? { x: r.x, y: r.y + o, w: r.w, h: sz } : { x: r.x + o, y: r.y, w: sz, h: r.h }); o += sz + gap; });
  return out;
}
function sub(g, r, title, color, P) {
  const th = clamp(r.h * 0.13, 10, 24);
  g.font = `700 ${th * 0.72 | 0}px ${DISP}`; const tw = Math.min(r.w * 0.78, g.measureText(title).width + th * 1.3);
  hexTab(g, r.x, r.y, tw, th, false, true); g.fillStyle = P.acc; g.fill();
  g.fillStyle = '#000'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(title, r.x + th * 0.3, r.y + th / 2 + 1);
  g.fillStyle = P.line; g.fillRect(r.x + tw + 4, r.y + th / 2 - 1, Math.max(0, r.w - tw - 4), 2);
  return { x: r.x, y: r.y + th * 1.35, w: r.w, h: r.h - th * 1.35 };
}
function table(g, r, rows, P) {
  const n = rows.length, rh = r.h / n, fs = clamp(rh * 0.58, 8, 26);
  rows.forEach(([k, v, c], i) => {
    const y = r.y + i * rh + rh / 2; g.textBaseline = 'middle';
    g.textAlign = 'left'; g.fillStyle = P.dim; fitFont(g, k, 500, fs * 0.82, MONO, r.w * 0.46); g.fillText(k, r.x, y);
    g.textAlign = 'right'; g.fillStyle = c || P.txt; fitFont(g, v, 600, fs, DISP, r.w * 0.52); g.fillText(v, r.x + r.w, y);
    if (i < n - 1) { g.fillStyle = P.line; g.fillRect(r.x, r.y + (i + 1) * rh - 0.5, r.w, 1); }
  });
}
function bars(g, r, rows, P) {
  const n = rows.length, rh = r.h / n, fs = clamp(rh * 0.44, 8, 20), lw = r.w * 0.36, nw = r.w * 0.15;
  rows.forEach(([k, v, c], i) => {
    const y = r.y + i * rh; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = P.dim; fitFont(g, k, 500, fs, MONO, lw - 6); g.fillText(k, r.x, y + rh / 2);
    const bx = r.x + lw, bw = r.w - lw - nw;
    hexTab(g, bx, y + rh * 0.22, bw, rh * 0.56, true, true); g.fillStyle = P.line; g.fill();
    hexTab(g, bx, y + rh * 0.22, Math.max(rh * 0.5, bw * clamp(v, 0, 1)), rh * 0.56, true, true); g.fillStyle = c || P.acc; g.fill();
    g.textAlign = 'right'; g.fillStyle = P.txt; g.font = `600 ${fs | 0}px ${MONO}`; g.fillText(Math.round(clamp(v, 0, 1) * 100) + '%', r.x + r.w, y + rh / 2);
  });
}
function lights(g, r, rows, P, cols) {
  cols = cols || 1; const per = Math.ceil(rows.length / cols), cw = r.w / cols, rh = r.h / per, fs = clamp(rh * 0.52, 8, 18);
  const C = { ok: P.green, warn: P.yel, off: P.line, act: P.acc, alert: P.red, blink: Math.sin(elapsed * 6) > 0 ? P.yel : P.line };
  rows.forEach(([k, st, v], i) => {
    const cx = r.x + Math.floor(i / per) * cw, cy = r.y + (i % per) * rh + rh / 2;
    hexNode(g, cx + fs * 0.5, cy, fs * 0.42); g.fillStyle = C[st] || P.dim; g.fill();
    g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = st === 'off' ? P.dim : P.txt; fitFont(g, k, 500, fs, MONO, cw * (v ? 0.62 : 0.9) - fs * 1.4); g.fillText(k, cx + fs * 1.2, cy);
    if (v) { g.textAlign = 'right'; g.fillStyle = P.dim; g.font = `500 ${fs * 0.9 | 0}px ${MONO}`; g.fillText(v, cx + cw - 6, cy); }
  });
}
function spark(g, r, color, seed, speed, P, amp) {
  g.fillStyle = P.line; for (let i = 0; i <= 4; i++) g.fillRect(r.x, r.y + r.h * i / 4, r.w, 1);
  g.beginPath();
  for (let i = 0; i <= 80; i++) { const u = i / 80, v = Math.sin(u * 9 + elapsed * speed + seed) * 0.28 + Math.sin(u * 23 - elapsed * speed * 1.7 + seed * 2) * 0.12 + Math.sin(u * 51 + elapsed * 3) * 0.05; const xx = r.x + u * r.w, yy = r.y + r.h * (0.5 - v * (amp || 1)); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
  g.strokeStyle = color; g.lineWidth = 2; g.stroke();
  g.lineTo(r.x + r.w, r.y + r.h); g.lineTo(r.x, r.y + r.h); g.closePath(); g.globalAlpha = 0.14; g.fillStyle = color; g.fill(); g.globalAlpha = 1;
}
function big(g, r, value, unit, color, P) {
  fitFont(g, value, 700, r.h * 0.72, DISP, r.w * (unit ? 0.72 : 0.98)); g.fillStyle = color; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(value, r.x, r.y + r.h / 2);
  if (unit) { const vw = g.measureText(value).width; g.font = `500 ${clamp(r.h * 0.22, 8, 20) | 0}px ${MONO}`; g.fillStyle = P.dim; g.fillText(unit, r.x + vw + 8, r.y + r.h * 0.6); }
}
function logw(g, r, lines, P, speed) {
  const fs = clamp(r.h / 6.5, 8, 16), lh = fs * 1.4, n = lines.length, off = (elapsed * (speed || 0.5)) % n, vis = Math.ceil(r.h / lh) + 1;
  g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip();
  g.font = `500 ${fs | 0}px ${MONO}`; g.textAlign = 'left'; g.textBaseline = 'top';
  for (let i = 0; i < vis; i++) { const idx = (Math.floor(off) + i) % n, yy = r.y + (i - (off % 1)) * lh; g.globalAlpha = clamp(0.35 + i / vis, 0.35, 1); g.fillStyle = i === vis - 2 ? P.acc : P.txt; g.fillText(lines[idx], r.x, yy); }
  g.restore(); g.globalAlpha = 1;
}
function throttleW(g, r, P) { const n = 16, sw = r.w / n, th = throttle(); for (let i = 0; i < n; i++) { hexTab(g, r.x + i * sw, r.y, sw - 3, r.h, true, true); g.fillStyle = (i + 0.5) / n < th ? (i > 11 ? P.ice : P.acc) : P.line; g.fill(); } }
function dialW(g, r, deg, P) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2 * 0.92;
  g.fillStyle = P.line; g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.fill();
  g.strokeStyle = P.ice; g.lineWidth = 2;
  for (let i = 0; i < 36; i++) { const a = i * 10 * D2R, l = i % 9 === 0 ? 0.24 : 0.1; g.beginPath(); g.moveTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); g.lineTo(cx + Math.cos(a) * rad * (1 - l), cy + Math.sin(a) * rad * (1 - l)); g.stroke(); }
  const hd = deg * D2R - Math.PI / 2 + Math.sin(elapsed * 0.8) * 0.03;
  g.strokeStyle = P.acc; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(hd) * rad * 0.8, cy + Math.sin(hd) * rad * 0.8); g.stroke();
  hexNode(g, cx, cy, rad * 0.12); g.fillStyle = P.acc; g.fill();
}
function courseW(g, r, P) {
  const rr = mulberry(7 + state.cur);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(234,242,255,${0.2 + rr() * 0.5})`; g.fillRect(r.x + rr() * r.w, r.y + rr() * r.h, 2, 2); }
  g.strokeStyle = P.line; g.lineWidth = 1; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(r.x + r.w * i / 4, r.y); g.lineTo(r.x + r.w * i / 4, r.y + r.h); g.moveTo(r.x, r.y + r.h * i / 4); g.lineTo(r.x + r.w, r.y + r.h * i / 4); g.stroke(); }
  const ax = r.x + r.w * 0.12, ay = r.y + r.h * 0.8, bx = r.x + r.w * 0.84, by = r.y + r.h * 0.22;
  g.setLineDash([8, 6]); g.strokeStyle = P.ice; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(r.x + r.w * 0.3, r.y + r.h * 0.2, bx, by); g.stroke(); g.setLineDash([]);
  hexNode(g, bx, by, 10 * (1 + Math.sin(elapsed * 3) * 0.15)); g.strokeStyle = P.ice; g.lineWidth = 2; g.stroke();
  const prog = state.speed === 'warp' ? (elapsed * 0.08) % 1 : 0, t = prog, px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * (r.x + r.w * 0.3) + t * t * bx, py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * (r.y + r.h * 0.2) + t * t * by;
  hexNode(g, px, py, 6); g.fillStyle = P.acc; g.fill();
  const fs = clamp(r.h * 0.09, 8, 18); g.font = `600 ${fs | 0}px ${DISP}`; g.textBaseline = 'middle';
  g.textAlign = 'right'; g.fillStyle = P.txt; g.fillText(sysDest().star.toUpperCase(), bx - 16, by);
  g.textAlign = 'left'; g.fillStyle = P.dim; g.fillText(sysCur().star.toUpperCase(), ax + 10, ay);
}
function globeW(g, r, P) {
  const rad = Math.min(r.w, r.h) / 2 * 0.92, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  g.strokeStyle = P.ice; g.lineWidth = 1.5; g.globalAlpha = 0.8;
  g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.stroke();
  const rot = (elapsed * 0.3) % 1;
  for (let i = 0; i < 4; i++) { const k = Math.cos(((i / 4) + rot / 4) * Math.PI); g.beginPath(); g.ellipse(cx, cy, Math.abs(k) * rad, rad, 0, 0, 7); g.stroke(); }
  for (let i = -2; i <= 2; i++) { const yy = cy + i * rad / 3, hw = Math.sqrt(Math.max(0, rad * rad - (yy - cy) * (yy - cy))); g.beginPath(); g.moveTo(cx - hw, yy); g.lineTo(cx + hw, yy); g.stroke(); }
  g.globalAlpha = 1;
  const sy = cy + Math.sin(elapsed * (state.scanning ? 4 : 0.8)) * rad * 0.95, shw = Math.sqrt(Math.max(0, rad * rad - (sy - cy) * (sy - cy)));
  g.strokeStyle = state.scanning ? P.acc : P.acc; g.lineWidth = state.scanning ? 3 : 2; g.beginPath(); g.moveTo(cx - shw, sy); g.lineTo(cx + shw, sy); g.stroke();
}
function ringW(g, r, P, value, label) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2 * 0.9;
  for (let i = 0; i < 12; i++) {
    const a0 = i / 12 * Math.PI * 2 - Math.PI / 2 + 0.05, a1 = a0 + Math.PI * 2 / 12 - 0.1, on = Math.sin(elapsed * 0.7 + i * 1.3) > -0.6;
    g.strokeStyle = on ? (i % 4 === 0 ? P.ice : P.acc) : P.line; g.lineWidth = rad * 0.2; g.beginPath(); g.arc(cx, cy, rad * 0.86, a0, a1); g.stroke();
  }
  g.fillStyle = P.txt; g.textAlign = 'center'; g.textBaseline = 'middle'; fitFont(g, value, 700, rad * 0.5, DISP, rad * 1.2); g.fillText(value, cx, cy - rad * 0.06);
  g.fillStyle = P.dim; g.font = `500 ${clamp(rad * 0.16, 8, 16) | 0}px ${MONO}`; g.fillText(label, cx, cy + rad * 0.32);
}
// ---------- live ship widgets (Stage 1) ----------
function shipClock(at) { const s = Math.floor(at); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function zcol(P, id) { return { ok: P.green, warn: P.yel, alert: P.red, off: P.line }[zoneStatus(id)]; }
function zonesW(g, r, P) {
  const [L, Rr] = split(r, [1, 1], false, r.w * 0.05);
  bars(g, L, ZONES.slice(0, 4).map((z) => [z.short, sim.zones[z.id] / 100, zcol(P, z.id)]), P);
  bars(g, Rr, ZONES.slice(4).map((z) => [z.short, sim.zones[z.id] / 100, zcol(P, z.id)]), P);
}
function weaponRows(P) {
  const red = state.alert === 'red', b = sim.beams, bay = sim.bays;
  const beam = (v, id) => zoneFactor(id) === 0 ? ['OFFLINE', P.red] : red ? (v >= 1 ? ['CHARGED', P.acc] : [Math.round(v * 100) + '% CHARGE', P.txt]) : ['SAFE', P.dim];
  const tube = (t) => t.torps <= 0 ? ['EMPTY', P.red] : red ? (t.ready ? ['LOADED · ' + t.torps, P.acc] : ['LOADING · ' + t.torps, P.yel]) : [t.torps + ' / ' + SIM.torp.perBay, P.txt];
  return [['DORSAL TURRET', ...beam(b.dorsal, 'dorsal')], ['VENTRAL ARRAY', ...beam(b.ventral, 'ventral')], ['TORP BAY 1', ...tube(bay[0])], ['TORP BAY 2', ...tube(bay[1])], ['TARGET LOCK', 'NONE', P.dim]];
}
function shieldW(g, r, P) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, s = Math.min(r.w * 0.36, r.h * 0.42);
  g.fillStyle = P.ice; g.globalAlpha = 0.85; hullTop(g, cx, cy, s); g.fill(); g.globalAlpha = 1;
  const up = sim.shields.up > 0.01;
  const segs = [[-Math.PI * 0.75, -Math.PI * 0.25, 'fwd'], [-Math.PI * 0.25, Math.PI * 0.25, 'stbd'], [Math.PI * 0.25, Math.PI * 0.75, 'aft'], [Math.PI * 0.75, Math.PI * 1.25, 'port']];
  segs.forEach(([a0, a1, k], i) => {
    const v = shieldNow(k), f = v / SIM.shield.max, rf = sim.shields.reinforce === k, lw = s * (rf ? 0.15 : 0.1);
    g.lineWidth = lw; g.strokeStyle = P.line; g.beginPath(); g.ellipse(cx, cy, s * 0.95, s * 1.25, 0, a0 + 0.06, a1 - 0.06); g.stroke();
    if (up && v > 0.5) {
      const span = (a1 - a0 - 0.12) * clamp(v / shieldMax(k), 0, 1), mid = (a0 + a1) / 2;
      g.strokeStyle = f > 0.5 ? P.acc : f > 0.2 ? P.yel : P.red; g.globalAlpha = 0.75 + Math.sin(elapsed * 4 + i) * 0.2;
      g.beginPath(); g.ellipse(cx, cy, s * 0.95, s * 1.25, 0, mid - span / 2, mid + span / 2); g.stroke(); g.globalAlpha = 1;
    }
    const am = (a0 + a1) / 2, lx = cx + Math.cos(am) * s * 1.28, ly = cy + Math.sin(am) * s * 1.48;
    g.fillStyle = up ? (f > 0.2 ? P.txt : P.red) : P.dim; g.font = `600 ${clamp(s * 0.18, 8, 18) | 0}px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(up ? Math.round(v) + (rf ? '+' : '') : 'DOWN', lx, ly);
  });
}
function deckW(g, r, P) {
  const cols = 8, rows = 6, cw = r.w / cols, chh = r.h / rows, scan = (elapsed * 0.5) % 1;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const hl = Math.abs(i / cols - scan) < 0.07;
    hexTab(g, r.x + i * cw + 2, r.y + j * chh + 2, cw - 4, chh - 4, true, true); g.fillStyle = hl ? P.ice : P.ice; g.globalAlpha = hl ? 1 : 0.55; g.fill();
  }
  g.globalAlpha = 1;
}
function hullTop(g, cx, cy, s) {
  g.beginPath();
  g.moveTo(cx, cy - s); g.lineTo(cx + s * 0.34, cy - s * 0.5); g.lineTo(cx + s * 0.4, cy + s * 0.2); g.lineTo(cx + s * 0.62, cy + s * 0.45); g.lineTo(cx + s * 0.62, cy + s * 0.95);
  g.lineTo(cx + s * 0.18, cy + s * 0.8); g.lineTo(cx, cy + s * 0.92); g.lineTo(cx - s * 0.18, cy + s * 0.8); g.lineTo(cx - s * 0.62, cy + s * 0.95); g.lineTo(cx - s * 0.62, cy + s * 0.45);
  g.lineTo(cx - s * 0.4, cy + s * 0.2); g.lineTo(cx - s * 0.34, cy - s * 0.5); g.closePath();
}
function eta() { const s = 5400 - ((elapsed * 10) | 0) % 5400; return String(s / 3600 | 0).padStart(2, '0') + ':' + String((s % 3600) / 60 | 0).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
const LOGS = {
  sci: ['GRAV LENS CAL ......... OK', 'EM SWEEP 0.3–40 GHZ ... CLEAR', 'SUBSPACE NOISE ........ 2.1 DB', 'PARTICLE FLUX ......... NOMINAL', 'LR SENSOR PING ........ 14 CONTACTS', 'TACHYON GRID .......... QUIET', 'ATMOS SAMPLE .......... QUEUED', 'THERMAL MAP ........... 61% DONE'],
  com: ['21:47 MERIDIAN ACK SEQ 4410', '21:48 CONVOY LEAD CHECK-IN', '21:52 RELAY 47 HANDSHAKE OK', '21:55 CIPHER ROTATION 3 OF 4', '21:58 AMITY ROSE STATUS GREEN', '22:01 IRON PATIENCE STATUS GREEN', '22:03 BEACON SWEEP CLEAR', '22:06 PRIORITY QUEUE EMPTY'],
  dmg: ['D1 BRIDGE ............. SECURE', 'D2 OFFICERS ........... SECURE', 'D3 TORPEDO BAYS ....... SECURE', 'D4 ENGINEERING ........ SECURE', 'D5 CARGO .............. SECURE', 'D6 SHUTTLEBAY ......... SECURE', 'D7 HABITAT ............ SECURE', 'D8 KEEL ............... SECURE'],
  eng: ['CORE BREACH MARGIN 412%', 'INJECTOR 1 CYCLE 0.31 MS', 'INJECTOR 2 CYCLE 0.31 MS', 'COIL BANK A SYNC ±0.02', 'COIL BANK B SYNC ±0.03', 'COOLANT LOOP 3 FLOW NOMINAL', 'SIF GEN 2 STANDBY', 'POWER TRANSFER CONDUITS OK'],
};
const CONVOY = [['AMITY ROSE', '2.1 KM AFT'], ['KESTREL MAIDEN', '3.4 KM AFT'], ['IRON PATIENCE', '4.0 KM AFT']];
const DRAW = {
  helm(g, x, y, w, h, P) {
    const R = { x, y, w, h }, warp = state.speed === 'warp', imp = state.speed !== 'stop', mi = maxImpulse();
    const nP = (warp ? jit(0.94, 0.02, 1.3, 1) : imp ? 0.08 : 0.02) * zoneFactor('portNac'), nS = (warp ? jit(0.94, 0.02, 1.3, 2) : imp ? 0.08 : 0.02) * zoneFactor('stbdNac');
    const iv = state.speed === 'impulse' ? 0.25 * mi : 0;
    const unit = warp ? 'WF 6.00' : imp ? (0.25 * mi).toFixed(2) + ' C' : '0 KM/S';
    const flight = [['DAMPERS', 'ok'], ['NAV DEFLECTOR', zoneStatus('prow')], ['WARP FIELD', simCanWarp() ? (warp ? 'act' : 'ok') : 'alert'], ['IMPULSE', zoneStatus('engines')], ['AUTOPILOT', warp ? 'act' : 'off']];
    if (h < 170) {
      const [a, b, c] = split(R, [1.3, 0.7, 1.1], false, w * 0.03);
      const ca = sub(g, a, 'VELOCITY', P.acc, P); const [v1, v2] = split(ca, [1.5, 0.5], true, 6); big(g, v1, SPEEDS[state.speed].screen, unit, P.acc, P); throttleW(g, v2, P);
      dialW(g, sub(g, b, 'HDG', P.acc, P), parseInt(sysDest().heading, 10), P);
      bars(g, sub(g, c, 'PROPULSION', P.acc, P), [['PORT NAC', nP, P.acc], ['STBD NAC', nS, P.acc], ['IMPULSE', iv, P.ice]], P);
      return;
    }
    const [top, bot] = split(R, [1.05, 1], true, h * 0.05);
    const [a, b] = split(top, [1.2, 1], false, w * 0.03);
    const ca = sub(g, a, 'VELOCITY', P.acc, P); const [v1, v2] = split(ca, [1.6, 0.5], true, 6); big(g, v1, SPEEDS[state.speed].screen, unit, P.acc, P); throttleW(g, v2, P);
    courseW(g, sub(g, b, 'COURSE PLOT', P.acc, P), P);
    const [c, d, e] = split(bot, [1.1, 1, 0.9], false, w * 0.03);
    bars(g, sub(g, c, 'PROPULSION', P.acc, P), [['PORT NACELLE', nP, P.acc], ['STBD NACELLE', nS, P.acc], ['IMPULSE', iv, P.ice], ['IMPULSE LIMIT', mi, mi < 1 ? P.yel : P.ice], ['ENGINE POWER', eff('engines') / SIM.effCap, P.ice]], P);
    table(g, sub(g, d, 'NAVIGATION', P.acc, P), [['HEADING', sysDest().heading.toUpperCase()], ['DESTINATION', sysDest().star.toUpperCase()], ['ETA', warp ? eta() : '—'], ['POSITION', sysCur().star.toUpperCase()]], P);
    lights(g, sub(g, e, 'FLIGHT', P.acc, P), flight, P);
  },
  ops(g, x, y, w, h, P) {
    const R = { x, y, w, h }, A = sim.alloc, k = reactorOut() / SIM.reactor;
    const power = [['WEAPONS', A.weapons * k / 100, P.acc], ['SHIELDS', A.shields * k / 100, P.acc], ['ENGINES', A.engines * k / 100, P.ice], ['SENSORS', A.sensors * k / 100, P.ice], ['LIFE SUPPORT', SIM.life / 100, P.ice]];
    if (h < 170) {
      const [a, b, c] = split(R, [0.6, 1.1, 1.2], false, w * 0.03);
      ringW(g, sub(g, a, 'HULL', P.acc, P), P, Math.round(hullIntegrity()) + '%', 'INTEGRITY');
      table(g, sub(g, b, 'POWER', P.acc, P), [['PRESET', sim.preset.toUpperCase(), P.acc], ['REACTOR', Math.round(reactorOut()) + ' U', k < 1 ? P.yel : P.txt], ['CONVOY', '3 SHIPS']], P);
      bars(g, sub(g, c, 'ALLOCATION', P.acc, P), power.slice(0, 3), P);
      return;
    }
    const [top, bot] = split(R, [1, 1], true, h * 0.05);
    const [a, b] = split(top, [0.7, 1.4], false, w * 0.03);
    ringW(g, sub(g, a, 'HULL', P.acc, P), P, Math.round(hullIntegrity()) + '%', 'INTEGRITY');
    table(g, sub(g, b, 'CONVOY · 3 SHIPS', P.acc, P), CONVOY.concat([['FORMATION', 'LINE ASTERN']]), P);
    const [c, d] = split(bot, [1.3, 1], false, w * 0.03);
    bars(g, sub(g, c, 'POWER · SHARE OF REACTOR', P.acc, P), power, P);
    table(g, sub(g, d, 'POWER', P.acc, P), [['PRESET', sim.preset.toUpperCase(), P.acc], ['REACTOR', Math.round(reactorOut()) + ' U', k < 1 ? P.yel : P.txt], ['EMERGENCY', sim.emergency.boost > 0 ? 'TO SHIELDS' : sim.emergency.penalty > 0 ? 'RECOVERING' : 'READY', sim.emergency.boost > 0 ? P.acc : sim.emergency.penalty > 0 ? P.yel : P.txt], ['CREW', '140 ABOARD']], P);
  },
  sci(g, x, y, w, h, P) {
    const R = { x, y, w, h }, sys = sysCur(), away = state.speed === 'warp';
    const rows = [['TARGET', away ? 'NONE IN RANGE' : sys.planet.toUpperCase()], ['CLASS', away ? '—' : sys.cls.toUpperCase()], ['ATMOSPHERE', away ? '—' : sys.atm.toUpperCase()], ['LIFE SIGNS', away ? '—' : state.scanned ? sys.life.toUpperCase() : state.scanning ? 'SCANNING…' : 'SCAN REQUIRED', state.scanned ? P.ice : P.acc], ['RANGE', away ? '—' : sys.dist.toUpperCase()]];
    if (h < 170) {
      const [a, b, c] = split(R, [0.6, 1.5, 1], false, w * 0.03);
      globeW(g, sub(g, a, 'TARGET', P.ice, P), P);
      table(g, sub(g, b, 'ANALYSIS', P.ice, P), rows.slice(0, 4), P);
      lights(g, sub(g, c, 'ARRAYS', P.ice, P), [['LONG RANGE', 'ok'], ['LATERAL', 'ok'], ['SURVEY', state.scanning ? 'act' : 'ok']], P);
      return;
    }
    const [top, bot] = split(R, [1.25, 1], true, h * 0.05);
    const [a, b] = split(top, [0.7, 1.5], false, w * 0.03);
    globeW(g, sub(g, a, 'TARGET', P.ice, P), P);
    table(g, sub(g, b, 'ANALYSIS', P.ice, P), rows, P);
    const [c, d, e] = split(bot, [1.1, 0.9, 1.2], false, w * 0.03);
    bars(g, sub(g, c, 'COMPOSITION', P.ice, P), away ? [['—', 0, P.line]] : [['N2', jit(0.71, 0.01, 0.7, 1), P.ice], ['O2', jit(0.24, 0.01, 0.7, 2), P.ice], ['AR', 0.03, P.ice], ['CO2', 0.02, P.ice]], P);
    lights(g, sub(g, d, 'ARRAYS', P.ice, P), [['LONG RANGE', 'ok'], ['LATERAL P', 'ok'], ['LATERAL S', 'ok'], ['SURVEY', state.scanning ? 'act' : 'ok'], ['PROBE BAY', 'off']], P);
    logw(g, sub(g, e, 'SENSOR LOG', P.ice, P), LOGS.sci, P, 0.6);
  },
  com(g, x, y, w, h, P) {
    const R = { x, y, w, h };
    const ch = [['MERIDIAN STN', 'OPEN · 21.47', P.ice], ['CONVOY LEAD', 'OPEN · 21.53', P.ice], [sysCur().star.toUpperCase() + ' RELAY', 'STBY · 19.02', P.acc]];
    if (h < 170) {
      const [a, b] = split(R, [1, 1.2], false, w * 0.03);
      spark(g, sub(g, a, 'CARRIER', P.acc, P), P.acc, 1, 5, P);
      table(g, sub(g, b, 'CHANNELS', P.acc, P), ch, P);
      return;
    }
    const [top, bot] = split(R, [0.8, 1], true, h * 0.05);
    const [a, b] = split(top, [1.6, 0.8], false, w * 0.03);
    spark(g, sub(g, a, 'CARRIER · SUBSPACE BAND 4', P.acc, P), P.acc, 1, 5, P);
    lights(g, sub(g, b, 'LINK', P.acc, P), [['CIPHER', 'ok', 'R3'], ['RELAY 47', 'ok'], ['BEACON', 'ok'], ['DISTRESS', 'off']], P);
    const [c, d] = split(bot, [1.1, 1], false, w * 0.03);
    table(g, sub(g, c, 'CHANNELS', P.acc, P), ch.concat([['QUEUE', '0 PRIORITY']]), P);
    logw(g, sub(g, d, 'TRAFFIC', P.acc, P), LOGS.com, P, 0.4);
  },
  sys(g, x, y, w, h, P) {
    const R = { x, y, w, h }, warp = state.speed === 'warp', out = reactorOut() / SIM.reactor, E = sim.emergency;
    const re = [['REACTOR', out, out < 1 ? P.yel : P.acc], ['EMERGENCY', E.boost > 0 ? E.boost / SIM.emergency.time : 0, P.acc], ['RECOVERY', E.penalty / SIM.emergency.penaltyTime, P.yel], ['FIELD COILS', warp ? 0.95 : 0.2, P.ice], ['COOLANT', 0.66, P.ice]];
    const breach = sim.breach !== null;
    const sysl = [['REACTOR', zoneStatus('engines')], ['INJECTORS', 'ok'], ['COIL BANK P', zoneStatus('portNac')], ['COIL BANK S', zoneStatus('stbdNac')], ['CONTAINMENT', breach ? 'blink' : 'ok'], ['EMERGENCY PWR', E.boost > 0 ? 'act' : E.penalty > 0 ? 'warn' : 'ok'], ['LIFE SUPPORT', 'ok'], ['GRAVITY', 'ok']];
    const core = (breach ? jit(1, 0.1, 9, 1) : warp ? jit(0.984, 0.003, 2, 1) : jit(0.62, 0.004, 1.2, 1)) * out;
    if (h < 170) {
      const [a, b, c] = split(R, [0.9, 1.3, 0.9], false, w * 0.03);
      const ca = sub(g, a, breach ? 'BREACH ' + Math.ceil(sim.breach) + 'S' : 'WARP CORE', P.acc, P); const [v1, v2] = split(ca, [1, 1], true, 4); big(g, v1, (core * 100).toFixed(1) + '%', 'OUT', breach ? P.red : P.acc, P); spark(g, v2, P.acc, 3, 2, P, 0.6);
      bars(g, sub(g, b, 'REACTION', P.acc, P), re.slice(0, 3), P);
      lights(g, sub(g, c, 'SYSTEMS', P.acc, P), sysl.slice(0, 3), P);
      return;
    }
    const [top, bot] = split(R, [1, 1], true, h * 0.05);
    const [a, b] = split(top, [1, 1.3], false, w * 0.03);
    const ca = sub(g, a, breach ? 'CORE BREACH IN ' + Math.ceil(sim.breach) + ' S' : 'WARP CORE', P.acc, P); const [v1, v2] = split(ca, [1, 1], true, 6); big(g, v1, (core * 100).toFixed(1) + '%', 'OUTPUT', breach ? P.red : P.acc, P); spark(g, v2, P.acc, 3, 2, P, 0.6);
    bars(g, sub(g, b, 'REACTION', P.acc, P), re, P);
    const [c, d] = split(bot, [1.2, 1], false, w * 0.03);
    lights(g, sub(g, c, 'SYSTEMS', P.acc, P), sysl, P, 2);
    logw(g, sub(g, d, 'ENGINEERING LOG', P.acc, P), LOGS.eng, P, 0.5);
  },
  dmg(g, x, y, w, h, P) {
    const R = { x, y, w, h }, hull = hullIntegrity(), breach = sim.breach !== null;
    const teams = sim.teams.map((tm, i) => ['TEAM ' + (i + 1), tm.to ? 'MOVING · ' + ZONES.find((z) => z.id === tm.to).short : tm.at ? ZONES.find((z) => z.id === tm.at).short + (sim.zones[tm.at] < SIM.repair.cap ? ' · REPAIR' : ' · DONE') : 'STANDBY', tm.to ? P.yel : tm.at ? P.acc : P.dim]);
    const hcol = hull < 50 ? P.red : hull < 90 ? P.yel : P.green;
    if (h < 170) {
      const [a, b] = split(R, [1.5, 1], false, w * 0.03);
      zonesW(g, sub(g, a, 'DAMAGE ZONES', P.acc, P), P);
      table(g, sub(g, b, 'HULL', P.acc, P), [['INTEGRITY', Math.round(hull) + '%', hcol], ['STATUS', breach ? 'BREACH ' + Math.ceil(sim.breach) + 'S' : sim.drill.on ? 'DRILL' : 'SECURE', breach ? P.red : sim.drill.on ? P.acc : P.green]].concat(teams.slice(0, 1)), P);
      return;
    }
    const [top, bot] = split(R, [1.15, 1], true, h * 0.05);
    const [a, b] = split(top, [1.6, 1], false, w * 0.03);
    zonesW(g, sub(g, a, 'DAMAGE ZONES · 8', P.acc, P), P);
    const cb = sub(g, b, 'HULL', P.acc, P); const [b1, b2] = split(cb, [1, 1.2], true, 4); big(g, b1, Math.round(hull) + '%', 'INTEGRITY', hcol, P);
    table(g, b2, [['STATUS', breach ? 'BREACH IN ' + Math.ceil(sim.breach) + ' S' : sim.drill.on ? 'DRILL · ' + Math.ceil(sim.drill.t) + ' S' : state.alert === 'green' ? 'ALL SECURE' : 'BATTLE STATIONS', breach ? P.red : sim.drill.on || state.alert !== 'green' ? P.acc : P.green], ['WORST', worstZone() ? worstZone().short + ' ' + Math.round(sim.zones[worstZone().id]) + '%' : 'NONE']], P);
    const [c, d] = split(bot, [1, 1.2], false, w * 0.03);
    table(g, sub(g, c, 'REPAIR TEAMS', P.acc, P), teams.concat([['FIELD REPAIR', 'TO ' + SIM.repair.cap + '%']]), P);
    const hits = sim.hitLog.slice().reverse().map((e) => `${shipClock(e.at)} ${e.arc.toUpperCase()} ${Math.round(e.dmg)} · ${e.zone ? ZONES.find((z) => z.id === e.zone).short + ' -' + Math.round(e.rest) : 'ABSORBED'}`);
    logw(g, sub(g, d, 'HIT REPORTS', P.acc, P), hits.length ? hits : LOGS.dmg, P, hits.length ? 0 : 0.7);
  },
  tac(g, x, y, w, h, P) {
    const R = { x, y, w, h };
    const [a, b] = split(R, [1, 1.15], false, w * 0.03);
    shieldW(g, sub(g, a, 'DEFLECTORS', P.acc, P), P);
    const [b1, b2] = split(b, [1.3, 1], true, h * 0.05);
    table(g, sub(g, b1, 'WEAPONS', P.acc, P), weaponRows(P).slice(0, 4), P);
    table(g, sub(g, b2, 'CONDITION', P.acc, P), [['ALERT', ALERTS[state.alert].short, P.acc], ['HULL', Math.round(hullIntegrity()) + '%', hullIntegrity() < 50 ? P.red : hullIntegrity() < 90 ? P.yel : P.green], ['DRILL', sim.drill.on ? Math.ceil(sim.drill.t) + ' S LEFT' : 'OFF', sim.drill.on ? P.acc : P.dim]], P);
  },
  msd(g, x, y, w, h, P) {
    const X = (u) => x + u * w, Y = (v) => y + v * h, warp = smooth(30, 300, cur.speed);
    g.beginPath();
    g.moveTo(X(0.03), Y(0.47)); g.lineTo(X(0.1), Y(0.37)); g.lineTo(X(0.3), Y(0.31)); g.lineTo(X(0.33), Y(0.23)); g.lineTo(X(0.4), Y(0.23)); g.lineTo(X(0.42), Y(0.31));
    g.lineTo(X(0.52), Y(0.31)); g.lineTo(X(0.54), Y(0.26)); g.lineTo(X(0.63), Y(0.26)); g.lineTo(X(0.65), Y(0.32)); g.lineTo(X(0.75), Y(0.35)); g.lineTo(X(0.79), Y(0.45));
    g.lineTo(X(0.77), Y(0.57)); g.lineTo(X(0.63), Y(0.61)); g.lineTo(X(0.3), Y(0.59)); g.lineTo(X(0.12), Y(0.55)); g.closePath();
    g.fillStyle = 'rgba(227,162,59,0.06)'; g.fill(); g.strokeStyle = P.ice; g.lineWidth = 2.5; g.stroke();
    g.save(); g.clip();
    g.strokeStyle = P.line; g.lineWidth = 1.5;
    for (let v = 0.33; v < 0.6; v += 0.045) { g.beginPath(); g.moveTo(X(0), Y(v)); g.lineTo(X(1), Y(v)); g.stroke(); }
    for (let u = 0.12; u < 0.8; u += 0.06) { g.beginPath(); g.moveTo(X(u), Y(0.2)); g.lineTo(X(u), Y(0.62)); g.stroke(); }
    const sx = X(0.03 + ((elapsed * 0.08) % 1) * 0.78); g.fillStyle = P.ice; g.globalAlpha = 0.22; g.fillRect(sx - 10, Y(0.2), 20, h * 0.45); g.globalAlpha = 1;
    g.restore();
    g.strokeStyle = P.ice; g.lineWidth = 2;
    [[0.6, 0.6, 0.64, 0.71], [0.7, 0.58, 0.74, 0.71]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(X(a), Y(b)); g.lineTo(X(c), Y(d)); g.stroke(); });
    const nx0 = X(0.5), nx1 = X(0.97), ny = Y(0.71), nh = h * 0.08;
    hexTab(g, nx0, ny, nx1 - nx0, nh, true, true); g.fillStyle = `rgba(143,195,224,${0.15 + warp * 0.65})`; g.fill(); g.stroke();
    g.strokeStyle = P.ice; g.beginPath(); g.arc(X(0.075), Y(0.48), h * 0.05, 0, 7); g.stroke();
    const core = 0.5 + 0.5 * Math.sin(elapsed * (2 + warp * 6)); g.fillStyle = P.acc; g.globalAlpha = 0.5 + core * 0.5; g.fillRect(X(0.565), Y(0.36), w * 0.012, h * 0.2); g.globalAlpha = 1;
    g.fillStyle = P.acc; g.fillRect(X(0.35), Y(0.245), w * 0.03, h * 0.035);
    [[0.585, 0.26], [0.45, 0.6]].forEach(([u, v]) => { g.fillStyle = state.alert === 'red' ? P.acc : P.dim; g.fillRect(X(u) - 6, Y(v) - 3, 12, 6); });
    const lab = (px, py, lx, ly, t, c) => { g.strokeStyle = P.dim; g.lineWidth = 1; g.beginPath(); g.moveTo(X(px), Y(py)); g.lineTo(X(lx), Y(ly)); g.stroke(); g.fillStyle = c || P.txt; g.font = `500 ${h * 0.055 | 0}px ${MONO}`; g.textAlign = lx < px ? 'right' : 'left'; g.textBaseline = 'middle'; g.fillText(t, X(lx) + (lx < px ? -6 : 6), Y(ly)); };
    lab(0.365, 0.24, 0.3, 0.06, 'BRIDGE', P.acc);
    lab(0.585, 0.26, 0.66, 0.06, 'DORSAL TURRET', zoneStatus('dorsal') === 'ok' ? P.txt : zcol(P, 'dorsal'));
    lab(0.45, 0.6, 0.34, 0.9, 'VENTRAL ARRAY', zoneStatus('ventral') === 'ok' ? P.txt : zcol(P, 'ventral'));
    lab(0.06, 0.5, 0.06, 0.86, 'TWIN TORPEDO BAYS', zoneStatus('prow') === 'ok' ? P.txt : zcol(P, 'prow'));
    lab(0.57, 0.48, 0.58, 0.9, 'WARP CORE', zoneStatus('engines') === 'ok' ? P.acc : zcol(P, 'engines'));
    lab(0.76, 0.5, 0.9, 0.2, 'SHUTTLEBAY');
  },
  status(g, x, y, w, h, P, s) {
    const R = { x, y, w, h };
    if (s.code === 'SYS·00') {
      const [a, b, c] = split(R, [0.9, 1.5, 0.7], true, h * 0.03), breach = sim.breach !== null;
      const ca = sub(g, a, 'HULL', P.acc, P); const sz = Math.min(ca.w * 0.3, ca.h * 0.45), cx = ca.x + ca.w / 2, cy = ca.y + ca.h / 2;
      g.strokeStyle = P.ice; g.lineWidth = 2; hullTop(g, cx, cy, sz); g.stroke(); g.globalAlpha = 0.12; g.fillStyle = P.acc; g.fill(); g.globalAlpha = 1;
      [[0, -0.6, 'prow'], [0, 0, 'dorsal'], [0.45, 0.7, 'stbdNac'], [-0.45, 0.7, 'portNac'], [0, 0.5, 'engines']].forEach(([dx, dy, id], i) => { hexNode(g, cx + dx * sz, cy + dy * sz, 5); g.fillStyle = zcol(P, id); g.globalAlpha = 0.6 + 0.4 * Math.sin(elapsed * 2 + i * 1.4); g.fill(); g.globalAlpha = 1; });
      lights(g, sub(g, b, 'SYSTEMS', P.acc, P), [['WARP DRIVE', simCanWarp() ? (state.speed === 'warp' ? 'act' : 'ok') : 'alert'], ['IMPULSE', zoneStatus('engines')], ['DEFLECTOR', state.alert === 'green' ? 'ok' : 'act'], ['DORSAL TURRET', zoneStatus('dorsal')], ['VENTRAL ARRAY', zoneStatus('ventral')], ['TORPEDOES', zoneStatus('prow')], ['PORT EMITTERS', zoneStatus('port')], ['STBD EMITTERS', zoneStatus('stbd')], ['LIFE SUPPORT', 'ok'], ['CONTAINMENT', breach ? 'blink' : 'ok']], P);
      table(g, sub(g, c, 'SHIP', P.acc, P), [['SPEED', SPEEDS[state.speed].screen], ['HULL', Math.round(hullIntegrity()) + '%', zcol(P, worstZone() ? worstZone().id : 'prow')]], P);
    } else {
      const [a, b] = split(R, [1.2, 1], true, h * 0.03);
      const ca = sub(g, a, 'SECTOR PLOT', P.ice, P), cx = ca.x + ca.w / 2, cy = ca.y + ca.h / 2, rad = Math.min(ca.w, ca.h) / 2 * 0.92;
      g.strokeStyle = P.line; g.lineWidth = 1.5; for (let i = 1; i <= 4; i++) { g.beginPath(); g.arc(cx, cy, rad * i / 4, 0, 7); g.stroke(); }
      const sw = elapsed * 0.9; g.strokeStyle = P.ice; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(sw) * rad, cy + Math.sin(sw) * rad); g.stroke();
      const rr = mulberry(51 + state.cur);
      for (let i = 0; i < 7; i++) { const an = rr() * 7, d = 0.3 + rr() * 0.6; hexNode(g, cx + Math.cos(an) * d * rad, cy + Math.sin(an) * d * rad, 5); g.fillStyle = i < 3 ? P.ice : i === 3 && state.alert !== 'green' ? P.acc : P.ice; g.fill(); }
      hexNode(g, cx, cy, 7); g.fillStyle = P.acc; g.fill();
      table(g, sub(g, b, 'CONTACTS', P.ice, P), [['AMITY ROSE', 'FRIENDLY', P.ice], ['KESTREL MAIDEN', 'FRIENDLY', P.ice], ['IRON PATIENCE', 'FRIENDLY', P.ice], ['TRACK 0417', state.alert !== 'green' ? 'UNKNOWN' : 'BEACON', state.alert !== 'green' ? P.acc : P.ice], ['DESTINATION', sysDest().star.toUpperCase()]], P);
    }
  },
};
DRAW.nav = DRAW.helm;
function reticleW(g, r, P) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2 * 0.9, red = state.alert === 'red';
  g.strokeStyle = P.line; g.lineWidth = 2; [1, 0.66, 0.33].forEach((k) => { g.beginPath(); g.arc(cx, cy, rad * k, 0, 7); g.stroke(); });
  g.beginPath(); g.moveTo(cx - rad, cy); g.lineTo(cx + rad, cy); g.moveTo(cx, cy - rad); g.lineTo(cx, cy + rad); g.stroke();
  const a = elapsed * 0.6; g.strokeStyle = red ? P.red : P.ice; g.lineWidth = 3;
  for (let i = 0; i < 4; i++) { const b = a + i * Math.PI / 2; g.beginPath(); g.arc(cx, cy, rad * 0.82, b, b + 0.5); g.stroke(); }
  if (red) { const tx = cx + Math.cos(elapsed * 0.4) * rad * 0.35, ty = cy + Math.sin(elapsed * 0.55) * rad * 0.25, s = rad * 0.16 * (1 + 0.1 * Math.sin(elapsed * 8)); g.strokeStyle = P.red; g.lineWidth = 2; g.strokeRect(tx - s, ty - s, s * 2, s * 2); }
}
function plotW(g, r, P) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2 * 0.92;
  g.strokeStyle = P.line; g.lineWidth = 1.5; for (let i = 1; i <= 4; i++) { g.beginPath(); g.arc(cx, cy, rad * i / 4, 0, 7); g.stroke(); }
  const sw = elapsed * 0.9; g.strokeStyle = P.ice; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(sw) * rad, cy + Math.sin(sw) * rad); g.stroke();
  const rr = mulberry(51 + state.cur);
  for (let i = 0; i < 7; i++) { const an = rr() * 7, d = 0.3 + rr() * 0.6; hexNode(g, cx + Math.cos(an) * d * rad, cy + Math.sin(an) * d * rad, 5); g.fillStyle = i < 3 ? P.ice : i === 3 && state.alert !== 'green' ? P.acc : P.ice; g.fill(); }
  hexNode(g, cx, cy, 7); g.fillStyle = P.acc; g.fill();
}
LOGS.intel = ['TRACK 0412 CLASSIFIED FREIGHTER', 'TRACK 0413 CLASSIFIED FREIGHTER', 'TRACK 0414 BEACON · NAV HAZARD', 'TRACK 0415 COMET · INERT', 'TRACK 0416 SURVEY PROBE · OURS', 'TRACK 0417 UNRESOLVED · WATCHING', 'PATROL ROUTE 7 · NO ACTIVITY', 'COMINT · NO NEW INTERCEPTS'];
DRAW.wpn = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, red = state.alert === 'red', rows = weaponRows(P);
  const ch = [['DORSAL TURRET', sim.beams.dorsal, P.acc], ['VENTRAL ARRAY', sim.beams.ventral, P.acc], ['BAY 1 LOAD', sim.bays[0].reload, P.ice], ['BAY 2 LOAD', sim.bays[1].reload, P.ice]];
  const fc = [['SAFETIES', red ? 'warn' : 'ok'], ['FIRE CONTROL', red ? 'act' : 'ok'], ['WEAPONS POWER', eff('weapons') >= 1 ? 'ok' : 'warn'], ['MAGAZINE', torpsLeft() > 0 ? 'ok' : 'alert']];
  if (h < 170) { const [a, b, c] = split(R, [0.6, 1.3, 1], false, w * 0.03); reticleW(g, sub(g, a, 'TARGET', P.acc, P), P); table(g, sub(g, b, 'WEAPONS', P.acc, P), rows.slice(0, 4), P); bars(g, sub(g, c, 'CHARGE', P.acc, P), [['DORSAL', ch[0][1], P.acc], ['VENTRAL', ch[1][1], P.acc], ['TUBES', (ch[2][1] + ch[3][1]) / 2, P.ice]], P); return; }
  const [top, bot] = split(R, [1.2, 1], true, h * 0.05); const [a, b] = split(top, [0.9, 1.3], false, w * 0.03);
  reticleW(g, sub(g, a, 'TARGETING', P.acc, P), P); table(g, sub(g, b, 'WEAPONS', P.acc, P), rows, P);
  const [c, d] = split(bot, [1.3, 1], false, w * 0.03);
  bars(g, sub(g, c, 'CAPACITORS AND TUBES', P.acc, P), ch, P);
  lights(g, sub(g, d, 'FIRE CONTROL', P.acc, P), fc, P);
};
DRAW.ew = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, armed = state.alert !== 'green', masked = state.alert === 'red';
  const em = [['PROFILE', masked ? 'MASKED' : 'STANDARD', masked ? P.ice : P.txt], ['JAMMERS', armed ? 'ARMED' : 'STANDBY', armed ? P.acc : P.dim], ['DECOYS', '4 READY'], ['THREATS', '0 HOSTILE', P.ice]];
  if (h < 170) { const [a, b] = split(R, [1.3, 1], false, w * 0.03); spark(g, sub(g, a, 'THREAT SPECTRUM', P.ice, P), P.ice, 5, 3, P); table(g, sub(g, b, 'EMISSIONS', P.ice, P), em.slice(0, 3), P); return; }
  const [top, bot] = split(R, [1, 1], true, h * 0.05); const [a, b] = split(top, [1.6, 0.8], false, w * 0.03);
  spark(g, sub(g, a, 'THREAT SPECTRUM · 0.1–60 GHZ', P.ice, P), P.ice, 5, 3, P);
  lights(g, sub(g, b, 'RECEIVERS', P.ice, P), [['BAND A', 'ok'], ['BAND B', 'ok'], ['BAND C', armed ? 'blink' : 'ok'], ['BAND D', 'ok']], P);
  const [c, d] = split(bot, [1, 1.1], false, w * 0.03);
  table(g, sub(g, c, 'EMISSIONS', P.ice, P), em, P);
  bars(g, sub(g, d, 'COUNTERMEASURES', P.ice, P), [['JAM POWER', armed ? 0.7 : 0.05, P.acc], ['DECOY CHARGE', 0.8, P.ice], ['MASKING', masked ? 0.95 : 0.1, P.ice]], P);
};
DRAW.intel = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, up = state.alert !== 'green';
  const ct = [['TRACKED', '7'], ['FRIENDLY', '3', P.green], ['UNKNOWN', up ? '1 · 0417' : '0', up ? P.yel : P.dim], ['THREAT', state.alert === 'red' ? 'HIGH' : up ? 'ELEVATED' : 'LOW', state.alert === 'red' ? P.red : up ? P.yel : P.green]];
  if (h < 170) { const [a, b] = split(R, [0.7, 1.4], false, w * 0.03); plotW(g, sub(g, a, 'TRACKS', P.green, P), P); table(g, sub(g, b, 'ASSESSMENT', P.green, P), ct.slice(0, 3), P); return; }
  const [top, bot] = split(R, [1.2, 1], true, h * 0.05); const [a, b] = split(top, [0.9, 1.2], false, w * 0.03);
  plotW(g, sub(g, a, 'TRACKING', P.green, P), P); table(g, sub(g, b, 'ASSESSMENT', P.green, P), ct, P);
  logw(g, sub(g, bot, 'INTELLIGENCE FEED', P.green, P), LOGS.intel, P, 0.45);
};
DRAW.env = function (g, x, y, w, h, P) {
  const R = { x, y, w, h };
  const ls = [['O2 PARTIAL', jit(0.84, 0.01, 0.6, 1), P.ice], ['CO2 SCRUB', jit(0.72, 0.02, 0.4, 2), P.ice], ['HUMIDITY', 0.42, P.ice], ['PRESSURE', 0.9, P.ice]];
  if (h < 170) { const [a, b] = split(R, [0.9, 1.3], false, w * 0.03); const ca = sub(g, a, 'ATMOSPHERE', P.acc, P); big(g, ca, jit(21.4, 0.05, 0.5, 1).toFixed(1), '% O2', P.acc, P); bars(g, sub(g, b, 'LIFE SUPPORT', P.acc, P), ls.slice(0, 3), P); return; }
  const [top, bot] = split(R, [1, 1], true, h * 0.05); const [a, b] = split(top, [0.9, 1.3], false, w * 0.03);
  const ca = sub(g, a, 'ATMOSPHERE', P.acc, P); const [a1, a2] = split(ca, [1, 1], true, 4); big(g, a1, jit(21.4, 0.05, 0.5, 1).toFixed(1), '% O2', P.acc, P); spark(g, a2, P.acc, 7, 0.8, P, 0.3);
  bars(g, sub(g, b, 'LIFE SUPPORT', P.acc, P), ls, P);
  const [c, d] = split(bot, [1.3, 1], false, w * 0.03);
  lights(g, sub(g, c, 'DECKS', P.acc, P), [['DECK 1', 'ok'], ['DECK 2', 'ok'], ['DECK 3', 'ok'], ['DECK 4', 'ok'], ['DECK 5', 'ok'], ['DECK 6', 'ok'], ['DECK 7', 'ok'], ['DECK 8', 'ok']], P, 2);
  table(g, sub(g, d, 'BRIDGE', P.acc, P), [['TEMP', '21.5 °C'], ['GRAVITY', '1.00 G'], ['LIGHTING', state.light.toUpperCase()]], P);
};

// ---------- ready room + conference room displays ----------
function wrapText(g, text, x, y, maxW, lh, maxLines) {
  const words = text.split(' '); let line = '', n = 0;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y + n * lh); n++; line = w; if (n >= maxLines) return n; } else line = t; }
  if (line && n < maxLines) { g.fillText(line, x, y + n * lh); n++; }
  return n;
}
const LOG = [
  { d: '2.114.07', t: 'Convoy escort, day six. Three freighters, one warship and a lot of empty sky. The crew is tired but sharp. I would rather they were tired than surprised.' },
  { d: '2.115.02', t: 'We lost the Kestrel Maiden for eleven minutes today, sensor shadow behind a gas giant. Longest eleven minutes of the month. Everyone on the bridge pretended to breathe normally.' },
  { d: '2.116.19', t: 'Science found microbial life under the ice at Mira Vey. Logged it, marked it and moved on. Someday somebody will come back here with time to spare. I hope it is us.' },
  { d: '2.117.04', t: 'Engineering wants a week in drydock and coil bank B recalibrated. They will get both the day the war gives them back. Until then she holds together because they hold her together.' },
];
const SLIDES = ['Convoy Route', 'Threat Assessment', 'Ship Readiness'];
function routeW(g, r, P) {
  const pts = [[0.1, 0.66], [0.37, 0.34], [0.63, 0.62], [0.9, 0.3]].map(([u, v]) => [r.x + u * r.w, r.y + v * r.h]);
  g.strokeStyle = P.line; g.lineWidth = 3; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  const a = pts[state.cur], b = pts[state.dest];
  g.setLineDash([10, 7]); g.strokeStyle = P.ice; g.lineWidth = 3; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.setLineDash([]);
  const fs = clamp(r.h * 0.07, 9, 22);
  pts.forEach(([x, y], i) => {
    hexNode(g, x, y, fs * 0.9); g.fillStyle = i === state.cur ? P.ice : i === state.dest ? P.acc : P.ice; g.fill();
    hexNode(g, x, y, fs * 0.4); g.fillStyle = '#000'; g.fill();
    g.fillStyle = i === state.cur || i === state.dest ? P.txt : P.dim; g.font = `600 ${fs | 0}px ${DISP}`; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText(SYSTEMS[i].star.toUpperCase(), x, y + fs * 1.2);
  });
  const t = state.speed === 'warp' ? (elapsed * 0.08) % 1 : 0.0, cx = a[0] + (b[0] - a[0]) * t, cy = a[1] + (b[1] - a[1]) * t;
  [[0, 0, P.acc], [-14, 10, P.ice], [-26, 2, P.ice], [-18, -10, P.ice]].forEach(([dx, dy, c]) => { hexNode(g, cx + dx, cy + dy - fs * 1.6, dx ? 5 : 7); g.fillStyle = c; g.fill(); });
}
DRAW.log = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, e = LOG[state.logIdx];
  const [a, b] = split(R, [1.75, 1], false, w * 0.04);
  const ca = sub(g, a, 'PERSONAL LOG · ' + e.d, P.acc, P);
  const fs = clamp(ca.h / 6.4, 9, 24); g.font = `500 ${fs | 0}px Barlow, system-ui, sans-serif`; g.fillStyle = P.txt; g.textAlign = 'left'; g.textBaseline = 'top';
  wrapText(g, e.t, ca.x, ca.y + 2, ca.w, fs * 1.32, 5);
  table(g, sub(g, b, 'DESK', P.acc, P), [['REPORTS', state.reports ? state.reports + ' TO SIGN' : 'ALL SIGNED', state.reports ? P.yel : P.green], ['NEXT BRIEF', '0800'], ['WATCH', 'BETA'], ['CONVOY', '3 · GREEN', P.green]], P);
};
DRAW.brief = function (g, x, y, w, h, P) {
  const R = { x, y, w, h };
  if (state.slide === 0) {
    const [a, b] = split(R, [1.7, 1], false, w * 0.03);
    routeW(g, sub(g, a, 'ROUTE · FOUR SYSTEMS', P.acc, P), P);
    table(g, sub(g, b, 'ITINERARY', P.acc, P), SYSTEMS.map((s, i) => [s.star.toUpperCase(), i === state.cur ? 'HERE' : i === state.dest ? 'NEXT' : '—', i === state.cur ? P.green : i === state.dest ? P.acc : P.dim]).concat([['ESCORTING', '3 FREIGHTERS']]), P);
  } else if (state.slide === 1) {
    const [a, b] = split(R, [1, 1.25], false, w * 0.03);
    plotW(g, sub(g, a, 'SECTOR PLOT', P.red, P), P);
    const [b1, b2] = split(b, [1.1, 1], true, h * 0.05);
    bars(g, sub(g, b1, 'THREAT BY SECTOR', P.red, P), [['SECTOR 7', 0.18, P.green], ['SECTOR 8', 0.42, P.yel], ['SECTOR 9', 0.71, P.red], ['DEEP FIELD', 0.3, P.yel]], P);
    logw(g, sub(g, b2, 'INTELLIGENCE', P.red, P), LOGS.intel, P, 0.4);
  } else {
    const [a, b] = split(R, [1.25, 1], false, w * 0.03);
    bars(g, sub(g, a, 'DEPARTMENT READINESS', P.yel, P), [['FLIGHT', 0.96, P.green], ['TACTICAL', 0.92, P.green], ['ENGINEERING', 0.81, P.yel], ['SCIENCE', 0.88, P.green], ['MEDICAL', 0.94, P.green], ['STORES', 0.86, P.yel]], P);
    lights(g, sub(g, b, 'OPEN ITEMS', P.yel, P), [['COIL BANK B RECAL', 'warn'], ['SIF GEN 2 SERVICE', 'warn'], ['TORPEDO RESUPPLY', 'ok'], ['SHUTTLE 2 INSPECTION', 'ok'], ['SHORE LEAVE ROTA', 'off'], ['CREW EVALUATIONS', 'act']], P);
  }
};
function drawKeys(s) {
  const g = s.g, W = s.w, H = s.h, P = pal();
  g.fillStyle = P.bg; g.fillRect(0, 0, W, H);
  const cols = Math.max(3, Math.round(W / 34)), rows = Math.max(1, Math.round(H / 34));
  const cw = W / cols, ch = H / rows, colors = [P.acc, P.accDim, P.ice, P.acc];
  const r = mulberry(s.seed);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const base = r(), rate = 0.3 + r() * 1.6, col = colors[(r() * 4) | 0];
    const on = Math.sin(elapsed * rate + base * 20) > (base < 0.35 ? -0.9 : 0.2);
    const pw = cw * (base > 0.8 ? 0.88 : 0.76), ph = ch * 0.66, kx = i * cw + (cw - pw) / 2, ky = j * ch + (ch - ph) / 2;
    hexTab(g, kx, ky, pw, ph, true, true); g.fillStyle = on ? col : P.line; g.globalAlpha = on ? 0.95 : 1; g.fill();
    if (on && ph > 18 && base > 0.55) { g.globalAlpha = 1; g.fillStyle = '#000'; g.font = `700 ${ph * 0.36 | 0}px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String((base * 90 | 0) + 10), kx + pw / 2, ky + ph / 2 + 1); }
  }
  g.globalAlpha = 1;
}
function drawBand(s) {
  const g = s.g, W = s.w, H = s.h, P = pal();
  g.fillStyle = P.bg; g.fillRect(0, 0, W, H);
  hexNode(g, H * 0.32, H * 0.42, H * 0.26); g.fillStyle = state.alert === 'green' ? P.sand : P.acc; g.fill(); hexNode(g, H * 0.32, H * 0.42, H * 0.11); g.fillStyle = '#000'; g.fill();
  g.save(); g.translate(H * 0.42, 0); g.textBaseline = 'middle'; g.textAlign = 'left';
  fitFont(g, s.title, 700, H * 0.26, DISP, W * 0.5); g.fillStyle = state.alert === 'green' ? P.txt : P.acc; g.fillText(state.alert === 'green' ? 'STANDING DOWN' : s.title, 24, H * 0.3);
  g.font = `500 ${H * 0.13 | 0}px ${MONO}`; g.fillStyle = P.dim; g.fillText(s.code, 24, H * 0.62);
  const n = 10, sx = W * 0.56, sw = (W * 0.96 - sx) / n;
  for (let i = 0; i < n; i++) { const on = state.alert === 'green' ? i < 2 : i < 10; hexTab(g, sx + i * sw - H * 0.42, H * 0.22, sw - 3, H * 0.5, true, true); g.fillStyle = on ? (state.alert === 'green' ? P.sec : P.acc) : P.line; g.fill(); }
  g.fillStyle = P.dim; g.font = `500 ${H * 0.11 | 0}px ${MONO}`; g.textAlign = 'right'; g.fillText(state.alert === 'green' ? 'WATCH ROTATION 2 OF 3' : 'ALL STATIONS MANNED', W * 0.96 - H * 0.42, H * 0.86); g.restore();
}
function drawCmd(s) {
  const g = s.g, W = s.w, H = s.h, P = pal();
  g.drawImage(screenBg(W, H, P), 0, 0);
  g.strokeStyle = P.acc; g.lineWidth = 2; chamfer(g, 4, 4, W - 8, H - 8, 12); g.stroke();
  drawCrest(g, W / 2, 44, 24, P.acc, 2);
  g.textAlign = 'center'; g.textBaseline = 'top';
  g.fillStyle = P.dim; g.font = `500 14px ${MONO}`; g.fillText('COND', W / 2, 86);
  fitFont(g, ALERTS[state.alert].short, 700, 26, DISP, W - 16); g.fillStyle = P.acc; g.fillText(ALERTS[state.alert].short, W / 2, 104);
  g.fillStyle = P.dim; g.font = `500 14px ${MONO}`; g.fillText('SPEED', W / 2, 146);
  const sp = SPEEDS[state.speed].screen.split(' ')[0]; fitFont(g, sp, 600, 22, DISP, W - 16); g.fillStyle = P.txt; g.fillText(sp, W / 2, 164);
  const rows = [['SHIELDS', ARCS.reduce((a, k) => a + shieldNow(k), 0) / 400], ['HULL', hullIntegrity() / 100], ['POWER', reactorOut() / SIM.reactor], ['BEAMS', (sim.beams.dorsal + sim.beams.ventral) / 2], ['TORPS', torpsLeft() / (SIM.torp.perBay * 2)]];
  rows.forEach(([k, v], i) => { const y0 = 204 + i * 28; g.fillStyle = P.dim; g.font = `500 11px ${MONO}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(k, 20, y0); g.fillStyle = P.line; g.fillRect(20, y0 + 13, W - 40, 8); g.fillStyle = k === 'HULL' && v < 0.5 ? P.red : i % 2 ? P.ice : P.acc; g.fillRect(20, y0 + 13, (W - 40) * clamp(v, 0, 1), 8); });
}
function drawScreen(s) {
  if (s.kind === 'cmd') drawCmd(s);
  else if (s.kind === 'keys') drawKeys(s);
  else if (s.kind === 'band') drawBand(s);
  else {
    const g = s.g, W = s.w, H = s.h, P = pal();
    g.fillStyle = P.bg; g.fillRect(0, 0, W, H);
    const pad = Math.max(5, Math.round(Math.min(W, H) * 0.045));
    const tall = H > W * 1.2;
    const colW = tall ? 0 : Math.round(clamp(W * 0.11, 34, 110));
    // numbered touch-key column
    const FC = fnColor(P, s.station), fs = Math.round(clamp(Math.min(H, W * 0.5) * (H < 200 ? 0.15 : 0.09), 11, 40));
    const nodeR = colW ? Math.min(colW * 0.42, fs * 0.95) : fs * 0.55;
    const ncx = colW ? pad + colW / 2 : pad + nodeR, ncy = pad + Math.max(nodeR, fs * 0.6);
    hexNode(g, ncx, ncy, nodeR); g.fillStyle = FC; g.fill();
    hexNode(g, ncx, ncy, nodeR * 0.45); g.fillStyle = '#000'; g.fill();
    if (colW) {
      const top = ncy + nodeR + pad * 0.8;
      const n = clamp(Math.round((H - top - pad) / Math.max(28, H * 0.16)), 1, 6), gap = pad * 0.6, kh = (H - top - pad - (n - 1) * gap) / n;
      const r = mulberry(s.seed), cols = [FC, P.sand, FC, P.line];
      for (let i = 0; i < n; i++) {
        const c = i === 0 ? FC : cols[(r() * 4) | 0], ph = r() * 9, sp = 0.4 + r() * 0.8, num = String(1000 + ((s.seed * 37 + i * 113) % 8999));
        const blink = Math.sin(elapsed * sp + ph) > 0.93;
        hexTab(g, pad, top + i * (kh + gap), colW, kh, true, true); g.fillStyle = blink ? '#ffffff' : c; g.fill();
        g.fillStyle = c === P.line ? P.dim : '#000'; g.textAlign = 'right'; g.textBaseline = 'middle'; fitFont(g, num, 700, Math.min(kh * 0.4, colW * 0.28), MONO, colW * 0.6); g.fillText(num, pad + colW - Math.min(kh * 0.32, colW / 3) - 2, top + i * (kh + gap) + kh / 2 + 1);
      }
    }
    const x0 = colW ? pad * 2 + colW : pad * 2 + nodeR * 2;
    g.textBaseline = 'top'; g.textAlign = 'left'; g.fillStyle = P.txt; fitFont(g, s.title.toUpperCase(), 700, fs, DISP, (W - x0 - pad) * 0.7); g.fillText(s.title.toUpperCase(), x0, pad);
    g.textAlign = 'right'; g.fillStyle = P.dim; g.font = `500 ${fs * 0.6 | 0}px ${MONO}`; g.fillText(s.code, W - pad, pad + fs * 0.25);
    const ly = pad + fs * 1.22, bh = Math.max(5, fs * 0.36), rw = W - x0 - pad;
    hexTab(g, x0, ly, rw * 0.42, bh, false, true); g.fillStyle = FC; g.fill();
    hexTab(g, x0 + rw * 0.44, ly, rw * 0.16, bh, true, true); g.fillStyle = P.sand; g.fill();
    hexTab(g, x0 + rw * 0.62, ly, rw * 0.38, bh, true, false); g.fillStyle = P.line; g.fill();
    DRAW[s.kind](g, x0, ly + bh + pad * 0.8, W - x0 - pad, H - ly - bh - pad * 1.8, P, s);
  }
  s.tex.needsUpdate = true;
}
function redrawAll() { screens.forEach(drawScreen); drawOverlay(); }
redrawAll();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { redrawAll(); });
