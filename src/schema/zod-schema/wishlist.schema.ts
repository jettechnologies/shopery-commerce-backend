import { z } from "zod";

export const AddToWishlistSchema = z.object({
  productId: z.string().uuid("Invalid Product ID"),
});

export type AddToWishlistSchemaType = z.infer<typeof AddToWishlistSchema>;
