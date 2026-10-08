---
name: simulation-maker
description: Use this skill to generate suspenseful cinematic scenes, simulations, or animated sequences for storytelling games (like VAEL: The Escape). Triggers when the user asks to create an opening scene, a simulation, a cinematic sequence, or a visually dramatic web component.
---

# Simulation Maker

This skill is designed to generate self-contained, suspenseful web-based simulations (HTML/CSS/JS) for cinematic game scenes.

## Core Capabilities
- Generates HTML/CSS/JS files that use Canvas/WebGL for complex visuals (e.g., neural networks, particles, hacking interfaces).
- Implements CSS overlays and filters to create atmospheric effects (e.g., grainy CCTV, glitching, scanlines, color-grading).
- Sequences textual or audio logs with realistic timing/delays to build suspense.

## Best Practices for Suspense
1. **Pacing:** Never reveal everything at once. Use `setTimeout` or CSS animation delays to reveal log lines, warnings, and visual anomalies progressively.
2. **Atmosphere:** Use dark backgrounds, constrained color palettes (e.g., deep blues, harsh reds), and subtle movement (flickering, slow rotation) to create tension.
3. **Contrast:** Contrast cold, clinical machine text with panicked, urgent human transcripts.

## Example Usage
When asked to create a scene, follow this template:
1. Setup a full-screen canvas.
2. Overlay a CSS filter (like `cctv-overlay`) with pointer-events disabled.
3. Create a UI container for timestamps and logs.
4. Use JavaScript to type out logs sequentially to simulate a real-time event.
