import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  salePrice: z.number().optional(),
  sku: z.string().optional(),
  stockQuantity: z.number().int().nonnegative().default(0),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  categoryIds: z.array(z.number().int()).optional(),
  tagIds: z.array(z.number().int()).optional(),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        altText: z.string().optional(),
        isPrimary: z.boolean().default(false),
        sortOrder: z.number().default(0),
      })
    )
    .optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductSchemaType = z.infer<typeof CreateProductSchema>;
export type UpdateProductSchemaType = z.infer<typeof UpdateProductSchema>;
