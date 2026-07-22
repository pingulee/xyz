"use client";

import { useEffect, useRef, useState, type PropsWithChildren } from "react";

type RevealProps = PropsWithChildren<{
  delay?: number;
  y?: number;
  className?: string;
}>;

export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // 서버 렌더와 JS 비활성 환경에서는 콘텐츠를 기본 노출한다.
  // 화면 밖 요소에만 hydration 이후 reveal 효과를 점진적으로 적용한다.
  const [enhanced, setEnhanced] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (el.getBoundingClientRect().top <= window.innerHeight * 0.9) {
      setEnhanced(true);
      return;
    }

    setVisible(false);
    setEnhanced(true);

    // 모션 최소화 사용자는 globals.css의 .reveal 미디어쿼리로 즉시 표시(JS 불필요)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.22 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className ? `reveal ${className}` : "reveal"}
      style={{
        opacity: !enhanced || visible ? 1 : 0,
        transform: !enhanced || visible ? "none" : `translateY(${y}px)`,
        transition: enhanced
          ? `opacity 0.65s cubic-bezier(0.21,0.47,0.32,0.98) ${delay}s, transform 0.65s cubic-bezier(0.21,0.47,0.32,0.98) ${delay}s`
          : "none",
      }}
    >
      {children}
    </div>
  );
}
