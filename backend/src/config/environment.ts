import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // Database Configuration
  DATABASE_URL: z.string().min(1),

  // Redis Configuration
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // API Configuration
  API_KEY: z.string().optional(),

  // Integration Configuration (Optional in development)
  DENTRIX_API_URL: z.string().url().optional(),
  DENTRIX_API_KEY: z.string().optional(),
  DENTRIX_API_SECRET: z.string().optional(),

  DENTALINTEL_API_URL: z.string().url().optional(),
  DENTALINTEL_API_KEY: z.string().optional(),
  DENTALINTEL_API_SECRET: z.string().optional(),

  ADP_API_URL: z.string().url().optional(),
  ADP_CLIENT_ID: z.string().optional(),
  ADP_CLIENT_SECRET: z.string().optional(),

  EAGLESOFT_API_URL: z.string().url().optional(),
  EAGLESOFT_API_KEY: z.string().optional(),
  EAGLESOFT_API_SECRET: z.string().optional(),

  // Email Configuration (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // File Upload Configuration
  MAX_FILE_SIZE: z.coerce.number().default(10485760), // 10MB
  UPLOAD_PATH: z.string().default('./uploads'),

  // Security Configuration
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Cache Configuration
  CACHE_TTL: z.coerce.number().default(300), // 5 minutes
  CACHE_PREFIX: z.string().default('dental_erp:'),

  // Feature Flags
  ENABLE_REGISTRATION: z.coerce.boolean().default(true),
  ENABLE_EMAIL_VERIFICATION: z.coerce.boolean().default(false),
  ENABLE_TWO_FACTOR_AUTH: z.coerce.boolean().default(false),
  ENABLE_AUDIT_LOGGING: z.coerce.boolean().default(true),
  MOCK_INTEGRATIONS: z.coerce.boolean().default(false),

  // Development/Testing
  SEED_DATABASE: z.coerce.boolean().default(false),
  DEBUG_MODE: z.coerce.boolean().default(false),
});

// Parse and validate environment variables
let env: z.infer<typeof envSchema>;

export function validateEnvironment(): z.infer<typeof envSchema> {
  try {
    env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(error.errors.map(err => `  ${err.path.join('.')}: ${err.message}`).join('\n'));
    } else {
      console.error('❌ Environment validation failed:', error);
    }
    process.exit(1);
  }
}

// Export configuration object
export const config = {
  // Server
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL!,
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // API
  api: {
    key: process.env.API_KEY,
  },

  // Integrations
  integrations: {
    dentrix: {
      apiUrl: process.env.DENTRIX_API_URL,
      apiKey: process.env.DENTRIX_API_KEY,
      apiSecret: process.env.DENTRIX_API_SECRET,
    },
    dentalintel: {
      apiUrl: process.env.DENTALINTEL_API_URL,
      apiKey: process.env.DENTALINTEL_API_KEY,
      apiSecret: process.env.DENTALINTEL_API_SECRET,
    },
    adp: {
      apiUrl: process.env.ADP_API_URL,
      clientId: process.env.ADP_CLIENT_ID,
      clientSecret: process.env.ADP_CLIENT_SECRET,
    },
    eaglesoft: {
      apiUrl: process.env.EAGLESOFT_API_URL,
      apiKey: process.env.EAGLESOFT_API_KEY,
      apiSecret: process.env.EAGLESOFT_API_SECRET,
    },
  },

  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    path: process.env.UPLOAD_PATH || './uploads',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
    prefix: process.env.CACHE_PREFIX || 'dental_erp:',
  },

  // Feature Flags
  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION === 'true',
    enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
    enableTwoFactorAuth: process.env.ENABLE_TWO_FACTOR_AUTH === 'true',
    enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING === 'true',
    mockIntegrations: process.env.MOCK_INTEGRATIONS === 'true',
  },

  // Development
  development: {
    seedDatabase: process.env.SEED_DATABASE === 'true',
    debugMode: process.env.DEBUG_MODE === 'true',
  },
};

// Validation helper functions
export const isValidEnvironment = (): boolean => {
  try {
    validateEnvironment();
    return true;
  } catch {
    return false;
  }
};

export const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
};

export const getOptionalEnvVar = (name: string, defaultValue?: string): string | undefined => {
  return process.env[name] || defaultValue;
};

// Export the validated environment
export { env };
export default config;
