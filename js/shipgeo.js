// USS Defiance · shipgeo.js
// The ship's shape in metres, shared by the bridge's master systems display (screens.js), the exterior model
// (exterior.js) and the deck-plan page (docs/master-systems-display.html, which carries an identical copy).
// Edit the page copy, then paste the block here. Files share one global scope and load in order (see index.html).
'use strict';

// SHIPGEO-BEGIN (shared verbatim with js/shipgeo.js; tools/check_plan.py keeps the two copies identical)
// The ship in metres: m = metres from the bow (0) to the stern (200), equal to the 3D z + 64; d = depth below the top of
// Deck 1 (Deck n spans 3.5(n-1) to 3.5n, negative is above); z = across the beam in the plan view, starboard negative.
const SHIPGEO = {
  top: [[0, 20], [5, 16.8], [14, 13.2], [30, 10.4], [46, 8.6], [60, 7.7], [150, 7.7], [166, 8.9], [182, 11.2], [193, 13.6], [199.5, 16.5]],
  bottom: [[199.5, 32], [196, 36.5], [188, 42], [124, 42], [114, 37.5], [100, 34.5], [80, 32.5], [50, 30], [24, 27], [8, 24], [2, 22], [0, 20]],
  spine: [[50, 7.8], [53.5, 5.6], [56, 3.8], [57.5, 1.8], [59.5, 0.5], [62, 0.1], [77, 0.1], [79.5, 1], [81, 2.8], [82.5, 3.4], [94.5, 3.4], [96.5, 5.3], [98, 7.7]],
  archOuter: [[109.5, 8.5], [113, 3.5], [118, -0.3], [123, -3], [129, -4.6], [137, -4.6], [143, -3], [148, -0.3], [153, 3.5], [156.5, 8.5]],
  archInner: [[113, 8.5], [116, 4.4], [120, 1.2], [124.5, -1.5], [129, -3.4], [137, -3.4], [141.5, -1.5], [146, 1.2], [150, 4.4], [153, 8.5]],
  turretDeck: [128.5, 137.5, -5.0, -4.1], turret: [[129.9, -4.55], [129.9, -5.05], [130.3, -6.05], [131.4, -6.75], [133, -6.95], [134.6, -6.75], [135.7, -6.05], [136.1, -5.05], [136.1, -4.55]],
  barrels: [126.2, 132.6, -6.15, -5.55],
  nacelle: { m0: 110, d: 46.5, z: 50, w: 0.74, prof: [[0, 0], [0.4, 2.3], [1.6, 3.7], [4, 4.35], [9, 4.6], [70, 4.6], [79, 4.25], [85.5, 3.1], [89.3, 1.5], [90, 0]] },
  spar: [[127, 30], [140, 30], [177, 44.5], [165, 44.5]], sparPlan: [[127, 14], [140, 14], [177, 47.8], [165, 47.8]],
  halfBeam: [[0, 0], [3, 14], [8, 25], [20, 34], [34, 40], [56, 45], [78, 46], [98, 44], [112, 40], [126, 30], [140, 20], [170, 16.5], [196, 14], [200, 9]],
  spinePlan: [52, 96, -6.2, 7.2], pod: [[58, -3.55], [58, 3.55], [61.1, 6.4], [66.9, 6.4], [70.2, 4.0], [70.2, -4.0], [66.9, -6.4], [61.1, -6.4]],
  lifts: [[70.2, 72.5, 1, 6, 'LIFT 1'], [124, 129, 3, 12, 'LIFT 2']], core: [140, 152, 6, 11],
  // rooms[deck-1] = [from m, to m, name, status (w walkable, n next, p planned), kind (w command, l living, s systems,
  // x weapons, e engineering), side ('' full, 's' starboard, 'p' port), note]
  rooms: [
    [[58, 70.2, 'Main bridge', 'w', 'w', '', 'Command chair, flight, ops, tactical, science, engineering and comms stations, the situation table and the viewscreen.'], [70.2, 72.5, 'Turbolift 1', 'w', 's', '', 'Forward lift. Runs Decks 1 to 6.'], [72.5, 77, 'Conference room', 'w', 'w', '', 'Senior staff briefings and battle honors, aft of the bridge.'], [77, 80, 'Ready room and head', 'w', 'w', '', 'The captain’s office off the bridge’s starboard aft corner; the head is to port.']],
    [[54.5, 58.8, 'Forward sensor and comms arrays', 'p', 's', '', 'Long-range sensor pallet and subspace antenna at the front of the spine.'], [58.8, 66.8, 'Captain’s quarters', 'w', 'l', '', 'Day cabin, sleeping cabin and a small galley, directly under the bridge.'], [66.8, 70.2, 'Lift 1 lobby', 'w', 'w', 'p', 'Where the lift doors open, with the deck directory.'], [70.2, 72.5, 'Lift 1', 'w', 's', 'p', ''], [72.5, 79, 'First officer’s quarters', 'w', 'l', 'p', 'Port viewport, desk, galley niche and a sleeping cabin aft.'], [79, 84.5, 'Officers’ passage', 'w', 'l', 'p', 'Runs aft along the wardroom’s port side to the lounge.'], [84.5, 88.5, 'Turret capacitors', 'p', 'x', 'p', 'Sealed, red-tagged bank that feeds the dorsal turret.'], [66.8, 80.4, 'Senior officers’ cabins', 'w', 'l', 's', 'Two department heads’ cabins off the officers’ corridor, each with a desk and a galley.'], [81, 88.5, 'Officers’ wardroom', 'w', 'w', 's', 'Officers dine and meet here.'], [88.5, 95, 'Observation lounge', 'w', 'l', '', 'The aft end of the spine: a 10 m window looking back over the ship’s back to the turret on its arch (the nacelles ride low, out of sight).']],
    [[46, 58, 'Forward shield generator', 'p', 's', '', 'Feeds the forward shield arc.'], [58, 70.2, 'Sickbay', 'p', 'l', '', 'Eight beds, surgery and an isolation ward, right by Lift 1 so casualties reach it fast.'], [70.2, 72.5, 'Lift 1', 'p', 's', '', ''], [72.5, 84, 'Medical lab and morgue', 'p', 'l', '', ''], [84, 110, 'Officers’ quarters', 'p', 'l', '', ''], [110, 124, 'Computer core, upper', 'p', 's', '', ''], [124, 129, 'Lift 2', 'p', 's', '', 'Aft lift. Runs Decks 3 to 12.'], [129, 140, 'Arch feeds and turret magazine', 'p', 'x', '', 'Power and focusing crystals go up the arch rails to the turret from here.'], [140, 162, 'Crew quarters', 'p', 'l', '', '']],
    [[20, 34, 'Auxiliary control', 'p', 'w', '', 'Back-up bridge inside the armored prow.'], [34, 52, 'Crew quarters', 'p', 'l', '', ''], [52, 70.2, 'Mess hall and galley', 'p', 'l', '', 'The one room everyone on the ship passes through every day.'], [70.2, 72.5, 'Lift 1', 'p', 's', '', ''], [72.5, 86, 'Crew lounge and gym', 'p', 'l', '', ''], [86, 106, 'Crew quarters', 'p', 'l', '', ''], [106, 124, 'Computer core', 'p', 's', '', 'Main computer core, two decks tall.'], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 152, 'Main shield generators', 'p', 's', '', 'Port, starboard and aft arcs.'], [152, 186, 'Life support and environmental', 'p', 's', '', '']],
    [[8, 22, 'Torpedo bays 1 and 2', 'p', 'x', '', 'Twin forward launchers in the armored prow.'], [22, 34, 'Torpedo magazine', 'p', 'x', '', '24 torpedoes, 12 per bay.'], [34, 48, 'Armory and security', 'p', 'x', '', 'Next to the transporters, for boarding and away teams.'], [48, 62, 'Transporter rooms 1 and 2', 'p', 's', '', ''], [62, 70.2, 'Science labs', 'p', 'l', '', ''], [70.2, 72.5, 'Lift 1', 'p', 's', '', ''], [72.5, 96, 'Crew quarters', 'p', 'l', '', ''], [96, 106, 'Cargo transporter and stores', 'p', 's', '', ''], [106, 124, 'Computer core', 'p', 's', '', 'Lower half of the core.'], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 138, 'Engineering offices', 'p', 'e', '', ''], [138, 156, 'Main engineering, upper gallery', 'p', 'e', '', 'Catwalk ring around the top of the warp core.'], [156, 186, 'Nacelle coil workshop', 'p', 'e', '', ''], [186, 197, 'Impulse engines', 'p', 'e', '', 'Twin impulse engines at the stern.']],
    [[2, 16, 'Navigational deflector', 'p', 's', '', 'Clears debris ahead of the ship.'], [16, 28, 'Lower sensor array', 'p', 's', '', ''], [28, 48, 'Torpedo loading', 'p', 'x', '', 'Feeds the magazine above.'], [48, 70.2, 'Cargo bay 1', 'p', 's', '', ''], [70.2, 72.5, 'Lift 1', 'p', 's', '', ''], [72.5, 104, 'Crew quarters', 'p', 'l', '', ''], [104, 124, 'Escape pods and EVA prep', 'p', 's', '', ''], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 166, 'Main engineering', 'p', 'e', '', 'Control room and the top of the warp core.'], [166, 199, 'Auxiliary power', 'p', 'e', '', 'Fusion generators for when the core is down.']],
    [[6, 48, 'Crew quarters', 'p', 'l', '', ''], [48, 100, 'Training simulators', 'p', 'l', '', 'Combat and flight simulator bays for drills.'], [100, 124, 'Combat information center', 'p', 'x', '', 'Deep in the armored hull: the room that tracks every contact, with a big plot table and weapons and sensor operators. Lift 2 is next door.'], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 166, 'Main engineering and warp core', 'p', 'e', '', 'The ship’s power plant.'], [166, 199, 'Engineering workshops and spares', 'p', 'e', '', '']],
    [[22, 70, 'Crew quarters', 'p', 'l', '', ''], [70, 104, 'Hydroponics and stores', 'p', 'l', '', ''], [104, 124, 'Ventral beam array and capacitors', 'p', 'x', '', 'The ship’s lower beam weapon and its power banks.'], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 140, 'Matter injection', 'p', 'e', '', ''], [140, 152, 'Warp core', 'p', 'e', '', ''], [152, 176, 'Nacelle field control', 'p', 'e', '', 'Port and starboard warp field coils are run from here.'], [176, 199, 'Shuttle maintenance', 'p', 's', '', '']],
    [[50, 96, 'Cargo bay 2', 'p', 's', '', ''], [96, 124, 'Brig and security cells', 'p', 'x', '', ''], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 140, 'Flight operations', 'p', 's', '', 'Pilots’ ready room and bay control.'], [140, 152, 'Warp core', 'p', 'e', '', ''], [152, 199, 'Shuttlebay', 'p', 's', '', 'Three shuttles. The launch doors open aft.']],
    [[90, 124, 'Environmental and water reclamation', 'p', 's', '', ''], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 140, 'Air scrubbers and waste', 'p', 's', '', ''], [140, 152, 'Warp core, lower', 'p', 'e', '', ''], [152, 196, 'Lower hangar and shuttle storage', 'p', 's', '', '']],
    [[112, 124, 'Fuel transfer', 'p', 'e', '', ''], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 140, 'Deuterium tanks', 'p', 'e', '', ''], [140, 152, 'Reactor base', 'p', 'e', '', ''], [152, 192, 'Antimatter storage pods', 'p', 'e', '', 'Magnetic containment pods.']],
    [[124, 129, 'Lift 2', 'p', 's', '', ''], [129, 146, 'Tractor beam and keel sensors', 'p', 's', '', ''], [146, 164, 'Antimatter pod ejection', 'p', 'e', '', 'Last-resort jettison of the fuel pods.'], [164, 188, 'Structural keel and waste', 'p', 's', '', '']],
  ],
};
// a smooth curve through points (Catmull-Rom as cubic Béziers), as SVG path commands after a starting point
function shipCurve(pts, X, Y) {
  const P = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))], f = (x, y) => X(x).toFixed(1) + ' ' + Y(y).toFixed(1); let s = '';
  for (let i = 0; i < pts.length - 1; i++) { const a = P(i - 1), b = P(i), c = P(i + 1), d = P(i + 2);
    s += ' C' + f(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6) + ' ' + f(c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6) + ' ' + f(c[0], c[1]); }
  return s;
}
const shipPoly = (pts, X, Y) => 'M' + pts.map(([a, b]) => X(a).toFixed(1) + ' ' + Y(b).toFixed(1)).join(' L') + ' Z';
const shipRect = ([a, b, c, d], X, Y) => shipPoly([[a, c], [b, c], [b, d], [a, d]], X, Y);
// a nacelle seen side-on (centre c on the cross axis), from its profile; k scales the profile (plan views pass nacelle.w)
function shipNacelle(c, X, Y, k = 1) {
  const N = SHIPGEO.nacelle, up = N.prof.map(([p, r]) => [N.m0 + p, c - r * k]), dn = N.prof.map(([p, r]) => [N.m0 + p, c + r * k]).reverse();
  return 'M' + X(up[0][0]).toFixed(1) + ' ' + Y(up[0][1]).toFixed(1) + shipCurve(up, X, Y) + shipCurve(dn, X, Y) + ' Z';
}
// side view: SVG path strings (also valid input for canvas Path2D)
function shipSide(X, Y) {
  const G = SHIPGEO, T = G.top, B = G.bottom, S = G.spine, O = G.archOuter, I = G.archInner.slice().reverse();
  return {
    hull: 'M' + X(T[0][0]) + ' ' + Y(T[0][1]) + shipCurve(T, X, Y) + ' L' + X(B[0][0]) + ' ' + Y(B[0][1]) + shipCurve(B, X, Y) + ' Z',
    spine: 'M' + X(S[0][0]) + ' ' + Y(S[0][1]) + shipCurve(S, X, Y) + ' Z',
    arch: 'M' + X(O[0][0]) + ' ' + Y(O[0][1]) + shipCurve(O, X, Y) + ' L' + X(I[0][0]) + ' ' + Y(I[0][1]) + shipCurve(I, X, Y) + ' Z',
    turretDeck: shipRect(G.turretDeck, X, Y), turret: 'M' + X(G.turret[0][0]) + ' ' + Y(G.turret[0][1]) + shipCurve(G.turret, X, Y) + ' Z', barrels: shipRect(G.barrels, X, Y),
    nacelle: shipNacelle(G.nacelle.d, X, Y), spar: shipPoly(G.spar, X, Y),
  };
}
// plan view, bow left, starboard up (Z takes the cross-beam metres, starboard negative)
function shipPlan(X, Z) {
  const G = SHIPGEO, H = G.halfBeam, up = H.map(([m, b]) => [m, -b]), dn = H.map(([m, b]) => [m, b]).reverse();
  return {
    hull: 'M' + X(0) + ' ' + Z(0) + shipCurve(up, X, Z) + ' L' + X(dn[0][0]) + ' ' + Z(dn[0][1]) + shipCurve(dn, X, Z) + ' Z',
    spine: shipRect([G.spinePlan[0], G.spinePlan[1], G.spinePlan[2], G.spinePlan[3]], X, Z), pod: shipPoly(G.pod, X, Z),
    nacs: [-1, 1].map((sd) => shipNacelle(sd * G.nacelle.z, X, Z, G.nacelle.w)), spars: [-1, 1].map((sd) => shipPoly(G.sparPlan.map(([m, z]) => [m, sd * z]), X, Z)),
    rails: [-1, 1].map((sd) => 'M' + X(111) + ' ' + Z(sd * 7.5) + ' Q' + X(133) + ' ' + Z(sd * 3.4) + ' ' + X(155) + ' ' + Z(sd * 7.5)),
  };
}
// SHIPGEO-END
