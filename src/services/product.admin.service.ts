import { PrismaClient } from "@prisma/client";
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

const prisma = new PrismaClient();

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
    files?: Express.Multer.File[]
  ) {
    const slug = slugify(data.name, { lower: true, strict: true });

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing)
      throw new ConflictError("A product with this name already exists");

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
        })
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
          ? { create: data.categoryIds.map((categoryId) => ({ categoryId })) }
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
    files?: Express.Multer.File[]
  ) {
    const existing = await prisma.product.findUnique({
      where: { productId },
      include: { images: true },
    });
    if (!existing) throw new NotFoundError("Product not found");

    let imageData: ImageUploadResponse[] | undefined;

    const existingProductId = existing.id;

    // Upload new images if provided
    if (files && files.length > 0) {
      // Delete old images from Cloudinary
      await Promise.all(
        existing.images.map((img) =>
          img.cloudinaryPublicId
            ? deleteFromCloudinary(img.cloudinaryPublicId)
            : null
        )
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
        })
      );

      // Delete old image records & create new ones
      await prisma.productImage.deleteMany({
        where: { productId: existingProductId },
      });
      imageData = uploads;
    }

    const updated = await prisma.product.update({
      where: { productId },
      data: {
        name: data.name ?? existing.name,
        slug: data.name
          ? slugify(data.name, { lower: true, strict: true })
          : existing.slug,
        description: data.description ?? existing.description,
        shortDescription: data.shortDescription ?? existing.shortDescription,
        price: data.price ?? existing.price,
        salePrice: data.salePrice ?? existing.salePrice,
        sku: data.sku ?? existing.sku,
        stockQuantity: data.stockQuantity ?? existing.stockQuantity,
        weight: data.weight ?? existing.weight,
        dimensions: data.dimensions ?? existing.dimensions,
        images: imageData ? { create: imageData } : undefined,
      },
      include: { images: true, categories: true, tags: true },
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
          : null
      )
    );

    await prisma.product.delete({ where: { productId } });
    return { message: "Product deleted successfully" };
  }
}

// import { PrismaClient } from "@prisma/client";
// import slugify from "slugify";
// import {
//   CreateProductSchemaType,
//   UpdateProductSchemaType,
// } from "@/schema/zod-schema/product.schema";
// import { ConflictError, NotFoundError } from "@/libs/AppError";
// import {
//   uploadToCloudinary,
//   deleteFromCloudinary,
// } from "@/services/cloudinary.service";

// const prisma = new PrismaClient();

// interface ImageUploadResponse {
//   imageUrl: string;
//   altText: string;
//   isPrimary: boolean;
//   sortOrder: number;
//   cloudinaryPublicId: string;
// }

// export class ProductService {
//   static async createProduct(
//     data: CreateProductSchemaType,
//     files?: Express.Multer.File[]
//   ) {
//     const parsed = data;

//     // ✅ Automatically generate slug from name
//     const slug = slugify(parsed.name);

//     const existing = await prisma.product.findUnique({
//       where: { slug },
//     });
//     if (existing)
//       throw new ConflictError("A product with this name already exists");

//     let imageData: ImageUploadResponse[] = [];
//     if (files && files.length > 0) {
//       const uploads = await Promise.all(
//         files.map(async (file, idx) => {
//           const uploaded = await uploadToCloudinary(file.path, "products");
//           return {
//             imageUrl: uploaded.url,
//             altText: parsed.name,
//             isPrimary: idx === 0,
//             sortOrder: idx,
//             cloudinaryPublicId: uploaded.public_id,
//           };
//         })
//       );
//       imageData = uploads;
//     }

//     const newProduct = await prisma.product.create({
//       data: {
//         name: parsed.name,
//         slug,
//         description: parsed.description,
//         shortDescription: parsed.shortDescription,
//         price: parsed.price,
//         salePrice: parsed.salePrice,
//         sku: parsed.sku,
//         stockQuantity: parsed.stockQuantity,
//         weight: parsed.weight,
//         dimensions: parsed.dimensions,
//         categories: parsed.categoryIds
//           ? { create: parsed.categoryIds.map((categoryId) => ({ categoryId })) }
//           : undefined,
//         tags: parsed.tagIds
//           ? { create: parsed.tagIds.map((tagId) => ({ tagId })) }
//           : undefined,
//         images: imageData.length ? { create: imageData } : undefined,
//       },
//       include: { images: true, categories: true, tags: true },
//     });

//     return newProduct;
//   }

//   static async deleteProduct(productId: string) {
//     const existing = await prisma.product.findUnique({
//       where: { productId },
//       include: { images: true },
//     });
//     if (!existing) throw new NotFoundError("Product not found");

//     // Delete all associated Cloudinary images
//     await Promise.all(
//       existing.images.map((img) =>
//         img.cloudinaryPublicId
//           ? deleteFromCloudinary(img.cloudinaryPublicId)
//           : null
//       )
//     );

//     await prisma.product.delete({ where: { productId } });
//     return { message: "Product deleted successfully" };
//   }
// }
