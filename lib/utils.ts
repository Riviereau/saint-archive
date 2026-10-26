/*
  lib/utils.ts — Petites fonctions utilitaires
*/

import type { Region } from "@/types";

/** "Commission Charbonneau (2011)" -> "commission-charbonneau-2011" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Minuscules + sans accents, pour la recherche */
export function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} jour${days > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.floor(days / 365);
  return `il y a ${years} an${years > 1 ? "s" : ""}`;
}

export function regionLabel(region: Region): string {
  if (region === "quebec") return "Québec";
  if (region === "france") return "France";
  return "Autre";
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n > 1 ? many : one}`;
}

/** Extrait les titres ## et ### d'un texte Markdown pour le sommaire */
export function extractHeadings(markdown: string): { id: string; text: string; level: 2 | 3 }[] {
  const headings: { id: string; text: string; level: 2 | 3 }[] = [];
  let inCode = false;
  for (const line of markdown.split("\n")) {
    if (line.trim().startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (match) {
      const text = match[2].replace(/[*_`]/g, "");
      headings.push({ id: slugify(text), text, level: match[1].length as 2 | 3 });
    }
  }
  return headings;
}
