import type { LastFmSimilarResponse, ArtistSuggestion } from '@/types'
import { getLastFmThrottle } from './throttle'

export interface LastFmClientConfig {
  apiKey: string
}

export class LastFmClient {
  private apiKey: string
  private baseUrl = 'https://ws.audioscrobbler.com/2.0/'

  constructor(config: LastFmClientConfig) {
    this.apiKey = config.apiKey
  }

  async getSimilarArtists(artistName: string, limit = 10): Promise<ArtistSuggestion[]> {
    const throttle = getLastFmThrottle()

    return throttle.execute(async () => {
      const params = new URLSearchParams({
        method: 'artist.getsimilar',
        artist: artistName,
        api_key: this.apiKey,
        format: 'json',
        limit: limit.toString(),
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`)
      }

      const data: LastFmSimilarResponse = await response.json()
      if (!data.similarartists?.artist) return []

      return data.similarartists.artist.map((artist) => ({
        name: artist.name,
        mbid: artist.mbid || null,
        matchScore: parseFloat(artist.match),
        imageUrl: this.getBestImage(artist.image),
        sourceArtist: artistName,
        canAdd: !!artist.mbid,
      }))
    })
  }

  private getBestImage(images: { '#text': string; size: string }[]): string | null {
    for (const size of ['extralarge', 'large', 'medium', 'small']) {
      const image = images.find((img) => img.size === size && img['#text'])
      if (image?.['#text']) return image['#text']
    }
    return null
  }
}
