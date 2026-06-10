/*
  ============================================================
  types/index.ts — TypeScript type definitions
  ============================================================

  TIP FOR LEARNERS:
  TypeScript adds "types" to JavaScript. A type is like a contract:
  it describes the exact shape of a piece of data.

  WHY THIS MATTERS:
  If you have a Post object, TypeScript will yell at you if you
  accidentally write post.titel instead of post.title. It catches
  typos and mistakes before your code runs.

  The syntax looks like: variableName: Type
  For objects we use "interface" or "type" to describe their shape.
*/

// ============================================================
// FLAIR TYPES
// ============================================================

/*
  "as const" creates a "const assertion" — it makes TypeScript treat
  the array as a fixed list of exact string values, not just string[].
  This is how we define all possible flair categories in one place.
*/
export const FLAIR_CATEGORIES = [
  "corruption",
  "history",
  "lost-media",
  "politics",
  "verified",
  "unverified",
  "quebec",
  "france",
] as const;

/*
  This creates a TYPE from the array above.
  "(typeof FLAIR_CATEGORIES)[number]" means:
  "the type of any element in FLAIR_CATEGORIES"
  Result: "corruption" | "history" | "lost-media" | ...
*/
export type FlairCategory = (typeof FLAIR_CATEGORIES)[number];

/*
  An interface describes the shape of an object.
  Every Flair object MUST have these exact fields.
*/
export interface Flair {
  id: string;             // Unique identifier (e.g., "flair-corruption")
  label: string;          // Display text (e.g., "Corruption")
  category: FlairCategory; // Must be one of the categories above
  emoji?: string;         // Optional (the ? means it can be undefined)
}

/*
  Here we define all the available flairs for the app.
  This is a "constant" — it never changes at runtime.
*/
export const AVAILABLE_FLAIRS: Flair[] = [
  { id: "corruption",  label: "Corruption",   category: "corruption",  emoji: "💰" },
  { id: "history",     label: "Histoire",     category: "history",     emoji: "📜" },
  { id: "lost-media",  label: "Média perdu",  category: "lost-media",  emoji: "📼" },
  { id: "politics",    label: "Politique",    category: "politics",    emoji: "🏛️" },
  { id: "verified",    label: "Vérifié",      category: "verified",    emoji: "✓" },
  { id: "unverified",  label: "Non-vérifié",  category: "unverified",  emoji: "?" },
  { id: "quebec",      label: "Québec",       category: "quebec",      emoji: "⚜️" },
  { id: "france",      label: "France",       category: "france",      emoji: "🇫🇷" },
];

// ============================================================
// USER TYPES
// ============================================================

/*
  The User type. "null" is explicitly listed because TypeScript
  requires you to handle the case where a value might not exist.
*/
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  isAdmin: boolean;
  /*
    "postsToday" tracks how many posts they've made today.
    For registered users we store this in the database.
    For anonymous users we use localStorage (browser storage).
  */
  postsToday: number;
}

// ============================================================
// POST TYPES
// ============================================================

export interface Post {
  id: string;
  slug: string;        // URL-friendly version of title: "affaire-gomery" 
  title: string;
  excerpt: string;     // Short summary shown on cards
  content: string;     // Full article content (Markdown or HTML)
  flairs: Flair[];     // Can have multiple flairs
  author: {
    id: string | null; // null = anonymous post
    username: string;  // "Anonyme" if no account
    isAnonymous: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  commentCount: number;
  region: "quebec" | "france" | "other";
}

/*
  "CreatePostInput" is what the user fills in the form.
  It's similar to Post but without the fields the server generates
  (id, slug, createdAt, etc.)
*/
export interface CreatePostInput {
  title: string;
  excerpt: string;
  content: string;
  flairIds: string[];  // Array of flair IDs the user selected
  region: Post["region"]; // Reuses the same type as Post["region"]
}

// ============================================================
// COMMENT TYPES
// ============================================================

export interface Comment {
  id: string;
  postId: string;
  content: string;
  author: {
    id: string | null;
    username: string;
    isAnonymous: boolean;
  };
  createdAt: Date;
}

// ============================================================
// RATE LIMIT TYPES
// ============================================================

/*
  This tracks how many posts an anonymous user has made today.
  We store this in localStorage with the key "rateLimit".
*/
export interface RateLimitState {
  postsToday: number;   // How many posts made today
  date: string;         // The date string (e.g., "2025-06-09") — resets each day
}

export const DAILY_POST_LIMIT = 30; // Max posts per day for anonymous users

// ============================================================
// API RESPONSE TYPES
// ============================================================

/*
  A generic "wrapper" type for API responses.
  The <T> is a "generic" — it means this type works with any data type.
  Usage: ApiResponse<Post> means the data field will be a Post.
         ApiResponse<Post[]> means data will be an array of Posts.
*/
export type ApiResponse<T> =
  | { success: true;  data: T;      error?: never }
  | { success: false; data?: never; error: string };

// ============================================================
// FILTER / SORT TYPES
// ============================================================

export type SortOption = "newest" | "oldest" | "most-viewed";

export interface FeedFilters {
  flair?: FlairCategory;
  region?: Post["region"];
  sort: SortOption;
  search?: string;
}
