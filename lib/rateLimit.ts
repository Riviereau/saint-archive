/*
  lib/rateLimit.ts — Limite quotidienne côté navigateur (localStorage)

  Ce n'est qu'un garde-fou de confort : la vraie limite est appliquée
  par le serveur (voir app/api/posts/route.ts).
*/

import { DAILY_POST_LIMIT } from "@/types";

const KEY = "saint-archive:rateLimit";

interface State {
  date: string; // AAAA-MM-JJ
  count: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): State {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const state = JSON.parse(raw) as State;
      if (state.date === today()) return state;
    }
  } catch {
    /* localStorage indisponible : on repart de zéro */
  }
  return { date: today(), count: 0 };
}

export function remainingPosts(): number {
  return Math.max(0, DAILY_POST_LIMIT - read().count);
}

export function canPostToday(): boolean {
  return remainingPosts() > 0;
}

export function incrementPostCount(): void {
  try {
    const state = read();
    window.localStorage.setItem(KEY, JSON.stringify({ ...state, count: state.count + 1 }));
  } catch {
    /* ignore */
  }
}
