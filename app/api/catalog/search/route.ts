import { NextResponse } from "next/server";

import { searchCatalog } from "@/lib/catalog/client";
import { parseSearchInput } from "@/lib/catalog/validation";
import { errorResponse, parseJsonBody } from "@/lib/http";
import { takeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function POST(request: Request): Promise<NextResponse> {
  const rate = takeRateLimit(`search:${clientKey(request)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many searches. Try again shortly." } },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  try {
    const input = parseSearchInput(await parseJsonBody(request));
    return NextResponse.json(await searchCatalog(input), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
