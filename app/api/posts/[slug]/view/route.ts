/*
  app/api/posts/[slug]/view/route.ts
    POST -> compte une lecture (appelé une fois par session par <ViewCounter />)
*/

import { NextRequest, NextResponse } from "next/server";
import { addView } from "@/lib/store";
import { allow, clientIp } from "@/lib/serverRateLimit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!allow(`view:${clientIp(request.headers)}`, 2000)) {
    return new NextResponse(null, { status: 204 });
  }
  const { slug } = await params;
  await addView(slug);
  return new NextResponse(null, { status: 204 });
}
