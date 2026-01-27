import { z } from "zod";

export const AddToCartSchema = z.object({
  productId: z.string().uuid("Invalid Product ID"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().positive("Quantity must be greater than 0"),
});

export type AddToCartSchemaType = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemSchemaType = z.infer<typeof UpdateCartItemSchema>;
