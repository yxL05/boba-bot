import { Trigger, actions } from '@botpress/runtime'

type ReactionPayload = {
  userId?: string
  targets: { channel?: Record<string, string> }
}

export const onReactionAdded = new Trigger({
  name: 'onReactionAdded',
  description: 'Tracks reactions on the active vote message',
  events: ['slack:reactionAdded'],

  handler: async ({ event }) => {
    const { userId, targets } = event.payload as ReactionPayload
    if (!userId) return

    console.log(`userId: ${userId}, targets: ${targets.channel ? Object.entries(targets.channel) : ''}`)

    await actions.recordVoteReaction({
      userId,
      channelTargets: targets.channel ?? {},
      type: 'added',
    })
  },
})

export const onReactionRemoved = new Trigger({
  name: 'onReactionRemoved',
  description: 'Removes a reactor from the active vote when they un-react',
  events: ['slack:reactionRemoved'],

  handler: async ({ event }) => {
    const { userId, targets } = event.payload as ReactionPayload
    if (!userId) return

    await actions.recordVoteReaction({
      userId,
      channelTargets: targets.channel ?? {},
      type: 'removed',
    })
  },
})
