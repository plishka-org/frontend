import { ArrowIcon } from '../../icons/UiIcons'

type GalleryPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function GalleryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: GalleryPaginationProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav className="gallery-pagination" aria-label="Сторінки галереї">
      <button
        className="gallery-pagination__arrow"
        type="button"
        aria-label="Попередня сторінка"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ArrowIcon />
      </button>
      {pageNumbers.map((page) => (
        <button
          className="gallery-pagination__page"
          data-active={page === currentPage}
          type="button"
          key={page}
          aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        className="gallery-pagination__arrow"
        type="button"
        aria-label="Наступна сторінка"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ArrowIcon />
      </button>
    </nav>
  )
}
