export * from './lidarr'
export * from './lastfm'

export interface AppConfig {
  lidarr: { url: string; apiKey: string }
  lastfm: { apiKey: string }
}

export interface DismissedArtist {
  id: string  // mbid or name-based key
  name: string
  dismissedAt: number
}

export interface BlacklistedArtist {
  id: string
  name: string
  blacklistedAt: number
  reason?: string
}
