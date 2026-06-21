import { apiRequest, hasApiBaseUrl } from './client'

type PresignDownloadResponseDto = {
  s3Key: string
  downloadUrl: string
  method: 'GET'
  expiresAt: string
}

type CachedMediaUrl = {
  url: string
  expiresAt: number
}

const mediaUrlCache = new Map<string, CachedMediaUrl>()

export type MediaPreviewDto = {
  s3Key?: string | null
  mediaType?: 'IMAGE' | 'VIDEO'
}

export async function resolveMediaUrl(s3Key: string | null | undefined, fallbackUrl: string) {
  if (!s3Key || !hasApiBaseUrl()) return fallbackUrl

  const cached = mediaUrlCache.get(s3Key)
  const now = Date.now()
  if (cached && cached.expiresAt > now + 30_000) {
    return cached.url
  }

  try {
    const response = await apiRequest<PresignDownloadResponseDto>('/api/files/presign/download', {
      method: 'POST',
      auth: false,
      body: { s3Key },
    })
    const expiresAt = Date.parse(response.expiresAt)
    mediaUrlCache.set(s3Key, {
      url: response.downloadUrl,
      expiresAt: Number.isFinite(expiresAt) ? expiresAt : now + 5 * 60_000,
    })
    return response.downloadUrl
  } catch {
    return fallbackUrl
  }
}
