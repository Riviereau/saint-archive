/*
  ============================================================
  app/post/[slug]/page.tsx — Individual Post/Article Page
  ============================================================

  TIP FOR LEARNERS:
  The [slug] in the folder name is a "dynamic segment".
  It means this file handles ANY URL like:
    /post/commission-charbonneau
    /post/affaire-clearstream
    /post/radio-canada-perdues

  The actual slug value is accessible through the "params" prop.
  In Next.js App Router, params is now a Promise (async).
*/

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";  // Shows the 404 page
import { FlairBadge } from "@/components/FlairBadge";
import { AVAILABLE_FLAIRS, Comment, Post } from "@/types";
import { formatDate, timeAgo } from "@/lib/utils";

/*
  MOCK data for one full post.
  In a real app: const post = await prisma.post.findUnique({ where: { slug } })
*/
const MOCK_POST: Post = {
  id: "1",
  slug: "commission-charbonneau-2011",
  title: "La Commission Charbonneau et la corruption dans la construction",
  excerpt: "Lancée en 2011, la commission a mis au jour un vaste réseau de corruption.",
  content: `## Contexte

La Commission d'enquête sur l'octroi et la gestion des contrats publics dans l'industrie de la construction, communément appelée **Commission Charbonneau**, a été instituée le 9 novembre 2011 par le gouvernement du Québec.

Elle tire son nom de sa présidente, la juge **France Charbonneau**.

## Mandat

Son mandat principal était d'examiner l'existence de stratagèmes de corruption et de collusion dans l'industrie de la construction, notamment en ce qui concerne les contrats publics. Elle devait également examiner les liens possibles avec le financement des partis politiques.

## Principales révélations

Les audiences publiques ont mis au jour plusieurs mécanismes de collusion :

- Des ententes entre entrepreneurs pour se partager les contrats gouvernementaux
- Des versements de ristournes à des fonctionnaires municipaux
- Des liens avec le crime organisé, notamment la mafia sicilienne
- Du financement illégal de partis politiques municipaux et provinciaux

## Figures principales impliquées

**Tony Accurso**, entrepreneur en construction, a été au cœur de nombreuses révélations concernant ses liens avec des élus municipaux.

**Lino Zambito**, entrepreneur, a témoigné extensivement sur le système de corruption dans l'arrondissement de Boisbriand et à Montréal.

## Rapport final

Le rapport final, déposé en novembre 2015, contenait 60 recommandations visant à prévenir la corruption dans l'industrie de la construction.

## Sources

- Rapport final de la Commission Charbonneau (2015)
- Le Devoir, archives 2011–2015
- Radio-Canada, dossier Commission Charbonneau`,
  flairs: [
    AVAILABLE_FLAIRS.find((f) => f.id === "corruption")!,
    AVAILABLE_FLAIRS.find((f) => f.id === "quebec")!,
    AVAILABLE_FLAIRS.find((f) => f.id === "verified")!,
  ],
  author: { id: null, username: "Anonyme", isAnonymous: true },
  createdAt: new Date("2025-05-20"),
  updatedAt: new Date("2025-05-21"),
  viewCount: 4821,
  commentCount: 2,
  region: "quebec",
};

const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    postId: "1",
    content: "Excellent résumé. Il manque peut-être la mention du projet Contrecœur et des contrats liés au CHUM. Les liens avec Accurso dans ce dossier sont bien documentés.",
    author: { id: null, username: "ArchivisteMTL", isAnonymous: false },
    createdAt: new Date("2025-05-21T10:30:00"),
  },
  {
    id: "c2",
    postId: "1",
    content: "Source ajoutée: le rapport complet est disponible sur le site de la bibliothèque de l'Assemblée nationale. 1 200 pages.",
    author: { id: null, username: "Anonyme", isAnonymous: true },
    createdAt: new Date("2025-05-22T14:15:00"),
  },
];

/*
  Dynamic metadata — the page title changes based on the post.
  "generateMetadata" is a special Next.js export for this.
*/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // In a real app, fetch the post from DB
  const post = MOCK_POST.slug === slug ? MOCK_POST : null;
  if (!post) return { title: "Page introuvable" };

  return {
    title: post.title,
    description: post.excerpt,
  };
}

/*
  The page component itself.
  "params" contains the URL params — we read params.slug.
*/
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // In a real app: const post = await prisma.post.findUnique({ where: { slug } })
  const post = MOCK_POST.slug === slug ? MOCK_POST : null;

  /*
    If no post found, render the 404 page.
    "notFound()" is a Next.js helper that shows the not-found.tsx page.
  */
  if (!post) notFound();

  const comments = MOCK_COMMENTS;

  return (
    <div className="container container--wide">
      <div className="post-layout">

        {/* ======== MAIN CONTENT ======== */}
        <article className="post-layout__main">

          {/* --- Breadcrumb navigation --- */}
          <nav aria-label="Fil d'Ariane" style={{ marginBottom: "var(--space-4)", fontSize: "var(--text-sm)", color: "var(--color-text-faint)" }}>
            <Link href="/" style={{ color: "var(--color-text-faint)" }}>Accueil</Link>
            <span style={{ margin: "0 var(--space-2)" }}>/</span>
            <span style={{ color: "var(--color-text-dim)" }}>{post.region === "quebec" ? "Québec" : "France"}</span>
            <span style={{ margin: "0 var(--space-2)" }}>/</span>
            <span>{post.title.slice(0, 40)}…</span>
          </nav>

          {/* --- Flairs --- */}
          <div className="flex flex-wrap gap-2" style={{ marginBottom: "var(--space-4)" }}>
            {post.flairs.map((flair) => (
              <FlairBadge key={flair.id} flair={flair} />
            ))}
          </div>

          {/* --- Title --- */}
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", lineHeight: "1.15", marginBottom: "var(--space-4)" }}>
            {post.title}
          </h1>

          {/* --- Meta row --- */}
          <div style={{ display: "flex", gap: "var(--space-5)", marginBottom: "var(--space-8)", paddingBottom: "var(--space-5)", borderBottom: "1px solid var(--color-border)", flexWrap: "wrap" }}>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-dim)" }}>
              <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Auteur</span>
              <br />{post.author.username}
            </div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-dim)" }}>
              <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Publié</span>
              <br />
              <time dateTime={post.createdAt.toISOString()}>
                {formatDate(post.createdAt)}
              </time>
            </div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-dim)" }}>
              <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Vues</span>
              <br />{post.viewCount.toLocaleString("fr-CA")}
            </div>
          </div>

          {/* --- Excerpt/Lead paragraph --- */}
          <p style={{ fontSize: "var(--text-lg)", color: "var(--color-text-dim)", lineHeight: "1.7", marginBottom: "var(--space-8)", fontStyle: "italic", borderLeft: "3px solid var(--color-primary)", paddingLeft: "var(--space-4)" }}>
            {post.excerpt}
          </p>

          {/* --- Article body ---
              In a real app, you'd render Markdown here using a library
              like react-markdown or next-mdx-remote.
              For now we render the raw text with basic formatting.
          */}
          <div style={{ lineHeight: "1.8", fontSize: "var(--text-base)" }}>
            {post.content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("## ")) {
                // Render markdown ## headings
                return (
                  <h2 key={i} style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", marginTop: "var(--space-8)", marginBottom: "var(--space-3)", paddingBottom: "var(--space-2)", borderBottom: "1px solid var(--color-border)" }}>
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("- ")) {
                // Render markdown lists
                const items = paragraph.split("\n").filter(l => l.startsWith("- "));
                return (
                  <ul key={i} style={{ paddingLeft: "var(--space-5)", marginBottom: "var(--space-4)", listStyleType: "disc" }}>
                    {items.map((item, j) => (
                      <li key={j} style={{ color: "var(--color-text-dim)", marginBottom: "var(--space-1)" }}>
                        {item.replace("- ", "")}
                      </li>
                    ))}
                  </ul>
                );
              }
              // Regular paragraph
              return (
                <p key={i} style={{ color: "var(--color-text-dim)", marginBottom: "var(--space-4)" }}>
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* ---- COMMENTS SECTION ---- */}
          <section style={{ marginTop: "var(--space-12)" }}>
            <div className="divider">Commentaires ({comments.length})</div>

            {/* Comment list */}
            <div>
              {comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment__header">
                    {/* Avatar placeholder — first letter of username */}
                    <div className="avatar">
                      {comment.author.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="comment__author">{comment.author.username}</span>
                    <time
                      className="comment__timestamp"
                      dateTime={comment.createdAt.toISOString()}
                    >
                      {timeAgo(comment.createdAt)}
                    </time>
                  </div>
                  <p className="comment__body">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Add comment form */}
            <div style={{ marginTop: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-base)", fontFamily: "var(--font-body)", fontWeight: 500, marginBottom: "var(--space-3)", color: "var(--color-text-dim)" }}>
                Ajouter un commentaire
              </h3>
              <textarea
                className="form-textarea"
                style={{ minHeight: "100px" }}
                placeholder="Partagez des sources, corrections ou informations complémentaires…"
              />
              <div className="flex gap-3" style={{ marginTop: "var(--space-3)" }}>
                <button className="btn btn--primary btn--sm">Publier</button>
                <span className="text-dim text-sm" style={{ alignSelf: "center" }}>Anonyme par défaut</span>
              </div>
            </div>
          </section>

        </article>

        {/* ======== SIDEBAR ======== */}
        <aside className="post-layout__sidebar">

          {/* Table of Contents */}
          <div className="sidebar-box">
            <div className="sidebar-box__header">Table des matières</div>
            <div className="sidebar-box__body">
              <nav>
                <ul className="toc-list">
                  {["Contexte", "Mandat", "Principales révélations", "Figures principales impliquées", "Rapport final", "Sources"].map((heading) => (
                    <li key={heading}>
                      <a href={`#${heading.toLowerCase().replace(/\s+/g, "-")}`}>
                        {heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Post info box */}
          <div className="sidebar-box">
            <div className="sidebar-box__header">Informations</div>
            <div className="sidebar-box__body">
              <table style={{ width: "100%", fontSize: "var(--text-sm)", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    { label: "Région", value: post.region === "quebec" ? "⚜️ Québec" : "🇫🇷 France" },
                    { label: "Publié", value: formatDate(post.createdAt) },
                    { label: "Modifié", value: formatDate(post.updatedAt) },
                    { label: "Vues", value: post.viewCount.toLocaleString("fr-CA") },
                  ].map(({ label, value }) => (
                    <tr key={label} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "6px 0", color: "var(--color-text-faint)", paddingRight: "12px" }}>{label}</td>
                      <td style={{ padding: "6px 0", color: "var(--color-text-dim)" }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Flairs */}
          <div className="sidebar-box">
            <div className="sidebar-box__header">Catégories</div>
            <div className="sidebar-box__body">
              <div className="flex flex-wrap gap-2">
                {post.flairs.map((flair) => (
                  <FlairBadge key={flair.id} flair={flair} />
                ))}
              </div>
            </div>
          </div>

          {/* Edit CTA */}
          <Link href="/create" className="btn btn--ghost" style={{ width: "100%", justifyContent: "center" }}>
            ✏ Améliorer cette page
          </Link>

        </aside>
      </div>
    </div>
  );
}
