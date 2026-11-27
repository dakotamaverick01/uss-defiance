# The exterior's fine hull detail: a seamlessly repeating 8 x 8 m patch of plating modelled in Blender (plates with
# recessed seams, hatches, vents, access ports, conduit runs) and baked with Cycles onto a flat square: surface relief
# (tangent-space normal) and ambient occlusion. The ship's paint shader repeats it over the whole hull.
# usage: <venv>/bin/python tools/detail_tile_blender.py <out_dir> [size_px] [samples]
#   writes <out_dir>/detail_n.png (normal) and <out_dir>/detail_ao.png; tools/detail_tile_pack.py packs them for the game
import bpy, bmesh, sys, os, random, math

out = sys.argv[1]; SIZE = int(sys.argv[2]) if len(sys.argv) > 2 else 2048; SAMPLES = int(sys.argv[3]) if len(sys.argv) > 3 else 32
T = 8.0  # the patch, metres
rnd = random.Random(4207)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene; scene.render.engine = 'CYCLES'; scene.cycles.device = 'CPU'; scene.cycles.samples = SAMPLES

bm = bmesh.new()
def box(x0, y0, x1, y1, z0, z1, bev=0.0):
  """an axis-aligned box from (x0, y0, z0) to (x1, y1, z1), copied across the patch edges so the result repeats"""
  for ox in (-T, 0, T):
    for oy in (-T, 0, T):
      a, b, c, d = x0 + ox, y0 + oy, x1 + ox, y1 + oy
      if c < -0.6 or a > T + 0.6 or d < -0.6 or b > T + 0.6: continue
      vs = [bm.verts.new(p) for p in [(a, b, z0), (c, b, z0), (c, d, z0), (a, d, z0), (a, b, z1), (c, b, z1), (c, d, z1), (a, d, z1)]]
      for f in [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]: bm.faces.new([vs[i] for i in f])
def cyl(x, y, r, z0, z1, axis='z', length=0.0, seg=16):
  for ox in (-T, 0, T):
    for oy in (-T, 0, T):
      cx, cy = x + ox, y + oy
      if cx < -1 - length or cx > T + 1 + length or cy < -1 - length or cy > T + 1 + length: continue
      ring0, ring1 = [], []
      for k in range(seg):
        a = 2 * math.pi * k / seg
        if axis == 'z':
          ring0.append(bm.verts.new((cx + r * math.cos(a), cy + r * math.sin(a), z0))); ring1.append(bm.verts.new((cx + r * math.cos(a), cy + r * math.sin(a), z1)))
        else:  # a pipe lying along x (axis 'x') or y, centred at height z0, length 'length'
          zz = z0 + r * math.sin(a); s = r * math.cos(a)
          p0, p1 = ((cx, cy + s, zz), (cx + length, cy + s, zz)) if axis == 'x' else ((cx + s, cy, zz), (cx + s, cy + length, zz))
          ring0.append(bm.verts.new(p0)); ring1.append(bm.verts.new(p1))
      for k in range(seg): k2 = (k + 1) % seg; bm.faces.new([ring0[k], ring0[k2], ring1[k2], ring1[k]])
      bm.faces.new(ring1); bm.faces.new(list(reversed(ring0)))

# 1. the plates: brick-like rows of plates, each split again; 4 cm seams between them
GAP = 0.04; plates = []
y = 0.0
rows = []
while y < T - 0.01:
  h = rnd.choice([1.0, 1.0, 1.333, 2.0]); h = min(h, T - y); rows.append((y, h)); y += h
for (y0, h) in rows:
  x = rnd.uniform(0, 2.0); xs = []
  start = x
  while x < start + T - 0.01:
    w = min(rnd.choice([1.0, 1.6, 2.0, 2.0, 2.667, 3.2]), start + T - x); xs.append((x, w)); x += w
  for (x0, w) in xs:
    # sometimes split a plate across its height
    if h >= 1.3 and rnd.random() < 0.35: plates += [(x0, y0, w, h / 2), (x0, y0 + h / 2, w, h / 2)]
    else: plates.append((x0, y0, w, h))
box(-1, -1, T + 1, T + 1, -0.06, 0.0)  # the hull skin under the plates (the seams' floor)
for (x0, y0, w, h) in plates:
  z = 0.028 + rnd.uniform(-0.006, 0.008)
  box(x0 + GAP / 2, y0 + GAP / 2, x0 + w - GAP / 2, y0 + h - GAP / 2, -0.01, z)
  px0, py0, px1, py1 = x0 + GAP / 2, y0 + GAP / 2, x0 + w - GAP / 2, y0 + h - GAP / 2
  r = rnd.random()
  if r < 0.16 and w > 1.2 and h > 0.9:   # a hatch: a raised frame round a slightly lower panel, a handle recess
    cx, cy = (px0 + px1) / 2, (py0 + py1) / 2; hw, hh = min(0.55, (px1 - px0) / 2 - 0.15), min(0.4, (py1 - py0) / 2 - 0.12)
    for (a, b, c, d) in [(cx - hw, cy - hh, cx + hw, cy - hh + 0.05), (cx - hw, cy + hh - 0.05, cx + hw, cy + hh), (cx - hw, cy - hh, cx - hw + 0.05, cy + hh), (cx + hw - 0.05, cy - hh, cx + hw, cy + hh)]:
      box(a, b, c, d, z - 0.01, z + 0.012)
    box(cx + hw * 0.5, cy - 0.04, cx + hw * 0.5 + 0.18, cy + 0.04, z - 0.01, z + 0.006)
  elif r < 0.30 and w > 1.0:             # a vent: a frame with louvre slats
    vx0, vy0 = px0 + 0.2, py0 + 0.2; vw, vh = min(1.1, px1 - px0 - 0.4), min(0.5, py1 - py0 - 0.4)
    box(vx0, vy0, vx0 + vw, vy0 + 0.04, z, z + 0.02); box(vx0, vy0 + vh - 0.04, vx0 + vw, vy0 + vh, z, z + 0.02)
    k = vx0 + 0.06
    while k < vx0 + vw - 0.06: box(k, vy0 + 0.04, k + 0.03, vy0 + vh - 0.04, z - 0.005, z + 0.016); k += 0.08
  elif r < 0.42:                         # access ports: small round covers
    for _ in range(rnd.randint(1, 3)):
      cyl(rnd.uniform(px0 + 0.2, px1 - 0.2), rnd.uniform(py0 + 0.2, py1 - 0.2), rnd.choice([0.08, 0.12, 0.18]), z - 0.01, z + 0.012)
  elif r < 0.50 and h > 0.9:             # a plate of fine sub-panels
    k = px0 + (px1 - px0) / 3
    box(k - 0.008, py0 + 0.05, k + 0.008, py1 - 0.05, z - 0.02, z - 0.004); box(k * 2 - px0 - 0.008, py0 + 0.05, k * 2 - px0 + 0.008, py1 - 0.05, z - 0.02, z - 0.004)
  # rivet lines along some plates' long edges
  if rnd.random() < 0.22:
    yy = py0 + 0.06; xx = px0 + 0.1
    while xx < px1 - 0.1: cyl(xx, yy, 0.012, z - 0.005, z + 0.006, seg=6); xx += 0.16
# 2. conduit runs across the plating: two long pipes and a few brackets
for (yy, rr) in [(rnd.uniform(0.5, 3.5), 0.05), (rnd.uniform(4.5, 7.5), 0.035)]:
  cyl(-1.0, yy, rr, 0.03 + rr, 0, axis='x', length=T + 2.0)
  xx = rnd.uniform(0, 1)
  while xx < T: box(xx, yy - rr - 0.03, xx + 0.06, yy + rr + 0.03, 0.02, 0.03 + 2 * rr + 0.01); xx += 1.25

me = bpy.data.meshes.new('detail'); bm.to_mesh(me); bm.free()
hi = bpy.data.objects.new('detail', me); scene.collection.objects.link(hi)
bv = hi.modifiers.new('bevel', 'BEVEL'); bv.width = 0.012; bv.segments = 2; bv.limit_method = 'ANGLE'
for p in me.polygons: p.use_smooth = False

# the bake target: one flat square over the patch
bpy.ops.mesh.primitive_plane_add(size=T, location=(T / 2, T / 2, 0.08)); lo = bpy.context.active_object
img_n = bpy.data.images.new('detail_n', SIZE, SIZE, float_buffer=True); img_n.colorspace_settings.name = 'Non-Color'
img_ao = bpy.data.images.new('detail_ao', SIZE, SIZE, float_buffer=True); img_ao.colorspace_settings.name = 'Non-Color'
mat = bpy.data.materials.new('bake'); mat.use_nodes = True; nt = mat.node_tree; lo.data.materials.append(mat)
tex = nt.nodes.new('ShaderNodeTexImage'); nt.nodes.active = tex
hm = bpy.data.materials.new('hull'); hm.use_nodes = True; me.materials.append(hm)
for o in scene.objects: o.select_set(False)
hi.select_set(True); lo.select_set(True); bpy.context.view_layer.objects.active = lo
bk = scene.render.bake; bk.use_selected_to_active = True; bk.cage_extrusion = 0.0; bk.max_ray_distance = 0.4; bk.margin = 0
bk.use_cage = False
# Cycles casts from the target down onto the detail, so lift the target above it and cast 0.4 m
tex.image = img_n; bpy.ops.object.bake(type='NORMAL', normal_space='TANGENT'); img_n.filepath_raw = os.path.join(out, 'detail_n.png'); img_n.file_format = 'PNG'; img_n.save()
tex.image = img_ao; bpy.ops.object.bake(type='AO'); img_ao.filepath_raw = os.path.join(out, 'detail_ao.png'); img_ao.file_format = 'PNG'; img_ao.save()
print('baked', SIZE, 'px', len(me.polygons), 'faces')
