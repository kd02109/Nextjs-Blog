import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/rest/v1/views?*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    }),
  );
});

test('writing archive shows all 41 blog posts and opens a real article', async ({
  page,
}) => {
  const response = await page.goto('/blogs');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByText('41개의 기록', { exact: true })).toBeVisible();

  const writing = page.getByRole('list', { name: '글 목록' });
  await expect(writing.getByRole('listitem')).toHaveCount(40);

  const article = page
    .getByRole('article', { name: '대표 글 React Hook Form' })
    .getByRole('link', { name: '대표 글 읽기' });
  await expect(article).toHaveAttribute(
    'href',
    '/blogs/blog/react/react-hook-form',
  );
  await article.click();
  await expect(page).toHaveURL(/\/blogs\/blog\/react\/react-hook-form$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'React Hook Form' }),
  ).toBeVisible();
});

test('writing topic and search apply together with a clear empty state', async ({
  page,
}) => {
  await page.goto('/blogs');

  const filters = page.getByRole('group', { name: '글 주제 필터' });
  const search = page.getByRole('searchbox', { name: '글 검색' });
  const writing = page.getByRole('list', { name: '글 목록' });

  await filters.getByRole('button', { name: 'React', exact: true }).click();
  await search.fill('Hook Form');

  await expect(page.getByText('1개의 기록', { exact: true })).toBeVisible();
  await expect(writing.getByRole('listitem')).toHaveCount(1);
  await expect(
    writing.getByRole('link', { name: 'React Hook Form', exact: true }),
  ).toBeVisible();

  await search.fill('no-such-article-2026');
  await expect(page.getByText('0개의 기록', { exact: true })).toBeVisible();
  await expect(page.getByText(/검색 결과가 없습니다/)).toBeVisible();
  await expect(writing.getByRole('listitem')).toHaveCount(0);
});

test('topic URL selects React across blog and project notes', async ({
  page,
}) => {
  const response = await page.goto('/tags?key=react');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const filters = page.getByRole('group', { name: '주제 필터' });
  await expect(
    filters.getByRole('button', { name: 'React', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('22개의 기록', { exact: true })).toBeVisible();

  const notes = page.getByRole('list', { name: '주제별 기록' });
  await expect(notes.getByRole('listitem')).toHaveCount(22);
  await expect(
    notes.getByRole('link', { name: 'React Hook Form', exact: true }),
  ).toHaveAttribute('href', '/blogs/blog/react/react-hook-form');

  const projectNote = notes.getByRole('link', {
    name: '에러 컴포넌트 활용하기',
    exact: true,
  });
  await expect(projectNote).toHaveAttribute(
    'href',
    '/projects/mbtmi/error-component',
  );
  await projectNote.click();
  await expect(page).toHaveURL(/\/projects\/mbtmi\/error-component$/);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '에러 컴포넌트 활용하기',
    }),
  ).toBeVisible();
});

test('Next.js URL alias selects the full topic rather than one lowercase tag', async ({
  page,
}) => {
  const response = await page.goto('/tags?key=nextjs');

  expect(response?.status()).toBe(200);
  await expect(
    page
      .getByRole('group', { name: '주제 필터' })
      .getByRole('button', { name: 'Next.js' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('29개의 기록', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('list', { name: '주제별 기록' }).getByRole('link', {
      name: 'Next js 블로그 조회수 기능 만들기 with Supabase',
      exact: true,
    }),
  ).toHaveAttribute('href', '/projects/nextjs-blog/nextjs-blog-veiws');
  await expect(
    page.getByRole('list', { name: '주제별 기록' }).getByRole('link', {
      name: 'Nextjs를 사용하면서 마주친 쿠키 문제',
      exact: true,
    }),
  ).toHaveAttribute('href', '/projects/swifty/nextjs-with-cookie');
});

test('topic cards update the URL and an unknown key restores all records', async ({
  page,
}) => {
  await page.goto('/tags');
  await page
    .getByRole('navigation', { name: '주제 선택' })
    .getByRole('link', { name: /Next.js/ })
    .click();

  await expect(page).toHaveURL(/\/tags\?key=nextJs#topic-results$/);
  await expect(page.getByText('29개의 기록', { exact: true })).toBeVisible();

  await page.goto('/tags?key=not-a-real-tag');
  await expect(page.getByText('73개의 기록', { exact: true })).toBeVisible();
});

test('topic filter buttons keep the URL and browser history in sync', async ({
  page,
}) => {
  await page.goto('/tags?key=react');
  const filters = page.getByRole('group', { name: '주제 필터' });

  await filters.getByRole('button', { name: 'Next.js' }).click();
  await expect(page).toHaveURL(/\/tags\?key=nextJs$/);
  await expect(page.getByText('29개의 기록', { exact: true })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/tags\?key=react$/);
  await expect(filters.getByRole('button', { name: 'React' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText('22개의 기록', { exact: true })).toBeVisible();
});

for (const path of ['/blogs', '/tags?key=react'] as const) {
  test(`${path} stays within a 320px viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(path);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
    expect(
      await page.evaluate(() => document.body.scrollWidth),
    ).toBeLessThanOrEqual(320);
  });
}

test('project archive presents five real project destinations', async ({
  page,
}) => {
  const response = await page.goto('/projects');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('searchbox', {
      name: '프로젝트 또는 기술 검색',
    }),
  ).toBeVisible();

  const cards = page.locator('main a[href^="/projects/"]:visible');
  await expect(cards).toHaveCount(5);

  for (const slug of [
    'nextjs-blog',
    'sharepetment',
    'mbtmi',
    'solo-project',
    'swifty',
  ] as const) {
    await expect(
      page.locator(`main a[href="/projects/${slug}"]`),
    ).toBeVisible();
  }
});

test('project search filters names and technologies with an empty state', async ({
  page,
}) => {
  await page.goto('/projects');

  const search = page.getByRole('searchbox', {
    name: '프로젝트 또는 기술 검색',
  });
  const cards = page.locator('main a[href^="/projects/"]:visible');

  await search.fill('SharePetment');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toHaveAttribute('href', '/projects/sharepetment');

  await search.fill('redux');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toHaveAttribute('href', '/projects/solo-project');

  await search.fill('no-such-project-2026');
  await expect(cards).toHaveCount(0);
  await expect(page.getByText(/검색 결과가 없습니다/)).toBeVisible();
});

test('NextJS Blog detail shows seven dated notes in newest-first order', async ({
  page,
}) => {
  const response = await page.goto('/projects/nextjs-blog');

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { level: 1, name: 'NextJS Blog' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

  const notes = page.getByRole('list', { name: '프로젝트 기록' });
  await expect(notes.getByRole('listitem')).toHaveCount(7);
  const dates = await notes
    .locator('time')
    .evaluateAll(elements =>
      elements.map(element =>
        new Date(element.getAttribute('datetime') ?? '')
          .toISOString()
          .slice(0, 10),
      ),
    );
  expect(dates).toEqual([
    '2024-05-14',
    '2024-05-07',
    '2023-09-22',
    '2023-09-20',
    '2023-09-14',
    '2023-08-28',
    '2023-08-14',
  ]);

  const firstNote = notes.getByRole('link', {
    name: 'Next js 블로그 조회수 기능 만들기 with Supabase',
    exact: true,
  });
  await expect(firstNote).toHaveAttribute(
    'href',
    '/projects/nextjs-blog/nextjs-blog-veiws',
  );
  await firstNote.click();
  await expect(page).toHaveURL(/\/projects\/nextjs-blog\/nextjs-blog-veiws$/);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Next js 블로그 조회수 기능 만들기 with Supabase',
    }),
  ).toBeVisible();
});

test('project detail keeps image text and safe external destinations', async ({
  page,
}) => {
  await page.goto('/projects/nextjs-blog');

  await expect(page.getByRole('img', { name: 'NextJS Blog' })).toHaveAttribute(
    'alt',
    'NextJS Blog',
  );

  const live = page.getByRole('link', { name: '웹사이트 보기' });
  await expect(live).toHaveAttribute('href', 'https://sonblog.vercel.app/');
  await expect(live).toHaveAttribute('target', '_blank');
  await expect(live).toHaveAttribute('rel', /noopener noreferrer/);

  const github = page.getByRole('link', { name: 'GitHub 보기' });
  await expect(github).toHaveAttribute(
    'href',
    'https://github.com/kd02109/Nextjs-Blog',
  );
  await expect(github).toHaveAttribute('target', '_blank');
  await expect(github).toHaveAttribute('rel', /noopener noreferrer/);

  await page.goto('/projects/swifty');
  await expect(page.getByRole('link', { name: '웹사이트 보기' })).toHaveCount(
    0,
  );
  await expect(page.locator('main a[href="#"]')).toHaveCount(0);
});

test('unknown project slug returns a 404', async ({ page }) => {
  const response = await page.goto('/projects/not-a-real-project');

  expect(response?.status()).toBe(404);
});

test('project cards and a long external URL fit 320, 390, and 1440px', async ({
  page,
}) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });

    await page.goto('/projects');
    await expect(
      page.locator('main a[href="/projects/sharepetment"]'),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);

    await page.goto('/projects/sharepetment');
    await expect(
      page.getByRole('link', { name: 'GitHub 보기' }),
    ).toHaveAttribute('href', 'https://github.com/SharePetment/SharePetment');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});

test('blog record has the shared reading body, related article, and canonical URL', async ({
  page,
}) => {
  const response = await page.goto('/blogs/blog/react/react-hook-form');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', { level: 1, name: 'React Hook Form' }),
  ).toBeVisible();

  const body = page.getByRole('article', { name: '글 본문' });
  await expect(body).toBeVisible();
  await expect(
    body.getByRole('heading', { level: 2, name: 'React Hook Form?' }),
  ).toBeVisible();
  await expect(
    body.getByRole('heading', { level: 2, name: 'useForm' }),
  ).toBeVisible();
  await expect(body.locator('pre code').first()).toBeVisible();

  await expect(
    page.locator('main a[href="/blogs/blog/react/optimistic-updates"]'),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://sonblog.vercel.app/blogs/blog/react/react-hook-form',
  );
});

test('project record reuses the reading body and links to its project and next note', async ({
  page,
}) => {
  const response = await page.goto('/projects/nextjs-blog/nextjs-blog-veiws');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Next js 블로그 조회수 기능 만들기 with Supabase',
    }),
  ).toBeVisible();

  const body = page.getByRole('article', { name: '글 본문' });
  await expect(body).toBeVisible();
  await expect(
    body.getByRole('heading', { level: 2, name: '블로그 조회수 기록하기' }),
  ).toBeVisible();
  await expect(
    body.getByRole('img', { name: '조회수 이미지' }).first(),
  ).toBeVisible();

  await expect(
    page
      .getByRole('navigation', { name: '이어서 읽기' })
      .getByRole('link', { name: /목록으로 돌아가기/ }),
  ).toBeVisible();
  await expect(
    page.locator('main a[href="/projects/nextjs-blog/next-js-blog-review"]'),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://sonblog.vercel.app/projects/nextjs-blog/nextjs-blog-veiws',
  );
});

test('reading table of contents has keyboard links to real blog and project headings', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const { path, title, id } of [
    {
      path: '/blogs/blog/react/react-hook-form',
      title: 'useForm',
      id: 'useform',
    },
    {
      path: '/projects/nextjs-blog/nextjs-blog-veiws',
      title: '조회수 기록을 위한 로직',
      id: '조회수-기록을-위한-로직',
    },
  ]) {
    await page.goto(path);

    const toc = page.getByRole('navigation', { name: '글 목차' });
    const link = toc.getByRole('link', { name: title, exact: true });
    const heading = page
      .locator('article[aria-label="글 본문"]')
      .locator(`[id="${id}"]`);

    await expect(toc).toBeVisible();
    await expect(link).toHaveAttribute('href', `#${id}`);
    await expect(heading).toBeVisible();
    await link.focus();
    await expect(link).toBeFocused();
    await link.press('Enter');
    await expect
      .poll(() => decodeURIComponent(new URL(page.url()).hash))
      .toBe(`#${id}`);
  }
});

test('reading page copies its URL and a code example with keyboard buttons', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: 'http://127.0.0.1:3100',
  });
  await page.goto('/blogs/blog/react/react-hook-form');

  const copyUrl = page.getByRole('button', { name: '현재 페이지 URL 복사' });
  await copyUrl.focus();
  await copyUrl.press('Enter');
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(page.url());

  const code = page
    .getByRole('article', { name: '글 본문' })
    .locator('pre code')
    .first();
  const example = await code.innerText();
  const copyCode = page.getByRole('button', { name: '코드 복사' }).first();
  await copyCode.focus();
  await copyCode.press('Enter');
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(example);
});

test('long code remains inside the 320px reading viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/blogs/blog/react/react-hook-form');

  const body = page.getByRole('article', { name: '글 본문' });
  const code = body.locator('pre code').first();
  await expect(code).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  expect(
    await page.evaluate(() => document.body.scrollWidth),
  ).toBeLessThanOrEqual(320);
});

test('wide tables and local images stay inside the 320px reading viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/blogs/blog/nextjs/csr-ssg-isr-ssr');

  const body = page.getByRole('article', { name: '글 본문' });
  const table = body.getByRole('table').first();
  const image = body.getByRole('img', { name: 'csr-ssg-isr-ssr' }).first();
  await expect(table).toBeVisible();
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate(element => (element as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  expect(
    await page.evaluate(() => document.body.scrollWidth),
  ).toBeLessThanOrEqual(320);
});

test('a project note keeps code and a local image inside the 320px viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/projects/mbtmi/a-download');

  const body = page.getByRole('article', { name: '글 본문' });
  const image = body.getByRole('img', { name: '지원 범위' });
  await expect(body.locator('pre code').first()).toBeVisible();
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate(element => (element as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  expect(
    await page.evaluate(() => document.body.scrollWidth),
  ).toBeLessThanOrEqual(320);
});

for (const path of [
  '/blogs/blog/react/not-a-real-article',
  '/projects/nextjs-blog/not-a-real-project-article',
] as const) {
  test(`${path} returns a 404 instead of a reading page`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('article', { name: '글 본문' })).toHaveCount(0);
  });
}

test('about introduces the author, three working steps, and real destinations', async ({
  page,
}) => {
  const response = await page.goto('/about');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /만드는 과정까지.*남기는 사람/,
    }),
  ).toBeVisible();

  const workingMethod = page.getByRole('region', {
    name: '어떻게 작업하나요?',
  });
  await expect(workingMethod.getByRole('article')).toHaveCount(3);
  for (const title of ['문제에서 시작', '직접 구현', '다시 쓸 수 있게 기록']) {
    await expect(
      workingMethod.getByRole('heading', { level: 3, name: title }),
    ).toBeVisible();
  }

  await expect(page.getByRole('link', { name: '글 읽어보기' })).toHaveAttribute(
    'href',
    '/blogs',
  );
  await expect(
    page.getByRole('link', { name: '프로젝트 보기' }),
  ).toHaveAttribute('href', '/projects');
  await expect(
    page.getByRole('link', { name: '연락 화면으로' }),
  ).toHaveAttribute('href', '/contact');
});

test('contact has one heading and three required, labeled API fields', async ({
  page,
}) => {
  const response = await page.goto('/contact');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /새로운 이야기를.*시작해 볼까요/,
    }),
  ).toBeVisible();

  const form = page.getByRole('form', { name: '문의 폼' });
  await expect(form).toBeVisible();
  const email = form.getByRole('textbox', { name: '이메일' });
  const subject = form.getByRole('textbox', { name: '제목' });
  const message = form.getByRole('textbox', { name: '메시지' });
  await expect(email).toHaveAttribute('name', 'from');
  await expect(email).toHaveAttribute('type', 'email');
  await expect(subject).toHaveAttribute('name', 'subject');
  await expect(message).toHaveAttribute('name', 'message');
  for (const field of [email, subject, message]) {
    await expect(field).toHaveAttribute('required', '');
  }
  await expect(form.getByRole('textbox', { name: '이름' })).toHaveCount(0);
  await expect(form.locator('[name="name"]')).toHaveCount(0);
  await expect(
    form.getByRole('button', { name: '메시지 보내기' }),
  ).toBeVisible();
});

test('contact blocks invalid input without sending email', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/email', route => {
    requests += 1;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: '메일을 성공적으로 보냈습니다.' }),
    });
  });
  await page.goto('/contact');

  const form = page.getByRole('form', { name: '문의 폼' });
  const email = form.getByRole('textbox', { name: '이메일' });
  const subject = form.getByRole('textbox', { name: '제목' });
  const message = form.getByRole('textbox', { name: '메시지' });
  const submit = form.getByRole('button', { name: '메시지 보내기' });

  await submit.click();
  expect(requests).toBe(0);
  expect(
    await email.evaluate(
      input => (input as HTMLInputElement).validity.valueMissing,
    ),
  ).toBe(true);

  await email.fill('not-an-email');
  await subject.fill('작업 제안');
  await message.fill('함께 만들어 볼 서비스에 관해 이야기하고 싶습니다.');
  await submit.click();
  expect(requests).toBe(0);
  expect(
    await email.evaluate(
      input => (input as HTMLInputElement).validity.typeMismatch,
    ),
  ).toBe(true);

  await email.fill('visitor@example.com');
  await submit.click();
  await expect.poll(() => requests).toBe(1);
  await expect(form.getByRole('status')).toContainText(
    '메일을 성공적으로 보냈습니다.',
  );
});

test('keyboard submission posts only the API fields and shows loading and success', async ({
  page,
}) => {
  let releaseResponse: () => void = () => {};
  const responseGate = new Promise<void>(resolve => {
    releaseResponse = resolve;
  });
  let requestBody: unknown;
  let requestMethod = '';
  let contentType = '';
  await page.route('**/api/email', async route => {
    requestMethod = route.request().method();
    contentType = route.request().headers()['content-type'] ?? '';
    requestBody = route.request().postDataJSON();
    await responseGate;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: '메일을 성공적으로 보냈습니다.' }),
    });
  });
  await page.goto('/contact');

  const form = page.getByRole('form', { name: '문의 폼' });
  await form
    .getByRole('textbox', { name: '이메일' })
    .fill('visitor@example.com');
  await form.getByRole('textbox', { name: '제목' }).fill('작업 제안');
  await form
    .getByRole('textbox', { name: '메시지' })
    .fill('함께 만들어 볼 서비스에 관해 이야기하고 싶습니다.');
  await form.getByRole('textbox', { name: '제목' }).press('Enter');

  await expect
    .poll(() => requestBody)
    .toEqual({
      from: 'visitor@example.com',
      subject: '작업 제안',
      message: '함께 만들어 볼 서비스에 관해 이야기하고 싶습니다.',
    });
  expect(requestMethod).toBe('POST');
  expect(contentType).toContain('application/json');
  await expect(form.getByRole('button', { name: '보내는 중' })).toBeDisabled();

  releaseResponse();
  await expect(form.getByRole('status')).toContainText(
    '메일을 성공적으로 보냈습니다.',
  );
  await expect(
    form.getByRole('button', { name: '메시지 보내기' }),
  ).toBeEnabled();
});

for (const { status, message } of [
  { status: 400, message: '모든 입력 요청을 채우셔야 합니다.' },
  { status: 500, message: '메일 수신에 실패했습니다.' },
] as const) {
  test(`contact shows a ${status} error, keeps input, and allows retry`, async ({
    page,
  }) => {
    let requests = 0;
    await page.route('**/api/email', route => {
      requests += 1;
      return route.fulfill({
        status: requests === 1 ? status : 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: requests === 1 ? message : '메일을 성공적으로 보냈습니다.',
        }),
      });
    });
    await page.goto('/contact');

    const form = page.getByRole('form', { name: '문의 폼' });
    const email = form.getByRole('textbox', { name: '이메일' });
    const subject = form.getByRole('textbox', { name: '제목' });
    const messageField = form.getByRole('textbox', { name: '메시지' });
    const submit = form.getByRole('button', { name: '메시지 보내기' });
    await email.fill('visitor@example.com');
    await subject.fill('작업 제안');
    await messageField.fill(
      '함께 만들어 볼 서비스에 관해 이야기하고 싶습니다.',
    );
    await submit.click();

    await expect(form.getByRole('alert')).toContainText(message);
    await expect(email).toHaveValue('visitor@example.com');
    await expect(subject).toHaveValue('작업 제안');
    await expect(messageField).toHaveValue(
      '함께 만들어 볼 서비스에 관해 이야기하고 싶습니다.',
    );
    await expect(submit).toBeEnabled();
    expect(requests).toBe(1);

    await submit.click();
    await expect(form.getByRole('status')).toContainText(
      '메일을 성공적으로 보냈습니다.',
    );
    expect(requests).toBe(2);
  });
}

for (const path of ['/about', '/contact'] as const) {
  test(`${path} fits a 320px viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(path);

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
    expect(
      await page.evaluate(() => document.body.scrollWidth),
    ).toBeLessThanOrEqual(320);
  });
}

for (const { path, discussionTerm } of [
  {
    path: '/blogs/blog/react/react-hook-form',
    discussionTerm: 'blogs/blog/react/react-hook-form',
  },
  {
    path: '/projects/nextjs-blog/nextjs-blog-veiws',
    discussionTerm: 'projects/nextjs-blog/nextjs-blog-veiws',
  },
] as const) {
  test(`${path} keeps a Giscus discussion mapped to its pathname`, async ({
    page,
  }) => {
    await page.route('https://giscus.app/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><html lang="ko"><body></body></html>',
      }),
    );
    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
    const comments = page.locator('section#comments');
    await expect(comments).toHaveAttribute('aria-labelledby', 'comments-title');
    await expect(comments.locator('h2#comments-title')).toContainText(
      '읽은 뒤에 남기는 메모.',
    );
    await expect(comments).toContainText(
      '질문이나 다른 경험이 있다면 이어서 남겨주세요.',
    );

    const embed = comments.locator('.reading-comments-embed');
    await expect(embed).toBeVisible();
    const widget = embed.locator('giscus-widget');
    await expect(widget).toHaveAttribute('repo', 'kd02109/Nextjs-Blog');
    await expect(widget).toHaveAttribute('repoid', 'R_kgDOKD_Xgg');
    await expect(widget).toHaveAttribute('category', 'General');
    await expect(widget).toHaveAttribute('categoryid', 'DIC_kwDOKD_Xgs4CY7-G');
    await expect(widget).toHaveAttribute('mapping', 'pathname');
    await expect(widget).toHaveAttribute('lang', 'ko');

    const frame = widget.locator('iframe[title="Comments"]');
    await expect(frame).toHaveAttribute('src', /giscus\.app\/ko\/widget/);
    const frameSource = await frame.getAttribute('src');
    expect(new URL(frameSource!).searchParams.get('term')).toBe(discussionTerm);
  });

  test(`${path} reaches comments by keyboard and fits 320px`, async ({
    page,
  }) => {
    await page.route('https://giscus.app/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><html lang="ko"><body></body></html>',
      }),
    );
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);

    const comments = page.locator('section#comments');
    const link = page
      .getByRole('navigation', { name: '글 목차' })
      .getByRole('link', { name: /댓글로 이어가기/ });
    await expect(link).toHaveAttribute('href', '#comments');
    await link.focus();
    await expect(link).toBeFocused();
    await link.press('Enter');
    await expect(page).toHaveURL(/#comments$/);
    await expect(comments).toBeInViewport();
    await expect(comments.locator('.reading-comments-embed')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
    expect(
      await page.evaluate(() => document.body.scrollWidth),
    ).toBeLessThanOrEqual(320);
  });
}

test('Giscus follows the resolved light and dark theme', async ({ page }) => {
  await page.route('https://giscus.app/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html lang="ko"><body></body></html>',
    }),
  );
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/blogs/blog/react/react-hook-form');

  const widget = page.locator('section#comments giscus-widget');
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect(widget).toHaveAttribute('theme', 'noborder_light');
  await widget.evaluate(element => {
    (window as Window & { initialGiscusWidget?: Element }).initialGiscusWidget =
      element;
  });

  await page.getByRole('button', { name: '다크 모드로 전환' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(widget).toHaveAttribute('theme', 'noborder_dark');
  expect(
    await widget.evaluate(
      element =>
        element ===
        (window as Window & { initialGiscusWidget?: Element })
          .initialGiscusWidget,
    ),
  ).toBe(true);

  await page.getByRole('button', { name: '라이트 모드로 전환' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect(widget).toHaveAttribute('theme', 'noborder_light');
});

test('home and a wide article preserve landmarks and width in light and dark layouts', async ({
  page,
}) => {
  await page.route('https://giscus.app/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html lang="ko"><body></body></html>',
    }),
  );

  for (const path of ['/', '/blogs/blog/nextjs/csr-ssg-isr-ssr'] as const) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);

    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme });

        await expect(page.getByRole('banner')).toHaveCount(1);
        await expect(page.getByRole('main')).toHaveCount(1);
        await expect(page.getByRole('contentinfo')).toHaveCount(1);
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        await expect(page.locator('html')).toHaveClass(
          colorScheme === 'dark' ? /dark/ : /^(?!.*dark)/,
        );
        await expect(page.locator('body')).toHaveCSS(
          'background-color',
          colorScheme === 'dark' ? 'rgb(16, 35, 50)' : 'rgb(234, 240, 243)',
        );
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
          `${path} at ${width}px in ${colorScheme}`,
        ).toBeLessThanOrEqual(width);
        expect(
          await page.evaluate(() => document.body.scrollWidth),
          `${path} body at ${width}px in ${colorScheme}`,
        ).toBeLessThanOrEqual(width);
      }
    }
  }
});

test('a reader can move from home through writing search to the Giscus anchor', async ({
  page,
}) => {
  await page.route('https://giscus.app/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html lang="ko"><body></body></html>',
    }),
  );
  await page.goto('/');

  await page.getByRole('link', { name: '모든 글 보기' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await page
    .getByRole('searchbox', { name: '글 검색' })
    .fill('React Hook Form');
  const results = page.getByRole('list', { name: '글 목록' });
  await expect(results.getByRole('listitem')).toHaveCount(1);
  await results.getByRole('link', { name: 'React Hook Form' }).click();

  await expect(page).toHaveURL(/\/blogs\/blog\/react\/react-hook-form$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'React Hook Form' }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: '글 목차' })
    .getByRole('link', { name: /댓글로 이어가기/ })
    .click();
  await expect(page).toHaveURL(/\/react-hook-form#comments$/);
  const comments = page.locator('section#comments');
  await expect(comments).toBeInViewport();
  await expect(comments.locator('h2#comments-title')).toContainText(
    '읽은 뒤에 남기는 메모.',
  );
  await expect(comments.locator('giscus-widget')).toHaveAttribute(
    'mapping',
    'pathname',
  );
});

test('a visitor can follow home projects into a real project note', async ({
  page,
}) => {
  await page.route('https://giscus.app/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html lang="ko"><body></body></html>',
    }),
  );
  await page.goto('/');

  await page.getByRole('link', { name: '전체 프로젝트' }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.locator('main a[href="/projects/nextjs-blog"]').click();
  await expect(page).toHaveURL(/\/projects\/nextjs-blog$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'NextJS Blog' }),
  ).toBeVisible();

  await page
    .getByRole('list', { name: '프로젝트 기록' })
    .getByRole('link', {
      name: 'Next js 블로그 조회수 기능 만들기 with Supabase',
    })
    .click();
  await expect(page).toHaveURL(/\/projects\/nextjs-blog\/nextjs-blog-veiws$/);
  await expect(
    page.getByRole('article', { name: '글 본문' }).getByRole('heading', {
      level: 2,
      name: '블로그 조회수 기록하기',
    }),
  ).toBeVisible();
});

test('a visitor can navigate from introduction to a working contact form', async ({
  page,
}) => {
  let payload: unknown;
  await page.route('**/api/email', route => {
    payload = route.request().postDataJSON();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: '메일을 성공적으로 보냈습니다.' }),
    });
  });
  await page.goto('/');

  await page
    .getByRole('navigation', { name: '주요 메뉴' })
    .getByRole('link', { name: '소개' })
    .click();
  await expect(page).toHaveURL(/\/about$/);
  await page.getByRole('link', { name: '연락 화면으로' }).click();
  await expect(page).toHaveURL(/\/contact$/);

  const form = page.getByRole('form', { name: '문의 폼' });
  await form
    .getByRole('textbox', { name: '이메일' })
    .fill('reader@example.com');
  await form.getByRole('textbox', { name: '제목' }).fill('블로그 문의');
  await form
    .getByRole('textbox', { name: '메시지' })
    .fill('글을 읽고 질문을 남깁니다.');
  await form.getByRole('button', { name: '메시지 보내기' }).click();

  await expect
    .poll(() => payload)
    .toEqual({
      from: 'reader@example.com',
      subject: '블로그 문의',
      message: '글을 읽고 질문을 남깁니다.',
    });
  await expect(form.getByRole('status')).toContainText(
    '메일을 성공적으로 보냈습니다.',
  );
});
