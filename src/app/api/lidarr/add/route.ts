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
      return NextResponse.json({ error: 'Artist not found in MusicBrainz' }, { status: 404 })
    }

    const lookup = lookupResults[0]

    // Build add request with lookup data + user preferences
    const artistToAdd = {
      artistName: lookup.artistName,
      foreignArtistId: lookup.foreignArtistId,
      qualityProfileId: artist.qualityProfileId,
      metadataProfileId: artist.metadataProfileId,
      monitored: artist.monitored ?? true,
      albumFolder: artist.albumFolder ?? true,
      rootFolderPath: artist.rootFolderPath,
      addOptions: artist.addOptions ?? {
        monitor: 'all',
        searchForMissingAlbums: false,
      },
    }

    const added = await client.addArtist(artistToAdd)
    return NextResponse.json(added)
  } catch (error) {
    console.error('Add artist error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
