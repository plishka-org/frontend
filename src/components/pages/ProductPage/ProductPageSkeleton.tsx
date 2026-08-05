import { Header } from "../../layout/Header/Header";
import type { SiteVariant } from "../../../utils/siteVariant";

type ProductPageSkeletonProps = {
  siteVariant: SiteVariant;
};

export function ProductPageSkeleton({ siteVariant }: ProductPageSkeletonProps) {
  return (
    <main className="page-shell product-page">
      <Header siteVariant={siteVariant} />
      <div className="product-page__content">
        <section
          className="product-detail product-detail--loading"
          aria-label="Завантаження товару"
          aria-busy="true"
        >
          <div className="product-detail-skeleton__gallery">
            <div className="product-detail-skeleton__thumbs" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
            <div className="product-detail-skeleton__image" aria-hidden="true" />
          </div>

          <div className="product-detail-skeleton__info" aria-hidden="true">
            <span className="product-detail-skeleton__line product-detail-skeleton__line--title" />
            <span className="product-detail-skeleton__line product-detail-skeleton__line--heading" />
            <span className="product-detail-skeleton__line" />
            <span className="product-detail-skeleton__line" />
            <span className="product-detail-skeleton__line product-detail-skeleton__line--short" />
          </div>
        </section>
        <p className="product-detail-skeleton__status" role="status">
          Завантажуємо товар…
        </p>
      </div>
    </main>
  );
}
