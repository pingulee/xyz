# XYZ

롤 대리·롤 듀오·롤 계정 서비스 사이트입니다. Next.js App Router와 MySQL을
사용합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

프로덕션 검증은 `npm run lint`와 `npm run build`로 진행합니다.

## Hostinger 배포 설정

### 환경 변수 (.env.local 또는 Hostinger 환경 변수 패널)

```
ADMIN_PASSWORD=your_admin_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_db_user
MYSQL_PASSWORD=your_db_password
MYSQL_DATABASE=your_db_name
UPLOAD_BASE_DIR=/home/username/public_html/uploads
```

초기 DB 구성은 `database/review.sql`, `database/lineups.sql`,
`database/champions.sql`을 순서대로 실행합니다.

### 라인업 이미지 업로드 설정

라인업 이미지는 Hostinger 서버 로컬 디스크에 저장됩니다.

- `UPLOAD_BASE_DIR` 미설정 시 기본 경로: `{프로젝트 루트}/uploads`
- 디렉터리는 앱 시작 시 자동 생성됩니다.
- Hostinger에서는 웹 루트 외부 경로를 권장합니다.

**Hostinger 설정 예시:**

```
UPLOAD_BASE_DIR=/home/u123456789/uploads
```

업로드된 이미지는 `/uploads/lineups/{filename}` 경로로 서빙됩니다.
