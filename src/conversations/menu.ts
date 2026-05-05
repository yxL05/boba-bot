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
