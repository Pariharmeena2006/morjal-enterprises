const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

require('@next/env').loadEnvConfig(process.cwd())

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME?.trim() || 'MORJAL Admin'

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the local environment.')
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: { email }
  })

  if (existingAdmin) {
    console.log('Admin user already exists; no changes made.')
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      name,
    }
  })

  console.log('Admin user created successfully.')
}

main()
  .catch(() => {
    console.error('Admin seed failed. Check the environment and database connection.')
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
