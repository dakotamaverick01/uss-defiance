# sheet.py <prefix> <out>  -> 2x3 contact sheet ; sheet.py <prefixA> <prefixB> <out> -> before/after rows
import sys
from PIL import Image, ImageDraw
N=['Bridge wide',"Captain's view",'Port stations','Ready room','Conference room','Red alert']
def lab(im,t):
  d=ImageDraw.Draw(im); d.rectangle([0,0,8+7*len(t),20],fill=(0,0,0)); d.text((6,4),t,fill=(255,255,255)); return im
if len(sys.argv)==3:
  pre,out=sys.argv[1:]; S=Image.new('RGB',(1280,1080))
  for i in range(6): S.paste(lab(Image.open(f'{pre}-{i+1}.png').convert('RGB').resize((640,360)),f'{i+1} {N[i]}'),((i%2)*640,(i//2)*360))
else:
  a,b,out=sys.argv[1:]; S=Image.new('RGB',(1280,360*6))
  for i in range(6):
    S.paste(lab(Image.open(f'{a}-{i+1}.png').convert('RGB').resize((640,360)),f'{i+1} before'),(0,i*360))
    S.paste(lab(Image.open(f'{b}-{i+1}.png').convert('RGB').resize((640,360)),f'{i+1} after'),(640,i*360))
S.save(out)
