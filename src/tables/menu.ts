import { Table, z } from '@botpress/runtime'

const menuItemSchema = z.object({
  id: z.number().describe('Menu item ID'),
  storeId: z.number().describe('ID of the store from which the drink comes from'),
  name: z.string().describe('Name of the drink'),
  price: z.number().optional().describe('Price of the drink'),
  description: z.string().optional().describe('Description of the drink'),
  ordered: z.number().default(0).describe('Number of times this drink has been ordered'),
  available: z.boolean().default(true).describe('If a drink is currently available'),
})

export const menuTable = new Table({
  name: 'MenuTable',
  description: 'Drink menu',

  columns: {
    storeId: menuItemSchema.shape.storeId,
    name: {
      searchable: true,
      schema: menuItemSchema.shape.name,
    },
    price: menuItemSchema.shape.price,
    description: {
      searchable: true,
      schema: menuItemSchema.shape.description,
    },
    ordered: menuItemSchema.shape.ordered,
    available: menuItemSchema.shape.available,
  },
})

export const menuItemResponseSchema = menuItemSchema.pick({
  id: true,
  name: true,
  price: true,
  description: true,
  ordered: true,
})

export type MenuItemResponse = z.infer<typeof menuItemResponseSchema>

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

export async function getTopItems(limit: number, storeId?: number): Promise<MenuItemResponse[]> {
  const { rows: items } = await menuTable.findRows({
    filter: {
      storeId,
      available: true,
    },
    orderBy: 'ordered',
    orderDirection: 'desc',
    limit,
  })

  return items.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    description: i.description,
    ordered: i.ordered,
  }))
}
