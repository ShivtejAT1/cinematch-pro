import { useQuery } from "@tanstack/react-query";
import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies, getTrendingMovies } from "@/lib/tmdb";
import HeroSection from "@/components/HeroSection";
import MovieCarousel from "@/components/MovieCarousel";
import MoodPicker from "@/components/MoodPicker";
import { Shuffle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  const trending = useQuery({ queryKey: ["trending"], queryFn: () => getTrendingMovies("week") });
  const popular = useQuery({ queryKey: ["popular"], queryFn: () => getPopularMovies() });
  const topRated = useQuery({ queryKey: ["topRated"], queryFn: () => getTopRatedMovies() });
  const nowPlaying = useQuery({ queryKey: ["nowPlaying"], queryFn: () => getNowPlayingMovies() });
  const upcoming = useQuery({ queryKey: ["upcoming"], queryFn: () => getUpcomingMovies() });

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

        <MovieCarousel title="🔥 Trending This Week" movies={trending.data?.results ?? []} isLoading={trending.isLoading} />
        <MovieCarousel title="🎬 Now Playing" movies={nowPlaying.data?.results ?? []} isLoading={nowPlaying.isLoading} />
        <MovieCarousel title="⭐ Top Rated" movies={topRated.data?.results ?? []} isLoading={topRated.isLoading} />
        <MovieCarousel title="🍿 Popular" movies={popular.data?.results ?? []} isLoading={popular.isLoading} />
        <MovieCarousel title="📅 Upcoming" movies={upcoming.data?.results ?? []} isLoading={upcoming.isLoading} />
      </div>
    </div>
  );
}
