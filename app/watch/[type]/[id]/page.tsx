"use client"

import { useState, useEffect, use } from "react"
import { Star, Calendar, Clock, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VideoPlayerNew } from "@/components/video-player-new"
import { CastSection } from "@/components/cast-section"
import { RelatedContent } from "@/components/related-content"
import { CommentsSection } from "@/components/comments-section"
import { SeasonEpisodeSelector } from "@/components/season-episode-selector"
import { getMovieDetails, getTVDetails, getMovieCredits, getTVCredits, getSimilarMovies, getSimilarTV } from "@/lib/tmdb"

export default function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>
  searchParams: Promise<{ season?: string; episode?: string }>
}) {
  const { type, id } = use(params)
  const { season: seasonParam, episode: episodeParam } = use(searchParams)

  const [details, setDetails] = useState<any>(null)
  const [credits, setCredits] = useState<any>(null)
  const [similar, setSimilar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const idMatch = id?.match(/^(\d+)/)
  const tmdbId = idMatch ? parseInt(idMatch[1]) : parseInt(id)
  const currentSeason = seasonParam ? parseInt(seasonParam) : 1
  const currentEpisode = episodeParam ? parseInt(episodeParam) : 1

  useEffect(() => {
    if (!tmdbId || isNaN(tmdbId) || (type !== "movie" && type !== "tv")) {
      setError(true)
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      type === "movie" ? getMovieDetails(tmdbId) : getTVDetails(tmdbId),
      type === "movie" ? getMovieCredits(tmdbId) : getTVCredits(tmdbId),
      type === "movie" ? getSimilarMovies(tmdbId) : getSimilarTV(tmdbId),
    ]).then(([det, cred, sim]) => {
      setDetails(det)
      setCredits(cred)
      setSimilar(sim)
      setLoading(false)
    }).catch(() => {
      setError(true)
      setLoading(false)
    })
  }, [tmdbId, type])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    )
  }

  if (error || !details) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Failed to load content.</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />Go Back
        </Button>
      </div>
    )
  }

  const title = details.title || details.name
  const releaseDate = details.release_date || details.first_air_date
  const runtime = details.runtime || details.episode_run_time?.[0]
  const genres = details.genres || []
  const cast = credits?.cast || []
  const seasons = type === "tv" ? details.seasons?.filter((s: any) => s.season_number > 0) || [] : []
  const currentSeasonData = seasons.find((s: any) => s.season_number === currentSeason)
  const hasNextEpisode = currentEpisode < (currentSeasonData?.episode_count || 0)
  const hasPreviousEpisode = currentEpisode > 1 || currentSeason > 1
  const normalizedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  const movieSources = details.imdb_id
    ? [
        { url: `https://vidsrc.xyz/embed/movie/${details.imdb_id}`, type: "text/html", label: "VidSrc" },
        { url: `https://www.2embed.cc/embed/${details.imdb_id}`, type: "text/html", label: "2Embed" },
        { url: `https://autoembed.cc/movie/imdb/${details.imdb_id}`, type: "text/html", label: "AutoEmbed" },
        { url: `https://multiembed.mov/?video_id=${details.imdb_id}`, type: "text/html", label: "SuperEmbed" },
      ]
    : [
        { url: `https://vidsrc.xyz/embed/movie/${tmdbId}`, type: "text/html", label: "VidSrc" },
        { url: `https://www.2embed.cc/embed/tmdb/movie?id=${tmdbId}`, type: "text/html", label: "2Embed" },
        { url: `https://autoembed.cc/movie/tmdb/${tmdbId}`, type: "text/html", label: "AutoEmbed" },
        { url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`, type: "text/html", label: "SuperEmbed" },
      ]

  const tvSources = details.imdb_id
    ? [
        { url: `https://vidsrc.xyz/embed/tv/${details.imdb_id}/${currentSeason}/${currentEpisode}`, type: "text/html", label: "VidSrc" },
        { url: `https://www.2embed.cc/embedtv/${details.imdb_id}&s=${currentSeason}&e=${currentEpisode}`, type: "text/html", label: "2Embed" },
        { url: `https://autoembed.cc/tv/imdb/${details.imdb_id}/${currentSeason}/${currentEpisode}`, type: "text/html", label: "AutoEmbed" },
        { url: `https://multiembed.mov/?video_id=${details.imdb_id}&s=${currentSeason}&e=${currentEpisode}`, type: "text/html", label: "SuperEmbed" },
      ]
    : [
        { url: `https://vidsrc.xyz/embed/tv/${tmdbId}/${currentSeason}/${currentEpisode}`, type: "text/html", label: "VidSrc" },
        { url: `https://www.2embed.cc/embedtv/tmdb/tv?id=${tmdbId}&s=${currentSeason}&e=${currentEpisode}`, type: "text/html", label: "2Embed" },
        { url: `https://autoembed.cc/tv/tmdb/${tmdbId}/${currentSeason}/${currentEpisode}`, type: "text/html", label: "AutoEmbed" },
        { url: `https://multiembed.mov/?video_id=${tmdbId}&s=${currentSeason}&e=${currentEpisode}`, type: "text/html", label: "SuperEmbed" },
      ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
        <VideoPlayerNew
          sources={type === "movie" ? movieSources : tvSources}
          title={title}
          posterPath={details.poster_path}
          mediaType={type as "movie" | "tv"}
          tmdbId={tmdbId}
          season={type === "tv" ? currentSeason : undefined}
          episode={type === "tv" ? currentEpisode : undefined}
          hasNextEpisode={hasNextEpisode}
          hasPreviousEpisode={hasPreviousEpisode}
          nextEpisodeUrl={
            hasNextEpisode
              ? `/watch/tv/${tmdbId}-${normalizedSlug}?season=${currentSeason}&episode=${currentEpisode + 1}`
              : undefined
          }
          previousEpisodeUrl={
            currentEpisode > 1
              ? `/watch/tv/${tmdbId}-${normalizedSlug}?season=${currentSeason}&episode=${currentEpisode - 1}`
              : currentSeason > 1
                ? (() => {
                    const prevSeason = seasons.find((s: any) => s.season_number === currentSeason - 1)
                    return prevSeason
                      ? `/watch/tv/${tmdbId}-${normalizedSlug}?season=${currentSeason - 1}&episode=${prevSeason.episode_count}`
                      : undefined
                  })()
                : undefined
          }
        />

        {type === "tv" && seasons.length > 0 && (
          <SeasonEpisodeSelector
            seasons={seasons}
            currentSeason={currentSeason}
            currentEpisode={currentEpisode}
            tmdbId={tmdbId}
            slug={normalizedSlug}
          />
        )}

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="p-6 space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                {details.vote_average && (
                  <Badge variant="secondary" className="text-sm">
                    <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                    {details.vote_average.toFixed(1)}
                  </Badge>
                )}
                {releaseDate && (
                  <Badge variant="outline" className="text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(releaseDate).getFullYear()}
                  </Badge>
                )}
                {runtime && (
                  <Badge variant="outline" className="text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {runtime} min
                  </Badge>
                )}
              </div>
            </div>
            {genres.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {genres.map((genre: any) => (
                  <Badge key={genre.id} variant="secondary">{genre.name}</Badge>
                ))}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-muted-foreground leading-relaxed">{details.overview}</p>
            </div>
            {details.tagline && (
              <p className="text-sm italic text-muted-foreground">&quot;{details.tagline}&quot;</p>
            )}
          </CardContent>
        </Card>

        {cast.length > 0 && <CastSection cast={cast} />}
        <CommentsSection contentId={tmdbId.toString()} contentType={type} />
        {similar.length > 0 && <RelatedContent movies={similar} title="You May Also Like" />}
      </div>
    </div>
  )
}

// Required for static export - generates empty shell; client JS handles the actual routing
export function generateStaticParams() {
  return []
}
