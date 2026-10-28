# USS Defiance: Deck 1

A walkable 3D bridge deck for an original starship, built to run in a phone or desktop browser with no install.

**Live version:** https://claude.ai/artifact/SyjMcFGoRF6kLtFP77TPSr
**Run locally:** serve the folder with any static web server (for example `python3 -m http.server`) and open it in a browser. Opening `index.html` straight from disk won't work, because browsers block loading the `js/` files that way. It loads three.js from a CDN, so it needs an internet connection.

## The ship

The USS *Defiance* (EV-0408) is a Bastion-class heavy escort, an outgrowth of a compact wartime escort design, enlarged with improved engines and heavier weapons. It was built during the Hollow War for deep-space interdiction, heavy strike, and convoy escort. Motto: *Steady under fire.*

Everything here is original: the ship, its layout, the interface language, the insignia and the names. It is a fan-made work in the spirit of 24th-century starship design, not a copy of any studio's sets or graphics.

## What's on Deck 1

| Area | What you can do |
| --- | --- |
| **Bridge** | Sit at any station (helm, ops, tactical, science, engineering, comms, command chairs) and work its displays; trigger red alert; watch the viewscreen. |
| **Captain's ready room** | Read the captain's log at the desk, use the synthesizer, inspect the ship model, open or close the armored window shutters. |
| **Officer conference room** | Step through the briefing slides, read the battle honors plaque. |
| **Head** | Yes, the ship has a restroom. |
| **Turbolift** | Door and controls (other decks are not built yet). |

## Controls

- **Phone:** drag the stick on the left to walk, drag the right side to look, tap a station when you're close to use it.
- **Desktop:** W A S D or the arrow keys to walk, drag with the mouse to look, click a station (or press E when it's centered) to use it, Esc to close a panel.

## How it's built

[three.js](https://threejs.org/) 0.186, loaded from a CDN through an import map. There is no build step.

- **Code layout:** `index.html` holds the page, styles and a small loader. The ship's code lives in `js/`, one file per area, loaded in order and sharing one scope:

  | File | What it covers |
  | --- | --- |
  | `core.js` | Constants, renderer, shared helpers, ship state |
  | `materials.js` | Procedural textures, reflections, material library |
  | `bridge.js` | Bridge geometry: shell, consoles, seating, dais, viewscreen, aft wall |
  | `space.js` | The space scene shown on the viewscreen |
  | `rooms.js` | Ready room, conference room, head, window views |
  | `lighting.js` | Bridge light rig |
  | `collision.js` | Walking collision |
  | `screens.js` | Console screen drawing and the instrument widget kit |
  | `sound.js` | Synthesized ambience and interface sounds |
  | `ui.js` | Station panels, alerts, HUD |
  | `controls.js` | Movement, touch and mouse input, aiming |
  | `render.js` | Shadows, light shafts, dust, post-processing, hero shots, frame loop |

- **Rendering:** ACES filmic tone mapping, shadows, an environment map for reflections, bloom, and a vignette.
- **Screens:** every console display is drawn live onto an HTML canvas from a shared set of widgets (tables, bar graphs, dials, plots). Only screens near the player redraw, to keep phones smooth.
- **Viewscreen:** renders a separate space scene (starfield, nebula, planet, warp streaks) to a texture.
- **Collision:** walls and doors are line segments, and furniture is circles. Walls also block clicks, so you can't use a panel through a wall.
- **Sound:** generated in the browser with the Web Audio API. There are no sound files.
- **Hero shots:** six fixed camera positions used to judge each visual stage side by side. Run `DEFIANCE_HERO(1)` through `DEFIANCE_HERO(6)` in the browser console, and `DEFIANCE_HERO(0)` to return to play. Contact sheets are in `docs/`.

## Status

Deck 1 is complete. Stage 0 of the visual overhaul (engine upgrade, code split, hero shots) is done. Next is Stage 1, lighting, per `docs/visual-overhaul-plan.md`, then camera and color grade, then materials. The exterior model and other decks come later.
