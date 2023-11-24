import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'PUT, GET, POST, OPTIONS, PATCH, DELETE',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap().then();
