import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMoviesByGenre, MOOD_GENRES, GENRE_MAP, TMDBMovie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MoodPage() {
  const { mood } = useParams<{ mood: string }>();
  const moodConfig = mood ? MOOD_GENRES[mood] : null;
  const [selectedGenre, setSelectedGenre] = useState<number | "all">("all");
  const [page, setPage] = useState(1);

  // Fetch from all mood genres simultaneously
  const queries = (moodConfig?.genres ?? []).map((genreId) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["mood-genre", genreId, page],
      queryFn: () => getMoviesByGenre(genreId, page),
      enabled: !!moodConfig,
    })
  );

  // Also fetch page 2 for "all" to give more results
  const queriesPage2 = (moodConfig?.genres ?? []).map((genreId) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["mood-genre", genreId, 2],
      queryFn: () => getMoviesByGenre(genreId, 2),
      enabled: !!moodConfig,
      staleTime: 10 * 60 * 1000,
    })
  );

  const isLoading = queries.some((q) => q.isLoading);

  // Merge & deduplicate movies from all genres
  const allMoviesByGenre: Record<number, TMDBMovie[]> = {};
  (moodConfig?.genres ?? []).forEach((genreId, i) => {
    const results: TMDBMovie[] = [
      ...(queries[i]?.data?.results ?? []),
      ...(queriesPage2[i]?.data?.results ?? []),
    ];
    // dedupe within genre
    const seen = new Set<number>();
    allMoviesByGenre[genreId] = results.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  });

  // Merge all genres, deduplicate globally
  const allMovies: TMDBMovie[] = (() => {
    const seen = new Set<number>();
    const merged: TMDBMovie[] = [];
    (moodConfig?.genres ?? []).forEach((genreId) => {
      (allMoviesByGenre[genreId] ?? []).forEach((m) => {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          merged.push(m);
        }
      });
    });
    return merged.sort((a, b) => b.popularity - a.popularity);
  })();

  const filteredMovies =
    selectedGenre === "all"
      ? allMovies
      : (allMoviesByGenre[selectedGenre] ?? []);

  if (!moodConfig) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">
        Unknown mood
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <motion.span
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-6xl block mb-3"
        >
          {moodConfig.emoji}
        </motion.span>
        <h1 className="font-display text-3xl font-bold text-foreground">
          {moodConfig.label}
        </h1>
        <p className="text-muted-foreground mt-2">
          {filteredMovies.length}+ movies to match your mood
        </p>
      </motion.div>

      {/* Genre filter tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setSelectedGenre("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedGenre === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          All
        </button>
        {moodConfig.genres.map((genreId) => (
          <button
            key={genreId}
            onClick={() => setSelectedGenre(genreId)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedGenre === genreId
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {GENRE_MAP[genreId]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {filteredMovies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i % 20} />
            ))}
          </motion.div>

          {/* Load more */}
          {filteredMovies.length >= 20 && (
            <div className="flex justify-center mt-10">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/10"
                onClick={() => setPage((p) => p + 1)}
                disabled={queries.some((q) => q.isFetching)}
              >
                {queries.some((q) => q.isFetching) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                Load More Movies
              </Button>
            </div>
          )}
        </>
      )}

      {/* Other moods */}
      <section className="mt-16">
        <h2 className="font-display text-xl font-bold text-foreground mb-4 text-center">
          Explore Other Moods
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {Object.entries(MOOD_GENRES)
            .filter(([key]) => key !== mood)
            .map(([key, { label, emoji }]) => (
              <Link
                key={key}
                to={`/mood/${key}`}
                className="glass-panel rounded-xl px-5 py-3 flex items-center gap-2 hover:border-primary/50 transition-all hover-lift"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="font-display text-sm font-semibold text-foreground">
                  {label}
                </span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
