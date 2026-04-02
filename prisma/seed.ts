import { prisma } from "./client.js";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("superAdmin123", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      email: "superadmin@example.com",
      passwordHash: hashedPassword,
      name: "Super Admin",
      role: "admin",
    },
  });

  console.log("✅ Seeded Super Admin:", superAdmin.email);

  // Categories
  const menCategory = await prisma.category.upsert({
    where: { slug: "men" },
    update: {},
    create: {
      name: "Men",
      slug: "men",
      description: "Men's fashion and clothing",
    },
  });

  const womenCategory = await prisma.category.upsert({
    where: { slug: "women" },
    update: {},
    create: {
      name: "Women",
      slug: "women",
      description: "Women's fashion and clothing",
    },
  });

  const accCategory = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: {
      name: "Accessories",
      slug: "accessories",
      description: "Fashion accessories",
    },
  });

  // More Categories
  const shoesCategory = await prisma.category.upsert({
    where: { slug: "shoes" },
    update: {},
    create: {
      name: "Shoes",
      slug: "shoes",
      description: "Footwear for all occasions",
    },
  });

  const outerwearCategory = await prisma.category.upsert({
    where: { slug: "outerwear" },
    update: {},
    create: {
      name: "Outerwear",
      slug: "outerwear",
      description: "Jackets, coats and more",
    },
  });

  // Example Product 1 (Men)
  await prisma.product.upsert({
    where: { slug: "mens-classic-tshirt" },
    update: {},
    create: {
      name: "Men's Classic T-Shirt",
      slug: "mens-classic-tshirt",
      description: "A comfortable, classic fit t-shirt for everyday wear.",
      minPrice: 20.0,
      maxPrice: 25.0,
      stockQuantity: 100,
      variants: {
        create: [
          {
            sku: "M-TSHIRT-BLK-S",
            size: "S",
            color: ["Black"],
            stockQuantity: 20,
            price: 20.0,
          },
          {
            sku: "M-TSHIRT-BLK-M",
            size: "M",
            color: ["Black"],
            stockQuantity: 30,
            price: 20.0,
          },
          {
            sku: "M-TSHIRT-WHT-M",
            size: "M",
            color: ["White"],
            stockQuantity: 30,
            price: 25.0,
          },
          {
            sku: "M-TSHIRT-WHT-L",
            size: "L",
            color: ["White"],
            stockQuantity: 20,
            price: 25.0,
          },
        ],
      },
      categories: {
        create: { categoryId: menCategory.id },
      },
    },
  });

  // Example Product 2 (Women)
  await prisma.product.upsert({
    where: { slug: "womens-summer-dress" },
    update: {},
    create: {
      name: "Women's Summer Dress",
      slug: "womens-summer-dress",
      description: "Light and breezy summer dress, perfect for warm weather.",
      minPrice: 40.0,
      maxPrice: 45.0,
      stockQuantity: 50,
      variants: {
        create: [
          {
            sku: "W-DRESS-RED-S",
            size: "S",
            color: ["Red"],
            stockQuantity: 15,
            price: 40.0,
          },
          {
            sku: "W-DRESS-RED-M",
            size: "M",
            color: ["Red"],
            stockQuantity: 20,
            price: 45.0,
          },
          {
            sku: "W-DRESS-RED-L",
            size: "L",
            color: ["Red"],
            stockQuantity: 15,
            price: 45.0,
          },
        ],
      },
      categories: {
        create: { categoryId: womenCategory.id },
      },
    },
  });

  // Example Product 3 (Shoes)
  await prisma.product.upsert({
    where: { slug: "urban-leather-boots" },
    update: {},
    create: {
      name: "Urban Leather Boots",
      slug: "urban-leather-boots",
      description: "Durable and stylish leather boots for the modern urbanite.",
      minPrice: 85.0,
      maxPrice: 95.0,
      stockQuantity: 40,
      variants: {
        create: [
          {
            sku: "S-BOOT-BLK-42",
            size: "42",
            color: ["Black"],
            stockQuantity: 10,
            price: 85.0,
          },
          {
            sku: "S-BOOT-BLK-44",
            size: "44",
            color: ["Black"],
            stockQuantity: 10,
            price: 85.0,
          },
          {
            sku: "S-BOOT-BRN-42",
            size: "42",
            color: ["Brown"],
            stockQuantity: 10,
            price: 95.0,
          },
          {
            sku: "S-BOOT-BRN-44",
            size: "44",
            color: ["Brown"],
            stockQuantity: 10,
            price: 95.0,
          },
        ],
      },
      categories: {
        create: { categoryId: shoesCategory.id },
      },
    },
  });

  // Example Product 4 (Outerwear)
  await prisma.product.upsert({
    where: { slug: "winter-parka-jacket" },
    update: {},
    create: {
      name: "Winter Parka Jacket",
      slug: "winter-parka-jacket",
      description: "Insulated winter parka to keep you warm in extreme cold.",
      minPrice: 120.0,
      maxPrice: 150.0,
      stockQuantity: 25,
      variants: {
        create: [
          {
            sku: "O-PARKA-NVY-M",
            size: "M",
            color: ["Navy"],
            stockQuantity: 10,
            price: 120.0,
          },
          {
            sku: "O-PARKA-NVY-L",
            size: "L",
            color: ["Navy"],
            stockQuantity: 10,
            price: 130.0,
          },
          {
            sku: "O-PARKA-BLK-XL",
            size: "XL",
            color: ["Black"],
            stockQuantity: 5,
            price: 150.0,
          },
        ],
      },
      categories: {
        create: { categoryId: outerwearCategory.id },
      },
    },
  });

  console.log(
    "✅ Seeded Fashion House Models (Categories & Products with Variants).",
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
