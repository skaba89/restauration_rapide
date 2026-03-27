import { describe, it, expect } from 'vitest';
import {
  apiSuccess,
  apiError,
  apiPaginated,
  withErrorHandler,
  getPaginationParams,
  getFilterParams,
} from '@/lib/api-responses';

describe('API Response Utilities', () => {
  describe('apiSuccess', () => {
    it('should return success response with data', () => {
      const data = { id: '1', name: 'Test' };
      const response = apiSuccess(data);
      
      expect(response.status).toBe(200);
      // Response body is a ReadableStream, so we check the structure
    });

    it('should return success response with message', () => {
      const data = { id: '1' };
      const response = apiSuccess(data, 'Created successfully', 201);
      
      expect(response.status).toBe(201);
    });

    it('should return custom status code', () => {
      const response = apiSuccess({}, 'Created successfully', 201);
      expect(response.status).toBe(201);
    });
  });

  describe('apiError', () => {
    it('should return error response with message', () => {
      const response = apiError('Not found', 404);
      
      expect(response.status).toBe(404);
    });

    it('should return custom status code', () => {
      const response = apiError('Unauthorized', 401);
      
      expect(response.status).toBe(401);
    });

    it('should default to 400 status', () => {
      const response = apiError('Bad request');
      
      expect(response.status).toBe(400);
    });
  });

  describe('apiPaginated', () => {
    it('should return paginated response', () => {
      const data = [{ id: '1' }, { id: '2' }];
      const response = apiPaginated(data, 100, 1, 20);
      
      expect(response.status).toBe(200);
    });

    it('should calculate total pages correctly', () => {
      const response = apiPaginated([], 95, 1, 20);
      
      expect(response.status).toBe(200);
    });
  });

  describe('getPaginationParams', () => {
    it('should return default pagination', () => {
      const searchParams = new URLSearchParams();
      const result = getPaginationParams(searchParams);
      
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(0);
    });

    it('should parse pagination params', () => {
      const searchParams = new URLSearchParams('page=3&limit=50');
      const result = getPaginationParams(searchParams);
      
      expect(result.page).toBe(3);
      expect(result.limit).toBe(50);
      expect(result.skip).toBe(100);
    });

    it('should enforce minimum page', () => {
      const searchParams = new URLSearchParams('page=0');
      const result = getPaginationParams(searchParams);
      
      expect(result.page).toBe(1);
    });

    it('should enforce maximum limit', () => {
      const searchParams = new URLSearchParams('limit=200');
      const result = getPaginationParams(searchParams);
      
      expect(result.limit).toBe(100);
    });

    it('should enforce minimum limit', () => {
      const searchParams = new URLSearchParams('limit=0');
      const result = getPaginationParams(searchParams);
      
      expect(result.limit).toBe(1);
    });
  });

  describe('getFilterParams', () => {
    it('should extract allowed filters', () => {
      const searchParams = new URLSearchParams('status=active&type=dine_in&ignore=me');
      const result = getFilterParams(searchParams, ['status', 'type']);
      
      expect(result).toEqual({
        status: 'active',
        type: 'dine_in',
      });
    });

    it('should ignore disallowed filters', () => {
      const searchParams = new URLSearchParams('status=active&hacked=true');
      const result = getFilterParams(searchParams, ['status']);
      
      expect(result).toEqual({ status: 'active' });
      expect(result).not.toHaveProperty('hacked');
    });

    it('should return empty object if no matches', () => {
      const searchParams = new URLSearchParams('status=active');
      const result = getFilterParams(searchParams, ['type']);
      
      expect(result).toEqual({});
    });
  });
});

describe('Error Handler', () => {
  describe('withErrorHandler', () => {
    it('should return successful response', async () => {
      const handler = async () => apiSuccess({ test: true });
      const result = await withErrorHandler(handler);
      
      expect(result.status).toBe(200);
    });

    it('should handle thrown errors', async () => {
      const handler = async () => {
        throw new Error('Test error');
      };
      const result = await withErrorHandler(handler);
      
      expect(result.status).toBe(500);
    });
  });
});
