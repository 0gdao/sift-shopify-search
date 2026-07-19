import { NextResponse } from "next/server";

import { getCatalogConfig } from "@/lib/catalog/config";
import { errorResponse } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const config = getCatalogConfig();
    return NextResponse.json({ ok: true, mode: config.mode });
  } catch (error) {
    return errorResponse(error);
  }
}
