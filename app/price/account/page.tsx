import type { Metadata } from "next";
import ServiceDetail from "@/components/ServiceDetail";

export const metadata: Metadata = {
  title: "롤 계정 가격",
  description: "xyz 롤 계정 상담 및 가격 안내입니다.",
  alternates: { canonical: "/price/account" },
};

export default function AccountPage() {
  return (
    <ServiceDetail
      eyebrow="account"
      title="롤 계정 가격"
      desc="원하는 조건과 예산에 맞춰 맞춤형 계정 상담을 진행합니다."
      featureTitle="계정 상담 항목"
      points={[
        "티어/챔피언/스킨 조건 상담",
        "예산별 맞춤 안내",
        "구매 전 확인 항목 안내",
        "빠른 상담 진행",
      ]}
      cta="계정 문의하기"
    />
  );
}
