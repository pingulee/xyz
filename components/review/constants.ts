export const REVIEWS_PER_PAGE = 10;
export const REVIEW_NAME_MAX_LENGTH = 7;
export const REVIEW_PASSWORD_MIN_LENGTH = 4;
export const REVIEW_CONTENT_MIN_LENGTH = 10;
export const REVIEW_CONTENT_MAX_LENGTH = 100;
export const REPLY_CONTENT_MIN_LENGTH = 10;

export const blankForm = {
  name: "",
  password: "",
  service: "",
  lineupId: "",
  lineupName: "",
  rating: 5,
  content: "",
};

export const blankDeleteForm = {
  password: "",
};

export const blankEditForm = {
  password: "",
  service: "롤 대리",
  rating: 5,
  content: "",
  createdAt: "",
};

export const SERVICE_LABEL: Record<string, string> = {
  대리: "롤 대리",
  듀오: "롤 듀오",
};
