// USS Defiance · collision.js
// Walking collision against walls, doors and furniture.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- collision ----------
const obstacles = [
  { x: 0, z: 0.45, r: 0.48 }, { x: SEAT_XO.x, z: SEAT_XO.z, r: 0.4 }, { x: SEAT_TAC.x, z: SEAT_TAC.z, r: 0.4 }, { x: SEAT_XO.x - 0.07, z: SEAT_XO.z - 0.72, r: 0.5 }, { x: SEAT_TAC.x + 0.07, z: SEAT_TAC.z - 0.72, r: 0.55 },
];
[-1.4, 1.4].forEach((x) => { obstacles.push({ x: x - 0.38, z: -3.15, r: 0.38 }, { x: x + 0.38, z: -3.15, r: 0.38 }, { x, z: -2.45, r: 0.36 }); });
extraObs.forEach((o) => obstacles.push(o));
[[-(SIDE_X - 0.66), -2.4, -(SIDE_X - 0.66), 2.4], [SIDE_X - 0.66, -2.4, SIDE_X - 0.66, 2.4], [-3.0, FWD_Z + 0.5, 3.0, FWD_Z + 0.5]].forEach(([a, b, c, d]) => addSeg(a, b, c, d, PR));
function pushSeg(x, z, ax, az, bx, bz, r) {
  const vx = bx - ax, vz = bz - az, t = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz), 0, 1);
  const px = ax + vx * t, pz = az + vz * t, dx = x - px, dz = z - pz, d = Math.hypot(dx, dz);
  if (d < r && d > 1e-5) { x = px + dx / d * r; z = pz + dz / d * r; }
  return [x, z];
}
// Only the deck you are on collides (lift.js swaps decks); the Lift 1 car is there on every deck.
function collide(x, z) {
  const D = deckOf(LIFT.deck), segs = D.segs(), obs = D.obs(), ds = LIFT.doorSeg;
  for (let it = 0; it < 4; it++) {
    for (const o of obs) { const dx = x - o.x, dz = z - o.z, d = Math.hypot(dx, dz), m = o.r + PR; if (d < m && d > 1e-5) { x = o.x + dx / d * m; z = o.z + dz / d * m; } }
    for (const sg of segs) [x, z] = pushSeg(x, z, sg[0], sg[1], sg[2], sg[3], sg[4]);
    for (const sg of LIFT.carSegs) [x, z] = pushSeg(x, z, sg[0], sg[1], sg[2], sg[3], sg[4]);
    for (const d of DOORS) if (d.deck === LIFT.deck && d.seg && d.open < 0.75 && d.station !== 'lift') [x, z] = pushSeg(x, z, d.seg[0], d.seg[1], d.seg[2], d.seg[3], d.seg[4]);
    if (LIFT.door < 0.75 || liftLocked()) [x, z] = pushSeg(x, z, ds[0], ds[1], ds[2], ds[3], ds[4]);
  }
  return [x, z];
}
// the floor under you: the lift car's (it moves), the dais on the bridge, otherwise the deck you're on
const floorH = (x, z) => (inCar(x, z) ? LIFT.root.position.y : deckY(LIFT.deck) + deckOf(LIFT.deck).floor(x, z));
