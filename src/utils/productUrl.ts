import type { SiteVariant } from './siteVariant'

export function getProductUrl(productId: string, siteVariant: SiteVariant = 'usual') {
  return `/products/${productId}${siteVariant === 'order' ? '?site=order' : ''}`
}
