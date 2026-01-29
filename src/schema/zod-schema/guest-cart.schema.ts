import { z } from "zod";

export const AddGuestCartItemSchema = z.object({
  productId: z.bigint("ProductId is required"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  unitPrice: z.number().positive("Unit price must be greater than 0"),
});

export const GuestCartSchema = z.object({
  id: z.string(),
  token: z.string().uuid(),
  expiresAt: z.string().datetime(),
  items: z.array(z.unknown()),
});

export type AddGuestCartItemSchemaType = z.infer<typeof AddGuestCartItemSchema>;
