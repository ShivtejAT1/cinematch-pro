import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchMovies, TMDBMovie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(query);

  const { data, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMovies(query),
    enabled: query.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    }
  };

  const movies: TMDBMovie[] = data?.results ?? [];

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-4">
      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for movies..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary border border-border text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
        </div>
      </form>

      {query && (
        <h2 className="font-display text-xl font-bold text-foreground mb-6">
          Results for "{query}" {movies.length > 0 && <span className="text-muted-foreground font-normal text-base">({movies.length} found)</span>}
        </h2>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)}
        </div>
      ) : query ? (
        <p className="text-center text-muted-foreground text-lg">No movies found for "{query}"</p>
      ) : (
        <p className="text-center text-muted-foreground text-lg">Start typing to search for movies</p>
      )}
    </div>
  );
}
