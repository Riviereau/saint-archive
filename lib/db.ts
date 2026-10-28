/*
  lib/db.ts — Une seule connexion Prisma, réutilisée entre les rechargements
  à chaud du mode développement (sinon Next.js en ouvre une nouvelle à
  chaque modification de fichier).
*/

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
