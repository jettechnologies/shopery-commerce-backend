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
import { prisma } from "@/prisma/client.js";

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

    let calculatedStock = 0;
    let computedMinPrice: number | undefined = undefined;
    let computedMaxPrice: number | undefined = undefined;

    if (data.variants && data.variants.length > 0) {
      calculatedStock = data.variants.reduce(
        (sum, variant) => sum + variant.stockQuantity,
        0,
      );
      computedMinPrice = Math.min(
        ...data.variants.map((v) => v.salePrice ?? v.price),
      );
      computedMaxPrice = Math.max(...data.variants.map((v) => v.price));
    }

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        sku: data.sku,
        minPrice: computedMinPrice,
        maxPrice: computedMaxPrice,
        stockQuantity: calculatedStock,
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
        variants:
          data.variants && data.variants.length > 0
            ? {
                create: data.variants.map((v) => ({
                  sku: v.sku ?? null,
                  size: v.size ?? null,
                  color: v.color ?? [],
                  stockQuantity: v.stockQuantity,
                  price: v.price,
                  salePrice: v.salePrice ?? null,
                  isActive: v.isActive ?? true,
                })),
              }
            : undefined,
      },
      include: { images: true, categories: true, tags: true, variants: true },
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
      let calculatedStock = undefined;
      let computedMinPrice: number | undefined = undefined;
      let computedMaxPrice: number | undefined = undefined;

      // Only alter root stock/bounds dynamically if user updates variants.
      // E.g if variants are passed, replace completely & re-sum.
      if (data.variants && data.variants.length > 0) {
        calculatedStock = data.variants.reduce(
          (sum, v) => sum + (v.stockQuantity ?? 0),
          0,
        );
        computedMinPrice = Math.min(
          ...data.variants.map((v) => v.salePrice ?? v.price),
        );
        computedMaxPrice = Math.max(...data.variants.map((v) => v.price));
      } else if (data.variants && data.variants.length === 0) {
        calculatedStock = 0;
      }

      // 1️⃣ Update product scalars & images
      await tx.product.update({
        where: { productId },
        data: {
          name: data.name ?? undefined,
          slug: data.name
            ? slugify(data.name, { lower: true, strict: true })
            : undefined,
          description: data.description ?? undefined,
          shortDescription: data.shortDescription ?? undefined,
          sku: data.sku ?? undefined,
          minPrice:
            computedMinPrice !== undefined ? computedMinPrice : undefined,
          maxPrice:
            computedMaxPrice !== undefined ? computedMaxPrice : undefined,
          stockQuantity:
            calculatedStock !== undefined ? calculatedStock : undefined,
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

        // const categoriesToCreate = data.categoryIds.map((catId) => ({
        //   productId: existing.id,
        //   categoryId: BigInt(catId),
        // }));

        const categories = await tx.category.findMany({
          where: {
            categoryId: { in: data.categoryIds },
          },
          select: { id: true },
        });

        console.log(categories, "categories");

        const categoriesToCreate = categories.map((cat) => ({
          productId: existing.id,
          categoryId: cat.id,
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

      // 4️⃣ Update variants
      if (data.variants) {
        await tx.productVariant.deleteMany({
          where: { productId: existing.id },
        });

        if (data.variants.length > 0) {
          await tx.productVariant.createMany({
            data: data.variants.map((v) => ({
              productId: existing.id,
              sku: v.sku ?? null,
              size: v.size ?? null,
              color: v.color ?? [],
              stockQuantity: v.stockQuantity,
              price: v.price,
              salePrice: v.salePrice ?? null,
              isActive: v.isActive ?? true,
            })),
          });
        }
      }

      // 5️⃣ Return product with joins
      return tx.product.findUnique({
        where: { productId },
        include: { images: true, categories: true, tags: true, variants: true },
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

  /**
   * Helper: Recalculate full product stock, minPrice, and maxPrice dynamically
   */
  private static async recomputeProductTotals(productId: bigint, tx: any) {
    const allVariants = await tx.productVariant.findMany({
      where: { productId, isActive: true },
    });

    const totalStock = allVariants.reduce(
      (sum: number, v: any) => sum + v.stockQuantity,
      0,
    );
    const minPrice =
      allVariants.length > 0
        ? Math.min(
            ...allVariants.map((v: any) => Number(v.salePrice ?? v.price)),
          )
        : null;
    const maxPrice =
      allVariants.length > 0
        ? Math.max(...allVariants.map((v: any) => Number(v.price)))
        : null;

    await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: totalStock, minPrice, maxPrice },
    });
  }

  /**
   * Adjust a specific variant's stock quantity gracefully (increment/decrement)
   */
  static async adjustVariantInventory(
    productId: string,
    variantId: string,
    change: number,
  ) {
    const existingProduct = await prisma.product.findUnique({
      where: { productId },
    });
    if (!existingProduct) throw new NotFoundError("Product not found");

    const existingVariant = await prisma.productVariant.findFirst({
      where: { id: BigInt(variantId), productId: existingProduct.id },
    });
    if (!existingVariant) throw new NotFoundError("Product Variant not found");

    if (existingVariant.stockQuantity + change < 0) {
      throw new ConflictError("Variant stock cannot be less than zero");
    }

    const updatedVariant = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.update({
        where: { id: existingVariant.id },
        data: { stockQuantity: { increment: change } },
      });

      await this.recomputeProductTotals(existingProduct.id, tx);
      return variant;
    });

    return {
      message: "Variant stock updated successfully",
      variant: updatedVariant,
    };
  }

  /**
   * Update Variant specific fields independently (price, size, color array)
   */
  static async updateVariantDetails(
    productId: string,
    variantId: string,
    data: any,
  ) {
    const existingProduct = await prisma.product.findUnique({
      where: { productId },
    });
    if (!existingProduct) throw new NotFoundError("Product not found");

    const existingVariant = await prisma.productVariant.findFirst({
      where: { id: BigInt(variantId), productId: existingProduct.id },
    });
    if (!existingVariant) throw new NotFoundError("Product Variant not found");

    const updatedVariant = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.update({
        where: { id: existingVariant.id },
        data: {
          sku: data.sku !== undefined ? data.sku : existingVariant.sku,
          size: data.size !== undefined ? data.size : existingVariant.size,
          color: data.color !== undefined ? data.color : existingVariant.color,
          price: data.price !== undefined ? data.price : existingVariant.price,
          salePrice:
            data.salePrice !== undefined
              ? data.salePrice
              : existingVariant.salePrice,
        },
      });

      await this.recomputeProductTotals(existingProduct.id, tx);
      return variant;
    });

    return {
      message: "Variant updated successfully",
      variant: updatedVariant,
    };
  }

  /**
   * Toggle variant soft delete (isActive) state
   */
  static async toggleVariantActive(productId: string, variantId: string) {
    const existingProduct = await prisma.product.findUnique({
      where: { productId },
    });
    if (!existingProduct) throw new NotFoundError("Product not found");

    const existingVariant = await prisma.productVariant.findFirst({
      where: { id: BigInt(variantId), productId: existingProduct.id },
    });
    if (!existingVariant) throw new NotFoundError("Product Variant not found");

    const updatedVariant = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.update({
        where: { id: existingVariant.id },
        data: { isActive: !existingVariant.isActive },
      });

      // Hiding a variant adjusts root stock logic mappings natively
      await this.recomputeProductTotals(existingProduct.id, tx);
      return variant;
    });

    return {
      message: `Variant successfully ${updatedVariant.isActive ? "activated" : "deactivated"}`,
      variant: updatedVariant,
    };
  }

  /**
   * Hard Delete a specific variant
   */
  static async deleteVariant(productId: string, variantId: string) {
    const existingProduct = await prisma.product.findUnique({
      where: { productId },
    });
    if (!existingProduct) throw new NotFoundError("Product not found");

    const existingVariant = await prisma.productVariant.findFirst({
      where: { id: BigInt(variantId), productId: existingProduct.id },
    });
    if (!existingVariant) throw new NotFoundError("Product Variant not found");

    await prisma.$transaction(async (tx) => {
      await tx.productVariant.delete({ where: { id: existingVariant.id } });
      await this.recomputeProductTotals(existingProduct.id, tx);
    });

    return { message: "Variant deleted from system completely" };
  }
}
