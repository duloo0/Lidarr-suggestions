import { NextRequest, NextResponse } from 'next/server'
import { LidarrClient } from '@/lib/lidarr-client'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get('url')
  const apiKey = searchParams.get('apiKey')

  if (!url || !apiKey) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const client = new LidarrClient({ baseUrl: url, apiKey })
    const [rootFolders, qualityProfiles, metadataProfiles] = await Promise.all([
      client.getRootFolders(),
      client.getQualityProfiles(),
      client.getMetadataProfiles(),
    ])
    return NextResponse.json({ rootFolders, qualityProfiles, metadataProfiles })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
