export function GalleryProductSkeletonCard() {
  return (
    <article className="gallery-card gallery-card--skeleton" aria-hidden="true">
      <span className="gallery-card__skeleton-image" />
      <span className="gallery-card__skeleton-line gallery-card__skeleton-line--category" />
      <span className="gallery-card__skeleton-line gallery-card__skeleton-line--title" />
      <span className="gallery-card__skeleton-favorite" />
    </article>
  )
}
