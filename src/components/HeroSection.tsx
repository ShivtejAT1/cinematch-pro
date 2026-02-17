import { Link } from "react-router-dom";
import { Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { getBackdropUrl, TMDBMovie } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface HeroSectionProps {
  movies: TMDBMovie[];
  isLoading?: boolean;
}

export default function HeroSection({ movies, isLoading }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const heroMovies = movies.slice(0, 6);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % heroMovies.length);
  }, [heroMovies.length]);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + heroMovies.length) % heroMovies.length);
  }, [heroMovies.length]);

  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, heroMovies.length]);

  if (isLoading || heroMovies.length === 0) {
    return (
      <div className="relative h-[70vh] min-h-[500px] bg-secondary animate-pulse" />
    );
  }

  const movie = heroMovies[current];

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={getBackdropUrl(movie.backdrop_path)}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {heroMovies.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div className="relative h-full container mx-auto px-4 flex items-end pb-16 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-3 leading-tight">
              {movie.title}
            </h1>
            <div className="flex items-center gap-4 mb-4 text-sm">
              <span className="flex items-center gap-1 text-primary font-semibold">
                <Star className="w-4 h-4 fill-primary" />
                {movie.vote_average.toFixed(1)}
              </span>
              <span className="text-muted-foreground">{movie.release_date?.split("-")[0]}</span>
            </div>
            <p className="text-foreground/80 line-clamp-3 mb-6 leading-relaxed">
              {movie.overview}
            </p>
            <div className="flex gap-3">
              <Link to={`/movie/${movie.id}`}>
                <Button size="lg" className="font-semibold gap-2">
                  <Info className="w-4 h-4" /> More Info
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      {heroMovies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroMovies.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-primary w-6" : "bg-foreground/30 hover:bg-foreground/50"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
