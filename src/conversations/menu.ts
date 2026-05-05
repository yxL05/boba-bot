import { MenuItemResponse } from '../tables/menu'

export function formatMenu(items: MenuItemResponse[], storeName: string): string {
  const header = `**${storeName} Menu**\n`

  const body = items
    .map((item) => {
      const price = item.price != null ? ` - $${item.price.toFixed(2)}` : ''
      const desc = item.description ? `\n_${item.description}_` : ''
      const ordered = `\nOrdered ${item.ordered} times`

      return `• **${item.name}**${price}${desc}${ordered}`
    })
    .join('\n\n')

  return header + body
}
