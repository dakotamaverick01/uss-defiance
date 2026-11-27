# Deck-plan page to the new hull Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redraw the deck-plan page and the bridge's master systems display in the new swept hull, with positions from the walkable 3D ship, a keel for Decks 10-12, and the page in the bridge's look.

**Architecture:** One shared description of the ship in metres (x from the bow 0..200, d = depth below the top of Deck 1; Deck n spans 3.5(n-1)..3.5n) is copied verbatim into the page and into js/screens.js as `SHIPGEO`. Both draw smooth outlines from the same point lists with the same Catmull-Rom smoothing. A Python check (tools/check_plan.py) parses both copies and confirms they match and that every compartment sits inside the hull.

**Tech Stack:** plain HTML/SVG page; canvas 2D in screens.js; Python 3 + Playwright for checks and renders.

**Spec:** docs/superpowers/specs/2026-11-26-deck-plan-hull-design.md

## Global Constraints
- Strictly original shapes and names. Nothing personal in files.
- Metres from bow = 3D z + 64 (EXTSET hull z -64..136).
- Palette A from js/core.js COLORS (peach #E8A06A, tan #D9B07E, butter #F2C88F, lilac #B693C4, rose #C67A86, plum #7E5C8E, cream #F5E6CF, black); green/amber/red only for status; red alert uses pal()'s red set. Font Antonio (fonts/antonio-600.woff, embedded in the page as base64 so the artifact stands alone).
- No 3D geometry change: no re-bake. check_deck2.py must stay at 36/36.

## Review Focus
- Phone width (390 px): the cutaway still pans sideways and the deck list stays tappable.
- Red alert toggle on the page recolours everything, including the plan view.
- Split cells (port/starboard on one deck) are each tappable and selectable from the room list.
- Labels never overflow their cell.
- The bridge display's live layers (warp core pulse, EPS trunk, nacelle coils, damage tints) line up with the moved shapes.

---

### Task 1: SHIPGEO and the page
**Files:** Modify docs/master-systems-display.html; Create tools/check_plan.py
- Hull top: [0,20],[5,16.8],[14,13.2],[30,10.4],[46,8.6],[60,7.7],[150,7.7],[166,8.9],[182,11.2],[193,13.6],[199.5,16.5]; stern face to [199.5,32]; bottom back to the bow: [196,36.5],[188,42],[124,42],[114,37.5],[100,34.5],[80,32.5],[50,30],[24,27],[8,24],[2,22].
- Spine and bridge pod (Decks 1-2): [50,7.8],[53.5,5.6],[56,3.8],[57.5,1.8],[59.5,0.5],[62,0.1],[77,0.1],[79.5,1],[81,2.8],[82.5,3.4],[94.5,3.4],[96.5,5.3],[98,7.7].
- Arch: rails from 111 m to 155 m, base d 8.5, crown d -4 (129-137 m); turret deck 128.5-137.5 m at d -4.1..-5.0; turret 130-136 m to d -7; barrels forward to 126 m.
- Nacelles 134-199 m, 5.2 m deep, centre d 46.5, +-48 m off the centreline; spars 133-139 m root to 166-170 m tip; drawn as a ghost over the hull in side view.
- Plan half-beam: [0,0],[3,14],[8,25],[20,34],[34,40],[56,45],[78,46],[98,44],[112,40],[126,30],[140,20],[170,16.5],[196,14],[200,9].
- Lift 1 70.2-72.5 m, Decks 1-6. Lift 2 124-129 m, Decks 3-12 (Deck 2 ends at the lounge, 95 m). Warp core 140-152 m, Decks 6-11.
- Rooms: Deck 1 and 2 as built (Deck 2 port/stbd split cells), Decks 3-12 re-fitted.
- check_plan.py: (a) page and screens.js SHIPGEO identical; (b) every room's mid-deck depth lies inside the hull (or spine for Decks 1-2) at both ends; (c) rooms on one deck and side don't overlap.
- Verify: `python3 tools/check_plan.py .` prints all checks OK; renders at 1600x900 and 390x844 read cleanly.

### Task 2: Bridge display
**Files:** Modify js/screens.js (msdPaths, msdPlan, MSD_ROOMS, MSD_LISTS, drawMSD live layers, ZR)
- Same SHIPGEO; MSD_ROOMS generated from the page's room list (deck, from, to, kind).
- Verify: dump the MSD canvas headlessly at both alert states; check_plan.py still OK.

### Task 3: Finish
- node --test tests/sim.test.js; python3 tools/check_deck2.py . (36/36); full station check in the background.
- Commit, push, republish the deck-plan artifact and the bridge artifact, before/after sheet, Grok bundle, handoff doc.
