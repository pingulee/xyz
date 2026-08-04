import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/components/layout/Container";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/session";
import { getReviewsByUser } from "@/lib/review";
import MyReviewList from "@/components/auth/MyReviewList";

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

  // 로그인 상태로 쓴 내 후기(user_id 매칭). 고객만 user_id로 소유된다.
  const reviews =
    session.role === "customer" ? await getReviewsByUser(session.userId) : [];

  return (
    <section className="py-20">
      <Container>
        <h1 className="text-2xl font-black text-white">마이페이지</h1>
        <p className="mt-3 text-sm text-zinc-500">
          로그인 상태로 작성한 후기를 관리할 수 있습니다.
        </p>
        <MyReviewList initial={reviews} />
      </Container>
    </section>
  );
}
