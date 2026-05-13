import { Table, z } from '@botpress/runtime'

const storeSchema = z.object({
  id: z.number().describe('Store ID'),
  name: z.string().describe('Name of the store'),
  menuUrl: z.string().describe('URL of the store menu page'),
})

export const storeTable = new Table({
  name: 'StoreTable',
  description: 'List of available stores',

  columns: storeSchema.omit({ id: true }).shape,
})

export const storeResponseSchema = storeSchema.pick({
  id: true,
  name: true,
  menuUrl: true,
})
export type StoreResponse = z.infer<typeof storeResponseSchema>

export async function listStores(): Promise<StoreResponse[]> {
  const { rows: stores } = await storeTable.findRows({})
  return stores.map((s) => ({
    id: s.id,
    name: s.name,
    menuUrl: s.menuUrl,
  }))
}
