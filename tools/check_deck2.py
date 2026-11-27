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
  ['xoq', 'so1q', 'so2q', 'capbank', 'lngdoor', 'wlink', 'xodesk', 'so1desk', 'so2desk', 'xogalley', 'lgalley', 'lounge'].forEach((s) => ok('station ' + s, STATIONS[s]));
  ok('d2sealed retired', !STATIONS.d2sealed);
  ok('no sealed rooms on Deck 2', LIFT_DECKS[1].sealed.length === 0, LIFT_DECKS[1].sealed.join(','));
  ['xoq', 'so1q', 'so2q', 'lngdoor'].forEach((s) => { const d = DOORS.find((q) => q.station === s); ok('auto door ' + s, d && d.auto && d.deck === 2); });
  { const d = DOORS.find((q) => q.station === 'capbank'); ok('capacitor door sealed', d && !d.auto); }
  // the Lift 1 shaft stands on every deck: no room but the lobby may overlap it
  { const xs = LIFT.carSegs.flatMap((q) => [q[0], q[2]]), zs = LIFT.carSegs.flatMap((q) => [q[1], q[3]]), a = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
    const hit = D2.rooms.filter((r) => r.label !== 'Lift 1 lobby' && r.x0 < a[1] && r.x1 > a[0] && r.z0 < a[3] && r.z1 > a[2] + 0.05).map((r) => r.label);
    ok('no room overlaps the lift shaft', hit.length === 0, hit.join(',')); }
  // walk: auto doors open, sealed ones stay shut
  DOORS.forEach((d) => { if (d.deck === 2 && d.auto) d.open = 1; });
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
    const inR = D2.rooms.some((r) => r.label === label && x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1); ok('walk ' + name, inR, `${x.toFixed(2)},${z.toFixed(2)}`);
  };
  walk('first officer day cabin', [[1.3, 5.0], [1.3, 9.6], [-1.0, 9.6], [-1.9, 10.2]], 'First officer’s quarters');
  walk('first officer sleeping cabin', [[1.3, 5.0], [1.3, 9.6], [-1.0, 9.6], [-2.15, 10.4], [-2.15, 12.0], [-2.15, 13.3], [-2.6, 13.9]], 'First officer’s quarters');
  walk('senior cabin 1', [[1.3, 5.0], [1.3, 7.2], [3.4, 7.2], [4.3, 5.4]], 'Senior officers’ cabin 1');
  walk('senior cabin 2', [[1.3, 5.0], [1.3, 12.0], [3.4, 12.0], [4.3, 13.8]], 'Senior officers’ cabin 2');
  walk('passage', [[1.3, 5.0], [1.3, 15.8], [-1.5, 15.8], [-4.3, 15.8], [-4.3, 22.0]], 'Officers’ passage');
  walk('lounge', [[1.3, 5.0], [1.3, 15.8], [-1.5, 15.8], [-4.3, 15.8], [-4.3, 24.0], [-4.3, 25.6], [-1.0, 26.0], [0.0, 28.6]], 'Observation lounge');
  walk('wardroom', [[1.3, 5.0], [1.3, 16.5], [1.3, 18.2]], 'Officers’ wardroom');
  walk('wardroom to lounge through the double doors', [[1.3, 5.0], [1.3, 16.5], [1.3, 18.2], [-2.5, 18.6], [-2.5, 23.3], [1.3, 23.6], [1.3, 26.0]], 'Observation lounge');
  { const d = DOORS.find((q) => q.station === 'wlink'); ok('wardroom-lounge double doors (2 m, auto)', d && d.auto && d.deck === 2 && Math.abs(d.q * 4 - 2.0) < 0.01, d && (d.q * 4).toFixed(2)); }
  // nothing standing in a room reaches through its walls: anything whose centre is well inside a room (so not a door,
  // frame, sign or window, which sit in the walls on purpose) must stay within the room's outline plus the 6 cm inset
  { const B = new THREE.Box3(), c = new THREE.Vector3(), walls = new Set([d2RoomWall, d2CorrWall]), bad = new Set(); DECK2.updateMatrixWorld(true);
    DECK2.traverse((o) => { if (!o.isMesh || walls.has(o.material) || !o.visible || (o.material.isMeshBasicMaterial && o.material.transparent)) return; for (let p = o; p; p = p.parent) if (p === EXTSET) return;
      B.setFromObject(o); B.getCenter(c); const r = D2.rooms.find((q) => c.x > q.x0 + 0.15 && c.x < q.x1 - 0.15 && c.z > q.z0 + 0.15 && c.z < q.z1 - 0.15); if (!r) return;
      const ov = Math.max(r.x0 - B.min.x, B.max.x - r.x1, r.z0 - B.min.z, B.max.z - r.z1); if (ov > 0.06) bad.add(r.label + '@' + c.x.toFixed(1) + ',' + c.z.toFixed(1)); });
    ok('nothing pokes through a wall', bad.size === 0, [...bad].slice(0, 8).join(' ')); }
  // handrails stop at doorways (door jambs reach the clear opening's half-width + 0.22 m from the door's centre)
  { const hit = []; D2.rails.forEach(([x, p, q]) => DOORS.forEach((d) => { if (d.deck !== 2 || Math.abs(d.wx - x) > 0.3) return; const h = d.q * 2 + 0.22; if (p < d.wz + h && q > d.wz - h) hit.push(d.station); }));
    ok('no handrail across a doorway', hit.length === 0, hit.join(',')); }
  // signs hang clear of the structural frames
  { const A = new THREE.Box3(), F = new THREE.Box3(), hit = []; DECK2.updateMatrixWorld(true);
    D2.labels.forEach((l) => { A.setFromObject(l); DECK2.traverse((o) => { if (o.isMesh && o.material === MAT.gunDark && o.geometry.type !== 'PlaneGeometry') { F.setFromObject(o); if (A.intersectsBox(F)) hit.push(l.position.x.toFixed(1) + ',' + l.position.z.toFixed(1)); } }); });
    ok('no sign crosses a frame', hit.length === 0, [...new Set(hit)].join(' ')); }
  // the exterior spine (SHIPGEO.spine) encloses every room of Decks 1 and 2, so from outside no room shows through
  { liftSetDeck(1); LIFT.deck1.visible = DECK2.visible = true; scene.updateMatrixWorld(true); const v = new THREE.Vector3(), out = new Set();
    [LIFT.deck1, DECK2].forEach((R) => R.traverse((o) => { if (!o.isMesh || !o.geometry.attributes.position || (o.material && o.material.type === 'ShaderMaterial')) return;
      for (let p = o; p; p = p.parent) if (p === EXTSET || (p.userData && p.userData.keep)) return;
      const pos = o.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        if (Math.abs(v.x) > 18 || v.y > 9 || v.y < -4) continue; const m = v.z + 64; if (m < 40 || m > 105) continue;
        if (shipSpineField(m)(v.x, 3.5 - v.y) >= 1) out.add(m.toFixed(0) + ':' + v.x.toFixed(0) + ',' + (3.5 - v.y).toFixed(0)); } }));
    liftSetDeck(2); ok('every Deck 1-2 room inside the spine', out.size === 0, [...out].slice(0, 8).join(' ')); }
  // the lift car has its own doors, shut whenever the landing doors are
  ok('lift car doors', LIFT.carDoor && Math.abs(LIFT.carDoor.L.position.x - (LIFT_DX - 0.3 - LIFT.door * 0.56)) < 0.01, LIFT.carDoor ? 'ok' : 'missing');
  // the exterior model outside the windows: inside DECK2, no baked (standard) materials
  const ext = typeof EXTSET !== 'undefined' ? EXTSET : null; let std = 0, tris = 0;
  if (ext) ext.traverse((o) => { if (o.isMesh) { if (o.material.isMeshStandardMaterial) std++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
  ok('set piece exists inside Deck 2', ext && (() => { for (let p = ext; p; p = p.parent) if (p === DECK2) return true; return false; })());
  ok('set piece has no baked materials', ext && std === 0, std);
  ok('exterior model within budget (170k triangles desktop; phones build a lighter one)', ext && tris < 170000, Math.round(tris) + ' triangles');
  // every Deck 2 screen sits in front of its wall (walls are inset 6 cm from each room's outline)
  { const p = new THREE.Vector3(), hid = []; screens.forEach((sc) => { let d2 = false; for (let o = sc.mesh; o; o = o.parent) if (o === DECK2) d2 = true; if (!d2) return; sc.mesh.getWorldPosition(p); const x = p.x, z = p.z;
      if (!D2.rooms.some((r) => x > r.x0 + 0.061 && x < r.x1 - 0.061 && z > r.z0 + 0.061 && z < r.z1 - 0.061)) hid.push(sc.station + '@' + x.toFixed(2) + ',' + z.toFixed(2)); });
    ok('no screen behind a wall', hid.length === 0, hid.join(' ')); }
  // the bake patches each material once: a second patch redefines its uniforms and the shader fails to compile
  { let twice = 0; scene.traverse((o) => { if (o.isMesh && (o.material._patches || []).filter((q) => q.key.startsWith('bk-')).length > 1) twice++; }); ok('no mesh patched twice by the bake', twice === 0, twice); }
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
