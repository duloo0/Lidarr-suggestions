import { LastFmClient } from '@/lib/lastfm-client'

const mockFetch = jest.fn()
global.fetch = mockFetch

jest.mock('@/lib/throttle', () => ({
  getLastFmThrottle: () => ({ execute: <T>(fn: () => Promise<T>) => fn() }),
}))

describe('LastFmClient', () => {
  let client: LastFmClient

  beforeEach(() => {
    mockFetch.mockReset()
    client = new LastFmClient({ apiKey: 'test-key' })
  })

  it('should fetch similar artists', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        similarartists: {
          artist: [{
            name: 'Similar',
            mbid: 'mbid-123',
            match: '0.95',
            url: '',
            image: [{ '#text': 'https://img.com/large.jpg', size: 'large' }],
          }],
        },
      }),
    })

    const suggestions = await client.getSimilarArtists('Test Artist')

    expect(suggestions[0].name).toBe('Similar')
    expect(suggestions[0].matchScore).toBe(0.95)
    expect(suggestions[0].canAdd).toBe(true)
  })

  it('should handle artists without MBID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        similarartists: {
          artist: [{ name: 'No MBID', mbid: '', match: '0.5', url: '', image: [] }],
        },
      }),
    })

    const suggestions = await client.getSimilarArtists('Test')
    expect(suggestions[0].canAdd).toBe(false)
  })
})
