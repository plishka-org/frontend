import type { SiteVariant } from './siteVariant'

export function getBasePath() {
  return import.meta.env.BASE_URL.replace(/\/$/, '')
}

function withSiteVariant(path: string, siteVariant: SiteVariant, useHashRoute = false) {
  const basePath = getBasePath()
  const documentPath = basePath ? `${basePath}/` : '/'
  const routePath = path === '/' ? '/' : path
  const hashRoute = useHashRoute ? `#${routePath}` : ''

  return `${documentPath}${siteVariant === 'order' ? '?site=order' : ''}${hashRoute}`
}

export function getAppPath(pathname: string, hash = '') {
  if (hash.startsWith('#/')) {
    return hash.slice(1) || '/'
  }

  const basePath = getBasePath()

  if (basePath && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length) || '/'
  }

  return pathname
}

export function getHomeUrl(siteVariant: SiteVariant = 'usual') {
  return withSiteVariant('/', siteVariant)
}

export function getGalleryUrl(siteVariant: SiteVariant = 'usual') {
  return withSiteVariant('/gallery', siteVariant, true)
}

export function getAboutUrl(siteVariant: SiteVariant = 'usual') {
  return withSiteVariant('/about', siteVariant, true)
}

export function getReviewsUrl(siteVariant: SiteVariant = 'usual') {
  return withSiteVariant('/reviews', siteVariant, true)
}

export function getProductUrl(productId: string, siteVariant: SiteVariant = 'usual') {
  return withSiteVariant(`/products/${productId}`, siteVariant, true)
}

export function getAccountUrl(subpath: 'orders' | 'requests' | 'settings' = 'settings') {
  return `#/account/${subpath}`
}