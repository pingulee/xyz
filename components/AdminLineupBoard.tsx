"use client";

import Image from "next/image";
import { EyeOff, Loader2, LogOut, Pencil, Trash2, UploadCloud } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import type { Lineup } from "@/lib/lineups";

const STORAGE_KEY = "xyz-admin-password";

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
  image: "",
  sortOrder: 0,
  active: true,
};

type LineupResponse = { lineup: Lineup; message?: string };

export default function AdminLineupBoard({
  initialLineups = [],
}: {
  initialLineups?: Lineup[];
}) {
  const [lineups, setLineups] = useState(initialLineups);
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPassword(stored);
      setPasswordInput(stored);
    }
  }, []);

  const set = (key: keyof typeof blankForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const login = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pw = passwordInput.trim();
    if (!pw) { setMessage("관리자 비밀번호를 입력해주세요."); return; }
    window.localStorage.setItem(STORAGE_KEY, pw);
    setPassword(pw);
    setMessage("");
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setPassword("");
    setPasswordInput("");
    setMessage("");
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
      sortOrder: lineup.sortOrder,
      active: lineup.active,
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId("");
    setForm(blankForm);
    setMessage("");
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return form.image;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", imageFile);
      fd.append("password", password);
      const res = await fetch("/api/lineups/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { path?: string; message?: string };
      if (!res.ok) throw new Error(data.message ?? "업로드 실패");
      return data.path ?? null;
    } finally {
      setUploading(false);
    }
  };

  const saveLineup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const imagePath = await uploadImage();
      if (imagePath === null) throw new Error("이미지 업로드에 실패했습니다.");

      const response = await fetch("/api/lineups", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId || undefined,
          ...form,
          image: imagePath,
          sortOrder: Number(form.sortOrder),
          password,
        }),
      });
      const data = (await response.json()) as LineupResponse;
      if (!response.ok) throw new Error(data.message ?? "저장하지 못했습니다.");

      if (editingId) {
        setLineups((cur) =>
          cur.map((l) => (l.id === editingId ? data.lineup : l))
            .sort((a, b) => a.sortOrder - b.sortOrder || Number(a.id) - Number(b.id)),
        );
      } else {
        setLineups((cur) =>
          [...cur, data.lineup].sort((a, b) => a.sortOrder - b.sortOrder || Number(a.id) - Number(b.id)),
        );
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
        body: JSON.stringify({ id: lineup.id, password }),
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

  const inputCls =
    "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full";
  const labelCls = "grid gap-2 text-sm font-bold text-zinc-300";

  if (!password) {
    return (
      <form
        onSubmit={login}
        className="card-premium mx-auto max-w-xl rounded-[34px] p-6 sm:p-8"
      >
        <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">admin</p>
        <h2 className="mt-3 text-2xl font-black text-white">관리자 로그인</h2>
        <label className="mt-7 grid gap-2">
          <span className="text-sm font-bold text-zinc-300">비밀번호</span>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className={inputCls}
            placeholder="ADMIN_PASSWORD"
          />
        </label>
        {message && (
          <p className="mt-4 rounded-2xl border border-gold/15 bg-white/[.035] px-4 py-3 text-sm font-bold text-zinc-300">
            {message}
          </p>
        )}
        <button
          type="submit"
          className="mt-5 w-full rounded-full bg-gold-gradient px-7 py-4 font-black text-black shadow-gold-sm transition hover:-translate-y-0.5"
        >
          입장
        </button>
      </form>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
      {/* Form */}
      <form onSubmit={saveLineup} className="card-premium rounded-[34px] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">admin only</p>
            <h2 className="mt-3 text-2xl font-black text-white">
              {editingId ? "기사 수정" : "기사 추가"}
            </h2>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>

        <div className="mt-7 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              이름
              <input value={form.name} onChange={set("name")} maxLength={60} className={inputCls} placeholder="이브" />
            </label>
            <label className={labelCls}>
              랭크
              <input value={form.rank} onChange={set("rank")} maxLength={30} className={inputCls} placeholder="Challenger" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              포지션 (쉼표 구분)
              <input value={form.positions} onChange={set("positions")} className={inputCls} placeholder="정글,탑" />
            </label>
            <label className={labelCls}>
              티어 이미지
              <select value={form.tier} onChange={set("tier")} className={inputCls}>
                {TIER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              평일 시간
              <input value={form.weekdayHours} onChange={set("weekdayHours")} maxLength={30} className={inputCls} placeholder="18:00 ~ 23:00" />
            </label>
            <label className={labelCls}>
              주말 시간
              <input value={form.weekendHours} onChange={set("weekendHours")} maxLength={30} className={inputCls} placeholder="ALL" />
            </label>
          </div>

          <label className={labelCls}>
            챔피언 (쉼표 구분, 선택)
            <input value={form.champions} onChange={set("champions")} className={inputCls} placeholder="이블린,카서스,자이라" />
          </label>

          <label className={labelCls}>
            작업 종류 (쉼표 구분)
            <input value={form.services} onChange={set("services")} className={inputCls} placeholder="대리,듀오" />
          </label>

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

          <div className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">프로필 이미지</span>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-zinc-900">
                {(imagePreview || form.image) && (
                  <Image
                    src={imagePreview || form.image}
                    alt="미리보기"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[.03] px-4 py-3 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white">
                <UploadCloud size={18} />
                {uploading ? "업로드 중..." : "이미지 선택"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            {(imagePreview || form.image) && (
              <p className="text-xs text-zinc-600 break-all">{imagePreview ? imageFile?.name : form.image}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              정렬 순서
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                className={inputCls}
                min={0}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 self-end pb-3">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="h-4 w-4 accent-gold"
              />
              공개 (체크 해제 시 숨김)
            </label>
          </div>

          {message && (
            <p className="rounded-2xl border border-gold/15 bg-white/[.035] px-4 py-3 text-sm font-bold text-zinc-300">
              {message}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black shadow-gold-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {editingId ? "수정 저장" : "기사 등록"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-white/10 px-7 py-4 font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white"
              >
                취소
              </button>
            )}
          </div>
        </div>
      </form>

      {/* List */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">lineup</p>
          <h2 className="mt-2 text-2xl font-black text-white">기사 {lineups.length}명</h2>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/[.035]">
          {lineups.length === 0 && (
            <p className="p-6 text-sm text-zinc-500">등록된 기사가 없습니다.</p>
          )}
          {lineups.map((lineup) => (
            <div
              key={lineup.id}
              className="flex items-center gap-4 border-b border-white/8 p-4 last:border-b-0"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                {lineup.image && (
                  <Image
                    src={lineup.image}
                    alt={lineup.name}
                    fill
                    className="object-cover opacity-90"
                    unoptimized
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-white">{lineup.name}</span>
                  {!lineup.active && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700/50 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                      <EyeOff size={10} />
                      숨김
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  {lineup.positions.join(" · ")} · {lineup.rank}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(lineup)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-gold/40 hover:text-white"
                  aria-label="수정"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => void deleteLineup(lineup)}
                  disabled={deletingId === lineup.id}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-red-400/40 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="삭제"
                >
                  {deletingId === lineup.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
