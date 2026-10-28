/*
  lib/store.ts — Accès à la base de données (Prisma)

  Toutes les lectures et écritures passent par ici. Les pages et les routes
  API n'importent jamais Prisma directement : si vous changez de base de
  données, seul ce fichier (et prisma/schema.prisma) est concerné.
*/

import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { SEED_POSTS } from "./seed";
import { fold, formatDate, slugify } from "./utils";
import type {
  Post,
  PostInput,
  PostSummary,
  Region,
  Revision,
  SortOption,
} from "@/types";

/* ---------- Conversions ---------- */

/*
  Les catégories sont stockées dans une seule colonne texte, entourées de
  virgules : ",corruption,politique,". Cela permet de filtrer avec
  "contains ',corruption,'" sans confondre deux catégories voisines.
*/
const encodeFlairs = (ids: string[]) => (ids.length > 0 ? `,${ids.join(",")},` : "");
const decodeFlairs = (raw: string) => raw.split(",").filter(Boolean);

function asRegion(value: string): Region {
  return value === "quebec" || value === "france" ? value : "other";
}

function snapshotData(input: Pick<PostInput, "title" | "excerpt" | "content" | "region" | "flairIds">) {
  return {
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    region: input.region,
    flairs: encodeFlairs(input.flairIds),
  };
}

function toSummary(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  region: string;
  flairs: string;
  updatedAt: Date;
  views: number;
  _count: { comments: number; revisions: number };
}): PostSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    region: asRegion(row.region),
    flairIds: decodeFlairs(row.flairs),
    updatedAt: row.updatedAt.toISOString(),
    views: row.views,
    commentCount: row._count.comments,
    revisionCount: row._count.revisions,
  };
}

function toRevision(row: {
  id: string;
  author: string;
  summary: string;
  createdAt: Date;
  title: string;
  excerpt: string;
  content: string;
  region: string;
  flairs: string;
}): Revision {
  return {
    id: row.id,
    author: row.author,
    summary: row.summary,
    createdAt: row.createdAt.toISOString(),
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    region: asRegion(row.region),
    flairIds: decodeFlairs(row.flairs),
  };
}

/* ---------- Articles de départ ---------- */

/* Insérés une seule fois, quand la base est complètement vide. */
let seeding: Promise<void> | null = null;

function ensureSeeded(): Promise<void> {
  if (!seeding) {
    seeding = (async () => {
      if ((await prisma.post.count()) > 0) return;
      for (const p of SEED_POSTS) {
        const date = new Date(p.createdAt);
        const snap = snapshotData(p);
        await prisma.post.create({
          data: {
            slug: p.slug,
            ...snap,
            author: p.author,
            createdAt: date,
            updatedAt: date,
            revisions: {
              create: { author: p.author, summary: "Création de l'article", ...snap, createdAt: date },
            },
          },
        });
      }
    })().catch((err) => {
      seeding = null; // on pourra réessayer à la requête suivante
      throw err;
    });
  }
  return seeding;
}

/* ---------- Lecture ---------- */

export interface ListFilters {
  region?: Region;
  flair?: string;
  q?: string;
  sort?: SortOption;
}

const summarySelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  region: true,
  flairs: true,
  updatedAt: true,
  views: true,
  _count: { select: { comments: true, revisions: true } },
} satisfies Prisma.PostSelect;

export async function listPosts(filters: ListFilters = {}): Promise<PostSummary[]> {
  await ensureSeeded();

  const sort = filters.sort ?? "recent";
  const orderBy: Prisma.PostOrderByWithRelationInput =
    sort === "views"
      ? { views: "desc" }
      : sort === "comments"
        ? { comments: { _count: "desc" } }
        : { updatedAt: "desc" };

  const needle = filters.q?.trim() ? fold(filters.q.trim()) : null;

  const rows = await prisma.post.findMany({
    where: {
      deletedAt: null,
      ...(filters.region ? { region: filters.region } : {}),
      ...(filters.flair ? { flairs: { contains: `,${filters.flair},` } } : {}),
    },
    orderBy,
    // Le texte complet n'est chargé que pour une recherche.
    select: { ...summarySelect, content: Boolean(needle) as true },
  });

  /*
    La recherche ignore les accents ("elections" trouve "élections").
    SQLite ne sait pas le faire, on filtre donc ici. C'est largement
    suffisant pour quelques milliers d'articles; au-delà, passez à la
    recherche plein texte de PostgreSQL.
  */
  const matching = needle
    ? rows.filter((r) => fold(`${r.title} ${r.excerpt} ${r.content}`).includes(needle))
    : rows;

  return matching.map(toSummary);
}

export async function getPost(slug: string): Promise<Post | null> {
  const row = await prisma.post.findFirst({
    where: { slug, deletedAt: null },
    include: {
      comments: { orderBy: { createdAt: "asc" } },
      revisions: {
        orderBy: { createdAt: "desc" },
        select: { id: true, author: true, summary: true, createdAt: true },
      },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    region: asRegion(row.region),
    flairIds: decodeFlairs(row.flairs),
    author: row.author,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    views: row.views,
    comments: row.comments.map((c) => ({
      id: c.id,
      author: c.author,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
    })),
    revisions: row.revisions.map((r) => ({
      id: r.id,
      author: r.author,
      summary: r.summary,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

/* Une version + la précédente (pour afficher les différences) */
export async function getRevisionContext(slug: string, revisionId: string) {
  const row = await prisma.revision.findFirst({
    where: { id: revisionId, post: { slug, deletedAt: null } },
    include: { post: { select: { slug: true, title: true } } },
  });
  if (!row) return null;

  const [previous, newest] = await Promise.all([
    prisma.revision.findFirst({
      where: { postId: row.postId, createdAt: { lt: row.createdAt } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.revision.findFirst({
      where: { postId: row.postId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    }),
  ]);

  return {
    post: { slug: row.post.slug, title: row.post.title },
    revision: toRevision(row),
    previous: previous ? toRevision(previous) : null,
    isCurrent: newest?.id === row.id,
  };
}

/* ---------- Écriture ---------- */

export async function createPost(input: PostInput, author: string): Promise<string> {
  await ensureSeeded();

  const base = slugify(input.title) || "article";
  const snap = snapshotData(input);

  for (let attempt = 0; attempt < 5; attempt++) {
    // Cherche une adresse libre : "titre", "titre-2", "titre-3"…
    let slug = base;
    let n = 2;
    while (await prisma.post.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${base}-${n++}`;
    }

    try {
      const post = await prisma.post.create({
        data: {
          slug,
          ...snap,
          author,
          revisions: { create: { author, summary: "Création de l'article", ...snap } },
        },
        select: { slug: true },
      });
      return post.slug;
    } catch (err) {
      // Deux personnes ont pris la même adresse en même temps : on recommence.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue;
      throw err;
    }
  }
  throw new Error("Impossible de générer une adresse unique pour cet article.");
}

/* Retourne false si l'article n'existe pas (ou a été supprimé). */
export async function updatePost(slug: string, input: PostInput, author: string): Promise<boolean> {
  const current = await prisma.post.findFirst({ where: { slug, deletedAt: null } });
  if (!current) return false;

  const snap = snapshotData(input);
  const unchanged =
    current.title === snap.title &&
    current.excerpt === snap.excerpt &&
    current.content === snap.content &&
    current.region === snap.region &&
    current.flairs === snap.flairs;
  if (unchanged) return true; // rien à enregistrer

  const now = new Date();
  await prisma.$transaction([
    prisma.post.update({ where: { id: current.id }, data: { ...snap, updatedAt: now } }),
    prisma.revision.create({
      data: {
        postId: current.id,
        author,
        summary: input.summary?.trim().slice(0, 200) || "Modification",
        ...snap,
        createdAt: now,
      },
    }),
  ]);
  return true;
}

/* Rétablit une ancienne version, en l'ajoutant comme NOUVELLE révision :
   l'historique n'est jamais réécrit, on peut donc annuler un rétablissement. */
export async function revertToRevision(
  slug: string,
  revisionId: string,
  author: string
): Promise<boolean> {
  const rev = await prisma.revision.findFirst({
    where: { id: revisionId, post: { slug, deletedAt: null } },
  });
  if (!rev) return false;

  const post = await prisma.post.findUnique({ where: { id: rev.postId } });
  if (!post) return false;

  const data = {
    title: rev.title,
    excerpt: rev.excerpt,
    content: rev.content,
    region: rev.region,
    flairs: rev.flairs,
  };

  const same =
    post.title === data.title &&
    post.excerpt === data.excerpt &&
    post.content === data.content &&
    post.region === data.region &&
    post.flairs === data.flairs;
  if (same) return true; // c'est déjà la version actuelle

  const now = new Date();
  await prisma.$transaction([
    prisma.post.update({ where: { id: rev.postId }, data: { ...data, updatedAt: now } }),
    prisma.revision.create({
      data: {
        postId: rev.postId,
        author,
        summary: `Rétablissement de la version du ${formatDate(rev.createdAt.toISOString())}`,
        ...data,
        createdAt: now,
      },
    }),
  ]);
  return true;
}

export async function addComment(slug: string, author: string, content: string): Promise<boolean> {
  const post = await prisma.post.findFirst({ where: { slug, deletedAt: null }, select: { id: true } });
  if (!post) return false;
  await prisma.comment.create({ data: { postId: post.id, author, content: content.trim() } });
  return true;
}

export async function deleteComment(slug: string, commentId: string): Promise<boolean> {
  const result = await prisma.comment.deleteMany({ where: { id: commentId, post: { slug } } });
  return result.count > 0;
}

/*
  Suppression "douce" : l'article disparaît du site mais reste dans la base
  (colonne deletedAt). Pour le récupérer : npx prisma studio, puis videz deletedAt.
*/
export async function softDeletePost(slug: string): Promise<boolean> {
  const result = await prisma.post.updateMany({
    where: { slug, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  return result.count > 0;
}

export async function addView(slug: string): Promise<void> {
  await prisma.post.updateMany({
    where: { slug, deletedAt: null },
    data: { views: { increment: 1 } },
  });
}
