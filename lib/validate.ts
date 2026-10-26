/*
  lib/validate.ts — Règles de validation partagées
  Utilisé par le formulaire (confort) ET par l'API (sécurité).
*/

import { AVAILABLE_FLAIRS } from "@/types";

export const LIMITS = {
  title: { min: 10, max: 200 },
  excerpt: { min: 30, max: 500 },
  content: { min: 100, max: 50000 },
  author: { max: 30 },
  summary: { max: 200 },
  comment: { min: 3, max: 2000 },
  flairs: { max: 3 },
};

export type Errors = Partial<Record<string, string>>;

export function validatePost(input: {
  title?: string;
  excerpt?: string;
  content?: string;
  region?: string;
  flairIds?: string[];
}): Errors {
  const errors: Errors = {};
  const title = (input.title ?? "").trim();
  const excerpt = (input.excerpt ?? "").trim();
  const content = (input.content ?? "").trim();

  if (title.length < LIMITS.title.min) {
    errors.title = `Le titre doit faire au moins ${LIMITS.title.min} caractères.`;
  } else if (title.length > LIMITS.title.max) {
    errors.title = `Le titre ne peut pas dépasser ${LIMITS.title.max} caractères.`;
  }

  if (excerpt.length < LIMITS.excerpt.min) {
    errors.excerpt = `Le résumé doit faire au moins ${LIMITS.excerpt.min} caractères.`;
  } else if (excerpt.length > LIMITS.excerpt.max) {
    errors.excerpt = `Le résumé ne peut pas dépasser ${LIMITS.excerpt.max} caractères.`;
  }

  if (content.length < LIMITS.content.min) {
    errors.content = `Le contenu doit faire au moins ${LIMITS.content.min} caractères.`;
  } else if (content.length > LIMITS.content.max) {
    errors.content = `Le contenu ne peut pas dépasser ${LIMITS.content.max} caractères.`;
  }

  if (!["quebec", "france", "other"].includes(input.region ?? "")) {
    errors.region = "Région invalide.";
  }

  const flairIds = input.flairIds ?? [];
  const known = new Set(AVAILABLE_FLAIRS.map((f) => f.id));
  if (flairIds.length > LIMITS.flairs.max || flairIds.some((id) => !known.has(id))) {
    errors.flairIds = `Choisissez jusqu'à ${LIMITS.flairs.max} catégories valides.`;
  }

  return errors;
}

export function validateComment(content: string): string | null {
  const text = content.trim();
  if (text.length < LIMITS.comment.min) return "Le commentaire est trop court.";
  if (text.length > LIMITS.comment.max) {
    return `Le commentaire ne peut pas dépasser ${LIMITS.comment.max} caractères.`;
  }
  return null;
}

export function cleanAuthor(raw: unknown): string {
  const name = typeof raw === "string" ? raw.trim().slice(0, LIMITS.author.max) : "";
  return name || "Anonyme";
}
