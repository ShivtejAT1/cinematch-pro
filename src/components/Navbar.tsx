import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { searchMovies, getImageUrl, TMDBMovie } from "@/lib/tmdb";
import { Search, Film, Bookmark, User, LogOut, Menu, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

function SearchSuggestions({
  query,
  onSelect,
  visible,
}: {
  query: string;
  onSelect: (movieId: number) => void;
  visible: boolean;
}) {
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMovies(query);
        setResults(data.results?.slice(0, 6) ?? []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!visible || query.trim().length < 2) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 glass-panel rounded-lg border border-border shadow-xl overflow-hidden z-50">
      {loading ? (
        <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
      ) : results.length > 0 ? (
        <>
          <p className="px-3 pt-2 pb-1 text-xs text-muted-foreground font-medium">Looking for these...</p>
          {results.map((movie) => (
            <button
              key={movie.id}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(movie.id);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary/80 transition-colors text-left"
            >
              <img
                src={getImageUrl(movie.poster_path, "w92")}
                alt={movie.title}
                className="w-10 h-14 rounded object-cover bg-secondary shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{movie.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{movie.release_date?.split("-")[0]}</span>
                  {movie.vote_average > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      {movie.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </>
      ) : (
        <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSuggestions(false);
      setMobileOpen(false);
    }
  };

  const handleSelect = (movieId: number) => {
    navigate(`/movie/${movieId}`);
    setSearchQuery("");
    setShowSuggestions(false);
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Film className="w-7 h-7 text-primary" />
          <span className="font-display text-xl font-bold text-gradient-gold hidden sm:inline">
            CineMatch
          </span>
        </Link>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <SearchSuggestions query={searchQuery} onSelect={handleSelect} visible={showSuggestions} />
          </div>
        </form>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/new-releases">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
              ✨ New
            </Button>
          </Link>
          <Link to="/collections">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
              🏆 Collections
            </Button>
          </Link>
          {user ? (
            <>
              <Link to="/watchlist">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Bookmark className="w-4 h-4 mr-1" /> Watchlist
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <User className="w-4 h-4 mr-1" /> Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-accent">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="font-semibold">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-panel border-t p-4 space-y-3 animate-fade-in">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <SearchSuggestions query={searchQuery} onSelect={handleSelect} visible={showSuggestions} />
            </div>
          </form>
          {user ? (
            <div className="flex flex-col gap-1">
              <Link to="/new-releases" onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-secondary text-foreground flex items-center gap-2">
                ✨ New Releases
              </Link>
              <Link to="/collections" onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-secondary text-foreground flex items-center gap-2">
                🏆 Special Collections
              </Link>
              <Link to="/watchlist" onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-secondary text-foreground flex items-center gap-2">
                <Bookmark className="w-4 h-4" /> Watchlist
              </Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-secondary text-foreground flex items-center gap-2">
                <User className="w-4 h-4" /> Profile
              </Link>
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="p-2 rounded-md hover:bg-secondary text-accent flex items-center gap-2 text-left">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <Link to="/new-releases" onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-secondary text-foreground flex items-center gap-2">
                ✨ New Releases
              </Link>
              <Link to="/collections" onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-secondary text-foreground flex items-center gap-2">
                🏆 Special Collections
              </Link>
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                <Button className="w-full font-semibold mt-1">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
