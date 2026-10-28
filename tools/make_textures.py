# Builds the ship's surface textures in textures/ (Stage 3).
# usage: python3 tools/make_textures.py <src_dir> <site_dir>
# <src_dir> holds the downloaded ambientCG sets (all CC0), one folder each, with ambientCG's file names inside:
#   Carpet012/  Carpet016/  Wood018/  DiamondPlate008C/   (2K-JPG downloads, unzipped)
#   leather/  metal/   (from the repo's textures-clean folders: color/normal/roughness.jpg)
# Brushed steel, painted-metal detail and screen fingerprints are generated here, not downloaded.
# Each set becomes up to three images: _c (colour), _n (bump detail, a "normal map"),
# _orm (red = contact shading, green = roughness, blue = metalness; the layout three.js expects).
import sys, os
import numpy as np
from PIL import Image, ImageDraw
Image.MAX_IMAGE_PIXELS = None
src, site = sys.argv[1], sys.argv[2]
out = os.path.join(site, 'textures'); os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(408)

def load(path, size, mode='RGB'):
  return np.asarray(Image.open(path).convert(mode).resize((size, size), Image.LANCZOS), np.float32) / 255
def acg(name, kind, size, mode='RGB'):
  return load(os.path.join(src, name, f'{name}_2K-JPG_{kind}.jpg'), size, mode)
def save(a, name, q=88):
  a = np.clip(a * 255 + 0.5, 0, 255).astype(np.uint8)
  Image.fromarray(a).save(os.path.join(out, name), quality=q, optimize=True)
def orm(ao, rough, metal):
  return np.stack([ao, rough, metal], -1)
def detail(a, spread=0.16):  # centre on 0.5 so the shader can use it as variation around a material's own roughness
  return np.clip(0.5 + (a - a.mean()) / (a.std() + 1e-6) * spread, 0, 1)
def hsv_adjust(rgb, sat=1.0, val=1.0, hue_to=None, hue_mix=0.0):
  import colorsys
  h, s, v = np.vectorize(colorsys.rgb_to_hsv)(rgb[..., 0], rgb[..., 1], rgb[..., 2])
  if hue_to is not None: h = h + (hue_to - h) * hue_mix
  r, g, b = np.vectorize(colorsys.hsv_to_rgb)(h, np.clip(s * sat, 0, 1), np.clip(v * val, 0, 1))
  return np.stack([r, g, b], -1)
# periodic helpers (tiles repeat without seams)
def blur(a, sx, sy):
  H, W = a.shape; fy = np.fft.fftfreq(H)[:, None]; fx = np.fft.fftfreq(W)[None, :]
  return np.real(np.fft.ifft2(np.fft.fft2(a) * np.exp(-2 * np.pi ** 2 * ((fx * sx) ** 2 + (fy * sy) ** 2))))
def norm01(a): return (a - a.min()) / (a.max() - a.min() + 1e-9)
def normal_from_height(h, strength):
  dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5 * strength; dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5 * strength
  n = np.stack([-dx, dy, np.ones_like(h)], -1); n /= np.linalg.norm(n, axis=-1, keepdims=True)
  return n * 0.5 + 0.5
def wrapped_lines(S, n, lmin, lmax, width, seed):  # random scratches drawn on a 3x3 canvas and folded back, so they wrap
  r = np.random.default_rng(seed); im = Image.new('L', (3 * S, 3 * S), 0); d = ImageDraw.Draw(im)
  for _ in range(n):
    x, y = r.uniform(S, 2 * S, 2); a = r.uniform(0, np.pi); L = r.uniform(lmin, lmax)
    d.line([(x, y), (x + np.cos(a) * L, y + np.sin(a) * L)], fill=int(r.uniform(90, 255)), width=width)
  a = np.asarray(im, np.float32) / 255
  return a.reshape(3, S, 3, S).sum((0, 2)).clip(0, 1)

# ---- bridge carpet: Carpet012, navy cut pile, a touch darker and calmer ----
c = acg('Carpet012', 'Color', 1024); c = hsv_adjust(c, sat=0.85, val=0.92)
save(c, 'carpet_c.jpg'); save(acg('Carpet012', 'NormalGL', 1024), 'carpet_n.jpg', 90)
save(orm(acg('Carpet012', 'AmbientOcclusion', 1024, 'L'), acg('Carpet012', 'Roughness', 1024, 'L'), np.zeros((1024, 1024))), 'carpet_orm.jpg')
# ---- room carpet: Carpet016 woven loop pile, recoloured from pale beige to a dark warm grey, stains softened ----
c = acg('Carpet016', 'Color', 1024); soft = np.stack([blur(c[..., k], 6, 6) for k in range(3)], -1)
c = c * 0.35 + soft * 0.65; lum = c.mean(-1, keepdims=True)
c = (lum - lum.mean()) * 1.3 + np.array([0.19, 0.18, 0.172]) + (c - lum) * 0.06
save(c, 'roomcarpet_c.jpg'); save(acg('Carpet016', 'NormalGL', 1024), 'roomcarpet_n.jpg', 90)
save(orm(acg('Carpet016', 'AmbientOcclusion', 1024, 'L'), acg('Carpet016', 'Roughness', 1024, 'L'), np.zeros((1024, 1024))), 'roomcarpet_orm.jpg')
# ---- diamond plate: DiamondPlate008C ----
save(acg('DiamondPlate008C', 'Color', 1024), 'plate_c.jpg'); save(acg('DiamondPlate008C', 'NormalGL', 1024), 'plate_n.jpg', 90)
save(orm(acg('DiamondPlate008C', 'AmbientOcclusion', 1024, 'L'), acg('DiamondPlate008C', 'Roughness', 1024, 'L'), acg('DiamondPlate008C', 'Metalness', 1024, 'L')), 'plate_orm.jpg')
# ---- wood: Wood018, red pulled toward brown, a little lighter ----
c = acg('Wood018', 'Color', 1024); c = hsv_adjust(c, sat=0.72, val=1.25, hue_to=0.07, hue_mix=0.5)
save(c, 'wood_c.jpg'); save(acg('Wood018', 'NormalGL', 1024), 'wood_n.jpg', 90)
r = acg('Wood018', 'Roughness', 1024, 'L'); save(orm(np.ones_like(r), r, np.zeros_like(r)), 'wood_orm.jpg')
# ---- leather: grain only; the ship keeps its own oxblood colour ----
n = load(os.path.join(src, 'leather', 'normal.jpg'), 512); save(n, 'leather_n.jpg', 90)
r = load(os.path.join(src, 'leather', 'roughness.jpg'), 512, 'L'); save(orm(np.ones_like(r), detail(r), np.zeros_like(r)), 'leather_orm.jpg')
# ---- painted metal (consoles, frames, chair shells): fine orange-peel, dents, light scratches; blotchy roughness ----
S = 512
peel = blur(rng.standard_normal((S, S)), 1.6, 1.6); dents = blur((rng.random((S, S)) > 0.9993).astype(np.float32), 5, 5)
scr = wrapped_lines(S, 70, 8, 70, 1, 5)
h = norm01(peel) * 0.35 - norm01(dents) * 1.2 - scr * 0.5
blot = load(os.path.join(src, 'metal', 'roughness.jpg'), S, 'L')
save(normal_from_height(h, 1.6), 'paint_n.jpg', 90)
save(orm(1 - scr * 0.25, detail(blot * 0.8 + scr * 0.35 + norm01(peel) * 0.1), np.zeros((S, S))), 'paint_orm.jpg')
# ---- brushed steel: grain streaks along one axis plus a few scratches ----
g = blur(rng.standard_normal((S, S)), 60, 0.7) * 0.7 + blur(rng.standard_normal((S, S)), 14, 0.5) * 0.3
scr = wrapped_lines(S, 40, 10, 90, 1, 9)
save(normal_from_height(norm01(g) - scr * 0.4, 3.0), 'steel_n.jpg', 90)
save(orm(np.ones((S, S)), detail(norm01(g) + scr * 0.5, 0.2), np.ones((S, S))), 'steel_orm.jpg')
# ---- screen glass fingerprints and wipe marks (grey: 0 = clean glass, 1 = heavy smudge) ----
S = 512; yy, xx = np.mgrid[0:S, 0:S].astype(np.float32); sm = np.zeros((S, S), np.float32); r = np.random.default_rng(77)
for _ in range(16):  # fingerprints: ridged ovals, often partial
  cx, cy = r.uniform(0, S, 2); a, b = r.uniform(14, 24), r.uniform(18, 32); th = r.uniform(0, np.pi)
  dx = (xx - cx + S / 2) % S - S / 2; dy = (yy - cy + S / 2) % S - S / 2
  u = dx * np.cos(th) + dy * np.sin(th); v = -dx * np.sin(th) + dy * np.cos(th); q = np.sqrt((u / a) ** 2 + (v / b) ** 2)
  ridges = 0.5 + 0.5 * np.sin(q * 34 + np.sin(u * 0.12) * 1.5)
  cut = np.clip(0.5 + (u * np.cos(r.uniform(0, 6.3)) + v * np.sin(r.uniform(0, 6.3))) / (a * r.uniform(0.6, 1.4)), 0, 1)
  sm = np.maximum(sm, ridges * np.clip((1 - q) * 3, 0, 1) * cut * r.uniform(0.5, 1.0))
wipe = norm01(blur(rng.standard_normal((S, S)), 40, 9)); sm = np.maximum(sm, np.clip((wipe - 0.62) * 2.2, 0, 1) * 0.55)
sm = np.maximum(sm, norm01(blur(rng.standard_normal((S, S)), 3, 3)) * 0.12)
Image.fromarray((np.clip(sm, 0, 1) * 255).astype(np.uint8)).save(os.path.join(out, 'smudge.png'), optimize=True)
print({f: os.path.getsize(os.path.join(out, f)) // 1024 for f in sorted(os.listdir(out))}, 'KB total', sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out)) // 1024)
