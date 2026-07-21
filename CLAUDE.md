# CLAUDE.md

롤 대리/듀오/계정 서비스 사이트 (LoL boosting). Next.js 16 App Router.

## 스택
- **Next.js 16.2.9** (App Router, **Turbopack**, **React Compiler** `reactCompiler: true`)
- React 19.2 / TypeScript 5 / Tailwind CSS v4 (`@tailwindcss/postcss`)
- **MySQL** (`mysql2`) — 라인업/후기 데이터
- framer-motion(애니메이션), lucide-react(아이콘)
- 경로 alias `@/*` → 프로젝트 루트

## 명령어
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드 (Turbopack)
- `npm run start` — 프로덕션 실행
- `npm run lint` — eslint

## 핵심 규칙 / 컨벤션
- **`lib/site.ts` = 사이트 단일 진실 소스**: `site`(name/url/description/kakaoUrl/ogImage/logo), `navItems`, `services`, 가격표(`boostingPrices`/`duoPrices`). 도메인/이미지/네비 변경은 여기서.
- **도메인은 IDN**: `https://롤대리.xyz` → punycode `xn--vk1b65hf2a.xyz`. `metadataBase`가 자동 인코딩.
- **서비스 카드 이미지**: `/images/slider/01~03.webp` 재사용 (01=대리, 02=듀오, 03=계정). `boosting/duo/account.png`는 **존재하지 않음** — 새 경로 추가 시 실제 파일 먼저 배치할 것 (없으면 next/image가 400).
- **DB 접근 페이지는 `export const dynamic = "force-dynamic"`** (lineup, reviews, 상세, admin, login). `sitemap.ts`도 force-dynamic + try/catch.
- **인증**: `lib/adminSession.ts`(관리자), `lib/knightSession.ts`(기사) — 쿠키 기반. `SESSION_COOKIE`, `KNIGHT_SESSION_COOKIE`.
- 라인업 slug는 저장 안 함 — `getLineupSlug(name)`으로 파생 (`lib/lineup-model.ts`).

## SEO 컨벤션 (준수 필수)
- **페이지당 `<h1>` 정확히 1개.** `SectionTitle`은 기본 `h2`, 주 제목엔 `as="h1"` 전달. `ServiceDetail`은 내부에서 이미 `as="h1"`.
- 모든 공개 페이지: per-page `metadata` + `alternates.canonical` + `openGraph`(siteName/images) + twitter. 이미지 기본값 `site.ogImage`.
- 동적 라우트는 `generateMetadata`.
- 구조화 데이터: `components/JsonLd.tsx`(홈, `@graph`: Organization+WebSite+ProfessionalService), 서비스 페이지 Service/FAQPage, 후기 Review, 상세 페이지 BreadcrumbList.
- `app/robots.ts` — `/admin`, `/login`, `/api/` disallow. `app/sitemap.ts` — 정적 + 동적(라인업 slug, 후기 id).
- 비공개 페이지(admin/login) `robots: { index: false }`.

## 접근성 (Lighthouse 통과 유지)
- 아이콘 전용 버튼엔 반드시 `aria-label`.
- 장식/중복 이미지(라벨 텍스트가 이미 있는 티어 아이콘 등)는 `alt=""`.
- 터치 타깃 ≥24×24px (작은 시각 요소는 래퍼로 히트 영역 확대).
- 이미지는 전부 `next/image` (raw `<img>` 금지). LCP 이미지엔 `priority`.

## 성능 / 애니메이션 (Core Web Vitals)
- **framer-motion 안 씀 (제거됨).** 애니메이션은 CSS(opacity/transform) + IntersectionObserver로. 애니메이션 라이브러리 재도입 금지 — 모바일 하이드레이션 비용/강제 리플로우 유발.
- **스크롤 진입 효과는 `components/Reveal.tsx`** (IntersectionObserver + CSS transition, `prefers-reduced-motion` 존중). 새 애니메이션도 이 패턴.
- **LCP 보호**: 첫 페인트(above-the-fold, 특히 HeroSlider)는 JS/애니메이션에 가리지 않게. SSR HTML에서 바로 보여야 함. HeroSlider는 `mounted` 플래그로 첫 렌더만 애니메이션 생략.
- `next.config.ts` `experimental.inlineCss: true` — 렌더 차단 CSS 제거.
- `package.json` `browserslist` 최신 타깃(safari 15.4+) — 레거시 폴리필 트랜스파일 방지. 구형 브라우저 지원 필요 시에만 완화.
- **이미지**: `next/image`, 정확한 `sizes` 필수(과대 다운로드 방지, `object-contain`이면 실제 렌더 폭 기준). 히어로/서비스 이미지는 `/images/slider/*.webp` 공용 — 모바일 4G에서 큼. 전용 소스/`quality` 조정 여지 있음.
- 애니메이션은 GPU 합성 속성(opacity/transform)만. `width`/`top`/`offsetWidth` 등 레이아웃 유발 속성 애니메이션 금지.

## Windows 개발 환경 주의
- `.next/dev` 파일 쓰기 실패 `os error 1224`(ERROR_USER_MAPPED_FILE) → **node 프로세스 과다/좀비**가 `.next`를 메모리 매핑으로 잠근 것. 조치: 잉여 node 종료 → `.next` 삭제 → dev 1회만 실행. `npm run dev`를 여러 터미널에서 중복 실행 금지.
- `D:` 드라이브 "Slow filesystem" 경고 존재.
- 줄바꿈: 커밋 시 LF→CRLF 경고는 정상(무해).
