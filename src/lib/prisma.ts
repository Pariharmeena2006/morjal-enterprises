import service from '../../service.mjs'

/**
 * The app's Prisma ORM 8 client, from the service's database dependency.
 *
 * `service.load()` caches its result, so calling this per request is safe.
 * Call it at request time — inside pages, server actions and route handlers —
 * never at module scope: `next build` imports every route module without the
 * runtime environment.
 */
export function getDb() {
  const { db } = service.load()
  return db.client
}
