# Draw-call and triangle budget per deck (roadmap F3). Loads the ship headless, stands on each built deck, draws one
# frame of the scene from a typical viewpoint and reads the renderer's counters. Fails if a deck is over budget.
# usage: python3 tools/check_budget.py <site_dir> [--compare]   (--compare also loads it unbatched, for before/after)
import asyncio, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import check_stations
from check_stations import route, CHROME
root = sys.argv[1] if len(sys.argv) > 1 else '.'; check_stations.root = root
# desktop limits per deck (fail above them); the target for every deck is 450 draw calls. Deck 2 is over it until its
# light-mapped walls and floors are merged after the bake loads, and the lift car is merged (roadmap F3, part 2).
# Tighten once John's Mac and a phone are measured.
BUDGET = {'1': {'calls': 450, 'triangles': 450000}, '2': {'calls': 600, 'triangles': 450000}}
TARGET = 450
VIEWS = {'1': ([0, 1.7, 3.2], [0, 1.4, -6]), '2': ([1.3, -1.9, 3.6], [1.0, -2.6, 16])}
MEASURE = r"""(views) => { const out = {}; const cam = new THREE.PerspectiveCamera(70, 16 / 9, 0.05, 2000);
  for (const [n, [p, t]] of Object.entries(views)) { liftSetDeck(+n); scene.updateMatrixWorld(true); cam.position.set(...p); cam.lookAt(...t); cam.updateMatrixWorld();
    renderer.info.autoReset = false; renderer.info.reset(); renderer.setRenderTarget(null); renderer.render(scene, cam);
    out[n] = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }; renderer.info.autoReset = true; }
  liftSetDeck(1); return { decks: out, batch: typeof BATCH !== 'undefined' ? BATCH : null }; }"""
async def load(p, nobatch):
  b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
  pg = await (await b.new_context(viewport={'width': 1280, 'height': 720})).new_page(); errs = []
  pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
  if nobatch: await pg.add_init_script('window.DEFIANCE_NO_BATCH = 1;')
  await pg.route('**/*', route); await pg.goto('https://example.test/')
  await pg.wait_for_function('typeof window.DEFIANCE_HERO === "function" && window.DEFIANCE_BAKED', timeout=240000)
  r = await pg.evaluate(MEASURE, VIEWS); await b.close(); return r, errs
async def run():
  async with async_playwright() as p:
    bad = 0
    if '--compare' in sys.argv:
      r0, _ = await load(p, True)
      for n, v in r0['decks'].items(): print(f'unbatched Deck {n}: {v["calls"]} draw calls, {v["triangles"]} triangles')
    r, errs = await load(p, False)
    if r['batch']: print(f"batched: {r['batch']['before']} parts into {r['batch']['after']} objects")
    for n, v in r['decks'].items():
      B = BUDGET[n]; ok = v['calls'] <= B['calls'] and v['triangles'] <= B['triangles']; bad += 0 if ok else 1
      print(('PASS ' if ok else 'FAIL ') + f'Deck {n}: {v["calls"]} draw calls (limit {B["calls"]}, target {TARGET}), {v["triangles"]} triangles (limit {B["triangles"]})')
    if errs: print('FAIL page errors:', errs); bad += 1
    sys.exit(1 if bad else 0)
asyncio.run(run())
