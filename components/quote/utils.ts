export function rankScore(tierIndex: number, division: number) {
  return tierIndex * 4 + (4 - division);
}

export function won(value: number) {
  return (
    `${Math.round(value / 1000) * 1000}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    "원"
  );
}
