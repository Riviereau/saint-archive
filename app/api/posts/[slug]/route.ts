/*
  app/api/posts/[slug]/route.ts
    PUT    /api/posts/:slug  -> modifie un article (ajoute une révision)
    DELETE /api/posts/:slug  -> supprime un article (clé d'administration requise)
*/

import { NextRequest, NextResponse } from "next/server";
import { softDeletePost, updatePost } from "@/lib/store";
import { requireAdmin } from "@/lib/admin";
import { cleanAuthor, validatePost } from "@/lib/validate";
import { allow, clientIp } from "@/lib/serverRateLimit";
import { DAILY_POST_LIMIT, type PostInput } from "@/types";

type Context = { params: Promise<{ slug: string }> };

export async function PUT(request: NextRequest, { params }: Context) {
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

  const ok = await updatePost(slug, body as PostInput, cleanAuthor(body.author));
  if (!ok) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

  return NextResponse.json({ slug });
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { slug } = await params;
  const ok = await softDeletePost(slug);
  if (!ok) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
