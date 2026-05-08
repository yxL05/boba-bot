import { Action, bot, z } from '@botpress/runtime'

export const clearVote = new Action({
  name: 'clearVote',
  description: 'Clears the active vote state. Use this from the dashboard if a vote gets stuck.',

  input: z.object({}),
  output: z.object({}),

  handler: async () => {
    console.log(`Clearing vote state (was: ${JSON.stringify(bot.state.vote)})`)
    bot.state.vote = null
    return {}
  },
})
