import Link from "next/link";

export function Navbar() {
  return (
    <header className="header">
      <div className="wrap header__inner">
        <Link href="/" className="header__brand">
          Saint-Archive
        </Link>

        <form action="/" method="get" role="search" className="header__search">
          <input
            type="search"
            name="q"
            placeholder="Rechercher dans l'archive"
            aria-label="Rechercher dans l'archive"
          />
          <button type="submit" className="btn btn--plain btn--small">
            Chercher
          </button>
        </form>

        <nav aria-label="Navigation principale" className="header__nav">
          <Link href="/?region=quebec">Québec</Link>
          <Link href="/?region=france">France</Link>
          <Link href="/create" className="btn btn--small">
            Nouvel article
          </Link>
        </nav>
      </div>
    </header>
  );
}
