import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  DIRECT_URL: string;
  JWT_SECRET: string;
  FIRST_ADMIN: string;
  PASS_FIRST_ADMIN: string;
  FRONT_ORIGIN: string;
  NODE_ENV: 'development' | 'production';
}

const envSchema = joi
  .object({
    PORT: joi.number().min(0).max(65535).required().messages({
      'any.required': 'PORT is required',
      'number.base': 'PORT must be a number',
      'number.min': 'PORT must be at least 0',
      'number.max': 'PORT must be at most 65535',
    }),
    DATABASE_URL: joi.string().required().messages({
      'any.required': 'DATABASE_URL is required',
    }),
    DIRECT_URL: joi.string().required().messages({
      'any.required': 'DIRECT_URL is required',
    }),
    JWT_SECRET: joi.string().required().messages({
      'any.required': 'JWT_SECRET is required',
    }),
    FIRST_ADMIN: joi.string().required().messages({
      'any.required': 'FIRST_ADMIN is required',
    }),
    PASS_FIRST_ADMIN: joi.string().required().messages({
      'any.required': 'PASS_FIRST_ADMIN is required',
    }),
    FRONT_ORIGIN: joi.string().required().messages({
      'any.required': 'FRONT_ORIGIN is required',
    }),
    NODE_ENV: joi.string().valid('development', 'production').required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
  directUrl: envVars.DIRECT_URL,
  jwtSecret: envVars.JWT_SECRET,
  firstAdmin: envVars.FIRST_ADMIN,
  passFirstAdmin: envVars.PASS_FIRST_ADMIN,
  origin: envVars.FRONT_ORIGIN,
  NODE_ENV: envVars.NODE_ENV,
};
