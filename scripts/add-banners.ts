import postgres from '@prisma/orm-postgres/runtime'
import { contractFromJson } from '@prisma/orm-postgres/static'
import type { Contract } from '../src/prisma/contract'
import contractJson from '../src/prisma/contract.json'

const db = postgres({
  contract: contractFromJson<Contract>(contractJson),
  url: process.env['DATABASE_URL']!,
})

async function main() {
  console.log('Adding banners to database...')

  // Banner 1
  await db.orm.public.Banner.where({ id: 'banner-1' }).upsert({
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
    update: {},
  })

  // Banner 2
  await db.orm.public.Banner.where({ id: 'banner-2' }).upsert({
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
    update: {},
  })

  console.log('Banners added successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.close())
