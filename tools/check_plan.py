# Checks the ship geometry shared by the deck-plan page and the bridge's master systems display.
# usage: python3 tools/check_plan.py <site_dir>
# 1. the SHIPGEO block is identical in docs/master-systems-display.html and js/shipgeo.js
# 2. every compartment sits inside the hull (Decks 1-2 inside the spine) at its mid-deck depth, at both ends
# 3. compartments on one deck and side don't overlap
# 4. floor plans (SHIPGEO.plans, worked out by shipFloorPlan; tools/plan_check.js): sizes match STD in js/core.js, full
#    headroom in every room and corridor, no overlaps, one corridor network, a door from every room onto a corridor,
#    every room reachable from a lift, the side cutaway agrees with the plan, cabin sizes; and the saucer's top stays
#    below Deck 2's floor
import sys, os, json, subprocess
root = sys.argv[1] if len(sys.argv) > 1 else '.'
def block(path):
  s = open(os.path.join(root, path), encoding='utf-8').read()
  a, b = s.find('// SHIPGEO-BEGIN'), s.find('// SHIPGEO-END')
  return s[a:b] if a >= 0 and b > a else None
page, scr = block('docs/master-systems-display.html'), block('js/shipgeo.js')
fails = []
def ok(name, cond, info=''):
  print(('OK   ' if cond else 'FAIL ') + name + (' · ' + info if info and not cond else ''))
  if not cond: fails.append(name)
ok('SHIPGEO block present in the page', page is not None)
ok('SHIPGEO block identical in js/shipgeo.js', scr is not None and scr == page, 'copy the page block into shipgeo.js')
G = json.loads(subprocess.run(['node', '-e', page + '\nprocess.stdout.write(JSON.stringify(SHIPGEO));'], capture_output=True, text=True, check=True).stdout)
def at(pts, m):  # linear between the curve's points (the smooth curve passes through them)
  pts = sorted(pts)
  for (a, x), (b, y) in zip(pts, pts[1:]):
    if a <= m <= b: return x + (y - x) * (m - a) / (b - a) if b > a else x
  return None
def inside(m, d, n):
  if n <= 2:  # Decks 1-2 ride in the spine; its outline is a hump closed by the hull's back
    sp = G['spineTop']; return sp[0][0] <= m <= sp[-1][0] and at(sp, m) is not None and d >= at(sp, m)
  t, b = at(G['top'], m), at(G['bottom'], m)
  return t is not None and b is not None and t <= d <= b
bad, overlap = [], []
for i, rooms in enumerate(G['rooms']):
  n = i + 1; mid = (n - 0.5) * 3.5
  for a, b, name, st, k, side, note in rooms:
    for m in (a + 0.3, b - 0.3):
      if not inside(m, mid, n): bad.append(f'D{n} {name} at {m:.1f} m')
  for side in ('p', 's'):
    spans = sorted((a, b, name) for a, b, name, st, k, sd, note in rooms if sd in ('', side))
    for (a0, b0, n0), (a1, b1, n1) in zip(spans, spans[1:]):
      if a1 < b0 - 0.01: overlap.append(f'D{n} {n0} / {n1}')
ok('every compartment inside the hull', not bad, '; '.join(sorted(set(bad))))
ok('no overlapping compartments', not overlap, '; '.join(sorted(set(overlap))))
ok('10 decks', len(G['rooms']) == 10)
import re
core = open(os.path.join(root, 'js/core.js'), encoding='utf-8').read()
num = lambda pat: float(re.search(pat, core).group(1))
std = {'room': num(r"room: \{ h: ([\d.]+)"), 'corr': num(r"corridor: \{ w: [\d.]+, h: ([\d.]+)"), 'w': num(r"corridor: \{ w: ([\d.]+)")}
r = subprocess.run(['node', os.path.join(root, 'tools/plan_check.js'), json.dumps(std)], input=page, capture_output=True, text=True)
if r.returncode: print(r.stderr); fails.append('plan_check.js')
else:
  for c in json.loads(r.stdout): ok(c['name'], c['ok'], c['info'])
print('ALL OK' if not fails else f'{len(fails)} FAILED')
sys.exit(1 if fails else 0)
