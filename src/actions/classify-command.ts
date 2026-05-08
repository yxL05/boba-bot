import { Action, z, adk, configuration, bot } from '@botpress/runtime'

const commandTypes = ['getCbo', 'listStores', 'getMenu', 'recommend', 'vote', 'order', 'stopOrder'] as const

const commandDescs: Record<(typeof commandTypes)[number], string> = {
  getCbo: 'asks who is the Chief Boba Officer',
  listStores: 'asks for the list of available stores',
  getMenu: 'asks for a store menu',
  recommend: 'asks for a drink recommendation',
  vote: 'request to start a vote',
  order: 'request related to viewing / deleting / placing an order',
  stopOrder: 'request to stop or end the current ordering session early',
}

// const stripMention = (message: string) => message.replace(/^<@[^>]*>\s*/, '').trim()

export default new Action({
  name: 'classifyCommand',
  description: 'Classifies an incoming command based on its syntax',

  input: z.object({
    payload: z.string().describe('The raw help command payload'),
  }),

  output: z.object({
    category: z.enum(commandTypes).nullable().describe('The classified category'),
  }),

  handler: async (props) => {
    const payload = props.input.payload
    console.log(`Payload received: ${payload}`)

    const { output: labels } = await adk.zai.label(payload, commandDescs).result()

    const possible = commandTypes.filter((c) => labels[c].value)
    if (possible.length === 0) {
      return { category: null }
    }

    const best = possible.sort((a, b) => labels[b].confidence - labels[a].confidence)[0]
    const confidence = labels[best].confidence
    console.log(`Most likely category: ${best}, confidence: ${confidence}`)

    const category = confidence >= configuration.confidenceThreshold ? best : null

    return { category }
  },
})
