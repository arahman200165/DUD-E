import { expect, test } from '@playwright/test';

// Same SPA-fallback concern as production-direct-route.spec.ts, exercised for the Pipelines
// routes — the one deliberate exception to "never edit app.routes.ts for a feature" (DUDE_PRD.md
// §21 Phase 21 Item 2).
test('direct-navigating to /pipelines resolves the pipeline list', async ({ page }) => {
  await page.goto('/DUDE/pipelines');

  await expect(page).toHaveURL(/\/DUDE\/pipelines$/);
  await expect(page.getByRole('heading', { name: 'Pipelines' })).toBeVisible();
  await expect(page.locator('app-sidebar')).toBeVisible();
});

test('direct-navigating to /pipelines/new resolves the pipeline builder', async ({ page }) => {
  await page.goto('/DUDE/pipelines/new');

  await expect(page).toHaveURL(/\/DUDE\/pipelines\/new$/);
  await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
  await expect(page.locator('app-sidebar')).toBeVisible();
});

test('direct-navigating to /pipelines/scripts resolves the script library', async ({ page }) => {
  await page.goto('/DUDE/pipelines/scripts');

  await expect(page).toHaveURL(/\/DUDE\/pipelines\/scripts$/);
  await expect(page.getByRole('heading', { name: 'My Scripts' })).toBeVisible();
  await expect(page.locator('app-sidebar')).toBeVisible();
});

test('direct-navigating to /pipelines/scripts/new resolves the script editor (not the pipeline id route)', async ({ page }) => {
  await page.goto('/DUDE/pipelines/scripts/new');

  await expect(page).toHaveURL(/\/DUDE\/pipelines\/scripts\/new$/);
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  await expect(page.locator('app-sidebar')).toBeVisible();
});
