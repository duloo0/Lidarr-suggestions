'use client'

import { useState, useCallback } from 'react'
import type { ArtistSuggestion, AppConfig } from '@/types'

export function useSuggestions(config: AppConfig | null) {
  const [suggestions, setSuggestions] = useState<ArtistSuggestion[]>([])
  const [libraryMbids, setLibraryMbids] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestions = useCallback(async () => {
    if (!config) return
    setIsLoading(true); setError(null); setSuggestions([])

    try {
      const res = await fetch(`/api/lidarr/artists?url=${encodeURIComponent(config.lidarr.url)}&apiKey=${encodeURIComponent(config.lidarr.apiKey)}`)
      if (!res.ok) throw new Error('Failed to fetch artists')
      const artists: Array<{ id: number; name: string; mbid: string }> = await res.json()

      const mbidSet = new Set(artists.map(a => a.mbid))
      setLibraryMbids(mbidSet)

      const allSuggestions: ArtistSuggestion[] = []
      setProgress({ current: 0, total: artists.length })

      for (let i = 0; i < artists.length; i++) {
        setProgress({ current: i + 1, total: artists.length })
        try {
          const simRes = await fetch(`/api/lastfm/similar?apiKey=${encodeURIComponent(config.lastfm.apiKey)}&artist=${encodeURIComponent(artists[i].name)}&limit=10`)
          if (simRes.ok) {
            const similar: ArtistSuggestion[] = await simRes.json()
            allSuggestions.push(...similar.filter(s => !s.mbid || !mbidSet.has(s.mbid)))
          }
        } catch { /* continue */ }
      }

      // Deduplicate
      const byMbid = new Map<string, ArtistSuggestion>()
      const byName = new Map<string, ArtistSuggestion>()
      for (const s of allSuggestions) {
        if (s.mbid) {
          const existing = byMbid.get(s.mbid)
          if (!existing || s.matchScore > existing.matchScore) byMbid.set(s.mbid, s)
        } else {
          const key = s.name.toLowerCase()
          const existing = byName.get(key)
          if (!existing || s.matchScore > existing.matchScore) byName.set(key, s)
        }
      }
      const unique = [...byMbid.values(), ...byName.values()].sort((a, b) => b.matchScore - a.matchScore)
      setSuggestions(unique)
    } catch (e) { setError(String(e)) }
    finally { setIsLoading(false); setProgress(null) }
  }, [config])

  const addArtist = useCallback(async (suggestion: ArtistSuggestion) => {
    if (!config || !suggestion.mbid) throw new Error('Cannot add without MBID')

    const defaults = JSON.parse(localStorage.getItem('lidarr-defaults') || '{"rootFolderPath":"/music/","qualityProfileId":1,"metadataProfileId":1}')

    const res = await fetch('/api/lidarr/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: config.lidarr.url,
        apiKey: config.lidarr.apiKey,
        artist: {
          artistName: suggestion.name,
          foreignArtistId: suggestion.mbid,
          qualityProfileId: defaults.qualityProfileId,
          metadataProfileId: defaults.metadataProfileId,
          monitored: true,
          albumFolder: true,
          rootFolderPath: defaults.rootFolderPath,
          addOptions: { monitor: 'all', searchForMissingAlbums: false },
        },
      }),
    })
    if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed') }
    setLibraryMbids(prev => new Set([...prev, suggestion.mbid!]))
  }, [config])

  return { suggestions, libraryMbids, isLoading, progress, error, fetchSuggestions, addArtist }
}
