const { PrismaClient } = require('@prisma/client');
const env = require('../config/env');

// Prevent multiple Prisma Client instances during hot-reloading in development
const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
