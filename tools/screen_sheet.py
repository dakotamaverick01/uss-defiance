# Captures every console display flat (straight from its canvas) and lays them out on one sheet.
# usage: python3 tools/screen_sheet.py <site_dir> <out.png> [setup_js]
# setup_js runs before capture, e.g. "setAlert('red'); simStep(5)".
import asyncio, sys, os, base64, io
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from check_stations import route, CHROME
root, out = sys.argv[1], sys.argv[2]
SETUP = sys.argv[3] if len(sys.argv) > 3 else ''
GRAB = r"""async (setup) => {
  document.getElementById('board-btn').click();
  if (setup) await (async () => { eval(setup); })();
  await new Promise((r) => setTimeout(r, 400));
  const seen = new Set(), out = [];
  for (const s of screens) {
    if (s.kind === 'keys' || seen.has(s.kind + s.title)) continue; seen.add(s.kind + s.title);
    drawScreen(s); out.push([s.title || s.kind, s.c.toDataURL('image/png')]);
  }
  return out;
}"""
async def run():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = await (await b.new_context(viewport={'width': 1280, 'height': 720})).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    await pg.add_init_script('window.PLANET_RES=256;')
    await pg.route('**/*', route); await pg.goto('https://example.test/')
    await pg.wait_for_function('typeof window.DEFIANCE_HERO === "function" && window.DEFIANCE_BAKED', timeout=180000)
    shots = await pg.evaluate(GRAB, SETUP)
    await b.close()
  ims = [(t, Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB')) for t, u in shots]
  CW, CH, cols = 420, 240, 4; rows = (len(ims) + cols - 1) // cols
  S = Image.new('RGB', (CW * cols, CH * rows), (12, 12, 12)); d = ImageDraw.Draw(S)
  for i, (t, im) in enumerate(ims):
    im.thumbnail((CW - 8, CH - 22)); x, y = (i % cols) * CW + 4, (i // cols) * CH + 18
    S.paste(im, (x, y)); d.text((x, y - 15), t, fill=(230, 230, 230))
  S.save(out); print('saved', out, len(ims), 'screens; errors:', errs)
asyncio.run(run())
