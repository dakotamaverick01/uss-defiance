# Renders the deck-plan page (desktop, phone, red alert) and dumps the bridge's master systems display and situation table canvases.
# usage: python3 tools/plan_shots.py <site_dir> <out_prefix> [page|msd|both]
import asyncio, sys, os, base64
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(__file__))
from check_stations import route, CHROME
root, out = sys.argv[1], sys.argv[2]
what = sys.argv[3] if len(sys.argv) > 3 else 'both'
PAGE = 'https://example.test/docs/master-systems-display.html'
MSD = r"""(red) => { setAlert(red ? 'red' : 'green'); MSD.key = ''; const s = screens.find((x) => x.kind === 'msd'); drawScreen(s); return s.c.toDataURL('image/png'); }"""
async def run():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    errs = []
    if what in ('page', 'both'):
      for name, vp, mob, red in (('desktop', (1600, 900), False, False), ('red', (1600, 900), False, True), ('phone', (390, 844), True, False)):
        ctx = await b.new_context(viewport={'width': vp[0], 'height': vp[1]}, is_mobile=mob, has_touch=mob, device_scale_factor=2 if mob else 1)
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', route); await pg.goto(PAGE); await pg.wait_for_timeout(600)
        if red: await pg.click('[data-al="red"]'); await pg.wait_for_timeout(200)
        await pg.screenshot(path=f'{out}-page-{name}.png', full_page=True); await ctx.close()
    if what in ('msd', 'both'):
      pg = await (await b.new_context(viewport={'width': 1280, 'height': 720})).new_page(); pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
      await pg.add_init_script('window.PLANET_RES=256;')
      await pg.route('**/*', route); await pg.goto('https://example.test/')
      await pg.wait_for_function('typeof window.DEFIANCE_HERO === "function" && window.DEFIANCE_BAKED', timeout=180000)
      for red in (False, True):
        u = await pg.evaluate(MSD, red)
        open(f'{out}-msd-{"red" if red else "green"}.png', 'wb').write(base64.b64decode(u.split(',')[1]))
      u = await pg.evaluate("() => { setAlert('green'); const s = screens.find((x) => x.kind === 'table'); drawScreen(s); return s.c.toDataURL('image/png'); }")
      open(f'{out}-table.png', 'wb').write(base64.b64decode(u.split(',')[1]))
    await b.close()
  print('done; errors:', errs)
asyncio.run(run())
