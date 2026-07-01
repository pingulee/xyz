type LineupAvailabilityInput = {
  active: boolean;
  weekdayHours: string;
  weekendHours: string;
};

type SeoulTime = {
  day: string;
  minutes: number;
};

function getSeoulTime(now: Date): SeoulTime {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const day = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const rawHour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const hour = rawHour === 24 ? 0 : rawHour;
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);

  return {
    day,
    minutes: hour * 60 + minute,
  };
}

function isAvailableInRange(hours: string, currentMinutes: number) {
  const normalized = hours.trim().toUpperCase();

  if (!normalized) return false;
  if (normalized === "ALL") return true;
  if (
    normalized.includes("불가능") ||
    normalized.includes("불가") ||
    normalized.includes("휴무")
  ) {
    return false;
  }

  const match = normalized.match(
    /(\d{1,2})(?::(\d{2}))?\s*(?:~|-)\s*(\d{1,2})(?::(\d{2}))?/,
  );

  if (!match) return false;

  const startHour = Number(match[1]);
  const startMinute = Number(match[2] ?? 0);
  const endHour = Number(match[3]);
  const endMinute = Number(match[4] ?? 0);
  const start = (startHour % 24) * 60 + startMinute;
  const end = (endHour % 24) * 60 + endMinute;

  if (start === end) return true;
  if (start < end) {
    return currentMinutes >= start && currentMinutes < end;
  }

  return currentMinutes >= start || currentMinutes < end;
}

export function getLineupAvailability(
  lineup: LineupAvailabilityInput,
  now = new Date(),
) {
  if (!lineup.active) {
    return { available: false, label: "비활동" };
  }

  const seoulTime = getSeoulTime(now);
  const isWeekend = seoulTime.day === "Sat" || seoulTime.day === "Sun";
  const hours = isWeekend ? lineup.weekendHours : lineup.weekdayHours;
  const available = isAvailableInRange(hours, seoulTime.minutes);

  return {
    available,
    label: available ? "활동 중" : "비활동",
  };
}
