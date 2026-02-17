import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMovieDetails, getImageUrl, getBackdropUrl, GENRE_MAP, TMDBMovie } from "@/lib/tmdb";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import StarRating from "@/components/StarRating";
import MovieCard from "@/components/MovieCard";
import { Bookmark, BookmarkCheck, Eye, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tmdbId = Number(id);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", tmdbId],
    queryFn: () => getMovieDetails(tmdbId),
    enabled: !!tmdbId,
  });

  // User-specific data
  const { data: userRating } = useQuery({
    queryKey: ["rating", tmdbId],
    queryFn: async () => {
      const { data } = await supabase.from("user_ratings").select("*").eq("tmdb_id", tmdbId).maybeSingle();
      return data;
    },
    enabled: !!user && !!tmdbId,
  });

  const { data: inWatchlist } = useQuery({
    queryKey: ["watchlist-check", tmdbId],
    queryFn: async () => {
      const { data } = await supabase.from("watchlist").select("id").eq("tmdb_id", tmdbId).maybeSingle();
      return !!data;
    },
    enabled: !!user && !!tmdbId,
  });

  const { data: isWatched } = useQuery({
    queryKey: ["watched-check", tmdbId],
    queryFn: async () => {
      const { data } = await supabase.from("watched").select("id").eq("tmdb_id", tmdbId).maybeSingle();
      return !!data;
    },
    enabled: !!user && !!tmdbId,
  });

  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      const { error } = await supabase.from("user_ratings").upsert({
        user_id: user!.id, tmdb_id: tmdbId, rating, notes: notes || null,
      }, { onConflict: "user_id,tmdb_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rating", tmdbId] });
      toast.success("Rating saved!");
    },
  });

  const watchlistMutation = useMutation({
    mutationFn: async () => {
      if (inWatchlist) {
        await supabase.from("watchlist").delete().eq("tmdb_id", tmdbId).eq("user_id", user!.id);
      } else {
        await supabase.from("watchlist").insert({ user_id: user!.id, tmdb_id: tmdbId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist-check", tmdbId] });
      queryClient.invalidateQueries({ queryKey: ["user-watchlist"] });
      toast.success(inWatchlist ? "Removed from watchlist" : "Added to watchlist!");
    },
  });

  const watchedMutation = useMutation({
    mutationFn: async () => {
      if (isWatched) {
        await supabase.from("watched").delete().eq("tmdb_id", tmdbId).eq("user_id", user!.id);
      } else {
        await supabase.from("watched").insert({ user_id: user!.id, tmdb_id: tmdbId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watched-check", tmdbId] });
      toast.success(isWatched ? "Unmarked as watched" : "Marked as watched!");
    },
  });

  if (isLoading) {
    return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!movie) {
    return <div className="min-h-screen pt-20 flex items-center justify-center text-muted-foreground">Movie not found</div>;
  }

  const director = movie.credits?.crew?.find((c: any) => c.job === "Director");
  const cast = movie.credits?.cast?.slice(0, 8) ?? [];
  const trailer = movie.videos?.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
  const similar = movie.similar?.results?.slice(0, 10) ?? [];
  const providers = movie["watch/providers"]?.results?.US?.flatrate ?? [];

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img src={getBackdropUrl(movie.backdrop_path)} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
      </div>

      <div className="container mx-auto px-4 -mt-48 relative z-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0 w-[200px] md:w-[280px] mx-auto md:mx-0">
            <img src={getImageUrl(movie.poster_path, "w500")} alt={movie.title} className="w-full rounded-xl shadow-2xl" />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-primary font-semibold flex items-center gap-1">
                ⭐ {movie.vote_average?.toFixed(1)}
              </span>
              <span className="text-muted-foreground">{movie.release_date?.split("-")[0]}</span>
              {movie.runtime && <span className="text-muted-foreground">{movie.runtime} min</span>}
              {movie.genres?.map((g: any) => (
                <span key={g.id} className="px-2 py-0.5 rounded-full bg-secondary text-xs text-secondary-foreground font-medium">{g.name}</span>
              ))}
            </div>

            {director && <p className="text-sm text-muted-foreground">Directed by <span className="text-foreground font-medium">{director.name}</span></p>}

            <p className="text-foreground/80 leading-relaxed">{movie.overview}</p>

            {/* User actions */}
            {user && (
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => watchlistMutation.mutate()} className="gap-2">
                    {inWatchlist ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
                    {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                  </Button>
                  <Button variant="outline" onClick={() => watchedMutation.mutate()} className="gap-2">
                    <Eye className="w-4 h-4" />
                    {isWatched ? "Watched ✓" : "Mark Watched"}
                  </Button>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                  <StarRating rating={userRating?.rating ?? 0} onRate={(r) => rateMutation.mutate(r)} size="lg" />
                </div>
              </div>
            )}

            {/* Streaming */}
            {providers.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Stream on</p>
                <div className="flex gap-2">
                  {providers.map((p: any) => (
                    <div key={p.provider_name} className="w-10 h-10 rounded-lg overflow-hidden" title={p.provider_name}>
                      <img src={getImageUrl(p.logo_path, "w92")} alt={p.provider_name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {cast.map((person: any) => (
                <div key={person.id} className="shrink-0 w-[100px] text-center">
                  <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-secondary mx-auto mb-2">
                    {person.profile_path ? (
                      <img src={getImageUrl(person.profile_path, "w185")} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-display">
                        {person.name[0]}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-foreground truncate">{person.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trailer */}
        {trailer && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Trailer</h2>
            <div className="aspect-video rounded-xl overflow-hidden max-w-3xl">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </section>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Similar Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {similar.map((m: TMDBMovie, i: number) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
