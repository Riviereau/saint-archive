/*
  ============================================================
  app/page.tsx — The Home Page
  ============================================================

  TIP FOR LEARNERS:
  In Next.js App Router, every file called "page.tsx" inside the
  "app" folder becomes a route (URL).

  app/page.tsx          → http://localhost:3000/
  app/create/page.tsx   → http://localhost:3000/create
  app/post/[slug]/page.tsx → http://localhost:3000/post/affaire-gomery

  The [slug] in brackets is a "dynamic route" — it matches anything!
*/

import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { FlairBadge } from "@/components/FlairBadge";
import { AVAILABLE_FLAIRS, Post } from "@/types";

export const metadata: Metadata = {
  title: "Accueil",
  description: "Parcourez les archives de corruption, d'histoire et de médias perdus.",
};

/*
  MOCK DATA — placeholder posts to show the design.
  In a real app, these would come from a database via Prisma.
  Replace this with: const posts = await prisma.post.findMany(...)
*/
const MOCK_POSTS: Post[] = [
  {
    id: "1",
    slug: "commission-charbonneau-2011",
    title: "La Commission Charbonneau et la corruption dans la construction",
    excerpt:
      "Lancée en 2011, la Commission d'enquête sur l'octroi et la gestion des contrats publics dans l'industrie de la construction a mis au jour un vaste réseau de corruption impliquant l'industrie de la construction, la mafia et des partis politiques.",
    content: "",
    flairs: [
      AVAILABLE_FLAIRS.find((f) => f.id === "corruption")!,
      AVAILABLE_FLAIRS.find((f) => f.id === "quebec")!,
      AVAILABLE_FLAIRS.find((f) => f.id === "verified")!,
    ],
    author: { id: null, username: "Anonyme", isAnonymous: true },
    createdAt: new Date("2025-05-20"),
    updatedAt: new Date("2025-05-20"),
    viewCount: 4821,
    commentCount: 37,
    region: "quebec",
  },
  {
    id: "2",
    slug: "affaire-sponsorship-2002",
    title: "Le Scandale des commandites — Des millions détournés par le fédéral",
    excerpt:
      "Le programme de commandites du gouvernement fédéral canadien a détourné des fonds publics vers des agences de publicité liées au Parti libéral du Canada, en échange de peu ou pas de travail réel.",
    content: "",
    flairs: [
      AVAILABLE_FLAIRS.find((f) => f.id === "corruption")!,
      AVAILABLE_FLAIRS.find((f) => f.id === "politics")!,
      AVAILABLE_FLAIRS.find((f) => f.id === "quebec")!,
    ],
    author: { id: null, username: "Archiviste42", isAnonymous: false },
    createdAt: new Date("2025-05-15"),
    updatedAt: new Date("2025-05-15"),
    viewCount: 3102,
    commentCount: 21,
    region: "quebec",
  },
  {
    id: "3",
    slug: "radio-canada-emissions-perdues",
    title: "Les émissions perdues de Radio-Canada des années 1950–1970",
    excerpt:
      "Des centaines d'heures d'archives télévisuelles de Radio-Canada ont été effacées ou détruites au cours des décennies passées, en raison du coût des bandes magnétiques et du manque de politique de conservation.",
    content: "",
    flairs: [
      AVAILABLE_FLAIRS.find((f) => f.id === "lost-media")!,
      AVAILABLE_FLAIRS.find((f) => f.id === "history")!,
      AVAILABLE_FLAIRS.find((f) => f.id === "quebec")!,
    ],
    author: { id: null, username: "MediaHunter", isAnonymous: false },
    createdAt: new Date("2025-05-10"),
    updatedAt: new Date("2025-05-10"),
    viewCount: 2450,
    commentCount: 14,
    region: "quebec",
  },
  {
    id: "4",
    slug: "affaire-clearstream-france",
    title: "L'Affaire Clearstream — Faux listings et guerre politique en France",
    excerpt:
      "Un réseau de faux listings bancaires via la chambre de compensation Clearstream a été utilisé pour tenter de discréditer des personnalités politiques françaises, dont Nicolas Sarkozy. Une affaire d'État complexe et toujours controversée.",
    content: "",
    flairs: [
      AVAILABLE_FLAIRS.find((f) => f.id === "corruption")!,
      AVAILABLE_FLAIRS.find((f) => f.id === "france")!,
      AVAILABLE_FLAIRS.find((f) => f.id === "politics")!,
    ],
    author: { id: null, username: "ParisArchive", isAnonymous: false },
    createdAt: new Date("2025-04-30"),
    updatedAt: new Date("2025-04-30"),
    viewCount: 1890,
    commentCount: 9,
    region: "france",
  },
  {
    id: "5",
    slug: "emissions-tf1-perdues-1975",
    title: "Émissions françaises disparues de TF1 (1975–1982)",
    excerpt:
      "Plusieurs émissions cultes de TF1 et Antenne 2 n'ont jamais été archivées ou ont été effacées lors de transitions technologiques. Un patrimoine audiovisuel en partie perdu pour toujours.",
    content: "",
    flairs: [
      AVAILABLE_FLAIRS.find((f) => f.id === "lost-media")!,
      AVAILABLE_FLAIRS.find((f) => f.id === "france")!,
      AVAILABLE_FLAIRS.find((f) => f.id === "unverified")!,
    ],
    author: { id: null, username: "Anonyme", isAnonymous: true },
    createdAt: new Date("2025-04-22"),
    updatedAt: new Date("2025-04-22"),
    viewCount: 1203,
    commentCount: 5,
    region: "france",
  },
];

/*
  The home page component.
  It's "async" so we can use "await" to fetch data from a DB.
  (The mock data doesn't need await, but a real DB call would.)
*/
export default async function HomePage() {
  // In a real app: const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
  const posts = MOCK_POSTS;

  return (
    <>
      {/* ---- HERO SECTION ---- */}
      <section className="hero">
        <div className="container">
          <p className="hero__eyebrow">Archive ouverte • Québec & France</p>
          <h1 className="hero__title">
            La mémoire de ceux<br />
            qu&apos;on voulait <span>oublier</span>
          </h1>
          <p className="hero__subtitle">
            Une encyclopédie collaborative pour documenter les scandales de
            corruption, l&apos;histoire cachée et les médias perdus.
          </p>
          <div className="flex gap-4" style={{ justifyContent: "center" }}>
            <Link href="/create" className="btn btn--primary btn--lg">
              + Créer une page
            </Link>
            <Link href="#feed" className="btn btn--ghost btn--lg">
              Parcourir les archives
            </Link>
          </div>
        </div>
      </section>

      {/* ---- STATS BAR ---- */}
      <div style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", padding: "var(--space-4) 0", marginBottom: "var(--space-8)" }}>
        <div className="container">
          <div className="flex gap-8 items-center" style={{ justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Pages archivées", value: "1 284" },
              { label: "Contributeurs", value: "342" },
              { label: "Pays couverts", value: "2" },
              { label: "Commentaires", value: "8 930" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--color-primary)" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- MAIN FEED ---- */}
      <div className="container" id="feed">

        {/* Filter tab row */}
        <div className="tab-row">
          <button className="tab tab--active">Tout</button>
          <button className="tab">Récents</button>
          {/* Map over flairs to create a filter tab for each */}
          {AVAILABLE_FLAIRS.map((flair) => (
            <button key={flair.id} className="tab">
              {flair.emoji} {flair.label}
            </button>
          ))}
        </div>

        <div className="feed-header">
          <h2 className="feed-title">Dernières archives</h2>
          <Link href="/create" className="btn btn--ghost btn--sm">
            + Contribuer
          </Link>
        </div>

        {/* Post cards list */}
        <div className="feed-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Load more button (placeholder) */}
        <div style={{ textAlign: "center", marginTop: "var(--space-8)" }}>
          <button className="btn btn--ghost">
            Charger plus d&apos;archives
          </button>
        </div>

      </div>

      {/* ---- CALL TO ACTION BANNER ---- */}
      <div style={{
        margin: "var(--space-16) 0 0",
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        padding: "var(--space-12) 0",
        textAlign: "center",
      }}>
        <div className="container">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", marginBottom: "var(--space-3)" }}>
            Vous avez une information à archiver?
          </h2>
          <p style={{ color: "var(--color-text-dim)", marginBottom: "var(--space-6)", maxWidth: "500px", margin: "0 auto var(--space-6)" }}>
            Aucun compte requis. Créez une page en quelques minutes.
            30 publications gratuites par jour.
          </p>
          <Link href="/create" className="btn btn--primary btn--lg">
            Créer une page d&apos;archive
          </Link>
        </div>
      </div>
    </>
  );
}
