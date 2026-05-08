import { Action, adk, z } from '@botpress/runtime'

export const extractOrderParams = new Action({
  name: 'extractOrderParams',
  description: 'Extracts intent and parameters from an order-related message',

  input: z.object({
    payload: z.string().describe('The raw incoming message'),
  }),

  output: z.object({
    intent: z.enum(['place', 'view', 'cancel', 'cancelAll', 'viewAll']),
    qty: z.number().optional().describe('Quantity to order'),
    drinkNumber: z.number().optional().describe('Menu item ID'),
    orderId: z.number().optional().describe('Confirmation number for view or cancel'),
    description: z
      .object({
        iceLevel: z.string(),
        sugarLevel: z.string(),
        toppings: z.string(),
      })
      .optional()
      .describe('Drink customization options'),
  }),

  handler: async ({ input }) => {
    const result = await adk.zai.extract(
      input.payload,
      z.object({
        intent: z.enum(['place', 'view', 'cancel', 'cancelAll', 'viewAll']).describe(
          '"place"=placing a new order, "view"=viewing a specific order by confirmation #, "cancel"=cancelling a specific order by confirmation #, "cancelAll"=cancelling all of the user\'s orders, "viewAll"=viewing all of the user\'s current orders'
        ),
        qty: z.number().optional().describe('Quantity to order (e.g. "2 no. 5" → qty=2; defaults to 1 if unspecified)'),
        drinkNumber: z
          .number()
          .optional()
          .describe('The drink number from the menu (e.g. "no. 5" → 5, "number 3" → 3)'),
        orderId: z
          .number()
          .optional()
          .describe('The confirmation/order number to view or cancel (e.g. "order 42" → 42)'),
        description: z
          .object({
            iceLevel: z.string().describe('Ice level preference (e.g. "regular", "less ice", "no ice")'),
            sugarLevel: z.string().describe('Sugar level preference (e.g. "regular", "half sugar", "no sugar")'),
            toppings: z.string().describe('Requested toppings as a comma-separated string, or empty string if none'),
          })
          .optional()
          .describe('Drink customization for a "place" intent'),
      })
    )

    console.log(`Extracted order params: ${JSON.stringify(result)}`)
    return result
  },
})
