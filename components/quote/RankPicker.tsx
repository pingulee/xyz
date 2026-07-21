"use client";

import Image from "next/image";
import { Ban } from "lucide-react";
import { TIERS } from "@/components/quote/constants";

export default function RankPicker({
  title,
  hint,
  tierIndex,
  division,
  onTierChange,
  onDivisionChange,
  hideDivision = false,
  minTierIndex = 0,
  maxTierIndex = TIERS.length - 1,
  splitDiamond = false,
  splitMaster = false,
  divisionOptions,
}: {
  title: string;
  hint: string;
  tierIndex: number;
  division: number;
  onTierChange: (index: number) => void;
  onDivisionChange: (division: number) => void;
  hideDivision?: boolean;
  minTierIndex?: number;
  maxTierIndex?: number;
  splitDiamond?: boolean;
  splitMaster?: boolean;
  /** 선택 가능한 단계를 제한할 때 사용 (기본: 티어의 전체 단계) */
  divisionOptions?: number[];
}) {
  const tier = TIERS[tierIndex];
  const divisions = divisionOptions ?? tier.divisions;
  const tierChoices = TIERS.flatMap((item, index) => {
    if (splitDiamond && item.key === "diamond") {
      return [
        { item, index, label: "다이아 4~3", choiceDivision: 4 },
        { item, index, label: "다이아 2~1", choiceDivision: 2 },
        { item, index, label: "듀오 불가", choiceDivision: -1 },
      ];
    }
    if (splitMaster && item.key === "master") {
      return [0, 200, 400, 600, 800].map((start) => ({
        item,
        index,
        label: `${start}~${start + 199} LP`,
        choiceDivision: start,
      }));
    }
    return [
      { item, index, label: item.name, choiceDivision: item.divisions[0] },
    ];
  }).filter(({ index }) => index >= minTierIndex && index <= maxTierIndex);

  return (
    <div className="rounded-3xl border border-white/8 bg-black/20 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-white">{title}</h3>
          <p className="mt-1 text-xs text-zinc-500">{hint}</p>
        </div>
        <span className="rounded-full bg-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gold">
          필수 선택
        </span>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {tierChoices.map(({ item, index, label, choiceDivision }) => {
          const active =
            index === tierIndex &&
            (!splitDiamond ||
              item.key !== "diamond" ||
              (choiceDivision === -1
                ? division === -1
                : choiceDivision === 4
                  ? division >= 3
                  : division >= 0 && division <= 2)) &&
            (!splitMaster ||
              item.key !== "master" ||
              division === choiceDivision);
          return (
            <button
              key={`${item.key}-${choiceDivision}`}
              type="button"
              onClick={() => {
                onTierChange(index);
                if (splitDiamond || splitMaster)
                  onDivisionChange(choiceDivision);
              }}
              className={`group relative rounded-2xl border px-1 py-3 transition ${
                active
                  ? "border-gold/70 bg-gold/12 shadow-[0_0_22px_rgba(222,176,67,.12)]"
                  : "border-white/7 bg-white/2.5 hover:border-gold/30 hover:bg-white/5"
              }`}
            >
              {choiceDivision === -1 ? (
                <span className="mx-auto flex h-10 w-14 items-center justify-center sm:h-12">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-red-400/30 bg-red-950/85 text-red-300 shadow-lg backdrop-blur-sm">
                    <Ban size={21} strokeWidth={2.5} />
                  </span>
                </span>
              ) : (
                <Image
                  src={item.image}
                  alt=""
                  width={52}
                  height={52}
                  className={`mx-auto h-10 w-10 object-contain transition sm:h-12 sm:w-12 ${active ? "scale-110" : "opacity-70 group-hover:opacity-100"}`}
                />
              )}
              <span
                className={`mt-2 block truncate text-[10px] font-bold sm:text-[11px] ${active ? "text-gold-soft" : "text-zinc-500"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {!hideDivision && (
        <div className="mt-5">
          <p className="mb-2 text-[11px] font-bold text-zinc-500">단계</p>
          <div className="grid grid-cols-4 gap-2">
            {divisions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onDivisionChange(item)}
                className={`rounded-xl border py-2.5 text-sm font-black transition ${
                  item === division
                    ? "border-gold bg-gold text-black"
                    : "border-white/8 text-zinc-400 hover:border-gold/35"
                }`}
              >
                {tier.divisions.length === 1
                  ? "LP"
                  : ["", "I", "II", "III", "IV"][item]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
