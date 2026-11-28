// USS Defiance · batch.js
// Fewer draw calls (roadmap F3). A draw call is one "draw this object" instruction to the graphics chip; the bridge
// was about 1,550 a frame because every trim strip, frame and bolt was its own object. Once the decks are built and
// the light-map atlas is laid out (bake.js), this merges fixed objects that share a material into one object per
// deck, per material and per 6 m zone (zones let the camera still skip what is behind it).
// Left alone: anything that moves (doors, chairs, shutters, the lift, the exterior), light-map receivers (the bake's
// layout must not change), screens and other one-off materials (nothing to merge with), transparent or space-layer
// objects, hidden pick targets, and rotated parts whose material uses edge wear (that effect reads the part's own
// orientation). Probe-lit materials read light by world position, so merged parts are lit exactly as before.
// window.DEFIANCE_NO_BATCH (or #nobatch) turns it off, for checks that look at each part on its own.
// Files share one global scope and load in order (see index.html).
'use strict';

const BATCH = { before: 0, after: 0, groups: 0 };
(function batchDecks() {
  if (window.DEFIANCE_NO_BATCH || location.hash === '#nobatch') return;
  scene.updateMatrixWorld(true);
  const skip = new Set([EXTSET, holo, ...DECALS]); // decals are switched on and off with the bake
  SHUTTERS.forEach((s) => s.slats.forEach((x) => skip.add(x)));
  // moving parts: what rides on one is merged in that part's own frame, so it still moves as one
  const movers = new Set();
  DOORS.forEach((d) => { if (d.L) movers.add(d.L); if (d.Rr) movers.add(d.Rr); });
  if (D2.door) { movers.add(D2.door.L); movers.add(D2.door.Rr); } // Deck 2's lift landing doors (lift.js slides them)
  CHAIRS.forEach((c) => [c.g, c.sw, c.rock].forEach((x) => x && movers.add(x)));
  const receivers = new Set((BAKE.receivers || []).map((r) => r.mesh || r));
  const edgeWear = (m) => (m._patches || []).some((p) => /^tri[^ ]*e/.test(p.key));
  const axisAligned = (mw) => { const e = mw.elements; for (const i of [0, 1, 2, 4, 5, 6, 8, 9, 10]) { const v = Math.abs(e[i]); if (v > 1e-4 && Math.abs(v - 1) > 1e-4) return false; } return true; };
  const groups = new Map(), box = new THREE.Box3(), ctr = new THREE.Vector3();
  scene.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh) return;
    for (let p = o; p; p = p.parent) if (skip.has(p) || !p.visible || p.userData.noBatch) return;
    if (movers.has(o)) return;
    const m = o.material, g = o.geometry;
    if (Array.isArray(m) || m.transparent || o.layers.mask !== 1 || receivers.has(o) || o.renderOrder || Object.prototype.hasOwnProperty.call(o, 'onBeforeRender')) return;
    if (!g.attributes.position || g.attributes.color || g.morphAttributes.position || g.isInstancedBufferGeometry || o.isTroikaText || m.isShaderMaterial) return; // 3D text builds its own geometry later
    // the frame to merge in: the nearest moving part above it, else its deck (Deck 2's group, or the scene for Deck 1)
    let root = scene; for (let p = o.parent; p; p = p.parent) { if (movers.has(p) || p === DECK2) { root = p; break; } }
    root.updateMatrixWorld(); if (edgeWear(m) && !axisAligned(new THREE.Matrix4().copy(root.matrixWorld).invert().multiply(o.matrixWorld))) return;
    box.setFromObject(o).getCenter(ctr);
    const zone = movers.has(root) ? '' : Math.floor(ctr.x / 6) + ',' + Math.floor(ctr.y / 6) + ',' + Math.floor(ctr.z / 6);
    const key = root.uuid + '|' + m.uuid + '|' + zone;
    (groups.get(key) || groups.set(key, { root, mat: m, list: [] }).get(key)).list.push(o);
  });
  const inv = new THREE.Matrix4(), mtx = new THREE.Matrix4(), nm = new THREE.Matrix3(), v = new THREE.Vector3();
  groups.forEach(({ root, mat, list }) => {
    BATCH.before += list.length; if (list.length < 2) { BATCH.after += list.length; return; }
    inv.copy(root.matrixWorld).invert();
    let nv = 0, ni = 0; list.forEach((o) => { const g = o.geometry; nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; });
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let ov = 0, oi = 0;
    list.forEach((o) => {
      const g = o.geometry, P = g.attributes.position; if (!g.attributes.normal) g.computeVertexNormals();
      const N = g.attributes.normal, U = g.attributes.uv; mtx.multiplyMatrices(inv, o.matrixWorld); nm.getNormalMatrix(mtx);
      for (let k = 0; k < P.count; k++) {
        v.fromBufferAttribute(P, k).applyMatrix4(mtx); pos.set([v.x, v.y, v.z], (ov + k) * 3);
        v.fromBufferAttribute(N, k).applyMatrix3(nm).normalize(); nor.set([v.x, v.y, v.z], (ov + k) * 3);
        if (U) uv.set([U.getX(k), U.getY(k)], (ov + k) * 2);
      }
      // a mirrored part (negative scale) needs its triangles turned round to keep facing out
      const flip = mtx.determinant() < 0;
      if (g.index) { const I = g.index.array; for (let k = 0; k < I.length; k += 3) { idx[oi++] = I[k] + ov; idx[oi++] = I[k + (flip ? 2 : 1)] + ov; idx[oi++] = I[k + (flip ? 1 : 2)] + ov; } }
      else for (let k = 0; k < P.count; k += 3) { idx[oi++] = ov + k; idx[oi++] = ov + k + (flip ? 2 : 1); idx[oi++] = ov + k + (flip ? 1 : 2); }
      ov += P.count;
      o.parent.remove(o);
    });
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); mg.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    mg.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); mg.setIndex(new THREE.BufferAttribute(idx, 1)); mg.computeBoundingSphere(); mg.computeBoundingBox();
    const mm = new THREE.Mesh(mg, mat); mm.name = 'Batched'; mm.matrixAutoUpdate = false; mm.frustumCulled = !movers.has(root); mm.userData.batched = list.length; root.add(mm);
    BATCH.after++; BATCH.groups++;
  });
  scene.updateMatrixWorld(true);
})();
