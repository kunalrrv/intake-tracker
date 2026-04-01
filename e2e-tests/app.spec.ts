import { test, expect } from '@playwright/test';

test.describe('Mindful Intake Tracker App', () => {
  test('should load the app and show the login screen', async ({ page }) => {
    await page.goto('/');

    // Check if the title is correct
    await expect(page).toHaveTitle(/Mindful Intake Tracker/i);

    // Wait for the login screen to appear
    const loginHeading = page.locator('h1', { hasText: /Intake Tracker/i });
    await expect(loginHeading).toBeVisible();

    // Check for the Sign In button
    const signInButton = page.locator('button', { hasText: /Sign In/i });
    await expect(signInButton).toBeVisible();
  });
});
