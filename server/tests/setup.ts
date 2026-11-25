process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

// Tests are hermetic: they must not depend on a developer's .env file.
process.env.SUPABASE_URL ??= 'https://test-project.supabase.co';
process.env.SUPABASE_ANON_KEY ??= 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test-service-role-key';
process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/sms_test';
process.env.DIRECT_URL ??= 'postgresql://postgres:postgres@localhost:5432/sms_test';
process.env.JWT_SECRET ??= 'test-access-secret-that-is-long-enough';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-that-is-long-enough';
process.env.FRONTEND_URL ??= 'http://localhost:5173';
