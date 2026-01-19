'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getConfig, setConfig } from '@/lib/config'
import type { AppConfig } from '@/types'
import { LoadingSpinner } from './LoadingSpinner'
import { useBlacklist } from '@/hooks/useBlacklist'
import { Trash2 } from 'lucide-react'

interface Profiles {
  rootFolders: Array<{ id: number; path: string }>
  qualityProfiles: Array<{ id: number; name: string }>
  metadataProfiles: Array<{ id: number; name: string }>
}

export function SettingsForm() {
  const router = useRouter()
  const { blacklisted, unblacklist } = useBlacklist()
  const [config, setLocalConfig] = useState<AppConfig>({ lidarr: { url: '', apiKey: '' }, lastfm: { apiKey: '' } })
  const [profiles, setProfiles] = useState<Profiles | null>(null)
  const [defaults, setDefaults] = useState({ rootFolderPath: '', qualityProfileId: 0, metadataProfileId: 0 })
  const [isTesting, setIsTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => { setLocalConfig(getConfig()) }, [])

  const handleTest = async () => {
    if (!config.lidarr.url || !config.lidarr.apiKey) { setError('Enter Lidarr URL and API key'); return }
    setIsTesting(true); setError(null); setSuccess(null)
    try {
      const res = await fetch(`/api/lidarr/config?url=${encodeURIComponent(config.lidarr.url)}&apiKey=${encodeURIComponent(config.lidarr.apiKey)}`)
      if (!res.ok) throw new Error('Connection failed')
      const data = await res.json()
      setProfiles(data)
      if (data.rootFolders[0]) setDefaults(d => ({ ...d, rootFolderPath: data.rootFolders[0].path }))
      if (data.qualityProfiles[0]) setDefaults(d => ({ ...d, qualityProfileId: data.qualityProfiles[0].id }))
      if (data.metadataProfiles[0]) setDefaults(d => ({ ...d, metadataProfileId: data.metadataProfiles[0].id }))
      setSuccess('Connected!')
    } catch (e) { setError(String(e)) }
    finally { setIsTesting(false) }
  }

  const handleSave = () => {
    setConfig(config)
    localStorage.setItem('lidarr-defaults', JSON.stringify(defaults))
    router.push('/')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Lidarr</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lidarr URL</label>
              <input
                type="url"
                value={config.lidarr.url}
                onChange={e => setLocalConfig({ ...config, lidarr: { ...config.lidarr, url: e.target.value } })}
                placeholder="http://localhost:8686"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={config.lidarr.apiKey}
                onChange={e => setLocalConfig({ ...config, lidarr: { ...config.lidarr, apiKey: e.target.value } })}
                placeholder="Your Lidarr API key"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isTesting ? <><LoadingSpinner size="sm" /> Testing...</> : 'Test Connection'}
            </button>
          </div>
          {profiles && (
            <div className="mt-6 pt-4 border-t space-y-3">
              <h3 className="font-medium text-gray-700">Default Settings for Adding Artists</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Root Folder</label>
                <select
                  value={defaults.rootFolderPath}
                  onChange={e => setDefaults({ ...defaults, rootFolderPath: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {profiles.rootFolders.map(f => <option key={f.id} value={f.path}>{f.path}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality Profile</label>
                <select
                  value={defaults.qualityProfileId}
                  onChange={e => setDefaults({ ...defaults, qualityProfileId: +e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {profiles.qualityProfiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metadata Profile</label>
                <select
                  value={defaults.metadataProfileId}
                  onChange={e => setDefaults({ ...defaults, metadataProfileId: +e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {profiles.metadataProfiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Last.fm</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={config.lastfm.apiKey}
              onChange={e => setLocalConfig({ ...config, lastfm: { apiKey: e.target.value } })}
              placeholder="Your Last.fm API key"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Get an API key at{' '}
            <a href="https://www.last.fm/api/account/create" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              last.fm/api
            </a>
          </p>
        </div>
        {blacklisted.size > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              Blacklisted Artists ({blacklisted.size})
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              These artists will never appear in suggestions.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...blacklisted.values()].map(artist => (
                <div key={artist.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-900">{artist.name}</span>
                  <button
                    onClick={() => unblacklist(artist.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove from blacklist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}
        {success && <div className="p-4 bg-green-50 text-green-700 rounded-md">{success}</div>}
        <button
          onClick={handleSave}
          disabled={!config.lidarr.url || !config.lidarr.apiKey || !config.lastfm.apiKey}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}
