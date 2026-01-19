'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw } from 'lucide-react'
import { useConfig } from '@/hooks/useConfig'
import { useSuggestions } from '@/hooks/useSuggestions'
import { useBlacklist } from '@/hooks/useBlacklist'
import { ArtistGrid } from '@/components/ArtistGrid'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Home() {
  const router = useRouter()
  const { config, isReady, isComplete } = useConfig()
  const { suggestions, libraryMbids, isLoading, progress, error, fetchSuggestions, addArtist } = useSuggestions(config)
  const { dismissed, blacklisted, isReady: blacklistReady, dismiss, blacklist, clearDismissed } = useBlacklist()

  // Filter out dismissed and blacklisted artists
  const filteredSuggestions = useMemo(() => {
    if (!blacklistReady) return []
    return suggestions.filter(s => {
      const id = s.mbid || s.name
      return !dismissed.has(id) && !blacklisted.has(id)
    })
  }, [suggestions, dismissed, blacklisted, blacklistReady])

  const dismissedCount = dismissed.size

  useEffect(() => { if (isReady && !isComplete) router.push('/settings') }, [isReady, isComplete, router])
  useEffect(() => { if (isReady && isComplete && config) fetchSuggestions(false) }, [isReady, isComplete, config, fetchSuggestions])

  if (!isReady || !blacklistReady) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Artist Suggestions</h1>
          <p className="text-gray-600 mt-1">
            Based on {libraryMbids.size} artists in your library
            {dismissedCount > 0 && (
              <span className="ml-2">
                · {dismissedCount} hidden
                <button
                  onClick={clearDismissed}
                  className="ml-1 text-blue-600 hover:text-blue-800 inline-flex items-center"
                  title="Show hidden artists"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </span>
            )}
          </p>
        </div>
        <button onClick={() => fetchSuggestions(true)} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}
      <ArtistGrid
        suggestions={filteredSuggestions}
        onAdd={addArtist}
        onDismiss={dismiss}
        onBlacklist={blacklist}
        addedMbids={libraryMbids}
        libraryMbids={libraryMbids}
        isLoading={isLoading}
        loadingProgress={progress || undefined}
        config={config}
      />
    </div>
  )
}
