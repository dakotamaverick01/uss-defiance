// USS Defiance · decks.js
// The deck registry: one entry per deck saying what the rest of the ship needs to know about it, so collision, the
// floor height, deck switching and the location readout ask the registry instead of special-casing each deck.
// Each entry's functions are read when called (the decks themselves are built by later files), so this loads early.
//   n, y          deck number and floor height (deckY, core.js)
//   built         false: the lift opens onto the sealed placeholder lobby (lift.js) instead of a deck of its own
//   root()        the deck's group (shown only while you are on it), or null
//   segs(), obs() collision lines and round obstacles on this deck
//   rooms()       named rectangles { label, x0, x1, z0, z1 } for the location readout
//   floor(x, z)   extra floor height at a point (the bridge's dais)
//   door()        the deck's own Lift 1 landing doors { L, Rr } once built (lift.js slides them with the car's)
//   build()       builds the deck's geometry; run once, by deckBuild, the first time the lift heads there (the doors are
//                 shut and the car is moving, so nobody sees it happen). Deck 1 is built at start-up.
// Each built deck has its own light bake in bake/d<n>/ (bake.js), so changing one deck never re-bakes another.
// Files share one global scope and load in order (see index.html).
'use strict';

const DECKS = {};
function deckDef(n, o) {
  DECKS[n] = Object.assign({ n, y: deckY(n), built: false, root: () => null, segs: () => LIFT.stubSegs, obs: () => [], rooms: () => [], floor: () => 0 }, o);
}
const deckOf = (n) => DECKS[n];
// Deck 1, the bridge deck: its parts are gathered into one group the first time you leave it (lift.js)
//   envAt         where on the deck its reflection snapshot is taken (x, height above the floor, z)
deckDef(1, { built: true, made: true, envAt: [0, 1.75, 0.6], root: () => LIFT.deck1 || null, segs: () => WALL_SEGS, obs: () => obstacles,
  floor: (x, z) => (Math.hypot(x - DAIS.x, z - DAIS.z) < DAIS.r + 0.02 ? DAIS.h : 0) });
// Deck 2, the officers' deck (deck2.js)
deckDef(2, { built: true, envAt: [1.3, 1.6, 9.0], root: () => DECK2, segs: () => D2.segs, obs: () => D2.obs, rooms: () => D2.rooms, door: () => D2.door, build: () => buildDeck2() });
// Deck 3, medical and officers (deck3.js): corridors open, rooms sealed until fitted out
deckDef(3, { built: true, envAt: [-2.6, 1.6, 4.2], root: () => DECK3, segs: () => D3.segs, obs: () => D3.obs, rooms: () => D3.rooms, door: () => D3.door, build: () => buildDeck3() });
// Decks 4 to 10: not fitted out yet
for (let n = 4; n <= 10; n++) deckDef(n, {});

// Build a deck the first time it is needed: its geometry, its light-map layout, merged objects (batch.js), then its baked
// light once that has loaded (start-up fetches every built deck's light files; bake.js applies them here or on arrival).
function deckBuild(n) {
  const d = DECKS[n]; if (!d || !d.built || d.made || !d.build) return; d.made = true;
  const t0 = performance.now();
  d.build(); scene.updateMatrixWorld(true);
  buildAtlas(n);
  batchDeck(d.root());
  if (bakeApply(n)) batchLightmapped(n);
  if (typeof redrawAll === 'function') redrawAll(); // draw the new deck's screens once
  d.buildMs = Math.round(performance.now() - t0);
}
