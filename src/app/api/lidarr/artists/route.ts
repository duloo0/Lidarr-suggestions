import { NextRequest, NextResponse } from 'next/server'
import { LidarrClient } from '@/lib/lidarr-client'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get('url')
  const apiKey = searchParams.get('apiKey')

  if (!url || !apiKey) {
    return NextResponse.json({ error: 'Missing url or apiKey' }, { status: 400 })
  }

  try {
    const client = new LidarrClient({ baseUrl: url, apiKey })
    const artists = await client.getArtists()
    return NextResponse.json(artists.map((a) => ({
      id: a.id,
      name: a.artistName,
      mbid: a.foreignArtistId,
    })))
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
