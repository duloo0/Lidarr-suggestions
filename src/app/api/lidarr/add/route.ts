import { NextRequest, NextResponse } from 'next/server'
import { LidarrClient } from '@/lib/lidarr-client'

export async function POST(request: NextRequest) {
  try {
    const { url, apiKey, artist } = await request.json()
    if (!url || !apiKey || !artist) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const client = new LidarrClient({ baseUrl: url, apiKey })
    const lookupResults = await client.lookupArtist(artist.foreignArtistId)

    if (lookupResults.length === 0) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    const artistToAdd = { ...lookupResults[0], ...artist }
    const added = await client.addArtist(artistToAdd)
    return NextResponse.json(added)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
