import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Clock, Medal, Shield } from "lucide-react";
import Container from "@/components/layout/Container";
import AdminBoosterBoard from "@/components/booster/AdminBoosterBoard";
import BoosterCard from "@/components/booster/BoosterCard";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import { getBoosterList } from "@/lib/booster";
import { validateSession, SESSION_COOKIE } from "@/lib/adminSession";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const description =
  "XYZ 검증된 상위 티어 롤 대리·롤 듀오 기사진을 소개합니다. 기사별 티어, 모스트 챔피언, 티어별 승률, 최근 전적을 직접 확인하고 원하는 기사를 선택하세요.";

export const metadata: Metadata = {
  title: "롤 대리 기사 소개 | 티어·승률·전적 공개",
  description,
  keywords: [
    "롤 대리 기사",
    "롤 듀오 기사",
    "롤 부스터",
    "챌린저 대리",
    "상위 티어 기사",
    "XYZ 기사",
  ],
  alternates: { canonical: "/booster" },
  openGraph: {
    title: "롤 대리 기사 소개 | XYZ",
    description,
    url: "/booster",
    type: "website",
    siteName: site.brand,
    images: [{ url: site.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "롤 대리 기사 소개 | XYZ",
    description,
    images: [site.ogImage],
  },
};

export default async function BoosterPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? "";
  const isAdmin = validateSession(token);

  const boosterList = await getBoosterList(isAdmin ? false : true, !isAdmin);

  if (isAdmin) {
    return (
      <section className="py-20">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="booster"
              title="기사 소개"
              desc="검증된 상위 티어 기사진이 직접 진행합니다."
              as="h1"
            />
          </Reveal>
          <Reveal>
            <AdminBoosterBoard initialBoosterList={boosterList} />
          </Reveal>
        </Container>
      </section>
    );
  }

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "XYZ 롤 대리 기사 소개",
    itemListElement: boosterList.map((booster, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: booster.name,
    })),
  };

  return (
    <section className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="booster"
            title="기사 소개"
            desc="검증된 상위 티어 기사진이 직접 진행합니다."
            as="h1"
          />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {boosterList.map((booster, i) => (
            <Reveal key={booster.name} delay={i * 0.04}>
              <BoosterCard booster={booster} placement={i + 1} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: <Shield size={22} />,
                label: "티어 인증",
                desc: "모든 기사는 현 시즌 티어 인증 후 배정됩니다.",
              },
              {
                icon: <Medal size={22} />,
                label: "전적 검토",
                desc: "최근 솔랭 전적 및 챔피언 숙련도를 검토합니다.",
              },
              {
                icon: <Clock size={22} />,
                label: "시간 배정",
                desc: "요청 일정에 맞는 기사를 우선 배정합니다.",
              },
            ].map(({ icon, label, desc }) => (
              <div
                key={label}
                className="rounded-3xl border border-gold/15 bg-white/3.5 p-6"
              >
                <div className="text-gold">{icon}</div>
                <b className="mt-4 block text-white">{label}</b>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
