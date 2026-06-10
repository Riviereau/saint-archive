/*
  ============================================================
  components/PostCard.tsx — Preview card for a post
  ============================================================

  TIP FOR LEARNERS:
  This component renders a single post preview (title, excerpt,
  flairs, metadata). It's used on the home page feed.

  Notice how this component has NO state — it's "stateless".
  It just receives data as props and renders it. These are called
  "presentational" or "dumb" components. Simpler = better!
*/

import Link from "next/link";       // Next.js's <Link> is like <a> but faster
import { Post } from "@/types";
import { FlairBadge } from "./FlairBadge";
import { timeAgo } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    /*
      We use Next.js's <Link> component instead of <a href="...">.
      Link does "client-side navigation" — it loads the new page
      without a full browser reload, making it feel much faster.
    */
    <Link href={`/post/${post.slug}`} className="post-card animate-in">

      {/* --- Flairs row --- */}
      <div className="post-card__header">
        {/*
          post.flairs.map() renders a FlairBadge for each flair.
          We limit to 3 flairs with .slice(0, 3) to avoid overflow.
        */}
        {post.flairs.slice(0, 3).map((flair) => (
          <FlairBadge key={flair.id} flair={flair} size="sm" />
        ))}
      </div>

      {/* --- Title --- */}
      <h2 className="post-card__title">{post.title}</h2>

      {/* --- Excerpt --- */}
      <p className="post-card__excerpt">{post.excerpt}</p>

      {/* --- Meta row (author, date, counts) --- */}
      <div className="post-card__meta">

        <span className="post-card__meta-item">
          {/* Show username or "Anonyme" */}
          <span>par {post.author.username}</span>
        </span>

        <span className="post-card__meta-item">
          {/*
            timeAgo() converts the date to "Il y a 3 heures".
            We use a <time> element with the machine-readable "dateTime"
            attribute for accessibility and SEO.
          */}
          <time dateTime={post.createdAt.toISOString()}>
            {timeAgo(post.createdAt)}
          </time>
        </span>

        <span className="post-card__meta-item">
          👁 {post.viewCount}
        </span>

        <span className="post-card__meta-item">
          💬 {post.commentCount}
        </span>

      </div>
    </Link>
  );
}
