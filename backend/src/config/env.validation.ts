import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  DATABASE_URL: string;

  @IsNumber()
  PORT = 3000;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  CORS_ORIGIN = '*';
}

export function validate(config: Record<string, unknown>) {
  if (config.PORT) {
    config.PORT = Number(config.PORT);
  }
  console.log('Validating config. PORT is:', config.PORT, 'typeof PORT:', typeof config.PORT);
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    console.log('Validation errors:', errors);
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
