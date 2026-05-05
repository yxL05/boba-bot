import { MenuItemResponse } from '../tables/menu'

export function formatMenu(items: MenuItemResponse[], storeName: string): string {
  const header = `**${storeName} Menu**\n`

  const body = items
    .map((item) => {
      const price = item.price != null ? ` - $${item.price.toFixed(2)}` : ''
      const desc = item.description ? `\n_${item.description}_` : ''
      const ordered = `\nOrdered ${item.ordered} times`

      return `**${item.id}. ${item.name}**${price}${desc}${ordered}`
    })
    .join('\n\n')

  return header + body
}

export function formatRecommendation(item: MenuItemResponse): string {
  const price = item.price != null ? ` - $${item.price.toFixed(2)}` : ''
  const desc = item.description ? `\n_${item.description}_` : ''
  const ordered = `\nOrdered ${item.ordered} times`
  return `Based on your description, I would recommend drink #${item.id}: **${item.name}**${price}${desc}${ordered}.`
}

export function formatTopSellers(items: MenuItemResponse[]): string {
  if (!items || items.length === 0) {
    return '**Top sellers**\n\nNo top-selling items found.'
  }

  const lines = items.map((item, i) => {
    const descriptionLine = item.description ? `\n  *${item.description}*` : ''
    return `**${i + 1}. ${item.name}** [id: ${item.id}] — $${item.price}${descriptionLine}\n  Ordered: ${item.ordered}`
  })

  return `**Top sellers**\n\n${lines.join('\n\n')}`
}
