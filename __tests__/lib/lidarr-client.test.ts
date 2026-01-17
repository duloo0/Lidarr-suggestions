import { LidarrClient } from '@/lib/lidarr-client'

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('LidarrClient', () => {
  let client: LidarrClient

  beforeEach(() => {
    mockFetch.mockReset()
    client = new LidarrClient({ baseUrl: 'http://localhost:8686', apiKey: 'test-key' })
  })

  it('should fetch artists with correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: 1, artistName: 'Test' }]),
    })

    await client.getArtists()

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8686/api/v1/artist',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Api-Key': 'test-key' }),
      })
    )
  })

  it('should add artist with POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    })

    await client.addArtist({
      artistName: 'New',
      foreignArtistId: 'mbid',
      qualityProfileId: 1,
      metadataProfileId: 1,
      monitored: true,
      albumFolder: true,
      rootFolderPath: '/music/',
      addOptions: { monitor: 'all', searchForMissingAlbums: false },
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8686/api/v1/artist',
      expect.objectContaining({ method: 'POST' })
    )
  })
})
