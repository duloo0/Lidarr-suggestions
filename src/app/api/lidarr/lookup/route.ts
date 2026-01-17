import { NextRequest, NextResponse } from 'next/server'
import { LidarrClient } from '@/lib/lidarr-client'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get('url')
  const apiKey = searchParams.get('apiKey')
  const mbid = searchParams.get('mbid')

  if (!url || !apiKey || !mbid) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const client = new LidarrClient({ baseUrl: url, apiKey })
    const results = await client.lookupArtist(mbid)

    if (results.length === 0) {
      return NextResponse.json({ error: 'Artist not found in MusicBrainz' }, { status: 404 })
    }

    const artist = results[0]
    return NextResponse.json({
      artistName: artist.artistName,
      foreignArtistId: artist.foreignArtistId,
      overview: artist.overview,
      images: artist.images,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
