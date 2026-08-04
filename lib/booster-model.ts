export type Booster = {
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
  wins?: number;
  losses?: number;
};

export function getBoosterSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getBoosterPath(booster: Pick<Booster, "name">): string {
  return `/booster/${getBoosterSlug(booster.name)}`;
}

// 기사 프로필 입력(관리자 수정·기사 가입 공용). 검증은 validateBooster로 단일화한다.
export type BoosterProfileInput = {
  name?: string;
  positions?: string;
  rank?: string;
  tier?: string;
  description?: string;
  weekdayHours?: string;
  weekendHours?: string;
  services?: string;
  nationality?: string | number;
  image?: string | null;
};

export type ValidatedBoosterProfile = {
  name: string;
  positions: string;
  rank: string;
  tier: string;
  description: string;
  weekdayHours: string;
  weekendHours: string;
  services: string;
  nationality: number;
  image: string;
};

export const DEFAULT_PROFILE_IMAGE = "/images/profile.webp";
const BOOSTER_DESCRIPTION_MIN_LENGTH = 10;

export function isValidImageUrl(image: string | null | undefined): boolean {
  if (!image) return true;
  return (
    (image === DEFAULT_PROFILE_IMAGE || image.startsWith("/upload/booster/")) &&
    image.length <= 255
  );
}

export function validateBooster(
  payload: BoosterProfileInput,
): ValidatedBoosterProfile | { message: string } {
  const name = payload.name?.trim() ?? "";
  const positions = payload.positions?.trim() ?? "";
  const rank = payload.rank?.trim() ?? "";
  const tier = payload.tier?.trim() ?? "";
  const description = payload.description?.trim() ?? "";
  const weekdayHours = payload.weekdayHours?.trim() ?? "";
  const weekendHours = payload.weekendHours?.trim() ?? "";
  const services = payload.services?.trim() ?? "";
  const rawNationality = payload.nationality ?? 1;
  const nationality =
    rawNationality === "중국"
      ? 2
      : rawNationality === "대한민국"
        ? 1
        : Number(rawNationality);
  const image = payload.image || DEFAULT_PROFILE_IMAGE;

  if (!name || name.length > 60) return { message: "이름을 입력해주세요. (최대 60자)" };
  if (!positions) return { message: "포지션을 입력해주세요." };
  if (!rank || rank.length > 30) return { message: "랭크를 입력해주세요." };
  if (!tier) return { message: "티어 이미지를 선택해주세요." };
  if (description.length < BOOSTER_DESCRIPTION_MIN_LENGTH) {
    return { message: "소개는 10자 이상 입력해주세요." };
  }
  if (description.length > 300) return { message: "소개는 300자 이내로 입력해주세요." };
  if (!weekdayHours || weekdayHours.length > 30) return { message: "평일 시간을 입력해주세요." };
  if (!weekendHours || weekendHours.length > 30) return { message: "주말 시간을 입력해주세요." };
  if (!services) return { message: "작업 종류를 입력해주세요." };
  if (![1, 2].includes(nationality)) return { message: "국적을 다시 선택해주세요." };
  if (!isValidImageUrl(image)) return { message: "이미지 URL 형식이 올바르지 않습니다." };

  return { name, positions, rank, tier, description, weekdayHours, weekendHours, services, nationality, image };
}
