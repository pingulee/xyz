import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { KNIGHT_SESSION_COOKIE, validateKnightSession } from "@/lib/knightSession";
import KnightLoginForm from "./KnightLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "기사 로그인",
  robots: { index: false, follow: false },
};

export default async function KnightLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(KNIGHT_SESSION_COOKIE)?.value ?? "";

  if (validateKnightSession(token)) {
    redirect("/reviews");
  }

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <KnightLoginForm />
        </Reveal>
      </Container>
    </section>
  );
}
