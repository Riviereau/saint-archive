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
import { IM_Fell_English, Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";

/*
  Next.js has a built-in font system (next/font/google) that:
  - Downloads fonts at BUILD TIME (no runtime Google request)
  - Injects them automatically — no <link> tags needed
  - Eliminates layout shift with automatic font-display: swap
*/
const imFellEnglish = IM_Fell_English({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-im-fell",   // exposes as a CSS variable
});

const inter = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-inter",
});

/*
  Global CSS is imported directly here instead of via a <link> tag.
  Next.js bundles and optimises it automatically.
  Move your file from /public/css/globals.css to /app/globals.css
  (or /styles/globals.css) and update the path below.
*/
import "@/styles/globals.css";

/*
  "Metadata" is exported from layout/page files to set the
  <title> and <meta description> tags for SEO.
*/
export const metadata: Metadata = {
  title: {
    default: "Saint-Archive",
    template: "%s — Saint-Archive", // "%s" is replaced by each page's title
  },
  description:
    "Archive des scandales de corruption, de l'histoire et des médias perdus au Québec et en France.",
  /*
    Open Graph metadata makes rich previews when you share links
    on social media (Facebook, Twitter, Discord, etc.)
  */
  openGraph: {
    siteName: "Saint-Archive",
    locale: "fr_CA",          // primary locale
    alternateLocale: [        // additional locales
      "fr_FR",
      "en_US",
    ],
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

      The font variables are applied here so every element in the tree
      can reference var(--font-im-fell) and var(--font-inter) in CSS.
    */
    <html lang="fr" className={`${imFellEnglish.variable} ${inter.variable}`}>
      <body>
        {/* Navbar appears on every page */}
        <Navbar />

        {/*
          <main> is a semantic HTML element — it tells browsers and
          screen readers "this is the main content of the page".
          It skips the navbar and footer for keyboard navigation.
        */}
        <main id="main-content">{children}</main>

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
