import { InfoIcon } from './icons/UiIcons'

export function OrderUnavailableNotice() {
  return (
    <div className="order-unavailable-notice">
      <InfoIcon />
      <span>
        Замовлення поки недоступні, але ви можете переглядати вироби та залишити заявку внизу
        сторінки.
      </span>
    </div>
  )
}
