import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOscarMovies, getCultClassics, getMoviesByDecade, TMDBMovie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { motion } from "framer-motion";
import { Loader2, ChevronDown, Trophy, Film, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLLECTIONS = [
  { key: "oscar", label: "🏆 Oscar Worthy", icon: Trophy, desc: "Critically acclaimed, award-season gems" },
  { key: "cult", label: "💀 Cult Classics", icon: Film, desc: "Films that defined generations of cinema lovers" },
  { key: "90s", label: "📼 90s Hits", icon: Clock, desc: "The golden decade of blockbusters" },
  { key: "80s", label: "🕹️ 80s Classics", icon: Clock, desc: "Nostalgia at its finest" },
  { key: "2000s", label: "💿 2000s Icons", icon: Clock, desc: "Y2K cinema that shaped a generation" },
] as const;

type CollectionKey = typeof COLLECTIONS[number]["key"];

export default function SpecialCollectionsPage() {
  const [active, setActive] = useState<CollectionKey>("oscar");
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<TMDBMovie[]>([]);

  const oscarQ = useQuery({ queryKey: ["oscar", page], queryFn: () => getOscarMovies(page), enabled: active === "oscar" });
  const cultQ = useQuery({ queryKey: ["cult", page], queryFn: () => getCultClassics(page), enabled: active === "cult" });
  const s90Q = useQuery({ queryKey: ["decade", "1990", page], queryFn: () => getMoviesByDecade("1990", page), enabled: active === "90s" });
  const s80Q = useQuery({ queryKey: ["decade", "1980", page], queryFn: () => getMoviesByDecade("1980", page), enabled: active === "80s" });
  const s00Q = useQuery({ queryKey: ["decade", "2000", page], queryFn: () => getMoviesByDecade("2000", page), enabled: active === "2000s" });

  const queryMap = { oscar: oscarQ, cult: cultQ, "90s": s90Q, "80s": s80Q, "2000s": s00Q };
  const currentQ = queryMap[active];
  const rawMovies: TMDBMovie[] = currentQ.data?.results ?? [];
  const isLoading = currentQ.isLoading;
  const isFetching = currentQ.isFetching;
  const totalPages = currentQ.data?.total_pages ?? 1;

  const seen = new Set(accumulated.map((m) => m.id));
  const uniqueNew = rawMovies.filter((m) => !seen.has(m.id));
  const displayMovies = accumulated.length === 0 ? rawMovies : [...accumulated, ...uniqueNew];

  const handleCollectionChange = (key: CollectionKey) => {
    setActive(key);
    setPage(1);
    setAccumulated([]);
  };

  const handleLoadMore = () => {
    setAccumulated(displayMovies);
    setPage((p) => p + 1);
  };

  const activeCollection = COLLECTIONS.find((c) => c.key === active)!;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            🎖️ Special Collections
          </h1>
          <p className="text-muted-foreground">Curated lists of cinema's finest moments</p>
        </div>

        {/* Collection tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-10">
          {COLLECTIONS.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => handleCollectionChange(key)}
              className={`text-left p-3 rounded-xl border transition-all ${
                active === key
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/40 hover:bg-secondary"
              }`}
            >
              <p className={`font-display font-semibold text-sm ${active === key ? "text-foreground" : ""}`}>{label}</p>
              <p className="text-xs mt-0.5 opacity-70 line-clamp-2">{desc}</p>
            </button>
          ))}
        </div>

        {/* Active description */}
        <div className="mb-6 glass-panel rounded-xl px-5 py-3 inline-flex items-center gap-3">
          <span className="text-lg">{activeCollection.label.split(" ")[0]}</span>
          <div>
            <p className="font-display font-semibold text-sm text-foreground">{activeCollection.label.substring(2)}</p>
            <p className="text-xs text-muted-foreground">{activeCollection.desc}</p>
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
        {!isLoading && page < Math.min(totalPages, 10) && (
          <div className="flex justify-center mt-10">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/10"
              onClick={handleLoadMore}
              disabled={isFetching}
            >
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
