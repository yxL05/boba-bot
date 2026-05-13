import { Table, z } from '@botpress/runtime'

export const orderTable = new Table({
  name: 'OrderTable',
  description: 'List of placed orders. Erased after one week',

  columns: {
    memberId: z.string().describe('Botpress user ID of the person who placed the order'),
    itemName: z.string().describe('Name of the item that was ordered'),
    qty: z.number().default(1).describe('Quantity ordered'),
    iceLevel: z.string().optional().describe('Ice level preference (e.g. "regular", "less ice", "no ice", "hot")'),
    sugarLevel: z.string().optional().describe('Sugar level preference (e.g. "regular", "half sugar", "no sugar")'),
    size: z.string().optional().describe('Drink size (e.g. "small", "medium", "large")'),
    toppings: z.string().optional().describe('Requested toppings (e.g. "pearls, grass jelly")'),
  },
})
