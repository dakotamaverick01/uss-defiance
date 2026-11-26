# Deck 2 check: loads the ship, rides to Deck 2 and checks the part-2 rooms, stations, directory data and walkways.
# usage: python3 tools/check_deck2.py <site_dir>    (prints PASS/FAIL lines; exits 1 on any FAIL)
import asyncio, sys, os, json
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check_stations import route, CHROME
root = sys.argv[1] if len(sys.argv) > 1 else '.'
import check_stations; check_stations.root = root

CHECK_JS = r"""() => {
  const out = [], ok = (name, pass, info) => out.push([name, !!pass, info === undefined ? '' : String(info)]);
  liftSetDeck(2);
  const want = ['First officer’s quarters', 'Senior officers’ cabin 1', 'Senior officers’ cabin 2', 'Officers’ passage', 'Observation lounge'];
  const labels = D2.rooms.map((r) => r.label);
  want.forEach((w) => ok('room ' + w, labels.includes(w)));
  ['xoq', 'so1q', 'so2q', 'capbank', 'lngdoor', 'xodesk', 'so1desk', 'so2desk', 'xogalley', 'lgalley', 'lounge'].forEach((s) => ok('station ' + s, STATIONS[s]));
  ok('d2sealed retired', !STATIONS.d2sealed);
  ok('no sealed rooms on Deck 2', LIFT_DECKS[1].sealed.length === 0, LIFT_DECKS[1].sealed.join(','));
  ['xoq', 'so1q', 'so2q', 'lngdoor'].forEach((s) => { const d = DOORS.find((q) => q.station === s); ok('auto door ' + s, d && d.auto && d.deck === 2); });
  { const d = DOORS.find((q) => q.station === 'capbank'); ok('capacitor door sealed', d && !d.auto); }
  // walk: auto doors open, sealed ones stay shut
  DOORS.forEach((d) => { if (d.deck === 2 && d.auto) d.open = 1; });
  const room = (l) => D2.rooms.find((r) => r.label === l);
  const walk = (name, pts, label) => {
    let [x, z] = pts[0];
    for (let i = 1; i < pts.length; i++) {
      const [tx, tz] = pts[i]; let stuck = 0, best = 1e9;
      for (let k = 0; k < 4000; k++) {
        const dx = tx - x, dz = tz - z, d = Math.hypot(dx, dz); if (d < 0.08) break;
        [x, z] = collide(x + dx / d * 0.04, z + dz / d * 0.04);
        if (d < best - 0.005) { best = d; stuck = 0; } else if (++stuck > 60) { ok('walk ' + name, false, `stuck near ${x.toFixed(2)},${z.toFixed(2)} heading for ${tx},${tz}`); return; }
      }
    }
    const r = room(label); ok('walk ' + name, r && x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1, `${x.toFixed(2)},${z.toFixed(2)}`);
  };
  walk('first officer day cabin', [[1.3, 5.0], [1.3, 9.6], [-1.0, 9.6], [-2.5, 8.0]], 'First officer’s quarters');
  walk('first officer sleeping cabin', [[1.3, 5.0], [1.3, 9.6], [-1.0, 9.6], [-1.1, 11.2], [-1.1, 12.8], [-2.5, 13.6]], 'First officer’s quarters');
  walk('senior cabin 1', [[1.3, 5.0], [1.3, 7.2], [3.4, 7.2], [4.3, 5.4]], 'Senior officers’ cabin 1');
  walk('senior cabin 2', [[1.3, 5.0], [1.3, 12.0], [3.4, 12.0], [4.3, 13.8]], 'Senior officers’ cabin 2');
  walk('passage', [[1.3, 5.0], [1.3, 15.8], [-1.5, 15.8], [-4.3, 15.8], [-4.3, 22.0]], 'Officers’ passage');
  walk('lounge', [[1.3, 5.0], [1.3, 15.8], [-1.5, 15.8], [-4.3, 15.8], [-4.3, 24.0], [-4.3, 25.6], [0.0, 27.4]], 'Observation lounge');
  walk('wardroom', [[1.3, 5.0], [1.3, 16.5], [1.3, 18.2]], 'Officers’ wardroom');
  // the set piece outside the lounge: inside DECK2, no baked (standard) materials
  const ext = typeof EXTSET !== 'undefined' ? EXTSET : null; let std = 0, tris = 0;
  if (ext) ext.traverse((o) => { if (o.isMesh) { if (o.material.isMeshStandardMaterial) std++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
  ok('set piece exists inside Deck 2', ext && (() => { for (let p = ext; p; p = p.parent) if (p === DECK2) return true; return false; })());
  ok('set piece has no baked materials', ext && std === 0, std);
  ok('set piece under 20k triangles', ext && tris < 20000, Math.round(tris));
  liftSetDeck(1);
  return out;
}"""

async def run():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    ctx = await b.new_context(viewport={'width': 1280, 'height': 720}); pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    await pg.route('**/*', route); await pg.goto('https://example.test/')
    await pg.wait_for_function('typeof window.DEFIANCE_HERO === "function" && window.DEFIANCE_BAKED', timeout=180000)
    res = await pg.evaluate(CHECK_JS); await b.close()
  bad = 0
  for name, ok, info in res:
    print(('PASS ' if ok else 'FAIL ') + name + (('  [' + info + ']') if info else '')); bad += 0 if ok else 1
  if errs: print('FAIL page errors:', errs); bad += 1
  print(f'{len(res) - bad}/{len(res)} passed'); sys.exit(1 if bad else 0)
if __name__ == '__main__': asyncio.run(run())
