This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Hostinger 배포 설정

### 환경 변수 (.env.local 또는 Hostinger 환경 변수 패널)

```
ADMIN_PASSWORD=your_admin_password
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
UPLOAD_DIR=/home/username/public_html/uploads/reviews
```

### UPLOAD_DIR 설정

후기 이미지는 Hostinger 서버 로컬 디스크에 저장됩니다.

- `UPLOAD_DIR` 미설정 시 기본 경로: `{프로젝트 루트}/uploads/reviews`
- 디렉터리는 앱 시작 시 자동 생성됩니다.
- Hostinger에서는 웹 루트 외부 경로를 권장합니다.

**Hostinger 설정 예시:**

```
UPLOAD_DIR=/home/u123456789/uploads/reviews
```

업로드된 이미지는 `/api/uploads/reviews/{filename}` 경로로 서빙됩니다.

### DB 마이그레이션

`database/reviews.sql`을 실행하면 `image_url` 컬럼이 추가됩니다. 기존 테이블이 있는 경우:

```sql
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL AFTER image_data;
```
