const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding admin user...')

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: 'admin@morjal.com' }
  })

  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Create admin user
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@morjal.com',
      password: hashedPassword,
      name: 'Admin User',
    }
  })

  console.log('Admin user created:', admin.email)
  console.log('Password: admin123')
  console.log('IMPORTANT: Change the password after first login!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
