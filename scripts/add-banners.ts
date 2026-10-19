import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding banners to database...')

  // Banner 1
  await prisma.banner.upsert({
    where: { id: 'banner-1' },
    update: {},
    create: {
      id: 'banner-1',
      title: 'Premium Electrical Safety Products',
      description: 'Discover our range of high-quality electrical safety equipment for industrial and workplace protection',
      buttonText: 'Shop Now',
      buttonUrl: '/products',
      desktopImageUrl: '/banner-1.jpeg',
      mobileImageUrl: '/banner-1.jpeg',
      order: 1,
      isEnabled: true,
    },
  })

  // Banner 2
  await prisma.banner.upsert({
    where: { id: 'banner-2' },
    update: {},
    create: {
      id: 'banner-2',
      title: 'Safety First - Quality Guaranteed',
      description: 'Certified electrical safety products with pan India delivery and expert support',
      buttonText: 'Explore Products',
      buttonUrl: '/products',
      desktopImageUrl: '/banner-2.jpg',
      mobileImageUrl: '/banner-2.jpg',
      order: 2,
      isEnabled: true,
    },
  })

  console.log('Banners added successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
