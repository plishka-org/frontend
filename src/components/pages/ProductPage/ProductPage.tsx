import { useState } from 'react'
import { ContactsSection } from '../../sections/Contacts/ContactsSection'
import { Footer } from '../../layout/Footer/Footer'
import { Header } from '../../layout/Header/Header'
import { ProductDetailSection } from '../../sections/ProductDetail/ProductDetailSection'
import { ProductRails } from '../../sections/ProductRails/ProductRails'
import type { BestProduct } from '../../../data/bestProducts'
import type { SiteVariant } from '../../../utils/siteVariant'

type ProductPageProps = {
  product: BestProduct
  siteVariant: SiteVariant
}

export function ProductPage({ product, siteVariant }: ProductPageProps) {
  const [isInCart, setIsInCart] = useState(false)

  return (
    <main className="page-shell product-page">
      <Header cartCount={isInCart ? 1 : 0} siteVariant={siteVariant} />
      <div className="product-page__content">
        <ProductDetailSection
          isInCart={isInCart}
          onAddToCart={() => setIsInCart(true)}
          product={product}
          siteVariant={siteVariant}
        />
        <ProductRails product={product} siteVariant={siteVariant} />
      </div>
      <ContactsSection />
      <Footer />
    </main>
  )
}
