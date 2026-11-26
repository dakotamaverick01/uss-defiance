# USS Defiance: one-file bundle for review

Branch `captain-sim` at `89b0fb3`. Read-only copy for review: suggest changes in words; do not edit the repository.

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
const FILES = ['core', 'sim', 'surfaces', 'materials', 'bridge', 'space', 'rooms', 'deck2', 'lighting', 'bake', 'collision', 'screens', 'sound', 'ui', 'lift', 'controls', 'render'];
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
  scanning: false, scanned: false, scanT: 0, sitting: false, open: null,
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
    let vd = world ? W : '', vb = world ? 'vWP = (modelMatrix * vec4(transformed, 1.0)).xyz; vWN = normalize(mat3(modelMatrix) * normal); vON = normal;\n' : '', fd = world ? W : '';
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
const TRI_DECL = `uniform sampler2D triN, triO, triC; uniform float triS, triNS, triRV, triEdge, triLow; uniform vec3 triTint;
vec3 triW(vec3 n) { vec3 w = pow(abs(n), vec3(4.0)); return w / dot(w, vec3(1.0)); }
vec4 triTex(sampler2D t, vec3 p, vec3 w) { return texture(t, p.zy) * w.x + texture(t, p.xz) * w.y + texture(t, p.xy) * w.z; }
`;
// o: { set, metres, ns (bump strength), rv (roughness variation), edge (edge wear), low (grime near the deck), color, absRough, albedo }
function triSurface(m, o) {
  const U = {
    triN: { value: PH.n }, triO: { value: PH.orm }, triC: { value: PH.c }, triS: { value: 1 / (o.metres || 0.6) }, triNS: { value: o.ns ?? 0.8 },
    triRV: { value: o.rv ?? 0.6 }, triEdge: { value: o.edge || 0 }, triLow: { value: o.low ?? 1 }, triTint: { value: new THREE.Color(1, 1, 1) },
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
        float tLow = (1.0 - smoothstep(0.0, 0.35, vWP.y)) * (1.0 - abs(tWN.y)) * triLow; diffuseColor.rgb *= 1.0 - 0.35 * tLow;
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
const WALK_DECL = `uniform float walkAmt, walkRough, walkFlat; uniform vec3 walkTint;
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
    uniforms: { walkAmt: { value: o.amt }, walkRough: { value: o.rough }, walkFlat: { value: o.flat }, walkTint: { value: new THREE.Color().setRGB(...o.tint) } },
    at: {
      map_fragment: 'float wk = walkMask(vWP.xz) * walkAmt; diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * walkTint, wk);',
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
// a sliding double door at (px, pz), frame on the local +z side; parent and deck default to the bridge (Deck 1)
function doorAt(px, pz, rot, label, station, auto, room, parent, deck) {
  const g = group(px, 0, pz, rot, parent), tx = Math.cos(rot), tz = -Math.sin(rot);
  const back = cnv(256, 400); { const c = back.getContext('2d'); const gr = c.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, '#f4f6fa'); gr.addColorStop(1, '#c9d2e0'); c.fillStyle = gr; c.fillRect(0, 0, 256, 400); }
  if (!room) mesh(new THREE.PlaneGeometry(1.2, 2.3), new THREE.MeshBasicMaterial({ map: tex(back), toneMapped: false }), 0, 1.15, 0.012, g);
  const reveal = [];
  if (room) { [-1, 1].forEach((sd) => reveal.push(mesh(BOX(0.04, 2.3, 0.22), MAT.gun, sd * 0.62, 1.15, -0.1, g))); reveal.push(mesh(BOX(1.28, 0.04, 0.22), MAT.gun, 0, 2.32, -0.1, g), mesh(BOX(1.2, 0.012, 0.24), MAT.steel, 0, 0.006, -0.1, g)); }
  [-1, 1].forEach((sd) => mesh(RBOX(0.22, 2.6, 0.3, 0.03), MAT.gun, sd * 0.71, 1.3, 0.12, g));
  mesh(RBOX(1.64, 0.3, 0.3, 0.03), MAT.gun, 0, 2.45, 0.12, g);
  mesh(BOX(1.2, 0.004, 0.1), MAT.hazard, 0, 0.003, 0.16, g);
  const lp = cnv(320, 56); { const c = lp.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, 320, 56); hexNode(c, 28, 28, 16); c.fillStyle = station === 'capbank' ? '#E05A50' : '#E8A06A'; c.fill(); if (!THREE.TroikaText) { c.fillStyle = '#F5E6CF'; c.font = `700 26px ${DISP}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(label, 56, 30); } }
  const lpm = mesh(new THREE.PlaneGeometry(1.0, 0.175), new THREE.MeshBasicMaterial({ map: tex(lp), toneMapped: false }), 0, 2.45, 0.276, g);
  text3d(lpm, label, 0.085, 0xF5E6CF, -0.325, 0.004, 0.002);
  const L = mesh(RBOX(0.6, 2.3, 0.06, 0.015), MAT.panel, -0.3, 1.15, 0.06, g);
  const Rr = mesh(RBOX(0.6, 2.3, 0.06, 0.015), MAT.panel, 0.3, 1.15, 0.06, g);
  [L, Rr].forEach((d, k) => { mesh(BOX(0.02, 1.9, 0.02), SLOT, k ? -0.27 : 0.27, 0, 0.04, d); mesh(BOX(0.4, 0.05, 0.02), MAT.steel, 0, 0.1, 0.04, d); });
  addHit(BOX(1.6, 2.6, 0.8), { station }, g, 0, 1.3, 0.45);
  const dd = { L, Rr, open: 0, station, auto, room, wx: px, wz: pz, reveal, deck: deck || 1 };
  if (room) dd.seg = [px - tx * 0.6, pz - tz * 0.6, px + tx * 0.6, pz + tz * 0.6, 0.2];
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
  ge.fillStyle = '#fff'; ge.fillRect(0, Y(H - (kind === 'tile' ? 0.18 : 0.26)) - 2, Wd, 3);
  return [c, e];
}
function roomWallMat(H, kind) {
  const [c, e] = roomWallCanvases(H, kind); const map = tex(c), em = tex(e); map.wrapS = em.wrapS = THREE.RepeatWrapping;
  const nm = normalTex(c, kind === 'tile' ? 4 : 2.5); nm.wrapS = THREE.RepeatWrapping;
  const m = new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: new THREE.Color(ALERTS.green.slot), emissiveIntensity: 0.65, normalMap: nm, roughness: 0.9, metalness: 0.02, envMapIntensity: 0.3 });
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
function plantAt(parent, x, z, scale) {
  const g = group(x, 0, z, 0, parent); g.scale.setScalar(scale || 1);
  mesh(CYL(0.2, 0.15, 0.5, 24), POT, 0, 0.25, 0, g);
  mesh(new THREE.TorusGeometry(0.2, 0.015, 6, 24), BRASS, 0, 0.5, 0, g).rotation.x = Math.PI / 2;
  const rr = mulberry(Math.round(x * 100 + z * 37) + 99);
  for (let i = 0; i < 13; i++) {
    const a = i / 13 * Math.PI * 2 + rr() * 0.4, tilt = 0.3 + rr() * 0.6, len = 0.4 + rr() * 0.35;
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
  plantAt(g, XA + 0.38, 0.68, 1.0); lobs(g, XA + 0.38, 0.68, 0.28);
  plantAt(g, XA + 0.4, D - 0.4, 0.9); lobs(g, XA + 0.4, D - 0.4, 0.26);
  plantAt(g, XB - 0.4, D - 0.4, 0.85); lobs(g, XB - 0.4, D - 0.4, 0.26);
  // ceiling: a central light disc, downlights over the desk, the settee and the meal table
  { const dc = mesh(new THREE.CircleGeometry(0.7, 40), lightDiscMat, MX, H - 0.005, MZ, g); dc.rotation.x = Math.PI / 2; const rim = mesh(new THREE.TorusGeometry(0.71, 0.025, 8, 48), MAT.steel, MX, H - 0.01, MZ, g); rim.rotation.x = Math.PI / 2; }
  [[DK.x, DK.z + 0.25], [ST.x + 0.2, ST.z], [3.95, 1.75], [0.9, 6.0], [XB - 0.8, CZ], [0.3, 1.3], [ST.x + 0.2, 5.6], [4.2, 6.0]].forEach(([x, z]) => { mesh(new THREE.CircleGeometry(0.09, 20), downlightMat, x, H - 0.003, z, g).rotation.x = Math.PI / 2; lpool(g, x, z, 1.4, 1.4, 0xffd2a0, 0.1); });
}

// ---------- CONFERENCE ROOM (straight aft of the bridge, door on the starboard side of the aft wall) ----------
// About 8 x 6.5 m inside, with room to walk all the way around the table.
{
  const g = roomFrame(4, DOOR_GAPS[4]);
  const XA = -4.0, XB = 4.0, D = 6.7, H = ROOM_H;
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
  plantAt(g, XB - 0.4, 0.62, 1.0); lobs(g, XB - 0.4, 0.62, 0.28);
  plantAt(g, XA + 0.4, D - 0.4, 1.0); lobs(g, XA + 0.4, D - 0.4, 0.28);
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

## `js/deck2.js`

````javascript
// USS Defiance · deck2.js
// Deck 2, the officers' deck, part 1: the Lift 1 lobby, the corridor aft, the captain's quarters forward and
// the officers' wardroom. It sits a real deck (3.5 m) below the bridge; the lift car travels down to it.
// Built before bake.js so its surfaces are part of the light bake; lift.js hides it until you ride down.
// Coordinates are world x / z (forward is -z), with y measured from the Deck 2 floor.
// Files share one global scope and load in order (see index.html).
'use strict';

const D2Y = -3.5, D2H = 2.75, D2C = 2.6; // floor height, room ceiling, corridor ceiling
const DECK2 = group(0, D2Y, 0, 0); DECK2.name = 'Deck 2';
const D2 = { segs: [], obs: [], rooms: [], door: null };
const d2RoomWall = roomWallMat(D2H, 'fabric'), d2CorrWall = roomWallMat(D2C, 'fabric');
const [D2_LX] = onEdge(LIFT_GAP.edge, LIFT_GAP.t, 0); // the lift door's x; the doors open forward at z = 6.2
function d2seg(ax, az, bx, bz, r) { D2.segs.push([ax, az, bx, bz, r === undefined ? 0.33 : r]); }
function d2obs(x, z, r) { D2.obs.push({ x, z, r }); }
// a straight wall from A to B facing n, with openings measured along it: { a, b, y0, y1 } (y0 > 0 means a window)
function d2wall(mat, A, B, n, H, holes) {
  const len = Math.hypot(B[0] - A[0], B[1] - A[1]), dir = [(B[0] - A[0]) / len, (B[1] - A[1]) / len], P = (s) => [A[0] + dir[0] * s, A[1] + dir[1] * s];
  let s = 0; (holes || []).slice().sort((p, q) => p.a - q.a).forEach((h) => {
    wallPiece(mat, A, dir, n, s, h.a, 0, H, H, 1.2, DECK2);
    if (h.y0 > 0.001) wallPiece(mat, A, dir, n, h.a, h.b, 0, h.y0, H, 1.2, DECK2);
    if (h.y1 < H - 0.001) wallPiece(mat, A, dir, n, h.a, h.b, h.y1, H, H, 1.2, DECK2);
    const p0 = P(s), p1 = P(h.a); d2seg(p0[0], p0[1], p1[0], p1[1]);
    if (h.y0 > 0.4) { const q0 = P(h.a), q1 = P(h.b); d2seg(q0[0], q0[1], q1[0], q1[1]); }
    s = h.b;
  });
  wallPiece(mat, A, dir, n, s, len, 0, H, H, 1.2, DECK2);
  const p0 = P(s), p1 = P(len); d2seg(p0[0], p0[1], p1[0], p1[1]);
}
// a room: floor, ceiling, four walls facing in, a cove light and a dark crown under the ceiling
function d2room(label, x0, x1, z0, z1, H, mat, floor, holes) {
  const fw = x1 - x0, fd = z1 - z0;
  const fg = new THREE.PlaneGeometry(fw, fd); { const uv = fg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * fw, uv.getY(i) * fd); }
  const f = mesh(fg, floor, (x0 + x1) / 2, 0.002, (z0 + z1) / 2, DECK2); f.rotation.x = -Math.PI / 2;
  const c = mesh(fg.clone(), MAT.ceiling, (x0 + x1) / 2, H, (z0 + z1) / 2, DECK2); c.rotation.x = Math.PI / 2;
  // walls sit 6 cm inside the room's outline, so two rooms back to back never share one plane
  // (coincident back-to-back walls shadow each other in the light bake and come out black)
  const I = 0.06, sh = (L) => (L || []).map((h) => Object.assign({}, h, { a: h.a - I, b: h.b - I }));
  holes = holes || {};
  d2wall(mat, [x0 + I, z0 + I], [x1 - I, z0 + I], [0, 1], H, sh(holes.n));
  d2wall(mat, [x0 + I, z1 - I], [x1 - I, z1 - I], [0, -1], H, sh(holes.s));
  d2wall(mat, [x0 + I, z0 + I], [x0 + I, z1 - I], [1, 0], H, sh(holes.w));
  d2wall(mat, [x1 - I, z0 + I], [x1 - I, z1 - I], [-1, 0], H, sh(holes.e));
  [[(x0 + x1) / 2, z0 + 0.13, fw - 0.3, 0], [(x0 + x1) / 2, z1 - 0.13, fw - 0.3, 0], [x0 + 0.13, (z0 + z1) / 2, fd - 0.3, Math.PI / 2], [x1 - 0.13, (z0 + z1) / 2, fd - 0.3, Math.PI / 2]].forEach(([x, z, L, ry]) => {
    const cv = mesh(BOX(L, 0.03, 0.03), SLOT, x, H - 0.28, z, DECK2); cv.rotation.y = ry;
    const sh = mesh(RBOX(L + 0.1, 0.08, 0.12, 0.015), MAT.gunDark, x, H - 0.23, z, DECK2); sh.rotation.y = ry;
    const st = mesh(BOX(L - 0.2, 0.02, 0.02), STRIP, x, 0.06, z, DECK2); st.rotation.y = ry;
  });
  D2.rooms.push({ label, x0, x1, z0, z1 });
}
function d2down(x, z, H) {
  mesh(new THREE.CircleGeometry(0.1, 20), downlightMat, x, H - 0.004, z, DECK2).rotation.x = Math.PI / 2;
  mesh(new THREE.TorusGeometry(0.115, 0.016, 6, 20), MAT.steel, x, H - 0.008, z, DECK2).rotation.x = Math.PI / 2;
}
function d2panel(x, z, H, w, d) {
  mesh(RBOX(w + 0.12, 0.04, d + 0.12, 0.015), MAT.steel, x, H - 0.02, z, DECK2);
  mesh(new THREE.PlaneGeometry(w, d), downlightMat, x, H - 0.045, z, DECK2).rotation.x = Math.PI / 2;
}
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
function d2label(text, x, y, z, rot, w) {
  const c = cnv(512, 80), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 512, 80);
  hexTab(g, 6, 10, 40, 60, true, false); g.fillStyle = '#E8A06A'; g.fill();
  g.fillStyle = '#E8A06A'; g.font = `600 44px ${DISP}`; g.textBaseline = 'middle'; g.fillText(text, 60, 43);
  const m = mesh(new THREE.PlaneGeometry(w, w * 80 / 512), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false }), x, y, z, DECK2); m.rotation.y = rot; return m;
}

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
const D2_WARD = { x0: -3.2, x1: 5.8, z0: 17.0, z1: 24.5, door: 1.3 };
const D2_SO = { x0: 2.4, x1: 6.2 };
const D2_PAS = { z0: 15.0, z1: 17.0, ax0: -5.4, ax1: -3.2, az1: 24.5, cap: 20.5 };
const D2_LNG = { x0: -5.4, x1: 5.8, z0: 24.5, z1: 31.0, door: -4.3 };
const D2_XO = { x0: -5.4, x1: 0.2, z0: 8.6, z1: 15.0, door: 9.6 };

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
  plantAt(DECK2, x1 - 0.45, z1 - 0.45, 0.9); d2obs(x1 - 0.45, z1 - 0.45, 0.3);
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
  [x0 + 0.06, x1 - 0.06].forEach((x) => { const r = mesh(CYL(0.022, 0.022, z1 - z0 - 0.6, 10), MAT.steel, x, 0.95, (z0 + z1) / 2, DECK2); r.rotation.x = Math.PI / 2; });
  // doors along the corridor: first officer (port), two senior officers' cabins (starboard), the wardroom aft
  doorAt(x0, D2_XO.door, Math.PI / 2, 'FIRST OFFICER', 'xoq', true, true, DECK2, 2);
  doorAt(x1, 7.2, -Math.PI / 2, 'SENIOR OFFICER', 'so1q', true, true, DECK2, 2);
  doorAt(x1, 12.0, -Math.PI / 2, 'SENIOR OFFICER', 'so2q', true, true, DECK2, 2);
  doorAt(D2_WARD.door, z1, Math.PI, 'WARDROOM', 'wardoor', true, true, DECK2, 2);
  d2label('AFT · WARDROOM', x1 - 0.08, 2.0, 4.6, -Math.PI / 2, 0.9);
  d2label('PORT · OBSERVATION LOUNGE', x1 - 0.08, 2.0, 15.9, -Math.PI / 2, 1.2);
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
    plantAt(DECK2, Q.x1 - 0.45, -3.8, 1.0); d2obs(Q.x1 - 0.45, -3.8, 0.3);
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
  plantAt(DECK2, x0 + 0.45, Z(6.3), 0.85); d2obs(x0 + 0.45, Z(6.3), 0.3);
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
    plantAt(DECK2, Q.x0 + 0.42, PZ - 0.35, 0.9); d2obs(Q.x0 + 0.42, PZ - 0.35, 0.3);
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
  });
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
  // sideboard and the ship's crest on the aft wall
  mesh(RBOX(3.6, 0.9, 0.5, 0.03), WOOD, cx, 0.45, W2.z1 - 0.3, DECK2); mesh(RBOX(3.66, 0.04, 0.54, 0.01), MAT.gunDark, cx, 0.92, W2.z1 - 0.3, DECK2);
  d2seg(cx - 1.8, W2.z1 - 0.55, cx + 1.8, W2.z1 - 0.55, 0.3);
  [-1.2, -0.9, 1.0].forEach((x, i) => mesh(lathe(i === 2 ? [[0, 0], [0.07, 0], [0.08, 0.12], [0.03, 0.28], [0.03, 0.34], [0, 0.34]] : [[0, 0], [0.04, 0], [0.045, 0.1], [0, 0.1]], 18), i === 2 ? GLASS : CERAMIC, cx + x, 0.94, W2.z1 - 0.3, DECK2));
  { const c = cnv(512, 512), x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#8a6a44'); gr.addColorStop(1, '#5e462c'); x.fillStyle = gr; x.fillRect(0, 0, 512, 512);
    x.strokeStyle = 'rgba(255,230,190,0.6)'; x.lineWidth = 6; x.strokeRect(18, 18, 476, 476); drawCrest(x, 256, 210, 130, '#f3dcb4', 8);
    x.fillStyle = '#f7e6c8'; x.textAlign = 'center'; x.font = `600 40px ${DISP}`; x.fillText('U.S.S. DEFIANCE', 256, 400); x.font = `500 26px ${DISP}`; x.fillText('STEADY UNDER FIRE', 256, 446);
    const m = mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshStandardMaterial({ map: tex(c), metalness: 0.7, roughness: 0.35 }), cx, 1.8, W2.z1 - 0.08, DECK2); m.rotation.y = Math.PI; }
  // wall screen on the port side: the mess board
  const sg = group(W2.x0 + 0.1, 1.5, cz, Math.PI / 2, DECK2); display(sg, 1.5, 0.84, 720, 404, 'mess', 'wardroom', 'Wardroom', 'WRD·01');
  plantAt(DECK2, W2.x0 + 0.5, W2.z1 - 0.5, 1.1); plantAt(DECK2, W2.x1 - 0.5, W2.z1 - 0.5, 1.1); d2obs(W2.x0 + 0.5, W2.z1 - 0.5, 0.3); d2obs(W2.x1 - 0.5, W2.z1 - 0.5, 0.3);
}

// ---------- officers' passage and observation lounge ----------
// From the corridor's aft end a short passage turns to port, then runs aft along the wardroom's port side, past the
// sealed turret capacitor bank, to the observation lounge across the stern of the spine.
function d2frames(x0, x1, z0, z1, H) { // structural frames every 2.4 m along z, a light panel between each, handrails
  const cx = (x0 + x1) / 2;
  for (let z = z0 + 1.2; z < z1 - 0.4; z += 2.4) {
    [x0 + 0.05, x1 - 0.05].forEach((x) => mesh(RBOX(0.1, H - 0.05, 0.16, 0.02), MAT.gunDark, x, (H - 0.05) / 2, z, DECK2));
    mesh(RBOX(x1 - x0, 0.12, 0.16, 0.02), MAT.gunDark, cx, H - 0.06, z, DECK2);
    if (z + 1.2 < z1 - 0.5) d2panel(cx, z + 1.2, H, 0.9, 0.36);
  }
}
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
  { const r = mesh(CYL(0.022, 0.022, P.az1 - P.z1 - 0.6, 10), MAT.steel, P.ax1 - 0.06, 0.95, (P.z1 + P.az1) / 2, DECK2); r.rotation.x = Math.PI / 2; }
  d2label('AFT · OBSERVATION LOUNGE', P.ax0 + 0.08, 2.0, 16.0, Math.PI / 2, 1.2);
  doorAt(P.ax0, P.cap, Math.PI / 2, 'TURRET CAPACITORS', 'capbank', false, true, DECK2, 2);
  doorAt(D2_LNG.door, P.az1, Math.PI, 'OBSERVATION LOUNGE', 'lngdoor', true, true, DECK2, 2);
}
{
  const L = D2_LNG, H = D2H, cx = (L.x0 + L.x1) / 2, WY0 = 0.75, WY1 = 2.35;
  d2room('Observation lounge', L.x0, L.x1, L.z0, L.z1, H, d2RoomWall, MAT.roomCarpet, {
    n: [{ a: L.door - 0.6 - L.x0, b: L.door + 0.6 - L.x0, y0: 0, y1: 2.3 }],
    s: [{ a: 0.6, b: 10.6, y0: WY0, y1: WY1 }],
  });
  const vp = group(cx, 0, L.z1 - 0.06, 0, DECK2); viewport(vp, -5.0, 5.0, WY0, WY1, 0);
  SHUTTERS[SHUTTERS.length - 1].hideOpen = true; // the lounge's shutters fold away completely when open, so nothing crosses the view
  // the sill ledge under the window, with swivel chairs facing out
  mesh(RBOX(9.8, 0.05, 0.42, 0.015), WOOD, cx, WY0 + 0.02, L.z1 - 0.32, DECK2);
  mesh(RBOX(9.8, WY0 - 0.05, 0.3, 0.02), MAT_PED, cx, (WY0 - 0.05) / 2, L.z1 - 0.22, DECK2);
  mesh(BOX(9.6, 0.016, 0.016), STRIP, cx, 0.06, L.z1 - 0.38, DECK2);
  d2seg(L.x0 + 0.4, L.z1 - 0.53, L.x1 - 0.4, L.z1 - 0.53, 0.3);
  [-4.0, -2.4, -0.8, 1.2, 2.8, 4.4].forEach((x) => { d2chair(x, L.z1 - 1.0, Math.PI, MAT.leather, 'station'); d2obs(x, L.z1 - 1.0, 0.26); });
  // small round tables, three chairs each
  [[-2.5, 27.5, 0.3], [1.1, 26.9, 1.1], [3.9, 27.6, 0.7]].forEach(([tx, tz, a0], i) => {
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
  { const g = group(1.6, 1.55, L.z0 + 0.1, 0, DECK2); display(g, 1.7, 0.95, 720, 402, 'lounge', 'lounge', 'Observation lounge', 'OBS·01'); }
  plantAt(DECK2, L.x0 + 0.45, L.z1 - 1.2, 1.1); d2obs(L.x0 + 0.45, L.z1 - 1.2, 0.3);
  plantAt(DECK2, L.x0 + 0.45, L.z0 + 1.6, 1.0); d2obs(L.x0 + 0.45, L.z0 + 1.6, 0.3);
  plantAt(DECK2, -0.6, L.z0 + 0.45, 1.0); d2obs(-0.6, L.z0 + 0.45, 0.3);
  [-3.6, -1.0, 1.6, 4.2].forEach((x) => d2down(x, L.z1 - 1.0, H)); d2down(-3.9, 25.4, H); d2down(1.6, 25.3, H);
}

// ---------- outside: the set piece seen through Deck 2's windows ----------
// A simple, original stand-in for the exterior until the real model is built, following the bridge's systems display:
// a long swept hull back under the officers' spine (its top just below every window sill), the raised arch aft of the
// lounge with the dorsal turret on its crown, and slim nacelles on swept spars, low and aft. Matcap materials
// (a painted ball of light, no scene lights) and additive glows: the light bake ignores all of it (bake_export skips EXTSET).
const EXTSET = group(0, 0, 0, 0, DECK2); EXTSET.name = 'Exterior set piece';
{
  const mc = cnv(256, 256), m = mc.getContext('2d');
  { const g = m.createRadialGradient(92, 84, 8, 128, 128, 128); g.addColorStop(0, '#f2efe8'); g.addColorStop(0.45, '#b8bbbf'); g.addColorStop(0.8, '#6b717a'); g.addColorStop(1, '#3a4049'); m.fillStyle = g; m.fillRect(0, 0, 256, 256);
    const r = m.createRadialGradient(190, 200, 10, 190, 200, 90); r.addColorStop(0, 'rgba(232,160,106,0.28)'); r.addColorStop(1, 'rgba(232,160,106,0)'); m.fillStyle = r; m.fillRect(0, 0, 256, 256); }
  const plate = cnv(512, 512), q = plate.getContext('2d'), rr = mulberry(1701);
  q.fillStyle = '#d9d9d6'; q.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) { const v = 200 + ((rr() * 30) | 0); q.fillStyle = `rgb(${v},${v},${v - 4})`; q.fillRect((rr() * 8 | 0) * 64, (rr() * 8 | 0) * 64, 64 * (1 + (rr() * 3 | 0)), 64 * (1 + (rr() * 2 | 0))); }
  q.strokeStyle = 'rgba(40,44,52,0.18)'; q.lineWidth = 2; for (let k = 0; k <= 512; k += 64) { q.beginPath(); q.moveTo(k, 0); q.lineTo(k, 512); q.stroke(); }
  for (let k = 0; k <= 512; k += 128) { q.beginPath(); q.moveTo(0, k + ((k / 128) % 2) * 32); q.lineTo(512, k + ((k / 128) % 2) * 32); q.stroke(); }
  const pt = tex(plate); pt.wrapS = pt.wrapT = THREE.RepeatWrapping; pt.colorSpace = THREE.SRGBColorSpace;
  const HULL = new THREE.MeshMatcapMaterial({ matcap: tex(mc), map: pt, fog: false });
  const DARK = new THREE.MeshMatcapMaterial({ matcap: tex(mc), color: 0x6a7078, fog: false });
  const glow = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false });
  const GRILLE = glow(0x6fb6e6, 0.85), CAP = glow(0xe0704a, 0.9), IMP = glow(0xd2503c, 0.8);
  const lerpT = (T, z) => { for (let i = 1; i < T.length; i++) if (z <= T[i][0]) { const [z0, a] = T[i - 1], [z1, b] = T[i], t = (z - z0) / (z1 - z0); return a + (b - a) * t * t * (3 - 2 * t); } return T[T.length - 1][1]; };
  const W = [[-64, 0.5], [-58, 24], [-30, 40], [14, 46], [48, 40], [76, 20], [132, 14], [136, 9]]; // half-beam
  const Y = [[-64, -14], [-34, -3.5], [-4, -0.6], [86, -0.7], [118, -4], [136, -9.5]];              // top of the hull back
  // the hull back: a grid across the beam, falling away at the edges into a skirt
  { const NZ = 90, NX = 30, pos = [], uv = [], idx = [];
    for (let i = 0; i <= NZ; i++) { const z = -64 + 200 * i / NZ, w = lerpT(W, z), y0 = lerpT(Y, z);
      for (let j = 0; j <= NX; j++) { const v = j / NX * 2 - 1, a = Math.abs(v), x = v * w * (a > 0.85 ? 1 - (a - 0.85) * 0.5 : 1), y = y0 - 5 * Math.pow(Math.min(a, 0.85) / 0.85, 2.6) - (a > 0.85 ? (a - 0.85) / 0.15 * 9 : 0);
        pos.push(x, y, z); uv.push(x / 34, z / 34); } }
    for (let i = 0; i < NZ; i++) for (let j = 0; j < NX; j++) { const a = i * (NX + 1) + j, b = a + NX + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const hm = new THREE.Mesh(g, HULL); hm.material.side = THREE.DoubleSide; EXTSET.add(hm); }
  // sweep a rounded box section along a path: P = [[x, y, z]...], sec(t) = [half width, half thickness], side = lateral axis
  function sweep(P, sec, side, n) {
    const curve = new THREE.CatmullRomCurve3(P.map((p) => new THREE.Vector3(...p))), N = n || 40, R = 12, pos = [], idx = [], S = new THREE.Vector3(...side).normalize();
    for (let i = 0; i <= N; i++) { const t = i / N, c = curve.getPointAt(t), T = curve.getTangentAt(t), U = new THREE.Vector3().crossVectors(T, S).normalize(), L = new THREE.Vector3().crossVectors(U, T).normalize(), [hw, ht] = sec(t);
      for (let k = 0; k < R; k++) { const a = k / R * Math.PI * 2, cx = Math.cos(a), cy = Math.sin(a), ex = Math.sign(cx) * Math.pow(Math.abs(cx), 0.45) * hw, ey = Math.sign(cy) * Math.pow(Math.abs(cy), 0.45) * ht;
        pos.push(c.x + L.x * ex + U.x * ey, c.y + L.y * ex + U.y * ey, c.z + L.z * ex + U.z * ey); } }
    for (let i = 0; i < N; i++) for (let k = 0; k < R; k++) { const a = i * R + k, b = i * R + (k + 1) % R; idx.push(a, a + R, b, b, a + R, b + R); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  // the arch over the back: two rails rising from the hull either side of the centreline, joined at the crown by the
  // turret deck, so from the lounge it frames the view aft like a gate; in side view it is the MSD's arch
  [-1, 1].forEach((sd) => EXTSET.add(new THREE.Mesh(sweep([[sd * 7.5, -1.5, 47], [sd * 6.5, 6.5, 54], [sd * 5.2, 11, 65], [sd * 5.2, 11, 73], [sd * 6.5, 6.5, 84], [sd * 7.5, -1.5, 91]], (t) => { const e = Math.abs(t - 0.5) * 2; return [0.9 + Math.pow(e, 3) * 1.6, 0.6 + Math.pow(e, 3) * 0.9]; }, [1, 0, 0], 40), DARK)));
  mesh(RBOX(11.4, 0.9, 9.0, 0.3), DARK, 0, 11.1, 69, EXTSET);
  mesh(BOX(11.0, 0.12, 0.3), GRILLE, 0, 10.6, 64.4, EXTSET);
  { const tg = group(0, 11.55, 69, 0, EXTSET);
    mesh(lathe([[0, 0], [3.0, 0], [3.1, 0.5], [2.7, 1.5], [1.6, 2.2], [0, 2.4]], 36), DARK, 0, 0, 0, tg);
    mesh(new THREE.TorusGeometry(2.95, 0.12, 6, 40), GRILLE, 0, 0.55, 0, tg).rotation.x = Math.PI / 2;
    [-0.7, 0.7].forEach((x) => { const b = mesh(CYL(0.28, 0.36, 6.5, 12), DARK, x, 1.3, -3.6, tg); b.rotation.x = Math.PI / 2; mesh(CYL(0.2, 0.2, 0.1, 10), GRILLE, x, 1.3, -6.85, tg).rotation.x = Math.PI / 2; }); }
  // a low dorsal strake running aft down the centreline, and dark sensor strips along the shoulders
  mesh(RBOX(2.2, 0.6, 80, 0.25), DARK, 0, -0.55, 70, EXTSET);
  [-1, 1].forEach((sd) => { const st = mesh(BOX(0.6, 0.1, 50), DARK, sd * 18, -3.0, 70, EXTSET); st.rotation.z = sd * 0.35; });
  // spars and nacelles, low and aft
  [-1, 1].forEach((sd) => {
    EXTSET.add(new THREE.Mesh(sweep([[sd * 14, -3.5, 72], [sd * 26, -4.6, 84], [sd * 38, -5.8, 96], [sd * 46, -6.2, 104]], (t) => [3.2 - t * 1.4, 0.5], [0, 1, 0], 20), DARK));
    const ng = group(sd * 48, -6.3, 70, 0, EXTSET);
    const prof = [[0, 0], [1.3, 0.25], [2.1, 1.0], [2.5, 2.4], [2.6, 5], [2.6, 50], [2.3, 58], [1.4, 64], [0, 65]];
    const nm = mesh(lathe(prof, 32), HULL, 0, 0, 0, ng); nm.rotation.x = Math.PI / 2;
    const cap = mesh(lathe([[0, 0], [1.35, 0.28], [2.05, 1.0], [2.4, 2.2], [0, 2.4]], 28), CAP, 0, 0, 0, ng); cap.rotation.x = Math.PI / 2; cap.scale.setScalar(1.02);
    [-1, 1].forEach((up) => { const gr = mesh(BOX(0.18, 0.5, 40), GRILLE, -sd * 2.55, up * 0.8, 28, ng); gr.rotation.z = -sd * up * 0.3; });
    mesh(new THREE.SphereGeometry(0.35, 10, 8), glow(sd < 0 ? 0xff4a3a : 0x5aff7a, 1), sd * 2.7, 0, 60, ng);
  });
  mesh(BOX(14, 1.4, 0.4), IMP, 0, -6.5, 135.8, EXTSET);
  EXTSET.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.userData.noPick = true; } });
}
DECK2.updateMatrixWorld(true);

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
// level and alert colour can be changed live without re-baking. Files: bake/*.png and bake/bake.json.
// Files share one global scope and load in order (see index.html).
'use strict';

const BAKE = { ok: false, receivers: [], atlas: null, failed: false };
const BKU = {
  bkW: { value: new THREE.Color(0, 0, 0) }, bkS: { value: new THREE.Color(0, 0, 0) }, bkIbl: { value: 1 },
  bkLmW: { value: null }, bkLmS: { value: null }, bkLmMax: { value: new THREE.Vector2(1, 1) },
  bkPr: { value: null }, bkPrMin: { value: new THREE.Vector3() }, bkPrInv: { value: 1 }, bkPrDim: { value: new THREE.Vector3(1, 1, 1) }, bkPrMax: { value: new THREE.Vector2(1, 1) },
};

// ---------- which surfaces get a light map: big flat opaque surfaces of the fixed rooms ----------
const PLANAR = { PlaneGeometry: 1, ShapeGeometry: 1, CircleGeometry: 1 };
function bakeLive(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }
function isReceiver(o) {
  if (!o.isMesh || o.layers.mask !== 1 || !PLANAR[o.geometry.type] || Array.isArray(o.material)) return false;
  const m = o.material; if (!m.isMeshStandardMaterial || m.transparent || !bakeLive(o)) return false;
  o.geometry.computeBoundingBox(); const s = new THREE.Vector3(); o.geometry.boundingBox.getSize(s);
  return s.x * s.y + s.y * s.z + s.x * s.z > 0.25;
}
// Lay every receiver out in one atlas. Coplanar pieces (a wall split by a door) share one rectangle.
// Deterministic: the same scene always gives the same layout, which the bake tool relies on.
function buildAtlas() {
  scene.updateMatrixWorld(true);
  const groups = new Map(), list = [], seenGeo = new Set(), PAD = 3, AW = 2048;
  scene.traverse((o) => { if (isReceiver(o)) list.push(o); });
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
  BAKE.receivers = list;
  BAKE.atlas = { w: AW, h: AH, rects: G.length, sig: G.map((g) => g.w + 'x' + g.h).join(';').length + ':' + list.length };
}

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
let _envRT = null;
function bakeEnv() {
  if (!BAKE.ok) return;
  if (typeof LIFT !== 'undefined' && LIFT.deck !== 1) { LIFT.envStale = true; return; } // redone on the way back to Deck 1
  const crt = new THREE.WebGLCubeRenderTarget(isMobile ? 96 : 160, { type: THREE.HalfFloatType });
  const cc = new THREE.CubeCamera(0.05, 40, crt); cc.position.set(0, 1.75, 0.6);
  const fog = scene.fog, env = scene.environment; scene.fog = null; scene.environment = null;
  BKU.bkIbl.value = 0; cc.update(renderer, scene);
  const pm = new THREE.PMREMGenerator(renderer), rt2 = pm.fromCubemap(crt.texture); pm.dispose(); crt.dispose();
  if (_envRT) _envRT.dispose(); _envRT = rt2;
  if (env && env !== rt2.texture && env.dispose) env.dispose();
  scene.environment = rt2.texture; scene.environmentIntensity = BAKE.meta.env ?? 1; scene.fog = fog;
}

// ---------- load ----------
function bakeImg(url) { return new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; }); }
function bakeTex(img) { const t = new THREE.Texture(img); t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; t.needsUpdate = true; return t; }
function bakePixels(img) { const c = cnv(img.width, img.height), g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height).data; }
buildAtlas();
BAKE.ready = (async () => {
  await SURF.ready(); // textures first, so every material is final before it is patched
  if (window.DEFIANCE_NO_BAKE) throw new Error('bake disabled');
  const meta = await (await fetch('bake/bake.json')).json();
  if (meta.atlas.w !== BAKE.atlas.w || meta.atlas.h !== BAKE.atlas.h || meta.atlas.sig !== BAKE.atlas.sig) throw new Error('bake does not match the scene; re-run the bake (see README)');
  const [lw, ls, pw, ps] = await Promise.all(['lm_w', 'lm_s', 'pr_w', 'pr_s'].map((n) => bakeImg('bake/' + n + '.png')));
  BAKE.meta = meta;
  BKU.bkLmW.value = bakeTex(lw); BKU.bkLmS.value = bakeTex(ls); BKU.bkLmMax.value.set(meta.lm_max[0], meta.lm_max[1]);
  // probes: the image stacks six direction blocks; rebuild them side by side in one 3D texture
  const [X, Y, Z] = meta.grid.dims, a = bakePixels(pw), b = bakePixels(ps), d = new Uint8Array(6 * X * Y * Z * 4);
  for (let f = 0; f < 6; f++) for (let y = 0; y < Y; y++) for (let z = 0; z < Z; z++) for (let x = 0; x < X; x++) {
    const s = (((f * Y + y) * Z + z) * X + x) * 4, t = ((z * Y + y) * 6 * X + f * X + x) * 4;
    d[t] = a[s]; d[t + 1] = a[s + 1]; d[t + 2] = a[s + 2]; d[t + 3] = b[s];
  }
  const pt = new THREE.Data3DTexture(d, 6 * X, Y, Z); pt.minFilter = pt.magFilter = THREE.LinearFilter; pt.unpackAlignment = 1; pt.needsUpdate = true;
  BKU.bkPr.value = pt; BKU.bkPrMin.value.fromArray(meta.grid.origin); BKU.bkPrInv.value = 1 / meta.grid.step; BKU.bkPrDim.value.set(X, Y, Z); BKU.bkPrMax.value.set(meta.pr_max[0], meta.pr_max[1]);
  // patch materials: receivers get the light map; every other lit interior material reads the probes
  const recv = new Set(BAKE.receivers), mats = new Map();
  scene.traverse((o) => {
    if (!o.isMesh || !(o.layers.mask & 1)) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      if (!m || !m.isMeshStandardMaterial || m.userData.noBake) return; // the lift car and lobbies carry their own light (lift.js)
      const e = mats.get(m) || { r: 0, o: 0 }; recv.has(o) ? e.r++ : e.o++; mats.set(m, e);
    });
  });
  const lmCopy = new Map();
  mats.forEach((e, m) => { if (e.o) bakePatch(m, 'pr'); else bakePatch(m, 'lm'); });
  BAKE.receivers.forEach((o) => {
    if (o.material.userData.bk === 'lm') return;
    // the copy keeps the material's own patches but not its probe patch (two bake patches would redefine the uniforms)
    let c = lmCopy.get(o.material); if (!c) { c = copyPatches(o.material, o.material.clone()); c._patches = c._patches.filter((q) => !q.key.startsWith('bk-')); c.userData = {}; bakePatch(c, 'lm'); lmCopy.set(o.material, c); }
    o.material = c;
  });
  DECALS.forEach((m) => { m.visible = false; });
  BAKE.ok = true;
  return true;
})().catch((e) => { console.warn('Baked lighting unavailable, using fallback light:', e.message); BAKE.failed = true; return false; });
// render.js finishes the hand-over (applyLights, reflections) once every file has loaded.

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
  const d1 = LIFT.deck === 1, segs = d1 ? WALL_SEGS : LIFT.deck === 2 ? D2.segs : LIFT.stubSegs, obs = d1 ? obstacles : LIFT.deck === 2 ? D2.obs : [], ds = LIFT.doorSeg;
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
const floorH = (x, z) => (inCar(x, z) ? LIFT.root.position.y : deckY(LIFT.deck) + (LIFT.deck === 1 && Math.hypot(x - DAIS.x, z - DAIS.z) < DAIS.r + 0.02 ? DAIS.h : 0));

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
  return [['DORSAL TURRET', ...beam(b.dorsal, 'dorsal')], ['VENTRAL ARRAY', ...beam(b.ventral, 'ventral')], ['TORP BAY 1', ...tube(bay[0])], ['TORP BAY 2', ...tube(bay[1])], ['TARGET LOCK', 'NONE', P.dim]];
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
    lab(0.585, 0.26, 0.66, 0.06, 'DORSAL TURRET', zoneStatus('dorsal') === 'ok' ? P.txt : zcol(P, 'dorsal'));
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
  const ch = [['DORSAL TURRET', sim.beams.dorsal, P.acc], ['VENTRAL ARRAY', sim.beams.ventral, P.acc], ['BAY 1 LOAD', sim.bays[0].reload, P.ice], ['BAY 2 LOAD', sim.bays[1].reload, P.ice]];
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
  table(g, sub(g, a, 'VIEW AFT', P.acc, P), [['DORSAL TURRET', red ? 'MANNED' : 'STOWED', red ? P.red : P.txt], ['PORT NACELLE', warp ? 'WARP FIELD' : 'IDLE'], ['STBD NACELLE', warp ? 'WARP FIELD' : 'IDLE'], ['SHUTTERS', red ? 'CLOSED' : 'OPEN', red ? P.red : P.txt]], P);
  lights(g, sub(g, b, 'EXTERIOR', P.ice, P), [['RUNNING LIGHTS', 'ok'], ['ARCH FLOODS', red ? 'off' : 'ok'], ['NACELLE GRILLES', warp ? 'act' : 'ok'], ['TURRET', red ? 'alert' : 'off']], P);
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
// A cutaway of the Defiance: a long swept primary hull flowing into the engineering section, a raised arch over the
// back carrying the dorsal turret, and slim nacelles slung low and aft on swept spars. Original design, in the spirit of
// the sleek late-century cruisers. Left panel: side cutaway with every deck and compartment, callouts and live damage.
// Right panel: plan view with live shield arcs and the warp field, deck index and readouts.
// The hull and compartments are drawn once into a cached layer per alert/damage state; live parts are drawn on top.
const MSD_ROOMS = [ // [deck, from m, to m, kind] from the deck plan (docs/master-systems-display.html)
  [1, 49, 63, 'w'], [1, 63, 66, 'w'], [1, 66, 73, 'w'], [1, 73, 79, 'w'],
  [2, 32, 44, 's'], [2, 44, 60, 'w'], [2, 60, 66, 'w'], [2, 66, 80, 'l'], [2, 80, 96, 'w'], [2, 96, 113, 'x'], [2, 113, 136, 'l'], [2, 136, 150, 'l'],
  [3, 14, 28, 's'], [3, 28, 46, 'l'], [3, 46, 58, 'l'], [3, 58, 66, 's'], [3, 66, 96, 'l'], [3, 96, 113, 'x'], [3, 113, 127, 's'], [3, 127, 160, 'l'],
  [4, 6, 22, 's'], [4, 22, 44, 'l'], [4, 44, 70, 'l'], [4, 70, 82, 'l'], [4, 82, 96, 'l'], [4, 96, 116, 's'], [4, 116, 124, 's'], [4, 124, 150, 's'], [4, 150, 182, 's'],
  [5, 2, 18, 'x'], [5, 18, 32, 'x'], [5, 32, 46, 'x'], [5, 46, 62, 's'], [5, 62, 78, 'l'], [5, 78, 100, 'l'], [5, 100, 116, 's'], [5, 116, 124, 's'], [5, 124, 168, 'e'], [5, 168, 190, 's'],
  [6, 4, 18, 's'], [6, 18, 30, 's'], [6, 30, 50, 'x'], [6, 50, 70, 's'], [6, 70, 100, 'l'], [6, 100, 116, 's'], [6, 116, 124, 's'], [6, 124, 160, 'e'], [6, 160, 194, 's'],
  [7, 60, 100, 'l'], [7, 100, 116, 'x'], [7, 116, 124, 's'], [7, 124, 166, 'e'], [7, 166, 198, 'e'],
  [8, 70, 104, 's'], [8, 104, 116, 'x'], [8, 116, 124, 's'], [8, 124, 140, 'e'], [8, 140, 152, 'e'], [8, 152, 176, 'e'], [8, 176, 198, 's'],
  [9, 110, 116, 's'], [9, 116, 124, 's'], [9, 124, 140, 's'], [9, 140, 152, 'e'], [9, 152, 199, 's'],
];
function msdPaths(X, Y) {
  const hull = new Path2D(); // the primary hull and engineering section as one long swept body
  hull.moveTo(X(0), Y(17)); hull.quadraticCurveTo(X(8), Y(9.5), X(30), Y(6.5)); hull.bezierCurveTo(X(60), Y(3.8), X(120), Y(3.2), X(150), Y(4.2));
  hull.bezierCurveTo(X(176), Y(5.2), X(190), Y(9), X(197), Y(13)); hull.lineTo(X(199.5), Y(16)); hull.lineTo(X(199.5), Y(27)); hull.quadraticCurveTo(X(198), Y(31), X(188), Y(32));
  hull.bezierCurveTo(X(165), Y(34), X(135), Y(34.5), X(110), Y(32)); hull.bezierCurveTo(X(80), Y(29.5), X(45), Y(27), X(22), Y(23.5)); hull.quadraticCurveTo(X(5), Y(21), X(0), Y(17)); hull.closePath();
  const bridge = new Path2D(); bridge.moveTo(X(44), Y(5.2)); bridge.bezierCurveTo(X(48), Y(1.4), X(51), Y(0.4), X(56), Y(0.2)); bridge.lineTo(X(72), Y(0.1)); bridge.bezierCurveTo(X(78), Y(0.4), X(81), Y(2.6), X(84), Y(4.8)); bridge.closePath();
  const arch = new Path2D(); // raised arch over the back, carrying the turret: a hole beneath shows open space
  arch.moveTo(X(88), Y(4.4)); arch.bezierCurveTo(X(92), Y(-4.5), X(100), Y(-6.4), X(110), Y(-6.6)); arch.bezierCurveTo(X(121), Y(-6.4), X(128), Y(-4.5), X(133), Y(4.6));
  arch.lineTo(X(127), Y(4.4)); arch.bezierCurveTo(X(123), Y(-1.6), X(117), Y(-2.8), X(110), Y(-2.9)); arch.bezierCurveTo(X(103), Y(-2.8), X(97), Y(-1.6), X(94), Y(4.3)); arch.closePath();
  const turret = new Path2D(); turret.moveTo(X(102), Y(-6.2)); turret.bezierCurveTo(X(103), Y(-10.2), X(117), Y(-10.2), X(118), Y(-6.2)); turret.closePath();
  const spar = new Path2D(); spar.moveTo(X(136), Y(31)); spar.lineTo(X(146), Y(31.5)); spar.lineTo(X(160), Y(38)); spar.lineTo(X(150), Y(38)); spar.closePath();
  const nac = new Path2D(); nac.moveTo(X(126), Y(40)); nac.bezierCurveTo(X(126), Y(37.4), X(129), Y(37), X(134), Y(37)); nac.lineTo(X(194), Y(37)); nac.quadraticCurveTo(X(200), Y(37.2), X(200), Y(40)); nac.quadraticCurveTo(X(200), Y(42.8), X(194), Y(43)); nac.lineTo(X(134), Y(43)); nac.bezierCurveTo(X(129), Y(43), X(126), Y(42.6), X(126), Y(40)); nac.closePath();
  return { hull, bridge, arch, turret, spar, nac };
}
function msdPlan(X, Z) { // top view, bow to the left; Z is across the beam
  const hull = new Path2D(); hull.moveTo(X(0), Z(0)); hull.bezierCurveTo(X(6), Z(-26), X(40), Z(-50), X(78), Z(-46)); hull.bezierCurveTo(X(112), Z(-42), X(130), Z(-30), X(140), Z(-20));
  hull.lineTo(X(196), Z(-14)); hull.lineTo(X(199), Z(-8)); hull.lineTo(X(199), Z(8)); hull.lineTo(X(196), Z(14)); hull.lineTo(X(140), Z(20));
  hull.bezierCurveTo(X(130), Z(30), X(112), Z(42), X(78), Z(46)); hull.bezierCurveTo(X(40), Z(50), X(6), Z(26), X(0), Z(0)); hull.closePath();
  const nacs = [-1, 1].map((sd) => { const p = new Path2D(); p.moveTo(X(126), Z(sd * 70)); p.quadraticCurveTo(X(127), Z(sd * 66), X(134), Z(sd * 66)); p.lineTo(X(196), Z(sd * 66.5)); p.quadraticCurveTo(X(200), Z(sd * 68), X(200), Z(sd * 70)); p.quadraticCurveTo(X(200), Z(sd * 72), X(196), Z(sd * 73.5)); p.lineTo(X(134), Z(sd * 74)); p.quadraticCurveTo(X(127), Z(sd * 74), X(126), Z(sd * 70)); p.closePath(); return p; });
  const spars = [-1, 1].map((sd) => { const p = new Path2D(); p.moveTo(X(132), Z(sd * 20)); p.lineTo(X(150), Z(sd * 18)); p.lineTo(X(172), Z(sd * 67)); p.lineTo(X(156), Z(sd * 67)); p.closePath(); return p; });
  return { hull, nacs, spars };
}
// draw a set of shapes with a single clean outline round their union: thick outline strokes first, fills on top
function msdUnion(g, paths, fill, line, lw) { g.lineJoin = 'round'; g.strokeStyle = line; g.lineWidth = lw * 2; paths.forEach((p) => g.stroke(p)); g.fillStyle = fill; paths.forEach((p) => g.fill(p)); }
// Layout (2048 x 820): left panel = plan view with shields and warp field, warp field geometry inset below;
// right panel = the side cutaway with stacked callout lists at its four corners, title top right.
const MSD_LISTS = {
  tl: [['SENSOR PALLET', 38, 6], ['FORWARD SHIELD GENERATOR', 20, 9], ['CAPTAIN’S QUARTERS', 52, 6], ['BRIDGE', 64, 2], ['LIFT 1', 64.5, 12], ['WARDROOM', 88, 6], ['CREW QUARTERS', 84, 16]],
  tr: [['TURRET CAPACITORS', 104, 4.5], ['COMPUTER CORE', 106, 14], ['DORSAL TURRET', 112, -8], ['SENIOR OFFICERS’ QUARTERS', 124, 6], ['SHIELD GENERATORS', 136, 13], ['OBSERVATION LOUNGE', 143, 6], ['LIFE SUPPORT', 166, 13], ['IMPULSE ENGINES', 197, 18]],
  bl: [['DEFLECTOR', 9, 20.5], ['TORPEDO BAYS', 8, 16], ['TORPEDO MAGAZINE', 25, 16], ['SICKBAY', 37, 9.5], ['ARMORY', 40, 16], ['CARGO BAY 1', 54, 20], ['MESS HALL', 57, 13]],
  br: [['CIC', 108, 25], ['VENTRAL ARRAY', 110, 29], ['LIFT 2', 120.5, 34], ['WARP CORE', 146, 27], ['MAIN ENGINEERING', 160, 23], ['NACELLE FIELD COILS', 172, 40], ['SHUTTLE MAINTENANCE', 186, 27], ['SHUTTLEBAY', 190, 30.5]],
};
const MSD = { key: '', base: null };
function msdGeom(W, H) {
  const u = W / 2048;
  const L = { x: 16 * u, y: 16 * u, w: 620 * u, h: H - 32 * u }, R = { x: 656 * u, y: 16 * u, w: W - 672 * u, h: H - 32 * u };
  const S = 5.3 * u, X = (m) => R.x + 140 * u + m * S, Y = (m) => R.y + 300 * u + m * S;
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
  msdUnion(g, [p.spar, p.nac, p.hull, p.bridge, p.arch, p.turret], '#120d12', P.txt, 2.6 * u);
  const clipDraw = (path, fn) => { g.save(); g.clip(path); fn(); g.restore(); };
  const KC = { w: [P.acc, P.butter], l: [P.ice, P.plum], s: [P.plum, P.ice], x: [P.rose, P.plum], e: [P.butter, P.acc] };
  const rooms = () => {
    const rr = mulberry(4242);
    g.fillStyle = '#1b141b'; g.fillRect(X(-2), Y(-12), 206 * S, 58 * S);
    MSD_ROOMS.forEach(([d, a, b, k]) => {
      const y0 = Y((d - 1) * 3.5) + 1.6 * u, y1 = Y(d * 3.5) - 1, cells = Math.max(1, Math.round((b - a) * S / (13 * u))), cwid = (b - a) * S / cells;
      for (let i = 0; i < cells; i++) {
        const x0 = X(a) + i * cwid + 1, w = cwid - 1.6 * u, [c1, c2] = KC[k];
        g.fillStyle = rr() < 0.72 ? c1 : c2; g.globalAlpha = k === 'w' ? 0.95 : 0.62 + rr() * 0.3; g.fillRect(x0, y0, w, y1 - y0); g.globalAlpha = 1;
        if (rr() < 0.55) { g.fillStyle = rr() < 0.5 ? 'rgba(0,0,0,0.45)' : 'rgba(255,240,220,0.35)'; g.fillRect(x0 + w * rr() * 0.5, y0 + (y1 - y0) * (0.35 + rr() * 0.3), w * (0.25 + rr() * 0.35), (y1 - y0) * 0.22); }
      }
    });
    for (let d = 0; d <= 12; d++) { g.fillStyle = '#000'; g.fillRect(X(-2), Y(d * 3.5) - 1.2 * u, 206 * S, 2 * u); }
    for (let m = 10; m < 200; m += 10) { g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(X(m), Y(-12), 1.6 * u, 58 * S); }
    // structures that run through several decks: lifts, the computer core, the EPS trunk, the torpedo tubes
    g.fillStyle = P.txt; g.fillRect(X(64), Y(0.4), 2.2 * S, Y(21) - Y(0.4)); g.fillRect(X(119.5), Y(3.5), 2.2 * S, Y(42) - Y(3.5));
    for (let d = 0; d < 6; d++) { g.fillStyle = '#000'; g.fillRect(X(64), Y(d * 3.5 + 1.7), 2.2 * S, 1.2 * u); }
    g.fillStyle = P.ice; g.fillRect(X(97), Y(7.2), X(115) - X(97), Y(17.4) - Y(7.2)); g.fillStyle = '#000'; for (let i = 0; i < 6; i++) g.fillRect(X(97), Y(7.6 + i * 1.7), X(115) - X(97), 0.5 * S);
    g.fillStyle = P.butter; g.fillRect(X(20), Y(19.2), X(143) - X(20), 0.55 * S); g.fillRect(X(110), Y(-3), 0.55 * S, Y(19.2) - Y(-3));
    g.fillStyle = P.rose; [16.2, 17.6].forEach((yy) => g.fillRect(X(1), Y(yy), X(18) - X(1), 0.7 * S));
    // shuttles parked in the bay
    g.fillStyle = P.butter; [158, 169, 180].forEach((m) => { rrect(g, X(m), Y(29), 8 * S, 2.2 * S, 1.4 * u); g.fill(); });
  };
  clipDraw(p.hull, rooms); clipDraw(p.bridge, rooms);
  clipDraw(p.arch, () => { g.fillStyle = P.plum; g.fillRect(X(85), Y(-8), 52 * S, 14 * S); g.fillStyle = P.ice; for (let i = 0; i < 12; i++) g.fillRect(X(90 + i * 3.6), Y(-7), 1.8 * S, 12 * S); g.fillStyle = P.butter; g.fillRect(X(85), Y(-3.4), 52 * S, 0.5 * S); });
  clipDraw(p.turret, () => { g.fillStyle = P.rose; g.fillRect(X(100), Y(-11), 20 * S, 5 * S); g.fillStyle = P.butter; g.fillRect(X(103), Y(-8.8), 14 * S, 0.8 * S); g.fillStyle = P.txt; g.fillRect(X(116), Y(-8.2), 4 * S, 0.5 * S); });
  clipDraw(p.spar, () => { g.fillStyle = P.plum; g.fillRect(X(130), Y(30), 32 * S, 9 * S); g.fillStyle = P.butter; g.fillRect(X(138), Y(33.6), 18 * S, 0.5 * S); });
  clipDraw(p.nac, () => { g.fillStyle = P.ice; g.fillRect(X(124), Y(36), 78 * S, 8 * S); g.fillStyle = P.plum; g.fillRect(X(124), Y(41.2), 78 * S, 3 * S); g.fillStyle = P.butter; for (let i = 0; i < 16; i++) g.fillRect(X(137 + i * 3.7), Y(37.6), 2 * S, 2.6 * S); g.fillStyle = P.rose; g.fillRect(X(124), Y(36), 8 * S, 8 * S); g.fillStyle = P.txt; g.fillRect(X(134), Y(40.6), 62 * S, 0.4 * S); });
  g.fillStyle = P.butter; for (let m = 26; m < 172; m += 3.2) { const yy = m < 60 ? 6.6 - (m - 26) * 0.07 : 4.3 + Math.max(0, m - 150) * 0.12; g.fillRect(X(m), Y(yy + 0.9), 0.7 * S, 0.45 * S); }
  g.fillStyle = P.red; g.fillRect(X(196.6), Y(16.5), 2.6 * S, Y(22) - Y(16.5)); g.fillStyle = P.butter; g.beginPath(); g.ellipse(X(9), Y(20.4), 4.5 * S, 1.6 * S, -0.25, 0, 7); g.fill();
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
  g.fillStyle = P.tan; g.font = `500 ${17 * u | 0}px ${DISP}`; g.fillText('BASTION CLASS · HEAVY ESCORT · 12 DECKS · CREW 140', R.x + R.w - colW - 22 * u, R.y + barH + 82 * u);
  hexTab(g, R.x + R.w - colW - 300 * u, R.y + R.h - barH - 34 * u, 280 * u, 24 * u, true, true); g.fillStyle = P.ice; g.fill(); g.fillStyle = '#000'; g.font = `600 ${16 * u | 0}px ${DISP}`; g.textAlign = 'center'; g.fillText('INTERIOR SYSTEMS OVERVIEW', R.x + R.w - colW - 160 * u, R.y + R.h - barH - 16 * u);
  // ---- left panel: plan view, and the warp field geometry inset ----
  const pl = msdPlan(PX, PZ);
  g.strokeStyle = P.plum; g.lineWidth = 1.8 * u; [1, 1.25, 1.5].forEach((k) => [-1, 1].forEach((sd) => { g.beginPath(); g.ellipse(PX(163), PZ(sd * 70), 42 * k * PS, 13 * k * PS, 0, 0, 7); g.stroke(); }));
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
  const k = 0.55 + 0.45 * Math.sin(t * (2 + warp * 7)); g.fillStyle = P.butter; g.globalAlpha = 0.5 + k * 0.5; g.fillRect(X(143), Y(17.6), 6 * S, Y(38) - Y(17.6)); g.globalAlpha = 1;
  g.fillStyle = P.txt; for (let i = 0; i < 5; i++) { const yy = 17.6 + ((t * (1.2 + warp * 5) + i * 4.1) % 20.4); g.fillRect(X(143), Y(yy), 6 * S, 0.5 * S); }
  // power running forward along the EPS trunk and up into the turret
  g.fillStyle = P.txt; for (let i = 0; i < 9; i++) { const f = ((t * 0.18 + i / 9) % 1); g.fillRect(X(143 - f * 123), Y(19.1), 2.2 * S, 0.75 * S); }
  for (let i = 0; i < 3; i++) { const f = ((t * 0.3 + i / 3) % 1); g.fillRect(X(109.8), Y(19.2 - f * 22), 0.75 * S, 1.4 * S); }
  // nacelle coils fire in sequence
  for (let i = 0; i < 16; i++) { if (((t * (4 + warp * 10) - i) % 16 + 16) % 16 < 2) { g.fillStyle = P.txt; g.fillRect(X(137 + i * 3.7), Y(37.6), 2 * S, 2.6 * S); } }
  // damage tints, and a scan bar crossing the cutaway
  const ZR = { prow: [0, 9, 26, 24], dorsal: [86, -11, 134, 5], ventral: [50, 25, 150, 35], engines: [124, 13, 200, 33] };
  Object.entries(ZR).forEach(([id, [a, y0, b, y1]]) => { const st = zoneStatus(id); if (st === 'ok') return; g.fillStyle = st === 'warn' ? P.yel : P.red; g.globalAlpha = 0.28 + 0.2 * Math.sin(t * 5); g.fillRect(X(a), Y(y0), X(b) - X(a), Y(y1) - Y(y0)); g.globalAlpha = 1; });
  ['portNac', 'stbdNac'].forEach((id, i) => { const st = zoneStatus(id); if (st === 'ok') return; g.fillStyle = st === 'warn' ? P.yel : P.red; g.globalAlpha = 0.35; g.fillRect(X(126), Y(36.5 + i * 3.3), X(200) - X(126), 3 * S); g.globalAlpha = 1; });
  const sx = X(((t * 14) % 220) - 10); g.fillStyle = P.butter; g.globalAlpha = 0.3; g.fillRect(sx, Y(-11), 4 * u, Y(44) - Y(-11)); g.globalAlpha = 1;
  // plan view: live shield arcs
  const up = sim.shields.up > 0.01;
  [['fwd', Math.PI * 0.75, Math.PI * 1.25], ['port', Math.PI * 1.25, Math.PI * 1.75], ['aft', -Math.PI * 0.25, Math.PI * 0.25], ['stbd', Math.PI * 0.25, Math.PI * 0.75]].forEach(([a, a0, a1]) => { const v = shieldNow(a), f = v / SIM.shield.max; g.strokeStyle = !up || v < 0.5 ? P.line : f > 0.5 ? P.ice : f > 0.2 ? P.yel : P.red; g.lineWidth = (sim.shields.reinforce === a ? 11 : 6) * u; g.beginPath(); g.ellipse(PX(100), PZ(0), 106 * PS, 86 * PS, 0, a0 + 0.07, a1 - 0.07); g.stroke(); });
  ['port', 'stbd'].forEach((id, i) => { const st = zoneStatus(id); if (st === 'ok') return; g.fillStyle = st === 'warn' ? P.yel : P.red; g.globalAlpha = 0.4; g.fillRect(PX(40), PZ(i ? 8 : -46), 100 * PS, 38 * PS); g.globalAlpha = 1; });
  // warp field geometry: readouts and moving numbers
  const iy = L.y + 486 * u, fx = L.x + colW + 40 * u;
  numGrid(g, { x: L.x + colW + 330 * u, y: iy + 24 * u, w: L.w - colW - 340 * u, h: 150 * u }, 61, P);
  table(g, { x: L.x + colW + 24 * u, y: iy + 168 * u, w: L.w - colW - 34 * u, h: 96 * u }, [['FIELD', warp > 0.5 ? 'WARP 6 · STABLE' : 'IDLE', warp > 0.5 ? P.acc : P.tan], ['COILS P/S', Math.round(sim.zones.portNac) + ' / ' + Math.round(sim.zones.stbdNac) + '%'], ['REACTOR', Math.round(reactorOut()) + ' U · ' + ALERTS[state.alert].short]], P);
  { const ph = t * (1 + warp * 4); g.fillStyle = P.butter; g.globalAlpha = 0.6; for (let i = 0; i < 3; i++) { const kk = ((ph * 0.3 + i / 3) % 1); g.fillRect(fx + 140 * u - 140 * u * kk, iy + 95 * u - 2 * u, 4 * u, 4 * u); g.fillRect(fx + 140 * u + 140 * u * kk, iy + 95 * u - 2 * u, 4 * u, 4 * u); } g.globalAlpha = 1; }
  // number table in the bottom middle, like a legend
  numGrid(g, { x: R.x + 462 * u, y: R.y + 616 * u, w: 236 * u, h: 140 * u }, 83, P);
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
  g.strokeStyle = P.plum; g.lineWidth = 3 * u; [-1, 1].forEach((sd) => [1, 1.2].forEach((k) => { g.beginPath(); g.ellipse(PX(163), PZ(sd * 70), 42 * k * PS, 12 * k * PS, 0, 0, 7); g.stroke(); }));
  const arcs = [['fwd', Math.PI * 0.75, Math.PI * 1.25], ['port', Math.PI * 1.25, Math.PI * 1.75], ['aft', -Math.PI * 0.25, Math.PI * 0.25], ['stbd', Math.PI * 0.25, Math.PI * 0.75]], up = sim.shields.up > 0.01;
  arcs.forEach(([a, a0, a1]) => { const v = shieldNow(a), f = v / SIM.shield.max; g.strokeStyle = !up || v < 0.5 ? P.line : f > 0.5 ? P.ice : f > 0.2 ? P.yel : P.red; g.lineWidth = (sim.shields.reinforce === a ? 16 : 9) * u; g.beginPath(); g.ellipse(PX(100), PZ(0), 112 * PS, 86 * PS, 0, a0 + 0.06, a1 - 0.06); g.stroke(); });
  msdUnion(g, [...pl.spars, ...pl.nacs, pl.hull], '#151014', P.txt, 2.4 * u);
  g.save(); g.clip(pl.hull); g.fillStyle = P.plum; g.fillRect(PX(0), PZ(-52), 200 * PS, 104 * PS);
  { const rr = mulberry(1212); for (let i = 0; i < 160; i++) { const a = rr() * 192, z = (rr() - 0.5) * 92; g.fillStyle = [P.ice, P.tan, P.plum, P.rose, P.ice][(rr() * 5) | 0]; g.globalAlpha = 0.85; g.fillRect(PX(a), PZ(z), (2 + rr() * 9) * PS, (1.5 + rr() * 5) * PS); } g.globalAlpha = 1; }
  for (let d = 0; d < 6; d++) { g.strokeStyle = '#000'; g.lineWidth = 2 * u; g.beginPath(); g.ellipse(PX(66), PZ(0), (14 + d * 11) * PS, (9 + d * 7.5) * PS, 0, 0, 7); g.stroke(); }
  g.fillStyle = P.acc; g.beginPath(); g.ellipse(PX(64), PZ(0), 13 * PS, 7 * PS, 0, 0, 7); g.fill(); g.restore();
  pl.nacs.forEach((n) => { g.save(); g.clip(n); g.fillStyle = P.ice; g.fillRect(PX(120), PZ(-80), 85 * PS, 160 * PS); for (let i = 0; i < 13; i++) { const on = ((t * 6 - i) % 13 + 13) % 13 < 3; g.fillStyle = on ? P.txt : P.butter; g.fillRect(PX(138 + i * 4.6), PZ(-80), 2.4 * PS, 160 * PS); } g.restore(); });
  pl.spars.forEach((sp) => { g.save(); g.clip(sp); g.fillStyle = P.plum; g.fillRect(PX(120), PZ(-80), 80 * PS, 160 * PS); g.restore(); });
  // power conduits: blocks running from the core to the nacelles, the turret and the shield generators
  const core = [146, 0], routes = [[[146, 0], [150, -20], [164, -66]], [[146, 0], [150, 20], [164, 66]], [[146, 0], [110, 0], [64, 0]], [[146, 0], [140, -26]], [[146, 0], [140, 26]]];
  routes.forEach((rt, ri) => { for (let i = 0; i + 1 < rt.length; i++) { const [a, b] = [rt[i], rt[i + 1]], L2 = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L2 / 3)); for (let k = 0; k < n; k++) { const f = ((k / n) + t * (0.35 + ri * 0.04)) % 1, x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f, on = ((k + Math.floor(t * 9)) % 4) === 0; g.fillStyle = on ? P.txt : ri < 2 ? P.butter : ri === 2 ? P.acc : P.ice; rrect(g, PX(x) - 3.2 * u, PZ(z) - 3.2 * u, 6.4 * u, 6.4 * u, 1.5 * u); g.fill(); } } });
  { const k = 0.6 + 0.4 * Math.sin(t * (2 + smooth(30, 300, cur.speed) * 7)); g.fillStyle = P.butter; g.globalAlpha = 0.5 + 0.5 * k; g.beginPath(); g.arc(PX(core[0]), PZ(core[1]), 11 * u, 0, 7); g.fill(); g.globalAlpha = 1; }
  // zone damage over the plan
  const ZP = { prow: [0, -14, 22, 28], dorsal: [92, -10, 40, 20], ventral: [60, -18, 80, 36], port: [30, -48, 110, 22], stbd: [30, 26, 110, 22], engines: [150, -16, 50, 32], portNac: [124, -76, 76, 12], stbdNac: [124, 64, 76, 12] };
  Object.entries(ZP).forEach(([id, [a, z, w, d]]) => { const st = zoneStatus(id); if (st === 'ok') return; g.fillStyle = st === 'warn' ? P.yel : P.red; g.globalAlpha = 0.3 + 0.2 * Math.sin(t * 5); g.fillRect(PX(a), PZ(z), w * PS, d * PS); g.globalAlpha = 1; });
  // callouts round the plan
  g.font = `500 ${15 * u | 0}px ${DISP}`; g.textBaseline = 'middle';
  [['BRIDGE', 64, 0, -1, 0], ['WARP CORE', 146, 0, 1, 1], ['PORT NACELLE', 186, -70, -1, 0], ['STBD NACELLE', 186, 70, 1, 0], ['DORSAL TURRET', 110, -6, -1, 1], ['TORPEDO BAYS', 6, 0, 1, 0]].forEach(([lab, a, z, sd, row]) => { const px = PX(a), pz = PZ(z), ly = sd < 0 ? Y0 + (50 + row * 26) * u : PZ(0) + (205 + row * 26) * u; g.strokeStyle = P.ice; g.lineWidth = 2 * u; g.beginPath(); g.moveTo(px, pz); g.lineTo(px, ly); g.stroke(); g.fillStyle = P.butter; g.beginPath(); g.arc(px, pz, 4 * u, 0, 7); g.fill(); g.fillStyle = '#000'; const tw = g.measureText(lab).width; g.fillRect(px - tw / 2 - 4 * u, ly - 10 * u, tw + 8 * u, 20 * u); g.fillStyle = P.tan; g.textAlign = 'center'; g.fillText(lab, px, ly + 1); });
  // under the plan: deck status, numbers, a trace and buttons
  const by = PZ(0) + 270 * u, bw = cwid;
  for (let d = 1; d <= 12; d++) { const x = cx0 + (d - 1) * bw / 12, w = bw / 12 - 6 * u, on = d <= 2; hexTab(g, x, by, w, 26 * u, d === 1, d === 12); g.fillStyle = on ? P.acc : Math.sin(t * 0.8 + d * 2.1) > 0.7 ? P.butter : [P.tan, P.ice, P.plum][d % 3]; g.fill(); g.fillStyle = '#000'; g.font = `600 ${15 * u | 0}px ${DISP}`; g.textAlign = 'center'; g.fillText('D' + d, x + w / 2, by + 14 * u); }
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
function openStation(id) { state.open = id; ui.panel.style.setProperty('--fn', FUNC_CSS[FUNC[id] || 'acc']); ui.panel.hidden = false; ui.seatbar.hidden = true; beep([880, 1175], 0.05, 0.035); renderPanel(); updateHighlights(); }
function closePanel() { state.open = null; ui.acts.dataset.station = ''; ui.panel.hidden = true; ui.seatbar.hidden = !state.sitting; updateHighlights(); }
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
  { n: 3, name: 'Medical and officers', short: 'MEDICAL', rooms: ['Sickbay', 'Medical lab', 'Officers’ quarters', 'Forward shield generator'] },
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
  root: group(0, 0, 0, 0), stub: group(0, 0, 0, 0), deck1: null, envStale: false, k: -1,
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
    scene.children.slice().forEach((o) => { if (o !== LIFT.root && o !== LIFT.stub && o !== DECK2 && !o.userData.keep && !o.isLight && !o.isCamera) LIFT.deck1.add(o); });
    scene.add(LIFT.deck1);
  }
  LIFT.deck = n;
  if (LIFT.deck1) LIFT.deck1.visible = n === 1;
  DECK2.visible = n === 2;
  LIFT.stub.visible = n > 2; LIFT.stub.position.y = deckY(n);
  if (n === 1 && LIFT.envStale) { LIFT.envStale = false; bakeEnv(); }
  LIFT.panels.forEach(liftPanelDraw);
}
// each deck is 3.5 m below the one above; the car really travels between them
const deckY = (n) => -(n - 1) * 3.5;
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
  [LIFT.stubDoor, D2.door].forEach((s) => { s.L.position.x = -0.3 - LIFT.door * 0.56; s.Rr.position.x = 0.3 + LIFT.door * 0.56; });
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
  if (LIFT.deck === 2) { const r = D2.rooms.find((q) => player.x > q.x0 && player.x < q.x1 && player.z > q.z0 && player.z < q.z1); return `${r ? r.label : d.name} · Deck 2`; }
  if (LIFT.deck !== 1) return `${d.name} · Deck ${d.n}`;
  return (roomLabel || 'Main Bridge') + ' · Deck 1';
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
      note: LIFT.inside ? 'Deck 2 is the officers’ deck: quarters, the wardroom and the observation lounge. Decks 3 to 6 open onto a sealed lobby until they are built.' : 'Step into the car first.',
      acts: LIFT_DECKS.map((x) => ({ label: `${x.n} · ${x.short.charAt(0) + x.short.slice(1).toLowerCase()}`, on: x.n === LIFT.deck, disabled: x.n === LIFT.deck || LIFT.phase !== 'idle', fn: () => liftGo(x.n) })) };
  } },
  deckdir: { title: 'Deck directory', role: '', panel: () => {
    const d = liftDeck(LIFT.deck); STATIONS.deckdir.role = `Deck ${d.n} · ${d.name}`;
    if (d.n === 2) return { read: [['Open', d.rooms.join(', ')]].concat(d.sealed.length ? [['Still sealed', d.sealed.join(', ')]] : []), note: 'The captain’s quarters are forward through the door ahead of the lift. The corridor runs aft past the officers’ cabins to the wardroom; the passage to port at its end leads to the observation lounge.', acts: [] };
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
  wardoor: { title: 'Officers’ wardroom', role: 'Deck 2 · aft', panel: () => ({ read: [['Inside', 'Table for ten, sideboard, the ship’s crest'], ['Viewport', 'Starboard']], note: 'Walk up to the door to go in.', acts: [] }) },
  capbank: { title: 'Turret capacitor bank', role: 'Deck 2 · restricted', panel: () => ({ read: [['Access', 'Engineering only'], ['Charge', state.alert === 'red' ? 'Full, feeding the turret' : 'Held at 40%']], note: 'Power banks that feed the dorsal beam turret above. Sealed to everyone but engineering.', acts: [] }) },
  lngdoor: { title: 'Observation lounge', role: 'Deck 2 · aft', panel: () => ({ read: [['Inside', 'Window over the stern, tables, the bar'], ['View', 'The dorsal turret and both nacelles']], note: 'Walk up to the door to go in.', acts: [] }) },
  lounge: { title: 'Observation lounge', role: 'View aft', panel: () => ({ read: [['Dorsal turret', state.alert === 'red' ? 'Manned' : 'Stowed'], ['Nacelles', state.speed === 'warp' ? 'Warp field up' : 'Idle'], ['Shutters', state.alert === 'red' ? 'Closed for Red Alert' : 'Open']], note: 'The crew’s favourite window: the turret on its arch and both nacelles, aft.', acts: [] }) },
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
canvas.addEventListener('pointerdown', (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  const p = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, mode: 'look', type: e.pointerType };
  if (e.pointerType !== 'mouse' && e.clientX < window.innerWidth * 0.45 && !stick.active && !state.sitting) {
    p.mode = 'stick'; stick.active = true; stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stick.dx = stick.dy = 0;
    ui.stick.hidden = false; ui.stick.classList.remove('ghost'); ui.stick.classList.add('live');
    ui.stick.style.left = e.clientX + 'px'; ui.stick.style.top = e.clientY + 'px'; ui.knob.style.transform = '';
  }
  pointers.set(e.pointerId, p);
});
canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId); if (!p) return;
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
  if (p.moved < 10 && performance.now() - p.t < 450 && e.type === 'pointerup') interactAt(e.clientX, e.clientY);
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
  if (e.code === 'Escape') { if (!$('intro').hidden) hideIntro(); else closePanel(); }
  if ((e.code === 'KeyE' || e.code === 'Enter') && $('intro').hidden && target) openStation(target.station);
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

const controls = isTouch
  ? [['Look', 'Drag anywhere on the right side'], ['Walk', 'Drag the stick on the left side'], ['Use', 'Tap a station when you are close']]
  : [['Look', 'Drag with the mouse'], ['Walk', 'W A S D or the arrow keys'], ['Use', 'Click a station, or press E when it is centered']];
$('controls').replaceChildren(...controls.map(([k, v]) => { const li = document.createElement('li'); const b = document.createElement('b'); b.textContent = k; li.append(b, document.createTextNode(v)); return li; }));
function hideIntro() { $('intro').hidden = true; initAudio(); canvas.focus({ preventScroll: true }); }
$('board-btn').addEventListener('click', hideIntro);
$('help-btn').addEventListener('click', () => { $('intro').hidden = false; $('board-btn').textContent = 'Back to the bridge'; $('board-btn').focus(); });

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
    const near = d.auto && d.deck === LIFT.deck && !state.sitting && Math.hypot(camera.position.x - d.wx, camera.position.z - d.wz) < (d.room ? 1.7 : 1.5);
    if (d.station === 'lift') d.open = LIFT.door; // lift.js runs the lift doors
    else d.open += ((near ? 1 : 0) - d.open) * Math.min(1, dt * 5);
    d.L.position.x = -0.3 - d.open * 0.56; d.Rr.position.x = 0.3 + d.open * 0.56;
  });
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

  if (state.alert === 'red') {
    const k = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(elapsed * 4));
    stripMats.forEach((m) => m.color.setHex(ALERTS.red.strip).multiplyScalar(1.9 * k));
    slotMats.forEach((m) => m.color.setHex(ALERTS.red.slot).multiplyScalar(1.35 * (0.35 + 0.65 * k)));
    MAT.wall.emissiveIntensity = 0.3 + 0.7 * k;
    bakeLevels(LIGHT_LEVELS[state.light] * 0.28, 'red', ALERTS.red.strip, k);
  } else MAT.wall.emissiveIntensity = 0.7;

  if (AC && soundOn && elapsed > nextChirp) { nextChirp = elapsed + 3 + Math.random() * 6; const b = 1200 + Math.random() * 1200; beep(Math.random() < 0.5 ? [b, b * 1.25] : [b], 0.045, 0.012); }

  // screens: every frame, redraw a few of the visible ones, the nearest and longest-waiting first, so they all keep moving
  { _scrPM.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); _scrFr.setFromProjectionMatrix(_scrPM);
    const budget = isMobile ? 2 : 4, pick = [];
    for (const sc of screens) {
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

  scene.fog = null; renderer.setRenderTarget(rt); if (LIFT.deck === 1) renderer.render(scene, vcam);
  { const sk = LIGHT_LEVELS[state.light] * (state.alert === 'red' ? 0.5 : 1) * (1 + Math.sin(elapsed * 0.7) * 0.15); shaftMat.uniforms.k.value = 0.06 * sk; shafts[shafts.length - 1].material.uniforms.k.value = 0.035 * sk; }
  scene.fog = FOG; renderer.setRenderTarget(null);
  if (composer) composer.render(); else renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
setAlert('green');
requestAnimationFrame(frame);
// hand-over to the baked light once its files arrive (or to the fallback rig if they can't)
BAKE.ready.then((ok) => {
  if (ok) { renderer.shadowMap.enabled = false; applyLights(); } else { fallbackLights(); DECALS.forEach((m) => { m.visible = true; }); applyLights(); }
  window.DEFIANCE_BAKED = ok ? 'baked' : 'fallback';
});

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
