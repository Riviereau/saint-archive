/*
  ============================================================
  app/not-found.tsx — Custom 404 Page
  ============================================================

  TIP FOR LEARNERS:
  In Next.js App Router, if you create a file called "not-found.tsx"
  anywhere in the "app" folder, it becomes the 404 page shown when
  that route doesn't exist.

  You can trigger it manually with: import { notFound } from 'next/navigation'
  Then call: notFound()
*/

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container" style={{
      textAlign: "center",
      paddingTop: "var(--space-20)",
      paddingBottom: "var(--space-20)",
    }}>
      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: "6rem",
        color: "var(--color-primary)",
        opacity: 0.3,
        lineHeight: 1,
        marginBottom: "var(--space-4)",
      }}>
        404
      </p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", marginBottom: "var(--space-3)" }}>
        Page introuvable
      </h1>
      <p style={{ color: "var(--color-text-dim)", marginBottom: "var(--space-8)" }}>
        Cette archive n&apos;existe pas ou a été supprimée.
      </p>
      <div className="flex gap-4" style={{ justifyContent: "center" }}>
        <Link href="/" className="btn btn--primary">
          Retour à l&apos;accueil
        </Link>
        <Link href="/create" className="btn btn--ghost">
          Créer une page
        </Link>
      </div>
    </div>
  );
}
