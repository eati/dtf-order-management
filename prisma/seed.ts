import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Alapértelmezett árazás
  await prisma.pricing.create({
    data: {
      pricePerSqm: 6800,
      vatRate: 27,
      glsPrice: 1490,
      codPrice: 600,
    },
  })

  // Teszt ügyfél
  const customer = await prisma.customer.create({
    data: {
      name: 'Teszt Ügyfél Kft.',
      email: 'info@teszt.hu',
      phone: '+36 30 123 4567',
      address: '1234 Budapest, Teszt utca 1.',
      taxNumber: '12345678-1-23',
    },
  })

  console.log('Seed adatok sikeresen létrehozva!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })