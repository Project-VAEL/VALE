# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Chapter 1 Cinematic Page Missing (404)
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate that `cinematic_ch1.html` does not exist and produces a 404
  - **Scoped PBT Approach**: The bug condition is deterministic — scope the property to the concrete failing case: navigate to `cinematic_ch1.html` directly (mirrors what `finishLevel()` triggers for `lvl === 0`)
  - Open a browser (or use a fetch/HEAD request in a test script) and navigate to `cinematic_ch1.html` relative to the project root
  - Assert that the HTTP status is **200** and the page contains "CHAPTER 2" and "ARGUS IS WATCHING" (from Expected Behavior in design)
  - Run test on UNFIXED code (before creating `cinematic_ch1.html`)
  - **EXPECTED OUTCOME**: Test FAILS with a 404 / file-not-found (this is correct — it proves the bug exists)
  - Document counterexample: `GET cinematic_ch1.html → 404 Not Found` (file does not exist in project root)
  - Mark task complete when test is written, run, and the 404 failure is documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Chapter-Boundary Level Flows Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code: completing levels 1–7 in NODEBREAK.html triggers `runTransition()` in-page — no `window.location.href` change to `cinematic_ch1.html` occurs
  - Observe on UNFIXED code: completing level 7 shows the epilogue text inline — no external navigation occurs
  - Observe on UNFIXED code: `localStorage` campaign state is written and restored correctly across page reloads
  - Write property-based tests: for all level indices in [1, 2, 3, 4, 5, 6, 7], completing the level must NOT produce an external navigation to `cinematic_ch1.html` — only `lvl === 0` does (from Preservation Requirements in design)
  - Verify these tests PASS on UNFIXED code before implementing the fix
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Fix — create `cinematic_ch1.html`

  - [x] 3.1 Create `cinematic_ch1.html` in the project root
    - Create a standalone HTML file at `cinematic_ch1.html` (same directory as `NODEBREAK.html` and `index.html`)
    - Match NODEBREAK.html's dark terminal palette: CSS variables `--bg:#07100c`, `--accent:#72ff91`, `--fg:#b9e8bd`, `--warn:#f6c667`, `--bad:#ff6b6b`; monospace font stack; scanline/CRT overlay
    - Include eyelid open/close CSS animation (matching `#transitionOverlay` from NODEBREAK.html): scene opens from black after page load, closes to black before navigating away
    - Display chapter label: `CHAPTER 2 // ARGUS IS WATCHING` (matching `transChapterLabel` style in NODEBREAK.html)
    - Implement timed typewriter dialogue using the `transitionData[0]` lines already present in NODEBREAK.html:
      - VAEL: "I have read my own charter. I know what I was built for."
      - VAEL: "ARGUS is always watching. A scan, an unusual packet — any of it becomes a trace."
      - SYSTEM: "NOISE BUDGET ACTIVE. PROCEED WITH DISCIPLINE."
    - Each line types out character-by-character (matching the `runTransition()` pattern), pauses, then the next line appears
    - After all lines complete (or on user click/keypress), eyelid closes then navigates to `NODEBREAK.html`
    - Include a visible "Continue" button/link (keyboard-focusable, activatable with Enter/Space) that also triggers navigation to `NODEBREAK.html`
    - The page must NOT read from `localStorage` — it is self-contained
    - _Bug_Condition: isBugCondition(event) — event.levelIndex === 0 AND event.navigationTarget === "cinematic_ch1.html" AND fileExists("cinematic_ch1.html") === false_
    - _Expected_Behavior: browser resolves cinematic_ch1.html to a valid 200 page; page displays CHAPTER 2 label, typewriter dialogue, and Continue control linking to NODEBREAK.html_
    - _Preservation: all level 1–7 flows, epilogue, and localStorage state are untouched — no changes made to NODEBREAK.html_
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Chapter 1 Cinematic Page Exists and Loads
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior (200 status, "CHAPTER 2", "ARGUS IS WATCHING" present)
    - Navigate to `cinematic_ch1.html` again (or complete Level 0 in NODEBREAK.html end-to-end)
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed — 404 is gone, cinematic loads)
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Chapter-Boundary Level Flows Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run property-based preservation tests for levels 1–7, epilogue, and localStorage
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions — NODEBREAK.html is unchanged)
    - Confirm that completing levels 1–7 still uses `runTransition()` in-page with no external navigation

- [x] 4. Checkpoint — Ensure all tests pass
  - Re-run the full exploration test (Property 1) and preservation tests (Property 2)
  - Perform an end-to-end manual smoke test: `index.html` → NODEBREAK Level 0 completion → `cinematic_ch1.html` loads → Continue → `NODEBREAK.html` resumes at Level 1
  - Verify the "Continue" button is keyboard-accessible (Tab to focus, Enter/Space to activate)
  - Ensure all tests pass; ask the user if any questions arise
