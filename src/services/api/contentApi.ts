import { apiRequest, hasApiBaseUrl } from './client'
import { resolveMediaUrl } from './mediaApi'

export type HomeContent = { title: string; description: string | null }
export type HomeProduct = { productId: number; name: string; category: { categoryId: number; name: string }; primaryMedia?: { s3Key?: string | null } | null }
export type HomeReview = {
  reviewId: number
  authorName: string
  content: string
  media: { reviewMediaId: number; s3Key: string; mediaType: 'IMAGE' | 'VIDEO'; isPrimary: boolean; displayOrder: number }[]
}
export type HomeResponse = { content: HomeContent; products: HomeProduct[]; featuredReviews: HomeReview[] }
export type AboutContent = { mainTitle: string; mainSubtitle: string; secondaryTitle: string; secondarySubtitle: string }
export type AboutResponse = { content: AboutContent; media: { aboutPageMediaId: number; s3Key: string; mediaType: 'IMAGE' | 'VIDEO' }[] }
export type ContactsResponse = { phoneNumber: string; email: string; address: string | null; googleMapsUrl: string | null; socialLinks: { socialLinkId: number; name: string; url: string }[] }
export type SettingsResponse = { isShopModeEnabled: boolean }

export async function getHomeApi() { return apiRequest<HomeResponse>('/api/home', { auth: false }) }
export async function getAboutApi() { return apiRequest<AboutResponse>('/api/about', { auth: false }) }
export async function getContactsApi() { return apiRequest<ContactsResponse>('/api/contacts-page', { auth: false }) }
export async function getSettingsApi() { return apiRequest<SettingsResponse>('/api/settings', { auth: false }) }

export async function resolveAboutMedia(media: AboutResponse['media'], fallback: string[]) {
  if (!hasApiBaseUrl() || !media.length) return fallback
  return Promise.all(media.map((item, index) => resolveMediaUrl(item.s3Key, fallback[index % fallback.length] ?? '')))
}
