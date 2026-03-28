// ============================================
// Restaurant OS - OpenAPI Documentation
// API Documentation using OpenAPI 3.0 Specification
// ============================================

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Restaurant OS API',
    description: 'Africa-First Restaurant Management System API. Supports Mobile Money payments (Orange Money, MTN MoMo, Wave, M-Pesa), multi-tenant architecture, and real-time notifications.',
    version: '1.0.0',
    contact: {
      name: 'Restaurant OS Support',
      email: 'support@restaurant-os.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
    {
      url: 'https://api.restaurant-os.com/api',
      description: 'Production server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Orders', description: 'Order management' },
    { name: 'Menu', description: 'Menu and product management' },
    { name: 'Customers', description: 'Customer management' },
    { name: 'Drivers', description: 'Driver management' },
    { name: 'Deliveries', description: 'Delivery tracking' },
    { name: 'Reservations', description: 'Table reservations' },
    { name: 'Payments', description: 'Payment processing' },
    { name: 'Dashboard', description: 'Analytics and dashboard' },
    { name: 'Webhooks', description: 'Mobile Money webhooks' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from login endpoint',
      },
    },
    schemas: {
      // Auth
      LoginRequest: {
        type: 'object',
        required: ['action', 'password'],
        properties: {
          action: { type: 'string', enum: ['login'] },
          email: { type: 'string', format: 'email', description: 'Email address' },
          phone: { type: 'string', description: 'Phone number with country code' },
          password: { type: 'string', minLength: 6 },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['action', 'email', 'password'],
        properties: {
          action: { type: 'string', enum: ['register'] },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          password: { type: 'string', minLength: 8 },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['CUSTOMER', 'DRIVER', 'STAFF'] },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              token: { type: 'string' },
              refreshToken: { type: 'string' },
              expiresAt: { type: 'string', format: 'date-time' },
            },
          },
          message: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['SUPER_ADMIN', 'ORG_ADMIN', 'RESTAURANT_ADMIN', 'STAFF', 'DRIVER', 'CUSTOMER'] },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          avatar: { type: 'string' },
        },
      },

      // Orders
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          orderNumber: { type: 'string', example: 'ORD-2024-0145' },
          restaurantId: { type: 'string' },
          customerName: { type: 'string' },
          customerPhone: { type: 'string' },
          customerEmail: { type: 'string', format: 'email' },
          orderType: { type: 'string', enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'DRIVE_THRU'] },
          status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'] },
          paymentStatus: { type: 'string', enum: ['PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'FAILED'] },
          subtotal: { type: 'number' },
          total: { type: 'number' },
          deliveryFee: { type: 'number' },
          deliveryAddress: { type: 'string' },
          notes: { type: 'string' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          itemName: { type: 'string' },
          quantity: { type: 'integer' },
          unitPrice: { type: 'number' },
          totalPrice: { type: 'number' },
          status: { type: 'string' },
          notes: { type: 'string' },
        },
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['restaurantId', 'customerName', 'customerPhone', 'items'],
        properties: {
          restaurantId: { type: 'string' },
          customerId: { type: 'string' },
          customerName: { type: 'string' },
          customerPhone: { type: 'string' },
          customerEmail: { type: 'string', format: 'email' },
          orderType: { type: 'string', enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'DRIVE_THRU'], default: 'DELIVERY' },
          tableId: { type: 'string' },
          tableNumber: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['itemName', 'quantity', 'unitPrice'],
              properties: {
                menuItemId: { type: 'string' },
                itemName: { type: 'string' },
                quantity: { type: 'integer', minimum: 1 },
                unitPrice: { type: 'number', minimum: 0 },
                variantId: { type: 'string' },
                options: { type: 'string' },
                notes: { type: 'string' },
              },
            },
          },
          deliveryAddress: { type: 'string' },
          deliveryCity: { type: 'string' },
          deliveryNotes: { type: 'string' },
          deliveryFee: { type: 'number', default: 0 },
          scheduledAt: { type: 'string', format: 'date-time' },
          discount: { type: 'number', default: 0 },
          discountCode: { type: 'string' },
          notes: { type: 'string' },
          paymentMethod: { type: 'string', enum: ['CASH', 'MOBILE_MONEY_ORANGE', 'MOBILE_MONEY_MTN', 'MOBILE_MONEY_WAVE', 'MOBILE_MONEY_MPESA', 'CARD', 'WALLET'] },
          loyaltyPointsUsed: { type: 'integer', default: 0 },
        },
      },

      // Payments
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          orderId: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string', example: 'XOF' },
          method: { type: 'string', enum: ['CASH', 'MOBILE_MONEY_ORANGE', 'MOBILE_MONEY_MTN', 'MOBILE_MONEY_WAVE', 'MOBILE_MONEY_MPESA', 'CARD', 'WALLET'] },
          status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'PAID', 'PARTIAL', 'FAILED', 'REFUNDED', 'CANCELLED'] },
          transactionId: { type: 'string' },
          providerReference: { type: 'string' },
          phoneNumber: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          processedAt: { type: 'string', format: 'date-time' },
        },
      },

      // Customer
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          totalOrders: { type: 'integer' },
          totalSpent: { type: 'number' },
          loyaltyPoints: { type: 'integer' },
          isVip: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // Driver
      Driver: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          status: { type: 'string', enum: ['online', 'offline', 'busy', 'suspended'] },
          vehicleType: { type: 'string', enum: ['motorcycle', 'bicycle', 'car', 'scooter'] },
          vehiclePlate: { type: 'string' },
          totalDeliveries: { type: 'integer' },
          totalEarnings: { type: 'number' },
          rating: { type: 'number' },
          currentLat: { type: 'number' },
          currentLng: { type: 'number' },
          walletBalance: { type: 'number' },
        },
      },

      // Delivery
      Delivery: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          orderId: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'SEARCHING_DRIVER', 'DRIVER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED'] },
          driver: { $ref: '#/components/schemas/Driver' },
          pickupAddress: { type: 'string' },
          dropoffAddress: { type: 'string' },
          estimatedTime: { type: 'integer', description: 'Estimated minutes' },
          distance: { type: 'number', description: 'Distance in km' },
          deliveryFee: { type: 'number' },
          trackingEvents: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                event: { type: 'string' },
                lat: { type: 'number' },
                lng: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },

      // Reservation
      Reservation: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          guestName: { type: 'string' },
          guestPhone: { type: 'string' },
          guestEmail: { type: 'string', format: 'email' },
          partySize: { type: 'integer' },
          date: { type: 'string', format: 'date-time' },
          time: { type: 'string', example: '19:30' },
          status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] },
          occasion: { type: 'string', enum: ['birthday', 'anniversary', 'business', 'date', 'other'] },
          specialRequests: { type: 'string' },
          tableNumber: { type: 'string' },
        },
      },

      // Error
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },

      // Success Response
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string' },
        },
      },

      // Paginated Response
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              data: { type: 'array', items: {} },
              total: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
    },
  },
  paths: {
    // Auth
    '/auth': {
      get: {
        tags: ['Auth'],
        summary: 'Get current session',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current session info',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Auth'],
        summary: 'Login or Register',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/LoginRequest' },
                  { $ref: '#/components/schemas/RegisterRequest' },
                ],
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          201: { description: 'Registration successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'Invalid request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // Orders
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List orders',
        parameters: [
          { name: 'restaurantId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'] } },
          { name: 'orderType', in: 'query', schema: { type: 'string', enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'DRIVE_THRU'] } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'demo', in: 'query', schema: { type: 'string' }, description: 'Set to "true" for demo data' },
        ],
        responses: {
          200: { description: 'List of orders', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create order',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderRequest' } } },
        },
        responses: {
          201: { description: 'Order created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // Dashboard
    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard analytics',
        parameters: [
          { name: 'organizationId', in: 'query', schema: { type: 'string' } },
          { name: 'restaurantId', in: 'query', schema: { type: 'string' } },
          { name: 'period', in: 'query', schema: { type: 'string', enum: ['today', 'week', 'month'], default: 'today' } },
          { name: 'demo', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Dashboard data', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
        },
      },
    },

    // Webhooks
    '/webhooks/orange-money': {
      post: {
        tags: ['Webhooks'],
        summary: 'Orange Money payment webhook',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  transaction_id: { type: 'string' },
                  status: { type: 'string', enum: ['SUCCESS', 'FAILED', 'PENDING', 'CANCELLED'] },
                  amount: { type: 'number' },
                  currency: { type: 'string' },
                  phone_number: { type: 'string' },
                  order_id: { type: 'string' },
                  pay_token: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Webhook processed', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { description: 'Invalid signature', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Payment not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/webhooks/mtn-momo': {
      post: {
        tags: ['Webhooks'],
        summary: 'MTN MoMo payment webhook',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reference: { type: 'string' },
                  status: { type: 'string', enum: ['SUCCESSFUL', 'FAILED', 'PENDING', 'TIMEOUT'] },
                  amount: { type: 'string' },
                  currency: { type: 'string' },
                  financialTransactionId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Webhook processed' },
        },
      },
    },
    '/webhooks/wave': {
      post: {
        tags: ['Webhooks'],
        summary: 'Wave payment webhook',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'string', enum: ['succeeded', 'failed', 'pending', 'cancelled'] },
                  amount: { type: 'string' },
                  currency: { type: 'string' },
                  client_reference: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Webhook processed' },
        },
      },
    },
    '/webhooks/mpesa': {
      post: {
        tags: ['Webhooks'],
        summary: 'M-Pesa STK Push callback',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  Body: {
                    type: 'object',
                    properties: {
                      stkCallback: {
                        type: 'object',
                        properties: {
                          MerchantRequestID: { type: 'string' },
                          CheckoutRequestID: { type: 'string' },
                          ResultCode: { type: 'integer' },
                          ResultDesc: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Webhook processed' },
        },
      },
    },
  },
};

export default openApiSpec;
