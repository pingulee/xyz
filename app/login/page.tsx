import type { Metadata } from "next";
import Link from "next/link";
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
          <div className="mx-auto mt-5 flex max-w-md justify-center gap-4 text-sm text-zinc-500">
            <Link href="/find-username" className="font-bold text-gold hover:underline">
              아이디 찾기
            </Link>
            <span className="text-zinc-700">·</span>
            <Link href="/reset-password" className="font-bold text-gold hover:underline">
              비밀번호 찾기
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
