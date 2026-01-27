import { z } from "zod";

export const CreateTagSchema = z.object({
  name: z.string().min(2, "Tag name must be at least 2 characters long"),
  slug: z.string().optional(),
});

export const CreateMultipleTagSchema = z.array(CreateTagSchema);

export const UpdateTagSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
});

export type CreateTagSchemaType = z.infer<typeof CreateTagSchema>;
export type CreateMultipleTagSchemaType = z.infer<
  typeof CreateMultipleTagSchema
>;
export type UpdateTagSchemaType = z.infer<typeof UpdateTagSchema>;
