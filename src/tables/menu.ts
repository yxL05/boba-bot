import { Table, z } from '@botpress/runtime'

export const menuTable = new Table({
  name: 'MenuTable',
  description: 'Drink menu',

  columns: {
    storeId: z.number().describe('ID of the store from which the drink comes from'),
    name: {
      searchable: true,
      schema: z.string().describe('Name of the drink'),
    },
    price: z.number().optional().describe('Price of the drink'),
    description: {
      searchable: true,
      schema: z.string().optional().describe('Description of the drink'),
    },
    ordered: z.number().default(0).describe('Number of times this drink has been ordered'),
    available: z.boolean().default(true).describe('If a drink is currently available'),
  },
})

export type MenuItemResponse = {
  id: number
  name: string
  price?: number
  description?: string
  ordered: number
}

export async function getMenu(storeId: number): Promise<MenuItemResponse[]> {
  const { rows: items } = await menuTable.findRows({
    filter: {
      storeId,
      available: true,
    },
  })

  return items.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    description: i.description,
    ordered: i.ordered,
  }))
}
