const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p"

function getTMDBApiKey() {
  return process.env.TMDB_API_KEY || "8baba8ab6b8bbe247645bcae7df63d0d"
}

export interface Movie {
  id: number
  title: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type?: "movie" | "tv"
  certification?: string
  adult?: boolean
  genre_ids?: number[]
}

export async function fetchTMDB(endpoint: string) {
  const TMDB_API_KEY = getTMDBApiKey()
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}`

  const response = await fetch(url, {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

export function getImageUrl(path: string | null, size: "w500" | "w780" | "original" = "w500") {
  if (!path) return "/abstract-movie-poster.png"
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export async function getPopular(page = 1) {
  try {
    const data = await fetchTMDB(`/trending/all/week?page=${page}`)
    return data.results as Movie[]
  } catch (error) {
    return []
  }
}

export async function getMovies(page = 1) {
  try {
    const data = await fetchTMDB(`/movie/popular?page=${page}`)
    return data.results.map((movie: Movie) => ({ ...movie, media_type: "movie" })) as Movie[]
  } catch (error) {
    return []
  }
}

export async function getTVShows(page = 1) {
  try {
    const data = await fetchTMDB(`/tv/popular?page=${page}`)
    return data.results.map((tv: Movie) => ({ ...tv, media_type: "tv" })) as Movie[]
  } catch (error) {
    return []
  }
}

export async function getLatest(page = 1) {
  try {
    const data = await fetchTMDB(`/trending/all/day?page=${page}`)
    return data.results as Movie[]
  } catch (error) {
    return []
  }
}

export async function searchContent(query: string) {
  try {
    const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(query)}`)
    // Ensure media_type is set (multi search returns it, but normalize it)
    return data.results.filter((item: Movie) => item.media_type === "movie" || item.media_type === "tv") as Movie[]
  } catch (error) {
    return []
  }
}

export async function getAnime(page = 1) {
  try {
    const data = await fetchTMDB(`/discover/tv?with_genres=16&with_keywords=210024&page=${page}`)
    return data.results.map((show: Movie) => ({ ...show, media_type: "tv" })) as Movie[]
  } catch (error) {
    return []
  }
}

export async function getPowerRangers(page = 1) {
  try {
    const data = await fetchTMDB(`/search/tv?query=power%20rangers&page=${page}`)
    return data.results.map((show: Movie) => ({ ...show, media_type: "tv" })) as Movie[]
  } catch (error) {
    return []
  }
}

export async function getMovieDetails(id: number) {
  const data = await fetchTMDB(`/movie/${id}?append_to_response=videos`)
  return data
}

export async function getTVDetails(id: number) {
  const data = await fetchTMDB(`/tv/${id}?append_to_response=videos`)
  return data
}

export async function getMovieCredits(id: number) {
  const data = await fetchTMDB(`/movie/${id}/credits`)
  return data
}

export async function getTVCredits(id: number) {
  const data = await fetchTMDB(`/tv/${id}/credits`)
  return data
}

export async function getSimilarMovies(id: number) {
  const data = await fetchTMDB(`/movie/${id}/similar`)
  return data.results as Movie[]
}

export async function getSimilarTV(id: number) {
  const data = await fetchTMDB(`/tv/${id}/similar`)
  return data.results as Movie[]
}

export async function getTVSeasons(id: number) {
  const data = await fetchTMDB(`/tv/${id}`)
  return data.seasons || []
}

const certificationCache = new Map<string, { data: string; timestamp: number }>()

export async function getMovieCertification(id: number): Promise<string> {
  const cacheKey = `movie-${id}`
  const cached = certificationCache.get(cacheKey)

  // Return cached result if available and less than 24 hours old
  if (cached && Date.now() - cached.timestamp < 86400000) {
    return cached.data
  }

  try {
    const data = await fetchTMDB(`/movie/${id}/release_dates`)
    const usRelease = data.results?.find((r: any) => r.iso_3166_1 === "US")
    const cert = usRelease?.release_dates?.[0]?.certification || ""

    // Cache the result
    certificationCache.set(cacheKey, { data: cert, timestamp: Date.now() })
    return cert
  } catch (error: any) {
    // Cache empty result to avoid repeated failed requests
    certificationCache.set(cacheKey, { data: "", timestamp: Date.now() })
    return ""
  }
}

export async function getTVContentRating(id: number): Promise<string> {
  const cacheKey = `tv-${id}`
  const cached = certificationCache.get(cacheKey)

  // Return cached result if available and less than 24 hours old
  if (cached && Date.now() - cached.timestamp < 86400000) {
    return cached.data
  }

  try {
    const data = await fetchTMDB(`/tv/${id}/content_ratings`)
    const usRating = data.results?.find((r: any) => r.iso_3166_1 === "US")
    const rating = usRating?.rating || ""

    // Cache the result
    certificationCache.set(cacheKey, { data: rating, timestamp: Date.now() })
    return rating
  } catch (error: any) {
    // Cache empty result to avoid repeated failed requests
    certificationCache.set(cacheKey, { data: "", timestamp: Date.now() })
    return ""
  }
}

export function isAdultContent(movie: Movie, certification?: string): boolean {
  // Check explicit adult flag
  if (movie.adult) return true

  // Check certification/rating
  if (certification) {
    const adultRatings = ["R", "NC-17", "X", "TV-MA", "TV-18", "18", "18+"]
    return adultRatings.includes(certification.toUpperCase())
  }

  return false
}

export function filterAdultContentIfNeeded(movies: Movie[], filterEnabled: boolean): Movie[] {
  if (!filterEnabled) return movies

  return movies.filter((movie) => {
    // Filter out explicitly adult content
    if (movie.adult) return false

    // Filter based on certification if available
    if (movie.certification) {
      return !isAdultContent(movie, movie.certification)
    }

    return true
  })
}
