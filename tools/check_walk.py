# Walking feel check (roadmap 3): loads the ship headless and walks with the W key, reading the player's speed over time
# (it should build up over a few tenths of a second and stop within about a quarter second), counting footsteps (one
# per 0.75 m stride, carpet on the bridge, deck plate in the lift car), and rides the lift to Deck 3 and back.
# usage: python3 tools/check_walk.py <site_dir>    (prints PASS/FAIL lines; exits 1 on any FAIL)
import asyncio, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import check_stations
from check_stations import route, CHROME
root = sys.argv[1] if len(sys.argv) > 1 else '.'; check_stations.root = root

JS = r"""async () => {
  const out = [], ok = (n, p, i) => out.push([n, !!p, i === undefined ? '' : String(i)]), sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  // headless frames are slow: run the game on a fixed 1/30 s step and wait on game time, not the wall clock
  clock.getDelta = () => 1 / 30; const wait = async (ms) => { const e = elapsed + ms / 1000; while (elapsed < e) await sleep(10); };
  $('intro').hidden = true; player.pitch = 0;
  // the lift first (from Deck 1): stand in the car, ride to Deck 3 and back; underfoot in the car is deck plate
  player.x = (CAR.x0 + CAR.x1) / 2; player.z = (CAR.z0 + CAR.z1) / 2; walk.vx = walk.vz = 0; await wait(300); const car = surfaceUnder();
  liftGo(3); let n = 0; while (LIFT.phase !== 'moving' && n++ < 100) await wait(100); const dip0 = LIFT.dip;
  while (LIFT.phase !== 'idle' && n++ < 300) await wait(100); const at3 = LIFT.deck === 3 && LIFT.phase === 'idle', dip1 = LIFT.dip;
  player.x = (CAR.x0 + CAR.x1) / 2; player.z = (CAR.z0 + CAR.z1) / 2; liftGo(1); n = 0; while (LIFT.phase !== 'idle' && n++ < 300) await wait(100); await wait(200);
  ok('the lift rides to Deck 3 and back; its light dips as the doors seal and comes back', at3 && LIFT.deck === 1 && dip0 !== undefined && dip0 < 0.3 && dip1 >= 0.6, `deck ${LIFT.deck}, dip ${dip0 && dip0.toFixed(2)} -> ${dip1 && dip1.toFixed(2)}`);
  ok('underfoot in the lift car: deck plate', car === 'plate', car);
  // walking: down Deck 3's long aft corridor (carpet), from a standstill
  liftSetDeck(3); player.x = 0; player.z = 26; player.yaw = Math.PI; walk.vx = walk.vz = 0; await wait(300);
  const sp = () => Math.hypot(walk.vx, walk.vz), steps = []; window.footstep = (k) => steps.push(k); // count footsteps instead of playing them
  keys.KeyW = true; await wait(120); const s1 = sp(); await wait(700); const s2 = sp(); const d0 = walk.dist;
  await wait(1500); const d1 = walk.dist - d0, st = steps.length;
  keys.KeyW = false; await wait(120); const s3 = sp(); await wait(400); const s4 = sp();
  ok('walking speeds up over a few tenths of a second, then holds 2.2 m/s', s1 > 0.05 && s1 < 1.6 && Math.abs(s2 - 2.2) < 0.05, s1.toFixed(2) + ' then ' + s2.toFixed(2) + ' m/s');
  ok('stops within about a quarter second of letting go', s3 < 1.6 && s4 < 0.01, s3.toFixed(2) + ' then ' + s4.toFixed(2) + ' m/s');
  ok('a footstep every 0.75 m, on the corridor carpet', st >= Math.floor((d1 + d0) / 0.75) - 2 && st <= Math.ceil((d1 + d0) / 0.75) + 1 && steps.every((k) => k === 'carpet'), st + ' steps over ' + (d0 + d1).toFixed(2) + ' m: ' + [...new Set(steps)].join(','));
  // a wall stops you, and your speed with it
  player.yaw = Math.PI / 2; keys.KeyW = true; await wait(1500); const sw = sp(); keys.KeyW = false; await wait(400);
  ok('walking into a wall leaves no speed stored up', sw < 0.6, sw.toFixed(2) + ' m/s pressed against it');
  // underfoot: sickbay is tile, a magazine is deck plate
  const at = (label) => { const r = D3.rooms.find((q) => q.label === label); return r; };
  const sbp = D3.sickbay.wpoly.reduce((a, p) => [a[0] + p[0] / D3.sickbay.wpoly.length, a[1] + p[1] / D3.sickbay.wpoly.length], [0, 0]); player.x = sbp[0]; player.z = sbp[1]; const sb = surfaceUnder();
  const mg = D3.fitted.find((f) => f.s.n === 'Pod feeds and torpedo magazine'), mp = mg.wpoly.reduce((a, p) => [a[0] + p[0] / mg.wpoly.length, a[1] + p[1] / mg.wpoly.length], [0, 0]); player.x = mp[0]; player.z = mp[1]; const mgs = surfaceUnder();
  ok('underfoot: tile in sickbay, deck plate in the magazine', sb === 'tile' && mgs === 'plate', sb + ', ' + mgs);
  liftSetDeck(1);
  return out;
}"""

async def run():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = await (await b.new_context(viewport={'width': 1280, 'height': 720})).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    await pg.route('**/*', route); await pg.goto('https://example.test/')
    await pg.wait_for_function('typeof window.DEFIANCE_HERO === "function" && window.DEFIANCE_BAKED', timeout=240000)
    res = await pg.evaluate(JS); await b.close()
    bad = 0
    for n, okk, info in res:
      print(('PASS ' if okk else 'FAIL ') + n + (f'  [{info}]' if info else '')); bad += 0 if okk else 1
    if errs: print('page errors:', errs); bad += 1
    print(f'{len(res) - bad}/{len(res)} passed'); sys.exit(1 if bad else 0)
asyncio.run(run())
