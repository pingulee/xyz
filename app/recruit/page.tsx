import type { Metadata } from "next";
import { CheckCircle2, Send } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import { site } from "@/lib/site";

const description =
  "XYZ에서 함께할 상위 티어 롤 대리·롤 듀오 기사를 모집합니다. 챌린저·그랜드마스터 실력자라면 자유로운 일정으로 활동하고 정산받으세요.";

export const metadata: Metadata = {
  // 루트 레이아웃 template이 "| XYZ"를 붙이므로 여기서 브랜드를 다시 쓰지 않는다.
  title: "롤 대리 기사 모집 | 부스터 채용 안내",
  description,
  keywords: [
    "롤 대리 기사 모집",
    "롤 부스터 모집",
    "롤 듀오 기사 모집",
    "챌린저 알바",
    "롤 대리 알바",
    "XYZ 기사 모집",
  ],
  alternates: { canonical: "/recruit" },
  openGraph: {
    title: "롤 대리 기사 모집 | XYZ",
    description,
    url: "/recruit",
    type: "website",
    siteName: site.brand,
    images: [{ url: site.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "롤 대리 기사 모집 | XYZ",
    description,
    images: [site.ogImage],
  },
};

const conditions = [
  "현 시즌 챌린저 달성",
  "그랜드마스터 이상 상시 유지 가능",
  "본인 명의 계정 인증 가능",
  "책임감 있는 진행 가능",
  "서비스 규칙 준수 가능",
  "시간 약속 준수 가능",
];

const workTerms = [
  {
    term: "계약 형태",
    detail: "프리랜서 계약으로 진행합니다. 정해진 출퇴근이 없습니다.",
  },
  {
    term: "근무 방식",
    detail: "전 과정 온라인 원격입니다. 국내 거주자를 대상으로 합니다.",
  },
  {
    term: "일정",
    detail:
      "기사 본인이 가능한 시간대를 직접 정합니다. 상시 모집이라 지원 기간 제한이 없습니다.",
  },
  {
    term: "정산",
    detail:
      "건당 또는 시간제로 정산합니다. 단가는 구간과 작업 방식에 따라 달라지며 상담에서 안내합니다.",
  },
];

// 상시 모집이라 게시일을 요청 시각으로 두면 매 배포마다 값이 바뀐다.
// 모집 조건이 실제로 달라질 때만 갱신한다.
const DATE_POSTED = "2026-08-03";

/**
 * 구글 채용정보(Google Jobs) 노출용 JobPosting.
 *
 * - baseSalary는 넣지 않는다. 건당·시급이 작업마다 달라 단일 값이나 범위를
 *   제시할 수 없다. 부정확한 급여를 넣는 것이 생략보다 나쁘다.
 * - validThrough도 넣지 않는다. 상시 모집이라 만료일이 없으며, 구글은 만료
 *   시점을 모르는 경우 이 속성을 생략하도록 안내한다.
 * - 작업이 전부 온라인이라 jobLocationType은 TELECOMMUTE로 두고, 이 경우
 *   구글이 요구하는 applicantLocationRequirements를 함께 넣는다.
 */
const jobPostingJsonLd = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: "롤 대리·롤 듀오 기사",
  description: [
    `<p>${description}</p>`,
    "<p>지원 조건</p>",
    `<ul>${conditions.map((c) => `<li>${c}</li>`).join("")}</ul>`,
    "<p>일정은 기사 본인이 조율하며, 진행한 작업 기준으로 정산합니다. 정산 단가는 구간과 작업 방식(건당·시간제)에 따라 달라집니다.</p>",
  ].join(""),
  datePosted: DATE_POSTED,
  employmentType: "CONTRACTOR",
  hiringOrganization: {
    "@type": "Organization",
    name: site.brand,
    sameAs: site.url,
    logo: `${site.url}${site.logo}`,
  },
  jobLocationType: "TELECOMMUTE",
  applicantLocationRequirements: {
    "@type": "Country",
    name: "KR",
  },
  // 지원은 카카오톡 상담으로 받는다. 사이트 내 지원 폼이 아니므로 false.
  directApply: false,
};

export default function RecruitPage() {
  return (
    <section className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="recruit"
            title="기사 모집"
            desc="실력과 책임감을 갖춘 상위 티어 기사님을 모집합니다."
            as="h1"
          />
        </Reveal>
        <Reveal>
          <div className="card-premium mx-auto max-w-5xl rounded-[38px] p-8 sm:p-10">
            <h2 className="text-3xl font-black text-white">지원 조건</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {conditions.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-3 rounded-2xl bg-white/4 p-4 text-zinc-300"
                >
                  <CheckCircle2 className="text-gold" size={20} />
                  {c}
                </div>
              ))}
            </div>
            {/* JobPosting 구조화 데이터가 명시하는 내용은 화면에도 보여야 한다.
                구조화 데이터와 가시 콘텐츠가 어긋나면 구글이 반려한다. */}
            <h2 className="mt-12 text-3xl font-black text-white">근무 조건</h2>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {workTerms.map(({ term, detail }) => (
                <div key={term} className="rounded-2xl bg-white/4 p-5">
                  <dt className="text-sm font-black text-gold">{term}</dt>
                  <dd className="mt-2 leading-7 text-zinc-300">{detail}</dd>
                </div>
              ))}
            </dl>

            <a
              href={site.kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black transition hover:brightness-110"
            >
              <Send size={18} /> 기사 지원하기
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
