# Step 3 of the light bake: clean up Blender's output and save it as small PNGs the ship loads (bake/).
# usage: python3 tools/bake_encode.py <work_dir> <site_dir>
# Values are stored as sqrt(value / max) so dark areas keep their precision in 8 bits; bake.json holds each max.
import sys, os, json
import numpy as np
from PIL import Image
work, site = sys.argv[1], sys.argv[2]
out = os.path.join(site, 'bake'); os.makedirs(out, exist_ok=True)
scn = json.load(open(os.path.join(work, 'scene.json'))); pj = json.load(open(os.path.join(work, 'probes.json')))
EXPOSURE = float(os.environ.get('EXPOSURE', 3.14159))

def blur_masked(a, mask, it=1):
  # light smoothing that never pulls in empty (unbaked) pixels; evens out the remaining render noise
  k = np.array([1, 2, 1], np.float32)
  for _ in range(it):
    m = mask.astype(np.float32)[..., None]; num = a * m; den = m
    for ax in (0, 1):
      num = sum(np.roll(num, s, ax) * w for s, w in zip((-1, 0, 1), k))
      den = sum(np.roll(den, s, ax) * w for s, w in zip((-1, 0, 1), k))
    a = np.where(mask[..., None], num / np.maximum(den, 1e-6), a)
  return a
def enc(a, mx): return (np.sqrt(np.clip(a / mx, 0, 1)) * 255 + 0.5).astype(np.uint8)

meta = {'atlas': scn['atlas'], 'exposure': EXPOSURE, 'strip': 1.0, 'env': 1.0, 'rig': pj['rig'], 'samples': pj['samples']}
# light map
lw, ls = np.load(os.path.join(work, 'lm_w.npy')), np.load(os.path.join(work, 'lm_s.npy')).mean(2, keepdims=True)
mask = lw.sum(2) > 0
lw = blur_masked(lw, mask); ls = blur_masked(ls, mask)
mw = float(np.percentile(lw[mask], 99.8)) * 1.1; ms = float(np.percentile(ls[mask], 99.8)) * 1.1
Image.fromarray(enc(lw, mw)).save(os.path.join(out, 'lm_w.png'), optimize=True)
Image.fromarray(enc(ls[..., 0], ms)).save(os.path.join(out, 'lm_s.png'), optimize=True)
meta['lm_max'] = [mw, ms]
# probes: rows are (face, y, z), columns x
X, Y, Z = pj['dims']; valid = np.array(pj['valid'], bool).reshape(Y, Z, X)
pw = np.load(os.path.join(work, 'pr_w.npy')).reshape(6, Y, Z, X, 3); ps = np.load(os.path.join(work, 'pr_s.npy')).mean(2).reshape(6, Y, Z, X, 1)
pr = np.concatenate([pw, ps], 4)
for f in range(6):  # tame fireflies (probes that sat right next to a bright emitter)
  for c in range(4):
    v = pr[f, ..., c][valid]
    if v.size: pr[f, ..., c] = np.minimum(pr[f, ..., c], np.percentile(v, 99.5))
# fill probes that were inside walls or furniture from their valid neighbours, so surfaces don't pick up false darkness
ok = valid.copy()
for _ in range(8):
  num = np.zeros_like(pr); den = np.zeros(ok.shape, np.float32)
  for ax in (0, 1, 2):
    for s in (-1, 1):
      sh_ok = np.roll(ok, s, ax); sh = np.roll(pr, s, ax + 1)
      edge = [slice(None)] * 3; edge[ax] = 0 if s == 1 else -1; sh_ok[tuple(edge)] = False
      num += sh * sh_ok[None, ..., None]; den += sh_ok
  fill = (~ok) & (den > 0)
  pr = np.where(fill[None, ..., None], num / np.maximum(den, 1)[None, ..., None], pr); ok = ok | fill
mpw = float(np.percentile(pr[..., :3][:, valid], 99.9)) * 1.05; mps = float(np.percentile(pr[..., 3][:, valid], 99.9)) * 1.05
img_w = pr[..., :3].reshape(6 * Y * Z, X, 3); img_s = pr[..., 3].reshape(6 * Y * Z, X)
Image.fromarray(enc(img_w, mpw)).save(os.path.join(out, 'pr_w.png'), optimize=True)
Image.fromarray(enc(img_s, mps)).save(os.path.join(out, 'pr_s.png'), optimize=True)
meta['pr_max'] = [mpw, mps]; meta['grid'] = {'origin': pj['origin'], 'step': pj['step'], 'dims': [X, Y, Z]}
json.dump(meta, open(os.path.join(out, 'bake.json'), 'w'), indent=1)
print('light map max', round(mw, 3), round(ms, 3), 'probe max', round(mpw, 3), round(mps, 3),
      'sizes KB', {n: os.path.getsize(os.path.join(out, n)) // 1024 for n in os.listdir(out)})
