import * as Joi from 'joi';

/**
 * Environment variable validation schema using Joi
 * Ensures all required configuration is present and valid
 */
export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().required(),
  BACKEND_URL: Joi.string().required(),

  // Database
  DATABASE_URL: Joi.string().required(),

  // Redis
  REDIS_URL: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // Blockchain
  BLOCKCHAIN_RPC_URL: Joi.string().uri().required(),
  BLOCKCHAIN_NETWORK: Joi.string().required(),
  BLOCKCHAIN_CHAIN_ID: Joi.number().required(),
  BLOCKCHAIN_PRIVATE_KEY: Joi.string().optional(),
  FORWARD_CONTRACT_REGISTRY_ADDRESS: Joi.string().optional(),

  // IPFS
  IPFS_PROVIDER: Joi.string().valid('pinata', 'web3storage', 'local').default('local'),
  IPFS_ENABLED: Joi.boolean().default(true),
  PINATA_API_KEY: Joi.string().optional(),
  PINATA_SECRET_KEY: Joi.string().optional(),
  WEB3_STORAGE_TOKEN: Joi.string().optional(),

  // AI Service
  AI_SERVICE_URL: Joi.string().uri().required(),
  AI_SERVICE_ENABLED: Joi.boolean().default(true),
  OPENAI_API_KEY: Joi.string().optional(),
  OPENAI_ENABLED: Joi.boolean().default(false),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  RATE_LIMIT_ENABLED: Joi.boolean().default(true),

  // CORS
  CORS_ORIGINS: Joi.string().required(),
  CORS_CREDENTIALS: Joi.boolean().default(true),

  // Monitoring
  SENTRY_DSN: Joi.string().optional(),
  SENTRY_ENVIRONMENT: Joi.string().optional(),
  SENTRY_ENABLED: Joi.boolean().default(false),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),

  // Feature Flags
  FEATURE_BLOCKCHAIN_ENABLED: Joi.boolean().default(true),
  FEATURE_AI_PREDICTIONS_ENABLED: Joi.boolean().default(true),
  FEATURE_REALTIME_TRADING: Joi.boolean().default(true),
  FEATURE_PAYMENTS_ENABLED: Joi.boolean().default(false),

  // Trading Engine
  TRADING_ENGINE_MODE: Joi.string().valid('simulated', 'real').default('simulated'),
  ORDER_MATCHING_INTERVAL: Joi.number().default(1000),
});
