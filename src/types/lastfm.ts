export interface LastFmImage {
  '#text': string
  size: 'small' | 'medium' | 'large' | 'extralarge' | 'mega' | ''
}

export interface LastFmSimilarArtist {
  name: string
  mbid: string
  match: string
  url: string
  image: LastFmImage[]
}

export interface LastFmSimilarResponse {
  similarartists: {
    artist: LastFmSimilarArtist[]
    '@attr': { artist: string }
  }
}

export interface ArtistSuggestion {
  name: string
  mbid: string | null
  matchScore: number
  imageUrl: string | null
  sourceArtist: string
  canAdd: boolean
  // Extended MusicBrainz data
  type?: string          // "Group", "Person", "Orchestra", etc.
  country?: string       // "US", "GB", etc.
  disambiguation?: string
  genres?: string[]
}
