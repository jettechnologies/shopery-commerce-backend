import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required").optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.number().int()).optional(),
  variants: z
    .array(
      z.object({
        sku: z.string().optional(),
        size: z.string().optional(),
        color: z.array(z.string()).optional(),
        stockQuantity: z.number().int().nonnegative().default(0),
        price: z.number().positive("Variant price must be strictly positive"),
        salePrice: z.number().optional(),
        isActive: z.boolean().default(true),
      }),
    )
    .optional(),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        altText: z.string().optional(),
        isPrimary: z.boolean().default(false),
        sortOrder: z.number().default(0),
      }),
    )
    .optional(),
});

export const SearchQuerySchema = z.object({
  search: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Query too long")
    .regex(/^[a-zA-Z0-9\s\-_,.]+$/, "Invalid characters in search query"),

  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),

  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductSchemaType = z.infer<typeof CreateProductSchema>;
export type UpdateProductSchemaType = z.infer<typeof UpdateProductSchema>;
export type SearchQueryType = z.infer<typeof SearchQuerySchema>;
