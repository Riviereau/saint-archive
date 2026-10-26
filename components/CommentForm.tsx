"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LIMITS, validateComment } from "@/lib/validate";

export function CommentForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validateComment(content);
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Impossible d'envoyer le commentaire.");

      setContent("");
      router.refresh(); // recharge la liste des commentaires
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="comment-form">
      <h3>Ajouter un commentaire</h3>

      {error && (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      )}

      <label className="field">
        <span className="field__label">Pseudo (facultatif)</span>
        <input
          type="text"
          value={author}
          maxLength={LIMITS.author.max}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Anonyme"
        />
      </label>

      <label className="field">
        <span className="field__label">Commentaire</span>
        <textarea
          rows={4}
          value={content}
          maxLength={LIMITS.comment.max}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ajoutez une source, une correction ou un complément."
        />
      </label>

      <button type="submit" className="btn" disabled={busy}>
        {busy ? "Envoi…" : "Publier le commentaire"}
      </button>
    </form>
  );
}
