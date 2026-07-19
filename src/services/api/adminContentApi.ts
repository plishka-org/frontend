import { apiRequest } from './client'
import type { AboutContent, HomeContent, SettingsResponse } from './contentApi'

export type AdminAboutMedia = {
  mediaId: number
  s3Key: string
  mediaType: 'IMAGE' | 'VIDEO'
  displayOrder: number
}

export type ContactContent = {
  phoneNumber: string | null
  email: string | null
  address: string | null
  googleMapsUrl: string | null
}

export type SocialLink = { socialLinkId: number; name: string; url: string }

export type ReviewMedia = {
  reviewMediaId: number
  s3Key: string
  mediaType: 'IMAGE' | 'VIDEO'
  isPrimary: boolean
  displayOrder: number
}

export type AdminReview = {
  reviewId: number
  authorName: string
  content: string
  createdAt: string
  isFeatured: boolean
  media: ReviewMedia[]
}

export type AdminReviewSummary = Omit<AdminReview, 'media'> & {
  primaryMedia: Pick<ReviewMedia, 'reviewMediaId' | 's3Key' | 'mediaType'> | null
}

export type PageResponse<T> = {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

type PresignUploadResponse = {
  s3Key: string
  uploadUrl: string
  method: 'PUT'
  requiredHeaders: Record<string, string>
}

export const getAdminHome = () => apiRequest<{ content: HomeContent }>('/api/admin/home-page')
export const updateAdminHome = (body: HomeContent) => apiRequest<HomeContent>('/api/admin/home-page', { method: 'PUT', body })

export const getAdminAbout = () => apiRequest<{ content: AboutContent; media: AdminAboutMedia[] }>('/api/admin/about')
export const updateAdminAbout = (body: AboutContent) => apiRequest<AboutContent>('/api/admin/about', { method: 'PUT', body })
export const attachAboutMedia = (s3Key: string) => apiRequest<void>('/api/admin/about/media/attach', { method: 'POST', body: { s3Key } })
export const reorderAboutMedia = (mediaIds: number[]) => apiRequest<void>('/api/admin/about/media/order', { method: 'PUT', body: { mediaIds } })
export const deleteAboutMedia = (mediaId: number) => apiRequest<void>(`/api/admin/about/media/${mediaId}`, { method: 'DELETE' })

export async function uploadAdminAboutMedia(files: File[]) {
  for (const file of files) {
    const presign = await apiRequest<PresignUploadResponse>('/api/admin/files/presign/upload', {
      method: 'POST',
      body: {
        targetType: 'ABOUT',
        targetId: 1,
        mediaType: reviewMediaType(file),
        contentType: file.type,
        sizeBytes: file.size,
        originalFilename: file.name,
        checksumSha256Base64: await checksumSha256Base64(file),
      },
    })
    const response = await fetch(presign.uploadUrl, {
      method: presign.method,
      headers: presign.requiredHeaders,
      body: file,
    })
    if (!response.ok) throw new Error('Не вдалося завантажити медіа')
    await attachAboutMedia(presign.s3Key)
  }
}

export const getAdminContacts = () => apiRequest<{ content: ContactContent; socialLinks: SocialLink[] }>('/api/admin/contacts-page')
export const updateAdminContacts = (body: ContactContent) => apiRequest<ContactContent>('/api/admin/contacts-page', { method: 'PUT', body })
export const createSocialLink = (body: Omit<SocialLink, 'socialLinkId'>) => apiRequest<SocialLink>('/api/admin/contacts-page/social-links', { method: 'POST', body })
export const updateSocialLink = (id: number, body: Omit<SocialLink, 'socialLinkId'>) => apiRequest<SocialLink>(`/api/admin/contacts-page/social-links/${id}`, { method: 'PUT', body })
export const deleteSocialLink = (id: number) => apiRequest<void>(`/api/admin/contacts-page/social-links/${id}`, { method: 'DELETE' })

export const getAdminReviews = (search = '', page = 0) => {
  const params = new URLSearchParams({ page: String(page), size: '10' })
  if (search.trim()) params.set('search', search.trim())
  return apiRequest<PageResponse<AdminReviewSummary>>(`/api/admin/reviews?${params}`)
}
export const getAdminReview = (id: number) => apiRequest<AdminReview>(`/api/admin/reviews/${id}`)
export const createAdminReview = (body: Pick<AdminReview, 'authorName' | 'content'>) => apiRequest<AdminReview>('/api/admin/reviews', { method: 'POST', body })
export const updateAdminReview = (id: number, body: Pick<AdminReview, 'authorName' | 'content'>) => apiRequest<AdminReview>(`/api/admin/reviews/${id}`, { method: 'PUT', body })
export const deleteAdminReview = (id: number) => apiRequest<void>(`/api/admin/reviews/${id}`, { method: 'DELETE' })
export const setReviewFeatured = (id: number, featured: boolean) => apiRequest<AdminReview>(`/api/admin/reviews/${id}/featured`, { method: 'PATCH', body: { featured } })
export const attachReviewMedia = (id: number, s3Key: string) => apiRequest<void>(`/api/admin/reviews/${id}/media/attach`, { method: 'POST', body: { s3Key } })
export const setReviewPrimaryMedia = (reviewId: number, mediaId: number) => apiRequest<void>(`/api/admin/reviews/${reviewId}/media/${mediaId}/primary`, { method: 'PUT' })
export const deleteReviewMedia = (reviewId: number, mediaId: number) => apiRequest<void>(`/api/admin/reviews/${reviewId}/media/${mediaId}`, { method: 'DELETE' })

function reviewMediaType(file: File): ReviewMedia['mediaType'] {
  return file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
}

async function checksumSha256Base64(file: File) {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  let binary = ''
  new Uint8Array(digest).forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

export async function uploadAdminReviewMedia(reviewId: number, files: File[]) {
  const uploadedKeys: string[] = []

  for (const file of files) {
    const presign = await apiRequest<PresignUploadResponse>('/api/admin/files/presign/upload', {
      method: 'POST',
      body: {
        targetType: 'REVIEW',
        targetId: reviewId,
        mediaType: reviewMediaType(file),
        contentType: file.type,
        sizeBytes: file.size,
        originalFilename: file.name,
        checksumSha256Base64: await checksumSha256Base64(file),
      },
    })
    const response = await fetch(presign.uploadUrl, {
      method: presign.method,
      headers: presign.requiredHeaders,
      body: file,
    })
    if (!response.ok) throw new Error('Не вдалося завантажити медіа')
    await attachReviewMedia(reviewId, presign.s3Key)
    uploadedKeys.push(presign.s3Key)
  }

  return uploadedKeys
}

export const getAdminSettings = () => apiRequest<SettingsResponse>('/api/admin/settings')
export const updateAdminSettings = (isShopModeEnabled: boolean) => apiRequest<SettingsResponse>('/api/admin/settings', { method: 'PUT', body: { isShopModeEnabled } })
