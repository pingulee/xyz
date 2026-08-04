import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import AdminBoosterBoard from "@/components/booster/AdminBoosterBoard";
import { getBoosterList } from "@/lib/booster";
import { listSignupCodes } from "@/lib/signupCodes";
import { getSessionFromCookieHeader } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

// 관리자 전용 대시보드. role=admin이 아니면 접근 불가(로그인으로 리다이렉트).
export default async function AdminPage() {
  const h = await headers();
  const session = getSessionFromCookieHeader(h.get("cookie") ?? "");
  if (session?.role !== "admin") {
    redirect("/login?from=/admin");
  }

  const [boosterList, codes] = await Promise.all([
    getBoosterList(false),
    listSignupCodes(),
  ]);

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="admin"
            title="관리자"
            desc="기사 관리와 가입 코드를 관리합니다."
            as="h1"
          />
        </Reveal>
        <Reveal>
          <AdminBoosterBoard initialBoosterList={boosterList} initialCodes={codes} />
        </Reveal>
      </Container>
    </section>
  );
}
