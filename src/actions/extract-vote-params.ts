import { Action, adk, z } from '@botpress/runtime'

export const extractVoteParams = new Action({
  name: 'extractVoteParams',
  description: 'Extracts the parameters for a boba day vote from a payload',

  input: z.object({
    payload: z.string().describe('The raw incoming payload'),
  }),

  output: z.object({
    minBuyers: z.number().optional().describe('Minimum number of buyers required for the vote to succeed'),
    timeLimit: z.number().optional().describe('Time limit for the vote in milliseconds'),
  }),

  handler: async (props) => {
    const payload = props.input.payload

    const result = await adk.zai.extract(
      payload,
      z.object({
        minBuyers: z.number().optional().describe('Minimum number of buyers'),
        timeLimitMs: z
          .number()
          .optional()
          .describe('Time limit converted to milliseconds (e.g. "10 minutes" → 600000, "1 hour" → 3600000)'),
      })
    )

    console.log(`Extracted vote params: minBuyers=${result.minBuyers}, timeLimitMs=${result.timeLimitMs}`)

    return {
      minBuyers: result.minBuyers,
      timeLimit: result.timeLimitMs,
    }
  },
})
