import type { AppConfig } from '@/types'

const CONFIG_KEY = 'lidarr-suggestions-config'

const defaultConfig: AppConfig = {
  lidarr: { url: '', apiKey: '' },
  lastfm: { apiKey: '' },
}

export function getConfig(): AppConfig {
  if (typeof window === 'undefined') return defaultConfig
  try {
    const stored = localStorage.getItem(CONFIG_KEY)
    if (!stored) return defaultConfig
    return { ...defaultConfig, ...JSON.parse(stored) }
  } catch {
    return defaultConfig
  }
}

export function setConfig(config: AppConfig): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function isConfigured(): boolean {
  const config = getConfig()
  return !!(config.lidarr.url && config.lidarr.apiKey && config.lastfm.apiKey)
}

export function clearConfig(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CONFIG_KEY)
}
