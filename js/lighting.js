// USS Defiance · lighting.js
// Bridge light rig (hemisphere, central spot, fore/aft fills, viewscreen spill).
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- lights ----------
const hemi = add(new THREE.HemisphereLight(0xfff0e0, 0x2a2018, 0.1));
const lCenter = add(new THREE.SpotLight(0xffe2c4, 1.25, 12, 0.95, 0.85, 0.4)); lCenter.position.set(0, 3.25, 0.4);
lCenter.target.position.set(0, 0, 0.2); scene.add(lCenter.target);
lCenter.castShadow = true; lCenter.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048); lCenter.shadow.bias = -0.0006; lCenter.shadow.normalBias = 0.02; lCenter.shadow.radius = 4; lCenter.shadow.camera.near = 0.3; lCenter.shadow.camera.far = 8;
const lFwd = add(new THREE.PointLight(0xffdcb4, 0.5, 6.5, 0.5)); lFwd.position.set(0, 2.9, -3.0);
const lAft = add(new THREE.PointLight(0xffdcb4, 0.5, 6.5, 0.5)); lAft.position.set(0, 2.9, 3.5);
const lScreen = add(new THREE.PointLight(0x9fc0ff, 0.4, 7, 0.53)); lScreen.position.set(0, 1.9, FWD_Z + 1.0);
const BASE_I = { hemi: 0.1, center: 1.3, fwd: 0.34, aft: 0.34 };
