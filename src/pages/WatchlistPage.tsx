import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl } from "@/lib/tmdb";
import { Link, Navigate } from "react-router-dom";
import { Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function WatchlistPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ["user-watchlist"],
    queryFn: async () => {
      const { data, error } = await supabase.from("watchlist").select("*").order("added_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: async (tmdbId: number) => {
      await supabase.from("watchlist").delete().eq("tmdb_id", tmdbId).eq("user_id", user!.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-watchlist"] });
      toast.success("Removed from watchlist");
    },
  });

  if (!loading && !user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-4">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">My Watchlist</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : watchlist && watchlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {watchlist.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/movie/${item.tmdb_id}`} className="block group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-secondary">
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="font-display text-lg">#{item.tmdb_id}</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => { e.preventDefault(); removeMutation.mutate(item.tmdb_id); }}
                      className="p-1.5 rounded-full bg-background/80 text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Link>
              <div className="mt-2">
                <span className="inline-block px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground capitalize">{item.priority}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg mb-4">Your watchlist is empty</p>
          <Link to="/"><Button>Browse Movies</Button></Link>
        </div>
      )}
    </div>
  );
}
