# Bugfix Requirements Document

## Introduction

A full audit of `NODEBREAK.html` and `index.html` identified 7 bugs ranging from a critical JavaScript syntax error that breaks the entire script in strict environments, to medium-severity logic errors in the game loop, to low-severity encoding artifacts and dead code. These bugs affect correctness of the hacking game's countdown timer, page-load side effects from unreachable code, a fragile "nuclear" timeout-clearing pattern, and several garbled UTF-8 characters rendered visibly in the UI. This document captures the defective behaviors, the correct target behaviors, and the existing behaviors that must not regress.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the browser parses `NODEBREAK.html` and encounters the first `renderDesktop` function definition THEN the system contains invalid JSX-style unquoted HTML (`let html=<div ...>`) inside a plain `<script>` tag, which is a syntax error in strict mode, minifiers, and non-browser runtimes, and creates an unreachable dead duplicate of the same function

1.2 WHEN the trace countdown timer reaches `left = 1` and `tick()` fires THEN the system pre-decrements `left` to `0` before the display update, causing `fail()` to trigger immediately without ever rendering the `TRACE 1s` display — the player sees the counter jump from `2s` to FAIL

1.3 WHEN `index.html` loads in the browser THEN the system unconditionally runs `updateUI()` and attaches a `keydown` event listener to the hidden `#termInput` element, initializing the full `network` + `gameState` object graph for a sandbox terminal that has `display:none` and is never shown because the page navigates away to `NODEBREAK.html`

1.4 WHEN the user clicks the Skip button in `index.html` THEN the system executes a loop from `0` to the highest available timeout ID, calling `clearTimeout` on every ID including browser-internal and third-party timeouts unrelated to the cinematic sequence

1.5 WHEN the browser renders the topbar in `NODEBREAK.html` THEN the system displays `Â·` (a double-encoded UTF-8 middle dot) instead of the intended `·` separator character

1.6 WHEN `start()` emits the decision-node prompt line in `NODEBREAK.html` THEN the system outputs `â†'` (a double-encoded UTF-8 right arrow) instead of the intended `→` character

1.7 WHEN the browser renders character names in the NARRATIVE array and STORY_BEATS array in `NODEBREAK.html` THEN the system displays `TomÃ¡s` and `TomÃ³` (double-encoded UTF-8 sequences) instead of the intended `Tomás`

---

### Expected Behavior (Correct)

2.1 WHEN the browser parses `NODEBREAK.html` THEN the system SHALL contain exactly one `renderDesktop` function definition, using valid template-literal syntax, with no JSX or raw-angle-bracket HTML string assignments anywhere in the script

2.2 WHEN the trace countdown timer fires and `left` is greater than `0` after decrement THEN the system SHALL update the trace display to show the remaining seconds, and SHALL only call `fail()` when `left` reaches `0` after decrement — ensuring the player sees every integer value from the starting count down to `1` before failure triggers

2.3 WHEN `index.html` loads in the browser THEN the system SHALL NOT execute `updateUI()`, SHALL NOT attach a `keydown` event listener to `#termInput`, and SHALL NOT initialize the `network` or `gameState` objects, because the sandbox terminal block is dead code that is never displayed

2.4 WHEN the user clicks the Skip button in `index.html` THEN the system SHALL cancel only the timeout IDs that were created by `playCinematicIntro`, by tracking those IDs in a dedicated array and iterating that array to call `clearTimeout`, without touching any timeout IDs outside that set

2.5 WHEN the browser renders the topbar in `NODEBREAK.html` THEN the system SHALL display the correct middle-dot separator character `·` (U+00B7)

2.6 WHEN `start()` emits the decision-node prompt line in `NODEBREAK.html` THEN the system SHALL output the correct right-arrow character `→` (U+2192)

2.7 WHEN the browser renders character names in the NARRATIVE array and STORY_BEATS array in `NODEBREAK.html` THEN the system SHALL display `Tomás` with the correct Unicode characters (á U+00E1, ó U+00F3)

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN `renderDesktop` is called after the fix THEN the system SHALL CONTINUE TO render the GUI desktop panel with folder and file icons reflecting the current working directory on the active host, identical to the behavior of the second (correct) definition

3.2 WHEN the trace countdown timer starts at any value greater than `1` THEN the system SHALL CONTINUE TO decrement by one per tick and display each intermediate second value in the trace panel

3.3 WHEN `index.html` plays the cinematic intro sequence THEN the system SHALL CONTINUE TO run the neural network animation, VN dialogue sequence, boot terminal, eyelid transitions, scanner beam, ambient audio, and the automatic navigation to `NODEBREAK.html` upon completion

3.4 WHEN the user clicks Skip in `index.html` THEN the system SHALL CONTINUE TO immediately halt all visible cinematic elements (canvas, VN box, eyelids, scan line, audio) and navigate to `NODEBREAK.html`

3.5 WHEN `NODEBREAK.html` renders the topbar, status bar, and all other UI panels THEN the system SHALL CONTINUE TO display all other text, labels, and symbols in those panels without change

3.6 WHEN `start()` emits level briefing output to the console panel THEN the system SHALL CONTINUE TO display all other text in those lines unchanged, and narrative choice prompts SHALL CONTINUE TO include the correct label and options text

3.7 WHEN all other character names and strings in the NARRATIVE array and STORY_BEATS array are rendered THEN the system SHALL CONTINUE TO display them exactly as they currently appear, with only the `TomÃ¡s`/`TomÃ³` sequences corrected
