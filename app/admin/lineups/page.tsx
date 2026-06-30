import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLineupBoard from "@/components/AdminLineupBoard";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { getLineups } from "@/lib/lineups";
import { validateSession, SESSION_COOKIE } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "기사 관리",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLineupsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? "";
  if (!validateSession(token)) redirect("/admin");

  const lineups = await getLineups(false);

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="admin"
            title="기사 관리"
            desc="관리자만 기사 라인업을 추가, 수정, 삭제할 수 있습니다."
          />
        </Reveal>
        <Reveal>
          <AdminLineupBoard initialLineups={lineups} />
        </Reveal>
      </Container>
    </section>
  );
}
