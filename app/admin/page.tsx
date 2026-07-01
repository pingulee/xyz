import type { Metadata } from "next";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { validateSession, SESSION_COOKIE } from "@/lib/adminSession";
import AdminLoginForm from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

function getReturnPath(referer: string, host: string) {
  if (!referer) return "/";

  try {
    const url = new URL(referer);
    const path = `${url.pathname}${url.search}${url.hash}`;

    if (url.host !== host || path.startsWith("/admin")) {
      return "/";
    }

    return path;
  } catch {
    return "/";
  }
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? "";
  const returnPath = getReturnPath(
    headerStore.get("referer") ?? "",
    headerStore.get("host") ?? "",
  );

  if (validateSession(token)) {
    cookieStore.delete(SESSION_COOKIE);
    redirect(returnPath);
  }

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <AdminLoginForm fallbackFrom={returnPath} />
        </Reveal>
      </Container>
    </section>
  );
}
