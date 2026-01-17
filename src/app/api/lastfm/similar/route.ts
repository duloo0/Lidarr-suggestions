import { NextRequest, NextResponse } from 'next/server'
import { LastFmClient } from '@/lib/lastfm-client'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const apiKey = searchParams.get('apiKey')
  const artist = searchParams.get('artist')
  const limit = searchParams.get('limit')

  if (!apiKey || !artist) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const client = new LastFmClient({ apiKey })
    const suggestions = await client.getSimilarArtists(artist, limit ? parseInt(limit) : 10)
    return NextResponse.json(suggestions)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
