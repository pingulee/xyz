import type { Lineup } from "@/lib/lineup-model";

export function nationalityFlag(code: number) {
  return code === 2 ? "/images/flags/cn.svg" : "/images/flags/kr.svg";
}

export function nationalityLabel(code: number) {
  return code === 2 ? "중국" : "대한민국";
}

export const POSITIONS = ["탑", "정글", "미드", "바텀", "서포터"] as const;
export const NATIONALITIES = [
  { value: "1", label: "대한민국" },
  { value: "2", label: "중국" },
] as const;

export const blankForm = {
  name: "",
  positionSet: new Set<string>(),
  rank: "",
  tier: "",
  nationality: "",
  description: "",
  weekdayStart: "00",
  weekdayEnd: "23",
  weekdayAll: false,
  weekendStart: "00",
  weekendEnd: "23",
  weekendAll: false,
  serviceBoost: false,
  serviceDuo: false,
  imageUrl: null as string | null,
  active: true,
  boosterPassword: "",
};

export type FormState = typeof blankForm;
export type LineupResponse = { lineup: Lineup; message?: string };
