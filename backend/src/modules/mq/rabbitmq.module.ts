import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Global()
@Module({
  providers: [
    {
      provide: 'MESSAGE_QUEUE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${configService.get('RABBITMQ_HOST')}:${configService.get('RABBITMQ_PORT')}`],
            queue: `${configService.get('RABBITMQ_DATA_QUEUE')}`,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['MESSAGE_QUEUE'],
})
export class RabbitMQModule {}
