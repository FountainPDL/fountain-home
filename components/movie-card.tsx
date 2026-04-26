"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getImageUrl, type Movie } from "@/lib/tmdb"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const [imageError, setImageError] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const title = movie.title || movie.name || "Untitled"
  const year = movie.release_date?.split("-")[0] || movie.first_air_date?.split("-")[0]
  const rating = movie.vote_average?.toFixed(1)
  const mediaType = movie.media_type || "movie"
  const genres = movie.genres || []
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const getCertificationColor = (cert: string) => {
    const upper = cert.toUpperCase()
    if (["G", "TV-Y", "TV-G"].includes(upper)) return "bg-green-600"
    if (["PG", "TV-PG"].includes(upper)) return "bg-blue-600"
    if (["PG-13", "TV-14"].includes(upper)) return "bg-yellow-600"
    if (["R", "TV-MA", "NC-17"].includes(upper)) return "bg-red-600"
    return "bg-gray-600"
  }

  return (
    <>
      <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 flex flex-col h-full cursor-pointer">
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="relative aspect-[2/3] overflow-hidden" onClick={() => setShowDetails(true)}>
            <Image
              src={imageError ? "/placeholder.svg?height=450&width=300" : getImageUrl(movie.poster_path)}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
              <Play className="h-12 w-12 text-white" />
            </div>
            {rating && (
              <Badge className="absolute top-2 right-2 bg-black/70 text-white border-0">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {rating}
              </Badge>
            )}
          </div>
          <div className="p-3 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm line-clamp-1 text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{year}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription>View details about {title} and start watching</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre: any) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}
            {movie.overview && <p className="text-sm text-muted-foreground leading-relaxed">{movie.overview}</p>}
            <div className="flex gap-2">
              {rating && (
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {rating}
                </Badge>
              )}
              {year && <Badge variant="outline">{year}</Badge>}
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
