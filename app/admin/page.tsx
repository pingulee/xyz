import type { Metadata } from "next";
import { cookies } from "next/headers";
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

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? "";

  if (validateSession(token)) {
    redirect("/admin/lineups");
  }

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <AdminLoginForm />
        </Reveal>
      </Container>
    </section>
  );
}
