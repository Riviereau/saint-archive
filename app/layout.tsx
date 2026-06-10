/*
  ============================================================
  app/layout.tsx — The Root Layout
  ============================================================

  TIP FOR LEARNERS:
  In Next.js App Router, every page is wrapped in a "layout".
  The ROOT layout (this file) wraps EVERY page in your app.

  It's like the master template in HTML — the <html>, <head>,
  and <body> tags live here. Every page's content replaces {children}.

  The layout renders ONCE and stays mounted as you navigate between
  pages (unlike old-style page reloads).
*/

import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";

/*
  "Metadata" is exported from layout/page files to set the
  <title> and <meta description> tags for SEO.
*/
export const metadata: Metadata = {
  title: {
    default: "Sainte-Archive",
    template: "%s — Sainte-Archive",  // "%s" is replaced by each page's title
  },
  description:
    "Archive des scandales de corruption, de l'histoire et des médias perdus au Québec et en France.",
  /*
    Open Graph metadata makes rich previews when you share links
    on social media (Facebook, Twitter, Discord, etc.)
  */
  openGraph: {
    siteName: "Sainte-Archive",
    locale: "fr_CA",
    type: "website",
  },
};

/*
  The RootLayout component wraps every page.
  "children" is whatever page content Next.js passes in.
*/
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
      lang="fr" tells browsers and screen readers the page is in French.
      This is important for accessibility!
    */
    <html lang="fr">
      <head>
        {/*
          Google Fonts — we load two fonts:
          1. IM Fell English — old-style serif for headings
          2. Inter — clean sans-serif for body text

          "display=swap" means: use a system font while loading,
          then swap in the custom font when it's ready. This prevents
          invisible text during loading.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/*
          We load our global CSS from the public folder.
          In production, you'd typically import it in the component,
          but loading from /public/css/ makes it easy to edit separately.
        */}
        <link rel="stylesheet" href="/css/globals.css" />
      </head>

      <body>
        {/* Navbar appears on every page */}
        <Navbar />

        {/*
          <main> is a semantic HTML element — it tells browsers and
          screen readers "this is the main content of the page".
          It skips the navbar and footer for keyboard navigation.
        */}
        <main id="main-content">
          {children}
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer__inner">
              <p className="footer__tagline">
                Sainte-Archive — Mémoire collective du Québec et de la France
              </p>
              <p className="footer__tagline">
                Contenu soumis par la communauté — vérifiez toujours les sources
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
