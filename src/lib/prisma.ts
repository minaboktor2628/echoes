import { PrismaClient } from "@prisma/client";

import { env } from "@/env";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


import type { Prisma } from "@prisma/client";

type ModelNames = Prisma.ModelName; // "User" | "Post"

export type PrismaModels = {
  [M in ModelNames]: Exclude<
      Awaited<ReturnType<PrismaClient[Uncapitalize<M>]["findUnique"]>>,
      null
  >;
};

