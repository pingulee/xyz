"use client";

import Image from "next/image";
import { EyeOff, GripVertical, Loader2, LogOut, Pencil, Trash2, X } from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lineup } from "@/lib/lineups";

const MAX_IMAGE_SIZE = 1024 * 1024 * 2;
const MAX_IMAGE_WIDTH = 1600;
const MAX_IMAGE_HEIGHT = 1600;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const TIER_OPTIONS = [
  { label: "아이언",       value: "/images/tier/1-iron.png" },
  { label: "브론즈",       value: "/images/tier/2-bronze.png" },
  { label: "실버",         value: "/images/tier/3-silver.png" },
  { label: "골드",         value: "/images/tier/4-gold.png" },
  { label: "플래티넘",     value: "/images/tier/5-platinum.png" },
  { label: "에메랄드",     value: "/images/tier/6-emerald.png" },
  { label: "다이아몬드",   value: "/images/tier/7-diamond.png" },
  { label: "마스터",       value: "/images/tier/8-master.png" },
  { label: "그랜드마스터", value: "/images/tier/9-grandmaster.png" },
  { label: "챌린저",       value: "/images/tier/10-challenger.png" },
];

const blankForm = {
  name: "",
  positions: "",
  rank: "",
  tier: "/images/tier/10-challenger.png",
  description: "",
  weekdayHours: "",
  weekendHours: "",
  champions: "",
  services: "",
  image: null as string | null,
  active: true,
};

type LineupResponse = { lineup: Lineup; message?: string };

export default function AdminLineupBoard({
  initialLineups = [],
}: {
  initialLineups?: Lineup[];
}) {
  const [lineups, setLineups] = useState(initialLineups);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const dragIndexRef = useRef<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  const set = (key: keyof typeof blankForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError("");
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("JPG, PNG, WEBP 이미지만 첨부할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("이미지는 2MB 이하만 첨부할 수 있습니다.");
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      if (img.width > MAX_IMAGE_WIDTH || img.height > MAX_IMAGE_HEIGHT) {
        setImageError(`이미지는 ${MAX_IMAGE_WIDTH}×${MAX_IMAGE_HEIGHT}px 이하만 업로드 가능합니다.`);
        URL.revokeObjectURL(img.src);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm((f) => ({ ...f, image: String(reader.result) }));
        setImageName(file.name);
        URL.revokeObjectURL(img.src);
      };
      reader.readAsDataURL(file);
    };
    img.onerror = () => { setImageError("이미지를 읽을 수 없습니다."); URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(file);
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, image: null }));
    setImageName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  const startEdit = (lineup: Lineup) => {
    setEditingId(lineup.id);
    setForm({
      name: lineup.name,
      positions: lineup.positions.join(","),
      rank: lineup.rank,
      tier: lineup.tier,
      description: lineup.description,
      weekdayHours: lineup.weekdayHours,
      weekendHours: lineup.weekendHours,
      champions: lineup.champions.join(","),
      services: lineup.services.join(","),
      image: lineup.image,
      active: lineup.active,
    });
    setImageName(lineup.image ? "현재 이미지" : "");
    setImageError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId("");
    setForm(blankForm);
    setImageName("");
    setImageError("");
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveLineup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch("/api/lineups", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId || undefined,
          ...form,
          sortOrder: editingId
            ? (lineups.find((l) => l.id === editingId)?.sortOrder ?? 0)
            : lineups.length,
        }),
      });
      const data = (await response.json()) as LineupResponse;
      if (!response.ok) throw new Error(data.message ?? "저장하지 못했습니다.");

      if (editingId) {
        setLineups((cur) => cur.map((l) => (l.id === editingId ? data.lineup : l)));
      } else {
        setLineups((cur) => [...cur, data.lineup]);
      }
      resetForm();
      setMessage("저장되었습니다.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const deleteLineup = async (lineup: Lineup) => {
    if (!confirm(`"${lineup.name}" 기사를 삭제하시겠습니까?`)) return;
    setMessage("");
    setDeletingId(lineup.id);
    try {
      const response = await fetch("/api/lineups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lineup.id }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "삭제하지 못했습니다.");
      setLineups((cur) => cur.filter((l) => l.id !== lineup.id));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "삭제하지 못했습니다.");
    } finally {
      setDeletingId("");
    }
  };

  const onDragStart = (index: number) => { dragIndexRef.current = index; };
  const onDragEnter = (index: number) => { dragOverIndexRef.current = index; };
  const onDragEnd = async () => {
    const from = dragIndexRef.current;
    const to = dragOverIndexRef.current;
    dragIndexRef.current = null;
    dragOverIndexRef.current = null;
    if (from === null || to === null || from === to) return;

    const reordered = [...lineups];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setLineups(reordered);

    setSavingOrder(true);
    try {
      await Promise.all(
        reordered.map((l, i) =>
          fetch("/api/lineups", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: l.id,
              name: l.name,
              positions: l.positions.join(","),
              rank: l.rank,
              tier: l.tier,
              description: l.description,
              weekdayHours: l.weekdayHours,
              weekendHours: l.weekendHours,
              champions: l.champions.join(","),
              services: l.services.join(","),
              image: l.image,
              sortOrder: i,
              active: l.active,
            }),
          }),
        ),
      );
    } catch {
      setMessage("정렬 저장에 실패했습니다.");
    } finally {
      setSavingOrder(false);
    }
  };

  const inputCls = "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full";
  const labelCls = "grid gap-2 text-sm font-bold text-zinc-300";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
      {/* Form */}
      <form onSubmit={saveLineup} className="card-premium rounded-[34px] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">admin only</p>
            <h2 className="mt-3 text-2xl font-black text-white">{editingId ? "기사 수정" : "기사 추가"}</h2>
          </div>
          <button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white">
            <LogOut size={16} />로그아웃
          </button>
        </div>

        <div className="mt-7 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>이름<input value={form.name} onChange={set("name")} maxLength={60} className={inputCls} placeholder="이브" /></label>
            <label className={labelCls}>랭크<input value={form.rank} onChange={set("rank")} maxLength={30} className={inputCls} placeholder="Challenger" /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>포지션 (쉼표 구분)<input value={form.positions} onChange={set("positions")} className={inputCls} placeholder="정글,탑" /></label>
            <label className={labelCls}>
              티어 이미지
              <select value={form.tier} onChange={set("tier")} className={inputCls}>
                {TIER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>평일 시간<input value={form.weekdayHours} onChange={set("weekdayHours")} maxLength={30} className={inputCls} placeholder="18:00 ~ 23:00" /></label>
            <label className={labelCls}>주말 시간<input value={form.weekendHours} onChange={set("weekendHours")} maxLength={30} className={inputCls} placeholder="ALL" /></label>
          </div>
          <label className={labelCls}>챔피언 (쉼표 구분, 선택)<input value={form.champions} onChange={set("champions")} className={inputCls} placeholder="이블린,카서스,자이라" /></label>
          <label className={labelCls}>작업 종류 (쉼표 구분)<input value={form.services} onChange={set("services")} className={inputCls} placeholder="대리,듀오" /></label>
          <label className={labelCls}>
            소개
            <textarea value={form.description} onChange={set("description")} maxLength={300} rows={3} className={`${inputCls} resize-none leading-7`} placeholder="기사 소개를 입력해주세요." />
          </label>

          <div className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">프로필 이미지</span>
            {form.image ? (
              <div className="relative overflow-hidden rounded-2xl bg-zinc-900">
                <Image src={form.image} alt="미리보기" width={80} height={80} className="h-20 w-20 object-cover" unoptimized />
                <button type="button" onClick={removeImage} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white hover:bg-black">
                  <X size={12} />
                </button>
                <p className="px-3 py-2 text-xs text-zinc-500">{imageName}</p>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/3 px-4 py-6 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white">
                이미지 선택 (JPG/PNG/WEBP, 2MB 이하)
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImage} />
              </label>
            )}
            {imageError && <p className="text-xs text-red-400">{imageError}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm font-bold text-zinc-300">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 accent-gold" />
            공개 (체크 해제 시 숨김)
          </label>

          {message && <p className="rounded-2xl border border-gold/15 bg-white/[.035] px-4 py-3 text-sm font-bold text-zinc-300">{message}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black shadow-gold-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              {saving && <Loader2 size={18} className="animate-spin" />}
              {editingId ? "수정 저장" : "기사 등록"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-full border border-white/10 px-7 py-4 font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white">취소</button>
            )}
          </div>
        </div>
      </form>

      {/* List with drag-to-reorder */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">lineup</p>
            <h2 className="mt-2 text-2xl font-black text-white">기사 {lineups.length}명</h2>
          </div>
          {savingOrder && <Loader2 size={16} className="animate-spin text-gold" />}
        </div>
        <p className="text-xs text-zinc-500">행을 드래그해서 순서를 변경할 수 있습니다.</p>

        <div className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/[.035]">
          {lineups.length === 0 && <p className="p-6 text-sm text-zinc-500">등록된 기사가 없습니다.</p>}
          {lineups.map((lineup, index) => (
            <div
              key={lineup.id}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragEnter={() => onDragEnter(index)}
              onDragEnd={() => void onDragEnd()}
              onDragOver={(e) => e.preventDefault()}
              className="flex cursor-grab items-center gap-4 border-b border-white/8 p-4 last:border-b-0 active:cursor-grabbing"
            >
              <GripVertical size={16} className="shrink-0 text-zinc-600" />
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                {lineup.image && (
                  <Image src={lineup.image} alt={lineup.name} fill className="object-cover opacity-90" unoptimized />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-white">{lineup.name}</span>
                  {!lineup.active && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700/50 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                      <EyeOff size={10} />숨김
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">{lineup.positions.join(" · ")} · {lineup.rank}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => startEdit(lineup)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-gold/40 hover:text-white" aria-label="수정">
                  <Pencil size={15} />
                </button>
                <button type="button" onClick={() => void deleteLineup(lineup)} disabled={deletingId === lineup.id} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-red-400/40 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60" aria-label="삭제">
                  {deletingId === lineup.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
