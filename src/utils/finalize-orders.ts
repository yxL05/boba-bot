import { orderTable } from '../tables/order'
import { formatOrderSummary } from '../conversations/menu'

export async function finalizeOrders({
  storeName,
  placedOrderIds,
  buyers,
  initiatorId,
}: {
  storeName: string
  placedOrderIds: number[]
  buyers: string[]
  initiatorId: string
}): Promise<string> {
  if (placedOrderIds.length === 0) {
    return `⏰ Ordering window for *${storeName}* has closed. No orders were placed.`
  }

  const orders = (await Promise.all(placedOrderIds.map((id) => orderTable.getRow({ id })))).filter(Boolean)

  const orderedUserIds = new Set(orders.map((o) => o.memberId))
  const didntOrder = buyers.filter((id) => !orderedUserIds.has(id))

  const entries = orders.map((o) => ({
    memberId: o.memberId,
    drinkName: o.itemName,
    qty: o.qty,
    iceLevel: o.iceLevel ?? undefined,
    sugarLevel: o.sugarLevel ?? undefined,
    size: o.size ?? undefined,
    toppings: o.toppings ?? undefined,
    orderId: o.id,
  }))

  return formatOrderSummary(storeName, entries, didntOrder, initiatorId)
}
