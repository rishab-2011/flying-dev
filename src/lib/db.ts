import { PrismaClient } from "@prisma/client";

// Next dev reloads modules on every edit; without the global cache each reload
// would open another connection pool until SQLite runs out of handles.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
