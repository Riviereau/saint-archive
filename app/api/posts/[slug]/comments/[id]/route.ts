/*
  app/api/posts/[slug]/comments/[id]/route.ts
    DELETE /api/posts/:slug/comments/:id -> supprime un commentaire (clé d'administration requise)
*/

import { NextRequest, NextResponse } from "next/server";
import { deleteComment } from "@/lib/store";
import { requireAdmin } from "@/lib/admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { slug, id } = await params;
  const ok = await deleteComment(slug, id);
  if (!ok) return NextResponse.json({ error: "Commentaire introuvable." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
