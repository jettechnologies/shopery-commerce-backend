import { z } from "zod";

export const AddGuestCartItemSchema = z.object({
  productId: z.bigint("ProductId is required"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  unitPrice: z.number().positive("Unit price must be greater than 0"),
});

export type AddGuestCartItemSchemaType = z.infer<typeof AddGuestCartItemSchema>;
