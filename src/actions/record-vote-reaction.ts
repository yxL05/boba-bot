import { Action, bot, z } from '@botpress/runtime'

export const recordVoteReaction = new Action({
  name: 'recordVoteReaction',
  description: 'Records a vote reaction (add or remove) against the active vote',

  input: z.object({
    userId: z.string().describe('Botpress user ID of the reactor'),
    channelTargets: z.record(z.string()).describe('Channel targets map from the reaction event'),
    type: z.enum(['added', 'removed']).describe('Whether the reaction was added or removed'),
  }),

  output: z.object({}),

  handler: async ({ input }) => {
    const { vote } = bot.state
    if (!vote) return {}

    if (input.userId === vote.initiatorId) {
      console.log(`Vote reaction from initiator ${input.userId} ignored`)
      return {}
    }

    if (input.type === 'added') {
      if (vote.reactors.includes(input.userId)) {
        console.log(`Vote reaction from ${input.userId} ignored (duplicate)`)
        return {}
      }
      const newReactors = [...vote.reactors, input.userId]
      bot.state.vote = { ...vote, reactors: newReactors }
      console.log(
        `Vote reaction added by ${input.userId}. Reactors (${newReactors.length}/${vote.minBuyers - 1} needed): ${JSON.stringify(newReactors)}`
      )
    } else {
      const newReactors = vote.reactors.filter((id) => id !== input.userId)
      bot.state.vote = { ...vote, reactors: newReactors }
      console.log(
        `Vote reaction removed by ${input.userId}. Reactors (${newReactors.length}/${vote.minBuyers - 1} needed): ${JSON.stringify(newReactors)}`
      )
    }

    return {}
  },
})
