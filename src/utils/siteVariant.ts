export type SiteVariant = 'usual' | 'order'

export function getSiteVariant(): SiteVariant {
  if (typeof window === 'undefined') {
    return 'usual'
  }

  const searchParams = new URLSearchParams(window.location.search)
  return searchParams.get('site') === 'order' ? 'order' : 'usual'
}
