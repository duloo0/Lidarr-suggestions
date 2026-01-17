'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Check, AlertCircle, X, Search } from 'lucide-react'
import type { ArtistSuggestion, AppConfig } from '@/types'
import { LoadingSpinner } from './LoadingSpinner'

interface MusicBrainzArtist {
  artistName: string
  foreignArtistId: string
  disambiguation?: string
  overview?: string
}

interface LookupResponse {
  artists: MusicBrainzArtist[]
  multipleResults: boolean
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
  const [lookupResults, setLookupResults] = useState<MusicBrainzArtist[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleAddClick = async () => {
    if (added || isAdding || isLookingUp || !config) return

    // For artists without MBID, show search interface
    if (!suggestion.canAdd) {
      setShowSearch(true)
      setSearchTerm(suggestion.name)
      return
    }

    setIsLookingUp(true)
    setError(null)
    try {
      const res = await fetch(`/api/lidarr/lookup?url=${encodeURIComponent(config.lidarr.url)}&apiKey=${encodeURIComponent(config.lidarr.apiKey)}&mbid=${encodeURIComponent(suggestion.mbid!)}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Lookup failed')
      }
      const data: LookupResponse = await res.json()

      if (data.multipleResults) {
        setLookupResults(data.artists)
      } else {
        setPendingArtist(data.artists[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lookup')
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim() || !config) return
    setIsLookingUp(true)
    setError(null)
    try {
      const res = await fetch(`/api/lidarr/lookup?url=${encodeURIComponent(config.lidarr.url)}&apiKey=${encodeURIComponent(config.lidarr.apiKey)}&term=${encodeURIComponent(searchTerm)}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Search failed')
      }
      const data: LookupResponse = await res.json()
      setLookupResults(data.artists)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search')
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleSelectArtist = (artist: MusicBrainzArtist) => {
    setPendingArtist(artist)
    setLookupResults([])
  }

  const handleConfirm = async () => {
    if (!pendingArtist) return
    setIsAdding(true)
    setError(null)
    try {
      // Create modified suggestion with selected artist's data
      const suggestionToAdd: ArtistSuggestion = {
        ...suggestion,
        mbid: pendingArtist.foreignArtistId,
        name: pendingArtist.artistName,
        canAdd: true,
      }
      await onAdd(suggestionToAdd)
      setAdded(true)
      setPendingArtist(null)
      setShowSearch(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add')
    } finally {
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setPendingArtist(null)
    setLookupResults([])
    setShowSearch(false)
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

        {/* Multiple results selection UI */}
        {lookupResults.length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 uppercase font-medium">
                Select Artist ({lookupResults.length} found)
              </span>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {lookupResults.map((artist) => (
                <button
                  key={artist.foreignArtistId}
                  onClick={() => handleSelectArtist(artist)}
                  className="w-full text-left p-2 rounded hover:bg-gray-100 border border-transparent hover:border-gray-300"
                >
                  <p className="font-medium text-gray-900 text-sm">
                    {artist.artistName}
                    {artist.disambiguation && (
                      <span className="text-gray-500 font-normal ml-1">
                        ({artist.disambiguation})
                      </span>
                    )}
                  </p>
                  {artist.overview && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                      {artist.overview}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Manual search UI for "No MBID" artists */}
        {showSearch && lookupResults.length === 0 && !pendingArtist && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 uppercase font-medium">Search Lidarr</span>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Artist name..."
                className="flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                onClick={handleSearch}
                disabled={isLookingUp || !searchTerm.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLookingUp ? <LoadingSpinner size="sm" /> : 'Search'}
              </button>
            </div>
          </div>
        )}

        {/* Confirmation dialog */}
        {pendingArtist && lookupResults.length === 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 uppercase font-medium">MusicBrainz Artist:</span>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className={`font-medium ${nameMatches ? 'text-gray-900' : 'text-amber-600'}`}>
              {pendingArtist.artistName}
              {pendingArtist.disambiguation && (
                <span className="text-gray-500 font-normal ml-1">
                  ({pendingArtist.disambiguation})
                </span>
              )}
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

        {!pendingArtist && lookupResults.length === 0 && !showSearch && (
          <button
            onClick={handleAddClick}
            disabled={added || isAdding || isLookingUp}
            className={`mt-4 w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors
              ${added
                ? 'bg-green-500 text-white'
                : suggestion.canAdd
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
          >
            {isLookingUp ? (
              <LoadingSpinner size="sm" />
            ) : added ? (
              <><Check className="h-4 w-4" /> Added</>
            ) : suggestion.canAdd ? (
              <><Plus className="h-4 w-4" /> Add to Lidarr</>
            ) : (
              <><Search className="h-4 w-4" /> Search in Lidarr</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
