import { z } from "zod";

export const CreateReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional(),
});

export const ApproveReviewSchema = z.object({
  isApproved: z.boolean(),
});

export type CreateReviewSchemaType = z.infer<typeof CreateReviewSchema>;
export type ApproveReviewSchemaType = z.infer<typeof ApproveReviewSchema>;
