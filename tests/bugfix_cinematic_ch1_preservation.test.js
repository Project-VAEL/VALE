/**
 * Preservation Property Tests — Task 2
 * Spec: cinematic-ch1-not-found
 *
 * Property 2: Preservation — Non-Chapter-Boundary Level Flows Unchanged
 *
 * For all level indices in [1, 2, 3, 4, 5, 6, 7], completing the level
 * MUST NOT produce an external navigation to "cinematic_ch1.html".
 * Only lvl === 0 triggers that external navigation.
 *
 * These tests run on the UNFIXED code (before cinematic_ch1.html exists).
 * EXPECTED OUTCOME: ALL PASS — confirms baseline behavior to preserve.
 *
 * Validates: Requirements 3.1, 3.2, 3.3
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ─── Project paths ──────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, "..");
const NODEBREAK_FILE = path.join(PROJECT_ROOT, "NODEBREAK.html");

// ─── Extract finishLevel logic from NODEBREAK.html source ───────────────────
//
// Rather than running a browser, we extract the exact branching logic of
// finishLevel() by parsing the NODEBREAK.html source text.  This is valid
// because the fix (creating cinematic_ch1.html) makes NO changes to
// NODEBREAK.html — so reading the source guarantees we are testing the
// unfixed code path.

const source = fs.readFileSync(NODEBREAK_FILE, "utf8");

// ─── helpers ────────────────────────────────────────────────────────────────

function assert(condition, message) {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

let passed = 0;
let failed = 0;
const failures = [];

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    → ${err.message}`);
    failed++;
    failures.push({ test: name, reason: err.message });
  }
}

// ─── Structural observation: finishLevel() branch map ───────────────────────
//
// We read the finishLevel() source text directly and verify what each branch
// does.  This is the "observation on unfixed code" step required by the spec.
//
//   finishLevel() as written:
//
//     if (lvl === 0) {
//       ...
//       setTimeout(() => { window.location.href = "cinematic_ch1.html" }, 1200);
//       return;
//     }
//     if (lvl < L.length - 1) {
//       ...
//       setTimeout(() => { runTransition(lvl, () => start(lvl + 1)); }, 1800);
//     } else {
//       // epilogue — inline only, no external navigation
//     }

// Extract the finishLevel function body from the minified source
const fnMatch = source.match(/function finishLevel\(\)\{(.+?)(?=\nconst C=)/s);
assert(fnMatch, "Could not locate finishLevel() in NODEBREAK.html source");
const finishLevelBody = fnMatch[1];

// ─── Property-based helpers ─────────────────────────────────────────────────

/**
 * levelNavigatesExternally(body, levelIndex)
 *
 * Returns true if the finishLevel() source text would route a given level
 * to an external navigation (window.location.href).
 *
 * This is derived structurally: the only window.location.href assignment
 * inside finishLevel() is guarded by `lvl===0`.
 */
function levelNavigatesExternally(body, levelIndex) {
  // The href assignment in the source is: window.location.href="cinematic_ch1.html"
  // It appears exactly once, inside the `if(lvl===0)` branch.
  // We verify: the pattern `window.location.href` only occurs inside the
  // conditional that fires for lvl===0.

  // Find all occurrences of window.location.href assignment
  const hrefPattern = /window\.location\.href\s*=\s*["']cinematic_ch1\.html["']/g;
  const hrefMatches = [...body.matchAll(hrefPattern)];

  if (hrefMatches.length === 0) return false; // no external nav at all

  // For each occurrence, check if it is guarded by `lvl===0`
  for (const match of hrefMatches) {
    const idx = match.index;
    // Look backwards up to 200 chars for the guard condition
    const context = body.slice(Math.max(0, idx - 200), idx);
    const guardedByLvl0 = /if\s*\(\s*lvl\s*===\s*0\s*\)/.test(context);
    if (guardedByLvl0 && levelIndex === 0) return true;
    if (!guardedByLvl0) return true; // unguarded → fires for all levels
  }
  return false;
}

/**
 * levelUsesInPageTransition(body, levelIndex)
 *
 * Returns true if the finishLevel() source uses runTransition() for the
 * given level (i.e., the in-page transition path is present and reachable
 * for non-zero levels below the final level).
 */
function levelUsesInPageTransition(body, levelIndex) {
  // runTransition appears in the `if(lvl<L.length-1)` branch —
  // the path taken for levels 1 through 6 (indices 1–6).
  return /runTransition\s*\(/.test(body);
}

/**
 * epilogueIsInline(body)
 *
 * Returns true if level 7 (the last level) produces only inline output
 * with no external navigation.
 */
function epilogueIsInline(body) {
  // The epilogue branch must contain p("EPILOGUE ...") and must NOT contain
  // a second window.location.href assignment outside the lvl===0 guard.
  const hasEpilogueText = /EPILOGUE/.test(body);

  // Count href assignments outside the lvl===0 guard
  const allHrefs = [...body.matchAll(/window\.location\.href\s*=/g)];
  let ungardedHrefs = 0;
  for (const m of allHrefs) {
    const ctx = body.slice(Math.max(0, m.index - 200), m.index);
    if (!/if\s*\(\s*lvl\s*===\s*0\s*\)/.test(ctx)) ungardedHrefs++;
  }

  return hasEpilogueText && ungardedHrefs === 0;
}

/**
 * localStorageSavePattern(body)
 *
 * Returns true if finishLevel() calls save() to persist campaign state.
 * (The actual save() function calls localStorage.setItem.)
 */
function saveIsCalledInFinishLevel(body) {
  return /\bsave\s*\(\s*\)/.test(body);
}

// ─── Test suite ──────────────────────────────────────────────────────────────

console.log("");
console.log("Preservation Property Tests — Non-Chapter-Boundary Level Flows");
console.log("=".repeat(65));
console.log("  Validates: Requirements 3.1, 3.2, 3.3");
console.log("  Running on: UNFIXED code (NODEBREAK.html, no cinematic_ch1.html)");
console.log("");

// ── Structural observations (basis for property assertions) ─────────────────

console.log("Observation phase (reading finishLevel() source on unfixed code):");
console.log("");

runTest(
  "finishLevel() exists in NODEBREAK.html source",
  () => {
    assert(
      /function finishLevel\(\)/.test(source),
      "finishLevel() not found in NODEBREAK.html"
    );
  }
);

runTest(
  "finishLevel() contains exactly one window.location.href assignment",
  () => {
    const count = [...finishLevelBody.matchAll(/window\.location\.href\s*=/g)].length;
    assert(
      count === 1,
      `Expected 1 window.location.href assignment in finishLevel(), found ${count}`
    );
  }
);

runTest(
  "The single href assignment is guarded by `lvl === 0`",
  () => {
    const hrefIdx = finishLevelBody.indexOf('window.location.href');
    assert(hrefIdx !== -1, "window.location.href not found in finishLevel()");
    const context = finishLevelBody.slice(Math.max(0, hrefIdx - 200), hrefIdx);
    assert(
      /if\s*\(\s*lvl\s*===\s*0\s*\)/.test(context),
      `window.location.href assignment is NOT guarded by lvl===0.\n` +
        `    Context: ...${context.slice(-120)}...`
    );
  }
);

runTest(
  "finishLevel() contains runTransition() call (in-page transition path exists)",
  () => {
    assert(
      /runTransition\s*\(/.test(finishLevelBody),
      "runTransition() call not found in finishLevel() — in-page transition path is missing"
    );
  }
);

runTest(
  "finishLevel() contains epilogue output (EPILOGUE text present for level 7)",
  () => {
    assert(
      /EPILOGUE/.test(finishLevelBody),
      'EPILOGUE text not found in finishLevel() — level 7 epilogue path may be missing'
    );
  }
);

console.log("");
console.log("Property 2 — Preservation: levels 1–7 must not navigate externally:");
console.log("");

// ── Property: for all non-zero levels, no external navigation ───────────────
//
// This is the core property test. We generate all level indices [1..7] and
// assert that none of them would trigger window.location.href navigation.

const NON_CHAPTER_BOUNDARY_LEVELS = [1, 2, 3, 4, 5, 6, 7];

for (const level of NON_CHAPTER_BOUNDARY_LEVELS) {
  runTest(
    `Level ${level}: finishLevel() does NOT navigate to cinematic_ch1.html`,
    () => {
      const navigates = levelNavigatesExternally(finishLevelBody, level);
      assert(
        !navigates,
        `Level ${level} would trigger window.location.href = "cinematic_ch1.html" — preservation violated`
      );
    }
  );
}

console.log("");
console.log("Property: only lvl === 0 triggers external navigation:");
console.log("");

// ── Property: lvl === 0 IS the only level that navigates externally ──────────
//
// Positive check: confirm the bug-path for level 0 is present (proves
// our detection logic is actually exercising the right code path).

runTest(
  "Level 0: finishLevel() DOES navigate to cinematic_ch1.html (bug path confirmed)",
  () => {
    const navigates = levelNavigatesExternally(finishLevelBody, 0);
    assert(
      navigates,
      `Level 0 does NOT show window.location.href = "cinematic_ch1.html" — ` +
        `the bug path we are preserving against was not detected`
    );
  }
);

console.log("");
console.log("Property 3.2 — Epilogue preservation (level 7 stays in-page):");
console.log("");

runTest(
  "Level 7 epilogue is inline-only — no external navigation fires",
  () => {
    assert(
      epilogueIsInline(finishLevelBody),
      "Level 7 epilogue appears to use external navigation or epilogue text is missing"
    );
  }
);

console.log("");
console.log("Property 3.3 — Campaign state (localStorage) save is called:");
console.log("");

runTest(
  "finishLevel() calls save() to persist campaign state before transitioning",
  () => {
    assert(
      saveIsCalledInFinishLevel(finishLevelBody),
      "save() is not called in finishLevel() — localStorage campaign persistence may be broken"
    );
  }
);

// ── Property: save() in NODEBREAK.html writes to localStorage ───────────────

runTest(
  "save() function writes campaign state to localStorage (localStorage.setItem present)",
  () => {
    // Locate the save() function body in the full source
    const saveMatch = source.match(/function save\s*\(\s*\)\s*\{([^}]+)\}/);
    assert(
      saveMatch,
      "save() function not found in NODEBREAK.html source"
    );
    const saveBody = saveMatch[1];
    assert(
      /localStorage\.setItem/.test(saveBody),
      "save() does not call localStorage.setItem — campaign state would not persist"
    );
  }
);

// ── Property: the lvl===0 branch uses `return` so later code doesn't execute ─

runTest(
  "lvl===0 branch in finishLevel() uses `return` — prevents fall-through to runTransition()",
  () => {
    // Find the location of the href assignment and verify `return` follows it
    const hrefIdx = finishLevelBody.indexOf('window.location.href');
    assert(hrefIdx !== -1, "window.location.href not found");
    // Check that `return` appears within ~60 chars after the href assignment line
    const afterHref = finishLevelBody.slice(hrefIdx, hrefIdx + 120);
    assert(
      /\breturn\b/.test(afterHref),
      `No return statement found after window.location.href assignment — ` +
        `fall-through to runTransition() could occur`
    );
  }
);

// ─── PBT: generative check ───────────────────────────────────────────────────
//
// Generate a wide range of level indices (including boundary and out-of-range
// values) and assert that only index 0 triggers external navigation.
//
// This is the property-based component: instead of hand-picking examples, we
// enumerate the full valid input space and any boundary values.

console.log("");
console.log("PBT — Exhaustive input space [0..7] + boundary values:");
console.log("");

const ALL_VALID_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7];
const BOUNDARY_LEVELS  = [-1, 8, 99, -100]; // out-of-range — should not appear in finishLevel

runTest(
  "PBT: for all valid level indices, ONLY index 0 navigates externally",
  () => {
    const violations = [];
    for (const level of ALL_VALID_LEVELS) {
      const navigates = levelNavigatesExternally(finishLevelBody, level);
      const shouldNavigate = level === 0;
      if (navigates !== shouldNavigate) {
        violations.push(
          `Level ${level}: expected externalNav=${shouldNavigate}, got ${navigates}`
        );
      }
    }
    assert(
      violations.length === 0,
      `Property violation(s):\n    ${violations.join("\n    ")}`
    );
  }
);

runTest(
  "PBT: boundary level values (-1, 8, 99) do not pattern-match the lvl===0 guard",
  () => {
    // These values would never reach finishLevel() due to game logic, but we
    // verify structurally that levelNavigatesExternally() returns false for them
    const violations = BOUNDARY_LEVELS.filter(l =>
      levelNavigatesExternally(finishLevelBody, l)
    );
    assert(
      violations.length === 0,
      `Boundary levels ${violations.join(", ")} incorrectly flagged as navigating externally`
    );
  }
);

// ─── Summary ────────────────────────────────────────────────────────────────

console.log("");
console.log("─".repeat(65));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("");

if (failures.length > 0) {
  console.log("FAILURES (preservation contract violated):");
  failures.forEach((f, i) => {
    console.log(`  [${i + 1}] ${f.test}`);
    console.log(`       ${f.reason}`);
  });
  console.log("");
  process.exit(1);
} else {
  console.log(
    "All preservation tests PASS on unfixed code."
  );
  console.log(
    "Baseline confirmed: levels 1–7, epilogue, and localStorage save"
  );
  console.log(
    "are unaffected by the lvl===0 navigation branch."
  );
  console.log(
    "These tests will continue to pass after the fix (cinematic_ch1.html is created)."
  );
  console.log("");
  process.exit(0);
}
