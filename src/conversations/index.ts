import { Conversation, Autonomous, z, configuration, actions } from '@botpress/runtime'

export const SlackHandler = new Conversation({
  channel: 'slack.channel',

  handler: async (props) => {
    if (props.type !== 'message') return

    if (props.message.tags['slack:channelId'] !== configuration.channelId) return

    if (props.message.type !== 'text') return

    const { category } = await actions.classifyCommand({ message: props.message.payload.text })

    switch (category) {
      case 'who-is-the-cbo':
        await props.conversation.send({
          type: 'text',
          payload: { text: 'The Chief Boba Officer is just your average Chinese intern.' },
        })
        break
    }
  },
})
