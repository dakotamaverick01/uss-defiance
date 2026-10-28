// USS Defiance · surfaces.js
// Stage 3: surface detail. Loads the texture sets in textures/ (made by tools/make_textures.py) and adds small shader
// changes ("patches") to three.js's standard materials:
//   - world mapping: textures are laid on by world position, so boxes, chairs and consoles get even, unstretched detail;
//   - wear: polished edges on consoles and desks, scuffed walkways on the bridge floor, grime near the deck;
//   - screens: a fine pixel grid when you lean in, brighter centres, and glass with fingerprints that catch the light.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- shader patch system: several patches can share one material ----------
// A patch is { key, world, uniforms, decl, vdecl, vert, at: { chunk: code }, before: { chunk: code }, replace: { chunk: code } }.
// world: true adds vWP (world position), vWN (world normal), vON (object normal) and flatN (normal before bump maps).
function patchMat(m, key, p) {
  const P = m._patches || (m._patches = []);
  if (!P.some((q) => q.key === key)) { P.push(Object.assign({ key }, p)); installPatches(m); }
  return m;
}
function installPatches(m) {
  m.onBeforeCompile = (sh) => {
    const P = m._patches, world = P.some((q) => q.world);
    const W = 'varying vec3 vWP; varying vec3 vWN; varying vec3 vON;\n';
    let vd = world ? W : '', vb = world ? 'vWP = (modelMatrix * vec4(transformed, 1.0)).xyz; vWN = normalize(mat3(modelMatrix) * normal); vON = normal;\n' : '', fd = world ? W : '';
    const at = {}, before = {}, rep = {};
    if (world) at.normal_fragment_begin = 'vec3 flatN = normal;\n';
    P.forEach((q) => {
      if (q.uniforms) Object.assign(sh.uniforms, q.uniforms);
      fd += q.decl || ''; vd += q.vdecl || ''; vb += q.vert || '';
      for (const h in q.at || {}) at[h] = (at[h] || '') + q.at[h] + '\n';
      for (const h in q.before || {}) before[h] = (before[h] || '') + q.before[h] + '\n';
      for (const h in q.replace || {}) rep[h] = q.replace[h];
    });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + vd).replace('#include <fog_vertex>', '#include <fog_vertex>\n' + vb);
    let f = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + fd);
    const hooks = new Set([...Object.keys(at), ...Object.keys(before), ...Object.keys(rep)]);
    hooks.forEach((h) => { const tag = '#include <' + h + '>'; f = f.replace(tag, (before[h] || '') + (rep[h] !== undefined ? rep[h] : tag) + '\n' + (at[h] || '')); });
    sh.fragmentShader = f;
  };
  m.customProgramCacheKey = () => m._patches.map((q) => q.key).join('|');
  m.needsUpdate = true;
}
function copyPatches(from, to) { to._patches = (from._patches || []).slice(); if (to._patches.length) installPatches(to); return to; }

// ---------- textures: neutral placeholders until the real images arrive ----------
const SURF = { loads: [], cache: new Map() };
function tex1(r, g, b) { const t = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1); t.needsUpdate = true; return t; }
const PH = { c: tex1(255, 255, 255), n: tex1(128, 128, 255), orm: tex1(255, 128, 0), g: tex1(0, 0, 0) };
PH.c.colorSpace = THREE.SRGBColorSpace;
// TX(file, kind, apply): apply(texture) runs now with a placeholder and again once the file has loaded.
function TX(file, kind, apply) {
  apply(PH[kind]);
  let e = SURF.cache.get(file);
  if (!e) {
    e = { t: null, wait: [] }; SURF.cache.set(file, e);
    SURF.loads.push(new Promise((ok) => new THREE.TextureLoader().load('textures/' + file, (t) => {
      t.colorSpace = kind === 'c' ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso;
      e.t = t; e.wait.splice(0).forEach((f) => f(t)); ok(true);
    }, undefined, () => { console.warn('Texture missing: textures/' + file); ok(false); })));
  }
  if (e.t) apply(e.t); else e.wait.push(apply);
}
// a UV-mapped set on a flat surface whose UVs are in metres (floors): colour, bumps, contact shading, roughness, metalness
function uvSet(m, name, metres, o) {
  o = o || {};
  const rep = (t) => { if (t.isDataTexture) return t; const c = t.clone(); c.repeat.set(1 / metres, 1 / metres); c.needsUpdate = true; return c; };
  TX(name + '_c.jpg', 'c', (t) => { m.map = rep(t); });
  TX(name + '_n.jpg', 'n', (t) => { m.normalMap = rep(t); });
  TX(name + '_orm.jpg', 'orm', (t) => { const r = rep(t); m.aoMap = r; m.roughnessMap = r; if (o.metal) m.metalnessMap = r; });
  m.color.setHex(0xffffff); m.roughness = 1; m.metalness = o.metal ? 1 : 0; m.normalScale.set(o.ns || 1, o.ns || 1); m.aoMapIntensity = o.ao ?? 1;
  return m;
}

// ---------- world-mapped detail ("triplanar": the texture is projected from three sides and blended) ----------
const TRI_DECL = `uniform sampler2D triN, triO, triC; uniform float triS, triNS, triRV, triEdge, triLow; uniform vec3 triTint;
vec3 triW(vec3 n) { vec3 w = pow(abs(n), vec3(4.0)); return w / dot(w, vec3(1.0)); }
vec4 triTex(sampler2D t, vec3 p, vec3 w) { return texture(t, p.zy) * w.x + texture(t, p.xz) * w.y + texture(t, p.xy) * w.z; }
`;
// o: { set, metres, ns (bump strength), rv (roughness variation), edge (edge wear), low (grime near the deck), color, absRough, albedo }
function triSurface(m, o) {
  const U = {
    triN: { value: PH.n }, triO: { value: PH.orm }, triC: { value: PH.c }, triS: { value: 1 / (o.metres || 0.6) }, triNS: { value: o.ns ?? 0.8 },
    triRV: { value: o.rv ?? 0.6 }, triEdge: { value: o.edge || 0 }, triLow: { value: o.low ?? 1 }, triTint: { value: new THREE.Color(1, 1, 1) },
  };
  TX(o.set + '_n.jpg', 'n', (t) => { U.triN.value = t; });
  TX(o.set + '_orm.jpg', 'orm', (t) => { U.triO.value = t; });
  if (o.color) TX(o.set + '_c.jpg', 'c', (t) => { U.triC.value = t; });
  if (o.albedo) m.userData.bakeAlbedo = o.albedo;
  const flags = (o.color ? 'c' : '') + (o.absRough ? 'a' : '') + (o.edge ? 'e' : '');
  return patchMat(m, 'tri' + flags, {
    world: true, uniforms: U, decl: TRI_DECL,
    at: {
      map_fragment: `vec3 tP = vWP * triS; vec3 tWN = normalize(vWN); vec3 tw = triW(tWN); vec4 tO = triTex(triO, tP, tw); float tEdge = 0.0;
        ${o.color ? 'diffuseColor.rgb *= triTex(triC, tP, tw).rgb * triTint;' : ''}
        float tLow = (1.0 - smoothstep(0.0, 0.35, vWP.y)) * (1.0 - abs(tWN.y)) * triLow; diffuseColor.rgb *= 1.0 - 0.35 * tLow;
        ${o.edge ? `{ vec3 an = abs(normalize(vON)); tEdge = smoothstep(0.09, 0.25, 1.0 - max(an.x, max(an.y, an.z))) * smoothstep(0.25, 0.55, tO.g + 0.1) * triEdge;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.56, 0.55, 0.52), tEdge * 0.8); }` : ''}`,
      roughnessmap_fragment: o.absRough ? 'roughnessFactor *= tO.g;' :
        'roughnessFactor = clamp(roughnessFactor * (1.0 + triRV * (tO.g - 0.5) * 2.0), 0.04, 1.0); roughnessFactor = mix(roughnessFactor, 0.24, tEdge); roughnessFactor = mix(roughnessFactor, 1.0, tLow * 0.3);',
      metalnessmap_fragment: 'metalnessFactor = mix(metalnessFactor, 0.85, tEdge);',
      normal_fragment_maps: `{ vec3 N = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
        vec3 tx = texture(triN, tP.zy).xyz * 2.0 - 1.0, ty = texture(triN, tP.xz).xyz * 2.0 - 1.0, tz = texture(triN, tP.xy).xyz * 2.0 - 1.0;
        tx.xy *= triNS; ty.xy *= triNS; tz.xy *= triNS;
        tx = vec3(tx.xy + N.zy, abs(tx.z) * N.x); ty = vec3(ty.xy + N.xz, abs(ty.z) * N.y); tz = vec3(tz.xy + N.xy, abs(tz.z) * N.z);
        normal = normalize((viewMatrix * vec4(normalize(tx.zyx * tw.x + ty.xzy * tw.y + tz.xyz * tw.z), 0.0)).xyz); }`,
    },
  });
}

// ---------- bridge floor wear: walkways scuffed where the crew actually walks ----------
const WALK_DECL = `uniform float walkAmt, walkRough, walkFlat; uniform vec3 walkTint;
float wHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float wNoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(wHash(i), wHash(i + vec2(1.0, 0.0)), f.x), mix(wHash(i + vec2(0.0, 1.0)), wHash(i + vec2(1.0, 1.0)), f.x), f.y); }
float walkMask(vec2 p) {
  if (abs(p.x) > 5.7 || p.y > 5.5 || p.y < -5.3) return 0.0;
  float m = (1.0 - smoothstep(0.3, 0.75, abs(p.x))) * smoothstep(-4.3, -3.8, p.y) * (1.0 - smoothstep(-1.9, -1.4, p.y));
  m = max(m, 1.0 - smoothstep(0.05, 0.4, abs(length(p - vec2(0.0, 0.4)) - 2.45)));
  m = max(m, (1.0 - smoothstep(0.05, 0.5, abs(abs(p.x) - 3.55))) * (1.0 - smoothstep(2.3, 3.1, abs(p.y))));
  m = max(m, (1.0 - smoothstep(0.05, 0.5, abs(p.y - 4.55))) * (1.0 - smoothstep(2.6, 3.4, abs(p.x))));
  m = max(m, (1.0 - smoothstep(0.1, 0.55, length((p - vec2(sign(p.x) * 1.4, -2.45)) * vec2(1.0, 1.6)))) * step(0.2, abs(p.x)));
  return m * (0.5 + 0.5 * wNoise(p * 3.1)) * (0.75 + 0.25 * wNoise(p * 19.0));
}
`;
function walkWear(m, o) {
  return patchMat(m, 'walk', {
    world: true, decl: WALK_DECL,
    uniforms: { walkAmt: { value: o.amt }, walkRough: { value: o.rough }, walkFlat: { value: o.flat }, walkTint: { value: new THREE.Color().setRGB(...o.tint) } },
    at: {
      map_fragment: 'float wk = walkMask(vWP.xz) * walkAmt; diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * walkTint, wk);',
      roughnessmap_fragment: 'roughnessFactor = mix(roughnessFactor, roughnessFactor * walkRough, wk);',
      normal_fragment_maps: 'normal = normalize(mix(normal, flatN, wk * walkFlat));',
    },
  });
}

// ---------- bump maps drawn from a canvas (walls, ceilings, consoles) ----------
// Treats brightness as height unless a separate height canvas is given. Returns a texture with matching wrap settings.
function normalTex(src, strength) {
  const w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data, H = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) H[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255;
  const c = cnv(w, h), g = c.getContext('2d'), o = g.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (H[y * w + (x + 1) % w] - H[y * w + (x - 1 + w) % w]) * strength, dy = (H[Math.min(h - 1, y + 1) * w + x] - H[Math.max(0, y - 1) * w + x]) * strength;
    const l = Math.hypot(dx, dy, 1), k = (y * w + x) * 4;
    o.data[k] = (-dx / l * 0.5 + 0.5) * 255; o.data[k + 1] = (dy / l * 0.5 + 0.5) * 255; o.data[k + 2] = (1 / l * 0.5 + 0.5) * 255; o.data[k + 3] = 255;
  }
  g.putImageData(o, 0, 0); return tex(c, false);
}

// ---------- screens: pixel grid up close, brighter centre ----------
const SCREEN_PATCH = {
  at: { map_fragment: `{ vec2 tp = vMapUv * vec2(textureSize(map, 0)); vec2 fw = fwidth(tp); float fade = 1.0 - smoothstep(0.14, 0.5, max(fw.x, fw.y));
    vec2 f = fract(tp); float cell = smoothstep(0.0, 0.16, f.x) * smoothstep(1.0, 0.84, f.x) * smoothstep(0.0, 0.2, f.y) * smoothstep(1.0, 0.8, f.y);
    vec3 sub = vec3(step(f.x, 0.333), step(0.333, f.x) * step(f.x, 0.667), step(0.667, f.x));
    diffuseColor.rgb *= mix(vec3(1.0), (0.3 + 0.95 * cell) * mix(vec3(1.0), 0.45 + 1.65 * sub, 0.4), fade * 0.85);
    vec2 cc = vMapUv - 0.5; diffuseColor.rgb *= 1.07 - 0.5 * dot(cc, cc); }` },
};
function patchScreen(mat) { return patchMat(mat, 'scr', SCREEN_PATCH); }
// screen glass: black, reflective, smudged; reflections of the room's lights smear where fingers have been
const GLASS_MAT = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1, metalness: 0, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, envMapIntensity: 3.5, polygonOffset: true, polygonOffsetFactor: -1 });
TX('smudge.png', 'g', (t) => { GLASS_MAT.roughnessMap = t; });
patchMat(GLASS_MAT, 'glass', {
  at: { roughnessmap_fragment: 'float smg = texture(roughnessMap, vRoughnessMapUv).g; roughnessFactor = mix(0.05, 0.55, smg);' },
  before: { opaque_fragment: 'outgoingLight = outgoingLight * mix(0.35, 2.2, smg) + smg * vec3(0.022, 0.021, 0.02);' }, // smudges also scatter a little light
});
let _glassSeed = 1;
function screenGlass(parent, w, h) {
  const geo = new THREE.PlaneGeometry(w, h), uv = geo.attributes.uv, r = mulberry(_glassSeed++ * 97), ou = r(), ov = r();
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 0.45 + ou, uv.getY(i) * h / 0.45 + ov);
  const m = new THREE.Mesh(geo, GLASS_MAT); m.position.z = 0.003; parent.add(m); return m;
}
SURF.ready = () => Promise.all(SURF.loads);
