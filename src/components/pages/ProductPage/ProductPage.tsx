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
  return (
    <main className="page-shell product-page">
      <Header siteVariant={siteVariant} />
      <div className="product-page__content">
        <ProductDetailSection product={product} siteVariant={siteVariant} />
        <ProductRails product={product} siteVariant={siteVariant} />
      </div>
      <ContactsSection />
      <Footer />
    </main>
  )
}
