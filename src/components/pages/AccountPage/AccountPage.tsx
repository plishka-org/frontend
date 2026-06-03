import { getAppPath } from '../../../utils/productUrl'
import type { SiteVariant } from '../../../utils/siteVariant'
import { Footer } from '../../layout/Footer/Footer'
import { Header } from '../../layout/Header/Header'
import ContactForm from '../../sections/ContactForm/ContactForm'
import { ContactsSection } from '../../sections/Contacts/ContactsSection'
import { AccountLayout } from './AccountLayout'
import { AccountSettingsSection } from './AccountSettingsSection'
import { OrderList } from './OrderList'
import { RequestList } from './RequestList'
import type { Order } from '../../../types/order'
import type { Request } from '../../../types/request'

type AccountPageProps = {
  siteVariant: SiteVariant
}
//замінити коли буде бек
const MOCK_ORDERS: Order[] = []
//замінити коли буде бек
const MOCK_REQUESTS: Request[] = []

export function AccountPage({ siteVariant }: AccountPageProps) {
  const currentPath = getAppPath(window.location.pathname, window.location.hash)

  let section: React.ReactNode

  if (currentPath.startsWith('/account/orders')) {
    section = <OrderList orders={MOCK_ORDERS} siteVariant={siteVariant} />
  } else if (currentPath.startsWith('/account/requests')) {
    section = <RequestList requests={MOCK_REQUESTS} />
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