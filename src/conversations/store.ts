import { StoreResponse } from '../tables/store'

export function formatStores(stores: StoreResponse[]): string {
  return ['**Available Stores:**', '', ...stores.map((s) => `• *${s.name}*`)].join('\n')
}
