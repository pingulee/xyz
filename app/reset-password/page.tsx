import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "비밀번호 찾기",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <ResetPasswordForm token={token ?? ""} />
        </Reveal>
      </Container>
    </section>
  );
}
