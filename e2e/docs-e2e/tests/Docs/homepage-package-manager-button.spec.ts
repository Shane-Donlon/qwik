import { test, expect } from '@playwright/test';

test('Homepage Create Button works NPM', async ({ page, context }) => {
  await page.goto('/');
  const currentUrl = page.url();
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: currentUrl });
  await expect(page).toHaveTitle('Framework reimagined for the edge! 📚 Qwik Documentation');
  const packageManagerButton = page.locator('#package-manager-text');
  await expect(packageManagerButton).toContainText('npm create qwik@latest');
  await packageManagerButton.click();
  await expect(packageManagerButton).toContainText('Copied to Clipboard');
  const clipboardText = await page.evaluate(async () => {
    return await navigator.clipboard.readText();
  });
  expect(clipboardText).toBe('npm create qwik@latest');
  await expect(packageManagerButton).toContainText('npm create qwik@latest');
});

test('Homepage Create Button works PNPM', async ({ page, context }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pkg-manager-preference', 'pnpm');
  });
  await page.goto('/');
  const currentUrl = page.url();
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: currentUrl });
  const packageManagerButton = page.locator('#package-manager-text');
  await expect(packageManagerButton).toContainText('pnpm create qwik@latest');
  await packageManagerButton.click();
  await expect(packageManagerButton).toContainText('Copied to Clipboard');
  const clipboardText = await page.evaluate(async () => {
    return await navigator.clipboard.readText();
  });
  expect(clipboardText).toBe('pnpm create qwik@latest');
  await expect(packageManagerButton).toContainText('pnpm create qwik@latest');
});

test('Homepage Create Button works Yarn', async ({ page, context }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pkg-manager-preference', 'yarn');
  });
  await page.goto('/');
  const currentUrl = page.url();
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: currentUrl });
  const packageManagerButton = page.locator('#package-manager-text');
  await expect(packageManagerButton).toContainText('yarn create qwik@latest');
  await packageManagerButton.click();
  await expect(packageManagerButton).toContainText('Copied to Clipboard');
  const clipboardText = await page.evaluate(async () => {
    return await navigator.clipboard.readText();
  });
  expect(clipboardText).toBe('yarn create qwik@latest');
  await expect(packageManagerButton).toContainText('yarn create qwik@latest');
});

test('Homepage Create Button works Bun', async ({ page, context }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pkg-manager-preference', 'bun');
  });
  await page.goto('/');
  const currentUrl = page.url();
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: currentUrl });
  const packageManagerButton = page.locator('#package-manager-text');
  await expect(packageManagerButton).toContainText('bun create qwik@latest');
  await packageManagerButton.click();
  await expect(packageManagerButton).toContainText('Copied to Clipboard');
  const clipboardText = await page.evaluate(async () => {
    return await navigator.clipboard.readText();
  });
  expect(clipboardText).toBe('bun create qwik@latest');
  await expect(packageManagerButton).toContainText('bun create qwik@latest');
});

test('Homepage Create Button works NPM With Local Storage', async ({ page, context }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pkg-manager-preference', 'npm');
  });
  await page.goto('/');
  const currentUrl = page.url();
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: currentUrl });
  const packageManagerButton = page.locator('#package-manager-text');
  await expect(packageManagerButton).toContainText('npm create qwik@latest');
  await packageManagerButton.click();
  await expect(packageManagerButton).toContainText('Copied to Clipboard');
  const clipboardText = await page.evaluate(async () => {
    return await navigator.clipboard.readText();
  });
  expect(clipboardText).toBe('npm create qwik@latest');
  await expect(packageManagerButton).toContainText('npm create qwik@latest');
});

test('Homepage Create Button works NPM With incorrect Storage Item', async ({ page, context }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pkg-manager-preference', 'sdfd');
  });
  await page.goto('/');
  const currentUrl = page.url();
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: currentUrl });
  const packageManagerButton = page.locator('#package-manager-text');
  await expect(packageManagerButton).toContainText('npm create qwik@latest');
  await packageManagerButton.click();
  await expect(packageManagerButton).toContainText('Copied to Clipboard');
  const clipboardText = await page.evaluate(async () => {
    return await navigator.clipboard.readText();
  });
  expect(clipboardText).toBe('npm create qwik@latest');
  await expect(packageManagerButton).toContainText('npm create qwik@latest');
});
