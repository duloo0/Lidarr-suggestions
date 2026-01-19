'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ArtistCard } from './ArtistCard'
import { LoadingSpinner } from './LoadingSpinner'
import type { ArtistSuggestion, AppConfig } from '@/types'

const PAGE_SIZE = 20

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
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(suggestions.length / PAGE_SIZE)
  const start = page * PAGE_SIZE
  const paginated = suggestions.slice(start, start + PAGE_SIZE)

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
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {paginated.map((suggestion) => (
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
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-gray-700">
            Page {page + 1} of {totalPages} ({suggestions.length} artists)
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
