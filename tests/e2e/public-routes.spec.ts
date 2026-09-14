import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    if (route.request().resourceType() === 'image') {
      return route.abort();
    }

    return route.continue();
  });
});

test('home route renders the public profile without a server error', async ({
  page,
}) => {
  const response = await page.goto('/');

  expect(response?.status()).toBeLessThan(500);
  await expect(page.getByRole('heading', { name: 'kd02109' })).toBeVisible();
});

test('blog listing renders its heading without a server error', async ({
  page,
}) => {
  const response = await page.goto('/blogs');

  expect(response?.status()).toBeLessThan(500);
  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
});

test('projects route renders a known project without a server error', async ({
  page,
}) => {
  const response = await page.goto('/projects');

  expect(response?.status()).toBeLessThan(500);
  await expect(
    page.getByRole('heading', { name: 'NextJS Blog' }),
  ).toBeVisible();
});

test('known article route renders the article title without a server error', async ({
  page,
}) => {
  const response = await page.goto('/blogs/blog/react/react-design-pattern');

  expect(response?.status()).toBeLessThan(500);
  await expect(
    page.getByRole('heading', { name: 'React의 디자인 패턴', exact: true }),
  ).toBeVisible();
});

test('unknown article route returns not found', async ({ page }) => {
  const response = await page.goto('/blogs/blog/react/not-a-real-article');

  expect(response?.status()).toBe(404);
});
