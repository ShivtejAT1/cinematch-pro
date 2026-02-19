import { useQuery } from "@tanstack/react-query";
import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies, getTrendingMovies, getMoviesByGenre, GENRE_MAP } from "@/lib/tmdb";
import HeroSection from "@/components/HeroSection";
import MovieCarousel from "@/components/MovieCarousel";
import MoodPicker from "@/components/MoodPicker";
import { Shuffle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Curated genre showcase — pick interesting ones
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
  const trending = useQuery({ queryKey: ["trending"], queryFn: () => getTrendingMovies("week") });
  const popular = useQuery({ queryKey: ["popular"], queryFn: () => getPopularMovies() });
  const topRated = useQuery({ queryKey: ["topRated"], queryFn: () => getTopRatedMovies() });
  const nowPlaying = useQuery({ queryKey: ["nowPlaying"], queryFn: () => getNowPlayingMovies() });
  const upcoming = useQuery({ queryKey: ["upcoming"], queryFn: () => getUpcomingMovies() });

  // Featured genre rows (3 genres)
  const actionMovies = useQuery({ queryKey: ["genre-home", 28], queryFn: () => getMoviesByGenre(28) });
  const horrorMovies = useQuery({ queryKey: ["genre-home", 27], queryFn: () => getMoviesByGenre(27) });
  const scifiMovies = useQuery({ queryKey: ["genre-home", 878], queryFn: () => getMoviesByGenre(878) });

  return (
    <div className="min-h-screen">
      <HeroSection movies={trending.data?.results ?? []} isLoading={trending.isLoading} />

      <div className="container mx-auto px-4 space-y-10 pb-16 -mt-16 relative z-10">
        {/* Surprise Me button */}
        <div className="flex justify-center">
          <Link to="/surprise">
            <Button size="lg" variant="outline" className="gap-2 font-display font-semibold border-primary/30 hover:border-primary hover:bg-primary/10">
              <Shuffle className="w-5 h-5" /> Surprise Me
            </Button>
          </Link>
        </div>

        <MoodPicker />

        <MovieCarousel title="🔥 Trending This Week" movies={trending.data?.results ?? []} isLoading={trending.isLoading} seeAllHref="/genre/0" />
        <MovieCarousel title="🎬 Now Playing" movies={nowPlaying.data?.results ?? []} isLoading={nowPlaying.isLoading} seeAllHref="/genre/0" />
        <MovieCarousel title="⭐ Top Rated" movies={topRated.data?.results ?? []} isLoading={topRated.isLoading} seeAllHref="/genre/18" />
        <MovieCarousel title="🍿 Popular Right Now" movies={popular.data?.results ?? []} isLoading={popular.isLoading} seeAllHref="/genre/28" />
        <MovieCarousel title="📅 Coming Soon" movies={upcoming.data?.results ?? []} isLoading={upcoming.isLoading} />

        {/* Browse by Genre shelf */}
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

        {/* Genre rows */}
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
