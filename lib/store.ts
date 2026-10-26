/*
  lib/store.ts — Stockage des articles dans data/posts.json

  Simple et suffisant en local. Sur un hébergeur sans disque persistant
  (Vercel, par exemple), remplacez ce fichier par une vraie base de
  données : seules les fonctions exportées ci-dessous doivent rester.
*/

import { promises as fs } from "fs";
import path from "path";
import { SEED_POSTS } from "./seed";
import { fold, slugify } from "./utils";
import type { Post, PostInput, Region, SortOption } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "posts.json");

/* Une file d'attente pour éviter que deux écritures se chevauchent */
let queue: Promise<unknown> = Promise.resolve();
function locked<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

async function write(posts: Post[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(posts, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

async function read(): Promise<Post[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Post[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      const seed = structuredClone(SEED_POSTS);
      await write(seed);
      return seed;
    }
    throw err;
  }
}

function newId(): string {
  return globalThis.crypto.randomUUID();
}

/* ---------- Lecture ---------- */

export interface ListFilters {
  region?: Region;
  flair?: string;
  q?: string;
  sort?: SortOption;
}

export async function listPosts(filters: ListFilters = {}): Promise<Post[]> {
  let posts = await read();

  if (filters.region) posts = posts.filter((p) => p.region === filters.region);
  if (filters.flair) posts = posts.filter((p) => p.flairIds.includes(filters.flair!));
  if (filters.q?.trim()) {
    const needle = fold(filters.q.trim());
    posts = posts.filter((p) => fold(`${p.title} ${p.excerpt} ${p.content}`).includes(needle));
  }

  const sort = filters.sort ?? "recent";
  return [...posts].sort((a, b) => {
    if (sort === "views") return b.views - a.views;
    if (sort === "comments") return b.comments.length - a.comments.length;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export async function getPost(slug: string): Promise<Post | null> {
  const posts = await read();
  return posts.find((p) => p.slug === slug) ?? null;
}

/* ---------- Écriture ---------- */

export function createPost(input: PostInput, author: string): Promise<Post> {
  return locked(async () => {
    const posts = await read();

    const base = slugify(input.title) || "article";
    let slug = base;
    for (let i = 2; posts.some((p) => p.slug === slug); i++) slug = `${base}-${i}`;

    const now = new Date().toISOString();
    const post: Post = {
      id: newId(),
      slug,
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      content: input.content.trim(),
      region: input.region,
      flairIds: input.flairIds,
      author,
      createdAt: now,
      updatedAt: now,
      views: 0,
      comments: [],
      revisions: [{ id: newId(), author, summary: "Création de l'article", createdAt: now }],
    };

    await write([post, ...posts]);
    return post;
  });
}

export function updatePost(slug: string, input: PostInput, author: string): Promise<Post | null> {
  return locked(async () => {
    const posts = await read();
    const post = posts.find((p) => p.slug === slug);
    if (!post) return null;

    const now = new Date().toISOString();
    post.title = input.title.trim();
    post.excerpt = input.excerpt.trim();
    post.content = input.content.trim();
    post.region = input.region;
    post.flairIds = input.flairIds;
    post.updatedAt = now;
    post.revisions.unshift({
      id: newId(),
      author,
      summary: input.summary?.trim().slice(0, 200) || "Modification",
      createdAt: now,
    });

    await write(posts);
    return post;
  });
}

export function addComment(slug: string, author: string, content: string): Promise<Post | null> {
  return locked(async () => {
    const posts = await read();
    const post = posts.find((p) => p.slug === slug);
    if (!post) return null;

    post.comments.push({
      id: newId(),
      author,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    });

    await write(posts);
    return post;
  });
}

export function addView(slug: string): Promise<void> {
  return locked(async () => {
    const posts = await read();
    const post = posts.find((p) => p.slug === slug);
    if (!post) return;
    post.views += 1;
    await write(posts);
  });
}
