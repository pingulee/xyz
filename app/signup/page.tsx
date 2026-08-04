import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/session";
import SignupForm from "@/components/auth/SignupForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "회원가입",
  robots: { index: false, follow: false },
};

export default async function SignupPage() {
  const store = await cookies();
  if (validateSessionToken(store.get(SESSION_COOKIE)?.value ?? "")) {
    redirect("/mypage");
  }

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SignupForm />
        </Reveal>
      </Container>
    </section>
  );
}
