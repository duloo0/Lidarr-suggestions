'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DismissedArtist, BlacklistedArtist } from '@/types'

const DISMISSED_KEY = 'lidarr-dismissed'
const BLACKLIST_KEY = 'lidarr-blacklist'

export function useBlacklist() {
  const [dismissed, setDismissed] = useState<Map<string, DismissedArtist>>(new Map())
  const [blacklisted, setBlacklisted] = useState<Map<string, BlacklistedArtist>>(new Map())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const dismissedStr = localStorage.getItem(DISMISSED_KEY)
    const blacklistStr = localStorage.getItem(BLACKLIST_KEY)

    if (dismissedStr) {
      const arr: DismissedArtist[] = JSON.parse(dismissedStr)
      setDismissed(new Map(arr.map(d => [d.id, d])))
    }
    if (blacklistStr) {
      const arr: BlacklistedArtist[] = JSON.parse(blacklistStr)
      setBlacklisted(new Map(arr.map(b => [b.id, b])))
    }
    setIsReady(true)
  }, [])

  const saveDismissed = useCallback((map: Map<string, DismissedArtist>) => {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...map.values()]))
  }, [])

  const saveBlacklist = useCallback((map: Map<string, BlacklistedArtist>) => {
    localStorage.setItem(BLACKLIST_KEY, JSON.stringify([...map.values()]))
  }, [])

  const dismiss = useCallback((id: string, name: string) => {
    setDismissed(prev => {
      const next = new Map(prev)
      next.set(id, { id, name, dismissedAt: Date.now() })
      saveDismissed(next)
      return next
    })
  }, [saveDismissed])

  const undismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Map(prev)
      next.delete(id)
      saveDismissed(next)
      return next
    })
  }, [saveDismissed])

  const blacklist = useCallback((id: string, name: string, reason?: string) => {
    setBlacklisted(prev => {
      const next = new Map(prev)
      next.set(id, { id, name, blacklistedAt: Date.now(), reason })
      saveBlacklist(next)
      return next
    })
    // Also remove from dismissed if present
    setDismissed(prev => {
      const next = new Map(prev)
      next.delete(id)
      saveDismissed(next)
      return next
    })
  }, [saveBlacklist, saveDismissed])

  const unblacklist = useCallback((id: string) => {
    setBlacklisted(prev => {
      const next = new Map(prev)
      next.delete(id)
      saveBlacklist(next)
      return next
    })
  }, [saveBlacklist])

  const clearDismissed = useCallback(() => {
    setDismissed(new Map())
    localStorage.removeItem(DISMISSED_KEY)
  }, [])

  const isDismissed = useCallback((id: string) => dismissed.has(id), [dismissed])
  const isBlacklisted = useCallback((id: string) => blacklisted.has(id), [blacklisted])

  return {
    dismissed,
    blacklisted,
    isReady,
    dismiss,
    undismiss,
    blacklist,
    unblacklist,
    clearDismissed,
    isDismissed,
    isBlacklisted,
  }
}
