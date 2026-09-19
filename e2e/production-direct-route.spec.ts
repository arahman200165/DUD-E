import { expect, test } from '@playwright/test';

// Verifies the GitHub Pages SPA-fallback round trip (public/404.html's
// redirect script -> src/index.html's decode script -> Angular router)
// actually resolves a direct/bookmarked/refreshed deep tool URL, not just
// in-app client-side navigation.
test('direct-navigating to a nested tool URL resolves the correct tool', async ({ page }) => {
  await page.goto('/DUD-E/tools/json');

  await expect(page).toHaveURL(/\/DUD-E\/tools\/json$/);
  await expect(page.getByRole('heading', { name: 'JSON Formatter' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).not.toBeVisible();
  await expect(page.locator('app-sidebar')).toBeVisible();
});
