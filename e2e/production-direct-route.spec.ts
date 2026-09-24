import { expect, test } from '@playwright/test';

// Verifies the GitHub Pages SPA-fallback round trip (public/404.html's
// redirect script -> src/index.html's decode script -> Angular router)
// actually resolves a direct/bookmarked/refreshed deep tool URL, not just
// in-app client-side navigation.
test('direct-navigating to a nested tool URL resolves the correct tool', async ({ page }) => {
  await page.goto('/DUDE/tools/json');

  await expect(page).toHaveURL(/\/DUDE\/tools\/json$/);
  await expect(page.getByRole('heading', { name: 'JSON Formatter' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).not.toBeVisible();
  await expect(page.locator('app-sidebar')).toBeVisible();
});

// Smart Paste-Detection (DUDE_PRD.md §21 Phase 21 Item 3) is a hand-wired shell route, like
// Pipelines before it — confirms it isn't relying on client-side router state a fresh load
// wouldn't have.
test('direct-navigating to the Smart Paste route resolves correctly', async ({ page }) => {
  await page.goto('/DUDE/smart-paste');

  await expect(page).toHaveURL(/\/DUDE\/smart-paste$/);
  await expect(page.getByRole('heading', { name: 'Smart Paste' })).toBeVisible();
  await expect(page.locator('app-sidebar')).toBeVisible();
});
