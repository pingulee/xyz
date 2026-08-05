import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import FindUsernameForm from "@/components/auth/FindUsernameForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "아이디 찾기",
  robots: { index: false, follow: false },
};

export default function FindUsernamePage() {
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <FindUsernameForm />
        </Reveal>
      </Container>
    </section>
  );
}
