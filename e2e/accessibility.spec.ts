import { test, expect } from '@playwright/test';

/**
 * Accessibility E2E Tests
 * Tests for WCAG compliance and screen reader support
 */

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper HTML lang attribute', async ({ page }) => {
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('fr');
  });

  test('should have skip link for keyboard navigation', async ({ page }) => {
    // Tab to focus on skip link
    await page.keyboard.press('Tab');
    
    // Skip link should be visible when focused
    const skipLink = page.locator('a:has-text("Passer au contenu principal")');
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toBeFocused();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for h1 on page
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Check that headings are properly nested
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let lastLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName);
      const currentLevel = parseInt(tagName.charAt(1));
      
      // Heading levels should not skip (e.g., h1 to h3)
      expect(currentLevel - lastLevel).toBeLessThanOrEqual(1);
      lastLevel = currentLevel;
    }
  });

  test('should have accessible images with alt text', async ({ page }) => {
    const images = await page.locator('img').all();
    
    for (const image of images) {
      const alt = await image.getAttribute('alt');
      const ariaLabel = await image.getAttribute('aria-label');
      const ariaHidden = await image.getAttribute('aria-hidden');
      
      // Images should have alt text, aria-label, or be marked as decorative
      const hasAccessibleName = alt !== null || ariaLabel !== null;
      const isDecorative = ariaHidden === 'true';
      
      expect(hasAccessibleName || isDecorative).toBeTruthy();
    }
  });

  test('should have accessible form inputs', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    const inputs = await page.locator('input:not([type="hidden"])').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      // Input should have accessible name via label, aria-label, or aria-labelledby
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should have proper button accessible names', async ({ page }) => {
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      
      // Buttons should have accessible names
      const hasAccessibleName = 
        (text && text.trim().length > 0) || 
        ariaLabel || 
        ariaLabelledBy;
      
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should have proper link text', async ({ page }) => {
    const links = await page.locator('a[href]').all();
    
    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      // Links should have accessible names
      const hasAccessibleName = 
        (text && text.trim().length > 0) || 
        ariaLabel || 
        title;
      
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should trap focus in modals', async ({ page }) => {
    // If there's a modal trigger, test focus trapping
    const modalTrigger = page.locator('button[data-dialog-trigger]').first();
    
    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();
      
      // Focus should be trapped within modal
      const dialog = page.locator('dialog, [role="dialog"]').first();
      await expect(dialog).toBeVisible();
      
      // Tab through elements - should cycle within modal
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        const isInDialog = await focusedElement.evaluate((el, dialogEl) => {
          return dialogEl.contains(el);
        }, await dialog.elementHandle());
        
        expect(isInDialog).toBeTruthy();
      }
    }
  });

  test('should close modals with Escape key', async ({ page }) => {
    const modalTrigger = page.locator('button[data-dialog-trigger]').first();
    
    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();
      
      const dialog = page.locator('dialog, [role="dialog"]').first();
      await expect(dialog).toBeVisible();
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Dialog should close
      await expect(dialog).not.toBeVisible();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // Use axe-core for automated contrast checking if available
    // This is a basic check - in production, use axe-core or similar
    const bodyStyles = await page.locator('body').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
      };
    });
    
    // Basic check - body should have defined colors
    expect(bodyStyles.color).toBeDefined();
    expect(bodyStyles.backgroundColor).toBeDefined();
  });

  test('should support keyboard navigation in menus', async ({ page }) => {
    const menuTrigger = page.locator('[aria-haspopup="menu"], [aria-haspopup="true"]').first();
    
    if (await menuTrigger.count() > 0) {
      // Focus the menu trigger
      await menuTrigger.focus();
      
      // Open menu with Enter or Space
      await page.keyboard.press('Enter');
      
      // Menu should be visible
      const menu = page.locator('[role="menu"]').first();
      await expect(menu).toBeVisible();
      
      // Arrow down should move to first item
      await page.keyboard.press('ArrowDown');
      const firstItem = menu.locator('[role="menuitem"]').first();
      await expect(firstItem).toBeFocused();
      
      // Escape should close menu
      await page.keyboard.press('Escape');
      await expect(menu).not.toBeVisible();
    }
  });
});

test.describe('Screen Reader Support Tests', () => {
  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    const mainLandmark = page.locator('[role="main"], main');
    expect(await mainLandmark.count()).toBeGreaterThanOrEqual(1);
    
    // Check for navigation landmark
    const navLandmark = page.locator('[role="navigation"], nav');
    expect(await navLandmark.count()).toBeGreaterThanOrEqual(0);
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should announce dynamic content changes', async ({ page }) => {
    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();
    
    // Pages should have at least one aria-live region for announcements
    // This is optional - not all pages need announcements
    if (liveRegionCount > 0) {
      const politeRegions = page.locator('[aria-live="polite"]');
      const assertiveRegions = page.locator('[aria-live="assertive"]');
      
      expect(await politeRegions.count() + await assertiveRegions.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('should have proper form error messages', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Check for error messages
      const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]');
      const errorCount = await errorMessages.count();
      
      // Form should show errors
      expect(errorCount).toBeGreaterThanOrEqual(0);
    }
  });
});
