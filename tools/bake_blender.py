# Step 2 of the light bake: render the ship's light in Blender (Cycles), bounce light included.
# usage: <venv>/bin/python tools/bake_blender.py <work_dir> [samples]
#   (Blender as a Python module: python -m venv v && v/bin/pip install bpy)
# Reads scene.json/scene.bin from tools/bake_export.py and writes lm_w/lm_s/pr_w/pr_s .npy plus probes.json.
# Two layers: W = every fixture except the deck strips; S = the deck strips alone, in white (tinted live by alert colour).
import bpy, json, sys, os, time
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

work = sys.argv[1]; SAMPLES = int(sys.argv[2]) if len(sys.argv) > 2 else 64
meta = json.load(open(os.path.join(work, 'scene.json'))); blob = open(os.path.join(work, 'scene.bin'), 'rb').read()
# How bright each kind of fixture is, relative to how it looks on screen. Spot powers are in watts.
RIG = {'slot': 4.0, 'disc': 4.0, 'panel': 4.0, 'screen': 2.0, 'down': 0.6, 'strip': 1.9, 'spot_bridge': 150.0, 'spot_room': 90.0}
RIG.update(json.loads(os.environ.get('RIG', '{}')))
STEP = 0.3

def arr(rng, dt): return np.frombuffer(blob[rng[0]:rng[0] + rng[1]], dtype=dt)
def tob(p): p = p.reshape(-1, 3); return np.stack([p[:, 0], -p[:, 2], p[:, 1]], 1)  # three.js (y up) -> Blender (z up)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; cy = sc.cycles
cy.device = 'CPU'; cy.samples = SAMPLES; cy.use_denoising = False
cy.max_bounces = 5; cy.diffuse_bounces = 3; cy.glossy_bounces = 2; cy.transmission_bounces = 0; cy.volume_bounces = 0
cy.caustics_reflective = False; cy.caustics_refractive = False; cy.sample_clamp_indirect = 4.0
world = bpy.data.worlds.new('void'); world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0, 0, 0, 1); sc.world = world

def make_mesh(name, P, idx, uv=None):
  me = bpy.data.meshes.new(name); nv = len(P); nt = len(idx) // 3
  me.vertices.add(nv); me.vertices.foreach_set('co', P.astype(np.float32).ravel())
  me.loops.add(len(idx)); me.loops.foreach_set('vertex_index', idx.astype(np.int32))
  me.polygons.add(nt); me.polygons.foreach_set('loop_start', np.arange(0, len(idx), 3, dtype=np.int32))
  if uv is not None:
    ul = me.uv_layers.new(name='LM'); ul.data.foreach_set('uv', uv.reshape(-1, 2)[idx].astype(np.float32).ravel())
  me.update(); me.validate(clean_customdata=False)
  ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob

LMW, LMH = meta['atlas']['w'], meta['atlas']['h']
img_lm = bpy.data.images.new('LM', LMW, LMH, float_buffer=True)
emitters = []  # (node, base strength, layer)
recv_objs, allP, allI, nbase = [], [], [], 0
for gi, g in enumerate(meta['groups']):
  P = tob(arr(g['pos'], np.float32)); I = arr(g['idx'], np.uint32).astype(np.int64)
  uv = None
  if g['recv']:
    uv = arr(g['uv'], np.float32).reshape(-1, 2).copy(); uv[:, 1] = 1.0 - uv[:, 1]  # atlas rows run top-down
  ob = make_mesh('g%d_%s' % (gi, g.get('cat') or g['kind']), P, I, uv)
  allP.append(P); allI.append(I + nbase); nbase += len(P)
  mat = bpy.data.materials.new(ob.name); mat.use_nodes = True; nt = mat.node_tree; nodes = nt.nodes
  bsdf = nodes['Principled BSDF']; out = nodes['Material Output']
  if g['kind'] == 'occ':
    c = [min(1.0, x) for x in g['col']]
    bsdf.inputs['Base Color'].default_value = (*c, 1); bsdf.inputs['Metallic'].default_value = g['metal'] or 0
    bsdf.inputs['Roughness'].default_value = max(0.2, g['rough'] if g['rough'] is not None else 0.5)
    if g['recv']:
      tn = nodes.new('ShaderNodeTexImage'); tn.image = img_lm; nodes.active = tn; recv_objs.append(ob)
  else:
    em = nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (*g['col'], 1)
    s = RIG[g['cat']]; em.inputs['Strength'].default_value = s
    nt.links.new(em.outputs['Emission'], out.inputs['Surface']); emitters.append((em, s, g['layer']))
  ob.data.materials.append(mat)

spots = []
for s in meta['spots']:
  p = tob(np.array(s['p']))[0]; L = bpy.data.lights.new('spot', 'SPOT')
  L.energy = RIG['spot_room' if s['room'] else 'spot_bridge']; L.spot_size = 1.9; L.spot_blend = 0.75; L.shadow_soft_size = s['r']
  L.color = (1.0, 0.93, 0.84)
  o = bpy.data.objects.new('spot', L); o.location = Vector(p) + Vector((0, 0, -0.03)); sc.collection.objects.link(o); spots.append(o)

# ---------- probe grid: tiny six-sided markers, invisible to light, each baked into its own pixel ----------
b0, b1 = np.array(meta['bounds'][0]), np.array(meta['bounds'][1])
origin = np.array([b0[0] + 0.15, 0.15, b0[2] + 0.15])
dims = [int(np.ceil((b1[0] - origin[0]) / STEP)) + 1, int(np.ceil((meta['wallH'] - 0.15) / STEP)) + 1, int(np.ceil((b1[2] - origin[2]) / STEP)) + 1]
X, Y, Z = dims; PW, PH = X, 6 * Y * Z
print('probe grid', dims, X * Y * Z, 'probes')
AP = np.concatenate(allP); AI = np.concatenate(allI).reshape(-1, 3)
bvh = BVHTree.FromPolygons([tuple(v) for v in AP], [tuple(t) for t in AI], all_triangles=True)
dirs = [Vector(d).normalized() for d in [(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1),(1,1,1),(1,1,-1),(1,-1,1),(1,-1,-1),(-1,1,1),(-1,1,-1),(-1,-1,1),(-1,-1,-1)]]
valid = np.zeros((Y, Z, X), bool)
for y in range(Y):
  for z in range(Z):
    for x in range(X):
      tp = origin + np.array([x, y, z]) * STEP; bp = Vector((tp[0], -tp[2], tp[1]))
      back = esc = 0
      for d in dirs:
        loc, n, i, dist = bvh.ray_cast(bp, d, 8.0)
        if loc is None: esc += 1
        elif n.dot(d) > 0: back += 1
      valid[y, z, x] = back < 0.35 * len(dirs) and esc < 0.7 * len(dirs)
print('valid probes', int(valid.sum()))
# faces: +x -x +y -y +z -z in three.js axes; image row = (f*Y + y)*Z + z, column = x (top-down)
FACES = [(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]
qv, qi, quv = [], [], []
h = 0.006
for f, fn in enumerate(FACES):
  n = np.array(fn, float); a = np.array([fn[1], fn[2], fn[0]], float); b = np.cross(n, a)
  for y, z, x in zip(*np.nonzero(valid)):
    c = origin + np.array([x, y, z]) * STEP + n * 0.004
    k = len(qv)
    for su, sv in ((-1, -1), (1, -1), (1, 1), (-1, 1)): qv.append(c + (a * su + b * sv) * h)
    if np.dot(np.cross(a, b), n) > 0: qi += [k, k + 1, k + 2, k, k + 2, k + 3]
    else: qi += [k, k + 2, k + 1, k, k + 3, k + 2]
    row = (f * Y + y) * Z + z; br = PH - 1 - row
    for su, sv in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
      quv.append(((x + 0.5 + su * 0.45) / PW, (br + 0.5 + sv * 0.45) / PH))
img_pr = bpy.data.images.new('PR', PW, PH, float_buffer=True)
qv = np.array(qv); quv = np.array(quv, np.float32); qi = np.array(qi, np.int64)
pob = make_mesh('probes', tob(qv), qi, None)
ul = pob.data.uv_layers.new(name='LM'); ul.data.foreach_set('uv', quv[qi].ravel())
for k in ('visible_diffuse', 'visible_glossy', 'visible_transmission', 'visible_volume_scatter', 'visible_shadow'): setattr(pob, k, False)
pm = bpy.data.materials.new('probe'); pm.use_nodes = True
pm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (1, 1, 1, 1)
tn = pm.node_tree.nodes.new('ShaderNodeTexImage'); tn.image = img_pr; pm.node_tree.nodes.active = tn; pob.data.materials.append(pm)

def bake(objs, margin):
  for o in sc.objects: o.select_set(False)
  for o in objs: o.select_set(True)
  bpy.context.view_layer.objects.active = objs[0]
  sc.render.bake.use_pass_direct = True; sc.render.bake.use_pass_indirect = True; sc.render.bake.use_pass_color = False
  sc.render.bake.margin = margin; sc.render.bake.margin_type = 'EXTEND'
  bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT', 'INDIRECT'}, margin=margin, use_clear=True)
def save(img, name):
  a = np.empty(img.size[0] * img.size[1] * 4, np.float32); img.pixels.foreach_get(a)
  a = a.reshape(img.size[1], img.size[0], 4)[::-1, :, :3]; np.save(os.path.join(work, name), a)

for layer in ('W', 'S'):
  for em, s, l in emitters: em.inputs['Strength'].default_value = s if l == layer else 0.0
  for o in spots: o.hide_render = layer != 'W'
  if not os.environ.get('SKIP_LM'):
    t = time.time(); bake(recv_objs, 4); save(img_lm, 'lm_' + layer.lower()); print('light map', layer, round(time.time() - t, 1), 's')
  t = time.time(); bake([pob], 0); save(img_pr, 'pr_' + layer.lower()); print('probes', layer, round(time.time() - t, 1), 's')
json.dump({'origin': origin.tolist(), 'step': STEP, 'dims': dims, 'valid': valid.ravel().astype(int).tolist(), 'rig': RIG, 'samples': SAMPLES},
          open(os.path.join(work, 'probes.json'), 'w'))
print('done')
