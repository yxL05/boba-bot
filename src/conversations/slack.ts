import { Conversation, Autonomous, z, configuration, actions } from '@botpress/runtime'
import { formatStores } from './store'
import { listStores } from '../tables/store'
import { formatMenu } from './menu'
import { getMenu } from '../tables/menu'

const stripMention = (message: string) => message.replace(/^<@[^>]*>\s*/, '').trim()

export default new Conversation({
  channel: 'slack.channel',

  handler: async (props) => {
    if (props.type !== 'message') return

    if (props.message.tags['slack:channelId'] !== configuration.channelId) return

    if (props.message.type !== 'text') return

    const payload = stripMention(props.message.payload.text)
    const { category } = await actions.classifyCommand({ payload })

    async function sendText(text: string) {
      await props.conversation.send({
        type: 'text',
        payload: { text },
      })
    }

    switch (category) {
      case 'getCbo':
        await sendText('The Chief Boba Officer is whoever orders the most.')
        break
      case 'listStores':
        await sendText(formatStores(await listStores()))
        break
      case 'getMenu':
        const { name } = await actions.extractStore({ payload })
        if (!name) {
          sendText('Please provide a non-empty store name')
          break
        }

        const store = await actions.parseStore({ name })
        if (!store) {
          sendText(`Could not find a store with name (interpreted as) "${name}"`)
          break
        }

        sendText(formatMenu(await getMenu(store.id), store.name))
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
