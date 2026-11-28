# Outside view check (roadmap 4, exterior stage 4; orbit.js): open it from its button, the view runs and draws her,
# drag turns it, scroll zooms it, the walking keys and the inside stay as they were, closing puts you back where you were.
# usage: python3 tools/check_orbit.py <site_dir>    (prints PASS/FAIL lines; exits 1 on any FAIL)
import asyncio, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import check_stations
from check_stations import route, CHROME
root = sys.argv[1] if len(sys.argv) > 1 else '.'; check_stations.root = root
JS = r"""async () => { const out = [], ok = (n, p, i) => out.push([n, !!p, i === undefined ? '' : String(i)]), sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  $('intro').hidden = true; const before = JSON.stringify([player.x, player.z, player.yaw, player.pitch, LIFT.deck]);
  ok('an Outside view button in the top bar', document.getElementById('orbit-btn'));
  document.getElementById('orbit-btn').click(); let n = 0; while (!ORBIT.model && n++ < 200) await sleep(100);
  const t0 = ORBIT.t; await sleep(1500);
  ok('the outside view opens and runs, with her own model', ORBIT.on && ORBIT.model && ORBIT.t > t0 && !document.getElementById('orbit').hidden && document.body.classList.contains('orbiting'), ORBIT.model && Math.round(ORBIT.model.userData.triangles) + ' triangles, ' + ORBIT.tier);
  const el = document.getElementById('orbit'), y0 = ORBIT.yaw, ev = (type, x, y) => el.dispatchEvent(new PointerEvent(type, { pointerId: 1, clientX: x, clientY: y, bubbles: true }));
  ev('pointerdown', 400, 300); ev('pointermove', 520, 320); ev('pointerup', 520, 320); const d0 = ORBIT.dist;
  el.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true }));
  ok('drag turns round her, scroll comes closer', ORBIT.yaw !== y0 && ORBIT.dist < d0, `yaw ${y0.toFixed(2)} -> ${ORBIT.yaw.toFixed(2)}, distance ${d0.toFixed(0)} -> ${ORBIT.dist.toFixed(0)}`);
  keys.KeyW = true; await sleep(600); keys.KeyW = false; const still = JSON.stringify([player.x, player.z, player.yaw, player.pitch, LIFT.deck]) === before;
  ok('walking keys do nothing while you are outside', still);
  document.getElementById('orbit-close').click(); await sleep(400);
  ok('Back inside puts you where you were', !ORBIT.on && el.hidden && !document.body.classList.contains('orbiting') && JSON.stringify([player.x, player.z, player.yaw, player.pitch, LIFT.deck]) === before);
  return out; }"""
async def run():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = await (await b.new_context(viewport={'width': 1280, 'height': 720})).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    await pg.route('**/*', route); await pg.goto('https://example.test/')
    await pg.wait_for_function('typeof window.DEFIANCE_HERO === "function" && window.DEFIANCE_BAKED', timeout=240000)
    res = await pg.evaluate(JS); await b.close(); bad = 0
    for n, okk, info in res: print(('PASS ' if okk else 'FAIL ') + n + (f'  [{info}]' if info else '')); bad += 0 if okk else 1
    if errs: print('page errors:', errs); bad += 1
    print(f'{len(res) - bad}/{len(res)} passed'); sys.exit(1 if bad else 0)
asyncio.run(run())
