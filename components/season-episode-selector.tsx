"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Season {
  season_number: number
  episode_count: number
  name: string
}

interface SeasonEpisodeSelectorProps {
  seasons: Season[]
  currentSeason: number
  currentEpisode: number
  onSelect: (season: number, episode: number) => void
  tmdbId?: number
  slug?: string
}

export function SeasonEpisodeSelector({
  seasons,
  currentSeason,
  currentEpisode,
  tmdbId,
  slug = "",
}: SeasonEpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(currentSeason)
  const router = useRouter()

  const selectedSeasonData = seasons.find((s) => s.season_number === selectedSeason)
  const episodeCount = selectedSeasonData?.episode_count || 0

  const handleEpisodeSelect = (episode: number) => {
    if (tmdbId) {
      router.push(`/watch/tv/${tmdbId}-${slug}?season=${selectedSeason}&episode=${episode}`)
    }
  }

  const handleSeasonChange = (season: number) => {
    setSelectedSeason(season)
    // Automatically navigate to episode 1 of the selected season
    if (tmdbId) {
      router.push(`/watch/tv/${tmdbId}-${slug}?season=${season}&episode=1`)
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[200px] max-w-md">
              <label className="text-sm font-medium mb-2 block">Season</label>
              <Select value={selectedSeason.toString()} onValueChange={(v) => handleSeasonChange(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season.season_number} value={season.season_number.toString()}>
                      {season.name} ({season.episode_count} {season.episode_count === 1 ? "Episode" : "Episodes"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Episodes - {selectedSeasonData?.name}</label>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15 gap-2">
              {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
                <Button
                  key={ep}
                  variant={currentSeason === selectedSeason && currentEpisode === ep ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleEpisodeSelect(ep)}
                  className="aspect-square p-0 text-xs"
                  title={`Episode ${ep}`}
                >
                  {ep}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
