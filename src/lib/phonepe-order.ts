import { prisma } from '@/lib/prisma'
import { checkPhonePeStatus } from '@/lib/phonepe'

/** Shared verification: marks order paid only after authoritative PhonePe status check. */
export async function confirmPhonePeOrder(merchantOrderId: string) {
  const order = await prisma.order.findFirst({
    where: { phonepeMerchantOrderId: merchantOrderId, paymentMethod: 'phonepe' },
    select: { id: true, orderNumber: true, total: true, paymentStatus: true },
  })
  if (!order) return { order: null, paid: false }
  if (order.paymentStatus === 'paid') return { order, paid: true }

  const status = await checkPhonePeStatus(merchantOrderId)
  if (!status || status.state !== 'COMPLETED' || status.code !== 'SUCCESS') {
    return { order, paid: false, status }
  }
  // Exact integer paise comparison — no tolerance
  if (status.amountPaise !== Math.round(order.total * 100)) {
    return { order, paid: false, status, amountMismatch: true }
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: 'pending' },
      data: { paymentStatus: 'paid', orderStatus: 'confirmed', phonepeTransactionId: status.transactionId || merchantOrderId },
    })
    if (updated.count === 1) {
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: 'confirmed', note: `Online payment verified via PhonePe (txn ${status.transactionId || merchantOrderId}).` },
      })
    }
  })
  return { order, paid: true, status }
}
