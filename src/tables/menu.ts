import { Table, z } from '@botpress/runtime'

export const StoreTable = new Table({
  name: 'StoreTable',
  description: 'List of available stores',

  columns: {
    name: z.string().describe('Name of the store'),
    menuUrl: z.string().url().describe("URL of the store's web menu to be crawled"),
  },
})

export const MenuTable = new Table({
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
  },
})
