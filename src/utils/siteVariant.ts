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
