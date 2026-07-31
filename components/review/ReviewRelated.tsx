import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { getBoosterPath } from "@/lib/booster-model";
import type { Booster } from "@/lib/booster-model";
import type { Review } from "@/components/review/types";
import { services } from "@/lib/site";
import { formatDate } from "@/components/review/helpers";

/**
 * 후기 상세 하단의 맥락·관련 링크 블록.
 *
 * 후기 본문은 100자 상한이라 상세 페이지의 고유 텍스트가 거의 없고(thin content),
 * 링크도 목록과 이전/다음뿐이라 1,600여 개 후기가 사실상 고립돼 있었다.
 * 후기마다 값이 달라지는 정보(담당 기사 프로필·전적, 서비스, 다른 후기 발췌)로
 * 채워 텍스트 분량과 크롤 경로를 함께 확보한다. 모든 페이지에 같은 문구가 깔리면
 * 오히려 중복 콘텐츠가 되므로 고정 문구는 마지막 링크 줄로만 제한한다.
 */

type Props = {
  review: Review;
  booster: Booster | null;
  relatedReviews: Review[];
};

/** 후기에 저장된 서비스명("롤 대리" 등)을 서비스 상세 페이지로 연결한다. */
function findService(serviceName: string) {
  if (!serviceName) return null;
  return (
    services.find((item) => item.title === serviceName) ??
    services.find(
      (item) =>
        serviceName.includes(item.title) || item.title.includes(serviceName),
    ) ??
    null
  );
}

function joinKorean(items: string[], max = 4) {
  const picked = items.filter(Boolean).slice(0, max);
  return picked.length ? picked.join(", ") : "";
}

export default function ReviewRelated({
  review,
  booster,
  relatedReviews,
}: Props) {
  const service = findService(review.service);
  const positions = booster ? joinKorean(booster.positions) : "";
  const champions = booster ? joinKorean(booster.champions) : "";
  const wins = booster?.wins ?? 0;
  const losses = booster?.losses ?? 0;
  const hasRecord = wins + losses > 0;
  const winRate = hasRecord ? Math.round((wins / (wins + losses)) * 100) : 0;

  return (
    <div className="mt-12 space-y-8">
      {/* 작업 정보 — 후기마다 값이 달라지는 고유 텍스트 */}
      <section className="rounded-4xl border border-gold/12 bg-white/3.5 p-6 sm:p-8">
        <h2 className="text-xl font-black text-white">이 후기의 작업 정보</h2>
        <p className="mt-4 leading-7 text-zinc-300">
          {review.name}님이 {formatDate(review.createdAt)}에 남긴{" "}
          {service ? (
            <Link
              href={service.href}
              className="font-bold text-gold underline-offset-4 hover:underline"
            >
              {review.service}
            </Link>
          ) : (
            <span className="font-bold text-gold">{review.service}</span>
          )}{" "}
          이용 후기입니다. 별점은 5점 만점에 {review.rating}점입니다.
          {booster ? (
            <>
              {" "}
              담당 기사는{" "}
              <Link
                href={getBoosterPath(booster)}
                className="font-bold text-gold underline-offset-4 hover:underline"
              >
                {booster.name}
              </Link>{" "}
              기사이며 현재 {booster.rank} 구간입니다.
              {positions && ` 주 포지션은 ${positions}이고,`}
              {champions && ` 주로 ${champions} 챔피언을 사용합니다.`}
              {hasRecord &&
                ` 기록된 작업 전적은 ${wins}승 ${losses}패(승률 ${winRate}%)입니다.`}
            </>
          ) : null}
        </p>

        {booster ? (
          <Link
            href={getBoosterPath(booster)}
            prefetch={false}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/25 px-5 py-2.5 text-sm font-black text-white transition hover:border-gold/60 hover:text-gold"
          >
            {booster.name} 기사 프로필 보기
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        ) : null}
      </section>

      {/* 관련 후기 — 후기 간 크롤 경로 */}
      {relatedReviews.length > 0 ? (
        <section className="rounded-4xl border border-white/8 bg-white/2 p-6 sm:p-8">
          <h2 className="text-xl font-black text-white">
            {booster ? `${booster.name} 기사의 다른 후기` : "비슷한 작업 후기"}
          </h2>
          <ul className="mt-5 divide-y divide-white/6">
            {relatedReviews.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/review/${item.id}`}
                  prefetch={false}
                  className="group flex flex-col gap-1.5 py-4 transition hover:opacity-80"
                >
                  <span className="flex items-center gap-2 text-xs font-black text-gold">
                    <Star size={12} fill="currentColor" aria-hidden="true" />
                    {item.rating}점 · {item.service}
                  </span>
                  <span className="line-clamp-2 text-sm leading-6 text-zinc-200">
                    {item.content}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {item.name} · {formatDate(item.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 고정 링크 줄. 모든 후기에 동일하게 깔리므로 최소 분량만 유지한다. */}
      <nav
        aria-label="서비스 바로가기"
        className="flex flex-wrap justify-center gap-2.5"
      >
        {services.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-gold"
          >
            {item.title}
          </Link>
        ))}
        <Link
          href="/booster"
          prefetch={false}
          className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-gold"
        >
          기사 소개
        </Link>
        <Link
          href="/review"
          prefetch={false}
          className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-gold"
        >
          작업 후기 전체
        </Link>
      </nav>
    </div>
  );
}
