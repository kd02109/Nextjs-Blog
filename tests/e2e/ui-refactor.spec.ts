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
