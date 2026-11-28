// Floor-plan checks for tools/check_plan.py: reads the SHIPGEO block (passed on stdin), works out each deck's floor
// plan and prints [{ name, ok, info }] as JSON. See check_plan.py for what each check means.
'use strict';
const src = require('fs').readFileSync(0, 'utf8'), STD = JSON.parse(process.argv[2]);
const G = new Function(src + '\nreturn { SHIPGEO, shipFloorPlan, shipSkinTop, shipTopAt, shipHull, shipRoomLayout, shipSickbayLayout };')();
const res = [], ok = (name, cond, info) => res.push({ name, ok: !!cond, info: cond ? '' : info || '' });
const inPoly = (P, m, x) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [am, ax] = P[i], [bm, bx] = P[j]; if ((ax > x) !== (bx > x) && m < (bm - am) * (x - ax) / (bx - ax) + am) c = !c; } return c; };
const bbox = (P) => P.reduce((b, [m, x]) => [Math.min(b[0], m), Math.max(b[1], m), Math.min(b[2], x), Math.max(b[3], x)], [1e9, -1e9, 1e9, -1e9]);
for (const n of Object.keys(G.SHIPGEO.plans).map(Number)) {
  const F = G.shipFloorPlan(n), P = F.P, [cm, cx] = P.c, D = 'D' + n + ' plan: ';
  ok(D + 'room and corridor sizes match STD (core.js)', P.room === STD.room && P.corr === STD.corr && P.w === STD.w && P.ring[1] === STD.w,
    `plan room ${P.room} corr ${P.corr} w ${P.w}, STD room ${STD.room} corridor ${STD.corr} x ${STD.w}`);
  const rooms = F.spaces.filter((s) => s.t !== 'c'), cpieces = [{ ring: F.corr.ring }].concat(F.corr.runs.map((p) => ({ poly: p }))).concat(F.spaces.filter((s) => s.t === 'c'));
  const inC = (c, m, x) => c.ring ? (() => { const r = Math.hypot(m - cm, x - cx); return r >= c.ring[0] && r <= c.ring[1]; })() : inPoly(c.poly, m, x);
  rooms.forEach((s) => { s.bb = bbox(s.poly); }); cpieces.forEach((c) => { c.bb = c.ring ? [cm - c.ring[1], cm + c.ring[1], cx - c.ring[1], cx + c.ring[1]] : bbox(c.poly); });
  const inB = (b, m, x) => m >= b[0] - 0.01 && m <= b[1] + 0.01 && x >= b[2] - 0.01 && x <= b[3] + 0.01;
  // a grid over the deck, offset so points never sit on the round-number walls
  const pts = []; { const b = rooms.concat(cpieces).reduce((a, s) => [Math.min(a[0], s.bb[0]), Math.max(a[1], s.bb[1]), Math.min(a[2], s.bb[2]), Math.max(a[3], s.bb[3])], [1e9, -1e9, 1e9, -1e9]);
    for (let m = b[0] + 0.137; m < b[1]; m += 0.25) for (let x = b[2] + 0.113; x < b[3]; x += 0.25) pts.push([m, x]); }
  // 1. headroom: every point of a room or lift has the room limit, every corridor point the corridor limit
  const head = new Map(), skin = (m, x) => G.shipSkinTop(m, x);
  let worstR = null, worstC = null;
  for (const [m, x] of pts) {
    const r = rooms.find((s) => s.t !== 'v' && inB(s.bb, m, x) && inPoly(s.poly, m, x));
    const c = r ? null : cpieces.find((q) => inB(q.bb, m, x) && inC(q, m, x));
    if (!r && !c) continue;
    const t = skin(m, x), lim = r ? F.lim : F.limCorr;
    if (t > lim + 1e-6) { const key = r ? (r.id || r.n) : 'corridor'; if (!head.has(key)) head.set(key, `${key} at m ${m.toFixed(1)}, x ${x.toFixed(1)} (skin ${t.toFixed(2)} > ${lim.toFixed(2)})`); }
  }
  ok(D + 'full headroom in every room and corridor (hull or spine at least ceiling + 0.35 m above the floor)', head.size === 0, [...head.values()].slice(0, 6).join('; '));
  // 2. no two spaces share floor, and no room overlaps a corridor (corridors may cross each other)
  const clash = new Set();
  for (const [m, x] of pts) {
    const hit = rooms.filter((s) => inB(s.bb, m, x) && inPoly(s.poly, m, x)), hc = cpieces.filter((q) => !q.n && inB(q.bb, m, x) && inC(q, m, x)).length + cpieces.filter((q) => q.n && inB(q.bb, m, x) && inC(q, m, x)).length;
    if (hit.length > 1) clash.add(hit.map((s) => s.id || s.n).join(' / '));
    if (hit.length && hc) clash.add((hit[0].id || hit[0].n) + ' / corridor');
  }
  ok(D + 'no overlapping spaces', clash.size === 0, [...clash].slice(0, 6).join('; '));
  // 3. the corridors join up, every door opens from its room onto a corridor, and every room is reachable from a lift
  const near = (m, x, f) => { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; if (f(m + 0.3 * Math.cos(a), x + 0.3 * Math.sin(a))) return true; } return false; };
  const edge = (c) => { if (c.ring) return [[cm + c.ring[0], cx], [cm - c.ring[1], cx]]; const o = []; c.poly.forEach((p, i) => { const q = c.poly[(i + 1) % c.poly.length], L = Math.hypot(q[0] - p[0], q[1] - p[1]); for (let t = 0; t < L; t += 0.2) o.push([p[0] + (q[0] - p[0]) * t / L, p[1] + (q[1] - p[1]) * t / L]); }); return o; };
  const comp = cpieces.map((_, i) => i), find = (i) => comp[i] === i ? i : (comp[i] = find(comp[i]));
  cpieces.forEach((a, i) => cpieces.forEach((b, j) => { if (j > i && edge(a).concat(edge(b).length ? [] : []).some(([m, x]) => inC(b, m, x) || near(m, x, (p, q) => inC(b, p, q)))) comp[find(i)] = find(j); }));
  const roots = new Set(cpieces.map((_, i) => find(i)));
  ok(D + 'corridors form one network', roots.size === 1, `${roots.size} separate corridor networks`);
  const badDoor = [], onto = new Map();
  for (const s of rooms) { if (s.t === 'v') continue;
    if (!s.door) { badDoor.push((s.id || s.n) + ' has no door'); continue; }
    const [m, x] = s.door, ci = cpieces.findIndex((q) => near(m, x, (p, r) => inC(q, p, r)));
    if (!near(m, x, (p, r) => inPoly(s.poly, p, r)) || ci < 0) badDoor.push(`${s.id || s.n} door at ${m.toFixed(1)}, ${x.toFixed(1)}`); else onto.set(s, find(ci)); }
  ok(D + 'every room and lift has a door onto a corridor', badDoor.length === 0, badDoor.slice(0, 6).join('; '));
  const liftNets = new Set(rooms.filter((s) => s.t === 'lift' && onto.has(s)).map((s) => onto.get(s)));
  const unreached = rooms.filter((s) => s.t !== 'v' && s.t !== 'lift' && !(onto.has(s) && liftNets.has(onto.get(s))));
  ok(D + 'every room reachable from a lift', liftNets.size > 0 && unreached.length === 0, unreached.map((s) => s.id || s.n).slice(0, 6).join(', ') || 'no lift door on a corridor');
  // 4. the side cutaway agrees with the plan: along strips 2.6 m to either side of the centreline, each named space the
  // plan has there is listed on the deck's side view over those metres on that side, and each listed span holds it
  const side = G.SHIPGEO.rooms[n - 1], mis = new Set();
  for (const [sd, x] of [['s', 2.6], ['p', -2.6]]) {
    const ent = side.filter((r) => r[5] === '' || r[5] === sd), seen = new Map();
    for (let m = 0.05; m < 200; m += 0.25) {
      const sp = F.spaces.find((s) => s.t !== 'v' && inPoly(s.poly, m, x)), e = ent.find((r) => m >= r[0] - 0.05 && m <= r[1] + 0.05);
      if (sp && !e) mis.add(`${sp.n} at m ${m.toFixed(1)} (${sd}) not on the side view`);
      else if (sp && e[2] !== sp.n) mis.add(`side view says ${e[2]} at m ${m.toFixed(1)} (${sd}), plan has ${sp.n}`);
      if (sp && e) seen.set(e, (seen.get(e) || 0) + 1);
      if (!sp && e && m > e[0] + 0.4 && m < e[1] - 0.4 && F.spaces.every((s) => !inPoly(s.poly, m - 0.25, x) || s.t === 'v') && F.spaces.every((s) => !inPoly(s.poly, m + 0.25, x) || s.t === 'v')) mis.add(`side view's ${e[2]} at m ${m.toFixed(1)} (${sd}) has no room there in the plan`);
    }
    ent.forEach((e) => { if (!seen.get(e)) mis.add(`side view's ${e[2]} (${e[0]}-${e[1]}) not found on the ${sd === 's' ? 'starboard' : 'port'} strip`); });
  }
  ok(D + 'side cutaway matches the floor plan', mis.size === 0, [...mis].slice(0, 6).join('; '));
  // 5. cabin sizes (singles about 4 x 5 m, doubles larger)
  const area = (p) => { let a = 0; p.forEach(([q, w], i) => { const [e, r] = p[(i + 1) % p.length]; a += q * r - e * w; }); return Math.abs(a / 2); };
  const cabs = rooms.filter((s) => s.b), one = cabs.filter((s) => s.b === 1).map((s) => area(s.poly)), two = cabs.filter((s) => s.b > 1).map((s) => area(s.poly));
  ok(D + `cabins: ${one.length} singles (${Math.min(...one).toFixed(0)}-${Math.max(...one).toFixed(0)} m²), ${two.length} doubles (${Math.min(...two).toFixed(0)}-${Math.max(...two).toFixed(0)} m²)`,
    Math.min(...one) >= 18 && (!two.length || Math.min(...two) >= 20), 'a single under 18 m² or a double under 20 m²');
  // 6. cabin layouts (shipRoomLayout): every cabin has a head at least 1.3 x 2.0 m and a bed per berth, every piece
  // inside the room's walls (10 cm in), no two pieces overlapping, the strip along the door's wall clear
  { const bad = [];
    cabs.forEach((s) => { const L = G.shipRoomLayout(s), id = s.id; if (!L) { bad.push(id + ' no layout'); return; }
      const head = L.items.find((i) => i.k === 'head'), beds = L.items.filter((i) => i.k === 'bed').length + 2 * L.items.filter((i) => i.k === 'bunk').length;
      if (!head || head.u1 - head.u0 < 1.29 || head.v1 - head.v0 < 1.99) bad.push(id + ' head size');
      if (beds < s.b) bad.push(`${id} ${beds} beds for ${s.b} berths`);
      L.items.forEach((a, i) => { for (const [u, v] of [[a.u0, a.v0], [a.u1, a.v0], [a.u1, a.v1], [a.u0, a.v1]]) { const [m, x] = L.at(u, v); if (!inPoly(s.poly, m, x)) { bad.push(`${id} ${a.k} outside`); break; } }
        if (a.v0 < 0.85) bad.push(`${id} ${a.k} in the door strip`);
        L.items.forEach((b, j) => { if (j > i && a.u0 < b.u1 - 0.01 && b.u0 < a.u1 - 0.01 && a.v0 < b.v1 - 0.01 && b.v0 < a.v1 - 0.01) bad.push(`${id} ${a.k}/${b.k} overlap`); }); }); });
    ok(D + `every cabin laid out: own head, a bed per berth, furniture inside and clear of the door (${cabs.length})`, !bad.length, bad.slice(0, 6).join('; ')); }
  // 7. window nooks (ring cabins, Nov 28): every cabin on a ring row with a nook has its alcove, its bed(s) in it, clear of
  // the head; a window over it with only the hull's top skin overhead (deeper than the deck above's floor) and room for a
  // light well above the ceiling, sampled on a 20 cm grid
  { const want = rooms.filter((s) => s.nook), bad = []; let wins = 0;
    want.forEach((s) => { const N = s.nookAt, id = s.id; if (!N) { bad.push(id + ' no nook'); return; }
      const L = G.shipRoomLayout(s), hd = L.items.find((i) => i.k === 'head'), beds = L.items.filter((i) => i.k === 'bed' || i.k === 'bunk');
      if (!beds.every((b) => b.u0 >= N.u0 && b.u1 <= N.u1 && b.v1 <= N.v1 - 0.05 && b.v1 > N.v0 + 1)) bad.push(id + ' bed not in its nook');
      if (N.u1 > hd.u0) bad.push(id + ' nook reaches the head');
      if (!N.q.every(([m, x]) => s.poly.some(([a, b]) => Math.hypot(a - m, b - x) < 1e-6))) bad.push(id + ' nook corners not in the outline');
      const W = N.win; if (!W) { bad.push(id + ' no window'); return; } wins++;
      for (let u = W.u0; u <= W.u1 + 1e-6; u += 0.2) for (let v = W.v0; v <= W.v1 + 1e-6; v += 0.2) { const [m, x] = L.at(u, v), k = G.shipSkinTop(m, x);
        if (!inPoly(s.poly, m, x)) { bad.push(`${id} window outside the room at ${u.toFixed(1)},${v.toFixed(1)}`); return; }
        if (k <= 3.5 * (F.n - 1) || k >= 3.5 * F.n - F.P.room - 0.15) { bad.push(`${id} window under ${k.toFixed(2)} at ${u.toFixed(1)},${v.toFixed(1)}`); return; } } });
    ok(D + `window nooks: ${want.length} ring cabins, each bed in its alcove under a window in the hull's top (${wins} windows)`, want.length >= 16 && !bad.length, bad.slice(0, 6).join('; ')); }
}
// sickbay's fittings (shipSickbayLayout): eight ward beds, three glass rooms; everything inside the room and off the walls'
// line, nothing overlapping (except what sits inside a glass room), and a clear walk (0.3 m either side of you) from the
// entrance to the foot of every bed, every glass room's door, the staff station and every cabinet
{ const F = G.shipFloorPlan(3), sp = F.spaces.find((s) => s.n === 'Sickbay'), L = sp && G.shipSickbayLayout(sp), bad = [];
  if (!L) bad.push('no layout');
  else {
    const dseg = (p, a, b) => { const L2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / L2)); return Math.hypot(a[0] + t * (b[0] - a[0]) - p[0], a[1] + t * (b[1] - a[1]) - p[1]); };
    const dpoly = (P, p) => Math.min(...P.map((a, i) => dseg(p, a, P[(i + 1) % P.length])));
    const nm = (q) => q.k + (q.n ? ' ' + q.n : ''), its = L.items.filter((q) => q.k !== 'lamp');
    if (L.items.filter((q) => q.k === 'bed' && !q.in).length !== 8) bad.push('ward beds ' + L.items.filter((q) => q.k === 'bed' && !q.in).length + ', want 8');
    if (L.items.filter((q) => q.glass).length !== 3) bad.push('glass rooms ' + L.items.filter((q) => q.glass).length + ', want 3');
    its.forEach((q) => q.poly.forEach((p) => { if (!inPoly(sp.poly, p[0], p[1])) bad.push(nm(q) + ' outside the room'); }));
    its.forEach((q) => { if (q.in && !q.poly.every((p) => inPoly(L.items.find((g) => g.k === q.in).poly, p[0], p[1]))) bad.push(nm(q) + ' not inside its ' + q.in); });
    its.forEach((a, i) => its.forEach((b, j) => { if (j <= i || a.in === b.k || b.in === a.k || (a.in || '') !== (b.in || '')) return;
      if (a.poly.some((p) => inPoly(b.poly, p[0], p[1])) || b.poly.some((p) => inPoly(a.poly, p[0], p[1]))) bad.push(nm(a) + ' / ' + nm(b) + ' overlap'); }));
    const obs = its.filter((q) => !q.in), free = (m, x) => inPoly(sp.poly, m, x) && dpoly(sp.poly, [m, x]) >= 0.3 && obs.every((q) => !inPoly(q.poly, m, x) && dpoly(q.poly, [m, x]) >= 0.3);
    const h = 0.1, key = (m, x) => Math.round(m / h) + ',' + Math.round(x / h), st = [sp.door[0] - 0.4, sp.door[1]], seen = new Set([key(...st)]), Q = [st];
    if (!free(...st)) bad.push('the entrance is blocked');
    while (Q.length) { const [m, x] = Q.pop(); [[h, 0], [-h, 0], [0, h], [0, -h]].forEach(([a, b]) => { const n = [m + a, x + b], kk = key(...n); if (!seen.has(kk) && free(...n)) { seen.add(kk); Q.push(n); } }); }
    const reach = (p) => { for (let a = -0.3; a <= 0.31; a += h) for (let b = -0.3; b <= 0.31; b += h) if (seen.has(key(p[0] + a, p[1] + b))) return true; return false; };
    obs.filter((q) => /^(bed|surgery|isolation|office|station|medcab|replicator)$/.test(q.k)).forEach((q) => { const sd = [-q.f[1], q.f[0]], o = q.door || 0, e = q.glass ? 0.5 : 0.55;
      if (!reach([q.c[0] + q.f[0] * (q.d / 2 + e) + sd[0] * o, q.c[1] + q.f[1] * (q.d / 2 + e) + sd[1] * o])) bad.push('no clear way to the ' + nm(q)); });
    // the surgery stands free in the ward: at least 1.0 m clear to every other fitting and to the walls
    { const sg = L.items.find((q) => q.k === 'surgery'), pd = (A, B) => Math.min(...A.map((p) => dpoly(B, p)), ...B.map((p) => dpoly(A, p)));
      its.filter((q) => !q.in && q !== sg).forEach((q) => { const d = pd(sg.poly, q.poly); if (d < 1.0) bad.push(`surgery only ${d.toFixed(2)} m from ${nm(q)}`); });
      const dw = Math.min(...sg.poly.map((p) => dpoly(sp.poly, p))); if (dw < 1.0) bad.push(`surgery only ${dw.toFixed(2)} m from a wall`); }
  }
  ok('D3 sickbay laid out: 8 ward beds, surgery, isolation and the CMO\'s office in glass, all inside, no overlaps, a clear way from the entrance to every bed, door and cabinet, the surgery 1 m clear all round', !bad.length, [...new Set(bad)].slice(0, 6).join('; ')); }
// the saucer's top stays below Deck 2's floor (depth 7.0) under Deck 2's rooms, so its skin never shows inside them
{ let worst = 99, at = ''; for (let m = 54.5; m <= 95; m += 0.5) for (let x = 0; x <= 7.5; x += 0.5) { const H = G.shipHull(m); if (x < H.w) { const t = G.shipTopAt(m, x); if (t < worst) { worst = t; at = `m ${m}, x ${x}`; } } }
  ok(`saucer top below Deck 2's floor (highest point depth ${worst.toFixed(2)} at ${at})`, worst >= 7.05, 'raise saucer.top.up less'); }
process.stdout.write(JSON.stringify(res));
