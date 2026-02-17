import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

export default function StarRating({ rating, onRate, size = "md", readOnly = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const maxStars = 5;

  const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  const iconSize = sizeMap[size];

  // Map 1-10 scale to 1-5 display
  const displayRating = rating / 2;
  const displayHover = hover / 2;
  const active = displayHover || displayRating;

  const handleClick = (starIndex: number, isHalf: boolean) => {
    if (readOnly || !onRate) return;
    const value = isHalf ? starIndex * 2 - 1 : starIndex * 2;
    onRate(value);
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }).map((_, i) => {
        const starNum = i + 1;
        const filled = active >= starNum;
        const halfFilled = !filled && active >= starNum - 0.5;

        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            className={`relative ${readOnly ? "cursor-default" : "cursor-pointer"} transition-transform hover:scale-110`}
            onMouseEnter={() => !readOnly && setHover(starNum * 2)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => handleClick(starNum, false)}
          >
            <Star
              className={`${iconSize} transition-colors ${
                filled ? "text-primary fill-primary" : halfFilled ? "text-primary fill-primary/50" : "text-muted-foreground"
              }`}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-semibold text-foreground">
        {rating > 0 ? rating.toFixed(1) : "—"}
      </span>
    </div>
  );
}
