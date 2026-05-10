import { useCart } from "../hooks/useCart";
import { CloseIcon, TrashIcon } from "../components/icons/UiIcons";
import "./CartModal.scss";
import ImgMinus from "../icons/minus.png"
import ImgPlus from "../icons/plus.png"

type CartModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } =
    useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="cart-modal__backdrop" onClick={onClose} />
      <div className="cart-modal" role="dialog" aria-label="Кошик">
        <div className="cart-modal__header">
          <h2 className="cart-modal__title">Кошик</h2>
          <button
            className="cart-modal__close"
            type="button"
            aria-label="Закрити кошик"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <>
            <p className="cart-modal__empty">Кошик порожній</p>
            <div className="cart-modal__actions">
              <button
                className="cart-modal__order"
                type="button"
                onClick={onClose}
              >
                Перейти до каталогу
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cart-modal__items">
              {items.map((item) => (
                <div className="cart-modal__item" key={item.id}>
                  <img
                    className="cart-modal__item-image"
                    src={item.image}
                    alt={item.name}
                  />
                  <div className="cart-modal__item-info">
                    <p className="cart-modal__item-name">{item.name}</p>
                    <p className="cart-modal__item-category">{item.category}</p>
                  </div>
                  <div className="cart-modal__item-qty">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity === 1}
                    >
                      <img src={ImgMinus} alt="minus" className="imgMath" />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <img src={ImgPlus} alt="plus" className="imgMath" />
                    </button>
                  </div>

                  {/* TODO: ТИМЧАСОВО — ціна захардкоджена з даних для тесту.
                      Після підключення реального API з цінами — замінити на дані з бекенду */}
                  <p className="cart-modal__item-price">
                    {(item.price * item.quantity).toLocaleString("uk-UA")} грн
                  </p>

                  <button
                    className="cart-modal__item-remove"
                    type="button"
                    aria-label={`Видалити ${item.name}`}
                    onClick={() => removeFromCart(item.id)}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-modal__total">
              <span>Загальна сума замовлення:</span>
              {/* TODO: ТИМЧАСОВО — загальна сума рахується з тестових цін.
                  Після підключення API — замінити на реальні ціни з бекенду */}
              <strong>{totalPrice.toLocaleString("uk-UA")} грн</strong>
            </div>

            <div className="cart-modal__actions">
              <button
                className="cart-modal__clear"
                type="button"
                onClick={clearCart}
              >
                Очистити кошик
              </button>
              <button className="cart-modal__order" type="button">
                Оформити замовлення
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
