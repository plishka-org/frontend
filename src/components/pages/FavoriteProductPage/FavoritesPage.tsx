import { Footer } from '../../layout/Footer/Footer'
import { Header } from '../../layout/Header/Header'
import { useShop } from '../../../hooks/useShop'
import type { SiteVariant } from '../../../utils/siteVariant'
import { FavoritesSection } from './FavoritesSection'
import ContactForm from '../../sections/ContactForm/ContactForm'
import { ContactsSection } from '../../sections/Contacts/ContactsSection'

type FavoritesPageProps = {
  siteVariant: SiteVariant
}

export function FavoritesPage({ siteVariant }: FavoritesPageProps) {
  const { favoriteProducts, favoritesLoading, favoritesError, refetchFavorites } = useShop()

  return (
    <main className="page-shell">
      <Header activePage="favorites" siteVariant={siteVariant} />
      <FavoritesSection
        products={favoriteProducts}
        siteVariant={siteVariant}
        isLoading={favoritesLoading}
        error={favoritesError}
        onRetry={refetchFavorites}
      />
      <ContactForm/>
      <ContactsSection/>
      <Footer />
    </main>
  )
}
