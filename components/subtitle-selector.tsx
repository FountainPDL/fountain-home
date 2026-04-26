"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Subtitles, Download, Loader2, ChevronDown, ChevronUp } from "lucide-react"

interface SubtitleSelectorProps {
  mediaType: "movie" | "tv"
  tmdbId: number
  season?: number
  episode?: number
}

interface Subtitle {
  sd_id: string
  name: string
  release_name: string
  lang: string
  author: string
  url: string
  subtitles_count?: number
  hi?: boolean
  rating?: number
  download_count?: number
}

const languageNames: Record<string, string> = {
  EN: "English", ES: "Spanish", FR: "French", DE: "German", IT: "Italian",
  PT: "Portuguese", AR: "Arabic", ZH: "Chinese", JA: "Japanese", KO: "Korean",
  RU: "Russian", HI: "Hindi", TR: "Turkish", NL: "Dutch", PL: "Polish",
  SV: "Swedish", DA: "Danish", NO: "Norwegian", FI: "Finnish",
}

export function SubtitleSelector({ mediaType, tmdbId, season, episode }: SubtitleSelectorProps) {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")

  useEffect(() => {
    fetchSubtitles()
  }, [tmdbId, season, episode])

  const fetchSubtitles = async () => {
    setLoading(true)
    setError(null)
    try {
      // Call SubDL API directly from client (no server proxy needed)
      const params = new URLSearchParams({
        api_key: "demo-api-key",
        tmdb_id: tmdbId.toString(),
        type: mediaType,
        languages: "EN,ES,FR,DE,IT,PT,AR,ZH,JA,KO,RU,HI,TR,NL,PL,SV,DA,NO,FI",
        subs_per_page: "30",
      })
      if (season) params.append("season_number", season.toString())
      if (episode) params.append("episode_number", episode.toString())

      const response = await fetch(`https://api.subdl.com/api/v1/subtitles?${params.toString()}`)
      const data = await response.json()
      if (data.status && data.subtitles) {
        setSubtitles(data.subtitles)
      } else {
        setError("No subtitles found")
      }
    } catch {
      setError("Failed to load subtitles")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (subtitle: Subtitle) => {
    window.open(`https://dl.subdl.com${subtitle.url}`, "_blank")
  }

  const handleLoadSubtitle = async (subtitle: Subtitle) => {
    if ((window as any).loadSubtitle) {
      await (window as any).loadSubtitle(subtitle.url)
    }
  }

  const filteredSubtitles = selectedLanguage === "all"
    ? subtitles
    : subtitles.filter((sub) => sub.lang === selectedLanguage)

  const availableLanguages = Array.from(new Set(subtitles.map((sub) => sub.lang)))

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Subtitles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Subtitles</span>
            {subtitles.length > 0 && (
              <Badge variant="secondary" className="text-xs">{filteredSubtitles.length}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {error && !loading && <div className="text-sm text-muted-foreground text-center py-4">{error}</div>}

        {!loading && !error && subtitles.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={selectedLanguage === "all" ? "default" : "outline"}
                className="cursor-pointer" onClick={() => setSelectedLanguage("all")}>
                All Languages
              </Badge>
              {availableLanguages.slice(0, isExpanded ? undefined : 5).map((lang) => (
                <Badge key={lang} variant={selectedLanguage === lang ? "default" : "outline"}
                  className="cursor-pointer" onClick={() => setSelectedLanguage(lang)}>
                  {languageNames[lang] || lang}
                </Badge>
              ))}
            </div>
            {isExpanded && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredSubtitles.map((subtitle) => (
                  <div key={subtitle.sd_id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{languageNames[subtitle.lang] || subtitle.lang}</Badge>
                        {subtitle.hi && <Badge variant="outline" className="text-xs">HI</Badge>}
                      </div>
                      <p className="text-sm font-medium truncate">{subtitle.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{subtitle.release_name}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="default" onClick={() => handleLoadSubtitle(subtitle)} className="gap-1">
                        <Subtitles className="h-4 w-4" />Load
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownload(subtitle)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isExpanded && filteredSubtitles.length > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                Click to view {filteredSubtitles.length} subtitle{filteredSubtitles.length !== 1 ? "s" : ""}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
