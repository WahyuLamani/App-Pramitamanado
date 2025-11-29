import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function untuk error handling
export function handlePrismaError(error: any) {
  console.error('Prisma Error:', error)

  if (error.code === 'P2002') {
    return {
      error: 'Data sudah ada (duplicate)',
      details: error.meta?.target,
    }
  }

  if (error.code === 'P2025') {
    return {
      error: 'Data tidak ditemukan',
      details: error.meta,
    }
  }

  if (error.code === 'P2003') {
    return {
      error: 'Relasi data tidak valid',
      details: error.meta,
    }
  }

  return {
    error: 'Terjadi kesalahan pada database',
    details: error.message,
  }
}