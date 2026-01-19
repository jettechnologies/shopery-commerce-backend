import { prisma } from "./client";
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

  console.log("✅ Seeded Super Admin:", superAdmin);
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
