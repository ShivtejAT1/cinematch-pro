import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMoviesByGenre, MOOD_GENRES, TMDBMovie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";

export default function MoodPage() {
  const { mood } = useParams<{ mood: string }>();
  const moodConfig = mood ? MOOD_GENRES[mood] : null;

  const { data, isLoading } = useQuery({
    queryKey: ["mood", mood],
    queryFn: async () => {
      if (!moodConfig) return { results: [] };
      // Fetch movies from first genre
      const genreId = moodConfig.genres[0];
      return getMoviesByGenre(genreId);
    },
    enabled: !!moodConfig,
  });

  if (!moodConfig) {
    return <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">Unknown mood</div>;
  }

  const movies: TMDBMovie[] = data?.results ?? [];

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-4">
      <div className="text-center mb-10">
        <span className="text-5xl block mb-3">{moodConfig.emoji}</span>
        <h1 className="font-display text-3xl font-bold text-foreground">{moodConfig.label}</h1>
        <p className="text-muted-foreground mt-2">Movies to match your mood</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)}
        </div>
      )}
    </div>
  );
}
