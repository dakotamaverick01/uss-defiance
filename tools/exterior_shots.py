# Renders the exterior model from fixed outside viewpoints (stern, belly, docking rim, pod, three-quarter, bay mouth)
# with headless Chromium: the ship is lifted out of Deck 2 into its own scene with a star field and drawn from each camera.
# usage: python3 tools/exterior_shots.py <site_dir> <out_prefix> [w h] [views]
#   env PRE: JavaScript run before the shots (e.g. "state.bayDoors = true; cur.speed = 12"); env PHONE=1 builds the lite model
import asyncio, sys, os, base64
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import check_stations
from check_stations import route, CHROME
root, out = sys.argv[1], sys.argv[2]
check_stations.root = root
W, H = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (1280, 720)
# Deck 2 frame: x starboard, y up (y = 7 - depth), z aft (z = m - 64)
VIEWS = [
  ('Three-quarter, forward starboard', [118, 42, -118], [0, -6, 42], 30),
  ('Stern, aft starboard quarter', [62, 18, 236], [0, -12, 112], 30),
  ('Belly, from below port', [-92, -86, 70], [0, -18, 66], 34),
  ('Aft rim, port side (docking port)', [-98, 6, 64], [-40, -6, 28], 30),
  ('Weapons pod and rollbar', [46, 44, 18], [0, 8, 74], 32),
  ('Bay mouth, dead astern', [8, -10, 205], [0, -15, 132], 26),
  ('Starboard docking port, close', [60, 3, 41], [41, -5.5, 25], 26),
  ('Belly: hangar doors, ventral collar, tractor', [-52, -62, -14], [0, -18, 34], 42),
  ('Stern quarter, close: bay doors and impulse', [40, -2, 182], [0, -13, 140], 34),
]
SEL = [int(x) for x in sys.argv[5].split(',')] if len(sys.argv) > 5 else list(range(1, len(VIEWS) + 1))
SHOT = r"""([p, t, fov, w, h]) => {
  if (!window._xs) {
    const sc = new THREE.Scene(); sc.background = new THREE.Color(0x000000); const ext = window.PHONE_EXT || EXTSET; sc.add(ext); ext.position.set(0, 0, 0); ext.rotation.set(0, 0, 0); ext.updateMatrixWorld(true);
    const n = 3000, pos = new Float32Array(n * 3), rnd = mulberry(77);
    for (let i = 0; i < n; i++) { const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u); pos.set([Math.cos(a) * s * 3000, u * 3000, Math.sin(a) * s * 3000], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sc.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.4, sizeAttenuation: false, color: 0x9aa4b4 })));
    window._xs = { sc, cam: new THREE.PerspectiveCamera(30, w / h, 0.5, 8000) };
  }
  const { sc, cam } = window._xs, xu = (window.PHONE_EXT || EXTSET).userData; if (xu.update) xu.update(10, 0.25); cam.fov = fov; cam.aspect = w / h; cam.position.set(...p); cam.lookAt(...t); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  sc.traverse((o) => { if (o.onBeforeRender && o.isMesh) {} });
  renderer.setRenderTarget(null); renderer.setSize(w, h, false); renderer.render(sc, cam);
  return renderer.domElement.toDataURL('image/png');
}"""
async def run():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = await (await b.new_context(viewport={'width': W, 'height': H})).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    await pg.add_init_script('window.PLANET_RES=256;')
    await pg.route('**/*', route); await pg.goto('https://example.test/')
    await pg.wait_for_function('typeof window.DEFIANCE_HERO === "function" && window.DEFIANCE_BAKED && typeof EXTSET !== "undefined"', timeout=240000)
    await pg.wait_for_timeout(4000)  # the baked plating patch and the hull font arrive
    if os.environ.get('PHONE'): await pg.evaluate('window.PHONE_EXT = buildExterior({ lite: true })')
    await pg.evaluate("DEFIANCE_HERO(1)")
    if os.environ.get('PRE'): await pg.evaluate(os.environ['PRE']); await pg.wait_for_timeout(int(os.environ.get('WAIT', '1500')))
    for i in SEL:
      name, cp, ct, fov = VIEWS[i - 1]
      u = await pg.evaluate(SHOT, [cp, ct, fov, W, H])
      open(f'{out}-{i}.png', 'wb').write(base64.b64decode(u.split(',')[1])); print('shot', i, name)
    tris = await pg.evaluate('(window.PHONE_EXT || EXTSET).userData.triangles')
    print('triangles', round(tris)); print('errors:', errs)
    await b.close()
asyncio.run(run())
