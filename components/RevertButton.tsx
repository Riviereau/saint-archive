"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LIMITS } from "@/lib/validate";

/* Rétablit une ancienne version. Ouvert à tous : c'est tracé dans l'historique. */
export function RevertButton({ slug, revisionId }: { slug: string; revisionId: string }) {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${slug}/revisions/${revisionId}/revert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Impossible de rétablir cette version.");

      router.push(`/post/${slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="revert">
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
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn" disabled={busy}>
        {busy ? "Rétablissement…" : "Rétablir cette version"}
      </button>
      <p className="field__hint">
        Le texte actuel n&apos;est pas perdu : le rétablissement s&apos;ajoute à l&apos;historique et peut lui-même
        être annulé.
      </p>
    </form>
  );
}
