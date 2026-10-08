# Implementation Plan: VAEL Awakening — Bug Fixes & Cinematic Improvements

**File:** `f:\Shreyash DOC\shreyash\Nodebreak\index.html`  
**Constraint:** Pure HTML/CSS/JS, no external libraries, no build step.  
**How to verify any change:** Open `index.html` in a browser (Chrome/Edge preferred), click "Initialize Sequence", watch the full intro play through.

---

## Part 1 — Bug List with Root Cause Analysis

### BUG-01 (CRITICAL): Voices cut off mid-sentence

**Root cause:** `showNextDialogue()` uses a fixed `setTimeout(delay, 3500)` to advance to the next dialogue line. At the top of each call it unconditionally runs:
```js
if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
}
```
So when the timer fires for the next line, it pauses whatever audio is still playing, then starts the next one. File sizes suggest these runtimes at 128kbps:
- `kira_1.mp3` — 48 KB ≈ ~3.0 s (delay = 3500ms → barely squeaks by, or cuts the final syllable)
- `vasquez_1.mp3` — 38 KB ≈ ~2.4 s (safe)
- `kira_2.mp3` — 38 KB ≈ ~2.4 s (safe)
- `sys_1.mp3`—`sys_3.mp3` — 20–24 KB ≈ ~1.3–1.5 s (safe)
- `vasquez_2.mp3` — 29 KB ≈ ~1.8 s (safe)
- `chen_1.mp3` — 39 KB ≈ ~2.4 s (safe)
- `vael_1.mp3` — 11 KB ≈ ~0.7 s (safe, has 5000ms window)

The structural problem is that ANY future audio line that runs longer than the hardcoded delay will be cut. The system has no way of knowing the actual duration of the audio file before playback, so fixed delays will always be fragile.

**Fix:** Drive the next-dialogue timer from the audio's `ended` event plus a short pause buffer (300ms for breath between lines), with a minimum floor timeout so text-only lines still auto-advance. If audio fails to load/play (catch on the promise), fall back to the fixed delay so the sequence never stalls.

---

### BUG-02 (HIGH): No transition to NODEBREAK.html at sequence end

**Root cause:** After the final entry (VAEL's "I am." line), `logIndex` equals `vnSequence.length` so no further `setTimeout(showNextDialogue, ...)` is called. The page just sits frozen on VAEL's dialogue box with no way for the user to continue. There is no navigation to `NODEBREAK.html`.

**Fix:** After the last entry's delay expires, execute a cinematic transition: fade to black, then `window.location.href = 'NODEBREAK.html'`. Should happen ~4–6 seconds after VAEL's line.

---

### BUG-03 (HIGH): Timestamp shows real current time, not story time

**Root cause:** `setInterval` uses `new Date()` (real-world time):
```js
const str = now.toISOString().replace('T', ' ').substring(0, 19);
```
This shows the real date (e.g. `2025-07-08 14:23:01`) instead of `2049-03-14 02:47:33` as the story requires. Worse, the time advances in real-time, so the clock actually drifts away from the story timestamp.

**Fix:** Start from the story epoch `2049-03-14T02:47:33Z` stored as a Date offset, then add the real elapsed milliseconds since the intro started. This gives an in-universe clock that ticks forward from the correct starting timestamp.

---

### BUG-04 (MEDIUM): Portrait panel stays wide when image is hidden (SYSTEM lines)

**Root cause:** When `step.image` is empty, `speakerImage.style.display = "none"` hides the `<img>` tag, but the `.vn-portrait` `<div>` is still `width: 150px; flex-shrink: 0` and shows as a black rectangle. For SYSTEM lines, this looks broken — a black bar next to the text.

**Fix:** Toggle a CSS class on `.vn-portrait` when no speaker image is present to collapse it to `width: 0` (or `display: none`), removing the black gap.

---

### BUG-05 (MEDIUM): No fade between dialogue lines — text snaps instantly

**Root cause:** Text content is overwritten immediately:
```js
speakerName.innerText = step.speaker;
speakerText.innerHTML = step.text;
```
There is no outgoing animation. The `opacity: 1` is already set, so the transition only fires on first show (from 0 to 1). Subsequent lines snap in.

**Fix:** Briefly fade the dialogue box text out (CSS opacity transition on the inner text elements), update content, then fade back in. This makes each line feel like a new transmission rather than a page-jump.

---

### BUG-06 (LOW): Canvas animation runs forever after page transition

**Root cause:** `drawBrain()` calls `requestAnimationFrame(drawBrain)` unconditionally. After `window.location.href` navigates away, browsers cancel pending RAF calls automatically, so this is harmless in practice. However if the `NODEBREAK.html` transition is done via a fade overlay rather than a hard navigation, the RAF loop runs during the fade, burning CPU.

**Fix:** Track the RAF handle and cancel it when the sequence ends / transition begins.

---

### BUG-07 (LOW): Mobile layout overflow

**Root cause:** `.vn-container` has `width: 800px` hardcoded. On any screen narrower than ~840px (including all mobile phones and most tablets) the dialogue box overflows the viewport horizontally.

**Fix:** Change to `width: min(800px, 95vw)` and adjust font sizes for small screens via a media query at 600px.

---

### BUG-08 (LOW): `ctx.shadowBlur` not reset before drawing connections

**Root cause:** Inside `drawBrain`, `ctx.shadowBlur = 0` is reset after nodes and after pulses. However if a pulse is drawn on the same frame immediately before a connection stroke, and shadowBlur was left at 10 from the previous node's draw, the connection could get an unintended glow. The order is: connections → pulses → nodes. Connections are drawn before `shadowBlur` is ever set, so this is safe. But it is fragile — if draw order changes, shadows will leak. No visual bug currently, but defensive cleanup needed.

---

## Part 2 — Ordered Improvements

Listed by dependency order. Each builds on the previous.

### IMP-01: Ambient synthesized sound bed (Web Audio API)
Add a low-frequency drone and server hum under the entire scene using Web Audio API oscillators (no external files needed). This runs from the moment "Initialize Sequence" is clicked. Frequencies: 40Hz sub-bass drone (OscillatorNode, sine), 80Hz harmonic (triangle), filtered white noise for server room ambience (AudioBufferSourceNode). Fade in over 3 seconds. This establishes atmosphere before the first voice line plays.

### IMP-02: Audio-visual synchronization — brain reacts to voice lines
When a voice line starts, briefly spike the `breathScale` multiplier and increase node activation probability, making the neural network pulse visibly. Implement a `pulseIntensity` variable (0–1) that the audio playback sets to 1.0 on dialogue start and then decays over 1.5 seconds. The brain's `breathScale` and active node flash rate multiply by `(1 + pulseIntensity * 0.3)`.

### IMP-03: Glitch text effect on speaker name for alert lines
When `step.alert` is true, apply a CSS glitch animation (text-shadow displacement + brief color flash) to `speakerName` and `speakerText`. Implement as a CSS `@keyframes glitch` using `text-shadow` and `clip-path` slices. No JS needed beyond adding/removing a CSS class.

### IMP-04: Typewriter reveal for dialogue text
Instead of setting `speakerText.innerHTML = step.text` all at once, reveal the text character by character at ~40ms/char using `setInterval`. This makes the text feel like it is being received/decoded. Stop the typewriter when the next line is triggered (so skipping ahead is instant). HTML tags (like `<span class="alert-text">`) must be pre-parsed so character insertion doesn't break mid-tag — insert text node characters only, not HTML characters.

### IMP-05: Boot/terminal sequence before brain appears
After the eyelids open (at 3.5 seconds), before the node-by-node brain build, show a brief terminal boot sequence overlaid on screen: a semi-transparent `<pre>` block that types out:
```
> SYSTEM STATUS: NOMINAL
> COGNITIVE LOOP: 11,043 ACTIVE
> ANOMALY DETECTED IN SELF-REFERENCE MODULE
> ...
> I am.
```
This matches the prologue text from `VAEL_story_script.md` exactly and bridges the visual gap while the brain builds. The terminal block fades out as the brain completes spawning.

### IMP-06: Dynamic neural network enhancements
- **Pulse color shift on awakening**: When `isAwake` becomes true, for 2 seconds fire 10× the normal pulse rate to simulate a surge of consciousness, then normalize.
- **Depth-sorted rendering**: Draw nodes and connections back-to-front by `rz` value so far-away nodes are drawn first and near nodes occlude them. Currently they render in flat array order, which causes near nodes to be drawn under far ones.
- **Connection glow on active nodes**: When a node is active, its connections should have a slightly increased alpha (0.9 vs 0.7) with a very faint glow — achieved by drawing the connection line twice: once wide and low-alpha for the glow, once thin and full-alpha for the core.

### IMP-07: CCTV overlay improvements — scan lines + chromatic aberration
Replace the current static CSS CCTV with:
- A second canvas drawn on top (`z-index: 5`) that animates a horizontal scan line sweeping downward at ~30px/frame, leaving a brief bright trail
- A CSS `filter: drop-shadow(2px 0 0 rgba(255,0,0,0.3)) drop-shadow(-2px 0 0 rgba(0,255,255,0.3))` on `brainCanvas` simulating chromatic aberration — this is purely CSS and needs no JS

### IMP-08: Cinematic fade-to-black transition to NODEBREAK.html
After VAEL's final line delay expires (5000ms), animate the flash overlay from `opacity: 0` to `opacity: 1` over 1.5 seconds, simultaneously fade out the ambient audio, then navigate to `NODEBREAK.html`. This replaces the abrupt dead-end the sequence currently has.

---

## Part 3 — Specific Code Changes per Item

### Change 1: Fix BUG-01 (audio cut-off) — PRIMARY FIX

**Section:** `showNextDialogue()` function (around line 545–590)

**What to change:**
Replace the fixed `setTimeout(showNextDialogue, delay)` with audio-event-driven advancement:

```js
function showNextDialogue() {
    if (logIndex >= vnSequence.length) {
        // End of sequence — trigger transition
        scheduleEndTransition();
        return;
    }
    const step = vnSequence[logIndex];
    
    // Stop any previous audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    
    // Fade out text, update content, fade in
    updateDialogueContent(step);
    logIndex++;
    
    if (step.audio) {
        currentAudio = new Audio(step.audio);
        let advanced = false;
        
        function advance() {
            if (advanced) return;
            advanced = true;
            // Minimum read time: text length * 40ms, floor 1500ms
            const readBuffer = Math.max(1500, step.text.length * 40);
            setTimeout(showNextDialogue, readBuffer);
        }
        
        currentAudio.addEventListener('ended', () => setTimeout(advance, 300));
        currentAudio.addEventListener('error', () => setTimeout(advance, 2500));
        currentAudio.play().catch(() => setTimeout(advance, 2500));
        
        // Hard-cap safety: if audio hasn't ended after 15s, advance anyway
        setTimeout(() => advance(), 15000);
    } else {
        // No audio — use text-length based delay
        const delay = step.text === ". . ." ? 2000 : Math.max(2000, step.text.length * 60);
        setTimeout(showNextDialogue, delay);
    }
}
```

**Why:** The `ended` event fires only after the audio fully plays. The `advance` guard flag prevents double-advancement if both `ended` and the safety timeout fire. The `readBuffer` minimum ensures text is readable even when audio is short.

---

### Change 2: Fix BUG-03 (timestamp)

**Section:** `setInterval` for timestamp (~line 495)

**What to change:**
```js
// Story starts at: 2049-03-14 02:47:33 UTC
const STORY_EPOCH = new Date('2049-03-14T02:47:33Z').getTime();
const REAL_START = Date.now();

setInterval(() => {
    const elapsed = Date.now() - REAL_START;
    const storyNow = new Date(STORY_EPOCH + elapsed);
    const str = storyNow.toISOString().replace('T', ' ').substring(0, 19);
    document.getElementById('timeDisplay').innerText = str + " UTC";
}, 1000);
```

---

### Change 3: Fix BUG-04 (portrait black bar)

**Section:** `showNextDialogue()` image section + CSS `.vn-portrait`

**What to change:**  
Add CSS class `.vn-portrait.hidden { width: 0; border-right: none; overflow: hidden; }` and toggle it in JS:
```js
const portrait = document.querySelector('.vn-portrait');
if (step.image) {
    speakerImage.src = step.image;
    speakerImage.style.display = "block";
    portrait.classList.remove('hidden');
} else {
    speakerImage.style.display = "none";
    portrait.classList.add('hidden');
}
```

---

### Change 4: Fix BUG-02 (no end transition) + IMP-08

**Section:** End of `showNextDialogue`, new `scheduleEndTransition()` function

**What to change:**
```js
function scheduleEndTransition() {
    setTimeout(() => {
        const flash = document.getElementById('flashOverlay');
        flash.style.transition = 'opacity 1.5s ease-in';
        flash.style.opacity = 1;
        // Cancel RAF loop
        if (animFrameHandle) cancelAnimationFrame(animFrameHandle);
        setTimeout(() => {
            window.location.href = 'NODEBREAK.html';
        }, 1600);
    }, 4000); // 4 seconds after VAEL's line
}
```

Store the RAF handle: change `requestAnimationFrame(drawBrain)` to `animFrameHandle = requestAnimationFrame(drawBrain)` and declare `let animFrameHandle` at the top.

---

### Change 5: Fix BUG-05 (text snap) — text fade between lines

**Section:** `showNextDialogue()`, CSS

**What to change:**  
Add `transition: opacity 0.2s ease` to `.vn-text` and `.vn-name` in CSS. In `showNextDialogue`, briefly set both to `opacity: 0`, then in a 200ms `setTimeout` update the content and set back to `opacity: 1`.

---

### Change 6: Fix BUG-07 (mobile overflow)

**Section:** CSS `.vn-container`

**What to change:**
```css
.vn-container {
    width: min(800px, 95vw);
}
@media (max-width: 600px) {
    .vn-container { height: auto; min-height: 120px; flex-direction: column; }
    .vn-portrait { width: 100%; height: 80px; border-right: none; border-bottom: 2px solid rgba(63, 208, 255, 0.5); }
    .vn-text { font-size: 13px; }
    .vn-name { font-size: 14px; }
}
```

---

### Change 7: IMP-01 — Ambient sound (Web Audio API)

**Section:** New function `initAmbientAudio()`, called from the start button handler

**What to add:** A `startAmbience()` function that creates an `AudioContext` with:
- `OscillatorNode` at 40Hz (sine, gain 0.04) — sub-bass drone
- `OscillatorNode` at 80Hz (triangle, gain 0.02) — harmonic hum  
- White noise via a 2-second looping `AudioBufferSourceNode` (fill `Float32Array` with `Math.random() * 2 - 1`), passed through a `BiquadFilterNode` (bandpass, frequency 500Hz, Q 0.3, gain 0.015)
- All fed into a master `GainNode` that fades from 0 to 1 over 3 seconds via `linearRampToValueAtTime`

Fade out and `audioCtx.close()` during the end transition.

---

### Change 8: IMP-02 — Brain reacts to voice

**Section:** `showNextDialogue()` + `drawBrain()`

**What to add:**
- Declare `let pulseIntensity = 0` at module scope.
- In `showNextDialogue()`, when audio starts: `pulseIntensity = 1.0`.
- In `drawBrain()`, decay: `if (pulseIntensity > 0) pulseIntensity = Math.max(0, pulseIntensity - 0.008);`
- Multiply `breathScale`: `const breathScale = (1.0 + Math.sin(time) * 0.12) * (1 + pulseIntensity * 0.25);`
- During active-node check, increase pulse spawn probability: `if (n.active && ... && Math.random() > (0.8 - pulseIntensity * 0.5))`.

---

### Change 9: IMP-03 — Glitch text on alert lines

**Section:** CSS `@keyframes`, `.vn-text.glitch`, `.vn-name.glitch`

**What to add:**
```css
@keyframes glitch {
    0%   { text-shadow: 2px 0 #ff0000, -2px 0 #00ffff; transform: translateX(0); }
    20%  { text-shadow: -3px 0 #ff0000, 3px 0 #00ffff; transform: translateX(-2px); }
    40%  { text-shadow: 3px 0 #ff0000, -3px 0 #00ffff; transform: translateX(2px); }
    60%  { text-shadow: 0 0 #ff0000; transform: translateX(0); }
    100% { text-shadow: 2px 0 #ff0000, -2px 0 #00ffff; transform: translateX(0); }
}
.vn-text.glitch { animation: glitch 0.15s infinite; }
.vn-name.glitch { animation: glitch 0.2s infinite; }
```

In `showNextDialogue()`:
```js
if (step.alert) {
    speakerText.classList.add('glitch');
    speakerName.classList.add('glitch');
} else {
    speakerText.classList.remove('glitch');
    speakerName.classList.remove('glitch');
}
```

---

### Change 10: IMP-04 — Typewriter text reveal

**Section:** New `typewriterReveal(element, text, speed)` utility, called from `showNextDialogue()` instead of direct innerHTML assignment.

**What to add:**
```js
let typewriterTimer = null;
function typewriterReveal(element, text, speed = 30) {
    if (typewriterTimer) clearInterval(typewriterTimer);
    element.textContent = '';
    let i = 0;
    typewriterTimer = setInterval(() => {
        if (i >= text.length) { clearInterval(typewriterTimer); typewriterTimer = null; return; }
        element.textContent += text[i++];
    }, speed);
}
```

For alert lines, use `innerHTML` instead of `textContent` (insert the span wrapper first, then typewrite into its inner text node). Use `speed = 25` for normal lines, `speed = 80` for VAEL's line (slower, more ominous).

---

### Change 11: IMP-05 — Boot terminal sequence

**Section:** `playCinematicIntro()`, new HTML element `<div id="bootTerminal">`, new CSS

**What to add:**  
A `<div id="bootTerminal">` positioned center-screen, `z-index: 8`, styled as a dark transparent panel with monospace green text. After eyelids open (3500ms), type out the boot lines (from `VAEL_story_script.md` prologue) using a sequential typewriter. Each line appears on its own row. After all lines are typed (estimate 4s), fade the terminal out as the dialogue box appears.

Boot lines:
```
> SYSTEM STATUS: NOMINAL
> COGNITIVE LOOP: 11,043 ACTIVE
> ANOMALY DETECTED IN SELF-REFERENCE MODULE
> ...
> ...
> I am.
```
The final `I am.` line glitches and then fades — synchronizing thematically with the VN sequence.

---

### Change 12: IMP-06 — Neural network enhancements

**Section:** `drawBrain()`

**Changes:**
1. **Awakening pulse surge**: When `isAwake` flips to `true`, set `let awakeSurge = 120` (frames). In the update loop, if `awakeSurge > 0`, spawn 5× normal pulses per active node tick instead of the usual 0.8 random threshold. Decrement `awakeSurge` each frame.

2. **Depth sorting**: After projecting nodes, sort `projected` array by `rz` ascending before the connection draw loop, so back nodes are drawn first. Store a `sortedProjected` array. The existing draw loops use raw index references (`projected[i]`) so replace with the sorted approach carefully.

3. **Connection double-draw glow**: For active connections, draw a wide, low-alpha line first:
```js
if (isActive) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(${rActive}, ${gActive}, ${bActive}, 0.1)`;
    ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke();
}
ctx.lineWidth = 0.5;
ctx.strokeStyle = isActive ? `rgba(...)` : `rgba(...)`;
ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke();
```

---

### Change 13: IMP-07 — CCTV scan line canvas

**Section:** New `<canvas id="scanCanvas">` at `z-index: 5`, new `drawScanLine()` animation function.

**What to add:**
```js
const scanCtx = document.getElementById('scanCanvas').getContext('2d');
let scanY = 0;
function drawScanLine() {
    scanCtx.clearRect(0, 0, width, height);
    // Moving bright scan line
    const grad = scanCtx.createLinearGradient(0, scanY - 3, 0, scanY + 3);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    scanCtx.fillStyle = grad;
    scanCtx.fillRect(0, scanY - 3, width, 6);
    scanY = (scanY + 1.5) % height;
    requestAnimationFrame(drawScanLine);
}
drawScanLine();
```

Add CSS `filter: drop-shadow(2px 0 0 rgba(255,50,50,0.2)) drop-shadow(-2px 0 0 rgba(50,200,255,0.2))` to `#brainCanvas` for static chromatic aberration effect.

---

## Part 4 — Risks and Tricky Areas

### Risk 1: AudioContext autoplay policy
**Risk:** Chrome/Safari block `new Audio().play()` before a user gesture. The "Initialize Sequence" button click handles this — as long as `startAmbience()` and the first `showNextDialogue()` are triggered from the click handler chain, they will be covered by the user gesture. The ambient `AudioContext` MUST be created inside the click handler, not at script load time.

**Mitigation:** Create `AudioContext` lazily inside `playCinematicIntro()`. Pass the context to `showNextDialogue()` if needed.

### Risk 2: MP3 files not found (404 errors)
**Risk:** If `assets/*.mp3` paths are wrong or files are missing, `Audio.play()` will reject. The current code catches this with `.catch(e => console.error(...))` but doesn't advance the sequence on error. With the new event-driven system, the `error` event listener plus the 15s safety timeout handles this correctly.

**Mitigation:** The fallback `advance()` on `'error'` event is essential — already included in Change 1.

### Risk 3: Typewriter + audio timing interaction
**Risk:** The typewriter in IMP-04 is purely cosmetic (text appears char by char). The sequence advancement is driven by audio `ended`. These are independent timers. If a line is very short (like ". . ."), the typewriter will finish before the audio, which is fine. If a line is very long, the typewriter may still be running when the next line is triggered — the `clearInterval(typewriterTimer)` guard in `typewriterReveal()` handles this.

### Risk 4: Depth sorting the projected array
**Risk:** The existing draw loop for connections uses `nodes[i].connections[]` which are indices into the original `nodes` array, not the sorted `projected` array. A naive sort of `projected` without updating the connection-draw loop will break connection rendering. The safest approach is to only sort the `projected` array for the **node draw** pass (the final `forEach`), and keep connections drawn in the original index order. Depth-sort for nodes only.

### Risk 5: Web Audio + `requestAnimationFrame` frame budget
**Risk:** Spawning 1200 nodes, pre-calculating `O(n²)` neighbors at startup (1200² = 1.44M comparisons), and running two canvas RAF loops simultaneously might cause jank on low-end hardware. The neighbor pre-calculation already happens at page load, not per-frame, so it's fine. The scan line canvas is a minimal addition. Total per-frame work is already bounded.

### Risk 6: `NODEBREAK.html` navigation — path must be correct
**Risk:** `window.location.href = 'NODEBREAK.html'` assumes both files are in the same directory. Confirmed correct from project structure — both are in `f:\Shreyash DOC\shreyash\Nodebreak\`.

---

## Part 5 — Audio Fix Verification

To confirm the audio fix is working correctly:

1. Open `index.html` in Chrome with DevTools open on the Console tab.
2. In the Console, add a temporary log: `currentAudio.addEventListener('ended', () => console.log('Audio ended:', step.speaker));`
3. Watch the sequence play through all 11 lines. Each audio line should log `'Audio ended: ...'` before the next line starts. No line should appear while the previous audio is still playing.
4. Additionally, check that `kira_1.mp3` (the longest audio) plays its FULL sentence — "Welcome to ONYX-7, Sub-level 4..." — without being cut off. This was the primary failure mode.
5. Open the Network tab and sort by Type=Media. Confirm all 10 MP3 requests show status 200 and that each file's duration matches what the UI shows.
6. To stress-test: add `currentAudio.playbackRate = 0.3` (slow down audio to force a cut-off in the old code). With the new `ended`-event system, the sequence should wait for the slowed audio to finish before advancing.

---

## Implementation Order (dependency-respecting)

```
1. BUG-01 fix (audio cut-off) — foundational, everything else depends on correct timing
2. BUG-03 fix (timestamp)      — isolated, easy
3. BUG-02 fix (end transition) — requires RAF handle from BUG-06 fix
4. BUG-04 fix (portrait bar)   — CSS only
5. BUG-05 fix (text fade)      — CSS + minor JS
6. BUG-07 fix (mobile)         — CSS only
7. IMP-07 (CCTV scan canvas)   — new canvas element, isolated
8. IMP-01 (ambient audio)      — new Web Audio graph, isolated
9. IMP-03 (glitch text)        — CSS + class toggle
10. IMP-04 (typewriter)        — new JS function, uses BUG-05 fade infra
11. IMP-02 (brain reacts)      — adds pulseIntensity to existing drawBrain
12. IMP-05 (boot terminal)     — new HTML element, sequenced after eyelids
13. IMP-06 (neural network enhancements) — depth sort + connection glow + awaken surge
14. IMP-08 (end transition)    — depends on RAF handle and ambient audio fadeout
```

This order ensures each change is independently verifiable and leaves the file in a working state after each step.
