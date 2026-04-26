"use client"

import { useState } from "react"
import { Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DownloadButtonProps {
  mediaType: "movie" | "tv"
  tmdbId: number
  imdbId?: string
  season?: number
  episode?: number
  title: string
}

export function DownloadButton({ mediaType, tmdbId, imdbId, season, episode, title }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Generate download links from various sources
  const downloadSources = [
    {
      name: "VidSrc Download",
      url:
        mediaType === "movie"
          ? `https://vidsrc.xyz/embed/movie/${tmdbId}`
          : `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      name: "Multi Quality",
      url:
        mediaType === "movie"
          ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
          : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
    },
  ]

  // Add IMDB-based sources if available
  if (imdbId) {
    downloadSources.push({
      name: "Alternative Source",
      url: `https://vidsrc.to/embed/movie/${imdbId}`,
    })
  }

  const handleDownload = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="gap-2 bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary hover:text-primary"
        >
          <Download className="h-5 w-5" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Download Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {downloadSources.map((source, index) => (
          <DropdownMenuItem key={index} onClick={() => handleDownload(source.url)} className="cursor-pointer">
            <ExternalLink className="h-4 w-4 mr-2" />
            {source.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">Opens in new tab for download</div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
