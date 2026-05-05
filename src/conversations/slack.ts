import { Conversation, Autonomous, z, configuration, actions } from '@botpress/runtime'
import { formatStores } from './store'
import { listStores, StoreResponse } from '../tables/store'
import { formatMenu, formatRecommendation, formatTopSellers } from './menu'
import { getMenu, getTopItems } from '../tables/menu'

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
        const store = await resolveStore({ payload })
        if (!store) break

        await sendText(formatMenu(await getMenu(store.id), store.name))
        break
      }
      case 'recommend': {
        const store = await resolveStore({ payload })
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
        const store = await resolveStore({ payload, warn: false })
        const { limit } = await actions.extractFetchLimit({ payload })
        await sendText(formatTopSellers(await getTopItems(limit ?? 10, store?.id)))
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

    async function resolveStore({
      payload,
      warn = true,
    }: {
      payload: string
      warn?: boolean
    }): Promise<StoreResponse | null> {
      const { name } = await actions.extractStore({ payload })
      if (!name) {
        if (warn) await sendText('Please provide a non-empty store name')
        return null
      }

      const store = await actions.parseStore({ name })
      if (!store) {
        if (warn) await sendText(`Could not find a store with name (interpreted as) "${name}"`)
        return null
      }

      return store
    }
  },
})
