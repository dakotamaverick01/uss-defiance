// USS Defiance · screens.js
// Console screen drawing: the instrument widget kit and every station display.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- screen drawing ----------
// The interface is built from solid blocks on black: an elbow frame, pill buttons, solid bars and number columns.
// No outlines, glows or grid backgrounds. Colours come from pal() (core.js): peach frames, tan and butterscotch
// readouts, lilac as the second colour, rose and plum as small accents, and green/amber/red for status only.
const bgCache = new Map();
function chamfer(g, x, y, w, h, c) { rrect(g, x, y, w, h, c); }
function screenBg(W, H, P) {
  const key = W + 'x' + H; if (bgCache.has(key)) return bgCache.get(key);
  const c = cnv(W, H), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); bgCache.set(key, c); return c;
}
const FUNC = { command: 'acc', ship: 'acc', viewer: 'acc', ops: 'acc', ready: 'acc', conference: 'acc', helm: 'green', carto: 'green', science: 'green', ew: 'green', intel: 'green', engineering: 'yel', damage: 'yel', env: 'yel', comms: 'yel', lift: 'yel', head: 'yel', band: 'yel', defense: 'red', weapons: 'red', desk: 'acc', brief: 'acc', honors: 'acc', synth: 'yel', shutters: 'yel' };
// Stations are told apart by their layout and labels, not by hue: every station uses the same palette.
const FUNC_CSS = { acc: 'var(--signal)', green: 'var(--signal)', yel: 'var(--signal)', red: 'var(--signal)' };
function fnColor(P) { return P.acc; }
function fitFont(g, text, weight, size, family, maxW) { let s = size; g.font = `${weight} ${s | 0}px ${family}`; while (s > 8 && g.measureText(text).width > maxW) { s -= 1; g.font = `${weight} ${s | 0}px ${family}`; } }
function throttle() { return cur.speed <= 12 ? cur.speed / 12 * 0.25 : 0.25 + (cur.speed - 12) / 408 * 0.75; }
// ---------- dense instrument widgets ----------
function jit(b, a, f, i) { return b + Math.sin(elapsed * f + (i || 0) * 1.7) * a; }
function split(r, fr, vertical, gap) {
  const tot = fr.reduce((a, b) => a + b, 0), out = []; let o = 0; const L = (vertical ? r.h : r.w) - gap * (fr.length - 1);
  fr.forEach((f) => { const sz = L * f / tot; out.push(vertical ? { x: r.x, y: r.y + o, w: r.w, h: sz } : { x: r.x + o, y: r.y, w: sz, h: r.h }); o += sz + gap; });
  return out;
}
const PAIR = (P, c) => (c === P.ice || c === P.green ? [P.ice, P.plum] : c === P.red ? [P.red, P.rose] : c === P.yel ? [P.butter, P.tan] : [P.acc, P.tan]);
// section header: a pill holding the label, then a solid bar running out to the edge
function sub(g, r, title, color, P) {
  const th = clamp(r.h * 0.14, 11, 26), [c1, c2] = PAIR(P, color);
  g.font = `600 ${th * 0.74 | 0}px ${DISP}`; const tw = Math.min(r.w * 0.7, g.measureText(title).width + th * 1.2);
  hexTab(g, r.x, r.y, tw, th, true, false); g.fillStyle = c1; g.fill();
  g.fillStyle = '#000'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(title, r.x + tw - th * 0.3, r.y + th / 2 + 1);
  const bx = r.x + tw + th * 0.25, bw = Math.max(0, r.w - tw - th * 0.25);
  if (bw > th) { g.fillStyle = c2; g.fillRect(bx, r.y + th * 0.3, bw - th * 0.55, th * 0.4); hexTab(g, r.x + r.w - th * 0.45, r.y, th * 0.45, th, false, true); g.fillStyle = c1; g.fill(); }
  return { x: r.x, y: r.y + th * 1.4, w: r.w, h: r.h - th * 1.4 };
}
// readout rows: a coloured key block, a tan label and a cream value
function table(g, r, rows, P) {
  const n = rows.length, rh = r.h / n, fs = clamp(rh * 0.6, 8, 26), kw = clamp(rh * 0.42, 5, 14), keys = [P.tan, P.ice, P.butter, P.plum];
  rows.forEach(([k, v, c], i) => {
    const y = r.y + i * rh, cy = y + rh / 2; g.textBaseline = 'middle';
    g.fillStyle = c && c !== P.txt ? c : keys[i % keys.length]; rrect(g, r.x, y + rh * 0.16, kw, rh * 0.68, kw * 0.25); g.fill();
    g.textAlign = 'left'; g.fillStyle = P.tan; fitFont(g, k, 500, fs * 0.8, DISP, r.w * 0.44 - kw); g.fillText(k, r.x + kw + 6, cy + 1);
    g.textAlign = 'right'; g.fillStyle = c || P.txt; fitFont(g, v, 600, fs, DISP, r.w * 0.54); g.fillText(v, r.x + r.w, cy + 1);
  });
}
// level bars: solid blocks on a dark plum track, with the number in its own block
function bars(g, r, rows, P) {
  const n = rows.length, rh = r.h / n, fs = clamp(rh * 0.48, 8, 20), lw = r.w * 0.34, nw = r.w * 0.15;
  rows.forEach(([k, v, c], i) => {
    const y = r.y + i * rh, bh = rh * 0.62, by = y + (rh - bh) / 2; g.textBaseline = 'middle';
    g.textAlign = 'left'; g.fillStyle = P.tan; fitFont(g, k, 500, fs, DISP, lw - 8); g.fillText(k, r.x, y + rh / 2 + 1);
    const bx = r.x + lw, bw = r.w - lw - nw - 6, f = clamp(v, 0, 1);
    g.fillStyle = P.line; g.fillRect(bx, by, bw, bh);
    hexTab(g, bx, by, Math.max(bh * 0.6, bw * f), bh, false, true); g.fillStyle = c || P.acc; g.fill();
    g.textAlign = 'right'; g.fillStyle = P.txt; g.font = `600 ${fs | 0}px ${DISP}`; g.fillText(Math.round(f * 100) + '%', r.x + r.w, y + rh / 2 + 1);
  });
}
// status: a pill per system, filled with its state, label inside
function lights(g, r, rows, P, cols) {
  cols = cols || 1; const per = Math.ceil(rows.length / cols), cw = r.w / cols, rh = r.h / per, fs = clamp(rh * 0.5, 8, 18);
  const C = { ok: P.tan, warn: P.yel, off: P.line, act: P.acc, alert: P.red, blink: Math.sin(elapsed * 6) > 0 ? P.yel : P.line };
  rows.forEach(([k, st, v], i) => {
    const cx = r.x + Math.floor(i / per) * cw, cy = r.y + (i % per) * rh, ph = rh * 0.74, pw = cw - 8 - (v ? cw * 0.28 : 0);
    hexTab(g, cx, cy + (rh - ph) / 2, pw, ph, true, true); g.fillStyle = C[st] || P.dim; g.fill();
    g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = st === 'off' ? P.dim : '#000'; fitFont(g, k, 600, fs, DISP, pw - ph); g.fillText(k, cx + ph * 0.55, cy + rh / 2 + 1);
    if (v) { g.textAlign = 'right'; g.fillStyle = P.txt; g.font = `600 ${fs | 0}px ${DISP}`; g.fillText(v, cx + cw - 8, cy + rh / 2 + 1); }
  });
}
// a trace drawn as a row of block columns
function spark(g, r, color, seed, speed, P, amp) {
  const n = Math.max(12, Math.round(r.w / 9)), bw = r.w / n;
  g.fillStyle = P.line; g.fillRect(r.x, r.y + r.h - 3, r.w, 3);
  for (let i = 0; i < n; i++) {
    const u = i / n, v = Math.sin(u * 9 + elapsed * speed + seed) * 0.28 + Math.sin(u * 23 - elapsed * speed * 1.7 + seed * 2) * 0.12 + Math.sin(u * 51 + elapsed * 3) * 0.05;
    const hh = clamp((0.5 + v * (amp || 1)) * r.h, 3, r.h);
    g.fillStyle = i % 7 === 3 ? P.butter : color; g.fillRect(r.x + i * bw + 1, r.y + r.h - hh, bw - 2, hh - 4);
  }
}
function big(g, r, value, unit, color, P) {
  fitFont(g, value, 600, r.h * 0.82, DISP, r.w * (unit ? 0.7 : 0.98)); g.fillStyle = color === P.acc ? P.butter : color; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(value, r.x, r.y + r.h / 2 + 2);
  if (unit) { const vw = g.measureText(value).width; g.font = `500 ${clamp(r.h * 0.26, 8, 22) | 0}px ${DISP}`; g.fillStyle = P.tan; g.fillText(unit, r.x + vw + 8, r.y + r.h * 0.62); }
}
// a scrolling column of readings, number-column style
function logw(g, r, lines, P, speed) {
  const fs = clamp(r.h / 6.2, 8, 17), lh = fs * 1.38, n = lines.length, off = (elapsed * (speed || 0.5)) % n, vis = Math.ceil(r.h / lh) + 1;
  g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip();
  g.font = `500 ${fs | 0}px ${DISP}`; g.textAlign = 'left'; g.textBaseline = 'top';
  for (let i = 0; i < vis; i++) {
    const idx = (Math.floor(off) + i) % n, yy = r.y + (i - (off % 1)) * lh, hot = i === vis - 2;
    g.fillStyle = hot ? P.acc : [P.tan, P.ice, P.butter][idx % 3]; g.fillRect(r.x, yy + lh * 0.12, fs * 0.5, lh * 0.66);
    g.fillStyle = hot ? P.butter : P.txt; g.fillText(lines[idx], r.x + fs * 0.9, yy + 1);
  }
  g.restore();
}
function throttleW(g, r, P) { const n = 14, sw = r.w / n, th = throttle(); for (let i = 0; i < n; i++) { g.fillStyle = (i + 0.5) / n < th ? (i > 10 ? P.ice : i > 6 ? P.butter : P.acc) : P.line; rrect(g, r.x + i * sw, r.y, sw - 4, r.h, 3); g.fill(); } }
// heading dial: a thick ring of blocks, the heading as a solid wedge
function dialW(g, r, deg, P) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2 * 0.95, hd = deg * D2R - Math.PI / 2 + Math.sin(elapsed * 0.8) * 0.03;
  for (let i = 0; i < 24; i++) { const a0 = i / 24 * Math.PI * 2 - Math.PI / 2 + 0.03, a1 = a0 + Math.PI / 12 - 0.06; g.strokeStyle = i % 6 === 0 ? P.tan : P.plum; g.lineWidth = rad * 0.2; g.beginPath(); g.arc(cx, cy, rad * 0.88, a0, a1); g.stroke(); }
  g.fillStyle = P.line; g.beginPath(); g.arc(cx, cy, rad * 0.7, 0, 7); g.fill();
  g.fillStyle = P.acc; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, rad * 0.68, hd - 0.16, hd + 0.16); g.closePath(); g.fill();
  g.fillStyle = P.butter; g.beginPath(); g.arc(cx, cy, rad * 0.2, 0, 7); g.fill();
}
function courseW(g, r, P) {
  const rr = mulberry(7 + state.cur);
  for (let i = 0; i < 50; i++) { g.fillStyle = `rgba(245,230,207,${0.25 + rr() * 0.5})`; g.fillRect(r.x + rr() * r.w, r.y + rr() * r.h, 2, 2); }
  const ax = r.x + r.w * 0.12, ay = r.y + r.h * 0.8, bx = r.x + r.w * 0.84, by = r.y + r.h * 0.22;
  for (let i = 0; i <= 18; i++) { const t = i / 18, px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * (r.x + r.w * 0.3) + t * t * bx, py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * (r.y + r.h * 0.2) + t * t * by; g.fillStyle = P.ice; rrect(g, px - 3, py - 3, 6, 6, 1.5); g.fill(); }
  g.fillStyle = P.butter; rrect(g, bx - 9, by - 9, 18, 18, 4); g.fill();
  const t = state.speed === 'warp' ? (elapsed * 0.08) % 1 : 0, px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * (r.x + r.w * 0.3) + t * t * bx, py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * (r.y + r.h * 0.2) + t * t * by;
  g.fillStyle = P.acc; rrect(g, px - 7, py - 7, 14, 14, 3); g.fill();
  const fs = clamp(r.h * 0.1, 8, 20); g.font = `600 ${fs | 0}px ${DISP}`; g.textBaseline = 'middle';
  g.textAlign = 'right'; g.fillStyle = P.txt; g.fillText(sysDest().star.toUpperCase(), bx - 16, by);
  g.textAlign = 'left'; g.fillStyle = P.tan; g.fillText(sysCur().star.toUpperCase(), ax + 10, ay);
}
// target globe: a solid disc banded in blocks, with a scan bar sweeping it
function globeW(g, r, P) {
  const rad = Math.min(r.w, r.h) / 2 * 0.92, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  g.save(); g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.clip();
  g.fillStyle = P.plum; g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  for (let i = -3; i <= 3; i++) { g.fillStyle = i % 2 ? P.ice : P.line; g.fillRect(cx - rad, cy + i * rad / 3.5 - rad * 0.06, rad * 2, rad * 0.12); }
  const off = (elapsed * 0.25) % 1; for (let i = 0; i < 4; i++) { const xx = cx - rad + ((i / 4 + off) % 1) * rad * 2; g.fillStyle = P.line; g.fillRect(xx, cy - rad, rad * 0.08, rad * 2); }
  const sy = cy + Math.sin(elapsed * (state.scanning ? 4 : 0.8)) * rad * 0.9; g.fillStyle = P.acc; g.fillRect(cx - rad, sy - rad * 0.05, rad * 2, rad * 0.1);
  g.restore();
}
function ringW(g, r, P, value, label) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2 * 0.92;
  for (let i = 0; i < 12; i++) {
    const a0 = i / 12 * Math.PI * 2 - Math.PI / 2 + 0.05, a1 = a0 + Math.PI * 2 / 12 - 0.1, on = Math.sin(elapsed * 0.7 + i * 1.3) > -0.6;
    g.strokeStyle = on ? [P.acc, P.tan, P.ice, P.butter][i % 4] : P.line; g.lineWidth = rad * 0.24; g.beginPath(); g.arc(cx, cy, rad * 0.84, a0, a1); g.stroke();
  }
  g.fillStyle = P.txt; g.textAlign = 'center'; g.textBaseline = 'middle'; fitFont(g, value, 600, rad * 0.56, DISP, rad * 1.15); g.fillText(value, cx, cy - rad * 0.04);
  g.fillStyle = P.tan; g.font = `500 ${clamp(rad * 0.17, 8, 16) | 0}px ${DISP}`; g.fillText(label, cx, cy + rad * 0.34);
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
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, s = Math.min(r.w * 0.36, r.h * 0.32);
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
    g.fillStyle = P.plum; g.fill(); g.strokeStyle = P.ice; g.lineWidth = 6; g.stroke();
    g.save(); g.clip();
    g.strokeStyle = '#000'; g.lineWidth = 3;
    for (let v = 0.33; v < 0.6; v += 0.045) { g.beginPath(); g.moveTo(X(0), Y(v)); g.lineTo(X(1), Y(v)); g.stroke(); }
    for (let u = 0.12; u < 0.8; u += 0.06) { g.beginPath(); g.moveTo(X(u), Y(0.2)); g.lineTo(X(u), Y(0.62)); g.stroke(); }
    const sx = X(0.03 + ((elapsed * 0.08) % 1) * 0.78); g.fillStyle = P.butter; g.fillRect(sx - 6, Y(0.2), 12, h * 0.45);
    g.restore();
    g.strokeStyle = P.ice; g.lineWidth = 6;
    [[0.6, 0.6, 0.64, 0.71], [0.7, 0.58, 0.74, 0.71]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(X(a), Y(b)); g.lineTo(X(c), Y(d)); g.stroke(); });
    const nx0 = X(0.5), nx1 = X(0.97), ny = Y(0.71), nh = h * 0.08;
    hexTab(g, nx0, ny, nx1 - nx0, nh, true, true); g.fillStyle = `rgba(143,195,224,${0.15 + warp * 0.65})`; g.fill(); g.stroke();
    g.strokeStyle = P.ice; g.beginPath(); g.arc(X(0.075), Y(0.48), h * 0.05, 0, 7); g.stroke();
    const core = 0.5 + 0.5 * Math.sin(elapsed * (2 + warp * 6)); g.fillStyle = P.acc; g.globalAlpha = 0.5 + core * 0.5; g.fillRect(X(0.565), Y(0.36), w * 0.012, h * 0.2); g.globalAlpha = 1;
    g.fillStyle = P.acc; g.fillRect(X(0.35), Y(0.245), w * 0.03, h * 0.035);
    [[0.585, 0.26], [0.45, 0.6]].forEach(([u, v]) => { g.fillStyle = state.alert === 'red' ? P.acc : P.dim; g.fillRect(X(u) - 6, Y(v) - 3, 12, 6); });
    const lab = (px, py, lx, ly, t, c) => { g.strokeStyle = P.tan; g.lineWidth = 3; g.beginPath(); g.moveTo(X(px), Y(py)); g.lineTo(X(lx), Y(ly)); g.stroke(); g.fillStyle = c || P.txt; g.font = `500 ${h * 0.055 | 0}px ${MONO}`; g.textAlign = lx < px ? 'right' : 'left'; g.textBaseline = 'middle'; g.fillText(t, X(lx) + (lx < px ? -6 : 6), Y(ly)); };
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
      hullTop(g, cx, cy, sz); g.fillStyle = P.plum; g.fill(); g.strokeStyle = P.ice; g.lineWidth = 4; g.stroke();
      [[0, -0.6, 'prow'], [0, 0, 'dorsal'], [0.45, 0.7, 'stbdNac'], [-0.45, 0.7, 'portNac'], [0, 0.5, 'engines']].forEach(([dx, dy, id], i) => { hexNode(g, cx + dx * sz, cy + dy * sz, 5); g.fillStyle = zcol(P, id); g.globalAlpha = 0.6 + 0.4 * Math.sin(elapsed * 2 + i * 1.4); g.fill(); g.globalAlpha = 1; });
      lights(g, sub(g, b, 'SYSTEMS', P.acc, P), [['WARP DRIVE', simCanWarp() ? (state.speed === 'warp' ? 'act' : 'ok') : 'alert'], ['IMPULSE', zoneStatus('engines')], ['DEFLECTOR', state.alert === 'green' ? 'ok' : 'act'], ['DORSAL TURRET', zoneStatus('dorsal')], ['VENTRAL ARRAY', zoneStatus('ventral')], ['TORPEDOES', zoneStatus('prow')], ['PORT EMITTERS', zoneStatus('port')], ['STBD EMITTERS', zoneStatus('stbd')], ['LIFE SUPPORT', 'ok'], ['CONTAINMENT', breach ? 'blink' : 'ok']], P);
      table(g, sub(g, c, 'SHIP', P.acc, P), [['SPEED', SPEEDS[state.speed].screen], ['HULL', Math.round(hullIntegrity()) + '%', zcol(P, worstZone() ? worstZone().id : 'prow')]], P);
    } else {
      const [a, b] = split(R, [1.2, 1], true, h * 0.03);
      plotW(g, sub(g, a, 'SECTOR PLOT', P.ice, P), P);
      table(g, sub(g, b, 'CONTACTS', P.ice, P), [['AMITY ROSE', 'FRIENDLY', P.ice], ['KESTREL MAIDEN', 'FRIENDLY', P.ice], ['IRON PATIENCE', 'FRIENDLY', P.ice], ['TRACK 0417', state.alert !== 'green' ? 'UNKNOWN' : 'BEACON', state.alert !== 'green' ? P.acc : P.ice], ['DESTINATION', sysDest().star.toUpperCase()]], P);
    }
  },
};
DRAW.nav = DRAW.helm;
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
function plotW(g, r, P) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2 * 0.92;
  g.fillStyle = P.line; g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.fill();
  g.fillStyle = '#000'; [0.72, 0.46].forEach((k) => { g.beginPath(); g.arc(cx, cy, rad * k, 0, 7); g.fill(); g.fillStyle = k > 0.5 ? P.line : '#000'; g.beginPath(); g.arc(cx, cy, rad * k - rad * 0.06, 0, 7); g.fill(); g.fillStyle = '#000'; });
  const sw = elapsed * 0.9; g.fillStyle = P.ice; g.globalAlpha = 0.85; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, rad, sw - 0.22, sw); g.closePath(); g.fill(); g.globalAlpha = 1;
  const rr = mulberry(51 + state.cur);
  for (let i = 0; i < 7; i++) { const an = rr() * 7, d = 0.3 + rr() * 0.6, s = rad * 0.07; g.fillStyle = i === 3 && state.alert !== 'green' ? P.acc : i < 3 ? P.butter : P.ice; rrect(g, cx + Math.cos(an) * d * rad - s, cy + Math.sin(an) * d * rad - s, s * 2, s * 2, s * 0.4); g.fill(); }
  g.fillStyle = P.acc; rrect(g, cx - rad * 0.09, cy - rad * 0.09, rad * 0.18, rad * 0.18, rad * 0.04); g.fill();
}
function reticleW(g, r, P) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2 * 0.9, red = state.alert === 'red';
  for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2 + 0.12; g.strokeStyle = q % 2 ? P.plum : P.tan; g.lineWidth = rad * 0.16; g.beginPath(); g.arc(cx, cy, rad * 0.88, a, a + Math.PI / 2 - 0.24); g.stroke(); }
  g.fillStyle = P.line; g.fillRect(cx - rad * 0.62, cy - rad * 0.03, rad * 1.24, rad * 0.06); g.fillRect(cx - rad * 0.03, cy - rad * 0.62, rad * 0.06, rad * 1.24);
  const a = elapsed * 0.6; g.strokeStyle = red ? P.red : P.ice; g.lineWidth = rad * 0.08;
  for (let i = 0; i < 4; i++) { const b = a + i * Math.PI / 2; g.beginPath(); g.arc(cx, cy, rad * 0.62, b, b + 0.5); g.stroke(); }
  if (red) { const tx = cx + Math.cos(elapsed * 0.4) * rad * 0.35, ty = cy + Math.sin(elapsed * 0.55) * rad * 0.25, s = rad * 0.13 * (1 + 0.1 * Math.sin(elapsed * 8)); g.fillStyle = P.red; rrect(g, tx - s, ty - s, s * 2, s * 2, s * 0.3); g.fill(); }
}
function drawKeys(s) {
  const g = s.g, W = s.w, H = s.h, P = pal();
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const cols = Math.max(3, Math.round(W / 40)), rows = Math.max(1, Math.round(H / 32));
  const cw = W / cols, ch = H / rows, colors = [P.acc, P.tan, P.ice, P.butter, P.tan, P.rose];
  const r = mulberry(s.seed);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const base = r(), rate = 0.3 + r() * 1.6, col = colors[(r() * colors.length) | 0], wide = base > 0.78 && i < cols - 1;
    if (r() < 0.12) continue; // a gap now and then, so the pad reads as laid out rather than tiled
    const on = Math.sin(elapsed * rate + base * 20) > (base < 0.3 ? -0.92 : -0.4);
    const pw = cw * (wide ? 1.7 : 0.84), ph = ch * 0.7, kx = i * cw + cw * 0.08, ky = j * ch + (ch - ph) / 2;
    hexTab(g, kx, ky, pw, ph, (i + j) % 3 === 0, (i + j) % 3 === 1); g.fillStyle = on ? col : P.line; g.fill();
    if (ph > 14) { g.fillStyle = on ? '#000' : P.dim; g.font = `600 ${ph * 0.42 | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(String((base * 89 | 0) + 10), kx + pw - ph * 0.3, ky + ph / 2 + 1); }
    if (wide) i++;
  }
}
function drawBand(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), green = state.alert === 'green', pad = H * 0.08, colW = H * 0.34, barH = H * 0.12;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  elbow(g, pad, pad, colW, barH, W * 0.3, H * 0.12, true, green ? P.tan : P.acc);
  elbow(g, pad, H - pad, colW, barH, W * 0.22, H * 0.12, false, green ? P.ice : P.acc);
  g.textBaseline = 'middle'; g.textAlign = 'left';
  fitFont(g, green ? 'STANDING DOWN' : s.title, 600, H * 0.3, DISP, W * 0.44); g.fillStyle = green ? P.txt : P.acc; g.fillText(green ? 'STANDING DOWN' : s.title, pad + colW + H * 0.12, H * 0.46);
  const n = 10, sx = W * 0.56, sw = (W * 0.96 - sx) / n;
  for (let i = 0; i < n; i++) { const on = green ? i < 2 : true; hexTab(g, sx + i * sw, H * 0.3, sw - 4, H * 0.32, i === 0, i === n - 1); g.fillStyle = on ? (green ? P.tan : i % 3 === 2 ? P.butter : P.acc) : P.line; g.fill(); }
  g.fillStyle = P.tan; g.font = `500 ${H * 0.13 | 0}px ${DISP}`; g.textAlign = 'right'; g.fillText(green ? 'WATCH ROTATION 2 OF 3' : 'ALL STATIONS MANNED', W * 0.96, H * 0.8);
}
function drawCmd(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), p = 6, bw = W - p * 2;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  hexTab(g, p, p, bw, 22, true, true); g.fillStyle = P.acc; g.fill();
  g.fillStyle = '#000'; g.font = `600 15px ${DISP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('COMMAND', W / 2, p + 12);
  const blk = (y, h, label, value, c) => { g.fillStyle = c; g.fillRect(p, y, 10, h); g.fillStyle = P.tan; g.font = `500 13px ${DISP}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(label, p + 16, y); fitFont(g, value, 600, 24, DISP, bw - 18); g.fillStyle = c === P.acc ? P.butter : P.txt; g.fillText(value, p + 16, y + 16); };
  blk(40, 44, 'CONDITION', ALERTS[state.alert].short, P.acc);
  blk(94, 44, 'SPEED', SPEEDS[state.speed].screen.split(' ')[0], P.ice);
  const rows = [['SHIELDS', ARCS.reduce((a, k) => a + shieldNow(k), 0) / 400], ['HULL', hullIntegrity() / 100], ['POWER', reactorOut() / SIM.reactor], ['BEAMS', (sim.beams.dorsal + sim.beams.ventral) / 2], ['TORPS', torpsLeft() / (SIM.torp.perBay * 2)]];
  rows.forEach(([k, v], i) => { const y0 = 152 + i * 34; g.fillStyle = P.tan; g.font = `500 12px ${DISP}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(k, p, y0); g.fillStyle = P.line; g.fillRect(p, y0 + 15, bw, 12); hexTab(g, p, y0 + 15, Math.max(12, bw * clamp(v, 0, 1)), 12, false, true); g.fillStyle = k === 'HULL' && v < 0.5 ? P.red : [P.acc, P.ice, P.butter, P.tan, P.rose][i]; g.fill(); });
  hexTab(g, p, H - p - 14, bw, 14, true, true); g.fillStyle = P.plum; g.fill();
}
// the status strip on the shelf above a wall station: code cap, title, then a run of blocks
function drawStrip(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), p = Math.round(H * 0.14), bh = H - p * 2, cap = bh * 2.2;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  hexTab(g, p, p, cap, bh, true, false); g.fillStyle = P.acc; g.fill();
  g.fillStyle = '#000'; g.font = `600 ${bh * 0.6 | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText((s.code.split('·')[1] || ''), p + cap - bh * 0.25, H / 2 + 1);
  const t = s.title.toUpperCase(); fitFont(g, t, 600, bh * 0.92, DISP, W * 0.32); g.fillStyle = P.acc; g.textAlign = 'left'; g.fillText(t, p + cap + bh * 0.3, H / 2 + 2);
  let x = p + cap + bh * 0.6 + g.measureText(t).width; const r = mulberry(s.seed + 5), cols = [P.tan, P.ice, P.butter, P.plum, P.tan, P.rose];
  while (x < W - p - bh * 0.8) { const w = bh * (0.8 + r() * 3.2), c = cols[(r() * cols.length) | 0], on = Math.sin(elapsed * (0.3 + r()) + r() * 9) > -0.7; g.fillStyle = on ? c : P.line; g.fillRect(x, p, Math.min(w, W - p - bh * 0.8 - x), bh); x += w + bh * 0.25; }
  hexTab(g, W - p - bh * 0.6, p, bh * 0.6, bh, false, true); g.fillStyle = P.acc; g.fill();
}
// Deck 2: the lobby directory and the wardroom mess board
DRAW.deck2 = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, [a, b] = split(R, [1.4, 1], false, w * 0.04);
  table(g, sub(g, a, 'OFFICERS’ DECK', P.acc, P), [['CAPTAIN’S QUARTERS', 'FORWARD'], ['LIFT 1 LOBBY', 'YOU ARE HERE', P.acc], ['OFFICERS’ CORRIDOR', 'AFT'], ['FIRST OFFICER', 'SEALED', P.dim], ['SENIOR OFFICERS', 'SEALED', P.dim], ['OFFICERS’ WARDROOM', 'AFT END'], ['OBSERVATION LOUNGE', 'SEALED', P.dim]], P);
  lights(g, sub(g, b, 'DECK', P.ice, P), [['ATMOSPHERE', 'ok'], ['GRAVITY', 'ok'], ['LIGHTING', state.alert === 'red' ? 'alert' : 'ok'], ['FITTING-OUT', 'warn'], ['LIFT 1', typeof LIFT === 'undefined' || LIFT.phase === 'idle' ? 'ok' : 'act']], P);
};
DRAW.mess = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, [a, b] = split(R, [1.3, 1], false, w * 0.04), [b1, b2] = split(b, [1, 1], true, h * 0.06);
  table(g, sub(g, a, 'MESS · TODAY', P.acc, P), [['0630', 'BREAKFAST · ALPHA WATCH'], ['1200', 'MIDDAY · ALL WATCHES'], ['1830', 'OFFICERS’ DINNER'], ['2200', 'NIGHT GALLEY'], ['HOST', 'FIRST OFFICER']], P);
  lights(g, sub(g, b1, 'TABLE', P.ice, P), [['SEATS 10', 'ok'], ['GUESTS 2', 'act']], P);
  spark(g, sub(g, b2, 'GALLEY', P.acc, P), P.tan, 4, 0.5, P, 0.4);
};
// the narrow panel beside each wall station's main display
DRAW.aux = function (g, x, y, w, h, P, s) {
  const R = { x, y, w, h }, [a, b, c] = split(R, [1, 1.1, 0.9], true, h * 0.04), up = state.alert !== 'green';
  ringW(g, sub(g, a, 'LOAD', P.acc, P), P, Math.round(jit(58 + (s.seed % 30), 2, 0.4, s.seed)) + '%', 'DUTY');
  lights(g, sub(g, b, 'BUS', P.ice, P), [['PRIMARY', 'ok'], ['BACKUP', 'ok'], ['LINK ' + (s.seed % 9 + 1), up ? 'act' : 'ok'], ['ISOLATE', 'off'], ['RELAY', up ? 'warn' : 'ok']], P);
  spark(g, sub(g, c, 'TRACE', P.acc, P), P.ice, s.seed, 1.2, P);
};
function drawScreen(s) {
  if (s.kind === 'strip') drawStrip(s);
  else if (s.kind === 'cmd') drawCmd(s);
  else if (s.kind === 'keys') drawKeys(s);
  else if (s.kind === 'band') drawBand(s);
  else {
    const g = s.g, W = s.w, H = s.h, P = pal(), small = H < 200;
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    const pad = Math.max(4, Math.round(Math.min(W, H) * 0.035)), gap = Math.max(3, Math.round(pad * 0.7));
    const colW = Math.round(clamp(W * 0.085, 22, 92)), barH = Math.round(clamp(H * (small ? 0.075 : 0.042), 6, 22));
    const fs = Math.round(clamp(H * (small ? 0.13 : 0.068), 11, 46)), ext = Math.round(clamp(H * 0.1, 8, 64));
    const title = s.title.toUpperCase(); fitFont(g, title, 600, fs, DISP, W * 0.5); const tw = g.measureText(title).width;
    const tx = W - pad - fs * 0.55 - gap, barEnd = tx - tw - gap * 2;
    // top elbow and bar: peach, a tan block, a lilac block, then the title on black and a peach end cap
    const seg1 = Math.max(colW + barH * 2, (barEnd - pad) * 0.48);
    elbow(g, pad, pad, colW, barH, seg1, ext, true, P.acc);
    const s2 = pad + seg1 + gap, s2w = (barEnd - s2) * 0.32;
    if (s2w > 4) { g.fillStyle = P.tan; g.fillRect(s2, pad, s2w, barH); g.fillStyle = P.ice; g.fillRect(s2 + s2w + gap, pad, Math.max(0, barEnd - s2 - s2w - gap), barH); }
    g.fillStyle = P.acc; g.textAlign = 'right'; g.textBaseline = 'top'; g.fillText(title, tx, pad - fs * 0.08);
    hexTab(g, W - pad - fs * 0.55, pad, fs * 0.55, barH, false, true); g.fillStyle = P.acc; g.fill();
    // bottom elbow and bar, with the station code in its own block
    g.font = `600 ${Math.round(barH * 1.05)}px ${DISP}`; const code = s.code || '', cw2 = g.measureText(code).width + barH * 2;
    const bseg = Math.max(colW + barH * 2, (W - pad * 2 - cw2) * 0.38);
    elbow(g, pad, H - pad, colW, barH, bseg, ext, false, P.tan);
    const b2 = pad + bseg + gap, b2w = W - pad - cw2 - gap - b2;
    if (b2w > 4) { g.fillStyle = P.plum; g.fillRect(b2, H - pad - barH, b2w * 0.55, barH); g.fillStyle = P.acc; g.fillRect(b2 + b2w * 0.55 + gap, H - pad - barH, b2w * 0.45 - gap, barH); }
    hexTab(g, W - pad - cw2, H - pad - barH, cw2, barH, false, true); g.fillStyle = P.butter; g.fill();
    g.fillStyle = '#000'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(code, W - pad - cw2 + barH * 0.5, H - pad - barH / 2 + 1);
    // the column between the elbows: numbered blocks
    const cy0 = pad + barH + ext + gap, cy1 = H - pad - barH - ext - gap, avail = cy1 - cy0;
    if (avail > 14) {
      const n = clamp(Math.round(avail / Math.max(24, H * 0.12)), 1, 6), kh = (avail - (n - 1) * gap) / n, r = mulberry(s.seed), cols = [P.ice, P.tan, P.butter, P.rose, P.tan, P.plum];
      for (let i = 0; i < n; i++) {
        const c = cols[(r() * cols.length) | 0], blink = Math.sin(elapsed * (0.4 + r() * 0.8) + r() * 9) > 0.95, num = String(10 + ((s.seed * 37 + i * 113) % 89)) + '-' + String(1000 + ((s.seed * 53 + i * 71) % 8999));
        g.fillStyle = blink ? P.txt : c; g.fillRect(pad, cy0 + i * (kh + gap), colW, kh);
        if (kh > 12) { g.fillStyle = '#000'; g.textAlign = 'right'; g.textBaseline = 'bottom'; fitFont(g, num, 600, Math.min(kh * 0.36, colW * 0.24), DISP, colW - 6); g.fillText(num, pad + colW - 4, cy0 + i * (kh + gap) + kh - 2); }
      }
    }
    const x0 = pad + colW + gap * 2.5, y0 = pad + Math.max(fs * 1.02, barH + ext * 0.4) + gap, y1 = H - pad - barH - gap * 1.6;
    DRAW[s.kind](g, x0, y0, W - x0 - pad, y1 - y0, P, s);
  }
  s.tex.needsUpdate = true;
}

function redrawAll() { screens.forEach(drawScreen); drawOverlay(); }
redrawAll();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { redrawAll(); });
