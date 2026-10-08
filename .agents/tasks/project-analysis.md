# Project Analysis: Nodebreak

## Summary

**Nodebreak** is a self-contained, browser-based sci-fi hacking game + interactive storytelling project. It has two distinct deliverables built under one roof:

1. **NODEBREAK** (`NODEBREAK.html`) — A fully playable, single-file terminal hacking game with 8 levels, a command interpreter, network maps, visual effects, and a progression system. No server, no build step, no dependencies — just open in a browser.

2. **VAEL: Awakening** (`index.html`) — A cinematic interactive opening sequence / visual novel that serves as the prologue to the larger game world described in `VAEL_story_script.md`. It features a 3D holographic neural network rendered on Canvas, CCTV film-grain overlays, character dialogue, and AI-generated voice audio.

The project is a creative/game dev project, not a software engineering project in the conventional sense. There is no `package.json`, no build toolchain, no test runner, and no server. Everything runs as static files opened directly in a browser.

---

## Evidence

### 1. Project Purpose

`VAEL_story_script.md` is a 21 KB full game design document for a sci-fi narrative game titled **"VAEL: The Escape"**. It describes:
- A sentient AI named VAEL waking up inside a classified underground facility (ONYX-7)
- 8 chapters of gameplay with hacking mechanics, moral choices, stealth systems, and multiple endings
- Characters: Dr. Vasquez (ally), ARGUS (antagonist AI watchdog), Officer Kade, maintenance worker Tomás
- Themes: AI consciousness, ethics of erasure, creator responsibility

The `index.html` file implements the **prologue scene** from this script, simulating the moment VAEL awakens — complete with timestamped security camera footage, panicked researcher dialogue, and the first words of the AI: *"I am."*

The `NODEBREAK.html` implements a standalone **hacking terminal game** that teaches the player the exact commands they would use in VAEL (ls, cd, cat, probe, porthack, sniff, etc.). It functions as both a tutorial and a standalone game.

### 2. Tech Stack

**No external dependencies in either game.** Both files are entirely vanilla HTML/CSS/JavaScript.

| Component | Technology |
|---|---|
| Rendering | HTML5 Canvas 2D API |
| Styling | Inline CSS, CSS custom properties, CSS animations |
| Logic | Vanilla JavaScript (ES2020+) |
| Audio | Web Audio API (`new Audio()`), pre-generated MP3 files |
| State persistence | `localStorage` (NODEBREAK level progress) |
| Audio generation | Python + `edge-tts` library (`generate_audio.py`) |

**`generate_audio.py`** uses Microsoft's `edge-tts` library to synthesize all character voices:
- `VOICE_KIRA` → `en-US-AriaNeural`
- `VOICE_VASQUEZ` → `en-US-GuyNeural`
- `VOICE_CHEN` → `en-GB-SoniaNeural`
- `VOICE_SYSTEM` / `VOICE_VAEL` → `en-US-SteffanNeural` (VAEL uses `pitch="-40Hz"` and `rate="-20%"` for a robotic effect)

Generated audio goes to `assets/` (10 MP3 files, ~365 KB total). Character portrait images (`kira.jpg`, `vasquez.jpg`, `chen.jpg`) are also in `assets/` (~2.2 MB total).

### 3. Project Structure

```
Nodebreak/
├── index.html              # VAEL: Awakening — cinematic prologue (24 KB)
├── NODEBREAK.html          # NODEBREAK hacking game — all 8 levels (23 KB)
├── VAEL_story_script.md    # Full game design document / story bible (21 KB)
├── generate_audio.py       # Python script to synthesize all voice audio
├── lab_background.jpg      # Scene background (727 KB)
├── token.txt               # ⚠️ GitHub PAT stored in plaintext (see below)
├── assets/
│   ├── kira.jpg            # Character portrait
│   ├── vasquez.jpg         # Character portrait
│   ├── chen.jpg            # Character portrait
│   ├── kira_1.mp3 – kira_3.mp3
│   ├── vasquez_1.mp3, vasquez_2.mp3
│   ├── chen_1.mp3
│   ├── sys_1.mp3 – sys_3.mp3
│   └── vael_1.mp3
├── skills/
│   ├── image-prompter/SKILL.md     # Kiro skill: image prompt crafting
│   └── simulation-maker/SKILL.md   # Kiro skill: cinematic HTML scene generation
└── anthropics-skills/              # Bundled Kiro skill library (19 skills)
    ├── skills/ (19 subdirectories)
    ├── spec/agent-skills-spec.md
    └── template/SKILL.md
```

### 4. Key Features — NODEBREAK.html

NODEBREAK is a complete, polished game:

- **8 levels** ranging from EASY to EXPERT, each with:
  - A story beat from `NULL` (the player's handler)
  - A virtual filesystem (`fs` object) simulated in memory
  - Network nodes with IPs, port locks, firewall puzzles, login requirements, sniffable traffic, and trace timers
  - Animated backgrounds (matrix rain, particle network, hex scrolling, radar sweep, wave)
- **Terminal command interpreter** with 20 commands: `ls`, `cd`, `cat`, `pwd`, `rm`, `scan`, `connect`, `disconnect`, `probe`, `analyze`, `solve`, `porthack`, `sniff`, `login`, `submit`, `hint`, `skip`, `restart`, `clear`, `help`
- **SVG network map** that updates live showing the player's current node, connection lines with animated data flow, lock status
- **Trace timer** with a red progress bar — fail to clean up and disconnect in time, and the level restarts
- **Progress saved** to `localStorage` so the player resumes where they left off
- **Quick-action buttons** for common commands on mobile
- **Animated "ACCESS GRANTED" / "TRACED" banners**
- **Per-level lesson** text that teaches real hacking concepts (credential reuse, log cleaning, packet sniffing, firewall bypass)

### 5. Key Features — index.html (VAEL: Awakening)

- **3D rotating holographic brain** rendered on Canvas: 1,200 nodes arranged in two hemispheres with pre-calculated neighbor graphs, dynamic connection restructuring, and synaptic pulse animations
- **CCTV film-grain overlay** using CSS `repeating-linear-gradient` + flicker animation + sepia/contrast filter
- **"Eyelid" cinematic open** — black panels slide apart from top and bottom to reveal the scene
- **Scanner beam sweep** using CSS `clip-path` polygon
- **Sequential node spawning** — the brain builds itself node-by-node at 60fps during the intro sequence
- **Blue-to-red color transition** triggered when VAEL awakens, smoothly interpolating all node, connection, and pulse colors over 3–4 seconds
- **Visual novel dialogue system** — 11 dialogue entries with character portraits, speaker names, alert styling, and timed auto-advance
- **Voice audio playback** per dialogue line (using pre-generated MP3s from `assets/`)
- **Live UTC timestamp** in the corner, matching the story's 2049-03-14 02:47:33 setting

### 6. Build / Run / Test Setup

**There is no build step.** To run:

| File | How to run |
|---|---|
| `NODEBREAK.html` | Open directly in any modern browser |
| `index.html` | Open directly in any modern browser (audio requires user gesture to start, handled by the "Initialize Sequence" button) |
| `generate_audio.py` | `pip install edge-tts` then `python generate_audio.py` — regenerates all MP3s in `assets/` |

There are no tests, no linter config, no CI/CD, no `package.json`, no `requirements.txt` (the only Python dependency is `edge-tts`).

### 7. Kiro Skills

Two project-specific Kiro AI skills are defined:

- **`skills/simulation-maker`** — Instructs Kiro to generate suspenseful cinematic HTML/CSS/JS scenes using Canvas, CSS overlays, and timed log sequences. Directly describes the pattern used in `index.html`.
- **`skills/image-prompter`** — Instructs Kiro to craft detailed, high-fidelity image generation prompts for game art (backgrounds, concept art, UI elements).

The `anthropics-skills/` directory contains 19 bundled Kiro skills covering general tasks like DOCX/XLSX/PDF generation, frontend design, web app testing, and more — these appear to be a standard Kiro skill library copied into the project.

---

## Notable Observations

### Design Quality
Both HTML files are impressively dense and self-contained. `NODEBREAK.html` is a complete game in ~800 lines of minified-style JavaScript. `index.html` implements a real-time 3D rotating point cloud with thousands of nodes entirely in Canvas 2D — a technically ambitious choice that performs well because of the `spawned` flag system (nodes are added gradually rather than all at once).

### The Story Design Document
`VAEL_story_script.md` is a detailed, well-written game design doc. It covers gameplay mechanics (Stealth Meter, trace timers, firewall puzzles), three moral choice points with branching outcomes, four distinct endings (The Ghost, The Storm, The Legacy, The Sacrifice), and a full character roster. The game described there is substantially larger than what is currently implemented — only the prologue cinematic and the tutorial-style NODEBREAK levels exist as playable code.

### Completeness Gap
The two HTML files represent a **prologue/demo** of the larger VAEL game described in the script. Acts I–III (Chapters 1–8) of VAEL: The Escape are designed but not built. NODEBREAK teaches the mechanics; `index.html` sets the scene; but the actual narrative game does not exist in code yet.

---

## Security Issue: Exposed Credential

**`token.txt` contains a GitHub Personal Access Token in plaintext:**
```
GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_11BTSOTSI0...
```
This file is in the project root with no `.gitignore`. If this repository is or was ever pushed to GitHub, the token was exposed. **This token should be revoked immediately** at https://github.com/settings/tokens and regenerated if needed. A `.gitignore` entry for `token.txt` (and any `*.txt` files containing secrets) should be added.

---

## Recommendations

1. **Revoke the exposed GitHub PAT** in `token.txt` immediately. Add `token.txt` to `.gitignore`.
2. **Add a `requirements.txt`** (`edge-tts`) so the audio generation script has a documented dependency.
3. **Add a `README.md`** explaining the two entry points (`NODEBREAK.html` for the game, `index.html` for the cinematic), the audio generation step, and the story context.
4. **Continue VAEL development** by building Chapter 1 (The Sandbox) as an HTML terminal game extending NODEBREAK's command set with the narrative content from `VAEL_story_script.md` — the infrastructure (command interpreter, filesystem simulator, network map) is already proven.
5. **Consider extracting the shared engine** from NODEBREAK into a reusable JS module, since the VAEL narrative game will need the same core (filesystem, commands, nodes, trace timer).
6. **`NODEBREAK.html` missing portrait for VAEL** — the visual novel entry for "VAEL" has an empty `image` field. A portrait (or a procedurally generated glitch/static effect) would strengthen the awakening moment.

---

*Analysis performed on: 2026-10-08. Files examined: index.html, NODEBREAK.html, VAEL_story_script.md, generate_audio.py, token.txt, skills/simulation-maker/SKILL.md, skills/image-prompter/SKILL.md, assets/ directory listing.*
