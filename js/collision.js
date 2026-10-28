// USS Defiance · collision.js
// Walking collision against walls, doors and furniture.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- collision ----------
const obstacles = [
  { x: 0, z: 0.45, r: 0.48 }, { x: SEAT_XO.x, z: SEAT_XO.z, r: 0.4 }, { x: SEAT_TAC.x, z: SEAT_TAC.z, r: 0.4 }, { x: SEAT_XO.x - 0.07, z: SEAT_XO.z - 0.72, r: 0.5 }, { x: SEAT_TAC.x + 0.07, z: SEAT_TAC.z - 0.72, r: 0.55 },
  { x: TABLE.x, z: TABLE.z, r: 0.9 },
];
[-1.4, 1.4].forEach((x) => { obstacles.push({ x: x - 0.38, z: -3.15, r: 0.38 }, { x: x + 0.38, z: -3.15, r: 0.38 }, { x, z: -2.45, r: 0.36 }); });
extraObs.forEach((o) => obstacles.push(o));
[[-4.94, -2.4, -4.94, 2.4], [4.94, -2.4, 4.94, 2.4], [-3.0, FWD_Z + 0.5, 3.0, FWD_Z + 0.5]].forEach(([a, b, c, d]) => addSeg(a, b, c, d, PR));
function pushSeg(x, z, ax, az, bx, bz, r) {
  const vx = bx - ax, vz = bz - az, t = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz), 0, 1);
  const px = ax + vx * t, pz = az + vz * t, dx = x - px, dz = z - pz, d = Math.hypot(dx, dz);
  if (d < r && d > 1e-5) { x = px + dx / d * r; z = pz + dz / d * r; }
  return [x, z];
}
function collide(x, z) {
  for (let it = 0; it < 4; it++) {
    for (const o of obstacles) { const dx = x - o.x, dz = z - o.z, d = Math.hypot(dx, dz), m = o.r + PR; if (d < m && d > 1e-5) { x = o.x + dx / d * m; z = o.z + dz / d * m; } }
    for (const sg of WALL_SEGS) [x, z] = pushSeg(x, z, sg[0], sg[1], sg[2], sg[3], sg[4]);
    for (const d of DOORS) if (d.seg && d.open < 0.75) [x, z] = pushSeg(x, z, d.seg[0], d.seg[1], d.seg[2], d.seg[3], d.seg[4]);
  }
  return [x, z];
}
const floorH = (x, z) => (Math.hypot(x - DAIS.x, z - DAIS.z) < DAIS.r + 0.02 ? DAIS.h : 0);
