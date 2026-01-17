export interface LidarrArtist {
  id: number
  artistName: string
  foreignArtistId: string  // MusicBrainz ID
  disambiguation?: string  // e.g., "US rock band"
  overview?: string
  images?: LidarrImage[]
  monitored: boolean
  qualityProfileId: number
  metadataProfileId: number
  rootFolderPath: string
}

export interface LidarrImage {
  coverType: 'poster' | 'banner' | 'fanart' | 'logo'
  url: string
  remoteUrl?: string
}

export interface LidarrRootFolder {
  id: number
  path: string
  freeSpace: number
}

export interface LidarrQualityProfile {
  id: number
  name: string
}

export interface LidarrMetadataProfile {
  id: number
  name: string
}

export interface LidarrAddArtistRequest {
  artistName: string
  foreignArtistId: string
  qualityProfileId: number
  metadataProfileId: number
  monitored: boolean
  albumFolder: boolean
  rootFolderPath: string
  addOptions: {
    monitor: 'all' | 'future' | 'missing' | 'existing' | 'first' | 'latest' | 'none'
    searchForMissingAlbums: boolean
  }
}
