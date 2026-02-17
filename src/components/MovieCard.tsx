import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { getImageUrl, TMDBMovie } from "@/lib/tmdb";
import { motion } from "framer-motion";

interface MovieCardProps {
  movie: TMDBMovie;
  index?: number;
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const year = movie.release_date?.split("-")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/movie/${movie.id}`} className="group block hover-lift">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-secondary">
          <img
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <p className="text-sm text-foreground/80 line-clamp-2">{movie.overview}</p>
          </div>
          {movie.vote_average > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold">
              <Star className="w-3 h-3 text-primary fill-primary" />
              <span className="text-foreground">{movie.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="mt-2 px-1">
          <h3 className="font-display font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          {year && <p className="text-xs text-muted-foreground">{year}</p>}
        </div>
      </Link>
    </motion.div>
  );
}
