import { Action, adk, z } from '@botpress/runtime'
import { getMenu, menuItemResponseSchema } from '../tables/menu'

export const extractCriteria = new Action({
  name: 'extractCriteria',
  description: 'Extracts the criteria from an incoming recommendation request',

  input: z.object({
    payload: z.string().describe('The raw incoming payload'),
  }),

  output: z.object({
    criteria: z.string().optional().describe('The extracted criteria'),
  }),

  handler: async (props) => {
    const payload = props.input.payload

    const result = await adk.zai.extract(
      payload,
      z.object({
        recommendationCriteria: z.string().optional(),
      })
    )
    if (
      !result.recommendationCriteria ||
      (await adk.zai.check(
        result.recommendationCriteria,
        'Is this description vacuous (e.g., empty, saying "idk", or has no meaning)?'
      ))
    ) {
      return {}
    }

    console.log(`Extracted recommendation criteria: ${result.recommendationCriteria}`)
    return { criteria: result.recommendationCriteria }
  },
})

export const generateRecommendation = new Action({
  name: 'generateRecommendation',
  description: 'Generates a recommendation based on a description',

  input: z.object({
    storeId: z.number().describe('The ID of the store for which the recommendation was requested'),
    criteria: z.string().optional().describe('The criteria of the recommendation request'),
  }),

  output: z.object({
    item: menuItemResponseSchema.describe('The recommended item'),
  }),

  handler: async (props) => {
    const { storeId, criteria } = props.input

    const items = await getMenu(storeId)

    if (!criteria) {
      return { item: items[Math.floor(Math.random() * items.length)] }
    }

    return {
      item: (
        await adk.zai.sort(
          items,
          `by how well the drink fits this recommendation criteria: ${criteria}. Best fit first, worst fit last`
        )
      )[0],
    }
  },
})
