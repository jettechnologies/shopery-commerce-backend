import { z } from "zod";

export const CreateOrderSchema = z
  .object({
    userId: z.string().optional().nullable(),
    cartId: z.string().optional().nullable(),
    guestCartId: z.bigint().optional().nullable(),
    email: z.string().regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
      message: "Invalid email address",
    }),
    total: z.number().positive("Total must be greater than 0"),
    paymentId: z.string().optional().nullable(),
  })
  .refine((data) => data.cartId || data.guestCartId, {
    message: "Either cartId or guestCartId is required",
  });

export type CreateOrderSchemaType = z.infer<typeof CreateOrderSchema>;
