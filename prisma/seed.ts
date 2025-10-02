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
      billingName: 'Teszt Ügyfél Kft.',
      billingZip: '1234',
      billingCity: 'Budapest',
      billingAddress: 'Teszt utca 1.',
      companyName: 'Teszt Ügyfél Kft.',
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