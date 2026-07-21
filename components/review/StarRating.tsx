"use client";

import { Star } from "lucide-react";
import { useState } from "react";

export default function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-gold transition-transform hover:scale-110"
          aria-label={`${star}점`}
        >
          <Star
            size={28}
            fill={(hovered || value) >= star ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </button>
      ))}
      <span className="ml-2 self-center text-sm font-black text-zinc-400">
        {hovered || value}점
      </span>
    </div>
  );
}
