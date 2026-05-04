import { Conversation, Autonomous, z, configuration, actions } from '@botpress/runtime'
import { formatStores } from './store'
import { listStores } from '../tables/store'

export default new Conversation({
  channel: 'slack.channel',

  handler: async (props) => {
    if (props.type !== 'message') return

    if (props.message.tags['slack:channelId'] !== configuration.channelId) return

    if (props.message.type !== 'text') return

    const { category } = await actions.classifyCommand({ message: props.message.payload.text })

    async function sendText(text: string) {
      await props.conversation.send({
        type: 'text',
        payload: { text },
      })
    }

    switch (category) {
      case 'getCbo':
        await sendText('The Chief Boba Officer is just your average Chinese intern.')
        break
      case 'listStores':
        await sendText(formatStores(await listStores()))
        break
      case 'getMenu':
        break
      case 'recommend':
        break
      case 'getTop':
        break
      case 'vote':
        break
      case 'order':
        break
      default:
        await sendText("I'm not sure I understood your request. Can you reformulate it?")
    }
  },
})
