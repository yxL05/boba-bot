import { MenuItemResponse } from '../tables/menu'

export function formatMenu(items: MenuItemResponse[], storeName: string): string {
  const header = `**${storeName} Menu**\n`

  const body = items
    .map((item) => {
      const price = item.price != null ? ` - $${item.price.toFixed(2)}` : ''
      const desc = item.description ? `\n_${item.description}_` : ''
      return `**${item.id}. ${item.name}**${price}${desc}`
    })
    .join('\n\n')

  return header + body
}

export function formatRecommendation(item: MenuItemResponse): string {
  const price = item.price != null ? ` - $${item.price.toFixed(2)}` : ''
  const desc = item.description ? `\n_${item.description}_` : ''
  return `Based on your description, I would recommend drink #${item.id}: **${item.name}**${price}${desc}.`
}

export function formatVoteSuccess(storeName: string, orderTimeMs: number): string {
  return [
    `✅ Vote passed! Enough people are in for boba at *${storeName}*.`,
    `You have ${formatDurationMs(orderTimeMs)} to place your order. Use: \`Order [qty] no. [drink #] with [desc]\``,
  ].join('\n')
}

export function formatVoteExpired(storeName: string): string {
  return `❌ The vote for boba at *${storeName}* expired without enough participants. Maybe next time!`
}

function formatDurationMs(ms: number): string {
  if (ms < 60_000) {
    const s = ms / 1_000
    return `${s} second${s === 1 ? '' : 's'}`
  }
  if (ms < 3_600_000) {
    const m = ms / 60_000
    return `${m} minute${m === 1 ? '' : 's'}`
  }
  const h = ms / 3_600_000
  return `${h} hour${h === 1 ? '' : 's'}`
}

export function formatVote(storeName: string, minBuyers: number, timeLimitMs: number): string {
  const reactionsNeeded = minBuyers - 1
  return [
    `🧋 *Boba day vote at ${storeName}!*`,
    `React to this message if you're in!`,
    `We need ${reactionsNeeded} more reaction(s) within ${formatDurationMs(timeLimitMs)}.`,
    `(Minimum ${minBuyers} buyers required — you're already counted in!)`,
  ].join('\n')
}


type OrderCustomization = { iceLevel?: string; sugarLevel?: string; toppings?: string }

function formatCustomization(c?: OrderCustomization): string {
  if (!c) return ''
  const parts = [c.iceLevel, c.sugarLevel, c.toppings].filter(Boolean)
  return parts.length ? ` (${parts.join(', ')})` : ''
}

export function formatOrderConfirmation(
  orderId: number,
  drinkName: string,
  qty: number,
  customization?: OrderCustomization
): string {
  return `✅ Order placed! Confirmation number: *#${orderId}*\n${qty}x *${drinkName}*${formatCustomization(customization)}`
}

export function formatOrderDetails(
  orderId: number,
  drinkName: string,
  qty: number,
  customization?: OrderCustomization
): string {
  return `Order *#${orderId}*: ${qty}x *${drinkName}*${formatCustomization(customization)}`
}

type OrderSummaryEntry = {
  memberId: string
  drinkName: string
  qty: number
  iceLevel?: string | null
  sugarLevel?: string | null
  toppings?: string | null
  orderId: number
}

export function formatOrderSummary(
  storeName: string,
  entries: OrderSummaryEntry[],
  didntOrder: string[],
  initiatorId: string
): string {
  const lines = [`⏰ Ordering window for *${storeName}* has closed!\n`]

  lines.push('*Orders:*')
  for (const e of entries) {
    lines.push(
      `• <@${e.memberId}>: ${e.qty}x ${e.drinkName}${formatCustomization({ iceLevel: e.iceLevel ?? undefined, sugarLevel: e.sugarLevel ?? undefined, toppings: e.toppings ?? undefined })} _(#${e.orderId})_`
    )
  }

  if (didntOrder.length > 0) {
    lines.push(`\n*Didn't order:* ${didntOrder.map((id) => `<@${id}>`).join(', ')}`)
  }

  lines.push(`\n<@${initiatorId}> — please place the order! 🧋`)
  return lines.join('\n')
}
