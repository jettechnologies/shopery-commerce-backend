import slugify from "slugify";
import {
  CreateProductSchema,
  CreateProductSchemaType,
  UpdateProductSchema,
  UpdateProductSchemaType,
} from "@/schema/zod-schema/product.schema";
import { ConflictError, NotFoundError } from "@/libs/AppError";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/services/cloudinary.service";
import { prisma } from "prisma/client";

interface ImageUploadResponse {
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
  cloudinaryPublicId: string;
}

export class ProductService {
  /**
   * Create a new product with optional images
   */
  static async createProduct(
    data: CreateProductSchemaType,
    files?: Express.Multer.File[],
  ) {
    const slug = slugify(data.name, { lower: true, strict: true });

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { sku: data.sku }],
      },
    });
    if (existing)
      throw new ConflictError("A product with this Slug or SKU already exists");

    let imageData: ImageUploadResponse[] = [];
    if (files && files.length > 0) {
      const uploads = await Promise.all(
        files.map(async (file, idx) => {
          const uploaded = await uploadToCloudinary(file.path, "products");
          return {
            imageUrl: uploaded.url,
            altText: data.name,
            isPrimary: idx === 0,
            sortOrder: idx,
            cloudinaryPublicId: uploaded.public_id,
          };
        }),
      );
      imageData = uploads;
    }

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        salePrice: data.salePrice,
        sku: data.sku,
        stockQuantity: data.stockQuantity,
        weight: data.weight,
        dimensions: data.dimensions,
        categories: data.categoryIds
          ? {
              create: data.categoryIds.map((categoryId) => ({
                category: {
                  connect: { categoryId },
                },
              })),
            }
          : undefined,
        tags: data.tagIds
          ? { create: data.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
        images: imageData.length ? { create: imageData } : undefined,
      },
      include: { images: true, categories: true, tags: true },
    });

    return newProduct;
  }

  /**
   * Update product details or images
   */
  static async updateProduct(
    productId: string,
    data: UpdateProductSchemaType,
    files?: Express.Multer.File[],
  ) {
    const existing = await prisma.product.findUnique({
      where: { productId },
      include: { images: true },
    });

    if (!existing) throw new NotFoundError("Product not found");

    let imageData: ImageUploadResponse[] | undefined;

    // Upload new images if provided
    if (files && files.length > 0) {
      await Promise.all(
        existing.images.map((img) =>
          img.cloudinaryPublicId
            ? deleteFromCloudinary(img.cloudinaryPublicId)
            : null,
        ),
      );

      const uploads = await Promise.all(
        files.map(async (file, idx) => {
          const uploaded = await uploadToCloudinary(file.path, "products");
          return {
            imageUrl: uploaded.url,
            altText: data.name ?? existing.name,
            isPrimary: idx === 0,
            sortOrder: idx,
            cloudinaryPublicId: uploaded.public_id,
          };
        }),
      );

      await prisma.productImage.deleteMany({
        where: { productId: existing.id },
      });

      imageData = uploads;
    }

    // Start a transaction so we update everything atomically
    const updated = await prisma.$transaction(async (tx) => {
      // 1️⃣ Update product scalars & images
      const updatedProduct = await tx.product.update({
        where: { productId },
        data: {
          name: data.name ?? undefined,
          slug: data.name
            ? slugify(data.name, { lower: true, strict: true })
            : undefined,
          description: data.description ?? undefined,
          shortDescription: data.shortDescription ?? undefined,
          price: data.price ?? undefined,
          salePrice: data.salePrice ?? undefined,
          sku: data.sku ?? undefined,
          stockQuantity: data.stockQuantity ?? undefined,
          weight: data.weight ?? undefined,
          dimensions: data.dimensions ?? undefined,
          images: imageData ? { create: imageData } : undefined,
        },
      });

      // 2️⃣ Update categories
      if (data.categoryIds) {
        await tx.productCategory.deleteMany({
          where: { productId: existing.id },
        });

        const categoriesToCreate = data.categoryIds.map((catId) => ({
          productId: existing.id,
          categoryId: BigInt(catId), // convert string UUID id to BigInt if needed
        }));

        if (categoriesToCreate.length > 0) {
          await tx.productCategory.createMany({
            data: categoriesToCreate,
            skipDuplicates: true,
          });
        }
      }

      // 3️⃣ Update tags
      if (data.tagIds) {
        await tx.productTag.deleteMany({
          where: { productId: existing.id },
        });

        const tagsToCreate = data.tagIds.map((tagId) => ({
          productId: existing.id,
          tagId: BigInt(tagId),
        }));

        if (tagsToCreate.length > 0) {
          await tx.productTag.createMany({
            data: tagsToCreate,
            skipDuplicates: true,
          });
        }
      }

      // 4️⃣ Return product with joins
      return tx.product.findUnique({
        where: { productId },
        include: { images: true, categories: true, tags: true },
      });
    });

    return updated;
  }

  /**
   * Toggle product active state (soft delete / restore)
   */
  static async toggleActive(productId: string) {
    const product = await prisma.product.findUnique({ where: { productId } });
    if (!product) throw new NotFoundError("Product not found");

    const updated = await prisma.product.update({
      where: { productId },
      data: { isActive: !product.isActive },
    });

    return {
      message: `Product has been ${
        updated.isActive ? "activated" : "deactivated"
      } successfully.`,
      product: updated,
    };
  }

  /**
   * Permanently delete a product and its images
   */
  static async deleteProduct(productId: string) {
    const existing = await prisma.product.findUnique({
      where: { productId },
      include: { images: true },
    });
    if (!existing) throw new NotFoundError("Product not found");

    // Delete all associated Cloudinary images
    await Promise.all(
      existing.images.map((img) =>
        img.cloudinaryPublicId
          ? deleteFromCloudinary(img.cloudinaryPublicId)
          : null,
      ),
    );

    await prisma.product.delete({ where: { productId } });
    return { message: "Product deleted successfully" };
  }
}
