import { Conversation, Autonomous, z, configuration, actions } from '@botpress/runtime'
import { formatStores } from './store'
import { listStores, StoreResponse } from '../tables/store'
import { formatMenu, formatRecommendation } from './menu'
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

    switch (category) {
      case 'getCbo': {
        await sendText('The Chief Boba Officer is whoever orders the most.')
        break
      }
      case 'listStores': {
        await sendText(formatStores(await listStores()))
        break
      }
      case 'getMenu': {
        const store = await resolveStore(payload)
        if (!store) break

        await sendText(formatMenu(await getMenu(store.id), store.name))
        break
      }
      case 'recommend': {
        const store = await resolveStore(payload)
        if (!store) break

        const { criteria } = await actions.extractCriteria({ payload })

        const { item } = await actions.generateRecommendation({
          storeId: store.id,
          criteria,
        })

        await sendText(formatRecommendation(item))
        break
      }
      case 'getTop':
        break
      case 'vote':
        break
      case 'order':
        break
      default:
        await sendText("I'm not sure I understood your request. Can you reformulate it?")
    }

    async function sendText(text: string) {
      await props.conversation.send({
        type: 'text',
        payload: { text },
      })
    }

    async function resolveStore(payload: string): Promise<StoreResponse | undefined> {
      const { name } = await actions.extractStore({ payload })
      if (!name) {
        await sendText('Please provide a non-empty store name')
        return
      }

      const store = await actions.parseStore({ name })
      if (!store) {
        await sendText(`Could not find a store with name (interpreted as) "${name}"`)
        return
      }

      return store
    }
  },
})
