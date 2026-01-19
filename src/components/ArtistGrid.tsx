'use client'

import { ArtistCard } from './ArtistCard'
import { LoadingSpinner } from './LoadingSpinner'
import type { ArtistSuggestion, AppConfig } from '@/types'

interface ArtistGridProps {
  suggestions: ArtistSuggestion[]
  onAdd: (suggestion: ArtistSuggestion) => Promise<void>
  onDismiss: (id: string, name: string) => void
  onBlacklist: (id: string, name: string) => void
  addedMbids: Set<string>
  libraryMbids?: Set<string>
  isLoading?: boolean
  loadingProgress?: { current: number; total: number }
  config: AppConfig | null
}

export function ArtistGrid({ suggestions, onAdd, onDismiss, onBlacklist, addedMbids, libraryMbids, isLoading, loadingProgress, config }: ArtistGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" />
        {loadingProgress && (
          <p className="mt-4 text-gray-600">
            Fetching suggestions... {loadingProgress.current} / {loadingProgress.total} artists
          </p>
        )}
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">No suggestions found</p>
        <p className="mt-2">Make sure your Lidarr library has artists.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {suggestions.map((suggestion) => (
        <ArtistCard
          key={`${suggestion.mbid || suggestion.name}-${suggestion.sourceArtist}`}
          suggestion={suggestion}
          onAdd={onAdd}
          onDismiss={onDismiss}
          onBlacklist={onBlacklist}
          isAdded={suggestion.mbid ? addedMbids.has(suggestion.mbid) : false}
          isInLibrary={suggestion.mbid ? libraryMbids?.has(suggestion.mbid) ?? false : false}
          config={config}
        />
      ))}
    </div>
  )
}
