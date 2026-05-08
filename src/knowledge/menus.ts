import { Knowledge, DataSource } from '@botpress/runtime'

// Manually maintained — add/remove entries to match the StoreTable.
// The storeId must match the row ID in StoreTable.
// When you add a store to the table, add its entry here and re-deploy.
export type StoreMenuSource = { storeId: number; menuUrl: string }

export const STORE_MENU_SOURCES: StoreMenuSource[] = [
  { storeId: 1, menuUrl: 'https://machimachi.ca/menu/' },
  { storeId: 2, menuUrl: 'https://shuyi.ca/menu' },
]

export const MenusKnowledgeBase = new Knowledge({
  name: 'menusKB',
  description: "Boba store menus indexed from each store's web menu page, re-indexed every Friday",
  sources: STORE_MENU_SOURCES.map(({ storeId, menuUrl }) =>
    DataSource.Website.fromUrls([menuUrl], { id: `store-${storeId}` })
  ),
})
