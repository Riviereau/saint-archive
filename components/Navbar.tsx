/*
  ============================================================
  components/Navbar.tsx — The top navigation bar
  ============================================================

  TIP FOR LEARNERS:
  The Navbar is a "Server Component" by default in Next.js App Router.
  Server Components render on the server and send HTML to the browser.
  They can't use React hooks (useState, useEffect) or browser APIs.

  If you need interactivity (like a mobile menu toggle), you'd
  either add "use client" at the top, or split out a small
  client component just for the interactive part.
*/

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Navigation principale">
      <div className="container">
        <div className="navbar__inner">

          {/* --- Logo --- */}
          <Link href="/" className="navbar__logo">
            <span className="navbar__logo-icon" aria-hidden="true">✝</span>
            Saint-Archive
          </Link>

          {/* --- Search bar --- */}
          <div className="navbar__search">
            <div className="search-input">
              {/*
                SVG icon — we inline it instead of using an <img> tag
                so we can control its color with CSS (currentColor).
              */}
              <svg
                className="search-input__icon"
                width="14" height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="search"
                placeholder="Rechercher des archives…"
                /*
                  In a real app, you'd wire this to a search function.
                  For now it's a visual placeholder.
                */
                aria-label="Rechercher dans les archives"
              />
            </div>
          </div>

          {/* --- Nav links --- */}
          <div className="navbar__nav">
            <Link href="/" className="navbar__link">
              Accueil
            </Link>
            <Link href="/?region=quebec" className="navbar__link">
              Québec
            </Link>
            <Link href="/?region=france" className="navbar__link">
              France
            </Link>
            {/* The "create" button is styled as a primary button */}
            <Link href="/create" className="btn btn--primary btn--sm">
              + Nouvelle page
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
