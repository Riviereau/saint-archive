/*
  app/page.tsx — Accueil : fil d'articles filtrable (style forum)
  autour d'une mise en page de type encyclopédie.
  Filtres via l'URL : /?region=quebec&flair=corruption&sort=views&q=texte
*/

import Link from "next/link";
import { PostRow } from "@/components/PostRow";
import { listPosts } from "@/lib/store";
import { AVAILABLE_FLAIRS, REGIONS, type Region, type SortOption } from "@/types";

export const dynamic = "force-dynamic"; // lit data/posts.json à chaque requête

type SearchParams = Promise<{ region?: string; flair?: string; sort?: string; q?: string }>;

const SORTS: { id: SortOption; label: string }[] = [
  { id: "recent", label: "Récents" },
  { id: "views", label: "Plus lus" },
  { id: "comments", label: "Plus commentés" },
];

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const region = REGIONS.some((r) => r.id === sp.region) ? (sp.region as Region) : undefined;
  const flair = AVAILABLE_FLAIRS.some((f) => f.id === sp.flair) ? sp.flair : undefined;
  const sort: SortOption = sp.sort === "views" || sp.sort === "comments" ? sp.sort : "recent";
  const q = sp.q?.trim() || undefined;

  const posts = await listPosts({ region, flair, sort, q });

  /* Construit un lien en conservant les filtres actuels */
  function href(override: Record<string, string | undefined>): string {
    const merged: Record<string, string | undefined> = { region, flair, sort: sort === "recent" ? undefined : sort, q, ...override };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) if (value) params.set(key, value);
    const query = params.toString();
    return query ? `/?${query}` : "/";
  }

  const hasFilters = Boolean(region || flair || q);

  return (
    <div className="layout">
      <section aria-labelledby="feed-title">
        <div className="page-head">
          <h1 id="feed-title">{q ? `Résultats pour « ${q} »` : "Articles de l'archive"}</h1>
          <p className="muted">
            {posts.length} article{posts.length > 1 ? "s" : ""}
            {hasFilters && (
              <>
                {" · "}
                <Link href="/">retirer les filtres</Link>
              </>
            )}
          </p>
        </div>

        <nav className="filters" aria-label="Filtrer par région">
          <Link href={href({ region: undefined })} className={!region ? "is-on" : undefined}>
            Toutes les régions
          </Link>
          {REGIONS.map((r) => (
            <Link key={r.id} href={href({ region: r.id })} className={region === r.id ? "is-on" : undefined}>
              {r.label}
            </Link>
          ))}
          <span className="filters__sep" aria-hidden="true" />
          {SORTS.map((s) => (
            <Link
              key={s.id}
              href={href({ sort: s.id === "recent" ? undefined : s.id })}
              className={sort === s.id ? "is-on" : undefined}
            >
              {s.label}
            </Link>
          ))}
        </nav>

        {posts.length === 0 ? (
          <div className="empty">
            <p>Aucun article ne correspond à cette recherche.</p>
            <Link href="/create" className="btn">
              Écrire le premier article sur ce sujet
            </Link>
          </div>
        ) : (
          <div className="rows">
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      <aside className="side" aria-label="Informations">
        <div className="box">
          <h2 className="box__title">À propos</h2>
          <p>
            Saint-Archive documente l&apos;histoire, les affaires publiques et les médias disparus du
            Québec et de la France. Chaque article est modifiable par tous, avec historique des
            révisions et discussion.
          </p>
          <Link href="/create" className="btn">
            Nouvel article
          </Link>
        </div>

        <div className="box">
          <h2 className="box__title">Catégories</h2>
          <ul className="plain-list">
            {AVAILABLE_FLAIRS.map((f) => (
              <li key={f.id}>
                <Link href={href({ flair: f.id })} className={flair === f.id ? "is-on" : undefined}>
                  {f.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="box">
          <h2 className="box__title">Règles</h2>
          <ol className="num-list">
            <li>Citez vos sources.</li>
            <li>Séparez les faits établis des allégations.</li>
            <li>Respectez la vie privée des personnes non publiques.</li>
            <li>Corrigez plutôt que supprimer.</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}
