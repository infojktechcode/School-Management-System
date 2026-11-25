import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(configDir, '../..');

// Root .env is the single source of truth; the server-level .env symlink is a fallback.
dotenv.config({ path: path.resolve(serverRoot, '../.env') });
dotenv.config({ path: path.resolve(serverRoot, '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  REDIS_URL: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  MPESA_CONSUMER_KEY: z.string().optional(),
  MPESA_CONSUMER_SECRET: z.string().optional(),
  MPESA_PASSKEY: z.string().optional(),
  MPESA_SHORTCODE: z.string().optional(),
  MPESA_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  MPESA_CALLBACK_URL: z.string().optional(),

  MAX_FILE_SIZE: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  ALLOWED_FILE_TYPES: z
    .string()
    .default('image/jpeg,image/png,image/webp,application/pdf'),

  DEFAULT_CURRENCY: z.string().default('KES'),
  DEFAULT_TIMEZONE: z.string().default('Africa/Nairobi'),
  DEFAULT_DATE_FORMAT: z.string().default('DD/MM/YYYY'),
  DEFAULT_LOCALE: z.string().default('en-KE'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || 'environment'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${details}`);
}

const env = parsed.data;

export const config = {
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  port: env.PORT,
  frontendUrl: env.FRONTEND_URL,
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  database: {
    url: env.DATABASE_URL,
    directUrl: env.DIRECT_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  redisUrl: env.REDIS_URL,
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.EMAIL_FROM,
  },
  mpesa: {
    consumerKey: env.MPESA_CONSUMER_KEY,
    consumerSecret: env.MPESA_CONSUMER_SECRET,
    passkey: env.MPESA_PASSKEY,
    shortcode: env.MPESA_SHORTCODE,
    environment: env.MPESA_ENVIRONMENT,
    callbackUrl: env.MPESA_CALLBACK_URL,
  },
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    allowedFileTypes: env.ALLOWED_FILE_TYPES.split(',').map((type) => type.trim()),
  },
  locale: {
    currency: env.DEFAULT_CURRENCY,
    timezone: env.DEFAULT_TIMEZONE,
    dateFormat: env.DEFAULT_DATE_FORMAT,
    locale: env.DEFAULT_LOCALE,
  },
} as const;
