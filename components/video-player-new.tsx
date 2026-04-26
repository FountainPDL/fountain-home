"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, WifiOff, CheckCircle } from "lucide-react"
import { SubtitleSelector } from "@/components/subtitle-selector"

interface VideoPlayerProps {
  sources: Array<{ url: string; type: string; label: string }>
  title: string
  posterPath?: string
  mediaType?: "movie" | "tv"
  tmdbId?: number
  season?: number
  episode?: number
  hasNextEpisode?: boolean
  hasPreviousEpisode?: boolean
  nextEpisodeUrl?: string
  previousEpisodeUrl?: string
}

function getStorageKey(title: string, season?: number, episode?: number) {
  if (season && episode) return `offline_${title}_s${season}e${episode}`
  return `offline_${title}`
}

export function VideoPlayerNew({
  sources,
  title,
  posterPath,
  mediaType,
  tmdbId,
  season,
  episode,
  hasNextEpisode,
  nextEpisodeUrl,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [activeSource, setActiveSource] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isOffline, setIsOffline] = useState(false)
  const [downloadedSources, setDownloadedSources] = useState<Set<number>>(new Set())
  const [downloadingSource, setDownloadingSource] = useState<number | null>(null)
  const [cachedUrl, setCachedUrl] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine)
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    setIsOffline(!navigator.onLine)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  useEffect(() => {
    try {
      const key = getStorageKey(title, season, episode)
      const cached = localStorage.getItem(key)
      if (cached) {
        const data = JSON.parse(cached)
        if (data.downloaded) setDownloadedSources(new Set(data.downloaded))
        if (data.cachedUrl) setCachedUrl(data.cachedUrl)
      }
    } catch {}
  }, [title, season, episode])

  useEffect(() => {
    try {
      const key = getStorageKey(title, season, episode)
      const existing = JSON.parse(localStorage.getItem(key) || "{}")
      localStorage.setItem(key, JSON.stringify({
        ...existing,
        lastSource: activeSource,
        lastUrl: sources[activeSource]?.url,
        savedAt: Date.now(),
        title,
        season,
        episode,
      }))
    } catch {}
  }, [activeSource, sources, title, season, episode])

  useEffect(() => {
    if (error && retryCount < sources.length - 1) {
      const timer = setTimeout(() => {
        setActiveSource((prev) => (prev + 1) % sources.length)
        setError(false)
        setRetryCount((prev) => prev + 1)
        setIsLoading(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [error, retryCount, sources.length])

  useEffect(() => {
    if (hasNextEpisode && nextEpisodeUrl) {
      const handleAutoNext = () => { window.location.href = nextEpisodeUrl }
      window.addEventListener("videoended", handleAutoNext)
      return () => window.removeEventListener("videoended", handleAutoNext)
    }
  }, [hasNextEpisode, nextEpisodeUrl])

  const handleIframeLoad = () => { setIsLoading(false); setError(false) }
  const handleIframeError = () => { setIsLoading(false); setError(true) }

  const handleDownload = async (sourceIndex: number) => {
    try {
      setDownloadingSource(sourceIndex)
      const source = sources[sourceIndex]
      window.open(source.url, "_blank")
      const key = getStorageKey(title, season, episode)
      const existing = JSON.parse(localStorage.getItem(key) || "{}")
      const downloaded = new Set(downloadedSources)
      downloaded.add(sourceIndex)
      setDownloadedSources(downloaded)
      localStorage.setItem(key, JSON.stringify({
        ...existing,
        downloaded: Array.from(downloaded),
        cachedUrl: source.url,
      }))
    } catch {} finally {
      setDownloadingSource(null)
    }
  }

  return (
    <div className="space-y-4">
      {isOffline && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-400 text-sm">
          <WifiOff className="h-4 w-4 flex-shrink-0" />
          <span>You are offline. {cachedUrl ? "Playing cached version." : "Connect to stream."}</span>
        </div>
      )}

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="p-0">
          <div className="relative aspect-video w-full bg-black">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading video...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <p className="text-sm text-red-500">Failed to load. Switching mirrors...</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              key={`${activeSource}-${retryCount}`}
              src={isOffline && cachedUrl ? cachedUrl : sources[activeSource]?.url}
              className="w-full h-full"
              allowFullScreen={true}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              title="Video Player"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
            />
          </div>

          <div className="p-3 sm:p-4 border-t border-border/50 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sources</p>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={activeSource === index ? "default" : "outline"}
                    onClick={() => {
                      setActiveSource(index)
                      setRetryCount(0)
                      setError(false)
                      setIsLoading(true)
                    }}
                    className="text-xs touch-manipulation"
                  >
                    {downloadedSources.has(index) && <CheckCircle className="h-3 w-3 mr-1 text-green-400" />}
                    {source.label}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    title={`Download from ${source.label}`}
                    onClick={() => handleDownload(index)}
                    disabled={downloadingSource === index}
                    className="touch-manipulation p-1.5"
                  >
                    {downloadingSource === index
                      ? <RefreshCw className="h-3 w-3 animate-spin" />
                      : <Download className="h-3 w-3" />}
                  </Button>
                </div>
              ))}
            </div>
            {retryCount > 0 && (
              <Badge variant="outline" className="text-xs">Auto-switched {retryCount}x</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {mediaType && tmdbId && (
        <SubtitleSelector mediaType={mediaType} tmdbId={tmdbId} season={season} episode={episode} />
      )}
    </div>
  )
}
