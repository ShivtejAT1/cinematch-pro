import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import MovieCard from "./MovieCard";
import { TMDBMovie } from "@/lib/tmdb";
import { Link } from "react-router-dom";

interface MovieCarouselProps {
  title: string;
  movies: TMDBMovie[];
  isLoading?: boolean;
  seeAllHref?: string;
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-[150px] sm:w-[180px]">
      <div className="aspect-[2/3] rounded-lg bg-secondary animate-shimmer" 
        style={{ backgroundImage: "linear-gradient(90deg, hsl(220 16% 16%) 0%, hsl(220 14% 20%) 50%, hsl(220 16% 16%) 100%)", backgroundSize: "200% 100%" }} />
      <div className="mt-2 h-4 bg-secondary rounded w-3/4" />
      <div className="mt-1 h-3 bg-secondary rounded w-1/2" />
    </div>
  );
}

export default function MovieCarousel({ title, movies, isLoading, seeAllHref }: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="relative group/carousel">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-3">
          {seeAllHref && (
            <Link
              to={seeAllHref}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <div className="flex gap-1">
            <button onClick={() => scroll("left")} className="p-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll("right")} className="p-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : movies.map((movie, i) => (
              <div key={movie.id} className="shrink-0 w-[150px] sm:w-[180px]">
                <MovieCard movie={movie} index={i} />
              </div>
            ))}
      </div>
    </section>
  );
}
