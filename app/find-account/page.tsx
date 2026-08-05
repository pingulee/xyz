import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import FindAccountForm from "@/components/auth/FindAccountForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "아이디/비밀번호 찾기",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function FindAccountPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const initialTab = tab === "pw" ? "pw" : "id";

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <FindAccountForm initialTab={initialTab} />
        </Reveal>
      </Container>
    </section>
  );
}
