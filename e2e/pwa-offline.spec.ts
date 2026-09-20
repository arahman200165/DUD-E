import { expect, test } from '@playwright/test';

// Verifies the PWA/offline smoke requirement: after the service worker has
// installed and activated on a first successful load, the cached app shell
// still renders once the network is cut — not just that the app works
// online.
test('the cached app shell still renders after going offline', async ({ page, context }) => {
  await page.goto('/DUDE/');
  await expect(page.getByRole('heading', { name: 'Deck' })).toBeVisible();

  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 35_000 });

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Deck' })).toBeVisible();

  await context.setOffline(true);
  try {
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Deck' })).toBeVisible();
    await expect(page.locator('app-sidebar')).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
