import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMoviesByGenre, GENRE_MAP, TMDBMovie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "release_date.desc", label: "Newest" },
  { value: "release_date.asc", label: "Oldest" },
];

export default function GenrePage() {
  const { id } = useParams<{ id: string }>();
  const genreId = Number(id);
  const genreName = GENRE_MAP[genreId] ?? "Genre";
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<TMDBMovie[]>([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["genre-page", genreId, page],
    queryFn: async () => {
      const result = await getMoviesByGenre(genreId, page);
      return result;
    },
    enabled: !!genreId,
  });

  // Accumulate movies across pages
  const currentPageMovies: TMDBMovie[] = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;

  // Dedupe-merge into allMovies when new page arrives
  const seen = new Set(allMovies.map((m) => m.id));
  const uniqueNew = currentPageMovies.filter((m) => !seen.has(m.id));
  const displayMovies = allMovies.length === 0 ? currentPageMovies : [...allMovies, ...uniqueNew];

  const handleLoadMore = () => {
    setAllMovies(displayMovies);
    setPage((p) => p + 1);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {genreName} Movies
            </h1>
            {data?.total_results && (
              <p className="text-muted-foreground text-sm mt-1">
                {data.total_results.toLocaleString()} movies
              </p>
            )}
          </div>
          {/* Link to other genres */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(GENRE_MAP)
              .filter(([gid]) => Number(gid) !== genreId)
              .slice(0, 6)
              .map(([gid, name]) => (
                <Link
                  key={gid}
                  to={`/genre/${gid}`}
                  className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium hover:bg-primary/20 hover:text-primary transition-all"
                >
                  {name}
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayMovies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i % 20} />
          ))}
        </motion.div>
      )}

      {/* Load More */}
      {!isLoading && page < Math.min(totalPages, 20) && (
        <div className="flex justify-center mt-10">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/10"
            onClick={handleLoadMore}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
