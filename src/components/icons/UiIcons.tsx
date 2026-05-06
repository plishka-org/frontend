type IconProps = {
  className?: string
}

import TrashPng from '../../icons/Button.png'

export function HeartIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function CartIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M6.5 7.5h11l-1.1 8.2a2 2 0 0 1-2 1.8H9.6a2 2 0 0 1-2-1.8L6.5 7.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M9 7.5a3 3 0 0 1 6 0M9.5 20h.01M14.5 20h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.8 20a7.2 7.2 0 0 1 14.4 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  )
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 7h14M5 12h14M5 17h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function ArrowIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m5 12 4.2 4.2L19 6.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function FilterIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 7h9M17 7h3M4 17h3M11 17h9M9 4v6M15 14v6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <img src={TrashPng} alt="Trash" aria-hidden="true" className={className} />
  )
}
