/*
  app/api/posts/[slug]/route.ts
    PUT /api/posts/:slug  -> modifie un article (et ajoute une révision)
*/

import { NextRequest, NextResponse } from "next/server";
import { updatePost } from "@/lib/store";
import { cleanAuthor, validatePost } from "@/lib/validate";
import { allow, clientIp } from "@/lib/serverRateLimit";
import { DAILY_POST_LIMIT, type PostInput } from "@/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!allow(`edit:${clientIp(request.headers)}`, DAILY_POST_LIMIT)) {
    return NextResponse.json({ error: "Limite quotidienne atteinte." }, { status: 429 });
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

  const post = await updatePost(slug, body as PostInput, cleanAuthor(body.author));
  if (!post) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

  return NextResponse.json({ slug: post.slug });
}
