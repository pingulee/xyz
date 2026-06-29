import type { Metadata } from "next";
import ServiceDetail from "@/components/ServiceDetail";

export const metadata: Metadata = {
  title: "롤 대리 가격",
  description: "xyz 롤 대리 가격과 진행 방식 안내입니다.",
  alternates: { canonical: "/price/boosting" },
};

export default function BoostingPage() {
  return (
    <ServiceDetail
      eyebrow="boosting"
      title="롤 대리"
      desc="목표 티어까지 안정적인 진행을 원하는 고객을 위한 서비스입니다."
      featureTitle="서비스 특징"
      points={[
        "현재/목표 티어 기반 견적",
        "챔피언 및 라인 요청 가능",
        "진행 상황 안내",
      ]}
      cta="견적 문의하기"
      showPriceTable
    />
  );
}
