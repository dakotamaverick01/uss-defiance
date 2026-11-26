# Deck 2 part 2: officers' quarters and observation lounge (design)

Stage 8 of the build-out. Branch captain-sim, from 71fcc0c. Deck 2 coordinates: x to starboard, forward is -z, y from the Deck 2 floor (world y -3.5).

## Intent
Finish Deck 2 so all of it can be walked: the first officer's quarters, two senior officers' cabins, and an observation lounge whose window looks aft over the turret and nacelles. The quarters should feel like the captain's quarters (same materials, furniture language, light), only smaller. Everything is strictly original.

## Goals
- Open the three sealed corridor doors. They become real automatic doors into finished rooms.
- Add a passage from the corridor's aft end, round the port side of the wardroom, to a new observation lounge.
- Show something outside the lounge window: a simple original set piece (scenery built only to be seen from that window) of the dorsal hull, the arch with the dorsal turret, the spars and both nacelles.
- Refit the captain's desk so every set of quarters has the same desk: a wood frame with a deskSurface() display top.
- Update D2.rooms, the Deck 2 directory screen (DRAW.deck2), the directory panel text, LIFT_DECKS[1] (rooms, sealed list empty) and the lift's Deck 2 note.
- Re-bake once, then do the usual end-of-stage steps.

## Non-goals
- No full exterior model, and no update of the deck-plan page (docs/master-systems-display.html). Both stay with the exterior stage.
- No Lift 2, no Decks 3 to 6, no gameplay.
- No lighting rebalance and no new red alert look.

## Anti-goals
- Nothing copied: no recognisable rooms, furniture or silhouettes from the shows.
- The set piece must not wreck the bake: it stays out of the light-map atlas and out of the Blender export.
- Phones must stay smooth. The set piece is low-poly and gets no screens.

## Approaches considered
- Lounge access: (a) a door in the wardroom's aft wall; **(b) a side passage from the corridor round the port side of the wardroom (John's pick)**; (c) moving the wardroom door. John wants the walk and the sealed turret-capacitor door along it.
- Lounge view: **(a) build a simple set piece (picked)**; (b) stars only until the exterior model.
- Desks: **(a) deskSurface tops for all quarters, captain's included (picked)**; (b) new desks only.
- Senior cabins: **(a) a mirror pair, each a single cabin for a department head (picked)**; (b) two distinct cabins; (c) shared cabins with two berths.

## Plan (all rooms built with d2room, so walls are inset 6 cm and neighbours stay 12 cm apart)
| Space | x | z | Size | Doors and windows |
|---|---|---|---|---|
| First officer's quarters | -5.4 .. 0.2 | 6.2 .. 14.6 | 5.6 x 8.4 m | door on the starboard wall at z 9.6 (existing corridor door); viewport on the port wall |
| Senior officers' cabin 1 | 2.4 .. 6.2 | 2.8 .. 9.6 | 3.8 x 6.8 m | door at z 7.2; starboard viewport |
| Senior officers' cabin 2 | 2.4 .. 6.2 | 9.6 .. 16.4 | 3.8 x 6.8 m | door at z 12.0; starboard viewport; the mirror of cabin 1 about z 9.6 |
| Cross passage | -3.2 .. 0.2 | 14.6 .. 17.0 | 3.4 x 2.4 m | open way from the corridor's port wall at z 14.9..16.7 (lined reveal, like the lobby's) |
| Aft passage | -5.4 .. -3.2 | 14.6 .. 24.5 | 2.2 x 9.9 m | open to the cross passage; sealed "TURRET CAPACITORS" door on the port wall at z ~20.5 |
| Observation lounge | -5.4 .. 5.8 | 24.5 .. 31.0 | 11.2 x 6.5 m | automatic door from the aft passage in the lounge's forward wall at x -4.3; aft window across most of the aft wall |

Corridor ceiling height (2.6 m) for the passages, room height (2.75 m) for the rooms.

## Rooms
**First officer's quarters.** The captain's quarters, smaller. Forward half is the day cabin: a sofa facing the port viewport, a low table on a rug, the desk on the forward wall with a station chair, a table for two near the door with dining chairs, and a galley niche with a synthesizer (the food dispenser) and its small screen. A partition near z 12.0 closes off the sleeping cabin aft: bed with its headboard to the port wall, bedside tables with brass lamps, a wardrobe, and shelves with books and keepsakes. Downlights, a ceiling disc over the table, the same wood, fabric and leather as the captain's. Partition walls stay at least 10 cm from other walls.

**Senior officers' cabins.** One cabin layout, built twice (cabin 2 mirrored in z). Bed at the outboard end with its headboard to the outer wall's corner, a starboard viewport, a desk with a deskSurface top and a station chair, an armchair (a dining-type makeChair) with a side table, a wardrobe, and a synthesizer niche. Each cabin gets its own rug and keepsakes so they don't look copied.

**Passage.** Corridor finish: structural frames, light panels and handrails like the corridor, a direction sign at the turn ("AFT · OBSERVATION LOUNGE"). The sealed capacitor door works like the old sealed doors: red tag, panel "Turret capacitor bank · engineering access only".

**Observation lounge.** A window wall facing aft (the viewport() frame, mullions and red-alert shutters), with a long sill ledge under it and station chairs that swivel to face out. Three or four small round tables with dining chairs. A bar counter with a synthesizer along the starboard wall. A wall screen on the forward wall showing what's outside (kind 'lounge': the view aft, turret and nacelle states, shutters). Plants, downlights, cove light. The ship's crest stays in the wardroom.

## The set piece outside
Built in a group inside DECK2 so it only shows on Deck 2. It follows the bridge MSD's new hull (drawMSD): a long dorsal surface stepping down just aft of the lounge, the raised arch springing from the hull with the dorsal turret on top (about 15 to 25 m aft and 12 to 15 m up), and slim nacelles slung low and aft on swept spars (about 30 m down, 45 to 55 m out, 60 to 120 m aft), with soft glowing field grilles and a warm glow on each nacelle's front end. Distances are tuned by eye from the lounge window, so the whole set reads through the glass.
- Material: MeshMatcapMaterial, a lit look from a small painted ball texture with no scene lights. It isn't a MeshStandardMaterial, so the bake ignores it.
- Glow parts are transparent and additive, so the Blender export skips them. bake_export.py also skips the whole set group by name.
- At red alert the shutters close over it as on every viewport. At warp it travels with the ship.

## Desks
A shared deck2Desk(parent, w, station, sub, title, code) helper: a walnut frame and legs like the captain's current desk, and a deskSurface() display top (kind 'desk', the 'desk' pads round the station's DRAW[sub] readouts). Used by the captain (station qdesk, sub 'log'; the wall screen above stays and also shows the log), the first officer (xodesk, sub 'xo': duty roster and department reports) and both cabins (so1desk and so2desk, sub 'cabin': messages and watch times). Check nothing pokes through the display top. Seating is makeChair('station') at desks and makeChair('dining') everywhere else.

## Stations and text
New stations: xoq, so1q and so2q (the doors), capbank (the sealed capacitor door, which replaces d2sealed), lngdoor, xodesk, so1desk, so2desk, xogalley, lgalley and lounge (the wall screen). The old station d2sealed is removed. New DRAW kinds: xo, cabin, lounge. D2.rooms gains the five spaces. The directory screen lists every space as open, with "YOU ARE HERE" on the lobby. LIFT_DECKS[1].sealed becomes empty, and the panel drops its "Still sealed" line when that list is empty.

## Bake and checks
Re-bake once after all geometry (export, then bake_blender at 160 with the usual RIG, encode, then exposure 10.5). Renders at phone and desktop size; node --test tests/sim.test.js; the full station check; then commit, push, republish the live artifact (patching only changed files), before/after sheets in docs/, the Grok bundle, and the handoff doc.

## Builder's calls (mine, open to change)
- Exact furniture placement, rug patterns, keepsakes and screen contents.
- The set piece's distances, tuned by eye from the window rather than the MSD's metres. (The MSD puts the lounge aft of the turret. As built, the lounge sits at the arch's forward foot, so the window looks aft under and up at the arch.)
- If usage runs short: quarters and passage first, then the lounge and set piece, with one re-bake at the end.
