import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../core/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'mongo',
      port: 27017,
      username: 'root',
      password: 'example',
      database: 'pr',
      authSource: 'admin',
      entities: [User],
      synchronize: false,
    }),
  ],
})
export class DatabaseModule {}
