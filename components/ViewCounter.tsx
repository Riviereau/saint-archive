"use client";

import { useEffect } from "react";

/*
  Compte une lecture par session de navigation. Fait côté navigateur pour que
  l'ajout d'un commentaire (qui recharge la page) ne gonfle pas le compteur.
*/
export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `saint-archive:viewed:${slug}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* sessionStorage indisponible : on compte quand même */
    }
    fetch(`/api/posts/${slug}/view`, { method: "POST", keepalive: true }).catch(() => undefined);
  }, [slug]);

  return null;
}
