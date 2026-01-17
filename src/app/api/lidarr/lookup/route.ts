import { NextRequest, NextResponse } from 'next/server'
import { LidarrClient } from '@/lib/lidarr-client'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get('url')
  const apiKey = searchParams.get('apiKey')
  const mbid = searchParams.get('mbid')
  const term = searchParams.get('term')

  if (!url || !apiKey || (!mbid && !term)) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const client = new LidarrClient({ baseUrl: url, apiKey })
    const results = mbid
      ? await client.lookupArtist(mbid)
      : await client.searchArtist(term!)

    if (results.length === 0) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    return NextResponse.json({
      artists: results.map(a => ({
        artistName: a.artistName,
        foreignArtistId: a.foreignArtistId,
        disambiguation: a.disambiguation,
        overview: a.overview,
      })),
      multipleResults: results.length > 1,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
