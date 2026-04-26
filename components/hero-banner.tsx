"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getImageUrl, type Movie } from "@/lib/tmdb"

interface HeroBannerProps {
  movies: Movie[]
}

export function HeroBanner({ movies }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const movie = movies[currentIndex]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [movies.length])

  if (!movie) return null

  const title = movie.title || movie.name || "Untitled"
  const mediaType = movie.media_type || "movie"
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length)
  }

  return (
    <>
      <div className="relative h-[50vh] w-full overflow-hidden bg-background">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-100 transition-opacity duration-500">
          <Image
            key={movie.id}
            src={getImageUrl(movie.backdrop_path, "original") || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            priority
            quality={85}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative h-full flex items-center px-4">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance fountain-glow-intense">
              {title}
            </h1>

            <div className="flex items-center gap-3 flex-wrap">
              {movie.vote_average && (
                <Badge variant="secondary" className="text-sm">
                  <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                </Badge>
              )}
              {movie.release_date && (
                <Badge variant="outline" className="text-sm">
                  {movie.release_date.split("-")[0]}
                </Badge>
              )}
              {movie.first_air_date && (
                <Badge variant="outline" className="text-sm">
                  {movie.first_air_date.split("-")[0]}
                </Badge>
              )}
            </div>

            <p className="text-base md:text-lg text-muted-foreground line-clamp-3 text-pretty">{movie.overview}</p>

            <div className="flex gap-3 flex-wrap">
              <Link href={`/watch/${mediaType}/${movie.id}-${slug}`}>
                <Button size="lg" className="fountain-glow">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Now
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={() => setShowDetails(true)}>
                <Info className="mr-2 h-5 w-5" />
                More Info
              </Button>
            </div>
          </div>
        </div>

        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white p-2 sm:p-3 rounded-full transition-colors touch-manipulation"
          aria-label="Previous featured"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white p-2 sm:p-3 rounded-full transition-colors touch-manipulation"
          aria-label="Next featured"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Carousel indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {movies.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all touch-manipulation ${
                index === currentIndex ? "w-8 bg-primary" : "w-4 bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal dialog for More Info */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription>Learn more about {title} and start watching</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {movie.overview && <p className="text-sm text-muted-foreground leading-relaxed">{movie.overview}</p>}
            <div className="flex gap-2 flex-wrap">
              {movie.vote_average && (
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                </Badge>
              )}
              {(movie.release_date || movie.first_air_date) && (
                <Badge variant="outline">{(movie.release_date || movie.first_air_date)?.split("-")[0]}</Badge>
              )}
            </div>
            <Link
              href={`/watch/${mediaType}/${movie.id}-${slug}`}
              className="inline-flex items-center justify-center gap-2 text-white bg-primary hover:bg-primary/90 rounded px-4 py-2 font-semibold transition-colors"
            >
              <Play className="h-4 w-4" />
              Watch Now
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
