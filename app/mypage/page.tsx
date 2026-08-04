import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/components/layout/Container";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/session";

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

  // Phase 3에서 내가 로그인 상태로 쓴 후기 목록(수정/삭제)을 채운다.
  return (
    <section className="py-20">
      <Container>
        <h1 className="text-2xl font-black text-white">마이페이지</h1>
        <p className="mt-4 text-sm text-zinc-500">
          내가 작성한 후기를 여기서 관리할 수 있습니다.
        </p>
      </Container>
    </section>
  );
}
