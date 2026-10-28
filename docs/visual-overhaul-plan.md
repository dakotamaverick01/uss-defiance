
# Defiance Visual Overhaul Plan

*Plan written October 2026.*

## Goal and budget

Make the Defiance read like a real, lived-in warship photographed on a film set, not a procedural 3D scene, using about 30 points of weekly usage across eight stages.

- **Starting point:** 26% of weekly usage used.
- **Reserve for work:** 30 to 40%, so this project stops at about 60% total, whatever stage we are on.
- **Pace:** one stage per session. Every stage ends with something visible and published, so stopping early still leaves a better ship.
- **Cost figures below are estimates.** I can't see your usage meter. After Stage 0 we compare your meter before and after and recalibrate every estimate.

## Why it reads as AI-generated

The bridge is built correctly but photographed badly: the gap is light, surface and imperfection, not layout.

| Tell | What it looks like now | What real sets and real ships do |
| --- | --- | --- |
| Light with no source | Point lights and a fill light brighten everything evenly | Every pool of light comes from a visible fixture; corners and undersides fall into real shadow |
| No bounce light | Surfaces are lit only directly | Light bounces: a red alert strip tints the floor, a screen glows onto the operator's hands |
| Perfect surfaces | One roughness per material, painted-on canvas textures, no surface relief | Brushed grain, pitted metal, carpet pile, worn edges, fingerprints on glass |
| Too clean | No scuffs, dust, clutter or wear | Scuffed walkways, a mug on a console, a jacket on a chair, a panel left open for maintenance |
| Primitive shapes | Most parts are rounded boxes and cylinders | Chamfers, lips, fasteners, vents, cable runs, signage, stencils |
| Repetition | Identical panels and spacing everywhere | Variation in panel size, labels, wear and small fixtures |
| Game camera | 66 to 80 degree field of view, perfectly steady, no lens character | 45 to 60 degree view, slight weight in the motion, film grain, a color grade, lens falloff |
| Thin sound | Synthesized hum and beeps | Layered room tone, ventilation, relays, door actuators, sound placed in space |

Fix the first three rows and most people stop seeing code. The rest is what makes it feel lived-in.

## How we keep usage under control

The biggest saving is starting each stage in a fresh chat: this conversation is now so long that every reply re-reads hours of history, which makes even small edits expensive.

1. **One stage per fresh chat.** Open a new chat, paste the stage name and the links to this plan and the bridge. I read the code and this plan, nothing else.
2. **Fixed hero shots.** In Stage 0 I lock six camera positions (bridge wide, captain's view, port stations, ready room, conference room, red alert). Every stage ends with the same six frames, so we judge progress side by side instead of by impression.
3. **Batch your feedback.** One list of notes per round costs far less than several one-line messages, each of which triggers a full pass.
4. **Check the meter at each checkpoint.** Every stage ends with a publish and a stop. You glance at usage and decide whether to continue.
5. **Stop rule.** If a stage runs past about 1.5 times its estimate, I stop at the next clean point, publish what works and tell you what is left.
6. **Helpers only where work splits cleanly.** Parallel subagents multiply cost. I use them only in Stage 3, where separate parts can be built independently.

## Stages at a glance

Eight stages, about 31 points in total, ending near 57% of weekly usage. Lighting and materials do the most; Stage 6 is the most shareable.

| Stage | What changes | Impact on realism | Est. cost (points) | Running total |
| --- | --- | --- | --- | --- |
| 0. Foundation | Modern renderer, hero shots, tool tests | Enables everything else | 4 | 30% |
| 1. Light | Real shadows, bounce light, fixtures that cast light | Highest | 6 | 36% |
| 2. Camera and grade | Lens, field of view, film grain, color grade | High for its cost | 2.5 | 38.5% |
| 3. Materials | Surface relief, wear, grime, glass smudges | Highest | 5 | 43.5% |
| 4. Detail | Chamfered shapes, fixtures, signage, parts library | High | 6 | 49.5% |
| 5. Lived-in | Clutter, variation, open panels, crew traces | Medium | 2.5 | 52% |
| 6. Photo mode | Path-traced stills from any viewpoint | Very high for sharing | 3 | 55% |
| 7. Sound and quality tiers | Layered ambience, phone/desktop/cinematic settings | Medium | 2.5 | 57.5% |

If you want the most visible change for the least usage, do Stages 0, 1 and 2 first (about 12.5 points), then decide.

## Stage by stage

Each stage lists what I do, what you will see, and the checkpoint where you decide whether to continue.

### Stage 0. Foundation (about 4 points)

- **Upgrade the 3D engine.** The bridge runs on a 2021 version of three.js, the 3D library behind it. Newer versions add realistic light units, better tone mapping and the effects in Stages 1 and 6.
- **Split the code into modules.** One file per area (rooms, screens, materials, controls), so later stages can change one area safely.
- **Lock the six hero shots** and record a baseline set.
- **Test Blender in my workspace.** Blender is free 3D software that can calculate light bouncing around a room ahead of time (baking). If it installs here, Stage 1 gets much stronger. The test costs under a point.
- **You see:** the same bridge, slightly crisper, plus the baseline hero shots.
- **Checkpoint:** compare your meter to the 4-point estimate. I rescale every later estimate.

### Stage 1. Light (about 6 points)

- **Ambient occlusion:** soft darkening where surfaces meet, under consoles and in corners.
- **Baked bounce light:** precomputed light for the room's fixed geometry, done in Blender if the test passed, otherwise in the browser. Light spills off strips onto floors and off screens onto consoles.
- **Fixtures that do the lighting:** remove the general fill light. Every visible fixture becomes the actual light source, including strip lights that light the area in front of them.
- **Faint haze** so light shafts read without looking like cones.
- **You see:** real depth, contrast and mood. This is the biggest single jump.
- **Checkpoint:** if the hero shots don't look clearly more real, we stop and rethink before spending more.

### Stage 2. Camera and grade (about 2.5 points)

- **Field of view** narrowed to about 55 degrees on desktop and 65 on phones, the biggest tell that this is a game.
- **Weight in the camera:** smoothed turning and a slight settle when you stop walking.
- **A color grade** that gives the whole image one consistent look (a lookup table, built for this ship).
- **Lens character:** film grain, gentle edge falloff, restrained glow on bright lights and slight color fringing at the edges.
- **Motion blur** during warp only.
- **Checkpoint:** a quick before-and-after on the hero shots.

### Stage 3. Materials (about 5 points)

- **Full surface sets** for every material: color plus relief (normal maps), shininess variation (roughness maps) and contact shading. Covers brushed steel, painted panels, leather, carpet, walnut and screen glass.
- **Wear and grime** where hands and feet go: shiny console edges, scuffed walkways, dust in corners, fingerprints on screens catching the light.
- **Screens that look physical:** a fine pixel grid up close, brighter centers and a smudged glass layer.
- **Checkpoint:** close-up hero shots of a console and a chair.

### Stage 4. Detail (about 6 points, with 2 or 3 helpers)

- **A parts library** built once and reused: vents, access panels, junction boxes, fire-suppression heads, emergency lights, handholds and cable runs.
- **Chamfered profiles** in place of rounded boxes on consoles, frames and trim.
- **Signage and stencils:** deck and frame numbers, hazard placards and labels on every door and panel.
- **Helpers:** this is the one stage where parallel subagents earn their cost, each building a separate batch of parts.
- **Checkpoint:** wide hero shots should read as dense and engineered without clutter.

### Stage 5. Lived-in (about 2.5 points)

- **Crew traces:** a mug at Operations, a tablet left on a console, a jacket over a chair, a coffee ring on the ready room desk.
- **Breaking repetition:** one panel open for maintenance with a tool case beside it, a replaced panel in a slightly different shade, a scuffed kick plate.
- **Checkpoint:** a quick look and on to Stage 6.

### Stage 6. Photo mode (about 3 points)

- **A Photo button** hides the interface, freezes the scene and renders it with path tracing, which simulates every light ray the way film studios do. The image sharpens over a few seconds into a near-photographic still.
- **Framing controls:** field of view, depth of field and exposure.
- **This is your shareable feature.** It works on phones, just more slowly.
- **Checkpoint:** you take a few shots and decide whether we're done.

### Stage 7. Sound and quality tiers (about 2.5 points)

- **Layered sound:** room tone, ventilation, relay clicks, door actuators and console chirps, each placed at its source so it gets louder as you approach.
- **Quality settings:** Phone, Desktop and Cinematic, so the heavier effects never make the ship stutter on a phone.
- **Checkpoint:** the last publish.

## Outside tools worth bringing in

Two additions pay for themselves: free texture libraries (Stage 3) and Meshy for props (Stages 4 and 5). Both replace work I would otherwise hand-build in code, which saves Claude usage.

| Tool | What it adds | Stage | Setup and cost |
| --- | --- | --- | --- |
| Free texture libraries (ambientCG, Poly Haven) | Photographed surface sets for metal, paint, fabric, carpet and wood, free for any use | 3 | You download about 8 sets and attach them; my workspace can't reach those sites |
| Meshy (plugin, Anthropic directory) | AI-generated 3D props and textures: mugs, tool cases, plants, chairs | 4, 5 | Needs a Meshy account; its credits are billed by Meshy, not Claude |
| GitHub | Version history for the project, so any stage can be rolled back | 0 | Free account; set up (done: this repository) |
| SpriteCook (already connected) | Generated signage, decals and grime overlays | 3, 4 | Uses your SpriteCook credits |
| parallax-threejs (plugin) | three.js debugging and automatic side-by-side image comparison of hero shots | 0 to 7 | Optional; built for Claude Code on your own computer, so it adds setup |
| Motion Reel (plugin) | A cinematic trailer of the ship rendered from the code | After 6 | Optional extra, not part of the 31 points |
| Freesound recordings | Real recorded room tone and mechanical sounds for Stage 7 | 7 | Licenses vary per sound; you download what you like |

Every prop and texture stays original to the Defiance, same rule as the rest of the ship.

## What I need from you, and what we're not doing

- [ ] Start a fresh chat for Stage 0 and paste in the links to this plan and the bridge
- [ ] Note your usage meter at the start and end of each stage
- [ ] Decide on Meshy and GitHub before Stage 0 (both optional)
- [ ] Before Stage 3, download about 8 texture sets from ambientCG or Poly Haven and attach them; I'll send the exact list
- [ ] Give one batch of notes per checkpoint

**Not doing: moving to a game engine.** Unity or Unreal would look better still, but the ship would stop being a link that opens on your phone. It would also need your computer and cost far more than this budget. If the browser version hits its ceiling after Stage 6, we can revisit.

