'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Check, AlertCircle, X } from 'lucide-react'
import type { ArtistSuggestion, AppConfig } from '@/types'
import { LoadingSpinner } from './LoadingSpinner'

interface MusicBrainzArtist {
  artistName: string
  foreignArtistId: string
  overview?: string
}

interface ArtistCardProps {
  suggestion: ArtistSuggestion
  onAdd: (suggestion: ArtistSuggestion) => Promise<void>
  isAdded?: boolean
  config: AppConfig | null
}

export function ArtistCard({ suggestion, onAdd, isAdded = false, config }: ArtistCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(isAdded)
  const [pendingArtist, setPendingArtist] = useState<MusicBrainzArtist | null>(null)

  const handleAddClick = async () => {
    if (!suggestion.canAdd || added || isAdding || isLookingUp || !config) return
    setIsLookingUp(true)
    setError(null)
    try {
      const res = await fetch(`/api/lidarr/lookup?url=${encodeURIComponent(config.lidarr.url)}&apiKey=${encodeURIComponent(config.lidarr.apiKey)}&mbid=${encodeURIComponent(suggestion.mbid!)}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Lookup failed')
      }
      const mbArtist: MusicBrainzArtist = await res.json()
      setPendingArtist(mbArtist)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lookup')
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleConfirm = async () => {
    if (!pendingArtist) return
    setIsAdding(true)
    setError(null)
    try {
      await onAdd(suggestion)
      setAdded(true)
      setPendingArtist(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add')
    } finally {
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setPendingArtist(null)
    setError(null)
  }

  const matchPercent = Math.round(suggestion.matchScore * 100)
  const nameMatches = pendingArtist && pendingArtist.artistName.toLowerCase() === suggestion.name.toLowerCase()

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
        <h3 className="font-semibold text-lg truncate text-gray-900" title={suggestion.name}>
          {suggestion.name}
        </h3>
        <p className="text-sm text-gray-700 mt-1">Similar to: {suggestion.sourceArtist}</p>
        <div className="flex items-center mt-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${matchPercent}%` }} />
          </div>
          <span className="ml-2 text-sm font-medium text-gray-800">{matchPercent}%</span>
        </div>

        {/* Confirmation dialog */}
        {pendingArtist && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 uppercase font-medium">MusicBrainz Artist:</span>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className={`font-medium ${nameMatches ? 'text-gray-900' : 'text-amber-600'}`}>
              {pendingArtist.artistName}
            </p>
            {!nameMatches && (
              <p className="text-xs text-amber-600 mt-1">Name differs from suggestion</p>
            )}
            {pendingArtist.overview && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pendingArtist.overview}</p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleConfirm}
                disabled={isAdding}
                className="flex-1 py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md flex items-center justify-center gap-1"
              >
                {isAdding ? <LoadingSpinner size="sm" /> : <><Check className="h-3 w-3" /> Add</>}
              </button>
              <button
                onClick={handleCancel}
                disabled={isAdding}
                className="flex-1 py-1.5 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-2 flex items-center text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" /> <span className="line-clamp-2">{error}</span>
          </div>
        )}

        {!pendingArtist && (
          <button
            onClick={handleAddClick}
            disabled={!suggestion.canAdd || added || isAdding || isLookingUp}
            className={`mt-4 w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors
              ${added ? 'bg-green-500 text-white' : suggestion.canAdd ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {isLookingUp ? <LoadingSpinner size="sm" /> : added ? <><Check className="h-4 w-4" /> Added</> : <><Plus className="h-4 w-4" /> {suggestion.canAdd ? 'Add to Lidarr' : 'No MBID'}</>}
          </button>
        )}
      </div>
    </div>
  )
}
