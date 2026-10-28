/*
  app/api/posts/[slug]/revisions/[id]/revert/route.ts
    POST -> rétablit une ancienne version (ajoutée à l'historique comme nouvelle révision)

  Ouvert à tous, comme la modification : c'est une action réversible et
  entièrement tracée dans l'historique.
*/

import { NextRequest, NextResponse } from "next/server";
import { revertToRevision } from "@/lib/store";
import { cleanAuthor } from "@/lib/validate";
import { allow, clientIp } from "@/lib/serverRateLimit";
import { DAILY_POST_LIMIT } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  if (!allow(`edit:${clientIp(request.headers)}`, DAILY_POST_LIMIT)) {
    return NextResponse.json({ error: "Limite quotidienne atteinte." }, { status: 429 });
  }

  const { slug, id } = await params;
  const body = (await request.json().catch(() => ({}))) as { author?: string };

  const ok = await revertToRevision(slug, id, cleanAuthor(body.author));
  if (!ok) return NextResponse.json({ error: "Version introuvable." }, { status: 404 });

  return NextResponse.json({ slug });
}
