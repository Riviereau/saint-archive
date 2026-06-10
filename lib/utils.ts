/*
  ============================================================
  lib/utils.ts — Reusable utility functions
  ============================================================

  TIP FOR LEARNERS:
  A "utility file" holds small helper functions that are used
  across many different parts of your app. By putting them here,
  you avoid copy-pasting the same logic in multiple files.
*/

/*
  Converts a title into a URL slug.
  "L'Affaire Gomery 2005!" → "laffaire-gomery-2005"

  Why do we need this?
  URLs shouldn't have spaces, accents, or special characters.
  A slug is a clean, lowercase, hyphen-separated version.
*/
export function slugify(text: string): string {
  return text
    .toLowerCase()
    // Replace accented French characters with their base letter
    .normalize("NFD")                      // Decompose accents: "é" → "e" + combining accent
    .replace(/[\u0300-\u036f]/g, "")      // Remove the combining accents
    .replace(/[^a-z0-9\s-]/g, "")        // Remove anything that's not a letter, number, space, or hyphen
    .trim()                                // Remove leading/trailing spaces
    .replace(/\s+/g, "-")                 // Replace spaces with hyphens
    .replace(/-+/g, "-");                 // Collapse multiple hyphens into one
}

/*
  Formats a date into a readable French string.
  new Date("2025-06-09") → "9 juin 2025"
*/
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/*
  Formats a date as a relative time.
  "Il y a 3 heures", "Il y a 2 jours", etc.
*/
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime(); // Difference in milliseconds
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60)  return "À l'instant";
  if (diffMin < 60)  return `Il y a ${diffMin} minute${diffMin > 1 ? "s" : ""}`;
  if (diffHr  < 24)  return `Il y a ${diffHr} heure${diffHr > 1 ? "s" : ""}`;
  if (diffDay < 30)  return `Il y a ${diffDay} jour${diffDay > 1 ? "s" : ""}`;
  return formatDate(d);
}

/*
  Truncates text to a given length, adding "..." if it's cut.
  Used for excerpt previews on post cards.
*/
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

/*
  Creates a debounced version of a function.
  "Debouncing" means: only run the function after the user has
  STOPPED calling it for a specified delay.

  Used for search inputs — so we don't fire a search request
  on every single keystroke, but only after the user pauses typing.

  Example: debounce(searchFn, 300) — waits 300ms after last keystroke.
*/
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    // Cancel the previous timer
    clearTimeout(timeoutId);
    // Start a new timer
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/*
  Generates a random ID.
  Used for temporary IDs before the server assigns a real one.
*/
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
