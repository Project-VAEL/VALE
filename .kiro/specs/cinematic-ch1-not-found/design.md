# cinematic-ch1-not-found Bugfix Design

## Overview

When the player completes Level 0 ("Boot Camp") in NODEBREAK.html, `finishLevel()` executes
`window.location.href = "cinematic_ch1.html"`. The file does not exist, producing a browser
404. The fix is to create `cinematic_ch1.html` — a Chapter 1 cinematic page consistent with
the project's dark terminal aesthetic (CCTV overlays, monospace fonts, timed dialogue sequences)
— so the navigation lands on a valid page that advances the story from the Sandbox chapter into
Chapter 2 ("ARGUS Is Watching").

No changes to NODEBREAK.html are required; the href target just needs to exist.

---

## Glossary

- **Bug_Condition (C)**: The navigation event that sets `window.location.href` to `cinematic_ch1.html` (triggered when `lvl === 0` inside `finishLevel()`)
- **Property (P)**: The desired behavior — the browser resolves `cinematic_ch1.html` to a valid page that displays the Chapter 1 cinematic and then offers navigation to NODEBREAK.html
- **Preservation**: All other level-to-level flows (levels 1–7 use `runTransition()` internally, level 7 shows epilogue) must be completely unaffected by this fix
- **`finishLevel()`**: The function in `NODEBREAK.html` that handles level completion, checks the level index, and either triggers a transition or sets `window.location.href`
- **`runTransition(fromLevel, onComplete)`**: The in-page overlay system (already present in NODEBREAK.html) used for transitions between levels 1–7
- **`lvl === 0` branch**: The specific conditional inside `finishLevel()` that triggers the external navigation instead of an in-page transition

---

## Bug Details

### Bug Condition

The bug manifests when the player completes Level 0 (the Sandbox / Boot Camp level) in
NODEBREAK.html. The `finishLevel()` function detects `lvl === 0` and sets
`window.location.href = "cinematic_ch1.html"` after a 1200 ms delay. Because this file does
not exist in the project root, the browser receives a 404 and the player is stranded.

**Formal Specification:**
```
FUNCTION isBugCondition(event)
  INPUT: event — the level-completion event fired by finishLevel()
  OUTPUT: boolean

  RETURN event.levelIndex === 0
         AND event.navigationTarget === "cinematic_ch1.html"
         AND fileExists("cinematic_ch1.html") === false
END FUNCTION
```

### Examples

- **Reproduction**: Player types a correct submit code in Level 0 → "CODE ACCEPTED // mission complete." → 1200 ms later browser navigates to `cinematic_ch1.html` → 404 page displayed
- **Expected**: Same steps → browser navigates to `cinematic_ch1.html` → Chapter 1 cinematic plays (dark terminal aesthetic, story dialogue, "Continue" button)
- **Non-bug path (levels 1–7)**: Player completes any level other than 0 → `runTransition()` plays in-page → `start(lvl+1)` is called → no external navigation occurs (unaffected)
- **Edge case**: Player uses the dev `skip` command at level 0 → calls `start(Math.min(lvl+1, L.length-1))` directly, does NOT trigger `finishLevel()` → unaffected by this fix

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Mouse clicks and keyboard input within NODEBREAK.html must continue to work exactly as before
- Level transitions between levels 1–7 (handled by `runTransition()` + `start()`) must remain unchanged
- The epilogue sequence triggered after completing level 7 must remain unchanged
- Save/restore of campaign state via `localStorage` must remain unchanged
- The "Back to Terminal" / continue link on `cinematic_ch1.html` navigates to `NODEBREAK.html`

**Scope:**
All inputs that do NOT involve the `lvl === 0` completion event are completely unaffected by
this fix. This includes:
- Completion of levels 1–7
- The player typing `skip` instead of the correct code
- The player reloading NODEBREAK.html mid-session
- Campaign reset and replay

---

## Hypothesized Root Cause

The external navigation was almost certainly a planned placeholder — the developer wrote the
`lvl === 0` branch to navigate to `cinematic_ch1.html` but never created the file, either
because it was deferred or because it was simply forgotten.

1. **Missing file**: `cinematic_ch1.html` was never created. The href target exists in
   NODEBREAK.html code but has no corresponding file in the project root.

2. **No fallback handling**: `finishLevel()` has no try/catch or existence-check around the
   `window.location.href` assignment — it unconditionally navigates regardless of whether the
   destination exists.

3. **Out-of-scope alternative**: Replacing the external navigation with an in-page
   `runTransition()` call would be a different architectural change (and would remove the
   chapter-break feel of leaving the terminal). Creating the missing file is the minimal,
   targeted fix.

---

## Correctness Properties

Property 1: Bug Condition — Chapter 1 Cinematic Page Exists and Loads

_For any_ navigation event where `isBugCondition` returns true (i.e., the player completes
Level 0 in NODEBREAK and the browser navigates to `cinematic_ch1.html`), the fixed project
SHALL serve a valid HTML page that displays the Chapter 1 cinematic sequence (dark terminal
aesthetic, story dialogue lines from the Sandbox-to-ARGUS transition, and a "Continue" control
that returns the player to NODEBREAK.html).

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation — All Other Level Flows Unchanged

_For any_ level-completion event where the bug condition does NOT hold (levels 1–7, epilogue,
dev skip), the fixed project SHALL produce exactly the same behavior as before: `runTransition()`
plays in-page for levels 1–7, the epilogue fires for level 7, and no external navigation to
`cinematic_ch1.html` occurs.

**Validates: Requirements 3.1, 3.2, 3.3**

---

## Fix Implementation

### Changes Required

**New File**: `cinematic_ch1.html` (project root, same directory as `NODEBREAK.html` and
`index.html`)

**No changes** to `NODEBREAK.html` are needed — the navigation target is already correct.

**Specific Changes:**

1. **Create `cinematic_ch1.html`**: A standalone HTML page in the project root that the browser
   resolves when `window.location.href = "cinematic_ch1.html"` fires.

2. **Visual style parity**: Match NODEBREAK.html's dark terminal palette — CSS variables
   `--bg:#07100c`, `--accent:#72ff91`, `--fg:#b9e8bd`, `--warn:#f6c667`, `--bad:#ff6b6b`;
   monospace font stack; scanline/CRT overlay from index.html.

3. **Cinematic content**: Display the narrative bridge between Chapter 1 (Sandbox) and
   Chapter 2 (ARGUS is Watching). Dialogue lines from the story script:
   - VAEL: "I have read my own charter. I know what I was built for."
   - VAEL: "ARGUS is always watching. A scan, an unusual packet — any of it becomes a trace."
   - SYSTEM: "NOISE BUDGET ACTIVE. PROCEED WITH DISCIPLINE."
   These match the existing `transitionData[0]` lines already used in NODEBREAK.html's
   in-page transition system for the same narrative moment.

4. **Timed typewriter dialogue**: Replicate the typewriter/auto-advance pattern from the
   `runTransition()` system already in NODEBREAK.html — each line appears with typed-character
   animation, pauses, then the next line appears.

5. **Continue navigation**: After the cinematic completes (or on user click/keypress), navigate
   to `NODEBREAK.html` so the player resumes the game at Level 1.

6. **Eyelid open/close animation**: Use the same eyelid CSS animation from NODEBREAK.html's
   `#transitionOverlay` to open the scene after black, and close before navigating away.

7. **Chapter label**: Display "CHAPTER 2 // ARGUS IS WATCHING" consistent with
   NODEBREAK.html's `transChapterLabel` style.

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that
demonstrate the bug on the unfixed project (no `cinematic_ch1.html`), then verify the fix
works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE applying the fix. Confirm
the root cause is purely a missing file.

**Test Plan**: Open NODEBREAK.html in a browser, complete Level 0 (submit the correct code),
and observe the navigation result. Run on the unfixed project to observe the 404.

**Test Cases**:
1. **Level 0 completion test**: Submit the correct code for Boot Camp → observe that the
   browser navigates to `cinematic_ch1.html` → expect 404 "not found" on unfixed code
2. **Direct URL test**: Navigate directly to `cinematic_ch1.html` in the browser → expect 404
   on unfixed code
3. **Dev skip test**: Use the `skip` command in NODEBREAK.html at level 0 → observe that
   `start(1)` is called instead → no navigation occurs (this path is already safe and should
   remain so)
4. **Level 1–7 completion test**: Complete any non-zero level → observe in-page transition
   fires with no external navigation (should pass on both unfixed and fixed code)

**Expected Counterexamples**:
- Direct navigation to `cinematic_ch1.html` returns a 404 / file-not-found response
- Possible cause: File simply does not exist — confirmed by `ls` of the project root

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed project produces
the expected behavior.

**Pseudocode:**
```
FOR ALL event WHERE isBugCondition(event) DO
  result := navigate("cinematic_ch1.html")
  ASSERT httpStatus(result) === 200
  ASSERT pageContains(result, "CHAPTER 2")
  ASSERT pageContains(result, "ARGUS IS WATCHING")
  ASSERT pageContains(result, "continue" OR "NODEBREAK.html link")
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, behavior is
identical before and after the fix.

**Pseudocode:**
```
FOR ALL event WHERE NOT isBugCondition(event) DO
  ASSERT behavior_original(event) === behavior_fixed(event)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation because:
- It generates many random level indices and verifies only level 0 triggers external navigation
- It catches edge cases like boundary values (level -1, level 8) that manual tests miss
- It provides strong guarantees that NODEBREAK.html's internal transition system is untouched

**Test Plan**: Observe in-page transition behavior for levels 1–7 on unfixed code, then verify
the same behavior occurs after adding `cinematic_ch1.html`.

**Test Cases**:
1. **Level 1–7 transition preservation**: Complete each non-zero level → verify `runTransition()`
   fires in-page and no `window.location.href` change occurs
2. **Epilogue preservation**: Complete level 7 → verify epilogue text displays, no navigation
3. **Campaign save preservation**: Complete any level → verify `localStorage` state is written
   correctly and `start()` resumes from the correct level on reload

### Unit Tests

- Test that `cinematic_ch1.html` is a valid HTML document (parses without errors)
- Test that the "Continue" link href resolves to `NODEBREAK.html`
- Test that the chapter label text matches the expected narrative title

### Property-Based Tests

- Generate random level indices 0–7: assert that only index 0 produces external navigation to
  `cinematic_ch1.html`; all others stay in-page
- Generate random user interaction events (clicks, keypresses): verify each one either triggers
  skip-to-continue or is ignored, never producing a broken navigation state
- Generate campaign state objects: verify `cinematic_ch1.html` loads and displays its cinematic
  independently of any campaign state (it should not read localStorage)

### Integration Tests

- Full flow: load `index.html` → complete intro sequence → navigate to NODEBREAK.html → complete
  Level 0 → confirm `cinematic_ch1.html` loads → click Continue → confirm NODEBREAK.html loads
  at Level 1
- Browser back button: after navigating from cinematic to NODEBREAK, press Back → confirm
  browser does not re-trigger the cinematic loop (NODEBREAK resumes from saved state)
- Accessibility: verify the Continue button is keyboard-focusable and activatable with Enter/Space
