"use client"

import { useEffect, useState } from "react"
import { getContinueWatching, type WatchHistory } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import { Play, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function ContinueWatching() {
  const [items, setItems] = useState<WatchHistory[]>([])

  useEffect(() => {
    setItems(getContinueWatching())
  }, [])

  if (items.length === 0) return null

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">Continue Watching</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={`/watch/${item.type}/${item.id}${item.season && item.episode ? `?season=${item.season}&episode=${item.episode}` : ""}`}
          >
            <Card className="group relative overflow-hidden bg-card hover:bg-accent transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
              <div className="relative aspect-[2/3]">
                <Image
                  src={
                    item.posterPath
                      ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
                      : "/placeholder.svg?height=450&width=300"
                  }
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary-foreground fill-current" />
                  </div>
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                {item.season && item.episode && (
                  <p className="text-xs text-muted-foreground mt-1">
                    S{item.season} E{item.episode}
                  </p>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
