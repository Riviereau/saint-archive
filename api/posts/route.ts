/*
  ============================================================
  app/api/posts/route.ts — API Route: Create a Post
  ============================================================

  TIP FOR LEARNERS:
  In Next.js App Router, files called "route.ts" inside the "app/api"
  folder become API endpoints (like a mini server).

  URL: POST /api/posts

  You export functions named after HTTP methods:
  - export async function GET(request)    — handles GET requests
  - export async function POST(request)   — handles POST requests
  - export async function DELETE(request) — handles DELETE requests

  WHY have an API route if we already have Server Components?
  - Server Components can read data, but not easily write it
  - API routes handle mutations (creating, updating, deleting)
  - They're also used by client-side code (fetch() calls)
  - They can have rate limiting, authentication checks, etc.
*/

import { NextRequest, NextResponse } from "next/server";
import { CreatePostInput, DAILY_POST_LIMIT } from "@/types";
import { slugify } from "@/lib/utils";

/*
  NextResponse is Next.js's response builder.
  - NextResponse.json(data, { status: 200 }) sends JSON
  - Status codes: 200=OK, 201=Created, 400=Bad Request, 429=Too Many Requests, 500=Server Error
*/

/*
  Server-side rate limiting using a simple in-memory Map.

  KEY CONCEPT: "In-memory" means it lives in RAM and resets when
  the server restarts. For a real app, use Redis or a database instead.

  The Map stores: IP address → { count: number, resetAt: Date }
*/
const ipRateLimit = new Map<string, { count: number; resetAt: Date }>();

function checkServerRateLimit(ip: string): boolean {
  const now = new Date();
  const record = ipRateLimit.get(ip);

  if (!record || record.resetAt < now) {
    // First request today, or the day has reset
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);  // Midnight tonight

    ipRateLimit.set(ip, { count: 1, resetAt: tomorrow });
    return true; // Allow
  }

  if (record.count >= DAILY_POST_LIMIT) {
    return false; // Block — limit reached
  }

  // Increment and allow
  record.count++;
  return true;
}

/*
  The POST handler for /api/posts
  This creates a new post.
*/
export async function POST(request: NextRequest) {

  // --- 1. Get the client's IP address for server-side rate limiting ---
  /*
    In production (on Vercel), the real IP is in the x-forwarded-for header.
    Locally, we fall back to "127.0.0.1".
  */
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "127.0.0.1";

  // --- 2. Check rate limit ---
  if (!checkServerRateLimit(ip)) {
    /*
      HTTP 429 = "Too Many Requests"
      The "Retry-After" header tells the client when to try again.
    */
    return NextResponse.json(
      { success: false, error: "Limite quotidienne atteinte. Revenez demain." },
      {
        status: 429,
        headers: {
          "Retry-After": "86400", // 24 hours in seconds
        },
      }
    );
  }

  // --- 3. Parse the request body ---
  let body: CreatePostInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  // --- 4. Server-side validation ---
  // IMPORTANT: Always validate on the server too!
  // Client-side validation is for UX, server-side is for security.
  const { title, excerpt, content, flairIds, region } = body;

  if (!title?.trim() || title.length < 10) {
    return NextResponse.json(
      { success: false, error: "Titre invalide (minimum 10 caractères)." },
      { status: 400 }
    );
  }

  if (!excerpt?.trim() || excerpt.length < 30) {
    return NextResponse.json(
      { success: false, error: "Résumé invalide (minimum 30 caractères)." },
      { status: 400 }
    );
  }

  if (!content?.trim() || content.length < 100) {
    return NextResponse.json(
      { success: false, error: "Contenu invalide (minimum 100 caractères)." },
      { status: 400 }
    );
  }

  if (!["quebec", "france", "other"].includes(region)) {
    return NextResponse.json(
      { success: false, error: "Région invalide." },
      { status: 400 }
    );
  }

  // --- 5. Create the post in the database ---
  /*
    In a real app with Prisma, this would be:

    import { PrismaClient } from "@prisma/client";
    const prisma = new PrismaClient();

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug: slugify(title),
        excerpt: excerpt.trim(),
        content: content.trim(),
        region,
        flairs: {
          connect: flairIds.map(id => ({ id })),
        },
      },
    });

    For now, we simulate it:
  */
  const slug = slugify(title);
  const simulatedPost = {
    id: Math.random().toString(36).slice(2),
    slug,
    title: title.trim(),
    excerpt: excerpt.trim(),
    content: content.trim(),
    region,
    flairIds: flairIds ?? [],
    createdAt: new Date().toISOString(),
  };

  // --- 6. Return success ---
  /*
    HTTP 201 = "Created" — the standard code for a successful creation.
  */
  return NextResponse.json(
    { success: true, data: simulatedPost, slug },
    { status: 201 }
  );
}

/*
  The GET handler for /api/posts
  Returns all posts (paginated in a real app).
*/
export async function GET() {
  /*
    In a real app:
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,  // Limit to 20 posts
      include: { flairs: true, author: true },
    });
  */

  // Placeholder — return empty array for now
  return NextResponse.json({ success: true, data: [] });
}
