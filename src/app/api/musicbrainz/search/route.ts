import { NextRequest, NextResponse } from 'next/server'

interface MusicBrainzArtist {
  id: string
  name: string
  disambiguation?: string
  type?: string
  country?: string
  tags?: { name: string; count: number }[]
}

interface MusicBrainzResponse {
  artists: MusicBrainzArtist[]
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const term = searchParams.get('term')

  if (!term) {
    return NextResponse.json({ error: 'Missing search term' }, { status: 400 })
  }

  try {
    const url = `https://musicbrainz.org/ws/2/artist?query=artist:${encodeURIComponent(term)}&fmt=json&limit=10`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'LidarrSuggestions/1.0 (https://github.com/duloo0/Lidarr-suggestions)',
      },
    })

    if (!res.ok) {
      throw new Error(`MusicBrainz API error: ${res.status}`)
    }

    const data: MusicBrainzResponse = await res.json()

    return NextResponse.json({
      artists: data.artists.map(a => ({
        artistName: a.name,
        foreignArtistId: a.id,
        disambiguation: a.disambiguation,
        type: a.type,
        country: a.country,
        genres: a.tags?.slice(0, 5).map(t => t.name) || [],
      })),
      multipleResults: data.artists.length > 1,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
