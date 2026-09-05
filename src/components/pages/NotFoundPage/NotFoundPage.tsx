import { Footer } from '../../layout/Footer/Footer'
import { Header } from '../../layout/Header/Header'
import { getGalleryUrl, getHomeUrl } from '../../../utils/productUrl'
import type { SiteVariant } from '../../../utils/siteVariant'

type NotFoundPageProps = {
  description?: string
  siteVariant: SiteVariant
  title?: string
}

export function NotFoundPage({
  description = 'Можливо, посилання застаріле або сторінка більше недоступна.',
  siteVariant,
  title = 'Сторінку не знайдено',
}: NotFoundPageProps) {
  return (
    <main className="page-shell not-found-page">
      <Header siteVariant={siteVariant} />
      <section className="not-found-page__content" aria-labelledby="not-found-title">
        <span className="not-found-page__eyebrow">404</span>
        <h1 id="not-found-title">{title}</h1>
        <p>{description}</p>
        <div className="not-found-page__actions">
          <a className="not-found-page__primary" href={getHomeUrl()}>
            На головну
          </a>
          <a className="not-found-page__secondary" href={getGalleryUrl()}>
            До галереї
          </a>
        </div>
      </section>
      <Footer />
    </main>
  )
}
