export type Lineup = {
  id: string;
  name: string;
  positions: string[];
  rank: string;
  tier: string;
  description: string;
  weekdayHours: string;
  weekendHours: string;
  champions: string[];
  services: string[];
  nationality: number;
  image: string | null;
  sortOrder: number;
  active: boolean;
  averageRating?: number | null;
  reviewCount?: number;
};

export function getLineupSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getLineupPath(lineup: Pick<Lineup, "name">): string {
  return `/lineup/${getLineupSlug(lineup.name)}`;
}
