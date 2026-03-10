import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createSafePrismaClient() {
  try {
    return new PrismaClient({ log: ["error"] });
  } catch (error) {
    console.error("PrismaClient 初期化に失敗しました。`npx prisma generate` を実行してください。", error);
    return new Proxy(
      {},
      {
        get() {
          throw new Error("PrismaClient が未生成です。`npx prisma generate` を実行してください。");
        }
      }
    ) as PrismaClient;
  }
}

export const prisma = globalForPrisma.prisma ?? createSafePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
