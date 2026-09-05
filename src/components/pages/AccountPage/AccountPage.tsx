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

const REQUESTS_PAGE_SIZE = 10

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
  const [requestsPage, setRequestsPage] = useState(0)
  const [requestsTotalPages, setRequestsTotalPages] = useState(0)
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [requestsError, setRequestsError] = useState<string | null>(null)
  const [requestsReloadKey, setRequestsReloadKey] = useState(0)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!currentPath.startsWith('/account/requests')) {
      return
    }

    let cancelled = false

    getContactRequests(requestsPage, REQUESTS_PAGE_SIZE)
      .then((response) => {
        if (cancelled) return
        setRequests(response.content.map(mapContactRequestToRequest))
        setRequestsTotalPages(response.totalPages)
        setRequestsError(null)
      })
      .catch(() => {
        if (cancelled) return
        setRequests([])
        setRequestsTotalPages(0)
        setRequestsError('Не вдалося завантажити історію заявок.')
      })
      .finally(() => {
        if (!cancelled) setRequestsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [currentPath, requestsPage, requestsReloadKey])

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
    section = (
      <RequestList
        requests={requests}
        currentPage={requestsPage + 1}
        totalPages={requestsTotalPages}
        isLoading={requestsLoading}
        error={requestsError}
        onPageChange={(page) => {
          setRequestsLoading(true)
          setRequestsError(null)
          setRequestsPage(page - 1)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onRetry={() => {
          setRequestsLoading(true)
          setRequestsError(null)
          setRequestsReloadKey((key) => key + 1)
        }}
      />
    )
  } else {
    section = <AccountSettingsSection />
  }

  return (
    <main className="page-shell">
      <Header siteVariant={siteVariant} />
      <div className="account-page">
        <AccountLayout siteVariant={siteVariant}>
          {section}
        </AccountLayout>
      </div>
      <ContactForm />
      <ContactsSection />
      <Footer />
    </main>
  )
}
