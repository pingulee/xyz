export const PAGE_BLOCK = 10;

export function getPageItems(
  currentPage: number,
  totalPages: number,
  block: number = PAGE_BLOCK,
) {
  // 네이버 카페식: block개 단위 블록으로 번호 노출(생략 없음). 블록 정렬.
  const items: Array<number | "..."> = [];
  if (totalPages <= 0) return items;

  const blockStart = Math.floor((currentPage - 1) / block) * block + 1;
  const blockEnd = Math.min(totalPages, blockStart + block - 1);

  for (let page = blockStart; page <= blockEnd; page += 1) {
    items.push(page);
  }

  return items;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
