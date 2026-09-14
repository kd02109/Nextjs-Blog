# 블로그 작성

- NEXTJS, Contentlayer, typescript, react, tailwindcss를 활용해서 기본적인 블로그를 만들었습니다.
- 해당 블로그는 serverless 블로그로서 개발 관련 글을 포스팅 하기 위해서 만들어 졌습니다.
- 블로그에 관한 자세한 글들은 [블로그](https://nextjs-blog-kd02109.vercel.app/projects/nextjs-blog)에서 확인할 수 있습니다.

## 로컬 환경

Node.js 24와 lockfile 기반 설치를 사용합니다.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 조회수 읽기 기능을 초기화할 때 필요합니다. `NEXT_EMAIL_ID`와 `NEXT_EMAIL_PASSWORD`는 둘을 함께 설정해야 하며, 문의 메일을 실제로 전송할 때만 필수입니다. 조회수 쓰기는 서버 전용 `SUPABASE_SERVICE_ROLE_KEY`, 32자 이상의 `VIEW_COUNT_HASH_SECRET`, Vercel이 제공하는 `VERCEL=1`과 신뢰 가능한 요청 헤더가 모두 있어야 동작합니다. 서버 전용 값은 브라우저에서 접근할 수 있는 `NEXT_PUBLIC_` 이름으로 만들지 않습니다.

`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_DEV_URL`, `NEXT_PUBLIC_URL`은 선택 사항입니다. 저장소에는 `.env.example`의 명백한 로컬 placeholder와 빈 값만 커밋하고 실제 값은 로컬 환경 또는 배포 환경의 secret store에 둡니다.

## 검증과 CI

```bash
npm run check
npm run build
npm audit --omit=dev --audit-level=high
```

`npm run check`는 Velite 콘텐츠를 한 번 생성한 뒤 lint, TypeScript, unit test를 순서대로 실행합니다. GitHub Actions는 Node.js 24에서 같은 검증과 기본 production build를 수행하고, high 이상 production dependency audit 및 gitleaks 이력 검사를 별도 job으로 실행합니다. 모든 `uses:` 의존성은 검토한 40자리 commit SHA에 고정하고 사람이 읽을 수 있는 version 주석을 둡니다. Dependabot은 npm과 GitHub Actions의 minor/patch를 주간 그룹으로 제안하며 고정된 SHA도 갱신하고, major 업데이트는 개별 PR로 남깁니다.

## 보안 응답 헤더

모든 경로에 MIME sniffing 방지, strict referrer policy, 카메라·마이크·위치 권한 차단, 2년 HSTS와 framing 차단을 적용합니다. CSP는 기능을 차단하지 않는 `Content-Security-Policy-Report-Only` 단계입니다. `Reporting-Endpoints`/`report-to`와 호환성용 `report-uri`가 같은 origin의 `POST /api/csp-report`로 violation을 보내며, collector는 허용한 최소 필드만 정리해 Vercel Runtime Logs에 기록합니다. 요청 헤더·쿠키·원문 body·referrer·script sample·original policy는 기록하지 않고 URL의 credential, query, fragment를 제거합니다. 지원 media type이 아니거나 schema가 잘못된 요청은 거부하며, 선언 크기와 실제 stream 모두 16 KiB로 제한합니다.

Vercel Runtime Logs를 이 저장소가 소유한 보존·점검 채널로 사용합니다. 7일 관찰을 시작하기 전에 프로젝트 운영자가 로그 접근 권한, 검색 가능 여부, 연속 7일 이상의 보존 기간을 확인해야 합니다. 현재 Vercel plan의 기본 보존 기간이 부족하면 조직이 관리하는 Vercel Log Drain을 먼저 구성해야 하며, 그 확인 전의 배포 기간은 7일 관찰에 포함하지 않습니다. 이 원격 설정은 저장소 변경 범위 밖입니다. 조건을 충족한 뒤 preview/production violation을 최소 7일 동안 점검하고 별도 승인으로 enforcement를 검토합니다.

현재 policy의 외부 출처는 Giscus, Google Analytics, Supabase API, 실제 글 이미지 호스트로 제한했습니다. 다음 wildcard 또는 넓은 directive는 런타임 호환성 때문에 report-only 관찰 기간에만 유지합니다.

- `*.supabase.co`: 배포마다 달라지는 Supabase project host의 HTTPS/WSS 읽기 요청
- `*.google-analytics.com`과 `*.analytics.google.com`: 지역별 Analytics 수집 endpoint
- `*.githubusercontent.com`: 글에 포함된 GitHub asset redirect host
- `script-src/style-src 'unsafe-inline'`: 현재 Next.js, theme 초기화, GA inline bootstrap과의 위반 noise를 줄이기 위한 임시 허용; enforce 전 nonce 또는 hash 전환 필요
