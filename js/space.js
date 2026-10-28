// USS Defiance · space.js
// The space scene shown on the viewscreen (starfield, nebula, planet, moon, platform, warp streaks).
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- space (rendered only by the viewscreen camera, layer 1) ----------
function starfield(n, size, rad) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), r = mulberry(size * 100 | 0);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    pos[i * 3] = Math.cos(th) * s * rad; pos[i * 3 + 1] = u * rad; pos[i * 3 + 2] = Math.sin(th) * s * rad;
    const tint = r(), b = 0.55 + r() * 0.45;
    col[i * 3] = b * (tint < 0.3 ? 0.8 : 1); col[i * 3 + 1] = b * 0.92; col[i * 3 + 2] = b * (tint > 0.75 ? 0.8 : 1);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return space(add(new THREE.Points(g, new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, depthWrite: false, toneMapped: false }))));
}
starfield(3200, 1.4, 420); starfield(260, 2.4, 410);
const nebC = cnv(512, 300); {
  const g = nebC.getContext('2d'); const r = mulberry(3);
  const blobs = [['150,80,190', 0.35], ['60,160,180', 0.3], ['230,120,140', 0.24], ['110,110,220', 0.25]];
  for (let i = 0; i < 26; i++) { const [c, a] = blobs[i % 4]; const x = 80 + r() * 352, y = 70 + r() * 160, rr = 40 + r() * 110; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(0, 0, 512, 300); }
}
const nebula = space(new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(nebC), transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })));
nebula.position.set(110, 40, -380); nebula.scale.set(640, 375, 1); scene.add(nebula);

function planetCanvas(type, seed) {
  const W = 512, H = 256, c = cnv(W, H), g = c.getContext('2d'), r = mulberry(seed);
  const blob = (x, y, rx, ry, fill) => { g.fillStyle = fill; g.beginPath(); g.ellipse(x, y, rx, ry, (r() - 0.5) * 0.6, 0, 7); g.fill(); };
  if (type === 'gas') {
    for (let y = 0; y < H; y++) { const v = y / H, b = Math.sin(v * 24 + Math.sin(v * 7) * 2) * 0.5 + 0.5, b2 = Math.sin(v * 61) * 0.5 + 0.5; g.fillStyle = `rgb(${196 + 45 * b - 35 * b2 | 0},${150 + 40 * b - 28 * b2 | 0},${108 + 30 * b - 24 * b2 | 0})`; g.fillRect(0, y, W, 1); }
    for (let i = 0; i < 300; i++) blob(r() * W, r() * H, 20 + r() * 80, 1 + r() * 3, `rgba(${r() < 0.5 ? '255,235,210' : '120,80,50'},${0.05 + r() * 0.08})`);
    blob(W * 0.62, H * 0.64, 24, 11, 'rgba(190,90,60,0.85)');
  } else if (type === 'ocean') {
    g.fillStyle = '#123f68'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) blob(r() * W, r() * H, 20 + r() * 60, 10 + r() * 30, r() < 0.5 ? 'rgba(8,36,74,0.25)' : 'rgba(40,110,150,0.2)');
    for (let k = 0; k < 6; k++) { const cx = r() * W, cy = H * (0.22 + r() * 0.56); for (let i = 0; i < 46; i++) blob(cx + (r() - 0.5) * 100, cy + (r() - 0.5) * 50, 4 + r() * 15, 3 + r() * 11, `rgba(${80 + r() * 60 | 0},${105 + r() * 45 | 0},${55 + r() * 25 | 0},0.9)`); }
    g.fillStyle = 'rgba(235,245,255,0.92)'; g.fillRect(0, 0, W, 13); g.fillRect(0, H - 15, W, 15);
    for (let i = 0; i < 220; i++) blob(r() * W, r() * H, 10 + r() * 42, 2 + r() * 6, `rgba(255,255,255,${0.12 + r() * 0.28})`);
  } else if (type === 'ice') {
    g.fillStyle = '#bcd3df'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) blob(r() * W, r() * H, 10 + r() * 50, 6 + r() * 26, r() < 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(140,175,200,0.3)');
    g.lineWidth = 1.4;
    for (let i = 0; i < 80; i++) { g.strokeStyle = `rgba(140,90,70,${0.25 + r() * 0.4})`; g.beginPath(); const x = r() * W, y = r() * H; g.moveTo(x, y); g.bezierCurveTo(x + (r() - 0.5) * 120, y + (r() - 0.5) * 60, x + (r() - 0.5) * 120, y + (r() - 0.5) * 60, x + (r() - 0.5) * 200, y + (r() - 0.5) * 80); g.stroke(); }
  } else {
    g.fillStyle = '#2b1b15'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) blob(r() * W, r() * H, 10 + r() * 50, 6 + r() * 26, r() < 0.5 ? 'rgba(10,6,5,0.45)' : 'rgba(80,50,40,0.35)');
    g.lineWidth = 2;
    for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(255,${110 + r() * 60 | 0},40,${0.4 + r() * 0.5})`; g.beginPath(); const x = r() * W, y = r() * H; g.moveTo(x, y); for (let s = 0; s < 4; s++) g.lineTo(x + (r() - 0.5) * 90, y + (r() - 0.5) * 50); g.stroke(); }
    for (let i = 0; i < 40; i++) blob(r() * W, r() * H, 2 + r() * 5, 2 + r() * 4, 'rgba(255,170,70,0.9)');
  }
  return c;
}
const SUN = new THREE.Vector3(1, 0.35, 0.45).normalize();
const PLANET_POS = new THREE.Vector3(-46, -10, -165), PLANET_R = 26;
const planetMat = new THREE.ShaderMaterial({
  uniforms: { map: { value: null }, lightDir: { value: new THREE.Vector3() }, opacity: { value: 1 }, rim: { value: new THREE.Color(0x78beff) }, scan: { value: 0 } },
  vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
  fragmentShader: 'uniform sampler2D map; uniform vec3 lightDir; uniform float opacity; uniform vec3 rim; uniform float scan; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vec3 n=normalize(vN); vec3 c=texture2D(map,vUv).rgb; float d=max(dot(n,normalize(lightDir)),0.0); float f=pow(1.0-max(dot(n,vV),0.0),2.5); vec3 col=c*(0.035+1.05*d)+rim*f*(0.2+0.9*d); col+=vec3(0.35,0.9,0.85)*scan*smoothstep(0.02,0.0,abs(fract(vUv.y*6.0)-0.5)-0.47)*0.6; gl_FragColor=vec4(col,opacity); }',
  transparent: true,
});
const planet = space(mesh(new THREE.SphereGeometry(PLANET_R, 64, 40), planetMat, PLANET_POS.x, PLANET_POS.y, PLANET_POS.z));
planet.rotation.z = 0.25;
const haloMat = new THREE.SpriteMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: 0.7 });
const halo = space(new THREE.Sprite(haloMat)); halo.position.copy(PLANET_POS); halo.scale.setScalar(PLANET_R * 2.6); scene.add(halo);
const scanRing = space(mesh(new THREE.TorusGeometry(PLANET_R * 1.12, 0.3, 6, 120), new THREE.MeshBasicMaterial({ color: 0x6fd6c8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), PLANET_POS.x, PLANET_POS.y, PLANET_POS.z));
function setSystem(i) {
  const sys = SYSTEMS[i];
  if (planetMat.uniforms.map.value) planetMat.uniforms.map.value.dispose();
  planetMat.uniforms.map.value = tex(planetCanvas(sys.type, sys.seed), false);
  const [r, g, b] = sys.halo.split(',').map(Number);
  planetMat.uniforms.rim.value.setRGB(r / 255, g / 255, b / 255);
  const hc = cnv(256, 256), hg = hc.getContext('2d'), gr = hg.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, `rgba(${sys.halo},0)`); gr.addColorStop(0.74, `rgba(${sys.halo},0)`); gr.addColorStop(0.78, `rgba(${sys.halo},0.55)`); gr.addColorStop(1, `rgba(${sys.halo},0)`);
  hg.fillStyle = gr; hg.fillRect(0, 0, 256, 256);
  if (haloMat.map) haloMat.map.dispose();
  haloMat.map = tex(hc); haloMat.needsUpdate = true;
}
setSystem(0);
const moonMat = planetMat.clone();
{ const c = cnv(256, 128), g = c.getContext('2d'), r = mulberry(5); g.fillStyle = '#8f8a84'; g.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 220; i++) { const x = r() * 256, y = r() * 128, rad = 1 + r() * r() * 12; g.fillStyle = `rgba(${r() < 0.5 ? '60,56,52' : '180,174,166'},${0.25 + r() * 0.35})`; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); }
  moonMat.uniforms.map.value = tex(c, false); moonMat.uniforms.rim.value = new THREE.Color(0x9aa0aa); }
const moon = space(mesh(new THREE.SphereGeometry(4.2, 40, 24), moonMat, PLANET_POS.x + 52, PLANET_POS.y + 20, PLANET_POS.z + 25));
const platform = new THREE.Group(); platform.position.set(-8, 6, -118); platform.rotation.set(0.5, 0.3, 0.25); space(platform); scene.add(platform);
{
  const dark = new THREE.MeshBasicMaterial({ color: 0x3e434c, transparent: true }), lit = new THREE.MeshBasicMaterial({ color: 0x8d949f, transparent: true });
  const ring = space(new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.35, 8, 64), dark)); ring.rotation.x = Math.PI / 2; platform.add(ring);
  const ring2 = space(new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.12, 6, 64), lit)); ring2.rotation.x = Math.PI / 2; ring2.position.y = 0.3; platform.add(ring2);
  const hub = space(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 3.4, 16), dark)); platform.add(hub);
  const top = space(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.9, 1.0, 16), lit)); top.position.y = 2.2; platform.add(top);
  for (let i = 0; i < 4; i++) { const sp = space(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 4.0), dark)); sp.rotation.y = i * Math.PI / 4; platform.add(sp); }
  const dish = space(new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.2, 0.4, 16), lit)); dish.position.y = -2.0; platform.add(dish);
}
const platformLights = [];
{
  const c = cnv(32, 32), g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  const t = tex(c);
  [[4.2, 0, 0, 0xff4030, 0], [-4.2, 0, 0, 0x40ff90, 0.5], [0, 0, 4.2, 0xffffff, 0.25], [0, 0, -4.2, 0xffffff, 0.75], [0, 2.8, 0, 0xffffff, 0.1]].forEach(([x, y, z, col, ph]) => {
    const sp = space(new THREE.Sprite(new THREE.SpriteMaterial({ map: t, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })));
    sp.position.set(x, y, z); sp.scale.setScalar(1.6); platform.add(sp); platformLights.push({ sp, ph });
  });
}
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

// =====================================================================
