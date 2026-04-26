"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { searchContent } from "@/lib/tmdb"
import { SearchResults } from "@/components/search-results"
import { Search, Loader2 } from "lucide-react"

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) { setResults([]); return }
    setLoading(true)
    searchContent(query).then(setResults).catch(() => setResults([])).finally(() => setLoading(false))
  }, [query])

  return (
    <div className="container px-4 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Search Results</h1>
        {query && !loading && (
          <p className="text-muted-foreground">Found {results.length} results for &quot;{query}&quot;</p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {!loading && !query && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">No search query</h2>
          <p className="text-muted-foreground">Use the search bar above to find movies, TV shows, and anime</p>
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">No results found</h2>
          <p className="text-muted-foreground">Try searching with different keywords</p>
        </div>
      )}

      {!loading && results.length > 0 && <SearchResults movies={results} />}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
      <SearchContent />
    </Suspense>
  )
}
