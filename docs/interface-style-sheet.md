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
