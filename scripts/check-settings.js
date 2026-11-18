const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSettings() {
  const settings = await prisma.websiteSettings.findFirst()
  console.log('Current Settings:', JSON.stringify(settings, null, 2))
}

checkSettings()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
