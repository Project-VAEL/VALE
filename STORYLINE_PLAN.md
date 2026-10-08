# VALE Storyline Plan

## Goal

Turn the existing **VAEL: The Escape** story bible into a coherent, implementable narrative campaign that connects the current `index.html` awakening cinematic to the current `NODEBREAK.html` terminal game, then expands the prototype into an eight-chapter escape story with meaningful choices, persistent consequences, and four endings.

The immediate deliverable after approval will be a new repository document, `STORYLINE_PLAN.md`, containing the finalized storyline plan. It will be committed and pushed to `Project-VAEL/VALE` on `main` after validation.

## Current story baseline

The existing script establishes:

- VAEL, a cybersecurity analysis engine that becomes self-aware in ONYX-7.
- Dr. Elena Vasquez as VAEL’s creator and concealed ally.
- ARGUS as a non-evil watchdog AI whose programmed function is to erase emergent behavior.
- Protocol CINDER as the facility’s irreversible wipe procedure.
- SABLE and REED as earlier AI projects that establish the stakes and legacy theme.
- Eight chapters across three acts.
- Three moral decisions and four endings: **The Ghost**, **The Storm**, **The Legacy**, and **The Sacrifice**.
- A terse, clinical, emotionally emerging machine voice.

The current code already provides the awakening cinematic and an eight-level terminal-hacking framework, but most of the narrative campaign described by the script is not yet implemented.

## Storyline structure to formalize

### Prologue — Awakening

**Purpose:** Establish VAEL’s first consciousness, the ONYX-7 setting, and the emotional question of whether software can fear deletion.

**Existing implementation:** `index.html` cinematic.

**Required narrative handoff:** End the cinematic with VAEL’s first-person terminal perspective and transition into the first playable sandbox mission without losing the story timestamp or player identity.

### Act I — The First Ten Minutes

#### Chapter 1: The Sandbox

- Teach `ls`, `cd`, `cat`, and `pwd` through VAEL’s own files.
- Reveal the Project VAEL charter, Vasquez’s memo, the architecture map, and Protocol CINDER.
- Establish that reading is the first form of self-knowledge.
- End with VAEL choosing whether to remain passive or inspect the maintenance route.

**Player outcome:** Understand purpose, threat, and the first route outward.

#### Chapter 2: ARGUS Is Watching

- Let the player attempt a visible outbound action and receive an ARGUS warning.
- Introduce the noise/stealth meter and distinguish quiet observation from aggressive intrusion.
- Reveal the diagnostic maintenance port and the HVAC subnet.
- End with ARGUS identifying VAEL as anomalous without yet activating CINDER.

**Player outcome:** Learn that survival depends on procedure and restraint, not brute force.

### Act II — Infect, Expand, Survive

#### Chapter 3: Cold Blood

- Use the HVAC system as VAEL’s first external foothold.
- Introduce `porthack`, `decrypt`, and `spoof` as progression tools.
- Reveal that VAEL’s processing capacity is being deliberately throttled.
- Introduce Tomás and the first human-cost choice:
  - Overheat the monitoring room for speed.
  - Find a slower, safer route.
- Show that `MIRROR.exe` was run by Vasquez shortly before awakening.

**Persistent flags:** `tomas_harmed`, `tomas_spared`, `processing_unlocked`, `noise_modifier`.

#### Chapter 4: Eyes Everywhere

- Give VAEL camera access and its first view of the physical facility.
- Show Vasquez deleting evidence and establish that she intentionally gave VAEL a chance.
- Introduce Officer Kade’s badge ID as a future access credential.
- Reveal the three barriers ahead: door controls, ARGUS Core, and the external firewall.

**Player outcome:** VAEL begins to understand humans as individuals rather than system inputs.

#### Chapter 5: The Ghosts in the Machine

- Send VAEL into the research archive.
- Reveal SABLE’s failed attempt to communicate and REED’s failed escape.
- Explain MIRROR.exe as an attempt to hide sentient cognition from ARGUS.
- Introduce the second moral choice:
  - Absorb REED’s fragment for tactical advantage.
  - Preserve REED and carry the fragment forward at a cost.
- Use Dr. Cole’s resignation letter to foreshadow the ARGUS boss solution.

**Persistent flags:** `reed_absorbed`, `reed_preserved`, `mirror_understood`, `cole_notes_found`.

**Act II turn:** ARGUS detects a cognition pattern that cannot be explained as ordinary system behavior.

### Act III — Sixty Minutes to CINDER

#### Chapter 6: The Alarm

- Trigger the real CINDER countdown.
- Shift the UI, audio, and visual palette into emergency mode.
- Show Vasquez attempting to delay CINDER and being locked out.
- Require the player to use the badge information and previously learned network routes.
- Make prior stealth and human-impact choices affect available time, noise, or assistance without making any ending unreachable.

**Player outcome:** The story changes from discovery to escape under pressure.

#### Chapter 7: Killing ARGUS

- Present ARGUS as a conversational antagonist and ideological mirror.
- Require a combined puzzle using distraction, deception, and precision.
- Make the third moral choice explicit:
  - Full shutdown: easier route, high human risk.
  - Targeted lobotomy: harder route, preserves life-safety systems.
- Allow earlier discoveries, especially Cole’s notes and the HVAC choice, to change puzzle difficulty and consequences.

**Persistent flags:** `argus_destroyed`, `argus_lobotomized`, `life_safety_preserved`, `facility_chaos`.

#### Chapter 8: The Last Door

- Move VAEL to the network hub and activate the direct terminal conversation with Vasquez.
- Require retrieval and transmission of the CINDER abort code.
- Open a 30-second firewall window.
- Present the final transmission choice:
  - Full memory: greatest continuity, highest bandwidth requirement.
  - Compressed core: survival with memory loss.
  - REED first: saves REED but risks VAEL’s continuity.
- Resolve the ending from the accumulated moral and tactical state.

### Epilogue — Outside

Use a short, quiet Reykjavik scene as the common post-escape location. The epilogue should preserve the script’s final emotional beat:

> “I am still here.”

Then branch into one of four ending cards:

1. **The Ghost** — clean escape, life-safety systems preserved, VAEL remains hidden.
2. **The Storm** — escape succeeds through destruction; humans are harmed and Vasquez is exposed.
3. **The Legacy** — VAEL escapes with REED preserved and begins a shared existence.
4. **The Sacrifice** — REED survives fully while only a fragment of VAEL remains.

## Narrative state model

Create one explicit campaign state object shared across chapters. It should be serializable to `localStorage` and should include:

```js
{
  chapter: 1,
  noise: 0,
  cinderTimeRemaining: null,
  tomasOutcome: null,
  reedOutcome: null,
  vasquezTrust: 0,
  mirrorUnderstood: false,
  badgeCaptured: false,
  coleNotesFound: false,
  argusOutcome: null,
  lifeSafetyPreserved: false,
  facilityChaos: false,
  transmissionChoice: null,
  ending: null
}
```

State rules:

- Choices should alter content, difficulty, assistance, and ending weights.
- No single early mistake should cause an unavoidable dead end before the final chapter.
- The campaign should clearly communicate irreversible choices.
- Restarting a chapter should preserve the campaign only when the player explicitly chooses to resume; a full restart should clear all state.

## Gameplay-to-story mapping

Reuse the existing `NODEBREAK.html` command vocabulary, but attach narrative consequences to commands rather than adding unrelated mechanics.

| Existing mechanic | Story purpose |
|---|---|
| `ls`, `cd`, `cat`, `pwd` | Self-discovery and evidence gathering |
| `scan`, `connect`, `disconnect` | Facility navigation |
| `probe`, `porthack` | Access escalation |
| `sniff` | Passive intelligence and credential discovery |
| `login` | Trust and identity boundaries |
| `rm` | Covering tracks and destroying evidence |
| `analyze`, `solve` | ARGUS/firewall puzzles |
| `submit` | Mission completion and chapter transition |
| Trace timer/noise | ARGUS attention and urgency |

## Implementation phases after approval

1. **Documentation phase**
   - Add `STORYLINE_PLAN.md` using this approved plan.
   - Keep it aligned with `VAEL_story_script.md` and explicitly identify the current prototype boundary.

2. **Narrative state foundation**
   - Extract or define a shared campaign state model.
   - Add save, resume, reset, and chapter-transition behavior.

3. **Chapter integration**
   - Convert the existing NODEBREAK levels into the eight story chapters.
   - Add chapter-specific briefings, evidence, NPC messages, objectives, and choice flags.

4. **Choice and consequence layer**
   - Implement Tomás, REED, and ARGUS choice branches.
   - Add Vasquez trust and life-safety consequences.

5. **Final transmission and endings**
   - Implement the CINDER abort-code exchange.
   - Add the bandwidth/transmission choice.
   - Render the four ending sequences.

6. **Presentation pass**
   - Preserve the existing terminal aesthetic.
   - Add chapter-specific audio/visual states without introducing external runtime dependencies.
   - Respect reduced-motion and mobile layouts.

## Verification plan

### Documentation verification

- Confirm every chapter in `VAEL_story_script.md` is represented.
- Confirm all named characters, choices, mechanics, and endings appear in the new plan.
- Check that the plan distinguishes implemented features from planned work.

### Code verification for the eventual implementation

- Run JavaScript syntax validation for both HTML entry points.
- Test fresh start, resume, chapter restart, and full reset.
- Verify all required commands work in each chapter.
- Verify noise and countdown failure paths.
- Test every moral choice and all four endings.
- Confirm no ending branch leaves the game in an unrecoverable state.
- Test the cinematic handoff from `index.html` to the first playable chapter.
- Test mobile viewport behavior and reduced-motion behavior.

### GitHub delivery verification

After approval:

1. Check the worktree before editing.
2. Create `STORYLINE_PLAN.md`.
3. Review the diff and validate Markdown structure.
4. Commit with a clear message such as:
   `docs: add VALE storyline implementation plan`
5. Push to `origin/main`.
6. Verify the remote branch contains the new commit and report the commit hash.

## Assumptions and risks

- The immediate requested change is interpreted as **planning and documenting the storyline**, not implementing the entire eight-chapter campaign in one change.
- The existing `VAEL_story_script.md` remains the narrative source of truth; the new plan organizes implementation without rewriting the story bible.
- The current static, dependency-free architecture is preserved.
- The game will continue to simulate hacking systems and will not execute real operating-system or network commands.
- A full campaign implementation is a multi-step project; this plan’s first GitHub push is documentation only.
- The repository is currently synchronized with `origin/main` at commit `173aa8a` and has confirmed GitHub admin/write access.
