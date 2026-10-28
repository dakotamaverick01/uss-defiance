# Captures the six fixed hero shots with headless Chromium (Playwright).
# Paths to the local three.js copies are specific to the build workspace; adjust PKG128/NEW for your machine.
# usage: hero.py <site_dir> <out_prefix> [w h] [shots]
import asyncio, sys, os, mimetypes
from playwright.async_api import async_playwright
root, out = sys.argv[1], sys.argv[2]
W, H = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (1280, 720)
SHOTS = [int(x) for x in sys.argv[5].split(',')] if len(sys.argv) > 5 else [1,2,3,4,5,6]
PKG128 = '/tmp/claude-0/pw/package'; NEW = '/tmp/claude-0/pw/t186/node_modules/three'
def ctype(p): return mimetypes.guess_type(p)[0] or 'application/octet-stream'
async def route(r):
  u = r.request.url
  try:
    if os.environ.get('REAL') and 'cdn.jsdelivr.net' in u: return await r.continue_()
    if 'three.js/r128/three.min.js' in u: f = PKG128 + '/build/three.min.js'
    elif 'three@0.128.0/' in u: f = PKG128 + '/' + u.split('three@0.128.0/')[1]
    elif 'three@0.186.0/' in u: f = NEW + '/' + u.split('three@0.186.0/')[1]
    elif 'fonts.g' in u: return await r.fulfill(body='', content_type='text/css')
    elif u.startswith('https://example.test/'):
      path = u.split('https://example.test/')[1].split('?')[0] or 'index.html'; f = os.path.join(root, path)
    else: return await r.abort()
    ct = ctype(f); ct = 'application/javascript; charset=utf-8' if f.endswith('.js') else ('text/html; charset=utf-8' if f.endswith('.html') else ct)
    await r.fulfill(body=open(f, 'rb').read(), content_type=ct)
  except Exception as e:
    print('ROUTE FAIL', u, e); await r.abort()
async def run():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    mob = W < 600
    ctx = await b.new_context(viewport={'width': W, 'height': H}, has_touch=mob, is_mobile=mob, device_scale_factor=1)
    pg = await ctx.new_page(); errs = []; warns = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: (warns.append(m.text[:200]) if m.type in ('warning','error') else None))
    if os.environ.get('INIT'): await pg.add_init_script(os.environ['INIT'])
    await pg.route('**/*', route); await pg.goto('https://example.test/')
    await pg.wait_for_function('typeof window.DEFIANCE_HERO === "function" && window.DEFIANCE_BAKED && window.DEFIANCE_READY !== false', timeout=180000)
    await pg.wait_for_timeout(1500)
    if os.environ.get('PRE'): await pg.evaluate(os.environ['PRE'])
    try:
      for n in SHOTS:
        name = await pg.evaluate(f'DEFIANCE_HERO({n})'); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=f'{out}-{n}.png'); print('shot', n, name)
    except Exception as e: print('EXC', str(e)[:300])
    print('errors:', errs); print('warnings:', sorted(set(warns))[:15])
    await b.close()
asyncio.run(run())
