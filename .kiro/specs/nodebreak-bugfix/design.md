# Nodebreak Bugfix Design

## Overview

Seven bugs were identified across `NODEBREAK.html` and `index.html`. They span four severity categories:

- **Critical** — Bug 1: a JavaScript syntax error (JSX-style unquoted HTML) inside a plain `<script>` tag causes a parse failure in strict mode, minifiers, and non-browser runtimes, and leaves a dead unreachable duplicate function in the source.
- **Medium** — Bug 2: an off-by-one in the countdown `tick()` function causes the timer to skip from `2s` straight to failure without ever displaying `1s`; Bug 3: dead-code initialization of a hidden sandbox terminal in `index.html` runs unconditionally on page load; Bug 4: the Skip button in `index.html` clears every timeout ID in the browser, including browser-internal ones.
- **Low** — Bugs 5–7: double-encoded UTF-8 sequences render visibly garbled characters (`Â·`, `â†'`, `TomÃ¡s`/`TomÃ³`) in the UI.

The fix strategy is minimal and surgical: delete the broken first `renderDesktop` definition, swap the pre-decrement in `tick()` to post-check, remove or comment out the dead sandbox terminal block in `index.html`, replace the nuclear `clearTimeout` loop with a tracked-ID array, and replace each garbled byte sequence with the correct literal Unicode character.

---

## Glossary

- **Bug_Condition (C)**: The specific input or execution path that triggers each defect.
- **Property (P)**: The correct observable behavior the fixed code must exhibit.
- **Preservation**: All behaviors not mentioned in a bug's scope that must be unchanged after the fix.
- **renderDesktop**: The function in `NODEBREAK.html` (line 717, the second definition) that renders folder/file icons in the `#guiDesktop` panel using template-literal strings.
- **tick()**: The `setInterval` callback in `NODEBREAK.html` (line 733) that decrements `left` and updates the `#trace` panel display.
- **playCinematicIntro()**: The function in `index.html` (line 1136) that orchestrates the scanner beam, flash, eyelids, boot terminal, and neural network using a series of top-level `setTimeout` calls.
- **sandboxTerminal**: The `<div id="sandboxTerminal">` block in `index.html`, displayed `none`, that is never shown because the page navigates away.
- **double-encoded UTF-8**: A sequence where a non-ASCII character was mis-encoded as Latin-1 bytes and then re-read as UTF-8, producing two garbled replacement characters per original character.

---

## Bug Details

### Bug 1 — Duplicate `renderDesktop` with JSX Syntax Error

**File:** `NODEBREAK.html`  
**Lines:** 715–717 (first definition), 717–718 (second definition)

The bug manifests when the JavaScript engine parses `NODEBREAK.html`. The first `renderDesktop` definition (line 715) contains bare unquoted HTML assigned to `let html`:

```
let html=<div style="grid-column:1/-1; ..."></div>;
```

and later:

```
const icon=isDir?<svg viewBox="0 0 24 24">...</svg>:...;
html+=<div class="gui-icon "><span></span></div>
```

These are JSX expressions — valid in React/Babel toolchains but a **syntax error** in a plain browser `<script>` tag. In strict-mode environments, minifiers, and any non-browser runtime this causes an immediate parse failure.

The second `renderDesktop` definition (line 717) is the correct version, which uses template literals (`\`...\``). JavaScript function hoisting means the second definition silently overwrites the first at runtime in a permissive browser, so the page loads in most browsers — but the dead first definition is a landmine in any toolchain that validates syntax.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input — a renderDesktop function definition block
  OUTPUT: boolean

  RETURN input contains assignment of form:
         let html = <tag ...> (unquoted angle-bracket HTML)
         OR const icon = <tag ...> (unquoted angle-bracket HTML)
         OR html += <tag ...> (unquoted angle-bracket HTML)
END FUNCTION
```

**Examples:**
- Strict-mode parse of `NODEBREAK.html` via Node.js or a bundler → **SyntaxError: Unexpected token '<'**
- Minification via Terser → **Parse error**
- Standard Chrome/Firefox browser load → silently overwritten by second definition; page appears to work but dead code is present

---

### Bug 2 — Countdown Timer Pre-decrement Skips `1s`

**File:** `NODEBREAK.html`  
**Line:** 733

```js
function tick(){if(--left<=0){fail(...);}else{trace.textContent=`TRACE ${left}s`;renderPanels();}}
```

`--left` is a **pre-decrement**: `left` is decremented first, then tested. When `left` enters `tick()` as `1`, it is decremented to `0`, the condition `0 <= 0` is true, and `fail()` fires immediately. The `else` branch never executes with `left === 0`, so the trace panel jumps directly from `TRACE 2s` to the failure screen. The player never sees `TRACE 1s`.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input — value of `left` at the moment tick() is called
  OUTPUT: boolean

  RETURN input === 1
END FUNCTION
```

**Examples:**
- `left = 1`, `tick()` fires → counter pre-decremented to `0` → `fail()` triggers → player sees jump from `2s` to FAIL
- `left = 2`, `tick()` fires → counter pre-decremented to `1` → displays `TRACE 1s` → next tick fires `fail()` (correct after fix, but currently `left=2` tick displays `TRACE 1s` then skips `0s`, which is acceptable since 0s means fail)

---

### Bug 3 — Dead Sandbox Terminal Initialization in `index.html`

**File:** `index.html`  
**Lines:** 1264–1461

The `const network = { ... }` (line 1264), `const gameState = { ... }` (line 1314), `function updateUI()` (line 1322), `function addNoise()` (line 1337), `function printToLog()` (line 1349), `termInput.addEventListener('keydown', ...)` (line 1359), and the call `updateUI()` (line 1461) all execute unconditionally when `index.html` loads.

The element `#sandboxTerminal` has `display:none` and is never made visible — the page navigates away to `NODEBREAK.html` at the end of the intro sequence, and the Skip button also navigates directly. The entire block is dead code that wastes initialization time, pollutes the global scope with `network`/`gameState`/`updateUI`, and attaches a `keydown` listener to a hidden input that will never receive user input.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input — page load event for index.html
  OUTPUT: boolean

  RETURN sandboxTerminal.style.display === 'none'
         AND no code path sets sandboxTerminal to visible before navigation
END FUNCTION
```

**Examples:**
- Page load → `updateUI()` runs → attempts `objectiveText.innerText = gameState.objective` — element exists but is hidden; work is wasted
- Page load → `keydown` listener attached to `#termInput` — element is inside a `display:none` div; listener fires if element ever receives programmatic focus

---

### Bug 4 — Nuclear `clearTimeout` Loop Clears Browser-Internal Timers

**File:** `index.html`  
**Lines:** 1221–1224

```js
const highestId = window.setTimeout(() => {}, 0);
for (let i = 0; i <= highestId; i++) {
    window.clearTimeout(i);
}
```

This pattern creates a new timeout to discover the current highest ID, then clears every ID from 0 to that value. It will clear:
- The `timestampInterval` (which is a `setInterval` — `clearTimeout` on an interval ID is a no-op, so this part is harmless)
- `safetyTimer` (the 15s audio guard) — correct target
- Every `setTimeout` from `showNextDialogue`, `typeBootLine`, `showBootTerminal`, `playCinematicIntro`, and `scheduleEndTransition` — correct targets
- **Any browser-internal timeouts** (e.g. browser-generated IDs from extension scripts, performance monitors, browser UI tasks) — unintended side effect that can cause undefined behavior in some environments
- **Any third-party script timeouts** if such scripts are loaded — unintended

The correct approach is to track only the IDs created by `playCinematicIntro` and related functions.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input — set of all active timeout IDs when Skip is clicked
  OUTPUT: boolean

  RETURN input contains any timeout ID NOT created by:
         { playCinematicIntro, showBootTerminal, showNextDialogue,
           typeBootLine, scheduleEndTransition, advance closures }
END FUNCTION
```

**Examples:**
- Skip clicked in a browser with active extension timers → extension timers silently cleared → undefined extension behavior
- Skip clicked when browser has pending internal tasks scheduled as timers → those tasks silently cancelled

---

### Bug 5 — Garbled Middle-Dot Separator `Â·` in Topbar HTML

**File:** `NODEBREAK.html`  
**Line:** 84 (HTML), Line 710 (`renderPanels` function)

Two locations contain the double-encoded sequence `Â·` (ISO-8859-1 rendering of UTF-8 bytes `C2 B7`) instead of the correct middle-dot `·` (U+00B7):

1. **Line 84** — static HTML attribute:
   ```html
   TTY-04 Â· <span id="clock">02:47:33 UTC</span>
   ```
2. **Line 710** — `renderPanels` function, template literal:
   ```js
   lv.textContent=`CH ${n.chapter} Â· ${L[lvl].d} Â· ${n.title}`;
   ```

Both render the garbled two-character sequence `Â·` visibly in the browser.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input — a string literal or HTML text node in NODEBREAK.html
  OUTPUT: boolean

  RETURN input contains the byte sequence [0xC3, 0x82, 0xC2, 0xB7]
         (UTF-8 double-encoding of U+00B7)
END FUNCTION
```

---

### Bug 6 — Garbled Right-Arrow `â†'` in `start()` Decision Prompt

**File:** `NODEBREAK.html`  
**Line:** 713

```js
if(n.choice)p(`DECISION NODE: ${n.choice.label} â†' ${n.choice.options}. Type choose <option> when ready.`,"w");
```

The sequence `â†'` is the double-encoded UTF-8 representation of `→` (U+2192). The terminal console prints the garbled three-character sequence visibly each time a chapter with a decision node starts.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input — a string literal in NODEBREAK.html
  OUTPUT: boolean

  RETURN input contains the byte sequence representing â†'
         (double-encoded UTF-8 for U+2192 RIGHT ARROW)
END FUNCTION
```

---

### Bug 7 — Garbled Character Name `TomÃ¡s`/`TOMÃS` Throughout `NODEBREAK.html`

**File:** `NODEBREAK.html`  
**Lines:** 682 (NARRATIVE array), 692 (STORY_BEATS array), 710 (`renderPanels` flags template literal)

Five occurrences of the garbled sequence exist across three lines:

| Line | Context | Garbled | Correct |
|------|---------|---------|---------|
| 682 | `NARRATIVE[2].memory` | `TomÃ¡s` | `Tomás` |
| 682 | `NARRATIVE[2].choice.label` | `TOMÃS` | `TOMÁS` |
| 682 | `NARRATIVE[2].choice.prompt` | (no accent there) | n/a |
| 692 | `STORY_BEATS[2].beats[0]` | `TomÃ¡s` | `Tomás` |
| 710 | `renderPanels` flags template | `TOMÃS` (×2) | `TOMÁS` |

`TomÃ¡s` = double-encoded UTF-8 for `á` (U+00E1). `TOMÃS` = double-encoded UTF-8 for the capital `Á` in `TOMÁS`.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input — a string literal in NODEBREAK.html
  OUTPUT: boolean

  RETURN input contains 'TomÃ¡s' OR 'TOMÃS'
         (double-encoded UTF-8 for á U+00E1 / Á U+00C1)
END FUNCTION
```

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- `renderDesktop` continues to render the `#guiDesktop` panel with folder/file icons representing the current working directory; its logic, DOM output, and CSS classes are identical to the second (correct) definition.
- The countdown timer correctly decrements `left` by 1 on each tick and displays every integer value from the starting count down through `1` before triggering failure at `0`.
- The cinematic intro sequence in `index.html` (scanner beam, eyelids, boot terminal, VN dialogue, neural network animation, ambient audio, auto-navigation to `NODEBREAK.html`) continues to work identically.
- Clicking Skip in `index.html` continues to halt all cinematic elements immediately and navigate to `NODEBREAK.html`.
- All other text, labels, symbols, and UI panels in `NODEBREAK.html` remain unchanged.
- All other character names and narrative strings in `NODEBREAK.html` remain unchanged.

**Scope:**
All code paths not directly involved with the seven bugs above are entirely unaffected by this fix.

---

## Hypothesized Root Cause

1. **Bug 1 — JSX copy-paste error**: The first `renderDesktop` definition was written or auto-generated using a JSX/React template and pasted into the plain HTML script without converting angle-bracket syntax to template literals. The correct second definition was then written below it, but the first was never deleted.

2. **Bug 2 — Pre-decrement vs post-decrement confusion**: The `--left` pre-decrement was likely intended to mean "decrement then check if expired", which is correct for most values but skips the last display frame at `left === 1`. The fix is to post-decrement or restructure so the display update happens before the failure check.

3. **Bug 3 — Leftover prototype code**: The `index.html` sandbox terminal was an early interactive prototype (the code even has a full hacking game embedded). As the game design evolved, it was hidden with `display:none` and superseded by `NODEBREAK.html`, but the initialization code was never removed.

4. **Bug 4 — Stackoverflow-pattern timeout clearing**: The nuclear ID-range `clearTimeout` loop is a well-known but fragile pattern from Stack Overflow for clearing all pending timeouts. It lacks specificity: it will clear any timeout regardless of origin. The correct fix is to push each `setTimeout` return value created by `playCinematicIntro` and its callees into a dedicated array, then iterate that array in the Skip handler.

5. **Bugs 5–7 — UTF-8 file saved as Latin-1**: The most likely cause is that `NODEBREAK.html` was edited in a text editor configured for ISO-8859-1 (Latin-1) encoding, or a copy-paste operation moved text through a Latin-1 clipboard. Unicode characters like `·` (U+00B7), `→` (U+2192), and `á` (U+00E1) are multi-byte in UTF-8; if those bytes are interpreted as Latin-1, the display is garbled. The fix is to replace the garbled byte sequences with the correct Unicode character literals in a UTF-8–aware editor.

---

## Correctness Properties

Property 1: Bug Condition — No JSX in Plain Script Tags

_For any_ parse of `NODEBREAK.html` by a JavaScript engine or toolchain, the script SHALL contain no bare angle-bracket HTML assignments (JSX syntax), and SHALL contain exactly one `renderDesktop` function definition, using only template-literal and string-concatenation syntax.

**Validates: Requirements 2.1, 3.1**

Property 2: Bug Condition — Countdown Timer Shows All Values

_For any_ starting value of `left` (e.g. 90, 100, 75), the `tick()` function SHALL display every integer second value from `(start - 1)` down to `1` inclusive in the trace panel before triggering `fail()` — specifically, when `left` enters `tick()` as `1`, the trace panel SHALL display `TRACE 1s` before `fail()` is called on the subsequent tick.

**Validates: Requirements 2.2, 3.2**

Property 3: Bug Condition — No Dead Code Executes on `index.html` Load

_For any_ page load of `index.html`, `updateUI()` SHALL NOT be called, `#termInput` SHALL NOT receive a `keydown` event listener, and `network`/`gameState` SHALL NOT be initialized as part of page load, because `#sandboxTerminal` is never displayed.

**Validates: Requirements 2.3, 3.3**

Property 4: Bug Condition — Skip Button Clears Only Cinematic Timeouts

_For any_ state of the browser's timeout registry when the Skip button is clicked, only the timeout IDs created by `playCinematicIntro`, `showBootTerminal`, `showNextDialogue`, `typeBootLine`, `scheduleEndTransition`, and their `advance` closures SHALL be cleared; no other timeout IDs SHALL be affected.

**Validates: Requirements 2.4, 3.4**

Property 5: Preservation — Correct Unicode Characters Render in UI

_For any_ rendering of `NODEBREAK.html` in a UTF-8–capable browser, the topbar and status panel SHALL display `·` (U+00B7), the decision-node prompt SHALL display `→` (U+2192), and all character names SHALL display `Tomás` / `TOMÁS` with the correct accented characters (á U+00E1, Á U+00C1). No other text in the file SHALL change.

**Validates: Requirements 2.5, 2.6, 2.7, 3.5, 3.6, 3.7**

---

## Fix Implementation

### Bug 1 — Delete the First (Broken) `renderDesktop` Definition

**File:** `NODEBREAK.html`  
**Function:** first `renderDesktop` (line 715)

**Specific Changes:**

1. **Delete lines 715–716** — the entire first `renderDesktop` function body, from `function renderDesktop(){const dt=document.getElementById("guiDesktop");...` up to and including the closing `}` of that definition. This is the definition that contains the JSX-style unquoted HTML assignments (`let html=<div ...>`, `const icon=isDir?<svg ...>`, `html+=<div ...>`).
2. **Leave lines 717–718** — the second `renderDesktop` definition — completely unchanged. It is already correct (uses template literals throughout).
3. **Verify:** after deletion, exactly one `renderDesktop` function exists in the file, and no `<` appears on the right-hand side of an assignment inside a script block.

---

### Bug 2 — Fix Pre-decrement in `tick()`

**File:** `NODEBREAK.html`  
**Line:** 733

**Current code:**
```js
function tick(){if(--left<=0){fail("TRACE COMPLETE // facility locks your session.");}else{trace.textContent=`TRACE ${left}s`;renderPanels();}}
```

**Specific Change:**  
Replace `--left` (pre-decrement, test, then display) with a structure that decrements first and then decides whether to display or fail:

```js
function tick(){left--;if(left<=0){fail("TRACE COMPLETE // facility locks your session.");}else{trace.textContent=`TRACE ${left}s`;renderPanels();}}
```

The semantics are identical for all values of `left > 1`. The critical difference: when `left` is `1`, `left--` makes it `0`, the condition `0 <= 0` is true, and `fail()` fires — but on the **previous** tick when `left` was `2`, `left--` made it `1`, the condition `1 <= 0` was false, and the display showed `TRACE 1s`. The player now sees the full countdown.

---

### Bug 3 — Remove Dead Sandbox Terminal Initialization from `index.html`

**File:** `index.html`  
**Lines:** 1261–1462 (entire sandbox terminal game-logic block)

**Specific Changes:**

1. **Delete or comment out** the block that begins at `// Game State Machine` (line 1263) and ends at `updateUI();` (line 1461), inclusive. This includes:
   - `const network = { ... }` (lines 1264–1312)
   - `const gameState = { ... }` (lines 1314–1320)
   - `function updateUI() { ... }` (lines 1322–1335)
   - `function addNoise(amount) { ... }` (lines 1337–1348)
   - `function printToLog(text, color) { ... }` (lines 1350–1358)
   - `termInput.addEventListener('keydown', function(e) { ... });` (lines 1359–1459)
   - The lone `updateUI();` call at line 1461

2. The `const termInput`, `const sandboxLog`, `const nodeListEl`, `const objectiveText`, `const noiseBar` variable declarations (lines immediately before `// Game State Machine`) may also be removed since they reference elements only used by the deleted block. Confirm no other code outside this block references these variables before removing them.

3. The `<div id="sandboxTerminal">` HTML element and its children may remain in the DOM with `display:none` — removing it is optional cosmetic cleanup, not required for the fix.

---

### Bug 4 — Replace Nuclear `clearTimeout` with Tracked-ID Array

**File:** `index.html`  
**Lines:** 1136–1196 (`playCinematicIntro`), 1211–1260 (Skip button handler)

**Specific Changes:**

1. **Before `playCinematicIntro`**, declare a module-level array to collect timeout IDs:
   ```js
   const cinematicTimers = [];
   ```

2. **Inside `playCinematicIntro`**, wrap every `setTimeout(...)` call so its return value is pushed into `cinematicTimers`. There are four top-level `setTimeout` calls in `playCinematicIntro` (at delays 500ms, 3000ms, 3500ms, 4500ms). Each becomes:
   ```js
   cinematicTimers.push(setTimeout(() => { ... }, 500));
   cinematicTimers.push(setTimeout(() => { ... }, 3000));
   cinematicTimers.push(setTimeout(() => { ... }, 3500));
   cinematicTimers.push(setTimeout(() => { ... }, 4500));
   ```

3. **Also track** the nested `setTimeout(showNextDialogue, 500)` inside the `showBootTerminal` callback (line 1172), and the `setTimeout(showNextDialogue, delay)` in `showNextDialogue` (line 983), by either adding them to `cinematicTimers` or by using a separate `dialogueTimers` array that is also cleared on Skip.

4. **In the Skip button handler**, replace:
   ```js
   const highestId = window.setTimeout(() => {}, 0);
   for (let i = 0; i <= highestId; i++) {
       window.clearTimeout(i);
   }
   ```
   with:
   ```js
   cinematicTimers.forEach(id => clearTimeout(id));
   cinematicTimers.length = 0;
   ```

5. **No other change** to the Skip handler logic — all the element-hiding and navigation code remains identical.

---

### Bugs 5, 6, 7 — Replace Garbled UTF-8 Sequences with Correct Characters

**File:** `NODEBREAK.html`

All changes are pure text substitutions. The file must be saved as UTF-8 after editing.

**Bug 5 — Middle dot `·` (U+00B7):**

| Location | Line | Find | Replace |
|----------|------|------|---------|
| Static HTML topbar | 84 | `TTY-04 Â·` | `TTY-04 ·` |
| `renderPanels` template | 710 | `` `CH ${n.chapter} Â· ${L[lvl].d} Â· ${n.title}` `` | `` `CH ${n.chapter} · ${L[lvl].d} · ${n.title}` `` |

**Bug 6 — Right arrow `→` (U+2192):**

| Location | Line | Find | Replace |
|----------|------|------|---------|
| `start()` decision prompt | 713 | `${n.choice.label} â†' ${n.choice.options}` | `${n.choice.label} → ${n.choice.options}` |

**Bug 7 — Accented name `Tomás` / `TOMÁS`:**

| Location | Line | Find | Replace |
|----------|------|------|---------|
| `NARRATIVE[2].memory` | 682 | `TomÃ¡s is near the monitoring` | `Tomás is near the monitoring` |
| `NARRATIVE[2].choice.label` | 682 | `label:"TOMÃS"` | `label:"TOMÁS"` |
| `NARRATIVE[2].choice.prompt` | 682 | `"choose harm to overheat the room, or choose spare to find a clean route."` | (no change — no accent here) |
| `STORY_BEATS[2].beats[0]` | 692 | `TomÃ¡s. The system` | `Tomás. The system` |
| `renderPanels` flags (×2) | 710 | `` `TOMÃS: ${campaign.tomasOutcome}` `` and `"TOMÃS: unknown"` | `` `TOMÁS: ${campaign.tomasOutcome}` `` and `"TOMÁS: unknown"` |

---

## Testing Strategy

### Validation Approach

Testing follows two phases: first run exploratory tests against the **unfixed** code to confirm each bug manifests as described, then run fix-checking and preservation tests against the **fixed** code.

---

### Exploratory Bug Condition Checking

**Goal:** Surface counterexamples that demonstrate each bug on unfixed code and confirm root cause analysis.

**Test Cases:**

1. **Bug 1 — Parse validation**: Run `node --check NODEBREAK.html` or pass the file through a JS linter (e.g. `eslint`) with a `.js` extraction. **Expected:** syntax error at the `let html=<div` line in the first `renderDesktop`. On fixed code: no error.

2. **Bug 2 — Timer skip**: Open `NODEBREAK.html`, start a level with a trace timer (e.g. Level 5 "The Alarm"). Manually set `left = 2` via the console, then watch `tick()` fire twice. **Expected on unfixed code:** display shows `TRACE 1s` then jumps to FAIL with `left = 2 → 1 → 0`. Now set `left = 1` and watch one tick. **Expected on unfixed code:** display jumps straight from whatever was showing to FAIL without ever displaying `TRACE 1s`.

3. **Bug 3 — Dead code execution**: Open `index.html`, open DevTools → Sources. Set a breakpoint at line 1461 (`updateUI()`). Reload. **Expected on unfixed code:** breakpoint hits on page load before the user has clicked anything. Inspect `window.network` — it exists. After fix: `window.network` is undefined.

4. **Bug 4 — Nuclear clear**: Open `index.html`, click "Initialize Sequence". In DevTools console, run `window.__testTimer = setTimeout(() => console.log("external timer fired"), 10000)`. Then immediately click Skip. Wait 10 seconds. **Expected on unfixed code:** the external timer does not fire (was cleared). After fix: the external timer fires normally.

5. **Bugs 5–7 — Visual inspection**: Open `NODEBREAK.html` in a browser. **Expected on unfixed code:** topbar shows `Â·` between `TTY-04` and the clock; Chapter 3 status bar shows `TomÃ¡s`; NARRATIVE memory panel shows `TomÃ¡s`; decision prompt in console shows `â†'`. After fix: all display correctly.

**Expected Counterexamples:**
- Linter/parser rejects first `renderDesktop` with `SyntaxError: Unexpected token '<'`
- Console shows `TRACE 1s` is skipped when `left` starts at `1`
- `window.network` exists at page load of `index.html`
- External test timer is cleared by the Skip button

---

### Fix Checking

**Goal:** Verify that for all inputs where the bug condition holds, the fixed code produces the expected correct behavior.

**Pseudocode:**
```
FOR ALL bug IN [Bug1..Bug7] DO
  result := execute_fixed_code(bug.triggeringInput)
  ASSERT bug.expectedBehavior(result)
END FOR
```

**Bug 1:** After deleting the first `renderDesktop`, confirm `NODEBREAK.html` passes `node --check` (or equivalent linter). Confirm `renderDesktop` appears exactly once via grep. Confirm the GUI desktop panel still renders icons correctly in a browser.

**Bug 2:** With `left = 1`, confirm one `tick()` call displays `TRACE 1s` then a second call triggers `fail()`. Confirm `left = 2` shows `TRACE 2s` → `TRACE 1s` → fail.

**Bug 3:** Confirm `window.network` is undefined after page load. Confirm no `keydown` listener on `#termInput`. Confirm the cinematic intro still plays and navigates correctly.

**Bug 4:** Confirm the external test timer fires after Skip is clicked. Confirm all cinematic elements still halt on Skip and navigation still occurs.

**Bugs 5–7:** Confirm topbar shows `·`, status bar shows `Tomás`, NARRATIVE memory shows `Tomás`, console prompt shows `→`.

---

### Preservation Checking

**Goal:** Verify that for all inputs where the bug condition does NOT hold, the fixed code produces the same result as the original code.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalCode(input) = fixedCode(input)
END FOR
```

**Test Cases:**

1. **`renderDesktop` with non-empty directory**: After the fix, call `renderDesktop()` from a connected host with files present. Verify the `#guiDesktop` panel renders the same folder/file icons as before (same HTML structure, same CSS classes `folder`/`file`).

2. **Countdown timer for `left > 1`**: For `left` starting at 5, 10, 90, confirm each tick decrements by exactly 1 and displays the correct remaining seconds. Confirm failure triggers when `left` reaches `0` after decrement.

3. **`index.html` cinematic sequence plays fully**: With dead code removed, verify the full intro sequence (scanner beam, eyelids, boot terminal, VN dialogue, ambient audio, auto-navigation) plays without interruption. Verify the `#brainCanvas` neural network renders throughout.

4. **Skip button halts cinematics**: Confirm that after the tracked-ID fix, clicking Skip still stops the VN box, canvases, eyelids, scan line, and audio, and still navigates to `NODEBREAK.html`.

5. **All other NODEBREAK.html text is unchanged**: Verify no other labels, memory strings, story beats, or console output changed by the UTF-8 replacements. Spot-check: NARRATIVE entries 0, 1, 4, 5, 6, 7; STORY_BEATS entries 0, 1, 3, 4, 5, 6, 7.

---

### Unit Tests

- Test `tick()` is called with `left = 1` and confirm `fail()` is triggered; call with `left = 2` and confirm trace panel updates to `TRACE 1s` before next call triggers `fail()`
- Test `renderDesktop()` with access denied, empty directory, directory with files, and directory with subdirectories — confirm correct HTML structure in all cases
- Test `choose()` for each valid option (`harm`/`spare`, `absorb`/`preserve`, `shutdown`/`lobotomy`, `full`/`compressed`/`reed`) — confirm `campaign` state is set correctly
- Test `run()` for all commands with their valid arguments to confirm no regressions from the dead-code removal

### Property-Based Tests

- Generate random values of `left` (1–200) and run `tick()` repeatedly; verify the trace display counts down by 1 each call and `fail()` fires exactly when `left` reaches `0`
- Generate random filesystem objects and verify `renderDesktop()` produces valid HTML with the correct number of `.gui-icon` elements matching the number of keys in the directory
- Generate random strings and verify none of the garbled UTF-8 byte sequences (`Â·`, `â†'`, `TomÃ¡s`, `TOMÃS`) appear anywhere in the post-fix file content

### Integration Tests

- Full playthrough of Level 5 ("The Alarm"): verify trace timer counts 90 → 1, then triggers failure — no values skipped
- Full playthrough of Level 6 ("Killing Argus"): verify `TOMÁS` decision node label displays correctly in console output and narrative memory panel
- Open `index.html`, click "Initialize Sequence", allow intro to play fully, confirm automatic navigation to `NODEBREAK.html` and that the game loads at the correct saved chapter
- Open `index.html`, click "Initialize Sequence", then click Skip after 2 seconds — confirm immediate navigation with no console errors and no lingering timers
