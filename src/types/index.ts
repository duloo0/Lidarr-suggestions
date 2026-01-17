export * from './lidarr'
export * from './lastfm'

export interface AppConfig {
  lidarr: { url: string; apiKey: string }
  lastfm: { apiKey: string }
}
