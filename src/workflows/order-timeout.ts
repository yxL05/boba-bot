import { Workflow, z, bot, Conversation } from '@botpress/runtime'
import { finalizeOrders } from '../utils/finalize-orders'

export const OrderTimeout = new Workflow({
  name: 'orderTimeout',
  description: 'Closes the ordering window, updates order counts, and sends a summary to the channel',

  input: z.object({
    sessionId: z.string(),
    conversationId: z.string(),
    storeName: z.string(),
    initiatorId: z.string(),
    buyers: z.array(z.string()),
    deadlineMs: z.number(),
  }),

  output: z.object({}),

  handler: async ({ input, step }) => {
    await step.sleepUntil('wait-for-orders', new Date(input.deadlineMs))

    const { order } = bot.state
    if (!order || order.sessionId !== input.sessionId) return {} // stale workflow — a newer session is active or was already handled

    const { placedOrderIds, buyers, initiatorId } = order
    bot.state.order = null

    const conversation = await Conversation.get(input.conversationId)
    const text = await finalizeOrders({ storeName: input.storeName, placedOrderIds, buyers, initiatorId })
    await conversation.send({ type: 'text', payload: { text } })

    return {}
  },
})
