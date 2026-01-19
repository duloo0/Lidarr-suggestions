'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useConfig } from '@/hooks/useConfig'
import { useSuggestions } from '@/hooks/useSuggestions'
import { ArtistGrid } from '@/components/ArtistGrid'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Home() {
  const router = useRouter()
  const { config, isReady, isComplete } = useConfig()
  const { suggestions, libraryMbids, isLoading, progress, error, fetchSuggestions, addArtist, dismissSuggestion, blacklistArtist } = useSuggestions(config)

  useEffect(() => { if (isReady && !isComplete) router.push('/settings') }, [isReady, isComplete, router])
  useEffect(() => { if (isReady && isComplete && config) fetchSuggestions(false) }, [isReady, isComplete, config, fetchSuggestions])

  if (!isReady) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Artist Suggestions</h1>
          <p className="text-gray-600 mt-1">Based on {libraryMbids.size} artists in your library</p>
        </div>
        <button onClick={() => fetchSuggestions(true)} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}
      <ArtistGrid suggestions={suggestions} onAdd={addArtist} onDismiss={dismissSuggestion} onBlacklist={blacklistArtist} addedMbids={libraryMbids} libraryMbids={libraryMbids} isLoading={isLoading} loadingProgress={progress || undefined} config={config} />
    </div>
  )
}
