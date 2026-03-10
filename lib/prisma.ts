import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function ensureDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL が未設定です。プロジェクトルートに .env を作成し、DATABASE_URL=\"file:./dev.db\" を設定してください。"
    );
  }
}

function createSafePrismaClient() {
  try {
    ensureDatabaseUrl();
    return new PrismaClient({ log: ["error"] });
  } catch (error) {
    console.error("PrismaClient 初期化に失敗しました。", error);
    return new Proxy(
      {},
      {
        get() {
          throw error instanceof Error ? error : new Error("PrismaClient 初期化に失敗しました。");
        }
      }
    ) as PrismaClient;
  }
}

export const prisma = globalForPrisma.prisma ?? createSafePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
