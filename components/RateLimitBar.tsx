/*
  ============================================================
  components/RateLimitBar.tsx — Shows daily post usage
  ============================================================
*/

"use client"; // Marks this as a Client Component (runs in the browser)

import { useState } from "react";
import {
  remainingPosts,
  usagePercent,
} from "@/lib/rateLimit";
import { DAILY_POST_LIMIT } from "@/types";

export function RateLimitBar() {
  // 1. Lazy state initializers handle everything.
  // They run exactly ONCE when the component mounts in the browser.
  const [remaining, setRemaining] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      return remainingPosts();
    }
    return null; // Next.js Server-side fallback
  });

  const [percent, setPercent] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return usagePercent();
    }
    return 0; // Next.js Server-side fallback
  });

  // REMOVED THE USEEFFECT BLOCK COMPLETELY HERE

  // Don't render anything until we have data from the browser
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

  const fillClass =
    percent >= 90 ? "rate-limit-bar__fill--danger"
    : percent >= 70 ? "rate-limit-bar__fill--warning"
    : "";

  return (
    <div className="rate-limit-bar">
      <span aria-hidden="true">📋</span>

      <span style={{ fontSize: "0.8rem" }}>
        {remaining}/{DAILY_POST_LIMIT} publications restantes aujourd&apos;hui
      </span>

      <div className="rate-limit-bar__progress" aria-hidden="true">
        <div
          className={`rate-limit-bar__fill ${fillClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}