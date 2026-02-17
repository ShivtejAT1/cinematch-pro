import { supabase } from "@/integrations/supabase/client";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const getImageUrl = (path: string | null, size = "w500") => {
  if (!path) return "/placeholder.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null) => getImageUrl(path, "w1280");

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  const response = await fetch(
    `${projectUrl}/functions/v1/tmdb?${searchParams.toString()}`,
    {
      headers: {
        "apikey": anonKey,
        "Content-Type": "application/json",
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getPopularMovies(page = 1) {
  return tmdbFetch("/movie/popular", { page: String(page) });
}

export async function getTopRatedMovies(page = 1) {
  return tmdbFetch("/movie/top_rated", { page: String(page) });
}

export async function getNowPlayingMovies(page = 1) {
  return tmdbFetch("/movie/now_playing", { page: String(page) });
}

export async function getUpcomingMovies(page = 1) {
  return tmdbFetch("/movie/upcoming", { page: String(page) });
}

export async function searchMovies(query: string, page = 1) {
  return tmdbFetch("/search/movie", { query, page: String(page) });
}

export async function getMovieDetails(tmdbId: number) {
  return tmdbFetch(`/movie/${tmdbId}`, { append_to_response: "credits,videos,watch/providers,keywords,similar" });
}

export async function getTrendingMovies(timeWindow: "day" | "week" = "week") {
  return tmdbFetch(`/trending/movie/${timeWindow}`);
}

export async function getMoviesByGenre(genreId: number, page = 1) {
  return tmdbFetch("/discover/movie", { with_genres: String(genreId), sort_by: "popularity.desc", page: String(page) });
}

export const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
};

export const MOOD_GENRES: Record<string, { genres: number[]; label: string; emoji: string }> = {
  happy: { genres: [35, 10751, 16], label: "Something Funny", emoji: "😂" },
  thriller: { genres: [53, 27, 9648], label: "Thriller Night", emoji: "😰" },
  romantic: { genres: [10749, 18], label: "Date Night", emoji: "💕" },
  adventure: { genres: [28, 12, 878], label: "Epic Adventure", emoji: "🚀" },
  thoughtful: { genres: [18, 99, 36], label: "Deep & Thoughtful", emoji: "🤔" },
  family: { genres: [10751, 16, 14], label: "Family Time", emoji: "👨‍👩‍👧‍👦" },
};

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  popularity: number;
  runtime?: number;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; profile_path: string | null }[];
  };
  videos?: {
    results: { key: string; site: string; type: string; name: string }[];
  };
  "watch/providers"?: {
    results: Record<string, { link?: string; flatrate?: { provider_name: string; logo_path: string }[] }>;
  };
  similar?: { results: TMDBMovie[] };
  keywords?: { keywords: { id: number; name: string }[] };
}
