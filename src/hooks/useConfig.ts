'use client'

import { useState, useEffect, useCallback } from 'react'
import { getConfig, setConfig as saveConfig, isConfigured } from '@/lib/config'
import type { AppConfig } from '@/types'

export function useConfig() {
  const [config, setLocalConfig] = useState<AppConfig | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setLocalConfig(getConfig())
    setIsReady(true)
  }, [])

  const updateConfig = useCallback((newConfig: AppConfig) => {
    saveConfig(newConfig)
    setLocalConfig(newConfig)
  }, [])

  return { config, isReady, updateConfig, isComplete: isReady ? isConfigured() : false }
}
