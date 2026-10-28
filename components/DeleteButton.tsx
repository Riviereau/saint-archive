"use client";

/*
  Bouton de suppression en deux temps : on clique, puis on saisit la clé
  d'administration (ADMIN_KEY du .env) pour confirmer. La clé n'est jamais
  stockée : elle est envoyée dans l'en-tête de la requête, puis oubliée.
*/

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  url: string; // route API à appeler en DELETE
  label?: string;
  warning: string; // ce qui va se passer
  redirectTo?: string; // page à ouvrir après la suppression
  block?: boolean; // pleine largeur
}

export function DeleteButton({ url, label = "Supprimer", warning, redirectTo, block }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, { method: "DELETE", headers: { "x-admin-key": key } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Suppression impossible.");

      setOpen(false);
      setKey("");
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className={block ? "btn btn--danger-plain btn--block btn--small" : "linklike linklike--danger"}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="confirm">
      <p className="confirm__text">{warning}</p>
      <label className="field">
        <span className="field__label">Clé d&apos;administration</span>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          autoComplete="off"
          autoFocus
        />
      </label>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
      <div className="actions">
        <button type="submit" className="btn btn--danger btn--small" disabled={busy || !key}>
          {busy ? "Suppression…" : "Confirmer"}
        </button>
        <button
          type="button"
          className="btn btn--plain btn--small"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
