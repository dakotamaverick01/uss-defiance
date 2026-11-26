# Bridge refit and Deck 2 part 1: design

Date: 2026-11-25. Agreed with John in chat; he approved going ahead with everything below.

## Why

The bridge doesn't feel designed by people for people. The screens read as generic "AI dashboard" art
(thin outlines, glow rings, hex nodes), the room is dark everywhere, and the stations are single slabs.
John wants it to feel like the bright, lived-in bridges of the 24th-century shows: cohesive block-style
screens, a well-lit room, and stations with depth and detail. Red alert is the only time it should be dark.

## Decisions (John's)

- **Interface:** an original interface in the same family as the shows' flat block screens: solid colour
  blocks, elbow frames, pill buttons and number columns on black. Not a copy of that studio's interface:
  our own shapes, proportions and labels (project rule: strictly original).
- **Palette A, peach and lilac:** peach frames and bars, tan and butterscotch buttons and readouts, lilac as the
  second colour, dusty rose and deep plum as small accents. Green, amber and red are for status only.
- **Room, "bright workhorse":** keep the armoured structure and dark metal trim, but light warm-grey and tan wall
  panels, a light ceiling, mid blue-grey carpet, bright even light. All Deck 1 rooms, the lift and Deck 2 too.
- **Red alert** dims the room and turns it red; screens swap peach frames to red and dim the lilac.
- **Stations:** same positions, rebuilt with several surfaces at different angles (angled desk split into framed
  screens, an upright screen on the front face, a high status strip on wall stations), physical detail
  (speaker grille, ID plate, access panels, handholds, alert-coloured underglow), sculpted tan pedestals,
  separate upholstered chairs.
- **Then Deck 2 part 1** from the build-out plan: Lift 1 lobby, corridor, captain's quarters, wardroom.

## Approaches considered

1. Restyle the existing widget kit and frame in place (chosen): every screen keeps its data and layout logic,
   the shared drawing pieces change, so all ~40 screens change together and stay cohesive.
2. Hand-draw each screen anew: more variety but far more work and drift between screens.
3. Pre-made images for screens: cheap but static, and loses the live ship model.

For lighting, one re-bake at the end covers the new materials, rebuilt consoles and Deck 2, instead of a bake per change.

## Design

- **Screens (screens.js):** frame = left column of blocks joined to a top bar by a rounded elbow, a short bottom
  bar with its own elbow, title on black at the end of the top bar, a code in a small block. Section headers =
  a pill cap plus a solid bar. Tables = coloured row keys with tan labels and cream values. Bars = solid blocks on a
  dark plum track. Status lights = pills with text. Graphs = block columns. Round widgets (dial, shield, plot,
  globe, ring) = thick solid arc segments. No grid-dot backgrounds. Keypads = pill keys with numbers. The HTML
  station panel matches (pill buttons, palette colours).
- **Stations (bridge.js):** the forward pods, side wall runs, weapons and EW, and the dais desks rebuilt as layered
  consoles in a light tan "pedestal" finish with dark trim.
- **Room:** new wall, ceiling and carpet textures; brighter fixtures in the bake; red alert multiplies baked light
  down to about a third and tints it red.
- **Deck 2 (deck2.js):** built 3.5 m below the bridge (real deck spacing). The lift car now really travels between
  deck heights. Lobby at the lift, captain's quarters forward (day cabin, dining table, sleeping area, viewport),
  a corridor running aft past the (sealed, Stage 4) first officer's door to the officers' wardroom (long table,
  sideboard, viewport). Baked with Deck 1 in one pass; only the deck you're on is shown.

## Left to the builder

Exact proportions, furniture detail, fixture placement and tuning numbers.
