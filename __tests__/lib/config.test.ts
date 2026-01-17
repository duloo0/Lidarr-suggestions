import { getConfig, setConfig, isConfigured, clearConfig } from '@/lib/config'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Config helpers', () => {
  beforeEach(() => localStorageMock.clear())

  it('should return default config when nothing stored', () => {
    const config = getConfig()
    expect(config.lidarr.url).toBe('')
  })

  it('should return true when fully configured', () => {
    setConfig({
      lidarr: { url: 'http://test.com', apiKey: 'key' },
      lastfm: { apiKey: 'fm-key' },
    })
    expect(isConfigured()).toBe(true)
  })
})
