// Interactive admin password reset. Password is read from stdin — never hardcoded.
// Usage: node scripts/reset-admin-password.mjs
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
const ask = (q) => new Promise((r) => rl.question(q, r))

const prisma = new PrismaClient()
try {
  const admin = await prisma.admin.findFirst({ where: { email: 'devrajmeena3855@gmail.com' } })
  if (!admin) { console.error('Admin account not found.'); process.exit(1) }
  console.log(`Account: ${admin.email} (${admin.name}) — id ${admin.id}`)

  const pw1 = await ask('New password (min 12 chars): ')
  const pw2 = await ask('Confirm password: ')
  if (pw1 !== pw2) { console.error('Passwords do not match.'); process.exit(1) }
  if (pw1.length < 12) { console.error('Password must be at least 12 characters.'); process.exit(1) }

  const confirm = await ask('Type YES to update the production database: ')
  if (confirm !== 'YES') { console.log('Aborted — no changes made.'); process.exit(0) }

  const hashed = await bcrypt.hash(pw1, 12)
  await prisma.admin.update({ where: { id: admin.id }, data: { password: hashed } })
  console.log('Password updated successfully (bcrypt hash stored).')
} finally {
  rl.close()
  await prisma.$disconnect()
}
