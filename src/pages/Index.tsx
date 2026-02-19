import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies,
  getTrendingMovies, getMoviesByGenre, getOscarMovies, getCultClassics, GENRE_MAP
} from "@/lib/tmdb";
import HeroSection from "@/components/HeroSection";
import MovieCarousel from "@/components/MovieCarousel";
import MoodPicker from "@/components/MoodPicker";
import ForYouSection from "@/components/ForYouSection";
import { Shuffle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FEATURED_GENRES = [
  { id: 28, emoji: "💥" },
  { id: 27, emoji: "👻" },
  { id: 35, emoji: "😂" },
  { id: 10749, emoji: "💕" },
  { id: 878, emoji: "🚀" },
  { id: 18, emoji: "🎭" },
  { id: 16, emoji: "✨" },
  { id: 80, emoji: "🔍" },
];

export default function Index() {
  const [trendingWindow, setTrendingWindow] = useState<"day" | "week">("week");

  const trending = useQuery({ queryKey: ["trending", trendingWindow], queryFn: () => getTrendingMovies(trendingWindow) });
  const popular = useQuery({ queryKey: ["popular"], queryFn: () => getPopularMovies() });
  const topRated = useQuery({ queryKey: ["topRated"], queryFn: () => getTopRatedMovies() });
  const nowPlaying = useQuery({ queryKey: ["nowPlaying"], queryFn: () => getNowPlayingMovies() });
  const upcoming = useQuery({ queryKey: ["upcoming"], queryFn: () => getUpcomingMovies() });
  const actionMovies = useQuery({ queryKey: ["genre-home", 28], queryFn: () => getMoviesByGenre(28) });
  const horrorMovies = useQuery({ queryKey: ["genre-home", 27], queryFn: () => getMoviesByGenre(27) });
  const scifiMovies = useQuery({ queryKey: ["genre-home", 878], queryFn: () => getMoviesByGenre(878) });
  const oscarMovies = useQuery({ queryKey: ["oscar-home"], queryFn: () => getOscarMovies() });
  const cultMovies = useQuery({ queryKey: ["cult-home"], queryFn: () => getCultClassics() });

  return (
    <div className="min-h-screen">
      <HeroSection movies={trending.data?.results ?? []} isLoading={trending.isLoading} />

      <div className="container mx-auto px-4 space-y-10 pb-16 -mt-16 relative z-10">
        {/* Surprise Me + New Releases */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/surprise">
            <Button size="lg" variant="outline" className="gap-2 font-display font-semibold border-primary/30 hover:border-primary hover:bg-primary/10">
              <Shuffle className="w-5 h-5" /> Surprise Me
            </Button>
          </Link>
          <Link to="/new-releases">
            <Button size="lg" variant="outline" className="gap-2 font-display font-semibold border-primary/30 hover:border-primary hover:bg-primary/10">
              ✨ New Releases
            </Button>
          </Link>
          <Link to="/collections">
            <Button size="lg" variant="outline" className="gap-2 font-display font-semibold border-primary/30 hover:border-primary hover:bg-primary/10">
              🏆 Special Collections
            </Button>
          </Link>
        </div>

        <MoodPicker />

        {/* For You Section */}
        <ForYouSection />

        {/* Trending with toggle */}
        <section className="relative">
          <div className="flex items-center justify-between mb-4 px-1 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">🔥 Trending</h2>
              <div className="flex rounded-full bg-secondary p-0.5 text-xs">
                <button
                  onClick={() => setTrendingWindow("day")}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${trendingWindow === "day" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTrendingWindow("week")}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${trendingWindow === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  This Week
                </button>
              </div>
            </div>
            <Link to="/new-releases" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              See All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <MovieCarousel title="" movies={trending.data?.results ?? []} isLoading={trending.isLoading} />
        </section>

        <MovieCarousel title="🎬 Now Playing" movies={nowPlaying.data?.results ?? []} isLoading={nowPlaying.isLoading} seeAllHref="/new-releases" />
        <MovieCarousel title="⭐ Top Rated" movies={topRated.data?.results ?? []} isLoading={topRated.isLoading} seeAllHref="/genre/18" />
        <MovieCarousel title="🍿 Popular Right Now" movies={popular.data?.results ?? []} isLoading={popular.isLoading} seeAllHref="/genre/28" />

        {/* Oscar Worthy */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">🏆 Oscar Worthy</h2>
            <Link to="/collections" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              See All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <MovieCarousel title="" movies={oscarMovies.data?.results ?? []} isLoading={oscarMovies.isLoading} />
        </section>

        {/* Cult Classics */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">💀 Cult Classics</h2>
            <Link to="/collections" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              See All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <MovieCarousel title="" movies={cultMovies.data?.results ?? []} isLoading={cultMovies.isLoading} />
        </section>

        <MovieCarousel title="📅 Coming Soon" movies={upcoming.data?.results ?? []} isLoading={upcoming.isLoading} />

        {/* Browse by Genre */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">🎭 Browse by Genre</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {FEATURED_GENRES.map(({ id, emoji }, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link
                  to={`/genre/${id}`}
                  className="glass-panel rounded-xl p-3 text-center hover-lift block hover:border-primary/50 transition-all"
                >
                  <span className="text-2xl block mb-1">{emoji}</span>
                  <span className="font-display text-xs font-semibold text-foreground">{GENRE_MAP[id]}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <MovieCarousel title="💥 Action & Adventure" movies={actionMovies.data?.results ?? []} isLoading={actionMovies.isLoading} seeAllHref="/genre/28" />
        <MovieCarousel title="👻 Horror" movies={horrorMovies.data?.results ?? []} isLoading={horrorMovies.isLoading} seeAllHref="/genre/27" />
        <MovieCarousel title="🚀 Sci-Fi" movies={scifiMovies.data?.results ?? []} isLoading={scifiMovies.isLoading} seeAllHref="/genre/878" />

        {/* All Genres CTA */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Explore All Genres</h3>
            <p className="text-muted-foreground text-sm mt-1">Dive deep into any genre with hundreds of movies</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(GENRE_MAP).slice(0, 10).map(([id, name]) => (
              <Link
                key={id}
                to={`/genre/${id}`}
                className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium hover:bg-primary/20 hover:text-primary transition-all"
              >
                {name}
              </Link>
            ))}
            <Link
              to={`/genre/${Object.keys(GENRE_MAP)[0]}`}
              className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all flex items-center gap-1"
            >
              More <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
