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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${y}px)`,
        transition: `opacity 0.65s cubic-bezier(0.21,0.47,0.32,0.98) ${delay}s, transform 0.65s cubic-bezier(0.21,0.47,0.32,0.98) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
