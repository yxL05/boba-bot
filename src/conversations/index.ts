import { Conversation, Autonomous, z, configuration, actions } from '@botpress/runtime'

export const SlackHandler = new Conversation({
  channel: 'slack.channel',

  handler: async (props) => {
    if (props.type !== 'message') return

    if (props.message.tags['slack:channelId'] !== configuration.channelId) return

    if (props.message.type !== 'text') return

    const { category } = await actions.classifyCommand({ message: props.message.payload.text })

    switch (category) {
      case 'getCbo':
        await props.conversation.send({
          type: 'text',
          payload: { text: 'The Chief Boba Officer is just your average Chinese intern.' },
        })
        break
      case 'listStores':
        await props.conversation.send({
          type: 'text',
          payload: { text: 'listStores' },
        })
        break
      case 'getMenu':
        await props.conversation.send({
          type: 'text',
          payload: { text: 'getMenu' },
        })
        break
      case 'recommend':
        await props.conversation.send({
          type: 'text',
          payload: { text: 'recommend' },
        })
        break
      case 'getTop':
        await props.conversation.send({
          type: 'text',
          payload: { text: 'getTop' },
        })
        break
      case 'vote':
        await props.conversation.send({
          type: 'text',
          payload: { text: 'vote' },
        })
        break
      case 'order':
        await props.conversation.send({
          type: 'text',
          payload: { text: 'order' },
        })
        break
      default:
        await props.conversation.send({
          type: 'text',
          payload: { text: "I'm not sure I understood your request. Can you reformulate it?" },
        })
    }
  },
})
