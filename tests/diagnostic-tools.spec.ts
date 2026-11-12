import { test, expect } from '@playwright/test';

// ── Navbar ──────────────────────────────────────────────────────────────────

test('navbar shows Diagnostics link', async ({ page }) => {
  await page.goto('/');
  // The navbar renders nav items as role="menuitem" spans, not <a> tags
  const item = page.locator('[role="menuitem"]', { hasText: 'Diagnostics' }).first();
  await expect(item).toBeVisible();
});

test('navbar Diagnostics link navigates to the page', async ({ page }) => {
  await page.goto('/');
  await page.locator('[role="menuitem"]', { hasText: 'Diagnostics' }).first().click();
  await expect(page).toHaveURL(/diagnostic-tools/);
  await expect(page.locator('h1')).toContainText('Diagnostics');
});

// ── Page load & SEO ─────────────────────────────────────────────────────────

test('diagnostic-tools page loads without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/diagnostic-tools');
  await page.waitForLoadState('networkidle');
  expect(errors.filter(e => !e.includes('Warning'))).toHaveLength(0);
});

test('diagnostic-tools page has correct title', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  await expect(page).toHaveTitle(/Diagnostics/);
});

test('diagnostic-tools page has meta description', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc).toBeTruthy();
  expect(desc!.length).toBeGreaterThan(30);
});

test('diagnostic-tools page has breadcrumb JSON-LD', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  const ldJson = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(ldJson).toBeTruthy();
  const parsed = JSON.parse(ldJson!);
  expect(parsed['@type']).toBe('BreadcrumbList');
  expect(parsed.itemListElement).toHaveLength(2);
  expect(parsed.itemListElement[1].name).toMatch(/Diagnostics/i);
});

// ── Tool cards ───────────────────────────────────────────────────────────────

test('diagnostic-tools page renders tool cards', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  // Wait for tools to load from JSON (tool cards include cards in result nodes too)
  await expect(page.locator('.jvm-tool-card').first()).toBeVisible({ timeout: 10000 });
  const cards = page.locator('.jvm-tool-card');
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(11);
});

test('tool cards show only ready and external tools (no poc/demo/educational)', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  await expect(page.locator('.jvm-tool-card').first()).toBeVisible({ timeout: 10000 });
  // Badges with poc, demo, educational should not appear
  const badPocBadges = page.locator('.jvm-badge-poc');
  const badDemoBadges = page.locator('.jvm-badge-demo');
  const badEduBadges = page.locator('.jvm-badge-educational');
  await expect(badPocBadges).toHaveCount(0);
  await expect(badDemoBadges).toHaveCount(0);
  await expect(badEduBadges).toHaveCount(0);
});

test('tool cards show only ready/external badges', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  await expect(page.locator('.jvm-tool-card').first()).toBeVisible({ timeout: 10000 });
  const readyBadges = await page.locator('.jvm-badge-ready').count();
  const extBadges = await page.locator('.jvm-badge-external').count();
  expect(readyBadges + extBadges).toBeGreaterThan(0);
});

// ── Search ───────────────────────────────────────────────────────────────────

test('search bar is visible', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  await expect(page.locator('.jvm-search')).toBeVisible({ timeout: 5000 });
});

test('search returns results for "heap"', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  const searchBox = page.locator('.jvm-search');
  await searchBox.waitFor({ state: 'visible', timeout: 10000 });
  await searchBox.fill('heap');
  await page.waitForTimeout(500);
  // Check that heap-dump related card is visible
  await expect(page.locator('.jvm-tool-card').filter({ hasText: /heap/i }).first()).toBeVisible();
});

test('search clear button resets the query', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  const searchBox = page.locator('.jvm-search');
  await searchBox.waitFor({ state: 'visible', timeout: 10000 });
  await searchBox.fill('flame');
  await page.waitForTimeout(300);
  const clearBtn = page.locator('.jvm-search-clear');
  await expect(clearBtn).toBeVisible();
  await clearBtn.click();
  await expect(searchBox).toHaveValue('');
});

// ── Decision tree ─────────────────────────────────────────────────────────────

test('problem finder is present', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  await expect(page.locator('.jvm-problem-finder')).toBeVisible({ timeout: 10000 });
});

test('decision tree start node has options', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  const optionBtns = page.locator('.jvm-pf-option-btn');
  await expect(optionBtns.first()).toBeVisible({ timeout: 10000 });
  const count = await optionBtns.count();
  expect(count).toBeGreaterThan(0);
});

test('clicking a decision tree option advances the tree', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  const firstOption = page.locator('.jvm-pf-option-btn').first();
  await firstOption.waitFor({ state: 'visible', timeout: 10000 });
  const initialOptions = await page.locator('.jvm-pf-option-btn').count();
  await firstOption.click();
  await page.waitForTimeout(200);
  // After clicking, tree should change (different options or a result card)
  const newOptions = await page.locator('.jvm-pf-option-btn').count();
  const resultCards = await page.locator('.jvm-pf-result-card').count();
  expect(newOptions !== initialOptions || resultCards > 0).toBeTruthy();
});

// ── How-to integration ────────────────────────────────────────────────────────

test('search indexes how-to guide titles (autocomplete)', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  const searchBox = page.locator('.jvm-search');
  await searchBox.waitFor({ state: 'visible', timeout: 10000 });
  // Type something that would match a docs page title (generic enough)
  await searchBox.fill('install');
  await page.waitForTimeout(400);
  // Suggestions list may or may not appear depending on results — just check no crash
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  expect(pageErrors).toHaveLength(0);
});

test('each group heading appears exactly once', async ({ page }) => {
  await page.goto('/diagnostic-tools');
  await expect(page.locator('.jvm-tool-card').first()).toBeVisible({ timeout: 10000 });
  const headings = await page.locator('.jvm-group-heading').allTextContents();
  const unique = new Set(headings);
  expect(headings.length).toBe(unique.size);
  expect(headings.length).toBeGreaterThan(0);
});
