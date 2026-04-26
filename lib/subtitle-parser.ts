export interface SubtitleCue {
  index: number
  startTime: number
  endTime: number
  text: string
}

export function parseSRT(srtContent: string): SubtitleCue[] {
  const cues: SubtitleCue[] = []
  const blocks = srtContent.trim().split(/\n\s*\n/)

  for (const block of blocks) {
    const lines = block.trim().split("\n")
    if (lines.length < 3) continue

    const index = Number.parseInt(lines[0])
    const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)

    if (!timeMatch) continue

    const startTime =
      Number.parseInt(timeMatch[1]) * 3600 +
      Number.parseInt(timeMatch[2]) * 60 +
      Number.parseInt(timeMatch[3]) +
      Number.parseInt(timeMatch[4]) / 1000

    const endTime =
      Number.parseInt(timeMatch[5]) * 3600 +
      Number.parseInt(timeMatch[6]) * 60 +
      Number.parseInt(timeMatch[7]) +
      Number.parseInt(timeMatch[8]) / 1000

    const text = lines.slice(2).join("\n")

    cues.push({ index, startTime, endTime, text })
  }

  return cues
}

export function getCurrentCue(cues: SubtitleCue[], currentTime: number): SubtitleCue | null {
  return cues.find((cue) => currentTime >= cue.startTime && currentTime <= cue.endTime) || null
}
