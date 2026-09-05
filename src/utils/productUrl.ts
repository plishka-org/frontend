export function getBasePath() {
  return import.meta.env.BASE_URL.replace(/\/$/, '')
}

function getRouteUrl(path: string, useHashRoute = false) {
  const basePath = getBasePath()
  const documentPath = basePath ? `${basePath}/` : '/'
  const routePath = path === '/' ? '/' : path
  const hashRoute = useHashRoute ? `#${routePath}` : ''

  return `${documentPath}${hashRoute}`
}

export function getAppPath(pathname: string, hash = '') {
  if (hash.startsWith('#/')) {
    return hash.slice(1).split('?')[0] || '/'
  }

  const basePath = getBasePath()

  if (basePath && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length) || '/'
  }

  return pathname
}

export function getHomeUrl() {
  return getRouteUrl('/')
}

export function getGalleryUrl() {
  return getRouteUrl('/gallery', true)
}

export function getAboutUrl() {
  return getRouteUrl('/about', true)
}

export function getReviewsUrl() {
  return getRouteUrl('/reviews', true)
}

export function getFavoritesUrl() {
  return getRouteUrl('/favorites', true)
}

export function getProductUrl(productId: string) {
  return getRouteUrl(`/products/${productId}`, true)
}

export function getAccountUrl(subpath: 'orders' | 'requests' | 'settings' = 'settings') {
  return `#/account/${subpath}`
}
