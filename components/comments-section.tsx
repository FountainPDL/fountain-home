"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getComments, addComment, getAverageRating, type Comment } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Star, MessageSquare } from "lucide-react"

interface CommentsSectionProps {
  contentId: string
  contentType: "movie" | "tv"
}

export function CommentsSection({ contentId, contentType }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [author, setAuthor] = useState("")
  const [text, setText] = useState("")
  const [rating, setRating] = useState(5)
  const [hoveredStar, setHoveredStar] = useState(0)

  useEffect(() => {
    loadComments()
  }, [contentId, contentType])

  const loadComments = () => {
    const loadedComments = getComments(contentId, contentType)
    setComments(loadedComments)
    setAverageRating(getAverageRating(contentId, contentType))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!author.trim() || !text.trim()) return

    addComment({
      contentId,
      contentType,
      author: author.trim(),
      text: text.trim(),
      rating,
    })

    setAuthor("")
    setText("")
    setRating(5)
    loadComments()
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <section className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Comments & Ratings</h2>
        {comments.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">({comments.length})</span>
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <Card className="p-6 mb-6 bg-card/50 backdrop-blur-sm border-primary/20">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredStar || rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <Input
            placeholder="Your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className="bg-background/50"
          />
          <Textarea
            placeholder="Share your thoughts..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={4}
            className="bg-background/50 resize-none"
          />
          <Button type="submit" className="w-full">
            Post Comment
          </Button>
        </form>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card className="p-8 text-center bg-card/30">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-4 bg-card/50 backdrop-blur-sm border-primary/10">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{comment.author}</h4>
                  <p className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{comment.rating}</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{comment.text}</p>
            </Card>
          ))
        )}
      </div>
    </section>
  )
}
