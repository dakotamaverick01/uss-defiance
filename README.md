# USS Defiance

A walkable 3D starship, bridge first, for an original starship, built to run in a phone or desktop browser with no install.

**Live version:** https://claude.ai/artifact/SyjMcFGoRF6kLtFP77TPSr
**Run locally:** serve the folder with any static web server (for example `python3 -m http.server`) and open it in a browser. Opening `index.html` straight from disk won't work, because browsers block loading the `js/` files that way. It loads three.js from a CDN, so it needs an internet connection.

## The ship

The USS *Defiance* (EV-0408) is a Bastion-class heavy escort, an outgrowth of a compact wartime escort design, enlarged with improved engines and heavier weapons. It was built during the Hollow War for deep-space interdiction, heavy strike, and convoy escort. Motto: *Steady under fire.*

Everything here is original: the ship, its layout, the interface language, the insignia and the names. It is a fan-made work in the spirit of 24th-century starship design, not a copy of any studio's sets or graphics.

## What's on Deck 1

| Area | What you can do |
| --- | --- |
| **Bridge** | The ship holds standard orbit over Kessra IV: the planet's limb and atmosphere arc across the main viewer and its surface rolls slowly beneath you. Upholstered swivel chairs turn when you brush past them and drift back to rest. Behind the command chair, a horizontal situation table (like an engineering master table) shows the sector chart, a live ship plan, power, damage and contacts; the aft wall carries the master systems display. Sit at any station and work its displays. The ship is a working system: set alert levels, split reactor power at Operations, reinforce a shield arc at Tactical, send repair teams from Damage Control, and run a combat drill to watch it all react. |
| **Captain's ready room** | About 6 x 6.5 m. Read the captain's log at the desk, use the synthesizer, inspect the ship model, open or close the armored window shutters. |
| **Officer conference room** | About 8 x 6.5 m, with room to walk around the table. Step through the briefing slides, read the battle honors plaque. |
| **Head** | Yes, the ship has a restroom. |
| **Lift 1** | A real lift car behind the aft door. Step in, choose a deck on the back-wall panel, and ride: the doors close, the car travels down (or up) between the decks, and the doors open on the new deck. Decks 3 to 6 aren't fitted out yet, so they open onto a sealed lift lobby with a deck directory. |

## What's on Deck 2 (the officers' deck)

| Area | What you can do |
| --- | --- |
| **Lift 1 lobby** | Deck sign, the deck directory, a bench. The captain's quarters are straight ahead; the corridor runs aft. |
| **Captain's quarters** | A day cabin with a sofa facing the forward viewport, a dining table for four, a desk whose top is a touch display (the personal log), a galley with its own synthesizer, bookshelves, and a sleeping cabin behind a partition. |
| **Officers' corridor** | Runs aft past the first officer's quarters (port) and the two senior officers' cabins (starboard) to the wardroom. |
| **First officer's quarters** | The captain's quarters, smaller: a sofa facing the port viewport, a touch-display desk with the duty roster, a galley niche, and a sleeping cabin behind a partition. |
| **Senior officers' cabins** | Two mirror-image cabins for department heads: bed, starboard viewport, desk, armchair, galley niche. |
| **Officers' wardroom** | A table for ten, a sideboard, the ship's crest, the mess board, and a starboard viewport. |
| **Officers' passage** | From the corridor's end, to port and aft along the wardroom, past the sealed turret capacitor bank. |
| **Observation lounge** | Across the stern of the spine: a wide window looking aft over the dorsal turret's arch and both nacelles, a window ledge with swivel chairs, small tables, and a bar. The view outside is a simple stand-in for the exterior model. |

## Controls

- **Phone:** drag the stick on the left to walk, drag the right side to look, tap a station when you're close to use it.
- **Desktop:** W A S D or the arrow keys to walk, drag with the mouse to look, click a station (or press E when it's centered) to use it, Esc to close a panel.

## How it's built

[three.js](https://threejs.org/) 0.186, loaded from a CDN through an import map. There is no build step.

- **Code layout:** `index.html` holds the page, styles and a small loader. The ship's code lives in `js/`, one file per area, loaded in order and sharing one scope:

  | File | What it covers |
  | --- | --- |
  | `core.js` | Constants, renderer, shared helpers, display palette, scene state |
  | `sim.js` | The ship model: power, shields by arc, weapons, eight damage zones, repair teams, combat drill. Runs on a fixed 10-per-second tick |
  | `surfaces.js` | Surface detail: texture loading, world-mapped detail, wear, screen pixel grid and smudged glass |
  | `materials.js` | Procedural textures, reflections, material library |
  | `bridge.js` | Bridge geometry: shell, consoles, seating, dais, viewscreen, aft wall |
  | `space.js` | The space scene shown on the viewscreen |
  | `rooms.js` | Ready room, conference room, head, window views |
  | `lighting.js` | The one live light (viewscreen warp glow) and a fallback rig if the bake can't load |
  | `bake.js` | Loads the baked light and adds it to every interior material |
  | `collision.js` | Walking collision |
  | `screens.js` | Console screen drawing and the instrument widget kit |
  | `sound.js` | Synthesized ambience and interface sounds |
  | `ui.js` | Station panels, alerts, HUD |
  | `deck2.js` | Deck 2, 3.5 m below the bridge: lift lobby, corridor, all the officers' quarters, wardroom, passage, observation lounge, and the exterior set piece seen through its windows |
  | `lift.js` | Lift 1: the car, the ride, deck switching (one deck in the scene at a time) and the sealed lobby for unbuilt decks |
  | `controls.js` | Movement, touch and mouse input, aiming |
  | `render.js` | Haze light shafts, post-processing, screen redraw scheduler, hero shots, frame loop |

- **Lighting (baked):** the ship is lit only by its own fixtures: downlights, ceiling discs, cove slots, deck strips and screens. That light, including light bouncing off floors and walls, is calculated ahead of time in Blender and saved in `bake/`. Floors, walls and ceilings carry a light map (one image laid out like a sewing pattern); everything else reads a grid of light probes, points every 30 cm that recorded the light arriving from six directions. Light level and alert colour still change live. There are no real-time lights apart from the viewscreen's warp glow, which keeps phones fast.
- **Decks and the lift:** decks sit at their real heights, 3.5 m apart, and the lift car really travels between them. Only the deck you are on is shown, which keeps phones fast as the ship grows. Deck 1 and Deck 2 are lit together in one bake (the export shows every deck while it runs). The lift car and the sealed lobbies for unbuilt decks are not part of the bake: their light is painted into small light maps in `lift.js`, and `bake.js` skips their materials.
- **Interface:** every screen is drawn from one kit of solid blocks on black: elbow frames, pill buttons, solid bars and number columns, in one palette (peach frames, tan and butterscotch readouts, lilac as the second colour, rose and plum accents; green, amber and red only for status). Text uses Antonio, a condensed face. At Yellow alert the peach pulses toward butterscotch; at Red it turns red, the lilac dims and the room lights drop to about a third and redden.
- **Screen density:** around each screen's readable widgets sit banks of numbered pill buttons and slowly ticking number columns (a side rail on wide screens, a bottom deck on tall ones), so every display reads as a busy working console. They carry no information of their own.
- **Master systems display** (aft bridge wall, 2048 x 820): a side cutaway of the Defiance (a long swept primary hull, a raised arch over the back carrying the dorsal turret, nacelles slung low and aft on swept spars), every deck and compartment from the deck plan, callouts, a pulsing warp core and live damage tints; a plan view with live shield arcs and the warp field; the deck index and readouts. The static layers are cached and redrawn only when the alert or damage state changes.
- **Stations:** the screens are the furniture. Each wall position is a deep sloped desk whose whole top is one display (big colour pads, a segmented ring gauge, the station's own readouts) under a thick light bezel with a padded navy lip, a small hooded viewer at the back, a ribbed louver band on the wall behind, and the upper displays set deep into a thick framed panel. Below each desk, a recessed apron of padded navy panels. The helm and operations pods and the dais desks use the same desk display.
- **Layered screens:** every display has a still, dim back layer (deep navy trays laid out under each section, a faint grid, a faint schematic and tiny reference codes) drawn once and cached, with the crisp readouts on top. About four fifths of each screen is still; a few pieces move slowly and continuously (a filling bar, a scope trace, a slow scroll) and single values change on their own independent timings, never in sync.
- **Surfaces:** every main material has colour, bump detail (a normal map, an image that fakes small bumps and grooves), roughness and contact shading. Floors use photographed sets from [ambientCG](https://ambientcg.com) (free, CC0): Carpet012 on the bridge, Carpet016 recoloured for the ready and conference rooms, Wood018 for the furniture, DiamondPlate008C for the deck edges and head, and a leather grain. Brushed steel, painted-metal detail and screen fingerprints are generated by `tools/make_textures.py`, which also shrinks everything to about 4 MB in `textures/`. Hard surfaces are textured by world position rather than their own layout, so nothing stretches. Wear follows use: polished edges on consoles and desks, scuffed walkways on the bridge floor, grime near the deck, fingerprints on screens. Screens show a fine pixel grid when you lean in.
- **Rendering:** ACES filmic tone mapping, a faint haze, reflections taken from the baked room, and post effects from [postprocessing](https://github.com/pmndrs/postprocessing) (MIT): a soft mip-mapped bloom for screen glow, plus [N8AO](https://github.com/N8python/n8ao) (MIT) ambient occlusion, the soft contact shadows where surfaces meet, on desktop only. If those libraries can't load, three.js's own bloom is used.
- **3D text:** station ID plates and door labels use [troika-three-text](https://github.com/protectwise/troika) (MIT), which draws each letter from the font's outline as a signed-distance field, so text stays sharp at any distance. The font is Antonio (SIL Open Font License, `fonts/OFL-antonio.txt`), bundled in `fonts/` as woff (troika cannot read woff2).
- **Re-baking the light** (needed after moving any fixed geometry; the ship warns in the console and falls back to the old light if the bake no longer matches):
  1. `python3 tools/bake_export.py . <work>`: opens the ship headlessly and writes its geometry and fixtures.
  2. `<venv>/bin/python tools/bake_blender.py <work> 160`: renders the light with Blender's Cycles (`pip install bpy` into a virtual environment). About 12 minutes on two cores at 160 samples.
  3. `python3 tools/bake_encode.py <work> .`: cleans up the result and writes `bake/`. It stores the light at exposure 7.0, the brightness the ship was tuned at (set `EXPOSURE` to change it).
- **Checks:** `tools/hero_shots.py` captures the six hero shots; `tools/check_stations.py` opens every station at desktop and phone size and reports errors; `tools/check_deck2.py` rides to Deck 2 and checks its rooms, stations, doors, walkways and the exterior set piece.
- **Ship model:** `sim.js` holds the ship's live state and rules, with every starting number in one tuning table (`SIM`). It advances on its own fixed tick, separate from drawing, so it keeps running when no screen redraws. Screens and station menus only read it and call its orders. Tests: `node --test tests/sim.test.js`.
- **Screens:** every console display is drawn live onto an HTML canvas from a shared set of widgets (tables, bar graphs, dials, plots), reading the ship model. Block-style screens in palette A (see Interface above; `docs/interface-style-sheet.md` describes the earlier amber scheme and is superseded). Only screens near the player redraw, to keep phones smooth.
- **Viewscreen:** renders a separate space scene (starfield, nebula, planet, warp streaks) to a texture.
- **Collision:** walls and doors are line segments, and furniture is circles. Walls also block clicks, so you can't use a panel through a wall.
- **Sound:** generated in the browser with the Web Audio API. There are no sound files.
- **Hero shots:** six fixed camera positions used to judge each visual stage side by side. Run `DEFIANCE_HERO(1)` through `DEFIANCE_HERO(6)` in the browser console (7 and 8 are console and chair close-ups), and `DEFIANCE_HERO(0)` to return to play. Contact sheets are in `docs/` (`hero-shots-stage3.jpg` and `closeups-stage3.jpg` are the latest).

## Status

**Captain simulator (branch `captain-sim`):** the design is in `docs/superpowers/specs/2026-11-22-captain-sim-design.md`. Stage 1 (ship model, live consoles, new colors) is done. Gameplay is on hold while the ship is built out. Build-out Stages 1 to 3 are done (bigger Deck 1 rooms, a working Lift 1, Deck 2 part 1), along with a bridge refit: block-style screens in a new palette, a brighter room and rebuilt stations (design: `docs/superpowers/specs/2026-11-25-bridge-refit-design.md`), then two detail passes: denser screens and a new master systems display, followed by new chairs, the situation table, an orbital view and continuously animated displays. Deck 2 part 2 is done too: the first officer's and senior officers' quarters, a passage and the observation lounge (design: `docs/superpowers/specs/2026-11-26-deck2-part2-design.md`).

Deck 1 is complete. In the build-out (gameplay paused), Stage 1 gave it more room: every bridge wall moved out 0.8 m for wider walkways (consoles moved with the walls; the dais, pods and situation table stayed put), the ready room and conference room grew to about 6 x 6.5 m and 8 x 6.5 m with 3.1 m ceilings, and the light was re-baked at 160 samples. Stages 0 (engine upgrade, code split, hero shots), 1 (baked fixture lighting, contact shadows, bounce light, haze) and 3 (surfaces and wear) of the visual overhaul are done. Stages 2 (camera and colour grade) and 7 (sound and quality settings) are queued after the first mission; Stages 4 to 6 are parked. The exterior model and other decks come later.
