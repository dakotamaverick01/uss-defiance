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
// New decks register here (see claude/roadmap.md: F4 builds them when the lift heads their way).
// Files share one global scope and load in order (see index.html).
'use strict';

const DECKS = {};
function deckDef(n, o) {
  DECKS[n] = Object.assign({ n, y: deckY(n), built: false, root: () => null, segs: () => LIFT.stubSegs, obs: () => [], rooms: () => [], floor: () => 0 }, o);
}
const deckOf = (n) => DECKS[n];
// Deck 1, the bridge deck: its parts are gathered into one group the first time you leave it (lift.js)
deckDef(1, { built: true, root: () => LIFT.deck1 || null, segs: () => WALL_SEGS, obs: () => obstacles,
  floor: (x, z) => (Math.hypot(x - DAIS.x, z - DAIS.z) < DAIS.r + 0.02 ? DAIS.h : 0) });
// Deck 2, the officers' deck (deck2.js)
deckDef(2, { built: true, root: () => DECK2, segs: () => D2.segs, obs: () => D2.obs, rooms: () => D2.rooms });
// Decks 3 to 10: not fitted out yet
for (let n = 3; n <= 10; n++) deckDef(n, {});
