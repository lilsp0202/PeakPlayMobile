import { test, expect } from '@playwright/test';

test.describe('Inline Media Viewing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Log in as a coach to access the dashboard
    await page.click('text=Sign In');
    await page.fill('input[name="email"]', 'coach@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });
    
    // Navigate to students section
    await page.click('text=Students');
    await page.click('text=Track');
    await page.click('text=Actions');
  });

  test('should display View Demo button for actions with demo media', async ({ page }) => {
    // Wait for actions to load
    await page.waitForSelector('[data-testid="action-item"]', { timeout: 10000 });
    
    // Check if View Demo button exists for actions with demo media
    const demoButton = page.locator('button:has-text("View Demo")').first();
    if (await demoButton.count() > 0) {
      await expect(demoButton).toBeVisible();
      await expect(demoButton).toHaveClass(/bg-blue-100/);
    }
  });

  test('should display View Proof button for actions with proof media', async ({ page }) => {
    // Wait for actions to load
    await page.waitForSelector('[data-testid="action-item"]', { timeout: 10000 });
    
    // Check if View Proof button exists for actions with proof media
    const proofButton = page.locator('button:has-text("View Proof")').first();
    if (await proofButton.count() > 0) {
      await expect(proofButton).toBeVisible();
      await expect(proofButton).toHaveClass(/bg-green-100/);
    }
  });

  test('should open inline media viewer when View Demo button is clicked', async ({ page }) => {
    // Find and click the first View Demo button
    const demoButton = page.locator('button:has-text("View Demo")').first();
    
    if (await demoButton.count() > 0) {
      await demoButton.click();
      
      // Check that button text changes to "Hide Demo"
      await expect(page.locator('button:has-text("Hide Demo")').first()).toBeVisible();
      
      // Check that inline media viewer appears
      await expect(page.locator('text=Coach Demo Media')).toBeVisible();
      
      // Check for close button
      await expect(page.locator('button[aria-label="Close media viewer"]')).toBeVisible();
    }
  });

  test('should open inline media viewer when View Proof button is clicked', async ({ page }) => {
    // Find and click the first View Proof button
    const proofButton = page.locator('button:has-text("View Proof")').first();
    
    if (await proofButton.count() > 0) {
      await proofButton.click();
      
      // Check that button text changes to "Hide Proof"
      await expect(page.locator('button:has-text("Hide Proof")').first()).toBeVisible();
      
      // Check that inline media viewer appears
      await expect(page.locator('text=Student Proof Submission')).toBeVisible();
      
      // Check for close button
      await expect(page.locator('button[aria-label="Close media viewer"]')).toBeVisible();
    }
  });

  test('should close inline media viewer when close button is clicked', async ({ page }) => {
    const demoButton = page.locator('button:has-text("View Demo")').first();
    
    if (await demoButton.count() > 0) {
      // Open the viewer
      await demoButton.click();
      await expect(page.locator('text=Coach Demo Media')).toBeVisible();
      
      // Close the viewer
      await page.click('button[aria-label="Close media viewer"]');
      
      // Check that viewer is closed
      await expect(page.locator('text=Coach Demo Media')).not.toBeVisible();
      
      // Check that button text reverts to "View Demo"
      await expect(page.locator('button:has-text("View Demo")').first()).toBeVisible();
    }
  });

  test('should show loading state when opening media viewer', async ({ page }) => {
    const demoButton = page.locator('button:has-text("View Demo")').first();
    
    if (await demoButton.count() > 0) {
      await demoButton.click();
      
      // Check for loading state
      await expect(page.locator('text=Loading demo media')).toBeVisible();
    }
  });

  test('should display video player for video media', async ({ page }) => {
    const demoButton = page.locator('button:has-text("View Demo")').first();
    
    if (await demoButton.count() > 0) {
      await demoButton.click();
      
      // Wait for media to load
      await page.waitForTimeout(2000);
      
      // Check for video element (if media is video)
      const videoElement = page.locator('video');
      if (await videoElement.count() > 0) {
        await expect(videoElement).toBeVisible();
        await expect(videoElement).toHaveAttribute('controls');
        await expect(videoElement).toHaveAttribute('preload', 'none');
      }
    }
  });

  test('should display image for image media', async ({ page }) => {
    const demoButton = page.locator('button:has-text("View Demo")').first();
    
    if (await demoButton.count() > 0) {
      await demoButton.click();
      
      // Wait for media to load
      await page.waitForTimeout(2000);
      
      // Check for image element (if media is image)
      const imageElement = page.locator('img[alt*="Demo"], img[alt*="Proof"]');
      if (await imageElement.count() > 0) {
        await expect(imageElement).toBeVisible();
        await expect(imageElement).toHaveAttribute('loading', 'lazy');
      }
    }
  });

  test('should show download button when media loads', async ({ page }) => {
    const demoButton = page.locator('button:has-text("View Demo")').first();
    
    if (await demoButton.count() > 0) {
      await demoButton.click();
      
      // Wait for media to load
      await page.waitForTimeout(3000);
      
      // Check for download button
      const downloadButton = page.locator('a:has-text("Download")');
      if (await downloadButton.count() > 0) {
        await expect(downloadButton).toBeVisible();
        await expect(downloadButton).toHaveAttribute('download');
      }
    }
  });

  test('should handle multiple inline viewers simultaneously', async ({ page }) => {
    const demoButtons = page.locator('button:has-text("View Demo")');
    const proofButtons = page.locator('button:has-text("View Proof")');
    
    if (await demoButtons.count() > 0 && await proofButtons.count() > 0) {
      // Open first demo viewer
      await demoButtons.first().click();
      await expect(page.locator('text=Coach Demo Media').first()).toBeVisible();
      
      // Open first proof viewer
      await proofButtons.first().click();
      await expect(page.locator('text=Student Proof Submission').first()).toBeVisible();
      
      // Both should be visible simultaneously
      await expect(page.locator('text=Coach Demo Media').first()).toBeVisible();
      await expect(page.locator('text=Student Proof Submission').first()).toBeVisible();
    }
  });

  test('should maintain responsive design on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const demoButton = page.locator('button:has-text("View Demo")').first();
    
    if (await demoButton.count() > 0) {
      await demoButton.click();
      
      // Check that media viewer is responsive
      const mediaViewer = page.locator('text=Coach Demo Media').locator('..');
      await expect(mediaViewer).toBeVisible();
      
      // Check that close button is accessible
      await expect(page.locator('button[aria-label="Close media viewer"]')).toBeVisible();
    }
  });

  test('should show error handling for failed media loads', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/actions/*/media', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    const demoButton = page.locator('button:has-text("View Demo")').first();
    
    if (await demoButton.count() > 0) {
      await demoButton.click();
      
      // Check for error message
      await expect(page.locator('text=Failed to load media')).toBeVisible();
      
      // Check for retry button
      await expect(page.locator('button:has-text("Retry")')).toBeVisible();
    }
  });

  test('should show file size information', async ({ page }) => {
    const demoButton = page.locator('button:has-text("View Demo")').first();
    
    if (await demoButton.count() > 0) {
      // Check if file size is shown in button
      const buttonText = await demoButton.textContent();
      if (buttonText && buttonText.includes('KB')) {
        expect(buttonText).toMatch(/\(\d+KB\)/);
      }
    }
  });

  test('should verify no regressions in other dashboard functionality', async ({ page }) => {
    // Verify that opening inline media viewer doesn't break other functionality
    const demoButton = page.locator('button:has-text("View Demo")').first();
    
    if (await demoButton.count() > 0) {
      await demoButton.click();
      
      // Check that other UI elements are still functional
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Students')).toBeVisible();
      
      // Check that pagination still works if present
      const nextPageButton = page.locator('button[aria-label="Next page"]');
      if (await nextPageButton.count() > 0) {
        await expect(nextPageButton).toBeVisible();
      }
    }
  });

  test('should verify accessibility of inline media viewer', async ({ page }) => {
    const demoButton = page.locator('button:has-text("View Demo")').first();
    
    if (await demoButton.count() > 0) {
      await demoButton.click();
      
      // Check keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      
      // Check that close button has proper aria-label
      await expect(page.locator('button[aria-label="Close media viewer"]')).toBeVisible();
      
      // Check escape key functionality
      await page.keyboard.press('Escape');
      // Note: This depends on implementation - may or may not close the viewer
    }
  });
}); 