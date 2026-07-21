"use client";

import { useState } from "react";

export default function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="cursor-pointer rounded-3xl border border-gold/15 bg-white/3.5 p-6 transition hover:border-gold/25"
      onClick={() => setOpen((prev) => !prev)}
    >
      <div className="flex items-center justify-between text-lg font-black text-white">
        {q}
        <span
          className={`ml-4 shrink-0 text-gold transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </span>
      </div>
      {open && (
        <p className="mt-4 whitespace-pre-line leading-7 text-zinc-400">{a}</p>
      )}
    </div>
  );
}
