/*
  ============================================================
  app/create/page.tsx — Create a New Archive Page
  ============================================================

  TIP FOR LEARNERS:
  This is a SERVER component that renders the page shell.
  The actual interactive FORM is in a separate Client Component
  (CreatePostForm.tsx). This is a common Next.js pattern:
  - Server Component = the page layout and metadata
  - Client Component = the interactive form

  Why split them?
  - Server Components can't have state or event handlers
  - Client Components ("use client") can, but they miss out on
    server-side features like direct DB access
  - By keeping the form separate, the rest of the page can stay
    server-rendered (faster, better SEO)
*/

import type { Metadata } from "next";
import { CreatePostForm } from "./CreatePostForm";
import { RateLimitBar } from "@/components/RateLimitBar";

export const metadata: Metadata = {
  title: "Créer une archive",
  description: "Soumettez un nouvel article à l'archive collaborative.",
};

export default function CreatePage() {
  return (
    <div className="container" style={{ maxWidth: "720px", paddingTop: "var(--space-10)", paddingBottom: "var(--space-16)" }}>

      {/* Page header */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <p style={{ fontSize: "var(--text-xs)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "var(--space-2)" }}>
          Contribuer à l&apos;archive
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)" }}>
          Nouvelle page d&apos;archive
        </h1>
        <p style={{ color: "var(--color-text-dim)", marginTop: "var(--space-3)" }}>
          Documentez un scandale, un événement historique ou un média perdu.
          Aucun compte requis — votre identité reste anonyme par défaut.
        </p>
      </div>

      {/*
        The RateLimitBar shows how many posts the user has left today.
        It's a Client Component because it reads from localStorage.
      */}
      <RateLimitBar />

      {/* Separator */}
      <div style={{ margin: "var(--space-6) 0" }}>
        <hr />
      </div>

      {/* The interactive form (Client Component) */}
      <CreatePostForm />

    </div>
  );
}
