import { Action, z, adk } from '@botpress/runtime'

const commandTypes = ['who-is-the-cbo'] as const

const stripMention = (message: string) => message.replace(/^<@[^>]*>\s*/, '').trim()

export default new Action({
  name: 'classifyCommand',
  description: 'Classifies an incoming command based on its syntax.',

  input: z.object({
    message: z.string().describe('The raw help command message text'),
  }),

  output: z.object({
    category: z.enum(commandTypes).nullable(),
  }),

  handler: async (props) => {
    const payload = stripMention(props.input.message)
    console.log(`Received command: ${payload}`)

    if (payload.toLowerCase() === 'who is the cbo') {
      return { category: 'who-is-the-cbo' as const }
    }

    return { category: null }
  },
})
