import type { TierRecord } from "@/lib/review";

export type ReviewReply = {
  id: string;
  boosterId: string;
  boosterName: string;
  content: string;
  tierRecords: TierRecord[];
  createdAt: string;
};

export type Review = {
  id: string;
  name: string;
  service: string;
  boosterId?: string;
  boosterName?: string;
  rating: number;
  content: string;
  createdAt: string;
  viewCount: number;
  reply?: ReviewReply;
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
