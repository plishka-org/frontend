import './_order-unavailable-notice.scss'

export function OrderUnavailableNotice() {
  return (
    <div className="order-unavailable">
      <p className="order-unavailable__text">
        Замовлення доступне лише на сайті замовлень.
      </p>
    </div>
  )
}