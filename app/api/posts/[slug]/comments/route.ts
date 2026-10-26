/*
  app/api/posts/[slug]/comments/route.ts
    POST /api/posts/:slug/comments -> ajoute un commentaire
*/

import { NextRequest, NextResponse } from "next/server";
import { addComment } from "@/lib/store";
import { cleanAuthor, validateComment } from "@/lib/validate";
import { allow, clientIp } from "@/lib/serverRateLimit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!allow(`comment:${clientIp(request.headers)}`, 100)) {
    return NextResponse.json({ error: "Limite quotidienne atteinte." }, { status: 429 });
  }

  let body: { author?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const problem = validateComment(body.content ?? "");
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const post = await addComment(slug, cleanAuthor(body.author), body.content ?? "");
  if (!post) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

  return NextResponse.json({ ok: true }, { status: 201 });
}
