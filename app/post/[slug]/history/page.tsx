import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/store";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post ? `Historique : ${post.title}` : "Page introuvable" };
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-CA", { dateStyle: "long", timeStyle: "short" });
}

export default async function HistoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="narrow">
      <div className="page-head">
        <p className="muted small">
          <Link href={`/post/${post.slug}`}>← Retour à l&apos;article</Link>
        </p>
        <h1>Historique : {post.title}</h1>
        <p className="muted">
          {post.revisions.length} révision{post.revisions.length > 1 ? "s" : ""}. Ouvrez une version pour
          voir ce qui a changé ou pour la rétablir.
        </p>
      </div>

      <ul className="history history--full">
        {post.revisions.map((r, i) => (
          <li key={r.id}>
            <time dateTime={r.createdAt}>{formatDateTime(r.createdAt)}</time>
            <span>{r.author}</span>
            <span className="muted">{r.summary}</span>
            <span className="history__links">
              {i === 0 && <span className="tag">actuelle</span>}
              <Link href={`/post/${post.slug}/history/${r.id}`}>voir</Link>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
