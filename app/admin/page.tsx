import type { Metadata } from "next";
import { headers } from "next/headers";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
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

    if (
      url.host !== host ||
      path.startsWith("/admin") ||
      path.startsWith("/admax")
    ) {
      return "/";
    }

    return path;
  } catch {
    return "/";
  }
}

export default async function AdminPage() {
  const headerStore = await headers();
  const returnPath = getReturnPath(
    headerStore.get("referer") ?? "",
    headerStore.get("host") ?? "",
  );

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
