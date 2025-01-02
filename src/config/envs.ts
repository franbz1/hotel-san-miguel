import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
}

const envSchema = joi
  .object({
    PORT: joi.number().min(0).max(65535).required().messages({
      'any.required': 'PORT is required',
      'number.base': 'PORT must be a number',
      'number.min': 'PORT must be at least 0',
      'number.max': 'PORT must be at most 65535',
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
};
