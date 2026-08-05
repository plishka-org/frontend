import { ContactsSection } from '../../sections/Contacts/ContactsSection'
import { Footer } from '../../layout/Footer/Footer'
import { Header } from '../../layout/Header/Header'
import { ProductDetailSection } from '../../sections/ProductDetail/ProductDetailSection'
import { ProductRails } from '../../sections/ProductRails/ProductRails'
import ContactForm from '../../sections/ContactForm/ContactForm'
import { useEffect, useMemo, useState } from 'react'
import {
  resolveProductMediaItem,
  type ProductMediaUi,
  type ProductUi,
} from '../../../services/api/productsApi'
import type { SiteVariant } from '../../../utils/siteVariant'

type ProductPageProps = {
  product: ProductUi
  siteVariant: SiteVariant
}

export function ProductPage({ product, siteVariant }: ProductPageProps) {
  const initialMedia = useMemo<ProductMediaUi[]>(
    () =>
      product.media?.length
        ? product.media
        : product.gallery.map((url, index) => ({
            url,
            thumbnailUrl: url,
            mediaType: 'IMAGE',
            isPrimary: index === 0,
            displayOrder: index,
          })),
    [product],
  )
  const [displayProduct, setDisplayProduct] = useState<ProductUi>(() => ({
    ...product,
    media: initialMedia,
  }))

  useEffect(() => {
    let cancelled = false

    initialMedia.forEach((mediaItem, index) => {
      if (!mediaItem.s3Key) return

      resolveProductMediaItem(mediaItem).then((resolvedMedia) => {
        if (cancelled) return

        setDisplayProduct((currentProduct) => {
          const nextMedia = [...(currentProduct.media ?? initialMedia)]
          nextMedia[index] = resolvedMedia
          const primaryImage =
            nextMedia.find((item) => item.isPrimary && item.mediaType === 'IMAGE') ??
            nextMedia.find((item) => item.mediaType === 'IMAGE')

          return {
            ...currentProduct,
            image: primaryImage?.url || currentProduct.image,
            gallery: nextMedia.map((item) => item.url).filter(Boolean),
            media: nextMedia,
          }
        })
      })
    })

    return () => {
      cancelled = true
    }
  }, [initialMedia, product])

  return (
    <main className="page-shell product-page">
      <Header siteVariant={siteVariant} />
      <div className="product-page__content">
        <ProductDetailSection product={displayProduct} siteVariant={siteVariant} />
        <ProductRails product={product} siteVariant={siteVariant} />
      </div>
      <ContactForm />
      <ContactsSection />
      <Footer />
    </main>
  )
}
