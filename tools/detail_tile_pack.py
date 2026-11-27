# Packs the baked hull detail patch for the game: red and green = the surface relief (normal x, y), blue = ambient
# occlusion (softened a little so Cycles' sampling noise doesn't show). Writes textures/hull_detail.jpg (2048) and
# textures/hull_detail_1k.jpg (phones).
# usage: python3 tools/detail_tile_pack.py <bake_dir> <site_dir>
import sys, os
from PIL import Image, ImageFilter
src, site = sys.argv[1], sys.argv[2]
n = Image.open(os.path.join(src, 'detail_n.png')).convert('RGB')
ao = Image.open(os.path.join(src, 'detail_ao.png')).convert('L').filter(ImageFilter.GaussianBlur(1.4 * n.size[0] / 2048))
r, g, _ = n.split()
out = Image.merge('RGB', (r, g, ao))
out.save(os.path.join(site, 'textures', 'hull_detail.jpg'), quality=92, subsampling=0)
out.resize((n.size[0] // 2, n.size[1] // 2), Image.LANCZOS).save(os.path.join(site, 'textures', 'hull_detail_1k.jpg'), quality=90, subsampling=0)
print('packed', n.size, os.path.getsize(os.path.join(site, 'textures', 'hull_detail.jpg')) // 1024, 'KB')
