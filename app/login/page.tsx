import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/session";
import { getSafeReturnPath } from "@/lib/returnPath";
import LoginForm from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "로그인",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const store = await cookies();
  const session = validateSessionToken(store.get(SESSION_COOKIE)?.value ?? "");
  if (session) {
    redirect(
      session.role === "admin"
        ? "/booster"
        : session.role === "booster"
          ? "/review"
          : "/mypage",
    );
  }

  const headerStore = await headers();
  const returnPath = getSafeReturnPath(
    headerStore.get("referer") ?? "",
    headerStore.get("host") ?? "",
  );

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <LoginForm fallbackFrom={returnPath} />
        </Reveal>
      </Container>
    </section>
  );
}
