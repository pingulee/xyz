import type { Metadata } from "next";
import ServiceDetail from "@/components/ServiceDetail";

export const metadata: Metadata = {
  title: "롤 듀오 가격",
  description: "xyz 롤 듀오 가격과 진행 방식 안내입니다.",
  alternates: { canonical: "/price/duo" },
};

export default function DuoPage() {
  return (
    <ServiceDetail
      eyebrow="duo queue"
      title="롤 듀오 가격"
      desc="검증된 기사와 함께 플레이하며 승률과 안정성을 동시에 챙기는 서비스입니다."
      featureTitle="듀오 서비스 특징"
      points={[
        "기사와 함께 직접 플레이",
        "라인/챔피언 조율 가능",
        "승률 중심 안전 진행",
        "플레이 피드백 가능",
      ]}
      cta="듀오 문의하기"
    />
  );
}
