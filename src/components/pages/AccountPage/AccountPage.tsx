import { useEffect, useState } from 'react'
import { getAppPath } from '../../../utils/productUrl'
import type { SiteVariant } from '../../../utils/siteVariant'
import { getContactRequests } from '../../../services/api/contactRequestsApi'
import type { ContactRequestResponse } from '../../../services/api/contactRequestsApi'
import { getOrdersApi } from '../../../services/api/ordersApi'
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
function mapContactRequestToRequest(request: ContactRequestResponse): Request {
  return {
    id: request.id,
    title: `Заявка від ${request.name || 'користувача'}`,
    description: `${request.description} Телефон: ${request.phone}`,
    date: request.createdAt,
  }
}

export function AccountPage({ siteVariant }: AccountPageProps) {
  const currentPath = getAppPath(window.location.pathname, window.location.hash)
  const [requests, setRequests] = useState<Request[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!currentPath.startsWith('/account/requests')) {
      return
    }

    getContactRequests()
      .then((contactRequests) =>
        setRequests(contactRequests.map(mapContactRequestToRequest).reverse()),
      )
      .catch(() => setRequests([]))
  }, [currentPath])

  useEffect(() => {
    if (!currentPath.startsWith('/account/orders')) {
      return
    }

    getOrdersApi()
      .then(setOrders)
      .catch(() => setOrders([]))
  }, [currentPath])

  let section: React.ReactNode

  if (currentPath.startsWith('/account/orders')) {
    section = <OrderList orders={orders} siteVariant={siteVariant} />
  } else if (currentPath.startsWith('/account/requests')) {
    section = <RequestList requests={requests} />
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
