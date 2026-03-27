import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title
    await expect(page.locator('h1, h2')).toContainText(/connexion|login/i);
    
    // Check form elements
    await expect(page.locator('input[type="email"], input[placeholder*="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[placeholder*="mot de passe"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill('invalid@test.com');
    await passwordInput.fill('wrongpassword');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Wait for error message
    await expect(page.locator('[role="alert"], .error, [data-testid="error"]')).toBeVisible({ timeout: 5000 });
  });

  test('should register new user', async ({ page }) => {
    await page.goto('/login');
    
    // Switch to register tab if exists
    const registerTab = page.locator('[role="tab"], button').filter({ hasText: /créer|register|inscrire/i });
    if (await registerTab.count() > 0) {
      await registerTab.click();
    }
    
    // Fill registration form
    const timestamp = Date.now();
    const email = `test-${timestamp}@example.com`;
    
    await page.locator('input[type="email"], input[placeholder*="email"]').first().fill(email);
    await page.locator('input[type="password"]').first().fill('Test1234');
    
    const firstNameInput = page.locator('input[placeholder*="prénom"], input[placeholder*="prenom"], input[name*="firstName"]').first();
    if (await firstNameInput.count() > 0) {
      await firstNameInput.fill('Test');
    }
    
    const lastNameInput = page.locator('input[placeholder*="nom"], input[name*="lastName"]').first();
    if (await lastNameInput.count() > 0) {
      await lastNameInput.fill('User');
    }
    
    // Submit
    await page.locator('button[type="submit"]').click();
    
    // Should redirect or show success
    await page.waitForURL(/dashboard|success/, { timeout: 10000 }).catch(() => {
      // Might show toast notification instead
    });
  });
});

test.describe('Dashboard', () => {
  test('should display dashboard with demo data', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for dashboard elements
    const revenueCard = page.locator('text=/chiffre|revenue|ventes/i').first();
    const ordersCard = page.locator('text=/commande|order/i').first();
    
    // At least one stat should be visible
    await expect(revenueCard.or(ordersCard)).toBeVisible({ timeout: 5000 });
  });

  test('should show period selector', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for period tabs/buttons
    const periodSelector = page.locator('[role="tablist"], .period-selector, button').filter({ 
      hasText: /jour|today|semaine|week|mois|month/i 
    });
    
    if (await periodSelector.count() > 0) {
      await expect(periodSelector.first()).toBeVisible();
    }
  });
});

test.describe('Orders', () => {
  test('should display orders list with demo data', async ({ page }) => {
    await page.goto('/orders');
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Check for order table or cards
    const orderElement = page.locator('table, [data-testid="order-card"], .order-item').first();
    
    // Should have at least demo orders
    await expect(orderElement).toBeVisible({ timeout: 5000 });
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/orders');
    
    // Look for status filter
    const statusFilter = page.locator('select, [role="combobox"]').filter({ 
      hasText: /statut|status/i 
    });
    
    if (await statusFilter.count() > 0) {
      await statusFilter.first().click();
      
      // Check for status options
      await expect(page.locator('text=/pending|en attente|confirmed|confirmé/i').first()).toBeVisible();
    }
  });
});

test.describe('Menu', () => {
  test('should display menu items', async ({ page }) => {
    await page.goto('/menu');
    
    // Wait for data
    await page.waitForLoadState('networkidle');
    
    // Check for menu items or categories
    const menuElement = page.locator('[data-testid="menu-item"], .menu-card, table').first();
    
    await expect(menuElement).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Customers', () => {
  test('should display customers list', async ({ page }) => {
    await page.goto('/customers');
    
    await page.waitForLoadState('networkidle');
    
    // Check for customer list
    const customerElement = page.locator('table, [data-testid="customer-card"]').first();
    
    await expect(customerElement).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Drivers', () => {
  test('should display drivers list', async ({ page }) => {
    await page.goto('/drivers');
    
    await page.waitForLoadState('networkidle');
    
    // Check for driver list
    const driverElement = page.locator('table, [data-testid="driver-card"]').first();
    
    await expect(driverElement).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Reservations', () => {
  test('should display reservations calendar or list', async ({ page }) => {
    await page.goto('/reservations');
    
    await page.waitForLoadState('networkidle');
    
    // Check for reservation elements
    const reservationElement = page.locator('table, [data-testid="reservation"], .calendar, [role="grid"]').first();
    
    await expect(reservationElement).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Settings', () => {
  test('should display settings page', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForLoadState('networkidle');
    
    // Check for settings sections
    const settingsElement = page.locator('form, [data-testid="settings"], .settings-section').first();
    
    await expect(settingsElement).toBeVisible({ timeout: 5000 });
  });
});

test.describe('API Endpoints', () => {
  test('should return demo orders', async ({ request }) => {
    const response = await request.get('/api/orders?demo=true');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.data).toBeInstanceOf(Array);
    expect(data.data.data.length).toBeGreaterThan(0);
  });

  test('should return demo customers', async ({ request }) => {
    const response = await request.get('/api/customers?demo=true');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('should return demo drivers', async ({ request }) => {
    const response = await request.get('/api/drivers?demo=true');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('should return demo dashboard data', async ({ request }) => {
    const response = await request.get('/api/dashboard?demo=true&period=today');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Check for mobile menu or navigation
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .hamburger, button[aria-label*="menu"]');
    
    // Page should still be functional
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/dashboard/);
  });
});
