/*
  app/post/[slug]/page.tsx — Page d'article, façon encyclopédie :
  titre, onglets, sommaire, boîte d'information, sources, historique
  et discussion en bas de page.
*/

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/CommentForm";
import { DeleteButton } from "@/components/DeleteButton";
import { FlairTag } from "@/components/FlairTag";
import { Markdown } from "@/components/Markdown";
import { ViewCounter } from "@/components/ViewCounter";
import { getPost } from "@/lib/store";
import { extractHeadings, formatDate, plural, regionLabel, timeAgo } from "@/lib/utils";
import { AVAILABLE_FLAIRS } from "@/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Page introuvable" };
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const flairs = AVAILABLE_FLAIRS.filter((f) => post.flairIds.includes(f.id));
  const headings = extractHeadings(post.content);
  const contributors = Array.from(new Set(post.revisions.map((r) => r.author)));

  return (
    <article className="article">
      <ViewCounter slug={post.slug} />
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <Link href="/">Articles</Link>
        <span aria-hidden="true">›</span>
        <Link href={`/?region=${post.region}`}>{regionLabel(post.region)}</Link>
      </nav>

      <h1 className="article__title">{post.title}</h1>

      <div className="article__tabs" role="navigation" aria-label="Actions sur l'article">
        <span className="is-on">Article</span>
        <a href="#discussion">Discussion ({post.comments.length})</a>
        <Link href={`/post/${post.slug}/history`}>Historique</Link>
        <Link href={`/post/${post.slug}/edit`} className="article__edit">
          Modifier
        </Link>
      </div>

      <div className="article__flairs">
        {flairs.map((f) => (
          <FlairTag key={f.id} flair={f} href={`/?flair=${f.id}`} />
        ))}
      </div>

      <div className="article__layout">
        <div className="article__main">
          <p className="lead">{post.excerpt}</p>

          {headings.length > 1 && (
            <nav className="toc" aria-label="Sommaire">
              <h2 className="toc__title">Sommaire</h2>
              <ol>
                {headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "toc__sub" : undefined}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <Markdown content={post.content} />

          <section id="historique" className="section">
            <h2>Historique des modifications</h2>
            <ul className="history">
              {post.revisions.slice(0, 5).map((r, i) => (
                <li key={r.id}>
                  <time dateTime={r.createdAt}>{formatDate(r.createdAt)}</time>
                  <span>{r.author}</span>
                  <span className="muted">{r.summary}</span>
                  <Link href={`/post/${post.slug}/history/${r.id}`}>
                    {i === 0 ? "voir (actuelle)" : "voir / rétablir"}
                  </Link>
                </li>
              ))}
            </ul>
            {post.revisions.length > 5 && (
              <p className="small">
                <Link href={`/post/${post.slug}/history`}>
                  Voir les {post.revisions.length} révisions
                </Link>
              </p>
            )}
          </section>

          <section id="discussion" className="section">
            <h2>Discussion ({post.comments.length})</h2>

            {post.comments.length === 0 ? (
              <p className="muted">Aucun commentaire pour l&apos;instant.</p>
            ) : (
              <ul className="comments">
                {post.comments.map((c) => (
                  <li key={c.id} className="comment">
                    <div className="comment__head">
                      <strong>{c.author}</strong>
                      <time dateTime={c.createdAt}>{timeAgo(c.createdAt)}</time>
                      <span className="comment__actions">
                        <DeleteButton
                          url={`/api/posts/${post.slug}/comments/${c.id}`}
                          warning="Ce commentaire sera supprimé définitivement."
                        />
                      </span>
                    </div>
                    <p>{c.content}</p>
                  </li>
                ))}
              </ul>
            )}

            <CommentForm slug={post.slug} />
          </section>
        </div>

        <aside className="infobox" aria-label="Informations sur l'article">
          <h2 className="infobox__title">Fiche</h2>
          <dl>
            <dt>Région</dt>
            <dd>{regionLabel(post.region)}</dd>
            <dt>Créé le</dt>
            <dd>{formatDate(post.createdAt)}</dd>
            <dt>Modifié le</dt>
            <dd>{formatDate(post.updatedAt)}</dd>
            <dt>Contributeurs</dt>
            <dd>{contributors.join(", ")}</dd>
            <dt>Révisions</dt>
            <dd>{post.revisions.length}</dd>
            <dt>Lectures</dt>
            <dd>{plural(post.views, "vue", "vues")}</dd>
          </dl>
          <Link href={`/post/${post.slug}/edit`} className="btn btn--plain btn--block">
            Améliorer cet article
          </Link>
          <div className="infobox__admin">
            <DeleteButton
              url={`/api/posts/${post.slug}`}
              label="Supprimer l'article"
              warning="L'article disparaîtra du site. Il reste dans la base de données et peut être récupéré par l'administrateur."
              redirectTo="/"
              block
            />
          </div>
        </aside>
      </div>
    </article>
  );
}
