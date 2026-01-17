'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Check, AlertCircle } from 'lucide-react'
import type { ArtistSuggestion } from '@/types'
import { LoadingSpinner } from './LoadingSpinner'

interface ArtistCardProps {
  suggestion: ArtistSuggestion
  onAdd: (suggestion: ArtistSuggestion) => Promise<void>
  isAdded?: boolean
}

export function ArtistCard({ suggestion, onAdd, isAdded = false }: ArtistCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(isAdded)

  const handleAdd = async () => {
    if (!suggestion.canAdd || added || isAdding) return
    setIsAdding(true)
    setError(null)
    try {
      await onAdd(suggestion)
      setAdded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add')
    } finally {
      setIsAdding(false)
    }
  }

  const matchPercent = Math.round(suggestion.matchScore * 100)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative bg-gray-200">
        {suggestion.imageUrl ? (
          <Image
            src={suggestion.imageUrl}
            alt={suggestion.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-4xl">
            🎵
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate" title={suggestion.name}>
          {suggestion.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">Similar to: {suggestion.sourceArtist}</p>
        <div className="flex items-center mt-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${matchPercent}%` }} />
          </div>
          <span className="ml-2 text-sm text-gray-600">{matchPercent}%</span>
        </div>
        {error && (
          <div className="mt-2 flex items-center text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" /> {error}
          </div>
        )}
        <button
          onClick={handleAdd}
          disabled={!suggestion.canAdd || added || isAdding}
          className={`mt-4 w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors
            ${added ? 'bg-green-500 text-white' : suggestion.canAdd ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          {isAdding ? <LoadingSpinner size="sm" /> : added ? <><Check className="h-4 w-4" /> Added</> : <><Plus className="h-4 w-4" /> {suggestion.canAdd ? 'Add to Lidarr' : 'No MBID'}</>}
        </button>
      </div>
    </div>
  )
}
