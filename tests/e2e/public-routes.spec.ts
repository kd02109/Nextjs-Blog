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

test.beforeEach(async ({ page }, testInfo) => {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());

    if (url.pathname.startsWith('/rest/v1/views')) {
      if (url.searchParams.get('select')?.includes('slug')) {
        if (testInfo.title.includes('view counts cannot load')) {
          return route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 'PGRST000',
              message: 'View counts unavailable',
              details: null,
              hint: null,
            }),
          });
        }

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

test('home route renders the field notes design with real writing', async ({
  page,
}) => {
  await blockBrowserDynamicCode(page);
  const errors = watchBrowserErrors(page);
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    '만들면서 배우고',
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('article', { name: '대표 글 React Hook Form' }),
  ).toBeVisible();
  await expect(
    page.locator('section[aria-labelledby="popular-posts-title"] h3').first(),
  ).toHaveText('React의 디자인 패턴');
  await expectNoBrowserErrors(page, errors);
});

test('home topic buttons filter the four recent articles at 320px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  const filters = page.getByRole('group', { name: '글 주제 필터' });
  const recentItems = page
    .getByRole('list', { name: '최근 글' })
    .getByRole('listitem');
  await expect(recentItems).toHaveCount(4);
  await filters.getByRole('button', { name: 'React' }).focus();
  await page.keyboard.press('Enter');
  await expect(filters.getByRole('button', { name: 'React' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(recentItems).toHaveCount(3);
  await filters.getByRole('button', { name: 'Next.js' }).click();
  await expect(recentItems).toHaveCount(1);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 320);
});

test('home keeps popular links usable when view counts cannot load', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page.getByText('조회수 정보를 불러오지 못해 최신 글 순서로 보여드립니다.'),
  ).toBeVisible();
  const popular = page.getByRole('list', { name: '인기 글' });
  await expect(popular.getByRole('listitem').first()).toContainText(
    'React Hook Form',
  );
  await expect(popular).not.toContainText('0 views');
  await popular.getByRole('link', { name: 'React Hook Form' }).click();
  await expect(page).toHaveURL(/\/blog\/react\/react-hook-form$/);
});

const listingRoutes = [
  { path: '/blog', heading: '문제를 따라 남긴 기록.' },
  { path: '/projects', heading: '만든 것에는 이유가 남습니다.' },
  { path: '/projects/mbtmi', heading: 'Mbti Test Project' },
  { path: '/tags', heading: '관심사를 따라 찾아보세요.' },
  { path: '/contact', heading: '새로운 이야기를 시작해 볼까요?' },
] as const;

test('legacy writing URLs permanently redirect to their matching new URLs', async ({
  request,
}) => {
  for (const [oldPath, newPath] of [
    ['/blogs', '/blog'],
    ['/blogs/blog/react/react-hook-form', '/blog/react/react-hook-form'],
  ] as const) {
    const response = await request.get(oldPath, { maxRedirects: 0 });
    expect(response.status(), oldPath).toBe(308);

    const location = response.headers().location;
    expect(location, oldPath).toBeTruthy();
    expect(new URL(location!, response.url()).pathname).toBe(newPath);
  }
});

test('every published blog URL has a matching permanent redirect', async ({
  request,
}) => {
  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.status()).toBe(200);

  const sitemapXml = await sitemapResponse.text();
  const blogPaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(match => new URL(match[1]).pathname)
    .filter(path => path.startsWith('/blog/'));
  expect(blogPaths).toHaveLength(41);

  for (const path of blogPaths) {
    const legacyPath = `/blogs${path}`;
    const response = await request.get(legacyPath, { maxRedirects: 0 });
    expect(response.status(), legacyPath).toBe(308);

    const location = response.headers().location;
    expect(location, legacyPath).toBeTruthy();
    expect(new URL(location!, response.url()).pathname).toBe(path);
  }
});

test('published sitemap contains only unique current URLs', async ({
  request,
}) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);

  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  expect(urls).toHaveLength(84);
  expect(new Set(urls).size).toBe(84);
  expect(urls).toContain('https://sonblog.vercel.app/blog');
  expect(urls).toContain(
    'https://sonblog.vercel.app/blog/react/react-hook-form',
  );
  expect(urls.some(url => new URL(url).pathname.startsWith('/blogs'))).toBe(
    false,
  );
});

test('the site header keeps the home logo and three primary destinations', async ({
  page,
}) => {
  await page.goto('/');
  const header = page.locator('header').first();

  await expect(header.getByRole('link', { name: /SON.*홈/ })).toHaveAttribute(
    'href',
    '/',
  );
  const links = header
    .getByRole('navigation', { name: '주요 메뉴' })
    .getByRole('link');
  await expect(links).toHaveCount(3);
  await expect(links.nth(0)).toHaveText('글');
  await expect(links.nth(0)).toHaveAttribute('href', '/blog');
  await expect(links.nth(1)).toHaveText('프로젝트');
  await expect(links.nth(1)).toHaveAttribute('href', '/projects');
  await expect(links.nth(2)).toHaveText('소개');
  await expect(links.nth(2)).toHaveAttribute('href', '/about');
});

test('the 320px menu opens, closes with Escape, and restores button focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  const toggle = page.locator('button[aria-controls="mobile-navigation"]');
  await expect(toggle).toHaveAccessibleName('메뉴 열기');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveAccessibleName('메뉴 닫기');
  const mobileNav = page.getByRole('navigation', { name: '모바일 메뉴' });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole('link', { name: '글' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 320);

  await toggle.click();
  await page
    .getByRole('navigation', { name: '모바일 메뉴' })
    .getByRole('link', { name: '소개' })
    .click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('the shared shell uses light and dark design tokens', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');

  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(234, 240, 243)',
  );
  await page.getByRole('button', { name: '다크 모드로 전환' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(16, 35, 50)',
  );
});

test('/about remains a public page with a contact route', async ({ page }) => {
  const response = await page.goto('/about');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    '만드는 과정까지',
  );
  await expect(
    page.getByRole('link', { name: /연락/ }).first(),
  ).toHaveAttribute('href', '/contact');
});

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
  const response = await page.goto('/blog/react/react-design-pattern');

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
  '/blog/react/not-a-real-article',
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

test('legacy view cookies do not interrupt article links or add duplicate client increments', async ({
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
  const clientIncrements: string[] = [];
  page.on('request', request => {
    if (request.method() === 'POST' && request.url().includes('/api/views/')) {
      clientIncrements.push(request.url());
    }
  });
  await page.goto('/blog');
  await page
    .getByRole('list', { name: '글 목록' })
    .getByRole('link', { name: 'React의 디자인 패턴' })
    .first()
    .click();
  await expect(page).toHaveURL(/\/blog\/react\/react-design-pattern$/);
  expect(clientIncrements).toEqual([]);
  await expectNoBrowserErrors(page, errors);
});

test('root and child routes render one description and complete shared metadata', async ({
  page,
}) => {
  const errors = watchBrowserErrors(page);
  for (const path of ['/', '/blog']) {
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
