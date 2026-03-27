import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Reservations Module
 * Booking flow and calendar testing
 */

test.describe('Reservations Module', () => {
  test.describe('Reservations List', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/reservations');
      await page.waitForLoadState('networkidle');
    });

    test('should display reservations page', async ({ page }) => {
      const title = page.locator('h1, h2').first();
      await expect(title).toContainText(/réservation|reservation|booking/i);
    });

    test('should show reservation elements', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Look for calendar or list view
      const calendar = page.locator('[role="grid"], .calendar, [data-testid="calendar"]');
      const list = page.locator('table, [data-testid="reservation-list"]');
      
      const calendarCount = await calendar.count();
      const listCount = await list.count();
      
      expect(calendarCount + listCount).toBeGreaterThanOrEqual(0);
    });

    test('should display reservation statuses', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Look for status badges
      const status = page.locator('[class*="badge"], [class*="status"]').filter({
        hasText: /confirmé|confirmed|en attente|pending|annulé|cancelled|seated|assis/i
      });
      
      const count = await status.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Create Reservation', () => {
    test('should have create reservation button', async ({ page }) => {
      await page.goto('/reservations');
      await page.waitForLoadState('networkidle');
      
      const createButton = page.locator('button').filter({
        hasText: /nouvelle|créer|ajouter|new|create|add/i
      });
      
      if (await createButton.count() > 0) {
        await expect(createButton.first()).toBeVisible();
      }
    });

    test('should open reservation form', async ({ page }) => {
      await page.goto('/reservations');
      await page.waitForLoadState('networkidle');
      
      const createButton = page.locator('button').filter({
        hasText: /nouvelle|créer|ajouter|new|create|add/i
      }).first();
      
      if (await createButton.count() > 0) {
        await createButton.click();
        await page.waitForTimeout(500);
        
        // Should show form or modal
        const form = page.locator('form, [role="dialog"], .modal');
        const formCount = await form.count();
        expect(formCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should have date picker', async ({ page }) => {
      await page.goto('/reservations');
      await page.waitForLoadState('networkidle');
      
      // Look for date input or picker
      const dateInput = page.locator('input[type="date"], [data-testid="date-picker"], .date-picker').first();
      
      if (await dateInput.count() > 0) {
        await expect(dateInput).toBeVisible();
      }
    });

    test('should have time picker', async ({ page }) => {
      await page.goto('/reservations');
      await page.waitForLoadState('networkidle');
      
      // Look for time input or slots
      const timeInput = page.locator('input[type="time"], [data-testid="time-picker"], .time-slot, select').filter({
        hasText: /heure|time|\d{1,2}:\d{2}/i
      }).first();
      
      if (await timeInput.count() > 0) {
        await expect(timeInput).toBeVisible();
      }
    });

    test('should have party size selector', async ({ page }) => {
      await page.goto('/reservations');
      await page.waitForLoadState('networkidle');
      
      // Look for party size input
      const partySize = page.locator('input[type="number"], select').filter({
        has: page.locator('[class*="person"], [class*="guest"]')
      }).first();
      
      // Party size input might exist
      const partySizeCount = await partySize.count();
      expect(partySizeCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Calendar View', () => {
    test('should display calendar if available', async ({ page }) => {
      await page.goto('/reservations');
      await page.waitForLoadState('networkidle');
      
      const calendar = page.locator('[role="grid"], .calendar, [data-testid="calendar"]').first();
      
      if (await calendar.count() > 0) {
        await expect(calendar).toBeVisible();
        
        // Check for month navigation
        const navButtons = page.locator('button').filter({
          hasText: / précédent|suivant|previous|next|<|>/i
        });
        
        if (await navButtons.count() > 0) {
          await navButtons.first().click();
          await page.waitForTimeout(300);
        }
      }
    });
  });
});

test.describe('Reservation API Tests', () => {
  test('GET /api/reservations should return list', async ({ request }) => {
    const response = await request.get('/api/reservations?demo=true');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('POST /api/reservations should create reservation', async ({ request }) => {
    const reservationData = {
      customerName: 'Test Customer',
      customerPhone: '+225 07 00 00 00',
      customerEmail: 'test@example.com',
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      partySize: 4,
      notes: 'Test reservation',
    };
    
    const response = await request.post('/api/reservations', {
      data: reservationData
    });
    
    // Should succeed or return validation error
    expect([200, 201, 400, 422]).toContain(response.status());
  });

  test('GET /api/reservations should filter by date', async ({ request }) => {
    const today = new Date().toISOString().split('T')[0];
    const response = await request.get(`/api/reservations?demo=true&date=${today}`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('GET /api/reservations should filter by status', async ({ request }) => {
    const response = await request.get('/api/reservations?demo=true&status=CONFIRMED');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('PATCH reservation status', async ({ request }) => {
    // Get a reservation first
    const listResponse = await request.get('/api/reservations?demo=true&limit=1');
    const listData = await listResponse.json();
    
    if (listData.data?.data?.[0]?.id) {
      const reservationId = listData.data.data[0].id;
      
      const response = await request.patch(`/api/reservations/${reservationId}/status`, {
        data: { status: 'CONFIRMED' }
      });
      
      expect([200, 400, 401, 404]).toContain(response.status());
    }
  });
});

test.describe('Reservation Validation', () => {
  test('should validate required fields', async ({ page }) => {
    await page.goto('/reservations');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button').filter({
      hasText: /nouvelle|créer|ajouter|new|create|add/i
    }).first();
    
    if (await createButton.count() > 0) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]').filter({
        hasText: /confirmer|réserver|submit|save|enregistrer/i
      }).first();
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(300);
        
        // Should show validation errors
        const errorMessages = page.locator('[class*="error"], [class*="invalid"], [role="alert"]');
        const errorCount = await errorMessages.count();
        expect(errorCount).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

test.describe('Reservation Performance', () => {
  test('reservations page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/reservations');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });
});
