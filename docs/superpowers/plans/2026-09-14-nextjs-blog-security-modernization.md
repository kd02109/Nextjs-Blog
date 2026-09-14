# Next.js Blog Security and Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 확인된 보안 결함을 제거하고, 지원 종료된 프레임워크와 유지보수 중단 콘텐츠 파이프라인을 교체하며, 새 체크아웃에서도 재현 가능한 검증 체계를 만든다.

**Architecture:** 공개 콘텐츠는 빌드 타임에 타입 안전하게 생성하고, 브라우저가 Supabase 쓰기 권한을 직접 갖지 않도록 읽기와 쓰기 경계를 분리한다. 외부 입력은 Route Handler에서 검증·정규화한 뒤 텍스트로만 메일에 전달하며, 모든 변경은 작은 보안/인프라 PR로 나눠 검증한다.

**Tech Stack:** Next.js App Router, React, TypeScript, MDX, Tailwind CSS, Supabase, Nodemailer, Vercel

**Spec:** `docs/superpowers/plans/2026-09-14-nextjs-blog-security-modernization.md`의 감사 결과와 우선순위

## Global Constraints

- 감사 기준일은 2026-09-14이며 버전 판단은 npm registry와 공식 프로젝트 문서를 기준으로 한다.
- 기존 73개 MDX 문서의 URL, frontmatter, 렌더링 결과를 유지한다.
- 목표 런타임은 Node.js 24.x로 고정하고 `package.json#engines`, `.nvmrc`, CI를 일치시킨다.
- 목표 핵심 버전은 Next.js 16.3.5, React 19.3.0, Nodemailer 10.0.9, `@supabase/supabase-js` 2.116.0이다.
- 보안 수정과 대규모 UI 변경을 같은 PR에 섞지 않는다.
- 각 작업은 실패 테스트 작성, 실패 확인, 최소 구현, 전체 검증 순서로 진행한다.
- 비밀 값은 저장소, 로그, 테스트 fixture, 생성 문서에 기록하지 않는다.

---

## 1. 결론부터 보는 우선순위

| 우선순위 | 권장 기한 | 항목 | 판단 | 완료 조건 |
|---|---:|---|---|---|
| P0 | 즉시 시작, 1~3일 | Next.js 13.4.12 및 Contentlayer 교체 | Next 13은 지원 종료 상태이며 `npm audit`이 직접 런타임 의존성 `next`를 critical로 분류한다. 현재 Vercel 배포의 구체적 RCE는 확인되지 않았지만 방치 비용이 계속 증가한다. | Next 16.3.5/React 19.3, 73개 문서 생성, lint/typecheck/test/build 통과 |
| P0 | 당일 | 문의 메일 HTML 주입 제거 | 방문자 입력이 운영자에게 발송되는 HTML 본문에 이스케이프 없이 들어가는 경로가 독립 검증됐다. | 텍스트 전용 메일, 길이 제한, 악성 HTML 회귀 테스트 통과 |
| P1 | 1주 이내 | Supabase 조회수 권한 경계 재설계 | 익명 키와 클라이언트 쿠키만으로 RPC 호출을 제어한다. 실제 RLS/GRANT/함수 정의가 저장소에 없어 배포 권한을 감사할 수 없다. | 마이그레이션에 RLS/GRANT/함수 정의 포함, 익명 쓰기 거부 테스트 통과 |
| P1 | 1주 이내 | 재현 가능한 CI·환경변수 검증 | 테스트가 0개이고, 깨끗한 상태의 `tsc`는 생성물 부재로 실패하며, 빌드는 Supabase 환경변수 부재로 실패했다. | `npm ci` 이후 단일 `npm run check`가 CI와 로컬에서 동일하게 동작 |
| P1 | 1주 이내 | Nodemailer/Supabase/PostCSS/CLI 보안 업데이트 | 현재 코드에서 각 CVE의 구체적 도달 경로는 대부분 차단됐지만 오래된 직접 의존성이 공급망 노이즈와 위험을 키운다. | 런타임/빌드 의존성 분류 정리, `npm audit` 고·치명 항목 0 또는 예외 근거 문서화 |
| P2 | 2~3주 | 보안 헤더·비밀 스캔·자동 업데이트 | CSP와 자동 의존성 점검, 비밀 스캔 설정이 없다. 이는 확정 취약점이 아니라 예방 통제의 공백이다. | CSP report-only 검증 후 적용, Dependabot, gitleaks CI 추가 |
| P2 | 2~3주 | 서버/클라이언트·콘텐츠 구조 정리 | 하나의 Supabase 모듈이 서버와 브라우저에 공유되고 조회수 증가가 여러 컴포넌트에 중복된다. | server/client 모듈 분리, 조회수 쓰기 단일 경로, 잘못된 slug는 404 |
| P3 | 여유 시 | 패키지·SEO·자산 정리 | 미사용 패키지, 중복 sitemap, 두 개의 사이트 URL, 4MB GIF와 잘못된 이름이 유지비를 높인다. | 미사용 직접 의존성 제거, canonical URL 단일화, 주요 이미지 최적화 |

## 2. 감사 범위와 근거

### 적용한 절차

- gstack `cso --comprehensive`에 해당하는 아키텍처, 공격 표면, 비밀 이력, 공급망, OWASP, STRIDE, 데이터 분류 절차
- gstack `health`의 타입 검사, 린트, 테스트, 미사용 코드, 셸 검사 탐지 및 점수화
- superpowers `writing-plans`의 파일 단위 실행 계획
- superpowers `verification-before-completion`의 최신 명령 재실행 원칙
- 보안 후보별 독립 검증: 메일 API, Supabase 권한, 의존성 도달 경로

### 실행 증거

| 검사 | 결과 | 해석 |
|---|---|---|
| `npm audit --json` | 63개 패키지 노드: critical 3, high 20, moderate 35, low 5 | 합계는 실제 앱 도달 가능성과 다르므로 개별 경로를 재검증했다. |
| `npm audit --omit=dev --json` | 59개 패키지 노드: critical 2, high 18, moderate 34, low 5 | 빌드 도구가 `dependencies`에 섞여 있어 production 집계가 부풀려진다. |
| `npm run lint` | 성공, 경고/오류 0 | 현재 ESLint 범위에서는 깨끗하다. |
| 최초 `npx tsc --noEmit` | 실패, 46개 오류 | `.contentlayer/generated`가 없는 깨끗한 상태에서 재현된다. |
| Contentlayer 생성 후 `npx tsc --noEmit` | 성공 | 타입 오류가 아니라 사전 생성 단계가 명령에 표현되지 않은 문제다. |
| `npm run build` | 실패 | 네트워크 허용 후에도 `supabaseUrl is required`로 page data 수집 실패했다. |
| 테스트 탐지 | 건너뜀 | `test` 스크립트와 테스트 파일이 모두 없다. |
| dead-code 탐지 | 건너뜀 | Knip이 설치되어 있지 않다. |
| 셸 검사 | 건너뜀 | 저장소 소유 셸 스크립트가 없다. |
| 비밀 패턴/이력 | 현재 실제 키 발견 없음 | 환경변수 이름이 들어간 커밋은 있었지만 값 노출 증거는 없었다. `.env` 전체는 ignore되지 않는다. |

gstack 원본 보고서가 저장된 `.gstack/`도 현재 ignore되지 않는다. 보고서를 로컬 증적으로만 사용할 경우 `.gitignore`에 `.gstack/`를 추가하고, 팀과 공유할 경우 민감 정보 제거를 검토한 Markdown 요약만 추적한다.

### Health 대시보드

| 범주 | 도구 | 점수 | 상태 | 세부 |
|---|---|---:|---|---|
| Type check | `npx tsc --noEmit` | 4/10 | NEEDS WORK | 최초 46개 오류, 생성 후 0개 |
| Lint | `npm run lint` | 10/10 | CLEAN | 경고/오류 0 |
| Tests | 없음 | N/A | SKIPPED | 테스트 스크립트 없음 |
| Dead code | Knip 없음 | N/A | SKIPPED | 도구 없음 |
| Shell lint | 대상 없음 | N/A | SKIPPED | 저장소 셸 파일 없음 |

가용 범주의 가중치를 재분배한 점수는 **6.7/10**이다. 테스트·빌드가 점수에 포함되지 않아 이 수치를 배포 준비도로 해석하면 안 된다.

## 3. 아키텍처와 공격 표면

### 현재 구조

- Next.js 13 App Router가 `posts/**/*.mdx` 73개를 Contentlayer로 빌드한다.
- 공개 페이지 8개가 블로그, 프로젝트, 태그, 연락처를 제공한다.
- 공개 API는 `POST /api/email` 1개이며 인증 없이 Gmail SMTP를 호출한다.
- 조회수는 브라우저와 Server Component가 공용 Supabase anon client로 `views` 테이블과 `increment_view` RPC를 호출한다.
- 외부 신뢰 경계는 Gmail, Supabase, Giscus, Google Analytics, 외부 이미지 호스트다.
- GitHub Actions, 컨테이너, IaC, 저장소 내 AI 스킬은 없다. 배포 대상은 README상 Vercel이다.

### 공격 표면 수치

| 구분 | 수 |
|---|---:|
| 공개 페이지 | 8 |
| 인증/관리자 페이지 | 0 |
| 공개 API Route Handler | 1 |
| 파일 업로드 | 0 |
| Webhook/백그라운드 작업/WebSocket 채널 | 0 |
| 외부 서비스 통합 | 5 |
| CI/CD workflow | 0 |
| Docker/IaC | 0 |
| Supabase migration | 0 |

## 4. 보안 발견사항

### F-01. 지원 종료 Next.js와 활성 보안 권고 — P0

- **Severity:** 공급망 기준 CRITICAL, 확인된 앱 영향은 MEDIUM
- **Confidence:** 9/10
- **Status:** 의존성 상태 VERIFIED, 현재 Vercel exploit UNVERIFIED
- **Evidence:** `package.json:34`의 `"next": "13.4.12"`, `package-lock.json`의 동일 고정 버전, `next.config.js:6`의 광범위한 이미지 도메인 허용
- **Exploit scenario:** 자체 호스팅 경로에서는 공격자가 허용된 사용자 콘텐츠 이미지 호스트에 조작된 파일을 올리고 `/_next/image` URL을 피해자에게 전달해 임의 콘텐츠 다운로드/피싱을 유도할 수 있다. 확인된 Vercel 배포는 해당 이미지 CVE에 플랫폼 완화가 적용되므로 라이브 사이트가 같은 방식으로 노출됐다고 단정하지 않는다.
- **Impact:** 지원 종료 프레임워크의 새 취약점이 패치되지 않고, 배포 방식을 바꾸면 이미 알려진 공격면이 즉시 살아날 수 있다.
- **Action:** Contentlayer 교체를 선행한 뒤 Next 16.3.5와 React 19.3.0으로 이동하고 `images.remotePatterns`를 경로 단위로 좁힌다. npm이 제시하는 13.5.11은 후속 권고 범위에 남으므로 최종 목표로 사용하지 않는다.

### F-02. 방문자 입력의 운영자 HTML 메일 주입 — P0

- **Severity:** MEDIUM
- **Confidence:** 8/10
- **Status:** VERIFIED
- **Evidence:** `src/app/api/email/route.ts:13,20`, `src/server/nodeMail.ts:18,21-25`
- **Motivating code:** `return senaEmail(text)`와 `<div>${data.message}</div>`
- **Exploit scenario:** 공격자가 링크·이미지·가짜 로그인 안내가 포함된 HTML을 문의 API에 전송한다. 서버는 고정된 운영자 Gmail 주소를 발신자처럼 사용해 그 마크업을 그대로 운영자 메일함에 전달한다.
- **Impact:** 운영자 대상 피싱·콘텐츠 위장과 외부 이미지 콜백이 가능하다. open relay, SMTP 헤더 주입, 메일 클라이언트 코드 실행으로 과장해서는 안 된다.
- **Action:** 사용자 콘텐츠를 Nodemailer `text`로만 전송하고 `replyTo`만 검증된 주소로 설정한다. subject 120자, message 5,000자 제한과 악성 HTML 회귀 테스트를 추가한다.

### F-03. Supabase 익명 쓰기 권한을 저장소에서 검증할 수 없음 — P1

- **Severity:** MEDIUM 후보
- **Confidence:** 4/10
- **Status:** TENTATIVE / NEEDS REVIEW
- **Evidence:** `src/util/supabase.ts:10,21-24`, `src/components/PostCard.tsx:20-24`, `supabase/config.toml:9-13`; migration/RLS/GRANT/함수 정의는 0개
- **Exploit scenario:** 배포 DB가 anon에게 `increment_view` 실행을 허용한다면 공격자는 공개 URL과 anon key로 RPC를 반복 호출해 쿠키 없이 조회수를 임의 증가시킬 수 있다. 직접 upsert 권한까지 열려 있다면 임의 slug 행 생성도 가능하지만 이는 확인되지 않았다.
- **Impact:** 공개 참여 지표와 분석 데이터의 무결성이 손상된다. 기밀정보 유출이나 계정 탈취 증거는 없다.
- **Action:** Supabase Dashboard에서 함수 owner, `SECURITY DEFINER`, `search_path`, EXECUTE GRANT, `views` RLS를 즉시 확인한다. 모든 정의를 migration으로 가져오고 anon의 INSERT/UPDATE/DELETE 및 함수 EXECUTE를 회수한 뒤 서버 전용 경로로 이동한다.

### 보안 발견사항에서 제외한 항목

- Nodemailer 권고의 address/envelope/raw/OAuth 입력은 현재 코드에서 방문자가 제어하지 못한다. 버전은 올리되 해당 CVE가 지금 exploit 가능하다고 쓰지 않는다.
- PostCSS와 Contentlayer 취약 전이는 로컬 저장소 콘텐츠를 처리하는 빌드 경로다. 비밀을 가진 CI가 신뢰하지 않는 PR을 빌드하는 구성이 없어 현재 앱 취약점으로 승격하지 않는다.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 공개 가능한 publishable credential이다. service-role key가 아니라면 비밀 유출로 분류하지 않는다.
- Google Analytics의 `dangerouslySetInnerHTML` 값은 배포자가 설정한 환경변수에서만 온다. 외부 입력 경로가 없어 XSS 발견사항으로 올리지 않는다.

## 5. OWASP·STRIDE·데이터 분류 요약

### OWASP

- A01 접근 제어: 인증 기능은 없지만 Supabase anon 쓰기 권한이 원격 설정에 의존한다.
- A02 암호화 실패: 하드코딩된 비밀은 찾지 못했다. `.env` 전체 ignore와 비밀 스캔은 추가해야 한다.
- A03 주입: SQL/command/SSRF 경로는 찾지 못했다. 운영자 HTML 메일 주입은 확인됐다.
- A04 안전하지 않은 설계: 클라이언트 쿠키를 조회수 무결성 제어로 사용한다.
- A05 보안 설정 오류: CSP/HSTS 등 헤더가 코드로 관리되지 않으며 환경변수 계약도 런타임 검증되지 않는다.
- A06 오래된 구성요소: 가장 큰 위험이다. Next 13과 Contentlayer 0.3.4가 핵심 업그레이드를 막는다.
- A07 인증 실패: 앱 자체 인증 없음.
- A08 무결성 실패: 자동 의존성 업데이트, CI, 비밀 스캔이 없다.
- A09 로깅/모니터링: 인증·관리자 기능이 없어 직접 적용 항목은 적다. 메일 API의 성공/실패와 abuse 지표는 구조화해야 한다.
- A10 SSRF: 사용자 제어 URL이 서버 fetch로 이어지는 코드 경로는 찾지 못했다.

### STRIDE

| 컴포넌트 | 주요 위협 | 현재 판단 |
|---|---|---|
| 문의 API/Gmail | Spoofing, Tampering | 방문자가 운영자 메일의 표시 내용을 위장할 수 있음 |
| Supabase 조회수 | Tampering, Repudiation | 익명 호출과 쿠키 우회로 지표 조작 가능성, 감사 정의 부재 |
| MDX 빌드 | Tampering, Elevation | 저장소 작성자는 빌드 시 실행 가능한 MDX를 넣을 수 있으므로 PR 신뢰 경계가 중요 |
| 외부 분석/댓글 | Information Disclosure | GA/Giscus로 사용 데이터가 전달됨; 개인정보 고지와 동의 범위 확인 필요 |
| Next/Image | Tampering | 자체 호스팅 시 광범위한 외부 호스트가 이미지 최적화 경계를 넓힘 |

### 데이터 분류

- **Restricted:** 서버의 Gmail 비밀번호. 저장소에는 없고 환경변수로만 참조된다.
- **Confidential:** Supabase 프로젝트 설정과 서버 전용 credential. 현재 코드는 공개 anon key만 사용한다.
- **Personal data:** 문의자의 이메일·제목·메시지는 Gmail로 전달되며 저장/보존 정책은 코드에 없다. GA/Giscus가 방문 데이터와 댓글 계정을 처리한다.
- **Public:** MDX 글, 프로젝트 정보, 조회수 집계, 공개 프로필 링크.

## 6. 패키지 업그레이드 전략

### 핵심 패키지

| 패키지 | 설치 버전 | 2026-09-14 최신 | 권장 |
|---|---:|---:|---|
| `next` | 13.4.12 | 16.3.5 | Contentlayer 제거 후 16.3.5 |
| `react`, `react-dom` | 18.2.0 | 19.3.0 | Next 업그레이드와 함께 19.3.0 |
| `contentlayer`, `next-contentlayer` | 0.3.4 | 0.3.4, 2023년 이후 미유지 | Velite 0.4.0으로 교체 |
| `nodemailer` | 6.9.13 | 10.0.9 | 메일 수정 PR에서 10.0.9 |
| `@supabase/supabase-js` | 2.42.5 | 2.116.0 | Node 24 고정 후 2.116.0 |
| `supabase` CLI | 1.163.2 | 2.117.0 | migration 작업 전에 2.117.0 |
| `postcss` | 8.4.27 | 8.5.28 | Tailwind 현행 유지 PR에서 8.5.28 |
| `eslint` / `eslint-config-next` | 8.46.0 / 13.4.12 | 10.10.0 / 16.3.5 | flat config와 `eslint .`로 함께 전환 |
| `tailwindcss` | 3.3.3 | 4.3.3 | 보안 업그레이드와 분리해 마지막에 진행 |

### 제거 또는 재분류 후보

- 제거 검증: `react-markdown`, `react-syntax-highlighter`, `@types/react-syntax-highlighter`, `next-sitemap`, `type-fest`, 직접 `shiki`, `bufferutil`, `utf-8-validate`.
- 중복 제거: `rehype-highlight`와 `rehype-pretty-code` 중 하나만 유지한다. 현재 구성은 둘 다 같은 코드 블록을 처리한다.
- `next-seo`는 타입 하나에만 쓰이므로 Next `Metadata` 타입으로 바꾸고 제거한다.
- `@types/*`, TypeScript, ESLint, PostCSS, Tailwind, 콘텐츠 생성 도구는 `devDependencies`로 이동한다.
- 런타임에서 import하는 `clsx`, `tailwind-merge`는 `dependencies`로 이동한다.
- 자동 `npm audit fix --force`는 사용하지 않는다. 특히 Contentlayer를 0.0.28로 내리는 제안은 유지보수 해결책이 아니다.

## 7. 실행 계획

### Task 1: 문의 메일 입력을 텍스트 경계로 고정

**Files:**
- Modify: `src/app/api/email/route.ts`
- Modify: `src/server/nodeMail.ts`
- Modify: `src/types/email.ts`
- Create: `src/app/api/email/route.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `{ from: string; subject: string; message: string }` JSON
- Produces: 검증된 `Form`, 텍스트 전용 운영자 메일, 일관된 JSON 응답

- [ ] **Step 1: Vitest를 추가하고 HTML 입력 회귀 테스트 작성**

```ts
it('does not place visitor markup in an html mail body', async () => {
  await sendContactMail({
    from: 'visitor@example.com',
    subject: '<img src="https://attacker.example/pixel">',
    message: '<a href="https://attacker.example/login">sign in</a>',
  });

  expect(sendMail).toHaveBeenCalledWith(
    expect.objectContaining({
      replyTo: 'visitor@example.com',
      html: undefined,
      text: expect.stringContaining('<a href="https://attacker.example/login">'),
    }),
  );
});
```

- [ ] **Step 2: 테스트가 현재 HTML 메일 때문에 실패하는지 확인**

Run: `npm run test -- src/app/api/email/route.test.ts`

Expected: `html` 필드가 존재해 FAIL

- [ ] **Step 3: 스키마 길이 제한과 텍스트 전용 메일 구현**

```ts
const bodySchema = yup.object({
  from: yup.string().trim().email().max(254).required(),
  subject: yup.string().trim().max(120).required(),
  message: yup.string().trim().max(5000).required(),
});

export async function sendContactMail(data: Form) {
  return transporter.sendMail({
    to: process.env.NEXT_EMAIL_ID,
    from: process.env.NEXT_EMAIL_ID,
    replyTo: data.from,
    subject: `[NEXTJS BLOG] ${data.subject}`,
    text: `보낸이: ${data.from}\n\n${data.message}`,
  });
}
```

- [ ] **Step 4: 단위 테스트와 린트 통과 확인**

Run: `npm run test -- src/app/api/email/route.test.ts && npm run lint`

Expected: 모두 exit 0

- [ ] **Step 5: 독립 커밋 생성**

```bash
git add package.json package-lock.json src/app/api/email/route.ts src/app/api/email/route.test.ts src/server/nodeMail.ts src/types/email.ts
git commit -m "fix: prevent html injection in contact emails"
```

### Task 2: 콘텐츠 생성기를 Velite로 교체

**Files:**
- Create: `velite.config.ts`
- Create: `src/lib/content.ts`
- Modify: `next.config.js`
- Modify: `tsconfig.json`
- Modify: `sitemap.config.ts`
- Modify: content imports under `src/`
- Delete: `contentlayer.config.ts`
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: `posts/**/*.mdx`와 현재 frontmatter
- Produces: `allPosts: Post[]`, `Post` 타입, 컴파일된 MDX code, 기존 `url` 규칙

- [ ] **Step 1: 73개 문서와 URL snapshot을 고정하는 테스트 작성**

```ts
it('keeps every existing document and route', () => {
  expect(allPosts).toHaveLength(73);
  expect(allPosts.map(post => post.url)).toMatchSnapshot();
});
```

- [ ] **Step 2: Velite schema와 현재 URL transform 구현**

```ts
import { defineCollection, defineConfig, s } from 'velite';

const posts = defineCollection({
  name: 'Post',
  pattern: '**/*.mdx',
  schema: s.object({
    title: s.string(),
    date: s.isodate(),
    id: s.string(),
    tag: s.array(s.string()),
    brand: s.string(),
    description: s.string().optional(),
    carousel: s.boolean().optional(),
    body: s.mdx(),
    path: s.path(),
  }).transform(data => ({
    ...data,
    url: data.path.replace(/^project\//, ''),
  })),
});

export default defineConfig({ collections: { posts } });
```

- [ ] **Step 3: Contentlayer wrapper와 import를 제거하고 생성 명령 연결**

`package.json` scripts는 `content: "velite"`, `predev: "npm run content"`, `prebuild: "npm run content"`, `typecheck: "npm run content && tsc --noEmit"`를 갖게 한다.

- [ ] **Step 4: 문서 수, 타입, MDX 렌더링 검증**

Run: `npm run content && npm run test -- src/lib/content.test.ts && npm run typecheck`

Expected: 73개 문서, snapshot 일치, exit 0

- [ ] **Step 5: 콘텐츠 파이프라인 커밋 생성**

```bash
git add package.json package-lock.json next.config.js tsconfig.json sitemap.config.ts velite.config.ts src contentlayer.config.ts
git commit -m "refactor: replace unmaintained contentlayer pipeline"
```

### Task 3: Next.js 16 보안 기준선으로 이동

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `next.config.js`
- Modify: `.eslintrc.json`을 `eslint.config.mjs`로 대체
- Modify: dynamic route page files under `src/app/`
- Modify: `src/util/cookie/cookieServer.ts`
- Create: `.nvmrc`

**Interfaces:**
- Consumes: 기존 route params, cookies, images 설정
- Produces: Next 16 비동기 request API와 ESLint CLI에 맞는 앱

- [ ] **Step 1: 현재 라우트 smoke test를 Playwright로 작성**

검증 URL은 `/`, `/blogs`, `/projects`, `/tags`, `/contact`와 대표 blog/project detail 각 1개다. 모든 페이지가 200이고 console error가 없어야 한다.

Install: `npm install --save-dev @playwright/test && npx playwright install chromium`

- [ ] **Step 2: 공식 codemod를 dry-run한 뒤 16.3.5 조합 설치**

Run: `npx @next/codemod upgrade 16.3.5 --dry`

Install: `npm install next@16.3.5 react@19.3.0 react-dom@19.3.0 eslint-config-next@16.3.5 eslint@10.10.0`

- [ ] **Step 3: params/cookies를 비동기로 변경하고 불필요한 Server Actions 실험 플래그 제거**

```ts
type BlogPageProps = { params: Promise<{ slug: string[] }> };

export default async function PostLayout({ params }: BlogPageProps) {
  const { slug: segments } = await params;
  // existing lookup follows
}
```

- [ ] **Step 4: 이미지 호스트를 경로 단위로 제한**

```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'i.imgur.com', pathname: '/**' },
    { protocol: 'https', hostname: 'source.unsplash.com', pathname: '/**' },
  ],
},
```

- [ ] **Step 5: 전체 검증 후 커밋**

Run: `npm run lint && npm run typecheck && npm run test && npm run build && npm run test:e2e`

Expected: 모든 명령 exit 0, `npm audit --omit=dev`의 Next critical 항목 0

```bash
git add package.json package-lock.json next.config.js eslint.config.mjs .nvmrc src/app src/util/cookie/cookieServer.ts
git commit -m "chore: upgrade to supported Next.js security baseline"
```

### Task 4: Supabase 스키마와 쓰기 권한을 코드로 관리

**Files:**
- Create: `supabase/migrations/202609140001_secure_views.sql`
- Create: `supabase/tests/views_rls.test.sql`
- Create: `src/server/supabase.ts`
- Create: `src/app/api/views/[slug]/route.ts`
- Modify: `src/util/supabase.ts`
- Modify: 조회수를 증가시키는 5개 페이지/컴포넌트

**Interfaces:**
- Consumes: 저장소에 존재하는 post slug와 서버 요청
- Produces: 공개 SELECT, 서버 전용 increment, 익명 직접 쓰기 거부

- [ ] **Step 1: 배포 DB 정의를 pull하고 anon 거부 테스트 작성**

Run: `npx supabase db pull && npx supabase test db`

테스트는 anon의 `SELECT`만 성공하고 `INSERT`, `UPDATE`, `DELETE`, `increment_view` 실행은 실패해야 한다.

- [ ] **Step 2: 최소 권한 migration 작성**

```sql
alter table public.views enable row level security;
revoke insert, update, delete on table public.views from anon, authenticated;
grant select on table public.views to anon, authenticated;
revoke execute on function public.increment_view(text) from public, anon, authenticated;
grant execute on function public.increment_view(text) to service_role;
```

- [ ] **Step 3: 서버 전용 Supabase client와 slug allowlist Route Handler 구현**

서버 모듈은 `SUPABASE_SERVICE_ROLE_KEY`를 사용하고 `server-only`를 import한다. Route Handler는 Velite의 `allPosts`에 존재하는 slug만 허용하며 응답에 service-role 오류 세부를 노출하지 않는다.

- [ ] **Step 4: 브라우저 직접 upsert/RPC와 중복 증가 로직 제거**

`src/util/supabase.ts`는 공개 조회 전용 client만 남긴다. 클릭 컴포넌트와 Server Component의 `supabaseIncrement` 호출은 단일 `/api/views/[slug]` 호출로 교체한다.

- [ ] **Step 5: DB·API·E2E 검증 후 커밋**

Run: `npx supabase test db && npm run test -- src/app/api/views && npm run test:e2e`

```bash
git add supabase/migrations supabase/tests src/server/supabase.ts src/app/api/views src/util/supabase.ts src/components src/app
git commit -m "fix: enforce server-side view count permissions"
```

### Task 5: 환경 계약과 CI를 재현 가능하게 만들기

**Files:**
- Create: `src/config/env.ts`
- Create: `.env.example`
- Create: `.github/workflows/ci.yml`
- Modify: `.gitignore`
- Modify: `package.json`

**Interfaces:**
- Consumes: 배포/CI 환경변수
- Produces: 서버·클라이언트별 검증된 환경 객체, 단일 `npm run check`

- [ ] **Step 1: 누락 환경변수 테스트 작성**

`NEXT_PUBLIC_SUPABASE_URL` 누락 시 변수 이름이 포함된 명시적 configuration error가 발생하고, client bundle에서 Gmail/service-role 키에 접근할 수 없음을 테스트한다.

- [ ] **Step 2: Zod 환경 스키마와 안전한 예제 파일 추가**

`.env.example`에는 값 대신 빈 문자열과 용도 설명만 둔다. `.gitignore`는 `.env*`를 차단하고 `!.env.example`만 허용한다.

- [ ] **Step 3: 검증 스크립트 정의**

```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "npm run content && tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "check": "npm run lint && npm run typecheck && npm run test && npm run build"
  }
}
```

- [ ] **Step 4: GitHub Actions에서 Node 24와 `npm ci` 사용**

CI는 pull request와 main push에서 `npm ci`, `npm run check`, `npm audit --omit=dev --audit-level=high`를 실행한다. 빌드에는 production secret 대신 별도 preview Supabase 프로젝트 값을 사용한다.

- [ ] **Step 5: 깨끗한 설치 검증 후 커밋**

Run: `npm ci && npm run check`

```bash
git add .env.example .gitignore .github/workflows/ci.yml package.json package-lock.json src/config/env.ts
git commit -m "ci: add reproducible security and quality gates"
```

### Task 6: 직접 의존성과 코드 경계를 정리

**Files:**
- Modify: `package.json`, `package-lock.json`
- Split: `src/util/supabase.ts` into `src/lib/supabase/browser.ts` and `src/server/supabase.ts`
- Refactor: `src/util/getPosts.ts`
- Modify: invalid-slug dynamic pages
- Rename: 오탈자 파일과 export

**Interfaces:**
- Consumes: 생성된 `Post[]`, 브라우저 공개 DB 읽기, 서버 DB 쓰기
- Produces: 불변 post query, 명시적 404, 방향이 분리된 import graph

- [ ] **Step 1: Knip을 추가하고 현재 미사용 직접 의존성 baseline 저장**

Run: `npx knip`

- [ ] **Step 2: 제거 후보를 하나씩 삭제하고 검증**

우선 `react-markdown`, `react-syntax-highlighter`, `@types/react-syntax-highlighter`, `next-sitemap`, `type-fest`, `shiki`, `bufferutil`, `utf-8-validate`, `next-seo`, `rehype-highlight` 순서로 제거한다. 각 묶음 뒤 `npm run check`를 실행한다.

- [ ] **Step 3: `getPosts`의 원본 배열 mutation과 중복 filter/sort 제거 테스트 작성**

같은 입력으로 연속 호출해도 `allPosts` 순서가 변하지 않고 blog/tag/search 조합이 같은 결과를 반환해야 한다.

- [ ] **Step 4: 잘못된 slug에 `notFound()` 적용**

`oneProject!`, `post as Post`로 존재를 가정하기 전에 조회 결과를 확인하고 없는 경우 Next `notFound()`를 호출한다.

- [ ] **Step 5: 오탈자 이름을 일괄 교정하고 커밋**

`senaEmail`, `stiempaConfig`, `CardCarosuel`, `ProjectWitingList`, `Spiner`, `StakList`, `Porps`, `carosuelPosts`를 각각 의미가 맞는 표기로 바꾼다.

Run: `npm run check && npx knip`

```bash
git add package.json package-lock.json src sitemap.config.ts
git commit -m "refactor: simplify dependencies and module boundaries"
```

### Task 7: 예방 보안 통제 추가

**Files:**
- Create: `.github/dependabot.yml`
- Create: `.gitleaks.toml`
- Modify: `.github/workflows/ci.yml`
- Modify: `next.config.js`
- Create: `SECURITY.md`

**Interfaces:**
- Consumes: pull request, dependency metadata, HTTP 응답
- Produces: 주간 보안 업데이트, 비밀 차단, 브라우저 보안 헤더

- [ ] **Step 1: Dependabot 주간 npm 업데이트와 그룹 정책 추가**

Next/React, Supabase, lint/test 도구를 서로 다른 그룹으로 나눠 회귀 범위를 제한한다.

- [ ] **Step 2: gitleaks를 전체 이력과 PR diff에 실행**

Run: `gitleaks git . --redact --no-banner`

Expected: 실제 credential 0건

- [ ] **Step 3: CSP를 Report-Only로 배포하고 위반 수집**

허용 대상은 self, Google Analytics, Giscus, Supabase, 현재 이미지 호스트로 제한한다. 1주일간 정상 트래픽 위반을 확인한 후 enforcing CSP로 전환한다.

- [ ] **Step 4: 기본 헤더 추가**

`Content-Security-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `Permissions-Policy`를 Next headers 설정으로 관리한다. HSTS는 Vercel 도메인/HTTPS 강제 상태를 확인한 후 추가한다.

- [ ] **Step 5: CI와 응답 헤더 검증 후 커밋**

Run: `npm run check && curl -sSI http://localhost:3000 | rg 'content-security-policy|referrer-policy|x-content-type-options|permissions-policy'`

```bash
git add .github/dependabot.yml .github/workflows/ci.yml .gitleaks.toml SECURITY.md next.config.js
git commit -m "security: add preventive repository and browser controls"
```

### Task 8: SEO·sitemap·자산 후속 정리

**Files:**
- Modify: `src/config.ts`, `sitemap.config.ts`, `src/app/layout.tsx`
- Delete: `next-sitemap.config.js` 또는 custom sitemap 중 사용하지 않는 한쪽
- Optimize: `public/images/`

**Interfaces:**
- Consumes: 단일 `siteConfig.url`, post route 목록
- Produces: 동일 canonical/robots/sitemap URL과 최적화된 정적 자산

- [ ] **Step 1: `sonblog.vercel.app`와 `nextjs-blog-kd02109.vercel.app` 중 production canonical을 하나로 확정**

- [ ] **Step 2: App Router `sitemap.ts`와 `robots.ts`로 통합**

tracked `public/sitemap.xml` 생성과 별도 `next-sitemap.config.js`를 제거해 이중 소유권을 없앤다.

- [ ] **Step 3: 언어·metadata·icon 경로 교정**

`<html lang="ko">`로 변경하고 수동 head 태그를 Next Metadata API에 통합한다.

- [ ] **Step 4: 대형 GIF/PNG 최적화**

우선 4MB `comment.gif`, 1.9MB `react-type2.png`, 1.7MB `image2.png`를 WebP/AVIF 또는 MP4로 바꾸고 시각 회귀를 확인한다.

- [ ] **Step 5: Lighthouse와 링크 검증 후 커밋**

Run: `npm run build && npm run test:e2e`

```bash
git add src/config.ts src/app/layout.tsx src/app/sitemap.ts src/app/robots.ts public/images sitemap.config.ts next-sitemap.config.js
git commit -m "chore: consolidate metadata and optimize blog assets"
```

## 8. 완료 게이트

- [ ] `npm audit --omit=dev --audit-level=high`가 exit 0이거나 각 예외에 도달 불가 근거·owner·재검토 날짜가 있다.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:e2e`가 깨끗한 `npm ci` 뒤 모두 통과한다.
- [ ] 악성 HTML 문의가 운영자 메일에서 텍스트로만 보인다.
- [ ] anon 역할은 `views` SELECT 외의 쓰기와 `increment_view` 직접 실행을 할 수 없다.
- [ ] 잘못된 blog/project slug는 500이 아니라 404를 반환한다.
- [ ] 73개 MDX 문서의 URL snapshot과 대표 페이지 시각 결과가 유지된다.
- [ ] `.env`, Gmail 비밀번호, Supabase service-role key가 전체 git 이력과 PR diff에 없다.
- [ ] package manager, Node 버전, CI 버전이 단일 계약으로 고정된다.

## 9. 참고한 1차 자료

- Next.js 지원 정책: https://nextjs.org/support-policy
- Next.js 16 업그레이드: https://nextjs.org/docs/app/guides/upgrading/version-16
- Next.js 공식 codemod: https://nextjs.org/docs/app/guides/upgrading/codemods
- Contentlayer 유지보수 중단 공지: https://github.com/contentlayerdev/contentlayer
- Velite 저장소/패키지: https://github.com/zce/velite
- Supabase 데이터 보안: https://supabase.com/docs/guides/database/secure-data
- Supabase API 보안·GRANT/RLS: https://supabase.com/docs/guides/api/securing-your-api
- Vercel의 Next image CVE 완화: https://vercel.com/changelog/cve-2025-55173

## 10. 한계와 면책

이 문서는 정적 코드, 로컬 명령, npm advisory, 공개 공식 문서를 사용한 AI 보조 1차 감사다. 배포된 Supabase의 실제 RLS/GRANT, Vercel 환경변수·방화벽, Gmail 계정 설정은 접근하지 않았으므로 별도 운영 환경 확인이 필요하다. 결제·민감 개인정보·중요 계정을 다루도록 범위가 커지면 전문 침투 테스트를 별도로 수행해야 한다.
