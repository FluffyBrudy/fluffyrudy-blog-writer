import { PrismaClient } from "@prisma/client";

const isProd = process.env.NODE_ENV === "production";
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma || new PrismaClient({ errorFormat: "minimal" });

if (isProd) globalForPrisma.prisma = prisma;

export default prisma;
