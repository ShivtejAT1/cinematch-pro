import { Link } from "react-router-dom";
import { Play, Info, Star } from "lucide-react";
import { getBackdropUrl, TMDBMovie } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface HeroSectionProps {
  movie: TMDBMovie | null;
  isLoading?: boolean;
}

export default function HeroSection({ movie, isLoading }: HeroSectionProps) {
  if (isLoading || !movie) {
    return (
      <div className="relative h-[70vh] min-h-[500px] bg-secondary animate-pulse" />
    );
  }

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={getBackdropUrl(movie.backdrop_path)}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="relative h-full container mx-auto px-4 flex items-end pb-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
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
      </div>
    </div>
  );
}
