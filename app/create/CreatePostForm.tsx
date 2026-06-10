/*
  ============================================================
  app/create/CreatePostForm.tsx — The post creation form
  ============================================================

  TIP FOR LEARNERS:
  This is the most complex component in this app. It demonstrates:

  1. FORM STATE — multiple useState hooks to track each field
  2. VALIDATION — checking inputs before submitting
  3. FORM SUBMISSION — calling an API route
  4. ERROR HANDLING — showing error messages to the user
  5. RATE LIMITING — checking localStorage before allowing submission
  6. LOADING STATE — disabling the button while submitting

  Read through the comments carefully — this is the pattern you'll
  use for almost every form in a web app!
*/

"use client"; // This MUST be first — Client Components need this directive

import { useState } from "react";
import { useRouter } from "next/navigation";  // Next.js's programmatic navigation hook
import { FlairPicker } from "@/components/FlairPicker";
import { CreatePostInput } from "@/types";
import { canPostToday, incrementPostCount } from "@/lib/rateLimit";
import { slugify } from "@/lib/utils";

/*
  Our form validation rules.
  Each field has a min/max length and a required flag.
*/
const VALIDATION = {
  title:   { required: true, minLength: 10,  maxLength: 200  },
  excerpt: { required: true, minLength: 30,  maxLength: 500  },
  content: { required: true, minLength: 100, maxLength: 50000 },
};

/*
  The shape of our validation errors object.
  A field is either undefined (no error) or a string (the error message).
  "Partial<>" means all fields are optional.
*/
type FormErrors = Partial<Record<keyof CreatePostInput, string>>;

export function CreatePostForm() {
  /*
    ---- FORM STATE ----
    One useState for each form field. This is the standard approach.
  */
  const [title,   setTitle]   = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [region,  setRegion]  = useState<CreatePostInput["region"]>("quebec");
  const [flairIds, setFlairIds] = useState<string[]>([]);

  /*
    ---- UI STATE ----
    These track the form's "meta" state, not the actual data.
  */
  const [errors,     setErrors]     = useState<FormErrors>({});
  const [isLoading,  setIsLoading]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /*
    useRouter lets us navigate to another page after successful submission.
    router.push("/post/slug") is like clicking a link programmatically.
  */
  const router = useRouter();

  /*
    ---- VALIDATION FUNCTION ----
    Returns an object of error messages, or an empty object if valid.
    We call this before submitting.
  */
  function validate(): FormErrors {
    const errs: FormErrors = {};

    if (!title.trim()) {
      errs.title = "Le titre est requis.";
    } else if (title.length < VALIDATION.title.minLength) {
      errs.title = `Le titre doit faire au moins ${VALIDATION.title.minLength} caractères.`;
    } else if (title.length > VALIDATION.title.maxLength) {
      errs.title = `Le titre ne peut pas dépasser ${VALIDATION.title.maxLength} caractères.`;
    }

    if (!excerpt.trim()) {
      errs.excerpt = "Le résumé est requis.";
    } else if (excerpt.length < VALIDATION.excerpt.minLength) {
      errs.excerpt = `Le résumé doit faire au moins ${VALIDATION.excerpt.minLength} caractères.`;
    }

    if (!content.trim()) {
      errs.content = "Le contenu est requis.";
    } else if (content.length < VALIDATION.content.minLength) {
      errs.content = `Le contenu doit faire au moins ${VALIDATION.content.minLength} caractères.`;
    }

    if (flairIds.length === 0) {
      // We reuse the flairIds key even though it's not directly a string
      // In a real app you'd have a separate "flairs" error key
    }

    return errs;
  }

  /*
    ---- SUBMIT HANDLER ----
    Called when the user clicks "Publier".
    This is an async function because it calls an API.
  */
  async function handleSubmit() {
    // Clear previous errors
    setSubmitError(null);

    // 1. Check rate limit FIRST before doing any work
    if (!canPostToday()) {
      setSubmitError(
        "Vous avez atteint la limite de 30 publications par jour. Revenez demain."
      );
      return; // Stop here — don't submit
    }

    // 2. Validate the form
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      // There are errors — show them and don't submit
      setErrors(validationErrors);
      return;
    }

    // 3. Clear any old errors since validation passed
    setErrors({});

    // 4. Start loading state (shows spinner, disables button)
    setIsLoading(true);

    try {
      /*
        Build the data to send to our API.
        In a real app, this goes to app/api/posts/route.ts
      */
      const payload: CreatePostInput = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        flairIds,
        region,
      };

      /*
        fetch() is the browser's built-in HTTP request function.
        We send a POST request to our API route with the form data.

        In a real app, you'd have app/api/posts/route.ts that:
        1. Validates the data again (server-side!)
        2. Saves it to the database with Prisma
        3. Returns the created post
      */
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // Convert object to JSON string
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création.");
      }

      const data = await response.json();

      // 5. Increment the rate limit counter AFTER success
      incrementPostCount();

      // 6. Navigate to the new post
      // slugify() creates the URL from the title: "Mon Titre" → "mon-titre"
      const slug = data.slug ?? slugify(title);
      router.push(`/post/${slug}`);

    } catch (err) {
      // Catch any network errors or server errors
      setSubmitError(
        err instanceof Error ? err.message : "Une erreur inattendue s'est produite."
      );
    } finally {
      /*
        "finally" runs whether the try succeeded OR caught an error.
        We always want to stop the loading state.
      */
      setIsLoading(false);
    }
  }

  /*
    ---- HELPER: Character counter ----
    Shows "123 / 500" below a textarea.
  */
  function charCount(value: string, max: number) {
    const isNearLimit = value.length > max * 0.85;
    return (
      <span
        className="form-hint"
        style={{ color: isNearLimit ? "var(--color-warning)" : undefined }}
      >
        {value.length} / {max}
      </span>
    );
  }

  // ---- RENDER ----
  return (
    <div>

      {/* General submission error (not field-specific) */}
      {submitError && (
        <div className="alert alert--danger" role="alert">
          <span>⚠</span>
          <span>{submitError}</span>
        </div>
      )}

      {/* ---- FIELD: Title ---- */}
      <div className="form-group">
        <label htmlFor="title" className="form-label form-label--required">
          Titre de la page
        </label>
        <input
          id="title"
          type="text"
          className="form-input"
          placeholder="ex. La Commission Charbonneau et la corruption dans la construction"
          value={title}
          /*
            onChange fires every time the user types a character.
            e.target.value is the new value of the input.
            We update state, which re-renders the component.
          */
          onChange={(e) => {
            setTitle(e.target.value);
            // Clear error for this field when the user starts typing
            if (errors.title) setErrors({ ...errors, title: undefined });
          }}
          maxLength={VALIDATION.title.maxLength}
          aria-describedby={errors.title ? "title-error" : undefined}
          aria-invalid={!!errors.title}
        />
        <div className="flex justify-between">
          {/* Show error OR hint */}
          {errors.title ? (
            <span id="title-error" className="form-error">{errors.title}</span>
          ) : (
            <span className="form-hint">Soyez précis et descriptif</span>
          )}
          {charCount(title, VALIDATION.title.maxLength)}
        </div>
      </div>

      {/* ---- FIELD: Flairs ---- */}
      <div className="form-group">
        <label className="form-label">
          Flairs (catégories)
        </label>
        {/*
          FlairPicker is a "controlled component" — we pass it the
          current selected IDs and a function to update them.
          When the user clicks a flair, it calls setFlairIds.
        */}
        <FlairPicker
          selectedIds={flairIds}
          onChange={setFlairIds}
          maxSelect={3}
        />
        <span className="form-hint">Choisissez jusqu&apos;à 3 catégories</span>
      </div>

      {/* ---- FIELD: Region ---- */}
      <div className="form-group">
        <label htmlFor="region" className="form-label form-label--required">
          Région principale
        </label>
        <select
          id="region"
          className="form-select"
          value={region}
          onChange={(e) => setRegion(e.target.value as CreatePostInput["region"])}
        >
          <option value="quebec">🇨🇦 Québec</option>
          <option value="france">🇫🇷 France</option>
          <option value="other">🌍 Autre</option>
        </select>
      </div>

      {/* ---- FIELD: Excerpt ---- */}
      <div className="form-group">
        <label htmlFor="excerpt" className="form-label form-label--required">
          Résumé court
        </label>
        <textarea
          id="excerpt"
          className="form-textarea"
          style={{ minHeight: "100px" }}
          placeholder="Résumez l'essentiel en 1-3 phrases. Ce texte apparaît dans les cartes de prévisualisation."
          value={excerpt}
          onChange={(e) => {
            setExcerpt(e.target.value);
            if (errors.excerpt) setErrors({ ...errors, excerpt: undefined });
          }}
          maxLength={VALIDATION.excerpt.maxLength}
          aria-invalid={!!errors.excerpt}
        />
        <div className="flex justify-between">
          {errors.excerpt ? (
            <span className="form-error">{errors.excerpt}</span>
          ) : (
            <span className="form-hint">Affiché sur la page d&apos;accueil</span>
          )}
          {charCount(excerpt, VALIDATION.excerpt.maxLength)}
        </div>
      </div>

      {/* ---- FIELD: Main Content ---- */}
      <div className="form-group">
        <label htmlFor="content" className="form-label form-label--required">
          Contenu complet
        </label>
        <textarea
          id="content"
          className="form-textarea"
          style={{ minHeight: "340px" }}
          placeholder={`Rédigez l'article complet ici.\n\nVous pouvez utiliser du Markdown:\n# Titre\n## Sous-titre\n**Gras**, *italique*\n- Liste\n[Lien](https://exemple.com)\n\nCitez vos sources! Ajoutez des références à la fin.`}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) setErrors({ ...errors, content: undefined });
          }}
          maxLength={VALIDATION.content.maxLength}
          aria-invalid={!!errors.content}
        />
        <div className="flex justify-between">
          {errors.content ? (
            <span className="form-error">{errors.content}</span>
          ) : (
            <span className="form-hint">Markdown supporté. Minimum 100 caractères.</span>
          )}
          {charCount(content, VALIDATION.content.maxLength)}
        </div>
      </div>

      {/* ---- GUIDELINES ---- */}
      <div className="alert alert--warning" style={{ marginBottom: "var(--space-6)" }}>
        <span>📋</span>
        <div>
          <strong>Rappels importants</strong>
          <ul style={{ marginTop: "4px", paddingLeft: "16px", fontSize: "0.85em", listStyleType: "disc" }}>
            <li>Citez vos sources — liens, livres, documents officiels</li>
            <li>Distinguez les faits vérifiés des informations non-confirmées</li>
            <li>Respectez la vie privée des personnes non-publiques</li>
          </ul>
        </div>
      </div>

      {/* ---- SUBMIT BUTTON ---- */}
      <div className="flex gap-4 items-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="btn btn--primary btn--lg"
        >
          {/*
            Ternary operator: condition ? valueIfTrue : valueIfFalse
            Shows "Publishing..." while loading, otherwise "Publish"
          */}
          {isLoading ? "Publication…" : "Publier l'archive"}
        </button>

        <a href="/" className="btn btn--ghost btn--lg">
          Annuler
        </a>

        {/* Loading indicator */}
        {isLoading && (
          <span className="text-dim text-sm">
            Enregistrement en cours…
          </span>
        )}
      </div>

    </div>
  );
}
