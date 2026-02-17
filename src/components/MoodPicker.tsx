import { useNavigate } from "react-router-dom";
import { MOOD_GENRES } from "@/lib/tmdb";
import { motion } from "framer-motion";

export default function MoodPicker() {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4 px-1">
        What's Your Mood?
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {Object.entries(MOOD_GENRES).map(([key, { label, emoji }], i) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            onClick={() => navigate(`/mood/${key}`)}
            className="glass-panel rounded-xl p-4 text-center hover-lift cursor-pointer hover:border-primary/50 transition-colors"
          >
            <span className="text-3xl block mb-2">{emoji}</span>
            <span className="font-display text-sm font-semibold text-foreground">{label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
