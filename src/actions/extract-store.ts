import { Action, adk, z } from '@botpress/runtime'

export default new Action({
  name: 'extractStore',
  description: 'Extracts the store name from an incoming payload',

  input: z.object({
    payload: z.string().describe('The raw incoming payload'),
  }),

  output: z.object({
    name: z.string().nullable().describe('The extracted store name'),
  }),

  handler: async (props) => {
    const payload = props.input.payload

    const result = await adk.zai.extract(
      payload,
      z.object({
        storeName: z.string().optional(),
      })
    )
    if (!result.storeName) return { name: null }

    console.log(`Extracted store name: ${result.storeName}`)
    return { name: result.storeName }
  },
})
