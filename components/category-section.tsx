"use client"

import { MovieCard } from "./movie-card"
import { ContentFilter } from "./content-filter"
import type { Movie } from "@/lib/tmdb"
import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface CategorySectionProps {
  title: string
  movies: Movie[]
  loadMore?: () => Promise<Movie[]>
}

export function CategorySection({ title, movies: initialMovies, loadMore }: CategorySectionProps) {
  const [movies, setMovies] = useState(initialMovies)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loadMore || !hasMore) return

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          setIsLoading(true)
          try {
            const newMovies = await loadMore()
            if (newMovies.length === 0) {
              setHasMore(false)
            } else {
              setMovies((prev) => [...prev, ...newMovies])
            }
          } catch (error) {
            console.error("Error loading more movies:", error)
          } finally {
            setIsLoading(false)
          }
        }
      },
      { threshold: 0.1 },
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore, isLoading, hasMore])

  return (
    <section className="py-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground text-balance">{title}</h2>
      <ContentFilter movies={movies}>
        {(filteredMovies) => (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map((movie, index) => (
              <MovieCard key={`${movie.id}-${movie.media_type}-${index}`} movie={movie} />
            ))}
          </div>
        )}
      </ContentFilter>

      {loadMore && hasMore && (
        <div ref={observerRef} className="flex justify-center py-8">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        </div>
      )}
    </section>
  )
}
