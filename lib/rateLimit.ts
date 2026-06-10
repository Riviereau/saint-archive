/*
  ============================================================
  lib/rateLimit.ts — Rate limiting for anonymous users
  ============================================================

  TIP FOR LEARNERS:
  "Rate limiting" means controlling how many times something can
  happen in a given time window. Here we limit anonymous (not
  logged-in) users to 30 posts per day.

  HOW IT WORKS:
  - We save a small object in the browser's localStorage.
  - localStorage stores data as a key-value pair that persists
    across page refreshes (until the user clears their browser).
  - We save { postsToday: 5, date: "2025-06-09" }.
  - When the date changes, we reset postsToday to 0.

  IMPORTANT: This is CLIENT-SIDE rate limiting — it's easily bypassed
  by clearing localStorage. For a real app, you'd also enforce limits
  on the SERVER (in an API route) using IP addresses.
*/

import { RateLimitState, DAILY_POST_LIMIT } from "@/types";

// The key we use to store the rate limit state in localStorage
const RATE_LIMIT_KEY = "sa_rate_limit"; // "sa" = Sainte-Archive

/*
  Gets today's date as a string: "2025-06-09"
  We use this to detect when a new day starts.
*/
function getTodayString(): string {
  return new Date().toISOString().split("T")[0]; // "2025-06-09T14:30:00.000Z" → "2025-06-09"
}

/*
  Reads the current rate limit state from localStorage.
  Returns a fresh state if nothing is stored yet.
*/
export function getRateLimitState(): RateLimitState {
  // "typeof window === 'undefined'" checks if we're on the server.
  // Next.js runs some code on the server where localStorage doesn't exist!
  if (typeof window === "undefined") {
    return { postsToday: 0, date: getTodayString() };
  }

  try {
    // localStorage.getItem returns null if the key doesn't exist
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) {
      // First time — return a fresh state
      return { postsToday: 0, date: getTodayString() };
    }

    // JSON.parse converts a string back to an object
    const state: RateLimitState = JSON.parse(stored);

    // If the stored date is in the past, reset the counter
    if (state.date !== getTodayString()) {
      return { postsToday: 0, date: getTodayString() };
    }

    return state;
  } catch {
    // If parsing fails (corrupted data), start fresh
    return { postsToday: 0, date: getTodayString() };
  }
}

/*
  Call this AFTER a post is successfully created.
  Increments the counter and saves it.
*/
export function incrementPostCount(): void {
  if (typeof window === "undefined") return;

  const state = getRateLimitState();
  const newState: RateLimitState = {
    postsToday: state.postsToday + 1,
    date: getTodayString(),
  };

  // JSON.stringify converts an object to a string for storage
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newState));
}

/*
  Returns true if the user CAN still post today.
  Returns false if they've hit the limit.
*/
export function canPostToday(): boolean {
  const state = getRateLimitState();
  return state.postsToday < DAILY_POST_LIMIT;
}

/*
  How many posts remain today?
  Used to show "You have X posts remaining today"
*/
export function remainingPosts(): number {
  const state = getRateLimitState();
  return Math.max(0, DAILY_POST_LIMIT - state.postsToday);
}

/*
  A percentage from 0–100 of how much of the daily limit is used.
  Used to fill the progress bar in the UI.
*/
export function usagePercent(): number {
  const state = getRateLimitState();
  return (state.postsToday / DAILY_POST_LIMIT) * 100;
}
