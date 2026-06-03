import { getAppPath } from '../../../utils/productUrl'
import type { SiteVariant } from '../../../utils/siteVariant'
import { Footer } from '../../layout/Footer/Footer'
import { Header } from '../../layout/Header/Header'
import ContactForm from '../../sections/ContactForm/ContactForm'
import { ContactsSection } from '../../sections/Contacts/ContactsSection'
import { AccountLayout } from './AccountLayout'
import { AccountSettingsSection } from './AccountSettingsSection'

type AccountPageProps = {
  siteVariant: SiteVariant
}

export function AccountPage({ siteVariant }: AccountPageProps) {
  const currentPath = getAppPath(window.location.pathname, window.location.hash)

  let section: React.ReactNode

  if (currentPath.startsWith('/account/orders')) {
    section = (
      <div className="account-placeholder">
        <h2 className="account-placeholder__title">Історія замовлень</h2>
        <p className="account-placeholder__text">Тут з'являться ваші замовлення після підключення бекенду.</p>
      </div>
    )
  } else if (currentPath.startsWith('/account/requests')) {
    section = (
      <div className="account-placeholder">
        <h2 className="account-placeholder__title">Історія заявок</h2>
        <p className="account-placeholder__text">Тут з'являться ваші заявки після підключення бекенду.</p>
      </div>
    )
  } else {

    section = <AccountSettingsSection />
  }

  return (
    <main className="page-shell">
      <Header siteVariant={siteVariant} />
      <div className="account-page">
        <AccountLayout>
          {section}
        </AccountLayout>
      </div>
      <ContactForm />
      <ContactsSection />
      <Footer />
    </main>
  )
}