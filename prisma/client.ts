import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const NODE_ENV = process.env.NODE_ENV;
const IS_DEV = NODE_ENV === "development";
const connectionString = IS_DEV
  ? process.env.LOCAL_DATABASE_URL
  : process.env.PROD_DATABASE_URL;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });
