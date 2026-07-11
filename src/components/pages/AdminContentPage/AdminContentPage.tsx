import { useEffect, useState } from 'react'
import {
  createSocialLink, deleteAboutMedia, deleteSocialLink, getAdminAbout, getAdminContacts,
  getAdminHome, getAdminSettings, reorderAboutMedia, updateAdminAbout, updateAdminContacts,
  updateAdminHome, updateAdminSettings, updateSocialLink, type AdminAboutMedia, type SocialLink,
} from '../../../services/api/adminContentApi'
import './adminContentPage.scss'

type Section = 'home' | 'about' | 'contacts' | 'shop'
const EMPTY_LINK = { name: '', url: '' }

export function AdminContentPage() {
  const [section, setSection] = useState<Section>('home')
  const [home, setHome] = useState({ title: '', description: '' })
  const [about, setAbout] = useState({ mainTitle: '', mainSubtitle: '', secondaryTitle: '', secondarySubtitle: '' })
  const [media, setMedia] = useState<AdminAboutMedia[]>([])
  const [contacts, setContacts] = useState({ phoneNumber: '', email: '', address: '', googleMapsUrl: '' })
  const [links, setLinks] = useState<SocialLink[]>([])
  const [newLink, setNewLink] = useState(EMPTY_LINK)
  const [shopMode, setShopMode] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAdminHome(), getAdminAbout(), getAdminContacts(), getAdminSettings()])
      .then(([homeDto, aboutDto, contactsDto, settings]) => {
        setHome({ title: homeDto.content.title, description: homeDto.content.description ?? '' })
        setAbout(aboutDto.content)
        setMedia(aboutDto.media)
        setContacts({
          phoneNumber: contactsDto.content.phoneNumber ?? '', email: contactsDto.content.email ?? '',
          address: contactsDto.content.address ?? '', googleMapsUrl: contactsDto.content.googleMapsUrl ?? '',
        })
        setLinks(contactsDto.socialLinks)
        setShopMode(settings.isShopModeEnabled)
      })
      .catch(() => setError('Не вдалося завантажити налаштування контенту.'))
      .finally(() => setLoading(false))
  }, [])

  async function run(action: () => Promise<unknown>, success = 'Зміни збережено.') {
    setError(''); setMessage('')
    try { await action(); setMessage(success) } catch { setError('Не вдалося зберегти зміни. Перевірте введені дані.') }
  }

  async function moveMedia(index: number, offset: number) {
    const next = [...media]
    const target = index + offset
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    await run(async () => { await reorderAboutMedia(next.map((item) => item.mediaId)); setMedia(next) }, 'Порядок медіа оновлено.')
  }

  if (loading) return <p>Завантаження…</p>
  return (
    <section className="admin-content">
      <h1>Керування контентом</h1>
      <div className="admin-content__tabs">
        {([['home', 'Головна'], ['about', 'Про нас'], ['contacts', 'Контакти'], ['shop', 'Режим сайту']] as [Section, string][]).map(([key, label]) => (
          <button type="button" data-active={section === key} onClick={() => { setSection(key); setMessage(''); setError('') }} key={key}>{label}</button>
        ))}
      </div>
      {error && <p className="admin-content__error">{error}</p>}
      {message && <p className="admin-content__success">{message}</p>}

      {section === 'home' && <form onSubmit={(e) => { e.preventDefault(); void run(() => updateAdminHome({ ...home, description: home.description || null })) }}>
        <Field label="Заголовок" value={home.title} maxLength={255} required onChange={(title) => setHome({ ...home, title })} />
        <Field textarea label="Опис" value={home.description} maxLength={5000} onChange={(description) => setHome({ ...home, description })} />
        <SaveButton />
      </form>}

      {section === 'about' && <form onSubmit={(e) => { e.preventDefault(); void run(() => updateAdminAbout(about)) }}>
        <Field label="Основний заголовок" value={about.mainTitle} maxLength={255} required onChange={(mainTitle) => setAbout({ ...about, mainTitle })} />
        <Field textarea label="Основний текст" value={about.mainSubtitle} maxLength={10000} required onChange={(mainSubtitle) => setAbout({ ...about, mainSubtitle })} />
        <Field label="Другий заголовок" value={about.secondaryTitle} maxLength={255} required onChange={(secondaryTitle) => setAbout({ ...about, secondaryTitle })} />
        <Field textarea label="Другий текст" value={about.secondarySubtitle} maxLength={10000} required onChange={(secondarySubtitle) => setAbout({ ...about, secondarySubtitle })} />
        <SaveButton />
        <h2>Медіа сторінки</h2>
        <div className="admin-content__list">{media.map((item, index) => <div key={item.mediaId}>
          <span>{item.s3Key}</span>
          <button type="button" disabled={index === 0} onClick={() => void moveMedia(index, -1)}>↑</button>
          <button type="button" disabled={index === media.length - 1} onClick={() => void moveMedia(index, 1)}>↓</button>
          <button type="button" className="danger" onClick={() => void run(async () => { await deleteAboutMedia(item.mediaId); setMedia(media.filter((m) => m.mediaId !== item.mediaId)) }, 'Медіа видалено.')}>Видалити</button>
        </div>)}</div>
      </form>}

      {section === 'contacts' && <form onSubmit={(e) => { e.preventDefault(); void run(() => updateAdminContacts({
        phoneNumber: contacts.phoneNumber || null, email: contacts.email || null, address: contacts.address || null, googleMapsUrl: contacts.googleMapsUrl || null,
      })) }}>
        <Field label="Телефон" value={contacts.phoneNumber} placeholder="+380501234567" onChange={(phoneNumber) => setContacts({ ...contacts, phoneNumber })} />
        <Field label="Email" type="email" value={contacts.email} onChange={(email) => setContacts({ ...contacts, email })} />
        <Field label="Адреса" value={contacts.address} maxLength={255} onChange={(address) => setContacts({ ...contacts, address })} />
        <Field label="Google Maps URL" type="url" value={contacts.googleMapsUrl} onChange={(googleMapsUrl) => setContacts({ ...contacts, googleMapsUrl })} />
        <SaveButton />
        <h2>Соціальні мережі</h2>
        <div className="admin-content__list">{links.map((link) => <SocialRow key={link.socialLinkId} link={link} onSave={(body) => run(async () => {
          const saved = await updateSocialLink(link.socialLinkId, body); setLinks(links.map((item) => item.socialLinkId === saved.socialLinkId ? saved : item))
        })} onDelete={() => run(async () => { await deleteSocialLink(link.socialLinkId); setLinks(links.filter((item) => item.socialLinkId !== link.socialLinkId)) }, 'Посилання видалено.')} />)}</div>
        {links.length < 20 && <div className="admin-content__new-link"><Field label="Назва" value={newLink.name} maxLength={100} onChange={(name) => setNewLink({ ...newLink, name })} /><Field label="HTTPS URL" type="url" value={newLink.url} maxLength={512} onChange={(url) => setNewLink({ ...newLink, url })} /><button type="button" onClick={() => void run(async () => { const saved = await createSocialLink(newLink); setLinks([saved, ...links]); setNewLink(EMPTY_LINK) }, 'Посилання додано.')}>Додати</button></div>}
      </form>}

      {section === 'shop' && <form onSubmit={(e) => { e.preventDefault(); void run(async () => { const result = await updateAdminSettings(shopMode); setShopMode(result.isShopModeEnabled) }) }}>
        <label className="admin-content__toggle"><input type="checkbox" checked={shopMode} onChange={(e) => setShopMode(e.target.checked)} /><span>Увімкнути режим магазину</span></label>
        <SaveButton />
      </form>}
    </section>
  )
}

function Field({ label, textarea, onChange, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & { label: string; textarea?: boolean; onChange: (value: string) => void }) {
  return <label className="admin-content__field"><span>{label}</span>{textarea ? <textarea {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} onChange={(e) => onChange(e.target.value)} /> : <input {...props} onChange={(e) => onChange(e.target.value)} />}</label>
}
function SaveButton() { return <button className="admin-content__save" type="submit">Зберегти</button> }
function SocialRow({ link, onSave, onDelete }: { link: SocialLink; onSave: (body: { name: string; url: string }) => Promise<unknown>; onDelete: () => Promise<unknown> }) {
  const [value, setValue] = useState({ name: link.name, url: link.url })
  return <div><input value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} /><input value={value.url} onChange={(e) => setValue({ ...value, url: e.target.value })} /><button type="button" onClick={() => void onSave(value)}>Зберегти</button><button type="button" className="danger" onClick={() => void onDelete()}>Видалити</button></div>
}
