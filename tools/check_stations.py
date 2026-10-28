# Smoke test: loads the ship at desktop and phone sizes, opens every station, presses every button, and reports errors.
# usage: python3 tools/check_stations.py <site_dir>
import asyncio, sys, os, mimetypes
from playwright.async_api import async_playwright
root = sys.argv[1] if len(sys.argv) > 1 else '.'
THREE_DIR = os.environ.get('THREE_DIR', '/tmp/claude-0/pw/t186/node_modules/three')
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome')
async def route(r):
  u = r.request.url
  try:
    if 'three@0.186.0/' in u: f = THREE_DIR + '/' + u.split('three@0.186.0/')[1]
    elif 'fonts.g' in u: return await r.fulfill(body='', content_type='text/css')
    elif u.startswith('https://example.test/'): f = os.path.join(root, u.split('https://example.test/')[1].split('?')[0] or 'index.html')
    else: return await r.abort()
    ct = 'application/javascript; charset=utf-8' if f.endswith('.js') else ('text/html; charset=utf-8' if f.endswith('.html') else (mimetypes.guess_type(f)[0] or 'application/octet-stream'))
    await r.fulfill(body=open(f, 'rb').read(), content_type=ct)
  except Exception as e: print('ROUTE FAIL', u, e); await r.abort()
PRESS_ALL = r"""async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms)); const log = [];
  document.getElementById('board-btn').click(); await wait(300);
  for (const id of Object.keys(STATIONS)) {
    openStation(id); await wait(120);
    const n = document.querySelectorAll('#p-actions button').length;
    for (let i = 0; i < n; i++) { const b = document.querySelectorAll('#p-actions button')[i]; if (b && !b.disabled) { b.click(); await wait(90); } }
    log.push(id + ':' + n); closePanel();
  }
  setAlert('green'); setLight('standard'); setSpeed('stop');
  return { stations: log, baked: window.DEFIANCE_BAKED, fps: renderer.info.render.calls };
}"""
async def run():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    for name, vw, vh, mob in (('desktop', 1280, 720, False), ('phone', 390, 844, True)):
      ctx = await b.new_context(viewport={'width': vw, 'height': vh}, has_touch=mob, is_mobile=mob, device_scale_factor=2 if mob else 1)
      pg = await ctx.new_page(); errs = []; warns = []
      pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
      pg.on('console', lambda m: (warns.append(m.text[:200]) if m.type in ('warning', 'error') else None))
      await pg.add_init_script('window.PLANET_RES=1024;')
      await pg.route('**/*', route); await pg.goto('https://example.test/')
      await pg.wait_for_function('typeof window.DEFIANCE_HERO === "function" && window.DEFIANCE_BAKED', timeout=180000)
      res = await pg.evaluate(PRESS_ALL)
      if mob: await pg.screenshot(path=os.environ.get('PHONE_SHOT', '/tmp/claude-0/phone.png'))
      print(name, res); print('  errors:', errs); print('  warnings:', sorted(set(warns))[:10])
      await ctx.close()
    await b.close()
if __name__ == "__main__": asyncio.run(run())
