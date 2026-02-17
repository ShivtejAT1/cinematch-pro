import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Search, Film, Bookmark, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
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
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </form>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
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
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </form>
          {user ? (
            <div className="flex flex-col gap-1">
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
            <Link to="/auth" onClick={() => setMobileOpen(false)}>
              <Button className="w-full font-semibold">Sign In</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
