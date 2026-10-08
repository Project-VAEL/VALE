# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - JSX Syntax Error in First `renderDesktop` Definition
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists across all 7 bugs
  - **Scoped PBT Approach**: For each deterministic bug condition, scope the property to the concrete failing case
  - Bug 1 — Run `node --check NODEBREAK.html` (or extract the script block and run `node --check`): assert no SyntaxError; on unfixed code this FAILS with `Unexpected token '<'`
  - Bug 2 — Simulate `left = 1`, call `tick()` once; assert the trace panel shows `TRACE 1s` before `fail()` fires; on unfixed code this FAILS (panel never shows `TRACE 1s`)
  - Bug 3 — Load `index.html` and inspect `window.network`; assert it is `undefined`; on unfixed code this FAILS (`window.network` exists at page load)
  - Bug 4 — Inject an external `setTimeout(() => { window.__extFired = true; }, 10000)`, click Skip, wait, assert `window.__extFired === true`; on unfixed code this FAILS (external timer is cleared)
  - Bugs 5–7 — Read the raw bytes of `NODEBREAK.html`; assert no occurrence of `Â·`, `â†'`, `TomÃ¡s`, `TOMÃS`; on unfixed code this FAILS (all sequences present)
  - Run all checks on UNFIXED code
  - **EXPECTED OUTCOME**: All checks FAIL (this is correct — it proves each bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Correct Behaviors Are Unchanged
  - **IMPORTANT**: Follow observation-first methodology — run UNFIXED code with non-buggy inputs and record outputs
  - Observe Bug 2 preservation: `left = 5`, run `tick()` five times on UNFIXED code; record that each call decrements by 1 and displays `TRACE 4s`, `TRACE 3s`, `TRACE 2s`, `TRACE 1s` before `fail()` — these values are the baseline to preserve
  - Observe Bug 1 preservation: call `renderDesktop()` in a browser on UNFIXED code with a non-empty directory; record the exact `.gui-icon` HTML structure produced (template-literal path always wins at runtime)
  - Observe Bug 3 preservation: in UNFIXED `index.html`, click "Initialize Sequence" and verify the full cinematic sequence plays (scanner beam, eyelids, boot terminal, VN dialogue, ambient audio, auto-navigation); record that all elements animate correctly
  - Observe Bug 4 preservation: click Skip on UNFIXED code and confirm all cinematic elements halt and navigation to `NODEBREAK.html` occurs — record that this works correctly despite the nuclear clear
  - Observe Bugs 5–7 preservation: record all other text in `NODEBREAK.html` that must remain unchanged — topbar label `TTY-04`, all other NARRATIVE strings, all non-`TomÃ¡s` character names, all non-arrow console output
  - Write property-based tests asserting all observed baselines hold for inputs outside each bug condition
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 3. Fix Bug 1 — Delete the duplicate broken `renderDesktop` definition

  - [ ] 3.1 Implement the fix
    - Open `NODEBREAK.html`
    - Locate the first `renderDesktop` function definition (around line 715) — it is the one containing bare angle-bracket HTML assignments: `let html=<div ...>`, `const icon=isDir?<svg ...>`, `html+=<div ...>`
    - Delete the entire first `renderDesktop` block from its opening `function renderDesktop(){` through its closing `}` — do not touch anything else
    - Leave the second `renderDesktop` definition (the one using template literals with backtick strings) completely unchanged
    - Verify after deletion: grep for `renderDesktop` and confirm exactly one definition exists; grep for `=<` inside script blocks and confirm zero matches
    - Save the file as UTF-8
    - _Bug_Condition: isBugCondition(input) where input is a renderDesktop function block containing bare angle-bracket HTML assignments_
    - _Expected_Behavior: NODEBREAK.html parses without SyntaxError; exactly one renderDesktop function exists using template-literal syntax_
    - _Preservation: renderDesktop continues to render the guiDesktop panel with folder/file icons identical to the second (correct) definition_
    - _Requirements: 2.1, 3.1_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - No JSX Syntax Error
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Run `node --check NODEBREAK.html` (or equivalent linter/parser check on the extracted script)
    - **EXPECTED OUTCOME**: Test PASSES — no SyntaxError reported
    - Also verify `renderDesktop()` still renders icons correctly in a browser with a non-empty working directory
    - _Requirements: 2.1_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - GUI desktop panel renders identically
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Call `renderDesktop()` with access denied, empty directory, directory with files, and directory with subdirectories; confirm HTML structure and `.gui-icon` CSS classes match the observed baseline
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [ ] 4. Fix Bug 2 — Swap pre-decrement to post-decrement in `tick()`

  - [ ] 4.1 Implement the fix
    - Open `NODEBREAK.html`
    - Locate the `tick` function (around line 733):
      ```
      function tick(){if(--left<=0){fail("TRACE COMPLETE // facility locks your session.");}else{trace.textContent=`TRACE ${left}s`;renderPanels();}}
      ```
    - Replace `--left` with a post-decrement restructure so the decrement happens before the condition check and the display update happens with the already-decremented value:
      ```
      function tick(){left--;if(left<=0){fail("TRACE COMPLETE // facility locks your session.");}else{trace.textContent=`TRACE ${left}s`;renderPanels();}}
      ```
    - No other changes to this function or any surrounding code
    - Save the file
    - _Bug_Condition: isBugCondition(input) where input === 1 (left enters tick() as 1)_
    - _Expected_Behavior: when left is 1, tick() decrements to 0 and calls fail(); on the previous tick when left was 2 it decremented to 1 and displayed TRACE 1s — player sees every integer_
    - _Preservation: for all left > 1, tick() continues to decrement by 1 per call and display the correct remaining seconds_
    - _Requirements: 2.2, 3.2_

  - [ ] 4.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Countdown Shows All Values Including `1s`
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Simulate `left = 1`, call `tick()` once; assert trace panel updates to `TRACE 1s` and fail() does NOT fire on this tick; call `tick()` again and assert fail() fires
    - **EXPECTED OUTCOME**: Test PASSES — `TRACE 1s` is displayed before failure
    - _Requirements: 2.2_

  - [ ] 4.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Timer decrements correctly for all `left > 1`
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - For `left` starting at 5, 10, 90 — confirm each tick decrements by exactly 1 and displays the correct remaining seconds; confirm fail() fires when left reaches 0
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [ ] 5. Fix Bug 3 — Remove dead sandbox terminal initialization from `index.html`

  - [ ] 5.1 Implement the fix
    - Open `index.html`
    - Locate the block that begins with the comment `// Game State Machine` (around line 1263) and ends with the bare `updateUI();` call (around line 1461)
    - Delete or comment out the entire block, which includes:
      - `const network = { ... }` — the full hacking game network object
      - `const gameState = { ... }` — game state initialization
      - `function updateUI() { ... }` — UI update function
      - `function addNoise(amount) { ... }` — noise function
      - `function printToLog(text, color) { ... }` — log function
      - `termInput.addEventListener('keydown', function(e) { ... });` — the keydown listener
      - The lone `updateUI();` call at the bottom
    - Also remove the variable declarations immediately before this block (`const termInput`, `const sandboxLog`, `const nodeListEl`, `const objectiveText`, `const noiseBar`) since they reference elements only used by the deleted block — confirm no other code outside this block references these variables first
    - The `<div id="sandboxTerminal">` HTML element may remain in the DOM with `display:none` — removing it is optional
    - Save the file
    - _Bug_Condition: isBugCondition(input) where sandboxTerminal.style.display === 'none' AND no code path sets it visible before navigation_
    - _Expected_Behavior: window.network is undefined after page load; no keydown listener on termInput; updateUI() is never called on page load_
    - _Preservation: cinematic intro sequence, neural network animation, VN dialogue, ambient audio, and auto-navigation to NODEBREAK.html all continue to work identically_
    - _Requirements: 2.3, 3.3_

  - [ ] 5.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - No Dead Code Executes on Page Load
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Load `index.html` and inspect `window.network` — assert it is `undefined`
    - Confirm no `keydown` listener is attached to `#termInput`
    - **EXPECTED OUTCOME**: Test PASSES — dead code no longer runs on load
    - _Requirements: 2.3_

  - [ ] 5.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Full cinematic intro plays correctly
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Click "Initialize Sequence" and verify the full intro plays: scanner beam sweeps, eyelids open, boot terminal types, VN dialogue sequences through all 11 lines, ambient audio runs, and the page auto-navigates to NODEBREAK.html
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [ ] 6. Fix Bug 4 — Replace nuclear `clearTimeout` loop with tracked-ID array

  - [ ] 6.1 Implement the fix
    - Open `index.html`
    - Before the `playCinematicIntro` function declaration, add a module-level array:
      ```js
      const cinematicTimers = [];
      ```
    - Inside `playCinematicIntro`, wrap each of the four top-level `setTimeout` calls so their return values are pushed into `cinematicTimers`:
      ```js
      cinematicTimers.push(setTimeout(() => { /* 500ms: scanner beam */ }, 500));
      cinematicTimers.push(setTimeout(() => { /* 3000ms: flash + eyelids close */ }, 3000));
      cinematicTimers.push(setTimeout(() => { /* 3500ms: eyelids open + boot terminal */ }, 3500));
      cinematicTimers.push(setTimeout(() => { /* 4500ms: node spawning */ }, 4500));
      ```
    - Also track the nested `setTimeout(showNextDialogue, 500)` inside the `showBootTerminal` callback, and the `setTimeout(showNextDialogue, delay)` inside `showNextDialogue`, by pushing their return values into `cinematicTimers`
    - In the Skip button `click` handler, replace the nuclear clear loop:
      ```js
      // REMOVE this:
      const highestId = window.setTimeout(() => {}, 0);
      for (let i = 0; i <= highestId; i++) {
          window.clearTimeout(i);
      }
      // REPLACE with:
      cinematicTimers.forEach(id => clearTimeout(id));
      cinematicTimers.length = 0;
      ```
    - All other Skip handler code (element hiding, audio fade, navigation) remains identical
    - Save the file
    - _Bug_Condition: isBugCondition(input) where input contains any timeout ID not created by { playCinematicIntro, showBootTerminal, showNextDialogue, typeBootLine, scheduleEndTransition, advance closures }_
    - _Expected_Behavior: only timeout IDs in cinematicTimers are cleared; all other browser/extension timeouts are unaffected_
    - _Preservation: clicking Skip still immediately halts all cinematic elements and navigates to NODEBREAK.html_
    - _Requirements: 2.4, 3.4_

  - [ ] 6.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Skip Clears Only Cinematic Timeouts
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Inject `window.__extFired = false; window.__extTimer = setTimeout(() => { window.__extFired = true; }, 10000);` before clicking Skip; after Skip, wait and assert `window.__extFired === true`
    - **EXPECTED OUTCOME**: Test PASSES — external timer is not cleared
    - _Requirements: 2.4_

  - [ ] 6.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Skip still halts cinematics and navigates
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Click Skip after 2 seconds into the intro; confirm VN box hides, canvases hide, eyelids reset, scan line stops, audio fades, and navigation to NODEBREAK.html occurs with no console errors
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [ ] 7. Fix Bugs 5, 6, 7 — Replace all garbled UTF-8 sequences with correct Unicode characters

  - [ ] 7.1 Implement the fix
    - Open `NODEBREAK.html` in a UTF-8–aware editor (confirm the file encoding is UTF-8 before and after saving)
    - **Bug 5 — Middle dot `·` (U+00B7):** make two replacements:
      - Line ~84 (static HTML topbar): replace `TTY-04 Â·` with `TTY-04 ·`
      - Line ~710 (`renderPanels` template literal): replace `` `CH ${n.chapter} Â· ${L[lvl].d} Â· ${n.title}` `` with `` `CH ${n.chapter} · ${L[lvl].d} · ${n.title}` ``
    - **Bug 6 — Right arrow `→` (U+2192):** make one replacement:
      - Line ~713 (`start()` decision prompt): replace `${n.choice.label} â†' ${n.choice.options}` with `${n.choice.label} → ${n.choice.options}`
    - **Bug 7 — Accented name `Tomás` / `TOMÁS`:** make five replacements:
      - `NARRATIVE[2].memory` (~line 682): replace `TomÃ¡s is near the monitoring` with `Tomás is near the monitoring`
      - `NARRATIVE[2].choice.label` (~line 682): replace `label:"TOMÃS"` with `label:"TOMÁS"`
      - `STORY_BEATS[2].beats[1]` (~line 692): replace `TomÃ¡s. The system` with `Tomás. The system`
      - `renderPanels` flags template (~line 710), first occurrence: replace `` `TOMÃS: ${campaign.tomasOutcome}` `` with `` `TOMÁS: ${campaign.tomasOutcome}` ``
      - `renderPanels` flags template (~line 710), second occurrence: replace `"TOMÃS: unknown"` with `"TOMÁS: unknown"`
    - Confirm no other text in the file changed — spot-check NARRATIVE entries 0, 1, 4, 5, 6, 7 and STORY_BEATS entries 0, 1, 3, 4, 5, 6, 7
    - Save the file as UTF-8
    - _Bug_Condition (5): isBugCondition(input) where input contains byte sequence [0xC3,0x82,0xC2,0xB7] (double-encoded U+00B7)_
    - _Bug_Condition (6): isBugCondition(input) where input contains â†' (double-encoded U+2192)_
    - _Bug_Condition (7): isBugCondition(input) where input contains TomÃ¡s or TOMÃS (double-encoded U+00E1 / U+00C1)_
    - _Expected_Behavior: topbar displays · (U+00B7); decision prompt displays → (U+2192); all character names display Tomás / TOMÁS with correct accented characters_
    - _Preservation: all other text, labels, symbols, narrative strings, and story beats remain unchanged_
    - _Requirements: 2.5, 2.6, 2.7, 3.5, 3.6, 3.7_

  - [ ] 7.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Correct Unicode Characters Render in UI
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Read the raw text of `NODEBREAK.html`; assert zero occurrences of `Â·`, `â†'`, `TomÃ¡s`, `TOMÃS`
    - Open `NODEBREAK.html` in a browser; visually confirm topbar shows `TTY-04 ·`, Chapter 3 narrative memory shows `Tomás`, the Chapter 3 status bar shows `TOMÁS`, and the decision-node console prompt shows `→`
    - **EXPECTED OUTCOME**: Test PASSES — all garbled sequences are replaced
    - _Requirements: 2.5, 2.6, 2.7_

  - [ ] 7.3 Verify preservation tests still pass
    - **Property 2: Preservation** - All other text in NODEBREAK.html is unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Spot-check NARRATIVE entries 0, 1, 4, 5, 6, 7 and STORY_BEATS entries 0, 1, 3, 4, 5, 6, 7 — confirm no accidental changes
    - Confirm topbar label `TTY-04` (without the separator), all non-`Tomás` character names, and all non-arrow console output remain identical
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [ ] 8. Checkpoint — Ensure all tests pass
  - Re-run the full exploration test suite (task 1 checks for all 7 bugs) — all should PASS on the fixed code
  - Re-run the full preservation test suite (task 2 checks) — all should PASS
  - Open `NODEBREAK.html` in a browser and run a full playthrough of Level 5 ("The Alarm"): verify the trace timer counts from the starting value down through `1s` with no values skipped, then triggers failure
  - Open `NODEBREAK.html` in a browser and start Level 6 ("Killing Argus"): verify the `TOMÁS` decision node label and `→` arrow display correctly in console output and the narrative memory panel
  - Open `index.html`, click "Initialize Sequence", allow the full intro to play, confirm auto-navigation to `NODEBREAK.html` with no console errors
  - Open `index.html`, click "Initialize Sequence", then click Skip after 2 seconds — confirm immediate navigation with no console errors and no lingering timers
  - Run `node --check NODEBREAK.html` (or equivalent) and confirm zero syntax errors
  - Ensure all tests pass; ask the user if any questions arise
