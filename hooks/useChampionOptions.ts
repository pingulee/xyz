"use client";

import { useEffect, useState } from "react";

export type ChampionOption = {
  id: string;
  key: string;
  name: string;
  version: string;
  /** 서버가 환경에 맞게 만든 이미지 URL (/upload/champion 또는 /images/champion). */
  imageUrl: string;
};

export function useChampionOptions() {
  const [champions, setChampions] = useState<ChampionOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/champions")
      .then((response) => response.json())
      .then((data: { champions?: ChampionOption[] }) => {
        if (active) setChampions(data.champions ?? []);
      })
      .catch(() => {
        if (active) setChampions([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { champions, loading };
}
