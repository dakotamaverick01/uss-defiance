# USS Defiance: one-file bundle for review

Branch `captain-sim` at `6908744`. Read-only copy for review: suggest changes in words; do not edit the repository.

Contents: the docs first, then every source file in load order.

---

## `README.md`

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
| **Officers' wardroom** | Where the officers dine: a table for ten, two sideboards under the ship's crest and a painting, the mess board, a starboard viewport, and double doors aft into the observation lounge. |
| **Officers' passage** | From the corridor's end, to port and aft along the wardroom, past the sealed pod capacitor bank. |
| **Observation lounge** | Across the stern of the spine: a wide window looking aft over the saucer's back to the rollbar arching over the ship with the weapons pod on its crown and a nacelle out to either side, a window ledge with swivel chairs, small tables, and a bar. |

## Controls

- **Phone:** drag the stick on the left to walk, drag the right side to look, tap a station when you're close to use it.
- **Desktop:** click the view once and the mouse looks around freely (the browser hides the cursor; no dragging). W A S D or the arrow keys to walk; put the centre dot on a station and click, or press E, to use it. Opening a panel or pressing Esc gives the cursor back; click the view to look again. Where the page can't capture the mouse, drag to look instead.

## How it's built

[three.js](https://threejs.org/) 0.186, loaded from a CDN through an import map. There is no build step.

- **Code layout:** `index.html` holds the page, styles and a small loader. The ship's code lives in `js/`, one file per area, loaded in order and sharing one scope:

  | File | What it covers |
  | --- | --- |
  | `core.js` | Constants, renderer, shared helpers, display palette, scene state |
  | `decks.js` | The deck registry: each deck's group, collision, rooms and floor height, read by collision, the lift and the location readout |
  | `shipgeo.js` | The ship's shape in metres (`SHIPGEO`): the saucer and engineering body (`shipHull` works out the hull's cross-sections and outlines from them), spine, rollbar and weapons pod with its launchers, nacelles, pylons, every deck's compartments. An identical copy lives in the deck-plan page |
  | `exterior.js` | The exterior model, built from `SHIPGEO`, with its painted atlas and its own light |
  | `sim.js` | The ship model: power, shields by arc, weapons, eight damage zones, repair teams, combat drill. Runs on a fixed 10-per-second tick |
  | `surfaces.js` | Surface detail: texture loading, world-mapped detail, wear, screen pixel grid and smudged glass |
  | `materials.js` | Procedural textures, reflections, material library |
  | `bridge.js` | Bridge geometry: shell, consoles, seating, dais, viewscreen, aft wall |
  | `space.js` | The space scene shown on the viewscreen |
  | `rooms.js` | Ready room, conference room, head, window views |
  | `lighting.js` | The one live light (viewscreen warp glow) and a fallback rig if the bake can't load |
  | `bake.js` | Loads the baked light and adds it to every interior material |
  | `batch.js` | Merges fixed objects that share a material into one per deck, material and 6 m zone to cut draw calls: fixed parts at load, light-mapped walls and floors once the bake loads, the lift car from `lift.js`. Chairs and doors at rest are drawn merged and "wake" into their own parts when you come close; `tools/check_budget.py` checks the result per deck |
  | `collision.js` | Walking collision |
  | `screens.js` | Console screen drawing and the instrument widget kit |
  | `sound.js` | Synthesized ambience and interface sounds |
  | `ui.js` | Station panels, alerts, HUD |
  | `kit.js` | The shared building kit for decks below the bridge (rooms, walls with openings, light panels, frames, handrails, signs, plants), built to the ship standards `STD` in core.js |
  | `deck2.js` | Deck 2, 3.5 m below the bridge: lift lobby, corridor, all the officers' quarters, wardroom, passage, observation lounge, and the exterior model seen through its windows |
  | `lift.js` | Lift 1: the car, the ride, deck switching (one deck in the scene at a time) and the sealed lobby for unbuilt decks |
  | `controls.js` | Movement, touch and mouse input, aiming |
  | `render.js` | Haze light shafts, post-processing, screen redraw scheduler, hero shots, frame loop |
  | `perf.js` | Performance readout (press P, or open with `#perf`): frame rate, frame time, graphics chip, and switches for resolution, soft shadows, edge smoothing and display updates, remembered per browser, plus a speed test that times each part switched off in turn |

- **Lighting (baked):** the ship is lit only by its own fixtures: downlights, ceiling discs, cove slots, deck strips and screens. That light, including light bouncing off floors and walls, is calculated ahead of time in Blender and saved per deck in `bake/d1/`, `bake/d2/` and so on, so changing one deck never re-bakes another. Floors, walls and ceilings carry a light map (one image laid out like a sewing pattern); everything else reads a grid of light probes, points every 30 cm that recorded the light arriving from six directions. Light level and alert colour still change live. There are no real-time lights apart from the viewscreen's warp glow, which keeps phones fast.
- **Decks and the lift:** decks sit at their real heights, 3.5 m apart, and the lift car really travels between them. Only the deck you are on is shown, which keeps phones fast as the ship grows. Deck 1 and Deck 2 are lit together in one bake (the export shows every deck while it runs). The lift car and the sealed lobbies for unbuilt decks are not part of the bake: their light is painted into small light maps in `lift.js`, and `bake.js` skips their materials.
- **Interface:** every screen is drawn from one kit of solid blocks on black: elbow frames, pill buttons, solid bars and number columns, in one palette (peach frames, tan and butterscotch readouts, lilac as the second colour, rose and plum accents; green, amber and red only for status). Text uses Antonio, a condensed face. At Yellow alert the peach pulses toward butterscotch; at Red it turns red, the lilac dims and the room lights drop to about a third and redden.
- **Screen density:** around each screen's readable widgets sit banks of numbered pill buttons and slowly ticking number columns (a side rail on wide screens, a bottom deck on tall ones), so every display reads as a busy working console. They carry no information of their own.
- **Master systems display** (aft bridge wall, 2048 x 820): a side cutaway of the Defiance (a lens-shaped saucer with the officers' spine and bridge pod on its back, flowing into a slim engineering body, a rollbar over the back carrying the weapons pod and its torpedo launchers, long nacelles just above the saucer on swept pylons), every deck and compartment from the deck plan (both draw from the shared `SHIPGEO` block, kept identical in `docs/master-systems-display.html` and `js/shipgeo.js`), callouts, a pulsing warp core and live damage tints; a plan view with live shield arcs and the warp field; the deck index and readouts. The static layers are cached and redrawn only when the alert or damage state changes.
- **Exterior:** `exterior.js` builds the outside of the ship from `SHIPGEO`, so it always matches the deck plan. The form is a swept saucer: each station along the ship is the smooth union of the saucer's lens (thinning toward its rounded rim) and the engineering body's rounded section, so the saucer flows into the body on a soft fillet with no neck (`shipHull`, shared with the deck plan). On top: the faired officers' spine and bridge pod. Over the back: a swept rollbar rising from the saucer's aft shoulders (`shipRoll`) to a lozenge-shaped weapons pod (`shipPodAt`) with two torpedo launchers firing forward and one aft. Long, round, tapered nacelles sit just above the saucer on swept pylons; the deflector dish glows on the engineering body's nose under the saucer. The outside is busy with working hardware, each piece placed from the deck plan: docking ports on the saucer rim (Deck 4) and a docking collar under the keel (Deck 10), each ringed with chasing amber guide lights; the fighter hangar's four launch doors in the saucer's belly (Deck 6); the two-deck shuttlebay (Decks 7-8) behind clamshell doors in the stern, which the Flight panel opens to show the lit bay with a runabout and two shuttles inside; tractor emitters on the keel, sensor pallets, small dishes and whip antennas; phaser strips round the saucer, along the engineering flanks and on the weapons pod; navigation strobes, red beacons, service stencils and the registry repeated by the docking ports and on the bay doors. The impulse vents glow brighter with speed and trail a soft red-orange plume, and the thruster blocks puff now and then as she holds station (and in a burst when the speed order changes). Paint: a dark gunmetal grey with a green cast, in layered panel patchwork, panel lines, weathering streaks trailing aft, black window bands (windows placed from the deck plan's rooms), slate pinstripes and a few oxide-red accents; name and registry in Antonio on the saucer top and underside, the engineering flanks and the nacelles. One canvas atlas carries the colour, with each panel's relief in its alpha channel, plus a glow map. Its own small shader lights it (the baked interior is untouched): a low raking key light with real shadows from a shadow map rendered once at load, a cool rim light, dim fill, glossier and duller panels, surface relief from the height channel, and warm floodlights on the registry, the rollbar, the launchers and the flank lettering, which go dark at red alert. About 164k triangles on desktop and a much lighter build on phones (lighter atlas and shadow map too). `tools/exterior_shots.py` renders it from nine fixed outside viewpoints. For now it is seen through Deck 2's windows.
- **Stations:** the screens are the furniture. Each wall position is a deep sloped desk whose whole top is one display (big colour pads, a segmented ring gauge, the station's own readouts) under a thick light bezel with a padded navy lip, a small hooded viewer at the back, a ribbed louver band on the wall behind, and the upper displays set deep into a thick framed panel. Below each desk, a recessed apron of padded navy panels. The helm and operations pods and the dais desks use the same desk display.
- **Layered screens:** every display has a still, dim back layer (deep navy trays laid out under each section, a faint grid, a faint schematic and tiny reference codes) drawn once and cached, with the crisp readouts on top. About four fifths of each screen is still; a few pieces move slowly and continuously (a filling bar, a scope trace, a slow scroll) and single values change on their own independent timings, never in sync.
- **Surfaces:** every main material has colour, bump detail (a normal map, an image that fakes small bumps and grooves), roughness and contact shading. Floors use photographed sets from [ambientCG](https://ambientcg.com) (free, CC0): Carpet012 on the bridge, Carpet016 recoloured for the ready and conference rooms, Wood018 for the furniture, DiamondPlate008C for the deck edges and head, and a leather grain. Brushed steel, painted-metal detail and screen fingerprints are generated by `tools/make_textures.py`, which also shrinks everything to about 4 MB in `textures/`. Hard surfaces are textured by world position rather than their own layout, so nothing stretches. Wear follows use: polished edges on consoles and desks, scuffed walkways on the bridge floor, grime near the deck, fingerprints on screens. Screens show a fine pixel grid when you lean in.
- **Rendering:** ACES filmic tone mapping, a faint haze, reflections taken from the baked room, and post effects from [postprocessing](https://github.com/pmndrs/postprocessing) (MIT): a soft mip-mapped bloom for screen glow, plus [N8AO](https://github.com/N8python/n8ao) (MIT) ambient occlusion, the soft contact shadows where surfaces meet, on desktop only. If those libraries can't load, three.js's own bloom is used.
- **3D text:** station ID plates and door labels use [troika-three-text](https://github.com/protectwise/troika) (MIT), which draws each letter from the font's outline as a signed-distance field, so text stays sharp at any distance. The font is Antonio (SIL Open Font License, `fonts/OFL-antonio.txt`), bundled in `fonts/` as woff (troika cannot read woff2).
- **Decks built on arrival:** only the bridge is built at start-up. Each other deck (and Deck 2's exterior view) is built the first time the lift heads there, while the car's doors are shut (`decks.js` `deckBuild`). Every built deck's light files load at start-up; the lift switches the light to the deck you arrive on. Checks that need every deck at once set `window.DEFIANCE_BUILD_ALL`.
- **Re-baking the light** (needed after moving any fixed geometry on a deck; re-bake only that deck. The ship warns in the console if a deck's bake no longer matches, and falls back to the old light if the bridge's doesn't):
  1. `python3 tools/bake_export.py . <work> <deck>`: opens the ship headlessly, builds that deck and writes its geometry and fixtures.
  2. `RIG='{"disc": 6.0, "panel": 6.0, "down": 0.9, "spot_bridge": 220.0, "spot_room": 150.0}' <venv>/bin/python tools/bake_blender.py <work> 160`: renders the light with Blender's Cycles (`pip install bpy` into a virtual environment; bpy 5.3 on Python 3.13 works). The `RIG` values are the brighter "bright workhorse" fixture strengths the ship ships with; without them the script's older, dimmer defaults are used. About 15 to 25 minutes per deck on two cores at 160 samples (the bridge 16, Deck 2 25).
  3. `EXPOSURE=10.5 python3 tools/bake_encode.py <work> .`: cleans up the result and writes `bake/d<deck>/` at the shipped brightness (exposure 10.5; the script's default is the older 7.0).
- **Checks:** `tools/hero_shots.py` captures the six hero shots; `tools/check_stations.py` opens every station at desktop and phone size and reports errors; `tools/check_deck2.py` rides to Deck 2 and checks its rooms, stations, doors, walkways and the exterior model (no baked materials, triangle count within the phone budget); `tools/check_plan.py` checks the shared ship geometry (both copies identical, every compartment inside the hull, no overlaps); `tools/plan_shots.py` renders the deck-plan page and dumps the bridge display and situation table.
- **Ship model:** `sim.js` holds the ship's live state and rules, with every starting number in one tuning table (`SIM`). It advances on its own fixed tick, separate from drawing, so it keeps running when no screen redraws. Screens and station menus only read it and call its orders. Tests: `node --test tests/sim.test.js`.
- **Screens:** every console display is drawn live onto an HTML canvas from a shared set of widgets (tables, bar graphs, dials, plots), reading the ship model. Block-style screens in palette A (see Interface above; `docs/interface-style-sheet.md` describes the earlier amber scheme and is superseded). Only screens near the player redraw, to keep phones smooth.
- **Viewscreen:** renders a separate space scene (starfield, nebula, planet, warp streaks) to a texture.
- **Collision:** walls and doors are line segments, and furniture is circles. Walls also block clicks, so you can't use a panel through a wall.
- **Sound:** generated in the browser with the Web Audio API. There are no sound files.
- **Hero shots:** six fixed camera positions used to judge each visual stage side by side. Run `DEFIANCE_HERO(1)` through `DEFIANCE_HERO(6)` in the browser console (7 and 8 are console and chair close-ups), and `DEFIANCE_HERO(0)` to return to play. Contact sheets are in `docs/` (`hero-shots-stage3.jpg` and `closeups-stage3.jpg` are the latest).

## Status

**Captain simulator (branch `captain-sim`):** the design is in `docs/superpowers/specs/2026-11-22-captain-sim-design.md`. Stage 1 (ship model, live consoles, new colors) is done. Gameplay is on hold while the ship is built out. Build-out Stages 1 to 3 are done (bigger Deck 1 rooms, a working Lift 1, Deck 2 part 1), along with a bridge refit: block-style screens in a new palette, a brighter room and rebuilt stations (design: `docs/superpowers/specs/2026-11-25-bridge-refit-design.md`), then two detail passes: denser screens and a new master systems display, followed by new chairs, the situation table, an orbital view and continuously animated displays. Deck 2 part 2 is done too: the first officer's and senior officers' quarters, a passage and the observation lounge (design: `docs/superpowers/specs/2026-11-26-deck2-part2-design.md`).

Deck 1 is complete. In the build-out (gameplay paused), Stage 1 gave it more room: every bridge wall moved out 0.8 m for wider walkways (consoles moved with the walls; the dais, pods and situation table stayed put), the ready room and conference room grew to about 6 x 6.5 m and 8 x 6.5 m with 3.1 m ceilings, and the light was re-baked at 160 samples. Stages 0 (engine upgrade, code split, hero shots), 1 (baked fixture lighting, contact shadows, bounce light, haze) and 3 (surfaces and wear) of the visual overhaul are done. Stages 2 (camera and colour grade) and 7 (sound and quality settings) are queued after the first mission; Stages 4 to 6 are parked. The exterior model and other decks come later.


---

## `docs/superpowers/specs/2026-11-22-captain-sim-design.md`

# Defiance Captain Simulator: Simulation Layer

*Design doc, drafted 22 November 2026. Status: waiting for approval. Nothing is built until it is approved.*

## Intent

Turn the walkable bridge into a captain simulator. You sit in the command chair and give orders to the stations, and the stations carry them out. The ship is a real system with numbers that change, and those numbers are what the consoles show. Your orders (where power goes, which shield arc you favor, what you target, how you maneuver, where you send repair teams) decide whether the convoy survives.

**Success looks like:** a 10 to 15 minute convoy-ambush mission that plays well on a phone and on a desktop. A good captain can win it, a careless one loses freighters, and a reckless one loses the ship.

## Goals, non-goals, anti-goals

- **Goals:** every console readout comes from the live ship model; orders go through stations, and the crew acknowledges them out loud (as text); one complete mission with briefing, fight, win or loss, debrief and restart.
- **Non-goals for now:** a campaign, saving, more than one mission, crew figures, voiced lines, multiplayer, realistic 3D flight.
- **Anti-goals (failures even if they work):** any copied franchise ship, layout, interface or name; color coding by station; stats that only change how things look; menus so deep you can't fight on a phone; combat that drops the frame rate on a phone.

## Constraints

- three.js 0.186 with no build step. The `js/` files share one scope and load in order (see `index.html`).
- Only screens near the player redraw (`render.js`), so the simulation must run on its own and never depend on a screen being drawn.
- Color system, as decided: near-black screens `#07090C`, panel frames `#1C2229`, primary amber-gold `#E3A23B` (dim `#9C6B22`), secondary ice blue `#8FC3E0`, hero white `#EEF2F5`. Muted green, amber and red are used for status only. A station is identified by its icon, label and hex-cut shape, never by hue. Yellow alert pulses the amber brighter. Red alert turns the amber to `#E04848` and dims the blue. Backgrounds stay dark, and there are no purples. This replaces the "color means function" rule in `interface-style-sheet.md`.
- The schematic SVG (plan, profile, front, normal and red alert) is the source for the damage zones and the ship display.
- Everything stays original. The repo, commits and files carry nothing personal. Commits are made as dakotamaverick01 with the GitHub no-reply email.

## Approaches considered

| Approach | Trade-off | Verdict |
| --- | --- | --- |
| **A. One simulation file** (`js/sim.js`) holding the ship model. It updates on a fixed *tick* (a small step, 10 times a second), separately from drawing. Orders go into a *queue* (a waiting list the crew works through). Screens and panels only read the model. | One more file, but all the rules live in one place, and combat, missions and pause build on it cleanly. | **Picked** |
| B. Keep adding logic to the existing `state` object in `ui.js` and `screens.js`. | Cheapest today, but the rules end up spread across drawing code, and combat becomes fragile. | Rejected |
| C. Move to a game engine. | Better tools, but loses the phone link (already ruled out in the visual overhaul plan). | Rejected |

**Decided in conversation:**
- Combat runs in **real time with a pause.** The crew acknowledges each order and carries it out after a short delay.
- The fight is shown **on a tactical plot first.** 3D ships on the viewscreen come in a later stage.
- **The Defiance can be destroyed.** You get a debrief and restart the mission.
- **The mission is won if at least two of the three freighters get through.**

## Ship systems

All numbers below are starting values. They live in one tuning table, so balancing never means rewriting the rules.

### Power
The reactor (in the rear hull) makes 100 units. Life support always takes 5. Ops sets the rest with presets:

| Preset | Weapons | Shields | Engines | Sensors |
| --- | --- | --- | --- | --- |
| Balanced | 30 | 30 | 25 | 10 |
| Attack | 45 | 25 | 15 | 10 |
| Defend | 20 | 45 | 20 | 10 |
| Speed | 15 | 25 | 45 | 10 |

A system's efficiency is its share of power divided by its Balanced share, capped at 1.5. **Emergency power to shields** (Engineering) boosts shield regeneration by 40% for 20 seconds, then cuts reactor output by 20% for 30 seconds. Damage to the engines zone cuts reactor output.

### Shields by arc
There are four *arcs* (the sides of the ship a hit can come from): **forward, port, starboard and aft.** Each holds up to 100 and regenerates 2 per second times shield efficiency.
- Condition Green: shields are down (navigational field only).
- Yellow or Red alert: shields rise to full over 4 seconds.
- **Reinforce an arc** (Tactical): that arc goes up to 140 and the others drop to 85.
- A hit drains the arc it comes through. Once that arc is empty, the hit lands on the hull.

### Weapons
| Weapon | Where it can fire | Behavior |
| --- | --- | --- |
| Dorsal beam turret (on the spine) | Forward and both sides (270°) | Charges in 4 s divided by weapons efficiency. 8 to 12 damage inside 10 km, fading to nothing at 20 km |
| Ventral beam array | Forward and both sides (240°) | Same as the dorsal turret, slightly lower damage |
| Twin torpedo bays (prow) | Forward only (60°) | 24 torpedoes, 12 per bay. Each bay reloads in 6 s. 30 damage, reaches 30 km, travels at 3 km/s, so a target that maneuvers can dodge |

Tactical can **fire at will** (the crew fires whatever bears on the selected target) or **hold fire**, and can order single shots.

### Damage zones
There are eight zones, matching the schematic. Each starts at 100%.

| Zone | What it hosts | When damaged |
| --- | --- | --- |
| Prow | Torpedo bays, forward sensors | Slower torpedo reloads, shorter sensor range |
| Dorsal | Dorsal turret, bridge | Turret weakens. Bridge hits flicker the lights and screens |
| Ventral | Ventral array, main sensor array | Array weakens, target lock worsens |
| Port hull | Port shield emitters, crew sections | Port arc regenerates slower |
| Starboard hull | Starboard shield emitters, crew sections | Starboard arc regenerates slower |
| Port nacelle | Half the warp field | Below 25% on both nacelles: no warp out at the end of the mission |
| Starboard nacelle | Half the warp field | Same as the port nacelle |
| Engines (rear hull) | Impulse drive, reactor | Lower top speed and turn rate, less reactor power |

- **Which zone a hit lands on depends on the arc it comes through.** Forward hits mostly land on the prow, with some on the dorsal and ventral zones. Side hits land on that side's hull, nacelle and the dorsal zone. Aft hits land on the engines, the nacelles and the ventral zone. The exact odds are in the tuning table.
- **Below 50%** a zone's systems work at half strength. **At 0%** they go offline.
- **The ship is lost** when overall hull integrity (the average of all zones) reaches 0. Separately, if the engines zone reaches 0, the reactor breaches after a 20-second countdown unless a repair team gets there first.
- **Repair teams:** three teams (already on the damage control screens). Moving a team to a zone takes 10 seconds. A team repairs 1% per second, up to 80% (a field repair).

## Crew and orders

- **No crew figures.** The crew speaks through the existing toasts (the short messages at the edge of the screen), for example "Tactical: Aye, reinforcing forward shields." Each order is acknowledged after 0.8 to 1.5 seconds, or 0.5 seconds at red alert, when everyone is at their station.
- **Pause:** a Hold control freezes the simulation. You can still open stations and queue orders, and they carry out when you resume.
- **Command bar:** while you're seated, a bar gives one-tap access to alert level, Hold, the target, fire at will, power preset and reinforce arc. On a phone you can fight the mission without leaving the chair. Walking around stays possible, and the simulation keeps running while you do.

| Station | Orders |
| --- | --- |
| Command chair | Alert level, Hold, start mission, briefing |
| Flight | Speed (stop, one-third, two-thirds, full impulse); intercept target; hold station on the convoy; come about to put an arc toward the target; evasive pattern |
| Tactical | Select target; fire at will or hold fire; fire dorsal, ventral or torpedoes; reinforce an arc |
| Operations | Power preset |
| Engineering | Emergency power to shields |
| Damage control | Send each repair team to a zone |
| Science | Scan target (reveals its weakest arc and its hull condition) |
| Comms | Convoy: close formation, scatter, or make for the jump point. Hail the raiders |

Exploring at warp (the current destinations and planet scans) stays as a free-play mode. The mission is started from the command chair.

## First mission: "The Thessaly Run"

The Defiance escorts three freighters (Amity Rose, Kestrel Maiden, Iron Patience) at impulse from Iralis to the jump point at the Thessaly Drift. An interdiction field (a jamming field that stops ships from going to warp) blocks warp until about minute 12. Track 0417 has been shadowing the convoy. The attackers are the **Sable Compact**, privateer leftovers from the Hollow War (the name is a placeholder you can change).

| Time | What happens |
| --- | --- |
| 0:00 | Briefing on the command chair. The convoy is in line astern, and 0417 is reported as "watching." |
| ~1:30 | Science: 0417 drops its masking. Two Lance raiders (fast and lightly armored, with weak aft shields) jump in and go for the rear freighter. |
| 2:00–6:00 | **The first dilemma:** chase the raiders and leave the convoy, or hold station and absorb the hits. The Comms order to scatter or close up changes how exposed the freighters are. |
| ~6:00 | A third raider and a heavy Corsair (strong shields, torpedoes) arrive on the flank and target the Defiance. Damage control now matters. |
| ~12:00 | The interdiction field fails. Make for the jump point and warp out with the convoy (this needs at least one nacelle above 25%). The raiders withdraw early if the Corsair is disabled or half their ships are lost. |
| End | **Debrief:** freighters saved, damage taken, torpedoes used, time. **Win:** at least 2 freighters get through. **Loss:** 2 or more freighters lost, or the Defiance destroyed. Restart from the start. |

**Enemy behavior is kept simple:** approach, make an attack run on a target, break off when shields are low, flee at 25% hull. The Corsair stands off and fires torpedoes. The freighters follow the convoy lead and obey Comms orders, have almost no shields, and take 100 hull each.

## Build stages

Costs are rough, in the same "points of weekly usage" as the visual overhaul plan. They are estimates (I can't see your meter), and I'll rescale them after Stage 1. The stop rule carries over: if a stage runs past 1.5 times its estimate, I stop at the next clean point and publish what works. Each stage is its own fresh chat.

| Stage | What you get | Est. points |
| --- | --- | --- |
| **1. Ship state, live consoles, new colors** | `sim.js` with power, shields by arc, weapon charge and ammunition, eight zones and repair teams. Every console and panel shows live values. Alerts raise the shields. Ops sets power presets, Engineering has emergency power, Damage Control can send teams. A **Combat drill** at Tactical throws simulated hits at random arcs for 60 seconds, so you can watch the whole chain react. All screens recolored, style sheet rewritten. | 4.5 |
| 2. Orders and pause | Crew acknowledgments and delays, Hold, the command bar in the chair, full order sets for each station, an order log | 3 |
| 3. Tactical plot and movement | A flat battle map in kilometers. Contacts and freighters move. Flight orders work. The plot appears on Tactical, Ops, the situation table and the viewscreen overlay | 4 |
| 4. Ship display from the schematic | Zone display drawn from your SVG, with live damage and shield arcs. Replaces the old outline | 2.5 |
| 5. Combat | Firing, hits resolved through arcs into zones, enemy behavior, damage effects, reactor breach, ship loss | 5 |
| 6. The Thessaly Run | Mission script, briefing, comms, win and loss, debrief, restart, balancing pass | 4 |
| *Core total* | *A complete, playable mission* | *23* |
| 7. Ships on the viewscreen | Original raider, Corsair and freighter models; beams and torpedoes; the view follows the target | 4 |
| 8. Feel | Hit shake (off when reduced motion is on), sparks, light flicker, layered combat sound | 2.5 |
| After that | The parked overhaul stages worth doing: Stage 2 (camera and color grade) and Stage 7 (sound and Phone/Desktop/Cinematic settings). Stages 4–6 (detail, lived-in, photo mode) stay parked | 5 |

Stage 4 can move earlier as soon as the SVG is in hand.

**At the end of every stage:** the branch is pushed, the live artifact is updated at the same link, a before/after screenshot sheet is made, and `uss-defiance-for-grok.md` is refreshed (Grok can see it but not edit). Every station is checked at phone and desktop size with `tools/check_stations.py`, and I look at the renders myself before showing you.

## Calls I made (correct any)

- The simulation work goes on a new branch, `captain-sim`, made from `overhaul-redo`, so the overhaul branch stays clean if you go back to it.
- Combat is flat (a 2D map). Dorsal and ventral hits come from which arc and zone odds a hit uses, not from height.
- The two nacelles are tracked separately.
- The enemy faction, ship types and mission name are placeholders.
- All starting numbers are set to be tuned in the balancing pass, not treated as final.
- The recolor goes into Stage 1, because it touches the same drawing code.

## Left to the builder

The file layout inside `sim.js` (or a separate tuning-table file), the exact odds for which zone a hit lands on, enemy steering, tick details, and how each existing widget is wired to the model.


---

## `docs/superpowers/plans/2026-11-22-stage1-ship-state.md`

# Stage 1: Ship State, Live Consoles, New Colors — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A live ship model drives every console and station panel, a Combat Drill at Tactical lets you watch shields, damage zones and repair teams react, and all displays use the decided amber/ice palette.

**Architecture:** New `js/sim.js` (loaded right after `core.js`) holds the ship model and its rules and advances on a fixed 0.1 s tick, independent of drawing. It never touches the DOM; it reports crew messages through `sim.events`, which `ui.js` drains into toasts. Screens (`screens.js`) and panels (`ui.js`) only read the model and call its order functions.

**Tech Stack:** three.js 0.186 via import map, plain scripts sharing one scope, no build step. Tests (`node --test tests/sim.test.js`): Node built-in test runner loading `sim.js` in a `vm` context; Playwright smoke checks in `tools/`.

**Spec:** `docs/superpowers/specs/2026-11-22-captain-sim-design.md`

## Global Constraints

- Colors: screens `#07090C`, frames `#1C2229`, primary `#E3A23B` (dim `#9C6B22`), secondary `#8FC3E0`, hero white `#EEF2F5`; muted green/amber/red for status only; yellow alert pulses the amber brighter; red alert turns amber to `#E04848` and dims the blue; no purples; no per-station hue.
- Starting numbers exactly as the spec's tables (power presets, shields 100/2 per s/4 s rise/140 and 85 reinforce, beams 4 s charge, torpedoes 12 per bay with 6 s reload, repair 1%/s to 80%, team move 10 s, breach 20 s).
- Phone and desktop both pass `tools/check_stations.py` with no page errors.
- Commits as dakotamaverick01 with the no-reply email; nothing personal in files.

## Review Focus

1. Drill left running while walking away: the simulation must keep advancing even when no screen near the player redraws (tick lives in the frame loop, not in drawing).
2. Hidden tab or phone sleep: a long frame gap must not run thousands of ticks; `simUpdate` caps catch-up at 1 s.
3. Engines zone reaching 0 with a team already there: no breach countdown starts.
4. Dropping to Condition Green with damaged shields: shields fall, arc values keep their damage and regenerate only when raised.
5. Both nacelles below 25%: engaging warp is refused with a Flight message instead of jumping.

---

### Task 1: Ship model (`js/sim.js`)

**Files:** Create `js/sim.js`, `tests/sim.test.js`; modify `index.html` FILES list (add `'sim'` after `'core'`).

**Interfaces — Produces:**
`SIM` (tuning table), `ARCS = ['fwd','port','stbd','aft']`, `ZONES` (`[{id,name}]` for prow, dorsal, ventral, port, stbd, portNac, stbdNac, engines), `sim`, `simReset()`, `simUpdate(dt)`, `simStep(dt)`, `reactorOut()`, `eff(sys)`, `zoneFactor(id)`, `zoneStatus(id) -> 'ok'|'warn'|'alert'|'off'`, `hullIntegrity()`, `shieldMax(arc)`, `shieldNow(arc)`, `simCanWarp()`, orders `setPreset(name)`, `emergencyPower()`, `reinforceArc(arc|null)`, `sendTeam(i, zoneId)`, `worstZone(excludeIds)`, `startDrill()`, `stopDrill()`, `simHit(arc, dmg)`. Reads only `state.alert`.

- [ ] Tests (node --test): balanced preset gives `eff` 1 for all; Attack gives weapons 1.5; shields reach 100 within 4.1 s of `state.alert='yellow'`; reinforce fwd sets max 140/others 85; a 150 hit on a full forward arc leaves 0 shield and 50 damage on a forward zone; engines at 0 with no team starts a 20 s breach and `ship.lost` after it; with a team on engines no breach; repair stops at 80; `simUpdate(10)` runs at most 10 ticks; both nacelles at 20 → `simCanWarp()` false.
- [ ] Implement until green. Commit.

### Task 2: Palette swap

**Files:** `js/core.js` (`ALERTS`, `pal()`), `js/screens.js` (`FUNC`, `fnColor`, `sub`, keys, decorative series colors), `js/ui.js` (`openStation` `--fn`), `index.html` CSS variables, `docs/interface-style-sheet.md`, `docs/interface-tokens.json`.

- [ ] `pal()` returns `acc` (alert accent, yellow pulsing), `accDim #9C6B22`, `ice #8FC3E0` (dimmed at red), `txt #EEF2F5`, `dim`, `line #1C2229`, `bg #07090C`, status `green/yel/red` muted. Every station's node, rail and tabs use `acc`; data series use `acc`/`ice`; status colors only for status.
- [ ] Re-run screen sheet; confirm no blue/green/yellow function coloring remains. Commit.

### Task 3: Live consoles

**Files:** `js/screens.js` DRAW: `helm`, `ops`, `sys`, `tac`, `wpn`, `dmg`, `status`, `msd`, `drawCmd`; new widget `zonesW(g, r, P)`.

- [ ] Every value listed in the spec's systems section is read from `sim` (power shares, reactor output, shield arcs, beam charge, torpedo counts and reload, eight zones, hull, teams, breach countdown, drill). No hard-coded readiness values remain on these screens. Commit.

### Task 4: Orders and panels

**Files:** `js/ui.js` (STATIONS: ops presets, engineering emergency power, defense reinforce arc + Combat Drill, damage teams + reset, weapons/helm/command readouts from `sim`; `setSpeed` refuses warp when `!simCanWarp()`; `drainSimEvents()`), `js/render.js` (call `simUpdate(dt)` and `drainSimEvents()` each frame; refresh open panel ~4×/s).

- [ ] `check_stations.py` passes at desktop and phone. Drill run in the browser shows shields dropping, zones taking damage, teams repairing. Commit.

### Task 5: Stage close-out

- [ ] Hero shots before/after sheet, screen before/after sheet, README + style sheet updated, Grok bundle `uss-defiance-for-grok.md` regenerated, branch pushed, live artifact republished at the same link.


---

## `docs/interface-style-sheet.md`

# Defiance Bridge Interface

The display and control language of the USS Defiance (EV-0408), a Bastion-class heavy escort built for deep-space interdiction, heavy strike and heavy escort. Every screen, key and station menu on the bridge follows these rules, so the ship reads as one system. New rooms and decks are built from this sheet.

## Principles

- **One grammar everywhere.** Displays, console keys and station menus are made from the same three shapes: the hex node, the hex-cut tab and the segmented rail.
- **One accent, not a rainbow.** Amber-gold is the only accent on every station. A station is identified by its icon, label, code and hex-cut shape, never by hue.
- **Color means status, and only status.** Muted green, amber and red appear only where something is ok, degraded or failing.
- **Dense, not cluttered.** A working starship shows a lot at once. Each display is a grid of sub-panels, each with one job and one tab title.
- **Live, not decorative.** Readouts come from the ship model (`js/sim.js`). If a number moves, something in the ship changed.
- **Touch first.** Keys are big, solid and numbered, and look like they want to be pressed.

## Color

Near-black `glass` (#07090C) is the only ground, framed in `frame` (#1C2229).

| Token | Value | Use |
| --- | --- | --- |
| `amber` | #E3A23B | The one accent: nodes, rails, tabs, primary keys, primary data |
| `amber-dim` | #9C6B22 | Secondary accent fills |
| `ice` | #8FC3E0 | Secondary: neutral keys, middle rail segment, secondary data |
| `hero-white` | #EEF2F5 | Values, primary text, pressed key |
| `ink-dim` | #7F8994 | Labels and codes |
| `status-ok` / `status-warn` / `status-alert` | #5FA97A / #D19A3E / #D2504B | Status only |

**Alerts swap the one accent; backgrounds stay dark.** Condition Green: amber. Yellow Alert: amber pulses brighter (`amber-hot` #FFCB73). Red Alert: the accent turns `alert-red` (#E04848) and ice dims to #5D7F92. No purples, ever.

`seam-light` belongs to the room (wall seams, coves, downlights), never to a display. Room accent strips are ice at Green, amber at Yellow, red at Red.

## Shapes

- **Hex node.** An amber hexagon with a dark core (`node-inner`). It anchors the top-left corner of every display and the header of every menu. It is the ship's mark, taken from the crest.
- **Hex-cut tab.** A bar with 60° angled ends (`hex-cut`). Keys, rails, bars and sub-panel tabs are all tabs. Nothing on a display has rounded corners (`radius-none`).
- **Segmented rail.** Under every screen title: a long amber tab, a short `ice` tab, then a long `frame` tab. Three segments, always in that order.

## Display anatomy

1. Hex node, top left.
2. Key column below it: hex-cut keys with four-digit codes (`key-code`), the first in amber, the rest `ice` or `frame`. Keys blink white now and then. Tall, narrow displays drop the column.
3. Screen title in `screen-title`, uppercase, with the station code (`SCI·03`) at the right in `label`.
4. Segmented rail.
5. Content: a grid of sub-panels. Each opens with an amber tab carrying an uppercase title, followed by a `frame` rule.

Console screens (short and wide) show three sub-panels in a row. Wall displays show two rows of two or three.

## Widgets

- **Big readout.** One value in `big-readout` with a unit in `label` beside it.
- **Table.** Label on the left in `ink-dim`, value on the right in `value`, a `frame` rule between rows.
- **Bars.** Label, a hex-cut track with a hex-cut fill, and a percentage.
- **Status lights.** A small hex node per item: `status-ok`, `status-warn`, amber for active, `status-alert`, `frame` for off.
- **Sparkline.** A single stroke with a 14% fill below it, over four `frame` rules.
- **Log.** Uppercase lines in `log-line` scrolling upward, the newest line in the accent.
- **Plots and dials.** Concentric rings in `frame`, a sweep line in ice or amber, contacts as hex nodes.
- **Damage zones.** Eight bars (prow, dorsal, ventral, port and starboard hull, both nacelles, engines) in status colors.
- **Deflectors.** Four arcs around the hull plan, each filled to its shield strength; a reinforced arc is drawn thicker.

## Station menus

Near-black panel with a 6px outer radius (`radius-frame`), an amber hex node badge, the role in `label` and the station name in `screen-title`. Then a segmented rail, a two-column readout table (labels in the accent, values in `ink`) and hex-cut action keys. The first key takes the accent, the rest `ice`. Every key carries a small reference code. The active key turns white with a black hex mark.

## Copy

- Uppercase on displays; sentence case in menu notes.
- Station codes are three letters, a middle dot and two digits: `FLT·01`, `ENG·06`.
- Key codes are four digits. Reference codes on menu keys read `NN-NNN`.
- Numbers carry units: `98.4%`, `21.5 °C`, `1.9 MILLION KM`.

## Don't

- Don't color a station by its job, and don't use a status color decoratively.
- Don't round display corners or join rails with curves. Rails meet at the hex node.
- Don't put text on a light ground other than black text on a solid key.


---

## `index.html`

````html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>USS Defiance Bridge</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Antonio:wght@400;500;600;700&family=Oxanium:wght@500;600;700&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Layout: one full-screen 3D view; thin HUD pinned to the edges; station panel as a chamfered glass sheet (bottom on phones, right card on wide screens). Single warm-dark look by design. */
:root {
  --void: #000000;
  --glass: rgba(0, 0, 0, 0.88);
  --rule: #2B2229;
  --ink: #F5E6CF;
  --ink-dim: #9A8678;
  --signal: #E8A06A;
  --signal-rgb: 232, 160, 106;
  --ice: #B693C4;
  --tan: #D9B07E;
  --butter: #F2C88F;
  --plum: #7E5C8E;
  --f-display: 'Antonio', 'Arial Narrow', 'Roboto Condensed', system-ui, sans-serif;
  --f-body: 'Barlow', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --f-mono: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
  color-scheme: dark;
}
[hidden] { display: none !important; }
html, body { height: 100%; margin: 0; background: var(--void); color: var(--ink); overflow: hidden; overscroll-behavior: none; }
body { font-family: var(--f-body); font-size: 14px; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
#view { position: fixed; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; outline: none; }

.hud-top {
  position: fixed; top: 0; left: 0; right: 0; z-index: 5;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
  padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  pointer-events: none;
}
.wordmark { font-family: var(--f-display); font-weight: 600; font-size: 15px; letter-spacing: 0.22em; text-shadow: 0 1px 10px rgba(0,0,0,.8); }
.locator { margin-top: 3px; font-family: var(--f-display); font-size: 13px; letter-spacing: 0.08em; color: var(--ink-dim); text-shadow: 0 1px 8px rgba(0,0,0,.9); }
@media (max-width: 480px) { .reg-inline { display: none; } .chip-long { display: none; } }
@media (min-width: 481px) { .chip-short { display: none; } }
.hud-right { display: flex; gap: 8px; align-items: center; pointer-events: auto; }
.chip {
  font-family: var(--f-display); font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 7px 14px; color: #000; background: var(--signal); border-radius: 15px; white-space: nowrap;
}
.icon-btn {
  width: 34px; height: 34px; display: grid; place-items: center; cursor: pointer; padding: 0;
  font-family: var(--f-display); font-weight: 700; font-size: 16px; color: var(--ink);
  background: var(--glass); border: 0; border-radius: 17px; box-shadow: inset 0 0 0 2px var(--tan);
}
.icon-btn svg { width: 18px; height: 18px; }
.icon-btn[aria-pressed="false"] { color: var(--ink-dim); }
.icon-btn:focus-visible, .act:focus-visible, .primary:focus-visible, .close:focus-visible { outline: 2px solid var(--signal); outline-offset: 2px; }

.reticle { position: fixed; left: 50%; top: 50%; width: 8px; height: 8px; margin: -5px 0 0 -5px; border: 1px solid rgba(255,240,220,.6); border-radius: 50%; pointer-events: none; z-index: 3; transition: transform .15s, border-color .15s; }
.reticle.live { transform: scale(1.8); border-color: var(--signal); }
.hint {
  position: fixed; left: 50%; top: 50%; transform: translate(-50%, 22px); z-index: 3; pointer-events: none;
  font-family: var(--f-mono); font-size: 12px; letter-spacing: 0.04em; color: var(--ink);
  background: var(--glass); border: 1px solid rgba(var(--signal-rgb), 0.45); padding: 6px 10px; white-space: nowrap;
}

.stick { position: fixed; width: 116px; height: 116px; border-radius: 50%; z-index: 4; pointer-events: none;
  border: 1px solid rgba(255,240,220,.25); background: rgba(18,15,12,.35); }
.stick.ghost { left: calc(env(safe-area-inset-left, 0px) + 24px); bottom: calc(env(safe-area-inset-bottom, 0px) + 30px); opacity: .6; }
.stick.ghost::after { content: "Move"; position: absolute; left: 0; right: 0; top: calc(100% + 6px); text-align: center; font-family: var(--f-mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-dim); }
.stick.live { margin: -58px 0 0 -58px; opacity: 1; }
.knob { position: absolute; left: 50%; top: 50%; width: 48px; height: 48px; margin: -24px; border-radius: 50%; background: rgba(var(--signal-rgb), .3); border: 1px solid var(--signal); }

.panel {
  position: fixed; z-index: 6;
  left: max(12px, env(safe-area-inset-left, 0px)); right: max(12px, env(safe-area-inset-right, 0px));
  bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  max-height: 48%; overflow-y: auto; -webkit-overflow-scrolling: touch;
  background: #000; border: 0; border-left: 18px solid var(--signal); border-top: 10px solid var(--signal); border-radius: 30px 0 0 0;
  padding: 14px 16px 18px 16px; user-select: text; -webkit-user-select: text;
  box-shadow: 0 10px 40px rgba(0,0,0,.6);
}
.panel-bar { display: flex; gap: 6px; margin: 10px 0 0; }
.panel-bar span { height: 10px; background: var(--plum); flex: 1; border-radius: 0 5px 5px 0; }
.panel-bar span:first-child { flex: 0 0 42%; background: var(--tan); border-radius: 0; }
.panel-bar span:nth-child(2) { flex: 0 0 16%; background: var(--ice); border-radius: 0; }
.panel-head { position: relative; }
@media (min-width: 720px) {
  .panel { left: auto; width: 390px; right: max(20px, env(safe-area-inset-right, 0px)); bottom: calc(env(safe-area-inset-bottom, 0px) + 20px); max-height: 72%; }
}
.panel-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.eyebrow { margin: 0; font-family: var(--f-display); font-size: 13px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--tan); }
.panel h2 { margin: 2px 0 0; font-family: var(--f-display); font-weight: 600; font-size: 28px; letter-spacing: .06em; color: var(--signal); text-transform: uppercase; text-wrap: balance; }
.close { flex: none; width: 56px; height: 34px; border: 0; border-radius: 17px; background: var(--ice); color: #000; font-size: 18px; font-weight: 700; line-height: 1; cursor: pointer; }
.readouts { display: grid; grid-template-columns: max-content 1fr; gap: 7px 14px; margin: 14px 0 0; }
.readouts dt { font-family: var(--f-display); font-size: 13px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--tan); padding-top: 1px; }
.readouts dd { margin: 0; font-family: var(--f-body); font-weight: 500; font-size: 15px; letter-spacing: .02em; color: var(--ink); min-width: 0; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.actions:empty { display: none; }
.act {
  position: relative; font-family: var(--f-display); font-weight: 700; font-size: 14px; letter-spacing: .08em; text-transform: uppercase;
  color: #000; background: var(--tan); border: 0; border-radius: 26px;
  padding: 20px 24px 8px 28px; cursor: pointer; min-height: 52px; min-width: 116px; text-align: right;
}
.act::after { content: attr(data-num); position: absolute; left: 20px; top: 6px; font-family: var(--f-display); font-size: 11px; font-weight: 500; opacity: .75; }
.act:first-child { background: var(--signal); }
.act:nth-child(3n) { background: var(--ice); }
.act:nth-child(4n+2) { background: var(--butter); }
.act.on { background: var(--ink); }
.act.on::before { content: ""; position: absolute; right: 20px; top: 8px; width: 10px; height: 8px; border-radius: 3px; background: #000; }
.act:active { filter: brightness(1.2); }
.act:disabled { opacity: .35; cursor: default; }
.note { margin: 12px 0 0; font-size: 13px; line-height: 1.45; color: var(--ink-dim); max-width: 60ch; }

.seatbar { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(env(safe-area-inset-bottom, 0px) + 24px); z-index: 5; }
.primary {
  font-family: var(--f-display); font-weight: 700; font-size: 15px; letter-spacing: .14em; text-transform: uppercase;
  color: #000; background: var(--signal); border: 0; padding: 14px 26px; cursor: pointer; border-radius: 26px;
}
.toast {
  position: fixed; left: 50%; transform: translateX(-50%); top: calc(env(safe-area-inset-top, 0px) + 66px); z-index: 7;
  width: max-content; max-width: calc(100% - 32px); font-family: var(--f-mono); font-size: 12px; line-height: 1.5; color: var(--ink); text-align: center;
  background: var(--glass); border: 1px solid rgba(var(--signal-rgb), .5); padding: 8px 12px; pointer-events: none;
}
.toast b { color: var(--signal); font-weight: 500; }
.vignette { position: fixed; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,.42) 100%); }
.flash { position: fixed; inset: 0; z-index: 2; pointer-events: none; background: radial-gradient(circle at 50% 40%, rgba(238,242,245,.8), rgba(143,195,224,0) 70%); opacity: 0; }
.flash.go { animation: flash .9s ease-out; }
@keyframes flash { 0% { opacity: 0 } 15% { opacity: 1 } 100% { opacity: 0 } }

.intro {
  position: fixed; inset: 0; z-index: 10; display: grid; place-items: center;
  padding: calc(env(safe-area-inset-top, 0px) + 20px) max(16px, env(safe-area-inset-right, 0px)) calc(env(safe-area-inset-bottom, 0px) + 20px) max(16px, env(safe-area-inset-left, 0px));
  background: radial-gradient(ellipse at 50% 55%, rgba(8,7,6,.35), rgba(8,7,6,.9) 75%);
}
.intro-card { width: 100%; max-width: 380px; }
.reg { margin: 0; font-family: var(--f-mono); font-size: 11px; letter-spacing: .18em; color: var(--ice); }
.intro h1 { margin: 6px 0 0; font-family: var(--f-display); font-weight: 700; font-size: clamp(32px, 9vw, 46px); line-height: 1; letter-spacing: .12em; text-wrap: balance; }
.intro .deck { margin: 8px 0 0; font-family: var(--f-display); font-weight: 500; font-size: 16px; letter-spacing: .18em; text-transform: uppercase; color: var(--signal); }
.intro .lore { margin: 14px 0 0; font-size: 15px; line-height: 1.5; color: var(--ink-dim); max-width: 36ch; }
.controls { list-style: none; margin: 18px 0 24px; padding: 14px 0 0; border-top: 1px solid var(--rule); display: grid; gap: 10px; }
.controls li { display: grid; grid-template-columns: 76px 1fr; gap: 12px; align-items: baseline; font-size: 15px; line-height: 1.4; }
.controls b { font-family: var(--f-mono); font-weight: 500; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-dim); }
.nogl { position: fixed; inset: 0; z-index: 11; display: grid; place-items: center; padding: 24px; text-align: center; background: var(--void); font-size: 15px; line-height: 1.5; }
/* Yellow alert: the one accent pulses brighter. Red alert: it turns red and the ice blue dims. */
html.alert-yellow .chip { animation: amber-pulse 1.6s ease-in-out infinite; }
@keyframes amber-pulse { 50% { background: #FFC48C; } }
html.alert-red { --ice: #5D7F92; }
@media (prefers-reduced-motion: reduce) { .flash.go { animation: none; } .reticle { transition: none; } html.alert-yellow .chip { animation: none; } }
</style>
</head>
<body>


<canvas id="view" aria-label="3D view of the USS Defiance main bridge"></canvas>

<div class="hud-top">
  <div>
    <div class="wordmark">USS DEFIANCE</div>
    <div class="locator">Main Bridge · Deck 1<span class="reg-inline"> · EV-0408</span></div>
  </div>
  <div class="hud-right">
    <span class="chip"><span class="chip-long" id="alert-chip">Condition Green</span><span class="chip-short" id="alert-chip-s">Green</span></span>
    <button class="icon-btn" id="sound-btn" aria-label="Sound" aria-pressed="true" hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path id="snd-wave" d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/><path id="snd-off" d="M17 9l5 6M22 9l-5 6" hidden/></svg>
    </button>
    <button class="icon-btn" id="help-btn" aria-label="Show controls">?</button>
  </div>
</div>

<div class="reticle" id="reticle"></div>
<div class="hint" id="hint" hidden></div>
<div class="stick ghost" id="stick" hidden><div class="knob" id="knob"></div></div>
<div class="vignette" aria-hidden="true"></div>
<div class="flash" id="flash"></div>
<div class="toast" id="toast" hidden></div>
<div class="seatbar" id="seatbar" hidden><button class="primary" id="stand-btn">Stand up</button></div>

<section class="panel" id="panel" hidden aria-live="polite">
  <div class="panel-head">
    <div><p class="eyebrow" id="p-role"></p><h2 id="p-title"></h2></div>
    <button class="close" id="p-close" aria-label="Close station">×</button>
  </div>
  <div class="panel-bar" aria-hidden="true"><span></span><span></span><span></span></div>
  <dl class="readouts" id="p-read"></dl>
  <p class="note" id="p-note" hidden></p>
  <div class="actions" id="p-actions"></div>
</section>

<div class="intro" id="intro">
  <div class="intro-card">
    <p class="reg">BASTION-CLASS HEAVY ESCORT · EV-0408</p>
    <h1>USS Defiance</h1>
    <p class="deck">Main Bridge</p>
    <p class="lore">Built in the war years for deep-space interdiction, heavy strike, and heavy escort. Small for what she carries.</p>
    <ul class="controls" id="controls"></ul>
    <button class="primary" id="board-btn">Step aboard</button>
  </div>
</div>

<div class="nogl" id="nogl" hidden>The bridge needs WebGL to render. Try opening this page in Safari, Chrome or Firefox with hardware acceleration turned on.</div>

<script type="importmap">
{ "imports": {
  "three": "https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/",
  "three/examples/jsm/": "https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/",
  "postprocessing": "https://cdn.jsdelivr.net/npm/postprocessing@6.39.6/build/index.js",
  "n8ao": "https://cdn.jsdelivr.net/npm/n8ao@2.1.0/dist/N8AO.js",
  "troika-three-text": "https://cdn.jsdelivr.net/npm/troika-three-text@0.54.0/dist/troika-three-text.esm.js",
  "troika-three-utils": "https://cdn.jsdelivr.net/npm/troika-three-utils@0.54.0/dist/troika-three-utils.esm.js",
  "troika-worker-utils": "https://cdn.jsdelivr.net/npm/troika-worker-utils@0.54.0/dist/troika-worker-utils.esm.js",
  "webgl-sdf-generator": "https://cdn.jsdelivr.net/npm/webgl-sdf-generator@1.1.1/dist/webgl-sdf-generator.mjs",
  "bidi-js": "https://cdn.jsdelivr.net/npm/bidi-js@1.1.0/dist/bidi.mjs"
} }
</script>
<script type="module">
// Loads three.js, then the ship's code files in order. The code files are plain scripts that share one scope.
const FILES = ['core', 'decks', 'shipgeo', 'exterior', 'sim', 'surfaces', 'materials', 'bridge', 'space', 'rooms', 'kit', 'deck2', 'deck3', 'lighting', 'bake', 'batch', 'collision', 'screens', 'sound', 'ui', 'lift', 'controls', 'render', 'perf'];
const fail = () => { window.DEFIANCE_FAILED = true; document.getElementById('nogl').hidden = false; document.getElementById('intro').hidden = true; };
try {
  const [T, { EffectComposer }, { RenderPass }, { ShaderPass }, { UnrealBloomPass }, { GammaCorrectionShader }] = await Promise.all([
    import('three'),
    import('three/addons/postprocessing/EffectComposer.js'),
    import('three/addons/postprocessing/RenderPass.js'),
    import('three/addons/postprocessing/ShaderPass.js'),
    import('three/addons/postprocessing/UnrealBloomPass.js'),
    import('three/addons/shaders/GammaCorrectionShader.js'),
  ]);
  window.THREE = Object.assign({}, T, { EffectComposer, RenderPass, ShaderPass, UnrealBloomPass, GammaCorrectionShader });
} catch (e) { fail(); throw e; }
// Optional extras (MIT licence): sharper post effects with soft contact shadows, and crisp 3D text. If either fails
// to load, the ship falls back to three.js's own bloom and to canvas-drawn labels.
await Promise.all([
  Promise.all([import('postprocessing'), import('n8ao')]).then(([PP, AO]) => { window.THREE.PP = PP; window.THREE.N8AOPostPass = AO.N8AOPostPass; }),
  import('troika-three-text').then((TT) => { window.THREE.TroikaText = TT.Text; }),
].map((p) => p.catch((e) => console.warn('Optional library unavailable', e))));
for (const f of FILES) {
  await new Promise((ok, bad) => { const s = document.createElement('script'); s.src = 'js/' + f + '.js'; s.onload = ok; s.onerror = bad; document.body.appendChild(s); }).catch(() => fail());
  if (window.DEFIANCE_FAILED) break;
}
</script>

</body>
</html>

````

---

## `js/core.js`

````javascript
// USS Defiance · core.js
// Constants, renderer, shared helpers and ship state. Loads first; everything else builds on it.
// Files share one global scope and load in order (see index.html).
'use strict';

const $ = (id) => document.getElementById(id);
if (typeof THREE === 'undefined') { window.DEFIANCE_FAILED = true; $('nogl').hidden = false; $('intro').hidden = true; throw new Error('three.js failed to load'); }
// Keep the r128 colour behaviour (hex colours used as-is) until Stage 1 moves the ship to a fully colour-managed pipeline.
THREE.ColorManagement.enabled = false;

const D2R = Math.PI / 180;
const WALL_H = 3.3, DAIS = { x: 0, z: 0.4, r: 2.0, h: 0.22 }, PR = 0.3, EYE = 1.62, FWD_Z = -6.0, AFT_Z = 6.2;
// Faceted room plan (x, z), forward is -z. Every wall sits 0.8 m further out than the first build, for wider walkways;
// the dais, flight and ops pods and the situation table stay where they were.
const ROOM = [[-3.55, -6.0], [3.55, -6.0], [6.4, -2.913], [6.4, 2.856], [4.012, 6.2], [-4.012, 6.2], [-6.4, 2.856], [-6.4, -2.913]];
const SIDE_X = 6.4; // the side walls, where the console runs stand
// Ceiling height in the rooms off the bridge (the bridge itself is WALL_H)
const ROOM_H = 3.1;
const isTouch = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// a tall condensed face suits block screens; falls back to narrow system faces
const DISP = "Antonio, 'Arial Narrow', 'Roboto Condensed', Oxanium, sans-serif";
const MONO = "'JetBrains Mono', Menlo, monospace";

// ---------- renderer ----------
const canvas = $('view');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) { window.DEFIANCE_FAILED = true; $('nogl').hidden = false; $('intro').hidden = true; throw e; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
// No shadow maps: shadows are baked (bake.js). The fallback light rig turns them back on.
renderer.shadowMap.enabled = false; renderer.shadowMap.type = THREE.PCFShadowMap;
const isMobile = isTouch || Math.min(window.innerWidth, window.innerHeight) < 600;
// Picture quality (roadmap F5): 'phone', 'desktop' or 'cinematic', chosen in the performance panel (P, perf.js) and
// remembered in this browser. Read this early because Deck 2's exterior model is built to it (deck2.js extOpts).
const QUALITY = (() => {
  let t = window.DEFIANCE_QUALITY; try { t = t || (JSON.parse(localStorage.getItem('defiance-perf')) || {}).quality; } catch (e) { /* storage may be unavailable */ }
  return { tier: ['phone', 'desktop', 'cinematic'].includes(t) ? t : (isMobile ? 'phone' : 'desktop') };
})();
const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030305);
// a faint haze: distant parts of the room soften slightly, and the light shafts (render.js) have something to show in
const FOG = new THREE.FogExp2(0x221d18, 0.03);
scene.fog = FOG;
const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 900);
camera.rotation.order = 'YXZ';

// ---------- helpers ----------
// a small marker block: a rounded square (the interface has no outlines or hexagons)
function hexNode(g, cx, cy, rad) { const s = rad * 0.86, r = rad * 0.3; g.beginPath(); g.moveTo(cx - s + r, cy - s); g.arcTo(cx + s, cy - s, cx + s, cy + s, r); g.arcTo(cx + s, cy + s, cx - s, cy + s, r); g.arcTo(cx - s, cy + s, cx - s, cy - s, r); g.arcTo(cx - s, cy - s, cx + s, cy - s, r); g.closePath(); }
function cnv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(c, srgb) { const t = new THREE.CanvasTexture(c); if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t; }
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function smooth(a, b, v) { const x = clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
function add(o, parent) { (parent || scene).add(o); return o; }
function mesh(geo, mat, x, y, z, parent) { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return add(m, parent); }
function group(x, y, z, rotY, parent) { const g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); g.rotation.y = rotY || 0; return add(g, parent); }
const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const CYL = (a, b, h, s) => new THREE.CylinderGeometry(a, b, h, s || 20);
const _rb = new Map();
function RBOX(w, h, d, r) {
  r = Math.min(r === undefined ? 0.03 : r, w / 2 - 0.003, h / 2 - 0.003, d / 2 - 0.003);
  const key = w.toFixed(3) + ',' + h.toFixed(3) + ',' + d.toFixed(3) + ',' + r.toFixed(3);
  if (_rb.has(key)) return _rb.get(key);
  let geo;
  if (r < 0.006) geo = new THREE.BoxGeometry(w, h, d);
  else {
    const sw = w - 2 * r, sh = h - 2 * r, x0 = -sw / 2, y0 = -sh / 2, rc = Math.max(0.0005, Math.min(r, sw / 2, sh / 2) * 0.95);
    const s = new THREE.Shape();
    s.moveTo(x0 + rc, y0); s.lineTo(x0 + sw - rc, y0); s.quadraticCurveTo(x0 + sw, y0, x0 + sw, y0 + rc);
    s.lineTo(x0 + sw, y0 + sh - rc); s.quadraticCurveTo(x0 + sw, y0 + sh, x0 + sw - rc, y0 + sh);
    s.lineTo(x0 + rc, y0 + sh); s.quadraticCurveTo(x0, y0 + sh, x0, y0 + sh - rc);
    s.lineTo(x0, y0 + rc); s.quadraticCurveTo(x0, y0, x0 + rc, y0);
    geo = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 2, curveSegments: 3 });
    geo.translate(0, 0, -(d - 2 * r) / 2);
  }
  _rb.set(key, geo); return geo;
}
// ---------- block shapes for the interface (screens, signs, labels) ----------
// a block with rounded (half-height) ends on the chosen sides: the basic pill of the interface
function hexTab(g, x, y, w, h, l, r) {
  const R = Math.min(h / 2, w / 2); g.beginPath();
  g.moveTo(x + (l ? R : 0), y); g.lineTo(x + w - (r ? R : 0), y);
  if (r) g.arc(x + w - R, y + h / 2, R, -Math.PI / 2, Math.PI / 2); else g.lineTo(x + w, y + h);
  g.lineTo(x + (l ? R : 0), y + h);
  if (l) g.arc(x + R, y + h / 2, R, Math.PI / 2, Math.PI * 1.5); else g.lineTo(x, y);
  g.closePath();
}
function rrect(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
// an elbow: a vertical column block that turns into a horizontal bar, with a rounded outer corner and a scooped inner one
function elbow(g, x, y, colW, barH, len, ext, up, color) {
  const R = Math.min(colW * 0.95, ext + barH), r = Math.min(barH * 0.9, colW * 0.5);
  g.beginPath();
  if (up) {
    g.moveTo(x, y + barH + ext); g.lineTo(x, y + R); g.arcTo(x, y, x + R, y, R); g.lineTo(x + len, y); g.lineTo(x + len, y + barH);
    g.lineTo(x + colW + r, y + barH); g.arcTo(x + colW, y + barH, x + colW, y + barH + r, r); g.lineTo(x + colW, y + barH + ext);
  } else {
    g.moveTo(x, y - barH - ext); g.lineTo(x, y - R); g.arcTo(x, y, x + R, y, R); g.lineTo(x + len, y); g.lineTo(x + len, y - barH);
    g.lineTo(x + colW + r, y - barH); g.arcTo(x + colW, y - barH, x + colW, y - barH - r, r); g.lineTo(x + colW, y - barH - ext);
  }
  g.closePath(); g.fillStyle = color; g.fill();
}
function space(o) { o.layers.set(1); return o; }
function shapeXZ(pts, flip) { const s = new THREE.Shape(); pts.forEach(([x, z], i) => { const y = flip ? -z : z; i ? s.lineTo(x, y) : s.moveTo(x, y); }); s.closePath(); return s; }
function pathXZ(pts, flip) { const s = new THREE.Path(); pts.forEach(([x, z], i) => { const y = flip ? -z : z; i ? s.lineTo(x, y) : s.moveTo(x, y); }); s.closePath(); return s; }
function insetPoly(P, d) {
  const n = P.length, cx = P.reduce((a, p) => a + p[0], 0) / n, cz = P.reduce((a, p) => a + p[1], 0) / n;
  const L = P.map((A, i) => {
    const B = P[(i + 1) % n]; let dx = B[0] - A[0], dz = B[1] - A[1]; const len = Math.hypot(dx, dz); dx /= len; dz /= len;
    let nx = -dz, nz = dx; if ((cx - A[0]) * nx + (cz - A[1]) * nz < 0) { nx = -nx; nz = -nz; }
    return { px: A[0] + nx * d, pz: A[1] + nz * d, dx, dz };
  });
  return L.map((l, i) => { const m = L[(i - 1 + n) % n]; const den = m.dx * l.dz - m.dz * l.dx; const t = ((l.px - m.px) * l.dz - (l.pz - m.pz) * l.dx) / den; return [m.px + m.dx * t, m.pz + m.dz * t]; });
}
// wall edges with inward normals
const CX = 0, CZ = 0.1;
const EDGES = ROOM.map((A, i) => {
  const B = ROOM[(i + 1) % ROOM.length]; const dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz);
  let nx = -dz / len, nz = dx / len; if ((CX - A[0]) * nx + (CZ - A[1]) * nz < 0) { nx = -nx; nz = -nz; }
  return { A, B, len, nx, nz, mx: (A[0] + B[0]) / 2, mz: (A[1] + B[1]) / 2, rot: Math.atan2(nx, nz), tx: dx / len, tz: dz / len };
});
// point along edge i at t (0..1), pushed inward by d
function onEdge(i, t, d) { const e = EDGES[i]; return [e.A[0] + (e.B[0] - e.A[0]) * t + e.nx * d, e.A[1] + (e.B[1] - e.A[1]) * t + e.nz * d]; }
// walk-through doorways: edge index -> door position along the edge
const DOOR_GAPS = { 3: 0.38, 4: 0.174, 5: 0.4 };
// the Lift 1 car opens off the aft wall too (lift.js builds the car behind it)
const LIFT_GAP = { edge: 4, t: 0.826 };
const WALL_SEGS = [], extraObs = [], OCCLUDERS = [];
function addSeg(ax, az, bx, bz, r) { WALL_SEGS.push([ax, az, bx, bz, r === undefined ? PR : r]); }
function wallPiece(mat, A, dir, nrm, s0, s1, y0, y1, H, uScale, parent) {
  const w = s1 - s0, h = y1 - y0; if (w <= 0.001 || h <= 0.001) return null;
  const geo = new THREE.PlaneGeometry(w, h), pos = geo.attributes.position, uv = geo.attributes.uv;
  const rot = Math.atan2(nrm[0], nrm[1]);
  const sgn = (Math.cos(rot) * dir[0] - Math.sin(rot) * dir[1]) >= 0 ? 1 : -1;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (s0 + w / 2 + pos.getX(i) * sgn) / uScale, (y0 + h / 2 + pos.getY(i)) / H);
  const m = mesh(geo, mat, A[0] + dir[0] * (s0 + w / 2), y0 + h / 2, A[1] + dir[1] * (s0 + w / 2), parent);
  m.rotation.y = rot; OCCLUDERS.push(m); return m;
}

// ---------- state ----------
const SYSTEMS = [
  { star: 'Corvan', planet: 'Kessra IV', type: 'ocean', cls: 'Temperate ocean world', atm: 'Nitrogen-oxygen, 1.1 atm', life: 'Abundant, non-sentient', dist: '1.9 million km', heading: '031 mark 12', planets: 4, featured: 3, starColor: 0xffe2a8, halo: '120,190,255', seed: 11 },
  { star: 'Iralis', planet: 'Iralis b', type: 'gas', cls: 'Banded gas giant', atm: 'Hydrogen-helium', life: 'None detected', dist: '6.4 million km', heading: '214 mark 08', planets: 6, featured: 1, starColor: 0xfff4e0, halo: '255,200,140', seed: 23 },
  { star: 'Thessaly Drift', planet: 'Mira Vey', type: 'ice', cls: 'Ice-shelled moon', atm: 'Thin nitrogen, 0.02 atm', life: 'Microbial, under the ice', dist: '880,000 km', heading: '147 mark 30', planets: 3, featured: 2, starColor: 0xcfe0ff, halo: '190,225,255', seed: 37 },
  { star: 'Okonkwo-9', planet: 'Ashfall', type: 'lava', cls: 'Young volcanic world', atm: 'Sulfur dioxide, 4 atm', life: 'None detected', dist: '2.7 million km', heading: '302 mark 04', planets: 5, featured: 0, starColor: 0xffc890, halo: '255,140,90', seed: 41 },
];
// Ship standards: the sizes every deck is built to (kit.js and the deck builders read these; see claude/roadmap.md F1).
// The bridge (3.3 m) and its rooms (3.1 m) are named exceptions to the room height.
const STD = {
  deck: 3.5,                      // deck spacing: Deck n's floor is 3.5 (n - 1) m below the bridge's
  corridor: { w: 2.2, h: 2.6 },   // clear width and ceiling of a corridor
  room: { h: 2.75 },              // standard room ceiling
  door: { w: 1.2, h: 2.3 },       // clear opening of a standard door
  frame: 2.4,                     // structural frame spacing along a corridor
  inset: 0.06,                    // walls stand this far inside a room's outline (back-to-back walls never share a plane)
  mount: 0.08,                    // anything on a wall sits at least this far inside the outline
  gap: 0.10,                      // the least gap between two partition walls
};
// each deck is 3.5 m below the one above; the lift car really travels between them
function deckY(n) { return -(n - 1) * STD.deck; }
const SPEEDS = {
  stop: { speed: 0, len: 0, name: 'All stop', screen: 'ALL STOP' },
  impulse: { speed: 12, len: 0.6, name: 'Impulse, one quarter', screen: 'IMPULSE ¼' },
  warp: { speed: 420, len: 48, name: 'Warp 6', screen: 'WARP 6' },
};
// Alerts: at Yellow the peach frames pulse toward butterscotch; at Red they turn red, the lilac dims and the room
// lights drop and redden. strip = deck edge strips, slot = cove lights, light = tint of the baked room light.
const ALERTS = {
  green: { label: 'Condition Green', short: 'GREEN', acc: '#E8A06A', rgb: '232, 160, 106', line: '#2B2229', strip: 0xffe2c4, slot: 0xfff0dc, light: 0xffe6cc },
  yellow: { label: 'Yellow Alert', short: 'YELLOW', acc: '#F2C88F', rgb: '242, 200, 143', line: '#2B2229', strip: 0xf2c88f, slot: 0xffe08a, light: 0xffe8b8 },
  red: { label: 'Red Alert', short: 'RED', acc: '#E0524A', rgb: '224, 82, 74', line: '#2B2229', strip: 0xe04848, slot: 0xff3020, light: 0xff6a58 },
};
const LIGHT_LEVELS = { dim: 0.55, standard: 1, bright: 1.35 };
const state = {
  speed: 'stop', alert: 'green', light: 'standard', cur: 0, dest: 1, holo: 0, holoOn: true, view: 'forward', logIdx: 0, reports: 4, slide: 0, shutters: 'auto', cup: null,
  scanning: false, scanned: false, scanT: 0, sitting: false, open: null, bayDoors: false,
  comms: [
    { at: 0, who: 'Meridian Station', text: 'Defiance, you are cleared to begin your survey.' },
    { at: 0, who: 'Convoy Lead', text: 'Freighters are formed up behind you. Thanks for the escort.' },
  ],
};
const cur = { speed: 0, len: 0 };
let elapsed = 0;
const sysCur = () => SYSTEMS[state.cur];
const sysDest = () => SYSTEMS[state.dest];
// Display palette (palette A): peach frames and bars, tan and butterscotch readouts, lilac as the second colour,
// rose and plum as small accents, cream for values. ok / warn / bad are status colours and mean status only.
const COLORS = { bg: '#000000', frame: '#2B2229', peach: '#E8A06A', peachHot: '#FFC48C', tan: '#D9B07E', butter: '#F2C88F', lilac: '#B693C4', lilacDim: '#6E5A78', rose: '#C67A86', plum: '#7E5C8E', cream: '#F5E6CF',
  amber: '#E8A06A', amberDim: '#9C6A48', amberHot: '#FFC48C', ice: '#B693C4', iceDim: '#6E5A78', white: '#F5E6CF', dim: '#9A8678', ok: '#8DBF84', warn: '#F0B44C', bad: '#E05A50', red: '#E0524A' };
function mixHex(a, b, t) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
const pal = () => {
  const C = COLORS, a = state.alert, red = a === 'red';
  const acc = red ? C.red : a === 'yellow' ? mixHex(C.peach, C.butter, 0.5 + 0.5 * Math.sin(elapsed * 4)) : C.peach;
  const ice = red ? C.lilacDim : C.lilac, tan = red ? '#B8665C' : C.tan, butter = red ? '#E9907A' : C.butter;
  return { acc, accDim: red ? '#7A2A2A' : C.amberDim, ice, sand: tan, tan, butter, rose: red ? '#A8443E' : C.rose, plum: red ? '#5A2C34' : C.plum, green: C.ok, yel: C.warn, red: C.bad, sec: ice, rust: C.bad, line: C.frame, bg: C.bg, dim: C.dim, txt: C.cream, key: a };
};

````

---

## `js/decks.js`

````javascript
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
//   light()       optional: the deck works out its own light (bake.js bakeComputed) instead of a Blender bake
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
deckDef(3, { built: true, envAt: [-2.6, 1.6, 4.2], root: () => DECK3, segs: () => D3.segs, obs: () => D3.obs, rooms: () => D3.rooms, door: () => D3.door, light: () => d3Light(), build: () => buildDeck3() });
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

````

---

## `js/shipgeo.js`

````javascript
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
  // are its half-thickness above and below at the centre; pn shapes the plan, n the cross-section. The top half has its own
  // shape (top): a broad, nearly flat back so Deck 3 has full headroom out to about 30 m from the centre (Nov 27): half-
  // thickness up, cross-section exponent n, and along the length (1 - q^qa)^ge (q = 0 at the centre, 1 at the bow or the
  // aft edge). Its centre stays below Deck 2's floor (depth 7.0), so the spine still sits on it.
  saucer: { mc: 58, L: 58, W: 50, up: 6.9, dn: 7.0, pn: 2.3, n: 2.25, dc: 15, top: { up: 7.45, n: 3.5, qa: 6, ge: 0.8 } },
  // the engineering body: half-beam, top depth and bottom depth along the ship (smooth curves); n shapes its section
  eng: { w: [[90, 0], [94, 6.8], [102, 10.6], [128, 13], [170, 12.2], [194, 9.9], [200, 8.4]], t: [[90, 15], [95, 10.2], [100, 7.6], [104, 6.8], [150, 6.8], [200, 15.5]],
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
    [[30.2, 39, 'Officers’ quarters', 'p', 'l', '', 'Junior officers’ cabins (singles about 4 x 5 m, a few doubles about 5.5 x 5.5 m) round the ring and along the spokes.'], [41.4, 56.8, 'Forward shield generator', 'p', 's', '', 'Twin generator bays either side of the forward spoke; feeds the forward shield arc.'], [59.2, 66.2, 'Sickbay', 'p', 'l', 'p', 'Eight beds, surgery and an isolation ward, under the captain’s quarters; its doors open off the Lift 1 lobby so casualties reach it fast.'], [66.3, 70.2, 'Lift 1 lobby', 'p', 'w', 'p', 'Where Lift 1 opens, on the aft spoke, between sickbay and the medical lab.'], [70.2, 72.5, 'Lift 1', 'p', 's', 'p', ''], [59.2, 74.6, 'Medical lab and morgue', 'p', 'l', 's', 'Across the lift lobby from sickbay: the lab, medical stores and the morgue.'], [77, 90.5, 'Officers’ quarters', 'p', 'l', '', ''], [100.2, 110, 'Officers’ quarters', 'p', 'l', '', ''], [110.1, 124, 'Computer core, upper', 'p', 's', '', ''], [124.1, 129, 'Damage control station', 'p', 's', 'p', 'Repair crews’ lockers and the deck’s damage control panel, opposite Lift 2.'], [124.6, 128.4, 'Lift 2', 'p', 's', 's', 'Aft lift. Runs Decks 3 to 10.'], [129.1, 140, 'Pod feeds and torpedo magazine', 'p', 'x', '', 'Torpedoes and power ride up the rollbar to the weapons pod from here.'], [140.1, 150, 'Crew quarters', 'p', 'l', '', '']],
    [[10, 34, 'Auxiliary control', 'p', 'w', '', 'Back-up bridge in the saucer’s forward edge.'], [34, 52, 'Crew quarters', 'p', 'l', '', ''], [52, 70.2, 'Mess hall and galley', 'p', 'l', '', 'The one room everyone on the ship passes through every day.'], [70.2, 72.5, 'Lift 1', 'p', 's', '', ''], [72.5, 86, 'Crew lounge and gym', 'p', 'l', '', ''], [86, 92, 'Docking port, port', 'p', 's', 'p', 'Airlock and docking ring in the saucer rim, with a guide-light array round it.'], [86, 92, 'Docking port, starboard', 'p', 's', 's', 'The starboard twin of the port docking ring, joined to it by a cross corridor.'], [92, 106, 'Training simulators', 'p', 'l', '', 'Combat and flight simulator bays for drills.'], [106, 124, 'Computer core', 'p', 's', '', 'Main computer core, two decks tall.'], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 152, 'Main shield generators', 'p', 's', '', 'Port, starboard and aft arcs.'], [152, 176, 'Life support, air and water', 'p', 's', '', 'Environmental plant and water reclamation.']],
    [[6, 22, 'Torpedo bays 1 and 2', 'p', 'x', '', 'Twin launchers in the saucer’s forward edge.'], [22, 34, 'Torpedo magazine', 'p', 'x', '', '24 torpedoes for the forward bays; the weapons pod carries its own.'], [34, 48, 'Armory and security', 'p', 'x', '', 'Next to the transporters, for boarding and away teams.'], [48, 62, 'Transporter rooms 1 and 2', 'p', 's', '', ''], [62, 70.2, 'Science labs', 'p', 'l', '', ''], [70.2, 72.5, 'Lift 1', 'p', 's', '', ''], [72.5, 96, 'Crew quarters', 'p', 'l', '', ''], [96, 106, 'Cargo bay and cargo transporter', 'p', 's', '', 'The main cargo hold (moved up from Deck 6 when the fighter hangar took its space), with the cargo transporter.'], [106, 124, 'Computer core', 'p', 's', '', 'Lower half of the core.'], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 138, 'Engineering offices', 'p', 'e', '', ''], [138, 156, 'Main engineering, upper gallery', 'p', 'e', '', 'Catwalk ring around the top of the warp core.'], [156, 186, 'Nacelle coil workshop', 'p', 'e', '', ''], [186, 197, 'Impulse engines', 'p', 'e', '', 'Twin impulse engines at the stern.']],
    [[12, 28, 'Lower sensor array', 'p', 's', '', 'Under the saucer’s forward edge.'], [28, 48, 'Torpedo loading', 'p', 'x', '', 'Feeds the magazine above.'], [48, 70.2, 'Fighter hangar', 'p', 'x', '', 'Four tactical fighters on launch cradles. They drop clear through doors in the saucer’s belly.'], [70.2, 72.5, 'Lift 1', 'p', 's', '', 'Forward lift. Lowest stop.'], [72.5, 90, 'Crew quarters', 'p', 'l', '', ''], [90, 104, 'Hydroponics and stores', 'p', 'l', '', ''], [104, 124, 'Escape pods and EVA prep', 'p', 's', '', ''], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 166, 'Main engineering', 'p', 'e', '', 'Control room and the top of the warp core.'], [166, 199, 'Auxiliary power', 'p', 'e', '', 'Fusion generators for when the core is down.']],
    [[102, 112, 'Navigational deflector', 'p', 's', '', 'The dish on the engineering hull’s nose, under the saucer.'], [112, 124, 'Combat information center', 'p', 'x', '', 'Deep in the engineering hull: the room that tracks every contact, with a big plot table and weapons and sensor operators. Lift 2 is next door.'], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 166, 'Main engineering and warp core', 'p', 'e', '', 'The ship’s power plant.'], [166, 199, 'Shuttlebay, gallery level', 'p', 's', '', 'The upper half of the two-deck bay: the flight control booth and a catwalk round the walls.']],
    [[106, 124, 'Ventral beam array and capacitors', 'p', 'x', '', 'The ship’s lower beam weapon and its power banks.'], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 140, 'Matter injection', 'p', 'e', '', ''], [140, 152, 'Warp core', 'p', 'e', '', ''], [152, 166, 'Nacelle field control', 'p', 'e', '', 'Port and starboard warp field coils are run from here.'], [166, 199, 'Shuttlebay', 'p', 's', '', 'Two decks tall: a runabout and two utility shuttles on the Deck 8 floor. Clamshell doors in the stern, opened from the Flight panel.']],
    [[112, 124, 'Brig and security cells', 'p', 'x', '', ''], [124, 129, 'Lift 2', 'p', 's', '', ''], [129, 140, 'Deuterium tanks', 'p', 'e', '', ''], [140, 152, 'Warp core', 'p', 'e', '', ''], [152, 174, 'Engineering workshops and spares', 'p', 'e', '', ''], [174, 192, 'Shuttle maintenance', 'p', 's', '', 'Under the shuttlebay, with a cargo lift up to its floor.']],
    [[118, 124, 'Docking collar and fuel transfer', 'p', 's', '', 'The ventral docking collar under the keel, beside Lift 2. Supply ships dock here to pass fuel and stores.'], [124, 129, 'Lift 2', 'p', 's', '', 'Lowest stop.'], [129, 140, 'Tractor beam and keel sensors', 'p', 's', '', ''], [140, 152, 'Warp core base', 'p', 'e', '', 'Where the antimatter feed enters the core.'], [152, 182, 'Antimatter storage pods', 'p', 'e', '', 'Magnetic containment pods, with the ejection system beneath.']]
  ],
  // Floor plans, top down (roadmap B1): plans[n] for each deck drawn so far. Positions are [m, x]: m from the bow as above,
  // x across the beam, starboard positive (the 3D x). Saucer decks are rings and spokes round c; angles in degrees about c,
  // 0 aft, 90 starboard, 180 forward, 270 port. Headroom: a room needs the hull's top skin (or the spine) at least
  // room + clear metres above the floor (corridors: corr + clear), so its ceiling, ducts and plating fit (room and corr
  // match STD in js/core.js). w = corridor clear width.
  // Corridors: ring [radius, width] (centreline radius); spokes [angle, outer end radius]: each runs from the centre out.
  // Spaces: { n name, k kind (as rooms above), t type ('c' corridor-like, 'lift', 'v' void), s shape, d door [m, x], b berths }
  //   shapes: { box: [m0, m1, x0, x1] }; { arc: [r0, r1, b0, b1] } a band between radii r0 and r1, bounded by b0 and b1,
  //   each a radial line (an angle) or a line beside a spoke ([spoke angle, offset], offset positive toward larger angles);
  //   { poly: [points] }, a point being [m, x] or { r, a: [from, to] } (an arc about c). Rows of cabins:
  //   { ring: [r0, r1, quadrant angle, offset from the spokes, [widths]] } along a ring's outer wall (doors onto the ring);
  //   { spoke: [angle, offset0, offset1, [radii]] } along a spoke (doors onto the spoke); b: berths per cabin.
  plans: {
    3: { c: [58, 0], room: 2.75, corr: 2.6, clear: 0.35, w: 2.2, ring: [18, 2.2], spokes: [[0, 92.2], [90, 24.0], [180, 28.4], [270, 24.0]],
      spaces: [
        { n: 'Lift 1 lobby', k: 'w', t: 'c', s: { box: [66.3, 70.2, -4.7, -1.1] } },
        { n: 'Lift 1', k: 's', t: 'lift', s: { box: [70.2, 72.5, -4.7, -1.2] }, d: [70.2, -2.6] },
        { n: 'Lift 1 machinery', k: 's', t: 'v', s: { poly: [[72.6, -1.2], [72.6, -4.7], [74.13, -4.7], { r: 16.8, a: [343.7, 355.9] }] } },
        { n: 'Sickbay', k: 'l', s: { poly: [[59.2, -1.2], [66.2, -1.2], [66.2, -4.8], [74.1, -4.8], { r: 16.8, a: [343.4, 274.1] }] }, d: [66.2, -2.9] },
        { n: 'Medical lab and morgue', k: 'l', s: { arc: [0, 16.8, [0, 1.2], [90, -1.2]] }, d: [68.2, 1.2] },
        { n: 'Forward shield generator', k: 's', s: { arc: [0, 16.8, [90, 1.2], [180, -1.2]] }, d: [56.8, 8] },
        { n: 'Forward shield generator', k: 's', s: { arc: [0, 16.8, [180, 1.2], [270, -1.2]] }, d: [56.8, -8] },
        { n: 'Officers’ quarters', k: 'l', s: { ring: [19.2, 24.2, 0, 6.3, [1, 1, 1, 1.4]] }, b: [1, 1, 1, 2] },
        { n: 'Officers’ quarters', k: 'l', s: { ring: [19.2, 24.2, 90, 6.3, [1, 1, 1, 1.4]] }, b: [1, 1, 1, 2] },
        { n: 'Officers’ quarters', k: 'l', s: { ring: [19.2, 24.2, 180, 6.3, [1, 1, 1, 1.4]] }, b: [1, 1, 1, 2] },
        { n: 'Officers’ quarters', k: 'l', s: { ring: [19.2, 24.2, 270, 6.3, [1, 1, 1, 1.4]] }, b: [1, 1, 1, 2] },
        { n: 'Officers’ quarters', k: 'l', s: { spoke: [0, 1.2, 6.2, [19.2, 23.6, 28, 32.6]] }, b: [1, 1, 2] },
        { n: 'Officers’ quarters', k: 'l', s: { spoke: [0, -1.2, -6.2, [19.2, 23.6, 28, 32.6]] }, b: [1, 1, 2] },
        { n: 'Officers’ quarters', k: 'l', s: { spoke: [90, 1.2, 6.2, [19.2, 23.6]] }, b: [1] },
        { n: 'Officers’ quarters', k: 'l', s: { spoke: [90, -1.2, -6.2, [19.2, 23.6]] }, b: [1] },
        { n: 'Officers’ quarters', k: 'l', s: { spoke: [180, 1.2, 6.2, [19.2, 23.6, 28]] }, b: [1, 1] },
        { n: 'Officers’ quarters', k: 'l', s: { spoke: [180, -1.2, -6.2, [19.2, 23.6, 28]] }, b: [1, 1] },
        { n: 'Officers’ quarters', k: 'l', s: { spoke: [270, 1.2, 6.2, [19.2, 23.6]] }, b: [1] },
        { n: 'Officers’ quarters', k: 'l', s: { spoke: [270, -1.2, -6.2, [19.2, 23.6]] }, b: [1] },
        // aft of the saucer the aft spoke carries on as the fore-aft corridor, with rooms either side
        { n: 'Officers’ quarters', k: 'l', s: { box: [100.2, 105, 1.2, 5.4] }, d: [102.6, 1.2], b: 1 },
        { n: 'Officers’ quarters', k: 'l', s: { box: [105.1, 110, 1.2, 5.4] }, d: [107.5, 1.2], b: 1 },
        { n: 'Officers’ quarters', k: 'l', s: { box: [100.2, 105, -5.4, -1.2] }, d: [102.6, -1.2], b: 1 },
        { n: 'Officers’ quarters', k: 'l', s: { box: [105.1, 110, -5.4, -1.2] }, d: [107.5, -1.2], b: 1 },
        { n: 'Computer core, upper', k: 's', s: { box: [110.1, 124, 1.2, 5.4] }, d: [117, 1.2] },
        { n: 'Computer core, upper', k: 's', s: { box: [110.1, 124, -5.4, -1.2] }, d: [117, -1.2] },
        { n: 'Lift 2', k: 's', t: 'lift', s: { box: [124.6, 128.4, 1.2, 4.0] }, d: [126.5, 1.2] },
        { n: 'Damage control station', k: 's', s: { box: [124.1, 129, -5.4, -1.2] }, d: [126.5, -1.2] },
        { n: 'Pod feeds and torpedo magazine', k: 'x', s: { box: [129.1, 140, 1.2, 5.4] }, d: [134.5, 1.2] },
        { n: 'Pod feeds and torpedo magazine', k: 'x', s: { box: [129.1, 140, -5.4, -1.2] }, d: [134.5, -1.2] },
        { n: 'Crew quarters', k: 'l', s: { box: [140.1, 145, 1.2, 5.4] }, d: [142.5, 1.2], b: 2 },
        { n: 'Crew quarters', k: 'l', s: { box: [145.1, 150, 1.2, 5.4] }, d: [147.5, 1.2], b: 2 },
        { n: 'Crew quarters', k: 'l', s: { box: [140.1, 145, -5.4, -1.2] }, d: [142.5, -1.2], b: 2 },
        { n: 'Crew quarters', k: 'l', s: { box: [145.1, 150, -5.4, -1.2] }, d: [147.5, -1.2], b: 2 },
      ] },
  },
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
  const G = SHIPGEO, S = G.saucer, U = S.top, E = G.eng, q = Math.min(1, Math.abs(m - S.mc) / S.L), f = Math.pow(Math.max(0, 1 - Math.pow(q, S.pn)), 1 / S.pn), gq = Math.pow(Math.max(0, 1 - q * q), 0.45);
  const gu = Math.pow(Math.max(0, 1 - Math.pow(q, U.qa)), U.ge), sa = [S.W * f, U.up * gu + 0.4 * f, S.dn * gq + 0.4 * f], ew = Math.max(0, shipAt(E.w, m)), eb = [ew, ew > 0.01 ? Math.max(0.01, S.dc - shipAt(E.t, m)) : 0, ew > 0.01 ? Math.max(0.01, shipAt(E.b, m) - S.dc) : 0];
  const se = (a, h, n, c, s) => (a < 1e-4 || h < 1e-4) ? 0 : 1 / Math.pow(Math.pow(Math.abs(c) / a, n) + Math.pow(Math.abs(s) / h, n), 1 / n);
  const r = (an) => { const c = Math.cos(an), s = Math.sin(an), k = s < 0 ? 1 : 2; return Math.pow(Math.pow(se(sa[0], sa[k], k === 1 ? U.n : S.n, c, s), 10) + Math.pow(se(eb[0], eb[k], E.n, c, s), 10), 0.1); };
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
// the depth of the outer skin's top at m, x metres across: the hull's top, or the spine's where it covers the hull
function shipSkinTop(m, x) {
  const H = shipHull(m), ax = Math.abs(x); let t = ax < H.w ? shipTopAt(m, ax) : 99;
  if (m > 49 && m < 102.5) { const f = shipSpineField(m), d0 = Math.min(t, 12) - 0.02;
    if (f(ax, d0) < 1) { let lo = -3, hi = d0; for (let k = 0; k < 22; k++) { const md = (lo + hi) / 2; if (f(ax, md) < 1) hi = md; else lo = md; } t = Math.min(t, hi); } }
  return t;
}
// Deck n's floor plan (SHIPGEO.plans[n]) worked out: every space as a polygon [[m, x], ...] with its door, the corridors
// (ring, straight runs), and the deck's outlines as half-widths along the ship: floor (where the hull reaches the deck's
// floor) and fit (where a room has full headroom). Worked out on first use (the page, the checks and the deck's builder).
const SHIPPLAN = {};
function shipFloorPlan(n) {
  if (SHIPPLAN[n]) return SHIPPLAN[n];
  const P = SHIPGEO.plans[n]; if (!P) return null;
  const [cm, cx] = P.c, rad = Math.PI / 180, floorD = 3.5 * n, out = [], cab = { n: 0 };
  const pt = (r, a) => [cm + r * Math.cos(a * rad), cx + r * Math.sin(a * rad)];
  const bA = (b, r) => Array.isArray(b) ? b[0] + Math.asin(Math.max(-1, Math.min(1, b[1] / r))) / rad : b;
  const bLine = (b) => { const a = Array.isArray(b) ? b[0] : b, o = Array.isArray(b) ? b[1] : 0; return [Math.cos((a + 90) * rad), Math.sin((a + 90) * rad), o]; };
  const arcPts = (r, a0, a1) => { const k = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 3)), o = []; for (let i = 0; i <= k; i++) o.push(pt(r, a0 + (a1 - a0) * i / k)); return o; };
  const arcShape = ([r0, r1, b0, b1]) => {
    let p = arcPts(r1, bA(b0, r1), bA(b1, r1));
    if (r0 > 0.5) p = p.concat(arcPts(r0, bA(b1, r0), bA(b0, r0)));
    else { const [a1, c1, o1] = bLine(b0), [a2, c2, o2] = bLine(b1), det = a1 * c2 - a2 * c1; p.push([cm + (o1 * c2 - o2 * c1) / det, cx + (a1 * o2 - a2 * o1) / det]); }
    return p;
  };
  const shape = (s) => s.box ? [[s.box[0], s.box[2]], [s.box[1], s.box[2]], [s.box[1], s.box[3]], [s.box[0], s.box[3]]]
    : s.arc ? arcShape(s.arc) : s.poly.flatMap((q) => Array.isArray(q) ? [q] : arcPts(q.r, q.a[0], q.a[1]));
  const add = (sp, poly, door, b) => out.push({ n: sp.n, k: sp.k, t: sp.t || '', poly, door: door || null, b: b || 0, id: sp.t ? '' : n + '-' + String(++cab.n).padStart(2, '0') });
  for (const sp of P.spaces) {
    const s = sp.s;
    if (s.ring) { const [r0, r1, q, o, ws] = s.ring, rm = (r0 + r1) / 2, A0 = bA([q, o], rm), A1 = bA([q + 90, -o], rm), tot = ws.reduce((x, y) => x + y, 0);
      let c = 0; ws.forEach((w, i) => { const a0 = A0 + (A1 - A0) * c / tot; c += w; const a1 = A0 + (A1 - A0) * c / tot;
        const b0 = i ? a0 + 0.15 : [q, o], b1 = i < ws.length - 1 ? a1 - 0.15 : [q + 90, -o];
        add(sp, arcShape([r0, r1, b0, b1]), pt(r0, (bA(b0, r0) + bA(b1, r0)) / 2), (sp.b || [])[i]); });
    } else if (s.spoke) { const [a, o0, o1, rs] = s.spoke, lo = o0 < 0 ? [a, o1] : [a, o0], hi = o0 < 0 ? [a, o0] : [a, o1];
      for (let i = 0; i < rs.length - 1; i++) { const r0 = rs[i] + (i ? 0.05 : 0), r1 = rs[i + 1] - (i < rs.length - 2 ? 0.05 : 0), rm = (r0 + r1) / 2, along = Math.sqrt(rm * rm - o0 * o0);
        const u = [Math.cos(a * rad), Math.sin(a * rad)], v = [Math.cos((a + 90) * rad), Math.sin((a + 90) * rad)];
        add(sp, arcShape([r0, r1, lo, hi]), [cm + u[0] * along + v[0] * o0, cx + u[1] * along + v[1] * o0], (sp.b || [])[i]); }
    } else add(sp, shape(s), sp.d, sp.b);
  }
  // corridors: the ring (an annulus), and each spoke as a straight run from the centre
  const [Rr, Rw] = P.ring, h = P.w / 2, corr = { ring: [Rr - Rw / 2, Rr + Rw / 2], runs: P.spokes.map(([a, r]) => {
    const u = [Math.cos(a * rad), Math.sin(a * rad)], v = [-u[1], u[0]], e = [cm + u[0] * r, cx + u[1] * r];
    return [[cm + v[0] * h, cx + v[1] * h], [e[0] + v[0] * h, e[1] + v[1] * h], [e[0] - v[0] * h, e[1] - v[1] * h], [cm - v[0] * h, cx - v[1] * h]]; }) };
  // outlines: half-widths every metre where the hull reaches the floor, and where a room has its full headroom
  const lim = floorD - P.room - P.clear, floor = [], fit = [];
  const halfAt = (m, ok) => { if (!ok(0)) return 0; let lo = 0, hi = 60; for (let k = 0; k < 18; k++) { const md = (lo + hi) / 2; if (ok(md)) lo = md; else hi = md; } return lo; };
  for (let m = 0; m <= 200; m += 1) { const H = shipHull(m);
    floor.push([m, halfAt(m, (x) => { const an = Math.atan2(floorD - H.dc, x); return Math.hypot(x, floorD - H.dc) <= H.r(an); })]);
    fit.push([m, halfAt(m, (x) => shipSkinTop(m, x) <= lim)]); }
  return (SHIPPLAN[n] = { n, P, spaces: out, corr, floor, fit, lim, limCorr: floorD - P.corr - P.clear });
}
// A cabin's furniture layout (roadmap C), from its plan space (shipFloorPlan: poly, door, b berths): the same for the
// deck-plan page, the checks and the 3D builder. The room's frame: u along the door's wall (from the left end of the
// clear rectangle), v from that wall into the room. A clear strip along the door's wall (v < 0.85), so the door can sit
// anywhere on it; the head (shower, toilet, basin) in the far right corner; beds along the left wall, headboards to the
// far wall (two singles side by side when there is room, else a bunk); a desk on the left wall nearer the door, a
// wardrobe on the right. Returns { o, ux, uy (plan vectors), w, d, items: [{ k, u0, u1, v0, v1 }], at(u, v) -> [m, x] }.
function shipRoomLayout(sp) {
  if (!sp || !sp.door || !sp.b) return null;
  const P = sp.poly, dr = sp.door, n = P.length; let best = null;
  P.forEach((a, i) => { const b = P[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.3) return;
    const t = Math.max(0, Math.min(1, ((dr[0] - a[0]) * (b[0] - a[0]) + (dr[1] - a[1]) * (b[1] - a[1])) / (L * L))), d = Math.hypot(a[0] + t * (b[0] - a[0]) - dr[0], a[1] + t * (b[1] - a[1]) - dr[1]);
    if (!best || d < best.d) best = { d, ux: [(b[0] - a[0]) / L, (b[1] - a[1]) / L] }; });
  const c = P.reduce((q, p) => [q[0] + p[0] / n, q[1] + p[1] / n], [0, 0]); let ux = best.ux, uy = [-ux[1], ux[0]];
  if ((c[0] - dr[0]) * uy[0] + (c[1] - dr[1]) * uy[1] < 0) uy = [-uy[0], -uy[1]];
  const L = P.map(([m, x]) => [(m - dr[0]) * ux[0] + (x - dr[1]) * ux[1], (m - dr[0]) * uy[0] + (x - dr[1]) * uy[1]]);
  // the polygon's x interval at height v
  const span = (v) => { const xs = []; L.forEach((a, i) => { const b = L[(i + 1) % n]; if ((a[1] - v) * (b[1] - v) <= 0 && a[1] !== b[1]) xs.push(a[0] + (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1])); });
    const l = xs.filter((x) => x <= 0), r = xs.filter((x) => x >= 0); return l.length && r.length ? [Math.max(...l), Math.min(...r)] : null; };
  const I = 0.1, top = Math.max(...L.map((p) => p[1])); let xa = -1e9, xb = 1e9, d = 0.15;
  for (let v = 0.15; v <= top - I; v += 0.05) { const s = span(v); if (!s) break; const a = Math.max(xa, s[0] + I), b = Math.min(xb, s[1] - I); if (b - a < 3.2) break; xa = a; xb = b; d = v; }
  const w = xb - xa, o = [dr[0] + ux[0] * xa + uy[0] * I, dr[1] + ux[1] * xa + uy[1] * I]; d -= I;
  const items = [], it = (k, u0, u1, v0, v1) => items.push({ k, u0, u1, v0, v1 });
  const hw = Math.max(1.3, Math.min(1.6, w - (sp.b > 1 ? 2.6 : 2.15))); it('head', w - hw, w, d - 2.0, d);
  if (sp.b > 1 && w - hw >= 2.55) { it('bed', 0, 0.95, d - 2.1, d); it('bed', 1.6, 2.55, d - 2.1, d); }
  else it(sp.b > 1 ? 'bunk' : 'bed', 0, 0.95, d - 2.1, d);
  const dl = Math.min(1.3, d - 3.05); if (dl >= 0.8) { it('desk', 0, 0.62, 0.9, 0.9 + dl); it('chair', 0.75, 1.25, 0.9 + dl / 2 - 0.25, 0.9 + dl / 2 + 0.25); }
  if (d - 2.0 - 0.9 >= 0.7) it('wardrobe', w - 0.62, w, 0.9, Math.min(2.1, d - 2.05));
  // span(v): where the room's real walls are at depth v, as [left, right] in u (the clear rectangle can sit inside a
  // room that widens, so partitions run on to the real wall)
  return { o, ux, uy, w, d, items, at: (u, v) => [o[0] + ux[0] * u + uy[0] * v, o[1] + ux[1] * u + uy[1] * v], span: (v) => { const q = span(v + I); return q ? [q[0] - xa, q[1] - xa] : [0, w]; } };
}
// Sickbay's fittings (Deck 3): eight biobeds in an arc against the curved wall (the ring corridor's inner wall), heads to
// the wall; a glass-walled surgery in the middle of the ward, its door toward the entrance; the isolation room closing the
// quiet end of the entry alcove; the chief medical officer's small glass office beside the entrance, looking over the ward;
// the staff station and the stores along the straight walls. Plan [m, x]. Each item is a rectangle: c centre, f the unit
// way it faces (its front), w across, d deep; glass rooms have door (offset across the front, from the centre) and side
// (the other glass walls: 'l', 'r' seen from inside looking out of the front). in names the glass room an item sits in.
function shipSickbayLayout(sp) {
  if (!sp || sp.n !== 'Sickbay') return null;
  const F = shipFloorPlan(3), [cm, cx] = F.P.c, R = Math.max(...sp.poly.map(([m, x]) => Math.hypot(m - cm, x - cx))), I = 0.12;
  const dir = (t) => [Math.cos(t * Math.PI / 180), -Math.sin(t * Math.PI / 180)], at = (r, t) => [cm + r * dir(t)[0], cx + r * dir(t)[1]], neg = (v) => [-v[0], -v[1]];
  const ms = sp.poly.map(([m]) => m), xs = sp.poly.map(([, x]) => x), mF = Math.min(...ms), xC = Math.max(...xs);
  const dr = sp.door, notch = sp.poly[2], items = [], it = (k, c, f, w, d, o) => { const q = Object.assign({ k, c, f, w, d }, o || {}); items.push(q); return q; };
  // the ward: beds from just past the CMO's office round to the port spoke's wall
  const T0 = 22, T1 = 80, beds = [];
  for (let i = 0; i < 8; i++) { const t = T0 + (T1 - T0) * i / 7;
    beds.push(it('bed', at(R - I - 0.12 - 1.05, t), neg(dir(t)), 1.0, 2.1, { n: i + 1 }));
    it('bedhead', at(R - I - 0.05, t), neg(dir(t)), 1.3, 0.1);
    if (i < 7) it('bedside', at(R - I - 0.3, t + (T1 - T0) / 14), neg(dir(t + (T1 - T0) / 14)), 0.5, 0.45); }
  // surgery: the centrepiece, turned 30 degrees off the ward's radius so its door looks toward the entrance and it
  // keeps a clear walk (over 1.2 m) all round: past the CMO's office, the stores and the foot of the beds
  const TS = 58, sc = at(9.7, TS), sf = neg(dir(TS + 30));
  it('surgery', sc, sf, 4.0, 4.0, { glass: true, door: -0.8, side: 'lr' });
  it('optable', sc, [-sf[1], sf[0]], 0.8, 2.1, { in: 'surgery' });
  it('lamp', sc, sf, 1.5, 1.5, { in: 'surgery', high: true });
  it('surgcon', [sc[0] - sf[0] * 1.55 + sf[1] * 1.3, sc[1] - sf[1] * 1.55 - sf[0] * 1.3], sf, 1.0, 0.5, { in: 'surgery' });
  it('surgcon', [sc[0] - sf[0] * 1.55 - sf[1] * 1.3, sc[1] - sf[1] * 1.55 + sf[0] * 1.3], sf, 1.0, 0.5, { in: 'surgery' });
  // isolation: the whole end of the entry alcove, glass across its open side
  const iw = (xC - I) - (notch[1] + I), id = 3.1, ic = [mF + I + id / 2, (xC - I + notch[1] + I) / 2];
  it('isolation', ic, [1, 0], iw, id, { glass: true, door: -0.4 });
  it('bed', [mF + I + 0.12 + 1.05, ic[1] - 0.35], [1, 0], 1.0, 2.1, { in: 'isolation', n: 'iso' });
  it('bedhead', [mF + I + 0.05, ic[1] - 0.35], [1, 0], 1.3, 0.1, { in: 'isolation' });
  // the staff station along the alcove's straight wall, between the isolation room and the entrance
  it('station', [(mF + I + id + dr[0]) / 2 - 0.2, xC - I - 0.35], [0, -1], 2.2, 0.7);
  // the CMO's office: beside the entrance, against the lobby's wall, glass toward the ward
  const ow = 2.8, od = 2.6, oc = [notch[0] + 0.15 + ow / 2, notch[1] - I - od / 2];
  it('office', oc, [0, -1], ow, od, { glass: true, door: -0.55, side: 'r' });
  it('desk', [oc[0] + 0.35, oc[1] - 0.05], [0, 1], 1.5, 0.65, { in: 'office' });
  it('chair', [oc[0] + 0.35, oc[1] + 0.65], [0, -1], 0.55, 0.55, { in: 'office' });
  // stores: cabinets along the port spoke's wall, the replicator and a scanner alcove along the lobby's wall past the office
  for (let x = notch[1] - 1.0; x > -12.6; x -= 0.95) it('medcab', [mF + I + 0.25, x - 0.45], [1, 0], 0.9, 0.5);
  it('replicator', [oc[0] + ow / 2 + 0.75, notch[1] - I - 0.3], [0, -1], 1.0, 0.6);
  const poly = (q) => { const s = [-q.f[1], q.f[0]], a = q.d / 2, b = q.w / 2; return [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([p, r]) => [q.c[0] + q.f[0] * a * p + s[0] * b * r, q.c[1] + q.f[1] * a * p + s[1] * b * r]); };
  items.forEach((q) => { q.poly = poly(q); });
  return { items, beds, R, dir, at, poly, label: [(mF + I + id + dr[0]) / 2, (xC + notch[1]) / 2 - 0.35] }; // label: open floor in the entry alcove, for the plan's name
}
// SHIPGEO-END

````

---

## `js/exterior.js`

````javascript
// USS Defiance · exterior.js
// The ship seen from outside, built in code from SHIPGEO (shipgeo.js) so it always matches the deck plan and the
// bridge's systems display. buildExterior(opts) returns a group in Deck 2's frame (x starboard, y up from the Deck 2
// floor, -z forward): the hull lofted from the side profile and the plan half-beam, the officers' spine and bridge pod,
// the rollbar carrying the weapons pod and its torpedo launchers, long round nacelles just above the saucer on swept
// pylons, the deflector dish on the engineering body's nose, thruster blocks, sensor domes, impulse vents, lettering and
// running lights. The form itself (saucer, engineering body, rollbar, pod) comes from shipHull, shipRoll and shipPodAt.
// Paint: a dark gunmetal grey-green in layered panel patchwork (large zones built from smaller plates in close
// tones, a few warmer, cooler or oxide-red), panel lines, weathering streaks, black window bands and slate pinstripes.
// One canvas atlas holds the colour, with the panels' relief (height) in its alpha channel, plus a glow map for lit
// windows, grilles, caps, impulse and deflector.
// Light: the hull's own shader (so the baked interior is untouched): a low raking key "sun" with real shadows from a
// shadow map rendered once at build time, a cool rim light, dim fill, glossier and duller panels, relief from the
// height channel, and warm floodlights on the registry, the rollbar, the pod's launchers and the flank lettering (off at red alert).
// Strictly original: name and registry only, no emblems or borrowed markings.
// Files share one global scope and load in order (see index.html).
'use strict';

// the hull's lights (Deck 2 frame): a low key from forward and to starboard, a cool rim from aft, port and below
const HULL_SUN = new THREE.Vector3(0.56, 0.42, -0.71).normalize();
const HULL_RIM = new THREE.Vector3(-0.55, -0.3, 0.78).normalize();
const HULL_PAINT = {
  // panel tones: [colour, weight]; a dark grey with a green cast, a few warmer, cooler and darker plates
  tones: [['#737B7D', 34], ['#7B8385', 18], ['#6B7375', 18], ['#838B8C', 8], ['#636B6E', 9], ['#6F7A80', 7], ['#727A72', 6], ['#7A7872', 3], ['#5A6164', 4]],
  oxide: '#6E3028', band: '#2A2F32', dark: '#4C5356', slate: '#2E3840', glass: '#15191C', letter: '#23292E',
  window: '#E8B070', cool: '#A8C0D8', grille: '#3E86C4', cap: '#C84A22', impulse: '#D2503C', deflector: '#8CC8EE', flood: [1.0, 0.86, 0.66],
};

// the baked plating patch (textures/hull_detail*.jpg: red, green = surface relief, blue = ambient occlusion), loaded once;
// until it arrives the hull shows a flat neutral patch
const HULL_DETAIL = (() => {
  const flat = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1); flat.needsUpdate = true;
  // one entry per size (small: the 1k copy for the half-size paint), so a quality switch gets the size it asks for
  const C = {}, get = (small) => {
    const k = small ? 's' : 'b'; if (C[k]) return C[k];
    const e = C[k] = { ready: false, cb: [] };
    e.t = new THREE.TextureLoader().load(small ? 'textures/hull_detail_1k.jpg' : 'textures/hull_detail.jpg', (t) => { e.ready = true; e.cb.forEach((f) => f(t)); }, undefined, () => console.warn('hull detail texture unavailable'));
    e.t.wrapS = e.t.wrapT = THREE.RepeatWrapping; e.t.colorSpace = THREE.NoColorSpace; e.t.anisotropy = 8; return e;
  };
  return { tex: (small) => { const e = get(small); return e.ready ? e.t : flat; }, isReady: (small) => get(small).ready,
    onReady: (small, f) => { const e = get(small); if (e.ready) f(e.t); else e.cb.push(f); } };
})();
// ---------- SHIPGEO curves, sampled the way shipCurve draws them ----------
function shipSpline(pts, n) {
  const P = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))], out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = P(i - 1), b = P(i), c = P(i + 1), d = P(i + 2);
    const p1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6], p2 = [c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6];
    for (let k = i ? 1 : 0; k <= n; k++) { const t = k / n, u = 1 - t, A = u * u * u, B = 3 * u * u * t, C = 3 * u * t * t, D = t * t * t;
      out.push([A * b[0] + B * p1[0] + C * p2[0] + D * c[0], A * b[1] + B * p1[1] + C * p2[1] + D * c[1]]); }
  }
  return out;
}
// a drawn curve as a function of its first coordinate (m)
function shipFn(pts) {
  const s = shipSpline(pts, 24); if (s[0][0] > s[s.length - 1][0]) s.reverse();
  return (m) => {
    if (m <= s[0][0]) return s[0][1]; if (m >= s[s.length - 1][0]) return s[s.length - 1][1];
    let lo = 0, hi = s.length - 1; while (hi - lo > 1) { const md = (lo + hi) >> 1; if (s[md][0] <= m) lo = md; else hi = md; }
    const [a, x] = s[lo], [b, y] = s[hi]; return b > a ? x + (y - x) * (m - a) / (b - a) : x;
  };
}
const smooth01 = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const spow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);

function buildExterior(opts) {
  opts = opts || {};
  const lite = !!opts.lite, K = opts.atlasScale || (lite ? 0.5 : 1), G = SHIPGEO;
  const X = (planZ) => -planZ, Y = (d) => 7 - d, Z = (m) => m - 64;
  const SP = shipFn(G.spineTop); // the spine's top along the centreline
  const SAU = G.saucer, ROLL = G.rollbar, POD = G.wpod;
  const rnd = mulberry(4080);

  // ---------- atlas layout (pixels at full size) ----------
  const AW = 4096, AH = 3072;
  const R = {
    hull: [0, 0, 4096, 2048], nac: [0, 2048, 1536, 384], spine: [1536, 2048, 768, 512], arch: [2304, 2048, 1024, 256],
    spar: [3328, 2048, 512, 256], turret: [3840, 2048, 256, 256], stern: [2304, 2304, 512, 256],
    name: [2816, 2304, 768, 128], reg: [2816, 2432, 512, 128], rcs: [3328, 2432, 256, 128], defl: [3584, 2304, 256, 256],
    cells: [3840, 2304, 256, 256], launch: [0, 2432, 256, 128],
    // stage 2b: the shuttlebay's clamshell doors, the docking hatches, the sensor pallets and a sheet of small stencils
    door: [0, 2560, 512, 512], dock: [512, 2560, 256, 256], sensor: [512, 2816, 256, 256], marks: [768, 2560, 1280, 512],
  };
  // uv in a region: (a, b) in 0..1 across the region (b = 0 at the region's top row in the canvas)
  const ruv = (r, a, b) => [(r[0] + a * r[2]) / AW, 1 - (r[1] + b * r[3]) / AH];
  const CELL = { base: 0, dark: 1, slate: 2, glass: 3, deflector: 4, impulse: 5, grille: 6, cap: 7, gun: 8, ring: 9, barrel: 10, light: 11, dome: 12, oxide: 13, tractor: 14, pale: 15 };
  const cellUV = (k) => ruv(R.cells, ((k % 4) + 0.5) / 4, (((k / 4) | 0) + 0.5) / 4);

  // ---------- geometry assembly ----------
  const parts = [], decals = [];
  // a grid of rows x cols vertices; pt(i, j) -> [x, y, z], uv(i, j) -> [u, v]; wrap closes each row back on itself
  function grid(rows, cols, pt, uv, wrap) {
    const pos = [], uvs = [], idx = [];
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { pos.push(...pt(i, j)); uvs.push(...uv(i, j)); }
    const cj = wrap ? cols : cols - 1;
    for (let i = 0; i < rows - 1; i++) for (let j = 0; j < cj; j++) {
      const a = i * cols + j, b = i * cols + (j + 1) % cols, c = a + cols, d = b + cols; idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.userData.cols = cols; return g;
  }
  const flip = (g) => { const ix = g.index.array; for (let k = 0; k < ix.length; k += 3) { const t = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = t; } };
  // make faces point outward (away from the middle of their row of the grid), then smooth normals across seams
  function finish(g, weld) {
    const p = g.attributes.position.array, ix = g.index.array, cols = g.userData.cols || p.length / 3, rows = p.length / 3 / cols, mid = [];
    for (let i = 0; i < rows; i++) { let x = 0, y = 0, z = 0; for (let j = 0; j < cols; j++) { const v = (i * cols + j) * 3; x += p[v]; y += p[v + 1]; z += p[v + 2]; } mid.push([x / cols, y / cols, z / cols]); }
    let out = 0;
    for (let k = 0; k < ix.length; k += 3) { const a = ix[k] * 3, b = ix[k + 1] * 3, c = ix[k + 2] * 3, ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2], vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, q = mid[Math.floor(ix[k] / cols)];
      out += nx * ((p[a] + p[b] + p[c]) / 3 - q[0]) + ny * ((p[a + 1] + p[b + 1] + p[c + 1]) / 3 - q[1]) + nz * ((p[a + 2] + p[b + 2] + p[c + 2]) / 3 - q[2]); }
    if (out < 0) flip(g);
    g.computeVertexNormals();
    if (weld) { const n = g.attributes.normal.array, key = new Map();
      for (let v = 0; v < p.length / 3; v++) { const k = Math.round(p[v * 3] * 200) + ',' + Math.round(p[v * 3 + 1] * 200) + ',' + Math.round(p[v * 3 + 2] * 200); (key.get(k) || key.set(k, []).get(k)).push(v); }
      key.forEach((vs) => { if (vs.length < 2) return; let x = 0, y = 0, z = 0; vs.forEach((v) => { x += n[v * 3]; y += n[v * 3 + 1]; z += n[v * 3 + 2]; });
        const l = Math.hypot(x, y, z) || 1; vs.forEach((v) => { n[v * 3] = x / l; n[v * 3 + 1] = y / l; n[v * 3 + 2] = z / l; }); }); }
    return g;
  }
  // a stock geometry recoloured from one atlas cell or squeezed into a region
  function stock(g, at, mtx) {
    g = g.clone(); if (mtx) g.applyMatrix4(mtx);
    const uv = g.attributes.uv; if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]);
    for (let k = 0; k < uv.count; k++) { const c = typeof at === 'number' ? cellUV(at) : at(uv.getX(k), uv.getY(k)); uv.setXY(k, c[0], c[1]); }
    if (!g.attributes.normal) g.computeVertexNormals(); return g;
  }
  const M4 = (x, y, z, rx, ry, rz, s) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(...(Array.isArray(s) ? s : [s || 1, s || 1, s || 1])));
  function cap(points, at, outward) { // a flat fan closing a ring of [x, y, z] points, facing along outward
    const n = points.length, c = points.reduce((q, p) => [q[0] + p[0] / n, q[1] + p[1] / n, q[2] + p[2] / n], [0, 0, 0]), pos = [...c], uvs = [...at], idx = [];
    points.forEach((p) => { pos.push(...p); uvs.push(...at); }); for (let j = 0; j < n; j++) idx.push(0, 1 + j, 1 + (j + 1) % n);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
    const nn = g.attributes.normal; if (nn.getX(0) * outward[0] + nn.getY(0) * outward[1] + nn.getZ(0) * outward[2] < 0) { flip(g); g.computeVertexNormals(); }
    return g;
  }

  // ---------- the hull: a lens-shaped saucer forward flowing into a slim engineering body aft ----------
  // Each station is the smooth union of two rounded sections about the saucer's mid-plane (depth SAU.dc): the saucer's
  // lens (thinning toward its rim and toward its fore and aft edges) and the engineering body's tall rounded section.
  // Where both are present their outlines merge with a soft fillet, so the saucer sweeps into the body with no neck.
  const NJ = lite ? 30 : 72;
  const hullSec = (m) => { const H = shipHull(m); H.r0 = H.dc - 0.8; H.r1 = H.dc + 0.8; return H; };
  // one side (starboard, x >= 0) from the top centreline to the bottom centreline: [x, d, arc]; angles packed near the rim
  function hullSide(S) {
    const out = [];
    for (let j = 0; j <= 2 * NJ; j++) { const u = j / NJ - 1, th = (Math.PI / 2) * spow(u, 1.35), rr = S.r(th); out.push([Math.max(0, rr * Math.cos(th)), S.dc + rr * Math.sin(th)]); }
    out[0][0] = 0; out[out.length - 1][0] = 0;
    let a = 0; out[0].push(0); for (let i = 1; i < out.length; i++) { a += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); out[i].push(a); }
    return out;
  }
  const secFull = (m) => { const S = hullSec(m); S.side = hullSide(S); return S; };
  const HT = (m) => hullSec(m).t; // depth of the hull's top centreline
  const HM = (() => { // stations along the length, close together at the bow, the saucer's aft edge and the stern
    const s = new Set([0, 0.1, 0.3, 0.6, 1, 1.6, 2.4, 3.4, 4.6, 6, 200, 199.8, 199.4, 198.8, 198]);
    const N = lite ? 64 : 140; for (let i = 0; i <= N; i++) { const q = i / N; s.add(+(7 + 190 * (0.72 * q + 0.28 * (0.5 - 0.5 * Math.cos(Math.PI * q)))).toFixed(3)); }
    for (let m = 104; m <= 118; m += lite ? 1.5 : 0.75) s.add(m);
    return [...s].filter((m) => m <= 200).sort((a, b) => a - b);
  })();
  const HS = HM.map(secFull);
  HS.forEach((S) => { S.arc = S.side[S.side.length - 1][2]; });
  const VMAX = Math.max(...HS.map((S) => S.arc)) * 1.002;
  const RING = 4 * NJ; // closed ring: top, starboard side to the keel, port side back up
  const ringPt = (S, j) => { const k = S.side.length - 1; return j <= k ? [S.side[j][0], S.side[j][1], S.side[j][2]] : [-S.side[2 * k - j][0], S.side[2 * k - j][1], S.side[2 * k - j][2]]; };
  {
    parts.push(finish(grid(HS.length, RING, (i, j) => { const S = HS[i], [x, d] = ringPt(S, j); return [x, Y(d), Z(S.m)]; },
      (i, j) => ruv(R.hull, HS[i].m / 200, ringPt(HS[i], j)[2] / VMAX), true)));
    // the stern's transom is built with the shuttlebay (below), round the bay's opening
  }
  // a point on the hull: on the upper surface at lateral x, on the underside at lateral x, or on a side at depth d
  const onSide = (S, x, upper) => { const s = S.side, ax = Math.abs(x);
    if (upper) { for (let i = 1; i < s.length; i++) if (s[i][0] >= ax) { const f = (ax - s[i - 1][0]) / Math.max(1e-6, s[i][0] - s[i - 1][0]); return s[i - 1][1] + f * (s[i][1] - s[i - 1][1]); } }
    else { for (let i = s.length - 2; i >= 0; i--) if (s[i][0] >= ax) { const f = (ax - s[i + 1][0]) / Math.max(1e-6, s[i][0] - s[i + 1][0]); return s[i + 1][1] + f * (s[i][1] - s[i + 1][1]); } }
    return S.side[Math.round(s.length / 2)][1]; };
  const hullTop = (m, x) => [x, Y(onSide(secFull(m), x, true)), Z(m)];
  const hullBot = (m, x) => [x, Y(onSide(secFull(m), x, false)), Z(m)];
  const hullAtDepth = (S, d) => { // starboard x and arc length where the section reaches depth d (null if it doesn't)
    const s = S.side; if (d < s[0][1] || d > s[s.length - 1][1]) return null;
    for (let i = 1; i < s.length; i++) if (d <= s[i][1] && s[i][1] > s[i - 1][1]) { const f = (d - s[i - 1][1]) / (s[i][1] - s[i - 1][1]); return { x: s[i - 1][0] + f * (s[i][0] - s[i - 1][0]), arc: s[i - 1][2] + f * (s[i][2] - s[i - 1][2]), ny: (s[i][0] - s[i - 1][0]) / Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]) }; }
    return null;
  };
  const hullSidePt = (m, d, sd) => { const h = hullAtDepth(secFull(m), d); return h ? [sd * h.x, Y(d), Z(m)] : null; };

  // ---------- the officers' spine (Decks 1-2) and the bridge module ----------
  // SHIPGEO.spine: a rounded body over Deck 2's rooms and a broad, low bridge module over Deck 1's, merged with a soft
  // fillet (shipSpineRing gives the section), flaring out at the foot into the saucer. It encloses every Deck 1-2 room
  // and faces outward only, so from inside a room it is not drawn and every window looks straight out.
  const SPM = (() => { const s = new Set(); const seg = (a, b, n) => { for (let i = 0; i <= n; i++) s.add(+(a + (b - a) * i / n).toFixed(3)); };
    seg(49.3, 60, lite ? 12 : 26); seg(60, 75, lite ? 5 : 10); seg(75, 84, lite ? 9 : 18); seg(84, 95, lite ? 4 : 8); seg(95, 102.3, lite ? 9 : 20); return [...s].sort((a, b) => a - b); })();
  const SPH = lite ? 12 : 24; // points up each half of the section
  const ringCache = new Map();
  function spineRing(m) { // starboard foot, up the side, over the crown, down to the port foot: [x, d, arc]
    const key = Math.round(m * 400) / 400; if (ringCache.has(key)) return ringCache.get(key);
    const foot = HT(m) + 1.0, half = shipSpineRing(m, foot, SPH).map(([x, d]) => { const fl = Math.max(0, 1 - (foot - d) / 1.8); return [x + 2.0 * fl * fl, d]; });
    const out = half.concat(half.slice(0, -1).reverse().map(([x, d]) => [-x, d]));
    let a = 0; out[0] = out[0].concat(0); for (let i = 1; i < out.length; i++) { a += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); out[i] = out[i].concat(a); }
    ringCache.set(key, out); return out;
  }
  const SR = SPM.map((m) => ({ m, r: spineRing(m) })), SVMAX = Math.max(...SR.map((s) => s.r[s.r.length - 1][2])) * 1.002;
  {
    parts.push(finish(grid(SR.length, SR[0].r.length, (i, j) => { const [x, d] = SR[i].r[j]; return [x, Y(d), Z(SR[i].m)]; },
      (i, j) => ruv(R.spine, (SR[i].m - 49) / 54, SR[i].r[j][2] / SVMAX))));
    [SR[0], SR[SR.length - 1]].forEach((s, e) => parts.push(cap(s.r.map(([x, d]) => [x, Y(d), Z(s.m)]), cellUV(CELL.gun), [0, 0, e ? 1 : -1])));
  }
  // the bridge module's sensor dome, on its crown over the bridge
  { const pm = 66, top = Y(SP(pm));
    parts.push(stock(new THREE.SphereGeometry(1.5, lite ? 12 : 20, lite ? 6 : 10, 0, Math.PI * 2, 0, Math.PI / 2), CELL.dome, M4(0, top - 0.05, Z(pm), 0, 0, 0, [1, 0.45, 1]))); }

  // ---------- the rollbar and the weapons pod with its torpedo launchers ----------
  // A swept bar rising from the saucer's aft shoulders and arching over the engineering body (shipRoll), its crown
  // carrying a lozenge-shaped pod (shipPodAt) with two launchers firing forward and one aft.
  {
    const RS = lite ? 36 : 96, RR = lite ? 14 : 32, P3 = (s) => { const r = shipRoll(s); return new THREE.Vector3(r.out, Y(r.d), Z(r.m)); };
    [-1, 1].forEach((sd) => parts.push(finish(grid(RS + 1, RR + 1, (i, j) => {
      const s = sd * (i / RS) * 1.04, r = shipRoll(s), p = P3(s), tg = P3(s + 0.004 * sd).sub(P3(s - 0.004 * sd)).normalize();
      const fw = new THREE.Vector3(0, 0, -1).addScaledVector(tg, tg.z).normalize(), th = new THREE.Vector3().crossVectors(tg, fw).normalize(), a = (j % RR) / RR * Math.PI * 2;
      return p.addScaledVector(fw, r.chord * spow(Math.cos(a), 0.8)).addScaledVector(th, r.thick * spow(Math.sin(a), 0.7)).toArray();
    }, (i, j) => ruv(R.arch, 0.5 + 0.5 * i / RS, j / RR)), true)));
    const PN = lite ? 26 : 64, PR = lite ? 18 : 44;
    parts.push(finish(grid(PN + 1, PR + 1, (i, j) => { const q = i / PN, [hw, hh] = shipPodAt(q), a = (j % PR) / PR * Math.PI * 2;
      return [(hw + 0.001) * spow(Math.cos(a), 2 / 2.8), Y(POD.d) + (hh + 0.001) * spow(Math.sin(a), 2 / 2.8), Z(POD.m[0] + (POD.m[1] - POD.m[0]) * q)]; }, (i, j) => ruv(R.spar, i / PN, j / PR)), true));
    // launchers: armoured housings, their muzzles (the face toward the firing direction) mapped to the launcher art
    G.launchers.forEach(([a, b, o, d, hw, hh]) => {
      const aft = (a + b) / 2 > (POD.m[0] + POD.m[1]) / 2, bx = new THREE.BoxGeometry(2 * hw, 2 * hh, b - a, 1, 1, 1), n = bx.attributes.normal, uv = bx.attributes.uv;
      for (let k = 0; k < uv.count; k++) { const muzzle = aft ? n.getZ(k) > 0.9 : n.getZ(k) < -0.9; const c = muzzle ? ruv(R.launch, aft ? 1 - uv.getX(k) : uv.getX(k), 1 - uv.getY(k)) : cellUV(CELL.gun); uv.setXY(k, c[0], c[1]); }
      bx.applyMatrix4(M4(o, Y(d), Z((a + b) / 2))); parts.push(bx);
      parts.push(stock(new THREE.BoxGeometry(2 * hw + 0.5, 2 * hh + 0.4, 1.0), CELL.dark, M4(o, Y(d), Z(aft ? a + 1.4 : b - 1.4)))); // the housing's collar where it enters the pod
    });
  }

  // ---------- nacelles and their spars ----------
  // Big rounded-box nacelles from SHIPGEO.nacelle (profile = half-height, nacelle.w = width over height), with a raised
  // ridge along the top and a recessed channel down the inboard face that carries the grille.
  const N = G.nacelle, NRF = shipFn(N.prof), NL0 = N.prof[N.prof.length - 1][0], NCY = Y(N.d), NRR = lite ? 32 : 64;
  const NP = (() => { const s = new Set(); shipSpline(N.prof, lite ? 3 : 5).forEach(([p]) => s.add(+p.toFixed(3))); for (let p = 6; p < NL0 - 8; p += lite ? 5 : 2) s.add(p); return [...s].sort((a, b) => a - b); })();
  const nacLen = (p) => smooth01(4, 9, p) * (1 - smooth01(NL0 - 16, NL0 - 8, p));
  const nacPt = (sd, p, v, off) => { // v: 0 bottom, 0.25 inboard, 0.5 top, 0.75 outboard
    const r = NRF(p), a = v * Math.PI * 2 - Math.PI / 2, ex = spow(Math.cos(a), 2 / N.n), ey = spow(Math.sin(a), 2 / N.n), L = nacLen(p);
    const dv = (x, c, w) => { const q = (x - c) / w; return Math.exp(-q * q); };
    const k = 1 + 0.045 * L * dv(v, 0.5, 0.035) - 0.06 * L * dv(v, 0.25, 0.06) + (off || 0) / Math.max(r, 0.1);
    return [sd * N.z - sd * r * N.w * ex * k, NCY + r * ey * k, Z(N.m0 + p)];
  };
  [-1, 1].forEach((sd) => parts.push(finish(grid(NP.length, NRR + 1, (i, j) => nacPt(sd, NP[i], (j % NRR) / NRR), (i, j) => ruv(R.nac, NP[i] / NL0, j / NRR)), true)));
  {
    const NSP = lite ? 8 : 20, SRR = lite ? 14 : 32;
    [-1, 1].forEach((sd) => { // swept, nearly level pylons from the engineering body out to the nacelles
      const at = (A, B, PA, PB, s) => new THREE.Vector3(sd * (A[1] + (B[1] - A[1]) * s), Y(A[2] + (B[2] - A[2]) * s), Z(A[0] + (B[0] - A[0]) * s));
      const sp = G.spar, pl = G.sparPlan, L0 = [sp[0][0], pl[0][1], sp[0][1]], T0 = [sp[1][0], pl[1][1], sp[1][1]], T1 = [sp[2][0], pl[2][1], sp[2][1]], L1 = [sp[3][0], pl[3][1], sp[3][1]], PL0 = 0, PL1 = 0, PT0 = 0, PT1 = 0;
      parts.push(finish(grid(NSP + 1, SRR + 1, (i, j) => {
        const s = -0.12 + 1.19 * i / NSP, le = at(L0, L1, PL0, PL1, s), te = at(T0, T1, PT0, PT1, s), mid = le.clone().add(te).multiplyScalar(0.5);
        const ch = te.clone().sub(le), c = ch.length() / 2; ch.normalize();
        const span = at(L0, L1, PL0, PL1, 1).sub(at(L0, L1, PL0, PL1, 0)).normalize(), th = new THREE.Vector3().crossVectors(ch, span).normalize();
        const a = (j % SRR) / SRR * Math.PI * 2, t = 1.0 - 0.35 * Math.max(0, Math.min(1, s)), ex = spow(Math.cos(a), 0.8), ey = spow(Math.sin(a), 0.6);
        return mid.addScaledVector(ch, c * ex).addScaledVector(th, t * ey).toArray();
      }, (i, j) => ruv(R.turret, i / NSP, j / SRR)), true));
    });
  }

  // ---------- small parts: thruster blocks, sensor domes ----------
  {
    const rcs = (x, y, z, ry, s) => parts.push(stock(new THREE.BoxGeometry(2.6, 1.5, 0.9).translate(0, 0, 0.45), (u, v) => ruv(R.rcs, 0.04 + u * 0.92, 0.08 + (1 - v) * 0.84), M4(x, y, z, 0, ry, 0, s || 1)));
    [22, 98, 184].forEach((m) => { const S = secFull(m), dw = (hullSec(m + 0.5).w - hullSec(m - 0.5).w), yaw = Math.atan(dw); [-1, 1].forEach((sd) => rcs(sd * (hullAtDepth(S, SAU.dc).x - 0.25), Y(SAU.dc), Z(m), sd * (Math.PI / 2 + yaw), 1)); });
    [-1, 1].forEach((sd) => { const p = NL0 - 14, q = nacPt(sd, p, 0.75); rcs(q[0] - sd * 0.25, q[1], q[2], sd * Math.PI / 2, 0.8); });
    const bot = hullBot(80, 0.01); parts.push(stock(new THREE.SphereGeometry(3.0, lite ? 14 : 24, lite ? 6 : 10, 0, Math.PI * 2, 0, Math.PI / 2), CELL.dome, M4(0, bot[1] + 0.5, bot[2], Math.PI, 0, 0, [1, 0.5, 1.3])));
    const bot2 = hullBot(150, 0.01); parts.push(stock(new THREE.SphereGeometry(1.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), CELL.dome, M4(0, bot2[1] + 0.3, bot2[2], Math.PI, 0, 0, [1, 0.6, 1])));
  }

  // ---------- lettering and the deflector dish: thin decals that follow the hull ----------
  // decal(fn, region, na, nb): fn(a, b) gives a surface point for a in 0..1 across the text (left to right as read) and
  // b in 0..1 down it (top of the letters to the bottom); the decal sits 6 cm proud of the surface.
  function decal(fn, region, na, nb, lift) {
    const P = [], uvs = [], idx = [], e = 0.002;
    for (let i = 0; i <= nb; i++) for (let j = 0; j <= na; j++) { const a = j / na, b = i / nb, p = new THREE.Vector3(...fn(a, b));
      const pa = new THREE.Vector3(...fn(Math.min(1, a + e), b)).sub(new THREE.Vector3(...fn(Math.max(0, a - e), b)));
      const pb = new THREE.Vector3(...fn(a, Math.min(1, b + e))).sub(new THREE.Vector3(...fn(a, Math.max(0, b - e))));
      const n = new THREE.Vector3().crossVectors(pb, pa).normalize(); P.push(p.addScaledVector(n, lift || 0.06)); uvs.push(...ruv(region, a, b)); }
    const pos = []; P.forEach((p) => pos.push(p.x, p.y, p.z));
    for (let i = 0; i < nb; i++) for (let j = 0; j < na; j++) { const a = i * (na + 1) + j, b = a + 1, c = a + na + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
    decals.push(g); return g;
  }
  const NAME_AR = R.name[2] / R.name[3], REG_AR = R.reg[2] / R.reg[3]; // decal width over height = its atlas box
  // on top of the forward hull, read from aft with the letters' tops toward the bow: name, then the registry aft of it
  { const h = 4.4, w = h * NAME_AR, mc = 33; decal((a, b) => hullTop(mc - h / 2 + b * h, (a - 0.5) * w), R.name, 24, 4); }
  { const h = 6.2, w = h * REG_AR, mc = 41.5; decal((a, b) => hullTop(mc - h / 2 + b * h, (a - 0.5) * w), R.reg, 16, 4); }
  // under the forward hull, read from below (left to right runs starboard to port)
  { const h = 4.4, w = h * NAME_AR, mc = 44; decal((a, b) => hullBot(mc - h / 2 + b * h, (0.5 - a) * w), R.name, 24, 4); }
  { const h = 6.2, w = h * REG_AR, mc = 52.5; decal((a, b) => hullBot(mc - h / 2 + b * h, (0.5 - a) * w), R.reg, 16, 4); }
  [-1, 1].forEach((sd) => {
    // both flanks of the engineering section, below the window band; name first as read (forward on port, aft on starboard)
    const side = (m0, len, d0, h) => (a, b) => { const m = sd < 0 ? m0 + a * len : m0 + len - a * len; return hullSidePt(m, d0 + b * h, sd) || hullSidePt(m, d0 + b * h * 0.5, sd); };
    { const h = 2.6, nl = h * NAME_AR, rl = h * REG_AR, gap = 5.9;
      decal(side(sd < 0 ? 150 : 150 + rl + gap, nl, 23.2, h), R.name, 20, 3); decal(side(sd < 0 ? 150 + nl + gap : 150, rl, 23.2, h), R.reg, 12, 3); }
    // the registry on each nacelle's outboard side, aft of the spar
    { const h = 1.7, len = h * REG_AR, p0 = 66, per = 2 * Math.PI * NRF(p0) * (1 + N.w) / 2;
      decal((a, b) => { const p = sd < 0 ? p0 + a * len : p0 + len - a * len; return nacPt(sd, p, 0.75 + (b - 0.5) * h / per); }, R.reg, 12, 2); }
  });
  // the navigational deflector: a glowing oval dish on the engineering body's nose, under the saucer
  { const front = (d) => { let m = 92; while (m < 125 && shipHull(m).b < d) m += 0.1; return m; }, dd = 24.2, m0 = front(dd), tilt = Math.atan2(front(dd + 1.5) - front(dd - 1.5), 3);
    const out = 0.9, py = Y(dd) - Math.sin(tilt) * out, pz = Z(m0) - Math.cos(tilt) * out; // stand the dish proud of the curved nose, along its normal
    const dish = new THREE.CircleGeometry(1, lite ? 24 : 40), du = dish.attributes.uv; for (let k = 0; k < du.count; k++) du.setXY(k, ...ruv(R.defl, du.getX(k), 1 - du.getY(k))); dish.applyMatrix4(M4(0, py, pz, -tilt, Math.PI, 0, [3.2, 2.3, 1])); decals.push(dish);
    parts.push(stock(new THREE.TorusGeometry(1, 0.12, 8, lite ? 24 : 40), CELL.dark, M4(0, py + Math.sin(tilt) * 0.05, pz + Math.cos(tilt) * 0.05, -tilt, Math.PI, 0, [3.3, 2.4, 3])));
    parts.push(stock(new THREE.CylinderGeometry(1, 1.15, out + 0.6, lite ? 16 : 28, 1, true), CELL.dark, M4(0, (py + Y(dd)) / 2 + Math.sin(tilt) * 0.3, (pz + Z(m0)) / 2 + Math.cos(tilt) * 0.3, Math.PI / 2 - tilt, 0, 0, [3.3, 1, 2.4]))); }

  // ---------- stage 2b: the busy outside ----------
  // Hardware with real depth is geometry in the hull's paint (docking ports and the ventral collar, tractor emitters,
  // dishes, antennas, sensor pallets, the shuttlebay's opening and its clamshell doors); small lights are points
  // (LT) that blink in their own shader; the impulse plumes and thruster puffs are soft sprites (built after the paint).
  const V3 = (a) => new THREE.Vector3(...a), SEG = lite ? 18 : 36;
  // a local frame: y along n (out of the hull), z along t (usually aft), x = y cross z
  const mount = (p, n, t, s) => { const y = n.clone().normalize(), z = t.clone().addScaledVector(y, -t.dot(y)).normalize(), x = new THREE.Vector3().crossVectors(y, z);
    const mt = new THREE.Matrix4().makeBasis(x, y, z); if (s) mt.scale(new THREE.Vector3(...(Array.isArray(s) ? s : [s, s, s]))); return mt.setPosition(p); };
  // the hull's frame at a point on a side (m, depth d) or on the top or bottom (m, lateral x)
  const sideFrame = (m, d, sd) => { const P = (mm, dd) => V3(hullSidePt(mm, dd, sd)), t = P(m + 0.25, d).sub(P(m - 0.25, d)).normalize(), dn = P(m, d + 0.25).sub(P(m, d - 0.25)).normalize();
    const n = new THREE.Vector3().crossVectors(t, dn).normalize(); if (n.x * sd < 0) n.negate(); return { p: P(m, d), n, t }; };
  const surfFrame = (m, x, upper) => { const P = (mm, xx) => V3(upper ? hullTop(mm, xx) : hullBot(mm, xx)), t = P(m + 0.25, x).sub(P(m - 0.25, x)).normalize(), s = P(m, x + 0.25).sub(P(m, x - 0.25)).normalize();
    const n = new THREE.Vector3().crossVectors(t, s).normalize(); if ((n.y > 0) !== upper) n.negate(); return { p: P(m, x), n, t }; };
  // turn every triangle to face want(centre) (for shapes whose winding isn't known in advance), then smooth normals
  const orient = (g, want) => { const p = g.attributes.position, ix = g.index.array, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    for (let k = 0; k < ix.length; k += 3) { a.fromBufferAttribute(p, ix[k]); b.fromBufferAttribute(p, ix[k + 1]); c.fromBufferAttribute(p, ix[k + 2]);
      const nn = b.clone().sub(a).cross(c.clone().sub(a)), ctr = a.clone().add(b).add(c).multiplyScalar(1 / 3); if (nn.dot(want(ctr)) < 0) { const q = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = q; } }
    if (g.attributes.normal) g.deleteAttribute('normal'); g.computeVertexNormals(); return g; };
  const LT = [], LK = { steady: 0, strobe: 1, beacon: 2, chase: 3, blink: 4 }; // lights: position, colour, size (m), kind, phase
  const light = (p, col, size, kind, ph) => LT.push({ p: Array.isArray(p) ? p : p.toArray(), col: new THREE.Color(col), size, kind: LK[kind], ph: ph || 0 });
  const AMBER = 0xffa640, WHITE = 0xf4f8ff, RED = 0xff3a2a;
  const local = (fr, x, y, z) => { const mt = mount(fr.p, fr.n, fr.t); return new THREE.Vector3(x, y, z).applyMatrix4(mt); };
  // docking ports: an armoured collar standing out of the hull, a striped face ring, a recessed hatch, a ring of guide lights
  const DOCKS = [];
  function dockPort(name, fr, r, lip, nl) {
    const { p, n, t } = fr, at = (h) => p.clone().addScaledVector(n, h);
    parts.push(stock(new THREE.CylinderGeometry(r, r + 0.35, lip + 0.9, SEG, 1, true), CELL.dark, mount(at((lip - 0.9) / 2), n, t)));
    parts.push(stock(new THREE.RingGeometry(r * 0.64, r + 0.02, SEG, 1).rotateX(-Math.PI / 2), (u, v) => ruv(R.dock, u, 1 - v), mount(at(lip), n, t)));
    const well = new THREE.CylinderGeometry(r * 0.64, r * 0.64, 0.32, SEG, 1, true); flip(well); well.computeVertexNormals();
    parts.push(stock(well, CELL.slate, mount(at(lip - 0.16), n, t)));
    parts.push(stock(new THREE.CircleGeometry(r * 0.64, SEG).rotateX(-Math.PI / 2), (u, v) => ruv(R.dock, 0.5 + (u - 0.5) * 0.64, 0.5 - (v - 0.5) * 0.64), mount(at(lip - 0.3), n, t)));
    for (let k = 0; k < nl; k++) { const a = k / nl * Math.PI * 2; light(local(fr, Math.cos(a) * (r + 0.22), lip + 0.06, Math.sin(a) * (r + 0.22)), AMBER, 0.55, 'chase', k / nl); }
    const m = p.z + 64, d = 7 - p.y; DOCKS.push({ name, m, d, r, lip }); return fr;
  }
  // Deck 4's rim docking ports (port and starboard twins), and the ventral collar under the keel on Deck 10
  const DOCK_RIM = { m: 89, d: 12.3 }, DOCK_KEEL = { m: 121 };
  [-1, 1].forEach((sd) => dockPort(sd < 0 ? 'Docking port, port' : 'Docking port, starboard', sideFrame(DOCK_RIM.m, DOCK_RIM.d, sd), 1.9, 0.55, 10));
  { const fr = { p: V3(hullBot(DOCK_KEEL.m, 0)), n: new THREE.Vector3(0, -1, 0), t: new THREE.Vector3(0, 0, 1) };
    dockPort('Docking collar and fuel transfer', fr, 2.5, 1.5, 14);
    parts.push(stock(new THREE.TorusGeometry(3.05, 0.26, 8, SEG).rotateX(-Math.PI / 2), CELL.gun, mount(fr.p.clone().addScaledVector(fr.n, 0.25), fr.n, fr.t)));
    [-1, 1].forEach((s) => parts.push(stock(new THREE.BoxGeometry(0.7, 0.9, 7.6), CELL.dark, M4(s * 3.3, fr.p.y - 0.3, fr.p.z)))); } // the collar's side rails
  // tractor beam emitters: an armoured ring round a shallow glowing lens (keel, Deck 10; and aft by the shuttlebay)
  const emitter = (fr, r) => { const at = (h) => fr.p.clone().addScaledVector(fr.n, h);
    parts.push(stock(new THREE.CylinderGeometry(r * 1.15, r * 1.35, 1.0, SEG, 1, true), CELL.dark, mount(at(0.05), fr.n, fr.t)));
    parts.push(stock(new THREE.TorusGeometry(r * 1.15, 0.12, 6, SEG).rotateX(-Math.PI / 2), CELL.slate, mount(at(0.55), fr.n, fr.t)));
    parts.push(stock(new THREE.SphereGeometry(r, SEG, lite ? 4 : 8, 0, Math.PI * 2, 0, Math.PI / 2), CELL.tractor, mount(at(0.42), fr.n, fr.t, [1, 0.3, 1]))); };
  const TRACTORS = [134, 192]; TRACTORS.forEach((m) => emitter({ p: V3(hullBot(m, 0)), n: new THREE.Vector3(0, -1, 0), t: new THREE.Vector3(0, 0, 1) }, m < 150 ? 1.5 : 1.1));
  // small dishes on short masts and whip antennas with a red tip light
  const dishGeo = (R0, f) => { const pts = [], N = lite ? 4 : 6; for (let i = 0; i <= N; i++) { const r = R0 * i / N; pts.push(new THREE.Vector2(Math.max(r, 0.002), r * r / (4 * f))); }
    for (let i = N; i >= 0; i--) { const r = R0 * i / N * 0.96; pts.push(new THREE.Vector2(Math.max(r, 0.002), r * r / (4 * f) - 0.09 - 0.05 * (1 - i / N))); }
    return orient(new THREE.LatheGeometry(pts, lite ? 10 : 18), (c) => new THREE.Vector3(0, c.y > Math.hypot(c.x, c.z) ** 2 / (4 * f) - 0.05 ? 1 : -1, 0)); };
  const dish = (fr, R0, mast, aim) => { const top = fr.p.clone().addScaledVector(fr.n, mast), dir = aim.clone().normalize();
    parts.push(stock(new THREE.CylinderGeometry(0.12, 0.2, mast + 0.3, 8), CELL.dark, mount(fr.p.clone().addScaledVector(fr.n, mast / 2 - 0.15), fr.n, fr.t)));
    parts.push(stock(dishGeo(R0, R0 * 0.55), CELL.pale, mount(top, dir, fr.t)));
    parts.push(stock(new THREE.CylinderGeometry(0.035, 0.05, R0 * 0.55, 5), CELL.dark, mount(top.clone().addScaledVector(dir, R0 * 0.27), dir, fr.t)));
    parts.push(stock(new THREE.SphereGeometry(0.09, 8, 6), CELL.slate, mount(top.clone().addScaledVector(dir, R0 * 0.55), dir, fr.t))); };
  const whip = (fr, L) => { parts.push(stock(new THREE.CylinderGeometry(0.05, 0.1, L, 6), CELL.dark, mount(fr.p.clone().addScaledVector(fr.n, L / 2 - 0.1), fr.n, fr.t)));
    parts.push(stock(new THREE.SphereGeometry(0.13, 8, 6), CELL.slate, mount(fr.p.clone().addScaledVector(fr.n, L), fr.n, fr.t))); light(fr.p.clone().addScaledVector(fr.n, L + 0.15), RED, 0.5, 'blink', rnd()); };
  // comms dishes on the engineering back aft of the rollbar, a pair under the saucer's aft quarter, whips on the bridge module and the stern
  [-1, 1].forEach((sd) => { dish(surfFrame(170, sd * 3.4, true), 1.2, 1.1, new THREE.Vector3(sd * 0.5, 1, 0.45)); dish(surfFrame(98, sd * 20, false), 0.95, 0.8, new THREE.Vector3(sd * 0.6, -1, -0.2)); });
  { const fr = surfFrame(176.5, 0, true); dish(fr, 0.75, 2.2, new THREE.Vector3(0, 0.6, 1)); }
  [-1, 1].forEach((sd) => { whip({ p: V3([sd * 5.2, Y(SP(75)) - 0.15, Z(75)]), n: new THREE.Vector3(sd * 0.08, 1, 0), t: new THREE.Vector3(0, 0, 1) }, 2.6); whip(surfFrame(188, sd * 2.2, true), 3.4); });
  // raised sensor pallets: two on the saucer's forward top, two on the engineering back; a third dome low on the stern's back
  const pallet = (fr, w, l, hgt) => { const bx = new THREE.BoxGeometry(w, hgt, l), nn = bx.attributes.normal, uv = bx.attributes.uv;
    for (let k = 0; k < uv.count; k++) { const c = nn.getY(k) > 0.9 ? ruv(R.sensor, uv.getX(k), 1 - uv.getY(k)) : cellUV(CELL.dark); uv.setXY(k, c[0], c[1]); }
    bx.applyMatrix4(mount(fr.p.clone().addScaledVector(fr.n, hgt / 2 - 0.12), fr.n, fr.t)); parts.push(bx); };
  [-1, 1].forEach((sd) => { pallet(surfFrame(21, sd * 11.5, true), 5.2, 3.4, 0.42); pallet(surfFrame(158, sd * 5.0, true), 2.6, 5.0, 0.34); });
  { const fr = surfFrame(194, 0, true); parts.push(stock(new THREE.SphereGeometry(1.0, lite ? 10 : 18, lite ? 4 : 8, 0, Math.PI * 2, 0, Math.PI / 2), CELL.dome, mount(fr.p.clone().addScaledVector(fr.n, -0.05), fr.n, fr.t, [1, 0.5, 1.3]))); }

  // ---------- the shuttlebay: a two-deck bay (Decks 7 and 8) opening through the stern behind clamshell doors ----------
  // The opening follows the transom's outline 1 m in from the hull; the transom is rebuilt round it (scanlines through
  // the hull's own section points, so its edge meets the hull exactly). Behind it the bay runs forward to m BAY.m0.
  const SB = HS[HS.length - 1], ZS = Z(SB.m);
  const BAY = { m0: 168, dA: 21.3, dB: 28.0, inset: 1.0, lip: 0.36, frame: 0.5 };
  BAY.dM = (BAY.dA + BAY.dB) / 2;
  const hwAt = (d) => { const q = hullAtDepth(SB, d); return q ? q.x : 0; }, owAt = (d) => Math.max(0.6, hwAt(d) - BAY.inset);
  const sternUV = (x, d) => ruv(R.stern, 0.5 + x / 24, (d - 15) / 18);
  const BAYD = (() => { const s = []; for (let i = 0; i <= 10; i++) s.push(BAY.dA + (BAY.dB - BAY.dA) * i / 10); return s; })();
  // the opening's outline, going round from the top left: ceiling, starboard wall, floor, port wall; v (0..1) for the bay's art
  // each point: [x, depth, v, which edge: t top, r starboard, b bottom, l port; a corner is the first point of an edge]
  const OPEN = (() => { const o = [], nT = 6, nS = BAYD.length - 1;
    for (let i = 0; i < nT; i++) o.push([-owAt(BAY.dA) + 2 * owAt(BAY.dA) * i / nT, BAY.dA, 0.25 * i / nT, 't', i === 0]);
    for (let i = 0; i < nS; i++) o.push([owAt(BAYD[i]), BAYD[i], 0.25 + 0.25 * i / nS, 'r', i === 0]);
    for (let i = 0; i < nT; i++) o.push([owAt(BAY.dB) - 2 * owAt(BAY.dB) * i / nT, BAY.dB, 0.5 + 0.25 * i / nT, 'b', i === 0]);
    for (let i = 0; i < nS; i++) o.push([-owAt(BAYD[nS - i]), BAYD[nS - i], 0.75 + 0.25 * i / nS, 'l', i === 0]);
    return o; })();
  // the outline pushed out by F: corners diagonally, the top and bottom edges up and down, the side walls sideways
  const openOut = (F) => OPEN.map(([x, d, , e, corner]) => {
    if (corner) return [Math.sign(x) * (Math.abs(x) + F), d + (d < BAY.dM ? -F : F)];
    if (e === 't' || e === 'b') return [x * (owAt(d) + F) / owAt(d), d + (e === 't' ? -F : F)];
    return [Math.sign(x) * (Math.abs(x) + F), d]; });
  { // the transom: a top and a bottom piece across the full width, and a piece either side of the opening
    const side = SB.side.map(([x, d]) => [x, d]), aft = () => new THREE.Vector3(0, 0, 1);
    const piece = (rows, nc, xf) => orient(grid(rows.length, nc, (i, j) => [xf(rows[i], j), Y(rows[i]), ZS], (i, j) => sternUV(xf(rows[i], j), rows[i])), aft);
    const wAt = (d) => { for (const [x, dd] of side) if (Math.abs(dd - d) < 1e-6) return x; return hwAt(d); };
    const rA = owAt(BAY.dA) / hwAt(BAY.dA), rB = owAt(BAY.dB) / hwAt(BAY.dB), fA = [-1, -(1 + rA) / 2, -rA, -rA / 2, 0, rA / 2, rA, (1 + rA) / 2, 1], fB = [-1, -(1 + rB) / 2, -rB, -rB / 2, 0, rB / 2, rB, (1 + rB) / 2, 1];
    parts.push(piece([...side.filter(([, d]) => d < BAY.dA - 0.01).map(([, d]) => d), BAY.dA], 9, (d, j) => fA[j] * wAt(d)));
    parts.push(piece([BAY.dB, ...side.filter(([, d]) => d > BAY.dB + 0.01).map(([, d]) => d)], 9, (d, j) => fB[j] * wAt(d)));
    const mids = [...new Set([...BAYD, ...side.filter(([, d]) => d > BAY.dA && d < BAY.dB).map(([, d]) => d)])].sort((a, b) => a - b);
    [-1, 1].forEach((s) => parts.push(piece(mids, 3, (d, j) => s * (owAt(d) + (wAt(d) - owAt(d)) * j / 2)))); }
  { // the door frame: an armoured lip standing out round the opening (inner wall, face, outer wall)
    const n = OPEN.length, out = openOut(BAY.frame);
    const ring = (a, za, b, zb, want) => parts.push(orient(grid(2, n, (i, j) => { const [x, d] = (i ? b : a)[j]; return [x, Y(d), i ? zb : za]; }, () => cellUV(CELL.dark), true), want));
    const ctr = new THREE.Vector3(0, Y(BAY.dM), 0);
    ring(OPEN, ZS - 0.4, OPEN, ZS + BAY.lip, (c) => ctr.clone().setZ(c.z).sub(c));
    ring(OPEN, ZS + BAY.lip, out, ZS + BAY.lip, () => new THREE.Vector3(0, 0, 1));
    ring(out, ZS + BAY.lip, out, ZS - 0.05, (c) => c.clone().sub(ctr.clone().setZ(c.z)));
    // hinge rods along the top and bottom of the opening
    [BAY.dA - 0.2, BAY.dB + 0.2].forEach((d) => parts.push(stock(new THREE.CylinderGeometry(0.2, 0.2, 2 * owAt(d) + 0.6, 10).rotateZ(Math.PI / 2), CELL.gun, M4(0, Y(d), ZS + BAY.lip + 0.1)))); }
  // the impulse vents sit above the bay on the transom: [x from, x to, depth from, depth to] (the stern art paints them)
  const VENTS = [[-7.4, -0.9, 17.8, 19.6], [0.9, 7.4, 17.8, 19.6]];
  // thruster blocks (the lateral ones at the rim and on the nacelles) as puff sources: [position, outward direction]
  const RCS = [];
  [22, 98, 184].forEach((m) => { const S = secFull(m), dw = (hullSec(m + 0.5).w - hullSec(m - 0.5).w), yaw = Math.atan(dw);
    [-1, 1].forEach((sd) => { const dir = [sd * Math.cos(yaw), 0, -Math.sin(yaw)], x0 = sd * (hullAtDepth(S, SAU.dc).x - 0.25); RCS.push([[x0 + dir[0] * 1.0, Y(SAU.dc), Z(m) + dir[2] * 1.0], dir]); }); });
  [-1, 1].forEach((sd) => { const q = nacPt(sd, NL0 - 14, 0.75); RCS.push([[q[0] + sd * 0.55, q[1], q[2]], [sd, 0, 0]]); });
  // navigation strobes (white double flash) at the bow, the nacelle tails and the stern; red beacons on the pod and the keel
  light([0, Y(SAU.dc), Z(0) - 0.35], WHITE, 1.6, 'strobe', 0);
  [-1, 1].forEach((sd) => light(nacPt(sd, NL0 - 0.8, 0.5, 0.25), WHITE, 1.4, 'strobe', 0.03));
  light([0, Y(HT(199.4)) + 0.3, Z(199.4)], WHITE, 1.3, 'strobe', 0.5);
  light([0, Y(POD.d) + POD.h + 0.3, Z((POD.m[0] + POD.m[1]) / 2)], RED, 1.3, 'beacon', 0);
  light([0, V3(hullBot(165, 0)).y - 0.3, Z(165)], RED, 1.3, 'beacon', 0.5);
  // docking guide lights either side of the bay's mouth, chasing toward it, and the fighter hangar's launch doors (Deck 6)
  [-1, 1].forEach((s) => { for (let k = 0; k < 5; k++) light([s * (owAt(BAY.dM) + BAY.frame + 0.35), Y(BAY.dA + (BAY.dB - BAY.dA) * (k + 0.5) / 5), ZS + BAY.lip + 0.05], AMBER, 0.5, 'chase', k / 5); });
  const HANGAR = [[57.5, 63.2], [64.0, 69.7]], HX = [2.2, 8.6];
  HANGAR.forEach(([a, b]) => [-1, 1].forEach((s) => [a, b].forEach((m) => [HX[0], HX[1]].forEach((x) => light(V3(hullBot(m, s * x)).add(new THREE.Vector3(0, -0.12, 0)), AMBER, 0.4, 'blink', m > a ? 0.5 : 0)))));

  // ---------- service stencils and registry repeats: thin decals, their text drawn by letter() ----------
  // Each stencil gets one 32 px row of R.marks, its width fitted to the text (pale grey, condensed caps).
  const MK = (() => { const c = cnv(8, 8).getContext('2d'); c.font = `600 100px ${DISP}`; const list = {}; let row = 0;
    const add = (key, txt) => { const wd = c.measureText(txt).width + 6 * (txt.length - 1), w = Math.min(R.marks[2], Math.ceil(wd * 0.284 / 0.94) + 6); list[key] = { txt, r: [R.marks[0], R.marks[1] + 32 * row++, w, 32] }; };
    [['dockP', 'DOCKING PORT 4-P'], ['dockS', 'DOCKING PORT 4-S'], ['collar', 'DOCKING COLLAR 10'], ['tr1', 'TRACTOR EMITTER 1'], ['tr2', 'TRACTOR EMITTER 2'],
      ['bay', 'SHUTTLEBAY'], ['h1', 'LAUNCH DOOR 6-1'], ['h2', 'LAUNCH DOOR 6-2'], ['h3', 'LAUNCH DOOR 6-3'], ['h4', 'LAUNCH DOOR 6-4'], ['rcs', 'RCS · KEEP CLEAR'],
      ['ep3', 'ESCAPE PODS · DECK 3'], ['ep4', 'ESCAPE PODS · DECK 4'], ['ep5', 'ESCAPE PODS · DECK 5'], ['ep6', 'ESCAPE PODS · DECK 6']].forEach(([k, t]) => add(k, t));
    return list; })();
  // on a side, centred at (m, depth d), hs metres tall on the surface, read from outside (forward to the left on port)
  const markSide = (reg, mc, dc, hs, sd) => { const len = hs * reg[2] / reg[3], P = (m, d) => V3(hullSidePt(m, d, sd)), dh = hs / (P(mc, dc + 0.1).distanceTo(P(mc, dc - 0.1)) / 0.2);
    decal((a, b) => { const m = sd < 0 ? mc - len / 2 + a * len : mc + len / 2 - a * len; return hullSidePt(m, dc - dh / 2 + b * dh, sd); }, reg, Math.max(4, Math.round(len / 1.2)), 2); };
  // under the hull, read from below with the tops of the letters toward the bow
  const markBot = (reg, mc, xc, hs) => { const w = hs * reg[2] / reg[3]; decal((a, b) => hullBot(mc - hs / 2 + b * hs, xc + (0.5 - a) * w), reg, Math.max(3, Math.round(w / 1.2)), 2); };
  // the depth reached by walking dist metres over the hull's surface from (m, d0), toward the rim (dir -1) or away (+1)
  const walk = (m, d0, dist, sd, dir) => { let d = d0, s = 0, p = V3(hullSidePt(m, d0, sd)); while (s < dist) { const q = hullSidePt(m, d + dir * 0.01, sd); if (!q) break; d += dir * 0.01; s += p.distanceTo(V3(q)); p = V3(q); } return d; };
  [-1, 1].forEach((sd) => {
    // above each rim docking port: its stencil, and the registry above that
    const dl = walk(DOCK_RIM.m, DOCK_RIM.d, 2.9, sd, -1), dr = walk(DOCK_RIM.m, DOCK_RIM.d, 3.7, sd, -1);
    markSide(MK[sd < 0 ? 'dockP' : 'dockS'].r, DOCK_RIM.m, dl, 0.5, sd); markSide(R.reg, DOCK_RIM.m, dr, 0.62, sd);
    // over each lateral thruster block on the rim and the engineering flanks
    [22, 98, 184].forEach((m) => markSide(MK.rcs.r, m, walk(m, SAU.dc, 1.55, sd, -1), 0.4, sd));
    // escape pod rows, labelled along their middle, 1.4 m off the row (above it on the upper hull, below it underneath)
    [[30, 46, 10.0, 'ep3'], [84, 100, 10.0, 'ep3'], [140, 150, 12.8, 'ep3'], [34, 52, 11.0, 'ep4'], [72.5, 96, 17.0, 'ep5'], [72.5, 90, 20.5, 'ep6']].forEach(([a, b, d, k]) => {
      const mc = (a + b) / 2; markSide(MK[k].r, mc, walk(mc, d, 1.45, sd, d < SAU.dc ? -1 : 1), 0.42, sd); });
  });
  markBot(MK.collar.r, DOCK_KEEL.m + 4.6, 0, 0.6); markBot(MK.tr1.r, TRACTORS[0] - 3.1, 0, 0.55); markBot(MK.tr2.r, TRACTORS[1] - 2.6, 0, 0.5);
  HANGAR.forEach(([a, b], i) => [-1, 1].forEach((s) => markBot(MK['h' + (1 + 2 * i + (s > 0 ? 1 : 0))].r, i ? b + 0.75 : a - 0.75, s * (HX[0] + HX[1]) / 2, 0.55)));
  { const reg = MK.bay.r, hs = 0.36, w = hs * reg[2] / reg[3]; decal((a, b) => [-w / 2 + a * w, Y(19.76 + b * hs), ZS], reg, 2, 1); }

  // ---------- paint ----------
  const cw = Math.round(AW * K), chh = Math.round(AH * K), ek = K * 0.5;
  const C = cnv(cw, chh), g = C.getContext('2d'), Hc = cnv(cw, chh), h = Hc.getContext('2d'), E = cnv(Math.round(AW * ek), Math.round(AH * ek)), ge = E.getContext('2d');
  g.scale(K, K); h.scale(K, K); ge.scale(ek, ek);
  g.fillStyle = HULL_PAINT.tones[0][0]; g.fillRect(0, 0, AW, AH); h.fillStyle = 'rgb(200,200,200)'; h.fillRect(0, 0, AW, AH); ge.fillStyle = '#000'; ge.fillRect(0, 0, AW, AH);
  const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const css = (c) => `rgb(${Math.round(Math.max(0, Math.min(255, c[0])))},${Math.round(Math.max(0, Math.min(255, c[1])))},${Math.round(Math.max(0, Math.min(255, c[2])))})`;
  const TONES = HULL_PAINT.tones.map(([c, w]) => [hex(c), w]), TW = TONES.reduce((q, t) => q + t[1], 0);
  const pickTone = () => { let r = rnd() * TW; for (const [c, w] of TONES) { if ((r -= w) <= 0) return c; } return TONES[0][0]; };
  const jit = (c, k) => { const f = 1 + (rnd() - 0.5) * k; return [c[0] * f, c[1] * f, c[2] * f]; };
  const lw = 1 / K; // one device pixel
  let podCount = 0; // escape pods painted (a side)
  // tonal patchwork: large zones of one tone family split into smaller plates, each a touch lighter or darker (colour
  // only: the seams, hatches and relief come from the baked plating patch the shader lays over everything)
  function panels(r, uPx, vPx, big, min, o) {
    o = o || {}; const [x0, y0, W, H] = r, Wm = W / uPx, Hm = H / vPx, leaves = [];
    const split = (x, y, w, hh, tone, depth) => {
      const small = w < min * 1.7 && hh < min * 1.7;
      if (small || (depth >= 2 && rnd() < 0.22) || depth > 6) { leaves.push([x, y, w, hh, tone]); return; }
      const alongU = w / hh > 1.5 ? true : hh / w > 1.5 ? false : rnd() < 0.5, f = 0.28 + rnd() * 0.44;
      const t2 = () => rnd() < 0.12 ? pickTone() : jit(tone, 0.035);
      if (alongU) { const a = w * f; split(x, y, a, hh, t2(), depth + 1); split(x + a, y, w - a, hh, t2(), depth + 1); }
      else { const a = hh * f; split(x, y, w, a, t2(), depth + 1); split(x, y + a, w, hh - a, t2(), depth + 1); }
    };
    for (let y = 0; y < Hm; ) { const bh = big * (0.55 + rnd() * 0.6); for (let x = -rnd() * big; x < Wm; ) { const bw = big * (0.9 + rnd() * 1.4); split(x, y, bw, bh, pickTone(), 0); x += bw; } y += bh; }
    g.save(); g.beginPath(); g.rect(x0, y0, W, H); g.clip(); h.save(); h.beginPath(); h.rect(x0, y0, W, H); h.clip();
    leaves.forEach(([x, y, w, hh, tone]) => {
      const px = x0 + x * uPx, py = y0 + y * vPx, pw = w * uPx, ph = hh * vPx, area = w * hh;
      const red = o.red && area < 10 && area > 2 && rnd() < o.red;
      g.fillStyle = css(red ? jit(hex(HULL_PAINT.oxide), 0.1) : tone); g.fillRect(px, py, pw, ph);
      h.fillStyle = 'rgb(180,180,180)'; h.fillRect(px, py, pw, ph); // flat: relief comes from the baked plating
      // a soft inner gradient gives each plate a little curvature in the light
      if (pw > 6 && ph > 6) { const gr = g.createLinearGradient(px, py, px, py + ph); gr.addColorStop(0, 'rgba(255,255,255,0.035)'); gr.addColorStop(1, 'rgba(0,0,0,0.05)'); g.fillStyle = gr; g.fillRect(px, py, pw, ph); }
    });
    g.restore(); h.restore();
  }
  // weathering: long faint streaks trailing aft (along u), a few darker, a few lighter
  function streaks(r, uPx, vPx, n) {
    const [x0, y0, W, H] = r; g.save(); g.beginPath(); g.rect(x0, y0, W, H); g.clip();
    for (let i = 0; i < n; i++) { const x = x0 + rnd() * W, y = y0 + rnd() * H, len = (3 + rnd() * 18) * uPx, th = (0.15 + rnd() * 0.7) * vPx, dark = rnd() < 0.75;
      const gr = g.createLinearGradient(x, 0, x + len, 0); gr.addColorStop(0, dark ? 'rgba(10,12,12,0.16)' : 'rgba(235,240,240,0.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x, y, len, th); }
    g.restore();
  }
  // fine grain over a region (a small noise tile laid over with overlay blending)
  const grain = (() => { const c = cnv(128, 128), x = c.getContext('2d'), im = x.createImageData(128, 128); for (let i = 0; i < im.data.length; i += 4) { const v = 100 + rnd() * 56; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); return g.createPattern(c, 'repeat'); })();
  const grainOver = (r, a) => { g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = a; g.fillStyle = grain; g.fillRect(...r); g.restore(); };

  // hull region: u = m (20.5 px/m), v = arc length from the top centreline (shared by both sides)
  const HU = R.hull[2] / 200, HV = R.hull[3] / VMAX;
  const hx = (m) => R.hull[0] + m * HU, hy = (arc) => R.hull[1] + arc * HV;
  const secAt = (() => { const cache = new Map(); return (m) => { const k = Math.round(m * 4) / 4; if (!cache.has(k)) cache.set(k, secFull(k)); return cache.get(k); }; })();
  const arcAtX = (S, x, upper) => { const s = S.side; let best = null; for (let i = 1; i < s.length; i++) { const [xa, , aa] = s[i - 1], [xb, , ab] = s[i]; const lo = Math.min(xa, xb), hi = Math.max(xa, xb);
    if (x >= lo && x <= hi && hi > lo) { const a = aa + (ab - aa) * (x - xa) / (xb - xa); if (upper ? (best === null || a < best) : (best === null || a > best)) best = a; } } return best; };
  const arcAtD = (m, d) => { const a = hullAtDepth(secAt(m), d); return a && a.arc; };
  // a band following the hull between two arc functions, filled in colour (and optionally height)
  const band = (ctx, f0, f1, m0, m1, style) => { ctx.beginPath(); let first = true; const pts = [];
    for (let m = m0; m <= m1 + 1e-6; m += 0.5) { const a = f0(m), b = f1(m); if (a == null || b == null) continue; pts.push([m, a, b]); }
    if (!pts.length) return; pts.forEach(([m, a]) => { ctx[first ? 'moveTo' : 'lineTo'](hx(m), hy(a)); first = false; }); pts.slice().reverse().forEach(([m, , b]) => ctx.lineTo(hx(m), hy(b)));
    ctx.closePath(); ctx.fillStyle = style; ctx.fill(); };
  const line = (ctx, f, m0, m1, w, style) => band(ctx, (m) => { const a = f(m); return a == null ? null : a - w / 2; }, (m) => { const a = f(m); return a == null ? null : a + w / 2; }, m0, m1, style);

  panels(R.hull, HU, HV, 18, 1.6, { red: 0 }); // no oxide plates on the hull: the phaser arcs and pod rims carry the accents
  streaks(R.hull, HU, HV, lite ? 420 : 700);
  // shading by place: the underside and the lower flanks a little darker; contact shadow where the spine, arch and spars meet the hull
  for (let m = 0; m < 200; m += 1) { const S = secAt(m + 0.5), a = hullAtDepth(S, S.r1); if (!a) continue; const y0 = hy(a.arc), y1 = hy(S.side[S.side.length - 1][2]);
    const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(6,9,10,0.28)'); g.fillStyle = gr; g.fillRect(hx(m), y0, HU + 0.5, y1 - y0); }
  [1, -1].forEach(() => { for (let m = 49.5; m < 102; m += 0.5) { const S = secAt(m), a = arcAtX(S, spineRing(m)[0][0] - 0.3, true); if (a == null) continue; const gr = g.createLinearGradient(0, hy(a), 0, hy(a + 3.2)); gr.addColorStop(0, 'rgba(5,7,8,0.45)'); gr.addColorStop(1, 'rgba(5,7,8,0)'); g.fillStyle = gr; g.fillRect(hx(m), hy(a), 0.5 * HU + 0.5, 3.2 * HV); } });
  // the window band at the widest line: near-black, edged with slate pinstripes and a bright lip above
  { const r0 = (m) => arcAtD(m, secAt(m).r0 - 0.05), r1 = (m) => arcAtD(m, secAt(m).r1 + 0.05);
    band(g, r0, r1, 0.5, 199.5, HULL_PAINT.band); band(h, r0, r1, 0.5, 199.5, 'rgb(130,130,130)');
    line(g, (m) => arcAtD(m, secAt(m).r0 - 0.5), 1, 199.5, 0.32, HULL_PAINT.slate); line(g, (m) => arcAtD(m, secAt(m).r1 + 0.5), 1, 199.5, 0.32, HULL_PAINT.slate);
    line(g, (m) => arcAtD(m, secAt(m).r0 - 0.85), 1, 199.5, 0.14, 'rgba(210,218,220,0.35)'); }
  // dark sensor strips on the shoulders of the upper hull, the lower sensor array under the bow, the ventral array aft
  { const sh = (k) => (m) => { const S = secAt(m); return arcAtX(S, S.w * k, true); };
    line(g, sh(0.62), 36, 116, 0.7, HULL_PAINT.dark); line(h, sh(0.62), 36, 116, 0.7, 'rgb(120,120,120)'); line(g, sh(0.62), 37, 115, 0.16, 'rgba(111,182,230,0.35)'); line(ge, sh(0.62), 37, 115, 0.16, 'rgba(70,120,160,0.5)');
    line(g, (m) => arcAtD(m, Math.min(secAt(m).b - 0.3, 21.4)), 13, 30, 1.1, HULL_PAINT.dark);
    line(g, (m) => arcAtX(secAt(m), 0.8, false), 102, 116.5, 1.8, HULL_PAINT.dark); line(h, (m) => arcAtX(secAt(m), 0.8, false), 102, 116.5, 1.8, 'rgb(110,110,110)'); }
  // windows: a black band per deck wherever a lived-in or command compartment meets a steep enough stretch of hull side.
  // A deck with a floor plan (SHIPGEO.plans) is skipped: its rooms say where they meet the hull (Deck 3's stop short of
  // the rim, which is service space), so its windows come from the plan in exterior stage 3.
  G.rooms.forEach((rooms, i) => {
    const n = i + 1, dc = 3.5 * (n - 1) + 1.7; if (n < 3 || (G.plans && G.plans[n])) return;
    rooms.forEach(([a, b, name, , kind]) => {
      if (/^Docking/.test(name)) return; // the docking ports' hardware stands there
      const lit = kind === 'l' || kind === 'w' ? 0.82 : kind === 's' ? 0.3 : -1; if (lit < 0) return;
      const row = [];
      for (let m = a + 1.2; m <= b - 1.0; m += 2.2) { const S = secAt(m), hh = hullAtDepth(S, dc); if (!hh || Math.abs(hh.ny) > 0.62 || dc < S.t + 1 || dc > S.b - 1.2) continue;
        // skip where the hull side runs steeply across the ship (the saucer's forward rim): the atlas's squares shear into diamonds there
        const h0 = hullAtDepth(secAt(m - 1), dc), h1 = hullAtDepth(secAt(m + 1), dc); if (!h0 || !h1 || Math.abs(h1.x - h0.x) / 2 > 0.35) continue;
        row.push([m, hh.arc]); }
      if (!row.length) return;
      const f = (m) => { let best = null, bd = 9; row.forEach(([mm, arc]) => { if (Math.abs(mm - m) < bd) { bd = Math.abs(mm - m); best = arc; } }); return best; };
      band(g, (m) => { const q = f(m); return q == null ? null : q - 0.75; }, (m) => { const q = f(m); return q == null ? null : q + 0.75; }, row[0][0] - 1, row[row.length - 1][0] + 1, 'rgba(22,26,28,0.88)');
      row.forEach(([m, arc]) => { const w2 = 0.75 * HU, h2 = 0.9 * HV, x = hx(m) - w2 / 2, y = hy(arc) - h2 / 2; g.fillStyle = HULL_PAINT.glass; g.fillRect(x, y, w2, h2);
        h.fillStyle = 'rgb(95,95,95)'; h.fillRect(x, y, w2, h2);
        if (rnd() < lit) { const c = rnd(); ge.fillStyle = c < 0.12 ? '#B89468' : c < 0.22 ? HULL_PAINT.cool : HULL_PAINT.window; ge.fillRect(x, y, w2, h2); g.fillStyle = 'rgba(255,200,140,0.3)'; g.fillRect(x, y, w2, h2); } });
    });
  });
  // phaser arcs: long continuous strips sweeping round the saucer's top and bottom (bow to aft shoulder, meeting across
  // the bow), and a strip along each upper flank of the engineering body. Dark mount, copper emitter, segment ticks.
  { const phaser = (f, m0, m1) => { line(g, f, m0, m1, 1.15, '#353C3F'); line(h, f, m0, m1, 1.15, 'rgb(205,205,205)');
      line(g, f, m0, m1, 0.5, '#6A4232'); line(g, f, m0 + 0.2, m1, 0.12, 'rgba(255,190,140,0.28)');
      for (let m = m0 + 0.75; m < m1; m += 1.5) { const a = f(m); if (a == null) continue; g.fillStyle = 'rgba(16,18,19,0.75)'; g.fillRect(hx(m), hy(a) - 0.3 * HV, 1.1 * lw + 0.08 * HU, 0.6 * HV); } };
    const sauc = (k, upper) => (m) => { const S = secAt(m); return arcAtX(S, Math.min(S.w, SAU.W) * k, upper); };
    phaser(sauc(0.7, true), 3, 104); phaser(sauc(0.7, false), 3, 104);
    phaser((m) => { const S = secAt(m); return arcAtX(S, S.w * 0.72, true); }, 132, 184); }
  // escape pods: 40 (140 crew, 3 to 4 a pod), 20 a side, in rows by deck beside the crew and officers' quarters:
  // [deck's room from m, to m, depth of the row on the hull, pods a side]. Square hatches, dark frame, oxide-red rim.
  { const PODS = [[30, 46, 10.0, 3], [84, 100, 10.0, 5], [140, 150, 12.8, 2], [34, 52, 11.0, 3], [72.5, 96, 17.0, 4], [72.5, 90, 20.5, 3]];
    let n = 0; const sz = 1.5;
    PODS.forEach(([a, b, d, k]) => { for (let i = 0; i < k; i++) { const m = a + 1.5 + (b - a - 3) * (k === 1 ? 0.5 : i / (k - 1)), arc = arcAtD(m, d); if (arc == null) continue; n++;
      const x = hx(m) - sz / 2 * HU, y = hy(arc) - sz / 2 * HV, w = sz * HU, hh = sz * HV;
      g.fillStyle = '#23292C'; g.fillRect(x - 0.12 * HU, y - 0.12 * HV, w + 0.24 * HU, hh + 0.24 * HV);
      g.fillStyle = '#5A2C26'; g.fillRect(x, y, w, hh); g.fillStyle = '#868D90'; g.fillRect(x + 0.1 * HU, y + 0.1 * HV, w - 0.2 * HU, hh - 0.2 * HV);
      g.fillStyle = '#2A3033'; g.fillRect(x + 0.45 * HU, y + 0.62 * HV, w - 0.9 * HU, 0.26 * HV);
      h.fillStyle = 'rgb(205,205,205)'; h.fillRect(x, y, w, hh); h.fillStyle = 'rgb(150,150,150)'; h.fillRect(x - 0.12 * HU, y - 0.12 * HV, w + 0.24 * HU, 0.12 * HV); } });
    podCount = n; }
  // lateral sensor strips low on the engineering body's flanks (Deck 8), dark with blue glints
  { const f = (m) => arcAtD(m, 27.2); line(g, f, 104, 128, 0.8, HULL_PAINT.dark); line(h, f, 104, 128, 0.8, 'rgb(120,120,120)');
    for (let m = 104.6; m < 127.6; m += 0.9) { const a = f(m); if (a == null) continue; g.fillStyle = 'rgba(111,182,230,0.35)'; g.fillRect(hx(m), hy(a) - 0.12 * HV, 0.35 * HU, 0.24 * HV); ge.fillStyle = 'rgba(70,130,180,0.7)'; ge.fillRect(hx(m), hy(a) - 0.12 * HV, 0.35 * HU, 0.24 * HV); } }
  // the fighter hangar's launch doors in the saucer's belly (Deck 6): two a side, each split down the middle, with a
  // dark recessed frame and oxide caution bars at both ends
  HANGAR.forEach(([a, b]) => { for (let m = a; m < b; m += 0.25) { const S = secAt(m + 0.125), y0 = arcAtX(S, HX[1], false), y1 = arcAtX(S, HX[0], false); if (y0 == null || y1 == null) continue;
    const yi0 = arcAtX(S, HX[1] - 0.3, false), yi1 = arcAtX(S, HX[0] + 0.3, false), ym = arcAtX(S, (HX[0] + HX[1]) / 2, false), inner = m > a + 0.3 && m < b - 0.55, x = hx(m), w = 0.25 * HU + 0.5;
    g.fillStyle = HULL_PAINT.band; g.fillRect(x, hy(y0), w, hy(y1) - hy(y0)); h.fillStyle = 'rgb(120,120,120)'; h.fillRect(x, hy(y0), w, hy(y1) - hy(y0));
    if (!inner) continue;
    const ends = m < a + 1.0 || m > b - 1.25;
    g.fillStyle = ends ? HULL_PAINT.oxide : '#5E6668'; g.fillRect(x, hy(yi0), w, hy(yi1) - hy(yi0)); h.fillStyle = 'rgb(170,170,170)'; h.fillRect(x, hy(yi0), w, hy(yi1) - hy(yi0));
    if (ends) { g.fillStyle = '#8E9496'; for (let k = 0; k < 7; k++) { const q0 = yi0 + (yi1 - yi0) * (k / 7 + ((m * 2) % 1) * 0.07); g.fillRect(x, hy(q0), w, (hy(yi1) - hy(yi0)) / 14); } }
    g.fillStyle = HULL_PAINT.band; g.fillRect(x, hy(ym) - 0.06 * HV, w, 0.12 * HV); h.fillStyle = 'rgb(110,110,110)'; h.fillRect(x, hy(ym) - 0.06 * HV, w, 0.12 * HV); } });
  grainOver(R.hull, lite ? 0.18 : 0.25);

  // spine region: u = m - 50, v = arc from the starboard base over the top to the port base
  const SU = R.spine[2] / 54, SV = R.spine[3] / SVMAX, sx = (m) => R.spine[0] + (m - 49) * SU, sy = (arc) => R.spine[1] + arc * SV;
  panels(R.spine, SU, SV, 9, 1.4, { red: 0.008 }); streaks(R.spine, SU, SV, 80);
  const spineArc = (m, test) => { const r = spineRing(m); for (let i = 1; i < r.length; i++) { const f = test(r[i - 1], r[i]); if (f != null) return r[i - 1][2] + f * (r[i][2] - r[i - 1][2]); } return null; };
  const sideArc = (m, d, sd) => spineArc(m, (p, q) => (sd > 0 ? p[0] > 1.5 && q[0] > 1.5 && p[0] < 12 : p[0] < -1.5 && q[0] < -1.5 && p[0] > -12) && (d - p[1]) * (d - q[1]) <= 0 && p[1] !== q[1] ? (d - p[1]) / (q[1] - p[1]) : null);
  const topArc = (m, x) => spineArc(m, (p, q) => (x - p[0]) * (x - q[0]) <= 0 && p[0] !== q[0] ? (x - p[0]) / (q[0] - p[0]) : null);
  // pinstripes along the spine's top edges and a dark skirt at its foot
  [0.3, 0.7].forEach((k) => { g.beginPath(); SR.forEach((s, i) => { const a = s.r[Math.round((s.r.length - 1) * k)][2]; g[i ? 'lineTo' : 'moveTo'](sx(s.m), sy(a)); }); g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 0.28 * SV; g.stroke(); });
  [1, -1].forEach((sd) => { g.beginPath(); let first = true; SR.forEach((s) => { const a = sideArc(s.m, HT(s.m) - 0.6, sd); if (a != null) { g[first ? 'moveTo' : 'lineTo'](sx(s.m), sy(a)); first = false; } }); g.strokeStyle = HULL_PAINT.band; g.lineWidth = 0.9 * SV; g.stroke(); });
  // the long-range sensor pallet on the spine's sloping front
  { g.fillStyle = HULL_PAINT.band; g.fillRect(sx(50.6), R.spine[1], (54.4 - 50.6) * SU, R.spine[3]); ge.fillStyle = 'rgba(60,110,150,0.6)'; for (let m = 51.0; m < 54.2; m += 0.9) { g.fillStyle = HULL_PAINT.slate; g.fillRect(sx(m), R.spine[1], 0.12 * SU, R.spine[3]); ge.fillRect(sx(m + 0.4), R.spine[1], 0.08 * SU, R.spine[3]); } }
  // Deck 2's real viewports, lit: first officer to port; senior officers' cabins and the wardroom to starboard; the lounge aft
  const spineWin = (m0, m1, d0, d1, sd) => { for (let m = m0; m < m1; m += 0.25) { const a = sideArc(m + 0.125, d0, sd), b = sideArc(m + 0.125, d1, sd); if (a == null || b == null) continue;
    const y = Math.min(a, b), hh = Math.abs(b - a); g.fillStyle = HULL_PAINT.glass; g.fillRect(sx(m), sy(y), 0.25 * SU + 0.5, hh * SV); ge.fillStyle = HULL_PAINT.window; ge.fillRect(sx(m), sy(y), 0.25 * SU + 0.5, hh * SV); } };
  spineWin(73.4, 75.8, 4.8, 6.1, -1); spineWin(69.3, 71.5, 4.8, 6.1, 1); spineWin(75.7, 77.9, 4.8, 6.1, 1); spineWin(82.55, 87.05, 4.75, 6.05, 1);
  for (let m = 96; m < 102; m += 0.1) { const d = SP(m); if (d < 4.65 || d > 6.25) continue; const a = topArc(m, 5.0), b = topArc(m, -5.0); if (a == null || b == null) continue;
    g.fillStyle = HULL_PAINT.glass; g.fillRect(sx(m), sy(Math.min(a, b)), 0.1 * SU + 0.5, Math.abs(b - a) * SV); ge.fillStyle = HULL_PAINT.window; ge.fillRect(sx(m), sy(Math.min(a, b)), 0.1 * SU + 0.5, Math.abs(b - a) * SV); }
  grainOver(R.spine, 0.25);

  // nacelle region: u = metres from the cap, v = round the nacelle from the bottom (0.25 inboard, 0.5 top, 0.75 outboard)
  { const r = R.nac, U = r[2] / NL0, V = r[3], per = 2 * Math.PI * 3.6 * (1 + N.w) / 2, nx = (p) => r[0] + p * U, ny = (v) => r[1] + v * V;
    panels(r, U, V / per, 12, 2.0, { red: 0.006 }); streaks(r, U, V / per, 120);
    // the cap: a ribbed red-orange collector behind a dark collar
    g.fillStyle = '#6A2A1A'; g.fillRect(nx(0), r[1], 5.2 * U, V); { const gr = ge.createLinearGradient(nx(0), 0, nx(5), 0); gr.addColorStop(0, '#E8743A'); gr.addColorStop(0.6, '#B83C18'); gr.addColorStop(1, '#5A1808'); ge.fillStyle = gr; ge.fillRect(nx(0), r[1], 5 * U, V); } 
    g.fillStyle = 'rgba(60,20,12,0.6)'; ge.fillStyle = 'rgba(0,0,0,0.35)'; for (let v = 0; v < 1; v += 1 / 24) { g.fillRect(nx(0), ny(v), 5 * U, 0.008 * V); ge.fillRect(nx(0), ny(v), 5 * U, 0.008 * V); }
    g.fillStyle = HULL_PAINT.band; g.fillRect(nx(5.2), r[1], 1.2 * U, V); h.fillStyle = 'rgb(110,110,110)'; h.fillRect(nx(5.2), r[1], 1.2 * U, V);
    g.fillStyle = HULL_PAINT.dark; g.fillRect(nx(NL0 - 11), r[1], 11 * U, V); g.fillStyle = HULL_PAINT.band; for (let p = NL0 - 9; p < NL0 - 1; p += 1.6) g.fillRect(nx(p), r[1], 0.5 * U, V);
    // the ridge along the top: a dark spine with a slate edge
    g.fillStyle = HULL_PAINT.dark; g.fillRect(nx(6.4), ny(0.5 - 0.02), (NL0 - 18) * U, 0.04 * V); g.fillStyle = HULL_PAINT.slate; g.fillRect(nx(6.4), ny(0.5 - 0.003), (NL0 - 18) * U, 0.006 * V);
    // the long blue grille down the inboard channel, slatted, framed in slate
    const g0 = 0.25 - 0.075, gh = 0.15, p0 = 9, p1 = NL0 - 16;
    g.fillStyle = '#20303C'; g.fillRect(nx(p0 - 0.6), ny(g0 - 0.012), (p1 - p0 + 1.2) * U, (gh + 0.024) * V); ge.fillStyle = HULL_PAINT.grille; ge.fillRect(nx(p0), ny(g0), (p1 - p0) * U, gh * V);
    g.fillStyle = 'rgba(60,120,180,0.35)'; g.fillRect(nx(p0), ny(g0), (p1 - p0) * U, gh * V);
    g.fillStyle = 'rgba(14,22,30,0.6)'; ge.fillStyle = 'rgba(0,0,0,0.5)'; for (let p = p0; p < p1; p += 0.7) { g.fillRect(nx(p), ny(g0), 0.16 * U, gh * V); ge.fillRect(nx(p), ny(g0), 0.16 * U, gh * V); }
    for (let k = 1; k < 4; k++) { ge.fillRect(nx(p0), ny(g0 + gh * k / 4), (p1 - p0) * U, 0.005 * V); }
    g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 3 * lw; g.strokeRect(nx(p0 - 0.6), ny(g0 - 0.012), (p1 - p0 + 1.2) * U, (gh + 0.024) * V);
    h.fillStyle = 'rgb(90,90,90)'; h.fillRect(nx(p0 - 0.6), ny(g0 - 0.012), (p1 - p0 + 1.2) * U, (gh + 0.024) * V);
    // a dark panel run down the outboard face, and a thin glowing line along the lower inboard edge
    g.fillStyle = HULL_PAINT.dark; g.fillRect(nx(14), ny(0.6), (NL0 - 34) * U, 0.05 * V); g.fillStyle = HULL_PAINT.slate; g.fillRect(nx(14), ny(0.65), (NL0 - 34) * U, 0.006 * V);
    ge.fillStyle = 'rgba(90,150,200,0.7)'; ge.fillRect(nx(p0), ny(0.12), (p1 - p0) * U, 0.006 * V);
    grainOver(r, 0.25); }
  // arch rails: u along the rail, v round it (0 outboard, 0.25 outer edge, 0.5 inboard face, 0.75 underside)
  { const r = R.arch; panels(r, r[2] / 70, r[3] / 12, 8, 1.6);
    g.fillStyle = HULL_PAINT.dark; g.fillRect(r[0], r[1] + 0.38 * r[3], r[2], 0.24 * r[3]); g.fillStyle = HULL_PAINT.band; g.fillRect(r[0], r[1] + 0.62 * r[3], r[2], 0.26 * r[3]);
    ge.fillStyle = 'rgba(70,120,160,0.55)'; ge.fillRect(r[0] + r[2] * 0.1, r[1] + 0.497 * r[3], r[2] * 0.8, 0.008 * r[3]);
    g.fillStyle = HULL_PAINT.slate; g.fillRect(r[0], r[1] + 0.24 * r[3], r[2], 0.02 * r[3]); g.fillStyle = HULL_PAINT.oxide; g.fillRect(r[0] + r[2] * 0.47, r[1] + 0.2 * r[3], r[2] * 0.06, 0.1 * r[3]);
    grainOver(r, 0.25); }
  // the weapons pod: u nose to tail, v round it (0 starboard, 0.25 top, 0.5 port, 0.75 underside): a dark dorsal strip,
  // glowing targeting strips along both flanks, magazine hatches on top, darker underside
  { const r = R.spar, px = (q) => r[0] + q * r[2], py = (v) => r[1] + v * r[3];
    panels(r, r[2] / 38, r[3] / 30, 6, 1.3, { red: 0.02 }); streaks(r, r[2] / 38, r[3] / 30, 50);
    g.fillStyle = HULL_PAINT.dark; g.fillRect(px(0.08), py(0.23), r[2] * 0.84, 0.04 * r[3]); g.fillStyle = HULL_PAINT.slate; g.fillRect(px(0.08), py(0.249), r[2] * 0.84, 0.004 * r[3]);
    g.fillStyle = HULL_PAINT.band; g.fillRect(px(0), py(0.62), r[2], 0.26 * r[3]);
    [0, 0.5].forEach((v) => { g.fillStyle = HULL_PAINT.band; g.fillRect(px(0.14), py(v ? v - 0.012 : 0.988), r[2] * 0.72, 0.024 * r[3]); g.fillRect(px(0.14), py(v), r[2] * 0.72, 0.012 * r[3]);
      ge.fillStyle = 'rgba(90,160,220,0.85)'; ge.fillRect(px(0.15), py(v ? v - 0.005 : 0.995), r[2] * 0.7, 0.01 * r[3]); ge.fillRect(px(0.15), py(v), r[2] * 0.7, 0.005 * r[3]); });
    // phaser strips along both upper shoulders, in the saucer arcs' colours (1.15 m mount, copper emitter, segment ticks)
    [0.15, 0.35].forEach((v) => { const mw = 1.15 / 30, ew = 0.5 / 30;
      g.fillStyle = '#353C3F'; g.fillRect(px(0.1), py(v - mw / 2), r[2] * 0.8, mw * r[3]); h.fillStyle = 'rgb(205,205,205)'; h.fillRect(px(0.1), py(v - mw / 2), r[2] * 0.8, mw * r[3]);
      g.fillStyle = '#6A4232'; g.fillRect(px(0.1), py(v - ew / 2), r[2] * 0.8, ew * r[3]); g.fillStyle = 'rgba(255,190,140,0.28)'; g.fillRect(px(0.105), py(v - 0.002), r[2] * 0.79, 0.004 * r[3]);
      g.fillStyle = 'rgba(16,18,19,0.75)'; for (let q = 0.12; q < 0.9; q += 1.5 / 38) g.fillRect(px(q), py(v - 0.3 / 30), Math.max(1.5, 0.08 / 38 * r[2]), 0.6 / 30 * r[3]); });
    for (let k = 0; k < 6; k++) { const x = px(0.22 + k * 0.1), y = py(0.235); g.fillStyle = HULL_PAINT.slate; g.fillRect(x, y - 0.03 * r[3], 0.06 * r[2], 0.03 * r[3]); g.fillStyle = HULL_PAINT.oxide; g.fillRect(x, y - 0.034 * r[3], 0.06 * r[2], 0.004 * r[3]); h.fillStyle = 'rgb(130,130,130)'; h.fillRect(x, y - 0.03 * r[3], 0.06 * r[2], 0.03 * r[3]); }
    grainOver(r, 0.25); }
  // the nacelle pylons: u root to tip, v round them
  { const r = R.turret; panels(r, r[2] / 30, r[3] / 8, 6, 1.4); g.fillStyle = HULL_PAINT.slate; g.fillRect(r[0], r[1] + 0.495 * r[3], r[2], 0.012 * r[3]); g.fillRect(r[0], r[1], r[2], 0.012 * r[3]);
    g.fillStyle = HULL_PAINT.dark; g.fillRect(r[0] + r[2] * 0.88, r[1], r[2] * 0.12, r[3]); g.fillStyle = HULL_PAINT.band; g.fillRect(r[0], r[1] + 0.72 * r[3], r[2] * 0.88, 0.05 * r[3]); grainOver(r, 0.25); }
  // launcher muzzles: an armoured frame round a recessed tube glowing red-orange
  { const r = R.launch, cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2;
    g.fillStyle = HULL_PAINT.dark; g.fillRect(...r); g.fillStyle = HULL_PAINT.band; g.fillRect(r[0] + r[2] * 0.1, r[1] + r[3] * 0.14, r[2] * 0.8, r[3] * 0.72);
    g.fillStyle = '#4A1A10'; g.fillRect(r[0] + r[2] * 0.2, r[1] + r[3] * 0.3, r[2] * 0.6, r[3] * 0.4); g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 3; g.strokeRect(r[0] + r[2] * 0.1, r[1] + r[3] * 0.14, r[2] * 0.8, r[3] * 0.72);
    const gr = ge.createRadialGradient(cx, cy, 0, cx, cy, r[2] * 0.34); gr.addColorStop(0, '#FFD0A0'); gr.addColorStop(0.35, '#F06A2C'); gr.addColorStop(1, '#5A1206');
    ge.fillStyle = gr; ge.fillRect(r[0] + r[2] * 0.2, r[1] + r[3] * 0.3, r[2] * 0.6, r[3] * 0.4);
    h.fillStyle = 'rgb(60,60,60)'; h.fillRect(r[0] + r[2] * 0.2, r[1] + r[3] * 0.3, r[2] * 0.6, r[3] * 0.4); }
  // the stern: shuttlebay doors low, impulse vents high
  { const r = R.stern, sx2 = (x) => r[0] + (0.5 + x / 24) * r[2], sy2 = (d) => r[1] + (d - 15) / 18 * r[3];
    panels(r, r[2] / 24, r[3] / 18, 5, 1.4);
    // a dark skirt round the bay's frame (the opening and its clamshell doors are geometry)
    g.fillStyle = HULL_PAINT.band; { const o = BAY.frame + 0.35; g.beginPath(); openOut(o).forEach(([x, d], i) => g[i ? 'lineTo' : 'moveTo'](sx2(x), sy2(d))); g.closePath(); g.fill(); }
    g.lineWidth = 3; g.strokeStyle = HULL_PAINT.slate;
    [-1, 1].forEach((sd) => { const x0 = sx2(sd < 0 ? -7.4 : 0.9), w2 = 6.5 / 24 * r[2], y = sy2(17.8), h2 = 1.8 / 18 * r[3];
      g.fillStyle = '#5A2C25'; g.fillRect(x0, y, w2, h2); ge.fillStyle = HULL_PAINT.impulse; ge.fillRect(x0, y, w2, h2); ge.fillStyle = 'rgba(0,0,0,0.4)'; for (let k = 1; k < 8; k++) ge.fillRect(x0 + w2 * k / 8, y, 2, h2);
      g.strokeStyle = HULL_PAINT.slate; g.strokeRect(x0, y, w2, h2); }); }
  // thruster blocks: oxide red with dark vent slots
  { const r = R.rcs; g.fillStyle = HULL_PAINT.oxide; g.fillRect(...r); g.fillStyle = HULL_PAINT.band; for (let k = 0; k < 6; k++) g.fillRect(r[0] + r[2] * (0.15 + k * 0.12), r[1] + r[3] * 0.3, r[2] * 0.06, r[3] * 0.4);
    g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 3; g.strokeRect(r[0] + 3, r[1] + 3, r[2] - 6, r[3] - 6); }
  // solid cells for small parts, with their glow
  { const cols = ['#80878A', HULL_PAINT.dark, HULL_PAINT.slate, HULL_PAINT.glass, '#2E4A5E', '#5A2C25', '#20303C', '#A9563A', '#6E7578', '#3A4044', '#2A2F33', '#FFFFFF', '#1C2830', HULL_PAINT.oxide, '#34505E', '#9AA2A4'];
    const glow = { 4: HULL_PAINT.deflector, 5: HULL_PAINT.impulse, 6: HULL_PAINT.grille, 7: HULL_PAINT.cap, 11: '#FFFFFF', 12: '#1E3C52', 14: '#3E7096' }, c = R.cells, s = c[2] / 4;
    cols.forEach((col, k) => { const x = c[0] + (k % 4) * s, y = c[1] + ((k / 4) | 0) * s; g.fillStyle = col; g.fillRect(x, y, s, s); if (glow[k]) { ge.fillStyle = glow[k]; ge.fillRect(x, y, s, s); } }); }

  // the clamshell doors (u across the beam, x -8..8 m; v down the stern, the opening plus 0.4 m): plates, ribs, a dark
  // rim, oxide-and-pale caution bars along the meeting edge with the bay's light leaking through the seam
  const DOOR_D0 = BAY.dA - 0.4, DOOR_DH = BAY.dB - BAY.dA + 0.8, doorUV = (x, d) => ruv(R.door, 0.5 + x / 16, (d - DOOR_D0) / DOOR_DH);
  { const r = R.door, ux = (x) => r[0] + (0.5 + x / 16) * r[2], vy = (d) => r[1] + (d - DOOR_D0) / DOOR_DH * r[3];
    panels(r, r[2] / 16, r[3] / DOOR_DH, 3.2, 0.9, { red: 0 }); streaks(r, r[2] / 16, r[3] / DOOR_DH, 30);
    g.fillStyle = HULL_PAINT.slate; h.fillStyle = 'rgb(140,140,140)';
    for (let d = BAY.dA + 0.5; d < BAY.dB - 0.3; d += 0.85) { if (Math.abs(d - BAY.dM) < 0.6) continue; g.fillRect(r[0], vy(d) - 2, r[2], 4); h.fillRect(r[0], vy(d) - 3, r[2], 6); }
    for (let x = -8, k = 0; x < 8; x += 0.7, k++) { g.fillStyle = k % 2 ? HULL_PAINT.oxide : '#8E9496'; g.fillRect(ux(x), vy(BAY.dM - 0.42), 0.7 / 16 * r[2] + 1, vy(BAY.dM + 0.42) - vy(BAY.dM - 0.42)); }
    g.fillStyle = HULL_PAINT.band; g.fillRect(r[0], vy(BAY.dM) - 4, r[2], 8); h.fillStyle = 'rgb(90,90,90)'; h.fillRect(r[0], vy(BAY.dM) - 4, r[2], 8);
    ge.fillStyle = 'rgba(255,214,160,0.6)'; ge.fillRect(r[0], vy(BAY.dM) - 1.5, r[2], 3);
    // each leaf's rim follows the opening's outline 0.28 m out
    g.strokeStyle = HULL_PAINT.band; g.lineWidth = 0.3 / 16 * r[2]; [[DOOR_D0 + 0.15, BAY.dM - 0.02], [BAY.dM + 0.02, BAY.dB + 0.25]].forEach(([a, b]) => {
      g.beginPath(); for (let d = a; d <= b + 1e-6; d += 0.25) { const dd = Math.min(Math.max(d, BAY.dA), BAY.dB); g[d === a ? 'moveTo' : 'lineTo'](ux(owAt(dd) + 0.12), vy(d)); }
      for (let d = b; d >= a - 1e-6; d -= 0.25) { const dd = Math.min(Math.max(d, BAY.dA), BAY.dB); g.lineTo(ux(-owAt(dd) - 0.12), vy(d)); } g.closePath(); g.stroke(); });
    grainOver(r, 0.25); }
  // docking hatches: a striped outer ring round a hatch with an iris of six leaves and a faint amber ring light
  { const r = R.dock, cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2, R0 = r[2] / 2, P2 = Math.PI * 2;
    g.fillStyle = HULL_PAINT.dark; g.fillRect(...r); h.fillStyle = 'rgb(200,200,200)'; h.fillRect(...r);
    for (let k = 0; k < 16; k++) { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R0, k / 16 * P2, (k + 1) / 16 * P2); g.closePath(); g.fillStyle = k % 2 ? HULL_PAINT.oxide : '#8E9496'; g.fill(); }
    g.beginPath(); g.arc(cx, cy, R0 * 0.86, 0, P2); g.fillStyle = HULL_PAINT.dark; g.fill();
    g.beginPath(); g.arc(cx, cy, R0 * 0.64, 0, P2); g.fillStyle = '#596164'; g.fill(); h.beginPath(); h.arc(cx, cy, R0 * 0.64, 0, P2); h.fillStyle = 'rgb(150,150,150)'; h.fill();
    g.strokeStyle = HULL_PAINT.band; g.lineWidth = 3; for (let k = 0; k < 6; k++) { const a = k / 6 * P2; g.beginPath(); g.moveTo(cx + Math.cos(a) * R0 * 0.1, cy + Math.sin(a) * R0 * 0.1);
      g.quadraticCurveTo(cx + Math.cos(a + 0.6) * R0 * 0.42, cy + Math.sin(a + 0.6) * R0 * 0.42, cx + Math.cos(a + 1.1) * R0 * 0.62, cy + Math.sin(a + 1.1) * R0 * 0.62); g.stroke(); }
    g.beginPath(); g.arc(cx, cy, R0 * 0.1, 0, P2); g.fillStyle = HULL_PAINT.slate; g.fill();
    ge.strokeStyle = 'rgba(255,170,90,0.55)'; ge.lineWidth = 3; ge.beginPath(); ge.arc(cx, cy, R0 * 0.6, 0, P2); ge.stroke(); }
  // sensor pallets: a dark plate in a slate frame with rows of faintly lit slots
  { const r = R.sensor; g.fillStyle = '#2A3034'; g.fillRect(...r); h.fillStyle = 'rgb(160,160,160)'; h.fillRect(...r); g.strokeStyle = HULL_PAINT.slate; g.lineWidth = 6; g.strokeRect(r[0] + 4, r[1] + 4, r[2] - 8, r[3] - 8);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const x = r[0] + r[2] * (0.1 + i * 0.135), y = r[1] + r[3] * (0.14 + j * 0.2);
      g.fillStyle = '#1A2228'; g.fillRect(x, y, r[2] * 0.1, r[3] * 0.12); h.fillStyle = 'rgb(110,110,110)'; h.fillRect(x, y, r[2] * 0.1, r[3] * 0.12);
      ge.fillStyle = 'rgba(80,150,200,0.55)'; ge.fillRect(x + 2, y + r[3] * 0.04, r[2] * 0.1 - 4, r[3] * 0.04); } }

  // relief: the height canvas goes into the colour atlas's alpha (0.55..1, so nothing on the ship is cut away)
  { const ci = g.getImageData(0, 0, cw, chh), hi = h.getImageData(0, 0, cw, chh), c = ci.data, hd = hi.data;
    for (let i = 3; i < c.length; i += 4) c[i] = 140 + (hd[i - 1] * 115 / 255 | 0);
    g.putImageData(ci, 0, 0); }
  // cut-outs drawn after the relief: the deflector dish (glowing rings, transparent round it) and the lettering
  { const r = R.defl, cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2, rr = r[2] / 2 - 4;
    g.clearRect(...r); g.save(); g.translate(cx, cy); g.beginPath(); g.arc(0, 0, rr, 0, Math.PI * 2); g.fillStyle = '#22313B'; g.fill();
    for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(0, 0, rr * (0.92 - k * 0.17), 0, Math.PI * 2); g.strokeStyle = k % 2 ? '#3A5566' : '#5A7C90'; g.lineWidth = rr * 0.05; g.stroke(); } g.restore();
    ge.save(); ge.translate(cx, cy); const gr = ge.createRadialGradient(0, 0, 0, 0, 0, rr); gr.addColorStop(0, '#D8F0FF'); gr.addColorStop(0.35, HULL_PAINT.deflector); gr.addColorStop(0.8, '#244860'); gr.addColorStop(1, '#0A1620');
    ge.fillStyle = gr; ge.beginPath(); ge.arc(0, 0, rr, 0, Math.PI * 2); ge.fill(); ge.restore(); }
  const map = tex(C), emap = tex(E);
  [map, emap].forEach((t) => { t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; });
  // the upper door leaf's registry box, kept clean so a second font can be drawn over it
  const DREG = (() => { const r = R.door, ux = (x) => r[0] + (0.5 + x / 16) * r[2], vy = (d) => r[1] + (d - DOOR_D0) / DOOR_DH * r[3];
    return [ux(-3.4), vy(BAY.dA + 0.55), ux(3.4) - ux(-3.4), vy(BAY.dM - 0.75) - vy(BAY.dA + 0.55)]; })();
  const dregClean = g.getImageData(...DREG.map((v) => Math.round(v * K)));
  function letter(font) {
    const write = (r, txt, col, sp, clear) => {
      if (clear) g.clearRect(r[0], r[1], r[2], r[3]); g.save(); g.fillStyle = col; g.font = `600 100px ${font}`; g.textBaseline = 'alphabetic';
      const wd = g.measureText(txt).width + sp * (txt.length - 1), capH = 0.78 * r[3], k = capH / 88, sxk = Math.min(1, (r[2] * 0.94) / (wd * k));
      g.translate(r[0] + r[2] / 2, r[1] + r[3] / 2 + capH / 2); g.scale(k * sxk, k); let x = -wd / 2;
      for (const ch of txt) { g.fillText(ch, x, 0); x += g.measureText(ch).width + sp; }
      g.restore(); };
    [[R.name, 'USS DEFIANCE'], [R.reg, 'EV-0408']].forEach(([r, txt]) => write(r, txt, HULL_PAINT.letter, 9, true));
    Object.values(MK).forEach(({ r, txt }) => write(r, txt, '#BCC4C6', 6, true));
    g.putImageData(dregClean, Math.round(DREG[0] * K), Math.round(DREG[1] * K)); write(DREG, 'EV-0408', HULL_PAINT.letter, 9, false);
    map.needsUpdate = true;
  }
  letter(DISP);
  if (typeof FontFace !== 'undefined') new FontFace('AntonioHull', 'url(fonts/antonio-600.woff)', { weight: '600' }).load().then((f) => { document.fonts.add(f); letter('AntonioHull'); }).catch(() => {});

  // ---------- assemble ----------
  function merge(list) {
    let nv = 0; const pos = [], nor = [], uvs = [], idx = [];
    list.forEach((q) => { const p = q.attributes.position, n = q.attributes.normal, u = q.attributes.uv;
      for (let k = 0; k < p.count; k++) { pos.push(p.getX(k), p.getY(k), p.getZ(k)); nor.push(n.getX(k), n.getY(k), n.getZ(k)); uvs.push(u.getX(k), u.getY(k)); }
      const ix = q.index.array; for (let k = 0; k < ix.length; k++) idx.push(ix[k] + nv); nv += p.count; q.dispose(); });
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g2.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g2.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g2.setIndex(nv > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1)); g2.computeBoundingSphere(); return g2;
  }
  const shipGeo = merge(parts), letterGeo = merge(decals), sun = (opts.sun || HULL_SUN).clone().normalize();

  // the sun's shadow: the ship's depth seen from the sun, rendered once (the ship and the sun never move relative to each other)
  const shadow = (() => {
    if (typeof renderer === 'undefined' || !renderer || opts.noShadow) return null;
    const size = lite ? 1024 : 2048, bs = shipGeo.boundingSphere, Rr = bs.radius * 1.01;
    const rt = new THREE.WebGLRenderTarget(size, size); rt.depthTexture = new THREE.DepthTexture(size, size); rt.depthTexture.type = THREE.UnsignedIntType;
    const cam = new THREE.OrthographicCamera(-Rr, Rr, Rr, -Rr, 1, Rr * 4); cam.position.copy(bs.center).addScaledVector(sun, Rr * 2); cam.lookAt(bs.center); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const sc = new THREE.Scene(); sc.add(new THREE.Mesh(shipGeo, new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide })));
    const prev = renderer.getRenderTarget(); renderer.setRenderTarget(rt); renderer.clear(); renderer.render(sc, cam); renderer.setRenderTarget(prev);
    const mtx = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(cam.projectionMatrix).multiply(cam.matrixWorldInverse);
    return { tex: rt.depthTexture, mtx, texel: 1 / size, range: Rr * 3 };
  })();

  // warm floodlights on the hull (Deck 2 frame): position, aim point
  const FL = [
    [[0, Y(HT(50)) + 1.2, Z(51)], [0, Y(HT(37)), Z(37)]],                      // the registry on the forward hull, from the spine's front
    [[-10, Y(HT(100)) + 0.6, Z(100)], [-9, 6.5, Z(123)]], [[10, Y(HT(100)) + 0.6, Z(100)], [9, 6.5, Z(123)]], // the rollbar, from the saucer's back
    [[0, Y(HT(108)) + 0.8, Z(108)], [0, Y(POD.d), Z(116)]],                    // the pod's launchers, from the saucer's back
    [[-26, Y(19), Z(138)], [-15, Y(24.5), Z(164)]], [[26, Y(19), Z(138)], [15, Y(24.5), Z(164)]], // the flank lettering, from the rim
  ];
  const uniforms = {
    map: { value: map }, emap: { value: emap }, shadowMap: { value: shadow ? shadow.tex : null }, shadowMtx: { value: shadow ? shadow.mtx : new THREE.Matrix4() },
    shadowOn: { value: shadow ? 1 : 0 }, texel: { value: shadow ? shadow.texel : 0 }, sbias: { value: shadow ? 0.35 / shadow.range : 0 },
    sunDir: { value: sun }, sunCol: { value: new THREE.Color(1.0, 0.95, 0.88).multiplyScalar(opts.sunPower || 1.3) },
    rimDir: { value: HULL_RIM.clone() }, rimCol: { value: new THREE.Color(0.2, 0.27, 0.38) },
    sky: { value: new THREE.Color(0.08, 0.09, 0.11) }, ground: { value: new THREE.Color(0.035, 0.04, 0.048) },
    glow: { value: opts.glow || 2.6 }, bump: { value: lite ? 2.0 : 3.0 }, flood: { value: 1 },
    fPos: { value: FL.map(([p]) => new THREE.Vector3(...p)) }, fDir: { value: FL.map(([p, q]) => new THREE.Vector3(...q).sub(new THREE.Vector3(...p)).normalize()) },
    fCol: { value: new THREE.Color(...HULL_PAINT.flood).multiplyScalar(7) },
    // the fine plating: an 8 m patch modelled and baked in Blender (tools/detail_tile_blender.py), repeated over the hull
    detail: { value: HULL_DETAIL.tex(lite && K < 1) }, detailOn: { value: HULL_DETAIL.isReady(lite && K < 1) ? 1 : 0 }, detailScale: { value: 1 / 8 }, detailStr: { value: 1.0 },
  };
  HULL_DETAIL.onReady(lite && K < 1, (t) => { uniforms.detail.value = t; uniforms.detailOn.value = 1; });
  const paint = new THREE.ShaderMaterial({ uniforms, fog: false,
    vertexShader: `uniform mat4 shadowMtx; varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying vec3 vP; varying vec4 vS; varying vec3 vNo;
void main() { vUv = uv; vP = position; vNo = normal; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
  vS = shadowMtx * vec4(position + normal * 0.22, 1.0); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D map; uniform sampler2D emap; uniform sampler2D shadowMap; uniform float shadowOn; uniform float texel; uniform float sbias;
uniform vec3 sunDir; uniform vec3 sunCol; uniform vec3 rimDir; uniform vec3 rimCol; uniform vec3 sky; uniform vec3 ground;
uniform float glow; uniform float bump; uniform float flood; uniform vec3 fPos[6]; uniform vec3 fDir[6]; uniform vec3 fCol;
uniform sampler2D detail; uniform float detailOn; uniform float detailScale; uniform float detailStr;
varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying vec3 vP; varying vec4 vS; varying vec3 vNo;
// the baked plating patch, projected along the ship's three axes and blended by which way the surface faces
// (a "triplanar" projection: no texture layout needed, the same scale everywhere); returns the bent normal, ao in w
vec4 plating(vec3 N) {
  vec3 w = pow(abs(normalize(vNo)), vec3(6.0)); w /= (w.x + w.y + w.z);
  vec3 p = vP * detailScale, sg = sign(normalize(vNo));
  vec3 tx = texture2D(detail, vec2(p.z * sg.x, p.y)).rgb, ty = texture2D(detail, vec2(p.x, p.z * sg.y)).rgb, tz = texture2D(detail, vec2(-p.x * sg.z, p.y)).rgb;
  vec2 nx = (tx.rg * 2.0 - 1.0) * detailStr, ny = (ty.rg * 2.0 - 1.0) * detailStr, nz = (tz.rg * 2.0 - 1.0) * detailStr;
  // each patch's across (u) and up (v) directions on the ship, so its relief tilts the right way (a whiteout blend)
  vec3 bx = vec3(N.x, N.y + nx.y, N.z + nx.x * sg.x), by = vec3(N.x + ny.x, N.y, N.z + ny.y * sg.y), bz = vec3(N.x - nz.x * sg.z, N.y + nz.y, N.z);
  vec3 Nd = normalize(bx * w.x + by * w.y + bz * w.z);
  float ao = tx.b * w.x + ty.b * w.y + tz.b * w.z;
  return vec4(mix(N, Nd, detailOn), mix(1.0, ao, detailOn));
}
float sunShadow() {
  vec3 c = vS.xyz / vS.w; if (shadowOn < 0.5 || c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0 || c.z > 1.0) return 1.0;
  float s = 0.0; for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) s += (c.z - sbias <= texture2D(shadowMap, c.xy + vec2(float(i), float(j)) * texel * 1.25).r) ? 1.0 : 0.0;
  return s / 9.0;
}
void main() {
  vec4 t = texture2D(map, vUv); if (t.a < 0.5) discard;
  vec3 base = t.rgb, N0 = normalize(vN); if (!gl_FrontFacing) N0 = -N0;
  // relief from the height in the atlas alpha
  vec2 dx = dFdx(vUv), dy = dFdy(vUv); vec2 dH = vec2(texture2D(map, vUv + dx).a - t.a, texture2D(map, vUv + dy).a - t.a) * bump;
  vec3 sx = dFdx(vW), sy = dFdy(vW), r1 = cross(sy, N0), r2 = cross(N0, sx); float det = dot(sx, r1);
  vec3 N = normalize(abs(det) * N0 - sign(det) * (dH.x * r1 + dH.y * r2)); if (dot(N, N0) < 0.2) N = N0;
  // the plating patch, eased off with distance so far-off seams don't crowd into dark lines
  float far = mix(0.4, 1.0, smoothstep(320.0, 90.0, length(cameraPosition - vW)));
  vec4 pl = plating(N); N = normalize(mix(N, pl.xyz, far)); if (dot(N, N0) < 0.2) N = N0;
  float ao = mix(1.0, pl.w, far), seam = smoothstep(0.35, 0.85, ao); base *= mix(0.7, 1.0, seam);
  vec3 V = normalize(cameraPosition - vW);
  float nl = dot(N, sunDir), sh = sunShadow() * smoothstep(-0.05, 0.12, dot(N0, sunDir));
  // panels: lighter plates a touch glossier
  float lum = dot(base, vec3(0.3, 0.55, 0.15)), rough = clamp(0.55 - (lum - 0.2) * 0.9, 0.3, 0.7), a2 = rough * rough * rough * rough;
  vec3 H = normalize(sunDir + V); float nh = max(dot(N, H), 0.0), dd = nh * nh * (a2 - 1.0) + 1.0, D = a2 / (3.14159 * dd * dd);
  float fr = pow(1.0 - max(dot(N, V), 0.0), 5.0); vec3 F0 = mix(vec3(0.05), base, 0.3), F = F0 + (1.0 - F0) * fr;
  vec3 col = base * (sunCol * max(nl, 0.0) * sh + (rimCol * max(dot(N, rimDir), 0.0) + mix(ground, sky, N.y * 0.5 + 0.5)) * ao);
  col += sunCol * D * F * max(nl, 0.0) * sh * 0.22 * seam;
  vec3 R = reflect(-V, N); col += (mix(ground, sky * 2.5, smoothstep(-0.3, 0.9, R.y)) * F * 0.6 + rimCol * F * pow(max(dot(R, rimDir), 0.0), 8.0) * 0.6) * ao;
  for (int i = 0; i < 6; i++) { vec3 L = fPos[i] - vP; float dist = length(L); L /= dist;
    float cone = smoothstep(0.7, 0.95, dot(-L, fDir[i])), att = 1.0 / (1.0 + dist * dist * 0.018);
    col += base * fCol * max(dot(N, L), 0.0) * cone * att * flood * ao; }
  col += texture2D(emap, vUv).rgb * glow;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}` });
  const decalPaint = paint.clone(); decalPaint.uniforms = uniforms; Object.assign(decalPaint, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });

  const root = new THREE.Group(); root.name = 'Exterior';
  const ship = new THREE.Mesh(shipGeo, paint); ship.name = 'Exterior hull'; root.add(ship);
  const lettering = new THREE.Mesh(letterGeo, decalPaint); lettering.name = 'Exterior lettering'; lettering.renderOrder = 1; root.add(lettering);
  // floods go dark at red alert (the lounge board says so)
  ship.onBeforeRender = () => { uniforms.flood.value = typeof state !== 'undefined' && state.alert === 'red' ? 0 : 1; };
  // running lights: red to port and green to starboard at the widest beam and on each nacelle's outboard side
  { const halo = (() => { const c = cnv(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return tex(c); })();
    const lights = new THREE.Group(); lights.name = 'Running lights'; root.add(lights); root.userData.runningLights = lights;
    const S = secAt(58);
    [[-1, 0xff4636], [1, 0x48ff74]].forEach(([sd, col]) => {
      [[sd * (S.w + 0.15), Y(SAU.dc), Z(58)], nacPt(sd, 10, 0.75, 0.15)].forEach((p) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
        s.position.set(...p); s.scale.setScalar(2.6); lights.add(s);
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshBasicMaterial({ color: col, toneMapped: false, fog: false })); b.position.set(...p); lights.add(b); });
    }); }
  // ---------- stage 2b: the moving parts ----------
  const soft = (inner, outer) => { const c = cnv(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, inner); gr.addColorStop(0.3, outer); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return tex(c); };
  const glowTex = soft('rgba(255,255,255,1)', 'rgba(255,255,255,0.4)'), puffTex = soft('rgba(255,255,255,0.6)', 'rgba(255,255,255,0.22)'), plumeTex = soft('rgba(255,255,255,1)', 'rgba(255,255,255,0.32)');
  const addSprite = (map, col, blend) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: col, transparent: true, opacity: 0, blending: blend || THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false })); sp.visible = false; root.add(sp); return sp; };
  // the clamshell doors: an upper leaf hinged along the top of the opening and a lower one along its foot, both bowed
  // outward; opening, they swing aft to lie level (the upper as an awning, the lower as an apron). Their vertices are
  // turned on the CPU so the paint shader (which works in the ship's own frame) still lines up shadows and floods.
  const doorMat = paint.clone(); doorMat.uniforms = uniforms; doorMat.side = THREE.DoubleSide;
  const ZH = ZS + BAY.lip + 0.12;
  const leaf = (d0, d1, hingeD, sign) => { const rows = lite ? 6 : 9, cols = lite ? 9 : 15;
    const pt = (i, j) => { const d = d0 + (d1 - d0) * i / (rows - 1), W = owAt(Math.min(Math.max(d, BAY.dA), BAY.dB)) + 0.28, x = -W + 2 * W * j / (cols - 1), q = x / W; return [x, d, ZH + 0.38 * (1 - q * q)]; };
    const geo = orient(grid(rows, cols, (i, j) => { const [x, d, z] = pt(i, j); return [x, Y(d), z]; }, (i, j) => { const [x, d] = pt(i, j); return doorUV(x, d); }), () => new THREE.Vector3(0, 0, 1));
    const m = new THREE.Mesh(geo, doorMat); m.frustumCulled = false; m.name = 'Shuttlebay door leaf'; root.add(m);
    return { m, base: geo.attributes.position.array.slice(), nb: geo.attributes.normal.array.slice(), yh: Y(hingeD), sign }; };
  const LEAVES = [leaf(BAY.dA - 0.25, BAY.dM - 0.02, BAY.dA - 0.25, -1), leaf(BAY.dM + 0.02, BAY.dB + 0.25, BAY.dB + 0.25, 1)];
  const setLeaves = (k) => LEAVES.forEach((L) => { const a = L.sign * k * Math.PI * 0.49, c = Math.cos(a), s2 = Math.sin(a), P = L.m.geometry.attributes.position, Nn = L.m.geometry.attributes.normal;
    for (let v = 0; v < P.count; v++) { const dy = L.base[v * 3 + 1] - L.yh, dz = L.base[v * 3 + 2] - ZH, ny = L.nb[v * 3 + 1], nz = L.nb[v * 3 + 2];
      P.array[v * 3 + 1] = L.yh + dy * c - dz * s2; P.array[v * 3 + 2] = ZH + dy * s2 + dz * c; Nn.array[v * 3 + 1] = ny * c - nz * s2; Nn.array[v * 3 + 2] = ny * s2 + nz * c; }
    P.needsUpdate = true; Nn.needsUpdate = true; });
  // the bay behind them: the opening's outline carried forward to m BAY.m0, lit; a back wall with the flight control
  // booth's window on the gallery level; a runabout and two utility shuttles on the Deck 8 floor, noses to the doors
  const bay = new THREE.Group(); bay.name = 'Shuttlebay'; bay.visible = false; root.add(bay);
  { const W = lite ? 512 : 1024, H = lite ? 256 : 512, c = cnv(W, H), x = c.getContext('2d'), L = 200 - BAY.m0, ux = (m) => (m - BAY.m0) / L * W, vy = (v) => v * H;
    x.fillStyle = '#5F676A'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#4E575A'; x.fillRect(0, 0, W, vy(0.25)); // ceiling, with rows of light panels
    for (let m = BAY.m0 + 2; m < 199; m += 4) { x.fillStyle = '#F2DEC0'; x.fillRect(ux(m), vy(0.06), ux(m + 2.2) - ux(m), vy(0.05)); x.fillRect(ux(m), vy(0.14), ux(m + 2.2) - ux(m), vy(0.05)); }
    x.fillStyle = '#6C7375'; x.fillRect(0, vy(0.5), W, vy(0.25)); // the floor: a pale deck, an amber centre line, landing squares, lit edges
    x.fillStyle = '#E0A050'; for (let m = BAY.m0 + 1; m < 199; m += 2) x.fillRect(ux(m), vy(0.622), ux(m + 1.1) - ux(m), vy(0.006));
    x.strokeStyle = '#E8E2D2'; x.lineWidth = 3; [176, 186].forEach((m) => x.strokeRect(ux(m - 3.5), vy(0.545), ux(m + 3.5) - ux(m - 3.5), vy(0.16)));
    x.fillStyle = '#FFE2B0'; x.fillRect(0, vy(0.503), W, vy(0.008)); x.fillRect(0, vy(0.739), W, vy(0.008));
    [0.25, 0.75].forEach((v0) => { // the walls: frames, the gallery catwalk at the Deck 7/8 line with warm lit windows above it, a light strip below
      x.fillStyle = '#4A5255'; for (let m = BAY.m0 + 3; m < 199; m += 3) x.fillRect(ux(m), vy(v0), 3, vy(0.25));
      const up = v0 < 0.5, cat = v0 + 0.25 * (up ? 24.5 - BAY.dA : BAY.dB - 24.5) / (BAY.dB - BAY.dA); // the starboard wall runs down from the ceiling, the port wall up from the floor
      x.fillStyle = '#3C4448'; x.fillRect(0, vy(cat) - 4, W, 8); x.fillStyle = '#FFD9A0'; x.fillRect(0, vy(cat) + (up ? 6 : -9), W, 3);
      x.fillStyle = '#F3D6A8'; for (let m = BAY.m0 + 1.5; m < 197; m += 3) x.fillRect(ux(m), vy(up ? v0 + 0.03 : cat + 0.02), ux(m + 1.6) - ux(m), vy(0.05));
      x.fillStyle = '#FFF4E2'; x.fillRect(0, vy(up ? 0.47 : 0.78), W, vy(0.008)); });
    const bmat = new THREE.MeshBasicMaterial({ map: tex(c), fog: false }), n = OPEN.length, ctr = new THREE.Vector3(0, Y(BAY.dM), 0);
    const tg = orient(grid(4, n + 1, (i, j) => { const [ox, d] = OPEN[j % n], m = 200 - (200 - BAY.m0) * i / 3; return [ox, Y(d), Z(m)]; },
      (i, j) => [1 - i / 3, 1 - (j < n ? OPEN[j][2] : 1)]), (q) => ctr.clone().setZ(q.z).sub(q));
    bay.add(new THREE.Mesh(tg, bmat));
    const bw = cnv(256, 128), bx = bw.getContext('2d'); bx.fillStyle = '#5A6265'; bx.fillRect(0, 0, 256, 128); bx.fillStyle = '#3C4448'; bx.fillRect(0, 50, 256, 6);
    bx.fillStyle = '#FFE0B0'; bx.fillRect(70, 14, 116, 26); bx.fillStyle = '#C89060'; for (let k = 1; k < 4; k++) bx.fillRect(70 + k * 29, 14, 2, 26);
    bx.fillStyle = '#454D50'; bx.fillRect(90, 70, 76, 58); bx.fillStyle = '#E0A050'; bx.fillRect(90, 66, 76, 4);
    const pos = [0, Y(BAY.dM), Z(BAY.m0)], uv = [0.5, 0.5], idx = []; OPEN.forEach(([ox, d], j) => { pos.push(ox, Y(d), Z(BAY.m0)); uv.push(0.5 + ox / 16, 1 - (d - BAY.dA) / (BAY.dB - BAY.dA)); idx.push(0, 1 + j, 1 + (j + 1) % n); });
    const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); wg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); wg.setIndex(idx);
    orient(wg, () => new THREE.Vector3(0, 0, 1)); bay.add(new THREE.Mesh(wg, new THREE.MeshBasicMaterial({ map: tex(bw), fog: false })));
    // shuttles: tapered hulls in the bay's light (vertex colours lit from above), with a dark canopy band and side pods
    const craft = (len, wid, hgt, m, xo) => { const gb = new THREE.BoxGeometry(wid, hgt, len, 1, 1, 1).toNonIndexed(), P = gb.attributes.position;
      for (let v = 0; v < P.count; v++) { if (P.getZ(v) > 0) { P.setX(v, P.getX(v) * 0.55); if (P.getY(v) > 0) P.setY(v, P.getY(v) - hgt * 0.45); } }
      gb.computeVertexNormals(); const Nn = gb.attributes.normal, col = [];
      for (let v = 0; v < P.count; v++) { const l = 0.3 + 0.42 * Math.max(0, Nn.getY(v)) + 0.1 * Math.abs(Nn.getX(v)) + 0.08 * Math.max(0, Nn.getZ(v)); col.push(0.62 * l, 0.65 * l, 0.66 * l); }
      gb.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      const g2 = new THREE.Group(); g2.position.set(xo, Y(BAY.dB) + hgt / 2 + 0.25, Z(m)); bay.add(g2);
      g2.add(new THREE.Mesh(gb, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })));
      const dk = new THREE.MeshBasicMaterial({ color: 0x23292c, fog: false });
      const cb = new THREE.Mesh(new THREE.BoxGeometry(wid * 0.62, hgt * 0.16, len * 0.08), dk); cb.position.set(0, hgt * 0.18, len * 0.28); g2.add(cb);
      [-1, 1].forEach((s) => { const pd = new THREE.Mesh(new THREE.BoxGeometry(wid * 0.16, hgt * 0.3, len * 0.66), new THREE.MeshBasicMaterial({ color: 0x5a6265, fog: false })); pd.position.set(s * wid * 0.56, -hgt * 0.1, -len * 0.08); g2.add(pd); }); };
    craft(10, 3.9, 2.6, 187, 0); [-1, 1].forEach((s) => craft(5.4, 2.6, 2.1, 175.5, s * 2.15)); }
  const bayGlow = addSprite(glowTex, 0xffe2b8); bayGlow.position.set(0, Y(BAY.dM), ZS + 2.0); bayGlow.scale.set(13, 8, 1);
  // impulse: each vent's glow brightens with speed, and a soft red-orange plume trails aft, longer the faster she goes
  const ventTex = (() => { const c = cnv(64, 32), x = c.getContext('2d'), gr = x.createRadialGradient(32, 16, 0, 32, 16, 32); gr.addColorStop(0, 'rgba(255,230,200,1)'); gr.addColorStop(0.5, 'rgba(255,140,90,0.7)'); gr.addColorStop(1, 'rgba(255,80,40,0.15)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 32); return tex(c); })();
  const PLN = lite ? 6 : 12, IMP = VENTS.map(([x0, x1, d0, d1]) => {
    const vm = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, d1 - d0), new THREE.MeshBasicMaterial({ map: ventTex, color: 0xff7a4a, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
    vm.position.set((x0 + x1) / 2, Y((d0 + d1) / 2), ZS + 0.07); root.add(vm);
    const plume = []; for (let i = 0; i < PLN; i++) plume.push(addSprite(plumeTex, i < 2 ? 0xff9a64 : i < 5 ? 0xff6a38 : 0xe8462a));
    return { vm, plume, c: [(x0 + x1) / 2, Y((d0 + d1) / 2)], w: x1 - x0, h: d1 - d0 }; });
  // thruster puffs: short-lived soft white jets from the thruster blocks
  const PUFFS = []; for (let i = 0; i < 12; i++) PUFFS.push(addSprite(puffTex, 0xdfe8f0, THREE.NormalBlending));
  const puff = (i, age) => { const src = RCS[i]; if (!src) return; const sp = PUFFS.find((q) => !q.visible); if (!sp) return;
    const dir = new THREE.Vector3(...src[1]).normalize(); sp.position.set(...src[0]); sp.userData = { v: dir.multiplyScalar(4.5 + Math.random()), age: 0, life: 0.8 + Math.random() * 0.3 }; sp.visible = true;
    if (age) { sp.position.addScaledVector(sp.userData.v, age); sp.userData.age = age; } };
  // small lights: one draw call for every strobe, beacon, guide light and tip light, blinking in the vertex shader
  const LPTS = (() => { const n = LT.length, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), inf = new Float32Array(n * 3);
    LT.forEach((l, i) => { pos.set(l.p, i * 3); col.set([l.col.r, l.col.g, l.col.b], i * 3); inf.set([l.size, l.kind, l.ph], i * 3); });
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); gg.setAttribute('col', new THREE.BufferAttribute(col, 3)); gg.setAttribute('info', new THREE.BufferAttribute(inf, 3));
    const mat = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 }, px: { value: 600 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec3 col; attribute vec3 info; uniform float time; uniform float px; varying vec3 vC; varying float vA;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); float k = info.y, ph = info.z, a = 1.0;
  if (k > 0.5 && k < 1.5) { float c = fract(time / 1.7 + ph); a = step(c, 0.035) + step(0.13, c) * step(c, 0.165); }          // strobe: a double flash
  else if (k > 1.5 && k < 2.5) { a = 0.08 + 0.92 * pow(max(0.0, sin(6.2832 * (time / 1.4 + ph))), 4.0); }                   // beacon: a slow pulse
  else if (k > 2.5 && k < 3.5) { float c = fract(time * 0.7 - ph); a = 0.15 + 0.85 * exp(-c * 9.0); }                       // guide lights: a chase
  else if (k > 3.5) { a = 0.2 + 0.8 * step(0.55, fract(time / 2.2 + ph)); }                                                    // tip lights: a slow blink
  vA = a; vC = col; gl_PointSize = clamp(info.x * 2.4 * px / -mv.z, 2.0, 96.0); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec3 vC; varying float vA;
void main() { vec2 q = gl_PointCoord * 2.0 - 1.0; float r = dot(q, q); if (r > 1.0) discard; float core = smoothstep(0.1, 0.0, r), halo = pow(1.0 - r, 3.0) * 0.55;
  gl_FragColor = vec4(vC * (core * 1.6 + halo) * vA, 1.0); }` });
    const pts = new THREE.Points(gg, mat); pts.name = 'Hull lights'; pts.frustumCulled = false; const v2 = new THREE.Vector2();
    pts.onBeforeRender = (r, sc, cam) => { r.getDrawingBufferSize(v2); mat.uniforms.px.value = cam.projectionMatrix.elements[5] * v2.y / 2; }; root.add(pts); return pts; })();
  // per frame: doors toward state.bayDoors (3 s), plume toward the speed, idle puffs every few seconds and a burst when the speed order changes
  const DY = { door: 0, shown: -1, plume: 0, puffT: 2.5, lastSpeed: null };
  const ease = (k) => k * k * (3 - 2 * k), sm = (a, b, v) => { const q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q); };
  const PAIRS = [[1, 4], [0, 5], [2, 5], [3, 4], [6, 7]];
  root.userData.update = (dt, t) => {
    const st = typeof state !== 'undefined' ? state : {}, sp = typeof cur !== 'undefined' ? cur.speed : 0;
    DY.door += Math.max(-dt / 3, Math.min(dt / 3, (st.bayDoors ? 1 : 0) - DY.door));
    if (DY.door !== DY.shown) { DY.shown = DY.door; setLeaves(ease(DY.door)); bay.visible = DY.door > 0.002; bayGlow.visible = bay.visible; bayGlow.material.opacity = 0.14 * ease(DY.door); }
    DY.plume += (sm(0.2, 12, sp) * (1 - sm(80, 300, sp)) - DY.plume) * Math.min(1, dt * 1.5);
    const k = DY.plume, fl = 1 + 0.06 * Math.sin(t * 31) + 0.04 * Math.sin(t * 57);
    IMP.forEach((I) => { I.vm.material.opacity = (0.22 + 0.78 * k) * fl; const L = 1.5 + 13 * k;
      I.plume.forEach((s, i) => { const f = (i + 0.5) / I.plume.length; s.visible = k > 0.01; s.position.set(I.c[0], I.c[1], ZS + 0.4 + L * f);
        const sz = I.w * (0.42 + 0.4 * Math.sin(Math.PI * Math.min(1, f * 1.6))) * (1 - 0.4 * f) * (0.75 + 0.25 * k); s.scale.set(sz, sz * 0.6, 1); s.material.opacity = Math.min(1, k * 0.95 * Math.pow(1 - f, 1.1) * fl); }); });
    DY.puffT -= dt; if (DY.puffT <= 0) { PAIRS[(Math.random() * PAIRS.length) | 0].forEach((i) => puff(i)); DY.puffT = 3 + Math.random() * 6; }
    if (st.speed !== DY.lastSpeed) { if (DY.lastSpeed != null) [0, 1, 2, 3, 4, 5].forEach((i) => puff(i)); DY.lastSpeed = st.speed; }
    const dp = Math.min(dt, 0.05); PUFFS.forEach((s) => { if (!s.visible) return; const u = s.userData; u.age += dp; s.position.addScaledVector(u.v, dp);
      if (u.age >= u.life) { s.visible = false; return; } const q = u.age / u.life; s.scale.setScalar(0.5 + u.age * 3.2); s.material.opacity = 0.24 * Math.pow(1 - q, 1.6); });
    LPTS.material.uniforms.time.value = t;
  };
  root.userData.puff = puff; root.userData.lights = LT.length; root.userData.lite = lite; root.userData.atlasScale = K;
  root.userData.docks = DOCKS; root.userData.bay = { m0: BAY.m0, dA: BAY.dA, dB: BAY.dB, door: () => DY.door, leaves: LEAVES.map((L) => L.m) };
  root.userData.plumeLength = () => IMP[0].plume[IMP[0].plume.length - 1].position.z - ZS;
  root.userData.update(0, 0);
  root.traverse((o) => { o.userData.noPick = true; });
  { let n = 0; root.traverse((o) => { if (o.isMesh) n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; }); root.userData.triangles = n; }
  root.userData.paint = paint; root.userData.shadow = !!shadow; root.userData.escapePods = podCount * 2;
  return root;
}

````

---

## `js/sim.js`

````javascript
// USS Defiance · sim.js
// The ship as a working system: power, shields by arc, weapons, damage zones and repair teams.
// It advances on a fixed tick (a small time step, 10 per second), separate from drawing, so it keeps
// running when no screen is redrawn. Screens and panels only read `sim` and call the order functions.
// It never touches the page: crew messages go into sim.events, which ui.js turns into toasts.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- tuning table: every starting number from the design doc lives here ----------
const SIM = {
  tick: 0.1, maxCatchUp: 1,
  reactor: 100, life: 5,
  presets: {
    balanced: { weapons: 30, shields: 30, engines: 25, sensors: 10 },
    attack: { weapons: 45, shields: 25, engines: 15, sensors: 10 },
    defend: { weapons: 20, shields: 45, engines: 20, sensors: 10 },
    speed: { weapons: 15, shields: 25, engines: 45, sensors: 10 },
  },
  effCap: 1.5,
  reactorFloor: 0.4, // reactor output with the engines zone at 0%, as a share of full
  emergency: { boost: 0.4, time: 20, penalty: 0.2, penaltyTime: 30 },
  shield: { max: 100, regen: 2, rise: 4, reinforced: 140, others: 85 },
  beam: { charge: 4 },
  torp: { perBay: 12, reload: 6 },
  repair: { rate: 1, cap: 80, move: 10, teams: 3 },
  breach: 20,
  nacelleWarpMin: 25,
  // where a hit lands, by the arc it comes through: [zone, weight]
  hitZones: {
    fwd: [['prow', 0.5], ['dorsal', 0.25], ['ventral', 0.25]],
    port: [['port', 0.55], ['portNac', 0.25], ['dorsal', 0.2]],
    stbd: [['stbd', 0.55], ['stbdNac', 0.25], ['dorsal', 0.2]],
    aft: [['engines', 0.5], ['portNac', 0.15], ['stbdNac', 0.15], ['ventral', 0.2]],
  },
  drill: { time: 60, gapMin: 2, gapMax: 3.5, dmgMin: 12, dmgMax: 26, arcs: [['fwd', 0.4], ['port', 0.2], ['stbd', 0.2], ['aft', 0.2]] },
};
const ARCS = ['fwd', 'port', 'stbd', 'aft'];
const ARC_NAMES = { fwd: 'Forward', port: 'Port', stbd: 'Starboard', aft: 'Aft' };
const ZONES = [
  { id: 'prow', name: 'Prow', short: 'PROW' },
  { id: 'dorsal', name: 'Dorsal', short: 'DORSAL' },
  { id: 'ventral', name: 'Ventral', short: 'VENTRAL' },
  { id: 'port', name: 'Port hull', short: 'PORT HULL' },
  { id: 'stbd', name: 'Starboard hull', short: 'STBD HULL' },
  { id: 'portNac', name: 'Port nacelle', short: 'PORT NAC' },
  { id: 'stbdNac', name: 'Starboard nacelle', short: 'STBD NAC' },
  { id: 'engines', name: 'Engines', short: 'ENGINES' },
];
const ZONE_NAME = Object.fromEntries(ZONES.map((z) => [z.id, z.name]));
const SYS_KEYS = ['weapons', 'shields', 'engines', 'sensors'];

let sim = null;
function simReset() {
  sim = {
    preset: 'balanced', alloc: Object.assign({}, SIM.presets.balanced),
    emergency: { boost: 0, penalty: 0 },
    shields: { up: 0, reinforce: null, arc: { fwd: 100, port: 100, stbd: 100, aft: 100 } },
    beams: { dorsal: 0, ventral: 0 },
    bays: [{ torps: SIM.torp.perBay, reload: 0, ready: false }, { torps: SIM.torp.perBay, reload: 0, ready: false }],
    zones: Object.fromEntries(ZONES.map((z) => [z.id, 100])),
    teams: Array.from({ length: SIM.repair.teams }, () => ({ at: null, to: null, t: 0 })),
    breach: null, lost: false,
    drill: { on: false, t: 0, next: 0, hits: 0 },
    hitLog: [], events: [], acc: 0, time: 0,
  };
  return sim;
}
simReset();

function say(who, text) { sim.events.push({ who, text }); }
function wpick(list) { let r = Math.random() * list.reduce((a, [, w]) => a + w, 0); for (const [v, w] of list) { r -= w; if (r <= 0) return v; } return list[list.length - 1][0]; }

// ---------- derived values ----------
function zoneFactor(id) { const z = sim.zones[id]; return z <= 0 ? 0 : z < 50 ? 0.5 : 1; }
function zoneStatus(id) { const z = sim.zones[id]; return z <= 0 ? 'off' : z < 50 ? 'alert' : z < 90 ? 'warn' : 'ok'; }
function hullIntegrity() { return ZONES.reduce((a, z) => a + sim.zones[z.id], 0) / ZONES.length; }
function reactorOut() {
  const z = sim.zones.engines / 100, base = SIM.reactor * (SIM.reactorFloor + (1 - SIM.reactorFloor) * z);
  return sim.emergency.penalty > 0 ? base * (1 - SIM.emergency.penalty) : base;
}
function eff(sys) { return Math.min(SIM.effCap, (sim.alloc[sys] * reactorOut() / SIM.reactor) / SIM.presets.balanced[sys]); }
function shieldMax(arc) { const r = sim.shields.reinforce; return r ? (r === arc ? SIM.shield.reinforced : SIM.shield.others) : SIM.shield.max; }
function shieldNow(arc) { return sim.shields.arc[arc] * sim.shields.up; }
function shieldRegen(arc) {
  const emit = arc === 'port' ? zoneFactor('port') : arc === 'stbd' ? zoneFactor('stbd') : 1;
  return SIM.shield.regen * eff('shields') * emit * (sim.emergency.boost > 0 ? 1 + SIM.emergency.boost : 1);
}
function simCanWarp() { return sim.zones.portNac > SIM.nacelleWarpMin || sim.zones.stbdNac > SIM.nacelleWarpMin; }
function beamStrength(which) { return zoneFactor(which) * Math.min(1, eff('weapons')); }
function torpsLeft() { return sim.bays[0].torps + sim.bays[1].torps; }
function maxImpulse() { return zoneFactor('engines') * Math.min(1, eff('engines')); }
function worstZone(exclude) {
  const ex = new Set(exclude || []);
  return ZONES.filter((z) => !ex.has(z.id) && sim.zones[z.id] < SIM.repair.cap).sort((a, b) => sim.zones[a.id] - sim.zones[b.id])[0] || null;
}
function simStats() { return { hull: hullIntegrity(), reactor: reactorOut(), shields: ARCS.map(shieldNow), torps: torpsLeft() }; }

// ---------- orders ----------
function setPreset(name) { if (!SIM.presets[name]) return; sim.preset = name; sim.alloc = Object.assign({}, SIM.presets[name]); }
function emergencyPower() {
  if (sim.emergency.boost > 0 || sim.emergency.penalty > 0) return false;
  sim.emergency.boost = SIM.emergency.time; return true;
}
function reinforceArc(arc) {
  sim.shields.reinforce = arc || null;
  ARCS.forEach((a) => { sim.shields.arc[a] = Math.min(sim.shields.arc[a], shieldMax(a)); });
}
function sendTeam(i, zoneId) {
  const tm = sim.teams[i]; if (!tm || !sim.zones.hasOwnProperty(zoneId)) return false;
  if (tm.at === zoneId || tm.to === zoneId) return false;
  tm.at = null; tm.to = zoneId; tm.t = SIM.repair.move; return true;
}
function startDrill() {
  sim.drill = { on: true, t: SIM.drill.time, next: 1.5, hits: 0 };
  sim.events.push({ alert: 'red' });
  say('Tactical', 'Combat drill. Simulated fire incoming for sixty seconds.');
}
function stopDrill(quiet) { if (!sim.drill.on) return; sim.drill.on = false; if (!quiet) say('Tactical', `Drill complete. ${sim.drill.hits} hits taken, hull at ${Math.round(hullIntegrity())}%.`); }

// A hit through one arc: the shield on that arc absorbs what it can, the rest damages a zone behind it.
function simHit(arc, dmg) {
  const cap = shieldNow(arc), absorbed = Math.min(cap, dmg), rest = dmg - absorbed;
  if (sim.shields.up > 0 && absorbed > 0) sim.shields.arc[arc] = Math.max(0, sim.shields.arc[arc] - absorbed / sim.shields.up);
  let zone = null;
  if (rest > 0.01) { zone = wpick(SIM.hitZones[arc]); sim.zones[zone] = Math.max(0, sim.zones[zone] - rest); }
  sim.hitLog.push({ at: sim.time, arc, dmg, absorbed, zone, rest });
  if (sim.hitLog.length > 12) sim.hitLog.shift();
  return { absorbed, zone, rest };
}

// ---------- the tick ----------
function simStep(dt) {
  sim.time += dt;
  const alert = state.alert, up = alert !== 'green';
  // shields rise or fall over SIM.shield.rise seconds; arcs regenerate only while raised
  sim.shields.up = Math.min(1, Math.max(0, sim.shields.up + (up ? 1 : -1) * dt / SIM.shield.rise));
  if (up) ARCS.forEach((a) => { sim.shields.arc[a] = Math.min(shieldMax(a), sim.shields.arc[a] + shieldRegen(a) * dt); });
  // emergency power: boost, then a reactor penalty
  if (sim.emergency.boost > 0) { sim.emergency.boost -= dt; if (sim.emergency.boost <= 0) { sim.emergency.boost = 0; sim.emergency.penalty = SIM.emergency.penaltyTime; say('Engineering', 'Emergency power spent. Reactor recovering.'); } }
  else if (sim.emergency.penalty > 0) { sim.emergency.penalty = Math.max(0, sim.emergency.penalty - dt); if (!sim.emergency.penalty) say('Engineering', 'Reactor back to full output.'); }
  // beams charge at red alert, drain to safe otherwise; torpedoes load at red
  const red = alert === 'red';
  ['dorsal', 'ventral'].forEach((b) => {
    const rate = beamStrength(b) / SIM.beam.charge;
    sim.beams[b] = red ? Math.min(1, sim.beams[b] + rate * dt) : Math.max(0, sim.beams[b] - dt / 2);
  });
  const bayRate = 1 / (SIM.torp.reload / Math.max(0.25, zoneFactor('prow')));
  sim.bays.forEach((bay) => {
    if (!red || bay.torps <= 0) { bay.ready = false; bay.reload = 0; return; }
    if (!bay.ready) { bay.reload += bayRate * dt; if (bay.reload >= 1) { bay.ready = true; bay.reload = 1; } }
  });
  // repair teams move, then repair up to the field cap
  sim.teams.forEach((tm, i) => {
    if (tm.to) { tm.t -= dt; if (tm.t <= 0) { tm.at = tm.to; tm.to = null; tm.t = 0; say('Damage Control', `Team ${i + 1} on station: ${ZONE_NAME[tm.at]}.`); } }
    else if (tm.at && sim.zones[tm.at] < SIM.repair.cap) sim.zones[tm.at] = Math.min(SIM.repair.cap, sim.zones[tm.at] + SIM.repair.rate * dt);
  });
  // reactor breach: engines zone at 0 with nobody there
  const teamOnEngines = sim.teams.some((tm) => tm.at === 'engines');
  if (sim.zones.engines <= 0 && !teamOnEngines && !sim.lost) {
    if (sim.breach === null) { sim.breach = SIM.breach; say('Engineering', 'Containment failing! Core breach in twenty seconds. Get a team to the engines!'); }
    else { sim.breach -= dt; if (sim.breach <= 0) { sim.breach = 0; sim.lost = true; sim.drill.on = false; say('Engineering', 'Core breach.'); } }
  } else if (sim.breach !== null && !sim.lost) { sim.breach = null; say('Engineering', 'Containment holding. Breach averted.'); }
  // combat drill: simulated hits on random arcs
  if (sim.drill.on && !sim.lost) {
    sim.drill.t -= dt; sim.drill.next -= dt;
    if (sim.drill.next <= 0) {
      const d = SIM.drill, arc = wpick(d.arcs), r = simHit(arc, d.dmgMin + Math.random() * (d.dmgMax - d.dmgMin));
      sim.drill.hits++; sim.drill.next = d.gapMin + Math.random() * (d.gapMax - d.gapMin);
      if (r.zone && r.rest > 4) say('Damage Control', `Hit through the ${ARC_NAMES[arc].toLowerCase()} arc. ${ZONE_NAME[r.zone]} at ${Math.round(sim.zones[r.zone])}%.`);
    }
    if (sim.drill.t <= 0) stopDrill();
  }
}
// Called once per frame with the frame time; runs whole ticks and never more than one second of catch-up.
function simUpdate(dt) {
  sim.acc = Math.min(sim.acc + dt, SIM.maxCatchUp);
  let n = 0; while (sim.acc >= SIM.tick - 1e-9) { sim.acc -= SIM.tick; simStep(SIM.tick); n++; }
  return n;
}

````

---

## `js/surfaces.js`

````javascript
// USS Defiance · surfaces.js
// Stage 3: surface detail. Loads the texture sets in textures/ (made by tools/make_textures.py) and adds small shader
// changes ("patches") to three.js's standard materials:
//   - world mapping: textures are laid on by world position, so boxes, chairs and consoles get even, unstretched detail;
//   - wear: polished edges on consoles and desks, scuffed walkways on the bridge floor, grime near the deck;
//   - screens: a fine pixel grid when you lean in, brighter centres, and glass with fingerprints that catch the light.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- shader patch system: several patches can share one material ----------
// A patch is { key, world, uniforms, decl, vdecl, vert, at: { chunk: code }, before: { chunk: code }, replace: { chunk: code } }.
// world: true adds vWP (world position), vWN (world normal), vON (object normal) and flatN (normal before bump maps).
function patchMat(m, key, p) {
  const P = m._patches || (m._patches = []);
  if (!P.some((q) => q.key === key)) { P.push(Object.assign({ key }, p)); installPatches(m); }
  return m;
}
function installPatches(m) {
  m.onBeforeCompile = (sh) => {
    const P = m._patches, world = P.some((q) => q.world);
    const W = 'varying vec3 vWP; varying vec3 vWN; varying vec3 vON;\n';
    // world position and normal; an instanced copy (the corridor kit) also carries its instance's placement
    const WV = '#ifdef USE_INSTANCING\nvWP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz; vWN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);\n#else\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz; vWN = normalize(mat3(modelMatrix) * normal);\n#endif\nvON = normal;\n';
    let vd = world ? W : '', vb = world ? WV : '', fd = world ? W : '';
    const at = {}, before = {}, rep = {};
    if (world) at.normal_fragment_begin = 'vec3 flatN = normal;\n';
    P.forEach((q) => {
      if (q.uniforms) Object.assign(sh.uniforms, q.uniforms);
      fd += q.decl || ''; vd += q.vdecl || ''; vb += q.vert || '';
      for (const h in q.at || {}) at[h] = (at[h] || '') + q.at[h] + '\n';
      for (const h in q.before || {}) before[h] = (before[h] || '') + q.before[h] + '\n';
      for (const h in q.replace || {}) rep[h] = q.replace[h];
    });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + vd).replace('#include <fog_vertex>', '#include <fog_vertex>\n' + vb);
    let f = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + fd);
    const hooks = new Set([...Object.keys(at), ...Object.keys(before), ...Object.keys(rep)]);
    hooks.forEach((h) => { const tag = '#include <' + h + '>'; f = f.replace(tag, (before[h] || '') + (rep[h] !== undefined ? rep[h] : tag) + '\n' + (at[h] || '')); });
    sh.fragmentShader = f;
  };
  m.customProgramCacheKey = () => m._patches.map((q) => q.key).join('|');
  m.needsUpdate = true;
}
function copyPatches(from, to) { to._patches = (from._patches || []).slice(); if (to._patches.length) installPatches(to); return to; }

// ---------- textures: neutral placeholders until the real images arrive ----------
const SURF = { loads: [], cache: new Map() };
function tex1(r, g, b) { const t = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1); t.needsUpdate = true; return t; }
const PH = { c: tex1(255, 255, 255), n: tex1(128, 128, 255), orm: tex1(255, 128, 0), g: tex1(0, 0, 0) };
PH.c.colorSpace = THREE.SRGBColorSpace;
// TX(file, kind, apply): apply(texture) runs now with a placeholder and again once the file has loaded.
function TX(file, kind, apply) {
  apply(PH[kind]);
  let e = SURF.cache.get(file);
  if (!e) {
    e = { t: null, wait: [] }; SURF.cache.set(file, e);
    SURF.loads.push(new Promise((ok) => new THREE.TextureLoader().load('textures/' + file, (t) => {
      t.colorSpace = kind === 'c' ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso;
      e.t = t; e.wait.splice(0).forEach((f) => f(t)); ok(true);
    }, undefined, () => { console.warn('Texture missing: textures/' + file); ok(false); })));
  }
  if (e.t) apply(e.t); else e.wait.push(apply);
}
// a UV-mapped set on a flat surface whose UVs are in metres (floors): colour, bumps, contact shading, roughness, metalness
function uvSet(m, name, metres, o) {
  o = o || {};
  const rep = (t) => { if (t.isDataTexture) return t; const c = t.clone(); c.repeat.set(1 / metres, 1 / metres); c.needsUpdate = true; return c; };
  TX(name + '_c.jpg', 'c', (t) => { m.map = rep(t); });
  TX(name + '_n.jpg', 'n', (t) => { m.normalMap = rep(t); });
  TX(name + '_orm.jpg', 'orm', (t) => { const r = rep(t); m.aoMap = r; m.roughnessMap = r; if (o.metal) m.metalnessMap = r; });
  m.color.setHex(0xffffff); m.roughness = 1; m.metalness = o.metal ? 1 : 0; m.normalScale.set(o.ns || 1, o.ns || 1); m.aoMapIntensity = o.ao ?? 1;
  return m;
}

// ---------- world-mapped detail ("triplanar": the texture is projected from three sides and blended) ----------
// shared by every patched material: the floor height of the deck you are on (grime is measured from it) and whether
// the bridge's walkway wear applies (its paths are the bridge's own; other decks get theirs from the kit later)
const SURFU = { deckFloor: { value: 0 }, walkOn: { value: 1 } };
const TRI_DECL = `uniform sampler2D triN, triO, triC; uniform float triS, triNS, triRV, triEdge, triLow, deckFloor; uniform vec3 triTint;
vec3 triW(vec3 n) { vec3 w = pow(abs(n), vec3(4.0)); return w / dot(w, vec3(1.0)); }
vec4 triTex(sampler2D t, vec3 p, vec3 w) { return texture(t, p.zy) * w.x + texture(t, p.xz) * w.y + texture(t, p.xy) * w.z; }
`;
// o: { set, metres, ns (bump strength), rv (roughness variation), edge (edge wear), low (grime near the deck), color, absRough, albedo }
function triSurface(m, o) {
  const U = {
    triN: { value: PH.n }, triO: { value: PH.orm }, triC: { value: PH.c }, triS: { value: 1 / (o.metres || 0.6) }, triNS: { value: o.ns ?? 0.8 },
    triRV: { value: o.rv ?? 0.6 }, triEdge: { value: o.edge || 0 }, triLow: { value: o.low ?? 1 }, triTint: { value: new THREE.Color(1, 1, 1) }, deckFloor: SURFU.deckFloor,
  };
  TX(o.set + '_n.jpg', 'n', (t) => { U.triN.value = t; });
  TX(o.set + '_orm.jpg', 'orm', (t) => { U.triO.value = t; });
  if (o.color) TX(o.set + '_c.jpg', 'c', (t) => { U.triC.value = t; });
  if (o.albedo) m.userData.bakeAlbedo = o.albedo;
  const flags = (o.color ? 'c' : '') + (o.absRough ? 'a' : '') + (o.edge ? 'e' : '');
  return patchMat(m, 'tri' + flags, {
    world: true, uniforms: U, decl: TRI_DECL,
    at: {
      map_fragment: `vec3 tP = vWP * triS; vec3 tWN = normalize(vWN); vec3 tw = triW(tWN); vec4 tO = triTex(triO, tP, tw); float tEdge = 0.0;
        ${o.color ? 'diffuseColor.rgb *= triTex(triC, tP, tw).rgb * triTint;' : ''}
        float tLow = (1.0 - smoothstep(0.0, 0.35, vWP.y - deckFloor)) * (1.0 - abs(tWN.y)) * triLow; diffuseColor.rgb *= 1.0 - 0.35 * tLow;
        ${o.edge ? `{ vec3 an = abs(normalize(vON)); tEdge = smoothstep(0.09, 0.25, 1.0 - max(an.x, max(an.y, an.z))) * smoothstep(0.25, 0.55, tO.g + 0.1) * triEdge;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.56, 0.55, 0.52), tEdge * 0.8); }` : ''}`,
      roughnessmap_fragment: o.absRough ? 'roughnessFactor *= tO.g;' :
        'roughnessFactor = clamp(roughnessFactor * (1.0 + triRV * (tO.g - 0.5) * 2.0), 0.04, 1.0); roughnessFactor = mix(roughnessFactor, 0.24, tEdge); roughnessFactor = mix(roughnessFactor, 1.0, tLow * 0.3);',
      metalnessmap_fragment: 'metalnessFactor = mix(metalnessFactor, 0.85, tEdge);',
      normal_fragment_maps: `{ vec3 N = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
        vec3 tx = texture(triN, tP.zy).xyz * 2.0 - 1.0, ty = texture(triN, tP.xz).xyz * 2.0 - 1.0, tz = texture(triN, tP.xy).xyz * 2.0 - 1.0;
        tx.xy *= triNS; ty.xy *= triNS; tz.xy *= triNS;
        tx = vec3(tx.xy + N.zy, abs(tx.z) * N.x); ty = vec3(ty.xy + N.xz, abs(ty.z) * N.y); tz = vec3(tz.xy + N.xy, abs(tz.z) * N.z);
        normal = normalize((viewMatrix * vec4(normalize(tx.zyx * tw.x + ty.xzy * tw.y + tz.xyz * tw.z), 0.0)).xyz); }`,
    },
  });
}

// ---------- bridge floor wear: walkways scuffed where the crew actually walks ----------
const WALK_DECL = `uniform float walkAmt, walkRough, walkFlat, walkOn; uniform vec3 walkTint;
float wHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float wNoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(wHash(i), wHash(i + vec2(1.0, 0.0)), f.x), mix(wHash(i + vec2(0.0, 1.0)), wHash(i + vec2(1.0, 1.0)), f.x), f.y); }
float walkMask(vec2 p) {
  if (abs(p.x) > 5.7 || p.y > 5.5 || p.y < -5.3) return 0.0;
  float m = (1.0 - smoothstep(0.3, 0.75, abs(p.x))) * smoothstep(-4.3, -3.8, p.y) * (1.0 - smoothstep(-1.9, -1.4, p.y));
  m = max(m, 1.0 - smoothstep(0.05, 0.4, abs(length(p - vec2(0.0, 0.4)) - 2.45)));
  m = max(m, (1.0 - smoothstep(0.05, 0.5, abs(abs(p.x) - 3.55))) * (1.0 - smoothstep(2.3, 3.1, abs(p.y))));
  m = max(m, (1.0 - smoothstep(0.05, 0.5, abs(p.y - 4.55))) * (1.0 - smoothstep(2.6, 3.4, abs(p.x))));
  m = max(m, (1.0 - smoothstep(0.1, 0.55, length((p - vec2(sign(p.x) * 1.4, -2.45)) * vec2(1.0, 1.6)))) * step(0.2, abs(p.x)));
  return m * (0.5 + 0.5 * wNoise(p * 3.1)) * (0.75 + 0.25 * wNoise(p * 19.0));
}
`;
function walkWear(m, o) {
  return patchMat(m, 'walk', {
    world: true, decl: WALK_DECL,
    uniforms: { walkAmt: { value: o.amt }, walkRough: { value: o.rough }, walkFlat: { value: o.flat }, walkOn: SURFU.walkOn, walkTint: { value: new THREE.Color().setRGB(...o.tint) } },
    at: {
      map_fragment: 'float wk = walkMask(vWP.xz) * walkAmt * walkOn; diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * walkTint, wk);',
      roughnessmap_fragment: 'roughnessFactor = mix(roughnessFactor, roughnessFactor * walkRough, wk);',
      normal_fragment_maps: 'normal = normalize(mix(normal, flatN, wk * walkFlat));',
    },
  });
}

// ---------- bump maps drawn from a canvas (walls, ceilings, consoles) ----------
// Treats brightness as height unless a separate height canvas is given. Returns a texture with matching wrap settings.
function normalTex(src, strength) {
  const w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data, H = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) H[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255;
  const c = cnv(w, h), g = c.getContext('2d'), o = g.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (H[y * w + (x + 1) % w] - H[y * w + (x - 1 + w) % w]) * strength, dy = (H[Math.min(h - 1, y + 1) * w + x] - H[Math.max(0, y - 1) * w + x]) * strength;
    const l = Math.hypot(dx, dy, 1), k = (y * w + x) * 4;
    o.data[k] = (-dx / l * 0.5 + 0.5) * 255; o.data[k + 1] = (dy / l * 0.5 + 0.5) * 255; o.data[k + 2] = (1 / l * 0.5 + 0.5) * 255; o.data[k + 3] = 255;
  }
  g.putImageData(o, 0, 0); return tex(c, false);
}

// ---------- screens: pixel grid up close, brighter centre ----------
const SCREEN_PATCH = {
  at: { map_fragment: `{ vec2 tp = vMapUv * vec2(textureSize(map, 0)); vec2 fw = fwidth(tp); float fade = 1.0 - smoothstep(0.14, 0.5, max(fw.x, fw.y));
    vec2 f = fract(tp); float cell = smoothstep(0.0, 0.16, f.x) * smoothstep(1.0, 0.84, f.x) * smoothstep(0.0, 0.2, f.y) * smoothstep(1.0, 0.8, f.y);
    vec3 sub = vec3(step(f.x, 0.333), step(0.333, f.x) * step(f.x, 0.667), step(0.667, f.x));
    diffuseColor.rgb *= mix(vec3(1.0), (0.3 + 0.95 * cell) * mix(vec3(1.0), 0.45 + 1.65 * sub, 0.4), fade * 0.85);
    vec2 cc = vMapUv - 0.5; diffuseColor.rgb *= 1.07 - 0.5 * dot(cc, cc); }` },
};
function patchScreen(mat) { return patchMat(mat, 'scr', SCREEN_PATCH); }
// screen glass: black, reflective, smudged; reflections of the room's lights smear where fingers have been
const GLASS_MAT = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1, metalness: 0, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, envMapIntensity: 3.5, polygonOffset: true, polygonOffsetFactor: -1 });
TX('smudge.png', 'g', (t) => { GLASS_MAT.roughnessMap = t; });
patchMat(GLASS_MAT, 'glass', {
  at: { roughnessmap_fragment: 'float smg = texture(roughnessMap, vRoughnessMapUv).g; roughnessFactor = mix(0.05, 0.55, smg);' },
  before: { opaque_fragment: 'outgoingLight = outgoingLight * mix(0.35, 2.2, smg) + smg * vec3(0.022, 0.021, 0.02);' }, // smudges also scatter a little light
});
let _glassSeed = 1;
function screenGlass(parent, w, h) {
  const geo = new THREE.PlaneGeometry(w, h), uv = geo.attributes.uv, r = mulberry(_glassSeed++ * 97), ou = r(), ov = r();
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 0.45 + ou, uv.getY(i) * h / 0.45 + ov);
  const m = new THREE.Mesh(geo, GLASS_MAT); m.position.z = 0.003; parent.add(m); return m;
}
SURF.ready = () => Promise.all(SURF.loads);

````

---

## `js/materials.js`

````javascript
// USS Defiance · materials.js
// Emblem, procedural surface textures, reflection environment and the material library.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- emblem (original: hexagon + compass star) ----------
function drawCrest(g, cx, cy, s, color, lw) {
  g.save(); g.translate(cx, cy); g.strokeStyle = color; g.fillStyle = color; g.lineWidth = lw;
  g.beginPath();
  for (let i = 0; i < 6; i++) { const a = (60 * i - 90) * D2R; const px = s * Math.cos(a), py = s * Math.sin(a); i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.closePath(); g.stroke();
  const star = (L, W, rot) => {
    g.save(); g.rotate(rot); g.beginPath();
    g.moveTo(0, -L); g.lineTo(W, -W); g.lineTo(L * 0.62, 0); g.lineTo(W, W); g.lineTo(0, L); g.lineTo(-W, W); g.lineTo(-L * 0.62, 0); g.lineTo(-W, -W);
    g.closePath(); g.fill(); g.restore();
  };
  star(s * 0.78, s * 0.11, 0);
  g.globalAlpha *= 0.55; star(s * 0.42, s * 0.07, Math.PI / 4);
  g.restore();
}

// ---------- surface textures ----------
function noise(g, W, H, n, a, seed) { const r = mulberry(seed); for (let i = 0; i < n; i++) { g.fillStyle = r() < 0.5 ? `rgba(255,240,220,${a})` : `rgba(0,0,0,${a * 1.4})`; g.fillRect(r() * W, r() * H, 1.4, 1.4); } }
function fastener(g, x, y, r) { g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.arc(x + 1, y + 1, r, 0, 7); g.fill(); g.fillStyle = '#8f8880'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.4, 0, 7); g.fill(); }
// Wall: one 1.2 m bay x 3.3 m at 160 px/m. Canvas top = ceiling.
function wallCanvases() {
  const W = 192, H = 528, Y = (m) => H - m * 160;
  const c = cnv(W, H), g = c.getContext('2d'), e = cnv(W, H), ge = e.getContext('2d');
  // upper service band
  g.fillStyle = '#5a544d'; g.fillRect(0, 0, W, Y(2.72));
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(24, 18 + i * 11, W - 48, 4); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(24, 22 + i * 11, W - 48, 1); }
  // main panel
  const gr = g.createLinearGradient(0, Y(2.72), 0, Y(1.02)); gr.addColorStop(0, '#d8d0c3'); gr.addColorStop(1, '#c9c0b2');
  g.fillStyle = gr; g.fillRect(0, Y(2.72), W, Y(1.02) - Y(2.72));
  [[2.62, 1.92], [1.86, 1.1]].forEach(([top, bot]) => {
    const x0 = 14, x1 = W - 14, y0 = Y(top), y1 = Y(bot);
    g.fillStyle = 'rgba(120,112,100,0.07)'; g.fillRect(x0, y0, x1 - x0, y1 - y0); // a barely-there inset, clean paint
    g.fillStyle = 'rgba(255,250,240,0.5)'; g.fillRect(x0, y1 - 2, x1 - x0, 2); g.fillRect(x1 - 2, y0, 2, y1 - y0);
    g.fillStyle = 'rgba(40,28,18,0.4)'; g.fillRect(x0, y0, x1 - x0, 2); g.fillRect(x0, y0, 2, y1 - y0);
    [[x0 + 8, y0 + 8], [x1 - 8, y0 + 8], [x0 + 8, y1 - 8], [x1 - 8, y1 - 8]].forEach(([fx, fy]) => fastener(g, fx, fy, 2.2));
  });
  // a small dark-red ID tag on the upper panel and a faint stencil code on the lower one
  { const tx = 24, ty = Y(2.62) + 14; g.fillStyle = '#5a1a1e'; g.fillRect(tx, ty, 46, 11); g.fillStyle = '#e8d8c0'; g.fillRect(tx + 2, ty + 2, 9, 7);
    g.fillStyle = 'rgba(232,216,192,0.75)'; g.fillRect(tx + 14, ty + 3, 28, 2); g.fillRect(tx + 14, ty + 7, 18, 1);
    g.fillStyle = 'rgba(70,62,54,0.35)'; g.font = `600 8px ${MONO}`; g.textBaseline = 'top'; g.fillText('WL-' + 'A4', W - 46, Y(1.86) + 10); }
  // steel rail
  g.fillStyle = '#7d7871'; g.fillRect(0, Y(1.02), W, Y(0.95) - Y(1.02));
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(0, Y(1.02), W, 2);
  // armored dado
  g.fillStyle = '#4e4843'; g.fillRect(0, Y(0.95), W, Y(0.12) - Y(0.95));
  g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 2; g.strokeRect(10, Y(0.9), W - 20, Y(0.17) - Y(0.9));
  g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 1; g.strokeRect(12, Y(0.88), W - 24, Y(0.19) - Y(0.88));
  [[20, Y(0.84)], [W - 20, Y(0.84)], [20, Y(0.24)], [W - 20, Y(0.24)], [W / 2, Y(0.84)], [W / 2, Y(0.24)]].forEach(([x, y]) => fastener(g, x, y, 2.6));
  // kick plate
  g.fillStyle = '#262422'; g.fillRect(0, Y(0.12), W, H - Y(0.12));
  noise(g, W, H, 1400, 0.02, 5);
  // light seams
  g.fillStyle = '#1e1a16'; g.fillRect(0, Y(2.62), 3, Y(1.1) - Y(2.62)); g.fillRect(W - 3, Y(2.62), 3, Y(1.1) - Y(2.62)); g.fillRect(0, Y(2.72) - 3, W, 5);
  ge.fillStyle = '#000'; ge.fillRect(0, 0, W, H);
  ge.fillStyle = 'rgba(255,255,255,0.75)'; ge.fillRect(0, Y(2.62), 2, Y(1.1) - Y(2.62)); ge.fillRect(W - 2, Y(2.62), 2, Y(1.1) - Y(2.62));
  ge.fillStyle = '#fff'; ge.fillRect(0, Y(2.72) - 2, W, 3);
  // height for the bump map, same layout at twice the resolution: panels inset, seams and louvres cut in, rail and fasteners proud
  const hc = cnv(W * 2, H * 2), hg = hc.getContext('2d'); hg.scale(2, 2);
  const hv = (v) => `rgb(${v * 255 | 0},${v * 255 | 0},${v * 255 | 0})`;
  hg.fillStyle = hv(0.45); hg.fillRect(0, 0, W, Y(2.72));
  for (let i = 0; i < 6; i++) { hg.fillStyle = hv(0.2); hg.fillRect(24, 18 + i * 11, W - 48, 4); }
  hg.fillStyle = hv(0.58); hg.fillRect(0, Y(2.72), W, Y(1.02) - Y(2.72));
  [[2.62, 1.92], [1.86, 1.1]].forEach(([top, bot]) => {
    const x0 = 14, x1 = W - 14, y0 = Y(top), y1 = Y(bot);
    hg.fillStyle = hv(0.36); hg.fillRect(x0, y0, x1 - x0, y1 - y0); hg.fillStyle = hv(0.48); hg.fillRect(x0 + 3, y0 + 3, x1 - x0 - 6, y1 - y0 - 6);
    [[x0 + 8, y0 + 8], [x1 - 8, y0 + 8], [x0 + 8, y1 - 8], [x1 - 8, y1 - 8]].forEach(([fx, fy]) => { hg.fillStyle = hv(0.8); hg.beginPath(); hg.arc(fx, fy, 2.2, 0, 7); hg.fill(); });
  });
  hg.fillStyle = hv(0.82); hg.fillRect(0, Y(1.02), W, Y(0.95) - Y(1.02));
  hg.fillStyle = hv(0.62); hg.fillRect(0, Y(0.95), W, Y(0.12) - Y(0.95));
  hg.strokeStyle = hv(0.42); hg.lineWidth = 2; hg.strokeRect(10, Y(0.9), W - 20, Y(0.17) - Y(0.9));
  [[20, Y(0.84)], [W - 20, Y(0.84)], [20, Y(0.24)], [W - 20, Y(0.24)], [W / 2, Y(0.84)], [W / 2, Y(0.24)]].forEach(([x, y]) => { hg.fillStyle = hv(0.85); hg.beginPath(); hg.arc(x, y, 2.6, 0, 7); hg.fill(); });
  hg.fillStyle = hv(0.5); hg.fillRect(0, Y(0.12), W, H - Y(0.12));
  hg.fillStyle = hv(0.15); hg.fillRect(0, Y(2.62), 3, Y(1.1) - Y(2.62)); hg.fillRect(W - 3, Y(2.62), 3, Y(1.1) - Y(2.62)); hg.fillRect(0, Y(2.72) - 3, W, 5);
  const hb = cnv(W * 2, H * 2), hbg = hb.getContext('2d'); hbg.filter = 'blur(1.2px)'; hbg.drawImage(hc, 0, 0);
  return [c, e, hb];
}
function carpetTile() {
  const S = 256, c = cnv(S, S), g = c.getContext('2d');
  g.fillStyle = '#342f2b'; g.fillRect(0, 0, S, S);
  const r = mulberry(9);
  for (let i = 0; i < 4200; i++) { g.fillStyle = r() < 0.5 ? 'rgba(180,140,110,0.08)' : 'rgba(0,0,0,0.12)'; g.fillRect(r() * S, r() * S, 1.3, 1.3); }
  g.strokeStyle = 'rgba(0,0,0,0.06)'; for (let x = 0; x < S; x += 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2; g.strokeRect(0, 0, S, S);
  return c;
}
function plateTile() {
  const S = 256, c = cnv(S, S), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, S, S); gr.addColorStop(0, '#5a5550'); gr.addColorStop(1, '#4b4742'); g.fillStyle = gr; g.fillRect(0, 0, S, S);
  g.fillStyle = 'rgba(255,255,255,0.07)';
  for (let y = 8; y < S; y += 16) for (let x = (y / 16) % 2 ? 16 : 8; x < S; x += 16) { g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillRect(-5, -1.5, 10, 3); g.restore(); }
  noise(g, S, S, 2200, 0.04, 33);
  g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 3; g.strokeRect(1, 1, S - 2, S - 2);
  [[12, 12], [S - 12, 12], [12, S - 12], [S - 12, S - 12]].forEach(([x, y]) => fastener(g, x, y, 3));
  return c;
}
function ceilingTile() {
  const S = 256, c = cnv(S, S), g = c.getContext('2d');
  g.fillStyle = '#b9b2a7'; g.fillRect(0, 0, S, S);
  noise(g, S, S, 1600, 0.04, 44);
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 3; g.strokeRect(1, 1, S - 2, S - 2);
  g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 1; g.strokeRect(5, 5, S - 10, S - 10);
  for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(70, 98 + i * 14, 116, 5); }
  return c;
}
function daisTexture() {
  const S = 512, m = S / 2, c = cnv(S, S), g = c.getContext('2d');
  g.fillStyle = '#2e2926'; g.fillRect(0, 0, S, S);
  noise(g, S, S, 9000, 0.06, 71);
  g.strokeStyle = 'rgba(150,175,215,0.55)'; g.lineWidth = 3;
  [0.95, 0.9].forEach((f) => { g.beginPath(); g.arc(m, m, f * m, 0, 7); g.stroke(); });
  g.strokeStyle = 'rgba(150,175,215,0.25)'; g.lineWidth = 2;
  for (let a = 0; a < 360; a += 15) { const t = a * D2R; g.beginPath(); g.moveTo(m + Math.cos(t) * 0.9 * m, m + Math.sin(t) * 0.9 * m); g.lineTo(m + Math.cos(t) * 0.82 * m, m + Math.sin(t) * 0.82 * m); g.stroke(); }
  drawCrest(g, m, m + 0.56 * m, 36, 'rgba(150,175,215,0.45)', 3);
  return c;
}
function lightDiscTexture() {
  const S = 512, m = S / 2, c = cnv(S, S), g = c.getContext('2d');
  const gr = g.createRadialGradient(m, m, 0, m, m, m); gr.addColorStop(0, '#fff4e2'); gr.addColorStop(0.7, '#f5d9b4'); gr.addColorStop(1, '#c49a70');
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  g.strokeStyle = 'rgba(70,50,30,0.4)'; g.lineWidth = 6;
  for (let i = 1; i < 6; i++) { g.beginPath(); g.arc(m, m, i * 44, 0, 7); g.stroke(); }
  g.lineWidth = 10; g.strokeStyle = 'rgba(50,38,26,0.6)';
  for (let a = 0; a < 360; a += 45) { const t = a * D2R; g.beginPath(); g.moveTo(m + Math.cos(t) * 46, m + Math.sin(t) * 46); g.lineTo(m + Math.cos(t) * m, m + Math.sin(t) * m); g.stroke(); }
  g.fillStyle = '#3a2e24'; g.beginPath(); g.arc(m, m, 46, 0, 7); g.fill();
  drawCrest(g, m, m, 28, 'rgba(255,190,120,0.8)', 3);
  return c;
}
function radialTex(inner, outer) { const S = 128, c = cnv(S, S), g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, S, S); return tex(c); }
function linearTex(top, bottom) { const c = cnv(4, 64), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, 4, 64); return tex(c); }

// ---------- environment (reflections) ----------
{
  const env = new THREE.Scene(); env.background = new THREE.Color(0x15110d);
  const eb = (col, k, w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); env.add(m); };
  eb(0x2a241e, 1, 16, 0.2, 16, 0, -1, 0);
  eb(0x4a4038, 1, 16, 0.2, 16, 0, 3.4, 0);
  eb(0xffd6a8, 3, 3.4, 0.1, 3.4, 0, 3.3, 0);
  eb(0x86a8e0, 2.2, 5, 2.2, 0.1, 0, 1.8, FWD_Z + 0.2);
  eb(0xffe2c8, 3, 13.6, 0.08, 0.3, 0, 3.1, AFT_Z - 0.2);
  eb(0xffe2c8, 3, 0.3, 0.08, 11.6, SIDE_X - 0.2, 3.1, 0);
  eb(0xffe2c8, 3, 0.3, 0.08, 11.6, -(SIDE_X - 0.2), 3.1, 0);
  eb(0x6a5e52, 1, 0.2, 3, 13.6, SIDE_X + 0.2, 1.5, 0);
  eb(0x6a5e52, 1, 0.2, 3, 13.6, -(SIDE_X + 0.2), 1.5, 0);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(env, 0.04).texture;
  scene.environmentIntensity = window.ENV_I ?? 0.65; // the newer reflection prefilter comes out brighter than r128's
  pm.dispose();
}

// ---------- materials ----------
const [wallC, wallE, wallHt] = wallCanvases();
const wallMap = tex(wallC), wallEm = tex(wallE), wallN = normalTex(wallHt, 3.5); wallMap.wrapS = wallEm.wrapS = wallN.wrapS = THREE.RepeatWrapping;
const ceilC = ceilingTile(), daisC = daisTexture();
function tile(c, m) { const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / m, 1 / m); return t; }
let MAT_CONSOLE_N = null;
const MAT = {
  wall: new THREE.MeshStandardMaterial({ map: wallMap, emissiveMap: wallEm, emissive: new THREE.Color(ALERTS.green.slot), emissiveIntensity: 0.7, normalMap: wallN, roughness: 1.55, metalness: 0.08, envMapIntensity: 0.32 }),
  gun: new THREE.MeshStandardMaterial({ color: 0x33322f, metalness: 0.78, roughness: 0.38, envMapIntensity: 0.55 }),
  gunDark: new THREE.MeshStandardMaterial({ color: 0x242322, metalness: 0.6, roughness: 0.5, envMapIntensity: 0.7 }),
  steel: new THREE.MeshStandardMaterial({ color: 0x9a948c, metalness: 0.9, roughness: 0.26, envMapIntensity: 1.1 }),
  panel: new THREE.MeshStandardMaterial({ color: 0x9a9184, roughness: 0.6, metalness: 0.15, envMapIntensity: 0.45 }),
  console: new THREE.MeshStandardMaterial({ map: (() => {
    const S = 512, c = cnv(S, S), g = c.getContext('2d');
    g.fillStyle = '#2e2b28'; g.fillRect(0, 0, S, S); noise(g, S, S, 6000, 0.03, 91);
    g.fillStyle = 'rgba(0,0,0,0.55)'; [0, 256].forEach((x) => g.fillRect(x, 0, 3, S)); [0, 300].forEach((y) => g.fillRect(0, y, S, 3));
    g.fillStyle = 'rgba(255,255,255,0.06)'; [3, 259].forEach((x) => g.fillRect(x, 0, 1, S)); [3, 303].forEach((y) => g.fillRect(0, y, S, 1));
    for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(40, 340 + i * 14, 150, 6); g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(40, 346 + i * 14, 150, 1); }
    for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(296, 340 + i * 14, 150, 6); g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(296, 346 + i * 14, 150, 1); }
    [[14, 14], [242, 14], [14, 286], [242, 286], [270, 14], [498, 14], [270, 286], [498, 286], [14, 316], [242, 316], [270, 316], [498, 316]].forEach(([x, y]) => fastener(g, x, y, 3));
    g.fillStyle = '#1b1917'; g.fillRect(40, 60, 110, 26); g.fillRect(296, 60, 110, 26);
    g.fillStyle = 'rgba(201,214,234,0.55)'; g.font = `600 13px ${MONO}`; g.textBaseline = 'middle'; g.fillText('SVC 14-A', 50, 74); g.fillText('SVC 14-B', 306, 74);
    const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; MAT_CONSOLE_N = normalTex(c, 2.5); MAT_CONSOLE_N.wrapS = MAT_CONSOLE_N.wrapT = THREE.RepeatWrapping; return t; })(), roughness: 0.48, metalness: 0.4, envMapIntensity: 0.75 }),
  cap: new THREE.MeshStandardMaterial({ color: 0x5e5852, roughness: 0.4, metalness: 0.55, envMapIntensity: 0.7 }),
  glassTop: new THREE.MeshStandardMaterial({ color: 0x0c0d0e, roughness: 0.15, metalness: 0.5, envMapIntensity: 1.2 }),
  leather: new THREE.MeshStandardMaterial({ color: 0x4a2416, roughness: 0.5, metalness: 0.05, envMapIntensity: 0.3 }),
  leatherDark: new THREE.MeshStandardMaterial({ color: 0x2a140a, roughness: 0.55, envMapIntensity: 0.2 }),
  // Stage 3: photographed surface sets (textures/, from ambientCG) for the floors
  floorCarpet: uvSet(new THREE.MeshStandardMaterial({ envMapIntensity: 0.25 }), 'carpet', 0.9),
  floorPlate: uvSet(new THREE.MeshStandardMaterial({ envMapIntensity: 0.8 }), 'plate', 0.6, { metal: true }),
  roomCarpet: uvSet(new THREE.MeshStandardMaterial({ envMapIntensity: 0.2 }), 'roomcarpet', 0.7),
  ceiling: new THREE.MeshStandardMaterial({ map: tile(ceilC, 1.2), normalMap: (() => { const t = normalTex(ceilC, 2.5); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 1.2, 1 / 1.2); return t; })(), roughness: 0.85, metalness: 0.2, side: THREE.DoubleSide, envMapIntensity: 0.25 }),
  dais: new THREE.MeshStandardMaterial({ map: tex(daisC), normalMap: normalTex(daisC, 0.5), roughness: 0.9, envMapIntensity: 0.3 }),
  hazard: null,
  hit: new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
};
{ const c = cnv(128, 16), g = c.getContext('2d'); g.fillStyle = '#d9a12a'; g.fillRect(0, 0, 128, 16); g.fillStyle = '#1a1714'; for (let x = -16; x < 128; x += 16) { g.beginPath(); g.moveTo(x, 16); g.lineTo(x + 8, 0); g.lineTo(x + 16, 0); g.lineTo(x + 8, 16); g.fill(); } const t = tex(c); t.wrapS = THREE.RepeatWrapping; MAT.hazard = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }); }
MAT.console.normalMap = MAT_CONSOLE_N;
// world-mapped detail and wear on the hard surfaces (surfaces.js)
triSurface(MAT.gun, { set: 'paint', metres: 0.7, ns: 0.8, rv: 0.75, edge: 0.6 });
triSurface(MAT.gunDark, { set: 'paint', metres: 0.7, ns: 0.8, rv: 0.75, edge: 0.5 });
triSurface(MAT.panel, { set: 'paint', metres: 0.7, ns: 1.0, rv: 0.7, edge: 0.4 });
triSurface(MAT.console, { set: 'paint', metres: 0.7, ns: 1.0, rv: 0.9, edge: 0.8 });
triSurface(MAT.cap, { set: 'paint', metres: 0.6, ns: 1.1, rv: 1.0, edge: 1.0 });
triSurface(MAT.steel, { set: 'steel', metres: 0.45, ns: 0.6, rv: 0.8, low: 0.5 });
triSurface(MAT.leather, { set: 'leather', metres: 0.25, ns: 2.2, rv: 1.0, low: 0 });
triSurface(MAT.leatherDark, { set: 'leather', metres: 0.25, ns: 2.2, rv: 1.0, low: 0 });
// crushed carpet pile and polished tread plate along the walkways
// bright workhorse: lift the photographed carpets to a mid blue-grey (colour above 1 brightens the texture)
MAT.floorCarpet.color.setRGB(1.75, 1.85, 2.05); MAT.roomCarpet.color.setRGB(1.35, 1.35, 1.4);
walkWear(MAT.floorCarpet, { amt: 0.8, rough: 1.0, flat: 0.6, tint: [1.3, 1.27, 1.22] });
walkWear(MAT.floorPlate, { amt: 0.85, rough: 0.5, flat: 0.25, tint: [1.25, 1.25, 1.25] });
// painted-metal roughness variation on the bridge walls (wall UVs: one unit per 1.2 m bay across, wall height up)
TX('paint_orm.jpg', 'orm', (t) => { if (t.isDataTexture) { MAT.wall.roughnessMap = t; return; } const r = t.clone(); r.repeat.set(1.5, 4.1); r.needsUpdate = true; MAT.wall.roughnessMap = r; });
const stripMats = [], slotMats = [];
function stripMat() { const m = new THREE.MeshBasicMaterial({ color: ALERTS.green.strip, toneMapped: false }); stripMats.push(m); return m; }
function slotMat() { const m = new THREE.MeshBasicMaterial({ color: ALERTS.green.slot, toneMapped: false }); slotMats.push(m); return m; }
const STRIP = stripMat(), SLOT = slotMat();
const lightDiscMat = new THREE.MeshBasicMaterial({ map: tex(lightDiscTexture()), toneMapped: false });
const downlightMat = new THREE.MeshBasicMaterial({ color: 0xfff0dc, toneMapped: false });
const aoTex = radialTex('rgba(0,0,0,0.75)', 'rgba(0,0,0,0)');
const poolTex = radialTex('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
const wallAoTex = linearTex('rgba(0,0,0,0.55)', 'rgba(0,0,0,0)');
// Painted-on shadow and light-pool decals. Stage 1 bakes real shadows and pools, so these are hidden once the bake loads.
const DECALS = [];
function decal(x, y, z, w, d, map, color, op, additive, rot) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map, color: color || 0xffffff, transparent: true, opacity: op, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = rot || 0; m.position.set(x, y, z); scene.add(m); DECALS.push(m); return m;
}
const ao = (x, z, w, d, op, y) => decal(x, (y || 0) + 0.004, z, w, d, aoTex, 0xffffff, op === undefined ? 0.7 : op, false);
const poolMats = [];
const pool = (x, z, w, d, color, op, y) => { const m = decal(x, (y || 0) + 0.006, z, w, d, poolTex, color, op, true); poolMats.push({ m, op }); return m; };

````

---

## `js/bridge.js`

````javascript
// USS Defiance · bridge.js
// Main bridge geometry: room shell, consoles, seating, command dais, viewscreen, aft wall, downlights.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- room shell ----------
// floor: metal deck plating perimeter, carpet inside
const inner = insetPoly(ROOM, 0.62);
{ const s = shapeXZ(ROOM, true); s.holes.push(pathXZ(inner, true)); const f = mesh(new THREE.ShapeGeometry(s), MAT.floorPlate); f.rotation.x = -Math.PI / 2; }
{ const f = mesh(new THREE.ShapeGeometry(shapeXZ(inner, true)), MAT.floorCarpet, 0, 0.002, 0); f.rotation.x = -Math.PI / 2; }
inner.forEach((p, i) => { const q = inner[(i + 1) % inner.length], len = Math.hypot(q[0] - p[0], q[1] - p[1]); const m = mesh(BOX(len, 0.012, 0.05), MAT.steel, (p[0] + q[0]) / 2, 0.006, (p[1] + q[1]) / 2); m.rotation.y = -Math.atan2(q[1] - p[1], q[0] - p[0]); });
// ceiling with a central coffer
const COFFER = { x: 0, z: 0.4, r: 1.45 };
{
  const s = shapeXZ(ROOM, false); const hole = new THREE.Path(); hole.absarc(COFFER.x, COFFER.z, COFFER.r, 0, Math.PI * 2, true); s.holes.push(hole);
  const c = mesh(new THREE.ShapeGeometry(s, 48), MAT.ceiling, 0, WALL_H, 0); c.rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(COFFER.r, COFFER.r, 0.5, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0x8a8177, roughness: 0.7, side: THREE.BackSide }), COFFER.x, WALL_H + 0.25, COFFER.z);
  const d = mesh(new THREE.CircleGeometry(COFFER.r, 64), lightDiscMat, COFFER.x, WALL_H + 0.5, COFFER.z); d.rotation.x = Math.PI / 2;
  const t = mesh(new THREE.TorusGeometry(COFFER.r, 0.07, 8, 96), MAT.steel, COFFER.x, WALL_H - 0.02, COFFER.z); t.rotation.x = Math.PI / 2;
  const t2 = mesh(new THREE.TorusGeometry(COFFER.r - 0.12, 0.025, 6, 96), SLOT, COFFER.x, WALL_H + 0.46, COFFER.z); t2.rotation.x = Math.PI / 2;
}
// walls
EDGES.forEach((e, ei) => {
  const gap = DOOR_GAPS[ei], dir = [e.tx, e.tz], nrm = [e.nx, e.nz], P2 = (s2) => [e.A[0] + e.tx * s2, e.A[1] + e.tz * s2];
  const stripRun = (s0, s1) => { if (s1 - s0 < 0.05) return; const m2 = (s0 + s1) / 2, q = P2(m2); const es = mesh(BOX(s1 - s0, 0.025, 0.02), STRIP, q[0] + e.nx * 0.012, 0.07, q[1] + e.nz * 0.012); es.rotation.y = e.rot; };
  if (gap === undefined) {
    wallPiece(MAT.wall, e.A, dir, nrm, 0, e.len, 0, WALL_H, WALL_H, 1.2);
    addSeg(e.A[0], e.A[1], e.B[0], e.B[1], 0.33); stripRun(0.25, e.len - 0.25);
  } else {
    // one or more 1.2 m openings; the aft wall has two (conference room and the Lift 1 car)
    const cs = [gap].concat(ei === LIFT_GAP.edge ? [LIFT_GAP.t] : []).sort((p, q) => p - q).map((g2) => g2 * e.len);
    let s = 0;
    cs.forEach((sc) => { wallPiece(MAT.wall, e.A, dir, nrm, s, sc - 0.6, 0, WALL_H, WALL_H, 1.2); s = sc + 0.6; });
    wallPiece(MAT.wall, e.A, dir, nrm, s, e.len, 0, WALL_H, WALL_H, 1.2);
    cs.forEach((sc) => wallPiece(MAT.wall, e.A, dir, nrm, sc - 0.6, sc + 0.6, 2.3, WALL_H, WALL_H, 1.2));
    s = 0;
    cs.forEach((sc) => { const a = P2(s), b = P2(sc - 0.6); addSeg(a[0], a[1], b[0], b[1], 0.33); stripRun(s ? s + 0.15 : 0.25, sc - 0.75); s = sc + 0.6; });
    { const a = P2(s), b = P2(e.len); addSeg(a[0], a[1], b[0], b[1], 0.33); stripRun(s + 0.15, e.len - 0.25); }
  }
  // cove light under the ceiling, emergency strip at the deck
  const cv = mesh(BOX(e.len - 0.5, 0.04, 0.04), SLOT, e.mx + e.nx * 0.12, WALL_H - 0.16, e.mz + e.nz * 0.12); cv.rotation.y = e.rot;
  const sh = mesh(RBOX(e.len - 0.4, 0.1, 0.18, 0.02), MAT.gunDark, e.mx + e.nx * 0.09, WALL_H - 0.1, e.mz + e.nz * 0.09); sh.rotation.y = e.rot;
  // conduit runs
  [[0.32, 3.06, 0.05], [0.44, 3.14, 0.035]].forEach(([off, y, r]) => {
    const p = mesh(new THREE.CylinderGeometry(r, r, e.len - 0.7, 10), MAT.steel, e.mx + e.nx * off, y, e.mz + e.nz * off);
    p.rotation.z = Math.PI / 2; p.rotation.y = e.rot - Math.PI / 2 + Math.PI / 2; const gq = new THREE.Group(); scene.remove(p); gq.position.set(e.mx + e.nx * off, y, e.mz + e.nz * off); gq.rotation.y = e.rot; p.position.set(0, 0, 0); p.rotation.set(0, 0, Math.PI / 2); gq.add(p); scene.add(gq);
  });
  const nb = Math.max(1, Math.floor(e.len / 1.3));
  for (let k = 1; k <= nb; k++) { const t = k / (nb + 1); const b = mesh(BOX(0.06, 0.18, 0.5), MAT.gunDark, e.A[0] + (e.B[0] - e.A[0]) * t + e.nx * 0.27, 3.12, e.A[1] + (e.B[1] - e.A[1]) * t + e.nz * 0.27); b.rotation.y = e.rot; }
  // wall-base contact shadow
  const g = group(e.mx, 0.005, e.mz, e.rot); const pl = mesh(new THREE.PlaneGeometry(e.len, 0.7), new THREE.MeshBasicMaterial({ map: wallAoTex, transparent: true, opacity: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), 0, 0, 0.35, g); pl.rotation.x = -Math.PI / 2; DECALS.push(pl);
});
// structural ribs at every corner, carried overhead as beams to the coffer
ROOM.forEach(([x, z]) => {
  const dx = CX - x, dz = CZ - z, dl = Math.hypot(dx, dz), ux = dx / dl, uz = dz / dl, rot = Math.atan2(ux, uz);
  const px = x + ux * 0.2, pz = z + uz * 0.2; extraObs.push({ x: px, z: pz, r: 0.26 });
  const g = group(px, 0, pz, rot);
  mesh(RBOX(0.42, WALL_H, 0.3, 0.025), MAT.gun, 0, WALL_H / 2, 0, g);
  mesh(RBOX(0.5, 0.16, 0.36, 0.02), MAT.steel, 0, 0.08, 0, g);
  mesh(RBOX(0.5, 0.12, 0.36, 0.02), MAT.steel, 0, 1.0, 0, g);
  mesh(BOX(0.05, 1.3, 0.02), SLOT, 0, 1.85, 0.16, g);
  [-0.15, 0.15].forEach((sx) => { for (let k = 0; k < 6; k++) mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 8), MAT.steel, sx, 1.2 + k * 0.32, 0.155, g).rotation.x = Math.PI / 2; });
  // beam
  const qx = COFFER.x - ux * -0, qz = COFFER.z; const vx = px - qx, vz = pz - qz, vl = Math.hypot(vx, vz);
  const ex = qx + vx / vl * (COFFER.r + 0.05), ez = qz + vz / vl * (COFFER.r + 0.05);
  const bl = Math.hypot(px - ex, pz - ez);
  const beam = group((px + ex) / 2, WALL_H - 0.12, (pz + ez) / 2, Math.atan2(px - ex, pz - ez));
  mesh(RBOX(0.3, 0.24, bl, 0.025), MAT.gun, 0, 0, 0, beam);
  mesh(BOX(0.04, 0.02, bl - 0.4), SLOT, 0, -0.125, 0, beam);
});

// ---------- screens ----------
const screens = [];
const byStation = {};
const SHEEN_MAT = (() => { const c = cnv(256, 256), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, 'rgba(255,255,255,0.0)'); gr.addColorStop(0.18, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.32, 'rgba(255,255,255,0.08)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.0)'); gr.addColorStop(0.86, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0.0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }); })();
function addScreen(parent, w, h, cw, ch, kind, station, title, code) {
  const c = cnv(cw, ch), g = c.getContext('2d'), t = tex(c);
  const mat = patchScreen(new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); parent.add(m);
  screenGlass(m, w, h); // smudged glass over every display and touch panel
  const s = { c, g, tex: t, mat, w: cw, h: ch, kind, station, title, code, mesh: m, seed: screens.length * 7 + 3 };
  screens.push(s); (byStation[station] = byStation[station] || []).push(s);
  return s;
}
const hitVolumes = [];
function addHit(geo, data, parent, x, y, z) {
  const m = new THREE.Mesh(geo, MAT.hit); m.position.set(x, y, z); m.visible = false;
  Object.assign(m.userData, data); (parent || scene).add(m); hitVolumes.push(m); return m;
}
// a framed, slightly recessed display
function display(parent, w, h, cw, ch, kind, station, title, code) {
  mesh(RBOX(w + 0.14, h + 0.14, 0.07, 0.02), MAT.gunDark, 0, 0, -0.035, parent);
  mesh(BOX(w + 0.02, h + 0.02, 0.01), new THREE.MeshBasicMaterial({ color: 0x000000 }), 0, 0, -0.005, parent);
  const s = addScreen(parent, w, h, cw, ch, kind, station, title, code); s.mesh.position.z = 0.006; return s;
}

// ---------- seating (sculpted) ----------
const _xg = new Map();
function extrudeX(key, build, depth, bevel) {
  if (_xg.has(key)) return _xg.get(key);
  const geo = new THREE.ExtrudeGeometry(build(), { depth: Math.max(0.002, depth - 2 * bevel), bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 10 });
  geo.translate(0, 0, -(depth - 2 * bevel) / 2); _xg.set(key, geo); return geo;
}
// side-profile shapes are drawn with x = forward, y = up, then turned so x points to -z
function sideGeo(key, build, width, bevel) { const k = 'side:' + key; if (_xg.has(k)) return _xg.get(k); const g = extrudeX(k + ':raw', build, width, bevel).clone(); g.rotateY(Math.PI / 2); _xg.set(k, g); return g; }
function backShape(wb, ws, wt, h, r) {
  const s = new THREE.Shape();
  s.moveTo(-wb / 2, 0); s.lineTo(wb / 2, 0);
  s.quadraticCurveTo(ws / 2 + 0.03, h * 0.32, ws / 2, h * 0.66);
  s.lineTo(wt / 2, h - r); s.quadraticCurveTo(wt / 2, h, wt / 2 - r, h);
  s.lineTo(-wt / 2 + r, h); s.quadraticCurveTo(-wt / 2, h, -wt / 2, h - r);
  s.lineTo(-ws / 2, h * 0.66); s.quadraticCurveTo(-ws / 2 - 0.03, h * 0.32, -wb / 2, 0);
  return s;
}
// ---------- chairs (rebuilt): upholstered, on a swivel, and they move when you brush past ----------
// Cushions are "pillows": a finely divided box with rounded edges, puffed on its face and bent to wrap the sitter.
// Every chair sits on a pedestal; the seat, back and arms ride a swivel that spins and rocks when the player
// brushes past (chairsUpdate, called from the frame loop), then slowly settles back.
const _pillows = new Map();
function pillow(w, h, d, r, puff, axis, bend, key, taper) {
  const k = key || [w, h, d, r, puff, axis, bend, taper || 0].join(','); if (_pillows.has(k)) return _pillows.get(k);
  const g = new THREE.BoxGeometry(w, h, d, 10, Math.max(2, Math.round(h / 0.04)), 10), p = g.attributes.position, v = new THREE.Vector3(), q = new THREE.Vector3();
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); q.set(clamp(v.x, -hx, hx), clamp(v.y, -hy, hy), clamp(v.z, -hz, hz));
    const n = v.clone().sub(q); if (n.lengthSq() > 1e-10) v.copy(q.add(n.normalize().multiplyScalar(r)));
    const fx = 1 - (v.x / (w / 2)) ** 2, fy = 1 - (v.y / (h / 2)) ** 2, fz = 1 - (v.z / (d / 2)) ** 2;
    if (axis === 'y' && v.y > 0) v.y += puff * Math.max(0, fx) * Math.max(0, fz);
    if (axis === '-z' && v.z < 0) v.z -= puff * Math.max(0, fx) * Math.max(0, fy);
    if (axis === '+z' && v.z > 0) v.z += puff * Math.max(0, fx) * Math.max(0, fy);
    if (taper) v.x *= 1 - taper * (v.y / h + 0.5); // narrower toward the top, like a moulded shell
    if (bend) v.z += bend * v.x * v.x; // wrap round the sitter
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); _pillows.set(k, g); return g;
}
let _baseGeo = null;
const CHAIR_BASE_MAT = triSurface(new THREE.MeshStandardMaterial({ color: 0x45433f, metalness: 0.85, roughness: 0.34, envMapIntensity: 0.6 }), { set: 'steel', metres: 0.45, ns: 0.5, rv: 0.7, low: 0.3 });
function chairBase() {
  if (_baseGeo) return _baseGeo;
  const pts = [[0, 0], [0.3, 0], [0.315, 0.012], [0.3, 0.028], [0.18, 0.05], [0.085, 0.08], [0.06, 0.12], [0.05, 0.3], [0.07, 0.33], [0.075, 0.36], [0, 0.36]].map(([x, y]) => new THREE.Vector2(x, y));
  _baseGeo = new THREE.LatheGeometry(pts, 40); return _baseGeo;
}
// moulded shell: smooth satin composite, warm dark grey (no cast-metal grain, which read as stone)
const MAT_SHELL = new THREE.MeshStandardMaterial({ color: 0x2e2a27, metalness: 0.1, roughness: 0.5, envMapIntensity: 0.4 });
const CHAIRS = [];
// Chairs (pass 3): one sculpted shell rather than stacked boxes. A single side profile (seat flowing round a soft
// corner into a reclined back) is extruded across the chair; one continuous cushion follows it from a waterfall front
// edge up the back; side wings sweep from the seat up the back edge. Lower, wider and more reclined than before.
// kinds: captain (widest, tallest back, padded arms), xo (tall back, padded arms), station (mid back), dining (low).
const CHAIR_DIM = { captain: { H: 0.7, arm: true }, xo: { H: 0.66, arm: true }, station: { H: 0.56, arm: false }, dining: { H: 0.48, arm: false } };
const RECLINE = 0.3; // back leans about 17 degrees
// profile helpers: x = forward, y = up (sideGeo turns x to face -z, the way the sitter faces)
function chairLines(H) {
  const B0 = new THREE.Vector2(-0.17, 0.16), B1 = new THREE.Vector2(-0.17 - (H - 0.16) * RECLINE, H);
  const d = B1.clone().sub(B0).normalize(), nf = new THREE.Vector2(d.y, -d.x); // nf: out of the back toward the sitter
  return { B0, B1, nf, at: (P, k) => P.clone().add(nf.clone().multiplyScalar(k)) };
}
function shellShape(H) {
  const { B0, B1, at } = chairLines(H), o = -0.045, s = new THREE.Shape();
  const B0o = at(B0, o), B1o = at(B1, o);
  s.moveTo(0.27, 0.07); s.lineTo(-0.08, 0.07); s.quadraticCurveTo(-0.17, 0.07, B0.x, B0.y); s.lineTo(B1.x, B1.y);
  s.quadraticCurveTo(B1.x - 0.005, B1.y + 0.03, (B1.x + B1o.x) / 2, B1.y + 0.03); s.quadraticCurveTo(B1o.x, B1o.y + 0.025, B1o.x, B1o.y);
  s.lineTo(B0o.x, B0o.y - 0.02); s.quadraticCurveTo(-0.2, 0.025, -0.1, 0.02); s.lineTo(0.22, 0.02); s.quadraticCurveTo(0.28, 0.02, 0.28, 0.05); s.closePath();
  return s;
}
function cushionShape(H) {
  const { B0, B1, at } = chairLines(H), t = 0.07, s = new THREE.Shape();
  const B0c = at(B0, t), top = at(B1, t).add(new THREE.Vector2(0.008, -0.04));
  s.moveTo(0.25, 0.07); s.quadraticCurveTo(0.295, 0.07, 0.295, 0.11); s.quadraticCurveTo(0.295, 0.148, 0.24, 0.148);
  s.lineTo(-0.01, 0.142); s.quadraticCurveTo(B0c.x + 0.02, 0.142, B0c.x, B0c.y + 0.02); s.lineTo(top.x, top.y);
  s.quadraticCurveTo(top.x - 0.01, B1.y + 0.012, B1.x + 0.005, B1.y - 0.004); s.lineTo(B0.x, B0.y); s.quadraticCurveTo(-0.17, 0.07, -0.08, 0.07); s.closePath();
  return s;
}
// side wing: covers the seat side, rises to an arm line, then follows the back's rear edge up to the shoulder
function wingShape(H, arm) {
  const { B0, B1, at } = chairLines(H), o = -0.045, s = new THREE.Shape(), ay = arm ? 0.27 : 0.19;
  const B1o = at(B1, o), sh = at(B0.clone().lerp(B1, 0.82), 0.02);
  s.moveTo(0.25, 0.02); s.quadraticCurveTo(0.27, ay, 0.16, ay); s.lineTo(-0.02, ay);
  s.quadraticCurveTo(-0.13, ay, sh.x, sh.y); s.quadraticCurveTo(B1.x + 0.01, B1.y - 0.02, B1o.x, B1o.y - 0.04);
  s.lineTo(at(B0, o).x, at(B0, o).y - 0.02); s.quadraticCurveTo(-0.2, 0.025, -0.1, 0.02); s.closePath();
  return s;
}
function makeChair(parent, kind, leather) {
  const g = new THREE.Group(); parent.add(g);
  const cap = kind === 'captain', dine = kind === 'dining', L = leather || MAT.leather, D = CHAIR_DIM[kind] || CHAIR_DIM.station;
  const sx = cap ? 1.1 : dine ? 0.92 : 1.0, H = D.H;
  mesh(chairBase(), CHAIR_BASE_MAT, 0, 0, 0, g);
  const sw = group(0, 0.36, 0, 0, g); sw.scale.set(sx, 1, sx); // the swivel: everything above the pedestal
  const rock = group(0, 0, 0, 0, sw);                            // and a little rock on top of it
  // the shell, the continuous cushion, and the two side wings
  mesh(sideGeo('shell' + H, () => shellShape(H), 0.58, 0.02), MAT_SHELL, 0, 0, 0.04, rock);
  mesh(sideGeo('cush' + H, () => cushionShape(H), 0.5, 0.028), L, 0, 0, 0.04, rock);
  [-1, 1].forEach((sd) => mesh(sideGeo('wing' + H + D.arm, () => wingShape(H, D.arm), 0.04, 0.014), MAT_SHELL, sd * 0.3, 0, 0.04, rock));
  // seams: across the seat, and two across the back, following its lean
  mesh(BOX(0.42, 0.006, 0.008), MAT.leatherDark, 0, 0.146, -0.12, rock);
  const { B0, B1, nf } = chairLines(H);
  [0.3, 0.62].forEach((f) => { const q = B0.clone().lerp(B1, f).add(nf.clone().multiplyScalar(0.071)); const m = mesh(BOX(0.42, 0.008, 0.006), MAT.leatherDark, 0, q.y, 0.04 - q.x, rock); m.rotation.x = -RECLINE; });
  if (D.arm) [-1, 1].forEach((sd) => mesh(pillow(0.08, 0.045, cap ? 0.4 : 0.34, 0.02, 0.008, 'y', 0), L, sd * 0.3, 0.29, -0.04, rock));
  if (cap) { const q = B1.clone(); const m = mesh(BOX(0.3, 0.014, 0.014), STRIP, 0, q.y - 0.12, 0.04 - q.x + 0.07, rock); m.rotation.x = -RECLINE; }
  const c = { g, sw, rock, home: 0, yaw: 0, vel: 0, tilt: 0, tiltV: 0, cap, p: null };
  g.userData.swivel = sw; g.userData.chair = c; CHAIRS.push(c);
  return g;
}
// a chair at rest is rarely square: give each a slight, fixed set-off
function chairRest(c, yaw) { c.home = c.yaw = yaw; c.sw.rotation.y = yaw; }
let _cpx = null, _cpz = null;
function chairsUpdate(dt) {
  if (dt <= 0) return;
  const vx = _cpx === null ? 0 : (player.x - _cpx) / dt, vz = _cpz === null ? 0 : (player.z - _cpz) / dt; _cpx = player.x; _cpz = player.z;
  const sp = Math.hypot(vx, vz), wp = new THREE.Vector3();
  for (const c of CHAIRS) {
    if (!c.p) { c.g.updateWorldMatrix(true, false); c.p = c.g.getWorldPosition(wp).clone(); }
    if (Math.abs(c.p.y - deckY(LIFT.deck)) > 1.5 && !(c.p.y > -0.5 && LIFT.deck === 1)) continue;
    const dx = player.x - c.p.x, dz = player.z - c.p.z, d = Math.hypot(dx, dz);
    if (d < 0.78 && sp > 0.05 && !state.sitting) {
      const touch = 1 - d / 0.78, cross = dx * vz - dz * vx; // which way the brush turns the chair
      c.vel += -cross * 6 * touch * dt; c.tiltV += sp * 1.2 * touch * dt;
    }
    if (c.cap && state.sitting) c.vel += (0 - c.yaw) * 8 * dt - c.vel * 6 * dt;
    else c.vel += (c.home - c.yaw) * 0.35 * dt; // a self-centring swivel brings it back, slowly
    c.vel *= Math.exp(-dt * 2.2); c.vel = clamp(c.vel, -4, 4); c.yaw += c.vel * dt;
    c.tiltV += (-c.tilt * 60 - c.tiltV * 7) * dt; c.tilt += c.tiltV * dt;
    if (Math.abs(c.vel) > 1e-4 || Math.abs(c.tilt) > 1e-4 || Math.abs(c.yaw - c.sw.rotation.y) > 1e-4) { c.sw.rotation.y = c.yaw; c.rock.rotation.x = clamp(c.tilt, -0.08, 0.08); }
  }
}

// ---------- station furniture (shared) ----------
// Stations are built in layers, like working consoles: a sculpted tan pedestal on a dark plinth with an
// alert-coloured underglow, a sloped glass desk with a touch panel and key strip, an upright screen bank,
// and physical details: speaker grilles, ID plates, access panels and lit push-buttons.
const MAT_PED = triSurface(new THREE.MeshStandardMaterial({ color: 0xc9b89d, roughness: 0.55, metalness: 0.05, envMapIntensity: 0.35 }), { set: 'paint', metres: 0.7, ns: 0.6, rv: 0.6, edge: 0.35 });
const MAT_TRIM = triSurface(new THREE.MeshStandardMaterial({ color: 0x3a3632, roughness: 0.42, metalness: 0.5, envMapIntensity: 0.6 }), { set: 'paint', metres: 0.7, ns: 0.8, rv: 0.7, edge: 0.5 });
const GRILLE = (() => {
  const c = cnv(128, 64), g = c.getContext('2d'); g.fillStyle = '#26231f'; g.fillRect(0, 0, 128, 64);
  for (let y = 4; y < 64; y += 6) for (let x = 4 + (y % 12 ? 3 : 0); x < 128; x += 6) { g.fillStyle = '#0b0a09'; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0.4, envMapIntensity: 0.3 });
})();
const BTN_MATS = ['#E8A06A', '#D9B07E', '#B693C4', '#F2C88F', '#C67A86'].map((h) => new THREE.MeshBasicMaterial({ color: new THREE.Color(h).multiplyScalar(0.85), toneMapped: false }));
// Crisp text in 3D space (troika-three-text: glyphs drawn from the font's outlines as signed-distance fields, so the
// edges stay sharp at any distance). Returns null when the library didn't load, so callers fall back to canvas text.
const FONT3D = 'fonts/antonio-600.woff'; // woff, not woff2: troika's parser doesn't read woff2
function text3d(parent, txt, size, color, x, y, z, anchorX) {
  if (!THREE.TroikaText) return null;
  const t = new THREE.TroikaText();
  Object.assign(t, { text: txt, font: FONT3D, fontSize: size, anchorX: anchorX || 'left', anchorY: 'middle', letterSpacing: 0.02, sdfGlyphSize: 64 });
  t.material = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  t.position.set(x, y, z); parent.add(t); t.sync(); return t;
}
function idPlate(parent, code, x, y, z, w) {
  const crisp = !!THREE.TroikaText, c = cnv(256, 64), g = c.getContext('2d'); g.fillStyle = '#b9a789'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#2b2229'; g.fillRect(6, 6, 244, 52);
  g.fillStyle = '#E8A06A'; g.fillRect(6, 6, 36, 52);
  if (!crisp) { g.fillStyle = '#F5E6CF'; g.font = `600 30px ${DISP}`; g.textBaseline = 'middle'; g.fillText(code, 54, 33); }
  const m = mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.4, metalness: 0.6 }), x, y, z, parent);
  if (crisp) text3d(m, code, w * 0.13, 0xF5E6CF, -w / 2 + w * 54 / 256, 0, 0.0015);
  return m;
}
function grille(parent, x, y, z, w, h) { const m = mesh(new THREE.PlaneGeometry(w, h), GRILLE.clone(), x, y, z, parent); m.material.map = GRILLE.map.clone(); m.material.map.repeat.set(w / 0.3, h / 0.15); m.material.map.needsUpdate = true; return m; }
function buttons(parent, n, x0, x1, y, z, seed) {
  const r = mulberry(seed);
  for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * (n === 1 ? 0.5 : i / (n - 1)); mesh(RBOX(0.045, 0.022, 0.03, 0.008), BTN_MATS[(r() * BTN_MATS.length) | 0], x, y, z, parent); }
}


const MAT_PAD = triSurface(new THREE.MeshStandardMaterial({ color: 0x080b12, roughness: 0.62, metalness: 0.04, envMapIntensity: 0.25 }), { set: 'leather', metres: 0.3, ns: 1.6, rv: 0.8, low: 0 });
const MAT_FRAME = triSurface(new THREE.MeshStandardMaterial({ color: 0x423d37, roughness: 0.5, metalness: 0.06, envMapIntensity: 0.35 }), { set: 'paint', metres: 0.7, ns: 0.5, rv: 0.5, edge: 0.3 });
const MAT_BEZEL = triSurface(new THREE.MeshStandardMaterial({ color: 0x332e29, roughness: 0.5, metalness: 0.05, envMapIntensity: 0.35 }), { set: 'paint', metres: 0.7, ns: 0.6, rv: 0.6, edge: 0.35 });
const MAT_SLAT = new THREE.MeshStandardMaterial({ color: 0x1e1c1a, roughness: 0.38, metalness: 0.55, envMapIntensity: 0.6 });
const MAT_VOID = new THREE.MeshBasicMaterial({ color: 0x000000 });
const TAG_MAT = new THREE.MeshStandardMaterial({ color: 0x5a1a1e, roughness: 0.45, metalness: 0.2, envMapIntensity: 0.4 });
const TAG_INK = new THREE.MeshBasicMaterial({ color: 0xE8D8C0, toneMapped: false });
// many small boxes merged into one mesh (the grille slats), so the run stays a handful of draw calls
const _merged = new Map();
function mergedBoxes(key, list) {
  if (_merged.has(key)) return _merged.get(key);
  const parts = list.map(([w, h, d, x, y, z]) => new THREE.BoxGeometry(w, h, d).translate(x, y, z).toNonIndexed());
  const n = parts.reduce((a, q) => a + q.attributes.position.count, 0), out = new THREE.BufferGeometry();
  ['position', 'normal', 'uv'].forEach((k) => { const sz = parts[0].attributes[k].itemSize, arr = new Float32Array(n * sz); let o = 0; parts.forEach((q) => { arr.set(q.attributes[k].array, o); o += q.attributes[k].array.length; }); out.setAttribute(k, new THREE.BufferAttribute(arr, sz)); });
  _merged.set(key, out); return out;
}
// a soft glow that a display throws onto the bezel around it: a frame-shaped additive card, clear in the middle
const _spill = new Map();
function spillTex(ax, ay) {
  const k = ax.toFixed(2) + 'x' + ay.toFixed(2); if (_spill.has(k)) return _spill.get(k);
  const W = 256, H = Math.max(32, Math.round(256 * ay)), c = cnv(W, H), g = c.getContext('2d'), mx = W * 0.16, my = H * 0.16 / ay;
  g.shadowColor = 'rgba(255,214,170,1)'; g.shadowBlur = Math.min(mx, my) * 0.9; g.fillStyle = 'rgba(255,214,170,1)'; g.fillRect(mx, my, W - 2 * mx, H - 2 * my);
  g.shadowBlur = 0; g.globalCompositeOperation = 'destination-out'; g.fillRect(mx + 1, my + 1, W - 2 * mx - 2, H - 2 * my - 2);
  const t = tex(c); _spill.set(k, t); return t;
}
function spill(parent, w, h, strength) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.47, h + w * 0.47), new THREE.MeshBasicMaterial({ map: spillTex(1, (h + w * 0.47) / (w * 1.47)), transparent: true, opacity: strength, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  parent.add(m); return m;
}
// a desktop that is one display: a black bed, the desk screen (kind 'desk', drawing the station's own readouts in
// its middle panel), its glow on the bezel, and optionally a small hooded viewer standing up behind it.
// d: a group whose +y is up out of the desk and +z toward the sitter; yTop: the bezel's top surface.
// Desk displays lie nearly flat and look straight up at the ceiling lights, so their smudged glass reflects at a
// fraction of the strength of the upright screens' glass (otherwise the whole desktop washes out white).
const DESK_GLASS = copyPatches(GLASS_MAT, GLASS_MAT.clone()); DESK_GLASS.opacity = 0.22;
SURF.ready().then(() => { DESK_GLASS.roughnessMap = GLASS_MAT.roughnessMap; DESK_GLASS.needsUpdate = true; });
function deskSurface(d, W, dd, yTop, zc, p, sub, hoodX) {
  const dw = W - 0.16;
  mesh(BOX(dw + 0.02, 0.004, dd + 0.02), MAT_VOID, 0, yTop - 0.001, zc, d);
  const ds = group(0, yTop + 0.0015, zc, 0, d); ds.rotation.x = -Math.PI / 2;
  const sc = addScreen(ds, dw, dd, 1024, Math.round(1024 * dd / dw), 'desk', p.id, p.title, p.code); sc.sub = sub;
  sc.mesh.children.forEach((c) => { if (c.material === GLASS_MAT) c.material = DESK_GLASS; });
  const dsp = spill(ds, dw, dd, 0.12); dsp.position.z = 0.002;
  if (hoodX === undefined) return;
  const hv = group(hoodX, yTop - 0.0025, zc - dd / 2 - 0.07, 0, d);
  mesh(RBOX(0.36, 0.1, 0.15, 0.025), MAT_BEZEL, 0, 0.05, 0, hv);
  mesh(RBOX(0.38, 0.022, 0.19, 0.01), MAT_BEZEL, 0, 0.105, 0.02, hv);
  mesh(BOX(0.3, 0.058, 0.01), MAT_VOID, 0, 0.052, 0.074, hv);
  const vs = group(0, 0.052, 0.08, 0, hv); vs.rotation.x = -0.12; addScreen(vs, 0.28, 0.05, 336, 60, 'scope', p.id, p.title, p.code);
}
// a low desk in front of a dais seat; screens tilt toward the seat (+z)
function lowDesk(x, z, rot, w, kind, station, title, code) {
  const g = group(x, DAIS.h, z, rot);
  mesh(RBOX(w, 0.56, 0.42, 0.05), MAT_PED, 0, 0.32, 0, g);
  [-1, 1].forEach((sd) => mesh(RBOX(0.04, 0.58, 0.44, 0.015), MAT_TRIM, sd * (w / 2 + 0.01), 0.32, 0, g));
  mesh(RBOX(w - 0.08, 0.06, 0.32, 0.02), MAT.gunDark, 0, 0.03, 0, g);
  mesh(BOX(w - 0.12, 0.016, 0.016), STRIP, 0, 0.05, 0.17, g);
  grille(g, 0, 0.3, 0.212, w * 0.5, 0.12);
  const top = group(0, 0.62, 0, 0, g); top.rotation.x = 0.32;
  mesh(RBOX(w + 0.04, 0.05, 0.52, 0.02), MAT_BEZEL, 0, 0, 0, top);
  mesh(pillow(w + 0.04, 0.06, 0.08, 0.025, 0.006, 'y', 0), MAT_PAD, 0, 0.004, 0.29, top);
  deskSurface(top, w + 0.04, 0.4, 0.025, 0.0, { id: station, title, code }, kind);
  addHit(BOX(w + 0.2, 1.2, 1.3), { station }, g, 0, 0.6, 0.45);
  return g;
}

// ---------- command dais: XO | Captain | Tactical ----------
mesh(new THREE.CylinderGeometry(DAIS.r, DAIS.r + 0.04, DAIS.h, 72), [MAT.gun, MAT.dais, MAT.gun], DAIS.x, DAIS.h / 2, DAIS.z);
{ const t = mesh(new THREE.TorusGeometry(DAIS.r + 0.01, 0.025, 8, 120), MAT.steel, DAIS.x, DAIS.h, DAIS.z); t.rotation.x = Math.PI / 2; }
{ const t = mesh(new THREE.TorusGeometry(DAIS.r + 0.03, 0.012, 6, 120), STRIP, DAIS.x, DAIS.h - 0.05, DAIS.z); t.rotation.x = Math.PI / 2; }
ao(DAIS.x, DAIS.z, DAIS.r * 2.6, DAIS.r * 2.6, 0.55);
const capChair = group(0, DAIS.h, 0.45); const capSw = makeChair(capChair, 'captain').userData.swivel;
[-1, 1].forEach((sd) => { const sg = group(sd * 0.29, 0.33, -0.12, 0, capSw); const sc = addScreen(sg, 0.06, 0.26, 128, 352, 'cmd', 'command', 'Command', 'CMD'); sc.mesh.rotation.x = -Math.PI / 2 + 0.06; });
ao(0, 0.45, 1.2, 1.2, 0.6, DAIS.h);
addHit(BOX(1.0, 1.8, 1.0), { station: 'command' }, null, 0, DAIS.h + 0.9, 0.45);
const SEAT_XO = { x: -1.3, z: 0.65 }, SEAT_TAC = { x: 1.3, z: 0.65 };
const xoSeat = group(SEAT_XO.x, DAIS.h, SEAT_XO.z, -0.1); makeChair(xoSeat, 'xo');
const tacSeat = group(SEAT_TAC.x, DAIS.h, SEAT_TAC.z, 0.1); makeChair(tacSeat, 'xo');
lowDesk(SEAT_XO.x - 0.07, SEAT_XO.z - 0.72, -0.1, 0.95, 'ops', 'ops', 'First Officer', 'XO·00');
lowDesk(SEAT_TAC.x + 0.07, SEAT_TAC.z - 0.72, 0.1, 1.05, 'tac', 'defense', 'Tactical', 'TAC·01');
[SEAT_XO, SEAT_TAC].forEach((p) => { ao(p.x, p.z - 0.3, 1.2, 1.6, 0.6, DAIS.h); });
const TAC = { x: SEAT_TAC.x, z: SEAT_TAC.z };

// ---------- flight and operations pods ----------
// Seen from the side: a wedge that leans toward the viewscreen, with a recess for the operator's knees.
// The operator sits aft (+z); the sloped glass top faces them; the front face carries a second screen and a grille.
function podShape() { const s = new THREE.Shape(); s.moveTo(-0.08, 0); s.lineTo(0.34, 0); s.lineTo(0.44, 0.9); s.quadraticCurveTo(0.45, 0.95, 0.4, 0.95); s.lineTo(-0.36, 0.76); s.lineTo(-0.36, 0.69); s.quadraticCurveTo(-0.14, 0.62, -0.1, 0.42); s.closePath(); return s; }
function pod(x, z, station, kindA, titleA, codeA) {
  const g = group(x, 0, z, 0);
  mesh(sideGeo('pod-body', podShape, 1.24, 0.03), MAT_PED, 0, 0.07, 0, g);
  [-1, 1].forEach((sd) => mesh(sideGeo('pod-cheek', podShape, 0.05, 0.015), MAT_TRIM, sd * 0.64, 0.07, 0, g));
  mesh(RBOX(1.18, 0.08, 0.36, 0.02), MAT.gunDark, 0, 0.04, 0.12, g);
  mesh(BOX(1.1, 0.018, 0.018), STRIP, 0, 0.05, -0.08, g);
  [-1, 1].forEach((sd) => mesh(BOX(0.018, 0.018, 0.3), STRIP, sd * 0.56, 0.05, 0.12, g));
  // sloped top: one desk display under a thick bezel, a padded lip toward the operator, a hooded viewer behind
  const top = group(0, 0.07 + 0.86, 0.02, 0, g); top.rotation.x = 0.235;
  mesh(RBOX(1.3, 0.07, 0.84, 0.024), MAT_BEZEL, 0, 0.0, 0, top);
  mesh(pillow(1.3, 0.07, 0.08, 0.028, 0.006, 'y', 0), MAT_PAD, 0, 0.004, 0.45, top);
  deskSurface(top, 1.3, 0.46, 0.035, 0.06, { id: station, title: titleA, code: codeA }, kindA, -0.3);
  // front face toward the viewscreen: a second screen, the grille and the station plate
  const f = group(0, 0.07, -0.455, Math.PI, g); f.rotation.x = 0.11;
  const fs = group(0, 0.7, 0.012, 0, f); display(fs, 0.66, 0.24, 420, 152, kindA, station, titleA, codeA);
  grille(f, 0, 0.36, 0.02, 0.66, 0.2);
  idPlate(f, codeA, 0, 0.2, 0.022, 0.26);
  addHit(BOX(1.6, 1.5, 1.0), { station }, g, 0, 0.75, 0);
  const ch = makeChair(scene, 'station'); ch.position.set(x, 0, z + 0.7); chairRest(ch.userData.chair, (x > 0 ? -1 : 1) * 0.12);
  ao(x, z, 1.8, 1.2, 0.65); ao(x, z + 0.7, 0.9, 0.9, 0.55);
  pool(x, z + 0.45, 1.6, 1.0, 0xffe2c8, 0.12);
  return g;
}
pod(-1.4, -3.15, 'helm', 'helm', 'Flight', 'FLT·01');
pod(1.4, -3.15, 'ops', 'ops', 'Operations', 'OPS·02');

// ---------- side console runs (three positions each) ----------
const RUNS = [
  { side: -1, posts: [{ id: 'science', kind: 'sci', title: 'Science', code: 'SCI·03', z: -1.55 }, { id: 'intel', kind: 'intel', title: 'Intelligence', code: 'INT·04', z: 0 }, { id: 'comms', kind: 'com', title: 'Communications', code: 'COM·05', z: 1.55 }] },
  { side: 1, posts: [{ id: 'engineering', kind: 'sys', title: 'Engineering', code: 'ENG·06', z: -1.55 }, { id: 'env', kind: 'env', title: 'Environment', code: 'ENV·07', z: 0 }, { id: 'damage', kind: 'dmg', title: 'Damage Control', code: 'DMG·08', z: 1.55 }] },
];
const DOWNLIGHTS = [[-1.4, -3.15], [1.4, -3.15], [0, 3.55]];
// Workstation furniture (screens pass 3). The screens are the furniture: each position is a deep sloped desk whose
// whole top is one display under a thick bezel with a padded dark lip, a small hooded viewer standing up at the back,
// a ribbed grille band on the wall behind, and the upper displays let into a thick wall frame with deep cut-outs and
// a lit ledge. Below the desk, a recessed apron of padded panels. Local axes: x along the run, +z toward the room,
// the wall face at z = -0.34.
// the frame that holds the upper displays: one thick extruded panel with rounded cut-outs
function cutFrame(key, W, H, holes) {
  const k = 'cut:' + key; if (_xg.has(k)) return _xg.get(k);
  const s = new THREE.Shape(); s.moveTo(-W / 2, -H / 2); s.lineTo(W / 2, -H / 2); s.lineTo(W / 2, H / 2); s.lineTo(-W / 2, H / 2); s.closePath();
  holes.forEach(([cx, cy, hw, hh, r]) => { const p = new THREE.Path(), x0 = cx - hw / 2, y0 = cy - hh / 2; p.moveTo(x0 + r, y0); p.lineTo(x0 + hw - r, y0); p.quadraticCurveTo(x0 + hw, y0, x0 + hw, y0 + r); p.lineTo(x0 + hw, y0 + hh - r); p.quadraticCurveTo(x0 + hw, y0 + hh, x0 + hw - r, y0 + hh); p.lineTo(x0 + r, y0 + hh); p.quadraticCurveTo(x0, y0 + hh, x0, y0 + hh - r); p.lineTo(x0, y0 + r); p.quadraticCurveTo(x0, y0, x0 + r, y0); s.holes.push(p); });
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.13, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 6 });
  _xg.set(k, geo); return geo;
}
const DESK = { y: 0.8, z: 0.02, tilt: 0.14, depth: 0.76 };
// one bay of the console run, wallW wide, centred on lx; with a post (p) it carries that station's displays
const FH = 0.84, FY = 1.33 + FH / 2;
function bay(parent, lx, wallW, p, holes) {
  const b = group(lx, 0, 0, 0, parent), W = wallW - 0.012;
  // kick plinth with its underglow, the recessed apron and its padded panels
  mesh(RBOX(W, 0.1, 0.34, 0.02), MAT.gunDark, 0, 0.05, -0.14, b);
  mesh(BOX(W - 0.06, 0.016, 0.016), STRIP, 0, 0.06, 0.04, b);
  mesh(RBOX(W, 0.62, 0.36, 0.02), MAT_TRIM, 0, 0.41, -0.15, b);
  const np = Math.max(1, Math.round(W / 0.4)), pw = W / np;
  for (let i = 0; i < np; i++) mesh(pillow(pw - 0.026, 0.56, 0.05, 0.02, 0.012, '+z', 0), MAT_PAD, -W / 2 + pw * (i + 0.5), 0.41, 0.05, b);
  // the desk: a thick bezel sloping toward the sitter, a padded lip along the front edge
  const d = group(0, DESK.y, DESK.z, 0, b); d.rotation.x = DESK.tilt;
  mesh(RBOX(W, 0.065, DESK.depth, 0.028), MAT_BEZEL, 0, 0, 0, d);
  mesh(pillow(W, 0.07, 0.1, 0.03, 0.008, 'y', 0), MAT_PAD, 0, 0.006, DESK.depth / 2 + 0.035, d);
  // the wall behind: a ribbed grille band, then the frame for the upper displays on a lit ledge, then the status shelf
  mesh(BOX(W, 0.44, 0.02), MAT.gunDark, 0, 1.1, -0.33, b);
  const slats = []; for (let k = 0; k < 15; k++) slats.push([W - 0.03, 0.011, 0.028, 0, 0.905 + k * 0.0275, 0]);
  mesh(mergedBoxes('slats' + W.toFixed(3), slats), MAT_SLAT, 0, 0, -0.31, b);
  mesh(RBOX(W, 0.035, 0.2, 0.012), MAT_FRAME, 0, 1.315, -0.24, b);
  mesh(BOX(W - 0.04, 0.012, 0.012), STRIP, 0, 1.295, -0.145, b);
  mesh(RBOX(W, 0.24, 0.3, 0.03), MAT_TRIM, 0, 2.3, -0.2, b);
  if (!p) return { b, d };
  const w = W - 0.14, mw = w * 0.72, aw = w - mw - 0.08, sh = 0.56, mx = -w / 2 + mw / 2, ax = w / 2 - aw / 2;
  if (holes) holes.push([lx + mx, 0.01, mw + 0.07, sh + 0.08, 0.05], [lx + ax, 0.01, aw + 0.07, sh + 0.08, 0.05]);
  // displays sit at the back of the cut-outs, inside a dark inner bezel
  [[mx, mw, p.kind], [ax, aw, 'aux']].forEach(([x, sw, kind]) => {
    const sg = group(x, FY + 0.01, -0.285, 0, b);
    mesh(RBOX(sw + 0.05, sh + 0.05, 0.03, 0.012), MAT.gunDark, 0, 0, -0.016, sg);
    const s = addScreen(sg, sw, sh, Math.round(700 * sw / sh), 700, kind, p.id, p.title, p.code); s.mesh.position.z = 0.002;
    const sp = spill(sg, sw, sh, 0.1); sp.position.z = 0.004;
  });
  const sg = group(0, 2.3, -0.048, 0, b); sg.rotation.x = 0.35; addScreen(sg, w, 0.13, 760, 80, 'strip', p.id, p.title, p.code);
  // small dark-red tags in the frame's top margin over each display, like stencilled panel labels
  [[mx - mw / 2 + 0.09, 'A'], [ax - aw / 2 + 0.07, 'B']].forEach(([tx, sfx], i) => {
    const tg = mesh(BOX(0.13, 0.03, 0.004), TAG_MAT, tx, FY + FH / 2 - 0.045, -0.184, b);
    mesh(BOX(0.022, 0.018, 0.002), TAG_INK, -0.045, 0, 0.003, tg);
    if (!text3d(tg, String(p.code).replace('·', ' ') + sfx, 0.016, 0xE8D8C0, -0.028, 0, 0.0025)) mesh(BOX(0.07, 0.004, 0.002), TAG_INK, 0.015, 0, 0.003, tg);
  });
  idPlate(b, p.code, -W / 2 + 0.2, 1.315, -0.138, 0.2);
  // the desk display fills the desk; a hooded viewer stands up at the back on the left
  deskSurface(d, W, 0.46, 0.0325, 0.03, p, p.kind, -W * 0.26);
  return { b, d };
}
// the run-wide body: end fins with a lit pillar in each, and plain bays filling from the last post out to the fins
function consoleBody(g, L, used, holes) {
  mesh(cutFrame('run' + L + ':' + holes.map((h) => h[0].toFixed(3)).join(','), L, FH, holes), MAT_FRAME, 0, FY, -0.34 + 0.012, g);
  [-1, 1].forEach((sd) => {
    mesh(RBOX(0.08, 2.36, 0.74, 0.025), MAT_FRAME, sd * (L / 2 + 0.04), 1.18, -0.02, g);
    mesh(BOX(0.02, 2.2, 0.02), MAT_TRIM, sd * (L / 2 + 0.04), 1.18, 0.35, g);
    mesh(RBOX(0.05, 1.5, 0.03, 0.012), SLOT, sd * (L / 2 + 0.04), 1.3, 0.36, g);
    const fw = (L - used) / 2; if (fw > 0.05) bay(g, sd * (used / 2 + fw / 2), fw, null);
  });
}
function post(parent, lx, p, wallW, holes) {
  const st = group(lx, 0, 0, 0, parent);
  bay(parent, lx, wallW, p, holes);
  addHit(BOX(Math.min(1.5, wallW + 0.1), 2.6, 1.3), { station: p.id }, st, 0, 1.3, 0.1);
  st.updateWorldMatrix(true, false);
  const cw = new THREE.Vector3(); st.localToWorld(cw.set(0, 0, 1.02));
  const ch = makeChair(scene, 'station'); ch.position.set(cw.x, 0, cw.z); ch.rotation.y = parent.rotation.y; chairRest(ch.userData.chair, Math.sin(cw.x * 7 + cw.z * 3) * 0.22);
  ao(cw.x, cw.z, 0.9, 0.9, 0.55); extraObs.push({ x: cw.x, z: cw.z, r: 0.36 });
  const pw = new THREE.Vector3(); st.localToWorld(pw.set(0, 0, 0.55)); pool(pw.x, pw.z, 1.3, 1.6, 0xffe2c8, 0.08);
  const dl = new THREE.Vector3(); st.localToWorld(dl.set(0, 0, 0.7)); DOWNLIGHTS.push([dl.x, dl.z]);
}
RUNS.forEach((run) => {
  const rot = -run.side * Math.PI / 2;
  const g = group(run.side * SIDE_X - run.side * 0.34, 0, 0, rot);
  const holes = [];
  run.posts.forEach((p) => post(g, run.side < 0 ? -p.z : p.z, p, 1.55, holes));
  consoleBody(g, 4.7, 1.55 * 3, holes);
  mesh(BOX(4.7, 0.02, 0.02), SLOT, 0, 2.71, -0.03, g);
  const aoc = new THREE.Vector3(); g.updateMatrixWorld(true); g.localToWorld(aoc.set(0, 0, 0)); ao(aoc.x, aoc.z, 1.3, 5.2, 0.6);
});
// ---------- forward-angled walls: Weapons Control and Electronic Warfare ----------
[[1, { id: 'weapons', kind: 'wpn', title: 'Weapons Control', code: 'WPN·09' }], [7, { id: 'ew', kind: 'ew', title: 'Electronic Warfare', code: 'EW·10' }]].forEach(([ei, p]) => {
  const e = EDGES[ei];
  const g = group(e.mx + e.nx * 0.34, 0, e.mz + e.nz * 0.34, e.rot);
  const holes = [];
  post(g, 0, p, 1.9, holes);
  consoleBody(g, 2.1, 1.9, holes);
  g.updateMatrixWorld(true);
  const c1 = new THREE.Vector3(); [-0.7, 0, 0.7].forEach((lx) => { g.localToWorld(c1.set(lx, 0, 0)); extraObs.push({ x: c1.x, z: c1.z, r: 0.4 }); });
  const aoc = new THREE.Vector3(); g.localToWorld(aoc.set(0, 0, 0)); ao(aoc.x, aoc.z, 2.4, 1.4, 0.6);
});
scene.updateMatrixWorld(true);

// ---------- main viewscreen (armored frame) ----------
const VS_W = 5.0, VS_H = 2.25, VS_Y = 1.86, VS_Z = FWD_Z + 0.1;
const rt = new THREE.WebGLRenderTarget(isMobile ? 1024 : 1600, isMobile ? 460 : 720, { type: THREE.HalfFloatType, generateMipmaps: false, samples: 4 });
const vcam = new THREE.PerspectiveCamera(36, VS_W / VS_H, 0.5, 900); vcam.position.set(0, 2, FWD_Z); vcam.layers.set(1);
const vLook = new THREE.Vector3(0, 2, -300), vFwd = new THREE.Vector3(0, 2, -300);
mesh(new THREE.PlaneGeometry(VS_W, VS_H), new THREE.MeshBasicMaterial({ map: rt.texture, color: new THREE.Color(1.24, 1.24, 1.24) }), 0, VS_Y, VS_Z); // a touch brighter than the raw render
const ovC = cnv(1024, 460), ovG = ovC.getContext('2d'), ovTex = tex(ovC);
const ovMat = new THREE.MeshBasicMaterial({ map: ovTex, transparent: true, toneMapped: false, depthWrite: false, opacity: 0 });
mesh(new THREE.PlaneGeometry(VS_W, VS_H), ovMat, 0, VS_Y, VS_Z + 0.01);
// rounded picture edge with a soft inner falloff, so the image sits inside the bezel like a window rather than a decal
{
  const c = cnv(1024, 460), g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 1024, 460);
  g.globalCompositeOperation = 'destination-out';
  // draw the hole far off-canvas and let only its blurred shadow land in place: a soft inner edge, no bleed past the corners
  g.shadowColor = '#000'; g.shadowBlur = 18; g.shadowOffsetX = 4000; g.beginPath(); g.roundRect(44 - 4000, 40, 936, 380, 40); g.fill(); g.shadowOffsetX = 0;
  g.globalCompositeOperation = 'source-over'; g.shadowBlur = 0;
  const top = g.createLinearGradient(0, 24, 0, 90); top.addColorStop(0, 'rgba(0,0,0,0.45)'); top.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = top; g.fillRect(0, 0, 1024, 90);
  mesh(new THREE.PlaneGeometry(VS_W, VS_H), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, toneMapped: false, depthWrite: false }), 0, VS_Y, VS_Z + 0.02);
  // the glass: only its reflections show (black albedo, additive), catching the bridge lights as you move
  mesh(new THREE.PlaneGeometry(VS_W, VS_H), new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.06, metalness: 0, envMapIntensity: 0.9, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false }), 0, VS_Y, VS_Z + 0.03);
}
{
  const fz = FWD_Z + 0.2, OP = 0.11; // OP: the armoured frame stands this far out from the picture, round a chamfered reveal
  mesh(RBOX(VS_W + 0.9 + OP * 2, 0.36, 0.34, 0.05), MAT.gun, 0, VS_Y + VS_H / 2 + 0.18 + OP, fz);
  mesh(RBOX(VS_W + 0.9 + OP * 2, 0.42, 0.4, 0.05), MAT.gun, 0, VS_Y - VS_H / 2 - 0.21 - OP, fz + 0.02);
  // the reveal: four dark panels angled from the picture's edge out to the frame's face, so the picture sits back
  // inside the hull like a window, and the edges catch a little of its light
  { const dz = 0.25, z0 = VS_Z + 0.005, ang = Math.atan2(OP, dz), len = Math.hypot(OP, dz);
    [[0, 1, VS_W], [0, -1, VS_W], [1, 0, VS_H], [-1, 0, VS_H]].forEach(([sx, sy, run]) => {
      const pg = group(sx * (VS_W / 2 + OP / 2), VS_Y + sy * (VS_H / 2 + OP / 2), z0 + dz / 2, 0);
      if (sy) { mesh(BOX(run + OP * 2, 0.018, len), MAT.gunDark, 0, 0, 0, pg).rotation.x = -sy * ang; }
      else { mesh(BOX(0.018, run + OP * 2, len), MAT.gunDark, 0, 0, 0, pg).rotation.y = sx * ang; }
    });
  }
  [-1, 1].forEach((sd) => {
    mesh(RBOX(0.42, VS_H + 0.8 + OP * 2, 0.38, 0.05), MAT.gun, sd * (VS_W / 2 + 0.24 + OP), VS_Y, fz);
    const gus = mesh(RBOX(0.36, 0.36, 0.3, 0.03), MAT.steel, sd * (VS_W / 2 + 0.02 + OP), VS_Y + VS_H / 2 - 0.02 + OP, fz + 0.06); gus.rotation.z = Math.PI / 4;
    const gus2 = mesh(RBOX(0.36, 0.36, 0.3, 0.03), MAT.steel, sd * (VS_W / 2 + 0.02 + OP), VS_Y - VS_H / 2 + 0.02 - OP, fz + 0.06); gus2.rotation.z = Math.PI / 4;
    for (let k = 0; k < 7; k++) mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), MAT.steel, sd * (VS_W / 2 + 0.24 + OP), VS_Y - VS_H / 2 + 0.2 + k * 0.32, fz + 0.2).rotation.x = Math.PI / 2;
  });
  mesh(BOX(VS_W + 0.1 + OP * 2, 0.02, 0.02), SLOT, 0, VS_Y + VS_H / 2 + 0.01 + OP, fz - 0.16);
  for (let k = 0; k < 18; k++) mesh(BOX(0.09, 0.03, 0.02), k % 5 === 2 ? new THREE.MeshBasicMaterial({ color: 0x34e89e, toneMapped: false }) : STRIP, -1.53 + k * 0.18, VS_Y - VS_H / 2 - 0.21 - OP + 0.15, fz + 0.23); // above the floor plinth
  mesh(RBOX(VS_W + 1.2, 0.5, 0.5, 0.05), MAT.gunDark, 0, 0.25, FWD_Z + 0.25);
  mesh(MAT.hazard ? BOX(VS_W + 1.1, 0.04, 0.01) : BOX(1, 1, 1), MAT.hazard, 0, 0.52, FWD_Z + 0.5);
  ao(0, FWD_Z + 0.5, VS_W + 2, 1.4, 0.55);
  pool(0, FWD_Z + 1.4, VS_W + 1.2, 2.4, 0x8fb0ff, 0.12);
}
addHit(BOX(VS_W + 1, 3.0, 0.6), { station: 'viewer' }, null, 0, VS_Y, FWD_Z + 0.45);
// Viewscreen readouts stay out of the picture: a small caption fades in when something changes
// (view, speed, system) and fades out again; the magnify reticle stays while magnified.
let ovSig = '', ovUntil = 7;
function drawOverlay() {
  const g = ovG, W = 1024, H = 460, P = pal();
  const sig = `${state.view}|${state.speed}|${state.cur}|${state.alert}`;
  if (sig !== ovSig) { ovSig = sig; ovUntil = elapsed + 5; }
  g.clearRect(0, 0, W, H);
  g.font = `500 20px ${DISP}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  const line1 = state.speed === 'warp' ? `EN ROUTE · ${sysDest().star.toUpperCase()}` : `${sysCur().star.toUpperCase()} SYSTEM · ${sysCur().planet.toUpperCase()}`;
  const line2 = `${state.view === 'target' ? 'MAGNIFIED' : 'FORWARD VIEW'} · ${SPEEDS[state.speed].screen}`;
  const x = 76, y = H - 64, w = Math.max(g.measureText(line1).width, g.measureText(line2).width) + 30;
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x - 10, y - 26, w, 58);
  hexTab(g, x - 52, y - 26, 36, 58, true, false); g.fillStyle = P.acc; g.fill();
  g.fillStyle = P.ice; g.fillRect(x - 10, y + 36, w * 0.6, 6); g.fillStyle = P.tan; g.fillRect(x - 10 + w * 0.6 + 4, y + 36, w * 0.4 - 4, 6);
  g.fillStyle = '#F5E6CF'; g.fillText(line1, x, y); g.fillStyle = P.acc; g.fillText(line2, x, y + 24);
  if (state.view === 'target') {
    g.strokeStyle = P.acc; g.lineWidth = 6; g.globalAlpha = 0.7;
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * 70, H / 2 + Math.sin(a) * 70); g.lineTo(W / 2 + Math.cos(a) * 96, H / 2 + Math.sin(a) * 96); g.stroke(); }
    g.globalAlpha = 1;
  }
  ovTex.needsUpdate = true;
}
function updateViewscreen(dt) {
  const want = (elapsed < ovUntil || state.view === 'target' || state.open === 'viewer') ? 0.95 : 0;
  ovMat.opacity += (want - ovMat.opacity) * Math.min(1, dt * 2.5);
}
function rail(ei, t0, t1, y) {
  const e = EDGES[ei], len = e.len * (t1 - t0), tm = (t0 + t1) / 2;
  const [x, z] = onEdge(ei, tm, 0.1);
  const g = group(x, y, z, e.rot);
  const r = mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 12), MAT.steel, 0, 0, 0, g); r.rotation.z = Math.PI / 2;
  [-0.45, 0, 0.45].forEach((f) => mesh(BOX(0.04, 0.04, 0.12), MAT.steel, f * len, 0, -0.05, g));
}

// ---------- aft wall: ship profile, situation table, lift and ready room ----------
{
  const g = group(0, 2.12, AFT_Z - 0.06, Math.PI);
  display(g, 3.0, 1.2, 2048, 820, 'msd', 'ship', 'USS Defiance · EV-0408', 'BASTION CLASS');
  mesh(BOX(3.1, 0.02, 0.02), SLOT, 0, -0.72, 0.02, g);
  addHit(BOX(3.2, 1.4, 0.4), { station: 'ship' }, g, 0, 0, 0.2);
}
// ---------- systems table aft of the command dais ----------
// A waist-high display table in the tradition of an engineering master situation table: a sculpted base, a heavy
// trim slab and one large glass display (DRAW via drawTable in screens.js) read from the forward side.
const TABLE = { x: 0, z: 3.75, w: 2.5, d: 1.25 };
{
  const g = group(TABLE.x, 0, TABLE.z, 0); // reads right way up from the aft side, where you walk in from the lift and the MSD
  mesh(RBOX(2.1, 0.08, 0.84, 0.03), MAT.gunDark, 0, 0.04, 0, g);
  [-1, 1].forEach((sd) => { mesh(BOX(0.018, 0.018, 0.7), STRIP, sd * 1.02, 0.05, 0, g); mesh(BOX(1.9, 0.018, 0.018), STRIP, 0, 0.05, sd * 0.41, g); });
  [-0.78, 0.78].forEach((x) => { mesh(RBOX(0.46, 0.76, 0.74, 0.05), MAT_PED, x, 0.46, 0, g); mesh(RBOX(0.05, 0.62, 0.76, 0.015), MAT_TRIM, x + (x > 0 ? -0.24 : 0.24), 0.46, 0, g); grille(g, x, 0.46, 0.372, 0.3, 0.3); });
  mesh(RBOX(1.12, 0.2, 0.34, 0.03), MAT_TRIM, 0, 0.62, 0, g); idPlate(g, 'SYS·TBL', 0, 0.62, 0.172, 0.28);
  mesh(RBOX(TABLE.w, 0.09, TABLE.d, 0.035), MAT_TRIM, 0, 0.905, 0, g);
  mesh(RBOX(TABLE.w + 0.04, 0.03, TABLE.d + 0.04, 0.015), MAT.leatherDark, 0, 0.935, 0, g);
  mesh(RBOX(TABLE.w - 0.12, 0.012, TABLE.d - 0.12, 0.006), MAT.glassTop, 0, 0.952, 0, g);
  mesh(BOX(TABLE.w - 0.1, 0.012, 0.012), STRIP, 0, 0.86, TABLE.d / 2 - 0.02, g); mesh(BOX(TABLE.w - 0.1, 0.012, 0.012), STRIP, 0, 0.86, -TABLE.d / 2 + 0.02, g);
  buttons(g, 9, -1.0, 1.0, 0.958, TABLE.d / 2 - 0.035, 41); buttons(g, 9, -1.0, 1.0, 0.958, -TABLE.d / 2 + 0.035, 43);
  const sg = group(0, 0.962, 0, 0, g); sg.rotation.x = -Math.PI / 2; addScreen(sg, TABLE.w - 0.2, TABLE.d - 0.2, 2048, 896, 'table', 'carto', 'Situation table', 'SIT·01');
  ao(TABLE.x, TABLE.z, 3.0, 1.8, 0.6);
  pool(TABLE.x, TABLE.z, 3.0, 2.0, 0xffd9b0, 0.06);
  [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]].reduce((a, b2) => { addSeg(TABLE.x + a[0] * TABLE.w / 2, TABLE.z + a[1] * TABLE.d / 2, TABLE.x + b2[0] * TABLE.w / 2, TABLE.z + b2[1] * TABLE.d / 2, 0.34); return b2; });
}
const holoBeam = mesh(new THREE.CylinderGeometry(0.75, 0.6, 0.7, 6, 1, true), new THREE.MeshBasicMaterial({ color: 0x6fd6c8, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }), TABLE.x, 1.31, TABLE.z);
const holo = group(TABLE.x, 1.55, TABLE.z);
let holoPlanets = [];
function buildHolo(i) {
  while (holo.children.length) { const c = holo.children.pop(); c.geometry && c.geometry.dispose(); }
  const sys = SYSTEMS[i]; holoPlanets = [];
  const add2 = (o) => { holo.add(o); return o; };
  const glow = (color, op) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  add2(new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 14), glow(sys.starColor, 1)));
  add2(new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), glow(sys.starColor, 0.25)));
  for (let k = 0; k < sys.planets; k++) {
    const rad = 0.17 + k * 0.085, pts = [];
    for (let a = 0; a <= 64; a++) { const t = a / 64 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * rad, 0, Math.sin(t) * rad)); }
    const featured = k === sys.featured;
    add2(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: featured ? 0x4c8dff : 0x34e89e, transparent: true, opacity: featured ? 0.9 : 0.45, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })));
    const pm = add2(new THREE.Mesh(new THREE.SphereGeometry(featured ? 0.034 : 0.022, 12, 8), glow(featured ? 0x8fb6ff : 0x9cf5cf, 1)));
    holoPlanets.push({ m: pm, r: rad, a: k * 1.9 + i, w: 0.9 / Math.pow(rad * 6, 1.4) });
  }
  holo.rotation.x = 0.35;
}
buildHolo(0);
addHit(BOX(TABLE.w + 0.2, 1.3, TABLE.d + 0.2), { station: 'carto' }, null, TABLE.x, 0.65, TABLE.z);
holo.visible = holoBeam.visible = false; // the old hologram is retired; the table display shows the sector chart
// doors: Lift + Ready Room (aft), Head (aft-port), Conference Room (aft-starboard)
const DOORS = [];
function door(ei, t, label, station, auto, room) { const e = EDGES[ei]; const [px, pz] = onEdge(ei, t, 0); return doorAt(px, pz, e.rot, label, station, auto, room); }
// a sliding double door at (px, pz), frame on the local +z side; parent and deck default to the bridge (Deck 1);
// w is the clear opening (1.2 m standard), each leaf half of it
// a door's call panel: dark bezel, lit face (one shared texture), on the wall at x in the door's frame (+z is the corridor)
const DOORBELL = {};
function doorBell(g, x) {
  if (!DOORBELL.geo) {
    const c = cnv(64, 112), q = c.getContext('2d'); q.fillStyle = '#0b0a0c'; q.fillRect(0, 0, 64, 112);
    q.fillStyle = '#E8A06A'; q.fillRect(8, 8, 48, 10); q.fillStyle = '#B693C4'; q.fillRect(8, 24, 22, 8); q.fillStyle = '#D9B07E'; q.fillRect(34, 24, 22, 8);
    q.fillStyle = '#2B2229'; q.fillRect(8, 40, 48, 40); q.fillStyle = '#F2C88F'; q.beginPath(); q.arc(32, 60, 12, 0, Math.PI * 2); q.fill();
    q.fillStyle = '#7E5C8E'; q.fillRect(8, 90, 48, 12);
    DOORBELL.geo = RBOX(0.13, 0.21, 0.08, 0.012); DOORBELL.face = new THREE.PlaneGeometry(0.1, 0.175);
    DOORBELL.mat = new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false });
  }
  mesh(DOORBELL.geo, MAT.gunDark, x, 1.32, 0.04, g); mesh(DOORBELL.face, DOORBELL.mat, x, 1.32, 0.081, g);
}
function doorAt(px, pz, rot, label, station, auto, room, parent, deck, w) {
  w = w || 1.2; const hw = w / 2, k = w / 1.2;
  const g = group(px, 0, pz, rot, parent), tx = Math.cos(rot), tz = -Math.sin(rot);
  const back = cnv(256, 400); { const c = back.getContext('2d'); const gr = c.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, '#f4f6fa'); gr.addColorStop(1, '#c9d2e0'); c.fillStyle = gr; c.fillRect(0, 0, 256, 400); }
  if (!room) mesh(new THREE.PlaneGeometry(w, 2.3), new THREE.MeshBasicMaterial({ map: tex(back), toneMapped: false }), 0, 1.15, 0.012, g);
  const reveal = [];
  if (room) { [-1, 1].forEach((sd) => reveal.push(mesh(BOX(0.04, 2.3, 0.22), MAT.gun, sd * (hw + 0.02), 1.15, -0.1, g))); reveal.push(mesh(BOX(w + 0.08, 0.04, 0.22), MAT.gun, 0, 2.32, -0.1, g), mesh(BOX(w, 0.012, 0.24), MAT.steel, 0, 0.006, -0.1, g)); }
  [-1, 1].forEach((sd) => mesh(RBOX(0.22, 2.6, 0.3, 0.03), MAT.gun, sd * (hw + 0.11), 1.3, 0.12, g));
  mesh(RBOX(w + 0.44, 0.3, 0.3, 0.03), MAT.gun, 0, 2.45, 0.12, g);
  mesh(BOX(w, 0.004, 0.1), MAT.hazard, 0, 0.003, 0.16, g);
  const lp = cnv(320, 56); { const c = lp.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, 320, 56); hexNode(c, 28, 28, 16); c.fillStyle = station === 'capbank' ? '#E05A50' : '#E8A06A'; c.fill(); if (!THREE.TroikaText) { c.fillStyle = '#F5E6CF'; c.font = `700 26px ${DISP}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(label, 56, 30); } }
  const lpm = mesh(new THREE.PlaneGeometry(1.0, 0.175), new THREE.MeshBasicMaterial({ map: tex(lp), toneMapped: false }), 0, 2.45, 0.276, g);
  text3d(lpm, label, 0.085, 0xF5E6CF, -0.325, 0.004, 0.002);
  const L = mesh(RBOX(hw, 2.3, 0.06, 0.015), MAT.panel, -hw / 2, 1.15, 0.06, g);
  const Rr = mesh(RBOX(hw, 2.3, 0.06, 0.015), MAT.panel, hw / 2, 1.15, 0.06, g);
  [L, Rr].forEach((d, j) => { mesh(BOX(0.02, 1.9, 0.02), SLOT, (j ? -1 : 1) * (hw / 2 - 0.03), 0, 0.04, d); mesh(BOX(0.4 * k, 0.05, 0.02), MAT.steel, 0, 0.1, 0.04, d); });
  addHit(BOX(w + 0.4, 2.6, 0.8), { station }, g, 0, 1.3, 0.45);
  // below the bridge, a room door has a small call panel ("doorbell") on the corridor wall beside it: flat, no function
  if (room && (deck || 1) >= 2 && station !== 'lift') doorBell(g, hw + 0.37);
  // each leaf sits hw/2 off centre when shut and slides hw - 0.04 into the wall when open (render.js)
  const dd = { L, Rr, open: 0, station, auto, room, wx: px, wz: pz, reveal, deck: deck || 1, q: hw / 2, slide: hw - 0.04, reach: w > 1.5 ? 2.0 : 1.7 };
  if (room) dd.seg = [px - tx * hw, pz - tz * hw, px + tx * hw, pz + tz * hw, 0.2];
  DOORS.push(dd); return dd;
}
door(4, LIFT_GAP.t, 'LIFT', 'lift', true, true);
door(4, DOOR_GAPS[4], 'CONFERENCE', 'conference', true, true);
door(3, DOOR_GAPS[3], 'READY ROOM', 'ready', true, true);
door(5, DOOR_GAPS[5], 'HEAD', 'head', true, true);
// aft-port wall: dedication plaque + battle stations board; aft-starboard wall: emergency locker
{
  const pc = cnv(1024, 300); {
    const g = pc.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, '#8a6a44'); gr.addColorStop(1, '#5e462c'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 300);
    g.strokeStyle = 'rgba(255,230,190,0.6)'; g.lineWidth = 4; g.strokeRect(14, 14, 996, 272);
    drawCrest(g, 120, 150, 70, '#f3dcb4', 5);
    g.fillStyle = '#f7e6c8'; g.textBaseline = 'middle';
    g.font = `700 62px ${DISP}`; g.fillText('U.S.S. DEFIANCE', 230, 82);
    g.font = `500 28px ${MONO}`; g.fillText('EV-0408 · BASTION-CLASS HEAVY ESCORT', 232, 140);
    g.fillText('COMMISSIONED IN THE SECOND YEAR OF THE HOLLOW WAR', 232, 182);
    g.font = `italic 500 30px ${MONO}`; g.fillText('“STEADY UNDER FIRE.”', 232, 236);
  }
  const e = EDGES[5]; const [px, pz] = onEdge(5, 0.84, 0.04);
  const g = group(px, 1.62, pz, e.rot);
  mesh(new THREE.PlaneGeometry(1.1, 0.32), new THREE.MeshStandardMaterial({ map: tex(pc), metalness: 0.75, roughness: 0.35, envMapIntensity: 1.2 }), 0, 0, 0.01, g);
  addHit(BOX(1.2, 0.5, 0.3), { station: 'ship' }, g, 0, 0, 0.1);
  const b = group(px + e.nx * 0.02, 2.3, pz + e.nz * 0.02, e.rot); display(b, 1.1, 0.4, 512, 186, 'band', 'band', 'BATTLE STATIONS', 'ALL DECKS');
}
{
  const e = EDGES[3]; const [px, pz] = onEdge(3, 0.8, 0.2);
  const g = group(px, 0, pz, e.rot);
  mesh(RBOX(0.8, 2.0, 0.36, 0.03), MAT.gun, 0, 1.0, 0, g);
  mesh(RBOX(0.7, 1.86, 0.02, 0.01), MAT.panel, 0, 1.02, 0.18, g);
  mesh(BOX(0.7, 0.06, 0.01), MAT.hazard, 0, 1.9, 0.195, g);
  mesh(BOX(0.04, 0.4, 0.04), MAT.steel, 0.26, 1.1, 0.2, g);
  const lc = cnv(256, 96); { const c = lc.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, 256, 96); c.fillStyle = '#E04848'; c.font = `700 24px ${DISP}`; c.textAlign = 'center'; c.fillText('EMERGENCY', 128, 38); c.fillStyle = '#F5E6CF'; c.font = `500 16px ${MONO}`; c.fillText('FIRE · MEDICAL · EVA', 128, 70); }
  mesh(new THREE.PlaneGeometry(0.56, 0.21), new THREE.MeshBasicMaterial({ map: tex(lc), toneMapped: false }), 0, 1.55, 0.2, g);
  extraObs.push({ x: px, z: pz, r: 0.42 });
}

// ---------- overhead downlights + light pools ----------
DOWNLIGHTS.forEach(([x, z]) => {
  const d = mesh(new THREE.CircleGeometry(0.13, 24), downlightMat, x, WALL_H - 0.004, z); d.rotation.x = Math.PI / 2;
  const rim = mesh(new THREE.TorusGeometry(0.15, 0.02, 6, 24), MAT.steel, x, WALL_H - 0.01, z); rim.rotation.x = Math.PI / 2;
  pool(x, z, 2.0, 2.0, 0xffd2a0, 0.14);
});
pool(DAIS.x, DAIS.z, 5.2, 5.2, 0xffcf9a, 0.16, DAIS.h);

````

---

## `js/space.js`

````javascript
// USS Defiance · space.js
// The space scene shown on the viewscreen: true-black starfield, a close planet limb with real atmosphere,
// a distant moon, and the convoy freighter the Defiance is escorting. Rendered only by the viewscreen camera (layer 1).
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- framing: the viewscreen camera sits at the forward wall looking down -z ----------
const VS_EYE = new THREE.Vector3(0, 2, FWD_Z);
function fromEye(yawDeg, pitchDeg, dist) {
  const y = yawDeg * D2R, p = pitchDeg * D2R;
  return new THREE.Vector3(-Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p)).multiplyScalar(dist).add(VS_EYE);
}
// The sun is off-screen to the right and a little behind the viewer, so the planet's near limb and the ship's flank are lit.
const SUN = new THREE.Vector3(0.55, 0.3, -0.8).normalize();
// Standard orbit: the planet fills the bottom of the viewscreen and its limb arcs across the lower third.
const PLANET_R = 60, PLANET_ANG = 56;
const PLANET_POS = fromEye(4, -59, PLANET_R / Math.sin(PLANET_ANG * D2R));
// "Magnify" frames the lit limb, where the atmosphere reads best.
const TARGET_LOOK = (() => { // the point on the limb nearest straight ahead, nudged just inside the disc
  const d = PLANET_POS.clone().sub(VS_EYE), D = d.length(); d.normalize();
  const th = Math.asin(PLANET_R / D) * 0.94, axis = d.clone().cross(new THREE.Vector3(0, -0.12, -1).normalize()).normalize();
  return d.applyAxisAngle(axis, th).multiplyScalar(D * Math.cos(th)).add(VS_EYE);
})();
const TARGET_FOV = 17;

// ---------- stars: many faint, few bright, no colour wash ----------
const STARS = [];
function starfield(n, size, seed, bMin, bMax, rad) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), r = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(th) * s * rad, u * rad, Math.sin(th) * s * rad], i * 3);
    const b = bMin + Math.pow(r(), 3) * (bMax - bMin), t = r();
    col.set(t < 0.15 ? [b, b * 0.86, b * 0.7] : t > 0.85 ? [b * 0.8, b * 0.88, b] : [b, b * 0.97, b * 0.93], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const p = space(add(new THREE.Points(g, new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, depthWrite: false })))); STARS.push(p); return p;
}
starfield(isMobile ? 2600 : 5200, isMobile ? 1.0 : 1.25, 11, 0.05, 0.55, 480);
starfield(420, isMobile ? 1.5 : 1.9, 12, 0.35, 1.1, 470);
starfield(36, isMobile ? 2.1 : 2.8, 13, 0.9, 1.8, 460);

// faint dust lane, used only for the view out of the deck windows (rooms.js)
const nebula = { material: { map: null } };
{
  const c = cnv(512, 300), g = c.getContext('2d'), r = mulberry(3);
  for (let i = 0; i < 30; i++) { const x = 60 + r() * 392, y = 110 + (r() - 0.5) * 120 + (x - 256) * 0.25, rr = 30 + r() * 90; const gr = g.createRadialGradient(x, y, 0, x, y, rr); const c2 = r() < 0.5 ? '150,140,170' : '170,150,130'; gr.addColorStop(0, `rgba(${c2},${0.10 + r() * 0.08})`); gr.addColorStop(1, `rgba(${c2},0)`); g.fillStyle = gr; g.fillRect(0, 0, 512, 300); }
  nebula.material.map = tex(c);
}

// ---------- procedural planet surfaces, baked once per system on the GPU ----------
const NOISE_GLSL = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){ float s=0.0,a=0.5; for(int i=0;i<7;i++){ s+=a*snoise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=0.5; } return s; }
float ridged(vec3 p){ float s=0.0,a=0.5; for(int i=0;i<6;i++){ float n=1.0-abs(snoise(p)); s+=a*n*n; p=p*2.1+vec3(3.1,1.3,7.7); a*=0.5; } return s; }
`;
const BAKE_FRAG = NOISE_GLSL + `
varying vec2 vUv; uniform float type; uniform float seed; uniform float pass;
vec3 dirFromUv(vec2 uv){ float ph=uv.x*6.2831853, th=(1.0-uv.y)*3.14159265; return vec3(-cos(ph)*sin(th), cos(th), sin(ph)*sin(th)); }
void main(){
  vec3 p=dirFromUv(vUv), q=p+vec3(seed, seed*0.37, seed*0.71); float lat=abs(p.y);
  if(pass<0.5){
    vec3 col; float spec=0.0;
    if(type<0.5){ // temperate ocean world
      vec3 w=vec3(fbm(q*1.1), fbm(q*1.1+5.2), fbm(q*1.1+9.7));
      float h=fbm(q*1.5+w*0.7);
      float land=smoothstep(0.06,0.09,h), shelf=smoothstep(-0.08,0.07,h);
      vec3 ocean=mix(vec3(0.006,0.022,0.060), vec3(0.018,0.085,0.130), shelf*0.85);
      float moist=fbm(q*2.2+3.3)*0.6+0.5-lat*0.45, mnt=ridged(q*2.8+w);
      vec3 l=mix(vec3(0.30,0.26,0.19), vec3(0.17,0.15,0.09), smoothstep(0.25,0.5,moist));
      l=mix(l, vec3(0.055,0.090,0.035), smoothstep(0.45,0.72,moist));
      l=mix(l, vec3(0.20,0.18,0.16), smoothstep(0.62,0.85,mnt)*0.75);
      l*=0.8+0.4*(fbm(q*14.0)*0.5+0.5);
      col=mix(ocean,l,land); spec=1.0-land;
      float ice=smoothstep(0.80,0.88,lat+fbm(q*3.0)*0.07);
      col=mix(col,vec3(0.78,0.82,0.86),ice); spec*=1.0-ice;
    } else if(type<1.5){ // banded gas giant
      float t=p.y*5.5+fbm(q*vec3(1.6,7.0,1.6))*0.55+fbm(q*vec3(5.0,22.0,5.0))*0.12;
      float b=sin(t*3.0)*0.5+0.5, b2=sin(t*7.3+1.0)*0.5+0.5;
      col=mix(vec3(0.46,0.33,0.21), vec3(0.84,0.75,0.62), b); col=mix(col, vec3(0.30,0.19,0.12), b2*0.45);
      float sd=distance(p, normalize(vec3(0.6,-0.32,0.72)))+fbm(q*7.0)*0.025;
      col=mix(col, vec3(0.66,0.32,0.20), smoothstep(0.15,0.08,sd));
      col*=0.9+0.2*(fbm(q*16.0)*0.5+0.5);
    } else if(type<2.5){ // ice-shelled moon
      col=mix(vec3(0.66,0.72,0.76), vec3(0.86,0.88,0.90), fbm(q*2.0)*0.5+0.5);
      float lin=pow(ridged(q*3.6),3.0);
      col=mix(col, vec3(0.42,0.27,0.19), smoothstep(0.30,0.55,lin)*0.65);
      col*=0.92+0.12*(fbm(q*18.0)*0.5+0.5); spec=0.15;
    } else if(type<3.5){ // young volcanic world
      float cr=ridged(q*3.2);
      col=mix(vec3(0.05,0.04,0.035), vec3(0.13,0.10,0.08), fbm(q*5.0)*0.5+0.5);
      col=mix(col, vec3(0.02,0.015,0.012), smoothstep(0.55,0.8,cr));
    } else { // airless rock
      col=vec3(0.30,0.29,0.28)*(0.7+0.4*(fbm(q*3.0)*0.5+0.5)); col*=0.8+0.35*ridged(q*7.0);
    }
    gl_FragColor=vec4(col,spec);
  } else {
    float c=0.0, glow=0.0;
    if(type<0.5){
      vec3 w=vec3(fbm(q*1.8+11.0), fbm(q*1.8+21.0), fbm(q*1.8+31.0));
      float n=fbm(q*vec3(2.4,3.2,2.4)+w*1.3);
      c=smoothstep(0.02,0.42,n+0.08);
      c*=0.55+0.45*smoothstep(-0.3,0.35,fbm(q*10.0+w));
      c=max(c, smoothstep(0.86,0.95,lat)*0.6);
    } else if(type<1.5){
      c=smoothstep(0.2,0.6,fbm(q*vec3(3.0,12.0,3.0)))*0.12;
    } else if(type>2.5 && type<3.5){
      float cr=ridged(q*3.2); glow=smoothstep(0.58,0.82,cr)*(0.55+0.45*(fbm(q*9.0)*0.5+0.5));
      c=smoothstep(0.25,0.75,fbm(q*1.4+4.0))*0.28;
    }
    gl_FragColor=vec4(c,glow,0.0,1.0);
  }
}`;
const bakeScene = new THREE.Scene(), bakeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const bakeMat = new THREE.ShaderMaterial({
  uniforms: { type: { value: 0 }, seed: { value: 0 }, pass: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }',
  fragmentShader: BAKE_FRAG, depthTest: false, depthWrite: false,
});
bakeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bakeMat));
const PLANET_TYPES = { ocean: 0, gas: 1, ice: 2, lava: 3, rock: 4 };
function bakeTarget(w, h) {
  const t = new THREE.WebGLRenderTarget(w, h, { depthBuffer: false, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: true, wrapS: THREE.RepeatWrapping });
  t.texture.anisotropy = maxAniso; return t;
}
function bakePlanet(type, seed, w, surf, cloud) {
  const prev = renderer.getRenderTarget();
  bakeMat.uniforms.type.value = PLANET_TYPES[type]; bakeMat.uniforms.seed.value = seed * 0.731;
  bakeMat.uniforms.pass.value = 0; renderer.setRenderTarget(surf); renderer.render(bakeScene, bakeCam);
  bakeMat.uniforms.pass.value = 1; renderer.setRenderTarget(cloud); renderer.render(bakeScene, bakeCam);
  renderer.setRenderTarget(prev);
}

// ---------- planet shading: soft terminator, ocean glint, clouds, thin bright atmosphere ----------
const PLANET_VERT = 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }';
const planetUniforms = () => ({
  surf: { value: null }, clouds: { value: null }, lightDir: { value: new THREE.Vector3(1, 0, 0) }, opacity: { value: 1 }, scan: { value: 0 },
  atmo: { value: new THREE.Color(0.30, 0.55, 1.0) }, atmoK: { value: 1 }, glowCol: { value: new THREE.Color(1.0, 0.32, 0.07) }, drift: { value: 0 }, sun: { value: 1.45 },
});
const planetMat = new THREE.ShaderMaterial({
  uniforms: planetUniforms(), vertexShader: PLANET_VERT, transparent: true,
  fragmentShader: `uniform sampler2D surf, clouds; uniform vec3 lightDir, atmo, glowCol; uniform float opacity, scan, atmoK, drift, sun;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 n=normalize(vN), L=normalize(lightDir), V=normalize(vV);
  vec4 s=texture2D(surf,vUv); vec4 cl=texture2D(clouds, vUv+vec2(drift,0.0));
  float ndl=dot(n,L), diff=max(ndl,0.0), day=smoothstep(-0.12,0.18,ndl);
  float c=cl.r;
  vec3 col=s.rgb*(1.0-0.35*c)*diff*sun;
  vec3 H=normalize(L+V); col+=vec3(1.0,0.93,0.82)*pow(max(dot(n,H),0.0),160.0)*s.a*0.55*day*(1.0-c)*sun;
  col=mix(col, vec3(0.92,0.93,0.95)*(diff*sun*0.95+0.004), c);
  col*=mix(vec3(1.0,0.50,0.30), vec3(1.0), smoothstep(-0.05,0.30,ndl));
  float mu=max(dot(n,V),0.0), fr=pow(1.0-mu,6.0); // a steep rim term: from low orbit most of the disc is seen at a grazing angle
  col=mix(col, atmo*diff*sun*0.32, atmoK*(0.08+0.45*fr));
  col+=atmo*atmoK*(fr*1.4+0.03)*smoothstep(-0.25,0.55,ndl)*sun*0.5;
  col+=glowCol*cl.g*(1.2-day)*2.2;
  col+=vec3(0.35,0.9,0.85)*scan*smoothstep(0.02,0.0,abs(fract(vUv.y*40.0)-0.5)-0.47)*0.5;
  gl_FragColor=vec4(col,opacity);
}`,
});
const atmoMat = new THREE.ShaderMaterial({
  uniforms: planetUniforms(), vertexShader: PLANET_VERT, transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
  fragmentShader: `uniform vec3 lightDir, atmo; uniform float opacity, atmoK, sun; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 n=normalize(vN), L=normalize(lightDir), V=normalize(vV);
  float a=clamp(-dot(n,V)/0.26,0.0,1.0); float g=pow(a,3.0);
  float lit=smoothstep(-0.30,0.50,dot(n,L));
  gl_FragColor=vec4(atmo*atmoK*g*lit*sun*0.55*opacity,1.0);
}`,
});
const planet = space(mesh(new THREE.SphereGeometry(PLANET_R, isMobile ? 96 : 160, isMobile ? 64 : 110), planetMat, PLANET_POS.x, PLANET_POS.y, PLANET_POS.z));
planet.rotation.set(0.0, 0.25, Math.PI / 2 + 0.18); // pole turned sideways so the equator rolls toward the bow as we orbit
const atmoShell = space(mesh(new THREE.SphereGeometry(PLANET_R * 1.03, isMobile ? 96 : 160, isMobile ? 64 : 110), atmoMat, PLANET_POS.x, PLANET_POS.y, PLANET_POS.z));
const scanRing = space(mesh(new THREE.TorusGeometry(PLANET_R * 1.12, 0.3, 6, 120), new THREE.MeshBasicMaterial({ color: 0x6fd6c8, transparent: true, opacity: 0, depthWrite: false }), PLANET_POS.x, PLANET_POS.y, PLANET_POS.z));
scanRing.visible = false; // scans now sweep across the surface itself
const PLANET_TEX = window.PLANET_RES || (isMobile ? 2048 : 4096);
const planetSurf = bakeTarget(PLANET_TEX, PLANET_TEX / 2), planetCloud = bakeTarget(PLANET_TEX, PLANET_TEX / 2);
planetMat.uniforms.surf.value = planetSurf.texture; planetMat.uniforms.clouds.value = planetCloud.texture;
const ATMO = { ocean: [[0.30, 0.55, 1.0], 1.0], gas: [[1.0, 0.80, 0.60], 0.42], ice: [[0.62, 0.80, 1.0], 0.28], lava: [[1.0, 0.50, 0.28], 0.32] };
function setSystem(i) {
  const sys = SYSTEMS[i];
  bakePlanet(sys.type, sys.seed, PLANET_TEX, planetSurf, planetCloud);
  const [c, k] = ATMO[sys.type] || ATMO.ocean;
  [planetMat, atmoMat].forEach((m) => { m.uniforms.atmo.value.setRGB(c[0], c[1], c[2]); m.uniforms.atmoK.value = k; });
}
setSystem(0);

// ---------- a small airless moon, far off to the upper right ----------
const moonMat = new THREE.ShaderMaterial({ uniforms: planetUniforms(), vertexShader: PLANET_VERT, fragmentShader: planetMat.fragmentShader, transparent: true });
{
  const s = bakeTarget(512, 256), c = bakeTarget(64, 32);
  bakePlanet('rock', 5, 512, s, c); moonMat.uniforms.surf.value = s.texture; moonMat.uniforms.clouds.value = c.texture; moonMat.uniforms.atmoK.value = 0;
}
const MOON_POS = fromEye(-26, 13, 420);
const moon = space(mesh(new THREE.SphereGeometry(5.5, 48, 32), moonMat, MOON_POS.x, MOON_POS.y, MOON_POS.z));

// ---------- the convoy freighter we are escorting (original design) ----------
const SHIP_POS = fromEye(-11, 3.5, 46);
const ship = space(new THREE.Group()); ship.position.copy(SHIP_POS); ship.rotation.set(0.16, -0.58, 0.06, 'YXZ'); scene.add(ship);
const shipLights = [];
{
  const S = (o) => { o.traverse((c) => c.layers.set(1)); return o; };
  const part = (geo, mat, x, y, z, parent) => S(mesh(geo, mat, x, y, z, parent || ship));
  // hull plating: panel tiles in slightly different greys with fine seams and grime
  const hc = cnv(512, 512), hg = hc.getContext('2d'), r = mulberry(91);
  hg.fillStyle = '#8b8e93'; hg.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { const w = 20 + r() * 90, h = 14 + r() * 50, x = r() * 512, y = r() * 512, v = 120 + r() * 40 | 0; hg.fillStyle = `rgb(${v},${v + 2},${v + 6})`; hg.fillRect(x, y, w, h); hg.strokeStyle = 'rgba(30,32,36,0.55)'; hg.lineWidth = 1; hg.strokeRect(x + 0.5, y + 0.5, w, h); }
  for (let i = 0; i < 40; i++) { const g2 = hg.createRadialGradient(r() * 512, r() * 512, 0, r() * 512, r() * 512, 60 + r() * 80); g2.addColorStop(0, 'rgba(40,36,30,0.18)'); g2.addColorStop(1, 'rgba(40,36,30,0)'); hg.fillStyle = g2; hg.fillRect(0, 0, 512, 512); }
  const hullTex = tex(hc); hullTex.wrapS = hullTex.wrapT = THREE.RepeatWrapping;
  const hull = new THREE.MeshStandardMaterial({ map: hullTex, roughness: 0.55, metalness: 0.35, envMapIntensity: 0 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.7, metalness: 0.4, envMapIntensity: 0 });
  // command section: a long flattened hull with a band of lit ports
  const wc = cnv(512, 256), wg = wc.getContext('2d'); wg.fillStyle = '#000'; wg.fillRect(0, 0, 512, 256);
  for (const [row, n] of [[118, 46], [134, 40], [150, 30]]) for (let i = 0; i < n; i++) { if (r() < 0.28) continue; const u = 512 * (0.05 + 0.9 * i / n); if (u > 190 && u < 322) continue; wg.fillStyle = r() < 0.15 ? '#a8c8ff' : '#ffd9a0'; wg.fillRect(u, row, 4, 3); }
  const cmd = new THREE.MeshStandardMaterial({ map: hullTex, roughness: 0.5, metalness: 0.35, envMapIntensity: 0, emissive: 0xffffff, emissiveMap: tex(wc), emissiveIntensity: 2.2 });
  const prof = [[0, 0], [2.3, 0], [2.7, 1.4], [2.8, 5.2], [2.5, 8.4], [1.8, 10.4], [0.9, 11.4], [0, 11.7]].map(([x, y]) => new THREE.Vector2(x, y));
  const hg2 = new THREE.LatheGeometry(prof, 40); hg2.rotateX(Math.PI / 2); hg2.scale(1, 0.52, 1);
  part(hg2, cmd, 0, 0.2, 6.5);
  part(new THREE.SphereGeometry(0.9, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hull, 0, 1.6, 13.4).scale.set(1.2, 0.5, 1.6);
  part(new THREE.TorusGeometry(1.25, 0.18, 10, 28), dark, 0, 0.1, 6.6);
  const band = new THREE.MeshStandardMaterial({ color: 0x6e2a22, roughness: 0.6, metalness: 0.2, envMapIntensity: 0 });
  const bg = new THREE.LatheGeometry(prof.slice(2, 4).map((v) => new THREE.Vector2(v.x + 0.02, v.y)), 40, -0.9, 1.8); bg.rotateX(Math.PI / 2); bg.scale(1, 0.52, 1);
  part(bg, band, 0, 0.2, 6.5).scale.z = 0.35;
  part(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), dark, 0.6, 2.3, 11.2);
  part(BOX(0.9, 0.05, 0.6), dark, 0.6, 3.35, 11.2);
  // spine and cargo: standard containers locked to a keel truss
  part(BOX(1.3, 1.0, 21), dark, 0, 0, -4.5);
  const cargo = [0x7d7a72, 0x8f6a4c, 0x5f6a5b, 0x9a948a, 0x6a6e78, 0x7a5a48];
  const rc = cnv(128, 64), rg = rc.getContext('2d'); rg.fillStyle = '#c8c8c8'; rg.fillRect(0, 0, 128, 64);
  for (let x = 0; x < 128; x += 8) { rg.fillStyle = 'rgba(0,0,0,0.22)'; rg.fillRect(x, 0, 3, 64); rg.fillStyle = 'rgba(255,255,255,0.12)'; rg.fillRect(x + 3, 0, 1, 64); }
  rg.fillStyle = 'rgba(0,0,0,0.3)'; rg.fillRect(0, 0, 128, 3); rg.fillRect(0, 61, 128, 3);
  const ribTex = tex(rc);
  for (let k = 0; k < 4; k++) for (const sx of [-1, 1]) for (const yy of [0, 1.95]) {
    if (yy > 0 && (k + (sx > 0 ? 1 : 0)) % 3 === 0) continue;
    const m = new THREE.MeshStandardMaterial({ map: ribTex, color: cargo[(k * 3 + (sx > 0 ? 1 : 0) + (yy > 0 ? 2 : 0)) % cargo.length], roughness: 0.65, metalness: 0.2, envMapIntensity: 0 });
    part(RBOX(2.1, 1.8, 3.8, 0.08), m, sx * 1.75, yy - 0.4, 3.0 - k * 4.4);
  }
  // engineering block, pylons and drive nacelles
  part(RBOX(4.8, 2.6, 5.4, 0.25), hull, 0, 0.1, -16.5);
  for (const sx of [-1, 1]) for (let k = 0; k < 6; k++) part(BOX(0.07, 1.7, 0.5), dark, sx * 2.5, 0.1, -14.4 - k * 0.78);
  for (let k = 0; k < 7; k++) part(BOX(5.6, 0.05, 0.9), dark, 0, 1.45, -14.2 - k * 0.7);
  const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 0.62, 1.0).multiplyScalar(2.6) });
  const exhaust = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.55, 0.22).multiplyScalar(2.2) });
  for (const sx of [-1, 1]) {
    const py = part(BOX(2.9, 0.26, 3.0), dark, sx * 3.6, -0.75, -15.6); py.rotation.z = sx * -0.3;
    const nac = part(new THREE.CylinderGeometry(0.85, 0.75, 13, 20), hull, sx * 5.0, -1.45, -15.0); nac.rotation.x = Math.PI / 2;
    part(new THREE.SphereGeometry(0.85, 20, 12), hull, sx * 5.0, -1.45, -8.5).scale.z = 1.8;
    part(BOX(0.08, 0.32, 10.5), glow, sx * 4.16, -1.45, -15.2);
    part(new THREE.CircleGeometry(0.55, 20), exhaust, sx * 5.0, -1.45, -21.52).rotation.y = Math.PI;
    part(new THREE.CircleGeometry(0.7, 20), exhaust, sx * 1.3, 0.1, -19.22).rotation.y = Math.PI;
  }
  // running lights: red to port, green to starboard, white strobes on the nacelle tails, amber beacon on top
  const lc = cnv(64, 64), lg = lc.getContext('2d'), gr = lg.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); lg.fillStyle = gr; lg.fillRect(0, 0, 64, 64);
  const lt = tex(lc);
  [[-2.75, 0.2, 9.0, [3, 0.25, 0.2], 0, 1], [2.75, 0.2, 9.0, [0.3, 3, 0.8], 0, 1], [-5.0, -1.45, -21.6, [3, 3, 3], 0.1, 0.07], [5.0, -1.45, -21.6, [3, 3, 3], 0.6, 0.07], [0, 1.6, -16.0, [3, 1.6, 0.4], 0.35, 0.5]]
    .forEach(([x, y, z, c, ph, duty]) => {
      const sp = S(new THREE.Sprite(new THREE.SpriteMaterial({ map: lt, color: new THREE.Color(c[0], c[1], c[2]), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
      sp.position.set(x, y, z); sp.scale.setScalar(duty < 1 ? 1.5 : 1.0); ship.add(sp); shipLights.push({ sp, ph, duty });
    });
}
// light for the ship only (layer 1): the sun as key, blue planet-shine as fill
const sunLight = space(add(new THREE.DirectionalLight(0xfff1de, 4.2)));
sunLight.castShadow = true; sunLight.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048); sunLight.shadow.bias = -0.0004; sunLight.shadow.normalBias = 0.05;
Object.assign(sunLight.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 50, far: 160 }); sunLight.shadow.camera.updateProjectionMatrix();
sunLight.position.copy(SHIP_POS).addScaledVector(SUN, 100); sunLight.target.position.copy(SHIP_POS); scene.add(sunLight.target);
const shineLight = space(add(new THREE.DirectionalLight(0x6d93d6, 0.4)));
shineLight.position.copy(PLANET_POS); shineLight.target.position.copy(SHIP_POS); scene.add(shineLight.target);
space(add(new THREE.AmbientLight(0x1a1f2a, 0.25)));
ship.traverse((o) => { if (o.isMesh && !o.material.isMeshBasicMaterial) { o.castShadow = true; o.receiveShadow = true; } });

let spaceT = 0;
const _tmpL = new THREE.Vector3();
function updateSpace(dt, fade) {
  spaceT += dt;
  const on = fade > 0.01;
  planet.visible = atmoShell.visible = moon.visible = on;
  planetMat.uniforms.opacity.value = atmoMat.uniforms.opacity.value = moonMat.uniforms.opacity.value = fade;
  // orbital motion: the surface slides slowly toward the bow, clouds drift on their own
  const orb = dt * (reduceMotion ? 0.0012 : 0.0045);
  planet.rotation.x -= orb;
  STARS.forEach((st) => { st.rotation.x -= orb; }); // the sky turns with the orbit, at the same slow rate as the ground
  planetMat.uniforms.drift.value = spaceT * 0.0011;
  _tmpL.copy(SUN).transformDirection(vcam.matrixWorldInverse);
  [planetMat, atmoMat, moonMat].forEach((m) => m.uniforms.lightDir.value.copy(_tmpL));
  ship.visible = fade > 0.4;
  if (ship.visible) {
    const k = reduceMotion ? 0.3 : 1;
    ship.position.set(SHIP_POS.x + Math.sin(spaceT * 0.11) * 0.5 * k, SHIP_POS.y + Math.sin(spaceT * 0.17) * 0.3 * k, SHIP_POS.z);
    ship.rotation.z = 0.05 + Math.sin(spaceT * 0.09) * 0.015 * k;
    shipLights.forEach((l) => { l.sp.material.opacity = l.duty >= 1 ? 1 : (((spaceT * 0.7 + l.ph) % 1) < l.duty ? 1 : 0.06); });
  }
}

// ---------- warp streaks ----------
const N_STREAK = 900;
const streakPos = new Float32Array(N_STREAK * 6), streakCol = new Float32Array(N_STREAK * 6), streakXYZ = new Float32Array(N_STREAK * 3);
function seedStreak(i, zr) {
  let x, y; do { x = (Math.random() - 0.5) * 150; y = (Math.random() - 0.5) * 80 + 2; } while (Math.hypot(x, y - 2) < 4);
  streakXYZ[i * 3] = x; streakXYZ[i * 3 + 1] = y; streakXYZ[i * 3 + 2] = zr;
}
for (let i = 0; i < N_STREAK; i++) { seedStreak(i, -360 + Math.random() * 350); const b = 0.6 + Math.random() * 0.4; streakCol.set([b, b, b, 0.1, 0.25 * b, 0.45 * b], i * 6); }
const streakGeo = new THREE.BufferGeometry();
streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPos, 3));
streakGeo.setAttribute('color', new THREE.BufferAttribute(streakCol, 3));
const streakMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
const streaks = space(new THREE.LineSegments(streakGeo, streakMat)); streaks.frustumCulled = false; streaks.visible = false; scene.add(streaks);

````

---

## `js/rooms.js`

````javascript
// USS Defiance · rooms.js
// Deck 1 rooms off the bridge: ready room, conference room, head, and the view through their windows.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- Deck 1 rooms: ready room, conference room, head ----------
// =====================================================================
// Each room is built in its own frame: origin at the door on the bridge wall line,
// +x along the wall, +z outward (away from the bridge). Interior starts at z = 0.2.
const ROOMS = [], SHUTTERS = [], ROOM_WALL_MATS = [];
function roomFrame(ei, t) { const e = EDGES[ei]; const [px, pz] = onEdge(ei, t, 0); const g = group(px, 0, pz, e.rot + Math.PI); g.updateMatrixWorld(true); return g; }
function W(g, x, z) { const v = new THREE.Vector3(x, 0, z).applyMatrix4(g.matrixWorld); return [v.x, v.z]; }
function lseg(g, ax, az, bx, bz, r) { const a = W(g, ax, az), b = W(g, bx, bz); addSeg(a[0], a[1], b[0], b[1], r); }
function lrect(g, cx, cz, w, d, r) { const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2; lseg(g, x0, z0, x1, z0, r); lseg(g, x1, z0, x1, z1, r); lseg(g, x1, z1, x0, z1, r); lseg(g, x0, z1, x0, z0, r); }
function lobs(g, x, z, r) { const p = W(g, x, z); extraObs.push({ x: p[0], z: p[1], r }); }
function lao(g, x, z, w, d, op) { const p = W(g, x, z); ao(p[0], p[1], w, d, op); }
function lpool(g, x, z, w, d, color, op) { const p = W(g, x, z); pool(p[0], p[1], w, d, color, op); }

// materials
function roomWallCanvases(H, kind) {
  const Wd = 192, Hp = Math.round(H * 160), Y = (m) => Hp - m * 160;
  const c = cnv(Wd, Hp), g = c.getContext('2d'), e = cnv(Wd, Hp), ge = e.getContext('2d');
  if (kind === 'tile') {
    g.fillStyle = '#c8c5bf'; g.fillRect(0, 0, Wd, Hp);
    const r = mulberry(17);
    for (let y = 0; y < Hp; y += 32) for (let x = 0; x < Wd; x += 32) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${0.02 + r() * 0.03})`; g.fillRect(x, y, 32, 32); }
    g.fillStyle = 'rgba(70,64,58,0.45)'; for (let x = 0; x < Wd; x += 32) g.fillRect(x, 0, 2, Hp); for (let y = 0; y < Hp; y += 32) g.fillRect(0, y, Wd, 2);
    g.fillStyle = '#4a4540'; g.fillRect(0, Y(0.12), Wd, Hp - Y(0.12));
    g.fillStyle = '#3a3530'; g.fillRect(0, 0, Wd, Y(H - 0.18));
  } else if (kind === 'bulk') { // working spaces: grey bulkhead panels, a darker kick band, a stencil stripe
    g.fillStyle = '#8d8f8f'; g.fillRect(0, 0, Wd, Hp);
    const r = mulberry(41);
    for (let i = 0; i < 4000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'; g.fillRect(r() * Wd, r() * Hp, 1.4, 1.4); }
    g.fillStyle = 'rgba(20,22,24,0.55)'; [0, 96].forEach((x) => g.fillRect(x, 0, 2, Hp)); [Y(0.9), Y(1.9)].forEach((y) => g.fillRect(0, y, Wd, 2));
    g.fillStyle = 'rgba(255,255,255,0.18)'; [0, 96].forEach((x) => g.fillRect(x + 2, 0, 1, Hp));
    g.fillStyle = '#5d6062'; g.fillRect(0, Y(0.9), Wd, Y(0.12) - Y(0.9)); g.fillStyle = '#3c3f41'; g.fillRect(0, 0, Wd, Y(H - 0.22));
    g.fillStyle = '#b8873a'; g.fillRect(0, Y(1.35), Wd, 6); g.fillStyle = '#222'; g.fillRect(0, Y(0.12), Wd, Hp - Y(0.12));
  } else if (kind === 'bath') { // cabin heads: large warm-white tiles laid staggered, fine pale grout, a slim stone band
    g.fillStyle = '#cfcac2'; g.fillRect(0, 0, Wd, Hp);
    const r = mulberry(19), tw = 96, th = 48;
    for (let row = 0, y = Hp - Math.round(0.1 * 160); y > -th; row++, y -= th) for (let x = (row % 2) * -48; x < Wd; x += tw) {
      const v = 228 + Math.round(r() * 10); const gr = g.createLinearGradient(0, y - th, 0, y); gr.addColorStop(0, `rgb(${v + 6},${v + 4},${v})`); gr.addColorStop(1, `rgb(${v - 4},${v - 6},${v - 10})`);
      g.fillStyle = gr; g.fillRect(x + 1, y - th + 1, tw - 2, th - 2); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 1, y - th + 1, tw - 2, 1); }
    g.fillStyle = '#8f9a97'; g.fillRect(0, Y(1.16), Wd, Y(1.1) - Y(1.16)); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, Y(1.16), Wd, 1);
    g.fillStyle = '#7d827f'; g.fillRect(0, Y(0.1), Wd, Hp - Y(0.1));
  } else if (kind === 'med') { // sickbay: white wall panels, a teal band at hand height, a teal kick band
    g.fillStyle = '#e2e6e5'; g.fillRect(0, 0, Wd, Hp);
    const r = mulberry(53);
    for (let i = 0; i < 3000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'; g.fillRect(r() * Wd, r() * Hp, 1.2, 1.2); }
    g.fillStyle = 'rgba(60,80,82,0.28)'; [0, 96].forEach((x) => g.fillRect(x, 0, 2, Hp)); g.fillRect(0, Y(2.2), Wd, 2);
    g.fillStyle = 'rgba(255,255,255,0.5)'; [0, 96].forEach((x) => g.fillRect(x + 2, 0, 1, Hp));
    g.fillStyle = '#2a9d97'; g.fillRect(0, Y(1.12), Wd, Y(1.02) - Y(1.12)); g.fillRect(0, Y(1.2), Wd, 3);
    g.fillStyle = '#9fb3b1'; g.fillRect(0, 0, Wd, Y(H - 0.22));
    g.fillStyle = '#2f5e5b'; g.fillRect(0, Y(0.12), Wd, Hp - Y(0.12));
  } else {
    g.fillStyle = '#58514a'; g.fillRect(0, 0, Wd, Y(H - 0.26));
    const gr = g.createLinearGradient(0, Y(H - 0.26), 0, Y(1.02)); gr.addColorStop(0, '#c2b39c'); gr.addColorStop(1, '#b3a48d');
    g.fillStyle = gr; g.fillRect(0, Y(H - 0.26), Wd, Y(1.02) - Y(H - 0.26));
    const r = mulberry(29);
    for (let i = 0; i < 5000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,240,220,0.035)' : 'rgba(0,0,0,0.05)'; g.fillRect(r() * Wd, Y(H - 0.26) + r() * (Y(1.02) - Y(H - 0.26)), 1.2, 1.2); }
    [0, 96].forEach((x) => { g.fillStyle = 'rgba(30,22,16,0.55)'; g.fillRect(x, Y(H - 0.26), 3, Y(1.02) - Y(H - 0.26)); g.fillStyle = 'rgba(255,240,220,0.12)'; g.fillRect(x + 3, Y(H - 0.26), 1, Y(1.02) - Y(H - 0.26)); });
    g.fillStyle = '#5b3b26'; g.fillRect(0, Y(1.02), Wd, Y(0.95) - Y(1.02)); g.fillStyle = 'rgba(255,220,180,0.35)'; g.fillRect(0, Y(1.02), Wd, 2);
    g.fillStyle = '#5c524a'; g.fillRect(0, Y(0.95), Wd, Y(0.12) - Y(0.95));
    g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 2; g.strokeRect(10, Y(0.88), Wd - 20, Y(0.2) - Y(0.88));
    g.fillStyle = '#211e1b'; g.fillRect(0, Y(0.12), Wd, Hp - Y(0.12));
  }
  ge.fillStyle = '#000'; ge.fillRect(0, 0, Wd, Hp);
  ge.fillStyle = '#fff'; ge.fillRect(0, Y(H - (kind === 'tile' || kind === 'bath' ? 0.18 : kind === 'bulk' || kind === 'med' ? 0.22 : 0.26)) - 2, Wd, 3);
  return [c, e];
}
function roomWallMat(H, kind) {
  const [c, e] = roomWallCanvases(H, kind); const map = tex(c), em = tex(e); map.wrapS = em.wrapS = THREE.RepeatWrapping;
  const nm = normalTex(c, kind === 'tile' || kind === 'bath' ? 2 : kind === 'bulk' ? 3 : 2.5); nm.wrapS = THREE.RepeatWrapping;
  const m = new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: new THREE.Color(ALERTS.green.slot), emissiveIntensity: 0.65, normalMap: nm, roughness: kind === 'bath' ? 0.3 : 0.9, metalness: 0.02, envMapIntensity: 0.3 });
  ROOM_WALL_MATS.push(m); return m;
}
// dark hardwood (ambientCG Wood018, recoloured), world-mapped so the grain runs evenly over every piece of furniture
const WOOD = triSurface(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0.05, envMapIntensity: 0.55 }),
  { set: 'wood', metres: 1.1, ns: 0.8, color: true, absRough: true, low: 0, albedo: [0.07, 0.028, 0.014] });
const CERAMIC = new THREE.MeshStandardMaterial({ color: 0xeeeae4, roughness: 0.22, metalness: 0.02, envMapIntensity: 0.8 });
const GLASS = new THREE.MeshStandardMaterial({ color: 0xbcd2dc, transparent: true, opacity: 0.16, roughness: 0.04, metalness: 0.85, envMapIntensity: 1.3, depthWrite: false });
const PANE = new THREE.MeshStandardMaterial({ color: 0x8fa8b8, transparent: true, opacity: 0.05, roughness: 0.02, metalness: 0.6, envMapIntensity: 0.35, depthWrite: false });
const POT = new THREE.MeshStandardMaterial({ color: 0x24211f, roughness: 0.45, metalness: 0.3, envMapIntensity: 0.25 });
const LEAF = new THREE.MeshStandardMaterial({ color: 0x3f6b3a, roughness: 0.7, side: THREE.DoubleSide });
const FABRIC = new THREE.MeshStandardMaterial({ color: 0x3e5658, roughness: 0.95 });
const BRASS = new THREE.MeshStandardMaterial({ color: 0xb08850, metalness: 0.85, roughness: 0.3, envMapIntensity: 1.1 });
const roomWarm = roomWallMat(ROOM_H, 'fabric'), roomTile = roomWallMat(2.6, 'tile');

// wall with an optional rectangular opening, in a room frame
function wallH(g, mat, A, dir, nrm, len, H, hole) {
  if (!hole) { wallPiece(mat, A, dir, nrm, 0, len, 0, H, H, 1.2, g); return; }
  const { s0, s1, y0, y1 } = hole;
  if (s0 > 0.001) wallPiece(mat, A, dir, nrm, 0, s0, 0, H, H, 1.2, g);
  if (s1 < len - 0.001) wallPiece(mat, A, dir, nrm, s1, len, 0, H, H, 1.2, g);
  if (y0 > 0.001) wallPiece(mat, A, dir, nrm, s0, s1, 0, y0, H, 1.2, g);
  if (y1 < H - 0.001) wallPiece(mat, A, dir, nrm, s0, s1, y1, H, H, 1.2, g);
}
function roomShell(g, o) {
  const { xa, xb, d, H, mat, floor } = o, z0 = 0.2;
  const fw = xb - xa, fl = new THREE.PlaneGeometry(fw, d); { const uv = fl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * fw, uv.getY(i) * d); }
  const f = mesh(fl, floor, (xa + xb) / 2, 0.001, d / 2, g); f.rotation.x = -Math.PI / 2;
  const cl = new THREE.PlaneGeometry(fw, d - z0); { const uv = cl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * fw, uv.getY(i) * (d - z0)); }
  const c = mesh(cl, MAT.ceiling, (xa + xb) / 2, H, (d + z0) / 2, g); c.rotation.x = Math.PI / 2;
  // door wall (opening 1.2 x 2.3 at x = 0), back wall, sides
  wallH(g, mat, [xa, z0], [1, 0], [0, 1], fw, H, { s0: -0.6 - xa, s1: 0.6 - xa, y0: 0, y1: 2.3 });
  const bh = o.window ? { s0: xb - o.window.x1, s1: xb - o.window.x0, y0: o.window.y0, y1: o.window.y1 } : null;
  wallH(g, mat, [xb, d], [-1, 0], [0, -1], fw, H, bh);
  wallH(g, mat, [xa, d], [0, -1], [1, 0], d - z0, H);
  wallH(g, mat, [xb, z0], [0, 1], [-1, 0], d - z0, H);
  // cove light + crown shadow line on every wall
  [[(xa + xb) / 2, z0 + 0.07, fw - 0.2, 0], [(xa + xb) / 2, d - 0.07, fw - 0.2, 0], [xa + 0.07, (d + z0) / 2, d - z0 - 0.2, Math.PI / 2], [xb - 0.07, (d + z0) / 2, d - z0 - 0.2, Math.PI / 2]].forEach(([x, z, L, ry]) => {
    const cv = mesh(BOX(L, 0.03, 0.03), SLOT, x, H - 0.3, z, g); cv.rotation.y = ry;
    const sh = mesh(RBOX(L + 0.1, 0.08, 0.12, 0.015), MAT.gunDark, x, H - 0.25, z, g); sh.rotation.y = ry;
  });
  // room-side door frame and label
  [-1, 1].forEach((sd) => mesh(RBOX(0.16, 2.45, 0.1, 0.02), MAT.gun, sd * 0.68, 1.225, z0 + 0.05, g));
  mesh(RBOX(1.52, 0.16, 0.1, 0.02), MAT.gun, 0, 2.38, z0 + 0.05, g);
  const lp = cnv(256, 48); { const c2 = lp.getContext('2d'); c2.fillStyle = '#000'; c2.fillRect(0, 0, 256, 48); hexNode(c2, 24, 24, 14); c2.fillStyle = '#E8A06A'; c2.fill(); c2.fillStyle = '#F5E6CF'; c2.font = `700 22px ${DISP}`; c2.textBaseline = 'middle'; c2.fillText('BRIDGE', 48, 26); }
  mesh(new THREE.PlaneGeometry(0.62, 0.116), new THREE.MeshBasicMaterial({ map: tex(lp), toneMapped: false }), 0, 2.38, z0 + 0.102, g);
  // collision: walls with the door gap
  lseg(g, xa, z0, -0.6, z0, 0.33); lseg(g, 0.6, z0, xb, z0, 0.33);
  lseg(g, xa, d, xb, d, 0.33); lseg(g, xa, z0, xa, d, 0.33); lseg(g, xb, z0, xb, d, 0.33);
  // light
  // the room's ceiling fixtures light it through the bake; this position is only used by the fallback light rig
  const lightPos = new THREE.Vector3(o.light[0], o.light[1], o.light[2]).applyMatrix4(g.matrixWorld);
  const room = { g, xa, xb, d, label: o.label, lightPos, base: o.lightI || 0.9, k: 0, door: W(g, 0, 0) };
  ROOMS.push(room); return room;
}
// armored viewport with blast shutters, set in a room's back wall
function viewport(g, x0, x1, y0, y1, z) {
  const w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  mesh(RBOX(w + 0.36, 0.18, 0.4, 0.03), MAT.gun, cx, y1 + 0.09, z - 0.04, g);
  mesh(RBOX(w + 0.36, 0.16, 0.46, 0.03), MAT.gun, cx, y0 - 0.08, z - 0.06, g);
  mesh(RBOX(w + 0.1, 0.03, 0.2, 0.01), MAT.steel, cx, y0 + 0.005, z - 0.2, g);
  [-1, 1].forEach((sd) => {
    mesh(RBOX(0.18, h + 0.36, 0.4, 0.03), MAT.gun, cx + sd * (w / 2 + 0.09), cy, z - 0.04, g);
    for (let k = 0; k < Math.max(3, Math.round(h / 0.3)); k++) mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8), MAT.steel, cx + sd * (w / 2 + 0.09), y0 + 0.1 + k * (h - 0.2) / Math.max(2, Math.round(h / 0.3) - 1), z - 0.245, g).rotation.x = Math.PI / 2;
  });
  for (let k = 1; k < Math.round(w / 1.2); k++) mesh(RBOX(0.07, h, 0.08, 0.015), MAT.gun, x0 + k * w / Math.round(w / 1.2), cy, z, g);
  const gl = mesh(new THREE.PlaneGeometry(w, h), PANE, cx, cy, z + 0.02, g); gl.rotation.y = Math.PI;
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), SHEEN_MAT); sh.position.set(cx, cy, z + 0.015); sh.rotation.y = Math.PI; g.add(sh);
  const n = Math.max(6, Math.round(h / 0.15)), slats = [];
  for (let i = 0; i < n; i++) { const s = mesh(BOX(w, 0.022, 0.17), MAT.gun, cx, y0 + (i + 0.5) * h / n, z + 0.14, g); slats.push(s); }
  SHUTTERS.push({ slats, cur: 0 });
  addHit(BOX(w, h, 0.4), { station: 'shutters' }, g, cx, cy, z - 0.2);
}
// box = [x0, x1, z0, z1]: optional wall faces around the plant (parent coordinates). Leaves that would reach through
// a wall are stood more upright so the whole plant stays in its room.
function plantAt(parent, x, z, scale, box) {
  const g = group(x, 0, z, 0, parent); g.scale.setScalar(scale || 1);
  const room = (a) => { // how far the room lets a leaf reach from the pot in direction a (world-scaled metres)
    if (!box) return Infinity; const dx = Math.sin(a), dz = Math.cos(a); let t = Infinity;
    if (dx > 1e-4) t = Math.min(t, (box[1] - x) / dx); if (dx < -1e-4) t = Math.min(t, (box[0] - x) / dx);
    if (dz > 1e-4) t = Math.min(t, (box[3] - z) / dz); if (dz < -1e-4) t = Math.min(t, (box[2] - z) / dz);
    return t - 0.07;
  };
  mesh(CYL(0.2, 0.15, 0.5, 24), POT, 0, 0.25, 0, g);
  mesh(new THREE.TorusGeometry(0.2, 0.015, 6, 24), BRASS, 0, 0.5, 0, g).rotation.x = Math.PI / 2;
  const rr = mulberry(Math.round(x * 100 + z * 37) + 99);
  for (let i = 0; i < 13; i++) {
    const a = i / 13 * Math.PI * 2 + rr() * 0.4, len = 0.4 + rr() * 0.35; let tilt = 0.3 + rr() * 0.6;
    // a leaf reaches about 1.9 x len x sin(tilt) out from the pot; keep that inside the walls
    const k = room(a) / (1.9 * len * (scale || 1)); if (k < Math.sin(tilt)) tilt = Math.asin(Math.max(0.05, Math.min(1, k)));
    const piv = group(0, 0.5, 0, a, g);
    const l = mesh(new THREE.SphereGeometry(1, 10, 6), LEAF, 0, 0, 0, piv); l.scale.set(0.065, len, 0.022);
    l.position.set(0, Math.cos(tilt) * len * 0.9, Math.sin(tilt) * len * 0.9); l.rotation.x = tilt;
  }
  return g;
}
function lathe(pts, segs) { return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), segs || 32); }
function plaqueTex(lines, w, h) {
  const c = cnv(w, h), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8a6a44'); gr.addColorStop(1, '#5a4229'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,230,190,0.6)'; g.lineWidth = 4; g.strokeRect(12, 12, w - 24, h - 24);
  lines(g); return tex(c);
}

// ---------- the exterior, seen only through viewports ----------
{
  const n = 1800, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), r = mulberry(404);
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); pos.set([Math.cos(th) * s * 260, u * 260, Math.sin(th) * s * 260], i * 3); const b = 0.5 + r() * 0.5, t = r(); col.set([b * (t < 0.3 ? 0.82 : 1), b * 0.93, b * (t > 0.75 ? 0.82 : 1)], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  // the view outside is shared by every deck's windows, so it stays in the scene when decks are swapped (lift.js)
  add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, vertexColors: true, depthWrite: false, toneMapped: false, fog: false }))).userData.keep = true;
  const nb = new THREE.Sprite(new THREE.SpriteMaterial({ map: nebula.material.map, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
  nb.position.set(150, 30, 330); nb.scale.set(560, 330, 1); nb.userData.keep = true; scene.add(nb);
}
const EXT_N = 600, extPos = new Float32Array(EXT_N * 6), extCol = new Float32Array(EXT_N * 6), extXYZ = new Float32Array(EXT_N * 3);
function seedExt(i, z) { let x, y; do { x = (Math.random() - 0.5) * 150; y = (Math.random() - 0.5) * 80; } while (Math.abs(x) < 18 && Math.abs(y) < 12); extXYZ[i * 3] = x; extXYZ[i * 3 + 1] = y; extXYZ[i * 3 + 2] = z; }
for (let i = 0; i < EXT_N; i++) { seedExt(i, -90 + Math.random() * 180); const b = 0.6 + Math.random() * 0.4; extCol.set([b, b, b, 0.1, 0.25 * b, 0.45 * b], i * 6); }
const extGeo = new THREE.BufferGeometry(); extGeo.setAttribute('position', new THREE.BufferAttribute(extPos, 3)); extGeo.setAttribute('color', new THREE.BufferAttribute(extCol, 3));
const extMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false });
const extStreaks = add(new THREE.LineSegments(extGeo, extMat)); extStreaks.frustumCulled = false; extStreaks.visible = false; extStreaks.userData.keep = true;

// ---------- READY ROOM (off the aft-starboard wall) ----------
// About 6 x 6.5 m inside. The room runs forward from its door along the outside of the starboard bridge wall,
// which keeps it clear of the conference room aft.
let cupLiquid, cupGroup;
{
  const g = roomFrame(3, DOOR_GAPS[3]);
  const XA = -0.85, XB = 5.15, D = 6.7, H = ROOM_H, MX = (XA + XB) / 2, MZ = (0.2 + D) / 2;
  const PBOX = [XA + 0.04, XB - 0.04, 0.24, D - 0.04]; // wall faces (roomShell), for plants' leaves
  roomShell(g, { xa: XA, xb: XB, d: D, H, mat: roomWarm, floor: MAT.roomCarpet, window: { x0: 0.15, x1: 4.15, y0: 0.95, y1: 2.35 }, light: [MX, H - 0.35, MZ], lightI: 1.0, label: 'Ready Room' });
  viewport(g, 0.15, 4.15, 0.95, 2.35, D);
  // rug under the sitting area and the front of the desk
  { const c = cnv(512, 416), x = c.getContext('2d'); x.fillStyle = '#26303b'; x.fillRect(0, 0, 512, 416); noise(x, 512, 416, 9000, 0.05, 72);
    x.strokeStyle = 'rgba(201,182,140,0.75)'; x.lineWidth = 6; x.strokeRect(18, 18, 476, 380); x.lineWidth = 2; x.strokeRect(34, 34, 444, 348);
    x.strokeStyle = 'rgba(201,182,140,0.16)'; x.lineWidth = 1.5; for (let yy = 60; yy < 370; yy += 36) for (let xx = 60 + ((yy / 36) % 2) * 18; xx < 460; xx += 36) { hexNode(x, xx, yy, 12); x.stroke(); }
    const rug = mesh(new THREE.PlaneGeometry(3.6, 2.92), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.97, polygonOffset: true, polygonOffsetFactor: -1 }), 1.3, 0.004, 3.75, g); rug.rotation.x = -Math.PI / 2; }
  // desk: walnut top on two steel-trimmed pedestals, facing the door, the captain's back to the viewport
  const DK = { x: 2.8, z: 4.6 };
  const desk = group(DK.x, 0, DK.z, 0, g);
  mesh(RBOX(1.6, 0.06, 0.8, 0.025), WOOD, 0, 0.76, 0, desk);
  mesh(RBOX(1.62, 0.015, 0.82, 0.006), MAT.steel, 0, 0.725, 0, desk);
  [-1, 1].forEach((sd) => { mesh(RBOX(0.42, 0.72, 0.7, 0.03), MAT.gun, sd * 0.56, 0.36, 0.02, desk); mesh(BOX(0.36, 0.012, 0.012), SLOT, sd * 0.56, 0.55, -0.335, desk); mesh(BOX(0.3, 0.012, 0.012), SLOT, sd * 0.56, 0.3, -0.335, desk); });
  mesh(RBOX(0.72, 0.5, 0.04, 0.01), MAT.gunDark, 0, 0.45, -0.3, desk);
  { const s = group(0, 0.79, -0.18, 0, desk); s.rotation.x = -0.45; mesh(RBOX(0.74, 0.44, 0.04, 0.012), MAT.gunDark, 0, 0.2, -0.025, s); addScreen(group(0, 0.2, 0, 0, s), 0.68, 0.38, 640, 358, 'log', 'desk', 'Personal Log', 'CO·01'); }
  [[0.45, 0.25, 0.3], [0.5, 0.18, -0.2]].forEach(([x, z, ry]) => { const p = mesh(RBOX(0.16, 0.012, 0.24, 0.004), MAT.gunDark, x, 0.796, z, desk); p.rotation.y = ry; const sc = mesh(new THREE.PlaneGeometry(0.13, 0.2), new THREE.MeshBasicMaterial({ color: 0x1b2a44, toneMapped: false }), x, 0.803, z, desk); sc.rotation.set(-Math.PI / 2, 0, ry); });
  mesh(lathe([[0, 0], [0.05, 0], [0.05, 0.012], [0.012, 0.03], [0.008, 0.33], [0, 0.33]]), MAT.steel, -0.62, 0.79, 0.2, desk);
  { const sh = mesh(lathe([[0.012, 0], [0.07, -0.06], [0.072, -0.065], [0.014, -0.004]], 24), MAT.gun, -0.62, 1.15, 0.2, desk); sh.rotation.x = 0.3; mesh(new THREE.CircleGeometry(0.06, 20), downlightMat, -0.62, 1.098, 0.215, desk).rotation.x = Math.PI / 2 + 0.3; }
  addHit(BOX(1.7, 1.2, 0.9), { station: 'desk' }, desk, 0, 0.6, 0);
  lpool(g, DK.x - 0.6, DK.z + 0.15, 1.2, 1.2, 0xffd2a0, 0.12);
  lrect(g, DK.x, DK.z, 1.6, 0.8, PR); lao(g, DK.x, DK.z, 2.0, 1.2, 0.55);
  // chairs: captain behind the desk, two guests in front
  { const c = group(DK.x, 0, DK.z + 0.7, 0, g); makeChair(c, 'captain'); lobs(g, DK.x, DK.z + 0.7, 0.32); lao(g, DK.x, DK.z + 0.7, 0.9, 0.9, 0.55); }
  [DK.x - 0.45, DK.x + 0.45].forEach((x) => { const c = group(x, 0, DK.z - 0.9, Math.PI, g); makeChair(c, 'station'); lobs(g, x, DK.z - 0.9, 0.3); lao(g, x, DK.z - 0.9, 0.8, 0.8, 0.5); });
  // settee against the aft side wall, with a low table
  const ST = { x: XA + 0.4, z: 3.75 };
  { const s = group(ST.x, 0, ST.z, 0, g);
    mesh(RBOX(0.72, 0.36, 1.96, 0.04), MAT.leatherDark, 0, 0.2, 0, s);
    [-0.45, 0.45].forEach((z) => mesh(RBOX(0.62, 0.14, 0.9, 0.06), MAT.leather, 0.05, 0.44, z, s));
    mesh(RBOX(0.2, 0.5, 1.96, 0.06), MAT.leather, -0.28, 0.6, 0, s);
    [-1, 1].forEach((sd) => mesh(RBOX(0.72, 0.52, 0.16, 0.05), MAT.leatherDark, 0, 0.3, sd * 1.02, s));
    const pil = mesh(RBOX(0.12, 0.34, 0.36, 0.06), FABRIC, -0.12, 0.66, -0.62, s); pil.rotation.z = -0.25; pil.rotation.y = 0.2;
    lrect(g, ST.x, ST.z, 0.74, 2.2, PR); lao(g, ST.x, ST.z, 1.2, 2.6, 0.6); }
  { const t = group(ST.x + 0.9, 0, ST.z, 0, g); mesh(RBOX(0.58, 0.035, 1.0, 0.012), MAT.glassTop, 0, 0.42, 0, t); mesh(RBOX(0.46, 0.38, 0.86, 0.03), MAT.gun, 0, 0.2, 0, t);
    const cr = mesh(new THREE.OctahedronGeometry(0.07, 0), new THREE.MeshStandardMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.3, emissive: 0x1a3a5a }), 0, 0.51, 0.22, t); cr.scale.set(1, 1.6, 1);
    mesh(RBOX(0.2, 0.03, 0.28, 0.006), new THREE.MeshStandardMaterial({ color: 0x6b2a22, roughness: 0.7 }), 0.02, 0.453, -0.2, t);
    lrect(g, ST.x + 0.9, ST.z, 0.58, 1.0, PR); }
  // shelves above the settee: books and keepsakes
  { const s = group(XA + 0.14, 0, ST.z, 0, g); const BOOK = ['#4a1c17', '#1a2638', '#2b3520', '#5a4b33', '#221f1c', '#3b2640', '#5e3d1d'].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 }));
    [1.6, 2.08].forEach((y, k) => {
      mesh(RBOX(0.26, 0.035, 1.7, 0.01), WOOD, 0, y, 0, s);
      const r = mulberry(300 + k); let z = -0.78;
      while (z < (k ? 0.2 : 0.05)) { const th = 0.025 + r() * 0.03, hh = 0.2 + r() * 0.08; const b = mesh(BOX(0.18, hh, th), BOOK[(r() * BOOK.length) | 0], 0, y + 0.0175 + hh / 2, z + th / 2, s); if (r() < 0.12) { b.rotation.x = 0.2; } z += th + 0.004; }
    });
    mesh(CYL(0.035, 0.05, 0.12, 16), BRASS, 0.0, 1.677, 0.45, s); mesh(new THREE.SphereGeometry(0.045, 16, 12), BRASS, 0.0, 1.77, 0.45, s);
    mesh(RBOX(0.03, 0.2, 0.26, 0.006), MAT.gunDark, 0.02, 2.2, 0.5, s);
    const ph = cnv(128, 100); { const x = ph.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 100); gr.addColorStop(0, '#5a7aa0'); gr.addColorStop(0.55, '#c9b28a'); gr.addColorStop(1, '#4a5a3a'); x.fillStyle = gr; x.fillRect(0, 0, 128, 100); x.fillStyle = 'rgba(40,40,50,0.6)'; x.beginPath(); x.moveTo(0, 62); x.lineTo(30, 44); x.lineTo(58, 56); x.lineTo(92, 36); x.lineTo(128, 52); x.lineTo(128, 100); x.lineTo(0, 100); x.fill(); }
    const pic = mesh(new THREE.PlaneGeometry(0.22, 0.17), new THREE.MeshStandardMaterial({ map: tex(ph), roughness: 0.5 }), 0.037, 2.2, 0.5, s); pic.rotation.y = Math.PI / 2; }
  // forward wall: ship status display over a credenza with the ship's model
  const CZ = 3.95;
  { const dsp = group(XB - 0.03, 1.9, CZ, -Math.PI / 2, g); display(dsp, 1.5, 0.92, 520, 320, 'status', 'ship', 'Ship Status', 'SYS·00'); }
  { const cz = group(XB - 0.22, 0, CZ, -Math.PI / 2, g);
    mesh(RBOX(2.0, 0.66, 0.42, 0.03), MAT.gun, 0, 0.35, 0, cz); mesh(RBOX(2.04, 0.04, 0.46, 0.012), WOOD, 0, 0.7, 0, cz);
    [-0.5, 0.5].forEach((x) => mesh(BOX(0.9, 0.01, 0.01), SLOT, x, 0.12, 0.215, cz));
    // display case with the Defiance model
    const cs = group(-0.45, 0.72, 0, 0, cz);
    mesh(RBOX(0.78, 0.05, 0.36, 0.012), MAT.gunDark, 0, 0.025, 0, cs); mesh(BOX(0.72, 0.008, 0.008), SLOT, 0, 0.03, 0.182, cs);
    mesh(new THREE.BoxGeometry(0.74, 0.34, 0.32), GLASS, 0, 0.22, 0, cs);
    mesh(CYL(0.008, 0.008, 0.1, 8), MAT.steel, 0, 0.1, 0, cs);
    const m = group(0, 0.19, 0, Math.PI / 2, cs); m.scale.setScalar(0.24);
    const HULL = new THREE.MeshStandardMaterial({ color: 0xa9aeb5, metalness: 0.55, roughness: 0.42, envMapIntensity: 0.9 });
    const hs = new THREE.Shape(); [[0, 1], [0.34, 0.5], [0.4, -0.2], [0.62, -0.45], [0.62, -0.95], [0.18, -0.8], [0, -0.92], [-0.18, -0.8], [-0.62, -0.95], [-0.62, -0.45], [-0.4, -0.2], [-0.34, 0.5]].forEach(([x, y], i) => (i ? hs.lineTo(x, y) : hs.moveTo(x, y))); hs.closePath();
    const hg = new THREE.ExtrudeGeometry(hs, { depth: 0.1, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 }); hg.rotateX(-Math.PI / 2); hg.translate(0, -0.05, 0);
    mesh(hg, HULL, 0, 0, 0, m);
    mesh(RBOX(0.16, 0.08, 0.22, 0.03), HULL, 0, 0.09, -0.1, m);
    mesh(RBOX(0.3, 0.05, 0.5, 0.03), HULL, 0, 0.06, 0.35, m);
    const blue = new THREE.MeshBasicMaterial({ color: 0x6aa8ff, toneMapped: false });
    [-1, 1].forEach((sd) => { const n = mesh(CYL(0.07, 0.06, 0.72, 14), HULL, sd * 0.55, -0.1, 0.55, m); n.rotation.x = Math.PI / 2; mesh(BOX(0.02, 0.02, 0.5), blue, sd * 0.55 + sd * 0.07, -0.1, 0.55, m); mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff5040, toneMapped: false }), sd * 0.08, 0.0, -1.0, m); });
    addHit(BOX(0.8, 0.5, 0.4), { station: 'ship' }, cs, 0, 0.2, 0);
    lrect(g, XB - 0.22, CZ, 0.44, 2.04, PR); lao(g, XB - 0.25, CZ, 0.9, 2.4, 0.55); }
  // synthesizer niche beside the door, with a small round table and two chairs for a meal
  { const sn = group(2.1, 0, 0.2, 0, g);
    [-1, 1].forEach((sd) => mesh(RBOX(0.08, 0.82, 0.16, 0.02), MAT.gun, sd * 0.29, 1.25, 0.08, sn));
    mesh(RBOX(0.66, 0.08, 0.16, 0.02), MAT.gun, 0, 1.62, 0.08, sn); mesh(RBOX(0.66, 0.08, 0.16, 0.02), MAT.gun, 0, 0.88, 0.08, sn);
    mesh(new THREE.PlaneGeometry(0.5, 0.66), new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.4, metalness: 0.5 }), 0, 1.25, 0.012, sn);
    mesh(new THREE.PlaneGeometry(0.46, 0.035), new THREE.MeshBasicMaterial({ color: 0xffd9a8, toneMapped: false }), 0, 1.55, 0.016, sn);
    mesh(RBOX(0.5, 0.025, 0.16, 0.008), MAT.steel, 0, 0.965, 0.1, sn);
    const lb = cnv(256, 40); { const x = lb.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 256, 40); hexNode(x, 20, 20, 11); x.fillStyle = '#E8A06A'; x.fill(); x.fillStyle = '#F5E6CF'; x.font = `700 18px ${DISP}`; x.textBaseline = 'middle'; x.fillText('SYNTHESIZER', 40, 21); }
    mesh(new THREE.PlaneGeometry(0.44, 0.07), new THREE.MeshBasicMaterial({ map: tex(lb), toneMapped: false }), 0, 1.74, 0.012, sn);
    cupGroup = group(0, 0.978, 0.1, 0, sn); cupGroup.visible = false;
    mesh(lathe([[0, 0], [0.034, 0], [0.04, 0.006], [0.043, 0.095], [0.039, 0.095], [0.035, 0.008], [0, 0.008]], 24), CERAMIC, 0, 0, 0, cupGroup);
    mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 16, Math.PI), CERAMIC, 0.044, 0.05, 0, cupGroup).rotation.z = -Math.PI / 2;
    cupLiquid = new THREE.MeshStandardMaterial({ color: 0x3a2214, roughness: 0.15 });
    mesh(new THREE.CircleGeometry(0.037, 20), cupLiquid, 0, 0.08, 0, cupGroup).rotation.x = -Math.PI / 2;
    addHit(BOX(0.7, 0.9, 0.4), { station: 'synth' }, sn, 0, 1.25, 0.2); }
  { const RT = { x: 3.95, z: 1.75 }, t = group(RT.x, 0, RT.z, 0, g);
    mesh(CYL(0.46, 0.46, 0.04, 40), WOOD, 0, 0.74, 0, t); mesh(new THREE.TorusGeometry(0.46, 0.008, 6, 48), MAT.steel, 0, 0.72, 0, t).rotation.x = Math.PI / 2;
    mesh(CYL(0.05, 0.06, 0.7, 16), MAT.gun, 0, 0.37, 0, t); mesh(CYL(0.3, 0.32, 0.03, 32), MAT.gun, 0, 0.015, 0, t);
    lobs(g, RT.x, RT.z, 0.48); lao(g, RT.x, RT.z, 1.2, 1.2, 0.55);
    [[-1, -Math.PI / 2], [1, Math.PI / 2]].forEach(([sd, ry]) => { const x = RT.x + sd * 0.72; const c = group(x, 0, RT.z, ry, g); makeChair(c, 'station'); lobs(g, x, RT.z, 0.3); lao(g, x, RT.z, 0.8, 0.8, 0.5); }); }
  plantAt(g, XA + 0.38, 0.68, 1.0, PBOX); lobs(g, XA + 0.38, 0.68, 0.28);
  plantAt(g, XA + 0.4, D - 0.4, 0.9, PBOX); lobs(g, XA + 0.4, D - 0.4, 0.26);
  plantAt(g, XB - 0.4, D - 0.4, 0.85, PBOX); lobs(g, XB - 0.4, D - 0.4, 0.26);
  // ceiling: a central light disc, downlights over the desk, the settee and the meal table
  { const dc = mesh(new THREE.CircleGeometry(0.7, 40), lightDiscMat, MX, H - 0.005, MZ, g); dc.rotation.x = Math.PI / 2; const rim = mesh(new THREE.TorusGeometry(0.71, 0.025, 8, 48), MAT.steel, MX, H - 0.01, MZ, g); rim.rotation.x = Math.PI / 2; }
  [[DK.x, DK.z + 0.25], [ST.x + 0.2, ST.z], [3.95, 1.75], [0.9, 6.0], [XB - 0.8, CZ], [0.3, 1.3], [ST.x + 0.2, 5.6], [4.2, 6.0]].forEach(([x, z]) => { mesh(new THREE.CircleGeometry(0.09, 20), downlightMat, x, H - 0.003, z, g).rotation.x = Math.PI / 2; lpool(g, x, z, 1.4, 1.4, 0xffd2a0, 0.1); });
}

// ---------- CONFERENCE ROOM (straight aft of the bridge, door on the starboard side of the aft wall) ----------
// About 8 x 6.5 m inside, with room to walk all the way around the table.
{
  const g = roomFrame(4, DOOR_GAPS[4]);
  const XA = -4.0, XB = 4.0, D = 6.7, H = ROOM_H;
  const PBOX = [XA + 0.04, XB - 0.04, 0.24, D - 0.04]; // wall faces (roomShell), for plants' leaves
  roomShell(g, { xa: XA, xb: XB, d: D, H, mat: roomWarm, floor: MAT.roomCarpet, window: { x0: -3.0, x1: 3.0, y0: 1.0, y1: 2.3 }, light: [0, H - 0.35, 3.5], lightI: 1.1, label: 'Conference Room' });
  viewport(g, -3.0, 3.0, 1.0, 2.3, D);
  // table: dark glass top with an underglow and the crest inlaid
  const T = { x: 0, z: 3.5, L: 4.4, W: 1.4 };
  const ts = new THREE.Shape(); { const hw = T.L / 2, hd = T.W / 2, r = 0.6; ts.moveTo(-hw + r, -hd); ts.lineTo(hw - r, -hd); ts.quadraticCurveTo(hw, -hd, hw, -hd + r); ts.lineTo(hw, hd - r); ts.quadraticCurveTo(hw, hd, hw - r, hd); ts.lineTo(-hw + r, hd); ts.quadraticCurveTo(-hw, hd, -hw, hd - r); ts.lineTo(-hw, -hd + r); ts.quadraticCurveTo(-hw, -hd, -hw + r, -hd); }
  const topG = new THREE.ExtrudeGeometry(ts, { depth: 0.03, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2, curveSegments: 16 }); topG.rotateX(-Math.PI / 2);
  mesh(topG, MAT.glassTop, T.x, 0.72, T.z, g);
  const glowS = new THREE.Shape(ts.getPoints(16).map((p) => new THREE.Vector2(p.x * 1.01, p.y * 1.03)));
  const glowG = new THREE.ExtrudeGeometry(glowS, { depth: 0.012, bevelEnabled: false }); glowG.rotateX(-Math.PI / 2);
  mesh(glowG, SLOT, T.x, 0.69, T.z, g);
  const rimG = new THREE.ExtrudeGeometry(new THREE.Shape(ts.getPoints(16).map((p) => new THREE.Vector2(p.x * 0.96, p.y * 0.9))), { depth: 0.1, bevelEnabled: false }); rimG.rotateX(-Math.PI / 2);
  mesh(rimG, MAT.gun, T.x, 0.6, T.z, g);
  [-1, 1].forEach((sd) => { mesh(RBOX(0.5, 0.6, 0.7, 0.05), MAT.gun, T.x + sd * 1.25, 0.3, T.z, g); mesh(BOX(0.4, 0.012, 0.012), SLOT, T.x + sd * 1.25, 0.08, T.z - 0.355, g); mesh(BOX(0.4, 0.012, 0.012), SLOT, T.x + sd * 1.25, 0.08, T.z + 0.355, g); });
  { const c = cnv(256, 256), x = c.getContext('2d'); drawCrest(x, 128, 128, 90, 'rgba(201,214,234,0.75)', 5); const cr = mesh(new THREE.PlaneGeometry(0.56, 0.56), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, toneMapped: false, depthWrite: false }), T.x, 0.772, T.z, g); cr.rotation.x = -Math.PI / 2; }
  lrect(g, T.x, T.z, T.L, T.W, PR); lao(g, T.x, T.z, T.L + 1.4, T.W + 1.4, 0.6);
  // seven seats: three a side, the captain's at the head facing the briefing display
  const seats = [];
  [-1.5, 0, 1.5].forEach((x) => { seats.push([x, T.z - 1.05, Math.PI]); seats.push([x, T.z + 1.05, 0]); });
  seats.push([T.x + T.L / 2 + 0.6, T.z, Math.PI / 2]);
  seats.forEach(([x, z, ry], i) => {
    const c = group(x, 0, z, ry, g); makeChair(c, i === 6 ? 'captain' : 'xo'); lobs(g, x, z, 0.3); lao(g, x, z, 0.8, 0.8, 0.5);
    const fx = x + (T.x - x) * (i === 6 ? 0.36 : 0), fz = i === 6 ? z : z + (T.z - z) * 0.55;
    const sp = group(fx, 0.774, fz, ry, g); const sc = group(0, 0, 0, 0, sp); sc.rotation.x = -Math.PI / 2; addScreen(sc, 0.34, 0.18, 200, 106, 'keys', 'brief', '', '');
  });
  // briefing display on the port end wall
  { const d = group(XA + 0.03, 1.68, T.z, Math.PI / 2, g); display(d, 2.8, 1.58, 1024, 579, 'brief', 'brief', 'Briefing · Convoy Route', 'BRF·01');
    const ledge = group(XA + 0.15, 0, T.z, Math.PI / 2, g); mesh(RBOX(2.9, 0.06, 0.24, 0.02), MAT.gun, 0, 0.8, 0, ledge); mesh(BOX(2.7, 0.012, 0.012), SLOT, 0, 0.78, 0.12, ledge); }
  // sideboard: water and fruit
  { const sb = group(-2.45, 0, 0.45, 0, g);
    mesh(RBOX(1.9, 0.82, 0.48, 0.03), MAT.gun, 0, 0.42, 0, sb); mesh(RBOX(1.94, 0.04, 0.52, 0.012), WOOD, 0, 0.85, 0, sb);
    [-0.47, 0.47].forEach((x) => mesh(BOX(0.85, 0.01, 0.01), SLOT, x, 0.12, 0.245, sb));
    mesh(lathe([[0, 0], [0.06, 0], [0.065, 0.02], [0.07, 0.16], [0.055, 0.22], [0.05, 0.26], [0.064, 0.27], [0, 0.27]]), GLASS, -0.55, 0.87, 0, sb);
    mesh(lathe([[0, 0], [0.05, 0], [0.058, 0.17], [0.05, 0.17], [0, 0.01]]), new THREE.MeshStandardMaterial({ color: 0x9fc4dc, transparent: true, opacity: 0.25, roughness: 0.1 }), -0.55, 0.875, 0, sb);
    [[-0.32, 0.08], [-0.22, -0.06], [-0.12, 0.09], [-0.02, -0.05]].forEach(([x, z]) => mesh(lathe([[0, 0], [0.032, 0], [0.036, 0.11], [0.033, 0.11], [0, 0.004]], 20), GLASS, x, 0.87, z, sb));
    mesh(lathe([[0, 0], [0.08, 0.005], [0.17, 0.07], [0.165, 0.075], [0, 0.012]], 32), MAT.steel, 0.45, 0.87, 0, sb);
    [['#a3241c', -0.05, 0.02], ['#6f9a2a', 0.06, -0.04], ['#d9781e', 0.02, 0.07], ['#a3241c', -0.07, -0.06], ['#d9781e', 0.08, 0.05]].forEach(([c, x, z], i) => mesh(new THREE.SphereGeometry(0.042, 14, 10), new THREE.MeshStandardMaterial({ color: c, roughness: 0.45 }), 0.45 + x, 0.92 + (i > 2 ? 0.04 : 0), z, sb));
    lrect(g, -2.45, 0.45, 1.94, 0.52, PR); }
  // battle honors on the starboard end wall
  { const pt = plaqueTex((x) => {
      drawCrest(x, 110, 120, 70, '#f3dcb4', 5);
      x.fillStyle = '#f7e6c8'; x.textBaseline = 'middle'; x.font = `700 54px ${DISP}`; x.fillText('BATTLE HONORS', 220, 92);
      x.font = `500 24px ${MONO}`; x.fillText('USS DEFIANCE · EV-0408', 222, 146);
      [['KESSRA APPROACH', 'YEAR 2'], ['IRALIS PICKET LINE', 'YEAR 2'], ['THE THESSALY RUN', 'YEAR 3'], ['OKONKWO BREAKOUT', 'YEAR 3']].forEach(([a, b], i) => {
        const y = 250 + i * 66; x.fillStyle = 'rgba(255,230,190,0.25)'; x.fillRect(60, y - 30, 904, 1); x.fillStyle = '#f7e6c8'; x.font = `600 34px ${DISP}`; x.textAlign = 'left'; x.fillText(a, 70, y); x.textAlign = 'right'; x.font = `500 26px ${MONO}`; x.fillText(b, 954, y); x.textAlign = 'left';
      });
      x.font = `italic 500 24px ${MONO}`; x.fillStyle = 'rgba(247,230,200,0.85)'; x.fillText('“STEADY UNDER FIRE.”', 70, 538);
    }, 1024, 580);
    const hp = group(XB - 0.02, 1.72, T.z, -Math.PI / 2, g); mesh(RBOX(1.28, 0.76, 0.04, 0.01), MAT.gunDark, 0, 0, -0.02, hp);
    mesh(new THREE.PlaneGeometry(1.2, 0.68), new THREE.MeshStandardMaterial({ map: pt, metalness: 0.75, roughness: 0.35, envMapIntensity: 1.2 }), 0, 0, 0.002, hp);
    addHit(BOX(1.3, 0.8, 0.3), { station: 'honors' }, hp, 0, 0, 0.1); }
  plantAt(g, XB - 0.4, 0.62, 1.0, PBOX); lobs(g, XB - 0.4, 0.62, 0.28);
  plantAt(g, XA + 0.4, D - 0.4, 1.0, PBOX); lobs(g, XA + 0.4, D - 0.4, 0.28);
  plantAt(g, XB - 0.4, D - 0.4, 0.9); lobs(g, XB - 0.4, D - 0.4, 0.26);
  // ceiling: a long light panel over the table, rows of downlights over the walkways on both sides
  { const lp = mesh(new THREE.PlaneGeometry(4.0, 0.6), downlightMat, T.x, H - 0.045, T.z, g); lp.rotation.x = Math.PI / 2; mesh(RBOX(4.16, 0.04, 0.76, 0.015), MAT.steel, T.x, H - 0.02, T.z, g);
    lpool(g, T.x, T.z, 5.2, 2.6, 0xffd2a0, 0.14); }
  [-2.6, 0, 2.6].forEach((x) => [1.25, D - 1.0].forEach((z) => { mesh(new THREE.CircleGeometry(0.09, 20), downlightMat, x, H - 0.003, z, g).rotation.x = Math.PI / 2; lpool(g, x, z, 1.4, 1.4, 0xffd2a0, 0.08); }));
  [[XA + 0.7, T.z], [XB - 0.7, T.z]].forEach(([x, z]) => { mesh(new THREE.CircleGeometry(0.09, 20), downlightMat, x, H - 0.003, z, g).rotation.x = Math.PI / 2; });
}

// ---------- HEAD (off the aft-port wall) ----------
{
  const g = roomFrame(5, 0.4);
  roomShell(g, { xa: -1.0, xb: 1.0, d: 2.6, H: 2.6, mat: roomTile, floor: MAT.floorPlate, light: [0, 2.3, 1.4], lightI: 0.8, lightDist: 4.5, label: 'Head' });
  // vanity: counter, basin, mirror
  { const v = group(-0.45, 0, 2.35, 0, g);
    mesh(RBOX(1.0, 0.8, 0.48, 0.03), MAT.gun, 0, 0.4, 0, v); mesh(RBOX(1.04, 0.05, 0.52, 0.012), MAT.cap, 0, 0.83, 0, v);
    mesh(lathe([[0, -0.1], [0.12, -0.1], [0.18, -0.03], [0.2, 0.0], [0.205, 0.012], [0.19, 0.012], [0.17, -0.02], [0.11, -0.085], [0, -0.085]], 32), CERAMIC, 0, 0.85, -0.02, v);
    mesh(CYL(0.012, 0.014, 0.16, 10), MAT.steel, 0, 0.93, 0.2, v); const sp = mesh(CYL(0.01, 0.01, 0.12, 10), MAT.steel, 0, 1.0, 0.15, v); sp.rotation.x = Math.PI / 2;
    const mir = mesh(new THREE.PlaneGeometry(0.9, 0.78), new THREE.MeshStandardMaterial({ color: 0xd4dadf, metalness: 1, roughness: 0.04, envMapIntensity: 1.4 }), 0, 1.55, 0.228, v); mir.rotation.y = Math.PI;
    mesh(RBOX(0.96, 0.84, 0.02, 0.01), MAT.steel, 0, 1.55, 0.246, v);
    mesh(BOX(0.86, 0.018, 0.02), SLOT, 0, 2.0, 0.22, v);
    addHit(BOX(1.1, 1.6, 0.6), { station: 'head' }, v, 0, 1.0, 0);
    lrect(g, -0.45, 2.35, 1.04, 0.52, PR); }
  // stall
  mesh(RBOX(0.04, 1.84, 1.36, 0.01), MAT.panel, 0.15, 1.04, 1.93, g);
  mesh(RBOX(0.84, 1.84, 0.04, 0.01), MAT.panel, 0.58, 1.04, 1.25, g);
  mesh(BOX(0.04, 0.16, 0.03), MAT.steel, 0.25, 1.05, 1.22, g);
  { const c = cnv(128, 40), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 128, 40); hexNode(x, 18, 20, 10); x.fillStyle = '#5FA97A'; x.fill(); x.fillStyle = '#F5E6CF'; x.font = `700 18px ${DISP}`; x.textBaseline = 'middle'; x.fillText('VACANT', 36, 21);
    const pl = mesh(new THREE.PlaneGeometry(0.2, 0.0625), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), 0.58, 1.55, 1.228, g); pl.rotation.y = Math.PI; }
  mesh(lathe([[0, 0], [0.13, 0], [0.16, 0.2], [0.19, 0.38], [0.17, 0.4], [0, 0.4]], 28), CERAMIC, 0.6, 0, 2.25, g);
  mesh(RBOX(0.38, 0.4, 0.18, 0.03), CERAMIC, 0.6, 0.6, 2.5, g);
  lseg(g, 0.15, 1.25, 0.15, 2.6, PR); lseg(g, 0.15, 1.25, 1.0, 1.25, PR);
  // dryer + reclamation sign on the side wall
  { const s = group(-0.98, 0, 1.0, Math.PI / 2, g);
    mesh(RBOX(0.3, 0.34, 0.14, 0.03), MAT.steel, 0, 1.15, 0.07, s); mesh(BOX(0.2, 0.01, 0.06), MAT.gunDark, 0, 0.975, 0.1, s);
    const c = cnv(512, 160), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 512, 160); hexNode(x, 40, 44, 22); x.fillStyle = '#E8A06A'; x.fill();
    x.fillStyle = '#F5E6CF'; x.font = `700 34px ${DISP}`; x.textBaseline = 'middle'; x.fillText('WATER RECLAMATION', 78, 46);
    x.fillStyle = '#E8A06A'; x.font = `700 44px ${DISP}`; x.fillText('98.2%', 30, 112); x.fillStyle = '#9A8678'; x.font = `500 20px ${MONO}`; x.fillText('EVERY DROP. WE ARE A LONG WAY FROM ANYWHERE.', 160, 114);
    mesh(new THREE.PlaneGeometry(0.62, 0.194), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), 0, 1.7, 0.012, s); }
  { const lp = mesh(new THREE.PlaneGeometry(1.0, 0.5), downlightMat, -0.3, 2.594, 1.6, g); lp.rotation.x = Math.PI / 2; lpool(g, -0.3, 1.8, 1.8, 1.8, 0xfff0e0, 0.12); }
}

````

---

## `js/kit.js`

````javascript
// USS Defiance · kit.js
// The shared building kit for decks below the bridge: rooms, walls with door and window openings, collision lines,
// downlights and light panels, structural frames, handrails, corridor signs and potted plants. Every helper takes a
// deck context K = { root (the deck's group), segs, obs, rooms, rails, labels } as its first argument, so each deck
// builds with the same parts and the same standard sizes (STD, core.js). Deck 2 calls these through its d2* wrappers.
// Coordinates are the deck's own: x starboard, -z forward, y up from the deck floor.
// Files share one global scope and load in order (see index.html).
'use strict';

function kitSeg(K, ax, az, bx, bz, r) { K.segs.push([ax, az, bx, bz, r === undefined ? 0.33 : r]); }

function kitObs(K, x, z, r) { K.obs.push({ x, z, r }); }

// a straight wall from A to B facing n, with openings measured along it: { a, b, y0, y1 } (y0 > 0 means a window)
function kitWall(K, mat, A, B, n, H, holes) {
  const len = Math.hypot(B[0] - A[0], B[1] - A[1]), dir = [(B[0] - A[0]) / len, (B[1] - A[1]) / len], P = (s) => [A[0] + dir[0] * s, A[1] + dir[1] * s];
  let s = 0; (holes || []).slice().sort((p, q) => p.a - q.a).forEach((h) => {
    wallPiece(mat, A, dir, n, s, h.a, 0, H, H, 1.2, K.root);
    if (h.y0 > 0.001) wallPiece(mat, A, dir, n, h.a, h.b, 0, h.y0, H, 1.2, K.root);
    if (h.y1 < H - 0.001) wallPiece(mat, A, dir, n, h.a, h.b, h.y1, H, H, 1.2, K.root);
    const p0 = P(s), p1 = P(h.a); kitSeg(K, p0[0], p0[1], p1[0], p1[1]);
    if (h.y0 > 0.4) { const q0 = P(h.a), q1 = P(h.b); kitSeg(K, q0[0], q0[1], q1[0], q1[1]); }
    s = h.b;
  });
  wallPiece(mat, A, dir, n, s, len, 0, H, H, 1.2, K.root);
  const p0 = P(s), p1 = P(len); kitSeg(K, p0[0], p0[1], p1[0], p1[1]);
}

// a room: floor, ceiling, four walls facing in, a cove light and a dark crown under the ceiling
function kitRoom(K, label, x0, x1, z0, z1, H, mat, floor, holes) {
  const fw = x1 - x0, fd = z1 - z0;
  const fg = new THREE.PlaneGeometry(fw, fd); { const uv = fg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * fw, uv.getY(i) * fd); }
  const f = mesh(fg, floor, (x0 + x1) / 2, 0.002, (z0 + z1) / 2, K.root); f.rotation.x = -Math.PI / 2;
  const c = mesh(fg.clone(), MAT.ceiling, (x0 + x1) / 2, H, (z0 + z1) / 2, K.root); c.rotation.x = Math.PI / 2;
  // walls sit 6 cm inside the room's outline, so two rooms back to back never share one plane
  // (coincident back-to-back walls shadow each other in the light bake and come out black)
  const I = STD.inset, sh = (L) => (L || []).map((h) => Object.assign({}, h, { a: h.a - I, b: h.b - I }));
  holes = holes || {};
  kitWall(K, mat, [x0 + I, z0 + I], [x1 - I, z0 + I], [0, 1], H, sh(holes.n));
  kitWall(K, mat, [x0 + I, z1 - I], [x1 - I, z1 - I], [0, -1], H, sh(holes.s));
  kitWall(K, mat, [x0 + I, z0 + I], [x0 + I, z1 - I], [1, 0], H, sh(holes.w));
  kitWall(K, mat, [x1 - I, z0 + I], [x1 - I, z1 - I], [-1, 0], H, sh(holes.e));
  [[(x0 + x1) / 2, z0 + 0.13, fw - 0.3, 0], [(x0 + x1) / 2, z1 - 0.13, fw - 0.3, 0], [x0 + 0.13, (z0 + z1) / 2, fd - 0.3, Math.PI / 2], [x1 - 0.13, (z0 + z1) / 2, fd - 0.3, Math.PI / 2]].forEach(([x, z, L, ry]) => {
    const cv = mesh(BOX(L, 0.03, 0.03), SLOT, x, H - 0.28, z, K.root); cv.rotation.y = ry;
    const sh = mesh(RBOX(L + 0.1, 0.08, 0.12, 0.015), MAT.gunDark, x, H - 0.23, z, K.root); sh.rotation.y = ry;
    const st = mesh(BOX(L - 0.2, 0.02, 0.02), STRIP, x, 0.06, z, K.root); st.rotation.y = ry;
  });
  K.rooms.push({ label, x0, x1, z0, z1 });
}

function kitDown(K, x, z, H) {
  mesh(new THREE.CircleGeometry(0.1, 20), downlightMat, x, H - 0.004, z, K.root).rotation.x = Math.PI / 2;
  mesh(new THREE.TorusGeometry(0.115, 0.016, 6, 20), MAT.steel, x, H - 0.008, z, K.root).rotation.x = Math.PI / 2;
}

function kitPanel(K, x, z, H, w, d) {
  mesh(RBOX(w + 0.12, 0.04, d + 0.12, 0.015), MAT.steel, x, H - 0.02, z, K.root);
  mesh(new THREE.PlaneGeometry(w, d), downlightMat, x, H - 0.045, z, K.root).rotation.x = Math.PI / 2;
}

// a potted plant kept inside the walls of the room it stands in (walls are inset 6 cm from each room's outline)
function kitPlant(K, x, z, scale) {
  const r = K.rooms.find((q) => x > q.x0 && x < q.x1 && z > q.z0 && z < q.z1), I = STD.inset;
  plantAt(K.root, x, z, scale, r && [r.x0 + I, r.x1 - I, r.z0 + I, r.z1 - I]); kitObs(K, x, z, 0.3);
}

// a handrail along a wall at x from z0 to z1, broken at each gap [za, zb] (doorways and openings), with end brackets
function kitRail(K, x, z0, z1, gaps, side) {
  let runs = [[z0, z1]];
  (gaps || []).forEach(([a, b]) => { runs = runs.flatMap(([p, q]) => (b <= p || a >= q) ? [[p, q]] : [[p, a], [b, q]].filter(([u, v]) => v - u > 0.25)); });
  runs.forEach(([p, q]) => {
    const r = mesh(CYL(0.022, 0.022, q - p, 10), MAT.steel, x, 0.95, (p + q) / 2, K.root); r.rotation.x = Math.PI / 2; K.rails.push([x, p, q]);
    [p + 0.06, q - 0.06].forEach((z) => mesh(BOX(0.07, 0.025, 0.025), MAT.steel, x - side * 0.035, 0.95, z, K.root));
  });
}

function kitLabel(K, text, x, y, z, rot, w) {
  const c = cnv(512, 80), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 512, 80);
  hexTab(g, 6, 10, 40, 60, true, false); g.fillStyle = '#E8A06A'; g.fill();
  g.fillStyle = '#E8A06A'; g.font = `600 44px ${DISP}`; g.textBaseline = 'middle'; g.fillText(text, 60, 43);
  const m = mesh(new THREE.PlaneGeometry(w, w * 80 / 512), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), x, y, z, K.root); m.rotation.y = rot; K.labels.push(m); return m;
}

// ---------- officers' passage and observation lounge ----------
// From the corridor's aft end a short passage turns to port, then runs aft along the wardroom's port side, past the
// sealed pod capacitor bank, to the observation lounge across the stern of the spine.
function kitFrames(K, x0, x1, z0, z1, H) { // structural frames every 2.4 m along z, a light panel between each, handrails
  const cx = (x0 + x1) / 2;
  for (let z = z0 + 1.2; z < z1 - 0.4; z += 2.4) {
    [x0 + 0.05, x1 - 0.05].forEach((x) => mesh(RBOX(0.1, H - 0.05, 0.16, 0.02), MAT.gunDark, x, (H - 0.05) / 2, z, K.root));
    mesh(RBOX(x1 - x0, 0.12, 0.16, 0.02), MAT.gunDark, cx, H - 0.06, z, K.root);
    if (z + 1.2 < z1 - 0.5) kitPanel(K, cx, z + 1.2, H, 0.9, 0.36);
  }
}

// ---------- the corridor kit (roadmap B2) ----------
// Corridors are built from modules: a 2.2 m wide, 2.6 m high (STD.corridor) piece of corridor with its floor, ceiling,
// walls, a structural frame at its start (frames hide every joint), a ceiling light panel, cove light and shelf, base
// strip and handrails. Each side of a module is a wall, a door opening (1.2 m, at the module's centre) or open. A
// module may taper (ring corridors: the inner wall shorter than the outer), so a ring is a polygon of identical straight
// pieces bending at every frame. Every variant is built once and all its copies are drawn as instances (one draw per
// variant and material), placed by kitCorridorBuild from a deck's floor plan (deck3.js).
// Module frame: x across (-1.1 left to +1.1 right), y up from the floor, z along (start edge at -len/2).
const CKIT = { variants: new Map() };
// the section colour band along the walls: white paint, tinted per copy (InstancedMesh instance colours)
CKIT.band = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.05, envMapIntensity: 0.3 });
// merge [geometry, Matrix4] pairs into one geometry (position, normal, uv), so a variant's parts per material are one mesh
function kitGeo(list) {
  const pos = [], nor = [], uv = [];
  list.forEach(([g0, m]) => {
    const g = g0.index ? g0.toNonIndexed() : g0.clone(); if (m) g.applyMatrix4(m); if (!g.attributes.normal) g.computeVertexNormals();
    const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
    for (let i = 0; i < P.count; i++) { pos.push(P.getX(i), P.getY(i), P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i)); uv.push(U ? U.getX(i) : 0, U ? U.getY(i) : 0); }
  });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeBoundingSphere(); return g;
}
// a flat quad through four points (any order round its edge) facing along n, with uvs
function kitQuad(P, UV, n) {
  const a = new THREE.Vector3(...P[0]), b = new THREE.Vector3(...P[1]), c = new THREE.Vector3(...P[2]);
  const f = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).dot(new THREE.Vector3(...n)) < 0;
  const o = f ? [0, 3, 2, 1] : [0, 1, 2, 3], idx = [o[0], o[1], o[2], o[0], o[2], o[3]];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(idx.flatMap((i) => P[i]), 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(idx.flatMap(() => n), 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(idx.flatMap((i) => UV[i]), 2));
  return g;
}
const kitM4 = (x, y, z, ry, rx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, 0)), new THREE.Vector3(1, 1, 1));
// one module variant: sides [left, right], each 'w' wall, 'd' door, 'o' open; lin and lout the lengths of the left and
// right edges (equal for a straight piece); x: a crossing (open both sides, posts at the corners). Returns [{ geo, mat }].
function kitModule(L, R, lin, lout, wallMat) {
  const H = STD.corridor.h, W = STD.corridor.w / 2, zA = (x, s) => s * (lin + (lout - lin) * (x + W) / (2 * W)) / 2;
  const by = new Map(), put = (mat, g, m) => { if (!by.has(mat)) by.set(mat, []); by.get(mat).push([g, m]); };
  const f = [[-W, 0, zA(-W, -1)], [-W, 0, zA(-W, 1)], [W, 0, zA(W, 1)], [W, 0, zA(W, -1)]];
  put(MAT.floorCarpet, kitQuad(f.map(([x, , z]) => [x, 0.002, z]), f.map(([x, , z]) => [x, z]), [0, 1, 0]));
  put(MAT.ceiling, kitQuad(f.map(([x, , z]) => [x, H, z]), f.map(([x, , z]) => [x / 1.2, z / 1.2]), [0, -1, 0]));
  // light panel in the middle of the ceiling
  put(MAT.steel, RBOX(1.02, 0.04, 0.48, 0.015), kitM4(0, H - 0.02, 0, 0));
  put(downlightMat, new THREE.PlaneGeometry(0.9, 0.36), kitM4(0, H - 0.045, 0, 0, Math.PI / 2));
  [[-1, L], [1, R]].forEach(([s, k]) => {
    const x = s * W, z0 = zA(x, -1), z1 = zA(x, 1), len = z1 - z0, n = [-s, 0, 0], yaw = Math.atan2(0, 1);
    const wq = (a, b, y0, y1) => put(wallMat, kitQuad([[x, y0, a], [x, y0, b], [x, y1, b], [x, y1, a]], [[a / 1.2, y0 / H], [b / 1.2, y0 / H], [b / 1.2, y1 / H], [a / 1.2, y1 / H]], n));
    if (k === 'w') wq(z0, z1, 0, H);
    if (k === 'd') { wq(z0, -0.6, 0, H); wq(0.6, z1, 0, H); wq(-0.6, 0.6, 2.3, H); }
    if (k === 'o') return;
    // cove light and its shelf under the ceiling, base strip, handrail (broken at a door)
    const xi = x - s * 0.13;
    put(SLOT, BOX(0.03, 0.03, len - 0.1), kitM4(xi, H - 0.28, 0, yaw)); put(MAT.gunDark, RBOX(0.12, 0.08, len, 0.015), kitM4(x - s * 0.06, H - 0.23, 0, yaw));
    put(STRIP, BOX(0.02, 0.02, len - 0.2), kitM4(x - s * 0.02, 0.06, 0, yaw));
    // the section colour band at shoulder height, broken at a door's frame
    (k === 'd' ? [[z0, -0.84], [0.84, z1]] : [[z0, z1]]).forEach(([a, b]) => put(CKIT.band, BOX(0.012, 0.09, b - a), kitM4(x - s * 0.007, 1.62, (a + b) / 2, 0)));
    const rx = x - s * 0.06, runs = k === 'd' ? [[z0 + 0.15, -0.85], [0.85, z1 - 0.15]] : [[z0 + 0.15, z1 - 0.15]];
    runs.forEach(([a, b]) => { if (b - a < 0.25) return; put(MAT.steel, CYL(0.022, 0.022, b - a, 10), kitM4(rx, 0.95, (a + b) / 2, 0, Math.PI / 2));
      [a + 0.06, b - 0.06].forEach((zz) => put(MAT.steel, BOX(0.07, 0.025, 0.025), kitM4(x - s * 0.025, 0.95, zz, 0))); });
    // frame post at the start edge
    put(MAT.gunDark, RBOX(0.1, H - 0.05, 0.16, 0.02), kitM4(x - s * 0.05, (H - 0.05) / 2, zA(x - s * 0.05, -1), 0));
  });
  // frame beam across the start edge (turned to follow a tapered edge), or corner posts for a crossing
  if (L !== 'o' || R !== 'o') { const za = zA(-W, -1), zb = zA(W, -1); put(MAT.gunDark, RBOX(2 * W, 0.12, 0.16, 0.02), kitM4(0, H - 0.06, (za + zb) / 2, -Math.atan2(zb - za, 2 * W))); }
  else [[-W, -1], [W, -1], [-W, 1], [W, 1]].forEach(([x, s]) => put(MAT.gunDark, RBOX(0.2, H, 0.2, 0.03), kitM4(x, H / 2, zA(x, s), 0)));
  return [...by.entries()].map(([mat, list]) => ({ mat, geo: kitGeo(list) }));
}
// Place a deck's corridor: mods = [{ L, R, lin, lout, x, z, ry, sz }] (world x, z of the module's centre, turn about y,
// stretch along its length). One InstancedMesh per variant and material, added to K.root.
function kitCorridorBuild(K, mods, wallMat) {
  const groups = new Map();
  mods.forEach((d) => { const key = [d.L, d.R, d.lin.toFixed(3), d.lout.toFixed(3)].join('|'); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(d); });
  const out = [];
  groups.forEach((list, key) => {
    const [L, R, lin, lout] = key.split('|'), vk = key + '|' + wallMat.uuid;
    if (!CKIT.variants.has(vk)) CKIT.variants.set(vk, kitModule(L, R, +lin, +lout, wallMat));
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    CKIT.variants.get(vk).forEach(({ geo, mat }) => {
      const im = new THREE.InstancedMesh(geo, mat, list.length); im.name = 'corridor ' + key;
      list.forEach((d, i) => { q.setFromAxisAngle(up, d.ry); m4.compose(new THREE.Vector3(d.x, 0, d.z), q, new THREE.Vector3(1, 1, d.sz || 1)); im.setMatrixAt(i, m4);
        if (mat === CKIT.band) im.setColorAt(i, new THREE.Color(d.band || 0xD9B07E).convertSRGBToLinear()); }); // palette hex as painted, like the canvas signs
      if (mat === CKIT.band) im.userData.bandMods = list; // so a deck can recolour a band copy later (red alert)
      im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); K.root.add(im); out.push(im);
    });
  });
  return out;
}

// Signs and plates drawn into one canvas and one mesh (one draw for all of a deck's): cells = [{ w, h (pixels),
// draw(g, x, y, w, h), quads: [{ c: [x, y, z] centre, n: [x, y, z] facing, w, h (metres) }] }], laid out in rows.
function kitAtlas(K, cells, name) {
  const AW = 2048; let x = 0, y = 0, rowH = 0;
  cells.forEach((c) => { if (x + c.w > AW) { x = 0; y += rowH; rowH = 0; } c.px = x; c.py = y; x += c.w; rowH = Math.max(rowH, c.h); });
  const AH = Math.pow(2, Math.ceil(Math.log2(Math.max(64, y + rowH)))), cv = cnv(AW, AH), g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, AW, AH);
  const list = [], up = new THREE.Vector3(0, 1, 0);
  cells.forEach((c) => { g.save(); g.beginPath(); g.rect(c.px, c.py, c.w, c.h); g.clip(); c.draw(g, c.px, c.py, c.w, c.h); g.restore();
    const u0 = c.px / AW, u1 = (c.px + c.w) / AW, v1 = 1 - c.py / AH, v0 = 1 - (c.py + c.h) / AH;
    c.quads.forEach((q) => { const n = new THREE.Vector3(...q.n).normalize(), r = new THREE.Vector3().crossVectors(up, n).multiplyScalar(q.w / 2), h = up.clone().multiplyScalar(q.h / 2), C = new THREE.Vector3(...q.c);
      const P = [C.clone().sub(r).sub(h), C.clone().add(r).sub(h), C.clone().add(r).add(h), C.clone().sub(r).add(h)].map((v) => v.toArray());
      list.push([kitQuad(P, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], n.toArray()), null]); }); });
  const m = mesh(kitGeo(list), new THREE.MeshBasicMaterial({ map: tex(cv), toneMapped: false }), 0, 0, 0, K.root); m.name = name || 'atlas'; return m;
}
// A small prop (parts = [{ geo, mat }] in its own frame, +z facing out of the wall) drawn as instances at
// places = [{ x, z, ry }] on the deck floor.
// Parts sharing a material are merged first, so a prop costs one draw per material, not one per part.
function kitProps(K, parts, places, name) {
  const q = new THREE.Quaternion(), m4 = new THREE.Matrix4(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
  const byMat = new Map(); parts.forEach(({ geo, mat }) => { if (!byMat.has(mat)) byMat.set(mat, []); byMat.get(mat).push([geo, null]); });
  const merged = [...byMat].map(([mat, list]) => ({ geo: list.length > 1 ? kitGeo(list) : list[0][0], mat }));
  return merged.map(({ geo, mat }) => { const im = new THREE.InstancedMesh(geo, mat, places.length); im.name = name || 'props';
    places.forEach((p, i) => { q.setFromAxisAngle(up, p.ry); m4.compose(new THREE.Vector3(p.x, p.y || 0, p.z), q, one); im.setMatrixAt(i, m4); });
    im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); K.root.add(im); return im; });
}

````

---

## `js/deck2.js`

````javascript
// USS Defiance · deck2.js
// Deck 2, the officers' deck, part 1: the Lift 1 lobby, the corridor aft, the captain's quarters forward and
// the officers' wardroom. It sits a real deck (3.5 m) below the bridge; the lift car travels down to it.
// Built when the lift first heads down (buildDeck2, called by decks.js deckBuild); it has its own light bake (bake/d2).
// Coordinates are world x / z (forward is -z), with y measured from the Deck 2 floor.
// Files share one global scope and load in order (see index.html).
'use strict';

const D2Y = deckY(2), D2H = STD.room.h, D2C = STD.corridor.h; // floor height, room ceiling, corridor ceiling
const DECK2 = group(0, D2Y, 0, 0); DECK2.name = 'Deck 2';
const D2 = { root: DECK2, segs: [], obs: [], rooms: [], door: null, labels: [], rails: [] };
const d2RoomWall = roomWallMat(D2H, 'fabric'), d2CorrWall = roomWallMat(D2C, 'fabric');
const [D2_LX] = onEdge(LIFT_GAP.edge, LIFT_GAP.t, 0); // the lift door's x; the doors open forward at z = 6.2
function d2seg(ax, az, bx, bz, r) { return kitSeg(D2, ax, az, bx, bz, r); }
function d2obs(x, z, r) { return kitObs(D2, x, z, r); }
function d2wall(mat, A, B, n, H, holes) { return kitWall(D2, mat, A, B, n, H, holes); }
function d2room(label, x0, x1, z0, z1, H, mat, floor, holes) { return kitRoom(D2, label, x0, x1, z0, z1, H, mat, floor, holes); }
function d2down(x, z, H) { return kitDown(D2, x, z, H); }
function d2panel(x, z, H, w, d) { return kitPanel(D2, x, z, H, w, d); }
// simple furniture pieces
function d2chair(x, z, rot, mat, kind) {
  const g = group(x, 0, z, rot, DECK2); const ch = makeChair(g, kind || 'dining', mat); chairRest(ch.userData.chair, Math.sin(x * 5 + z * 11) * 0.18); return g;
}
// a quarters desk: walnut top, side panels and a drawer pedestal, with a bridge-style console pad on top whose
// whole face is a display (deskSurface), tilted a little toward the sitter at local +z
function d2desk(parent, w, d, station, sub, title, code) {
  const g = group(0, 0, 0, 0, parent);
  mesh(RBOX(w, 0.05, d, 0.02), WOOD, 0, 0.75, 0, g);
  [-1, 1].forEach((sd) => mesh(RBOX(0.08, 0.72, d - 0.07, 0.02), WOOD, sd * (w / 2 - 0.1), 0.36, 0, g));
  mesh(RBOX(0.42, 0.5, d - 0.15, 0.02), WOOD, w / 2 - 0.36, 0.47, 0, g);
  mesh(RBOX(w - 0.3, 0.4, 0.03, 0.01), MAT.gunDark, 0, 0.52, -d / 2 + 0.07, g);
  const pw = w - 0.2, pd = d - 0.2, top = group(0, 0.805, -0.02, 0, g); top.rotation.x = 0.1;
  mesh(RBOX(pw, 0.03, pd, 0.012), MAT_BEZEL, 0, 0.015, 0, top);
  mesh(pillow(pw, 0.045, 0.06, 0.02, 0.005, 'y', 0), MAT_PAD, 0, 0.012, pd / 2 + 0.02, top);
  deskSurface(top, pw, pd - 0.08, 0.031, -0.01, { id: station, title, code }, sub);
  addHit(BOX(w, 1.0, d), { station }, g, 0, 0.6, 0);
  return g;
}
function d2plant(x, z, scale) { return kitPlant(D2, x, z, scale); }
function d2rail(x, z0, z1, gaps, side) { return kitRail(D2, x, z0, z1, gaps, side); }
function d2label(text, x, y, z, rot, w) { return kitLabel(D2, text, x, y, z, rot, w); }

// a bed with its headboard to local -x: frame, mattress, cover, pillows, headboard; bedside tables at local z +-(wid/2 + 0.32)
function d2bed(parent, x, z, rot, wid, sides) {
  const g = group(x, 0, z, rot, parent), hw = wid / 2;
  mesh(RBOX(2.1, 0.32, wid + 0.1, 0.04), WOOD, 0, 0.18, 0, g);
  mesh(RBOX(2.0, 0.2, wid, 0.06), CERAMIC, 0, 0.42, 0, g);
  mesh(RBOX(1.3, 0.06, wid + 0.04, 0.03), FABRIC, 0.32, 0.54, 0, g);
  (wid > 1.2 ? [-hw / 2, hw / 2] : [0]).forEach((q) => mesh(RBOX(0.38, 0.12, Math.min(0.58, wid - 0.2), 0.05), CERAMIC, -0.78, 0.56, q, g));
  mesh(RBOX(0.1, 1.1, wid + 0.3, 0.03), MAT.leatherDark, -1.08, 0.75, 0, g);
  (sides || []).forEach((sd) => { const q = sd * (hw + 0.32); mesh(RBOX(0.45, 0.5, 0.42, 0.03), WOOD, -0.82, 0.25, q, g); mesh(lathe([[0, 0], [0.09, 0], [0.06, 0.22], [0.11, 0.3], [0, 0.3]], 20), BRASS, -0.82, 0.5, q, g); });
  return g;
}
// a partition across a room along x at z, double-faced (12 cm), from xa to xb with an opening from oa to ob
function d2partX(z, xa, xb, oa, ob, H) {
  [[xa, oa], [ob, xb]].forEach(([a, b]) => {
    wallPiece(d2RoomWall, [a, z + 0.06], [1, 0], [0, 1], 0, b - a, 0, H, H, 1.2, DECK2);
    wallPiece(d2RoomWall, [a, z - 0.06], [1, 0], [0, -1], 0, b - a, 0, H, H, 1.2, DECK2);
    d2seg(a, z, b, z, 0.2);
  });
  [oa, ob].forEach((x) => mesh(RBOX(0.14, H, 0.16, 0.02), MAT.gunDark, x, H / 2, z, DECK2));
}
// a wall shelf unit (books and keepsakes) facing local +z
function d2shelf(parent, x, z, rot, seed) {
  const sg = group(x, 0, z, rot, parent);
  mesh(RBOX(1.2, 1.9, 0.34, 0.02), WOOD, 0, 0.95, -0.02, sg);
  const rr = mulberry(seed); [0.45, 0.95, 1.45].forEach((y) => { mesh(BOX(1.1, 0.025, 0.3), MAT.gunDark, 0, y, 0.0, sg); let q = -0.5; while (q < 0.42) { const w = 0.03 + rr() * 0.05, h = 0.18 + rr() * 0.12; if (rr() < 0.1) { mesh(lathe([[0, 0], [0.05, 0], [0.04, 0.14], [0.02, 0.2], [0, 0.2]], 14), [BRASS, CERAMIC, GLASS][(rr() * 3) | 0], q + 0.06, y + 0.013, 0.0, sg); q += 0.16; continue; } mesh(BOX(w, h, 0.2), [MAT.leather, MAT.leatherDark, FABRIC, POT][(rr() * 4) | 0], q + w / 2, y + 0.013 + h / 2, 0.0, sg); q += w + 0.008; if (rr() < 0.12) q += 0.14; } });
  return sg;
}
// a rug: a dark field with a two-line border in the given colour
function d2rug(x, z, w, d, field, line, seed) {
  const c = cnv(512, Math.round(512 * d / w)), g = c.getContext('2d'), H = c.height; g.fillStyle = field; g.fillRect(0, 0, 512, H); noise(g, 512, H, 9000, 0.05, seed);
  g.strokeStyle = line; g.lineWidth = 7; g.strokeRect(18, 18, 476, H - 36); g.lineWidth = 2; g.strokeRect(36, 36, 440, H - 72);
  const m = mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.97, polygonOffset: true, polygonOffsetFactor: -1 }), x, 0.005, z, DECK2); m.rotation.x = -Math.PI / 2; return m;
}
// a synthesizer niche on a wall, facing local +z: recess, glowing back and a small screen beside it
function d2synth(parent, x, y, z, rot, station, title, code) {
  const n = group(x, y, z, rot, parent);
  mesh(RBOX(0.62, 0.72, 0.14, 0.03), MAT.gunDark, 0, 0, -0.04, n);
  mesh(new THREE.PlaneGeometry(0.5, 0.56), new THREE.MeshBasicMaterial({ color: 0x4a3c5a, toneMapped: false }), 0, 0, 0.035, n);
  display(group(0.55, 0, 0.02, 0, n), 0.36, 0.5, 220, 300, 'aux', station, title, code);
  addHit(BOX(1.4, 1.0, 0.6), { station }, n, 0.2, 0, 0.2);
  return n;
}

// ---------- plan ----------
const D2_LOBBY = { x0: -5.4, x1: 0.2, z0: 2.8, z1: 6.2 };
const D2_QTR = { x0: -7.2, x1: 1.6, z0: -5.2, z1: 2.8, door: -2.6 };
const D2_COR = { x0: 0.2, x1: 2.4, z0: 2.8, z1: 17.0 };
const D2_WARD = { x0: -3.2, x1: 5.8, z0: 17.0, z1: 24.5, door: 1.3, aft: 1.3 }; // aft: the 2 m double doors into the lounge
const D2_SO = { x0: 2.4, x1: 6.2 };
const D2_PAS = { z0: 15.0, z1: 17.0, ax0: -5.4, ax1: -3.2, az1: 24.5, cap: 20.5 };
const D2_LNG = { x0: -5.4, x1: 5.8, z0: 24.5, z1: 31.0, door: -4.3 };
const D2_XO = { x0: -5.4, x1: 0.2, z0: 8.6, z1: 15.0, door: 9.6 };

// ---------- the build ----------
// Everything below runs the first time the lift heads for Deck 2 (decks.js deckBuild, roadmap F4), not at start-up,
// so the ship opens on the bridge faster. The lift doors are shut and the car is moving while it runs.
let EXTSET = null; // the exterior model outside Deck 2's windows, built with the deck
// how detailed it is (roadmap F5): seen through windows, the lighter build is enough; Cinematic gets the full one
// (and so will the orbit view, exterior stage 4)
// Desktop: the lighter shape with full-size paint (the plating detail is in the paint); Phone: lighter shape and paint
function extOpts() { return QUALITY.tier === 'cinematic' ? { lite: false } : QUALITY.tier === 'desktop' ? { lite: true, atlasScale: 1 } : { lite: true }; }
// the quality setting changed after Deck 2 was built: swap the model for one built to the new setting
function extRebuild() {
  const o = extOpts(); if (!EXTSET || (EXTSET.userData.lite === o.lite && EXTSET.userData.atlasScale === (o.atlasScale || (o.lite ? 0.5 : 1)))) return;
  const old = EXTSET; DECK2.remove(old); old.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  EXTSET = buildExterior(extOpts()); EXTSET.name = 'Exterior'; DECK2.add(EXTSET); DECK2.updateMatrixWorld(true);
}
function buildDeck2() {
  // ---------- lift lobby ----------
  {
    const { x0, x1, z0, z1 } = D2_LOBBY, H = D2H;
    d2room('Lift 1 lobby', x0, x1, z0, z1, H, d2RoomWall, MAT.floorCarpet, {
      s: [{ a: D2_LX - 0.6 - x0, b: D2_LX + 0.6 - x0, y0: 0, y1: 2.3 }],
      n: [{ a: D2_QTR.door - 0.6 - x0, b: D2_QTR.door + 0.6 - x0, y0: 0, y1: 2.3 }],
      e: [{ a: 0.8, b: 2.2, y0: 0, y1: 2.35 }],
    });
    // lined reveal for the open way through to the corridor
    [3.6, 5.0].forEach((z) => mesh(BOX(0.16, 2.35, 0.04), MAT.gun, x1, 1.175, z, DECK2)); mesh(BOX(0.16, 0.04, 1.44), MAT.gun, x1, 2.35, 4.3, DECK2);
    // the lift doors on this deck (lift.js opens them with the car's)
    const g = group(D2_LX, 0, z1, Math.PI, DECK2);
    [-1, 1].forEach((sd) => mesh(RBOX(0.22, 2.6, 0.3, 0.03), MAT.gun, sd * 0.71, 1.3, 0.12, g));
    mesh(RBOX(1.64, 0.3, 0.3, 0.03), MAT.gun, 0, 2.45, 0.12, g);
    mesh(BOX(1.2, 0.004, 0.1), MAT.hazard, 0, 0.003, 0.16, g);
    const L = mesh(RBOX(0.6, 2.3, 0.06, 0.015), MAT.panel, -0.3, 1.15, 0.06, g), Rr = mesh(RBOX(0.6, 2.3, 0.06, 0.015), MAT.panel, 0.3, 1.15, 0.06, g);
    [L, Rr].forEach((d, k) => { mesh(BOX(0.02, 1.9, 0.02), SLOT, k ? -0.27 : 0.27, 0, 0.04, d); mesh(BOX(0.4, 0.05, 0.02), MAT.steel, 0, 0.1, 0.04, d); });
    addHit(BOX(1.6, 2.6, 0.8), { station: 'lift' }, g, 0, 1.3, 0.45);
    D2.door = { L, Rr };
    d2label('LIFT 1', D2_LX, 2.45, z1 - 0.28, Math.PI, 0.7);
    // deck sign beside the lift, the directory on the port wall, a bench and a plant
    { const c = cnv(560, 256), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 560, 256);
      elbow(x, 14, 14, 70, 18, 300, 30, true, '#E8A06A'); elbow(x, 14, 242, 70, 14, 200, 24, false, '#D9B07E');
      x.fillStyle = '#F2C88F'; x.font = `700 150px ${DISP}`; x.textBaseline = 'middle'; x.fillText('2', 110, 132);
      x.fillStyle = '#E8A06A'; x.font = `600 44px ${DISP}`; x.fillText('DECK 2', 220, 92); x.fillStyle = '#B693C4'; x.font = `500 32px ${DISP}`; x.fillText("OFFICERS' DECK", 222, 142); x.fillStyle = '#D9B07E'; x.font = `500 24px ${DISP}`; x.fillText('LIFT 1 · DECKS 1 TO 6', 222, 186);
      const m = mesh(new THREE.PlaneGeometry(1.1, 0.5), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), D2_LX + 1.75, 1.6, z1 - 0.082, DECK2); m.rotation.y = Math.PI;
      mesh(RBOX(1.22, 0.62, 0.02, 0.008), MAT.gunDark, D2_LX + 1.75, 1.6, z1 - 0.07, DECK2); }
    const dg = group(x0 + 0.1, 1.45, (z0 + z1) / 2, Math.PI / 2, DECK2); display(dg, 1.3, 0.8, 640, 394, 'deck2', 'deckdir', 'Deck 2 directory', 'D2·00');
    { const b = group(x0 + 0.3, 0, (z0 + z1) / 2, Math.PI / 2, DECK2); mesh(RBOX(1.6, 0.1, 0.42, 0.03), MAT.leather, 0, 0.45, 0, b); mesh(RBOX(1.6, 0.36, 0.36, 0.02), MAT_PED, 0, 0.2, 0.02, b); }
    d2obs(x0 + 0.3, (z0 + z1) / 2 - 0.5, 0.3); d2obs(x0 + 0.3, (z0 + z1) / 2 + 0.5, 0.3);
    d2plant(x1 - 0.45, z1 - 0.45, 0.9);
    d2down(D2_LX, (z0 + z1) / 2, H); d2down(x0 + 1.0, (z0 + z1) / 2, H); d2down(x1 - 1.1, (z0 + z1) / 2, H);
  }

  // ---------- corridor aft ----------
  {
    const { x0, x1, z0, z1 } = D2_COR, H = D2C, cx = (x0 + x1) / 2;
    d2room('Officers’ corridor', x0, x1, z0, z1, H, d2CorrWall, MAT.floorCarpet, {
      w: [{ a: 0.8, b: 2.2, y0: 0, y1: 2.35 }, { a: 6.2, b: 7.4, y0: 0, y1: 2.3 }, { a: 12.4, b: 13.8, y0: 0, y1: 2.35 }],
      e: [{ a: 3.8, b: 5.0, y0: 0, y1: 2.3 }, { a: 8.6, b: 9.8, y0: 0, y1: 2.3 }],
      s: [{ a: D2_WARD.door - 0.6 - x0, b: D2_WARD.door + 0.6 - x0, y0: 0, y1: 2.3 }],
    });
    // structural frames every 2.4 m, a light panel between each, handrails both sides
    d2panel(cx, z0 + 1.5, H, 0.9, 0.36);
    for (let z = z0 + 3.2; z < z1 - 0.4; z += 2.4) {
      [x0 + 0.05, x1 - 0.05].forEach((x) => mesh(RBOX(0.1, H - 0.05, 0.16, 0.02), MAT.gunDark, x, (H - 0.05) / 2, z, DECK2));
      mesh(RBOX(x1 - x0, 0.12, 0.16, 0.02), MAT.gunDark, cx, H - 0.06, z, DECK2);
      if (z + 1.2 < z1 - 0.5) d2panel(cx, z + 1.2, H, 0.9, 0.36);
    }
    // handrails both sides, broken at every doorway (door jambs stand 0.82 m either side of a door's centre) and opening
    d2rail(x0 + 0.06, z0 + 0.3, z1 - 0.3, [[3.55, 5.05], [D2_XO.door - 0.85, D2_XO.door + 0.85], [15.15, 16.65]], -1);
    d2rail(x1 - 0.06, z0 + 0.3, z1 - 0.3, [[7.2 - 0.85, 7.2 + 0.85], [12.0 - 0.85, 12.0 + 0.85]], 1);
    // doors along the corridor: first officer (port), two senior officers' cabins (starboard), the wardroom aft
    doorAt(x0, D2_XO.door, Math.PI / 2, 'FIRST OFFICER', 'xoq', true, true, DECK2, 2);
    doorAt(x1, 7.2, -Math.PI / 2, 'SENIOR OFFICER', 'so1q', true, true, DECK2, 2);
    doorAt(x1, 12.0, -Math.PI / 2, 'SENIOR OFFICER', 'so2q', true, true, DECK2, 2);
    doorAt(D2_WARD.door, z1, Math.PI, 'WARDROOM', 'wardoor', true, true, DECK2, 2);
    d2label('AFT · WARDROOM', x1 - 0.08, 2.0, 4.6, -Math.PI / 2, 0.9);
    d2label('PORT · OBSERVATION LOUNGE', x1 - 0.08, 2.0, 14.4, -Math.PI / 2, 1.2);
    // lined reveal for the open way through to the officers' passage
    [15.2, 16.6].forEach((z) => mesh(BOX(0.16, 2.35, 0.04), MAT.gun, x0, 1.175, z, DECK2)); mesh(BOX(0.16, 0.04, 1.44), MAT.gun, x0, 2.35, 15.9, DECK2);
  }

  // ---------- captain's quarters ----------
  {
    const Q = D2_QTR, H = D2H;
    d2room('Captain’s quarters', Q.x0, Q.x1, Q.z0, Q.z1, H, d2RoomWall, MAT.roomCarpet, {
      s: [{ a: Q.door - 0.6 - Q.x0, b: Q.door + 0.6 - Q.x0, y0: 0, y1: 2.3 }],
      n: [{ a: 5.2, b: 8.4, y0: 0.9, y1: 2.2 }],
    });
    doorAt(Q.door, Q.z1, 0, 'CAPTAIN', 'capq', true, true, DECK2, 2);
    const vp = group(-0.4, 0, Q.z0 + 0.06, Math.PI, DECK2); viewport(vp, -1.6, 1.6, 0.9, 2.2, 0);
    // sleeping cabin behind a partition, forward and to port
    const PZ = -1.6, PX = -2.4;
    [[[Q.x0, PZ + 0.06], [-4.2, PZ + 0.06], [0, 1]], [[Q.x0, PZ - 0.06], [-4.2, PZ - 0.06], [0, -1]], [[PX + 0.06, Q.z0], [PX + 0.06, PZ], [1, 0]], [[PX - 0.06, Q.z0], [PX - 0.06, PZ], [-1, 0]]].forEach(([A, B, n]) => wallPiece(d2RoomWall, A, [Math.sign(B[0] - A[0]), Math.sign(B[1] - A[1])], n, 0, Math.hypot(B[0] - A[0], B[1] - A[1]), 0, H, H, 1.2, DECK2));
    d2seg(Q.x0, PZ, -4.2, PZ, 0.2); d2seg(PX, Q.z0, PX, PZ, 0.2);
    mesh(RBOX(0.14, H, 0.14, 0.02), MAT.gunDark, -4.2, H / 2, PZ, DECK2); mesh(RBOX(0.14, H, 0.14, 0.02), MAT.gunDark, PX, H / 2, PZ, DECK2);
    { // bed, headboard against the port wall
      const g = group(Q.x0 + 1.15, 0, -3.4, 0, DECK2);
      mesh(RBOX(2.1, 0.32, 1.7, 0.04), WOOD, 0, 0.18, 0, g);
      mesh(RBOX(2.0, 0.2, 1.6, 0.06), CERAMIC, 0, 0.42, 0, g);
      mesh(RBOX(1.3, 0.06, 1.64, 0.03), FABRIC, 0.32, 0.54, 0, g);
      [-0.4, 0.4].forEach((z) => mesh(RBOX(0.38, 0.12, 0.58, 0.05), CERAMIC, -0.78, 0.56, z, g));
      mesh(RBOX(0.1, 1.1, 1.9, 0.03), MAT.leatherDark, -1.08, 0.75, 0, g);
      [-1.15, 1.15].forEach((z) => { mesh(RBOX(0.45, 0.5, 0.42, 0.03), WOOD, -0.82, 0.25, z, g); const l = mesh(lathe([[0, 0], [0.09, 0], [0.06, 0.22], [0.11, 0.3], [0, 0.3]], 20), BRASS, -0.82, 0.5, z, g); });
      d2obs(Q.x0 + 1.15, -3.0, 0.75); d2obs(Q.x0 + 1.15, -3.8, 0.75); d2obs(Q.x0 + 0.4, -2.2, 0.3); d2obs(Q.x0 + 0.4, -4.6, 0.3);
      const w = mesh(RBOX(1.2, 2.1, 0.6, 0.03), WOOD, -3.3, 1.05, Q.z0 + 0.32, DECK2); d2obs(-3.3, Q.z0 + 0.3, 0.45);
      d2down(Q.x0 + 2.0, -3.4, H); d2down(-3.6, -2.6, H);
    }
    { // sitting area facing the viewport: sofa, low table, cabinet under the window, a rug
      const sx = -0.4, sz = -2.4, g = group(sx, 0, sz, 0, DECK2);
      mesh(RBOX(2.3, 0.4, 0.9, 0.05), FABRIC, 0, 0.22, 0, g);
      mesh(RBOX(2.3, 0.5, 0.22, 0.06), FABRIC, 0, 0.62, 0.36, g);
      [-1.12, 1.12].forEach((x) => mesh(RBOX(0.2, 0.6, 0.9, 0.05), FABRIC, x, 0.32, 0, g));
      [-0.65, 0, 0.65].forEach((x) => mesh(RBOX(0.68, 0.12, 0.7, 0.05), FABRIC, x, 0.46, -0.06, g));
      mesh(RBOX(2.3, 0.06, 0.9, 0.02), MAT.gunDark, 0, 0.03, 0, g);
      [-0.8, 0, 0.8].forEach((x) => d2obs(sx + x, sz, 0.5));
      const t = group(sx, 0, sz - 1.15, 0, DECK2); mesh(RBOX(1.3, 0.05, 0.62, 0.02), WOOD, 0, 0.42, 0, t); [-0.55, 0.55].forEach((x) => mesh(RBOX(0.06, 0.4, 0.5, 0.01), MAT.steel, x, 0.2, 0, t));
      mesh(lathe([[0, 0], [0.12, 0], [0.12, 0.02], [0.03, 0.05], [0, 0.05]], 20), CERAMIC, 0.3, 0.45, 0, t);
      d2obs(sx, sz - 1.15, 0.6);
      mesh(RBOX(3.4, 0.55, 0.42, 0.03), WOOD, -0.4, 0.28, Q.z0 + 0.25, DECK2); d2seg(-2.1, Q.z0 + 0.5, 1.3, Q.z0 + 0.5, 0.25);
      const c = cnv(512, 384), x = c.getContext('2d'); x.fillStyle = '#3a2f2a'; x.fillRect(0, 0, 512, 384); noise(x, 512, 384, 9000, 0.05, 88);
      x.strokeStyle = 'rgba(217,176,126,0.7)'; x.lineWidth = 7; x.strokeRect(18, 18, 476, 348); x.lineWidth = 2; x.strokeRect(36, 36, 440, 312);
      const rug = mesh(new THREE.PlaneGeometry(3.2, 2.4), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.97, polygonOffset: true, polygonOffsetFactor: -1 }), sx, 0.005, sz - 0.9, DECK2); rug.rotation.x = -Math.PI / 2;
      d2down(sx, sz - 0.9, H); d2down(sx + 1.4, sz - 0.4, H); d2down(sx - 1.4, sz - 0.4, H);
    }
    { // dining table for four, aft and to port
      const tx = -5.2, tz = 1.0;
      mesh(CYL(0.66, 0.66, 0.05, 40), WOOD, tx, 0.74, tz, DECK2); mesh(CYL(0.08, 0.12, 0.7, 16), MAT.steel, tx, 0.36, tz, DECK2); mesh(CYL(0.36, 0.4, 0.03, 30), MAT.steel, tx, 0.015, tz, DECK2);
      [0, 1, 2, 3].forEach((i) => { const a = i * Math.PI / 2 + Math.PI / 4; d2chair(tx + Math.sin(a) * 0.95, tz + Math.cos(a) * 0.95, a, MAT.leather); });
      d2obs(tx, tz, 1.05);
      mesh(lathe([[0, 0], [0.05, 0], [0.04, 0.2], [0.09, 0.3], [0.02, 0.42], [0, 0.42]], 20), BRASS, tx, 0.765, tz, DECK2);
      const pl = mesh(new THREE.CircleGeometry(0.5, 32), lightDiscMat, tx, H - 0.006, tz, DECK2); pl.rotation.x = Math.PI / 2;
      mesh(new THREE.TorusGeometry(0.51, 0.02, 8, 40), MAT.steel, tx, H - 0.01, tz, DECK2).rotation.x = Math.PI / 2;
      // shelves on the port wall: books, a ship model, a few keepsakes
      const sg = group(Q.x0 + 0.2, 0, -0.55, Math.PI / 2, DECK2);
      mesh(RBOX(1.6, 2.0, 0.36, 0.02), WOOD, 0, 1.0, -0.02, sg);
      const rr = mulberry(717); [0.45, 0.95, 1.45].forEach((y) => { mesh(BOX(1.5, 0.025, 0.32), MAT.gunDark, 0, y, 0.02, sg); let x = -0.7; while (x < 0.6) { const w = 0.03 + rr() * 0.05, h = 0.2 + rr() * 0.12; mesh(BOX(w, h, 0.22), [MAT.leather, MAT.leatherDark, FABRIC, POT][(rr() * 4) | 0], x + w / 2, y + 0.013 + h / 2, 0.02, sg); x += w + 0.008; if (rr() < 0.12) x += 0.18; } });
      mesh(BOX(0.4, 0.06, 0.12), BRASS, 0.3, 1.98, 0.02, sg);
      d2obs(Q.x0 + 0.22, -0.55, 0.45); d2obs(Q.x0 + 0.22, 0.1, 0.3); d2obs(Q.x0 + 0.22, -1.2, 0.3);
      d2down(tx - 0.2, tz + 1.2, H);
    }
    { // desk on the starboard wall, with the captain's personal screen
      const dx = Q.x1 - 0.45, dz = 0.0, g = group(dx, 0, dz, -Math.PI / 2, DECK2);
      d2desk(g, 1.6, 0.75, 'qdesk', 'log', 'Personal log', 'CO·01');
      const sg = group(0, 1.5, -0.34, 0, g); display(sg, 1.1, 0.62, 640, 360, 'log', 'qdesk', 'Personal log', 'CO·01');
      d2chair(dx - 0.85, dz, -Math.PI / 2, MAT.leatherDark, 'station');
      d2obs(dx, dz - 0.5, 0.42); d2obs(dx, dz + 0.5, 0.42);
      d2down(dx - 0.4, dz, H);
    }
    { // galley alcove beside the door: a counter and the food synthesizer
      const gx = 0.4, gz = Q.z1 - 0.32;
      mesh(RBOX(1.8, 0.9, 0.58, 0.02), MAT_PED, gx, 0.45, gz, DECK2); mesh(RBOX(1.86, 0.04, 0.64, 0.01), CERAMIC, gx, 0.92, gz, DECK2);
      const n = group(gx + 0.35, 1.42, gz + 0.22, Math.PI, DECK2);
      mesh(RBOX(0.62, 0.72, 0.14, 0.03), MAT.gunDark, 0, 0, 0.04, n);
      mesh(new THREE.PlaneGeometry(0.5, 0.56), new THREE.MeshBasicMaterial({ color: 0x4a3c5a, toneMapped: false }), 0, 0, -0.035, n);
      const sc = group(-0.55, 0, -0.02, 0, n); display(sc, 0.36, 0.5, 220, 300, 'aux', 'qgalley', 'Galley', 'GAL·01');
      addHit(BOX(1.4, 1.0, 0.6), { station: 'qgalley' }, n, -0.2, 0, -0.2);
      d2seg(gx - 0.9, gz - 0.3, gx + 0.9, gz - 0.3, 0.3);
      d2plant(Q.x1 - 0.45, -3.8, 1.0);
      d2down(gx, gz - 0.8, H); d2down(-2.6, 1.9, H);
    }
  }

  // ---------- senior officers' cabins ----------
  // One layout built twice: cabin 2 is cabin 1 mirrored about z 9.6. u runs from the cabin's far end toward its near end.
  function d2cabin(n, z0, z1, doorZ, mirror, seed) {
    const { x0, x1 } = D2_SO, H = D2H, Z = (u) => mirror ? z1 - u : z0 + u, f = mirror ? -1 : 1, id = 'so' + n;
    d2room('Senior officers’ cabin ' + n, x0, x1, z0, z1, H, d2RoomWall, MAT.roomCarpet, {
      w: [{ a: doorZ - 0.6 - z0, b: doorZ + 0.6 - z0, y0: 0, y1: 2.3 }],
      e: [{ a: Math.min(Z(2.5), Z(4.7)) - z0, b: Math.max(Z(2.5), Z(4.7)) - z0, y0: 0.9, y1: 2.2 }],
    });
    const vp = group(x1 - 0.06, 0, Z(3.6), Math.PI / 2, DECK2); viewport(vp, -1.1, 1.1, 0.9, 2.2, 0);
    const rr = mulberry(seed), pick = (a) => a[(rr() * a.length) | 0];
    // bed along the starboard side, headboard to the far wall, one bedside table inboard
    d2bed(DECK2, 5.2, Z(1.15), -f * Math.PI / 2, 1.3, [f]);
    d2obs(5.2, Z(0.7), 0.62); d2obs(5.2, Z(1.6), 0.62); d2obs(4.23, Z(0.33), 0.28);
    // wardrobe in the far inboard corner
    mesh(RBOX(0.6, 2.1, 1.2, 0.03), WOOD, x0 + 0.38, 1.05, Z(0.72), DECK2); mesh(BOX(0.012, 1.8, 0.012), MAT.steel, x0 + 0.685, 1.05, Z(0.72), DECK2); d2obs(x0 + 0.38, Z(0.72), 0.55);
    // desk on the inboard wall, the officer facing it
    { const g = group(x0 + 0.46, 0, Z(2.6), Math.PI / 2, DECK2); d2desk(g, 1.3, 0.7, id + 'desk', 'cabin', 'Senior officer', 'SO·0' + n);
      d2chair(x0 + 1.2, Z(2.6), Math.PI / 2, MAT.leatherDark, 'station'); d2obs(x0 + 0.46, Z(2.25), 0.38); d2obs(x0 + 0.46, Z(2.95), 0.38); }
    // armchair by the viewport with a side table
    { d2chair(5.35, Z(3.7), -Math.PI / 2 + f * 0.5, pick([MAT.leather, FABRIC])); d2obs(5.35, Z(3.7), 0.3);
      const t = Z(4.45); mesh(CYL(0.24, 0.24, 0.04, 28), WOOD, 5.6, 0.55, t, DECK2); mesh(CYL(0.04, 0.06, 0.53, 12), MAT.steel, 5.6, 0.27, t, DECK2); d2obs(5.6, t, 0.26);
      mesh(lathe(pick([[[0, 0], [0.05, 0], [0.04, 0.16], [0.07, 0.24], [0, 0.26]], [[0, 0], [0.06, 0], [0.065, 0.09], [0, 0.09]]]), 18), pick([GLASS, CERAMIC, BRASS]), 5.6, 0.57, t, DECK2); }
    // galley counter and synthesizer on the near wall
    { const zn = Z(6.8) - f * 0.06; mesh(RBOX(1.4, 0.9, 0.52, 0.02), MAT_PED, 4.7, 0.45, zn - f * 0.28, DECK2); mesh(RBOX(1.46, 0.04, 0.56, 0.01), CERAMIC, 4.7, 0.92, zn - f * 0.28, DECK2);
      d2synth(DECK2, 4.45, 1.42, zn - f * 0.04, mirror ? 0 : Math.PI, id + 'galley', 'Galley', 'GAL·0' + (2 + n)); d2seg(4.0, zn - f * 0.56, 5.4, zn - f * 0.56, 0.3); }
    d2shelf(DECK2, x1 - 0.22, Z(5.9), -Math.PI / 2, seed + 5); d2obs(x1 - 0.22, Z(5.9), 0.4);
    d2rug(4.5, Z(3.7), 2.0, 2.4, pick(['#2c3340', '#3a2f2a', '#2a3329']), pick(['rgba(201,182,140,0.7)', 'rgba(182,147,196,0.55)', 'rgba(217,176,126,0.6)']), seed);
    d2plant(x0 + 0.45, Z(6.3), 0.85);
    d2down(4.6, Z(1.1), H); d2down(4.3, Z(3.6), H); d2down(4.3, Z(5.8), H);
  }
  d2cabin(1, 2.8, 9.6, 7.2, false, 211);
  d2cabin(2, 9.6, 16.4, 12.0, true, 457);

  // ---------- first officer's quarters ----------
  // The captain's quarters, smaller. It starts aft of the Lift 1 shaft (x -3.42..-1.82, z 6.2..8.47 on every deck):
  // day cabin forward with the port viewport, sleeping cabin aft behind a partition.
  {
    const Q = D2_XO, H = D2H, PZ = 12.6;
    d2room('First officer’s quarters', Q.x0, Q.x1, Q.z0, Q.z1, H, d2RoomWall, MAT.roomCarpet, {
      e: [{ a: Q.door - 0.6 - Q.z0, b: Q.door + 0.6 - Q.z0, y0: 0, y1: 2.3 }],
      w: [{ a: 0.8, b: 3.2, y0: 0.9, y1: 2.2 }],
    });
    const vp = group(Q.x0 + 0.06, 0, Q.z0 + 2.0, -Math.PI / 2, DECK2); viewport(vp, -1.2, 1.2, 0.9, 2.2, 0);
    d2partX(PZ, Q.x0 + 0.06, Q.x1 - 0.06, -2.7, -1.7, H);
    { // sitting area facing the viewport: sofa, low table, rug
      const sx = -3.2, sz = Q.z0 + 2.0, g = group(sx, 0, sz, Math.PI / 2, DECK2);
      mesh(RBOX(2.0, 0.4, 0.86, 0.05), FABRIC, 0, 0.22, 0, g);
      mesh(RBOX(2.0, 0.5, 0.22, 0.06), FABRIC, 0, 0.62, 0.34, g);
      [-0.98, 0.98].forEach((x) => mesh(RBOX(0.2, 0.6, 0.86, 0.05), FABRIC, x, 0.32, 0, g));
      [-0.45, 0.45].forEach((x) => mesh(RBOX(0.88, 0.12, 0.66, 0.05), FABRIC, x, 0.46, -0.06, g));
      mesh(RBOX(2.0, 0.06, 0.86, 0.02), MAT.gunDark, 0, 0.03, 0, g);
      [-0.6, 0.6].forEach((z) => d2obs(sx, sz + z, 0.48));
      const t = group(sx - 1.05, 0, sz, Math.PI / 2, DECK2); mesh(RBOX(1.1, 0.05, 0.52, 0.02), WOOD, 0, 0.42, 0, t); [-0.45, 0.45].forEach((x) => mesh(RBOX(0.06, 0.4, 0.42, 0.01), MAT.steel, x, 0.2, 0, t));
      mesh(lathe([[0, 0], [0.05, 0], [0.04, 0.16], [0.07, 0.24], [0, 0.26]], 18), GLASS, -0.25, 0.445, 0.05, t);
      d2obs(sx - 1.05, sz - 0.35, 0.33); d2obs(sx - 1.05, sz + 0.35, 0.33);
      d2rug(sx - 0.75, sz, 2.4, 2.8, '#2c3340', 'rgba(201,182,140,0.7)', 91);
      d2down(sx - 0.75, sz - 0.9, H); d2down(sx - 0.75, sz + 0.9, H);
      d2plant(Q.x0 + 0.42, PZ - 0.35, 0.9);
      // a framed print of a ringed planet on the forward wall, above the sofa's end
      const c = cnv(384, 256), x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#101826'); gr.addColorStop(1, '#2a2233'); x.fillStyle = gr; x.fillRect(0, 0, 384, 256);
      x.fillStyle = '#c9a477'; x.beginPath(); x.arc(200, 130, 62, 0, Math.PI * 2); x.fill(); x.strokeStyle = 'rgba(230,205,160,0.8)'; x.lineWidth = 5; x.beginPath(); x.ellipse(200, 132, 120, 22, -0.25, 0, Math.PI * 2); x.stroke();
      const rs = mulberry(77); for (let i = 0; i < 60; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.3 + rs() * 0.6) + ')'; x.fillRect(rs() * 384, rs() * 256, 1.5, 1.5); }
      mesh(RBOX(0.86, 0.6, 0.03, 0.01), WOOD, -3.3, 1.6, Q.z0 + 0.075, DECK2);
      mesh(new THREE.PlaneGeometry(0.76, 0.5), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.5 }), -3.3, 1.6, Q.z0 + 0.092, DECK2);
    }
    { // desk on the starboard wall aft of the door, the officer facing the wall
      const dx = Q.x1 - 0.46, dz = 11.35, g = group(dx, 0, dz, -Math.PI / 2, DECK2);
      d2desk(g, 1.5, 0.72, 'xodesk', 'xo', 'First officer', 'XO·01');
      d2chair(dx - 0.8, dz, -Math.PI / 2, MAT.leatherDark, 'station'); d2obs(dx - 0.8, dz, 0.26);
      d2obs(dx, dz - 0.45, 0.4); d2obs(dx, dz + 0.45, 0.4);
      d2down(dx - 0.5, dz, H);
    }
    { // galley counter on the forward wall, beside the door
      const gx = -1.05, gz = Q.z0 + 0.34;
      mesh(RBOX(1.3, 0.9, 0.56, 0.02), MAT_PED, gx, 0.45, gz, DECK2); mesh(RBOX(1.36, 0.04, 0.62, 0.01), CERAMIC, gx, 0.92, gz, DECK2);
      d2synth(DECK2, gx - 0.2, 1.42, Q.z0 + 0.1, 0, 'xogalley', 'Galley', 'GAL·02');
      d2seg(gx - 0.65, gz + 0.3, gx + 0.65, gz + 0.3, 0.3);
      d2down(gx, gz + 0.9, H);
    }
    { // sleeping cabin: bed to the port wall, one bedside table, wardrobe aft, shelves on the partition
      d2bed(DECK2, Q.x0 + 1.15, 13.8, 0, 1.2, [1]);
      d2obs(Q.x0 + 0.8, 13.8, 0.6); d2obs(Q.x0 + 1.6, 13.8, 0.6); d2obs(Q.x0 + 0.33, 14.72, 0.28);
      mesh(RBOX(1.2, 2.1, 0.6, 0.03), WOOD, -0.75, 1.05, Q.z1 - 0.36, DECK2); mesh(BOX(0.012, 1.8, 0.012), MAT.steel, -0.75, 1.05, Q.z1 - 0.055, DECK2); d2obs(-0.75, Q.z1 - 0.36, 0.5);
      d2shelf(DECK2, -0.85, PZ + 0.25, 0, 533); d2obs(-0.85, PZ + 0.25, 0.4);
      d2down(Q.x0 + 1.4, 13.8, H); d2down(-1.4, 13.8, H);
    }
  }

  // ---------- officers' wardroom ----------
  {
    const W2 = D2_WARD, H = D2H, cx = 1.3, cz = 20.9;
    d2room('Officers’ wardroom', W2.x0, W2.x1, W2.z0, W2.z1, H, d2RoomWall, MAT.roomCarpet, {
      n: [{ a: W2.door - 0.6 - W2.x0, b: W2.door + 0.6 - W2.x0, y0: 0, y1: 2.3 }],
      e: [{ a: 1.5, b: 6.0, y0: 0.95, y1: 2.25 }],
      s: [{ a: W2.aft - 1.0 - W2.x0, b: W2.aft + 1.0 - W2.x0, y0: 0, y1: 2.3 }],
    });
    // wide double doors aft into the observation lounge: dinner here, drinks and the view next door
    doorAt(W2.aft, W2.z1, Math.PI, 'OBSERVATION LOUNGE', 'wlink', true, true, DECK2, 2, 2.0);
    const vp = group(W2.x1 - 0.06, 0, 20.75, Math.PI / 2, DECK2); viewport(vp, -2.25, 2.25, 0.95, 2.25, 0);
    // the long table for ten, on two pedestals
    const t = group(cx, 0, cz, 0, DECK2);
    mesh(RBOX(5.0, 0.06, 1.4, 0.03), WOOD, 0, 0.75, 0, t);
    mesh(RBOX(4.8, 0.03, 1.2, 0.01), MAT.leatherDark, 0, 0.79, 0, t);
    [-1.6, 1.6].forEach((x) => { mesh(RBOX(0.3, 0.7, 0.8, 0.03), MAT_PED, x, 0.36, 0, t); mesh(RBOX(0.9, 0.04, 0.9, 0.02), MAT.gunDark, x, 0.02, 0, t); });
    [-1.8, -0.6, 0.6, 1.8].forEach((x) => { d2chair(cx + x, cz - 1.05, 0, MAT.leather); d2chair(cx + x, cz + 1.05, Math.PI, MAT.leather); });
    d2chair(cx - 2.9, cz, -Math.PI / 2, MAT.leather); d2chair(cx + 2.9, cz, Math.PI / 2, MAT.leather);
    [-1.9, -0.6, 0.6, 1.9].forEach((x) => d2obs(cx + x, cz, 0.95)); d2obs(cx - 2.9, cz, 0.35); d2obs(cx + 2.9, cz, 0.35);
    [-1.5, 0, 1.5].forEach((x) => { mesh(lathe([[0, 0], [0.04, 0], [0.035, 0.12], [0.06, 0.2], [0, 0.22]], 16), CERAMIC, cx + x, 0.8, cz, DECK2); });
    // light: two long panels over the table, downlights round the edge
    [-1.25, 1.25].forEach((x) => d2panel(cx + x, cz, H, 2.0, 0.5));
    [[W2.x0 + 1.0, 18.2], [W2.x0 + 1.0, 23.4], [W2.x1 - 1.0, 18.2], [W2.x1 - 1.0, 23.4], [cx, 18.0], [cx, 23.8]].forEach(([x, z]) => d2down(x, z, H));
    // a sideboard either side of the lounge doors; the ship's crest over the port one, a painting over the starboard one
    const SB = [W2.aft - 2.2, W2.aft + 2.2];
    SB.forEach((sx) => { mesh(RBOX(1.8, 0.9, 0.5, 0.03), WOOD, sx, 0.45, W2.z1 - 0.3, DECK2); mesh(RBOX(1.86, 0.04, 0.54, 0.01), MAT.gunDark, sx, 0.92, W2.z1 - 0.3, DECK2);
      d2seg(sx - 0.9, W2.z1 - 0.55, sx + 0.9, W2.z1 - 0.55, 0.3); });
    [[SB[0] - 0.5, 0], [SB[0] - 0.2, 0], [SB[1] + 0.45, 1]].forEach(([x, i]) => mesh(lathe(i ? [[0, 0], [0.07, 0], [0.08, 0.12], [0.03, 0.28], [0.03, 0.34], [0, 0.34]] : [[0, 0], [0.04, 0], [0.045, 0.1], [0, 0.1]], 18), i ? GLASS : CERAMIC, x, 0.94, W2.z1 - 0.3, DECK2));
    { const c = cnv(640, 400), x = c.getContext('2d'), rr = mulberry(733); // an original painting: a ringed planet over a nebula
      const gr = x.createLinearGradient(0, 0, 640, 400); gr.addColorStop(0, '#141b2e'); gr.addColorStop(0.55, '#2c2442'); gr.addColorStop(1, '#5a3a3a'); x.fillStyle = gr; x.fillRect(0, 0, 640, 400);
      for (let i = 0; i < 9; i++) { const g2 = x.createRadialGradient(rr() * 640, rr() * 400, 0, 320, 200, 260); g2.addColorStop(0, 'rgba(232,160,106,0.10)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g2; x.fillRect(0, 0, 640, 400); }
      for (let i = 0; i < 220; i++) { x.fillStyle = `rgba(255,245,230,${0.3 + rr() * 0.7})`; x.fillRect(rr() * 640, rr() * 400, rr() < 0.1 ? 2 : 1, rr() < 0.1 ? 2 : 1); }
      const pg = x.createRadialGradient(400, 230, 10, 430, 250, 110); pg.addColorStop(0, '#e7c9a0'); pg.addColorStop(0.7, '#9a6f4c'); pg.addColorStop(1, '#3a2a22'); x.fillStyle = pg; x.beginPath(); x.arc(430, 250, 100, 0, Math.PI * 2); x.fill();
      x.strokeStyle = 'rgba(240,220,190,0.55)'; x.lineWidth = 5; x.beginPath(); x.ellipse(430, 250, 175, 34, -0.25, 0, Math.PI * 2); x.stroke();
      const f = mesh(RBOX(1.32, 0.86, 0.05, 0.01), MAT.gunDark, SB[1], 1.75, W2.z1 - 0.085, DECK2);
      const m = mesh(new THREE.PlaneGeometry(1.2, 0.75), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.6 }), SB[1], 1.75, W2.z1 - 0.115, DECK2); m.rotation.y = Math.PI; }
    { const c = cnv(512, 512), x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#8a6a44'); gr.addColorStop(1, '#5e462c'); x.fillStyle = gr; x.fillRect(0, 0, 512, 512);
      x.strokeStyle = 'rgba(255,230,190,0.6)'; x.lineWidth = 6; x.strokeRect(18, 18, 476, 476); drawCrest(x, 256, 210, 130, '#f3dcb4', 8);
      x.fillStyle = '#f7e6c8'; x.textAlign = 'center'; x.font = `600 40px ${DISP}`; x.fillText('U.S.S. DEFIANCE', 256, 400); x.font = `500 26px ${DISP}`; x.fillText('STEADY UNDER FIRE', 256, 446);
      const m = mesh(new THREE.PlaneGeometry(0.95, 0.95), new THREE.MeshStandardMaterial({ map: tex(c), metalness: 0.7, roughness: 0.35 }), SB[0], 1.78, W2.z1 - 0.08, DECK2); m.rotation.y = Math.PI; }
    // wall screen on the port side: the mess board
    const sg = group(W2.x0 + 0.1, 1.5, cz, Math.PI / 2, DECK2); display(sg, 1.5, 0.84, 720, 404, 'mess', 'wardroom', 'Wardroom', 'WRD·01');
    d2plant(W2.x0 + 0.5, W2.z1 - 0.5, 1.1); d2plant(W2.x1 - 0.5, W2.z1 - 0.5, 1.1);
  }

  function d2frames(x0, x1, z0, z1, H) { return kitFrames(D2, x0, x1, z0, z1, H); }
  {
    const P = D2_PAS, H = D2C, op = [{ a: 0.12, b: 1.88, y0: 0, y1: 2.35 }];
    d2room('Officers’ passage', P.ax1, 0.2, P.z0, P.z1, H, d2CorrWall, MAT.floorCarpet, { e: [{ a: 0.2, b: 1.6, y0: 0, y1: 2.35 }], w: op });
    d2room('Officers’ passage', P.ax0, P.ax1, P.z0, P.az1, H, d2CorrWall, MAT.floorCarpet, {
      e: op, w: [{ a: P.cap - 0.6 - P.z0, b: P.cap + 0.6 - P.z0, y0: 0, y1: 2.3 }],
      s: [{ a: D2_LNG.door - 0.6 - P.ax0, b: D2_LNG.door + 0.6 - P.ax0, y0: 0, y1: 2.3 }],
    });
    [P.z0 + 0.12, P.z1 - 0.12].forEach((z) => mesh(BOX(0.16, 2.35, 0.04), MAT.gun, P.ax1, 1.175, z, DECK2)); mesh(BOX(0.16, 0.04, 1.8), MAT.gun, P.ax1, 2.35, (P.z0 + P.z1) / 2, DECK2);
    d2panel((P.ax1 + 0.2) / 2, (P.z0 + P.z1) / 2, H, 0.9, 0.36);
    d2frames(P.ax0, P.ax1, P.z1, P.az1, H);
    d2rail(P.ax1 - 0.06, P.z1 + 0.3, P.az1 - 0.3, [], 1);
    d2label('AFT · OBSERVATION LOUNGE', P.ax0 + 0.08, 2.0, 16.0, Math.PI / 2, 1.2);
    doorAt(P.ax0, P.cap, Math.PI / 2, 'POD CAPACITORS', 'capbank', false, true, DECK2, 2);
    doorAt(D2_LNG.door, P.az1, Math.PI, 'OBSERVATION LOUNGE', 'lngdoor', true, true, DECK2, 2);
  }
  {
    const L = D2_LNG, H = D2H, cx = (L.x0 + L.x1) / 2, WY0 = 0.75, WY1 = 2.35;
    d2room('Observation lounge', L.x0, L.x1, L.z0, L.z1, H, d2RoomWall, MAT.roomCarpet, {
      n: [{ a: L.door - 0.6 - L.x0, b: L.door + 0.6 - L.x0, y0: 0, y1: 2.3 }, { a: D2_WARD.aft - 1.0 - L.x0, b: D2_WARD.aft + 1.0 - L.x0, y0: 0, y1: 2.3 }],
      s: [{ a: 0.6, b: 10.6, y0: WY0, y1: WY1 }],
    });
    d2label('WARDROOM', D2_WARD.aft, 2.41, L.z0 + 0.225, 0, 0.9); // under the cove shelf, proud of the doors' reveal
    const vp = group(cx, 0, L.z1 - 0.06, 0, DECK2); viewport(vp, -5.0, 5.0, WY0, WY1, 0);
    SHUTTERS[SHUTTERS.length - 1].hideOpen = true; // the lounge's shutters fold away completely when open, so nothing crosses the view
    // the sill ledge under the window, with swivel chairs facing out
    mesh(RBOX(9.8, 0.05, 0.42, 0.015), WOOD, cx, WY0 + 0.02, L.z1 - 0.32, DECK2);
    mesh(RBOX(9.8, WY0 - 0.05, 0.3, 0.02), MAT_PED, cx, (WY0 - 0.05) / 2, L.z1 - 0.22, DECK2);
    mesh(BOX(9.6, 0.016, 0.016), STRIP, cx, 0.06, L.z1 - 0.38, DECK2);
    d2seg(L.x0 + 0.4, L.z1 - 0.53, L.x1 - 0.4, L.z1 - 0.53, 0.3);
    [-4.0, -2.4, -0.8, 1.2, 2.8, 4.4].forEach((x) => { d2chair(x, L.z1 - 1.0, Math.PI, MAT.leather, 'station'); d2obs(x, L.z1 - 1.0, 0.26); });
    // small round tables, three chairs each
    [[-2.5, 27.5, 0.3], [1.1, 27.6, 1.1], [3.9, 27.6, 0.7]].forEach(([tx, tz, a0], i) => {
      mesh(CYL(0.42, 0.42, 0.045, 32), WOOD, tx, 0.72, tz, DECK2); mesh(CYL(0.05, 0.09, 0.68, 14), MAT.steel, tx, 0.35, tz, DECK2); mesh(CYL(0.26, 0.3, 0.03, 24), MAT.steel, tx, 0.015, tz, DECK2);
      d2obs(tx, tz, 0.46);
      [0, 1, 2].forEach((k) => { const a = a0 + k * Math.PI * 2 / 3, x = tx + Math.sin(a) * 0.78, z = tz + Math.cos(a) * 0.78; d2chair(x, z, a, [MAT.leather, FABRIC, MAT.leatherDark][i]); d2obs(x, z, 0.26); });
      mesh(lathe([[0, 0], [0.035, 0], [0.03, 0.1], [0.05, 0.17], [0, 0.19]], 16), i === 1 ? GLASS : CERAMIC, tx + 0.1, 0.745, tz - 0.05, DECK2);
      d2down(tx, tz, H);
    });
    // the bar on the starboard wall: counter, synthesizer, bottles, two swivel stools
    { const bx = L.x1 - 0.38, bz = 26.6;
      mesh(RBOX(0.6, 1.0, 2.6, 0.02), WOOD, bx, 0.5, bz, DECK2); mesh(RBOX(0.68, 0.05, 2.7, 0.015), MAT.gunDark, bx, 1.02, bz, DECK2);
      mesh(BOX(0.012, 0.012, 2.4), STRIP, bx - 0.31, 0.08, bz, DECK2);
      d2synth(DECK2, L.x1 - 0.1, 1.55, bz + 0.5, -Math.PI / 2, 'lgalley', 'Lounge bar', 'GAL·05');
      const rr = mulberry(808); for (let k = 0; k < 6; k++) mesh(lathe([[0, 0], [0.035, 0], [0.035, 0.18], [0.012, 0.24], [0.012, 0.3], [0, 0.3]], 14), k % 2 ? GLASS : BRASS, bx + (rr() - 0.5) * 0.2, 1.045, bz - 1.1 + k * 0.12, DECK2);
      d2seg(bx - 0.32, bz - 1.3, bx - 0.32, bz + 1.3, 0.3);
      [bz - 0.6, bz + 0.6].forEach((z) => { d2chair(bx - 0.85, z, -Math.PI / 2, MAT.leatherDark, 'station'); d2obs(bx - 0.85, z, 0.26); });
      d2down(bx - 0.4, bz, H); }
    // the wall screen on the forward wall, and the view it describes
    { const g = group(-1.75, 1.55, L.z0 + 0.1, 0, DECK2); display(g, 1.7, 0.95, 720, 402, 'lounge', 'lounge', 'Observation lounge', 'OBS·01'); }
    d2plant(L.x0 + 0.45, L.z1 - 1.2, 1.1);
    d2plant(L.x0 + 0.45, L.z0 + 1.6, 1.0);
    d2plant(3.3, L.z0 + 0.45, 1.0);
    [-3.6, -1.0, 1.6, 4.2].forEach((x) => d2down(x, L.z1 - 1.0, H)); d2down(-3.9, 25.4, H); d2down(-1.75, 25.3, H);
  }

  // ---------- outside: the ship herself, seen through Deck 2's windows ----------
  // The exterior model (exterior.js), built from the deck plan's SHIPGEO block: the saucer's back under the spine (its top
  // below every window sill), the rollbar and weapons pod aft of the lounge, a nacelle out to either side. It carries its own shader and light, so the bake ignores it (bake_export skips EXTSET). Phones get the
  // lighter build.
  EXTSET = buildExterior(extOpts()); EXTSET.name = 'Exterior'; DECK2.add(EXTSET);
  DECK2.updateMatrixWorld(true);
}

````

---

## `js/deck3.js`

````javascript
// USS Defiance · deck3.js
// Deck 3, medical and officers (roadmap B2): the corridors laid out from the deck's floor plan (SHIPGEO.plans[3],
// shipFloorPlan) with the corridor kit (kit.js): a ring round the saucer's centre, four spokes, the aft spoke running on
// as the fore-aft corridor; the Lift 1 lobby between sickbay and the medical lab. Every room is behind a closed,
// labelled door until its fit-out (sickbay is step D; cabins and offices come with the standard room kit, step C).
// Built when the lift first heads here (decks.js deckBuild). Until bake/d3 exists the deck gets the provisional light.
// Coordinates: world x = the plan's x (starboard +), world z = m - 64, y from the Deck 3 floor.
// Files share one global scope and load in order (see index.html).
'use strict';

const D3Y = deckY(3), D3C = STD.corridor.h;
const DECK3 = group(0, D3Y, 0, 0); DECK3.name = 'Deck 3';
const D3 = { root: DECK3, segs: [], obs: [], rooms: [], door: null, labels: [], rails: [], mods: [], doors: [] };
const d3xz = (m, x) => [x, m - 64]; // plan [m, x] to world [x, z]
// section colours (palette A): the ring tan, each spoke its own; the band along the walls and the signs carry them
const D3_BAND = { ring: '#D9B07E', 0: '#E8A06A', 90: '#F2C88F', 180: '#B693C4', 270: '#C67A86' };
const D3_LETTER = { 0: 'A', 90: 'S', 180: 'F', 270: 'P' };

// The corridor layout, worked out from the plan (no 3D objects, so checks can call it): modules (see kitCorridorBuild),
// room doors snapped to the centre of a module, wall lines for collision, end caps, lobby openings.
function d3Layout() {
  const F = shipFloorPlan(3), P = F.P, [cm, cx] = P.c, W = STD.corridor.w / 2, rad = Math.PI / 180, LEN = STD.frame;
  const mods = [], caps = [], N = 48, half = 180 / N, [Rr] = P.ring;
  const dc = Rr * Math.cos(half * rad), rlin = 2 * (dc - W) * Math.tan(half * rad), rlout = 2 * (dc + W) * Math.tan(half * rad);
  const spokeA = P.spokes.map(([a]) => a), near0 = (a, s) => Math.abs(((a - s + 540) % 360) - 180) < 1e-6;
  // the ring: N identical tapered pieces, a crossing wherever a spoke meets it
  for (let k = 0; k < N; k++) { const a = k * 360 / N, cross = spokeA.some((s) => near0(a, s)), [x, z] = d3xz(cm + dc * Math.cos(a * rad), cx + dc * Math.sin(a * rad));
    mods.push({ L: cross ? 'o' : 'w', R: cross ? 'o' : 'w', lin: rlin, lout: rlout, x, z, ry: (a - 90) * rad, ring: true, cross, full: !cross, a, k,
      band: D3_BAND.ring, leg: cross ? null : 'r' + Math.floor(a / 90), frame: 'R' + String(k).padStart(2, '0') }); }
  // the spokes, from the centre crossing out: one run inside the ring, one outside; openings onto corridor-like spaces
  // (the lobby) split a run; each piece is whole 2.4 m modules from its start, then a stretched filler
  // the crossing at the centre, where the four spokes meet
  { const [x, z] = d3xz(cm, cx); mods.push({ L: 'o', R: 'o', lin: 2 * W, lout: 2 * W, x, z, ry: 0, cross: true, full: false, centre: true }); }
  const lobbies = F.spaces.filter((s) => s.t === 'c');
  P.spokes.forEach(([a, end]) => {
    const u = [Math.sin(a * rad), Math.cos(a * rad)], ry = Math.atan2(u[0], u[1]), side = [u[1], -u[0]], [ox, oz] = d3xz(cm, cx);
    const at = (t, l) => [ox + u[0] * t + side[0] * l, oz + u[1] * t + side[1] * l];
    const local = (wx, wz) => { const dx = wx - ox, dz = wz - oz; return [dx * u[0] + dz * u[1], dx * side[0] + dz * side[1]]; };
    let fn = 0; const fr = () => D3_LETTER[a] + String(++fn).padStart(2, '0'), band = D3_BAND[a];
    [[W, dc - W], [dc + W, end]].forEach(([t0, t1], ri) => {
      const leg = (ri ? 'o' : 'i') + a;
      const cuts = [t0, t1], open = [];
      lobbies.forEach((s) => { const pts = s.poly.map(([m, x]) => local(...d3xz(m, x))); [-1, 1].forEach((sd) => {
        const on = pts.filter(([, l]) => Math.abs(l - sd * W) < 0.15); if (on.length < 2) return;
        const lo = Math.max(t0, Math.min(...on.map(([t]) => t))), hi = Math.min(t1, Math.max(...on.map(([t]) => t))); if (hi - lo > 0.5) { open.push([lo, hi, sd]); cuts.push(lo, hi); } }); });
      const cs = [...new Set(cuts.map((v) => +v.toFixed(4)))].sort((p, q) => p - q);
      for (let i = 0; i < cs.length - 1; i++) {
        const p0 = cs[i], p1 = cs[i + 1], o = open.find(([lo, hi]) => p0 >= lo - 1e-3 && p1 <= hi + 1e-3), L = o && o[2] < 0 ? 'o' : 'w', R = o && o[2] > 0 ? 'o' : 'w';
        const n = Math.floor((p1 - p0) / LEN + 1e-6), f = p1 - p0 - n * LEN;
        for (let j = 0; j < n; j++) { const t = p0 + LEN * (j + 0.5), [x, z] = at(t, 0); mods.push({ L, R, lin: LEN, lout: LEN, x, z, ry, sz: 1, full: true, spoke: a, t, band, leg, frame: fr() }); }
        if (f > 0.02) { const t = p1 - f / 2, [x, z] = at(t, 0); mods.push({ L, R, lin: LEN, lout: LEN, x, z, ry, sz: f / LEN, full: false, spoke: a, t, band, leg, frame: fr() }); }
      }
      if (ri === 1) { const [x0, z0] = at(end, -W), [x1, z1] = at(end, W); caps.push({ A: [x0, z0], B: [x1, z1], n: [-u[0], -u[1]], spoke: a }); }
    });
  });
  // module geometry in world terms: its axes, half-lengths of each edge
  mods.forEach((d) => { d.ax = [Math.cos(d.ry), -Math.sin(d.ry)]; d.az = [Math.sin(d.ry), Math.cos(d.ry)]; d.sz = d.sz || 1; });
  const toLocal = (d, wx, wz) => { const dx = wx - d.x, dz = wz - d.z; return [dx * d.ax[0] + dz * d.ax[1], dx * d.az[0] + dz * d.az[1]]; };
  const halfLen = (d, s) => (s < 0 ? d.lin : d.lout) * d.sz / 2;
  // room doors onto the corridor: each to the nearest whole module with a wall on that side, at its centre
  const doors = [];
  F.spaces.forEach((s) => {
    if (!s.door || s.t === 'c' || s.t === 'v' || s.n === 'Lift 1') return;
    const [wx, wz] = d3xz(...s.door); let best = null;
    mods.forEach((d) => { if (!d.full) return; const [lx, lz] = toLocal(d, wx, wz), sd = Math.sign(lx), k = sd < 0 ? d.L : d.R;
      if (Math.abs(Math.abs(lx) - W) > 0.4 || k !== 'w' || Math.abs(lz) > 3.6) return;
      if (!best || Math.abs(lz) < best.dz) best = { d, sd, dz: Math.abs(lz) }; });
    if (!best) { if (s.n !== 'Sickbay') console.warn('Deck 3: no corridor module for the door of', s.id || s.n); return; }
    const d = best.d; if (best.sd < 0) d.L = 'd'; else d.R = 'd';
    const px = d.x + d.ax[0] * best.sd * W, pz = d.z + d.ax[1] * best.sd * W, nrm = [-d.ax[0] * best.sd, -d.ax[1] * best.sd];
    doors.push({ s, x: px, z: pz, rot: Math.atan2(nrm[0], nrm[1]), moved: Math.hypot(px - wx, pz - wz), mod: d });
  });
  // collision: each walled side as a line (broken at a door), each end cap
  const segs = [];
  mods.forEach((d) => [[-1, d.L], [1, d.R]].forEach(([sd, k]) => {
    if (k === 'o') return; const h = halfLen(d, sd), P0 = (lz) => [d.x + d.ax[0] * sd * W + d.az[0] * lz, d.z + d.ax[1] * sd * W + d.az[1] * lz];
    (k === 'd' ? [[-h, -0.6], [0.6, h]] : [[-h, h]]).forEach(([a, b]) => segs.push([...P0(a), ...P0(b)])); }));
  caps.forEach((c) => segs.push([...c.A, ...c.B]));
  return { F, mods, doors, caps, segs, W, dc };
}

// the short name on a room's door
function d3DoorLabel(s) {
  const id = s.id ? s.id.slice(2) : '';
  return ({ 'Officers’ quarters': 'OFFICER · ' + id, 'Crew quarters': 'CREW · ' + id, 'Sickbay': 'SICKBAY', 'Medical lab and morgue': 'MEDICAL LAB',
    'Forward shield generator': 'SHIELD GEN', 'Computer core, upper': 'COMPUTER CORE', 'Damage control station': 'DAMAGE CONTROL',
    'Pod feeds and torpedo magazine': 'MAGAZINE', 'Lift 2': 'LIFT 2' })[s.n] || s.n.toUpperCase();
}

function buildDeck3() {
  const Lt = d3Layout(), corrWall = roomWallMat(D3C, 'fabric');
  // corridor pieces beside the magazines: their band turns hard red at red alert (d3Alert)
  { const F = shipFloorPlan(3), mags = F.spaces.filter((s) => s.n === 'Pod feeds and torpedo magazine').map((s) => s.poly.map((p) => p[0]));
    Lt.mods.forEach((d) => { const m = d.z + 64; d.mag = d.spoke === 0 && mags.some((ms) => m > Math.min(...ms) - 0.6 && m < Math.max(...ms) + 0.6); }); }
  D3.layout = Lt; D3.mods = kitCorridorBuild(D3, Lt.mods, corrWall);
  Lt.segs.forEach(([ax, az, bx, bz]) => kitSeg(D3, ax, az, bx, bz));
  // end caps
  Lt.caps.forEach((c) => { const len = Math.hypot(c.B[0] - c.A[0], c.B[1] - c.A[1]), dir = [(c.B[0] - c.A[0]) / len, (c.B[1] - c.A[1]) / len];
    wallPiece(corrWall, c.A, dir, c.n, 0, len, 0, D3C, D3C, 1.2, DECK3); });

  // ---------- the Lift 1 lobby, open onto the aft spoke ----------
  const lob = Lt.F.spaces.find((s) => s.n === 'Lift 1 lobby'), xs = lob.poly.map(([, x]) => x), ms = lob.poly.map(([m]) => m);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...ms) - 64, z1 = Math.max(...ms) - 64, H = D3C, I = STD.inset;
  {
    const fw = x1 - x0, fd = z1 - z0, fg = new THREE.PlaneGeometry(fw, fd); { const uv = fg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * fw, uv.getY(i) * fd); }
    mesh(fg, MAT.floorCarpet, (x0 + x1) / 2, 0.002, (z0 + z1) / 2, DECK3).rotation.x = -Math.PI / 2;
    mesh(fg.clone(), MAT.ceiling, (x0 + x1) / 2, H, (z0 + z1) / 2, DECK3).rotation.x = Math.PI / 2;
    const sb = Lt.F.spaces.find((s) => s.n === 'Sickbay'), sbx = sb.door[1];
    kitWall(D3, corrWall, [x0 + I, z0 + I], [x1, z0 + I], [0, 1], H, [{ a: sbx - 0.6 - x0 - I, b: sbx + 0.6 - x0 - I, y0: 0, y1: 2.3 }]);
    kitWall(D3, corrWall, [x0 + I, z1 - I], [x1, z1 - I], [0, -1], H, [{ a: LIFT_DX - 0.6 - x0 - I, b: LIFT_DX + 0.6 - x0 - I, y0: 0, y1: 2.3 }]);
    kitWall(D3, corrWall, [x0 + I, z0 + I], [x0 + I, z1 - I], [1, 0], H);
    [[(x0 + x1) / 2, z0 + 0.13, fw - 0.2, 0], [(x0 + x1) / 2, z1 - 0.13, fw - 0.2, 0], [x0 + 0.13, (z0 + z1) / 2, fd - 0.3, Math.PI / 2]].forEach(([x, z, L, ry]) => {
      mesh(BOX(L, 0.03, 0.03), SLOT, x, H - 0.28, z, DECK3).rotation.y = ry; mesh(RBOX(L + 0.1, 0.08, 0.12, 0.015), MAT.gunDark, x, H - 0.23, z, DECK3).rotation.y = ry;
      mesh(BOX(L - 0.2, 0.02, 0.02), STRIP, x, 0.06, z, DECK3).rotation.y = ry; });
    D3.rooms.push({ label: 'Lift 1 lobby', x0, x1: x1 + STD.corridor.w, z0, z1 });
    // the lift doors on this deck (lift.js opens them with the car's), as on Deck 2
    const g = group(LIFT_DX, 0, z1, Math.PI, DECK3);
    [-1, 1].forEach((sd) => mesh(RBOX(0.22, 2.6, 0.3, 0.03), MAT.gun, sd * 0.71, 1.3, 0.12, g));
    mesh(RBOX(1.64, 0.3, 0.3, 0.03), MAT.gun, 0, 2.45, 0.12, g); mesh(BOX(1.2, 0.004, 0.1), MAT.hazard, 0, 0.003, 0.16, g);
    const L = mesh(RBOX(0.6, 2.3, 0.06, 0.015), MAT.panel, -0.3, 1.15, 0.06, g), Rr = mesh(RBOX(0.6, 2.3, 0.06, 0.015), MAT.panel, 0.3, 1.15, 0.06, g);
    [L, Rr].forEach((d, k) => { mesh(BOX(0.02, 1.9, 0.02), SLOT, k ? -0.27 : 0.27, 0, 0.04, d); mesh(BOX(0.4, 0.05, 0.02), MAT.steel, 0, 0.1, 0.04, d); });
    addHit(BOX(1.6, 2.6, 0.8), { station: 'lift' }, g, 0, 1.3, 0.45);
    D3.door = { L, Rr };
    kitLabel(D3, 'LIFT 1', LIFT_DX, 2.42, z1 - 0.28, Math.PI, 0.7);
    // deck sign on the lobby's port wall
    { const c = cnv(560, 256), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 560, 256);
      elbow(x, 14, 14, 70, 18, 300, 30, true, '#E8A06A'); elbow(x, 14, 242, 70, 14, 200, 24, false, '#D9B07E');
      x.fillStyle = '#F2C88F'; x.font = `700 150px ${DISP}`; x.textBaseline = 'middle'; x.fillText('3', 110, 132);
      x.fillStyle = '#E8A06A'; x.font = `600 44px ${DISP}`; x.fillText('DECK 3', 220, 92); x.fillStyle = '#B693C4'; x.font = `500 32px ${DISP}`; x.fillText('MEDICAL AND OFFICERS', 222, 142);
      x.fillStyle = '#D9B07E'; x.font = `500 24px ${DISP}`; x.fillText('LIFT 1 · SICKBAY FORWARD · LAB TO STARBOARD', 222, 186);
      const m = mesh(new THREE.PlaneGeometry(1.1, 0.5), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), x0 + 0.082, 1.6, (z0 + z1) / 2, DECK3); m.rotation.y = Math.PI / 2;
      mesh(RBOX(0.02, 0.62, 1.22, 0.008), MAT.gunDark, x0 + 0.07, 1.6, (z0 + z1) / 2, DECK3); }
    kitDown(D3, (x0 + x1) / 2, (z0 + z1) / 2, H); kitDown(D3, LIFT_DX, z1 - 1.0, H);
  }

  // ---------- room doors: closed and labelled until each room is fitted out ----------
  const sickbay = Lt.F.spaces.find((s) => s.n === 'Sickbay');
  const all = Lt.doors.concat([{ s: sickbay, x: sickbay.door[1], z: z0, rot: 0 }]);
  all.forEach(({ s, x, z, rot }) => {
    const st = 'd3:' + (s.id || s.n), lift2 = s.n === 'Lift 2';
    doorAt(x, z, rot, d3DoorLabel(s), st, false, true, DECK3, 3);
    STATIONS[st] = { title: lift2 ? 'Lift 2' : s.n + (s.id ? ' ' + s.id : ''), role: 'Deck 3',
      panel: () => ({ read: [['Room', s.n + (s.b ? (s.b > 1 ? ' · two berths' : ' · one berth') : '')], ['Status', lift2 ? 'Lift 2 is not running yet' : 'Sealed for fitting-out']],
        note: lift2 ? 'Lift 2 will serve Decks 3 to 10 once main engineering is built.' : 'This room is not built yet. The corridors of Deck 3 are open; rooms follow with the standard room kit, sickbay first.', acts: [] }) };
  });
  D3.doors = all;

  d3Dress(Lt);
  d3Cabins(Lt);
  // the whole deck is lit by its computed probes (d3Light), none of it by a light map
  DECK3.traverse((o) => { if (o.isMesh) o.userData.probeLit = true; });

  // ---------- where you are: the corridor runs (rectangles) and the ring ----------
  const [ocx, ocz] = d3xz(...Lt.F.P.c), W = Lt.W;
  Lt.F.P.spokes.forEach(([a, end]) => { const r = a * Math.PI / 180, ux = Math.sin(r), uz = Math.cos(r), ex = ocx + ux * end, ez = ocz + uz * end;
    const label = { 0: 'Aft corridor', 90: 'Starboard spoke', 180: 'Forward spoke', 270: 'Port spoke' }[a] || 'Corridor';
    D3.rooms.push({ label, x0: Math.min(ocx, ex) - (uz ? W : 0), x1: Math.max(ocx, ex) + (uz ? W : 0), z0: Math.min(ocz, ez) - (ux ? W : 0), z1: Math.max(ocz, ez) + (ux ? W : 0) }); });
  D3.rooms.unshift({ label: 'Ring corridor', test: (x, z) => { const r = Math.hypot(x - ocx, z - ocz); return r > Lt.dc - W - 0.2 && r < Lt.dc + W + 0.2; } });
  DECK3.updateMatrixWorld(true);
}

// a point in a corridor module's own frame (x across, y up, z along; lz = -1..1 of its half-length at that x) in world terms
function d3ModPt(d, lx, y, lz) {
  const W = STD.corridor.w / 2, h = (d.lin + (d.lout - d.lin) * (lx + W) / (2 * W)) * d.sz / 2 * lz;
  return [d.x + d.ax[0] * lx + d.az[0] * h, y, d.z + d.ax[1] * lx + d.az[1] * h];
}
// sign text for the rooms whose doors are on a stretch of corridor: lifts and named rooms first, cabins as number ranges
function d3Contents(doors) {
  const nums = (k) => { const v = doors.filter((d) => d.s.n === k).map((d) => +d.s.id.slice(2)).sort((p, q) => p - q), r = [];
    v.forEach((x) => { const l = r[r.length - 1]; if (l && x === l[1] + 1) l[1] = x; else r.push([x, x]); });
    return r.map(([p, q]) => p === q ? String(p).padStart(2, '0') : String(p).padStart(2, '0') + '-' + String(q).padStart(2, '0')).join(', '); };
  const named = { 'Lift 2': 'LIFT 2', 'Sickbay': 'SICKBAY', 'Medical lab and morgue': 'MEDICAL LAB', 'Forward shield generator': 'SHIELD GENERATOR',
    'Computer core, upper': 'COMPUTER CORE', 'Damage control station': 'DAMAGE CONTROL', 'Pod feeds and torpedo magazine': 'MAGAZINE' };
  const out = [...new Set(doors.map((d) => named[d.s.n]).filter(Boolean))];
  if (doors.some((d) => d.s.n === 'Officers’ quarters')) out.push('OFFICERS ' + nums('Officers’ quarters'));
  if (doors.some((d) => d.s.n === 'Crew quarters')) out.push('CREW ' + nums('Crew quarters'));
  return out;
}
// Deck 3's signs, frame numbers, wall screens, benches, plants and the posts closing the ring crossings' outer corners
function d3Dress(Lt) {
  const W = Lt.W, H = D3C, mods = Lt.mods, cells = [];
  // frame numbers: a small plate on each frame's left post, facing along the corridor's width
  mods.forEach((d) => { if (!d.frame || d.L === 'o') return;
    const c = d3ModPt(d, -W + 0.102, 1.95, -1), lab = '3-' + d.frame;
    cells.push({ w: 128, h: 56, quads: [{ c, n: [d.ax[0], 0, d.ax[1]], w: 0.13, h: 0.057 }],
      draw: (g, x, y, w, h) => { g.fillStyle = '#0b0a0c'; g.fillRect(x, y, w, h); g.fillStyle = d.band; g.fillRect(x + 4, y + 6, 8, h - 12);
        g.fillStyle = '#F5E6CF'; g.font = `600 32px ${DISP}`; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(lab, x + w / 2 + 6, y + h / 2 + 1); } }); });
  // overhead signs where each stretch of corridor leaves a crossing: its name and what is along it; "LIFT 1" on the way there
  const legs = new Map(); mods.forEach((d) => { if (d.leg) { if (!legs.has(d.leg)) legs.set(d.leg, []); legs.get(d.leg).push(d); } });
  const legName = (k) => k[0] === 'r' ? ['RING · AFT STARBOARD', 'RING · FORWARD STARBOARD', 'RING · FORWARD PORT', 'RING · AFT PORT'][+k[1]]
    : ({ 0: k[0] === 'i' ? 'AFT SPOKE' : 'AFT CORRIDOR', 90: 'STARBOARD SPOKE', 180: 'FORWARD SPOKE', 270: 'PORT SPOKE' })[+k.slice(1)];
  const signs = [];
  legs.forEach((list, k) => {
    const ring = k[0] === 'r', sorted = list.slice().sort((p, q) => ring ? p.a - q.a : p.t - q.t), on = new Set(list);
    const doors = D3.doors.filter((d) => on.has(d.mod)), items = d3Contents(doors), a = ring ? null : +k.slice(1);
    if (k === 'i0') items.unshift('LIFT 1');
    const band = ring ? D3_BAND.ring : D3_BAND[a];
    // ends at a crossing: [module, facing sign (+1 along the module's z, -1 against), lift badge]
    const ends = ring ? [[sorted[0], 1, false], [sorted[sorted.length - 1], -1, false]]
      : k[0] === 'i' ? [[sorted[0], -1, k === 'i0'], [sorted[sorted.length - 1], 1, true]] : [[sorted[0], -1, false]];
    ends.forEach(([d, f, lift]) => signs.push({ d, f, lift, name: legName(k), items, band }));
  });
  signs.forEach((S) => {
    const d = S.d, c = d3ModPt(d, 0, 2.36, 0), n = [d.az[0] * S.f, 0, d.az[1] * S.f];
    // the sign's body and two hanger rods
    const body = mesh(RBOX(1.56, 0.32, 0.04, 0.012), MAT.gunDark, c[0] - n[0] * 0.02, c[1], c[2] - n[2] * 0.02, DECK3); body.rotation.y = Math.atan2(n[0], n[2]);
    [-0.6, 0.6].forEach((o) => mesh(CYL(0.008, 0.008, H - 2.52, 6), MAT.steel, c[0] - n[2] * o, (H + 2.52) / 2, c[2] + n[0] * o, DECK3));
    cells.push({ w: 1024, h: 208, quads: [{ c: [c[0] + n[0] * 0.002, c[1], c[2] + n[2] * 0.002], n, w: 1.5, h: 0.305 }], draw: (g, x, y, w, h) => {
      g.fillStyle = '#000'; g.fillRect(x, y, w, h); g.fillStyle = S.band; g.fillRect(x + 14, y + 16, 22, h - 32); hexTab(g, x + 48, y + 18, 26, 58, true, false); g.fill();
      const right = S.lift ? 214 : 20; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
      g.fillStyle = S.band; g.font = `600 58px ${DISP}`; g.fillText(S.name, x + 88, y + 70, w - 88 - right);
      g.fillStyle = '#D9B07E'; g.font = `500 36px ${DISP}`; const lines = [''];
      S.items.forEach((it) => { const t = lines[lines.length - 1] ? lines[lines.length - 1] + ' · ' + it : it; if (g.measureText(t).width < w - 92 - right || !lines[lines.length - 1]) lines[lines.length - 1] = t; else lines.push(it); });
      if (!S.items.length) lines[0] = S.name.startsWith('RING') ? 'CABINS' : 'TO THE CENTRE';
      lines.slice(0, 2).forEach((t, i) => g.fillText(t, x + 92, y + 124 + i * 44, w - 92 - right));
      if (S.lift) { const bx = x + w - 196, by = y + 54; g.fillStyle = '#E8A06A'; g.beginPath(); g.roundRect(bx, by, 176, 100, 50); g.fill();
        g.fillStyle = '#000'; g.font = `600 44px ${DISP}`; g.fillText('LIFT 1', bx + 24, by + 66); g.beginPath(); g.moveTo(bx + 140, by + 30); g.lineTo(bx + 162, by + 50); g.lineTo(bx + 140, by + 70); g.fill(); }
    } });
  });
  D3.signs = signs;
  D3.atlas = kitAtlas(D3, cells, 'Deck 3 signs');
  // wall screens and benches on the ring's inner wall (no doors there), a screen now and then on the long aft corridor
  const screen = [], bench = [];
  const place = (d, sd) => { const p = d3ModPt(d, sd * W, 0, 0), dir = [-d.ax[0] * sd, -d.ax[1] * sd]; return { x: p[0], z: p[2], ry: Math.atan2(dir[0], dir[1]), d, sd }; };
  mods.forEach((d) => { if (d.ring && !d.cross) { if (d.k % 12 === 3 || d.k % 12 === 9) screen.push(place(d, -1)); else if (d.k % 12 === 6) bench.push(place(d, -1)); }
    else if (d.leg === 'o0' && d.full && d.L === 'w' && d.R === 'w' && Math.round(d.t / 2.4) % 6 === 0) screen.push(place(d, (Math.round(d.t / 2.4) % 12) ? 1 : -1)); });
  { const c = cnv(512, 296), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 512, 296);
    elbow(g, 12, 12, 56, 16, 260, 26, true, '#E8A06A'); g.fillStyle = '#E8A06A'; g.font = `600 34px ${DISP}`; g.fillText('DECK 3', 300, 40);
    g.fillStyle = '#B693C4'; g.font = `500 26px ${DISP}`; g.fillText('MEDICAL AND OFFICERS', 84, 84);
    [['ENVIRONMENT', 'NOMINAL', '#8DBF84'], ['SICKBAY', 'READY', '#8DBF84'], ['LIFT 1', 'IN SERVICE', '#8DBF84'], ['LIFT 2', 'OFFLINE', '#F0B44C'], ['ALERT', 'CONDITION GREEN', '#8DBF84']].forEach(([a, b, col], i) => {
      g.fillStyle = '#D9B07E'; g.font = `500 24px ${DISP}`; g.fillText(a, 84, 126 + i * 34); g.fillStyle = col; g.fillText(b, 300, 126 + i * 34); });
    g.fillStyle = '#7E5C8E'; g.fillRect(12, 270, 488, 12);
    D3.screenMat = new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }); }
  kitProps(D3, [{ geo: RBOX(0.9, 0.56, 0.04, 0.015), mat: MAT.gunDark }, { geo: (() => { const g = new THREE.PlaneGeometry(0.82, 0.474); g.translate(0, 0, 0.0415); return g; })(), mat: D3.screenMat }]
    .map((p) => { p.geo = p.geo.clone(); p.geo.translate(0, 1.45, 0.02); return p; }), screen, 'Deck 3 wall screens');
  kitProps(D3, [{ geo: RBOX(1.4, 0.08, 0.42, 0.02), mat: MAT.leather }, { geo: RBOX(1.3, 0.4, 0.34, 0.02), mat: MAT.gunDark }]
    .map((p, i) => { p.geo = p.geo.clone(); p.geo.translate(0, i ? 0.2 : 0.44, i ? 0.2 : 0.23); return p; }), bench, 'Deck 3 benches');
  bench.forEach((b) => { const d = b.d; [-0.45, 0.45].forEach((o) => { const p = d3ModPt(d, b.sd * (W - 0.28), 0, o / (d.lin * d.sz / 2)); kitObs(D3, p[0], p[2], 0.28); }); });
  D3.screens = screen; D3.benches = bench;
  // plants at the far ends of the forward and lateral spokes
  Lt.caps.forEach((c) => { if (c.spoke === 0) return; const mx = (c.A[0] + c.B[0]) / 2, mz = (c.A[1] + c.B[1]) / 2, ax = (c.B[0] - c.A[0]) / 2.2, az = (c.B[1] - c.A[1]) / 2.2;
    kitPlant(D3, mx + c.n[0] * 0.45 + ax * 0.6, mz + c.n[1] * 0.45 + az * 0.6, 0.85); });
  // posts closing the ring crossings' outer corners (the ring's outer edge is a little wider than the spoke)
  Lt.F.P.spokes.forEach(([a]) => { const r = a * Math.PI / 180, u = [Math.sin(r), Math.cos(r)], v = [u[1], -u[0]], [ox, oz] = d3xz(...Lt.F.P.c), t = Lt.dc + W + 0.1;
    [-1, 1].forEach((sd) => { const p = mesh(RBOX(0.3, H, 0.3, 0.03), MAT.gunDark, ox + u[0] * t + v[0] * sd * (W + 0.08), H / 2, oz + u[1] * t + v[1] * sd * (W + 0.08), DECK3); p.rotation.y = Math.atan2(u[0], u[1]); }); });
}

// Deck 3's light, worked out here instead of baked (John, Nov 27: corridors only need a simple pass): a probe grid over
// the deck, lit by every corridor module's ceiling panel and the lobby's downlights (the white layer) and by the cove
// lights along the walls (the alert-tinted layer), with a soft share of bounced light. Each probe stores, for six
// directions, the light falling on a surface facing that way (the format bake.js reads). Walls don't block light here:
// the corridors are narrow and far apart, so light reaching a room's side of a wall doesn't show.
function d3Light() {
  const Lt = D3.layout, H = D3C, W = Lt.W, step = 0.5, y0 = D3Y + 0.15, lights = [], coves = [];
  Lt.mods.forEach((d) => { lights.push([d.x, D3Y + H - 0.05, d.z, d.sz < 0.5 ? 0.5 : 1, 0]);
    [[-1, d.L], [1, d.R]].forEach(([sd, k]) => { if (k === 'o') return; for (let u = -0.75; u <= 0.75; u += 0.5) { const p = d3ModPt(d, sd * (W - 0.15), 0, u); coves.push([p[0], D3Y + H - 0.28, p[2]]); } }); });
  D3.rooms.filter((r) => r.label === 'Lift 1 lobby').forEach((r) => { lights.push([(r.x0 + r.x1 - STD.corridor.w) / 2, D3Y + H - 0.01, (r.z0 + r.z1) / 2, 1.3, 0], [LIFT_DX, D3Y + H - 0.01, r.z1 - 1.0, 1.1, 0]); });
  // fitted rooms: their own lights, which light only their own room (space k: a room's light doesn't reach the
  // corridor or the next room, and the corridor's doesn't reach in)
  const rooms = (D3.fitted || D3.cabins || []); rooms.forEach((c, i) => c.lights.forEach(([x, y, z, k]) => lights.push([x, D3Y + y, z, k, i + 1])));
  // light from each fitted room's open doorway falls on the corridor floor outside it (corridor space 0)
  rooms.forEach((c) => { const d = D3.doors.find((q) => q.s === c.s); if (!d) return; const n = [Math.sin(d.rot), Math.cos(d.rot)]; lights.push([d.x + n[0] * 0.45, D3Y + 2.2, d.z + n[1] * 0.45, 0.35, 0]); });
  const inP = (P, x, z) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [ax, az] = P[i], [bx, bz] = P[j]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) c = !c; } return c; };
  const spaceAt = (x, z) => { for (let i = 0; i < rooms.length; i++) { const b = rooms[i].bb; if (x > b[0] && x < b[1] && z > b[2] && z < b[3] && inP(rooms[i].wpoly, x, z)) return i + 1; } return 0; };
  const xs = Lt.mods.map((d) => d.x), zs = Lt.mods.map((d) => d.z), x0 = Math.min(...xs) - 3, z0 = Math.min(...zs) - 3;
  const X = Math.ceil((Math.max(...xs) + 3 - x0) / step) + 1, Z = Math.ceil((Math.max(...zs) + 3 - z0) / step) + 1, Y = Math.floor((H - 0.4) / step) + 1; // layers stay below the ceiling (it samples the top one)
  // spatial hash, 4 m cells
  const cell = (x, z) => Math.floor(x / 4) + ',' + Math.floor(z / 4), hash = (list) => { const m = new Map(); list.forEach((l) => { const k = cell(l[0], l[2]); if (!m.has(k)) m.set(k, []); m.get(k).push(l); }); return m; };
  const HL = hash(lights), HC = hash(coves), near = (M, x, z) => { const out = [], cx = Math.floor(x / 4), cz = Math.floor(z / 4); for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const l = M.get((cx + i) + ',' + (cz + j)); if (l) out.push(...l); } return out; };
  const PW = 2.4, PS = 0.3, IP = 2.3, IC = 0.035, COL = [1.0, 0.93, 0.84], N = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const data = new Uint8Array(6 * X * Y * Z * 4), E = new Float32Array(6), S = new Float32Array(6);
  for (let iz = 0; iz < Z; iz++) for (let ix = 0; ix < X; ix++) {
    const px = x0 + ix * step, pz = z0 + iz * step, sp = spaceAt(px, pz), LL = near(HL, px, pz).filter((l) => l[4] === sp), CC = sp ? [] : near(HC, px, pz);
    const direct = (py) => { E.fill(0); LL.forEach(([lx, ly, lz, k]) => { const dx = lx - px, dy = ly - py, dz = lz - pz, r2 = dx * dx + dy * dy + dz * dz; if (r2 > 49) return;
      const r = Math.sqrt(r2), cl = Math.max(0, dy / r), a = IP * k * Math.pow(cl, 1.5) / (r2 + 0.35);
      N.forEach((n, f) => { const c = (n[0] * dx + n[1] * dy + n[2] * dz) / r; if (c > 0) E[f] += a * c; }); }); };
    direct(D3Y + 0.02); const floorLit = E[2]; // the light on the floor below: it bounces back up onto the ceiling
    for (let iy = 0; iy < Y; iy++) {
      const py = y0 + iy * step; S.fill(0); direct(py);
      CC.forEach(([lx, ly, lz]) => { const dx = lx - px, dy = ly - py, dz = lz - pz, r2 = dx * dx + dy * dy + dz * dz; if (r2 > 16) return;
        const r = Math.sqrt(r2), a = IC / (r2 + 0.25); N.forEach((n, f) => { const c = (n[0] * dx + n[1] * dy + n[2] * dz) / r; if (c > 0) S[f] += a * c; }); });
      // bounce: a share of the light on the walls to every side, and the lit floor back up onto the ceiling
      const avg = (E[0] + E[1] + E[4] + E[5]) / 4; for (let f = 0; f < 6; f++) E[f] += 0.3 * avg; E[3] += 0.4 * floorLit;
      for (let f = 0; f < 6; f++) {
        const t = ((iz * Y + iy) * 6 * X + f * X + ix) * 4, w = Math.min(1, E[f] / PW);
        data[t] = Math.round(255 * Math.sqrt(w * COL[0])); data[t + 1] = Math.round(255 * Math.sqrt(w * COL[1])); data[t + 2] = Math.round(255 * Math.sqrt(w * COL[2]));
        data[t + 3] = Math.round(255 * Math.sqrt(Math.min(1, S[f] / PS)));
      }
    }
  }
  return { origin: [x0, y0, z0], step, dims: [X, Y, Z], data, pr_max: [PW, PS], lm: 140 };
}

// ---------- standard rooms (roadmap C): the cabins ----------
// Every cabin from its shared layout (shipRoomLayout): its shell (floor, ceiling, walls with the door's opening), a head
// (tiled partition with an open sliding door; shower, toilet, basin and mirror), bed or beds, desk and chair, wardrobe,
// a ceiling light. Shells are merged deck-wide per material; furniture and fittings are instanced (kitProps), so all
// 38 cabins cost a few dozen draws. Their doors open as you walk up.
function d3Cabins(Lt) {
  const RH = STD.room.h, I = STD.inset, W2 = (p) => [p[1], p[0] - 64], wallMat = roomWallMat(RH, 'fabric'), tileMat = CKIT.bathWall || (CKIT.bathWall = roomWallMat(RH, 'bath'));
  const geo = new Map(), put = (mat, g) => { if (!geo.has(mat)) geo.set(mat, []); geo.get(mat).push([g, null]); };
  const props = {}, place = (k, x, z, dir, y) => (props[k] = props[k] || []).push({ x, z, y: y || 0, ry: Math.atan2(dir[0], dir[1]) });
  const wq = (mat, A, B, y0, y1, n, uo) => { const L = Math.hypot(B[0] - A[0], B[1] - A[1]); put(mat, kitQuad([[A[0], y0, A[1]], [B[0], y0, B[1]], [B[0], y1, B[1]], [A[0], y1, A[1]]],
    [[uo / 1.2, y0 / RH], [(uo + L) / 1.2, y0 / RH], [(uo + L) / 1.2, y1 / RH], [uo / 1.2, y1 / RH]], [n[0], 0, n[1]])); };
  // a wall from A to B facing n, with openings [{ a, b, y1 }] along it (metres from A), and its collision line
  const wall = (mat, A, B, n, holes) => { const L = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], P = (t) => [A[0] + u[0] * t, A[1] + u[1] * t]; let t = 0;
    (holes || []).slice().sort((p, q) => p.a - q.a).forEach((h) => { if (h.a > t) { wq(mat, P(t), P(h.a), 0, RH, n, t); kitSeg(D3, ...P(t), ...P(h.a), 0.2); }
      wq(mat, P(h.a), P(h.b), h.y1, RH, n, h.a); t = h.b; });
    if (L > t) { wq(mat, P(t), P(L), 0, RH, n, t); kitSeg(D3, ...P(t), ...P(L), 0.2); } };
  // a room's shell from its plan space: floor and ceiling (triangulated), walls on the inset outline with the door's
  // opening where the snapped door is, collision lines. Returns the inset outline and its centre.
  const shell = (s, floorMat, wMat) => {
    const dd = D3.doors.find((q) => q.s === s), wp = insetPoly(s.poly.map(W2), I), n = wp.length;
    const cx = wp.reduce((a, p) => a + p[0] / n, 0), cz = wp.reduce((a, p) => a + p[1] / n, 0);
    // floor and ceiling
    const tri = THREE.ShapeUtils.triangulateShape(wp.map(([x, z]) => new THREE.Vector2(x, z)), []);
    [[floorMat, 0.003, 1], [MAT.ceiling, RH, -1]].forEach(([mat, y, up]) => { const pos = [], nor = [], uv = [];
      tri.forEach(([a, b, c]) => { let t = [a, b, c]; const A = wp[a], B = wp[b], C = wp[c], cr = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]); if ((cr < 0) !== (up > 0)) t = [a, c, b];
        t.forEach((k) => { pos.push(wp[k][0], y, wp[k][1]); nor.push(0, up, 0); uv.push(wp[k][0] / (up > 0 ? 1 : 1.2), wp[k][1] / (up > 0 ? 1 : 1.2)); }); });
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); put(mat, g); });
    // walls, the door's opening on the wall nearest the door
    let de = -1, dt = 0, bd = 1e9; wp.forEach((A, i) => { const B = wp[(i + 1) % n], L = Math.hypot(B[0] - A[0], B[1] - A[1]), t = ((dd.x - A[0]) * (B[0] - A[0]) + (dd.z - A[1]) * (B[1] - A[1])) / (L * L), tc = Math.max(0, Math.min(1, t));
      const d = Math.hypot(A[0] + tc * (B[0] - A[0]) - dd.x, A[1] + tc * (B[1] - A[1]) - dd.z); if (d < bd) { bd = d; de = i; dt = t * L; } });
    wp.forEach((A, i) => { const B = wp[(i + 1) % n], L = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L]; let nn = [-u[1], u[0]];
      if ((cx - A[0]) * nn[0] + (cz - A[1]) * nn[1] < 0) nn = [-nn[0], -nn[1]];
      wall(wMat, A, B, nn, i === de ? [{ a: dt - 0.6, b: dt + 0.6, y1: 2.3 }] : null); });
    return { dd, wp, n, cx, cz };
  };
  D3.cabins = [];
  Lt.F.spaces.forEach((s) => {
    const Lay = shipRoomLayout(s); if (!Lay) return;
    const { dd, wp, n } = shell(s, MAT.roomCarpet, wallMat);
    // the room's frame in world terms
    const at = (u, v) => W2(Lay.at(u, v)), ux = [Lay.ux[1], Lay.ux[0]], uy = [Lay.uy[1], Lay.uy[0]], mid = (i) => at((i.u0 + i.u1) / 2, (i.v0 + i.v1) / 2), neg = (v) => [-v[0], -v[1]];
    Lay.items.forEach((it) => {
      const c = mid(it);
      if (it.k === 'bed' || it.k === 'bunk') { place(it.k, c[0], c[1], neg(uy)); [-0.5, 0.5].forEach((o) => kitObs(D3, c[0] + uy[0] * o, c[1] + uy[1] * o, 0.5)); }
      if (it.k === 'desk') { place('desk', c[0], c[1], ux); kitObs(D3, c[0], c[1], 0.4); }
      if (it.k === 'chair') place('chair', c[0], c[1], neg(ux));
      if (it.k === 'wardrobe') { place('wardrobe', c[0], c[1], neg(ux)); kitObs(D3, c[0], c[1], 0.4); }
      if (it.k === 'head') {
        // partition: the front wall (door opening near its left end) and the left wall, tiled on both faces
        // (the front wall runs on to the room's real right-hand wall, which can lie beyond the clear rectangle)
        const ur = Math.max(it.u1, Lay.span(it.v0)[1] - I), A = at(it.u0, it.v0), B = at(ur, it.v0), C = at(it.u0, it.v1), t = 0.04, off = (P, v, k) => [P[0] + v[0] * k, P[1] + v[1] * k];
        wall(tileMat, off(A, uy, -t), off(B, uy, -t), neg(uy), [{ a: 0.15, b: 0.85, y1: 2.1 }]); wall(tileMat, off(B, uy, t), off(A, uy, t), uy, [{ a: ur - it.u0 - 0.85, b: ur - it.u0 - 0.15, y1: 2.1 }]);
        wall(tileMat, off(A, ux, -t), off(C, ux, -t), neg(ux)); wall(tileMat, off(C, ux, t), off(A, ux, t), ux);
        const hp = (u, v) => at(it.u0 + u, it.v0 + v), hw = it.u1 - it.u0;
        { const p = hp(0.5 + 0.3, -0.07); place('sliding', p[0], p[1], neg(uy)); } // the sliding door, half open over the wall
        { const p = hp(hw / 2, 1.0); place('headfloor', p[0], p[1], uy); }
        { const p = hp(hw - 0.33, 0.95); place('toilet', p[0], p[1], neg(ux)); kitObs(D3, p[0], p[1], 0.3); }
        { const p = hp(hw - 0.25, 0.3); place('basin', p[0], p[1], neg(ux)); }
        { const p = hp(hw / 2, 2.0 - 0.45); place('shower', p[0], p[1], neg(uy)); const g0 = hp(0.05, 2.0 - 0.92), g1 = hp(hw - 0.62, 2.0 - 0.92); kitSeg(D3, g0[0], g0[1], g1[0], g1[1], 0.2); }
        { const p = hp(hw / 2, 1.0); D3.headLights = (D3.headLights || []).concat([[p[0], RH - 0.01, p[1]]]); }
      }
    });
    // ceiling light over the room's open floor, and where the light sits for d3Light
    const lp = at(Lay.w * 0.4, Math.max(1.2, Lay.d - 3.0)); place('cabinlight', lp[0], lp[1], uy, RH);
    const hd = Lay.items.find((i) => i.k === 'head'), hl = at((hd.u0 + hd.u1) / 2, (hd.v0 + hd.v1) / 2);
    const xs = wp.map((p) => p[0]), zs = wp.map((p) => p[1]);
    D3.cabins.push({ s, wpoly: wp, bb: [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)], lights: [[lp[0], RH - 0.05, lp[1], 1.5], [hl[0], RH - 0.05, hl[1], 0.7]] });
    // its door opens now, and its panel says what's inside
    const door = DOORS.find((q) => q.station === 'd3:' + s.id); if (door) door.auto = true;
    const beds = Lay.items.filter((i) => i.k === 'bed').length;
    STATIONS['d3:' + s.id] = { title: (s.n === 'Crew quarters' ? 'Crew cabin ' : 'Officer’s cabin ') + s.id, role: 'Deck 3',
      panel: () => ({ read: [['Berths', s.b > 1 ? 'Two' : 'One'], ['Inside', (Lay.items.some((i) => i.k === 'bunk') ? 'Bunk' : beds > 1 ? 'Two beds' : 'Bed') + ', desk, wardrobe, own head (shower, toilet, basin)']],
        note: 'Walk up to the door to go in.', acts: [] }) };
    D3.rooms.unshift({ label: (s.n === 'Crew quarters' ? 'Crew cabin ' : 'Cabin ') + s.id, test: (x, z) => { let c = false; for (let i = 0, j = n - 1; i < n; j = i++) { const [ax, az] = wp[i], [bx, bz] = wp[j]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) c = !c; } return c; } });
  });
  const extra = d3Rooms(Lt, { shell, put, wall, place, W2, RH, I });
  Object.assign(extra, d3Sickbay(Lt, { shell, put, place, RH }));
  geo.forEach((list, mat) => { const m = mesh(kitGeo(list), mat, 0, 0, 0, DECK3); m.name = 'Deck 3 rooms'; });
  // the fittings, each drawn as instances; local frames: +z faces into the room (beds: +z toward the foot)
  const P = (g, mat, x, y, z) => { const q = g.clone(); q.translate(x, y, z); return { geo: q, mat }; }, MIR = CKIT.mirror || (CKIT.mirror = new THREE.MeshStandardMaterial({ color: 0xdfe6ea, metalness: 1, roughness: 0.06, envMapIntensity: 1.4 }));
  const bedParts = (y) => [P(RBOX(0.95, 0.3, 2.05, 0.03), WOOD, 0, y + 0.15, 0), P(RBOX(0.88, 0.18, 1.95, 0.05), CERAMIC, 0, y + 0.39, 0), P(RBOX(0.92, 0.05, 1.3, 0.02), FABRIC, 0, y + 0.5, 0.32), P(RBOX(0.6, 0.1, 0.34, 0.04), CERAMIC, 0, y + 0.53, -0.76)];
  const KIT = {
    bed: bedParts(0).concat([P(RBOX(0.95, 1.0, 0.08, 0.02), MAT.leatherDark, 0, 0.62, -1.03), P(BOX(0.86, 0.018, 0.03), downlightMat, 0, 1.125, -1.0)]),
    bunk: bedParts(0).concat(bedParts(1.15), [-1, 1].flatMap((sx) => [-1, 1].map((sz) => P(CYL(0.025, 0.025, 1.85, 8), MAT.steel, sx * 0.45, 0.92, sz * 1.0)))),
    desk: [P(RBOX(0.9, 0.04, 0.6, 0.012), WOOD, 0, 0.74, 0), P(RBOX(0.04, 0.72, 0.56, 0.01), WOOD, -0.42, 0.36, 0), P(RBOX(0.04, 0.72, 0.56, 0.01), WOOD, 0.42, 0.36, 0),
      P(RBOX(0.5, 0.32, 0.03, 0.01), MAT.gunDark, 0, 1.0, -0.22), P(new THREE.PlaneGeometry(0.46, 0.28), D3.screenMat, 0, 1.0, -0.204)],
    chair: [P(RBOX(0.46, 0.06, 0.46, 0.02), MAT.leather, 0, 0.46, 0), P(RBOX(0.46, 0.5, 0.06, 0.02), MAT.leather, 0, 0.75, -0.22), P(CYL(0.03, 0.03, 0.42, 8), MAT.steel, 0, 0.22, 0), P(CYL(0.24, 0.24, 0.03, 16), MAT.steel, 0, 0.02, 0)],
    wardrobe: [P(RBOX(0.8, 2.05, 0.58, 0.02), WOOD, 0, 1.025, 0), P(BOX(0.012, 1.7, 0.012), MAT.steel, 0, 1.025, 0.295)],
    sliding: [P(RBOX(0.72, 2.1, 0.03, 0.01), CERAMIC, 0, 1.05, 0)],
    headfloor: [P((() => { const g = new THREE.PlaneGeometry(1.2, 1.9); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1.2, uv.getY(i) * 1.9); return g; })(),
      CKIT.bathFloor || (CKIT.bathFloor = (() => { const c = cnv(128, 128), g = c.getContext('2d'), r = mulberry(71); g.fillStyle = '#b9bcb8'; g.fillRect(0, 0, 128, 128);
        for (let y = 0; y < 128; y += 32) for (let x = 0; x < 128; x += 32) { const v = 178 + Math.round(r() * 14); g.fillStyle = `rgb(${v},${v + 2},${v})`; g.fillRect(x + 1, y + 1, 30, 30); }
        const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, envMapIntensity: 0.6 }); })()), 0, 0.006, 0)],
    toilet: [P(RBOX(0.38, 0.4, 0.5, 0.08), CERAMIC, 0, 0.2, 0.05), P(RBOX(0.38, 0.36, 0.17, 0.03), CERAMIC, 0, 0.58, -0.22), P(RBOX(0.4, 0.03, 0.46, 0.03), CERAMIC, 0, 0.42, 0.06), P(BOX(0.16, 0.01, 0.09), MAT.steel, 0, 0.765, -0.22)],
    basin: [P(RBOX(0.46, 0.06, 0.42, 0.02), WOOD, 0, 0.82, 0), P(RBOX(0.36, 0.1, 0.3, 0.04), CERAMIC, 0, 0.88, 0.02), P(new THREE.PlaneGeometry(0.46, 0.6), MIR, 0, 1.45, -0.205), P(CYL(0.012, 0.012, 0.16, 8), MAT.steel, 0, 0.98, -0.14), P(BOX(0.44, 0.015, 0.1), MAT.steel, 0, 1.11, -0.15), P(CYL(0.025, 0.025, 0.12, 10), FABRIC, 0.14, 1.18, -0.15)],
    shower: [P(RBOX(1.2, 0.06, 0.86, 0.02), CERAMIC, 0, 0.03, 0), P(RBOX(0.62, 1.9, 0.012, 0.004), GLASS, -0.27, 1.0, 0.45), P(CYL(0.07, 0.07, 0.02, 16), MAT.steel, 0, 2.1, -0.35), P(CYL(0.012, 0.012, 0.9, 8), MAT.steel, 0.38, 1.35, -0.39), P(RBOX(0.05, 0.2, 0.05, 0.02), MAT.steel, 0.38, 1.55, -0.36), P(CYL(0.05, 0.05, 0.005, 12), MAT.steel, 0, 0.063, 0)],
    cabinlight: [P(RBOX(0.9, 0.04, 0.5, 0.015), MAT.steel, 0, -0.02, 0), P((() => { const g = new THREE.PlaneGeometry(0.78, 0.38); g.rotateX(Math.PI / 2); return g; })(), downlightMat, 0, -0.045, 0)],
  };
  Object.assign(KIT, extra);
  D3.cabinProps = {}; Object.entries(props).forEach(([k, list]) => { if (!KIT[k]) { console.warn('Deck 3: no kit for', k); return; } D3.cabinProps[k] = kitProps(D3, KIT[k], list, 'Deck 3 ' + k); });
  // a little variety from cabin to cabin: each bed's blanket in one of a few colours
  { const pal = [[1, 1, 1], [1.5, 0.75, 0.6], [0.7, 0.8, 1.35], [1.25, 1.1, 0.7], [0.85, 1.25, 0.9], [1.3, 0.8, 1.2]], c = new THREE.Color(), r = mulberry(83);
    ['bed', 'bunk'].forEach((k) => (D3.cabinProps[k] || []).filter((m) => m.material === FABRIC).forEach((m) => { for (let i = 0; i < m.count; i++) { c.setRGB(...pal[(r() * pal.length) | 0]); m.setColorAt(i, c); } m.instanceColor.needsUpdate = true; })); }
}

// ---------- standard rooms (roadmap C2): the deck's other ordinary rooms ----------
// Medical lab and morgue, the forward shield generator bays, the upper computer core, the pod feeds and torpedo
// magazine, the damage control station. Each gets the shared shell (d3Cabins' shell: bulkhead walls and deck plate in
// the working spaces), fittings laid out in its own frame (u along the door's wall, v into the room), a grid of
// ceiling lights (its own light space in d3Light), an opening door. Returns the fittings' kits (instanced by d3Cabins).
// Small props (mugs, data pads, tool cases) go on desks, benches and consoles in cabins and rooms alike.
function d3Rooms(Lt, C) {
  const { shell, put, wall, place, W2, RH } = C, bulk = roomWallMat(RH, 'bulk'), labWall = CKIT.bathWall || (CKIT.bathWall = roomWallMat(RH, 'bath')), neg = (v) => [-v[0], -v[1]];
  const inP = (P, x, z) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [ax, az] = P[i], [bx, bz] = P[j]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) c = !c; } return c; };
  const KINDS = { 'Medical lab and morgue': 'lab', 'Forward shield generator': 'shield', 'Computer core, upper': 'core', 'Pod feeds and torpedo magazine': 'magazine', 'Damage control station': 'dc' };
  D3.fitted = (D3.cabins || []).slice(); D3.roomsFitted = [];
  // small props on top of a fitting: off = [along its width, out from its back, height]
  const small = (k, p, off) => { const r = p.ry, ax = [Math.cos(r), -Math.sin(r)], az = [Math.sin(r), Math.cos(r)]; place(k, p.x + ax[0] * off[0] + az[0] * off[1], p.z + ax[1] * off[0] + az[1] * off[1], az, off[2]); };
  const placed = (k, x, z, dir, y) => { place(k, x, z, dir, y); return { x, z, ry: Math.atan2(dir[0], dir[1]) }; };
  // cabins' desks get a mug and a data pad
  (D3.cabins || []).forEach((c) => { const L = shipRoomLayout(c.s), d = L.items.find((i) => i.k === 'desk'); if (!d) return;
    const m = W2(L.at((d.u0 + d.u1) / 2, (d.v0 + d.v1) / 2)), ux = [L.ux[1], L.ux[0]], p = { x: m[0], z: m[1], ry: Math.atan2(ux[0], ux[1]) };
    small('mug', p, [0.3, 0.05, 0.76]); small('pad', p, [-0.15, 0.08, 0.76]); });
  Lt.F.spaces.forEach((s) => {
    const kind = KINDS[s.n]; if (!kind) return;
    const work = kind !== 'lab', { dd, wp, cx, cz } = shell(s, work ? MAT.floorPlate : MAT.roomCarpet, work ? bulk : labWall);
    // the frame: u along the door's wall, v into the room
    const nD = [-Math.sin(dd.rot), -Math.cos(dd.rot)], uy = nD, ux = [uy[1], -uy[0]], o = [dd.x, dd.z];
    const L = (u, v) => [o[0] + ux[0] * u + uy[0] * v, o[1] + ux[1] * u + uy[1] * v], inside = (u, v, m) => { const q = L(u, v); return inP(insetPoly(wp, m || 0), q[0], q[1]); };
    const loc = wp.map(([x, z]) => [(x - o[0]) * ux[0] + (z - o[1]) * ux[1], (x - o[0]) * uy[0] + (z - o[1]) * uy[1]]);
    const span = (v) => { const xs = []; loc.forEach((a, i) => { const b = loc[(i + 1) % loc.length]; if ((a[1] - v) * (b[1] - v) <= 0 && a[1] !== b[1]) xs.push(a[0] + (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1])); }); return xs.length > 1 ? [Math.min(...xs), Math.max(...xs)] : null; };
    const vmax = Math.max(...loc.map((p) => p[1])), lights = [];
    // a run of units w wide along depth v, between u0 and u1, facing dir; skip(u) leaves gaps
    const run = (k, v, u0, u1, w, dir, skip, obsR) => { const out = []; const n = Math.floor((u1 - u0) / w); const st = u0 + (u1 - u0 - n * w) / 2;
      for (let i = 0; i < n; i++) { const u = st + w * (i + 0.5); if (skip && skip(u)) continue; if (!inside(u - w / 2, v, 0.05) || !inside(u + w / 2, v, 0.05)) continue; const p = L(u, v); out.push(placed(k, p[0], p[1], dir)); if (obsR) kitObs(D3, p[0], p[1], obsR); }
      return out; };
    const near = (v) => { const q = span(v); return q ? [q[0] + 0.1, q[1] - 0.1] : [0, 0]; };
    if (kind === 'shield') {
      // the generator in the middle of the bay, conduits from its crown out to three walls, a console by the door
      const g = [cx, cz]; place('shgen', g[0], g[1], uy); kitObs(D3, g[0], g[1], 2.75);
      // a guard rail round it, open toward the door
      { const r = 2.7, a0 = Math.atan2(-uy[0], -uy[1]); [0.55, 1.0].forEach((y) => { const t = new THREE.TorusGeometry(r, 0.025, 6, 64, Math.PI * 2 - 0.9); t.rotateX(Math.PI / 2); t.rotateY(-(a0 + 0.45) + Math.PI / 2); t.translate(g[0], y, g[1]); put(MAT.steel, t); });
        for (let i = 0; i <= 12; i++) { const a = a0 + 0.45 + (Math.PI * 2 - 0.9) * i / 12, pst = CYL(0.03, 0.03, 1.0, 8); pst.translate(g[0] + Math.sin(a) * r, 0.5, g[1] + Math.cos(a) * r); put(MAT.steel, pst); } }
      [[1, 0], [0, 1], [Math.SQRT1_2, Math.SQRT1_2], [-1, 0], [0, -1]].forEach(([a, b]) => { const d = [ux[0] * a + uy[0] * b, ux[1] * a + uy[1] * b]; let t = 1.3; while (t < 20 && inP(wp, g[0] + d[0] * (t + 0.3), g[1] + d[1] * (t + 0.3))) t += 0.25;
        if (t < 2.5) return; const len = t - 1.3, cyl = CYL(0.11, 0.11, len, 10); cyl.rotateX(Math.PI / 2); cyl.rotateY(Math.atan2(d[0], d[1])); cyl.translate(g[0] + d[0] * (1.3 + len / 2), RH - 0.28, g[1] + d[1] * (1.3 + len / 2)); put(MAT.steel, cyl);
        const cl = BOX(0.32, 0.32, 0.12); cl.rotateY(Math.atan2(d[0], d[1])); cl.translate(g[0] + d[0] * (t - 0.06), RH - 0.28, g[1] + d[1] * (t - 0.06)); put(MAT.gunDark, cl); });
      const cu = inside(1.8, 1.6, 0.4) ? 1.8 : -1.8, cp = L(cu, 1.6), toG = [g[0] - cp[0], g[1] - cp[1]], lg = Math.hypot(...toG);
      const con = placed('console', cp[0], cp[1], neg([toG[0] / lg, toG[1] / lg])); kitObs(D3, cp[0], cp[1], 0.55); small('case', con, [0.75, 0.0, 0]);
    }
    if (kind === 'core') {
      const [a0, a1] = near(vmax - 0.5); run('rack', vmax - 0.45, a0, a1, 1.25, neg(uy), null, 0.5);
      const [b0, b1] = near(1.55); run('rack', 1.55, b0, b1, 1.25, uy, (u) => Math.abs(u) < 1.4, 0.5);
      const cp = L(a0 + 0.75, (1.9 + vmax - 0.8) / 2); const con = placed('console', cp[0], cp[1], ux); // at the end of the aisle, clear of the door kitObs(D3, cp[0], cp[1], 0.5); small('mug', con, [0.42, 0.15, 0.95]);
    }
    if (kind === 'magazine') {
      const [a0, a1] = near(vmax - 0.5); const racks = run('torprack', vmax - 0.45, a0, a1, 2.6, neg(uy), null);
      racks.forEach((r) => { const ax = [Math.cos(r.ry), -Math.sin(r.ry)]; [-1, 1].forEach((k) => kitObs(D3, r.x + ax[0] * k * 0.8, r.z + ax[1] * k * 0.8, 0.45)); });
      // the loading rail along the racks with its hoist, hazard lines on the deck in front, the feed trunk up to the pod
      const rv = vmax - 1.45, [r0, r1] = near(rv), A = L(r0 + 0.2, rv), B = L(r1 - 0.2, rv), rl = Math.hypot(B[0] - A[0], B[1] - A[1]);
      { const beam = BOX(rl, 0.16, 0.12); beam.rotateY(-Math.atan2(B[1] - A[1], B[0] - A[0])); beam.translate((A[0] + B[0]) / 2, RH - 0.1, (A[1] + B[1]) / 2); put(MAT.gun, beam);
        const st = BOX(rl, 0.02, 0.1); st.rotateY(-Math.atan2(B[1] - A[1], B[0] - A[0])); st.translate((A[0] + B[0]) / 2, 0.004, (A[1] + B[1]) / 2); put(MAT.hazard, st);
        const h = L((r0 + r1) / 2 - 1.0, rv); place('hoist', h[0], h[1], uy); }
      const fu = inside(a1 - 0.4, 1.7, 0.7) ? a1 - 0.4 : a0 + 0.4, fp = L(fu, 1.7); place('feed', fp[0], fp[1], uy); kitObs(D3, fp[0], fp[1], 0.75);
      const cp = L(fu > 0 ? fu - 1.9 : fu + 1.9, 1.3); const lk = placed('locker', cp[0], cp[1], fu > 0 ? ux : neg(ux)); kitObs(D3, cp[0], cp[1], 0.35);
    }
    if (kind === 'dc') {
      const [a0, a1] = near(vmax - 0.35); run('locker', vmax - 0.3, a0, a1, 0.64, neg(uy), null, 0.32);
      const sp1 = span(2.1), bp = L(sp1[0] + 0.08, 2.1); place('dcboard', bp[0], bp[1], ux);
      [1.3, 2.0].forEach((v) => { const t = L(span(v)[1] - 0.25, v); place('tank', t[0], t[1], neg(ux)); kitObs(D3, t[0], t[1], 0.22); });
      const bc = L(0, 2.45), bench = placed('worktable', bc[0], bc[1], uy); kitObs(D3, bc[0], bc[1], 0.75); small('case', bench, [-0.35, 0, 0.92]); small('pad', bench, [0.35, 0.1, 0.92]);
    }
    if (kind === 'lab') {
      // benches along the far straight wall, cabinets along the door's wall beside the door, the morgue's drawer bank
      // on the door's wall toward the ring with an examination table before it, an island in the middle
      let far = null; wp.forEach((A, i) => { const B = wp[(i + 1) % wp.length], len = Math.hypot(B[0] - A[0], B[1] - A[1]); if (len < 4) return; const e = [(B[0] - A[0]) / len, (B[1] - A[1]) / len];
        if (Math.abs(e[0] * ux[0] + e[1] * ux[1]) < 0.3 && (!far || len > far.len)) far = { A, B, len, e }; });
      if (far) { let nn = [-far.e[1], far.e[0]]; if ((cx - far.A[0]) * nn[0] + (cz - far.A[1]) * nn[1] < 0) nn = neg(nn);
        for (let t = 1.4; t + 0.9 < far.len - 1.0; t += 1.9) { const p = [far.A[0] + far.e[0] * (t + 0.9) + nn[0] * 0.36, far.A[1] + far.e[1] * (t + 0.9) + nn[1] * 0.36];
          if (!inP(wp, p[0], p[1])) continue; const b = placed('labbench', p[0], p[1], nn); kitSeg(D3, p[0] - far.e[0] * 0.92 + nn[0] * 0.36, p[1] - far.e[1] * 0.92 + nn[1] * 0.36, p[0] + far.e[0] * 0.92 + nn[0] * 0.36, p[1] + far.e[1] * 0.92 + nn[1] * 0.36, 0.2);
          small(t % 3.8 < 1.9 ? 'pad' : 'case', b, [0.55, 0.1, 0.92]); } }
      const side = inside(3.4, 0.5, 0.2) ? 1 : -1;
      run('cabinet', 0.32, side > 0 ? -7 : 1.4, side > 0 ? -1.4 : 7, 0.95, uy, null, 0.3);
      const mp = L(side * 3.4, 0.45); place('morgue', mp[0], mp[1], uy); kitSeg(D3, ...L(side * 3.4 - 1.25, 0.9), ...L(side * 3.4 + 1.25, 0.9), 0.2);
      const sp = L(side * 3.4, 2.4); place('slab', sp[0], sp[1], ux); kitObs(D3, sp[0], sp[1], 0.55);
      // three island benches across the middle of the lab, stools at them
      [-3.4, 0, 3.4].forEach((du, i) => { const ip = [cx + ux[0] * du, cz + ux[1] * du]; if (!inP(insetPoly(wp, 1.4), ip[0], ip[1])) return;
        const isl = placed('labisland', ip[0], ip[1], ux); [-0.6, 0.6].forEach((k) => kitObs(D3, ip[0] + uy[0] * k, ip[1] + uy[1] * k, 0.75));
        small(i === 1 ? 'mug' : 'pad', isl, [0.5, 0.2, 0.94]); if (i !== 1) small('case', isl, [-0.6, -0.1, 0.94]);
        [-0.5, 0.5].forEach((k) => { const sp = [ip[0] + uy[0] * k + ux[0] * 0.95, ip[1] + uy[1] * k + ux[1] * 0.95]; place('stool', sp[0], sp[1], neg(ux)); }); });
    }
    // ceiling lights on a 3 m grid over the floor (not over the generator), each also a light for d3Light
    const pts = [];
    for (let v = 1.4; v < vmax - 0.6; v += 3.0) { const q = span(v); if (!q) continue; const n = Math.max(1, Math.round((q[1] - q[0] - 1.2) / 3.0)); for (let i = 0; i < n; i++) { const u = q[0] + 0.6 + (q[1] - q[0] - 1.2) * (i + 0.5) / n; if (inside(u, v, 0.5)) pts.push(L(u, v)); } }
    pts.filter((p) => kind !== 'shield' || Math.hypot(p[0] - cx, p[1] - cz) > 2.4).forEach((p) => { place('roomlight', p[0], p[1], uy, RH); lights.push([p[0], RH - 0.05, p[1], 1.4]); });
    const xs = wp.map((p) => p[0]), zs = wp.map((p) => p[1]), entry = { s, kind, wpoly: wp, bb: [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)], lights };
    D3.fitted.push(entry); D3.roomsFitted.push(entry);
    const door = DOORS.find((q) => q.station === 'd3:' + (s.id || s.n)); if (door) door.auto = true;
    const what = { lab: 'Lab benches, an island bench, cabinets, the morgue’s drawer bank and an examination table', shield: 'The generator housing, its conduits and a control console',
      core: 'Two rows of core banks and a console', magazine: 'Torpedo racks, the loading rail and hoist, the feed trunk up to the weapons pod', dc: 'Repair lockers, the deck’s damage board, suppression tanks and a work table' }[kind];
    STATIONS['d3:' + (s.id || s.n)] = { title: s.n + (s.id ? ' ' + s.id : ''), role: 'Deck 3', panel: () => ({ read: [['Inside', what]], note: 'Walk up to the door to go in.', acts: [] }) };
    D3.rooms.unshift({ label: s.n, test: (x, z) => inP(wp, x, z) });
  });
  // the kits: +z faces out from the wall into the room
  const P = (g, mat, x, y, z) => { const q = g.clone(); q.translate(x, y, z); return { geo: q, mat }; }, R = (g, rx, ry, rz) => { const q = g.clone(); if (rx) q.rotateX(rx); if (ry) q.rotateY(ry); if (rz) q.rotateZ(rz); return q; };
  const glow = CKIT.shieldGlow || (CKIT.shieldGlow = new THREE.MeshStandardMaterial({ color: 0x241a30, emissive: new THREE.Color(0x8a5fb0), emissiveIntensity: 0.75, roughness: 0.4 }));
  const casing = CKIT.casing || (CKIT.casing = new THREE.MeshStandardMaterial({ color: 0x3b3f43, metalness: 0.7, roughness: 0.35, envMapIntensity: 0.8 }));
  const red = CKIT.red || (CKIT.red = new THREE.MeshStandardMaterial({ color: 0xa8322c, metalness: 0.3, roughness: 0.4 }));
  const caseMat = CKIT.caseMat || (CKIT.caseMat = new THREE.MeshStandardMaterial({ color: 0xb88a3a, metalness: 0.2, roughness: 0.5 }));
  const face = (w, h, draw) => { const c = cnv(w, h), g = c.getContext('2d'); draw(g, w, h); return new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }); };
  const rackFace = CKIT.rackFace2 || (CKIT.rackFace2 = face(128, 320, (g, w, h) => { g.fillStyle = '#05070b'; g.fillRect(0, 0, w, h); const r = mulberry(5);
    for (let y = 8; y < h - 8; y += 26) { g.fillStyle = '#121822'; g.fillRect(6, y, w - 12, 22); g.fillStyle = '#1b2433'; g.fillRect(8, y + 2, 60, 18);
      for (let x = 10; x < 64; x += 7) { g.fillStyle = ['#7FB6E8', '#B693C4', '#8DBF84', '#F2C88F', '#2a3a55'][(r() * 5) | 0]; g.fillRect(x, y + 5, 4, 12); }
      g.fillStyle = r() < 0.8 ? '#7FB6E8' : '#F0B44C'; g.fillRect(76, y + 8, 6, 6); g.fillStyle = '#2b3a52'; g.fillRect(88, y + 9, 26, 4); }
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8fb8ff'); gr.addColorStop(1, '#b693c4'); g.fillStyle = gr; g.fillRect(w - 6, 6, 3, h - 12); }));
  const morgueFace = CKIT.morgue || (CKIT.morgue = face(256, 64, (g, w, h) => { g.fillStyle = '#d8d6d0'; g.fillRect(0, 0, w, h); g.fillStyle = '#7E5C8E'; g.fillRect(8, 8, 60, 10); g.fillStyle = '#222'; g.font = `600 22px ${DISP}`; g.fillText('MORGUE', 80, 40); }));
  const dcFace = CKIT.dcBoard || (CKIT.dcBoard = face(512, 288, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); elbow(g, 10, 10, 50, 14, 220, 22, true, '#E05A50');
    g.fillStyle = '#E05A50'; g.font = `600 30px ${DISP}`; g.fillText('DAMAGE CONTROL · DECK 3', 72, 36);
    g.strokeStyle = '#D9B07E'; g.lineWidth = 6; g.beginPath(); g.arc(180, 160, 80, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(80, 160); g.lineTo(470, 160); g.moveTo(180, 60); g.lineTo(180, 260); g.stroke();
    [['FWD SHIELDS', 'NOMINAL', '#8DBF84'], ['HULL', 'NOMINAL', '#8DBF84'], ['LIFT 2', 'OFFLINE', '#F0B44C']].forEach(([a, b, c], i) => { g.fillStyle = '#D9B07E'; g.font = `500 22px ${DISP}`; g.fillText(a, 300, 214 + i * 26); g.fillStyle = c; g.fillText(b, 420, 214 + i * 26); }); }));
  const padFace = CKIT.pad || (CKIT.pad = face(64, 96, (g, w, h) => { g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h); g.fillStyle = '#E8A06A'; g.fillRect(6, 6, 30, 8); g.fillStyle = '#B693C4'; for (let y = 22; y < 86; y += 10) g.fillRect(8, y, 20 + ((y * 7) % 26), 4); }));
  // a photon torpedo: a turned casing (lathe) lying along x, nose to +x, a lit warhead band, four tail fins, a hazard ring
  const torpGeo = CKIT.torpGeo || (CKIT.torpGeo = (() => { const pts = [[0.0, -1.0], [0.1, -0.99], [0.15, -0.9], [0.19, -0.86], [0.23, -0.7], [0.25, -0.5], [0.25, 0.45], [0.235, 0.62], [0.19, 0.8], [0.11, 0.94], [0.0, 1.0]].map(([r, y]) => new THREE.Vector2(r, y));
    const g = new THREE.LatheGeometry(pts, 20); g.rotateZ(-Math.PI / 2); return g; })());
  const torpCase = CKIT.torpCase || (CKIT.torpCase = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.025, 0.03, 0.036), metalness: 0.5, roughness: 0.45, envMapIntensity: 0.6 }));
  const torpGlow = CKIT.torpGlow || (CKIT.torpGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1.0, 0.42, 0.22), toneMapped: false }));
  const torp = (y) => [P(torpGeo, torpCase, 0, y, 0), P(R(CYL(0.255, 0.255, 0.05, 28), 0, 0, Math.PI / 2), torpGlow, 0.52, y, 0), P(R(CYL(0.255, 0.255, 0.03, 28), 0, 0, Math.PI / 2), torpGlow, 0.62, y, 0),
    P(R(CYL(0.252, 0.252, 0.08, 28), 0, 0, Math.PI / 2), MAT.hazard, -0.55, y, 0), P(R(CYL(0.2, 0.2, 0.06, 20), 0, 0, Math.PI / 2), MAT.gunDark, -0.97, y, 0)]
    .concat([0, 1, 2, 3].map((k) => P(R(BOX(0.34, 0.02, 0.2), k * Math.PI / 2 + Math.PI / 4, 0, 0).translate(0, Math.cos(k * Math.PI / 2 + Math.PI / 4) * 0.2, Math.sin(k * Math.PI / 2 + Math.PI / 4) * 0.2), MAT.gun, -0.8, y, 0)));
  return {
    shgen: [P(CYL(2.0, 2.1, 0.2, 40), MAT.gunDark, 0, 0.1, 0), P(CYL(1.5, 1.5, 1.85, 40), casing, 0, 1.12, 0), P(CYL(1.53, 1.53, 0.32, 40), glow, 0, 1.3, 0), P(CYL(1.15, 1.5, 0.3, 40), MAT.gunDark, 0, 2.2, 0), P(R(new THREE.TorusGeometry(2.4, 0.04, 4, 64), Math.PI / 2), MAT.hazard, 0, 0.01, 0), P(R(new THREE.TorusGeometry(1.25, 0.03, 6, 40), Math.PI / 2), glow, 0, 2.36, 0)]
      .concat([0, 1, 2, 3, 4, 5].map((i) => { const a = i * Math.PI / 3; return P(BOX(0.14, 1.85, 0.22), MAT.gunDark, Math.sin(a) * 1.55, 1.12, Math.cos(a) * 1.55); })),
    console: [P(BOX(1.2, 0.85, 0.6), MAT.gunDark, 0, 0.425, 0), P(R(BOX(1.2, 0.05, 0.55), -0.45), MAT.gun, 0, 0.96, 0.02), P(R(new THREE.PlaneGeometry(1.0, 0.42), -Math.PI / 2 - 0.45), D3.screenMat, 0, 0.99, 0.03)],
    rack: [P(BOX(1.2, 2.45, 0.6), MAT.gunDark, 0, 1.225, -0.06), P(new THREE.PlaneGeometry(1.0, 2.1), rackFace, 0, 1.2, 0.245),
      P(BOX(1.2, 0.05, 0.05), CKIT.rackGlow || (CKIT.rackGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.55, 0.45, 1.0), toneMapped: false })), 0, 2.38, 0.36),
      P(BOX(1.2, 0.04, 0.05), CKIT.rackGlow, 0, 0.08, 0.36), P(BOX(1.24, 0.08, 0.76), MAT.gun, 0, 2.49, 0), P(BOX(0.05, 2.3, 0.05), MAT.gun, -0.58, 1.2, 0.36), P(BOX(0.05, 2.3, 0.05), MAT.gun, 0.58, 1.2, 0.36),
      P(BOX(1.1, 0.008, 0.06), CKIT.rackGlow, 0, 0.004, 0.62)],
    torprack: [P(BOX(0.12, 2.0, 0.66), MAT.gunDark, -1.28, 1.0, 0), P(BOX(0.12, 2.0, 0.66), MAT.gunDark, 1.28, 1.0, 0), P(BOX(2.6, 0.1, 0.66), MAT.gunDark, 0, 2.0, 0), P(BOX(2.5, 0.04, 0.5), MAT.gun, 0, 0.05, 0.02),
      P(BOX(0.02, 1.7, 0.02), torpGlow, -1.22, 1.0, 0.33), P(BOX(0.02, 1.7, 0.02), torpGlow, 1.22, 1.0, 0.33), P(BOX(2.3, 0.02, 0.02), CKIT.rackGlow || (CKIT.rackGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.55, 0.45, 1.0), toneMapped: false })), 0, 1.94, 0.33)]
      .concat([0.48, 1.18].flatMap((y) => [-0.6, 0.6].flatMap((x) => [P(BOX(0.16, 0.2, 0.56), MAT.gun, x, y, 0), P(R(new THREE.TorusGeometry(0.27, 0.025, 6, 20, Math.PI), 0, Math.PI / 2, Math.PI), MAT.steel, x, y + 0.34, 0)])),
        [0.48, 1.18].map((y) => P(BOX(2.44, 0.05, 0.12), MAT.gunDark, 0, y - 0.1, -0.24)), torp(0.82), torp(1.52)),
    hoist: [P(BOX(0.4, 0.28, 0.5), MAT.gunDark, 0, RH - 0.32, 0), P(CYL(0.01, 0.01, 0.6, 6), MAT.steel, 0, RH - 0.76, 0), P(BOX(0.3, 0.06, 0.06), MAT.hazard, 0, RH - 1.08, 0)],
    feed: [P(CYL(0.6, 0.6, RH, 24), MAT.gun, 0, RH / 2, 0), P(CYL(0.72, 0.72, 0.14, 24), MAT.hazard, 0, 0.07, 0), P(BOX(0.5, 0.7, 0.04), MAT.gunDark, 0, 1.3, 0.6)],
    locker: [P(BOX(0.6, 2.0, 0.5), MAT.panel, 0, 1.0, 0), P(BOX(0.01, 1.8, 0.01), MAT.gunDark, 0, 1.0, 0.252), ...[1.6, 1.68, 1.76].map((y) => P(BOX(0.36, 0.015, 0.01), MAT.gunDark, 0, y, 0.252)), P(BOX(0.04, 0.12, 0.03), MAT.steel, 0.2, 1.05, 0.26)],
    dcboard: [P(BOX(1.8, 1.0, 0.05), MAT.gunDark, 0, 1.5, 0.025), P(new THREE.PlaneGeometry(1.7, 0.9), dcFace, 0, 1.5, 0.052)],
    tank: [P(CYL(0.18, 0.18, 1.1, 16), red, 0, 0.55, 0), P(CYL(0.05, 0.05, 0.14, 8), MAT.steel, 0, 1.17, 0), P(BOX(0.42, 0.05, 0.08), MAT.gunDark, 0, 0.9, -0.16)],
    worktable: [P(BOX(1.6, 0.05, 0.8), MAT.steel, 0, 0.9, 0), P(BOX(1.5, 0.85, 0.7), MAT.panel, 0, 0.43, 0)],
    labbench: [P(BOX(1.82, 0.86, 0.64), MAT.panel, 0, 0.43, 0), P(BOX(1.86, 0.04, 0.7), CERAMIC, 0, 0.88, 0), P(BOX(1.86, 0.5, 0.03), CERAMIC, 0, 1.15, -0.34),
      P(BOX(0.3, 0.36, 0.32), MAT.panel, -0.5, 1.08, -0.1), P(CYL(0.05, 0.05, 0.22, 10), MAT.gunDark, -0.5, 1.33, -0.05), P(BOX(0.5, 0.32, 0.03), MAT.gunDark, 0.25, 1.12, -0.25), P(new THREE.PlaneGeometry(0.46, 0.28), D3.screenMat, 0.25, 1.12, -0.234)],
    labisland: [P(BOX(2.4, 0.86, 1.1), MAT.panel, 0, 0.43, 0), P(BOX(2.5, 0.04, 1.2), CERAMIC, 0, 0.88, 0), P(BOX(0.4, 0.05, 0.3), MAT.steel, 0.6, 0.9, 0)],
    cabinet: [P(BOX(0.9, 2.0, 0.5), MAT.panel, 0, 1.0, 0), P(new THREE.PlaneGeometry(0.8, 1.0), GLASS, 0, 1.45, 0.252), P(BOX(0.8, 0.02, 0.4), CERAMIC, 0, 1.2, 0.03), P(BOX(0.8, 0.02, 0.4), CERAMIC, 0, 1.6, 0.03)],
    morgue: [P(BOX(2.5, 2.1, 0.8), MAT.steel, 0, 1.05, 0)].concat([0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => P(BOX(0.76, 0.6, 0.02), MAT.panel, (c - 1) * 0.8, 0.45 + r * 0.66, 0.41))),
      [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => P(BOX(0.3, 0.03, 0.04), MAT.gunDark, (c - 1) * 0.8, 0.62 + r * 0.66, 0.43))), [P(new THREE.PlaneGeometry(0.8, 0.2), morgueFace, 0, 2.2, 0.401)]),
    stool: [P(CYL(0.19, 0.19, 0.05, 14), MAT.leather, 0, 0.68, 0), P(CYL(0.025, 0.025, 0.66, 8), MAT.steel, 0, 0.34, 0), P(CYL(0.2, 0.2, 0.02, 14), MAT.steel, 0, 0.01, 0)],
    slab: [P(BOX(0.8, 0.06, 2.0), MAT.steel, 0, 0.88, 0), P(CYL(0.08, 0.08, 0.82, 10), MAT.steel, 0, 0.42, 0), P(BOX(0.6, 0.04, 0.9), MAT.gunDark, 0, 0.02, 0)],
    roomlight: [P(BOX(1.2, 0.04, 0.5), MAT.steel, 0, -0.02, 0), P(R(new THREE.PlaneGeometry(1.08, 0.38), Math.PI / 2), downlightMat, 0, -0.045, 0)],
    mug: [P(CYL(0.04, 0.035, 0.09, 12), CERAMIC, 0, 0.045, 0), P(R(new THREE.TorusGeometry(0.025, 0.007, 6, 10), 0, Math.PI / 2), CERAMIC, 0.045, 0.05, 0)],
    pad: [P(BOX(0.16, 0.012, 0.22), MAT.gunDark, 0, 0.006, 0), P(R(new THREE.PlaneGeometry(0.14, 0.2), -Math.PI / 2), padFace, 0, 0.013, 0)],
    case: [P(BOX(0.45, 0.12, 0.32), caseMat, 0, 0.06, 0), P(BOX(0.16, 0.03, 0.03), MAT.gunDark, 0, 0.135, 0)],
  };
}

// ---------- sickbay (roadmap D2): the deck's hero room ----------
// Built from the shared layout (shipSickbayLayout, the same one the floor plan and its check use): white panel walls
// with a teal band, a pale polished floor; eight biobeds round the curved wall, each with its wall panel (a live-looking
// readout) and a bedside cabinet; the glass-walled surgery in the middle (operating table under a lamp ring, two
// consoles), the isolation room and the CMO's office in glass; staff station, stores, replicator; ceiling lights (one
// light space in d3Light). Glass walls, frames and trim are merged into the deck's room meshes; fittings are instanced.
// Returns the fittings' kits (d3Cabins instances them with the rest).
function d3Sickbay(Lt, C) {
  const { shell, put, place, RH } = C, s = Lt.F.spaces.find((q) => q.n === 'Sickbay'), Lay = s && shipSickbayLayout(s); if (!Lay) return {};
  const W = (p) => [p[1], p[0] - 64], Wd = (f) => [f[1], f[0]], neg = (v) => [-v[0], -v[1]];
  // materials (kept on CKIT so a rebuild reuses them)
  const white = CKIT.medWhite || (CKIT.medWhite = new THREE.MeshStandardMaterial({ color: 0xdfe4e4, roughness: 0.38, metalness: 0.04, envMapIntensity: 0.7 }));
  const teal = CKIT.medTeal || (CKIT.medTeal = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.03, 0.3, 0.28), roughness: 0.45, metalness: 0.05, envMapIntensity: 0.5 }));
  const tealCloth = CKIT.medCloth || (CKIT.medCloth = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.05, 0.26, 0.25), roughness: 0.95 }));
  const glow = CKIT.medGlow || (CKIT.medGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.35, 0.95, 0.9), toneMapped: false }));
  const glass = CKIT.medGlass || (CKIT.medGlass = Object.assign(GLASS.clone(), { side: THREE.DoubleSide, opacity: 0.13 }));
  const floor = CKIT.medFloor || (CKIT.medFloor = (() => { const c = cnv(256, 256), g = c.getContext('2d'); g.fillStyle = '#d4d9d8'; g.fillRect(0, 0, 256, 256);
    const r = mulberry(61); for (let i = 0; i < 2500; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.035)'; g.fillRect(r() * 256, r() * 256, 1.5, 1.5); }
    g.fillStyle = 'rgba(70,90,92,0.35)'; g.fillRect(0, 0, 256, 2); g.fillRect(0, 0, 2, 256); g.fillStyle = 'rgba(70,90,92,0.15)'; g.fillRect(0, 127, 256, 1); g.fillRect(127, 0, 1, 256);
    const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return new THREE.MeshStandardMaterial({ map: t, roughness: 0.3, metalness: 0.02, envMapIntensity: 0.55 }); })());
  const wallMat = CKIT.medWall || (CKIT.medWall = roomWallMat(RH, 'med'));
  const face = (w, h, draw) => { const c = cnv(w, h), g = c.getContext('2d'); draw(g, w, h); return new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }); };
  const bioFace = CKIT.bioFace || (CKIT.bioFace = face(256, 144, (g, w, h) => { g.fillStyle = '#020708'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a9d97'; g.fillRect(8, 8, 70, 14); g.fillStyle = '#9fe3dc'; g.font = `600 15px ${DISP}`; g.fillText('BIOBED', 86, 21);
    [['#7fe0d6', 44], ['#E8A06A', 76], ['#B693C4', 108]].forEach(([c, y], k) => { g.strokeStyle = c; g.lineWidth = 2; g.beginPath();
      for (let x = 10; x < 180; x += 2) { const t = (x + k * 17) % 46; const v = k === 0 ? (t < 3 ? -16 : t < 5 ? 10 : 0) : Math.sin(x * (0.11 + k * 0.05)) * 7; g.lineTo(x, y + v); } g.stroke(); });
    [['72', '#7fe0d6'], ['98', '#E8A06A'], ['36.8', '#B693C4']].forEach(([t, c], k) => { g.fillStyle = c; g.font = `600 22px ${DISP}`; g.fillText(t, 192, 52 + k * 32); }); }));
  const conFace = CKIT.surgFace || (CKIT.surgFace = face(256, 128, (g, w, h) => { g.fillStyle = '#020708'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a9d97'; g.fillRect(6, 6, 60, 12); g.fillStyle = '#9fe3dc'; g.font = `600 13px ${DISP}`; g.fillText('SURGICAL FIELD', 72, 17);
    g.strokeStyle = '#7fe0d6'; g.lineWidth = 2; g.strokeRect(14, 30, 110, 88); g.beginPath(); g.ellipse(69, 74, 22, 36, 0, 0, Math.PI * 2); g.stroke();
    [0, 1, 2, 3].forEach((i) => { g.fillStyle = ['#E8A06A', '#B693C4', '#7fe0d6', '#F2C88F'][i]; g.fillRect(140, 34 + i * 21, 30 + i * 18, 12); }); }));
  const { dd, wp } = shell(s, floor, wallMat);
  const lights = [], seg = (A, B) => kitSeg(D3, A[0], A[1], B[0], B[1], 0.2);
  // a box of length L along direction u (world [x, z]) centred at p, height h from y0, depth d
  const bar = (mat, p, u, L, y0, h, d) => { const g = BOX(L, h, d); g.rotateY(-Math.atan2(u[1], u[0])); g.translate(p[0], y0 + h / 2, p[1]); put(mat, g); };
  const quad = (mat, A, B, y0, y1) => { const u = [B[0] - A[0], B[1] - A[1]], L = Math.hypot(...u); put(mat, kitQuad([[A[0], y0, A[1]], [B[0], y0, B[1]], [B[0], y1, B[1]], [A[0], y1, A[1]]], [[0, 0], [L, 0], [L, y1 - y0], [0, y1 - y0]], [-u[1] / L, 0, u[0] / L])); };
  // ---------- glass rooms: a white frame (kick, header, posts), full-height glass, a teal line at hand height, a
  // doorway with its glass door slid open beside it; edges along the room's own walls get no glass
  const nearWall = (p) => wp.some((A, i) => { const B = wp[(i + 1) % wp.length], L2 = (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2, t = Math.max(0, Math.min(1, ((p[0] - A[0]) * (B[0] - A[0]) + (p[1] - A[1]) * (B[1] - A[1])) / L2));
    return Math.hypot(A[0] + t * (B[0] - A[0]) - p[0], A[1] + t * (B[1] - A[1]) - p[1]) < 0.3; });
  const glassRooms = [];
  Lay.items.filter((q) => q.glass).forEach((q) => {
    const P = q.poly.map(W), inn = W(q.c), edges = [];
    for (let i = 0; i < 4; i++) { const A = P[i], B = P[(i + 1) % 4], M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; if (nearWall(M)) continue;
      const L = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], hole = i === 0 ? q.w / 2 - q.door : null; // edge 0 is the front, corner 0 at +w/2
      let nn = [-u[1], u[0]]; if ((inn[0] - A[0]) * nn[0] + (inn[1] - A[1]) * nn[1] < 0) nn = neg(nn); // nn: into the glass room
      const at = (t) => [A[0] + u[0] * t, A[1] + u[1] * t], runs = hole === null ? [[0, L]] : [[0, hole - 0.6], [hole + 0.6, L]];
      runs.forEach(([a, b]) => { if (b - a < 0.05) return; quad(glass, at(a), at(b), 0.1, RH - 0.12); bar(white, at((a + b) / 2), u, b - a, 0, 0.1, 0.09); seg(at(a), at(b));
        [-1, 1].forEach((k) => bar(glow, [at((a + b) / 2)[0] + nn[0] * k * 0.006, at((a + b) / 2)[1] + nn[1] * k * 0.006], u, b - a - 0.04, 1.07, 0.035, 0.002)); });
      bar(white, at(L / 2), u, L + 0.08, RH - 0.12, 0.12, 0.1);
      const posts = [0, L]; if (hole !== null) posts.push(hole - 0.6, hole + 0.6); for (const [a, b] of runs) { const n = Math.floor((b - a) / 1.6); for (let k = 1; k <= n; k++) posts.push(a + (b - a) * k / (n + 1)); }
      posts.forEach((t) => bar(white, at(t), u, 0.06, 0, RH, 0.09));
      if (hole !== null) { quad(glass, at(hole - 0.6), at(hole + 0.6), 2.3, RH - 0.12); bar(white, at(hole), u, 1.2, 2.24, 0.06, 0.09);
        // the door, slid open inside the room over the glass beside the doorway
        const side = hole + 1.2 <= L - 0.05 ? 1 : -1, d0 = at(hole + side * 0.6), d1 = at(hole + side * 1.8), o = (p) => [p[0] + nn[0] * 0.07, p[1] + nn[1] * 0.07];
        quad(glass, o(d0), o(d1), 0.04, 2.26); bar(white, o(at(hole + side * 1.2)), u, 1.2, 2.24, 0.04, 0.03); bar(white, o(at(hole + side * 0.62)), u, 0.04, 0.04, 2.22, 0.03); bar(white, o(at(hole + side * 1.78)), u, 0.04, 0.04, 2.22, 0.03);
        edges.push({ door: at(hole), out: neg(nn) }); }
    }
    glassRooms.push({ q, door: edges[0] });
  });
  // ---------- fittings
  const KK = { bed: 'biobed', bedhead: 'bedhead', bedside: 'bedside', optable: 'optable', lamp: 'oplamp', surgcon: 'surgcon', station: 'medstation', desk: 'cmodesk', chair: 'chair', medcab: 'medcab', replicator: 'replicator' };
  const box4 = (q) => { const P = q.poly.map(W); for (let i = 0; i < 4; i++) seg(P[i], P[(i + 1) % 4]); };
  Lay.items.forEach((q) => { const k = KK[q.k]; if (!k) return; const c = W(q.c), f = Wd(q.f);
    place(k, c[0], c[1], f, q.k === 'lamp' ? RH : 0);
    if (q.k === 'bed') [-0.5, 0.5].forEach((o) => kitObs(D3, c[0] + f[0] * o, c[1] + f[1] * o, 0.5));
    else if (/optable|surgcon|station|desk|replicator/.test(q.k)) box4(q);
    else if (q.k === 'medcab' || q.k === 'bedside') kitObs(D3, c[0], c[1], q.k === 'medcab' ? 0.36 : 0.28); });
  // signs over the glass doors, on the ward side
  glassRooms.forEach(({ q, door }) => { if (!door) return; const t = { surgery: 'SURGERY', isolation: 'ISOLATION', office: 'CMO' }[q.k];
    kitLabel(D3, t, door.door[0] + door.out[0] * 0.07, RH - 0.3, door.door[1] + door.out[1] * 0.07, Math.atan2(door.out[0], door.out[1]), t.length > 4 ? 0.62 : 0.4); });
  // ---------- ceiling lights: round the ward between the surgery and the beds, the alcove, each glass room
  const L = (p, k) => { place('roomlight', p[0], p[1], [0, 1], RH); lights.push([p[0], RH - 0.05, p[1], k]); };
  [24, 38, 52, 66, 80].forEach((t) => L(W(Lay.at(13.0, t)), 1.3));
  [W(Lay.at(6.5, 80)), W([64.4, -3.0])].forEach((p) => L(p, 1.2));
  glassRooms.forEach(({ q }) => { if (q.k !== 'surgery') L(W(q.c), q.k === 'office' ? 1.1 : 1.2); });
  { const c = W(Lay.items.find((q) => q.k === 'surgery').c); lights.push([c[0], RH - 0.5, c[1], 3.2]); }
  // a light band hung round the ward, following the curved wall over the foot of the beds
  { const r = 14.2, t0 = 18, t1 = 84, n = 22; for (let i = 0; i < n; i++) { const A = W(Lay.at(r, t0 + (t1 - t0) * i / n)), B = W(Lay.at(r, t0 + (t1 - t0) * (i + 1) / n)), M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], u = [B[0] - A[0], B[1] - A[1]], l = Math.hypot(...u);
    bar(white, M, u, l + 0.01, RH - 0.06, 0.06, 0.26); bar(downlightMat, M, u, l + 0.01, RH - 0.075, 0.015, 0.18); bar(glow, M, u, l + 0.01, RH - 0.1, 0.012, 0.03);
    if (i % 2) lights.push([M[0], RH - 0.1, M[1], 0.45]); } } // the band lights the bed feet
  // ---------- the room in the deck's lists: a light space, the readout, its door open, its panel
  const xs = wp.map((p) => p[0]), zs = wp.map((p) => p[1]), entry = { s, kind: 'sickbay', wpoly: wp, bb: [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)], lights, glassRooms };
  D3.fitted.push(entry); D3.sickbay = entry;
  const inP = (P, x, z) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [ax, az] = P[i], [bx, bz] = P[j]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) c = !c; } return c; };
  const sub = { surgery: 'Sickbay · surgery', isolation: 'Sickbay · isolation', office: 'Sickbay · CMO’s office' };
  D3.rooms.unshift({ label: 'Sickbay', test: (x, z) => inP(wp, x, z) });
  glassRooms.forEach(({ q }) => { const P = q.poly.map(W); D3.rooms.unshift({ label: sub[q.k], test: (x, z) => inP(P, x, z) }); });
  const door = DOORS.find((q) => q.station === 'd3:' + s.id); if (door) door.auto = true;
  STATIONS['d3:' + s.id] = { title: 'Sickbay ' + s.id, role: 'Deck 3', panel: () => ({ read: [['Ward', 'Eight biobeds'], ['Also', 'Surgery, isolation room, the CMO’s office, staff station, stores']],
    note: 'Walk up to the door to go in.', acts: [] }) };
  // ---------- the kits: +z faces out from the wall into the room (beds: +z toward the foot)
  const Pp = (g, mat, x, y, z) => { const q = g.clone(); q.translate(x, y, z); return { geo: q, mat }; }, R = (g, rx, ry) => { const q = g.clone(); if (rx) q.rotateX(rx); if (ry) q.rotateY(ry); return q; };
  const flat = (w, h) => new THREE.PlaneGeometry(w, h);
  return {
    biobed: [Pp(RBOX(0.62, 0.42, 1.5, 0.05), white, 0, 0.21, 0), Pp(BOX(0.64, 0.04, 1.52), teal, 0, 0.4, 0), Pp(RBOX(0.96, 0.08, 2.06, 0.03), white, 0, 0.46, 0),
      Pp(RBOX(0.88, 0.12, 1.96, 0.05), CERAMIC, 0, 0.56, 0), Pp(RBOX(0.92, 0.04, 0.95, 0.02), tealCloth, 0, 0.63, 0.48), Pp(RBOX(0.56, 0.09, 0.32, 0.04), CERAMIC, 0, 0.66, -0.78),
      Pp(BOX(0.025, 0.035, 0.9), MAT.steel, 0.47, 0.76, 0.05), Pp(BOX(0.025, 0.035, 0.9), MAT.steel, -0.47, 0.76, 0.05),
      ...[-0.35, 0.45].flatMap((z) => [0.47, -0.47].map((x) => Pp(CYL(0.012, 0.012, 0.22, 6), MAT.steel, x, 0.64, z)))],
    bedhead: [Pp(RBOX(1.3, 0.95, 0.06, 0.02), white, 0, 1.45, 0), Pp(flat(0.86, 0.48), bioFace, 0, 1.5, 0.032), Pp(BOX(1.2, 0.03, 0.02), glow, 0, 0.99, 0.03), Pp(BOX(1.3, 0.05, 0.08), teal, 0, 1.95, 0.01)],
    bedside: [Pp(RBOX(0.48, 0.72, 0.42, 0.02), white, 0, 0.36, 0), Pp(BOX(0.5, 0.03, 0.44), teal, 0, 0.735, 0), Pp(BOX(0.3, 0.015, 0.01), MAT.steel, 0, 0.55, 0.212)],
    optable: [Pp(RBOX(0.7, 0.05, 0.9, 0.02), white, 0, 0.025, 0), Pp(CYL(0.16, 0.22, 0.72, 20), white, 0, 0.41, 0), Pp(RBOX(0.64, 0.08, 2.0, 0.03), white, 0, 0.81, 0), Pp(RBOX(0.58, 0.06, 1.9, 0.03), tealCloth, 0, 0.88, 0)],
    oplamp: [Pp(CYL(0.03, 0.03, 0.42, 8), MAT.steel, 0, -0.21, 0), Pp(R(new THREE.TorusGeometry(0.55, 0.06, 10, 40), Math.PI / 2), white, 0, -0.45, 0), Pp(R(new THREE.CircleGeometry(0.5, 32), Math.PI / 2), downlightMat, 0, -0.47, 0),
      Pp(R(new THREE.TorusGeometry(0.56, 0.012, 6, 40), Math.PI / 2), glow, 0, -0.51, 0)],
    surgcon: [Pp(RBOX(1.0, 0.85, 0.5, 0.02), white, 0, 0.425, 0), Pp(BOX(1.0, 0.06, 0.46), teal, 0, 0.03, 0.02), Pp(R(RBOX(1.0, 0.05, 0.5, 0.015), -0.45), white, 0, 0.96, 0.02), Pp(R(flat(0.86, 0.38), -Math.PI / 2 - 0.45), conFace, 0, 0.99, 0.03)],
    medstation: [Pp(RBOX(2.2, 0.95, 0.62, 0.02), white, 0, 0.475, -0.02), Pp(BOX(2.18, 0.1, 0.58), teal, 0, 0.05, 0), Pp(RBOX(2.24, 0.04, 0.7, 0.015), CERAMIC, 0, 0.97, 0), Pp(BOX(2.1, 0.025, 0.02), glow, 0, 0.8, 0.31),
      ...[-0.55, 0.55].flatMap((x) => [Pp(RBOX(0.62, 0.42, 0.04, 0.01), MAT.gunDark, x, 1.25, -0.24), Pp(flat(0.56, 0.36), x < 0 ? bioFace : D3.screenMat, x, 1.25, -0.218)])],
    cmodesk: [Pp(RBOX(1.5, 0.04, 0.65, 0.015), white, 0, 0.74, 0), Pp(RBOX(0.42, 0.72, 0.6, 0.015), white, 0.5, 0.36, 0), Pp(RBOX(0.04, 0.72, 0.6, 0.01), white, -0.72, 0.36, 0), Pp(BOX(1.4, 0.04, 0.02), teal, 0, 0.7, 0.32),
      Pp(RBOX(0.55, 0.34, 0.03, 0.01), MAT.gunDark, -0.15, 1.0, -0.2), Pp(flat(0.5, 0.3), D3.screenMat, -0.15, 1.0, -0.184)],
    medcab: [Pp(RBOX(0.88, 2.0, 0.48, 0.015), white, 0, 1.0, 0), Pp(flat(0.78, 1.05), glass, 0, 1.4, 0.245), Pp(BOX(0.78, 0.02, 0.4), CERAMIC, 0, 1.15, 0.02), Pp(BOX(0.78, 0.02, 0.4), CERAMIC, 0, 1.55, 0.02),
      ...[1.17, 1.57].flatMap((y) => [-0.22, 0, 0.22].map((x) => Pp(RBOX(0.14, 0.12, 0.12, 0.02), x ? CERAMIC : tealCloth, x, y + 0.07, 0.02))), Pp(BOX(0.86, 0.06, 0.02), teal, 0, 0.84, 0.245), Pp(BOX(0.012, 0.6, 0.012), MAT.steel, 0.36, 0.5, 0.25)],
    replicator: [Pp(RBOX(1.0, 2.1, 0.58, 0.02), white, 0, 1.05, -0.01), Pp(BOX(0.72, 0.56, 0.04), MAT.gunDark, 0, 1.2, 0.27), Pp(flat(0.66, 0.5), glow, 0, 1.2, 0.292), Pp(BOX(0.98, 0.08, 0.02), teal, 0, 0.6, 0.285)],
  };
}

// From inside a fitted room you see the corridor only through the room's own door, so the far doors' own parts
// (leaves, frames, labels and their text: what batch.js can't merge, about eight draws a door) are hidden while you are
// in a room. render.js calls this every frame on Deck 3; it only changes anything when you move into or out of a room.
function d3Cull(p) {
  if (!D3.fitted) return; const x = p.x, z = p.z; let room = null;
  for (const f of D3.fitted) { const b = f.bb; if (x > b[0] && x < b[1] && z > b[2] && z < b[3]) { const P = f.wpoly; let c = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [ax, az] = P[i], [bx, bz] = P[j]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) c = !c; } if (c) { room = f; break; } } }
  if (room === D3.cullRoom) return; D3.cullRoom = room;
  D3.doorObjs = D3.doorObjs || DOORS.filter((d) => d.deck === 3 && d.station !== 'lift').map((d) => ({ g: d.L.parent, x: d.wx, z: d.wz }));
  const dd = room && D3.doors.find((q) => q.s === room.s);
  D3.doorObjs.forEach((o) => { o.g.visible = !dd || Math.hypot(o.x - dd.x, o.z - dd.z) < 7; });
}

// Red alert (roadmap polish): every corridor band glows red in time with the bridge's strip pulse (one material, so one
// update a frame), and the bands beside the magazines turn hard red (their copies recoloured once, when the alert
// changes). render.js calls this every frame; k is the pulse (0..1).
const _d3c = new THREE.Color();
function d3Alert(red, k) {
  const B = CKIT.band; if (!B || !D3.mods) return;
  if (red) { B.emissive.setRGB(1, 0.05, 0.03); B.emissiveIntensity = 0.12 + 0.88 * k; } else if (B.emissiveIntensity) B.emissiveIntensity = 0;
  if (D3.redBands === red) return; D3.redBands = red;
  D3.mods.forEach((im) => { const L = im.userData.bandMods; if (!L) return; let ch = false;
    L.forEach((d, i) => { if (!d.mag) return; im.setColorAt(i, _d3c.set(red ? 0xff1a10 : (d.band || 0xD9B07E)).convertSRGBToLinear()); ch = true; });
    if (ch) im.instanceColor.needsUpdate = true; });
}

````

---

## `js/lighting.js`

````javascript
// USS Defiance · lighting.js
// Stage 1: the ship is lit by its own fixtures through the bake (bake.js). There are no fill lights.
// The one live light is the viewscreen glow, which only brightens the bridge during warp.
// If the bake files cannot load, fallbackLights() restores the old Stage 0 rig so the ship is never dark.
// Files share one global scope and load in order (see index.html).
'use strict';

const lScreen = add(new THREE.PointLight(0x9fc0ff, 0, 7, 0.53)); lScreen.position.set(0, 1.9, FWD_Z + 1.0);
const FALLBACK = { lights: [], base: [] };
function fallbackLights() {
  if (FALLBACK.lights.length) return;
  // Stage 0 values; three.js now uses physical light units, so they carry the old conversion factors.
  const A = Math.PI, P = Math.PI * 0.75;
  const hemi = add(new THREE.HemisphereLight(0xfff0e0, 0x2a2018, 0.1 * A));
  const c = add(new THREE.SpotLight(0xffe2c4, 1.3 * P, 12, 0.95, 0.85, 0.4)); c.position.set(0, 3.25, 0.4);
  c.target.position.set(0, 0, 0.2); scene.add(c.target);
  c.castShadow = true; c.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048); c.shadow.bias = -0.0006; c.shadow.normalBias = 0.02; c.shadow.radius = 4; c.shadow.camera.near = 0.3; c.shadow.camera.far = 8;
  const f = add(new THREE.PointLight(0xffdcb4, 0.34 * P, 6.5, 0.5)); f.position.set(0, 2.9, -3.0);
  const a = add(new THREE.PointLight(0xffdcb4, 0.34 * P, 6.5, 0.5)); a.position.set(0, 2.9, 3.5);
  ROOMS.forEach((r) => { const L = add(new THREE.PointLight(0xffdcb8, r.base * 1.25 * P, 6.5, 0.53)); L.position.copy(r.lightPos); FALLBACK.lights.push(L); FALLBACK.base.push(r.base * 1.25 * P); });
  [hemi, c, f, a].forEach((l) => { FALLBACK.lights.push(l); FALLBACK.base.push(l.intensity); });
  renderer.shadowMap.enabled = true;
}
function fallbackApply(k, A) { FALLBACK.lights.forEach((l, i) => { l.intensity = FALLBACK.base[i] * k; if (!l.isHemisphereLight) l.color.setHex(A.light); }); }

````

---

## `js/bake.js`

````javascript
// USS Defiance · bake.js
// Baked light. The ship's fixtures (downlights, ceiling discs, cove slots, deck strips, screens) were rendered
// ahead of time in Blender with tools/bake_lighting.py, light bouncing included:
//   - flat room surfaces (floors, walls, ceilings) carry a light map: one image laid out like a sewing pattern;
//   - everything else reads a light-probe grid: points every 30 cm that recorded the light arriving from six directions.
// Two layers are stored: W (every fixture except the deck strips) and S (the deck strips alone, in white), so light
// level and alert colour can be changed live without re-baking. Each deck has its own bake (roadmap F4):
// bake/d<n>/lm_w.png, lm_s.png, pr_w.png, pr_s.png and bake.json, its own light-map layout and its own probe grid, so
// changing one deck never re-bakes another. Every built deck's files load at start-up; the lift switches the shared
// uniforms (BKU) to the deck you arrive on (bakeUse).
// Files share one global scope and load in order (see index.html).
'use strict';

const BAKE = { ok: false, receivers: [], atlas: null, failed: false, decks: {}, cur: 0, meta: null }; // decks[n]: { receivers, atlas, ok }
const BKD = {}; // each deck's loaded bake: { meta, lmW, lmS, pr }
const BKU = {
  bkW: { value: new THREE.Color(0, 0, 0) }, bkS: { value: new THREE.Color(0, 0, 0) }, bkIbl: { value: 1 },
  bkLmW: { value: null }, bkLmS: { value: null }, bkLmMax: { value: new THREE.Vector2(1, 1) },
  bkPr: { value: null }, bkPrMin: { value: new THREE.Vector3() }, bkPrInv: { value: 1 }, bkPrDim: { value: new THREE.Vector3(1, 1, 1) }, bkPrMax: { value: new THREE.Vector2(1, 1) },
};

// ---------- which surfaces get a light map: big flat opaque surfaces of the fixed rooms ----------
const PLANAR = { PlaneGeometry: 1, ShapeGeometry: 1, CircleGeometry: 1 };
// shown, not counting a deck's own group (a deck is laid out while it is still hidden, as the lift heads there)
function bakeLive(o) { for (let p = o; p; p = p.parent) if (!p.visible && !(p.parent === scene && Object.values(DECKS).some((d) => d.n !== 1 && d.root() === p))) return false; return true; }
function isReceiver(o) {
  if (o.userData.probeLit) return false; // a deck lit by its own computed probes only (deck3.js)
  if (!o.isMesh || o.layers.mask !== 1 || !PLANAR[o.geometry.type] || Array.isArray(o.material)) return false;
  const m = o.material; if (!m.isMeshStandardMaterial || m.transparent || !bakeLive(o)) return false;
  o.geometry.computeBoundingBox(); const s = new THREE.Vector3(); o.geometry.boundingBox.getSize(s);
  return s.x * s.y + s.y * s.z + s.x * s.z > 0.25;
}
// One deck's meshes: deck n's group, or for Deck 1 everything that is not another deck's group (nor the lift, whose
// materials carry their own light). fn(o) for each object.
function bakeWalk(n, fn) {
  const others = new Set(); Object.values(DECKS).forEach((d) => { if (d.n !== n) { const r = d.n === 1 ? null : d.root(); if (r) others.add(r); } });
  if (typeof LIFT !== 'undefined') [LIFT.root, LIFT.stub].forEach((g) => others.add(g));
  const top = n === 1 ? ((typeof LIFT !== 'undefined' && LIFT.deck1) || scene) : deckOf(n).root();
  (function walk(o) { if (others.has(o)) return; fn(o); o.children.forEach(walk); })(top);
}
// Lay deck n's receivers out in its own atlas. Coplanar pieces (a wall split by a door) share one rectangle.
// Deterministic: the same deck always gives the same layout, which the bake tool relies on.
function buildAtlas(dn) {
  scene.updateMatrixWorld(true);
  const groups = new Map(), list = [], seenGeo = new Set(), PAD = 3, AW = 2048;
  bakeWalk(dn, (o) => { if (isReceiver(o) && !(typeof EXTSET !== 'undefined' && EXTSET && o.parent && bakeUnder(o, EXTSET))) list.push(o); });
  const nm = new THREE.Matrix3(), n = new THREE.Vector3(), p = new THREE.Vector3();
  list.forEach((o) => {
    if (seenGeo.has(o.geometry)) o.geometry = o.geometry.clone(); seenGeo.add(o.geometry);
    const pos = o.geometry.attributes.position, nrm = o.geometry.attributes.normal;
    nm.getNormalMatrix(o.matrixWorld); n.fromBufferAttribute(nrm, 0).applyMatrix3(nm).normalize();
    p.fromBufferAttribute(pos, 0).applyMatrix4(o.matrixWorld);
    const key = [n.x, n.y, n.z].map((v) => Math.round(v * 40)).join(',') + ',' + Math.round(n.dot(p) * 50);
    let g = groups.get(key);
    if (!g) {
      let u, v;
      if (Math.abs(n.y) > 0.7) { u = new THREE.Vector3(1, 0, 0); v = new THREE.Vector3(0, 0, 1); }
      else { u = new THREE.Vector3(-n.z, 0, n.x).normalize(); v = new THREE.Vector3(0, 1, 0); }
      g = { u, v, dens: n.y > 0.7 ? 40 : n.y < -0.7 ? 16 : 32, a0: 1e9, a1: -1e9, b0: 1e9, b1: -1e9, items: [] };
      groups.set(key, g);
    }
    const ab = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      const a = p.dot(g.u), b = p.dot(g.v); ab[i * 2] = a; ab[i * 2 + 1] = b;
      g.a0 = Math.min(g.a0, a); g.a1 = Math.max(g.a1, a); g.b0 = Math.min(g.b0, b); g.b1 = Math.max(g.b1, b);
    }
    g.items.push({ o, ab });
  });
  const G = [...groups.values()];
  G.forEach((g, i) => { g.i = i; g.w = Math.ceil((g.a1 - g.a0) * g.dens) + 2 * PAD; g.h = Math.ceil((g.b1 - g.b0) * g.dens) + 2 * PAD; });
  const order = G.slice().sort((a, b) => b.h - a.h || a.i - b.i);
  let x = 0, y = 0, rowH = 0;
  order.forEach((g) => { if (x + g.w > AW) { x = 0; y += rowH; rowH = 0; } g.x = x; g.y = y; x += g.w; rowH = Math.max(rowH, g.h); });
  const AH = Math.ceil((y + rowH) / 4) * 4;
  G.forEach((g) => g.items.forEach(({ o, ab }) => {
    const uv = new Float32Array(ab.length);
    for (let i = 0; i < ab.length; i += 2) {
      uv[i] = (g.x + PAD + (ab[i] - g.a0) * g.dens) / AW;
      uv[i + 1] = (g.y + PAD + (ab[i + 1] - g.b0) * g.dens) / AH;
    }
    o.geometry.setAttribute('uvLM', new THREE.BufferAttribute(uv, 2));
  }));
  const atlas = { w: AW, h: AH, rects: G.length, sig: G.map((g) => g.w + 'x' + g.h).join(';').length + ':' + list.length };
  BAKE.decks[dn] = { receivers: list, atlas, ok: false };
  BAKE.receivers = BAKE.receivers.concat(list); // every deck's, for batch.js
  if (dn === 1) BAKE.atlas = atlas;
}
function bakeUnder(o, g) { for (let p = o; p; p = p.parent) if (p === g) return true; return false; }

// ---------- shaders: add baked light to three.js's standard material ----------
const BK_IBL_LINE = 'iblIrradiance += getIBLIrradiance( geometryNormal );';
const BK_DECL = `uniform sampler2D bkLmW, bkLmS; uniform vec2 bkLmMax; uniform vec3 bkW, bkS; uniform float bkIbl;
uniform highp sampler3D bkPr; uniform vec3 bkPrMin, bkPrDim; uniform float bkPrInv; uniform vec2 bkPrMax;
vec4 bkCube(vec3 q, float f) { vec4 c = texture(bkPr, vec3((q.x + f * bkPrDim.x) / (6.0 * bkPrDim.x), q.y / bkPrDim.y, q.z / bkPrDim.z)); return c * c; }
// ambient cube: one sample per axis, chosen by the sign of the normal, weighted by the normal squared
vec4 bkProbe(vec3 q, vec3 n) { vec3 n2 = n * n; return n2.x * bkCube(q, n.x >= 0.0 ? 0.0 : 1.0) + n2.y * bkCube(q, n.y >= 0.0 ? 2.0 : 3.0) + n2.z * bkCube(q, n.z >= 0.0 ? 4.0 : 5.0); }
float bkLum(vec4 e) { return dot(e.rgb, vec3(0.3, 0.55, 0.15)) * bkPrMax.x + e.a * bkPrMax.y * 0.3; }
`;
const BK_ADD = {
  // light map; the probes add direction, so bump detail on floors and walls is lit from where the fixtures really are
  lm: `{ vec3 w = texture2D(bkLmW, vBkLM).rgb; float s = texture2D(bkLmS, vBkLM).r;
  vec3 base = w * w * bkLmMax.x * bkW + s * s * bkLmMax.y * bkS;
  #ifdef USE_NORMALMAP
  vec3 nP = normalize((vec4(normal, 0.0) * viewMatrix).xyz), nF = normalize((vec4(flatN, 0.0) * viewMatrix).xyz);
  vec3 q = clamp((vWP + nF * 0.15 - bkPrMin) * bkPrInv + 0.5, vec3(0.5), bkPrDim - 0.5);
  base *= clamp((bkLum(bkProbe(q, nP)) + 1e-4) / (bkLum(bkProbe(q, nF)) + 1e-4), 0.35, 2.0);
  #endif
  irradiance += base; }`,
  pr: `{ vec3 nW = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
  vec3 p = (vWP + nW * 0.1 - bkPrMin) * bkPrInv + 0.5, q = clamp(p, vec3(0.5), bkPrDim - 0.5);
  float inside = 1.0 - smoothstep(0.5, 1.5, distance(p, q));
  vec4 e = bkProbe(q, nW);
  irradiance += inside * (e.rgb * bkPrMax.x * bkW + e.a * bkPrMax.y * bkS); }`,
};
function bakePatch(m, mode) {
  if (m.userData.bk) return; m.userData.bk = mode;
  const chunk = THREE.ShaderChunk.lights_fragment_maps.replace(BK_IBL_LINE, 'iblIrradiance += getIBLIrradiance( geometryNormal ) * bkIbl;');
  patchMat(m, 'bk-' + mode, {
    world: true, uniforms: BKU, decl: BK_DECL + (mode === 'lm' ? 'varying vec2 vBkLM;' : ''),
    vdecl: mode === 'lm' ? 'attribute vec2 uvLM; varying vec2 vBkLM;\n' : '', vert: mode === 'lm' ? 'vBkLM = uvLM;\n' : '',
    replace: { lights_fragment_maps: '#if defined( RE_IndirectDiffuse )\n' + BK_ADD[mode] + '\n#endif\n' + chunk },
  });
}

// ---------- live controls: light level, alert colour, red-alert strip pulse ----------
const _bkT = new THREE.Color(), _bkG = new THREE.Color(ALERTS.green.light);
function bakeLevels(k, alert, stripHex, stripK) {
  if (!BAKE.ok) return;
  const sc = BAKE.meta.exposure;
  _bkT.setHex(ALERTS[alert].light); BKU.bkW.value.setRGB(_bkT.r / _bkG.r, _bkT.g / _bkG.g, _bkT.b / _bkG.b).multiplyScalar(k * sc);
  BKU.bkS.value.setHex(stripHex).multiplyScalar(stripK * sc * BAKE.meta.strip);
}

// ---------- reflections: photograph the baked room once and use it as the environment ----------
// One snapshot per deck, taken from the deck registry's envAt point (decks.js) the first time you are on it, so Deck 2's
// metal and glass reflect Deck 2, not the bridge. The current deck's and the last one's are kept; older ones are freed.
const _env = new Map();
function bakeEnv() {
  if (!BAKE.ok) return;
  const n = typeof LIFT !== 'undefined' ? LIFT.deck : 1;
  if (_env.has(n)) { const rt = _env.get(n); _env.delete(n); _env.set(n, rt); scene.environment = rt.texture; return; }
  const at = (typeof deckOf === 'function' && deckOf(n).envAt) || [0, 1.75, 0.6];
  const crt = new THREE.WebGLCubeRenderTarget(isMobile ? 96 : 160, { type: THREE.HalfFloatType });
  const cc = new THREE.CubeCamera(0.05, 40, crt); cc.position.set(at[0], deckY(n) + at[1], at[2]);
  const fog = scene.fog, env = scene.environment; scene.fog = null; scene.environment = null;
  BKU.bkIbl.value = 0; cc.update(renderer, scene);
  const pm = new THREE.PMREMGenerator(renderer), rt2 = pm.fromCubemap(crt.texture); pm.dispose(); crt.dispose();
  if (env && env.dispose && ![..._env.values()].some((r) => r.texture === env)) env.dispose();
  _env.set(n, rt2); while (_env.size > 2) { const k = _env.keys().next().value; _env.get(k).dispose(); _env.delete(k); }
  scene.environment = rt2.texture; scene.environmentIntensity = BAKE.meta.env ?? 1; scene.fog = fog;
}

// ---------- load ----------
function bakeImg(url) { return new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; }); }
function bakeTex(img) { const t = new THREE.Texture(img); t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; t.needsUpdate = true; return t; }
function bakePixels(img) { const c = cnv(img.width, img.height), g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height).data; }
// fetch one deck's bake files and turn them into textures (needs nothing built)
async function bakeFetch(n) {
  const dir = 'bake/d' + n + '/', meta = await (await fetch(dir + 'bake.json')).json();
  const [lw, ls, pw, ps] = await Promise.all(['lm_w', 'lm_s', 'pr_w', 'pr_s'].map((f) => bakeImg(dir + f + '.png')));
  // probes: the image stacks six direction blocks; rebuild them side by side in one 3D texture
  const [X, Y, Z] = meta.grid.dims, a = bakePixels(pw), b = bakePixels(ps), d = new Uint8Array(6 * X * Y * Z * 4);
  for (let f = 0; f < 6; f++) for (let y = 0; y < Y; y++) for (let z = 0; z < Z; z++) for (let x = 0; x < X; x++) {
    const s = (((f * Y + y) * Z + z) * X + x) * 4, t = ((z * Y + y) * 6 * X + f * X + x) * 4;
    d[t] = a[s]; d[t + 1] = a[s + 1]; d[t + 2] = a[s + 2]; d[t + 3] = b[s];
  }
  const pt = new THREE.Data3DTexture(d, 6 * X, Y, Z); pt.minFilter = pt.magFilter = THREE.LinearFilter; pt.unpackAlignment = 1; pt.needsUpdate = true;
  BKD[n] = { meta, lmW: bakeTex(lw), lmS: bakeTex(ls), pr: pt };
  return BKD[n];
}
// A deck with no bake files yet (a new deck being built) gets an even, provisional light instead: a one-sample probe
// grid and a flat light map at about the brightness of a lit room, so it can be walked and judged before it is baked.
function bakeProvisional(n) {
  const B = BAKE.decks[n], ref = BKD[1]; if (!B || !ref || BKD[n]) return;
  const tex = (v, ch) => { const t = new THREE.DataTexture(new Uint8Array(ch === 1 ? [v, v, v, 255] : [v, v, v, 255]), 1, 1); t.needsUpdate = true; return t; };
  const d = new Uint8Array(6 * 4).fill(55); for (let f = 0; f < 6; f++) d[f * 4 + 3] = 0; // six faces, light from every side
  const pr = new THREE.Data3DTexture(d, 6, 1, 1); pr.minFilter = pr.magFilter = THREE.LinearFilter; pr.unpackAlignment = 1; pr.needsUpdate = true;
  const m = ref.meta, y = deckY(n);
  BKD[n] = { provisional: true, lmW: tex(140), lmS: tex(0), pr,
    meta: Object.assign({}, m, { deck: n, atlas: B.atlas, grid: { origin: [0, y + 1.4, 0], step: 1000, dims: [1, 1, 1] } }) };
  console.warn('Deck ' + n + ' has no light bake yet: using provisional light (bake it with tools/bake_export.py . <work> ' + n + ')');
}
// A deck that works out its own light (decks.js light(): corridors whose fixtures are known, deck3.js) instead of a
// Blender bake: L = { origin, step, dims [X, Y, Z], data (Uint8Array, six direction blocks side by side, RGBA = sqrt of
// the white light / pr_max[0] and of the alert-tinted light / pr_max[1]), pr_max, lm }.
function bakeComputed(n, L) {
  const B = BAKE.decks[n], ref = BKD[1]; if (!B || !ref || BKD[n]) return;
  const [X, Y, Z] = L.dims, pr = new THREE.Data3DTexture(L.data, 6 * X, Y, Z); pr.minFilter = pr.magFilter = THREE.LinearFilter; pr.unpackAlignment = 1; pr.needsUpdate = true;
  const t1 = (v) => { const t = new THREE.DataTexture(new Uint8Array([v, v, v, 255]), 1, 1); t.needsUpdate = true; return t; };
  BKD[n] = { computed: true, lmW: t1(L.lm || 140), lmS: t1(0), pr,
    meta: Object.assign({}, ref.meta, { deck: n, atlas: B.atlas, grid: { origin: L.origin, step: L.step, dims: L.dims }, pr_max: L.pr_max }) };
}
// Point the shared uniforms at deck n's bake (on arrival; lift.js). False if that deck has no bake applied.
function bakeUse(n) {
  const D = BKD[n]; if (!D || !BAKE.decks[n] || !BAKE.decks[n].ok) return false;
  const m = D.meta; BAKE.meta = m; BAKE.cur = n;
  BKU.bkLmW.value = D.lmW; BKU.bkLmS.value = D.lmS; BKU.bkLmMax.value.set(m.lm_max[0], m.lm_max[1]);
  BKU.bkPr.value = D.pr; BKU.bkPrMin.value.fromArray(m.grid.origin); BKU.bkPrInv.value = 1 / m.grid.step;
  BKU.bkPrDim.value.set(...m.grid.dims); BKU.bkPrMax.value.set(m.pr_max[0], m.pr_max[1]);
  if (typeof applyLights === 'function') applyLights(); // light level and alert colour, with this deck's exposure
  return true;
}
// Give deck n's materials the baked light, once the deck is built and its files have loaded: light-map receivers get
// the light map, every other lit interior material the probes. A material used both ways is copied for the other use.
// Returns true when the deck's bake is in place (batch.js then merges its light-mapped surfaces).
function bakeApply(n) {
  if (BAKE.ok && !BKD[n]) { const L = deckOf(n).light; if (L) bakeComputed(n, L()); else bakeProvisional(n); } // no files: computed or provisional light
  const B = BAKE.decks[n], D = BKD[n]; if (!B || !D || B.ok) return false;
  const A = D.meta.atlas;
  if (A.w !== B.atlas.w || A.h !== B.atlas.h || A.sig !== B.atlas.sig) { console.warn('Deck ' + n + ': bake does not match the deck; re-run its bake (see README)'); return false; }
  const recv = new Set(B.receivers);
  bakeWalk(n, (o) => {
    if (!o.isMesh || !(o.layers.mask & (1 | (1 << 30)))) return; // (1 << 30: chairs and doors drawn merged, batch.js)
    if (Array.isArray(o.material)) { o.material.forEach((m) => { if (m && m.isMeshStandardMaterial && !m.userData.noBake) bakePatch(m, 'pr'); }); return; }
    const m = o.material; if (!m || !m.isMeshStandardMaterial || m.userData.noBake) return;
    o.material = bakeFor(m, recv.has(o) ? 'lm' : 'pr');
  });
  B.ok = true; return true;
}
// m itself if it is (or can become) patched for this use, else its copy for that use
function bakeFor(m, mode) {
  if (!m.userData.bk) { bakePatch(m, mode); return m; }
  if (m.userData.bk === mode) return m;
  const alt = m.userData.bkAlt || (m.userData.bkAlt = {});
  if (!alt[mode]) {
    // the copy keeps the material's own patches but not its bake patch (two bake patches would redefine the uniforms)
    const c = copyPatches(m, m.clone()); c._patches = c._patches.filter((q) => !q.key.startsWith('bk-')); c.userData = {}; bakePatch(c, mode); alt[mode] = c;
  }
  return alt[mode];
}
// Deck 1 is laid out now (the decks below are laid out when they are built, decks.js deckBuild)
buildAtlas(1);
BAKE.ready = (async () => {
  await SURF.ready(); // textures first, so every material is final before it is patched
  if (window.DEFIANCE_NO_BAKE) throw new Error('bake disabled');
  // every built deck's files, side by side; only Deck 1's are needed to start
  const loads = Object.values(DECKS).filter((d) => d.built && !d.light).map((d) => bakeFetch(d.n).catch((e) => console.warn('Deck ' + d.n + ' bake unavailable:', e.message)));
  await Promise.all(loads);
  if (!BKD[1]) throw new Error('no bake for Deck 1');
  if (!bakeApply(1)) throw new Error('bake does not match the scene; re-run the bake (see README)');
  bakeUse(1);
  DECALS.forEach((m) => { m.visible = false; });
  BAKE.ok = true;
  // a deck built before its files arrived (a very quick lift ride) gets its light now
  Object.keys(BAKE.decks).forEach((k) => { const n = +k; if (n !== 1 && bakeApply(n) && typeof batchLightmapped === 'function') batchLightmapped(n); });
  return true;
})().catch((e) => { console.warn('Baked lighting unavailable, using fallback light:', e.message); BAKE.failed = true; return false; });
// render.js finishes the hand-over (applyLights, reflections) once every file has loaded.

````

---

## `js/batch.js`

````javascript
// USS Defiance · batch.js
// Fewer draw calls (roadmap F3). A draw call is one "draw this object" instruction to the graphics chip; the bridge
// was about 1,550 a frame because every trim strip, frame and bolt was its own object. This merges fixed objects that
// share a material into one object per deck, per material and per 6 m zone (zones let the camera still skip what is
// behind it). It runs three times:
//   1. once a deck is built and its light-map atlas is laid out (bake.js): fixed parts and furniture (batchDeck; the
//      bridge at load, other decks when the lift first heads there, decks.js deckBuild);
//   2. once that deck's baked light is in place: its light-mapped walls, floors and ceilings (batchLightmapped). They
//      have to wait, because the bake swaps their materials; each keeps its own light-map coordinates (uvLM), so merging
//      them does not change the light;
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
  const frames = new Set(Object.values(DECKS).map((d) => d.n !== 1 && d.root()).filter(Boolean));
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

// pass 1: a deck's fixed parts, once it is built (the bridge at load, other decks from decks.js deckBuild)
function batchDeck(top) {
  const skip = new Set([EXTSET, holo, ...DECALS].filter(Boolean)); // decals are switched on and off with the bake
  SHUTTERS.forEach((s) => s.slats.forEach((x) => skip.add(x)));
  // the bridge's lift door frame takes the lift car's materials later (lift.js), so it must still be its own object
  const ld = DOORS.find((q) => q.station === 'lift'); if (ld) ld.reveal.forEach((x) => skip.add(x));
  // moving parts: what rides on one is merged in that part's own frame, so it still moves as one
  // (the lift's doors are run by lift.js every frame, so they stay movers); chairs and other doors sleep
  const movers = new Set(), sleepers = new Map(), seen = new Set(SLEEPERS.map((sl) => sl.chair || sl.door));
  DOORS.forEach((d) => {
    if (d.station === 'lift') { movers.add(d.L); movers.add(d.Rr); return; }
    if (seen.has(d)) return;
    const sl = { door: d, parts: [], awake: false }; sleepers.set(d.L, sl); sleepers.set(d.Rr, sl);
  });
  Object.values(DECKS).forEach((d) => { const ld = d.door && d.door(); if (ld) { movers.add(ld.L); movers.add(ld.Rr); } }); // each deck's lift landing doors (lift.js slides them)
  CHAIRS.forEach((c) => { if (!seen.has(c)) sleepers.set(c.g, { chair: c, parts: [], awake: false }); });
  return batchMerge(top, { movers, skip, sleepers, label: 'parts ' + (top === scene ? 'd1' : top.name) });
}
batchDeck(scene);
// pass 2: a deck's light-mapped walls, floors and ceilings, once its bake has swapped their materials (bake.js bakeApply)
function batchLightmapped(n) {
  const B = BAKE.decks[n]; if (!B) return null;
  const top = n === 1 ? scene : deckOf(n).root();
  const st = batchMerge(top, { only: new Set(B.receivers), skip: new Set([EXTSET].filter(Boolean)), label: 'lightmapped d' + n });
  B.receivers = B.receivers.filter((o) => BAKE.receivers.includes(o));
  return st;
}
// Deck 1's runs before render.js's own hand-over (promise callbacks run in the order they were added; render.js loads later)
BAKE.ready.then((ok) => { if (ok) batchLightmapped(1); });

````

---

## `js/collision.js`

````javascript
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

````

---

## `js/screens.js`

````javascript
// USS Defiance · screens.js
// Console screen drawing: the instrument widget kit and every station display.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- screen drawing ----------
// The interface is built from solid blocks on black: an elbow frame, pill buttons, solid bars and number columns.
// No outlines, glows or grid backgrounds. Colours come from pal() (core.js): peach frames, tan and butterscotch
// readouts, lilac as the second colour, rose and plum as small accents, and green/amber/red for status only.
const bgCache = new Map();
function chamfer(g, x, y, w, h, c) { rrect(g, x, y, w, h, c); }
function screenBg(W, H, P) {
  const key = W + 'x' + H; if (bgCache.has(key)) return bgCache.get(key);
  const c = cnv(W, H), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); bgCache.set(key, c); return c;
}
const FUNC = { command: 'acc', ship: 'acc', viewer: 'acc', ops: 'acc', ready: 'acc', conference: 'acc', helm: 'green', carto: 'green', science: 'green', ew: 'green', intel: 'green', engineering: 'yel', damage: 'yel', env: 'yel', comms: 'yel', lift: 'yel', head: 'yel', band: 'yel', defense: 'red', weapons: 'red', desk: 'acc', brief: 'acc', honors: 'acc', synth: 'yel', shutters: 'yel' };
// Stations are told apart by their layout and labels, not by hue: every station uses the same palette.
const FUNC_CSS = { acc: 'var(--signal)', green: 'var(--signal)', yel: 'var(--signal)', red: 'var(--signal)' };
function fnColor(P) { return P.acc; }
function fitFont(g, text, weight, size, family, maxW) { let s = size; g.font = `${weight} ${s | 0}px ${family}`; while (s > 8 && g.measureText(text).width > maxW) { s -= 1; g.font = `${weight} ${s | 0}px ${family}`; } }
function throttle() { return cur.speed <= 12 ? cur.speed / 12 * 0.25 : 0.25 + (cur.speed - 12) / 408 * 0.75; }
// ---------- dense instrument widgets ----------
function jit(b, a, f, i) { return b + Math.sin(elapsed * f + (i || 0) * 1.7) * a; }
function split(r, fr, vertical, gap) {
  const tot = fr.reduce((a, b) => a + b, 0), out = []; let o = 0; const L = (vertical ? r.h : r.w) - gap * (fr.length - 1);
  fr.forEach((f) => { const sz = L * f / tot; out.push(vertical ? { x: r.x, y: r.y + o, w: r.w, h: sz } : { x: r.x + o, y: r.y, w: sz, h: r.h }); o += sz + gap; });
  return out;
}
const PAIR = (P, c) => (c === P.ice || c === P.green ? [P.ice, P.plum] : c === P.red ? [P.red, P.rose] : c === P.yel ? [P.butter, P.tan] : [P.acc, P.tan]);
// section header: a pill holding the label, then a solid bar running out to the edge
function sub(g, r, title, color, P) {
  const th = clamp(r.h * 0.12, 11, 22), [c1, c2] = PAIR(P, color);
  fitFont(g, title, 600, th * 0.74, DISP, r.w * 0.7 - th * 1.2); const tw = Math.min(r.w * 0.7, g.measureText(title).width + th * 1.2);
  hexTab(g, r.x, r.y, tw, th, true, false); g.fillStyle = c1; g.fill();
  g.fillStyle = '#000'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(title, r.x + tw - th * 0.3, r.y + th / 2 + 1);
  const bx = r.x + tw + th * 0.25, bw = Math.max(0, r.w - tw - th * 0.25);
  if (bw > th) {
    g.fillStyle = c2; g.fillRect(bx, r.y + th * 0.3, bw - th * 0.55, th * 0.4); hexTab(g, r.x + r.w - th * 0.45, r.y, th * 0.45, th, false, true); g.fillStyle = c1; g.fill();
    // about a third of header bars carry a slow travelling block; the rest stay still
    const hs = hash1(r.x * 0.37 + r.y * 0.11 + title.length), span = bw - th * 0.55 - th;
    if (hs < 0.34) { const px = bx + ((elapsed * (10 + hs * 30) + hs * 999) % Math.max(1, span)); g.fillStyle = P.butter; g.fillRect(px, r.y + th * 0.3, th * (0.6 + hs), th * 0.4); }
  }
  return { x: r.x, y: r.y + th * 1.4, w: r.w, h: r.h - th * 1.4 };
}
// readout rows: a coloured key block, a tan label and a cream value
function table(g, r, rows, P) {
  const n = rows.length, rh = r.h / n, fs = clamp(rh * 0.6, 8, 20), kw = clamp(rh * 0.42, 5, 12), keys = [P.tan, P.ice, P.butter, P.plum];
  rows.forEach(([k, v, c], i) => {
    const y = r.y + i * rh, cy = y + rh / 2; g.textBaseline = 'middle';
    g.fillStyle = c && c !== P.txt ? c : keys[i % keys.length]; rrect(g, r.x, y + rh * 0.16, kw, rh * 0.68, kw * 0.25); g.fill();
    g.textAlign = 'left'; g.fillStyle = P.tan; fitFont(g, k, 500, fs * 0.8, DISP, r.w * 0.44 - kw); g.fillText(k, r.x + kw + 6, cy + 1);
    g.textAlign = 'right'; g.fillStyle = c || P.txt; fitFont(g, v, 600, fs, DISP, r.w * 0.54); g.fillText(v, r.x + r.w, cy + 1);
  });
}
// level bars: solid blocks on a dark plum track, with the number in its own block
function bars(g, r, rows, P) {
  const n = rows.length, rh = r.h / n, fs = clamp(rh * 0.48, 8, 16), lw = r.w * 0.34, nw = r.w * 0.15;
  rows.forEach(([k, v, c], i) => {
    const y = r.y + i * rh, bh = rh * 0.62, by = y + (rh - bh) / 2; g.textBaseline = 'middle';
    g.textAlign = 'left'; g.fillStyle = P.tan; fitFont(g, k, 500, fs, DISP, lw - 8); g.fillText(k, r.x, y + rh / 2 + 1);
    const bx = r.x + lw, bw = r.w - lw - nw - 6, f = clamp(v, 0, 1);
    g.fillStyle = P.line; g.fillRect(bx, by, bw, bh);
    hexTab(g, bx, by, Math.max(bh * 0.6, bw * f), bh, false, true); g.fillStyle = c || P.acc; g.fill();
    g.textAlign = 'right'; g.fillStyle = P.txt; g.font = `600 ${fs | 0}px ${DISP}`; g.fillText(Math.round(f * 100) + '%', r.x + r.w, y + rh / 2 + 1);
  });
}
// status: a pill per system, filled with its state, label inside
function lights(g, r, rows, P, cols) {
  cols = cols || 1; const per = Math.ceil(rows.length / cols), cw = r.w / cols, rh = Math.min(r.h / per, 34), fs = clamp(rh * 0.5, 8, 15);
  const C = { ok: P.tan, warn: P.yel, off: P.line, act: P.acc, alert: P.red, blink: P.yel };
  rows.forEach(([k, st, v], i) => {
    const cx = r.x + Math.floor(i / per) * cw, cy = r.y + (i % per) * rh, ph = rh * 0.74, pw = cw - 8 - (v ? cw * 0.28 : 0);
    const blinkOn = st !== 'blink' || Math.sin(elapsed * 2.4 + i * 2.3) > -0.2; hexTab(g, cx, cy + (rh - ph) / 2, pw, ph, true, true); g.fillStyle = blinkOn ? C[st] || P.dim : P.line; g.fill();
    g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = st === 'off' ? P.dim : '#000'; fitFont(g, k, 600, fs, DISP, pw - ph); g.fillText(k, cx + ph * 0.55, cy + rh / 2 + 1);
    if (v) { g.textAlign = 'right'; g.fillStyle = P.txt; g.font = `600 ${fs | 0}px ${DISP}`; g.fillText(v, cx + cw - 8, cy + rh / 2 + 1); }
  });
}
// a trace drawn as a row of block columns
function spark(g, r, color, seed, speed, P, amp) {
  const n = Math.max(12, Math.round(r.w / 9)), bw = r.w / n;
  g.fillStyle = P.line; g.fillRect(r.x, r.y + r.h - 3, r.w, 3);
  for (let i = 0; i < n; i++) {
    const u = i / n, v = Math.sin(u * 9 + elapsed * speed + seed) * 0.28 + Math.sin(u * 23 - elapsed * speed * 1.7 + seed * 2) * 0.12 + Math.sin(u * 51 + elapsed * 3) * 0.05;
    const hh = clamp((0.5 + v * (amp || 1)) * r.h, 3, r.h);
    g.fillStyle = i % 7 === 3 ? P.butter : color; g.fillRect(r.x + i * bw + 1, r.y + r.h - hh, bw - 2, hh - 4);
  }
}
function big(g, r, value, unit, color, P) {
  const us = clamp(r.h * 0.24, 8, 20); g.font = `500 ${us | 0}px ${DISP}`; const uw = unit ? g.measureText(unit).width + 10 : 0;
  fitFont(g, value, 600, Math.min(r.h * 0.82, 92), DISP, r.w - uw - 4); g.fillStyle = color === P.acc ? P.butter : color; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(value, r.x, r.y + r.h / 2 + 2);
  if (unit) { const vw = g.measureText(value).width; g.font = `500 ${us | 0}px ${DISP}`; g.fillStyle = P.tan; g.fillText(unit, r.x + vw + 8, r.y + r.h * 0.62); }
}
// a scrolling column of readings, number-column style
function logw(g, r, lines, P, speed) {
  const fs = clamp(r.h / 6.2, 8, 14), lh = fs * 1.38, n = lines.length, off = (elapsed * (speed || 0.5)) % n, vis = Math.ceil(r.h / lh) + 1;
  g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip();
  g.font = `500 ${fs | 0}px ${DISP}`; g.textAlign = 'left'; g.textBaseline = 'top';
  for (let i = 0; i < vis; i++) {
    const idx = (Math.floor(off) + i) % n, yy = r.y + (i - (off % 1)) * lh, hot = i === vis - 2;
    g.fillStyle = hot ? P.acc : [P.tan, P.ice, P.butter][idx % 3]; g.fillRect(r.x, yy + lh * 0.12, fs * 0.5, lh * 0.66);
    g.fillStyle = hot ? P.butter : P.txt; g.fillText(lines[idx], r.x + fs * 0.9, yy + 1);
  }
  g.restore();
}
function throttleW(g, r, P) { const n = 14, sw = r.w / n, th = throttle(); for (let i = 0; i < n; i++) { g.fillStyle = (i + 0.5) / n < th ? (i > 10 ? P.ice : i > 6 ? P.butter : P.acc) : P.line; rrect(g, r.x + i * sw, r.y, sw - 4, r.h, 3); g.fill(); } }
// heading dial: a thick ring of blocks, the heading as a solid wedge
function dialW(g, r, deg, P) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2 * 0.95, hd = deg * D2R - Math.PI / 2 + Math.sin(elapsed * 0.8) * 0.03;
  for (let i = 0; i < 24; i++) { const a0 = i / 24 * Math.PI * 2 - Math.PI / 2 + 0.03, a1 = a0 + Math.PI / 12 - 0.06; g.strokeStyle = i % 6 === 0 ? P.tan : P.plum; g.lineWidth = rad * 0.2; g.beginPath(); g.arc(cx, cy, rad * 0.88, a0, a1); g.stroke(); }
  g.fillStyle = P.line; g.beginPath(); g.arc(cx, cy, rad * 0.7, 0, 7); g.fill();
  g.fillStyle = P.acc; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, rad * 0.68, hd - 0.16, hd + 0.16); g.closePath(); g.fill();
  g.fillStyle = P.butter; g.beginPath(); g.arc(cx, cy, rad * 0.2, 0, 7); g.fill();
}
function courseW(g, r, P) {
  const rr = mulberry(7 + state.cur);
  for (let i = 0; i < 50; i++) { g.fillStyle = `rgba(245,230,207,${0.25 + rr() * 0.5})`; g.fillRect(r.x + rr() * r.w, r.y + rr() * r.h, 2, 2); }
  const ax = r.x + r.w * 0.12, ay = r.y + r.h * 0.8, bx = r.x + r.w * 0.84, by = r.y + r.h * 0.22;
  for (let i = 0; i <= 18; i++) { const t = i / 18, px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * (r.x + r.w * 0.3) + t * t * bx, py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * (r.y + r.h * 0.2) + t * t * by; g.fillStyle = P.ice; rrect(g, px - 3, py - 3, 6, 6, 1.5); g.fill(); }
  g.fillStyle = P.butter; rrect(g, bx - 9, by - 9, 18, 18, 4); g.fill();
  const t = state.speed === 'warp' ? (elapsed * 0.08) % 1 : 0, px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * (r.x + r.w * 0.3) + t * t * bx, py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * (r.y + r.h * 0.2) + t * t * by;
  g.fillStyle = P.acc; rrect(g, px - 7, py - 7, 14, 14, 3); g.fill();
  const fs = clamp(r.h * 0.1, 8, 20); g.font = `600 ${fs | 0}px ${DISP}`; g.textBaseline = 'middle';
  g.textAlign = 'right'; g.fillStyle = P.txt; g.fillText(sysDest().star.toUpperCase(), bx - 16, by);
  g.textAlign = 'left'; g.fillStyle = P.tan; g.fillText(sysCur().star.toUpperCase(), ax + 10, ay);
}
// target globe: a solid disc banded in blocks, with a scan bar sweeping it
function globeW(g, r, P) {
  const rad = Math.min(r.w, r.h) / 2 * 0.92, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  g.save(); g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.clip();
  g.fillStyle = P.plum; g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  for (let i = -3; i <= 3; i++) { g.fillStyle = i % 2 ? P.ice : P.line; g.fillRect(cx - rad, cy + i * rad / 3.5 - rad * 0.06, rad * 2, rad * 0.12); }
  const off = (elapsed * 0.25) % 1; for (let i = 0; i < 4; i++) { const xx = cx - rad + ((i / 4 + off) % 1) * rad * 2; g.fillStyle = P.line; g.fillRect(xx, cy - rad, rad * 0.08, rad * 2); }
  const sy = cy + Math.sin(elapsed * (state.scanning ? 4 : 0.8)) * rad * 0.9; g.fillStyle = P.acc; g.fillRect(cx - rad, sy - rad * 0.05, rad * 2, rad * 0.1);
  g.restore();
}
function ringW(g, r, P, value, label) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2 * 0.92;
  for (let i = 0; i < 12; i++) {
    const a0 = i / 12 * Math.PI * 2 - Math.PI / 2 + 0.05, a1 = a0 + Math.PI * 2 / 12 - 0.1, on = Math.sin(elapsed * 0.7 + i * 1.3) > -0.6;
    g.strokeStyle = on ? [P.acc, P.tan, P.ice, P.butter][i % 4] : P.line; g.lineWidth = rad * 0.24; g.beginPath(); g.arc(cx, cy, rad * 0.84, a0, a1); g.stroke();
  }
  g.fillStyle = P.txt; g.textAlign = 'center'; g.textBaseline = 'middle'; fitFont(g, value, 600, rad * 0.56, DISP, rad * 1.15); g.fillText(value, cx, cy - rad * 0.04);
  g.fillStyle = P.tan; g.font = `500 ${clamp(rad * 0.17, 8, 16) | 0}px ${DISP}`; g.fillText(label, cx, cy + rad * 0.34);
}
// ---------- density: button banks and number columns ----------
// The panels around the readable widgets: banks of numbered pill buttons and slowly ticking columns of numbers.
// They carry no information of their own; they make each screen read as a working console with more going on.
// Everything moves on its own clock: each pill has its own rate and phase, numbers tick at their own moments,
// columns scroll smoothly, and every screen has occasional bursts of activity, so nothing steps in time.
function hash1(n) { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }
// A step counter that advances now and then rather than on a shared beat: every key gets its own
// period (between minS and maxS) and phase, so neighbouring cells never change together.
function slowTick(key, minS, maxS) {
  const per = minS + (maxS - minS) * hash1(key * 1.7 + 0.3);
  return Math.floor((elapsed + hash1(key) * per) / per);
}
function pillBank(g, r, seed, P, cols) {
  const rr = mulberry(seed), cw = r.w / cols, ph = clamp(cw * 0.3, 12, 30), gap = Math.max(3, ph * 0.22), rows = Math.max(1, Math.floor((r.h + gap) / (ph + gap)));
  const pal2 = [P.acc, P.tan, P.butter, P.ice, P.tan, P.rose, P.plum, P.acc], n = rows * cols;
  // Mostly still, like a real panel: one pill is 'selected' and moves to another every 6-18 s,
  // one more toggles on or off now and then, and a few numbers update slowly.
  const sel = (hash1(seed * 5 + slowTick(seed * 3.1, 6, 18)) * n) | 0, tg = slowTick(seed * 7.3, 9, 25), tgk = (hash1(seed + tg * 3) * n) | 0;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const c = pal2[(rr() * pal2.length) | 0], off0 = rr() < 0.14, ph2 = rr() * 9, live = rr() < 0.25, x = r.x + i * cw, y = r.y + j * (ph + gap), w = cw - gap, k = j * cols + i;
    const lit = k === tgk && tg % 2 ? off0 : !off0, on = k === sel;
    hexTab(g, x, y, w, ph, i === 0, i === cols - 1 || cols === 1); g.fillStyle = on ? P.txt : lit ? c : P.line; g.fill();
    if (ph >= 13 && w > ph * 1.6) { const tk = live ? slowTick(seed * 13 + k, 7, 30) : 0, a2 = 10 + ((seed * 31 + k * 17 + tk * 7) % 89), b2 = 100 + ((seed * 7 + k * 53 + tk * 131) % 899); g.fillStyle = lit || on ? '#000' : P.dim; g.font = `600 ${ph * 0.5 | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(String(a2) + (w > ph * 3 ? '-' + String(b2) : ''), x + w - ph * 0.45, y + ph / 2 + 1); }
  }
}
// columns of numbers that scroll upward smoothly; a few cells change or flash on their own
function numGrid(g, r, seed, P) {
  const fs = clamp(r.h / 7.5, 9, 15), lh = fs * 1.32, cols = Math.max(2, Math.floor(r.w / (fs * 3.9))), rows = Math.max(1, Math.floor(r.h / lh)), cw = r.w / cols;
  const sp = hash1(seed) < 0.5 ? 0.12 + hash1(seed + 1) * 0.3 : 0, pos = elapsed * sp + hash1(seed + 3) * 100, base = Math.floor(pos), fr = pos - base;
  g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip();
  g.font = `500 ${fs | 0}px ${DISP}`; g.textBaseline = 'top';
  for (let j = 0; j <= rows; j++) {
    const row = base + j, y = r.y + (j - fr) * lh, hot = hash1(seed * 3 + row) > 0.86;
    for (let i = 0; i < cols; i++) {
      const cell = seed * 977 + row * 31 + i, tk = hash1(cell + 2) < 0.3 ? slowTick(cell, 4, 22) : 0, digits = 2 + ((hash1(cell + 7) * 4) | 0);
      const n = String(Math.floor(hash1(cell + tk * 13) * Math.pow(10, digits))), x = r.x + i * cw;
      g.fillStyle = hot ? P.butter : i === 0 ? P.acc : (i + row) % 5 === 2 ? P.ice : P.tan; g.textAlign = i === 0 ? 'left' : 'right';
      g.fillText(n, i === 0 ? x : x + cw - 4, y);
    }
  }
  g.restore();
}
// ---------- live ship widgets (Stage 1) ----------
function shipClock(at) { const s = Math.floor(at); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function zcol(P, id) { return { ok: P.green, warn: P.yel, alert: P.red, off: P.line }[zoneStatus(id)]; }
function zonesW(g, r, P) {
  const [L, Rr] = split(r, [1, 1], false, r.w * 0.05);
  bars(g, L, ZONES.slice(0, 4).map((z) => [z.short, sim.zones[z.id] / 100, zcol(P, z.id)]), P);
  bars(g, Rr, ZONES.slice(4).map((z) => [z.short, sim.zones[z.id] / 100, zcol(P, z.id)]), P);
}
function weaponRows(P) {
  const red = state.alert === 'red', b = sim.beams, bay = sim.bays;
  const beam = (v, id) => zoneFactor(id) === 0 ? ['OFFLINE', P.red] : red ? (v >= 1 ? ['CHARGED', P.acc] : [Math.round(v * 100) + '% CHARGE', P.txt]) : ['SAFE', P.dim];
  const tube = (t) => t.torps <= 0 ? ['EMPTY', P.red] : red ? (t.ready ? ['LOADED · ' + t.torps, P.acc] : ['LOADING · ' + t.torps, P.yel]) : [t.torps + ' / ' + SIM.torp.perBay, P.txt];
  return [['WEAPONS POD', ...beam(b.dorsal, 'dorsal')], ['VENTRAL ARRAY', ...beam(b.ventral, 'ventral')], ['TORP BAY 1', ...tube(bay[0])], ['TORP BAY 2', ...tube(bay[1])], ['TARGET LOCK', 'NONE', P.dim]];
}
function shieldW(g, r, P) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, s = Math.min(r.w * 0.36, r.h * 0.32);
  g.fillStyle = P.ice; g.globalAlpha = 0.85; hullTop(g, cx, cy, s); g.fill(); g.globalAlpha = 1;
  const up = sim.shields.up > 0.01;
  const segs = [[-Math.PI * 0.75, -Math.PI * 0.25, 'fwd'], [-Math.PI * 0.25, Math.PI * 0.25, 'stbd'], [Math.PI * 0.25, Math.PI * 0.75, 'aft'], [Math.PI * 0.75, Math.PI * 1.25, 'port']];
  segs.forEach(([a0, a1, k], i) => {
    const v = shieldNow(k), f = v / SIM.shield.max, rf = sim.shields.reinforce === k, lw = s * (rf ? 0.15 : 0.1);
    g.lineWidth = lw; g.strokeStyle = P.line; g.beginPath(); g.ellipse(cx, cy, s * 0.95, s * 1.25, 0, a0 + 0.06, a1 - 0.06); g.stroke();
    if (up && v > 0.5) {
      const span = (a1 - a0 - 0.12) * clamp(v / shieldMax(k), 0, 1), mid = (a0 + a1) / 2;
      g.strokeStyle = f > 0.5 ? P.acc : f > 0.2 ? P.yel : P.red; g.globalAlpha = 0.8 + Math.sin(elapsed * 1.3 + i) * 0.15;
      g.beginPath(); g.ellipse(cx, cy, s * 0.95, s * 1.25, 0, mid - span / 2, mid + span / 2); g.stroke(); g.globalAlpha = 1;
    }
    const am = (a0 + a1) / 2, lx = cx + Math.cos(am) * s * 1.28, ly = cy + Math.sin(am) * s * 1.48;
    g.fillStyle = up ? (f > 0.2 ? P.txt : P.red) : P.dim; g.font = `600 ${clamp(s * 0.18, 8, 18) | 0}px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(up ? Math.round(v) + (rf ? '+' : '') : 'DOWN', lx, ly);
  });
}
function deckW(g, r, P) {
  const cols = 8, rows = 6, cw = r.w / cols, chh = r.h / rows, scan = (elapsed * 0.5) % 1;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const hl = Math.abs(i / cols - scan) < 0.07;
    hexTab(g, r.x + i * cw + 2, r.y + j * chh + 2, cw - 4, chh - 4, true, true); g.fillStyle = hl ? P.ice : P.ice; g.globalAlpha = hl ? 1 : 0.55; g.fill();
  }
  g.globalAlpha = 1;
}
function hullTop(g, cx, cy, s) {
  g.beginPath();
  g.moveTo(cx, cy - s); g.lineTo(cx + s * 0.34, cy - s * 0.5); g.lineTo(cx + s * 0.4, cy + s * 0.2); g.lineTo(cx + s * 0.62, cy + s * 0.45); g.lineTo(cx + s * 0.62, cy + s * 0.95);
  g.lineTo(cx + s * 0.18, cy + s * 0.8); g.lineTo(cx, cy + s * 0.92); g.lineTo(cx - s * 0.18, cy + s * 0.8); g.lineTo(cx - s * 0.62, cy + s * 0.95); g.lineTo(cx - s * 0.62, cy + s * 0.45);
  g.lineTo(cx - s * 0.4, cy + s * 0.2); g.lineTo(cx - s * 0.34, cy - s * 0.5); g.closePath();
}
function eta() { const s = 5400 - ((elapsed * 10) | 0) % 5400; return String(s / 3600 | 0).padStart(2, '0') + ':' + String((s % 3600) / 60 | 0).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
const LOGS = {
  sci: ['GRAV LENS CAL ......... OK', 'EM SWEEP 0.3–40 GHZ ... CLEAR', 'SUBSPACE NOISE ........ 2.1 DB', 'PARTICLE FLUX ......... NOMINAL', 'LR SENSOR PING ........ 14 CONTACTS', 'TACHYON GRID .......... QUIET', 'ATMOS SAMPLE .......... QUEUED', 'THERMAL MAP ........... 61% DONE'],
  com: ['21:47 MERIDIAN ACK SEQ 4410', '21:48 CONVOY LEAD CHECK-IN', '21:52 RELAY 47 HANDSHAKE OK', '21:55 CIPHER ROTATION 3 OF 4', '21:58 AMITY ROSE STATUS GREEN', '22:01 IRON PATIENCE STATUS GREEN', '22:03 BEACON SWEEP CLEAR', '22:06 PRIORITY QUEUE EMPTY'],
  dmg: ['D1 BRIDGE ............. SECURE', 'D2 OFFICERS ........... SECURE', 'D3 TORPEDO BAYS ....... SECURE', 'D4 ENGINEERING ........ SECURE', 'D5 CARGO .............. SECURE', 'D6 SHUTTLEBAY ......... SECURE', 'D7 HABITAT ............ SECURE', 'D8 KEEL ............... SECURE'],
  eng: ['CORE BREACH MARGIN 412%', 'INJECTOR 1 CYCLE 0.31 MS', 'INJECTOR 2 CYCLE 0.31 MS', 'COIL BANK A SYNC ±0.02', 'COIL BANK B SYNC ±0.03', 'COOLANT LOOP 3 FLOW NOMINAL', 'SIF GEN 2 STANDBY', 'POWER TRANSFER CONDUITS OK'],
};
const CONVOY = [['AMITY ROSE', '2.1 KM AFT'], ['KESTREL MAIDEN', '3.4 KM AFT'], ['IRON PATIENCE', '4.0 KM AFT']];
const DRAW = {
  helm(g, x, y, w, h, P) {
    const R = { x, y, w, h }, warp = state.speed === 'warp', imp = state.speed !== 'stop', mi = maxImpulse();
    const nP = (warp ? jit(0.94, 0.02, 1.3, 1) : imp ? 0.08 : 0.02) * zoneFactor('portNac'), nS = (warp ? jit(0.94, 0.02, 1.3, 2) : imp ? 0.08 : 0.02) * zoneFactor('stbdNac');
    const iv = state.speed === 'impulse' ? 0.25 * mi : 0;
    const unit = warp ? 'WF 6.00' : imp ? (0.25 * mi).toFixed(2) + ' C' : '0 KM/S';
    const flight = [['DAMPERS', 'ok'], ['NAV DEFLECTOR', zoneStatus('prow')], ['WARP FIELD', simCanWarp() ? (warp ? 'act' : 'ok') : 'alert'], ['IMPULSE', zoneStatus('engines')], ['AUTOPILOT', warp ? 'act' : 'off']];
    if (h < 170) {
      const [a, b, c] = split(R, [1.3, 0.7, 1.1], false, w * 0.03);
      const ca = sub(g, a, 'VELOCITY', P.acc, P); const [v1, v2] = split(ca, [1.5, 0.5], true, 6); big(g, v1, SPEEDS[state.speed].screen, unit, P.acc, P); throttleW(g, v2, P);
      dialW(g, sub(g, b, 'HDG', P.acc, P), parseInt(sysDest().heading, 10), P);
      bars(g, sub(g, c, 'PROPULSION', P.acc, P), [['PORT NAC', nP, P.acc], ['STBD NAC', nS, P.acc], ['IMPULSE', iv, P.ice]], P);
      return;
    }
    const [top, bot] = split(R, [1.05, 1], true, h * 0.05);
    const [a, b] = split(top, [1.2, 1], false, w * 0.03);
    const ca = sub(g, a, 'VELOCITY', P.acc, P); const [v1, v2] = split(ca, [1.6, 0.5], true, 6); big(g, v1, SPEEDS[state.speed].screen, unit, P.acc, P); throttleW(g, v2, P);
    courseW(g, sub(g, b, 'COURSE PLOT', P.acc, P), P);
    const [c, d, e] = split(bot, [1.1, 1, 0.9], false, w * 0.03);
    bars(g, sub(g, c, 'PROPULSION', P.acc, P), [['PORT NACELLE', nP, P.acc], ['STBD NACELLE', nS, P.acc], ['IMPULSE', iv, P.ice], ['IMPULSE LIMIT', mi, mi < 1 ? P.yel : P.ice], ['ENGINE POWER', eff('engines') / SIM.effCap, P.ice]], P);
    table(g, sub(g, d, 'NAVIGATION', P.acc, P), [['HEADING', sysDest().heading.toUpperCase()], ['DESTINATION', sysDest().star.toUpperCase()], ['ETA', warp ? eta() : '—'], ['POSITION', sysCur().star.toUpperCase()]], P);
    lights(g, sub(g, e, 'FLIGHT', P.acc, P), flight, P);
  },
  ops(g, x, y, w, h, P) {
    const R = { x, y, w, h }, A = sim.alloc, k = reactorOut() / SIM.reactor;
    const power = [['WEAPONS', A.weapons * k / 100, P.acc], ['SHIELDS', A.shields * k / 100, P.acc], ['ENGINES', A.engines * k / 100, P.ice], ['SENSORS', A.sensors * k / 100, P.ice], ['LIFE SUPPORT', SIM.life / 100, P.ice]];
    if (h < 170) {
      const [a, b, c] = split(R, [0.6, 1.1, 1.2], false, w * 0.03);
      ringW(g, sub(g, a, 'HULL', P.acc, P), P, Math.round(hullIntegrity()) + '%', 'INTEGRITY');
      table(g, sub(g, b, 'POWER', P.acc, P), [['PRESET', sim.preset.toUpperCase(), P.acc], ['REACTOR', Math.round(reactorOut()) + ' U', k < 1 ? P.yel : P.txt], ['CONVOY', '3 SHIPS']], P);
      bars(g, sub(g, c, 'ALLOCATION', P.acc, P), power.slice(0, 3), P);
      return;
    }
    const [top, bot] = split(R, [1, 1], true, h * 0.05);
    const [a, b] = split(top, [0.7, 1.4], false, w * 0.03);
    ringW(g, sub(g, a, 'HULL', P.acc, P), P, Math.round(hullIntegrity()) + '%', 'INTEGRITY');
    table(g, sub(g, b, 'CONVOY · 3 SHIPS', P.acc, P), CONVOY.concat([['FORMATION', 'LINE ASTERN']]), P);
    const [c, d] = split(bot, [1.3, 1], false, w * 0.03);
    bars(g, sub(g, c, 'POWER · SHARE OF REACTOR', P.acc, P), power, P);
    table(g, sub(g, d, 'POWER', P.acc, P), [['PRESET', sim.preset.toUpperCase(), P.acc], ['REACTOR', Math.round(reactorOut()) + ' U', k < 1 ? P.yel : P.txt], ['EMERGENCY', sim.emergency.boost > 0 ? 'TO SHIELDS' : sim.emergency.penalty > 0 ? 'RECOVERING' : 'READY', sim.emergency.boost > 0 ? P.acc : sim.emergency.penalty > 0 ? P.yel : P.txt], ['CREW', '140 ABOARD']], P);
  },
  sci(g, x, y, w, h, P) {
    const R = { x, y, w, h }, sys = sysCur(), away = state.speed === 'warp';
    const rows = [['TARGET', away ? 'NONE IN RANGE' : sys.planet.toUpperCase()], ['CLASS', away ? '—' : sys.cls.toUpperCase()], ['ATMOSPHERE', away ? '—' : sys.atm.toUpperCase()], ['LIFE SIGNS', away ? '—' : state.scanned ? sys.life.toUpperCase() : state.scanning ? 'SCANNING…' : 'SCAN REQUIRED', state.scanned ? P.ice : P.acc], ['RANGE', away ? '—' : sys.dist.toUpperCase()]];
    if (h < 170) {
      const [a, b, c] = split(R, [0.6, 1.5, 1], false, w * 0.03);
      globeW(g, sub(g, a, 'TARGET', P.ice, P), P);
      table(g, sub(g, b, 'ANALYSIS', P.ice, P), rows.slice(0, 4), P);
      lights(g, sub(g, c, 'ARRAYS', P.ice, P), [['LONG RANGE', 'ok'], ['LATERAL', 'ok'], ['SURVEY', state.scanning ? 'act' : 'ok']], P);
      return;
    }
    const [top, bot] = split(R, [1.25, 1], true, h * 0.05);
    const [a, b] = split(top, [0.7, 1.5], false, w * 0.03);
    globeW(g, sub(g, a, 'TARGET', P.ice, P), P);
    table(g, sub(g, b, 'ANALYSIS', P.ice, P), rows, P);
    const [c, d, e] = split(bot, [1.1, 0.9, 1.2], false, w * 0.03);
    bars(g, sub(g, c, 'COMPOSITION', P.ice, P), away ? [['—', 0, P.line]] : [['N2', jit(0.71, 0.01, 0.7, 1), P.ice], ['O2', jit(0.24, 0.01, 0.7, 2), P.ice], ['AR', 0.03, P.ice], ['CO2', 0.02, P.ice]], P);
    lights(g, sub(g, d, 'ARRAYS', P.ice, P), [['LONG RANGE', 'ok'], ['LATERAL P', 'ok'], ['LATERAL S', 'ok'], ['SURVEY', state.scanning ? 'act' : 'ok'], ['PROBE BAY', 'off']], P);
    logw(g, sub(g, e, 'SENSOR LOG', P.ice, P), LOGS.sci, P, 0.6);
  },
  com(g, x, y, w, h, P) {
    const R = { x, y, w, h };
    const ch = [['MERIDIAN STN', 'OPEN · 21.47', P.ice], ['CONVOY LEAD', 'OPEN · 21.53', P.ice], [sysCur().star.toUpperCase() + ' RELAY', 'STBY · 19.02', P.acc]];
    if (h < 170) {
      const [a, b] = split(R, [1, 1.2], false, w * 0.03);
      spark(g, sub(g, a, 'CARRIER', P.acc, P), P.acc, 1, 5, P);
      table(g, sub(g, b, 'CHANNELS', P.acc, P), ch, P);
      return;
    }
    const [top, bot] = split(R, [0.8, 1], true, h * 0.05);
    const [a, b] = split(top, [1.6, 0.8], false, w * 0.03);
    spark(g, sub(g, a, 'CARRIER · SUBSPACE BAND 4', P.acc, P), P.acc, 1, 5, P);
    lights(g, sub(g, b, 'LINK', P.acc, P), [['CIPHER', 'ok', 'R3'], ['RELAY 47', 'ok'], ['BEACON', 'ok'], ['DISTRESS', 'off']], P);
    const [c, d] = split(bot, [1.1, 1], false, w * 0.03);
    table(g, sub(g, c, 'CHANNELS', P.acc, P), ch.concat([['QUEUE', '0 PRIORITY']]), P);
    logw(g, sub(g, d, 'TRAFFIC', P.acc, P), LOGS.com, P, 0.4);
  },
  sys(g, x, y, w, h, P) {
    const R = { x, y, w, h }, warp = state.speed === 'warp', out = reactorOut() / SIM.reactor, E = sim.emergency;
    const re = [['REACTOR', out, out < 1 ? P.yel : P.acc], ['EMERGENCY', E.boost > 0 ? E.boost / SIM.emergency.time : 0, P.acc], ['RECOVERY', E.penalty / SIM.emergency.penaltyTime, P.yel], ['FIELD COILS', warp ? 0.95 : 0.2, P.ice], ['COOLANT', 0.66, P.ice]];
    const breach = sim.breach !== null;
    const sysl = [['REACTOR', zoneStatus('engines')], ['INJECTORS', 'ok'], ['COIL BANK P', zoneStatus('portNac')], ['COIL BANK S', zoneStatus('stbdNac')], ['CONTAINMENT', breach ? 'blink' : 'ok'], ['EMERGENCY PWR', E.boost > 0 ? 'act' : E.penalty > 0 ? 'warn' : 'ok'], ['LIFE SUPPORT', 'ok'], ['GRAVITY', 'ok']];
    const core = (breach ? jit(1, 0.1, 9, 1) : warp ? jit(0.984, 0.003, 2, 1) : jit(0.62, 0.004, 1.2, 1)) * out;
    if (h < 170) {
      const [a, b, c] = split(R, [0.9, 1.3, 0.9], false, w * 0.03);
      const ca = sub(g, a, breach ? 'BREACH ' + Math.ceil(sim.breach) + 'S' : 'WARP CORE', P.acc, P); const [v1, v2] = split(ca, [1, 1], true, 4); big(g, v1, (core * 100).toFixed(1) + '%', 'OUT', breach ? P.red : P.acc, P); spark(g, v2, P.acc, 3, 2, P, 0.6);
      bars(g, sub(g, b, 'REACTION', P.acc, P), re.slice(0, 3), P);
      lights(g, sub(g, c, 'SYSTEMS', P.acc, P), sysl.slice(0, 3), P);
      return;
    }
    const [top, bot] = split(R, [1, 1], true, h * 0.05);
    const [a, b] = split(top, [1, 1.3], false, w * 0.03);
    const ca = sub(g, a, breach ? 'CORE BREACH IN ' + Math.ceil(sim.breach) + ' S' : 'WARP CORE', P.acc, P); const [v1, v2] = split(ca, [1, 1], true, 6); big(g, v1, (core * 100).toFixed(1) + '%', 'OUTPUT', breach ? P.red : P.acc, P); spark(g, v2, P.acc, 3, 2, P, 0.6);
    bars(g, sub(g, b, 'REACTION', P.acc, P), re, P);
    const [c, d] = split(bot, [1.2, 1], false, w * 0.03);
    lights(g, sub(g, c, 'SYSTEMS', P.acc, P), sysl, P, 2);
    logw(g, sub(g, d, 'ENGINEERING LOG', P.acc, P), LOGS.eng, P, 0.5);
  },
  dmg(g, x, y, w, h, P) {
    const R = { x, y, w, h }, hull = hullIntegrity(), breach = sim.breach !== null;
    const teams = sim.teams.map((tm, i) => ['TEAM ' + (i + 1), tm.to ? 'MOVING · ' + ZONES.find((z) => z.id === tm.to).short : tm.at ? ZONES.find((z) => z.id === tm.at).short + (sim.zones[tm.at] < SIM.repair.cap ? ' · REPAIR' : ' · DONE') : 'STANDBY', tm.to ? P.yel : tm.at ? P.acc : P.dim]);
    const hcol = hull < 50 ? P.red : hull < 90 ? P.yel : P.green;
    if (h < 170) {
      const [a, b] = split(R, [1.5, 1], false, w * 0.03);
      zonesW(g, sub(g, a, 'DAMAGE ZONES', P.acc, P), P);
      table(g, sub(g, b, 'HULL', P.acc, P), [['INTEGRITY', Math.round(hull) + '%', hcol], ['STATUS', breach ? 'BREACH ' + Math.ceil(sim.breach) + 'S' : sim.drill.on ? 'DRILL' : 'SECURE', breach ? P.red : sim.drill.on ? P.acc : P.green]].concat(teams.slice(0, 1)), P);
      return;
    }
    const [top, bot] = split(R, [1.15, 1], true, h * 0.05);
    const [a, b] = split(top, [1.6, 1], false, w * 0.03);
    zonesW(g, sub(g, a, 'DAMAGE ZONES · 8', P.acc, P), P);
    const cb = sub(g, b, 'HULL', P.acc, P); const [b1, b2] = split(cb, [1, 1.2], true, 4); big(g, b1, Math.round(hull) + '%', 'INTEGRITY', hcol, P);
    table(g, b2, [['STATUS', breach ? 'BREACH IN ' + Math.ceil(sim.breach) + ' S' : sim.drill.on ? 'DRILL · ' + Math.ceil(sim.drill.t) + ' S' : state.alert === 'green' ? 'ALL SECURE' : 'BATTLE STATIONS', breach ? P.red : sim.drill.on || state.alert !== 'green' ? P.acc : P.green], ['WORST', worstZone() ? worstZone().short + ' ' + Math.round(sim.zones[worstZone().id]) + '%' : 'NONE']], P);
    const [c, d] = split(bot, [1, 1.2], false, w * 0.03);
    table(g, sub(g, c, 'REPAIR TEAMS', P.acc, P), teams.concat([['FIELD REPAIR', 'TO ' + SIM.repair.cap + '%']]), P);
    const hits = sim.hitLog.slice().reverse().map((e) => `${shipClock(e.at)} ${e.arc.toUpperCase()} ${Math.round(e.dmg)} · ${e.zone ? ZONES.find((z) => z.id === e.zone).short + ' -' + Math.round(e.rest) : 'ABSORBED'}`);
    logw(g, sub(g, d, 'HIT REPORTS', P.acc, P), hits.length ? hits : LOGS.dmg, P, hits.length ? 0 : 0.7);
  },
  tac(g, x, y, w, h, P) {
    const R = { x, y, w, h };
    const [a, b] = split(R, [1, 1.15], false, w * 0.03);
    shieldW(g, sub(g, a, 'DEFLECTORS', P.acc, P), P);
    const [b1, b2] = split(b, [1.3, 1], true, h * 0.05);
    table(g, sub(g, b1, 'WEAPONS', P.acc, P), weaponRows(P).slice(0, 4), P);
    table(g, sub(g, b2, 'CONDITION', P.acc, P), [['ALERT', ALERTS[state.alert].short, P.acc], ['HULL', Math.round(hullIntegrity()) + '%', hullIntegrity() < 50 ? P.red : hullIntegrity() < 90 ? P.yel : P.green], ['DRILL', sim.drill.on ? Math.ceil(sim.drill.t) + ' S LEFT' : 'OFF', sim.drill.on ? P.acc : P.dim]], P);
  },
  msd(g, x, y, w, h, P) {
    const X = (u) => x + u * w, Y = (v) => y + v * h, warp = smooth(30, 300, cur.speed);
    g.beginPath();
    g.moveTo(X(0.03), Y(0.47)); g.lineTo(X(0.1), Y(0.37)); g.lineTo(X(0.3), Y(0.31)); g.lineTo(X(0.33), Y(0.23)); g.lineTo(X(0.4), Y(0.23)); g.lineTo(X(0.42), Y(0.31));
    g.lineTo(X(0.52), Y(0.31)); g.lineTo(X(0.54), Y(0.26)); g.lineTo(X(0.63), Y(0.26)); g.lineTo(X(0.65), Y(0.32)); g.lineTo(X(0.75), Y(0.35)); g.lineTo(X(0.79), Y(0.45));
    g.lineTo(X(0.77), Y(0.57)); g.lineTo(X(0.63), Y(0.61)); g.lineTo(X(0.3), Y(0.59)); g.lineTo(X(0.12), Y(0.55)); g.closePath();
    g.fillStyle = P.plum; g.fill(); g.strokeStyle = P.ice; g.lineWidth = 6; g.stroke();
    g.save(); g.clip();
    g.strokeStyle = '#000'; g.lineWidth = 3;
    for (let v = 0.33; v < 0.6; v += 0.045) { g.beginPath(); g.moveTo(X(0), Y(v)); g.lineTo(X(1), Y(v)); g.stroke(); }
    for (let u = 0.12; u < 0.8; u += 0.06) { g.beginPath(); g.moveTo(X(u), Y(0.2)); g.lineTo(X(u), Y(0.62)); g.stroke(); }
    const sx = X(0.03 + ((elapsed * 0.08) % 1) * 0.78); g.fillStyle = P.butter; g.fillRect(sx - 6, Y(0.2), 12, h * 0.45);
    g.restore();
    g.strokeStyle = P.ice; g.lineWidth = 6;
    [[0.6, 0.6, 0.64, 0.71], [0.7, 0.58, 0.74, 0.71]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(X(a), Y(b)); g.lineTo(X(c), Y(d)); g.stroke(); });
    const nx0 = X(0.5), nx1 = X(0.97), ny = Y(0.71), nh = h * 0.08;
    hexTab(g, nx0, ny, nx1 - nx0, nh, true, true); g.fillStyle = `rgba(143,195,224,${0.15 + warp * 0.65})`; g.fill(); g.stroke();
    g.strokeStyle = P.ice; g.beginPath(); g.arc(X(0.075), Y(0.48), h * 0.05, 0, 7); g.stroke();
    const core = 0.5 + 0.5 * Math.sin(elapsed * (2 + warp * 6)); g.fillStyle = P.acc; g.globalAlpha = 0.5 + core * 0.5; g.fillRect(X(0.565), Y(0.36), w * 0.012, h * 0.2); g.globalAlpha = 1;
    g.fillStyle = P.acc; g.fillRect(X(0.35), Y(0.245), w * 0.03, h * 0.035);
    [[0.585, 0.26], [0.45, 0.6]].forEach(([u, v]) => { g.fillStyle = state.alert === 'red' ? P.acc : P.dim; g.fillRect(X(u) - 6, Y(v) - 3, 12, 6); });
    const lab = (px, py, lx, ly, t, c) => { g.strokeStyle = P.tan; g.lineWidth = 3; g.beginPath(); g.moveTo(X(px), Y(py)); g.lineTo(X(lx), Y(ly)); g.stroke(); g.fillStyle = c || P.txt; g.font = `500 ${h * 0.055 | 0}px ${MONO}`; g.textAlign = lx < px ? 'right' : 'left'; g.textBaseline = 'middle'; g.fillText(t, X(lx) + (lx < px ? -6 : 6), Y(ly)); };
    lab(0.365, 0.24, 0.3, 0.06, 'BRIDGE', P.acc);
    lab(0.585, 0.26, 0.66, 0.06, 'WEAPONS POD', zoneStatus('dorsal') === 'ok' ? P.txt : zcol(P, 'dorsal'));
    lab(0.45, 0.6, 0.34, 0.9, 'VENTRAL ARRAY', zoneStatus('ventral') === 'ok' ? P.txt : zcol(P, 'ventral'));
    lab(0.06, 0.5, 0.06, 0.86, 'TWIN TORPEDO BAYS', zoneStatus('prow') === 'ok' ? P.txt : zcol(P, 'prow'));
    lab(0.57, 0.48, 0.58, 0.9, 'WARP CORE', zoneStatus('engines') === 'ok' ? P.acc : zcol(P, 'engines'));
    lab(0.76, 0.5, 0.9, 0.2, 'SHUTTLEBAY');
  },
  status(g, x, y, w, h, P, s) {
    const R = { x, y, w, h };
    if (s.code === 'SYS·00') {
      const [a, b, c] = split(R, [0.9, 1.5, 0.7], true, h * 0.03), breach = sim.breach !== null;
      const ca = sub(g, a, 'HULL', P.acc, P); const sz = Math.min(ca.w * 0.3, ca.h * 0.45), cx = ca.x + ca.w / 2, cy = ca.y + ca.h / 2;
      hullTop(g, cx, cy, sz); g.fillStyle = P.plum; g.fill(); g.strokeStyle = P.ice; g.lineWidth = 4; g.stroke();
      [[0, -0.6, 'prow'], [0, 0, 'dorsal'], [0.45, 0.7, 'stbdNac'], [-0.45, 0.7, 'portNac'], [0, 0.5, 'engines']].forEach(([dx, dy, id], i) => { hexNode(g, cx + dx * sz, cy + dy * sz, 5); g.fillStyle = zcol(P, id); g.globalAlpha = 0.6 + 0.4 * Math.sin(elapsed * 2 + i * 1.4); g.fill(); g.globalAlpha = 1; });
      lights(g, sub(g, b, 'SYSTEMS', P.acc, P), [['WARP DRIVE', simCanWarp() ? (state.speed === 'warp' ? 'act' : 'ok') : 'alert'], ['IMPULSE', zoneStatus('engines')], ['DEFLECTOR', state.alert === 'green' ? 'ok' : 'act'], ['DORSAL TURRET', zoneStatus('dorsal')], ['VENTRAL ARRAY', zoneStatus('ventral')], ['TORPEDOES', zoneStatus('prow')], ['PORT EMITTERS', zoneStatus('port')], ['STBD EMITTERS', zoneStatus('stbd')], ['LIFE SUPPORT', 'ok'], ['CONTAINMENT', breach ? 'blink' : 'ok']], P);
      table(g, sub(g, c, 'SHIP', P.acc, P), [['SPEED', SPEEDS[state.speed].screen], ['HULL', Math.round(hullIntegrity()) + '%', zcol(P, worstZone() ? worstZone().id : 'prow')]], P);
    } else {
      const [a, b] = split(R, [1.2, 1], true, h * 0.03);
      plotW(g, sub(g, a, 'SECTOR PLOT', P.ice, P), P);
      table(g, sub(g, b, 'CONTACTS', P.ice, P), [['AMITY ROSE', 'FRIENDLY', P.ice], ['KESTREL MAIDEN', 'FRIENDLY', P.ice], ['IRON PATIENCE', 'FRIENDLY', P.ice], ['TRACK 0417', state.alert !== 'green' ? 'UNKNOWN' : 'BEACON', state.alert !== 'green' ? P.acc : P.ice], ['DESTINATION', sysDest().star.toUpperCase()]], P);
    }
  },
};
DRAW.nav = DRAW.helm;
LOGS.intel = ['TRACK 0412 CLASSIFIED FREIGHTER', 'TRACK 0413 CLASSIFIED FREIGHTER', 'TRACK 0414 BEACON · NAV HAZARD', 'TRACK 0415 COMET · INERT', 'TRACK 0416 SURVEY PROBE · OURS', 'TRACK 0417 UNRESOLVED · WATCHING', 'PATROL ROUTE 7 · NO ACTIVITY', 'COMINT · NO NEW INTERCEPTS'];
DRAW.wpn = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, red = state.alert === 'red', rows = weaponRows(P);
  const ch = [['WEAPONS POD', sim.beams.dorsal, P.acc], ['VENTRAL ARRAY', sim.beams.ventral, P.acc], ['BAY 1 LOAD', sim.bays[0].reload, P.ice], ['BAY 2 LOAD', sim.bays[1].reload, P.ice]];
  const fc = [['SAFETIES', red ? 'warn' : 'ok'], ['FIRE CONTROL', red ? 'act' : 'ok'], ['WEAPONS POWER', eff('weapons') >= 1 ? 'ok' : 'warn'], ['MAGAZINE', torpsLeft() > 0 ? 'ok' : 'alert']];
  if (h < 170) { const [a, b, c] = split(R, [0.6, 1.3, 1], false, w * 0.03); reticleW(g, sub(g, a, 'TARGET', P.acc, P), P); table(g, sub(g, b, 'WEAPONS', P.acc, P), rows.slice(0, 4), P); bars(g, sub(g, c, 'CHARGE', P.acc, P), [['DORSAL', ch[0][1], P.acc], ['VENTRAL', ch[1][1], P.acc], ['TUBES', (ch[2][1] + ch[3][1]) / 2, P.ice]], P); return; }
  const [top, bot] = split(R, [1.2, 1], true, h * 0.05); const [a, b] = split(top, [0.9, 1.3], false, w * 0.03);
  reticleW(g, sub(g, a, 'TARGETING', P.acc, P), P); table(g, sub(g, b, 'WEAPONS', P.acc, P), rows, P);
  const [c, d] = split(bot, [1.3, 1], false, w * 0.03);
  bars(g, sub(g, c, 'CAPACITORS AND TUBES', P.acc, P), ch, P);
  lights(g, sub(g, d, 'FIRE CONTROL', P.acc, P), fc, P);
};
DRAW.ew = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, armed = state.alert !== 'green', masked = state.alert === 'red';
  const em = [['PROFILE', masked ? 'MASKED' : 'STANDARD', masked ? P.ice : P.txt], ['JAMMERS', armed ? 'ARMED' : 'STANDBY', armed ? P.acc : P.dim], ['DECOYS', '4 READY'], ['THREATS', '0 HOSTILE', P.ice]];
  if (h < 170) { const [a, b] = split(R, [1.3, 1], false, w * 0.03); spark(g, sub(g, a, 'THREAT SPECTRUM', P.ice, P), P.ice, 5, 3, P); table(g, sub(g, b, 'EMISSIONS', P.ice, P), em.slice(0, 3), P); return; }
  const [top, bot] = split(R, [1, 1], true, h * 0.05); const [a, b] = split(top, [1.6, 0.8], false, w * 0.03);
  spark(g, sub(g, a, 'THREAT SPECTRUM · 0.1–60 GHZ', P.ice, P), P.ice, 5, 3, P);
  lights(g, sub(g, b, 'RECEIVERS', P.ice, P), [['BAND A', 'ok'], ['BAND B', 'ok'], ['BAND C', armed ? 'blink' : 'ok'], ['BAND D', 'ok']], P);
  const [c, d] = split(bot, [1, 1.1], false, w * 0.03);
  table(g, sub(g, c, 'EMISSIONS', P.ice, P), em, P);
  bars(g, sub(g, d, 'COUNTERMEASURES', P.ice, P), [['JAM POWER', armed ? 0.7 : 0.05, P.acc], ['DECOY CHARGE', 0.8, P.ice], ['MASKING', masked ? 0.95 : 0.1, P.ice]], P);
};
DRAW.intel = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, up = state.alert !== 'green';
  const ct = [['TRACKED', '7'], ['FRIENDLY', '3', P.green], ['UNKNOWN', up ? '1 · 0417' : '0', up ? P.yel : P.dim], ['THREAT', state.alert === 'red' ? 'HIGH' : up ? 'ELEVATED' : 'LOW', state.alert === 'red' ? P.red : up ? P.yel : P.green]];
  if (h < 170) { const [a, b] = split(R, [0.7, 1.4], false, w * 0.03); plotW(g, sub(g, a, 'TRACKS', P.green, P), P); table(g, sub(g, b, 'ASSESSMENT', P.green, P), ct.slice(0, 3), P); return; }
  const [top, bot] = split(R, [1.2, 1], true, h * 0.05); const [a, b] = split(top, [0.9, 1.2], false, w * 0.03);
  plotW(g, sub(g, a, 'TRACKING', P.green, P), P); table(g, sub(g, b, 'ASSESSMENT', P.green, P), ct, P);
  logw(g, sub(g, bot, 'INTELLIGENCE FEED', P.green, P), LOGS.intel, P, 0.45);
};
DRAW.env = function (g, x, y, w, h, P) {
  const R = { x, y, w, h };
  const ls = [['O2 PARTIAL', jit(0.84, 0.01, 0.6, 1), P.ice], ['CO2 SCRUB', jit(0.72, 0.02, 0.4, 2), P.ice], ['HUMIDITY', 0.42, P.ice], ['PRESSURE', 0.9, P.ice]];
  if (h < 170) { const [a, b] = split(R, [0.9, 1.3], false, w * 0.03); const ca = sub(g, a, 'ATMOSPHERE', P.acc, P); big(g, ca, jit(21.4, 0.05, 0.5, 1).toFixed(1), '% O2', P.acc, P); bars(g, sub(g, b, 'LIFE SUPPORT', P.acc, P), ls.slice(0, 3), P); return; }
  const [top, bot] = split(R, [1, 1], true, h * 0.05); const [a, b] = split(top, [0.9, 1.3], false, w * 0.03);
  const ca = sub(g, a, 'ATMOSPHERE', P.acc, P); const [a1, a2] = split(ca, [1, 1], true, 4); big(g, a1, jit(21.4, 0.05, 0.5, 1).toFixed(1), '% O2', P.acc, P); spark(g, a2, P.acc, 7, 0.8, P, 0.3);
  bars(g, sub(g, b, 'LIFE SUPPORT', P.acc, P), ls, P);
  const [c, d] = split(bot, [1.3, 1], false, w * 0.03);
  lights(g, sub(g, c, 'DECKS', P.acc, P), [['DECK 1', 'ok'], ['DECK 2', 'ok'], ['DECK 3', 'ok'], ['DECK 4', 'ok'], ['DECK 5', 'ok'], ['DECK 6', 'ok'], ['DECK 7', 'ok'], ['DECK 8', 'ok']], P, 2);
  table(g, sub(g, d, 'BRIDGE', P.acc, P), [['TEMP', '21.5 °C'], ['GRAVITY', '1.00 G'], ['LIGHTING', state.light.toUpperCase()]], P);
};

// ---------- ready room + conference room displays ----------
function wrapText(g, text, x, y, maxW, lh, maxLines) {
  const words = text.split(' '); let line = '', n = 0;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y + n * lh); n++; line = w; if (n >= maxLines) return n; } else line = t; }
  if (line && n < maxLines) { g.fillText(line, x, y + n * lh); n++; }
  return n;
}
const LOG = [
  { d: '2.114.07', t: 'Convoy escort, day six. Three freighters, one warship and a lot of empty sky. The crew is tired but sharp. I would rather they were tired than surprised.' },
  { d: '2.115.02', t: 'We lost the Kestrel Maiden for eleven minutes today, sensor shadow behind a gas giant. Longest eleven minutes of the month. Everyone on the bridge pretended to breathe normally.' },
  { d: '2.116.19', t: 'Science found microbial life under the ice at Mira Vey. Logged it, marked it and moved on. Someday somebody will come back here with time to spare. I hope it is us.' },
  { d: '2.117.04', t: 'Engineering wants a week in drydock and coil bank B recalibrated. They will get both the day the war gives them back. Until then she holds together because they hold her together.' },
];
const SLIDES = ['Convoy Route', 'Threat Assessment', 'Ship Readiness'];
function routeW(g, r, P) {
  const pts = [[0.1, 0.66], [0.37, 0.34], [0.63, 0.62], [0.9, 0.3]].map(([u, v]) => [r.x + u * r.w, r.y + v * r.h]);
  g.strokeStyle = P.line; g.lineWidth = 3; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  const a = pts[state.cur], b = pts[state.dest];
  g.setLineDash([10, 7]); g.strokeStyle = P.ice; g.lineWidth = 3; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.setLineDash([]);
  const fs = clamp(r.h * 0.07, 9, 22);
  pts.forEach(([x, y], i) => {
    hexNode(g, x, y, fs * 0.9); g.fillStyle = i === state.cur ? P.ice : i === state.dest ? P.acc : P.ice; g.fill();
    hexNode(g, x, y, fs * 0.4); g.fillStyle = '#000'; g.fill();
    g.fillStyle = i === state.cur || i === state.dest ? P.txt : P.dim; g.font = `600 ${fs | 0}px ${DISP}`; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText(SYSTEMS[i].star.toUpperCase(), x, y + fs * 1.2);
  });
  const t = state.speed === 'warp' ? (elapsed * 0.08) % 1 : 0.0, cx = a[0] + (b[0] - a[0]) * t, cy = a[1] + (b[1] - a[1]) * t;
  [[0, 0, P.acc], [-14, 10, P.ice], [-26, 2, P.ice], [-18, -10, P.ice]].forEach(([dx, dy, c]) => { hexNode(g, cx + dx, cy + dy - fs * 1.6, dx ? 5 : 7); g.fillStyle = c; g.fill(); });
}
DRAW.log = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, e = LOG[state.logIdx];
  const [a, b] = split(R, [1.75, 1], false, w * 0.04);
  const ca = sub(g, a, 'PERSONAL LOG · ' + e.d, P.acc, P);
  const fs = clamp(ca.h / 6.4, 9, 24); g.font = `500 ${fs | 0}px Barlow, system-ui, sans-serif`; g.fillStyle = P.txt; g.textAlign = 'left'; g.textBaseline = 'top';
  wrapText(g, e.t, ca.x, ca.y + 2, ca.w, fs * 1.32, 5);
  table(g, sub(g, b, 'DESK', P.acc, P), [['REPORTS', state.reports ? state.reports + ' TO SIGN' : 'ALL SIGNED', state.reports ? P.yel : P.green], ['NEXT BRIEF', '0800'], ['WATCH', 'BETA'], ['CONVOY', '3 · GREEN', P.green]], P);
};
DRAW.brief = function (g, x, y, w, h, P) {
  const R = { x, y, w, h };
  if (state.slide === 0) {
    const [a, b] = split(R, [1.7, 1], false, w * 0.03);
    routeW(g, sub(g, a, 'ROUTE · FOUR SYSTEMS', P.acc, P), P);
    table(g, sub(g, b, 'ITINERARY', P.acc, P), SYSTEMS.map((s, i) => [s.star.toUpperCase(), i === state.cur ? 'HERE' : i === state.dest ? 'NEXT' : '—', i === state.cur ? P.green : i === state.dest ? P.acc : P.dim]).concat([['ESCORTING', '3 FREIGHTERS']]), P);
  } else if (state.slide === 1) {
    const [a, b] = split(R, [1, 1.25], false, w * 0.03);
    plotW(g, sub(g, a, 'SECTOR PLOT', P.red, P), P);
    const [b1, b2] = split(b, [1.1, 1], true, h * 0.05);
    bars(g, sub(g, b1, 'THREAT BY SECTOR', P.red, P), [['SECTOR 7', 0.18, P.green], ['SECTOR 8', 0.42, P.yel], ['SECTOR 9', 0.71, P.red], ['DEEP FIELD', 0.3, P.yel]], P);
    logw(g, sub(g, b2, 'INTELLIGENCE', P.red, P), LOGS.intel, P, 0.4);
  } else {
    const [a, b] = split(R, [1.25, 1], false, w * 0.03);
    bars(g, sub(g, a, 'DEPARTMENT READINESS', P.yel, P), [['FLIGHT', 0.96, P.green], ['TACTICAL', 0.92, P.green], ['ENGINEERING', 0.81, P.yel], ['SCIENCE', 0.88, P.green], ['MEDICAL', 0.94, P.green], ['STORES', 0.86, P.yel]], P);
    lights(g, sub(g, b, 'OPEN ITEMS', P.yel, P), [['COIL BANK B RECAL', 'warn'], ['SIF GEN 2 SERVICE', 'warn'], ['TORPEDO RESUPPLY', 'ok'], ['SHUTTLE 2 INSPECTION', 'ok'], ['SHORE LEAVE ROTA', 'off'], ['CREW EVALUATIONS', 'act']], P);
  }
};
function plotW(g, r, P) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2 * 0.92;
  g.fillStyle = P.line; g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.fill();
  g.fillStyle = '#000'; [0.72, 0.46].forEach((k) => { g.beginPath(); g.arc(cx, cy, rad * k, 0, 7); g.fill(); g.fillStyle = k > 0.5 ? P.line : '#000'; g.beginPath(); g.arc(cx, cy, rad * k - rad * 0.06, 0, 7); g.fill(); g.fillStyle = '#000'; });
  const sw = elapsed * 0.9; g.fillStyle = P.ice; g.globalAlpha = 0.85; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, rad, sw - 0.22, sw); g.closePath(); g.fill(); g.globalAlpha = 1;
  const rr = mulberry(51 + state.cur);
  for (let i = 0; i < 7; i++) { const an = rr() * 7, d = 0.3 + rr() * 0.6, s = rad * 0.07; g.fillStyle = i === 3 && state.alert !== 'green' ? P.acc : i < 3 ? P.butter : P.ice; rrect(g, cx + Math.cos(an) * d * rad - s, cy + Math.sin(an) * d * rad - s, s * 2, s * 2, s * 0.4); g.fill(); }
  g.fillStyle = P.acc; rrect(g, cx - rad * 0.09, cy - rad * 0.09, rad * 0.18, rad * 0.18, rad * 0.04); g.fill();
}
function reticleW(g, r, P) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2 * 0.9, red = state.alert === 'red';
  for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2 + 0.12; g.strokeStyle = q % 2 ? P.plum : P.tan; g.lineWidth = rad * 0.16; g.beginPath(); g.arc(cx, cy, rad * 0.88, a, a + Math.PI / 2 - 0.24); g.stroke(); }
  g.fillStyle = P.line; g.fillRect(cx - rad * 0.62, cy - rad * 0.03, rad * 1.24, rad * 0.06); g.fillRect(cx - rad * 0.03, cy - rad * 0.62, rad * 0.06, rad * 1.24);
  const a = elapsed * 0.6; g.strokeStyle = red ? P.red : P.ice; g.lineWidth = rad * 0.08;
  for (let i = 0; i < 4; i++) { const b = a + i * Math.PI / 2; g.beginPath(); g.arc(cx, cy, rad * 0.62, b, b + 0.5); g.stroke(); }
  if (red) { const tx = cx + Math.cos(elapsed * 0.4) * rad * 0.35, ty = cy + Math.sin(elapsed * 0.55) * rad * 0.25, s = rad * 0.13 * (1 + 0.1 * Math.sin(elapsed * 8)); g.fillStyle = P.red; rrect(g, tx - s, ty - s, s * 2, s * 2, s * 0.3); g.fill(); }
}
function drawKeys(s) {
  const g = s.g, W = s.w, H = s.h, P = pal();
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const cols = Math.max(3, Math.round(W / 40)), rows = Math.max(1, Math.round(H / 32));
  const cw = W / cols, ch = H / rows, colors = [P.acc, P.tan, P.ice, P.butter, P.tan, P.rose];
  const r = mulberry(s.seed);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const base = r(), rate = 0.3 + r() * 1.6, col = colors[(r() * colors.length) | 0], wide = base > 0.78 && i < cols - 1;
    if (r() < 0.12) continue; // a gap now and then, so the pad reads as laid out rather than tiled
    // keys hold their state; roughly one in eight is 'live' and flips on its own slow timing
    const live = rate > 1.7, on = live ? slowTick(s.seed * 17 + j * cols + i, 5, 20) % 3 !== 0 : base > 0.22;
    const pw = cw * (wide ? 1.7 : 0.84), ph = ch * 0.7, kx = i * cw + cw * 0.08, ky = j * ch + (ch - ph) / 2;
    hexTab(g, kx, ky, pw, ph, (i + j) % 3 === 0, (i + j) % 3 === 1); g.fillStyle = on ? col : P.line; g.fill();
    if (ph > 14) { g.fillStyle = on ? '#000' : P.dim; g.font = `600 ${ph * 0.42 | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(String((base * 89 | 0) + 10), kx + pw - ph * 0.3, ky + ph / 2 + 1); }
    if (wide) i++;
  }
}
function drawBand(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), green = state.alert === 'green', pad = H * 0.08, colW = H * 0.34, barH = H * 0.12;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  elbow(g, pad, pad, colW, barH, W * 0.3, H * 0.12, true, green ? P.tan : P.acc);
  elbow(g, pad, H - pad, colW, barH, W * 0.22, H * 0.12, false, green ? P.ice : P.acc);
  g.textBaseline = 'middle'; g.textAlign = 'left';
  fitFont(g, green ? 'STANDING DOWN' : s.title, 600, H * 0.3, DISP, W * 0.44); g.fillStyle = green ? P.txt : P.acc; g.fillText(green ? 'STANDING DOWN' : s.title, pad + colW + H * 0.12, H * 0.46);
  const n = 10, sx = W * 0.56, sw = (W * 0.96 - sx) / n;
  for (let i = 0; i < n; i++) { const on = green ? i < 2 : true; hexTab(g, sx + i * sw, H * 0.3, sw - 4, H * 0.32, i === 0, i === n - 1); g.fillStyle = on ? (green ? P.tan : i % 3 === 2 ? P.butter : P.acc) : P.line; g.fill(); }
  g.fillStyle = P.tan; g.font = `500 ${H * 0.13 | 0}px ${DISP}`; g.textAlign = 'right'; g.fillText(green ? 'WATCH ROTATION 2 OF 3' : 'ALL STATIONS MANNED', W * 0.96, H * 0.8);
}
function drawCmd(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), p = 6, bw = W - p * 2;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  hexTab(g, p, p, bw, 22, true, true); g.fillStyle = P.acc; g.fill();
  g.fillStyle = '#000'; g.font = `600 15px ${DISP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('COMMAND', W / 2, p + 12);
  const blk = (y, h, label, value, c) => { g.fillStyle = c; g.fillRect(p, y, 10, h); g.fillStyle = P.tan; g.font = `500 13px ${DISP}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(label, p + 16, y); fitFont(g, value, 600, 24, DISP, bw - 18); g.fillStyle = c === P.acc ? P.butter : P.txt; g.fillText(value, p + 16, y + 16); };
  blk(40, 44, 'CONDITION', ALERTS[state.alert].short, P.acc);
  blk(94, 44, 'SPEED', SPEEDS[state.speed].screen.split(' ')[0], P.ice);
  const rows = [['SHIELDS', ARCS.reduce((a, k) => a + shieldNow(k), 0) / 400], ['HULL', hullIntegrity() / 100], ['POWER', reactorOut() / SIM.reactor], ['BEAMS', (sim.beams.dorsal + sim.beams.ventral) / 2], ['TORPS', torpsLeft() / (SIM.torp.perBay * 2)]];
  rows.forEach(([k, v], i) => { const y0 = 152 + i * 34; g.fillStyle = P.tan; g.font = `500 12px ${DISP}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(k, p, y0); g.fillStyle = P.line; g.fillRect(p, y0 + 15, bw, 12); hexTab(g, p, y0 + 15, Math.max(12, bw * clamp(v, 0, 1)), 12, false, true); g.fillStyle = k === 'HULL' && v < 0.5 ? P.red : [P.acc, P.ice, P.butter, P.tan, P.rose][i]; g.fill(); });
  hexTab(g, p, H - p - 14, bw, 14, true, true); g.fillStyle = P.plum; g.fill();
}
// the status strip on the shelf above a wall station: code cap, title, then a run of blocks
function drawStrip(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), p = Math.round(H * 0.14), bh = H - p * 2, cap = bh * 2.2;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  hexTab(g, p, p, cap, bh, true, false); g.fillStyle = P.acc; g.fill();
  g.fillStyle = '#000'; g.font = `600 ${bh * 0.6 | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText((s.code.split('·')[1] || ''), p + cap - bh * 0.25, H / 2 + 1);
  const t = s.title.toUpperCase(); fitFont(g, t, 600, bh * 0.92, DISP, W * 0.32); g.fillStyle = P.acc; g.textAlign = 'left'; g.fillText(t, p + cap + bh * 0.3, H / 2 + 2);
  let x = p + cap + bh * 0.6 + g.measureText(t).width; const r = mulberry(s.seed + 5), cols = [P.tan, P.ice, P.butter, P.plum, P.tan, P.rose];
  while (x < W - p - bh * 0.8) { const w = bh * (0.8 + r() * 3.2), c = cols[(r() * cols.length) | 0], kk = r(), on = kk > 0.85 ? slowTick(s.seed * 23 + x, 6, 24) % 3 !== 0 : r() > 0.12; g.fillStyle = on ? c : P.line; g.fillRect(x, p, Math.min(w, W - p - bh * 0.8 - x), bh); x += w + bh * 0.25; }
  hexTab(g, W - p - bh * 0.6, p, bh * 0.6, bh, false, true); g.fillStyle = P.acc; g.fill();
}
// Deck 2: the lobby directory and the wardroom mess board
DRAW.deck2 = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, [a, b] = split(R, [1.4, 1], false, w * 0.04);
  table(g, sub(g, a, 'OFFICERS’ DECK', P.acc, P), [['CAPTAIN’S QUARTERS', 'FORWARD'], ['LIFT 1 LOBBY', 'YOU ARE HERE', P.acc], ['FIRST OFFICER', 'PORT'], ['SENIOR OFFICERS', 'STARBOARD'], ['OFFICERS’ WARDROOM', 'AFT'], ['OBSERVATION LOUNGE', 'AFT']], P);
  lights(g, sub(g, b, 'DECK', P.ice, P), [['ATMOSPHERE', 'ok'], ['GRAVITY', 'ok'], ['LIGHTING', state.alert === 'red' ? 'alert' : 'ok'], ['SHUTTERS', state.alert === 'red' ? 'alert' : 'ok'], ['LIFT 1', typeof LIFT === 'undefined' || LIFT.phase === 'idle' ? 'ok' : 'act']], P);
};
// the first officer's desk: the duty roster and the departments' standing
DRAW.xo = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, [a, b] = split(R, [1.3, 1], false, w * 0.04), red = state.alert === 'red';
  table(g, sub(g, a, 'DUTY ROSTER', P.acc, P), [['ALPHA WATCH', '0800–1600'], ['BETA WATCH', '1600–0000'], ['GAMMA WATCH', '0000–0800'], ['NEXT DRILL', red ? 'NOW' : 'DAY 3', red ? P.red : P.txt]], P);
  lights(g, sub(g, b, 'DEPARTMENTS', P.ice, P), [['ENGINEERING', 'ok'], ['TACTICAL', red ? 'alert' : 'ok'], ['SCIENCE', 'ok'], ['MEDICAL', 'ok'], ['OPERATIONS', 'act']], P);
};
// a senior officer's desk: messages waiting and the officer's watches
DRAW.cabin = function (g, x, y, w, h, P, s) {
  const R = { x, y, w, h }, [a, b] = split(R, [1.3, 1], false, w * 0.04), n = s && s.station === 'so2desk' ? 1 : 0;
  table(g, sub(g, a, 'MESSAGES', P.acc, P), [['FROM HOME', n ? '1 NEW' : '2 NEW'], ['DEPT REPORT', 'DUE 1700'], ['WARDROOM', 'DINNER 1830'], ['TRAINING', n ? 'SIM BAY 4' : 'DAMAGE DRILL']], P);
  lights(g, sub(g, b, 'MY WATCHES', P.ice, P), [['ALPHA', n ? 'off' : 'act'], ['BETA', n ? 'act' : 'off'], ['GAMMA', 'off'], ['ON CALL', state.alert === 'green' ? 'ok' : 'alert']], P);
};
// the observation lounge board: what you are looking at out of the aft window
DRAW.lounge = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, [a, b] = split(R, [1.3, 1], false, w * 0.04), red = state.alert === 'red', warp = state.speed === 'warp';
  table(g, sub(g, a, 'VIEW AFT', P.acc, P), [['WEAPONS POD', red ? 'ARMED' : 'SAFE', red ? P.red : P.txt], ['ROLLBAR', red ? 'FLOODS OFF' : 'FLOODLIT'], ['POD RANGE', '38 M'], ['SHUTTERS', red ? 'CLOSED' : 'OPEN', red ? P.red : P.txt]], P);
  lights(g, sub(g, b, 'EXTERIOR', P.ice, P), [['RUNNING LIGHTS', 'ok'], ['ROLLBAR FLOODS', red ? 'off' : 'ok'], ['NACELLE GRILLES', warp ? 'act' : 'ok'], ['TURRET', red ? 'alert' : 'off']], P);
};
DRAW.mess = function (g, x, y, w, h, P) {
  const R = { x, y, w, h }, [a, b] = split(R, [1.3, 1], false, w * 0.04), [b1, b2] = split(b, [1, 1], true, h * 0.06);
  table(g, sub(g, a, 'MESS · TODAY', P.acc, P), [['0630', 'BREAKFAST · ALPHA WATCH'], ['1200', 'MIDDAY · ALL WATCHES'], ['1830', 'OFFICERS’ DINNER'], ['2200', 'NIGHT GALLEY'], ['HOST', 'FIRST OFFICER']], P);
  lights(g, sub(g, b1, 'TABLE', P.ice, P), [['SEATS 10', 'ok'], ['GUESTS 2', 'act']], P);
  spark(g, sub(g, b2, 'GALLEY', P.acc, P), P.tan, 4, 0.5, P, 0.4);
};
// the narrow panel beside each wall station's main display
DRAW.aux = function (g, x, y, w, h, P, s) {
  const R = { x, y, w, h }, [a, b, c] = split(R, [1, 1.1, 0.9], true, h * 0.04), up = state.alert !== 'green';
  ringW(g, sub(g, a, 'LOAD', P.acc, P), P, Math.round(jit(58 + (s.seed % 30), 2, 0.4, s.seed)) + '%', 'DUTY');
  lights(g, sub(g, b, 'BUS', P.ice, P), [['PRIMARY', 'ok'], ['BACKUP', 'ok'], ['LINK ' + (s.seed % 9 + 1), up ? 'act' : 'ok'], ['ISOLATE', 'off'], ['RELAY', up ? 'warn' : 'ok']], P);
  spark(g, sub(g, c, 'TRACE', P.acc, P), P.ice, s.seed, 1.2, P);
};
// ---------- master systems display (aft bridge wall) ----------
// A cutaway of the Defiance: a lens-shaped saucer flowing into a slim engineering body, a rollbar over the back carrying
// the weapons pod and its torpedo launchers, and long nacelles just above the saucer on swept pylons. Original design,
// in the spirit of the sleek late-century cruisers. Left panel: side cutaway with every deck and compartment, callouts and live damage.
// Right panel: plan view with live shield arcs and the warp field, deck index and readouts.
// The hull and compartments are drawn once into a cached layer per alert/damage state; live parts are drawn on top.
// The ship geometry (SHIPGEO and its path helpers) lives in shipgeo.js, loaded before this file.
// compartments for the cutaway: [deck, from m, to m, colour kind, side]; walkable rooms get the bright 'w' colours
const MSD_ROOMS = SHIPGEO.rooms.flatMap((rs, i) => rs.map(([a, b, , st, k, side]) => [i + 1, a, b, st === 'w' ? 'w' : k === 'w' ? 'l' : k, side]));
const msdTopAt = (m) => { const T = SHIPGEO.top; for (let i = 1; i < T.length; i++) if (m <= T[i][0]) { const [a, x] = T[i - 1], [b, y] = T[i]; return x + (y - x) * (m - a) / (b - a); } return T[T.length - 1][1]; };
// a point a fraction f of the way along a polyline [[m, d]...]
const msdAlong = (pts, f) => { const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; } let r = f * tot; for (let i = 0; i < L.length; i++) { if (r <= L[i]) { const k = r / L[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } r -= L[i]; } return pts[pts.length - 1]; };
const MSD_FEED = [[110, 19.2], [108, 13.6], [114, 8.6], [120, 4.4], [126, 0.8], [130, -2.6]]; // power and torpedoes up the rollbar to the weapons pod
function msdPaths(X, Y) {
  const S = shipSide(X, Y), turret = new Path2D(S.pod); turret.addPath(new Path2D(S.launchers));
  return { hull: new Path2D(S.hull), bridge: new Path2D(S.spine), arch: new Path2D(S.arch), turret, spar: new Path2D(S.spar), nac: new Path2D(S.nacelle) };
}
function msdPlan(X, Z) { const P = shipPlan(X, Z); return { hull: new Path2D(P.hull), nacs: P.nacs.map((d) => new Path2D(d)), spars: P.spars.map((d) => new Path2D(d)) }; }
// draw a set of shapes with a single clean outline round their union: thick outline strokes first, fills on top
function msdUnion(g, paths, fill, line, lw) { g.lineJoin = 'round'; g.strokeStyle = line; g.lineWidth = lw * 2; paths.forEach((p) => g.stroke(p)); g.fillStyle = fill; paths.forEach((p) => g.fill(p)); }
// Layout (2048 x 820): left panel = plan view with shields and warp field, warp field geometry inset below;
// right panel = the side cutaway with stacked callout lists at its four corners, title top right.
const MSD_LISTS = {
  tl: [['SICKBAY', 64, 8.9], ['SENSOR PALLET', 56.5, 5.2], ['FORWARD SHIELD GENERATOR', 50, 8.9], ['CAPTAIN’S QUARTERS', 62, 5.2], ['BRIDGE', 64, 1.8], ['LIFT 1', 71.3, 12.3], ['SENIOR OFFICERS’ CABINS', 75, 4.4], ['WARDROOM', 85, 4.4]],
  tr: [['POD CAPACITORS', 86.5, 6.2], ['OBSERVATION LOUNGE', 92, 5.2], ['COMPUTER CORE', 115, 14], ['WEAPONS POD', 133, -6.4], ['SHIELD GENERATORS', 140, 12.3], ['LIFE SUPPORT', 170, 12.3], ['IMPULSE ENGINES', 198, 19]],
  bl: [['DEFLECTOR', 9, 21.4], ['TORPEDO BAYS', 13, 16.1], ['TORPEDO MAGAZINE', 28, 15.7], ['ARMORY', 41, 15.7], ['CARGO BAY 1', 58, 19.2], ['MESS HALL', 60, 12.3]],
  br: [['CIC', 112, 22.7], ['VENTRAL ARRAY', 114, 26.2], ['LIFT 2', 126.5, 36], ['WARP CORE', 146, 30], ['MAIN ENGINEERING', 150, 19.2], ['NACELLE FIELD COILS', 164, 26.2], ['ANTIMATTER PODS', 172, 36.7], ['SHUTTLEBAY', 186, 29.7]],
};
const MSD = { key: '', base: null };
function msdGeom(W, H) {
  const u = W / 2048;
  const L = { x: 16 * u, y: 16 * u, w: 620 * u, h: H - 32 * u }, R = { x: 656 * u, y: 16 * u, w: W - 672 * u, h: H - 32 * u };
  const S = 5.3 * u, X = (m) => R.x + 140 * u + m * S, Y = (m) => R.y + 280 * u + m * S;
  const PS = 2.4 * u, PX = (m) => L.x + 110 * u + m * PS, PZ = (m) => L.y + 262 * u + m * PS;
  return { u, L, R, S, X, Y, PS, PX, PZ, colW: 60 * u, barH: 20 * u };
}
function msdBase(W, H, P) {
  const c = cnv(W, H), g = c.getContext('2d'), G = msdGeom(W, H), { u, L, R, S, X, Y, PS, PX, PZ, colW, barH } = G;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  // ---- frames ----
  elbow(g, L.x, L.y, colW, barH, 300 * u, 60 * u, true, P.butter); elbow(g, L.x, L.y + L.h, colW, barH, 340 * u, 60 * u, false, P.acc);
  [[310, 150, P.acc], [466, 154, P.tan]].forEach(([x, w, cc]) => { g.fillStyle = cc; g.fillRect(L.x + x * u, L.y, w * u, barH); });
  [[350, 110, P.ice], [466, 154, P.butter]].forEach(([x, w, cc]) => { g.fillStyle = cc; g.fillRect(L.x + x * u, L.y + L.h - barH, w * u, barH); });
  { const rr = mulberry(808), top = L.y + barH + 66 * u, bot = L.y + L.h - barH - 66 * u, n = 8, kh = (bot - top - (n - 1) * 5 * u) / n;
    for (let i = 0; i < n; i++) { g.fillStyle = [P.ice, P.tan, P.butter, P.rose, P.plum, P.acc][(rr() * 6) | 0]; g.fillRect(L.x, top + i * (kh + 5 * u), colW, kh); g.fillStyle = '#000'; g.font = `600 ${12 * u | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText(String(10 + i * 7) + '-' + String(1000 + ((i * 3779) % 8999)), L.x + colW - 4 * u, top + i * (kh + 5 * u) + kh - 3 * u); } }
  // the divider between the panels: a column of blocks, like a spine
  { const x = R.x - 14 * u, top = R.y + 70 * u; [[90, P.plum], [40, P.ice], [210, P.plum], [60, P.butter], [150, P.plum], [80, P.acc]].reduce((y, [h, cc]) => { g.fillStyle = cc; g.fillRect(x, y, 24 * u, h * u); return y + h * u + 5 * u; }, top); }
  g.save(); g.translate(R.x + R.w, 0); g.scale(-1, 1);
  elbow(g, 0, R.y, colW, barH, 560 * u, 60 * u, true, P.butter); elbow(g, 0, R.y + R.h, colW, barH, 420 * u, 60 * u, false, P.butter);
  { const rr = mulberry(909), top = R.y + barH + 66 * u, bot = R.y + R.h - barH - 66 * u, n = 7, kh = (bot - top - (n - 1) * 5 * u) / n;
    for (let i = 0; i < n; i++) { g.fillStyle = [P.tan, P.ice, P.plum, P.acc, P.butter][(rr() * 5) | 0]; g.fillRect(0, top + i * (kh + 5 * u), colW, kh); } }
  g.restore();
  g.fillStyle = P.butter; g.fillRect(R.x + 30 * u, R.y, R.w - 620 * u, barH); g.fillStyle = P.plum; g.fillRect(R.x + 30 * u, R.y + R.h - barH, 200 * u, barH); g.fillStyle = P.butter; g.fillRect(R.x + 240 * u, R.y + R.h - barH, R.w - 700 * u, barH);
  // ---- side cutaway ----
  const p = msdPaths(X, Y);
  msdUnion(g, [p.nac, p.hull, p.bridge, p.arch, p.turret], '#120d12', P.txt, 2.6 * u);
  const clipDraw = (path, fn) => { g.save(); g.clip(path); fn(); g.restore(); };
  const KC = { w: [P.acc, P.butter], l: [P.ice, P.plum], s: [P.plum, P.ice], x: [P.rose, P.plum], e: [P.butter, P.acc] };
  const rooms = () => {
    const rr = mulberry(4242);
    g.fillStyle = '#1b141b'; g.fillRect(X(-2), Y(-8), 206 * S, 60 * S);
    MSD_ROOMS.forEach(([d, a, b, k, side]) => {
      let y0 = Y((d - 1) * 3.5) + 1.6 * u, y1 = Y(d * 3.5) - 1; const mid = (y0 + y1) / 2; if (side === 's') y1 = mid - 0.8 * u; else if (side === 'p') y0 = mid + 0.8 * u;
      const cells = Math.max(1, Math.round((b - a) * S / (13 * u))), cwid = (b - a) * S / cells;
      for (let i = 0; i < cells; i++) {
        const x0 = X(a) + i * cwid + 1, w = cwid - 1.6 * u, [c1, c2] = KC[k];
        g.fillStyle = rr() < 0.72 ? c1 : c2; g.globalAlpha = k === 'w' ? 0.95 : 0.62 + rr() * 0.3; g.fillRect(x0, y0, w, y1 - y0); g.globalAlpha = 1;
        if (rr() < 0.55) { g.fillStyle = rr() < 0.5 ? 'rgba(0,0,0,0.45)' : 'rgba(255,240,220,0.35)'; g.fillRect(x0 + w * rr() * 0.5, y0 + (y1 - y0) * (0.35 + rr() * 0.3), w * (0.25 + rr() * 0.35), (y1 - y0) * 0.22); }
      }
    });
    for (let d = 0; d <= 12; d++) { g.fillStyle = '#000'; g.fillRect(X(-2), Y(d * 3.5) - 1.2 * u, 206 * S, 2 * u); }
    for (let m = 10; m < 200; m += 10) { g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(X(m), Y(-8), 1.6 * u, 60 * S); }
    // structures that run through several decks: lifts, the computer core, the EPS trunk, the torpedo tubes
    g.fillStyle = P.txt; g.fillRect(X(70.3), Y(0.4), 2.1 * S, Y(21) - Y(0.4)); g.fillRect(X(125.4), Y(7), 2.2 * S, Y(42) - Y(7));
    for (let d = 0; d < 6; d++) { g.fillStyle = '#000'; g.fillRect(X(70.3), Y(d * 3.5 + 1.7), 2.1 * S, 1.2 * u); }
    g.fillStyle = P.ice; g.fillRect(X(108), Y(8.2), X(122) - X(108), Y(17.3) - Y(8.2)); g.fillStyle = '#000'; for (let i = 0; i < 6; i++) g.fillRect(X(108), Y(8.6 + i * 1.5), X(122) - X(108), 0.5 * S);
    g.fillStyle = P.butter; g.fillRect(X(20), Y(19.2), X(143) - X(20), 0.55 * S);
    g.fillStyle = P.rose; [15.4, 16.8].forEach((yy) => g.fillRect(X(6), Y(yy), X(22) - X(6), 0.7 * S));
    // shuttles parked in the bay
    g.fillStyle = P.butter; [158, 169, 180].forEach((m) => { rrect(g, X(m), Y(29), 8 * S, 2.2 * S, 1.4 * u); g.fill(); });
  };
  clipDraw(p.hull, rooms); clipDraw(p.bridge, rooms);
  // the power feed up the rollbar, and the near-side nacelle pylon as a ghost over the decks behind it
  g.strokeStyle = P.butter; g.lineWidth = 0.55 * S; g.beginPath(); MSD_FEED.forEach(([m, d], i) => (i ? g.lineTo(X(m), Y(d)) : g.moveTo(X(m), Y(d)))); g.stroke();
  g.save(); g.globalAlpha = 0.28; g.fillStyle = P.plum; g.fill(p.spar); g.restore(); g.save(); g.setLineDash([6 * u, 4 * u]); g.strokeStyle = P.ice; g.lineWidth = 1.6 * u; g.stroke(p.spar); g.restore();
  clipDraw(p.arch, () => { g.fillStyle = P.plum; g.fillRect(X(102), Y(-4), 34 * S, 22 * S); g.fillStyle = P.ice; for (let i = 0; i < 9; i++) g.fillRect(X(104 + i * 3.4), Y(-4), 1.6 * S, 22 * S); });
  clipDraw(p.turret, () => { const W = SHIPGEO.wpod; g.fillStyle = P.ice; g.fillRect(X(W.m[0]), Y(W.d - W.h), (W.m[1] - W.m[0]) * S, 2 * W.h * S); g.fillStyle = P.rose; SHIPGEO.launchers.forEach(([a, b, , d, , h]) => g.fillRect(X(a), Y(d - h), (b - a) * S, 2 * h * S)); g.fillStyle = P.butter; for (let i = 0; i < 6; i++) g.fillRect(X(W.m[0] + 7 + i * 4.2), Y(W.d - 0.3), 2 * S, 0.6 * S); });
    clipDraw(p.nac, () => { const N = SHIPGEO.nacelle; g.fillStyle = P.ice; g.fillRect(X(N.m0 - 2), Y(N.d - 5), 94 * S, 10 * S); g.fillStyle = P.plum; g.fillRect(X(N.m0 - 2), Y(N.d + 1.6), 94 * S, 3.4 * S); g.fillStyle = P.butter; for (let i = 0; i < 15; i++) g.fillRect(X(N.m0 + 10 + i * 4.9), Y(N.d - 2.4), 2.4 * S, 3.4 * S); g.fillStyle = P.rose; g.fillRect(X(N.m0 - 2), Y(N.d - 5), 6 * S, 10 * S); g.fillStyle = P.txt; g.fillRect(X(N.m0 + 8), Y(N.d + 1.1), 74 * S, 0.4 * S); });
  g.fillStyle = P.butter; for (let m = 26; m < 186; m += 3.2) { if (m > 50 && m < 98) continue; g.fillRect(X(m), Y(msdTopAt(m) + 0.9), 0.7 * S, 0.45 * S); }
  g.fillStyle = P.red; g.fillRect(X(196.8), Y(17), 2.6 * S, Y(21) - Y(17)); g.fillStyle = P.butter; g.beginPath(); g.ellipse(X(9), Y(21.4), 4.5 * S, 1.4 * S, -0.25, 0, 7); g.fill();
  // ---- stacked callout lists at the cutaway's four corners ----
  const fs = 14 * u, lh = 19 * u; g.font = `500 ${fs | 0}px ${DISP}`; g.textBaseline = 'middle';
  const list = (items, x0, y0, side, vert, order) => {
    const it = items.slice().sort((a, b) => order * (a[1] - b[1]));
    it.forEach(([t, m, ym], i) => {
      const ly = y0 + i * lh, px = X(m), py = Y(ym), tw = g.measureText(t).width, ex = side < 0 ? x0 + tw + 12 * u : x0 - tw - 12 * u;
      g.strokeStyle = P.ice; g.lineWidth = 1.8 * u; g.beginPath(); g.moveTo(ex, ly); g.lineTo(px, ly); g.lineTo(px, py); g.stroke();
      g.fillStyle = P.butter; g.beginPath(); g.arc(px, py, 3 * u, 0, 7); g.fill();
      labels.push([t, x0, ly, side, tw]);
    });
  };
  const labels = []; // leaders first, then every label on a black knockout so no line runs through text
  list(MSD_LISTS.tl, R.x + 52 * u, R.y + 50 * u, -1, 1, -1);
  list(MSD_LISTS.tr, R.x + R.w - colW - 22 * u, R.y + 112 * u, 1, 1, 1);
  list(MSD_LISTS.bl, R.x + 52 * u, R.y + 560 * u, -1, -1, 1);
  list(MSD_LISTS.br, R.x + R.w - colW - 22 * u, R.y + 560 * u, 1, -1, -1);
  labels.forEach(([t, x0, ly, side, tw]) => {
    const bx = side < 0 ? x0 - 12 * u : x0 - tw - 8 * u;
    g.fillStyle = '#000'; g.fillRect(bx, ly - lh * 0.46, tw + 22 * u, lh * 0.92);
    g.fillStyle = P.butter; g.fillRect(side < 0 ? x0 - 10 * u : x0 + 3 * u, ly - 3.5 * u, 7 * u, 7 * u);
    g.fillStyle = P.tan; g.textAlign = side < 0 ? 'left' : 'right'; g.fillText(t, side < 0 ? x0 + 2 * u : x0 - 3 * u, ly + 1);
  });
  g.textAlign = 'right'; g.textBaseline = 'alphabetic'; g.fillStyle = P.ice; g.font = `600 ${54 * u | 0}px ${DISP}`; g.fillText('USS DEFIANCE · EV-0408', R.x + R.w - colW - 22 * u, R.y + barH + 56 * u);
  g.fillStyle = P.tan; g.font = `500 ${17 * u | 0}px ${DISP}`; g.fillText('BASTION CLASS · HEAVY ESCORT · 10 DECKS · CREW 140', R.x + R.w - colW - 22 * u, R.y + barH + 82 * u);
  hexTab(g, R.x + R.w - colW - 300 * u, R.y + R.h - barH - 34 * u, 280 * u, 24 * u, true, true); g.fillStyle = P.ice; g.fill(); g.fillStyle = '#000'; g.font = `600 ${16 * u | 0}px ${DISP}`; g.textAlign = 'center'; g.fillText('INTERIOR SYSTEMS OVERVIEW', R.x + R.w - colW - 160 * u, R.y + R.h - barH - 16 * u);
  // ---- left panel: plan view, and the warp field geometry inset ----
  const pl = msdPlan(PX, PZ);
  g.strokeStyle = P.plum; g.lineWidth = 1.8 * u; [1, 1.25, 1.5].forEach((k) => [-1, 1].forEach((sd) => { g.beginPath(); g.ellipse(PX(166), PZ(sd * 48), 40 * k * PS, 7 * k * PS, 0, 0, 7); g.stroke(); }));
  msdUnion(g, [...pl.spars, ...pl.nacs, pl.hull], '#120d12', P.txt, 2.2 * u);
  g.save(); g.clip(pl.hull); g.fillStyle = P.plum; g.fillRect(PX(0), PZ(-52), 200 * PS, 104 * PS);
  { const rr = mulberry(77); for (let i = 0; i < 140; i++) { const a = rr() * 192, z = (rr() - 0.5) * 92; g.fillStyle = [P.ice, P.tan, P.plum, P.rose, P.ice][(rr() * 5) | 0]; g.fillRect(PX(a), PZ(z), (2 + rr() * 8) * PS, (1.5 + rr() * 5) * PS); } }
  g.fillStyle = P.acc; g.beginPath(); g.ellipse(PX(64), PZ(0), 13 * PS, 7 * PS, 0, 0, 7); g.fill(); g.restore();
  pl.nacs.forEach((n) => { g.save(); g.clip(n); g.fillStyle = P.ice; g.fillRect(PX(120), PZ(-80), 85 * PS, 160 * PS); g.fillStyle = P.butter; for (let i = 0; i < 12; i++) g.fillRect(PX(140 + i * 4.6), PZ(-80), 2.4 * PS, 160 * PS); g.restore(); });
  pl.spars.forEach((s2) => { g.save(); g.clip(s2); g.fillStyle = P.plum; g.fillRect(PX(120), PZ(-80), 80 * PS, 160 * PS); g.restore(); });
  const iy = L.y + 486 * u;
  g.fillStyle = P.acc; g.font = `600 ${22 * u | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText('WARP FIELD GEOMETRY', L.x + L.w - 10 * u, iy);
  hexTab(g, L.x + colW + 24 * u, iy - 10 * u, 150 * u, 20 * u, true, false); g.fillStyle = P.tan; g.fill(); g.fillStyle = P.ice; g.fillRect(L.x + colW + 180 * u, iy - 10 * u, 90 * u, 20 * u);
  // side view of a nacelle with its field lobes
  const fx = L.x + colW + 40 * u, fy = iy + 95 * u;
  g.strokeStyle = P.plum; g.lineWidth = 1.8 * u; [1, 0.78, 0.56, 0.36].forEach((k) => { g.beginPath(); g.ellipse(fx + 140 * u, fy, 140 * u * (0.6 + k * 0.4), 60 * u * k, 0, 0, 7); g.stroke(); });
  hexTab(g, fx + 30 * u, fy - 8 * u, 220 * u, 16 * u, true, true); g.fillStyle = P.ice; g.fill(); g.fillStyle = P.butter; for (let i = 0; i < 12; i++) g.fillRect(fx + 70 * u + i * 13 * u, fy - 6 * u, 6 * u, 12 * u);
  return c;
}
function drawMSD(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), G = msdGeom(W, H), { u, L, R, S, X, Y, PS, PX, PZ, colW, barH } = G;
  const key = state.alert + '|' + ZONES.map((z) => zoneStatus(z.id)).join('');
  if (MSD.key !== key || !MSD.base || MSD.base.width !== W) { MSD.key = key; MSD.base = msdBase(W, H, P); }
  g.drawImage(MSD.base, 0, 0);
  const t = elapsed, warp = smooth(30, 300, cur.speed);
  // warp core pulses; plasma rises through it
  const k = 0.55 + 0.45 * Math.sin(t * (2 + warp * 7)); g.fillStyle = P.butter; g.globalAlpha = 0.5 + k * 0.5; g.fillRect(X(143.5), Y(17.5), 5 * S, Y(35) - Y(17.5)); g.globalAlpha = 1;
  g.fillStyle = P.txt; for (let i = 0; i < 5; i++) { const yy = 17.5 + ((t * (1.2 + warp * 5) + i * 3.5) % 17.5); g.fillRect(X(143.5), Y(yy), 5 * S, 0.5 * S); }
  // power running forward along the EPS trunk and up the rollbar into the weapons pod
  g.fillStyle = P.txt; for (let i = 0; i < 9; i++) { const f = ((t * 0.18 + i / 9) % 1); g.fillRect(X(143 - f * 123), Y(19.1), 2.2 * S, 0.75 * S); }
  for (let i = 0; i < 3; i++) { const [m, d] = msdAlong(MSD_FEED, (t * 0.3 + i / 3) % 1); g.fillRect(X(m) - 0.5 * S, Y(d) - 0.6 * S, 1.1 * S, 1.2 * S); }
  // nacelle coils fire in sequence
  for (let i = 0; i < 15; i++) { if (((t * (4 + warp * 10) - i) % 15 + 15) % 15 < 2) { g.fillStyle = P.txt; g.fillRect(X(SHIPGEO.nacelle.m0 + 10 + i * 4.9), Y(SHIPGEO.nacelle.d - 2.4), 2.4 * S, 3.4 * S); } }
  // damage tints, and a scan bar crossing the cutaway
  const ZR = { prow: [0, 9, 26, 21], dorsal: [50, -8, 160, 9], ventral: [96, 24, 190, 34], engines: [124, 12, 200, 34] };
  Object.entries(ZR).forEach(([id, [a, y0, b, y1]]) => { const st = zoneStatus(id); if (st === 'ok') return; g.fillStyle = st === 'warn' ? P.yel : P.red; g.globalAlpha = 0.28 + 0.2 * Math.sin(t * 5); g.fillRect(X(a), Y(y0), X(b) - X(a), Y(y1) - Y(y0)); g.globalAlpha = 1; });
  ['portNac', 'stbdNac'].forEach((id, i) => { const st = zoneStatus(id); if (st === 'ok') return; g.fillStyle = st === 'warn' ? P.yel : P.red; g.globalAlpha = 0.35; { const N = SHIPGEO.nacelle; g.fillRect(X(N.m0), Y(N.d - 4.6 + i * 4.6), 90 * S, 4.6 * S); } g.globalAlpha = 1; });
  const sx = X(((t * 14) % 220) - 10); g.fillStyle = P.butter; g.globalAlpha = 0.3; g.fillRect(sx, Y(-8), 4 * u, Y(50) - Y(-8)); g.globalAlpha = 1;
  // plan view: live shield arcs
  const up = sim.shields.up > 0.01;
  [['fwd', Math.PI * 0.75, Math.PI * 1.25], ['port', Math.PI * 1.25, Math.PI * 1.75], ['aft', -Math.PI * 0.25, Math.PI * 0.25], ['stbd', Math.PI * 0.25, Math.PI * 0.75]].forEach(([a, a0, a1]) => { const v = shieldNow(a), f = v / SIM.shield.max; g.strokeStyle = !up || v < 0.5 ? P.line : f > 0.5 ? P.ice : f > 0.2 ? P.yel : P.red; g.lineWidth = (sim.shields.reinforce === a ? 11 : 6) * u; g.beginPath(); g.ellipse(PX(100), PZ(0), 106 * PS, 64 * PS, 0, a0 + 0.07, a1 - 0.07); g.stroke(); });
  ['port', 'stbd'].forEach((id, i) => { const st = zoneStatus(id); if (st === 'ok') return; g.fillStyle = st === 'warn' ? P.yel : P.red; g.globalAlpha = 0.4; g.fillRect(PX(40), PZ(i ? 6 : -44), 100 * PS, 38 * PS); g.globalAlpha = 1; });
  // warp field geometry: readouts and moving numbers
  const iy = L.y + 486 * u, fx = L.x + colW + 40 * u;
  numGrid(g, { x: L.x + colW + 330 * u, y: iy + 24 * u, w: L.w - colW - 340 * u, h: 150 * u }, 61, P);
  table(g, { x: L.x + colW + 24 * u, y: iy + 168 * u, w: L.w - colW - 34 * u, h: 96 * u }, [['FIELD', warp > 0.5 ? 'WARP 6 · STABLE' : 'IDLE', warp > 0.5 ? P.acc : P.tan], ['COILS P/S', Math.round(sim.zones.portNac) + ' / ' + Math.round(sim.zones.stbdNac) + '%'], ['REACTOR', Math.round(reactorOut()) + ' U · ' + ALERTS[state.alert].short]], P);
  { const ph = t * (1 + warp * 4); g.fillStyle = P.butter; g.globalAlpha = 0.6; for (let i = 0; i < 3; i++) { const kk = ((ph * 0.3 + i / 3) % 1); g.fillRect(fx + 140 * u - 140 * u * kk, iy + 95 * u - 2 * u, 4 * u, 4 * u); g.fillRect(fx + 140 * u + 140 * u * kk, iy + 95 * u - 2 * u, 4 * u, 4 * u); } g.globalAlpha = 1; }
  // number table in the bottom middle, like a legend
  numGrid(g, { x: R.x + 474 * u, y: R.y + 616 * u, w: 226 * u, h: 140 * u }, 83, P);
  pillBank(g, { x: L.x + colW + 24 * u, y: L.y + 30 * u, w: 230 * u, h: 22 * u }, 71, P, 5);
}

// ---------- the situation table (aft of the command dais), read from the forward side ----------
// Live sector chart, ship plan with power flowing through it, shield arcs, power, damage, contacts and a lot of chrome.
function drawTable(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), u = W / 2048, t = elapsed;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  // frame: elbows in all four corners, segmented bars along top and bottom
  const cw = 70 * u, bh = 22 * u, m = 14 * u;
  elbow(g, m, m, cw, bh, 640 * u, 60 * u, true, P.acc); elbow(g, m, H - m, cw, bh, 520 * u, 60 * u, false, P.tan);
  g.save(); g.translate(W, 0); g.scale(-1, 1); elbow(g, m, m, cw, bh, 380 * u, 60 * u, true, P.ice); elbow(g, m, H - m, cw, bh, 460 * u, 60 * u, false, P.acc); g.restore();
  const segs = (y, x0, x1, seed) => { const rr = mulberry(seed); let x = x0; while (x < x1 - 10 * u) { const w = Math.min(x1 - x, (40 + rr() * 150) * u), c = [P.tan, P.butter, P.plum, P.ice, P.acc][(rr() * 5) | 0]; g.fillStyle = c; g.fillRect(x, y, w, bh); if (w > 80 * u) { g.fillStyle = '#000'; g.font = `600 ${bh * 0.8 | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(String(100 + ((x * 7) | 0) % 899), x + w - 5 * u, y + bh / 2 + 1); } x += w + 6 * u; } };
  segs(m, 1380 * u, W - 400 * u, 5); segs(H - m - bh, 545 * u, W - 480 * u, 9);
  g.fillStyle = P.acc; g.font = `600 ${40 * u | 0}px ${DISP}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('SITUATION TABLE · USS DEFIANCE', 670 * u, 6 * u);
  // side columns of numbered blocks
  [[m, 9, 1], [W - m - cw, 8, 2]].forEach(([x, n, sd]) => { const rr = mulberry(sd * 77), top = m + bh + 70 * u, bot = H - m - bh - 70 * u, kh = (bot - top - (n - 1) * 6 * u) / n; for (let i = 0; i < n; i++) { const on = Math.sin(t * (0.4 + rr()) + i * 1.7 + sd) > -0.8; g.fillStyle = on ? [P.ice, P.tan, P.butter, P.plum, P.rose][(rr() * 5) | 0] : P.line; g.fillRect(x, top + i * (kh + 6 * u), cw, kh); g.fillStyle = '#000'; g.font = `600 ${14 * u | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText(String(10 + i * 9 + sd) + '-' + String(1000 + ((i * 2971 + sd * 13) % 8999)), x + cw - 5 * u, top + i * (kh + 6 * u) + kh - 3 * u); } });
  const X0 = 110 * u, X1 = W - 110 * u, Y0 = 70 * u, Y1 = H - 66 * u;
  // ---- left column: sector chart, course, button bank ----
  const lc = { x: X0, y: Y0, w: 440 * u, h: Y1 - Y0 };
  const sys = SYSTEMS[state.holo], sc = sub(g, { x: lc.x, y: lc.y, w: lc.w, h: 390 * u }, 'SECTOR · ' + sys.star.toUpperCase(), P.acc, P);
  { const cx = sc.x + sc.w / 2, cy = sc.y + sc.h / 2, R = Math.min(sc.w, sc.h) / 2 * 0.96;
    for (let k = 0; k < sys.planets; k++) { const rad = R * (0.24 + k * 0.72 / sys.planets); g.strokeStyle = k === sys.featured ? P.plum : P.line; g.lineWidth = (k === sys.featured ? 7 : 4) * u; g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.stroke(); const a = t * 0.5 / (k + 1.3) + k * 1.9 + state.holo; g.fillStyle = k === sys.featured ? P.butter : P.ice; const ps = (k === sys.featured ? 12 : 8) * u; rrect(g, cx + Math.cos(a) * rad - ps, cy + Math.sin(a) * rad - ps, ps * 2, ps * 2, ps * 0.4); g.fill(); if (k === sys.featured) { g.fillStyle = P.txt; g.font = `500 ${15 * u | 0}px ${DISP}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(sys.planet.toUpperCase(), cx + Math.cos(a) * rad + 16 * u, cy + Math.sin(a) * rad); } }
    g.fillStyle = P.butter; g.beginPath(); g.arc(cx, cy, 16 * u * (1 + 0.06 * Math.sin(t * 3)), 0, 7); g.fill(); g.fillStyle = P.acc; g.beginPath(); g.arc(cx, cy, 9 * u, 0, 7); g.fill();
    if (state.holoOn) { const sw = t * 0.7; g.fillStyle = P.ice; g.globalAlpha = 0.18; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, sw - 0.35, sw); g.closePath(); g.fill(); g.globalAlpha = 1; }
    if (state.holo === state.cur) { const a = t * 0.12 + 1, rad = R * (0.24 + sys.featured * 0.72 / sys.planets) + 22 * u; g.fillStyle = P.acc; g.save(); g.translate(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); g.rotate(a + Math.PI / 2); g.beginPath(); g.moveTo(0, -11 * u); g.lineTo(8 * u, 9 * u); g.lineTo(-8 * u, 9 * u); g.closePath(); g.fill(); g.restore(); }
    g.fillStyle = P.tan; g.font = `500 ${14 * u | 0}px ${DISP}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(sys.cls.toUpperCase(), sc.x, sc.y + sc.h - 16 * u); }
  table(g, sub(g, { x: lc.x, y: lc.y + 405 * u, w: lc.w, h: 170 * u }, 'COURSE', P.ice, P), [['POSITION', sysCur().star.toUpperCase()], ['DESTINATION', sysDest().star.toUpperCase(), P.acc], ['HEADING', sysDest().heading.toUpperCase()], ['SPEED', SPEEDS[state.speed].screen]], P);
  pillBank(g, { x: lc.x, y: lc.y + 600 * u, w: lc.w, h: Y1 - Y0 - 600 * u }, 301, P, 4);
  // ---- right column: power, damage, contacts ----
  const rc = { x: X1 - 440 * u, y: Y0, w: 440 * u };
  const A = sim.alloc, kR = reactorOut() / SIM.reactor;
  bars(g, sub(g, { x: rc.x, y: rc.y, w: rc.w, h: 210 * u }, 'POWER · ' + sim.preset.toUpperCase(), P.acc, P), [['WEAPONS', A.weapons * kR / 100, P.acc], ['SHIELDS', A.shields * kR / 100, P.acc], ['ENGINES', A.engines * kR / 100, P.ice], ['SENSORS', A.sensors * kR / 100, P.ice]], P);
  zonesW(g, sub(g, { x: rc.x, y: rc.y + 225 * u, w: rc.w, h: 200 * u }, 'DAMAGE ZONES', P.acc, P), P);
  { const pr = sub(g, { x: rc.x, y: rc.y + 440 * u, w: rc.w, h: Y1 - Y0 - 440 * u }, 'CONTACTS', P.ice, P), [pa, pb] = split(pr, [0.9, 1.1], false, 12 * u);
    plotW(g, pa, P); table(g, pb, CONVOY.map(([n, d]) => [n, d.replace(' AFT', ''), P.ice]).concat([['TRACK 0417', state.alert !== 'green' ? 'UNKNOWN' : 'BEACON', state.alert !== 'green' ? P.acc : P.tan]]), P); }
  // ---- centre: the ship in plan, with power running through it ----
  const cx0 = X0 + 470 * u, cx1 = X1 - 470 * u, cwid = cx1 - cx0, PS = cwid / 300, PX = (mm) => cx0 + 70 * u + mm * PS, PZ = (mm) => Y0 + 330 * u + mm * PS, pl = msdPlan(PX, PZ);
  sub(g, { x: cx0, y: Y0, w: cwid, h: 150 * u }, 'SHIP SYSTEMS · PLAN', P.acc, P);
  g.strokeStyle = P.plum; g.lineWidth = 3 * u; [-1, 1].forEach((sd) => [1, 1.2].forEach((k) => { g.beginPath(); g.ellipse(PX(166), PZ(sd * 48), 40 * k * PS, 7 * k * PS, 0, 0, 7); g.stroke(); }));
  const arcs = [['fwd', Math.PI * 0.75, Math.PI * 1.25], ['port', Math.PI * 1.25, Math.PI * 1.75], ['aft', -Math.PI * 0.25, Math.PI * 0.25], ['stbd', Math.PI * 0.25, Math.PI * 0.75]], up = sim.shields.up > 0.01;
  arcs.forEach(([a, a0, a1]) => { const v = shieldNow(a), f = v / SIM.shield.max; g.strokeStyle = !up || v < 0.5 ? P.line : f > 0.5 ? P.ice : f > 0.2 ? P.yel : P.red; g.lineWidth = (sim.shields.reinforce === a ? 16 : 9) * u; g.beginPath(); g.ellipse(PX(100), PZ(0), 112 * PS, 64 * PS, 0, a0 + 0.06, a1 - 0.06); g.stroke(); });
  msdUnion(g, [...pl.spars, ...pl.nacs, pl.hull], '#151014', P.txt, 2.4 * u);
  g.save(); g.clip(pl.hull); g.fillStyle = P.plum; g.fillRect(PX(0), PZ(-52), 200 * PS, 104 * PS);
  { const rr = mulberry(1212); for (let i = 0; i < 160; i++) { const a = rr() * 192, z = (rr() - 0.5) * 92; g.fillStyle = [P.ice, P.tan, P.plum, P.rose, P.ice][(rr() * 5) | 0]; g.globalAlpha = 0.85; g.fillRect(PX(a), PZ(z), (2 + rr() * 9) * PS, (1.5 + rr() * 5) * PS); } g.globalAlpha = 1; }
  for (let d = 0; d < 6; d++) { g.strokeStyle = '#000'; g.lineWidth = 2 * u; g.beginPath(); g.ellipse(PX(66), PZ(0), (14 + d * 11) * PS, (9 + d * 7.5) * PS, 0, 0, 7); g.stroke(); }
  g.fillStyle = P.acc; g.beginPath(); g.ellipse(PX(64), PZ(0), 13 * PS, 7 * PS, 0, 0, 7); g.fill(); g.restore();
  pl.nacs.forEach((n) => { g.save(); g.clip(n); g.fillStyle = P.ice; g.fillRect(PX(120), PZ(-80), 85 * PS, 160 * PS); for (let i = 0; i < 13; i++) { const on = ((t * 6 - i) % 13 + 13) % 13 < 3; g.fillStyle = on ? P.txt : P.butter; g.fillRect(PX(138 + i * 4.6), PZ(-80), 2.4 * PS, 160 * PS); } g.restore(); });
  pl.spars.forEach((sp) => { g.save(); g.clip(sp); g.fillStyle = P.plum; g.fillRect(PX(120), PZ(-80), 80 * PS, 160 * PS); g.restore(); });
  // power conduits: blocks running from the core to the nacelles, the weapons pod and the shield generators
  const core = [146, 0], routes = [[[146, 0], [150, -18], [160, -46]], [[146, 0], [150, 18], [160, 46]], [[146, 0], [133, 0], [64, 0]], [[146, 0], [140, -26]], [[146, 0], [140, 26]]];
  routes.forEach((rt, ri) => { for (let i = 0; i + 1 < rt.length; i++) { const [a, b] = [rt[i], rt[i + 1]], L2 = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L2 / 3)); for (let k = 0; k < n; k++) { const f = ((k / n) + t * (0.35 + ri * 0.04)) % 1, x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f, on = ((k + Math.floor(t * 9)) % 4) === 0; g.fillStyle = on ? P.txt : ri < 2 ? P.butter : ri === 2 ? P.acc : P.ice; rrect(g, PX(x) - 3.2 * u, PZ(z) - 3.2 * u, 6.4 * u, 6.4 * u, 1.5 * u); g.fill(); } } });
  { const k = 0.6 + 0.4 * Math.sin(t * (2 + smooth(30, 300, cur.speed) * 7)); g.fillStyle = P.butter; g.globalAlpha = 0.5 + 0.5 * k; g.beginPath(); g.arc(PX(core[0]), PZ(core[1]), 11 * u, 0, 7); g.fill(); g.globalAlpha = 1; }
  // zone damage over the plan
  const ZP = { prow: [0, -14, 22, 28], dorsal: [92, -10, 40, 20], ventral: [96, -13, 94, 26], port: [30, -44, 110, 22], stbd: [30, 22, 110, 22], engines: [150, -16, 50, 32], portNac: [110, -44, 90, 8], stbdNac: [110, 36, 90, 8] };
  Object.entries(ZP).forEach(([id, [a, z, w, d]]) => { const st = zoneStatus(id); if (st === 'ok') return; g.fillStyle = st === 'warn' ? P.yel : P.red; g.globalAlpha = 0.3 + 0.2 * Math.sin(t * 5); g.fillRect(PX(a), PZ(z), w * PS, d * PS); g.globalAlpha = 1; });
  // callouts round the plan
  g.font = `500 ${15 * u | 0}px ${DISP}`; g.textBaseline = 'middle';
  [['BRIDGE', 64, 0, -1, 0], ['WARP CORE', 146, 0, 1, 1], ['PORT NACELLE', 186, -40, -1, 0], ['STBD NACELLE', 186, 40, 1, 0], ['WEAPONS POD', 133, -4, -1, 1], ['TORPEDO BAYS', 6, 0, 1, 0]].forEach(([lab, a, z, sd, row]) => { const px = PX(a), pz = PZ(z), ly = sd < 0 ? Y0 + (50 + row * 26) * u : PZ(0) + (205 + row * 26) * u; g.strokeStyle = P.ice; g.lineWidth = 2 * u; g.beginPath(); g.moveTo(px, pz); g.lineTo(px, ly); g.stroke(); g.fillStyle = P.butter; g.beginPath(); g.arc(px, pz, 4 * u, 0, 7); g.fill(); g.fillStyle = '#000'; const tw = g.measureText(lab).width; g.fillRect(px - tw / 2 - 4 * u, ly - 10 * u, tw + 8 * u, 20 * u); g.fillStyle = P.tan; g.textAlign = 'center'; g.fillText(lab, px, ly + 1); });
  // under the plan: deck status, numbers, a trace and buttons
  const by = PZ(0) + 270 * u, bw = cwid;
  const ND = SHIPGEO.rooms.length; for (let d = 1; d <= ND; d++) { const x = cx0 + (d - 1) * bw / ND, w = bw / ND - 6 * u, on = d <= 2; hexTab(g, x, by, w, 26 * u, d === 1, d === ND); g.fillStyle = on ? P.acc : Math.sin(t * 0.8 + d * 2.1) > 0.7 ? P.butter : [P.tan, P.ice, P.plum][d % 3]; g.fill(); g.fillStyle = '#000'; g.font = `600 ${15 * u | 0}px ${DISP}`; g.textAlign = 'center'; g.fillText('D' + d, x + w / 2, by + 14 * u); }
  const lo = { x: cx0, y: by + 40 * u, w: cwid, h: Y1 - by - 40 * u }, [l1, l2, l3] = split(lo, [1, 1.1, 1], false, 16 * u);
  numGrid(g, l1, 211, P); spark(g, l2, P.ice, 3, 1.4, P); pillBank(g, l3, 223, P, 3);
}
// ---------- layered look (screens pass 3) ----------
// Every display is built in two layers. Underneath, a still, dim layer: deep navy regions, a faint grid, a faint
// schematic and tiny reference codes. On top, the crisp blocks and readouts. The still layer is drawn once into an
// offscreen canvas (keyed by size, seed and alert) and stamped down on each redraw, so it costs nothing to keep.
const LOOK3 = { all: true, only: new Set() };
const look3 = (s) => LOOK3.all || LOOK3.only.has(s.station);
const UNDER = new Map();
const NAVY = { g: ['#081022', '#0f1d3a', '#162a52', '#22406f', '#2f5288', '#4268a0'], r: ['#10070a', '#1a0b10', '#261018', '#3a1822', '#52222e', '#6a2e3a'] };
function microText(g, x, y, txt, col, fs) { g.font = `500 ${fs | 0}px ${DISP}`; g.fillStyle = col; g.textBaseline = 'top'; g.fillText(txt, x, y); }
function underlay(s, W, H, R) {
  const red = state.alert === 'red', key = s.kind + ':' + W + 'x' + H + ':' + s.seed + (red ? 'r' : 'g');
  let c = UNDER.get(key); if (c) return c;
  c = cnv(W, H); const g = c.getContext('2d'), N = NAVY[red ? 'r' : 'g'], r = mulberry(s.seed * 13 + 5), u = Math.min(W, H) / 400;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  // The panels follow the frame's own areas (R: the content field, the side rail, the bottom deck), so the dim
  // shapes read as the back layer of one designed layout rather than stains behind it.
  const fx = R.x0 - R.gap, fy = R.y0 - R.gap * 0.5, fw = R.x1 - R.x0 + R.gap * 2, fh = R.y1 - R.y0 + R.gap, rad = 22 * u;
  rrect(g, fx, fy, fw, fh, rad); g.fillStyle = N[0]; g.fill();
  // the lower-left block: a stepped panel, lighter at the top, with a faint grid
  const sp = 0.5 + r() * 0.12, bx = fx, by = fy + fh * (0.42 + r() * 0.08), bw = fw * sp, bh = fy + fh - by;
  let gr = g.createLinearGradient(0, by, 0, by + bh); gr.addColorStop(0, N[2]); gr.addColorStop(1, N[1]);
  g.beginPath(); g.moveTo(bx, by + bh); g.lineTo(bx, by + rad); g.quadraticCurveTo(bx, by, bx + rad, by); g.lineTo(bx + bw * 0.62, by);
  g.quadraticCurveTo(bx + bw * 0.7, by, bx + bw * 0.72, by + bh * 0.16); g.lineTo(bx + bw - rad, by + bh * 0.16); g.quadraticCurveTo(bx + bw, by + bh * 0.16, bx + bw, by + bh * 0.16 + rad);
  g.lineTo(bx + bw, by + bh - rad); g.quadraticCurveTo(bx + bw, by + bh, bx + bw - rad, by + bh); g.closePath(); g.fillStyle = gr; g.fill();
  g.save(); g.clip(); g.strokeStyle = N[3]; g.globalAlpha = 0.5; g.lineWidth = Math.max(1, u * 0.8); const gs = Math.max(12, 20 * u);
  g.beginPath(); for (let x = bx + gs; x < bx + bw; x += gs) { g.moveTo(x, by); g.lineTo(x, by + bh); } for (let y = by + gs; y < by + bh; y += gs) { g.moveTo(bx, y); g.lineTo(bx + bw, y); } g.stroke(); g.restore(); g.globalAlpha = 1;
  // the right-hand block: a tall panel under an elbow, carrying a faint schematic
  const qx = fx + fw * (0.6 + r() * 0.06), qy = fy + fh * 0.08, qw = fx + fw - qx, qh = fh * 0.92;
  elbow(g, qx, qy, qw * 0.14, Math.max(3, 6 * u), qw, Math.max(8, 16 * u), true, N[2]);
  gr = g.createLinearGradient(qx, 0, qx + qw, 0); gr.addColorStop(0, N[1]); gr.addColorStop(1, N[0]);
  rrect(g, qx + qw * 0.14 + R.gap, qy + Math.max(8, 16 * u) + R.gap, qw * 0.86 - R.gap, qh - Math.max(8, 16 * u) - R.gap, rad * 0.8); g.fillStyle = gr; g.fill();
  const kind = (s.seed + s.kind.length) % 3, sx = qx + qw * 0.58, sy = qy + qh * 0.56, sr = Math.min(qw, qh) * 0.36;
  g.strokeStyle = N[4]; g.lineWidth = Math.max(1, 1.3 * u); g.globalAlpha = 0.55;
  if (kind === 0) {
    [1, 0.72, 0.44].forEach((f) => { g.beginPath(); g.arc(sx, sy, sr * f, 0, 7); g.stroke(); });
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, l = i % 4 ? 0.05 : 0.12; g.beginPath(); g.moveTo(sx + Math.cos(a) * sr, sy + Math.sin(a) * sr); g.lineTo(sx + Math.cos(a) * sr * (1 + l), sy + Math.sin(a) * sr * (1 + l)); g.stroke(); }
    g.beginPath(); g.moveTo(sx - sr * 1.2, sy); g.lineTo(sx + sr * 1.2, sy); g.moveTo(sx, sy - sr * 1.2); g.lineTo(sx, sy + sr * 1.2); g.stroke();
  } else if (kind === 1) {
    g.save(); g.translate(sx, sy); g.rotate(-Math.PI / 2); hullTop(g, 0, 0, sr); g.stroke(); hullTop(g, 0, 0, sr * 0.7); g.stroke(); g.restore();
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(sx - sr * 1.1, sy + i * sr * 0.18); g.lineTo(sx - sr * 0.95, sy + i * sr * 0.18); g.stroke(); }
  } else {
    for (let k = 0; k < 6; k++) { g.beginPath(); for (let i = 0; i <= 40; i++) { const t = i / 40, x = sx - sr * 1.1 + t * sr * 2.2, y = sy - sr * 0.7 + k * sr * 0.28 + Math.sin(t * 6 + k * 1.3 + s.seed) * sr * 0.08; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  }
  g.globalAlpha = 1;
  // behind the side rail and the bottom deck: their own dim trays
  if (R.rail) { rrect(g, R.rail.x - R.gap, R.rail.y - R.gap, R.rail.w + R.gap * 2, R.rail.h + R.gap * 2, rad * 0.7); g.fillStyle = N[1]; g.fill(); }
  if (R.deck) { rrect(g, R.deck.x - R.gap, R.deck.y - R.gap * 0.6, R.deck.w + R.gap * 2, R.deck.h + R.gap * 1.2, rad * 0.6); g.fillStyle = N[1]; g.fill(); }
  // a hairline ruler along the lower block, and tiny reference codes tucked in panel corners, only noticed up close
  g.fillStyle = N[3]; const ry = by + bh - 8 * u;
  g.fillRect(bx + 14 * u, ry, bw - 28 * u, Math.max(1, u)); for (let x = bx + 14 * u, i = 0; x < bx + bw - 14 * u; x += 9 * u, i++) g.fillRect(x, ry - (i % 5 ? 3 : 7) * u, Math.max(1, u), (i % 5 ? 3 : 7) * u);
  const fsm = clamp(8.5 * u, 8, 12), code = () => String(10 + (r() * 89 | 0)) + '-' + String(1000 + (r() * 8999 | 0));
  [[bx + bw - 70 * u, by + bh * 0.16 + 6 * u], [qx + qw - 70 * u, qy + qh - 18 * u], [fx + 10 * u, fy + 6 * u]].forEach(([x, y]) => microText(g, x, y, code(), N[5], fsm));
  UNDER.set(key, c); return c;
}
// ---------- desk display: the whole desktop is a control surface ----------
// Big colour pads carry the look (the rows of rounded blocks with tiny numbers), a segmented ring gauge, and the
// station's own readouts in a compact panel in the middle. Still except for: one selected pad that moves now and
// then, one pad that toggles, and a slow filling bar.
const DESK_C = new Map();
function deskStatic(s, W, H, P) {
  const red = state.alert === 'red', key = W + 'x' + H + ':' + s.seed + (red ? 'r' : 'g');
  let c = DESK_C.get(key); if (c) return c;
  c = cnv(W, H); const g = c.getContext('2d'), N = NAVY[red ? 'r' : 'g'], r = mulberry(s.seed * 31 + 9), u = H / 400, m = 14 * u;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const L = s.layout = { pads: [], ring: null, mid: null, fill: null };
  // left: a big navy field holding the pad clusters
  rrect(g, m, m, W * 0.31, H - 2 * m, 22 * u); g.fillStyle = N[1]; g.fill();
  elbow(g, m, m, 26 * u, 16 * u, W * 0.26, 22 * u, true, P.tan);
  const cols = [P.tan, P.butter, P.acc, P.ice, P.tan, P.butter, P.rose, P.plum], ph = 30 * u, gp = 7 * u;
  let y = m + 52 * u;
  for (let row = 0; y + ph < H - m - 12 * u; row++, y += ph + gp) {
    let x = m + 34 * u; const x1 = m + W * 0.31 - 12 * u;
    while (x < x1 - 30 * u) {
      const w = Math.min(x1 - x, (r() < 0.25 ? 2.3 : 1) * (44 + r() * 26) * u), col = cols[(r() * cols.length) | 0], off = r() < 0.12;
      L.pads.push({ x, y, w, h: ph, col, off, l: x === m + 34 * u, n: String(10 + (r() * 89 | 0)) + (w > 90 * u ? '-' + String(100 + (r() * 899 | 0)) : '') });
      x += w + gp;
    }
  }
  L.pads.forEach((q) => { hexTab(g, q.x, q.y, q.w, q.h, q.l, false); g.fillStyle = q.off ? P.line : q.col; g.fill(); if (!q.off) { g.fillStyle = '#000'; g.font = `600 ${q.h * 0.42 | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(q.n, q.x + q.w - 6 * u, q.y + q.h / 2 + 1); } });
  // middle: a frame for the station's readouts
  const mx = m + W * 0.31 + 18 * u, mw = W * 0.5;
  L.mid = { x: mx + 30 * u, y: m + 40 * u, w: mw - 36 * u, h: Math.min(H * 0.52, 165) };
  rrect(g, mx, m + 28 * u, mw, L.mid.h + 26 * u, 18 * u); g.fillStyle = N[0]; g.fill();
  elbow(g, mx, m, 22 * u, 14 * u, mw * 0.55, 20 * u, true, P.acc);
  const t = s.title.toUpperCase(); fitFont(g, t, 600, 26 * u, DISP, mw * 0.4); g.fillStyle = P.acc; g.textAlign = 'right'; g.textBaseline = 'top'; g.fillText(t, mx + mw, m - 3 * u);
  // below it: three long bars, the first one live (a slow fill), and a run of thin tick blocks
  const by = L.mid.y + L.mid.h + 26 * u, bw = mw;
  L.fill = { x: mx, y: by, w: bw * 0.7, h: 16 * u };
  [[0, P.line], [26 * u, P.ice], [52 * u, P.tan]].forEach(([dy, col], i) => { hexTab(g, mx, by + dy, i ? bw * (0.35 + r() * 0.4) : bw * 0.7, 16 * u, true, true); g.fillStyle = col; g.fill(); });
  for (let i = 0, x = mx; x < mx + bw - 8 * u && by + 84 * u < H - m; i++, x += 13 * u) { g.fillStyle = [P.tan, P.plum, P.ice][i % 7 === 3 ? 2 : i % 3 === 1 ? 1 : 0]; g.fillRect(x, by + 82 * u, 8 * u, (i % 4 ? 12 : 22) * u); }
  // right: the segmented ring gauge in its own navy field, with a cluster of small pads beside it
  const rx = mx + mw + 18 * u, rw = W - m - rx;
  rrect(g, rx, m, rw, H - 2 * m, 22 * u); g.fillStyle = N[1]; g.fill();
  const cx = rx + rw * 0.42, cy = H * 0.5, rad = Math.min(rw * 0.38, H * 0.36);
  L.ring = { cx, cy, rad };
  const segs = [[P.tan, 8], [P.ice, 6], [P.acc, 10]], ringW = rad * 0.2;
  segs.forEach(([col, n], k) => { const rr2 = rad * (1 - k * 0.27); for (let i = 0; i < n; i++) { if (r() < 0.18) continue; const a0 = -Math.PI * 0.75 + i / n * Math.PI * 1.5 + 0.04, a1 = a0 + Math.PI * 1.5 / n - 0.08; g.strokeStyle = col; g.lineWidth = ringW * (1 - k * 0.15); g.beginPath(); g.arc(cx, cy, rr2, a0, a1); g.stroke(); } });
  g.fillStyle = P.butter; g.beginPath(); g.arc(cx, cy, rad * 0.2, 0, 7); g.fill();
  for (let i = 0; i < 6; i++) { const qx = rx + rw * 0.8, qy = m + 30 * u + i * 34 * u; if (qy + 24 * u > H - m) break; hexTab(g, qx, qy, rw * 0.16, 24 * u, false, true); g.fillStyle = [P.acc, P.tan, P.ice, P.butter, P.tan, P.rose][i]; g.fill(); }
  microText(g, rx + 12 * u, H - m - 22 * u, String(s.code || '').replace('·', ' ') + ' · ' + String(200 + s.seed % 700), N[5], clamp(9 * u, 8, 12));
  DESK_C.set(key, c); return c;
}
function drawDesk(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), u = H / 400;
  g.drawImage(deskStatic(s, W, H, P), 0, 0); const L = s.layout;
  // one pad is selected (cream) and moves on every 8-20 s; another toggles on its own slower timing
  const n = L.pads.length, sel = (hash1(s.seed * 5 + slowTick(s.seed * 3.7, 8, 20)) * n) | 0, tg = slowTick(s.seed * 9.1, 11, 27), tk = (hash1(s.seed + tg * 3) * n) | 0;
  [[sel, P.txt], [tk, tg % 2 ? P.line : null]].forEach(([i, col]) => { const q = L.pads[i]; if (!q || !col) return; hexTab(g, q.x, q.y, q.w, q.h, q.l, false); g.fillStyle = col; g.fill(); });
  // the slow fill: a bar that creeps along over a minute or so, then starts again
  { const f = L.fill, t = ((elapsed + hash1(s.seed) * 60) / (50 + hash1(s.seed + 2) * 40)) % 1; g.fillStyle = P.line; hexTab(g, f.x, f.y, f.w, f.h, true, true); g.fill(); hexTab(g, f.x, f.y, Math.max(f.h, f.w * t), f.h, true, true); g.fillStyle = P.butter; g.fill(); }
  // the station's own readouts, compact
  const M = L.mid; g.fillStyle = NAVY[state.alert === 'red' ? 'r' : 'g'][0]; g.fillRect(M.x - 4, M.y - 2, M.w + 8, M.h + 4);
  if (DRAW[s.sub]) DRAW[s.sub](g, M.x, M.y, M.w, M.h, P, s);
  s.tex.needsUpdate = true;
}
// the hooded viewer: a slow trace crawling across a faint grid
function drawScope(s) {
  const g = s.g, W = s.w, H = s.h, P = pal(), N = NAVY[state.alert === 'red' ? 'r' : 'g'];
  g.fillStyle = N[0]; g.fillRect(0, 0, W, H);
  g.fillStyle = N[2]; for (let x = 0; x < W; x += 24) g.fillRect(x, 0, 1, H); for (let y = H / 2 % 12; y < H; y += 12) g.fillRect(0, y, W, 1);
  const t = elapsed * (0.08 + hash1(s.seed) * 0.06) + s.seed;
  g.strokeStyle = P.ice; g.lineWidth = 2; g.beginPath();
  for (let x = 0; x <= W; x += 3) { const v = Math.sin(x * 0.045 + t * 2) * 0.5 + Math.sin(x * 0.11 - t * 1.3) * 0.25 + Math.sin(x * 0.023 + t) * 0.2; const y = H / 2 - v * H * 0.34; x ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  g.fillStyle = P.tan; g.fillRect(4, 4, 30, 8); g.fillStyle = P.acc; g.fillRect(W - 22, H - 12, 18, 8);
  s.tex.needsUpdate = true;
}
function drawScreen(s) {
  if (s.kind === 'strip') drawStrip(s);
  else if (s.kind === 'msd') drawMSD(s);
  else if (s.kind === 'table') drawTable(s);
  else if (s.kind === 'cmd') drawCmd(s);
  else if (s.kind === 'keys') drawKeys(s);
  else if (s.kind === 'band') drawBand(s);
  else if (s.kind === 'desk') { drawDesk(s); return; }
  else if (s.kind === 'scope') { drawScope(s); return; }
  else {
    const g = s.g, W = s.w, H = s.h, P = pal(), small = H < 200;
    const pad = Math.max(4, Math.round(Math.min(W, H) * 0.035)), gap = Math.max(3, Math.round(pad * 0.7));
    const colW = Math.round(clamp(W * 0.085, 22, 92)), barH = Math.round(clamp(H * (small ? 0.075 : 0.042), 6, 22));
    const fs = Math.round(clamp(Math.min(H * (small ? 0.13 : 0.068), W * 0.075), 11, 46)), ext = Math.round(clamp(H * 0.1, 8, 64));
    // frame geometry first (the dim back layer follows it), then draw
    const R = { gap, x0: pad + colW + gap * 2.5, y0: pad + Math.max(fs * 1.02, barH + ext * 0.4) + gap, x1: W - pad, y1: H - pad - barH - gap * 1.6, rail: null, deck: null };
    if (W >= 520 && s.kind !== 'msd') { const rw = Math.round(clamp(W * (small ? 0.2 : 0.15), 70, 160)); R.rail = { x: W - pad - rw, y: R.y0, w: rw, h: R.y1 - R.y0 }; R.x1 = R.rail.x - gap * 3; }
    if (H >= 420 && W >= 300) { const bh = Math.round(clamp(H * 0.1, 34, 78)); R.deck = { x: R.x0, y: R.y1 - bh, w: R.x1 - R.x0, h: bh }; }
    if (look3(s)) g.drawImage(underlay(s, W, H, R), 0, 0); else { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }
    const title = s.title.toUpperCase(); fitFont(g, title, 600, fs, DISP, W * 0.5); const tw = g.measureText(title).width;
    const tx = W - pad - fs * 0.55 - gap, barEnd = tx - tw - gap * 2;
    // top elbow and bar: peach, a tan block, a lilac block, then the title on black and a peach end cap
    const seg1 = Math.min(Math.max(colW + barH * 2, (barEnd - pad) * 0.48), Math.max(colW + barH, barEnd - pad));
    elbow(g, pad, pad, colW, barH, seg1, ext, true, P.acc);
    { // the rest of the top bar: several blocks, the longer ones carrying small codes
      let x = pad + seg1 + gap; const rr = mulberry(s.seed + 3), cols = [P.tan, P.ice, P.butter, P.plum, P.tan];
      while (x < barEnd - 8) {
        const w = Math.min(barEnd - x, Math.max(barH * 2, (barEnd - pad) * (0.06 + rr() * 0.16))), c = cols[(rr() * cols.length) | 0];
        g.fillStyle = c; g.fillRect(x, pad, w, barH);
        if (barH >= 10 && w > barH * 4) { g.fillStyle = '#000'; g.font = `600 ${barH * 0.78 | 0}px ${DISP}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(String(100 + ((s.seed * 37 + x) | 0) % 899), x + w - 4, pad + barH / 2 + 1); }
        x += w + gap;
      }
    }
    fitFont(g, title, 600, fs, DISP, W * 0.5); g.fillStyle = P.acc; g.textAlign = 'right'; g.textBaseline = 'top'; g.fillText(title, tx, pad - fs * 0.08);
    hexTab(g, W - pad - fs * 0.55, pad, fs * 0.55, barH, false, true); g.fillStyle = P.acc; g.fill();
    // bottom elbow and bar, with the station code in its own block
    g.font = `600 ${Math.round(barH * 1.05)}px ${DISP}`; const code = s.code || '', cw2 = g.measureText(code).width + barH * 2;
    const bseg = Math.max(colW + barH * 2, (W - pad * 2 - cw2) * 0.38);
    elbow(g, pad, H - pad, colW, barH, bseg, ext, false, P.tan);
    const b2 = pad + bseg + gap, b2w = W - pad - cw2 - gap - b2;
    if (b2w > 4) { g.fillStyle = P.plum; g.fillRect(b2, H - pad - barH, b2w * 0.55, barH); g.fillStyle = P.acc; g.fillRect(b2 + b2w * 0.55 + gap, H - pad - barH, b2w * 0.45 - gap, barH); }
    hexTab(g, W - pad - cw2, H - pad - barH, cw2, barH, false, true); g.fillStyle = P.butter; g.fill();
    g.fillStyle = '#000'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(code, W - pad - cw2 + barH * 0.5, H - pad - barH / 2 + 1);
    // the column between the elbows: numbered blocks
    const cy0 = pad + barH + ext + gap, cy1 = H - pad - barH - ext - gap, avail = cy1 - cy0;
    if (avail > 14) {
      const n = clamp(Math.round(avail / Math.max(22, H * 0.075)), 1, 10), kh = (avail - (n - 1) * gap) / n, r = mulberry(s.seed), cols = [P.ice, P.tan, P.butter, P.rose, P.tan, P.plum];
      for (let i = 0; i < n; i++) {
        const c = cols[(r() * cols.length) | 0], blink = false, tk = r() < 0.3 ? slowTick(s.seed * 11 + i, 12, 40) : 0, num = String(10 + ((s.seed * 37 + i * 113) % 89)) + '-' + String(1000 + ((s.seed * 53 + i * 71 + tk * 389) % 8999));
        g.fillStyle = blink ? P.txt : c; g.fillRect(pad, cy0 + i * (kh + gap), colW, kh);
        if (kh > 12) { g.fillStyle = '#000'; g.textAlign = 'right'; g.textBaseline = 'bottom'; fitFont(g, num, 600, Math.min(kh * 0.36, colW * 0.24), DISP, colW - 6); g.fillText(num, pad + colW - 4, cy0 + i * (kh + gap) + kh - 2); }
      }
    }
    const x0 = pad + colW + gap * 2.5, y0 = pad + Math.max(fs * 1.02, barH + ext * 0.4) + gap;
    let x1 = W - pad, y1 = H - pad - barH - gap * 1.6;
    // a side rail of buttons and numbers on the wider screens, a bottom deck of buttons on the taller ones
    if (W >= 520 && s.kind !== 'msd') {
      const rw = Math.round(clamp(W * (small ? 0.2 : 0.15), 70, 160)), rx = W - pad - rw;
      if (small) pillBank(g, { x: rx, y: y0, w: rw, h: y1 - y0 }, s.seed + 11, P, 2);
      else { const [ra, rb] = split({ x: rx, y: y0, w: rw, h: y1 - y0 }, [1.25, 1], true, gap * 2); pillBank(g, ra, s.seed + 11, P, 2); numGrid(g, rb, s.seed + 5, P); }
      x1 = rx - gap * 3; g.fillStyle = P.line; g.fillRect(x1 + gap * 1.2, y0, Math.max(2, gap * 0.6), y1 - y0);
    }
    if (H >= 420 && W >= 300) {
      const bh = Math.round(clamp(H * 0.1, 34, 78)), by = y1 - bh;
      if (W >= 520) { const [ba, bb] = split({ x: x0, y: by, w: x1 - x0, h: bh }, [2.2, 1], false, gap * 3); pillBank(g, ba, s.seed + 23, P, Math.max(4, Math.round(ba.w / 90))); numGrid(g, bb, s.seed + 29, P); }
      else pillBank(g, { x: x0, y: by, w: x1 - x0, h: bh }, s.seed + 23, P, 2);
      y1 = by - gap * 2.5;
    }
    DRAW[s.kind](g, x0, y0, x1 - x0, y1 - y0, P, s);
  }
  s.tex.needsUpdate = true;
}

function redrawAll() { screens.forEach(drawScreen); drawOverlay(); }
redrawAll();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { redrawAll(); });

````

---

## `js/sound.js`

````javascript
// USS Defiance · sound.js
// Synthesised ambience and interface sounds (Web Audio, no files).
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- sound ----------
let AC = null, master = null, soundOn = true, noiseBuf = null, nextChirp = 4;
function initAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
  try {
    AC = new Ctx(); master = AC.createGain(); master.gain.value = soundOn ? 0.7 : 0; master.connect(AC.destination);
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 360; lp.connect(master);
    [[50, 0.055], [100.3, 0.024], [150.2, 0.009]].forEach(([f, gv]) => { const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = f; const g = AC.createGain(); g.gain.value = gv; o.connect(g); g.connect(lp); o.start(); });
    const len = AC.sampleRate * 4; noiseBuf = AC.createBuffer(1, len, AC.sampleRate); const d = noiseBuf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const n = AC.createBufferSource(); n.buffer = noiseBuf; n.loop = true; const nf = AC.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 480; const ng = AC.createGain(); ng.gain.value = 0.07;
    n.connect(nf); nf.connect(ng); ng.connect(master); n.start();
    $('sound-btn').hidden = false;
  } catch (e) { AC = null; }
}
function beep(freqs, dur, vol) {
  if (!AC || !soundOn) return; const t0 = AC.currentTime; dur = dur || 0.07; vol = vol || 0.05;
  freqs.forEach((f, i) => {
    const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0 + i * dur); g.gain.linearRampToValueAtTime(vol, t0 + i * dur + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * dur);
    o.connect(g); g.connect(master); o.start(t0 + i * dur); o.stop(t0 + (i + 1) * dur + 0.03);
  });
}
function whoosh(up) {
  if (!AC || !soundOn || !noiseBuf) return; const t0 = AC.currentTime;
  const n = AC.createBufferSource(); n.buffer = noiseBuf; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2;
  bp.frequency.setValueAtTime(up ? 180 : 1800, t0); bp.frequency.exponentialRampToValueAtTime(up ? 2400 : 160, t0 + 1.4);
  const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.5, t0 + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
  n.connect(bp); bp.connect(g); g.connect(master); n.start(t0); n.stop(t0 + 1.7);
}
$('sound-btn').addEventListener('click', () => {
  soundOn = !soundOn; if (master) master.gain.value = soundOn ? 0.7 : 0;
  $('sound-btn').setAttribute('aria-pressed', String(soundOn));
  if (soundOn) { $('snd-wave').removeAttribute('hidden'); $('snd-off').setAttribute('hidden', ''); } else { $('snd-wave').setAttribute('hidden', ''); $('snd-off').removeAttribute('hidden'); }
});

// ---------- red alert klaxon ----------
// An original two-tone whoop: a buzzy rising sweep, then a short falling tail, through a
// band-pass "loudspeaker" and a short echo so it sounds like it is coming from the ship's PA.
let klaxonNodes = [];
function klaxonStop() {
  if (!AC) return; const t = AC.currentTime;
  klaxonNodes.forEach((n) => { try { if (n.gain) { n.gain.cancelScheduledValues(t); n.gain.setTargetAtTime(0.0001, t, 0.05); } else n.stop(t + 0.3); } catch (e) { /* already stopped */ } });
  klaxonNodes = [];
}
function klaxon(cycles) {
  if (!AC || !soundOn) return; klaxonStop(); cycles = cycles || 4;
  const t0 = AC.currentTime + 0.05, per = 1.25;
  const out = AC.createGain(); out.gain.value = 0.16; out.connect(master);
  const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 0.8; // small horn speaker
  const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 260;
  const shaper = AC.createWaveShaper(); const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * 2.2); } shaper.curve = curve; // gentle overdrive
  const echo = AC.createDelay(0.5); echo.delayTime.value = 0.17; const fb = AC.createGain(); fb.gain.value = 0.28; const wet = AC.createGain(); wet.gain.value = 0.35;
  shaper.connect(hp); hp.connect(bp); bp.connect(out); bp.connect(echo); echo.connect(fb); fb.connect(echo); echo.connect(wet); wet.connect(out);
  const env = AC.createGain(); env.gain.value = 0.0001; env.connect(shaper);
  const oA = AC.createOscillator(), oB = AC.createOscillator(); oA.type = 'sawtooth'; oB.type = 'square';
  const gB = AC.createGain(); gB.gain.value = 0.45; oA.connect(env); oB.connect(gB); gB.connect(env);
  for (let c = 0; c < cycles; c++) {
    const s = t0 + c * per;
    [[oA, 1], [oB, 1.007]].forEach(([o, k]) => {
      o.frequency.setValueAtTime(300 * k, s); o.frequency.exponentialRampToValueAtTime(690 * k, s + 0.62); // the whoop
      o.frequency.setValueAtTime(690 * k, s + 0.7); o.frequency.exponentialRampToValueAtTime(520 * k, s + 0.86); // the drop
    });
    env.gain.setValueAtTime(0.0001, s); env.gain.exponentialRampToValueAtTime(0.9, s + 0.06);
    env.gain.setValueAtTime(0.9, s + 0.8); env.gain.exponentialRampToValueAtTime(0.0001, s + 0.92);
  }
  const end = t0 + cycles * per + 0.8; oA.start(t0); oB.start(t0); oA.stop(end); oB.stop(end);
  klaxonNodes = [oA, oB, env, out];
}

````

---

## `js/ui.js`

````javascript
// USS Defiance · ui.js
// Station panels, alerts, ship actions and the HUD.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- UI ----------
const locNode = document.querySelector('.locator').firstChild; let lastLoc = 'Main Bridge';
const ui = { panel: $('panel'), title: $('p-title'), role: $('p-role'), read: $('p-read'), note: $('p-note'), acts: $('p-actions'), hint: $('hint'), reticle: $('reticle'), toast: $('toast'), chip: $('alert-chip'), seatbar: $('seatbar'), stick: $('stick'), knob: $('knob'), flash: $('flash') };
let toastTimer = 0;
function toast(msg, who) {
  ui.toast.replaceChildren();
  if (who) { const b = document.createElement('b'); b.textContent = who + ': '; ui.toast.append(b); }
  ui.toast.append(document.createTextNode(msg)); ui.toast.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { ui.toast.hidden = true; }, 3600);
}
function shipTime(at) { const s = Math.floor(at); return 'T+' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
const COMMS_POOL = [
  () => ({ who: 'Convoy Lead', text: 'All three freighters reporting green. Holding formation.' }),
  () => ({ who: `${sysCur().star} relay`, text: 'Automated beacon received. No hostile traffic on the board.' }),
  () => ({ who: 'Meridian Station', text: 'Telemetry received. Good hunting, Defiance.' }),
  () => ({ who: 'Engineering', text: 'Warp core holding at 98 percent. She is ready when you are.' }),
];
let commsIdx = 0;

const STATIONS = {
  helm: { title: 'Flight', role: 'Helm and navigation', panel: () => ({
    read: [['Speed', SPEEDS[state.speed].name], ['Location', `${sysCur().star} system`], ['Destination', `${sysDest().star} · ${sysDest().heading}`], ['Nacelles', `Port ${pct(sim.zones.portNac)} · Starboard ${pct(sim.zones.stbdNac)}`], ['Impulse limit', pct(maxImpulse() * 100)]],
    note: !simCanWarp() ? 'Both nacelles are below 25%. Warp is unavailable until Damage Control repairs one.' : state.speed === 'warp' ? 'At warp. Drop to impulse or all stop to arrive at your destination.' : 'Pick a different destination at the situation table aft.',
    acts: [
      { label: 'All stop', on: state.speed === 'stop', fn: () => setSpeed('stop') },
      { label: 'Impulse', on: state.speed === 'impulse', fn: () => setSpeed('impulse') },
      { label: 'Engage warp', on: state.speed === 'warp', disabled: !simCanWarp() && state.speed !== 'warp', fn: () => setSpeed('warp') },
      { label: state.bayDoors ? 'Close shuttlebay' : 'Open shuttlebay', on: state.bayDoors, fn: () => order('Flight', state.bayDoors ? 'Closing the shuttlebay doors.' : 'Opening the shuttlebay doors. Bay is depressurised and clear.', () => { state.bayDoors = !state.bayDoors; }) },
    ] }) },
  ops: { title: 'Operations', role: 'Crew, convoy and resources', panel: () => ({
    read: [['Power preset', cap(sim.preset)], ['Reactor', `${Math.round(reactorOut())} units`], ['Weapons · shields', `${sim.alloc.weapons} · ${sim.alloc.shields}`], ['Engines · sensors', `${sim.alloc.engines} · ${sim.alloc.sensors}`], ['Convoy', '3 freighters in formation']],
    note: 'Presets split the reactor between weapons, shields, engines and sensors. Life support always keeps 5.',
    acts: ['balanced', 'attack', 'defend', 'speed'].map((p) => ({ label: cap(p), on: sim.preset === p, fn: () => order('Operations', `Power to ${p === 'balanced' ? 'balanced' : p} preset. Aye.`, () => setPreset(p)) }))
      .concat([{ label: 'Ship-wide announcement', fn: () => { beep([660, 990, 1320], 0.09, 0.05); toast('All hands, this is the captain. Stay sharp. We see the convoy home.', 'Ship-wide'); } }]),
  }) },
  viewer: { title: 'Main Viewer', role: 'Forward viewscreen', panel: () => ({
    read: [['View', state.view === 'target' ? `Magnified on ${sysCur().planet}` : 'Forward'], ['Range', state.speed === 'warp' ? 'At warp' : sysCur().dist]],
    acts: [
      { label: 'Forward view', on: state.view === 'forward', fn: () => setView('forward') },
      { label: 'Magnify target', on: state.view === 'target', disabled: state.speed === 'warp', fn: () => setView('target') },
    ] }) },
  science: { title: 'Science', role: 'Sensors and analysis', panel: () => {
    const sys = sysCur(), away = state.speed === 'warp';
    return {
      read: [['Target', away ? 'None in range' : sys.planet], ['Class', away ? '—' : sys.cls], ['Atmosphere', away ? '—' : sys.atm], ['Life signs', away ? '—' : state.scanned ? sys.life : state.scanning ? 'Scanning…' : 'Scan required'], ['Distance', away ? '—' : sys.dist]],
      acts: [{ label: state.scanning ? 'Scanning…' : state.scanned ? 'Scan again' : 'Scan planet', on: state.scanning, disabled: away || state.scanning, fn: startScan }],
    }; } },
  engineering: { title: 'Engineering', role: 'Warp core and propulsion', panel: () => ({
    read: [['Reactor output', `${Math.round(reactorOut())} of ${SIM.reactor} units`], ['Engines zone', pct(sim.zones.engines)], ['Emergency power', sim.emergency.boost > 0 ? `To shields · ${Math.ceil(sim.emergency.boost)} s` : sim.emergency.penalty > 0 ? `Recovering · ${Math.ceil(sim.emergency.penalty)} s` : 'Ready'], ['Containment', sim.breach !== null ? `FAILING · breach in ${Math.ceil(sim.breach)} s` : 'Stable'], ['Field coils', state.speed === 'warp' ? 'Energized' : 'Idle']],
    note: 'Emergency power boosts shield recovery by 40% for 20 seconds, then the reactor runs 20% low for 30 seconds.',
    acts: [{ label: 'Emergency power to shields', disabled: sim.emergency.boost > 0 || sim.emergency.penalty > 0, fn: () => order('Engineering', 'Emergency power to the shields. Twenty seconds, Captain.', emergencyPower) }],
  }) },
  env: { title: 'Environment', role: 'Life support and bridge lighting', panel: () => ({
    read: [['Atmosphere', '21.4% O2 · 101 kPa'], ['Temperature', '21.5 °C'], ['Gravity', '1.00 g'], ['CO2 scrubbers', 'Nominal'], ['Bridge lighting', state.light[0].toUpperCase() + state.light.slice(1)]],
    acts: ['dim', 'standard', 'bright'].map((l) => ({ label: l === 'dim' ? 'Dim' : l === 'bright' ? 'Bright' : 'Standard', on: state.light === l, fn: () => setLight(l) })),
  }) },
  weapons: { title: 'Weapons Control', role: 'Beam arrays and torpedoes', panel: () => ({
    read: weaponRows(pal()).map(([k, v]) => [cap(k.toLowerCase()), cap(v.toLowerCase())]),
    note: 'Beams charge and tubes load at Red Alert. Weapons power comes from Operations.',
    acts: [],
  }) },
  ew: { title: 'Electronic Warfare', role: 'Jamming, decoys and emission control', panel: () => ({
    read: [['Emission profile', state.alert === 'red' ? 'Masked' : 'Standard'], ['Jammers', state.alert !== 'green' ? 'Armed' : 'Standby'], ['Decoys', '4 ready'], ['Threat receivers', 'All bands clear'], ['Hostile emitters', '0']],
    acts: [],
  }) },
  intel: { title: 'Intelligence', role: 'Tracking and threat assessment', panel: () => ({
    read: [['Tracked contacts', '7'], ['Friendly', '3 (convoy)'], ['Unknown', state.alert !== 'green' ? '1 · Track 0417' : '0'], ['Threat level', state.alert === 'red' ? 'High' : state.alert === 'yellow' ? 'Elevated' : 'Low'], ['Intercepts', 'None new']],
    acts: [],
  }) },
  head: { title: 'Head', role: 'Deck 1 facilities', panel: () => ({
    read: [['Water reclamation', '98.2%'], ['Stall', 'Vacant'], ['Supplies', 'Stocked']],
    note: 'Every starship has one. Somebody had to put it on the plans.',
    acts: [{ label: 'Wash up', fn: () => { whoosh(false); toast('Water reclaimed: 98.2%. You look ready for duty.', 'Head'); } }],
  }) },
  conference: { title: 'Conference Room', role: 'Senior staff briefings', panel: () => ({
    read: [['Seats', '7'], ['Briefing display', SLIDES[state.slide]], ['Viewport', state.shutters === 'closed' || (state.shutters === 'auto' && state.alert === 'red') ? 'Shuttered' : 'Open']],
    note: 'Walk up to the door to go in.', acts: [] }) },
  desk: { title: 'Captain’s Desk', role: 'Personal log and ship’s business', panel: () => ({
    read: [['Log entry', `${state.logIdx + 1} of ${LOG.length} · ${LOG[state.logIdx].d}`], ['Reports', state.reports ? state.reports + ' waiting for signature' : 'All signed'], ['Next briefing', '0800 · Conference room']],
    note: LOG[state.logIdx].t,
    acts: [
      { label: 'Previous entry', fn: () => { state.logIdx = (state.logIdx + LOG.length - 1) % LOG.length; renderPanel(); redrawStation('desk'); } },
      { label: 'Next entry', fn: () => { state.logIdx = (state.logIdx + 1) % LOG.length; renderPanel(); redrawStation('desk'); } },
      { label: 'Sign reports', disabled: !state.reports, fn: () => { state.reports = 0; toast('Reports signed and filed.', 'Desk'); renderPanel(); redrawStation('desk'); } },
    ] }) },
  synth: { title: 'Synthesizer', role: 'Food and beverage', panel: () => ({
    read: [['Last order', state.cup || 'None'], ['Reserve', '94%']],
    acts: [['Coffee, black', 0x2a170c], ['Tea, green', 0x7a6a2a], ['Water, cold', 0x9cc4dc]].map(([n, c]) => ({ label: n, on: state.cup === n, fn: () => { state.cup = n; cupGroup.visible = true; cupLiquid.color.setHex(c); beep([660, 990], 0.08, 0.04); toast(`${n}. Ready in the niche.`, 'Synthesizer'); renderPanel(); } }))
      .concat([{ label: 'Recycle cup', disabled: !state.cup, fn: () => { state.cup = null; cupGroup.visible = false; renderPanel(); } }]),
  }) },
  shutters: { title: 'Viewport Shutters', role: 'Armored blast shutters', panel: () => {
    const closed = state.shutters === 'closed' || (state.shutters === 'auto' && state.alert === 'red');
    return {
      read: [['Mode', state.shutters[0].toUpperCase() + state.shutters.slice(1)], ['Position', closed ? 'Closed' : 'Open']],
      note: 'In Auto the shutters close whenever the ship goes to Red Alert. They cover every viewport on this deck.',
      acts: [['auto', 'Auto'], ['open', 'Open'], ['closed', 'Close']].map(([k, n]) => ({ label: n, on: state.shutters === k, fn: () => { state.shutters = k; beep([520, 390], 0.12, 0.04); renderPanel(); } })),
    }; } },
  brief: { title: 'Briefing Display', role: 'Conference room', panel: () => ({
    read: [['Slide', `${state.slide + 1} of ${SLIDES.length} · ${SLIDES[state.slide]}`], ['Seats', '7 · display on every place']],
    acts: [
      { label: 'Previous', fn: () => setSlide(state.slide - 1) },
      { label: 'Next', fn: () => setSlide(state.slide + 1) },
    ] }) },
  honors: { title: 'Battle Honors', role: 'USS Defiance', panel: () => ({
    read: [['Year 2', 'Kessra Approach'], ['Year 2', 'Iralis Picket Line'], ['Year 3', 'The Thessaly Run'], ['Year 3', 'Okonkwo Breakout']],
    note: 'Four engagements, four convoys brought home. The crew reads the plaque on the way into every briefing.',
    acts: [] }) },
  damage: { title: 'Damage Control', role: 'Hull and structure', panel: () => ({
    read: [['Hull integrity', pct(hullIntegrity())]].concat(ZONES.filter((z) => sim.zones[z.id] < 100).sort((a, b) => sim.zones[a.id] - sim.zones[b.id]).slice(0, 4).map((z) => [z.name, pct(sim.zones[z.id])])).concat(sim.teams.map((tm, i) => [`Team ${i + 1}`, tm.to ? `Moving to ${ZONE_NAME[tm.to]}` : tm.at ? `${ZONE_NAME[tm.at]}${sim.zones[tm.at] < SIM.repair.cap ? ', repairing' : ', done'}` : 'Standing by'])),
    note: sim.breach !== null ? `Core breach in ${Math.ceil(sim.breach)} s. Send a team to the engines.` : 'Each team takes 10 seconds to move, then repairs 1% a second, up to 80% in the field.',
    acts: ((picked) => sim.teams.map((tm, i) => {
      // each idle team is offered the worst zone nobody else is on or has been offered
      const covered = sim.teams.filter((t, j) => j !== i).map((t) => t.to || t.at).concat(picked), wz = sim.breach !== null && !covered.includes('engines') ? ZONES.find((z) => z.id === 'engines') : worstZone(covered);
      if (wz && !(tm.at === wz.id || tm.to === wz.id)) picked.push(wz.id);
      return { label: wz ? `Team ${i + 1} to ${wz.name}` : `Team ${i + 1}: no work`, disabled: !wz || tm.at === wz.id || tm.to === wz.id, fn: () => order('Damage Control', `Team ${i + 1} on the way to the ${wz.name.toLowerCase()}.`, () => sendTeam(i, wz.id)) };
    }))([]).concat([{ label: 'Reset after drill', disabled: sim.drill.on || hullIntegrity() >= 100, fn: () => { simReset(); toast('Ship restored. All sections at full.', 'Damage Control'); renderPanel(); redrawAll(); } }]),
  }) },
  defense: { title: 'Tactical', role: 'Weapons, deflectors and alert status', panel: () => ({
    read: [['Condition', ALERTS[state.alert].label], ['Shields', sim.shields.up < 0.01 ? 'Down (navigational field)' : ARCS.map((a) => `${ARC_NAMES[a][0]} ${Math.round(shieldNow(a))}`).join(' · ')], ['Reinforced arc', sim.shields.reinforce ? ARC_NAMES[sim.shields.reinforce] : 'None, even spread'], ['Hull', pct(hullIntegrity())], ['Torpedoes', `${torpsLeft()} of ${SIM.torp.perBay * 2}`]],
    note: sim.drill.on ? `Combat drill running: ${Math.ceil(sim.drill.t)} seconds left. Watch the shields, then send repair teams from Damage Control.` : 'The combat drill throws simulated hits at the ship for 60 seconds.',
    acts: [
      { label: 'Green', on: state.alert === 'green', fn: () => setAlert('green') },
      { label: 'Yellow', on: state.alert === 'yellow', fn: () => setAlert('yellow') },
      { label: 'Red', on: state.alert === 'red', fn: () => setAlert('red') },
      { label: 'Sound klaxon', fn: () => klaxon(4) },
      { label: 'Silence klaxon', fn: () => klaxonStop() },
      { label: `Reinforce: ${sim.shields.reinforce ? ARC_NAMES[sim.shields.reinforce] : 'even'}`, on: !!sim.shields.reinforce, fn: () => { const seq = [null, 'fwd', 'port', 'stbd', 'aft'], nx = seq[(seq.indexOf(sim.shields.reinforce) + 1) % seq.length]; order('Tactical', nx ? `Reinforcing ${ARC_NAMES[nx].toLowerCase()} shields.` : 'Shields back to an even spread.', () => reinforceArc(nx)); } },
      sim.drill.on ? { label: 'Stop drill', on: true, fn: () => { stopDrill(); renderPanel(); } } : { label: 'Combat drill', disabled: sim.lost, fn: () => { startDrill(); renderPanel(); } },
    ] }) },
  comms: { title: 'Communications', role: 'Subspace relay', panel: () => ({
    read: state.comms.slice(-3).reverse().map((m) => [shipTime(m.at), `${m.who}: ${m.text}`]),
    acts: [
      { label: 'Open a channel', fn: () => { const m = COMMS_POOL[commsIdx++ % COMMS_POOL.length](); state.comms.push({ at: elapsed, who: m.who, text: m.text }); beep([1200, 1600], 0.06, 0.04); renderPanel(); } },
      { label: 'Clear log', disabled: !state.comms.length, fn: () => { state.comms = []; renderPanel(); } },
    ] }) },
  command: { title: 'Command Chair', role: 'Captain’s station', panel: () => ({
    read: [['Condition', ALERTS[state.alert].label], ['Speed', SPEEDS[state.speed].name], ['Hull', pct(hullIntegrity())], ['Power', `${cap(sim.preset)} · ${Math.round(reactorOut())} units`], ['Location', `${sysCur().star} system`]],
    acts: [state.sitting ? { label: 'Stand up', fn: stand } : { label: 'Take the chair', fn: sit }],
  }) },
  carto: { title: 'Situation Table', role: 'Navigation and tactical plot', panel: () => {
    const s = SYSTEMS[state.holo];
    return {
      read: [['Showing', `${s.star} system`], ['Planets', String(s.planets)], ['Survey target', s.planet], ['Heading', s.heading]],
      note: state.holo === state.cur ? 'This is the system the ship is in now.' : state.holo === state.dest ? 'This is the current destination.' : null,
      acts: [
        { label: 'Previous', fn: () => showHolo(state.holo - 1) },
        { label: 'Next', fn: () => showHolo(state.holo + 1) },
        { label: state.holo === state.dest ? 'Destination set' : 'Set as destination', on: state.holo === state.dest, disabled: state.holo === state.cur, fn: () => { state.dest = state.holo; toast(`Course laid in for ${SYSTEMS[state.dest].star}.`, 'Flight'); beep([880, 1320], 0.07, 0.04); renderPanel(); redrawAll(); } },
        { label: state.holoOn ? 'Plot off' : 'Plot on', fn: () => { state.holoOn = !state.holoOn; renderPanel(); } },
      ],
    }; } },
  ship: { title: 'USS Defiance', role: 'EV-0408 · Bastion-class heavy escort', panel: () => ({
    read: [['Roles', 'Deep-space interdiction, heavy strike, heavy escort'], ['Crew', '140'], ['Commissioned', 'Second year of the Hollow War'], ['Armament', 'Dorsal and ventral beam arrays, twin forward torpedo bays']],
    note: 'A compact hull wrapped around engines and weapons built for a ship twice her size. She runs ahead of convoys, cuts supply lines deep behind the front, and stands her ground when the line breaks.',
    acts: [],
  }) },
  ready: { title: 'Ready Room', role: 'Captain’s office', panel: () => ({
    read: [['Inside', 'Desk, settee, synthesizer'], ['Viewport', 'Armored, shuttered at Red Alert']],
    note: 'Walk up to the door to go in.',
    acts: [],
  }) },
};

const pct = (v) => Math.round(v) + '%';
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
// An order: the crew acknowledges it, the ship model changes, and the screens update.
function order(who, ack, fn) { const ok = fn(); if (ok !== false) toast(ack, who); renderPanel(); redrawStation(state.open); }
let curActs = [];
function renderPanel() {
  const id = state.open; if (!id) return;
  const st = STATIONS[id], p = st.panel();
  ui.title.textContent = st.title; ui.role.textContent = st.role;
  if (p.read.length) ui.read.replaceChildren(...p.read.flatMap(([k, v]) => { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; return [dt, dd]; }));
  else { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = 'Log'; dd.textContent = 'No messages.'; ui.read.replaceChildren(dt, dd); }
  ui.note.hidden = !p.note; ui.note.textContent = p.note || '';
  curActs = p.acts;
  const btns = ui.acts.querySelectorAll('button');
  if (btns.length === p.acts.length && ui.acts.dataset.station === id) { // live refresh: update in place so a press in progress isn't lost
    p.acts.forEach((a, i) => { const b = btns[i]; if (b.textContent !== a.label) b.textContent = a.label; b.className = 'act' + (a.on ? ' on' : ''); b.disabled = !!a.disabled; });
    return;
  }
  ui.acts.dataset.station = id;
  const focused = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.idx : undefined;
  ui.acts.replaceChildren(...p.acts.map((a, i) => {
    const b = document.createElement('button'); b.className = 'act' + (a.on ? ' on' : ''); b.textContent = a.label; b.disabled = !!a.disabled; b.dataset.idx = String(i); b.dataset.num = String(10 + ((id.length * 7 + i * 13) % 89)) + '-' + String(100 + i * 37);
    b.addEventListener('click', () => { beep([1046], 0.05, 0.035); if (curActs[i]) curActs[i].fn(); }); return b;
  }));
  if (focused !== undefined) { const b = ui.acts.querySelector(`[data-idx="${focused}"]`); if (b && !b.disabled) b.focus({ preventScroll: true }); }
}
function openStation(id) { if (typeof unlockLook === 'function') unlockLook(); state.open = id; ui.panel.style.setProperty('--fn', FUNC_CSS[FUNC[id] || 'acc']); ui.panel.hidden = false; ui.seatbar.hidden = true; beep([880, 1175], 0.05, 0.035); renderPanel(); updateHighlights(); }
function closePanel() { state.open = null; ui.acts.dataset.station = ''; ui.panel.hidden = true; ui.seatbar.hidden = !state.sitting; updateHighlights(); if (typeof lockLook === 'function') lockLook(); }
$('p-close').addEventListener('click', closePanel);

function setSpeed(s) {
  if (s === 'warp' && state.speed !== 'warp' && !simCanWarp()) { toast('Unable, Captain. Both nacelles are too badly damaged to hold a warp field.', 'Flight'); renderPanel(); return; }
  if (s === 'warp' && state.speed !== 'warp') {
    ui.flash.classList.remove('go'); void ui.flash.offsetWidth; if (!reduceMotion) ui.flash.classList.add('go');
    toast(`Warp engaged. Heading for ${sysDest().star}.`, 'Flight'); whoosh(true); state.view = 'forward';
  } else if (state.speed === 'warp' && s !== 'warp') whoosh(false);
  state.speed = s; if (s === 'warp') state.scanning = false;
  renderPanel(); redrawAll();
}
function redrawStation(id) { (byStation[id] || []).forEach((sc) => { if (sc.kind !== 'keys') drawScreen(sc); }); }
function setSlide(i) { state.slide = (i + SLIDES.length) % SLIDES.length; (byStation.brief || []).forEach((sc) => { if (sc.kind === 'brief') sc.title = 'Briefing · ' + SLIDES[state.slide]; }); redrawStation('brief'); renderPanel(); beep([880, 1175], 0.05, 0.03); }
function setView(v) { state.view = v; renderPanel(); drawOverlay(); }
function arrive() {
  state.cur = state.dest; state.dest = (state.cur + 1) % SYSTEMS.length; state.scanned = false; state.holo = state.cur;
  setSystem(state.cur); buildHolo(state.holo);
  state.comms.push({ at: elapsed, who: `${sysCur().star} relay`, text: `Welcome to the ${sysCur().star} system.` });
  toast(`Arrived at ${sysCur().star}. ${sysCur().planet} is ahead.`, 'Flight');
  renderPanel(); redrawAll();
}
function startScan() { state.scanning = true; state.scanT = 0; beep([1500, 1800, 2100], 0.05, 0.03); renderPanel(); redrawAll(); }
function setLight(l) { state.light = l; applyLights(); renderPanel(); }
function setAlert(a) {
  const prev = state.alert; state.alert = a; const A = ALERTS[a];
  stripMats.forEach((m) => m.color.setHex(A.strip).multiplyScalar(1.9));
  slotMats.forEach((m) => m.color.setHex(A.slot).multiplyScalar(1.35));
  MAT.wall.emissive.setHex(A.slot); ROOM_WALL_MATS.forEach((m) => m.emissive.setHex(A.slot));
  document.documentElement.style.setProperty('--signal', A.acc);
  document.documentElement.style.setProperty('--signal-rgb', A.rgb);
  document.documentElement.classList.remove('alert-green', 'alert-yellow', 'alert-red'); document.documentElement.classList.add('alert-' + a);
  ui.chip.textContent = A.label; $('alert-chip-s').textContent = A.short[0] + A.short.slice(1).toLowerCase();
  if (a === 'red' && prev !== 'red') klaxon(4);
  if (a !== 'red') klaxonStop();
  if (a === 'yellow' && prev !== 'yellow') beep([740, 740], 0.14, 0.04);
  applyLights(); renderPanel(); redrawAll();
}
function applyLights() {
  const k = LIGHT_LEVELS[state.light] * (state.alert === 'red' ? 0.6 : 1), A = ALERTS[state.alert];
  fallbackApply(k, A);
  bakeLevels(LIGHT_LEVELS[state.light] * (state.alert === 'red' ? 0.28 : 1), state.alert, A.strip, 1);
  const dk = Math.min(1, 0.35 + 0.65 * k);
  lightDiscMat.color.setHex(state.alert === 'red' ? 0xff9a88 : 0xffffff).multiplyScalar(dk * 0.6);
  downlightMat.color.setHex(state.alert === 'red' ? 0xff8070 : 0xfff0dc).multiplyScalar(dk);
  poolMats.forEach((p) => { p.m.material.opacity = p.op * k; });
  renderer.toneMappingExposure = 1.1;
  if (BAKE.ok) bakeEnv(); // re-photograph the room for reflections in the new light
}
function showHolo(i) { state.holo = (i + SYSTEMS.length) % SYSTEMS.length; buildHolo(state.holo); renderPanel(); }
function sit() { state.sitting = true; closePanel(); ui.seatbar.hidden = false; }
function stand() { state.sitting = false; player.x = 0; player.z = 1.6; player.y = DAIS.h + EYE; closePanel(); }
$('stand-btn').addEventListener('click', stand);

// ---------- ship model messages ----------
// The ship model reports what the crew says in sim.events; show them one at a time so none are lost.
const simQueue = []; let simToastT = 0, lostT = 0;
function drainSimEvents(dt) {
  for (const ev of sim.events) { if (ev.alert) { if (state.alert !== ev.alert) setAlert(ev.alert); } else simQueue.push(ev); }
  sim.events.length = 0;
  simToastT -= dt;
  if (simQueue.length && simToastT <= 0) { const ev = simQueue.shift(); toast(ev.text, ev.who); beep([990, 1320], 0.05, 0.03); simToastT = simQueue.length ? 1.6 : 0.4; }
  if (sim.lost) {
    lostT += dt;
    if (lostT > 3 && lostT - dt <= 3) toast('The Defiance has been lost. This was a drill: restoring the sim.', 'Ship');
    if (lostT > 7) { lostT = 0; simReset(); setAlert('green'); redrawAll(); }
  }
}

````

---

## `js/lift.js`

````javascript
// USS Defiance · lift.js
// Lift 1: a real car behind the aft bridge door. Step in, pick a deck on the back-wall panel, the doors close,
// the car rides for a few seconds, and the doors open on the new deck. Only one deck is in the scene at a time:
// while you are away from Deck 1, the whole bridge deck is hidden. Decks 2 to 6 are not fitted out yet, so they
// open onto a sealed lift lobby (a placeholder the later build stages replace, Deck 2 first).
//
// Lighting: the car and the lobbies are not part of the light bake (bake.js skips materials flagged noBake).
// Their light is painted into small light-map images instead: a light map is an image that says how much light
// falls on each part of a surface, so no live lights are needed and phones stay fast.
// Files share one global scope and load in order (see index.html).
'use strict';

// Decks Lift 1 serves (from docs/master-systems-display.html)
const LIFT_DECKS = [
  { n: 1, name: 'Main Bridge', short: 'BRIDGE', built: true },
  { n: 2, name: 'Officers’ deck', short: 'OFFICERS', built: true, rooms: ['Lift 1 lobby', 'Captain’s quarters', 'Officers’ corridor', 'First officer’s quarters', 'Senior officers’ cabins', 'Officers’ wardroom', 'Officers’ passage', 'Observation lounge'], sealed: [] },
  { n: 3, name: 'Medical and officers', short: 'MEDICAL', built: true, rooms: ['Sickbay', 'Medical lab', 'Officers’ quarters', 'Forward shield generator'] },
  { n: 4, name: 'Crew deck', short: 'CREW', rooms: ['Mess hall and galley', 'Crew lounge and gym', 'Crew quarters', 'Auxiliary control'] },
  { n: 5, name: 'Weapons and transport', short: 'WEAPONS', rooms: ['Torpedo bays 1 and 2', 'Armory and security', 'Transporter rooms', 'Science labs'] },
  { n: 6, name: 'Deflector and cargo', short: 'CARGO', rooms: ['Navigational deflector', 'Cargo bay 1', 'Torpedo loading', 'Crew quarters'] },
];
const liftDeck = (n) => LIFT_DECKS[n - 1];

// ---------- geometry (world metres, forward is -z) ----------
const [LIFT_DX, LIFT_DZ] = onEdge(LIFT_GAP.edge, LIFT_GAP.t, 0); // the door, on the aft bridge wall line (z = 6.2)
const CAR = { x0: LIFT_DX - 0.8, x1: LIFT_DX + 0.8, z0: LIFT_DZ + 0.22, z1: LIFT_DZ + 2.22, h: 2.7 };
const LOBBY = { x0: LIFT_DX - 3.0, x1: LIFT_DX + 3.0, z0: LIFT_DZ - 4.2, z1: LIFT_DZ, h: 2.9 };
const LIFT = {
  deck: 1, from: 1, to: 1, phase: 'idle', t: 0, dur: 0, door: 0, shake: 0, inside: false,
  root: group(0, 0, 0, 0), stub: group(0, 0, 0, 0), deck1: null, k: -1,
  carSegs: [], stubSegs: [], doorSeg: [LIFT_DX - 0.6, LIFT_DZ, LIFT_DX + 0.6, LIFT_DZ, 0.2], mats: [], panels: [], stubDoor: null, lum: 0.8,
};
LIFT.stub.visible = false;
const inCar = (x, z) => x > CAR.x0 && x < CAR.x1 && z > CAR.z0 - 0.05 && z < CAR.z1;

// ---------- materials (outside the bake) ----------
function noBake(m, lmBase) { m.userData.noBake = true; if (m.lightMap) { m.userData.lmBase = lmBase || 1; LIFT.mats.push(m); } return m; }
// light map: brightest under the ceiling light, falling off toward the floor
function lmWall(top, mid, low) {
  const c = cnv(4, 128), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, `rgb(${top},${top},${top})`); gr.addColorStop(0.12, `rgb(${top},${top},${top})`); gr.addColorStop(0.5, `rgb(${mid},${mid},${mid})`); gr.addColorStop(1, `rgb(${low},${low},${low})`);
  g.fillStyle = gr; g.fillRect(0, 0, 4, 128); const t = tex(c, false); t.wrapS = THREE.RepeatWrapping; return t;
}
function lmFloor(w, d, spots, base) {
  const S = 64, c = cnv(Math.round(S * w / Math.max(w, d)) + 2, Math.round(S * d / Math.max(w, d)) + 2), g = c.getContext('2d');
  g.fillStyle = `rgb(${base},${base},${base})`; g.fillRect(0, 0, c.width, c.height);
  spots.forEach(([u, v, r, a]) => { const gr = g.createRadialGradient(u * c.width, (1 - v) * c.height, 0, u * c.width, (1 - v) * c.height, r * c.width); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); });
  // darker along the walls, where less of the ceiling is visible
  const e = g.createLinearGradient(0, 0, c.width, 0); e.addColorStop(0, 'rgba(0,0,0,0.35)'); e.addColorStop(0.15, 'rgba(0,0,0,0)'); e.addColorStop(0.85, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = e; g.fillRect(0, 0, c.width, c.height);
  const f = g.createLinearGradient(0, 0, 0, c.height); f.addColorStop(0, 'rgba(0,0,0,0.35)'); f.addColorStop(0.15, 'rgba(0,0,0,0)'); f.addColorStop(0.85, 'rgba(0,0,0,0)'); f.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = f; g.fillRect(0, 0, c.width, c.height);
  return tex(c, false);
}
// padded wall bays: dark kick panel, steel rail at hand height, warm upholstered upper panel, dark frieze under the ceiling
function liftWallCanvas(H, upper) {
  const Wd = 192, Hp = Math.round(H * 160), Y = (m) => Hp - m * 160, c = cnv(Wd, Hp), g = c.getContext('2d');
  g.fillStyle = '#26241f'; g.fillRect(0, 0, Wd, Hp);
  g.fillStyle = '#2f2c28'; g.fillRect(0, Y(0.9), Wd, Y(0.12) - Y(0.9));
  noise(g, Wd, Hp, 2500, 0.03, 53);
  const gr = g.createLinearGradient(0, Y(H - 0.3), 0, Y(1.0)); gr.addColorStop(0, upper[0]); gr.addColorStop(1, upper[1]);
  g.fillStyle = gr; g.fillRect(0, Y(H - 0.3), Wd, Y(1.0) - Y(H - 0.3));
  const r = mulberry(61); for (let i = 0; i < 3000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,240,220,0.04)' : 'rgba(0,0,0,0.05)'; g.fillRect(r() * Wd, Y(H - 0.3) + r() * (Y(1.0) - Y(H - 0.3)), 1.2, 1.2); }
  [0, 96].forEach((x) => { g.fillStyle = 'rgba(20,16,12,0.6)'; g.fillRect(x, Y(H - 0.3), 3, Y(0.9) - Y(H - 0.3)); g.fillStyle = 'rgba(255,240,220,0.12)'; g.fillRect(x + 3, Y(H - 0.3), 1, Y(0.9) - Y(H - 0.3)); });
  g.fillStyle = '#8f887f'; g.fillRect(0, Y(1.0), Wd, Y(0.9) - Y(1.0)); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(0, Y(1.0), Wd, 2);
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 2; g.strokeRect(12, Y(0.82), 72, Y(0.2) - Y(0.82)); g.strokeRect(108, Y(0.82), 72, Y(0.2) - Y(0.82));
  g.fillStyle = '#181614'; g.fillRect(0, Y(0.12), Wd, Hp - Y(0.12));
  return c;
}
function liftWallMat(H, upper, lm) {
  const c = liftWallCanvas(H, upper), map = tex(c), nm = normalTex(c, 2.5); map.wrapS = nm.wrapS = THREE.RepeatWrapping;
  return noBake(new THREE.MeshStandardMaterial({ map, normalMap: nm, roughness: 0.85, metalness: 0.05, envMapIntensity: 0.25, lightMap: lm, lightMapIntensity: 1 }), 1);
}
function plainMat(color, metal, rough, env, lm, lmK) { return noBake(new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, envMapIntensity: env, lightMap: lm || null, lightMapIntensity: lmK || 1 }), lmK || 1); }
const LM_CAR = lmWall(255, 215, 150), LM_LOBBY = lmWall(250, 210, 150);
const LIFT_MAT = {
  carWall: liftWallMat(CAR.h, ['#cbbfac', '#bcae9a'], LM_CAR),
  lobbyWall: liftWallMat(LOBBY.h, ['#c2b6a4', '#b2a592'], LM_LOBBY),
  steel: plainMat(0xa29c94, 0.9, 0.28, 1.1, LM_CAR, 0.6),
  gun: plainMat(0x34322f, 0.6, 0.45, 0.6, LM_CAR, 0.8),
  ceil: plainMat(0x9a948b, 0.2, 0.8, 0.2, LM_LOBBY, 0.6),
  carFloor: plainMat(0x5a5650, 0.45, 0.55, 0.5, lmFloor(1.6, 2.0, [[0.5, 0.5, 0.6, 0.9]], 120), 1),
  lobbyFloor: plainMat(0x6a6f78, 0.45, 0.6, 0.45, lmFloor(6.0, 4.2, [[0.5, 0.5, 0.42, 0.85], [0.5, 0.88, 0.22, 0.5]], 95), 1),
  panel: plainMat(0x9a9184, 0.15, 0.6, 0.45, LM_LOBBY, 0.9),
  hazard: noBake(new THREE.MeshStandardMaterial({ map: MAT.hazard.map, roughness: 0.6, lightMap: LM_LOBBY, lightMapIntensity: 0.8 }), 0.8),
};
// luminous ceiling: warm white diffuser behind a dark grid
function lumCanvas(w, d, cols, rows) {
  const c = cnv(Math.round(w * 160), Math.round(d * 160)), g = c.getContext('2d');
  const gr = g.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, Math.max(c.width, c.height) * 0.7); gr.addColorStop(0, '#fff6e8'); gr.addColorStop(1, '#e8d8c0');
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#26231f'; for (let i = 0; i <= cols; i++) g.fillRect(i * (c.width - 6) / cols, 0, 6, c.height); for (let j = 0; j <= rows; j++) g.fillRect(0, j * (c.height - 6) / rows, c.width, 6);
  return tex(c);
}
const LUM = [];
// the car's corner light slots follow the alert colour like the bridge's cove slots, at lower strength (they are within arm's reach)
const CAR_SLOT = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false });
function lumPanel(parent, x, y, z, w, d, cols, rows) {
  const m = new THREE.MeshBasicMaterial({ map: lumCanvas(w, d, cols, rows), toneMapped: false }); LUM.push(m);
  const p = mesh(new THREE.PlaneGeometry(w, d), m, x, y, z, parent); p.rotation.x = Math.PI / 2;
  const f = mesh(BOX(w + 0.1, 0.04, d + 0.1), LIFT_MAT.gun, x, y + 0.012, z, parent);
  return p;
}
function liftSlab(parent, mat, x0, x1, z0, z1, y, down) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0), m = mesh(g, mat, (x0 + x1) / 2, y, (z0 + z1) / 2, parent);
  m.rotation.x = down ? Math.PI / 2 : -Math.PI / 2; OCCLUDERS.push(m); return m;
}
function segs(list, pts, r) { for (let i = 0; i + 1 < pts.length; i++) list.push([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], r]); }

// ---------- the car ----------
{
  const R = LIFT.root, { x0, x1, z0, z1, h } = CAR, W2 = x1 - x0, D2 = z1 - z0, M = LIFT_MAT.carWall;
  liftSlab(R, LIFT_MAT.carFloor, x0, x1, LIFT_DZ - 0.02, z1, 0.002, false);
  liftSlab(R, LIFT_MAT.gun, LIFT_DX - 0.62, LIFT_DX + 0.62, LIFT_DZ, z0, 2.3, true);
  liftSlab(R, LIFT_MAT.ceil, x0, x1, z0, z1, h, true);
  // front wall (door side, faces into the car) with the 1.2 x 2.3 m opening; back wall; sides
  const ds = LIFT_DX - 0.6 - x0;
  wallPiece(M, [x0, z0], [1, 0], [0, 1], 0, ds, 0, h, h, 1.2, R);
  wallPiece(M, [x0, z0], [1, 0], [0, 1], ds + 1.2, W2, 0, h, h, 1.2, R);
  wallPiece(M, [x0, z0], [1, 0], [0, 1], ds, ds + 1.2, 2.3, h, h, 1.2, R);
  wallPiece(M, [x0, z1], [1, 0], [0, -1], 0, W2, 0, h, h, 1.2, R);
  wallPiece(M, [x0, z0], [0, 1], [1, 0], 0, D2, 0, h, h, 1.2, R);
  wallPiece(M, [x1, z0], [0, 1], [-1, 0], 0, D2, 0, h, h, 1.2, R);
  // the gap between the bridge wall and the car: a short lined tunnel
  [[LIFT_DX - 0.62, 1], [LIFT_DX + 0.62, -1]].forEach(([x, s]) => wallPiece(LIFT_MAT.gun, [x, LIFT_DZ], [0, 1], [s, 0], 0, 0.22, 0, 2.3, 2.3, 1.2, R));
  lumPanel(R, (x0 + x1) / 2, h - 0.03, (z0 + z1) / 2, W2 - 0.3, D2 - 0.3, 2, 3);
  // light slots in the four corners, deck strips, handrails
  [[x0 + 0.03, z0 + 0.03], [x1 - 0.03, z0 + 0.03], [x0 + 0.03, z1 - 0.03], [x1 - 0.03, z1 - 0.03]].forEach(([x, z]) => mesh(BOX(0.025, h - 0.5, 0.025), CAR_SLOT, x, (h - 0.5) / 2 + 0.25, z, R));
  [[x0 + 0.012, (z0 + z1) / 2, 0.02, D2 - 0.1], [x1 - 0.012, (z0 + z1) / 2, 0.02, D2 - 0.1], [(x0 + x1) / 2, z1 - 0.012, W2 - 0.1, 0.02]].forEach(([x, z, w, d]) => mesh(BOX(w, 0.025, d), STRIP, x, 0.07, z, R));
  const rail = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az), r = mesh(new THREE.CylinderGeometry(0.022, 0.022, len, 12), LIFT_MAT.steel, (ax + bx) / 2, 0.95, (az + bz) / 2, R);
    r.rotation.z = Math.PI / 2; r.rotation.y = -Math.atan2(bz - az, bx - ax);
    [0.12, 0.88].forEach((f) => { const px = ax + (bx - ax) * f, pz = az + (bz - az) * f; const b = mesh(BOX(0.025, 0.025, 0.09), LIFT_MAT.steel, px, 0.95, pz, R); b.rotation.y = -Math.atan2(bz - az, bx - ax) + Math.PI / 2; });
  };
  rail(x0 + 0.07, z0 + 0.35, x0 + 0.07, z1 - 0.25); rail(x1 - 0.07, z0 + 0.35, x1 - 0.07, z1 - 0.25); rail(x0 + 0.3, z1 - 0.07, x1 - 0.3, z1 - 0.07);
  segs(LIFT.carSegs, [[x0, LIFT_DZ], [x0, z1], [x1, z1], [x1, LIFT_DZ]], 0.3);
  // the car's own doors, just behind its front wall: they shut with the landing doors, so during the ride the opening
  // shows door, not the shaft and the decks sliding past. Open, they tuck in behind the front wall.
  const zc = z0 - 0.05, mk = (sd) => { const d = mesh(RBOX(0.6, 2.3, 0.05, 0.015), LIFT_MAT.panel, LIFT_DX + sd * 0.3, 1.15, zc, R);
    mesh(BOX(0.02, 1.9, 0.02), CAR_SLOT, -sd * 0.27, 0, 0.03, d); mesh(BOX(0.4, 0.05, 0.02), LIFT_MAT.steel, 0, 0.1, 0.03, d); return d; };
  LIFT.carDoor = { L: mk(-1), Rr: mk(1) };
}

// ---------- displays: the car's deck panel, the indicator over the door, lobby signs ----------
function liftPanelDraw(p) {
  const c = p.c, g = c.getContext('2d'), P = pal(), W = c.width, H = c.height;
  g.fillStyle = COLORS.bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = COLORS.frame; g.lineWidth = 4; g.strokeRect(6, 6, W - 12, H - 12);
  const moving = LIFT.phase === 'moving', shown = liftShownDeck();
  if (p.kind === 'car') {
    g.fillStyle = P.acc; g.font = `700 30px ${DISP}`; g.textBaseline = 'middle'; g.fillText('LIFT 1', 28, 44);
    g.fillStyle = COLORS.dim; g.font = `500 18px ${MONO}`; g.textAlign = 'right'; g.fillText(moving ? (LIFT.to > LIFT.from ? 'DESCENDING' : 'ASCENDING') : 'SELECT DECK', W - 28, 44); g.textAlign = 'left';
    g.fillStyle = P.acc; g.fillRect(28, 72, W - 56, 3);
    g.fillStyle = COLORS.white; g.font = `700 150px ${DISP}`; g.textAlign = 'center'; g.fillText(String(shown), W / 2, 175);
    g.fillStyle = P.ice; g.font = `600 24px ${MONO}`; g.fillText(liftDeck(shown).name.toUpperCase(), W / 2, 270); g.textAlign = 'left';
    LIFT_DECKS.forEach((d, i) => {
      const y = 320 + i * 52, on = d.n === shown, tgt = moving && d.n === LIFT.to;
      g.fillStyle = on ? P.acc : '#0f1318'; hexNode(g, 54, y, 18); g.fill(); g.strokeStyle = tgt ? P.acc : COLORS.frame; g.lineWidth = 3; hexNode(g, 54, y, 18); g.stroke();
      g.fillStyle = on ? COLORS.bg : COLORS.white; g.font = `700 20px ${DISP}`; g.textAlign = 'center'; g.fillText(String(d.n), 54, y + 1); g.textAlign = 'left';
      g.fillStyle = on || tgt ? COLORS.white : COLORS.dim; g.font = `600 21px ${MONO}`; g.fillText(d.short, 90, y + 1);
      g.fillStyle = d.built ? P.ice : COLORS.dim; g.font = `500 16px ${MONO}`; g.textAlign = 'right'; g.fillText(d.built ? 'OPEN' : 'SEALED', W - 30, y + 1); g.textAlign = 'left';
    });
  } else if (p.kind === 'ind') {
    g.fillStyle = P.acc; g.font = `700 50px ${DISP}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const arrow = moving ? (LIFT.to > LIFT.from ? '▼' : '▲') : '';
    g.fillText(arrow + ' ' + shown + ' ' + arrow, W / 2, H / 2 + 2); g.textAlign = 'left';
  } else if (p.kind === 'sign') {
    const d = liftDeck(LIFT.deck);
    g.fillStyle = P.acc; g.font = `700 170px ${DISP}`; g.textBaseline = 'middle'; g.fillText(String(d.n), 34, 140);
    g.fillStyle = COLORS.white; g.font = `700 40px ${DISP}`; g.fillText('DECK ' + d.n, 190, 90);
    g.fillStyle = P.ice; g.font = `600 24px ${MONO}`; g.fillText(d.name.toUpperCase(), 192, 140);
    g.fillStyle = COLORS.dim; g.font = `500 20px ${MONO}`; g.fillText('LIFT 1 · DECKS 1 TO 6', 192, 186);
    g.fillStyle = P.acc; g.fillRect(34, 236, W - 68, 3);
  } else if (p.kind === 'dir') {
    const d = liftDeck(LIFT.deck);
    g.fillStyle = P.acc; g.font = `700 32px ${DISP}`; g.textBaseline = 'middle'; g.fillText('DECK ' + d.n + ' · DIRECTORY', 30, 46);
    g.fillStyle = P.acc; g.fillRect(30, 76, W - 60, 3);
    (d.rooms || []).forEach((rm, i) => {
      const y = 116 + i * 50; g.fillStyle = P.ice; hexNode(g, 44, y, 9); g.fill();
      g.fillStyle = COLORS.white; g.font = `600 24px ${MONO}`; g.fillText(rm, 66, y + 1);
      g.fillStyle = COLORS.dim; g.font = `500 18px ${MONO}`; g.textAlign = 'right'; g.fillText('SEALED', W - 30, y + 1); g.textAlign = 'left';
    });
    g.fillStyle = COLORS.warn; g.font = `600 20px ${MONO}`; g.fillText('FITTING-OUT IN PROGRESS', 30, H - 40);
  } else if (p.kind === 'seal') {
    g.fillStyle = COLORS.warn; g.font = `700 44px ${DISP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SECTION SEALED', W / 2, 56);
    g.fillStyle = COLORS.white; g.font = `600 22px ${MONO}`; g.fillText('DECK ' + LIFT.deck + ' IS BEING FITTED OUT', W / 2, 110);
    g.fillStyle = COLORS.dim; g.font = `500 18px ${MONO}`; g.fillText('AUTHORIZED CREWS ONLY', W / 2, 146); g.textAlign = 'left';
  }
  p.t.needsUpdate = true; p.key = liftPanelKey();
}
function liftPanelKey() { return LIFT.phase + ':' + liftShownDeck() + ':' + LIFT.deck + ':' + state.alert; }
function liftPanel(parent, kind, w, h, cw, ch, x, y, z, rotY, station) {
  const fr = group(x, y, z, rotY, parent);
  mesh(RBOX(w + 0.1, h + 0.1, 0.05, 0.015), LIFT_MAT.gun, 0, 0, -0.025, fr);
  const c = cnv(cw, ch), t = tex(c), p = { kind, c, t, key: '' };
  mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), 0, 0, 0.003, fr);
  if (station) addHit(BOX(w + 0.3, h + 0.3, 0.6), { station }, fr, 0, 0, 0.3);
  liftPanelDraw(p); LIFT.panels.push(p); return p;
}
function liftShownDeck() {
  if (LIFT.phase !== 'moving') return LIFT.deck;
  const a = clamp(LIFT.t / LIFT.dur, 0, 1), e = a * a * (3 - 2 * a);
  return Math.round(LIFT.from + (LIFT.to - LIFT.from) * e);
}
liftPanel(LIFT.root, 'car', 0.5, 0.78, 400, 624, (CAR.x0 + CAR.x1) / 2, 1.42, CAR.z1 - 0.004, Math.PI, 'liftcar');
liftPanel(LIFT.root, 'ind', 0.5, 0.14, 360, 100, LIFT_DX, 2.5, CAR.z0 + 0.03, 0);

// ---------- the sealed lobby used for Decks 2 to 6 ----------
{
  const S = LIFT.stub, { x0, x1, z0, z1, h } = LOBBY, W2 = x1 - x0, D2 = z1 - z0, M = LIFT_MAT.lobbyWall;
  liftSlab(S, LIFT_MAT.lobbyFloor, x0, x1, z0, z1, 0.001, false);
  liftSlab(S, LIFT_MAT.ceil, x0, x1, z0, z1, h, true);
  const ds = LIFT_DX - 0.6 - x0;
  wallPiece(M, [x0, z1], [1, 0], [0, -1], 0, ds, 0, h, h, 1.2, S);
  wallPiece(M, [x0, z1], [1, 0], [0, -1], ds + 1.2, W2, 0, h, h, 1.2, S);
  wallPiece(M, [x0, z1], [1, 0], [0, -1], ds, ds + 1.2, 2.3, h, h, 1.2, S);
  wallPiece(M, [x0, z0], [1, 0], [0, 1], 0, W2, 0, h, h, 1.2, S);
  wallPiece(M, [x0, z0], [0, 1], [1, 0], 0, D2, 0, h, h, 1.2, S);
  wallPiece(M, [x1, z0], [0, 1], [-1, 0], 0, D2, 0, h, h, 1.2, S);
  lumPanel(S, LIFT_DX, h - 0.03, (z0 + z1) / 2 - 0.1, 1.2, 2.8, 2, 5);
  // cove light where walls meet the ceiling, deck strips at the floor
  [[x0 + 0.1, (z0 + z1) / 2, 0.04, D2 - 0.3], [x1 - 0.1, (z0 + z1) / 2, 0.04, D2 - 0.3], [(x0 + x1) / 2, z0 + 0.1, W2 - 0.3, 0.04]].forEach(([x, z, w, d]) => mesh(BOX(w, 0.04, d), SLOT, x, h - 0.16, z, S));
  [[x0 + 0.012, (z0 + z1) / 2, 0.02, D2 - 0.2], [x1 - 0.012, (z0 + z1) / 2, 0.02, D2 - 0.2]].forEach(([x, z, w, d]) => mesh(BOX(w, 0.025, d), STRIP, x, 0.07, z, S));
  [[x0 + 0.2, ds - 0.75], [ds + 1.95, W2 - 0.2]].forEach(([a, b]) => mesh(BOX(b - a, 0.025, 0.02), STRIP, x0 + (a + b) / 2, 0.07, z1 - 0.012, S));
  // the lift doors on this side: same frame as the bridge's
  const g = group(LIFT_DX, 0, LIFT_DZ, Math.PI, S);
  [-1, 1].forEach((sd) => mesh(RBOX(0.22, 2.6, 0.3, 0.03), LIFT_MAT.gun, sd * 0.71, 1.3, 0.12, g));
  mesh(RBOX(1.64, 0.3, 0.3, 0.03), LIFT_MAT.gun, 0, 2.45, 0.12, g);
  mesh(BOX(1.2, 0.004, 0.1), LIFT_MAT.hazard, 0, 0.003, 0.16, g);
  const L = mesh(RBOX(0.6, 2.3, 0.06, 0.015), LIFT_MAT.panel, -0.3, 1.15, 0.06, g), Rr = mesh(RBOX(0.6, 2.3, 0.06, 0.015), LIFT_MAT.panel, 0.3, 1.15, 0.06, g);
  [L, Rr].forEach((d, k) => { mesh(BOX(0.02, 1.9, 0.02), SLOT, k ? -0.27 : 0.27, 0, 0.04, d); mesh(BOX(0.4, 0.05, 0.02), LIFT_MAT.steel, 0, 0.1, 0.04, d); });
  addHit(BOX(1.6, 2.6, 0.8), { station: 'lift' }, g, 0, 1.3, 0.45);
  LIFT.stubDoor = { L, Rr };

  // deck sign beside the doors, the directory on the port wall, the sealed bulkhead facing the lift
  liftPanel(S, 'sign', 1.1, 0.5, 560, 256, LIFT_DX + 1.75, 1.75, z1 - 0.03, Math.PI);
  liftPanel(S, 'dir', 1.3, 0.9, 520, 360, x0 + 0.03, 1.45, (z0 + z1) / 2, Math.PI / 2, 'deckdir');
  const b = group(LIFT_DX, 0, z0 + 0.12, 0, S);
  mesh(RBOX(2.3, 2.7, 0.24, 0.03), LIFT_MAT.gun, 0, 1.35, 0, b);
  mesh(RBOX(1.9, 2.35, 0.06, 0.02), LIFT_MAT.carFloor, 0, 1.2, 0.12, b);
  [0.25, 2.2].forEach((y) => mesh(BOX(1.9, 0.12, 0.02), LIFT_MAT.hazard, 0, y, 0.16, b));
  liftPanel(b, 'seal', 1.2, 0.36, 520, 160, 0, 1.55, 0.16, 0);
  addHit(BOX(2.3, 2.7, 0.8), { station: 'sealed' }, b, 0, 1.35, 0.4);
  segs(LIFT.stubSegs, [[LIFT_DX - 0.6, z1], [x0, z1], [x0, z0 + 0.24], [x1, z0 + 0.24], [x1, z1], [LIFT_DX + 0.6, z1]], 0.33);
}
// The bridge's own lift doors and door reveal face into the car, where the bake has no good light (it was baked
// before the car existed), so they take the car's materials. Seen from the bridge they still match the other doors.
{
  const d = DOORS.find((q) => q.station === 'lift'), swap = new Map([[MAT.gun, LIFT_MAT.gun], [MAT.panel, LIFT_MAT.panel], [MAT.steel, LIFT_MAT.steel]]);
  [d.L, d.Rr, ...d.reveal].forEach((o) => o.traverse((c) => { if (c.isMesh && swap.has(c.material)) c.material = swap.get(c.material); }));
}
// fewer draw calls (batch.js): merge the car's and the lobby's fixed parts, each in its own frame so the car still
// rides as one; the doors slide, so each leaf stays separate
batchMerge(LIFT.root, { movers: new Set([LIFT.carDoor.L, LIFT.carDoor.Rr]), label: 'lift car' });
batchMerge(LIFT.stub, { movers: new Set([LIFT.stubDoor.L, LIFT.stubDoor.Rr]), label: 'lift lobby' });

// ---------- sound: the doors and the ride ----------
function liftDoorSound() {
  if (!AC || !soundOn || !noiseBuf) return; const t0 = AC.currentTime;
  const n = AC.createBufferSource(); n.buffer = noiseBuf; const hp = AC.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 900; hp.Q.value = 0.7;
  const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.18, t0 + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
  n.connect(hp); hp.connect(g); g.connect(master); n.start(t0, Math.random() * 2); n.stop(t0 + 0.75);
}
function liftRideSound(dur, down) {
  if (!AC || !soundOn || !noiseBuf) return; const t0 = AC.currentTime, t1 = t0 + dur;
  const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(48, t0); o.frequency.linearRampToValueAtTime(down ? 62 : 78, t0 + dur * 0.4); o.frequency.linearRampToValueAtTime(48, t1);
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
  const og = AC.createGain(); og.gain.setValueAtTime(0.0001, t0); og.gain.linearRampToValueAtTime(0.09, t0 + 0.5); og.gain.setValueAtTime(0.09, t1 - 0.6); og.gain.exponentialRampToValueAtTime(0.0001, t1);
  o.connect(lp); lp.connect(og); og.connect(master); o.start(t0); o.stop(t1 + 0.05);
  const n = AC.createBufferSource(); n.buffer = noiseBuf; n.loop = true; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(260, t0); bp.frequency.linearRampToValueAtTime(down ? 420 : 620, t0 + dur * 0.5); bp.frequency.linearRampToValueAtTime(260, t1);
  const ng = AC.createGain(); ng.gain.setValueAtTime(0.0001, t0); ng.gain.linearRampToValueAtTime(0.22, t0 + 0.6); ng.gain.setValueAtTime(0.22, t1 - 0.7); ng.gain.exponentialRampToValueAtTime(0.0001, t1);
  n.connect(bp); bp.connect(ng); ng.connect(master); n.start(t0); n.stop(t1 + 0.05);
}

// ---------- switching decks: only one deck is in the scene at a time ----------
function liftSetDeck(n) {
  if (n !== 1 && !LIFT.deck1) {
    // first time away: gather everything that makes up Deck 1 into one group so it can be hidden in one go
    LIFT.deck1 = new THREE.Group(); LIFT.deck1.name = 'Deck 1';
    const roots = new Set(Object.values(DECKS).map((d) => (d.n === 1 ? null : d.root())));
    scene.children.slice().forEach((o) => { if (o !== LIFT.root && o !== LIFT.stub && !roots.has(o) && !o.userData.keep && !o.isLight && !o.isCamera) LIFT.deck1.add(o); });
    scene.add(LIFT.deck1);
  }
  deckBuild(n); // the first visit builds the deck (decks.js); the car's doors are shut while it runs
  LIFT.deck = n;
  // show only this deck: its own group if it is built, otherwise the sealed placeholder lobby at its height
  Object.values(DECKS).forEach((d) => { const r = d.root(); if (r) r.visible = d.n === n; });
  LIFT.stub.visible = !deckOf(n).built; LIFT.stub.position.y = deckY(n);
  SURFU.deckFloor.value = deckY(n); SURFU.walkOn.value = n === 1 ? 1 : 0;
  bakeUse(n); // this deck's baked light (bake.js)
  bakeEnv(); // this deck's reflections (cached after the first visit)
  LIFT.panels.forEach(liftPanelDraw);
}
function liftGo(n) {
  if (LIFT.phase !== 'idle' || n === LIFT.deck) return;
  if (!inCar(player.x, player.z)) { toast('Step into the lift car first, then choose a deck on the panel.', 'Lift'); return; }
  LIFT.from = LIFT.deck; LIFT.to = n; LIFT.phase = 'closing'; LIFT.t = 0;
  closePanel(); beep([1046, 784], 0.07, 0.035);
}
function liftUpdate(dt) {
  const inside = inCar(player.x, player.z); LIFT.inside = inside;
  let want = 0; LIFT.t += dt; LIFT.shake = 0;
  if (LIFT.phase === 'idle') {
    want = !state.sitting && (inside || Math.hypot(player.x - LIFT_DX, player.z - LIFT_DZ) < 1.7) ? 1 : 0;
    if (want && LIFT.door < 0.05 && !LIFT.hiss) { LIFT.hiss = true; liftDoorSound(); } else if (!want && LIFT.door > 0.95 && LIFT.hiss) { LIFT.hiss = false; liftDoorSound(); }
  } else if (LIFT.phase === 'closing') {
    if (LIFT.hiss) { LIFT.hiss = false; liftDoorSound(); }
    if (LIFT.door < 0.02 && LIFT.t > 0.6) {
      LIFT.phase = 'moving'; LIFT.t = 0; LIFT.dur = Math.min(5, 2.2 + 0.55 * Math.abs(LIFT.to - LIFT.from));
      liftSetDeck(LIFT.to); liftRideSound(LIFT.dur, LIFT.to > LIFT.from);
    }
  } else if (LIFT.phase === 'moving') {
    const a = clamp(LIFT.t / LIFT.dur, 0, 1), dir = LIFT.to > LIFT.from ? 1 : -1;
    // a little lift when the car starts down (and a sink when it starts up), easing out as it settles
    if (!reduceMotion) LIFT.shake = 0.03 * dir * Math.sin(Math.PI * a) * (1 - a) + 0.0025 * Math.sin(LIFT.t * 43) * Math.sin(Math.PI * a);
    const e = a * a * (3 - 2 * a); LIFT.root.position.y = deckY(LIFT.from) + (deckY(LIFT.to) - deckY(LIFT.from)) * e;
    if (inside) player.y = LIFT.root.position.y + EYE;
    if (a >= 1) {
      LIFT.root.position.y = deckY(LIFT.to);
      LIFT.phase = 'opening'; LIFT.t = 0; beep([784, 1046, 1318], 0.1, 0.04); liftDoorSound(); LIFT.hiss = true;
      const d = liftDeck(LIFT.deck); toast(d.built ? `Deck ${d.n}, ${d.name}.` : `Deck ${d.n}, ${d.name}. This deck is still sealed for fitting-out.`, 'Lift');
    }
  } else if (LIFT.phase === 'opening') {
    want = 1; if (LIFT.door > 0.97) LIFT.phase = 'idle';
  }
  LIFT.door += (want - LIFT.door) * Math.min(1, dt * 4.5);
  [LIFT.stubDoor, ...Object.values(DECKS).map((d) => d.door && d.door())].forEach((s) => { if (s) { s.L.position.x = -0.3 - LIFT.door * 0.56; s.Rr.position.x = 0.3 + LIFT.door * 0.56; } }); // (each deck's exist once it is built)
  LIFT.carDoor.L.position.x = LIFT_DX - 0.3 - LIFT.door * 0.56; LIFT.carDoor.Rr.position.x = LIFT_DX + 0.3 + LIFT.door * 0.56;
  // light level follows the ship's lighting setting and dims at red alert, like the baked decks
  const k = LIGHT_LEVELS[state.light] * (state.alert === 'red' ? 0.34 : 1);
  if (k !== LIFT.k) { LIFT.k = k; LIFT.mats.forEach((m) => { m.lightMapIntensity = m.userData.lmBase * k; }); LUM.forEach((m) => m.color.setHex(state.alert === 'red' ? 0xffb0a0 : 0xffffff).multiplyScalar(LIFT.lum * Math.min(1, 0.4 + 0.6 * k))); }
  CAR_SLOT.color.copy(SLOT.color).multiplyScalar(0.22);
  const key = liftPanelKey(); LIFT.panels.forEach((p) => { if (p.key !== key) liftPanelDraw(p); });
  if (state.alert === 'yellow' && (LIFT.blink = (LIFT.blink || 0) + dt) > 0.15) { LIFT.blink = 0; LIFT.panels.forEach((p) => { if (inside || LIFT.deck !== 1) liftPanelDraw(p); }); }
}
const liftLocked = () => LIFT.phase === 'closing' || LIFT.phase === 'moving';
function liftLocation(roomLabel) {
  const d = liftDeck(LIFT.deck);
  if (LIFT.inside) return `Lift 1 · Deck ${d.n}`;
  const D = deckOf(LIFT.deck);
  if (LIFT.deck === 1) return (roomLabel || 'Main Bridge') + ' · Deck 1';
  const r = D.rooms().find((q) => q.test ? q.test(player.x, player.z) : player.x > q.x0 && player.x < q.x1 && player.z > q.z0 && player.z < q.z1);
  return `${r ? r.label : d.name} · Deck ${d.n}`;
}
// is this object (and every group above it) showing? Used to ignore stations and walls on hidden decks.
function shown(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }

// ---------- stations ----------
Object.assign(STATIONS, {
  lift: { title: 'Lift 1', role: '', panel: () => {
    const d = liftDeck(LIFT.deck); STATIONS.lift.role = `Deck ${d.n} · ${d.name}`;
    return { read: [['Car', LIFT.phase === 'idle' ? `Here, at Deck ${d.n}` : 'In motion'], ['Serves', 'Decks 1 to 6, forward']],
      note: 'Step into the car and use the panel on its back wall to choose a deck.', acts: [] };
  } },
  liftcar: { title: 'Lift 1', role: 'Choose a deck', panel: () => {
    const d = liftDeck(LIFT.deck);
    return { read: [['Now at', `Deck ${d.n} · ${d.name}`], ['Fitted out', 'Decks 1 and 2']],
      note: LIFT.inside ? 'Deck 2 is the officers’ deck: quarters, the wardroom and the observation lounge. Deck 3 is medical and officers: its corridors are open, its rooms sealed for now. Decks 4 to 6 open onto a sealed lobby until they are built.' : 'Step into the car first.',
      acts: LIFT_DECKS.map((x) => ({ label: `${x.n} · ${x.short.charAt(0) + x.short.slice(1).toLowerCase()}`, on: x.n === LIFT.deck, disabled: x.n === LIFT.deck || LIFT.phase !== 'idle', fn: () => liftGo(x.n) })) };
  } },
  deckdir: { title: 'Deck directory', role: '', panel: () => {
    const d = liftDeck(LIFT.deck); STATIONS.deckdir.role = `Deck ${d.n} · ${d.name}`;
    if (d.n === 2) return { read: [['Open', d.rooms.join(', ')]].concat(d.sealed.length ? [['Still sealed', d.sealed.join(', ')]] : []), note: 'The captain’s quarters are forward through the door ahead of the lift. The corridor runs aft past the officers’ cabins to the wardroom, and double doors at the back of the wardroom open into the observation lounge. The passage to port at the corridor’s end also leads there.', acts: [] };
    return { read: [['On this deck', (d.rooms || []).join(', ') || 'Main bridge, ready room, conference room'], ['Status', d.built ? 'Open' : 'Sealed for fitting-out']],
      note: 'Not built yet. Take the lift back up, or look around another deck.', acts: [] };
  } },
  sealed: { title: 'Sealed bulkhead', role: '', panel: () => {
    STATIONS.sealed.role = `Deck ${LIFT.deck} · fitting-out`;
    return { read: [['Beyond', 'The rest of the deck'], ['Access', 'Closed to the crew']], note: 'Construction crews are still fitting out this deck. Ride back up to the bridge in Lift 1.', acts: [] };
  } },
});
// a synthesizer niche: pick an order, it is ready in the niche
function galleyStation(key, role, note, menu) {
  return { title: 'Galley', role, panel: () => ({ read: [['Synthesizer', 'Ready'], ['Last order', state[key] || 'None']], note,
    acts: menu.map((n) => ({ label: n, on: state[key] === n, fn: () => { state[key] = n; beep([660, 990], 0.08, 0.04); toast(`${n}. Ready in the niche.`, 'Galley'); renderPanel(); } })) }) };
}
Object.assign(STATIONS, {
  capq: { title: 'Captain’s quarters', role: 'Deck 2 · forward', panel: () => ({ read: [['Inside', 'Day cabin, dining table, desk, galley, sleeping cabin'], ['Viewport', 'Forward, armored, shuttered at Red Alert']], note: 'Walk up to the door to go in.', acts: [] }) },
  wardoor: { title: 'Officers’ wardroom', role: 'Deck 2 · aft', panel: () => ({ read: [['Inside', 'Table for ten, two sideboards, the ship’s crest'], ['Viewport', 'Starboard'], ['Aft', 'Double doors to the observation lounge']], note: 'Where the officers dine. Walk up to the door to go in.', acts: [] }) },
  wlink: { title: 'Observation lounge', role: 'Deck 2 · through the wardroom', panel: () => ({ read: [['Inside', 'Window over the stern, tables, the bar'], ['Doors', 'Double, open whenever someone walks up']], note: 'The officers’ lounge: after dinner the wardroom empties through these doors to the bar and the view aft.', acts: [] }) },
  capbank: { title: 'Pod capacitor bank', role: 'Deck 2 · restricted', panel: () => ({ read: [['Access', 'Engineering only'], ['Charge', state.alert === 'red' ? 'Full, feeding the pod' : 'Held at 40%']], note: 'Power banks that feed the weapons pod and its torpedo launchers, up on the rollbar. Sealed to everyone but engineering.', acts: [] }) },
  lngdoor: { title: 'Observation lounge', role: 'Deck 2 · aft', panel: () => ({ read: [['Inside', 'Window over the stern, tables, the bar'], ['View', 'The rollbar and its weapons pod']], note: 'Walk up to the door to go in.', acts: [] }) },
  lounge: { title: 'Observation lounge', role: 'View aft', panel: () => ({ read: [['Weapons pod', state.alert === 'red' ? 'Armed' : 'Safe'], ['Rollbar', state.alert === 'red' ? 'Floods off' : 'Floodlit'], ['Shutters', state.alert === 'red' ? 'Closed for Red Alert' : 'Open']], note: 'The crew’s favourite window: the rollbar arching over the ship’s back with the weapons pod on its crown, 38 m aft, and a nacelle out to either side.', acts: [] }) },
  lgalley: galleyStation('lcup', 'Observation lounge', 'The lounge bar’s synthesizer.', ['Coffee', 'Iced tea', 'Ginger ale', 'Hot toddy (synthehol)']),
  qdesk: { title: 'Captain’s desk', role: 'Personal log', panel: () => ({ read: [['Entry', LOG[state.logIdx].d], ['Reports', state.reports ? state.reports + ' to sign' : 'All signed']], note: LOG[state.logIdx].t,
    acts: [{ label: 'Next entry', fn: () => { state.logIdx = (state.logIdx + 1) % LOG.length; redrawStation('qdesk'); redrawStation('desk'); renderPanel(); } }, { label: 'Sign a report', disabled: !state.reports, fn: () => { state.reports = Math.max(0, state.reports - 1); toast('Report signed.', 'Yeoman'); renderPanel(); } }] }) },
  qgalley: galleyStation('qcup', 'Captain’s quarters', 'A small galley for the captain’s own table.', ['Coffee, black', 'Mint tea', 'Hot chocolate', 'Soup of the day']),
  xoq: { title: 'First officer’s quarters', role: 'Deck 2 · port', panel: () => ({ read: [['Inside', 'Day cabin, desk, table for two, galley, sleeping cabin'], ['Viewport', 'Port, shuttered at Red Alert']], note: 'Walk up to the door to go in.', acts: [] }) },
  xodesk: { title: 'First officer’s desk', role: 'Duty roster', panel: () => ({ read: [['On watch', 'Alpha'], ['Next drill', state.alert === 'red' ? 'Now' : 'Day 3'], ['Department reports', 'Five, all filed']], note: 'The first officer keeps the duty roster and the department reports here, and briefs the captain from them each morning.', acts: [] }) },
  so1q: { title: 'Senior officer’s cabin', role: 'Deck 2 · starboard', panel: () => ({ read: [['Inside', 'Bed, desk, armchair, galley niche'], ['Viewport', 'Starboard, shuttered at Red Alert']], note: 'A department head’s cabin. Walk up to the door to go in.', acts: [] }) },
  so1desk: { title: 'Senior officer’s desk', role: 'Cabin 1', panel: () => ({ read: [['Messages', '2 new from home'], ['Watch', 'Alpha']], note: 'A department head’s own desk: letters, reports and the watch bill.', acts: [] }) },
  so1galley: galleyStation('so1cup', 'Senior officer’s cabin 1', 'A galley niche on the cabin’s inner wall.', ['Coffee, black', 'Black tea', 'Lemon water']),
  so2q: { title: 'Senior officer’s cabin', role: 'Deck 2 · starboard', panel: () => ({ read: [['Inside', 'Bed, desk, armchair, galley niche'], ['Viewport', 'Starboard, shuttered at Red Alert']], note: 'A department head’s cabin. Walk up to the door to go in.', acts: [] }) },
  so2desk: { title: 'Senior officer’s desk', role: 'Cabin 2', panel: () => ({ read: [['Messages', '1 new from home'], ['Watch', 'Beta']], note: 'A department head’s own desk: letters, reports and the watch bill.', acts: [] }) },
  so2galley: galleyStation('so2cup', 'Senior officer’s cabin 2', 'A galley niche on the cabin’s inner wall.', ['Espresso', 'Herbal tea', 'Tomato soup']),
  xogalley: galleyStation('xocup', 'First officer’s quarters', 'A galley niche beside the door.', ['Coffee, white', 'Green tea', 'Spiced cider', 'Vegetable broth']),
  wardroom: { title: 'Wardroom', role: 'Mess board', panel: () => ({ read: [['Next meal', 'Officers’ dinner, 1830'], ['Host', 'First officer'], ['Seats', '10, two guests tonight']], note: 'The officers eat here and meet off watch. The captain dines here on the first night of every patrol.', acts: [] }) },
});
FUNC.liftcar = FUNC.deckdir = FUNC.sealed = 'acc';
// Deck 2 is in the light bake (it had to be showing when the bake layout was made); hide it until you ride down
DECK2.visible = false;

````

---

## `js/controls.js`

````javascript
// USS Defiance · controls.js
// Player movement, touch and mouse input, aiming and highlights.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- player + input ----------
const player = { x: 3.1, z: 3.9, y: EYE, yaw: 0.38, pitch: -0.08 };
let sitBlend = 0;
const SEAT = new THREE.Vector3(0, DAIS.h + 1.16, 0.48);
const keys = {};
const stick = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
const pointers = new Map();
const raycaster = new THREE.Raycaster(); const ndc = new THREE.Vector2();
if (isTouch) ui.stick.hidden = false;
const REACH = 4.2;

function pick(cx, cy) {
  ndc.set(cx / window.innerWidth * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const wall = raycaster.intersectObjects(OCCLUDERS, false).filter((h) => shown(h.object)), wd = wall.length ? wall[0].distance : Infinity;
  const hits = raycaster.intersectObjects(hitVolumes, false).filter((h) => h.distance < wd && shown(h.object.parent) && !(state.sitting && h.object.userData.station === 'command'));
  return hits.length ? { station: hits[0].object.userData.station, d: hits[0].distance } : null;
}
function inReach(h) { if (!h || !STATIONS[h.station]) return false; if (h.station === 'viewer' || h.station === 'ship') return h.d < 10; if (state.sitting && h.station === 'command') return true; return h.d <= REACH; }
function interactAt(cx, cy) {
  const h = pick(cx, cy);
  if (!h || !STATIONS[h.station]) return;
  if (!inReach(h)) { toast(`Walk closer to use ${STATIONS[h.station].title}.`); return; }
  openStation(h.station);
}
// ---------- free mouse look (desktop): pointer lock ----------
// Click the view once and the browser hides the cursor and hands every mouse movement to the camera: no dragging,
// which is hard on a trackpad. The dot in the middle is the aim (click or E to use what it is on); Esc gives the
// cursor back, and so does opening a station's panel. Where the page may not lock the pointer (some embeds), the
// old drag-to-look still works.
const look = { ok: !isTouch && 'requestPointerLock' in canvas, failed: false, pending: '', misses: 0, told: false, sens: 0.0026 };
const locked = () => document.pointerLockElement === canvas;
function lockLook(fromClick) {
  if (!look.ok || look.failed || locked() || state.open || !$('intro').hidden) return;
  if (!fromClick && performance.now() - (look.esc || -1e9) < 800) return; // Esc means "give me the cursor": only a click takes it back
  look.pending = fromClick ? 'click' : 'soft';
  try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (err) { look.pending = ''; }
}
function unlockLook() { if (locked()) document.exitPointerLock(); }
document.addEventListener('pointerlockchange', () => {
  const on = locked(); look.pending = ''; if (on) look.misses = 0; document.body.classList.toggle('mouselook', on);
  if (on && !look.told) { look.told = true; toast('Mouse look is on: just move the mouse. Esc frees the cursor; click the view to look again.', 'Controls'); }
});
// a lock refused twice in a row on a click means the page isn't allowed to lock here: fall back to drag-to-look
// (a single refusal can just be the browser's short cool-down after Esc)
document.addEventListener('pointerlockerror', () => {
  if (look.pending === 'click' && ++look.misses >= 2) { look.failed = true; toast('This page can’t capture the mouse here, so drag to look instead.', 'Controls'); }
  look.pending = '';
});
document.addEventListener('mousemove', (e) => {
  if (!locked()) return;
  player.yaw -= e.movementX * look.sens; player.pitch = clamp(player.pitch - e.movementY * look.sens, -1.25, 1.25);
});
canvas.addEventListener('pointerdown', (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  const p = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, mode: 'look', type: e.pointerType };
  if (e.pointerType === 'mouse') { p.wasLocked = locked(); if (!p.wasLocked && look.ok && !look.failed) { p.lockClick = true; lockLook(true); } }
  if (e.pointerType !== 'mouse' && e.clientX < window.innerWidth * 0.45 && !stick.active && !state.sitting) {
    p.mode = 'stick'; stick.active = true; stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stick.dx = stick.dy = 0;
    ui.stick.hidden = false; ui.stick.classList.remove('ghost'); ui.stick.classList.add('live');
    ui.stick.style.left = e.clientX + 'px'; ui.stick.style.top = e.clientY + 'px'; ui.knob.style.transform = '';
  }
  pointers.set(e.pointerId, p);
});
canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId); if (!p) return;
  if (p.type === 'mouse' && locked()) return; // the mousemove handler above turns the camera
  const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; p.moved += Math.abs(dx) + Math.abs(dy);
  if (p.mode === 'stick') {
    let sx = e.clientX - stick.ox, sy = e.clientY - stick.oy; const d = Math.hypot(sx, sy), max = 46;
    if (d > max) { sx *= max / d; sy *= max / d; }
    stick.dx = sx / max; stick.dy = sy / max; ui.knob.style.transform = `translate(${sx}px, ${sy}px)`;
  } else {
    const sens = p.type === 'mouse' ? 0.0036 : 0.0058;
    player.yaw -= dx * sens; player.pitch = clamp(player.pitch - dy * sens, -1.25, 1.25);
  }
});
function endPointer(e) {
  const p = pointers.get(e.pointerId); if (!p) return; pointers.delete(e.pointerId);
  if (p.moved < 10 && performance.now() - p.t < 450 && e.type === 'pointerup') {
    if (p.wasLocked) interactAt(window.innerWidth / 2, window.innerHeight / 2); // locked: the click acts on the aim dot
    else if (!p.lockClick || look.failed) interactAt(e.clientX, e.clientY); // the click that grabs the mouse only grabs it
  }
  if (p.mode === 'stick') {
    stick.active = false; stick.dx = stick.dy = 0; ui.stick.classList.remove('live'); ui.stick.classList.add('ghost');
    ui.stick.style.left = ''; ui.stick.style.top = ''; ui.knob.style.transform = '';
  }
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('keydown', (e) => {
  if (e.target && e.target.tagName === 'BUTTON' && (e.code === 'Enter' || e.code === 'Space')) return;
  keys[e.code] = true;
  if (e.code === 'Escape') { look.esc = performance.now(); if (!$('intro').hidden) hideIntro(); else closePanel(); }
  if ((e.code === 'KeyE' || e.code === 'Enter') && $('intro').hidden && target) openStation(target.station);
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

const controls = isTouch
  ? [['Look', 'Drag anywhere on the right side'], ['Walk', 'Drag the stick on the left side'], ['Use', 'Tap a station when you are close']]
  : [['Look', 'Click the view, then just move the mouse. Esc frees the cursor'], ['Walk', 'W A S D or the arrow keys'], ['Use', 'Put the dot on a station and click, or press E']];
$('controls').replaceChildren(...controls.map(([k, v]) => { const li = document.createElement('li'); const b = document.createElement('b'); b.textContent = k; li.append(b, document.createTextNode(v)); return li; }));
function hideIntro() { $('intro').hidden = true; initAudio(); canvas.focus({ preventScroll: true }); lockLook(); }
$('board-btn').addEventListener('click', hideIntro);
$('help-btn').addEventListener('click', () => { unlockLook(); $('intro').hidden = false; $('board-btn').textContent = 'Back to the bridge'; $('board-btn').focus(); });

// ---------- aim + highlight ----------
let target = null, targetKey = '', aimTimer = 0;
function updateHighlights() {
  const st = target && target.station;
  screens.forEach((s) => { const on = s.station === st || s.station === state.open; s.mat.color.setScalar(on ? 1.22 : 1); });
}
function aim() {
  const h = pick(window.innerWidth / 2, window.innerHeight / 2);
  const next = h && inReach(h) ? h : null;
  const key = next ? next.station : '';
  if (key !== targetKey) { target = next; targetKey = key; updateHighlights(); }
  ui.reticle.classList.toggle('live', !!target);
  const show = target && state.open !== target.station && $('intro').hidden;
  ui.hint.hidden = !show;
  if (show) ui.hint.textContent = `${isTouch ? 'Tap' : 'Click or press E'} · ${STATIONS[target.station].title}`;
}

````

---

## `js/render.js`

````javascript
// USS Defiance · render.js
// Atmosphere (shadows, light shafts), post-processing, hero shots and the frame loop.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- atmosphere: shadow flags, light shafts ----------
scene.traverse((o) => {
  if (!o.isMesh || o.layers.mask !== 1 || o.visible === false) return;
  const m = o.material, basic = Array.isArray(m) ? false : (m.isMeshBasicMaterial || m.transparent);
  if (basic) return;
  const pl = o.geometry && o.geometry.type === 'PlaneGeometry', sh = o.geometry && (o.geometry.type === 'ShapeGeometry');
  o.receiveShadow = true;
  o.castShadow = !pl && !sh && o.position.y < 3.0;
});
// Light shafts in the haze under each downlight and the coffer. They fade toward their silhouettes and toward the floor,
// so they read as lit air rather than solid cones.
const shaftMat = new THREE.ShaderMaterial({
  uniforms: { col: { value: new THREE.Color(1.0, 0.88, 0.74) }, k: { value: 0.06 } },
  vertexShader: `varying vec3 vN, vV; varying float vH;
    void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = cameraPosition - wp.xyz;
      vH = clamp(wp.y / ${WALL_H.toFixed(2)}, 0.0, 1.0); gl_Position = projectionMatrix * viewMatrix * wp; }`,
  fragmentShader: `uniform vec3 col; uniform float k; varying vec3 vN, vV; varying float vH;
    void main() { float f = abs(dot(normalize(vN), normalize(vV)));
      float a = f * f * f * f * smoothstep(0.05, 0.8, vH) * vH;
      gl_FragColor = vec4(col * a * k, 1.0); }`,
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false,
});
const shafts = [];
(isMobile ? DOWNLIGHTS.slice(0, 3) : DOWNLIGHTS).forEach(([x, z]) => {
  shafts.push(mesh(new THREE.CylinderGeometry(0.11, 0.95, WALL_H - 0.02, 28, 1, true), shaftMat, x, (WALL_H - 0.02) / 2, z));
});
shafts.push(mesh(new THREE.CylinderGeometry(1.35, 1.9, WALL_H - 0.02, 40, 1, true), shaftMat.clone(), COFFER.x, (WALL_H - 0.02) / 2, COFFER.z));
shafts[shafts.length - 1].material.uniforms.k.value = 0.035;
// (no floating dust motes: they read as glowing specks; the light shafts stay)

// ---------- post effects ----------
// Materials tone-map themselves (so screens marked toneMapped:false keep their exact colours); three.js only does that
// when drawing to the screen or an XR target, so the effect buffers are flagged as XR targets.
// Preferred: pmndrs "postprocessing" with N8AO (soft ambient occlusion: the contact shadows where things meet) and a
// mip-mapped bloom for screen glow. AO runs on desktop only (phones keep their frame rate). If those libraries didn't
// load, three.js's own bloom is used as before; if that fails too, a plain render.
let composer = null, bloom = null, aoPass = null;
const POST = { kind: 'none' };
// knobs perf.js can turn: display redraws per frame, whether the bridge viewscreen renders, and the measured
// time this code spends preparing each frame on the processor (cpu, ms)
const PERF_OPT = { screens: isMobile ? 2 : 4, viewscreen: true, cpu: 0 };
function flagXR(t) { if (t) { t.isXRRenderTarget = true; t.texture.colorSpace = THREE.LinearSRGBColorSpace; } }
try {
  if (THREE.PP) {
    const PP = THREE.PP;
    composer = new PP.EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: isMobile ? 0 : 4 });
    flagXR(composer.inputBuffer); flagXR(composer.outputBuffer);
    composer.addPass(new PP.RenderPass(scene, camera));
    if (THREE.N8AOPostPass && !isMobile) {
      aoPass = new THREE.N8AOPostPass(scene, camera, window.innerWidth, window.innerHeight);
      Object.assign(aoPass.configuration, { aoRadius: 0.45, distanceFalloff: 0.45, intensity: 1.7, aoSamples: 12, denoiseSamples: 6, denoiseRadius: 6, halfRes: false, gammaCorrection: false, color: new THREE.Color(0x000000) });
      aoPass.setQualityMode && aoPass.setQualityMode('Medium'); aoPass.configuration.halfRes = false; aoPass.configuration.gammaCorrection = false;
      composer.addPass(aoPass);
    }
    bloom = new PP.BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.8, luminanceSmoothing: 0.12, intensity: 0.75, radius: 0.62, levels: isMobile ? 5 : 7 });
    composer.addPass(new PP.EffectPass(camera, bloom));
    POST.kind = aoPass ? 'pmndrs+ao' : 'pmndrs';
  } else if (THREE.EffectComposer && THREE.UnrealBloomPass && THREE.GammaCorrectionShader) {
    const pr = renderer.getPixelRatio();
    const target = new THREE.WebGLRenderTarget(window.innerWidth * pr, window.innerHeight * pr, { type: THREE.UnsignedByteType, samples: 4 });
    composer = new THREE.EffectComposer(renderer, target);
    [composer.renderTarget1, composer.renderTarget2].forEach(flagXR);
    composer.addPass(new THREE.RenderPass(scene, camera));
    bloom = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 0.62 / 3, 0.55, 0.84); // newer bloom triples strength internally
    [bloom.renderTargetBright, ...bloom.renderTargetsHorizontal, ...bloom.renderTargetsVertical].forEach((t) => { t.texture.type = THREE.UnsignedByteType; });
    composer.addPass(bloom);
    composer.addPass(new THREE.ShaderPass(THREE.GammaCorrectionShader));
    POST.kind = 'three';
  }
} catch (e) { console.warn('Post-processing unavailable', e); composer = null; POST.kind = 'none'; }
window.DEFIANCE_POST = POST;

// attract mode: a slow glide around the bridge while the title card is up
let attract = true, attractT = 0;
const _lc = new THREE.Vector3();
const ATTRACT_LOOK = new THREE.Vector3();

// ---------- hero shots: fixed cameras for judging each visual stage side by side ----------
// Call DEFIANCE_HERO(1..6) from the console (or a test); DEFIANCE_HERO(0) returns to normal play.
const HERO_SHOTS = [
  { name: 'Bridge wide', p: [-2.9, 1.8, 4.3], t: [1.0, 1.15, -4.6] },
  { name: "Captain's view", p: [0, DAIS.h + 1.16, 0.48], t: [0, 1.62, -5.2] },
  { name: 'Port stations', p: [1.7, 1.62, -0.5], t: [-5.2, 1.05, 0.4] },
  { name: 'Ready room', room: 'Ready Room', p: [4.75, 1.62, 0.6], t: [0.2, 1.0, 4.4] },
  { name: 'Conference room', room: 'Conference Room', p: [-3.6, 1.65, 0.6], t: [1.4, 0.9, 4.2] },
  { name: 'Red alert', alert: 'red', p: [4.3, 1.7, -1.9], t: [-2.2, 1.0, 3.2] },
  { name: 'Console close-up', p: [-4.85, 1.42, -1.05], t: [-5.95, 0.92, -1.62] },
  { name: 'Chair close-up', p: [-0.85, 1.2, -0.55], t: [0, 0.68, 0.42] },
];
let heroCam = null;
const _heroHidden = [];
window.DEFIANCE_HERO = function (n) {
  _heroHidden.splice(0).forEach(([el, v]) => { el.style.visibility = v; });
  const S = HERO_SHOTS[n - 1];
  if (!S) { heroCam = null; setAlert('green'); return null; }
  $('intro').hidden = true; attract = false; closePanel();
  setAlert(S.alert || 'green');
  const p = new THREE.Vector3().fromArray(S.p), t = new THREE.Vector3().fromArray(S.t);
  if (S.room) { const r = ROOMS.find((q) => q.label === S.room); r.g.updateMatrixWorld(true); r.g.localToWorld(p); r.g.localToWorld(t); }
  heroCam = { p, t };
  document.body.querySelectorAll('*').forEach((el) => { if (el !== canvas && !el.contains(canvas)) { _heroHidden.push([el, el.style.visibility]); el.style.visibility = 'hidden'; } });
  return S.name;
};

// ---------- the viewscreen as a window ----------
// An off-axis projection: the space camera's view is skewed so its edges pass through the screen's edges as seen from
// the player's eye. Step left and more of the right-hand scene comes into view; step closer and the view widens,
// as through a real window. Damped (VIEW_PARALLAX) so the composition holds.
const VIEW_PARALLAX = { side: 0.55, depth: 0.3 };
function viewWindow() {
  const tH = Math.tan(vcam.fov * D2R / 2), tW = tH * vcam.aspect, d0 = (VS_H / 2) / tH, n = vcam.near;
  const e = camera.position, ex = (e.x - 0) * VIEW_PARALLAX.side, ey = (e.y - VS_Y) * VIEW_PARALLAX.side;
  const d = Math.max(1.2, d0 + (Math.max(0.8, e.z - VS_Z) - d0) * VIEW_PARALLAX.depth), k = d0 / d;
  vcam.projectionMatrix.makePerspective(n * (-tW * k - ex / d), n * (tW * k - ex / d), n * (tH * k - ey / d), n * (-tH * k - ey / d), n, vcam.far);
  vcam.projectionMatrixInverse.copy(vcam.projectionMatrix).invert();
}

// ---------- loop ----------
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.fov = w < h ? 80 : 66; camera.updateProjectionMatrix();
  if (composer) { if (POST.kind === 'three') composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); flagXR(composer.inputBuffer); flagXR(composer.outputBuffer); }
}
window.addEventListener('resize', resize); resize();

const clock = { last: performance.now(), getDelta() { const n = performance.now(), d = (n - this.last) / 1000; this.last = n; return d; } };
const _scrPM = new THREE.Matrix4(), _scrFr = new THREE.Frustum();
let wasWarp = false, rr = 0, rrTimer = 0, panelTimer = 0, ovTimer = 0, bobT = 0, bobAmp = 0;
const standV = new THREE.Vector3();
function wrapA(a) { return ((a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; }

let simLast = performance.now(), livePanelT = 0;
function frame() {
  const _t0 = performance.now();
  const dt = Math.min(clock.getDelta(), 0.05); elapsed += dt;
  // the ship model runs on real time (not the capped frame time) so it keeps pace on slow phones
  { const now = performance.now(); simUpdate(Math.min(1, (now - simLast) / 1000)); simLast = now; drainSimEvents(dt); }
  if (state.open) { livePanelT += dt; if (livePanelT > 0.25) { livePanelT = 0; renderPanel(); } }

  liftUpdate(dt);
  chairsUpdate(dt);
  if (!state.sitting) {
    let f = 0, s = 0;
    if (keys.KeyW || keys.ArrowUp) f += 1; if (keys.KeyS || keys.ArrowDown) f -= 1;
    if (keys.KeyD) s += 1; if (keys.KeyA) s -= 1;
    if (keys.ArrowLeft) player.yaw += 1.9 * dt; if (keys.ArrowRight) player.yaw -= 1.9 * dt;
    if (stick.active) { f += -stick.dy; s += stick.dx; }
    const len = Math.hypot(f, s); if (len > 1) { f /= len; s /= len; }
    if (len > 0.02) {
      const sy = Math.sin(player.yaw), cy = Math.cos(player.yaw), sp = 2.2;
      [player.x, player.z] = collide(player.x + (-sy * f + cy * s) * sp * dt, player.z + (-cy * f - sy * s) * sp * dt);
    }
    player.y += (floorH(player.x, player.z) + EYE - player.y) * Math.min(1, dt * 10);
  } else if (sitBlend < 0.995) {
    const k = 1 - Math.exp(-dt * 5); player.yaw += wrapA(0 - player.yaw) * k; player.pitch += (-0.04 - player.pitch) * k;
  }
  sitBlend = clamp(sitBlend + (state.sitting ? dt : -dt) * 1.6, 0, 1);
  const eb = sitBlend * sitBlend * (3 - 2 * sitBlend);
  standV.set(player.x, player.y, player.z);
  const moving = !state.sitting && (stick.active || keys.KeyW || keys.KeyS || keys.KeyA || keys.KeyD || keys.ArrowUp || keys.ArrowDown);
  bobAmp += ((moving && !reduceMotion ? 1 : 0) - bobAmp) * Math.min(1, dt * 6); bobT += dt * 8.5 * bobAmp;
  standV.y += Math.sin(bobT) * 0.018 * bobAmp;
  if (heroCam) {
    camera.position.copy(heroCam.p); camera.lookAt(heroCam.t);
  } else if (attract && !$('intro').hidden) {
    attractT += dt * (reduceMotion ? 0.02 : 0.06);
    const a = attractT + 2.2, rad = 3.3 + Math.sin(attractT * 0.7) * 0.5;
    camera.position.set(Math.sin(a) * rad, 1.95 + Math.sin(attractT * 0.9) * 0.15, 0.6 + Math.cos(a) * rad * 0.95);
    ATTRACT_LOOK.set(Math.sin(a + 2.6) * 1.2, 1.15, -1.2 + Math.cos(a + 2.6) * 1.2);
    camera.lookAt(ATTRACT_LOOK);
  } else {
    if (attract) { attract = false; }
    camera.position.copy(standV).lerp(SEAT, eb); camera.position.y += LIFT.shake;
    camera.rotation.set(player.pitch, player.yaw, Math.sin(bobT * 0.5) * 0.004 * bobAmp, 'YXZ');
  }
  camera.updateMatrixWorld();

  const T = SPEEDS[state.speed], rate = 1 - Math.exp(-dt * 1.4);
  cur.speed += (T.speed - cur.speed) * rate; cur.len += (T.len - cur.len) * rate;
  if (cur.speed > 300) wasWarp = true;
  if (wasWarp && cur.speed < 200) { wasWarp = false; arrive(); }
  if (cur.speed > 0.3) {
    streaks.visible = true; streakMat.opacity = Math.min(1, cur.speed / 10) * 0.9;
    const L = cur.len + 0.15;
    for (let i = 0; i < N_STREAK; i++) {
      let z = streakXYZ[i * 3 + 2] + cur.speed * dt;
      if (z > FWD_Z - 1) { seedStreak(i, z - 360); z = streakXYZ[i * 3 + 2]; } else streakXYZ[i * 3 + 2] = z;
      const x = streakXYZ[i * 3], y = streakXYZ[i * 3 + 1], o = i * 6;
      streakPos[o] = x; streakPos[o + 1] = y; streakPos[o + 2] = z; streakPos[o + 3] = x; streakPos[o + 4] = y; streakPos[o + 5] = z - L;
    }
    streakGeo.attributes.position.needsUpdate = true;
  } else streaks.visible = false;

  const fade = 1 - smooth(30, 200, cur.speed);
  const wantTarget = state.view === 'target' && state.speed !== 'warp';
  const k2 = 1 - Math.exp(-dt * 2.5);
  vLook.lerp(wantTarget ? TARGET_LOOK : vFwd, k2);
  const wantFov = wantTarget ? TARGET_FOV : 36; if (Math.abs(vcam.fov - wantFov) > 0.01) { vcam.fov += (wantFov - vcam.fov) * k2; vcam.updateProjectionMatrix(); }
  vcam.lookAt(vLook); vcam.updateMatrixWorld();
  viewWindow();
  updateSpace(dt, fade); updateViewscreen(dt);
  const warpGlow = smooth(20, 300, cur.speed);
  // the screen's steady glow is baked; this live light adds only the warp flare
  lScreen.intensity = ((BAKE.ok ? 0 : 0.35) + 0.8 * warpGlow + 0.06 * Math.sin(elapsed * 9) * warpGlow) * LIGHT_LEVELS[state.light] * Math.PI * 0.75;

  if (state.scanning) {
    state.scanT += dt;
    scanRing.material.opacity = 0.75 * Math.sin(Math.min(1, state.scanT / 2.6) * Math.PI);
    scanRing.rotation.set(Math.PI / 2 + Math.sin(state.scanT * 2.4) * 1.2, state.scanT * 0.8, 0);
    planetMat.uniforms.scan.value = scanRing.material.opacity;
    if (state.scanT > 2.6) { state.scanning = false; state.scanned = true; scanRing.material.opacity = 0; planetMat.uniforms.scan.value = 0; toast(`Scan complete on ${sysCur().planet}.`, 'Science'); beep([2093, 1568], 0.08, 0.035); renderPanel(); redrawAll(); }
  }

  if (false) { // the hologram over the old situation table is retired
    holo.rotation.y += dt * (reduceMotion ? 0.05 : 0.22);
    holoPlanets.forEach((p) => { p.a += dt * p.w; p.m.position.set(Math.cos(p.a) * p.r, 0, Math.sin(p.a) * p.r); });
    holoBeam.material.opacity = 0.05 + Math.sin(elapsed * 2) * 0.015;
  }

  DOORS.forEach((d) => {
    const near = d.auto && d.deck === LIFT.deck && !state.sitting && Math.hypot(camera.position.x - d.wx, camera.position.z - d.wz) < (d.room ? d.reach : 1.5);
    if (d.station === 'lift') d.open = LIFT.door; // lift.js runs the lift doors
    else d.open += ((near ? 1 : 0) - d.open) * Math.min(1, dt * 5);
    d.L.position.x = -d.q - d.open * d.slide; d.Rr.position.x = d.q + d.open * d.slide;
  });
  if (LIFT.deck === 3 && typeof d3Cull === 'function') d3Cull(camera.position); // inside a Deck 3 room: far doors hidden
  batchSleep(); // chairs and doors at rest are drawn merged; wake the ones that are about to move (batch.js)
  // rooms: light the one you are in or approaching, name it in the HUD
  { let here = null;
    ROOMS.forEach((r) => {
      _lc.copy(camera.position); r.g.worldToLocal(_lc);
      const inside = _lc.x > r.xa && _lc.x < r.xb && _lc.z > 0 && _lc.z < r.d; if (inside) here = r;
      const near = Math.hypot(camera.position.x - r.door[0], camera.position.z - r.door[1]) < 3.2;
      r.k += ((inside ? 1 : near ? 0.75 : 0) - r.k) * Math.min(1, dt * 3);
    });
    const ll = liftLocation(here && here.label); if (ll !== lastLoc) { lastLoc = ll; locNode.nodeValue = ll; } }
  { const closed = state.shutters === 'closed' || (state.shutters === 'auto' && state.alert === 'red');
    SHUTTERS.forEach((sh) => { sh.cur += ((closed ? 1 : 0) - sh.cur) * Math.min(1, dt * 2.2); const a = sh.cur * (Math.PI / 2 - 0.05); sh.slats.forEach((sl) => { sl.rotation.x = a; if (sh.hideOpen) sl.visible = sh.cur > 0.02; }); }); }
  if (cur.speed > 0.3) {
    extStreaks.visible = true; extMat.opacity = Math.min(1, cur.speed / 10) * 0.85; const L2 = 0.3 + cur.len * 0.45;
    for (let i = 0; i < EXT_N; i++) {
      let z = extXYZ[i * 3 + 2] + cur.speed * dt * 0.5;
      if (z > 90) { seedExt(i, z - 180); z = extXYZ[i * 3 + 2]; } else extXYZ[i * 3 + 2] = z;
      const x = extXYZ[i * 3], y = extXYZ[i * 3 + 1], o = i * 6;
      extPos[o] = x; extPos[o + 1] = y; extPos[o + 2] = z; extPos[o + 3] = x; extPos[o + 4] = y; extPos[o + 5] = z - L2;
    }
    extGeo.attributes.position.needsUpdate = true;
  } else extStreaks.visible = false;
  // the exterior's moving parts: shuttlebay doors, impulse plumes, thruster puffs, blinking hull lights
  if (EXTSET && EXTSET.userData.update) EXTSET.userData.update(dt, elapsed); // (built with Deck 2)

  if (state.alert === 'red') {
    const k = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(elapsed * 4));
    stripMats.forEach((m) => m.color.setHex(ALERTS.red.strip).multiplyScalar(1.9 * k));
    slotMats.forEach((m) => m.color.setHex(ALERTS.red.slot).multiplyScalar(1.35 * (0.35 + 0.65 * k)));
    MAT.wall.emissiveIntensity = 0.3 + 0.7 * k;
    bakeLevels(LIGHT_LEVELS[state.light] * 0.28, 'red', ALERTS.red.strip, k);
    if (typeof d3Alert === 'function') d3Alert(true, k); // Deck 3's corridor bands pulse too
  } else { MAT.wall.emissiveIntensity = 0.7; if (typeof d3Alert === 'function') d3Alert(false, 0); }

  if (AC && soundOn && elapsed > nextChirp) { nextChirp = elapsed + 3 + Math.random() * 6; const b = 1200 + Math.random() * 1200; beep(Math.random() < 0.5 ? [b, b * 1.25] : [b], 0.045, 0.012); }

  // screens: every frame, redraw a few of the visible ones, the nearest and longest-waiting first, so they all keep moving
  { _scrPM.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); _scrFr.setFromProjectionMatrix(_scrPM);
    const budget = PERF_OPT.screens, pick = [];
    if (budget > 0) for (const sc of screens) {
      if (!sc.wp) { sc.wp = new THREE.Vector3(); sc.mesh.getWorldPosition(sc.wp); }
      const d2 = sc.wp.distanceToSquared(camera.position); if (d2 > 110) continue;
      const big = sc.w * sc.h > 900000, age = elapsed - (sc.last || -9); if (age < (big ? 1 / 12 : 1 / 30)) continue;
      if (!shown(sc.mesh)) continue;
      const score = age * (_scrFr.containsPoint(sc.wp) ? 4 : 0.25) / (0.6 + Math.sqrt(d2)) * (big ? 0.7 : 1);
      if (pick.length < budget) pick.push([score, sc]); else { let lo = 0; for (let k = 1; k < pick.length; k++) if (pick[k][0] < pick[lo][0]) lo = k; if (score > pick[lo][0]) pick[lo] = [score, sc]; }
    }
    pick.forEach(([, sc]) => { drawScreen(sc); sc.last = elapsed; }); }
  if (state.open && byStation[state.open]) { panelTimer += dt; if (panelTimer > 0.15) { panelTimer = 0; byStation[state.open].forEach((s) => { if (s.kind !== 'keys') drawScreen(s); }); } }
  ovTimer += dt; if (ovTimer > 1) { ovTimer = 0; drawOverlay(); }

  aimTimer += dt; if (aimTimer > 0.12) { aimTimer = 0; aim(); }

  scene.fog = null; renderer.setRenderTarget(rt); if (LIFT.deck === 1 && PERF_OPT.viewscreen) renderer.render(scene, vcam);
  { const sk = LIGHT_LEVELS[state.light] * (state.alert === 'red' ? 0.5 : 1) * (1 + Math.sin(elapsed * 0.7) * 0.15); shaftMat.uniforms.k.value = 0.06 * sk; shafts[shafts.length - 1].material.uniforms.k.value = 0.035 * sk; }
  scene.fog = FOG; renderer.setRenderTarget(null);
  if (composer) composer.render(); else renderer.render(scene, camera);
  PERF_OPT.cpu = performance.now() - _t0;
  requestAnimationFrame(frame);
}
setAlert('green');
requestAnimationFrame(frame);
// hand-over to the baked light once its files arrive (or to the fallback rig if they can't)
BAKE.ready.then((ok) => {
  if (ok) { renderer.shadowMap.enabled = false; applyLights(); } else { fallbackLights(); DECALS.forEach((m) => { m.visible = true; }); applyLights(); }
  // checks that look at every deck at once ask for them all to be built now (normally each is built on its first visit)
  if (window.DEFIANCE_BUILD_ALL) Object.values(DECKS).forEach((d) => deckBuild(d.n));
  window.DEFIANCE_BAKED = ok ? 'baked' : 'fallback';
});

````

---

## `js/perf.js`

````javascript
// USS Defiance · perf.js
// A small performance readout, opened with the P key (or a #perf address): frames per second, frame time (average
// and the slowest frame each second), the graphics chip and the render size, plus switches for the expensive parts of
// the picture so their cost can be seen live on the machine at hand. Choices are remembered in this browser.
// Files share one global scope and load in order (see index.html); this one loads last.
'use strict';
(function () {
  const KEY = 'defiance-perf', DPR = Math.min(window.devicePixelRatio || 1, 2);
  const opt = Object.assign({ res: 'standard', ao: false, aa: true, screens: 'normal' }, (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(opt)); } catch (e) { /* storage may be unavailable */ } };
  // settings version 2 (Nov 27): edge smoothing on by default. It costs little frame rate on a desktop and looks much
  // better, so a choice saved under the old settings (often switched off while testing) is reset to on, once.
  if ((opt.v || 1) < 2) { opt.aa = true; opt.v = 2; save(); }
  const RES = { full: DPR, standard: 1, low: 0.75 };
  // Quality presets (roadmap F5). Phone and Desktop are the settings each already had; Cinematic turns everything up and
  // uses the full exterior model outside Deck 2's windows. The switches below still fine-tune a preset.
  const TIERS = {
    phone: { res: 'standard', ao: false, aa: false, screens: 'normal' },
    desktop: { res: 'standard', ao: false, aa: true, screens: 'normal' },
    cinematic: { res: 'full', ao: true, aa: true, screens: 'smooth' },
  };
  opt.quality = QUALITY.tier;
  function setTier(t) { QUALITY.tier = opt.quality = t; Object.assign(opt, TIERS[t]); if (typeof extRebuild === 'function') extRebuild(); }
  function apply() {
    // edge smoothing first: changing it rebuilds the composer's buffers, and resize() re-flags the new ones
    if (composer && 'multisampling' in composer && !isMobile) { const ms = opt.aa ? 4 : 0; if (composer.multisampling !== ms) composer.multisampling = ms; }
    if (aoPass) aoPass.enabled = !!opt.ao;
    renderer.setPixelRatio(Math.min(RES[opt.res] || DPR, DPR)); resize();
    PERF_OPT.screens = opt.screens === 'smooth' ? (isMobile ? 4 : 8) : (isMobile ? 2 : 4);
  }
  apply();

  // the panel
  const css = document.createElement('style');
  css.textContent = `#perf{position:fixed;left:12px;top:12px;z-index:50;background:rgba(0,0,0,.82);color:#F2E6D0;font:13px/1.35 system-ui,sans-serif;border:2px solid #E8A06A;border-radius:14px;padding:10px 12px;width:290px;max-width:calc(100vw - 24px)}
#perf[hidden]{display:none}#perf h2{margin:0 0 4px;font:600 15px Antonio,'Arial Narrow',sans-serif;letter-spacing:.06em;color:#E8A06A}#perf .big{font:600 30px Antonio,'Arial Narrow',sans-serif;color:#F2C88F}
#perf .row{display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap}#perf .row span{flex:1 0 100%;color:#D9B07E}#perf button{min-height:36px;padding:0 10px;border-radius:18px;border:0;background:#3a2f44;color:#F2E6D0;font:inherit;cursor:pointer}
#perf button.on{background:#E8A06A;color:#000}#perf small{color:#b9a98f;display:block;margin-top:6px;word-break:break-word}#perf table{width:100%;border-collapse:collapse;margin-top:6px;font-size:12px}#perf td{padding:2px 4px;border-top:1px solid #3a2f44}#perf td+td{text-align:right}#perf .x{position:absolute;right:8px;top:6px;min-height:28px;background:none;color:#E8A06A}`;
  document.head.appendChild(css);
  const el = document.createElement('div'); el.id = 'perf'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Performance');
  el.innerHTML = `<button class="x" aria-label="Close">✕</button><h2>PERFORMANCE · P TO CLOSE</h2><div><span class="big" id="pf-fps">--</span> fps &nbsp; <span id="pf-ms">--</span></div><div id="pf-calls">--</div>
<div class="row"><span>Quality</span></div><div class="row" data-k="quality"></div>
<div class="row"><span>Resolution</span></div><div class="row" data-k="res"></div>
<div class="row"><span>Soft contact shadows</span></div><div class="row" data-k="ao"></div>
<div class="row"><span>Edge smoothing</span></div><div class="row" data-k="aa"></div>
<div class="row"><span>Display updates</span></div><div class="row" data-k="screens"></div>
<div class="row"><button id="pf-test">Run speed test (stand still, ~20 s)</button></div><div id="pf-res"></div><small id="pf-info"></small>`;
  document.body.appendChild(el);
  const CH = {
    quality: [['phone', 'Phone'], ['desktop', 'Desktop'], ['cinematic', 'Cinematic']],
    res: [['full', `Sharp ×${DPR}`], ['standard', 'Standard ×1'], ['low', 'Low ×0.75']],
    ao: [[true, 'On'], [false, 'Off']], aa: [[true, 'On'], [false, 'Off']], screens: [['normal', 'Normal'], ['smooth', 'Smoother']],
  };
  const draw = () => el.querySelectorAll('.row[data-k]').forEach((r) => { const k = r.dataset.k; r.replaceChildren(...CH[k].map(([v, t]) => {
    const b = document.createElement('button'); b.textContent = t; b.className = opt[k] === v ? 'on' : ''; b.disabled = (k === 'ao' && !aoPass) || (k === 'aa' && (isMobile || !composer));
    b.addEventListener('click', () => { if (k === 'quality') setTier(v); else opt[k] = v; save(); apply(); draw(); info(); canvas.focus({ preventScroll: true }); }); return b; })); });
  const gpu = (() => { try { const gl = renderer.getContext(), x = gl.getExtension('WEBGL_debug_renderer_info'); return x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } catch (e) { return 'unknown'; } })();
  const info = () => { const pr = renderer.getPixelRatio(); $('pf-info').textContent = `Graphics: ${gpu} · window ${innerWidth}×${innerHeight} · drawing ${Math.round(innerWidth * pr)}×${Math.round(innerHeight * pr)} · post: ${POST.kind}`; };
  draw(); info();
  const toggle = (on) => { el.hidden = on === undefined ? !el.hidden : !on; if (!el.hidden) info(); };
  el.querySelector('.x').addEventListener('click', () => toggle(false));
  window.addEventListener('keydown', (e) => { if (e.code === 'KeyP' && !e.repeat && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) toggle(); });
  if (location.hash === '#perf') toggle(true);

  // frame timing: frames per second and the average and slowest frame over the last second
  // draw calls and triangles per frame: the renderer's counters add up over a whole frame (every pass, the viewscreen,
  // the screens) and are read and cleared here once a frame
  renderer.info.autoReset = false;
  let last = performance.now(), n = 0, sum = 0, worst = 0, acc = 0, cpuSum = 0, calls = 0, tris = 0;
  const tick = () => { const now = performance.now(), dt = now - last; last = now; n++; sum += dt; cpuSum += PERF_OPT.cpu; worst = Math.max(worst, dt); acc += dt;
    calls += renderer.info.render.calls; tris += renderer.info.render.triangles; renderer.info.reset();
    if (acc >= 1000) { if (!el.hidden) { $('pf-fps').textContent = Math.round(n * 1000 / acc); $('pf-ms').textContent = `${(sum / n).toFixed(1)} ms avg · ${worst.toFixed(0)} ms slowest · processor ${(cpuSum / n).toFixed(1)} ms`; $('pf-calls').textContent = `${Math.round(calls / n)} draw calls · ${Math.round(tris / n / 1000)}k triangles a frame · Deck ${LIFT.deck}`; } cpuSum = 0; calls = 0; tris = 0; n = 0; sum = 0; worst = 0; acc = 0; }
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick);

  // speed test: measure a couple of seconds with each expensive part switched off in turn, so the slow part shows itself.
  // Frame rates snap to the screen's refresh steps (60, 30, 20...), so a part that frees just enough time jumps a step.
  const measure = (ms) => new Promise((res) => { let t0 = 0, k = 0, s = 0, w = 0, c = 0, prev = 0;
    const f = (now) => { if (!t0) { t0 = prev = now; } else { const d = now - prev; prev = now; k++; s += d; w = Math.max(w, d); c += PERF_OPT.cpu; }
      if (now - t0 < ms) requestAnimationFrame(f); else res({ fps: k * 1000 / (now - t0), avg: s / k, worst: w, cpu: c / k }); };
    requestAnimationFrame(f); });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  async function speedTest() {
    const btn = $('pf-test'); btn.disabled = true; const keep = Object.assign({}, opt), out = [];
    const cases = [
      ['Your settings', () => {}],
      ['Edge smoothing off', () => { opt.aa = false; }],
      ['Viewscreen paused', () => { PERF_OPT.viewscreen = false; }],
      ['Displays paused', () => { PERF_OPT.screens = 0; }],
      ['Low ×0.75', () => { opt.res = 'low'; }],
      ['All four', () => { opt.aa = false; opt.res = 'low'; PERF_OPT.viewscreen = false; PERF_OPT.screens = 0; }],
    ];
    for (const [name, set] of cases) {
      btn.textContent = `Testing: ${name}…`; Object.assign(opt, keep); apply(); PERF_OPT.viewscreen = true; set(); if (name !== 'Your settings') { const v = PERF_OPT.viewscreen, sc = PERF_OPT.screens; apply(); PERF_OPT.viewscreen = v; if (sc === 0) PERF_OPT.screens = 0; }
      await wait(800); out.push([name, await measure(2200)]);
    }
    Object.assign(opt, keep); PERF_OPT.viewscreen = true; apply(); save();
    $('pf-res').innerHTML = '<table><tr><td>Test</td><td>fps</td><td>ms</td><td>proc.</td></tr>' + out.map(([nm, r]) => `<tr><td>${nm}</td><td>${Math.round(r.fps)}</td><td>${r.avg.toFixed(1)}</td><td>${r.cpu.toFixed(1)}</td></tr>`).join('') + '</table>';
    btn.textContent = 'Run speed test again'; btn.disabled = false; info();
    window.DEFIANCE_PERF.last = out;
  }
  $('pf-test').addEventListener('click', speedTest);
  window.DEFIANCE_PERF = { opt, apply, speedTest };
})();

````

---

## `tests/sim.test.js`

````javascript
// Tests for js/sim.js. Run: node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'sim.js'), 'utf8');
const EXPORTS = 'SIM, ARCS, ZONES, simReset, simUpdate, simStep, reactorOut, eff, zoneFactor, zoneStatus, hullIntegrity, shieldMax, shieldNow, simCanWarp, setPreset, emergencyPower, reinforceArc, sendTeam, worstZone, startDrill, stopDrill, simHit, simStats';
function load() {
  const ctx = vm.createContext({ state: { alert: 'green', speed: 'stop' }, Math, console });
  const api = vm.runInContext(SRC + `\n;({ ${EXPORTS}, get sim() { return sim; } })`, ctx);
  api.state = ctx.state;
  return api;
}
const run = (S, secs) => { for (let t = 0; t < secs; t += 0.1) S.simStep(0.1); };

test('balanced preset runs every system at full efficiency', () => {
  const S = load();
  for (const k of ['weapons', 'shields', 'engines', 'sensors']) assert.strictEqual(S.eff(k), 1);
});

test('attack preset puts weapons at 1.5', () => {
  const S = load(); S.setPreset('attack');
  assert.strictEqual(S.eff('weapons'), 1.5);
  assert.ok(Math.abs(S.eff('engines') - 0.6) < 1e-9);
});

test('shields reach full within about 4 s of yellow alert, and are down at green', () => {
  const S = load();
  assert.strictEqual(S.shieldNow('fwd'), 0);
  S.state.alert = 'yellow'; run(S, 4.1);
  for (const a of S.ARCS) assert.ok(S.shieldNow(a) >= 99.9, a + ' ' + S.shieldNow(a));
  S.state.alert = 'green'; run(S, 4.1);
  assert.strictEqual(S.shieldNow('fwd'), 0);
});

test('reinforcing an arc sets 140 there and 85 elsewhere', () => {
  const S = load(); S.reinforceArc('fwd');
  assert.strictEqual(S.shieldMax('fwd'), 140);
  assert.strictEqual(S.shieldMax('aft'), 85);
  S.reinforceArc(null);
  assert.strictEqual(S.shieldMax('fwd'), 100);
});

test('a hit larger than the arc drains it and the rest lands on a zone for that arc', () => {
  const S = load(); S.state.alert = 'red'; run(S, 4.1);
  const before = S.hullIntegrity();
  const r = S.simHit('fwd', 150);
  assert.ok(Math.abs(r.absorbed - 100) < 0.5, 'absorbed ' + r.absorbed);
  assert.ok(['prow', 'dorsal', 'ventral'].includes(r.zone), r.zone);
  assert.ok(Math.abs(S.sim.zones[r.zone] - 50) < 0.5);
  assert.ok(S.shieldNow('fwd') < 0.5);
  assert.ok(S.hullIntegrity() < before);
});

test('engines at zero with no team starts a 20 s breach that loses the ship', () => {
  const S = load(); S.sim.zones.engines = 0; S.simStep(0.1);
  assert.ok(S.sim.breach > 19 && S.sim.breach <= 20);
  run(S, 20.2);
  assert.strictEqual(S.sim.lost, true);
});

test('a team already on the engines prevents the breach', () => {
  const S = load(); S.sendTeam(0, 'engines'); run(S, 10.1);
  S.sim.zones.engines = 0; S.simStep(0.1);
  assert.strictEqual(S.sim.breach, null);
});

test('repair teams stop at 80%', () => {
  const S = load(); S.sim.zones.prow = 60; S.sendTeam(1, 'prow');
  run(S, 10); assert.ok(S.sim.zones.prow <= 60.5, 'no repair while moving');
  run(S, 40); assert.strictEqual(S.sim.zones.prow, 80);
});

test('catch-up after a long frame gap is capped at 10 ticks', () => {
  const S = load(); const n = S.simUpdate(10);
  assert.strictEqual(n, 10);
});

test('warp needs at least one nacelle above 25%', () => {
  const S = load(); assert.strictEqual(S.simCanWarp(), true);
  S.sim.zones.portNac = 20; assert.strictEqual(S.simCanWarp(), true);
  S.sim.zones.stbdNac = 20; assert.strictEqual(S.simCanWarp(), false);
});

test('engines damage cuts reactor output; emergency power boosts then penalizes', () => {
  const S = load(); S.sim.zones.engines = 50; assert.ok(S.reactorOut() < 100);
  const S2 = load(); S2.emergencyPower(); assert.ok(S2.sim.emergency.boost > 0);
  run(S2, 20.1); assert.ok(S2.reactorOut() < 100 && S2.reactorOut() >= 79);
  run(S2, 30.1); assert.strictEqual(S2.reactorOut(), 100);
});

test('drill lands hits over 60 s and then ends', () => {
  const S = load(); S.startDrill(); run(S, 61);
  assert.ok(S.sim.drill.hits >= 10, 'hits ' + S.sim.drill.hits);
  assert.strictEqual(S.sim.drill.on, false);
});

````
