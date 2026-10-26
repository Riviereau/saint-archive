"use client";

import { useEffect, useState } from "react";
import { remainingPosts } from "@/lib/rateLimit";
import { DAILY_POST_LIMIT } from "@/types";

/* Ligne d'information discrète. Lue dans localStorage après l'affichage
   initial pour éviter un décalage entre le rendu serveur et le navigateur. */
export function RateLimitBar() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    setRemaining(remainingPosts());
  }, []);

  if (remaining === null) return null;

  if (remaining === 0) {
    return (
      <p className="notice notice--error" role="alert">
        Limite quotidienne atteinte ({DAILY_POST_LIMIT} publications). Revenez demain.
      </p>
    );
  }

  return (
    <p className="muted small">
      {remaining} publication{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""} aujourd&apos;hui
      sur {DAILY_POST_LIMIT}.
    </p>
  );
}
