"use client"

import { useState, useEffect } from "react"
import { HeroBanner } from "@/components/hero-banner"
import { CategoryTabs } from "@/components/category-tabs"
import { ContinueWatching } from "@/components/continue-watching"
import { getPopular, getLatest, getMovies, getTVShows, getAnime, getPowerRangers } from "@/lib/tmdb"

export default function HomePage() {
  const [data, setData] = useState({
    popular: [], latest: [], movies: [], tvShows: [], anime: [], powerRangers: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getPopular(), getLatest(), getMovies(), getTVShows(), getAnime(), getPowerRangers()
    ]).then(([popular, latest, movies, tvShows, anime, powerRangers]) => {
      setData({ popular, latest, movies, tvShows, anime, powerRangers })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {data.popular.length > 0 && <HeroBanner movies={data.popular.slice(0, 5)} />}
      <div className="container px-4 py-8">
        <ContinueWatching />
      </div>
      <CategoryTabs
        popular={data.popular}
        latest={data.latest}
        movies={data.movies}
        tvShows={data.tvShows}
        anime={data.anime}
        powerRangers={data.powerRangers}
      />
    </div>
  )
}
