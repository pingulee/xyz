import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import { serializeJsonLd } from "@/lib/jsonld";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "결제 방법 | 알리페이 QR 카카오페이·네이버페이",
  description:
    "롤대리.xyz 결제 방법을 확인하세요. 상담에서 받은 알리페이플러스 QR을 카카오페이 또는 네이버페이로 촬영해 결제하는 순서와 주의사항을 안내합니다.",
  alternates: { canonical: "/payment" },
  openGraph: {
    title: "알리페이 QR 결제 방법 | 롤대리.xyz",
    description:
      "카카오페이·네이버페이 앱으로 Alipay+ QR을 촬영하는 결제 절차를 단계별로 안내합니다.",
    url: "/payment",
    siteName: site.name,
    images: [site.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "알리페이 QR 결제 방법 | 롤대리.xyz",
    description: "카카오페이·네이버페이 QR 결제 절차와 주의사항",
    images: [site.ogImage],
  },
};

const commonSteps = [
  {
    title: "금액과 최신 QR 확인",
    description:
      "카카오톡 상담에서 최종 금액을 확인하고 해당 주문용 Alipay+ QR을 전달받습니다.",
    icon: MessageCircle,
  },
  {
    title: "QR을 다른 화면에 열기",
    description:
      "PC 또는 다른 휴대폰에 QR 이미지를 크게 띄웁니다. 같은 휴대폰이라면 앱의 앨범 불러오기를 이용하세요.",
    icon: QrCode,
  },
  {
    title: "결제 앱으로 촬영",
    description:
      "카카오페이 또는 네이버페이의 해외 QR 결제 화면에서 QR 촬영을 선택합니다.",
    icon: Camera,
  },
  {
    title: "금액 확인 후 승인",
    description:
      "앱에 표시되는 결제 금액과 수취 정보를 확인한 뒤 본인이 직접 결제를 승인합니다.",
    icon: ShieldCheck,
  },
  {
    title: "완료 화면 전달",
    description:
      "결제 완료 화면을 캡처해 상담원에게 보내면 확인 후 작업이 시작됩니다.",
    icon: CheckCircle2,
  },
];

const paymentMethods = [
  {
    name: "카카오페이",
    label: "Kakao Pay",
    accent: "bg-[#FEE500] text-black",
    image: "/images/payment/kakaopay-alipay-qr.webp",
    alt: "카카오페이 앱으로 샘플 Alipay+ QR을 촬영하는 결제 방법 예시",
    steps: [
      "카카오페이 앱을 열고 하단의 ‘결제하기’를 누릅니다.",
      "오른쪽 위 QR 촬영 버튼을 누르거나 화면을 아래로 쓸어 카메라를 엽니다.",
      "상담에서 받은 Alipay+ QR을 촬영하고, 필요하면 안내된 금액을 입력합니다.",
      "표시된 금액과 결제 정보를 확인한 뒤 본인이 승인합니다.",
    ],
    source: "https://contents.kakaopay.com/contents/1040",
    sourceLabel: "카카오페이 공식 사용법",
  },
  {
    name: "네이버페이",
    label: "Npay",
    accent: "bg-[#03C75A] text-white",
    image: "/images/payment/naverpay-alipay-qr.webp",
    alt: "네이버페이 앱으로 샘플 Alipay+ QR을 촬영하는 결제 방법 예시",
    steps: [
      "Npay 앱 또는 네이버 앱에서 현장결제 화면을 엽니다.",
      "해외 결제 이용 동의 후 결제망에서 Alipay+를 선택합니다.",
      "QR 촬영을 선택하고 상담에서 받은 QR을 스캔합니다.",
      "금액과 결제 정보를 확인한 뒤 네이버페이 비밀번호로 승인합니다.",
    ],
    source: "https://story.pay.naver.com/content/2443",
    sourceLabel: "네이버페이 공식 사용법",
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "알리페이 QR을 카카오페이·네이버페이로 결제하는 방법",
  description:
    "상담에서 전달받은 Alipay+ QR을 카카오페이 또는 네이버페이 앱으로 촬영해 결제하는 절차입니다.",
  totalTime: "PT5M",
  step: commonSteps.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: step.title,
    text: step.description,
    url: `${site.url}/payment#step-${index + 1}`,
  })),
};

export default function PaymentPage() {
  return (
    <main className="min-h-screen bg-void">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(howToJsonLd) }}
      />

      <section className="relative overflow-hidden border-b border-gold/10 pb-20 pt-36 sm:pb-24 sm:pt-44">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(212,168,76,0.16),transparent_32%),radial-gradient(circle_at_86%_72%,rgba(34,197,94,0.08),transparent_26%)]" />
        <Container className="relative">
          <Reveal>
            <span className="text-xs font-black uppercase tracking-[0.28em] text-gold">
              Alipay+ QR Payment
            </span>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
              QR을 촬영하면,
              <br />카카오페이·네이버페이로 결제
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
              상담에서 전달받은 Alipay+ QR을 평소 사용하는 결제 앱으로
              촬영하세요. 결제 전 금액과 수취 정보를 확인하면 됩니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={site.kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 font-black text-black transition hover:brightness-110"
              >
                결제 QR 요청하기 <ArrowRight size={18} />
              </a>
              <a
                href="#methods"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 font-bold text-white transition hover:border-gold/40 hover:text-gold"
              >
                앱별 방법 보기
              </a>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="5 steps"
              title="결제는 이렇게 진행됩니다"
              desc="상담에서 금액을 확정한 뒤 고객님이 직접 앱에서 승인하는 방식입니다. 보통 5분 이내에 완료할 수 있습니다."
            />
          </Reveal>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {commonSteps.map(({ title, description, icon: Icon }, index) => (
              <Reveal key={title} delay={index * 0.06} className="h-full">
                <li
                  id={`step-${index + 1}`}
                  className="h-full scroll-mt-28 rounded-3xl border border-gold/12 bg-white/3 p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold/10 text-gold">
                      <Icon size={21} />
                    </span>
                    <span className="text-xs font-black tracking-widest text-zinc-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="mt-6 text-lg font-black text-white">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section id="methods" className="scroll-mt-24 border-y border-gold/10 bg-black/25 py-20 sm:py-24">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="app guide"
              title="사용할 앱을 선택하세요"
              desc="아래 이미지는 이해를 돕기 위한 예시입니다. 메뉴명과 화면 구성은 앱 버전 및 결제 환경에 따라 달라질 수 있습니다."
            />
          </Reveal>
          <div className="mt-12 grid gap-7 xl:grid-cols-2">
            {paymentMethods.map((method, methodIndex) => (
              <Reveal key={method.name} delay={methodIndex * 0.08} className="h-full">
                <article className="h-full overflow-hidden rounded-[32px] border border-white/10 bg-[#0b0a08]">
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={method.image}
                      alt={method.alt}
                      fill
                      sizes="(max-width: 1279px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b0a08] to-transparent" />
                    <span className={`absolute left-5 top-5 rounded-full px-4 py-2 text-xs font-black ${method.accent}`}>
                      {method.label}
                    </span>
                    <span className="absolute bottom-5 right-5 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-[11px] font-bold text-zinc-300 backdrop-blur">
                      결제 화면 예시
                    </span>
                  </div>
                  <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-black text-white">
                      {method.name}로 결제하기
                    </h2>
                    <ol className="mt-6 space-y-4">
                      {method.steps.map((step, index) => (
                        <li key={step} className="flex gap-3 text-sm leading-6 text-zinc-300">
                          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/12 text-[10px] font-black text-gold">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <a
                      href={method.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-gold hover:text-white"
                    >
                      {method.sourceLabel} <ExternalLink size={15} />
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <Reveal>
            <div className="grid gap-8 rounded-[32px] border border-amber-400/20 bg-amber-400/6 p-7 sm:p-10 lg:grid-cols-[auto_1fr]">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-300/12 text-amber-300">
                <CircleAlert size={28} />
              </span>
              <div>
                <h2 className="text-2xl font-black text-white">결제 전 꼭 확인해 주세요</h2>
                <ul className="mt-5 grid gap-3 text-sm leading-7 text-zinc-300 md:grid-cols-2">
                  <li>• 사이트 이미지 속 QR은 설명용이며 실제 결제가 되지 않습니다.</li>
                  <li>• 반드시 상담에서 해당 주문용 최신 QR을 전달받으세요.</li>
                  <li>• 승인 전 표시 금액과 수취 정보를 다시 확인하세요.</li>
                  <li>• 본인의 결제 바코드·QR, 비밀번호, 인증번호는 보내지 마세요.</li>
                  <li>• 결제 오류가 나면 반복 승인하지 말고 화면을 캡처해 문의하세요.</li>
                  <li>• 앱 정책이나 지원 환경에 따라 결제 가능 여부가 달라질 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[36px] border border-gold/25 bg-gold-gradient p-8 text-black sm:p-12">
              <Smartphone className="absolute right-8 top-8 opacity-20" size={110} />
              <h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
                금액 확인 후 최신 QR을 요청하세요
              </h2>
              <p className="mt-4 max-w-xl font-semibold leading-7 text-black/70">
                현재 티어와 원하는 서비스를 알려주시면 견적과 결제 순서를 함께 안내합니다.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={site.kakaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3.5 font-black text-white"
                >
                  카카오톡 상담 <MessageCircle size={17} />
                </a>
                <Link
                  href="/#price"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-black/20 px-6 py-3 font-black"
                >
                  예상 견적 먼저 보기
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
