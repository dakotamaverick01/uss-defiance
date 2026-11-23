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
