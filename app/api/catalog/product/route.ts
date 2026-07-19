import { NextResponse } from "next/server";

import { getProduct } from "@/lib/catalog/client";
import { parseProductInput } from "@/lib/catalog/validation";
import { errorResponse, parseJsonBody } from "@/lib/http";
import { takeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const rate = takeRateLimit(`product:${key}`, { limit: 60, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests. Try again shortly." } },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  try {
    const input = parseProductInput(await parseJsonBody(request));
    const requestedCurrency = request.headers.get("x-sift-currency")?.toUpperCase() ?? "USD";
    const currency = /^[A-Z]{3}$/.test(requestedCurrency) ? requestedCurrency : "USD";
    const result = await getProduct(input, currency);
    if (!result) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
