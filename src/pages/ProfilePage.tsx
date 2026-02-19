import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { Film, Star, Eye, Bookmark, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { getImageUrl, getMovieDetails } from "@/lib/tmdb";

type TabKey = "watched" | "rated" | "watchlist";

function MovieTile({ tmdbId, extra }: { tmdbId: number; extra?: React.ReactNode }) {
  const { data: movie } = useQuery({
    queryKey: ["movie", tmdbId],
    queryFn: () => getMovieDetails(tmdbId),
  });

  if (!movie) {
    return <div className="aspect-[2/3] rounded-lg bg-secondary animate-pulse" />;
  }

  return (
    <Link to={`/movie/${movie.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-secondary">
        <img
          src={getImageUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-2 px-1">
        <h3 className="font-display font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        {extra}
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("watched");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: watchedList } = useQuery({
    queryKey: ["user-watched-list"],
    queryFn: async () => {
      const { data } = await supabase.from("watched").select("*").eq("user_id", user!.id).order("watched_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: ratingsList } = useQuery({
    queryKey: ["user-ratings-list"],
    queryFn: async () => {
      const { data } = await supabase.from("user_ratings").select("*").eq("user_id", user!.id).order("updated_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: watchlistList } = useQuery({
    queryKey: ["user-watchlist"],
    queryFn: async () => {
      const { data } = await supabase.from("watchlist").select("*").eq("user_id", user!.id).order("added_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const stats = {
    watchedCount: watchedList?.length ?? 0,
    totalRated: ratingsList?.length ?? 0,
    watchlistCount: watchlistList?.length ?? 0,
    avgRating: ratingsList && ratingsList.length > 0
      ? ratingsList.reduce((sum, r) => sum + r.rating, 0) / ratingsList.length
      : 0,
  };

  const statCards: { icon: typeof Eye; label: string; value: string | number; tab?: TabKey }[] = [
    { icon: Eye, label: "Watched", value: stats.watchedCount, tab: "watched" },
    { icon: Star, label: "Rated", value: stats.totalRated, tab: "rated" },
    { icon: Bookmark, label: "Watchlist", value: stats.watchlistCount, tab: "watchlist" },
    { icon: Clock, label: "Avg Rating", value: stats.avgRating ? stats.avgRating.toFixed(1) : "—" },
  ];

  const tabs: { key: TabKey; label: string }[] = [
    { key: "watched", label: "Watched" },
    { key: "rated", label: "Rated" },
    { key: "watchlist", label: "Watchlist" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-4">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile header */}
        <div className="glass-panel rounded-2xl p-8 max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Film className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-foreground">{profile?.username ?? "Movie Fan"}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <button onClick={signOut} className="py-2 px-4 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-sm transition-colors">
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map(({ icon: Icon, label, value, tab }) => (
              <button
                key={label}
                onClick={() => tab && setActiveTab(tab)}
                className={`bg-secondary rounded-xl p-4 text-center transition-all ${
                  tab === activeTab ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/40"
                } ${tab ? "cursor-pointer" : "cursor-default"}`}
              >
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="font-display text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-1 mb-6 bg-secondary rounded-lg p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeTab === t.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {activeTab === "watched" && (
              watchedList && watchedList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {watchedList.map((w) => (
                    <MovieTile
                      key={w.id}
                      tmdbId={w.tmdb_id}
                      extra={
                        <p className="text-xs text-muted-foreground">
                          Watched {new Date(w.watched_at).toLocaleDateString()}
                          {w.rewatch_count > 0 && ` · ${w.rewatch_count}x rewatched`}
                        </p>
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="No movies watched yet. Start exploring!" />
              )
            )}

            {activeTab === "rated" && (
              ratingsList && ratingsList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ratingsList.map((r) => (
                    <MovieTile
                      key={r.id}
                      tmdbId={r.tmdb_id}
                      extra={
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 text-primary fill-primary" />
                          <span className="text-xs font-semibold text-foreground">{r.rating}</span>
                          {r.notes && <span className="text-xs text-muted-foreground ml-1 truncate">— {r.notes}</span>}
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="No ratings yet. Watch a movie and share your thoughts!" />
              )
            )}

            {activeTab === "watchlist" && (
              watchlistList && watchlistList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {watchlistList.map((w) => (
                    <MovieTile
                      key={w.id}
                      tmdbId={w.tmdb_id}
                      extra={
                        <p className="text-xs text-muted-foreground capitalize">
                          {w.priority} priority
                        </p>
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="Your watchlist is empty. Add movies you want to see!" />
              )
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
