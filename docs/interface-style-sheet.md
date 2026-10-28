# Defiance Bridge Interface

The display and control language of the USS Defiance (EV-0408), a Bastion-class heavy escort built for deep-space interdiction, heavy strike and heavy escort. Every screen, key and station menu on the bridge follows these rules, so the ship reads as one system. New rooms and decks are built from this sheet.

## Principles

- **One grammar everywhere.** Displays, console keys and station menus are made from the same three shapes: the hex node, the hex-cut tab and the segmented rail.
- **Color means function.** A station's job is readable from across the room before any text is. Color is never decoration.
- **Dense, not cluttered.** A working starship shows a lot at once. Each display is a grid of sub-panels, each with one job and one tab title.
- **Touch first.** Keys are big, solid and numbered, and look like they want to be pressed.
- **Always running.** Something on every display is moving: a sweep, a sparkline, a scrolling log, a blinking key.

## Color

Black `glass` is the only ground. Four function colors carry meaning:

| Token | Function | Stations | Status meaning |
| --- | --- | --- | --- |
| `command` (blue) | Command | Command chair, Operations, Main Viewer, ship profile, Ready Room, Conference | active |
| `navigation` (green) | Navigation and sensors | Flight, Science, Intelligence, Electronic Warfare, situation table | ok |
| `systems` (yellow) | Ship systems | Engineering, Environment, Damage Control, Communications, Lift, Head | warn |
| `tactical` (red) | Tactical | Tactical, Weapons Control | alert |

Neutrals: `ink` for values, `ink-dim` for labels and codes, `ice` for neutral keys, `track` for anything empty or unlit. Black text sits on every solid fill.

**Alert conditions** recolor the accent. At Condition Green the accent is `command`; at Yellow Alert it becomes `systems`; at Red Alert it becomes `tactical`, edge lights pulse and weapon readouts turn red. Function colors on station frames stay put, so stations remain identifiable.

`seam-light` belongs to the room (wall seams, coves, downlights), never to a display.

## Shapes

- **Hex node.** A hexagon in the station's function color with a black core (`node-inner`). It anchors the top-left corner of every display and the header of every menu. It is the ship's mark, taken from the crest.
- **Hex-cut tab.** A bar with 60° angled ends (`hex-cut`). Keys, rails, bars and sub-panel tabs are all tabs. Nothing on a display has rounded corners (`radius-none`).
- **Segmented rail.** Under every screen title: a long tab in the function color, a short `ice` tab, then a long `track` tab. Three segments, always in that order.

## Display anatomy

1. Hex node, top left.
2. Key column below it: hex-cut keys with four-digit codes (`key-code`), the first in the function color, the rest `ice` or `track`. Keys blink white now and then. Tall, narrow displays drop the column.
3. Screen title in `screen-title`, uppercase, with the station code (`SCI·03`) at the right in `label`.
4. Segmented rail.
5. Content: a grid of sub-panels. Each opens with a function-colored tab carrying an uppercase title, followed by a `track` rule.

Console screens (short and wide) show three sub-panels in a row. Wall displays show two rows of two or three.

## Widgets

- **Big readout.** One value in `big-readout` with a unit in `label` beside it.
- **Table.** Label on the left in `ink-dim`, value on the right in `value`, a `track` rule between rows.
- **Bars.** Label, a hex-cut track with a hex-cut fill, and a percentage.
- **Status lights.** A small hex node per item: green ok, yellow warn, blue active, red alert, `track` off.
- **Sparkline.** A single stroke with a 14% fill below it, over four `track` rules.
- **Log.** Uppercase lines in `log-line` scrolling upward, the newest line in the accent.
- **Plots and dials.** Concentric rings in `track`, a sweep line in the function color, contacts as hex nodes.

## Station menus

Black panel with a 6px outer radius (`radius-frame`), a hex node badge in the function color, the role in `label` and the station name in `screen-title`. Then a segmented rail, a two-column readout table (labels in the accent, values in `ink`) and hex-cut action keys. The first key takes the function color, the rest `ice`. Every key carries a small reference code. The active key turns white with a black hex mark.

## Copy

- Uppercase on displays; sentence case in menu notes.
- Station codes are three letters, a middle dot and two digits: `FLT·01`, `ENG·06`.
- Key codes are four digits. Reference codes on menu keys read `NN-NNN`.
- Numbers carry units: `98.4%`, `21.5 °C`, `1.9 MILLION KM`.

## Don't

- Don't add a fifth function color or use a function color decoratively.
- Don't round display corners or join rails with curves. Rails meet at the hex node.
- Don't put text on a light ground other than black text on a solid key.
