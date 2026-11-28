// USS Defiance · batch.js
// Fewer draw calls (roadmap F3). A draw call is one "draw this object" instruction to the graphics chip; the bridge
// was about 1,550 a frame because every trim strip, frame and bolt was its own object. This merges fixed objects that
// share a material into one object per deck, per material and per 6 m zone (zones let the camera still skip what is
// behind it). It runs three times:
//   1. at load, once the decks are built and the light-map atlas is laid out (bake.js): fixed parts and furniture;
//   2. once the baked light has loaded: the light-mapped walls, floors and ceilings. They have to wait, because the
//      bake swaps their materials as it loads; each keeps its own light-map coordinates (uvLM), so merging them does
//      not change the light;
//   3. from lift.js, once the lift car and the sealed lobby are built: their fixed parts, in the car's own frame so the
//      car still rides as one.
// Chairs and doors are "sleepers": at rest they are drawn as part of the merged objects (their own parts hidden).
// When you come close (or a door starts to open) one wakes: its slice of the merged object is folded away to nothing
// and its own parts show and move as before; once it has settled it goes back to sleep (batchSleep, each frame).
// Glows that only add light (additive, no depth) merge too: the order they are drawn in makes no difference.
// Left alone: anything else that moves (the lift's doors, shutters, the exterior), screens and other one-off materials
// (nothing to merge with), transparent or space-layer objects, hidden pick targets, and rotated parts whose material
// uses edge wear (that effect reads the part's own orientation). Probe-lit materials read light by world position, so
// merged parts are lit exactly as before. Walls that stop you clicking through them (OCCLUDERS) merge only with other
// such walls, and the merged object takes their place in that list.
// window.DEFIANCE_NO_BATCH (or #nobatch) turns it off, for checks that look at each part on its own.
// Files share one global scope and load in order (see index.html).
'use strict';

const BATCH = { before: 0, after: 0, groups: 0, passes: {} };
const BATCH_OFF = !!window.DEFIANCE_NO_BATCH || location.hash === '#nobatch';
const BATCH_ATTRS = ['uv', 'uvLM']; // texture coordinates carried over (position and normal always are)

// Merge the fixed meshes under `top`. opts: movers (Set of moving groups: what rides on one merges in its frame),
// skip (Set: left alone with everything under it), only (Set: merge just these meshes), label (for BATCH.passes),
// sleepers (Map: a chair's or door leaf's top object -> its sleeper record, see batchSleep).
const SLEEPERS = [];
const _bInv = new THREE.Matrix4(), _bM = new THREE.Matrix4(), _bN = new THREE.Matrix3(), _bV = new THREE.Vector3();
// write mesh o's vertices (in its frame root's coordinates) into position/normal arrays from vertex `at`. While merging,
// the world matrices worked out at the start are used as they are (parts are being taken out of the scene as it goes,
// so working them out again would lose what was above a removed part); a waking sleeper (fresh) is still in place.
function batchPut(pos, nor, at, o, root, fresh) {
  const g = o.geometry, P = g.attributes.position, N = g.attributes.normal;
  if (fresh) o.updateWorldMatrix(true, false); _bInv.copy(root.matrixWorld).invert(); _bM.multiplyMatrices(_bInv, o.matrixWorld); _bN.getNormalMatrix(_bM);
  for (let k = 0; k < P.count; k++) {
    _bV.fromBufferAttribute(P, k).applyMatrix4(_bM); pos[(at + k) * 3] = _bV.x; pos[(at + k) * 3 + 1] = _bV.y; pos[(at + k) * 3 + 2] = _bV.z;
    _bV.fromBufferAttribute(N, k).applyMatrix3(_bN).normalize(); nor[(at + k) * 3] = _bV.x; nor[(at + k) * 3 + 1] = _bV.y; nor[(at + k) * 3 + 2] = _bV.z;
  }
  return _bM.determinant() < 0;
}
const BATCH_ASLEEP = 1 << 30;
// take a merged part out of the scene. Anything mounted on it that is not merged itself (a label's 3D text, say) moves
// onto a plain stand-in in its place, so it stays put.
function batchDrop(o) {
  const par = o.parent;
  if (o.children.length) {
    const st = new THREE.Object3D(); st.name = 'Batched mount'; st.position.copy(o.position); st.quaternion.copy(o.quaternion); st.scale.copy(o.scale);
    st.matrix.copy(o.matrix); st.matrixWorld.copy(o.matrixWorld); st.matrixAutoUpdate = o.matrixAutoUpdate;
    par.add(st); while (o.children.length) st.add(o.children[0]);
  }
  par.remove(o);
}
function batchMerge(top, opts) {
  const { movers = new Set(), skip = new Set(), only = null, label = 'pass', sleepers = new Map() } = opts || {};
  const stat = BATCH.passes[label] = { before: 0, after: 0 };
  if (BATCH_OFF) return stat;
  // the frames a deck's merged objects live in: each built deck's group, the lift car and lobby, else the scene
  const frames = new Set([DECK2]);
  if (typeof LIFT !== 'undefined') [LIFT.deck1, LIFT.root, LIFT.stub].forEach((g) => g && frames.add(g));
  const receivers = new Set(BAKE.receivers || []), occ = new Set(OCCLUDERS);
  const edgeWear = (m) => (m._patches || []).some((p) => /^tri[^ ]*e/.test(p.key));
  const axisAligned = (mw) => { const e = mw.elements; for (const i of [0, 1, 2, 4, 5, 6, 8, 9, 10]) { const v = Math.abs(e[i]); if (v > 1e-4 && Math.abs(v - 1) > 1e-4) return false; } return true; };
  const groups = new Map(), box = new THREE.Box3(), ctr = new THREE.Vector3(), tag = new Map();
  scene.updateMatrixWorld(true);
  top.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || movers.has(o)) return;
    if (only ? !only.has(o) : receivers.has(o)) return; // light-map receivers wait for their own pass
    // hidden parts are left alone, but a hidden deck is not: the bake can arrive after you have left the bridge
    for (let p = o; p; p = p.parent) { if (skip.has(p) || p.userData.noBatch || (!p.visible && !frames.has(p))) return; if (frames.has(p)) break; }
    const m = o.material, g = o.geometry, glow = m.transparent && m.blending === THREE.AdditiveBlending && !m.depthWrite;
    if (Array.isArray(m) || (m.transparent && !glow) || o.layers.mask !== 1 || o.renderOrder || Object.prototype.hasOwnProperty.call(o, 'onBeforeRender')) return;
    if (!g.attributes.position || g.attributes.color || g.morphAttributes.position || g.isInstancedBufferGeometry || o.isTroikaText || m.isShaderMaterial) return; // 3D text builds its own geometry later
    // the frame to merge in: the nearest moving part above it, else its deck's group, else the scene
    let root = scene; for (let p = o.parent; p; p = p.parent) { if (movers.has(p) || frames.has(p)) { root = p; break; } }
    let sl = null; for (let p = o; p && p !== root; p = p.parent) if (sleepers.has(p)) { sl = sleepers.get(p); break; }
    if (sl) tag.set(o, sl);
    if (edgeWear(m) && !axisAligned(new THREE.Matrix4().copy(root.matrixWorld).invert().multiply(o.matrixWorld))) return;
    // zones only for the decks; a moving part or the lift car is merged whole
    const whole = movers.has(root) || (typeof LIFT !== 'undefined' && (root === LIFT.root || root === LIFT.stub));
    box.setFromObject(o).getCenter(ctr);
    const zone = whole ? '' : Math.floor(ctr.x / 6) + ',' + Math.floor(ctr.y / 6) + ',' + Math.floor(ctr.z / 6);
    const attrs = BATCH_ATTRS.filter((a) => a === 'uv' || g.attributes[a]);
    const key = root.uuid + '|' + m.uuid + '|' + zone + '|' + attrs.join() + '|' + (occ.has(o) ? 'occ' : '');
    (groups.get(key) || groups.set(key, { root, mat: m, attrs, occ: occ.has(o), list: [] }).get(key)).list.push(o);
  });
  const gone = new Set(), made = [];
  groups.forEach(({ root, mat, attrs, occ: isOcc, list }) => {
    stat.before += list.length; if (list.length < 2) { stat.after += list.length; return; }
    let nv = 0, ni = 0; list.forEach((o) => { const g = o.geometry; nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; });
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    const tex = attrs.map(() => new Float32Array(nv * 2)), naps = [];
    let ov = 0, oi = 0;
    list.forEach((o) => {
      const g = o.geometry, P = g.attributes.position; if (!g.attributes.normal) g.computeVertexNormals();
      // a mirrored part (negative scale) needs its triangles turned round to keep facing out
      const flip = batchPut(pos, nor, ov, o, root);
      attrs.forEach((a, j) => { const U = g.attributes[a]; if (U) for (let k = 0; k < P.count; k++) { tex[j][(ov + k) * 2] = U.getX(k); tex[j][(ov + k) * 2 + 1] = U.getY(k); } });
      if (g.index) { const I = g.index.array; for (let k = 0; k < I.length; k += 3) { idx[oi++] = I[k] + ov; idx[oi++] = I[k + (flip ? 2 : 1)] + ov; idx[oi++] = I[k + (flip ? 1 : 2)] + ov; } }
      else for (let k = 0; k < P.count; k += 3) { idx[oi++] = ov + k; idx[oi++] = ov + k + (flip ? 2 : 1); idx[oi++] = ov + k + (flip ? 1 : 2); }
      // a sleeper's part stays where it is, hidden, ready to take over when it wakes; anything else is dropped
      // (asleep, it is moved to a layer no camera draws, so anything mounted on it that did not merge still shows)
      const sl = tag.get(o); if (sl) { o.layers.mask = BATCH_ASLEEP; naps.push({ sl, o, at: ov, n: P.count }); } else { batchDrop(o); gone.add(o); }
      ov += P.count;
    });
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); mg.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    attrs.forEach((a, j) => mg.setAttribute(a, new THREE.BufferAttribute(tex[j], 2)));
    mg.setIndex(new THREE.BufferAttribute(idx, 1)); mg.computeBoundingSphere(); mg.computeBoundingBox();
    const mm = new THREE.Mesh(mg, mat); mm.name = 'Batched'; mm.matrixAutoUpdate = false; mm.frustumCulled = !movers.has(root); mm.userData.batched = list.length; root.add(mm);
    if (isOcc) made.push(mm);
    naps.forEach(({ sl, o, at, n }) => sl.parts.push({ o, mm, root, at, n }));
    stat.after++; BATCH.groups++;
  });
  // the click blockers: drop the merged pieces, add the merged walls
  if (gone.size) { const keep = OCCLUDERS.filter((o) => !gone.has(o)); OCCLUDERS.length = 0; OCCLUDERS.push(...keep, ...made); }
  if (only && gone.size) BAKE.receivers = BAKE.receivers.filter((o) => !gone.has(o));
  BATCH.before += stat.before; BATCH.after += stat.after;
  sleepers.forEach((sl) => { if (sl.parts.length && !SLEEPERS.includes(sl)) SLEEPERS.push(sl); });
  scene.updateMatrixWorld(true);
  return stat;
}

// ---------- sleepers: chairs and doors drawn merged while they rest ----------
function batchSlice(p, fold) {
  const P = p.mm.geometry.attributes.position, N = p.mm.geometry.attributes.normal;
  if (fold) { const a = P.array, x = a[p.at * 3], y = a[p.at * 3 + 1], z = a[p.at * 3 + 2]; for (let k = p.at; k < p.at + p.n; k++) { a[k * 3] = x; a[k * 3 + 1] = y; a[k * 3 + 2] = z; } }
  else batchPut(P.array, N.array, p.at, p.o, p.root, true);
  P.addUpdateRange(p.at * 3, p.n * 3); P.needsUpdate = true;
  if (!fold) { N.addUpdateRange(p.at * 3, p.n * 3); N.needsUpdate = true; }
  p.o.layers.mask = fold ? 1 : BATCH_ASLEEP;
}
const _slP = new THREE.Vector3();
function chairOff(c) { // the same "not on this deck" test chairsUpdate uses
  if (!c.p) { c.g.updateWorldMatrix(true, false); c.p = c.g.getWorldPosition(_slP).clone(); }
  return Math.abs(c.p.y - deckY(LIFT.deck)) > 1.5 && !(c.p.y > -0.5 && LIFT.deck === 1);
}
// does this sleeper need its own parts this frame? Chairs: you are within reach, it is still moving, or you are in the
// captain's chair. Doors: open at all. Off the current deck nothing wakes.
function sleeperWants(sl) {
  if (sl.chair) {
    const c = sl.chair; if (chairOff(c)) return false;
    if (Math.hypot(player.x - c.p.x, player.z - c.p.z) < 1.1 || (c.cap && state.sitting)) return true;
    return Math.abs(c.vel) > 1e-3 || Math.abs(c.yaw - c.home) > 2e-3 || Math.abs(c.tilt) > 1e-3 || Math.abs(c.tiltV) > 1e-2;
  }
  return sl.door.deck === LIFT.deck && sl.door.open > 1e-3;
}
// settle it exactly at rest before drawing it merged again
function sleeperRest(sl) {
  if (sl.chair) { const c = sl.chair; c.yaw = c.home; c.vel = c.tilt = c.tiltV = 0; c.sw.rotation.y = c.yaw; c.rock.rotation.x = 0; }
  else { const d = sl.door; d.open = 0; d.L.position.x = -d.q; d.Rr.position.x = d.q; }
}
// each frame (render.js), after the chairs and doors have moved
function batchSleep() {
  for (const sl of SLEEPERS) {
    const want = sleeperWants(sl); if (want === sl.awake) continue;
    sl.awake = want; if (!want) sleeperRest(sl);
    sl.parts.forEach((p) => batchSlice(p, want));
  }
}

// pass 1: the decks' fixed parts, at load
{
  const skip = new Set([EXTSET, holo, ...DECALS]); // decals are switched on and off with the bake
  SHUTTERS.forEach((s) => s.slats.forEach((x) => skip.add(x)));
  // the bridge's lift door frame takes the lift car's materials later (lift.js), so it must still be its own object
  const ld = DOORS.find((q) => q.station === 'lift'); if (ld) ld.reveal.forEach((x) => skip.add(x));
  // moving parts: what rides on one is merged in that part's own frame, so it still moves as one
  // (the lift's doors are run by lift.js every frame, so they stay movers); chairs and other doors sleep
  const movers = new Set(), sleepers = new Map();
  DOORS.forEach((d) => {
    if (d.station === 'lift') { movers.add(d.L); movers.add(d.Rr); return; }
    const sl = { door: d, parts: [], awake: false }; sleepers.set(d.L, sl); sleepers.set(d.Rr, sl);
  });
  if (D2.door) { movers.add(D2.door.L); movers.add(D2.door.Rr); } // Deck 2's lift landing doors (lift.js slides them)
  CHAIRS.forEach((c) => sleepers.set(c.g, { chair: c, parts: [], awake: false }));
  batchMerge(scene, { movers, skip, sleepers, label: 'parts' });
}
// pass 2: the light-mapped walls, floors and ceilings, once the bake has swapped their materials. This runs before
// render.js's own hand-over (promise callbacks run in the order they were added, and render.js loads later).
BAKE.ready.then((ok) => { if (ok) batchMerge(scene, { only: new Set(BAKE.receivers), skip: new Set([EXTSET]), label: 'lightmapped' }); });
