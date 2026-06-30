import type { Metadata } from "next";
import Container from "@/components/Container";
import FaqItem from "@/components/FaqItem";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import ServiceDetail from "@/components/ServiceDetail";

export const metadata: Metadata = {
  title: "롤 대리 가격",
  description: "xyz 롤 대리 가격과 진행 방식 안내입니다.",
  alternates: { canonical: "/price/boosting" },
};

const faqs = [
  [
    "진행 방식이 어떻게 되나요?",
    "상담 후 현재 티어와 목표 티어를 확인하고 적합한 기사를 배정합니다. 결제 확인 후 즉시 작업을 시작합니다.",
  ],
  [
    "계정 정보는 안전한가요?",
    "기사는 검증된 인원으로만 구성되며, 작업 외 계정 접근은 일절 없습니다. 작업 완료 후 비밀번호 변경을 권장합니다.",
  ],
  [
    "챔피언이나 라인을 지정할 수 있나요?",
    "네, 가능합니다. 상담 시 원하는 챔피언·포지션·플레이 스타일을 말씀해 주시면 최대한 반영합니다.",
  ],
  [
    "승률 보장이 안 지켜지면 어떻게 되나요?",
    "10시간 이상 진행 시 승률 미달 구간은 추가 진행으로 보완해 드립니다. 자세한 내용은 상담 시 안내합니다.",
  ],
  [
    "진행 중 현황을 확인할 수 있나요?",
    "카카오톡 채널을 통해 실시간으로 진행 상황을 문의하실 수 있습니다.",
  ],
  [
    "환불이 가능한가요?",
    "미진행 구간에 대해서는 환불이 가능합니다. 진행 중 취소 시 잔여 시간 기준으로 정산합니다.",
  ],
];

export default function BoostingPage() {
  return (
    <>
      <ServiceDetail
        eyebrow="boosting"
        title="롤 대리"
        desc="목표 티어까지 안정적인 진행을 원하는 고객을 위한 서비스입니다."
        featureTitle="프리미엄 부가 서비스"
        points={[
          "기사님 지정",
          "라인 및 챔피언 지정",
          "스펠 및 아이템 위치 지정",
          "디스코드 화면 공유",
        ]}
        cta="견적 문의하기"
        pointIcon="plus"
        showPriceTable
      />

      <section className="pb-20">
        <Container>
          <Reveal>
            <SectionTitle eyebrow="faq" title="자주 묻는 질문" />
          </Reveal>
          <div className="mx-auto max-w-4xl space-y-4">
            {faqs.map(([q, a]) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
