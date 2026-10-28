# Step 1 of the light bake: open the ship in headless Chromium and write out its fixed geometry for Blender.
# usage: python3 tools/bake_export.py <site_dir> <work_dir>
# Writes <work_dir>/scene.json (surfaces, materials, fixtures, light-map layout) and scene.bin (vertex data).
# Needs Playwright with Chromium, and a local three@0.186.0 (npm) at THREE_DIR; see tools/hero_shots.py.
import asyncio, sys, os, json, base64, mimetypes
from playwright.async_api import async_playwright
root, work = sys.argv[1], sys.argv[2]
THREE_DIR = os.environ.get('THREE_DIR', '/tmp/claude-0/pw/t186/node_modules/three')
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome')

EXPORT_JS = r"""() => {
  scene.updateMatrixWorld(true);
  const recv = new Set(BAKE.receivers), skip = new Set();
  // moving parts are not baked: door leaves, window shutters, the cup
  DOORS.forEach((d) => [d.L, d.Rr].forEach((o) => o.traverse((c) => skip.add(c))));
  SHUTTERS.forEach((s) => s.slats.forEach((o) => skip.add(o)));
  if (typeof cupGroup !== 'undefined' && cupGroup) cupGroup.traverse((c) => skip.add(c));
  const live = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  const lin = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const avg = new Map();
  const mapAvg = (t) => {
    if (!t) return [1, 1, 1]; if (avg.has(t)) return avg.get(t);
    let r = null; const img = t.image;
    if (img && (img instanceof HTMLCanvasElement || img instanceof HTMLImageElement || img instanceof ImageBitmap)) {
      const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); g.drawImage(img, 0, 0, 32, 32);
      const d = g.getImageData(0, 0, 32, 32).data, a = [0, 0, 0];
      for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) a[k] += (t.colorSpace === THREE.SRGBColorSpace ? lin(d[i + k] / 255) : d[i + k] / 255) * d[i + 3] / 255;
      r = a.map((v) => v / 1024);
    }
    avg.set(t, r); return r;
  };
  const mul = (c, a) => [c.r * a[0], c.g * a[1], c.b * a[2]];
  const cls = (o, m) => {
    if (!m || m === MAT.hit || m.visible === false || m.isShaderMaterial) return null;
    if (m.transparent || m.blending !== THREE.NormalBlending) return null;
    if (stripMats.includes(m)) return { kind: 'emit', layer: 'S', cat: 'strip', col: [1, 1, 1] };
    if (slotMats.includes(m)) return { kind: 'emit', layer: 'W', cat: 'slot', col: m.color.toArray() };
    if (m === downlightMat) return { kind: 'emit', layer: 'W', cat: o.geometry.type === 'CircleGeometry' ? 'down' : 'panel', col: m.color.toArray() };
    if (m === lightDiscMat) return { kind: 'emit', layer: 'W', cat: 'disc', col: mul(m.color, mapAvg(m.map)) };
    if (m.isMeshBasicMaterial) {
      const c = mul(m.color, mapAvg(m.map) || [0.05, 0.07, 0.11]);
      if (c[0] + c[1] + c[2] < 0.03) return { kind: 'occ', col: [0.01, 0.01, 0.01], metal: 0, rough: 0.5 };
      return { kind: 'emit', layer: 'W', cat: 'screen', col: c };
    }
    if (m.isMeshStandardMaterial) return { kind: 'occ', col: m.userData.bakeAlbedo || mul(m.color, mapAvg(m.map) || [1, 1, 1]), metal: m.metalnessMap ? 0.5 : m.metalness, rough: Math.min(1, m.roughness * (m.roughnessMap ? 0.6 : 1)) };
    return null;
  };
  const groups = new Map(), spots = [], v = new THREE.Vector3(), nm = new THREE.Matrix3();
  const bb = new THREE.Box3();
  scene.traverse((o) => {
    if (!o.isMesh || o.layers.mask !== 1 || skip.has(o) || !live(o)) return;
    const geo = o.geometry, pos = geo.attributes.position; if (!pos) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const parts = Array.isArray(o.material) ? geo.groups : [{ start: 0, count: geo.index ? geo.index.count : pos.count, materialIndex: 0 }];
    const isR = recv.has(o), uvA = isR ? geo.attributes.uvLM : null;
    parts.forEach((pt) => {
      const c = cls(o, mats[pt.materialIndex]); if (!c) return;
      if (c.cat === 'down') {
        nm.getNormalMatrix(o.matrixWorld); const n = new THREE.Vector3().fromBufferAttribute(geo.attributes.normal, 0).applyMatrix3(nm).normalize();
        const p = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld), s = new THREE.Vector3().setFromMatrixScale(o.matrixWorld);
        spots.push({ p: p.toArray(), n: n.toArray(), r: geo.parameters.radius * s.x, room: o.parent !== scene });
      }
      const key = [c.kind, c.layer, c.cat, isR ? 'R' : '', ...c.col.map((x) => x.toFixed(3)), c.metal, c.rough].join('|');
      let g = groups.get(key); if (!g) { g = Object.assign({ recv: isR, pos: [], idx: [], uv: [] }, c); groups.set(key, g); }
      const base = g.pos.length / 3, used = new Map();
      const idx = geo.index ? geo.index.array : null;
      for (let k = pt.start; k < pt.start + pt.count; k++) {
        const vi = idx ? idx[k] : k; let ni = used.get(vi);
        if (ni === undefined) {
          ni = base + used.size; used.set(vi, ni);
          v.fromBufferAttribute(pos, vi).applyMatrix4(o.matrixWorld); g.pos.push(v.x, v.y, v.z);
          if (isR && c.kind === 'occ') { bb.expandByPoint(v); g.uv.push(uvA.getX(vi), uvA.getY(vi)); }
        }
        g.idx.push(ni);
      }
    });
  });
  const b64 = (ta) => { const u = new Uint8Array(ta.buffer); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const out = [];
  groups.forEach((g) => {
    if (g.recv && g.kind !== 'occ') g.recv = false;
    out.push({ kind: g.kind, layer: g.layer, cat: g.cat, col: g.col, metal: g.metal, rough: g.rough, recv: g.recv,
      pos: b64(new Float32Array(g.pos)), idx: b64(new Uint32Array(g.idx)), uv: g.recv ? b64(new Float32Array(g.uv)) : null });
  });
  return { groups: out, spots, atlas: BAKE.atlas, bounds: [bb.min.toArray(), bb.max.toArray()], wallH: WALL_H };
}"""

def ctype(p): return mimetypes.guess_type(p)[0] or 'application/octet-stream'
async def route(r):
  u = r.request.url
  try:
    if 'three@0.186.0/' in u: f = THREE_DIR + '/' + u.split('three@0.186.0/')[1]
    elif 'fonts.g' in u: return await r.fulfill(body='', content_type='text/css')
    elif u.startswith('https://example.test/'): f = os.path.join(root, u.split('https://example.test/')[1].split('?')[0] or 'index.html')
    else: return await r.abort()
    ct = 'application/javascript; charset=utf-8' if f.endswith('.js') else ('text/html; charset=utf-8' if f.endswith('.html') else ctype(f))
    await r.fulfill(body=open(f, 'rb').read(), content_type=ct)
  except Exception as e:
    print('ROUTE FAIL', u, e); await r.abort()

async def run():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = await (await b.new_context(viewport={'width': 1280, 'height': 720})).new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script('window.PLANET_RES=1024; window.DEFIANCE_NO_BAKE=true;')
    await pg.route('**/*', route); await pg.goto('https://example.test/')
    await pg.wait_for_function('window.DEFIANCE_BAKED', timeout=120000)
    await pg.evaluate('DEFIANCE_HERO(1)'); await pg.wait_for_timeout(1500)  # lets every screen draw once
    data = await pg.evaluate(EXPORT_JS)
    await b.close()
  if errs: print('page errors:', errs)
  os.makedirs(work, exist_ok=True)
  blob = bytearray(); meta = dict(data); meta['groups'] = []
  for g in data['groups']:
    e = {k: g[k] for k in ('kind', 'layer', 'cat', 'col', 'metal', 'rough', 'recv')}
    for k in ('pos', 'idx', 'uv'):
      if g[k]: raw = base64.b64decode(g[k]); e[k] = [len(blob), len(raw)]; blob += raw
    meta['groups'].append(e)
  open(os.path.join(work, 'scene.bin'), 'wb').write(blob)
  json.dump(meta, open(os.path.join(work, 'scene.json'), 'w'))
  print('groups', len(meta['groups']), 'spots', len(meta['spots']), 'MB', round(len(blob) / 1e6, 1), 'atlas', meta['atlas'])
asyncio.run(run())
