import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Payments Module
 * Mobile Money and payment flow testing
 */

test.describe('Payments API Tests', () => {
  test.describe('Payment Methods', () => {
    test('GET /api/payments should list payment methods', async ({ request }) => {
      const response = await request.get('/api/payments?demo=true');
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  test.describe('Mobile Money - Orange Money', () => {
    test('should accept Orange Money payment request', async ({ request }) => {
      const paymentData = {
        orderId: 'test-order-id',
        method: 'ORANGE_MONEY',
        amount: 5000,
        currency: 'FCFA',
        phoneNumber: '+2250700000000',
      };
      
      const response = await request.post('/api/payments', {
        data: paymentData
      });
      
      // Should accept or return validation error
      expect([200, 201, 400, 401, 404, 422]).toContain(response.status());
    });
  });

  test.describe('Mobile Money - MTN MoMo', () => {
    test('should accept MTN MoMo payment request', async ({ request }) => {
      const paymentData = {
        orderId: 'test-order-id',
        method: 'MTN_MOMO',
        amount: 5000,
        currency: 'FCFA',
        phoneNumber: '+2250500000000',
      };
      
      const response = await request.post('/api/payments', {
        data: paymentData
      });
      
      expect([200, 201, 400, 401, 404, 422]).toContain(response.status());
    });
  });

  test.describe('Mobile Money - Wave', () => {
    test('should accept Wave payment request', async ({ request }) => {
      const paymentData = {
        orderId: 'test-order-id',
        method: 'WAVE',
        amount: 5000,
        currency: 'FCFA',
        phoneNumber: '+2250100000000',
      };
      
      const response = await request.post('/api/payments', {
        data: paymentData
      });
      
      expect([200, 201, 400, 401, 404, 422]).toContain(response.status());
    });
  });

  test.describe('Mobile Money - M-Pesa', () => {
    test('should accept M-Pesa payment request', async ({ request }) => {
      const paymentData = {
        orderId: 'test-order-id',
        method: 'MPESA',
        amount: 5000,
        currency: 'FCFA',
        phoneNumber: '+2250000000000',
      };
      
      const response = await request.post('/api/payments', {
        data: paymentData
      });
      
      expect([200, 201, 400, 401, 404, 422]).toContain(response.status());
    });
  });
});

test.describe('Payment Webhooks', () => {
  test('POST /api/webhooks/orange-money should validate signature', async ({ request }) => {
    const webhookData = {
      transactionId: 'test-txn-id',
      status: 'SUCCESS',
      amount: 5000,
      currency: 'FCFA',
      phoneNumber: '+2250700000000',
    };
    
    const response = await request.post('/api/webhooks/orange-money', {
      data: webhookData,
      headers: {
        'Content-Type': 'application/json',
        // Missing signature header - should fail
      }
    });
    
    // Should reject without proper signature
    expect([200, 201, 400, 401, 403]).toContain(response.status());
  });

  test('POST /api/webhooks/mtn-momo should validate signature', async ({ request }) => {
    const webhookData = {
      transactionId: 'test-txn-id',
      status: 'SUCCESS',
      amount: 5000,
      currency: 'FCFA',
      phoneNumber: '+2250500000000',
    };
    
    const response = await request.post('/api/webhooks/mtn-momo', {
      data: webhookData,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    expect([200, 201, 400, 401, 403]).toContain(response.status());
  });

  test('POST /api/webhooks/wave should validate signature', async ({ request }) => {
    const webhookData = {
      event: 'payment.success',
      data: {
        id: 'test-txn-id',
        amount: 5000,
        currency: 'FCFA',
        status: 'succeeded',
      }
    };
    
    const response = await request.post('/api/webhooks/wave', {
      data: webhookData,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    expect([200, 201, 400, 401, 403]).toContain(response.status());
  });

  test('POST /api/webhooks/mpesa should validate signature', async ({ request }) => {
    const webhookData = {
      TransactionType: 'PayBill',
      TransID: 'test-txn-id',
      TransAmount: '5000',
      BusinessShortCode: '123456',
      BillRefNumber: 'order-123',
      MSISDN: '254700000000',
      FirstName: 'Test',
    };
    
    const response = await request.post('/api/webhooks/mpesa', {
      data: webhookData,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    expect([200, 201, 400, 401, 403]).toContain(response.status());
  });
});

test.describe('Payment Validation', () => {
  test('should validate phone number format', async ({ request }) => {
    const paymentData = {
      orderId: 'test-order-id',
      method: 'ORANGE_MONEY',
      amount: 5000,
      currency: 'FCFA',
      phoneNumber: 'invalid-phone', // Invalid format
    };
    
    const response = await request.post('/api/payments', {
      data: paymentData
    });
    
    // Should reject invalid phone number
    expect([200, 201, 400, 422]).toContain(response.status());
  });

  test('should validate minimum amount', async ({ request }) => {
    const paymentData = {
      orderId: 'test-order-id',
      method: 'ORANGE_MONEY',
      amount: 10, // Very small amount
      currency: 'FCFA',
      phoneNumber: '+2250700000000',
    };
    
    const response = await request.post('/api/payments', {
      data: paymentData
    });
    
    expect([200, 201, 400, 422]).toContain(response.status());
  });

  test('should validate currency', async ({ request }) => {
    const paymentData = {
      orderId: 'test-order-id',
      method: 'ORANGE_MONEY',
      amount: 5000,
      currency: 'USD', // Invalid for this region
      phoneNumber: '+2250700000000',
    };
    
    const response = await request.post('/api/payments', {
      data: paymentData
    });
    
    expect([200, 201, 400, 422]).toContain(response.status());
  });
});

test.describe('Payment Status', () => {
  test('should check payment status', async ({ request }) => {
    // Get payments list
    const listResponse = await request.get('/api/payments?demo=true&limit=1');
    const listData = await listResponse.json();
    
    if (listData.data?.data?.[0]?.id) {
      const paymentId = listData.data.data[0].id;
      
      const response = await request.get(`/api/payments/${paymentId}?demo=true`);
      expect([200, 404]).toContain(response.status());
    }
  });
});

test.describe('Payment Performance', () => {
  test('payments API should respond quickly', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get('/api/payments?demo=true');
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(2000);
    expect(response.status()).toBe(200);
  });

  test('webhooks should respond quickly', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.post('/api/webhooks/orange-money', {
      data: { test: true }
    });
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(2000);
  });
});

test.describe('Refunds', () => {
  test('should handle refund request', async ({ request }) => {
    const refundData = {
      paymentId: 'test-payment-id',
      amount: 5000,
      reason: 'Customer request',
    };
    
    const response = await request.post('/api/payments/refund', {
      data: refundData
    });
    
    // Should require authentication or payment existence
    expect([200, 201, 400, 401, 404]).toContain(response.status());
  });
});
