import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { Film, Star, Eye, Bookmark, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const [ratings, watchlist, watched] = await Promise.all([
        supabase.from("user_ratings").select("rating").eq("user_id", user!.id),
        supabase.from("watchlist").select("id").eq("user_id", user!.id),
        supabase.from("watched").select("id").eq("user_id", user!.id),
      ]);
      const allRatings = ratings.data ?? [];
      const avgRating = allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        : 0;
      return {
        totalRated: allRatings.length,
        avgRating,
        watchlistCount: watchlist.data?.length ?? 0,
        watchedCount: watched.data?.length ?? 0,
      };
    },
    enabled: !!user,
  });

  if (!loading && !user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-panel rounded-2xl p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Film className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{profile?.username ?? "Movie Fan"}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Eye, label: "Watched", value: stats?.watchedCount ?? 0 },
              { icon: Star, label: "Rated", value: stats?.totalRated ?? 0 },
              { icon: Bookmark, label: "Watchlist", value: stats?.watchlistCount ?? 0 },
              { icon: Clock, label: "Avg Rating", value: stats?.avgRating ? stats.avgRating.toFixed(1) : "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-secondary rounded-xl p-4 text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="font-display text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link to="/watchlist" className="flex-1">
              <button className="w-full py-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm transition-colors">
                View Watchlist
              </button>
            </Link>
            <button onClick={signOut} className="flex-1 py-3 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-sm transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
