// prisma/import-json.mjs
// À lancer UNE FOIS si vous avez créé des articles avec la version précédente
// (stockés dans data/posts.json) et que vous voulez les garder :
//
//     node prisma/import-json.mjs
//
// Les articles dont l'adresse (slug) existe déjà dans la base sont ignorés.

import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";

const prisma = new PrismaClient();

let posts;
try {
  posts = JSON.parse(await readFile(new URL("../data/posts.json", import.meta.url), "utf8"));
} catch {
  console.log("Aucun fichier data/posts.json trouvé : rien à importer.");
  await prisma.$disconnect();
  process.exit(0);
}

let imported = 0;
for (const p of posts) {
  if (await prisma.post.findUnique({ where: { slug: p.slug } })) continue;

  const flairs = p.flairIds?.length ? `,${p.flairIds.join(",")},` : "";
  const snap = { title: p.title, excerpt: p.excerpt, content: p.content, region: p.region, flairs };

  await prisma.post.create({
    data: {
      slug: p.slug,
      ...snap,
      author: p.author ?? "Anonyme",
      views: p.views ?? 0,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt ?? p.createdAt),
      comments: {
        create: (p.comments ?? []).map((c) => ({
          author: c.author,
          content: c.content,
          createdAt: new Date(c.createdAt),
        })),
      },
      revisions: {
        create: [
          {
            author: p.author ?? "Anonyme",
            summary: "Importé depuis l'ancienne version",
            ...snap,
            createdAt: new Date(p.updatedAt ?? p.createdAt),
          },
        ],
      },
    },
  });
  imported++;
}

console.log(`${imported} article(s) importé(s).`);
await prisma.$disconnect();
