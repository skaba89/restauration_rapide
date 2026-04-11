// ============================================
// Restaurant OS - API Utilities
// ============================================

import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, PaginatedResponse } from '@/types';

// Standard API response helpers
export function apiSuccess<T>(data: T, message?: string, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  }, { status });
}

export function apiError(message: string, status: number = 400): NextResponse<ApiResponse<never>> {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status });
}

export function apiPaginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse<ApiResponse<PaginatedResponse<T>>> {
  return NextResponse.json({
    success: true,
    data: {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// Error handling wrapper
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  return handler().catch((error) => {
    console.error('API Error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Une erreur est survenue',
      500
    ) as NextResponse<T>;
  });
}

// Pagination helper
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// Alias for compatibility
export { getPaginationParams as getPagination };

// Filter helper
export function getFilterParams(searchParams: URLSearchParams, allowedFilters: string[]) {
  const filters: Record<string, string> = {};
  for (const filter of allowedFilters) {
    const value = searchParams.get(filter);
    if (value) {
      filters[filter] = value;
    }
  }
  return filters;
}
