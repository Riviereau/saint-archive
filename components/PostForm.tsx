"use client";

/*
  components/PostForm.tsx — Formulaire de création ET de modification.
  mode="create" -> POST /api/posts
  mode="edit"   -> PUT  /api/posts/:slug
*/

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlairPicker } from "./FlairPicker";
import { Markdown } from "./Markdown";
import { LIMITS, validatePost, type Errors } from "@/lib/validate";
import { canPostToday, incrementPostCount } from "@/lib/rateLimit";
import { REGIONS, type Region } from "@/types";

interface Props {
  mode: "create" | "edit";
  slug?: string;
  initial?: {
    title: string;
    excerpt: string;
    content: string;
    region: Region;
    flairIds: string[];
  };
}

export function PostForm({ mode, slug, initial }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [region, setRegion] = useState<Region>(initial?.region ?? "quebec");
  const [flairIds, setFlairIds] = useState<string[]>(initial?.flairIds ?? []);
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [author, setAuthor] = useState("");
  const [summary, setSummary] = useState("");

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    if (mode === "create" && !canPostToday()) {
      setServerError("Vous avez atteint la limite de publications pour aujourd'hui.");
      return;
    }

    const found = validatePost({ title, excerpt, content, region, flairIds });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      const res = await fetch(mode === "create" ? "/api/posts" : `/api/posts/${slug}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, content, region, flairIds, author, summary }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.error ?? "L'enregistrement a échoué.");
      }

      if (mode === "create") incrementPostCount();
      router.push(`/post/${data.slug}`);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {serverError && (
        <p className="notice notice--error" role="alert">
          {serverError}
        </p>
      )}

      <label className="field">
        <span className="field__label">Titre</span>
        <input
          type="text"
          value={title}
          maxLength={LIMITS.title.max}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex. : Commission Charbonneau sur l'industrie de la construction"
          aria-invalid={!!errors.title}
        />
        {errors.title && <span className="field__error">{errors.title}</span>}
      </label>

      <div className="field-row">
        <label className="field">
          <span className="field__label">Région</span>
          <select value={region} onChange={(e) => setRegion(e.target.value as Region)}>
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <div className="field">
          <span className="field__label">Catégories (jusqu&apos;à {LIMITS.flairs.max})</span>
          <FlairPicker selectedIds={flairIds} onChange={setFlairIds} />
          {errors.flairIds && <span className="field__error">{errors.flairIds}</span>}
        </div>
      </div>

      <label className="field">
        <span className="field__label">Résumé</span>
        <textarea
          rows={3}
          value={excerpt}
          maxLength={LIMITS.excerpt.max}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Une à trois phrases. Affiché dans la liste des articles."
          aria-invalid={!!errors.excerpt}
        />
        <span className="field__hint">
          {excerpt.length} / {LIMITS.excerpt.max}
        </span>
        {errors.excerpt && <span className="field__error">{errors.excerpt}</span>}
      </label>

      <div className="field">
        <div className="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "write"}
            className={`tabs__tab${tab === "write" ? " tabs__tab--on" : ""}`}
            onClick={() => setTab("write")}
          >
            Écrire
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "preview"}
            className={`tabs__tab${tab === "preview" ? " tabs__tab--on" : ""}`}
            onClick={() => setTab("preview")}
          >
            Aperçu
          </button>
        </div>

        {tab === "write" ? (
          <textarea
            rows={18}
            value={content}
            maxLength={LIMITS.content.max}
            onChange={(e) => setContent(e.target.value)}
            className="editor"
            placeholder={
              "## Contexte\n\nDécrivez les faits.\n\n## Déroulement\n\n- point 1\n- point 2\n\n## Sources\n\n- Titre de la source, auteur, date"
            }
            aria-invalid={!!errors.content}
          />
        ) : (
          <div className="preview">
            {content.trim() ? <Markdown content={content} /> : <p className="muted">Rien à afficher.</p>}
          </div>
        )}

        <span className="field__hint">
          Markdown : ## titre, **gras**, *italique*, - liste, [lien](https://…). {content.length} /{" "}
          {LIMITS.content.max}
        </span>
        {errors.content && <span className="field__error">{errors.content}</span>}
      </div>

      <div className="field-row">
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

        {mode === "edit" && (
          <label className="field">
            <span className="field__label">Résumé de la modification</span>
            <input
              type="text"
              value={summary}
              maxLength={LIMITS.summary.max}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ex. : ajout de deux sources"
            />
          </label>
        )}
      </div>

      <div className="notice">
        <strong>Avant de publier.</strong> Citez vos sources, distinguez les faits établis des rumeurs
        (catégorie « À vérifier ») et ne publiez pas d&apos;informations personnelles sur des personnes
        qui ne sont pas des figures publiques.
      </div>

      <div className="actions">
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Enregistrement…" : mode === "create" ? "Publier l'article" : "Enregistrer les modifications"}
        </button>
        <Link href={mode === "edit" && slug ? `/post/${slug}` : "/"} className="btn btn--plain">
          Annuler
        </Link>
      </div>
    </form>
  );
}
