import type { Order } from '../../../types/order'
import type { SiteVariant } from '../../../utils/siteVariant'
import { fallbackProductImage } from '../../../services/api/productsApi'

type OrderItemProps = {
  order: Order
  siteVariant: SiteVariant
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('uk-UA')} грн`
}

export function OrderItem({ order }: OrderItemProps) {
  return (
    <article className="order-item">
      <header className="order-item__header">
        <span className="order-item__number">Замовлення №{order.orderNumber ?? order.id}</span>
        <span className="order-item__date">{formatDate(order.date)}</span>
        <span className="order-item__total">{formatPrice(order.totalPrice)}</span>
      </header>

      <ul className="order-item__products" aria-label="Товари замовлення">
        {order.products.map((product) => (
          <li key={product.id} className="order-item__product">
            <img
              src={product.imageUrl || fallbackProductImage}
              alt={product.name}
              className="order-item__product-img"
              loading="lazy"
              decoding="async"
              width={100}
              height={100}
            />
            <div className="order-item__product-info">
              <span className="order-item__product-category">{product.category}</span>
              <span className="order-item__product-name">{product.name}</span>
              <span className="order-item__product-price">
                {formatPrice(product.price)}
                {product.quantity ? ` x${product.quantity}` : ''}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}
