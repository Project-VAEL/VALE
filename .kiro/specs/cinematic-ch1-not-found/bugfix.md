# Bugfix Requirements Document

## Introduction

After completing the final level of the NODEBREAK terminal game, the engine attempts to navigate the browser to `cinematic_ch1.html` as a chapter transition. This file does not exist in the project, causing the browser to display a "not found" error instead of a chapter cinematic. The transition is triggered once the player reaches the chapter boundary (level index 0, after completing the intro chapter), making it a hard blocker — the player cannot progress past the first chapter.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the player completes the chapter-boundary level in NODEBREAK THEN the system navigates to `cinematic_ch1.html`, which does not exist, resulting in a browser 404 / "not found" error

1.2 WHEN `window.location.href` is set to `cinematic_ch1.html` THEN the system leaves the game with no valid destination, stranding the player outside the application

### Expected Behavior (Correct)

2.1 WHEN the player completes the chapter-boundary level in NODEBREAK THEN the system SHALL navigate to a valid chapter cinematic page (`cinematic_ch1.html`) that exists and loads correctly

2.2 WHEN `window.location.href` is set to `cinematic_ch1.html` THEN the system SHALL display the Chapter 1 cinematic sequence without error

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the player progresses between non-chapter-boundary levels (levels that do not trigger the cinematic transition) THEN the system SHALL CONTINUE TO advance through levels normally using the existing `runTransition` / `start` flow

3.2 WHEN the player completes the full game and reaches the epilogue THEN the system SHALL CONTINUE TO display the epilogue sequence without being affected by the chapter cinematic fix

3.3 WHEN the player saves, resets, or replays earlier levels THEN the system SHALL CONTINUE TO load and restore campaign state correctly
