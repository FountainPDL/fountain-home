import { MovieCard } from "./movie-card"
import type { Movie } from "@/lib/tmdb"

interface RelatedContentProps {
  movies: Movie[]
  title?: string
}

export function RelatedContent({ movies, title = "Related Content" }: RelatedContentProps) {
  if (movies.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.slice(0, 12).map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}
