import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Saint-Archive",
    template: "%s — Saint-Archive",
  },
  description:
    "Archive collaborative de l'histoire, des affaires et des médias du Québec et de la France.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <main className="wrap main">{children}</main>
        <footer className="footer">
          <div className="wrap footer__inner">
            <span>Saint-Archive : une archive collaborative du Québec et de la France.</span>
            <nav aria-label="Pied de page">
              <Link href="/">Articles</Link>
              <Link href="/create">Contribuer</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
