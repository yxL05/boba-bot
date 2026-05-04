import { Table, z } from '@botpress/runtime'

export const StoreTable = new Table({
  name: 'StoreTable',
  description: 'List of available stores',

  columns: {
    name: z.string().describe('Name of the store'),
    menuUrl: z.string().url().describe("URL of the store's web menu to be crawled"),
  },
})

export type StoreResponse = {
  name: string
}

export async function listStores(): Promise<StoreResponse[]> {
  const { rows } = await StoreTable.findRows({})
  return rows.map((r) => ({
    name: r.name,
  }))
}
