# Next.js Blog Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 감사에서 확인된 보안 결함과 유지보수 위험을 우선순위대로 제거하고, 새 체크아웃에서도 동일하게 검증되는 Next.js 블로그를 만든다.

**Architecture:** 공개 콘텐츠는 Velite가 빌드 시 생성하고 Next.js App Router가 읽는다. 외부 입력은 Route Handler에서 검증한 뒤 서버 전용 모듈로 전달한다. Supabase 조회는 공개 클라이언트에 남길 수 있지만 쓰기는 서버 Route Handler와 제한된 데이터베이스 함수만 통과하게 한다. 환경변수와 품질 검사는 단일 `npm run check` 계약으로 통합한다.

**Tech Stack:** Node.js 24, Next.js 16.3.5, React 19.3.0, TypeScript, Velite 0.4.0, Supabase JS 2.116.0, Nodemailer 10.0.9, Vitest 5, Playwright 1.63, ESLint 10

**Spec:** [`2026-09-14-nextjs-blog-security-modernization.md`](./2026-09-14-nextjs-blog-security-modernization.md)

## 실행 원칙

- 작업 순서는 PR 1부터 PR 6까지 고정한다. 앞 단계의 검증이 통과하지 않으면 다음 대규모 변경으로 넘어가지 않는다.
- 각 동작 변경은 실패 테스트를 먼저 추가하고, 실패 원인을 확인한 뒤 최소 구현으로 통과시킨다.
- 기존 73개 MDX 문서의 URL, frontmatter, 정렬, 렌더링 결과를 유지한다.
- 비밀 값은 코드, 테스트 fixture, 로그, 문서에 넣지 않는다.
- 원격 Supabase 변경은 migration 검토와 백업 확인 전에는 적용하지 않는다.
- 각 PR은 자체적으로 되돌릴 수 있어야 하며 보안 수정과 디자인 변경을 섞지 않는다.

## 완료 기준

- [ ] HTML이 포함된 문의도 메일의 텍스트 본문으로만 전달된다.
- [ ] 익명 브라우저 클라이언트가 `views` 테이블을 직접 변경하거나 `increment_view` 함수를 호출할 수 없다.
- [ ] Next.js 16.3.5, React 19.3.0, Node.js 24 환경에서 73개 문서가 생성된다.
- [ ] 깨끗한 체크아웃에서 `npm ci && npm run check && npm run build`가 통과한다.
- [ ] `npm audit --omit=dev`의 critical/high가 0이거나, 남은 항목마다 도달 가능성·완화·재검토 날짜가 문서화된다.
- [ ] CI, Dependabot, 비밀 스캔이 기본 브랜치와 PR에서 작동한다.

---

## PR 1 — P0: 문의 메일 HTML 주입 제거 및 최소 테스트 기반 구축

**Files:**

- Create: `src/server/contact-mail.ts`
- Modify: `src/app/api/email/route.ts`
- Modify: `src/types/email.ts`
- Delete after migration: `src/server/nodeMail.ts`
- Create: `src/app/api/email/route.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Contract:** `POST /api/email`은 `{ from, subject, message }` JSON을 받고 성공 시 200, 형식 오류 시 400, 메일 전송 실패 시 500 JSON을 반환한다. `subject`는 trim 후 1~120자, `message`는 1~5,000자, `from`은 유효한 이메일이어야 한다.

- [ ] **1. 테스트 도구와 명령을 추가한다.**

  ```bash
  npm install --save-dev vitest@5.0.0
  ```

  `package.json`에 다음 스크립트를 추가한다.

  ```json
  {
    "scripts": {
      "test": "vitest run",
      "test:watch": "vitest"
    }
  }
  ```

- [ ] **2. 악성 마크업과 입력 제한에 대한 실패 테스트를 작성한다.**

  `nodemailer.createTransport().sendMail`을 mock하고 다음을 검증한다.

  - `<img src="https://attacker.example/pixel">`가 `html` 필드로 전달되지 않는다.
  - `text`에는 제목, 메시지, 보낸 사람 주소가 일반 문자열로 포함된다.
  - `replyTo`는 검증된 방문자 이메일이고 `from`/`to`는 운영자 주소다.
  - 120자를 넘는 제목, 5,000자를 넘는 메시지, 잘못된 이메일은 400이다.
  - 잘못된 JSON은 400이고 SMTP 오류는 내부 상세를 노출하지 않는 500이다.

  ```bash
  npm test -- src/app/api/email/route.test.ts
  ```

  Expected: 현재 구현의 `html` 사용과 길이 제한 부재로 실패한다.

- [ ] **3. 서버 전용 메일 모듈을 구현한다.**

  `src/server/contact-mail.ts`에 `import 'server-only'`를 선언한다. `sendContactMail(form)`은 `html`과 사용자 제어 `from`을 사용하지 않고 다음 형태로 전송한다.

  ```ts
  await transporter.sendMail({
    to: env.NEXT_EMAIL_ID,
    from: env.NEXT_EMAIL_ID,
    replyTo: form.from,
    subject: `[NEXTJS BLOG] ${form.subject}`,
    text: `${form.message}\n\n보낸이: ${form.from}`,
  });
  ```

- [ ] **4. Route Handler의 입력 경계를 고정한다.**

  스키마 검증 결과만 `sendContactMail`에 전달하고 `NextResponse.json`으로 응답한다. catch 블록은 오류 객체와 환경변수 값을 응답에 포함하지 않는다. 함수명 오타가 있는 `senaEmail` 호출을 제거한다.

- [ ] **5. 회귀 검증 후 커밋한다.**

  ```bash
  npm test -- src/app/api/email/route.test.ts
  npm run lint
  npx tsc --noEmit
  git diff --check
  git add package.json package-lock.json vitest.config.ts src/app/api/email/route.ts src/app/api/email/route.test.ts src/server/contact-mail.ts src/server/nodeMail.ts src/types/email.ts
  git commit -m "fix: harden contact email handling"
  ```

---

## PR 2 — P0: Contentlayer를 Velite로 교체

**Files:**

- Create: `velite.config.ts`
- Create: `src/lib/content.ts`
- Modify: `next.config.js`
- Modify: `tsconfig.json`
- Modify: content imports under `src/`
- Modify: `package.json`
- Modify: `package-lock.json`
- Delete: `contentlayer.config.ts`

**Contract:** `posts/**/*.mdx` 73개가 기존 slug, date, description, tags, image, body code를 보존한 타입 안전 컬렉션으로 생성된다.

- [ ] **1. 현재 콘텐츠의 골든 테스트를 작성한다.**

  생성된 문서 수가 73개인지, 알려진 글 3개의 slug/frontmatter가 유지되는지, 날짜 역순 정렬과 태그 집계가 동일한지 검사하는 `src/lib/content.test.ts`를 추가한다.

  ```bash
  npm test -- src/lib/content.test.ts
  ```

- [ ] **2. Velite를 설치하고 기존 생성기를 제거한다.**

  ```bash
  npm install --save-dev velite@0.4.0
  npm uninstall contentlayer next-contentlayer
  ```

- [ ] **3. `velite.config.ts`에 문서 스키마를 완전히 옮긴다.**

  기존 필수/선택 frontmatter, 계산된 slug, MDX 플러그인 순서를 명시한다. `rehype-pretty-code`와 `rehype-highlight`는 중복 적용하지 않고 실제 출력이 보존되는 하나만 선택한다.

- [ ] **4. 앱의 콘텐츠 접근을 한 모듈로 모은다.**

  `src/lib/content.ts`가 생성 컬렉션을 import하고 `getAllPosts`, `getPostBySlug`, `getAllTags`를 제공하게 한다. 컴포넌트와 페이지는 생성 경로를 직접 import하지 않는다. 존재하지 않는 slug는 `notFound()`로 종료한다.

- [ ] **5. 개발·빌드 명령에 생성을 명시한다.**

  ```json
  {
    "scripts": {
      "content:build": "velite",
      "content:dev": "velite --watch",
      "typecheck": "npm run content:build && tsc --noEmit"
    }
  }
  ```

  Next 설정에서 `withContentlayer`를 제거하고 Velite 산출물 alias만 남긴다.

- [ ] **6. 콘텐츠 동등성을 검증하고 커밋한다.**

  ```bash
  npm run content:build
  npm test -- src/lib/content.test.ts
  npm run typecheck
  npm run lint
  git diff --check
  git add package.json package-lock.json next.config.js tsconfig.json velite.config.ts src contentlayer.config.ts
  git commit -m "refactor: replace contentlayer with velite"
  ```

---

## PR 3 — P0: Node, Next.js, React 및 핵심 패키지 업그레이드

**Files:**

- Create: `.nvmrc`
- Create: `eslint.config.mjs`
- Create: `playwright.config.ts`
- Create: `tests/e2e/public-routes.spec.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `next.config.js`
- Modify: TypeScript/React compatibility sites under `src/`
- Delete: `.eslintrc.json`

**Target versions:** Node 24.x, Next 16.3.5, React/React DOM 19.3.0, Nodemailer 10.0.9, Supabase JS 2.116.0, PostCSS 8.5.28, ESLint/ESLint config 10.10.0/16.3.5.

- [ ] **1. 런타임 기준을 먼저 고정한다.**

  `.nvmrc`에 `24`를 기록하고 `package.json#engines.node`를 `>=24 <25`로 설정한다. 로컬과 CI가 같은 major를 사용해야 한다.

- [ ] **2. 공개 경로 smoke test를 먼저 작성한다.**

  Playwright로 `/`, `/blog`, `/projects`, 알려진 글 상세, 잘못된 글 slug를 검사한다. 페이지가 5xx 없이 열리고 핵심 제목이 보이며 잘못된 slug는 404인지 확인한다.

  ```bash
  npm install --save-dev @playwright/test@1.63.0
  npx playwright install chromium
  npm run test:e2e
  ```

- [ ] **3. 공식 codemod를 dry-run으로 확인한 뒤 핵심 패키지를 고정 버전으로 올린다.**

  ```bash
  npx @next/codemod@latest upgrade 16.3.5 --dry
  npm install next@16.3.5 react@19.3.0 react-dom@19.3.0 nodemailer@10.0.9 @supabase/supabase-js@2.116.0 postcss@8.5.28
  npm install --save-dev eslint@10.10.0 eslint-config-next@16.3.5 @types/react@latest @types/react-dom@latest @types/node@latest typescript@latest
  ```

- [ ] **4. Next/React 호환 변경을 적용한다.**

  빌드 오류를 한 번에 하나씩 수정한다. 비동기 route params/searchParams, metadata, Image, Link, server/client 경계가 변경된 지점을 우선 검사한다. `next lint` 스크립트는 `eslint .`로 바꾸고 flat config를 사용한다.

- [ ] **5. 이미지 원격 허용 범위를 축소한다.**

  `images.domains`를 제거하고 실제 콘텐츠에서 사용 중인 HTTPS host/path만 `images.remotePatterns`에 명시한다. 필요하지 않은 wildcard hostname은 허용하지 않는다.

- [ ] **6. 전체 검증 후 커밋한다.**

  ```bash
  npm run content:build
  npm run lint
  npm run typecheck
  npm test
  npm run test:e2e
  npm run build
  npm audit --omit=dev
  git diff --check
  git add .nvmrc eslint.config.mjs playwright.config.ts tests package.json package-lock.json next.config.js src .eslintrc.json
  git commit -m "chore: upgrade next react and security dependencies"
  ```

---

## PR 4 — P1: Supabase 조회수 쓰기 경계와 DB 권한 고정

**Files:**

- Create: `src/lib/supabase/browser.ts`
- Create: `src/server/supabase.ts`
- Create: `src/app/api/views/[slug]/route.ts`
- Create: `src/app/api/views/[slug]/route.test.ts`
- Modify: `src/components/PostCard.tsx`
- Modify: components/pages that call `supabaseIncrement` or `supabaseViewCount`
- Delete after migration: `src/util/supabase.ts`
- Create: `supabase/migrations/202609140001_secure_views.sql`
- Create: `supabase/tests/views_rls.test.sql`
- Modify: `database.types.ts`

**Approval gate:** 배포 DB의 현재 schema, RLS policy, function owner, `SECURITY DEFINER`, `search_path`, anon/authenticated GRANT를 read-only로 캡처하고 백업 또는 PITR 상태를 확인한 뒤 migration을 적용한다.

- [ ] **1. 현재 원격 권한 상태를 기록한다.**

  Supabase Dashboard/CLI에서 `views` RLS와 `increment_view(text)` 정의 및 GRANT를 확인한다. 저장소 감사의 후보 위험이 실제 배포에도 존재하는지 판정하고 결과를 PR 본문에 남긴다.

- [ ] **2. 권한 테스트를 먼저 작성한다.**

  SQL 테스트는 다음을 검증한다.

  - anon/authenticated 역할의 직접 INSERT/UPDATE/DELETE가 거부된다.
  - 공개 조회가 제품 요구사항이라면 SELECT만 성공한다.
  - anon/authenticated 역할이 `increment_view`를 직접 실행할 수 없다.
  - 서버 역할을 통한 함수 호출은 지정 slug만 원자적으로 1 증가시킨다.

- [ ] **3. 저장소에 권한 migration을 추가한다.**

  migration은 RLS 활성화, 최소 SELECT policy, DML revoke, 함수 execute revoke를 명시한다. 함수가 `SECURITY DEFINER`를 필요로 하면 owner를 제한하고 `SET search_path = public, pg_temp`를 선언하며 schema-qualified table을 사용한다.

- [ ] **4. 애플리케이션의 읽기와 쓰기를 분리한다.**

  브라우저용 모듈은 공개 조회만 허용한다. 서버용 모듈은 `import 'server-only'`와 서버 credential을 사용한다. `POST /api/views/[slug]`는 slug 형식과 길이를 검증하고 동일 브라우저 중복 호출을 UX 최적화로만 다루며, 쿠키를 보안 경계로 설명하지 않는다.

- [ ] **5. Route Handler 테스트를 통과시킨다.**

  정상 slug 200, 잘못된 slug 400, DB 실패 500, 응답 내 내부 오류/credential 비노출을 검증한다.

  ```bash
  npm test -- 'src/app/api/views/[slug]/route.test.ts'
  npm run typecheck
  npm run lint
  ```

- [ ] **6. 로컬 DB에서 먼저 migration을 검증하고 승인 후 원격에 적용한다.**

  ```bash
  npx supabase db reset
  npx supabase test db
  npx supabase gen types typescript --local > /tmp/database.types.generated.ts
  ```

  생성 타입 diff를 검토해 `database.types.ts`에 반영한다. 원격 `db push`는 별도 사용자 승인과 백업 확인 후 실행한다.

- [ ] **7. 커밋한다.**

  ```bash
  git diff --check
  git add src/app/api/views src/lib/supabase src/server/supabase.ts src/components src/util/supabase.ts supabase database.types.ts
  git commit -m "fix: restrict supabase view mutations"
  ```

---

## PR 5 — P1/P2: 환경변수 계약, CI, 자동 보안 검사

**Files:**

- Create: `src/config/env.ts`
- Create: `.env.example`
- Modify: `.gitignore`
- Create: `.github/workflows/ci.yml`
- Create: `.github/dependabot.yml`
- Create: `.gitleaks.toml`
- Modify: `package.json`
- Modify: `README.md`
- Modify: modules reading `process.env` directly

- [ ] **1. 환경변수 검증 실패 테스트를 작성한다.**

  `src/config/env.test.ts`에서 누락된 `NEXT_PUBLIC_SUPABASE_URL`, 잘못된 URL, 불완전한 이메일 credential 조합이 시작 단계에서 명확한 오류를 내는지 검증한다. 실제 값은 사용하지 않는다.

- [ ] **2. Zod 기반 환경변수 계약을 구현한다.**

  ```bash
  npm install zod@4.6.5
  ```

  `src/config/env.ts`에서 공개/서버 변수를 분리한다. `NEXT_EMAIL_ID`와 `NEXT_EMAIL_PASSWORD`는 둘 다 있거나 둘 다 없어야 하며, 메일 route가 활성화될 때만 필수다. 클라이언트 번들에는 `NEXT_PUBLIC_` 값 외의 서버 변수가 노출되지 않아야 한다.

- [ ] **3. 저장소와 예제 환경 파일을 정리한다.**

  `.gitignore`는 `.env`, `.env.*`, `!.env.example`, `.gstack/`를 명시한다. `.env.example`에는 이름과 설명만 넣고 값은 빈 문자열 또는 명백한 로컬 placeholder로 둔다.

- [ ] **4. 단일 검증 명령을 만든다.**

  ```json
  {
    "scripts": {
      "check": "npm run content:build && npm run lint && npm run typecheck && npm test"
    }
  }
  ```

  `typecheck`가 이미 콘텐츠 생성을 수행한다면 `check`에서 중복 생성을 제거해 한 번만 실행한다.

- [ ] **5. CI와 자동 점검을 추가한다.**

  GitHub Actions는 Node 24, `npm ci`, `npm run check`, placeholder 환경변수를 사용한 `npm run build`, `npm audit --omit=dev --audit-level=high`, gitleaks를 실행한다. Dependabot은 npm과 GitHub Actions를 주 1회 열고 major 업데이트는 별도 PR로 제한한다.

- [ ] **6. 보안 헤더를 도입한다.**

  `next.config.js`의 `headers()`에 `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS를 추가한다. CSP는 먼저 `Content-Security-Policy-Report-Only`로 배포하여 Giscus, GA, 이미지/CDN 도메인을 관찰한 뒤 별도 승인으로 enforce한다.

- [ ] **7. 검증 후 커밋한다.**

  ```bash
  npm run check
  npm run build
  npm audit --omit=dev --audit-level=high
  git diff --check
  git add src/config .env.example .gitignore .github .gitleaks.toml package.json package-lock.json README.md next.config.js src
  git commit -m "ci: enforce reproducible security checks"
  ```

---

## PR 6 — P2/P3: 의존성·코드 구조·SEO 정리

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/` imports and shared utilities
- Create or modify: `src/app/robots.ts`
- Create or modify: `src/app/sitemap.ts`
- Delete: `next-sitemap.config.js`
- Modify: metadata definitions under `src/app/`
- Modify: `README.md`

- [ ] **1. Knip을 설치하고 제거 후보를 증거화한다.**

  ```bash
  npm install --save-dev knip@6.35.1
  npx knip
  ```

  후보: `react-markdown`, `react-syntax-highlighter`, `@types/react-syntax-highlighter`, `next-sitemap`, `type-fest`, 직접 `shiki`, `bufferutil`, `utf-8-validate`, `next-seo`, `rehype-highlight`. Knip 결과와 `rg` import 검색이 모두 미사용을 가리키는 패키지만 제거한다.

- [ ] **2. 의존성 분류를 바로잡는다.**

  TypeScript, ESLint, PostCSS, Tailwind, Velite, Supabase CLI, `@types/*`는 `devDependencies`에 둔다. 런타임 import인 `clsx`, `tailwind-merge`는 `dependencies`에 둔다.

- [ ] **3. 콘텐츠·Supabase 접근 경계를 강제한다.**

  페이지와 컴포넌트가 `src/lib/content.ts`, `src/lib/supabase/browser.ts`, `src/server/supabase.ts` 이외의 생성물/DB client를 직접 import하지 않는지 `rg`와 ESLint 제한 import 규칙으로 검증한다.

- [ ] **4. SEO 생성 경로와 사이트 URL을 하나로 만든다.**

  canonical base를 `https://sonblog.vercel.app/` 하나로 정하고 App Router의 `robots.ts`, `sitemap.ts`, `Metadata`를 사용한다. `next-sitemap`과 `next-seo`를 제거하고 73개 글 URL이 sitemap에 포함되는 테스트를 추가한다.

- [ ] **5. 자산 최적화는 측정 기반으로 별도 커밋한다.**

  1MB 이상 이미지/GIF 목록을 만든 뒤 실제 페이지에서 쓰이는 것만 WebP/AVIF 또는 비디오로 변환한다. URL이나 콘텐츠 의미가 달라지는 변경은 하지 않는다.

- [ ] **6. 최종 검증과 감사 재실행 후 커밋한다.**

  ```bash
  npx knip
  npm run check
  npm run test:e2e
  npm run build
  npm audit --omit=dev --audit-level=high
  git diff --check
  git add package.json package-lock.json src next-sitemap.config.js README.md
  git commit -m "chore: remove dead dependencies and unify seo"
  ```

---

## 배포 순서와 롤백

1. PR 1은 즉시 배포하고 문의 API의 4xx/5xx 비율과 실제 메일 형식을 확인한다. 문제 시 새 메일 모듈만 되돌린다.
2. PR 2와 PR 3은 preview 배포에서 73개 글 URL과 핵심 페이지를 비교한 뒤 연속으로 배포한다. Contentlayer 제거 커밋과 Next 업그레이드 커밋을 분리해 롤백 지점을 보존한다.
3. PR 4는 DB migration 적용 직전 백업/PITR를 확인한다. 앱 배포 전 revoke를 적용하면 조회수 쓰기가 중단되므로 서버 route 배포와 migration 순서를 preview에서 리허설한다.
4. PR 5의 CSP는 report-only로 최소 7일 관찰한 뒤 위반 원인을 분류하고 enforce 여부를 결정한다.
5. PR 6은 기능 영향이 낮은 제거 작업이지만 sitemap과 metadata는 검색 노출에 영향을 주므로 배포 후 생성 파일을 확인한다.

## 최종 인수 체크리스트

- [ ] `git grep`과 gitleaks에서 실제 credential이 발견되지 않는다.
- [ ] 문의 API의 악성 HTML, 과대 입력, 잘못된 JSON, SMTP 실패 테스트가 통과한다.
- [ ] Supabase anon DML/RPC 거부 테스트와 서버 증가 테스트가 통과한다.
- [ ] 홈, 글 목록, 프로젝트, 태그, 글 상세, 404 E2E가 통과한다.
- [ ] sitemap에 73개 글 URL이 들어가고 canonical host가 하나다.
- [ ] `npm run check`, `npm run test:e2e`, `npm run build`가 Node 24에서 통과한다.
- [ ] production audit의 critical/high가 0이거나 승인된 예외 문서가 있다.
- [ ] preview와 production 환경변수 목록이 `.env.example` 계약과 일치한다.
- [ ] 배포 후 문의 메일, 조회수, Giscus, GA, 이미지 로딩을 수동 smoke test한다.

## 명시적으로 이번 범위에서 제외

- Tailwind CSS 4 전환은 보안 차단 항목이 아니므로 별도 계획으로 진행한다.
- CAPTCHA/Turnstile은 실제 문의 스팸 지표를 수집한 뒤 도입한다. 우선 길이 제한과 관측 가능성을 적용한다.
- 디자인 개편, 콘텐츠 문구 변경, 댓글 공급자 변경은 이번 보안·현대화 계획에 포함하지 않는다.
