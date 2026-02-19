import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPersonDetails, getImageUrl } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, Star } from "lucide-react";

export default function ActorPage() {
  const { id } = useParams<{ id: string }>();
  const personId = Number(id);

  const { data: person, isLoading } = useQuery({
    queryKey: ["person", personId],
    queryFn: () => getPersonDetails(personId),
    enabled: !!personId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-muted-foreground">
        Person not found
      </div>
    );
  }

  // Sort movies by popularity, deduplicate
  const seen = new Set<number>();
  const movies = (person.movie_credits?.cast ?? [])
    .filter((m: any) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return m.poster_path && m.vote_count > 20;
    })
    .sort((a: any, b: any) => b.popularity - a.popularity);

  const knownFor = movies.slice(0, 3).map((m: any) => m.title).join(", ");

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Back */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Actor header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-8 mb-12"
        >
          <div className="shrink-0 mx-auto sm:mx-0">
            <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-secondary shadow-2xl">
              {person.profile_path ? (
                <img
                  src={getImageUrl(person.profile_path, "w342")}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-display text-muted-foreground">
                  {person.name[0]}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">{person.name}</h1>
              {person.known_for_department && (
                <p className="text-primary font-medium mt-1">{person.known_for_department}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {person.birthday && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Born {new Date(person.birthday).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  {person.place_of_birth && ` in ${person.place_of_birth}`}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-primary" />
                {movies.length} movies
              </span>
            </div>

            {knownFor && (
              <p className="text-sm text-muted-foreground">
                Known for: <span className="text-foreground">{knownFor}</span>
              </p>
            )}

            {person.biography && (
              <p className="text-foreground/80 leading-relaxed line-clamp-4 text-sm max-w-2xl">
                {person.biography}
              </p>
            )}
          </div>
        </motion.div>

        {/* Filmography */}
        <section>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            🎬 Filmography <span className="text-muted-foreground text-lg font-normal">({movies.length} movies)</span>
          </h2>
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {movies.map((movie: any, i: number) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </motion.div>
        </section>
      </div>
    </div>
  );
}
