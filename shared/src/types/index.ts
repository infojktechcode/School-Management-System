export * from './user.js';
export * from './school.js';
export * from './academic.js';
export * from './finance.js';
export * from './attendance.js';
export * from './examination.js';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
