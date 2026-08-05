import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "비밀번호 재설정",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

// 이 경로는 이메일 재설정 링크(token 포함)로만 도착한다. 토큰 없이 들어오면
// 재설정 요청 탭으로 보낸다(아이디·비밀번호 찾기 통합 페이지).
export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
  if (!token) {
    redirect("/find-account?tab=pw");
  }

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <ResetPasswordForm token={token} />
        </Reveal>
      </Container>
    </section>
  );
}
