import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import {
  BOOSTER_SESSION_COOKIE,
  validateBoosterSession,
} from "@/lib/boosterSession";
import BoosterLoginForm from "./BoosterLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "로그인",
  robots: { index: false, follow: false },
};

export default async function BoosterLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(BOOSTER_SESSION_COOKIE)?.value ?? "";

  if (validateBoosterSession(token)) {
    redirect("/reviews");
  }

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <BoosterLoginForm />
        </Reveal>
      </Container>
    </section>
  );
}
