import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show sign in page when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*signin/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('should successfully register a new athlete', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Fill registration form
    const timestamp = Date.now();
    const email = `athlete${timestamp}@example.com`;
    
    await page.getByLabel('Name').fill('Test Athlete');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Username').fill(`athlete${timestamp}`);
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByLabel('Role').selectOption('ATHLETE');
    
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Should redirect to sign in page after successful registration
    await expect(page).toHaveURL(/.*signin/);
    await expect(page.getByText(/account created successfully/i)).toBeVisible();
  });

  test('should successfully register a new coach', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Fill registration form
    const timestamp = Date.now();
    const email = `coach${timestamp}@example.com`;
    
    await page.getByLabel('Name').fill('Test Coach');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Username').fill(`coach${timestamp}`);
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByLabel('Role').selectOption('COACH');
    
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Should redirect to sign in page after successful registration
    await expect(page).toHaveURL(/.*signin/);
    await expect(page.getByText(/account created successfully/i)).toBeVisible();
  });

  test('should handle duplicate email registration', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Try to register with an existing email
    await page.getByLabel('Name').fill('Duplicate User');
    await page.getByLabel('Email').fill('existing@example.com');
    await page.getByLabel('Username').fill('duplicateuser');
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByLabel('Role').selectOption('ATHLETE');
    
    await page.getByRole('button', { name: /sign up/i }).click();
    
    await expect(page.getByText(/email already exists/i)).toBeVisible();
  });

  test('should enforce password requirements', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Try weak password
    await page.getByLabel('Password').fill('weak');
    await page.getByRole('button', { name: /sign up/i }).click();
    
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
  });

  test('should handle sign out', async ({ page, context }) => {
    // First, sign in with a test account
    await page.goto('/auth/signin');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Assume successful login redirects to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Sign out
    await page.getByRole('button', { name: /sign out/i }).click();
    
    // Should redirect to home or signin
    await expect(page).toHaveURL(/\/(signin)?$/);
    
    // Try to access protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should show Google OAuth option if enabled', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Check if Google OAuth button is present (depends on env config)
    const googleButton = page.getByRole('button', { name: /sign in with google/i });
    
    if (await googleButton.isVisible()) {
      await expect(googleButton).toBeEnabled();
    }
  });
}); 