/*
  Une version précise de l'article : ce qui a changé par rapport à la
  version précédente, le texte complet de la version, et le bouton pour la rétablir.
*/

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { RevertButton } from "@/components/RevertButton";
import { diffLines, withContext } from "@/lib/diff";
import { getRevisionContext } from "@/lib/store";
import { regionLabel } from "@/lib/utils";
import { AVAILABLE_FLAIRS } from "@/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, id } = await params;
  const data = await getRevisionContext(slug, id);
  return { title: data ? `Version : ${data.post.title}` : "Page introuvable" };
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-CA", { dateStyle: "long", timeStyle: "short" });
}

function flairNames(ids: string[]): string {
  const names = AVAILABLE_FLAIRS.filter((f) => ids.includes(f.id)).map((f) => f.label);
  return names.length > 0 ? names.join(", ") : "aucune";
}

export default async function RevisionPage({ params }: { params: Params }) {
  const { slug, id } = await params;
  const data = await getRevisionContext(slug, id);
  if (!data) notFound();

  const { post, revision, previous, isCurrent } = data;

  /* Changements des champs courts */
  const fieldChanges: { label: string; before: string; after: string }[] = [];
  if (previous) {
    if (previous.title !== revision.title)
      fieldChanges.push({ label: "Titre", before: previous.title, after: revision.title });
    if (previous.excerpt !== revision.excerpt)
      fieldChanges.push({ label: "Résumé", before: previous.excerpt, after: revision.excerpt });
    if (previous.region !== revision.region)
      fieldChanges.push({
        label: "Région",
        before: regionLabel(previous.region),
        after: regionLabel(revision.region),
      });
    if (previous.flairIds.join() !== revision.flairIds.join())
      fieldChanges.push({
        label: "Catégories",
        before: flairNames(previous.flairIds),
        after: flairNames(revision.flairIds),
      });
  }

  /* Changements du texte */
  const lines = previous ? diffLines(previous.content, revision.content) : [];
  const contentChanged = lines.some((l) => l.type !== "same");
  const items = contentChanged ? withContext(lines, 2) : [];

  return (
    <div className="narrow">
      <div className="page-head">
        <p className="muted small">
          <Link href={`/post/${post.slug}/history`}>← Historique de « {post.title} »</Link>
        </p>
        <h1>Version du {formatDateTime(revision.createdAt)}</h1>
        <p className="muted">
          Par {revision.author} · {revision.summary}
          {isCurrent && " · version actuelle"}
        </p>
      </div>

      {!isCurrent && (
        <section className="section section--first">
          <h2>Rétablir cette version</h2>
          <RevertButton slug={post.slug} revisionId={revision.id} />
        </section>
      )}

      <section className="section">
        <h2>Modifications</h2>

        {!previous && <p className="muted">C&apos;est la première version de l&apos;article.</p>}

        {previous && fieldChanges.length === 0 && !contentChanged && (
          <p className="muted">Aucune différence avec la version précédente.</p>
        )}

        {fieldChanges.length > 0 && (
          <dl className="changes">
            {fieldChanges.map((c) => (
              <div key={c.label}>
                <dt>{c.label}</dt>
                <dd>
                  <del>{c.before}</del> <ins>{c.after}</ins>
                </dd>
              </div>
            ))}
          </dl>
        )}

        {contentChanged && (
          <div className="diff" role="region" aria-label="Différences dans le texte">
            {items.map((item, i) =>
              item.type === "gap" ? (
                <div key={i} className="diff__gap">
                  … {item.hidden} ligne{item.hidden > 1 ? "s" : ""} identique{item.hidden > 1 ? "s" : ""} …
                </div>
              ) : (
                <div key={i} className={`diff__line diff__line--${item.type}`}>
                  <span className="diff__mark" aria-hidden="true">
                    {item.type === "add" ? "+" : item.type === "del" ? "−" : " "}
                  </span>
                  <span className="sr-only">
                    {item.type === "add" ? "Ajouté : " : item.type === "del" ? "Supprimé : " : ""}
                  </span>
                  {item.text || " "}
                </div>
              )
            )}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Texte de cette version</h2>
        <h3>{revision.title}</h3>
        <p className="lead">{revision.excerpt}</p>
        <Markdown content={revision.content} />
      </section>
    </div>
  );
}
