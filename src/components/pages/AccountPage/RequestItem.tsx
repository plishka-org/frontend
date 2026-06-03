import type { Request } from '../../../types/request'

const DESCRIPTION_LIMIT = 80

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text
  return text.slice(0, limit).trimEnd() + '...'
}

type Props = {
  request: Request
}

export function RequestItem({ request }: Props) {
  return (
    <li className="request-item">
      <p className="request-item__title">{request.title}</p>
      <p className="request-item__description">
        {truncate(request.description, DESCRIPTION_LIMIT)}
      </p>
      <p className="request-item__date">{formatDate(request.date)}</p>
    </li>
  )
}