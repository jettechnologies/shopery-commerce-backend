import {
  CreateTagSchema,
  UpdateTagSchema,
  type CreateTagSchemaType,
  type UpdateTagSchemaType,
} from "@/schema/zod-schema";
import { NotFoundError, BadRequestError, ConflictError } from "@/libs/AppError";
import { prisma } from "prisma/client";

export class TagService {
  // Get all tags (for public/product/post listing)
  static async getAllTags() {
    return await prisma.tag.findMany({
      include: {
        productTags: true,
        postTags: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Get single tag by slug or id
  static async getTagBySlug(slug: string) {
    const tag = await prisma.tag.findUnique({ where: { slug } });
    if (!tag) throw new NotFoundError("Tag not found");
    return tag;
  }

  // Admin: create a new tag
  static async createTag(data: CreateTagSchemaType) {
    const parsedData = CreateTagSchema.parse(data);

    try {
      return await prisma.tag.create({
        data: {
          ...parsedData,
          slug:
            parsedData.slug ??
            parsedData.name.toLowerCase().replace(/\s+/g, "-"),
        },
      });
    } catch (err: any) {
      if (err.code === "P2002")
        throw new ConflictError("Tag name or slug already exists");
      throw new BadRequestError("Failed to create tag");
    }
  }

  // Admin: update tag
  static async updateTag(id: bigint, data: UpdateTagSchemaType) {
    const parsedData = UpdateTagSchema.parse(data);

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Tag not found");

    try {
      return await prisma.tag.update({
        where: { id },
        data: parsedData,
      });
    } catch (err: any) {
      if (err.code === "P2002")
        throw new ConflictError("Tag name or slug already exists");
      throw new BadRequestError("Failed to update tag");
    }
  }

  // Admin: delete tag
  static async deleteTag(id: bigint) {
    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Tag not found");

    await prisma.tag.delete({ where: { id } });
    return { message: "Tag deleted successfully" };
  }
}
