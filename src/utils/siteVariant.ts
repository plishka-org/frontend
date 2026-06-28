export type SiteVariant = 'usual' | 'order'

export const siteVariantFeatures = {
  usual: {
    showCartActions: false,
    showFavorites: true,
    showPrices: false,
  },
  order: {
    showCartActions: true,
    showFavorites: true,
    showPrices: true,
  },
} satisfies Record<
  SiteVariant,
  {
    showCartActions: boolean
    showFavorites: boolean
    showPrices: boolean
  }
>

export function getSiteVariant(): SiteVariant {
  return getRequestedSiteVariant() ?? 'usual'
}

export function getRequestedSiteVariant(): SiteVariant | null {
  if (typeof window === 'undefined') {
    return null
  }

  const searchParams = new URLSearchParams(window.location.search)
  const requestedSite = searchParams.get('site')

  if (requestedSite === 'order' || requestedSite === 'usual') {
    return requestedSite
  }

  return null
}
