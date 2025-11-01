import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(2, "Category name is required").optional(),
  description: z.string().optional(),
});

export type CreateCategorySchemaType = z.infer<typeof CreateCategorySchema>;
export type UpdateCategorySchemaType = z.infer<typeof UpdateCategorySchema>;
