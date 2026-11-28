// USS Defiance · shipgeo.js
// The ship's shape in metres, shared by the bridge's master systems display (screens.js), the exterior model
// (exterior.js) and the deck-plan page (docs/master-systems-display.html, which carries an identical copy).
// Edit the page copy, then paste the block here. Files share one global scope and load in order (see index.html).
'use strict';

// SHIPGEO-BEGIN (shared verbatim with js/shipgeo.js; tools/check_plan.py keeps the two copies identical)
// The ship in metres: m = metres from the bow (0) to the stern (200), equal to the 3D z + 64; d = depth below the top of
// Deck 1 (Deck n spans 3.5(n-1) to 3.5n, negative is above); z = across the beam in the plan view, starboard negative.
// The form is a swept saucer: a lens-shaped saucer forward flowing into a slim engineering body aft, nacelles just above
// the saucer on swept pylons, and a rollbar over the back carrying the weapons pod. The hull's side and plan outlines
// (top, bottom, halfBeam) are worked out from the saucer and engineering parameters below, after the object.
const SHIPGEO = {
  // the saucer: a lens centred mc m from the bow (half-length L, half-beam W) with its mid-plane at depth dc; up and dn
  // are its half-thickness above and below at the centre; pn shapes the plan, n the cross-section
  saucer: { mc: 58, L: 58, W: 50, up: 6.9, dn: 7.0, pn: 2.3, n: 2.25, dc: 15 },
  // the engineering body: half-beam, top depth and bottom depth along the ship (smooth curves); n shapes its section
  eng: { w: [[90, 0], [94, 6.8], [102, 10.6], [128, 13], [170, 12.2], [194, 9.9], [200, 8.4]], t: [[90, 15], [100, 10.5], [112, 8.6], [150, 8.6], [200, 15.5]],
    b: [[90, 15], [94.5, 23.5], [100.5, 29.5], [112, 33.2], [182, 34.5], [194, 33.4], [200, 30.5]], n: 2.4 },
  // the officers' spine on the saucer's back, faired round the rooms of Decks 1 and 2: a rounded body over Deck 2 and a
  // broad, low bridge module over Deck 1. Each is a superellipse across the beam about the centreline: half-width w and
  // top depth t along the ship (smooth curves), centre depth c, depth reach below the centre dn, exponent n. The two
  // merge with a soft fillet (k: higher is sharper). Its side and plan outlines (spineTop, spinePlan, pod) are worked
  // out after the object.
  spine: { k: 6,
    body: { w: [[49, 0.3], [53, 7.6], [59, 10.2], [93, 10.2], [98.5, 7.4], [102, 0.3]], t: [[49, 8.7], [53, 5.4], [58, 2.7], [96, 2.7], [99.5, 5.2], [102.5, 9.0]], c: 9.0, dn: 3, n: 3.2 },
    bridge: { w: [[53, 0.3], [56, 6.0], [59, 9.4], [63, 14.0], [67, 16.1], [72, 16.2], [78, 13.4], [83, 0.3]], t: [[53, 3.0], [55.8, 0.3], [59.5, -0.95], [75, -0.95], [79.5, 0.6], [83, 2.9]], c: 2.6, dn: 2.0, n: 4.2 } },
  // the rollbar: feet on the saucer's back at m foot[0], foot[1] m out to each side; it arches up and back to its crown
  // over m crown at depth top. The weapons pod rides the crown (m from, to; centre depth d; half-width w, half-height h),
  // with torpedo launchers [from m, to m, out, d, half-width, half-height]: two firing forward, one aft
  rollbar: { foot: [108, 20], crown: 128, top: -0.6 },
  wpod: { m: [114, 152], d: -3.4, w: 6.0, h: 3.0 },
  launchers: [[112.6, 119.4, -2.45, -3.3, 1.5, 1.05], [112.6, 119.4, 2.45, -3.3, 1.5, 1.05], [147.6, 153.6, 0, -3.3, 1.7, 1.1]],
  // nacelles just above the saucer: profile = [metres from the front, half-height]; w = width over height
  nacelle: { m0: 110, d: 10.2, z: 40, w: 0.88, n: 2.2, prof: [[0, 0], [0.5, 1.2], [2.5, 2.4], [8, 3.15], [18, 3.6], [60, 3.6], [72, 3.25], [82, 2.3], [88, 1.0], [90, 0]] },
  // the swept pylons out to the nacelles: side view [m, d] and plan [m, out], leading root, trailing root, trailing tip, leading tip
  spar: [[134, 16.4], [160, 17.4], [172, 10.6], [148, 10.6]], sparPlan: [[134, 11], [160, 11], [172, 38.2], [148, 38.2]],
  lifts: [[70.2, 72.5, 1, 6, 'LIFT 1'], [124, 129, 3, 10, 'LIFT 2']], core: [140, 152, 6, 10],
  // rooms[deck-1] = [from m, to m, name, status (w walkable, n next, p planned), kind (w command, l living, s systems,
  // x weapons, e engineering), side ('' full, 's' starboard, 'p' port), note]
  rooms: [
    [[58, 70.2, 'Main bridge', 'w', 'w', '', 'Command chair, flight, ops, tactical, science, engineering and comms stations, the situation table and the viewscreen.'], [70.2, 72.5, 'Turbolift 1', 'w', 's', '', 'Forward lift. Runs Decks 1 to 6.'], [72.5, 77, 'Conference room', 'w', 'w', '', 'Senior staff briefings and battle honors, aft of the bridge.'], [77, 80, 'Ready room and head', 'w', 'w', '', 'The captain’s office off the bridge’s starboard aft corner; the head is to port.']],
    [[54.5, 58.8, 'Forward sensor and comms arrays', 'p', 's', '', 'Long-range sensor pallet and subspace antenna at the front of the spine.'], [58.8, 66.8, 'Captain’s quarters', 'w', 'l', '', 'Day cabin, sleeping cabin and a small galley, directly under the bridge.'], [66.8, 70.2, 'Lift 1 lobby', 'w', 'w', 'p', 'Where the lift doors open, with the deck directory.'], [70.2, 72.5, 'Lift 1', 'w', 's', 'p', ''], [72.5, 79, 'First officer’s quarters', 'w', 'l', 'p', 'Port viewport, desk, galley niche and a sleeping cabin aft.'], [79, 84.5, 'Officers’ passage', 'w', 'l', 'p', 'Runs aft along the wardroom’s port side to the lounge.'], [84.5, 88.5, 'Pod capacitors', 'p', 'x', 'p', 'Sealed, red-tagged bank that feeds the weapons pod.'], [66.8, 80.4, 'Senior officers’ cabins', 'w', 'l', 's', 'Two department heads’ cabins off the officers’ corridor, each with a desk and a galley.'], [81, 88.5, 'Officers’ wardroom', 'w', 'w', 's', 'Where the officers dine; double doors aft open into the observation lounge.'], [88.5, 95, 'Observation lounge', 'w', 'l', '', 'The officers’ lounge and bar at the aft end of the spine: a 10 m window looking back over the ship’s back to the rollbar and its weapons pod, with a nacelle out to either side.']],
    [[30, 46, 'Officers’ quarters', 'p', 'l', '', ''], [46, 58, 'Forward shield generator', 'p', 's', '', 'Feeds the forward shield arc.'], [58, 70.2, 'Sickbay', 'p', 'l', '', 'Eight beds, surgery and an isolation ward, right by Lift 1 so casualties reach it fast.'], [70.2, 72.5, 'Lift 1', 'p', 's', '', ''], [72.5, 84, 'Medical lab and morgue', 'p', 'l', '', ''], [84, 110, 'Officers’ quarters', 'p', 'l', '', ''], [110, 124, 'Computer core, upper', 'p', 's', '', ''], [124, 129, 'Lift 2', 'p', 's', '', 'Aft lift. Runs Decks 3 to 10.'], [129, 140, 'Pod feeds and torpedo magazine', 'p', 'x', '', 'Torpedoes and power ride up the rollbar to the weapons pod from here.'], [140, 150, 'Crew quarters', 'p', 'l', '', '']],
    [[10, 34, 'Auxiliary control', 'p', 'w', '', 'Back-up bridge in the saucer’s forward edge.'], [34, 52, 'Crew quarters', 'p', 'l', '', ''], [52, 70.2, 'Mess hall and galley', 'p', 'l', '', 'The one room everyone on the ship passes through every day.'], [70.2, 72.5, 'Lift 1', 'p', 's', '', ''], [72.5, 86, 'Crew lounge and gym', 'p', 'l', '', ''], [86, 92, 'Docking port, port', 'p', 's', 'p', 'Airlock and docking ring in the saucer rim, with a guide-light array round it.'], [86, 92, 'Docking port, starboard', 'p', 's', 's', 'The starboard twin of the port docking ring, joined to it by a cross corridor.'], [92, 106, 'Training simulators', 'p', 'l', '', 'Combat and flight simulator bays for drills.'], [106, 124, 'Computer core', 'p', 's', '', 'Main computer core, two decks tall.'], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 152, 'Main shield generators', 'p', 's', '', 'Port, starboard and aft arcs.'], [152, 176, 'Life support, air and water', 'p', 's', '', 'Environmental plant and water reclamation.']],
    [[6, 22, 'Torpedo bays 1 and 2', 'p', 'x', '', 'Twin launchers in the saucer’s forward edge.'], [22, 34, 'Torpedo magazine', 'p', 'x', '', '24 torpedoes for the forward bays; the weapons pod carries its own.'], [34, 48, 'Armory and security', 'p', 'x', '', 'Next to the transporters, for boarding and away teams.'], [48, 62, 'Transporter rooms 1 and 2', 'p', 's', '', ''], [62, 70.2, 'Science labs', 'p', 'l', '', ''], [70.2, 72.5, 'Lift 1', 'p', 's', '', ''], [72.5, 96, 'Crew quarters', 'p', 'l', '', ''], [96, 106, 'Cargo bay and cargo transporter', 'p', 's', '', 'The main cargo hold (moved up from Deck 6 when the fighter hangar took its space), with the cargo transporter.'], [106, 124, 'Computer core', 'p', 's', '', 'Lower half of the core.'], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 138, 'Engineering offices', 'p', 'e', '', ''], [138, 156, 'Main engineering, upper gallery', 'p', 'e', '', 'Catwalk ring around the top of the warp core.'], [156, 186, 'Nacelle coil workshop', 'p', 'e', '', ''], [186, 197, 'Impulse engines', 'p', 'e', '', 'Twin impulse engines at the stern.']],
    [[12, 28, 'Lower sensor array', 'p', 's', '', 'Under the saucer’s forward edge.'], [28, 48, 'Torpedo loading', 'p', 'x', '', 'Feeds the magazine above.'], [48, 70.2, 'Fighter hangar', 'p', 'x', '', 'Four tactical fighters on launch cradles. They drop clear through doors in the saucer’s belly.'], [70.2, 72.5, 'Lift 1', 'p', 's', '', 'Forward lift. Lowest stop.'], [72.5, 90, 'Crew quarters', 'p', 'l', '', ''], [90, 104, 'Hydroponics and stores', 'p', 'l', '', ''], [104, 124, 'Escape pods and EVA prep', 'p', 's', '', ''], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 166, 'Main engineering', 'p', 'e', '', 'Control room and the top of the warp core.'], [166, 199, 'Auxiliary power', 'p', 'e', '', 'Fusion generators for when the core is down.']],
    [[102, 112, 'Navigational deflector', 'p', 's', '', 'The dish on the engineering hull’s nose, under the saucer.'], [112, 124, 'Combat information center', 'p', 'x', '', 'Deep in the engineering hull: the room that tracks every contact, with a big plot table and weapons and sensor operators. Lift 2 is next door.'], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 166, 'Main engineering and warp core', 'p', 'e', '', 'The ship’s power plant.'], [166, 199, 'Shuttlebay, gallery level', 'p', 's', '', 'The upper half of the two-deck bay: the flight control booth and a catwalk round the walls.']],
    [[106, 124, 'Ventral beam array and capacitors', 'p', 'x', '', 'The ship’s lower beam weapon and its power banks.'], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 140, 'Matter injection', 'p', 'e', '', ''], [140, 152, 'Warp core', 'p', 'e', '', ''], [152, 166, 'Nacelle field control', 'p', 'e', '', 'Port and starboard warp field coils are run from here.'], [166, 199, 'Shuttlebay', 'p', 's', '', 'Two decks tall: a runabout and two utility shuttles on the Deck 8 floor. Clamshell doors in the stern, opened from the Flight panel.']],
    [[112, 124, 'Brig and security cells', 'p', 'x', '', ''], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 140, 'Deuterium tanks', 'p', 'e', '', ''], [140, 152, 'Warp core', 'p', 'e', '', ''], [152, 174, 'Engineering workshops and spares', 'p', 'e', '', ''], [174, 192, 'Shuttle maintenance', 'p', 's', '', 'Under the shuttlebay, with a cargo lift up to its floor.']],
    [[118, 124, 'Docking collar and fuel transfer', 'p', 's', '', 'The ventral docking collar under the keel, beside Lift 2. Supply ships dock here to pass fuel and stores.'], [124, 129, 'Lift 2', 'p', 's', '', 'Lowest stop.'], [129, 140, 'Tractor beam and keel sensors', 'p', 's', '', ''], [140, 152, 'Warp core base', 'p', 'e', '', 'Where the antimatter feed enters the core.'], [152, 182, 'Antimatter storage pods', 'p', 'e', '', 'Magnetic containment pods, with the ejection system beneath.']]
  ],
};
// a smooth curve through points (Catmull-Rom as cubic Béziers), as SVG path commands after a starting point
function shipCurve(pts, X, Y) {
  const P = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))], f = (x, y) => X(x).toFixed(1) + ' ' + Y(y).toFixed(1); let s = '';
  for (let i = 0; i < pts.length - 1; i++) { const a = P(i - 1), b = P(i), c = P(i + 1), d = P(i + 2);
    s += ' C' + f(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6) + ' ' + f(c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6) + ' ' + f(c[0], c[1]); }
  return s;
}
// the value of such a curve at m (points in increasing m), as shipCurve draws it
function shipAt(pts, m) {
  const n = pts.length, P = (i) => pts[Math.max(0, Math.min(n - 1, i))]; if (m <= pts[0][0]) return pts[0][1]; if (m >= pts[n - 1][0]) return pts[n - 1][1];
  let i = 0; while (i < n - 2 && m > pts[i + 1][0]) i++;
  const a = P(i - 1), b = P(i), c = P(i + 1), d = P(i + 2), x1 = b[0] + (c[0] - a[0]) / 6, x2 = c[0] - (d[0] - b[0]) / 6, y1 = b[1] + (c[1] - a[1]) / 6, y2 = c[1] - (d[1] - b[1]) / 6;
  let lo = 0, hi = 1; for (let k = 0; k < 26; k++) { const t = (lo + hi) / 2, u = 1 - t; if (u * u * u * b[0] + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * c[0] < m) lo = t; else hi = t; }
  const t = (lo + hi) / 2, u = 1 - t; return u * u * u * b[1] + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * c[1];
}
// the hull's cross-section at m: the smooth union of the saucer's lens and the engineering body's rounded section, both
// about the saucer's mid-plane. r(a) = distance from (0, dc) to the outline at angle a (0 to starboard, positive down);
// t, b = top and bottom depths on the centreline; w = half-beam.
function shipHull(m) {
  const G = SHIPGEO, S = G.saucer, E = G.eng, q = Math.min(1, Math.abs(m - S.mc) / S.L), f = Math.pow(Math.max(0, 1 - Math.pow(q, S.pn)), 1 / S.pn), gq = Math.pow(Math.max(0, 1 - q * q), 0.45);
  const sa = [S.W * f, S.up * gq + 0.4 * f, S.dn * gq + 0.4 * f], ew = Math.max(0, shipAt(E.w, m)), eb = [ew, ew > 0.01 ? Math.max(0.01, S.dc - shipAt(E.t, m)) : 0, ew > 0.01 ? Math.max(0.01, shipAt(E.b, m) - S.dc) : 0];
  const se = (a, h, n, c, s) => (a < 1e-4 || h < 1e-4) ? 0 : 1 / Math.pow(Math.pow(Math.abs(c) / a, n) + Math.pow(Math.abs(s) / h, n), 1 / n);
  const r = (an) => { const c = Math.cos(an), s = Math.sin(an), k = s < 0 ? 1 : 2; return Math.pow(Math.pow(se(sa[0], sa[k], S.n, c, s), 10) + Math.pow(se(eb[0], eb[k], E.n, c, s), 10), 0.1); };
  let w = 0; for (let k = -8; k <= 8; k++) { const an = k * 0.05; w = Math.max(w, r(an) * Math.cos(an)); }
  return { m, r, t: S.dc - r(-Math.PI / 2), b: S.dc + r(Math.PI / 2), w, dc: S.dc };
}
// the depth of the hull's top surface at m, x metres out from the centreline
function shipTopAt(m, x) {
  const H = shipHull(m); let lo = -Math.PI / 2, hi = 0;
  for (let k = 0; k < 30; k++) { const a = (lo + hi) / 2; if (H.r(a) * Math.cos(a) < x) lo = a; else hi = a; }
  return H.dc + H.r(lo) * Math.sin(lo);
}
// the spine (SHIPGEO.spine) at m: f(out, d) is below 1 inside and above 1 outside, out = metres across the beam
function shipSpineField(m) {
  const S = SHIPGEO.spine, at = (pts, x) => x <= pts[0][0] ? pts[0][1] : x >= pts[pts.length - 1][0] ? pts[pts.length - 1][1] : shipAt(pts, x);
  const sh = [S.body, S.bridge].filter((q) => m > q.w[0][0] && m < q.w[q.w.length - 1][0]).map((q) => ({ w: Math.max(0.05, at(q.w, m)), t: at(q.t, m), c: q.c, dn: q.dn, n: q.n }));
  return (x, d) => { let s = 0; for (const q of sh) { const h = d < q.c ? Math.max(0.05, q.c - q.t) : q.dn;
    s += Math.pow(Math.pow(Math.pow(Math.abs(x) / q.w, q.n) + Math.pow(Math.abs(d - q.c) / h, q.n), 1 / q.n), -S.k); }
    return s > 0 ? Math.pow(s, -1 / S.k) : 9; };
}
// the spine's cross-section at m, starboard half: n + 1 points [out, d] evenly spaced from its foot (where it reaches
// depth footD) up to the top of the centreline; found along rays from a point inside the body (the outermost crossing)
function shipSpineRing(m, footD, n) {
  const f = shipSpineField(m), B = SHIPGEO.spine.body, at = (pts, x) => x <= pts[0][0] ? pts[0][1] : x >= pts[pts.length - 1][0] ? pts[pts.length - 1][1] : shipAt(pts, x);
  const bt = at(B.t, m), o = bt + 0.5 * (B.c - bt);
  const bnd = (phi) => { const c = Math.cos(phi), s = Math.sin(phi); let r = 20; while (r > 0 && f(c * r, o - s * r) >= 1) r -= 0.5;
    let lo = Math.max(0, r), hi = r + 0.5; for (let k = 0; k < 14; k++) { const md = (lo + hi) / 2; if (f(c * md, o - s * md) < 1) lo = md; else hi = md; } return [c * lo, o - s * lo]; };
  let a = -Math.PI / 2 + 0.02, z = 0.6; for (let k = 0; k < 24; k++) { const md = (a + z) / 2; if (bnd(md)[1] > footD) a = md; else z = md; }
  const D = []; for (let i = 0; i <= 120; i++) D.push(bnd(z + (Math.PI / 2 - z) * i / 120));
  const L = [0]; for (let i = 1; i < D.length; i++) L.push(L[i - 1] + Math.hypot(D[i][0] - D[i - 1][0], D[i][1] - D[i - 1][1]));
  const out = []; let j = 1;
  for (let i = 0; i <= n; i++) { const t = L[L.length - 1] * i / n; while (j < L.length - 1 && L[j] < t) j++;
    const u = (t - L[j - 1]) / Math.max(1e-9, L[j] - L[j - 1]); out.push([D[j - 1][0] + (D[j][0] - D[j - 1][0]) * u, D[j - 1][1] + (D[j][1] - D[j - 1][1]) * u]); }
  out[n][0] = 0; return out;
}
// the spine's outlines: its top along the centreline (side view, closed by the hull's back) and its widest half-beam
// (plan view); the bridge module's own plan outline (pod)
(function () {
  const G = SHIPGEO, S = G.spine, top = [], wide = [], r2 = (v) => Math.round(v * 100) / 100;
  for (let m = 49.5; m <= 102.5; m += 0.5) { const ht = shipHull(m).t, R = shipSpineRing(m, ht, 16), d = R[16][1];
    if (d < ht - 0.05) { top.push([m, r2(d)]); wide.push([m, r2(Math.max(...R.map(([x]) => x)))]); } }
  G.spineTop = top; G.spinePlan = wide.map(([m, w]) => [m, -w]).concat(wide.slice().reverse().map(([m, w]) => [m, w]));
  const bw = S.bridge.w; G.pod = bw.map(([m, w]) => [m, -w]).concat(bw.slice().reverse().map(([m, w]) => [m, w]));
})();
// the side and plan outlines, sampled along the ship (smooth curves through these points)
(function () {
  const G = SHIPGEO, ms = []; for (let m = 0; m < 6; m += 0.5) ms.push(m); for (let m = 6; m < 196; m += 2) ms.push(m); for (let m = 196; m <= 200; m += 0.5) ms.push(m);
  const H = ms.map(shipHull), r2 = (v) => Math.round(v * 100) / 100;
  G.top = ms.map((m, i) => [m, r2(H[i].t)]); G.bottom = ms.map((m, i) => [m, r2(H[i].b)]).reverse(); G.halfBeam = ms.map((m, i) => [m, r2(H[i].w)]);
})();
// the rollbar's centreline, s from -1 (port foot) through 0 (crown) to 1 (starboard foot): [m, out (starboard +), d],
// with its chord (fore and aft) and thickness at s
function shipRoll(s) {
  const R = SHIPGEO.rollbar, a = Math.min(1, Math.abs(s)), footD = shipTopAt(R.foot[0], R.foot[1]) + 1.4, e = Math.pow(a, 2.5);
  return { m: R.crown - (R.crown - R.foot[0]) * Math.pow(a, 1.3), out: s * R.foot[1], d: R.top + (footD - R.top) * Math.pow(a, 2.6), chord: 4.4 + 2.2 * e, thick: 1.35 + 0.9 * e };
}
// the weapons pod's half-width and half-height at q (0 at its nose, 1 at its tail)
function shipPodAt(q) { const P = SHIPGEO.wpod, s = Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, q)))), 0.32); return [P.w * s * (1 - 0.16 * q), P.h * s]; }
const shipPoly = (pts, X, Y) => 'M' + pts.map(([a, b]) => X(a).toFixed(1) + ' ' + Y(b).toFixed(1)).join(' L') + ' Z';
const shipRect = ([a, b, c, d], X, Y) => shipPoly([[a, c], [b, c], [b, d], [a, d]], X, Y);
// a nacelle seen side-on (centre c on the cross axis), from its profile; k scales the profile (plan views pass nacelle.w)
function shipNacelle(c, X, Y, k = 1) {
  const N = SHIPGEO.nacelle, up = N.prof.map(([p, r]) => [N.m0 + p, c - r * k]), dn = N.prof.map(([p, r]) => [N.m0 + p, c + r * k]).reverse();
  return 'M' + X(up[0][0]).toFixed(1) + ' ' + Y(up[0][1]).toFixed(1) + shipCurve(up, X, Y) + shipCurve(dn, X, Y) + ' Z';
}
// side view: SVG path strings (also valid input for canvas Path2D)
function shipSide(X, Y) {
  const G = SHIPGEO, T = G.top, B = G.bottom, S = G.spineTop, P = G.wpod, up = [], dn = [];
  // the rollbar seen side-on: the band its sections sweep, from the feet up to the crown
  for (let i = 0; i <= 24; i++) { const r = shipRoll(1 - i / 24); up.push([r.m - r.chord * 0.5, r.d - r.thick]); dn.push([r.m + r.chord * 0.5, r.d + r.thick]); }
  const roll = up.concat([[shipRoll(0).m, shipRoll(0).d - shipRoll(0).thick]], dn.reverse());
  const pu = [], pd = []; for (let i = 0; i <= 20; i++) { const q = i / 20, [, h] = shipPodAt(q), m = P.m[0] + (P.m[1] - P.m[0]) * q; pu.push([m, P.d - h]); pd.push([m, P.d + h]); }
  return {
    hull: 'M' + X(T[0][0]) + ' ' + Y(T[0][1]) + shipCurve(T, X, Y) + ' L' + X(B[0][0]) + ' ' + Y(B[0][1]) + shipCurve(B, X, Y) + ' Z',
    spine: 'M' + X(S[0][0]) + ' ' + Y(S[0][1]) + shipCurve(S, X, Y) + ' Z',
    arch: shipPoly(roll, X, Y), pod: 'M' + X(pu[0][0]) + ' ' + Y(pu[0][1]) + shipCurve(pu, X, Y) + shipCurve(pd.reverse(), X, Y) + ' Z',
    launchers: G.launchers.map(([a, b, , d, , h]) => shipRect([a, b, d - h, d + h], X, Y)).join(' '),
    nacelle: shipNacelle(G.nacelle.d, X, Y), spar: shipPoly(G.spar, X, Y),
  };
}
// plan view, bow left, starboard up (Z takes the cross-beam metres, starboard negative)
function shipPlan(X, Z) {
  const G = SHIPGEO, H = G.halfBeam, up = H.map(([m, b]) => [m, -b]), dn = H.map(([m, b]) => [m, b]).reverse(), P = G.wpod, pu = [], pd = [];
  for (let i = 0; i <= 20; i++) { const q = i / 20, [w] = shipPodAt(q), m = P.m[0] + (P.m[1] - P.m[0]) * q; pu.push([m, -w]); pd.push([m, w]); }
  return {
    hull: 'M' + X(0) + ' ' + Z(0) + shipCurve(up, X, Z) + ' L' + X(dn[0][0]) + ' ' + Z(dn[0][1]) + shipCurve(dn, X, Z) + ' Z',
    spine: shipPoly(G.spinePlan, X, Z), pod: shipPoly(G.pod, X, Z),
    nacs: [-1, 1].map((sd) => shipNacelle(sd * G.nacelle.z, X, Z, G.nacelle.w)), spars: [-1, 1].map((sd) => shipPoly(G.sparPlan.map(([m, z]) => [m, sd * z]), X, Z)),
    // the rollbar's two halves, foot to crown (stroke them)
    rails: [-1, 1].map((sd) => { const p = []; for (let i = 0; i <= 12; i++) { const r = shipRoll(sd * (1 - i / 12)); p.push([r.m, -r.out]); } return 'M' + X(p[0][0]).toFixed(1) + ' ' + Z(p[0][1]).toFixed(1) + shipCurve(p, X, Z); }),
    wpod: 'M' + X(pu[0][0]) + ' ' + Z(pu[0][1]) + shipCurve(pu, X, Z) + shipCurve(pd.reverse(), X, Z) + ' Z',
  };
}
// SHIPGEO-END
