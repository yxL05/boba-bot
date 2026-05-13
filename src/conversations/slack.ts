import { Conversation, z, configuration, actions, bot } from '@botpress/runtime'
import { finalizeOrders } from '../utils/finalize-orders'
import { formatStores } from './store'
import { listStores, StoreResponse } from '../tables/store'
import {
  formatVote,
  formatOrderConfirmation,
  formatOrderDetails,
} from './menu'
import { orderTable } from '../tables/order'
import { VoteTimeout } from '../workflows/vote-timeout'

const stripMention = (message: string) => message.replace(/^<@[^>]*>\s*/, '').trim()

export default new Conversation({
  channel: 'slack.channel',

  handler: async (props) => {
    if (props.type !== 'message') return

    if (props.message.tags['slack:channelId'] !== configuration.channelId) return

    if (props.message.type !== 'text') return

    console.log(`Bot state: ${JSON.stringify(bot.state)}`)

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

        await sendText(`Here's the menu for *${store.name}*: ${store.menuUrl}`)
        break
      }
      case 'vote': {
        if (bot.state.order) {
          await sendText(
            `An order session is currently in progress for *${bot.state.order.storeName}*. Please wait for it to finish before starting a new vote.`
          )
          break
        }

        if (bot.state.vote) {
          await sendText(
            `A vote is already in progress for *${bot.state.vote.storeName}*. Please wait for it to finish before starting a new one.`
          )
          break
        }

        const voteStore = await resolveStore({ payload })
        if (!voteStore) break

        const { minBuyers, timeLimit } = await actions.extractVoteParams({ payload })

        if (!minBuyers) {
          await sendText('Please provide a minimum number of buyers (e.g., "5 min buyers").')
          break
        }

        if (!timeLimit) {
          await sendText('Please provide a time limit for the vote (e.g., "10 minutes").')
          break
        }

        const voteMessage = await props.conversation.send({
          type: 'text',
          payload: { text: formatVote(voteStore.name, minBuyers, timeLimit) },
        })

        bot.state.vote = {
          storeId: voteStore.id,
          storeName: voteStore.name,
          minBuyers,
          timeLimit,
          conversationId: props.conversation.id,
          messageId: voteMessage.id,
          reactors: [],
          initiatorId: props.message.userId,
        }

        await VoteTimeout.start({
          conversationId: props.conversation.id,
          timeLimitMs: timeLimit,
          storeName: voteStore.name,
          menuUrl: voteStore.menuUrl,
        })

        break
      }
      case 'order': {
        const { intent, qty, itemName, orderId, description } = await actions.extractOrderParams({ payload })
        const userId = props.message.userId

        if (intent === 'place') {
          if (!bot.state.order) {
            await sendText('No ordering session is currently active. Start a vote first!')
            break
          }

          if (!itemName) {
            await sendText('Please specify a drink name (e.g., "Order 2 Pearl Milk Tea with less ice").')
            break
          }

          const orderQty = qty ?? 1
          const { rows: inserted } = await orderTable.createRows({
            rows: [
              {
                memberId: userId,
                itemName,
                qty: orderQty,
                iceLevel: description?.iceLevel,
                sugarLevel: description?.sugarLevel,
                size: description?.size,
                toppings: description?.toppings,
              },
            ],
          })

          const newOrderId = inserted[0].id
          bot.state.order = {
            ...bot.state.order,
            placedOrderIds: [...bot.state.order.placedOrderIds, newOrderId],
          }

          await sendText(formatOrderConfirmation(newOrderId, itemName, orderQty, description))
          break
        }

        if (intent === 'view') {
          if (!orderId) {
            await sendText('Please provide an order number (e.g., "View order 42").')
            break
          }

          const order = await orderTable.getRow({ id: orderId })
          if (!order || order.memberId !== userId) {
            await sendText(`Order #${orderId} not found or does not belong to you.`)
            break
          }

          await sendText(
            formatOrderDetails(orderId, order.itemName, order.qty, {
              iceLevel: order.iceLevel ?? undefined,
              sugarLevel: order.sugarLevel ?? undefined,
              size: order.size ?? undefined,
              toppings: order.toppings ?? undefined,
            })
          )
          break
        }

        if (intent === 'cancel') {
          if (!bot.state.order) {
            await sendText('The ordering window has already closed. Orders can only be cancelled while the session is active.')
            break
          }

          if (!orderId) {
            await sendText('Please provide an order number to cancel (e.g., "Cancel order 42").')
            break
          }

          const order = await orderTable.getRow({ id: orderId })
          if (!order || order.memberId !== userId) {
            await sendText(`Order #${orderId} not found or does not belong to you.`)
            break
          }

          await orderTable.deleteRowIds([orderId])
          bot.state.order = {
            ...bot.state.order,
            placedOrderIds: bot.state.order.placedOrderIds.filter((id) => id !== orderId),
          }

          await sendText(`Order *#${orderId}* has been cancelled.`)
          break
        }

        if (intent === 'cancelAll') {
          if (!bot.state.order) {
            await sendText('The ordering window has already closed. Orders can only be cancelled while the session is active.')
            break
          }

          const allOrders = (await Promise.all(bot.state.order.placedOrderIds.map((id) => orderTable.getRow({ id })))).filter(Boolean)
          const myOrders = allOrders.filter((o) => o.memberId === userId)

          if (myOrders.length === 0) {
            await sendText("You don't have any orders to cancel.")
            break
          }

          const myOrderIdSet = new Set(myOrders.map((o) => o.id))
          await orderTable.deleteRowIds([...myOrderIdSet])
          bot.state.order = {
            ...bot.state.order,
            placedOrderIds: bot.state.order.placedOrderIds.filter((id) => !myOrderIdSet.has(id)),
          }

          await sendText(`Cancelled ${myOrders.length} order${myOrders.length === 1 ? '' : 's'}.`)
          break
        }

        if (intent === 'viewAll') {
          if (!bot.state.order) {
            await sendText('No active ordering session.')
            break
          }

          const myOrderIds = bot.state.order.placedOrderIds
          if (myOrderIds.length === 0) {
            await sendText("You haven't placed any orders yet.")
            break
          }

          const allOrders = (await Promise.all(myOrderIds.map((id) => orderTable.getRow({ id })))).filter(Boolean)
          const myOrders = allOrders.filter((o) => o.memberId === userId)

          if (myOrders.length === 0) {
            await sendText("You haven't placed any orders yet.")
            break
          }

          const lines = myOrders.map((o) => {
            const customStr = [o.iceLevel, o.sugarLevel, o.size, o.toppings].filter(Boolean).join(', ')
            return `• *#${o.id}*: ${o.qty}x ${o.itemName}${customStr ? ` (${customStr})` : ''}`
          })

          await sendText(`*Your orders for ${bot.state.order.storeName}:*\n${lines.join('\n')}`)
          break
        }

        break
      }
      case 'stopOrder': {
        if (!bot.state.order) {
          await sendText('No ordering session is currently active.')
          break
        }

        if (props.message.userId !== bot.state.order.initiatorId) {
          await sendText('Only the person who initiated the vote can stop the ordering session early.')
          break
        }

        const { placedOrderIds, buyers, initiatorId, storeName } = bot.state.order
        bot.state.order = null

        const summary = await finalizeOrders({ storeName, placedOrderIds, buyers, initiatorId })
        await sendText(summary)
        break
      }
      default:
        await sendText(
          [
            "I'm not sure I understood your request. Here are the accepted prompts:",
            '• `Who is the Chief Boba Officer?`',
            '• `What are the available stores?`',
            '• `What is the menu for [store]?`',
            '• `Start a vote for boba day at [store] with [#] min buyers and a time limit of [time]`',
            '• `Order [qty] [drink name] with [customization]`',
            '• `View order [#]` / `View all my orders`',
            '• `Cancel order [#]` / `Cancel all my orders`',
            '• `Stop the order session`',
          ].join('\n')
        )
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
