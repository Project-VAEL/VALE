# Nodebreak Bug Audit Report

**Files audited:** `NODEBREAK.html`, `index.html`  
**Date:** 2026-10-08

---

## Bugs Found and Fixed

### Bug 1 — NODEBREAK.html: `tick()` post-decrement and unconditional `renderPanels()`
- **File:** `NODEBREAK.html`
- **Location:** `tick()` function (line 119)
- **Description:** The original code used `left--` (post-decrement), so the display showed `"TRACE 0s"` for a full second on the final tick before failure fired. Additionally, `renderPanels()` was called unconditionally after the `if`, meaning it ran even when `fail()` had already fired, causing a second render on reset/stale state.
- **Fix applied:** Changed to pre-decrement (`--left`) and guarded `renderPanels()` with an `else` branch so it only runs when the timer is still counting.
  ```js
  // Before
  function tick(){trace.textContent=`TRACE ${left}s`;if(left--<=0)fail("TRACE COMPLETE // facility locks your session.");renderPanels()}
  // After
  function tick(){if(--left<=0){fail("TRACE COMPLETE // facility locks your session.");}else{trace.textContent=`TRACE ${left}s`;renderPanels();}}
  ```

---

### Bug 2 — index.html: `--scanner-start-bottom` is unitless CSS
- **File:** `index.html`
- **Location:** `:root` CSS block (line 17)
- **Description:** The custom property was declared as `--scanner-start-bottom: 15` (unitless). When used as `bottom: var(--scanner-start-bottom)`, this is invalid CSS — only `0` is valid as a unitless length. All browsers silently ignore it, placing the scanner beam at `bottom: 0px` instead of the intended `15px`.
- **Fix applied:** Added the `px` unit.
  ```css
  /* Before */
  --scanner-start-bottom: 15;
  /* After */
  --scanner-start-bottom: 15px;
  ```

---

### Bug 3 — index.html: Timestamp `setInterval` leaks — never cleared
- **File:** `index.html`
- **Location:** Script body, timestamp block (line 799); `scheduleEndTransition()` function; `skipBtn` click handler
- **Description:** The `setInterval` for the in-story timestamp was created with no stored ID, making it impossible to clear. After the user clicked Skip or after `scheduleEndTransition()` ran (navigating away), the interval continued firing every second trying to update `document.getElementById('timeDisplay')` on a page that no longer existed. This wastes CPU and causes errors post-navigation.
- **Fix applied:**
  1. Changed `setInterval(...)` to `const timestampInterval = setInterval(...)`.
  2. Added `clearInterval(timestampInterval)` at the top of `scheduleEndTransition()`.
  3. Added `clearInterval(timestampInterval)` in the `skipBtn` click handler immediately after stopping audio.

---

### Bug 4 — index.html: `const` declarations in unbraced `switch-case` blocks
- **File:** `index.html`
- **Location:** `termInput` `keydown` event handler, `switch(cmd)` statement — `case 'probe'`, `case 'connect'`, `case 'hack'` (lines ~1403–1452)
- **Description:** All three cases used bare `const` declarations (`const probeTarget`, `const connectTarget`, `const hackTarget`) inside `case` labels without surrounding block braces `{}`. Per the ECMAScript specification and enforced by modern JS engines (Chrome, Firefox, Edge), lexical declarations (`const`, `let`) inside `switch-case` without a block scope cause a `SyntaxError`. This would have silently broken the entire inline script block containing the `termInput` handler on strict-mode or modern browser parsing.
- **Fix applied:** Wrapped each affected `case` body in `{ ... }` to create a proper block scope for the `const` declarations.

---

## Bugs Noted but Not Fixed

None. All identified bugs have been fixed.

---

## Remaining Concerns

1. **Dead `sandboxTerminal` section in index.html:** The `<div id="sandboxTerminal">` block (with its own game network, `termInput`, `printToLog`, `addNoise`, etc.) appears to be an earlier prototype of the game that was superseded by `NODEBREAK.html`. It is never shown (`display: none` and nothing shows it). It does not cause a runtime error today because none of its event listeners fail (all referenced elements exist), but it is dead code that could cause confusion if maintained. It has not been removed since the task is bug-fixes only, not refactoring.

2. **`--glow` CSS variable set to 8-digit hex:** `start()` sets `--glow` to `l.bg[1]+"55"` (e.g. `"#72ff9155"`), producing an 8-digit hex color with alpha. This is valid in all modern browsers and renders correctly in the `box-shadow` context. No action needed.

3. **`JSON.parse(JSON.stringify(...))` for deep-cloning level data in `start()`:** This is safe for the current static data structure (no `Date`, `RegExp`, `undefined`, or circular refs). If the data schema grows to include such types, this pattern would silently drop values. No action taken as it is outside the bug-fix scope.

4. **`loadCampaign()` has a `try/catch` around `JSON.parse`** — correctly guarded. No issue.

5. **Safety-timeout of 15 000 ms per audio line in index.html:** Lines with missing audio files fall back after 2 500 ms (via the `error` and `play().catch` handlers), so the 15 000 ms safety timer is an additional belt-and-suspenders guard. Functional and correct.
