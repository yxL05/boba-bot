import { Workflow, z, bot, Conversation, configuration } from '@botpress/runtime'
import { formatVoteExpired, formatVoteSuccess } from '../conversations/menu'
import { OrderTimeout } from './order-timeout'

export const VoteTimeout = new Workflow({
  name: 'voteTimeout',
  description: 'Resolves the vote after the time limit: success if threshold met, failure otherwise',

  input: z.object({
    conversationId: z.string(),
    timeLimitMs: z.number(),
    storeName: z.string(),
    menuUrl: z.string(),
  }),

  output: z.object({}),

  handler: async ({ input, step }) => {
    await step.sleep('wait-for-vote', input.timeLimitMs)

    const { vote } = bot.state
    if (!vote) return {}

    const conversation = await Conversation.get(input.conversationId)
    const succeeded = vote.reactors.length >= vote.minBuyers - 1

    if (!succeeded) {
      bot.state.vote = null
      await conversation.send({ type: 'text', payload: { text: formatVoteExpired(input.storeName) } })
      return {}
    }

    const orderTimeMs = configuration.orderTime ?? 1_800_000
    const deadlineMs = Date.now() + orderTimeMs
    const buyers = [vote.initiatorId, ...vote.reactors]
    const sessionId = `${input.conversationId}-${deadlineMs}`

    bot.state.vote = null
    bot.state.order = {
      sessionId,
      storeId: vote.storeId,
      storeName: vote.storeName,
      conversationId: input.conversationId,
      initiatorId: vote.initiatorId,
      buyers,
      deadlineMs,
      placedOrderIds: [],
    }

    await OrderTimeout.start({
      sessionId,
      conversationId: input.conversationId,
      storeName: vote.storeName,
      initiatorId: vote.initiatorId,
      buyers,
      deadlineMs,
    })

    await conversation.send({ type: 'text', payload: { text: formatVoteSuccess(input.storeName, orderTimeMs, input.menuUrl) } })

    return {}
  },
})
