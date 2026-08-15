import { useEffect, useState } from 'react'
import { verifyEmailChangeApi } from '../../../services/api/authApi'
import '../RegisterPage/RegisterPage.scss'

const verificationRequests = new Map<string, Promise<void>>()

function verifyOnce(token: string) {
  const existing = verificationRequests.get(token)
  if (existing) return existing
  const request = verifyEmailChangeApi(token)
  verificationRequests.set(token, request)
  return request
}

export function EmailChangeVerificationPage() {
  const hashSearch = window.location.hash.split('?')[1] ?? ''
  const token = new URLSearchParams(hashSearch).get('token')?.trim() ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error')

  useEffect(() => {
    if (!token) return
    let cancelled = false
    verifyOnce(token)
      .then(() => { if (!cancelled) setStatus('success') })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [token])

  return <main className="register-page">
    <section className="register-page__card" aria-live="polite">
      <h1 className="register-page__title">Зміна електронної пошти</h1>
      {status === 'loading' && <p className="register-page__success-text">Підтверджуємо нову електронну пошту…</p>}
      {status === 'success' && <>
        <p className="register-page__success-text">Електронну пошту успішно змінено.</p>
        <a href="#/login" className="register-page__submit register-page__submit--link">УВІЙТИ</a>
      </>}
      {status === 'error' && <>
        <p className="register-page__success-text">Не вдалося змінити електронну пошту. Посилання відсутнє або застаріло.</p>
        <a href="#/login" className="register-page__submit register-page__submit--link">НА СТОРІНКУ ВХОДУ</a>
      </>}
    </section>
  </main>
}
