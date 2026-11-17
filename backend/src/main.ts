import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { configureApp } from './app.setup';
import { buildSwaggerConfig } from './swagger.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // HTTPS Configuration (Optional for local dev)
  const httpsOptions = {
    key: fs.existsSync(path.join(process.cwd(), 'secrets/localhost-key.pem'))
      ? fs.readFileSync(path.join(process.cwd(), 'secrets/localhost-key.pem'))
      : null,
    cert: fs.existsSync(path.join(process.cwd(), 'secrets/localhost.pem'))
      ? fs.readFileSync(path.join(process.cwd(), 'secrets/localhost.pem'))
      : null,
  };

  const isHttps = httpsOptions.key && httpsOptions.cert;

  const app = await NestFactory.create(AppModule, {
    httpsOptions: isHttps ? httpsOptions : undefined,
  });

  const expressApp = app.getHttpAdapter().getInstance() as {
    set(setting: string, value: number): void;
  };
  expressApp.set('trust proxy', 1);
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);

  configureApp(app);

  // Swagger Configuration
  const config = buildSwaggerConfig();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/api', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');

  const protocol = isHttps ? 'https' : 'http';
  logger.log(`Application is listening on ${protocol}://0.0.0.0:${port}`);
  if (!isHttps && process.env.NODE_ENV === 'development') {
    logger.warn(
      'HTTPS not enabled. Place localhost.pem and localhost-key.pem in /secrets to enable.',
    );
  }
}
void bootstrap();
