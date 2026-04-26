"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getUserPreferences } from "@/lib/storage"
import { isAdultContent, type Movie } from "@/lib/tmdb"

interface ContentFilterProps {
  movies: Movie[]
  children: (filteredMovies: Movie[]) => React.ReactNode
}

export function ContentFilter({ movies, children }: ContentFilterProps) {
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>(movies)

  useEffect(() => {
    const prefs = getUserPreferences()

    if (prefs.filterAdultContent) {
      // Filter out adult content
      const filtered = movies.filter((movie) => {
        // Check explicit adult flag from TMDB
        if (movie.adult) return false

        // Check certification if available
        if (movie.certification && isAdultContent(movie, movie.certification)) {
          return false
        }

        return true
      })
      setFilteredMovies(filtered)
    } else {
      setFilteredMovies(movies)
    }
  }, [movies])

  return <>{children(filteredMovies)}</>
}
