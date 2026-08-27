import { ApiResponse, PaginatedResponse } from '../types';

export const success = <T>(data: T, message: string = 'Success'): ApiResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
});

export const error = (message: string, error?: string): ApiResponse => ({
  success: false,
  message,
  error,
  timestamp: new Date().toISOString(),
});

export const paginated = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): ApiResponse<PaginatedResponse<T>> => {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    message: 'Data retrieved successfully',
    data: {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
    timestamp: new Date().toISOString(),
  };
};
