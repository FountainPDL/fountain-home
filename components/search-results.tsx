"use client"

import { useState, useEffect } from "react"
import { MovieCard } from "@/components/movie-card"
import { Search } from "lucide-react"

interface SearchResultsProps {
  movies: any[]
}

export function SearchResults({ movies }: SearchResultsProps) {
  const [filteredMovies, setFilteredMovies] = useState(movies)

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem("userPreferences") || "{}")
    if (prefs.filterAdultContent) {
      setFilteredMovies(movies.filter((movie) => !movie.adult))
    } else {
      setFilteredMovies(movies)
    }
  }, [movies])

  if (filteredMovies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground mb-2">No results after filtering</h2>
        <p className="text-muted-foreground">
          Adult content filter is enabled. Disable it in settings to see all results.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
      {filteredMovies.map((movie) => (
        <MovieCard key={`${movie.id}-${movie.media_type}`} movie={movie} />
      ))}
    </div>
  )
}
