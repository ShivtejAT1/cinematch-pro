import { useQuery } from "@tanstack/react-query";
import { getPopularMovies, TMDBMovie } from "@/lib/tmdb";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function SurprisePage() {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["surprise"],
    queryFn: () => getPopularMovies(Math.floor(Math.random() * 5) + 1),
  });

  useEffect(() => {
    if (data?.results?.length) {
      const movies: TMDBMovie[] = data.results;
      const random = movies[Math.floor(Math.random() * movies.length)];
      navigate(`/movie/${random.id}`, { replace: true });
    }
  }, [data, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="text-6xl block mb-4 animate-bounce">🎲</span>
        <p className="font-display text-xl text-foreground">Finding you a surprise...</p>
      </div>
    </div>
  );
}
