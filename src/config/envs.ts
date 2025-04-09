import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  FRONT_ORIGIN: string;
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
    JWT_SECRET: joi.string().required().messages({
      'any.required': 'JWT_SECRET is required',
    }),
    FRONT_ORIGIN: joi.string().required().messages({
      'any.required': 'FRONT_ORIGIN is required',
    }),
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
  jwtSecret: envVars.JWT_SECRET,
  origin: envVars.FRONT_ORIGIN,
};
