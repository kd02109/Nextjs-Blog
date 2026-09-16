import { expect, test, type Page } from '@playwright/test';

function watchBrowserErrors(page: Page) {
  const errors: string[] = [];

  page.on('pageerror', error => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(`console: ${message.text()}`);
    }
  });

  return errors;
}

async function expectNoBrowserErrors(page: Page, errors: string[]) {
  await page.waitForLoadState('load');
  expect(errors).toEqual([]);
}

async function blockBrowserDynamicCode(page: Page) {
  await page.addInitScript(() => {
    window.Function = new Proxy(window.Function, {
      apply() {
        throw new Error('Browser dynamic code execution is forbidden by CSP.');
      },
      construct() {
        throw new Error('Browser dynamic code execution is forbidden by CSP.');
      },
    });
  });
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());

    if (url.pathname.startsWith('/rest/v1/views')) {
      if (url.searchParams.get('select')?.includes('slug')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { slug: 'react-design-pattern', view_count: 99 },
            { slug: 'nextjs-with-cookie', view_count: 12 },
          ]),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ view_count: 0 }]),
      });
    }

    if (
      route.request().method() === 'POST' &&
      url.pathname.startsWith('/api/views/')
    ) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ viewCount: 1 }),
      });
    }

    if (route.request().resourceType() === 'image') {
      return route.fulfill({ status: 204, body: '' });
    }

    return route.continue();
  });
});

test('home route renders the public profile with Korean document language', async ({
  page,
}) => {
  await blockBrowserDynamicCode(page);
  const errors = watchBrowserErrors(page);
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await expect(page.getByRole('heading', { name: 'kd02109' })).toBeVisible();
  await expect(
    page.locator('section[aria-labelledby="popular-posts-title"] h3').first(),
  ).toHaveText('React의 디자인 패턴');
  await expectNoBrowserErrors(page, errors);
});

const listingRoutes = [
  { path: '/blogs', heading: 'Blog' },
  { path: '/projects', heading: 'NextJS Blog' },
  { path: '/projects/mbtmi', heading: 'Mbti Test Project' },
  { path: '/tags', heading: 'Tags' },
  { path: '/contact', heading: 'Send Me An Email' },
] as const;

for (const route of listingRoutes) {
  test(`${route.path} returns 200 and renders its heading`, async ({
    page,
  }) => {
    const errors = watchBrowserErrors(page);
    const response = await page.goto(route.path);

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: route.heading, exact: true }).first(),
    ).toBeVisible();
    await expectNoBrowserErrors(page, errors);
  });
}

test('known article route returns 200 and renders the article title', async ({
  page,
}) => {
  await blockBrowserDynamicCode(page);
  const errors = watchBrowserErrors(page);
  const response = await page.goto('/blogs/blog/react/react-design-pattern');

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: 'React의 디자인 패턴', exact: true }),
  ).toBeVisible();
  await expectNoBrowserErrors(page, errors);
});

test('known project article route returns 200 and renders the article title', async ({
  page,
}) => {
  await blockBrowserDynamicCode(page);
  const errors = watchBrowserErrors(page);
  const response = await page.goto('/projects/mbtmi/a-download');

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', {
      name: 'a.download는 모두 지원이 되는 거 아니었나요?',
      exact: true,
    }),
  ).toBeVisible();
  await expectNoBrowserErrors(page, errors);
});

const invalidRoutes = [
  '/blogs/blog/react/not-a-real-article',
  '/projects/not-a-real-project',
  '/projects/mbtmi/not-a-real-project-article',
] as const;

const expectedMissingDocumentNoise =
  'console: Failed to load resource: the server responded with a status of 404 (Not Found)';

for (const path of invalidRoutes) {
  test(`${path} returns an exact 404 without unexpected browser errors`, async ({
    page,
  }) => {
    const errors = watchBrowserErrors(page);
    const response = await page.goto(path);

    expect(response?.status()).toBe(404);
    await page.waitForLoadState('load');
    // Chromium reports the deliberately missing main document as one console error.
    expect(errors).toEqual([expectedMissingDocumentNoise]);
  });
}

test('legacy client view cookies do not bypass the database deduplication request', async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: 'react-design-pattern',
      value: 'react-design-pattern',
      url: 'http://127.0.0.1:3100',
    },
  ]);
  const errors = watchBrowserErrors(page);
  await page.goto('/blogs');
  const viewRequest = page.waitForRequest(
    request =>
      request.method() === 'POST' &&
      request.url().endsWith('/api/views/react-design-pattern'),
    { timeout: 2_000 },
  );

  await page
    .getByRole('button', { name: /React의 디자인 패턴/ })
    .first()
    .click();
  await viewRequest;
  await expectNoBrowserErrors(page, errors);
});

test('root and child routes render one description and complete shared metadata', async ({
  page,
}) => {
  const errors = watchBrowserErrors(page);
  for (const path of ['/', '/blogs']) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);

    await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('head meta[property="og:type"]')).toHaveAttribute(
      'content',
      'website',
    );
    await expect(
      page.locator('head meta[property="og:locale"]'),
    ).toHaveAttribute('content', 'ko-KR');
    await expect(
      page.locator('head meta[property="og:site_name"]'),
    ).toHaveAttribute('content', "Son's blog");
    await expect(page.locator('head meta[name="keywords"]')).toHaveCount(1);
    await expect(
      page.locator('head meta[name="google-site-verification"]'),
    ).toHaveAttribute('content', 'vX5KRBC3xVzJD7VebebY5_AuQq9VHZHdA4jom0Q2y9c');
    await expect(
      page.locator('head meta[name="naver-site-verification"]'),
    ).toHaveAttribute('content', 'ef16034ef27e71574bf1c4ae39576acc4e17b002');
  }
  await expectNoBrowserErrors(page, errors);
});
