"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { type SubtitleCue, getCurrentCue } from "@/lib/subtitle-parser"

interface SubtitleOverlayProps {
  cues: SubtitleCue[]
  currentTime: number
  enabled: boolean
  isFullscreen?: boolean
}

export function SubtitleOverlay({ cues, currentTime, enabled, isFullscreen = false }: SubtitleOverlayProps) {
  const [currentCue, setCurrentCue] = useState<SubtitleCue | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log("[v0] SubtitleOverlay mounted")
  }, [])

  useEffect(() => {
    console.log("[v0] Fullscreen state changed:", isFullscreen)
  }, [isFullscreen])

  useEffect(() => {
    if (enabled && cues.length > 0) {
      const cue = getCurrentCue(cues, currentTime)
      setCurrentCue(cue)
      if (cue) {
        console.log("[v0] Current subtitle:", cue.text)
      }
    } else {
      setCurrentCue(null)
    }
  }, [currentTime, cues, enabled])

  if (!enabled || !currentCue || !mounted) {
    console.log("[v0] Subtitle not showing - enabled:", enabled, "currentCue:", !!currentCue, "mounted:", mounted)
    return null
  }

  console.log("[v0] Rendering subtitle in", isFullscreen ? "fullscreen" : "normal", "mode")

  const subtitleElement = (
    <div
      className="fixed left-0 right-0 flex justify-center px-4 pointer-events-none"
      style={{
        bottom: isFullscreen ? "96px" : "64px",
        zIndex: 2147483647, // Always use maximum z-index
      }}
    >
      <div
        className="bg-black/90 text-white px-6 py-3 rounded-lg text-center max-w-4xl backdrop-blur-sm"
        style={{
          textShadow: "2px 2px 4px rgba(0,0,0,0.9)",
          fontSize: isFullscreen ? "2rem" : "1.1rem",
          lineHeight: "1.5",
          fontWeight: "600",
        }}
      >
        {currentCue.text.split("\n").map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  )

  // Always use portal to render at document.body level
  return createPortal(subtitleElement, document.body)
}
