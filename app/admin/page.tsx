import type { Metadata } from "next";
import { headers } from "next/headers";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import { getSafeReturnPath } from "@/lib/returnPath";
import AdminLoginForm from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const headerStore = await headers();
  const returnPath = getSafeReturnPath(
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
