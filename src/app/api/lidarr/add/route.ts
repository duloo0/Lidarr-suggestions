import { NextRequest, NextResponse } from 'next/server'
import { LidarrClient } from '@/lib/lidarr-client'

export async function POST(request: NextRequest) {
  try {
    const { url, apiKey, artist } = await request.json()
    if (!url || !apiKey || !artist) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const client = new LidarrClient({ baseUrl: url, apiKey })

    // If artistName is provided, we have full data from MusicBrainz search - skip lookup
    const artistToAdd = artist.artistName ? {
      artistName: artist.artistName,
      foreignArtistId: artist.foreignArtistId,
      qualityProfileId: artist.qualityProfileId,
      metadataProfileId: artist.metadataProfileId,
      monitored: artist.monitored ?? true,
      albumFolder: artist.albumFolder ?? true,
      rootFolderPath: artist.rootFolderPath,
      addOptions: artist.addOptions ?? {
        monitor: 'all',
        searchForMissingAlbums: false,
      },
    } : await (async () => {
      // Legacy path: lookup by foreignArtistId only
      const lookupResults = await client.lookupArtist(artist.foreignArtistId)
      if (lookupResults.length === 0) {
        throw new Error('Artist not found in MusicBrainz')
      }
      const lookup = lookupResults[0]
      return {
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
    })()

    const added = await client.addArtist(artistToAdd)
    return NextResponse.json(added)
  } catch (error) {
    console.error('Add artist error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
