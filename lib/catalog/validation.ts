import { z } from "zod";

import type { ProductInput, SearchInput } from "./types";

const countrySchema = z
  .string()
  .trim()
  .length(2)
  .transform((value) => value.toUpperCase())
  .refine((value) => /^[A-Z]{2}$/.test(value), "Use a two-letter country code");

const currencySchema = z
  .string()
  .trim()
  .length(3)
  .transform((value) => value.toUpperCase())
  .refine((value) => /^[A-Z]{3}$/.test(value), "Use a three-letter currency code");

const searchSchema = z
  .object({
    query: z.string().trim().min(2).max(300),
    cursor: z.string().trim().min(1).max(2_000).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    context: z
      .object({
        country: countrySchema.optional(),
        currency: currencySchema.optional(),
      })
      .default({}),
    filters: z
      .object({
        priceMin: z.coerce.number().finite().min(0).max(10_000_000).optional(),
        priceMax: z.coerce.number().finite().min(0).max(10_000_000).optional(),
        condition: z.enum(["new", "secondhand"]).optional(),
        available: z.boolean().default(true),
        ratingMin: z.coerce.number().finite().min(0).max(5).optional(),
      })
      .default({ available: true }),
  })
  .superRefine((value, context) => {
    if (
      value.filters.priceMin !== undefined &&
      value.filters.priceMax !== undefined &&
      value.filters.priceMin > value.filters.priceMax
    ) {
      context.addIssue({
        code: "custom",
        path: ["filters", "priceMax"],
        message: "Maximum price must be greater than minimum price",
      });
    }
  });

const selectedOptionSchema = z.object({
  name: z.string().trim().min(1).max(100),
  label: z.string().trim().min(1).max(200),
});

const productSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .refine((value) => value.startsWith("gid://shopify/"), "Invalid Shopify product ID"),
  selected: z.array(selectedOptionSchema).max(20).default([]),
});

export function parseSearchInput(value: unknown): SearchInput {
  return searchSchema.parse(value);
}

export function parseProductInput(value: unknown): ProductInput {
  return productSchema.parse(value);
}

export function formatValidationError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request";
}
