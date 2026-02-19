import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNewReleases, getTrendingMovies, getUpcomingMovies, TMDBMovie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { motion } from "framer-motion";
import { Loader2, ChevronDown, Sparkles, TrendingUp, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";

const TABS = [
  { key: "new", label: "New Releases", icon: Sparkles },
  { key: "trending", label: "Trending Now", icon: TrendingUp },
  { key: "upcoming", label: "Coming Soon", icon: CalendarClock },
] as const;

type Tab = typeof TABS[number]["key"];

export default function NewReleasesPage() {
  const [tab, setTab] = useState<Tab>("new");
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<TMDBMovie[]>([]);

  const newReleases = useQuery({
    queryKey: ["new-releases", page],
    queryFn: () => getNewReleases(page),
    enabled: tab === "new",
  });

  const trending = useQuery({
    queryKey: ["trending-week"],
    queryFn: () => getTrendingMovies("week"),
    enabled: tab === "trending",
  });

  const upcoming = useQuery({
    queryKey: ["upcoming-full"],
    queryFn: () => getUpcomingMovies(),
    enabled: tab === "upcoming",
  });

  const rawMovies: TMDBMovie[] =
    tab === "new" ? newReleases.data?.results ?? []
    : tab === "trending" ? trending.data?.results ?? []
    : upcoming.data?.results ?? [];

  const isLoading =
    tab === "new" ? newReleases.isLoading
    : tab === "trending" ? trending.isLoading
    : upcoming.isLoading;

  const isFetching = tab === "new" ? newReleases.isFetching : false;
  const totalPages = tab === "new" ? (newReleases.data?.total_pages ?? 1) : 1;

  // Accumulate pages for new releases
  const seen = new Set(accumulated.map((m) => m.id));
  const uniqueNew = rawMovies.filter((m) => !seen.has(m.id));
  const displayMovies = tab === "new"
    ? (accumulated.length === 0 ? rawMovies : [...accumulated, ...uniqueNew])
    : rawMovies;

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setPage(1);
    setAccumulated([]);
  };

  const handleLoadMore = () => {
    setAccumulated(displayMovies);
    setPage((p) => p + 1);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            🎬 New & Trending
          </h1>
          <p className="text-muted-foreground">Fresh out of the cinema and trending worldwide</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                tab === key
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
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
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayMovies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i % 20} />
            ))}
          </motion.div>
        )}

        {/* Load More (only for new releases) */}
        {tab === "new" && !isLoading && page < Math.min(totalPages, 10) && (
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
