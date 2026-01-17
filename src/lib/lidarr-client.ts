import type {
  LidarrArtist,
  LidarrRootFolder,
  LidarrQualityProfile,
  LidarrMetadataProfile,
  LidarrAddArtistRequest,
} from '@/types'

export interface LidarrClientConfig {
  baseUrl: string
  apiKey: string
}

export class LidarrClient {
  private baseUrl: string
  private apiKey: string

  constructor(config: LidarrClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.apiKey = config.apiKey
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (!response.ok) {
      let errorMessage = `Lidarr API error: ${response.status} ${response.statusText}`
      try {
        const errorBody = await response.json()
        if (errorBody.message) errorMessage = errorBody.message
        else if (typeof errorBody === 'string') errorMessage = errorBody
        else errorMessage += ` - ${JSON.stringify(errorBody)}`
      } catch {
        // Could not parse error body
      }
      throw new Error(errorMessage)
    }
    return response.json()
  }

  async getArtists(): Promise<LidarrArtist[]> {
    return this.fetch('/api/v1/artist')
  }

  async getRootFolders(): Promise<LidarrRootFolder[]> {
    return this.fetch('/api/v1/rootfolder')
  }

  async getQualityProfiles(): Promise<LidarrQualityProfile[]> {
    return this.fetch('/api/v1/qualityprofile')
  }

  async getMetadataProfiles(): Promise<LidarrMetadataProfile[]> {
    return this.fetch('/api/v1/metadataprofile')
  }

  async lookupArtist(mbid: string): Promise<LidarrArtist[]> {
    return this.fetch(`/api/v1/artist/lookup?term=lidarr:${mbid}`)
  }

  async searchArtist(term: string): Promise<LidarrArtist[]> {
    return this.fetch(`/api/v1/artist/lookup?term=${encodeURIComponent(term)}`)
  }

  async addArtist(request: LidarrAddArtistRequest): Promise<LidarrArtist> {
    return this.fetch('/api/v1/artist', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }
}
