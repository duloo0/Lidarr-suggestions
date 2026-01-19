'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ArtistSuggestion, AppConfig } from '@/types'

const CACHE_KEY = 'lidarr-suggestions-cache'

interface CachedData {
  suggestions: ArtistSuggestion[]
  libraryMbids: string[]
  timestamp: number
}

function loadCache(): CachedData | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    return JSON.parse(cached)
  } catch {
    return null
  }
}

function saveCache(suggestions: ArtistSuggestion[], libraryMbids: Set<string>) {
  if (typeof window === 'undefined') return
  const data: CachedData = {
    suggestions,
    libraryMbids: Array.from(libraryMbids),
    timestamp: Date.now(),
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
}

export function useSuggestions(config: AppConfig | null) {
  const [suggestions, setSuggestions] = useState<ArtistSuggestion[]>([])
  const [libraryMbids, setLibraryMbids] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasCachedData, setHasCachedData] = useState(false)

  // Load from cache on mount
  useEffect(() => {
    const cached = loadCache()
    if (cached && cached.suggestions.length > 0) {
      setSuggestions(cached.suggestions)
      setLibraryMbids(new Set(cached.libraryMbids))
      setHasCachedData(true)
    }
  }, [])

  const fetchSuggestions = useCallback(async (forceRefresh = false) => {
    // Use cache if available and not forcing refresh
    if (!forceRefresh && hasCachedData) return
    if (!config) return
    setIsLoading(true); setError(null); setSuggestions([])

    try {
      const res = await fetch(`/api/lidarr/artists?url=${encodeURIComponent(config.lidarr.url)}&apiKey=${encodeURIComponent(config.lidarr.apiKey)}`)
      if (!res.ok) throw new Error('Failed to fetch artists')
      const artists: Array<{ id: number; name: string; mbid: string }> = await res.json()

      const mbidSet = new Set(artists.map(a => a.mbid))
      // Also track artist names (normalized) to catch duplicates with different MBIDs
      const nameSet = new Set(artists.map(a => a.name.toLowerCase().trim()))
      setLibraryMbids(mbidSet)

      const allSuggestions: ArtistSuggestion[] = []
      setProgress({ current: 0, total: artists.length })

      for (let i = 0; i < artists.length; i++) {
        setProgress({ current: i + 1, total: artists.length })
        try {
          const simRes = await fetch(`/api/lastfm/similar?apiKey=${encodeURIComponent(config.lastfm.apiKey)}&artist=${encodeURIComponent(artists[i].name)}&limit=10`)
          if (simRes.ok) {
            const similar: ArtistSuggestion[] = await simRes.json()
            // Filter out artists already in library by MBID or by name
            allSuggestions.push(...similar.filter(s => {
              if (s.mbid && mbidSet.has(s.mbid)) return false
              if (nameSet.has(s.name.toLowerCase().trim())) return false
              return true
            }))
          }
        } catch { /* continue */ }
      }

      // Deduplicate and count occurrences
      const byMbid = new Map<string, { suggestion: ArtistSuggestion; count: number; sources: string[] }>()
      const byName = new Map<string, { suggestion: ArtistSuggestion; count: number; sources: string[] }>()

      for (const s of allSuggestions) {
        if (s.mbid) {
          const existing = byMbid.get(s.mbid)
          if (existing) {
            existing.count++
            if (!existing.sources.includes(s.sourceArtist)) {
              existing.sources.push(s.sourceArtist)
            }
            // Keep highest match score
            if (s.matchScore > existing.suggestion.matchScore) {
              existing.suggestion = { ...s, sourceArtist: existing.sources.slice(0, 3).join(', ') }
            }
          } else {
            byMbid.set(s.mbid, { suggestion: s, count: 1, sources: [s.sourceArtist] })
          }
        } else {
          const key = s.name.toLowerCase()
          const existing = byName.get(key)
          if (existing) {
            existing.count++
            if (!existing.sources.includes(s.sourceArtist)) {
              existing.sources.push(s.sourceArtist)
            }
            if (s.matchScore > existing.suggestion.matchScore) {
              existing.suggestion = { ...s, sourceArtist: existing.sources.slice(0, 3).join(', ') }
            }
          } else {
            byName.set(key, { suggestion: s, count: 1, sources: [s.sourceArtist] })
          }
        }
      }

      // Update sourceArtist to show multiple sources
      const withCounts = [...byMbid.values(), ...byName.values()].map(({ suggestion, count, sources }) => ({
        ...suggestion,
        sourceArtist: sources.length > 1 ? `${sources.slice(0, 3).join(', ')}${sources.length > 3 ? ` +${sources.length - 3} more` : ''}` : sources[0],
        _count: count,
      }))

      // Sort by count (most suggested first), then by match score
      const unique = withCounts
        .sort((a, b) => b._count - a._count || b.matchScore - a.matchScore)
        .map(({ _count, ...s }) => s as ArtistSuggestion)
      setSuggestions(unique)
      saveCache(unique, mbidSet)
      setHasCachedData(true)
    } catch (e) { setError(String(e)) }
    finally { setIsLoading(false); setProgress(null) }
  }, [config, hasCachedData])

  const addArtist = useCallback(async (suggestion: ArtistSuggestion) => {
    if (!config || !suggestion.mbid) throw new Error('Cannot add without MBID')

    const defaultsStr = localStorage.getItem('lidarr-defaults')
    if (!defaultsStr) {
      throw new Error('Please go to Settings, click "Test Connection", and save again')
    }
    const defaults = JSON.parse(defaultsStr)
    if (!defaults.rootFolderPath) {
      throw new Error('Root folder not configured. Go to Settings and test connection first.')
    }

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
    setLibraryMbids(prev => {
      const updated = new Set([...prev, suggestion.mbid!])
      // Update cache with new library mbid
      saveCache(suggestions, updated)
      return updated
    })
  }, [config, suggestions])

  const dismissSuggestion = useCallback((id: string, name: string) => {
    // Remove from current suggestions list
    setSuggestions(prev => prev.filter(s => (s.mbid || s.name) !== id))
    console.log(`Dismissed suggestion: ${name}`)
  }, [])

  const blacklistArtist = useCallback((id: string, name: string) => {
    // Remove from current suggestions list
    setSuggestions(prev => prev.filter(s => (s.mbid || s.name) !== id))
    console.log(`Blacklisted artist: ${name}`)
  }, [])

  return { suggestions, libraryMbids, isLoading, progress, error, fetchSuggestions, addArtist, dismissSuggestion, blacklistArtist }
}
