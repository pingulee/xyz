"use client";

import Image from "next/image";
import {
  Clock,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import KnightAvatar from "@/components/KnightAvatar";
import { useChampionOptions } from "@/components/useChampionOptions";
import { getLineupPath } from "@/lib/lineup-model";
import type { Lineup } from "@/lib/lineup-model";

const MAX_IMAGE_SIZE = 1024 * 1024 * 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const TIER_OPTIONS = [
  { label: "챌린저", rank: "Challenger", tier: "/images/tier/10-challenger.png" },
  {
    label: "그랜드마스터",
    rank: "Grandmaster",
    tier: "/images/tier/9-grandmaster.png",
  },
];

function nationalityFlag(code: number) {
  return code === 2 ? "/images/flags/cn.svg" : "/images/flags/kr.svg";
}

function nationalityLabel(code: number) {
  return code === 2 ? "중국" : "대한민국";
}

const POSITIONS = ["탑", "정글", "미드", "바텀", "서포터"] as const;
const NATIONALITIES = [
  { value: "1", label: "대한민국" },
  { value: "2", label: "중국" },
] as const;
const TIME_SLOTS = [
  "00","01","02","03","04","05","06","07","08","09","10","11",
  "12","13","14","15","16","17","18","19","20","21","22","23",
];

const blankForm = {
  name: "",
  positionSet: new Set<string>(),
  rank: "Challenger",
  tier: "/images/tier/10-challenger.png",
  nationality: "1",
  description: "",
  weekdayStart: "18",
  weekdayEnd: "23",
  weekdayAll: false,
  weekendStart: "00",
  weekendEnd: "23",
  weekendAll: true,
  champ1: "",
  champ2: "",
  champ3: "",
  serviceBoost: false,
  serviceDuo: false,
  imageUrl: null as string | null,
  active: true,
  knightPassword: "",
};

type FormState = typeof blankForm;
type LineupResponse = { lineup: Lineup; message?: string };

export default function AdminLineupBoard({
  initialLineups = [],
}: {
  initialLineups?: Lineup[];
}) {
  const [lineups, setLineups] = useState(initialLineups);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mousedownOnOverlay = useRef(false);
  const router = useRouter();
  const { champions, loading: championsLoading } = useChampionOptions();

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  type StringKey = {
    [K in keyof FormState]: FormState[K] extends string ? K : never;
  }[keyof FormState];
  const set =
    (key: StringKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const togglePosition = (pos: string) =>
    setForm((f) => {
      const next = new Set(f.positionSet);
      if (next.has(pos)) next.delete(pos);
      else next.add(pos);
      return { ...f, positionSet: next };
    });

  const setTierOption = (tierValue: string) => {
    const opt = TIER_OPTIONS.find((o) => o.tier === tierValue);
    if (opt) setForm((f) => ({ ...f, tier: opt.tier, rank: opt.rank }));
  };

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError("");
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("JPG, PNG, WEBP 이미지만 첨부할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("이미지는 5MB 이하만 첨부할 수 있습니다.");
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageName(file.name);
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    setImageName("");
    setForm((f) => ({ ...f, imageUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetImageState = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setImageName("");
    setImageError("");
  };

  const openWrite = () => {
    setEditingId("");
    setForm(blankForm);
    resetImageState();
    setMessage("");
    setModalOpen(true);
  };

  const parseHours = (hours: string): { start: string; end: string; all: boolean } => {
    if (!hours || hours.toUpperCase() === "ALL")
      return { start: "00", end: "23", all: true };
    const m = hours.match(/(\d{1,2}):?\d*\s*~\s*(\d{1,2})/);
    if (m)
      return {
        start: String(m[1]).padStart(2, "0"),
        end: String(m[2]).padStart(2, "0"),
        all: false,
      };
    return { start: "00", end: "23", all: false };
  };

  const openEdit = (lineup: Lineup) => {
    setEditingId(lineup.id);
    const wd = parseHours(lineup.weekdayHours);
    const we = parseHours(lineup.weekendHours);
    setForm({
      name: lineup.name,
      positionSet: new Set(lineup.positions),
      rank: lineup.rank,
      tier: lineup.tier,
      nationality: String(lineup.nationality),
      description: lineup.description,
      weekdayStart: wd.start,
      weekdayEnd: wd.end,
      weekdayAll: wd.all,
      weekendStart: we.start,
      weekendEnd: we.end,
      weekendAll: we.all,
      champ1: lineup.champions[0] ?? "",
      champ2: lineup.champions[1] ?? "",
      champ3: lineup.champions[2] ?? "",
      serviceBoost: lineup.services.includes("대리"),
      serviceDuo: lineup.services.includes("듀오"),
      imageUrl: lineup.image,
      active: lineup.active,
      knightPassword: "",
    });
    resetImageState();
    setImageName(lineup.image ? "현재 이미지" : "");
    setMessage("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setMessage("");
  };

  const formatHours = (start: string, end: string, all: boolean) =>
    all ? "ALL" : `${start}:00 ~ ${end}:00`;

  const buildPayload = (imageUrl: string | null) => ({
    name: form.name,
    positions: Array.from(form.positionSet).join(","),
    rank: form.rank,
    tier: form.tier,
    description: form.description,
    weekdayHours: formatHours(form.weekdayStart, form.weekdayEnd, form.weekdayAll),
    weekendHours: formatHours(form.weekendStart, form.weekendEnd, form.weekendAll),
    champions: [form.champ1, form.champ2, form.champ3].filter(Boolean).join(","),
    services: [form.serviceBoost && "대리", form.serviceDuo && "듀오"]
      .filter(Boolean)
      .join(","),
    nationality: Number(form.nationality),
    image: imageUrl,
    active: form.active,
    knightPassword: form.knightPassword || undefined,
  });

  const saveLineup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      let imageUrl = form.imageUrl;

      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", imageFile);
        const uploadRes = await fetch("/api/uploads/lineups", {
          method: "POST",
          body: fd,
        });
        const uploadData = (await uploadRes.json()) as {
          imageUrl?: string;
          message?: string;
        };
        setUploading(false);
        if (!uploadRes.ok)
          throw new Error(uploadData.message ?? "이미지 업로드에 실패했습니다.");
        imageUrl = uploadData.imageUrl ?? null;
      }

      const response = await fetch("/api/lineup", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId || undefined,
          ...buildPayload(imageUrl),
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
        router.push(getLineupPath(data.lineup));
      }
      closeModal();
    } catch (err) {
      setUploading(false);
      setMessage(err instanceof Error ? err.message : "저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const deleteLineup = async (lineup: Lineup) => {
    if (!confirm(`"${lineup.name}" 기사를 삭제하시겠습니까?`)) return;
    setDeletingId(lineup.id);
    try {
      const response = await fetch("/api/lineup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lineup.id }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "삭제하지 못했습니다.");
      setLineups((cur) => cur.filter((l) => l.id !== lineup.id));
    } catch {
      // silently fail
    } finally {
      setDeletingId("");
    }
  };

  const inputCls =
    "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full";
  const labelCls = "grid gap-2 text-sm font-bold text-zinc-300";
  const currentImage = imagePreview || form.imageUrl;

  const champOptions = (exclude1: string, exclude2: string) =>
    champions.filter((c) => c.name !== exclude1 && c.name !== exclude2);

  return (
    <>
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            mousedownOnOverlay.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && mousedownOnOverlay.current)
              closeModal();
          }}
        >
          <div className="w-full max-w-3xl mx-auto rounded-[28px] md:rounded-[34px] border border-gold/20 bg-[#111] shadow-2xl max-h-[92dvh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 p-5 md:px-8 md:pt-8 md:pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
                  admin
                </p>
                <h2 className="mt-1 text-xl font-black text-white md:text-2xl">
                  {editingId ? "기사 수정" : "기사 추가"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-gold/40 hover:text-white"
                aria-label="닫기"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={saveLineup}
              className="md:grid md:grid-cols-[240px_1fr] md:divide-x md:divide-white/8"
            >
              <div className="grid gap-3 p-5 md:px-8 md:pb-8 md:pt-0 md:content-start">
                <div className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-300">프로필 이미지</span>
                  {currentImage ? (
                    <div className="relative overflow-hidden rounded-2xl bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentImage}
                        alt="미리보기"
                        className="h-32 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
                      >
                        <X size={12} />
                      </button>
                      <p className="px-3 py-1.5 text-xs text-zinc-500 truncate">
                        {imageName}
                      </p>
                    </div>
                  ) : (
                    <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/15 bg-white/3 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white">
                      <span>이미지 선택</span>
                      <span className="text-xs font-normal text-zinc-600">
                        JPG / PNG / WEBP · 5MB 이하
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImage}
                      />
                    </label>
                  )}
                  {imageError && (
                    <p className="text-xs text-red-400">{imageError}</p>
                  )}
                </div>

                <label className={labelCls}>
                  이름
                  <input
                    value={form.name}
                    onChange={set("name")}
                    maxLength={60}
                    className={inputCls}
                    placeholder="닉네임"
                  />
                </label>

                <label className={labelCls}>
                  티어
                  <select
                    value={form.tier}
                    onChange={(e) => setTierOption(e.target.value)}
                    className={inputCls}
                  >
                    {TIER_OPTIONS.map((opt) => (
                      <option key={opt.tier} value={opt.tier}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelCls}>
                  국적
                  <select
                    value={form.nationality}
                    onChange={set("nationality")}
                    className={inputCls}
                  >
                    {NATIONALITIES.map((nationality) => (
                      <option key={nationality.value} value={nationality.value}>
                        {nationality.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-300">포지션</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {POSITIONS.map((pos) => (
                      <label
                        key={pos}
                        className="flex items-center gap-2 text-sm font-bold text-zinc-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.positionSet.has(pos)}
                          onChange={() => togglePosition(pos)}
                          className="h-4 w-4 accent-gold"
                        />
                        {pos}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 border-t border-white/8 p-5 md:border-t-0 md:px-8 md:pb-8 md:pt-0 md:content-start">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <span className="text-sm font-bold text-zinc-300">평일 시간</span>
                    {form.weekdayAll ? (
                      <div className={`${inputCls} text-zinc-500`}>ALL</div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <select value={form.weekdayStart} onChange={set("weekdayStart")} className={inputCls}>
                          {TIME_SLOTS.map((h) => (
                            <option key={h} value={h}>{h}:00</option>
                          ))}
                        </select>
                        <span className="shrink-0 text-zinc-500 text-xs">~</span>
                        <select value={form.weekdayEnd} onChange={set("weekdayEnd")} className={inputCls}>
                          {TIME_SLOTS.map((h) => (
                            <option key={h} value={h}>{h}:00</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.weekdayAll}
                        onChange={(e) => setForm((f) => ({ ...f, weekdayAll: e.target.checked }))}
                        className="h-4 w-4 accent-gold"
                      />
                      ALL
                    </label>
                  </div>
                  <div className="grid gap-2">
                    <span className="text-sm font-bold text-zinc-300">주말 시간</span>
                    {form.weekendAll ? (
                      <div className={`${inputCls} text-zinc-500`}>ALL</div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <select value={form.weekendStart} onChange={set("weekendStart")} className={inputCls}>
                          {TIME_SLOTS.map((h) => (
                            <option key={h} value={h}>{h}:00</option>
                          ))}
                        </select>
                        <span className="shrink-0 text-zinc-500 text-xs">~</span>
                        <select value={form.weekendEnd} onChange={set("weekendEnd")} className={inputCls}>
                          {TIME_SLOTS.map((h) => (
                            <option key={h} value={h}>{h}:00</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.weekendAll}
                        onChange={(e) => setForm((f) => ({ ...f, weekendAll: e.target.checked }))}
                        className="h-4 w-4 accent-gold"
                      />
                      ALL
                    </label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-300">챔피언 (최대 3개)</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["champ1", "champ2", "champ3"] as const).map((key, i) => {
                      const other1 = i === 0 ? form.champ2 : form.champ1;
                      const other2 = i === 1 ? form.champ3 : i === 0 ? form.champ3 : form.champ2;
                      return (
                        <select
                          key={key}
                          value={form[key]}
                          onChange={set(key)}
                          className={inputCls}
                          disabled={championsLoading}
                        >
                          <option value="">
                            {championsLoading ? "불러오는 중" : "없음"}
                          </option>
                          {champOptions(other1, other2).map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-300">작업 종류</span>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.serviceBoost}
                        onChange={(e) => setForm((f) => ({ ...f, serviceBoost: e.target.checked }))}
                        className="h-4 w-4 accent-gold"
                      />
                      대리
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.serviceDuo}
                        onChange={(e) => setForm((f) => ({ ...f, serviceDuo: e.target.checked }))}
                        className="h-4 w-4 accent-gold"
                      />
                      듀오
                    </label>
                  </div>
                </div>

                <label className={labelCls}>
                  소개
                  <textarea
                    value={form.description}
                    onChange={set("description")}
                    maxLength={300}
                    rows={3}
                    className={`${inputCls} resize-none leading-7`}
                    placeholder="기사 소개를 입력해주세요."
                  />
                </label>

                <label className={labelCls}>
                  기사 로그인 비밀번호
                  <input
                    type="password"
                    value={form.knightPassword}
                    onChange={set("knightPassword")}
                    maxLength={60}
                    className={inputCls}
                    placeholder="변경 시에만 입력 (비워두면 유지)"
                    autoComplete="new-password"
                  />
                </label>

                <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    className="h-4 w-4 accent-gold"
                  />
                  공개 (체크 해제 시 숨김)
                </label>

                {message && (
                  <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {(saving || uploading) && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
                  {uploading ? "이미지 업로드 중..." : editingId ? "수정 저장" : "기사 등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-white">기사 {lineups.length}명</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openWrite}
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-3 text-sm font-black text-black transition hover:brightness-110"
            >
              <Plus size={16} />
              기사 추가
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {lineups.length === 0 && (
            <p className="col-span-full text-sm text-zinc-500">등록된 기사가 없습니다.</p>
          )}
          {lineups.map((knight) => (
            <div key={knight.id} className="relative">
              <KnightCard knight={knight} />
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(knight)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/60 text-zinc-400 backdrop-blur-sm transition hover:border-gold/40 hover:text-white"
                  aria-label="수정"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => void deleteLineup(knight)}
                  disabled={deletingId === knight.id}
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/60 text-zinc-400 backdrop-blur-sm transition hover:border-red-400/40 hover:text-red-200 disabled:opacity-60"
                  aria-label="삭제"
                >
                  {deletingId === knight.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function KnightCard({ knight }: { knight: Lineup }) {
  return (
    <article className={`card-premium overflow-hidden rounded-[28px] ${!knight.active ? "opacity-50" : ""}`}>
      <div className="flex gap-4 p-5">
        <KnightAvatar
          availability={knight}
          image={knight.image}
          name={knight.name}
          size={80}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Image
                src={knight.tier}
                alt={knight.rank}
                width={18}
                height={18}
                className="rounded-full bg-zinc-800"
              />
              <span className="text-xs font-black text-gold">{knight.rank}</span>
            </div>
            {!knight.active && (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700/50 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                <EyeOff size={10} />
                숨김
              </span>
            )}
          </div>
          <p className="mt-1.5 flex items-center gap-2 font-black text-white">
            <span className="truncate">{knight.name}</span>
            <Image
              src={nationalityFlag(knight.nationality)}
              alt={nationalityLabel(knight.nationality)}
              title={nationalityLabel(knight.nationality)}
              width={24}
              height={16}
              className="shrink-0 rounded-[3px] border border-white/10 object-cover"
            />
          </p>
          <div className="mt-1 grid gap-0.5 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Clock size={10} />
              <span>평일 {knight.weekdayHours}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={10} />
              <span>주말 {knight.weekendHours}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/6 px-5 pb-5 pt-4">
        <p className="text-sm leading-6 text-zinc-400">{knight.description}</p>
        <div className="mt-4 grid gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-xs font-black text-zinc-500">라인</span>
            <div className="flex min-h-6 flex-wrap items-center gap-1.5">
              {knight.positions.map((position) => (
                <span
                  key={position}
                  className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs font-bold text-zinc-300"
                >
                  {position}
                </span>
              ))}
            </div>
          </div>
          {knight.champions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-xs font-black text-zinc-500">챔피언</span>
              <div className="flex min-h-6 flex-wrap items-center gap-1.5">
                {knight.champions.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs font-bold text-zinc-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-xs font-black text-zinc-500">작업</span>
            <div className="flex min-h-6 flex-wrap items-center gap-1.5">
              {knight.services.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs font-bold text-zinc-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
