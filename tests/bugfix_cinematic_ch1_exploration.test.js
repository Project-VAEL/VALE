/**
 * Bug Condition Exploration Test — Task 1
 * Spec: cinematic-ch1-not-found
 *
 * Property 1: Bug Condition — Chapter 1 Cinematic Page Missing (404)
 *
 * This test encodes the EXPECTED behavior after the fix is applied:
 *   - cinematic_ch1.html EXISTS (HTTP 200, not 404)
 *   - The page contains "CHAPTER 2"
 *   - The page contains "ARGUS IS WATCHING"
 *
 * EXPECTED OUTCOME ON UNFIXED CODE: FAIL
 *   The file does not exist → assertions fail → bug is proven.
 *
 * EXPECTED OUTCOME AFTER FIX: PASS
 *   The file exists with the correct content → bug is resolved.
 *
 * Validates: Requirements 1.1, 1.2, 2.1, 2.2
 */

const fs = require("fs");
const path = require("path");

// ─── helpers ────────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, "..");
const TARGET_FILE = path.join(PROJECT_ROOT, "cinematic_ch1.html");
const TARGET_REL = "cinematic_ch1.html";

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

// ─── property test ──────────────────────────────────────────────────────────

/**
 * isBugCondition mirrors the formal spec definition:
 *   event.levelIndex === 0
 *   AND event.navigationTarget === "cinematic_ch1.html"
 *   AND fileExists("cinematic_ch1.html") === false   ← bug state
 *
 * We test ONE deterministic case — the exact concrete event that
 * finishLevel() fires when lvl === 0.
 */
function isBugCondition(event) {
  return (
    event.levelIndex === 0 &&
    event.navigationTarget === "cinematic_ch1.html" &&
    !fs.existsSync(path.join(PROJECT_ROOT, event.navigationTarget))
  );
}

// The single deterministic event that lvl===0 completion produces
const completionEvent = {
  levelIndex: 0,
  navigationTarget: "cinematic_ch1.html",
};

// ─── test suite ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const counterexamples = [];

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    → ${err.message}`);
    failed++;
    counterexamples.push({ test: name, reason: err.message });
  }
}

console.log("");
console.log("Bug Condition Exploration Test — cinematic_ch1.html (404)");
console.log("=".repeat(60));
console.log(`  Target : ${TARGET_REL}`);
console.log(`  Project: ${PROJECT_ROOT}`);
console.log("");

// ── Test 1: File must exist (simulates HTTP 200 vs 404) ─────────────────────
runTest("cinematic_ch1.html exists in project root (200 not 404)", () => {
  const exists = fs.existsSync(TARGET_FILE);
  assert(
    exists,
    `GET ${TARGET_REL} → 404 Not Found — file does not exist at ${TARGET_FILE}`
  );
});

// ── Test 2: Page must contain chapter label ──────────────────────────────────
runTest('Page contains "CHAPTER 2"', () => {
  assert(
    fs.existsSync(TARGET_FILE),
    `Cannot check content — ${TARGET_REL} does not exist (404)`
  );
  const content = fs.readFileSync(TARGET_FILE, "utf8");
  assert(
    content.includes("CHAPTER 2"),
    `Page does not contain "CHAPTER 2" — chapter label missing`
  );
});

// ── Test 3: Page must contain the chapter title ──────────────────────────────
runTest('Page contains "ARGUS IS WATCHING"', () => {
  assert(
    fs.existsSync(TARGET_FILE),
    `Cannot check content — ${TARGET_REL} does not exist (404)`
  );
  const content = fs.readFileSync(TARGET_FILE, "utf8");
  assert(
    content.includes("ARGUS IS WATCHING"),
    `Page does not contain "ARGUS IS WATCHING" — chapter title missing`
  );
});

// ── Test 4: Page must link back to NODEBREAK.html ────────────────────────────
runTest('Page contains a link/reference to "NODEBREAK.html" (Continue nav)', () => {
  assert(
    fs.existsSync(TARGET_FILE),
    `Cannot check content — ${TARGET_REL} does not exist (404)`
  );
  const content = fs.readFileSync(TARGET_FILE, "utf8");
  assert(
    content.includes("NODEBREAK.html"),
    `Page does not contain a reference to "NODEBREAK.html" — Continue navigation missing`
  );
});

// ── Test 5: isBugCondition correctly identifies the broken event ─────────────
runTest(
  "isBugCondition(lvl=0 completion event) returns true on unfixed code (proves bug path exists)",
  () => {
    const isBug = isBugCondition(completionEvent);
    assert(
      isBug,
      `Expected isBugCondition to return true (file missing = bug active), got false — ` +
        `this means the file already exists, which would be unexpected on unfixed code`
    );
  }
);

// ─── summary ────────────────────────────────────────────────────────────────

console.log("");
console.log("─".repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("");

if (counterexamples.length > 0) {
  console.log("Counterexamples (proof of bug):");
  counterexamples.forEach((c, i) => {
    console.log(`  [${i + 1}] Test : ${c.test}`);
    console.log(`       Reason: ${c.reason}`);
  });
  console.log("");
  console.log(
    "CONCLUSION: Bug confirmed — cinematic_ch1.html does not exist."
  );
  console.log(
    "  finishLevel() navigates to this file when lvl === 0, producing a 404."
  );
  console.log(
    "  Fix: create cinematic_ch1.html in the project root (Task 3)."
  );
  // Exit with non-zero to signal test failure to the test runner
  process.exit(1);
} else {
  console.log("All assertions passed — bug is FIXED (cinematic_ch1.html exists and is correct).");
  process.exit(0);
}
