import { useEffect } from 'react'
import { CloseIcon } from '../components/icons/UiIcons'

type ToastProps = {
  message: string
  onClose: () => void
  duration?: number
}

export function Toast({ message, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{message}</span>
      <button
        type="button"
        className="toast__close"
        aria-label="Закрити повідомлення"
        onClick={onClose}
      >
        <CloseIcon />
      </button>
    </div>
  )
}