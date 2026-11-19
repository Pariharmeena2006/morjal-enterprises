import { createHash, randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'

const WINDOW_MS = 15 * 60 * 1000

export async function consumeAuthRateLimit(action: string, key: string, limit = 10) {
  const keyHash = createHash('sha256').update(`${action}:${key}`).digest('hex')
  const now = new Date()
  const current = await prisma.authRateLimit.findUnique({
    where: { keyHash_action: { keyHash, action } },
  })

  if (!current) {
    try {
      await prisma.authRateLimit.create({
        data: { id: randomUUID(), keyHash, action, attempts: 1, windowStartedAt: now },
      })
      return { allowed: true, retryAfterSeconds: 0 }
    } catch {
      const raced = await prisma.authRateLimit.findUnique({
        where: { keyHash_action: { keyHash, action } },
      })
      if (!raced) throw new Error('Unable to apply authentication rate limit')
      return consumeExisting(raced.id, raced.attempts, raced.windowStartedAt, now, limit)
    }
  }

  return consumeExisting(current.id, current.attempts, current.windowStartedAt, now, limit)
}

async function consumeExisting(id: string, attempts: number, windowStartedAt: Date, now: Date, limit: number) {
  if (now.getTime() - windowStartedAt.getTime() >= WINDOW_MS) {
    await prisma.authRateLimit.update({ where: { id }, data: { attempts: 1, windowStartedAt: now } })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  const updated = await prisma.authRateLimit.update({ where: { id }, data: { attempts: { increment: 1 } }, select: { attempts: true } })
  if (updated.attempts <= limit) return { allowed: true, retryAfterSeconds: 0 }

  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((windowStartedAt.getTime() + WINDOW_MS - now.getTime()) / 1000)),
  }
}

export function requestAddress(request: { headers?: Headers | Record<string, string> }) {
  const headers = request.headers
  const forwardedValue = headers instanceof Headers ? headers.get('x-forwarded-for') : headers?.['x-forwarded-for']
  const realIp = headers instanceof Headers ? headers.get('x-real-ip') : headers?.['x-real-ip']
  const forwarded = forwardedValue?.split(',').map((value) => value.trim()).filter(Boolean).at(-1)
  return realIp || forwarded || 'unknown'
}
