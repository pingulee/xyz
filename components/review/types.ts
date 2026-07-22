import type { TierRecord } from "@/lib/reviews";

export type ReviewReply = {
  id: string;
  lineupId: string;
  boosterName: string;
  content: string;
  tierRecords: TierRecord[];
  createdAt: string;
};

export type Review = {
  id: string;
  name: string;
  service: string;
  lineupId?: string;
  lineupName?: string;
  rating: number;
  content: string;
  createdAt: string;
  viewCount: number;
  reply?: ReviewReply;
};

export type ReviewsResponse = {
  reviews: Review[];
  message?: string;
};

export type CreateReviewResponse = {
  review: Review;
  message?: string;
};

export type DeleteForm = {
  password: string;
};

export type EditForm = {
  password: string;
  service: string;
  rating: number;
  content: string;
  createdAt: string;
};
