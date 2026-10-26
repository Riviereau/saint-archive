import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import { getPost } from "@/lib/store";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post ? `Modifier : ${post.title}` : "Page introuvable" };
}

export default async function EditPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="narrow">
      <div className="page-head">
        <p className="muted small">
          <Link href={`/post/${post.slug}`}>← Retour à l&apos;article</Link>
        </p>
        <h1>Modifier : {post.title}</h1>
        <p className="muted">
          Votre modification est enregistrée dans l&apos;historique de l&apos;article.
        </p>
      </div>

      <PostForm
        mode="edit"
        slug={post.slug}
        initial={{
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          region: post.region,
          flairIds: post.flairIds,
        }}
      />
    </div>
  );
}
