import { Footer } from '../../layout/Footer/Footer'
import { Header } from '../../layout/Header/Header'
import { getProductById } from '../../../data/bestProducts'
import type { BestProduct } from '../../../data/bestProducts'
import { useShop } from '../../../hooks/useShop'
import type { SiteVariant } from '../../../utils/siteVariant'
import { FavoritesSection } from './FavoritesSection'
import ContactForm from '../../sections/ContactForm/ContactForm'
import { ContactsSection } from '../../sections/Contacts/ContactsSection'

type FavoritesPageProps = {
  siteVariant: SiteVariant
}

export function FavoritesPage({ siteVariant }: FavoritesPageProps) {
  const { favoriteProductIds } = useShop()

  const favoriteProducts: BestProduct[] = favoriteProductIds
    .map((productId) => getProductById(productId))
    .filter((product): product is BestProduct => Boolean(product))

  return (
    <main className="page-shell">
      <Header activePage="favorites" siteVariant={siteVariant} />
      <FavoritesSection products={favoriteProducts} siteVariant={siteVariant} />
      <ContactForm/>
      <ContactsSection/>
      <Footer />
    </main>
  )
}