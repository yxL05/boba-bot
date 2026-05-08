import { Workflow, z, adk } from '@botpress/runtime'
import { storeTable } from '../tables/store'
import { menuTable } from '../tables/menu'
import { orderTable } from '../tables/order'
import { MenusKnowledgeBase, STORE_MENU_SOURCES } from '../knowledge/menus'

export const MenuRefresh = new Workflow({
  name: 'menuRefresh',
  description: 'Re-indexes store menus via the KB, extracts items via Zai, and replaces the menu table rows',

  schedule: '59 23 * * 5', // Every Friday at 11:59 PM
  timeout: '2h',

  input: z.object({}),
  state: z.object({}),
  output: z.object({}),

  handler: async ({ step }) => {
    await step('refresh-kb', async () => {
      await MenusKnowledgeBase.refresh({ force: true })
    })

    // refresh() fires the crawl asynchronously — wait for it to complete before searching
    await step.sleep('wait-for-crawl', 10 * 60 * 1000)

    await step('update-menus', async () => {
      const { rows: stores } = await storeTable.findRows({})

      for (const store of stores) {
        const source = STORE_MENU_SOURCES.find((s) => s.storeId === store.id)
        if (!source) continue

        const { passages } = await MenusKnowledgeBase.search('drinks menu items prices', { limit: 50 })

        // Filter to passages from this store's URL only
        const content = passages
          .filter((p) => p.metadata.url === source.menuUrl)
          .map((p) => p.content)
          .join('\n\n')

        if (!content) continue

        const items = await adk.zai.extract(
          content,
          z.array(
            z.object({
              name: z.string().describe('Name of the drink'),
              price: z.number().optional().describe('Price in dollars, numeric only'),
              description: z.string().optional().describe('Description or flavors of the drink'),
              available: z.boolean().default(true).describe('Whether the drink is currently on the menu'),
            })
          ),
          { instructions: 'Extract every drink listed in this boba store menu. Include all items.' }
        )

        if (items.length === 0) continue

        await menuTable.deleteRows({ storeId: store.id })
        await menuTable.createRows({
          rows: items.map((item) => ({
            storeId: store.id,
            name: item.name,
            price: item.price,
            description: item.description,
            available: item.available ?? true,
          })),
        })
      }
    })

    await step('clear-orders', async () => {
      await orderTable.deleteAllRows()
    })

    return {}
  },
})
