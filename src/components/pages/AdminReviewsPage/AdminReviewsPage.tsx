import { useCallback, useEffect, useState } from 'react'
import {
  createAdminReview, deleteAdminReview, getAdminReviews, setReviewFeatured, updateAdminReview,
  type AdminReviewSummary,
} from '../../../services/api/adminContentApi'
import '../AdminContentPage/adminContentPage.scss'

const EMPTY_FORM = { authorName: '', content: '' }

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewSummary[]>([])
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await getAdminReviews(appliedSearch, page)
      setReviews(result.content); setTotalPages(result.totalPages)
    } catch { setError('Не вдалося завантажити відгуки.') }
    finally { setLoading(false) }
  }, [appliedSearch, page])

  useEffect(() => { void load() }, [load])

  async function saveReview(e: React.FormEvent) {
    e.preventDefault(); setError('')
    try {
      if (editingId === null) await createAdminReview(form)
      else await updateAdminReview(editingId, form)
      setForm(EMPTY_FORM); setEditingId(null); await load()
    } catch { setError('Не вдалося зберегти відгук. Перевірте обов’язкові поля.') }
  }

  return <section className="admin-content admin-reviews">
    <h1>Відгуки</h1>
    <form className="admin-reviews__search" onSubmit={(e) => { e.preventDefault(); setPage(0); setAppliedSearch(search) }}>
      <input maxLength={100} value={search} placeholder="Пошук за автором або текстом" onChange={(e) => setSearch(e.target.value)} />
      <button type="submit">Знайти</button>
    </form>
    {error && <p className="admin-content__error">{error}</p>}
    <form className="admin-reviews__editor" onSubmit={saveReview}>
      <h2>{editingId === null ? 'Новий відгук' : 'Редагування відгуку'}</h2>
      <label className="admin-content__field"><span>Автор</span><input required maxLength={100} value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} /></label>
      <label className="admin-content__field"><span>Текст</span><textarea required maxLength={10000} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
      <button className="admin-content__save" type="submit">{editingId === null ? 'Додати' : 'Зберегти'}</button>
      {editingId !== null && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM) }}>Скасувати</button>}
    </form>
    {loading ? <p>Завантаження…</p> : <div className="admin-reviews__list">{reviews.map((review) => <article key={review.reviewId}>
      <div><h3>{review.authorName}</h3><time>{new Date(review.createdAt).toLocaleDateString('uk-UA')}</time></div>
      <p>{review.content}</p>
      <div className="admin-reviews__actions">
        <label><input type="checkbox" checked={review.isFeatured} onChange={async (e) => { try { await setReviewFeatured(review.reviewId, e.target.checked); await load() } catch { setError('Не вдалося змінити статус. На головній може бути не більше 5 відгуків.') } }} /> На головній</label>
        <button type="button" onClick={() => { setEditingId(review.reviewId); setForm({ authorName: review.authorName, content: review.content }) }}>Редагувати</button>
        <button type="button" className="danger" onClick={async () => { if (!window.confirm('Видалити цей відгук?')) return; try { await deleteAdminReview(review.reviewId); await load() } catch { setError('Не вдалося видалити відгук.') } }}>Видалити</button>
      </div>
    </article>)}</div>}
    <div className="admin-reviews__pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Назад</button><span>{totalPages ? `${page + 1} / ${totalPages}` : '0 / 0'}</span><button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Далі</button></div>
  </section>
}
