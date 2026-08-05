// 공지 날짜 표기(YYYY.MM.DD). 클라이언트 렌더 전용.
export function formatNoticeDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}
