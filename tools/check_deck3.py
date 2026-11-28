# Deck 3 check: loads the ship, rides to Deck 3 and checks the corridors built from the floor plan (deck3.js, kit.js):
# the layout closes up, every corridor piece has full headroom and stays out of the rooms, every room's door sits in
# that room's wall and can be walked to from the lift, the lift doors and stations are in place.
# usage: python3 tools/check_deck3.py <site_dir>    (prints PASS/FAIL lines; exits 1 on any FAIL)
import asyncio, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check_stations import route, CHROME
root = sys.argv[1] if len(sys.argv) > 1 else '.'
import check_stations; check_stations.root = root

CHECK_JS = r"""() => {
  const out = [], ok = (name, pass, info) => out.push([name, !!pass, info === undefined ? '' : String(info)]);
  deckBuild(2); liftSetDeck(3);
  const Lt = D3.layout, F = Lt.F, W = Lt.W, w2p = (x, z) => [z + 64, x]; // world to plan [m, x]
  const inPoly = (P, m, x) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [am, ax] = P[i], [bm, bx] = P[j]; if ((ax > x) !== (bx > x) && m < (bm - am) * (x - ax) / (bx - ax) + am) c = !c; } return c; };
  ok('Deck 3 built and shown', deckOf(3).made && DECK3.visible && !LIFT.stub.visible);
  ok('Lift 1 opens on Deck 3', LIFT_DECKS[2].built && deckOf(3).door() && D3.door.L && D3.door.Rr);
  ok('corridor drawn as instances', D3.mods.length > 0 && D3.mods.every((m) => m.isInstancedMesh), D3.mods.length + ' instanced meshes, ' + new Set(D3.mods.map((m) => m.name)).size + ' variants');
  // the layout closes up: the ring goes all the way round, each spoke run is covered end to end
  { const ring = Lt.mods.filter((d) => d.ring); ok('ring of 48 pieces, 4 of them crossings; a crossing at the centre', ring.length === 48 && ring.filter((d) => d.cross).length === 4 && Lt.mods.filter((d) => d.centre).length === 1);
    const bad = []; F.P.spokes.forEach(([a, end]) => { [[W, Lt.dc - W], [Lt.dc + W, end]].forEach(([t0, t1]) => {
      const ms = Lt.mods.filter((d) => d.spoke === a && d.t > t0 && d.t < t1), len = ms.reduce((s, d) => s + d.lin * d.sz, 0);
      if (Math.abs(len - (t1 - t0)) > 0.01) bad.push(`spoke ${a}: ${len.toFixed(2)} of ${(t1 - t0).toFixed(2)} m`); }); });
    ok('every spoke run covered end to end', !bad.length, bad.join('; ')); }
  // sample each corridor piece's floor (inset 0.15 m): full headroom, and inside no room
  { const head = [], clash = new Set();
    Lt.mods.forEach((d, i) => { for (let a = -W + 0.15; a <= W - 0.15; a += 0.35) for (let b = -0.45; b <= 0.45; b += 0.3) {
      const h = (a < 0 ? d.lin : d.lout) * d.sz * b, x = d.x + d.ax[0] * a + d.az[0] * h, z = d.z + d.ax[1] * a + d.az[1] * h, [m, px] = w2p(x, z);
      if (shipSkinTop(m, px) > F.limCorr + 1e-6) head.push(`piece ${i} at m ${m.toFixed(1)}, x ${px.toFixed(1)}`);
      F.spaces.forEach((s) => { if (s.t !== 'c' && inPoly(s.poly, m, px)) clash.add((s.id || s.n) + ' / piece ' + i); }); } });
    ok('full headroom along every corridor piece', !head.length, head.slice(0, 5).join('; '));
    ok('no corridor piece reaches into a room', !clash.size, [...clash].slice(0, 6).join('; ')); }
  // every room's door: placed, in its own wall (the whole 1.2 m opening backs onto the room), a sealed labelled door
  { const want = F.spaces.filter((s) => s.door && s.t !== 'c' && s.t !== 'v' && s.n !== 'Lift 1'), bad = [], far = [];
    want.forEach((s) => { const d = D3.doors.find((q) => q.s === s); if (!d) { bad.push((s.id || s.n) + ' missing'); return; }
      const n = [Math.sin(d.rot), Math.cos(d.rot)], t = [n[1], -n[0]];
      [-0.55, 0, 0.55].forEach((u) => { const x = d.x - n[0] * 0.35 + t[0] * u, z = d.z - n[1] * 0.35 + t[1] * u; if (!inPoly(s.poly, ...w2p(x, z))) bad.push(`${s.id || s.n} opening at ${u}`); });
      const dd = DOORS.find((q) => q.station === 'd3:' + (s.id || s.n)); if (!dd || dd.deck !== 3 || dd.auto !== !!s.b) bad.push((s.id || s.n) + ' door object'); // fitted cabins open, other rooms stay sealed
      const st = STATIONS['d3:' + (s.id || s.n)]; try { if (!st || !st.panel().read.length) bad.push((s.id || s.n) + ' station'); } catch (e) { bad.push((s.id || s.n) + ' panel ' + e.message); }
      if (d.moved > 1.3) far.push(`${s.id || s.n} ${d.moved.toFixed(2)} m`); });
    ok(`every room has its door in its own wall (${want.length} doors)`, !bad.length, bad.slice(0, 6).join('; '));
    ok('no door moved more than 1.3 m from the plan to fit a corridor piece', !far.length, far.join('; ')); }
  // walk from the lift to the front of every door, over a grid of the corridor floor, moving with the game's collision
  { const cells = new Map(), key = (x, z) => Math.round(x / 0.25) + ',' + Math.round(z / 0.25);
    Lt.mods.forEach((d) => { const e = d.L === 'o' && d.R === 'o' ? 0.05 : 0.4; for (let a = -W + e; a <= W - e; a += 0.2) for (let b = -0.5; b <= 0.5; b += 0.08) {
      const h = (a < 0 ? d.lin : d.lout) * d.sz * b, x = d.x + d.ax[0] * a + d.az[0] * h, z = d.z + d.ax[1] * a + d.az[1] * h; cells.set(key(x, z), [Math.round(x / 0.25) * 0.25, Math.round(z / 0.25) * 0.25]); } });
    D3.rooms.filter((r) => r.label === 'Lift 1 lobby').forEach((r) => { for (let x = r.x0 + 0.4; x < r.x1 - 0.4; x += 0.25) for (let z = r.z0 + 0.4; z < r.z1 - 0.4; z += 0.25) cells.set(key(x, z), [Math.round(x / 0.25) * 0.25, Math.round(z / 0.25) * 0.25]); });
    const moveOk = ([ax, az], [bx, bz]) => { let x = ax, z = az; for (let k = 0; k < 12; k++) { const dx = bx - x, dz = bz - z, d = Math.hypot(dx, dz); if (d < 0.02) break; [x, z] = collide(x + dx / d * Math.min(0.04, d), z + dz / d * Math.min(0.04, d)); } return Math.hypot(bx - x, bz - z) < 0.05; };
    const start = key(LIFT_DX, LIFT_DZ - 1.2), seen = new Set([start]), q = [start];
    while (q.length) { const k = q.shift(), [x, z] = cells.get(k); [[0.25, 0], [-0.25, 0], [0, 0.25], [0, -0.25]].forEach(([dx, dz]) => { const nk = key(x + dx, z + dz); if (cells.has(nk) && !seen.has(nk) && moveOk([x, z], cells.get(nk))) { seen.add(nk); q.push(nk); } }); }
    const unreached = D3.doors.filter((d) => { const n = [Math.sin(d.rot), Math.cos(d.rot)], tx = d.x + n[0] * 0.75, tz = d.z + n[1] * 0.75;
      return ![...seen].some((k) => { const [x, z] = cells.get(k); return Math.hypot(x - tx, z - tz) < 0.3; }); }).map((d) => d.s.id || d.s.n);
    ok(`every door can be walked to from Lift 1 (${seen.size} of ${cells.size} floor cells reached)`, cells.has(start) && !unreached.length, unreached.join(', ')); }
  // B2b: signs where each stretch of corridor leaves a crossing, a frame number on every walled frame, wall screens and
  // benches against a wall (never a door), a call panel beside every room door on Decks 2 and 3, section colour bands
  { const legs = new Set(Lt.mods.filter((d) => d.leg).map((d) => d.leg)), want = [...legs].reduce((s, k) => s + (k[0] === 'o' ? 1 : 2), 0);
    ok(`a sign at each crossing end of every corridor stretch (${want})`, D3.signs.length === want && D3.signs.every((S) => S.items.length || /SPOKE/.test(S.name)), D3.signs.length);
    ok('Lift 1 shown on the signs pointing toward it', D3.signs.filter((S) => S.lift).length === 5, D3.signs.filter((S) => S.lift).length);
    const plates = Lt.mods.filter((d) => d.frame && d.L !== 'o').length, frames = new Set(Lt.mods.filter((d) => d.frame).map((d) => d.frame));
    ok(`frame numbers on ${plates} frames, all different`, plates > 100 && frames.size === Lt.mods.filter((d) => d.frame).length && D3.atlas && D3.atlas.isMesh, plates);
    const badW = D3.screens.concat(D3.benches).filter((p) => (p.sd < 0 ? p.d.L : p.d.R) !== 'w');
    ok(`${D3.screens.length} wall screens and ${D3.benches.length} benches, each against a plain wall`, D3.screens.length >= 8 && D3.benches.length >= 4 && !badW.length);
    const bells = (n) => DOORS.filter((d) => d.deck === n && d.room && d.station !== 'lift').map((d) => { let k = 0; d.L.parent.children.forEach((c) => { if (c.material === DOORBELL.mat) k++; }); return k; });
    ok('a call panel beside every room door on Decks 2 and 3', [2, 3].every((n) => bells(n).length && bells(n).every((k) => k === 1)), [2, 3].map((n) => bells(n).join('')).join(' / '));
    const bands = D3.mods.filter((m) => m.material === CKIT.band);
    ok('section colour bands on every walled corridor piece', bands.length && bands.every((m) => m.instanceColor && m.instanceColor.count === m.count)); }
  // light: worked out for the deck (no Blender bake files, no light-mapped surfaces), the probe grid covers every
  // corridor piece, and under a ceiling panel the floor is brighter than the ceiling
  { const D = BKD[3], g = D && D.meta.grid, inG = (x, z) => x >= g.origin[0] && x <= g.origin[0] + (g.dims[0] - 1) * g.step && z >= g.origin[2] && z <= g.origin[2] + (g.dims[2] - 1) * g.step;
    ok('Deck 3 lit by its computed probes', D && D.computed && BAKE.decks[3].ok && BAKE.decks[3].receivers.length === 0 && BKU.bkPr.value === D.pr);
    ok('probe grid covers every corridor piece', g && Lt.mods.every((d) => inG(d.x, d.z)));
    const L = d3Light(), [X, Y] = L.dims, d = Lt.mods.find((m) => m.spoke === 0 && m.full), ix = Math.round((d.x - L.origin[0]) / L.step), iz = Math.round((d.z - L.origin[2]) / L.step);
    const v = (iy, f) => L.data[((iz * Y + iy) * 6 * X + f * X + ix) * 4 + 1];
    ok('floor under a panel brighter than the ceiling, the ceiling lit', v(0, 2) > v(Y - 1, 3) && v(Y - 1, 3) > 20, `floor ${v(0, 2)}, ceiling ${v(Y - 1, 3)}`); }
  // C: cabins fitted out: every cabin has its shell, its fittings (a bed per berth, its head), a ceiling light, an
  // opening door, and you can walk in through it
  { const cabs = F.spaces.filter((s) => s.b), bad = [];
    const count = (k) => D3.cabinProps[k] ? D3.cabinProps[k][0].count : 0;
    ok(`all ${cabs.length} cabins fitted`, D3.cabins.length === cabs.length, D3.cabins.length);
    const beds = count('bed') + 2 * count('bunk'), berths = cabs.reduce((a, s) => a + s.b, 0);
    ok(`a bed for every berth (${berths}), a head, desk, wardrobe and light in every cabin`, beds >= berths && ['toilet', 'basin', 'shower', 'sliding', 'cabinlight', 'wardrobe'].every((k) => count(k) === cabs.length) && count('desk') >= cabs.length - 2,
      `beds ${beds}, toilets ${count('toilet')}, lights ${count('cabinlight')}, desks ${count('desk')}`);
    DOORS.forEach((d) => { if (d.deck === 3 && d.auto) d.open = 1; });
    cabs.forEach((s) => { const d = D3.doors.find((q) => q.s === s), dd = DOORS.find((q) => q.station === 'd3:' + s.id); if (!dd || !dd.auto) { bad.push(s.id + ' door shut'); return; }
      const n = [Math.sin(d.rot), Math.cos(d.rot)]; let x = d.x + n[0] * 0.75, z = d.z + n[1] * 0.75; const tx = d.x - n[0] * 1.2, tz = d.z - n[1] * 1.2;
      for (let k = 0; k < 80; k++) { const dx = tx - x, dz = tz - z, l = Math.hypot(dx, dz); if (l < 0.03) break; [x, z] = collide(x + dx / l * Math.min(0.04, l), z + dz / l * Math.min(0.04, l)); }
      if (Math.hypot(tx - x, tz - z) > 0.08) bad.push(`${s.id} stuck at ${x.toFixed(2)},${z.toFixed(2)}`);
      else { player.x = tx; player.z = tz; if (!/cabin/i.test(liftLocation())) bad.push(s.id + ' readout ' + liftLocation()); } });
    DOORS.forEach((d) => { if (d.deck === 3) d.open = 0; });
    ok('walk into every cabin through its door; the readout names it', !bad.length, bad.slice(0, 6).join('; '));
    ok('cabins lit by their own lights (one light space each)', D3.cabins.every((c) => c.lights.length === 2)); }
  // the location readout knows the corridors
  { const was = [player.x, player.z]; const at = (x, z) => { player.x = x; player.z = z; return liftLocation(); };
    const r = [at(LIFT_DX, LIFT_DZ - 1.5), at(...[Math.sin(0.5) * Lt.dc, Math.cos(0.5) * Lt.dc - 6]), at(0, 60)]; [player.x, player.z] = was;
    ok('location readout: lobby, ring, aft corridor', /Lift 1 lobby/.test(r[0]) && /Ring corridor/.test(r[1]) && /Aft corridor/.test(r[2]), r.join(' | ')); }
  liftSetDeck(1);
  return out;
}"""

async def run():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    ctx = await b.new_context(viewport={'width': 1280, 'height': 720}); pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    await pg.add_init_script('window.DEFIANCE_NO_BATCH = 1;')
    await pg.route('**/*', route); await pg.goto('https://example.test/')
    await pg.wait_for_function('typeof window.DEFIANCE_HERO === "function" && window.DEFIANCE_BAKED', timeout=180000)
    res = await pg.evaluate(CHECK_JS); await b.close()
  bad = 0
  for name, ok, info in res:
    print(('PASS ' if ok else 'FAIL ') + name + (('  [' + info + ']') if info else '')); bad += 0 if ok else 1
  if errs: print('FAIL page errors:', errs); bad += 1
  print(f'{len(res) - bad}/{len(res)} passed'); sys.exit(1 if bad else 0)
if __name__ == '__main__': asyncio.run(run())
