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
