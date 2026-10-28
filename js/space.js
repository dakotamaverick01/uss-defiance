// USS Defiance · space.js
// The space scene shown on the viewscreen: true-black starfield, a close planet limb with real atmosphere,
// a distant moon, and the convoy freighter the Defiance is escorting. Rendered only by the viewscreen camera (layer 1).
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- framing: the viewscreen camera sits at the forward wall looking down -z ----------
const VS_EYE = new THREE.Vector3(0, 2, FWD_Z);
function fromEye(yawDeg, pitchDeg, dist) {
  const y = yawDeg * D2R, p = pitchDeg * D2R;
  return new THREE.Vector3(-Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p)).multiplyScalar(dist).add(VS_EYE);
}
// The sun is off-screen to the right and a little behind the viewer, so the planet's near limb and the ship's flank are lit.
const SUN = new THREE.Vector3(0.55, 0.3, -0.8).normalize();
const PLANET_R = 60, PLANET_ANG = 40;
const PLANET_POS = fromEye(52, 4, PLANET_R / Math.sin(PLANET_ANG * D2R));
// "Magnify" frames the lit limb, where the atmosphere reads best.
const TARGET_LOOK = (() => { // the point on the limb nearest straight ahead, nudged just inside the disc
  const d = PLANET_POS.clone().sub(VS_EYE), D = d.length(); d.normalize();
  const th = Math.asin(PLANET_R / D) * 0.94, axis = d.clone().cross(new THREE.Vector3(0, -0.12, -1).normalize()).normalize();
  return d.applyAxisAngle(axis, th).multiplyScalar(D * Math.cos(th)).add(VS_EYE);
})();
const TARGET_FOV = 17;

// ---------- stars: many faint, few bright, no colour wash ----------
function starfield(n, size, seed, bMin, bMax, rad) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), r = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(th) * s * rad, u * rad, Math.sin(th) * s * rad], i * 3);
    const b = bMin + Math.pow(r(), 3) * (bMax - bMin), t = r();
    col.set(t < 0.15 ? [b, b * 0.86, b * 0.7] : t > 0.85 ? [b * 0.8, b * 0.88, b] : [b, b * 0.97, b * 0.93], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return space(add(new THREE.Points(g, new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, depthWrite: false }))));
}
starfield(isMobile ? 2600 : 5200, isMobile ? 1.0 : 1.25, 11, 0.05, 0.55, 480);
starfield(420, isMobile ? 1.5 : 1.9, 12, 0.35, 1.1, 470);
starfield(36, isMobile ? 2.1 : 2.8, 13, 0.9, 1.8, 460);

// faint dust lane, used only for the view out of the deck windows (rooms.js)
const nebula = { material: { map: null } };
{
  const c = cnv(512, 300), g = c.getContext('2d'), r = mulberry(3);
  for (let i = 0; i < 30; i++) { const x = 60 + r() * 392, y = 110 + (r() - 0.5) * 120 + (x - 256) * 0.25, rr = 30 + r() * 90; const gr = g.createRadialGradient(x, y, 0, x, y, rr); const c2 = r() < 0.5 ? '150,140,170' : '170,150,130'; gr.addColorStop(0, `rgba(${c2},${0.10 + r() * 0.08})`); gr.addColorStop(1, `rgba(${c2},0)`); g.fillStyle = gr; g.fillRect(0, 0, 512, 300); }
  nebula.material.map = tex(c);
}

// ---------- procedural planet surfaces, baked once per system on the GPU ----------
const NOISE_GLSL = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){ float s=0.0,a=0.5; for(int i=0;i<7;i++){ s+=a*snoise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=0.5; } return s; }
float ridged(vec3 p){ float s=0.0,a=0.5; for(int i=0;i<6;i++){ float n=1.0-abs(snoise(p)); s+=a*n*n; p=p*2.1+vec3(3.1,1.3,7.7); a*=0.5; } return s; }
`;
const BAKE_FRAG = NOISE_GLSL + `
varying vec2 vUv; uniform float type; uniform float seed; uniform float pass;
vec3 dirFromUv(vec2 uv){ float ph=uv.x*6.2831853, th=(1.0-uv.y)*3.14159265; return vec3(-cos(ph)*sin(th), cos(th), sin(ph)*sin(th)); }
void main(){
  vec3 p=dirFromUv(vUv), q=p+vec3(seed, seed*0.37, seed*0.71); float lat=abs(p.y);
  if(pass<0.5){
    vec3 col; float spec=0.0;
    if(type<0.5){ // temperate ocean world
      vec3 w=vec3(fbm(q*1.1), fbm(q*1.1+5.2), fbm(q*1.1+9.7));
      float h=fbm(q*1.5+w*0.7);
      float land=smoothstep(0.06,0.09,h), shelf=smoothstep(-0.08,0.07,h);
      vec3 ocean=mix(vec3(0.006,0.022,0.060), vec3(0.018,0.085,0.130), shelf*0.85);
      float moist=fbm(q*2.2+3.3)*0.6+0.5-lat*0.45, mnt=ridged(q*2.8+w);
      vec3 l=mix(vec3(0.30,0.26,0.19), vec3(0.17,0.15,0.09), smoothstep(0.25,0.5,moist));
      l=mix(l, vec3(0.055,0.090,0.035), smoothstep(0.45,0.72,moist));
      l=mix(l, vec3(0.20,0.18,0.16), smoothstep(0.62,0.85,mnt)*0.75);
      l*=0.8+0.4*(fbm(q*14.0)*0.5+0.5);
      col=mix(ocean,l,land); spec=1.0-land;
      float ice=smoothstep(0.80,0.88,lat+fbm(q*3.0)*0.07);
      col=mix(col,vec3(0.78,0.82,0.86),ice); spec*=1.0-ice;
    } else if(type<1.5){ // banded gas giant
      float t=p.y*5.5+fbm(q*vec3(1.6,7.0,1.6))*0.55+fbm(q*vec3(5.0,22.0,5.0))*0.12;
      float b=sin(t*3.0)*0.5+0.5, b2=sin(t*7.3+1.0)*0.5+0.5;
      col=mix(vec3(0.46,0.33,0.21), vec3(0.84,0.75,0.62), b); col=mix(col, vec3(0.30,0.19,0.12), b2*0.45);
      float sd=distance(p, normalize(vec3(0.6,-0.32,0.72)))+fbm(q*7.0)*0.025;
      col=mix(col, vec3(0.66,0.32,0.20), smoothstep(0.15,0.08,sd));
      col*=0.9+0.2*(fbm(q*16.0)*0.5+0.5);
    } else if(type<2.5){ // ice-shelled moon
      col=mix(vec3(0.66,0.72,0.76), vec3(0.86,0.88,0.90), fbm(q*2.0)*0.5+0.5);
      float lin=pow(ridged(q*3.6),3.0);
      col=mix(col, vec3(0.42,0.27,0.19), smoothstep(0.30,0.55,lin)*0.65);
      col*=0.92+0.12*(fbm(q*18.0)*0.5+0.5); spec=0.15;
    } else if(type<3.5){ // young volcanic world
      float cr=ridged(q*3.2);
      col=mix(vec3(0.05,0.04,0.035), vec3(0.13,0.10,0.08), fbm(q*5.0)*0.5+0.5);
      col=mix(col, vec3(0.02,0.015,0.012), smoothstep(0.55,0.8,cr));
    } else { // airless rock
      col=vec3(0.30,0.29,0.28)*(0.7+0.4*(fbm(q*3.0)*0.5+0.5)); col*=0.8+0.35*ridged(q*7.0);
    }
    gl_FragColor=vec4(col,spec);
  } else {
    float c=0.0, glow=0.0;
    if(type<0.5){
      vec3 w=vec3(fbm(q*1.8+11.0), fbm(q*1.8+21.0), fbm(q*1.8+31.0));
      float n=fbm(q*vec3(2.4,3.2,2.4)+w*1.3);
      c=smoothstep(0.02,0.42,n+0.08);
      c*=0.55+0.45*smoothstep(-0.3,0.35,fbm(q*10.0+w));
      c=max(c, smoothstep(0.86,0.95,lat)*0.6);
    } else if(type<1.5){
      c=smoothstep(0.2,0.6,fbm(q*vec3(3.0,12.0,3.0)))*0.12;
    } else if(type>2.5 && type<3.5){
      float cr=ridged(q*3.2); glow=smoothstep(0.58,0.82,cr)*(0.55+0.45*(fbm(q*9.0)*0.5+0.5));
      c=smoothstep(0.25,0.75,fbm(q*1.4+4.0))*0.28;
    }
    gl_FragColor=vec4(c,glow,0.0,1.0);
  }
}`;
const bakeScene = new THREE.Scene(), bakeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const bakeMat = new THREE.ShaderMaterial({
  uniforms: { type: { value: 0 }, seed: { value: 0 }, pass: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }',
  fragmentShader: BAKE_FRAG, depthTest: false, depthWrite: false,
});
bakeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bakeMat));
const PLANET_TYPES = { ocean: 0, gas: 1, ice: 2, lava: 3, rock: 4 };
function bakeTarget(w, h) {
  const t = new THREE.WebGLRenderTarget(w, h, { depthBuffer: false, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: true, wrapS: THREE.RepeatWrapping });
  t.texture.anisotropy = maxAniso; return t;
}
function bakePlanet(type, seed, w, surf, cloud) {
  const prev = renderer.getRenderTarget();
  bakeMat.uniforms.type.value = PLANET_TYPES[type]; bakeMat.uniforms.seed.value = seed * 0.731;
  bakeMat.uniforms.pass.value = 0; renderer.setRenderTarget(surf); renderer.render(bakeScene, bakeCam);
  bakeMat.uniforms.pass.value = 1; renderer.setRenderTarget(cloud); renderer.render(bakeScene, bakeCam);
  renderer.setRenderTarget(prev);
}

// ---------- planet shading: soft terminator, ocean glint, clouds, thin bright atmosphere ----------
const PLANET_VERT = 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }';
const planetUniforms = () => ({
  surf: { value: null }, clouds: { value: null }, lightDir: { value: new THREE.Vector3(1, 0, 0) }, opacity: { value: 1 }, scan: { value: 0 },
  atmo: { value: new THREE.Color(0.30, 0.55, 1.0) }, atmoK: { value: 1 }, glowCol: { value: new THREE.Color(1.0, 0.32, 0.07) }, drift: { value: 0 }, sun: { value: 1.45 },
});
const planetMat = new THREE.ShaderMaterial({
  uniforms: planetUniforms(), vertexShader: PLANET_VERT, transparent: true,
  fragmentShader: `uniform sampler2D surf, clouds; uniform vec3 lightDir, atmo, glowCol; uniform float opacity, scan, atmoK, drift, sun;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 n=normalize(vN), L=normalize(lightDir), V=normalize(vV);
  vec4 s=texture2D(surf,vUv); vec4 cl=texture2D(clouds, vUv+vec2(drift,0.0));
  float ndl=dot(n,L), diff=max(ndl,0.0), day=smoothstep(-0.12,0.18,ndl);
  float c=cl.r;
  vec3 col=s.rgb*(1.0-0.35*c)*diff*sun;
  vec3 H=normalize(L+V); col+=vec3(1.0,0.93,0.82)*pow(max(dot(n,H),0.0),70.0)*s.a*0.9*day*(1.0-c)*sun;
  col=mix(col, vec3(0.92,0.93,0.95)*(diff*sun*0.95+0.004), c);
  col*=mix(vec3(1.0,0.50,0.30), vec3(1.0), smoothstep(-0.05,0.30,ndl));
  float mu=max(dot(n,V),0.0), fr=pow(1.0-mu,2.6);
  col=mix(col, atmo*diff*sun*0.32, atmoK*(0.16+0.5*fr));
  col+=atmo*atmoK*(fr*1.6+0.05)*smoothstep(-0.25,0.55,ndl)*sun*0.5;
  col+=glowCol*cl.g*(1.2-day)*2.2;
  col+=vec3(0.35,0.9,0.85)*scan*smoothstep(0.02,0.0,abs(fract(vUv.y*40.0)-0.5)-0.47)*0.5;
  gl_FragColor=vec4(col,opacity);
}`,
});
const atmoMat = new THREE.ShaderMaterial({
  uniforms: planetUniforms(), vertexShader: PLANET_VERT, transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
  fragmentShader: `uniform vec3 lightDir, atmo; uniform float opacity, atmoK, sun; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 n=normalize(vN), L=normalize(lightDir), V=normalize(vV);
  float a=clamp(-dot(n,V)/0.26,0.0,1.0); float g=pow(a,3.0);
  float lit=smoothstep(-0.30,0.50,dot(n,L));
  gl_FragColor=vec4(atmo*atmoK*g*lit*sun*0.55*opacity,1.0);
}`,
});
const planet = space(mesh(new THREE.SphereGeometry(PLANET_R, isMobile ? 96 : 160, isMobile ? 64 : 110), planetMat, PLANET_POS.x, PLANET_POS.y, PLANET_POS.z));
planet.rotation.set(0.12, 2.4, 0.22);
const atmoShell = space(mesh(new THREE.SphereGeometry(PLANET_R * 1.03, isMobile ? 96 : 160, isMobile ? 64 : 110), atmoMat, PLANET_POS.x, PLANET_POS.y, PLANET_POS.z));
const scanRing = space(mesh(new THREE.TorusGeometry(PLANET_R * 1.12, 0.3, 6, 120), new THREE.MeshBasicMaterial({ color: 0x6fd6c8, transparent: true, opacity: 0, depthWrite: false }), PLANET_POS.x, PLANET_POS.y, PLANET_POS.z));
scanRing.visible = false; // scans now sweep across the surface itself
const PLANET_TEX = window.PLANET_RES || (isMobile ? 2048 : 4096);
const planetSurf = bakeTarget(PLANET_TEX, PLANET_TEX / 2), planetCloud = bakeTarget(PLANET_TEX, PLANET_TEX / 2);
planetMat.uniforms.surf.value = planetSurf.texture; planetMat.uniforms.clouds.value = planetCloud.texture;
const ATMO = { ocean: [[0.30, 0.55, 1.0], 1.0], gas: [[1.0, 0.80, 0.60], 0.42], ice: [[0.62, 0.80, 1.0], 0.28], lava: [[1.0, 0.50, 0.28], 0.32] };
function setSystem(i) {
  const sys = SYSTEMS[i];
  bakePlanet(sys.type, sys.seed, PLANET_TEX, planetSurf, planetCloud);
  const [c, k] = ATMO[sys.type] || ATMO.ocean;
  [planetMat, atmoMat].forEach((m) => { m.uniforms.atmo.value.setRGB(c[0], c[1], c[2]); m.uniforms.atmoK.value = k; });
}
setSystem(0);

// ---------- a small airless moon, far off to the upper right ----------
const moonMat = new THREE.ShaderMaterial({ uniforms: planetUniforms(), vertexShader: PLANET_VERT, fragmentShader: planetMat.fragmentShader, transparent: true });
{
  const s = bakeTarget(512, 256), c = bakeTarget(64, 32);
  bakePlanet('rock', 5, 512, s, c); moonMat.uniforms.surf.value = s.texture; moonMat.uniforms.clouds.value = c.texture; moonMat.uniforms.atmoK.value = 0;
}
const MOON_POS = fromEye(-26, 13, 420);
const moon = space(mesh(new THREE.SphereGeometry(5.5, 48, 32), moonMat, MOON_POS.x, MOON_POS.y, MOON_POS.z));

// ---------- the convoy freighter we are escorting (original design) ----------
const SHIP_POS = fromEye(-6, -7, 50);
const ship = space(new THREE.Group()); ship.position.copy(SHIP_POS); ship.rotation.set(0.16, -0.58, 0.06, 'YXZ'); scene.add(ship);
const shipLights = [];
{
  const S = (o) => { o.traverse((c) => c.layers.set(1)); return o; };
  const part = (geo, mat, x, y, z, parent) => S(mesh(geo, mat, x, y, z, parent || ship));
  // hull plating: panel tiles in slightly different greys with fine seams and grime
  const hc = cnv(512, 512), hg = hc.getContext('2d'), r = mulberry(91);
  hg.fillStyle = '#8b8e93'; hg.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { const w = 20 + r() * 90, h = 14 + r() * 50, x = r() * 512, y = r() * 512, v = 120 + r() * 40 | 0; hg.fillStyle = `rgb(${v},${v + 2},${v + 6})`; hg.fillRect(x, y, w, h); hg.strokeStyle = 'rgba(30,32,36,0.55)'; hg.lineWidth = 1; hg.strokeRect(x + 0.5, y + 0.5, w, h); }
  for (let i = 0; i < 40; i++) { const g2 = hg.createRadialGradient(r() * 512, r() * 512, 0, r() * 512, r() * 512, 60 + r() * 80); g2.addColorStop(0, 'rgba(40,36,30,0.18)'); g2.addColorStop(1, 'rgba(40,36,30,0)'); hg.fillStyle = g2; hg.fillRect(0, 0, 512, 512); }
  const hullTex = tex(hc); hullTex.wrapS = hullTex.wrapT = THREE.RepeatWrapping;
  const hull = new THREE.MeshStandardMaterial({ map: hullTex, roughness: 0.55, metalness: 0.35, envMapIntensity: 0 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.7, metalness: 0.4, envMapIntensity: 0 });
  // command section: a long flattened hull with a band of lit ports
  const wc = cnv(512, 256), wg = wc.getContext('2d'); wg.fillStyle = '#000'; wg.fillRect(0, 0, 512, 256);
  for (const [row, n] of [[118, 46], [134, 40], [150, 30]]) for (let i = 0; i < n; i++) { if (r() < 0.28) continue; const u = 512 * (0.05 + 0.9 * i / n); if (u > 190 && u < 322) continue; wg.fillStyle = r() < 0.15 ? '#a8c8ff' : '#ffd9a0'; wg.fillRect(u, row, 4, 3); }
  const cmd = new THREE.MeshStandardMaterial({ map: hullTex, roughness: 0.5, metalness: 0.35, envMapIntensity: 0, emissive: 0xffffff, emissiveMap: tex(wc), emissiveIntensity: 2.2 });
  const prof = [[0, 0], [2.3, 0], [2.7, 1.4], [2.8, 5.2], [2.5, 8.4], [1.8, 10.4], [0.9, 11.4], [0, 11.7]].map(([x, y]) => new THREE.Vector2(x, y));
  const hg2 = new THREE.LatheGeometry(prof, 40); hg2.rotateX(Math.PI / 2); hg2.scale(1, 0.52, 1);
  part(hg2, cmd, 0, 0.2, 6.5);
  part(new THREE.SphereGeometry(0.9, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hull, 0, 1.6, 13.4).scale.set(1.2, 0.5, 1.6);
  part(new THREE.TorusGeometry(1.25, 0.18, 10, 28), dark, 0, 0.1, 6.6);
  const band = new THREE.MeshStandardMaterial({ color: 0x6e2a22, roughness: 0.6, metalness: 0.2, envMapIntensity: 0 });
  const bg = new THREE.LatheGeometry(prof.slice(2, 4).map((v) => new THREE.Vector2(v.x + 0.02, v.y)), 40, -0.9, 1.8); bg.rotateX(Math.PI / 2); bg.scale(1, 0.52, 1);
  part(bg, band, 0, 0.2, 6.5).scale.z = 0.35;
  part(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), dark, 0.6, 2.3, 11.2);
  part(BOX(0.9, 0.05, 0.6), dark, 0.6, 3.35, 11.2);
  // spine and cargo: standard containers locked to a keel truss
  part(BOX(1.3, 1.0, 21), dark, 0, 0, -4.5);
  const cargo = [0x7d7a72, 0x8f6a4c, 0x5f6a5b, 0x9a948a, 0x6a6e78, 0x7a5a48];
  const rc = cnv(128, 64), rg = rc.getContext('2d'); rg.fillStyle = '#c8c8c8'; rg.fillRect(0, 0, 128, 64);
  for (let x = 0; x < 128; x += 8) { rg.fillStyle = 'rgba(0,0,0,0.22)'; rg.fillRect(x, 0, 3, 64); rg.fillStyle = 'rgba(255,255,255,0.12)'; rg.fillRect(x + 3, 0, 1, 64); }
  rg.fillStyle = 'rgba(0,0,0,0.3)'; rg.fillRect(0, 0, 128, 3); rg.fillRect(0, 61, 128, 3);
  const ribTex = tex(rc);
  for (let k = 0; k < 4; k++) for (const sx of [-1, 1]) for (const yy of [0, 1.95]) {
    if (yy > 0 && (k + (sx > 0 ? 1 : 0)) % 3 === 0) continue;
    const m = new THREE.MeshStandardMaterial({ map: ribTex, color: cargo[(k * 3 + (sx > 0 ? 1 : 0) + (yy > 0 ? 2 : 0)) % cargo.length], roughness: 0.65, metalness: 0.2, envMapIntensity: 0 });
    part(RBOX(2.1, 1.8, 3.8, 0.08), m, sx * 1.75, yy - 0.4, 3.0 - k * 4.4);
  }
  // engineering block, pylons and drive nacelles
  part(RBOX(4.8, 2.6, 5.4, 0.25), hull, 0, 0.1, -16.5);
  for (const sx of [-1, 1]) for (let k = 0; k < 6; k++) part(BOX(0.07, 1.7, 0.5), dark, sx * 2.5, 0.1, -14.4 - k * 0.78);
  for (let k = 0; k < 7; k++) part(BOX(5.6, 0.05, 0.9), dark, 0, 1.45, -14.2 - k * 0.7);
  const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 0.62, 1.0).multiplyScalar(2.6) });
  const exhaust = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.55, 0.22).multiplyScalar(2.2) });
  for (const sx of [-1, 1]) {
    const py = part(BOX(2.9, 0.26, 3.0), dark, sx * 3.6, -0.75, -15.6); py.rotation.z = sx * -0.3;
    const nac = part(new THREE.CylinderGeometry(0.85, 0.75, 13, 20), hull, sx * 5.0, -1.45, -15.0); nac.rotation.x = Math.PI / 2;
    part(new THREE.SphereGeometry(0.85, 20, 12), hull, sx * 5.0, -1.45, -8.5).scale.z = 1.8;
    part(BOX(0.08, 0.32, 10.5), glow, sx * 4.16, -1.45, -15.2);
    part(new THREE.CircleGeometry(0.55, 20), exhaust, sx * 5.0, -1.45, -21.52).rotation.y = Math.PI;
    part(new THREE.CircleGeometry(0.7, 20), exhaust, sx * 1.3, 0.1, -19.22).rotation.y = Math.PI;
  }
  // running lights: red to port, green to starboard, white strobes on the nacelle tails, amber beacon on top
  const lc = cnv(64, 64), lg = lc.getContext('2d'), gr = lg.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); lg.fillStyle = gr; lg.fillRect(0, 0, 64, 64);
  const lt = tex(lc);
  [[-2.75, 0.2, 9.0, [3, 0.25, 0.2], 0, 1], [2.75, 0.2, 9.0, [0.3, 3, 0.8], 0, 1], [-5.0, -1.45, -21.6, [3, 3, 3], 0.1, 0.07], [5.0, -1.45, -21.6, [3, 3, 3], 0.6, 0.07], [0, 1.6, -16.0, [3, 1.6, 0.4], 0.35, 0.5]]
    .forEach(([x, y, z, c, ph, duty]) => {
      const sp = S(new THREE.Sprite(new THREE.SpriteMaterial({ map: lt, color: new THREE.Color(c[0], c[1], c[2]), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
      sp.position.set(x, y, z); sp.scale.setScalar(duty < 1 ? 1.5 : 1.0); ship.add(sp); shipLights.push({ sp, ph, duty });
    });
}
// light for the ship only (layer 1): the sun as key, blue planet-shine as fill
const sunLight = space(add(new THREE.DirectionalLight(0xfff1de, 4.2)));
sunLight.castShadow = true; sunLight.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048); sunLight.shadow.bias = -0.0004; sunLight.shadow.normalBias = 0.05;
Object.assign(sunLight.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 50, far: 160 }); sunLight.shadow.camera.updateProjectionMatrix();
sunLight.position.copy(SHIP_POS).addScaledVector(SUN, 100); sunLight.target.position.copy(SHIP_POS); scene.add(sunLight.target);
const shineLight = space(add(new THREE.DirectionalLight(0x6d93d6, 0.4)));
shineLight.position.copy(PLANET_POS); shineLight.target.position.copy(SHIP_POS); scene.add(shineLight.target);
space(add(new THREE.AmbientLight(0x1a1f2a, 0.25)));
ship.traverse((o) => { if (o.isMesh && !o.material.isMeshBasicMaterial) { o.castShadow = true; o.receiveShadow = true; } });

let spaceT = 0;
const _tmpL = new THREE.Vector3();
function updateSpace(dt, fade) {
  spaceT += dt;
  const on = fade > 0.01;
  planet.visible = atmoShell.visible = moon.visible = on;
  planetMat.uniforms.opacity.value = atmoMat.uniforms.opacity.value = moonMat.uniforms.opacity.value = fade;
  planet.rotation.y += dt * (reduceMotion ? 0.0004 : 0.0012);
  planetMat.uniforms.drift.value = spaceT * 0.0004;
  _tmpL.copy(SUN).transformDirection(vcam.matrixWorldInverse);
  [planetMat, atmoMat, moonMat].forEach((m) => m.uniforms.lightDir.value.copy(_tmpL));
  ship.visible = fade > 0.4;
  if (ship.visible) {
    const k = reduceMotion ? 0.3 : 1;
    ship.position.set(SHIP_POS.x + Math.sin(spaceT * 0.11) * 0.5 * k, SHIP_POS.y + Math.sin(spaceT * 0.17) * 0.3 * k, SHIP_POS.z);
    ship.rotation.z = 0.05 + Math.sin(spaceT * 0.09) * 0.015 * k;
    shipLights.forEach((l) => { l.sp.material.opacity = l.duty >= 1 ? 1 : (((spaceT * 0.7 + l.ph) % 1) < l.duty ? 1 : 0.06); });
  }
}

// ---------- warp streaks ----------
const N_STREAK = 900;
const streakPos = new Float32Array(N_STREAK * 6), streakCol = new Float32Array(N_STREAK * 6), streakXYZ = new Float32Array(N_STREAK * 3);
function seedStreak(i, zr) {
  let x, y; do { x = (Math.random() - 0.5) * 150; y = (Math.random() - 0.5) * 80 + 2; } while (Math.hypot(x, y - 2) < 4);
  streakXYZ[i * 3] = x; streakXYZ[i * 3 + 1] = y; streakXYZ[i * 3 + 2] = zr;
}
for (let i = 0; i < N_STREAK; i++) { seedStreak(i, -360 + Math.random() * 350); const b = 0.6 + Math.random() * 0.4; streakCol.set([b, b, b, 0.1, 0.25 * b, 0.45 * b], i * 6); }
const streakGeo = new THREE.BufferGeometry();
streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPos, 3));
streakGeo.setAttribute('color', new THREE.BufferAttribute(streakCol, 3));
const streakMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
const streaks = space(new THREE.LineSegments(streakGeo, streakMat)); streaks.frustumCulled = false; streaks.visible = false; scene.add(streaks);