/*
  types/index.ts — Types partagés (client + serveur)
*/

export type Region = "quebec" | "france" | "other";

export const REGIONS: { id: Region; label: string }[] = [
  { id: "quebec", label: "Québec" },
  { id: "france", label: "France" },
  { id: "other", label: "Autre" },
];

export interface Flair {
  id: string;
  label: string;
  /** "status" = indique le niveau de vérification, affiché différemment */
  kind: "topic" | "status";
}

export const AVAILABLE_FLAIRS: Flair[] = [
  { id: "histoire", label: "Histoire", kind: "topic" },
  { id: "politique", label: "Politique", kind: "topic" },
  { id: "corruption", label: "Corruption", kind: "topic" },
  { id: "justice", label: "Justice", kind: "topic" },
  { id: "societe", label: "Société", kind: "topic" },
  { id: "media-perdu", label: "Média perdu", kind: "topic" },
  { id: "source", label: "Sourcé", kind: "status" },
  { id: "a-verifier", label: "À vérifier", kind: "status" },
];

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string; // ISO
}

export interface Revision {
  id: string;
  author: string;
  summary: string;
  createdAt: string; // ISO
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  region: Region;
  flairIds: string[];
  author: string; // auteur initial
  createdAt: string; // ISO
  updatedAt: string; // ISO
  views: number;
  comments: Comment[];
  revisions: Revision[];
}

/** Ce que le formulaire envoie à l'API */
export interface PostInput {
  title: string;
  excerpt: string;
  content: string;
  region: Region;
  flairIds: string[];
  author?: string;
  summary?: string; // résumé de modification (édition seulement)
}

export type SortOption = "recent" | "views" | "comments";

export const DAILY_POST_LIMIT = 30;
