import { Table, z } from '@botpress/runtime'

export const OrderTable = new Table({
  name: 'OrderTable',
  description: 'List of placed orders. Erased after one week',

  columns: {
    memberId: z.string().describe('Slack member ID of the person who placed the order'),
    itemId: z.number().describe('ID of the item that was ordered'),
    options: z
      .string()
      .optional()
      .describe('Description of the options for the ordered item (e.g., ice / sugar level)'),
  },
})
