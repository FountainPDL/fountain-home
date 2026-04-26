"use client"

export interface WatchHistory {
  id: string
  type: "movie" | "tv"
  title: string
  posterPath: string
  timestamp: number
  progress: number // 0-100
  season?: number
  episode?: number
}

export interface Comment {
  id: string
  contentId: string
  contentType: "movie" | "tv"
  author: string
  text: string
  rating: number
  timestamp: number
}

export interface UserPreferences {
  defaultServer: string
  autoplay: boolean
  theme: "light" | "dark" | "system"
  filterAdultContent: boolean // Added adult content filter
}

// Watch History
export function getWatchHistory(): WatchHistory[] {
  if (typeof window === "undefined") return []
  const history = localStorage.getItem("fountainhome_watch_history")
  return history ? JSON.parse(history) : []
}

export function addToWatchHistory(item: Omit<WatchHistory, "timestamp">) {
  const history = getWatchHistory()
  const existing = history.findIndex((h) => h.id === item.id && h.type === item.type)

  const newItem: WatchHistory = {
    ...item,
    timestamp: Date.now(),
  }

  if (existing !== -1) {
    history[existing] = newItem
  } else {
    history.unshift(newItem)
  }

  // Keep only last 50 items
  const trimmed = history.slice(0, 50)
  localStorage.setItem("fountainhome_watch_history", JSON.stringify(trimmed))
}

export function updateWatchProgress(id: string, type: "movie" | "tv", progress: number) {
  const history = getWatchHistory()
  const item = history.find((h) => h.id === id && h.type === type)

  if (item) {
    item.progress = progress
    item.timestamp = Date.now()
    localStorage.setItem("fountainhome_watch_history", JSON.stringify(history))
  }
}

export function getContinueWatching(): WatchHistory[] {
  return getWatchHistory()
    .filter((item) => item.progress > 5 && item.progress < 95)
    .slice(0, 10)
}

// Comments and Ratings
export function getComments(contentId: string, contentType: "movie" | "tv"): Comment[] {
  if (typeof window === "undefined") return []
  const comments = localStorage.getItem("fountainhome_comments")
  const allComments: Comment[] = comments ? JSON.parse(comments) : []
  return allComments
    .filter((c) => c.contentId === contentId && c.contentType === contentType)
    .sort((a, b) => b.timestamp - a.timestamp)
}

export function addComment(comment: Omit<Comment, "id" | "timestamp">) {
  const comments = localStorage.getItem("fountainhome_comments")
  const allComments: Comment[] = comments ? JSON.parse(comments) : []

  const newComment: Comment = {
    ...comment,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
  }

  allComments.unshift(newComment)
  localStorage.setItem("fountainhome_comments", JSON.stringify(allComments))
  return newComment
}

export function getAverageRating(contentId: string, contentType: "movie" | "tv"): number {
  const comments = getComments(contentId, contentType)
  if (comments.length === 0) return 0
  const sum = comments.reduce((acc, c) => acc + c.rating, 0)
  return sum / comments.length
}

// User Preferences
export function getUserPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return { defaultServer: "vidsrc", autoplay: true, theme: "system", filterAdultContent: false }
  }
  const prefs = localStorage.getItem("fountainhome_preferences")
  return prefs
    ? JSON.parse(prefs)
    : { defaultServer: "vidsrc", autoplay: true, theme: "system", filterAdultContent: false }
}

export function updateUserPreferences(prefs: Partial<UserPreferences>) {
  const current = getUserPreferences()
  const updated = { ...current, ...prefs }
  localStorage.setItem("fountainhome_preferences", JSON.stringify(updated))
}
