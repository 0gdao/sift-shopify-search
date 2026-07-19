import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { formatValidationError } from "./catalog/validation";
import { CatalogError } from "./catalog/types";

export async function parseJsonBody(request: Request): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 20_000) throw new BodyError("Request body is too large", 413);
  const text = await request.text();
  if (text.length > 20_000) throw new BodyError("Request body is too large", 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new BodyError("Request body must be valid JSON", 400);
  }
}

export class BodyError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: formatValidationError(error) } },
      { status: 400 },
    );
  }
  if (error instanceof BodyError) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: error.message } },
      { status: error.status },
    );
  }
  if (error instanceof CatalogError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  console.error("Unexpected API error", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
    { status: 500 },
  );
}
