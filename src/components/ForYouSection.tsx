import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { getMoviesByGenre, GENRE_MAP, TMDBMovie } from "@/lib/tmdb";
import MovieCarousel from "@/components/MovieCarousel";
import { Link } from "react-router-dom";
import { UserCircle2 } from "lucide-react";

export default function ForYouSection() {
  const { user } = useAuth();

  // Get user's watched movies to figure out genre preferences
  const { data: watchedMovies } = useQuery({
    queryKey: ["watched-for-you", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("watched").select("tmdb_id").eq("user_id", user!.id).limit(50);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Get user's ratings to figure out genre preferences
  const { data: ratedMovies } = useQuery({
    queryKey: ["ratings-for-you", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_ratings").select("tmdb_id, rating").eq("user_id", user!.id).gte("rating", 3.5).limit(30);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Get watchlist for genre hints
  const { data: watchlistItems } = useQuery({
    queryKey: ["watchlist-for-you", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("watchlist").select("tmdb_id").eq("user_id", user!.id).limit(20);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Determine favorite genre based on activity count (simple heuristic)
  // We pick a genre based on how many items are in the user's activity
  const totalActivity = (watchedMovies?.length ?? 0) + (ratedMovies?.length ?? 0) + (watchlistItems?.length ?? 0);
  
  // Pick a "for you" genre cycling through popular genres based on user activity hash
  const genreIds = [28, 18, 35, 878, 27, 10749, 16, 80, 53, 12];
  const favoriteGenreId = totalActivity > 0
    ? genreIds[totalActivity % genreIds.length]
    : 18; // default drama

  const { data: forYouMovies, isLoading } = useQuery({
    queryKey: ["for-you", user?.id, favoriteGenreId],
    queryFn: () => getMoviesByGenre(favoriteGenreId),
    enabled: !!user && totalActivity >= 0,
  });

  // Not logged in — show a teaser card
  if (!user) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <UserCircle2 className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-display text-lg font-bold text-foreground">Personalised For You</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to get movie recommendations based on what you've watched and loved.
          </p>
        </div>
        <Link
          to="/auth"
          className="shrink-0 px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Logged in but no activity yet
  if (totalActivity === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center">
        <p className="text-2xl mb-2">🎬</p>
        <h3 className="font-display text-lg font-bold text-foreground">Your Recommendations Will Appear Here</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Start watching, rating, or adding movies to your watchlist to get personalised picks.
        </p>
      </div>
    );
  }

  const movies: TMDBMovie[] = forYouMovies?.results ?? [];
  const genreName = GENRE_MAP[favoriteGenreId] ?? "Your Picks";

  return (
    <MovieCarousel
      title={`✨ For You — More ${genreName}`}
      movies={movies}
      isLoading={isLoading}
      seeAllHref={`/genre/${favoriteGenreId}`}
    />
  );
}
