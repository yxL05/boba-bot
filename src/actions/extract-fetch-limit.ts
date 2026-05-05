import { Action, adk, z } from '@botpress/runtime'
import { getMenu, menuItemResponseSchema } from '../tables/menu'

export const extractFetchLimit = new Action({
  name: 'extractFetchLimit',
  description: 'Extracts the number of results to fetch in a query from a payload',

  input: z.object({
    payload: z.string().describe('The raw incoming payload'),
  }),

  output: z.object({
    limit: z.number().optional().describe('The extracted limit'),
  }),

  handler: async (props) => {
    const payload = props.input.payload

    const result = await adk.zai.extract(
      payload,
      z.object({
        numberOfElementsToFetch: z.number().optional(),
      })
    )

    return { limit: result.numberOfElementsToFetch }
  },
})
