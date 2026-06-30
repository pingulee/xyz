import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import ReviewDetailView from "@/components/ReviewDetailView";
import { getLineups } from "@/lib/lineups";
import { incrementReviewView } from "@/lib/reviews";
import { KNIGHT_SESSION_COOKIE, validateKnightSession } from "@/lib/knightSession";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `후기 #${id}`,
    alternates: { canonical: `/reviews/${id}` },
  };
}

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const reviewId = Number(id);

  if (!Number.isInteger(reviewId) || reviewId < 1) {
    notFound();
  }

  const [review, lineups] = await Promise.all([
    incrementReviewView(reviewId),
    getLineups(true),
  ]);

  if (!review) {
    notFound();
  }

  const cookieStore = await cookies();
  const knightToken = cookieStore.get(KNIGHT_SESSION_COOKIE)?.value ?? "";
  const knightLineupId = validateKnightSession(knightToken);
  const replyLineupId = review.reply?.lineupId ?? review.lineupId ?? "";
  const lineup = lineups.find((item) => item.id === replyLineupId);
  const knightName =
    lineup?.name ??
    (knightLineupId
      ? lineups.find((item) => item.id === String(knightLineupId))?.name
      : "") ??
    "";

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <div className="mb-8 flex items-center gap-3 text-sm text-zinc-500">
            <Link href="/reviews" className="transition hover:text-gold">
              후기 게시판
            </Link>
            <span>/</span>
            <span className="text-zinc-300">#{review.id}</span>
          </div>
        </Reveal>
        <Reveal>
          <ReviewDetailView
            initialReview={review}
            knightLineupId={knightLineupId}
            knightName={knightName}
            knightImage={lineup?.image ?? ""}
          />
        </Reveal>
      </Container>
    </section>
  );
}
