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
