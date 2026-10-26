/*
  app/api/posts/route.ts
    GET  /api/posts   -> liste (filtres : region, flair, q, sort)
    POST /api/posts   -> crée un article
*/

import { NextRequest, NextResponse } from "next/server";
import { createPost, listPosts } from "@/lib/store";
import { cleanAuthor, validatePost } from "@/lib/validate";
import { allow, clientIp } from "@/lib/serverRateLimit";
import { DAILY_POST_LIMIT, type PostInput, type Region, type SortOption } from "@/types";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const region = sp.get("region");
  const sort = sp.get("sort");

  const posts = await listPosts({
    region: region === "quebec" || region === "france" || region === "other" ? (region as Region) : undefined,
    flair: sp.get("flair") ?? undefined,
    q: sp.get("q") ?? undefined,
    sort: sort === "views" || sort === "comments" ? (sort as SortOption) : "recent",
  });

  // On n'envoie pas le contenu complet dans la liste
  return NextResponse.json({
    posts: posts.map(({ content, ...rest }) => {
      void content;
      return { ...rest, commentCount: rest.comments.length };
    }),
  });
}

export async function POST(request: NextRequest) {
  if (!allow(`create:${clientIp(request.headers)}`, DAILY_POST_LIMIT)) {
    return NextResponse.json(
      { error: "Limite quotidienne atteinte. Revenez demain." },
      { status: 429, headers: { "Retry-After": "86400" } }
    );
  }

  let body: Partial<PostInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const errors = validatePost(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Certains champs sont invalides.", errors }, { status: 400 });
  }

  const post = await createPost(body as PostInput, cleanAuthor(body.author));
  return NextResponse.json({ slug: post.slug }, { status: 201 });
}
