/*
  lib/admin.ts — Vérifie la clé d'administration (variable ADMIN_KEY du .env).
  Utilisée par les routes qui suppriment du contenu.

  Retourne une réponse d'erreur si l'accès est refusé, ou null si tout va bien :
    const denied = requireAdmin(request);
    if (denied) return denied;
*/

import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { allow, clientIp } from "./serverRateLimit";

export function requireAdmin(request: Request): NextResponse | null {
  if (!allow(`admin:${clientIp(request.headers)}`, 50)) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const expected = process.env.ADMIN_KEY;
  if (!expected) {
    return NextResponse.json(
      {
        error:
          "La suppression est désactivée : définissez ADMIN_KEY dans le fichier .env, puis redémarrez le serveur.",
      },
      { status: 503 }
    );
  }

  const given = Buffer.from(request.headers.get("x-admin-key") ?? "");
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
    return NextResponse.json({ error: "Clé d'administration incorrecte." }, { status: 403 });
  }

  return null;
}
