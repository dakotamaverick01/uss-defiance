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
  const th = clamp(r.h * 0.12, 11, 22), [c1, c2] = PAIR(P, color);
  fitFont(g, title, 600, th * 0.74, DISP, r.w * 0.7 - th * 1.2); const tw = Math.min(r.w * 0.7, g.measureText(title).width + th * 1.2);
  hexTab(g, r.x, r.y, tw, th, true, false); g.fillStyle = c1; g.fill();
  g.fillStyle = '#000'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(title, r.x + tw - th * 0.3, r.y + th / 2 + 1);
  const bx = r.x + tw + th * 0.25, bw = Math.max(0, r.w - tw - th * 0.25);
  if (bw > th) {
    g.fillStyle = c2; g.fillRect(bx, r.y + th * 0.3, bw - th * 0.55, th * 0.4); hexTab(g, r.x + r.w - th * 0.45, r.y, th * 0.45, th, false, true); g.fillStyle = c1; g.fill();
    // about a third of header bars carry a slow travelling block; the rest stay still
    const hs = hash1(r.x * 0.37 + r.y * 0.11 + title.length), span = bw - th * 0.55 - th;
    if (hs < 0.34) { const px = bx + ((elapsed * (10 + hs * 30) + hs * 999) % Math.max(1, span)); g.fillStyle = P.butter; g.fillRect(px, r.y + th * 0.3, th * (0.6 + hs), th * 0.4); }
  }
  return { x: r.x, y: r.y + th * 1.4, w: r.w, h: r.h - th * 1.4 };
}
// readout rows: a coloured key block, a tan label and a cream value
function table(g, r, rows, P) {
  const n = rows.length, rh = r.h / n, fs = clamp(rh * 0.6, 8, 20), kw = clamp(rh * 0.42, 5, 12), keys = [P.tan, P.ice, P.butter, P.plum];
  rows.forEach(([k, v, c], i) => {
    const y = r.y + i * rh, cy = y + rh / 2; g.textBaseline = 'middle';
    g.fillStyle = c && c !== P.txt ? c : keys[i % keys.length]; rrect(g, r.x, y + rh * 0.16, kw, rh * 0.68, kw * 0.25); g.fill();
    g.textAlign = 'left'; g.fillStyle = P.tan; fitFont(g, k, 500, fs * 0.8, DISP, r.w * 0.44 - kw); g.fillText(k, r.x + kw + 6, cy + 1);
    g.textAlign = 'right'; g.fillStyle = c || P.txt; fitFont(g, v, 600, fs, DISP, r.w * 0.54); g.fillText(v, r.x + r.w, cy + 1);
  });
}
// level bars: solid blocks on a dark plum track, with the number in its own block
function bars(g, r, rows, P) {
  const n = rows.length, rh = r.h / n, fs = clamp(rh * 0.48, 8, 16), lw = r.w * 0.34, nw = r.w * 0.15;
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
  cols = cols || 1; const per = Math.ceil(rows.length / cols), cw = r.w / cols, rh = Math.min(r.h / per, 34), fs = clamp(rh * 0.5, 8, 15);
  const C = { ok: P.tan, warn: P.yel, off: P.line, act: P.acc, alert: P.red, blink: P.yel };
  rows.forEach(([k, st, v], i) => {
    const cx = r.x + Math.floor(i / per) * cw, cy = r.y + (i % per) * rh, ph = rh * 0.74, pw = cw - 8 - (v ? cw * 0.28 : 0);
    const blinkOn = st !== 'blink' || Math.sin(elapsed * 2.4 + i * 2.3) > -0.2; hexTab(g, cx, cy + (rh - ph) / 2, pw, ph, true, true); g.fillStyle = blinkOn ? C[st] || P.dim : P.line; g.fill();
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
  const us = clamp(r.h * 0.24, 8, 20); g.font = `500 ${us | 0}px ${DISP}`; const uw = unit ? g.measureText(unit).width + 10 : 0;
  fitFont(g, value, 600, Math.min(r.h * 0.82, 92), DISP, r.w - uw - 4); g.fillStyle = color === P.acc ? P.butter : color; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(value, r.x, r.y + r.h / 2 + 2);
  if (unit) { const vw = g.measureText(value).width; g.font = `500 ${us | 0}px ${DISP}`; g.fillStyle = P.tan; g.fillText(unit, r.x + vw + 8, r.y + r.h * 0.62); }
}
// a scrolling column of readings, number-column style
function logw(g, r, lines, P, speed) {
  const fs = clamp(r.h / 6.2, 8, 14), lh = fs * 1.38, n = lines.length, off = (elapsed * (speed || 0.5)) % n, vis = Math.ceil(r.h / lh) + 1;
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
// ---------- density: button banks and number columns ----------
// The panels around the readable widgets: banks of numbered pill buttons and slowly ticking columns of numbers.
// They carry no information of their own; they make each screen read as a working console with more going on.
// Everything moves on its own clock: each pill has its own rate and phase, numbers tick at their own moments,
// columns scroll smoothly, and every screen has occasional bursts of activity, so nothing steps in time.
function hash1(n) { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }
// A step counter that advances now and then rather than on a shared beat: every key gets its own
// period (between minS and maxS) and phase, so neighbouring cells never change together.
function slowTick(key, minS, maxS) {
  const per = minS + (maxS - minS) * hash1(key * 1.7 + 0.3);
  return Math.floor((elapsed + hash1(key) * per) / per);
}
function pillBank(g, r, seed, P, cols) {
  const rr = mulberry(seed), cw = r.w / cols, ph = clamp(cw * 0.3, 12, 30), gap = Math.max(3, ph * 0.22), rows = Math.max(1, Math.floor((r.h + gap) / (ph + gap)));
  const pal2 = [P.acc, P.tan, P.butter, P.ice, P.tan, P.rose, P.plum, P.acc], n = rows * cols;
  // Mostly still, like a real panel: one pill is 'selected' and moves to another every 6-18 s,
  // one more toggles on or off now and then, and a few numbers update slowly.
  const sel = (hash1(seed * 5 + slowTick(seed * 3.1, 6, 18)) * n) | 0, tg = slowTick(seed * 7.3, 9, 25), tgk = (hash1(seed + tg * 3) * n) | 0;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const c = pal2[(rr() * pal2.length) | 0], off0 = rr() < 0.14, ph2 = rr() * 9, live = rr() < 0.25, x = r.x + i * cw, y = r.y + j * (ph + gap), w = cw - gap, k = j * cols + i;
    const lit = k === tgk && tg % 2 ? off0 : !off0, on = k === sel;
    hexTab(g, x, y, w, ph, i === 0, i === cols - 1 || cols === 1); g.fillStyle = on ? P.txt : lit ? c : P.line; g.fill();
    if (ph >= 13 && w > ph * 1.6) { const tk = live ? slowTick(seed * 13 + k, 7, 30) : 0, a2 = 10 + ((seed * 31 + k * 17 + tk * 7) % 89), b2 = 100 + ((seed * 7 + k * 53 + tk * 131) % 899); g.fillStyle = lit || on ? '#000' : P.dim; g.font = `600 ${ph * 0.5 | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(String(a2) + (w > ph * 3 ? '-' + String(b2) : ''), x + w - ph * 0.45, y + ph / 2 + 1); }
  }
}
// columns of numbers that scroll upward smoothly; a few cells change or flash on their own
function numGrid(g, r, seed, P) {
  const fs = clamp(r.h / 7.5, 9, 15), lh = fs * 1.32, cols = Math.max(2, Math.floor(r.w / (fs * 3.9))), rows = Math.max(1, Math.floor(r.h / lh)), cw = r.w / cols;
  const sp = hash1(seed) < 0.5 ? 0.12 + hash1(seed + 1) * 0.3 : 0, pos = elapsed * sp + hash1(seed + 3) * 100, base = Math.floor(pos), fr = pos - base;
  g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip();
  g.font = `500 ${fs | 0}px ${DISP}`; g.textBaseline = 'top';
  for (let j = 0; j <= rows; j++) {
    const row = base + j, y = r.y + (j - fr) * lh, hot = hash1(seed * 3 + row) > 0.86;
    for (let i = 0; i < cols; i++) {
      const cell = seed * 977 + row * 31 + i, tk = hash1(cell + 2) < 0.3 ? slowTick(cell, 4, 22) : 0, digits = 2 + ((hash1(cell + 7) * 4) | 0);
      const n = String(Math.floor(hash1(cell + tk * 13) * Math.pow(10, digits))), x = r.x + i * cw;
      g.fillStyle = hot ? P.butter : i === 0 ? P.acc : (i + row) % 5 === 2 ? P.ice : P.tan; g.textAlign = i === 0 ? 'left' : 'right';
      g.fillText(n, i === 0 ? x : x + cw - 4, y);
    }
  }
  g.restore();
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
      g.strokeStyle = f > 0.5 ? P.acc : f > 0.2 ? P.yel : P.red; g.globalAlpha = 0.8 + Math.sin(elapsed * 1.3 + i) * 0.15;
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
    // keys hold their state; roughly one in eight is 'live' and flips on its own slow timing
    const live = rate > 1.7, on = live ? slowTick(s.seed * 17 + j * cols + i, 5, 20) % 3 !== 0 : base > 0.22;
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
  while (x < W - p - bh * 0.8) { const w = bh * (0.8 + r() * 3.2), c = cols[(r() * cols.length) | 0], kk = r(), on = kk > 0.85 ? slowTick(s.seed * 23 + x, 6, 24) % 3 !== 0 : r() > 0.12; g.fillStyle = on ? c : P.line; g.fillRect(x, p, Math.min(w, W - p - bh * 0.8 - x), bh); x += w + bh * 0.25; }
  hexTab(g, W - p - bh * 0.6, p, bh * 0.6, bh, false, true); g.fillStyle = P.acc; g.fill();
}
// Deck 2: the lobby directory and the wardroom mess board
DRAW.deck2 = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, [a, b] = split(R, [1.4, 1], false, w * 0.04);
  table(g, sub(g, a, 'OFFICERS’ DECK', P.acc, P), [['CAPTAIN’S QUARTERS', 'FORWARD'], ['LIFT 1 LOBBY', 'YOU ARE HERE', P.acc], ['OFFICERS’ CORRIDOR', 'AFT'], ['FIRST OFFICER', 'SEALED', P.dim], ['SENIOR OFFICERS', 'SEALED', P.dim], ['OFFICERS’ WARDROOM', 'AFT END'], ['OBSERVATION LOUNGE', 'SEALED', P.dim]], P);
  lights(g, sub(g, b, 'DECK', P.ice, P), [['ATMOSPHERE', 'ok'], ['GRAVITY', 'ok'], ['LIGHTING', state.alert === 'red' ? 'alert' : 'ok'], ['FITTING-OUT', 'warn'], ['LIFT 1', typeof LIFT === 'undefined' || LIFT.phase === 'idle' ? 'ok' : 'act']], P);
};
// the first officer's desk: the duty roster and the departments' standing
DRAW.xo = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, [a, b] = split(R, [1.3, 1], false, w * 0.04), red = state.alert === 'red';
  table(g, sub(g, a, 'DUTY ROSTER', P.acc, P), [['ALPHA WATCH', '0800–1600'], ['BETA WATCH', '1600–0000'], ['GAMMA WATCH', '0000–0800'], ['NEXT DRILL', red ? 'NOW' : 'DAY 3', red ? P.red : P.txt]], P);
  lights(g, sub(g, b, 'DEPARTMENTS', P.ice, P), [['ENGINEERING', 'ok'], ['TACTICAL', red ? 'alert' : 'ok'], ['SCIENCE', 'ok'], ['MEDICAL', 'ok'], ['OPERATIONS', 'act']], P);
};
// a senior officer's desk: messages waiting and the officer's watches
DRAW.cabin = function (g, x, y, w, h, P, s) {
  const R = { x, y, w, h }, [a, b] = split(R, [1.3, 1], false, w * 0.04), n = s && s.station === 'so2desk' ? 1 : 0;
  table(g, sub(g, a, 'MESSAGES', P.acc, P), [['FROM HOME', n ? '1 NEW' : '2 NEW'], ['DEPT REPORT', 'DUE 1700'], ['WARDROOM', 'DINNER 1830'], ['TRAINING', n ? 'SIM BAY 4' : 'DAMAGE DRILL']], P);
  lights(g, sub(g, b, 'MY WATCHES', P.ice, P), [['ALPHA', n ? 'off' : 'act'], ['BETA', n ? 'act' : 'off'], ['GAMMA', 'off'], ['ON CALL', state.alert === 'green' ? 'ok' : 'alert']], P);
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
// ---------- master systems display (aft bridge wall) ----------
// A cutaway of the Defiance: a long swept primary hull flowing into the engineering section, a raised arch over the
// back carrying the dorsal turret, and slim nacelles slung low and aft on swept spars. Original design, in the spirit of
// the sleek late-century cruisers. Left panel: side cutaway with every deck and compartment, callouts and live damage.
// Right panel: plan view with live shield arcs and the warp field, deck index and readouts.
// The hull and compartments are drawn once into a cached layer per alert/damage state; live parts are drawn on top.
const MSD_ROOMS = [ // [deck, from m, to m, kind] from the deck plan (docs/master-systems-display.html)
  [1, 49, 63, 'w'], [1, 63, 66, 'w'], [1, 66, 73, 'w'], [1, 73, 79, 'w'],
  [2, 32, 44, 's'], [2, 44, 60, 'w'], [2, 60, 66, 'w'], [2, 66, 80, 'l'], [2, 80, 96, 'w'], [2, 96, 113, 'x'], [2, 113, 136, 'l'], [2, 136, 150, 'l'],
  [3, 14, 28, 's'], [3, 28, 46, 'l'], [3, 46, 58, 'l'], [3, 58, 66, 's'], [3, 66, 96, 'l'], [3, 96, 113, 'x'], [3, 113, 127, 's'], [3, 127, 160, 'l'],
  [4, 6, 22, 's'], [4, 22, 44, 'l'], [4, 44, 70, 'l'], [4, 70, 82, 'l'], [4, 82, 96, 'l'], [4, 96, 116, 's'], [4, 116, 124, 's'], [4, 124, 150, 's'], [4, 150, 182, 's'],
  [5, 2, 18, 'x'], [5, 18, 32, 'x'], [5, 32, 46, 'x'], [5, 46, 62, 's'], [5, 62, 78, 'l'], [5, 78, 100, 'l'], [5, 100, 116, 's'], [5, 116, 124, 's'], [5, 124, 168, 'e'], [5, 168, 190, 's'],
  [6, 4, 18, 's'], [6, 18, 30, 's'], [6, 30, 50, 'x'], [6, 50, 70, 's'], [6, 70, 100, 'l'], [6, 100, 116, 's'], [6, 116, 124, 's'], [6, 124, 160, 'e'], [6, 160, 194, 's'],
  [7, 60, 100, 'l'], [7, 100, 116, 'x'], [7, 116, 124, 's'], [7, 124, 166, 'e'], [7, 166, 198, 'e'],
  [8, 70, 104, 's'], [8, 104, 116, 'x'], [8, 116, 124, 's'], [8, 124, 140, 'e'], [8, 140, 152, 'e'], [8, 152, 176, 'e'], [8, 176, 198, 's'],
  [9, 110, 116, 's'], [9, 116, 124, 's'], [9, 124, 140, 's'], [9, 140, 152, 'e'], [9, 152, 199, 's'],
];
function msdPaths(X, Y) {
  const hull = new Path2D(); // the primary hull and engineering section as one long swept body
  hull.moveTo(X(0), Y(17)); hull.quadraticCurveTo(X(8), Y(9.5), X(30), Y(6.5)); hull.bezierCurveTo(X(60), Y(3.8), X(120), Y(3.2), X(150), Y(4.2));
  hull.bezierCurveTo(X(176), Y(5.2), X(190), Y(9), X(197), Y(13)); hull.lineTo(X(199.5), Y(16)); hull.lineTo(X(199.5), Y(27)); hull.quadraticCurveTo(X(198), Y(31), X(188), Y(32));
  hull.bezierCurveTo(X(165), Y(34), X(135), Y(34.5), X(110), Y(32)); hull.bezierCurveTo(X(80), Y(29.5), X(45), Y(27), X(22), Y(23.5)); hull.quadraticCurveTo(X(5), Y(21), X(0), Y(17)); hull.closePath();
  const bridge = new Path2D(); bridge.moveTo(X(44), Y(5.2)); bridge.bezierCurveTo(X(48), Y(1.4), X(51), Y(0.4), X(56), Y(0.2)); bridge.lineTo(X(72), Y(0.1)); bridge.bezierCurveTo(X(78), Y(0.4), X(81), Y(2.6), X(84), Y(4.8)); bridge.closePath();
  const arch = new Path2D(); // raised arch over the back, carrying the turret: a hole beneath shows open space
  arch.moveTo(X(88), Y(4.4)); arch.bezierCurveTo(X(92), Y(-4.5), X(100), Y(-6.4), X(110), Y(-6.6)); arch.bezierCurveTo(X(121), Y(-6.4), X(128), Y(-4.5), X(133), Y(4.6));
  arch.lineTo(X(127), Y(4.4)); arch.bezierCurveTo(X(123), Y(-1.6), X(117), Y(-2.8), X(110), Y(-2.9)); arch.bezierCurveTo(X(103), Y(-2.8), X(97), Y(-1.6), X(94), Y(4.3)); arch.closePath();
  const turret = new Path2D(); turret.moveTo(X(102), Y(-6.2)); turret.bezierCurveTo(X(103), Y(-10.2), X(117), Y(-10.2), X(118), Y(-6.2)); turret.closePath();
  const spar = new Path2D(); spar.moveTo(X(136), Y(31)); spar.lineTo(X(146), Y(31.5)); spar.lineTo(X(160), Y(38)); spar.lineTo(X(150), Y(38)); spar.closePath();
  const nac = new Path2D(); nac.moveTo(X(126), Y(40)); nac.bezierCurveTo(X(126), Y(37.4), X(129), Y(37), X(134), Y(37)); nac.lineTo(X(194), Y(37)); nac.quadraticCurveTo(X(200), Y(37.2), X(200), Y(40)); nac.quadraticCurveTo(X(200), Y(42.8), X(194), Y(43)); nac.lineTo(X(134), Y(43)); nac.bezierCurveTo(X(129), Y(43), X(126), Y(42.6), X(126), Y(40)); nac.closePath();
  return { hull, bridge, arch, turret, spar, nac };
}
function msdPlan(X, Z) { // top view, bow to the left; Z is across the beam
  const hull = new Path2D(); hull.moveTo(X(0), Z(0)); hull.bezierCurveTo(X(6), Z(-26), X(40), Z(-50), X(78), Z(-46)); hull.bezierCurveTo(X(112), Z(-42), X(130), Z(-30), X(140), Z(-20));
  hull.lineTo(X(196), Z(-14)); hull.lineTo(X(199), Z(-8)); hull.lineTo(X(199), Z(8)); hull.lineTo(X(196), Z(14)); hull.lineTo(X(140), Z(20));
  hull.bezierCurveTo(X(130), Z(30), X(112), Z(42), X(78), Z(46)); hull.bezierCurveTo(X(40), Z(50), X(6), Z(26), X(0), Z(0)); hull.closePath();
  const nacs = [-1, 1].map((sd) => { const p = new Path2D(); p.moveTo(X(126), Z(sd * 70)); p.quadraticCurveTo(X(127), Z(sd * 66), X(134), Z(sd * 66)); p.lineTo(X(196), Z(sd * 66.5)); p.quadraticCurveTo(X(200), Z(sd * 68), X(200), Z(sd * 70)); p.quadraticCurveTo(X(200), Z(sd * 72), X(196), Z(sd * 73.5)); p.lineTo(X(134), Z(sd * 74)); p.quadraticCurveTo(X(127), Z(sd * 74), X(126), Z(sd * 70)); p.closePath(); return p; });
  const spars = [-1, 1].map((sd) => { const p = new Path2D(); p.moveTo(X(132), Z(sd * 20)); p.lineTo(X(150), Z(sd * 18)); p.lineTo(X(172), Z(sd * 67)); p.lineTo(X(156), Z(sd * 67)); p.closePath(); return p; });
  return { hull, nacs, spars };
}
// draw a set of shapes with a single clean outline round their union: thick outline strokes first, fills on top
function msdUnion(g, paths, fill, line, lw) { g.lineJoin = 'round'; g.strokeStyle = line; g.lineWidth = lw * 2; paths.forEach((p) => g.stroke(p)); g.fillStyle = fill; paths.forEach((p) => g.fill(p)); }
// Layout (2048 x 820): left panel = plan view with shields and warp field, warp field geometry inset below;
// right panel = the side cutaway with stacked callout lists at its four corners, title top right.
const MSD_LISTS = {
  tl: [['SENSOR PALLET', 38, 6], ['FORWARD SHIELD GENERATOR', 20, 9], ['CAPTAIN’S QUARTERS', 52, 6], ['BRIDGE', 64, 2], ['LIFT 1', 64.5, 12], ['WARDROOM', 88, 6], ['CREW QUARTERS', 84, 16]],
  tr: [['TURRET CAPACITORS', 104, 4.5], ['COMPUTER CORE', 106, 14], ['DORSAL TURRET', 112, -8], ['SENIOR OFFICERS’ QUARTERS', 124, 6], ['SHIELD GENERATORS', 136, 13], ['OBSERVATION LOUNGE', 143, 6], ['LIFE SUPPORT', 166, 13], ['IMPULSE ENGINES', 197, 18]],
  bl: [['DEFLECTOR', 9, 20.5], ['TORPEDO BAYS', 8, 16], ['TORPEDO MAGAZINE', 25, 16], ['SICKBAY', 37, 9.5], ['ARMORY', 40, 16], ['CARGO BAY 1', 54, 20], ['MESS HALL', 57, 13]],
  br: [['CIC', 108, 25], ['VENTRAL ARRAY', 110, 29], ['LIFT 2', 120.5, 34], ['WARP CORE', 146, 27], ['MAIN ENGINEERING', 160, 23], ['NACELLE FIELD COILS', 172, 40], ['SHUTTLE MAINTENANCE', 186, 27], ['SHUTTLEBAY', 190, 30.5]],
};
const MSD = { key: '', base: null };
function msdGeom(W, H) {
  const u = W / 2048;
  const L = { x: 16 * u, y: 16 * u, w: 620 * u, h: H - 32 * u }, R = { x: 656 * u, y: 16 * u, w: W - 672 * u, h: H - 32 * u };
  const S = 5.3 * u, X = (m) => R.x + 140 * u + m * S, Y = (m) => R.y + 300 * u + m * S;
  const PS = 2.4 * u, PX = (m) => L.x + 110 * u + m * PS, PZ = (m) => L.y + 262 * u + m * PS;
  return { u, L, R, S, X, Y, PS, PX, PZ, colW: 60 * u, barH: 20 * u };
}
function msdBase(W, H, P) {
  const c = cnv(W, H), g = c.getContext('2d'), G = msdGeom(W, H), { u, L, R, S, X, Y, PS, PX, PZ, colW, barH } = G;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  // ---- frames ----
  elbow(g, L.x, L.y, colW, barH, 300 * u, 60 * u, true, P.butter); elbow(g, L.x, L.y + L.h, colW, barH, 340 * u, 60 * u, false, P.acc);
  [[310, 150, P.acc], [466, 154, P.tan]].forEach(([x, w, cc]) => { g.fillStyle = cc; g.fillRect(L.x + x * u, L.y, w * u, barH); });
  [[350, 110, P.ice], [466, 154, P.butter]].forEach(([x, w, cc]) => { g.fillStyle = cc; g.fillRect(L.x + x * u, L.y + L.h - barH, w * u, barH); });
  { const rr = mulberry(808), top = L.y + barH + 66 * u, bot = L.y + L.h - barH - 66 * u, n = 8, kh = (bot - top - (n - 1) * 5 * u) / n;
    for (let i = 0; i < n; i++) { g.fillStyle = [P.ice, P.tan, P.butter, P.rose, P.plum, P.acc][(rr() * 6) | 0]; g.fillRect(L.x, top + i * (kh + 5 * u), colW, kh); g.fillStyle = '#000'; g.font = `600 ${12 * u | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText(String(10 + i * 7) + '-' + String(1000 + ((i * 3779) % 8999)), L.x + colW - 4 * u, top + i * (kh + 5 * u) + kh - 3 * u); } }
  // the divider between the panels: a column of blocks, like a spine
  { const x = R.x - 14 * u, top = R.y + 70 * u; [[90, P.plum], [40, P.ice], [210, P.plum], [60, P.butter], [150, P.plum], [80, P.acc]].reduce((y, [h, cc]) => { g.fillStyle = cc; g.fillRect(x, y, 24 * u, h * u); return y + h * u + 5 * u; }, top); }
  g.save(); g.translate(R.x + R.w, 0); g.scale(-1, 1);
  elbow(g, 0, R.y, colW, barH, 560 * u, 60 * u, true, P.butter); elbow(g, 0, R.y + R.h, colW, barH, 420 * u, 60 * u, false, P.butter);
  { const rr = mulberry(909), top = R.y + barH + 66 * u, bot = R.y + R.h - barH - 66 * u, n = 7, kh = (bot - top - (n - 1) * 5 * u) / n;
    for (let i = 0; i < n; i++) { g.fillStyle = [P.tan, P.ice, P.plum, P.acc, P.butter][(rr() * 5) | 0]; g.fillRect(0, top + i * (kh + 5 * u), colW, kh); } }
  g.restore();
  g.fillStyle = P.butter; g.fillRect(R.x + 30 * u, R.y, R.w - 620 * u, barH); g.fillStyle = P.plum; g.fillRect(R.x + 30 * u, R.y + R.h - barH, 200 * u, barH); g.fillStyle = P.butter; g.fillRect(R.x + 240 * u, R.y + R.h - barH, R.w - 700 * u, barH);
  // ---- side cutaway ----
  const p = msdPaths(X, Y);
  msdUnion(g, [p.spar, p.nac, p.hull, p.bridge, p.arch, p.turret], '#120d12', P.txt, 2.6 * u);
  const clipDraw = (path, fn) => { g.save(); g.clip(path); fn(); g.restore(); };
  const KC = { w: [P.acc, P.butter], l: [P.ice, P.plum], s: [P.plum, P.ice], x: [P.rose, P.plum], e: [P.butter, P.acc] };
  const rooms = () => {
    const rr = mulberry(4242);
    g.fillStyle = '#1b141b'; g.fillRect(X(-2), Y(-12), 206 * S, 58 * S);
    MSD_ROOMS.forEach(([d, a, b, k]) => {
      const y0 = Y((d - 1) * 3.5) + 1.6 * u, y1 = Y(d * 3.5) - 1, cells = Math.max(1, Math.round((b - a) * S / (13 * u))), cwid = (b - a) * S / cells;
      for (let i = 0; i < cells; i++) {
        const x0 = X(a) + i * cwid + 1, w = cwid - 1.6 * u, [c1, c2] = KC[k];
        g.fillStyle = rr() < 0.72 ? c1 : c2; g.globalAlpha = k === 'w' ? 0.95 : 0.62 + rr() * 0.3; g.fillRect(x0, y0, w, y1 - y0); g.globalAlpha = 1;
        if (rr() < 0.55) { g.fillStyle = rr() < 0.5 ? 'rgba(0,0,0,0.45)' : 'rgba(255,240,220,0.35)'; g.fillRect(x0 + w * rr() * 0.5, y0 + (y1 - y0) * (0.35 + rr() * 0.3), w * (0.25 + rr() * 0.35), (y1 - y0) * 0.22); }
      }
    });
    for (let d = 0; d <= 12; d++) { g.fillStyle = '#000'; g.fillRect(X(-2), Y(d * 3.5) - 1.2 * u, 206 * S, 2 * u); }
    for (let m = 10; m < 200; m += 10) { g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(X(m), Y(-12), 1.6 * u, 58 * S); }
    // structures that run through several decks: lifts, the computer core, the EPS trunk, the torpedo tubes
    g.fillStyle = P.txt; g.fillRect(X(64), Y(0.4), 2.2 * S, Y(21) - Y(0.4)); g.fillRect(X(119.5), Y(3.5), 2.2 * S, Y(42) - Y(3.5));
    for (let d = 0; d < 6; d++) { g.fillStyle = '#000'; g.fillRect(X(64), Y(d * 3.5 + 1.7), 2.2 * S, 1.2 * u); }
    g.fillStyle = P.ice; g.fillRect(X(97), Y(7.2), X(115) - X(97), Y(17.4) - Y(7.2)); g.fillStyle = '#000'; for (let i = 0; i < 6; i++) g.fillRect(X(97), Y(7.6 + i * 1.7), X(115) - X(97), 0.5 * S);
    g.fillStyle = P.butter; g.fillRect(X(20), Y(19.2), X(143) - X(20), 0.55 * S); g.fillRect(X(110), Y(-3), 0.55 * S, Y(19.2) - Y(-3));
    g.fillStyle = P.rose; [16.2, 17.6].forEach((yy) => g.fillRect(X(1), Y(yy), X(18) - X(1), 0.7 * S));
    // shuttles parked in the bay
    g.fillStyle = P.butter; [158, 169, 180].forEach((m) => { rrect(g, X(m), Y(29), 8 * S, 2.2 * S, 1.4 * u); g.fill(); });
  };
  clipDraw(p.hull, rooms); clipDraw(p.bridge, rooms);
  clipDraw(p.arch, () => { g.fillStyle = P.plum; g.fillRect(X(85), Y(-8), 52 * S, 14 * S); g.fillStyle = P.ice; for (let i = 0; i < 12; i++) g.fillRect(X(90 + i * 3.6), Y(-7), 1.8 * S, 12 * S); g.fillStyle = P.butter; g.fillRect(X(85), Y(-3.4), 52 * S, 0.5 * S); });
  clipDraw(p.turret, () => { g.fillStyle = P.rose; g.fillRect(X(100), Y(-11), 20 * S, 5 * S); g.fillStyle = P.butter; g.fillRect(X(103), Y(-8.8), 14 * S, 0.8 * S); g.fillStyle = P.txt; g.fillRect(X(116), Y(-8.2), 4 * S, 0.5 * S); });
  clipDraw(p.spar, () => { g.fillStyle = P.plum; g.fillRect(X(130), Y(30), 32 * S, 9 * S); g.fillStyle = P.butter; g.fillRect(X(138), Y(33.6), 18 * S, 0.5 * S); });
  clipDraw(p.nac, () => { g.fillStyle = P.ice; g.fillRect(X(124), Y(36), 78 * S, 8 * S); g.fillStyle = P.plum; g.fillRect(X(124), Y(41.2), 78 * S, 3 * S); g.fillStyle = P.butter; for (let i = 0; i < 16; i++) g.fillRect(X(137 + i * 3.7), Y(37.6), 2 * S, 2.6 * S); g.fillStyle = P.rose; g.fillRect(X(124), Y(36), 8 * S, 8 * S); g.fillStyle = P.txt; g.fillRect(X(134), Y(40.6), 62 * S, 0.4 * S); });
  g.fillStyle = P.butter; for (let m = 26; m < 172; m += 3.2) { const yy = m < 60 ? 6.6 - (m - 26) * 0.07 : 4.3 + Math.max(0, m - 150) * 0.12; g.fillRect(X(m), Y(yy + 0.9), 0.7 * S, 0.45 * S); }
  g.fillStyle = P.red; g.fillRect(X(196.6), Y(16.5), 2.6 * S, Y(22) - Y(16.5)); g.fillStyle = P.butter; g.beginPath(); g.ellipse(X(9), Y(20.4), 4.5 * S, 1.6 * S, -0.25, 0, 7); g.fill();
  // ---- stacked callout lists at the cutaway's four corners ----
  const fs = 14 * u, lh = 19 * u; g.font = `500 ${fs | 0}px ${DISP}`; g.textBaseline = 'middle';
  const list = (items, x0, y0, side, vert, order) => {
    const it = items.slice().sort((a, b) => order * (a[1] - b[1]));
    it.forEach(([t, m, ym], i) => {
      const ly = y0 + i * lh, px = X(m), py = Y(ym), tw = g.measureText(t).width, ex = side < 0 ? x0 + tw + 12 * u : x0 - tw - 12 * u;
      g.strokeStyle = P.ice; g.lineWidth = 1.8 * u; g.beginPath(); g.moveTo(ex, ly); g.lineTo(px, ly); g.lineTo(px, py); g.stroke();
      g.fillStyle = P.butter; g.beginPath(); g.arc(px, py, 3 * u, 0, 7); g.fill();
      labels.push([t, x0, ly, side, tw]);
    });
  };
  const labels = []; // leaders first, then every label on a black knockout so no line runs through text
  list(MSD_LISTS.tl, R.x + 52 * u, R.y + 50 * u, -1, 1, -1);
  list(MSD_LISTS.tr, R.x + R.w - colW - 22 * u, R.y + 112 * u, 1, 1, 1);
  list(MSD_LISTS.bl, R.x + 52 * u, R.y + 560 * u, -1, -1, 1);
  list(MSD_LISTS.br, R.x + R.w - colW - 22 * u, R.y + 560 * u, 1, -1, -1);
  labels.forEach(([t, x0, ly, side, tw]) => {
    const bx = side < 0 ? x0 - 12 * u : x0 - tw - 8 * u;
    g.fillStyle = '#000'; g.fillRect(bx, ly - lh * 0.46, tw + 22 * u, lh * 0.92);
    g.fillStyle = P.butter; g.fillRect(side < 0 ? x0 - 10 * u : x0 + 3 * u, ly - 3.5 * u, 7 * u, 7 * u);
    g.fillStyle = P.tan; g.textAlign = side < 0 ? 'left' : 'right'; g.fillText(t, side < 0 ? x0 + 2 * u : x0 - 3 * u, ly + 1);
  });
  g.textAlign = 'right'; g.textBaseline = 'alphabetic'; g.fillStyle = P.ice; g.font = `600 ${54 * u | 0}px ${DISP}`; g.fillText('USS DEFIANCE · EV-0408', R.x + R.w - colW - 22 * u, R.y + barH + 56 * u);
  g.fillStyle = P.tan; g.font = `500 ${17 * u | 0}px ${DISP}`; g.fillText('BASTION CLASS · HEAVY ESCORT · 12 DECKS · CREW 140', R.x + R.w - colW - 22 * u, R.y + barH + 82 * u);
  hexTab(g, R.x + R.w - colW - 300 * u, R.y + R.h - barH - 34 * u, 280 * u, 24 * u, true, true); g.fillStyle = P.ice; g.fill(); g.fillStyle = '#000'; g.font = `600 ${16 * u | 0}px ${DISP}`; g.textAlign = 'center'; g.fillText('INTERIOR SYSTEMS OVERVIEW', R.x + R.w - colW - 160 * u, R.y + R.h - barH - 16 * u);
  // ---- left panel: plan view, and the warp field geometry inset ----
  const pl = msdPlan(PX, PZ);
  g.strokeStyle = P.plum; g.lineWidth = 1.8 * u; [1, 1.25, 1.5].forEach((k) => [-1, 1].forEach((sd) => { g.beginPath(); g.ellipse(PX(163), PZ(sd * 70), 42 * k * PS, 13 * k * PS, 0, 0, 7); g.stroke(); }));
  msdUnion(g, [...pl.spars, ...pl.nacs, pl.hull], '#120d12', P.txt, 2.2 * u);
  g.save(); g.clip(pl.hull); g.fillStyle = P.plum; g.fillRect(PX(0), PZ(-52), 200 * PS, 104 * PS);
  { const rr = mulberry(77); for (let i = 0; i < 140; i++) { const a = rr() * 192, z = (rr() - 0.5) * 92; g.fillStyle = [P.ice, P.tan, P.plum, P.rose, P.ice][(rr() * 5) | 0]; g.fillRect(PX(a), PZ(z), (2 + rr() * 8) * PS, (1.5 + rr() * 5) * PS); } }
  g.fillStyle = P.acc; g.beginPath(); g.ellipse(PX(64), PZ(0), 13 * PS, 7 * PS, 0, 0, 7); g.fill(); g.restore();
  pl.nacs.forEach((n) => { g.save(); g.clip(n); g.fillStyle = P.ice; g.fillRect(PX(120), PZ(-80), 85 * PS, 160 * PS); g.fillStyle = P.butter; for (let i = 0; i < 12; i++) g.fillRect(PX(140 + i * 4.6), PZ(-80), 2.4 * PS, 160 * PS); g.restore(); });
  pl.spars.forEach((s2) => { g.save(); g.clip(s2); g.fillStyle = P.plum; g.fillRect(PX(120), PZ(-80), 80 * PS, 160 * PS); g.restore(); });
  const iy = L.y + 486 * u;
  g.fillStyle = P.acc; g.font = `600 ${22 * u | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText('WARP FIELD GEOMETRY', L.x + L.w - 10 * u, iy);
  hexTab(g, L.x + colW + 24 * u, iy - 10 * u, 150 * u, 20 * u, true, false); g.fillStyle = P.tan; g.fill(); g.fillStyle = P.ice; g.fillRect(L.x + colW + 180 * u, iy - 10 * u, 90 * u, 20 * u);
  // side view of a nacelle with its field lobes
  const fx = L.x + colW + 40 * u, fy = iy + 95 * u;
  g.strokeStyle = P.plum; g.lineWidth = 1.8 * u; [1, 0.78, 0.56, 0.36].forEach((k) => { g.beginPath(); g.ellipse(fx + 140 * u, fy, 140 * u * (0.6 + k * 0.4), 60 * u * k, 0, 0, 7); g.stroke(); });
  hexTab(g, fx + 30 * u, fy - 8 * u, 220 * u, 16 * u, true, true); g.fillStyle = P.ice; g.fill(); g.fillStyle = P.butter; for (let i = 0; i < 12; i++) g.fillRect(fx + 70 * u + i * 13 * u, fy - 6 * u, 6 * u, 12 * u);
  return c;
}
function drawMSD(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), G = msdGeom(W, H), { u, L, R, S, X, Y, PS, PX, PZ, colW, barH } = G;
  const key = state.alert + '|' + ZONES.map((z) => zoneStatus(z.id)).join('');
  if (MSD.key !== key || !MSD.base || MSD.base.width !== W) { MSD.key = key; MSD.base = msdBase(W, H, P); }
  g.drawImage(MSD.base, 0, 0);
  const t = elapsed, warp = smooth(30, 300, cur.speed);
  // warp core pulses; plasma rises through it
  const k = 0.55 + 0.45 * Math.sin(t * (2 + warp * 7)); g.fillStyle = P.butter; g.globalAlpha = 0.5 + k * 0.5; g.fillRect(X(143), Y(17.6), 6 * S, Y(38) - Y(17.6)); g.globalAlpha = 1;
  g.fillStyle = P.txt; for (let i = 0; i < 5; i++) { const yy = 17.6 + ((t * (1.2 + warp * 5) + i * 4.1) % 20.4); g.fillRect(X(143), Y(yy), 6 * S, 0.5 * S); }
  // power running forward along the EPS trunk and up into the turret
  g.fillStyle = P.txt; for (let i = 0; i < 9; i++) { const f = ((t * 0.18 + i / 9) % 1); g.fillRect(X(143 - f * 123), Y(19.1), 2.2 * S, 0.75 * S); }
  for (let i = 0; i < 3; i++) { const f = ((t * 0.3 + i / 3) % 1); g.fillRect(X(109.8), Y(19.2 - f * 22), 0.75 * S, 1.4 * S); }
  // nacelle coils fire in sequence
  for (let i = 0; i < 16; i++) { if (((t * (4 + warp * 10) - i) % 16 + 16) % 16 < 2) { g.fillStyle = P.txt; g.fillRect(X(137 + i * 3.7), Y(37.6), 2 * S, 2.6 * S); } }
  // damage tints, and a scan bar crossing the cutaway
  const ZR = { prow: [0, 9, 26, 24], dorsal: [86, -11, 134, 5], ventral: [50, 25, 150, 35], engines: [124, 13, 200, 33] };
  Object.entries(ZR).forEach(([id, [a, y0, b, y1]]) => { const st = zoneStatus(id); if (st === 'ok') return; g.fillStyle = st === 'warn' ? P.yel : P.red; g.globalAlpha = 0.28 + 0.2 * Math.sin(t * 5); g.fillRect(X(a), Y(y0), X(b) - X(a), Y(y1) - Y(y0)); g.globalAlpha = 1; });
  ['portNac', 'stbdNac'].forEach((id, i) => { const st = zoneStatus(id); if (st === 'ok') return; g.fillStyle = st === 'warn' ? P.yel : P.red; g.globalAlpha = 0.35; g.fillRect(X(126), Y(36.5 + i * 3.3), X(200) - X(126), 3 * S); g.globalAlpha = 1; });
  const sx = X(((t * 14) % 220) - 10); g.fillStyle = P.butter; g.globalAlpha = 0.3; g.fillRect(sx, Y(-11), 4 * u, Y(44) - Y(-11)); g.globalAlpha = 1;
  // plan view: live shield arcs
  const up = sim.shields.up > 0.01;
  [['fwd', Math.PI * 0.75, Math.PI * 1.25], ['port', Math.PI * 1.25, Math.PI * 1.75], ['aft', -Math.PI * 0.25, Math.PI * 0.25], ['stbd', Math.PI * 0.25, Math.PI * 0.75]].forEach(([a, a0, a1]) => { const v = shieldNow(a), f = v / SIM.shield.max; g.strokeStyle = !up || v < 0.5 ? P.line : f > 0.5 ? P.ice : f > 0.2 ? P.yel : P.red; g.lineWidth = (sim.shields.reinforce === a ? 11 : 6) * u; g.beginPath(); g.ellipse(PX(100), PZ(0), 106 * PS, 86 * PS, 0, a0 + 0.07, a1 - 0.07); g.stroke(); });
  ['port', 'stbd'].forEach((id, i) => { const st = zoneStatus(id); if (st === 'ok') return; g.fillStyle = st === 'warn' ? P.yel : P.red; g.globalAlpha = 0.4; g.fillRect(PX(40), PZ(i ? 8 : -46), 100 * PS, 38 * PS); g.globalAlpha = 1; });
  // warp field geometry: readouts and moving numbers
  const iy = L.y + 486 * u, fx = L.x + colW + 40 * u;
  numGrid(g, { x: L.x + colW + 330 * u, y: iy + 24 * u, w: L.w - colW - 340 * u, h: 150 * u }, 61, P);
  table(g, { x: L.x + colW + 24 * u, y: iy + 168 * u, w: L.w - colW - 34 * u, h: 96 * u }, [['FIELD', warp > 0.5 ? 'WARP 6 · STABLE' : 'IDLE', warp > 0.5 ? P.acc : P.tan], ['COILS P/S', Math.round(sim.zones.portNac) + ' / ' + Math.round(sim.zones.stbdNac) + '%'], ['REACTOR', Math.round(reactorOut()) + ' U · ' + ALERTS[state.alert].short]], P);
  { const ph = t * (1 + warp * 4); g.fillStyle = P.butter; g.globalAlpha = 0.6; for (let i = 0; i < 3; i++) { const kk = ((ph * 0.3 + i / 3) % 1); g.fillRect(fx + 140 * u - 140 * u * kk, iy + 95 * u - 2 * u, 4 * u, 4 * u); g.fillRect(fx + 140 * u + 140 * u * kk, iy + 95 * u - 2 * u, 4 * u, 4 * u); } g.globalAlpha = 1; }
  // number table in the bottom middle, like a legend
  numGrid(g, { x: R.x + 462 * u, y: R.y + 616 * u, w: 236 * u, h: 140 * u }, 83, P);
  pillBank(g, { x: L.x + colW + 24 * u, y: L.y + 30 * u, w: 230 * u, h: 22 * u }, 71, P, 5);
}

// ---------- the situation table (aft of the command dais), read from the forward side ----------
// Live sector chart, ship plan with power flowing through it, shield arcs, power, damage, contacts and a lot of chrome.
function drawTable(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), u = W / 2048, t = elapsed;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  // frame: elbows in all four corners, segmented bars along top and bottom
  const cw = 70 * u, bh = 22 * u, m = 14 * u;
  elbow(g, m, m, cw, bh, 640 * u, 60 * u, true, P.acc); elbow(g, m, H - m, cw, bh, 520 * u, 60 * u, false, P.tan);
  g.save(); g.translate(W, 0); g.scale(-1, 1); elbow(g, m, m, cw, bh, 380 * u, 60 * u, true, P.ice); elbow(g, m, H - m, cw, bh, 460 * u, 60 * u, false, P.acc); g.restore();
  const segs = (y, x0, x1, seed) => { const rr = mulberry(seed); let x = x0; while (x < x1 - 10 * u) { const w = Math.min(x1 - x, (40 + rr() * 150) * u), c = [P.tan, P.butter, P.plum, P.ice, P.acc][(rr() * 5) | 0]; g.fillStyle = c; g.fillRect(x, y, w, bh); if (w > 80 * u) { g.fillStyle = '#000'; g.font = `600 ${bh * 0.8 | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(String(100 + ((x * 7) | 0) % 899), x + w - 5 * u, y + bh / 2 + 1); } x += w + 6 * u; } };
  segs(m, 1380 * u, W - 400 * u, 5); segs(H - m - bh, 545 * u, W - 480 * u, 9);
  g.fillStyle = P.acc; g.font = `600 ${40 * u | 0}px ${DISP}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('SITUATION TABLE · USS DEFIANCE', 670 * u, 6 * u);
  // side columns of numbered blocks
  [[m, 9, 1], [W - m - cw, 8, 2]].forEach(([x, n, sd]) => { const rr = mulberry(sd * 77), top = m + bh + 70 * u, bot = H - m - bh - 70 * u, kh = (bot - top - (n - 1) * 6 * u) / n; for (let i = 0; i < n; i++) { const on = Math.sin(t * (0.4 + rr()) + i * 1.7 + sd) > -0.8; g.fillStyle = on ? [P.ice, P.tan, P.butter, P.plum, P.rose][(rr() * 5) | 0] : P.line; g.fillRect(x, top + i * (kh + 6 * u), cw, kh); g.fillStyle = '#000'; g.font = `600 ${14 * u | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText(String(10 + i * 9 + sd) + '-' + String(1000 + ((i * 2971 + sd * 13) % 8999)), x + cw - 5 * u, top + i * (kh + 6 * u) + kh - 3 * u); } });
  const X0 = 110 * u, X1 = W - 110 * u, Y0 = 70 * u, Y1 = H - 66 * u;
  // ---- left column: sector chart, course, button bank ----
  const lc = { x: X0, y: Y0, w: 440 * u, h: Y1 - Y0 };
  const sys = SYSTEMS[state.holo], sc = sub(g, { x: lc.x, y: lc.y, w: lc.w, h: 390 * u }, 'SECTOR · ' + sys.star.toUpperCase(), P.acc, P);
  { const cx = sc.x + sc.w / 2, cy = sc.y + sc.h / 2, R = Math.min(sc.w, sc.h) / 2 * 0.96;
    for (let k = 0; k < sys.planets; k++) { const rad = R * (0.24 + k * 0.72 / sys.planets); g.strokeStyle = k === sys.featured ? P.plum : P.line; g.lineWidth = (k === sys.featured ? 7 : 4) * u; g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.stroke(); const a = t * 0.5 / (k + 1.3) + k * 1.9 + state.holo; g.fillStyle = k === sys.featured ? P.butter : P.ice; const ps = (k === sys.featured ? 12 : 8) * u; rrect(g, cx + Math.cos(a) * rad - ps, cy + Math.sin(a) * rad - ps, ps * 2, ps * 2, ps * 0.4); g.fill(); if (k === sys.featured) { g.fillStyle = P.txt; g.font = `500 ${15 * u | 0}px ${DISP}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(sys.planet.toUpperCase(), cx + Math.cos(a) * rad + 16 * u, cy + Math.sin(a) * rad); } }
    g.fillStyle = P.butter; g.beginPath(); g.arc(cx, cy, 16 * u * (1 + 0.06 * Math.sin(t * 3)), 0, 7); g.fill(); g.fillStyle = P.acc; g.beginPath(); g.arc(cx, cy, 9 * u, 0, 7); g.fill();
    if (state.holoOn) { const sw = t * 0.7; g.fillStyle = P.ice; g.globalAlpha = 0.18; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, sw - 0.35, sw); g.closePath(); g.fill(); g.globalAlpha = 1; }
    if (state.holo === state.cur) { const a = t * 0.12 + 1, rad = R * (0.24 + sys.featured * 0.72 / sys.planets) + 22 * u; g.fillStyle = P.acc; g.save(); g.translate(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); g.rotate(a + Math.PI / 2); g.beginPath(); g.moveTo(0, -11 * u); g.lineTo(8 * u, 9 * u); g.lineTo(-8 * u, 9 * u); g.closePath(); g.fill(); g.restore(); }
    g.fillStyle = P.tan; g.font = `500 ${14 * u | 0}px ${DISP}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(sys.cls.toUpperCase(), sc.x, sc.y + sc.h - 16 * u); }
  table(g, sub(g, { x: lc.x, y: lc.y + 405 * u, w: lc.w, h: 170 * u }, 'COURSE', P.ice, P), [['POSITION', sysCur().star.toUpperCase()], ['DESTINATION', sysDest().star.toUpperCase(), P.acc], ['HEADING', sysDest().heading.toUpperCase()], ['SPEED', SPEEDS[state.speed].screen]], P);
  pillBank(g, { x: lc.x, y: lc.y + 600 * u, w: lc.w, h: Y1 - Y0 - 600 * u }, 301, P, 4);
  // ---- right column: power, damage, contacts ----
  const rc = { x: X1 - 440 * u, y: Y0, w: 440 * u };
  const A = sim.alloc, kR = reactorOut() / SIM.reactor;
  bars(g, sub(g, { x: rc.x, y: rc.y, w: rc.w, h: 210 * u }, 'POWER · ' + sim.preset.toUpperCase(), P.acc, P), [['WEAPONS', A.weapons * kR / 100, P.acc], ['SHIELDS', A.shields * kR / 100, P.acc], ['ENGINES', A.engines * kR / 100, P.ice], ['SENSORS', A.sensors * kR / 100, P.ice]], P);
  zonesW(g, sub(g, { x: rc.x, y: rc.y + 225 * u, w: rc.w, h: 200 * u }, 'DAMAGE ZONES', P.acc, P), P);
  { const pr = sub(g, { x: rc.x, y: rc.y + 440 * u, w: rc.w, h: Y1 - Y0 - 440 * u }, 'CONTACTS', P.ice, P), [pa, pb] = split(pr, [0.9, 1.1], false, 12 * u);
    plotW(g, pa, P); table(g, pb, CONVOY.map(([n, d]) => [n, d.replace(' AFT', ''), P.ice]).concat([['TRACK 0417', state.alert !== 'green' ? 'UNKNOWN' : 'BEACON', state.alert !== 'green' ? P.acc : P.tan]]), P); }
  // ---- centre: the ship in plan, with power running through it ----
  const cx0 = X0 + 470 * u, cx1 = X1 - 470 * u, cwid = cx1 - cx0, PS = cwid / 300, PX = (mm) => cx0 + 70 * u + mm * PS, PZ = (mm) => Y0 + 330 * u + mm * PS, pl = msdPlan(PX, PZ);
  sub(g, { x: cx0, y: Y0, w: cwid, h: 150 * u }, 'SHIP SYSTEMS · PLAN', P.acc, P);
  g.strokeStyle = P.plum; g.lineWidth = 3 * u; [-1, 1].forEach((sd) => [1, 1.2].forEach((k) => { g.beginPath(); g.ellipse(PX(163), PZ(sd * 70), 42 * k * PS, 12 * k * PS, 0, 0, 7); g.stroke(); }));
  const arcs = [['fwd', Math.PI * 0.75, Math.PI * 1.25], ['port', Math.PI * 1.25, Math.PI * 1.75], ['aft', -Math.PI * 0.25, Math.PI * 0.25], ['stbd', Math.PI * 0.25, Math.PI * 0.75]], up = sim.shields.up > 0.01;
  arcs.forEach(([a, a0, a1]) => { const v = shieldNow(a), f = v / SIM.shield.max; g.strokeStyle = !up || v < 0.5 ? P.line : f > 0.5 ? P.ice : f > 0.2 ? P.yel : P.red; g.lineWidth = (sim.shields.reinforce === a ? 16 : 9) * u; g.beginPath(); g.ellipse(PX(100), PZ(0), 112 * PS, 86 * PS, 0, a0 + 0.06, a1 - 0.06); g.stroke(); });
  msdUnion(g, [...pl.spars, ...pl.nacs, pl.hull], '#151014', P.txt, 2.4 * u);
  g.save(); g.clip(pl.hull); g.fillStyle = P.plum; g.fillRect(PX(0), PZ(-52), 200 * PS, 104 * PS);
  { const rr = mulberry(1212); for (let i = 0; i < 160; i++) { const a = rr() * 192, z = (rr() - 0.5) * 92; g.fillStyle = [P.ice, P.tan, P.plum, P.rose, P.ice][(rr() * 5) | 0]; g.globalAlpha = 0.85; g.fillRect(PX(a), PZ(z), (2 + rr() * 9) * PS, (1.5 + rr() * 5) * PS); } g.globalAlpha = 1; }
  for (let d = 0; d < 6; d++) { g.strokeStyle = '#000'; g.lineWidth = 2 * u; g.beginPath(); g.ellipse(PX(66), PZ(0), (14 + d * 11) * PS, (9 + d * 7.5) * PS, 0, 0, 7); g.stroke(); }
  g.fillStyle = P.acc; g.beginPath(); g.ellipse(PX(64), PZ(0), 13 * PS, 7 * PS, 0, 0, 7); g.fill(); g.restore();
  pl.nacs.forEach((n) => { g.save(); g.clip(n); g.fillStyle = P.ice; g.fillRect(PX(120), PZ(-80), 85 * PS, 160 * PS); for (let i = 0; i < 13; i++) { const on = ((t * 6 - i) % 13 + 13) % 13 < 3; g.fillStyle = on ? P.txt : P.butter; g.fillRect(PX(138 + i * 4.6), PZ(-80), 2.4 * PS, 160 * PS); } g.restore(); });
  pl.spars.forEach((sp) => { g.save(); g.clip(sp); g.fillStyle = P.plum; g.fillRect(PX(120), PZ(-80), 80 * PS, 160 * PS); g.restore(); });
  // power conduits: blocks running from the core to the nacelles, the turret and the shield generators
  const core = [146, 0], routes = [[[146, 0], [150, -20], [164, -66]], [[146, 0], [150, 20], [164, 66]], [[146, 0], [110, 0], [64, 0]], [[146, 0], [140, -26]], [[146, 0], [140, 26]]];
  routes.forEach((rt, ri) => { for (let i = 0; i + 1 < rt.length; i++) { const [a, b] = [rt[i], rt[i + 1]], L2 = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L2 / 3)); for (let k = 0; k < n; k++) { const f = ((k / n) + t * (0.35 + ri * 0.04)) % 1, x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f, on = ((k + Math.floor(t * 9)) % 4) === 0; g.fillStyle = on ? P.txt : ri < 2 ? P.butter : ri === 2 ? P.acc : P.ice; rrect(g, PX(x) - 3.2 * u, PZ(z) - 3.2 * u, 6.4 * u, 6.4 * u, 1.5 * u); g.fill(); } } });
  { const k = 0.6 + 0.4 * Math.sin(t * (2 + smooth(30, 300, cur.speed) * 7)); g.fillStyle = P.butter; g.globalAlpha = 0.5 + 0.5 * k; g.beginPath(); g.arc(PX(core[0]), PZ(core[1]), 11 * u, 0, 7); g.fill(); g.globalAlpha = 1; }
  // zone damage over the plan
  const ZP = { prow: [0, -14, 22, 28], dorsal: [92, -10, 40, 20], ventral: [60, -18, 80, 36], port: [30, -48, 110, 22], stbd: [30, 26, 110, 22], engines: [150, -16, 50, 32], portNac: [124, -76, 76, 12], stbdNac: [124, 64, 76, 12] };
  Object.entries(ZP).forEach(([id, [a, z, w, d]]) => { const st = zoneStatus(id); if (st === 'ok') return; g.fillStyle = st === 'warn' ? P.yel : P.red; g.globalAlpha = 0.3 + 0.2 * Math.sin(t * 5); g.fillRect(PX(a), PZ(z), w * PS, d * PS); g.globalAlpha = 1; });
  // callouts round the plan
  g.font = `500 ${15 * u | 0}px ${DISP}`; g.textBaseline = 'middle';
  [['BRIDGE', 64, 0, -1, 0], ['WARP CORE', 146, 0, 1, 1], ['PORT NACELLE', 186, -70, -1, 0], ['STBD NACELLE', 186, 70, 1, 0], ['DORSAL TURRET', 110, -6, -1, 1], ['TORPEDO BAYS', 6, 0, 1, 0]].forEach(([lab, a, z, sd, row]) => { const px = PX(a), pz = PZ(z), ly = sd < 0 ? Y0 + (50 + row * 26) * u : PZ(0) + (205 + row * 26) * u; g.strokeStyle = P.ice; g.lineWidth = 2 * u; g.beginPath(); g.moveTo(px, pz); g.lineTo(px, ly); g.stroke(); g.fillStyle = P.butter; g.beginPath(); g.arc(px, pz, 4 * u, 0, 7); g.fill(); g.fillStyle = '#000'; const tw = g.measureText(lab).width; g.fillRect(px - tw / 2 - 4 * u, ly - 10 * u, tw + 8 * u, 20 * u); g.fillStyle = P.tan; g.textAlign = 'center'; g.fillText(lab, px, ly + 1); });
  // under the plan: deck status, numbers, a trace and buttons
  const by = PZ(0) + 270 * u, bw = cwid;
  for (let d = 1; d <= 12; d++) { const x = cx0 + (d - 1) * bw / 12, w = bw / 12 - 6 * u, on = d <= 2; hexTab(g, x, by, w, 26 * u, d === 1, d === 12); g.fillStyle = on ? P.acc : Math.sin(t * 0.8 + d * 2.1) > 0.7 ? P.butter : [P.tan, P.ice, P.plum][d % 3]; g.fill(); g.fillStyle = '#000'; g.font = `600 ${15 * u | 0}px ${DISP}`; g.textAlign = 'center'; g.fillText('D' + d, x + w / 2, by + 14 * u); }
  const lo = { x: cx0, y: by + 40 * u, w: cwid, h: Y1 - by - 40 * u }, [l1, l2, l3] = split(lo, [1, 1.1, 1], false, 16 * u);
  numGrid(g, l1, 211, P); spark(g, l2, P.ice, 3, 1.4, P); pillBank(g, l3, 223, P, 3);
}
// ---------- layered look (screens pass 3) ----------
// Every display is built in two layers. Underneath, a still, dim layer: deep navy regions, a faint grid, a faint
// schematic and tiny reference codes. On top, the crisp blocks and readouts. The still layer is drawn once into an
// offscreen canvas (keyed by size, seed and alert) and stamped down on each redraw, so it costs nothing to keep.
const LOOK3 = { all: true, only: new Set() };
const look3 = (s) => LOOK3.all || LOOK3.only.has(s.station);
const UNDER = new Map();
const NAVY = { g: ['#081022', '#0f1d3a', '#162a52', '#22406f', '#2f5288', '#4268a0'], r: ['#10070a', '#1a0b10', '#261018', '#3a1822', '#52222e', '#6a2e3a'] };
function microText(g, x, y, txt, col, fs) { g.font = `500 ${fs | 0}px ${DISP}`; g.fillStyle = col; g.textBaseline = 'top'; g.fillText(txt, x, y); }
function underlay(s, W, H, R) {
  const red = state.alert === 'red', key = s.kind + ':' + W + 'x' + H + ':' + s.seed + (red ? 'r' : 'g');
  let c = UNDER.get(key); if (c) return c;
  c = cnv(W, H); const g = c.getContext('2d'), N = NAVY[red ? 'r' : 'g'], r = mulberry(s.seed * 13 + 5), u = Math.min(W, H) / 400;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  // The panels follow the frame's own areas (R: the content field, the side rail, the bottom deck), so the dim
  // shapes read as the back layer of one designed layout rather than stains behind it.
  const fx = R.x0 - R.gap, fy = R.y0 - R.gap * 0.5, fw = R.x1 - R.x0 + R.gap * 2, fh = R.y1 - R.y0 + R.gap, rad = 22 * u;
  rrect(g, fx, fy, fw, fh, rad); g.fillStyle = N[0]; g.fill();
  // the lower-left block: a stepped panel, lighter at the top, with a faint grid
  const sp = 0.5 + r() * 0.12, bx = fx, by = fy + fh * (0.42 + r() * 0.08), bw = fw * sp, bh = fy + fh - by;
  let gr = g.createLinearGradient(0, by, 0, by + bh); gr.addColorStop(0, N[2]); gr.addColorStop(1, N[1]);
  g.beginPath(); g.moveTo(bx, by + bh); g.lineTo(bx, by + rad); g.quadraticCurveTo(bx, by, bx + rad, by); g.lineTo(bx + bw * 0.62, by);
  g.quadraticCurveTo(bx + bw * 0.7, by, bx + bw * 0.72, by + bh * 0.16); g.lineTo(bx + bw - rad, by + bh * 0.16); g.quadraticCurveTo(bx + bw, by + bh * 0.16, bx + bw, by + bh * 0.16 + rad);
  g.lineTo(bx + bw, by + bh - rad); g.quadraticCurveTo(bx + bw, by + bh, bx + bw - rad, by + bh); g.closePath(); g.fillStyle = gr; g.fill();
  g.save(); g.clip(); g.strokeStyle = N[3]; g.globalAlpha = 0.5; g.lineWidth = Math.max(1, u * 0.8); const gs = Math.max(12, 20 * u);
  g.beginPath(); for (let x = bx + gs; x < bx + bw; x += gs) { g.moveTo(x, by); g.lineTo(x, by + bh); } for (let y = by + gs; y < by + bh; y += gs) { g.moveTo(bx, y); g.lineTo(bx + bw, y); } g.stroke(); g.restore(); g.globalAlpha = 1;
  // the right-hand block: a tall panel under an elbow, carrying a faint schematic
  const qx = fx + fw * (0.6 + r() * 0.06), qy = fy + fh * 0.08, qw = fx + fw - qx, qh = fh * 0.92;
  elbow(g, qx, qy, qw * 0.14, Math.max(3, 6 * u), qw, Math.max(8, 16 * u), true, N[2]);
  gr = g.createLinearGradient(qx, 0, qx + qw, 0); gr.addColorStop(0, N[1]); gr.addColorStop(1, N[0]);
  rrect(g, qx + qw * 0.14 + R.gap, qy + Math.max(8, 16 * u) + R.gap, qw * 0.86 - R.gap, qh - Math.max(8, 16 * u) - R.gap, rad * 0.8); g.fillStyle = gr; g.fill();
  const kind = (s.seed + s.kind.length) % 3, sx = qx + qw * 0.58, sy = qy + qh * 0.56, sr = Math.min(qw, qh) * 0.36;
  g.strokeStyle = N[4]; g.lineWidth = Math.max(1, 1.3 * u); g.globalAlpha = 0.55;
  if (kind === 0) {
    [1, 0.72, 0.44].forEach((f) => { g.beginPath(); g.arc(sx, sy, sr * f, 0, 7); g.stroke(); });
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, l = i % 4 ? 0.05 : 0.12; g.beginPath(); g.moveTo(sx + Math.cos(a) * sr, sy + Math.sin(a) * sr); g.lineTo(sx + Math.cos(a) * sr * (1 + l), sy + Math.sin(a) * sr * (1 + l)); g.stroke(); }
    g.beginPath(); g.moveTo(sx - sr * 1.2, sy); g.lineTo(sx + sr * 1.2, sy); g.moveTo(sx, sy - sr * 1.2); g.lineTo(sx, sy + sr * 1.2); g.stroke();
  } else if (kind === 1) {
    g.save(); g.translate(sx, sy); g.rotate(-Math.PI / 2); hullTop(g, 0, 0, sr); g.stroke(); hullTop(g, 0, 0, sr * 0.7); g.stroke(); g.restore();
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(sx - sr * 1.1, sy + i * sr * 0.18); g.lineTo(sx - sr * 0.95, sy + i * sr * 0.18); g.stroke(); }
  } else {
    for (let k = 0; k < 6; k++) { g.beginPath(); for (let i = 0; i <= 40; i++) { const t = i / 40, x = sx - sr * 1.1 + t * sr * 2.2, y = sy - sr * 0.7 + k * sr * 0.28 + Math.sin(t * 6 + k * 1.3 + s.seed) * sr * 0.08; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  }
  g.globalAlpha = 1;
  // behind the side rail and the bottom deck: their own dim trays
  if (R.rail) { rrect(g, R.rail.x - R.gap, R.rail.y - R.gap, R.rail.w + R.gap * 2, R.rail.h + R.gap * 2, rad * 0.7); g.fillStyle = N[1]; g.fill(); }
  if (R.deck) { rrect(g, R.deck.x - R.gap, R.deck.y - R.gap * 0.6, R.deck.w + R.gap * 2, R.deck.h + R.gap * 1.2, rad * 0.6); g.fillStyle = N[1]; g.fill(); }
  // a hairline ruler along the lower block, and tiny reference codes tucked in panel corners, only noticed up close
  g.fillStyle = N[3]; const ry = by + bh - 8 * u;
  g.fillRect(bx + 14 * u, ry, bw - 28 * u, Math.max(1, u)); for (let x = bx + 14 * u, i = 0; x < bx + bw - 14 * u; x += 9 * u, i++) g.fillRect(x, ry - (i % 5 ? 3 : 7) * u, Math.max(1, u), (i % 5 ? 3 : 7) * u);
  const fsm = clamp(8.5 * u, 8, 12), code = () => String(10 + (r() * 89 | 0)) + '-' + String(1000 + (r() * 8999 | 0));
  [[bx + bw - 70 * u, by + bh * 0.16 + 6 * u], [qx + qw - 70 * u, qy + qh - 18 * u], [fx + 10 * u, fy + 6 * u]].forEach(([x, y]) => microText(g, x, y, code(), N[5], fsm));
  UNDER.set(key, c); return c;
}
// ---------- desk display: the whole desktop is a control surface ----------
// Big colour pads carry the look (the rows of rounded blocks with tiny numbers), a segmented ring gauge, and the
// station's own readouts in a compact panel in the middle. Still except for: one selected pad that moves now and
// then, one pad that toggles, and a slow filling bar.
const DESK_C = new Map();
function deskStatic(s, W, H, P) {
  const red = state.alert === 'red', key = W + 'x' + H + ':' + s.seed + (red ? 'r' : 'g');
  let c = DESK_C.get(key); if (c) return c;
  c = cnv(W, H); const g = c.getContext('2d'), N = NAVY[red ? 'r' : 'g'], r = mulberry(s.seed * 31 + 9), u = H / 400, m = 14 * u;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const L = s.layout = { pads: [], ring: null, mid: null, fill: null };
  // left: a big navy field holding the pad clusters
  rrect(g, m, m, W * 0.31, H - 2 * m, 22 * u); g.fillStyle = N[1]; g.fill();
  elbow(g, m, m, 26 * u, 16 * u, W * 0.26, 22 * u, true, P.tan);
  const cols = [P.tan, P.butter, P.acc, P.ice, P.tan, P.butter, P.rose, P.plum], ph = 30 * u, gp = 7 * u;
  let y = m + 52 * u;
  for (let row = 0; y + ph < H - m - 12 * u; row++, y += ph + gp) {
    let x = m + 34 * u; const x1 = m + W * 0.31 - 12 * u;
    while (x < x1 - 30 * u) {
      const w = Math.min(x1 - x, (r() < 0.25 ? 2.3 : 1) * (44 + r() * 26) * u), col = cols[(r() * cols.length) | 0], off = r() < 0.12;
      L.pads.push({ x, y, w, h: ph, col, off, l: x === m + 34 * u, n: String(10 + (r() * 89 | 0)) + (w > 90 * u ? '-' + String(100 + (r() * 899 | 0)) : '') });
      x += w + gp;
    }
  }
  L.pads.forEach((q) => { hexTab(g, q.x, q.y, q.w, q.h, q.l, false); g.fillStyle = q.off ? P.line : q.col; g.fill(); if (!q.off) { g.fillStyle = '#000'; g.font = `600 ${q.h * 0.42 | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(q.n, q.x + q.w - 6 * u, q.y + q.h / 2 + 1); } });
  // middle: a frame for the station's readouts
  const mx = m + W * 0.31 + 18 * u, mw = W * 0.5;
  L.mid = { x: mx + 30 * u, y: m + 40 * u, w: mw - 36 * u, h: Math.min(H * 0.52, 165) };
  rrect(g, mx, m + 28 * u, mw, L.mid.h + 26 * u, 18 * u); g.fillStyle = N[0]; g.fill();
  elbow(g, mx, m, 22 * u, 14 * u, mw * 0.55, 20 * u, true, P.acc);
  const t = s.title.toUpperCase(); fitFont(g, t, 600, 26 * u, DISP, mw * 0.4); g.fillStyle = P.acc; g.textAlign = 'right'; g.textBaseline = 'top'; g.fillText(t, mx + mw, m - 3 * u);
  // below it: three long bars, the first one live (a slow fill), and a run of thin tick blocks
  const by = L.mid.y + L.mid.h + 26 * u, bw = mw;
  L.fill = { x: mx, y: by, w: bw * 0.7, h: 16 * u };
  [[0, P.line], [26 * u, P.ice], [52 * u, P.tan]].forEach(([dy, col], i) => { hexTab(g, mx, by + dy, i ? bw * (0.35 + r() * 0.4) : bw * 0.7, 16 * u, true, true); g.fillStyle = col; g.fill(); });
  for (let i = 0, x = mx; x < mx + bw - 8 * u && by + 84 * u < H - m; i++, x += 13 * u) { g.fillStyle = [P.tan, P.plum, P.ice][i % 7 === 3 ? 2 : i % 3 === 1 ? 1 : 0]; g.fillRect(x, by + 82 * u, 8 * u, (i % 4 ? 12 : 22) * u); }
  // right: the segmented ring gauge in its own navy field, with a cluster of small pads beside it
  const rx = mx + mw + 18 * u, rw = W - m - rx;
  rrect(g, rx, m, rw, H - 2 * m, 22 * u); g.fillStyle = N[1]; g.fill();
  const cx = rx + rw * 0.42, cy = H * 0.5, rad = Math.min(rw * 0.38, H * 0.36);
  L.ring = { cx, cy, rad };
  const segs = [[P.tan, 8], [P.ice, 6], [P.acc, 10]], ringW = rad * 0.2;
  segs.forEach(([col, n], k) => { const rr2 = rad * (1 - k * 0.27); for (let i = 0; i < n; i++) { if (r() < 0.18) continue; const a0 = -Math.PI * 0.75 + i / n * Math.PI * 1.5 + 0.04, a1 = a0 + Math.PI * 1.5 / n - 0.08; g.strokeStyle = col; g.lineWidth = ringW * (1 - k * 0.15); g.beginPath(); g.arc(cx, cy, rr2, a0, a1); g.stroke(); } });
  g.fillStyle = P.butter; g.beginPath(); g.arc(cx, cy, rad * 0.2, 0, 7); g.fill();
  for (let i = 0; i < 6; i++) { const qx = rx + rw * 0.8, qy = m + 30 * u + i * 34 * u; if (qy + 24 * u > H - m) break; hexTab(g, qx, qy, rw * 0.16, 24 * u, false, true); g.fillStyle = [P.acc, P.tan, P.ice, P.butter, P.tan, P.rose][i]; g.fill(); }
  microText(g, rx + 12 * u, H - m - 22 * u, String(s.code || '').replace('·', ' ') + ' · ' + String(200 + s.seed % 700), N[5], clamp(9 * u, 8, 12));
  DESK_C.set(key, c); return c;
}
function drawDesk(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), u = H / 400;
  g.drawImage(deskStatic(s, W, H, P), 0, 0); const L = s.layout;
  // one pad is selected (cream) and moves on every 8-20 s; another toggles on its own slower timing
  const n = L.pads.length, sel = (hash1(s.seed * 5 + slowTick(s.seed * 3.7, 8, 20)) * n) | 0, tg = slowTick(s.seed * 9.1, 11, 27), tk = (hash1(s.seed + tg * 3) * n) | 0;
  [[sel, P.txt], [tk, tg % 2 ? P.line : null]].forEach(([i, col]) => { const q = L.pads[i]; if (!q || !col) return; hexTab(g, q.x, q.y, q.w, q.h, q.l, false); g.fillStyle = col; g.fill(); });
  // the slow fill: a bar that creeps along over a minute or so, then starts again
  { const f = L.fill, t = ((elapsed + hash1(s.seed) * 60) / (50 + hash1(s.seed + 2) * 40)) % 1; g.fillStyle = P.line; hexTab(g, f.x, f.y, f.w, f.h, true, true); g.fill(); hexTab(g, f.x, f.y, Math.max(f.h, f.w * t), f.h, true, true); g.fillStyle = P.butter; g.fill(); }
  // the station's own readouts, compact
  const M = L.mid; g.fillStyle = NAVY[state.alert === 'red' ? 'r' : 'g'][0]; g.fillRect(M.x - 4, M.y - 2, M.w + 8, M.h + 4);
  if (DRAW[s.sub]) DRAW[s.sub](g, M.x, M.y, M.w, M.h, P, s);
  s.tex.needsUpdate = true;
}
// the hooded viewer: a slow trace crawling across a faint grid
function drawScope(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), N = NAVY[state.alert === 'red' ? 'r' : 'g'];
  g.fillStyle = N[0]; g.fillRect(0, 0, W, H);
  g.fillStyle = N[2]; for (let x = 0; x < W; x += 24) g.fillRect(x, 0, 1, H); for (let y = H / 2 % 12; y < H; y += 12) g.fillRect(0, y, W, 1);
  const t = elapsed * (0.08 + hash1(s.seed) * 0.06) + s.seed;
  g.strokeStyle = P.ice; g.lineWidth = 2; g.beginPath();
  for (let x = 0; x <= W; x += 3) { const v = Math.sin(x * 0.045 + t * 2) * 0.5 + Math.sin(x * 0.11 - t * 1.3) * 0.25 + Math.sin(x * 0.023 + t) * 0.2; const y = H / 2 - v * H * 0.34; x ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  g.fillStyle = P.tan; g.fillRect(4, 4, 30, 8); g.fillStyle = P.acc; g.fillRect(W - 22, H - 12, 18, 8);
  s.tex.needsUpdate = true;
}
function drawScreen(s) {
  if (s.kind === 'strip') drawStrip(s);
  else if (s.kind === 'msd') drawMSD(s);
  else if (s.kind === 'table') drawTable(s);
  else if (s.kind === 'cmd') drawCmd(s);
  else if (s.kind === 'keys') drawKeys(s);
  else if (s.kind === 'band') drawBand(s);
  else if (s.kind === 'desk') { drawDesk(s); return; }
  else if (s.kind === 'scope') { drawScope(s); return; }
  else {
    const g = s.g, W = s.w, H = s.h, P = pal(), small = H < 200;
    const pad = Math.max(4, Math.round(Math.min(W, H) * 0.035)), gap = Math.max(3, Math.round(pad * 0.7));
    const colW = Math.round(clamp(W * 0.085, 22, 92)), barH = Math.round(clamp(H * (small ? 0.075 : 0.042), 6, 22));
    const fs = Math.round(clamp(Math.min(H * (small ? 0.13 : 0.068), W * 0.075), 11, 46)), ext = Math.round(clamp(H * 0.1, 8, 64));
    // frame geometry first (the dim back layer follows it), then draw
    const R = { gap, x0: pad + colW + gap * 2.5, y0: pad + Math.max(fs * 1.02, barH + ext * 0.4) + gap, x1: W - pad, y1: H - pad - barH - gap * 1.6, rail: null, deck: null };
    if (W >= 520 && s.kind !== 'msd') { const rw = Math.round(clamp(W * (small ? 0.2 : 0.15), 70, 160)); R.rail = { x: W - pad - rw, y: R.y0, w: rw, h: R.y1 - R.y0 }; R.x1 = R.rail.x - gap * 3; }
    if (H >= 420 && W >= 300) { const bh = Math.round(clamp(H * 0.1, 34, 78)); R.deck = { x: R.x0, y: R.y1 - bh, w: R.x1 - R.x0, h: bh }; }
    if (look3(s)) g.drawImage(underlay(s, W, H, R), 0, 0); else { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }
    const title = s.title.toUpperCase(); fitFont(g, title, 600, fs, DISP, W * 0.5); const tw = g.measureText(title).width;
    const tx = W - pad - fs * 0.55 - gap, barEnd = tx - tw - gap * 2;
    // top elbow and bar: peach, a tan block, a lilac block, then the title on black and a peach end cap
    const seg1 = Math.min(Math.max(colW + barH * 2, (barEnd - pad) * 0.48), Math.max(colW + barH, barEnd - pad));
    elbow(g, pad, pad, colW, barH, seg1, ext, true, P.acc);
    { // the rest of the top bar: several blocks, the longer ones carrying small codes
      let x = pad + seg1 + gap; const rr = mulberry(s.seed + 3), cols = [P.tan, P.ice, P.butter, P.plum, P.tan];
      while (x < barEnd - 8) {
        const w = Math.min(barEnd - x, Math.max(barH * 2, (barEnd - pad) * (0.06 + rr() * 0.16))), c = cols[(rr() * cols.length) | 0];
        g.fillStyle = c; g.fillRect(x, pad, w, barH);
        if (barH >= 10 && w > barH * 4) { g.fillStyle = '#000'; g.font = `600 ${barH * 0.78 | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(String(100 + ((s.seed * 37 + x) | 0) % 899), x + w - 4, pad + barH / 2 + 1); }
        x += w + gap;
      }
    }
    fitFont(g, title, 600, fs, DISP, W * 0.5); g.fillStyle = P.acc; g.textAlign = 'right'; g.textBaseline = 'top'; g.fillText(title, tx, pad - fs * 0.08);
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
      const n = clamp(Math.round(avail / Math.max(22, H * 0.075)), 1, 10), kh = (avail - (n - 1) * gap) / n, r = mulberry(s.seed), cols = [P.ice, P.tan, P.butter, P.rose, P.tan, P.plum];
      for (let i = 0; i < n; i++) {
        const c = cols[(r() * cols.length) | 0], blink = false, tk = r() < 0.3 ? slowTick(s.seed * 11 + i, 12, 40) : 0, num = String(10 + ((s.seed * 37 + i * 113) % 89)) + '-' + String(1000 + ((s.seed * 53 + i * 71 + tk * 389) % 8999));
        g.fillStyle = blink ? P.txt : c; g.fillRect(pad, cy0 + i * (kh + gap), colW, kh);
        if (kh > 12) { g.fillStyle = '#000'; g.textAlign = 'right'; g.textBaseline = 'bottom'; fitFont(g, num, 600, Math.min(kh * 0.36, colW * 0.24), DISP, colW - 6); g.fillText(num, pad + colW - 4, cy0 + i * (kh + gap) + kh - 2); }
      }
    }
    const x0 = pad + colW + gap * 2.5, y0 = pad + Math.max(fs * 1.02, barH + ext * 0.4) + gap;
    let x1 = W - pad, y1 = H - pad - barH - gap * 1.6;
    // a side rail of buttons and numbers on the wider screens, a bottom deck of buttons on the taller ones
    if (W >= 520 && s.kind !== 'msd') {
      const rw = Math.round(clamp(W * (small ? 0.2 : 0.15), 70, 160)), rx = W - pad - rw;
      if (small) pillBank(g, { x: rx, y: y0, w: rw, h: y1 - y0 }, s.seed + 11, P, 2);
      else { const [ra, rb] = split({ x: rx, y: y0, w: rw, h: y1 - y0 }, [1.25, 1], true, gap * 2); pillBank(g, ra, s.seed + 11, P, 2); numGrid(g, rb, s.seed + 5, P); }
      x1 = rx - gap * 3; g.fillStyle = P.line; g.fillRect(x1 + gap * 1.2, y0, Math.max(2, gap * 0.6), y1 - y0);
    }
    if (H >= 420 && W >= 300) {
      const bh = Math.round(clamp(H * 0.1, 34, 78)), by = y1 - bh;
      if (W >= 520) { const [ba, bb] = split({ x: x0, y: by, w: x1 - x0, h: bh }, [2.2, 1], false, gap * 3); pillBank(g, ba, s.seed + 23, P, Math.max(4, Math.round(ba.w / 90))); numGrid(g, bb, s.seed + 29, P); }
      else pillBank(g, { x: x0, y: by, w: x1 - x0, h: bh }, s.seed + 23, P, 2);
      y1 = by - gap * 2.5;
    }
    DRAW[s.kind](g, x0, y0, x1 - x0, y1 - y0, P, s);
  }
  s.tex.needsUpdate = true;
}

function redrawAll() { screens.forEach(drawScreen); drawOverlay(); }
redrawAll();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { redrawAll(); });
