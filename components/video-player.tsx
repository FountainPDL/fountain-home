"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Server, Subtitles, Play, Pause, AlertCircle, SkipForward, SkipBack, RotateCcw } from "lucide-react"
import { addToWatchHistory, getUserPreferences } from "@/lib/storage"
import { SubtitleOverlay } from "@/components/subtitle-overlay"
import { type SubtitleCue, parseSRT } from "@/lib/subtitle-parser"

interface VideoPlayerProps {
  mediaType: "movie" | "tv"
  tmdbId: number
  imdbId?: string
  season?: number
  episode?: number
  title: string
  posterPath?: string
}

export function VideoPlayer({ mediaType, tmdbId, imdbId, season, episode, title, posterPath }: VideoPlayerProps) {
  const [activeSource, setActiveSource] = useState("vidsrc")
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false)
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [failedServers, setFailedServers] = useState<string[]>([])
  const [serverError, setServerError] = useState(false)
  const [subtitleOffset, setSubtitleOffset] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [useCustomPlayer, setUseCustomPlayer] = useState(false)

  useEffect(() => {
    const prefs = getUserPreferences()
    setActiveSource(prefs.defaultServer)

    addToWatchHistory({
      id: tmdbId.toString(),
      type: mediaType,
      title,
      posterPath: posterPath || "",
      progress: 0,
      season,
      episode,
    })
  }, [tmdbId, mediaType, title, posterPath, season, episode])

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => prev + 0.1)
      }, 100)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!subtitlesEnabled || subtitleCues.length === 0) return

      switch (e.key) {
        case " ":
          e.preventDefault()
          setIsPlaying((prev) => !prev)
          break
        case "ArrowLeft":
          e.preventDefault()
          setCurrentTime((prev) => Math.max(0, prev - 5))
          break
        case "ArrowRight":
          e.preventDefault()
          setCurrentTime((prev) => prev + 5)
          break
        case "r":
        case "R":
          e.preventDefault()
          setCurrentTime(0)
          setIsPlaying(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [subtitlesEnabled, subtitleCues.length])

  const handleServerError = () => {
    const sources = ["vidsrc", "2embed", "autoembed", "superembed"]
    const newFailedServers = [...failedServers, activeSource]
    setFailedServers(newFailedServers)
    setServerError(true)

    const nextServer = sources.find((source) => !newFailedServers.includes(source))

    if (nextServer) {
      setTimeout(() => {
        setActiveSource(nextServer)
        setServerError(false)
      }, 1500)
    }
  }

  useEffect(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
    }

    loadTimeoutRef.current = setTimeout(() => {
      handleServerError()
    }, 15000) // 15 second timeout

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [activeSource])

  const getEmbedUrl = (source: string) => {
    const id = imdbId || tmdbId.toString()

    switch (source) {
      case "vidsrc":
        if (mediaType === "movie") {
          return `https://vidsrc.to/embed/movie/${id}`
        }
        return `https://vidsrc.to/embed/tv/${id}${season ? `/${season}` : ""}${episode ? `/${episode}` : ""}`

      case "2embed":
        if (mediaType === "movie") {
          return `https://www.2embed.cc/embed/${id}`
        }
        return `https://www.2embed.cc/embedtv/${id}${season && episode ? `&s=${season}&e=${episode}` : ""}`

      case "autoembed":
        if (mediaType === "movie") {
          return `https://player.autoembed.cc/embed/movie/${id}`
        }
        return `https://player.autoembed.cc/embed/tv/${id}${season ? `/${season}` : ""}${episode ? `/${episode}` : ""}`

      case "superembed":
        if (mediaType === "movie") {
          return `https://multiembed.mov/?video_id=${id}`
        }
        return `https://multiembed.mov/?video_id=${id}${season ? `&s=${season}` : ""}${episode ? `&e=${episode}` : ""}`

      default:
        return ""
    }
  }

  const loadSubtitleFile = async (subtitleUrl: string) => {
    try {
      const fullUrl = `/api/subtitles/download?url=${encodeURIComponent(subtitleUrl)}`
      const response = await fetch(fullUrl)
      const data = await response.json()

      if (data.content) {
        const cues = parseSRT(data.content)
        setSubtitleCues(cues)
        setSubtitlesEnabled(true)
        setCurrentTime(0)
        setSubtitleOffset(0)
        setIsPlaying(true)
      } else if (data.error) {
        alert(data.error)
      }
    } catch (error) {
      alert("Failed to load subtitle file")
    }
  }

  useEffect(() => {
    ;(window as any).loadSubtitle = loadSubtitleFile

    return () => {
      delete (window as any).loadSubtitle
    }
  }, [])

  const sources = [
    { id: "vidsrc", name: "VidSrc" },
    { id: "2embed", name: "2Embed" },
    { id: "autoembed", name: "AutoEmbed" },
    { id: "superembed", name: "SuperEmbed" },
  ]

  const adjustedTime = currentTime + subtitleOffset

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement
      setIsFullscreen(isNowFullscreen)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="p-0">
        <div ref={videoContainerRef} className="relative aspect-video w-full bg-black">
          {serverError && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="text-center space-y-2">
                <AlertCircle className="h-12 w-12 text-primary mx-auto animate-pulse" />
                <p className="text-white font-medium">Server failed, switching to next available server...</p>
              </div>
            </div>
          )}

          {useCustomPlayer ? (
            <div className="absolute inset-0 h-full w-full bg-black/80 flex items-center justify-center text-white">
              Custom Player Placeholder
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              key={activeSource}
              src={getEmbedUrl(activeSource)}
              className="absolute inset-0 h-full w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title="Video Player"
              onError={handleServerError}
              onLoad={() => {
                if (loadTimeoutRef.current) {
                  clearTimeout(loadTimeoutRef.current)
                }
              }}
            />
          )}

          <SubtitleOverlay
            cues={subtitleCues}
            currentTime={adjustedTime}
            enabled={subtitlesEnabled}
            isFullscreen={isFullscreen}
          />

          {subtitlesEnabled && subtitleCues.length > 0 && !isFullscreen && (
            <div className="absolute bottom-4 left-4 right-4 z-20 space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-black/80 hover:bg-black/90 backdrop-blur"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCurrentTime((prev) => Math.max(0, prev - 5))}
                  className="bg-black/80 hover:bg-black/90 backdrop-blur"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCurrentTime((prev) => prev + 5)}
                  className="bg-black/80 hover:bg-black/90 backdrop-blur"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setCurrentTime(0)
                    setIsPlaying(false)
                  }}
                  className="bg-black/80 hover:bg-black/90 backdrop-blur"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <div className="bg-black/80 backdrop-blur px-3 py-1 rounded text-sm text-white font-mono">
                  {Math.floor(currentTime / 60)}:
                  {Math.floor(currentTime % 60)
                    .toString()
                    .padStart(2, "0")}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-white bg-black/80 backdrop-blur px-2 py-1 rounded">Offset:</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSubtitleOffset((prev) => prev - 0.5)}
                    className="bg-black/80 hover:bg-black/90 backdrop-blur text-xs px-2"
                  >
                    -0.5s
                  </Button>
                  <span className="text-xs text-white bg-black/80 backdrop-blur px-2 py-1 rounded font-mono min-w-[60px] text-center">
                    {subtitleOffset.toFixed(1)}s
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSubtitleOffset((prev) => prev + 0.5)}
                    className="bg-black/80 hover:bg-black/90 backdrop-blur text-xs px-2"
                  >
                    +0.5s
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  value={[currentTime]}
                  onValueChange={([value]) => setCurrentTime(value)}
                  max={subtitleCues[subtitleCues.length - 1]?.endTime || 100}
                  step={0.1}
                  className="flex-1 bg-black/80 backdrop-blur rounded px-2 py-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Source Selector */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Select Server:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <Badge
                key={source.id}
                variant={activeSource === source.id ? "default" : "outline"}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  failedServers.includes(source.id) ? "opacity-50 line-through" : ""
                }`}
                onClick={() => {
                  setActiveSource(source.id)
                  setServerError(false)
                }}
              >
                {source.name}
              </Badge>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Use Custom Player:</span>
                <Button
                  size="sm"
                  variant={useCustomPlayer ? "default" : "outline"}
                  onClick={() => setUseCustomPlayer(!useCustomPlayer)}
                >
                  {useCustomPlayer ? "Yes" : "No"}
                </Button>
              </div>
            </div>
          </div>

          {subtitleCues.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Subtitles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Subtitles Loaded</span>
                  <Badge variant="secondary" className="text-xs">
                    {subtitleCues.length} cues
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant={subtitlesEnabled ? "default" : "outline"}
                  onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                >
                  {subtitlesEnabled ? "Hide" : "Show"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Keyboard shortcuts: Space (play/pause), ← → (skip 5s), R (reset)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
