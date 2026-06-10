/*
  ============================================================
  components/RateLimitBar.tsx — Shows daily post usage
  ============================================================

  TIP FOR LEARNERS:
  This component uses two React hooks:
  - useState: stores values that can change
  - useEffect: runs code AFTER the component renders

  WHY useEffect FOR localStorage?
  Next.js renders components on the server first (no localStorage there!),
  then "hydrates" them in the browser. If we read localStorage during
  the first render, it would crash on the server.

  useEffect only runs in the browser, so it's safe to read localStorage there.
  This pattern (useState + useEffect for browser-only data) is very common!
*/

"use client"; // Marks this as a Client Component (runs in the browser)

import { useEffect, useState } from "react";
import {
  getRateLimitState,
  remainingPosts,
  usagePercent,
} from "@/lib/rateLimit";
import { DAILY_POST_LIMIT } from "@/types";

export function RateLimitBar() {
  /*
    useState(null) means: start with null, update later.
    The type <number | null> tells TypeScript it can be either.
  */
  const [remaining, setRemaining] = useState<number | null>(null);
  const [percent, setPercent]     = useState<number>(0);

  /*
    useEffect runs AFTER the component renders in the browser.
    The [] at the end means "run this only once, on first render".
    (If you put variables in [], it runs again when those change.)
  */
  useEffect(() => {
    // Now we're safely in the browser, so localStorage is available
    setRemaining(remainingPosts());
    setPercent(usagePercent());
  }, []); // Empty array = run once on mount

  // Don't render anything until we have data from the browser
  // This avoids a "flash" of wrong content during hydration
  if (remaining === null) return null;

  // If all posts are used up, show a danger alert
  if (remaining === 0) {
    return (
      <div className="alert alert--danger" role="alert">
        <span>⚠</span>
        <span>
          Limite quotidienne atteinte ({DAILY_POST_LIMIT} publications).
          Revenez demain ou créez un compte pour publier sans limite.
        </span>
      </div>
    );
  }

  /*
    Determine the visual state based on how many posts remain.
    This makes the progress bar change color as you approach the limit.
  */
  const fillClass =
    percent >= 90 ? "rate-limit-bar__fill--danger"
    : percent >= 70 ? "rate-limit-bar__fill--warning"
    : "";

  return (
    <div className="rate-limit-bar">
      {/* Warning icon */}
      <span aria-hidden="true">📋</span>

      {/* Text description */}
      <span style={{ fontSize: "0.8rem" }}>
        {remaining}/{DAILY_POST_LIMIT} publications restantes aujourd&apos;hui
      </span>

      {/* Progress bar */}
      <div className="rate-limit-bar__progress" aria-hidden="true">
        <div
          className={`rate-limit-bar__fill ${fillClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
