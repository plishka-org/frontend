import { bestProducts } from '../../../data/bestProducts'
import { getProductUrl } from '../../../utils/productUrl'
import type { SiteVariant } from '../../../utils/siteVariant'

type BestProductsSectionProps = {
  siteVariant?: SiteVariant
}

export function BestProductsSection({ siteVariant = 'usual' }: BestProductsSectionProps) {
  return (
    <section
      className="best-products-section"
      id="best-products"
      aria-labelledby="best-products-title"
    >
      <div className="best-products-section__inner">
        <div className="best-products-section__header">
          <h1 id="best-products-title">Наші найкращі вироби</h1>

          <a className="best-products-section__link" href="#catalog">
            <span>Усі вироби</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="best-products-carousel" aria-label="Найкращі вироби">
          {bestProducts.map((product) => (
            <article className="best-product-card" key={product.id}>
              <a className="best-product-card__link" href={getProductUrl(product.id, siteVariant)}>
                <img src={product.image} alt={product.name} />

                <div className="best-product-card__body">
                  <p>{product.category}</p>
                  <h2 title={product.name}>{product.displayName ?? product.name}</h2>
                </div>
              </a>

              <button
                className="best-product-card__favorite"
                type="button"
                aria-label={`Додати ${product.name} до обраного`}
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="22"
                  viewBox="0 0 24 24"
                  width="22"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
