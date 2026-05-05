import { Action, adk, z } from '@botpress/runtime'
import { listStores, storeResponseSchema } from '../tables/store'

export const extractStore = new Action({
  name: 'extractStore',
  description: 'Extracts the store name from an incoming payload',

  input: z.object({
    payload: z.string().describe('The raw incoming payload'),
  }),

  output: z.object({
    name: z.string().optional().describe('The extracted store name'),
  }),

  handler: async (props) => {
    const payload = props.input.payload

    const result = await adk.zai.extract(
      payload,
      z.object({
        storeName: z.string().optional(),
      })
    )
    if (!result.storeName) return {}

    console.log(`Extracted store name: ${result.storeName}`)
    return { name: result.storeName }
  },
})

export const parseStore = new Action({
  name: 'parseStore',
  description: 'Parses an incoming store name',

  input: z.object({
    name: z.string().describe('The incoming store name'),
  }),

  output: storeResponseSchema.nullable(),

  handler: async (props) => {
    const name = props.input.name
    const stores = await listStores()

    const possible = await adk.zai.filter(stores, `Is "${name}" likely referring to this store name?`)
    if (possible.length === 0) {
      return null
    }

    const best =
      possible.length === 1
        ? possible[0]
        : (await adk.zai.sort(possible, `By likeliness that "${name} is referring to this store name`))[0]

    console.log(`Recognizing "${name}" as store name "${best.name}" with id ${best.id}`)
    return best
  },
})
