# CLAUDE.md

롤 대리/듀오/계정 서비스 사이트 (LoL boosting). Next.js 16 App Router.

## 스택
- **Next.js 16.2.9** (App Router, **Turbopack**, **React Compiler** `reactCompiler: true`)
- React 19.2 / TypeScript 5 / Tailwind CSS v4 (`@tailwindcss/postcss`)
- **MySQL** (`mysql2`) — 부스터/후기 데이터
- lucide-react(아이콘). **framer-motion 안 씀**(성능 이유로 제거 — 아래 성능 섹션).
- 경로 alias `@/*` → 프로젝트 루트

## 명령어
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드 (Turbopack)
- `npm run start` — 프로덕션 실행
- `npm run lint` — eslint

## 디렉토리 구조
- **컴포넌트는 기능별 폴더**(평면 아님): `components/{layout,ui,home,service,quote,review,booster,auth}` + `hooks/`. import는 항상 `@/` alias 절대경로(상대경로 `./` 안 씀). 새 컴포넌트는 해당 기능 폴더에.
  - `layout`(Header/Footer/FloatingContact/Container), `ui`(SectionTitle/Reveal/JsonLd/FaqItem), `home`(HeroSlider/ServiceCard/HomeFaq), `service`(ServiceDetail/PriceTable), `quote`(QuoteCalculator+RankPicker/constants/types/utils), `review`(ReviewBoard+ReviewDetail/ReplySection/Stars/StarRating/ReviewNavButton/helpers/types/constants, ReviewDetailView, BoosterReview), `booster`(AdminBoosterBoard+AdminBoosterCard/adminBoosterConstants, BoosterCard/BoosterAvatar/WinStatsCard/TierRecords), `auth`(LoginForm/SignupForm/AuthControls/MyReviewList/MyAccountSettings/RiotIdManager/FindAccountForm/ResetPasswordForm — 통합 인증 UI), `notice`(NoticeBoard/NoticeDetailView/NoticeForm/format — 공지사항, 관리자만 작성·수정·삭제), `inquiry`(InquiryBoard/InquiryForm/InquiryDetailView — 문의하기, 비회원 임시비번 등록)
  - `hooks/useChampionOptions.ts` = quote·booster 공용 챔피언 데이터 훅.
- 큰 컴포넌트는 하위 컴포넌트/상수/타입/헬퍼를 같은 폴더 내 파일로 분리(예: review/, quote/). `booster/`는 여러 컴포넌트 공유 폴더라 상수 파일명에 접두사(`adminBoosterConstants.ts`).

## 핵심 규칙 / 컨벤션
- **`lib/site.ts` = 사이트 단일 진실 소스**: `site`(name/url/description/kakaoUrl/ogImage/logo), `navItems`, `services`, 가격표(`boostingPrices`/`duoPrices`). 도메인/이미지/네비 변경은 여기서.
- **도메인은 IDN**: `https://롤대리.xyz` → punycode `xn--vk1b65hf2a.xyz`. **`site.url`은 이미 punycode로 정규화된 값**(`lib/site.ts`의 `SITE_ORIGIN = new URL(...).origin`). 한글 원문 URL을 코드에 다시 하드코딩하지 말 것 — robots.txt/sitemap.xml/JSON-LD는 문자열을 그대로 출력하므로(Next가 인코딩 안 함) 호스트가 canonical과 어긋나 사이트맵 전량 거부됨.
- **서비스 카드 이미지**: `/images/slider/01~03.webp` 재사용 (01=대리, 02=듀오, 03=계정). `boosting/duo/account.png`는 **존재하지 않음** — 새 경로 추가 시 실제 파일 먼저 배치할 것 (없으면 next/image가 400).
- **DB 접근 페이지 렌더링 정책** (목록·관리는 동적, 상세는 ISR):
  - **목록·관리 페이지는 `force-dynamic`** (booster 목록, review 목록, notice 목록, admin, login). 세션·실시간성이 필요하고 페이지 수가 적어 매요청 조회가 부담되지 않는다.
  - **상세 페이지(`review/[id]`, `booster/[slug]`, `notice/[id]`)는 온디맨드 ISR** — `export const revalidate = 3600` + `generateStaticParams()` **빈 배열**. force-dynamic 아님. 과거엔 force-dynamic이었으나(항상 최신 + 세션 SSR + 무효화 불필요라는 이점), 1,600여 상세가 방문·크롤마다 DB를 4~5회 왕복(`getReviewById`+`getReviewNavigation`+`getBoosterById`+`getRelatedReviews`, 기사 로그인 시 `sessionBooster` 추가)해 리소스 대비 이점이 역전됐다 → revalidate 주기당 1회로 축소.
    - **동적 세그먼트는 `generateStaticParams`가 없으면 revalidate가 있어도 SSR(ƒ)로 남는다.** 빈 배열이라도 있어야 SSG(●)/온디맨드 ISR로 전환(빌드 프리렌더 0, 각 상세는 첫 요청 시 생성 후 캐시). 빌드 로그 Route 표에서 ● 확인.
    - **ISR 페이지의 세션 UI는 클라이언트로 분리해야 한다.** 페이지에서 `cookies()`를 없애야 정적화된다(그게 유일한 force-dynamic 원인이었다). 관리자/기사 편집 UI는 `hooks/useSession.ts`가 `app/api/session/me`(force-dynamic)를 조회해 켠다. 세션 쿠키가 **HttpOnly**라 `document.cookie`로 못 읽어 서버 왕복이 필수. 초기값은 비로그인이라 캐시 HTML과 일치(하이드레이션 안전), 로그인 상태면 뒤이어 편집 UI가 켜진다.
    - **ISR 페이지 무효화는 `revalidatePath`** (태그로는 안 지워진다). `revalidateTag`는 `unstable_cache` 목록류만 무효화하고 렌더된 페이지 HTML은 못 지운다. 후기/답글 쓰기 route가 `invalidateReviewCaches(reviewId)`를 호출하면 `revalidatePath('/review/[id]')`로 상세가 즉시 갱신된다(`lib/cache-tags.ts`). 기사 상세(`booster/[slug]`)의 집계 지연은 revalidate 안전망(1h)으로 흡수 — 답글 즉시성은 후기 상세 쪽이 핵심.
  - **사이트맵은 루트 인덱스 + 용도별 4분할.** `/sitemap.xml`은 `app/sitemap.xml/route.ts`가 만드는 인덱스이며, `app/pages/sitemap.ts`(정적 페이지, DB 접근 0 — navItems 공개 경로 자동 포함), `app/booster/sitemap.ts`, `app/review/sitemap.ts`, `app/notice/sitemap.ts`를 참조한다. Search Console과 `app/robots.ts`에는 루트 인덱스 하나만 제출한다. **새 사이트맵 추가 시 인덱스(`sitemapPaths`)에도 등록할 것.**
  - 동적 사이트맵은 `export const revalidate = 3600`(ISR). **리터럴이어야 함** — 상수 import 시 "Invalid segment configuration export"로 빌드 실패.
  - DB 조회는 `lib/sitemap.ts`의 `withFallback`(5초 상한, 실패 시 빈 배열)으로 감쌀 것. 에러 없이 매달리는 조회는 try/catch로 못 잡는다.
  - **사이트맵용 쿼리는 전용 경량 함수로.** `getBoosterList`는 DDL 보정 + 리뷰 집계 JOIN + 전적 요약까지 돌아 5초를 넘겼다(실측). slug엔 이름만 필요 → `getBoosterSitemapEntries`. 후기는 `getSitemapReviewEntries`(5000건 상한).
- **인증(통합)**: 세 역할 `admin`/`booster`/`customer`를 **단일 쿠키 `xyz_session`**(`lib/session.ts`)으로 통합. 토큰은 `role:userId:expiry` HMAC-SHA256 서명(role이 서명에 포함돼 위조 불가). 서명 키 `getAuthSecret()` = `AUTH_SECRET ?? ADMIN_PASSWORD`(빈 값이면 fail-closed). 쿠키 `HttpOnly; SameSite=Strict`(prod `Secure`).
  - **`lib/authz.ts` = 통합 권한 게이트**: `getSession`/`isAdmin`/`resolveBoosterId`. 모든 API 라우트·서버 페이지가 이걸 쓴다(라우트마다 중복이던 `isAdminRequest` 폐기). 서버 컴포넌트(page)는 Request가 없어 `getSessionFromCookieHeader(headers().get("cookie"))`를 쓴다.
  - **`lib/authPolicy.ts` = 아이디·비번 규격(서버·클라 공용, crypto/db 의존 없음)**: 아이디 `isValidUsername`(영문 소문자 시작, 소문자·숫자·_ 4~20자), 비번 `isValidPassword`(8~64자 + 영문·숫자·특수문자 각 1자 이상) + 규칙 문구 상수. 가입·비번변경·재설정 라우트와 폼(SignupForm/ResetPasswordForm/MyAccountSettings)이 **같은 검증·문구**를 쓴다. 로그인은 형식 검증 안 함(기존 비번 호환). **기사 가입은 이메일 불요**(이메일·사이트닉네임·롤ID는 고객 전용).
  - **`lib/users.ts` = users 테이블**(username UNIQUE·소문자 정규화, scrypt 해시, role `customer`/`booster`). **관리자는 DB가 아니라 env** `ADMIN_USERNAME`+`ADMIN_PASSWORD`(role=admin, userId=0). `lib/password.ts`(scrypt 단일화, 열거 방지 더미검증), `lib/authRateLimit.ts`(로그인·가입 IP + 계정 레이트리밋, 15분 10회).
  - **엔드포인트/UI**: `/api/auth/{login,signup,logout}`, 통합 폼 `/login`(회원가입 링크)·`/signup`, 마이페이지 `/mypage`. 헤더 `components/auth/AuthControls`. 클라이언트 세션은 `hooks/useSession`+`app/api/session/me`(`{role,userId,username,isAdmin,boosterId,boosterName}` — 하위호환 필드 유지).
  - **기사** = `booster` 프로필 + `users`(role=booster) `booster.user_id`로 연결(booster.id는 답글권한·통계·조인의 안정 식별자라 유지). **기사 계정 생성 = 가입 코드제**: 관리자가 `/admin`에서 코드 발급(`booster_signup_codes`) → 합격 기사가 `/signup` 기사 탭에서 **코드 선인증**(`/api/auth/verify-code`, 소진 안 함) 후 프로필 입력 → `/api/auth/signup`이 **한 트랜잭션**으로 users(role=booster)+booster 생성 + `consumeCode`(1회용, `WHERE used=0`+affectedRows로 재사용·동시성 차단). 관리자 직접 생성(`/api/booster` POST)은 폐기. **고객** = 셀프 회원가입 → 로그인 후기 작성(`review.user_id` 소유, 비번 없이) + 마이페이지. **관리자 슈퍼권한**: 모든 기사 답글·후기 수정·삭제(서버 세션 role로만 판정).
  - **후기 작성·소유권**: 신규 후기는 로그인 고객만 작성한다. 수정·삭제는 `admin` 또는 `review.user_id === session.userId`만 가능하며, 비로그인 비밀번호 인증 경로는 없다. 클라가 보낸 id 불신 — 서명된 `session.userId`만 신뢰.
  - **고객 계정 필드**: 가입 시 **이메일 필수·고유**(`users.email` UNIQUE) + **사이트 닉네임 필수**(`users.display_name`, 2~20자, 고유 아님 — 후기·문의 작성자명) + **롤 닉네임(Riot ID) 여러 개**(`user_lol_nicknames`, 최대 10). 마이페이지에서 사이트 닉네임·비번·이메일·롤닉네임 수정(`/api/account/{display-name,password,email,nicknames}`, 세션 게이트 + 비번/이메일 변경은 현재 비번 재확인). 기사 가입 시 `users.display_name`=프로필명.
  - **로그인 회원의 작성자명은 서버가 계정에서 끌어온다(클라 입력 불신)**: 후기(`/api/review` POST)·문의(`/api/inquiry` POST)는 로그인 상태면 `getDisplayNameById(session.userId)`(미설정 시 username 폴백)로 작성자명을 붙이고, 폼에서 닉네임 입력란을 없앤다. 관리자(대행 작성)만 `name`을 직접 보낸다. 후기 `name` 컬럼은 사이트 닉네임(≤20)을 담도록 `ensureReviewSchema`가 VARCHAR(30)로 방어적 확장(길이만 확장, NULL 여부 유지).
  - **Riot ID 실존 확인 = op.gg**(`lib/riot.ts`): `HEAD https://op.gg/lol/summoners/kr/{게임명}-{태그}` → 200 존재 / 404 없음. **API 키 불필요**(op.gg 상태코드만, 본문 0바이트). 결과 10분 캐시. "확인" 버튼(`/api/riot/verify`)은 UX 게이트고, 가입·닉네임 추가 시 **서버가 재검증**(클라 신뢰 안 함). op.gg 차단/장애면 `RiotUnavailableError`→503. 형식 검증 = `isValidRiotId`(`이름#태그`, 이름 3~16·태그 영숫자 2~5).
  - **현재 티어 자동 조회 = op.gg 파싱**(`getSoloTier`, `/api/riot/tier`): 소환사 페이지를 **GET**해 서버 렌더 설명문(`... current SOLORANKED rank is <tier> Division <n> <lp> LP ...`)을 정규식으로 파싱 → `{ranked,tierIndex,division,lp}`. HEAD(실존)와 달리 본문 필요. 언랭·미존재는 `ranked:false`(에러 아님), 차단/장애는 503. **키 불필요**. 견적 계산기 1단계(롤 닉네임)에서 사용 — 공개 엔드포인트라 세션 게이트 없음. tierIndex 0(아이언)~9(챌린저)는 `components/quote/constants.ts`의 `TIERS` 인덱스와 일치.
  - **견적 계산기 1단계 = 롤 닉네임**(`components/quote/QuoteCalculator.tsx`): 로그인 시 저장된 롤 닉네임(`/api/account/nicknames` GET) 중 선택, 비로그인 시 직접 입력 → "확인"이 `/api/riot/tier`로 현재 티어를 받아 `currentTier`/`currentDivision`(+ lp→`currentLp` 버킷)에 반영 후 다음 단계로. 서비스 선택은 2단계. **수동 "현재 랭크" 단계는 제거됨**(티어는 닉네임 조회로만 채운다) — 수량 입력이 필요한 서비스만 해당 단계를 수량 입력으로 노출하고(저티어 보장제는 없음), 조회 실패·언랭은 카카오 상담으로 안내. 고티어 점수 보장제/저티어 티어 보장제는 티어 제한이 있어 서비스 선택 시 `selectService`가 범위 밖 티어를 보정(조회값이 덮일 수 있음).
  - **아이디/비번 찾기 = 이메일**(`lib/mail.ts` nodemailer + Hostinger SMTP, 발신 `admin@도메인`). `/api/auth/find-username`(이메일→아이디 발송), `/api/auth/request-reset`(재설정 링크 발송) — 둘 다 **열거 방지로 존재 여부 무관 동일 응답**. `/api/auth/reset-password`(토큰+새 비번). 토큰은 `password_reset_tokens`에 **SHA-256 해시만** 저장, 1시간·1회용(`consumeResetToken` 원자적 UPDATE). UI: **`/find-account`(아이디 찾기·비밀번호 찾기 탭 통합, `?tab=id|pw`)** — `FindAccountForm`이 두 탭 모두 이메일→메일 발송(공용 패널). `/reset-password?token=`은 **메일 링크로 도착하는 새 비번 설정 단계 전용**(토큰 없이 오면 `/find-account?tab=pw`로 리다이렉트). 로그인 페이지 하단에 아이디 찾기·비밀번호 찾기·회원가입을 한 줄로. 메일 실패·SMTP 미설정도 응답은 동일(로그만).
  - **레거시 정리 완료**: 구 쿠키(`xyz_admin_session`/`xyz_booster_session`) 병행 읽기, 구 기사 `name+비번` 로그인 폴백, 구 라우트(`/api/admin/{login,logout,session}`·`/api/booster/{login,logout,status}`·`/admax`), `lib/{adminSession,boosterSession}.ts` **전부 삭제됨**. 인증은 이제 통합 경로(`/api/auth/*` + `lib/{session,authz,users}.ts`) 단일. 업로드 라우트도 `isAdmin`로 이관.
  - **남은 과도기 항목 = `booster_password_hash`**: 기사 로그인 검증은 `users.password_hash`만 쓰므로 이 컬럼은 현재 흐름에서 **읽히지 않는다**(write-only). 하지만 (1) `ensureAuthSchema` 백필이 이 값을 users로 복사해 기존 기사를 users로 승계하는 마이그레이션 근거이고, (2) 롤백 안전망이라 **아직 유지**. 기사 PUT·가입 시 users 해시와 동일값으로 병행 기입 중. 모든 기사의 users 승계가 확실해지면 컬럼+병행 기입+백필을 **한 번에** 제거(별도 DDL, 데이터 손실이라 확인 후). **원본 해시 삭제 금지**.
  - **DDL 배치**: users 테이블·백필·**email 컬럼+UNIQUE·`user_lol_nicknames`** = `ensureAuthSchema`(users.ts). `password_reset_tokens` = `ensureResetSchema`(passwordReset.ts). `booster.user_id` = `ensureBoosterSchema`. `review.user_id`+password_hash NULL 완화 = `ensureReviewSchema`. 자기 테이블 컬럼은 자기 ensure에서(그 테이블만 쓰는 라우트에서도 보장). 전부 추가만, FK·DROP 없음.
  - **필수 env**: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, (권장) `AUTH_SECRET`. **메일(아이디/비번 찾기)**: `SMTP_USER`, `SMTP_PASS`(+ 선택 `SMTP_HOST` 기본 smtp.hostinger.com, `SMTP_PORT` 기본 465, `SMTP_SECURE`, `MAIL_FROM` 기본=SMTP_USER). 미설정이면 복구 메일만 조용히 실패(가입·로그인은 정상). Riot ID 확인은 op.gg라 **키 불필요**.
- **문의하기 게시판 `lib/inquiry.ts`**: **비회원도 등록**(임시 비밀번호 `password_hash` 필수 — 본인 열람·삭제용), 회원은 `user_id`로 소유(비번 불요), 관리자는 전체 열람 + 답변(`answer`). **본문은 비공개** — 목록(`/inquiry`)은 제목·작성자·답변여부만, 상세 본문은 `/api/inquiry/[id]` POST로 **인증(관리자|세션 소유|비번) 통과 시에만** 내려간다(페이지는 요약만 SSR, `InquiryDetailView`가 비번 게이트). `ensureInquirySchema`(추가만). **개인 문의라 목록·상세 모두 noindex + robots disallow + 사이트맵 제외**(프라이버시). 목록·상세 force-dynamic.
- **인프로세스 집계 캐시 `lib/stats-cache.ts`**: 무거운 `tier_records` 집계를 60초 TTL로 메모이즈. `MAX_ENTRIES=500` 상한 + eviction(만료분→최오래분 순으로 제거, 무한 증가 방지). 리뷰/답글/부스터 쓰기 시 `clearStatsCache()`(각 `invalidate*Caches`에 포함)로 무효화.
- 부스터 slug는 저장 안 함 — `getBoosterSlug(name)`으로 파생 (`lib/booster-model.ts`).

## SEO 컨벤션 (준수 필수)
- **페이지당 `<h1>` 정확히 1개.** `SectionTitle`은 기본 `h2`, 주 제목엔 `as="h1"` 전달. `ServiceDetail`은 내부에서 이미 `as="h1"`.
- 모든 공개 페이지: per-page `metadata` + `alternates.canonical` + `openGraph`(siteName/images) + twitter. 이미지 기본값 `site.ogImage`.
- **루트 `app/layout.tsx`의 `openGraph`/`twitter`에 `images` 지정**(=`site.ogImage`, 500×500). 자기 og 이미지를 둔 자식 페이지는 이를 덮어쓰고, 안 둔 페이지는 이 대표 이미지를 상속한다. 없으면 홈 소셜 공유에 미리보기 이미지가 안 뜬다. (단 `alternates.canonical`은 아래 규칙대로 루트에 절대 두지 말 것 — `images`만 두는 것과 구분.)
- **`alternates.canonical`은 루트 `app/layout.tsx`에 절대 넣지 말 것.** Next metadata는 `alternates`를 자식으로 상속시키므로, 루트에 `"/"`를 두면 자기 canonical을 지정하지 않은 모든 페이지가 홈을 정본으로 선언 → 색인 제외("대체 페이지, 적절한 표준 태그 있음"). 홈 canonical은 `app/page.tsx`에. **새 공개 페이지 추가 시 canonical 지정 필수.**
- 동적 라우트는 `generateMetadata`.
- 구조화 데이터: `components/ui/JsonLd.tsx`(홈, `@graph`: Organization+WebSite+Service), 서비스 페이지 Service/FAQPage, 후기 Review, 상세 페이지 BreadcrumbList.
- `app/robots.ts` — `/admin`, `/login`, `/signup`, `/mypage`, `/find-account`, `/reset-password`, `/inquiry`, `/api/` disallow(유틸리티·비공개 경로). 공개 게시판(`/notice`)은 disallow 안 함. **`/inquiry`는 개인 문의라 예외적으로 disallow + noindex**(공지와 다름).
- 비공개·유틸리티 페이지(admin/login/signup/mypage) `robots: { index: false }` + robots.txt disallow 병행. **새 공개 게시판은 색인 허용, 유틸리티/개인 페이지는 둘 다 적용.**
- **상세 페이지 ISR은 SEO에 무해(오히려 유리).** 크롤러가 받는 HTML은 SSR/ISR 동일(완성 HTML). JSON-LD·`generateMetadata`(canonical/og)·본문 그대로 출력된다. 세션 편집 UI를 클라이언트로 뺐으므로 크롤러는 비로그인 상태의 깨끗한 HTML을 본다. 캐시 서빙이라 TTFB가 빨라 크롤 예산·CWV에 이득. 첫 요청 1회 생성 지연만 있고 이후 캐시.

## 접근성 (Lighthouse 통과 유지)
- 아이콘 전용 버튼엔 반드시 `aria-label`.
- 장식/중복 이미지(라벨 텍스트가 이미 있는 티어 아이콘 등)는 `alt=""`.
- 터치 타깃 ≥24×24px (작은 시각 요소는 래퍼로 히트 영역 확대).
- 이미지는 전부 `next/image` (raw `<img>` 금지). LCP 이미지엔 `priority`.

## 성능 / 애니메이션 (Core Web Vitals)
- **서버 압축/CDN 필수 (모바일 FCP/LCP 최대 지렛대)**: 홈은 정적이지만 HTML raw ≈ 489KB(RSC flight 235KB + 마크업 181KB + lucide 인라인 SVG 224개 ≈ 86KB + 인라인 CSS 72KB). 무압축이면 느린 4G에서 문서 전송만 ~2.4s → FCP 3.3s/LCP 4.9s. **CDN(압축·엣지캐시) 켜면 brotli ~28KB(17배↓)로 모바일 성능 급상승** — 실측 확인됨. 모바일 성능 문제는 **코드보다 서버 압축부터 확인**(`content-encoding: br/gzip`). 서버가 curl 등 비브라우저에 빈 응답 주므로 크롬 DevTools Network의 문서 Size/Response Headers로 확인.
- **framer-motion 안 씀 (제거됨).** 애니메이션은 CSS(opacity/transform) + IntersectionObserver로. 애니메이션 라이브러리 재도입 금지 — 모바일 하이드레이션 비용/강제 리플로우 유발.
- **스크롤 진입 효과는 `components/ui/Reveal.tsx`** (IntersectionObserver + CSS transition, `prefers-reduced-motion` 존중). 새 애니메이션도 이 패턴.
- **LCP 보호**: 첫 페인트(above-the-fold, 특히 HeroSlider)는 JS/애니메이션에 가리지 않게. SSR HTML에서 바로 보여야 함. HeroSlider는 `animate` 상태로 첫 렌더만 애니메이션 생략(슬라이드 전환 시에만 켜짐).
- `next.config.ts` `experimental.inlineCss: true` — 렌더 차단 CSS 제거.
- `package.json` `browserslist` 최신 타깃(safari 15.4+) — 레거시 폴리필 트랜스파일 방지. 구형 브라우저 지원 필요 시에만 완화.
- **이미지**: `next/image`, 정확한 `sizes` 필수(과대 다운로드 방지, `object-contain`이면 실제 렌더 폭 기준). 히어로/서비스 이미지는 `/images/slider/*.webp` 공용 — 모바일 4G에서 큼. 전용 소스/`quality` 조정 여지 있음.
- **이미지 최적화(sharp)는 크기로 갈린다 — "자동 최적화 = 리소스 절약"이 아니다.** Next 이미지 최적화는 서버가 요청 시 sharp로 리사이즈·webp 변환하므로 CPU·메모리를 쓴다. 리소스 적은 공유호스팅에선 이게 부담(첫 요청 변환 스파이크).
  - **작은 반복 아이콘은 `unoptimized`**: 티어 아이콘(`/images/tier/*.png` 80×80), 국기 svg, 챔피언 초상화(`/upload|images/champion/*.png`), 로고. 파일 축소 이득이 사실상 0인데 sharp CPU만 쓴다. **마퀴 챔피언 80개를 최적화하다 GSC "페이지 리소스 78/91개 로드 실패"가 났던 이력** — 소형 아이콘은 전부 unoptimized로 통일(WinStatsCard/TierRecords/BoosterCard/AdminBoosterCard/TierBand/PriceTable/RankPicker/booster·review 상세 등). 새 아이콘도 동일.
  - **큰 컨텐츠 이미지는 최적화 유지**: slider webp(1448×1086), gotoc.png(1024×1024), 서비스카드, 아바타. 리사이즈 이득이 크고 장수가 적어 sharp 폭주가 없다. 여기엔 `unoptimized`를 붙이지 말 것.
- 애니메이션은 GPU 합성 속성(opacity/transform)만. `width`/`top`/`offsetWidth` 등 레이아웃 유발 속성 애니메이션 금지.
- **폰트 = Pretendard 동적 서브셋**(`public/fonts/pretendard/`). 단일 2MB `PretendardVariable.woff2`(`next/font/local`)는 **제거됨** — 느린 4G에서 통짜 2MB 프리로드가 모바일 LCP 13초 원인이었음. 동적 서브셋은 페이지에 실제 쓰인 unicode-range woff2(수십KB)만 다운로드 → LCP 13s→4.7s. 폰트 패밀리는 `--font-pretendard`(globals.css `:root`)로 배선, `next/font` 안 씀. 통짜 폰트 재도입 금지.
  - **서브셋 CSS는 `layout.tsx`에서 `fs.readFileSync`로 읽어 `url(./)`→절대경로 치환 후 인라인 `<style>`**(렌더 차단 `<link>` 제거 → LCP 추가 개선 ~1.5s). `.css` 파일은 빌드 시 읽으므로 유지 필수, woff2는 절대경로로 참조됨.
  - 폰트 파일 장기 캐시: `next.config.ts` `headers()` `/fonts/:path*` → `Cache-Control: immutable, max-age=1yr`.
- **effect에서 동기 `setState` 금지**(`react-hooks/set-state-in-effect`) — cascading render. "mount 플래그"는 이벤트/타이머 콜백에서 플래그 켜는 방식으로(HeroSlider `animate`), reduced-motion 같은 조건부 표시는 CSS 미디어쿼리로(Reveal `.reveal` + globals.css).

## 외부 웹 요청은 SSH 경유 (직접 접속 금지)
- **경쟁사 사이트 분석, 라이브 `sitemap.xml`/`robots.txt` 도달 확인, 우리 도메인 curl 점검 등 외부 웹 요청은 이 개발 머신에서 직접 하지 말고 SSH 호스트를 경유한다.** 이 머신은 회사 네트워크라 외부 접속 로그가 남아 확인이 번거롭다(사내 정책).
- **SSH 경유 방법**: `~/.ssh/config`의 Host alias **`pingulee`**(→ `ssh.pingulee.dev:2222`, user `pingulee`, key `id_ed25519`). 예: `ssh pingulee 'curl -sI https://xn--vk1b65hf2a.xyz/sitemap.xml'`. 원격 셸에서 curl/wget으로 받아 결과만 가져온다.
- **주의**: 서버가 fail2ban/허용목록으로 출발지 IP를 막으면 키 교환 단계에서 끊긴다(`kex_exchange_identification: Connection closed by remote host`). 키·config가 정상인데 끊기면 서버 측 차단이니 호스트에서 unban/IP 허용 확인.

## Windows 개발 환경 주의
- `.next/dev` 파일 쓰기 실패 `os error 1224`(ERROR_USER_MAPPED_FILE) → **node 프로세스 과다/좀비**가 `.next`를 메모리 매핑으로 잠근 것. 조치: 잉여 node 종료 → `.next` 삭제 → dev 1회만 실행. `npm run dev`를 여러 터미널에서 중복 실행 금지.
- `D:` 드라이브 "Slow filesystem" 경고 존재.
- 줄바꿈: 커밋 시 LF→CRLF 경고는 정상(무해).
