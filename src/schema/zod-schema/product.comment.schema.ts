import { z } from "zod";

export const CreateProductCommentSchema = z.object({
  productId: z.bigint(),
  body: z.string().min(1),
  parentId: z.bigint().optional(),
});

export type CreateProductCommentSchemaType = z.infer<
  typeof CreateProductCommentSchema
>;
