import Link from "next/link";
import { AVAILABLE_FLAIRS, type Post } from "@/types";
import { FlairTag } from "./FlairTag";
import { plural, regionLabel, timeAgo } from "@/lib/utils";

/* Une ligne du fil : compteur à gauche (style forum), texte à droite */
export function PostRow({ post }: { post: Post }) {
  const flairs = AVAILABLE_FLAIRS.filter((f) => post.flairIds.includes(f.id));

  return (
    <article className="row">
      <div className="row__count" aria-label={plural(post.comments.length, "commentaire", "commentaires")}>
        <strong>{post.comments.length}</strong>
        <span>comm.</span>
      </div>

      <div className="row__body">
        <h2 className="row__title">
          <Link href={`/post/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="row__excerpt">{post.excerpt}</p>
        <div className="row__meta">
          <span>{regionLabel(post.region)}</span>
          <span>modifié {timeAgo(post.updatedAt)}</span>
          <span>{plural(post.views, "vue", "vues")}</span>
          <span>{plural(post.revisions.length, "révision", "révisions")}</span>
          {flairs.map((f) => (
            <FlairTag key={f.id} flair={f} href={`/?flair=${f.id}`} />
          ))}
        </div>
      </div>
    </article>
  );
}
