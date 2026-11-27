# Deck-plan page to the new hull (design)

Small change. Approved by John, Nov 26 2026 (all three recommended answers).

## Why
The deck-plan page (docs/master-systems-display.html) still draws the old stubby hull, the old amber/ice-blue colours and a Deck 2 that has since been built differently. It is the layout source of truth and the reference the real exterior model will follow, so it has to show the ship as it now is before any exterior work.

## Goals
- Side cutaway and plan view in the sleek swept shape: long primary hull flowing into engineering, Decks 1-2 as a raised spine and bridge pod, the twin-rail arch with the dorsal turret, slim nacelles slung low and aft on swept spars.
- Positions follow the walkable 3D ship (bow at 3D z -64, so metres from bow = z + 64): arch 111-155 m, turret 133 m, nacelles 134-199 m and +-48 m off the centreline, Deck 1 and Deck 2 rooms where they are built.
- A deeper keel under engineering (about 110-190 m) so all 12 decks fit (12 x 3.5 m = 42 m).
- The page in the bridge's own look: palette A (peach, tan, butterscotch, lilac, rose, plum on black, cream text), Antonio font, block-style frames.
- Updated stats, status chips (Decks 1 and 2 walkable), Deck 2 room list, notes.
- The bridge's master systems display (js/screens.js) redrawn to agree with the page.

## Non-goals
- No 3D geometry changes (the window set piece EXTSET stays as is), so no re-bake.
- No new walkable rooms; Decks 3-12 stay planned.

## Anti-goals
- Anything copied from an existing ship design. The silhouette stays original.
- A chunkier ship: the keel is a local drop under engineering, not a taller hull.

## Approaches
- Decks 11-12: deeper keel aft (picked: keeps every planned room, local change), cut to 10 decks (keeps the old silhouette, loses rooms), taller hull overall (simplest, but chunky).
- Positions: match the 3D ship (picked: it is what you walk and see; the bridge display is only a drawing and moves cheaply), or match the bridge display (would move the set piece's arch over the lounge).
- Look: bridge look (picked: one scheme everywhere), or keep the amber blueprint (cheaper, mismatched).

## Builder's calls (Claude)
- Nacelle depth: the set piece cheats its nacelles high so they show through a dorsal window. The page and the bridge display keep them slung low (below the keel), as John described the ship. The real exterior model settles it.
- Decks that share a stretch of the ship side by side (port quarters beside starboard cabins on Deck 2) are drawn as split cells: upper half starboard, lower half port.
- Decks 3-12 compartments keep their roles and roughly their order, re-fitted inside the new hull outline; a check script confirms every compartment sits inside the hull.
