import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchMovies, TMDBMovie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { Search as SearchIcon, Sparkles, AlertCircle, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

// Simple Levenshtein distance for typo detection
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function getBestMatch(query: string, movies: TMDBMovie[]): TMDBMovie | null {
  if (!movies.length) return null;
  const q = query.toLowerCase();
  let best: TMDBMovie | null = null;
  let bestScore = Infinity;
  for (const m of movies.slice(0, 5)) {
    const dist = levenshtein(q, m.title.toLowerCase());
    if (dist < bestScore) { bestScore = dist; best = m; }
  }
  // Only suggest if meaningfully different but close
  return bestScore > 0 && bestScore <= Math.max(4, Math.floor(q.length * 0.4)) ? best : null;
}

function getFallbackQuery(query: string): string {
  const words = query.trim().split(/\s+/);
  if (words.length > 1) return words.slice(0, -1).join(" ");
  // Try removing last 2 chars for single-word typos
  return query.length > 4 ? query.slice(0, -2) : "";
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMovies(query),
    enabled: query.length > 0,
  });

  const movies: TMDBMovie[] = data?.results ?? [];

  // Fallback search when zero results
  const fallbackQuery = movies.length === 0 && !isLoading && query ? getFallbackQuery(query) : "";
  const { data: fallbackData, isLoading: fallbackLoading } = useQuery({
    queryKey: ["search-fallback", fallbackQuery],
    queryFn: () => searchMovies(fallbackQuery),
    enabled: fallbackQuery.length > 1,
  });
  const fallbackMovies: TMDBMovie[] = fallbackData?.results ?? [];

  // Detect likely typo: top result title is close but not identical
  const bestMatch = movies.length > 0 ? getBestMatch(query, movies) : null;
  const showDidYouMean = bestMatch && bestMatch.title.toLowerCase() !== query.toLowerCase();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    }
  };

  const applyQuery = (q: string) => {
    setLocalQuery(q);
    setSearchParams({ q });
  };

  const displayMovies = movies.length > 0 ? movies : fallbackMovies;
  const isFallback = movies.length === 0 && fallbackMovies.length > 0;

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-4">
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>
      {/* Search bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for movies..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary border border-border text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            autoFocus
          />
        </div>
      </form>

      {/* Loading skeleton */}
      {(isLoading || fallbackLoading) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && !fallbackLoading && query && (
        <>
          {/* Did you mean? banner */}
          {showDidYouMean && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm text-foreground">
                Did you mean{" "}
                <button
                  onClick={() => applyQuery(bestMatch!.title)}
                  className="font-bold text-primary hover:underline"
                >
                  "{bestMatch!.title}"
                </button>
                ?
              </p>
            </div>
          )}

          {/* Fallback banner */}
          {isFallback && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20">
              <AlertCircle className="w-4 h-4 text-accent shrink-0" />
              <p className="text-sm text-foreground">
                No exact results for{" "}
                <span className="font-semibold">"{query}"</span>
                {fallbackQuery && (
                  <>
                    {" — showing results for "}
                    <button
                      onClick={() => applyQuery(fallbackQuery)}
                      className="font-bold text-primary hover:underline"
                    >
                      "{fallbackQuery}"
                    </button>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Result header */}
          {displayMovies.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-display text-xl font-bold text-foreground">
                {isFallback ? `Similar results` : `Results for "${query}"`}
                <span className="text-muted-foreground font-normal text-base ml-2">
                  ({displayMovies.length} found)
                </span>
              </h2>
            </div>
          )}

          {/* Movie grid */}
          {displayMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayMovies.map((movie, i) => (
                <MovieCard key={movie.id} movie={movie} index={i} />
              ))}
            </div>
          ) : (
            /* Zero results state */
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                Nothing found for "{query}"
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try checking the spelling, using fewer words, or searching by genre or actor name.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Avengers", "Inception", "The Godfather", "Interstellar", "Titanic"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => applyQuery(suggestion)}
                    className="px-4 py-2 rounded-full bg-secondary border border-border text-sm text-foreground hover:bg-primary/10 hover:border-primary/50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!query && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-muted-foreground text-lg">Start typing to discover movies</p>
        </div>
      )}
    </div>
  );
}
