import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(4000),

  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().min(16).required(),

  CLIENT_URL: Joi.string().uri().required(),
  SERVER_URL: Joi.string().uri().optional(),

  // SSLCommerz
  SSLCOMMERZ_STORE_ID: Joi.string().optional(),
  SSLCOMMERZ_STORE_PASSWORD: Joi.string().optional(),
  SSLCOMMERZ_IS_LIVE: Joi.string().valid('true', 'false').optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
});
