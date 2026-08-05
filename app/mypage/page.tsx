import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, UserRound } from "lucide-react";
import Container from "@/components/layout/Container";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/session";
import { resolveBoosterId } from "@/lib/authz";
import { getReviewsByUser } from "@/lib/review";
import { getBoosterById } from "@/lib/booster";
import { getBoosterPath } from "@/lib/booster-model";
import { getAccountById, listNicknames } from "@/lib/users";
import MyReviewList from "@/components/auth/MyReviewList";
import MyAccountSettings from "@/components/auth/MyAccountSettings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "마이페이지",
  robots: { index: false, follow: false },
};

export default async function MyPage() {
  const store = await cookies();
  const session = validateSessionToken(store.get(SESSION_COOKIE)?.value ?? "");
  if (!session) {
    redirect("/login?from=/mypage");
  }
  // 관리자는 전용 대시보드로.
  if (session.role === "admin") {
    redirect("/admin");
  }

  // ── 기사 마이페이지 ──
  if (session.role === "booster") {
    const boosterId = await resolveBoosterId(session);
    const booster = boosterId ? await getBoosterById(boosterId) : null;

    return (
      <section className="py-20">
        <Container>
          <h1 className="text-2xl font-black text-white">기사 마이페이지</h1>
          {booster ? (
            <div className="mt-6 grid gap-4">
              <div className="card-premium rounded-3xl p-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">
                  내 프로필
                </p>
                <p className="mt-2 text-xl font-black text-white">{booster.name}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {booster.rank} · {booster.active ? "공개 중" : "비공개"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={getBoosterPath(booster)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white"
                  >
                    <UserRound size={15} />내 공개 프로필 보기
                  </Link>
                  <Link
                    href="/review"
                    className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-black text-black transition hover:brightness-110"
                  >
                    <MessageSquare size={15} />후기 답변 관리
                  </Link>
                </div>
              </div>
              <p className="text-xs leading-6 text-zinc-500">
                프로필 정보(티어·소개·이미지 등) 변경은 관리자에게 문의해주세요.
                고객 후기에 대한 답변은 후기 페이지에서 직접 작성·수정할 수 있습니다.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              연결된 기사 프로필이 없습니다. 관리자에게 문의해주세요.
            </p>
          )}
        </Container>
      </section>
    );
  }

  // ── 고객 마이페이지 ──
  const [reviews, account, nicknames] = await Promise.all([
    getReviewsByUser(session.userId),
    getAccountById(session.userId),
    listNicknames(session.userId),
  ]);

  return (
    <section className="py-20">
      <Container>
        <h1 className="text-2xl font-black text-white">마이페이지</h1>
        <p className="mt-3 text-sm text-zinc-500">
          계정 정보와 작성한 후기를 관리할 수 있습니다.
        </p>

        <MyAccountSettings
          initialEmail={account?.email ?? null}
          initialNicknames={nicknames}
        />

        <div className="mt-10">
          <h2 className="text-lg font-black text-white">내 후기</h2>
          <MyReviewList initial={reviews} />
        </div>
      </Container>
    </section>
  );
}
