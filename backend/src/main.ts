import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json } from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService, ConfigService>(ConfigService);
  app.enableCors({
    origin: '*',
    methods: 'PUT, GET, POST, OPTIONS, PATCH, DELETE',
    credentials: true,
  });
  await app.startAllMicroservices();
  // default of 100kb max body size was to small for some new publications
  // solution from https://github.com/nestjs/nest/issues/529#issuecomment-376576929
  app.use(json({ limit: '1mb' }));
  await app.listen(configService.get('BACKEND_PORT'));
}
bootstrap().then();
