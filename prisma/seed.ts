import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Hapus data lama (optional, untuk development)
  await prisma.booking.deleteMany()
  await prisma.user.deleteMany()

  // Buat user/petugas
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        password: 'admin123',
        name: 'Admin',
      },
    }),
  ])

  console.log('✅ Seed data berhasil dibuat!')
  console.log('Users:', users)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })