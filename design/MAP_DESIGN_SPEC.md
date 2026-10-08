# ONYX-7 map: design spec

File: `design/onyx7_map.svg` (viewBox 800x490, self-contained, opens standalone).

## Concept
A cutaway of the facility. VAEL sits at the bottom (SL-4). The goal is the exit at the top.
Each stratum is a security level. Noise is Protocol CINDER: heat rises from the floor as ARGUS notices you.
Boldness is spent in one place, the heat and the ARGUS sweep. Everything else stays flat and quiet.

## Tokens
The SVG reads the page's own `--fg --dim --acc --warn --bad --ok --bg-color` when inlined in NODEBREAK.html, so it follows the glassmorphism theme. The hex values below are the standalone fallbacks.
| Name | Hex | Use |
|---|---|---|
| bg | #0a1220 | canvas |
| panel | #0f1b30 | strata, node fill |
| line | #1d3355 | idle conduits, dividers |
| dim | #5f7f99 | idle node, labels |
| acc | #3fd0ff | you, live link |
| warn | #ffb347 | locked |
| ok | #6ef0b0 | owned |
| bad | #ff5d73 | ARGUS, heat, noise |

Type: Courier New, 10px names, 9px addresses. Names are lowercase hostnames.

## Layout (top = escape)
```
y0    outside    [ exit ]
y50   SL-1 argus [ argus-core ]---[ gateway ]
y160  SL-2 cams  [ cameras ] [ cam-hub ]---[ vasquez-ws ]
y270  SL-3 hvac  [ hvac-ctl ]~~~~~~[ maint-port ]
y380  SL-4 core            [ VAEL ]  (air gap to maint-port)
```
Edges: e1 vael-maint (air gap), e2 maint-hvac, e3 hvac-camhub, e4 hvac-cams, e5 camhub-vasquez, e6 camhub-argus, e7 argus-gateway, e8 gateway-exit.

## Node anatomy
Ring (halo) + core (shape) + glyph + name + address.
Shape = role: circle machine, diamond cameras, hexagon ally terminal, triangle exit, double ring with sweep = ARGUS.

## States (one class per node)
| Class | Meaning | Game mapping |
|---|---|---|
| locked | needs ports, login or firewall | amber ring, lock glyph |
| open | reachable, nothing blocking | grey ring, dot |
| on | you are connected here | cyan pulsing ring |
| ok | fully accessed | green fill, check |

Edge `live` = cyan dashes plus a packet dot. Edge `gap` (e1) = dotted until the maintenance port is opened, then remove `gap` and set `live`.

## Noise and CINDER
- `onyx.noise(0..1)` sets the heat height and the gauge.
- 60% or more: `alert` class, sweep speeds up (7s to 2s), ARGUS turns red.
- 100%: `cinder` class, heat flickers. Start your countdown here.

## Motion rules
Only four things move: live conduit dashes, packets, the connected node pulse, the ARGUS sweep. All stop under `prefers-reduced-motion`.

## Integration (done in NODEBREAK.html)
The SVG is inlined in `#map`. `drawMap()` assigns each level's machines to facility slots in this order and relabels them with the level's name and IP:
maint-port, hvac-ctl, cam-hub, argus-core, gateway, exit. Slots a level does not use are dimmed (`off`).
- Connecting to a machine lights the conduits from VAEL up to its slot and closes the air gap (e1).
- Node class comes from game state: locked (ports, login or firewall pending), open, on (connected), ok (fully accessed).
- Noise follows the trace timer, so it only rises on levels with a trace. 60% turns ARGUS red, 100% flickers the heat.
- When chapters get real ONYX-7 names, replace the slot order in `CH` with an `id` on each node.
- The map is cropped to x 120-680 and sized `min(44vh, 330px)` so labels stay readable on phones.

## Checklist before shipping
- Open the file standalone: click nodes (cycle states), arrow keys (noise), 1-5 (crop).
- Check on a 360px-wide phone and with reduced motion on.
- Edit in Inkscape or Figma, then run `svgo` but keep the ids (`n-*`, `g-e*`, `e*`) and the class names.

## Next assets to draw
Chapter variants (ghost/storm/legacy/sacrifice ending frames), a Vasquez-trust ring around `vasquez-ws`, destroyed-node look (cross glyph), CINDER countdown overlay.
