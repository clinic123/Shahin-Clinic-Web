import { PrismaClient } from "@/prisma/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[MongoDB] DATABASE_URL is undefined. Database calls will fail."
    );
  }

  return new PrismaClient();
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
