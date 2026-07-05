import Image from "next/image";
import { getLineupAvailability } from "@/lib/lineup-availability";

const DEFAULT_PROFILE_IMAGE = "/images/profile.webp";

export type KnightAvailability = {
  active: boolean;
  weekdayHours: string;
  weekendHours: string;
};

export default function KnightAvatar({
  availability,
  className = "",
  image,
  name,
  priority = false,
  size = 80,
}: {
  availability?: KnightAvailability | null;
  className?: string;
  image?: string | null;
  name: string;
  priority?: boolean;
  size?: number;
}) {
  const status = availability
    ? getLineupAvailability(availability)
    : { available: false, label: "비활동" };
  const dotSize = size >= 160 ? 34 : size >= 80 ? 22 : 17;
  const borderSize = size >= 160 ? 5 : size >= 80 ? 4 : 3;
  const dotOffset = Math.round(size * 0.1465 - dotSize / 2);
  const imageSrc = image || DEFAULT_PROFILE_IMAGE;

  return (
    <span
      className={`relative block shrink-0 overflow-visible rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="relative block h-full w-full overflow-hidden rounded-full border border-gold/20 bg-black">
        <Image
          src={imageSrc}
          alt={name}
          width={size}
          height={size}
          priority={priority}
          className="h-full w-full object-cover rounded-full"
        />
      </span>
      <span
        className={`absolute rounded-full shadow-lg ${
          status.available ? "bg-emerald-400" : "bg-red-500"
        }`}
        style={{
          width: dotSize,
          height: dotSize,
          right: dotOffset,
          bottom: dotOffset,
          border: `${borderSize}px solid #111`,
        }}
        aria-hidden="true"
        title={status.label}
      />
    </span>
  );
}
