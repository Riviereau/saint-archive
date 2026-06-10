# Sainte-Archive

> Archive collaborative des scandales de corruption, de l'histoire et des médias perdus au Québec et en France.

---

## Structure des fichiers — Guide d'apprentissage

```
sainte-archive/
│
├── app/                          ← Toutes les PAGES et API routes (Next.js App Router)
│   ├── layout.tsx                ← Template racine : <html>, <head>, Navbar, Footer
│   ├── page.tsx                  ← Page d'accueil (/)
│   ├── not-found.tsx             ← Page 404 personnalisée
│   │
│   ├── create/
│   │   ├── page.tsx              ← Page de création (/create) — Server Component
│   │   └── CreatePostForm.tsx    ← Formulaire interactif — Client Component
│   │
│   ├── post/
│   │   └── [slug]/
│   │       └── page.tsx          ← Page d'article (/post/mon-titre) — route dynamique
│   │
│   └── api/
│       └── posts/
│           └── route.ts          ← API endpoint POST/GET /api/posts
│
├── components/                   ← Composants React réutilisables
│   ├── Navbar.tsx                ← Barre de navigation (Server Component)
│   ├── FlairBadge.tsx            ← Badge flair individuel
│   ├── FlairPicker.tsx           ← Sélecteur de flairs (Client Component)
│   ├── PostCard.tsx              ← Carte de prévisualisation d'un post
│   └── RateLimitBar.tsx          ← Barre de limite quotidienne (Client Component)
│
├── lib/                          ← Fonctions utilitaires (logique métier)
│   ├── rateLimit.ts              ← Gestion de la limite de 30 posts/jour (localStorage)
│   └── utils.ts                  ← slugify, formatDate, timeAgo, truncate, debounce
│
├── types/
│   └── index.ts                  ← Types TypeScript : Post, Flair, User, Comment, etc.
│
├── public/
│   ├── css/
│   │   └── globals.css           ← TOUT le CSS — tokens, reset, composants, responsive
│   ├── js/                       ← (pour de futurs scripts vanilla JS si nécessaire)
│   └── images/                   ← Images statiques
│
├── package.json                  ← Dépendances npm et scripts
├── tsconfig.json                 ← Configuration TypeScript
└── next.config.ts                ← Configuration Next.js
```

---

## Concepts clés à comprendre

### Server Components vs Client Components

```
Server Component (défaut)          Client Component ("use client")
─────────────────────────          ───────────────────────────────
✓ Accès direct à la DB             ✓ useState, useEffect
✓ Plus rapide (pas de JS envoyé)   ✓ onClick, onChange
✓ Meilleur SEO                     ✓ localStorage, window
✗ Pas de state/hooks               ✗ Pas d'accès direct DB
✗ Pas de events browser            ✗ Plus de JS côté client

Règle : Utiliser Server par défaut, Client seulement si nécessaire.
```

### Le flux d'une soumission de formulaire

```
Utilisateur tape → onChange → useState met à jour
       ↓
Utilisateur clique "Publier"
       ↓
handleSubmit() s'exécute:
  1. canPostToday() → vérifie localStorage (rate limit côté client)
  2. validate() → vérifie les champs
  3. fetch('/api/posts', { method: 'POST', body: JSON.stringify(data) })
       ↓
API route (route.ts) reçoit la requête:
  1. Vérifie IP rate limit (côté serveur)
  2. Valide les données à nouveau
  3. prisma.post.create(...) → sauvegarde en DB
  4. Retourne { success: true, slug: '...' }
       ↓
Retour dans handleSubmit():
  5. incrementPostCount() → met à jour localStorage
  6. router.push('/post/' + slug) → navigue vers la nouvelle page
```

---

## Installation

```bash
# Installer les dépendances
npm install

# Créer le fichier .env.local avec votre base de données
cp .env.example .env.local

# Migrer la base de données (quand Prisma est configuré)
npm run prisma:migrate

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## Prochaines étapes

- [ ] Connecter Prisma à PostgreSQL (remplacer les MOCK_DATA)
- [ ] Ajouter l'authentification (NextAuth.js ou Clerk)
- [ ] Intégrer react-markdown pour le rendu Markdown
- [ ] Ajouter la recherche full-text (Prisma + PostgreSQL `tsvector`)
- [ ] Rate limiting Redis côté serveur (Upstash)
- [ ] Modération des contenus
