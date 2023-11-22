import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService, ConfigService>(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${configService.get('RABBITMQ_HOST')}`],
      queue: `${configService.get('RABBITMQ_DATA_QUEUE')}`,
    },
  });
  await app.startAllMicroservices();
  await app.listen(configService.get('BACKEND_PORT'));
}
bootstrap().then();
